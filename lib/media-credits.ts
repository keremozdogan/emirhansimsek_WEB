import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Serbest lisanslı görsellerin künyeleri.
 *
 * `scripts/fetch-commons-image.mts` her indirmede bu dosyaya yazıyor;
 * /telif sayfası da buradan okuyup yayımlıyor. Veritabanı yerine dosyada
 * tutulmasının sebebi, künyenin görselin kendisiyle birlikte depoya girmesi —
 * görsel commit'lendiği anda lisansı da commit'lenmiş oluyor.
 */

export type MediaCredit = {
  url: string;
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
};

const CREDITS_PATH = path.join(process.cwd(), "content", "media-credits.json");

export async function getMediaCredits(): Promise<MediaCredit[]> {
  try {
    const raw = await readFile(CREDITS_PATH, "utf8");
    return JSON.parse(raw) as MediaCredit[];
  } catch {
    // Henüz serbest lisanslı görsel eklenmemiş olabilir
    return [];
  }
}
