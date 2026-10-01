import type { Metadata } from "next";
import { AgentCard } from "@/components/site/agent-card";
import { PageHero } from "@/components/site/section";
import { getAgents } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Gayrimenkul Danışmanlarımız",
  description: "Balıkesir ve Körfez bölgesinde uzman, yetki belgeli gayrimenkul danışmanlarımız.",
};

export default function AgentsPage() {
  const agents = getAgents();
  return (
    <>
      <PageHero
        title="Danışmanlarımız"
        text="İlanlarla ilgili sorularınız için danışmanlarımıza doğrudan ulaşabilirsiniz."
      />
      <section className="container-site py-16">
        {agents.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((a) => (
              <AgentCard key={a.id} agent={a} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-canvas p-10 text-center text-muted">Danışman bilgileri yakında eklenecek.</p>
        )}
      </section>
    </>
  );
}
