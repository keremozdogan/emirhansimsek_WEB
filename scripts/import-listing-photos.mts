/**
 * Bir ilanın fotoğraflarını kaynak klasörden alıp siteye hazırlar.
 *
 *   npx tsx scripts/import-listing-photos.mts \
 *     --code P20587627 \
 *     --src ~/Downloads \
 *     --match "IMG_81\\d\\d" \
 *     --width 2800 --quality 88
 *
 * Ne yapar:
 *   1. Eşleşen dosyaları ada göre sıralayıp 01.webp, 02.webp ... olarak yazar
 *   2. Her kare için 16 piksellik `blurDataUrl` üretir (yükleme sırasında zemin)
 *   3. `prisma/photos.json` içindeki ilgili ilan kaydını günceller
 *
 * NEDEN 2800 PİKSEL?
 * `next.config.ts` içindeki `deviceSizes` en fazla 2800'e çıkıyor; tarayıcı
 * bundan geniş bir varyant isteyemez. Daha büyük saklamak diske ve depoya
 * yazılan boşuna bayttır. Ölçmek için: `npm run check:images`.
 *
 * NEDEN KALİTE 88?
 * Next, sunarken kendi varyantlarını üretiyor (q75/q82). Kaynağı daha yüksek
 * kalitede tutmak, yeniden kodlamanın çift sıkıştırma kaybı yaratmasını
 * engelliyor. Kaynak zaten sıkışıksa artık kurtarılamaz.
 *
 * NEDEN KESKİNLEŞTİRME?
 * Her küçültme yumuşatır: komşu pikseller ortalanınca kenarların keskinliği
 * (akutans) düşer. Bu bir odak sorunu değil örnekleme sonucudur ve düzeltmesi
 * küçültme SONRASINDA unsharp mask uygulamaktır.
 *
 * Doğru sigma, küçültme oranına DEĞİL kaynağın kendi netliğine bağlıdır:
 *   8064px kaynak → 2800 : sigma 1.0
 *   4032px kaynak → 2800 : sigma 1.4
 *
 * İlk bakışta ters görünüyor — az küçülten daha çok keskinleştirme istiyor.
 * Sebebi şu: 8064'ten 2800'e inerken her çıktı pikseli yaklaşık sekiz kaynak
 * pikselinin ortalamasıdır; bu süperörnekleme telefonun gürültüsünü ve gürültü
 * azaltma bulanıklığını temizler, geriye gerçek detay kalır. 4032'den 2800'e
 * inerken böyle bir temizlik olmaz, kaynağın kendi yumuşaklığı olduğu gibi
 * geçer ve daha güçlü bir düzeltme gerekir.
 *
 * Değerler %100 kırpma karşılaştırmasıyla seçildi. Fazlası kontrastlı
 * kenarlarda hale ve "fazla işlenmiş" görüntü bırakır (2.0 denendi, aştı).
 * YENİ ÇEKİMDE MUTLAKA İKİ ÜÇ DEĞERİ KARŞILAŞTIRIN — varsayılana güvenmeyin.
 *
 * Keskinleştirmenin yapamayacağı şey olmayan detayı yaratmaktır: 12 MP bir
 * kaynak, 48 MP bir kaynağın netliğine hiçbir ayarla ulaşmaz.
 *
 * GİZLİLİK: sharp varsayılan olarak EXIF'i ATAR. Telefon fotoğrafları çoğu
 * zaman GPS koordinatı taşır; bir konutun tam konumunu görselin içinde
 * yayınlamak istemiyoruz. `.withMetadata()` eklemeyin.
 *
 * DOSYA ADLARI İÇERİK DAMGALIDIR: `01-a3f9c2d1.webp`. Baştaki sayı çekim
 * sırasını, sondaki sekiz harf dosyanın içeriğinin özetini taşır.
 *
 * Bu şart, tercih değil. Daha önce dosyalar düz `01.webp`, `02.webp` diye
 * numaralanıyordu; bir ilanın fotoğrafları elenip yeniden içe aktarılınca aynı
 * ad BAŞKA bir fotoğrafı göstermeye başladı. URL değişmediği için tarayıcılar
 * ve Next görsel önbelleği eski kareyi vermeye devam etti: siteyi daha önce
 * açmış biri, "Manzara" altyazısının altında eski numaralandırmadaki çocuk
 * odasını gördü. İçerik değişince ad da değişirse böyle bir çakışma imkânsız
 * hâle geliyor.
 *
 * Sıralama notu: dosya adındaki sayı KAYNAK SIRASIDIR, sunum sırası DEĞİLDİR. Turun sırasını ve
 * kart kapağını `prisma/seed-data.ts` içindeki `tour` dizisi belirler
 * (bkz. scripts/sync-content.mts → buildImages). Böylece hangi dosyanın hangi
 * çekimden geldiği izlenebilir kalıyor.
 */

import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";

function arg(name: string, fallback?: string): string {
  const index = process.argv.indexOf(`--${name}`);
  if (index > -1 && process.argv[index + 1]) return process.argv[index + 1];
  if (fallback !== undefined) return fallback;
  throw new Error(`--${name} gerekli`);
}

