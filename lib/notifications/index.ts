import "server-only";

import { sendLeadEmail } from "./email";
import { sendLeadWhatsApp } from "./whatsapp";
import type { LeadNotification } from "./types";

export type { LeadNotification } from "./types";

/**
 * Yeni talebi e-posta ve WhatsApp ile Emirhan'a bildirir.
 *
 * Bu fonksiyon BİLEREK hiçbir zaman throw etmez. Talep bu noktada veritabanına
 * çoktan yazılmış oluyor; bildirim gönderilemedi diye ziyaretçiye hata
 * göstermek yanlış olur — mesajı gerçekten ulaştı, sadece haber verilemedi.
 * Kayıp da yaşanmıyor, talep her hâlükârda /admin/talepler altında duruyor.
 *
 * İki kanal paralel gidiyor: biri düşerse diğeri beklemiyor.
 */
export async function notifyNewLead(lead: LeadNotification) {
  const results = await Promise.all([
    sendLeadEmail(lead).catch((error) => ({
      channel: "email" as const,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    })),
    sendLeadWhatsApp(lead).catch((error) => ({
      channel: "whatsapp" as const,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    })),
  ]);

  for (const result of results) {
    if (result.ok) {
      console.log(`[lead:${lead.id}] ${result.channel} bildirimi gönderildi`);
    } else if ("skipped" in result && result.skipped) {
      console.warn(
        `[lead:${lead.id}] ${result.channel} atlandı — ${result.skipped}`,
      );
    } else {
      console.error(
        `[lead:${lead.id}] ${result.channel} bildirimi BAŞARISIZ — ${result.error}`,
      );
    }
  }

  return results;
}
