import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { logout } from "@/app/panel/(auth)/giris/actions";
import type { SessionUser } from "@/lib/auth";
import { PanelNav } from "./panel-nav";

export function PanelShell({
  user,
  newInquiries,
  children,
}: {
  user: SessionUser;
  newInquiries: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="flex flex-col bg-ink text-ink-muted lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:py-6">
          <Link href="/panel" className="flex items-center gap-3 text-white">
            <LogoMark className="h-9" />
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-extrabold tracking-[0.08em]">ER YAPI</span>
              <span className="text-micro text-ink-muted">Yönetim Paneli</span>
            </span>
          </Link>
          <Link href="/" target="_blank" className="text-micro hover:text-white lg:hidden">
            Siteyi aç
          </Link>
        </div>
        <PanelNav isAdmin={user.role === "admin"} newInquiries={newInquiries} />
        <div className="mt-auto hidden flex-col gap-1 border-t border-white/10 p-4 lg:flex">
          <Link href="/" target="_blank" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/5 hover:text-white">
            <ExternalLink className="size-4" aria-hidden /> Siteyi görüntüle
          </Link>
          <Link href="/panel/hesap" className="rounded-md px-3 py-2 hover:bg-white/5">
            <span className="block truncate text-sm font-semibold text-white">{user.name}</span>
            <span className="block truncate text-micro">{user.email}</span>
          </Link>
          <form action={logout}>
            <button type="submit" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/5 hover:text-white">
              <LogOut className="size-4" aria-hidden /> Çıkış yap
            </button>
          </form>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8">{children}</main>
        <form action={logout} className="border-t border-line p-4 text-center lg:hidden">
          <button type="submit" className="text-sm text-muted underline">
            Çıkış yap ({user.email})
          </button>
        </form>
      </div>
    </div>
  );
}
