import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { media, type Media } from "@/db/schema";

export const UPLOAD_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? "storage/uploads");
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export const IMAGE_SIZES = { sm: 480, md: 1024, lg: 1920 } as const;

/** Medya anahtarı biçimi: `2026/10/abcdef0123456789` */
export const MEDIA_KEY_RE = /^\d{4}\/\d{2}\/[a-f0-9]{16}$/;

export async function saveImage(input: Buffer, alt = ""): Promise<Media> {
  const image = sharp(input, { failOn: "error" }).rotate();
  const meta = await image.metadata();
  if (!meta.width || !meta.height) throw new Error("Görsel okunamadı");

  const now = new Date();
  const key = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${crypto.randomBytes(8).toString("hex")}`;
  const base = path.join(UPLOAD_DIR, key);
  await fs.mkdir(path.dirname(base), { recursive: true });

  let size = { width: meta.width, height: meta.height };
  for (const [name, width] of Object.entries(IMAGE_SIZES)) {
    const info = await image
      .clone()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(`${base}-${name}.webp`);
    if (name === "lg") size = { width: info.width, height: info.height };
  }

  return db.insert(media).values({ key, alt, ...size }).returning().get();
}

export async function deleteMedia(ids: number[]) {
  if (!ids.length) return;
  const rows = db.select().from(media).where(inArray(media.id, ids)).all();
  db.delete(media).where(inArray(media.id, ids)).run();
  await Promise.all(
    rows.flatMap((r) =>
      Object.keys(IMAGE_SIZES).map((s) => fs.rm(path.join(UPLOAD_DIR, `${r.key}-${s}.webp`), { force: true })),
    ),
  );
}

export function getMedia(id: number) {
  return db.select().from(media).where(eq(media.id, id)).get();
}

/**
 * Yüklenip hiçbir kayda bağlanmadan bırakılan görselleri (ör. kaydedilmeden kapatılan
 * form) siler. Yeni yüklemelerle yarışmamak için 1 günden eski olanlara bakar.
 */
export async function cleanupOrphanMedia(referenced: number[]) {
  const cutoff = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
  const orphans = db.all<{ id: number }>(sql`
    SELECT m.id FROM media m
    WHERE m.created_at < ${cutoff}
      AND NOT EXISTS (SELECT 1 FROM listing_images li WHERE li.media_id = m.id)
      AND NOT EXISTS (SELECT 1 FROM agents a WHERE a.photo_id = m.id)
  `);
  await deleteMedia(orphans.map((o) => o.id).filter((id) => !referenced.includes(id)));
}

/**
 * Görsel başka bir kayda bağlı değilse true döner; aksi halde o kayıttan kaldırıldığında
 * dosya silinir ve diğer kayıt da görselini kaybederdi. `own` ile kaydın kendi mevcut
 * görseli kullanılmıyor sayılır (aynı görselle tekrar kaydedebilmek için).
 */
export function isUnusedMedia(id: number, own: { listingId?: number | null; agentId?: number | null; hero?: boolean } = {}) {
  const row = db.get<{ id: number } | undefined>(sql`
    SELECT m.id FROM media m
    WHERE m.id = ${id}
      AND NOT EXISTS (SELECT 1 FROM listing_images li WHERE li.media_id = m.id AND li.listing_id IS NOT ${own.listingId ?? null})
      AND NOT EXISTS (SELECT 1 FROM agents a WHERE a.photo_id = m.id AND a.id IS NOT ${own.agentId ?? null})
  `);
  if (!row) return false;
  if (own.hero) return true;
  const site = db.get<{ value: string } | undefined>(sql`SELECT value FROM settings WHERE key = 'site'`);
  return !site || JSON.parse(site.value).heroImageId !== id;
}
