import type { Metadata } from "next";
import { CalendarCheck, Star, TrendingUp } from "lucide-react";

import { Counter } from "@/components/animation/counter";
import { Reveal } from "@/components/animation/reveal";
import { PropertyCard } from "@/components/property/property-card";
import { ButtonLink } from "@/components/ui/button";
import {
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import { prisma } from "@/lib/db";
import {
  getClosedProperties,
  getProfile,
  getSiteStats,
  getTestimonials,
} from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Referanslar ve Tamamlanan İşlemler",
  description:
    "Emirhan Şimşek'in tamamladığı satış ve kiralama işlemleri, ortalama süreler ve müşteri yorumları.",
  alternates: { canonical: "/referanslar" },
};

export const revalidate = 0;

export default async function ReferencesPage() {
  const [closed, testimonials, stats, profile, aggregate] = await Promise.all([
    getClosedProperties(24),
    getTestimonials(20),
    getSiteStats(),
    getProfile(),
    prisma.property.aggregate({
      where: { status: { in: ["SOLD", "RENTED"] }, daysOnMarket: { not: null } },
      _avg: { daysOnMarket: true, closedPricePercent: true },
    }),
  ]);

  const avgDays = Math.round(aggregate._avg.daysOnMarket ?? 0);
  const avgPercent = Math.round(aggregate._avg.closedPricePercent ?? 0);

  const statCards = [
    { Icon: Star, value: stats.reviewCount, label: "Müşteri değerlendirmesi" },
    { Icon: TrendingUp, value: stats.sold, suffix: "+", label: "Satılan konut" },
    {
      Icon: TrendingUp,
      value: stats.rented,
      suffix: "+",
      label: "Kiralanan konut",
    },
    {
      Icon: CalendarCheck,
      value: avgDays,
      suffix: " gün",
      label: "Ortalama işlem süresi",
    },
    {
      Icon: Star,
      value: avgPercent,
      prefix: "%",
      label: "Liste fiyatına oranla kapanış",
    },
  ].filter((card) => card.value > 0);

  return (
    <>
      <Section className="pt-32 sm:pt-40 lg:pt-44">
        <Container>
          <SectionHeading
            eyebrow="Referanslar"
            title={
              <>
                Sonuçlar,{" "}
                <span className="text-cream-500">sözlerden önce gelir.</span>
              </>
            }
            description="Aşağıdaki her işlem gerçek bir aileyle, gerçek bir süreçle tamamlandı. Rakamları da, müşterilerimin yorumlarını da olduğu gibi paylaşıyorum."
          />

          {/* Yalnızca gerçekten veri olan rakamlar gösterilir */}
          {statCards.length > 0 ? (
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </div>
          ) : null}
        </Container>
      </Section>

      {/* Müşteri yorumları */}
      {testimonials.length > 0 ? (
      <Section className="bg-ink-950 !pt-16">
        <Container>
          <Eyebrow>Müşteri Yorumları</Eyebrow>
          <h2 className="mt-5 text-3xl sm:text-4xl">Onlar ne dedi?</h2>

          <div className="mt-12 columns-1 gap-6 md:columns-2 lg:columns-3">
            {testimonials.map((testimonial, index) => (
              <Reveal key={testimonial.id} delay={(index % 3) * 0.05}>
                <figure className="mb-6 break-inside-avoid rounded-card border border-ink-700 bg-ink-850 p-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: testimonial.rating }, (_, i) => (
                      <Star
                        key={i}
                        className="size-3.5 fill-gold-400 text-gold-400"
                      />
                    ))}
                  </div>
                  <blockquote className="mt-5 text-[15px] leading-relaxed text-cream-200">
                    {testimonial.text}
                  </blockquote>
                  <figcaption className="mt-6 border-t border-ink-700 pt-5 text-xs text-cream-500">
                    <span className="text-sm text-cream-50">
                      {testimonial.authorName}
                    </span>
                    <br />
                    {testimonial.authorTitle} · {formatDate(testimonial.date)}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
      ) : stats.reviewCount > 0 ? (
        /* Henüz siteye yorum girilmediyse RE/MAX değerlendirme özeti gösterilir */
        <Section className="bg-ink-950 !pt-16">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow>Müşteri Yorumları</Eyebrow>
              <div className="mt-8 flex justify-center gap-1">
                {Array.from({ length: Math.round(stats.rating ?? 5) }, (_, i) => (
                  <Star key={i} className="size-6 fill-gold-400 text-gold-400" />
                ))}
              </div>
              <p className="mt-6 font-display text-6xl">
                {(stats.rating ?? 5).toFixed(1)}
              </p>
              <p className="mt-4 text-balance text-lg leading-relaxed text-cream-300">
                RE/MAX üzerinden{" "}
                <strong className="text-cream-50">
                  {stats.reviewCount} müşteri değerlendirmesi
                </strong>{" "}
                ortalaması.
              </p>
              {profile.remaxUrl ? (
                <a
                  href={profile.remaxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block text-sm text-brand-400 transition-colors hover:text-brand-500"
                >
                  Değerlendirmeleri RE/MAX&apos;te görün →
                </a>
              ) : null}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* Tamamlanan işlemler */}
      {closed.length > 0 ? (
        <Section>
          <Container>
            <Eyebrow>Tamamlanan İşlemler</Eyebrow>
            <h2 className="mt-5 text-3xl sm:text-4xl">
              Satılan ve kiralanan evler
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-cream-400">
              Her ilanın detay sayfasında sürecin nasıl işlediğini, kaç günde
              sonuçlandığını ve hangi adımların fark yarattığını anlattım.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {closed.map((property, index) => (
                <Reveal key={property.id} delay={(index % 3) * 0.06}>
                  <PropertyCard property={property} />
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <Section className="bg-ink-950 !py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl leading-tight sm:text-4xl">
              Sıradaki siz olabilirsiniz.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-cream-400">
              Evinizi satmayı ya da kiraya vermeyi düşünüyorsanız, önce gerçekçi
              bir değer aralığı konuşalım.
            </p>
            <ButtonLink href="/degerleme" size="lg" className="mt-8">
              Ücretsiz Değerleme Al
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}

function StatCard({
  Icon,
  value,
  suffix,
  prefix,
  label,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
}) {
  return (
    <div className="rounded-card border border-ink-700 bg-ink-850 p-6">
      <Icon className="size-5 text-brand-500" />
      <p className="mt-5 font-display text-4xl">
        <Counter value={value} suffix={suffix} prefix={prefix} />
      </p>
      <p className="mt-1.5 text-[11px] uppercase tracking-[0.16em] text-cream-500">
        {label}
      </p>
    </div>
  );
}
