"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { GitCompareArrows, X } from "lucide-react";

import {
  MAX_COMPARE,
  useCompare,
  useHydrated,
} from "@/components/property/use-favorites";

/**
 * Karşılaştırma listesine ilan eklendiğinde ekranın altında beliren çubuk.
 * Mobil aksiyon barının üstünde konumlanır.
 */
export function CompareBar() {
  const { ids, clear } = useCompare();
  const hydrated = useHydrated();
  const count = hydrated ? ids.length : 0;

  return (
    <AnimatePresence>
      {count > 0 ? (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-16 z-40 px-4 lg:bottom-6"
        >
          <div className="surface-glass mx-auto flex max-w-2xl items-center justify-between gap-4 rounded-full border border-ink-600 py-2.5 pl-6 pr-2.5">
            <p className="flex items-center gap-2.5 text-sm text-cream-200">
              <GitCompareArrows className="size-4 text-brand-500" />
              <span className="hidden sm:inline">Karşılaştırma listesi:</span>
              <span className="font-medium text-cream-50">
                {count}/{MAX_COMPARE}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clear}
                aria-label="Karşılaştırma listesini temizle"
                className="flex size-9 items-center justify-center rounded-full text-cream-400 transition-colors hover:text-cream-50"
              >
                <X className="size-4" />
              </button>
              <Link
                href="/karsilastir"
                className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-400"
              >
                Karşılaştır
              </Link>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
