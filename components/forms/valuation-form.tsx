"use client";

import { useActionState } from "react";
import { Home, Ruler, User } from "lucide-react";

import { submitValuation } from "@/app/actions/leads";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { SubmitButton } from "@/components/forms/lead-form";
import { LeadSuccess } from "@/components/forms/lead-success";
import {
  Field,
  FormMessage,
  Input,
  KvkkConsent,
  Select,
  Textarea,
} from "@/components/ui/form-fields";
import {
  BUILDING_AGE_OPTIONS,
  PROPERTY_CATEGORIES,
  PROPERTY_CATEGORY_LABELS,
  ROOM_OPTIONS,
  VALUATION_PURPOSE_LABELS,
  VALUATION_PURPOSES,
} from "@/lib/constants";

// Etiketler lib/constants'ta: bildirim e-postası/WhatsApp'ı da aynı metni kullanıyor
const PURPOSES = VALUATION_PURPOSES.map((value) => ({
  value,
  label: VALUATION_PURPOSE_LABELS[value],
}));

/** "Evimin değerini öğren" formu — üç bölümde toplanır, tek adımda gönderilir. */
export function ValuationForm() {
  const [state, formAction] = useActionState(submitValuation, EMPTY_FORM_STATE);

  if (state.ok) {
    return (
      <LeadSuccess message={state.message} whatsappUrl={state.whatsappUrl} />
    );
  }

  // Doğrulama hatasında React alanları sıfırladığı için önceki değerler geri konur
  const previous = state.values ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-10">
      <input type="hidden" name="source" value="/degerleme" />
      <FormMessage ok={false} message={state.message} />

      {/* 1 — Konut bilgileri */}
      <fieldset className="flex flex-col gap-5">
        <Legend Icon={Home} step="01" title="Konut bilgileri" />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="İl" required error={state.errors?.city}>
            <Input name="city" defaultValue={previous.city ?? "İstanbul"} required />
          </Field>
          <Field label="İlçe" required error={state.errors?.district}>
            <Input
              name="district"
              placeholder="Örn. Ataşehir"
              defaultValue={previous.district}
              required
            />
          </Field>
          <Field label="Mahalle" error={state.errors?.neighborhood}>
            <Input
              name="neighborhood"
              placeholder="Örn. Barbaros"
              defaultValue={previous.neighborhood}
            />
          </Field>
          <Field label="Konut tipi" required error={state.errors?.category}>
            <Select
              name="category"
              defaultValue={previous.category ?? "APARTMENT"}
              required
            >
              {PROPERTY_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {PROPERTY_CATEGORY_LABELS[category]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </fieldset>

      {/* 2 — Ölçüler */}
      <fieldset className="flex flex-col gap-5">
        <Legend Icon={Ruler} step="02" title="Ölçüler ve durum" />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            label="Brüt alan (m²)"
            required
            error={state.errors?.grossArea}
          >
            <Input
              name="grossArea"
              type="number"
              inputMode="numeric"
              placeholder="120"
              defaultValue={previous.grossArea}
              required
            />
          </Field>
          <Field label="Oda sayısı" error={state.errors?.rooms}>
            <Select name="rooms" defaultValue={previous.rooms ?? ""}>
              <option value="">Seçin</option>
              {ROOM_OPTIONS.map((room) => (
                <option key={room} value={room.trim()}>
                  {room.trim()}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Bina yaşı" error={state.errors?.buildingAge}>
            <Select name="buildingAge" defaultValue={previous.buildingAge ?? ""}>
              <option value="">Seçin</option>
              {BUILDING_AGE_OPTIONS.map((age) => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Bulunduğu kat" error={state.errors?.floor}>
            <Input name="floor" placeholder="Örn. 3" defaultValue={previous.floor} />
          </Field>
        </div>

        <Field label="Amacınız" error={state.errors?.purpose}>
          <Select name="purpose" defaultValue={previous.purpose ?? "LEARN"}>
            {PURPOSES.map((purpose) => (
              <option key={purpose.value} value={purpose.value}>
                {purpose.label}
              </option>
            ))}
          </Select>
        </Field>
      </fieldset>

      {/* 3 — İletişim */}
      <fieldset className="flex flex-col gap-5">
        <Legend Icon={User} step="03" title="Size nasıl ulaşayım?" />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Adınız Soyadınız" required error={state.errors?.name}>
            <Input
              name="name"
              autoComplete="name"
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
            defaultValue={previous.email}
          />
        </Field>

        <Field
          label="Eklemek istedikleriniz"
          error={state.errors?.message}
          hint="Tadilat durumu, manzara, otopark gibi ayrıntılar değerlemeyi netleştirir."
        >
          <Textarea
            name="message"
            rows={4}
            defaultValue={previous.message}
            placeholder="Örn. 2022'de mutfak ve banyo yenilendi, güney cepheli, kapalı otoparkı var."
          />
        </Field>

        <KvkkConsent
          error={state.errors?.kvkkConsent}
          defaultChecked={Boolean(previous.kvkkConsent)}
        />
        <SubmitButton label="Ücretsiz Değerleme İste" />
      </fieldset>
    </form>
  );
}


function Legend({
  Icon,
  step,
  title,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  step: string;
  title: string;
}) {
  return (
    <legend className="mb-2 flex w-full items-center gap-4 border-b border-ink-700 pb-4">
      <span className="flex size-10 items-center justify-center rounded-full border border-ink-600 text-brand-500">
        <Icon className="size-4" />
      </span>
      <span>
        <span className="block text-[11px] uppercase tracking-[0.22em] text-cream-500">
          Adım {step}
        </span>
        <span className="mt-0.5 block text-lg text-cream-50">{title}</span>
      </span>
    </legend>
  );
}
