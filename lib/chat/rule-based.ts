import "server-only";

import { prisma } from "@/lib/db";
import { LISTING_TYPE_LABELS } from "@/lib/constants";
import { getProfile } from "@/lib/queries";
import {
  filtersToSearchParams,
  normalize,
  parseQuery,
} from "@/lib/search-assistant";
import { whatsAppLink } from "@/lib/utils";

/**
 * Anahtarsız sohbet motoru.
 *
 * Hiçbir dil modeline ya da dış servise istek atmaz: ne API anahtarı, ne kota,
 * ne de yurt dışına veri aktarımı. İki parçası var:
 *
 *   1. SSS kalıpları — süreç, komisyon, iletişim gibi cevabı sabit sorular
 *   2. `parseQuery` — cümleden ilçe/oda/bütçe çıkarıp veritabanında ilan arar
 *
 * Sınırı açık: yalnızca öngörülen kalıpları anlar. Anlamadığında uydurmaz,
 * WhatsApp'a yönlendirir — emlakta ziyaretçinin zaten istediği şey odur.
 * "Anlamadım" deyip yol göstermek, yanlış cevap vermekten iyidir.
 */

export type ChatReply = { text: string };

/** Normalize edilmiş metinde kelimelerden biri geçiyor mu */
function has(text: string, ...words: string[]): boolean {
  return words.some((word) => text.includes(normalize(word)));
}

function formatPrice(price: number, currency: string): string {
  return `${new Intl.NumberFormat("tr-TR").format(price)} ${currency === "TRY" ? "TL" : currency}`;
}

/** Her yanıtın sonuna eklenen WhatsApp çağrısı */
function whatsappCta(whatsapp: string, message: string): string {
  return `\n\n[💬 WhatsApp'tan Emirhan'a yazın](${whatsAppLink(whatsapp, message)})`;
}

