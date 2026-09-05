"use client";

import type { ReactNode } from "react";

import { useRevealGroup } from "@/components/animation/use-reveal";
import { cn } from "@/lib/utils";

/**
 * Altındaki `.reveal` öğelerini tek bir IntersectionObserver ile sırayla açar.
 *
 * Sunucu bileşenlerini sarmak için var: içerik sunucuda kalır, yalnızca bu ince
 * sarmalayıcı istemciye iner. Böylece bir liste veya ızgaraya giriş animasyonu
 * eklemek için o bileşeni istemci bileşenine çevirmek gerekmiyor.
 *
 * Projedeki Framer Motion tabanlı `Reveal` bileşeninin YERİNE geçmez; o zaten
 * çoğu bölümde kullanılıyor. Bu, ek JavaScript paketi istemeyen yerler için.
 */
export function RevealGroupCss({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRevealGroup<HTMLDivElement>();
  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
