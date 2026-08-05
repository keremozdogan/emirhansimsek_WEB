"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ExternalLink,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  MessageSquareQuote,
  UserRound,
  X,
} from "lucide-react";

import { logoutAction } from "@/app/actions/admin";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Panel", Icon: LayoutDashboard, exact: true },
  { href: "/admin/ilanlar", label: "İlanlar", Icon: Building2 },
  { href: "/admin/talepler", label: "Talepler", Icon: Inbox },
  { href: "/admin/bolgeler", label: "Bölgeler", Icon: Map },
  { href: "/admin/referanslar", label: "Referanslar", Icon: MessageSquareQuote },
  { href: "/admin/blog", label: "Blog", Icon: FileText },
  { href: "/admin/profil", label: "Profil", Icon: UserRound },
];

export function AdminNav({
  name,
  newLeadCount,
}: {
  name: string;
  newLeadCount: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1">
      {LINKS.map(({ href, label, Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors",
              active
                ? "bg-brand-500/12 text-brand-400"
                : "text-cream-400 hover:bg-white/5 hover:text-cream-50",
            )}
          >
            <Icon className="size-4" />
            {label}
            {href === "/admin/talepler" && newLeadCount > 0 ? (
              <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-semibold text-white">
                {newLeadCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobil üst çubuk */}
      <div className="surface-glass sticky top-0 z-40 flex items-center justify-between border-b border-ink-700 px-5 py-3 lg:hidden">
        <span className="font-display text-lg">Yönetim</span>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          className="flex size-10 items-center justify-center rounded-full border border-ink-600"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-b border-ink-700 bg-ink-900 p-5 lg:hidden">
          {nav}
          <SidebarFooter name={name} />
        </div>
      ) : null}

      {/* Masaüstü kenar çubuğu */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-ink-700 bg-ink-950 p-6 lg:flex">
        <div>
          <Link href="/admin" className="block">
            <span className="font-display text-xl">Yönetim Paneli</span>
            <span className="mt-1 block text-[11px] uppercase tracking-[0.2em] text-cream-500">
              {name}
            </span>
          </Link>
          <div className="mt-10">{nav}</div>
        </div>

        <SidebarFooter name={name} />
      </aside>
    </>
  );
}

function SidebarFooter({ name }: { name: string }) {
  return (
    <div className="mt-8 flex flex-col gap-1 border-t border-ink-700 pt-5">
      <Link
        href="/"
        target="_blank"
        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-cream-400 transition-colors hover:bg-white/5 hover:text-cream-50"
      >
        <ExternalLink className="size-4" />
        Siteyi görüntüle
      </Link>

      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-cream-400 transition-colors hover:bg-white/5 hover:text-brand-400"
        >
          <LogOut className="size-4" />
          Çıkış yap
        </button>
      </form>

      <p className="px-4 pt-3 text-[11px] text-cream-500">{name}</p>
    </div>
  );
}
