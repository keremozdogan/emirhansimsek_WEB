"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, PenLine, Save } from "lucide-react";

import { saveBlogPost } from "@/app/actions/admin";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { SingleImagePicker } from "@/components/admin/single-image-picker";
import { Button } from "@/components/ui/button";
import {
  Checkbox,
  Field,
  FormMessage,
  Input,
  Textarea,
} from "@/components/ui/form-fields";
import { Markdown } from "@/components/ui/markdown";
import { cn } from "@/lib/utils";

export type BlogFormValues = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  contentMarkdown: string;
  coverUrl: string | null;
  tags: string;
  published: boolean;
};

export function BlogForm({ values }: { values: BlogFormValues }) {
  const [state, formAction] = useActionState(saveBlogPost, EMPTY_FORM_STATE);
  const [content, setContent] = useState(values.contentMarkdown);
  const [preview, setPreview] = useState(false);

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <FormMessage ok={false} message={state.message} />

      <Field label="Başlık" required error={state.errors?.title}>
        <Input name="title" defaultValue={values.title} required />
      </Field>

      <Field
        label="Özet"
        required
        error={state.errors?.excerpt}
        hint="Liste sayfasında ve Google sonuçlarında görünür."
      >
        <Textarea
          name="excerpt"
          rows={2}
          defaultValue={values.excerpt}
          maxLength={300}
          required
        />
      </Field>

      <SingleImagePicker
        name="coverUrl"
        label="Kapak görseli"
        value={values.coverUrl}
        folder="blog"
      />

      {/* Yazı alanı — yaz / önizle */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-cream-400">
            İçerik <span className="text-danger-400">*</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-cream-500">
              {words} kelime · ~{Math.max(1, Math.round(words / 200))} dk
            </span>
            <div className="flex rounded-full border border-ink-600 p-0.5">
              <TabButton active={!preview} onClick={() => setPreview(false)}>
                <PenLine className="size-3.5" />
                Yaz
              </TabButton>
              <TabButton active={preview} onClick={() => setPreview(true)}>
                <Eye className="size-3.5" />
                Önizle
              </TabButton>
            </div>
          </div>
        </div>

        {preview ? (
          <div className="min-h-80 rounded-xl border border-ink-600 bg-ink-900 p-6">
            {content.trim() ? (
              <Markdown content={content} />
            ) : (
              <p className="text-sm text-cream-500">
                Önizlemek için içerik yazın.
              </p>
            )}
          </div>
        ) : (
          <Textarea
            name="contentMarkdown"
            rows={22}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            required
            className="font-mono text-[13px] leading-relaxed"
            placeholder={
              "## Başlık\n\nParagraf metni. **Kalın yazı** böyle olur.\n\n- Madde bir\n- Madde iki"
            }
          />
        )}

        {preview ? (
          <input type="hidden" name="contentMarkdown" value={content} />
        ) : null}

        {state.errors?.contentMarkdown ? (
          <span className="text-xs text-danger-400">
            {state.errors.contentMarkdown}
          </span>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Etiketler"
          error={state.errors?.tags}
          hint="Virgülle ayırın: Yatırım, İlk Ev"
        >
          <Input name="tags" defaultValue={values.tags} />
        </Field>
        <Field label="Özel adres (slug)" error={state.errors?.slug}>
          <Input name="slug" defaultValue={values.slug} />
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
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors",
        active ? "bg-brand-500 text-ink-950" : "text-cream-400 hover:text-cream-50",
      )}
    >
      {children}
    </button>
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
