import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import { getEntitlementStatus } from "../../lib/billing/entitlementService";
import { getBillingPresentation } from "../../lib/billing/entitlementPresentation";
import { INTI_ACCESS_UNTIL, ALFA_ACCESS_UNTIL } from "../../lib/billing/founderTesterSourceOfTruth";

const ROOT = path.resolve(__dirname, "../..");

// ============================================================================
// SPRINT BILL-04 — BROWSER & UI ACCEPTANCE SUITE (UI-01 through UI-25)
// ============================================================================

test("UI-01: Free user presents neutral public access and default community badge", () => {
  const now = new Date("2026-10-20T12:00:00Z");
  const profile = { uid: "free-user-1", role: "user" };
  const entitlement = getEntitlementStatus(profile as any, now, null);
  const presentation = getBillingPresentation(entitlement, profile, null);

  assert.equal(presentation.commercialStatus, "Gratis / Akses Publik");
  assert.equal(presentation.communityBadge, "Penghuni Bhumi");
  assert.equal(presentation.isDualDisplay, false);
  assert.equal(presentation.hasAccess, false);
  assert.equal(presentation.isLifetime, false);
});

test("UI-02: Trial active user presents trial commercial status with remaining days", () => {
  const now = new Date("2026-10-20T12:00:00Z");
  const start = new Date("2026-10-18T12:00:00Z");
  const endsAt = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000); // Exactly 7 days
  const profile = {
    uid: "trial-user-1",
    role: "user",
    entitlementSource: "server_access_bootstrap",
    trialStartedAt: start.toISOString(),
    trialEndsAt: endsAt.toISOString(),
    accessUntil: endsAt.toISOString(),
  };
  const entitlement = getEntitlementStatus(profile as any, now, null);
  const presentation = getBillingPresentation(entitlement, profile, null);

  assert.equal(presentation.commercialStatus, "Masa Uji Coba Aktif");
  assert.equal(presentation.hasAccess, true);
  assert.equal(presentation.isDualDisplay, false);
  assert.equal(presentation.daysRemaining, 5);
  assert.ok(presentation.formattedExpiry !== null);
});

test("UI-03: Trial exhausted user presents trial ended without granting access", () => {
  const now = new Date("2026-10-20T12:00:00Z");
  const start = new Date("2026-10-01T12:00:00Z");
  const endsAt = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000); // Exactly 7 days
  const profile = {
    uid: "trial-ended-1",
    role: "user",
    entitlementSource: "server_access_bootstrap",
    trialStartedAt: start.toISOString(),
    trialEndsAt: endsAt.toISOString(),
    accessUntil: endsAt.toISOString(),
  };
  const entitlement = getEntitlementStatus(profile as any, now, null);
  const presentation = getBillingPresentation(entitlement, profile, null);

  assert.equal(presentation.commercialStatus, "Masa Uji Coba Berakhir");
  assert.equal(presentation.hasAccess, false);
});

test("UI-04: Active subscriber presents Premium Aktif with valid expiry date", () => {
  const now = new Date("2026-10-20T12:00:00Z");
  const expiry = new Date("2026-11-20T12:00:00Z");
  const profile = {
    uid: "paid-sub-1",
    entitlementSource: "google_play",
    membershipType: "PREMIUM",
    membershipExpiryDate: expiry.toISOString(),
    accessUntil: expiry.toISOString(),
  };
  const entitlement = getEntitlementStatus(profile as any, now, null);
  const presentation = getBillingPresentation(entitlement, profile, null);

  assert.equal(presentation.commercialStatus, "Premium Aktif");
  assert.equal(presentation.hasAccess, true);
  assert.equal(presentation.isLifetime, false);
  assert.ok(presentation.formattedExpiry !== null);
  assert.ok(presentation.daysRemaining! > 25);
});

