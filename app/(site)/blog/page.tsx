import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";

import { Reveal } from "@/components/animation/reveal";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { getPublishedPosts } from "@/lib/queries";
import { formatDate, parseJsonArray } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gayrimenkul Rehberi",
  description:
    "Ev alırken dikkat edilmesi gerekenler, hızlı satış yöntemleri ve kira getirisi hesabı — sahadan gerçek örneklerle.",
  alternates: { canonical: "/blog" },
};

export const revalidate = 0;

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <Section className="pt-32 sm:pt-40 lg:pt-44">
      <Container>
        <SectionHeading
          eyebrow="Rehber"
          title={
            <>
              Sahadan{" "}
              <span className="text-cream-500">öğrendiklerim.</span>
            </>
          }
          description="Müşterilerimin en çok sorduğu konuları burada tek tek yazıyorum. Reklam değil, işe yarar bilgi."
        />

        {posts.length === 0 ? (
          <p className="mt-16 text-cream-500">Henüz yazı eklenmedi.</p>
        ) : (
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <Reveal key={post.id} delay={(index % 3) * 0.07}>
                <article className="group h-full">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex h-full flex-col overflow-hidden rounded-card border border-ink-700 bg-ink-850 transition-colors hover:border-ink-500"
                  >
                    <div className="relative aspect-16/10 overflow-hidden bg-ink-800">
                      {post.coverUrl ? (
                        <Image
                          src={post.coverUrl}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                        />
                      ) : null}
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-wider text-cream-500">
                        {parseJsonArray(post.tags).map((tag) => (
                          <span key={tag} className="text-brand-400">
                            {tag}
                          </span>
                        ))}
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {post.readingMinutes} dk
                        </span>
                      </div>

                      <h2 className="mt-4 text-xl leading-snug transition-colors group-hover:text-brand-400">
                        {post.title}
                      </h2>

                      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-cream-400">
                        {post.excerpt}
                      </p>

                      <div className="mt-6 flex items-center justify-between border-t border-ink-700 pt-4 text-xs text-cream-500">
                        {post.publishedAt ? formatDate(post.publishedAt) : null}
                        <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
