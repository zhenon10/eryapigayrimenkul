"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { INQUIRY_STATES, values } from "@/lib/constants";

const schema = z.object({
  state: z.enum(values(INQUIRY_STATES)),
  note: z.string().trim().max(2000).default(""),
});

export async function updateInquiry(id: number, formData: FormData) {
  await requireUser();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  db.update(inquiries).set(parsed.data).where(eq(inquiries.id, id)).run();
  revalidatePath("/panel", "layout");
}

export async function deleteInquiry(id: number) {
  await requireUser();
  db.delete(inquiries).where(eq(inquiries.id, id)).run();
  revalidatePath("/panel", "layout");
}
