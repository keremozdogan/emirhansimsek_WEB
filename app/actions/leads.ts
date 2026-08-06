"use server";

import { after } from "next/server";

import {
  PROPERTY_CATEGORY_LABELS,
  VALUATION_PURPOSE_LABELS,
} from "@/lib/constants";
import { prisma } from "@/lib/db";
import {
  collectValues,
  invalid,
  type FormState,
} from "@/lib/form-state";
import { notifyNewLead } from "@/lib/notifications";
import { leadSchema, valuationSchema } from "@/lib/validators";

/** İletişim formu ve ilan sorusu — her ikisi de Lead kaydı oluşturur */
export async function submitLead(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = leadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error, formData);

  const data = parsed.data;

  try {
    const lead = await prisma.lead.create({
      data: {
        type: data.type,
        name: data.name,
        phone: data.phone,
        email: data.email,
        message: data.message,
        propertyId: data.propertyId || null,
        source: data.source,
        kvkkConsent: data.kvkkConsent,
      },
      // İlan sorusuysa bildirimde ilanın adı geçsin
      include: { property: { select: { title: true } } },
    });

    /**
     * Bildirimler `after` ile yanıttan SONRA gidiyor: ziyaretçi SMTP el
     * sıkışmasını ve Meta API çağrısını beklemiyor, formu gönderir göndermez
     * teşekkür mesajını görüyor.
     */
    after(() =>
      notifyNewLead({
        id: lead.id,
        type: data.type,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        message: lead.message,
        source: lead.source,
        propertyTitle: lead.property?.title,
      }),
    );
  } catch {
    return {
      ok: false,
      message:
        "Mesajınız gönderilemedi. Lütfen tekrar deneyin ya da doğrudan telefonla ulaşın.",
      values: collectValues(formData),
    };
  }

  return {
    ok: true,
    message:
      "Mesajınız ulaştı. En kısa sürede size dönüş yapacağım — genellikle aynı gün içinde.",
  };
}

/** "Evimin değerini öğren" formu */
export async function submitValuation(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = valuationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error, formData);

  const { name, phone, email, message, kvkkConsent, source, ...valuation } =
    parsed.data;

  try {
    const lead = await prisma.lead.create({
      data: {
        type: "VALUATION",
        name,
        phone,
        email,
        message,
        kvkkConsent,
        source: source ?? "/degerleme",
        valuationData: JSON.stringify(valuation),
      },
    });

    // Değerlemenin asıl değeri ek alanlarda; bildirimde de görünsünler
    const details = [
      {
        label: "Konum",
        value: [valuation.neighborhood, valuation.district, valuation.city]
          .filter(Boolean)
          .join(", "),
      },
      {
        label: "Tip",
        value: PROPERTY_CATEGORY_LABELS[valuation.category] ?? valuation.category,
      },
      { label: "Alan", value: `${valuation.grossArea} m²` },
      { label: "Oda", value: valuation.rooms },
      { label: "Bina yaşı", value: valuation.buildingAge },
      { label: "Kat", value: valuation.floor },
      { label: "Amaç", value: VALUATION_PURPOSE_LABELS[valuation.purpose] },
    ].filter((row): row is { label: string; value: string } => Boolean(row.value));

    after(() =>
      notifyNewLead({
        id: lead.id,
        type: "VALUATION",
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        message: lead.message,
        source: lead.source,
        details,
      }),
    );
  } catch {
    return {
      ok: false,
      message:
        "Talebiniz gönderilemedi. Lütfen tekrar deneyin ya da doğrudan telefonla ulaşın.",
      values: collectValues(formData),
    };
  }

  return {
    ok: true,
    message:
      "Değerleme talebiniz alındı. Bölgedeki güncel satışlarla karşılaştırıp en geç 1 iş günü içinde size dönüş yapacağım.",
  };
}
