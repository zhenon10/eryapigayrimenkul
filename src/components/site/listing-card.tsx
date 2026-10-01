import Link from "next/link";
import { ArrowRight, Bath, DoorOpen, Grid3x3, ImageOff, MapPin, Ruler, Video } from "lucide-react";
import { MediaImage } from "@/components/media-image";
import { DISTRICTS, LISTING_STATUSES, LISTING_TYPES, isLandType, labelOf } from "@/lib/constants";
import { formatNumber, formatPrice, initials } from "@/lib/format";
import type { ListingCard as Card } from "@/lib/queries";

export function ListingCard({ listing: l, priority }: { listing: Card; priority?: boolean }) {
  const land = isLandType(l.type);
  const area = l.areaNet ?? l.areaGross;
  const specs = land
    ? [
        { icon: Ruler, label: "Alan", value: area ? `${formatNumber(area)} m²` : "—" },
        { icon: Grid3x3, label: "İmar", value: l.zoning || "—" },
      ]
    : [
        { icon: DoorOpen, label: "Oda", value: l.rooms || "—" },
        { icon: Ruler, label: "Alan", value: area ? `${formatNumber(area)} m²` : "—" },
        { icon: Bath, label: "Banyo", value: l.bathrooms != null ? String(l.bathrooms) : "—" },
      ];
  const location = [labelOf(DISTRICTS, l.district), l.neighborhood].filter(Boolean).join(", ");

  return (
    <article className="group card relative flex flex-col overflow-hidden transition duration-300 hover:shadow-card-hover">
      <div className="relative aspect-[16/10] overflow-hidden bg-panel">
        {l.cover ? (
          <MediaImage
            image={l.cover}
            alt={l.cover.alt || l.title}
            sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            priority={priority}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-ink-muted">
            <ImageOff className="size-8" aria-hidden />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-ink/85 px-3 py-1 text-micro font-semibold text-white backdrop-blur-md">
            {labelOf(LISTING_STATUSES, l.status)} {labelOf(LISTING_TYPES, l.type)}
          </span>
          {l.badge && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-micro font-bold text-accent-strong backdrop-blur-md">
              {l.badge}
            </span>
          )}
        </div>
        <span className="absolute top-3 right-3 flex max-w-[45%] items-center gap-1 rounded-full bg-accent px-3 py-1 text-micro font-bold text-white shadow-sm">
          <MapPin className="size-3 shrink-0" aria-hidden />
          <span className="truncate">{location}</span>
        </span>
        {l.virtualTourUrl && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md glass-dark px-3 py-1 text-micro text-white">
            <Video className="size-3.5 text-accent-bright" aria-hidden /> Sanal Tur
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-5 p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="tabular text-price font-extrabold tracking-tight text-ink">
              {formatPrice(l.price, l.status)}
            </span>
            <span className="tabular shrink-0 text-micro text-muted">{l.refNo}</span>
          </div>
          <h3 className="line-clamp-1 font-display text-headline-sm font-semibold transition group-hover:text-accent-strong">
            <Link href={`/ilanlar/${l.slug}`} className="after:absolute after:inset-0">
              {l.title}
            </Link>
          </h3>
          {l.summary && <p className="line-clamp-2 text-sm leading-[22px] text-muted">{l.summary}</p>}
        </div>

        <dl
          className={`grid gap-2 divide-x divide-line rounded-md bg-canvas px-3 py-3 ${land ? "grid-cols-2" : "grid-cols-3"}`}
        >
          {specs.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex min-w-0 flex-col items-center gap-0.5">
              <dt className="flex items-center gap-1 text-micro text-muted">
                <Icon className="size-3.5" aria-hidden /> {label}
              </dt>
              <dd className="tabular max-w-full truncate text-[15px] font-bold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex items-center justify-between gap-3">
          {l.agent ? (
            <div className="relative z-10 flex min-w-0 items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-tint text-[13px] font-bold text-accent-strong">
                {l.agent.photo ? (
                  <MediaImage image={l.agent.photo} alt="" sizes="36px" className="size-full object-cover" />
                ) : (
                  initials(l.agent.name)
                )}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-label font-bold">{l.agent.name}</span>
                {l.agent.specialty && <span className="truncate text-micro text-muted">{l.agent.specialty}</span>}
              </span>
            </div>
          ) : (
            <span />
          )}
          <span
            aria-hidden
            className="btn-primary btn-sm shrink-0 transition group-hover:bg-accent group-hover:shadow-none"
          >
            İncele <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </article>
  );
}
