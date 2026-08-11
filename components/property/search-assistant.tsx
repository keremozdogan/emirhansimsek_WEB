"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, CornerDownLeft, Search, Sparkles } from "lucide-react";

import { askAssistant, type AssistantAnswer } from "@/app/actions/search";
import { PropertyCard } from "@/components/property/property-card";

/**
 * İlan arama asistanı — anahtarsız.
 *
 * Bilerek "yapay zeka" demiyoruz: arkada bir dil modeli yok, `parseQuery`
 * kural tabanlı çalışıyor. Kullanıcıya sohbet vaadi verip kalıp dışına
 * çıkıldığında boş bakan bir kutu, doğru beklenti kurulmuş bir arama
 * yardımcısından daha kötü bir deneyim.
 *
 * Arayüzün en önemli parçası, sonuçların değil "şunu anladım" satırının
 * kendisi: kullanıcı yanlış anlaşıldığını ilk bakışta görebilmeli.
 */

const EXAMPLES = [
  "Çekmeköy'de 3+1 kiralık daire",
  "5 milyona kadar satılık 2+1",
  "Sancaktepe'de dükkan",
];

export function SearchAssistant() {
  const [value, setValue] = useState("");
  const [answer, setAnswer] = useState<AssistantAnswer | null>(null);
  const [asked, setAsked] = useState("");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(text: string) {
    const query = text.trim();
    if (!query) return;
    setAsked(query);
    startTransition(async () => {
      setAnswer(await askAssistant(query));
    });
  }

  return (
    <div className="rounded-card border border-ink-700 bg-ink-850 p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-500/12 text-brand-400">
          <Sparkles className="size-4" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-2xl text-cream-100">
            Ne aradığınızı yazın
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-cream-300">
            Cümle kurmanız yeterli — ilçe, oda sayısı ve bütçeyi kendisi ayırır.
          </p>
        </div>
      </div>

      <form
        className="mt-6"
        onSubmit={(event) => {
          event.preventDefault();
          submit(value);
        }}
      >
        <label htmlFor="asistan-sorgu" className="sr-only">
          Aradığınız ilanı tarif edin
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-cream-400"
              aria-hidden
            />
            <input
              id="asistan-sorgu"
              ref={inputRef}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Örn. Çekmeköy'de 3+1 kiralık daire"
              maxLength={200}
              autoComplete="off"
              className="w-full rounded-full border border-ink-600 bg-ink-900 py-3.5 pl-11 pr-4 text-base text-cream-100 placeholder:text-cream-400 focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
            />
          </div>
          <button
            type="submit"
            disabled={pending || value.trim().length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Aranıyor…" : "Ara"}
            <CornerDownLeft className="size-4" aria-hidden />
          </button>
        </div>
      </form>

      {answer === null ? (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-[0.16em] text-cream-400">
            Deneyin
          </span>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setValue(example);
                submit(example);
                inputRef.current?.focus();
              }}
              className="rounded-full border border-ink-600 px-3 py-1.5 text-sm text-cream-300 transition-colors hover:border-brand-500 hover:text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
            >
              {example}
            </button>
          ))}
        </div>
      ) : null}

      {/* Sonuçlar ekran okuyucularda da duyurulsun */}
      <div aria-live="polite">
        {answer !== null ? (
          <div className="mt-7 border-t border-ink-700 pt-6">
            <p className="text-sm text-cream-400">
              <span className="text-cream-300">“{asked}”</span> için
            </p>

            {answer.understood.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {answer.understood.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1.5 text-sm text-cream-100"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-cream-300">
                Bu cümleden bir arama ölçütü çıkaramadım. İlçe, oda sayısı veya
                bütçe yazmayı deneyin — örneğin “Ümraniye 2+1 kiralık”.
              </p>
            )}

            {answer.leftover.length > 0 ? (
              <p className="mt-3 text-sm text-cream-400">
                Şunları çözemedim: {answer.leftover.join(", ")}. Bu ölçütler
                aramaya katılmadı.
              </p>
            ) : null}

            {answer.relaxed ? (
              <p className="mt-3 rounded-lg border border-gold-400/30 bg-gold-400/5 px-4 py-3 text-sm text-cream-200">
                Tam eşleşen ilan bulamadım. Sonuçlar,{" "}
                <strong className="font-semibold">{answer.relaxed}</strong>{" "}
                ölçütü kaldırılarak listelendi.
              </p>
            ) : null}

            {answer.results.length > 0 ? (
              <>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {answer.results.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
                <Link
                  href={answer.href}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-400 transition-colors hover:text-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
                >
                  Bu ölçütlerle tüm ilanları gör
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </>
            ) : (
              <p className="mt-6 text-sm text-cream-300">
                Bu ölçütlere uyan yayında ilan yok. Aradığınızı bulamadıysanız
                portföye girmemiş seçenekler için bana yazabilirsiniz.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
