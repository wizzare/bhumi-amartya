import { getEntitlementStatus } from "../../lib/billing/entitlementService";

console.log("▶ Running Comprehensive Trial Timing Boundary Unit Tests\n");

let passed = 0;
let failed = 0;

function test(label: string, condition: boolean, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${label}`);
  } else {
    failed++;
    console.error(`  FAIL: ${label}${detail ? " — " + detail : ""}`);
  }
}

const T0 = new Date("2026-07-25T12:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;

// ==========================================
// 1. SEQUENTIAL PROFILE TIME-SERIES TESTING
// Using the EXACT SAME user profile evaluated across T0 -> T0+8 days
// ==========================================
console.log("--- 1. SEQUENTIAL SINGLE-PROFILE EVALUATION ---");

const sequentialProfile = {
  uid: "seq_user_001",
  setupCompleted: true,
  trialStartedAt: T0.toISOString(),
  trialLoginCount: 1,
};

// T0: Initial activation
{
  const s0 = getEntitlementStatus(sequentialProfile, T0);
  test("T0: Profile at activation is active trial", s0.isPremium === true && s0.reason === "trial");
  test("T0: Sisa trial is 7 days", s0.daysRemaining === 7);
  test("T0: Expiry timestamp matches T0 + 7 days", s0.expiresAt?.toISOString() === new Date(T0.getTime() + 7 * DAY_MS).toISOString());
}

// T0 + 1 Day (login 5 times)
{
  const t1 = new Date(T0.getTime() + 1 * DAY_MS);
  const profileAtT1 = { ...sequentialProfile, trialLoginCount: 5 };
  const s1 = getEntitlementStatus(profileAtT1, t1);
  test("T0+1d: Profile at Day 1 is active trial", s1.isPremium === true);
  test("T0+1d: Days remaining degrades deterministically to 6", s1.daysRemaining === 6);
  test("T0+1d: Expiry timestamp DOES NOT SHIFT", s1.expiresAt?.toISOString() === new Date(T0.getTime() + 7 * DAY_MS).toISOString());
}

// T0 + 6 Days (reinstall + login 15 times)
{
  const t6 = new Date(T0.getTime() + 6 * DAY_MS);
  const profileAtT6 = { ...sequentialProfile, trialLoginCount: 15 };
  const s6 = getEntitlementStatus(profileAtT6, t6);
  test("T0+6d: Profile at Day 6 is active trial", s6.isPremium === true);
  test("T0+6d: Days remaining degrades deterministically to 1", s6.daysRemaining === 1);
  test("T0+6d: Expiry timestamp DOES NOT SHIFT despite 15 logins", s6.expiresAt?.toISOString() === new Date(T0.getTime() + 7 * DAY_MS).toISOString());
}

// T0 + 7 Days (exact expiry boundary)
{
  const t7 = new Date(T0.getTime() + 7 * DAY_MS);
  const s7 = getEntitlementStatus(sequentialProfile, t7);
  test("T0+7d: Profile at exact 7x24h expiry is NOT premium", s7.isPremium === false);
  test("T0+7d: Status is Trial Exhausted", s7.status === "Trial Exhausted");
  test("T0+7d: Days remaining is 0", s7.daysRemaining === 0);
}

// T0 + 8 Days (post-expiry reload)
{
  const t8 = new Date(T0.getTime() + 8 * DAY_MS);
  const s8 = getEntitlementStatus(sequentialProfile, t8);
  test("T0+8d: Profile at Day 8 is NOT premium", s8.isPremium === false);
  test("T0+8d: Status remains Trial Exhausted", s8.status === "Trial Exhausted");
  test("T0+8d: Days remaining remains 0", s8.daysRemaining === 0);
}

// ==========================================
// 2. EDGE CASE & IMMUTABILITY TESTING
// ==========================================
console.log("\n--- 2. EDGE CASES & IMMUTABILITY CONTRACT ---");

// Test: Missing all setup timestamps (no trialStartedAt, no createdAt, no registeredAt)
{
  const profileMissingStamps = { uid: "u_no_stamps", setupCompleted: true } as any;
  const s = getEntitlementStatus(profileMissingStamps, T0);
  test("Missing all timestamps DOES NOT grant trial", s.isPremium === false);
  test("Missing timestamps status is Missing Setup Timestamp", s.status === "Missing Setup Timestamp");
}

// Test: Legacy user without trialStartedAt using createdAt (registered 20 days ago)
{
  const legacyProfile = { uid: "u_legacy", createdAt: "2026-07-01T00:00:00Z", setupCompleted: true } as any;
  const s = getEntitlementStatus(legacyProfile, T0);
  test("Legacy profile registered 24 days ago evaluates as expired trial", s.isPremium === false && s.status === "Trial Exhausted");
}

// Test: High login count on day 1 (loginCount = 50)
{
  const highLoginProfile = { uid: "u_high_login", trialStartedAt: T0.toISOString(), trialLoginCount: 50, setupCompleted: true } as any;
  const s = getEntitlementStatus(highLoginProfile, T0);
  test("50 logins on day 1 DOES NOT expire time-based trial early", s.isPremium === true && s.daysRemaining === 7);
}

console.log(`\nResults: ${passed + failed} tests, ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
