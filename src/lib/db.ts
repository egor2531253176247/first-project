import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { defaultCatalog, type Catalog } from "./catalog.ts";

export const dataDirectory = () =>
  process.env.STUDIO_DATA_DIR || join(process.cwd(), ".data");
let database: DatabaseSync | undefined;
export function db() {
  if (database) return database;
  mkdirSync(dataDirectory(), { recursive: true, mode: 0o700 });
  database = new DatabaseSync(join(dataDirectory(), "studio.sqlite"));
  database.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS catalog (id INTEGER PRIMARY KEY CHECK(id=1), payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'customer', created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), payload TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'NEW', stage TEXT NOT NULL DEFAULT 'CHECK-IN', created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS bookings (id TEXT PRIMARY KEY, lead_id TEXT NOT NULL REFERENCES leads(id), date TEXT NOT NULL, time TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'BOOKED');
    CREATE UNIQUE INDEX IF NOT EXISTS booking_slot ON bookings(date,time) WHERE status != 'CANCELLED';
    CREATE TABLE IF NOT EXISTS limits (id TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, kind TEXT NOT NULL, payload TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'PENDING', created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS uploads (id TEXT PRIMARY KEY, capability TEXT NOT NULL, user_id TEXT REFERENCES users(id), claimed INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
  `);
  database
    .prepare("INSERT OR IGNORE INTO catalog(id,payload) VALUES(1,?)")
    .run(JSON.stringify(defaultCatalog));
  return database;
}
export function getCatalog(): Catalog {
  return JSON.parse(
    (
      db().prepare("SELECT payload FROM catalog WHERE id=1").get() as {
        payload: string;
      }
    ).payload,
  );
}
export function saveCatalog(catalog: Catalog) {
  db()
    .prepare("UPDATE catalog SET payload=? WHERE id=1")
    .run(JSON.stringify(catalog));
}
export type Lead = {
  id: string;
  user_id: string | null;
  payload: Record<string, unknown>;
  status: string;
  stage: string;
  created_at: string;
};
export function leadsFor(userId?: string): Lead[] {
  const rows = userId
    ? db()
        .prepare("SELECT * FROM leads WHERE user_id=? ORDER BY created_at DESC")
        .all(userId)
    : db().prepare("SELECT * FROM leads ORDER BY created_at DESC").all();
  return rows.map((row) => ({
    ...row,
    payload: JSON.parse(row.payload as string),
  })) as Lead[];
}
export function transaction<T>(operation: () => T): T {
  db().exec("BEGIN IMMEDIATE");
  try {
    const result = operation();
    db().exec("COMMIT");
    return result;
  } catch (error) {
    db().exec("ROLLBACK");
    throw error;
  }
}
export function rateLimit(key: string, max = 15, seconds = 600) {
  const now = Date.now();
  return transaction(() => {
    db().prepare("DELETE FROM limits WHERE expires_at<?").run(now);
    const row = db().prepare("SELECT count FROM limits WHERE id=?").get(key) as
      { count: number } | undefined;
    if (row && row.count >= max) return false;
    if (row)
      db().prepare("UPDATE limits SET count=count+1 WHERE id=?").run(key);
    else
      db()
        .prepare("INSERT INTO limits VALUES(?,?,?)")
        .run(key, 1, now + seconds * 1000);
    return true;
  });
}
export function queueEvent(kind: string, payload: unknown) {
  const id = randomUUID();
  db()
    .prepare("INSERT INTO events(id,kind,payload,created_at) VALUES(?,?,?,?)")
    .run(id, kind, JSON.stringify(payload), new Date().toISOString());
  return id;
}
