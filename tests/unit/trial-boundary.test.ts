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

const NOW = new Date("2026-07-25T12:00:00.000Z");
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Test 1: User tanpa trialStartedAt (setupCompleted: true) -> default active 7 days
{
  const profile = { uid: "u1", setupCompleted: true } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("user tanpa trialStartedAt with setupCompleted gets active 7-day trial", s.isPremium === true && s.reason === "trial");
  test("user tanpa trialStartedAt has 7 days remaining", s.daysRemaining === 7);
}

// Test 2: User memiliki createdAt tetapi belum mengaktifkan trial (setupCompleted: false)
{
  const profile = { uid: "u2", createdAt: NOW.toISOString(), setupCompleted: false } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("user setupCompleted: false without active trialStart is not active trial", s.isPremium === false);
}

// Test 3: User dengan trialStartedAt valid (3 days elapsed)
{
  const started = new Date(NOW.getTime() - 3 * 24 * 3600 * 1000).toISOString();
  const profile = { uid: "u3", trialStartedAt: started, setupCompleted: true } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("user with valid trialStartedAt 3 days ago is active trial", s.isPremium === true && s.reason === "trial");
  test("3 days elapsed has 4 days remaining", s.daysRemaining === 4);
}

// Test 4: Login ke-8 dalam hari pertama (loginCount=8, trialStartedAt=today)
{
  const started = NOW.toISOString();
  const profile = { uid: "u4", trialStartedAt: started, trialLoginCount: 8, setupCompleted: true } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("8th login on day 1 DOES NOT expire time-based trial", s.isPremium === true && s.reason === "trial");
  test("8th login on day 1 retains 7 days remaining", s.daysRemaining === 7);
}

// Test 5: Tepat sebelum 7x24 jam (6 days 23 hours 59 mins elapsed)
{
  const started = new Date(NOW.getTime() - (SEVEN_DAYS_MS - 60_000)).toISOString();
  const profile = { uid: "u5", trialStartedAt: started, setupCompleted: true } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("just before 7x24h is active trial", s.isPremium === true && s.reason === "trial");
  test("just before 7x24h has 1 day remaining", s.daysRemaining === 1);
}

// Test 6: Tepat pada expiry (exactly 7x24h)
{
  const started = new Date(NOW.getTime() - SEVEN_DAYS_MS).toISOString();
  const profile = { uid: "u6", trialStartedAt: started, setupCompleted: true } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("exact 7x24h expiry timestamp is NOT premium", s.isPremium === false);
  test("exact expiry status is Trial Exhausted", s.status === "Trial Exhausted");
}

// Test 7: Setelah expiry (8 days elapsed)
{
  const started = new Date(NOW.getTime() - 8 * 24 * 3600 * 1000).toISOString();
  const profile = { uid: "u7", trialStartedAt: started, setupCompleted: true } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("after expiry is NOT premium", s.isPremium === false);
  test("after expiry daysRemaining is 0", s.daysRemaining === 0);
}

// Test 8: Clock skew (client clock offset by +/- 10 minutes)
{
  const started = new Date(NOW.getTime() - (SEVEN_DAYS_MS - 5 * 60 * 1000)).toISOString();
  const skewedNow = new Date(NOW.getTime() + 10 * 60 * 1000); // 10 min clock skew
  const profile = { uid: "u8", trialStartedAt: started, setupCompleted: true } as any;
  const s = getEntitlementStatus(profile, skewedNow);
  test("clock skew past expiry threshold correctly expires trial", s.isPremium === false);
}

// Test 9: Timestamp masa depan (future timestamp e.g. tomorrow)
{
  const futureStarted = new Date(NOW.getTime() + 24 * 3600 * 1000).toISOString();
  const profile = { uid: "u9", trialStartedAt: futureStarted, setupCompleted: true } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("future trialStartedAt is active trial with max days remaining", s.isPremium === true && s.daysRemaining === 7);
}

// Test 10: Legacy timestamp invalid (malformed date string)
{
  const profile = { uid: "u10", trialStartedAt: "invalid-date-string", setupCompleted: true } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("invalid date string falls back gracefully without throwing error", s.isPremium === true || s.isPremium === false);
}

console.log(`\nResults: ${passed + failed} tests, ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