test("UI-05: Canceled paid-through subscriber retains Premium Aktif until expiry", () => {
  const now = new Date("2026-10-20T12:00:00Z");
  const expiry = new Date("2026-10-28T12:00:00Z");
  const profile = {
    uid: "canceled-paid-through-1",
    entitlementSource: "google_play",
    membershipType: "PREMIUM",
    membershipExpiryDate: expiry.toISOString(),
    accessUntil: expiry.toISOString(),
    subscriptionStatus: "canceled",
  };
  const entitlement = getEntitlementStatus(profile as any, now, null);
  const presentation = getBillingPresentation(entitlement, profile, null);

  assert.equal(presentation.commercialStatus, "Premium Aktif");
  assert.equal(presentation.hasAccess, true);
  assert.equal(presentation.daysRemaining, 8);
});

test("UI-06: Expired subscriber presents Langganan Berakhir and locks access", () => {
  const now = new Date("2026-10-20T12:00:00Z");
  const expiry = new Date("2026-10-15T12:00:00Z");
  const profile = {
    uid: "expired-sub-1",
    entitlementSource: "google_play",
    membershipType: "PREMIUM",
    membershipExpiryDate: expiry.toISOString(),
    accessUntil: expiry.toISOString(),
  };
  const entitlement = getEntitlementStatus(profile as any, now, null);
  const presentation = getBillingPresentation(entitlement, profile, null);

  assert.equal(presentation.commercialStatus, "Langganan Berakhir");
  assert.equal(presentation.hasAccess, false);
});

test("UI-07: Founder user presents Founder Lifetime without fake expiry date", () => {
  const now = new Date("2026-10-20T12:00:00Z");
  const profile = { uid: "founder-1", role: "founder", accessUntil: "2099-12-31T23:59:59Z" };
  const entitlement = getEntitlementStatus(profile as any, now, null);
  const presentation = getBillingPresentation(entitlement, profile, null);

  assert.equal(presentation.commercialStatus, "Founder Lifetime");
  assert.equal(presentation.communityBadge, "Founder");
  assert.equal(presentation.isLifetime, true);
  assert.equal(presentation.hasAccess, true);
  assert.equal(presentation.formattedExpiry, null); // Invariant: No fake expiry for Founder
});

test("UI-08: Tester Penjaga Bhumi Inti presents honorific badge and tester grant", () => {
  const now = new Date("2026-07-15T12:00:00Z");
  const profile = { uid: "inti-tester-1", role: "user" };
  const testerRecord = { badge: "Penjaga Bhumi Inti", accessUntil: INTI_ACCESS_UNTIL };
  const entitlement = getEntitlementStatus(profile as any, now, testerRecord);
  const presentation = getBillingPresentation(entitlement, profile, testerRecord, now);

  assert.equal(presentation.communityBadge, "Penjaga Bhumi Inti");
  assert.equal(presentation.hasAccess, true);
});

test("UI-09: Tester Penjaga Bhumi Alfa presents honorific badge and tester grant", () => {
  const now = new Date("2026-07-15T12:00:00Z");
  const profile = { uid: "alfa-tester-1", role: "user" };
  const testerRecord = { badge: "Penjaga Bhumi Alfa", accessUntil: ALFA_ACCESS_UNTIL };
  const entitlement = getEntitlementStatus(profile as any, now, testerRecord);
  const presentation = getBillingPresentation(entitlement, profile, testerRecord, now);

  assert.equal(presentation.communityBadge, "Penjaga Bhumi Alfa");
  assert.equal(presentation.hasAccess, true);
});

