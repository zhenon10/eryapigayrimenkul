import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/logo";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Giriş" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/panel");
  return (
    <main className="flex flex-1 items-center justify-center bg-ink p-5">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-float">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <LogoMark className="h-12" />
          <h1 className="font-display text-headline-sm font-semibold">Yönetim Paneli</h1>
          <p className="text-sm text-muted">İlan ve danışman yönetimi için giriş yapın.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
