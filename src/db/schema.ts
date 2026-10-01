import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import type { SiteSettings } from "@/lib/settings-schema";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
};

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "editor"] }).notNull().default("editor"),
  ...timestamps,
});

export const sessions = sqliteTable("sessions", {
  // Çerezdeki token'ın SHA-256 özeti; ham token veritabanında tutulmaz.
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const media = sqliteTable("media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // Dosya adı kökü; varyantlar `${key}-{sm,md,lg}.webp` olarak saklanır.
  key: text("key").notNull().unique(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  alt: text("alt").notNull().default(""),
  createdAt: timestamps.createdAt,
});

export const agents = sqliteTable("agents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  title: text("title").notNull().default(""),
  specialty: text("specialty").notNull().default(""),
  bio: text("bio").notNull().default(""),
  phone: text("phone").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  email: text("email").notNull().default(""),
  photoId: integer("photo_id").references(() => media.id, { onDelete: "set null" }),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

export const listings = sqliteTable(
  "listings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    refNo: text("ref_no").notNull().unique(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    description: text("description").notNull().default(""),
    status: text("status", { enum: ["satilik", "kiralik"] }).notNull(),
    type: text("type").notNull(),
    district: text("district").notNull(),
    neighborhood: text("neighborhood").notNull().default(""),
    price: integer("price").notNull(),
    areaGross: integer("area_gross"),
    areaNet: integer("area_net"),
    rooms: text("rooms").notNull().default(""),
    bathrooms: integer("bathrooms"),
    floor: text("floor").notNull().default(""),
    buildingAge: integer("building_age"),
    heating: text("heating").notNull().default(""),
    deedStatus: text("deed_status").notNull().default(""),
    zoning: text("zoning").notNull().default(""),
    parcel: text("parcel").notNull().default(""),
    badge: text("badge").notNull().default(""),
    features: text("features", { mode: "json" }).$type<string[]>().notNull().default([]),
    virtualTourUrl: text("virtual_tour_url").notNull().default(""),
    videoUrl: text("video_url").notNull().default(""),
    lat: real("lat"),
    lng: real("lng"),
    agentId: integer("agent_id").references(() => agents.id, { onDelete: "set null" }),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
    ...timestamps,
  },
  (t) => [
    index("listings_public_idx").on(t.isPublished, t.status, t.type, t.district),
    index("listings_price_idx").on(t.price),
    index("listings_agent_idx").on(t.agentId),
  ],
);

export const listingImages = sqliteTable(
  "listing_images",
  {
    listingId: integer("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    mediaId: integer("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.listingId, t.mediaId] })],
);

export const inquiries = sqliteTable(
  "inquiries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    kind: text("kind", { enum: ["degerleme", "iletisim", "ilan"] }).notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull().default(""),
    district: text("district").notNull().default(""),
    propertyType: text("property_type").notNull().default(""),
    message: text("message").notNull().default(""),
    listingId: integer("listing_id").references(() => listings.id, { onDelete: "set null" }),
    state: text("state", { enum: ["yeni", "gorusuldu", "kapandi"] }).notNull().default("yeni"),
    note: text("note").notNull().default(""),
    ...timestamps,
  },
  (t) => [index("inquiries_state_idx").on(t.state, t.createdAt)],
);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).$type<SiteSettings>().notNull(),
  updatedAt: timestamps.updatedAt,
});

export type User = typeof users.$inferSelect;
export type Media = typeof media.$inferSelect;
export type Agent = typeof agents.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
