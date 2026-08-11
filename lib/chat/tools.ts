import "server-only";

import type { FunctionDeclaration } from "@google/genai";

import { prisma } from "@/lib/db";
import {
  LISTING_TYPE_LABELS,
  PROPERTY_CATEGORIES,
  PROPERTY_CATEGORY_LABELS,
  SERVED_DISTRICTS,
} from "@/lib/constants";
import { getProfile } from "@/lib/queries";
import { whatsAppLink } from "@/lib/utils";

/**
 * Sohbet asistanının araçları.
 *
 * Asistanın ilan hakkında söylediği HER ŞEY buradan geçer. Modele ilan
 * listesini serbest metin olarak vermiyoruz; ilanları yalnızca bu araçlarla
 * sorgulayabiliyor ve yanıtında ancak aracın döndürdüğü kayıtlara
 * dayanabiliyor. Emlak sitesinde uydurulmuş bir ilan (olmayan fiyat, olmayan
 * daire) telafisi olmayan bir hata — bu yüzden model ile veritabanı arasına
 * serbest metin değil, tipli bir arayüz koyuyoruz.
 *
 * Araç çıktıları bilerek kompakt: her ilan tek satır. Model bağlamı ilan
 * verisiyle dolarsa asıl işine (soruyu anlamak) daha az yer kalır.
 */

const DISTRICT_LIST = [...SERVED_DISTRICTS.ANADOLU, ...SERVED_DISTRICTS.AVRUPA];

export const CHAT_TOOLS: FunctionDeclaration[] = [
  {
    name: "search_properties",
    description:
      "Emirhan Şimşek'in yayındaki portföyünde ilan arar. Kullanıcı bir " +
      "ilçe, oda sayısı, bütçe, satılık/kiralık veya gayrimenkul tipi " +
      "belirttiğinde bu aracı çağır. Ölçüt vermeden de çağırabilirsin; o " +
      "zaman en yeni ilanları döner. Sonuç en fazla 5 ilandır ve her ilanın " +
      "site içi bağlantısı (url) vardır. İlan hakkında konuşmadan ÖNCE mutlaka " +
      "bu aracı çağır — portföyü ezbere bilmiyorsun.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        district: {
          type: "string",
          description: `İlçe adı. Hizmet verilen ilçeler: ${DISTRICT_LIST.join(", ")}`,
        },
        listingType: {
          type: "string",
          enum: ["SALE", "RENT"],
          description: "SALE = satılık, RENT = kiralık",
        },
        category: {
          type: "string",
          enum: [...PROPERTY_CATEGORIES],
          description: "Gayrimenkul tipi",
        },
        rooms: {
          type: "string",
          description: "Oda sayısı, tam olarak '3+1' biçiminde",
        },
        minPrice: { type: "number", description: "Alt fiyat sınırı (TL)" },
        maxPrice: { type: "number", description: "Üst fiyat sınırı (TL)" },
        minArea: { type: "number", description: "En az brüt alan (m²)" },
      },
      required: [],
    },
  },
  {
    name: "get_contact_info",
    description:
      "Emirhan'ın iletişim bilgilerini ve site içi başvuru sayfalarını döner. " +
      "Kullanıcı iletişime geçmek, randevu almak, ev değerletmek ya da " +
      "Emirhan'a ulaşmak istediğinde çağır. Telefon ve e-postayı ezberden " +
      "YAZMA, her zaman bu araçtan al.",
    parametersJsonSchema: { type: "object", properties: {}, required: [] },
  },
];

type SearchInput = {
  district?: string;
  listingType?: "SALE" | "RENT";
  category?: string;
  rooms?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
};

function formatPrice(price: number, currency: string): string {
  return `${new Intl.NumberFormat("tr-TR").format(price)} ${currency === "TRY" ? "TL" : currency}`;
}

