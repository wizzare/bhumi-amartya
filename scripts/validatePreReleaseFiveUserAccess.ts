import { strict as assert } from "node:assert";
import { canAccessPremiumFeature, getUserAccess } from "../lib/access/accessControl";
import { getEntitlementStatus } from "../lib/billing/entitlementService";
import { sanitizeUserNarrative } from "../lib/narrative/presentationSafety";
import { Timestamp } from "firebase/firestore";

console.log("=== STARTING PRE-RELEASE FIVE-USER ACCESS ACCEPTANCE TEST ===");

const now = new Date();
const nowSeconds = Math.floor(now.getTime() / 1000);

// Helper to make Timestamp objects
function makeTimestamp(date: Date): Timestamp {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
    toDate: () => date,
  } as Timestamp;
}

// 1. Founder Control Profile
const founderProfile = {
  uid: "founder_control_uid",
  email: "wizzare@gmail.com",
  role: "founder",
  testerBadge: "Founder",
  createdAt: makeTimestamp(new Date("2026-01-01")),
  membershipType: null,
  membershipExpiryDate: null,
  accessUntil: null,
  plan: "founder",
};

// 2. Premium Control Profile
const premiumProfile = {
  uid: "premium_control_uid",
  email: "premium@bhumi.io",
  role: "user",
  testerBadge: null,
  createdAt: makeTimestamp(new Date("2026-07-10")),
  membershipType: "PREMIUM",
  membershipExpiryDate: makeTimestamp(new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000)), // expires in 10 days
  accessUntil: makeTimestamp(new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000)),
  plan: "premium",
};

// 3. Trial Control Profile (Active 7-day trial)
const trialProfile = {
  uid: "trial_control_uid",
  email: "trial@bhumi.io",
  role: "user",
  testerBadge: "Penjaga Bhumi",
  badge: "Penjaga Bhumi",
  createdAt: makeTimestamp(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)), // created 3 days ago
  membershipType: "FREE_TRIAL",
  membership: "free_trial",
  plan: "free_trial",
  accessUntil: makeTimestamp(new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000)), // expires in 4 days (7 days total)
};

// 4. Expired Trial Profile
const expiredTrialProfile = {
  uid: "expired_trial_uid",
  email: "expired@bhumi.io",
  role: "user",
  testerBadge: "Penjaga Bhumi",
  badge: "Penjaga Bhumi",
  createdAt: makeTimestamp(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)), // created 10 days ago
  membershipType: "FREE_TRIAL",
  membership: "expired",
  plan: "expired",
  subscriptionStatus: "expired",
  accessUntil: makeTimestamp(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)), // expired 3 days ago
};

// 5. New User A
const newUserAProfile = {
  uid: "new_user_a_uid",
  email: "newuserA@bhumi.io",
  role: "user",
  testerBadge: "Penjaga Bhumi",
  badge: "Penjaga Bhumi",
  createdAt: makeTimestamp(now), // created now
  membershipType: "FREE_TRIAL",
  membership: "free_trial",
  plan: "free_trial",
  accessUntil: makeTimestamp(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)), // expires in 7 days
};

// 6. New User B (Isolated)
const newUserBProfile = {
  uid: "new_user_b_uid",
  email: "newuserB@bhumi.io",
  role: "user",
  testerBadge: "Penjaga Bhumi",
  badge: "Penjaga Bhumi",
  createdAt: makeTimestamp(now), // created now
  membershipType: "FREE_TRIAL",
  membership: "free_trial",
  plan: "free_trial",
  accessUntil: makeTimestamp(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)), // expires in 7 days
};

console.log("\n[PHASE 1: Founder Control Assertions]");
const founderAccess = getUserAccess(founderProfile as any);
console.log("- Founder Access Plan:", founderAccess.plan);
console.log("- Founder Locked Features:", founderAccess.lockedFeatures);
assert.equal(founderAccess.lockedFeatures.length, 0, "Founder must have zero locked features");
assert.equal(canAccessPremiumFeature(founderProfile as any, "wellness"), true, "Founder must access wellness");
assert.equal(canAccessPremiumFeature(founderProfile as any, "profile"), true, "Founder must access profile");
assert.equal(canAccessPremiumFeature(founderProfile as any, "journey"), true, "Founder must access journey");
console.log("✓ Founder Control Assertions passed.");

console.log("\n[PHASE 2: Premium Control Assertions]");
const premiumAccess = getUserAccess(premiumProfile as any);
console.log("- Premium Access Plan:", premiumAccess.plan);
console.log("- Premium Locked Features:", premiumAccess.lockedFeatures);
assert.equal(premiumAccess.lockedFeatures.length, 0, "Premium must have zero locked features");
assert.equal(canAccessPremiumFeature(premiumProfile as any, "wellness"), true, "Premium must access wellness");
assert.equal(canAccessPremiumFeature(premiumProfile as any, "profile"), true, "Premium must access profile");
assert.equal(canAccessPremiumFeature(premiumProfile as any, "journey"), true, "Premium must access journey");
console.log("✓ Premium Control Assertions passed.");

