"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { usePrefersReducedMotion } from "@/components/animation/use-reduced-motion";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/**
 * Satış sürecinin adımları.
 *
 * `imageUrl` bilerek boş: portföydeki fotoğraflar boş daire ve inşaat hâlindeki
 * dükkân kareleri, yani "sahneleme" ya da "pazarlık" adımını anlatamıyorlar.
 * Uygun çekimler geldiğinde her adıma buradan görsel eklenir, düzen zaten
 * fotoğraflı hâli destekliyor.
 */
export const PROCESS_STEPS: Array<{
  title: string;
  description: string;
  imageUrl?: string;
}> = [
  {
    title: "Yerinde Değerleme",
    description:
      "Evinizi yerinde görüp bölgedeki güncel satışlarla karşılaştırıyorum. Duymak istediğiniz rakamı değil, gerçek rakamı söylüyorum.",
  },
  {
    title: "Hazırlık ve Sahneleme",
    description:
      "Düşük maliyetli hangi dokunuşların algılanan değeri yükselteceğini birlikte belirliyoruz. Bu adım çoğu zaman fiyata doğrudan yansıyor.",
  },
  {
    title: "Profesyonel Çekim",
    description:
      "Fotoğraf ve video turu profesyonel ekiple çekiliyor. Alıcı evi önce telefonunda görüyor — ilk izlenim burada oluşuyor.",
  },
  {
    title: "Hedefli Pazarlama",
    description:
      "İlan yayına girmeden önce kendi alıcı listeme sunuluyor. Ardından portallar, sosyal medya ve RE/MAX ağı devreye giriyor.",
  },
  {
    title: "Görüşme ve Pazarlık",
    description:
      "Her randevuyu ben yönetiyorum, geri bildirimleri size düzenli aktarıyorum. Pazarlıkta sizin adınıza masada oturuyorum.",
  },
  {
    title: "Sözleşme ve Tapu",
    description:
      "Sözleşme, tapu randevusu, abonelik devirleri. Süreç tapuda bitmiyor; taşınana kadar yanınızdayım.",
  },
];

/**
 * Kaydırmaya bağlı yatay süreç şeridi.
 *
 * Masaüstünde bölüm sabitlenir (pin) ve dikey kaydırma yatay harekete çevrilir.
 * Mobilde pin yerine parmakla kaydırılan, hizalanmalı (scroll-snap) bir şerit
 * var: dokunmatik cihazlarda pin hem takılıyor hem de kullanıcıdan kaydırma
 * kontrolünü alıyor.
 */
