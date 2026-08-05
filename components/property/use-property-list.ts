"use client";

import { useEffect, useState } from "react";

export type StoredProperty = {
  id: string;
  slug: string;
  title: string;
  listingType: string;
  status: string;
  category: string;
  price: number;
  currency: string;
  grossArea: number | null;
  netArea: number | null;
  rooms: string | null;
  bathrooms: number | null;
  buildingAge: string | null;
  floor: string | null;
  totalFloors: number | null;
  heating: string | null;
  dues: number | null;
  furnished: boolean;
  creditEligible: boolean;
  deedStatus: string | null;
  balcony: boolean;
  parking: boolean;
  facade: string | null;
  city: string;
  district: string;
  neighborhood: string | null;
  summary: string;
  listingNo: string | null;
  daysOnMarket: number | null;
  closedPricePercent: number | null;
  images: Array<{ url: string; alt: string; blurDataUrl: string | null }>;
  features: Array<{ label: string; group: string }>;
  region: { name: string; slug: string } | null;
};

type Result = { key: string; properties: StoredProperty[] };

const EMPTY: StoredProperty[] = [];

/**
 * localStorage'daki id listesine karşılık gelen ilanları sunucudan çeker.
 *
 * Sonuç, hangi id listesine ait olduğuyla birlikte saklanır; böylece liste
 * değiştiğinde eski veri gösterilmez ve "yükleniyor" durumu ek bir state
 * gerektirmeden türetilebilir.
 */
export function usePropertyList(ids: string[]) {
  const key = ids.join(",");
  const [result, setResult] = useState<Result>({ key: "", properties: EMPTY });

  useEffect(() => {
    if (!key) return;

    const controller = new AbortController();

    fetch(`/api/properties?ids=${encodeURIComponent(key)}`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : { properties: [] }))
      .then((data: { properties: StoredProperty[] }) => {
        setResult({ key, properties: data.properties ?? EMPTY });
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setResult({ key, properties: EMPTY });
      });

    return () => controller.abort();
  }, [key]);

  if (!key) {
    return { properties: EMPTY, loading: false };
  }

  return {
    properties: result.key === key ? result.properties : EMPTY,
    loading: result.key !== key,
  };
}
