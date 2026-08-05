"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { login, logout, requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteImage } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import {
  blogPostSchema,
  leadStatusSchema,
  loginSchema,
  profileSchema,
  propertyFeatureSchema,
  propertyImageSchema,
  propertySchema,
  regionSchema,
  testimonialSchema,
} from "@/lib/validators";
import type { FormState } from "@/app/actions/leads";

export type { FormState };

function fail(
  error: { issues: Array<{ path: PropertyKey[]; message: string }> },
  message = "Lütfen işaretli alanları kontrol edin.",
): FormState {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false, message, errors };
}

type SlugModel = "property" | "region" | "blogPost";

function findBySlug(model: SlugModel, slug: string) {
  switch (model) {
    case "property":
      return prisma.property.findUnique({ where: { slug }, select: { id: true } });
    case "region":
      return prisma.region.findUnique({ where: { slug }, select: { id: true } });
    case "blogPost":
      return prisma.blogPost.findUnique({ where: { slug }, select: { id: true } });
  }
}

/** Aynı slug varsa sonuna -2, -3… ekler */
async function uniqueSlug(base: string, model: SlugModel, currentId?: string) {
  const slug = slugify(base) || `kayit-${Date.now().toString(36)}`;
  let candidate = slug;
  let counter = 2;

  for (;;) {
    const existing = await findBySlug(model, candidate);
    if (!existing || existing.id === currentId) return candidate;
    candidate = `${slug}-${counter++}`;
  }
}

function parseJson<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/* -------------------------------------------------------------------------- */
/* Oturum                                                                      */
/* -------------------------------------------------------------------------- */

