"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";

import { saveTestimonial } from "@/app/actions/admin";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { Button } from "@/components/ui/button";
import {
  Checkbox,
  Field,
  FormMessage,
  Input,
  Select,
  Textarea,
} from "@/components/ui/form-fields";

export type TestimonialFormValues = {
  id?: string;
  authorName: string;
  authorTitle: string | null;
  text: string;
  rating: number;
  propertyId: string | null;
  published: boolean;
  sortOrder: number;
};

export function TestimonialForm({
  values,
  properties,
}: {
  values: TestimonialFormValues;
  properties: Array<{ id: string; title: string }>;
}) {
  const [state, formAction] = useActionState(saveTestimonial, EMPTY_FORM_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <FormMessage ok={false} message={state.message} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Müşteri adı" required error={state.errors?.authorName}>
          <Input
            name="authorName"
            defaultValue={values.authorName}
            placeholder="Serkan A."
            required
          />
        </Field>
        <Field
          label="Alt başlık"
          error={state.errors?.authorTitle}
          hint="Örn. Ataşehir — Satış"
        >
          <Input name="authorTitle" defaultValue={values.authorTitle ?? ""} />
        </Field>
      </div>

      <Field label="Yorum" required error={state.errors?.text}>
        <Textarea name="text" rows={5} defaultValue={values.text} required />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Puan" error={state.errors?.rating}>
          <Select name="rating" defaultValue={String(values.rating)}>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {"★".repeat(rating)}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="İlgili ilan"
          error={state.errors?.propertyId}
          hint="Seçilirse ilan sayfasında da gösterilir."
        >
          <Select name="propertyId" defaultValue={values.propertyId ?? ""}>
            <option value="">Bağlı değil</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.title}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Sıra numarası" error={state.errors?.sortOrder}>
          <Input name="sortOrder" type="number" defaultValue={values.sortOrder} />
        </Field>
      </div>

      <Checkbox
        name="published"
        defaultChecked={values.published}
        label="Yayında"
      />

      <SaveButton />
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="self-start">
      {pending ? (
        "Kaydediliyor…"
      ) : (
        <>
          <Save className="size-4" />
          Kaydet
        </>
      )}
    </Button>
  );
}
