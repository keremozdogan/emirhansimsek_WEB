"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

import {
  LISTING_TYPES,
  LISTING_TYPE_LABELS,
  PROPERTY_CATEGORIES,
  PROPERTY_CATEGORY_LABELS,
  ROOM_OPTIONS,
} from "@/lib/constants";
import { cn, formatNumber } from "@/lib/utils";

export type FilterOptions = {
  regions: Array<{ slug: string; name: string }>;
  districts: string[];
  maxPrice: number;
};

const SORT_OPTIONS = [
  { value: "newest", label: "En yeni" },
  { value: "price-asc", label: "Fiyat: artan" },
  { value: "price-desc", label: "Fiyat: azalan" },
  { value: "area-desc", label: "Alan: büyükten küçüğe" },
];

/**
 * Portföy filtreleri.
 *
 * Filtre durumu URL sorgu parametrelerinde tutulur — böylece bir arama sonucu
 * paylaşılabilir, geri tuşu beklendiği gibi çalışır ve sayfa sunucuda
 * render edilebilir.
 */
export function PropertyFilters({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  // Arama kutusu için gecikmeli güncelleme
  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (query === current) return;

    const timer = window.setTimeout(() => update("q", query), 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function update(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function clearAll() {
    setQuery("");
    startTransition(() => router.replace(pathname, { scroll: false }));
  }

  const activeCount = ["listingType", "category", "region", "rooms", "minPrice", "maxPrice", "status", "q"]
    .filter((key) => searchParams.get(key))
    .length;

  const get = (key: string) => searchParams.get(key) ?? "";

  return (
    <div className="flex flex-col gap-5">
      {/* Üst satır: satılık/kiralık + arama + sıralama */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex rounded-full border border-ink-600 p-1">
          <TabButton
            active={!get("listingType")}
            onClick={() => update("listingType", null)}
          >
            Tümü
          </TabButton>
          {LISTING_TYPES.map((type) => (
            <TabButton
              key={type}
              active={get("listingType") === type}
              onClick={() => update("listingType", type)}
            >
              {LISTING_TYPE_LABELS[type]}
            </TabButton>
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row lg:max-w-xl">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Mahalle, ilçe veya ilan başlığı ara…"
            aria-label="İlan ara"
            className="flex-1 rounded-full border border-ink-600 bg-ink-850 px-5 py-2.5 text-sm text-cream-50 placeholder:text-cream-500 focus:border-brand-500 focus:outline-none"
          />

          <select
            value={get("sort") || "newest"}
            onChange={(event) => update("sort", event.target.value)}
            aria-label="Sıralama"
            className="rounded-full border border-ink-600 bg-ink-850 px-5 py-2.5 text-sm text-cream-200 focus:border-brand-500 focus:outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-colors",
              open || activeCount > 0
                ? "border-brand-500 text-brand-400"
                : "border-ink-600 text-cream-200 hover:border-cream-400",
            )}
          >
            <SlidersHorizontal className="size-4" />
            Filtreler
            {activeCount > 0 ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-semibold text-white">
                {activeCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {/* Açılır detaylı filtreler */}
      {open ? (
        <div className="grid gap-5 rounded-card border border-ink-700 bg-ink-850 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect
            label="Kategori"
            value={get("category")}
            onChange={(value) => update("category", value)}
            options={[
              { value: "", label: "Tümü" },
              ...PROPERTY_CATEGORIES.map((category) => ({
                value: category,
                label: PROPERTY_CATEGORY_LABELS[category],
              })),
            ]}
          />

          <FilterSelect
            label="Bölge"
            value={get("region")}
            onChange={(value) => update("region", value)}
            options={[
              { value: "", label: "Tüm bölgeler" },
              ...options.regions.map((region) => ({
                value: region.slug,
                label: region.name,
              })),
            ]}
          />

          <FilterSelect
            label="Oda sayısı"
            value={get("rooms")}
            onChange={(value) => update("rooms", value)}
            options={[
              { value: "", label: "Farketmez" },
              ...ROOM_OPTIONS.map((room) => ({
                value: room.trim(),
                label: room.trim(),
              })),
            ]}
          />

          <FilterSelect
            label="Durum"
            value={get("status")}
            onChange={(value) => update("status", value)}
            options={[
              { value: "", label: "Aktif ilanlar" },
              { value: "closed", label: "Satılan / kiralanan" },
              { value: "all", label: "Hepsi" },
            ]}
          />

          <div className="sm:col-span-2">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-cream-400">
              Fiyat aralığı (₺)
            </span>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="number"
                inputMode="numeric"
                placeholder="En az"
                defaultValue={get("minPrice")}
                onBlur={(event) => update("minPrice", event.target.value)}
                className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              />
              <span className="text-cream-500">—</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder={`En çok (${formatNumber(options.maxPrice)})`}
                defaultValue={get("maxPrice")}
                onBlur={(event) => update("maxPrice", event.target.value)}
                className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-end sm:col-span-2 lg:col-span-2">
            <button
              type="button"
              onClick={clearAll}
              disabled={activeCount === 0}
              className="flex items-center gap-2 text-sm text-cream-400 transition-colors hover:text-brand-400 disabled:opacity-40"
            >
              <X className="size-4" />
              Filtreleri temizle
            </button>
          </div>
        </div>
      ) : null}

      {isPending ? (
        <p className="text-xs text-cream-500" role="status">
          Sonuçlar güncelleniyor…
        </p>
      ) : null}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-5 py-2 text-sm transition-colors",
        active ? "bg-brand-500 text-white" : "text-cream-400 hover:text-cream-50",
      )}
    >
      {children}
    </button>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-cream-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-sm text-cream-100 focus:border-brand-500 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
