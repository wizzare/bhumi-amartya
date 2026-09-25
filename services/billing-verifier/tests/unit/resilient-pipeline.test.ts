import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { generateKeyPairSync } from "node:crypto";

const require = createRequire(import.meta.url);
const Module = require("node:module");
const originalLoad = Module._load;
const records = new Map<string, Record<string, unknown>>();
let steps: string[] = [];
let uid = "synthetic-owner";
let failFirestore = false;
let ledgerFailure = "";
let basePlanId = "monthly";
let serial = Promise.resolve();
let jobType = "FIRESTORE_SYNC";
let providerFailure = false;
let voided = false;
let voidedUnavailable = false;
let ackFailure = false;
let jobStatus = "";
let ledgerStatus = "";
const pool = { query: async (sql: string, values: unknown[]) => {
  if (sql.includes("RETURNING id")) return { rows: [{ id: 1, ledger_id: "synthetic-hash", job_type: jobType, attempt_count: 1 }] };
  if (sql.includes("SELECT firebase_uid")) return { rows: [{ firebase_uid: uid, provider: "google_play", product_id: "bhumi_premium_monthly", acknowledged: true }] };
  if (sql.includes("entitlement_status = $2")) ledgerStatus = String(values[1]);
  if (sql.includes("status = 'COMPLETED'")) jobStatus = "COMPLETED";
  if (sql.includes("status = 'FAILED'")) jobStatus = String(values[1]);
  return { rows: [] };
} };
const db = {
  doc: (path: string) => path,
  runTransaction: (callback: (tx: unknown) => Promise<void>) => {
    const work = serial.then(async () => {
      if (failFirestore) throw new Error("sensitive-provider-payload");
      const writes: Array<[string, Record<string, unknown>]> = [];
      await callback({
        get: async (path: string) => ({ exists: records.has(path), data: () => records.get(path) }),
        set: (path: string, data: Record<string, unknown>) => writes.push([path, data]),
      });
      for (const [path, data] of writes) records.set(path, { ...records.get(path), ...data });
      steps.push(writes.some(([, data]) => data.lastVerifiedAt) ? "persist" : "firestore_ack");
    });
    serial = work.catch(() => {});
    return work;
  },
};
const keys = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
process.env.ENTITLEMENT_PRIVATE_KEY = keys.privateKey.export({ type: "pkcs8", format: "pem" }).toString();
process.env.ENTITLEMENT_PUBLIC_KEY = keys.publicKey.export({ type: "spki", format: "pem" }).toString();
process.env.GOOGLE_PLAY_CLIENT_EMAIL = "synthetic@example.invalid";
process.env.GOOGLE_PLAY_PRIVATE_KEY = "synthetic";
process.env.BILLING_NEON_ENABLED = "true";
process.env.VERCEL_ENV = "production";
Module._load = function(request: string, parent: unknown, ...args: unknown[]) {
  if (request.endsWith("/firebaseAdmin") || request === "./firebaseAdmin") return {
    adminAuth: () => ({ verifyIdToken: async () => { steps.push("auth"); return { uid }; } }),
    adminDb: () => db,
  };
  if (request === "google-auth-library") return { GoogleAuth: class {
    async getClient() { return { getAccessToken: async () => ({ token: "synthetic" }) }; }
  } };
  if (request.endsWith("/neon")) return { getDbPool: () => pool };
  if (request.endsWith("/encryption")) return { decryptToken: () => "synthetic-purchase" };
  if (request.endsWith("/purchaseLedger")) return {
    executeLedgerVerificationTx: async () => {
      steps.push("ledger");
      if (ledgerFailure === "hang") return new Promise(() => {});
      if (["quota", "network", "socket"].includes(ledgerFailure)) throw new Error("sensitive-provider-payload");
    },
    markLedgerSyncSuccess: async () => { if (ledgerFailure === "sync") throw new Error("sensitive-provider-payload"); },
    updateLedgerAck: async () => { if (ledgerFailure === "ack") throw new Error("sensitive-provider-payload"); },
  };
  const loaded = originalLoad.call(this, request, parent, ...args);
  if (request.endsWith("/signedEntitlement")) return { ...loaded, generateSignedEntitlement: (...values: unknown[]) => {
    steps.push("sign");
    return loaded.generateSignedEntitlement(...values);
  } };
  return loaded;
};
globalThis.fetch = async (input) => {
  const url = String(input);
  if (url.includes("subscriptionsv2")) {
    steps.push("google");
    if (providerFailure) return new Response(null, { status: 403 });
    return Response.json({ subscriptionState: "SUBSCRIPTION_STATE_ACTIVE", acknowledgementState: "ACKNOWLEDGEMENT_STATE_PENDING", lineItems: [{ productId: "bhumi_premium_monthly", offerDetails: { basePlanId }, expiryTime: new Date(Date.now() + 86400000).toISOString() }] });
  }
  if (url.endsWith(":acknowledge")) { steps.push("google_ack"); return new Response(null, { status: ackFailure ? 403 : 204 }); }
  if (url.includes("voidedpurchases")) return voidedUnavailable ? new Response(null, { status: 403 }) : Response.json({ voidedPurchases: voided ? [{ purchaseToken: "synthetic-purchase" }] : [] });
  throw new Error("UNEXPECTED_NETWORK");
};
const handler = require("../../api/billing/google-play/verify").default;
const { verifySignedEntitlement } = require("../../lib/signedEntitlement");
const { persistEntitlement, decision } = require("../../lib/entitlement");
const logs: string[] = [];
for (const level of ["info", "warn", "error"] as const) console[level] = (...args) => { logs.push(JSON.stringify(args)); };
async function invoke() {
  let status = 0;
  let body: any;
  await handler({ method: "POST", headers: { authorization: "Bearer synthetic" }, body: { purchaseToken: "synthetic-purchase", productId: "bhumi_premium_monthly" } }, {
    setHeader() {}, status(value: number) { status = value; return this; }, json(value: unknown) { body = value; return this; }, end() {},
  });
  return { status, body };
}
test("actual handler, Google transport, Firestore transactions and signing", async () => {
  for (const failure of ["", "quota", "network", "socket", "sync", "ack", "hang"]) {
    steps = []; ledgerFailure = failure;
    const response = await invoke();
    assert.equal(response.status, 200);
    assert.equal(response.body.active, true);
    assert.equal(response.body.ledgerStatus, failure ? "degraded" : "healthy");
    assert.equal(response.body.acknowledgementDeferred, false);
    assert.equal(verifySignedEntitlement(response.body.signedEntitlement)?.sub, uid);
    assert.equal(records.get(`users/${uid}`)?.isPremium, true);
    assert.deepEqual(steps, ["auth", "google", "persist", "sign", "google_ack", "firestore_ack", "ledger"]);
  }
  failFirestore = true; steps = [];
  const failed = await invoke();
  assert.equal(failed.status, 500);
  assert.equal(failed.body.error, "ENTITLEMENT_WRITE_FAILURE");
  assert.equal(failed.body.retryable, true);
  assert.equal(failed.body.signedEntitlement, undefined);
  assert.deepEqual(steps, ["auth", "google"]);
  failFirestore = false;
  uid = "synthetic-other"; steps = [];
  assert.equal((await invoke()).status, 409);
  assert.equal(records.has(`users/${uid}`), false);
  assert.equal(steps.includes("sign"), false);
  uid = "synthetic-owner"; basePlanId = "wrong";
  assert.equal((await invoke()).status, 403);
  basePlanId = "";
  assert.equal((await invoke()).status, 403);
  const entitlement = decision("SUBSCRIPTION_STATE_ACTIVE", new Date(Date.now() + 86400000).toISOString());
  const outcomes = await Promise.allSettled(["synthetic-a", "synthetic-b"].map(owner => persistEntitlement(owner, "synthetic-race", "SUBSCRIPTION_STATE_ACTIVE", entitlement, "ACK_PENDING", { checked: true, voided: false, reason: "test" })));
  assert.equal(outcomes.filter(value => value.status === "fulfilled").length, 1);
  assert.equal(outcomes.filter(value => value.status === "rejected").length, 1);
  assert.equal([...records.keys()].filter(key => key.startsWith("billing_purchase_tokens/")).length, 2);
  assert.equal(JSON.stringify([...records.values()]).includes("synthetic-purchase"), false);
  assert.equal(logs.join().includes("sensitive-provider-payload"), false);
  assert.equal(logs.join().includes("synthetic-owner"), false);
});

