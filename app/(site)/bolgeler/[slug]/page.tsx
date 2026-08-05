import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/animation/reveal";
import { MapPanel } from "@/components/property/map-panel";
import { PropertyCard } from "@/components/property/property-card";
import { ButtonLink } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { Container, Eyebrow, Section } from "@/components/ui/primitives";
import { prisma } from "@/lib/db";
import { propertyCardSelect } from "@/lib/queries";
import { formatNumber, formatPrice, parseJsonArray } from "@/lib/utils";

export const revalidate = 0;

async function getRegion(slug: string) {
  return prisma.region.findUnique({ where: { slug } });
}

export async function generateMetadata({
  params,
}: PageProps<"/bolgeler/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const region = await getRegion(slug);
  if (!region) return { title: "Bölge bulunamadı" };

  return {
    title: `${region.name} Gayrimenkul Rehberi`,
    description: region.description,
    alternates: { canonical: `/bolgeler/${region.slug}` },
    openGraph: {
      title: `${region.name} Gayrimenkul Rehberi`,
      description: region.description,
      images: region.coverUrl ? [{ url: region.coverUrl }] : undefined,
    },
  };
}

export default async function RegionDetailPage({
  params,
}: PageProps<"/bolgeler/[slug]">) {
  const { slug } = await params;
  const region = await getRegion(slug);

  if (!region || !region.published) notFound();

  const [active, closed] = await Promise.all([
    prisma.property.findMany({
      where: {
        regionId: region.id,
        published: true,
        status: { in: ["ACTIVE", "RESERVED"] },
      },
      orderBy: { publishedAt: "desc" },
      select: propertyCardSelect,
    }),
    prisma.property.findMany({
      where: {
        regionId: region.id,
        published: true,
        status: { in: ["SOLD", "RENTED"] },
      },
      orderBy: { closedAt: "desc" },
      take: 3,
      select: propertyCardSelect,
    }),
  ]);

  const highlights = parseJsonArray(region.highlights);

  return (
    <>
      {/* Kapak */}
      <section className="relative flex h-[62svh] min-h-[440px] items-end overflow-hidden">
        {region.coverUrl ? (
          <Image
            src={region.coverUrl}
            alt={region.name}
            fill
            priority
            sizes="100vw"
            className="ken-burns object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-ink-800" />
        )}
        <div className="scrim-full absolute inset-0" />

        <Container className="relative z-10 pb-16">
          <Eyebrow>Bölge Rehberi</Eyebrow>
          <h1 className="mt-5 font-display text-5xl leading-none sm:text-7xl">
            {region.name}
          </h1>
          <p className="mt-4 text-sm uppercase tracking-[0.2em] text-cream-400">
            {region.district} · {region.city}
          </p>
        </Container>
      </section>

      {/* Bölge künyesi */}
      <Section className="!py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <div>
              <p className="text-balance text-xl leading-relaxed text-cream-200 sm:text-2xl">
                {region.description}
              </p>

              {highlights.length > 0 ? (
                <ul className="mt-8 flex flex-wrap gap-2">
                  {highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="rounded-full border border-ink-600 px-4 py-2 text-xs text-cream-200"
                    >
                      {highlight}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <dl className="grid grid-cols-2 gap-4 self-start">
              {region.avgPricePerSqm ? (
                <div className="rounded-card border border-ink-700 bg-ink-850 p-5">
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-cream-500">
                    Ort. m² fiyatı
                  </dt>
                  <dd className="mt-2 font-display text-2xl text-gold-400">
                    {formatNumber(region.avgPricePerSqm)} ₺
                  </dd>
                </div>
              ) : null}
              {region.avgRent ? (
                <div className="rounded-card border border-ink-700 bg-ink-850 p-5">
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-cream-500">
                    Ort. kira
                  </dt>
                  <dd className="mt-2 font-display text-2xl text-cream-50">
                    {formatPrice(region.avgRent)}
                  </dd>
                </div>
              ) : null}
              <div className="rounded-card border border-ink-700 bg-ink-850 p-5">
                <dt className="text-[11px] uppercase tracking-[0.16em] text-cream-500">
                  Aktif ilan
                </dt>
                <dd className="mt-2 font-display text-2xl text-cream-50">
                  {active.length}
                </dd>
              </div>
              <div className="rounded-card border border-ink-700 bg-ink-850 p-5">
                <dt className="text-[11px] uppercase tracking-[0.16em] text-cream-500">
                  Kapanan işlem
                </dt>
                <dd className="mt-2 font-display text-2xl text-cream-50">
                  {closed.length}
                </dd>
              </div>
            </dl>
          </div>
        </Container>
      </Section>

      {/* Uzman yorumu */}
      {region.expertNote ? (
        <Section className="bg-ink-950 !py-20">
          <Container>
            <div className="mx-auto max-w-3xl">
              <Eyebrow>Emirhan&apos;ın Bölge Yorumu</Eyebrow>
              <Markdown content={region.expertNote} className="mt-8" />
            </div>
          </Container>
        </Section>
      ) : null}

      {/* Harita */}
      {region.lat !== null && region.lng !== null ? (
        <Section className="!py-16">
          <Container>
            <MapPanel
              lat={region.lat}
              lng={region.lng}
              label={`${region.name}, ${region.city}`}
            />
          </Container>
        </Section>
      ) : null}

      {/* Bölgedeki ilanlar */}
      {active.length > 0 ? (
        <Section className="!pt-8">
          <Container>
            <Eyebrow>Bu Bölgedeki İlanlar</Eyebrow>
            <h2 className="mt-5 text-3xl sm:text-4xl">
              {region.name}&apos;de portföyüm
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {active.map((property, index) => (
                <Reveal key={property.id} delay={(index % 3) * 0.06}>
                  <PropertyCard property={property} />
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* Bölgedeki kapanan işlemler */}
      {closed.length > 0 ? (
        <Section className="bg-ink-950">
          <Container>
            <Eyebrow>Bu Bölgede Tamamladıklarım</Eyebrow>
            <h2 className="mt-5 text-3xl sm:text-4xl">
              Sonuçlanan işlemler
            </h2>
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

      <Section className="!py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl leading-tight sm:text-4xl">
              {region.name}&apos;de bir eviniz mi var?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-cream-400">
              Bu bölgedeki güncel satışlarla karşılaştırıp evinizin gerçekçi
              değer aralığını paylaşayım.
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
