import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { generateKeyPairSync } from "node:crypto";

const keys = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
process.env.ENTITLEMENT_PRIVATE_KEY = keys.privateKey.export({ type: "pkcs8", format: "pem" }).toString();
process.env.ENTITLEMENT_PUBLIC_KEY = keys.publicKey.export({ type: "spki", format: "pem" }).toString();
process.env.GOOGLE_PLAY_CLIENT_EMAIL = "synthetic@example.invalid";
process.env.GOOGLE_PLAY_PRIVATE_KEY = "synthetic";
process.env.BILLING_NEON_ENABLED = "false";
process.env.VERCEL_ENV = "production";
process.env.BILLING_TOKEN_ENCRYPTION_KEY_V1 = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const require = createRequire(import.meta.url);
const Module = require("node:module");
const originalLoad = Module._load;

const firestoreDb = new Map<string, Record<string, unknown>>();
let firestoreFail = false;
let authFail = false;
let googleSubscription: any = null;
let googleVoided: any = null;
let googleAckFail = false;
let googleFetchFail = false;
let googleFetchStatus = 200;

let mockPoolQueries: Array<{ text: string; params: any[] }> = [];
let mockPoolClaimRows: any[] = [];
let mockPoolLedgerRows: any[] = [];

// Intercept module loader for mocks
Module._load = function(request: string, parent: unknown, ...args: unknown[]) {
  if (request.endsWith("/neon") || request.endsWith("lib/neon")) {
    return {
      getDbPool: () => ({
        query: async (text: string, params?: any[]) => {
          mockPoolQueries.push({ text, params: params || [] });
          if (text.includes("UPDATE entitlement_sync_jobs") && text.includes("RETURNING")) {
            return { rows: mockPoolClaimRows };
          }
          if (text.includes("SELECT firebase_uid") && text.includes("purchase_ledger")) {
            return { rows: mockPoolLedgerRows };
          }
          return { rows: [] };
        },
        connect: async () => ({
          query: async () => ({ rows: [] }),
          release: () => {},
        }),
      }),
    };
  }
  if (request.endsWith("/firebaseAdmin") || request.endsWith("lib/firebaseAdmin")) {
    return {
      adminAuth: () => ({
        verifyIdToken: async (token: string) => {
          if (authFail || !token || token === "malformed" || token === "expired") {
            const err = new Error("auth/id-token-expired");
            (err as any).code = "auth/id-token-expired";
            throw err;
          }
          if (token.startsWith("uid-")) return { uid: token };
          return { uid: "user-verifier-test" };
        },
      }),
      adminDb: () => ({
        doc: (path: string) => path,
        runTransaction: async (callback: (tx: any) => Promise<unknown>) => {
          if (firestoreFail) throw new Error("FIRESTORE_WRITE_FAILURE");
          const txWrites: Array<{ path: string; data: Record<string, unknown>; merge?: boolean }> = [];
          const tx = {
            get: async (docRef: string) => {
              const current = firestoreDb.get(docRef);
              return {
                exists: Boolean(current),
                data: () => current ? JSON.parse(JSON.stringify(current)) : undefined,
              };
            },
            set: (docRef: string, data: Record<string, unknown>, options?: { merge?: boolean }) => {
              txWrites.push({ path: docRef, data, merge: options?.merge });
            },
          };
          const res = await callback(tx);
          for (const w of txWrites) {
            if (w.merge) {
              const existing = firestoreDb.get(w.path) || {};
              firestoreDb.set(w.path, { ...existing, ...w.data });
            } else {
              firestoreDb.set(w.path, { ...w.data });
            }
          }
          return res;
        },
      }),
    };
  }
  if (request.endsWith("/googlePlay") || request.endsWith("lib/googlePlay")) {
    return {
      createGooglePlayRequestContext: (ctx: any) => ({ ...ctx }),
      fetchSubscription: async (token: string) => {
        if (googleFetchFail) {
          const err = new Error(googleFetchStatus === 429 ? "RATE_LIMITED" : "GOOGLE_API_FAILURE");
          (err as any).status = googleFetchStatus;
          throw err;
        }
        if (token === "token-invalid") {
          throw new Error("TOKEN_INVALID");
        }
        return googleSubscription || {
          subscriptionState: "SUBSCRIPTION_STATE_ACTIVE",
          acknowledgementState: "ACKNOWLEDGEMENT_STATE_PENDING",
          lineItems: [{ productId: "bhumi_premium_monthly", expiryTime: "2026-12-31T00:00:00.000Z", autoRenewingPlan: { basePlanId: "monthly" } }],
        };
      },
      checkVoidedPurchase: async () => googleVoided || { checked: true, voided: false, reason: "ok" },
      validateProduct: (item: any) => item?.productId === "bhumi_premium_monthly",
      acknowledgeSubscription: async () => {
        if (googleAckFail) throw new Error("ACKNOWLEDGMENT_FAILURE");
        return { ok: true };
      },
    };
  }
  return originalLoad.call(this, request, parent, ...args);
};

