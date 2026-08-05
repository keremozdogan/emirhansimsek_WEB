import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/db";

/**
 * Profil, veritabanı henüz doldurulmamışken bile sitenin ayakta kalması için
 * her zaman bir değer döner. Gerçek bilgiler admin panelinden girilir.
 */
const FALLBACK_PROFILE = {
  id: "singleton",
  fullName: "Emirhan Şimşek",
  title: "Gayrimenkul Danışmanı",
  officeName: "RE/MAX EKSEN",
  tagline: "Doğru ev, doğru zamanda.",
  shortBio:
    "RE/MAX EKSEN çatısı altında konut ve yatırım danışmanlığı yapıyorum.",
  bio: "",
  phone: "0500 000 00 00",
  whatsapp: "0500 000 00 00",
  email: "info@example.com",
  address: "RE/MAX Eksen Ofisi",
  officePhone: null as string | null,
  instagramUrl: null,
  linkedinUrl: null,
  youtubeUrl: null,
  facebookUrl: null,
  tiktokUrl: null,
  remaxUrl: null,
  portraitUrl: null,
  coverUrl: null,
  heroVideoUrl: null,
  heroPosterUrl: null,
  licenseNo: null,
  yearsExperience: 0,
  soldCount: 0,
  rentedCount: 0,
  happyClients: 0,
  reviewCount: 0,
  rating: null as number | null,
  updatedAt: new Date(),
};

export type SiteProfile = typeof FALLBACK_PROFILE;

export const getProfile = cache(async (): Promise<SiteProfile> => {
  try {
    const profile = await prisma.profile.findFirst();
    return (profile as SiteProfile | null) ?? FALLBACK_PROFILE;
  } catch {
    // Veritabanı henüz oluşturulmadıysa site yine de açılsın
    return FALLBACK_PROFILE;
  }
});

/** Görsel ve bölge bilgisiyle birlikte ilan seçimi — kartlarda kullanılır */
export const propertyCardSelect = {
  id: true,
  slug: true,
  title: true,
  listingType: true,
  status: true,
  category: true,
  price: true,
  currency: true,
  grossArea: true,
  netArea: true,
  rooms: true,
  city: true,
  district: true,
  neighborhood: true,
  summary: true,
  featured: true,
  closedAt: true,
  daysOnMarket: true,
  closedPricePercent: true,
  images: {
    orderBy: { sortOrder: "asc" },
    take: 1,
    select: { url: true, alt: true, blurDataUrl: true },
  },
  region: { select: { name: true, slug: true } },
} as const;

export const getFeaturedProperties = cache(async (limit = 6) => {
  return prisma.property.findMany({
    where: { published: true, status: { in: ["ACTIVE", "RESERVED"] } },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: limit,
    select: propertyCardSelect,
  });
});

export const getClosedProperties = cache(async (limit = 12) => {
  return prisma.property.findMany({
    where: { published: true, status: { in: ["SOLD", "RENTED"] } },
    orderBy: { closedAt: "desc" },
    take: limit,
    select: propertyCardSelect,
  });
});

export const getRegions = cache(async () => {
  return prisma.region.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: {
          properties: {
            where: { published: true, status: { in: ["ACTIVE", "RESERVED"] } },
          },
        },
      },
    },
  });
});

export const getTestimonials = cache(async (limit = 8) => {
  return prisma.testimonial.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { date: "desc" }],
    take: limit,
    include: { property: { select: { slug: true, title: true } } },
  });
});

export const getPublishedPosts = cache(async (limit?: number) => {
  return prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
});

export const getMilestones = cache(async () => {
  return prisma.milestone.findMany({ orderBy: { sortOrder: "asc" } });
});

export const getCertificates = cache(async () => {
  return prisma.certificate.findMany({ orderBy: { sortOrder: "asc" } });
});

/**
 * Ana sayfadaki rakamlar.
 *
 * Profilde girilmemiş (0) değerler veritabanından hesaplanır; hesaplanamayanlar
 * 0 kalır ve arayüzde hiç gösterilmez — doğrulanmamış rakam yayınlanmaz.
 */
export const getSiteStats = cache(async () => {
  const profile = await getProfile();
  const [soldCount, rentedCount, activeCount, regionCount] = await Promise.all([
    prisma.property.count({ where: { status: "SOLD" } }),
    prisma.property.count({ where: { status: "RENTED" } }),
    prisma.property.count({
      where: { published: true, status: { in: ["ACTIVE", "RESERVED"] } },
    }),
    prisma.region.count({ where: { published: true } }),
  ]);

  return {
    sold: profile.soldCount || soldCount,
    rented: profile.rentedCount || rentedCount,
    active: activeCount,
    regions: regionCount,
    years: profile.yearsExperience,
    happyClients: profile.happyClients,
    reviewCount: profile.reviewCount,
    rating: profile.rating,
  };
});
