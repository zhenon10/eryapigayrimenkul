import { z } from "zod";

const str = (max = 300) => z.string().trim().max(max).default("");

export const DEFAULT_HERO_TITLE = "Balıkesir'de satılık ve kiralık emlak";
/** İlk sürümün varsayılanı; sonu iki noktayla bitip ayrı bir italik vurguya bağlanıyordu. */
export const LEGACY_HERO_TITLE = "Balıkesir'in Güvenilir Gayrimenkul & Yatırım Ortağı:";

export const statSchema = z.object({
  value: z.string().trim().min(1).max(20),
  label: z.string().trim().min(1).max(60),
});

/**
 * Panelden düzenlenen site geneli içerik. Boş bırakılan alanlar sitede gizlenir,
 * böylece gerçek bilgi girilmeden örnek/uydurma veri yayına çıkmaz.
 */
export const siteSettingsSchema = z.object({
  companyName: str(80).default("Er Yapı Emlak"),
  tagline: str(120).default("Gayrimenkul & Yatırım • Balıkesir"),
  phone: str(40),
  whatsapp: str(20),
  email: z.union([z.literal(""), z.email()]).default(""),
  address: str(200),
  workingHours: str(80),
  serviceArea: str(120),
  instagram: str(60),
  facebook: str(200),
  licenseNo: str(40),
  mapEmbedUrl: z.union([z.literal(""), z.url().startsWith("https://")]).default(""),
  mapsLink: z.union([z.literal(""), z.url()]).default(""),
  heroTitle: str(160).default(DEFAULT_HERO_TITLE),
  heroText: str(400),
  heroImageId: z.number().int().positive().nullable().default(null),
  stats: z.array(statSchema).max(4).default([]),
  aboutText: str(6000),
  kvkkText: str(30000),
  privacyText: str(30000),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;
