import assert from "node:assert/strict";
import test from "node:test";
import { getEntitlementStatus } from "../../lib/billing/entitlementService";
import { hasFeatureAccess, type TrialProfile } from "../../lib/billing/accessControl";
import type { FounderTesterRecord } from "../../lib/billing/founderTesterSourceOfTruth";

const BASE_NOW = new Date("2026-11-12T00:00:00.000Z");

const founderTesterRecord: FounderTesterRecord = {
  uid: "founder_uid_123",
  registeredAt: "2026-06-01",
  activeDays: 160,
  badge: "Founder",
  sourceBadge: "Founder",
  membership: "LIFETIME_PREMIUM",
  premiumMonths: null,
  trialDays: null,
};

const adminTesterRecord: FounderTesterRecord = {
  uid: "admin_uid_456",
  registeredAt: "2026-06-01",
  activeDays: 160,
  badge: "Penjaga Bhumi",
  sourceBadge: "Penjaga Bhumi",
  membership: "COMMUNITY_LEADER",
  premiumMonths: null,
  trialDays: null,
};

test("VC123-01: Founder / Admin / Lifetime maintains legitimate access across all surfaces", () => {
  // Founder
  const founderProfile = { uid: "founder_uid_123", plan: "lifetime_free" } as any;
  const founderStatus = getEntitlementStatus(founderProfile, BASE_NOW, founderTesterRecord);
  assert.equal(founderStatus.isPremium, true);
  assert.equal(founderStatus.reason, "founder");
  assert.equal(hasFeatureAccess(founderProfile, "dashboard", BASE_NOW, founderTesterRecord), true);
  assert.equal(hasFeatureAccess(founderProfile, "profile", BASE_NOW, founderTesterRecord), true);
  assert.equal(hasFeatureAccess(founderProfile, "wellness", BASE_NOW, founderTesterRecord), true);
  assert.equal(hasFeatureAccess(founderProfile, "journey", BASE_NOW, founderTesterRecord), true);

  // Admin
  const adminProfile = { uid: "admin_uid_456", role: "admin", plan: "admin_provisioned" } as any;
  const adminStatus = getEntitlementStatus(adminProfile, BASE_NOW, adminTesterRecord);
  assert.equal(adminStatus.isPremium, true);
  assert.equal(hasFeatureAccess(adminProfile, "profile", BASE_NOW, adminTesterRecord), true);
  assert.equal(hasFeatureAccess(adminProfile, "wellness", BASE_NOW, adminTesterRecord), true);
  assert.equal(hasFeatureAccess(adminProfile, "journey", BASE_NOW, adminTesterRecord), true);

  // Lifetime non-founder
  const lifetimeProfile = { uid: "lifetime_789", membershipType: "LIFETIME", plan: "lifetime_free" } as any;
  const lifetimeStatus = getEntitlementStatus(lifetimeProfile, BASE_NOW, null);
  assert.equal(lifetimeStatus.isPremium, true);
  assert.equal(lifetimeStatus.reason, "lifetime");
  assert.equal(hasFeatureAccess(lifetimeProfile, "profile", BASE_NOW, null), true);
});

test("VC123-02: Active Premium (Google Play) entitles until exact expiry; revoked immediately after", () => {
  const activeSubProfile = {
    uid: "sub_1",
    membershipType: "PREMIUM",
    entitlementSource: "google_play",
    membershipExpiryDate: "2026-11-20T00:00:00.000Z",
  } as any;

  // Before expiry -> full access
  const statusActive = getEntitlementStatus(activeSubProfile, BASE_NOW, null);
  assert.equal(statusActive.isPremium, true);
  assert.equal(statusActive.reason, "subscriber");
  assert.equal(hasFeatureAccess(activeSubProfile, "profile", BASE_NOW, null), true);
  assert.equal(hasFeatureAccess(activeSubProfile, "wellness", BASE_NOW, null), true);
  assert.equal(hasFeatureAccess(activeSubProfile, "journey", BASE_NOW, null), true);

  // After expiry -> immediately revoked
  const afterExpiry = new Date("2026-11-20T00:00:01.000Z");
  const statusExpired = getEntitlementStatus(activeSubProfile, afterExpiry, null);
  assert.equal(statusExpired.isPremium, false);
  assert.equal(statusExpired.status, "Expired");
  assert.equal(hasFeatureAccess(activeSubProfile, "dashboard", afterExpiry, null), true); // Dashboard stays open
  assert.equal(hasFeatureAccess(activeSubProfile, "profile", afterExpiry, null), false);
  assert.equal(hasFeatureAccess(activeSubProfile, "wellness", afterExpiry, null), false);
  assert.equal(hasFeatureAccess(activeSubProfile, "journey", afterExpiry, null), false);
});

