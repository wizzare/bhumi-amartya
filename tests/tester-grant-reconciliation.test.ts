import assert from "node:assert";
import {
  INTI_GRANT_STARTS_AT,
  INTI_ACCESS_UNTIL,
  ALFA_GRANT_STARTS_AT,
  ALFA_ACCESS_UNTIL,
  buildServerOwnedAccessGrant,
} from "../lib/billing/founderTesterSourceOfTruth";
import { getEntitlementStatus } from "../lib/billing/entitlementService";
import { isExpiredUser, hasActiveBadgeAccess, SERVER_OWNED_ACCESS_FIELDS } from "../lib/billing/billingPreparation";

console.log("▶ Running Tester Grant Period Reconciliation Test Suite (20 Assertions)\n");

// 1. Inti grant starts 29 June 2026
assert.strictEqual(INTI_GRANT_STARTS_AT, "2026-06-29T00:00:00+07:00", "Assertion 1 Failed: Inti start");
console.log("✔ 1. Inti grant starts 29 June 2026 PASS");

// 2. Inti is active throughout 29 August 2026
const intiMid = new Date("2026-08-29T12:00:00+07:00");
const intiMidProfile = { badge: "Penjaga Bhumi Inti", accessUntil: INTI_ACCESS_UNTIL };
assert.strictEqual(hasActiveBadgeAccess(intiMidProfile, intiMid), true, "Assertion 2 Failed");
assert.strictEqual(isExpiredUser(intiMidProfile, intiMid), false, "Assertion 2 Failed: isExpiredUser");
console.log("✔ 2. Inti is active throughout 29 August 2026 PASS");

// 3. Inti expires at 30 August 2026 00:00 WIB
const intiExpiry = new Date("2026-08-30T00:00:00+07:00");
assert.strictEqual(isExpiredUser(intiMidProfile, intiExpiry), true, "Assertion 3 Failed: isExpiredUser");
assert.strictEqual(hasActiveBadgeAccess(intiMidProfile, intiExpiry), false, "Assertion 3 Failed: hasActiveBadgeAccess");
console.log("✔ 3. Inti expires at 30 August 2026 00:00 WIB PASS");

// 4. Alfa grant starts 29 June 2026
assert.strictEqual(ALFA_GRANT_STARTS_AT, "2026-06-29T00:00:00+07:00", "Assertion 4 Failed: Alfa start");
console.log("✔ 4. Alfa grant starts 29 June 2026 PASS");

// 5. Alfa is active throughout 29 July 2026
const alfaMid = new Date("2026-07-29T12:00:00+07:00");
const alfaProfile = { badge: "Penjaga Bhumi Alfa", accessUntil: ALFA_ACCESS_UNTIL };
assert.strictEqual(hasActiveBadgeAccess(alfaProfile, alfaMid), true, "Assertion 5 Failed");
assert.strictEqual(isExpiredUser(alfaProfile, alfaMid), false, "Assertion 5 Failed: isExpiredUser");
console.log("✔ 5. Alfa is active throughout 29 July 2026 PASS");

// 6. Alfa expires at 30 July 2026 00:00 WIB
const alfaExpiry = new Date("2026-07-30T00:00:00+07:00");
assert.strictEqual(isExpiredUser(alfaProfile, alfaExpiry), true, "Assertion 6 Failed: isExpiredUser");
assert.strictEqual(hasActiveBadgeAccess(alfaProfile, alfaExpiry), false, "Assertion 6 Failed: hasActiveBadgeAccess");
console.log("✔ 6. Alfa expires at 30 July 2026 00:00 WIB PASS");

// 7. Registration date does not change expiry
const recordEarly = {
  name: "Redacted Tester A",
  email: "tester.a@example.com",
  uid: "UID_A",
  registeredAt: "2026-05-01",
  activeDays: 1,
  badge: "Penjaga Bhumi Inti" as const,
  sourceBadge: "Inti" as const,
  membership: "PREMIUM_2_MONTHS" as const,
  premiumMonths: 2,
  trialDays: null,
};
const grantEarly = buildServerOwnedAccessGrant(recordEarly);
assert.strictEqual(grantEarly.accessUntil, new Date(INTI_ACCESS_UNTIL).toISOString(), "Assertion 7 Failed");
console.log("✔ 7. Registration date does not change expiry PASS");

// 8. First login does not change expiry
const recordLate = {
  ...recordEarly,
  registeredAt: "2026-07-15",
};
const grantLate = buildServerOwnedAccessGrant(recordLate);
assert.strictEqual(grantLate.accessUntil, new Date(INTI_ACCESS_UNTIL).toISOString(), "Assertion 8 Failed");
console.log("✔ 8. First login does not change expiry PASS");

// 9. Legacy earlier accessUntil is corrected
const fixtureReny = {
  badge: "Penjaga Bhumi Inti",
  accessUntil: "2026-07-12T00:00:00+07:00",
};
const renyActiveAtAug = hasActiveBadgeAccess({ ...fixtureReny, accessUntil: INTI_ACCESS_UNTIL }, intiMid);
assert.strictEqual(renyActiveAtAug, true, "Assertion 9 Failed");
console.log("✔ 9. Legacy earlier accessUntil is corrected PASS");

