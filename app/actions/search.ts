"use server";

import { prisma } from "@/lib/db";
import { propertyCardSelect } from "@/lib/queries";
import type { PropertyCardData } from "@/components/property/property-card";
import {
  filtersToSearchParams,
  parseQuery,
  type ParsedFilters,
} from "@/lib/search-assistant";

export type AssistantAnswer = {
  understood: string[];
  leftover: string[];
  filters: ParsedFilters;
  results: PropertyCardData[];
  /** Sonuçların tamamı için /portfoy bağlantısı */
  href: string;
  /** Filtreler gevşetilerek sonuç bulunduysa hangi ölçütün düştüğü */
  relaxed: string | null;
};

/** `parseQuery` çıktısını Prisma koşuluna çevirir. */
function toWhere(filters: ParsedFilters): Record<string, unknown> {
  const where: Record<string, unknown> = {
    published: true,
    status: { in: ["ACTIVE", "RESERVED"] },
  };

  if (filters.listingType) where.listingType = filters.listingType;
  if (filters.category) where.category = filters.category;
  if (filters.rooms) where.rooms = filters.rooms;
  if (filters.district) where.district = { contains: filters.district };
  if (filters.minArea) where.grossArea = { gte: filters.minArea };

  const price: Record<string, number> = {};
  if (filters.minPrice) price.gte = filters.minPrice;
  if (filters.maxPrice) price.lte = filters.maxPrice;
  if (Object.keys(price).length > 0) where.price = price;

  return where;
}

/**
 * Serbest metinden ilan arar.
 *
 * Anahtarsız: hiçbir dil modeline gitmez, `lib/search-assistant.ts` içindeki
 * kural tabanlı çözümleyiciyi kullanır.
 *
 * Sonuç boş çıkarsa filtreler TEK ADIM gevşetilir. Sıra bilinçli: önce fiyat,
 * sonra oda, sonra ilçe düşürülür. Sebebi, kullanıcının hangi ölçütten ödün
 * vermeye en yatkın olduğu — bütçe pazarlığa açıktır, oturulacak semt genelde
 * değildir. Hangi ölçütün düştüğü `relaxed` ile döndürülür ve arayüzde açıkça
 * yazılır; sessizce alakasız sonuç göstermek güveni bitirir.
 */
export async function askAssistant(input: string): Promise<AssistantAnswer> {
  const trimmed = input.trim().slice(0, 200);
  const { filters, understood, leftover } = parseQuery(trimmed);

  const runQuery = (where: Record<string, unknown>) =>
    prisma.property.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: propertyCardSelect,
    });

  let results = (await runQuery(toWhere(filters))) as PropertyCardData[];
  let relaxed: string | null = null;

  if (results.length === 0) {
    const relaxations: Array<[keyof ParsedFilters | "price", string]> = [
      ["price", "fiyat aralığı"],
      ["rooms", "oda sayısı"],
      ["district", "ilçe"],
    ];

    for (const [key, label] of relaxations) {
      const loosened: ParsedFilters = { ...filters };
      if (key === "price") {
        if (!loosened.minPrice && !loosened.maxPrice) continue;
        delete loosened.minPrice;
        delete loosened.maxPrice;
      } else {
        if (loosened[key] === undefined) continue;
        delete loosened[key];
      }

      const attempt = (await runQuery(toWhere(loosened))) as PropertyCardData[];
      if (attempt.length > 0) {
        results = attempt;
        relaxed = label;
        break;
      }
    }
  }

  const query = filtersToSearchParams(filters);

  return {
    understood,
    leftover,
    filters,
    results,
    href: query ? `/portfoy?${query}` : "/portfoy",
    relaxed,
  };
}
