"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";

import { MORTGAGE_DEFAULTS } from "@/lib/constants";
import { calculateMortgage, formatPrice } from "@/lib/utils";

/**
 * Konut kredisi taksit hesaplayıcı.
 *
 * Türkiye'de konut kredisi faizi **aylık** oran olarak konuşulduğu için giriş
 * de aylık orandır. Hesap eşit taksitli (anüite) yöntemle yapılır.
 */
export function MortgageCalculator({
  price,
  className,
}: {
  price: number;
  className?: string;
}) {
  const [downPaymentRatio, setDownPaymentRatio] = useState(
    MORTGAGE_DEFAULTS.downPaymentRatio,
  );
  const [termMonths, setTermMonths] = useState(MORTGAGE_DEFAULTS.termMonths);
  const [monthlyRate, setMonthlyRate] = useState(
    MORTGAGE_DEFAULTS.monthlyRatePercent,
  );

  const downPayment = Math.round(price * downPaymentRatio);
  const principal = price - downPayment;

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
          value={`${formatPrice(downPayment)} (%${Math.round(downPaymentRatio * 100)})`}
        >
          <input
            type="range"
            min={10}
            max={80}
            step={5}
            value={Math.round(downPaymentRatio * 100)}
            onChange={(event) =>
              setDownPaymentRatio(Number(event.target.value) / 100)
            }
            className="range-input"
            aria-label="Peşinat oranı"
          />
        </Field>

        <Field label="Vade" value={`${termMonths} ay`}>
          <div className="flex flex-wrap gap-2">
            {MORTGAGE_DEFAULTS.termOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTermMonths(option)}
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
