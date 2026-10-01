"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  clearAttempts,
  createSession,
  destroySession,
  hashPassword,
  isRateLimited,
  recordFailedAttempt,
  verifyPassword,
} from "@/lib/auth";

export type LoginState = { error?: string };

// Kullanıcı yokken de doğrulama süresi benzer olsun diye geçerli bir sahte özetle karşılaştırılır.
let dummyHash: Promise<string> | undefined;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = `${ip}:${email}`;

  if (isRateLimited(key)) return { error: "Çok fazla hatalı deneme. 15 dakika sonra tekrar deneyin." };
  if (!email || !password) return { error: "E-posta ve şifre gerekli." };

  const user = db.select().from(users).where(eq(users.email, email)).get();
  const ok = await verifyPassword(user?.passwordHash ?? (await (dummyHash ??= hashPassword("timing-dummy"))), password).catch(() => false);
  if (!user || !ok) {
    recordFailedAttempt(key);
    return { error: "E-posta veya şifre hatalı." };
  }

  clearAttempts(key);
  await createSession(user.id);
  redirect("/panel");
}

export async function logout() {
  await destroySession();
  redirect("/panel/giris");
}
