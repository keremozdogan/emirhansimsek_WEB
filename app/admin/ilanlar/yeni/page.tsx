import { AdminPageHeader } from "@/components/admin/ui";
import { PropertyForm } from "@/components/admin/property-form";
import { prisma } from "@/lib/db";

export const revalidate = 0;

export const metadata = { title: "Yeni İlan" };

export default async function NewPropertyPage() {
  const regions = await prisma.region.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Yeni İlan"
        description="Zorunlu alanlar: başlık, fiyat, il, ilçe ve açıklama. Fotoğrafları sonradan da ekleyebilirsiniz."
      />

      <PropertyForm
        regions={regions}
        values={{
          title: "",
          listingType: "SALE",
          status: "ACTIVE",
          category: "APARTMENT",
          price: "",
          currency: "TRY",
          grossArea: null,
          netArea: null,
          rooms: null,
          bathrooms: null,
          buildingAge: null,
          floor: null,
          totalFloors: null,
          heating: null,
          dues: null,
          deedStatus: null,
          facade: null,
          furnished: false,
          creditEligible: true,
          balcony: false,
          parking: false,
          featured: false,
          published: true,
          city: "İstanbul",
          district: "",
          neighborhood: null,
          lat: null,
          lng: null,
          summary: "",
          description: "",
          listingNo: null,
          remaxUrl: null,
          videoUrl: null,
          tourUrl: null,
          daysOnMarket: null,
          closedPricePercent: null,
          closedAt: null,
          regionId: null,
          seoTitle: null,
          seoDescription: null,
          images: [],
          features: [],
        }}
      />
    </div>
  );
}
