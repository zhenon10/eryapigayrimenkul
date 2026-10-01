import type { Metadata } from "next";
import { PageHeader } from "@/components/panel/ui";
import { AgentForm } from "../agent-form";

export const metadata: Metadata = { title: "Yeni Danışman" };

export default function NewAgentPage() {
  return (
    <>
      <PageHeader title="Yeni Danışman" back={{ href: "/panel/danismanlar", label: "Danışmanlar" }} />
      <AgentForm />
    </>
  );
}
