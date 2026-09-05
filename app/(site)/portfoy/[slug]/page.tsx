import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarCheck,
  MapPin,
  MessageCircle,
  Phone,
  TrendingUp,
} from "lucide-react";

import { Reveal } from "@/components/animation/reveal";
import { LeadForm } from "@/components/forms/lead-form";
import { CompareButton } from "@/components/property/compare-button";
import { FavoriteButton } from "@/components/property/favorite-button";
import { MapPanel } from "@/components/property/map-panel";
import { MortgageCalculator } from "@/components/property/mortgage-calculator";
import { getMortgageRate } from "@/lib/mortgage-rate";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyGallery } from "@/components/property/property-gallery";
import {
  PropertyFacts,
  PropertyFeatureList,
} from "@/components/property/property-facts";
import { PropertyTour } from "@/components/property/property-tour";
import { ExternalButtonLink } from "@/components/ui/button";
import {
  Badge,
  Container,
  Eyebrow,
  Section,
} from "@/components/ui/primitives";
import {
  LISTING_TYPE_LABELS,
  PROPERTY_CATEGORY_LABELS,
  type ListingType,
  type PropertyCategory,
} from "@/lib/constants";
import { prisma } from "@/lib/db";
import { getProfile, propertyCardSelect } from "@/lib/queries";
import { formatArea, formatDate, formatPrice, whatsAppLink } from "@/lib/utils";

export const revalidate = 0;

