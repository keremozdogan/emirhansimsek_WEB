import type { Metadata } from "next";

import { Markdown } from "@/components/ui/markdown";
import { Container, Eyebrow, Section } from "@/components/ui/primitives";
import { getProfile } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Çerez Politikası",
  description: "Bu sitede kullanılan çerezler ve tarayıcı depolaması hakkında.",
  alternates: { canonical: "/cerez-politikasi" },
  robots: { index: false },
};

export const revalidate = 0;

export default async function CookiePolicyPage() {
  const profile = await getProfile();

  const content = `## Çerez nedir?

Çerezler, ziyaret ettiğiniz internet siteleri tarafından tarayıcınıza kaydedilen küçük metin dosyalarıdır. Sitenin düzgün çalışması ve tercihlerinizin hatırlanması için kullanılırlar.

## Bu sitede hangi veriler saklanıyor?

Bu site **reklam veya takip çerezi kullanmaz**. Kullanılan tek kalıcı depolama, tarayıcınızın kendi belleğinde tutulan aşağıdaki verilerdir:

| Ad | Tür | Amaç | Süre |
| --- | --- | --- | --- |
| \`es_favorites\` | localStorage | Favorilere eklediğiniz ilanların listesi | Siz silene kadar |
| \`es_compare\` | localStorage | Karşılaştırma listenizdeki ilanlar | Siz silene kadar |
| \`es_cookie_notice\` | localStorage | Çerez bildirimini kapattığınız bilgisi | Siz silene kadar |
| \`es_session\` | Çerez | Yalnızca yönetim paneline giriş yapıldığında oluşur | 7 gün |

Bu verilerin hiçbiri sunucuya gönderilmez ve kimliğinizi tanımlamak için kullanılmaz. Favori ve karşılaştırma listeleri yalnızca kullandığınız cihazda kalır.

## Harici içerikler

Sitedeki haritalar **OpenStreetMap / CARTO** altyapısı üzerinden yüklenir. Harita görüntülendiğinde tarayıcınız bu sağlayıcıya bir istek gönderir ve IP adresiniz teknik olarak sağlayıcı tarafından görülebilir. Harita yalnızca ilgili bölümü görüntülediğinizde yüklenir.

## Verileri nasıl silerim?

Tarayıcınızın ayarlarından site verilerini temizleyerek tüm kayıtları silebilirsiniz. Ayrıca favoriler ve karşılaştırma sayfalarındaki **"Listeyi temizle"** düğmeleriyle ilgili kayıtları tek tıkla kaldırabilirsiniz.

## İletişim

Çerezler ve kişisel verilerinizle ilgili sorularınız için **${profile.email}** adresine yazabilirsiniz.`;

  return (
    <Section className="pt-32 sm:pt-40 lg:pt-44">
      <Container>
        <div className="mx-auto max-w-3xl">
          <Eyebrow>Yasal</Eyebrow>
          <h1 className="mt-6 font-display text-4xl leading-tight sm:text-5xl">
            Çerez Politikası
          </h1>
          <Markdown content={content} className="mt-12" />
        </div>
      </Container>
    </Section>
  );
}
