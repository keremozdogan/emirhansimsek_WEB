import "server-only";

import { MORTGAGE_DEFAULTS } from "@/lib/constants";

/**
 * Hesaplayıcının başlangıç faiz oranı.
 *
 * Oran koda gömülü bir sabitti: nereden geldiği ve ne zaman yazıldığı belli
 * değildi, güncellemek için kod değişikliği gerekiyordu. Zamanla sessizce
 * yanlışa dönen tam olarak böyle sayılardır.
 *
 * Artık ortam değişkeninden okunuyor ve yanında tarihi taşınıyor. Değer
 * `NEXT_PUBLIC_` DEĞİL: o önek derleme anında koda gömülür ve değiştirmek için
 * yeniden derleme gerektirir. Burada sunucuda okunup bileşene özellik olarak
 * geçiliyor, böylece yalnızca ortam değişkenini güncellemek yetiyor.
 *
 * ÖNEMLİ: Bu rakam bir teklif değil, piyasa ortalamasıdır. Ziyaretçinin
 * bankasından alacağı oran kampanyaya, müşteri profiline ve kredi/değer
 * oranına göre değişir. Arayüzde bu ayrım açıkça yazılmalı.
 */

export type MortgageRate = {
  /** Aylık faiz oranı, yüzde olarak (ör. 3.19) */
  monthlyPercent: number;
  /** Oranın hangi tarihe ait olduğu, ör. "Ağustos 2026" */
  updatedAt: string;
};

export function getMortgageRate(): MortgageRate {
  const raw = process.env.MORTGAGE_MONTHLY_RATE;
  const parsed = Number(raw?.replace(",", "."));

  // Geçersiz ya da saçma bir değer koda sızmasın: 0 ile 20 arası kabul
  const monthlyPercent =
    Number.isFinite(parsed) && parsed > 0 && parsed < 20
      ? parsed
      : MORTGAGE_DEFAULTS.monthlyRatePercent;

  if (raw && monthlyPercent === MORTGAGE_DEFAULTS.monthlyRatePercent) {
    console.warn(
      `[kredi] MORTGAGE_MONTHLY_RATE okunamadı ("${raw}"), koddaki varsayılan kullanılıyor.`,
    );
  }

  return {
    monthlyPercent,
    updatedAt:
      process.env.MORTGAGE_RATE_UPDATED_AT?.trim() ||
      MORTGAGE_DEFAULTS.rateUpdatedAt,
  };
}