async function getProperty(slug: string) {
  return prisma.property.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      features: true,
      region: true,
      testimonials: { where: { published: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: PageProps<"/portfoy/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) return { title: "İlan bulunamadı" };

  const title = property.seoTitle ?? property.title;
  const description =
    property.seoDescription ?? property.summary ?? property.description.slice(0, 160);
  const image = property.images[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `/portfoy/${property.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: PageProps<"/portfoy/[slug]">) {
  const { slug } = await params;
  const [property, profile] = await Promise.all([
    getProperty(slug),
    getProfile(),
  ]);

  if (!property || !property.published) notFound();

  const similar = await prisma.property.findMany({
    where: {
      published: true,
      status: { in: ["ACTIVE", "RESERVED"] },
      slug: { not: property.slug },
      OR: [
        { regionId: property.regionId ?? undefined },
        { district: property.district },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: propertyCardSelect,
  });

  const narrated = property.images.filter((image) => image.roomName);
  const tourImages = narrated.length > 0 ? narrated : property.images.slice(0, 12);

  const isClosed = property.status === "SOLD" || property.status === "RENTED";
  const isRent = property.listingType === "RENT";
  const location = [property.neighborhood, property.district, property.city]
    .filter(Boolean)
    .join(", ");

  const whatsappMessage = `Merhaba, ${property.title} (İlan No: ${property.listingNo ?? property.slug}) hakkında bilgi almak istiyorum.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isRent ? "RentAction" : "RealEstateListing",
    name: property.title,
    description: property.summary || property.description.slice(0, 300),
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/portfoy/${property.slug}`,
    image: property.images.map((image) => image.url),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: property.currency,
      availability: isClosed
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: property.district,
      addressRegion: property.city,
      addressCountry: "TR",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* SİNEMATİK EV TURU
          Turda yalnızca oda adı girilmiş fotoğraflar kullanılır — böylece 40+
          fotoğraflı ilanlarda tur bitmek bilmez bir kaydırmaya dönüşmez.
          Hiç oda adı girilmemişse ilk 12 fotoğrafa düşülür. */}
      <PropertyTour
        images={tourImages}
        videoUrl={property.videoUrl}
        title={property.title}
        /* Karttaki görselle aynı ad — ikisi arasında morph eder */
        vtName={`ilan-${property.id}`}
      />

      {/* Başlık ve fiyat */}
      <Section className="pt-16 sm:pt-20">
        <Container>
          <Link
            href="/portfoy"
            className="inline-flex items-center gap-2 text-sm text-cream-400 transition-colors hover:text-cream-50"
          >
            <ArrowLeft className="size-4" />
            Portföye dön
          </Link>

          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2">
                <Badge tone={isRent ? "navy" : "brand"}>
                  {LISTING_TYPE_LABELS[property.listingType as ListingType]}
                </Badge>
                <Badge tone="neutral">
                  {
                    PROPERTY_CATEGORY_LABELS[
                      property.category as PropertyCategory
                    ]
                  }
                </Badge>
                {isClosed ? (
                  <Badge tone="success">
                    {property.status === "SOLD" ? "Satıldı" : "Kiralandı"}
                    {property.closedAt
                      ? ` · ${formatDate(property.closedAt)}`
                      : null}
                  </Badge>
                ) : null}
                {property.status === "RESERVED" ? (
                  <Badge tone="gold">Rezerve</Badge>
                ) : null}
              </div>

              <h1 className="mt-5 text-balance text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
                {property.title}
              </h1>

              <p className="mt-5 flex items-center gap-2 text-sm text-cream-400">
                <MapPin className="size-4" />
                {location}
                {property.region ? (
                  <>
                    <span className="text-ink-500">·</span>
                    <Link
                      href={`/bolgeler/${property.region.slug}`}
                      className="text-brand-400 transition-colors hover:text-brand-500"
                    >
                      {property.region.name} bölge rehberi
                    </Link>
                  </>
                ) : null}
              </p>
            </div>

            <div className="shrink-0 lg:text-right">
              <p className="font-display text-4xl text-cream-50 sm:text-5xl">
                {formatPrice(property.price, property.currency)}
                {isRent ? (
                  <span className="ml-1 font-sans text-base font-normal text-cream-400">
                    /ay
                  </span>
                ) : null}
              </p>
              {property.netArea ? (
                <p className="mt-2 text-sm text-cream-500">
                  {formatArea(property.netArea)} net ·{" "}
                  {formatPrice(
                    Math.round(property.price / property.netArea),
                    property.currency,
                  )}
                  /m²
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-2 lg:justify-end">
                <FavoriteButton
                  propertyId={property.id}
                  title={property.title}
                  className="size-11 border-ink-600 bg-ink-850"
                />
                <CompareButton propertyId={property.id} />
                <ExternalButtonLink
                  href={whatsAppLink(profile.whatsapp, whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                >
                  <MessageCircle className="size-4" />
                  WhatsApp
                </ExternalButtonLink>
                <ExternalButtonLink
                  href={`tel:${profile.phone.replace(/\s/g, "")}`}
                >
                  <Phone className="size-4" />
                  Hemen Ara
                </ExternalButtonLink>
              </div>
            </div>
          </div>

          {/* Kapanan işlemlerde başarı rakamları */}
          {isClosed && (property.daysOnMarket || property.closedPricePercent) ? (
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {property.daysOnMarket ? (
                <StatTile
                  Icon={CalendarCheck}
                  value={`${property.daysOnMarket} gün`}
                  label={
                    property.status === "SOLD"
                      ? "Satış süresi"
                      : "Kiralama süresi"
                  }
                />
              ) : null}
              {property.closedPricePercent ? (
                <StatTile
                  Icon={TrendingUp}
                  value={`%${property.closedPricePercent}`}
                  label="Liste fiyatına oranla kapanış"
                />
              ) : null}
              <StatTile
                Icon={Building2}
                value={property.district}
                label="Bölge"
              />
            </div>
          ) : null}
        </Container>
      </Section>

      {/* Açıklama + özellikler + yan panel */}
      <Section className="!pt-0">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
            <div className="flex flex-col gap-14">
              <div>
                <Eyebrow>İlan Açıklaması</Eyebrow>
                <div className="mt-6 flex flex-col gap-5 text-base leading-relaxed text-cream-300">
                  {property.description.split("\n\n").map((paragraph, index) => (
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

              <div>
                <Eyebrow>Teknik Bilgiler</Eyebrow>
                <div className="mt-6">
                  <PropertyFacts property={property} />
                </div>
              </div>

              {property.features.length > 0 ? (
                <div>
                  <Eyebrow>Özellikler</Eyebrow>
                  <div className="mt-6">
                    <PropertyFeatureList features={property.features} />
                  </div>
                </div>
              ) : null}

              {property.images.length > tourImages.length ? (
                <div>
                  <Eyebrow>Tüm Fotoğraflar</Eyebrow>
                  <p className="mt-4 text-sm text-cream-500">
                    {property.images.length} fotoğraf · büyütmek için dokunun
                  </p>
                  <div className="mt-6">
                    <PropertyGallery images={property.images} />
                  </div>
                </div>
              ) : null}

              {property.lat !== null && property.lng !== null ? (
                <div>
                  <Eyebrow>Konum</Eyebrow>
                  <MapPanel
                    lat={property.lat}
                    lng={property.lng}
                    label={location}
                    className="mt-6"
                  />
                </div>
              ) : null}
            </div>

            {/* Yapışkan yan panel */}
            <aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-card border border-ink-700 bg-ink-850 p-6 sm:p-7">
                <h3 className="text-lg">Bu ilan hakkında soru sorun</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream-400">
                  {profile.fullName} size aynı gün içinde dönüş yapar.
                </p>
                <div className="mt-6">
                  <LeadForm
                    type="PROPERTY_INQUIRY"
                    propertyId={property.id}
                    source={`/portfoy/${property.slug}`}
                    compact
                    defaultMessage={`${property.title} ilanı için randevu almak istiyorum.`}
                    submitLabel="Bilgi İste"
                  />
                </div>
              </div>

              {!isRent && !isClosed ? (
                <MortgageCalculator
                  price={property.price}
                  rate={getMortgageRate()}
                />
              ) : null}
            </aside>
          </div>
        </Container>
      </Section>

      {/* İlgili müşteri yorumu */}
      {property.testimonials.length > 0 ? (
        <Section className="bg-ink-950 !py-20">
          <Container>
            {property.testimonials.map((testimonial) => (
              <figure key={testimonial.id} className="mx-auto max-w-3xl text-center">
                <Eyebrow>Bu İşlemden</Eyebrow>
                <blockquote className="mt-7 font-display text-2xl leading-relaxed text-cream-100 sm:text-3xl">
                  “{testimonial.text}”
                </blockquote>
                <figcaption className="mt-7 text-sm text-cream-500">
                  {testimonial.authorName}
                  {testimonial.authorTitle ? ` · ${testimonial.authorTitle}` : null}
                </figcaption>
              </figure>
            ))}
          </Container>
        </Section>
      ) : null}

      {/* Benzer ilanlar */}
      {similar.length > 0 ? (
        <Section>
          <Container>
            <Eyebrow>Benzer İlanlar</Eyebrow>
            <h2 className="mt-5 text-3xl sm:text-4xl">
              Aynı bölgede beğenebilecekleriniz
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((item, index) => (
                <Reveal key={item.id} delay={index * 0.07}>
                  <PropertyCard property={item} />
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}
    </>
  );
}

function StatTile({
  Icon,
  value,
  label,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-card border border-ink-700 bg-ink-850 p-6">
      <Icon className="size-5 text-brand-500" />
      <p className="mt-4 font-display text-3xl">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-cream-500">
        {label}
      </p>
    </div>
  );
}
