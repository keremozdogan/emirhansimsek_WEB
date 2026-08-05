import Link from "next/link";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-ink-700 pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl leading-tight sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cream-400">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <Link
          href={action.href}
          className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-full bg-brand-500 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-400 sm:self-auto"
        >
          <Plus className="size-4" />
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function AdminCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-ink-700 bg-ink-850 p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-ink-600 px-6 py-16 text-center">
      <h2 className="text-xl">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-cream-400">
        {description}
      </p>
      {action ? (
        <Link
          href={action.href}
          className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-brand-500 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-400"
        >
          <Plus className="size-4" />
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

/** Form bölümlerini gruplayan başlıklı kutu */
export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-card border border-ink-700 bg-ink-850 p-6 sm:p-7",
        className,
      )}
    >
      <h2 className="text-lg">{title}</h2>
      {description ? (
        <p className="mt-1.5 text-sm leading-relaxed text-cream-400">
          {description}
        </p>
      ) : null}
      <div className="mt-7">{children}</div>
    </section>
  );
}

export function StatusPill({
  tone,
  children,
}: {
  tone: "green" | "amber" | "red" | "gray" | "blue";
  children: React.ReactNode;
}) {
  const tones = {
    green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    amber: "bg-gold-400/15 text-gold-400 border-gold-400/30",
    red: "bg-brand-500/15 text-brand-400 border-brand-500/30",
    blue: "bg-navy-500/25 text-blue-300 border-navy-500/40",
    gray: "bg-white/5 text-cream-400 border-ink-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
