import type { Metadata } from "next";
import { SearchX } from "lucide-react";

import { Reveal } from "@/components/animation/reveal";
import { CompareBar } from "@/components/property/compare-bar";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyFilters } from "@/components/property/property-filters";
import { SearchAssistant } from "@/components/property/search-assistant";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { prisma } from "@/lib/db";
import { propertyCardSelect } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Portföy — Satılık ve Kiralık İlanlar",
  description:
    "İstanbul'un iki yakasında satılık ve kiralık daire, villa, ofis ve arsa ilanları. Her ilan yerinde görülmüş ve fotoğraflanmıştır.",
  alternates: { canonical: "/portfoy" },
};

export const revalidate = 0;

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildWhere(params: SearchParams) {
  const listingType = first(params.listingType);
  const category = first(params.category);
  const region = first(params.region);
  const rooms = first(params.rooms);
  const status = first(params.status);
  const query = first(params.q);
  const minPrice = Number(first(params.minPrice));
  const maxPrice = Number(first(params.maxPrice));

  const where: Record<string, unknown> = { published: true };

  if (status === "closed") {
    where.status = { in: ["SOLD", "RENTED"] };
  } else if (status !== "all") {
    where.status = { in: ["ACTIVE", "RESERVED"] };
  }

  if (listingType) where.listingType = listingType;
  if (category) where.category = category;
  if (rooms) where.rooms = rooms;
  if (region) where.region = { slug: region };

  if (Number.isFinite(minPrice) && minPrice > 0) {
    where.price = { ...(where.price as object), gte: minPrice };
  }
  if (Number.isFinite(maxPrice) && maxPrice > 0) {
    where.price = { ...(where.price as object), lte: maxPrice };
  }

  if (query) {
    where.OR = [
      { title: { contains: query } },
      { district: { contains: query } },
      { neighborhood: { contains: query } },
      { city: { contains: query } },
      { summary: { contains: query } },
    ];
  }

  return where;
}

function buildOrderBy(sort?: string) {
  switch (sort) {
    case "price-asc":
      return { price: "asc" as const };
    case "price-desc":
      return { price: "desc" as const };
    case "area-desc":
      return { grossArea: "desc" as const };
    default:
      return { publishedAt: "desc" as const };
  }
}

export default async function PortfolioPage({
  searchParams,
}: PageProps<"/portfoy">) {
  const params = await searchParams;
  const where = buildWhere(params);
  const orderBy = buildOrderBy(first(params.sort));

  const [properties, regions, districts, priceAggregate] = await Promise.all([
    prisma.property.findMany({ where, orderBy, select: propertyCardSelect }),
    prisma.region.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true },
    }),
    prisma.property.findMany({
      where: { published: true },
      distinct: ["district"],
      select: { district: true },
    }),
    prisma.property.aggregate({
      where: { published: true },
      _max: { price: true },
    }),
  ]);

  return (
    <>
      <Section className="pt-32 sm:pt-40 lg:pt-44">
        <Container>
          <SectionHeading
            eyebrow="Portföy"
            title={
              <>
                Her ilan{" "}
                <span className="text-cream-500">bizzat gezildi.</span>
              </>
            }
            description="Portföyümdeki hiçbir ilanı görmeden yayına almam. Açıklamalarda okuduğunuz her ayrıntı, o evde geçirdiğim zamandan çıktı."
          />

          {/*
            Asistan filtrelerin ÜSTÜNDE duruyor: cümleyle arama, filtreleri tek
            tek açmaya göre daha hızlı bir giriş yolu. Filtreler kaldırılmadı —
            asistan aynı sorgu parametrelerini ürettiği için ikisi aynı sonucu
            verir, kullanıcı hangisini isterse onu kullanır.
          */}
          <div className="mt-12">
            <SearchAssistant />
          </div>

          <div className="mt-8">
            <PropertyFilters
              options={{
                regions,
                districts: districts.map((item) => item.district),
                maxPrice: priceAggregate._max.price ?? 25_000_000,
              }}
            />
          </div>

          <p className="mt-8 text-sm text-cream-500">
            {properties.length} ilan listeleniyor
          </p>

          {properties.length === 0 ? (
            <div className="mt-16 flex flex-col items-center rounded-card border border-dashed border-ink-600 py-20 text-center">
              <SearchX className="size-9 text-cream-500" />
              <h2 className="mt-6 text-2xl">Bu kriterlere uyan ilan yok</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-cream-400">
                Filtreleri gevşetmeyi deneyin. Aradığınız evi bulamadıysanız
                bana yazın — portföyümde yayınlanmamış seçenekler de
                olabiliyor.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property, index) => (
                <Reveal key={property.id} delay={(index % 3) * 0.06}>
                  <PropertyCard property={property} priority={index < 3} />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </Section>

      <CompareBar />
    </>
  );
}
