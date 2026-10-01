import "server-only";
import crypto from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, lt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";

export const SESSION_COOKIE = "eryapi_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type SessionUser = Pick<User, "id" | "email" | "name" | "role">;

const tokenId = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export { hashPassword, verifyPassword } from "./password";

export async function createSession(userId: number) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  db.delete(sessions).where(lt(sessions.expiresAt, new Date())).run();
  db.insert(sessions).values({ id: tokenId(token), userId, expiresAt }).run();

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) db.delete(sessions).where(eq(sessions.id, tokenId(token))).run();
  jar.delete(SESSION_COOKIE);
}

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = db
    .select({ id: users.id, email: users.email, name: users.name, role: users.role })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, tokenId(token)), gt(sessions.expiresAt, new Date())))
    .get();
  return row ?? null;
});

/** Panel sayfaları ve server action'lar için asıl yetki kontrolü (proxy sadece yönlendirme yapar). */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/panel/giris");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/panel");
  return user;
}

export function revokeUserSessions(userId: number) {
  db.delete(sessions).where(eq(sessions.userId, userId)).run();
}

// Basit kaba kuvvet koruması: tek sunucu süreci için yeterli.
const attempts = new Map<string, { count: number; until: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export function isRateLimited(key: string) {
  const entry = attempts.get(key);
  return !!entry && entry.until > Date.now() && entry.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.until < now) attempts.set(key, { count: 1, until: now + WINDOW_MS });
  else entry.count++;
}

export function clearAttempts(key: string) {
  attempts.delete(key);
}
