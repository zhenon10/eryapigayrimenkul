import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { PageHeader, Panel } from "@/components/panel/ui";
import { ChangePasswordForm } from "./change-password-form";

export const metadata: Metadata = { title: "Hesabım" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader title="Hesabım" description={`${user.name} · ${user.email}`} />
      <Panel title="Şifre Değiştir" className="max-w-xl">
        <ChangePasswordForm />
      </Panel>
    </>
  );
}
