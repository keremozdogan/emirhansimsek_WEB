import "server-only";

import nodemailer from "nodemailer";

import { LEAD_TYPE_LABELS } from "@/lib/constants";
import { formatPhone } from "@/lib/utils";
import type { ChannelResult, LeadNotification } from "./types";

/**
 * SMTP üzerinden yeni talep bildirimi.
 *
 * Bildirim Emirhan'ın kendi kutusuna gittiği için teslim edilebilirlik (SPF /
 * DKIM / DMARC) burada kritik değil; herhangi bir SMTP hesabı yeterli.
 * Gmail kullanılacaksa hesap şifresi DEĞİL, "uygulama şifresi" gerekiyor.
 *
 * Ziyaretçinin adresi `replyTo`'ya konuyor: gelen bildirime doğrudan "Yanıtla"
 * demek talebi gönderen kişiye yazmak anlamına geliyor.
 */

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) return null;

  if (!transporter) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    transporter = nodemailer.createTransport({
      host,
      port,
      // 465 kapalı SSL, diğer portlar STARTTLS ile yükseltilir
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return transporter;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildRows(lead: LeadNotification) {
  const rows: { label: string; value: string }[] = [
    { label: "Talep tipi", value: LEAD_TYPE_LABELS[lead.type] ?? lead.type },
    { label: "Ad Soyad", value: lead.name },
    { label: "Telefon", value: formatPhone(lead.phone) },
  ];

  if (lead.email) rows.push({ label: "E-posta", value: lead.email });
  if (lead.propertyTitle) rows.push({ label: "İlan", value: lead.propertyTitle });
  if (lead.source) rows.push({ label: "Geldiği sayfa", value: lead.source });
  if (lead.details?.length) rows.push(...lead.details);
  if (lead.message) rows.push({ label: "Mesaj", value: lead.message });

  return rows;
}

export async function sendLeadEmail(
  lead: LeadNotification,
): Promise<ChannelResult> {
  const mailer = getTransporter();
  const to = process.env.LEAD_NOTIFY_EMAIL;

  if (!mailer) {
    return {
      channel: "email",
      skipped: "SMTP_HOST / SMTP_USER / SMTP_PASSWORD tanımlı değil",
    };
  }
  if (!to) {
    return { channel: "email", skipped: "LEAD_NOTIFY_EMAIL tanımlı değil" };
  }

  const rows = buildRows(lead);
  const typeLabel = LEAD_TYPE_LABELS[lead.type] ?? lead.type;

  const text = rows.map((row) => `${row.label}: ${row.value}`).join("\n");

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px">
      <h2 style="margin:0 0 4px;font-size:18px">Yeni ${escapeHtml(typeLabel)} talebi</h2>
      <p style="margin:0 0 20px;color:#666;font-size:13px">
        ${escapeHtml(lead.name)} siteden mesaj gönderdi.
      </p>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px">
        ${rows
          .map(
            (row) => `
          <tr>
            <td style="padding:8px 12px 8px 0;color:#666;white-space:nowrap;vertical-align:top;border-bottom:1px solid #eee">
              ${escapeHtml(row.label)}
            </td>
            <td style="padding:8px 0;border-bottom:1px solid #eee;white-space:pre-wrap">
              ${escapeHtml(row.value)}
            </td>
          </tr>`,
          )
          .join("")}
      </table>
      <p style="margin:20px 0 0;font-size:13px">
        <a href="tel:${escapeHtml(lead.phone.replace(/\s/g, ""))}">Ara</a>
        &nbsp;·&nbsp;
        <a href="https://wa.me/${escapeHtml(lead.phone.replace(/\D/g, "").replace(/^0/, "90"))}">WhatsApp'tan yaz</a>
      </p>
    </div>`;

  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to,
      subject: `Yeni ${typeLabel} talebi — ${lead.name}`,
      replyTo: lead.email ?? undefined,
      text,
      html,
    });
    return { channel: "email", ok: true };
  } catch (error) {
    return {
      channel: "email",
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
