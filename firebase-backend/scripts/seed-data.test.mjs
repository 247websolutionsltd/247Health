// Run with: node --test scripts/
import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCatalog, buildSlots, DOCTORS, SPECIALTIES } from "./seed-data.mjs";

const NOW = new Date("2026-10-19T08:00:00Z"); // a Monday

test("every doctor references a real specialty and ids are unique", () => {
  const specialtyIds = new Set(SPECIALTIES.map((s) => s.id));
  assert.equal(specialtyIds.size, SPECIALTIES.length);
  assert.equal(new Set(DOCTORS.map((d) => d.id)).size, DOCTORS.length);
  for (const d of DOCTORS) assert.ok(specialtyIds.has(d.specialty_id), `${d.id} -> ${d.specialty_id}`);
  assert.equal(buildCatalog({ now: NOW }).doctors.every((d) => d.specialty_name), true);
});

test("slots are unique, in the future, 30 minutes long and never on Sunday (clinic time)", () => {
  const slots = buildSlots({ now: NOW, days: 14, utcOffsetHours: 1, minLeadHours: 2 });
  assert.ok(slots.length > 100);
  assert.equal(new Set(slots.map((s) => s.id)).size, slots.length, "slot ids must be unique");
  for (const s of slots) {
    assert.ok(s.startsAt.getTime() >= NOW.getTime() + 2 * 3600_000, `${s.id} is inside the lead time`);
    assert.equal(s.endsAt.getTime() - s.startsAt.getTime(), 30 * 60_000);
    const clinicLocal = new Date(s.startsAt.getTime() + 3600_000);
    assert.notEqual(clinicLocal.getUTCDay(), 0, `${s.id} falls on a Sunday`);
    const hour = clinicLocal.getUTCHours();
    assert.ok(hour >= 9 && hour < 17 && hour !== 12, `${s.id} is outside clinic hours`);
  }
});

test("slot ids are deterministic so re-seeding never duplicates", () => {
  const a = buildSlots({ now: NOW }).map((s) => s.id);
  const b = buildSlots({ now: new Date(NOW.getTime() + 3600_000) }).map((s) => s.id);
  const overlap = a.filter((id) => b.includes(id));
  assert.ok(overlap.length > 0);
  assert.deepEqual(overlap, b.filter((id) => a.includes(id)));
});

test("consultation fees are whole minor units", () => {
  for (const d of DOCTORS) assert.ok(Number.isInteger(d.consultation_fee_minor) && d.consultation_fee_minor > 0, d.id);
});
