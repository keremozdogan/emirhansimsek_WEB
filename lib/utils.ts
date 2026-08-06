import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const priceFormatter = new Intl.NumberFormat("tr-TR", {
  maximumFractionDigits: 0,
});

/** 4750000 → "4.750.000 ₺" */
export function formatPrice(value: number, currency = "TRY") {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₺";
  return `${priceFormatter.format(value)} ${symbol}`;
}

/** 4750000 → "4,75 Mn ₺" — dar alanlarda (kart rozetleri, grafikler) kullanılır */
export function formatPriceCompact(value: number, currency = "TRY") {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₺";
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} Mr ${symbol}`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} Mn ${symbol}`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toLocaleString("tr-TR", { maximumFractionDigits: 0 })} B ${symbol}`;
  }
  return `${priceFormatter.format(value)} ${symbol}`;
}

export function formatNumber(value: number) {
  return priceFormatter.format(value);
}

export function formatArea(value?: number | null) {
  if (!value) return null;
  return `${priceFormatter.format(value)} m²`;
}

export function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(value: Date | string) {
  return new Date(value).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const TR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

/** "Ataşehir'de Bahçeli Villa" → "atasehirde-bahceli-villa" */
export function slugify(input: string) {
  return input
    .trim()
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (ch) => TR_MAP[ch] ?? ch)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

/** Telefonu WhatsApp linki için normalize eder: "0532 123 45 67" → "905321234567" */
export function toWhatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("90")) return digits;
  if (digits.startsWith("0")) return `90${digits.slice(1)}`;
  return `90${digits}`;
}

export function whatsAppLink(phone: string, message?: string) {
  const base = `https://wa.me/${toWhatsAppNumber(phone)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** "0532 123 45 67" görünümüne çevirir */
export function formatPhone(phone: string) {
  // Hem "905321234567" hem de "0532 123 45 67" biçimini 10 haneye indirger.
  // Baştaki 0 kırpılmazsa 11 hane kalıyor ve fonksiyon sessizce girdiyi
  // olduğu gibi geri döndürüyordu — yani en yaygın yazım hiç biçimlenmiyordu.
  const d = phone.replace(/\D/g, "").replace(/^90/, "").replace(/^0/, "");
  if (d.length !== 10) return phone;
  return `0${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
}

/** JSON string alanlarını (highlights, tags) güvenle diziye çevirir */
export function parseJsonArray(value?: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function readingTime(markdown: string) {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/** İki tarih arasındaki gün farkı */
export function daysBetween(a: Date | string, b: Date | string) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

/** Aylık faizle eşit taksitli kredi hesabı */
export function calculateMortgage(
  principal: number,
  monthlyRatePercent: number,
  termMonths: number,
) {
  if (principal <= 0 || termMonths <= 0) {
    return { monthlyPayment: 0, totalPayment: 0, totalInterest: 0 };
  }
  const r = monthlyRatePercent / 100;
  const monthlyPayment =
    r === 0
      ? principal / termMonths
      : (principal * r * Math.pow(1 + r, termMonths)) /
        (Math.pow(1 + r, termMonths) - 1);
  const totalPayment = monthlyPayment * termMonths;
  return {
    monthlyPayment,
    totalPayment,
    totalInterest: totalPayment - principal,
  };
}
