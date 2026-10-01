import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { DEFAULT_HERO_TITLE, LEGACY_HERO_TITLE, siteSettingsSchema, type SiteSettings } from "./settings-schema";

const KEY = "site";

export const getSettings = cache((): SiteSettings => {
  const row = db.select().from(settings).where(eq(settings.key, KEY)).get();
  // Şema yeni alan kazandığında eski kayıtlar varsayılanlarla tamamlanır.
  const parsed = siteSettingsSchema.safeParse(row?.value ?? {});
  const value = parsed.success ? parsed.data : siteSettingsSchema.parse({});
  if (value.heroTitle === LEGACY_HERO_TITLE) value.heroTitle = DEFAULT_HERO_TITLE;
  return value;
});

export function saveSettings(value: SiteSettings) {
  db.insert(settings)
    .values({ key: KEY, value })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } })
    .run();
}
