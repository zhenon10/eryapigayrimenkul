import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { Badge, PageHeader, Panel } from "@/components/panel/ui";
import { formatDate } from "@/lib/format";
import { NewUserForm, UserRowActions } from "./user-forms";

export const metadata: Metadata = { title: "Kullanıcılar" };

export default async function UsersPage() {
  const me = await requireAdmin();
  const rows = db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt })
    .from(users)
    .orderBy(asc(users.name))
    .all();

  return (
    <>
      <PageHeader title="Kullanıcılar" description="Panele erişebilen hesaplar." />
      <div className="flex flex-col gap-6">
        <Panel>
          <ul className="divide-y divide-line">
            {rows.map((u) => (
              <li key={u.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col">
                  <span className="flex items-center gap-2 font-semibold">
                    {u.name} {u.id === me.id && <Badge>Siz</Badge>}
                  </span>
                  <span className="text-sm text-muted">{u.email}</span>
                  <span className="mt-1 flex items-center gap-2 text-micro text-muted">
                    <Badge tone={u.role === "admin" ? "ink" : "neutral"}>{u.role === "admin" ? "Yönetici" : "Editör"}</Badge>
                    {formatDate(u.createdAt)}
                  </span>
                </div>
                <UserRowActions id={u.id} isSelf={u.id === me.id} />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Yeni Kullanıcı">
          <NewUserForm />
        </Panel>
      </div>
    </>
  );
}
