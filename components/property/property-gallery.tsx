"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export type GalleryImage = {
  id: string;
  url: string;
  alt: string;
  roomName: string | null;
  blurDataUrl: string | null;
};

/** Tüm ilan fotoğrafları — ızgara görünümü ve tam ekran büyütme. */
export function PropertyGallery({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (direction: -1 | 1) =>
      setOpenIndex((current) =>
        current === null
          ? null
          : (current + direction + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (openIndex === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, close, step]);

  if (images.length === 0) return null;

  const active = openIndex === null ? null : images[openIndex];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="group relative aspect-4/3 overflow-hidden rounded-lg border border-ink-700 bg-ink-800"
            aria-label={`${image.roomName ?? `Fotoğraf ${index + 1}`} — büyüt`}
          >
            <Image
              src={image.url}
              alt={image.alt || image.roomName || ""}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              /*
                Varsayılan 75 yerine 82: ilan fotoğrafları hero ile aynı
                kalitede sunulsun. next.config.ts içindeki images.qualities
                listesi bu iki değeri taşıyor; listede olmayan bir sayı
                sessizce en yakınına zorlanır.
              */
              quality={82}
              placeholder={image.blurDataUrl ? "blur" : undefined}
              blurDataURL={image.blurDataUrl ?? undefined}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {image.roomName ? (
              <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink-950/90 to-transparent px-3 pb-2 pt-6 text-left text-[11px] text-cream-200">
                {image.roomName}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/95 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            onClick={close}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Kapat"
              className="absolute right-5 top-5 z-10 flex size-11 items-center justify-center rounded-full border border-white/20 text-cream-100 transition-colors hover:border-white/50"
            >
              <X className="size-5" />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                step(-1);
              }}
              aria-label="Önceki fotoğraf"
              className="absolute left-3 z-10 flex size-12 items-center justify-center rounded-full border border-white/20 text-cream-100 transition-colors hover:border-white/50 sm:left-6"
            >
              <ChevronLeft className="size-5" />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                step(1);
              }}
              aria-label="Sonraki fotoğraf"
              className="absolute right-3 z-10 flex size-12 items-center justify-center rounded-full border border-white/20 text-cream-100 transition-colors hover:border-white/50 sm:right-6"
            >
              <ChevronRight className="size-5" />
            </button>

            <motion.figure
              key={active.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex h-full w-full flex-col items-center justify-center px-14 py-16"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative h-full w-full max-w-6xl">
                <Image
                  src={active.url}
                  alt={active.alt || active.roomName || ""}
                  fill
                  sizes="100vw"
                  quality={82}
                  className="object-contain"
                  priority
                />
              </div>
              <figcaption className="mt-4 text-center text-sm text-cream-300">
                {active.roomName ? (
                  <span className="text-cream-50">{active.roomName} · </span>
                ) : null}
                {(openIndex ?? 0) + 1} / {images.length}
              </figcaption>
            </motion.figure>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
