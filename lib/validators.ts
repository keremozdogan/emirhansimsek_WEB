import { z } from "zod";

import {
  CITY_SIDES,
  FEATURE_GROUPS,
  LEAD_STATUSES,
  LEAD_TYPES,
  LISTING_TYPES,
  PROPERTY_CATEGORIES,
  PROPERTY_STATUSES,
} from "@/lib/constants";

/** "0532 123 45 67", "+90 532 123 45 67", "5321234567" — hepsini kabul eder */
const phoneSchema = z
  .string()
  .trim()
  .min(10, "Telefon numarası eksik görünüyor")
  .max(20, "Telefon numarası çok uzun")
  .refine(
    (value) => value.replace(/\D/g, "").replace(/^90/, "").replace(/^0/, "").length === 10,
    "Geçerli bir cep telefonu numarası girin (örn. 0532 123 45 67)",
  );

const optionalEmail = z
  .union([z.literal(""), z.string().trim().email("Geçerli bir e-posta girin")])
  .optional()
  .transform((value) => (value ? value : undefined));

/**
 * KVKK onay kutusu.
 *
 * İşaretlenmemiş bir onay kutusu form verisine hiç eklenmediği için alan
 * `.optional()` olmalı; aksi halde zod "eksik alan" tipi hatası üretir ve
 * kullanıcıya anlamsız bir mesaj gösterilir.
 */
const consentSchema = z
  .union([z.boolean(), z.literal("on"), z.literal("true"), z.literal("false")])
  .optional()
  .transform((value) => value === true || value === "on" || value === "true")
  .refine(
    (value) => value,
    "Devam etmek için aydınlatma metnini onaylamalısınız",
  );

/** Genel iletişim ve ilan sorusu formu */
export const leadSchema = z.object({
  type: z.enum(LEAD_TYPES).default("CONTACT"),
  name: z.string().trim().min(2, "Adınızı yazın").max(80),
  phone: phoneSchema,
  email: optionalEmail,
  message: z
    .string()
    .trim()
    .max(2000, "Mesaj çok uzun")
    .optional()
    .transform((value) => (value ? value : undefined)),
  propertyId: z.string().optional(),
  source: z.string().optional(),
  kvkkConsent: consentSchema,
});

export type LeadInput = z.input<typeof leadSchema>;

/** "Evimin değerini öğren" formu */
export const valuationSchema = leadSchema.omit({ type: true }).extend({
  city: z.string().trim().min(2, "İl bilgisi gerekli"),
  district: z.string().trim().min(2, "İlçe bilgisi gerekli"),
  neighborhood: z.string().trim().optional(),
  category: z.enum(PROPERTY_CATEGORIES),
  rooms: z.string().trim().optional(),
  grossArea: z.coerce
    .number()
    .int()
    .min(10, "Alan çok küçük görünüyor")
    .max(10000, "Alan çok büyük görünüyor"),
  buildingAge: z.string().trim().optional(),
  floor: z.string().trim().optional(),
  /** SELL: satmak istiyor, RENT: kiraya vermek istiyor, LEARN: sadece merak ediyor */
  purpose: z.enum(["SELL", "RENT", "LEARN"]).default("LEARN"),
});

export type ValuationInput = z.input<typeof valuationSchema>;

/* -------------------------------------------------------------------------- */
/* Admin paneli şemaları                                                       */
/* -------------------------------------------------------------------------- */

const optionalInt = z
  .union([z.literal(""), z.coerce.number().int()])
  .optional()
  .transform((value) => (value === "" || value === undefined ? null : Number(value)));

const optionalFloat = z
  .union([z.literal(""), z.coerce.number()])
  .optional()
  .transform((value) => (value === "" || value === undefined ? null : Number(value)));

const optionalText = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  });

/**
 * HTML onay kutuları işaretli değilken form verisine **hiç eklenmez**; bu yüzden
 * alanın kendisi isteğe bağlı olmalı. `.optional()` olmadan zod eksik alanı
 * hata sayar ve işaretlenmemiş her kutu formu geçersiz kılar.
 */
const checkbox = z
  .union([z.boolean(), z.literal("on"), z.literal("true"), z.literal("false")])
  .optional()
  .transform((value) => value === true || value === "on" || value === "true");

