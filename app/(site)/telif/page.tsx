import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";

import { Container, Eyebrow, Section } from "@/components/ui/primitives";
import { getMediaCredits } from "@/lib/media-credits";

export const metadata: Metadata = {
  title: "Görsel Telifleri",
  description:
    "Sitede kullanılan serbest lisanslı görsellerin kaynak ve lisans bilgileri.",
  alternates: { canonical: "/telif" },
  robots: { index: false },
};

/**
 * Serbest lisanslı görsellerin künyesi.
 *
 * Sitedeki bölge, rehber ve kapak görsellerinin bir kısmı Wikimedia Commons'tan
 * alınıyor. CC BY ve CC BY-SA lisansları eseri kullanmayı serbest bırakırken
 * fotoğrafçının adının ve lisansın belirtilmesini şart koşuyor — bu sayfa o
 * şartı karşılıyor. Künyeler `content/media-credits.json` dosyasında tutuluyor
 * ve görselleri indiren betik tarafından otomatik yazılıyor.
 */
export default async function TelifPage() {
  const credits = await getMediaCredits();

  return (
    <Section className="pt-32 sm:pt-40 lg:pt-44">
      <Container>
        <div className="mx-auto max-w-3xl">
          <Eyebrow>Yasal</Eyebrow>
          <h1 className="mt-6 font-display text-4xl leading-tight sm:text-5xl">
            Görsel Telifleri
          </h1>
          <p className="mt-6 text-base leading-relaxed text-cream-400">
            Portföydeki ilan fotoğrafları {""}
            <strong className="text-cream-100">Emirhan Şimşek</strong>&apos;e
            aittir. Bölge ve rehber görsellerinin bir kısmı ise Wikimedia
            Commons üzerinden serbest lisanslarla kullanılmaktadır; aşağıda
            fotoğrafçıları ve lisansları listelenmiştir.
          </p>

          {credits.length === 0 ? (
            <p className="mt-12 text-sm text-cream-500">
              Şu an serbest lisanslı görsel kullanılmıyor.
            </p>
          ) : (
            <ul className="mt-12 flex flex-col">
              {credits.map((credit) => (
                <li
                  key={credit.url}
                  className="border-t border-ink-700 py-6 first:border-t-0 first:pt-0"
                >
                  <p className="text-lg">{credit.title}</p>
                  <p className="mt-1.5 text-sm text-cream-400">
                    Fotoğraf: {credit.author}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    {credit.licenseUrl ? (
                      <a
                        href={credit.licenseUrl}
                        target="_blank"
                        rel="noopener noreferrer license"
                        className="inline-flex items-center gap-1.5 text-brand-400 transition-colors hover:text-brand-500"
                      >
                        {credit.license}
                        <ExternalLink className="size-3.5" />
                      </a>
                    ) : (
                      <span className="text-cream-400">{credit.license}</span>
                    )}
                    <a
                      href={credit.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-cream-500 transition-colors hover:text-cream-300"
                    >
                      Kaynak sayfası
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </Section>
  );
}
