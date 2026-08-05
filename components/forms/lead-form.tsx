"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Send } from "lucide-react";

import { submitLead } from "@/app/actions/leads";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import {
  Field,
  FormMessage,
  Input,
  KvkkConsent,
  Textarea,
} from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import type { LeadType } from "@/lib/constants";

/**
 * İletişim ve ilan sorusu formu.
 *
 * `useActionState` ile server action'a bağlanır; JavaScript kapalıyken de
 * çalışır (progressive enhancement).
 */
export function LeadForm({
  type = "CONTACT",
  propertyId,
  source,
  defaultMessage,
  compact = false,
  submitLabel = "Mesajı Gönder",
}: {
  type?: LeadType;
  propertyId?: string;
  source?: string;
  defaultMessage?: string;
  compact?: boolean;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(submitLead, EMPTY_FORM_STATE);

  if (state.ok) {
    return <FormMessage ok message={state.message} />;
  }

  // Doğrulama hatasında React alanları sıfırladığı için önceki değerler geri konur
  const previous = state.values ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="type" value={type} />
      {propertyId ? (
        <input type="hidden" name="propertyId" value={propertyId} />
      ) : null}
      {source ? <input type="hidden" name="source" value={source} /> : null}

      <FormMessage ok={false} message={state.message} />

      <div className={compact ? "flex flex-col gap-5" : "grid gap-5 sm:grid-cols-2"}>
        <Field label="Adınız Soyadınız" required error={state.errors?.name}>
          <Input
            name="name"
            autoComplete="name"
            placeholder="Adınız"
            defaultValue={previous.name}
            required
          />
        </Field>

        <Field label="Telefon" required error={state.errors?.phone}>
          <Input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0532 123 45 67"
            defaultValue={previous.phone}
            required
          />
        </Field>
      </div>

      <Field label="E-posta" error={state.errors?.email} hint="İsteğe bağlı">
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="ornek@eposta.com"
          defaultValue={previous.email}
        />
      </Field>

      <Field label="Mesajınız" error={state.errors?.message}>
        <Textarea
          name="message"
          rows={compact ? 3 : 5}
          defaultValue={previous.message ?? defaultMessage}
          placeholder="Nasıl yardımcı olabilirim?"
        />
      </Field>

      <KvkkConsent
        error={state.errors?.kvkkConsent}
        defaultChecked={Boolean(previous.kvkkConsent)}
      />

      <SubmitButton label={submitLabel} />
    </form>
  );
}

export function SubmitButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending} className={className}>
      {pending ? (
        "Gönderiliyor…"
      ) : (
        <>
          <Send className="size-4" />
          {label}
        </>
      )}
    </Button>
  );
}
