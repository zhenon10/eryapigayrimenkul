import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock, MapPin, Navigation, Phone } from "lucide-react";
import { Instagram } from "@/components/icons";
import { MediaImage } from "@/components/media-image";
import { AgentCard } from "@/components/site/agent-card";
import { HeroSearch } from "@/components/site/hero-search";
import { InquiryForm } from "@/components/site/inquiry-form";
import { ListingCard } from "@/components/site/listing-card";
import { SectionHeading } from "@/components/site/section";
import { instagramHref, telHref } from "@/lib/format";
import { getMedia } from "@/lib/media";
import { getAgents, getFeaturedListings } from "@/lib/queries";
import { getSettings } from "@/lib/settings";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: "Er Yapı Emlak | Balıkesir Satılık ve Kiralık Emlak İlanları" },
  description:
    "Balıkesir Karesi, Altıeylül, Edremit ve Ayvalık'ta satılık ve kiralık daire, villa, arsa ve iş yeri ilanları. Ücretsiz değerleme için Er Yapı Emlak'a ulaşın.",
  alternates: { canonical: "/" },
};

const CATEGORY_LINKS = [
  { href: "/satilik/daire", label: "Satılık daire" },
  { href: "/kiralik/daire", label: "Kiralık daire" },
  { href: "/satilik/villa", label: "Satılık villa" },
  { href: "/satilik/arsa", label: "Satılık arsa" },
  { href: "/kiralik/isyeri", label: "Kiralık iş yeri" },
];

export default function HomePage() {
  const s = getSettings();
  const heroImage = s.heroImageId ? getMedia(s.heroImageId) : null;
  const listings = getFeaturedListings(6);
  const agents = getAgents().slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        {heroImage && (
          <div className="absolute inset-0 opacity-50 mix-blend-luminosity" aria-hidden>
            <MediaImage image={heroImage} alt="" sizes="100vw" priority className="size-full object-cover" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/30" aria-hidden />

        <div className="container-site relative flex flex-col gap-8 pt-16 pb-16 md:pt-20 md:pb-20">
          <div className="flex max-w-3xl flex-col gap-4">
            <h1 className="font-display text-[2.25rem] leading-[1.12] font-semibold text-balance md:text-[3rem]">{s.heroTitle}</h1>
            {s.heroText && <p className="max-w-2xl text-[17px] leading-relaxed text-white/75">{s.heroText}</p>}
            {s.licenseNo && (
              <p className="flex items-center gap-1.5 text-micro text-ink-muted">
                <BadgeCheck className="size-4 text-accent-bright" aria-hidden />
                Taşınmaz Ticareti Yetki Belge No: {s.licenseNo}
              </p>
            )}
          </div>

          {s.stats.length > 0 && (
            <dl className="flex flex-wrap gap-x-8 gap-y-3 divide-white/15 text-sm sm:divide-x">
              {s.stats.map((stat) => (
                <div key={stat.label} className="flex items-baseline gap-2 sm:pl-8 sm:first:pl-0">
                  <dd className="tabular text-xl font-bold">{stat.value}</dd>
                  <dt className="text-ink-muted">{stat.label}</dt>
                </div>
              ))}
            </dl>
          )}

          <HeroSearch />
        </div>
      </section>

      <section id="ilanlar" className="container-site flex flex-col gap-8 py-16 md:py-20">
        <SectionHeading title="Öne çıkan ilanlar">
          <Link href="/ilanlar" className="text-link self-start md:self-end">
            Tüm ilanlar <ArrowRight className="size-4" aria-hidden />
          </Link>
        </SectionHeading>
        <nav aria-label="Kategoriler" className="-mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
          {CATEGORY_LINKS.map((c) => (
            <Link key={c.href} href={c.href} className="hover:text-ink hover:underline hover:underline-offset-4">
              {c.label}
            </Link>
          ))}
        </nav>

        {listings.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((l, i) => (
              <ListingCard key={l.id} listing={l} priority={i === 0} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-canvas p-10 text-center text-muted">Yakında yeni ilanlar eklenecek.</p>
        )}
      </section>

      <section className="border-y border-line bg-canvas py-16 md:py-20">
        <div className="container-site grid items-start gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-5 lg:pt-2">
            <h2 className="font-display text-headline-md font-semibold">Evinizi satmak ya da kiraya vermek mi istiyorsunuz?</h2>
            <p className="leading-7 text-muted">
              Mülkünüzün bulunduğu bölgedeki güncel satış ve kira ilanlarına bakarak size gerçekçi bir fiyat aralığı söyleyelim.
              Değerleme ücretsizdir; sonrasında bizimle çalışma zorunluluğunuz yoktur.
            </p>
            <Link href="/degerleme" className="text-link self-start">
              Değerleme nasıl yapılıyor? <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="card p-6 md:p-8 lg:col-span-7">
            <InquiryForm
              kind="degerleme"
              submitLabel="Değerleme talebi gönder"
              messagePlaceholder="Oda sayısı, yaklaşık m², kat bilgisi vb."
              kvkkLink={!!s.kvkkText}
            />
          </div>
        </div>
      </section>

      {agents.length > 0 && (
        <section className="container-site flex flex-col gap-8 py-16 md:py-20">
          <SectionHeading title="Danışmanlarımız">
            <Link href="/danismanlar" className="text-link self-start md:self-end">
              Tüm danışmanlar <ArrowRight className="size-4" aria-hidden />
            </Link>
          </SectionHeading>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((a) => (
              <AgentCard key={a.id} agent={a} />
            ))}
          </div>
        </section>
      )}

      {(s.address || s.mapEmbedUrl) && (
        <section className="border-t border-line bg-canvas py-16 md:py-20">
          <div className="container-site grid gap-8 lg:grid-cols-12">
            <div className="flex flex-col gap-6 lg:col-span-5">
              <h2 className="font-display text-headline-md font-semibold">Ofisimiz</h2>
              <ul className="flex flex-col gap-4 text-[15px]">
                {s.address && (
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden /> {s.address}
                  </li>
                )}
                {s.workingHours && (
                  <li className="flex gap-3">
                    <Clock className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden /> {s.workingHours}
                  </li>
                )}
                {s.phone && (
                  <li>
                    <a href={telHref(s.phone)} className="flex gap-3 font-semibold hover:text-accent-strong">
                      <Phone className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden /> <span className="tabular">{s.phone}</span>
                    </a>
                  </li>
                )}
                {s.instagram && (
                  <li>
                    <a
                      href={instagramHref(s.instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-3 font-semibold hover:text-accent-strong"
                    >
                      <Instagram className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden /> @{s.instagram.replace(/^@/, "")}
                    </a>
                  </li>
                )}
              </ul>
              <div className="flex flex-wrap gap-3">
                {s.mapsLink && (
                  <a href={s.mapsLink} target="_blank" rel="noopener noreferrer" className="btn-primary">
                    <Navigation className="size-4" aria-hidden /> Yol tarifi al
                  </a>
                )}
                <Link href="/iletisim" className="btn-outline">
                  İletişim
                </Link>
              </div>
            </div>
            {s.mapEmbedUrl && (
              <div className="min-h-80 overflow-hidden rounded-lg border border-line lg:col-span-7">
                <iframe
                  src={s.mapEmbedUrl}
                  title="Ofis konumu"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="size-full min-h-80"
                />
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
