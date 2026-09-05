"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";

import { usePrefersReducedMotion } from "@/components/animation/use-reduced-motion";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export type TourImage = {
  id: string;
  url: string;
  alt: string;
  roomName: string | null;
  caption: string | null;
  blurDataUrl: string | null;
};

/**
 * SİNEMATİK EV TURU
 *
 * Aşağı kaydırdıkça fotoğraflar tam ekranda birbirine geçer, her fotoğraf
 * yavaşça yakınlaşır (Ken Burns) ve yanında o odanın adı ile anlatım metni
 * belirir — bir blogger'ın evi gezdirdiği video hissini verir.
 *
 * Anlatım metinleri veritabanındaki `PropertyImage.roomName` ve `caption`
 * alanlarından gelir; admin panelinden her fotoğraf için ayrı ayrı girilir.
 *
 * Masaüstünde sahne sabitlenir (pin) ve geçişler scroll'a bağlanır.
 * Mobilde pin takılmaya yol açtığı için her fotoğraf kendi ekranında,
 * göründükçe canlanan bir bölüm olarak gösterilir.
 */
export function PropertyTour({
  images,
  videoUrl,
  title,
  vtName,
}: {
  images: TourImage[];
  videoUrl?: string | null;
  title: string;
  /**
   * Kart görselinden buraya morph eden görünüm geçişinin adı.
   *
   * Yalnızca İLK kareye veriliyor: `view-transition-name` sayfada benzersiz
   * olmak zorunda, aynı adı birden çok öğeye vermek geçişi tamamen iptal
   * ettirir. Masaüstü ve mobil varyantlardan sadece biri render edildiği için
   * ikisine de yazmak güvenli.
   */
  vtName?: string | null;
}) {
  const [isDesktop, setIsDesktop] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (images.length === 0) return null;

  return (
    <section aria-label={`${title} — ev turu`}>
      {isDesktop && !reduced ? (
        <DesktopTour images={images} videoUrl={videoUrl} vtName={vtName} />
      ) : (
        <MobileTour images={images} videoUrl={videoUrl} vtName={vtName} />
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Masaüstü — sabitlenmiş, scroll'a bağlı sahne                                */
/* -------------------------------------------------------------------------- */

function DesktopTour({
  images,
  videoUrl,
  vtName,
}: {
  images: TourImage[];
  videoUrl?: string | null;
  vtName?: string | null;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const slides = gsap.utils.toArray<HTMLElement>("[data-slide]");
      const media = gsap.utils.toArray<HTMLElement>("[data-slide-media]");
      if (slides.length === 0) return;

      // İlk kare görünür, diğerleri saydam ve hafif yakınlaştırılmış başlar
      gsap.set(slides, { opacity: 0 });
      gsap.set(slides[0], { opacity: 1 });
      gsap.set(media, { scale: 1.14 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${images.length * 620}`,
          scrub: 0.75,
          pin: true,
          anticipatePin: 1,
          // Her karede değil, yalnızca aktif kare gerçekten değiştiğinde
          // React'e dokun — aksi halde scrub boyunca 60 dispatch/sn.
          onUpdate: (self) => {
            const index = Math.min(
              images.length - 1,
              Math.round(self.progress * (images.length - 1)),
            );
            if (index === activeRef.current) return;
            activeRef.current = index;
            setActive(index);
          },
        },
      });

      slides.forEach((slide, index) => {
        // Her kare kendi süresi boyunca yavaşça geri çekilir (Ken Burns)
        timeline.to(
          media[index],
          { scale: 1, ease: "none", duration: 1 },
          Math.max(0, index - 0.4),
        );

        if (index > 0) {
          timeline.to(
            slide,
            { opacity: 1, ease: "power1.inOut", duration: 0.4 },
            index - 0.4,
          );
        }
      });
    }, section);

    return () => context.revert();
  }, [images.length]);

  return (
    <div
      ref={sectionRef}
      className="relative h-[100svh] w-full overflow-hidden bg-ink-950"
    >
      {/* Kareler üst üste yığılır, opaklıkla geçiş yapar */}
      {images.map((image, index) => (
        <div key={image.id} data-slide className="absolute inset-0">
          <div data-slide-media className="absolute inset-0 will-change-transform">
            {index === 0 && videoUrl ? (
              <video
                className="size-full object-cover"
                src={videoUrl}
                poster={image.url}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <Image
                src={image.url}
                alt={image.alt}
                fill
                /*
                  Tur SIRALI bir deneyim: kullanıcı her kareyi mutlaka görecek
                  ve slaytların hepsi zaten üst üste, görünüm alanının içinde
                  duruyor. Tembel yükleme burada bir şey kazandırmıyor ama
                  kaybettiriyor: kare sırası geldiğinde henüz inmemiş olan
                  fotoğraf yerine 16 pikselli blur placeholder görünüyordu —
                  "bulanık açılmıyor" şikayeti buydu.

                  İlk iki kare öncelikli, gerisi eager. `fetchPriority="low"`
                  DENENDİ VE KALDIRILDI: tarayıcı son kareleri o kadar geriye
                  atıyordu ki 15 slayttan 4'ü hiç inmiyordu — kullanıcı tam da
                  o karelerde bulanık ekran görüyordu.
                */
                priority={index < 2}
                loading={index < 2 ? undefined : "eager"}
                sizes="100vw"
                quality={82}
                placeholder={image.blurDataUrl ? "blur" : undefined}
                blurDataURL={image.blurDataUrl ?? undefined}
                className={index === 0 && vtName ? "vt object-cover" : "object-cover"}
                style={
                  index === 0 && vtName
                    ? ({ "--vt-name": vtName } as React.CSSProperties)
                    : undefined
                }
              />
            )}
          </div>
        </div>
      ))}

      <div className="scrim-full pointer-events-none absolute inset-0" />

      {/* Anlatım paneli */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto w-full max-w-7xl px-8 pb-20">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-500">
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(images.length).padStart(2, "0")}
            </p>

            <div className="relative mt-4 h-40">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className={cn(
                    "absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    index === active
                      ? "translate-y-0 opacity-100 blur-0"
                      : "translate-y-6 opacity-0 blur-[2px]",
                  )}
                >
                  <h3 className="font-display text-5xl leading-none">
                    {image.roomName ?? "Ev Turu"}
                  </h3>
                  {image.caption ? (
                    <p className="mt-5 text-base leading-relaxed text-cream-200">
                      {image.caption}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sağda oda listesi ve ilerleme */}
      <nav
        aria-label="Ev turu odaları"
        className="pointer-events-none absolute right-8 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-3 xl:flex"
      >
        {images.map((image, index) => (
          <div key={image.id} className="flex items-center justify-end gap-3">
            <span
              className={cn(
                "text-right text-xs transition-all duration-500",
                index === active
                  ? "text-cream-50 opacity-100"
                  : "text-cream-400 opacity-0",
              )}
            >
              {image.roomName}
            </span>
            <span
              className={cn(
                "h-px transition-all duration-500",
                index === active
                  ? "w-10 bg-brand-500"
                  : index < active
                    ? "w-5 bg-cream-400"
                    : "w-5 bg-ink-500",
              )}
            />
          </div>
        ))}
      </nav>

      {/* İlk karede kaydırma ipucu */}
      <div
        className={cn(
          "pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 transition-opacity duration-500",
          active === 0 ? "opacity-100" : "opacity-0",
        )}
      >
        <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-cream-400">
          Turu başlatmak için kaydırın
          <ChevronDown className="size-4 animate-[scroll-hint_2s_ease-in-out_infinite]" />
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobil — her fotoğraf kendi ekranında, göründükçe canlanır                    */
/* -------------------------------------------------------------------------- */

function MobileTour({
  images,
  videoUrl,
  vtName,
}: {
  images: TourImage[];
  videoUrl?: string | null;
  vtName?: string | null;
}) {
  return (
    <div className="bg-ink-950">
      {images.map((image, index) => (
        <div
          key={image.id}
          className="relative flex h-[86svh] min-h-[520px] items-end overflow-hidden"
        >
          {index === 0 && videoUrl ? (
            <video
              className="absolute inset-0 size-full object-cover"
              src={videoUrl}
              poster={image.url}
              muted
              loop
              playsInline
              autoPlay
            />
          ) : (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              /*
                Mobil şerit yatay kaydırılan bir liste: kullanıcı sonuna kadar
                gitmeyebilir, ekranda aynı anda bir kare var. Burada tembel
                yükleme doğru davranış — masaüstü turunun aksine.
              */
              priority={index === 0}
              sizes="100vw"
              quality={82}
              placeholder={image.blurDataUrl ? "blur" : undefined}
              blurDataURL={image.blurDataUrl ?? undefined}
              className={index === 0 && vtName ? "vt object-cover" : "object-cover"}
              style={
                index === 0 && vtName
                  ? ({ "--vt-name": vtName } as React.CSSProperties)
                  : undefined
              }
            />
          )}

          <div className="scrim-full absolute inset-0" />

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.85, ease: EASE }}
            className="relative z-10 w-full px-5 pb-12"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-brand-500">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(images.length).padStart(2, "0")}
            </p>
            <h3 className="mt-3 font-display text-3xl leading-tight">
              {image.roomName ?? "Ev Turu"}
            </h3>
            {image.caption ? (
              <p className="mt-3 text-sm leading-relaxed text-cream-200">
                {image.caption}
              </p>
            ) : null}
          </motion.div>
        </div>
      ))}
    </div>
  );
}
