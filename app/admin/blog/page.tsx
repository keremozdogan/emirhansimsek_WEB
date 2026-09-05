import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { deleteBlogPost } from "@/app/actions/admin";
import { BlogForm } from "@/components/admin/blog-form";
import {
  AdminCard,
  AdminPageHeader,
  EmptyState,
  FormSection,
  StatusPill,
} from "@/components/admin/ui";
import { FormMessage } from "@/components/ui/form-fields";
import { prisma } from "@/lib/db";
import { formatDateShort, parseJsonArray } from "@/lib/utils";

export const revalidate = 0;

export const metadata = { title: "Blog" };

const EMPTY = {
  title: "",
  slug: "",
  excerpt: "",
  contentMarkdown: "",
  coverUrl: null,
  tags: "",
  published: false,
};

export default async function AdminBlogPage({
  searchParams,
}: PageProps<"/admin/blog">) {
  const params = await searchParams;
  const editId = Array.isArray(params.id) ? params.id[0] : params.id;
  const isNew = params.yeni === "1";
  const saved = params.kaydedildi === "1";

  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const editing = editId ? posts.find((post) => post.id === editId) : undefined;
  if (editId && !editing) notFound();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Blog"
        description="Rehber yazıları Google'dan organik ziyaretçi getirir. Markdown ile yazabilir, kaydetmeden önce önizleyebilirsiniz."
        action={{ href: "/admin/blog?yeni=1", label: "Yeni Yazı" }}
      />

      {saved ? <FormMessage ok message="Yazı kaydedildi." /> : null}

      {editing || isNew ? (
        <FormSection title={editing ? "Yazıyı düzenle" : "Yeni yazı"}>
          <BlogForm
            values={
              editing
                ? {
                    id: editing.id,
                    title: editing.title,
                    slug: editing.slug,
                    excerpt: editing.excerpt,
                    contentMarkdown: editing.contentMarkdown,
                    coverUrl: editing.coverUrl,
                    tags: parseJsonArray(editing.tags).join(", "),
                    published: editing.published,
                  }
                : EMPTY
            }
          />
        </FormSection>
      ) : null}

      {posts.length === 0 ? (
        <EmptyState
          title="Henüz yazı yok"
          description="“Ev alırken dikkat edilmesi gerekenler” gibi konular, arama motorlarından düzenli ziyaretçi getirir."
          action={{ href: "/admin/blog?yeni=1", label: "Yeni Yazı" }}
        />
      ) : (
        <div className="grid gap-3">
          {posts.map((post) => (
            <AdminCard
              key={post.id}
              className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base text-cream-50">{post.title}</h2>
                  {post.published ? (
                    <StatusPill tone="green">Yayında</StatusPill>
                  ) : (
                    <StatusPill tone="gray">Taslak</StatusPill>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-cream-500">
                  {post.readingMinutes} dk ·{" "}
                  {parseJsonArray(post.tags).join(", ") || "etiketsiz"} ·{" "}
                  {formatDateShort(post.updatedAt)}
                </p>
                <p className="mt-2 line-clamp-1 max-w-2xl text-sm text-cream-400">
                  {post.excerpt}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="rounded-full border border-ink-600 px-4 py-2 text-xs text-cream-300 transition-colors hover:border-cream-400"
                >
                  Sitede gör
                </Link>
                <Link
                  href={`/admin/blog?id=${post.id}`}
                  aria-label="Düzenle"
                  className="flex size-9 items-center justify-center rounded-full bg-brand-500 text-ink-950 transition-colors hover:bg-brand-400"
                >
                  <Pencil className="size-4" />
                </Link>
                <form action={deleteBlogPost}>
                  <input type="hidden" name="id" value={post.id} />
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
          href="/admin/blog?yeni=1"
          className="inline-flex items-center gap-2 self-start text-sm text-brand-400 transition-colors hover:text-brand-500"
        >
          <Plus className="size-4" />
          Yeni yazı ekle
        </Link>
      ) : null}
    </div>
  );
}
