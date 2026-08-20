import assert from "node:assert";
import { getEntitlementStatus } from "../../lib/billing/entitlementService";
import type { FounderTesterRecord } from "../../lib/billing/founderTesterSourceOfTruth";

console.log("▶ Running Billing Entitlement Contract Tests\n");

let passed = 0;
let failed = 0;

function test(label: string, condition: boolean, detail?: string) {
  if (condition) { passed++; console.log(`  PASS: ${label}`); }
  else { failed++; console.error(`  FAIL: ${label}${detail ? " — " + detail : ""}`); }
}

const NOW = new Date("2026-07-25T00:00:00Z");

// Live-scenario dates: Widya Gustina's entitlement check (2026-08-16) and the
// canonical Inti grant end (2026-08-30T00:00:00+07:00 == 2026-08-29T17:00:00Z).
const WIDYA_NOW = new Date("2026-08-16T00:30:00Z");
const INTI_CANONICAL_END_UTC = new Date("2026-08-29T17:00:00Z");
const AFTER_INTI_END = new Date("2026-09-05T00:00:00Z");

const intiTesterRecord: FounderTesterRecord = {
  uid: "ydKZoZuehlewy93U3vrK8abIHS42",
  registeredAt: "2026-06-17",
  activeDays: 7,
  badge: "Penjaga Bhumi Inti",
  sourceBadge: "Inti",
  membership: "PREMIUM_2_MONTHS",
  premiumMonths: 2,
  trialDays: null,
};

// ========== TEST CASES ==========

// Null profile
{
  const s = getEntitlementStatus(null, NOW);
  test("null profile returns not premium", s.isPremium === false);
  test("null profile reason is none", s.reason === "none");
  test("null profile status is No Data", s.status === "No Data");
}

// OLD POLICY: legacy `plan: free` suppressed an otherwise active trial.
// NEW CANONICAL POLICY: a trusted, exact server trial window outranks that stale label.
// WHY CHANGE IS REQUIRED: bootstrap intentionally preserves legacy plan while writing canonical timestamps.
// RUNTIME BEHAVIOR PROTECTED BY: plan-free users receive only their immutable server-issued window.
{
  const profile = { trialStartedAt: "2026-07-20T00:00:00Z", trialEndsAt: "2026-07-27T00:00:00Z", entitlementSource: "firebase_auth_creation_time", plan: "free" } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("legacy free plan with canonical active trial is premium", s.isPremium === true);
  test("legacy free plan with canonical active trial reason is trial", s.reason === "trial");
}

// Trial active (started 3 days ago)
{
  const profile = { trialStartedAt: "2026-07-22T00:00:00Z", trialEndsAt: "2026-07-29T00:00:00Z", entitlementSource: "firebase_auth_creation_time", setupCompleted: true } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("trial user started 3 days ago is premium", s.isPremium === true);
  test("trial user reason is trial", s.reason === "trial");
  test("trial days remaining is displayed", s.daysRemaining === 4);
}

// Trial boundary: exact start (0 days elapsed)
{
  const profile = { trialStartedAt: "2026-07-25T00:00:00Z", trialEndsAt: "2026-08-01T00:00:00Z", entitlementSource: "firebase_auth_creation_time", setupCompleted: true } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("exact trial start is still trial", s.isPremium === true && s.reason === "trial");
  test("days remaining is 7", s.daysRemaining === 7);
}

// Trial boundary: 8 days ago (expired)
{
  const profile = { trialStartedAt: "2026-07-17T00:00:00Z", trialEndsAt: "2026-07-24T00:00:00Z", entitlementSource: "firebase_auth_creation_time", setupCompleted: true } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("trial started 8 days ago is not premium", s.isPremium === false);
  test("expired trial status is Trial Exhausted", s.status === "Trial Exhausted");
}

// OLD POLICY: `plan: free` always overrode trial timestamps.
// NEW CANONICAL POLICY: trusted canonical timestamps are authoritative.
// WHY CHANGE IS REQUIRED: plan is a legacy presentation field, not trial provenance.
// RUNTIME BEHAVIOR PROTECTED BY: only source-marked exact seven-day windows unlock access.
{
  const profile = { trialStartedAt: "2026-07-24T00:00:00Z", trialEndsAt: "2026-07-31T00:00:00Z", entitlementSource: "firebase_auth_creation_time", plan: "free" } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("canonical trial outranks stale free plan", s.isPremium === true && s.reason === "trial");
}

