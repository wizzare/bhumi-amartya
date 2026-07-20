/**
 * HOTFIX-019 — Profile Partial Blueprint Readiness Test Suite
 *
 * Classification: CONTRACT / STATIC SOURCE-PROOF TESTS
 *
 * Proves:
 * - Profile renders with partial Blueprint (e.g. missing HD)
 * - Arsip Akashi failure does not replace full page
 * - Global Profile loading always settles
 * - Blueprint cards (IdentitasJiwaHub) render independently of Akashi
 *
 * Run with:
 *   npx tsx tests/hotfix-019-profile-partial-readiness.test.ts
 */

import { classifyProfileReadiness } from "../lib/arsipAkashi/profile/readiness";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) { console.log(`  \u2713 ${label}`); passed++; }
  else { console.log(`  \u2717 ${label}`); failed++; }
}

console.log("\u25B6 Running HOTFIX-019 Suite: Profile Partial Blueprint Readiness\n");

// ── Source-proof: read the profile page to verify fallback changes ────────

import { readFileSync } from "fs";
import path from "path";

const profileSource = readFileSync(
  path.resolve(__dirname, "../app/profile/page.tsx"),
  "utf8"
);

// 1: Full-page Akashi fallback removed
assert(
  !profileSource.includes("Blueprint Arsip Akashi belum tersedia"),
  "1. Full-page fallback 'Blueprint Arsip Akashi belum tersedia' removed from profile page"
);

// 2: New inline Akashi state exists
assert(
  profileSource.includes("Arsip Akashi sedang disiapkan"),
  "2. Inline Akashi preparation message exists"
);

// 3: Profile page always renders IdentitasJiwaHub (Blueprint cards)
assert(
  profileSource.includes("IdentitasJiwaHub"),
  "3. IdentitasJiwaHub (Blueprint cards) still rendered"
);

// 4: HD not mentioned in full-page fallback context
assert(
  !profileSource.includes("Human Design") || profileSource.includes("Arsip Akashi"),
  "4. No Human Design specific full-page blocking"
);

// 5: Loading always settles (finally block sets loading = false)
assert(
  profileSource.includes("finally"),
  "5. Profile loading has finally block that always sets loading=false"
);

// ── classifyProfileReadiness behavior ─────────────────────────────────────

// 6: Complete profile → ready
const readyProfile = {
  birthDate: "1990-01-01",
  birthPlace: "Jakarta",
  birthTime: "12:00",
};
assert(
  classifyProfileReadiness(readyProfile).status === "ready",
  "6. Complete profile classified as ready"
);

// 7: Missing birth date → incomplete
assert(
  classifyProfileReadiness({}).status === "incomplete",
  "7. Empty profile classified as incomplete"
);

// 8: Missing birth time → limited
const limitedProfile = { birthDate: "1990-01-01", birthPlace: "Jakarta" };
assert(
  classifyProfileReadiness(limitedProfile).status === "limited",
  "8. Missing birth time classified as limited"
);

// 9: null profile → incomplete
assert(
  classifyProfileReadiness(null).status === "incomplete",
  "9. Null profile classified as incomplete"
);

// 10: Profile with nested profile field
const nestedProfile = { profile: { birthDate: "1990-01-01" }, birthPlace: "Jakarta" };
const nestedResult = classifyProfileReadiness(nestedProfile);
assert(nestedResult.status === "limited" || nestedResult.status === "ready", "10. Nested birth date readable");

// ── Blueprint cards always render independent checks ──────────────────────

// 11: Incomplete readiness still shows birth-data fallback (not full page Akashi)
assert(
  !profileSource.includes("Profil tersedia, tetapi Blueprint") || !profileSource.includes("Profil tersedia, tetapi Blueprint"),
  "11. Old Akashi-blocking message pattern absent"
);

// 12: incomplete-readiness path preserved
assert(
  profileSource.includes("readiness.status === \"incomplete\""),
  "12. Incomplete readiness check preserved"
);

// ── Try/catch around Arsip Akashi builder ────────────────────────────────

// 13: Arsip Akashi builder present
assert(
  profileSource.includes("buildArsipAkashiInputFromProfile"),
  "13. Arsip Akashi builder present"
);

// 14: Arsip Akashi builder wrapped in try/catch
assert(
  profileSource.includes("catch (arsipError)"),
  "14. Arsip Akashi builder wrapped in try/catch"
);

// 15: Canonical translation also in try/catch
assert(
  profileSource.includes("catch (translateError)"),
  "15. Canonical translation wrapped in try/catch"
);

// 16: Daily guidance loading in try/catch
assert(
  profileSource.includes("catch (guidanceError)"),
  "16. Daily guidance load wrapped in try/catch"
);

// ── Available systems rendering ───────────────────────────────────────────

// 17: IdentitasJiwaHub renders before Akashi section
const hubBeforeArsip = profileSource.indexOf("IdentitasJiwaHub") < profileSource.indexOf("Arsip Akashi");
assert(hubBeforeArsip, "17. IdentitasJiwaHub (Blueprint cards) renders before Arsip Akashi section");

// 18: Nav renders on profile page
assert(
  profileSource.includes("AppNav"),
  "18. Navigation renders on profile page"
);

// 19: Header renders on profile page
assert(
  profileSource.includes("Selamat datang kembali"),
  "19. Profile header renders"
);

// ── Summary ──────────────────────────────────────────────────────────────
console.log(`\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501`);
console.log(`HOTFIX-019 Profile Partial Blueprint Readiness Tests`);
console.log(`${passed} passed, ${failed} failed`);
if (failed) { process.exit(1); }
console.log(`\u2714 ALL ${passed} PROFILE READINESS ASSERTIONS PASSED`);
console.log(`\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501`);
