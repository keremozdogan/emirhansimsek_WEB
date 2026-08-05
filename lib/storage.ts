import "server-only";

import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * Görsel depolama soyutlaması.
 *
 * Şu an yerel diske (`public/uploads`) yazar. Yayına çıkarken yalnızca bu
 * dosyadaki `saveImage` / `deleteImage` gövdeleri Vercel Blob, S3 veya
 * Cloudinary çağrılarıyla değiştirilir — çağıran kod hiç değişmez.
 */

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_WIDTH = 2400;
const THUMB_WIDTH = 24; // blur placeholder

export type StoredImage = {
  url: string;
  width: number;
  height: number;
  blurDataUrl: string;
};

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
];

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MB

function randomName() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Yüklenen dosyayı WebP'ye çevirir, en fazla 2400px genişliğe indirir ve
 * bulanık önizleme (blur placeholder) üretir.
 */
export async function saveImage(
  file: File,
  folder = "genel",
): Promise<StoredImage> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Dosya 25 MB sınırını aşıyor.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const pipeline = sharp(buffer, { failOn: "none" }).rotate();
  const metadata = await pipeline.metadata();

  const resized = pipeline.resize({
    width: Math.min(metadata.width ?? MAX_WIDTH, MAX_WIDTH),
    withoutEnlargement: true,
  });

  const { data, info } = await resized
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "genel";
  const dir = path.join(UPLOAD_DIR, safeFolder);
  await mkdir(dir, { recursive: true });

  const fileName = `${randomName()}.webp`;
  await writeFile(path.join(dir, fileName), data);

  const blurBuffer = await sharp(data)
    .resize({ width: THUMB_WIDTH })
    .webp({ quality: 40 })
    .toBuffer();

  return {
    url: `/uploads/${safeFolder}/${fileName}`,
    width: info.width,
    height: info.height,
    blurDataUrl: `data:image/webp;base64,${blurBuffer.toString("base64")}`,
  };
}

/** Yerel diskteki bir yüklemeyi siler. Harici URL'ler sessizce atlanır. */
export async function deleteImage(url: string) {
  if (!url.startsWith("/uploads/")) return;
  const target = path.join(process.cwd(), "public", url.replace(/^\//, ""));
  if (!target.startsWith(UPLOAD_DIR)) return; // path traversal koruması
  try {
    await unlink(target);
  } catch {
    // Dosya zaten yoksa sorun değil
  }
}
