"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { agents, listingImages, listings } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { DISTRICTS, LISTING_STATUSES, LISTING_TYPES, values } from "@/lib/constants";
import { slugify } from "@/lib/format";
import { deleteMedia, isUnusedMedia } from "@/lib/media";
import type { FormState } from "@/components/panel/use-form-action";

const text = (max: number) => z.string().trim().max(max).default("");
// Boş bırakılabilen sayısal alanlar: "1.250" gibi binlik ayraçlı girişleri de kabul eder.
const optInt = (max = 1e12) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.replace(/[.\s]/g, "") || null : (v ?? null)),
    z.coerce.number({ error: "Sayı girin" }).int("Tam sayı girin").min(0).max(max).nullable(),
  );
const optFloat = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().replace(",", ".") || null : (v ?? null)),
  z.coerce.number({ error: "Geçersiz koordinat" }).min(-180).max(180).nullable(),
);
const optUrl = z.union([z.literal(""), z.url("Geçerli bir bağlantı girin (https://…)")]).default("");

const listingSchema = z.object({
  title: z.string().trim().min(5, "Başlık en az 5 karakter olmalı").max(140),
  summary: text(300),
  description: text(10000),
  status: z.enum(values(LISTING_STATUSES), { error: "Durum seçin" }),
  type: z.enum(values(LISTING_TYPES), { error: "Tip seçin" }),
  district: z.enum(values(DISTRICTS), { error: "İlçe seçin" }),
  neighborhood: text(100),
  price: optInt().refine((v) => v !== null && v > 0, "Fiyat girin"),
  areaGross: optInt(10_000_000),
  areaNet: optInt(10_000_000),
  rooms: text(20),
  bathrooms: optInt(50),
  floor: text(40),
  buildingAge: optInt(200),
  heating: text(60),
  deedStatus: text(80),
  zoning: text(120),
  parcel: text(60),
  badge: text(30),
  features: z
    .string()
    .default("")
    .transform((v) =>
      [...new Set(v.split(/\r?\n/).map((l) => l.trim()).filter(Boolean))].slice(0, 60).map((l) => l.slice(0, 80)),
    ),
  virtualTourUrl: optUrl,
  videoUrl: optUrl,
  lat: optFloat,
  lng: optFloat,
  agentId: z.preprocess((v) => (v === "" || v == null ? null : v), z.coerce.number().int().positive().nullable()),
  isFeatured: z.preprocess((v) => v === "on", z.boolean()),
  isPublished: z.preprocess((v) => v === "on", z.boolean()),
});

function parse(formData: FormData) {
  const raw: Record<string, unknown> = Object.fromEntries(formData);
  raw.isFeatured = formData.get("isFeatured");
  raw.isPublished = formData.get("isPublished");
  const result = listingSchema.safeParse(raw);
  const imageIds = [...new Set(formData.getAll("images").map(Number).filter((n) => Number.isInteger(n) && n > 0))];
  return { result, imageIds };
}

const refNoFor = (id: number) => `ER-${1000 + id}`;
const slugFor = (title: string, refNo: string) => `${slugify(title)}-${refNo.toLowerCase()}`;

export async function saveListing(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const { result, imageIds } = parse(formData);
  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const i of result.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, errors, message: "Kaydedilemedi, işaretli alanları kontrol edin." };
  }
  const data = { ...result.data, price: result.data.price! };
  if ((data.lat === null) !== (data.lng === null)) {
    return { ok: false, errors: { lat: "Enlem ve boylam birlikte girilmeli" }, message: "Konum bilgisi eksik." };
  }
  if (data.agentId && !db.select({ id: agents.id }).from(agents).where(eq(agents.id, data.agentId)).get()) {
    data.agentId = null;
  }
  const orderedImages = imageIds.filter((m) => isUnusedMedia(m, { listingId: id }));
  if (data.isPublished && orderedImages.length === 0) {
    return { ok: false, errors: { images: "Yayına almak için en az bir fotoğraf ekleyin" }, message: "Fotoğraf eksik." };
  }

  let removed: number[] = [];
  const listingId = db.transaction((tx) => {
    let lid = id;
    if (lid === null) {
      const tmp = `tmp-${crypto.randomUUID()}`;
      lid = tx.insert(listings).values({ ...data, refNo: tmp, slug: tmp }).returning({ id: listings.id }).get().id;
      const refNo = refNoFor(lid);
      tx.update(listings).set({ refNo, slug: slugFor(data.title, refNo) }).where(eq(listings.id, lid)).run();
    } else {
      const existing = tx.select({ refNo: listings.refNo }).from(listings).where(eq(listings.id, lid)).get();
      if (!existing) return null;
      tx.update(listings)
        .set({ ...data, slug: slugFor(data.title, existing.refNo) })
        .where(eq(listings.id, lid))
        .run();
      const before = tx.select({ id: listingImages.mediaId }).from(listingImages).where(eq(listingImages.listingId, lid)).all();
      removed = before.map((b) => b.id).filter((m) => !orderedImages.includes(m));
      tx.delete(listingImages).where(eq(listingImages.listingId, lid)).run();
    }
    if (orderedImages.length) {
      tx.insert(listingImages)
        .values(orderedImages.map((mediaId, sortOrder) => ({ listingId: lid!, mediaId, sortOrder })))
        .run();
    }
    return lid;
  });

  if (listingId === null) return { ok: false, message: "İlan bulunamadı; silinmiş olabilir." };
  await deleteMedia(removed);
  revalidatePath("/", "layout");

  if (id === null) redirect(`/panel/ilanlar/${listingId}?yeni=1`);
  return { ok: true, message: "Değişiklikler kaydedildi." };
}

export async function deleteListing(id: number) {
  await requireUser();
  const images = db.select({ id: listingImages.mediaId }).from(listingImages).where(eq(listingImages.listingId, id)).all();
  db.delete(listings).where(eq(listings.id, id)).run();
  await deleteMedia(images.map((i) => i.id));
  revalidatePath("/", "layout");
  redirect("/panel/ilanlar");
}

export async function setListingFlag(id: number, flag: "isPublished" | "isFeatured", value: boolean) {
  await requireUser();
  if (flag === "isPublished" && value) {
    const hasImage = db.select({ id: listingImages.mediaId }).from(listingImages).where(eq(listingImages.listingId, id)).get();
    if (!hasImage) return { ok: false, message: "Fotoğrafı olmayan ilan yayına alınamaz." };
  }
  db.update(listings)
    .set(flag === "isPublished" ? { isPublished: value } : { isFeatured: value })
    .where(eq(listings.id, id))
    .run();
  revalidatePath("/", "layout");
  return { ok: true };
}
