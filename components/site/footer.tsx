import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { NAV_LINKS } from "@/components/site/nav-links";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/site/social-icons";
import { Container } from "@/components/ui/primitives";
import type { SiteProfile } from "@/lib/queries";
import { formatPhone } from "@/lib/utils";

const LEGAL_LINKS = [
  { href: "/kvkk", label: "KVKK Aydınlatma Metni" },
  { href: "/cerez-politikasi", label: "Çerez Politikası" },
  // Serbest lisanslı görsellerin bir kısmı atıf zorunlu (CC BY / CC BY-SA);
  // künye sayfasının siteden erişilebilir olması lisansın şartı.
  { href: "/telif", label: "Görsel Telifleri" },
];

type SocialLink = {
  href: string;
  label: string;
  Icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
};

/** Profilde dolu olan sosyal medya adreslerini listeye çevirir */
export function buildSocials(profile: SiteProfile): SocialLink[] {
  const entries: Array<[string | null, string, SocialLink["Icon"]]> = [
    [profile.instagramUrl, "Instagram", InstagramIcon],
    [profile.linkedinUrl, "LinkedIn", LinkedinIcon],
    [profile.youtubeUrl, "YouTube", YoutubeIcon],
    [profile.facebookUrl, "Facebook", FacebookIcon],
    [profile.tiktokUrl, "TikTok", TiktokIcon],
  ];

  return entries
    .filter(([href]) => Boolean(href))
    .map(([href, label, Icon]) => ({ href: href as string, label, Icon }));
}

export function Footer({ profile }: { profile: SiteProfile }) {
  const socials = buildSocials(profile);

  return (
    <footer className="relative border-t border-ink-700 bg-ink-950 pb-24 pt-20 lg:pb-16">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="flex flex-col gap-5">
            <p className="font-display text-3xl leading-tight">
              {profile.fullName.split(" ")[0]}{" "}
              <span className="text-brand-500">
                {profile.fullName.split(" ").slice(1).join(" ")}
              </span>
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-cream-400">
              {profile.shortBio}
            </p>

            {socials.length > 0 ? (
              <div className="flex gap-3 pt-2">
                {socials.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex size-10 items-center justify-center rounded-full border border-ink-600 text-cream-400 transition-colors hover:border-brand-500 hover:text-cream-50"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <nav className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cream-500">
              Site Haritası
            </p>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="w-fit text-sm text-cream-200 transition-colors hover:text-brand-500"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/degerleme"
              className="w-fit text-sm text-cream-200 transition-colors hover:text-brand-500"
            >
              Ücretsiz Değerleme
            </Link>
          </nav>

          <div className="flex flex-col gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cream-500">
              İletişim
            </p>
            <a
              href={`tel:${profile.phone.replace(/\s/g, "")}`}
              className="flex items-start gap-3 text-sm text-cream-200 transition-colors hover:text-brand-500"
            >
              <Phone className="mt-0.5 size-4 shrink-0 text-cream-500" />
              {formatPhone(profile.phone)}
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="flex items-start gap-3 break-all text-sm text-cream-200 transition-colors hover:text-brand-500"
            >
              <Mail className="mt-0.5 size-4 shrink-0 text-cream-500" />
              {profile.email}
            </a>
            <p className="flex items-start gap-3 text-sm leading-relaxed text-cream-400">
              <MapPin className="mt-0.5 size-4 shrink-0 text-cream-500" />
              {profile.address}
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-5 border-t border-ink-700 pt-8 text-xs text-cream-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <p>
              © {new Date().getFullYear()} {profile.fullName} · {profile.officeName}
            </p>
            {profile.licenseNo ? (
              <p>Taşınmaz Ticareti Yetki Belgesi No: {profile.licenseNo}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-cream-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-6 max-w-3xl text-[11px] leading-relaxed text-cream-500/70">
          Her ofis bağımsız olarak sahiplenilmekte ve işletilmektedir. Sitedeki
          ilan bilgileri bilgilendirme amaçlıdır, bağlayıcı teklif niteliği
          taşımaz.
        </p>
      </Container>
    </footer>
  );
}
