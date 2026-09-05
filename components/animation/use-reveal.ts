"use client";

import { useEffect, useRef } from "react";

/**
 * Görünüm alanına girince `.is-in` ekleyen kaydırma tetikleyicisi.
 *
 * Kütüphane yok: tek bir IntersectionObserver. Öğe göründüğü anda sınıf
 * ekleniyor ve HEMEN unobserve ediliyor — animasyon bir kere oynar, kullanıcı
 * yukarı kaydırıp geri döndüğünde tekrar başa sarmaz. Bu aynı zamanda
 * gözlemcinin sayfa boyunca boşuna kare harcamasını da bitiriyor.
 *
 * NEDEN AYRI BİR SİSTEM: projede zaten Framer Motion tabanlı bir `Reveal`
 * bileşeni var ve bölüm girişlerinde o kullanılıyor. Bu hook onun yerini
 * ALMIYOR; JavaScript paketine dokunmadan, yalnızca CSS ile giriş animasyonu
 * gereken yerler için var (bkz. styles/animations.css → `.reveal`).
 *
 * Kullanım:
 *   const ref = useReveal<HTMLDivElement>();
 *   <div ref={ref} className="reveal">…</div>
 *
 * Sıralı açılım için öğeye `style={{ "--i": 2 }}` verin; gecikme CSS'te
 * `calc(var(--i) * 70ms)` ile hesaplanıyor.
 */
export function useReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Az hareket tercihinde gözlemci hiç kurulmaz: CSS öğeyi zaten görünür
    // tutuyor, boşuna bir observer bırakmanın anlamı yok.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // IntersectionObserver desteklenmiyorsa içerik saydam kalmasın
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-in");
      return;
    }

    const io = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.15,
        // Alt kenardan 60px içeride tetiklenir: öğe ekranın tam dibinde
        // değil, bakılan alana girdiğinde açılır.
        rootMargin: "0px 0px -60px 0px",
      },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}

/**
 * Aynı işin çok öğeli hâli: tek gözlemciyle bir kapsayıcının altındaki tüm
 * `.reveal` öğelerini izler ve sırayla açar.
 *
 * Kart ızgaraları için: her karta ayrı hook takmak yerine ızgaraya bir tane
 * takılır, gözlemci sayısı 12'den 1'e iner.
 */
export function useRevealGroup<T extends HTMLElement = HTMLElement>(
  selector = ".reveal",
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>(selector));
    if (items.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (typeof IntersectionObserver === "undefined") {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );

    items.forEach((el, i) => {
      // Stagger sırası DOM sırasından geliyor; çağıran taraf ayrıca --i
      // vermişse ona dokunulmaz.
      if (!el.style.getPropertyValue("--i")) {
        el.style.setProperty("--i", String(i));
      }
      io.observe(el);
    });

    return () => io.disconnect();
  }, [selector]);

  return ref;
}
