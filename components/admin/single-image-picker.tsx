"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";

/** Tek görsel seçici — kapak fotoğrafları ve portre için kullanılır. */
export function SingleImagePicker({
  name,
  label,
  value,
  folder = "genel",
  hint,
  aspect = "aspect-16/10",
}: {
  name: string;
  label: string;
  value: string | null;
  folder?: string;
  hint?: string;
  aspect?: string;
}) {
  const [url, setUrl] = useState(value ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("folder", folder);
    formData.append("files", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.uploaded?.[0]) {
        setError(data.error ?? data.failed?.[0] ?? "Yükleme başarısız oldu.");
      } else {
        setUrl(data.uploaded[0].url);
      }
    } catch {
      setError("Yükleme sırasında bağlantı hatası oluştu.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-cream-400">
        {label}
      </span>

      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className={`relative ${aspect} overflow-hidden rounded-xl border border-ink-600 bg-ink-800`}>
          <Image src={url} alt="" fill sizes="400px" className="object-cover" />
          <button
            type="button"
            onClick={() => setUrl("")}
            aria-label="Görseli kaldır"
            className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full border border-white/20 bg-ink-950/70 text-cream-200 backdrop-blur-sm transition-colors hover:border-white/50"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`flex ${aspect} w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink-600 text-cream-500 transition-colors hover:border-cream-400 disabled:opacity-50`}
        >
          {uploading ? (
            <Loader2 className="size-6 animate-spin text-brand-500" />
          ) : (
            <ImagePlus className="size-6" />
          )}
          <span className="text-xs">
            {uploading ? "Yükleniyor…" : "Görsel yükle"}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />

      {hint && !error ? (
        <span className="text-xs text-cream-500">{hint}</span>
      ) : null}
      {error ? <span className="text-xs text-danger-400">{error}</span> : null}
    </div>
  );
}
