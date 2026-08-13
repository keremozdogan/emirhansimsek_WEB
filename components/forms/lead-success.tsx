"use client";

import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";

import { FormMessage } from "@/components/ui/form-fields";
import { ExternalButtonLink } from "@/components/ui/button";

/**
 * Form gönderildikten sonraki ekran: teşekkür mesajı + hazır WhatsApp metni.
 *
 * WhatsApp burada bir bildirim kanalı DEĞİL — mesajı ziyaretçi kendi
 * hesabından yolluyor, bu yüzden hiçbir API kurulumu gerekmiyor. Karşılığında
 * gönderme eylemi ziyaretçide kalıyor: "Gönder"e basmazsa mesaj ulaşmaz. Talep
 * zaten veritabanına yazıldığı için bu bir kayıp değil, yalnızca hızlandırıcı.
 *
 * Sekme kendiliğinden açılmaya çalışılıyor, ama düğme her hâlükârda duruyor.
 * Tarayıcılar kullanıcı hareketiyle doğrudan bağlantısı olmayan `window.open`
 * çağrılarını engelleyebiliyor; sunucu yanıtı beklendiği için burada tam olarak
 * o durumdayız. Engellenirse tek sonuç düğmeye basılması olur — sessizce hiçbir
 * şey olmaması ise ziyaretçiyi boşuna bekletirdi.
 */
export function LeadSuccess({
  message,
  whatsappUrl,
}: {
  message?: string;
  whatsappUrl?: string;
}) {
  // Geliştirmede efektler iki kez çalışıyor; bayrak olmadan iki sekme açılıyor
  const opened = useRef(false);

  useEffect(() => {
    if (!whatsappUrl || opened.current) return;
    opened.current = true;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }, [whatsappUrl]);

  return (
    <div className="flex flex-col gap-5">
      <FormMessage ok message={message} />

      {whatsappUrl && (
        <div className="flex flex-col gap-3">
          <p className="text-sm leading-relaxed text-cream-400">
            Mesajınız WhatsApp&apos;ta hazır olarak açıldı. Açılmadıysa aşağıdaki
            düğmeyi kullanın — metin hazır, yalnızca göndermeniz yeterli.
          </p>
          <ExternalButtonLink
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start"
          >
            <MessageCircle className="size-4" />
            WhatsApp&apos;tan Gönder
          </ExternalButtonLink>
        </div>
      )}
    </div>
  );
}
