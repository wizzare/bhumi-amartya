import fs from "node:fs";

const route = fs.readFileSync("api/billing/google-play/verify.ts", "utf8");
const googlePlay = fs.readFileSync("lib/googlePlay.ts", "utf8");
const entitlement = fs.readFileSync("lib/entitlement.ts", "utf8");

for (const item of ["checkVoidedPurchase", "voidedpurchases", "VOIDED_PURCHASE_LOOKBACK_MS"]) if (!googlePlay.includes(item)) throw new Error(`voided-purchase safeguard missing: ${item}`);
for (const item of ["options.voided", 'status: "VOIDED"', "ackStatus", "markEntitlementAcknowledged"]) if (!entitlement.includes(item)) throw new Error(`persistence safeguard missing: ${item}`);
if (!googlePlay.includes("type Subscription = { subscriptionState?: string; acknowledgementState?: string; lineItems?: LineItem[] };")) throw new Error("subscription acknowledgement state must be modeled at the top level");
if (googlePlay.includes("type LineItem = { productId?: string; expiryTime?: string; acknowledgementState?: string")) throw new Error("line items must not own subscription acknowledgement state");
if (!route.includes("subscription.acknowledgementState === \"ACKNOWLEDGEMENT_STATE_PENDING\"") || route.includes("item?.acknowledgementState")) throw new Error("acknowledgement state must be read from the Google subscription response");

const persistIndex = route.indexOf("persistEntitlement(decoded.uid");
const acknowledgeIndex = route.indexOf("await acknowledgeSubscription");
if (persistIndex < 0 || acknowledgeIndex < 0 || persistIndex > acknowledgeIndex) throw new Error("entitlement must persist before acknowledgement");
if (!route.includes("try {\n        // The Google call has its own 3s bound") || !route.includes("await acknowledgeSubscription") || !route.includes("acknowledgementDeferred = true")) throw new Error("acknowledgement failures must not undo persisted entitlement");
if (!route.includes("const voidedCheck = await checkVoidedPurchase")) throw new Error("voided-purchase check must occur before entitlement decision");
if (!route.includes("[GOOGLE_PLAY_VOIDED_CHECK_UNAVAILABLE]") || !route.includes("if (!voidedCheck.checked)")) throw new Error("voided-purchase check failures must be visible in server logs");

console.log("BILLING_SERVER_PURCHASE_SAFETY_PASS");
