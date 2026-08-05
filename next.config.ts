import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Tüm görseller yerel: /public/uploads altında tutuluyor.
    // Harici bir görsel kaynağı eklenirse buraya remotePatterns tanımlanmalı.
  },
  experimental: {
    // sharp yalnızca sunucuda çalışır; istemci paketine sızmasın
    serverActions: { bodySizeLimit: "30mb" },
  },
};

export default nextConfig;
