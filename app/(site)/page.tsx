import Image from "next/image";
import { ArrowRight, ShieldCheck, Star, TrendingUp, Users } from "lucide-react";

import { Reveal } from "@/components/animation/reveal";
import { ProcessStrip } from "@/components/home/process-strip";
import { CinematicHero } from "@/components/home/cinematic-hero";
import {
  DEFAULT_HERO,
  DEFAULT_HERO_PORTRAIT,
  HeroMedia,
} from "@/components/home/hero-media";
import { RegionGrid } from "@/components/home/region-grid";
import { TestimonialSlider } from "@/components/home/testimonial-slider";
import { PropertyCard } from "@/components/property/property-card";
import { ButtonLink } from "@/components/ui/button";
import {
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import {
  getFeaturedProperties,
  getProfile,
  getRegions,
  getSiteStats,
  getTestimonials,
} from "@/lib/queries";

const VALUES = [
  {
    Icon: ShieldCheck,
    title: "Gerçekçi fiyat",
    text: "İşi almak için kimseye duymak istediği rakamı söylemem. Bölge verisiyle karşılaştırır, gerçek değeri ortaya koyarım.",
  },
  {
    Icon: TrendingUp,
    title: "Veriyle karar",
    text: "Kira getirisi, likidite ve değer artışı üzerinden karşılaştırma yaparım. Kararınızı duyguyla değil rakamla verirsiniz.",
  },
  {
    Icon: Users,
    title: "Sonuna kadar takip",
    text: "İş tapuda bitmez. Abonelik devirleri, taşınma ve aidat kaydı dahil süreci sonuna kadar takip ederim.",
  },
];

// Panelden yapılan değişiklikler ana sayfada anında görünsün
export const revalidate = 0;

export default async function HomePage() {
  const [profile, properties, regions, testimonials, stats] = await Promise.all([
    getProfile(),
    getFeaturedProperties(6),
    getRegions(),
    getTestimonials(6),
    getSiteStats(),
  ]);

  const heroPoster = profile.heroPosterUrl || profile.coverUrl || DEFAULT_HERO;

  return (
    <>
      <CinematicHero
        fullName={profile.fullName}
        title={profile.title}
        officeName={profile.officeName}
        tagline={profile.tagline}
        videoUrl={profile.heroVideoUrl}
        posterUrl={profile.heroPosterUrl ?? profile.coverUrl}
        media={
          <HeroMedia
            src={heroPoster}
            // Dikey kadraj yalnızca varsayılan İstanbul karesi için var;
            // panelden başka bir görsel seçilirse tek kadrajla devam eder.
            portraitSrc={
              heroPoster === DEFAULT_HERO ? DEFAULT_HERO_PORTRAIT : null
            }
          />
        }
        // Yalnızca doğrulanabilen rakamlar gösterilir; 0 olanlar elenir
        stats={[
          { value: stats.active, label: "Aktif İlan" },
          { value: stats.reviewCount, label: "Müşteri Değerlendirmesi" },
          { value: stats.sold + stats.rented, label: "Tamamlanan İşlem" },
          { value: stats.years, label: "Yıllık Tecrübe" },
          { value: stats.regions, label: "Uzmanlık Bölgesi" },
        ].filter((stat) => stat.value > 0)}
      />

      {/* Öne çıkan portföy */}
      <Section id="portfoy">
        <Container>
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Portföy"
              title={
                <>
                  Seçili ilanlar,{" "}
                  <span className="text-cream-500">tek tek gezilmiş.</span>
                </>
              }
              description="Portföyümdeki her evi bizzat gördüm. İlanlarda yazan her cümle, o evde geçirdiğim zamandan çıktı."
            />
            <ButtonLink
              href="/portfoy"
              variant="outline"
              className="shrink-0 self-start sm:self-auto"
            >
              Tüm Portföy
              <ArrowRight className="size-4" />
            </ButtonLink>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property, index) => (
              <Reveal key={property.id} delay={(index % 3) * 0.08}>
                <PropertyCard property={property} priority={index < 3} />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Kaydırmaya bağlı yatay süreç şeridi */}
      <ProcessStrip />

      {/* Hakkımda özeti */}
      <Section>
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            {/* Portre 330x440; kutu doğal genişliği aşmıyor (bkz. /hakkimda) */}
            <Reveal>
              <div className="relative mx-auto aspect-4/5 w-full max-w-[330px] overflow-hidden rounded-card border border-ink-700 lg:mx-0">
                {profile.portraitUrl ? (
                  <Image
                    src={profile.portraitUrl}
                    alt={profile.fullName}
                    fill
                    sizes="330px"
                    className="object-cover"
                  />
                ) : (
                  <div className="size-full bg-ink-800" />
                )}
                <div className="scrim-bottom absolute inset-0" />
                <div className="absolute bottom-7 left-7">
                  <p className="font-display text-2xl">{profile.fullName}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cream-400">
                    {profile.title} · {profile.officeName}
                  </p>
                </div>
              </div>
            </Reveal>

            <div>
              <Eyebrow>Hakkımda</Eyebrow>
              <h2 className="mt-6 text-balance text-4xl leading-[1.1] sm:text-5xl">
                Ev satmıyorum,{" "}
                <span className="text-brand-500">
                  doğru kararı almanıza yardım ediyorum.
                </span>
              </h2>
              <p className="mt-6 text-base leading-relaxed text-cream-400">
                {profile.shortBio}
              </p>

              <div className="mt-10 flex flex-col gap-7">
                {VALUES.map(({ Icon, title, text }, index) => (
                  <Reveal key={title} delay={index * 0.08}>
                    <div className="flex gap-4">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-ink-600 text-brand-500">
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <h3 className="text-lg">{title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-cream-400">
                          {text}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <ButtonLink href="/hakkimda" variant="outline" className="mt-10">
                Hikâyemin Tamamı
                <ArrowRight className="size-4" />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      {/* Bölgeler */}
      <Section className="bg-ink-950">
        <Container>
          <SectionHeading
            eyebrow="Hizmet Bölgeleri"
            title={
              <>
                İki yaka.{" "}
                <span className="text-cream-500">Sokak sokak.</span>
              </>
            }
            description="İstanbul'un her iki yakasında çalışıyorum. Aşağıdakiler, bir mahalleyi sokak seviyesinde tanıdığım için saha yorumumu da yazabildiğim bölgeler."
          />

          <div className="mt-14">
            <RegionGrid regions={regions} />
          </div>

          <div className="mt-10">
            <ButtonLink href="/bolgeler" variant="outline">
              İstanbul genelinde çalıştığım ilçeler
              <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* Referanslar — yorum yoksa RE/MAX değerlendirme özeti gösterilir */}
      {testimonials.length > 0 ? (
        <Section>
          <Container>
            <SectionHeading
              eyebrow="Referanslar"
              title={
                <>
                  Müşterilerim <span className="text-cream-500">ne diyor?</span>
                </>
              }
            />
            <div className="mt-14">
              <TestimonialSlider items={testimonials} />
            </div>
          </Container>
        </Section>
      ) : stats.reviewCount > 0 ? (
        <Section>
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow>Referanslar</Eyebrow>
              <div className="mt-8 flex justify-center gap-1">
                {Array.from({ length: Math.round(stats.rating ?? 5) }, (_, i) => (
                  <Star key={i} className="size-6 fill-gold-400 text-gold-400" />
                ))}
              </div>
              <p className="mt-6 font-display text-6xl">
                {(stats.rating ?? 5).toFixed(1)}
              </p>
              <p className="mt-4 text-balance text-lg leading-relaxed text-cream-300">
                RE/MAX üzerinden <strong className="text-cream-50">{stats.reviewCount} müşteri değerlendirmesi</strong>{" "}
                ortalaması.
              </p>
              {profile.remaxUrl ? (
                <a
                  href={profile.remaxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-sm text-brand-400 transition-colors hover:text-brand-500"
                >
                  Değerlendirmeleri RE/MAX&apos;te görün
                  <ArrowRight className="size-4" />
                </a>
              ) : null}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* Kapanış çağrısı */}
      <Section className="relative overflow-hidden bg-ink-950">
        <Container>
          <div className="relative overflow-hidden rounded-card border border-ink-700 bg-ink-850 px-8 py-16 text-center sm:px-14 sm:py-20">
            <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="relative">
              <Eyebrow>Ücretsiz</Eyebrow>
              <h2 className="mx-auto mt-6 max-w-2xl text-balance text-4xl leading-[1.1] sm:text-5xl">
                Evinizin bugünkü değerini merak ediyor musunuz?
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-cream-400">
                Birkaç soruya yanıt verin, bölgedeki güncel satışlarla
                karşılaştırıp gerçekçi bir değer aralığı paylaşayım. Hiçbir
                yükümlülük yok.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/degerleme" size="lg">
                  Ücretsiz Değerleme Al
                </ButtonLink>
                <ButtonLink href="/iletisim" variant="outline" size="lg">
                  Doğrudan İletişim
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
