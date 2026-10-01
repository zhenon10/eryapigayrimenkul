/**
 * Panel kullanıcısı oluşturur veya mevcut kullanıcının şifresini sıfırlar.
 *
 *   npm run user:create -- --email ad@firma.com --name "Ad Soyad" [--role admin|editor]
 *
 * Şifre PASSWORD ortam değişkeninden alınır; verilmezse rastgele üretilip ekrana yazılır.
 */
import crypto from "node:crypto";
import { parseArgs } from "node:util";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { hashPassword } from "@/lib/password";

const { values } = parseArgs({
  options: { email: { type: "string" }, name: { type: "string" }, role: { type: "string", default: "admin" } },
});

async function main() {
  const email = values.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) throw new Error("--email gerekli");
  const role = values.role === "editor" ? "editor" : "admin";
  const generated = !process.env.PASSWORD;
  const password = process.env.PASSWORD ?? crypto.randomBytes(12).toString("base64url");
  if (password.length < 10) throw new Error("Şifre en az 10 karakter olmalı");
  const passwordHash = await hashPassword(password);

  const existing = db.select().from(users).where(eq(users.email, email)).get();
  if (existing) {
    db.update(users).set({ passwordHash, ...(values.name ? { name: values.name } : {}) }).where(eq(users.id, existing.id)).run();
    db.delete(sessions).where(eq(sessions.userId, existing.id)).run();
    console.log(`✓ ${email} şifresi güncellendi.`);
  } else {
    if (!values.name) throw new Error("Yeni kullanıcı için --name gerekli");
    db.insert(users).values({ email, name: values.name, role, passwordHash }).run();
    console.log(`✓ ${email} (${role === "admin" ? "yönetici" : "editör"}) oluşturuldu.`);
  }
  if (generated) console.log(`  Şifre: ${password}\n  Giriş yaptıktan sonra Hesabım sayfasından değiştirin.`);
}

main().catch((e) => {
  console.error(`✗ ${(e as Error).message}`);
  process.exit(1);
});