export async function loginAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);

  const user = await login(parsed.data.email, parsed.data.password);
  if (!user) {
    return { ok: false, message: "E-posta veya şifre hatalı." };
  }

  const next = parsed.data.next;
  redirect(next && next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

/* -------------------------------------------------------------------------- */
/* İlanlar                                                                     */
/* -------------------------------------------------------------------------- */

export async function saveProperty(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const id = String(formData.get("id") ?? "") || undefined;
  const parsed = propertySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);

  const { features, images, slug, closedAt, ...data } = parsed.data;

  const imageList = parseJson<unknown[]>(images, [])
    .map((item) => propertyImageSchema.safeParse(item))
    .filter((result) => result.success)
    .map((result) => result.data);

  const featureList = parseJson<unknown[]>(features, [])
    .map((item) => propertyFeatureSchema.safeParse(item))
    .filter((result) => result.success)
    .map((result) => result.data);

  const finalSlug = await uniqueSlug(slug ?? data.title, "property", id);

  const payload = {
    ...data,
    slug: finalSlug,
    closedAt: closedAt ? new Date(closedAt) : null,
    summary: data.summary || data.description.slice(0, 180),
  };

  let propertyId = id;

  try {
    if (id) {
      // Silinen görsellerin dosyalarını diskten de temizle
      const previous = await prisma.propertyImage.findMany({
        where: { propertyId: id },
        select: { id: true, url: true },
      });
      const keptIds = new Set(imageList.map((image) => image.id).filter(Boolean));
      const removed = previous.filter((image) => !keptIds.has(image.id));

      await prisma.$transaction([
        prisma.property.update({ where: { id }, data: payload }),
        prisma.propertyImage.deleteMany({ where: { propertyId: id } }),
        prisma.propertyFeature.deleteMany({ where: { propertyId: id } }),
        prisma.propertyImage.createMany({
          data: imageList.map((image, index) => ({
            propertyId: id,
            url: image.url,
            alt: image.alt ?? "",
            roomName: image.roomName || null,
            caption: image.caption || null,
            blurDataUrl: image.blurDataUrl || null,
            width: image.width ?? null,
            height: image.height ?? null,
            sortOrder: index,
            isCover: index === 0,
          })),
        }),
        prisma.propertyFeature.createMany({
          data: featureList.map((feature) => ({
            propertyId: id,
            label: feature.label,
            group: feature.group,
          })),
        }),
      ]);

      await Promise.all(removed.map((image) => deleteImage(image.url)));
    } else {
      const created = await prisma.property.create({
        data: {
          ...payload,
          images: {
            create: imageList.map((image, index) => ({
              url: image.url,
              alt: image.alt ?? "",
              roomName: image.roomName || null,
              caption: image.caption || null,
              blurDataUrl: image.blurDataUrl || null,
              width: image.width ?? null,
              height: image.height ?? null,
              sortOrder: index,
              isCover: index === 0,
            })),
          },
          features: {
            create: featureList.map((feature) => ({
              label: feature.label,
              group: feature.group,
            })),
          },
        },
      });
      propertyId = created.id;
    }
  } catch (error) {
    return {
      ok: false,
      message: `İlan kaydedilemedi: ${error instanceof Error ? error.message : "bilinmeyen hata"}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/portfoy");
  revalidatePath(`/portfoy/${finalSlug}`);
  revalidatePath("/admin/ilanlar");

  redirect(`/admin/ilanlar/${propertyId}?kaydedildi=1`);
}

export async function deleteProperty(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const images = await prisma.propertyImage.findMany({
    where: { propertyId: id },
    select: { url: true },
  });

  await prisma.property.delete({ where: { id } });
  await Promise.all(images.map((image) => deleteImage(image.url)));

  revalidatePath("/portfoy");
  revalidatePath("/admin/ilanlar");
  redirect("/admin/ilanlar");
}

/** Liste ekranındaki hızlı "yayında / yayında değil" anahtarı */
export async function togglePropertyPublished(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  const published = formData.get("published") === "true";
  if (!id) return;

  await prisma.property.update({ where: { id }, data: { published } });
  revalidatePath("/portfoy");
  revalidatePath("/admin/ilanlar");
}

/* -------------------------------------------------------------------------- */
/* Bölgeler                                                                    */
/* -------------------------------------------------------------------------- */

export async function saveRegion(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const id = String(formData.get("id") ?? "") || undefined;
  const parsed = regionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);

  const { slug, highlights, ...data } = parsed.data;
  const finalSlug = await uniqueSlug(slug ?? data.name, "region", id);

  const payload = {
    ...data,
    slug: finalSlug,
    highlights: JSON.stringify(
      highlights
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    ),
  };

  try {
    if (id) {
      await prisma.region.update({ where: { id }, data: payload });
    } else {
      await prisma.region.create({ data: payload });
    }
  } catch (error) {
    return {
      ok: false,
      message: `Bölge kaydedilemedi: ${error instanceof Error ? error.message : "bilinmeyen hata"}`,
    };
  }

  revalidatePath("/bolgeler");
  revalidatePath(`/bolgeler/${finalSlug}`);
  revalidatePath("/admin/bolgeler");
  redirect("/admin/bolgeler?kaydedildi=1");
}

export async function deleteRegion(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.region.delete({ where: { id } });
  revalidatePath("/bolgeler");
  revalidatePath("/admin/bolgeler");
}

/* -------------------------------------------------------------------------- */
/* Referanslar                                                                 */
/* -------------------------------------------------------------------------- */

export async function saveTestimonial(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const id = String(formData.get("id") ?? "") || undefined;
  const parsed = testimonialSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);

  try {
    if (id) {
      await prisma.testimonial.update({ where: { id }, data: parsed.data });
    } else {
      await prisma.testimonial.create({ data: parsed.data });
    }
  } catch (error) {
    return {
      ok: false,
      message: `Yorum kaydedilemedi: ${error instanceof Error ? error.message : "bilinmeyen hata"}`,
    };
  }

  revalidatePath("/referanslar");
  revalidatePath("/admin/referanslar");
  redirect("/admin/referanslar?kaydedildi=1");
}

export async function deleteTestimonial(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/referanslar");
  revalidatePath("/admin/referanslar");
}

/* -------------------------------------------------------------------------- */
/* Blog                                                                        */
/* -------------------------------------------------------------------------- */

export async function saveBlogPost(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const id = String(formData.get("id") ?? "") || undefined;
  const parsed = blogPostSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);

  const { slug, tags, ...data } = parsed.data;
  const finalSlug = await uniqueSlug(slug ?? data.title, "blogPost", id);

  const words = data.contentMarkdown.trim().split(/\s+/).length;

  const payload = {
    ...data,
    slug: finalSlug,
    tags: JSON.stringify(
      tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
    readingMinutes: Math.max(1, Math.round(words / 200)),
    publishedAt: data.published ? new Date() : null,
  };

  try {
    if (id) {
      const existing = await prisma.blogPost.findUnique({
        where: { id },
        select: { publishedAt: true },
      });
      await prisma.blogPost.update({
        where: { id },
        data: {
          ...payload,
          // İlk yayın tarihini koru
          publishedAt: data.published
            ? (existing?.publishedAt ?? new Date())
            : null,
        },
      });
    } else {
      await prisma.blogPost.create({ data: payload });
    }
  } catch (error) {
    return {
      ok: false,
      message: `Yazı kaydedilemedi: ${error instanceof Error ? error.message : "bilinmeyen hata"}`,
    };
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${finalSlug}`);
  revalidatePath("/admin/blog");
  redirect("/admin/blog?kaydedildi=1");
}

export async function deleteBlogPost(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
}

/* -------------------------------------------------------------------------- */
/* Profil                                                                      */
/* -------------------------------------------------------------------------- */

export async function saveProfile(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);

  try {
    await prisma.profile.upsert({
      where: { id: "singleton" },
      update: parsed.data,
      create: { ...parsed.data, id: "singleton" },
    });
  } catch (error) {
    return {
      ok: false,
      message: `Profil kaydedilemedi: ${error instanceof Error ? error.message : "bilinmeyen hata"}`,
    };
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "Profil bilgileri güncellendi." };
}

/* -------------------------------------------------------------------------- */
/* Talepler                                                                    */
/* -------------------------------------------------------------------------- */

export async function updateLeadStatus(formData: FormData) {
  await requireSession();
  const parsed = leadStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  await prisma.lead.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });
  revalidatePath("/admin/talepler");
  revalidatePath("/admin");
}

export async function deleteLead(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.lead.delete({ where: { id } });
  revalidatePath("/admin/talepler");
  revalidatePath("/admin");
}
