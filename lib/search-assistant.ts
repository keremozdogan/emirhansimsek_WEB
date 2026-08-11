/**
 * İlan arama asistanının dil çözümleyicisi.
 *
 * ANAHTARSIZ: Hiçbir dil modeline veya dış servise istek atmaz. Türkçe bir
 * cümleyi kural tabanlı olarak `/portfoy` sayfasının zaten kullandığı filtre
 * parametrelerine çevirir. Böylece asistanın bulduğu sonuç ile filtrelerden
 * elle seçilen sonuç aynı sorgudan gelir — iki ayrı arama mantığı oluşmaz.
 *
 * Tasarım ilkesi: ASLA sessizce tahmin etme. Çözümleyici anladığı her ölçütü
 * `understood`, çözemediği kelimeleri `leftover` içinde döndürür; arayüz
 * ikisini de kullanıcıya gösterir. "3+1 kiralık" yazan birine sessizce satılık
 * daire listelemek, hiç sonuç göstermemekten daha kötüdür.
 */

import { PROPERTY_CATEGORIES, SERVED_DISTRICTS } from "@/lib/constants";

export type ParsedFilters = {
  listingType?: "SALE" | "RENT";
  category?: (typeof PROPERTY_CATEGORIES)[number];
  rooms?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
};

export type ParseResult = {
  filters: ParsedFilters;
  /** Kullanıcıya "şunu anladım" diye gösterilecek maddeler */
  understood: string[];
  /** Hiçbir kurala uymayan kelimeler */
  leftover: string[];
};

/**
 * Türkçe küçük harfe çevirir.
 *
 * `toLowerCase()` tek başına yetmez: "I" harfi Türkçede "ı" olur, JavaScript ise
 * "i" yapar. "ISPARTA" → "isparta" yerine "ısparta" olmalı. Ayrıca eşleştirmeyi
 * kolaylaştırmak için aksanlar sadeleştirilir, böylece "çekmeköy" ile "cekmekoy"
 * aynı kabul edilir.
 */
export function normalize(input: string): string {
  return input
    .replace(/I/g, "ı")
    .replace(/İ/g, "i")
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/â/g, "a");
}

const LISTING_TYPE_WORDS: Array<[RegExp, "SALE" | "RENT", string]> = [
  [/\bkiralik\b|\bkirali\b|\bkira\b|\bkiraya\b/, "RENT", "Kiralık"],
  [/\bsatilik\b|\bsatlik\b|\bsatin\b|\bsatis\b|\balmak\b|\balacak\b/, "SALE", "Satılık"],
];

const CATEGORY_WORDS: Array<
  [RegExp, (typeof PROPERTY_CATEGORIES)[number], string]
> = [
  [/\bdaire\b|\bkonut\b|\bev\b|\bevi\b|\bapartman dairesi\b/, "APARTMENT", "Daire"],
  [/\bvilla\b|\bmustakil\b/, "VILLA", "Villa"],
  [/\bofis\b|\bburo\b|\bbüro\b|\bis ?yeri\b/, "OFFICE", "Ofis"],
  [/\bdukkan\b|\bmagaza\b|\bticari\b/, "SHOP", "İş yeri"],
  [/\barsa\b|\btarla\b|\bimarli\b/, "LAND", "Arsa"],
  [/\bbina\b|\bkomple bina\b/, "BUILDING", "Bina"],
];

/** "3+1", "2 + 1", "3artı1" gibi yazımlar; "stüdyo" 1+0 sayılır. */
function parseRooms(text: string): { value: string; label: string } | null {
  if (/\bstudyo\b|\bstüdyo\b/.test(text)) {
    return { value: "1+0", label: "1+0 (stüdyo)" };
  }
  const match = text.match(/(\d)\s*(?:\+|arti|artı)\s*(\d)/);
  if (!match) return null;
  const value = `${match[1]}+${match[2]}`;
  return { value, label: `${value} oda` };
}

const UNIT_MULTIPLIER: Record<string, number> = {
  bin: 1_000,
  milyon: 1_000_000,
  milyar: 1_000_000_000,
};