// Target handler
const verifyHandler = require("../../api/billing/google-play/verify").default;
const reconcileHandler = require("../../api/billing/reconcile").default;

async function callVerify(req: { headers?: Record<string, string>; body?: Record<string, unknown>; method?: string }) {
  let status = 0;
  let body: any = null;
  const headers: Record<string, string> = {};

  const vercelReq = {
    method: req.method || "POST",
    headers: {
      authorization: "Bearer synthetic-token",
      origin: "https://localhost",
      "content-type": "application/json",
      ...(req.headers || {}),
    },
    body: req.body || {
      purchaseToken: "valid-purchase-token-01",
      productId: "bhumi_premium_monthly",
    },
  };

  const vercelRes = {
    setHeader(k: string, v: string) { headers[k.toLowerCase()] = v; },
    status(s: number) { status = s; return this; },
    json(b: any) { body = b; return this; },
    end() { return this; },
  };

  await verifyHandler(vercelReq, vercelRes);
  return { status, body, headers };
}

test("VERIFIER: 1. Valid purchase token grants active entitlement & acknowledges", async () => {
  firestoreDb.clear();
  googleSubscription = {
    subscriptionState: "SUBSCRIPTION_STATE_ACTIVE",
    acknowledgementState: "ACKNOWLEDGEMENT_STATE_PENDING",
    lineItems: [{ productId: "bhumi_premium_monthly", expiryTime: "2026-12-31T00:00:00.000Z", autoRenewingPlan: { basePlanId: "monthly" } }],
  };
  googleVoided = { checked: true, voided: false, reason: "ok" };

  const res = await callVerify({});
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.active, true);
  assert.equal(res.body.status, "ACTIVE");
  assert.equal(res.body.acknowledgementDeferred, false);
  assert.ok(res.body.signedEntitlement, "Signed entitlement must be issued");
});

test("VERIFIER: 2. Invalid purchase token returns 403 TOKEN_INVALID", async () => {
  firestoreDb.clear();
  const res = await callVerify({
    body: { purchaseToken: "token-invalid", productId: "bhumi_premium_monthly" },
  });
  assert.equal(res.status, 403);
  assert.equal(res.body.ok, false);
  assert.equal(res.body.error, "TOKEN_INVALID");
});

test("VERIFIER: 3. Expired subscription returns active: false & EXPIRED", async () => {
  firestoreDb.clear();
  googleSubscription = {
    subscriptionState: "SUBSCRIPTION_STATE_EXPIRED",
    acknowledgementState: "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
    lineItems: [{ productId: "bhumi_premium_monthly", expiryTime: "2026-01-01T00:00:00.000Z", autoRenewingPlan: { basePlanId: "monthly" } }],
  };

  const res = await callVerify({});
  assert.equal(res.status, 200);
  assert.equal(res.body.active, false);
  assert.equal(res.body.status, "EXPIRED");
});

test("VERIFIER: 4. Canceled subscription with future expiry returns CANCELED_PAID_THROUGH & active: true", async () => {
  firestoreDb.clear();
  googleSubscription = {
    subscriptionState: "SUBSCRIPTION_STATE_CANCELED",
    acknowledgementState: "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
    lineItems: [{ productId: "bhumi_premium_monthly", expiryTime: "2026-12-31T00:00:00.000Z", autoRenewingPlan: { basePlanId: "monthly" } }],
  };

  const res = await callVerify({});
  assert.equal(res.status, 200);
  assert.equal(res.body.active, true);
  assert.equal(res.body.status, "CANCELED_PAID_THROUGH");
});

