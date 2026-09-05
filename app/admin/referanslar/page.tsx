import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";

import { deleteTestimonial } from "@/app/actions/admin";
import { TestimonialForm } from "@/components/admin/testimonial-form";
import {
  AdminCard,
  AdminPageHeader,
  EmptyState,
  FormSection,
  StatusPill,
} from "@/components/admin/ui";
import { FormMessage } from "@/components/ui/form-fields";
import { prisma } from "@/lib/db";
import { formatDateShort } from "@/lib/utils";

export const revalidate = 0;

export const metadata = { title: "Referanslar" };

const EMPTY = {
  authorName: "",
  authorTitle: null,
  text: "",
  rating: 5,
  propertyId: null,
  published: true,
  sortOrder: 0,
};

export default async function AdminTestimonialsPage({
  searchParams,
}: PageProps<"/admin/referanslar">) {
  const params = await searchParams;
  const editId = Array.isArray(params.id) ? params.id[0] : params.id;
  const isNew = params.yeni === "1";
  const saved = params.kaydedildi === "1";

  const [testimonials, properties] = await Promise.all([
    prisma.testimonial.findMany({
      orderBy: [{ sortOrder: "asc" }, { date: "desc" }],
      include: { property: { select: { title: true } } },
    }),
    prisma.property.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);

  const editing = editId
    ? testimonials.find((item) => item.id === editId)
    : undefined;

  if (editId && !editing) notFound();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Referanslar"
        description="Müşteri yorumları ana sayfada, referanslar sayfasında ve bağlı olduğu ilan sayfasında gösterilir."
        action={{ href: "/admin/referanslar?yeni=1", label: "Yeni Yorum" }}
      />

      {saved ? <FormMessage ok message="Yorum kaydedildi." /> : null}

      {editing || isNew ? (
        <FormSection title={editing ? "Yorumu düzenle" : "Yeni yorum"}>
          <TestimonialForm
            properties={properties}
            values={
              editing
                ? {
                    id: editing.id,
                    authorName: editing.authorName,
                    authorTitle: editing.authorTitle,
                    text: editing.text,
                    rating: editing.rating,
                    propertyId: editing.propertyId,
                    published: editing.published,
                    sortOrder: editing.sortOrder,
                  }
                : EMPTY
            }
          />
        </FormSection>
      ) : null}

      {testimonials.length === 0 ? (
        <EmptyState
          title="Henüz yorum eklenmedi"
          description="Müşterilerden izin alarak kısa yorumlar ekleyin. Rakamlarla desteklenen yorumlar en çok güven veren içeriktir."
          action={{ href: "/admin/referanslar?yeni=1", label: "Yeni Yorum" }}
        />
      ) : (
        <div className="grid gap-3">
          {testimonials.map((testimonial) => (
            <AdminCard
              key={testimonial.id}
              className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base text-cream-50">
                    {testimonial.authorName}
                  </h2>
                  <span className="flex gap-0.5">
                    {Array.from({ length: testimonial.rating }, (_, i) => (
                      <Star
                        key={i}
                        className="size-3 fill-gold-400 text-gold-400"
                      />
                    ))}
                  </span>
                  {testimonial.published ? (
                    <StatusPill tone="green">Yayında</StatusPill>
                  ) : (
                    <StatusPill tone="gray">Gizli</StatusPill>
                  )}
                </div>

                <p className="mt-1.5 text-xs text-cream-500">
                  {testimonial.authorTitle} ·{" "}
                  {formatDateShort(testimonial.date)}
                  {testimonial.property
                    ? ` · ${testimonial.property.title}`
                    : null}
                </p>

                <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-relaxed text-cream-300">
                  {testimonial.text}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/referanslar?id=${testimonial.id}`}
                  aria-label="Düzenle"
                  className="flex size-9 items-center justify-center rounded-full bg-brand-500 text-ink-950 transition-colors hover:bg-brand-400"
                >
                  <Pencil className="size-4" />
                </Link>
                <form action={deleteTestimonial}>
                  <input type="hidden" name="id" value={testimonial.id} />
                  <button
                    type="submit"
                    aria-label="Sil"
                    className="flex size-9 items-center justify-center rounded-full border border-ink-600 text-cream-500 transition-colors hover:border-brand-500 hover:text-brand-400"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      {!editing && !isNew ? (
        <Link
          href="/admin/referanslar?yeni=1"
          className="inline-flex items-center gap-2 self-start text-sm text-brand-400 transition-colors hover:text-brand-500"
        >
          <Plus className="size-4" />
          Yeni yorum ekle
        </Link>
      ) : null}
    </div>
  );
}
