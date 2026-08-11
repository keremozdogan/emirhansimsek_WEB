/**
 * Görsellerin kendi çözünürlüğünün üstünde gösterilip gösterilmediğini denetler.
 *
 *   npx tsx scripts/check-image-scale.mts
 *   npx tsx scripts/check-image-scale.mts --dpr 1
 *
 * NEDEN BÖYLE BİR BETİK GEREKİYOR?
 *
 * Yaygın sanı, Next'in küçük bir görseli büyüterek sunduğudur. Sunmuyor:
 * `/_next/image?...&w=2048` istense bile 1024 piksellik bir kaynak 1024 piksel
 * olarak döner — bayt tarafında büyütme yoktur. Sorun yerleşimdedir. `srcset`,
 * kaynakta olmayan `2048w` gibi genişlikleri yine de ilan eder; tarayıcı bu
 * bildirime güvenip adayı seçer ve 1024 pikselik veriyi 2048 CSS pikseline
 * yayar. Bayt değil, GÖRÜNTÜ büyür — fotoğraf yumuşar.
 *
 * Bunu tek bir yapılandırmayla kapatmak mümkün değil: bir görselin ekranda kaç
 * CSS pikseli kapladığı yerleşimin kararıdır. Yapılabilecek şey, hangi görselin
 * hangi yuvada büyütüldüğünü ölçüp raporlamaktır — düzeltmesi ya daha büyük bir
 * kaynak koymak ya da yuvayı küçültmektir.
 *
 * Çıkış kodu, büyütülen görsel varsa 1 olur; böylece istenirse CI'a takılabilir.
 */

import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const UPLOADS = path.join(ROOT, "public", "uploads");

/** `--dpr 2` ile değiştirilebilir. 2, retina ekranların varsayılanı. */
const dprArg = process.argv.indexOf("--dpr");
const DPR = dprArg > -1 ? Number(process.argv[dprArg + 1]) : 2;

/**
 * Görsel yuvaları: bir görselin en geniş ekranda kaç CSS pikseli kapladığı.
 *
 * Değerler bileşenlerdeki `sizes` bildirimlerinden türetildi. Bir bileşenin
 * `sizes` değeri değişirse buranın da güncellenmesi gerekir — bu yüzden yuva
 * adının yanında kaynağı yazılı.
 */
const SLOTS = [
  {
    /**
     * Dikey kadraj `<source media="(min-width: 768px)">` ile devre dışı kalır,
     * yani yalnızca 767px ve altındaki ekranlarda yüklenir. Yuvası tam ekran
     * değil, telefon genişliğidir — geniş kadrajla aynı kefeye konursa olmayan
     * bir sorun raporlanır.
     */
    name: "Hero — dikey kadraj (yalnızca dar ekran)",
    source: "components/home/hero-media.tsx — <source media=\"(min-width: 768px)\">",
    cssWidth: 767,
    matches: (rel: string) => rel.startsWith("site/hero-") && rel.includes("portrait"),
  },
  {
    name: "Hero — geniş kadraj (tam ekran)",
    source: "components/home/hero-media.tsx — sizes=\"100vw\"",
    cssWidth: 1920,
    matches: (rel: string) => rel.startsWith("site/hero-"),
  },
  {
    name: "Bölge kartı (yarım genişlik)",
    source: "components/home/region-grid.tsx — sizes=\"...50vw\"",
    cssWidth: 960,
    matches: (rel: string) => rel.startsWith("bolge/"),
  },
  {
    name: "İlan galerisi (tam genişlik)",
    source: "components/property/property-gallery.tsx",
    cssWidth: 1280,
    matches: (rel: string) => rel.startsWith("ilan/"),
  },
] as const;

type Row = {
  rel: string;
  width: number;
  height: number;
  slot: string;
  needed: number;
  scale: number;
};

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const info = await stat(full);
    if (info.isDirectory()) out.push(...(await walk(full)));
    else if (/\.(webp|jpe?g|png|avif)$/i.test(entry)) out.push(full);
  }
  return out;
}

const files = await walk(UPLOADS);
if (files.length === 0) {
  console.error(`Hiç görsel bulunamadı: ${UPLOADS}`);
  process.exit(1);
}

const rows: Row[] = [];
let skipped = 0;

for (const file of files) {
  const rel = path.relative(UPLOADS, file).split(path.sep).join("/");
  const slot = SLOTS.find((candidate) => candidate.matches(rel));
  if (!slot) {
    skipped += 1;
    continue;
  }

  const meta = await sharp(file).metadata();
  if (!meta.width || !meta.height) continue;

  const needed = slot.cssWidth * DPR;
  rows.push({
    rel,
    width: meta.width,
    height: meta.height,
    slot: slot.name,
    needed,
    scale: needed / meta.width,
  });
}

const upscaled = rows
  .filter((row) => row.scale > 1)
  .sort((a, b) => b.scale - a.scale);

console.log(`\nDPR ${DPR} varsayımıyla ${rows.length} görsel denetlendi.`);
if (skipped > 0) {
  console.log(`${skipped} görsel bilinen bir yuvaya eşleşmediği için atlandı.`);
}

if (upscaled.length === 0) {
  console.log("\n✓ Hiçbir görsel kendi çözünürlüğünün üstünde gösterilmiyor.\n");
  process.exit(0);
}

// En kötü durumu görselleştirmek için yuva bazında özet
const bySlot = new Map<string, Row[]>();
for (const row of upscaled) {
  const list = bySlot.get(row.slot) ?? [];
  list.push(row);
  bySlot.set(row.slot, list);
}

console.log(
  `\n✗ ${upscaled.length} görsel kendi çözünürlüğünün üstünde gösteriliyor:\n`,
);

for (const [slotName, list] of bySlot) {
  const slot = SLOTS.find((candidate) => candidate.name === slotName);
  console.log(`  ${slotName}  (${slot?.source})`);
  console.log(`  Gereken: ${list[0].needed}px`);
  for (const row of list.slice(0, 5)) {
    console.log(
      `    ${row.rel.padEnd(34)} ${String(row.width).padStart(4)}x${row.height}` +
        `  →  %${Math.round((row.scale - 1) * 100)} büyütülüyor`,
    );
  }
  if (list.length > 5) console.log(`    ... ve ${list.length - 5} tane daha`);
  console.log("");
}

process.exit(1);
