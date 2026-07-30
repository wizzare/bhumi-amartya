import assert from "node:assert/strict";
import fs from "node:fs";

const client = fs.readFileSync("lib/billing/googlePlayBilling.ts", "utf8");
const upgrade = fs.readFileSync("app/upgrade/page.tsx", "utf8");
let assertions = 0;

function check(condition: unknown, message: string) {
  assertions++;
  assert.ok(condition, message);
}

// Build 82 contract: client uses fetch + billingVerifierUrl(), NOT httpsCallable
check(client.includes("billingVerifierUrl()"), "verifier endpoint sourced from billingVerifierUrl()");
check(client.includes("fetch(billingVerifierUrl()"), "billing verification uses fetch, not callable");
check(!client.includes('httpsCallable(functionsInstance, "verifyGooglePlayPurchase")'), "Firebase Callable is NOT used for billing verification");
check(!client.includes("!data || !data.ok"), "callable-style response check is absent");

// Error classification
check(client.includes("isRetryableVerifierTransportError"), "transport errors classified by isRetryableVerifierTransportError");

// Auth check — still required
check(client.includes('if (!currentUser) throw new Error("AUTH_MISSING")'), "unauthenticated callers are denied");

// Retryable patterns in error classification
check(client.includes("BILLING_VERIFIER_URL"), "billingVerifierUrl configuration is present");
check(client.includes("NEXT_PUBLIC_BILLING_VERIFIER_URL"), "environment-based verifier URL configuration");

// Shared processor
check(upgrade.includes("processAndVerifyPurchaseToken"), "purchase and restore use the shared processor");
check(upgrade.includes("refreshUserProfile()"), "successful verification refreshes entitlement without relogin");

console.log(`BILLING_CALLABLE_ONLY_PASS assertions=${assertions}`);