test("VERIFIER: 5. Refunded / Voided purchase returns active: false & VOIDED", async () => {
  firestoreDb.clear();
  googleSubscription = {
    subscriptionState: "SUBSCRIPTION_STATE_ACTIVE",
    acknowledgementState: "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
    lineItems: [{ productId: "bhumi_premium_monthly", expiryTime: "2026-12-31T00:00:00.000Z", autoRenewingPlan: { basePlanId: "monthly" } }],
  };
  googleVoided = { checked: true, voided: true, reason: "refund" };

  const res = await callVerify({});
  assert.equal(res.status, 200);
  assert.equal(res.body.active, false);
  assert.equal(res.body.status, "VOIDED");
  googleVoided = null;
});

test("VERIFIER: 6. Grace Period returns active: true & GRACE_PERIOD", async () => {
  firestoreDb.clear();
  googleSubscription = {
    subscriptionState: "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
    acknowledgementState: "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
    lineItems: [{ productId: "bhumi_premium_monthly", expiryTime: "2026-12-31T00:00:00.000Z", autoRenewingPlan: { basePlanId: "monthly" } }],
  };

  const res = await callVerify({});
  assert.equal(res.status, 200);
  assert.equal(res.body.active, true);
  assert.equal(res.body.status, "GRACE_PERIOD");
});

test("VERIFIER: 7. Account Hold returns active: false & SUBSCRIPTION_INACTIVE", async () => {
  firestoreDb.clear();
  googleSubscription = {
    subscriptionState: "SUBSCRIPTION_STATE_ON_HOLD",
    acknowledgementState: "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
    lineItems: [{ productId: "bhumi_premium_monthly", expiryTime: "2026-12-31T00:00:00.000Z", autoRenewingPlan: { basePlanId: "monthly" } }],
  };

  const res = await callVerify({});
  assert.equal(res.status, 200);
  assert.equal(res.body.active, false);
  assert.equal(res.body.status, "SUBSCRIPTION_INACTIVE");
});

test("VERIFIER: 8. Acknowledgement failure sets acknowledgementDeferred = true without blocking entitlement", async () => {
  firestoreDb.clear();
  googleSubscription = {
    subscriptionState: "SUBSCRIPTION_STATE_ACTIVE",
    acknowledgementState: "ACKNOWLEDGEMENT_STATE_PENDING",
    lineItems: [{ productId: "bhumi_premium_monthly", expiryTime: "2026-12-31T00:00:00.000Z", autoRenewingPlan: { basePlanId: "monthly" } }],
  };
  googleAckFail = true;

  const res = await callVerify({});
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.active, true);
  assert.equal(res.body.acknowledgementDeferred, true, "Ack failure must be deferred, not fail the request");
  googleAckFail = false;
});

test("VERIFIER: 9. HTTP 400 on malformed body or product mismatch", async () => {
  const resBadProduct = await callVerify({
    body: { purchaseToken: "tok", productId: "wrong_product" },
  });
  assert.equal(resBadProduct.status, 400);
  assert.equal(resBadProduct.body.error, "PRODUCT_MISMATCH");

  const resEmptyToken = await callVerify({
    body: { purchaseToken: "", productId: "bhumi_premium_monthly" },
  });
  assert.equal(resEmptyToken.status, 400);
  assert.equal(resEmptyToken.body.error, "BODY_INVALID");
});

test("VERIFIER: 10. HTTP 401 on missing or expired Bearer token", async () => {
  const resNoAuth = await callVerify({ headers: { authorization: "" } });
  assert.equal(resNoAuth.status, 401);
  assert.equal(resNoAuth.body.error, "AUTH_MISSING");

  const resExpired = await callVerify({ headers: { authorization: "Bearer expired" } });
  assert.equal(resExpired.status, 401);
  assert.equal(resExpired.body.error, "AUTH_EXPIRED");
});

test("VERIFIER: 11. HTTP 403 on disallowed Origin", async () => {
  const resBadOrigin = await callVerify({ headers: { origin: "https://malicious-site.com" } });
  assert.equal(resBadOrigin.status, 403);
  assert.equal(resBadOrigin.body.error, "ORIGIN_NOT_ALLOWED");
});

