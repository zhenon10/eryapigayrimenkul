import type { Metadata } from "next";
import { TextPage } from "@/components/site/text-page";
import { getSettings } from "@/lib/settings";

export const revalidate = 3600;

export const metadata: Metadata = { title: "KVKK Aydınlatma Metni" };

export default function KvkkPage() {
  return <TextPage title="KVKK Aydınlatma Metni" text={getSettings().kvkkText} />;
}
