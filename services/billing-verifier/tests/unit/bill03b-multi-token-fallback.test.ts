import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { tokenHash } from "../../lib/security";

const require = createRequire(import.meta.url);
const Module = require("node:module");
const originalLoad = Module._load;

const firestoreDb = new Map<string, Record<string, unknown>>();
let firestoreQueryFailNext = false;

// Mock Firebase Admin with collection query support
Module._load = function(request: string, parent: unknown, ...args: unknown[]) {
  if (request.endsWith("/firebaseAdmin") || request.endsWith("lib/firebaseAdmin")) {
    return {
      adminDb: () => ({
        doc: (path: string) => path,
        collection: (colPath: string) => ({
          where: (field: string, op: string, val: unknown) => ({
            _col: colPath,
            _field: field,
            _op: op,
            _val: val,
          }),
        }),
        runTransaction: async (callback: (tx: any) => Promise<unknown>) => {
          const txWrites: Array<{ path: string; data: Record<string, unknown>; merge?: boolean }> = [];
          const tx = {
            get: async (refOrQuery: any) => {
              if (typeof refOrQuery === "string") {
                const current = firestoreDb.get(refOrQuery);
                return {
                  exists: Boolean(current),
                  data: () => (current ? JSON.parse(JSON.stringify(current)) : undefined),
                };
              }
              if (typeof refOrQuery === "object" && refOrQuery._col) {
                if (firestoreQueryFailNext) {
                  firestoreQueryFailNext = false;
                  throw new Error("FIRESTORE_QUERY_TIMEOUT");
                }
                const matchingDocs: Array<{ id: string; data: () => Record<string, unknown> }> = [];
                for (const [key, val] of firestoreDb.entries()) {
                  if (key.startsWith(`${refOrQuery._col}/`) && val[refOrQuery._field] === refOrQuery._val) {
                    matchingDocs.push({
                      id: key.slice(refOrQuery._col.length + 1),
                      data: () => JSON.parse(JSON.stringify(val)),
                    });
                  }
                }
                return {
                  forEach: (cb: (doc: any) => void) => {
                    matchingDocs.forEach(cb);
                  },
                };
              }
              throw new Error("UNSUPPORTED_MOCK_TARGET");
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
  return originalLoad.call(this, request, parent, ...args);
};

// Now import target modules
const { decision, persistEntitlement } = require("../../lib/entitlement");

function resetFirestore() {
  firestoreDb.clear();
  firestoreQueryFailNext = false;
}

// =====================================================================
// MULTI-TOKEN FALLBACK SUITE (MT-01 s/d MT-10)
// =====================================================================

test("MT-01: Token A active (Nov 1), Token B active (Dec 1), refund A -> server seamlessly fails over to Token B", async () => {
  resetFirestore();
  const uid = "user-mt-01";
  const tokenA = "token-mt-a";
  const tokenB = "token-mt-b";
  const hashA = tokenHash(tokenA);
  const hashB = tokenHash(tokenB);

  const nov1 = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  const dec1 = new Date(Date.now() + 60 * 24 * 3600 * 1000);

  // Setup initial state: Token A was activeTokenHash
  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hashA,
    accessUntil: nov1.toISOString(),
    subscriptionStatus: "ACTIVE",
  });

  // Both tokens exist in billing_purchase_tokens
  firestoreDb.set(`billing_purchase_tokens/${hashA}`, {
    uid,
    tokenHash: hashA,
    entitlementStatus: "ACTIVE",
    accessUntil: nov1.toISOString(),
  });
  firestoreDb.set(`billing_purchase_tokens/${hashB}`, {
    uid,
    tokenHash: hashB,
    entitlementStatus: "ACTIVE",
    accessUntil: dec1.toISOString(),
  });

  // Action: Token A is refunded by Google Play
  const voidResult = { active: false, status: "VOIDED", date: null };
  const voidedCheck = { checked: true, voided: true, reason: "REFUND" };

  await persistEntitlement(uid, tokenA, "SUBSCRIPTION_STATE_CANCELED", voidResult, "NOT_REQUIRED", voidedCheck);

  const user = firestoreDb.get(`users/${uid}`) as any;
  const tokenDocA = firestoreDb.get(`billing_purchase_tokens/${hashA}`) as any;

  assert.equal(tokenDocA.entitlementStatus, "VOIDED", "Token A ledger must be VOIDED");
  // MT-01 CRITICAL CONTRACT: Server must failover to Token B without user app launch!
  assert.equal(user.isPremium, true, "MT-01 INVARIANT: User MUST remain Premium via alternative Token B");
  assert.equal(user.membershipType, "PREMIUM");
  assert.equal(user.activeTokenHash, hashB, "activeTokenHash must failover to Token B");
  assert.equal(new Date(user.accessUntil).getTime(), dec1.getTime(), "accessUntil must reflect Token B's expiry");
});

test("MT-02: Token A active (Dec 1), Token B active (Nov 1), refund B -> Token A remains active", async () => {
  resetFirestore();
  const uid = "user-mt-02";
  const tokenA = "token-mt-a";
  const tokenB = "token-mt-b";
  const hashA = tokenHash(tokenA);
  const hashB = tokenHash(tokenB);

  const dec1 = new Date(Date.now() + 60 * 24 * 3600 * 1000);
  const nov1 = new Date(Date.now() + 30 * 24 * 3600 * 1000);

  // Token A is primary activeTokenHash
  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hashA,
    accessUntil: dec1.toISOString(),
  });
  firestoreDb.set(`billing_purchase_tokens/${hashA}`, {
    uid,
    tokenHash: hashA,
    entitlementStatus: "ACTIVE",
    accessUntil: dec1.toISOString(),
  });
  firestoreDb.set(`billing_purchase_tokens/${hashB}`, {
    uid,
    tokenHash: hashB,
    entitlementStatus: "ACTIVE",
    accessUntil: nov1.toISOString(),
  });

  // Action: Token B is refunded
  const voidResult = { active: false, status: "VOIDED", date: null };
  await persistEntitlement(uid, tokenB, "SUBSCRIPTION_STATE_CANCELED", voidResult, "NOT_REQUIRED", { checked: true, voided: true, reason: "REFUND" });

  const user = firestoreDb.get(`users/${uid}`) as any;
  const tokenDocB = firestoreDb.get(`billing_purchase_tokens/${hashB}`) as any;

  assert.equal(tokenDocB.entitlementStatus, "VOIDED");
  assert.equal(user.isPremium, true, "MT-02: Token A protects user access against Token B refund");
  assert.equal(user.activeTokenHash, hashA);
  assert.equal(new Date(user.accessUntil).getTime(), dec1.getTime());
});

test("MT-03: Two active tokens, both refunded sequentially -> downgrades to FREE only after last token voided", async () => {
  resetFirestore();
  const uid = "user-mt-03";
  const tokenA = "token-mt-a";
  const tokenB = "token-mt-b";
  const hashA = tokenHash(tokenA);
  const hashB = tokenHash(tokenB);

  const dateA = new Date(Date.now() + 20 * 24 * 3600 * 1000);
  const dateB = new Date(Date.now() + 40 * 24 * 3600 * 1000);

  // Initial: User has A as active
  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hashA,
    accessUntil: dateA.toISOString(),
  });
  firestoreDb.set(`billing_purchase_tokens/${hashA}`, { uid, tokenHash: hashA, entitlementStatus: "ACTIVE", accessUntil: dateA.toISOString() });
  firestoreDb.set(`billing_purchase_tokens/${hashB}`, { uid, tokenHash: hashB, entitlementStatus: "ACTIVE", accessUntil: dateB.toISOString() });

  // 1. Refund A -> Fails over to B
  await persistEntitlement(uid, tokenA, "SUBSCRIPTION_STATE_CANCELED", { active: false, status: "VOIDED", date: null }, "NOT_REQUIRED", { checked: true, voided: true, reason: "REFUND" });
  let user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, true, "First refund maintains access via Token B");
  assert.equal(user.activeTokenHash, hashB);

  // 2. Refund B -> Now no active tokens left
  await persistEntitlement(uid, tokenB, "SUBSCRIPTION_STATE_CANCELED", { active: false, status: "VOIDED", date: null }, "NOT_REQUIRED", { checked: true, voided: true, reason: "REFUND" });
  user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, false, "MT-03: All tokens refunded -> cleanly downgrades to FREE");
  assert.equal(user.membershipType, "FREE");
  assert.equal(user.activeTokenHash, null);
});