// Active premium membership
{
  const profile = { membershipType: "PREMIUM", entitlementSource: "google_play", membershipExpiryDate: "2026-08-01T00:00:00Z" } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("active premium membership is premium", s.isPremium === true);
  test("premium reason is subscriber", s.reason === "subscriber");
}

// Expired premium membership
{
  const profile = { membershipType: "PREMIUM", entitlementSource: "google_play", membershipExpiryDate: "2026-06-01T00:00:00Z", createdAt: "2026-06-01T00:00:00Z" } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("expired premium is expired subscriber", s.isPremium === false && s.status === "Expired");
}

// Lifetime membership
{
  const profile = { membershipType: "LIFETIME" } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("lifetime membership is premium", s.isPremium === true);
  test("lifetime has no expiry", s.expiresAt === null);
}

// Premium overrides trial
{
  const profile = { trialStartedAt: "2026-07-24T00:00:00Z", trialEndsAt: "2026-07-31T00:00:00Z", entitlementSource: "google_play", membershipType: "PREMIUM", membershipExpiryDate: "2026-08-01T00:00:00Z" } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("premium takes precedence over trial", s.reason === "subscriber");
}

// Inti badge access
{
  const profile = { testerBadge: "Penjaga Bhumi Inti", accessUntil: "2026-08-30T00:00:00Z" } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("Inti badge grants premium", s.isPremium === true);
  test("Inti badge reason is inti_badge", s.reason === "inti_badge");
}

// Alfa badge access
{
  const profile = { testerBadge: "Penjaga Bhumi Alfa", accessUntil: "2026-07-30T00:00:00Z" } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("Alfa badge grants premium", s.isPremium === true);
  test("Alfa badge reason is alfa_badge", s.reason === "alfa_badge");
}

// ========== BUILD 98 HOTFIX: tester/founder grant must not be killed by
// ========== a stale, unrelated Google Play expiry on the same document. ==========

// CASE A (live Widya scenario): active canonical Inti testerRecord + expired
// Google Play subscription on the same profile. The expired subscription's
// accessUntil (2026-08-13) must NOT shorten the canonical Inti grant which
// runs until 2026-08-30T00:00:00+07:00. Must evaluate PREMIUM (inti_badge).
{
  const profile = {
    uid: intiTesterRecord.uid,
    membershipType: "PREMIUM",
    membership: "GOOGLE_PLAY_PREMIUM",
    plan: "premium",
    membershipExpiryDate: "2026-08-13T03:36:40.602Z",
    accessUntil: "2026-08-13T03:36:40.602Z", // stale Play-expiry overwrite (live data)
    entitlementSource: "google_play",
    testerBadge: "Penjaga Bhumi Inti",
    badge: "Penghuni Bhumi",
  } as any;
  const s = getEntitlementStatus(profile, WIDYA_NOW, intiTesterRecord);
  test("A: stale Play expiry does NOT kill active Inti tester grant", s.isPremium === true, `got isPremium=${s.isPremium}`);
  test("A: reason is inti_badge (tester grant), not subscriber", s.reason === "inti_badge", `got reason=${s.reason}`);
  test("A: expiresAt is canonical Inti grant end", s.expiresAt?.getTime() === INTI_CANONICAL_END_UTC.getTime(), `got ${s.expiresAt?.toISOString()}`);
}

// CASE B: active canonical Inti testerRecord + active Google Play subscription
// -> still PREMIUM, Inti grant (higher priority) wins.
{
  const profile = {
    uid: intiTesterRecord.uid,
    membershipType: "PREMIUM",
    membership: "GOOGLE_PLAY_PREMIUM",
    plan: "premium",
    membershipExpiryDate: "2026-09-13T03:36:40.602Z",
    accessUntil: "2026-09-13T03:36:40.602Z",
    entitlementSource: "google_play",
    testerBadge: "Penjaga Bhumi Inti",
    badge: "Penghuni Bhumi",
  } as any;
  const s = getEntitlementStatus(profile, WIDYA_NOW, intiTesterRecord);
  test("B: active Play + active tester grant -> PREMIUM via inti_badge", s.isPremium === true && s.reason === "inti_badge", `got reason=${s.reason}`);
}

