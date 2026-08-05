"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, Play } from "lucide-react";

import { Magnetic } from "@/components/animation/magnetic";
import { usePrefersReducedMotion } from "@/components/animation/use-reduced-motion";
import { ButtonLink } from "@/components/ui/button";
import { Counter } from "@/components/animation/counter";

const EASE = [0.16, 1, 0.3, 1] as const;

type HeroStat = { value: number; suffix?: string; label: string };

/**
 * Tam ekran sinematik açılış.
 *
 * Video varsa arka planda oynar; yoksa poster fotoğrafı Ken Burns efektiyle
 * yavaşça yakınlaşarak "video gibi" bir his verir. Aşağı kaydırdıkça sahne
 * küçülüp kararır — bir sonraki bölüme sinematik bir kesme yapılmış olur.
 */
export function CinematicHero({
  fullName,
  title,
  officeName,
  tagline,
  videoUrl,
  posterUrl,
  stats,
}: {
  fullName: string;
  title: string;
  officeName: string;
  tagline: string;
  videoUrl?: string | null;
  posterUrl?: string | null;
  stats: HeroStat[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    const media = mediaRef.current;
    const content = contentRef.current;
    if (!section || !media || !content) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });

      timeline
        .to(media, { scale: 1.18, filter: "brightness(0.35)", ease: "none" }, 0)
        .to(content, { y: -90, opacity: 0, ease: "none" }, 0);
    }, section);

    return () => context.revert();
  }, [reduced]);

  const [firstName, ...lastName] = fullName.split(" ");

  return (
    <section
      ref={sectionRef}
      className="grain relative flex h-[100svh] min-h-[640px] items-end overflow-hidden"
    >
      {/* Arka plan: video ya da Ken Burns'lü fotoğraf */}
      <div ref={mediaRef} className="absolute inset-0 will-change-transform">
        {videoUrl ? (
          <video
            className="size-full object-cover"
            src={videoUrl}
            poster={posterUrl ?? undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : posterUrl ? (
          <Image
            src={posterUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className={reduced ? "object-cover" : "ken-burns object-cover"}
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950" />
        )}
      </div>

      <div className="scrim-full absolute inset-0" />

      {/* İçerik */}
      <div
        ref={contentRef}
        className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 sm:px-8 sm:pb-28 lg:pb-32"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
          className="eyebrow"
        >
          {officeName}
        </motion.p>

        <h1 className="mt-6 font-display text-[clamp(2.75rem,9vw,7rem)] leading-[0.94] tracking-tight">
          <span className="block overflow-hidden">
            <motion.span
              className="block"
              initial={{ y: "108%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.1, delay: 0.55, ease: EASE }}
            >
              {firstName}
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              className="block text-brand-500"
              initial={{ y: "108%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.1, delay: 0.68, ease: EASE }}
            >
              {lastName.join(" ")}
            </motion.span>
          </span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.95, ease: EASE }}
          className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-lg">
            <p className="text-sm uppercase tracking-[0.24em] text-cream-400">
              {title}
            </p>
            <p className="mt-3 text-balance font-display text-2xl leading-snug text-cream-100 sm:text-3xl">
              {tagline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Magnetic>
              <ButtonLink href="/portfoy" size="lg">
                Portföyü Keşfet
              </ButtonLink>
            </Magnetic>
            <Magnetic>
              <ButtonLink href="/hakkimda" variant="outline" size="lg">
                <Play className="size-4" />
                Emirhan&apos;ı Tanıyın
              </ButtonLink>
            </Magnetic>
          </div>
        </motion.div>

        {/* Rakamlar şeridi */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.15, ease: EASE }}
          className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/15 pt-8 sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-3xl text-cream-50 sm:text-4xl">
                <Counter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-cream-400">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Kaydırma ipucu */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="absolute inset-x-0 bottom-6 z-10 hidden justify-center lg:flex"
        aria-hidden
      >
        <ArrowDown className="size-5 animate-[scroll-hint_2s_ease-in-out_infinite] text-cream-400" />
      </motion.div>
    </section>
  );
}