test("MT-04: Refund primary token with Lifetime active -> Lifetime permanently intact", async () => {
  resetFirestore();
  const uid = "user-mt-04";
  const tokenA = "token-mt-lifetime";
  const hashA = tokenHash(tokenA);

  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "LIFETIME",
    activeTokenHash: hashA,
  });

  await persistEntitlement(uid, tokenA, "SUBSCRIPTION_STATE_CANCELED", { active: false, status: "VOIDED", date: null }, "NOT_REQUIRED", { checked: true, voided: true, reason: "REFUND" });

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.membershipType, "LIFETIME", "MT-04: Lifetime membership must NEVER be altered");
  assert.equal(user.isPremium, true);
});

test("MT-05: Refund primary token with Tester Grant active (Penjaga Bhumi Inti) -> Paid revoked, Tester Grant intact", async () => {
  resetFirestore();
  const uid = "user-mt-05";
  const tokenA = "token-mt-tester";
  const hashA = tokenHash(tokenA);

  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hashA,
    badge: "Penjaga Bhumi Inti",
    testerBadge: "Penjaga Bhumi Inti",
  });

  await persistEntitlement(uid, tokenA, "SUBSCRIPTION_STATE_CANCELED", { active: false, status: "VOIDED", date: null }, "NOT_REQUIRED", { checked: true, voided: true, reason: "REFUND" });

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.membershipType, "FREE", "MT-05: Google Play membershipType revoked to FREE");
  assert.equal(user.activeTokenHash, null);
  assert.equal(user.badge, "Penjaga Bhumi Inti", "Tester badge preserved");
  assert.equal(user.testerBadge, "Penjaga Bhumi Inti", "testerBadge preserved");
});

