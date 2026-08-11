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
      {/*
        WhatsApp artık eşit üçte bir değil, çubuğun baskın öğesi: dolu yeşil
        zemin ve iki kat genişlik. Emlakta dönüşümü en çok getiren kanal bu —
        ziyaretçi formu doldurmak yerine yazışmak istiyor. Ara ve İlanlar
        ikincil hâle geldi ama erişilebilir kaldı.
      */}
      <div className="surface-glass grid grid-cols-4 items-stretch border-t border-ink-700 pb-[env(safe-area-inset-bottom)]">
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium text-cream-200 active:bg-white/5"
        >
          <Phone className="size-5" />
          Ara
        </a>
        <a
          href={whatsAppLink(
            whatsapp,
            "Merhaba, siteden yazıyorum. Bilgi almak istiyorum.",
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="col-span-2 my-2 flex items-center justify-center gap-2 rounded-full bg-emerald-500 py-2.5 text-sm font-semibold text-white active:bg-emerald-600"
        >
          <MessageCircle className="size-5" />
          WhatsApp&apos;tan Yaz
        </a>
        <Link
          href="/portfoy"
          className="flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium text-cream-200 active:bg-white/5"
        >
          <Building2 className="size-5" />
          İlanlar
        </Link>
      </div>
    </div>
  );
}
