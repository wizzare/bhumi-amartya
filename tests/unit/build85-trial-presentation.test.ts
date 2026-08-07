const firebaseEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "test.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1234567890",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:1234567890:web:test",
};
for (const [key, value] of Object.entries(firebaseEnv)) {
  if (!process.env[key]) process.env[key] = value;
}

/* eslint-disable @typescript-eslint/no-require-imports */
// Env must be seeded BEFORE the module graph evaluates; static ESM imports
// would hoist. Keep the same `require` pattern as the other trial tests.
const { getEntitlementStatus } = require("../../lib/billing/entitlementService");

// Build 85 P0 regression: the upgrade + premium-bhumi pages must derive
// premium/trial/free from the canonical entitlement source, so an ACTIVE
// 7-day trial renders TRIAL, a paid subscriber renders PREMIUM, and a
// genuinely free user renders FREE.

const NOW = new Date("2026-08-01T10:00:00.000Z");

function statusLabelOf(entitlement: { isPremium: boolean; reason: string }): string {
  if (!entitlement.isPremium) return "Free";
  return entitlement.reason === "trial" ? "Trial" : "Premium";
}

function accountLabelOf(p: { isPremium: boolean; isTrial: boolean }): string {
  return p.isTrial ? "Trial" : p.isPremium ? "Premium Bhumi" : "Penghuni Bhumi (Gratis)";
}

function trialProfile() {
  return {
    uid: "trial-fixture",
    setupCompleted: true,
    plan: "free_trial",
    membershipType: "TRIAL",
    entitlementSource: "firebase_auth_creation_time",
    accessSource: "firebase_auth_on_create",
    trialStartedAt: new Date("2026-07-28T10:00:00.000Z"),
    trialEndsAt: new Date("2026-08-04T10:00:00.000Z"),
  };
}

function premiumProfile() {
  return {
    uid: "paid-fixture",
    setupCompleted: true,
    plan: "premium",
    membershipType: "PREMIUM",
    entitlementSource: "google_play",
    trialStartedAt: undefined,
    trialEndsAt: undefined,
    membershipExpiryDate: new Date("2026-09-01T10:00:00.000Z"),
  };
}

function freeProfile() {
  return {
    uid: "free-fixture",
    setupCompleted: true,
    plan: "free",
    membershipType: "FREE",
    trialStartedAt: undefined,
    trialEndsAt: undefined,
  };
}

// CASE T: active trial -> TRIAL on both pages
const trialEnt = getEntitlementStatus(trialProfile() as any, NOW, null);
console.log(JSON.stringify({
  case: "build85-active-trial",
  isPremium: trialEnt.isPremium,
  reason: trialEnt.reason,
  status: trialEnt.status,
  upgradeLabel: statusLabelOf(trialEnt),
  premiumLabel: accountLabelOf({ isPremium: trialEnt.isPremium, isTrial: trialEnt.reason === "trial" }),
}, null, 2));
if (!trialEnt.isPremium || trialEnt.reason !== "trial") throw new Error("Active 7-day trial is not recognized as premium/entitlement trial");
if (statusLabelOf(trialEnt) !== "Trial") throw new Error("Upgrade page does not render TRIAL for active trial");
if (accountLabelOf({ isPremium: trialEnt.isPremium, isTrial: trialEnt.reason === "trial" }) !== "Trial") throw new Error("Premium page marks active trial as free");

// CASE P: paid subscriber -> PREMIUM
const paidEnt = getEntitlementStatus(premiumProfile() as any, NOW, null);
console.log(JSON.stringify({
  case: "build85-paid-subscriber",
  isPremium: paidEnt.isPremium,
  reason: paidEnt.reason,
  upgradeLabel: statusLabelOf(paidEnt),
  premiumLabel: accountLabelOf({ isPremium: paidEnt.isPremium, isTrial: paidEnt.reason === "trial" }),
}, null, 2));
if (!paidEnt.isPremium || paidEnt.reason !== "subscriber") throw new Error("Paid subscriber not recognized as premium");
if (statusLabelOf(paidEnt) !== "Premium") throw new Error("Upgrade page does not render PREMIUM for paid subscriber");
if (accountLabelOf({ isPremium: paidEnt.isPremium, isTrial: paidEnt.reason === "trial" }) !== "Premium Bhumi") throw new Error("Premium page does not render Premium Bhumi for paid subscriber");

// CASE F: free user -> FREE on both pages
const freeEnt = getEntitlementStatus(freeProfile() as any, NOW, null);
console.log(JSON.stringify({ case: "build85-free", isPremium: freeEnt.isPremium, reason: freeEnt.reason, upgradeLabel: statusLabelOf(freeEnt) }, null, 2));
if (freeEnt.isPremium) throw new Error("Free user incorrectly treated as premium");
if (statusLabelOf(freeEnt) !== "Free") throw new Error("Upgrade page does not render FREE for free user");

console.log("BUILD85 TRIAL PRESENTATION: PASS (TRIAL / PREMIUM / FREE)");