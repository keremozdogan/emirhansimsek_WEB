/**
 * İçeriği `prisma/seed-data.ts` ile eşitler.
 *
 *   npm run db:sync
 *
 * NEDEN VAR?
 *
 * `dev.db` depoya girmiyor (içinde gerçek talepler ve admin şifresi var, ayrıca
 * ikili dosya olduğu için birleştirilemiyor). Dolayısıyla seed dosyasına yazılan
 * bir değişiklik kimsenin veritabanına kendiliğinden geçmiyor: `git pull`
 * yaptıktan sonra kodda yeni metin duruyor ama sitede eskisi görünüyor.
 *
 * `npm run db:seed` bunu çözerdi ama YIKICI: `lead.deleteMany()` çağırıp
 * siteden gelen gerçek talepleri siliyor. Bu betik hiçbir şey silmiyor.
 *
 * DAVRANIŞ
 *
 * - Talepler (Lead) hiç okunmuyor bile.
 * - Slug'ı olan kayıtlar (bölge, ilan, rehber yazısı) slug'a göre güncelleniyor,
 *   yoksa ekleniyor.
 * - Seed'de OLMAYAN kayıtlara dokunulmuyor. Panelden eklenmiş bir ilan ya da
 *   yazı silinmez; yalnızca seed'in sahibi olduğu kayıtlar tazelenir.
 * - Zaman çizelgesi ve sertifikalar panelden düzenlenemediği için (koda ait,
 *   benzersiz anahtarları da yok) tümüyle yenileniyor.
 * - Müşteri yorumları panelden giriliyor ve seed'de yok; bu yüzden hiç
 *   dokunulmuyor.
 *
 * DİKKAT: Panelden bir ilanın açıklamasını değiştirdiyseniz ve o ilan seed'de
 * de varsa, bu betik seed'deki hâline geri döndürür. Geliştirme aşamasında
 * doğru davranış budur; yayına çıkıldığında içeriğin sahibi panel olur ve bu
 * betik yalnızca sıfırdan kurulumda kullanılır.
 */

import "dotenv/config";

import { prisma } from "../lib/db";
import photos from "../prisma/photos.json";
import {
  BLOG_POSTS,
  CERTIFICATES,
  MILESTONES,
  PROFILE,
  PROPERTIES,
  REGIONS,
} from "../prisma/seed-data";

type Photo = { url: string; width: number; height: number; blurDataUrl: string };

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/** Ortalama okuma hızı ~200 kelime/dk; en az 1 dakika gösterilir. */
function readingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Ev turu sırasını uygular: `tour` dizisindeki fotoğraflar verilen sırayla başa
 * alınır, kalanlar oda adı olmadan sona eklenir. (seed.ts ile aynı mantık.)
 */