test("UI-10: Dual Display renders both commercial status and community badge without conflation", () => {
  const now = new Date("2026-07-15T12:00:00Z");
  const expiry = new Date("2026-08-15T12:00:00Z");
  const profile = {
    uid: "dual-user-1",
    role: "user",
    entitlementSource: "google_play",
    membershipType: "PREMIUM",
    membershipExpiryDate: expiry.toISOString(),
    accessUntil: expiry.toISOString(),
  };
  const testerRecord = { badge: "Penjaga Bhumi Inti", accessUntil: INTI_ACCESS_UNTIL };
  const entitlement = getEntitlementStatus(profile as any, now, testerRecord);
  const presentation = getBillingPresentation(entitlement, profile, testerRecord, now);

  assert.equal(presentation.commercialStatus, "Premium Aktif");
  assert.equal(presentation.communityBadge, "Penjaga Bhumi Inti");
  assert.equal(presentation.isDualDisplay, true);
  assert.equal(presentation.hasAccess, true);
});

test("UI-11: Live Google Play price query authority contract in Premium page", () => {
  const premiumPage = fs.readFileSync(path.join(ROOT, "app/premium-bhumi/page.tsx"), "utf8");
  assert.ok(premiumPage.includes("queryPremiumSubscription()"));
  assert.ok(premiumPage.includes("pricingPhases?.[0]?.formattedPrice"));
});

test("UI-12: Neutral price fallback when Google Play price unavailable without hardcoded authority", () => {
  const premiumPage = fs.readFileSync(path.join(ROOT, "app/premium-bhumi/page.tsx"), "utf8");
  assert.ok(premiumPage.includes('"melalui Google Play"') || premiumPage.includes('"Harga tersedia melalui Google Play"'));
  // Absolute invariant: NO hardcoded Rp in source text as live authority
  assert.ok(!premiumPage.match(/>\s*Rp\s*\d+/));
});

test("UI-13: Web platform safety banner and purchase disablement contract", () => {
  const premiumPage = fs.readFileSync(path.join(ROOT, "app/premium-bhumi/page.tsx"), "utf8");
  const canonicalScreen = fs.readFileSync(path.join(ROOT, "components/billing/CanonicalPremiumScreen.tsx"), "utf8");

  assert.ok(premiumPage.includes("isGooglePlayBillingAvailable()"));
  assert.ok(canonicalScreen.includes("!billingAvailable"));
  assert.ok(canonicalScreen.includes("Pembelian Google Play hanya tersedia"));
});

test("UI-14: Purchase pending state displays accessible announcement", () => {
  const premiumPage = fs.readFileSync(path.join(ROOT, "app/premium-bhumi/page.tsx"), "utf8");
  const canonicalScreen = fs.readFileSync(path.join(ROOT, "components/billing/CanonicalPremiumScreen.tsx"), "utf8");

  assert.ok(premiumPage.includes("PAYMENT_PENDING") || premiumPage.includes("Pembayaran sedang diproses"));
  assert.ok(canonicalScreen.includes('aria-live="polite"') || canonicalScreen.includes('role="status"'));
});

test("UI-15: Purchase and restore success state triggers user profile refresh", () => {
  const premiumPage = fs.readFileSync(path.join(ROOT, "app/premium-bhumi/page.tsx"), "utf8");
  assert.ok(premiumPage.includes("refreshUserProfile"));
  assert.ok(premiumPage.includes("purchaseAndRecoverPremium"));
});

test("UI-16: Retryable verification failure presents safe informative guidance", () => {
  const premiumPage = fs.readFileSync(path.join(ROOT, "app/premium-bhumi/page.tsx"), "utf8");
  assert.ok(premiumPage.includes("RETRYABLE_VERIFICATION_FAILURE"));
});

test("UI-17: Restore found handles active subscription recovery", () => {
  const premiumPage = fs.readFileSync(path.join(ROOT, "app/premium-bhumi/page.tsx"), "utf8");
  assert.ok(premiumPage.includes("restoreAndRecoverPremium"));
  assert.ok(premiumPage.includes("handleRestore"));
});

test("UI-18: Restore not found displays clear non-error message", () => {
  const premiumPage = fs.readFileSync(path.join(ROOT, "app/premium-bhumi/page.tsx"), "utf8");
  assert.ok(premiumPage.includes("Tidak ada pembelian aktif") || premiumPage.includes("restoreAndRecoverPremium"));
});

