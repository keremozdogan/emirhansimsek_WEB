"use client";

import { motion } from "motion/react";

/**
 * Sayfa geçişi: her yeni sayfa yüklendiğinde ekranı kaplayan siyah perde
 * yukarı doğru sıyrılır, içerik altından yumuşakça belirir. Böylece rotalar
 * arasında beyaz/boş ekran görünmez.
 *
 * Perde neden altın DEĞİL: vurgu rengi açık: tam ekran altın, her gezinmede
 * göz kamaştıran bir flaş olurdu. Bunun yerine perde siyah ve alt kenarında
 * ince bir altın çizgi taşıyor — sıyrılırken yukarı süzülen tek şey o çizgi.
 *
 * `app/(site)/template.tsx` içinde kullanılır — `template.tsx` her gezinmede
 * yeniden monte edildiği için giriş animasyonu kendiliğinden tekrar oynar.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[100] origin-top border-b-2 border-brand-500 bg-ink-950"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
        style={{ transformOrigin: "top" }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </>
  );
}
