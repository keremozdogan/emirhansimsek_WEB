"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Phone, X } from "lucide-react";

import { NAV_LINKS } from "@/components/site/nav-links";
import { ExternalButtonLink } from "@/components/ui/button";
import { cn, formatPhone, whatsAppLink } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Header({
  fullName,
  title,
  phone,
  whatsapp,
}: {
  fullName: string;
  title: string;
  phone: string;
  whatsapp: string;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    /*
      rAF ile kısıtlanıyor: kaydırma olayı saniyede onlarca kez tetikleniyor ve
      her birinde setState çağırmak gereksiz render demek. Bir sonraki boyama
      karesine kadar tek okuma yapılıyor.

      Eşik 24 → 40 piksele çekildi; 24'te başlık daha ilk minik kaydırmada
      yerinden oynuyordu.
    */
    let ticking = false;
    const oku = () => {
      ticking = false;
      setScrolled(window.scrollY > 40);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(oku);
    };
    oku();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menü açıkken arka planın kaymasını engelle
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const [first, ...rest] = fullName.split(" ");

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "kaydirildi surface-glass border-b border-ink-700/80 py-3"
            : "border-b border-transparent py-5",
        )}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/" className="group flex items-baseline gap-2">
            {/*
              `whitespace-nowrap` + `shrink-0`: yan taraftaki ünvan etiketi
              geniş harf aralığı yüzünden yer kaplayıp ismi sıkıştırıyor ve
              "Emirhan / Şimşek" iki satıra bölünüyordu. İsim asla bölünmemeli;
              daralan alanda kısalması gereken ünvandır.
            */}
            <span className="baslik-marka shrink-0 whitespace-nowrap font-display text-lg tracking-tight sm:text-xl">
              {first}{" "}
              <span className="text-brand-500">{rest.join(" ")}</span>
            </span>
            <span className="hidden truncate text-[10px] uppercase tracking-[0.24em] text-cream-500 lg:inline">
              {title}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    // Menü 8 bağlantıya çıktığı için yatay boşluk daraltıldı;
                    // px-4 ile satır xl altında taşıyordu.
                    "relative whitespace-nowrap rounded-full px-3 py-2 text-sm transition-colors",
                    active
                      ? "text-cream-50"
                      : "text-cream-400 hover:text-cream-50",
                  )}
                >
                  {link.href === pathname || active ? (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-white/8"
                      transition={{ duration: 0.4, ease: EASE }}
                    />
                  ) : null}
                  <span className="relative">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ExternalButtonLink
              href={`tel:${phone.replace(/\s/g, "")}`}
              variant="ghost"
              size="sm"
              className="hidden xl:inline-flex"
            >
              <Phone className="size-4" />
              {formatPhone(phone)}
            </ExternalButtonLink>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={open}
              className="flex size-10 items-center justify-center rounded-full border border-ink-600 text-cream-100 transition-colors hover:border-cream-400 lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-ink-950/95 backdrop-blur-xl lg:hidden"
          >
            <motion.nav
              className="flex h-full flex-col justify-center gap-1 px-8 pb-24"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
              }}
            >
              {NAV_LINKS.map((link) => (
                <motion.div
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6, ease: EASE },
                    },
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-ink-700 py-4 font-display text-3xl text-cream-50"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                className="mt-8 flex flex-col gap-3"
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: EASE },
                  },
                }}
              >
                {/*
                  Değerleme düğmesi kaldırıldı: artık menü listesinde kendi
                  bağlantısı var, aynı sayfayı iki kez göstermek gereksiz.
                  Burada kalan tek eylem WhatsApp — mobilde dönüşümü getiren
                  kanal o.
                */}
                <ExternalButtonLink
                  href={whatsAppLink(whatsapp, "Merhaba, bilgi almak istiyorum.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  size="lg"
                >
                  WhatsApp&apos;tan Yaz
                </ExternalButtonLink>
              </motion.div>
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
