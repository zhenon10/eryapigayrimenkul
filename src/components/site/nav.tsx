"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Calculator, Menu, Phone, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { telHref } from "@/lib/format";
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

export function MobileNav({ items, phone }: { items: NavItem[]; phone: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="Menüyü aç"
        className="btn btn-sm border border-line px-2.5"
      >
        <Menu className="size-5" />
      </button>
      {open && (
        <div id="mobile-menu" className="fixed inset-0 z-[60] overflow-y-auto bg-white">
          <div className="container-site flex h-20 items-center justify-between border-b border-line">
            <span className="font-display text-headline-sm font-semibold">Menü</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Menüyü kapat"
              className="btn btn-sm border border-line px-2.5"
            >
              <X className="size-5" />
            </button>
          </div>
          <nav aria-label="Mobil menü" className="container-site flex flex-col py-4">
            <ActiveLinks
              items={items}
              onNavigate={() => setOpen(false)}
              className="border-b border-line py-3.5 text-base font-semibold"
            />
          </nav>
          <div className="container-site flex flex-col gap-3 pb-8">
            <Link href="/ilanlar" className="btn-outline" onClick={() => setOpen(false)}>
              <Search className="size-4" /> İlan Ara
            </Link>
            <Link href="/degerleme" className="btn-accent" onClick={() => setOpen(false)}>
              <Calculator className="size-4" /> Ücretsiz Değerleme
            </Link>
            {phone && (
              <a href={telHref(phone)} className="btn-primary">
                <Phone className="size-4" /> {phone}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
