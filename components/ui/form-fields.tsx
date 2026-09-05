"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-3 text-sm text-cream-50 placeholder:text-cream-500 transition-colors focus:border-brand-500 focus:outline-none disabled:opacity-50";

export function Field({
  label,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-cream-400">
        {label}
        {required ? <span className="ml-1 text-danger-400">*</span> : null}
      </span>
      {children}
      {hint && !error ? (
        <span className="text-xs text-cream-500">{hint}</span>
      ) : null}
      {error ? (
        <span className="flex items-center gap-1.5 text-xs text-danger-400">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlBase, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(controlBase, "resize-y", className)} {...props} />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlBase, "appearance-none", className)} {...props}>
      {children}
    </select>
  );
}

export function Checkbox({
  label,
  error,
  className,
  ...props
}: {
  label: React.ReactNode;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 accent-[var(--color-brand-500)]"
          {...props}
        />
        <span className="text-xs leading-relaxed text-cream-400">{label}</span>
      </label>
      {error ? (
        <span className="flex items-center gap-1.5 text-xs text-danger-400">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </span>
      ) : null}
    </div>
  );
}

/** KVKK onay kutusu — tüm genel formlarda zorunlu */
export function KvkkConsent({
  error,
  defaultChecked,
}: {
  error?: string;
  defaultChecked?: boolean;
}) {
  return (
    <Checkbox
      name="kvkkConsent"
      error={error}
      defaultChecked={defaultChecked}
      label={
        <>
          Kişisel verilerimin{" "}
          <Link
            href="/kvkk"
            target="_blank"
            className="text-cream-200 underline underline-offset-2 hover:text-brand-400"
          >
            KVKK Aydınlatma Metni
          </Link>{" "}
          kapsamında işlenmesini ve benimle iletişime geçilmesini onaylıyorum.
        </>
      }
    />
  );
}

export function FormMessage({
  ok,
  message,
}: {
  ok: boolean;
  message?: string;
}) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
        ok
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
          : "border-danger-500/40 bg-danger-500/10 text-danger-200",
      )}
    >
      {ok ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
      )}
      <p className="leading-relaxed">{message}</p>
    </div>
  );
}
