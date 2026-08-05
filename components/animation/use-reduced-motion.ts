"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Kullanıcının "hareketi azalt" tercihini izler.
 *
 * `useSyncExternalStore` kullanılıyor: tercih React dışında bir kaynakta
 * (medya sorgusu) yaşadığı için effect içinde setState çağırmaya gerek kalmıyor.
 * Sunucuda `false` döner, ilk render'dan hemen sonra gerçek değere geçer.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
