"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ExternalLink, Plus, Save, X } from "lucide-react";

import { saveProperty } from "@/app/actions/admin";
import { EMPTY_FORM_STATE } from "@/app/actions/leads";
import {
  ImageManager,
  type ManagedImage,
} from "@/components/admin/image-manager";
import { FormSection } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import {
  Checkbox,
  Field,
  FormMessage,
  Input,
  Select,
  Textarea,
} from "@/components/ui/form-fields";
import {
  BUILDING_AGE_OPTIONS,
  DEED_STATUS_OPTIONS,
  FACADE_OPTIONS,
  FEATURE_GROUPS,
  FEATURE_GROUP_LABELS,
  HEATING_OPTIONS,
  LISTING_TYPES,
  LISTING_TYPE_LABELS,
  PROPERTY_CATEGORIES,
  PROPERTY_CATEGORY_LABELS,
  PROPERTY_STATUSES,
  PROPERTY_STATUS_LABELS,
  ROOM_OPTIONS,
  type FeatureGroup,
} from "@/lib/constants";

export type PropertyFormValues = {
  id?: string;
  slug?: string;
  title: string;
  listingType: string;
  status: string;
  category: string;
  price: number | string;
  currency: string;
  grossArea: number | null;
  netArea: number | null;
  rooms: string | null;
  bathrooms: number | null;
  buildingAge: string | null;
  floor: string | null;
  totalFloors: number | null;
  heating: string | null;
  dues: number | null;
  deedStatus: string | null;
  facade: string | null;
  furnished: boolean;
  creditEligible: boolean;
  balcony: boolean;
  parking: boolean;
  featured: boolean;
  published: boolean;
  city: string;
  district: string;
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;
  summary: string;
  description: string;
  listingNo: string | null;
  remaxUrl: string | null;
  videoUrl: string | null;
  tourUrl: string | null;
  daysOnMarket: number | null;
  closedPricePercent: number | null;
  closedAt: string | null;
  regionId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  images: ManagedImage[];
  features: Array<{ label: string; group: string }>;
};

