import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ListingsView } from "@/components/site/listings-view";
import { PageHero } from "@/components/site/section";
import { DISTRICTS, LISTING_STATUSES, LISTING_TYPES, labelOf } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { PAGE_SIZE, countFor, getLandingCounts, searchListings } from "@/lib/queries";
import {
  absoluteUrl,
  landingDescription,
  landingHeading,
  landingIntro,
  landingPath,
  landingTitle,
  parseLanding,
  typeSeoLabel,
  type Landing,
} from "@/lib/seo";
import { getSettings } from "@/lib/settings";

type Props = PageProps<"/[durum]/[[...filtre]]">;

async function resolve({ params, searchParams }: Props) {
  const { durum, filtre } = await params;
  const landing = parseLanding(durum, filtre);
  if (!landing) notFound();
  const sayfa = Math.max(1, Math.min(1000, Number((await searchParams).sayfa) || 1));
  return { landing, sayfa };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { landing, sayfa } = await resolve(props);
  const count = countFor(getLandingCounts(), landing);
  const path = landingPath(landing);
  return {
    title: sayfa > 1 ? `${landingTitle(landing)} – Sayfa ${sayfa}` : landingTitle(landing),
    description: landingDescription(landing, count, getSettings().companyName),
    alternates: { canonical: sayfa > 1 ? `${path}?sayfa=${sayfa}` : path },
    // İlanı olmayan kombinasyonlar ziyaretçiye açık ama dizine kapalı: boş sayfa SEO'ya zarar verir.
    robots: count === 0 ? { index: false, follow: true } : undefined,
    openGraph: { title: landingTitle(landing), url: path },
  };
}

export default async function LandingPage(props: Props) {
  const { landing: l, sayfa } = await resolve(props);
  const s = getSettings();
  const filters = { durum: l.status, tip: l.type, ilce: l.district, sayfa };
  const result = searchListings(filters);
  const path = landingPath(l);
  const statusLabel = labelOf(LISTING_STATUSES, l.status);

  const crumbs = [
    { name: "Ana Sayfa", path: "/" },
    { name: statusLabel, path: `/${l.status}` },
    ...(l.type
      ? [{ name: `${statusLabel} ${typeSeoLabel(l.type)}`, path: landingPath({ status: l.status, type: l.type }) }]
      : []),
    ...(l.district ? [{ name: labelOf(DISTRICTS, l.district), path }] : []),
  ];

  return (
    <>
      <Breadcrumbs items={crumbs} />
      {result.items.length > 0 && (
        <JsonLd
          data={{
            "@type": "ItemList",
            name: landingHeading(l),
            itemListElement: result.items.map((item, i) => ({
              "@type": "ListItem",
              position: (result.page - 1) * PAGE_SIZE + i + 1,
              url: absoluteUrl(`/ilanlar/${item.slug}`),
            })),
          }}
        />
      )}
      <PageHero eyebrow="Balıkesir Emlak" title={landingHeading(l)} text={landingIntro(l, s.companyName)}>
        <p className="text-micro font-semibold tracking-wide text-accent-bright">{formatNumber(result.total)} ilan</p>
      </PageHero>
      <ListingsView
        filters={filters}
        result={result}
        pageHref={(p) => (p > 1 ? `${path}?sayfa=${p}` : path)}
        hasFilters
      />
      <RelatedLinks landing={l} />
    </>
  );
}

/** İlanı olan komşu sayfalara bağlantılar: hem ziyaretçiye hem arama motoruna site yapısını gösterir. */
function RelatedLinks({ landing: l }: { landing: Landing }) {
  const rows = getLandingCounts();
  const groups: { title: string; links: { href: string; label: string; n: number }[] }[] = [];

  const byDistrict = DISTRICTS.map((d) => ({
    d,
    n: countFor(rows, { status: l.status, type: l.type, district: d.value }),
  }))
    .filter((x) => x.n > 0 && x.d.value !== l.district)
    .map(({ d, n }) => ({
      href: landingPath({ status: l.status, type: l.type, district: d.value }),
      label: d.label,
      n,
    }));
  if (byDistrict.length)
    groups.push({ title: l.type ? `Diğer ilçelerde ${lowerName(l)}` : "İlçelere göre", links: byDistrict });

  const byType = LISTING_TYPES.map((t) => ({
    t,
    n: countFor(rows, { status: l.status, type: t.value, district: l.district }),
  }))
    .filter((x) => x.n > 0 && x.t.value !== l.type)
    .map(({ t, n }) => ({
      href: landingPath({ status: l.status, type: t.value, district: l.district }),
      label: typeSeoLabel(t.value),
      n,
    }));
  if (byType.length)
    groups.push({
      title: l.district ? `${labelOf(DISTRICTS, l.district)} bölgesinde diğer kategoriler` : "Kategorilere göre",
      links: byType,
    });

  const other = l.status === "satilik" ? "kiralik" : "satilik";
  const otherCount = countFor(rows, { ...l, status: other });
  if (otherCount > 0)
    groups.push({
      title: "Diğer ilanlar",
      links: [
        { href: landingPath({ ...l, status: other }), label: landingHeading({ ...l, status: other }), n: otherCount },
      ],
    });

  if (!groups.length) return null;
  return (
    <section aria-label="İlgili aramalar" className="border-t border-line bg-canvas py-12">
      <div className="container-site grid gap-8 md:grid-cols-3">
        {groups.map((g) => (
          <div key={g.title}>
            <h2 className="mb-3 text-micro font-bold tracking-[0.08em] text-muted uppercase">{g.title}</h2>
            <ul className="flex flex-wrap gap-2">
              {g.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-label font-semibold text-ink transition hover:border-ink-muted"
                  >
                    {link.label} <span className="tabular text-micro text-muted">{link.n}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function lowerName(l: Landing) {
  return `${labelOf(LISTING_STATUSES, l.status).toLocaleLowerCase("tr")} ${l.type ? typeSeoLabel(l.type).toLocaleLowerCase("tr") : "ilanlar"}`;
}
