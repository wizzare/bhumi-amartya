/**
 * HOTFIX-021 — Pre-20 July Inbox Cleanup Selector Tests
 *
 * Classification: CONTRACT / STATIC LOGIC TESTS
 *
 * Proves the cleanup cutoff logic behaves correctly at the boundary.
 * Does not require Firestore access.
 *
 * Run with:
 *   npx tsx tests/hotfix-021-pre-july20-cleanup.test.ts
 */

import { Timestamp } from "firebase-admin/firestore";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) { console.log(`  \u2713 ${label}`); passed++; }
  else { console.log(`  \u2717 ${label}`); failed++; }
}

console.log("\u25B6 Running HOTFIX-021 Suite: Pre-20 July Inbox Cleanup Selector\n");

const CUTOFF = Timestamp.fromDate(new Date("2026-07-19T17:00:00.000Z")); // 2026-07-20 00:00 WIB
const CUTOFF_MS = CUTOFF.toMillis();

function isEligible(ts: Timestamp | null | undefined): boolean {
  if (!ts) return false;
  return ts.toMillis() < CUTOFF_MS;
}

// 1: 19 July 2026 23:59:59 WIB is eligible (1 second before cutoff)
const beforeCutoff = Timestamp.fromDate(new Date("2026-07-19T16:59:59.000Z"));
assert(isEligible(beforeCutoff) === true, "1. 2026-07-19 23:59:59 WIB is eligible");

// 2: 20 July 2026 00:00:00 WIB is retained (exactly at cutoff — not < cutoff)
const atCutoff = Timestamp.fromDate(new Date("2026-07-19T17:00:00.000Z"));
assert(isEligible(atCutoff) === false, "2. 2026-07-20 00:00:00 WIB is retained (not eligible)");

// 3: 20 July 2026 00:00:01 WIB is retained
const afterCutoff = Timestamp.fromDate(new Date("2026-07-19T17:00:01.000Z"));
assert(isEligible(afterCutoff) === false, "3. 2026-07-20 00:00:01 WIB is retained");

// 4: createdAt is a future date — retained
const future = Timestamp.fromDate(new Date("2026-08-01T00:00:00.000Z"));
assert(isEligible(future) === false, "4. Future date is retained");

// 5: null createdAt is skipped
assert(isEligible(null) === false, "5. null createdAt is skipped (not eligible)");

// 6: undefined createdAt is skipped
assert(isEligible(undefined) === false, "6. undefined createdAt is skipped (not eligible)");

// 7: Well before cutoff (e.g. 1 July) is eligible
const earlyJuly = Timestamp.fromDate(new Date("2026-07-01T00:00:00.000Z"));
assert(isEligible(earlyJuly) === true, "7. 1 July 2026 is eligible");

// 8: Same cutoff using number comparison (Firestore Timestamp millis)
const asNumber = beforeCutoff.toMillis();
assert(asNumber < CUTOFF_MS, "8. Timestamp millis comparison works correctly");

// 9: At-cutoff millis comparison is not less than
assert(atCutoff.toMillis() < CUTOFF_MS === false, "9. At-cutoff millis is NOT less than cutoff");

// 10: After-cutoff millis comparison is not less than
assert(afterCutoff.toMillis() < CUTOFF_MS === false, "10. After-cutoff millis is NOT less than cutoff");

// 11: Cutoff UTC string correct
assert(CUTOFF.toDate().toISOString() === "2026-07-19T17:00:00.000Z", "11. Cutoff UTC ISO is correct");

// 12: Cutoff in WIB = 2026-07-20 00:00:00
const wibDate = new Date(CUTOFF.toMillis() + 7 * 60 * 60 * 1000);
assert(
  wibDate.toISOString() === "2026-07-20T00:00:00.000Z",
  "12. Cutoff +7h = 2026-07-20T00:00:00.000Z (Asia/Jakarta midnight)"
);

// ── Summary ──────────────────────────────────────────────────────────────
console.log(`\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501`);
console.log(`HOTFIX-021 Pre-20 July Inbox Cleanup Selector Tests`);
console.log(`${passed} passed, ${failed} failed`);
if (failed) { process.exit(1); }
console.log(`\u2714 ALL ${passed} CLEANUP SELECTOR ASSERTIONS PASSED`);
console.log(`\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501`);
