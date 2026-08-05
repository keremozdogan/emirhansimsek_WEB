import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="max-w-lg text-center">
        <p className="font-display text-[7rem] leading-none text-brand-500">
          404
        </p>
        <h1 className="mt-4 font-display text-3xl sm:text-4xl">
          Aradığınız sayfa bulunamadı
        </h1>
        <p className="mt-4 text-base leading-relaxed text-cream-400">
          Bağlantı değişmiş ya da ilan yayından kaldırılmış olabilir.
          Portföyden devam edebilir veya doğrudan bana yazabilirsiniz.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/portfoy"
            className="inline-flex h-12 items-center rounded-full bg-brand-500 px-7 text-sm font-medium text-white transition-colors hover:bg-brand-400"
          >
            Portföye Git
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-full border border-ink-500 px-7 text-sm text-cream-50 transition-colors hover:border-cream-400"
          >
            Ana Sayfa
          </Link>
        </div>
      </div>
    </main>
  );
}
