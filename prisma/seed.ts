/**
 * İçeriği veritabanına yükler.
 *
 *   npm run db:seed           → mevcut içeriği temizler ve yeniden yükler
 *   npm run db:seed -- --keep → yalnızca admin kullanıcısını oluşturur/günceller
 *
 * Veri kaynağı: `prisma/seed-data.ts` (RE/MAX profilinden alınan gerçek bilgiler)
 * Fotoğraflar : `prisma/photos.json` + `public/uploads/ilan/<ilan-kodu>/`
 */

// tsx betikleri .env dosyasını kendiliğinden okumaz
import "dotenv/config";

import bcrypt from "bcryptjs";

import { prisma } from "../lib/db";
import photos from "./photos.json";
import {
  BLOG_POSTS,
  CERTIFICATES,
  MILESTONES,
  PROFILE,
  PROPERTIES,
  REGIONS,
  TESTIMONIALS,
} from "./seed-data";

const keepContent = process.argv.includes("--keep");

type Photo = { url: string; width: number; height: number; blurDataUrl: string };

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@example.com")
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "degistir123";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, name: PROFILE.fullName },
    create: { email, passwordHash, name: PROFILE.fullName },
  });

  console.log(`✓ Admin kullanıcısı hazır: ${email}`);
}

async function clearContent() {
  // Sıralama önemli: alt kayıtlar önce silinir
  await prisma.lead.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.propertyFeature.deleteMany();
  await prisma.property.deleteMany();
  await prisma.region.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.profile.deleteMany();
  console.log("✓ Mevcut içerik temizlendi");
}

/**
 * Ev turu sırasını uygular: `tour` dizisinde belirtilen fotoğraflar verilen
 * sırayla başa alınır, kalan fotoğraflar oda adı olmadan sona eklenir.
 */
function buildImages(code: keyof typeof photos, tour: (typeof PROPERTIES)[number]["tour"]) {
  const all = photos[code] as Photo[];
  const used = new Set<number>();
  const ordered: Array<Photo & { roomName: string | null; caption: string | null; alt: string }> = [];

  for (const entry of tour) {
    const photo = all[entry.index - 1];
    if (!photo) {
      console.warn(`  ! ${code}: ${entry.index}. fotoğraf bulunamadı, atlandı`);
      continue;
    }
    used.add(entry.index - 1);
    ordered.push({
      ...photo,
      roomName: entry.roomName,
      caption: entry.caption,
      alt: entry.roomName,
    });
  }

  all.forEach((photo, index) => {
    if (used.has(index)) return;
    ordered.push({ ...photo, roomName: null, caption: null, alt: "" });
  });

  return ordered;
}

async function seedContent() {
  // --- Profil ---
  const { officePhone, reviewCount, rating, ...profileRest } = PROFILE;
  await prisma.profile.create({
    data: { ...profileRest, id: "singleton", officePhone, reviewCount, rating },
  });
  console.log("✓ Profil oluşturuldu");

  // --- Zaman çizelgesi ve sertifikalar ---
  if (MILESTONES.length) await prisma.milestone.createMany({ data: MILESTONES });
  if (CERTIFICATES.length)
    await prisma.certificate.createMany({ data: CERTIFICATES });
  console.log(
    `✓ ${MILESTONES.length} kilometre taşı, ${CERTIFICATES.length} sertifika`,
  );

  // --- Bölgeler ---
  const regionIdBySlug = new Map<string, string>();
  for (const region of REGIONS) {
    const { highlights, ...rest } = region;
    const created = await prisma.region.create({
      data: { ...rest, highlights: JSON.stringify(highlights) },
    });
    regionIdBySlug.set(region.slug, created.id);
  }
  console.log(`✓ ${REGIONS.length} bölge oluşturuldu`);

  // --- İlanlar ---
  let photoTotal = 0;
  for (const [index, property] of PROPERTIES.entries()) {
    const { code, tour, features, regionSlug, ...rest } = property;
    const images = buildImages(code, tour);
    photoTotal += images.length;

    await prisma.property.create({
      data: {
        ...rest,
        regionId: regionSlug ? regionIdBySlug.get(regionSlug) : undefined,
        publishedAt: daysAgo(7 + index * 5),
        seoTitle: rest.title,
        seoDescription: rest.summary,
        images: {
          create: images.map((image, order) => ({
            url: image.url,
            alt: image.alt,
            roomName: image.roomName,
            caption: image.caption,
            blurDataUrl: image.blurDataUrl,
            width: image.width,
            height: image.height,
            sortOrder: order,
            isCover: order === 0,
          })),
        },
        features: { create: features },
      },
    });
  }
  console.log(`✓ ${PROPERTIES.length} ilan, ${photoTotal} fotoğraf`);

  // --- Referanslar (şu an boş — uydurma yorum eklenmedi) ---
  if (TESTIMONIALS.length > 0) {
    for (const [index, testimonial] of TESTIMONIALS.entries()) {
      const { propertySlug, ...restTestimonial } = testimonial;
      const property = propertySlug
        ? await prisma.property.findUnique({ where: { slug: propertySlug } })
        : null;
      await prisma.testimonial.create({
        data: {
          ...restTestimonial,
          propertyId: property?.id,
          date: daysAgo(20 + index * 15),
        },
      });
    }
    console.log(`✓ ${TESTIMONIALS.length} müşteri yorumu`);
  } else {
    console.log("· Müşteri yorumu eklenmedi (uydurma yorum yazılmadı)");
  }

  // --- Blog yazıları ---
  for (const [index, post] of BLOG_POSTS.entries()) {
    const { content, tags, ...rest } = post;
    const words = content.trim().split(/\s+/).length;
    await prisma.blogPost.create({
      data: {
        ...rest,
        contentMarkdown: content,
        tags: JSON.stringify(tags),
        readingMinutes: Math.max(1, Math.round(words / 200)),
        publishedAt: daysAgo(10 + index * 14),
      },
    });
  }
  console.log(`✓ ${BLOG_POSTS.length} blog yazısı`);
}

async function main() {
  await seedAdmin();

  if (keepContent) {
    console.log("→ --keep verildi, içerik değiştirilmedi.");
    return;
  }

  await clearContent();
  await seedContent();
  console.log("\nİçerik yüklendi. http://localhost:3000 adresini açabilirsiniz.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
