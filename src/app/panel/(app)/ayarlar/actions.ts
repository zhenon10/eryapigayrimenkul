"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { deleteMedia, isUnusedMedia } from "@/lib/media";
import { getSettings, saveSettings } from "@/lib/settings";
import { siteSettingsSchema } from "@/lib/settings-schema";
import type { FormState } from "@/components/panel/use-form-action";

/** Google Haritalar "Haritayı yerleştir" kodu yapıştırılırsa içinden src adresini çıkarır. */
function extractEmbedSrc(v: string) {
  const m = v.match(/src="([^"]+)"/);
  return (m ? m[1]! : v).trim();
}

export async function saveSiteSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const get = (k: string) => String(formData.get(k) ?? "");

  const stats = [0, 1, 2, 3]
    .map((i) => ({ value: get(`statValue${i}`).trim(), label: get(`statLabel${i}`).trim() }))
    .filter((s) => s.value || s.label);

  const heroRaw = Number(formData.get("heroImage"));
  const heroImageId =
    Number.isInteger(heroRaw) && heroRaw > 0 && isUnusedMedia(heroRaw, { hero: true })
      ? heroRaw
      : null;

  const parsed = siteSettingsSchema.safeParse({
    ...Object.fromEntries([...formData.entries()].filter(([k]) => !/^stat|^heroImage$/.test(k))),
    mapEmbedUrl: extractEmbedSrc(get("mapEmbedUrl")),
    stats,
    heroImageId,
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const key = i.path[0] === "stats" ? `stat${String(i.path[1])}` : String(i.path[0]);
      errors[key] ??= i.path[0] === "stats" ? "Değer ve açıklama birlikte girilmeli" : i.message;
    }
    return { ok: false, errors, message: "Kaydedilemedi, işaretli alanları kontrol edin." };
  }

  const previousHero = getSettings().heroImageId;
  saveSettings(parsed.data);
  if (previousHero && previousHero !== heroImageId) await deleteMedia([previousHero]);
  revalidatePath("/", "layout");
  return { ok: true, message: "Ayarlar kaydedildi." };
}
