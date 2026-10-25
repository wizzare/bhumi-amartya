import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { tokenHash } from "../../lib/security";

const require = createRequire(import.meta.url);
const Module = require("node:module");
const originalLoad = Module._load;

const firestoreDb = new Map<string, Record<string, unknown>>();
let firestoreQueryFailError: Error | null = null;
let firestoreWriteFailError: Error | null = null;
let orderOfOperations: Array<string> = [];

let txLock: Promise<unknown> = Promise.resolve();

// Mock Firebase Admin with transaction ordering checks and collection query support
Module._load = function (request: string, parent: unknown, ...args: unknown[]) {
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
          // Firestore transactions serialize on document contention (optimistic concurrency / mutex)
          const runTx = async () => {
            const txWrites: Array<{ path: string; data: Record<string, unknown>; merge?: boolean }> = [];
            let hasWritten = false;
            const tx = {
              get: async (refOrQuery: any) => {
                if (hasWritten) {
                  // Strict Firestore transaction rule: all reads must precede all writes!
                  throw new Error("FIRESTORE_READ_AFTER_WRITE_ERROR: Firestore transactions require all reads to execute before any writes.");
                }
                if (typeof refOrQuery === "string") {
                  orderOfOperations.push(`READ_DOC:${refOrQuery}`);
                  const current = firestoreDb.get(refOrQuery);
                  return {
                    exists: Boolean(current),
                    data: () => (current ? JSON.parse(JSON.stringify(current)) : undefined),
                  };
                }
                if (typeof refOrQuery === "object" && refOrQuery._col) {
                  orderOfOperations.push(`READ_QUERY:${refOrQuery._col}`);
                  if (firestoreQueryFailError) {
                    const err = firestoreQueryFailError;
                    firestoreQueryFailError = null;
                    throw err;
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
                hasWritten = true;
                orderOfOperations.push(`WRITE_DOC:${docRef}`);
                if (firestoreWriteFailError) {
                  const err = firestoreWriteFailError;
                  firestoreWriteFailError = null;
                  throw err;
                }
                txWrites.push({ path: docRef, data, merge: options?.merge });
              },
            };
            
            // Execute callback: if it throws, NOTHING in txWrites is committed!
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
          };

          const nextTx = txLock.then(runTx, runTx);
          txLock = nextTx.then(() => {}, () => {});
          return nextTx;
        },
      }),
    };
  }
  return originalLoad.call(this, request, parent, ...args);
};

const { persistEntitlement } = require("../../lib/entitlement");

function resetFirestore() {
  firestoreDb.clear();
  firestoreQueryFailError = null;
  firestoreWriteFailError = null;
  orderOfOperations = [];
}

// =====================================================================
// BF-01 s/d BF-15: FALLBACK SAFETY & TRANSACTION INTEGRITY SUITE
// =====================================================================

test("BF-01: Token A and B active. Refund A. Registry B available and valid -> Premium derived from B", async () => {
  resetFirestore();
  const uid = "user-bf-01";
  const tokenA = "token-bf01-a";
  const tokenB = "token-bf01-b";
  const hashA = tokenHash(tokenA);
  const hashB = tokenHash(tokenB);

  const futureA = new Date(Date.now() + 10 * 24 * 3600 * 1000);
  const futureB = new Date(Date.now() + 25 * 24 * 3600 * 1000);

  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hashA,
    accessUntil: futureA.toISOString(),
  });
  firestoreDb.set(`billing_purchase_tokens/${hashA}`, {
    uid,
    tokenHash: hashA,
    entitlementStatus: "ACTIVE",
    accessUntil: futureA.toISOString(),
    lastVerifiedAt: new Date().toISOString(),
  });
  firestoreDb.set(`billing_purchase_tokens/${hashB}`, {
    uid,
    tokenHash: hashB,
    entitlementStatus: "ACTIVE",
    accessUntil: futureB.toISOString(),
    lastVerifiedAt: new Date().toISOString(),
  });

  await persistEntitlement(
    uid,
    tokenA,
    "SUBSCRIPTION_STATE_CANCELED",
    { active: false, status: "VOIDED", date: null },
    "NOT_REQUIRED",
    { checked: true, voided: true, reason: "REFUND" }
  );

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, true, "BF-01: User remains Premium via fallback to Token B");
  assert.equal(user.activeTokenHash, hashB, "BF-01: activeTokenHash switched to Token B");
  assert.equal(user.accessUntil, futureB.toISOString(), "BF-01: accessUntil updated to Token B expiry");
});

