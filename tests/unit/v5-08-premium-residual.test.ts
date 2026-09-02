/**
 * V5-08 Premium Residual — R-PRD-42 static acceptance guard.
 *
 * Recovered from CP-036 and reconciled to prove the complete display-price
 * chain without invoking Google Play, purchases, or production services.
 */
import fs from "node:fs";

let passed = 0;
let failed = 0;
function ok(name: string, condition: boolean) {
  if (condition) {
    console.log(`PASS: ${name}`);
    passed += 1;
  } else {
    console.error(`FAIL: ${name}`);
    failed += 1;
  }
}

const premiumPage = fs.readFileSync("app/premium-bhumi/page.tsx", "utf8");
const upgradePage = fs.readFileSync("app/upgrade/page.tsx", "utf8");
const premiumLock = fs.readFileSync("components/auth/PremiumLock.tsx", "utf8");
const accessGuard = fs.readFileSync("components/auth/AccessGuard.tsx", "utf8");
const entitlementSrc = fs.readFileSync("lib/billing/entitlementService.ts", "utf8");
const billingSrc = fs.readFileSync("lib/billing/googlePlayBilling.ts", "utf8");
const nativeBillingSrc = fs.readFileSync(
  "android/app/src/main/java/com/bhumiamartya/app/billing/BhumiBillingPlugin.java",
  "utf8",
);
const idLocale = JSON.parse(fs.readFileSync("src/locales/id-ID/translation.json", "utf8"));
const enLocale = JSON.parse(fs.readFileSync("src/locales/en-US/translation.json", "utf8"));
const msLocale = JSON.parse(fs.readFileSync("src/locales/ms-MY/translation.json", "utf8"));

// Canonical display fallback: Rp25.000 in every current locale and Premium surface.
ok("id display price is Rp25.000", idLocale.premiumBhumi.subscriptionNote.includes("Rp25.000/bulan"));
ok("en display price is Rp25.000", enLocale.premiumBhumi.subscriptionNote.includes("Rp25.000/month"));
ok("ms display price is Rp25.000", msLocale.premiumBhumi.subscriptionNote.includes("Rp25.000/bulan"));
ok("Premium page fallback is Rp25.000", premiumPage.includes("Langganan bulanan Rp25.000/bulan"));

// The stale Build-105 display price must not remain in current user-facing sources.
const currentPremiumSurfaces = [premiumPage, upgradePage, premiumLock, accessGuard, entitlementSrc];
ok("no stale Rp50.000 in current Premium surfaces", currentPremiumSurfaces.every((source) => !/Rp\s?50(?:\.|,)?000|50\.000/.test(source)));
ok("no stale Rp50.000 in id copy", !idLocale.premiumBhumi.subscriptionNote.includes("Rp50"));
ok("no stale Rp50.000 in en copy", !enLocale.premiumBhumi.subscriptionNote.includes("Rp50"));
ok("no stale Rp50.000 in ms copy", !msLocale.premiumBhumi.subscriptionNote.includes("Rp50"));

// Locale copy remains complete.
ok("id Premium keys remain present", Boolean(idLocale.premiumBhumi.title && idLocale.premiumBhumi.subscribeButton));
ok("en Premium keys remain present", Boolean(enLocale.premiumBhumi.title && enLocale.premiumBhumi.subscribeButton));
ok("ms Premium keys remain present", Boolean(msLocale.premiumBhumi.title && msLocale.premiumBhumi.subscribeButton));

