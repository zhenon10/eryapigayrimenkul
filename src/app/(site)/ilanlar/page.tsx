import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { ListingsView } from "@/components/site/listings-view";
import { PageHero } from "@/components/site/section";
import { DISTRICTS, LISTING_STATUSES, LISTING_TYPES, TYPE_GROUPS, labelOf } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { searchListings, searchSchema, type SearchFilters } from "@/lib/queries";
import { landingPath } from "@/lib/seo";

function describe(f: SearchFilters) {
  const parts = [
    f.ilce && labelOf(DISTRICTS, f.ilce),
    f.durum && labelOf(LISTING_STATUSES, f.durum),
    f.tip ? labelOf(LISTING_TYPES, f.tip) : f.kategori && labelOf(TYPE_GROUPS, f.kategori),
  ].filter(Boolean);
  return parts.length ? `${parts.join(" ")} İlanları` : "Tüm İlanlar";
}

/**
 * Sadece durum/tip/ilçe seçilmişse karşılığı olan bölge sayfası vardır (ör. /kiralik/daire/altieylul).
 * Fiyat, kelime, sıralama gibi filtreler içeren adresler arama motorlarına kapalı tutulur.
 */
function landingFor(f: SearchFilters) {
  const extra = f.kategori || f.min || f.max || f.oda || f.q || f.sirala;
  if (!f.durum || extra) return null;
  return landingPath({ status: f.durum, type: f.tip, district: f.ilce });
}

export async function generateMetadata({ searchParams }: PageProps<"/ilanlar">): Promise<Metadata> {
  const f = searchSchema.parse(await searchParams);
  const hasFilters = Object.values(f).some((v) => v != null && v !== "");
  return {
    title: `${describe(f)} – Balıkesir`,
    description: "Balıkesir ve ilçelerinde satılık ve kiralık daire, villa, arsa ve iş yeri ilanları.",
    alternates: { canonical: "/ilanlar" },
    robots: hasFilters ? { index: false, follow: true } : undefined,
  };
}

export default async function ListingsPage({ searchParams }: PageProps<"/ilanlar">) {
  const raw = await searchParams;
  const f = searchSchema.parse(raw);

  const landing = landingFor(f);
  if (landing) permanentRedirect(f.sayfa && f.sayfa > 1 ? `${landing}?sayfa=${f.sayfa}` : landing);

  const result = searchListings(f);
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(f)) if (v != null && k !== "sayfa") params.set(k, String(v));
    if (page > 1) params.set("sayfa", String(page));
    const qs = params.toString();
    return qs ? `/ilanlar?${qs}` : "/ilanlar";
  };

  return (
    <>
      <PageHero eyebrow="Portföy" title={describe(f)} text={`${formatNumber(result.total)} ilan listeleniyor.`} />
      <ListingsView filters={f} result={result} pageHref={pageHref} hasFilters={Object.keys(raw).length > 0} />
    </>
  );
}
