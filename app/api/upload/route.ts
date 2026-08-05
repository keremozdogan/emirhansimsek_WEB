import { NextResponse, type NextRequest } from "next/server";

import { getSession } from "@/lib/auth";
import { ACCEPTED_IMAGE_TYPES, saveImage } from "@/lib/storage";

export const runtime = "nodejs";

/**
 * Çoklu görsel yükleme.
 *
 * Her dosya WebP'ye çevrilir, en fazla 2400px genişliğe indirilir ve bulanık
 * önizlemesi (blur placeholder) üretilir. Yalnızca oturum açmış yönetici
 * kullanabilir.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz istek." }, { status: 401 });
  }

  const formData = await request.formData();
  const folder = String(formData.get("folder") ?? "genel");
  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "Dosya seçilmedi." }, { status: 400 });
  }

  const uploaded = [];
  const failed: string[] = [];

  for (const file of files) {
    if (file.type && !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      failed.push(`${file.name}: desteklenmeyen dosya türü`);
      continue;
    }

    try {
      const stored = await saveImage(file, folder);
      uploaded.push({ ...stored, alt: "" });
    } catch (error) {
      failed.push(
        `${file.name}: ${error instanceof Error ? error.message : "yüklenemedi"}`,
      );
    }
  }

  return NextResponse.json({ uploaded, failed });
}
