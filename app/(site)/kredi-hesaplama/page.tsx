import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { MortgagePlanner } from "@/components/property/mortgage-planner";
import { getMortgageRate } from "@/lib/mortgage-rate";
import { ButtonLink } from "@/components/ui/button";
import {
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Konut Kredisi Hesaplama",
  description:
    "Konut fiyatı, peşinat, vade ve faiz oranına göre aylık taksitinizi hesaplayın. Eşit taksitli (anüite) yöntemle, ücretsiz.",
  alternates: { canonical: "/kredi-hesaplama" },
};

export default function KrediHesaplamaPage() {
  return (
    <>
      <Section className="pt-32 sm:pt-40 lg:pt-44">
        <Container>
          <SectionHeading
            eyebrow="Araç"
            title={
              <>
                Aylık taksitiniz{" "}
                <span className="text-cream-500">ne kadar olur?</span>
              </>
            }
            description="Konut fiyatını girin, peşinat oranını ve vadeyi ayarlayın; taksit anında güncellensin. Hesap tamamen tarayıcınızda yapılır, hiçbir bilgi kaydedilmez."
          />

          <div className="mt-14">
            {/* Ortalama bir konut fiyatıyla başlıyor; ziyaretçi kendi rakamını girebiliyor */}
            <MortgagePlanner initialPrice={5_000_000} rate={getMortgageRate()} />
          </div>
        </Container>
      </Section>

      <Section className="bg-ink-950">
        <Container>
          <div className="relative overflow-hidden rounded-card border border-ink-700 bg-ink-850 px-8 py-14 text-center sm:px-14">
            <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="relative">
              <Eyebrow>Sıradaki adım</Eyebrow>
              <h2 className="mx-auto mt-6 max-w-2xl text-balance text-3xl leading-[1.15] sm:text-4xl">
                Bütçeniz netleştiyse, ona uyan evleri birlikte bakalım.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-cream-400">
                Ödeyebileceğiniz taksiti bilmek, doğru evi bulmanın yarısı.
                Elinizdeki bütçeye göre portföyü birlikte tarayabiliriz.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/portfoy" size="lg">
                  Portföyü Keşfet
                  <ArrowRight className="size-4" />
                </ButtonLink>
                <ButtonLink href="/degerleme" variant="outline" size="lg">
                  Evimin Değerini Öğren
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
