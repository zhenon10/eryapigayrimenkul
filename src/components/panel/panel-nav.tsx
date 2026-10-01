"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Inbox, LayoutDashboard, Settings, UserCog, Users } from "lucide-react";
import { cn } from "@/lib/cn";

export function PanelNav({ isAdmin, newInquiries }: { isAdmin: boolean; newInquiries: number }) {
  const pathname = usePathname();
  const items = [
    { href: "/panel", label: "Özet", icon: LayoutDashboard },
    { href: "/panel/ilanlar", label: "İlanlar", icon: Building2 },
    { href: "/panel/danismanlar", label: "Danışmanlar", icon: Users },
    { href: "/panel/talepler", label: "Talepler", icon: Inbox, badge: newInquiries },
    { href: "/panel/ayarlar", label: "Site Ayarları", icon: Settings },
    ...(isAdmin ? [{ href: "/panel/kullanicilar", label: "Kullanıcılar", icon: UserCog }] : []),
  ];

  return (
    <nav aria-label="Panel menüsü" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-4">
      {items.map(({ href, label, icon: Icon, badge }) => {
        const active = href === "/panel" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-semibold transition",
              active ? "bg-white/10 text-white" : "hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className={cn("size-4", active && "text-accent-bright")} aria-hidden />
            {label}
            {!!badge && (
              <span className="tabular ml-auto rounded-full bg-accent px-2 py-0.5 text-micro font-bold text-white">{badge}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