// Entitlement priority and state presentation are intentionally unchanged.
ok("founder entitlement priority remains", entitlementSrc.includes("founder") && entitlementSrc.includes("LIFETIME"));
ok("tester entitlement priority remains", entitlementSrc.includes("inti_badge") && entitlementSrc.includes("alfa_badge"));
ok("subscriber entitlement remains Google Play backed", entitlementSrc.includes("google_play") && entitlementSrc.includes("subscriber"));
ok("trial entitlement remains", entitlementSrc.includes("7-Day Trial"));
ok("free entitlement remains", entitlementSrc.includes("Free Account"));
ok("Premium active UI remains", premiumPage.includes("activeAccess") || premiumPage.includes("Akses premium aktif"));
ok("trial UI remains", premiumPage.includes("daysLeft") && premiumPage.includes("trialActive"));
ok("free UI remains", premiumPage.includes("freeAccess") || premiumPage.includes("Akses gratis"));
ok("pending-purchase UI remains", premiumPage.includes("PAYMENT_PENDING") && premiumPage.includes("Pembayaran sedang diproses"));
ok("cancelled purchase remains non-error", premiumPage.includes("USER_CANCELED"));
ok("already-owned recovery remains", premiumPage.includes("restoreAndRecoverPremium"));
ok("retryable verification state remains", premiumPage.includes("RETRYABLE_VERIFICATION_FAILURE"));
ok("persistence failure state remains", premiumPage.includes("PERSISTENCE_FAILURE"));
ok("expired state remains", premiumPage.includes("accessExpired") || premiumPage.includes("Akses kedaluwarsa"));
ok("restore button remains", premiumPage.includes("handleRestore") && premiumPage.includes("restoreButton"));
ok("restore uses canonical recovery", premiumPage.includes("restoreAndRecoverPremium"));
ok("PremiumLock uses canonical entitlement", premiumLock.includes("getEntitlementStatus"));
ok("AccessGuard uses canonical entitlement", accessGuard.includes("getEntitlementStatus"));
ok("no client-side entitlement bypass", !premiumLock.includes("isPremium: true") && !accessGuard.includes("isPremium: true"));
ok("Premium UI does not expose billing internals", !premiumPage.includes("BillingResponseCode") && !premiumPage.includes("DATABASE_URL") && !premiumPage.includes("purchaseToken"));
ok("Upgrade UI does not expose billing internals", !upgradePage.includes("DATABASE_URL") && !upgradePage.includes("purchaseToken"));

// Live Google Play formattedPrice remains the authority when the native product is available.
const queryIndex = upgradePage.indexOf("queryPremiumSubscription()");
const setProductIndex = upgradePage.indexOf("setProduct(details)");
const monthlyOfferIndex = upgradePage.indexOf('find((offer) => offer.basePlanId === "monthly")');
const livePriceIndex = upgradePage.indexOf("formattedPrice", monthlyOfferIndex);
const neutralFallbackIndex = upgradePage.indexOf('|| "Google Play"', livePriceIndex);
ok("native bridge returns formattedPrice", nativeBillingSrc.includes('phaseJson.put("formattedPrice", phase.getFormattedPrice())'));
ok("Upgrade queries Google Play product details", queryIndex >= 0);
ok("Upgrade stores returned Play product details", setProductIndex > queryIndex);
ok("Upgrade selects the monthly base plan", monthlyOfferIndex >= 0);
ok("monthly formattedPrice is selected", livePriceIndex > monthlyOfferIndex);
ok("live price precedes neutral unavailable fallback", neutralFallbackIndex > livePriceIndex);
ok("Upgrade does not hardcode a monetary price", !/Rp\s?\d/.test(upgradePage));
ok("Upgrade renders the selected price", upgradePage.includes('<Row label="Harga" value={price} />'));
ok("Google Play product ID remains canonical", billingSrc.includes('GOOGLE_PLAY_PRODUCT_ID = "bhumi_premium_monthly"'));
ok("Google Play base plan remains canonical", billingSrc.includes('GOOGLE_PLAY_BASE_PLAN_ID = "monthly"'));
ok("Google Play package remains canonical", billingSrc.includes('GOOGLE_PLAY_PACKAGE_NAME = "com.bhumiamartya.app"'));
ok("Premium purchase flow remains canonical", premiumPage.includes("purchaseAndRecoverPremium"));
ok("Upgrade purchase flow remains canonical", upgradePage.includes("purchasePremiumSubscription"));
ok("Upgrade verification flow remains canonical", upgradePage.includes("processAndVerifyPurchaseToken"));

console.log(`\nV5_08_PREMIUM_PRICE_PASS assertions=${passed} failed=${failed}`);
if (failed > 0) process.exit(1);
