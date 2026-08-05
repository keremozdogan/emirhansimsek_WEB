"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, GitCompareArrows, Minus, X } from "lucide-react";

import { useCompare, useHydrated } from "@/components/property/use-favorites";
import { usePropertyList } from "@/components/property/use-property-list";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import {
  LISTING_TYPE_LABELS,
  PROPERTY_CATEGORY_LABELS,
  type ListingType,
  type PropertyCategory,
} from "@/lib/constants";
import { formatArea, formatPrice } from "@/lib/utils";
import type { StoredProperty } from "@/components/property/use-property-list";

type Row = {
  label: string;
  value: (property: StoredProperty) => React.ReactNode;
};

const ROWS: Row[] = [
  {
    label: "Fiyat",
    value: (p) => (
      <span className="font-display text-xl text-cream-50">
        {formatPrice(p.price, p.currency)}
        {p.listingType === "RENT" ? (
          <span className="ml-1 font-sans text-xs text-cream-400">/ay</span>
        ) : null}
      </span>
    ),
  },
  {
    label: "m² birim fiyatı",
    value: (p) =>
      p.netArea
        ? formatPrice(Math.round(p.price / p.netArea), p.currency)
        : null,
  },
  {
    label: "İlan tipi",
    value: (p) => LISTING_TYPE_LABELS[p.listingType as ListingType],
  },
  {
    label: "Kategori",
    value: (p) => PROPERTY_CATEGORY_LABELS[p.category as PropertyCategory],
  },
  {
    label: "Konum",
    value: (p) => [p.neighborhood, p.district].filter(Boolean).join(", "),
  },
  { label: "Bölge", value: (p) => p.region?.name ?? null },
  { label: "Brüt alan", value: (p) => formatArea(p.grossArea) },
  { label: "Net alan", value: (p) => formatArea(p.netArea) },
  { label: "Oda sayısı", value: (p) => p.rooms },
  { label: "Banyo", value: (p) => (p.bathrooms ? `${p.bathrooms}` : null) },
  { label: "Bina yaşı", value: (p) => p.buildingAge },
  { label: "Bulunduğu kat", value: (p) => p.floor },
  { label: "Isıtma", value: (p) => p.heating },
  {
    label: "Aidat",
    value: (p) => (p.dues ? `${formatPrice(p.dues)} / ay` : null),
  },
  { label: "Tapu durumu", value: (p) => p.deedStatus },
  { label: "Cephe", value: (p) => p.facade },
  { label: "Balkon", value: (p) => <BoolCell value={p.balcony} /> },
  { label: "Otopark", value: (p) => <BoolCell value={p.parking} /> },
  { label: "Eşyalı", value: (p) => <BoolCell value={p.furnished} /> },
  {
    label: "Krediye uygun",
    value: (p) => <BoolCell value={p.creditEligible} />,
  },
  { label: "Özellik sayısı", value: (p) => `${p.features.length} özellik` },
];

export default function ComparePage() {
  const { ids, remove, clear } = useCompare();
  const hydrated = useHydrated();
  const { properties, loading } = usePropertyList(hydrated ? ids : []);

  return (
    <Section className="pt-32 sm:pt-40 lg:pt-44">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Karşılaştırma"
            title={
              <>
                Yan yana{" "}
                <span className="text-cream-500">görün, kolay karar verin.</span>
              </>
            }
          />
          {hydrated && ids.length > 0 ? (
            <button
              type="button"
              onClick={clear}
              className="shrink-0 self-start text-sm text-cream-400 transition-colors hover:text-brand-400 sm:self-auto"
            >
              Listeyi temizle
            </button>
          ) : null}
        </div>

        {!hydrated || loading ? (
          <p className="mt-16 text-sm text-cream-500">Yükleniyor…</p>
        ) : properties.length === 0 ? (
          <div className="mt-16 flex flex-col items-center rounded-card border border-dashed border-ink-600 py-20 text-center">
            <GitCompareArrows className="size-9 text-cream-500" />
            <h2 className="mt-6 text-2xl">Karşılaştırma listeniz boş</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-cream-400">
              İlan detay sayfalarındaki &quot;Karşılaştır&quot; düğmesiyle en
              fazla üç ilanı buraya ekleyip özelliklerini yan yana
              görebilirsiniz.
            </p>
            <ButtonLink href="/portfoy" className="mt-8">
              Portföyü Gez
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  <th className="w-40 text-left align-bottom" />
                  {properties.map((property) => (
                    <th key={property.id} className="p-3 align-bottom">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => remove(property.id)}
                          aria-label={`${property.title} karşılaştırmadan çıkar`}
                          className="absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-full border border-white/20 bg-ink-950/70 text-cream-200 backdrop-blur-sm transition-colors hover:border-white/50"
                        >
                          <X className="size-3.5" />
                        </button>

                        <Link href={`/portfoy/${property.slug}`} className="group block">
                          <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-ink-700">
                            {property.images[0] ? (
                              <Image
                                src={property.images[0].url}
                                alt={property.images[0].alt || property.title}
                                fill
                                sizes="33vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                            ) : null}
                          </div>
                          <p className="mt-3 line-clamp-2 text-left text-sm font-normal leading-snug text-cream-100 transition-colors group-hover:text-brand-400">
                            {property.title}
                          </p>
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label} className="border-t border-ink-700">
                    <th
                      scope="row"
                      className="py-4 pr-4 text-left align-middle text-xs font-medium uppercase tracking-wider text-cream-500"
                    >
                      {row.label}
                    </th>
                    {properties.map((property) => {
                      const value = row.value(property);
                      return (
                        <td
                          key={property.id}
                          className="p-4 align-middle text-sm text-cream-200"
                        >
                          {value || <Minus className="size-4 text-ink-500" />}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </Section>
  );
}

function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <Check className="size-4 text-emerald-400" aria-label="Var" />
  ) : (
    <X className="size-4 text-ink-500" aria-label="Yok" />
  );
}
