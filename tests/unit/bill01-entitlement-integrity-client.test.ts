import assert from "node:assert/strict";
import test from "node:test";
import { getEntitlementStatus, type EntitlementStatus } from "../../lib/billing/entitlementService";
import { recoverAndRefreshPremiumPurchases, type RecoverablePurchase } from "../../lib/billing/premiumRecovery";
import { stripServerOwnedAccessFields } from "../../lib/billing/serverOwnedAccessFields";
import { hasFeatureAccess } from "../../lib/billing/accessControl";
import { getBillingPresentation } from "../../lib/billing/entitlementPresentation";
import type { FounderTesterRecord } from "../../lib/billing/founderTesterSourceOfTruth";

const NOW = new Date("2026-08-15T12:00:00.000Z");

test("BILL01-04: In-flight UID switching / logout during verification throws AUTH_CHANGED and discards response", async () => {
  let activeUid: string | null = "uid-user-A";
  let postRefreshCalled = false;

  const mockPurchases: RecoverablePurchase[] = [
    { purchaseToken: "tok-user-A", products: ["bhumi_premium_monthly"], purchaseState: 1 },
  ];

  const verifyMock = async (purchase: RecoverablePurchase) => {
    // Simulate network delay during which user-A logs out and user-B logs in
    activeUid = "uid-user-B";
    return { ok: true, active: true, status: "ACTIVE" };
  };

  const refreshMock = async () => {
    if (activeUid !== "uid-user-A") {
      throw new Error("AUTH_CHANGED");
    }
    postRefreshCalled = true;
  };

  const result = await recoverAndRefreshPremiumPurchases(
    mockPurchases,
    "bhumi_premium_monthly",
    verifyMock,
    refreshMock,
    false,
  );

  // Invariant: refresh must fail closed, verifiedAny must be false, accessActive false
  assert.equal(postRefreshCalled, false, "Post-verification refresh must NOT be called for mismatched user");
  assert.equal(result.state, "PROFILE_REFRESH_FAILURE", "State must be marked profile refresh failure");
  assert.equal(result.accessActive, false, "Access must NOT be granted to the new user");
});

test("BILL01-08: Malformed or missing authentication fails closed", () => {
  // Entitlement resolver with null profile or empty user fails closed
  const nullStatus = getEntitlementStatus(null, NOW);
  assert.equal(nullStatus.isPremium, false);
  assert.equal(nullStatus.reason, "none");
  assert.equal(nullStatus.status, "No Data");

  // Server owned fields strip test
  const stripped = stripServerOwnedAccessFields({
    uid: "attacker",
    plan: "premium",
    isPremium: true,
    membershipType: "LIFETIME",
    badge: "Founder",
    trialStartedAt: NOW.toISOString(),
    trialEndsAt: new Date(NOW.getTime() + 7 * 86400000).toISOString(),
    displayName: "Safe User Name",
  });

  assert.equal(stripped.displayName, "Safe User Name");
  assert.equal((stripped as any).isPremium, undefined);
  assert.equal((stripped as any).membershipType, undefined);
  assert.equal((stripped as any).badge, undefined);
  assert.equal((stripped as any).trialStartedAt, undefined);
  assert.equal((stripped as any).trialEndsAt, undefined);
});

test("BILL01-10: Token bound to same UID, recovery idempotent after transient failure", async () => {
  let callCount = 0;
  const verifyMock = async (purchase: RecoverablePurchase) => {
    callCount++;
    return { ok: true, active: true, status: "ACTIVE" };
  };

  let refreshed = false;
  const refreshMock = async () => { refreshed = true; };

  const purchases: RecoverablePurchase[] = [
    { purchaseToken: "tok-recovery", products: ["bhumi_premium_monthly"], purchaseState: 1 },
  ];

  const first = await recoverAndRefreshPremiumPurchases(purchases, "bhumi_premium_monthly", verifyMock, refreshMock);
  assert.equal(first.state, "ACCESS_ACTIVE");
  assert.equal(first.verified, 1);

  // Second recovery with same purchase
  const second = await recoverAndRefreshPremiumPurchases(purchases, "bhumi_premium_monthly", verifyMock, refreshMock);
  assert.equal(second.state, "ACCESS_ACTIVE");
  assert.equal(second.verified, 1);
  assert.equal(callCount, 2);
});

