/**
 * Form gönderimlerinin ortak durum tipi.
 *
 * Bu tanımlar bilerek server action dosyalarının DIŞINDA tutulur: `"use server"`
 * ile işaretlenmiş bir dosya yalnızca async fonksiyon export edebilir, sabit
 * veya nesne export ederse Next.js çalışma zamanında hata verir.
 */

export type FormState = {
  ok: boolean;
  message?: string;
  /** Alan adı → hata mesajı */
  errors?: Record<string, string>;
  /**
   * Gönderilen değerler. React 19, form action tamamlandığında kontrolsüz
   * alanları otomatik sıfırlar; doğrulama hatasında kullanıcının yazdıkları
   * kaybolmasın diye değerler geri döndürülüp forma yeniden yerleştirilir.
   */
  values?: Record<string, string>;
  /**
   * Gönderim başarılıysa açılacak `wa.me` bağlantısı — mesaj metni hazır
   * doldurulmuş hâlde gelir, ziyaretçinin yalnızca "Gönder"e basması kalır.
   *
   * Bu bir bildirim kanalı DEĞİL: mesajı ziyaretçi kendi WhatsApp hesabından
   * yolluyor, dolayısıyla hiçbir API anahtarı ya da kurulum gerektirmiyor.
   */
  whatsappUrl?: string;
};

export const EMPTY_FORM_STATE: FormState = { ok: false };

/** zod hatalarını alan adına göre tek mesaja indirger */
export function collectErrors(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/** Formdaki metin değerlerini state'e taşınabilir hâle getirir */
export function collectValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}

/** Doğrulama hatasında standart yanıt */
export function invalid(
  error: { issues: Array<{ path: PropertyKey[]; message: string }> },
  formData: FormData,
  message = "Lütfen işaretli alanları kontrol edin.",
): FormState {
  return {
    ok: false,
    message,
    errors: collectErrors(error),
    values: collectValues(formData),
  };
}