test("BF-02: Token A and B active. Refund A. Query registry fails -> Transaction aborts, no silent downgrade", async () => {
  resetFirestore();
  const uid = "user-bf-02";
  const tokenA = "token-bf02-a";
  const tokenB = "token-bf02-b";
  const hashA = tokenHash(tokenA);
  const hashB = tokenHash(tokenB);

  const futureA = new Date(Date.now() + 10 * 24 * 3600 * 1000);
  const futureB = new Date(Date.now() + 25 * 24 * 3600 * 1000);

  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hashA,
    accessUntil: futureA.toISOString(),
  });
  firestoreDb.set(`billing_purchase_tokens/${hashB}`, {
    uid,
    tokenHash: hashB,
    entitlementStatus: "ACTIVE",
    accessUntil: futureB.toISOString(),
    lastVerifiedAt: new Date().toISOString(),
  });

  // Inject query failure
  firestoreQueryFailError = new Error("FIRESTORE_QUERY_READ_FAILED");

  // Invariant: The query failure must NOT be swallowed. Transaction must reject with retryable error.
  await assert.rejects(
    async () => {
      await persistEntitlement(
        uid,
        tokenA,
        "SUBSCRIPTION_STATE_CANCELED",
        { active: false, status: "VOIDED", date: null },
        "NOT_REQUIRED",
        { checked: true, voided: true, reason: "REFUND" }
      );
    },
    /FIRESTORE_QUERY_READ_FAILED/,
    "BF-02: persistEntitlement must rethrow query failure so caller can retry"
  );

  // Invariant: Because transaction aborted, users/{uid} MUST NOT have been downgraded to FREE!
  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, true, "BF-02: User MUST NOT be downgraded to FREE on transient read error");
  assert.equal(user.membershipType, "PREMIUM", "BF-02: membershipType preserved");
  assert.equal(user.activeTokenHash, hashA, "BF-02: activeTokenHash untouched due to abort");
});

test("BF-03: Token A and B active. Refund A. Query registry timeout -> Aborts cleanly with retryable error", async () => {
  resetFirestore();
  const uid = "user-bf-03";
  const tokenA = "token-bf03-a";
  const hashA = tokenHash(tokenA);

  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hashA,
    accessUntil: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
  });

  firestoreQueryFailError = new Error("FIRESTORE_QUERY_TIMEOUT");

  await assert.rejects(
    async () => {
      await persistEntitlement(
        uid,
        tokenA,
        "SUBSCRIPTION_STATE_CANCELED",
        { active: false, status: "VOIDED", date: null },
        "NOT_REQUIRED",
        { checked: true, voided: true, reason: "REFUND" }
      );
    },
    /FIRESTORE_QUERY_TIMEOUT/,
    "BF-03: Timeout must bubble up as a retryable error"
  );

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, true, "BF-03: No downgrade committed on timeout");
});

test("BF-04: Refund A. Query succeeds but no alternative active token exists -> Clean downgrade to FREE", async () => {
  resetFirestore();
  const uid = "user-bf-04";
  const tokenA = "token-bf04-a";
  const hashA = tokenHash(tokenA);

  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hashA,
    accessUntil: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
  });

  await persistEntitlement(
    uid,
    tokenA,
    "SUBSCRIPTION_STATE_CANCELED",
    { active: false, status: "VOIDED", date: null },
    "NOT_REQUIRED",
    { checked: true, voided: true, reason: "REFUND" }
  );

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, false, "BF-04: User cleanly downgraded when no alternative active tokens exist");
  assert.equal(user.membershipType, "FREE");
  assert.equal(user.activeTokenHash, null);
});

