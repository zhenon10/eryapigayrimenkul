import "server-only";
import { z } from "zod";
import { and, asc, count, desc, eq, gte, inArray, like, lte, or, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { db } from "@/db";
import { agents, listingImages, listings, media } from "@/db/schema";
import { DISTRICTS, LISTING_STATUSES, LISTING_TYPES, TYPE_GROUPS, typesInGroup, values } from "./constants";
import type { ImageRef } from "./media-url";

const agentPhoto = alias(media, "agent_photo");

const toImage = (m: { key: string | null; width: number | null; height: number | null; alt: string | null }) =>
  m.key ? ({ key: m.key, width: m.width!, height: m.height!, alt: m.alt ?? "" } satisfies ImageRef) : null;

const cardColumns = {
  id: listings.id,
  slug: listings.slug,
  refNo: listings.refNo,
  title: listings.title,
  summary: listings.summary,
  status: listings.status,
  type: listings.type,
  district: listings.district,
  neighborhood: listings.neighborhood,
  price: listings.price,
  areaGross: listings.areaGross,
  areaNet: listings.areaNet,
  rooms: listings.rooms,
  bathrooms: listings.bathrooms,
  zoning: listings.zoning,
  badge: listings.badge,
  virtualTourUrl: listings.virtualTourUrl,
  agentName: agents.name,
  agentSlug: agents.slug,
  agentSpecialty: agents.specialty,
  agentKey: agentPhoto.key,
  agentW: agentPhoto.width,
  agentH: agentPhoto.height,
  agentAlt: agentPhoto.alt,
};


function coverImages(ids: number[]) {
  if (!ids.length) return new Map<number, ImageRef>();
  const rows = db
    .select({
      listingId: listingImages.listingId,
      sortOrder: listingImages.sortOrder,
      key: media.key,
      width: media.width,
      height: media.height,
      alt: media.alt,
    })
    .from(listingImages)
    .innerJoin(media, eq(media.id, listingImages.mediaId))
    .where(inArray(listingImages.listingId, ids))
    .orderBy(asc(listingImages.sortOrder))
    .all();
  const map = new Map<number, ImageRef>();
  for (const r of rows) if (!map.has(r.listingId)) map.set(r.listingId, toImage(r)!);
  return map;
}

type CardRow = ReturnType<ReturnType<typeof cardQuery>["all"]>[number];

function toCards(rows: CardRow[]) {
  const covers = coverImages(rows.map((r) => r.id));
  return rows.map(({ agentName, agentSlug, agentSpecialty, agentKey, agentW, agentH, agentAlt, ...l }) => ({
    ...l,
    cover: covers.get(l.id) ?? null,
    agent: agentName
      ? {
          name: agentName,
          slug: agentSlug!,
          specialty: agentSpecialty ?? "",
          photo: toImage({ key: agentKey, width: agentW, height: agentH, alt: agentAlt }),
        }
      : null,
  }));
}

export type ListingCard = ReturnType<typeof toCards>[number];

function cardQuery() {
  return db
    .select(cardColumns)
    .from(listings)
    .leftJoin(agents, and(eq(agents.id, listings.agentId), eq(agents.isActive, true)))
    .leftJoin(agentPhoto, eq(agentPhoto.id, agents.photoId))
    .$dynamic();
}

export function getFeaturedListings(limit = 6) {
  const rows = cardQuery()
    .where(eq(listings.isPublished, true))
    .orderBy(desc(listings.isFeatured), desc(listings.createdAt))
    .limit(limit)
    .all();
  return toCards(rows);
}

const optionalInt = z.preprocess(
  (v) => (typeof v === "string" ? v.replace(/\D/g, "") : v),
  z.coerce.number().int().positive().optional().catch(undefined),
);
const optionalEnum = <T extends [string, ...string[]]>(v: T) => z.enum(v).optional().catch(undefined);

export const SORTS = [
  { value: "yeni", label: "En yeni" },
  { value: "fiyat-artan", label: "Fiyat (artan)" },
  { value: "fiyat-azalan", label: "Fiyat (azalan)" },
] as const;

export const searchSchema = z.object({
  durum: optionalEnum(values(LISTING_STATUSES)),
  kategori: optionalEnum(values(TYPE_GROUPS)),
  tip: optionalEnum(values(LISTING_TYPES)),
  ilce: optionalEnum(values(DISTRICTS)),
  min: optionalInt,
  max: optionalInt,
  oda: z.string().max(10).optional().catch(undefined),
  q: z.string().trim().max(80).optional().catch(undefined),
  sirala: optionalEnum(values(SORTS)),
  sayfa: z.coerce.number().int().min(1).max(1000).optional().catch(undefined),
});

export type SearchFilters = z.infer<typeof searchSchema>;

export const PAGE_SIZE = 12;

export function searchListings(f: SearchFilters) {
  const where: (SQL | undefined)[] = [eq(listings.isPublished, true)];
  if (f.durum) where.push(eq(listings.status, f.durum));
  if (f.tip) where.push(eq(listings.type, f.tip));
  else if (f.kategori) where.push(inArray(listings.type, typesInGroup(f.kategori)));
  if (f.ilce) where.push(eq(listings.district, f.ilce));
  if (f.min) where.push(gte(listings.price, f.min));
  if (f.max) where.push(lte(listings.price, f.max));
  if (f.oda) where.push(eq(listings.rooms, f.oda));
  if (f.q) {
    const term = `%${f.q.replace(/[%_]/g, "")}%`;
    where.push(or(like(listings.title, term), like(listings.neighborhood, term), like(listings.refNo, term)));
  }
  const cond = and(...where);
  const order =
    f.sirala === "fiyat-artan"
      ? [asc(listings.price)]
      : f.sirala === "fiyat-azalan"
        ? [desc(listings.price)]
        : [desc(listings.isFeatured), desc(listings.createdAt)];

  const page = f.sayfa ?? 1;
  const total = db.select({ n: count() }).from(listings).where(cond).get()!.n;
  const rows = cardQuery()
    .where(cond)
    .orderBy(...order)
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE)
    .all();
  return { items: toCards(rows), total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export function getRoomOptions() {
  return db
    .selectDistinct({ rooms: listings.rooms })
    .from(listings)
    .where(and(eq(listings.isPublished, true), sql`${listings.rooms} <> ''`))
    .orderBy(asc(listings.rooms))
    .all()
    .map((r) => r.rooms);
}

/** Başlık değişince slug da değişir; eski bağlantılar sondaki ilan numarasından bulunur. */
export function findCurrentListingSlug(oldSlug: string) {
  const ref = oldSlug.match(/-(er-\d+)$/)?.[1]?.toUpperCase();
  if (!ref) return null;
  return (
    db
      .select({ slug: listings.slug })
      .from(listings)
      .where(and(eq(listings.refNo, ref), eq(listings.isPublished, true)))
      .get()?.slug ?? null
  );
}

export function getListingBySlug(slug: string) {
  const listing = db
    .select()
    .from(listings)
    .where(and(eq(listings.slug, slug), eq(listings.isPublished, true)))
    .get();
  if (!listing) return null;

  const images = db
    .select({ key: media.key, width: media.width, height: media.height, alt: media.alt })
    .from(listingImages)
    .innerJoin(media, eq(media.id, listingImages.mediaId))
    .where(eq(listingImages.listingId, listing.id))
    .orderBy(asc(listingImages.sortOrder))
    .all();

  const agent = listing.agentId ? getAgentRow(eq(agents.id, listing.agentId)) : null;
  return { ...listing, images, agent };
}

function getAgentRow(cond: SQL) {
  const row = db
    .select({ agent: agents, photo: media })
    .from(agents)
    .leftJoin(media, eq(media.id, agents.photoId))
    .where(and(cond, eq(agents.isActive, true)))
    .get();
  return row ? { ...row.agent, photo: row.photo ? toImage(row.photo) : null } : null;
}

export type PublicAgent = NonNullable<ReturnType<typeof getAgentRow>>;

export function getAgents(): PublicAgent[] {
  return db
    .select({ agent: agents, photo: media })
    .from(agents)
    .leftJoin(media, eq(media.id, agents.photoId))
    .where(eq(agents.isActive, true))
    .orderBy(asc(agents.sortOrder), asc(agents.name))
    .all()
    .map((r) => ({ ...r.agent, photo: r.photo ? toImage(r.photo) : null }));
}

export function getAgentBySlug(slug: string) {
  const agent = getAgentRow(eq(agents.slug, slug));
  if (!agent) return null;
  const rows = cardQuery()
    .where(and(eq(listings.isPublished, true), eq(listings.agentId, agent.id)))
    .orderBy(desc(listings.createdAt))
    .all();
  return { ...agent, listings: toCards(rows) };
}

export function getSimilarListings(listing: { id: number; type: string; district: string; status: string }, limit = 3) {
  const rows = cardQuery()
    .where(
      and(
        eq(listings.isPublished, true),
        eq(listings.status, listing.status as "satilik" | "kiralik"),
        sql`${listings.id} <> ${listing.id}`,
        or(eq(listings.type, listing.type), eq(listings.district, listing.district)),
      ),
    )
    .orderBy(desc(listings.createdAt))
    .limit(limit)
    .all();
  return toCards(rows);
}

export function getSitemapEntries() {
  return {
    listings: db
      .select({ slug: listings.slug, updatedAt: listings.updatedAt })
      .from(listings)
      .where(eq(listings.isPublished, true))
      .all(),
    agents: db
      .select({ slug: agents.slug, updatedAt: agents.updatedAt })
      .from(agents)
      .where(eq(agents.isActive, true))
      .all(),
  };
}