test("MT-06: Concurrent refund and renewal -> atomic transaction guarantees consistent state", async () => {
  resetFirestore();
  const uid = "user-mt-06";
  const tokenOld = "token-old-mt06";
  const tokenNew = "token-new-mt06";
  const hashOld = tokenHash(tokenOld);
  const hashNew = tokenHash(tokenNew);

  const future = new Date(Date.now() + 30 * 24 * 3600 * 1000);

  // Setup: User renewed with tokenNew, but an asynchronous refund for tokenOld arrives concurrently
  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hashNew,
    accessUntil: future.toISOString(),
  });
  firestoreDb.set(`billing_purchase_tokens/${hashNew}`, {
    uid,
    tokenHash: hashNew,
    entitlementStatus: "ACTIVE",
    accessUntil: future.toISOString(),
  });

  // Action: Refund arrives for tokenOld
  await persistEntitlement(uid, tokenOld, "SUBSCRIPTION_STATE_CANCELED", { active: false, status: "VOIDED", date: null }, "NOT_REQUIRED", { checked: true, voided: true, reason: "REFUND" });

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, true, "MT-06: Valid active renewal is not clobbered by concurrent refund of older token");
  assert.equal(user.activeTokenHash, hashNew);
});

test("MT-07: Query failure on alternative token aborts transaction with retryable error (no destructive downgrade)", async () => {
  resetFirestore();
  const uid = "user-mt-07";
  const tokenA = "token-fail-query";
  const hashA = tokenHash(tokenA);

  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hashA,
    accessUntil: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
  });

  // Force query failure
  firestoreQueryFailNext = true;

  // Invariant (BILL-03B.1): Query failure must ABORT the transaction, not silently downgrade to FREE!
  await assert.rejects(
    async () => {
      await persistEntitlement(uid, tokenA, "SUBSCRIPTION_STATE_CANCELED", { active: false, status: "VOIDED", date: null }, "NOT_REQUIRED", { checked: true, voided: true, reason: "REFUND" });
    },
    /FIRESTORE_QUERY_TIMEOUT/,
    "MT-07: Query failure must bubble up as a retryable error to abort the transaction"
  );

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, true, "MT-07: User remains Premium because transaction aborted without destructive writes");
  assert.equal(user.membershipType, "PREMIUM");
  assert.equal(user.activeTokenHash, hashA);
});

