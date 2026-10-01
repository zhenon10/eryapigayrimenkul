import Link from "next/link";
import { Instagram } from "@/components/icons";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Logo } from "@/components/logo";
import { DISTRICTS } from "@/lib/constants";
import { instagramHref, telHref, whatsappHref } from "@/lib/format";
import type { SiteSettings } from "@/lib/settings-schema";

const FEATURED_DISTRICTS = ["karesi", "altieylul", "edremit", "ayvalik", "burhaniye", "bandirma"];

export function Footer({ settings: s }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-ink text-ink-muted">
      <div className="container-site grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12">
        <div className="flex flex-col gap-5 lg:col-span-4">
          <Logo tone="light" />
          {s.heroText && <p className="max-w-sm text-sm leading-6">{s.heroText}</p>}
          {s.licenseNo && <p className="text-micro tracking-wide">Yetki Belge No: {s.licenseNo}</p>}
        </div>

        <FooterCol title="Portföy" className="lg:col-span-2">
          <FooterLink href="/ilanlar?durum=satilik">Satılık İlanlar</FooterLink>
          <FooterLink href="/ilanlar?durum=kiralik">Kiralık İlanlar</FooterLink>
          <FooterLink href="/ilanlar?kategori=arsa">Arsa & Tarla</FooterLink>
          <FooterLink href="/ilanlar?kategori=ticari">Ticari Gayrimenkul</FooterLink>
          <FooterLink href="/degerleme">Ücretsiz Değerleme</FooterLink>
        </FooterCol>

        <FooterCol title="Bölgeler" className="lg:col-span-2">
          {DISTRICTS.filter((d) => FEATURED_DISTRICTS.includes(d.value)).map((d) => (
            <FooterLink key={d.value} href={`/ilanlar?ilce=${d.value}`}>
              {d.label}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="İletişim" className="lg:col-span-4">
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
              <MessageCircle className="size-4 text-accent-bright" aria-hidden />
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
