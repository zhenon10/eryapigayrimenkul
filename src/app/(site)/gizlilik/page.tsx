import type { Metadata } from "next";
import { TextPage } from "@/components/site/text-page";
import { getSettings } from "@/lib/settings";

export const revalidate = 3600;

export const metadata: Metadata = { title: "Gizlilik Politikası" };

export default function PrivacyPage() {
  return <TextPage title="Gizlilik Politikası" text={getSettings().privacyText} />;
}