/**
 * "2 ile 4 milyon", "2-4 milyon", "3 ila 5 milyon arası" gibi aralıkları yakalar.
 *
 * Ayrı ele alınmasının sebebi: bu yazımda İLK sayının kendi birimi yoktur,
 * birimi ikinciden ödünç alır. Sayıları tek tek tarayan `findAmounts` "2"yi
 * birimsiz ve 1000'den küçük gördüğü için eliyor, geriye yalnızca üst sınır
 * kalıyordu — kullanıcı aralık yazmasına rağmen alt sınır sessizce düşüyordu.
 */
function findRange(text: string): { min: number; max: number } | null {
  const match = text.match(
    /(\d+(?:[.,]\d+)*)\s*(?:ile|ila|-|–|—)\s*(\d+(?:[.,]\d+)*)\s*(milyon|milyar|bin)/,
  );
  if (!match) return null;

  const [, rawLow, rawHigh, unit] = match;
  const multiplier = UNIT_MULTIPLIER[unit];
  if (!multiplier) return null;

  const toNumber = (raw: string) =>
    Number(raw.replace(/\./g, "").replace(",", ".")) * multiplier;

  const low = toNumber(rawLow);
  const high = toNumber(rawHigh);
  if (!Number.isFinite(low) || !Number.isFinite(high)) return null;

  return { min: Math.min(low, high), max: Math.max(low, high) };
}

/**
 * "5 milyon", "500 bin", "5,5 milyon", "4.250.000" gibi yazımları sayıya çevirir.
 * Bulunan her sayıyı, cümledeki konumuyla birlikte döndürür — sınır kelimesinin
 * (en fazla / en az) hangi sayıya ait olduğunu anlamak için konum gerekiyor.
 */
function findAmounts(text: string): Array<{ value: number; index: number }> {
  const out: Array<{ value: number; index: number }> = [];
  const pattern =
    /(\d+(?:[.,]\d+)*)\s*(milyon|milyar|bin)?/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const [, rawNumber, unit] = match;
    if (!rawNumber) continue;

    let value: number;
    if (unit) {
      // "5,5 milyon" → ondalık ayırıcı virgül
      value = Number(rawNumber.replace(/\./g, "").replace(",", "."));
      if (!Number.isFinite(value)) continue;
      if (unit === "bin") value *= 1_000;
      else if (unit === "milyon") value *= 1_000_000;
      else if (unit === "milyar") value *= 1_000_000_000;
    } else {
      // Birimsiz sayı ancak binlik ayraçlıysa fiyat sayılır: 4.250.000
      if (!/\d{1,3}(?:[.]\d{3})+/.test(rawNumber)) continue;
      value = Number(rawNumber.replace(/\./g, ""));
      if (!Number.isFinite(value)) continue;
    }

    // Oda sayısı, metrekare ve yıl gibi küçük sayılar fiyat değildir
    if (value < 1000) continue;
    out.push({ value, index: match.index });
  }
  return out;
}

const MAX_WORDS = /\ben fazla\b|\bkadar\b|\baltinda\b|\bmaksimum\b|\bmax\b|\basmayan\b|\bgecmeyen\b/;
const MIN_WORDS = /\ben az\b|\buzeri\b|\bustunde\b|\bminimum\b|\bmin\b|\bbaslayan\b|\byukari\b/;

function formatPrice(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value) + " TL";
}

