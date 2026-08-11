import type { MetadataRoute } from "next";

import { prisma } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, regions, posts] = await Promise.all([
    prisma.property.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true, status: true },
    }),
    prisma.region.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/portfoy`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/bolgeler`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/referanslar`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/hakkimda`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/degerleme`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/iletisim`, changeFrequency: "monthly", priority: 0.6 },
    /*
      Hukuki sayfalar. `/telif` özellikle önemli: sitedeki Commons görsellerinin
      bir kısmı CC BY / CC BY-SA lisanslı ve bu lisanslar atfın erişilebilir
      olmasını şart koşuyor — dizine girmeyen bir künye sayfası bu şartı
      zayıflatır. `/karsilastir` ve `/favorilerim` bilinçli olarak yok: içerikleri
      tarayıcıdaki kullanıcı durumundan üretiliyor, herkese aynı görünen bir
      sayfa değiller.
    */
    { url: `${BASE_URL}/kvkk`, changeFrequency: "yearly", priority: 0.2 },
    {
      url: `${BASE_URL}/cerez-politikasi`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    { url: `${BASE_URL}/telif`, changeFrequency: "monthly", priority: 0.2 },
  ];

  return [
    ...staticPages,
    ...properties.map((property) => ({
      url: `${BASE_URL}/portfoy/${property.slug}`,
      lastModified: property.updatedAt,
      changeFrequency: "weekly" as const,
      // Satılan ilanlar arşiv değeri taşır ama önceliği daha düşüktür
      priority: property.status === "ACTIVE" ? 0.8 : 0.4,
    })),
    ...regions.map((region) => ({
      url: `${BASE_URL}/bolgeler/${region.slug}`,
      lastModified: region.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
