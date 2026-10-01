import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";
import { AgentAvatar, AgentContactButtons } from "@/components/site/agent-card";
import { ListingCard } from "@/components/site/listing-card";
import { getAgentBySlug } from "@/lib/queries";

export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/danismanlar/[slug]">): Promise<Metadata> {
  const agent = getAgentBySlug((await params).slug);
  if (!agent) return {};
  return { title: `${agent.name} – ${agent.title || "Gayrimenkul Danışmanı"}`, description: agent.bio.slice(0, 160) };
}

export default async function AgentPage({ params }: PageProps<"/danismanlar/[slug]">) {
  const agent = getAgentBySlug((await params).slug);
  if (!agent) notFound();

  return (
    <>
      <section className="bg-ink text-white">
        <div className="container-site flex flex-col gap-8 py-14 md:flex-row md:items-center">
          <AgentAvatar agent={agent} size="lg" />
          <div className="flex flex-1 flex-col gap-2">
            <span className="eyebrow text-accent-bright">{agent.title || "Gayrimenkul Danışmanı"}</span>
            <h1 className="font-display text-headline-md font-semibold md:text-headline">{agent.name}</h1>
            {agent.specialty && <p className="text-ink-muted">{agent.specialty}</p>}
          </div>
          <div className="flex w-full flex-col gap-2 md:w-64">
            <AgentContactButtons agent={agent} />
            {agent.email && (
              <a href={`mailto:${agent.email}`} className="btn btn-sm border border-white/20 text-white hover:bg-white/10">
                <Mail className="size-4" aria-hidden /> {agent.email}
              </a>
            )}
          </div>
        </div>
      </section>

      {agent.bio && (
        <section className="container-site py-12">
          <div className="prose-text max-w-3xl">{agent.bio}</div>
        </section>
      )}

      <section className="bg-canvas py-16">
        <div className="container-site flex flex-col gap-8">
          <h2 className="font-display text-headline-md font-semibold">{agent.name} Portföyü</h2>
          {agent.listings.length ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {agent.listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <p className="text-muted">Danışmanımızın şu anda yayında ilanı bulunmuyor.</p>
          )}
        </div>
      </section>
    </>
  );
}
