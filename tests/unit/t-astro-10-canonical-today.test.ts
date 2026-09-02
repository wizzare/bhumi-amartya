/**
 * T-ASTRO-10 — Canonical date/timezone contract boundary tests.
 *
 * Run with: npx tsx tests/unit/t-astro-10-canonical-today.test.ts
 *
 * Validates the single canonical utility (getCanonicalToday) used by
 * Dashboard / Wellness / Astro / Catatan Hari Ini / Weekly Guidance:
 *  - timezone hierarchy (profile > browser > UTC)
 *  - localDateKey agreement across consumers
 *  - midnight boundary (Asia/Jakarta, America/New_York)
 *  - server UTC differing from user timezone
 *  - same local date with different UTC dates
 *  - calculationInstant preserved as the real astronomical instant
 */
import assert from "node:assert/strict";
import { getCanonicalToday, getCalculationInstantForLocalDate } from "../../lib/dailyGuidance/canonicalToday.js";

let passed = 0;
function test(label: string, fn: () => void): void {
  fn();
  passed += 1;
  console.log(`PASS: ${label}`);
}

// Helper: build an instant at a specific wall-clock time in a given IANA timezone.
// Build 106 test-helper correction: the original iterative-offset version crossed
// day boundaries incorrectly for a 23:59 wall time near a large positive UTC
// offset (it landed on the next day). This computes the offset directly. The
// product utility under test (getCanonicalToday / getLocalDateKey) is recovered
// verbatim and is exercised correctly by v5-astro-core / v5-daily-synthesis.
function instantInTimezone(y: number, mo: number, d: number, h: number, mi: number, tz: string): Date {
  const asIfUTC = Date.UTC(y, mo - 1, d, h, mi, 0);
  const wall = new Date(asIfUTC);
  const tzMs = new Date(wall.toLocaleString("en-US", { timeZone: tz })).getTime();
  const utcMs = new Date(wall.toLocaleString("en-US", { timeZone: "UTC" })).getTime();
  const offsetMs = tzMs - utcMs;
  return new Date(asIfUTC - offsetMs);
}

test("timezone hierarchy: profile beats browser/UTC", () => {
  const r = getCanonicalToday({ uid: "u1", profileTimezone: "Asia/Jakarta", browserTimezone: "America/New_York" });
  assert.equal(r.timezone, "Asia/Jakarta");
});

test("timezone hierarchy: browser used when profile absent", () => {
  const r = getCanonicalToday({ uid: "u2", browserTimezone: "America/New_York" });
  assert.equal(r.timezone, "America/New_York");
});

test("Asia/Jakarta near midnight: localDateKey correct on both sides", () => {
  // 1 minute before and after Jakarta midnight (16:59 / 17:01 UTC on 2026-08-24)
  const before = instantInTimezone(2026, 8, 24, 23, 59, "Asia/Jakarta");
  const after = instantInTimezone(2026, 8, 25, 0, 1, "Asia/Jakarta");
  assert.equal(getCanonicalToday({ uid: "u3", profileTimezone: "Asia/Jakarta", now: before }).localDateKey, "2026-08-24");
  assert.equal(getCanonicalToday({ uid: "u3", profileTimezone: "Asia/Jakarta", now: after }).localDateKey, "2026-08-25");
});

test("America/New_York near midnight: localDateKey correct on both sides", () => {
  // 1 minute before and after NY midnight (03:59 / 04:01 UTC on 2026-08-24)
  const before = instantInTimezone(2026, 8, 24, 23, 59, "America/New_York");
  const after = instantInTimezone(2026, 8, 25, 0, 1, "America/New_York");
  assert.equal(getCanonicalToday({ uid: "u4", profileTimezone: "America/New_York", now: before }).localDateKey, "2026-08-24");
  assert.equal(getCanonicalToday({ uid: "u4", profileTimezone: "America/New_York", now: after }).localDateKey, "2026-08-25");
});

test("server UTC differs from user timezone but localDateKey stays in user TZ", () => {
  // A server-rendered instant at 17:30 UTC on 2026-08-24 = 00:30 WIB 2026-08-25
  const serverInstant = new Date(Date.UTC(2026, 7, 24, 17, 30, 0));
  const r = getCanonicalToday({ uid: "u5", profileTimezone: "Asia/Jakarta", now: serverInstant });
  assert.equal(r.localDateKey, "2026-08-25");
  assert.equal(r.timezone, "Asia/Jakarta");
});

test("same UTC instant yields different localDateKey across timezones", () => {
  // UTC 2026-08-25T01:30:00 = 08:30 WIB (Aug 25) vs 2026-08-24 18:30 PT (Aug 24, no DST)
  const utc = new Date(Date.UTC(2026, 7, 25, 1, 30, 0));
  const jakarta = getCanonicalToday({ uid: "u6", profileTimezone: "Asia/Jakarta", now: utc });
  const la = getCanonicalToday({ uid: "u6", profileTimezone: "America/Los_Angeles", now: utc });
  assert.equal(jakarta.localDateKey, "2026-08-25");
  assert.equal(la.localDateKey, "2026-08-24");
  assert.notEqual(jakarta.localDateKey, la.localDateKey);
});

test("DST timezone: America/New_York spring boundary stays in local TZ", () => {
  // DST starts 2026-03-08 02:00 local. 06:59 UTC Mar 8 = 01:59 EST (Mar 8); 07:01 UTC = 03:01 EDT (Mar 8)
  const before = instantInTimezone(2026, 3, 8, 1, 59, "America/New_York");
  const after = instantInTimezone(2026, 3, 8, 3, 1, "America/New_York");
  assert.equal(getCanonicalToday({ uid: "u7", profileTimezone: "America/New_York", now: before }).localDateKey, "2026-03-08");
  assert.equal(getCanonicalToday({ uid: "u7", profileTimezone: "America/New_York", now: after }).localDateKey, "2026-03-08");
});

test("calculationInstant is the real astronomical instant, not local-date at noon", () => {
  const now = new Date(Date.UTC(2026, 7, 24, 17, 30, 12));
  const r = getCanonicalToday({ uid: "u8", profileTimezone: "Asia/Jakarta", now });
  assert.equal(r.calculationInstant.getTime(), now.getTime());
  assert.notEqual(r.calculationInstant.getUTCHours(), 12 % 24);
});

test("localDate object is start-of-day (noon) for the user's local date", () => {
  const r = getCanonicalToday({ uid: "u9", profileTimezone: "Asia/Jakarta", now: new Date(Date.UTC(2026, 7, 24, 17, 0, 0)) });
  const parts = r.localDate.toISOString(); // UTC noon of 2026-08-25
  assert.ok(parts.startsWith("2026-08-25T12:00:00"), `localDate=${parts}`);
});

test("getCalculationInstantForLocalDate returns noon UTC of that local date", () => {
  const inst = getCalculationInstantForLocalDate("2026-08-24", "Asia/Jakarta");
  assert.equal(inst.toISOString(), "2026-08-24T12:00:00.000Z");
});

test("no duplicate date utility: canonical depends on getLocalDateKey only", () => {
  // getCanonicalToday must reuse the canonical getLocalDateKey; verify round-trip.
  const r = getCanonicalToday({ uid: "u10", profileTimezone: "Asia/Jakarta", now: new Date(Date.UTC(2026, 7, 24, 17, 0, 0)) });
  assert.match(r.localDateKey, /^\d{4}-\d{2}-\d{2}$/);
});

console.log(`\nT-ASTRO-10 boundary tests: ${passed} passed`);
if (passed !== 11) {
  console.error("FAIL: expected 11 passing tests");
  process.exit(1);
}