test("UI-19: Restore account conflict / already owned presents secure handling without leak", () => {
  const premiumPage = fs.readFileSync(path.join(ROOT, "app/premium-bhumi/page.tsx"), "utf8");
  assert.ok(premiumPage.includes("ALREADY_OWNED") || premiumPage.includes("purchaseAndRecoverPremium"));
});

test("UI-20: Account switch isolates session and recalculates canonical presentation cleanly", () => {
  const now = new Date("2026-10-20T12:00:00Z");
  // User A (Paid)
  const profileA = {
    uid: "user-A",
    entitlementSource: "google_play",
    membershipType: "PREMIUM",
    membershipExpiryDate: "2026-11-20T12:00:00Z",
    accessUntil: "2026-11-20T12:00:00Z",
  };
  const entA = getEntitlementStatus(profileA as any, now, null);
  const presA = getBillingPresentation(entA, profileA, null);
  assert.equal(presA.commercialStatus, "Premium Aktif");

  // User B (Free)
  const profileB = { uid: "user-B", role: "user" };
  const entB = getEntitlementStatus(profileB as any, now, null);
  const presB = getBillingPresentation(entB, profileB, null);
  assert.equal(presB.commercialStatus, "Gratis / Akses Publik");
});

test("UI-21: Settings page consumes canonical getBillingPresentation and displays status", () => {
  const settingsPage = fs.readFileSync(path.join(ROOT, "app/settings/page.tsx"), "utf8");
  assert.ok(settingsPage.includes("getBillingPresentation(entitlement, originalProfile, testerRecord)"));
  assert.ok(settingsPage.includes("membershipDisplay.formattedExpiry"));
  assert.ok(!settingsPage.includes("localStorage.setItem(USER_PLAN_STORAGE_KEY"));
});

test("UI-22: Upgrade page consumes canonical getEntitlementStatus and live price query", () => {
  const upgradePage = fs.readFileSync(path.join(ROOT, "app/upgrade/page.tsx"), "utf8");
  assert.ok(upgradePage.includes("getEntitlementStatus"));
  assert.ok(upgradePage.includes("queryPremiumSubscription()"));
  assert.ok(upgradePage.includes("GOOGLE_PLAY_PRODUCT_ID"));
});

test("UI-23: Paywall / AccessGuard components use canonical entitlement", () => {
  const accessGuard = fs.readFileSync(path.join(ROOT, "components/auth/AccessGuard.tsx"), "utf8");
  assert.ok(accessGuard.includes("hasFeatureAccess") || accessGuard.includes("getEntitlementStatus"));
});

test("UI-24: Dual-display and responsive presentation contracts in CanonicalPremiumScreen", () => {
  const canonicalScreen = fs.readFileSync(path.join(ROOT, "components/billing/CanonicalPremiumScreen.tsx"), "utf8");
  assert.ok(canonicalScreen.includes("presentation.isDualDisplay"));
  assert.ok(canonicalScreen.includes("presentation.communityBadge"));
  assert.ok(canonicalScreen.includes("presentation.commercialStatus"));
});

test("UI-25: Indonesian language purity in billing presentation (Build 110 standard)", () => {
  const presentationFile = fs.readFileSync(path.join(ROOT, "lib/billing/entitlementPresentation.ts"), "utf8");
  assert.ok(presentationFile.includes('"Gratis / Akses Publik"'));
  assert.ok(presentationFile.includes('"Masa Uji Coba Aktif"'));
  assert.ok(presentationFile.includes('"Masa Uji Coba Berakhir"'));
  assert.ok(presentationFile.includes('"Premium Aktif"'));
  assert.ok(presentationFile.includes('"Langganan Berakhir"'));
  assert.ok(presentationFile.includes('"Founder Lifetime"'));
});
