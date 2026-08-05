"use client";

import Link from "next/link";
import { Building2, MessageCircle, Phone } from "lucide-react";

import { whatsAppLink } from "@/lib/utils";

/**
 * Mobilde ekranın altında sabit duran hızlı aksiyon çubuğu.
 * Emlak sitelerinde dönüşümü en çok artıran tek bileşen budur.
 */
export function MobileActionBar({
  phone,
  whatsapp,
}: {
  phone: string;
  whatsapp: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div className="surface-glass grid grid-cols-3 border-t border-ink-700 pb-[env(safe-area-inset-bottom)]">
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="flex flex-col items-center gap-1 py-3 text-[11px] font-medium text-cream-200 active:bg-white/5"
        >
          <Phone className="size-5" />
          Ara
        </a>
        <a
          href={whatsAppLink(whatsapp, "Merhaba, bilgi almak istiyorum.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 border-x border-ink-700 py-3 text-[11px] font-medium text-cream-200 active:bg-white/5"
        >
          <MessageCircle className="size-5 text-emerald-400" />
          WhatsApp
        </a>
        <Link
          href="/portfoy"
          className="flex flex-col items-center gap-1 py-3 text-[11px] font-medium text-cream-200 active:bg-white/5"
        >
          <Building2 className="size-5" />
          İlanlar
        </Link>
      </div>
    </div>
  );
}
