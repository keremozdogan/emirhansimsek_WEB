import type { Metadata } from "next";

import { RegionGridBySide } from "@/components/home/region-grid";
import { ServedDistricts } from "@/components/home/served-districts";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { getRegions } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Hizmet Bölgeleri",
  description:
    "İstanbul'un iki yakasında, 39 ilçede alım, satım ve kiralama. Rehberi hazır olan bölgeler için metrekare fiyatları, alıcı profilleri ve saha yorumları.",
  alternates: { canonical: "/bolgeler" },
};

export const revalidate = 0;

export default async function RegionsPage() {
  const regions = await getRegions();
  const withGuides = regions.map((region) => region.district);

  return (
    <>
      <Section className="pt-32 sm:pt-40 lg:pt-44">
        <Container>
          <SectionHeading
            eyebrow="Hizmet Bölgeleri"
            title={
              <>
                İki yaka,{" "}
                <span className="text-cream-500">tek danışman.</span>
              </>
            }
            description="İstanbul'un her iki yakasında alım, satım ve kiralama süreçlerinde çalışıyorum. Portföyüm şu an Sancaktepe ve Çekmeköy'de yoğunlaşıyor; aşağıdaki rehberler, saha yorumumu yazacak kadar yakından tanıdığım bölgeler için hazırlandı."
          />

          {regions.length > 0 ? (
            <div className="mt-14">
              <RegionGridBySide regions={regions} />
            </div>
          ) : null}
        </Container>
      </Section>

      <Section className="border-t border-ink-800 pt-0">
        <Container>
          <SectionHeading
            eyebrow="Kapsam"
            title={
              <>
                Çalıştığım <span className="text-cream-500">ilçeler.</span>
              </>
            }
            description="Rehberi henüz yazılmamış olması o ilçede çalışmadığım anlamına gelmez. Aşağıdaki ilçelerin tamamında alıcı ve satıcı tarafında hizmet veriyorum."
          />

          <div className="mt-14">
            <ServedDistricts highlighted={withGuides} />
          </div>
        </Container>
      </Section>
    </>
  );
}
