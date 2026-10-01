import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/queries";

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const { listings, agents } = getSitemapEntries();
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/ilanlar`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/danismanlar`, changeFrequency: "monthly" },
    { url: `${base}/degerleme`, changeFrequency: "yearly" },
    { url: `${base}/iletisim`, changeFrequency: "yearly" },
    ...listings.map((l) => ({ url: `${base}/ilanlar/${l.slug}`, lastModified: l.updatedAt, priority: 0.8 })),
    ...agents.map((a) => ({ url: `${base}/danismanlar/${a.slug}`, lastModified: a.updatedAt })),
  ];
}
