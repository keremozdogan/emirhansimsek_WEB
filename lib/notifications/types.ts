import type { LeadType } from "@/lib/constants";

/** Bildirim kanallarına gönderilen normalize edilmiş talep özeti */
export type LeadNotification = {
  id: string;
  type: LeadType;
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  /** Formun gönderildiği sayfa (ör. "/portfoy/sancaktepe-sifir-3-1") */
  source?: string | null;
  /** İlan sorusuysa ilanın başlığı */
  propertyTitle?: string | null;
  /** Değerleme formunun ek alanları — anahtar/etiket çiftleri */
  details?: { label: string; value: string }[];
};

/** Tek bir kanalın sonucu; hiçbir zaman throw etmez, her zaman raporlanır */
export type ChannelResult = {
  channel: "email" | "whatsapp";
  /** Kanal .env'de yapılandırılmamışsa gönderim denenmez */
  skipped?: string;
  ok?: boolean;
  error?: string;
};
