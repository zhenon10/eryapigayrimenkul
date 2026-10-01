"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { inquiries, listings } from "@/db/schema";
import { DISTRICTS, INQUIRY_KINDS, LISTING_TYPES, values } from "@/lib/constants";

export type InquiryState = { ok: boolean; message?: string; errors?: Record<string, string> };

const schema = z.object({
  kind: z.enum(values(INQUIRY_KINDS)),
  name: z.string().trim().min(2, "Adınızı yazın").max(100),
  phone: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Geçerli bir telefon numarası yazın")
    .pipe(z.string().max(30)),
  email: z.union([z.literal(""), z.email("Geçerli bir e-posta yazın")]).default(""),
  district: z.union([z.literal(""), z.enum(values(DISTRICTS))]).default(""),
  propertyType: z.union([z.literal(""), z.enum(values(LISTING_TYPES))]).default(""),
  message: z.string().trim().max(2000).default(""),
  listingId: z.coerce.number().int().positive().optional().catch(undefined),
  kvkk: z.literal("on", { error: "Devam etmek için onay vermeniz gerekiyor" }),
});

// Aynı IP'den kısa sürede çok sayıda gönderimi engelle.
const recent = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const list = (recent.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  list.push(now);
  recent.set(ip, list);
  return list.length > 5;
}

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  // Botlar için gizli alan: dolu gelirse başarılıymış gibi davran, kaydetme.
  if (formData.get("website")) return { ok: true };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { ok: false, errors, message: "Lütfen işaretli alanları kontrol edin." };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  if (tooMany(ip)) return { ok: false, message: "Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin." };

  const { kvkk: _kvkk, listingId, ...data } = parsed.data;
  const listingExists =
    listingId && db.select({ id: listings.id }).from(listings).where(eq(listings.id, listingId)).get();

  db.insert(inquiries)
    .values({ ...data, listingId: listingExists ? listingId : null })
    .run();

  return { ok: true, message: "Talebiniz alındı. Danışmanımız en kısa sürede sizinle iletişime geçecek." };
}
