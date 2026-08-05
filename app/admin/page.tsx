import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  Inbox,
  Map,
} from "lucide-react";

import { AdminCard, AdminPageHeader, StatusPill } from "@/components/admin/ui";
import { LEAD_TYPE_LABELS, type LeadType } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDateShort, formatPhone } from "@/lib/utils";

export const revalidate = 0;

export default async function AdminDashboard() {
  const [
    activeCount,
    closedCount,
    draftCount,
    regionCount,
    postCount,
    newLeads,
    recentLeads,
    recentProperties,
  ] = await Promise.all([
    prisma.property.count({
      where: { published: true, status: { in: ["ACTIVE", "RESERVED"] } },
    }),
    prisma.property.count({ where: { status: { in: ["SOLD", "RENTED"] } } }),
    prisma.property.count({ where: { published: false } }),
    prisma.region.count(),
    prisma.blogPost.count({ where: { published: true } }),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { property: { select: { title: true, slug: true } } },
    }),
    prisma.property.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        published: true,
        status: true,
        updatedAt: true,
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <AdminPageHeader
        title="Panel"
        description="Portföyün ve gelen taleplerin özeti."
        action={{ href: "/admin/ilanlar/yeni", label: "Yeni İlan" }}
      />

      {/* Rakamlar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          Icon={Inbox}
          value={newLeads}
          label="Yeni talep"
          href="/admin/talepler"
          highlight={newLeads > 0}
        />
        <StatCard
          Icon={Building2}
          value={activeCount}
          label="Yayındaki ilan"
          href="/admin/ilanlar"
        />
        <StatCard
          Icon={CheckCircle2}
          value={closedCount}
          label="Tamamlanan işlem"
          href="/admin/ilanlar?status=closed"
        />
        <StatCard Icon={Map} value={regionCount} label="Bölge" href="/admin/bolgeler" />
        <StatCard
          Icon={FileText}
          value={postCount}
          label="Yayındaki yazı"
          href="/admin/blog"
        />
      </div>

      {draftCount > 0 ? (
        <AdminCard className="border-gold-400/30 bg-gold-400/5">
          <p className="text-sm text-cream-200">
            <strong className="font-medium text-gold-400">{draftCount}</strong>{" "}
            ilan yayında değil.{" "}
            <Link
              href="/admin/ilanlar?published=false"
              className="text-brand-400 underline underline-offset-2 hover:text-brand-500"
            >
              Taslakları görüntüle
            </Link>
          </p>
        </AdminCard>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Son talepler */}
        <AdminCard>
          <div className="flex items-center justify-between">
            <h2 className="text-lg">Son talepler</h2>
            <Link
              href="/admin/talepler"
              className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-500"
            >
              Tümü
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <p className="mt-6 text-sm text-cream-500">Henüz talep yok.</p>
          ) : (
            <ul className="mt-5 flex flex-col">
              {recentLeads.map((lead) => (
                <li
                  key={lead.id}
                  className="flex items-start justify-between gap-4 border-t border-ink-700 py-4"
                >
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm text-cream-100">
                      {lead.name}
                      {lead.status === "NEW" ? (
                        <StatusPill tone="red">Yeni</StatusPill>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs text-cream-500">
                      {LEAD_TYPE_LABELS[lead.type as LeadType] ?? lead.type} ·{" "}
                      {formatPhone(lead.phone)} · {formatDateShort(lead.createdAt)}
                    </p>
                    {lead.property ? (
                      <p className="mt-1 truncate text-xs text-cream-400">
                        {lead.property.title}
                      </p>
                    ) : null}
                  </div>
                  <a
                    href={`tel:${lead.phone.replace(/\s/g, "")}`}
                    className="shrink-0 rounded-full border border-ink-600 px-3 py-1.5 text-xs text-cream-300 transition-colors hover:border-cream-400"
                  >
                    Ara
                  </a>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        {/* Son düzenlenen ilanlar */}
        <AdminCard>
          <div className="flex items-center justify-between">
            <h2 className="text-lg">Son düzenlenen ilanlar</h2>
            <Link
              href="/admin/ilanlar"
              className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-500"
            >
              Tümü
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {recentProperties.length === 0 ? (
            <p className="mt-6 text-sm text-cream-500">
              Henüz ilan eklenmedi.
            </p>
          ) : (
            <ul className="mt-5 flex flex-col">
              {recentProperties.map((property) => (
                <li key={property.id} className="border-t border-ink-700 py-4">
                  <Link
                    href={`/admin/ilanlar/${property.id}`}
                    className="group flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-cream-100 transition-colors group-hover:text-brand-400">
                        {property.title}
                      </p>
                      <p className="mt-1 text-xs text-cream-500">
                        {formatDateShort(property.updatedAt)} tarihinde
                        güncellendi
                      </p>
                    </div>
                    {property.published ? (
                      <StatusPill tone="green">Yayında</StatusPill>
                    ) : (
                      <StatusPill tone="gray">Taslak</StatusPill>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </div>
  );
}

function StatCard({
  Icon,
  value,
  label,
  href,
  highlight,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-card border p-5 transition-colors ${
        highlight
          ? "border-brand-500/40 bg-brand-500/8 hover:border-brand-500"
          : "border-ink-700 bg-ink-850 hover:border-ink-500"
      }`}
    >
      <Icon className={`size-4 ${highlight ? "text-brand-500" : "text-cream-500"}`} />
      <p className="mt-4 font-display text-3xl">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-cream-500">
        {label}
      </p>
    </Link>
  );
}
