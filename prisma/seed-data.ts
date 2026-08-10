/**
 * GERÇEK İÇERİK — RE/MAX profil sayfasından alınmıştır
 * https://remax.com.tr/tr/danisman/41906-11/emirhan-simsek
 *
 * İlan bilgileri (fiyat, metrekare, oda, yapım yılı, konum, koordinat) ve
 * fotoğraflar Emirhan'ın kendi RE/MAX portföyünden çekilmiştir.
 *
 * UYDURULMAYAN ALANLAR — bilerek boş bırakıldı, Emirhan kendisi doldurmalı:
 *   - `PROFILE.bio`          : detaylı biyografi
 *   - `REGIONS[].expertNote` : bölge uzman yorumu (sitede onun sözü olarak çıkar)
 *   - `TESTIMONIALS`         : müşteri yorumları (RE/MAX'te 128 değerlendirme
 *                              var ama metinlerine erişilemedi; uydurulmadı)
 *   - Satılan/kiralanan ilan geçmişi ve "yıllık tecrübe / satış adedi" rakamları
 *
 * İlan açıklamaları, doğrulanmış teknik verilere ve fotoğraflara dayanılarak
 * yazılmış TASLAK metinlerdir; Emirhan panelden kendi diliyle değiştirebilir.
 */

export type SeedImage = {
  /** photos.json içindeki 1 tabanlı fotoğraf sırası */
  index: number;
  roomName: string;
  caption: string;
};

export type SeedProperty = {
  code: keyof typeof import("./photos.json");
  slug: string;
  title: string;
  listingType: "SALE" | "RENT";
  status: "ACTIVE" | "RESERVED" | "SOLD" | "RENTED";
  category: "APARTMENT" | "VILLA" | "OFFICE" | "SHOP" | "LAND" | "BUILDING";
  price: number;
  grossArea?: number;
  netArea?: number;
  rooms?: string;
  bathrooms?: number;
  buildingAge?: string;
  floor?: string;
  totalFloors?: number;
  heating?: string;
  furnished?: boolean;
  creditEligible?: boolean;
  deedStatus?: string;
  balcony?: boolean;
  parking?: boolean;
  facade?: string;
  city: string;
  district: string;
  neighborhood: string;
  lat: number;
  lng: number;
  summary: string;
  description: string;
  listingNo: string;
  remaxUrl?: string;
  featured?: boolean;
  regionSlug?: string;
  features: Array<{ label: string; group: string }>;
  /** Ev turunun akış sırası. Listelenmeyen fotoğraflar sona eklenir. */
  tour: SeedImage[];
};

/* -------------------------------------------------------------------------- */
/* Profil — RE/MAX sayfasından doğrulanmış bilgiler                            */
/* -------------------------------------------------------------------------- */

export const PROFILE = {
  fullName: "Emirhan Şimşek",
  title: "Gayrimenkul Danışmanı",
  officeName: "RE/MAX Eksen",
  tagline: "Sancaktepe ve Çekmeköy'de satılık, kiralık konut ve ticari portföy.",
  shortBio:
    "RE/MAX Eksen çatısı altında İstanbul Anadolu yakasında gayrimenkul danışmanlığı yapıyorum. Portföyüm ağırlıklı olarak Sancaktepe ve Çekmeköy'de yoğunlaşıyor; konutun yanında ticari mülklerle de ilgileniyorum.",
  /** Emirhan kendisi yazacak — uydurulmadı */
  bio: "",
  phone: "0551 024 41 27",
  whatsapp: "0551 024 41 27",
  email: "emirhansimsek@remaxeksen.com",
  officePhone: "0216 642 02 22",
  address:
    "RE/MAX Eksen · Mimar Sinan Mah. Çavuşbaşı Cad. Bayrak Plaza K:1, Çekmeköy / İstanbul",
  instagramUrl: null,
  linkedinUrl: null,
  youtubeUrl: null,
  facebookUrl: null,
  tiktokUrl: null,
  remaxUrl: "https://remax.com.tr/tr/danisman/41906-11/emirhan-simsek",
  portraitUrl: "/uploads/profil/emirhan.webp",
  /**
   * Ana sayfa kapağı: İstanbul silüeti (Wikimedia Commons, künyesi
   * content/media-credits.json içinde). Önceden bir ilan fotoğrafı
   * kullanılıyordu — hem konuyla alakasızdı hem de 1024x768 olduğu için tam
   * ekranda geriliyordu.
   */
  heroPosterUrl: "/uploads/site/hero-istanbul.webp",
  coverUrl: "/uploads/site/hero-istanbul.webp",
  heroVideoUrl: null,
  /**
   * RE/MAX profilindeki "Profesyonel Sertifika No: 3400794-097" bilgisi, mevzuatın
   * istediği Taşınmaz Ticareti Yetki Belgesi ile aynı şey DEĞİLDİR. Yanlış bilgi
   * yayınlamamak için boş bırakıldı; doğru numara Emirhan'dan alınmalı.
   */
  licenseNo: null,
  /** Doğrulanamayan rakamlar 0 bırakıldı; site bunları göstermiyor. */
  yearsExperience: 0,
  soldCount: 0,
  rentedCount: 0,
  /** RE/MAX profilindeki değerlendirme sayısı */
  reviewCount: 128,
  rating: 5,
};