// CASE C: no tester badge + active Google Play subscription -> PREMIUM (subscriber)
{
  const profile = {
    uid: "user-active-play",
    membershipType: "PREMIUM",
    membership: "GOOGLE_PLAY_PREMIUM",
    plan: "premium",
    membershipExpiryDate: "2026-09-13T03:36:40.602Z",
    accessUntil: "2026-09-13T03:36:40.602Z",
    entitlementSource: "google_play",
  } as any;
  const s = getEntitlementStatus(profile, WIDYA_NOW, null);
  test("C: no badge + active Play -> PREMIUM (subscriber)", s.isPremium === true && s.reason === "subscriber", `got reason=${s.reason}`);
}

// CASE D: no tester badge + expired Google Play subscription -> EXPIRED
{
  const profile = {
    uid: "user-expired-play",
    membershipType: "PREMIUM",
    membership: "GOOGLE_PLAY_PREMIUM",
    plan: "premium",
    membershipExpiryDate: "2026-08-13T03:36:40.602Z",
    accessUntil: "2026-08-13T03:36:40.602Z",
    entitlementSource: "google_play",
    trialStartedAt: "2026-07-15T00:00:00Z",
    trialEndsAt: "2026-07-22T00:00:00Z",
  } as any;
  const s = getEntitlementStatus(profile, WIDYA_NOW, null);
  test("D: no badge + expired Play -> NOT premium", s.isPremium === false, `got isPremium=${s.isPremium}`);
  test("D: expired Play status is Expired (Paid Premium (Expired))", s.status === "Expired", `got status=${s.status}`);
}

// CASE E: EXPIRED tester grant (now after canonical Inti end) must still deny.
// A later profile.accessUntil would extend the grant (max() semantics).
{
  const profile = {
    uid: intiTesterRecord.uid,
    accessUntil: "2026-08-13T03:36:40.602Z", // STALE, earlier than canonical end
    testerBadge: "Penjaga Bhumi Inti",
  } as any;
  const s = getEntitlementStatus(profile, AFTER_INTI_END, intiTesterRecord);
  test("E: Inti tester grant after canonical end + stale accessUntil -> denied", s.isPremium === false, `got isPremium=${s.isPremium}`);
  test("E: denied grant effectiveTier marks Inti (Expired)", s.effectiveTier === "Penjaga Bhumi Inti (Expired)", `got ${s.effectiveTier}`);

  const extendedProfile = {
    uid: intiTesterRecord.uid,
    accessUntil: "2026-09-20T00:00:00+07:00", // explicit grant beyond canonical end
    testerBadge: "Penjaga Bhumi Inti",
  } as any;
  const s2 = getEntitlementStatus(extendedProfile, AFTER_INTI_END, intiTesterRecord);
  test("E2: explicit accessUntil beyond canonical end still extends the grant", s2.isPremium === true && s2.reason === "inti_badge", `got reason=${s2.reason}`);
}

// CASE F: no tester badge + no valid paid subscription + no valid trial -> FREE
{
  const profile = {
    uid: "user-free",
    trialStartedAt: "2026-07-01T00:00:00Z",
    trialEndsAt: "2026-07-08T00:00:00Z",
    entitlementSource: "firebase_auth_creation_time",
  } as any;
  const s = getEntitlementStatus(profile, WIDYA_NOW, null);
  test("F: no badge + expired trial -> FREE", s.isPremium === false && s.status === "Trial Exhausted", `got isPremium=${s.isPremium} status=${s.status}`);
}

// Purchase token ownership validation contract
{
  function validateTokenOwnership(existing: any, callerUid: string) {
    if (!existing || !existing.uid) return { ok: true, idempotent: false };
    if (existing.uid === callerUid) return { ok: true, idempotent: true };
    return { ok: false, idempotent: false, reason: "token_linked_to_another_uid" };
  }

  test("new token is accepted", validateTokenOwnership(null, "user_1").ok === true);
  test("same UID re-verification is idempotent", validateTokenOwnership({ uid: "user_1" }, "user_1").idempotent === true);
  test("different UID token is rejected", validateTokenOwnership({ uid: "user_1" }, "user_2").ok === false);
}

