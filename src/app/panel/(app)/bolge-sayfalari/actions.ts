"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { landingContent } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { landingPath, parseLanding } from "@/lib/seo";
import type { FormState } from "@/components/panel/use-form-action";

const schema = z.object({
  intro: z.string().trim().max(600, "En fazla 600 karakter").default(""),
  body: z.string().trim().max(12000, "En fazla 12.000 karakter").default(""),
  metaDescription: z.string().trim().max(170, "En fazla 170 karakter").default(""),
});

export async function saveLandingContent(segments: string[], _prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const [status, ...rest] = segments;
  const landing = parseLanding(status ?? "", rest);
  if (!landing) return { ok: false, message: "Geçersiz sayfa." };
  const path = landingPath(landing);

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, errors, message: "Kaydedilemedi, işaretli alanları kontrol edin." };
  }

  const data = parsed.data;
  if (!data.intro && !data.body && !data.metaDescription) {
    db.delete(landingContent).where(eq(landingContent.path, path)).run();
  } else {
    db.insert(landingContent)
      .values({ path, ...data })
      .onConflictDoUpdate({ target: landingContent.path, set: { ...data, updatedAt: new Date() } })
      .run();
  }
  revalidatePath(path);
  revalidatePath("/panel/bolge-sayfalari");
  return { ok: true, message: "Kaydedildi. Sayfa güncellendi." };
}
