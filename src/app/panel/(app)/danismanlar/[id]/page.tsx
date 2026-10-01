import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { Badge, PageHeader } from "@/components/panel/ui";
import { getAgentForEdit } from "@/lib/panel-queries";
import { AgentForm } from "../agent-form";

export const metadata: Metadata = { title: "Danışmanı Düzenle" };

export default async function EditAgentPage({ params, searchParams }: PageProps<"/panel/danismanlar/[id]">) {
  const data = getAgentForEdit(Number((await params).id));
  if (!data) notFound();
  const { agent, photo } = data;
  const listingCount = db.select({ n: count() }).from(listings).where(eq(listings.agentId, agent.id)).get()!.n;
  const created = (await searchParams).yeni === "1";

  return (
    <>
      <PageHeader
        title={agent.name}
        back={{ href: "/panel/danismanlar", label: "Danışmanlar" }}
        description={created ? <Badge tone="accent">Danışman oluşturuldu</Badge> : undefined}
        action={
          agent.isActive && (
            <Link href={`/danismanlar/${agent.slug}`} target="_blank" className="btn-outline">
              Sitede Gör <ExternalLink className="size-4" aria-hidden />
            </Link>
          )
        }
      />
      <AgentForm agent={agent} photo={photo} listingCount={listingCount} />
    </>
  );
}