// Backend subscription state machine contract
{
  function buildEntitlementDecision(state: string, expiry: number | null) {
    const activeStates = new Set(["SUBSCRIPTION_STATE_ACTIVE", "SUBSCRIPTION_STATE_IN_GRACE_PERIOD"]);
    const active = activeStates.has(state) && Boolean(expiry && expiry > Date.now());
    return { active, status: active ? "active" : state === "SUBSCRIPTION_STATE_VOIDED" ? "voided" : "expired" };
  }

  test("ACTIVE with future expiry grants entitlement", buildEntitlementDecision("SUBSCRIPTION_STATE_ACTIVE", Date.now() + 86400000).active === true);
  test("ACTIVE with past expiry denies entitlement", buildEntitlementDecision("SUBSCRIPTION_STATE_ACTIVE", Date.now() - 1000).active === false);
  test("GRACE_PERIOD with future expiry grants entitlement", buildEntitlementDecision("SUBSCRIPTION_STATE_IN_GRACE_PERIOD", Date.now() + 86400000).active === true);
  test("PENDING does not grant entitlement", buildEntitlementDecision("SUBSCRIPTION_STATE_PENDING", Date.now() + 86400000).active === false);
  test("CANCELED past expiry denies entitlement", buildEntitlementDecision("SUBSCRIPTION_STATE_CANCELED", Date.now() - 1000).active === false);
  test("VOIDED is marked voided", buildEntitlementDecision("SUBSCRIPTION_STATE_VOIDED", null).status === "voided");
  test("null expiry denies entitlement", buildEntitlementDecision("SUBSCRIPTION_STATE_ACTIVE", null).active === false);
}

// --- PARALLEL RESOLVER vs CANONICAL RESOLVER (WIDYA FIX) ---
//
// Build 99 / Build 100 introduced two parallel entitlement resolvers:
//   - canonical: lib/billing/entitlementService.ts#getEntitlementStatus
//   - parallel:  lib/billing/accessControl.ts#hasFeatureAccess (used by 8 live pages)
//
// Widya case regression: live profile has stale Google Play Firestore
// (membershipExpiryDate = 2026-08-13, today = 2026-08-20) BUT active canonical
// Inti tester grant (until 2026-08-30). Both resolvers MUST agree that access
// is granted today and denied only after the canonical Inti grant end.
import { hasFeatureAccess, type TrialProfile } from "../../lib/billing/accessControl";
{
  const WIDYA_FIX_NOW = new Date("2026-08-20T00:00:00Z");
  const widyaProfile = {
    uid: "ydKZoZuehlewy93U3vrK8abIHS42",
    membershipType: "PREMIUM",
    membership: "GOOGLE_PLAY_PREMIUM",
    plan: "premium",
    membershipExpiryDate: "2026-08-13T03:36:40.602Z", // STALE Play Firestore
    accessUntil: "2026-08-13T03:36:40.602Z",          // STALE Play Firestore
    entitlementSource: "google_play",
    testerBadge: "Penjaga Bhumi Inti",
    badge: "Penghuni Bhumi",
    email: "whedhea37@gmail.com",
  } as any;

  const canonical = getEntitlementStatus(widyaProfile, WIDYA_FIX_NOW, intiTesterRecord);
  const parallelWithRecord = hasFeatureAccess(widyaProfile as TrialProfile, "audioHealing", WIDYA_FIX_NOW, intiTesterRecord);
  const parallelNoRecordButBadgeMirror = hasFeatureAccess(widyaProfile as TrialProfile, "audioHealing", WIDYA_FIX_NOW, null);

  test("PARALLEL: Widya + testerRecord today -> grants access (matches canonical)",
    parallelWithRecord === true && canonical.isPremium === true,
    `parallel=${parallelWithRecord} canonical=${canonical.isPremium}`,
  );
  test("PARALLEL: Widya WITHOUT testerRecord but WITH profile.testerBadge mirror -> still grants access (defensive fallback)",
    parallelNoRecordButBadgeMirror === true,
    `got ${parallelNoRecordButBadgeMirror}`,
  );
  test("PARALLEL: Widya + testerRecord tomorrow after Inti end -> denies access",
    hasFeatureAccess(widyaProfile as TrialProfile, "audioHealing", AFTER_INTI_END, intiTesterRecord) === false,
  );
  test("PARALLEL: Widya + testerRecord 5 days after Inti end -> denies access",
    hasFeatureAccess(widyaProfile as TrialProfile, "audioHealing", new Date("2026-09-05T00:00:00Z"), intiTesterRecord) === false,
  );
  test("PARALLEL: profile lacking BOTH testerRecord AND profile.testerBadge -> denies (gate stays closed)",
    hasFeatureAccess({ ...widyaProfile, testerBadge: null } as TrialProfile, "audioHealing", WIDYA_FIX_NOW, null) === false,
  );
  test("PARALLEL: canonical and parallel agree on all 4 premium features today (audioHealing/meditation/journal/weeklyReport)",
    ["audioHealing", "meditation", "journal", "weeklyReport"].every(
      (f) => hasFeatureAccess(widyaProfile as TrialProfile, f as any, WIDYA_FIX_NOW, intiTesterRecord) === true,
    ),
  );
}

