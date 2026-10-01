import type { Metadata } from "next";
import { TextPage } from "@/components/site/text-page";
import { getSettings } from "@/lib/settings";

export const revalidate = 3600;

export const metadata: Metadata = { title: "Hakkımızda" };

export default function AboutPage() {
  return <TextPage title="Hakkımızda" text={getSettings().aboutText} />;
}
