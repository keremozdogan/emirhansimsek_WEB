import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { LeadForm } from "@/components/forms/lead-form";
import { MapPanel } from "@/components/property/map-panel";
import { buildSocials } from "@/components/site/footer";
import { ExternalButtonLink } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { getProfile } from "@/lib/queries";
import { formatPhone, whatsAppLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Emirhan Şimşek ile iletişime geçin: telefon, WhatsApp, e-posta ve ofis adresi. Aynı gün dönüş yapılır.",
  alternates: { canonical: "/iletisim" },
};

export const revalidate = 0;

export default async function ContactPage() {
  const profile = await getProfile();
  const socials = buildSocials(profile);

  return (
    <Section className="pt-32 sm:pt-40 lg:pt-44">
      <Container>
        <SectionHeading
          eyebrow="İletişim"
          title={
            <>
              Konuşalım.{" "}
              <span className="text-cream-500">İlk görüşme ücretsiz.</span>
            </>
          }
          description="Almayı, satmayı veya kiralamayı düşünüyorsanız; ne aşamada olursanız olun yazabilirsiniz. Hiçbir yükümlülük yok."
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* İletişim bilgileri */}
          <div className="flex flex-col gap-4">
            <ContactRow
              Icon={Phone}
              label="Telefon"
              value={formatPhone(profile.phone)}
              href={`tel:${profile.phone.replace(/\s/g, "")}`}
            />
            <ContactRow
              Icon={MessageCircle}
              label="WhatsApp"
              value="Hemen mesaj gönder"
              href={whatsAppLink(
                profile.whatsapp,
                "Merhaba, bilgi almak istiyorum.",
              )}
              external
            />
            <ContactRow
              Icon={Mail}
              label="E-posta"
              value={profile.email}
              href={`mailto:${profile.email}`}
            />
            <ContactRow Icon={MapPin} label="Ofis" value={profile.address} />
            <ContactRow
              Icon={Clock}
              label="Çalışma saatleri"
              value="Hafta içi 09:00 – 19:00 · Cumartesi 10:00 – 17:00 · Randevuyla her zaman"
            />

            {socials.length > 0 ? (
              <div className="mt-4 flex gap-3">
                {socials.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex size-11 items-center justify-center rounded-full border border-ink-600 text-cream-400 transition-colors hover:border-brand-500 hover:text-cream-50"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            ) : null}

            <ExternalButtonLink
              href={whatsAppLink(
                profile.whatsapp,
                "Merhaba, bilgi almak istiyorum.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              className="mt-4 self-start"
            >
              <MessageCircle className="size-4" />
              WhatsApp&apos;tan Yaz
            </ExternalButtonLink>
          </div>

          {/* Form */}
          <div className="rounded-card border border-ink-700 bg-ink-850 p-7 sm:p-9">
            <h2 className="text-2xl">Mesaj bırakın</h2>
            <p className="mt-2 text-sm text-cream-400">
              Genellikle aynı gün içinde dönüş yapıyorum.
            </p>
            <div className="mt-8">
              <LeadForm type="CONTACT" source="/iletisim" />
            </div>
          </div>
        </div>

        {/* Ofis konumu — profilde koordinat yoksa gizlenir */}
        <div className="mt-16">
          <MapPanel lat={40.9923} lng={29.1244} label={profile.address} />
        </div>
      </Container>
    </Section>
  );
}

function ContactRow({
  Icon,
  label,
  value,
  href,
  external,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const content = (
    <>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-ink-600 text-brand-500">
        <Icon className="size-4" />
      </span>
      <span>
        <span className="block text-[11px] uppercase tracking-[0.18em] text-cream-500">
          {label}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-cream-100">
          {value}
        </span>
      </span>
    </>
  );

  const className =
    "flex items-start gap-4 rounded-card border border-ink-700 bg-ink-850 p-5 transition-colors";

  if (!href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <a
      href={href}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className={`${className} hover:border-ink-500`}
    >
      {content}
    </a>
  );
}
