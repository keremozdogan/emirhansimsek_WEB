import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/db";

/**
 * Favoriler ve karşılaştırma listeleri tarayıcıda (localStorage) tutulduğu için
 * ilgili ilanların verisi bu uç noktadan çekilir.
 *
 * Yalnızca yayındaki ilanları döner ve en fazla 24 kayıt verir.
 */
export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids");
  const ids = (idsParam ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 24);

  if (ids.length === 0) {
    return NextResponse.json({ properties: [] });
  }

  const properties = await prisma.property.findMany({
    where: { id: { in: ids }, published: true },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { url: true, alt: true, blurDataUrl: true },
      },
      features: { select: { label: true, group: true } },
      region: { select: { name: true, slug: true } },
    },
  });

  // İstemcideki sıralamayı koru
  const byId = new Map(properties.map((property) => [property.id, property]));
  const ordered = ids
    .map((id) => byId.get(id))
    .filter((property): property is (typeof properties)[number] =>
      Boolean(property),
    );

  return NextResponse.json({ properties: ordered });
}
