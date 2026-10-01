import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Check, ExternalLink, MapPin, Phone, PlayCircle, Video } from "lucide-react";
import { WhatsApp } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { AgentAvatar } from "@/components/site/agent-card";
import { Gallery } from "@/components/site/gallery";
import { InquiryForm } from "@/components/site/inquiry-form";
import { ListingCard } from "@/components/site/listing-card";
import { RemovedListingView } from "@/components/site/removed-listing";
import { DISTRICTS, LISTING_STATUSES, LISTING_TYPES, isLandType, labelOf, type District, type ListingType } from "@/lib/constants";
import { formatDate, formatNumber, formatPrice, telHref, whatsappHref } from "@/lib/format";
import { mediaUrl } from "@/lib/media-url";
import { getListingBySlug, getSimilarListings, resolveMissingListing } from "@/lib/queries";
import { absoluteUrl, landingPath, typeSeoLabel } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export const revalidate = 3600;

// Sayfalar ilk istekte üretilir ve önbelleğe alınır; panelden yapılan değişiklikler önbelleği tazeler.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/ilanlar/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const listing = getListingBySlug(slug);
  if (!listing) {
    const missing = resolveMissingListing(slug);
    if (missing?.kind !== "removed") return {};
    return { title: `${missing.listing.title} – Yayından Kaldırıldı`, robots: { index: false, follow: true } };
  }
  const cover = listing.images[0];
  // Başlık konum ve tipi de içersin: "… – Altıeylül Kiralık Daire" aramalarla eşleşir.
  const where = `${labelOf(DISTRICTS, listing.district)} ${labelOf(LISTING_STATUSES, listing.status)} ${typeSeoLabel(listing.type)}`;
  return {
    title: `${listing.title} – ${where}`,
    description: (listing.summary || listing.description).slice(0, 160),
    alternates: { canonical: `/ilanlar/${listing.slug}` },
    openGraph: {
      type: "article",
      title: listing.title,
      images: cover ? [{ url: mediaUrl(cover.key, "lg"), width: cover.width, height: cover.height }] : [],
    },
  };
}