test("BF-05: Refund A. Registry B has ACTIVE status but expiry is past -> B rejected, downgrades to FREE", async () => {
  resetFirestore();
  const uid = "user-bf-05";
  const tokenA = "token-bf05-a";
  const tokenB = "token-bf05-b";
  const hashA = tokenHash(tokenA);
  const hashB = tokenHash(tokenB);

  const pastB = new Date(Date.now() - 5 * 24 * 3600 * 1000); // Expired 5 days ago

  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hashA,
    accessUntil: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
  });
  firestoreDb.set(`billing_purchase_tokens/${hashB}`, {
    uid,
    tokenHash: hashB,
    entitlementStatus: "ACTIVE", // Stale status
    accessUntil: pastB.toISOString(), // Expired date
    lastVerifiedAt: pastB.toISOString(),
  });

  await persistEntitlement(
    uid,
    tokenA,
    "SUBSCRIPTION_STATE_CANCELED",
    { active: false, status: "VOIDED", date: null },
    "NOT_REQUIRED",
    { checked: true, voided: true, reason: "REFUND" }
  );

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, false, "BF-05: Expired token in registry must NOT grant Premium");
  assert.equal(user.membershipType, "FREE");
});

test("BF-06: Refund A. Registry B has VOIDED status -> B rejected, downgrades to FREE", async () => {
  resetFirestore();
  const uid = "user-bf-06";
  const tokenA = "token-bf06-a";
  const tokenB = "token-bf06-b";
  const hashA = tokenHash(tokenA);
  const hashB = tokenHash(tokenB);

  const futureB = new Date(Date.now() + 15 * 24 * 3600 * 1000);

  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hashA,
  });
  firestoreDb.set(`billing_purchase_tokens/${hashB}`, {
    uid,
    tokenHash: hashB,
    entitlementStatus: "VOIDED",
    voidedCheck: { checked: true, voided: true, reason: "PREVIOUS_REFUND" },
    accessUntil: futureB.toISOString(),
    lastVerifiedAt: new Date().toISOString(),
  });

  await persistEntitlement(
    uid,
    tokenA,
    "SUBSCRIPTION_STATE_CANCELED",
    { active: false, status: "VOIDED", date: null },
    "NOT_REQUIRED",
    { checked: true, voided: true, reason: "REFUND" }
  );

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, false, "BF-06: Voided token must NOT grant Premium");
  assert.equal(user.membershipType, "FREE");
});

test("BF-07: Refund A. Registry B has future expiry but lastVerifiedAt is malformed or exceeds max staleness -> rejected", async () => {
  resetFirestore();
  const uid = "user-bf-07";
  const tokenA = "token-bf07-a";
  const tokenB = "token-bf07-b";
  const hashA = tokenHash(tokenA);
  const hashB = tokenHash(tokenB);

  const futureB = new Date(Date.now() + 20 * 24 * 3600 * 1000);

  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hashA,
  });
  // Token B has malformed lastVerifiedAt
  firestoreDb.set(`billing_purchase_tokens/${hashB}`, {
    uid,
    tokenHash: hashB,
    entitlementStatus: "ACTIVE",
    accessUntil: futureB.toISOString(),
    lastVerifiedAt: "MALFORMED_TIMESTAMP_NOT_A_DATE",
  });

  await persistEntitlement(
    uid,
    tokenA,
    "SUBSCRIPTION_STATE_CANCELED",
    { active: false, status: "VOIDED", date: null },
    "NOT_REQUIRED",
    { checked: true, voided: true, reason: "REFUND" }
  );

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, false, "BF-07: Token with malformed verification timestamp rejected");
});

