"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, count, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, requireAdmin, requireUser, revokeUserSessions, verifyPassword } from "@/lib/auth";
import type { FormState } from "@/components/panel/use-form-action";

const password = z.string().min(10, "Şifre en az 10 karakter olmalı").max(200);

const newUserSchema = z.object({
  name: z.string().trim().min(2, "Ad girin").max(80),
  email: z.email("Geçerli bir e-posta girin").transform((v) => v.toLowerCase()),
  role: z.enum(["admin", "editor"]),
  password,
});

function fail(error: z.ZodError): FormState {
  const errors: Record<string, string> = {};
  for (const i of error.issues) errors[String(i.path[0])] ??= i.message;
  return { ok: false, errors, message: "İşaretli alanları kontrol edin." };
}

export async function createUser(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = newUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);
  const { password: pw, ...data } = parsed.data;
  if (db.select({ id: users.id }).from(users).where(eq(users.email, data.email)).get())
    return { ok: false, errors: { email: "Bu e-posta ile kayıtlı kullanıcı var" } };
  db.insert(users).values({ ...data, passwordHash: await hashPassword(pw) }).run();
  revalidatePath("/panel/kullanicilar");
  return { ok: true, message: `${data.name} eklendi.` };
}

function adminCountExcluding(id: number) {
  return db.select({ n: count() }).from(users).where(and(eq(users.role, "admin"), ne(users.id, id))).get()!.n;
}

export async function deleteUser(id: number) {
  const me = await requireAdmin();
  if (id === me.id) return { ok: false, message: "Kendi hesabınızı silemezsiniz." };
  const target = db.select({ role: users.role }).from(users).where(eq(users.id, id)).get();
  if (target?.role === "admin" && adminCountExcluding(id) === 0) return { ok: false, message: "Son yönetici silinemez." };
  db.delete(users).where(eq(users.id, id)).run();
  revalidatePath("/panel/kullanicilar");
  return { ok: true };
}

export async function resetUserPassword(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = password.safeParse(formData.get("password"));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]!.message };
  db.update(users).set({ passwordHash: await hashPassword(parsed.data) }).where(eq(users.id, id)).run();
  revokeUserSessions(id);
  return { ok: true, message: "Şifre güncellendi; kullanıcının açık oturumları kapatıldı." };
}

const changeSchema = z
  .object({ current: z.string().min(1, "Mevcut şifrenizi girin"), next: password, confirm: z.string() })
  .refine((d) => d.next === d.confirm, { path: ["confirm"], message: "Şifreler eşleşmiyor" });

export async function changeOwnPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireUser();
  const parsed = changeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);
  const row = db.select({ hash: users.passwordHash }).from(users).where(eq(users.id, me.id)).get()!;
  if (!(await verifyPassword(row.hash, parsed.data.current)))
    return { ok: false, errors: { current: "Mevcut şifre hatalı" } };
  db.update(users).set({ passwordHash: await hashPassword(parsed.data.next) }).where(eq(users.id, me.id)).run();
  return { ok: true, message: "Şifreniz değiştirildi." };
}
