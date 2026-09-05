import { RevealGroupCss } from "@/components/animation/reveal-group";
import { FEATURE_GROUP_LABELS, type FeatureGroup } from "@/lib/constants";
import { formatArea, formatPrice } from "@/lib/utils";

type Fact = { label: string; value: string | null };

export function PropertyFacts({
  property,
}: {
  property: {
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
    listingNo: string | null;
  };
}) {
  const facts: Fact[] = [
    { label: "Brüt Alan", value: formatArea(property.grossArea) },
    { label: "Net Alan", value: formatArea(property.netArea) },
    { label: "Oda Sayısı", value: property.rooms },
    {
      label: "Banyo",
      value: property.bathrooms ? `${property.bathrooms}` : null,
    },
    { label: "Bina Yaşı", value: property.buildingAge },
    {
      label: "Bulunduğu Kat",
      value: property.floor,
    },
    {
      label: "Kat Sayısı",
      value: property.totalFloors ? `${property.totalFloors}` : null,
    },
    { label: "Isıtma", value: property.heating },
    {
      label: "Aidat",
      value: property.dues ? `${formatPrice(property.dues)} / ay` : null,
    },
    { label: "Tapu Durumu", value: property.deedStatus },
    { label: "Cephe", value: property.facade },
    { label: "Eşyalı", value: property.furnished ? "Evet" : "Hayır" },
    { label: "Balkon", value: property.balcony ? "Var" : "Yok" },
    { label: "Otopark", value: property.parking ? "Var" : "Yok" },
    {
      label: "Krediye Uygun",
      value: property.creditEligible ? "Evet" : "Hayır",
    },
    { label: "İlan No", value: property.listingNo },
  ].filter((fact): fact is Fact => Boolean(fact.value));

  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-0 sm:grid-cols-3">
      {facts.map((fact) => (
        <div
          key={fact.label}
          className="flex items-baseline justify-between gap-3 border-b border-ink-700 py-3.5"
        >
          <dt className="text-xs uppercase tracking-wider text-cream-500">
            {fact.label}
          </dt>
          <dd className="text-right text-sm text-cream-100">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function PropertyFeatureList({
  features,
}: {
  features: Array<{ id: string; label: string; group: string }>;
}) {
  if (features.length === 0) return null;

  const grouped = features.reduce<Record<string, string[]>>((acc, feature) => {
    (acc[feature.group] ??= []).push(feature.label);
    return acc;
  }, {});

  return (
    /*
      Özellik grupları kaydırdıkça sırayla açılıyor. Sarmalayıcı istemci
      bileşeni; bu dosya sunucuda kalmaya devam ediyor.
    */
    <RevealGroupCss className="grid gap-8 sm:grid-cols-2">
      {Object.entries(grouped).map(([group, labels]) => (
        <div key={group} className="reveal">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-cream-500">
            {FEATURE_GROUP_LABELS[group as FeatureGroup] ?? group}
          </h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {labels.map((label) => (
              <li
                key={label}
                className="rounded-full border border-ink-600 px-3.5 py-1.5 text-xs text-cream-200"
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </RevealGroupCss>
  );
}
