"use client";

import { Heart } from "lucide-react";

import { useFavorites, useHydrated } from "@/components/property/use-favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  propertyId,
  title,
  className,
}: {
  propertyId: string;
  title: string;
  className?: string;
}) {
  const { has, toggle } = useFavorites();
  const hydrated = useHydrated();
  const active = hydrated && has(propertyId);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(propertyId);
      }}
      aria-label={
        active ? `${title} favorilerden çıkar` : `${title} favorilere ekle`
      }
      aria-pressed={active}
      className={cn(
        "flex size-9 items-center justify-center rounded-full border border-white/20 bg-ink-950/60 backdrop-blur-sm transition-all duration-300 hover:border-white/45 hover:bg-ink-950/80",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-4 transition-all duration-300",
          active ? "fill-brand-500 text-brand-500" : "text-cream-200",
        )}
      />
    </button>
  );
}
