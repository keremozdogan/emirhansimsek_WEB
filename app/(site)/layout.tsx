import { SmoothScrollProvider } from "@/components/animation/smooth-scroll-provider";
import { ChatWidget } from "@/components/site/chat-widget";
import { CookieNotice } from "@/components/site/cookie-notice";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileActionBar } from "@/components/site/mobile-action-bar";
import { getProfile } from "@/lib/queries";

export default async function SiteLayout({
  children,
}: LayoutProps<"/">) {
  const profile = await getProfile();

  // Google'ın "gayrimenkul danışmanı" olarak tanıması için yapılandırılmış veri
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: profile.fullName,
    jobTitle: profile.title,
    worksFor: { "@type": "Organization", name: profile.officeName },
    telephone: profile.phone,
    email: profile.email,
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    image: profile.portraitUrl ?? undefined,
    address: { "@type": "PostalAddress", streetAddress: profile.address, addressCountry: "TR" },
    sameAs: [
      profile.instagramUrl,
      profile.linkedinUrl,
      profile.youtubeUrl,
      profile.facebookUrl,
      profile.remaxUrl,
    ].filter(Boolean),
    areaServed: "İstanbul",
  };

  return (
    <SmoothScrollProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex min-h-screen flex-col">
        <Header
          fullName={profile.fullName}
          title={profile.title}
          phone={profile.phone}
          whatsapp={profile.whatsapp}
        />
        <main className="flex-1">{children}</main>
        <Footer profile={profile} />
        <MobileActionBar phone={profile.phone} whatsapp={profile.whatsapp} />
        <ChatWidget whatsapp={profile.whatsapp} />
        <CookieNotice />
      </div>
    </SmoothScrollProvider>
  );
}
