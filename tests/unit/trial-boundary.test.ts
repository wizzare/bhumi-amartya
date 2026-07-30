import { getEntitlementStatus } from "../../lib/billing/entitlementService";

console.log("▶ Running Trial Timing Boundary Unit Tests\n");

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

// Test 1: Tepat saat trial dimulai (exact start)
{
  const profile = {
    uid: "u1",
    trialStartedAt: NOW.toISOString(),
    setupCompleted: true,
  } as any;
  const status = getEntitlementStatus(profile, NOW);
  test("exact trial start is active premium trial", status.isPremium === true && status.reason === "trial");
  test("exact trial start daysRemaining is 7", status.daysRemaining === 7);
}

// Test 2: Sebelum 7x24 jam (e.g. 3 hari setelah start)
{
  const started = new Date(NOW.getTime() - 3 * 24 * 3600 * 1000).toISOString();
  const profile = {
    uid: "u2",
    trialStartedAt: started,
    setupCompleted: true,
  } as any;
  const status = getEntitlementStatus(profile, NOW);
  test("before 7x24h is active trial", status.isPremium === true && status.reason === "trial");
  test("3 days elapsed has 4 days remaining", status.daysRemaining === 4);
}

// Test 3: Tepat pada expiry (7x24h)
{
  const started = new Date(NOW.getTime() - SEVEN_DAYS_MS).toISOString();
  const profile = {
    uid: "u3",
    trialStartedAt: started,
    setupCompleted: true,
  } as any;
  const status = getEntitlementStatus(profile, NOW);
  test("exact expiry timestamp is NOT premium", status.isPremium === false);
  test("exact expiry timestamp status is Trial Exhausted", status.status === "Trial Exhausted");
}

// Test 4: Setelah expiry (e.g. 8 hari setelah start)
{
  const started = new Date(NOW.getTime() - 8 * 24 * 3600 * 1000).toISOString();
  const profile = {
    uid: "u4",
    trialStartedAt: started,
    setupCompleted: true,
  } as any;
  const status = getEntitlementStatus(profile, NOW);
  test("after expiry is NOT premium", status.isPremium === false);
  test("after expiry daysRemaining is 0", status.daysRemaining === 0);
}

// Test 5: Timezone berbeda (+07:00 string offset)
{
  // Started on July 20 2026 12:00 +07:00 (which is July 20 05:00 UTC)
  const profile = {
    uid: "u5",
    trialStartedAt: "2026-07-20T12:00:00+07:00",
    setupCompleted: true,
  } as any;
  const status = getEntitlementStatus(profile, NOW); // NOW is July 25 12:00 UTC (5.29 days elapsed)
  test("timezone offset ISO date parsed correctly and active", status.isPremium === true && status.reason === "trial");
}

// Test 6: Timestamp null (new user during setup)
{
  const profile = {
    uid: "u6",
    setupCompleted: true,
  } as any;
  const status = getEntitlementStatus(profile, NOW);
  test("null timestamp defaults to active 7-day trial for completed setup", status.isPremium === true && status.reason === "trial");
}

// Test 7: Legacy user (registered 15 days ago with no explicit trial fields)
{
  const profile = {
    uid: "u7",
    createdAt: "2026-07-10T00:00:00.000Z",
    setupCompleted: true,
  } as any;
  const status = getEntitlementStatus(profile, NOW);
  test("legacy user registered 15 days ago is expired", status.isPremium === false);
}

// Test 8: Reinstall / login repeat (high loginCount does NOT reset or expire active trial early)
{
  const started = new Date(NOW.getTime() - 2 * 24 * 3600 * 1000).toISOString();
  const profile = {
    uid: "u8",
    trialStartedAt: started,
    trialLoginCount: 50, // 50 logins on day 2
    setupCompleted: true,
  } as any;
  const status = getEntitlementStatus(profile, NOW);
  test("high login count does NOT expire time-based trial early", status.isPremium === true && status.reason === "trial");
}

console.log(`\nResults: ${passed + failed} tests, ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