test("BF-08: Refund A. Registry B has status valid with malformed accessUntil -> B rejected as candidate", async () => {
  resetFirestore();
  const uid = "user-bf-08";
  const tokenA = "token-bf08-a";
  const tokenB = "token-bf08-b";
  const hashA = tokenHash(tokenA);
  const hashB = tokenHash(tokenB);

  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hashA,
  });
  firestoreDb.set(`billing_purchase_tokens/${hashB}`, {
    uid,
    tokenHash: hashB,
    entitlementStatus: "ACTIVE",
    accessUntil: "INVALID_DATE_STRING_XYZ",
    lastVerifiedAt: new Date().toISOString(),
  });

  await persistEntitlement(
    uid,
    tokenA,
    "SUBSCRIPTION_STATE_CANCELED",
    { active: false, status: "VOIDED", date: null },
    "NOT_REQUIRED",
    { checked: true, voided: true, reason: "REFUND" }
  );

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, false, "BF-08: Token with malformed accessUntil rejected");
});

test("BF-09: Refund A concurrent with update of Token B from ACTIVE to VOIDED -> consistent state", async () => {
  resetFirestore();
  const uid = "user-bf-09";
  const tokenA = "token-bf09-a";
  const tokenB = "token-bf09-b";
  const hashA = tokenHash(tokenA);
  const hashB = tokenHash(tokenB);

  const future = new Date(Date.now() + 15 * 24 * 3600 * 1000);

  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hashA,
    accessUntil: future.toISOString(),
  });

  // Step 1: Token B is voided first
  await persistEntitlement(
    uid,
    tokenB,
    "SUBSCRIPTION_STATE_CANCELED",
    { active: false, status: "VOIDED", date: null },
    "NOT_REQUIRED",
    { checked: true, voided: true, reason: "REFUND" }
  );

  // Step 2: Now Token A is refunded. Token B in registry is VOIDED.
  await persistEntitlement(
    uid,
    tokenA,
    "SUBSCRIPTION_STATE_CANCELED",
    { active: false, status: "VOIDED", date: null },
    "NOT_REQUIRED",
    { checked: true, voided: true, reason: "REFUND" }
  );

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, false, "BF-09: Once both tokens are voided, user becomes FREE");
  assert.equal(user.activeTokenHash, null);
});

test("BF-10: Concurrent refund requests for different tokens of same UID -> atomic transaction prevents race", async () => {
  resetFirestore();
  const uid = "user-bf-10";
  const token1 = "token-bf10-1";
  const token2 = "token-bf10-2";
  const hash1 = tokenHash(token1);
  const hash2 = tokenHash(token2);

  const future = new Date(Date.now() + 20 * 24 * 3600 * 1000);

  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hash1,
    accessUntil: future.toISOString(),
  });
  firestoreDb.set(`billing_purchase_tokens/${hash1}`, {
    uid,
    tokenHash: hash1,
    entitlementStatus: "ACTIVE",
    accessUntil: future.toISOString(),
  });
  firestoreDb.set(`billing_purchase_tokens/${hash2}`, {
    uid,
    tokenHash: hash2,
    entitlementStatus: "ACTIVE",
    accessUntil: future.toISOString(),
  });

  // Execute two concurrent refunds
  const [p1, p2] = await Promise.allSettled([
    persistEntitlement(uid, token1, "SUBSCRIPTION_STATE_CANCELED", { active: false, status: "VOIDED", date: null }, "NOT_REQUIRED", { checked: true, voided: true, reason: "REFUND" }),
    persistEntitlement(uid, token2, "SUBSCRIPTION_STATE_CANCELED", { active: false, status: "VOIDED", date: null }, "NOT_REQUIRED", { checked: true, voided: true, reason: "REFUND" }),
  ]);

  assert.equal(p1.status, "fulfilled", "BF-10: First refund executed");
  assert.equal(p2.status, "fulfilled", "BF-10: Second refund executed");

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, false, "BF-10: All tokens voided leaves user cleanly FREE");
  assert.equal(user.activeTokenHash, null);
});

