// Run with: node --test tests/   (Node 22.18+ runs TypeScript directly)
import assert from "node:assert/strict";
import { test } from "node:test";
import { dayKey, formatDay, formatMoney, formatTime, initials } from "../src/lib/format.ts";

// Built from local-time parts so the tests pass in any time zone.
const local = (y: number, mo: number, d: number, h: number, mi: number) => new Date(y, mo - 1, d, h, mi).toISOString();

test("formatTime uses a 12-hour clock", () => {
  assert.equal(formatTime(local(2026, 10, 3, 0, 5)), "12:05 AM");
  assert.equal(formatTime(local(2026, 10, 3, 9, 30)), "9:30 AM");
  assert.equal(formatTime(local(2026, 10, 3, 12, 0)), "12:00 PM");
  assert.equal(formatTime(local(2026, 10, 3, 16, 45)), "4:45 PM");
});

test("formatDay and dayKey agree and are local", () => {
  const iso = local(2026, 10, 3, 23, 30); // late evening: must not roll over to the next UTC day
  assert.equal(formatDay(iso), "Sat, 3 Oct");
  assert.equal(dayKey(iso), "2026-10-03");
});

test("formatMoney formats minor units", () => {
  assert.match(formatMoney(4500, "USD"), /45\.00/);
  assert.equal(formatMoney(4500, "NOT-A-CURRENCY"), "NOT-A-CURRENCY 45.00"); // graceful fallback
});

test("initials", () => {
  assert.equal(initials("Dr. Amara Okafor"), "AO");
  assert.equal(initials("Madonna"), "M");
  assert.equal(initials(""), "?");
});
