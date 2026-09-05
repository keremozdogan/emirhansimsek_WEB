import Image from "next/image";
import { VtLink } from "@/components/animation/vt-link";
import { Bed, Clock, MapPin, Maximize } from "lucide-react";

import { FavoriteButton } from "@/components/property/favorite-button";
import { Badge } from "@/components/ui/primitives";
import {
  LISTING_TYPE_LABELS,
  PROPERTY_CATEGORY_LABELS,
  type ListingType,
  type PropertyCategory,
} from "@/lib/constants";
import { cn, formatArea, formatPrice } from "@/lib/utils";

export type PropertyCardData = {
  id: string;
  slug: string;
  title: string;
  listingType: string;
  status: string;
  category: string;
  price: number;
  currency: string;
  grossArea: number | null;
  netArea: number | null;
  rooms: string | null;
  city: string;
  district: string;
  neighborhood: string | null;
  summary: string;
  daysOnMarket?: number | null;
  closedPricePercent?: number | null;
  images: Array<{ url: string; alt: string; blurDataUrl: string | null }>;
};

export function PropertyCard({
  property,
  priority = false,
  className,
}: {
  property: PropertyCardData;
  priority?: boolean;
  className?: string;
}) {
  const cover = property.images[0];
  const isClosed = property.status === "SOLD" || property.status === "RENTED";
  const area = property.netArea ?? property.grossArea;

  return (
    <article
      className={cn(
        "kart group relative overflow-hidden rounded-card border border-ink-700 bg-ink-850 transition-colors duration-500 hover:border-ink-500",
        className,
      )}
    >
      <VtLink href={`/portfoy/${property.slug}`} className="block">
        <div className="gorsel-kutu relative aspect-4/3 overflow-hidden bg-ink-800">
          {cover ? (
            <Image
              src={cover.url}
              alt={cover.alt || property.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={82}
              priority={priority}
              placeholder={cover.blurDataUrl ? "blur" : undefined}
              blurDataURL={cover.blurDataUrl ?? undefined}
              className={cn(
                "vt object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]",
                isClosed && "grayscale-[0.45]",
              )}
              /*
                Detay sayfasındaki aynı isimli görselle eşleşir ve kart açılırken
                oraya doğru morph eder. `id` cuid olduğu için ad her zaman geçerli
                bir <custom-ident>.
              */
              style={{ "--vt-name": `ilan-${property.id}` } as React.CSSProperties}
            />
          ) : null}

          <div className="scrim-bottom absolute inset-0 opacity-80" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <Badge tone={property.listingType === "RENT" ? "outline" : "brand"}>
              {LISTING_TYPE_LABELS[property.listingType as ListingType] ??
                property.listingType}
            </Badge>
            {isClosed ? (
              <Badge tone="success">
                {property.status === "SOLD" ? "Satıldı" : "Kiralandı"}
              </Badge>
            ) : null}
            {property.status === "RESERVED" ? (
              <Badge tone="gold">Rezerve</Badge>
            ) : null}
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <p className="kart-fiyat font-display text-2xl leading-none text-cream-50 drop-shadow-lg">
              {formatPrice(property.price, property.currency)}
              {property.listingType === "RENT" ? (
                <span className="ml-1 font-sans text-xs font-normal text-cream-200">
                  /ay
                </span>
              ) : null}
            </p>
            <Badge tone="neutral">
              {PROPERTY_CATEGORY_LABELS[
                property.category as PropertyCategory
              ] ?? property.category}
            </Badge>
          </div>
        </div>

        <div className="p-5">
          <h3 className="line-clamp-2 text-lg leading-snug transition-colors group-hover:text-brand-400">
            {property.title}
          </h3>

          <p className="mt-2 flex items-center gap-1.5 text-sm text-cream-400">
            <MapPin className="size-3.5 shrink-0" />
            {[property.neighborhood, property.district, property.city]
              .filter(Boolean)
              .join(" · ")}
          </p>

          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-cream-500">
            {property.summary}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink-700 pt-4 text-xs text-cream-400">
            {property.rooms ? (
              <span className="flex items-center gap-1.5">
                <Bed className="size-3.5" />
                {property.rooms}
              </span>
            ) : null}
            {area ? (
              <span className="flex items-center gap-1.5">
                <Maximize className="size-3.5" />
                {formatArea(area)}
              </span>
            ) : null}
            {isClosed && property.daysOnMarket ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Clock className="size-3.5" />
                {property.daysOnMarket} günde
                {property.status === "SOLD" ? " satıldı" : " kiralandı"}
              </span>
            ) : null}
          </div>
        </div>
      </VtLink>

      <div className="absolute right-4 top-4">
        <FavoriteButton propertyId={property.id} title={property.title} />
      </div>
    </article>
  );
}
