import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/animation/reveal";
import { formatNumber, parseJsonArray } from "@/lib/utils";

export type RegionCardData = {
  id: string;
  slug: string;
  name: string;
  district: string;
  city: string;
  description: string;
  coverUrl: string | null;
  avgPricePerSqm: number | null;
  highlights: string;
  _count?: { properties: number };
};

export function RegionGrid({ regions }: { regions: RegionCardData[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {regions.map((region, index) => {
        const highlights = parseJsonArray(region.highlights).slice(0, 2);

        return (
          <Reveal key={region.id} delay={index * 0.06}>
            <Link
              href={`/bolgeler/${region.slug}`}
              className="group relative flex h-72 flex-col justify-end overflow-hidden rounded-card border border-ink-700 p-7 sm:h-80"
            >
              {region.coverUrl ? (
                <Image
                  src={region.coverUrl}
                  alt={region.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 bg-ink-800" />
              )}
              <div className="scrim-bottom absolute inset-0" />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-3xl">{region.name}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cream-400">
                      {region.city}
                      {region._count
                        ? ` · ${region._count.properties} aktif ilan`
                        : null}
                    </p>
                  </div>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/25 transition-colors group-hover:border-brand-500 group-hover:bg-brand-500">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>

                <p className="mt-4 line-clamp-2 max-w-md text-sm leading-relaxed text-cream-300">
                  {region.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-wider text-cream-400">
                  {region.avgPricePerSqm ? (
                    <span className="text-gold-400">
                      ort. {formatNumber(region.avgPricePerSqm)} ₺/m²
                    </span>
                  ) : null}
                  {highlights.map((highlight) => (
                    <span key={highlight}>{highlight}</span>
                  ))}
                </div>
              </div>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
