"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Reveal } from "@/components/animation/reveal";
import { usePrefersReducedMotion } from "@/components/animation/use-reduced-motion";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/** Satış sürecinin adımları — binanın her katı bir adımı temsil eder. */
export const PROCESS_STEPS = [
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

const FLOOR_HEIGHT = 62;
const FLOOR_COUNT = PROCESS_STEPS.length;
const GROUND_FLOOR_HEIGHT = 46;
/** Zemin çizgisinin viewBox içindeki y konumu */
const BASE_Y = 540;
const BUILDING_X = 96;
const BUILDING_W = 208;

/**
 * Scroll'a bağlı bina animasyonu.
 *
 * Sayfa sabitlenir (pin) ve aşağı kaydırdıkça bina kat kat yükselir; her yeni
 * katla birlikte satış sürecinin bir adımı yanında belirir ve o katın
 * pencereleri yanar. Mobilde pin yerine sıralı bir liste gösterilir —
 * dokunmatik cihazlarda pin takılmaya yol açıyor.
 */
export function BuildingReveal() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
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
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const floors = gsap.utils.toArray<SVGGElement>("[data-floor]");
      const roof = section.querySelector("[data-roof]");

      gsap.set(floors, { yPercent: 0, opacity: 0, y: 70 });
      gsap.set(roof, { opacity: 0, y: 70 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${FLOOR_COUNT * 460}`,
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const index = Math.min(
              FLOOR_COUNT - 1,
              Math.floor(self.progress * FLOOR_COUNT),
            );
            setActiveStep(index);
          },
        },
      });

      floors.forEach((floor, index) => {
        const windows = floor.querySelectorAll("[data-window]");
        timeline
          .to(
            floor,
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
            index * 0.9,
          )
          .to(
            windows,
            {
              fill: "#c8a86b",
              opacity: 1,
              duration: 0.35,
              stagger: 0.08,
              ease: "power2.out",
            },
            index * 0.9 + 0.3,
          );
      });

      timeline.to(
        roof,
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        FLOOR_COUNT * 0.9,
      );
    }, section);

    return () => context.revert();
  }, [isDesktop, reduced]);

  return (
    <div className="relative bg-ink-950">
      {/* Masaüstü: sabitlenmiş sinematik sahne */}
      <div
        ref={sectionRef}
        className="hidden min-h-screen items-center overflow-hidden lg:flex"
      >
        <Container>
          <div className="grid grid-cols-2 items-center gap-16">
            <div>
              <Eyebrow>Nasıl Çalışıyorum</Eyebrow>
              <h2 className="mt-6 max-w-md text-balance text-5xl leading-[1.05]">
                Ev satmak bir işlem değil,{" "}
                <span className="text-brand-500">altı adımlık bir süreç.</span>
              </h2>

              <div className="relative mt-12 h-56">
                {PROCESS_STEPS.map((step, index) => (
                  <div
                    key={step.title}
                    className={cn(
                      "absolute inset-0 transition-all duration-500",
                      index === activeStep
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-4 opacity-0",
                    )}
                  >
                    <p className="font-display text-6xl text-ink-500">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-3 text-3xl">{step.title}</h3>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-cream-400">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* İlerleme çubukları */}
              <div className="mt-10 flex gap-2">
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
            </div>

            <div className="flex justify-center">
              <BuildingSvg className="w-full max-w-md" />
            </div>
          </div>
        </Container>
      </div>

      {/* Mobil: sabitleme yerine sıralı liste */}
      <div className="lg:hidden">
        <Container className="py-20">
          <Eyebrow>Nasıl Çalışıyorum</Eyebrow>
          <h2 className="mt-5 text-balance text-4xl leading-[1.08]">
            Ev satmak bir işlem değil,{" "}
            <span className="text-brand-500">altı adımlık bir süreç.</span>
          </h2>

          <div className="mt-12 flex flex-col">
            {PROCESS_STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.04}>
                <div className="flex gap-5 border-t border-ink-700 py-7">
                  <span className="font-display text-2xl text-brand-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-xl">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-cream-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </div>
    </div>
  );
}

/** Katları ayrı gruplar hâlinde çizilen bina — GSAP her katı tek tek canlandırır. */
function BuildingSvg({ className }: { className?: string }) {
  const floors = Array.from({ length: FLOOR_COUNT }, (_, index) => index);
  /** En üst katın tavanı — çatı ve anten buradan yukarı çizilir */
  const roofY = BASE_Y - GROUND_FLOOR_HEIGHT - FLOOR_COUNT * FLOOR_HEIGHT;

  return (
    <svg
      viewBox="0 0 400 600"
      className={className}
      aria-hidden
      role="presentation"
    >
      <defs>
        <linearGradient id="facade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1c1c21" />
          <stop offset="55%" stopColor="#26262c" />
          <stop offset="100%" stopColor="#141417" />
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#26262c" stopOpacity="0" />
          <stop offset="50%" stopColor="#35353d" />
          <stop offset="100%" stopColor="#26262c" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Zemin çizgisi */}
      <rect x="20" y={BASE_Y} width="360" height="2" fill="url(#ground)" />

      {/* Giriş katı — her zaman görünür, binanın oturduğu taban */}
      <g>
        <rect
          x={BUILDING_X - 14}
          y={BASE_Y - GROUND_FLOOR_HEIGHT}
          width={BUILDING_W + 28}
          height={GROUND_FLOOR_HEIGHT}
          fill="url(#facade)"
        />
        <rect
          x={BUILDING_X + BUILDING_W / 2 - 22}
          y={BASE_Y - 34}
          width="44"
          height="34"
          fill="#0a0a0c"
          stroke="#35353d"
          strokeWidth="1"
        />
        <rect
          x={BUILDING_X + BUILDING_W / 2 - 1}
          y={BASE_Y - 34}
          width="2"
          height="34"
          fill="#35353d"
        />
        {/* Giriş aydınlatması */}
        <circle
          cx={BUILDING_X + BUILDING_W / 2}
          cy={BASE_Y - 42}
          r="18"
          fill="#c8a86b"
          opacity="0.08"
        />
      </g>

      {/* Katlar — aşağıdan yukarı doğru */}
      {floors.map((index) => {
        const y = BASE_Y - GROUND_FLOOR_HEIGHT - (index + 1) * FLOOR_HEIGHT;
        return (
          <g key={index} data-floor={index}>
            <rect
              x={BUILDING_X}
              y={y}
              width={BUILDING_W}
              height={FLOOR_HEIGHT}
              fill="url(#facade)"
            />
            <rect
              x={BUILDING_X}
              y={y}
              width={BUILDING_W}
              height="1"
              fill="#35353d"
            />
            {[0, 1, 2].map((windowIndex) => (
              <rect
                key={windowIndex}
                data-window
                x={BUILDING_X + 22 + windowIndex * 62}
                y={y + 16}
                width="38"
                height="30"
                rx="1"
                fill="#141417"
                opacity="0.9"
              />
            ))}
            {/* Balkon korkuluğu */}
            <rect
              x={BUILDING_X + 14}
              y={y + FLOOR_HEIGHT - 8}
              width={BUILDING_W - 28}
              height="2"
              fill="#35353d"
              opacity="0.6"
            />
          </g>
        );
      })}

      {/* Çatı ve anten */}
      <g data-roof>
        <rect
          x={BUILDING_X - 10}
          y={roofY - 14}
          width={BUILDING_W + 20}
          height="14"
          fill="#26262c"
        />
        <rect
          x={BUILDING_X + BUILDING_W / 2 - 1}
          y={roofY - 62}
          width="2"
          height="48"
          fill="#35353d"
        />
        <circle
          cx={BUILDING_X + BUILDING_W / 2}
          cy={roofY - 66}
          r="4"
          fill="#dc1c2e"
        />
        <circle
          cx={BUILDING_X + BUILDING_W / 2}
          cy={roofY - 66}
          r="11"
          fill="#dc1c2e"
          opacity="0.18"
        />
      </g>
    </svg>
  );
}
