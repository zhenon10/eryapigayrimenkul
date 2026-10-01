import type { Metadata } from "next";
import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";
import { Mail, Phone } from "lucide-react";
import { db } from "@/db";
import { agents, listings, media } from "@/db/schema";
import { AgentAvatar } from "@/components/site/agent-card";
import { Badge, EmptyState, NewButton, PageHeader } from "@/components/panel/ui";

export const metadata: Metadata = { title: "Danışmanlar" };

export default function PanelAgentsPage() {
  const rows = db
    .select({ agent: agents, photo: media, listingCount: count(listings.id) })
    .from(agents)
    .leftJoin(media, eq(media.id, agents.photoId))
    .leftJoin(listings, eq(listings.agentId, agents.id))
    .groupBy(agents.id)
    .orderBy(asc(agents.sortOrder), asc(agents.name))
    .all();

  return (
    <>
      <PageHeader title="Danışmanlar" description={`${rows.length} danışman`} action={<NewButton href="/panel/danismanlar/yeni" label="Yeni Danışman" />} />
      {rows.length === 0 ? (
        <EmptyState
          title="Henüz danışman yok"
          text="Danışman ekledikten sonra ilanlara atayabilirsiniz."
          action={<NewButton href="/panel/danismanlar/yeni" label="Yeni Danışman" />}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ agent: a, photo, listingCount }) => (
            <Link key={a.id} href={`/panel/danismanlar/${a.id}`} className="card flex flex-col gap-4 p-5 transition hover:shadow-card-hover">
              <div className="flex items-center gap-4">
                <AgentAvatar agent={{ name: a.name, photo: photo && { key: photo.key, width: photo.width, height: photo.height, alt: "" } }} />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-bold">{a.name}</span>
                  <span className="truncate text-micro text-muted">{a.title || "Unvan girilmedi"}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-micro text-muted">
                {a.isActive ? <Badge tone="success">Sitede</Badge> : <Badge>Gizli</Badge>}
                <Badge tone="accent">{listingCount} ilan</Badge>
                {a.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="size-3" aria-hidden /> {a.phone}
                  </span>
                )}
                {a.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="size-3" aria-hidden /> {a.email}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
