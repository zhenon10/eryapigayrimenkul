"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { agents } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { deleteMedia, isUnusedMedia } from "@/lib/media";
import type { FormState } from "@/components/panel/use-form-action";

const text = (max: number) => z.string().trim().max(max).default("");

const agentSchema = z.object({
  name: z.string().trim().min(3, "Ad soyad girin").max(80),
  title: text(80),
  specialty: text(160),
  bio: text(3000),
  phone: text(30),
  whatsapp: z
    .string()
    .trim()
    .default("")
    .refine((v) => v === "" || v.replace(/\D/g, "").length >= 10, "Ülke/alan kodlu numara girin (ör. 0532 000 00 00)"),
  email: z.union([z.literal(""), z.email("Geçerli bir e-posta girin")]).default(""),
  sortOrder: z.coerce.number().int().min(0).max(999).catch(0),
  isActive: z.preprocess((v) => v === "on", z.boolean()),
});

function uniqueSlug(name: string, id: number | null) {
  const base = slugify(name) || "danisman";
  for (let i = 1; ; i++) {
    const slug = i === 1 ? base : `${base}-${i}`;
    const clash = db
      .select({ id: agents.id })
      .from(agents)
      .where(id ? and(eq(agents.slug, slug), ne(agents.id, id)) : eq(agents.slug, slug))
      .get();
    if (!clash) return slug;
  }
}

export async function saveAgent(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = agentSchema.safeParse({ ...Object.fromEntries(formData), isActive: formData.get("isActive") });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, errors, message: "Kaydedilemedi, işaretli alanları kontrol edin." };
  }

  const photoRaw = Number(formData.get("photo"));
  const photoId =
    Number.isInteger(photoRaw) && photoRaw > 0 && isUnusedMedia(photoRaw, { agentId: id })
      ? photoRaw
      : null;
  const values = { ...parsed.data, photoId, slug: uniqueSlug(parsed.data.name, id) };

  if (id === null) {
    const created = db.insert(agents).values(values).returning({ id: agents.id }).get();
    revalidatePath("/", "layout");
    redirect(`/panel/danismanlar/${created.id}?yeni=1`);
  }

  const before = db.select({ photoId: agents.photoId }).from(agents).where(eq(agents.id, id)).get();
  if (!before) return { ok: false, message: "Danışman bulunamadı; silinmiş olabilir." };
  db.update(agents).set(values).where(eq(agents.id, id)).run();
  if (before.photoId && before.photoId !== photoId) await deleteMedia([before.photoId]);
  revalidatePath("/", "layout");
  return { ok: true, message: "Değişiklikler kaydedildi." };
}

export async function deleteAgent(id: number) {
  await requireUser();
  const agent = db.select({ photoId: agents.photoId }).from(agents).where(eq(agents.id, id)).get();
  // İlanlardaki bağlantı veritabanında `set null` ile kendiliğinden kalkar.
  db.delete(agents).where(eq(agents.id, id)).run();
  if (agent?.photoId) await deleteMedia([agent.photoId]);
  revalidatePath("/", "layout");
  redirect("/panel/danismanlar");
}
