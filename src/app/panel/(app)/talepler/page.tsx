import type { Metadata } from "next";
import Link from "next/link";
import { and, count, desc, eq, type SQL } from "drizzle-orm";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { db } from "@/db";
import { inquiries, listings } from "@/db/schema";
import { Badge, EmptyState, PageHeader } from "@/components/panel/ui";
import { DISTRICTS, INQUIRY_KINDS, INQUIRY_STATES, LISTING_TYPES, labelOf } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { formatDateTime, telHref, whatsappHref } from "@/lib/format";
import { InquiryActions } from "./inquiry-actions";

export const metadata: Metadata = { title: "Talepler" };

const PAGE_SIZE = 30;

export default async function InquiriesPage({ searchParams }: PageProps<"/panel/talepler">) {
  const sp = await searchParams;
  const state = INQUIRY_STATES.some((s) => s.value === sp.durum) ? (sp.durum as (typeof INQUIRY_STATES)[number]["value"]) : null;
  const kind = INQUIRY_KINDS.some((k) => k.value === sp.tur) ? (sp.tur as (typeof INQUIRY_KINDS)[number]["value"]) : null;
  const page = Math.max(1, Number(sp.sayfa) || 1);

  const where: SQL[] = [];
  if (state) where.push(eq(inquiries.state, state));
  if (kind) where.push(eq(inquiries.kind, kind));
  const cond = and(...where);

  const total = db.select({ n: count() }).from(inquiries).where(cond).get()!.n;
  const rows = db
    .select({ inquiry: inquiries, listingTitle: listings.title, listingRef: listings.refNo, listingId: listings.id })
    .from(inquiries)
    .leftJoin(listings, eq(listings.id, inquiries.listingId))
    .where(cond)
    .orderBy(desc(inquiries.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE)
    .all();
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const href = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams();
    const merged = { durum: state, tur: kind, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const qs = p.toString();
    return qs ? `/panel/talepler?${qs}` : "/panel/talepler";
  };

  return (
    <>
      <PageHeader title="Talepler" description="Sitedeki değerleme, iletişim ve ilan formlarından gelen başvurular." />

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip href={href({ durum: null, sayfa: null })} active={!state}>
          Tümü
        </FilterChip>
        {INQUIRY_STATES.map((s) => (
          <FilterChip key={s.value} href={href({ durum: s.value, sayfa: null })} active={state === s.value}>
            {s.label}
          </FilterChip>
        ))}
        <span className="mx-2 w-px bg-line" />
        {INQUIRY_KINDS.map((k) => (
          <FilterChip key={k.value} href={href({ tur: kind === k.value ? null : k.value, sayfa: null })} active={kind === k.value}>
            {k.label}
          </FilterChip>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Talep bulunamadı" text="Formlardan gelen başvurular burada listelenir." />
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map(({ inquiry: q, listingTitle, listingRef, listingId }) => (
            <article key={q.id} className={cn("card flex flex-col gap-4 p-5 lg:flex-row", q.state === "yeni" && "border-l-4 border-l-accent")}>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{q.name}</span>
                  <Badge tone={q.kind === "degerleme" ? "accent" : "neutral"}>{labelOf(INQUIRY_KINDS, q.kind)}</Badge>
                  <span className="text-micro text-muted">{formatDateTime(q.createdAt)}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <a href={telHref(q.phone)} className="flex items-center gap-1.5 font-semibold hover:text-accent-strong">
                    <Phone className="size-3.5" aria-hidden /> {q.phone}
                  </a>
                  <a href={whatsappHref(q.phone)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-muted hover:text-accent-strong">
                    <MessageCircle className="size-3.5" aria-hidden /> WhatsApp
                  </a>
                  {q.email && (
                    <a href={`mailto:${q.email}`} className="flex items-center gap-1.5 text-muted hover:text-accent-strong">
                      <Mail className="size-3.5" aria-hidden /> {q.email}
                    </a>
                  )}
                </div>
                {(q.propertyType || q.district || listingId) && (
                  <p className="text-micro text-muted">
                    {[q.propertyType && labelOf(LISTING_TYPES, q.propertyType), q.district && labelOf(DISTRICTS, q.district)].filter(Boolean).join(" · ")}
                    {listingId && (q.propertyType || q.district) && " · "}
                    {listingId && (
                      <Link href={`/panel/ilanlar/${listingId}`} className="font-semibold text-ink underline">
                        {listingRef} – {listingTitle}
                      </Link>
                    )}
                  </p>
                )}
                {q.message && <p className="rounded-md bg-canvas p-3 text-sm whitespace-pre-line">{q.message}</p>}
              </div>
              <InquiryActions id={q.id} state={q.state} note={q.note} />
            </article>
          ))}
        </div>
      )}

      {pages > 1 && (
        <nav className="mt-6 flex justify-center gap-2" aria-label="Sayfalar">
          {page > 1 && (
            <Link href={href({ sayfa: String(page - 1) })} className="btn-outline btn-sm">
              Önceki
            </Link>
          )}
          <span className="tabular self-center text-sm text-muted">
            {page} / {pages}
          </span>
          {page < pages && (
            <Link href={href({ sayfa: String(page + 1) })} className="btn-outline btn-sm">
              Sonraki
            </Link>
          )}
        </nav>
      )}
    </>
  );
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-label font-semibold transition",
        active ? "border-ink bg-ink text-white" : "border-line bg-white text-muted hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}
