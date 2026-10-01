"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Calculator, Menu, Phone, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { telHref, whatsappHref } from "@/lib/format";
import { WhatsApp } from "@/components/icons";
import type { NavItem } from "./header";

function useIsActive() {
  const pathname = usePathname();
  const params = useSearchParams();
  return (href: string) => {
    const url = new URL(href, "http://x");
    if (url.pathname !== pathname) {
      // Alt sayfalar (ör. /danismanlar/ahmet) üst menü öğesini aktif tutar.
      return url.pathname !== "/" && !url.search && pathname.startsWith(`${url.pathname}/`);
    }
    for (const [k, v] of url.searchParams) if (params.get(k) !== v) return false;
    return true;
  };
}

function ActiveLinks({ items, className, onNavigate }: { items: NavItem[]; className: string; onNavigate?: () => void }) {
  const isActive = useIsActive();
  return items.map((item) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          className,
          active ? "font-bold text-accent-strong underline decoration-2 underline-offset-8" : "text-muted hover:text-ink",
        )}
      >
        {item.label}
      </Link>
    );
  });
}

export function NavLinks({ items, static: isStatic }: { items: NavItem[]; static?: boolean }) {
  const cls = "py-2 text-label font-semibold transition";
  if (isStatic)
    return items.map((item) => (
      <Link key={item.href} href={item.href} className={cn(cls, "text-muted hover:text-ink")}>
        {item.label}
      </Link>
    ));
  return <ActiveLinks items={items} className={cls} />;
}

export function MobileNav({ items, phone, whatsapp }: { items: NavItem[]; phone: string; whatsapp: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="flex items-center gap-2 xl:hidden">
      {whatsapp ? (
        <a
          href={whatsappHref(whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp ile yazın"
          className="btn btn-sm border border-line px-2.5 text-ink"
        >
          <WhatsApp className="size-5" />
        </a>
      ) : (
        phone && (
          <a href={telHref(phone)} aria-label={`Ara: ${phone}`} className="btn btn-sm border border-line px-2.5 text-ink">
            <Phone className="size-5" />
          </a>
        )
      )}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="Menüyü aç"
        className="btn btn-sm border border-line px-2.5"
      >
        <Menu className="size-5" />
      </button>
      {/* Üst bardaki backdrop-filter sabit konumlu öğeleri kendi kutusuna hapsettiği için
          menü doğrudan <body> altına çizilir. */}
      {open &&
        createPortal(
          <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menü" className="fixed inset-0 z-[60] overflow-y-auto bg-white">
            <div className="container-site flex h-20 items-center justify-between border-b border-line">
              <span className="font-display text-headline-sm font-semibold">Menü</span>
              <button type="button" onClick={close} aria-label="Menüyü kapat" className="btn btn-sm border border-line px-2.5">
                <X className="size-5" />
              </button>
            </div>
            <nav aria-label="Mobil menü" className="container-site flex flex-col py-4">
              <ActiveLinks items={items} onNavigate={close} className="border-b border-line py-3.5 text-base font-semibold" />
            </nav>
            <div className="container-site flex flex-col gap-3 pb-8">
              {whatsapp && (
                <a href={whatsappHref(whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-accent">
                  <WhatsApp className="size-4" /> WhatsApp ile yazın
                </a>
              )}
              {phone && (
                <a href={telHref(phone)} className="btn-primary">
                  <Phone className="size-4" /> {phone}
                </a>
              )}
              <Link href="/degerleme" className="btn-outline" onClick={close}>
                <Calculator className="size-4" /> Ücretsiz değerleme
              </Link>
              <Link href="/ilanlar" className="btn-outline" onClick={close}>
                <Search className="size-4" /> İlan ara
              </Link>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
