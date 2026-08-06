"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Lenis yumuşak kaydırmayı başlatır ve GSAP ScrollTrigger ile senkronize eder.
 *
 * Sitenin "premium" hissini veren tek en önemli parça budur. Hareket azaltma
 * tercihi açıksa Lenis hiç devreye girmez, tarayıcının kendi kaydırması kullanılır.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Dokunmatik cihazlarda native kaydırma daha akıcı ve pil dostu
      syncTouch: false,
      touchMultiplier: 1.6,
      // İç içe kaydırılabilir kutular (modal gövdesi, taşan liste) Lenis 1.3'te
      // varsayılan olarak yok sayılıyor; açık olmazsa tekerlek olayları yutuluyor.
      allowNestedScroll: true,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    /**
     * Lenis kaydırma sınırını `document.documentElement.scrollHeight` üzerinden
     * hesaplıyor. `pin: true` kullanan ScrollTrigger'lar (building-reveal,
     * property-tour) sayfa yüksekliğini Lenis ölçtükten SONRA pin-spacer ekleyip
     * çıkararak değiştiriyor. Her refresh sonrası yeniden ölçmezsek sınır eskide
     * kalır ve tekerlekle kaydırma o bölgede takılır.
     */
    const syncDimensions = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", syncDimensions);

    // Görseller yüklendikçe pin/scrub konumları kayabilir
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      ScrollTrigger.removeEventListener("refresh", syncDimensions);
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Sayfa değişiminde en üste dön ve ScrollTrigger ölçümlerini tazele
  useEffect(() => {
    // Lenis çalışıyorken `window.scrollTo` onu baypas eder ve iç konumunu
    // eskitir; varsa Lenis'in kendi API'siyle atlıyoruz.
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });

    const id = window.setTimeout(() => ScrollTrigger.refresh(), 250);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return <>{children}</>;
}
