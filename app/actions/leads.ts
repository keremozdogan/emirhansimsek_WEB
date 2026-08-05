"use server";

import { prisma } from "@/lib/db";
import { leadSchema, valuationSchema } from "@/lib/validators";

export type FormState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export const EMPTY_FORM_STATE: FormState = { ok: false };

function collectErrors(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/** İletişim formu ve ilan sorusu — her ikisi de Lead kaydı oluşturur */
export async function submitLead(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = leadSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Lütfen işaretli alanları kontrol edin.",
      errors: collectErrors(parsed.error),
    };
  }

  const data = parsed.data;

  try {
    await prisma.lead.create({
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
    });
  } catch {
    return {
      ok: false,
      message:
        "Mesajınız gönderilemedi. Lütfen tekrar deneyin ya da doğrudan telefonla ulaşın.",
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

  if (!parsed.success) {
    return {
      ok: false,
      message: "Lütfen işaretli alanları kontrol edin.",
      errors: collectErrors(parsed.error),
    };
  }

  const { name, phone, email, message, kvkkConsent, source, ...valuation } =
    parsed.data;

  try {
    await prisma.lead.create({
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
  } catch {
    return {
      ok: false,
      message:
        "Talebiniz gönderilemedi. Lütfen tekrar deneyin ya da doğrudan telefonla ulaşın.",
    };
  }

  return {
    ok: true,
    message:
      "Değerleme talebiniz alındı. Bölgedeki güncel satışlarla karşılaştırıp en geç 1 iş günü içinde size dönüş yapacağım.",
  };
}