export const propertySchema = z.object({
  title: z.string().trim().min(5, "Başlık en az 5 karakter olmalı").max(160),
  slug: optionalText,
  listingType: z.enum(LISTING_TYPES),
  status: z.enum(PROPERTY_STATUSES),
  category: z.enum(PROPERTY_CATEGORIES),
  price: z.coerce.number().int().min(1, "Fiyat girin"),
  currency: z.enum(["TRY", "USD", "EUR"]).default("TRY"),

  grossArea: optionalInt,
  netArea: optionalInt,
  rooms: optionalText,
  bathrooms: optionalInt,
  buildingAge: optionalText,
  floor: optionalText,
  totalFloors: optionalInt,
  heating: optionalText,
  dues: optionalInt,
  deedStatus: optionalText,
  facade: optionalText,

  furnished: checkbox,
  creditEligible: checkbox,
  balcony: checkbox,
  parking: checkbox,
  featured: checkbox,
  published: checkbox,

  city: z.string().trim().min(2, "İl gerekli"),
  district: z.string().trim().min(2, "İlçe gerekli"),
  neighborhood: optionalText,
  lat: optionalFloat,
  lng: optionalFloat,

  summary: z.string().trim().max(300, "Özet en fazla 300 karakter").default(""),
  description: z.string().trim().min(10, "Açıklama yazın"),

  listingNo: optionalText,
  remaxUrl: optionalText,
  videoUrl: optionalText,
  tourUrl: optionalText,

  daysOnMarket: optionalInt,
  closedPricePercent: optionalInt,
  closedAt: optionalText,

  regionId: optionalText,
  seoTitle: optionalText,
  seoDescription: optionalText,

  /** JSON dizisi: [{ label, group }] */
  features: z.string().optional(),
  /** JSON dizisi: [{ id?, url, alt, roomName, caption, blurDataUrl, width, height }] */
  images: z.string().optional(),
});

export const propertyImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().min(1),
  alt: z.string().default(""),
  roomName: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  blurDataUrl: z.string().nullable().optional(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
});

export const propertyFeatureSchema = z.object({
  label: z.string().trim().min(1),
  group: z.enum(FEATURE_GROUPS).default("INTERIOR"),
});

export const regionSchema = z.object({
  name: z.string().trim().min(2, "Bölge adı gerekli"),
  slug: optionalText,
  city: z.string().trim().min(2, "İl gerekli"),
  district: z.string().trim().min(2, "İlçe gerekli"),
  side: z.enum(CITY_SIDES).default("ANADOLU"),
  description: z.string().trim().min(10, "Kısa tanıtım yazın"),
  expertNote: z.string().default(""),
  coverUrl: optionalText,
  avgPricePerSqm: optionalInt,
  avgRent: optionalInt,
  /** Satır satır girilir, JSON diziye çevrilir */
  highlights: z.string().default(""),
  lat: optionalFloat,
  lng: optionalFloat,
  sortOrder: z.coerce.number().int().default(0),
  published: checkbox,
});

export const testimonialSchema = z.object({
  authorName: z.string().trim().min(2, "İsim gerekli"),
  authorTitle: optionalText,
  text: z.string().trim().min(10, "Yorum metni gerekli"),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  propertyId: optionalText,
  published: checkbox,
  sortOrder: z.coerce.number().int().default(0),
});

export const blogPostSchema = z.object({
  title: z.string().trim().min(5, "Başlık gerekli"),
  slug: optionalText,
  excerpt: z.string().trim().min(10, "Özet yazın").max(300),
  contentMarkdown: z.string().trim().min(50, "İçerik çok kısa"),
  coverUrl: optionalText,
  /** Virgülle ayrılmış etiketler */
  tags: z.string().default(""),
  published: checkbox,
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2),
  title: z.string().trim().min(2),
  officeName: z.string().trim().min(2),
  tagline: z.string().trim().min(2),
  shortBio: z.string().trim().min(10),
  bio: z.string().default(""),

  phone: z.string().trim().min(10),
  whatsapp: z.string().trim().min(10),
  email: z.string().trim().email("Geçerli bir e-posta girin"),
  address: z.string().trim().min(5),
  officePhone: optionalText,

  instagramUrl: optionalText,
  linkedinUrl: optionalText,
  youtubeUrl: optionalText,
  facebookUrl: optionalText,
  tiktokUrl: optionalText,
  remaxUrl: optionalText,

  portraitUrl: optionalText,
  coverUrl: optionalText,
  heroVideoUrl: optionalText,
  heroPosterUrl: optionalText,

  licenseNo: optionalText,
  yearsExperience: z.coerce.number().int().min(0).default(0),
  soldCount: z.coerce.number().int().min(0).default(0),
  rentedCount: z.coerce.number().int().min(0).default(0),
  happyClients: z.coerce.number().int().min(0).default(0),
  reviewCount: z.coerce.number().int().min(0).default(0),
  rating: z
    .union([z.literal(""), z.coerce.number().min(0).max(5)])
    .optional()
    .transform((value) =>
      value === "" || value === undefined ? null : Number(value),
    ),
});

export const leadStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(LEAD_STATUSES),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta girin"),
  password: z.string().min(1, "Şifre girin"),
  next: z.string().optional(),
});
