import type { Metadata } from "next";
import { PageHeader } from "@/components/panel/ui";
import { getAgentOptions } from "@/lib/panel-queries";
import { ListingForm } from "../listing-form";

export const metadata: Metadata = { title: "Yeni İlan" };

export default function NewListingPage() {
  return (
    <>
      <PageHeader title="Yeni İlan" back={{ href: "/panel/ilanlar", label: "İlanlar" }} />
      <ListingForm agents={getAgentOptions()} />
    </>
  );
}
