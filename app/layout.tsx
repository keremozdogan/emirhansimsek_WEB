import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Emirhan Şimşek | RE/MAX EKSEN Gayrimenkul Danışmanı",
    template: "%s | Emirhan Şimşek",
  },
  description:
    "RE/MAX EKSEN gayrimenkul danışmanı Emirhan Şimşek. Satılık ve kiralık portföy, bölge rehberleri ve ücretsiz konut değerleme.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  colorScheme: "dark",
};

/**
 * `html`/`body` üzerinde `h-full`/`min-h-full` bilerek YOK.
 *
 * `html`'e sabit yükseklik vermek Lenis'i bozuyor: kutusu bir daha değişmediği
 * için Lenis'in ResizeObserver'ı tetiklenmiyor, sayfa yüksekliği ilk ölçümde
 * donuyor ve tekerlekle kaydırma çalışmaz hale geliyor (ayrıntı: globals.css).
 *
 * Zemine kadar uzayan düzeni zaten alt layout'lardaki `min-h-screen` sağlıyor.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${inter.variable} ${playfair.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
