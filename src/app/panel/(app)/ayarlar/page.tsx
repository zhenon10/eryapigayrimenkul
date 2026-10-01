import type { Metadata } from "next";
import { PageHeader } from "@/components/panel/ui";
import { getMedia } from "@/lib/media";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Site Ayarları" };

export default function SettingsPage() {
  const settings = getSettings();
  const hero = settings.heroImageId ? getMedia(settings.heroImageId) : null;
  return (
    <>
      <PageHeader title="Site Ayarları" description="İletişim bilgileri, ana sayfa içeriği ve yasal metinler." />
      <SettingsForm
        settings={settings}
        heroImage={hero ? { id: hero.id, key: hero.key, width: hero.width, height: hero.height, alt: hero.alt } : null}
      />
    </>
  );
}
