import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { siteSettingsSchema, type SiteSettings } from "./settings-schema";

const KEY = "site";

export const getSettings = cache((): SiteSettings => {
  const row = db.select().from(settings).where(eq(settings.key, KEY)).get();
  // Şema yeni alan kazandığında eski kayıtlar varsayılanlarla tamamlanır.
  const parsed = siteSettingsSchema.safeParse(row?.value ?? {});
  return parsed.success ? parsed.data : siteSettingsSchema.parse({});
});

export function saveSettings(value: SiteSettings) {
  db.insert(settings)
    .values({ key: KEY, value })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } })
    .run();
}
