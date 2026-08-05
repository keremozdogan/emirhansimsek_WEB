# Emirhan Şimşek — Gayrimenkul Danışmanı Web Sitesi

RE/MAX EKSEN gayrimenkul danışmanı Emirhan Şimşek için hazırlanmış, mobil uyumlu
ve animasyon ağırlıklı tanıtım + portföy sitesi. Yönetim paneli üzerinden ilan,
bölge, referans ve blog içerikleri kod yazmadan güncellenebilir.

## Hızlı başlangıç

Depoyu yeni klonladıysanız üç komut yeterli:

```bash
npm install
npm run setup        # .env oluşturur, veritabanını kurar, içeriği yükler
npm run dev          # http://localhost:3000
```

`npm run setup` bittiğinde panel giriş bilgilerini ekrana yazar.

| | |
| --- | --- |
| Site | http://localhost:3000 |
| Yönetim paneli | http://localhost:3000/admin |
| Giriş bilgileri | `.env` içindeki `ADMIN_EMAIL` ve `ADMIN_PASSWORD` |

**Gereksinimler:** Node.js 20+ (18.18+ çalışır). Başka bir şey kurmanıza gerek
yok — veritabanı SQLite, tek dosya olarak proje içinde oluşturuluyor.

### Neden `.env` depoda yok?

`.env` gizli oturum anahtarı ve panel şifresi içerdiği için depoya dahil
edilmez; `npm run setup` bu dosyayı `.env.example`'dan üretir ve `AUTH_SECRET`
değerini rastgele oluşturur. Veritabanı dosyası (`dev.db`) da depoda değildir,
`setup` sırasında içerikle birlikte sıfırdan oluşturulur.

Şifreyi değiştirdikten sonra `npm run db:seed -- --keep` çalıştırmanız yeterli
(içeriğe dokunmaz, yalnızca panel kullanıcısını günceller).

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm run start` | Derlenmiş sürümü çalıştırır |
| `npm run typecheck` | TypeScript kontrolü |
| `npm run db:seed` | Demo içeriği yükler (mevcut içeriği siler) |
| `npm run db:seed -- --keep` | Yalnızca admin kullanıcısını oluşturur/günceller |
| `npm run db:reset` | Veritabanını sıfırlar ve demo içeriği yükler |
| `npm run db:studio` | Veritabanını görsel arayüzde açar |

## Teknoloji

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — koyu sinematik tema, `app/globals.css` içinde tanımlı
- **Motion** (Framer Motion) + **GSAP ScrollTrigger** + **Lenis** — animasyonlar
- **Prisma 7 + SQLite** — `prisma/dev.db`
- **Leaflet + OpenStreetMap** — harita (API anahtarı gerekmez)
- **sharp** — yüklenen görselleri WebP'ye çevirir, boyutlandırır, bulanık
  önizleme üretir

## Klasör yapısı

```
app/
  (site)/            Genel site sayfaları
  admin/             Yönetim paneli (proxy.ts ile korunur)
  actions/           Server action'lar (form gönderimleri)
  api/               Görsel yükleme ve ilan verisi uç noktaları
components/
  animation/         Lenis, sayfa geçişi, reveal, sayaç, magnetic
  home/              Hero, bina animasyonu, bölge kartları, referans slider
  property/          İlan kartı, EV TURU, filtreler, harita, hesaplayıcı
  admin/             Panel formları ve fotoğraf yöneticisi
  site/, ui/, forms/ Ortak arayüz parçaları
