import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Pencil, Star } from "lucide-react";

import { togglePropertyPublished } from "@/app/actions/admin";
import { AdminPageHeader, EmptyState, StatusPill } from "@/components/admin/ui";
import {
  LISTING_TYPE_LABELS,
  PROPERTY_CATEGORY_LABELS,
  PROPERTY_STATUS_LABELS,
  type ListingType,
  type PropertyCategory,
  type PropertyStatus,
} from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDateShort, formatPriceCompact } from "@/lib/utils";

export const revalidate = 0;

export const metadata = { title: "İlanlar" };

const TABS = [
  { key: "", label: "Tümü" },
  { key: "active", label: "Yayında" },
  { key: "closed", label: "Tamamlanan" },
  { key: "draft", label: "Taslak" },
];

export default async function AdminPropertiesPage({
  searchParams,
}: PageProps<"/admin/ilanlar">) {
  const params = await searchParams;
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const published = Array.isArray(params.published)
    ? params.published[0]
    : params.published;

  const where: Record<string, unknown> = {};
  let activeTab = "";

  if (status === "closed") {
    where.status = { in: ["SOLD", "RENTED"] };
    activeTab = "closed";
  } else if (status === "active") {
    where.status = { in: ["ACTIVE", "RESERVED"] };
    where.published = true;
    activeTab = "active";
  } else if (published === "false") {
    where.published = false;
    activeTab = "draft";
  }

  const properties = await prisma.property.findMany({
    where,
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      _count: { select: { images: true, leads: true } },
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="İlanlar"
        description="Portföydeki tüm ilanlar. Fotoğraf sayısı sütunu, ev turunun kaç kareden oluştuğunu gösterir."
        action={{ href: "/admin/ilanlar/yeni", label: "Yeni İlan" }}
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const href =
            tab.key === ""
              ? "/admin/ilanlar"
              : tab.key === "draft"
                ? "/admin/ilanlar?published=false"
                : `/admin/ilanlar?status=${tab.key}`;

          return (
            <Link
              key={tab.key}
              href={href}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                activeTab === tab.key
                  ? "bg-brand-500 text-white"
                  : "border border-ink-600 text-cream-400 hover:border-cream-400"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {properties.length === 0 ? (
        <EmptyState
          title="Bu listede ilan yok"
          description="Yeni bir ilan ekleyerek başlayın. Fotoğrafları ve ev turu metinlerini ilan formunda girebilirsiniz."
          action={{ href: "/admin/ilanlar/yeni", label: "Yeni İlan" }}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {properties.map((property) => (
            <li
              key={property.id}
              className="flex flex-col gap-4 rounded-card border border-ink-700 bg-ink-850 p-4 sm:flex-row sm:items-center"
            >
              <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-lg bg-ink-800 sm:size-24">
                {property.images[0] ? (
                  <Image
                    src={property.images[0].url}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-[10px] text-cream-500">
                    Fotoğraf yok
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {property.featured ? (
                    <Star className="size-3.5 fill-gold-400 text-gold-400" />
                  ) : null}
                  <Link
                    href={`/admin/ilanlar/${property.id}`}
                    className="truncate text-sm text-cream-50 transition-colors hover:text-brand-400"
                  >
                    {property.title}
                  </Link>
                </div>

                <p className="mt-1.5 text-xs text-cream-500">
                  {LISTING_TYPE_LABELS[property.listingType as ListingType]} ·{" "}
                  {
                    PROPERTY_CATEGORY_LABELS[
                      property.category as PropertyCategory
                    ]
                  }{" "}
                  · {property.district} ·{" "}
                  {formatPriceCompact(property.price, property.currency)} ·{" "}
                  {property._count.images} fotoğraf
                  {property._count.leads > 0
                    ? ` · ${property._count.leads} talep`
                    : null}
                </p>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <StatusPill
                    tone={
                      property.status === "ACTIVE"
                        ? "green"
                        : property.status === "RESERVED"
                          ? "amber"
                          : "blue"
                    }
                  >
                    {PROPERTY_STATUS_LABELS[property.status as PropertyStatus]}
                  </StatusPill>
                  {property.published ? null : (
                    <StatusPill tone="gray">Taslak</StatusPill>
                  )}
                  <span className="text-[11px] text-cream-400">
                    {formatDateShort(property.updatedAt)}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <form action={togglePropertyPublished}>
                  <input type="hidden" name="id" value={property.id} />
                  <input
                    type="hidden"
                    name="published"
                    value={String(!property.published)}
                  />
                  <button
                    type="submit"
                    className="rounded-full border border-ink-600 px-3.5 py-2 text-xs text-cream-300 transition-colors hover:border-cream-400"
                  >
                    {property.published ? "Yayından kaldır" : "Yayınla"}
                  </button>
                </form>

                <Link
                  href={`/portfoy/${property.slug}`}
                  target="_blank"
                  aria-label="Sitede görüntüle"
                  title="Sitede görüntüle"
                  className="flex size-9 items-center justify-center rounded-full border border-ink-600 text-cream-300 transition-colors hover:border-cream-400"
                >
                  <ExternalLink className="size-4" />
                </Link>

                <Link
                  href={`/admin/ilanlar/${property.id}`}
                  aria-label="Düzenle"
                  title="Düzenle"
                  className="flex size-9 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-400"
                >
                  <Pencil className="size-4" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
