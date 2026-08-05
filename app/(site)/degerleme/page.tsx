import type { Metadata } from "next";
import { BarChart3, Clock3, ShieldCheck } from "lucide-react";

import { ValuationForm } from "@/components/forms/valuation-form";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Ücretsiz Konut Değerleme",
  description:
    "Evinizin güncel piyasa değerini öğrenin. Bölgedeki gerçek satışlarla karşılaştırmalı, ücretsiz ve yükümlülüksüz değerleme.",
  alternates: { canonical: "/degerleme" },
};

const PROMISES = [
  {
    Icon: BarChart3,
    title: "Gerçek satışlarla karşılaştırma",
    text: "İlan fiyatlarına değil, bölgede gerçekten kapanan işlemlere bakarım. İkisi çoğu zaman aynı şey değildir.",
  },
  {
    Icon: Clock3,
    title: "1 iş günü içinde dönüş",
    text: "Formu doldurduktan sonra en geç bir iş günü içinde sizi arar, değer aralığını ve gerekçesini anlatırım.",
  },
  {
    Icon: ShieldCheck,
    title: "Hiçbir yükümlülük yok",
    text: "Değerleme ücretsizdir ve sizi hiçbir şeye bağlamaz. Satmaya karar vermeseniz de bilgi sizde kalır.",
  },
];

export default function ValuationPage() {
  return (
    <Section className="pt-32 sm:pt-40 lg:pt-44">
      <Container>
        <SectionHeading
          eyebrow="Ücretsiz Değerleme"
          title={
            <>
              Eviniz bugün{" "}
              <span className="text-cream-500">gerçekte ne ediyor?</span>
            </>
          }
          description="İnternetteki otomatik hesaplayıcılar bölgeyi bilmez, sokağı hiç bilmez. Ben evinizi çevresindeki gerçek işlemlerle karşılaştırıp gerekçeli bir aralık veririm."
        />

        <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
            {PROMISES.map(({ Icon, title, text }) => (
              <div
                key={title}
                className="rounded-card border border-ink-700 bg-ink-850 p-6"
              >
                <span className="flex size-10 items-center justify-center rounded-full border border-ink-600 text-brand-500">
                  <Icon className="size-4" />
                </span>
                <h2 className="mt-5 text-lg">{title}</h2>
                <p className="mt-2.5 text-sm leading-relaxed text-cream-400">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-card border border-ink-700 bg-ink-850 p-7 sm:p-10">
            <ValuationForm />
          </div>
        </div>
      </Container>
    </Section>
  );
}
