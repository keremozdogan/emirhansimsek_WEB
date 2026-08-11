/**
 * Üst menü.
 *
 * Değerleme eskiden başlıkta ayrı bir vurgulu düğmeydi. Menüye "Kredi
 * Hesaplama" eklenince satır taşmaya başladı; düğme diğer bağlantılarla aynı
 * biçime alınıp menüye taşındı. İki araç sayfası (değerleme ve kredi) yan yana
 * durunca kullanıcı açısından da tutarlı oldu — ikisi de "hesaplama aracı".
 */
export const NAV_LINKS = [
  { href: "/portfoy", label: "Portföy" },
  { href: "/bolgeler", label: "Bölgeler" },
  { href: "/degerleme", label: "Değerleme" },
  { href: "/kredi-hesaplama", label: "Kredi Hesaplama" },
  { href: "/referanslar", label: "Referanslar" },
  { href: "/hakkimda", label: "Hakkımda" },
  { href: "/blog", label: "Rehber" },
  { href: "/iletisim", label: "İletişim" },
] as const;
