import fs from "node:fs";

const route = fs.readFileSync("api/billing/google-play/verify.ts", "utf8");
const googlePlay = fs.readFileSync("lib/googlePlay.ts", "utf8");
const entitlement = fs.readFileSync("lib/entitlement.ts", "utf8");

for (const item of ["checkVoidedPurchase", "voidedpurchases", "VOIDED_PURCHASE_LOOKBACK_MS"]) if (!googlePlay.includes(item)) throw new Error(`voided-purchase safeguard missing: ${item}`);
for (const item of ["options.voided", 'status: "VOIDED"', "ackStatus", "markEntitlementAcknowledged"]) if (!entitlement.includes(item)) throw new Error(`persistence safeguard missing: ${item}`);
if (!googlePlay.includes("type Subscription = { subscriptionState?: string; acknowledgementState?: string; lineItems?: LineItem[] };")) throw new Error("subscription acknowledgement state must be modeled at the top level");
if (googlePlay.includes("type LineItem = { productId?: string; expiryTime?: string; acknowledgementState?: string")) throw new Error("line items must not own subscription acknowledgement state");
if (!route.includes("subscription.acknowledgementState === \"ACKNOWLEDGEMENT_STATE_PENDING\"") || route.includes("item?.acknowledgementState")) throw new Error("acknowledgement state must be read from the Google subscription response");

// Whitespace-insensitive view so structural checks do not depend on exact
// comments / indentation (the previous exact-string guard broke on a reword
// while the invariant it targeted still held).
const flat = route.replace(/\s+/g, " ");

const ledgerIndex = route.indexOf("executeLedgerVerificationTx(");
const persistIndex = route.indexOf("persistEntitlement(decoded.uid");
const acknowledgeIndex = route.indexOf("await acknowledgeSubscription");
if (persistIndex < 0 || acknowledgeIndex < 0 || persistIndex > acknowledgeIndex) throw new Error("entitlement must persist before acknowledgement");
if (ledgerIndex < 0 || ledgerIndex > persistIndex) throw new Error("durable Neon ledger transaction must run before entitlement persistence");

// ACK failure must be caught and recorded as deferred — never rethrown so as to
// undo the persisted/durable entitlement.
if (!/catch\s*(\([^)]*\))?\s*\{[^}]*acknowledgementDeferred\s*=\s*true[^}]*\}/.test(flat)) {
  throw new Error("acknowledgement failure must set acknowledgementDeferred = true inside a catch, not propagate");
}

// Firestore sync failure must be non-fatal (logged + ledger sync-failure marked).
if (!flat.includes("markLedgerSyncFailure(")) throw new Error("Firestore sync failure must record a ledger sync-failure marker");

// The committed contract: durable Neon ledger -> Firestore is a downstream
// mirror -> Google ACK is best-effort. Firestore sync success MUST NOT gate ACK.
if (/if\s*\(\s*acknowledgementPending\s*&&\s*firestoreSynced\s*\)/.test(flat)
  || /acknowledgementDeferred\s*=\s*acknowledgementPending\s*&&\s*!\s*firestoreSynced/.test(flat)) {
  throw new Error("Firestore-gated ACK detected: `acknowledgementPending && firestoreSynced` must not be an ACK prerequisite");
}

if (!route.includes("const voidedCheck = await checkVoidedPurchase")) throw new Error("voided-purchase check must occur before entitlement decision");
if (!route.includes("[GOOGLE_PLAY_VOIDED_CHECK_UNAVAILABLE]") || !route.includes("if (!voidedCheck.checked)")) throw new Error("voided-purchase check failures must be visible in server logs");

console.log("BILLING_SERVER_PURCHASE_SAFETY_PASS");
