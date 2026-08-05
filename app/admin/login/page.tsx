import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Yönetim Girişi",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const params = await searchParams;
  const next = Array.isArray(params.next) ? params.next[0] : params.next;

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <p className="eyebrow">Yönetim Paneli</p>
        <h1 className="mt-5 font-display text-4xl leading-tight">
          Hoş geldiniz
        </h1>
        <p className="mt-3 text-sm text-cream-400">
          Devam etmek için giriş yapın.
        </p>

        <div className="mt-10">
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
