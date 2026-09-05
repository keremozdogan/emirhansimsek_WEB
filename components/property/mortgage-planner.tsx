"use client";

import { useState } from "react";

import { MortgageCalculator } from "@/components/property/mortgage-calculator";
import { formatPrice } from "@/lib/utils";

/**
 * Bağımsız kredi hesaplama sayfasının fiyat girişi.
 *
 * `MortgageCalculator` ilan detayında sabit bir fiyatla çalışıyor (ilanın
 * kendi fiyatı). Ayrı sayfada böyle bir bağlam yok, ziyaretçi kendi
 * rakamını girmeli. Hesaplayıcıyı kopyalamak yerine fiyat durumunu burada
 * tutup ona geçiriyoruz — hesap mantığı tek yerde kalıyor.
 */

const PRESETS = [2_500_000, 5_000_000, 7_500_000, 10_000_000, 15_000_000];

export function MortgagePlanner({
  initialPrice,
  rate,
}: {
  initialPrice: number;
  rate: { monthlyPercent: number; updatedAt: string };
}) {
  const [price, setPrice] = useState(initialPrice);
  // Girdi ayrı tutuluyor: kullanıcı alanı tamamen silebilmeli, her tuşta
  // rakam 0'a düşüp hesaplayıcı sıfırlanmamalı.
  const [draft, setDraft] = useState(String(initialPrice));

  function apply(value: string) {
    setDraft(value);
    const digits = Number(value.replace(/\D/g, ""));
    if (digits > 0) setPrice(digits);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
      <div>
        <label
          htmlFor="konut-fiyati"
          className="text-xs uppercase tracking-[0.2em] text-cream-500"
        >
          Konut fiyatı
        </label>
        <div className="mt-3 flex items-baseline gap-2 border-b border-ink-600 pb-2 focus-within:border-brand-500">
          <input
            id="konut-fiyati"
            inputMode="numeric"
            value={draft}
            onChange={(event) => apply(event.target.value)}
            onBlur={() => setDraft(String(price))}
            className="w-full bg-transparent font-display text-3xl text-cream-50 outline-none sm:text-4xl"
          />
          <span className="shrink-0 text-lg text-cream-500">TL</span>
        </div>
        <p className="mt-2 text-sm text-cream-400">{formatPrice(price)}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setPrice(preset);
                setDraft(String(preset));
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs transition-colors ${
                preset === price
                  ? "bg-brand-500 text-ink-950"
                  : "border border-ink-600 text-cream-400 hover:border-cream-400"
              }`}
            >
              {formatPrice(preset)}
            </button>
          ))}
        </div>

        <div className="mt-10 rounded-card border border-ink-700 bg-ink-850 p-6">
          <p className="text-sm leading-relaxed text-cream-400">
            Hesaplama <strong className="text-cream-100">eşit taksitli
            (anüite)</strong> yöntemle yapılır ve yalnızca fikir vermek
            içindir. Bankaların uyguladığı dosya masrafı, ekspertiz ücreti,
            hayat ve DASK sigortası gibi kalemler dahil değildir. Kesin taksit
            için bankanızdan teklif alın.
          </p>
        </div>
      </div>

      <MortgageCalculator price={price} rate={rate} />
    </div>
  );
}
