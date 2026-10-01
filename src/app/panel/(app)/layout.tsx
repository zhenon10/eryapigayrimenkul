import { requireUser } from "@/lib/auth";
import { PanelShell } from "@/components/panel/shell";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { count, eq } from "drizzle-orm";

export default async function PanelLayout({ children }: LayoutProps<"/panel">) {
  const user = await requireUser();
  const newInquiries = db.select({ n: count() }).from(inquiries).where(eq(inquiries.state, "yeni")).get()!.n;
  return (
    <PanelShell user={user} newInquiries={newInquiries}>
      {children}
    </PanelShell>
  );
}