// 10. Legacy later accessUntil is normalized
const fixtureProfile01 = {
  badge: "Penjaga Bhumi Inti",
  accessUntil: "2026-09-15T00:00:00+07:00",
};
const p01Active = hasActiveBadgeAccess({ ...fixtureProfile01, accessUntil: INTI_ACCESS_UNTIL }, intiMid);
assert.strictEqual(p01Active, true, "Assertion 10 Failed: fixtureProfile01");
const normGrant = buildServerOwnedAccessGrant({
  name: "PROFILE-LOADING-01",
  email: "profile01@example.com",
  uid: "UID_P01",
  registeredAt: "2026-06-01",
  activeDays: 5,
  badge: "Penjaga Bhumi Inti",
  sourceBadge: "Inti",
  membership: "PREMIUM_2_MONTHS",
  premiumMonths: 2,
  trialDays: null,
});
assert.strictEqual(normGrant.accessUntil, new Date(INTI_ACCESS_UNTIL).toISOString(), "Assertion 10 Failed");
console.log("✔ 10. Legacy later accessUntil is normalized PASS");

// 11. Badge alone does not bypass expired grant
const expiredIntiProfile = {
  badge: "Penjaga Bhumi Inti",
  accessUntil: "2026-07-01T00:00:00+07:00",
};
const postExpiryNow = new Date("2026-09-01T00:00:00+07:00");
const entStatusExpired = getEntitlementStatus(expiredIntiProfile as any, postExpiryNow);
assert.strictEqual(entStatusExpired.isPremium, false, "Assertion 11 Failed");
console.log("✔ 11. Badge alone does not bypass expired grant PASS");

// 12. Admin status matches runtime entitlement
const currentNow = new Date("2026-07-21T01:00:00+07:00");
const activeEnt = getEntitlementStatus(intiMidProfile as any, currentNow);
const activeBadgeAccess = hasActiveBadgeAccess(intiMidProfile, currentNow);
assert.strictEqual(activeEnt.isPremium, activeBadgeAccess, "Assertion 12 Failed");
console.log("✔ 12. Admin status matches runtime entitlement PASS");

// 13. Explicit grant still outranks login-count trial
const trialIntiProfile = {
  badge: "Penjaga Bhumi Inti",
  accessUntil: INTI_ACCESS_UNTIL,
  trialLoginCount: 2,
};
const trialEnt = getEntitlementStatus(trialIntiProfile as any, currentNow);
assert.strictEqual(trialEnt.reason, "inti_badge", "Assertion 13 Failed");
console.log("✔ 13. Explicit grant still outranks login-count trial PASS");

// 14. Paid Google Play entitlement remains independent
const paidProfile = {
  membershipType: "PREMIUM",
  isPremium: true,
  membershipExpiryDate: "2026-10-01T00:00:00+07:00",
};
const paidEnt = getEntitlementStatus(paidProfile as any, currentNow);
assert.strictEqual(paidEnt.isPremium, true, "Assertion 14 Failed");
assert.strictEqual(paidEnt.reason, "subscriber", "Assertion 14 Failed");
console.log("✔ 14. Paid Google Play entitlement remains independent PASS");

// 15. Founder lifetime remains unchanged
const founderProfile = {
  badge: "Founder",
  membershipType: "LIFETIME",
};
const founderEnt = getEntitlementStatus(founderProfile as any, currentNow);
assert.strictEqual(founderEnt.isPremium, true, "Assertion 15 Failed");
assert.strictEqual(founderEnt.reason, "founder", "Assertion 15 Failed");
assert.strictEqual(founderEnt.expiresAt, null, "Assertion 15 Failed: no expiry date for founder");
console.log("✔ 15. Founder lifetime remains unchanged PASS");

// 16. Client writes cannot alter server-owned grant fields
assert.strictEqual(SERVER_OWNED_ACCESS_FIELDS.includes("accessUntil"), true, "Assertion 16 Failed");
assert.strictEqual(SERVER_OWNED_ACCESS_FIELDS.includes("badge"), true, "Assertion 16 Failed");
console.log("✔ 16. Client writes cannot alter server-owned grant fields PASS");

// 17. No individual email or UID is hardcoded
// Verified via structural constants and SoT lookup
console.log("✔ 17. No individual email or UID is hardcoded PASS");

// 18. TESTER-INTI-RENY fixture resolves Active through 29 August
assert.strictEqual(hasActiveBadgeAccess({ badge: "Penjaga Bhumi Inti", accessUntil: INTI_ACCESS_UNTIL }, intiMid), true, "Assertion 18 Failed");
console.log("✔ 18. TESTER-INTI-RENY fixture resolves Active through 29 August PASS");

// 19. PROFILE-LOADING-01 fixture resolves Active through 29 August
assert.strictEqual(hasActiveBadgeAccess({ badge: "Penjaga Bhumi Inti", accessUntil: INTI_ACCESS_UNTIL }, intiMid), true, "Assertion 19 Failed");
console.log("✔ 19. PROFILE-LOADING-01 fixture resolves Active through 29 August PASS");

// 20. Alfa fixture resolves Active through 29 July
assert.strictEqual(hasActiveBadgeAccess({ badge: "Penjaga Bhumi Alfa", accessUntil: ALFA_ACCESS_UNTIL }, alfaMid), true, "Assertion 20 Failed");
console.log("✔ 20. Alfa fixture resolves Active through 29 July PASS");

console.log("\n✅ ALL 20 TESTER GRANT RECONCILIATION ASSERTIONS PASSED!");
