/**
 * Rehber yazılarını `prisma/seed-data.ts` içindeki BLOG_POSTS ile eşitler.
 *
 *   npx tsx scripts/sync-blog.mts
 *
 * NEDEN AYRI BİR BETİK?
 *
 * `npm run db:seed` yıkıcıdır: `lead.deleteMany()` çağırır, yani siteden gelen
 * gerçek talepleri siler. Yalnızca rehber içeriğini güncellemek için tüm
 * veritabanını yeniden kurmak gerekmiyor. Bu betik sadece BlogPost tablosuna
 * dokunur; slug'a göre varsa günceller, yoksa ekler. Hiçbir kaydı silmez —
 * seed-data'dan çıkarılan bir yazı veritabanında kalır, yayından kaldırmak
 * panelden yapılır.
 */

import "dotenv/config";

import { prisma } from "../lib/db";
import { BLOG_POSTS } from "../prisma/seed-data";

/** Ortalama okuma hızı ~200 kelime/dk; en az 1 dakika gösterilir. */
function readingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

let created = 0;
let updated = 0;

for (const post of BLOG_POSTS) {
  const existing = await prisma.blogPost.findUnique({
    where: { slug: post.slug },
    select: { id: true, publishedAt: true },
  });

  const data = {
    title: post.title,
    excerpt: post.excerpt,
    contentMarkdown: post.content,
    coverUrl: post.coverUrl,
    tags: JSON.stringify(post.tags),
    readingMinutes: readingMinutes(post.content),
    published: post.published,
  };

  if (existing) {
    await prisma.blogPost.update({ where: { slug: post.slug }, data });
    updated += 1;
  } else {
    await prisma.blogPost.create({
      data: { ...data, slug: post.slug, publishedAt: new Date() },
    });
    created += 1;
  }
}

console.log(`✓ ${created} yazı eklendi, ${updated} yazı güncellendi.`);

const all = await prisma.blogPost.findMany({
  orderBy: { publishedAt: "desc" },
  select: { slug: true, coverUrl: true, readingMinutes: true, published: true },
});

for (const post of all) {
  const flag = post.published ? " " : "✗";
  console.log(
    `  ${flag} ${post.slug.padEnd(38)} ${String(post.readingMinutes).padStart(2)} dk  ${post.coverUrl ?? "(kapak yok)"}`,
  );
}

await prisma.$disconnect();
