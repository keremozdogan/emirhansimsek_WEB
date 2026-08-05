"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

// Leaflet tarayıcı API'lerine ihtiyaç duyar; sunucuda render edilemez.
const PropertyMap = dynamic(() => import("@/components/property/property-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-ink-850">
      <span className="text-xs text-cream-500">Harita yükleniyor…</span>
    </div>
  ),
});

export function MapPanel({
  lat,
  lng,
  label,
  className,
}: {
  lat: number | null;
  lng: number | null;
  label: string;
  className?: string;
}) {
  if (lat === null || lng === null) return null;

  return (
    <div className={className}>
      <div className="h-80 overflow-hidden rounded-card border border-ink-700 sm:h-96">
        <PropertyMap lat={lat} lng={lng} className="size-full" />
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs text-cream-500">
        <MapPin className="size-3.5" />
        {label} — konum yaklaşık olarak gösterilmektedir.
      </p>
    </div>
  );
}