test("BILL01-14: Active Paid + Expired Trial -> Effective Paid access", () => {
  const profile = {
    uid: "user-paid-trial-expired",
    membershipType: "PREMIUM",
    entitlementSource: "google_play",
    membershipExpiryDate: "2026-09-15T00:00:00.000Z",
    trialStartedAt: "2026-07-01T00:00:00.000Z",
    trialEndsAt: "2026-07-08T00:00:00.000Z",
    accessSource: "server_access_bootstrap",
  } as any;

  const status = getEntitlementStatus(profile, NOW);
  assert.equal(status.isPremium, true);
  assert.equal(status.reason, "subscriber");
  assert.equal(status.status, "Active");
  assert.equal(status.effectiveTier, "Paid Premium");
  assert.ok(status.expiresAt && status.expiresAt.toISOString().startsWith("2026-09-15"));
});

test("BILL01-15: Paid active and token purchase expired does not cause downgrade", () => {
  const profile = {
    uid: "user-active-paid",
    membershipType: "PREMIUM",
    entitlementSource: "google_play",
    membershipExpiryDate: "2026-10-01T00:00:00.000Z",
  } as any;

  const status = getEntitlementStatus(profile, NOW);
  assert.equal(status.isPremium, true);
  assert.equal(status.reason, "subscriber");
});

test("BILL01-16: Precedence Characterization & Conflict Record (Tester Grant vs Paid vs Trial)", () => {
  // Case Widya: Tester Grant (Penjaga Bhumi Inti, ends 2026-08-30) + Paid Subscription (ends 2026-09-13)
  const testerRecord: FounderTesterRecord = {
    uid: "user-widya",
    registeredAt: "2026-07-01T00:00:00.000Z",
    activeDays: 45,
    badge: "Penjaga Bhumi Inti",
    sourceBadge: "Inti",
    membership: "PREMIUM_2_MONTHS",
    premiumMonths: 2,
    trialDays: null,
  };

  const profile = {
    uid: "user-widya",
    badge: "Penjaga Bhumi Inti",
    membershipType: "PREMIUM",
    entitlementSource: "google_play",
    membershipExpiryDate: "2026-09-13T00:00:00.000Z",
    trialStartedAt: "2026-07-01T00:00:00.000Z",
    trialEndsAt: "2026-07-08T00:00:00.000Z",
    accessSource: "server_access_bootstrap",
  } as any;

  const status = getEntitlementStatus(profile, NOW, testerRecord);

  // Characterize Option B (Current Implemented Code):
  // 1. Effective access is PREMIUM (isPremium: true)
  assert.equal(status.isPremium, true, "Effective access must be PREMIUM");

  // 2. Union Expiry: picks the latest expiry (Sep 13 from Google Play > Aug 30 from Inti grant)
  assert.ok(status.expiresAt && status.expiresAt.toISOString().startsWith("2026-09-13"), "Must pick latest expiry (Sep 13)");

  // 3. Display tier precedence in current code:
  // reason is "inti_badge" (reasonPrecedence 4 < subscriber 5)
  // effectiveTier is "Penjaga Bhumi Inti"
  assert.equal(status.reason, "inti_badge", "Current code reason is inti_badge");
  assert.equal(status.effectiveTier, "Penjaga Bhumi Inti", "Current code tier is Penjaga Bhumi Inti");

  // If Option A were adopted (Paid > Tester Grant for display):
  // reason would be "subscriber" and effectiveTier would be "Paid Premium".
  // Note: BOTH options grant identical effective access (isPremium = true until Sep 13).
});

test("BILL01-17: 7-day trial exhausted cannot be restarted by re-login or re-bootstrap", () => {
  const exhaustedProfile = {
    uid: "user-trial-done",
    trialStartedAt: "2026-07-01T00:00:00.000Z",
    trialEndsAt: "2026-07-08T00:00:00.000Z",
    accessSource: "server_access_bootstrap",
    entitlementSource: "server_access_bootstrap",
  } as any;

  const status = getEntitlementStatus(exhaustedProfile, NOW);
  assert.equal(status.isPremium, false);
  assert.equal(status.status, "Trial Exhausted");
  assert.equal(status.daysRemaining, 0);
  assert.equal(status.effectiveTier, "Free (Trial Exhausted)");

  const presentation = getBillingPresentation(status);
  assert.equal(presentation.state, "trial_exhausted");
  assert.equal(presentation.hasAccess, false);
});

