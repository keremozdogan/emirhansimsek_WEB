import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { deleteRegion } from "@/app/actions/admin";
import { RegionForm } from "@/components/admin/region-form";
import {
  AdminCard,
  AdminPageHeader,
  EmptyState,
  FormSection,
  StatusPill,
} from "@/components/admin/ui";
import { FormMessage } from "@/components/ui/form-fields";
import { prisma } from "@/lib/db";
import { parseJsonArray } from "@/lib/utils";

export const revalidate = 0;

export const metadata = { title: "Bölgeler" };

const EMPTY = {
  name: "",
  slug: "",
  city: "İstanbul",
  district: "",
  description: "",
  expertNote: "",
  coverUrl: null,
  avgPricePerSqm: null,
  avgRent: null,
  highlights: "",
  lat: null,
  lng: null,
  sortOrder: 0,
  published: true,
};

export default async function AdminRegionsPage({
  searchParams,
}: PageProps<"/admin/bolgeler">) {
  const params = await searchParams;
  const editId = Array.isArray(params.id) ? params.id[0] : params.id;
  const isNew = params.yeni === "1";
  const saved = params.kaydedildi === "1";

  const regions = await prisma.region.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { properties: true } } },
  });

  const editing = editId
    ? regions.find((region) => region.id === editId)
    : undefined;

  if (editId && !editing) notFound();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Bölgeler"
        description="Bölge rehberleri, ana sayfada ve ilan sayfalarında gösterilir. Uzman yorumu bölümü Google'dan organik ziyaretçi getirir."
        action={{ href: "/admin/bolgeler?yeni=1", label: "Yeni Bölge" }}
      />

      {saved ? <FormMessage ok message="Bölge kaydedildi." /> : null}

      {editing || isNew ? (
        <FormSection
          title={editing ? `${editing.name} — düzenle` : "Yeni bölge"}
        >
          <RegionForm
            values={
              editing
                ? {
                    id: editing.id,
                    name: editing.name,
                    slug: editing.slug,
                    city: editing.city,
                    district: editing.district,
                    description: editing.description,
                    expertNote: editing.expertNote,
                    coverUrl: editing.coverUrl,
                    avgPricePerSqm: editing.avgPricePerSqm,
                    avgRent: editing.avgRent,
                    highlights: parseJsonArray(editing.highlights).join("\n"),
                    lat: editing.lat,
                    lng: editing.lng,
                    sortOrder: editing.sortOrder,
                    published: editing.published,
                  }
                : EMPTY
            }
          />
        </FormSection>
      ) : null}

      {regions.length === 0 ? (
        <EmptyState
          title="Henüz bölge eklenmedi"
          description="Emirhan'ın uzman olduğu ilçe veya mahalleleri ekleyin. Her bölge için kendi saha yorumunu yazması siteyi belirgin şekilde güçlendirir."
          action={{ href: "/admin/bolgeler?yeni=1", label: "Yeni Bölge" }}
        />
      ) : (
        <div className="grid gap-3">
          {regions.map((region) => (
            <AdminCard
              key={region.id}
              className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base text-cream-50">{region.name}</h2>
                  {region.published ? (
                    <StatusPill tone="green">Yayında</StatusPill>
                  ) : (
                    <StatusPill tone="gray">Gizli</StatusPill>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-cream-500">
                  {region.district} · {region.city} ·{" "}
                  {region._count.properties} ilan · sıra {region.sortOrder}
                </p>
                <p className="mt-2 line-clamp-1 max-w-2xl text-sm text-cream-400">
                  {region.description}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/bolgeler/${region.slug}`}
                  target="_blank"
                  className="rounded-full border border-ink-600 px-4 py-2 text-xs text-cream-300 transition-colors hover:border-cream-400"
                >
                  Sitede gör
                </Link>
                <Link
                  href={`/admin/bolgeler?id=${region.id}`}
                  aria-label="Düzenle"
                  className="flex size-9 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-400"
                >
                  <Pencil className="size-4" />
                </Link>
                <form action={deleteRegion}>
                  <input type="hidden" name="id" value={region.id} />
                  <button
                    type="submit"
                    aria-label="Sil"
                    className="flex size-9 items-center justify-center rounded-full border border-ink-600 text-cream-500 transition-colors hover:border-brand-500 hover:text-brand-400"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      {!editing && !isNew ? (
        <Link
          href="/admin/bolgeler?yeni=1"
          className="inline-flex items-center gap-2 self-start text-sm text-brand-400 transition-colors hover:text-brand-500"
        >
          <Plus className="size-4" />
          Yeni bölge ekle
        </Link>
      ) : null}
    </div>
  );
}
