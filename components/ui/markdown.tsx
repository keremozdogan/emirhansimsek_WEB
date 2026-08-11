import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

/**
 * Markdown içerik (blog yazıları, bölge uzman yorumları) için ortak stil.
 * Tailwind typography eklentisi yerine bileşen eşlemesi kullanıldı — koyu tema
 * üzerinde tam kontrol sağlıyor ve ek bağımlılık gerektirmiyor.
 */
export function Markdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="mt-6 text-3xl leading-tight">{children}</h2>
          ),
          h2: ({ children }) => (
            <h2 className="mt-6 text-2xl leading-tight sm:text-3xl">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-4 text-xl leading-snug">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-base leading-relaxed text-cream-300">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-medium text-cream-50">{children}</strong>
          ),
          /**
           * Site içi bağlantılar `next/link` ile veriliyor.
           *
           * Düz `<a href>` tam sayfa yüklemesi tetikliyor; React ağacı
           * baştan kuruluyor ve istemcide tutulan her şey siliniyor. Sohbet
           * asistanı için bu, botun verdiği ilan bağlantısına tıklayan
           * ziyaretçinin konuşmasını tamamen kaybetmesi demekti. Blog ve bölge
           * metinlerinde de gezinme gereksiz yere yavaştı.
           *
           * Dış bağlantılar (wa.me, remax.com.tr ...) yeni sekmede açılıyor;
           * `rel` olmadan `target="_blank"` güvenlik açığı yaratır.
           */
          a: ({ children, href }) => {
            const url = href ?? "";
            const isInternal = url.startsWith("/") || url.startsWith("#");
            const className =
              "text-brand-400 underline underline-offset-2 transition-colors hover:text-brand-500";

            if (isInternal) {
              return (
                <Link href={url} className={className}>
                  {children}
                </Link>
              );
            }

            return (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {children}
              </a>
            );
          },
          ul: ({ children }) => (
            <ul className="flex flex-col gap-2.5 pl-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="flex list-decimal flex-col gap-2.5 pl-5 marker:text-brand-500">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="relative pl-5 text-base leading-relaxed text-cream-300 before:absolute before:left-0 before:top-[0.7em] before:size-1.5 before:rounded-full before:bg-brand-500 [ol_&]:pl-0 [ol_&]:before:hidden">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-brand-500 pl-5 text-cream-200 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-4 border-ink-700" />,
          code: ({ children }) => (
            <code className="rounded bg-ink-800 px-1.5 py-0.5 text-sm text-cream-100">
              {children}
            </code>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-ink-600 px-3 py-2.5 text-left text-xs uppercase tracking-wider text-cream-400">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-ink-700 px-3 py-2.5 text-cream-300">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
