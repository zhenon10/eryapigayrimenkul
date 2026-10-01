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
      <section className="border-b border-line bg-canvas">
        <div className="container-site flex flex-col gap-8 py-10 md:flex-row md:items-center">
          <AgentAvatar agent={agent} size="lg" />
          <div className="flex flex-1 flex-col gap-1">
            <h1 className="font-display text-[2rem] leading-tight font-semibold md:text-headline">{agent.name}</h1>
            <p className="font-semibold text-accent-strong">{agent.title || "Gayrimenkul Danışmanı"}</p>
            {agent.specialty && <p className="text-muted">{agent.specialty}</p>}
          </div>
          <div className="flex w-full flex-col gap-2 md:w-64">
            <AgentContactButtons agent={agent} />
            {agent.email && (
              <a href={`mailto:${agent.email}`} className="btn-outline btn-sm">
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
          <h2 className="font-display text-headline-md font-semibold">{agent.name} portföyü</h2>
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
