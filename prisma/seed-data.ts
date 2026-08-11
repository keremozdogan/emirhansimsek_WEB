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
  /**
   * Hizmet alanı ile portföyün yoğunlaştığı yer AYRI iki bilgidir.
   *
   * Önceki metin "Sancaktepe ve Çekmeköy'de ..." diyordu; vitrindeki ilanların
   * o iki ilçede olması Emirhan'ın yalnızca oraya baktığı anlamına gelmiyor —
   * İstanbul'un her iki yakasında da çalışıyor. Kapsamı tagline taşıyor,
   * yoğunlaşmayı ise shortBio'nun ikinci cümlesi; böylece hem doğru hem de
   * kendini kısıtlamayan bir konumlandırma çıkıyor.
   */
  tagline: "İstanbul genelinde satılık, kiralık konut ve ticari portföy.",
  /**
   * Hakkımda sayfasının giriş metni. Bilerek ilçe adı geçmiyor: burası
   * Emirhan'ın hizmet alanını anlatır, portföyün o an nerede yoğunlaştığını
   * değil. İlçe bilgisi zaten /portfoy ve /bolgeler sayfalarında, güncel
   * veriyle görünüyor; buraya yazılırsa yeni bölgede ilan çıktığında
   * metin eskiyor ve kimse fark etmiyor.
   */
  shortBio:
    "RE/MAX Eksen çatısı altında İstanbul genelinde gayrimenkul danışmanlığı yapıyorum. Alım, satım ve kiralama süreçlerinin tamamını kendim yürütüyorum; konutun yanında ticari mülklerle de ilgileniyorum.",
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
      "RE/MAX Danışman Gelişim Programı'nı tamamladım; portföyümü İstanbul genelinde genişlettim.",
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
    side: "ANADOLU",
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
    side: "ANADOLU",
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
    coverUrl: "/uploads/blog/ev-alirken.webp",
    tags: ["İlk Ev", "Rehber"],
    published: true,
    content: `Ev almak çoğu insan için hayatının en büyük finansal kararı. Buna rağmen bu kararın büyük kısmı duyguyla veriliyor: bir daireye girip "burası benim evim" hissine kapılmak, sonraki bütün kontrolleri gevşetiyor. Aşağıdaki 12 başlık, sahada en sık karşılaştığım ve sonradan sorun çıkaran konuların özeti.

Tavsiyem: bu listeyi telefonunuza kaydedin ve her gezdiğiniz evde tek tek geçin. Duygunun karar verdiği anda elinizde bir kontrol listesi olması, düşündüğünüzden çok daha koruyucudur.

## 1. Tapu kaydını mutlaka kontrol edin

Tapu üzerinde ipotek, haciz veya şerh olup olmadığını e-Devlet üzerinden ya da Tapu Müdürlüğü'nden kontrol edin. Satıcının "sorun yok" beyanı yeterli değildir — çoğu zaman satıcı da durumdan habersizdir, çünkü şerhler malikin haberi olmadan da işlenebilir.

Özellikle bakılacaklar: ipotek kaydı, haciz, aile konutu şerhi, intifa hakkı ve satış vaadi sözleşmesi. Bunlardan herhangi biri varsa devir öncesinde nasıl kaldırılacağı yazılı olarak netleşmeli.

## 2. Kat mülkiyeti mi, kat irtifakı mı?

Kat irtifakı, bina henüz tamamlanmadan kurulan geçici bir haktır. Kat irtifaklı bir dairede iskan alınmamış olabilir; bu durum hem kredi kullanımını hem de ileride satışı zorlaştırır.

Kat mülkiyetine geçilmiş bir daire her zaman daha likittir. Kat irtifaklı bir daire alıyorsanız, kat mülkiyetine ne zaman geçileceğini ve engelin ne olduğunu mutlaka sorun.

## 3. İskan (yapı kullanma izni) belgesi

İskanı olmayan yapıda elektrik ve su abonelikleri kalıcı olarak alınamaz, emlak vergisi daha yüksek hesaplanır ve bankaların çoğu kredi vermez.

"İskan alınacak" ifadesi bir taahhüt değildir. Belge varsa fotokopisini isteyin; yoksa hangi eksik yüzünden alınamadığını öğrenin. Bazı eksikler birkaç ayda kapanır, bazıları yıllardır kapanmamıştır.

## 4. Bina yaşı ve deprem yönetmeliği

İstanbul'da bina yaşı, tek başına en belirleyici teknik başlıktır. 2000 öncesi yapılar farklı bir yönetmeliğe göre inşa edildi; 2018 sonrası yapılar en güncel yönetmeliğe tabi.

Yaşı ileri bir binada mutlaka sorun: güçlendirme yapıldı mı, yapıldıysa belgesi var mı? Kentsel dönüşüm gündemi var mı, varsa hangi aşamada? Bu iki sorunun cevabı fiyatı doğrudan etkiler.

## 5. Kolon ve taşıyıcı sistemde değişiklik

Dükkâna çevrilmiş zemin katlar, birleştirilmiş daireler, kaldırılmış duvarlar. Taşıyıcı sisteme müdahale edilmiş bir binada dairenin kendisi kusursuz olsa bile risk binanın tamamındadır.

Şüpheniz varsa bir inşaat mühendisine binayı gezdirmek, ödeyeceğiniz en ucuz sigortadır.

## 6. Aidat ve site giderleri

Aylık aidat, uzun vadede toplam maliyetin küçümsenen kalemidir. Yüksek aidatlı bir sitede 10 yılda ödenen tutar, dairenin fiyatının kayda değer bir oranına ulaşabilir.

Sorulacaklar: aidat neleri kapsıyor, son bir yılda kaç kez arttı, binada ödemeyen daire oranı ne (yüksekse yük ödeyenlere biner), ve yakın zamanda planlanan büyük gider var mı (asansör yenileme, dış cephe, çatı).

## 7. Isıtma sistemi ve yalıtım

Doğalgaz kombi, merkezi sistem, yerden ısıtma veya soba. Isıtma tipi hem aylık gideri hem de konforu belirler.

Dış cephe yalıtımı olmayan bir binada ısıtma gideri belirgin şekilde yükselir. Kışın gezme şansınız varsa değerlendirin; olmuyorsa komşulara faturalarını sorun — çoğu memnuniyetle söyler.

## 8. Cephe ve gün ışığı

Güney cephe kışın ısıtma giderini düşürür, kuzey cephe yazın serin tutar. Batı cephe öğleden sonra aşırı ısınabilir.

Daireyi mümkünse gün içinde iki farklı saatte görün. Sabah aydınlık görünen bir salon, öğleden sonra karşı binanın gölgesinde kalıyor olabilir.

## 9. Gürültü

Ana cadde, okul, cami, gece işleyen işletmeler ve toplu taşıma durakları. Gürültü, taşındıktan sonra en çok pişmanlık yaratan ve düzeltilmesi en zor sorundur.

Evi hafta içi bir akşam ve hafta sonu bir öğleden sonra olmak üzere iki kez ziyaret edin. Boş bir dairede pencereyi kapatıp bir dakika sessizce durmak yeterlidir.

## 10. Otopark

Kapalı otopark, açık park yeri veya sokak. İstanbul'un birçok bölgesinde otoparkın varlığı dairenin değerini doğrudan etkiler.

Otopark varsa sorun: daireye tahsisli mi, yoksa ortak kullanım mı? Tapuda eklenti olarak görünüyor mu? Sözlü tahsisler el değiştirince tartışma çıkarır.

## 11. Bölgenin gelecek planı

Yakında açılacak metro hattı, yeni okul, hastane veya alışveriş merkezi bölgenin değerini yükseltir. Buna karşılık planlanan bir sanayi alanı, viyadük veya yüksek yoğunluklu inşaat düşürebilir.

Belediyenin imar planlarına bakın. "Metro geliyor" vaadiyle ödenen fiyat farkı, hat açılmadığı her yıl size maliyettir.

## 12. Satıcının aciliyeti

Satıcının neden sattığını öğrenmek pazarlık gücünüzü belirler. Taşınma zorunluluğu olan bir satıcı ile "iyi fiyat gelirse satarım" diyen bir satıcı aynı masada oturmaz.

Bu bilgiyi doğrudan sormak kabalık değildir; sahada en normal sorulardan biridir.

## Kontrol listesini yanınızda taşıyın

| Başlık | Durum |
| --- | --- |
| Tapu kaydı temiz mi | |
| Kat mülkiyeti var mı | |
| İskan belgesi var mı | |
| Bina yaşı / güçlendirme | |
| Aidat ve planlanan giderler | |
| Isıtma ve yalıtım | |
| Cephe ve gün ışığı | |
| Gürültü (iki farklı saatte) | |
| Otopark tapuda mı | |
| Bölge imar planı | |

---

Bu listeyi gezdiğiniz bir ev için birlikte geçmek isterseniz [bana ulaşın](/iletisim). Bütçenizi netleştirmek için önce [kredi hesaplayıcıya](/kredi-hesaplama) bakabilir, uygun ilanlar için [portföyü](/portfoy) inceleyebilirsiniz.
`,
  },
  {
    slug: "kira-getirisi-hesabi-nasil-yapilir",
    title: "Kira Getirisi Hesabı Nasıl Yapılır?",
    excerpt:
      "Brüt getiri yanıltıcıdır. Net getiriyi, geri ödeme süresini ve likiditeyi hesaba katmadan yatırım kararı vermeyin.",
    coverUrl: "/uploads/blog/kira-getirisi.webp",
    tags: ["Yatırım", "Rehber"],
    published: true,
    content: `Yatırım amaçlı konut alırken en çok yapılan hata, sadece brüt kira getirisine bakmaktır. "Yüzde 7 getiriyor" cümlesi kulağa iyi gelir ama o rakamın içinden çıkacak kalemler hesaba katılmadığında, gerçek getiri çoğu zaman anlatılanın belirgin şekilde altındadır.

Bu yazıda hesabı adım adım yapacağız. Kendi değerlendirdiğiniz daire için rakamları yerine koyup takip edin.

## Brüt getiri

**Brüt getiri = (Yıllık kira x 100) / Konut bedeli**

Örnek: 4.000.000 TL'ye aldığınız bir daireyi aylık 22.000 TL'ye kiraya verdiniz.

- Yıllık kira: 22.000 x 12 = 264.000 TL
- Brüt getiri: (264.000 x 100) / 4.000.000 = **%6,6**

Bu rakam ilanlarda ve sohbetlerde konuşulan rakamdır. Karar vermek için yeterli değildir.

## Net getiri — düşülecek kalemler

Brüt rakamdan şu kalemleri düşmeniz gerekir:

- **Aidat** — kiracı ödemiyorsa doğrudan sizin gideriniz
- **Emlak vergisi** — yıllık, belediyeye
- **DASK ve konut sigortası** — DASK zorunlu, konut sigortası isteğe bağlı ama önerilir
- **Gelir vergisi** — kira gelirinin istisna tutarını aşan kısmı için; istisna tutarı her yıl güncellenir, beyan döneminde güncel rakamı teyit edin
- **Boşta kalma süresi** — yılda ortalama yarım ila bir ay; kiracı değişimlerinde kaçınılmaz
- **Bakım ve onarım** — yıllık kiranın yaklaşık yüzde beşi; kombi, boya, beyaz eşya
- **Yönetim gideri** — kendiniz ilgilenmiyorsanız

Aynı örnekte bu kalemler yılda toplam 55.000 TL tutsun:

- Net kira: 264.000 - 55.000 = 209.000 TL
- Net getiri: (209.000 x 100) / 4.000.000 = **%5,2**

Aradaki 1,4 puanlık fark, "yüzde 7 getiriyor" cümlesiyle gerçeğin arasındaki mesafedir.

## Geri ödeme süresi

Yatırımın kendini kaç yılda amorti ettiğini görmek için:

**Geri ödeme süresi = Konut bedeli / Yıllık net kira**

Örneğimizde: 4.000.000 / 209.000 = yaklaşık **19 yıl**.

Bu rakam tek başına iyi ya da kötü değildir; karşılaştırma için anlamlıdır. İki daire arasında karar verirken ikisinin de geri ödeme süresini hesaplayın.

## Değer artışını unutmayın

Konut yatırımının getirisi yalnızca kiradan gelmez. Bölgenin değer artış hızı, çoğu zaman kira getirisinden daha belirleyicidir.

Bu yüzden yüksek kira getirisi vaat eden ama değer artışı zayıf bölgeler uzun vadede geride kalabilir. Tersine, kira getirisi mütevazı görünen merkezi bir bölge, değer artışıyla toplam getiriyi öne çıkarabilir.

Değer artışını tahmin etmenin en somut yolu bölgedeki altyapı yatırımlarını takip etmektir: raylı sistem, okul, hastane, yeni imar planı.

## Likidite — satmak istediğinizde ne olacak?

Son olarak, çoğu yatırımcının sonradan fark ettiği başlık: satmak istediğinizde ne kadar sürede alıcı bulacaksınız?

1+1 ve 2+1 daireler genellikle en likit ürünlerdir; alıcı havuzu geniştir. Çok büyük, çok özel ya da çok pahalı dairelerde havuz daralır ve satış süresi uzar. Acil nakit ihtiyacı doğduğunda likidite, getiri kadar önemli hâle gelir.

## Karşılaştırma tablosu

İki yatırım seçeneğini yan yana koyun:

| Ölçüt | A dairesi | B dairesi |
| --- | --- | --- |
| Konut bedeli | | |
| Aylık kira | | |
| Brüt getiri | | |
| Yıllık giderler | | |
| Net getiri | | |
| Geri ödeme süresi | | |
| Bölgede değer artışı | | |
| Likidite (oda tipi) | | |

---

Değerlendirdiğiniz bir yatırım için bu hesabı birlikte yapmak isterseniz [bana ulaşın](/iletisim). Krediyle alacaksanız taksit yükünü [kredi hesaplayıcıdan](/kredi-hesaplama) görebilir, güncel seçenekler için [portföye](/portfoy) bakabilirsiniz.`,
  },
  {
    slug: "ticari-dukkan-yatiriminda-nelere-bakilir",
    title: "Ticari Dükkân Yatırımında Nelere Bakılır?",
    excerpt:
      "Ticaride tek soru vardır: burada bir işletme para kazanabilir mi? Cepheden ruhsata, sirkülasyondan sözleşmeye sekiz başlık.",
    coverUrl: "/uploads/blog/ticari-dukkan.webp",
    tags: ["Yatırım", "Ticari"],
    published: true,
    content: `Ticari gayrimenkul, konuttan tamamen farklı bir mantıkla değerlenir. Konutta "burada yaşamak güzel olur mu" sorusunu sorarsınız; ticaride tek soru vardır: **burada bir işletme para kazanabilir mi?** Kazanamıyorsa dükkân boş kalır ve boş dükkânın getirisi sıfırdır.

Aşağıdaki başlıklar, ticari mülk değerlendirirken sahada gerçekten fark yaratan konular.

## 1. Yaya sirkülasyonu — tahmin değil, sayım

Ticari mülkün değerini belirleyen tek en önemli unsur, önünden geçen insan sayısıdır.

Bunu tahmin etmeyin, sayın. Farklı günlerde ve saatlerde dükkânın önünde durup on dakika boyunca geçen kişi sayısını not edin: hafta içi sabah, hafta içi akşam, cumartesi öğleden sonra. Üç ölçümün ortalaması size gerçek bir fikir verir.

Aynı caddenin iki yakası bile çok farklı sirkülasyona sahip olabilir. Güneş alan taraf, yokuş aşağı taraf, durağa yakın taraf genelde daha yoğundur.

## 2. Cephe genişliği

Ticari mülkte cephe, metrekareden daha belirleyicidir. 40 metrekarelik geniş cepheli bir dükkân, 60 metrekarelik dar cepheli bir dükkândan daha kolay kiralanır ve daha yüksek kira getirir.

Sebep basit: vitrin görünürlüğü. Geçen kişinin dükkânı fark etmesi için gereken saniye, cephe genişliğiyle doğru orantılı.

## 3. Kullanım amacı ve ruhsat

Her dükkân her işe uygun değildir. Gıda üretimi, kafe, eczane, kreş gibi kullanımların kendine özgü ruhsat şartları vardır.

Sorulacaklar: mevcut ruhsat hangi kullanım için? Baca var mı (kafe ve restoran için belirleyici)? Havalandırma çıkışı mümkün mü? Yönetim planı ticari kullanıma izin veriyor mu?

Bir dükkânı kafe olur diye alıp bacasının olmadığını sonradan fark etmek, sahada sık gördüğüm bir hatadır.

## 4. Kat ve giriş

Zemin kat, bodrum ve asma kattan belirgin şekilde değerlidir. Bodrum katlar genellikle depo olarak değerlenir ve kira beklentisi buna göre düşer.

Girişte basamak olması bazı işletmeler için ciddi dezavantajdır: engelli erişimi, bebek arabası, yük taşıma. Küçük görünen bir detay, kiracı havuzunu daraltır.

## 5. Otopark ve yükleme

Müşterinin kısa süreli park edebilmesi, birçok işletme için doğrudan ciro anlamına gelir. Aynı şekilde mal kabulü yapan bir işletme için yükleme yapılabilecek bir alan gerekir.

Cadde üzerinde park yasağı varsa bunu hesaba katın.

## 6. Komşu esnaf dokusu

Bir dükkânın değeri, çevresindeki işletmelerin niteliğiyle birlikte yükselir veya düşer. Aynı sokakta birbirini besleyen işletmeler (kafe, kuaför, market) sirkülasyonu artırır.

Çevrede uzun süredir boş duran dükkân sayısı önemli bir uyarı işaretidir. Boş dükkânları sayın; sokakta boşluk oranı yüksekse sebebini araştırın.

## 7. Mevcut kiracı ve sözleşme

Kiracılı bir dükkân alıyorsanız sözleşmeyi baştan sona okuyun:

- Kalan süre ne kadar?
- Kira artış maddesi nasıl yazılmış?
- Depozito var mı, kimde?
- Tahliye taahhüdü var mı?
- Kiracı geçmiş ödemelerini düzenli yapmış mı?

Kiracılı satın alma, hazır getiri anlamına gelir; ama kötü yazılmış bir sözleşme yıllarca sizi bağlar.

## 8. Kurumsal kiracı mı, bireysel kiracı mı?

Kurumsal bir kiracı (zincir marka, banka şubesi), bireysel kiracıya göre daha düşük kira ödeyebilir. Buna karşılık tahsilat riski ve boşta kalma süresi çok daha düşüktür; sözleşmeler uzun vadelidir.

Uzun vadede net getiriyi bu ikisi belirler. Yüksek kira ödeyen ama altı ayda bir değişen bir kiracı, düşük kira ödeyen ama beş yıl kalan bir kiracıdan daha az kazandırabilir.

## Değerlendirme tablosu

| Ölçüt | Notunuz (1-5) |
| --- | --- |
| Yaya sirkülasyonu (sayım sonucu) | |
| Cephe genişliği | |
| Ruhsat / kullanım uygunluğu | |
| Kat ve giriş kolaylığı | |
| Otopark ve yükleme | |
| Komşu esnaf dokusu | |
| Sözleşme kalitesi | |
| Kiracı niteliği | |

---

Ticari mülk değerlendiriyorsanız bu başlıkları birlikte tek tek geçebiliriz — [bana yazın](/iletisim). Güncel ticari ilanlar için [portföye](/portfoy) göz atın.`,
  },
  {
    slug: "anadolu-yakasi-mi-avrupa-yakasi-mi",
    title: "Anadolu Yakası mı, Avrupa Yakası mı?",
    excerpt:
      "Yaka seçimi bir aidiyet tartışması değil, günlük hayatınıza dair bir hesap. Kararı duyguyla değil, dört somut başlıkla verin.",
    coverUrl: "/uploads/blog/iki-yaka.webp",
    tags: ["İlk Ev", "Rehber"],
    published: true,
    content: `İstanbul'da ev ararken en çok tartışılan konu bu. Oysa "hangi yaka daha iyi" sorusunun herkes için geçerli tek bir cevabı yok; doğru soru **"benim hayatım hangi yakada daha kolay işler"** olmalı.

Yaka seçimi bir aidiyet meselesine dönüştüğünde karar duygusallaşıyor ve insanlar günlük hayatlarını zorlaştıran seçimler yapıyor. Aşağıdaki dört başlık, tartışmayı somut zemine indirmek için.

## 1. İşe gidiş süresi — köprüyü hesaba katın

Yaka kararının en somut maliyeti zamandır. İşiniz karşı yakadaysa, günde iki kez köprü veya tünel geçmek yılda yüzlerce saate mal olur.

Basit bir hesap: günde tek yön 20 dakika fazla yol, gidiş-dönüş 40 dakika eder. Ayda 22 iş günü üzerinden yaklaşık 15 saat, yılda **180 saatin üzerinde** zaman demektir. Bu, yılda bir haftadan fazla uyanık zamandır.

Şunu yapın: ev bakmadan önce, işe gitme saatinizde gerçek bir deneme yolculuğu yapın. Harita uygulamasının "22 dakika" tahmini ile salı sabahı 08:15'teki gerçek süre çoğu zaman aynı değildir. Bir de dönüş yönünü, akşam 18:00'de deneyin.

Geçiş ücretlerini de yıllık toplamıyla hesaplayın; aylık bakınca küçük görünen kalem, yıllıkta belirgin hâle gelir.

## 2. Raylı sisteme mesafe

İstanbul'da bir konutun uzun vadeli değerini en çok etkileyen tek unsur raylı sistem erişimidir. Metro veya Marmaray istasyonuna yürüme mesafesi (yaklaşık 800 metre ve altı), hem kiracı bulmayı hem de satışta alıcı havuzunu belirgin şekilde genişletir.

Ölçerken kuş uçuşu mesafeye değil, **yürüme mesafesine** bakın. Arada geçilmesi zor bir ana cadde, dik bir yokuş veya kapalı bir geçit varsa 600 metre pratikte 15 dakikaya çıkabilir.

Yapım aşamasındaki hatlara dikkat edin: açılış tarihleri sık ertelenir. "Metro geliyor" vaadiyle ödenen fiyat farkı, hattın açılmadığı her yıl size maliyettir. Hat açıldıktan sonra almak, çoğu zaman erken alıp beklemekten daha akıllıcadır.

## 3. Konut dokusu ve metrekare beklentisi

İki yakanın konut stoğu farklı dönemlerde oluştu. Aynı bütçeyle bir yakada daha geniş ve daha yeni, diğerinde daha merkezi ama daha küçük bir daireye ulaşabilirsiniz.

Karar vermeden önce bütçenizi sabitleyip her iki yakada da üçer daire gezin. Rakam üzerinden konuşmak, yaka tartışmasını hızla bitirir.

Şuna dikkat edin: aynı bütçeyle daha büyük daire almak her zaman doğru karar değil. Fazladan 20 metrekare için işe gidişinizi 25 dakika uzatıyorsanız, o metrekareyi haftanın kaç saatinde kullandığınızı düşünün.

## 4. Okul, sağlık ve sosyal çevre

Çocuklu aileler için okul; ileri yaşta ebeveyni olanlar için hastane erişimi, yaka kararını tek başına belirleyebilir.

Bu başlık kişiye özeldir ve genel bir tavsiyesi yoktur. Ama listeye yazılmazsa sonradan en çok pişmanlık yaratan başlıktır. Okul seçimi yapıyorsanız kayıt bölgesi kurallarını taşınmadan önce öğrenin; birçok aile taşındıktan sonra istedikleri okula kayıt yaptıramadığını fark ediyor.

Sosyal çevre de somut bir kalemdir: yakın aile ve arkadaş çevresinden uzaklaşmak, hafta sonu planlarını ve acil durumlarda destek ağını değiştirir.

## Karşılaştırma tablosu yapın

Bu dört başlığı bir kâğıda yazın, iki yaka için ayrı ayrı 1-5 arası puanlayın. Ağırlıkları da siz belirleyin: işe gidiş sizin için hayati ise ona iki kat ağırlık verin.

| Başlık | Ağırlık | Anadolu | Avrupa |
| --- | --- | --- | --- |
| İşe gidiş süresi | | | |
| Raylı sisteme mesafe | | | |
| Bütçeyle ulaşılan m2 | | | |
| Okul / sağlık erişimi | | | |
| Sosyal çevre yakınlığı | | | |

Karar çoğu zaman kendini gösterir. Göstermiyorsa iki yaka da sizin için uygundur demektir; o hâlde fiyat ve daire kalitesine bakarak seçin.

---

İki yakada da çalışıyorum; hangi yakanın sizin için daha mantıklı olduğunu birlikte konuşalım — [bana yazın](/iletisim). Bölgeleri tanımak için [bölge rehberlerine](/bolgeler), güncel ilanlar için [portföye](/portfoy) bakabilirsiniz.`,
  },
  {
    slug: "konut-kredisiyle-ev-alma-sureci",
    title: "Konut Kredisiyle Ev Alma Süreci Adım Adım",
    excerpt:
      "Ön onaydan tapu devrine kadar sürecin tamamı. Hangi adımda ne kadar beklersiniz, hangi belge kimden istenir?",
    coverUrl: "/uploads/blog/konut-kredisi.webp",
    tags: ["İlk Ev", "Rehber"],
    published: true,
    content: `Krediyle ev alırken en çok yaşanan sorun, sürecin sırasını bilmemekten kaynaklanır. İnsanlar önce eve âşık olup sonra krediyi araştırıyor; oysa doğru sıra tam tersi.

Aşağıdaki sıra, sahada işlerin gerçekte nasıl yürüdüğünü anlatıyor. Her adımda ne kadar bekleyeceğinizi ve hangi belgenin kimden isteneceğini de ekledim.

## 1. Önce ön onay alın, sonra ev bakın

En sık yapılan hata: beğenilen ev bulunduktan sonra kredi araştırmasına başlamak. Bankadan ön onay almadan pazarlık masasına oturmak, hem sizi hem satıcıyı belirsizlikte bırakır.

Ön onay, ne kadar kredi kullanabileceğinizi ve dolayısıyla gerçek bütçenizi netleştirir. Ayrıca satıcı gözünde ciddiyetinizi artırır — iki alıcı arasında kalan bir satıcı, ön onaylı olanı tercih eder.

Ön onay genellikle birkaç iş günü sürer ve sizi bağlamaz. Birden fazla bankadan almanız da mümkündür.

## 2. Kredi tutarını belirleyen iki sınır

Bankanın vereceği tutarı iki ayrı tavan belirler ve **hangisi düşükse o geçerlidir**:

- **Gelir sınırı:** Aylık taksit, belgelenen gelirinizin belirli bir oranını aşamaz. Mevcut kredi ve kredi kartı borçlarınız da bu hesaba girer.
- **Değer sınırı:** Banka, konutun ekspertiz değerinin tamamını değil, mevzuatla belirlenen oranını kredilendirir. Kalanı peşinat olarak sizden beklenir.

Bu oranlar mevzuatla değişir; işleme başlamadan bankadan güncel oranı yazılı olarak isteyin.

Taksitin bütçenize oturup oturmadığını görmek için [kredi hesaplayıcıyı](/kredi-hesaplama) kullanabilirsiniz — peşinat oranını ve vadeyi değiştirerek farklı senaryoları karşılaştırın.

## 3. Ekspertiz raporu

Banka, bağımsız bir eksper atar. Eksperin belirlediği değer, satış bedelinden düşük çıkabilir — bu durumda aradaki farkı nakit tamamlamanız gerekir.

Bu, sürecin en sık tıkandığı noktadır. 5.000.000 TL'ye anlaştığınız bir daireye eksper 4.600.000 TL değer biçtiyse, banka kredisini 4.600.000 üzerinden hesaplar; aradaki 400.000 TL tamamen sizin cebinizden çıkar.

Ekspertiz genellikle birkaç iş günü sürer. Raporda iskan, kat mülkiyeti ve yapı kayıt durumu da incelenir; sorunlu bir tapu bu aşamada ortaya çıkar.

## 4. Zorunlu ve isteğe bağlı sigortalar

DASK (Zorunlu Deprem Sigortası) kredi kullanımı için zorunludur. Bunun dışında bankalar konut sigortası ve hayat sigortası önerir.

Şunu net sorun: hangisi zorunlu, hangisi isteğe bağlı, ve yıllık maliyeti ne? Bu kalemler kredinin efektif maliyetini yükseltir ve teklifleri karşılaştırırken sık atlanır. İki bankanın faiz oranı aynıyken sigorta paketleri yüzünden toplam maliyet farklı çıkabilir.

## 5. Tapu randevusu ve devir

Kredi onayı çıktıktan sonra Tapu Müdürlüğü'nden randevu alınır. Devir günü:

- Alıcı ve satıcı (veya vekilleri) hazır bulunur
- Tapu harcı yatırılır
- Banka, kredi tutarını satıcının hesabına aktarır
- Tapu alıcı adına tescil edilir, ipotek işlenir

Tapu harcı oranı resmî olarak belirlenir ve dönem dönem değişir; işlem gününden önce güncel oranı teyit edin. Harcın taraflar arasında nasıl paylaşılacağı pazarlık konusudur — sözleşmede yazılı olsun.

**Önemli:** Tapuda beyan edilen değeri gerçek satış bedelinin altında göstermek yasal değildir ve alıcı aleyhine sonuç doğurur; ileride satarken değer artış kazancı vergisi yüksek hesaplanır.

## 6. Devirden sonra unutulanlar

- Elektrik, su, doğalgaz aboneliklerinin devri
- Emlak vergisi bildiriminin belediyeye yapılması
- Aidat kaydının yönetime bildirilmesi
- DASK poliçesinin kendi adınıza güncellenmesi

Bu adımlar atlanınca ilk faturalar eski malik adına gelir ve düzeltmesi zaman alır.

## Süreç ne kadar sürer?

Ön onaydan tapu devrine kadar, her şey yolunda giderse genellikle iki ila dört hafta. Tapuda şerh, eksik iskan veya ekspertiz farkı gibi bir sorun çıkarsa bu süre uzar.

| Adım | Tahmini süre |
| --- | --- |
| Ön onay | 1-3 iş günü |
| Ekspertiz | 2-5 iş günü |
| Kredi onayı | 2-5 iş günü |
| Tapu randevusu | Randevu yoğunluğuna göre |

---

Süreçte hangi adımda olduğunuzu kaybettiğinizi düşünüyorsanız [arayın](/iletisim); birlikte bakalım. Bütçenizi netleştirmek için [kredi hesaplayıcıya](/kredi-hesaplama), uygun ilanlar için [portföye](/portfoy) bakabilirsiniz.`,
  },
  {
    slug: "evinizi-satisa-hazirlarken",
    title: "Evinizi Satışa Hazırlarken Yapılacaklar",
    excerpt:
      "Satış süresini kısaltan şey fiyat indirimi değil, hazırlıktır. Fotoğraf çekiminden önce yapılması gereken sekiz iş.",
    coverUrl: "/uploads/blog/satisa-hazirlik.webp",
    tags: ["Satış", "Rehber"],
    published: true,
    content: `Bir ev ne kadar sürede satılır sorusunun cevabı çoğu zaman fiyatta değil, hazırlıkta saklı. Aynı daire, hazırlıklı ve hazırlıksız hâliyle iki farklı ürün gibi davranır.

Sahada gördüğüm şu: hazırlıksız çıkan ilanlar ilk haftalarda ilgi görmez, sonra fiyat indirilir, indirim de "bu evde bir sorun var" algısı yaratır. Oysa aynı eve çıkmadan önce birkaç gün ayırmak, hem süreyi hem de indirim ihtiyacını ortadan kaldırabilir.

## 1. Belgeleri önce toplayın

Tapu fotokopisi, iskan belgesi, DASK poliçesi, aidat borcu yoktur yazısı, varsa yapı kayıt belgesi ve enerji kimlik belgesi.

Alıcı ciddi olduğunda bu belgeleri günler içinde bulmaya çalışmak, pazarlık gücünüzü düşürür. Hazır bir dosya, alıcıda "bu satıcı işini biliyor" izlenimi yaratır ve süreci hızlandırır.

## 2. Küçük kusurları kapatın

Akan musluk, çalışmayan priz, kapanmayan dolap kapağı, çatlak fayans, gıcırdayan kapı.

Bunların maliyeti düşüktür ama alıcıda "bakımsız" algısı yaratır ve bu algı doğrudan fiyata yansır. Alıcı gördüğü her küçük kusuru zihninde büyütür: "Bunu bile yapmamışsa, görmediğim neler var?"

Bir günlük tamirat, çoğu zaman pazarlık masasında talep edilecek indirimin kat kat altındadır.

## 3. Eşyayı azaltın

Dolu bir ev, olduğundan küçük görünür. Fazla mobilyayı ve kişisel eşyayı azaltmak, dairenin gerçek metrekaresini ortaya çıkarır.

Özellikle şunları kaldırın: aile fotoğrafları, dolap üstlerindeki eşyalar, banyodaki kişisel bakım ürünleri, buzdolabı magnetleri. Alıcının kendini o evde hayal edebilmesi için evin biraz "nötr" olması gerekir.

## 4. Duvarları boyayın — nötr renkte

Bir dairede yapılabilecek en yüksek getirili tek işlem genellikle boyadır.

Renk seçiminde kendi zevkinizi değil, en geniş alıcı kitlesini düşünün: kırık beyaz ve açık gri tonları her mobilyaya uyar ve mekânı büyük gösterir. Koyu ya da iddialı renkler alıcının aklında "boyamam gerekecek" maliyeti oluşturur.

## 5. Temizlik, özellikle mutfak ve banyo

Alıcıların bu iki alana verdiği tepki, tüm evi değerlendirme biçimlerini etkiler. Derinlemesine temizlik, boyadan sonraki en yüksek getirili adımdır.

Ayrıntılar: fayans deriz, duş kabini kireci, fırın içi, dolap içleri (alıcılar açar), pencere camları. Koku da önemlidir — evi gezme öncesi havalandırın; ağır koku giderici kullanmak yerine kaynağı ortadan kaldırın.

## 6. Fotoğraf çekimi için gün ışığını bekleyin

Perdeleri açın, tüm lambaları yakın, çekimi günün en aydınlık saatinde yapın.

İnternette ilk elemeyi fotoğraf yapar; kötü fotoğraf, iyi bir daireyi hiç gösterilmeden eler. Alıcıların büyük çoğunluğu ilanı telefonundan görüyor ve karar birkaç saniyede veriliyor.

İlk fotoğraf en güçlü kare olmalı — genellikle salon ya da manzara. Karanlık, dağınık veya eğri çekilmiş bir ilk fotoğraf, ilanın geri kalanını kimseye izletmez.

## 7. Fiyatı bölge verisiyle belirleyin

Komşunun anlattığı rakam veya "şu kadar bekliyorum" duygusu değil; son üç ayda o bölgede gerçekten **satılmış** benzer dairelerin verisi.

Dikkat: ilanlardaki isteme fiyatları ile gerçekleşen satış fiyatları aynı değildir. Karşılaştırmayı satılanlar üzerinden yapın.

Yüksek başlayıp indirmek, ilanın "uzun süredir satılık" görünmesine yol açar ve pazarlık gücünüzü kalıcı olarak azaltır. Portallarda ilan yaşı görünür; alıcılar eski ilanlara daha düşük teklif verir.

## 8. Gezme saatlerini belirleyin

Alıcının rahat gezebildiği, evde kalabalık olmayan saatler seçin. Mümkünse evi aydınlık saatlerde gösterin.

Ev sahibinin sürekli konuştuğu gezmeler, alıcının evi kendi hayatına yerleştirmesini zorlaştırır. Soruları yanıtlayın ama alıcıya sessiz dolaşma alanı bırakın.

## Hazırlık kontrol listesi

| Adım | Tamam mı |
| --- | --- |
| Belgeler dosyalandı | |
| Küçük tamiratlar yapıldı | |
| Fazla eşya kaldırıldı | |
| Duvarlar boyandı | |
| Derin temizlik yapıldı | |
| Fotoğraflar gün ışığında çekildi | |
| Fiyat satılan emsallerle belirlendi | |
| Gezme saatleri planlandı | |

---

Evinizi satışa çıkarmadan önce bu listeyi birlikte geçmek isterseniz [bana ulaşın](/iletisim). Gerçekçi bir fiyat aralığı için [ücretsiz değerleme](/degerleme) alabilirsiniz.`,
  },
];