function buildImages(
  code: keyof typeof photos,
  tour: (typeof PROPERTIES)[number]["tour"],
) {
  const all = photos[code] as Photo[];
  const used = new Set<number>();
  const ordered: Array<
    Photo & { roomName: string | null; caption: string | null; alt: string }
  > = [];

  for (const entry of tour) {
    const photo = all[entry.index - 1];
    if (!photo) continue;
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

async function syncProfile() {
  const { officePhone, reviewCount, rating, ...rest } = PROFILE;
  const data = { ...rest, officePhone, reviewCount, rating };

  await prisma.profile.upsert({
    where: { id: "singleton" },
    update: data,
    create: { ...data, id: "singleton" },
  });
  console.log("✓ Profil güncellendi");
}

async function syncTimeline() {
  // Panelden düzenlenemiyor ve benzersiz anahtarları yok — tümüyle yenilenir
  await prisma.milestone.deleteMany();
  if (MILESTONES.length) await prisma.milestone.createMany({ data: MILESTONES });

  await prisma.certificate.deleteMany();
  if (CERTIFICATES.length)
    await prisma.certificate.createMany({ data: CERTIFICATES });

  console.log(
    `✓ ${MILESTONES.length} kilometre taşı, ${CERTIFICATES.length} sertifika`,
  );
}

async function syncRegions() {
  let added = 0;
  for (const region of REGIONS) {
    const { highlights, ...rest } = region;
    const data = { ...rest, highlights: JSON.stringify(highlights) };

    const existing = await prisma.region.findUnique({
      where: { slug: region.slug },
    });
    if (!existing) added += 1;

    await prisma.region.upsert({
      where: { slug: region.slug },
      update: data,
      create: data,
    });
  }
  console.log(
    `✓ ${REGIONS.length} bölge (${added} yeni, ${REGIONS.length - added} güncellendi)`,
  );
}

async function syncProperties() {
  const regionIdBySlug = new Map<string, string>();
  for (const region of await prisma.region.findMany({
    select: { id: true, slug: true },
  })) {
    regionIdBySlug.set(region.slug, region.id);
  }

  let added = 0;
  let photoTotal = 0;

  for (const [index, property] of PROPERTIES.entries()) {
    const { code, tour, features, regionSlug, ...rest } = property;
    const images = buildImages(code, tour);
    photoTotal += images.length;

    const data = {
      ...rest,
      regionId: regionSlug ? regionIdBySlug.get(regionSlug) : undefined,
      seoTitle: rest.title,
      seoDescription: rest.summary,
    };

    const existing = await prisma.property.findUnique({
      where: { slug: property.slug },
      select: { id: true },
    });

    if (existing) {
      /**
       * Alt kayıtlar (fotoğraf, özellik) yerinde güncellenmiyor, silinip
       * yeniden yazılıyor. Sıralama ve kapak seçimi indekse bağlı olduğu için
       * kısmi güncelleme kolayca tutarsız bir duruma düşüyor; tam değişim
       * hem daha basit hem de sonucu öngörülebilir.
       */
      await prisma.propertyImage.deleteMany({ where: { propertyId: existing.id } });
      await prisma.propertyFeature.deleteMany({
        where: { propertyId: existing.id },
      });
      await prisma.property.update({
        where: { id: existing.id },
        data: {
          ...data,
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
    } else {
      added += 1;
      await prisma.property.create({
        data: {
          ...data,
          // publishedAt yalnızca ilk oluşturmada yazılır; mevcut ilanın
          // yayın tarihi her eşitlemede kaymasın.
          publishedAt: daysAgo(7 + index * 5),
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
  }

  console.log(
    `✓ ${PROPERTIES.length} ilan, ${photoTotal} fotoğraf (${added} yeni)`,
  );
}

async function syncBlog() {
  let added = 0;
  for (const [index, post] of BLOG_POSTS.entries()) {
    const { content, tags, ...rest } = post;
    const data = {
      ...rest,
      contentMarkdown: content,
      tags: JSON.stringify(tags),
      readingMinutes: readingMinutes(content),
    };

    const existing = await prisma.blogPost.findUnique({
      where: { slug: post.slug },
      select: { id: true },
    });
    if (!existing) added += 1;

    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: data,
      // publishedAt yalnızca yeni yazıda belirlenir; mevcut yazının tarihi
      // her eşitlemede değişmesin.
      create: { ...data, publishedAt: daysAgo(10 + index * 14) },
    });
  }
  console.log(
    `✓ ${BLOG_POSTS.length} rehber yazısı (${added} yeni, ${BLOG_POSTS.length - added} güncellendi)`,
  );
}

async function main() {
  console.log("İçerik eşitleniyor (talepler korunuyor)\n");

  const leadsBefore = await prisma.lead.count();

  await syncProfile();
  await syncTimeline();
  await syncRegions();
  await syncProperties();
  await syncBlog();

  const leadsAfter = await prisma.lead.count();
  if (leadsBefore !== leadsAfter) {
    // Olmaması gereken bir durum; sessizce geçilmemeli
    throw new Error(
      `Talep sayısı değişti (${leadsBefore} → ${leadsAfter}). Bu bir hata.`,
    );
  }

  console.log(`\n✓ Tamamlandı. ${leadsAfter} talep kaydına dokunulmadı.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
