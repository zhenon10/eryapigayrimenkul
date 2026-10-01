import Link from "next/link";
import { Instagram, WhatsApp } from "@/components/icons";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/logo";
import { DISTRICTS, LISTING_TYPES } from "@/lib/constants";
import { countFor, getLandingCounts } from "@/lib/queries";
import { landingHeading, landingPath, type Landing } from "@/lib/seo";
import { instagramHref, telHref, whatsappHref } from "@/lib/format";
import type { SiteSettings } from "@/lib/settings-schema";

const FEATURED_DISTRICTS = ["karesi", "altieylul", "edremit", "ayvalik", "burhaniye", "bandirma"];

/** İlanı bulunan en dolu kategori ve ilçe sayfaları; iç bağlantı ağını güçlendirir. */
function popularSearches() {
  const rows = getLandingCounts();
  const candidates: (Landing & { n: number })[] = [];
  for (const status of ["satilik", "kiralik"] as const) {
    for (const t of LISTING_TYPES) candidates.push({ status, type: t.value, n: countFor(rows, { status, type: t.value }) });
    for (const d of DISTRICTS) candidates.push({ status, district: d.value, n: countFor(rows, { status, district: d.value }) });
  }
  return candidates
    .filter((c) => c.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 12)
    .map((c) => ({ href: landingPath(c), label: landingHeading(c).replace(/ İlanları$/, "") }));
}

export function Footer({ settings: s }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  const popular = popularSearches();
  return (
    <footer className="mt-auto bg-ink text-ink-muted">
      <div className="container-site grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:gap-12 md:py-16 lg:grid-cols-12">
        <div className="col-span-2 flex flex-col gap-5 lg:col-span-4">
          <Logo tone="light" />
          {s.heroText && <p className="max-w-sm text-sm leading-6">{s.heroText}</p>}
          {s.licenseNo && <p className="text-micro tracking-wide">Yetki Belge No: {s.licenseNo}</p>}
        </div>

        <FooterCol title="Portföy" className="lg:col-span-2">
          <FooterLink href="/satilik">Satılık ilanlar</FooterLink>
          <FooterLink href="/kiralik">Kiralık ilanlar</FooterLink>
          <FooterLink href="/satilik/arsa">Satılık arsa</FooterLink>
          <FooterLink href="/satilik/isyeri">Satılık iş yeri</FooterLink>
          <FooterLink href="/kiralik/isyeri">Kiralık iş yeri</FooterLink>
          <FooterLink href="/degerleme">Ücretsiz değerleme</FooterLink>
        </FooterCol>

        <FooterCol title="Bölgeler" className="lg:col-span-2">
          {DISTRICTS.filter((d) => FEATURED_DISTRICTS.includes(d.value)).map((d) => (
            <FooterLink key={d.value} href={`/satilik/${d.value}`}>
              {d.label}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="İletişim" className="col-span-2 lg:col-span-4">
          {s.address && (
            <span className="flex gap-2.5 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent-bright" aria-hidden />
              {s.address}
            </span>
          )}
          {s.phone && (
            <a href={telHref(s.phone)} className="flex items-center gap-2.5 text-sm hover:text-white">
              <Phone className="size-4 text-accent-bright" aria-hidden />
              <span className="tabular">{s.phone}</span>
            </a>
          )}
          {s.whatsapp && (
            <a
              href={whatsappHref(s.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-sm hover:text-white"
            >
              <WhatsApp className="size-4 text-accent-bright" aria-hidden />
              WhatsApp ile yazın
            </a>
          )}
          {s.email && (
            <a href={`mailto:${s.email}`} className="flex items-center gap-2.5 text-sm hover:text-white">
              <Mail className="size-4 text-accent-bright" aria-hidden />
              {s.email}
            </a>
          )}
          {s.instagram && (
            <a
              href={instagramHref(s.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-sm hover:text-white"
            >
              <Instagram className="size-4 text-accent-bright" aria-hidden />@{s.instagram.replace(/^@/, "")}
            </a>
          )}
        </FooterCol>
      </div>
      {popular.length > 0 && (
        <div className="border-t border-white/10">
          <nav aria-label="Popüler aramalar" className="container-site flex flex-wrap gap-x-5 gap-y-2 py-6 text-micro">
            <span className="font-bold tracking-[0.08em] text-white uppercase">Popüler aramalar</span>
            {popular.map((p) => (
              <Link key={p.href} href={p.href} className="hover:text-white">
                {p.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-3 py-6 text-micro sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} {s.companyName}. Tüm hakları saklıdır.
          </span>
          <span className="flex gap-5">
            {s.kvkkText && (
              <Link href="/kvkk" className="hover:text-white">
                KVKK Aydınlatma Metni
              </Link>
            )}
            {s.privacyText && (
              <Link href="/gizlilik" className="hover:text-white">
                Gizlilik Politikası
              </Link>
            )}
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <h2 className="mb-5 text-micro font-bold tracking-[0.08em] text-white uppercase">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm transition hover:text-white">
      {children}
    </Link>
  );
}
