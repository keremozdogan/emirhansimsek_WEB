import type { Metadata } from "next";

import { AdminNav } from "@/components/admin/admin-nav";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: { default: "Yönetim Paneli", template: "%s | Yönetim" },
  robots: { index: false, follow: false },
};

export const revalidate = 0;

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getSession();

  // Giriş sayfası da bu düzeni kullanır; oturum yoksa çerçeveyi gösterme.
  if (!session) {
    return <div className="min-h-screen bg-ink-900">{children}</div>;
  }

  const newLeadCount = await prisma.lead.count({ where: { status: "NEW" } });

  return (
    <div className="flex min-h-screen bg-ink-900 lg:flex-row">
      <AdminNav name={session.name} newLeadCount={newLeadCount} />
      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        {children}
      </main>
    </div>
  );
}
