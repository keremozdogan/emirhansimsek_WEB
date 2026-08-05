"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { LogIn } from "lucide-react";

import { loginAction } from "@/app/actions/admin";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input } from "@/components/ui/form-fields";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, EMPTY_FORM_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <FormMessage ok={false} message={state.message} />

      <Field label="E-posta" required error={state.errors?.email}>
        <Input
          name="email"
          type="email"
          autoComplete="username"
          autoFocus
          required
        />
      </Field>

      <Field label="Şifre" required error={state.errors?.password}>
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="mt-2">
      {pending ? (
        "Giriş yapılıyor…"
      ) : (
        <>
          <LogIn className="size-4" />
          Giriş Yap
        </>
      )}
    </Button>
  );
}
