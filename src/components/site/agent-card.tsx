import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { MediaImage } from "@/components/media-image";
import { initials, telHref, whatsappHref } from "@/lib/format";
import type { PublicAgent } from "@/lib/queries";

export function AgentAvatar({ agent, size = "md" }: { agent: Pick<PublicAgent, "name" | "photo">; size?: "md" | "lg" }) {
  const cls = size === "lg" ? "size-24 text-2xl" : "size-14 text-base";
  return (
    <span
      className={`flex ${cls} shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-tint font-bold text-accent-strong ring-2 ring-accent ring-offset-2`}
    >
      {agent.photo ? (
        <MediaImage image={agent.photo} alt={agent.name} sizes={size === "lg" ? "96px" : "56px"} className="size-full object-cover" />
      ) : (
        initials(agent.name)
      )}
    </span>
  );
}

export function AgentContactButtons({ agent, text }: { agent: Pick<PublicAgent, "phone" | "whatsapp">; text?: string }) {
  if (!agent.phone && !agent.whatsapp) return null;
  return (
    <div className="grid grid-cols-2 gap-2">
      {agent.phone && (
        <a href={telHref(agent.phone)} className="btn-outline btn-sm">
          <Phone className="size-4" aria-hidden /> Ara
        </a>
      )}
      {agent.whatsapp && (
        <a
          href={whatsappHref(agent.whatsapp, text)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-accent btn-sm"
        >
          <MessageCircle className="size-4" aria-hidden /> WhatsApp
        </a>
      )}
    </div>
  );
}

export function AgentCard({ agent }: { agent: PublicAgent }) {
  return (
    <article className="card relative flex flex-col gap-5 p-6 transition hover:shadow-card-hover">
      <div className="flex items-center gap-4">
        <AgentAvatar agent={agent} />
        <div className="flex min-w-0 flex-col">
          <h3 className="text-base font-bold">
            <Link href={`/danismanlar/${agent.slug}`} className="hover:text-accent-strong">
              {agent.name}
            </Link>
          </h3>
          {agent.title && <span className="text-sm text-accent-strong">{agent.title}</span>}
          {agent.specialty && <span className="text-micro text-muted">{agent.specialty}</span>}
        </div>
      </div>
      {agent.bio && <p className="line-clamp-3 text-sm leading-6 text-muted">{agent.bio}</p>}
      <div className="mt-auto">
        <AgentContactButtons agent={agent} />
      </div>
    </article>
  );
}