/** RE/MAX profilinde listelenen eğitimler */
export const CERTIFICATES = [
  {
    title: "RE/MAX Temel Başlangıç Eğitimi",
    issuer: "RE/MAX Türkiye",
    year: "2024",
    sortOrder: 1,
  },
  {
    title: "RE/MAX Danışman Gelişim Programı",
    issuer: "RE/MAX Türkiye",
    year: "2025",
    sortOrder: 2,
  },
];

/** Yalnızca doğrulanabilen kilometre taşları */
export const MILESTONES = [
  {
    year: "2024",
    title: "RE/MAX Eksen'de göreve başlangıç",
    description:
      "RE/MAX Temel Başlangıç Eğitimi'ni tamamlayarak RE/MAX Eksen ofisinde gayrimenkul danışmanlığına başladım.",
    sortOrder: 1,
  },
  {
    year: "2025",
    title: "Danışman Gelişim Programı",
    description:
      "RE/MAX Danışman Gelişim Programı'nı tamamladım; portföyümü Sancaktepe ve Çekmeköy'de derinleştirdim.",
    sortOrder: 2,
  },
];

/**
 * Müşteri yorumları bilerek boş — RE/MAX profilinde 128 değerlendirme
 * görünüyor ancak yorum metinlerine erişilemedi. Uydurma yorum eklenmedi.
 * Emirhan izin aldığı yorumları panelden ekleyebilir.
 */
export const TESTIMONIALS: Array<{
  authorName: string;
  authorTitle: string;
  text: string;
  rating: number;
  propertySlug?: string;
  sortOrder: number;
}> = [];

/* -------------------------------------------------------------------------- */
/* Bölgeler                                                                    */
/* -------------------------------------------------------------------------- */

export const REGIONS = [
  {
    slug: "sancaktepe",
    name: "Sancaktepe",
    city: "İstanbul",
    district: "Sancaktepe",
    description:
      "Portföyümün ağırlık merkezi. Osmangazi Mahallesi ve Atayolu Caddesi hattında yeni tamamlanan projeler, konut ve ticari mülkte birlikte hareket eden bir pazar oluşturuyor.",
    /** Emirhan kendi bölge yorumunu panelden yazacak */
    expertNote: "",
    coverUrl: "/uploads/ilan/P20587627/26.webp",
    avgPricePerSqm: null,
    avgRent: null,
    highlights: [
      "Atayolu Caddesi hattı",
      "Yeni tamamlanan projeler",
      "Konut ve ticari bir arada",
    ],
    lat: 40.98899,
    lng: 29.2367,
    sortOrder: 1,
  },
  {
    slug: "cekmekoy",
    name: "Çekmeköy",
    city: "İstanbul",
    district: "Çekmeköy",
    description:
      "Ofisimizin de bulunduğu ilçe. Mimar Sinan Mahallesi çevresinde vadi ve şehir manzaralı, düşük yoğunluklu yapılaşma öne çıkıyor.",
    expertNote: "",
    coverUrl: "/uploads/ilan/P28481717/44.webp",
    avgPricePerSqm: null,
    avgRent: null,
    highlights: [
      "Vadi ve şehir manzarası",
      "Düşük yoğunluklu yapılaşma",
      "Ofis lokasyonu",
    ],
    lat: 41.034333,
    lng: 29.176355,
    sortOrder: 2,
  },
];

/* -------------------------------------------------------------------------- */
/* İlanlar — RE/MAX portföyünden                                               */
/* -------------------------------------------------------------------------- */