export function PropertyForm({
  values,
  regions,
  saved,
}: {
  values: PropertyFormValues;
  regions: Array<{ id: string; name: string }>;
  saved?: boolean;
}) {
  const [state, formAction] = useActionState(saveProperty, EMPTY_FORM_STATE);
  const [images, setImages] = useState<ManagedImage[]>(values.images);
  const [features, setFeatures] = useState(values.features);
  const [status, setStatus] = useState(values.status);
  const [listingType, setListingType] = useState(values.listingType);

  const isClosed = status === "SOLD" || status === "RENTED";

  return (
    <form action={formAction} className="flex flex-col gap-6 pb-32">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="features" value={JSON.stringify(features)} />

      {saved && !state.message ? (
        <FormMessage ok message="İlan kaydedildi." />
      ) : null}
      <FormMessage ok={false} message={state.message} />

      {/* Temel bilgiler */}
      <FormSection
        title="Temel bilgiler"
        description="Başlığı alıcının arama yaptığı gibi yazın: bölge + oda sayısı + ayırt edici özellik."
      >
        <div className="flex flex-col gap-5">
          <Field label="İlan başlığı" required error={state.errors?.title}>
            <Input
              name="title"
              defaultValue={values.title}
              placeholder="Ataşehir Barbaros'ta Finans Merkezi Manzaralı 3+1"
              required
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="İlan tipi" required error={state.errors?.listingType}>
              <Select
                name="listingType"
                value={listingType}
                onChange={(event) => setListingType(event.target.value)}
              >
                {LISTING_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {LISTING_TYPE_LABELS[type]}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Kategori" required error={state.errors?.category}>
              <Select name="category" defaultValue={values.category}>
                {PROPERTY_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {PROPERTY_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Durum" required error={state.errors?.status}>
              <Select
                name="status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                {PROPERTY_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {PROPERTY_STATUS_LABELS[value]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field
              label={listingType === "RENT" ? "Aylık kira" : "Fiyat"}
              required
              error={state.errors?.price}
            >
              <Input
                name="price"
                type="number"
                inputMode="numeric"
                defaultValue={values.price}
                required
              />
            </Field>

            <Field label="Para birimi" error={state.errors?.currency}>
              <Select name="currency" defaultValue={values.currency}>
                <option value="TRY">₺ TL</option>
                <option value="USD">$ Dolar</option>
                <option value="EUR">€ Euro</option>
              </Select>
            </Field>

            <Field label="İlan no" error={state.errors?.listingNo}>
              <Input
                name="listingNo"
                defaultValue={values.listingNo ?? ""}
                placeholder="P-24118"
              />
            </Field>
          </div>

          <Field
            label="Kısa özet"
            error={state.errors?.summary}
            hint="İlan kartlarında görünür. Boş bırakırsanız açıklamanın ilk cümleleri kullanılır."
          >
            <Textarea
              name="summary"
              rows={2}
              defaultValue={values.summary}
              maxLength={300}
            />
          </Field>

          <Field
            label="Açıklama"
            required
            error={state.errors?.description}
            hint="Paragrafları boş satırla ayırın. **çift yıldız** arasındaki metin kalın görünür."
          >
            <Textarea
              name="description"
              rows={10}
              defaultValue={values.description}
              required
            />
          </Field>
        </div>
      </FormSection>

      {/* Fotoğraflar ve ev turu */}
      <FormSection
        title="Fotoğraflar ve ev turu"
        description="Sitenin en dikkat çeken bölümü burası. Her fotoğrafa oda adı ve anlatım metni yazdığınızda, ziyaretçi sayfayı kaydırdıkça evi gezmiş gibi hissediyor."
      >
        <ImageManager
          images={images}
          onChange={setImages}
          folder={values.id ? `ilan-${values.id.slice(0, 8)}` : "ilan"}
        />
      </FormSection>

      {/* Konum */}
      <FormSection
        title="Konum"
        description="Koordinatları girerseniz ilan sayfasında harita gösterilir. Google Haritalar'da konuma sağ tıklayıp koordinatları kopyalayabilirsiniz."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="İl" required error={state.errors?.city}>
            <Input name="city" defaultValue={values.city} required />
          </Field>
          <Field label="İlçe" required error={state.errors?.district}>
            <Input name="district" defaultValue={values.district} required />
          </Field>
          <Field label="Mahalle" error={state.errors?.neighborhood}>
            <Input
              name="neighborhood"
              defaultValue={values.neighborhood ?? ""}
            />
          </Field>
          <Field label="Bölge rehberi" error={state.errors?.regionId}>
            <Select name="regionId" defaultValue={values.regionId ?? ""}>
              <option value="">Bağlı değil</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Enlem (lat)" error={state.errors?.lat}>
            <Input
              name="lat"
              type="number"
              step="any"
              defaultValue={values.lat ?? ""}
              placeholder="40.9905"
            />
          </Field>
          <Field label="Boylam (lng)" error={state.errors?.lng}>
            <Input
              name="lng"
              type="number"
              step="any"
              defaultValue={values.lng ?? ""}
              placeholder="29.1265"
            />
          </Field>
        </div>
      </FormSection>

      {/* Teknik bilgiler */}
      <FormSection title="Teknik bilgiler">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Brüt alan (m²)" error={state.errors?.grossArea}>
            <Input
              name="grossArea"
              type="number"
              defaultValue={values.grossArea ?? ""}
            />
          </Field>
          <Field label="Net alan (m²)" error={state.errors?.netArea}>
            <Input
              name="netArea"
              type="number"
              defaultValue={values.netArea ?? ""}
            />
          </Field>
          <Field label="Oda sayısı" error={state.errors?.rooms}>
            <Input
              name="rooms"
              list="oda-secenekleri"
              defaultValue={values.rooms ?? ""}
              placeholder="3+1"
            />
          </Field>
          <Field label="Banyo sayısı" error={state.errors?.bathrooms}>
            <Input
              name="bathrooms"
              type="number"
              defaultValue={values.bathrooms ?? ""}
            />
          </Field>
          <Field label="Bina yaşı" error={state.errors?.buildingAge}>
            <Input
              name="buildingAge"
              list="bina-yaslari"
              defaultValue={values.buildingAge ?? ""}
            />
          </Field>
          <Field label="Bulunduğu kat" error={state.errors?.floor}>
            <Input name="floor" defaultValue={values.floor ?? ""} />
          </Field>
          <Field label="Bina kat sayısı" error={state.errors?.totalFloors}>
            <Input
              name="totalFloors"
              type="number"
              defaultValue={values.totalFloors ?? ""}
            />
          </Field>
          <Field label="Isıtma" error={state.errors?.heating}>
            <Input
              name="heating"
              list="isitma-tipleri"
              defaultValue={values.heating ?? ""}
            />
          </Field>
          <Field label="Aidat (₺/ay)" error={state.errors?.dues}>
            <Input name="dues" type="number" defaultValue={values.dues ?? ""} />
          </Field>
          <Field label="Tapu durumu" error={state.errors?.deedStatus}>
            <Input
              name="deedStatus"
              list="tapu-durumlari"
              defaultValue={values.deedStatus ?? ""}
            />
          </Field>
          <Field label="Cephe" error={state.errors?.facade}>
            <Input
              name="facade"
              list="cepheler"
              defaultValue={values.facade ?? ""}
            />
          </Field>
        </div>

        <div className="mt-7 grid gap-4 border-t border-ink-700 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <Checkbox
            name="balcony"
            defaultChecked={values.balcony}
            label="Balkon var"
          />
          <Checkbox
            name="parking"
            defaultChecked={values.parking}
            label="Otopark var"
          />
          <Checkbox
            name="furnished"
            defaultChecked={values.furnished}
            label="Eşyalı"
          />
          <Checkbox
            name="creditEligible"
            defaultChecked={values.creditEligible}
            label="Krediye uygun"
          />
        </div>

        <datalist id="oda-secenekleri">
          {ROOM_OPTIONS.map((room) => (
            <option key={room} value={room.trim()} />
          ))}
        </datalist>
        <datalist id="bina-yaslari">
          {BUILDING_AGE_OPTIONS.map((age) => (
            <option key={age} value={age} />
          ))}
        </datalist>
        <datalist id="isitma-tipleri">
          {HEATING_OPTIONS.map((heating) => (
            <option key={heating} value={heating} />
          ))}
        </datalist>
        <datalist id="tapu-durumlari">
          {DEED_STATUS_OPTIONS.map((deed) => (
            <option key={deed} value={deed} />
          ))}
        </datalist>
        <datalist id="cepheler">
          {FACADE_OPTIONS.map((facade) => (
            <option key={facade} value={facade} />
          ))}
        </datalist>
      </FormSection>

      {/* Özellikler */}
      <FormSection
        title="Özellikler"
        description="Asansör, güvenlik, deniz manzarası gibi maddeler. İlan sayfasında gruplanmış rozetler olarak görünür."
      >
        <FeatureEditor features={features} onChange={setFeatures} />
      </FormSection>

      {/* Video ve bağlantılar */}
      <FormSection
        title="Video ve bağlantılar"
        description="Video adresi girerseniz ev turu videoyla açılır. Boş bırakırsanız fotoğraflardan sinematik geçişler üretilir."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Video adresi"
            error={state.errors?.videoUrl}
            hint="Doğrudan .mp4 bağlantısı veya /uploads altındaki bir dosya"
          >
            <Input name="videoUrl" defaultValue={values.videoUrl ?? ""} />
          </Field>
          <Field label="360° tur adresi" error={state.errors?.tourUrl}>
            <Input name="tourUrl" defaultValue={values.tourUrl ?? ""} />
          </Field>
          <Field label="RE/MAX ilan bağlantısı" error={state.errors?.remaxUrl}>
            <Input name="remaxUrl" defaultValue={values.remaxUrl ?? ""} />
          </Field>
        </div>
      </FormSection>

      {/* Kapanan işlem bilgileri */}
      {isClosed ? (
        <FormSection
          title="Tamamlanan işlem bilgileri"
          description="Bu rakamlar referanslar sayfasında başarı göstergesi olarak kullanılır."
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <Field
              label="Kaç günde sonuçlandı"
              error={state.errors?.daysOnMarket}
            >
              <Input
                name="daysOnMarket"
                type="number"
                defaultValue={values.daysOnMarket ?? ""}
                placeholder="42"
              />
            </Field>
            <Field
              label="Liste fiyatına oranla (%)"
              error={state.errors?.closedPricePercent}
              hint="Örn. 98 = liste fiyatının %98'ine kapandı"
            >
              <Input
                name="closedPricePercent"
                type="number"
                defaultValue={values.closedPricePercent ?? ""}
                placeholder="98"
              />
            </Field>
            <Field label="Kapanış tarihi" error={state.errors?.closedAt}>
              <Input
                name="closedAt"
                type="date"
                defaultValue={values.closedAt ?? ""}
              />
            </Field>
          </div>
        </FormSection>
      ) : null}

      {/* SEO */}
      <FormSection
        title="Arama motoru ayarları"
        description="Boş bırakırsanız başlık ve özet otomatik kullanılır."
      >
        <div className="flex flex-col gap-5">
          <Field label="Özel adres (slug)" error={state.errors?.slug}>
            <Input
              name="slug"
              defaultValue={values.slug ?? ""}
              placeholder="atasehir-barbaros-3-1-daire"
            />
          </Field>
          <Field label="SEO başlığı" error={state.errors?.seoTitle}>
            <Input name="seoTitle" defaultValue={values.seoTitle ?? ""} />
          </Field>
          <Field label="SEO açıklaması" error={state.errors?.seoDescription}>
            <Textarea
              name="seoDescription"
              rows={2}
              defaultValue={values.seoDescription ?? ""}
              maxLength={200}
            />
          </Field>
        </div>
      </FormSection>

      {/* Alt kaydetme çubuğu */}
      <div className="surface-glass fixed inset-x-0 bottom-0 z-30 border-t border-ink-700 px-5 py-3 sm:px-8 lg:left-64">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-5">
            <Checkbox
              name="published"
              defaultChecked={values.published}
              label="Yayında"
            />
            <Checkbox
              name="featured"
              defaultChecked={values.featured}
              label="Ana sayfada öne çıkar"
            />
          </div>

          <div className="flex items-center gap-3">
            {values.slug ? (
              <Link
                href={`/portfoy/${values.slug}`}
                target="_blank"
                className="flex items-center gap-2 text-sm text-cream-400 transition-colors hover:text-cream-50"
              >
                <ExternalLink className="size-4" />
                Sitede gör
              </Link>
            ) : null}
            <SaveButton />
          </div>
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

function FeatureEditor({
  features,
  onChange,
}: {
  features: Array<{ label: string; group: string }>;
  onChange: (features: Array<{ label: string; group: string }>) => void;
}) {
  const [label, setLabel] = useState("");
  const [group, setGroup] = useState<FeatureGroup>("INTERIOR");

  function add() {
    const trimmed = label.trim();
    if (!trimmed) return;
    if (features.some((feature) => feature.label === trimmed)) {
      setLabel("");
      return;
    }
    onChange([...features, { label: trimmed, group }]);
    setLabel("");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          placeholder="Örn. Kapalı Otopark"
          className="flex-1 rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
        <select
          value={group}
          onChange={(event) => setGroup(event.target.value as FeatureGroup)}
          className="rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        >
          {FEATURE_GROUPS.map((value) => (
            <option key={value} value={value}>
              {FEATURE_GROUP_LABELS[value]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink-600 px-5 py-2.5 text-sm text-cream-100 transition-colors hover:border-cream-400"
        >
          <Plus className="size-4" />
          Ekle
        </button>
      </div>

      {features.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {features.map((feature, index) => (
            <li
              key={`${feature.label}-${index}`}
              className="flex items-center gap-2 rounded-full border border-ink-600 py-1.5 pl-3.5 pr-2 text-xs text-cream-200"
            >
              <span className="text-cream-500">
                {FEATURE_GROUP_LABELS[feature.group as FeatureGroup]?.[0]}
              </span>
              {feature.label}
              <button
                type="button"
                onClick={() =>
                  onChange(features.filter((_, i) => i !== index))
                }
                aria-label={`${feature.label} özelliğini kaldır`}
                className="flex size-5 items-center justify-center rounded-full text-cream-500 transition-colors hover:bg-white/10 hover:text-brand-400"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-cream-500">Henüz özellik eklenmedi.</p>
      )}
    </div>
  );
}
