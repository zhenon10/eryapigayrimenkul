import Link from "next/link";
import { Instagram } from "@/components/icons";
import { Suspense } from "react";
import { Calculator, Clock, MapPin, Phone, Search } from "lucide-react";
import { Logo } from "@/components/logo";
import { instagramHref, telHref } from "@/lib/format";
import type { SiteSettings } from "@/lib/settings-schema";
import { MobileNav, NavLinks } from "./nav";

export type NavItem = { href: string; label: string };

export function navItems(s: SiteSettings): NavItem[] {
  return [
    { href: "/", label: "Ana Sayfa" },
    { href: "/satilik", label: "Satılık" },
    { href: "/kiralik", label: "Kiralık" },
    { href: "/satilik/arsa", label: "Arsa" },
    { href: "/satilik/isyeri", label: "İş Yeri" },
    { href: "/danismanlar", label: "Danışmanlar" },
    ...(s.aboutText ? [{ href: "/hakkimizda", label: "Hakkımızda" }] : []),
    { href: "/iletisim", label: "İletişim" },
  ];
}

export function Header({ settings: s }: { settings: SiteSettings }) {
  const items = navItems(s);
  const hasTopBar = s.serviceArea || s.workingHours || s.phone || s.instagram;

  return (
    <header className="sticky top-0 z-50 shadow-[0_1px_8px_rgb(15_23_42/0.04)]">
      {hasTopBar && (
        <div className="hidden bg-ink text-micro text-ink-muted sm:block">
          <div className="container-site flex h-10 items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {s.serviceArea && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-accent-bright" aria-hidden />
                  {s.serviceArea}
                </span>
              )}
              {s.workingHours && (
                <span className="hidden items-center gap-1.5 md:flex">
                  <Clock className="size-3.5 text-accent-bright" aria-hidden />
                  {s.workingHours}
                </span>
              )}
            </div>
            <div className="flex items-center gap-6">
              {s.phone && (
                <a href={telHref(s.phone)} className="flex items-center gap-1.5 transition hover:text-white">
                  <Phone className="size-3.5 text-accent-bright" aria-hidden />
                  <span className="tabular">{s.phone}</span>
                </a>
              )}
              {s.instagram && (
                <a
                  href={instagramHref(s.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden items-center gap-1.5 transition hover:text-white lg:flex"
                >
                  <Instagram className="size-3.5 text-accent-bright" aria-hidden />@{s.instagram.replace(/^@/, "")}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="bg-white/90 backdrop-blur-xl">
        <div className="container-site flex h-20 items-center justify-between gap-4">
          <Link href="/" aria-label={`${s.companyName} ana sayfa`}>
            <Logo />
          </Link>
          <nav aria-label="Ana menü" className="hidden items-center gap-5 xl:flex">
            <Suspense fallback={<NavLinks items={items} static />}>
              <NavLinks items={items} />
            </Suspense>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/ilanlar" className="btn btn-sm hidden bg-panel text-ink hover:bg-line sm:inline-flex">
              <Search className="size-4" aria-hidden />
              İlan Ara
            </Link>
            <Link href="/degerleme" className="btn-accent btn-sm hidden md:inline-flex">
              <Calculator className="size-4" aria-hidden />
              Ücretsiz Değerleme
            </Link>
            <MobileNav items={items} phone={s.phone} whatsapp={s.whatsapp} />
          </div>
        </div>
      </div>
    </header>
  );
}
