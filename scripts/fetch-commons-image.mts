/**
 * Wikimedia Commons'tan görsel indirir, siteye uygun WebP'ye çevirir ve
 * lisans künyesini kaydeder.
 *
 *   npx tsx scripts/fetch-commons-image.mts \
 *     --file "File:Modern Istanbul skyline at sunset.jpg" \
 *     --out site/hero-istanbul \
 *     --width 2800
 *
 * Aramak için:
 *   npx tsx scripts/fetch-commons-image.mts --search "Çekmeköy" --limit 8
 *
 * Neden Commons? Anahtar istemiyor, çözünürlükler yüksek ve her dosyanın
 * lisansı makine tarafından okunabilir şekilde duruyor. CC BY / BY-SA
 * lisansları atıf zorunlu kılıyor — bu yüzden indirilen her görselin künyesi
 * `content/media-credits.json` dosyasına yazılıyor ve /telif sayfasında
 * yayımlanıyor. Künye olmadan bu görseller kullanılamaz.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const API = "https://commons.wikimedia.org/w/api.php";
const UA = "EmirhanSimsekWeb/1.0 (https://emirhansimsek.com)";
const ROOT = process.cwd();
const CREDITS_PATH = path.join(ROOT, "content", "media-credits.json");

export type MediaCredit = {
  /** Sitedeki yol, ör. /uploads/site/hero-istanbul.webp */
  url: string;
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
};

type ExtMeta = Record<string, { value?: string } | undefined>;

type ImageInfo = {
  url: string;
  width: number;
  height: number;
  extmetadata?: ExtMeta;
};

type CommonsPage = { title: string; imageinfo?: ImageInfo[] };

function stripHtml(value: string | undefined): string {
  if (!value) return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function api(params: Record<string, string>) {
  const url = `${API}?${new URLSearchParams({ format: "json", ...params })}`;
  const response = await fetch(url, { headers: { "User-Agent": UA } });
  if (!response.ok) {
    throw new Error(`Commons API ${response.status}: ${url}`);
  }
  return response.json();
}

/** Arama sonuçlarını çözünürlük ve lisansıyla listeler. */
async function search(query: string, limit: number) {
  const data = await api({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6", // yalnızca dosyalar
    gsrlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
  });

  const pages = Object.values(
    (data?.query?.pages ?? {}) as Record<string, CommonsPage>,
  );
  if (pages.length === 0) {
    console.log("Sonuç yok.");
    return;
  }

  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (!info) continue;
    const meta = (info.extmetadata ?? {}) as ExtMeta;
    console.log(page.title);
    console.log(
      `  ${info.width}x${info.height}  ${stripHtml(meta.LicenseShortName?.value) || "lisans?"}`,
    );
    console.log(`  ${stripHtml(meta.Artist?.value) || "(yazar bilinmiyor)"}`);
    console.log();
  }
}

async function fetchImageInfo(fileTitle: string) {
  const data = await api({
    action: "query",
    titles: fileTitle,
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
  });

  const page = Object.values(
    (data?.query?.pages ?? {}) as Record<string, CommonsPage>,
  )[0];
  const info = page?.imageinfo?.[0];
  if (!info?.url) {
    throw new Error(`Dosya bulunamadı: ${fileTitle}`);
  }
  return { info, title: page.title };
}

/** Künyeleri url'ye göre tekilleştirerek kaydeder. */
async function saveCredit(credit: MediaCredit) {
  await mkdir(path.dirname(CREDITS_PATH), { recursive: true });

  let credits: MediaCredit[] = [];
  try {
    credits = JSON.parse(await readFile(CREDITS_PATH, "utf8"));
  } catch {
    // İlk çalıştırma — dosya henüz yok
  }

  const next = credits.filter((item) => item.url !== credit.url);
  next.push(credit);
  next.sort((a, b) => a.url.localeCompare(b.url));

  await writeFile(CREDITS_PATH, `${JSON.stringify(next, null, 2)}\n`);
}

async function download(fileTitle: string, out: string, width: number) {
  const { info, title } = await fetchImageInfo(fileTitle);

  // API dönen url'ye takip parametreleri ekliyor; ham dosyayı istiyoruz
  const originalUrl = info.url.split("?")[0];
  console.log(`↓ ${title}`);
  console.log(`  kaynak: ${info.width}x${info.height}`);

  const response = await fetch(originalUrl, { headers: { "User-Agent": UA } });
  if (!response.ok) {
    throw new Error(`İndirilemedi (${response.status}): ${originalUrl}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());

  const relative = out.endsWith(".webp") ? out : `${out}.webp`;
  const target = path.join(ROOT, "public", "uploads", relative);
  await mkdir(path.dirname(target), { recursive: true });

  const written = await sharp(buffer)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(target);

  console.log(`  yazıldı: ${written.width}x${written.height} → uploads/${relative}`);

  const meta = (info.extmetadata ?? {}) as ExtMeta;
  const credit: MediaCredit = {
    url: `/uploads/${relative}`,
    title: stripHtml(meta.ObjectName?.value) || title.replace(/^File:/, ""),
    author: stripHtml(meta.Artist?.value) || "Bilinmiyor",
    license: stripHtml(meta.LicenseShortName?.value) || "Bilinmiyor",
    licenseUrl: stripHtml(meta.LicenseUrl?.value),
    sourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
  };

  await saveCredit(credit);
  console.log(`  künye: ${credit.author} — ${credit.license}`);
}

function arg(name: string) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function main() {
  const query = arg("search");
  if (query) {
    await search(query, Number(arg("limit") ?? 8));
    return;
  }

  const file = arg("file");
  const out = arg("out");
  if (!file || !out) {
    console.error(
      'Kullanım:\n  --search "terim" [--limit 8]\n  --file "File:Ad.jpg" --out klasor/ad [--width 2400]',
    );
    process.exit(1);
  }

  await download(file, out, Number(arg("width") ?? 2400));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