test("BF-11: Query registry succeeds but write canonical fails -> entire transaction rolls back", async () => {
  resetFirestore();
  const uid = "user-bf-11";
  const tokenA = "token-bf11-a";
  const tokenB = "token-bf11-b";
  const hashA = tokenHash(tokenA);
  const hashB = tokenHash(tokenB);

  const futureB = new Date(Date.now() + 20 * 24 * 3600 * 1000);

  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hashA,
  });
  firestoreDb.set(`billing_purchase_tokens/${hashB}`, {
    uid,
    tokenHash: hashB,
    entitlementStatus: "ACTIVE",
    accessUntil: futureB.toISOString(),
  });

  // Inject failure on write
  firestoreWriteFailError = new Error("CANONICAL_WRITE_FAILED");

  await assert.rejects(
    async () => {
      await persistEntitlement(
        uid,
        tokenA,
        "SUBSCRIPTION_STATE_CANCELED",
        { active: false, status: "VOIDED", date: null },
        "NOT_REQUIRED",
        { checked: true, voided: true, reason: "REFUND" }
      );
    },
    /CANONICAL_WRITE_FAILED/,
    "BF-11: Write failure must abort transaction and bubble up"
  );

  const user = firestoreDb.get(`users/${uid}`) as any;
  // User doc must not be half-written
  assert.equal(user.activeTokenHash, hashA, "BF-11: User doc remains intact without partial write");
});

test("BF-12: Retry after query failure succeeds once registry is available", async () => {
  resetFirestore();
  const uid = "user-bf-12";
  const tokenA = "token-bf12-a";
  const tokenB = "token-bf12-b";
  const hashA = tokenHash(tokenA);
  const hashB = tokenHash(tokenB);

  const futureB = new Date(Date.now() + 20 * 24 * 3600 * 1000);

  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hashA,
  });
  firestoreDb.set(`billing_purchase_tokens/${hashB}`, {
    uid,
    tokenHash: hashB,
    entitlementStatus: "ACTIVE",
    accessUntil: futureB.toISOString(),
  });

  // First attempt fails
  firestoreQueryFailError = new Error("NETWORK_BLIP");
  await assert.rejects(
    async () => {
      await persistEntitlement(
        uid,
        tokenA,
        "SUBSCRIPTION_STATE_CANCELED",
        { active: false, status: "VOIDED", date: null },
        "NOT_REQUIRED",
        { checked: true, voided: true, reason: "REFUND" }
      );
    },
    /NETWORK_BLIP/
  );

  // Second attempt: network recovered, query succeeds
  await persistEntitlement(
    uid,
    tokenA,
    "SUBSCRIPTION_STATE_CANCELED",
    { active: false, status: "VOIDED", date: null },
    "NOT_REQUIRED",
    { checked: true, voided: true, reason: "REFUND" }
  );

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, true, "BF-12: Idempotent retry successfully recovered fallback to Token B");
  assert.equal(user.activeTokenHash, hashB);
});

test("BF-13: Legacy account without activeTokenHash -> evaluates registry safely without false assignment", async () => {
  resetFirestore();
  const uid = "user-bf-13";
  const tokenA = "token-bf13-a";
  const tokenB = "token-bf13-b";
  const hashB = tokenHash(tokenB);

  const futureB = new Date(Date.now() + 30 * 24 * 3600 * 1000);

  // Legacy user has no activeTokenHash
  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
  });
  firestoreDb.set(`billing_purchase_tokens/${hashB}`, {
    uid,
    tokenHash: hashB,
    entitlementStatus: "ACTIVE",
    accessUntil: futureB.toISOString(),
  });

  await persistEntitlement(
    uid,
    tokenA,
    "SUBSCRIPTION_STATE_CANCELED",
    { active: false, status: "VOIDED", date: null },
    "NOT_REQUIRED",
    { checked: true, voided: true, reason: "REFUND" }
  );

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, true, "BF-13: Adopts valid alternative Token B");
  assert.equal(user.activeTokenHash, hashB);
});

