"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";

import { saveRegion } from "@/app/actions/admin";
import { EMPTY_FORM_STATE } from "@/app/actions/leads";
import { SingleImagePicker } from "@/components/admin/single-image-picker";
import { Button } from "@/components/ui/button";
import {
  Checkbox,
  Field,
  FormMessage,
  Input,
  Textarea,
} from "@/components/ui/form-fields";

export type RegionFormValues = {
  id?: string;
  name: string;
  slug: string;
  city: string;
  district: string;
  description: string;
  expertNote: string;
  coverUrl: string | null;
  avgPricePerSqm: number | null;
  avgRent: number | null;
  highlights: string;
  lat: number | null;
  lng: number | null;
  sortOrder: number;
  published: boolean;
};

export function RegionForm({ values }: { values: RegionFormValues }) {
  const [state, formAction] = useActionState(saveRegion, EMPTY_FORM_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <FormMessage ok={false} message={state.message} />

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Bölge adı" required error={state.errors?.name}>
          <Input name="name" defaultValue={values.name} required />
        </Field>
        <Field label="İl" required error={state.errors?.city}>
          <Input name="city" defaultValue={values.city} required />
        </Field>
        <Field label="İlçe" required error={state.errors?.district}>
          <Input name="district" defaultValue={values.district} required />
        </Field>
      </div>

      <Field
        label="Kısa tanıtım"
        required
        error={state.errors?.description}
        hint="Bölge kartlarında görünür, 1-2 cümle."
      >
        <Textarea name="description" rows={2} defaultValue={values.description} required />
      </Field>

      <Field
        label="Uzman yorumu"
        error={state.errors?.expertNote}
        hint="Markdown desteklenir. ## ile başlık, **çift yıldız** ile kalın yazı."
      >
        <Textarea
          name="expertNote"
          rows={10}
          defaultValue={values.expertNote}
          placeholder={"Bu bölgeyi üç ayrı pazar olarak okumak gerekir…\n\n**Dikkat edilmesi gereken:** …"}
        />
      </Field>

      <SingleImagePicker
        name="coverUrl"
        label="Kapak görseli"
        value={values.coverUrl}
        folder="bolge"
        hint="Yatay çekim tercih edin; bölge sayfasının üst görseli olarak kullanılır."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Ort. m² fiyatı (₺)" error={state.errors?.avgPricePerSqm}>
          <Input
            name="avgPricePerSqm"
            type="number"
            defaultValue={values.avgPricePerSqm ?? ""}
          />
        </Field>
        <Field label="Ort. kira (₺)" error={state.errors?.avgRent}>
          <Input name="avgRent" type="number" defaultValue={values.avgRent ?? ""} />
        </Field>
        <Field label="Enlem (lat)" error={state.errors?.lat}>
          <Input name="lat" type="number" step="any" defaultValue={values.lat ?? ""} />
        </Field>
        <Field label="Boylam (lng)" error={state.errors?.lng}>
          <Input name="lng" type="number" step="any" defaultValue={values.lng ?? ""} />
        </Field>
      </div>

      <Field
        label="Öne çıkanlar"
        error={state.errors?.highlights}
        hint="Her satıra bir madde yazın."
      >
        <Textarea
          name="highlights"
          rows={4}
          defaultValue={values.highlights}
          placeholder={"Metroya 5 dakika\nAile profili yoğun\nGüçlü kiralık talebi"}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Özel adres (slug)" error={state.errors?.slug}>
          <Input name="slug" defaultValue={values.slug} />
        </Field>
        <Field label="Sıra numarası" error={state.errors?.sortOrder}>
          <Input name="sortOrder" type="number" defaultValue={values.sortOrder} />
        </Field>
      </div>

      <Checkbox name="published" defaultChecked={values.published} label="Yayında" />

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
