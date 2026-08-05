"use client";

import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";

import { PropertyCard } from "@/components/property/property-card";
import { useFavorites, useHydrated } from "@/components/property/use-favorites";
import { usePropertyList } from "@/components/property/use-property-list";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";

export default function FavoritesPage() {
  const { ids, clear } = useFavorites();
  const hydrated = useHydrated();
  const { properties, loading } = usePropertyList(hydrated ? ids : []);

  return (
    <Section className="pt-32 sm:pt-40 lg:pt-44">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Favorilerim"
            title={
              <>
                Beğendiğiniz{" "}
                <span className="text-cream-500">ilanlar.</span>
              </>
            }
            description="Favorileriniz yalnızca bu cihazda saklanır; hesap açmanıza gerek yok."
          />

          {hydrated && ids.length > 0 ? (
            <button
              type="button"
              onClick={clear}
              className="flex shrink-0 items-center gap-2 self-start text-sm text-cream-400 transition-colors hover:text-brand-400 sm:self-auto"
            >
              <Trash2 className="size-4" />
              Listeyi temizle
            </button>
          ) : null}
        </div>

        {!hydrated || loading ? (
          <p className="mt-16 text-sm text-cream-500">Yükleniyor…</p>
        ) : properties.length === 0 ? (
          <div className="mt-16 flex flex-col items-center rounded-card border border-dashed border-ink-600 py-20 text-center">
            <Heart className="size-9 text-cream-500" />
            <h2 className="mt-6 text-2xl">Henüz favoriniz yok</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-cream-400">
              İlan kartlarındaki kalp simgesine dokunarak beğendiğiniz evleri
              buraya ekleyebilirsiniz.
            </p>
            <ButtonLink href="/portfoy" className="mt-8">
              Portföyü Gez
            </ButtonLink>
          </div>
        ) : (
          <>
            <p className="mt-10 text-sm text-cream-500">
              {properties.length} ilan
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            <p className="mt-12 text-sm text-cream-400">
              Bu ilanları karşılaştırmak ister misiniz?{" "}
              <Link
                href="/karsilastir"
                className="text-brand-400 transition-colors hover:text-brand-500"
              >
                Karşılaştırma sayfasına gidin →
              </Link>
            </p>
          </>
        )}
      </Container>
    </Section>
  );
}
