import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Module = require("node:module");
const originalLoad = Module._load;
let platform = "android";
const user = (uid: string) => ({ uid, getIdToken: async () => "synthetic-id" });
const auth = { currentUser: user("synthetic-a") };
const listeners = new Map<string, (...args: any[]) => any>();
const purchase = { purchaseToken: "synthetic-purchase", products: ["bhumi_premium_monthly"], purchaseState: 1 };
let purchases = [purchase];
let queries = 0;
let purchasesStarted = 0;
let requests = 0;
let refreshes = 0;
let failure = "";
let initialized = 0;
const stored = new Map<string, string>();
const plugin = {
  initialize: async () => { initialized++; return { connected: true }; },
  restorePurchases: async () => { queries++; return { purchases }; },
  purchasePremium: async () => { purchasesStarted++; return { purchases }; },
  addListener: async (name: string, callback: (...args: any[]) => any) => {
    listeners.set(name, callback);
    return { remove: () => { listeners.delete(name); } };
  },
};
Module._load = function(request: string, parent: unknown, ...args: unknown[]) {
  if (request === "@capacitor/core") return {
    Capacitor: { getPlatform: () => platform, isNativePlatform: () => platform === "android" },
    registerPlugin: (name: string) => name === "SecureStorage" ? {
      set: async ({ key, value }: { key: string; value: string }) => { stored.set(key, value); },
      remove: async ({ key }: { key: string }) => { stored.delete(key); },
    } : plugin,
  };
  if (request === "@/lib/firebase/firebase") return { auth };
  if (request === "@capacitor/preferences") return { Preferences: { set: async () => {}, remove: async () => {} } };
  return originalLoad.call(this, request, parent, ...args);
};
process.env.NEXT_PUBLIC_BILLING_VERIFIER_URL = "https://billing.invalid";
globalThis.fetch = async () => {
  requests++;
  if (failure === "network") throw new TypeError("sensitive-payload");
  if (failure === "provider") return Response.json({ ok: false, error: "GOOGLE_API_FAILURE" }, { status: 502 });
  return Response.json({ ok: true, active: true, signedEntitlement: "synthetic-signed", ledgerStatus: "degraded" });
};
const billing = require("../../lib/billing/googlePlayBilling");
const refresh = async () => { refreshes++; };
function reset() {
  billing.clearOnPostVerification();
  billing.setOnPostVerification(refresh);
  purchases = [purchase]; failure = "";
}
test("real billing client lifecycle, retry, isolation and manual actions", async () => {
  reset();
  await Promise.all([billing.initializeGooglePlayBilling(), billing.initializeGooglePlayBilling()]);
  assert.equal(initialized, 1);
  assert.equal(queries, 1);
  assert.equal(refreshes, 1);
  assert.equal(purchasesStarted, 0);
  assert.equal(listeners.size, 2);
  await listeners.get("appStateChange")!({ isActive: false });
  await listeners.get("appStateChange")!({ isActive: true });
  await billing.autoRecoverActiveSubscriptions();
  assert.equal(queries, 1);
  assert.equal(requests, 1);
  await listeners.get("purchaseUpdated")!({ purchases: [purchase] });
  assert.equal(refreshes, 2);
  for (const kind of ["network", "provider"]) {
    reset(); failure = kind;
    await billing.initializeGooglePlayBilling();
    const before = requests;
    await billing.autoRecoverActiveSubscriptions();
    assert.equal(requests, before + 1);
    assert.equal(stored.has("signed_entitlement_synthetic-a"), true);
    failure = "";
    await billing.autoRecoverActiveSubscriptions();
    assert.equal(requests, before + 2);
  }
  for (const owned of [[], [{ ...purchase, purchaseState: 2 }], [{ ...purchase, products: ["wrong"] }]]) {
    reset(); purchases = owned;
    const before = requests;
    await billing.initializeGooglePlayBilling();
    assert.equal(requests, before);
  }
  reset(); await billing.initializeGooglePlayBilling();
  auth.currentUser = user("synthetic-b");
  await listeners.get("appStateChange")!({ isActive: true });
  await billing.autoRecoverActiveSubscriptions();
  assert.equal(stored.has("signed_entitlement_synthetic-b"), true);
  assert.equal(purchasesStarted, 0);
  await billing.restoreAndRecoverPremium(refresh);
  await billing.purchaseAndRecoverPremium(refresh);
  assert.equal(purchasesStarted, 1);
  reset();
  const originalFetch = globalThis.fetch;
  let release!: (response: Response) => void;
  globalThis.fetch = async () => new Promise<Response>(resolve => { release = resolve; });
  const pending = billing.processAndVerifyPurchaseToken(purchase);
  await new Promise(resolve => setImmediate(resolve));
  auth.currentUser = user("synthetic-c");
  release(Response.json({ ok: true, active: true, signedEntitlement: "stale-signed" }));
  await assert.rejects(pending, /AUTH_CHANGED/);
  assert.equal(stored.has("signed_entitlement_synthetic-c"), false);
  assert.notEqual(stored.get("signed_entitlement_synthetic-b"), "stale-signed");
  globalThis.fetch = originalFetch;
  billing.clearOnPostVerification();
  assert.equal(listeners.size, 0);
  platform = "web";
  const before = queries;
  assert.deepEqual(await billing.autoRecoverActiveSubscriptions(), { recoveredCount: 0 });
  await assert.rejects(billing.initializeGooglePlayBilling());
  assert.equal(queries, before);
});
