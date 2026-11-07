import assert from "node:assert/strict";
import test from "node:test";
import {
  handleBootstrapTrial,
  handleGooglePlayVerify,
  handleGooglePlayRestore,
  handleRefreshBadge,
  handleReconcile,
} from "../src/billing/handlers";
import { decision } from "../src/billing/decision";
import { tokenHash } from "../src/billing/security";

// In-memory Firestore simulation matching the FirestoreRest interface
class MockSnapshot {
  constructor(data) {
    this._data = data;
  }
  get exists() {
    return this._data !== undefined && this._data !== null;
  }
  data() {
    return this._data ? JSON.parse(JSON.stringify(this._data)) : undefined;
  }
}

class MockFirestore {
  docs = new Map();

  doc(path) {
    return {
      path,
      get: async () => new MockSnapshot(this.docs.get(path)),
    };
  }

  async runTransaction(callback) {
    const pendingWrites = [];
    const tx = {
      get: async (docRef) => new MockSnapshot(this.docs.get(docRef.path)),
      set: (docRef, data, options) => {
        pendingWrites.push({ path: docRef.path, data, merge: options?.merge });
      },
    };

    const result = await callback(tx);

    // Commit writes atomically
    for (const write of pendingWrites) {
      if (write.merge) {
        const existing = this.docs.get(write.path) || {};
        this.docs.set(write.path, { ...existing, ...write.data });
      } else {
        this.docs.set(write.path, write.data);
      }
    }
    return result;
  }
}

test("Billing Decision Engine Parity", () => {
  const future = new Date(Date.now() + 86400000).toISOString();
  const past = new Date(Date.now() - 86400000).toISOString();

  assert.deepEqual(decision("SUBSCRIPTION_STATE_ACTIVE", future), {
    active: true,
    status: "ACTIVE",
    date: new Date(future),
  });

  assert.deepEqual(decision("SUBSCRIPTION_STATE_IN_GRACE_PERIOD", future), {
    active: true,
    status: "GRACE_PERIOD",
    date: new Date(future),
  });

  assert.deepEqual(decision("SUBSCRIPTION_STATE_CANCELED", future), {
    active: true,
    status: "CANCELED_PAID_THROUGH",
    date: new Date(future),
  });

  assert.deepEqual(decision("SUBSCRIPTION_STATE_ACTIVE", past), {
    active: false,
    status: "EXPIRED",
    date: new Date(past),
  });

  assert.deepEqual(decision("SUBSCRIPTION_STATE_ACTIVE", future, { voided: true }), {
    active: false,
    status: "VOIDED",
    date: new Date(future),
  });
});

test("Bootstrap Trial Lifecycle & Idempotency", async () => {
  const db = new MockFirestore();
  const identity = { uid: "user-alpha" };
  const env = {};

  // 1. Clean user: PROVISIONED
  const res1 = await handleBootstrapTrial(null, identity, env, db);
  assert.equal(res1.status, 200);
  assert.equal(res1.body.ok, true);
  assert.equal(res1.body.outcome, "PROVISIONED");
  assert.ok(res1.body.trialStartedAt);
  assert.ok(res1.body.trialEndsAt);

  // 2. Duplicate call: ALREADY_PRESENT (idempotent)
  const res2 = await handleBootstrapTrial(null, identity, env, db);
  assert.equal(res2.status, 200);
  assert.equal(res2.body.ok, true);
  assert.equal(res2.body.outcome, "ALREADY_PRESENT");

  // 3. User with Founder badge: HIGHER_ENTITLEMENT
  db.docs.set("users/founder-user", { badge: "Founder" });
  const res3 = await handleBootstrapTrial(null, { uid: "founder-user" }, env, db);
  assert.equal(res3.status, 200);
  assert.equal(res3.body.ok, true);
  assert.equal(res3.body.outcome, "HIGHER_ENTITLEMENT");

  // 4. User with corrupted/tampered trial dates: DATA_CONFLICT
  db.docs.set("users/tampered-user", {
    trialStartedAt: "2026-01-01T00:00:00.000Z",
    trialEndsAt: "2099-01-01T00:00:00.000Z", // Invalid duration
    membershipType: "TRIAL",
  });
  const res4 = await handleBootstrapTrial(null, { uid: "tampered-user" }, env, db);
  assert.equal(res4.status, 409);
  assert.equal(res4.body.ok, false);
  assert.equal(res4.body.outcome, "DATA_CONFLICT");
});