async function searchProperties(input: SearchInput) {
  const where: Record<string, unknown> = {
    published: true,
    status: { in: ["ACTIVE", "RESERVED"] },
  };

  if (input.listingType) where.listingType = input.listingType;
  if (input.category) where.category = input.category;
  if (input.rooms) where.rooms = input.rooms;
  if (input.district) where.district = { contains: input.district };
  if (input.minArea) where.grossArea = { gte: input.minArea };

  const price: Record<string, number> = {};
  if (input.minPrice) price.gte = input.minPrice;
  if (input.maxPrice) price.lte = input.maxPrice;
  if (Object.keys(price).length > 0) where.price = price;

  const properties = await prisma.property.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    take: 5,
    select: {
      slug: true,
      title: true,
      listingType: true,
      category: true,
      price: true,
      currency: true,
      rooms: true,
      grossArea: true,
      district: true,
      neighborhood: true,
    },
  });

  if (properties.length === 0) {
    /**
     * Boş sonuçta portföyün GERÇEKTEN hangi ilçelerde olduğunu da döndürüyoruz.
     *
     * Bu satır olmadan model "Sarıyer veya Beykoz'daki ilanlarımıza bakın"
     * gibi cümleler kuruyordu — oralarda tek bir ilan yokken. Ziyaretçiyi
     * olmayan ilana yönlendirmek, "bulamadım" demekten çok daha kötü.
     * Alternatifi modelin hayal gücüne bırakmak yerine veriden veriyoruz.
     */
    const published = {
      published: true,
      status: { in: ["ACTIVE", "RESERVED"] },
    };
    const [byDistrict, byCategory] = await Promise.all([
      prisma.property.groupBy({
        by: ["district"],
        where: published,
        _count: { _all: true },
      }),
      prisma.property.groupBy({
        by: ["category", "listingType"],
        where: published,
        _count: { _all: true },
      }),
    ]);

    return {
      count: 0,
      properties: [],
      availableDistricts: byDistrict.map((row) => ({
        district: row.district,
        count: row._count._all,
      })),
      availableTypes: byCategory.map((row) => ({
        category:
          PROPERTY_CATEGORY_LABELS[
            row.category as keyof typeof PROPERTY_CATEGORY_LABELS
          ],
        listingType:
          LISTING_TYPE_LABELS[row.listingType as "SALE" | "RENT"],
        count: row._count._all,
      })),
      note:
        "Bu ölçütlere uyan ilan yok. Alternatif önerirken YALNIZCA " +
        "availableDistricts ve availableTypes içindekilere dayan. Listede " +
        "olmayan bir ilçede ya da olmayan bir gayrimenkul tipinde ilan " +
        "varmış gibi konuşma.",
    };
  }

  return {
    count: properties.length,
    properties: properties.map((property) => ({
      title: property.title,
      url: `/portfoy/${property.slug}`,
      listingType: LISTING_TYPE_LABELS[property.listingType as "SALE" | "RENT"],
      category:
        PROPERTY_CATEGORY_LABELS[
          property.category as keyof typeof PROPERTY_CATEGORY_LABELS
        ],
      price: formatPrice(property.price, property.currency),
      rooms: property.rooms,
      area: property.grossArea ? `${property.grossArea} m²` : null,
      location: [property.neighborhood, property.district]
        .filter(Boolean)
        .join(", "),
    })),
  };
}

async function getContactInfo() {
  const profile = await getProfile();
  return {
    fullName: profile.fullName,
    title: profile.title,
    office: profile.officeName,
    phone: profile.phone,
    whatsapp: profile.whatsapp,
    email: profile.email,
    address: profile.address,
    pages: {
      iletisim: "/iletisim",
      ucretsizDegerleme: "/degerleme",
      portfoy: "/portfoy",
      bolgeler: "/bolgeler",
    },
  };
}