test("BF-14: Founder/Lifetime and Tester Grant preserved during fallback failure or revocation", async () => {
  resetFirestore();
  const uidFounder = "user-founder";
  const uidLifetime = "user-lifetime";
  const uidTester = "user-tester";
  const tokenFounder = "token-bf14-founder";
  const tokenLifetime = "token-bf14-lifetime";
  const tokenTester = "token-bf14-tester";

  // Case A: Founder
  firestoreDb.set(`users/${uidFounder}`, {
    uid: uidFounder,
    isPremium: true,
    membershipType: "PREMIUM",
    badge: "Founder",
  });
  await persistEntitlement(
    uidFounder,
    tokenFounder,
    "SUBSCRIPTION_STATE_CANCELED",
    { active: false, status: "VOIDED", date: null },
    "NOT_REQUIRED",
    { checked: true, voided: true, reason: "REFUND" }
  );
  const founderDoc = firestoreDb.get(`users/${uidFounder}`) as any;
  assert.equal(founderDoc.isPremium, true, "BF-14: Founder never downgraded");

  // Case B: Lifetime
  firestoreDb.set(`users/${uidLifetime}`, {
    uid: uidLifetime,
    isPremium: true,
    membershipType: "LIFETIME",
  });
  await persistEntitlement(
    uidLifetime,
    tokenLifetime,
    "SUBSCRIPTION_STATE_CANCELED",
    { active: false, status: "VOIDED", date: null },
    "NOT_REQUIRED",
    { checked: true, voided: true, reason: "REFUND" }
  );
  const lifetimeDoc = firestoreDb.get(`users/${uidLifetime}`) as any;
  assert.equal(lifetimeDoc.isPremium, true, "BF-14: Lifetime never downgraded");

  // Case C: Tester Grant (Penjaga Bhumi Inti)
  firestoreDb.set(`users/${uidTester}`, {
    uid: uidTester,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: tokenHash(tokenTester),
    badge: "Penjaga Bhumi Inti",
    testerBadge: "Penjaga Bhumi Inti",
  });
  await persistEntitlement(
    uidTester,
    tokenTester,
    "SUBSCRIPTION_STATE_CANCELED",
    { active: false, status: "VOIDED", date: null },
    "NOT_REQUIRED",
    { checked: true, voided: true, reason: "REFUND" }
  );
  const testerDoc = firestoreDb.get(`users/${uidTester}`) as any;
  assert.equal(testerDoc.badge, "Penjaga Bhumi Inti", "BF-14: Tester badge preserved");
  assert.equal(testerDoc.testerBadge, "Penjaga Bhumi Inti", "BF-14: testerBadge preserved");
});

test("BF-15: User does not open app after refund A -> server doc users/{uid} remains active via B", async () => {
  resetFirestore();
  const uid = "user-bf-15";
  const tokenA = "token-bf15-a";
  const tokenB = "token-bf15-b";
  const hashA = tokenHash(tokenA);
  const hashB = tokenHash(tokenB);

  const futureB = new Date(Date.now() + 40 * 24 * 3600 * 1000);

  // App is closed. Server receives Google Play Pub/Sub RTDN voided event for tokenA
  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hashA,
  });
  firestoreDb.set(`billing_purchase_tokens/${hashB}`, {
    uid,
    tokenHash: hashB,
    entitlementStatus: "ACTIVE",
    accessUntil: futureB.toISOString(),
  });

  await persistEntitlement(
    uid,
    tokenA,
    "SUBSCRIPTION_STATE_CANCELED",
    { active: false, status: "VOIDED", date: null },
    "NOT_REQUIRED",
    { checked: true, voided: true, reason: "REFUND" }
  );

  // Server state immediately reflects Token B without client needing to open app
  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, true, "BF-15: Server state converged without client interaction");
  assert.equal(user.activeTokenHash, hashB);
  assert.equal(user.membershipType, "PREMIUM");
});
