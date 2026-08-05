/**
 * İlk kurulum: `npm run setup`
 *
 * Depoyu yeni klonlayan biri için gereken her şeyi hazırlar:
 *   1. .env dosyasını oluşturur (rastgele bir AUTH_SECRET üreterek)
 *   2. Veritabanını kurar ve içeriği yükler
 *
 * .env ve veritabanı bilerek depoya dahil edilmez — biri gizli anahtar içerir,
 * diğeri her geliştiricide farklı olabilir.
 */

import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env");
const examplePath = path.join(root, ".env.example");

function run(command: string) {
  console.log(`\n$ ${command}`);
  execSync(command, { stdio: "inherit", cwd: root });
}

async function ensureEnv() {
  if (existsSync(envPath)) {
    console.log("· .env zaten var, dokunulmadı");
    return;
  }

  if (!existsSync(examplePath)) {
    throw new Error(".env.example bulunamadı — depo eksik klonlanmış olabilir.");
  }

  const secret = randomBytes(32).toString("hex");
  const content = (await readFile(examplePath, "utf8")).replace(
    /^AUTH_SECRET=.*$/m,
    `AUTH_SECRET="${secret}"`,
  );

  await writeFile(envPath, content);
  console.log("✓ .env oluşturuldu (AUTH_SECRET rastgele üretildi)");
  console.log("  → Giriş bilgilerini değiştirmek için .env dosyasını açın:");
  console.log("    ADMIN_EMAIL ve ADMIN_PASSWORD");
}

async function main() {
  console.log("Emirhan Şimşek sitesi — ilk kurulum\n");

  await ensureEnv();
  run("npx prisma generate");
  run("npx prisma migrate deploy");
  run("npx tsx prisma/seed.ts");

  const env = await readFile(envPath, "utf8");
  const email = env.match(/^ADMIN_EMAIL="?([^"\n]+)"?/m)?.[1] ?? "(bilinmiyor)";
  const password =
    env.match(/^ADMIN_PASSWORD="?([^"\n]+)"?/m)?.[1] ?? "(bilinmiyor)";

  console.log("\n──────────────────────────────────────────────");
  console.log("Kurulum tamam. Başlatmak için:  npm run dev");
  console.log("");
  console.log("  Site   : http://localhost:3000");
  console.log("  Panel  : http://localhost:3000/admin");
  console.log(`  E-posta: ${email}`);
  console.log(`  Şifre  : ${password}`);
  console.log("──────────────────────────────────────────────");
}

main().catch((error) => {
  console.error("\nKurulum başarısız:", error.message);
  process.exitCode = 1;
});
