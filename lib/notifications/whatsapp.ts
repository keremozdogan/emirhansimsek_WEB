import "server-only";

import { LEAD_TYPE_LABELS } from "@/lib/constants";
import { formatPhone, toWhatsAppNumber } from "@/lib/utils";
import type { ChannelResult, LeadNotification } from "./types";

/**
 * Meta WhatsApp Cloud API üzerinden yeni talep bildirimi.
 *
 * İki mod var:
 *
 *  1. ŞABLON (üretim) — `WHATSAPP_TEMPLATE_NAME` tanımlıysa kullanılır.
 *     Meta'nın "24 saat kuralı" gereği, son 24 saat içinde size yazmamış bir
 *     numaraya serbest metin gönderilemez; yalnızca ONAYLANMIŞ şablon gider.
 *     Emirhan bildirimi alan taraf olduğu için pratikte hep bu mod gerekir.
 *
 *  2. SERBEST METİN (test) — şablon adı tanımlı değilse düz metin denenir.
 *     Yalnızca alıcı son 24 saat içinde işletme numarasına yazdıysa çalışır.
 *     Kurulumu doğrulamak için pratik, üretim için güvenilmez.
 *
 * Kurulum notu: gönderici numara Cloud API'ye kayıtlı olmak zorunda ve o numara
 * normal WhatsApp uygulamasında kullanılamaz — yani Emirhan'ın kendi hattından
 * FARKLI bir numara gerekiyor. Bildirim o numaradan Emirhan'ın hattına düşer.
 */

const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION ?? "v23.0";

/**
 * Şablon parametreleri satır sonu, sekme ya da 4'ten fazla ardışık boşluk
 * içeremez — Meta bu mesajları `132000` hatasıyla reddediyor. Ayrıca boş
 * parametre kabul edilmiyor, bu yüzden yedek bir değer dönüyoruz.
 */
function asTemplateParam(value: string | null | undefined, fallback = "—") {
  const cleaned = (value ?? "").replace(/\s+/g, " ").trim();
  if (!cleaned) return fallback;
  // Gövde parametreleri için Meta'nın sınırı 1024 karakter
  return cleaned.length > 1000 ? `${cleaned.slice(0, 997)}…` : cleaned;
}

/** 4. şablon parametresi: mesaj + ilan + geldiği sayfa tek satırda */
function buildSummary(lead: LeadNotification) {
  const parts: string[] = [];
  if (lead.propertyTitle) parts.push(`İlan: ${lead.propertyTitle}`);
  if (lead.details?.length) {
    parts.push(...lead.details.map((d) => `${d.label}: ${d.value}`));
  }
  if (lead.message) parts.push(`Mesaj: ${lead.message}`);
  if (lead.email) parts.push(`E-posta: ${lead.email}`);
  if (lead.source) parts.push(`Sayfa: ${lead.source}`);
  return parts.join(" · ");
}

/** Serbest metin modunda kullanılan, satır sonu içerebilen tam metin */
function buildPlainText(lead: LeadNotification) {
  const typeLabel = LEAD_TYPE_LABELS[lead.type] ?? lead.type;
  const lines = [
    `*Yeni ${typeLabel} talebi*`,
    "",
    `Ad: ${lead.name}`,
    `Telefon: ${formatPhone(lead.phone)}`,
  ];
  if (lead.email) lines.push(`E-posta: ${lead.email}`);
  if (lead.propertyTitle) lines.push(`İlan: ${lead.propertyTitle}`);
  if (lead.details?.length) {
    lines.push(...lead.details.map((d) => `${d.label}: ${d.value}`));
  }
  if (lead.message) lines.push("", lead.message);
  if (lead.source) lines.push("", `Sayfa: ${lead.source}`);
  return lines.join("\n");
}

export async function sendLeadWhatsApp(
  lead: LeadNotification,
): Promise<ChannelResult> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = process.env.LEAD_NOTIFY_WHATSAPP;

  if (!token || !phoneNumberId) {
    return {
      channel: "whatsapp",
      skipped: "WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID tanımlı değil",
    };
  }
  if (!to) {
    return { channel: "whatsapp", skipped: "LEAD_NOTIFY_WHATSAPP tanımlı değil" };
  }

  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  const recipient = toWhatsAppNumber(to);

  const body = templateName
    ? {
        messaging_product: "whatsapp",
        to: recipient,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: process.env.WHATSAPP_TEMPLATE_LANG ?? "tr",
          },
          components: [
            {
              type: "body",
              parameters: [
                LEAD_TYPE_LABELS[lead.type] ?? lead.type,
                lead.name,
                formatPhone(lead.phone),
                buildSummary(lead),
              ].map((value) => ({
                type: "text",
                text: asTemplateParam(value),
              })),
            },
          ],
        },
      }
    : {
        messaging_product: "whatsapp",
        to: recipient,
        type: "text",
        text: { preview_url: false, body: buildPlainText(lead) },
      };

  try {
    // Bildirim yanıtı bloklamasın diye üst sınır koyuyoruz
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!response.ok) {
      // Meta hatayı JSON gövdesinde açıklıyor; teşhis için birebir aktarıyoruz
      const detail = await response.text().catch(() => "");
      return {
        channel: "whatsapp",
        ok: false,
        error: `HTTP ${response.status} — ${detail.slice(0, 500)}`,
      };
    }

    return { channel: "whatsapp", ok: true };
  } catch (error) {
    return {
      channel: "whatsapp",
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