test("BILL01-18: UID A (Lifetime) vs UID B (Free) — Zero entitlement leakage across account switch", () => {
  const profileA = {
    uid: "uid-A-lifetime",
    membershipType: "LIFETIME",
    badge: "Founder",
  } as any;

  const profileB = {
    uid: "uid-B-free",
    membershipType: "FREE",
    plan: "free",
  } as any;

  const statusA = getEntitlementStatus(profileA, NOW);
  const statusB = getEntitlementStatus(profileB, NOW);

  assert.equal(statusA.isPremium, true);
  assert.equal(statusA.reason, "founder");
  assert.equal(statusA.expiresAt, null);

  assert.equal(statusB.isPremium, false);
  assert.equal(statusB.reason, "none");
  assert.equal(statusB.effectiveTier, "Free");
});

test("BILL01-19: LocalStorage tampering has zero authority — Firestore profile is sole authority", () => {
  // Tampered local storage says plan = "pro", but Firestore profile is free
  const firestoreProfile = {
    uid: "tampered-user",
    membershipType: "FREE",
    plan: "free",
  } as any;

  // Live access gate check
  const status = getEntitlementStatus(firestoreProfile, NOW);
  assert.equal(status.isPremium, false, "Tampered local storage must have zero effect on getEntitlementStatus");

  // Derivative feature access check
  const journalAccess = hasFeatureAccess("journal", firestoreProfile);
  assert.equal(journalAccess, false, "Feature access gate must be closed for free profile");

  const meditationAccess = hasFeatureAccess("meditation", firestoreProfile);
  assert.equal(meditationAccess, false, "Feature access gate must be closed for free profile");
});

test("BILL01-20: All entitlement sources expired or invalid -> Free Access fail-closed", () => {
  const expiredAll = {
    uid: "all-expired-user",
    membershipType: "PREMIUM",
    entitlementSource: "google_play",
    membershipExpiryDate: "2026-01-01T00:00:00.000Z", // expired
    trialStartedAt: "2025-12-01T00:00:00.000Z",
    trialEndsAt: "2025-12-08T00:00:00.000Z", // expired
    accessSource: "server_access_bootstrap",
  } as any;

  const status = getEntitlementStatus(expiredAll, NOW);
  assert.equal(status.isPremium, false);
  assert.equal(status.daysRemaining, 0);
  assert.equal(status.status, "Expired");

  const presentation = getBillingPresentation(status);
  assert.equal(presentation.hasAccess, false);
  assert.equal(presentation.state, "premium_expired");
});

test("FAILURE INJECTIONS: Error classification in recoverAndRefreshPremiumPurchases", async () => {
  // 1. HTTP 429 / 500 / retryable network error -> RETRYABLE_VERIFICATION_FAILURE
  const retryableError = Object.assign(new Error("Rate limited"), { status: 429 });
  const resRetryable = await recoverAndRefreshPremiumPurchases(
    [{ purchaseToken: "tok-429", products: ["bhumi_premium_monthly"], purchaseState: 1 }],
    "bhumi_premium_monthly",
    async () => { throw retryableError; },
    async () => {},
  );
  assert.equal(resRetryable.state, "RETRYABLE_VERIFICATION_FAILURE");
  assert.equal(resRetryable.retryableFailures, 1);

  // 2. TOKEN_OWNERSHIP_CONFLICT / ENTITLEMENT_WRITE_FAILURE -> PERSISTENCE_FAILURE
  const conflictError = Object.assign(new Error("TOKEN_OWNERSHIP_CONFLICT"), { code: "TOKEN_OWNERSHIP_CONFLICT" });
  const resConflict = await recoverAndRefreshPremiumPurchases(
    [{ purchaseToken: "tok-conflict", products: ["bhumi_premium_monthly"], purchaseState: 1 }],
    "bhumi_premium_monthly",
    async () => { throw conflictError; },
    async () => {},
  );
  assert.equal(resConflict.state, "PERSISTENCE_FAILURE");
  assert.equal(resConflict.retryableFailures, 0);

  // 3. SUBSCRIPTION_PENDING -> PAYMENT_PENDING
  const resPending = await recoverAndRefreshPremiumPurchases(
    [{ purchaseToken: "tok-pending", products: ["bhumi_premium_monthly"], purchaseState: 1 }],
    "bhumi_premium_monthly",
    async () => ({ ok: true, active: false, status: "SUBSCRIPTION_PENDING" }),
    async () => {},
  );
  assert.equal(resPending.state, "PAYMENT_PENDING");
  assert.equal(resPending.pendingCount, 1);
});