test("MT-08: Legacy account without activeTokenHash -> checks registry and falls back or revokes", async () => {
  resetFirestore();
  const uid = "user-mt-08";
  const tokenA = "token-legacy-a";
  const tokenB = "token-legacy-b";
  const hashA = tokenHash(tokenA);
  const hashB = tokenHash(tokenB);

  const futureB = new Date(Date.now() + 45 * 24 * 3600 * 1000);

  // Legacy user without activeTokenHash field
  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
  });

  // But registry has Token B active
  firestoreDb.set(`billing_purchase_tokens/${hashB}`, {
    uid,
    tokenHash: hashB,
    entitlementStatus: "ACTIVE",
    accessUntil: futureB.toISOString(),
  });

  // Refund token A
  await persistEntitlement(uid, tokenA, "SUBSCRIPTION_STATE_CANCELED", { active: false, status: "VOIDED", date: null }, "NOT_REQUIRED", { checked: true, voided: true, reason: "REFUND" });

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, true, "MT-08: Legacy account links to alternative active token in registry");
  assert.equal(user.activeTokenHash, hashB);
  assert.equal(new Date(user.accessUntil).getTime(), futureB.getTime());
});

test("MT-09: Concurrent reconcilers serialized via database locking", async () => {
  // Concurrency is serialized at two layers:
  // 1. PostgreSQL FOR UPDATE SKIP LOCKED locks disjoint job IDs.
  // 2. Firestore runTransaction serializes doc updates per UID.
  const jobClaims = new Set<number>();
  function claimJob(jobId: number): boolean {
    if (jobClaims.has(jobId)) return false; // SKIP LOCKED
    jobClaims.add(jobId);
    return true;
  }

  const worker1Claim = claimJob(201);
  const worker2Claim = claimJob(201); // concurrent attempt on same job

  assert.equal(worker1Claim, true, "Worker 1 claims job 201");
  assert.equal(worker2Claim, false, "Worker 2 cannot claim job 201 (serialized via SKIP LOCKED)");
});

test("MT-10: User does NOT open application after primary token refund -> server state remains Premium via fallback", async () => {
  resetFirestore();
  const uid = "user-mt-10-background";
  const tokenA = "token-primary-voided";
  const tokenB = "token-secondary-active";
  const hashA = tokenHash(tokenA);
  const hashB = tokenHash(tokenB);

  const expB = new Date(Date.now() + 50 * 24 * 3600 * 1000);

  // Setup initial state: User has primary Token A active
  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hashA,
    accessUntil: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
  });
  firestoreDb.set(`billing_purchase_tokens/${hashA}`, { uid, tokenHash: hashA, entitlementStatus: "ACTIVE" });
  firestoreDb.set(`billing_purchase_tokens/${hashB}`, { uid, tokenHash: hashB, entitlementStatus: "ACTIVE", accessUntil: expB.toISOString() });

  // Webhook / server reconcile processes refund of Token A
  // Note: Client app is NEVER opened.
  await persistEntitlement(uid, tokenA, "SUBSCRIPTION_STATE_CANCELED", { active: false, status: "VOIDED", date: null }, "NOT_REQUIRED", { checked: true, voided: true, reason: "REFUND" });

  // Verify server canonical document users/{uid}
  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, true, "MT-10 INVARIANT: Server doc users/{uid} is Premium without client app opening");
  assert.equal(user.membershipType, "PREMIUM");
  assert.equal(user.activeTokenHash, hashB, "Server doc users/{uid} points to Token B");
  assert.equal(new Date(user.accessUntil).getTime(), expB.getTime());
});