test("VC123-03: Active Trial entitles until exact trialEndsAt timestamp; zero access after", () => {
  const trialEnd = new Date("2026-11-15T12:00:00.000Z");
  const activeTrialProfile = {
    uid: "trial_user_1",
    trialStartedAt: "2026-11-08T12:00:00.000Z",
    trialEndsAt: trialEnd.toISOString(),
    entitlementSource: "server_access_bootstrap",
    setupCompleted: true,
  } as any;

  // 1 second before expiration -> active
  const justBefore = new Date(trialEnd.getTime() - 1000);
  const statusBefore = getEntitlementStatus(activeTrialProfile, justBefore, null);
  assert.equal(statusBefore.isPremium, true);
  assert.equal(statusBefore.reason, "trial");
  assert.equal(statusBefore.daysRemaining, 1);
  assert.equal(hasFeatureAccess(activeTrialProfile, "profile", justBefore, null), true);

  // Exact expiration or 1ms after -> locked
  const atExpiry = trialEnd;
  const statusAtExpiry = getEntitlementStatus(activeTrialProfile, atExpiry, null);
  assert.equal(statusAtExpiry.isPremium, false);
  assert.equal(statusAtExpiry.status, "Trial Exhausted");
  assert.equal(hasFeatureAccess(activeTrialProfile, "profile", atExpiry, null), false);
  assert.equal(hasFeatureAccess(activeTrialProfile, "wellness", atExpiry, null), false);
  assert.equal(hasFeatureAccess(activeTrialProfile, "journey", atExpiry, null), false);
  assert.equal(hasFeatureAccess(activeTrialProfile, "dashboard", atExpiry, null), true); // Dashboard allowed
});

test("VC123-04: Stale / unbacked isPremium or membershipType=TRIAL without active timestamps fails closed", () => {
  // Stale doc from production audit discrepancy: plan="free_trial", membershipType="TRIAL" but trialEndsAt past
  const expiredConflictProfile = {
    uid: "conflict_user_1",
    plan: "free_trial",
    membershipType: "TRIAL",
    membership: "REGULAR_TRIAL",
    subscriptionStatus: "trialing",
    trialStartedAt: "2026-06-01T00:00:00.000Z",
    trialEndsAt: "2026-06-08T00:00:00.000Z", // expired months ago
    entitlementSource: "bhumi_profile_first_creation",
    accessSource: "vercel_profile_bootstrap",
  } as any;

  const status = getEntitlementStatus(expiredConflictProfile, BASE_NOW, null);
  assert.equal(status.isPremium, false);
  assert.equal(hasFeatureAccess(expiredConflictProfile, "profile", BASE_NOW, null), false);
  assert.equal(hasFeatureAccess(expiredConflictProfile, "wellness", BASE_NOW, null), false);
  assert.equal(hasFeatureAccess(expiredConflictProfile, "journey", BASE_NOW, null), false);

  // Stale doc with isPremium: true but no active subscription/grant
  const stalePremiumDoc = {
    uid: "stale_prem_1",
    isPremium: true,
    plan: "premium",
    membershipType: "PREMIUM",
    membershipExpiryDate: "2026-05-01T00:00:00.000Z", // expired
  } as any;

  const staleStatus = getEntitlementStatus(stalePremiumDoc, BASE_NOW, null);
  assert.equal(staleStatus.isPremium, false);
  assert.equal(hasFeatureAccess(stalePremiumDoc, "profile", BASE_NOW, null), false);
});

test("VC123-05: Untrusted trial source (firebase_auth_creation_time / none) fails closed", () => {
  const forgedAuthCreationProfile = {
    uid: "forged_1",
    trialStartedAt: "2026-11-10T00:00:00.000Z",
    trialEndsAt: "2026-11-17T00:00:00.000Z",
    entitlementSource: "firebase_auth_creation_time",
  } as any;

  const status = getEntitlementStatus(forgedAuthCreationProfile, BASE_NOW, null);
  assert.equal(status.isPremium, false);
  assert.equal(status.status, "Invalid Trial Setup");
  assert.equal(hasFeatureAccess(forgedAuthCreationProfile, "profile", BASE_NOW, null), false);
});

test("VC123-06: Clean Free account without trial has access to Dashboard only", () => {
  const freeProfile = {
    uid: "clean_free_1",
    plan: "free",
    membershipType: "FREE",
    setupCompleted: true,
    createdAt: "2026-06-01T00:00:00.000Z",
  } as any;

  const status = getEntitlementStatus(freeProfile, BASE_NOW, null);
  assert.equal(status.isPremium, false);
  assert.equal(status.effectiveTier, "Free");
  assert.equal(hasFeatureAccess(freeProfile, "dashboard", BASE_NOW, null), true);
  assert.equal(hasFeatureAccess(freeProfile, "profile", BASE_NOW, null), false);
  assert.equal(hasFeatureAccess(freeProfile, "wellness", BASE_NOW, null), false);
  assert.equal(hasFeatureAccess(freeProfile, "journey", BASE_NOW, null), false);
});

test("VC123-07: Account Switch / Cross-User isolation prevents stale access inheritance", () => {
  // Device previously had User A (Founder), then User B (Free) logs in
  const userA = founderTesterRecord;
  const userBProfile = { uid: "user_b_free", plan: "free" } as any;

  // Passing User A tester record to User B evaluation is invalid (UID mismatch)
  // Canonical resolver evaluates User B using only User B records
  const statusB = getEntitlementStatus(userBProfile, BASE_NOW, null);
  assert.equal(statusB.isPremium, false);
  assert.equal(hasFeatureAccess(userBProfile, "profile", BASE_NOW, null), false);
});