// --- MULTI-SOURCE ENTITLEMENT UNION (WIDYA REGRESSION GUARD) ---
{
  const WIDYA_TEST_NOW = new Date("2026-08-20T00:00:00Z");

  const profile = {
    uid: "whedhea37",
    entitlementSource: "google_play",
    membershipType: "PREMIUM",
    accessUntil: "2026-09-13T00:00:00Z",
    membershipExpiryDate: "2026-09-13T00:00:00Z",
    testerBadge: "Penjaga Bhumi Inti",
  } as any;
  const testerRecord = { badge: "Penjaga Bhumi Inti" } as any;

  const sA = getEntitlementStatus(profile, WIDYA_TEST_NOW, testerRecord);
  test("UNION A: tester + billing both active -> PREMIUM", sA.isPremium === true, "got isPremium=" + sA.isPremium);
  test(
    "UNION A: effective expiry === billing (Sep 13)",
    sA.expiresAt && sA.expiresAt.toISOString() === "2026-09-13T00:00:00.000Z",
    "got " + (sA.expiresAt && sA.expiresAt.toISOString()),
  );

  const sB = getEntitlementStatus(profile, new Date("2026-09-05T00:00:00Z"), testerRecord);
  test("UNION B: expired tester + active billing -> PREMIUM", sB.isPremium === true, "got isPremium=" + sB.isPremium);
  test(
    "UNION B: effective expiry === billing (Sep 13)",
    sB.expiresAt && sB.expiresAt.toISOString() === "2026-09-13T00:00:00.000Z",
    "got " + (sB.expiresAt && sB.expiresAt.toISOString()),
  );

  const expiredBillingProfile = {
    uid: "whedhea37",
    entitlementSource: "google_play",
    membershipType: "PREMIUM",
    accessUntil: "2026-08-15T00:00:00Z",
    membershipExpiryDate: "2026-08-15T00:00:00Z",
    testerBadge: "Penjaga Bhumi Inti",
  } as any;
  const sC = getEntitlementStatus(expiredBillingProfile, WIDYA_TEST_NOW, testerRecord);
  test("UNION C: active tester + expired billing -> PREMIUM", sC.isPremium === true, "got isPremium=" + sC.isPremium);
  test(
    "UNION C: effective expiry === tester canonical end",
    sC.expiresAt && sC.expiresAt.toISOString() === INTI_CANONICAL_END_UTC.toISOString(),
    "got " + (sC.expiresAt && sC.expiresAt.toISOString()),
  );

  const sD = getEntitlementStatus(expiredBillingProfile, new Date("2026-09-20T00:00:00Z"), testerRecord);
  test("UNION D: both expired -> NOT PREMIUM", sD.isPremium === false, "got isPremium=" + sD.isPremium);

  const lifetimeProfile = {
    uid: "founder1",
    role: "founder",
    entitlementSource: "google_play",
    membershipType: "PREMIUM",
    accessUntil: "2026-09-13T00:00:00Z",
  } as any;
  const sF = getEntitlementStatus(lifetimeProfile, WIDYA_TEST_NOW, null);
  test("UNION F: lifetime + billing -> PREMIUM, expiresAt null", sF.isPremium === true && sF.expiresAt === null, "got isPremium=" + sF.isPremium + " expiresAt=" + sF.expiresAt);

  const trialPaidProfile = {
    uid: "trialpaid",
    entitlementSource: "google_play",
    membershipType: "PREMIUM",
    accessUntil: "2026-09-13T00:00:00Z",
    trialStartedAt: "2026-08-15T00:00:00Z",
    trialEndsAt: "2026-08-22T00:00:00Z",
  } as any;
  const sG = getEntitlementStatus(trialPaidProfile, WIDYA_TEST_NOW, null);
  test("UNION G: trial + paid active -> PREMIUM until paid expiry", sG.isPremium === true && sG.expiresAt?.toISOString() === "2026-09-13T00:00:00.000Z", "got " + (sG.expiresAt && sG.expiresAt.toISOString()));
}

console.log(`\n${passed + failed} tests, ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
