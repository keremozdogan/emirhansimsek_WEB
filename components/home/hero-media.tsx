import { getImageProps } from "next/image";

/**
 * Hero'nun arka plan görseli.
 *
 * Sunucu bileşeni: `getImageProps` ile kadrajlar `<picture>` içinde sunuluyor.
 * İki `<Image>` yan yana koymak yerine bunu yapmamızın sebebi, `display:none`
 * verilen bir `<Image>`'ı tarayıcının yine de indirmesi — hero sayfanın en ağır
 * varlığı olduğu için bu kabul edilemez. `<source media>` ile tarayıcı yalnızca
 * eşleşen kadrajı indiriyor.
 *
 * Dikey kadraj isteğe bağlı: paneldeki `heroPosterUrl` değiştirildiğinde tek
 * görselle çalışmaya devam eder. Varsayılan İstanbul karesi 2.28:1 olduğu için
 * dikey ekranda kırpılınca ortada dar bir deniz–gökyüzü şeridi kalıyordu;
 * onun için silüeti üst üçlüğe alan ayrı bir kadraj tutuluyor.
 */

/** Varsayılan hero karesi ve dikey eşi (bkz. scripts/fetch-commons-image.mts) */
export const DEFAULT_HERO = "/uploads/site/hero-istanbul.webp";
export const DEFAULT_HERO_PORTRAIT = "/uploads/site/hero-istanbul-portrait.webp";

/**
 * Varsayılan görselin 16 piksellik hâli. Kalıcı olarak arka planda durur: hem
 * yükleme sırasında hem de tarayıcı katmanı yeniden rasterize ederken boşluğa
 * siyah değil fotoğrafın kendi tonları düşer.
 */
export const HERO_BLUR =
  "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAABQAgCdASoQAAcAAwBSJZACdH8IwABZzh1FnIAA/u2tF/EfDX3VSvYQ64qWlfBGb4EbrIuB3wMde1L0gAA=";

export function HeroMedia({
  src,
  portraitSrc,
  alt = "",
}: {
  src: string;
  /** Verilirse dar ekranlarda bu kadraj kullanılır */
  portraitSrc?: string | null;
  alt?: string;
}) {
  const common = {
    alt,
    fill: true,
    sizes: "100vw",
    quality: 82,
    // Hero LCP öğesi; geç yüklenmesi doğrudan puana yazıyor
    priority: true,
  } as const;

  const wide = getImageProps({ ...common, src }).props;
  const portrait = portraitSrc
    ? getImageProps({ ...common, src: portraitSrc }).props
    : null;

  // Dikey kadraj varsa `<img>` onu taşır ve geniş kadraj `<source media>` ile
  // devreye girer; yoksa tek görsel doğrudan `<img>` üzerinde kalır.
  const { srcSet: baseSrcSet, ...rest } = portrait ?? wide;

  return (
    <picture>
      {portrait ? (
        <source media="(min-width: 768px)" srcSet={wide.srcSet} sizes="100vw" />
      ) : null}
      <source srcSet={baseSrcSet} sizes="100vw" />
      {/*
        LCP nitelikleri AÇIKÇA yazılıyor.

        `getImageProps` bu üçünü döndürmesine rağmen `<picture>` içinde düz bir
        `<img>`e yayıldığında çıktıda görünmüyorlardı: sayfanın en büyük öğesi
        olan hero, tarayıcıya "öncelikli" diye bildirilmiyordu. Sonradan gelen
        `rest` bir değer taşıyorsa bunlar onunla ezilmesin diye yayılımdan
        SONRA yazıldı.
      */}
      <img
        {...rest}
        alt={alt}
        className="size-full object-cover"
        fetchPriority="high"
        loading="eager"
        decoding="async"
      />
    </picture>
  );
}
