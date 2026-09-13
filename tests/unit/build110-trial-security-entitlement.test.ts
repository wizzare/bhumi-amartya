import fs from "node:fs";
import path from "node:path";
import {
  getCanonicalTrialWindow,
  getEntitlementStatus,
} from "../../lib/billing/entitlementService";
import { stripServerOwnedAccessFields } from "../../lib/billing/serverOwnedAccessFields";

console.log("\n=== BUILD 110: TRIAL SECURITY & SERVER-OWNED ENTITLEMENT TEST SUITE ===");

let passed = 0;
function test(name: string, condition: boolean, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${name}`);
  } else {
    console.error(`  FAIL: ${name}${detail ? ` — ${detail}` : ""}`);
    process.exitCode = 1;
  }
}

const read = (p: string) => fs.readFileSync(path.resolve(p), "utf8");
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const NOW = new Date("2026-09-13T12:00:00.000Z");

// ---------------------------------------------------------------------------
// 1. Client Writes Over Entitlement Fields Are Removed
// ---------------------------------------------------------------------------
{
  const authActionsSrc = read("lib/auth/authActions.ts");
  test(
    "CLIENT_CAN_WRITE_TRIAL_START = NO (buildMinimalUserProfile has no trialStartedAt)",
    !/buildMinimalUserProfile[\s\S]*?trialStartedAt\s*:/.test(authActionsSrc),
  );
  test(
    "CLIENT_CAN_WRITE_TRIAL_END = NO (buildMinimalUserProfile has no trialEndsAt)",
    !/buildMinimalUserProfile[\s\S]*?trialEndsAt\s*:/.test(authActionsSrc),
  );
  test(
    "CLIENT_CAN_WRITE_MEMBERSHIP_TYPE = NO (buildMinimalUserProfile has no membershipType)",
    !/buildMinimalUserProfile[\s\S]*?membershipType\s*:/.test(authActionsSrc),
  );
  test(
    "CLIENT_CAN_WRITE_ENTITLEMENT_PLAN = NO (buildMinimalUserProfile has no plan: free_trial)",
    !/buildMinimalUserProfile[\s\S]*?plan\s*:\s*["']free_trial["']/.test(authActionsSrc),
  );

  const setupSrc = read("app/setup/page.tsx");
  test(
    "setup finalize does not write trialStartedAt",
    !/profilePayload[\s\S]*?trialStartedAt\s*:/.test(setupSrc),
  );
  test(
    "setup finalize does not write trialEndsAt",
    !/profilePayload[\s\S]*?trialEndsAt\s*:/.test(setupSrc),
  );
  test(
    "setup finalize does not write membershipType",
    !/profilePayload[\s\S]*?membershipType\s*:/.test(setupSrc),
  );
  test(
    "setup finalize does not write entitlement plan",
    !/profilePayload[\s\S]*?plan\s*:\s*["']free_trial["']/.test(setupSrc),
  );

  // stripServerOwnedAccessFields strips all client attempts to inject entitlement
  const maliciousClientPayload = {
    fullName: "Hacker User",
    birthDate: "1990-01-01",
    trialStartedAt: NOW.toISOString(),
    trialEndsAt: new Date(NOW.getTime() + 365 * 86400000).toISOString(),
    membershipType: "LIFETIME",
    plan: "lifetime_free",
    isPremium: true,
    role: "admin",
    badge: "Founder",
  };
  const sanitized = stripServerOwnedAccessFields(maliciousClientPayload);
  test("CLIENT_CANNOT_GRANT_TRIAL (stripServerOwnedAccessFields strips trialStartedAt)", sanitized.trialStartedAt === undefined);
  test("CLIENT_CANNOT_EXTEND_TRIAL (stripServerOwnedAccessFields strips trialEndsAt)", sanitized.trialEndsAt === undefined);
  test("CLIENT_CANNOT_SET_PREMIUM (stripServerOwnedAccessFields strips isPremium/plan)", sanitized.isPremium === undefined && sanitized.plan === undefined);
  test("CLIENT_CANNOT_SET_LIFETIME (stripServerOwnedAccessFields strips membershipType/badge)", sanitized.membershipType === undefined && sanitized.badge === undefined);
}

// ---------------------------------------------------------------------------
// 2. Exact 7-Day Server Trial Contract (Immutable, Strictly Validated)
// ---------------------------------------------------------------------------
{
  const trialStart = new Date("2026-09-10T10:00:00.000Z");
  const exactTrialEnd = new Date(trialStart.getTime() + SEVEN_DAYS_MS);

  const validProfile = {
    uid: "test-valid-user",
    trialStartedAt: trialStart,
    trialEndsAt: exactTrialEnd,
    entitlementSource: "server_access_bootstrap",
  };

  const window = getCanonicalTrialWindow(validProfile as any);
  test("TRIAL_DURATION_EXACTLY_7_DAYS (valid profile matches 7-day contract)", window.state === "valid");

  const activeStatus = getEntitlementStatus(validProfile as any, new Date("2026-09-12T00:00:00.000Z"));
  test("valid server trial grants premium during trial window", activeStatus.isPremium === true && activeStatus.reason === "trial");

  // Arbitrary duration (e.g. 10 days, 30 days) is REJECTED
  const tenDaysEnd = new Date(trialStart.getTime() + 10 * 24 * 60 * 60 * 1000);
  const tenDaysProfile = {
    uid: "test-invalid-user",
    trialStartedAt: trialStart,
    trialEndsAt: tenDaysEnd,
    entitlementSource: "server_access_bootstrap",
  };
  const invalidWindow = getCanonicalTrialWindow(tenDaysProfile as any);
  test("MALFORMED_TRIAL_FAILS_CLOSED (non-7-day duration fails closed as invalid)", invalidWindow.state === "invalid");
  const invalidStatus = getEntitlementStatus(tenDaysProfile as any, new Date("2026-09-12T00:00:00.000Z"));
  test("malformed trial duration fails closed to Free access (not premium)", invalidStatus.isPremium === false);

  // Unofficial/untrusted client-written source is REJECTED
  const clientWrittenProfile = {
    uid: "test-client-forged",
    trialStartedAt: trialStart,
    trialEndsAt: exactTrialEnd,
    entitlementSource: "client_forged_source",
  };
  test("untrusted entitlement source fails closed as invalid", getCanonicalTrialWindow(clientWrittenProfile as any).state === "invalid");
}

// ---------------------------------------------------------------------------
// 3. No Fabrication from createdAt / updatedAt / registeredAt
// ---------------------------------------------------------------------------
{
  const noTrialProfile = {
    uid: "test-user-no-trial",
    fullName: "User Without Trial",
    createdAt: NOW,
    updatedAt: NOW,
    registeredAt: NOW,
  };
  const window = getCanonicalTrialWindow(noTrialProfile as any);
  test("CREATED_AT_NOT_USED_AS_TRIAL_START (profile without trialStartedAt is missing, never fabricated)", window.state === "missing");
  const status = getEntitlementStatus(noTrialProfile as any, NOW);
  test("profile without server trial has Free status (isPremium = false)", status.isPremium === false && status.effectiveTier === "Free");
}

// ---------------------------------------------------------------------------
// 4. Expired Trial Fails Closed
// ---------------------------------------------------------------------------
{
  const oldStart = new Date("2026-08-01T00:00:00.000Z");
  const oldEnd = new Date(oldStart.getTime() + SEVEN_DAYS_MS);
  const expiredProfile = {
    uid: "test-expired-user",
    trialStartedAt: oldStart,
    trialEndsAt: oldEnd,
    entitlementSource: "server_access_bootstrap",
  };
  const status = getEntitlementStatus(expiredProfile as any, NOW);
  test("EXPIRED_TRIAL_FAILS_CLOSED (expired trial resolves to Free, isPremium = false)", status.isPremium === false);
  test("expired trial status label indicates Trial Exhausted", status.status === "Trial Exhausted");
}

// ---------------------------------------------------------------------------
// 5. Google Play Premium, Lifetime, and Admin Lifetime Are Preserved
// ---------------------------------------------------------------------------
{
  const playUser = {
    uid: "test-play-user",
    membershipType: "PREMIUM",
    entitlementSource: "google_play",
    membershipExpiryDate: new Date(NOW.getTime() + 15 * 86400000),
  };
  const playStatus = getEntitlementStatus(playUser as any, NOW);
  test("PLAY_PREMIUM_OVERRIDES_TRIAL_CORRECTLY (verified Google Play active subscriber wins)", playStatus.isPremium === true && playStatus.reason === "subscriber");

  const lifetimeUser = {
    uid: "test-lifetime-user",
    membershipType: "LIFETIME",
  };
  const lifetimeStatus = getEntitlementStatus(lifetimeUser as any, NOW);
  test("LIFETIME_PRESERVED (membershipType LIFETIME has permanent premium access)", lifetimeStatus.isPremium === true && lifetimeStatus.reason === "lifetime");

  const adminUser = {
    uid: "test-admin-user",
    role: "admin",
    guardianRole: "admin",
  };
  const adminStatus = getEntitlementStatus(adminUser as any, NOW);
  test("ADMIN_LIFETIME_PRESERVED (Firestore admin role receives permanent premium)", adminStatus.isPremium === true && adminStatus.reason === "admin");
}

// ---------------------------------------------------------------------------
// 6. Immutability: Trial Does Not Reset on Login, Setup Rerun, or Profile Update
// ---------------------------------------------------------------------------
{
  const trialStart = new Date("2026-09-08T00:00:00.000Z");
  const trialEnd = new Date(trialStart.getTime() + SEVEN_DAYS_MS);
  const existingUserDoc = {
    uid: "test-persisted-user",
    trialStartedAt: trialStart.toISOString(),
    trialEndsAt: trialEnd.toISOString(),
    entitlementSource: "server_access_bootstrap",
  };

  // Route guard test: bootstrap route checks existing trialStartedAt and preserves it
  const routeSrc = read("app/api/access/bootstrap-trial/route.ts");
  test(
    "bootstrap route preserves existing trial without resetting (returns ALREADY_PRESENT)",
    routeSrc.includes("ALREADY_PRESENT") && routeSrc.includes("data.trialStartedAt && data.trialEndsAt"),
  );
  test(
    "bootstrap route server-stamps now and exact 7 days duration (client timestamps forbidden)",
    routeSrc.includes("now.getTime() + SEVEN_DAYS_MS") && !routeSrc.includes("request.body.trialStartedAt"),
  );

  // userRepository.upsertUserProfile strips entitlement fields on profile update / setup rerun
  const profileUpdateAttempt = {
    ...existingUserDoc,
    fullName: "Updated Name",
    birthCity: "Bandung",
    trialStartedAt: new Date().toISOString(), // Malicious attempt to restart trial
  };
  const safeUpdate = stripServerOwnedAccessFields(profileUpdateAttempt);
  test("PROFILE_UPDATE_DOES_NOT_RESET_TRIAL (trialStartedAt stripped on client update)", safeUpdate.trialStartedAt === undefined);
  test("SETUP_RERUN_DOES_NOT_RESET_TRIAL (birth data kept, entitlement untouched)", safeUpdate.birthCity === "Bandung" && safeUpdate.trialEndsAt === undefined);
}

// ---------------------------------------------------------------------------
// 7. Firestore Rules Protection Verification
// ---------------------------------------------------------------------------
{
  const rulesSrc = read("firestore.rules");
  test(
    "FIRESTORE_RULES: protectedAccessFields includes trialStartedAt",
    rulesSrc.includes('"trialStartedAt"'),
  );
  test(
    "FIRESTORE_RULES: protectedAccessFields includes trialEndsAt",
    rulesSrc.includes('"trialEndsAt"'),
  );
  test(
    "FIRESTORE_RULES: protectedAccessFields includes membershipType",
    rulesSrc.includes('"membershipType"'),
  );
  test(
    "FIRESTORE_RULES: protectedAccessFields includes plan",
    rulesSrc.includes('"plan"'),
  );
  test(
    "FIRESTORE_RULES: doesNotCreateProtectedAccessFields enforces client cannot create entitlement fields",
    rulesSrc.includes("allow create: if isOwner(userId) && doesNotCreateProtectedAccessFields();"),
  );
  test(
    "FIRESTORE_RULES: doesNotChangeProtectedAccessFields enforces client cannot update entitlement fields",
    rulesSrc.includes("allow update: if isOwner(userId) && doesNotChangeProtectedAccessFields();"),
  );
}

console.log(`\nBUILD110_TRIAL_SECURITY_ENTITLEMENT: ${passed} checks passed\n`);
