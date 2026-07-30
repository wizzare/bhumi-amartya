import assert from "node:assert";
import { getEntitlementStatus } from "../../lib/billing/entitlementService";
import type { FounderTesterRecord } from "../../lib/billing/founderTesterSourceOfTruth";

console.log("▶ Running Entitlement PII-Fix + Trial-Timing Integration Tests\n");

let passed = 0;
let failed = 0;

function test(label: string, condition: boolean, detail?: string) {
  if (condition) { passed++; console.log(`  PASS: ${label}`); }
  else { failed++; console.error(`  FAIL: ${label}${detail ? " — " + detail : ""}`); }
}

const NOW = new Date("2026-07-30T12:00:00+07:00");

const introRecord: FounderTesterRecord = {
  uid: "synthetic-uid-inti",
  registeredAt: "2026-06-01",
  activeDays: 5,
  badge: "Penjaga Bhumi Inti",
  sourceBadge: "Inti",
  membership: "PREMIUM_2_MONTHS",
  premiumMonths: 2,
  trialDays: null,
};

const alfaRecord: FounderTesterRecord = {
  uid: "synthetic-uid-alfa",
  registeredAt: "2026-06-01",
  activeDays: 5,
  badge: "Penjaga Bhumi Alfa",
  sourceBadge: "Alfa",
  membership: "PREMIUM_1_MONTH",
  premiumMonths: 1,
  trialDays: null,
};

// 1. testerRecord present (PII-fix-sourced, async lookup result) takes precedence
//    over legacy login-count-style fields — Priority 2 wins, Priority 4 never runs.
{
  const profile: any = {
    uid: "u1",
    // legacy login-count field present but must be ignored since testerRecord wins
    trialLoginCount: 999,
    setupCompleted: true,
  };
  const result = getEntitlementStatus(profile, NOW, introRecord);
  test(
    "1. testerRecord (Inti) takes precedence over stray legacy login-count fields",
    result.isPremium === true && result.reason === "inti_badge",
    `got reason=${result.reason} isPremium=${result.isPremium}`,
  );
}

// 2. testerRecord null/absent + valid time-based trial fields not yet expired
//    -> Priority 4 (time-based fix) must correctly grant trial access.
{
  const trialStart = new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000); // started 2 days ago
  const trialEnd = new Date(NOW.getTime() + 5 * 24 * 60 * 60 * 1000); // ends in 5 days
  const profile: any = {
    uid: "u2",
    trialStartedAt: trialStart.toISOString(),
    trialEndsAt: trialEnd.toISOString(),
  };
  const result = getEntitlementStatus(profile, NOW, null);
  test(
    "2. testerRecord absent + active time window -> time-based trial grants access",
    result.isPremium === true && result.reason === "trial" && result.source === "7-Day Trial",
    `got reason=${result.reason} source=${result.source}`,
  );
}

// 3. testerRecord null + trialEndsAt already PASSED, plan field stale ("active"/unset)
//    -> reproduces the exact aggregate-audit finding (32/33 users): time-based
//    expiry must cut access off even though the stale plan field never flipped.
{
  const trialStart = new Date(NOW.getTime() - 20 * 24 * 60 * 60 * 1000); // started 20 days ago
  const trialEnd = new Date(NOW.getTime() - 13 * 24 * 60 * 60 * 1000); // ended 13 days ago
  const profile: any = {
    uid: "u3",
    trialStartedAt: trialStart.toISOString(),
    trialEndsAt: trialEnd.toISOString(),
    plan: "trial", // stale — never flipped to "expired", matching the real aggregate finding
  };
  const result = getEntitlementStatus(profile, NOW, null);
  test(
    "3. testerRecord absent + trialEndsAt already past -> correctly exhausted despite stale plan field",
    result.isPremium === false && result.status === "Trial Exhausted",
    `got isPremium=${result.isPremium} status=${result.status}`,
  );
}

// 4. testerRecord present (Alfa) AND profile also carries trial-like fields that
//    would otherwise grant/deny trial access -> Priority 2 must still short-circuit
//    Priority 4 entirely. Proves the two fixes don't bleed into each other.
//    accessUntil is set explicitly (as a real explicit grant would have it) so this
//    doesn't depend on ALFA_ACCESS_UNTIL's hardcoded default relative to NOW.
{
  const explicitGrantUntil = new Date(NOW.getTime() + 60 * 24 * 60 * 60 * 1000);
  const futureTrialEnd = new Date(NOW.getTime() + 100 * 24 * 60 * 60 * 1000);
  const profile: any = {
    uid: "u4",
    accessUntil: explicitGrantUntil.toISOString(),
    trialStartedAt: NOW.toISOString(),
    trialEndsAt: futureTrialEnd.toISOString(), // would independently grant a long trial
    plan: "trial",
  };
  const result = getEntitlementStatus(profile, NOW, alfaRecord);
  test(
    "4. testerRecord (Alfa) short-circuits Priority 4 even with coexisting trial fields",
    result.isPremium === true && result.reason === "alfa_badge" && result.source === "Explicit Grant",
    `got reason=${result.reason} source=${result.source}`,
  );
}

// 5. The documented "Scheduled grant" fallthrough (now < hardcoded grant start,
//    Priority 2 falls through without returning) turns out to be PROVABLY
//    UNREACHABLE, not just unreachable for today's date: GAIA_ACCESS_END
//    (2026-07-01) is later than INTI/ALFA_GRANT_STARTS_AT (2026-06-29), so any
//    `now` early enough to be "Scheduled" in Priority 2 is necessarily also
//    caught by Priority 0's Gaia override first. This test proves that
//    precedence holds -- the fallthrough branch is genuinely dead code, not a
//    silent bug, for as long as these two constants keep their current
//    relative ordering.
{
  const beforeGrantStart = new Date("2026-06-01T00:00:00+07:00"); // before both Gaia end and grant start
  const accessUntil = new Date("2026-06-15T00:00:00+07:00");
  const profile: any = {
    uid: "u5",
    accessUntil: accessUntil.toISOString(),
  };
  const result = getEntitlementStatus(profile, beforeGrantStart, introRecord);
  test(
    "5. Gaia override precedence keeps the Scheduled-grant fallthrough provably unreachable",
    result.reason === "override" && result.isPremium === true,
    `got reason=${result.reason} isPremium=${result.isPremium}`,
  );
}

console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