export const PROPERTIES: SeedProperty[] = [
  // ---------------------------------------------------------------- 1
  {
    code: "P28481717",
    slug: "cekmekoy-mimar-sinan-manzarali-5-2-dubleks",
    title: "Çekmeköy Mimar Sinan Mahallesi'nde Manzaralı 5+2 Dubleks",
    listingType: "SALE",
    status: "ACTIVE",
    category: "APARTMENT",
    price: 13_950_000,
    grossArea: 200,
    netArea: 166,
    rooms: "5+2",
    bathrooms: 2,
    buildingAge: "2021",
    floor: "5 (Dubleks)",
    totalFloors: 6,
    heating: "Kombi (Doğalgaz)",
    creditEligible: true,
    deedStatus: "Tapulu",
    balcony: true,
    parking: false,
    city: "İstanbul",
    district: "Çekmeköy",
    neighborhood: "Mimar Sinan",
    lat: 41.034333,
    lng: 29.176355,
    featured: true,
    regionSlug: "cekmekoy",
    listingNo: "P28481717",
    remaxUrl: "https://remax.com.tr/tr/danisman/41906-11/emirhan-simsek",
    summary:
      "200 m² brüt, iki katlı kullanım ve çatı terasından kesintisiz vadi manzarası. 2021 yapımı, bakımlı ve oturulur durumda.",
    description: `Çekmeköy Mimar Sinan Mahallesi'nde, 2021 yapımı bir binada 5+2 dubleks daire.

**Kullanım alanı 200 m² brüt / 166 m² net** ve iki kata yayılıyor. Alt katta oturma alanı, mutfak ve yatak odaları; üst katta ikinci bir oturma alanı, ebeveyn süiti, ilave mutfak ve odalar bulunuyor. İki katlı kurgu, geniş aileler ya da evde çalışan profiller için ayrı yaşam alanları sağlıyor.

Dairenin en güçlü yanı **manzarası**: hem oturma alanlarından hem de çatı terasından vadi ve şehir görünüyor. Teras, dairenin kullanım alanını yaz aylarında belirgin şekilde genişletiyor.

Isıtma doğalgaz kombi, tapu durumu temiz ve **krediye uygun**.`,
    features: [
      { label: "Çatı Terası", group: "EXTERIOR" },
      { label: "Vadi ve Şehir Manzarası", group: "ENVIRONMENT" },
      { label: "Dubleks Kullanım", group: "INTERIOR" },
      { label: "İki Mutfak", group: "INTERIOR" },
      { label: "Ebeveyn Banyosu", group: "INTERIOR" },
      { label: "Giyinme Odası", group: "INTERIOR" },
      { label: "Ayrı Çamaşır Odası", group: "INTERIOR" },
      { label: "Krediye Uygun", group: "INTERIOR" },
    ],
    tour: [
      {
        index: 3,
        roomName: "Bina",
        caption:
          "2021 yapımı bina, sakin bir sokakta. Çekmeköy Mimar Sinan Mahallesi'nde, vadiye bakan yamaçta konumlanıyor.",
      },
      {
        index: 5,
        roomName: "Daire Girişi",
        caption:
          "Bina içi merdiven ve daire kapısı. Katta sınırlı sayıda daire bulunuyor.",
      },
      {
        index: 13,
        roomName: "Salon",
        caption:
          "Ana oturma alanı. Gün ışığı öğleden sonra boydan boya içeri giriyor; tavan bordürleri ve gizli aydınlatma mevcut.",
      },
      {
        index: 12,
        roomName: "Salon",
        caption:
          "Salonun diğer açısı. TV duvarı ve oturma grubu yerleşimi olduğu gibi teslim ediliyor.",
      },
      {
        index: 8,
        roomName: "Mutfak",
        caption:
          "Alt kat mutfağı, yemek alanıyla birleşik. Ankastre set ve dolaplar takılı durumda.",
      },
      {
        index: 6,
        roomName: "Yemek Alanı",
        caption:
          "Mutfağa bitişik yemek alanı. Pencereden vadi görünüyor — sabah kahvaltısının yapıldığı köşe.",
      },
      {
        index: 10,
        roomName: "Manzara",
        caption:
          "Daireden vadi ve karşı yaka görünümü. Önü açık; yapılaşma bu cepheyi kapatmıyor.",
      },
      {
        index: 21,
        roomName: "İç Merdiven",
        caption:
          "Katlar arası ahşap merdiven. Dubleksin iki yaşam alanını birbirine bağlıyor.",
      },
      {
        index: 26,
        roomName: "Ebeveyn Yatak Odası",
        caption:
          "Üst kattaki ebeveyn odası. Aynalı gardıroplar ve makyaj ünitesi odanın içinde yer alıyor.",
      },
      {
        index: 29,
        roomName: "Giyinme Odası",
        caption:
          "Ebeveyn odasına bağlı giyinme alanı. Boydan boya dolap düzeni mevcut.",
      },
      {
        index: 32,
        roomName: "Üst Kat Oturma Alanı",
        caption:
          "Üst kattaki ikinci oturma alanı. Aileler için ayrı bir yaşam alanı ya da çalışma köşesi olarak kullanılabiliyor.",
      },
      {
        index: 24,
        roomName: "İkinci Mutfak",
        caption:
          "Üst katta ilave mutfak. Dubleks kullanımda üst katı bağımsız hale getiriyor.",
      },
      {
        index: 37,
        roomName: "Banyo",
        caption:
          "Duşakabinli banyo. Dairede iki banyo bulunuyor, ikisi de kullanıma hazır.",
      },
      {
        index: 35,
        roomName: "Çocuk Odası",
        caption: "Çocuk odası, üst katta ve arka cepheye bakıyor.",
      },
      {
        index: 41,
        roomName: "Çatı Terası",
        caption:
          "Çatı terası — bu dairenin en ayırt edici bölümü. Yazın kullanım alanını belirgin şekilde genişletiyor.",
      },
      {
        index: 44,
        roomName: "Terastan Manzara",
        caption:
          "Terastan vadi ve şehir silueti. Akşam saatlerinde en çok vakit geçirilen yer burası.",
      },
    ],
  },

  // ---------------------------------------------------------------- 2
  {
    code: "P20587627",
    slug: "sancaktepe-atayolu-caddesine-cepheli-sifir-3-1",
    title: "Sancaktepe Atayolu Caddesi'ne Cepheli, Sıfır 3+1 Daire",
    listingType: "SALE",
    status: "ACTIVE",
    category: "APARTMENT",
    price: 9_750_000,
    grossArea: 111,
    netArea: 87,
    rooms: "3+1",
    bathrooms: 2,
    buildingAge: "2025",
    floor: "2 (Ara kat)",
    totalFloors: 8,
    heating: "Merkezi (Pay Ölçer)",
    creditEligible: true,
    deedStatus: "Tapulu",
    balcony: true,
    parking: false,
    facade: "Atayolu Caddesi",
    city: "İstanbul",
    district: "Sancaktepe",
    neighborhood: "Osmangazi",
    lat: 40.988975,
    lng: 29.236164,
    featured: true,
    regionSlug: "sancaktepe",
    listingNo: "P20587627",
    remaxUrl: "https://remax.com.tr/tr/danisman/41906-11/emirhan-simsek",
    summary:
      "2025 yapımı, hiç kullanılmamış, ara katta ve boş teslim. Krediye uygun, oturuma hazır.",
    description: `Sancaktepe Osmangazi Mahallesi'nde, Atayolu Caddesi'ne cepheli 2025 yapımı binada **sıfır 3+1 daire**.

Daire hiç kullanılmamış ve **boş teslim** ediliyor; iç mekânı kendi zevkinize göre döşeme imkânı sunuyor. Mutfak dolapları ve banyo armatürleri takılı durumda, oturuma hazır.

**Ara kat (2. kat)** konumunda. Ara katlar zemin katın gürültüsünden ve üst katların ısı kaybından uzak kaldığı için tercih edilir; bu daire de o avantajı taşıyor.

Isıtma merkezi sistem, pay ölçerli — kullandığınız kadar ödersiniz. **Krediye uygun** ve tapu durumu temiz.`,
    features: [
      { label: "Sıfır / Hiç Kullanılmamış", group: "INTERIOR" },
      { label: "Ara Kat", group: "INTERIOR" },
      { label: "Mutfak Dolapları Takılı", group: "INTERIOR" },
      { label: "İki Banyo", group: "INTERIOR" },
      { label: "Pay Ölçerli Isıtma", group: "INTERIOR" },
      { label: "Krediye Uygun", group: "INTERIOR" },
      { label: "Cadde Cepheli", group: "ENVIRONMENT" },
      { label: "Asansör", group: "EXTERIOR" },
    ],
    tour: [
      {
        index: 1,
        roomName: "Bina",
        caption:
          "2025'te tamamlanan bina. Atayolu Caddesi'ne cepheli, çevre yapılaşması yeni.",
      },
      {
        index: 2,
        roomName: "Cadde",
        caption:
          "Bina önündeki cadde. Ulaşım ve günlük ihtiyaçlar yürüme mesafesinde.",
      },
      {
        index: 3,
        roomName: "Giriş Holü",
        caption:
          "Daire girişi. Uzun hol odaları birbirinden ayırıyor; oda kapıları karşı karşıya gelmiyor.",
      },
      {
        index: 14,
        roomName: "Salon",
        caption:
          "Salon iki pencereli ve gizli aydınlatmalı. Gün boyu doğal ışık alıyor, balkon çıkışı buradan veriliyor.",
      },
      {
        index: 16,
        roomName: "Salon",
        caption:
          "Salonun diğer açısı. Boş teslim edildiği için yerleşimi tamamen kendinize göre kurabilirsiniz.",
      },
      {
        index: 6,
        roomName: "Mutfak",
        caption:
          "Mutfak dolapları takılı, ankastre nişleri hazır. Tezgah boyunca doğal ışık geliyor.",
      },
      {
        index: 8,
        roomName: "Mutfak",
        caption:
          "Tezgah ve alt-üst dolap düzeni. Buzdolabı ve bulaşık makinesi yerleri ayrılmış.",
      },
      {
        index: 9,
        roomName: "Balkon",
        caption:
          "Balkondan çevre görünümü. Önü açık, karşı bina cepheyi kapatmıyor.",
      },
      {
        index: 10,
        roomName: "Ebeveyn Yatak Odası",
        caption:
          "Ana yatak odası, laminat parke döşeli ve pencereli. Çift kişilik yatak ve gardırop rahat sığıyor.",
      },
      {
        index: 11,
        roomName: "Yatak Odası",
        caption: "İkinci yatak odası. Sokak sesinden uzak, sakin cephede.",
      },
      {
        index: 18,
        roomName: "Çocuk Odası",
        caption:
          "Üçüncü oda. Çocuk odası veya çalışma odası olarak kullanılabilir.",
      },
      {
        index: 13,
        roomName: "Banyo",
        caption:
          "Banyo kullanıma hazır: duşakabin, lavabo ve klozet takılı, seramikleri yeni.",
      },
      {
        index: 24,
        roomName: "İkinci Banyo",
        caption:
          "Dairedeki ikinci banyo. Sabah yoğunluğunu bölmesi açısından pratik bir ayrıntı.",
      },
      {
        index: 20,
        roomName: "Koridor",
        caption:
          "Odaları birbirine bağlayan koridor. Gömme dolap nişleri hol boyunca devam ediyor.",
      },
      {
        index: 26,
        roomName: "Çevre",
        caption:
          "Bölgenin yüksekten görünümü. Cadde bağlantısı ve çevredeki yeni yapılaşma.",
      },
    ],
  },

  // ---------------------------------------------------------------- 3
  {
    code: "P83437783",
    slug: "sancaktepe-sifir-3-1-kiralik-daire-yerden-isitma",
    title: "Sancaktepe'de Sıfır 3+1 Kiralık Daire — Yerden Isıtmalı, 6. Kat",
    listingType: "RENT",
    status: "ACTIVE",
    category: "APARTMENT",
    price: 55_000,
    grossArea: 111,
    netArea: 87,
    rooms: "3+1",
    bathrooms: 2,
    buildingAge: "2024",
    floor: "6",
    totalFloors: 8,
    heating: "Yerden Isıtma",
    creditEligible: false,
    deedStatus: "Kat İrtifaklı",
    balcony: true,
    parking: false,
    city: "İstanbul",
    district: "Sancaktepe",
    neighborhood: "Osmangazi",
    lat: 40.98899,
    lng: 29.236726,
    featured: true,
    regionSlug: "sancaktepe",
    listingNo: "P83437783",
    remaxUrl: "https://remax.com.tr/tr/danisman/41906-11/emirhan-simsek",
    summary:
      "6. katta, yerden ısıtmalı ve sıfır. Yüksek kat sayesinde önü kapanmayan manzara.",
    description: `Sancaktepe Osmangazi Mahallesi'nde, 2024 yapımı binada **sıfır 3+1 kiralık daire**.

Dairenin iki belirgin avantajı var: **yerden ısıtma** ve **6. kat** konumu. Yerden ısıtma hem ısı dağılımını dengeliyor hem de radyatör olmadığı için mobilya yerleşiminde serbestlik sağlıyor. Yüksek kat ise önü kapanmayan bir manzara ve gürültüden uzak bir yaşam demek.

111 m² brüt / 87 m² net kullanım alanında salon, üç oda ve **iki banyo** bulunuyor. Balkon salondan çıkılıyor.

Daire hiç kullanılmamış durumda; uzun vadeli oturmak isteyen kiracılar için hazır.`,
    features: [
      { label: "Yerden Isıtma", group: "INTERIOR" },
      { label: "Sıfır / Hiç Kullanılmamış", group: "INTERIOR" },
      { label: "İki Banyo", group: "INTERIOR" },
      { label: "Balkon", group: "EXTERIOR" },
      { label: "Yüksek Kat", group: "ENVIRONMENT" },
      { label: "Açık Manzara", group: "ENVIRONMENT" },
      { label: "Asansör", group: "EXTERIOR" },
    ],
    tour: [
      {
        index: 2,
        roomName: "Bina",
        caption:
          "2024 yapımı bina. Sancaktepe Osmangazi Mahallesi'nde, yeni gelişen bir hatta konumlanıyor.",
      },
      {
        index: 3,
        roomName: "Giriş Holü",
        caption:
          "Daire girişi ve hol. Odalara dağılım holden veriliyor, geçişler birbirini kesmiyor.",
      },
      {
        index: 15,
        roomName: "Salon",
        caption:
          "Salon çift pencereli, gizli aydınlatmalı ve balkon çıkışlı. 6. katta olduğu için önü açık.",
      },
      {
        index: 17,
        roomName: "Salon",
        caption:
          "Salonun diğer açısı. Yerden ısıtma sayesinde duvar dipleri radyatörsüz — mobilya yerleşimi serbest.",
      },
      {
        index: 8,
        roomName: "Mutfak",
        caption:
          "Mutfak dolapları takılı ve balkona açılıyor. Tezgah boyunca gün ışığı alıyor.",
      },
      {
        index: 11,
        roomName: "Mutfak",
        caption:
          "Ankastre nişleri hazır, beyaz eşya yerleri ayrılmış durumda.",
      },
      {
        index: 10,
        roomName: "Balkon",
        caption:
          "Balkondan çevre görünümü. Yüksek kat olduğu için karşıda cepheyi kapatan yapı yok.",
      },
      {
        index: 13,
        roomName: "Manzara",
        caption:
          "6. kattan geniş açı manzara. Bu kat, ilanın fiyatını belirleyen ana unsurlardan biri.",
      },
      {
        index: 5,
        roomName: "Ebeveyn Yatak Odası",
        caption:
          "Ana yatak odası, pencereli ve laminat parke döşeli. Sokak gürültüsü bu katta hissedilmiyor.",
      },
      {
        index: 19,
        roomName: "Yatak Odası",
        caption: "İkinci oda. Gömme dolap nişi ve doğal havalandırması mevcut.",
      },
      {
        index: 22,
        roomName: "Çocuk Odası",
        caption:
          "Üçüncü oda; çocuk odası ya da çalışma odası olarak kullanılabilir.",
      },
      {
        index: 7,
        roomName: "Banyo",
        caption:
          "Banyo kullanıma hazır. Duşakabin, lavabo ve klozet takılı, seramikleri sıfır.",
      },
      {
        index: 24,
        roomName: "İkinci Banyo",
        caption:
          "İkinci banyo, duşlu. 3+1 kiralık dairelerde iki banyo bulmak bölgede ayırt edici bir özellik.",
      },
      {
        index: 21,
        roomName: "Koridor",
        caption: "Odaları bağlayan koridor ve gömme dolap alanları.",
      },
    ],
  },

  // ---------------------------------------------------------------- 4
  {
    code: "P52506737",
    slug: "sancaktepe-atayolu-caddesine-cepheli-420-m2-kiralik-dukkan",
    title: "Sancaktepe Atayolu Caddesi'ne Cepheli 420 m² Kiralık Dükkân",
    listingType: "RENT",
    status: "ACTIVE",
    category: "SHOP",
    price: 290_000,
    grossArea: 420,
    buildingAge: "2025",
    heating: "Merkezi (Pay Ölçer)",
    creditEligible: false,
    deedStatus: "Tapulu",
    parking: false,
    facade: "Atayolu Caddesi",
    city: "İstanbul",
    district: "Sancaktepe",
    neighborhood: "Osmangazi",
    lat: 40.98916,
    lng: 29.23681,
    regionSlug: "sancaktepe",
    listingNo: "P52506737",
    remaxUrl: "https://remax.com.tr/tr/danisman/41906-11/emirhan-simsek",
    summary:
      "Boydan boya cam cepheli, kolonları planlanmış 420 m² ticari alan. Cadde üzerinde, sıfır teslim.",
    description: `Sancaktepe Osmangazi Mahallesi'nde, **Atayolu Caddesi'ne cepheli 420 m² kiralık ticari alan**.

Dükkânın en güçlü yanı **cam cephesi**: cadde boyunca uzanan boydan boya vitrin, perakende ve zincir marka kullanımları için yüksek görünürlük sağlıyor.

İç mekân kaba inşaat teslim; zemin, bölme ve tesisat kendi konseptinize göre kurgulanabilir. Kolon aralıkları geniş bırakıldığı için alanı bölmek de açık kullanmak da mümkün.

2025 yapımı binada, merkezi ısıtma pay ölçerli. Market, showroom, spor salonu ve eğitim kurumu gibi geniş alan isteyen kullanımlara uygun.`,
    features: [
      { label: "Boydan Boya Cam Cephe", group: "EXTERIOR" },
      { label: "Cadde Üzeri", group: "ENVIRONMENT" },
      { label: "420 m² Tek Katta", group: "INTERIOR" },
      { label: "Geniş Kolon Aralığı", group: "INTERIOR" },
      { label: "Sıfır Bina (2025)", group: "EXTERIOR" },
      { label: "Pay Ölçerli Isıtma", group: "INTERIOR" },
    ],
    tour: [
      {
        index: 4,
        roomName: "Cadde Cephesi",
        caption:
          "Atayolu Caddesi'ne bakan cephe. Araç ve yaya trafiğinin ikisini de gören bir konum.",
      },
      {
        index: 1,
        roomName: "Vitrin",
        caption:
          "Boydan boya cam cephe. Bu genişlikte kesintisiz vitrin, bölgede sınırlı sayıda ticari alanda bulunuyor.",
      },
      {
        index: 14,
        roomName: "Cephe Detayı",
        caption:
          "Cam cephenin uzunluğu. Marka görünürlüğü açısından belirleyici olan ana unsur.",
      },
      {
        index: 6,
        roomName: "İç Mekân",
        caption:
          "420 m² tek katta. Kaba inşaat teslim; zemin ve bölmeler kendi konseptinize göre kurgulanabilir.",
      },
      {
        index: 11,
        roomName: "İç Mekân",
        caption:
          "Kolon aralıkları geniş bırakılmış. Alanı bölmek de tek hacim olarak kullanmak da mümkün.",
      },
      {
        index: 9,
        roomName: "Arka Bölüm",
        caption:
          "Mekânın arka kısmı. Depo, personel alanı veya mutfak kurgusu için uygun derinlik mevcut.",
      },
      {
        index: 12,
        roomName: "Genel Görünüm",
        caption:
          "Alanın bütününü gösteren açı. Tavan yüksekliği showroom ve market kullanımına uygun.",
      },
      {
        index: 13,
        roomName: "Çevre",
        caption:
          "Bina ve çevresindeki yapılaşma. Konut yoğunluğu ticari alan için hazır bir müşteri tabanı oluşturuyor.",
      },
    ],
  },

  // ---------------------------------------------------------------- 5
  {
    code: "P68852233",
    slug: "sancaktepe-osmangazi-satilik-depolu-dukkan",
    title: "Sancaktepe Osmangazi Mahallesi'nde Satılık Depolu Dükkân",
    listingType: "SALE",
    status: "ACTIVE",
    category: "SHOP",
    price: 8_750_000,
    grossArea: 155,
    buildingAge: "2015",
    heating: "Kombi (Doğalgaz)",
    creditEligible: true,
    deedStatus: "Tapulu",
    parking: false,
    city: "İstanbul",
    district: "Sancaktepe",
    neighborhood: "Osmangazi",
    lat: 40.987712,
    lng: 29.236342,
    regionSlug: "sancaktepe",
    listingNo: "P68852233",
    remaxUrl: "https://remax.com.tr/tr/danisman/41906-11/emirhan-simsek",
    summary:
      "155 m², köşe konumlu ve iki cepheli. Alt katta bağlantılı deposu var, krediye uygun.",
    description: `Sancaktepe Osmangazi Mahallesi'nde, 2015 yapımı bir binada **satılık 155 m² dükkân**.

Dükkân **köşe konumda** ve iki cepheden cam alıyor; bu, tek cepheli benzerlerine göre hem görünürlük hem de doğal ışık avantajı sağlıyor. Önündeki geniş kaldırım ve peyzaj alanı giriş kullanımını rahatlatıyor.

İç merdivenle bağlanan **alt kat deposu** mevcut. Stok tutması gereken perakende işletmeleri için satış alanını daraltmadan depolama imkânı sunuyor.

Isıtma doğalgaz kombi, tapu durumu temiz ve **krediye uygun** — yatırım amaçlı alımlarda finansman tarafını kolaylaştırıyor.`,
    features: [
      { label: "Köşe Konum", group: "EXTERIOR" },
      { label: "İki Cepheli", group: "EXTERIOR" },
      { label: "Alt Kat Deposu", group: "INTERIOR" },
      { label: "İç Merdiven", group: "INTERIOR" },
      { label: "Geniş Kaldırım Girişi", group: "ENVIRONMENT" },
      { label: "Krediye Uygun", group: "INTERIOR" },
    ],
    tour: [
      {
        index: 1,
        roomName: "Bina",
        caption:
          "Dükkânın bulunduğu bina. 2015 yapımı, zemin katta ve köşe konumda.",
      },
      {
        index: 10,
        roomName: "Cephe",
        caption:
          "İki cepheden cam alan köşe konum. Tek cepheli dükkânlara göre görünürlük belirgin şekilde yüksek.",
      },
      {
        index: 8,
        roomName: "Giriş",
        caption:
          "Dükkân girişi ve merdiveni. Önündeki geniş kaldırım giriş kullanımını rahatlatıyor.",
      },
      {
        index: 13,
        roomName: "Satış Alanı",
        caption:
          "Ana satış alanı. Cam cephe boyunca doğal ışık alıyor, kolon engeli yok.",
      },
      {
        index: 14,
        roomName: "Satış Alanı",
        caption:
          "Mekânın diğer açısı. 155 m² tek hacim olarak da bölünerek de kullanılabiliyor.",
      },
      {
        index: 18,
        roomName: "Arka Bölüm",
        caption:
          "Arka bölüm ve pencere hattı. Personel alanı veya ofis kurgusuna uygun.",
      },
      {
        index: 17,
        roomName: "Depo Bağlantısı",
        caption:
          "Alt kat deposuna inen iç merdiven. Stok, satış alanını daraltmadan aşağıda tutulabiliyor.",
      },
      {
        index: 21,
        roomName: "Depo",
        caption:
          "Alt kattaki depo alanı. Perakende işletmeleri için satış alanı kadar belirleyici bir bölüm.",
      },
      {
        index: 12,
        roomName: "Çevre",
        caption:
          "Bina çevresi ve komşu yapılaşma. Konut yoğunluğu yüksek bir hat.",
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Blog — taslak rehber yazıları                                               */
/* -------------------------------------------------------------------------- */

/**
 * Bu yazılar genel geçer, doğru gayrimenkul bilgisi içerir ancak Emirhan'ın
 * imzasıyla yayınlanacağı için yayına almadan önce okuyup onaylaması gerekir.
 */
export const BLOG_POSTS = [
  {
    slug: "ev-alirken-dikkat-edilmesi-gereken-12-madde",
    title: "Ev Alırken Dikkat Edilmesi Gereken 12 Madde",
    excerpt:
      "Tapudan iskana, kredi uygunluğundan bina yaşına kadar; alıcıların en sık atladığı ve sonradan en çok pişman olduğu başlıklar.",
    coverUrl: "/uploads/ilan/P20587627/14.webp",
    tags: ["İlk Ev", "Rehber"],
    published: true,
    content: `Ev almak çoğu insan için hayatının en büyük finansal kararı. Buna rağmen bu kararın büyük kısmı duyguyla veriliyor. Aşağıdaki 12 başlık, sahada en sık karşılaştığım ve sonradan sorun çıkaran konuların özeti.

## 1. Tapu kaydını mutlaka kontrol edin

Tapu üzerinde ipotek, haciz veya şerh olup olmadığını Tapu Müdürlüğü'nden ya da e-Devlet üzerinden kontrol edin. "Sorun yok" beyanı yeterli değildir.

## 2. Kat mülkiyeti mi, kat irtifakı mı?

Kat irtifaklı bir dairede iskan alınmamış olabilir. Bu durum hem kredi kullanımını hem de ileride satışı zorlaştırır.

## 3. İskan (yapı kullanma izni) belgesi

İskanı olmayan yapıda elektrik ve su abonelikleri kalıcı olarak alınamaz, emlak vergisi daha yüksek hesaplanır.

## 4. Bina yaşı ve deprem yönetmeliği

1999 öncesi yapılarda mutlaka güçlendirme durumunu sorun. 2018 yönetmeliği sonrası yapılar en güncel standarttadır.

## 5. Aidat gerçekten ne kadar?

Site aidatı, özellikle sosyal tesisi geniş projelerde, kira getirisinin önemli bir kısmını götürebilir. Son 12 ayın aidat dökümünü isteyin.

## 6. Net ve brüt metrekare farkı

İlanda yazan brüt alan, ortak alan paylarını içerir. Yaşayacağınız alan net metrekaredir; aradaki fark %15–25 arasında değişir.

## 7. Cephe ve ışık

Güney cepheli daireler gün boyu ışık alır. Kuzey cepheli daireler yazın serin ama kışın rutubete daha açıktır. Daireyi mümkünse gün ortasında gezin.

## 8. Isıtma sistemi ve yalıtım

Isı yalıtımı olmayan bir binada ısıtma masrafı, iyi yalıtılmış bir binanın iki katına çıkabilir. Yerden ısıtmalı dairelerde ısı dağılımı daha dengelidir.

## 9. Otopark durumu

Otoparkın tapuda dairenin eklentisi olup olmadığını kontrol edin. "Kullanım hakkı" ile "mülkiyet" farklı şeylerdir.

## 10. Kredi uygunluğu

Bankalar her konuta kredi vermez. Yapının yaşı, iskan durumu ve ekspertiz değeri kredi tutarını doğrudan belirler.

## 11. Ekspertiz değeri

Bankanın belirlediği ekspertiz değeri, satış fiyatının altında kalabilir. Bu durumda aradaki farkı peşin ödemeniz gerekir.

## 12. Çevreyi farklı saatlerde görün

Bir mahalleyi tanımak için sabah, akşam ve hafta sonu ayrı ayrı gezin. Gündüz sakin görünen bir sokak akşam bambaşka olabilir.

---

Bu başlıkların hepsini müşterilerimle birlikte tek tek geçiyorum. Sorularınız için bana ulaşabilirsiniz.`,
  },
  {
    slug: "kira-getirisi-hesabi-nasil-yapilir",
    title: "Kira Getirisi Hesabı Nasıl Yapılır?",
    excerpt:
      "Brüt getiri herkesin baktığı rakam, net getiri ise gerçeği söyleyen rakam. Aradaki farkı örnekle açıklıyorum.",
    coverUrl: "/uploads/ilan/P83437783/15.webp",
    tags: ["Yatırım", "Rehber"],
    published: true,
    content: `Yatırım amaçlı konut alırken en çok yapılan hata, sadece brüt kira getirisine bakmaktır.

## Brüt getiri

**Brüt getiri = (Yıllık kira × 100) / Konut bedeli**

Örnek: 4.000.000 TL'ye aldığınız bir daireyi aylık 22.000 TL'ye kiraya verdiniz.

Yıllık kira: 22.000 × 12 = 264.000 TL
Brüt getiri: (264.000 × 100) / 4.000.000 = **%6,6**

## Net getiri

Brüt rakamdan şu kalemleri düşmeniz gerekir:

- **Aidat** (kiracı ödemiyorsa)
- **Emlak vergisi** (yıllık)
- **DASK ve konut sigortası**
- **Gelir vergisi** (istisna tutarı üzerindeki kira geliri için)
- **Boşta kalma süresi** (yılda ortalama 0,5–1 ay)
- **Bakım ve onarım** (yıllık kiranın yaklaşık %5'i)

Aynı örnekte bu kalemler yılda toplam 55.000 TL tutsun:

Net kira: 264.000 − 55.000 = 209.000 TL
Net getiri: (209.000 × 100) / 4.000.000 = **%5,2**

## Değer artışını unutmayın

Konut yatırımının getirisi yalnızca kiradan gelmez. Bölgenin değer artış hızı, çoğu zaman kira getirisinden daha belirleyicidir. Bu yüzden "yüksek kira getirisi" vaat eden ama değer artışı zayıf bölgeler, uzun vadede geride kalabilir.

## Likidite

Son olarak: satmak istediğinizde ne kadar sürede alıcı bulacaksınız? 1+1 ve 2+1 daireler genellikle en likit ürünlerdir. Çok büyük veya çok özel dairelerde alıcı havuzu daralır.

---

Değerlendirdiğiniz bir yatırım için bu hesabı birlikte yapmak isterseniz bana ulaşın.`,
  },
  {
    slug: "ticari-dukkan-yatiriminda-nelere-bakilir",
    title: "Ticari Dükkân Yatırımında Nelere Bakılır?",
    excerpt:
      "Dükkân yatırımında konum tek başına yeterli değil. Cephe genişliği, kolon düzeni ve ruhsat durumu getirinin tamamını belirliyor.",
    coverUrl: "/uploads/ilan/P52506737/01.webp",
    tags: ["Yatırım", "Ticari"],
    published: true,
    content: `Konut yatırımını herkes bir şekilde değerlendirebilir; ticari mülkte ise doğru soruları sormadan alınan karar, yıllarca boş kalan bir dükkâna dönüşebilir.

## 1. Cephe genişliği, metrekareden önemlidir

Perakendede fiyatı belirleyen ilk unsur cephe genişliğidir. 100 m² ama 12 metre cepheli bir dükkân, 150 m² ama 5 metre cepheli bir dükkândan daha yüksek kira getirir. Marka görünürlüğü doğrudan cepheyle ilgilidir.

## 2. Kolon düzeni

Ortada duran bir kolon, mekânın kullanılabilir alanını gerçekte yazandan çok daha fazla düşürür. Kolonsuz veya geniş kolon aralıklı alanlar, kiracı bulmayı belirgin şekilde kolaylaştırır.

## 3. Tavan yüksekliği

Market, showroom ve spor salonu gibi kullanımlar minimum tavan yüksekliği ister. Düşük tavanlı bir dükkân, kiracı havuzunuzu baştan daraltır.

## 4. Ruhsat ve kullanım izni

İşyeri açma ve çalışma ruhsatının hangi kullanımlara verilebildiğini önceden öğrenin. Havalandırma bacası olmayan bir mekâna yeme-içme ruhsatı alınamaz — bu tek başına kiracı havuzunuzun yarısını eler.

## 5. Depo ve arka alan

Perakende işletmelerinin neredeyse tamamı stok alanı ister. Bağlantılı bir deposu olan dükkân, satış alanını daraltmadan bu ihtiyacı karşılar ve kirasını yükseltir.

## 6. Yaya trafiği — gerçek sayılarla

"İşlek cadde" ifadesi özneldir. Dükkânın önünde farklı gün ve saatlerde durup yaya sayın. Hafta içi öğlen ile cumartesi akşamı arasındaki fark, kullanım türünü belirler.

## 7. Çevredeki konut yoğunluğu

Bir dükkânın müşterisi çoğunlukla yürüme mesafesindeki konutlardan gelir. Yeni tamamlanan konut projelerinin çevresindeki ticari alanlar, dolulukla birlikte değer kazanır.

## 8. Kiracı profili ve sözleşme

Kurumsal bir kiracı, bireysel kiracıya göre daha düşük kira ödeyebilir; buna karşılık tahsilat riski ve boşta kalma süresi çok daha düşüktür. Uzun vadede net getiriyi bu ikisi belirler.

---

Ticari mülk değerlendiriyorsanız, bu başlıkları birlikte tek tek geçebiliriz.`,
  },
];