export default async function ListingPage({ params }: PageProps<"/ilanlar/[slug]">) {
  const { slug } = await params;
  const l = getListingBySlug(slug);
  if (!l) {
    const missing = resolveMissingListing(slug);
    if (missing?.kind === "redirect") permanentRedirect(`/ilanlar/${missing.slug}`);
    if (missing?.kind === "removed") return <RemovedListingView listing={missing.listing} />;
    notFound();
  }
  const s = getSettings();
  const similar = getSimilarListings(l);
  const land = isLandType(l.type);
  const district = labelOf(DISTRICTS, l.district);
  const location = [l.neighborhood, district, "Balıkesir"].filter(Boolean).join(", ");

  const specs: [string, string | number | null][] = [
    ["İlan No", l.refNo],
    ["Durum", labelOf(LISTING_STATUSES, l.status)],
    ["Tip", labelOf(LISTING_TYPES, l.type)],
    ["Brüt Alan", l.areaGross ? `${formatNumber(l.areaGross)} m²` : null],
    ["Net Alan", l.areaNet ? `${formatNumber(l.areaNet)} m²` : null],
    ...(land
      ? ([
          ["İmar Durumu", l.zoning],
          ["Ada / Parsel", l.parcel],
        ] as [string, string][])
      : ([
          ["Oda Sayısı", l.rooms],
          ["Banyo", l.bathrooms],
          ["Bulunduğu Kat", l.floor],
          ["Bina Yaşı", l.buildingAge != null ? (l.buildingAge === 0 ? "Sıfır" : String(l.buildingAge)) : null],
          ["Isıtma", l.heating],
        ] as [string, string | number | null][])),
    ["Tapu Durumu", l.deedStatus],
    ["Güncellenme", formatDate(l.updatedAt)],
  ];
  const visibleSpecs = specs.filter(([, v]) => v !== null && v !== "");

  const contactPhone = l.agent?.phone || s.phone;
  const contactWhatsapp = l.agent?.whatsapp || s.whatsapp;
  const waText = `Merhaba, ${l.refNo} numaralı "${l.title}" ilanı hakkında bilgi almak istiyorum.`;

  const url = absoluteUrl(`/ilanlar/${l.slug}`);
  const statusLabel = labelOf(LISTING_STATUSES, l.status);
  const listingLd = {
    "@type": "RealEstateListing",
    name: l.title,
    description: l.summary || l.description,
    url,
    datePosted: l.createdAt.toISOString(),
    dateModified: l.updatedAt.toISOString(),
    image: l.images.map((i) => absoluteUrl(mediaUrl(i.key, "lg"))),
    offers: {
      "@type": "Offer",
      price: l.price,
      priceCurrency: "TRY",
      businessFunction: l.status === "kiralik" ? "http://purl.org/goodrelations/v1#LeaseOut" : "http://purl.org/goodrelations/v1#Sell",
      availability: "https://schema.org/InStock",
      url,
    },
    contentLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: district,
        addressRegion: "Balıkesir",
        addressCountry: "TR",
        ...(l.neighborhood ? { streetAddress: l.neighborhood } : {}),
      },
      ...(l.lat != null && l.lng != null ? { geo: { "@type": "GeoCoordinates", latitude: l.lat, longitude: l.lng } } : {}),
    },
    ...(l.areaGross ? { floorSize: { "@type": "QuantitativeValue", value: l.areaGross, unitCode: "MTK" } } : {}),
  };

  return (
    <>
      <JsonLd data={listingLd} />
      <Breadcrumbs
        items={[
          { name: "Ana Sayfa", path: "/" },
          { name: statusLabel, path: `/${l.status}` },
          { name: `${statusLabel} ${typeSeoLabel(l.type)}`, path: landingPath({ status: l.status, type: l.type as ListingType }) },
          { name: district, path: landingPath({ status: l.status, type: l.type as ListingType, district: l.district as District }) },
          { name: l.title, path: `/ilanlar/${l.slug}` },
        ]}
      />

      <div className="container-site grid gap-10 py-10 lg:grid-cols-12">
        <div className="flex flex-col gap-10 lg:col-span-8">
          <Gallery images={l.images} title={l.title} />

          <header className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-ink px-3 py-1 text-micro font-semibold text-white">
                {labelOf(LISTING_STATUSES, l.status)} {labelOf(LISTING_TYPES, l.type)}
              </span>
              {l.badge && (
                <span className="rounded-full bg-accent-tint px-3 py-1 text-micro font-bold text-accent-strong">{l.badge}</span>
              )}
              <span className="tabular text-micro text-muted">İlan No: {l.refNo}</span>
            </div>
            <h1 className="font-display text-headline-md font-semibold md:text-headline">{l.title}</h1>
            <p className="flex items-center gap-1.5 text-sm text-muted">
              <MapPin className="size-4 text-accent" aria-hidden /> {location}
            </p>
            {l.summary && <p className="text-[17px] leading-7 text-ink/85">{l.summary}</p>}
          </header>

          <section aria-labelledby="ozellikler">
            <h2 id="ozellikler" className="mb-4 font-display text-headline-sm font-semibold">İlan bilgileri</h2>
            <dl className="grid overflow-hidden rounded-lg border border-line sm:grid-cols-2">
              {visibleSpecs.map(([k, v]) => (
                <div key={k} className="-mb-px flex justify-between gap-4 border-b border-line px-4 py-3 text-sm sm:odd:border-r">
                  <dt className="text-muted">{k}</dt>
                  <dd className="tabular text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {l.description && (
            <section aria-labelledby="aciklama">
              <h2 id="aciklama" className="mb-4 font-display text-headline-sm font-semibold">Açıklama</h2>
              <div className="prose-text">{l.description}</div>
            </section>
          )}

          {l.features.length > 0 && (
            <section aria-labelledby="donanim">
              <h2 id="donanim" className="mb-4 font-display text-headline-sm font-semibold">Özellikler</h2>
              <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2 md:grid-cols-3">
                {l.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 shrink-0 text-accent" aria-hidden /> {f}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(l.virtualTourUrl || l.videoUrl) && (
            <section className="flex flex-wrap gap-3">
              {l.virtualTourUrl && (
                <a href={l.virtualTourUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">
                  <Video className="size-4" aria-hidden /> Sanal Tur <ExternalLink className="size-3.5" aria-hidden />
                </a>
              )}
              {l.videoUrl && (
                <a href={l.videoUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">
                  <PlayCircle className="size-4" aria-hidden /> Video <ExternalLink className="size-3.5" aria-hidden />
                </a>
              )}
            </section>
          )}

          {l.lat != null && l.lng != null && (
            <section aria-labelledby="konum">
              <h2 id="konum" className="mb-4 font-display text-headline-sm font-semibold">Konum</h2>
              <div className="overflow-hidden rounded-xl border border-line">
                <iframe
                  title={`${l.title} konumu`}
                  loading="lazy"
                  className="h-80 w-full"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${l.lng - 0.01},${l.lat - 0.006},${l.lng + 0.01},${l.lat + 0.006}&layer=mapnik&marker=${l.lat},${l.lng}`}
                />
              </div>
              <p className="mt-2 text-micro text-muted">Konum yaklaşık olarak gösterilmektedir.</p>
            </section>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="flex flex-col gap-6 lg:sticky lg:top-36">
            <div className="card flex flex-col gap-5 p-6">
              <div>
                <span className="text-micro font-bold tracking-[0.08em] text-muted uppercase">
                  {l.status === "kiralik" ? "Aylık Kira" : "Satış Fiyatı"}
                </span>
                <p className="tabular text-[1.75rem] font-extrabold tracking-tight">{formatPrice(l.price, l.status)}</p>
              </div>
              {l.agent && (
                <Link href={`/danismanlar/${l.agent.slug}`} className="flex items-center gap-3 rounded-lg bg-canvas p-3 hover:bg-panel">
                  <AgentAvatar agent={l.agent} />
                  <span className="flex flex-col">
                    <span className="font-bold">{l.agent.name}</span>
                    <span className="text-micro text-muted">{l.agent.title || "Gayrimenkul Danışmanı"}</span>
                  </span>
                </Link>
              )}
              <div className="flex flex-col gap-2">
                {contactWhatsapp && (
                  <a
                    href={whatsappHref(contactWhatsapp, waText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-accent min-h-12 text-[15px] font-bold"
                  >
                    <WhatsApp className="size-5" aria-hidden /> WhatsApp&apos;tan sor
                  </a>
                )}
                {contactPhone && (
                  <a href={telHref(contactPhone)} className="btn-outline">
                    <Phone className="size-4" aria-hidden /> <span className="tabular">{contactPhone}</span>
                  </a>
                )}
                {!contactWhatsapp && !contactPhone && (
                  <a href="#bilgi-al" className="btn-accent">
                    Bilgi iste
                  </a>
                )}
              </div>
            </div>

            <div id="bilgi-al" className="card p-6">
              <h2 className="mb-1 font-display text-headline-sm font-semibold">Bilgi alın</h2>
              <p className="mb-5 text-sm text-muted">Bu ilanla ilgili sorularınız için bilgilerinizi bırakın.</p>
              <InquiryForm
                kind="ilan"
                listingId={l.id}
                compact
                submitLabel="Bilgi İste"
                defaultMessage={`${l.refNo} numaralı ilan hakkında bilgi almak istiyorum.`}
                kvkkLink={!!s.kvkkText}
              />
            </div>
          </div>
        </aside>
      </div>

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

      {(contactWhatsapp || contactPhone) && (
        // Mobilde sabit iletişim çubuğu: WhatsApp birincil, telefon ikincil.
        <div className="sticky bottom-0 z-30 border-t border-line bg-white/95 p-3 backdrop-blur lg:hidden">
          <div className="flex gap-2">
            {contactPhone && (
              <a href={telHref(contactPhone)} className="btn-outline shrink-0 px-4" aria-label={`Ara: ${contactPhone}`}>
                <Phone className="size-4" aria-hidden /> Ara
              </a>
            )}
            {contactWhatsapp ? (
              <a
                href={whatsappHref(contactWhatsapp, waText)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent flex-1 font-bold"
              >
                <WhatsApp className="size-5" aria-hidden /> WhatsApp&apos;tan sor
              </a>
            ) : (
              <a href="#bilgi-al" className="btn-accent flex-1">
                Bilgi iste
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
