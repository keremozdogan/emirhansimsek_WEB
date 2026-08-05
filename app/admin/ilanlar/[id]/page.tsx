import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";

import { deleteProperty } from "@/app/actions/admin";
import { PropertyForm } from "@/components/admin/property-form";
import { AdminPageHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/db";

export const revalidate = 0;

export const metadata = { title: "İlanı Düzenle" };

export default async function EditPropertyPage({
  params,
  searchParams,
}: PageProps<"/admin/ilanlar/[id]">) {
  const { id } = await params;
  const query = await searchParams;

  const [property, regions] = await Promise.all([
    prisma.property.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        features: true,
      },
    }),
    prisma.region.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!property) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <AdminPageHeader
          title="İlanı Düzenle"
          description={property.title}
        />
      </div>

      <PropertyForm
        regions={regions}
        saved={query.kaydedildi === "1"}
        values={{
          id: property.id,
          slug: property.slug,
          title: property.title,
          listingType: property.listingType,
          status: property.status,
          category: property.category,
          price: property.price,
          currency: property.currency,
          grossArea: property.grossArea,
          netArea: property.netArea,
          rooms: property.rooms,
          bathrooms: property.bathrooms,
          buildingAge: property.buildingAge,
          floor: property.floor,
          totalFloors: property.totalFloors,
          heating: property.heating,
          dues: property.dues,
          deedStatus: property.deedStatus,
          facade: property.facade,
          furnished: property.furnished,
          creditEligible: property.creditEligible,
          balcony: property.balcony,
          parking: property.parking,
          featured: property.featured,
          published: property.published,
          city: property.city,
          district: property.district,
          neighborhood: property.neighborhood,
          lat: property.lat,
          lng: property.lng,
          summary: property.summary,
          description: property.description,
          listingNo: property.listingNo,
          remaxUrl: property.remaxUrl,
          videoUrl: property.videoUrl,
          tourUrl: property.tourUrl,
          daysOnMarket: property.daysOnMarket,
          closedPricePercent: property.closedPricePercent,
          closedAt: property.closedAt
            ? property.closedAt.toISOString().slice(0, 10)
            : null,
          regionId: property.regionId,
          seoTitle: property.seoTitle,
          seoDescription: property.seoDescription,
          images: property.images.map((image) => ({
            id: image.id,
            url: image.url,
            alt: image.alt,
            roomName: image.roomName ?? "",
            caption: image.caption ?? "",
            blurDataUrl: image.blurDataUrl,
            width: image.width,
            height: image.height,
          })),
          features: property.features.map((feature) => ({
            label: feature.label,
            group: feature.group,
          })),
        }}
      />

      {/* Silme — form dışında, yanlışlıkla gönderilmesin diye ayrı tutuldu */}
      <form action={deleteProperty} className="border-t border-ink-700 pt-8">
        <input type="hidden" name="id" value={property.id} />
        <p className="text-sm text-cream-400">
          Bu ilanı ve tüm fotoğraflarını kalıcı olarak silmek üzeresiniz. Bu
          işlem geri alınamaz.
        </p>
        <button
          type="submit"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-500/40 px-5 py-2.5 text-sm text-brand-400 transition-colors hover:border-brand-500 hover:bg-brand-500/10"
        >
          <Trash2 className="size-4" />
          İlanı sil
        </button>
      </form>
    </div>
  );
}
