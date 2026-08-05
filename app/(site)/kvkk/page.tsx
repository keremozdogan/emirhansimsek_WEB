import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";

import { Markdown } from "@/components/ui/markdown";
import { Container, Eyebrow, Section } from "@/components/ui/primitives";
import { getProfile } from "@/lib/queries";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description:
    "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.",
  alternates: { canonical: "/kvkk" },
  robots: { index: false },
};

export const revalidate = 0;

export default async function KvkkPage() {
  const profile = await getProfile();

  const content = `## 1. Veri Sorumlusu

Bu internet sitesi üzerinden paylaştığınız kişisel veriler, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca veri sorumlusu sıfatıyla **${profile.fullName}** (${profile.officeName}) tarafından aşağıda açıklanan kapsamda işlenmektedir.

**İletişim:** ${profile.email} · ${profile.phone}
**Adres:** ${profile.address}

## 2. İşlenen Kişisel Veriler

Site üzerindeki formlar aracılığıyla aşağıdaki veriler işlenmektedir:

- **Kimlik bilgisi:** ad, soyad
- **İletişim bilgisi:** telefon numarası, e-posta adresi
- **Talep bilgisi:** mesaj içeriği, ilgilendiğiniz ilan, değerleme formunda paylaştığınız taşınmaz bilgileri (il, ilçe, mahalle, konut tipi, alan, bina yaşı, kat)
- **İşlem güvenliği bilgisi:** form gönderim tarihi ve talebin geldiği sayfa adresi

## 3. Kişisel Verilerin İşlenme Amaçları

Verileriniz aşağıdaki amaçlarla işlenir:

- Taleplerinizin karşılanması ve size geri dönüş yapılması
- Gayrimenkul alım, satım ve kiralama süreçlerinde danışmanlık hizmeti sunulması
- Talep ettiğiniz konut değerleme çalışmasının hazırlanması
- Hizmet kalitesinin ölçülmesi ve iyileştirilmesi
- İlgili mevzuattan doğan yükümlülüklerin yerine getirilmesi

## 4. Hukuki Sebep

Kişisel verileriniz KVKK'nın 5. maddesinde belirtilen **açık rızanız** ile ve sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması, veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması hukuki sebeplerine dayanarak işlenmektedir.

## 5. Verilerin Aktarılması

Kişisel verileriniz, yalnızca yukarıda belirtilen amaçların gerçekleştirilmesi için gerekli olduğu ölçüde; ilgili mevzuat gereği yetkili kamu kurum ve kuruluşlarına, hizmet aldığımız bilişim altyapısı sağlayıcılarına ve bağlı bulunulan ofise aktarılabilir. Verileriniz pazarlama amacıyla üçüncü kişilerle paylaşılmaz veya satılmaz.

## 6. Verilerin Saklanma Süresi

Verileriniz, işlenme amacının ortadan kalkmasını takiben ve ilgili mevzuatta öngörülen zamanaşımı süreleri sonuna kadar saklanır; bu sürelerin sonunda silinir, yok edilir veya anonim hâle getirilir.

## 7. İlgili Kişi Olarak Haklarınız

KVKK'nın 11. maddesi uyarınca:

- Kişisel verilerinizin işlenip işlenmediğini öğrenme
- İşlenmişse buna ilişkin bilgi talep etme
- İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme
- Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme
- Eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme
- Silinmesini veya yok edilmesini isteme
- Düzeltme, silme ve yok edilme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme
- Münhasıran otomatik sistemler ile analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme
- Kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme

haklarına sahipsiniz.

## 8. Başvuru Yöntemi

Yukarıdaki haklarınıza ilişkin taleplerinizi **${profile.email}** adresine e-posta göndererek veya yazılı olarak ofis adresimize ileterek iletebilirsiniz. Başvurunuz en geç **30 gün** içinde sonuçlandırılır.`;

  return (
    <Section className="pt-32 sm:pt-40 lg:pt-44">
      <Container>
        <div className="mx-auto max-w-3xl">
          <Eyebrow>Yasal</Eyebrow>
          <h1 className="mt-6 font-display text-4xl leading-tight sm:text-5xl">
            KVKK Aydınlatma Metni
          </h1>

          <div className="mt-10 flex gap-4 rounded-card border border-gold-400/30 bg-gold-400/5 p-5">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-gold-400" />
            <p className="text-sm leading-relaxed text-cream-300">
              Bu metin genel bir şablondur ve hukuki danışmanlık niteliği
              taşımaz. Yayına almadan önce mutlaka bir hukuk danışmanına
              inceletin; ofisinizin ticaret unvanı, VERBİS kaydı ve yetki belgesi
              bilgileri eklenmelidir.
            </p>
          </div>

          <Markdown content={content} className="mt-12" />
        </div>
      </Container>
    </Section>
  );
}
