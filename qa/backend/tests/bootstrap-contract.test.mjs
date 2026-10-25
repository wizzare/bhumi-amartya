import assert from "node:assert/strict";
import test from "node:test";
import {
  ACCESS_SOURCE_VERSION,
  SEVEN_DAYS_MS,
  SOURCE,
  buildCanonicalGrant,
  createMinimalProfile,
  evaluateBootstrap,
  hasTrialState,
  isHigherEntitlement,
  validateCanonicalTrial,
} from "../lib/bootstrap-contract.mjs";

const NOW = new Date("2026-10-23T12:00:00.000Z");
const grant = buildCanonicalGrant(NOW);

test("builds the canonical seven-day server grant", () => {
  assert.equal(Date.parse(grant.trialEndsAt) - Date.parse(grant.trialStartedAt), SEVEN_DAYS_MS);
  assert.equal(grant.trialStartedAt, NOW.toISOString());
  assert.equal(grant.accessStart, grant.trialStartedAt);
  assert.equal(grant.accessUntil, grant.trialEndsAt);
  assert.equal(grant.entitlementSource, SOURCE);
  assert.equal(grant.accessSource, SOURCE);
  assert.equal(grant.updatedBy, SOURCE);
  assert.equal(grant.accessSourceVersion, ACCESS_SOURCE_VERSION);
  assert.equal(grant.membershipType, "TRIAL");
  assert.equal(grant.membership, "REGULAR_TRIAL");
  assert.equal(grant.plan, "free_trial");
  assert.equal(grant.subscriptionStatus, "trialing");
  assert.equal(validateCanonicalTrial(grant, NOW), true);
});

test("provisions a missing profile", () => {
  const decision = evaluateBootstrap(undefined, NOW);
  assert.equal(decision.outcome, "PROVISIONED");
  assert.equal(decision.ok, true);
  assert.equal(decision.grant.trialStartedAt, NOW.toISOString());
});

test("provisions an existing profile without trial state", () => {
  const decision = evaluateBootstrap({ uid: "synthetic", setupCompleted: true }, NOW);
  assert.equal(decision.outcome, "PROVISIONED");
  assert.equal(decision.grant.plan, "free_trial");
});

test("treats a canonical trial as idempotent", () => {
  const decision = evaluateBootstrap(grant, NOW);
  assert.equal(decision.outcome, "ALREADY_PRESENT");
  assert.equal(decision.ok, true);
  assert.equal(decision.trialStartedAt, grant.trialStartedAt);
  assert.equal(decision.trialEndsAt, grant.trialEndsAt);
});

test("fails closed on malformed or untrusted trial state", () => {
  const invalidStates = [
    { ...grant, trialEndsAt: new Date(NOW.getTime() + 10 * 86400000).toISOString() },
    { ...grant, trialStartedAt: new Date(NOW.getTime() + 60_000).toISOString() },
    { ...grant, accessStart: new Date(NOW.getTime() - 1).toISOString() },
    { ...grant, accessUntil: new Date(NOW.getTime() + 1).toISOString() },
    { ...grant, entitlementSource: "firebase_auth_creation_time" },
    { ...grant, accessSource: "client_forged" },
    { ...grant, updatedBy: "client" },
    { ...grant, accessSourceVersion: "unknown" },
    { ...grant, membershipType: "REGULAR" },
    { ...grant, membership: "REGULAR" },
    { ...grant, plan: "free" },
    { ...grant, subscriptionStatus: "active" },
    { trialStartedAt: grant.trialStartedAt },
    { trialEndsAt: grant.trialEndsAt },
    { membershipType: "TRIAL" },
    { plan: "free_trial" },
    { subscriptionStatus: "trialing" },
    { entitlementSource: SOURCE },
  ];
  for (const state of invalidStates) {
    const decision = evaluateBootstrap(state, NOW);
    assert.equal(decision.outcome, "DATA_CONFLICT");
    assert.equal(decision.ok, false);
  }
});

test("preserves higher server entitlements", () => {
  const higherStates = [
    { badge: "Founder" },
    { testerBadge: "Penjaga Bhumi Inti" },
    { guardianBadge: "Penjaga Bhumi Alfa" },
    { membershipType: "LIFETIME" },
    { membershipType: "PREMIUM" },
    { isPremium: true },
    { membershipType: "PREMIUM", entitlementSource: "google_play" },
  ];
  for (const state of higherStates) {
    assert.equal(isHigherEntitlement(state), true);
    const decision = evaluateBootstrap(state, NOW);
    assert.equal(decision.outcome, "HIGHER_ENTITLEMENT");
    assert.equal(decision.ok, true);
  }
});

test("recognizes every trial-state marker used by the production route", () => {
  for (const key of [
    "trialStartedAt",
    "trialEndsAt",
    "accessStart",
    "accessUntil",
    "entitlementSource",
    "accessSource",
    "trialLoginCount",
    "trialStatus",
    "trialCompletedAt",
    "trialGranted",
  ]) {
    assert.equal(hasTrialState({ [key]: null }), true, key);
  }
  assert.equal(hasTrialState({ membershipType: "TRIAL" }), true);
  assert.equal(hasTrialState({ membership: "REGULAR_TRIAL" }), true);
  assert.equal(hasTrialState({ plan: "free_trial" }), true);
  assert.equal(hasTrialState({ subscriptionStatus: "trialing" }), true);
  assert.equal(hasTrialState({ displayName: "Synthetic" }), false);
});

test("creates a minimal profile without server-owned access fields", () => {
  const profile = createMinimalProfile({
    uid: "synthetic-new-user",
    claims: { name: "Synthetic QA User", email: "synthetic@example.invalid" },
    now: NOW,
  });
  assert.equal(profile.uid, "synthetic-new-user");
  assert.equal(profile.fullName, "Synthetic QA User");
  assert.equal(profile.email, "synthetic@example.invalid");
  assert.equal(profile.setupCompleted, false);
  assert.equal(profile.blueprintStatus, "missing");
  assert.equal(profile.createdAt instanceof Date, true);
  for (const key of [
    "trialStartedAt",
    "trialEndsAt",
    "membershipType",
    "entitlementSource",
    "accessSource",
    "isPremium",
  ]) {
    assert.equal(Object.hasOwn(profile, key), false, key);
  }
});
