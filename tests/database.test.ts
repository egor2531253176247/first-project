import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const directory = mkdtempSync(join(tmpdir(), "precision-unit-"));
process.env.STUDIO_DATA_DIR = directory;
const { db, getCatalog, rateLimit, transaction } =
  await import("../src/lib/db.ts");
after(() => {
  db().close();
  rmSync(directory, { recursive: true, force: true });
});
test("database initializes durable catalog", () => {
  assert.equal(getCatalog().services.length, 9);
  assert.equal(getCatalog().settings.name, "PRECISION");
});
test("failed transaction rolls back", () => {
  assert.throws(() =>
    transaction(() => {
      db()
        .prepare("INSERT INTO limits VALUES(?,?,?)")
        .run("rollback", 1, Date.now() + 10000);
      throw new Error("abort");
    }),
  );
  assert.equal(
    db().prepare("SELECT * FROM limits WHERE id=?").get("rollback"),
    undefined,
  );
});
test("rate limiting persists and expires", () => {
  assert.equal(rateLimit("test-limit", 2, 600), true);
  assert.equal(rateLimit("test-limit", 2, 600), true);
  assert.equal(rateLimit("test-limit", 2, 600), false);
  db().prepare("UPDATE limits SET expires_at=0 WHERE id=?").run("test-limit");
  assert.equal(rateLimit("test-limit", 2, 600), true);
});
test("booking unique index ignores cancelled records", () => {
  const lead = "00000000-0000-0000-0000-000000000001";
  db()
    .prepare("INSERT INTO leads(id,payload,created_at) VALUES(?,?,?)")
    .run(lead, "{}", new Date().toISOString());
  const insert = db().prepare(
    "INSERT INTO bookings(id,lead_id,date,time,status) VALUES(?,?,?,?,?)",
  );
  insert.run("first", lead, "2026-10-07", "10:00", "BOOKED");
  assert.throws(() =>
    insert.run("second", lead, "2026-10-07", "10:00", "BOOKED"),
  );
  db().prepare("UPDATE bookings SET status='CANCELLED' WHERE id='first'").run();
  assert.doesNotThrow(() =>
    insert.run("replacement", lead, "2026-10-07", "10:00", "BOOKED"),
  );
});
