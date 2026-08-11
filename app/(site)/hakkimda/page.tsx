import type { Metadata } from "next";
import Image from "next/image";
import { Award, Quote } from "lucide-react";

import { Counter } from "@/components/animation/counter";
import { Reveal, RevealText } from "@/components/animation/reveal";
import { ButtonLink } from "@/components/ui/button";
import {
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import {
  getCertificates,
  getMilestones,
  getProfile,
  getSiteStats,
} from "@/lib/queries";

export const metadata: Metadata = {
  title: "Hakkımda",
  description:
    "Emirhan Şimşek kimdir? RE/MAX EKSEN gayrimenkul danışmanının kariyer hikâyesi, çalışma ilkeleri, sertifikaları ve uzmanlık alanları.",
  alternates: { canonical: "/hakkimda" },
};

export const revalidate = 0;

export default async function AboutPage() {
  const [profile, milestones, certificates, stats] = await Promise.all([
    getProfile(),
    getMilestones(),
    getCertificates(),
    getSiteStats(),
  ]);

  return (
    <>
      {/* Portre ve giriş */}
      <Section className="pt-32 sm:pt-40 lg:pt-44">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            {/*
              Portre kaynağı 330x440. Daha önce 45vw genişlikte gösteriliyordu;
              1440px'lik bir ekranda bu 648 CSS pikseli, Retina'da 1296 fiziksel
              pikseli demekti — yani görselin yaklaşık DÖRT KATI. Bulanıklığın
              sebebi buydu.

              Kutu artık kaynağın doğal genişliğini aşmıyor. Yüksek çözünürlüklü
              orijinal geldiğinde bu sınır kaldırılabilir; o güne kadar küçük ve
              net göstermek, büyük ve bulanık göstermekten iyidir.
            */}
            <Reveal>
              <div className="mx-auto w-full max-w-[330px] lg:mx-0">
                <div className="relative aspect-4/5 overflow-hidden rounded-card border border-ink-700">
                  {profile.portraitUrl ? (
                    <Image
                      src={profile.portraitUrl}
                      alt={profile.fullName}
                      fill
                      priority
                      sizes="330px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="size-full bg-ink-800" />
                  )}
                  <div className="scrim-bottom absolute inset-0" />
                </div>
              </div>
            </Reveal>

            <div>
              <Eyebrow>{profile.officeName}</Eyebrow>
              <RevealText
                as="h1"
                text={profile.fullName}
                className="mt-6 font-display text-5xl leading-[1.02] sm:text-6xl lg:text-7xl"
              />
              <p className="mt-4 text-sm uppercase tracking-[0.24em] text-cream-400">
                {profile.title}
              </p>
              <p className="mt-8 text-balance font-display text-2xl leading-snug text-cream-100 sm:text-3xl">
                {profile.tagline}
              </p>
              <p className="mt-6 text-base leading-relaxed text-cream-400">
                {profile.shortBio}
              </p>

              <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-ink-700 pt-10 sm:grid-cols-4">
                <Stat value={stats.sold} suffix="+" label="Satılan Konut" />
                <Stat value={stats.rented} suffix="+" label="Kiralanan Konut" />
                <Stat value={stats.years} label="Yıllık Tecrübe" />
                <Stat
                  value={stats.happyClients}
                  suffix="+"
                  label="Mutlu Müşteri"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Biyografi */}
      {profile.bio ? (
        <Section className="!pt-0">
          <Container>
            <div className="mx-auto max-w-3xl">
              <Quote className="size-8 text-brand-500" />
              <div className="mt-8 flex flex-col gap-6 text-lg leading-relaxed text-cream-300">
                {profile.bio.split("\n\n").map((paragraph, index) => (
                  <p
                    key={index}
                    dangerouslySetInnerHTML={{
                      __html: paragraph.replace(
                        /\*\*(.+?)\*\*/g,
                        '<strong class="text-cream-50 font-medium">$1</strong>',
                      ),
                    }}
                  />
                ))}
              </div>
            </div>
          </Container>
        </Section>
      ) : null}

      {/* Zaman çizelgesi */}
      {milestones.length > 0 ? (
        <Section className="bg-ink-950">
          <Container>
            <SectionHeading
              eyebrow="Yolculuk"
              title={
                <>
                  Bugüne{" "}
                  <span className="text-cream-500">nasıl geldim?</span>
                </>
              }
            />

            <ol className="mt-16 max-w-3xl">
              {milestones.map((milestone, index) => (
                <Reveal key={milestone.id} delay={index * 0.05} as="li">
                  <div className="relative grid gap-4 border-l border-ink-600 pb-12 pl-8 sm:grid-cols-[80px_1fr] sm:gap-8 sm:pl-12">
                    <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full bg-brand-500 ring-4 ring-ink-950" />
                    <span className="font-display text-2xl text-brand-500">
                      {milestone.year}
                    </span>
                    <div>
                      <h3 className="text-xl">{milestone.title}</h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-cream-400">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </Container>
        </Section>
      ) : null}

      {/* Sertifikalar */}
      {certificates.length > 0 ? (
        <Section>
          <Container>
            <SectionHeading
              eyebrow="Belgeler"
              title={
                <>
                  Eğitimler,{" "}
                  <span className="text-cream-500">sertifikalar ve ödüller</span>
                </>
              }
            />

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {certificates.map((certificate, index) => (
                <Reveal key={certificate.id} delay={(index % 3) * 0.06}>
                  <div className="flex h-full gap-4 rounded-card border border-ink-700 bg-ink-850 p-6">
                    <Award className="size-5 shrink-0 text-gold-400" />
                    <div>
                      <h3 className="text-base leading-snug">
                        {certificate.title}
                      </h3>
                      <p className="mt-2 text-xs text-cream-500">
                        {[certificate.issuer, certificate.year]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* Kapanış */}
      <Section className="bg-ink-950">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-4xl leading-[1.1] sm:text-5xl">
              Tanışalım mı?
            </h2>
            <p className="mt-5 text-base leading-relaxed text-cream-400">
              Almayı, satmayı ya da kiralamayı düşünüyorsanız; ilk görüşmede
              hiçbir yükümlülük yok. Sadece durumunuzu konuşalım.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/iletisim" size="lg">
                İletişime Geç
              </ButtonLink>
              <ButtonLink href="/portfoy" variant="outline" size="lg">
                Portföyü Gör
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

function Stat({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix?: string;
  label: string;
}) {
  return (
    <div>
      <p className="font-display text-4xl text-cream-50">
        <Counter value={value} suffix={suffix} />
      </p>
      <p className="mt-1.5 text-[11px] uppercase tracking-[0.16em] text-cream-500">
        {label}
      </p>
    </div>
  );
}
