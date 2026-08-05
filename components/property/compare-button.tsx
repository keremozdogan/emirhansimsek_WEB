"use client";

import { useState } from "react";
import { GitCompareArrows } from "lucide-react";

import {
  MAX_COMPARE,
  useCompare,
  useHydrated,
} from "@/components/property/use-favorites";
import { cn } from "@/lib/utils";

export function CompareButton({
  propertyId,
  className,
}: {
  propertyId: string;
  className?: string;
}) {
  const { has, toggle } = useCompare();
  const hydrated = useHydrated();
  const [full, setFull] = useState(false);
  const active = hydrated && has(propertyId);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          const added = toggle(propertyId);
          if (!added) {
            setFull(true);
            window.setTimeout(() => setFull(false), 2600);
          }
        }}
        aria-pressed={active}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm transition-colors",
          active
            ? "border-brand-500 bg-brand-500/12 text-brand-400"
            : "border-ink-500 text-cream-50 hover:border-cream-400",
          className,
        )}
      >
        <GitCompareArrows className="size-4" />
        {active ? "Karşılaştırmada" : "Karşılaştır"}
      </button>

      {full ? (
        <p
          role="status"
          className="absolute left-0 top-full z-10 mt-2 w-56 rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-xs text-cream-300"
        >
          En fazla {MAX_COMPARE} ilan karşılaştırabilirsiniz. Önce birini çıkarın.
        </p>
      ) : null}
    </div>
  );
}
