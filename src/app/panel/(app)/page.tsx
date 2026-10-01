import type { Metadata } from "next";
import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { ArrowRight, Building2, FileClock, Inbox, Users } from "lucide-react";
import { db } from "@/db";
import { agents, inquiries, listings } from "@/db/schema";
import { Badge, NewButton, PageHeader, Panel } from "@/components/panel/ui";
import { requireUser } from "@/lib/auth";
import { INQUIRY_KINDS, labelOf } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Özet" };

export default async function DashboardPage() {
  const user = await requireUser();
  const n = (q: { n: number } | undefined) => q?.n ?? 0;
  const published = n(db.select({ n: count() }).from(listings).where(eq(listings.isPublished, true)).get());
  const drafts = n(db.select({ n: count() }).from(listings).where(eq(listings.isPublished, false)).get());
  const agentCount = n(db.select({ n: count() }).from(agents).where(eq(agents.isActive, true)).get());
  const newInquiries = n(db.select({ n: count() }).from(inquiries).where(eq(inquiries.state, "yeni")).get());
  const latest = db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(6).all();

  const s = getSettings();
  const missing = [
    !s.phone && "telefon",
    !s.address && "adres",
    !s.licenseNo && "yetki belge no",
    !s.kvkkText && "KVKK aydınlatma metni",
  ].filter(Boolean);

  const stats = [
    { label: "Yayındaki ilan", value: published, icon: Building2, href: "/panel/ilanlar?durum=yayinda" },
    { label: "Taslak ilan", value: drafts, icon: FileClock, href: "/panel/ilanlar?durum=taslak" },
    { label: "Aktif danışman", value: agentCount, icon: Users, href: "/panel/danismanlar" },
    { label: "Yeni talep", value: newInquiries, icon: Inbox, href: "/panel/talepler?durum=yeni" },
  ];

  return (
    <>
      <PageHeader title={`Merhaba, ${user.name.split(" ")[0]}`} description="Sitenin genel durumu" action={<NewButton href="/panel/ilanlar/yeni" label="Yeni İlan" />} />

      {missing.length > 0 && (
        <div className="mb-6 rounded-lg border border-accent/30 bg-accent-tint p-4 text-sm">
          <strong>Eksik site bilgileri:</strong> {missing.join(", ")}.{" "}
          <Link href="/panel/ayarlar" className="font-semibold underline">
            Site ayarlarından tamamlayın
          </Link>
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="card flex items-center gap-4 p-5 transition hover:shadow-card-hover">
            <span className="flex size-11 items-center justify-center rounded-lg bg-accent-tint text-accent-strong">
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="flex flex-col">
              <span className="tabular text-2xl font-extrabold">{value}</span>
              <span className="text-micro text-muted">{label}</span>
            </span>
          </Link>
        ))}
      </div>

      <Panel title="Son Talepler">
        {latest.length === 0 ? (
          <p className="text-sm text-muted">Henüz talep yok.</p>
        ) : (
          <ul className="divide-y divide-line">
            {latest.map((q) => (
              <li key={q.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="flex items-center gap-2">
                  <span className="font-semibold">{q.name}</span>
                  <Badge tone={q.kind === "degerleme" ? "accent" : "neutral"}>{labelOf(INQUIRY_KINDS, q.kind)}</Badge>
                  {q.state === "yeni" && <Badge tone="success">Yeni</Badge>}
                </span>
                <span className="text-micro text-muted">{formatDateTime(q.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/panel/talepler" className="mt-4 inline-flex items-center gap-1 text-label font-semibold hover:text-accent-strong">
          Tüm talepler <ArrowRight className="size-4" aria-hidden />
        </Link>
      </Panel>
    </>
  );
}