export function ProcessStrip() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const activeStepRef = useRef(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isDesktop || reduced) return;
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      /**
       * Kat edilecek yatay mesafe. Fonksiyon olarak veriliyor çünkü
       * `invalidateOnRefresh` ile birlikte pencere yeniden boyutlandığında
       * yeniden hesaplanması gerekiyor — sabit bir sayı verilirse şerit dar
       * ekranda erken bitiyor, geniş ekranda sona ulaşamıyor.
       */
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // `onUpdate` her karede çalışıyor; aktif adım yalnızca kart
          // sınırlarında değişiyor. Ref ile karşılaştırmazsak saniyede 60 kez
          // React güncellemesi tetikleyip kaydırmayı kasıyoruz.
          onUpdate: (self) => {
            const index = Math.min(
              PROCESS_STEPS.length - 1,
              Math.floor(self.progress * PROCESS_STEPS.length),
            );
            if (index === activeStepRef.current) return;
            activeStepRef.current = index;
            setActiveStep(index);
          },
        },
      });
    }, section);

    return () => context.revert();
  }, [isDesktop, reduced]);

  return (
    <section className="relative overflow-hidden bg-ink-950">
      {/* Masaüstü: sabitlenmiş yatay şerit */}
      <div ref={sectionRef} className="hidden lg:block">
        <div className="flex h-screen flex-col justify-center">
          <Container>
            <div className="flex items-end justify-between gap-10">
              <div>
                <Eyebrow>Nasıl Çalışıyorum</Eyebrow>
                <h2 className="mt-6 max-w-xl text-balance text-5xl leading-[1.05]">
                  Ev satmak bir işlem değil,{" "}
                  <span className="text-brand-500">altı adımlık bir süreç.</span>
                </h2>
              </div>
              <p className="hidden max-w-xs pb-2 text-sm leading-relaxed text-cream-500 xl:block">
                Her adımı ben yürütüyorum. Hangi aşamada olduğunuzu her zaman
                bilirsiniz.
              </p>
            </div>
          </Container>

          {/*
            Şerit ekranın sol kenarından başlıyor ama ilk kart Container ile
            aynı hizada dursun diye başa boşluk konuyor — kartlar sayfanın
            kenarından "akıp geliyormuş" hissi bundan geliyor.
          */}
          <div className="mt-16 overflow-hidden">
            <div ref={trackRef} className="flex w-max gap-6 px-[max(1.25rem,calc((100vw-80rem)/2+2rem))]">
              {PROCESS_STEPS.map((step, index) => (
                <StepCard
                  key={step.title}
                  step={step}
                  index={index}
                  isActive={index === activeStep}
                />
              ))}
            </div>
          </div>

          <Container>
            <div className="mt-14 flex items-center gap-4">
              <div className="flex flex-1 gap-1.5">
                {PROCESS_STEPS.map((step, index) => (
                  <span
                    key={step.title}
                    className={cn(
                      "h-0.5 flex-1 rounded-full transition-colors duration-500",
                      index <= activeStep ? "bg-brand-500" : "bg-ink-600",
                    )}
                  />
                ))}
              </div>
              <p className="w-16 shrink-0 text-right font-display text-sm tabular-nums text-cream-500">
                {String(activeStep + 1).padStart(2, "0")}
                <span className="text-ink-500"> / {PROCESS_STEPS.length}</span>
              </p>
            </div>
          </Container>
        </div>
      </div>

      {/* Mobil: parmakla kaydırılan hizalanmalı şerit */}
      <div className="lg:hidden">
        <Container className="pt-20">
          <Eyebrow>Nasıl Çalışıyorum</Eyebrow>
          <h2 className="mt-5 text-balance text-4xl leading-[1.08]">
            Ev satmak bir işlem değil,{" "}
            <span className="text-brand-500">altı adımlık bir süreç.</span>
          </h2>
        </Container>

        <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-20">
          {PROCESS_STEPS.map((step, index) => (
            <div key={step.title} className="snap-start">
              <StepCard step={step} index={index} isActive />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  index,
  isActive,
}: {
  step: (typeof PROCESS_STEPS)[number];
  index: number;
  isActive: boolean;
}) {
  return (
    <article
      className={cn(
        "flex w-[78vw] shrink-0 flex-col rounded-card border p-7 transition-colors duration-500 sm:w-[380px] lg:w-[400px] lg:p-8",
        isActive
          ? "border-ink-600 bg-ink-850"
          : "border-ink-700 bg-ink-900/60",
      )}
    >
      {step.imageUrl ? (
        <div className="relative mb-7 aspect-4/3 overflow-hidden rounded-lg">
          <Image
            src={step.imageUrl}
            alt=""
            fill
            sizes="400px"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="flex items-baseline gap-4">
        <span
          className={cn(
            "font-display text-5xl tabular-nums transition-colors duration-500 lg:text-6xl",
            isActive ? "text-brand-500" : "text-ink-500",
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className={cn(
            "h-px flex-1 transition-colors duration-500",
            isActive ? "bg-brand-500/40" : "bg-ink-700",
          )}
        />
      </div>

      <h3 className="mt-6 text-2xl leading-snug lg:text-[1.75rem]">
        {step.title}
      </h3>
      <p className="mt-4 text-sm leading-relaxed text-cream-400 lg:text-base">
        {step.description}
      </p>
    </article>
  );
}
