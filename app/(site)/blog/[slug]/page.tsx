import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { Container, Section } from "@/components/ui/primitives";
import { prisma } from "@/lib/db";
import { getProfile } from "@/lib/queries";
import { formatDate, parseJsonArray } from "@/lib/utils";

export const revalidate = 0;

async function getPost(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug } });
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Yazı bulunamadı" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverUrl ? [{ url: post.coverUrl }] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const [post, profile] = await Promise.all([getPost(slug), getProfile()]);

  if (!post || !post.published) notFound();

  const related = await prisma.blogPost.findMany({
    where: { published: true, slug: { not: post.slug } },
    orderBy: { publishedAt: "desc" },
    take: 2,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    image: post.coverUrl ?? undefined,
    author: {
      "@type": "Person",
      name: profile.fullName,
      jobTitle: profile.title,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article>
        {/* Kapak */}
        <section className="relative flex h-[58svh] min-h-[400px] items-end overflow-hidden">
          {post.coverUrl ? (
            <Image
              src={post.coverUrl}
              alt={post.title}
              fill
              priority
              sizes="100vw"
              className="ken-burns object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-ink-800" />
          )}
          <div className="scrim-full absolute inset-0" />

          <Container className="relative z-10 pb-14">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-cream-400">
              {parseJsonArray(post.tags).map((tag) => (
                <span key={tag} className="text-brand-500">
                  {tag}
                </span>
              ))}
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {post.readingMinutes} dakika okuma
              </span>
              {post.publishedAt ? <span>{formatDate(post.publishedAt)}</span> : null}
            </div>

            <h1 className="mt-5 max-w-4xl text-balance font-display text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              {post.title}
            </h1>
          </Container>
        </section>

        <Section className="!py-16">
          <Container>
            <div className="mx-auto max-w-3xl">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm text-cream-400 transition-colors hover:text-cream-50"
              >
                <ArrowLeft className="size-4" />
                Tüm yazılar
              </Link>

              <p className="mt-10 text-balance text-xl leading-relaxed text-cream-200">
                {post.excerpt}
              </p>

              <div className="mt-10 h-px bg-ink-700" />

              <Markdown content={post.contentMarkdown} className="mt-10" />

              {/* Yazar kartı */}
              <div className="mt-16 flex items-center gap-5 rounded-card border border-ink-700 bg-ink-850 p-6">
                {profile.portraitUrl ? (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={profile.portraitUrl}
                      alt={profile.fullName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div>
                  <p className="text-base">{profile.fullName}</p>
                  <p className="mt-1 text-xs text-cream-500">
                    {profile.title} · {profile.officeName}
                  </p>
                  <Link
                    href="/iletisim"
                    className="mt-2 inline-block text-xs text-brand-400 transition-colors hover:text-brand-500"
                  >
                    Soru sormak için yazın →
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </Section>
      </article>

      {related.length > 0 ? (
        <Section className="bg-ink-950 !py-20">
          <Container>
            <div className="mx-auto max-w-3xl">
              <h2 className="text-2xl">Bunlar da ilginizi çekebilir</h2>
              <div className="mt-8 flex flex-col gap-3">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/blog/${item.slug}`}
                    className="group flex items-center justify-between gap-6 border-b border-ink-700 py-5"
                  >
                    <div>
                      <h3 className="text-lg transition-colors group-hover:text-brand-400">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-1 text-sm text-cream-500">
                        {item.excerpt}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-cream-500">
                      {item.readingMinutes} dk
                    </span>
                  </Link>
                ))}
              </div>

              <ButtonLink href="/blog" variant="outline" className="mt-10">
                Tüm yazılar
              </ButtonLink>
            </div>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