test("VERIFIER: 12. HTTP 409 on TOKEN_OWNERSHIP_CONFLICT", async () => {
  firestoreDb.clear();
  googleSubscription = {
    subscriptionState: "SUBSCRIPTION_STATE_ACTIVE",
    acknowledgementState: "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
    lineItems: [{ productId: "bhumi_premium_monthly", expiryTime: "2026-12-31T00:00:00.000Z", autoRenewingPlan: { basePlanId: "monthly" } }],
  };

  // User 1 verifies
  const res1 = await callVerify({ headers: { authorization: "Bearer uid-user-1" }, body: { purchaseToken: "shared-token", productId: "bhumi_premium_monthly" } });
  assert.equal(res1.status, 200);

  // User 2 verifies same token
  const res2 = await callVerify({ headers: { authorization: "Bearer uid-user-2" }, body: { purchaseToken: "shared-token", productId: "bhumi_premium_monthly" } });
  assert.equal(res2.status, 409);
  assert.equal(res2.body.error, "TOKEN_OWNERSHIP_CONFLICT");
});

test("VERIFIER: 13. HTTP 500 retryable when canonical Firestore write fails", async () => {
  firestoreDb.clear();
  firestoreFail = true;
  const res = await callVerify({});
  assert.equal(res.status, 500);
  assert.equal(res.body.error, "ENTITLEMENT_WRITE_FAILURE");
  assert.equal(res.body.retryable, true);
  firestoreFail = false;
});

test("VERIFIER: 14. HTTP 502 retryable when Google Play API fails", async () => {
  firestoreDb.clear();
  googleFetchFail = true;
  googleFetchStatus = 502;
  const res = await callVerify({});
  assert.equal(res.status, 502);
  assert.equal(res.body.error, "GOOGLE_API_FAILURE");
  assert.equal(res.body.retryable, true);
  googleFetchFail = false;
});

const { encryptToken } = require("../../lib/encryption");

async function callReconcile(req: { headers?: Record<string, string> }) {
  let status = 0;
  let body: any = null;
  const vercelReq = {
    method: "POST",
    headers: req.headers || {},
  };
  const vercelRes = {
    setHeader() {},
    status(s: number) { status = s; return this; },
    json(b: any) { body = b; return this; },
    end() { return this; },
  };
  await reconcileHandler(vercelReq, vercelRes);
  return { status, body };
}

test("RECONCILE: 15. Reconcile returns 500 when CRON_SECRET is not configured", async () => {
  const oldSecret = process.env.CRON_SECRET;
  delete process.env.CRON_SECRET;
  try {
    const res = await callReconcile({ headers: { authorization: "Bearer some-secret" } });
    assert.equal(res.status, 500);
    assert.equal(res.body.ok, false);
    assert.equal(res.body.error, "CRON_SECRET_NOT_CONFIGURED");
  } finally {
    process.env.CRON_SECRET = oldSecret;
  }
});

test("RECONCILE: 16. Reconcile returns 401 when unauthorized cron request", async () => {
  process.env.CRON_SECRET = "test-cron-secret-12345";
  const resBadAuth = await callReconcile({ headers: { authorization: "Bearer wrong-secret" } });
  assert.equal(resBadAuth.status, 401);
  assert.equal(resBadAuth.body.ok, false);
  assert.equal(resBadAuth.body.error, "UNAUTHORIZED_CRON");

  const resMissingAuth = await callReconcile({ headers: {} });
  assert.equal(resMissingAuth.status, 401);
  assert.equal(resMissingAuth.body.error, "UNAUTHORIZED_CRON");
});

test("RECONCILE: 17. Reconcile processes claimed jobs, re-verifies, syncs Firestore & ledger", async () => {
  process.env.CRON_SECRET = "test-cron-secret-12345";
  firestoreDb.clear();
  mockPoolQueries = [];

  const encrypted = encryptToken("raw-token-for-job", {
    uid: "cron-uid-1",
    productId: "bhumi_premium_monthly",
    provider: "google_play",
  });

  mockPoolClaimRows = [
    { id: 101, ledger_id: "token-hash-101", job_type: "FIRESTORE_SYNC", attempt_count: 1 },
  ];
  mockPoolLedgerRows = [
    {
      firebase_uid: "cron-uid-1",
      provider: "google_play",
      product_id: "bhumi_premium_monthly",
      purchase_token_ciphertext: encrypted.ciphertext,
      purchase_token_iv: encrypted.iv,
      purchase_token_tag: encrypted.tag,
      encryption_key_version: encrypted.version,
      acknowledged: false,
    },
  ];

  googleSubscription = {
    subscriptionState: "SUBSCRIPTION_STATE_ACTIVE",
    acknowledgementState: "ACKNOWLEDGEMENT_STATE_PENDING",
    lineItems: [{ productId: "bhumi_premium_monthly", expiryTime: "2026-12-31T00:00:00.000Z", autoRenewingPlan: { basePlanId: "monthly" } }],
  };
  googleVoided = { checked: true, voided: false, reason: "ok" };

  const res = await callReconcile({ headers: { authorization: "Bearer test-cron-secret-12345" } });
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.claimed, 1);
  assert.equal(res.body.succeeded, 1);
  assert.equal(res.body.failed, 0);
  assert.equal(res.body.deadLettered, 0);

  // Assert firestore received active entitlement
  const userDoc = firestoreDb.get("users/cron-uid-1");
  assert.ok(userDoc);
  assert.equal(userDoc?.isPremium, true);

  // Assert ledger status update query was executed
  const completedJobQuery = mockPoolQueries.find(q => q.text.includes("UPDATE entitlement_sync_jobs SET status = 'COMPLETED'"));
  assert.ok(completedJobQuery, "Job 101 must be marked COMPLETED");
});

