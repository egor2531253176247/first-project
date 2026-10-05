import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { setTimeout as wait } from "node:timers/promises";
import { studioDate, validBookingDate } from "../src/lib/calculator.ts";
const directory = mkdtempSync(join(tmpdir(), "precision-integration-"));
process.env.STUDIO_DATA_DIR = directory;
const { db } = await import("../src/lib/db.ts");
const password = randomBytes(24).toString("hex");
const adminEmail = "admin-test@example.invalid";
const salt = randomBytes(16).toString("hex");
db()
  .prepare(
    "INSERT INTO users(id,email,name,password,role,created_at) VALUES(?,?,?,?,'admin',?)",
  )
  .run(
    randomUUID(),
    adminEmail,
    "Test admin",
    salt + ":" + scryptSync(password, salt, 64).toString("hex"),
    new Date().toISOString(),
  );
const base = "http://127.0.0.1:3100";
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3100",
  ],
  {
    env: {
      ...process.env,
      STUDIO_DATA_DIR: directory,
      STUDIO_COOKIE_SECURE: "false",
      STUDIO_URL: base,
      SMTP_HOST: "",
      STUDIO_MAIL_KEY: "",
      CRM_WEBHOOK_URL: "",
      STUDIO_AI_KEY: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let logs = "";
server.stdout.on("data", (x) => (logs += x.toString()));
server.stderr.on("data", (x) => (logs += x.toString()));
let checks = 0;
const passed = (name: string) => {
  checks++;
  process.stdout.write("PASS " + name + "\n");
};
async function request(
  path: string,
  method = "GET",
  payload?: unknown,
  cookie?: string,
  origin = base,
) {
  return fetch(base + path, {
    method,
    headers: {
      ...(payload ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...(method !== "GET" ? { Origin: origin } : {}),
    },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });
}
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await request("/api/health")).ok) {
        ready = true;
        break;
      }
    } catch {}
    await wait(100);
  }
  assert(ready, "Server readiness");
  for (const path of [
    "/",
    "/services",
    "/services/ppf",
    "/projects",
    "/projects/porsche-911-full-ppf",
    "/configurator",
    "/quote",
    "/booking",
    "/studio",
    "/contact",
    "/blog/how-to-choose-ppf",
    "/visualizer",
    "/privacy",
    "/terms",
    "/robots.txt",
    "/sitemap.xml",
  ]) {
    const response = await request(path);
    assert.equal(response.status, 200, path);
    if (path === "/sitemap.xml")
      assert((await response.text()).includes(base + "/services/ppf"));
  }
  passed("public pages, service/project pages and runtime sitemap");
  assert.equal((await request("/api/admin")).status, 403);
  assert.equal(
    (await request("/api/media/00000000-0000-0000-0000-000000000001.webp"))
      .status,
    401,
  );
  passed("private APIs reject anonymous requests");
  const register = await request("/api/auth", "POST", {
    action: "register",
    name: "Test customer",
    email: "customer-test@example.invalid",
    password,
  });
  assert.equal(register.status, 201);
  const cookie = register.headers.get("set-cookie")!.split(";")[0];
  assert(cookie);
  passed("customer registration creates session");
  assert.equal(
    (await request("/api/admin", "GET", undefined, cookie)).status,
    403,
  );
  passed("customer cannot access admin data");
  const input = {
    brand: "Porsche",
    model: "911",
    year: 2026,
    name: "Test customer",
    email: "customer-test@example.invalid",
    phone: "+79990000000",
    consent: true,
    photos: [],
    configuration: {
      vehicle: "Porsche 911",
      body: "coupe",
      service: "ppf",
      finish: "Satin",
      color: "Original",
      extras: [],
      ppfPackage: "front",
    },
  };
  const uploadForm = new FormData();
  uploadForm.append(
    "photos",
    new File([readFileSync("public/images/hero.webp")], "car.webp", {
      type: "image/webp",
    }),
  );
  const uploadResponse = await fetch(base + "/api/uploads", {
    method: "POST",
    headers: { Cookie: cookie, Origin: base },
    body: uploadForm,
  });
  assert.equal(uploadResponse.status, 201);
  const uploaded = (await uploadResponse.json()).files as string[];
  const uploadCookie = uploadResponse.headers.get("set-cookie")!.split(";")[0];
  assert.equal(
    (await request("/api/media/" + uploaded[0], "GET", undefined, cookie))
      .status,
    403,
  );
  assert.equal(
    (
      await request(
        "/api/quote",
        "POST",
        { ...input, photos: uploaded },
        cookie,
      )
    ).status,
    400,
  );
  passed("uploads require the matching private capability before attachment");
  const quote = await request(
    "/api/quote",
    "POST",
    { ...input, photos: uploaded, estimate: { price: 1 } },
    cookie + "; " + uploadCookie,
  );
  assert.equal(quote.status, 201);
  const output = await quote.json();
  assert.equal(output.estimate.price, 85000);
  assert.equal(output.emailSent, false);
  passed(
    "quote persisted, price recalculated on server, no false email confirmation",
  );
  assert.equal(
    (await request("/api/media/" + uploaded[0], "GET", undefined, cookie))
      .status,
    200,
  );
  passed("owner can retrieve linked photo");
  const dashboard = await request("/dashboard", "GET", undefined, cookie);
  assert.equal(dashboard.status, 200);
  assert(
    (await dashboard.text()).includes(output.id.slice(0, 8).toUpperCase()),
  );
  passed("customer dashboard contains owned project");
  const invalid = await request(
    "/api/quote",
    "POST",
    { ...input, phone: "abc" },
    cookie,
  );
  assert.equal(invalid.status, 400);
  const csrf = await request(
    "/api/quote",
    "POST",
    input,
    cookie,
    "https://attacker.example",
  );
  assert.equal(csrf.status, 403);
  passed("invalid form data and foreign origin are rejected");
  let date = "";
  for (let i = 1; i <= 10; i++) {
    const candidate = studioDate(new Date(Date.now() + i * 86400000));
    if (validBookingDate(candidate)) {
      date = candidate;
      break;
    }
  }
  const before = await (await request("/api/bookings?date=" + date)).json();
  assert(before.slots.includes("10:00"));
  const booked = await request(
    "/api/bookings",
    "POST",
    { ...input, email: "booking-test@example.invalid", date, time: "10:00" },
    cookie,
  );
  assert.equal(booked.status, 201);
  const booking = await booked.json();
  const bookedDashboard = await (
    await request("/dashboard", "GET", undefined, cookie)
  ).text();
  assert(bookedDashboard.includes(date));
  assert(!bookedDashboard.includes('"digest"'));
  const duplicate = await request(
    "/api/bookings",
    "POST",
    { ...input, email: "other-test@example.invalid", date, time: "10:00" },
    cookie,
  );
  assert.equal(duplicate.status, 409);
  const after = await (await request("/api/bookings?date=" + date)).json();
  assert(!after.slots.includes("10:00"));
  passed(
    "booking persisted, occupied time removed, duplicate booking rejected",
  );
  const login = await request("/api/auth", "POST", {
    action: "login",
    email: adminEmail,
    password,
  });
  assert.equal(login.status, 200);
  const adminCookie = login.headers.get("set-cookie")!.split(";")[0];
  const data = await (
    await request("/api/admin", "GET", undefined, adminCookie)
  ).json();
  assert.equal(data.leads.length, 2);
  passed("administrator can inspect persisted leads and bookings");
  const patch = await request(
    "/api/admin",
    "PATCH",
    {
      action: "lead",
      id: output.id,
      status: "IN PROGRESS",
      stage: "INSTALLATION",
      invoice: 99000,
      warranty: "Test warranty",
      recommendation: "Test care",
      documents: [{ title: "Test document", content: "Agreed project terms" }],
    },
    adminCookie,
  );
  assert.equal(patch.status, 200);
  const own = await request("/dashboard", "GET", undefined, cookie);
  assert((await own.text()).includes("INSTALLATION"));
  passed("admin updates stage, invoice, warranty and documents");
  const cancel = await request(
    "/api/admin",
    "PATCH",
    { action: "booking", id: booking.bookingId, status: "CANCELLED" },
    adminCookie,
  );
  assert.equal(cancel.status, 200);
  assert(
    (await (await request("/api/bookings?date=" + date)).json()).slots.includes(
      "10:00",
    ),
  );
  passed("cancelled booking releases slot");
  const catalog = data.catalog;
  catalog.settings.name = "TEST STUDIO";
  catalog.services[0].price = 252000;
  assert.equal(
    (
      await request(
        "/api/admin",
        "PATCH",
        { action: "catalog", catalog },
        adminCookie,
      )
    ).status,
    200,
  );
  const page = await (await request("/")).text();
  assert(page.includes("TEST STUDIO"));
  passed("catalog changes reflected on public pages");
  const customer2 = await request("/api/auth", "POST", {
    action: "register",
    name: "Other customer",
    email: "second-test@example.invalid",
    password,
  });
  const secondCookie = customer2.headers.get("set-cookie")!.split(";")[0];
  const isolated = await (
    await request("/dashboard", "GET", undefined, secondCookie)
  ).text();
  assert(!isolated.includes(output.id.slice(0, 8).toUpperCase()));
  passed("other customers cannot see private projects");
  assert.equal(
    (await request("/api/media/" + uploaded[0], "GET", undefined, secondCookie))
      .status,
    403,
  );
  passed("other customers cannot retrieve private photos");
  const ai = await request("/api/visualize", "POST", {}, cookie);
  assert.equal(ai.status, 503);
  passed("unconfigured AI reports unavailable");
  assert.equal(
    (await request("/api/auth", "POST", { action: "logout" }, cookie)).status,
    200,
  );
  const auth = await (
    await request("/api/auth", "GET", undefined, cookie)
  ).json();
  assert.equal(auth.user, null);
  passed("logout revokes server session");
  process.stdout.write(`Integration checks passed: ${checks}\n`);
} catch (error) {
  process.stderr.write(logs.slice(-8000) + "\n");
  throw error;
} finally {
  server.kill("SIGTERM");
  await new Promise<void>((resolve) => {
    server.once("exit", () => resolve());
    setTimeout(() => {
      server.kill("SIGKILL");
      resolve();
    }, 5000).unref();
  });
  db().close();
  rmSync(directory, { recursive: true, force: true });
}