test("actual reconcile validates provider state before persistence and retries acknowledgement", async () => {
  const reconcile = require("../../api/billing/reconcile").default;
  process.env.CRON_SECRET = "synthetic-cron";
  uid = "synthetic-owner";
  async function run() {
    steps = []; jobStatus = ""; ledgerStatus = "";
    let body: any;
    await reconcile({ headers: { authorization: "Bearer synthetic-cron" } }, {
      setHeader() {}, status(value: number) { assert.equal(value, 200); return this; }, json(value: unknown) { body = value; return this; },
    });
    return body;
  }
  for (const type of ["FIRESTORE_SYNC", "ACKNOWLEDGEMENT"]) {
    jobType = type;
    for (const plan of ["wrong", ""]) {
      basePlanId = plan;
      assert.equal((await run()).failed, 1);
      assert.equal(jobStatus, "PRODUCT_MISMATCH");
      assert.deepEqual(steps, ["google"]);
    }
    basePlanId = "monthly";
    providerFailure = true;
    assert.equal((await run()).failed, 1);
    assert.deepEqual(steps, ["google"]);
    assert.equal(records.get(`users/${uid}`)?.isPremium, true);
    providerFailure = false;
    failFirestore = true;
    assert.equal((await run()).failed, 1);
    assert.deepEqual(steps, ["google"]);
    assert.equal(jobStatus, "RECONCILE_FAILED");
    failFirestore = false;
    ackFailure = true;
    assert.equal((await run()).failed, 1);
    assert.equal(jobStatus, "ACKNOWLEDGMENT_FAILURE");
    assert.deepEqual(steps, ["google", "persist", "google_ack"]);
    ackFailure = false;
    voidedUnavailable = true;
    assert.equal((await run()).succeeded, 1);
    assert.equal(jobStatus, "COMPLETED");
    assert.equal(ledgerStatus, "ACTIVE_SYNCED");
    assert.deepEqual(steps, ["google", "persist", "google_ack", "firestore_ack"]);
    const token = [...records.values()].find(value => value.uid === uid);
    assert.equal((token?.voidedCheck as any).checked, false);
    voidedUnavailable = false;
    voided = true;
    assert.equal((await run()).succeeded, 1);
    assert.equal(ledgerStatus, "VOIDED");
    assert.equal(records.get(`users/${uid}`)?.isPremium, false);
    assert.deepEqual(steps, ["google", "persist"]);
    voided = false;
    await run();
  }
});
