"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
} from "lucide-react";

import { ROOM_NAME_SUGGESTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type ManagedImage = {
  id?: string;
  url: string;
  alt: string;
  roomName: string;
  caption: string;
  blurDataUrl?: string | null;
  width?: number | null;
  height?: number | null;
};

/**
 * İlan fotoğrafları yöneticisi.
 *
 * Her fotoğrafın **oda adı** ve **anlatım metni** vardır; sitedeki sinematik
 * ev turunda tam ekran fotoğrafın yanında bu metinler belirir. Sıralama,
 * turun akış sırasını belirler — ilk fotoğraf aynı zamanda kapak görselidir.
 */
export function ImageManager({
  images,
  onChange,
  folder = "ilan",
}: {
  images: ManagedImage[];
  onChange: (images: ManagedImage[]) => void;
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("folder", folder);
    list.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Yükleme başarısız oldu.");
      } else {
        const uploaded: ManagedImage[] = (data.uploaded ?? []).map(
          (item: { url: string; blurDataUrl: string; width: number; height: number }) => ({
            url: item.url,
            alt: "",
            roomName: "",
            caption: "",
            blurDataUrl: item.blurDataUrl,
            width: item.width,
            height: item.height,
          }),
        );
        onChange([...images, ...uploaded]);
        if (data.failed?.length) setError(data.failed.join(" · "));
      }
    } catch {
      setError("Yükleme sırasında bağlantı hatası oluştu.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function update(index: number, patch: Partial<ManagedImage>) {
    onChange(
      images.map((image, i) => (i === index ? { ...image, ...patch } : image)),
    );
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function makeCover(index: number) {
    if (index === 0) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    onChange([item, ...next]);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Yükleme alanı */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (event.dataTransfer.files.length > 0) {
            void upload(event.dataTransfer.files);
          }
        }}
        className={cn(
          "flex flex-col items-center rounded-card border border-dashed px-6 py-10 text-center transition-colors",
          dragOver ? "border-brand-500 bg-brand-500/5" : "border-ink-600",
        )}
      >
        {uploading ? (
          <Loader2 className="size-7 animate-spin text-brand-500" />
        ) : (
          <ImagePlus className="size-7 text-cream-500" />
        )}

        <p className="mt-4 text-sm text-cream-200">
          {uploading
            ? "Fotoğraflar yükleniyor…"
            : "Fotoğrafları buraya sürükleyin"}
        </p>
        <p className="mt-1.5 text-xs text-cream-500">
          JPG, PNG, HEIC · dosya başına en fazla 25 MB · otomatik olarak WebP&apos;ye
          çevrilir
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-6 rounded-full border border-ink-600 px-5 py-2.5 text-sm text-cream-100 transition-colors hover:border-cream-400 disabled:opacity-50"
        >
          Dosya seç
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => {
            if (event.target.files) void upload(event.target.files);
          }}
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-brand-500/40 bg-brand-500/10 px-4 py-3 text-sm text-brand-200">
          {error}
        </p>
      ) : null}

      {images.length > 0 ? (
        <>
          <div className="rounded-xl border border-ink-600 bg-ink-900 px-4 py-3">
            <p className="text-xs leading-relaxed text-cream-400">
              <strong className="text-cream-200">Sıralama = tur sırası.</strong>{" "}
              İlk fotoğraf kapak görseli olur. Her fotoğrafa yazacağınız{" "}
              <strong className="text-cream-200">oda adı</strong> ve{" "}
              <strong className="text-cream-200">anlatım metni</strong>, sitede
              tam ekran ev turunda fotoğrafın yanında belirir.
            </p>
          </div>

          <ul className="flex flex-col gap-4">
            {images.map((image, index) => (
              <li
                key={image.url}
                className="grid gap-5 rounded-card border border-ink-700 bg-ink-900 p-4 sm:grid-cols-[180px_1fr]"
              >
                <div>
                  <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-ink-800">
                    <Image
                      src={image.url}
                      alt={image.alt || `Fotoğraf ${index + 1}`}
                      fill
                      sizes="180px"
                      className="object-cover"
                    />
                    {index === 0 ? (
                      <span className="absolute left-2 top-2 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                        KAPAK
                      </span>
                    ) : null}
                    <span className="absolute bottom-2 right-2 rounded bg-ink-950/80 px-1.5 py-0.5 text-[10px] text-cream-300">
                      {index + 1}
                    </span>
                  </div>

                  <div className="mt-2 flex gap-1.5">
                    <IconButton
                      label="Yukarı taşı"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="size-3.5" />
                    </IconButton>
                    <IconButton
                      label="Aşağı taşı"
                      onClick={() => move(index, 1)}
                      disabled={index === images.length - 1}
                    >
                      <ArrowDown className="size-3.5" />
                    </IconButton>
                    <IconButton
                      label="Kapak yap"
                      onClick={() => makeCover(index)}
                      disabled={index === 0}
                    >
                      <Star className="size-3.5" />
                    </IconButton>
                    <IconButton
                      label="Sil"
                      onClick={() => remove(index)}
                      danger
                    >
                      <Trash2 className="size-3.5" />
                    </IconButton>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-cream-500">
                      Oda adı
                    </span>
                    <input
                      value={image.roomName}
                      onChange={(event) =>
                        update(index, { roomName: event.target.value })
                      }
                      list="oda-adlari"
                      placeholder="Örn. Salon"
                      className="rounded-lg border border-ink-600 bg-ink-850 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-cream-500">
                      Anlatım metni
                    </span>
                    <textarea
                      value={image.caption}
                      onChange={(event) =>
                        update(index, { caption: event.target.value })
                      }
                      rows={3}
                      placeholder="Örn. 42 m² çift cepheli salon. Sabah doğudan, akşamüstü batıdan ışık alıyor."
                      className="resize-y rounded-lg border border-ink-600 bg-ink-850 px-3 py-2 text-sm leading-relaxed focus:border-brand-500 focus:outline-none"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-cream-500">
                      Alternatif metin{" "}
                      <span className="normal-case tracking-normal text-cream-400">
                        (görme engelliler ve arama motorları için)
                      </span>
                    </span>
                    <input
                      value={image.alt}
                      onChange={(event) =>
                        update(index, { alt: event.target.value })
                      }
                      placeholder="Örn. Geniş ve aydınlık salon"
                      className="rounded-lg border border-ink-600 bg-ink-850 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                    />
                  </label>
                </div>
              </li>
            ))}
          </ul>

          <datalist id="oda-adlari">
            {ROOM_NAME_SUGGESTIONS.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </>
      ) : null}
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-8 items-center justify-center rounded-lg border border-ink-600 transition-colors disabled:opacity-30",
        danger
          ? "text-brand-400 hover:border-brand-500"
          : "text-cream-300 hover:border-cream-400",
      )}
    >
      {children}
    </button>
  );
}
