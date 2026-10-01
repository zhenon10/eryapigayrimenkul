import Link from "next/link";
import { ImageOff, MapPin, Video } from "lucide-react";
import { MediaImage } from "@/components/media-image";
import { DISTRICTS, LISTING_STATUSES, isLandType, labelOf } from "@/lib/constants";
import { formatNumber, formatPrice } from "@/lib/format";
import type { ListingCard as Card } from "@/lib/queries";
import { typeSeoLabel } from "@/lib/seo";

export function ListingCard({ listing: l, priority }: { listing: Card; priority?: boolean }) {
  const area = l.areaNet ?? l.areaGross;
  const specs = (
    isLandType(l.type)
      ? [area && `${formatNumber(area)} m²`, l.zoning]
      : [l.rooms, area && `${formatNumber(area)} m²`, l.bathrooms != null && `${l.bathrooms} banyo`]
  ).filter(Boolean);
  const location = [labelOf(DISTRICTS, l.district), l.neighborhood].filter(Boolean).join(", ");

  return (
    <article className="group card relative flex flex-col overflow-hidden transition duration-300 hover:shadow-card-hover">
      <div className="relative aspect-[4/3] overflow-hidden bg-panel">
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
        <span className="absolute top-3 left-3 rounded bg-ink/80 px-2 py-0.5 text-micro font-semibold text-white">
          {labelOf(LISTING_STATUSES, l.status)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="flex items-center gap-1 text-micro text-muted">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {location} · {typeSeoLabel(l.type)}
          </span>
        </p>
        <h3 className="line-clamp-2 text-[17px] leading-snug font-semibold text-ink group-hover:text-accent-strong">
          <Link href={`/ilanlar/${l.slug}`} className="after:absolute after:inset-0">
            {l.title}
          </Link>
        </h3>
        {specs.length > 0 && <p className="tabular text-sm text-muted">{specs.join(" · ")}</p>}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-3">
          <span className="tabular text-xl font-bold tracking-tight text-ink">{formatPrice(l.price, l.status)}</span>
          <span className="flex shrink-0 items-center gap-2 text-micro text-muted">
            {l.badge && <span className="font-semibold text-accent-strong">{l.badge}</span>}
            {l.virtualTourUrl && <Video className="size-4" aria-label="Sanal tur var" />}
            <span className="tabular">{l.refNo}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