export async function answerWithRules(input: string): Promise<ChatReply> {
  const raw = input.trim().slice(0, 1000);
  const text = normalize(raw);
  const profile = await getProfile();
  const wa = profile.whatsapp;

  if (text.length === 0) {
    return { text: "Buyurun, nasıl yardımcı olabilirim?" };
  }

  // --- Selamlama ve nezaket -------------------------------------------------
  if (has(text, "merhaba", "selam", "gunaydin", "iyi gunler", "iyi aksamlar", "alo", "hey")) {
    return {
      text: `Merhaba! ${profile.fullName}'in portföyü, bölgeler ve satış süreci hakkında sorularınızı yanıtlayabilirim. Ne aramıştınız?`,
    };
  }

  if (has(text, "tesekkur", "sagol", "eyvallah", "sag ol")) {
    return {
      text: `Rica ederim. Başka bir sorunuz olursa buradayım.${whatsappCta(wa, "Merhaba, bilgi almak istiyorum.")}`,
    };
  }

  if (has(text, "gorusuruz", "hosca kal", "iyi geceler", "bay bay")) {
    return { text: "Görüşmek üzere! İyi günler dilerim." };
  }

  // --- İletişim -------------------------------------------------------------
  if (has(text, "iletisim", "telefon", "numara", "ulas", "ara", "mail", "eposta", "e-posta", "randevu", "gorusme", "adres", "ofis nerede")) {
    return {
      text:
        `**${profile.fullName}** — ${profile.title}\n\n` +
        `📞 **Telefon:** ${profile.phone}\n` +
        `✉️ **E-posta:** ${profile.email}\n` +
        `📍 **Adres:** ${profile.address}\n\n` +
        `Dilerseniz [iletişim formunu](/iletisim) da doldurabilirsiniz.` +
        whatsappCta(wa, "Merhaba, sizinle görüşmek istiyorum."),
    };
  }

  // --- Değerleme ------------------------------------------------------------
  if (has(text, "degerleme", "evimin degeri", "kac eder", "fiyat bicme", "ekspertiz", "evimi satmak", "satmak istiyorum")) {
    return {
      text:
        "Evinizin güncel değerini ücretsiz öğrenebilirsiniz. Birkaç soruya yanıt veriyorsunuz, Emirhan bölgedeki güncel satışlarla karşılaştırıp gerçekçi bir aralık paylaşıyor — hiçbir yükümlülük yok.\n\n" +
        "[Ücretsiz değerleme formu →](/degerleme)" +
        whatsappCta(wa, "Merhaba, evimi değerletmek istiyorum."),
    };
  }

  // --- Süreç ----------------------------------------------------------------
  if (has(text, "surec", "nasil calis", "nasil isliyor", "asama", "adim", "ne yapiyorsun", "hizmet")) {
    return {
      text:
        "Satış süreci altı adımda ilerliyor:\n\n" +
        "1. **Yerinde değerleme** — evi görüp bölgedeki güncel satışlarla karşılaştırma\n" +
        "2. **Hazırlık ve sahneleme** — algılanan değeri yükselten düşük maliyetli dokunuşlar\n" +
        "3. **Profesyonel çekim** — fotoğraf ve video turu\n" +
        "4. **Hedefli pazarlama** — önce kendi alıcı listesi, sonra portallar ve RE/MAX ağı\n" +
        "5. **Görüşme ve pazarlık** — randevuları Emirhan yönetir\n" +
        "6. **Sözleşme ve tapu** — abonelik devirleri dahil, taşınana kadar takip\n\n" +
        "Ayrıntısı [ana sayfada](/) anlatılıyor." +
        whatsappCta(wa, "Merhaba, satış süreci hakkında bilgi almak istiyorum."),
    };
  }

  // --- Komisyon / ücret -----------------------------------------------------
  if (has(text, "komisyon", "ucret ne kadar", "yuzde kac", "masraf", "maliyet", "para aliyor")) {
    return {
      text:
        "Komisyon oranı hizmetin kapsamına ve gayrimenkulün durumuna göre belirleniyor; tek bir rakam vermek doğru olmaz. Emirhan görüşmede net olarak paylaşıyor — sürpriz kalem olmuyor." +
        whatsappCta(wa, "Merhaba, komisyon oranınızı öğrenmek istiyorum."),
    };
  }

  // --- Bölgeler -------------------------------------------------------------
  if (has(text, "hangi bolge", "nerede calis", "hangi ilce", "bolgeler", "hizmet alani", "yaka")) {
    return {
      text:
        "Emirhan İstanbul'un her iki yakasında da hizmet veriyor; portföyü ise ağırlıklı olarak Anadolu yakasında yoğunlaşıyor.\n\n" +
        "[Bölge rehberlerine göz atın →](/bolgeler)" +
        whatsappCta(wa, "Merhaba, bölgeler hakkında bilgi almak istiyorum."),
    };
  }

  // --- KVKK -----------------------------------------------------------------
  if (has(text, "kvkk", "kisisel veri", "gizlilik", "verilerim", "cerez")) {
    return {
      text:
        "Kişisel verilerinizin nasıl işlendiğini [KVKK aydınlatma metninde](/kvkk) ayrıntılı bulabilirsiniz. Çerezler için [çerez politikası](/cerez-politikasi).",
    };
  }

  // --- İlan arama -----------------------------------------------------------
  const { filters, understood } = parseQuery(raw);
  const searched = Object.keys(filters).length > 0;
  const soundsLikeSearch =
    searched ||
    has(text, "ilan", "daire", "ev", "villa", "dukkan", "arsa", "ofis", "portfoy", "satilik", "kiralik", "ariyorum", "bakiyorum");

  if (soundsLikeSearch) {
    const where: Record<string, unknown> = {
      published: true,
      status: { in: ["ACTIVE", "RESERVED"] },
    };
    if (filters.listingType) where.listingType = filters.listingType;
    if (filters.category) where.category = filters.category;
    if (filters.rooms) where.rooms = filters.rooms;
    if (filters.district) where.district = { contains: filters.district };
    if (filters.minArea) where.grossArea = { gte: filters.minArea };
    const price: Record<string, number> = {};
    if (filters.minPrice) price.gte = filters.minPrice;
    if (filters.maxPrice) price.lte = filters.maxPrice;
    if (Object.keys(price).length > 0) where.price = price;

    const properties = await prisma.property.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        slug: true,
        title: true,
        price: true,
        currency: true,
        rooms: true,
        grossArea: true,
        district: true,
      },
    });

    if (properties.length > 0) {
      const lines = properties.map((property) => {
        const details = [
          property.rooms,
          property.grossArea ? `${property.grossArea} m²` : null,
          property.district,
        ]
          .filter(Boolean)
          .join(" · ");
        return `* **[${property.title}](/portfoy/${property.slug})**\n  ${formatPrice(property.price, property.currency)} — ${details}`;
      });

      const query = filtersToSearchParams(filters);
      const allLink = query ? `/portfoy?${query}` : "/portfoy";
      const criteria =
        understood.length > 0 ? `**${understood.join(" · ")}** için ` : "";

      return {
        text:
          `${criteria}bulduklarım:\n\n${lines.join("\n")}\n\n` +
          `[Tüm sonuçları görün →](${allLink})` +
          whatsappCta(wa, "Merhaba, ilanlarınız hakkında bilgi almak istiyorum."),
      };
    }

    /**
     * Sonuç yoksa portföyün GERÇEK dağılımını gösteriyoruz. Ziyaretçiye
     * olmayan bir ilçeyi önermektense elde ne varsa onu söylemek doğru.
     */
    const byDistrict = await prisma.property.groupBy({
      by: ["district", "listingType"],
      where: { published: true, status: { in: ["ACTIVE", "RESERVED"] } },
      _count: { _all: true },
    });

    const summary = byDistrict
      .map(
        (row) =>
          `* ${row.district} — ${row._count._all} ${LISTING_TYPE_LABELS[row.listingType as "SALE" | "RENT"].toLowerCase()} ilan`,
      )
      .join("\n");

    return {
      text:
        "Bu ölçütlere uyan bir ilan portföyde şu an yok. Elimdekiler:\n\n" +
        `${summary}\n\n[Tüm portföyü görün →](/portfoy)\n\n` +
        "Aradığınızı bulamadıysanız Emirhan'a yazın — portföy dışı seçenekleri ve RE/MAX ağını da tarayabilir." +
        whatsappCta(wa, `Merhaba, ${raw.slice(0, 120)} arıyorum.`),
    };
  }

  // --- Anlaşılmadı ----------------------------------------------------------
  return {
    text:
      "Bunu tam anlayamadım. Şunları sorabilirsiniz:\n\n" +
      "* *\"Çekmeköy'de satılık 3+1 var mı?\"*\n" +
      "* *\"Kiralık dükkan arıyorum\"*\n" +
      "* *\"Ev satış süreci nasıl işliyor?\"*\n" +
      "* *\"Evimin değerini öğrenmek istiyorum\"*\n\n" +
      "Sorunuz bunların dışındaysa en hızlısı doğrudan Emirhan'a yazmak:" +
      whatsappCta(wa, `Merhaba, ${raw.slice(0, 120)}`),
  };
}