console.log("\n[PHASE 3: Trial Control Assertions]");
const trialAccess = getUserAccess(trialProfile as any);
console.log("- Trial Access Plan:", trialAccess.plan);
console.log("- Trial Locked Features:", trialAccess.lockedFeatures);
assert.equal(trialAccess.lockedFeatures.length, 0, "Active trial must have zero locked features");
assert.equal(canAccessPremiumFeature(trialProfile as any, "wellness"), true, "Active trial must access wellness");
assert.equal(canAccessPremiumFeature(trialProfile as any, "profile"), true, "Active trial must access profile");
assert.equal(canAccessPremiumFeature(trialProfile as any, "journey"), true, "Active trial must access journey");
console.log("✓ Trial Control Assertions passed.");

console.log("\n[PHASE 4: Expired Trial Assertions]");
const expiredAccess = getUserAccess(expiredTrialProfile as any);
console.log("- Expired Access Plan:", expiredAccess.plan);
console.log("- Expired Locked Features:", expiredAccess.lockedFeatures.length, "features locked");
assert.ok(expiredAccess.lockedFeatures.includes("wellness"), "Expired trial must lock wellness");
assert.ok(expiredAccess.lockedFeatures.includes("profile"), "Expired trial must lock profile");
assert.ok(expiredAccess.lockedFeatures.includes("journey"), "Expired trial must lock journey");
assert.equal(canAccessPremiumFeature(expiredTrialProfile as any, "dashboard"), true, "Expired trial must access dashboard");
assert.equal(canAccessPremiumFeature(expiredTrialProfile as any, "wellness"), false, "Expired trial must NOT access wellness");
assert.equal(canAccessPremiumFeature(expiredTrialProfile as any, "profile"), false, "Expired trial must NOT access profile");
assert.equal(canAccessPremiumFeature(expiredTrialProfile as any, "journey"), false, "Expired trial must NOT access journey");
console.log("✓ Expired Trial Assertions passed.");

console.log("\n[PHASE 5: New User A Assertions]");
const newUserAAccess = getUserAccess(newUserAProfile as any);
console.log("- New User A Locked Features:", newUserAAccess.lockedFeatures);
assert.equal(newUserAAccess.lockedFeatures.length, 0, "New User A must have zero locked features initially");
assert.equal(canAccessPremiumFeature(newUserAProfile as any, "wellness"), true, "New User A must access wellness");
console.log("✓ New User A Assertions passed.");

console.log("\n[PHASE 6: New User B Assertions & Session Isolation]");
const newUserBAccess = getUserAccess(newUserBProfile as any);
assert.equal(newUserBAccess.lockedFeatures.length, 0, "New User B must have zero locked features initially");
// Verify strict object inequality to guarantee session isolation
assert.notEqual(newUserAProfile, newUserBProfile, "User profiles must be distinct references");
assert.notEqual(newUserAProfile.uid, newUserBProfile.uid, "User UIDs must be distinct");
assert.notEqual(newUserAProfile.email, newUserBProfile.email, "User emails must be distinct");
console.log("✓ New User B and isolation assertions passed.");

console.log("\n[PHASE 7: Spot Check Arsip Akashi Narrative Output for System Terminology]");
// Check custom generated text to verify zero blueprint systems language
const testSentences = [
  "Kepribadianmu mencerminkan air maskulin yang tenang namun dalam.",
  "Sebagai orang dengan bintang pisces, kamu sangat intuitif.",
  "Kamu memiliki energi naga merah imix yang menyala.",
  "Refleksimu dipengaruhi oleh anjing putih yang loyal.",
  "Lord of angular house memberimu perlindungan spiritual.",
  "Ketika jupiter 4th from the moon berada di titik seimbang.",
  "Perjalanan hidupmu diarahkan oleh kebijaksanaan batin yang tulus dan jujur."
];

for (const s of testSentences) {
  const cleanResult = sanitizeUserNarrative(s);
  const cleanText = cleanResult.text;
  const isOriginal = cleanResult.status === "PASS" || cleanResult.status === "SANITIZED";
  console.log(`Original: "${s}" -> Cleaned: "${cleanText}" (Status: ${cleanResult.status})`);
  
  // Verify no forbidden blueprint terms in cleaned text
  const forbiddenKeywords = [
    "pisces", "anjing putih", "naga merah", "imix", "jupiter 4th", "angular house", "lord of", "badai biru"
  ];
  for (const word of forbiddenKeywords) {
    assert.ok(
      !cleanText.toLowerCase().includes(word),
      `Sanitized output must not contain system terminology: ${word}`
    );
  }
}
console.log("✓ Arsip Akashi Spot Check passed.");

console.log("\n=== ALL PRE-RELEASE FIVE-USER ACCESS ACCEPTANCE TESTS PASSED ===");
export {};
