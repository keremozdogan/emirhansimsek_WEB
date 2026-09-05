"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";

/**
 * Görünüm geçişi başlatan bağlantı.
 *
 * NEDEN GEREKLİ: `view-transition-name` tek başına hiçbir şey yapmaz — geçişi
 * `document.startViewTransition()` başlatır. Tarayıcı bunu yalnızca BELGE
 * gezinmelerinde kendiliğinden yapar; Next App Router istemci tarafında
 * gezindiği için o yol devreye girmez ve Next 16'nın router'ı da bu çağrıyı
 * yapmaz (kaynakta arandı: `next/dist/client` içinde `startViewTransition` yok).
 *
 * React'in `<ViewTransition>` bileşeni bu işi yapardı ama projedeki React
 * 19.2.8 stabil sürümü onu export etmiyor — yalnızca Next'in deneysel React
 * derlemesinde var, ona geçmek bağımlılık değiştirmek olurdu.
 *
 * Bu yüzden Next'in `onNavigate` kancası kullanılıyor: istemci gezinmesi
 * başlarken çağrılıyor, `preventDefault()` ile durdurulup aynı gezinme
 * `startViewTransition` içinde yeniden başlatılıyor.
 *
 * DESTEKLEMEYEN TARAYICI: `startViewTransition` yoksa `onNavigate` hiçbir şey
 * yapmadan döner ve Next gezinmeyi normal şekilde sürdürür. Hata çıkmaz.
 */
export function VtLink({
  href,
  children,
  ...rest
}: Omit<ComponentProps<typeof Link>, "onNavigate"> & {
  href: string;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <Link
      href={href}
      {...rest}
      onNavigate={(event) => {
        if (typeof document.startViewTransition !== "function") return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        event.preventDefault();
        document.startViewTransition(() => {
          router.push(href);
        });
      }}
    >
      {children}
    </Link>
  );
}
