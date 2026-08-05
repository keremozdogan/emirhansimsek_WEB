"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

import { usePrefersReducedMotion } from "@/components/animation/use-reduced-motion";

/** Görünüme girince 0'dan hedefe sayan rakam (127 satış, 8 yıl…) */
export function Counter({
  value,
  suffix = "",
  prefix = "",
  className,
  duration = 1.8,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = usePrefersReducedMotion();

  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0,
  });

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, motionValue, value]);

  useEffect(() => {
    if (reduced) {
      if (ref.current) {
        ref.current.textContent = `${prefix}${value.toLocaleString("tr-TR")}${suffix}`;
      }
      return;
    }
    return spring.on("change", (latest) => {
      if (!ref.current) return;
      ref.current.textContent = `${prefix}${Math.round(latest).toLocaleString("tr-TR")}${suffix}`;
    });
  }, [spring, prefix, suffix, reduced, value]);

  return (
    <span ref={ref} className={className}>
      {reduced ? `${prefix}${value.toLocaleString("tr-TR")}${suffix}` : `${prefix}0${suffix}`}
    </span>
  );
}
