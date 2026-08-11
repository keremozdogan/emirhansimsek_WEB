/**
 * Uygulama genelindeki sabit değerler ve Türkçe etiketleri.
 *
 * SQLite enum desteklemediği için bu değerler veritabanında `String` olarak
 * tutulur; doğrulama `lib/validators.ts` içindeki zod şemalarıyla yapılır.
 */

export const LISTING_TYPES = ["SALE", "RENT"] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  SALE: "Satılık",
  RENT: "Kiralık",
};

export const PROPERTY_STATUSES = [
  "ACTIVE",
  "RESERVED",
  "SOLD",
  "RENTED",
] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  ACTIVE: "Yayında",
  RESERVED: "Rezerve",
  SOLD: "Satıldı",
  RENTED: "Kiralandı",
};

export const PROPERTY_CATEGORIES = [
  "APARTMENT",
  "VILLA",
  "OFFICE",
  "SHOP",
  "LAND",
  "BUILDING",
] as const;
export type PropertyCategory = (typeof PROPERTY_CATEGORIES)[number];

export const PROPERTY_CATEGORY_LABELS: Record<PropertyCategory, string> = {
  APARTMENT: "Daire",
  VILLA: "Villa",
  OFFICE: "Ofis",
  SHOP: "İş Yeri",
  LAND: "Arsa",
  BUILDING: "Bina",
};

/**
 * İstanbul'un iki yakası.
 *
 * Bölge rehberleri bu ayrımla gruplanır. Yaka, ilçeden türetilebilecek bir
 * bilgi olmasına rağmen ayrı alan olarak tutuluyor: türetmek 39 ilçelik sabit
 * bir eşleme tablosunu koda gömmek demekti ve panelden yeni bölge eklendiğinde
 * o tablo unutulursa bölge sessizce yanlış yakada görünürdü.
 */
export const CITY_SIDES = ["ANADOLU", "AVRUPA"] as const;
export type CitySide = (typeof CITY_SIDES)[number];

export const CITY_SIDE_LABELS: Record<CitySide, string> = {
  ANADOLU: "Anadolu Yakası",
  AVRUPA: "Avrupa Yakası",
};

/**
 * Hizmet verilen ilçeler — İstanbul'un 39 ilçesinin tamamı, yakalara ayrılmış.
 *
 * Bunlar bölge REHBERİ değildir; yalnızca kapsam listesidir. Rehberler
 * (`Region` kaydı) Emirhan'ın kendi saha yorumunu içerdiği için ancak o
 * yorumu yazdığı ilçeler için açılır. İkisini karıştırmamak önemli: kapsam
 * "buralarda iş yapıyorum", rehber ise "burayı iyi biliyorum" demektir.
 */
export const SERVED_DISTRICTS: Record<CitySide, readonly string[]> = {
  ANADOLU: [
    "Adalar",
    "Ataşehir",
    "Beykoz",
    "Çekmeköy",
    "Kadıköy",
    "Kartal",
    "Maltepe",
    "Pendik",
    "Sancaktepe",
    "Sultanbeyli",
    "Şile",
    "Tuzla",
    "Ümraniye",
    "Üsküdar",
  ],
  AVRUPA: [
    "Arnavutköy",
    "Avcılar",
    "Bağcılar",
    "Bahçelievler",
    "Bakırköy",
    "Başakşehir",
    "Bayrampaşa",
    "Beşiktaş",
    "Beylikdüzü",
    "Beyoğlu",
    "Büyükçekmece",
    "Çatalca",
    "Esenler",
    "Esenyurt",
    "Eyüpsultan",
    "Fatih",
    "Gaziosmanpaşa",
    "Güngören",
    "Kâğıthane",
    "Küçükçekmece",
    "Sarıyer",
    "Silivri",
    "Sultangazi",
    "Şişli",
    "Zeytinburnu",
  ],
};

export const FEATURE_GROUPS = [
  "INTERIOR",
  "EXTERIOR",
  "ENVIRONMENT",
  "TRANSPORT",
] as const;
export type FeatureGroup = (typeof FEATURE_GROUPS)[number];

