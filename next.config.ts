import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Geliştirme sunucusuna yerel ağdaki cihazlardan (telefon, tablet) erişim.
   *
   * Next 16 varsayılan olarak `/_next/*` altındaki geliştirme kaynaklarını
   * yalnızca localhost'a veriyor; başka bir kaynaktan gelen istek engelleniyor.
   * Telefondan `http://192.168.1.100:3009` açıldığında sayfanın HTML'i geliyor
   * ama CSS ve HMR engellendiği için site stilsiz, bozuk görünüyor.
   *
   * Adres kişiden kişiye değiştiği için koda gömülmedi: her geliştirici kendi
   * yerel IP'sini .env dosyasına yazar. Sunucu başlarken "Network:" satırında
   * hangi adresi ilan ettiğini söylüyor; oradaki IP buraya yazılacak olan.
   *
   *   DEV_NETWORK_ORIGINS="192.168.1.100"
   *
   * Yalnızca `next dev` için geçerli; yayın derlemesini etkilemez.
   */
  allowedDevOrigins: (process.env.DEV_NETWORK_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  images: {
    formats: ["image/avif", "image/webp"],
    // Tüm görseller yerel: /public/uploads altında tutuluyor.
    // Harici bir görsel kaynağı eklenirse buraya remotePatterns tanımlanmalı.
    //
    // Next 16'da varsayılan yalnızca [75] ve listede olmayan bir değer en yakın
    // izinli değere ZORLANIYOR — sessizce, hata vermeden. Hero (`HeroMedia`)
    // 82 istiyor; 82 burada olmazsa 75'e düşüyor ve tam ekran İstanbul karesi
    // olması gerekenden bulanık sunuluyordu.
    qualities: [75, 82],
    /**
     * Varsayılan liste 3840'a kadar çıkıyordu. Sitedeki en büyük kaynak 2800px
     * (hero) olduğu için 3840'lık aday hiçbir zaman gerçek 3840 piksel
     * getiremezdi; tarayıcı bu bildirime güvenip onu seçiyor, karşılığında
     * kaynağın kendi boyutunu alıyordu. 3840 çıkarıldı, yerine hero'nun tam
     * çözünürlüğü olan 2800 eklendi — böylece geniş ekranda hero kırpılmadan,
     * büyütülmeden sunulabiliyor.
     *
     * Denetim: `npm run check:images`
     */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2800],
  },
  experimental: {
    // sharp yalnızca sunucuda çalışır; istemci paketine sızmasın
    serverActions: { bodySizeLimit: "30mb" },
  },
};

export default nextConfig;
