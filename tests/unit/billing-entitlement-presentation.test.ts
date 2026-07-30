import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { getBillingPresentation } from "../../lib/billing/entitlementPresentation.ts";
import type { EntitlementStatus } from "../../lib/billing/entitlementService.ts";

const canonicalStates: Array<{
  label: string;
  entitlement: EntitlementStatus;
  expectedState: ReturnType<typeof getBillingPresentation>["state"];
  expectedGate: boolean;
}> = [
  {
    label: "free",
    entitlement: { isPremium: false, reason: "none", expiresAt: null, daysRemaining: 0, effectiveTier: "Free", source: "Free Account", status: "Free Access", trialLoginsRemaining: null },
    expectedState: "free",
    expectedGate: false,
  },
  {
    label: "trial active",
    entitlement: { isPremium: true, reason: "trial", expiresAt: null, daysRemaining: 4, effectiveTier: "Trial", source: "7-Login Trial", status: "Active", trialLoginsRemaining: "Sisa Kuota Login: 4/7" },
    expectedState: "trial_active",
    expectedGate: true,
  },
  {
    label: "trial exhausted",
    entitlement: { isPremium: false, reason: "none", expiresAt: null, daysRemaining: 0, effectiveTier: "Free (Trial Exhausted)", source: "Free Account", status: "Trial Exhausted", trialLoginsRemaining: "Sisa Kuota Login: 0/7" },
    expectedState: "trial_exhausted",
    expectedGate: false,
  },
  {
    label: "premium active",
    entitlement: { isPremium: true, reason: "subscriber", expiresAt: new Date("2026-08-30T00:00:00Z"), daysRemaining: 35, effectiveTier: "Paid Premium", source: "Google Play Billing", status: "Active", trialLoginsRemaining: null },
    expectedState: "premium_active",
    expectedGate: true,
  },
  {
    label: "premium expired",
    entitlement: { isPremium: false, reason: "none", expiresAt: new Date("2026-06-01T00:00:00Z"), daysRemaining: 0, effectiveTier: "Paid Premium (Expired)", source: "Google Play Billing", status: "Expired", trialLoginsRemaining: null },
    expectedState: "premium_expired",
    expectedGate: false,
  },
];

let passed = 0;
function test(label: string, condition: boolean) {
  assert.equal(condition, true, label);
  passed++;
  console.log(`PASS: ${label}`);
}

for (const fixture of canonicalStates) {
  const presentation = getBillingPresentation(fixture.entitlement);
  test(`${fixture.label}: mapper matches canonical entitlement state`, presentation.state === fixture.expectedState);
  test(`${fixture.label}: presentation preserves gate outcome`, presentation.hasAccess === fixture.expectedGate && presentation.hasAccess === fixture.entitlement.isPremium);
}

const trial = getBillingPresentation(canonicalStates[1].entitlement);
test("trial takes precedence over generic premium-like access", trial.state === "trial_active" && trial.hasAccess);

const premium = getBillingPresentation(canonicalStates[3].entitlement);
test("paid membership is not ignored", premium.state === "premium_active" && premium.hasAccess);

const free = getBillingPresentation(canonicalStates[0].entitlement);
test("absent accessUntil on a true free account does not imply expired", free.state === "free");

const expiredPremium = getBillingPresentation(canonicalStates[4].entitlement);
test("expired premium does not become free", expiredPremium.state === "premium_expired" && !expiredPremium.hasAccess);

const entitlementSource = readFileSync(resolve("lib/billing/entitlementService.ts"), "utf8");
test("canonical source distinguishes explicit free from exhausted trial (time-based trial model)", entitlementSource.includes("trialEnd && now < trialEnd && !isExplicitFree"));
test("canonical source retains expired paid identity after trial fallback", entitlementSource.includes("if (expiredSubscriberAt)"));

const premiumPage = readFileSync(resolve("app/premium-bhumi/page.tsx"), "utf8");
const settingsPage = readFileSync(resolve("app/settings/page.tsx"), "utf8");
test("premium page consumes the shared presentation mapper", premiumPage.includes("getBillingPresentation") && !premiumPage.includes("isExpiredUser"));
test("settings page consumes the shared presentation mapper", settingsPage.includes("getBillingPresentation") && !settingsPage.includes("isExpiredUser"));

console.log(`${passed} tests passed`);
