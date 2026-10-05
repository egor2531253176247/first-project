import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculate,
  validBookingDate,
  studioDate,
  type Configuration,
} from "../src/lib/calculator.ts";
import { services } from "../src/lib/catalog.ts";
const config: Configuration = {
  vehicle: "BMW M4 Competition",
  body: "coupe",
  service: "wrap",
  finish: "Satin",
  color: "Graphite Black",
  extras: [],
};
test("base quote uses catalog prices", () => {
  assert.equal(calculate(config, services).price, 180000);
  assert.equal(calculate(config, services).days, 4);
});
test("SUV and special finishes increase estimate", () => {
  assert.equal(
    calculate({ ...config, body: "suv", finish: "Metallic" }, services).price,
    248000,
  );
});
test("extras add cost once and increase installation time", () => {
  const actual = calculate(
    { ...config, extras: ["antichrome", "roof", "roof"] },
    services,
  );
  assert.equal(actual.price, 233000);
  assert.equal(actual.days, 5);
});
test("PPF package selection affects coverage estimate", () => {
  assert.equal(
    calculate({ ...config, service: "ppf", ppfPackage: "front" }, services)
      .price,
    85000,
  );
  assert.equal(
    calculate({ ...config, service: "ppf", ppfPackage: "track" }, services)
      .days,
    3,
  );
});
test("admin price update applies to PPF packages", () => {
  const updated = services.map((s) =>
    s.id === "ppf" ? { ...s, price: 252000 } : s,
  );
  assert.equal(
    calculate({ ...config, service: "ppf", ppfPackage: "front" }, updated)
      .price,
    102000,
  );
});
test("unknown service cannot produce a price", () => {
  assert.throws(() => calculate({ ...config, service: "unknown" }, services));
});
test("unknown body, finish and extra are rejected", () => {
  assert.throws(() =>
    calculate({ ...config, body: "truck" as Configuration["body"] }, services),
  );
  assert.throws(() =>
    calculate({ ...config, finish: "Unrecognized" }, services),
  );
  assert.throws(() => calculate({ ...config, extras: ["injected"] }, services));
});
test("booking date uses Moscow rather than UTC", () => {
  assert.equal(studioDate(new Date("2026-10-05T22:30:00Z")), "2026-10-06");
});
test("past dates, today, Sunday and invalid calendar dates are unavailable", () => {
  const now = new Date("2026-10-05T22:30:00Z");
  for (const date of [
    "2026-10-05",
    "2026-10-06",
    "2026-10-11",
    "2026-02-30",
    "wrong",
    "2027-01-01",
  ])
    assert.equal(validBookingDate(date, now), false, date);
});
test("future workday inside booking window is valid", () => {
  assert.equal(
    validBookingDate("2026-10-07", new Date("2026-10-05T22:30:00Z")),
    true,
  );
});
