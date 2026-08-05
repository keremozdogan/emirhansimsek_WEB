import type { Metadata } from "next";

import { RegionGrid } from "@/components/home/region-grid";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { getRegions } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Uzmanlık Bölgeleri",
  description:
    "Ataşehir, Kadıköy, Ümraniye ve Üsküdar için bölge rehberleri: metrekare fiyatları, alıcı profilleri ve dikkat edilmesi gerekenler.",
  alternates: { canonical: "/bolgeler" },
};

export const revalidate = 0;

export default async function RegionsPage() {
  const regions = await getRegions();

  return (
    <Section className="pt-32 sm:pt-40 lg:pt-44">
      <Container>
        <SectionHeading
          eyebrow="Uzmanlık Bölgeleri"
          title={
            <>
              Az bölge,{" "}
              <span className="text-cream-500">çok derin bilgi.</span>
            </>
          }
          description="Her mahalleyi bilir gibi davranmak yerine, gerçekten bildiğim bölgelerde çalışıyorum. Aşağıdaki rehberlerde her bölge için kendi saha yorumumu bulacaksınız."
        />

        <div className="mt-14">
          <RegionGrid regions={regions} />
        </div>
      </Container>
    </Section>
  );
}