export const FEATURE_GROUP_LABELS: Record<FeatureGroup, string> = {
  INTERIOR: "İç Özellikler",
  EXTERIOR: "Dış Özellikler",
  ENVIRONMENT: "Çevre",
  TRANSPORT: "Ulaşım",
};

export const LEAD_TYPES = [
  "CONTACT",
  "VALUATION",
  "APPOINTMENT",
  "PROPERTY_INQUIRY",
] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  CONTACT: "İletişim",
  VALUATION: "Değerleme",
  APPOINTMENT: "Randevu",
  PROPERTY_INQUIRY: "İlan Sorusu",
};

export const LEAD_STATUSES = ["NEW", "CONTACTED", "CLOSED"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Yeni",
  CONTACTED: "Arandı",
  CLOSED: "Kapandı",
};

/** Değerleme formundaki "ne yapmak istiyorsunuz" seçenekleri */
export const VALUATION_PURPOSES = ["SELL", "RENT", "LEARN"] as const;
export type ValuationPurpose = (typeof VALUATION_PURPOSES)[number];

export const VALUATION_PURPOSE_LABELS: Record<ValuationPurpose, string> = {
  SELL: "Satmak istiyorum",
  RENT: "Kiraya vermek istiyorum",
  LEARN: "Sadece değerini merak ediyorum",
};

/** İlan formundaki hazır seçenekler */
export const ROOM_OPTIONS = [
  "1+0",
  "1+1",
  "2+1",
  "3+1",
  "4+1",
  "4+2",
  "5+1",
  "5+2",
  "6+ ",
] as const;

export const HEATING_OPTIONS = [
  "Kombi (Doğalgaz)",
  "Merkezi",
  "Merkezi (Pay Ölçer)",
  "Yerden Isıtma",
  "Klima",
  "Soba",
  "Isıtma Yok",
] as const;

export const DEED_STATUS_OPTIONS = [
  "Kat Mülkiyetli",
  "Kat İrtifaklı",
  "Hisseli Tapu",
  "Müstakil Tapulu",
  "Arsa Tapulu",
] as const;

export const BUILDING_AGE_OPTIONS = [
  "0 (Sıfır)",
  "1",
  "2",
  "3",
  "4",
  "5-10",
  "11-15",
  "16-20",
  "21+",
] as const;

export const FACADE_OPTIONS = [
  "Kuzey",
  "Güney",
  "Doğu",
  "Batı",
  "Güneybatı",
  "Güneydoğu",
  "Kuzeybatı",
  "Kuzeydoğu",
] as const;

/** Ev turunda kullanılan yaygın oda adları (admin panelinde öneri olarak sunulur) */
export const ROOM_NAME_SUGGESTIONS = [
  "Giriş",
  "Salon",
  "Oturma Odası",
  "Mutfak",
  "Ebeveyn Yatak Odası",
  "Yatak Odası",
  "Çocuk Odası",
  "Çalışma Odası",
  "Banyo",
  "Ebeveyn Banyosu",
  "Balkon",
  "Teras",
  "Bahçe",
  "Manzara",
  "Bina Girişi",
  "Otopark",
] as const;

/** Kredi hesaplayıcı varsayılanları */
export const MORTGAGE_DEFAULTS = {
  downPaymentRatio: 0.3,
  termMonths: 120,
  annualRatePercent: 3.19 * 12, // aylık %3.19 → yıllık gösterim
  monthlyRatePercent: 3.19,
  termOptions: [12, 24, 36, 48, 60, 72, 84, 96, 108, 120] as const,
};

export const SITE = {
  name: "Emirhan Şimşek",
  shortName: "Emirhan Şimşek Gayrimenkul",
  defaultDescription:
    "RE/MAX EKSEN gayrimenkul danışmanı Emirhan Şimşek. Satılık ve kiralık portföy, bölge rehberleri ve ücretsiz konut değerleme.",
  locale: "tr_TR",
} as const;
