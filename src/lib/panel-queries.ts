import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { agents, listingImages, listings, media } from "@/db/schema";

export function getAgentOptions() {
  return db.select({ id: agents.id, name: agents.name }).from(agents).orderBy(asc(agents.sortOrder), asc(agents.name)).all();
}

export function getListingForEdit(id: number) {
  if (!Number.isInteger(id)) return null;
  const listing = db.select().from(listings).where(eq(listings.id, id)).get();
  if (!listing) return null;
  const images = db
    .select({ id: media.id, key: media.key, width: media.width, height: media.height, alt: media.alt })
    .from(listingImages)
    .innerJoin(media, eq(media.id, listingImages.mediaId))
    .where(eq(listingImages.listingId, id))
    .orderBy(asc(listingImages.sortOrder))
    .all();
  return { listing, images };
}

export function getAgentForEdit(id: number) {
  if (!Number.isInteger(id)) return null;
  const row = db.select({ agent: agents, photo: media }).from(agents).leftJoin(media, eq(media.id, agents.photoId)).where(eq(agents.id, id)).get();
  return row ?? null;
}
