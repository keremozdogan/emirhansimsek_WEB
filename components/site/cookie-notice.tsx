"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

const STORAGE_KEY = "es_cookie_notice";

/**
 * Çerez bildirimi.
 *
 * Site takip/reklam çerezi kullanmadığı için bu bir "onay" değil
 * bilgilendirmedir; kullanıcı kapatana kadar gösterilir.
 */
export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        // Sayfa açılışını boğmamak için kısa bir gecikmeyle göster
        const timer = window.setTimeout(() => setVisible(true), 1800);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // Gizli mod / depolama kapalı — bildirimi hiç gösterme
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // yoksay
    }
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-label="Çerez bildirimi"
          className="fixed bottom-20 left-4 z-40 max-w-sm lg:bottom-6"
        >
          <div className="surface-glass rounded-card border border-ink-600 p-5">
            <p className="text-sm leading-relaxed text-cream-300">
              Bu sitede reklam veya takip çerezi kullanılmıyor. Yalnızca favori
              ve karşılaştırma listeleriniz tarayıcınızda saklanıyor.{" "}
              <Link
                href="/cerez-politikasi"
                className="text-brand-400 underline underline-offset-2 hover:text-brand-500"
              >
                Ayrıntılar
              </Link>
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="mt-4 rounded-full bg-cream-50 px-5 py-2 text-sm font-medium text-ink-900 transition-colors hover:bg-white"
            >
              Anladım
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