test("RECONCILE: 18. Reconcile failure with attempt_count < 10 schedules exponential backoff", async () => {
  process.env.CRON_SECRET = "test-cron-secret-12345";
  firestoreDb.clear();
  mockPoolQueries = [];

  const encrypted = encryptToken("raw-token-failing", {
    uid: "cron-uid-fail",
    productId: "bhumi_premium_monthly",
    provider: "google_play",
  });

  mockPoolClaimRows = [
    { id: 202, ledger_id: "token-hash-202", job_type: "FIRESTORE_SYNC", attempt_count: 2 },
  ];
  mockPoolLedgerRows = [
    {
      firebase_uid: "cron-uid-fail",
      provider: "google_play",
      product_id: "bhumi_premium_monthly",
      purchase_token_ciphertext: encrypted.ciphertext,
      purchase_token_iv: encrypted.iv,
      purchase_token_tag: encrypted.tag,
      encryption_key_version: encrypted.version,
      acknowledged: false,
    },
  ];

  googleFetchFail = true;
  googleFetchStatus = 502;

  const res = await callReconcile({ headers: { authorization: "Bearer test-cron-secret-12345" } });
  assert.equal(res.status, 200);
  assert.equal(res.body.claimed, 1);
  assert.equal(res.body.succeeded, 0);
  assert.equal(res.body.failed, 1);
  assert.equal(res.body.deadLettered, 0);

  const backoffQuery = mockPoolQueries.find(q => q.text.includes("SET status = 'FAILED'") && q.text.includes("next_attempt_at"));
  assert.ok(backoffQuery, "Job 202 must be scheduled with backoff");
  // attempt_count 2 => 2^2 = 4 minutes
  assert.equal(backoffQuery.params[2], "4");

  googleFetchFail = false;
});

test("RECONCILE: 19. Reconcile failure with attempt_count >= 10 transitions to DEAD_LETTER", async () => {
  process.env.CRON_SECRET = "test-cron-secret-12345";
  firestoreDb.clear();
  mockPoolQueries = [];

  const encrypted = encryptToken("raw-token-deadletter", {
    uid: "cron-uid-dl",
    productId: "bhumi_premium_monthly",
    provider: "google_play",
  });

  mockPoolClaimRows = [
    { id: 303, ledger_id: "token-hash-303", job_type: "FIRESTORE_SYNC", attempt_count: 10 },
  ];
  mockPoolLedgerRows = [
    {
      firebase_uid: "cron-uid-dl",
      provider: "google_play",
      product_id: "bhumi_premium_monthly",
      purchase_token_ciphertext: encrypted.ciphertext,
      purchase_token_iv: encrypted.iv,
      purchase_token_tag: encrypted.tag,
      encryption_key_version: encrypted.version,
      acknowledged: false,
    },
  ];

  googleFetchFail = true;
  googleFetchStatus = 502;

  const res = await callReconcile({ headers: { authorization: "Bearer test-cron-secret-12345" } });
  assert.equal(res.status, 200);
  assert.equal(res.body.claimed, 1);
  assert.equal(res.body.succeeded, 0);
  assert.equal(res.body.failed, 0);
  assert.equal(res.body.deadLettered, 1);

  const dlQuery = mockPoolQueries.find(q => q.text.includes("SET status = 'DEAD_LETTER'"));
  assert.ok(dlQuery, "Job 303 must be transitioned to DEAD_LETTER");

  googleFetchFail = false;
});
