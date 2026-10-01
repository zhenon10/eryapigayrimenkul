import "server-only";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

export const DATABASE_PATH = path.resolve(/*turbopackIgnore: true*/ process.env.DATABASE_PATH ?? "data/eryapi.db");

function open() {
  fs.mkdirSync(path.dirname(DATABASE_PATH), { recursive: true });
  const sqlite = new Database(DATABASE_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  const db = drizzle(sqlite, { schema });
  // Bekleyen migration'lar ilk bağlantıda uygulanır; ayrı bir kurulum adımı gerekmez.
  migrate(db, { migrationsFolder: path.resolve(/*turbopackIgnore: true*/ "drizzle") });
  return db;
}

// Geliştirmede HMR modülü yeniden yükledikçe yeni bağlantı açılmasın.
const globalForDb = globalThis as unknown as { __db?: BetterSQLite3Database<typeof schema> };
export const db = (globalForDb.__db ??= open());

export { schema };
