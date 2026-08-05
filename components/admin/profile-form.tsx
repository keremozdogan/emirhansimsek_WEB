"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";

import { saveProfile } from "@/app/actions/admin";
import { EMPTY_FORM_STATE } from "@/app/actions/leads";
import { SingleImagePicker } from "@/components/admin/single-image-picker";
import { FormSection } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import {
  Field,
  FormMessage,
  Input,
  Textarea,
} from "@/components/ui/form-fields";
import type { SiteProfile } from "@/lib/queries";

export function ProfileForm({ profile }: { profile: SiteProfile }) {
  const [state, formAction] = useActionState(saveProfile, EMPTY_FORM_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-6 pb-28">
      <FormMessage ok={state.ok} message={state.message} />

      <FormSection title="Kimlik">
        <div className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Ad Soyad" required error={state.errors?.fullName}>
              <Input name="fullName" defaultValue={profile.fullName} required />
            </Field>
            <Field label="Ünvan" required error={state.errors?.title}>
              <Input name="title" defaultValue={profile.title} required />
            </Field>
            <Field label="Ofis adı" required error={state.errors?.officeName}>
              <Input
                name="officeName"
                defaultValue={profile.officeName}
                required
              />
            </Field>
          </div>

          <Field
            label="Slogan"
            required
            error={state.errors?.tagline}
            hint="Ana sayfada büyük puntoyla görünür."
          >
            <Input name="tagline" defaultValue={profile.tagline} required />
          </Field>

          <Field
            label="Kısa tanıtım"
            required
            error={state.errors?.shortBio}
            hint="Ana sayfa ve alt bilgide kullanılır, 1-2 cümle."
          >
            <Textarea
              name="shortBio"
              rows={3}
              defaultValue={profile.shortBio}
              required
            />
          </Field>

          <Field
            label="Detaylı biyografi"
            error={state.errors?.bio}
            hint="Hakkımda sayfasında görünür. Paragrafları boş satırla ayırın, **çift yıldız** kalın yazar."
          >
            <Textarea name="bio" rows={12} defaultValue={profile.bio} />
          </Field>
        </div>
      </FormSection>

      <FormSection title="İletişim">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Telefon" required error={state.errors?.phone}>
            <Input
              name="phone"
              defaultValue={profile.phone}
              placeholder="0532 123 45 67"
              required
            />
          </Field>
          <Field label="WhatsApp" required error={state.errors?.whatsapp}>
            <Input name="whatsapp" defaultValue={profile.whatsapp} required />
          </Field>
          <Field label="Ofis telefonu" error={state.errors?.officePhone}>
            <Input name="officePhone" defaultValue={profile.officePhone ?? ""} />
          </Field>
          <Field label="E-posta" required error={state.errors?.email}>
            <Input
              name="email"
              type="email"
              defaultValue={profile.email}
              required
            />
          </Field>
          <Field
            label="Yetki Belgesi No"
            error={state.errors?.licenseNo}
            hint="Taşınmaz Ticareti Yetki Belgesi — mevzuat gereği sitede yer almalı."
          >
            <Input name="licenseNo" defaultValue={profile.licenseNo ?? ""} />
          </Field>
          <Field
            label="Ofis adresi"
            required
            error={state.errors?.address}
            className="sm:col-span-2"
          >
            <Textarea name="address" rows={2} defaultValue={profile.address} required />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Sosyal medya">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Instagram" error={state.errors?.instagramUrl}>
            <Input name="instagramUrl" defaultValue={profile.instagramUrl ?? ""} />
          </Field>
          <Field label="LinkedIn" error={state.errors?.linkedinUrl}>
            <Input name="linkedinUrl" defaultValue={profile.linkedinUrl ?? ""} />
          </Field>
          <Field label="YouTube" error={state.errors?.youtubeUrl}>
            <Input name="youtubeUrl" defaultValue={profile.youtubeUrl ?? ""} />
          </Field>
          <Field label="Facebook" error={state.errors?.facebookUrl}>
            <Input name="facebookUrl" defaultValue={profile.facebookUrl ?? ""} />
          </Field>
          <Field label="TikTok" error={state.errors?.tiktokUrl}>
            <Input name="tiktokUrl" defaultValue={profile.tiktokUrl ?? ""} />
          </Field>
          <Field label="RE/MAX profili" error={state.errors?.remaxUrl}>
            <Input name="remaxUrl" defaultValue={profile.remaxUrl ?? ""} />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Görseller ve ana sayfa videosu"
        description="Hero videosu girilirse ana sayfa tam ekran videoyla açılır. Boş bırakılırsa kapak fotoğrafı sinematik olarak yavaşça yakınlaşır."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          <SingleImagePicker
            name="portraitUrl"
            label="Portre fotoğrafı"
            value={profile.portraitUrl}
            folder="profil"
            aspect="aspect-4/5"
            hint="Dikey çekim"
          />
          <SingleImagePicker
            name="coverUrl"
            label="Kapak görseli"
            value={profile.coverUrl}
            folder="profil"
          />
          <SingleImagePicker
            name="heroPosterUrl"
            label="Ana sayfa görseli"
            value={profile.heroPosterUrl}
            folder="profil"
            hint="Video yoksa bu görsel kullanılır."
          />
        </div>

        <div className="mt-6">
          <Field
            label="Ana sayfa video adresi"
            error={state.errors?.heroVideoUrl}
            hint="Doğrudan .mp4 bağlantısı. 10-20 saniyelik sessiz bir klip idealdir."
          >
            <Input name="heroVideoUrl" defaultValue={profile.heroVideoUrl ?? ""} />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="İstatistikler"
        description="Ana sayfadaki sayan rakamlar. 0 bıraktığınız değerler sitede HİÇ gösterilmez — yalnızca gerçekten doğru olan rakamları girin."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Yıllık tecrübe" error={state.errors?.yearsExperience}>
            <Input
              name="yearsExperience"
              type="number"
              defaultValue={profile.yearsExperience}
            />
          </Field>
          <Field label="Satılan konut" error={state.errors?.soldCount}>
            <Input name="soldCount" type="number" defaultValue={profile.soldCount} />
          </Field>
          <Field label="Kiralanan konut" error={state.errors?.rentedCount}>
            <Input
              name="rentedCount"
              type="number"
              defaultValue={profile.rentedCount}
            />
          </Field>
          <Field label="Mutlu müşteri" error={state.errors?.happyClients}>
            <Input
              name="happyClients"
              type="number"
              defaultValue={profile.happyClients}
            />
          </Field>
          <Field
            label="Değerlendirme sayısı"
            error={state.errors?.reviewCount}
            hint="RE/MAX profilinizdeki yorum sayısı"
          >
            <Input
              name="reviewCount"
              type="number"
              defaultValue={profile.reviewCount}
            />
          </Field>
          <Field
            label="Ortalama puan"
            error={state.errors?.rating}
            hint="0–5 arası, örn. 5"
          >
            <Input
              name="rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              defaultValue={profile.rating ?? ""}
            />
          </Field>
        </div>
      </FormSection>

      <div className="surface-glass fixed inset-x-0 bottom-0 z-30 border-t border-ink-700 px-5 py-3 sm:px-8 lg:left-64">
        <div className="flex justify-end">
          <SaveButton />
        </div>
      </div>
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
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