export function parseQuery(input: string): ParseResult {
  const text = normalize(input);
  const filters: ParsedFilters = {};
  const understood: string[] = [];
  /** Anlaşılan parçalar buradan silinir; kalanı `leftover` olur. */
  let remaining = ` ${text} `;

  const consume = (pattern: RegExp) => {
    remaining = remaining.replace(new RegExp(pattern.source, "g"), " ");
  };

  for (const [pattern, value, label] of LISTING_TYPE_WORDS) {
    if (pattern.test(text)) {
      filters.listingType = value;
      understood.push(label);
      consume(pattern);
      break;
    }
  }

  for (const [pattern, value, label] of CATEGORY_WORDS) {
    if (pattern.test(text)) {
      filters.category = value;
      understood.push(label);
      consume(pattern);
      break;
    }
  }

  const rooms = parseRooms(text);
  if (rooms) {
    filters.rooms = rooms.value;
    understood.push(rooms.label);
    remaining = remaining.replace(/(\d)\s*(?:\+|arti|artı)\s*(\d)/g, " ");
    consume(/\bstudyo\b/);
  }

  // İlçe: en uzun eşleşme kazanır ("küçükçekmece" ile "çekmeköy" karışmasın)
  const districts = [...SERVED_DISTRICTS.ANADOLU, ...SERVED_DISTRICTS.AVRUPA]
    .map((name) => ({ name, key: normalize(name) }))
    .sort((a, b) => b.key.length - a.key.length);

  for (const district of districts) {
    if (remaining.includes(district.key)) {
      filters.district = district.name;
      understood.push(district.name);
      remaining = remaining.split(district.key).join(" ");
      break;
    }
  }

  // Metrekare
  const areaMatch = text.match(/(\d{2,4})\s*(?:m2|m²|metre|metrekare)/);
  if (areaMatch) {
    filters.minArea = Number(areaMatch[1]);
    understood.push(`${areaMatch[1]} m² ve üzeri`);
    remaining = remaining.replace(/(\d{2,4})\s*(?:m2|m²|metre|metrekare)/g, " ");
  }

  // Fiyat — önce aralık kalıbı, sonra tekil sayılar
  const range = findRange(text);
  const amounts = findAmounts(text);
  if (range) {
    filters.minPrice = range.min;
    filters.maxPrice = range.max;
    understood.push(
      `${formatPrice(range.min)} – ${formatPrice(range.max)} arası`,
    );
  } else if (amounts.length >= 2) {
    const sorted = [...amounts].sort((a, b) => a.value - b.value);
    filters.minPrice = sorted[0].value;
    filters.maxPrice = sorted[sorted.length - 1].value;
    understood.push(
      `${formatPrice(filters.minPrice)} – ${formatPrice(filters.maxPrice)} arası`,
    );
  } else if (amounts.length === 1) {
    const amount = amounts[0];
    const before = text.slice(0, amount.index);
    const after = text.slice(amount.index);

    const saysMin = MIN_WORDS.test(before) || MIN_WORDS.test(after);
    const saysMax = MAX_WORDS.test(before) || MAX_WORDS.test(after);

    if (saysMin && !saysMax) {
      filters.minPrice = amount.value;
      understood.push(`${formatPrice(amount.value)} ve üzeri`);
    } else {
      // Açıkça üst sınır denmişse ya da hiçbir sınır kelimesi yoksa üst sınır
      // varsayılır: "3 milyonluk ev" arayan biri bütçesini söylüyordur.
      filters.maxPrice = amount.value;
      understood.push(`${formatPrice(amount.value)} ve altı`);
    }
  }

  if (range || amounts.length > 0) {
    remaining = remaining.replace(
      /(\d+(?:[.,]\d+)*)\s*(milyon|milyar|bin)?/g,
      " ",
    );
  }

  const STOP_WORDS = new Set([
    "bir","ve","ile","icin","bana","bize","lazim","arıyorum","ariyorum","istiyorum",
    "var","mi","mı","musun","misin","lutfen","tl","lira","fiyat","fiyati","butce",
    "butcem","arasi","arasinda","en","fazla","az","kadar","altinda","ustunde",
    "uzeri","maksimum","minimum","max","min","olsun","olan","yerde","bolgede",
    "civarinda","yakininda","tane","adet","merhaba","selam","acaba","de","da",
    "ki","bu","su","o","ama","veya","ya","the","sey","tarafta","yakasinda",
    "ustu","alti","asagi","ila","yaklasik","civari","kadarlik","luk","lik",
  ]);

  const leftover = remaining
    .split(/[^a-z0-9+]+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  return { filters, understood, leftover: [...new Set(leftover)] };
}

/** Çözümlenen filtreleri `/portfoy` sayfasının anladığı sorgu dizesine çevirir. */
export function filtersToSearchParams(filters: ParsedFilters): string {
  const params = new URLSearchParams();
  if (filters.listingType) params.set("listingType", filters.listingType);
  if (filters.category) params.set("category", filters.category);
  if (filters.rooms) params.set("rooms", filters.rooms);
  if (filters.district) params.set("q", filters.district);
  if (filters.minPrice) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice) params.set("maxPrice", String(filters.maxPrice));
  return params.toString();
}