test("Google Play Verification & Token Ownership Security", async () => {
  const db = new MockFirestore();
  const env = {};
  const purchaseTokenA = "token-alpha-12345";
  const hashA = await tokenHash(purchaseTokenA);

  // 1. Invalid input: missing purchaseToken
  const resInvalid = await handleGooglePlayVerify(
    { productId: "bhumi_premium_monthly" },
    { uid: "user-alpha" },
    env,
    db
  );
  assert.equal(resInvalid.status, 400);
  assert.equal(resInvalid.body.error, "BODY_INVALID");

  // 2. Product mismatch
  const resMismatch = await handleGooglePlayVerify(
    { purchaseToken: purchaseTokenA, productId: "wrong_product" },
    { uid: "user-alpha" },
    env,
    db
  );
  assert.equal(resMismatch.status, 400);
  assert.equal(resMismatch.body.error, "PRODUCT_MISMATCH");

  // 3. Valid purchase verification for User A
  const resValid = await handleGooglePlayVerify(
    { purchaseToken: purchaseTokenA, productId: "bhumi_premium_monthly" },
    { uid: "user-alpha" },
    env,
    db
  );
  assert.equal(resValid.status, 200);
  assert.equal(resValid.body.ok, true);
  assert.equal(resValid.body.active, true);
  assert.equal(resValid.body.membershipType, "PREMIUM");
  assert.equal(resValid.body.badge, "Penghuni Bhumi");
  assert.ok(resValid.body.signedEntitlement);

  // Verify Firestore state
  const userAlpha = db.docs.get("users/user-alpha");
  assert.equal(userAlpha.isPremium, true);
  assert.equal(userAlpha.membershipType, "PREMIUM");
  assert.equal(userAlpha.activeTokenHash, hashA);

  const tokenDoc = db.docs.get(`billing_purchase_tokens/${hashA}`);
  assert.equal(tokenDoc.uid, "user-alpha");
  assert.equal(tokenDoc.productId, "bhumi_premium_monthly");

  // 4. Token Ownership Conflict: User B attempts to verify User A's purchase token
  const resHijack = await handleGooglePlayVerify(
    { purchaseToken: purchaseTokenA, productId: "bhumi_premium_monthly" },
    { uid: "user-beta" },
    env,
    db
  );
  assert.equal(resHijack.status, 409);
  assert.equal(resHijack.body.error, "TOKEN_OWNERSHIP_CONFLICT");

  // User B remains unaffected and cannot access User A's entitlement
  assert.equal(db.docs.get("users/user-beta"), undefined);
});

test("Stale Older Token Protection (Anti-Downgrade)", async () => {
  const db = new MockFirestore();
  const env = {};
  const currentActiveToken = "current-token-2027";
  const currentHash = await tokenHash(currentActiveToken);

  // Set user with active paid subscription until 2027
  db.docs.set("users/user-alpha", {
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: currentHash,
    accessUntil: "2027-12-31T23:59:59.000Z",
  });

  // Older expired token
  const olderToken = "older-expired-token";
  const olderHash = await tokenHash(olderToken);

  const resOlder = await handleGooglePlayVerify(
    {
      purchaseToken: olderToken,
      productId: "bhumi_premium_monthly",
      _mockPurchase: {
        subscriptionState: "SUBSCRIPTION_STATE_EXPIRED",
        acknowledgementState: "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
        lineItems: [
          {
            productId: "bhumi_premium_monthly",
            expiryTime: "2026-01-01T00:00:00.000Z", // Past
          },
        ],
      },
    },
    { uid: "user-alpha" },
    env,
    db
  );

  assert.equal(resOlder.status, 200);
  assert.equal(resOlder.body.active, false);

  // User profile must NOT be downgraded!
  const userAlpha = db.docs.get("users/user-alpha");
  assert.equal(userAlpha.isPremium, true);
  assert.equal(userAlpha.membershipType, "PREMIUM");
  assert.equal(userAlpha.activeTokenHash, currentHash);
  assert.equal(userAlpha.accessUntil, "2027-12-31T23:59:59.000Z");

  // The older token itself is recorded accurately
  const olderDoc = db.docs.get(`billing_purchase_tokens/${olderHash}`);
  assert.equal(olderDoc.status, "EXPIRED");
});

test("Restore, Badge Refresh & Reconciliation Handlers", async () => {
  const db = new MockFirestore();
  const env = {};

  // 1. Refresh badge for premium user
  db.docs.set("users/user-premium", {
    isPremium: true,
    membershipType: "PREMIUM",
  });
  const resBadge = await handleRefreshBadge(null, { uid: "user-premium" }, env, db);
  assert.equal(resBadge.status, 200);
  assert.equal(resBadge.body.badge, "Penghuni Bhumi");
  assert.equal(resBadge.body.isPremium, true);

  // 2. Restore purchase
  const token = "restore-token-valid";
  const resRestore = await handleGooglePlayRestore(
    { purchaseToken: token, productId: "bhumi_premium_monthly" },
    { uid: "user-restorer" },
    env,
    db
  );
  assert.equal(resRestore.status, 200);
  assert.equal(resRestore.body.active, true);

  // 3. Reconcile
  const resReconcile = await handleReconcile(null, { uid: "user-restorer" }, env, db);
  assert.equal(resReconcile.status, 200);
  assert.equal(resReconcile.body.ok, true);
  assert.equal(resReconcile.body.reconciled, true);
});