const ROOT = process.cwd();
const code = arg("code");
const srcDir = arg("src").replace(/^~/, os.homedir());
const match = new RegExp(`^${arg("match")}\\.(jpe?g|png|heic|webp)$`, "i");
const width = Number(arg("width", "2800"));
const quality = Number(arg("quality", "88"));
const sharpenSigma = Number(arg("sharpen", "1.0"));
/**
 * Seçmeli içe aktarma. Bir çekimde aynı odanın 3-4 açısı ve odak tutmamış
 * kareler olur; hepsini yayına koymak galeriyi tekrara boğar. Verilirse
 * yalnızca bu dosyalar alınır ve numaralandırma yine 01'den başlar.
 */
const onlyArg = process.argv.indexOf("--only");
const only =
  onlyArg > -1 && process.argv[onlyArg + 1]
    ? new Set(process.argv[onlyArg + 1].split(",").map((s) => s.trim()))
    : null;

const outDir = path.join(ROOT, "public", "uploads", "ilan", code);
const photosPath = path.join(ROOT, "prisma", "photos.json");

const files = (await readdir(srcDir))
  .filter((f) => match.test(f))
  .filter((f) => (only ? only.has(f) : true))
  .sort();

if (only) {
  const eksik = [...only].filter((f) => !files.includes(f));
  if (eksik.length > 0) {
    console.error(`--only ile istenen ama bulunamayan: ${eksik.join(", ")}`);
    process.exit(1);
  }
}
if (files.length === 0) {
  console.error(`Eşleşen dosya yok: ${srcDir} / ${match}`);
  process.exit(1);
}

console.log(`${files.length} dosya bulundu → ${code}\n`);
await mkdir(outDir, { recursive: true });

type Photo = {
  url: string;
  width: number;
  height: number;
  blurDataUrl: string;
};

const entries: Photo[] = [];
const yazilan = new Set<string>();
let totalBytes = 0;

for (const [index, file] of files.entries()) {
  const sira = String(index + 1).padStart(2, "0");
  const source = path.join(srcDir, file);

  // `.rotate()` argümansız çağrılınca EXIF yönelimini uygular; telefon
  // fotoğraflarının yan yatmasını bu önlüyor.
  const pipeline = sharp(source).rotate();
  const meta = await pipeline.metadata();

  // Kaynaktan BÜYÜTME yok: hedef genişlik kaynağı aşıyorsa kaynakta kalınır.
  const targetWidth = Math.min(width, meta.width ?? width);

  const buffer = await pipeline
    .resize(targetWidth, null, { withoutEnlargement: true })
    // Küçültme akutansı düşürür; kaybı geri almak için çıkış keskinleştirmesi
    .sharpen({ sigma: sharpenSigma })
    .webp({ quality })
    .toBuffer();
  // İçerik damgası: aynı görsel her koşuda aynı adı, değişen görsel yeni adı alır
  const damga = createHash("sha256").update(buffer).digest("hex").slice(0, 8);
  const name = `${sira}-${damga}`;
  await writeFile(path.join(outDir, `${name}.webp`), buffer);
  yazilan.add(`${name}.webp`);
  totalBytes += buffer.length;

  const out = await sharp(buffer).metadata();
  const blur = await sharp(buffer).resize(16).webp({ quality: 40 }).toBuffer();

  entries.push({
    url: `/uploads/ilan/${code}/${name}.webp`,
    width: out.width!,
    height: out.height!,
    blurDataUrl: `data:image/webp;base64,${blur.toString("base64")}`,
  });

  console.log(
    `  ${name}.webp  ←  ${file.padEnd(16)} ` +
      `${meta.width}x${meta.height} → ${out.width}x${out.height}  ` +
      `${(buffer.length / 1024).toFixed(0)} KB`,
  );
}

// Artık kullanılmayan kareleri sil. İçerik damgalı adlar sayesinde her koşuda
// tüm dosyalar yeniden yazılmaz; değişmeyen görsel aynı adı alır ve dokunulmaz.
const mevcut = await readdir(outDir);
const artik = mevcut.filter((f) => f.endsWith(".webp") && !yazilan.has(f));
for (const f of artik) await rm(path.join(outDir, f));
if (artik.length > 0) {
  console.log(`\n${artik.length} eski dosya silindi: ${artik.join(", ")}`);
}

const photos = JSON.parse(await readFile(photosPath, "utf8")) as Record<
  string,
  Photo[]
>;
const previous = photos[code]?.length ?? 0;
photos[code] = entries;
await writeFile(photosPath, `${JSON.stringify(photos, null, 1)}\n`, "utf8");

console.log(
  `\n✓ ${entries.length} kare yazıldı (${(totalBytes / 1024 / 1024).toFixed(1)} MB)`,
);
console.log(`✓ prisma/photos.json güncellendi (önceki kayıt: ${previous} kare)`);
console.log(
  `\nSıradaki adım: prisma/seed-data.ts içindeki "${code}" turunu gözden geçirin,\n` +
    `sonra \`npm run db:sync\` çalıştırın.`,
);
