import Link from "next/link";
import { ArchiveX, ArrowRight } from "lucide-react";
import { ListingCard } from "@/components/site/listing-card";
import { DISTRICTS, LISTING_STATUSES, labelOf, type District, type ListingType } from "@/lib/constants";
import { getSimilarListings, type RemovedListing } from "@/lib/queries";
import { landingHeading, landingPath, typeSeoLabel } from "@/lib/seo";

/**
 * Bir zamanlar yayında olan ilanın adresi: ziyaretçiyi boş bir 404 yerine benzer ilanlara
 * ve ilgili bölge sayfasına yönlendirir. Sayfa noindex'tir (generateMetadata).
 */
export function RemovedListingView({ listing: l }: { listing: RemovedListing }) {
  const similar = getSimilarListings({ id: 0, type: l.type, district: l.district, status: l.status }, 6);
  const landing = { status: l.status, type: l.type as ListingType, district: l.district as District };
  const district = labelOf(DISTRICTS, l.district);

  return (
    <>
      <section className="container-site flex flex-col items-center gap-5 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-accent-tint text-accent-strong">
          <ArchiveX className="size-7" aria-hidden />
        </span>
        <span className="tabular text-label font-semibold text-muted">İlan No: {l.refNo}</span>
        <h1 className="max-w-2xl font-display text-headline-md font-semibold">Bu ilan yayından kaldırıldı</h1>
        <p className="max-w-xl text-muted">
          <strong className="text-ink">{l.title}</strong> ({[l.neighborhood, district].filter(Boolean).join(", ")} ·{" "}
          {labelOf(LISTING_STATUSES, l.status)} {typeSeoLabel(l.type)}) artık portföyümüzde bulunmuyor. Benzer ilanlara göz
          atabilir ya da aradığınız mülkü bize bildirebilirsiniz.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={landingPath(landing)} className="btn-primary">
            {landingHeading(landing)} <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href="/iletisim" className="btn-outline">
            Talep Bırak
          </Link>
        </div>
      </section>
      {similar.length > 0 && (
        <section className="bg-canvas py-16">
          <div className="container-site flex flex-col gap-8">
            <h2 className="font-display text-headline-md font-semibold">Benzer ilanlar</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {similar.map((x) => (
                <ListingCard key={x.id} listing={x} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