lib/                 db, auth, storage, validators, queries, utils, constants
prisma/              schema.prisma, migrations, seed.ts, seed-data.ts
```

## Ev turu nasıl çalışır?

Sitenin en dikkat çeken bölümü, ilan detay sayfasındaki **sinematik ev turu**dur.
Ziyaretçi sayfayı kaydırdıkça fotoğraflar tam ekranda birbirine geçer, yavaşça
yakınlaşır (Ken Burns) ve her fotoğrafın yanında o odaya ait anlatım metni belirir.

Bu metinler `PropertyImage` tablosundaki iki alandan gelir:

- **`roomName`** — büyük başlık, örn. "Salon"
- **`caption`** — anlatım metni, örn. "42 m² çift cepheli salon. Sabah doğudan,
  akşamüstü batıdan ışık alıyor."

İkisi de yönetim panelindeki ilan formunda, her fotoğrafın yanında ayrı ayrı
girilir. **Fotoğrafların sırası turun akış sırasıdır**; ilk fotoğraf aynı zamanda
kapak görselidir.

İlana bir **video adresi** girilirse tur videoyla açılır; girilmezse fotoğraflardan
otomatik olarak sinematik bir sekans üretilir.

Masaüstünde sahne sabitlenir (pin) ve geçişler scroll'a bağlanır. Mobilde
sabitleme takılmaya yol açtığı için her fotoğraf kendi ekranında canlanır.
`prefers-reduced-motion` açıksa tüm animasyonlar devre dışı kalır.

## Görsel yükleme

Panelden yüklenen görseller `public/uploads/` altına kaydedilir ve otomatik olarak:

- en fazla 2400px genişliğe indirilir,
- WebP formatına çevrilir (%82 kalite),
- bulanık önizlemesi (blur placeholder) üretilir.

Depolama `lib/storage.ts` arkasında soyutlanmıştır; yayına çıkarken yalnızca bu
dosyadaki `saveImage`/`deleteImage` gövdeleri değiştirilir.

## Yayına alma (sonraki adım)

Site şu an lokal çalışacak şekilde kuruludur. Yayına almak için:

1. **Veritabanı** — `prisma/schema.prisma` içindeki `provider` değerini
   `postgresql` yapın, `lib/db.ts` içindeki adaptörü `@prisma/adapter-pg` ile
   değiştirin ve `DATABASE_URL` değerini güncelleyin.
2. **Görseller** — `lib/storage.ts` içine Vercel Blob / S3 / Cloudinary adaptörü
   ekleyin (çağıran kod değişmez).
3. **E-posta** — İletişim ve değerleme formlarından gelen talepler şu an yalnızca
   veritabanına kaydediliyor. Resend gibi bir servisle `app/actions/leads.ts`
   içine e-posta bildirimi eklenebilir.
4. **Ortam değişkenleri** — `AUTH_SECRET` değerini mutlaka güçlü ve rastgele bir
   değerle değiştirin, `NEXT_PUBLIC_SITE_URL` değerini gerçek alan adı yapın.

## Yayına almadan önce yapılması gerekenler

- [ ] `.env` içindeki `ADMIN_PASSWORD` ve `AUTH_SECRET` değiştirilsin
- [ ] Demo içerik silinip Emirhan'ın gerçek portföyü girilsin
- [ ] Profil sayfasından gerçek telefon, e-posta, adres ve sosyal medya bilgileri
      girilsin
- [ ] **Taşınmaz Ticareti Yetki Belgesi No** girilsin (mevzuat gereği zorunlu)
- [ ] KVKK aydınlatma metni bir hukuk danışmanına inceletilsin
- [ ] RE/MAX logosu ve kurumsal renk kullanımı için franchise ofisten onay alınsın

## İçeriğin kaynağı ve doğruluğu

Sitedeki ilanlar, fotoğraflar ve iletişim bilgileri Emirhan'ın
[RE/MAX profil sayfasından](https://remax.com.tr/tr/danisman/41906-11/emirhan-simsek)
alınmıştır: 5 aktif ilan, 138 fotoğraf, telefon, e-posta, ofis adresi ve
eğitim bilgileri gerçektir.

**Bilerek boş bırakılan alanlar** — uydurulmaması gerektiği için:

| Alan | Nerede doldurulur |
| --- | --- |
| Detaylı biyografi | Panel → Profil → "Detaylı biyografi" |
| Bölge uzman yorumları | Panel → Bölgeler → "Uzman yorumu" |
| Müşteri yorumları | Panel → Referanslar (RE/MAX'te 128 değerlendirme var, metinlerine erişilemedi) |
| Yıllık tecrübe / satış adedi | Panel → Profil → İstatistikler |
| Taşınmaz Ticareti Yetki Belgesi No | Panel → Profil (mevzuat gereği zorunlu) |

Sitede **0 olan istatistikler hiç gösterilmez**; böylece doğrulanmamış hiçbir
rakam yayınlanmaz. Blog yazıları genel geçer doğru bilgi içerir ancak Emirhan'ın
imzasıyla yayınlanacağı için yayına almadan önce okunup onaylanmalıdır.

## Notlar

- Fotoğraflar RE/MAX CDN'inden indirilmiştir ve en fazla **1024×768** çözünürlüktedir.
  Tam ekran ev turu için bu sınırda; Emirhan orijinal çekimleri panelden yüklerse
  görüntü kalitesi belirgin şekilde artar.
- Favoriler ve karşılaştırma listeleri kullanıcının tarayıcısında (localStorage)
  saklanır; sunucuya gönderilmez.
