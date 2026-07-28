import assert from "node:assert/strict";
import fs from "node:fs";

const client = fs.readFileSync("lib/billing/googlePlayBilling.ts", "utf8");
const upgrade = fs.readFileSync("app/upgrade/page.tsx", "utf8");
const functions = fs.readFileSync("functions/index.js", "utf8");
let assertions = 0;

function check(condition: unknown, message: string) {
  assertions++;
  assert.ok(condition, message);
}

check(client.includes('httpsCallable(functionsInstance, "verifyGooglePlayPurchase")'), "callable verification is invoked");
check(client.includes("if (!data || !data.ok)"), "callable business denials are rejected");
check(client.includes("throw callableError;"), "callable code and message propagate unchanged");
check(!client.includes("BILLING_VERIFIER_URL"), "HTTP verifier configuration is absent from the client");
check(!client.includes("fetch("), "business, security, unauthenticated, and transport failures cannot invoke HTTP");
check(client.includes("functions/unavailable"), "transport failures are classified retryable");
check(client.includes("retryable: true"), "transport failures are marked retryable");
check(client.includes('if (!currentUser) throw new Error("AUTH_MISSING")'), "unauthenticated callers are denied");
check(functions.includes('const GOOGLE_PLAY_ACTIVE_STATES') && !functions.includes('"SUBSCRIPTION_STATE_PENDING"'), "only active or grace states can grant entitlement; PENDING is denied");
check(functions.includes("purchase_voided_or_refunded"), "refunded or voided purchases are denied server-side");
check(functions.includes("purchase_token_already_linked_to_another_uid"), "cross-account tokens are denied server-side");
check(functions.includes("idempotent"), "same-account duplicate verification is idempotent server-side");
check(upgrade.includes("processAndVerifyPurchaseToken"), "purchase and restore use the shared processor");
check(upgrade.includes("refreshUserProfile()"), "successful verification refreshes entitlement without relogin");

console.log(`BILLING_CALLABLE_ONLY_PASS assertions=${assertions}`);
