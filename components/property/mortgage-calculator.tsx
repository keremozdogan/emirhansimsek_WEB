"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";

import { MORTGAGE_DEFAULTS } from "@/lib/constants";
import { calculateMortgage, formatPrice } from "@/lib/utils";

/** Serbest vade girişinin üst sınırı — 30 yıl, konut kredisinde görülen tavan */
const MAX_TERM_MONTHS = 360;

/**
 * Konut kredisi taksit hesaplayıcı.
 *
 * Türkiye'de konut kredisi faizi **aylık** oran olarak konuşulduğu için giriş
 * de aylık orandır. Hesap eşit taksitli (anüite) yöntemle yapılır.
 */
export function MortgageCalculator({
  price,
  className,
  /**
   * Başlangıç faiz oranı ve ait olduğu tarih. Sunucudan geçilir
   * (bkz. lib/mortgage-rate.ts) — koda gömülü kalırsa güncellenmiyor.
   */
  rate,
}: {
  price: number;
  className?: string;
  rate?: { monthlyPercent: number; updatedAt: string };
}) {
  const initialRate = rate?.monthlyPercent ?? MORTGAGE_DEFAULTS.monthlyRatePercent;
  const rateUpdatedAt = rate?.updatedAt ?? MORTGAGE_DEFAULTS.rateUpdatedAt;

  /**
   * Peşinat oran olarak tutuluyor, tutar olarak değil: konut fiyatı değiştiğinde
   * (ayrı hesaplama sayfasında fiyat serbest giriliyor) peşinat kendiliğinden
   * ölçekleniyor, kullanıcı iki alanı birden düzeltmek zorunda kalmıyor.
   */
  const [downPaymentRatio, setDownPaymentRatio] = useState(
    MORTGAGE_DEFAULTS.downPaymentRatio,
  );
  const [termMonths, setTermMonths] = useState(MORTGAGE_DEFAULTS.termMonths);
  const [monthlyRate, setMonthlyRate] = useState(initialRate);

  const downPayment = Math.round(price * downPaymentRatio);
  const principal = price - downPayment;

  /**
   * Peşinat alanına yazılanlar. `null` iken alan hesaplanan tutarı gösterir;
   * ayrı tutulmasının sebebi kullanıcının alanı tamamen silebilmesi — her tuşta
   * değer 0'a düşüp kaydırıcı başa sarmamalı.
   */
  const [downPaymentDraft, setDownPaymentDraft] = useState<string | null>(null);

  function applyDownPayment(value: string) {
    setDownPaymentDraft(value);
    if (price <= 0) return;
    // Fiyatın üstünde peşinat anlamsız; kredi tutarı eksiye düşerdi
    const amount = Math.min(Number(value.replace(/\D/g, "")) || 0, price);
    setDownPaymentRatio(amount / price);
  }

  /** Vade alanı da aynı sebeple taslak tutuyor — bkz. downPaymentDraft */
  const [termDraft, setTermDraft] = useState<string | null>(null);

  function applyTerm(value: string) {
    setTermDraft(value);
    // 1 aydan kısa ya da 30 yıldan uzun konut kredisi yok
    const months = Number(value.replace(/\D/g, "")) || 0;
    if (months > 0) setTermMonths(Math.min(months, MAX_TERM_MONTHS));
  }

  const result = useMemo(
    () => calculateMortgage(principal, monthlyRate, termMonths),
    [principal, monthlyRate, termMonths],
  );

  return (
    <div
      className={`rounded-card border border-ink-700 bg-ink-850 p-6 sm:p-7 ${className ?? ""}`}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full border border-ink-600 text-brand-500">
          <Calculator className="size-4" />
        </span>
        <div>
          <h3 className="text-lg">Kredi Hesaplayıcı</h3>
          <p className="text-xs text-cream-500">
            Tahmini taksitinizi hemen görün
          </p>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-6">
        <Field
          label="Peşinat"
          value={`%${formatRatio(downPaymentRatio)}`}
        >
          {/*
            Tutar doğrudan yazılabiliyor: elindeki nakit belli olan alıcı
            "%35" diye düşünmüyor, "800.000 TL'm var" diye düşünüyor.
            Kaydırıcı da duruyor — kabaca oynayıp görmek isteyen için.
          */}
          <div className="flex items-baseline gap-2 border-b border-ink-600 pb-1.5 focus-within:border-brand-500">
            <input
              inputMode="numeric"
              value={downPaymentDraft ?? String(downPayment)}
              onChange={(event) => applyDownPayment(event.target.value)}
              onBlur={() => setDownPaymentDraft(null)}
              className="w-full bg-transparent text-lg text-cream-50 outline-none"
              aria-label="Peşinat tutarı"
            />
            <span className="shrink-0 text-sm text-cream-500">TL</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(downPaymentRatio * 100)}
            onChange={(event) => {
              setDownPaymentDraft(null);
              setDownPaymentRatio(Number(event.target.value) / 100);
            }}
            className="range-input mt-4"
            aria-label="Peşinat oranı"
          />
        </Field>

        <Field label="Vade" value={`${termMonths} ay`}>
          <div className="flex items-baseline gap-2 border-b border-ink-600 pb-1.5 focus-within:border-brand-500">
            <input
              inputMode="numeric"
              value={termDraft ?? String(termMonths)}
              onChange={(event) => applyTerm(event.target.value)}
              onBlur={() => setTermDraft(null)}
              className="w-full bg-transparent text-lg text-cream-50 outline-none"
              aria-label="Vade (ay)"
            />
            <span className="shrink-0 text-sm text-cream-500">ay</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {MORTGAGE_DEFAULTS.termOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setTermDraft(null);
                  setTermMonths(option);
                }}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                  option === termMonths
                    ? "bg-brand-500 text-white"
                    : "border border-ink-600 text-cream-400 hover:border-cream-400"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/*
            Serbest giriş açıkken beklentiyi yönetmek gerekiyor: 37 ay yazıp
            hesaplayan biri bankada aynı vadeyi bulamayınca hesabı yanlış
            sanabilir. Yaygın vadelerin düğmelerde olduğunu söylüyoruz.
          */}
          <p className="mt-2.5 text-[11px] leading-relaxed text-cream-500">
            Bankalar genellikle yukarıdaki yuvarlak vadelerle çalışır; aradaki
            bir süreyi merak ediyorsanız serbestçe yazabilirsiniz. Üst sınır{" "}
            {MAX_TERM_MONTHS} ay olarak alınmıştır, bankaların uyguladığı azami
            vade konut tipine ve kredi tutarına göre daha kısa olabilir.
          </p>
        </Field>

        <Field label="Aylık faiz oranı" value={`%${monthlyRate.toFixed(2)}`}>
          <input
            type="range"
            min={0}
            max={6}
            step={0.01}
            value={monthlyRate}
            onChange={(event) => setMonthlyRate(Number(event.target.value))}
            className="range-input"
            aria-label="Aylık faiz oranı"
          />
          {/*
            Oranın nereden geldiğini yazmak şart: ziyaretçi bunu kendisine
            teklif edilecek oran sanmamalı. Bankalar arası ortalama ile
            kişiye çıkan teklif kampanyaya ve müşteri profiline göre ayrışır.
          */}
          <p className="mt-2.5 text-[11px] leading-relaxed text-cream-500">
            Başlangıç değeri piyasa ortalamasıdır ({rateUpdatedAt}) ve size
            teklif edilecek oran değildir. Bankanızdan aldığınız oranı yazarak
            hesabı kendinize göre yapın.
          </p>
        </Field>
      </div>

      <div className="mt-8 border-t border-ink-700 pt-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cream-500">
          Aylık taksit
        </p>
        <p className="mt-2 font-display text-4xl text-brand-500">
          {formatPrice(Math.round(result.monthlyPayment))}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-cream-500">Kredi tutarı</dt>
            <dd className="mt-1 text-cream-200">{formatPrice(principal)}</dd>
          </div>
          <div>
            <dt className="text-xs text-cream-500">Toplam geri ödeme</dt>
            <dd className="mt-1 text-cream-200">
              {formatPrice(Math.round(result.totalPayment))}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-cream-500">Toplam faiz</dt>
            <dd className="mt-1 text-cream-200">
              {formatPrice(Math.round(result.totalInterest))}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-cream-500">Peşinat</dt>
            <dd className="mt-1 text-cream-200">{formatPrice(downPayment)}</dd>
          </div>
        </dl>
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-cream-500">
        Bu hesaplama tahminidir; dosya masrafı, sigorta ve banka komisyonlarını
        içermez. Kesin rakamlar için bankanızla görüşmelisiniz. Güncel
        kampanyalar hakkında bilgi almak isterseniz bana yazabilirsiniz.
      </p>
    </div>
  );
}

/** Serbest tutar girişi küsuratlı oran üretiyor: "%24,7" gibi tek hane yeter */
function formatRatio(ratio: number) {
  return (ratio * 100).toLocaleString("tr-TR", { maximumFractionDigits: 1 });
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-cream-300">{label}</span>
        <span className="text-sm font-medium text-cream-50">{value}</span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
