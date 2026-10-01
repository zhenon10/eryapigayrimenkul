import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { JsonLd } from "@/components/json-ld";
import { DISTRICTS } from "@/lib/constants";
import { instagramHref } from "@/lib/format";
import { SITE_URL, absoluteUrl } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import type { SiteSettings } from "@/lib/settings-schema";

/** Yerel aramalar için ofis bilgisi. Panelde girilmemiş alanlar işaretlemeye de eklenmez. */
function agencyLd(s: SiteSettings) {
  const sameAs = [s.instagram && instagramHref(s.instagram), s.facebook].filter(Boolean);
  return {
    "@type": "RealEstateAgent",
    "@id": `${SITE_URL}/#ofis`,
    name: s.companyName,
    url: SITE_URL,
    logo: absoluteUrl("/opengraph-image.png"),
    image: absoluteUrl("/opengraph-image.png"),
    ...(s.heroText ? { description: s.heroText } : {}),
    ...(s.phone ? { telephone: s.phone } : {}),
    ...(s.email ? { email: s.email } : {}),
    ...(s.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: s.address,
            addressRegion: "Balıkesir",
            addressCountry: "TR",
          },
        }
      : {}),
    ...(s.mapsLink ? { hasMap: s.mapsLink } : {}),
    areaServed: [
      { "@type": "AdministrativeArea", name: "Balıkesir" },
      ...DISTRICTS.map((d) => ({ "@type": "City", name: `${d.label}, Balıkesir` })),
    ],
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export default function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = getSettings();
  return (
    <>
      <a
        href="#icerik"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        İçeriğe geç
      </a>
      <JsonLd data={agencyLd(settings)} />
      <Header settings={settings} />
      <main id="icerik" className="flex flex-1 flex-col">
        {children}
      </main>
      <Footer settings={settings} />
    </>
  );
}
