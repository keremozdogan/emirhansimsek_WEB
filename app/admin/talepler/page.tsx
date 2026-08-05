import Link from "next/link";
import { Mail, Phone, Trash2 } from "lucide-react";

import { deleteLead, updateLeadStatus } from "@/app/actions/admin";
import { AdminPageHeader, EmptyState, StatusPill } from "@/components/admin/ui";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  LEAD_TYPE_LABELS,
  PROPERTY_CATEGORY_LABELS,
  type LeadStatus,
  type LeadType,
  type PropertyCategory,
} from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDate, formatPhone, whatsAppLink } from "@/lib/utils";

export const revalidate = 0;

export const metadata = { title: "Talepler" };

const TABS = [
  { key: "", label: "Tümü" },
  { key: "NEW", label: "Yeni" },
  { key: "CONTACTED", label: "Arandı" },
  { key: "CLOSED", label: "Kapandı" },
];

type ValuationData = {
  city?: string;
  district?: string;
  neighborhood?: string;
  category?: string;
  rooms?: string;
  grossArea?: number;
  buildingAge?: string;
  floor?: string;
  purpose?: string;
};

const PURPOSE_LABELS: Record<string, string> = {
  SELL: "Satmak istiyor",
  RENT: "Kiraya vermek istiyor",
  LEARN: "Sadece değerini merak ediyor",
};

export default async function AdminLeadsPage({
  searchParams,
}: PageProps<"/admin/talepler">) {
  const params = await searchParams;
  const status = Array.isArray(params.status) ? params.status[0] : params.status;

  const leads = await prisma.lead.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { property: { select: { title: true, slug: true } } },
  });

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Talepler"
        description="Siteden gelen iletişim, değerleme ve ilan soruları. Durumu güncelleyerek takip edebilirsiniz."
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={
              tab.key ? `/admin/talepler?status=${tab.key}` : "/admin/talepler"
            }
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              (status ?? "") === tab.key
                ? "bg-brand-500 text-white"
                : "border border-ink-600 text-cream-400 hover:border-cream-400"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {leads.length === 0 ? (
        <EmptyState
          title="Bu listede talep yok"
          description="Ziyaretçiler iletişim, değerleme veya ilan formunu doldurduğunda talepler burada görünür."
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {leads.map((lead) => {
            const valuation: ValuationData | null = lead.valuationData
              ? (JSON.parse(lead.valuationData) as ValuationData)
              : null;

            return (
              <li
                key={lead.id}
                className="rounded-card border border-ink-700 bg-ink-850 p-5 sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base text-cream-50">{lead.name}</h2>
                      <StatusPill
                        tone={
                          lead.status === "NEW"
                            ? "red"
                            : lead.status === "CONTACTED"
                              ? "amber"
                              : "gray"
                        }
                      >
                        {LEAD_STATUS_LABELS[lead.status as LeadStatus]}
                      </StatusPill>
                      <StatusPill tone="blue">
                        {LEAD_TYPE_LABELS[lead.type as LeadType] ?? lead.type}
                      </StatusPill>
                    </div>

                    <p className="mt-2 text-xs text-cream-500">
                      {formatDate(lead.createdAt)}
                      {lead.source ? ` · ${lead.source}` : null}
                    </p>

                    {lead.property ? (
                      <Link
                        href={`/portfoy/${lead.property.slug}`}
                        target="_blank"
                        className="mt-2 inline-block text-sm text-brand-400 transition-colors hover:text-brand-500"
                      >
                        {lead.property.title} →
                      </Link>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <a
                      href={`tel:${lead.phone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-2 rounded-full border border-ink-600 px-4 py-2 text-xs text-cream-200 transition-colors hover:border-cream-400"
                    >
                      <Phone className="size-3.5" />
                      {formatPhone(lead.phone)}
                    </a>
                    <a
                      href={whatsAppLink(
                        lead.phone,
                        `Merhaba ${lead.name}, siteden gönderdiğiniz mesaj için yazıyorum.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full border border-emerald-500/40 px-4 py-2 text-xs text-emerald-300 transition-colors hover:border-emerald-400"
                    >
                      WhatsApp
                    </a>
                    {lead.email ? (
                      <a
                        href={`mailto:${lead.email}`}
                        className="inline-flex items-center gap-2 rounded-full border border-ink-600 px-4 py-2 text-xs text-cream-200 transition-colors hover:border-cream-400"
                      >
                        <Mail className="size-3.5" />
                        E-posta
                      </a>
                    ) : null}
                  </div>
                </div>

                {lead.message ? (
                  <p className="mt-5 rounded-xl border border-ink-600 bg-ink-900 p-4 text-sm leading-relaxed text-cream-300">
                    {lead.message}
                  </p>
                ) : null}

                {valuation ? (
                  <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-ink-600 bg-ink-900 p-4 text-sm sm:grid-cols-4">
                    <Detail
                      label="Konum"
                      value={[
                        valuation.neighborhood,
                        valuation.district,
                        valuation.city,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    />
                    <Detail
                      label="Tip"
                      value={
                        valuation.category
                          ? PROPERTY_CATEGORY_LABELS[
                              valuation.category as PropertyCategory
                            ]
                          : undefined
                      }
                    />
                    <Detail label="Oda" value={valuation.rooms} />
                    <Detail
                      label="Brüt alan"
                      value={
                        valuation.grossArea ? `${valuation.grossArea} m²` : undefined
                      }
                    />
                    <Detail label="Bina yaşı" value={valuation.buildingAge} />
                    <Detail label="Kat" value={valuation.floor} />
                    <Detail
                      label="Amaç"
                      value={
                        valuation.purpose
                          ? PURPOSE_LABELS[valuation.purpose]
                          : undefined
                      }
                    />
                  </dl>
                ) : null}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink-700 pt-4">
                  <div className="flex flex-wrap gap-2">
                    {LEAD_STATUSES.filter((value) => value !== lead.status).map(
                      (value) => (
                        <form key={value} action={updateLeadStatus}>
                          <input type="hidden" name="id" value={lead.id} />
                          <input type="hidden" name="status" value={value} />
                          <button
                            type="submit"
                            className="rounded-full border border-ink-600 px-3.5 py-1.5 text-xs text-cream-300 transition-colors hover:border-cream-400"
                          >
                            {LEAD_STATUS_LABELS[value]} olarak işaretle
                          </button>
                        </form>
                      ),
                    )}
                  </div>

                  <form action={deleteLead}>
                    <input type="hidden" name="id" value={lead.id} />
                    <button
                      type="submit"
                      aria-label="Talebi sil"
                      title="Talebi sil"
                      className="flex size-8 items-center justify-center rounded-full text-cream-500 transition-colors hover:text-brand-400"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-cream-500">
        {label}
      </dt>
      <dd className="mt-1 text-cream-200">{value}</dd>
    </div>
  );
}
