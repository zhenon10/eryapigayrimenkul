import type { MetadataRoute } from "next";
import { DISTRICTS, LISTING_STATUSES, LISTING_TYPES } from "@/lib/constants";
import { countFor, getLandingCounts, getSitemapEntries } from "@/lib/queries";
import { SITE_URL, landingPath, type Landing } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export const revalidate = 3600;

/** Yalnızca en az bir yayında ilanı olan bölge/kategori sayfaları. */
function landingEntries(): MetadataRoute.Sitemap {
  const rows = getLandingCounts();
  const landings: Landing[] = [];
  for (const { value: status } of LISTING_STATUSES) {
    landings.push({ status });
    for (const { value: type } of LISTING_TYPES) {
      landings.push({ status, type });
      for (const { value: district } of DISTRICTS) landings.push({ status, type, district });
    }
    for (const { value: district } of DISTRICTS) landings.push({ status, district });
  }
  return landings
    .filter((l) => countFor(rows, l) > 0)
    .map((l) => ({
      url: `${SITE_URL}${landingPath(l)}`,
      changeFrequency: "daily" as const,
      priority: l.district && l.type ? 0.6 : 0.8,
    }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.NODE_ENV === "production" && !process.env.SITE_URL)
    console.warn("[sitemap] SITE_URL tanımlı değil; sitemap adresleri localhost olarak üretiliyor.");

  const s = getSettings();
  const { listings, agents } = getSitemapEntries();
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    ...landingEntries(),
    { url: `${SITE_URL}/danismanlar`, changeFrequency: "monthly" },
    { url: `${SITE_URL}/degerleme`, changeFrequency: "yearly" },
    { url: `${SITE_URL}/iletisim`, changeFrequency: "yearly" },
    ...(s.aboutText ? [{ url: `${SITE_URL}/hakkimizda`, changeFrequency: "yearly" as const }] : []),
    ...listings.map((l) => ({ url: `${SITE_URL}/ilanlar/${l.slug}`, lastModified: l.updatedAt, priority: 0.7 })),
    ...agents.map((a) => ({ url: `${SITE_URL}/danismanlar/${a.slug}`, lastModified: a.updatedAt })),
  ];
}
