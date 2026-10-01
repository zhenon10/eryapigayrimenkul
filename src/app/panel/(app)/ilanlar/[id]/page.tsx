import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Badge, PageHeader } from "@/components/panel/ui";
import { getAgentOptions, getListingForEdit } from "@/lib/panel-queries";
import { ListingForm } from "../listing-form";

export const metadata: Metadata = { title: "İlanı Düzenle" };

export default async function EditListingPage({ params, searchParams }: PageProps<"/panel/ilanlar/[id]">) {
  const data = getListingForEdit(Number((await params).id));
  if (!data) notFound();
  const { listing, images } = data;
  const created = (await searchParams).yeni === "1";

  return (
    <>
      <PageHeader
        title={listing.title}
        back={{ href: "/panel/ilanlar", label: "İlanlar" }}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span className="tabular">{listing.refNo}</span>
            {listing.isPublished ? <Badge tone="success">Yayında</Badge> : <Badge>Taslak</Badge>}
            {created && <Badge tone="accent">İlan oluşturuldu</Badge>}
          </span>
        }
        action={
          listing.isPublished && (
            <Link href={`/ilanlar/${listing.slug}`} target="_blank" className="btn-outline">
              Sitede Gör <ExternalLink className="size-4" aria-hidden />
            </Link>
          )
        }
      />
      <ListingForm listing={listing} images={images} agents={getAgentOptions()} />
    </>
  );
}