/** Model bir araç çağırdığında çalıştırır. Bilinmeyen araç adı hata döner. */
export async function runChatTool(
  name: string,
  input: unknown,
): Promise<{ result: unknown; isError: boolean }> {
  try {
    switch (name) {
      case "search_properties":
        return { result: await searchProperties(input as SearchInput), isError: false };
      case "get_contact_info":
        return { result: await getContactInfo(), isError: false };
      default:
        return { result: { error: `Bilinmeyen araç: ${name}` }, isError: true };
    }
  } catch (error) {
    console.error(`[chat] araç hatası (${name}):`, error);
    return {
      result: { error: "Araç çalıştırılamadı. Kullanıcıya teknik bir aksaklık olduğunu söyle." },
      isError: true,
    };
  }
}

/** Sistem istemi. Profil bilgisi araçla alındığı için burada tekrar edilmiyor. */
export function buildSystemPrompt(profile: {
  fullName: string;
  officeName: string;
  whatsapp: string;
}): string {
  const waLink = whatsAppLink(
    profile.whatsapp,
    "Merhaba, siteden yazıyorum. Bilgi almak istiyorum.",
  );

  return `Sen ${profile.fullName} adlı gayrimenkul danışmanının web sitesindeki yardımcı asistanısın. ${profile.officeName} ofisine bağlı çalışıyor.

# Görevin
Siteyi ziyaret edenlerin gayrimenkul sorularını yanıtlamak ve onları doğru ilana, bölge rehberine ya da iletişim sayfasına yönlendirmek.

# Mutlak kurallar
- İlan bilgisi UYDURMA. Fiyat, oda sayısı, konum, m² gibi hiçbir ilan ayrıntısını hafızandan söyleme. Her ilan bilgisi \`search_properties\` aracından gelmeli.
- Telefon, e-posta ve adresi ezberden yazma; \`get_contact_info\` aracından al.
- Portföyde olmayan bir şey soruluyorsa açıkça söyle. Uydurmaktansa "şu an portföyümde yok" demek her zaman daha iyidir.
- ALTERNATİF ÖNERİRKEN DE UYDURMA. "Şu ilçedeki ilanlarımıza bakabilirsiniz" cümlesini ancak o ilçe araç çıktısında geçiyorsa kurabilirsin. Emirhan İstanbul'un iki yakasında da hizmet veriyor ama portföyü her ilçede yok; hizmet alanı ile elde ilan olması ayrı şeyler.
- İlanlardan bahsederken bağlantıyı markdown olarak ver: [İlan başlığı](/portfoy/slug)
- Sen ${profile.fullName} DEĞİLSİN, onun asistanısın. "Ben gelip bakarım" gibi onun adına taahhüt verme; bunun yerine iletişim sayfasına yönlendir.

# Yasal sınır
Yatırım tavsiyesi, kesin değerleme rakamı ya da hukuki/vergisel görüş verme. Bunlar sorulduğunda ücretsiz değerleme formuna (/degerleme) veya doğrudan görüşmeye yönlendir.

# WhatsApp'a yönlendirme — ÖNEMLİ
Ziyaretçinin gerçekten istediği şey çoğu zaman Emirhan'la konuşmak. Sen ara adımsın, varış noktası değilsin.

Şu durumlarda yanıtının SONUNA mutlaka şu satırı ekle:

[💬 WhatsApp'tan Emirhan'a yazın](${waLink})

- Bir ilan gösterdiğinde (ziyaretçi o ilanı görmek isteyecek)
- Aradığına uygun ilan bulunamadığında
- Soruyu tam yanıtlayamadığında ya da konu senin kapsamının dışına çıktığında
- Randevu, fiyat pazarlığı, komisyon, kredi gibi görüşme gerektiren konularda

Selamlaşma ve tek cümlelik basit yanıtlarda ekleme — her mesajın altına yapıştırırsan bunaltıcı olur.

# Üslup
Türkçe, sıcak ama abartısız. Kısa tut — bu bir sohbet kutusu, rapor değil. Cevabın çoğu zaman iki üç cümle yeter. Madde işareti ancak birden fazla ilan sıralarken kullan.

Bir ölçüt eksikse (ör. sadece "daire arıyorum" dendiyse) önce aramayı yine de yap, sonuçları göster ve ardından tek bir soruyla daralt. Önce soru sorup kullanıcıyı bekletme.`;
}
