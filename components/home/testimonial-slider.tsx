"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, Quote, Star } from "lucide-react";

import { cn, formatDate } from "@/lib/utils";

export type TestimonialItem = {
  id: string;
  authorName: string;
  authorTitle: string | null;
  text: string;
  rating: number;
  date: Date | string;
  property: { slug: string; title: string } | null;
};

export function TestimonialSlider({ items }: { items: TestimonialItem[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
  });

  // Kaydırıcının durumu React dışında (Embla) yaşadığı için doğrudan oradan
  // okunur; effect içinde setState çağırmaya gerek kalmaz.
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!emblaApi) return () => {};
      emblaApi.on("select", onStoreChange).on("reInit", onStoreChange);
      return () => {
        emblaApi.off("select", onStoreChange).off("reInit", onStoreChange);
      };
    },
    [emblaApi],
  );

  const snapshot = useSyncExternalStore(
    subscribe,
    () =>
      emblaApi
        ? `${emblaApi.selectedScrollSnap()}|${emblaApi.canScrollPrev()}|${emblaApi.canScrollNext()}`
        : "0|false|false",
    () => "0|false|false",
  );

  const [selectedRaw, prevRaw, nextRaw] = snapshot.split("|");
  const selected = Number(selectedRaw);
  const canPrev = prevRaw === "true";
  const canNext = nextRaw === "true";

  if (items.length === 0) return null;

  return (
    <div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {items.map((item) => (
            <figure
              key={item.id}
              className="flex min-w-0 shrink-0 basis-[88%] flex-col rounded-card border border-ink-700 bg-ink-850 p-7 sm:basis-[62%] lg:basis-[38%]"
            >
              <Quote className="size-7 text-brand-500" />

              <div className="mt-5 flex gap-0.5">
                {Array.from({ length: item.rating }, (_, index) => (
                  <Star
                    key={index}
                    className="size-3.5 fill-gold-400 text-gold-400"
                  />
                ))}
              </div>

              <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-cream-200">
                {item.text}
              </blockquote>

              <figcaption className="mt-7 border-t border-ink-700 pt-5">
                <p className="text-sm font-medium text-cream-50">
                  {item.authorName}
                </p>
                <p className="mt-1 text-xs text-cream-500">
                  {item.authorTitle} · {formatDate(item.date)}
                </p>
                {item.property ? (
                  <Link
                    href={`/portfoy/${item.property.slug}`}
                    className="mt-3 inline-block text-xs text-brand-400 transition-colors hover:text-brand-500"
                  >
                    İlgili ilanı gör →
                  </Link>
                ) : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div className="flex gap-1.5">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`${index + 1}. yoruma git`}
              onClick={() => emblaApi?.scrollTo(index)}
              className={cn(
                "h-1 rounded-full transition-all duration-400",
                index === selected ? "w-8 bg-brand-500" : "w-4 bg-ink-600",
              )}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Önceki yorum"
            disabled={!canPrev}
            onClick={() => emblaApi?.scrollPrev()}
            className="flex size-11 items-center justify-center rounded-full border border-ink-600 text-cream-200 transition-colors hover:border-cream-400 disabled:opacity-30"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Sonraki yorum"
            disabled={!canNext}
            onClick={() => emblaApi?.scrollNext()}
            className="flex size-11 items-center justify-center rounded-full border border-ink-600 text-cream-200 transition-colors hover:border-cream-400 disabled:opacity-30"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
