"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, MessageSquare, Send, Sparkles, X } from "lucide-react";

import { Markdown } from "@/components/ui/markdown";
import { cn, whatsAppLink } from "@/lib/utils";

/**
 * Site genelinde sağ altta duran sohbet asistanı.
 *
 * Yanıt akış hâlinde geliyor; ilk kelime ~1 saniyede ekranda oluyor. Panelin
 * kendisi `fixed` ve mobilde tam ekrana yakın açılıyor — küçük ekranda köşeye
 * sıkışmış bir kutuda yazışmak kullanılabilir değil.
 */

const GREETING =
  "Merhaba! Emirhan'ın portföyü, bölgeler ve süreçler hakkında sorularınızı yanıtlayabilirim. Ne aramıştınız?";

const SUGGESTIONS = [
  "Çekmeköy'de satılık 3+1 var mı?",
  "Kiralık dükkan arıyorum",
  "Ev satış süreci nasıl işliyor?",
];

type Message = { role: "user" | "assistant"; content: string };

export function ChatWidget({ whatsapp }: { whatsapp: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Yeni içerik geldikçe en alta kaydır
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, pending]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Esc ile kapat
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /**
   * Sohbetteki bir site içi bağlantıya tıklanınca paneli YALNIZCA dar ekranda
   * kapatır.
   *
   * Mobilde panel neredeyse tam ekran: botun verdiği ilan bağlantısına
   * tıklayan ziyaretçi, açılan sayfayı panelin arkasında bırakır ve nereye
   * gittiğini göremez. Masaüstünde panel köşede küçük bir kutu; orada
   * kapatmak kullanıcının istemediği bir şeyi yapmak olur — sohbet
   * arayüzlerinin yerleşik davranışı gezinme boyunca açık kalmaktır.
   *
   * Dış bağlantılar (WhatsApp) yeni sekmede açıldığı için paneli kapatmıyor;
   * kullanıcı siteye döndüğünde sohbeti bıraktığı yerde buluyor.
   *
   * Konuşma geçmişi her hâlükârda korunuyor; kapanan yalnızca panel.
   */
  function handleContentClick(event: React.MouseEvent<HTMLDivElement>) {
    const link = (event.target as HTMLElement).closest("a");
    const href = link?.getAttribute("href") ?? "";
    if (!href.startsWith("/")) return;
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    setOpen(false);
  }

  async function send(text: string) {
    const question = text.trim();
    if (!question || pending) return;

    const next: Message[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setPending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setMessages([
          ...next,
          {
            role: "assistant",
            content:
              data?.error ??
              "Şu an yanıt veremiyorum. Doğrudan iletişim için [iletişim sayfası](/iletisim).",
          },
        ]);
        return;
      }

      if (!response.body) return;

      // Akış geldikçe son mesajı yerinde büyüt
      setMessages([...next, { role: "assistant", content: "" }]);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: buffer }]);
      }
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {/*
        Masaüstünde WhatsApp yüzen düğmesi, sohbet düğmesinin hemen üstünde.
        Mobilde gizli çünkü alt aksiyon çubuğunda zaten baskın hâlde duruyor —
        iki yerde birden göstermek ekranı boğardı. Panel açıkken de gizleniyor,
        panelin kendi WhatsApp şeridi devreye giriyor.
      */}
      <AnimatePresence>
        {open ? null : (
          <motion.a
            href={whatsAppLink(
              whatsapp,
              "Merhaba, siteden yazıyorum. Bilgi almak istiyorum.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp'tan yazın"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 1.35, duration: 0.4 }}
            className="fixed bottom-24 right-6 z-50 hidden size-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-black/40 transition-colors hover:bg-emerald-600 lg:flex"
          >
            <MessageCircle className="size-6" />
          </motion.a>
        )}
      </AnimatePresence>

      {/*
        Sohbet açma düğmesi. Mobilde alt aksiyon çubuğunun üstünde duruyor,
        masaüstünde köşede.

        Panel açıkken tamamen gizleniyor: daha önce çarpıya dönüşüyordu ve
        panelin kendi kapatma düğmesiyle birlikte ekranda iki kapatma birden
        oluyordu. Büyük kırmızı çarpı hem gereksiz hem de dikkat çekiciliğiyle
        panelin içeriğinin önüne geçiyordu.
      */}
      <AnimatePresence>
        {open ? null : (
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Asistana sor"
            aria-expanded={false}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-50 flex size-14 items-center justify-center rounded-full border border-ink-600 bg-brand-500 text-white shadow-lg shadow-black/40 transition-colors hover:bg-brand-600 lg:bottom-6 lg:right-6"
          >
            <MessageSquare className="size-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Gayrimenkul asistanı"
            className="fixed inset-x-3 bottom-[calc(9.5rem+env(safe-area-inset-bottom))] top-20 z-50 flex flex-col overflow-hidden rounded-card border border-ink-600 bg-ink-900 shadow-2xl shadow-black/50 sm:inset-x-auto sm:right-4 sm:top-auto sm:h-[min(34rem,calc(100vh-12rem))] sm:w-[24rem] lg:bottom-24 lg:right-6"
          >
            <header className="flex items-center gap-3 border-b border-ink-700 px-5 py-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-500/12 text-brand-400">
                <Sparkles className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-lg text-cream-100">
                  Gayrimenkul Asistanı
                </p>
                <p className="truncate text-xs text-cream-500">
                  Portföy ve bölgeler hakkında sorun
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Kapat"
                className="ml-auto -mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-full text-cream-400 transition-colors hover:text-cream-50"
              >
                <X className="size-4" />
              </button>
            </header>

            {/*
              Kalıcı WhatsApp şeridi. Asistan yanıtlarının içinde de bağlantı
              çıkıyor ama ziyaretçi bota takılıp kaldığında aramak zorunda
              kalmasın diye her an görünür bir çıkış duruyor: gerçek amaç
              Emirhan'la konuşturmak, sohbeti uzatmak değil.
            */}
            <a
              href={whatsAppLink(
                whatsapp,
                "Merhaba, siteden yazıyorum. Bilgi almak istiyorum.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border-b border-ink-700 bg-emerald-500/10 py-2.5 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20"
            >
              <MessageCircle className="size-4" />
              Doğrudan Emirhan&apos;a WhatsApp&apos;tan yazın
            </a>

            <div
              ref={scrollRef}
              onClick={handleContentClick}
              className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
              /* Lenis bu kutuyu yutmasın; iç kaydırma kendi başına çalışsın */
              data-lenis-prevent
            >
              <Bubble role="assistant">{GREETING}</Bubble>

              {messages.map((message, index) => (
                <Bubble key={index} role={message.role}>
                  {message.content}
                </Bubble>
              ))}

              {pending &&
              messages[messages.length - 1]?.role !== "assistant" ? (
                <Bubble role="assistant">
                  <span className="inline-flex gap-1" aria-label="Yazıyor">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="size-1.5 animate-[shimmer_1.4s_ease-in-out_infinite] rounded-full bg-cream-500"
                        style={{ animationDelay: `${dot * 0.18}s` }}
                      />
                    ))}
                  </span>
                </Bubble>
              ) : null}

              {messages.length === 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => send(suggestion)}
                      className="rounded-full border border-ink-600 px-3 py-1.5 text-xs text-cream-300 transition-colors hover:border-brand-500 hover:text-cream-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-ink-700 px-4 py-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Sorunuzu yazın…"
                maxLength={1000}
                aria-label="Mesajınız"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-cream-100 outline-none placeholder:text-cream-500"
              />
              <button
                type="submit"
                disabled={pending || input.trim().length === 0}
                aria-label="Gönder"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-ink-600 disabled:text-cream-500"
              >
                <Send className="size-4" />
              </button>
            </form>

            <p className="px-5 pb-3 text-[10px] leading-relaxed text-cream-500/70">
              Yapay zekâ destekli asistan. Verdiği bilgiler bağlayıcı teklif
              niteliği taşımaz. Mesajlarınız yanıt üretilmesi için yurt dışındaki
              bir yapay zekâ servisine iletilir; kimlik numarası, adres gibi
              hassas bilgileri buraya yazmayın —{" "}
              <a href="/kvkk" className="underline hover:text-cream-300">
                ayrıntılar
              </a>
              .
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function Bubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
}) {
  const isUser = role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-brand-500 text-white"
            : "border border-ink-700 bg-ink-850 text-cream-200",
        )}
      >
        {typeof children === "string" && !isUser ? (
          <Markdown content={children} className="chat-markdown" />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
