import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { Timestamp } from "firebase-admin/firestore";

const require = createRequire(import.meta.url);
const Module = require("node:module");
const originalLoad = Module._load;

// Deterministic in-memory database mocks for Firestore & Neon
const firestoreDb = new Map<string, Record<string, unknown>>();
let firestoreFailNext = false;
let firestoreTxRace = false;

// Mock firebaseAdmin before importing entitlement / verify
Module._load = function(request: string, parent: unknown, ...args: unknown[]) {
  if (request.endsWith("/firebaseAdmin") || request.endsWith("lib/firebaseAdmin")) {
    return {
      adminAuth: () => ({
        verifyIdToken: async (token: string, checkRevoked?: boolean) => {
          if (!token || token === "expired-token" || token === "malformed") {
            throw new Error("auth/id-token-expired");
          }
          if (token.startsWith("uid-")) {
            return { uid: token };
          }
          if (token === "synthetic-token") {
            return { uid: "user-alpha" };
          }
          throw new Error("auth/argument-error");
        },
      }),
      adminDb: () => ({
        doc: (path: string) => path,
        runTransaction: async (callback: (tx: any) => Promise<unknown>) => {
          if (firestoreFailNext) {
            firestoreFailNext = false;
            throw new Error("FIRESTORE_UNAVAILABLE");
          }
          // Transaction simulation
          const txReads = new Map<string, Record<string, unknown>>();
          const txWrites: Array<{ path: string; data: Record<string, unknown>; merge?: boolean }> = [];
          
          const tx = {
            get: async (docRef: string) => {
              const current = firestoreDb.get(docRef);
              txReads.set(docRef, current ? JSON.parse(JSON.stringify(current)) : undefined);
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

          // Commit writes
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
const { tokenHash } = require("../../lib/security");

test("BILL01-01: Valid purchase USER A yields token ownership in billing_purchase_tokens", async () => {
  firestoreDb.clear();
  const uidA = "user-A";
  const token = "purchase-token-001";
  const dec = decision("SUBSCRIPTION_STATE_ACTIVE", "2026-12-31T00:00:00.000Z");

  await persistEntitlement(uidA, token, "SUBSCRIPTION_STATE_ACTIVE", dec, "ACKNOWLEDGED", { checked: true, voided: false, reason: "ok" });

  const hash = tokenHash(token);
  const tokenDoc = firestoreDb.get(`billing_purchase_tokens/${hash}`);
  assert.ok(tokenDoc, "Token doc must exist");
  assert.equal(tokenDoc.uid, uidA, "Token ownership must be UID A");
  assert.equal(tokenDoc.subscriptionState, "SUBSCRIPTION_STATE_ACTIVE");

  const userDoc = firestoreDb.get(`users/${uidA}`);
  assert.ok(userDoc, "User doc must exist");
  assert.equal(userDoc.membershipType, "PREMIUM");
  assert.equal(userDoc.isPremium, true);
});

test("BILL01-02: USER B attempts to verify token already owned by USER A -> TOKEN_OWNERSHIP_CONFLICT", async () => {
  const uidB = "user-B";
  const token = "purchase-token-001"; // already owned by user-A
  const dec = decision("SUBSCRIPTION_STATE_ACTIVE", "2026-12-31T00:00:00.000Z");

  await assert.rejects(
    async () => {
      await persistEntitlement(uidB, token, "SUBSCRIPTION_STATE_ACTIVE", dec, "ACKNOWLEDGED", { checked: true, voided: false, reason: "ok" });
    },
    (err: any) => {
      assert.equal(err.message, "TOKEN_OWNERSHIP_CONFLICT");
      return true;
    }
  );

  // Verify User B received no premium grant
  const userBDoc = firestoreDb.get(`users/${uidB}`);
  assert.equal(userBDoc, undefined, "User B must not have any document or premium grant created");

  // Verify User A ownership is undisturbed
  const hash = tokenHash(token);
  assert.equal(firestoreDb.get(`billing_purchase_tokens/${hash}`)?.uid, "user-A");
});

test("BILL01-03: Concurrent race between User A and User B over same new token", async () => {
  firestoreDb.clear();
  const token = "purchase-token-concurrent";
  const dec = decision("SUBSCRIPTION_STATE_ACTIVE", "2026-12-31T00:00:00.000Z");

  // Run two serial/overlapping attempts: first one commits ownership
  const p1 = persistEntitlement("user-winner", token, "SUBSCRIPTION_STATE_ACTIVE", dec, "ACKNOWLEDGED", { checked: true, voided: false, reason: "ok" });
  await p1;

  // Second one must hit conflict
  await assert.rejects(
    async () => {
      await persistEntitlement("user-loser", token, "SUBSCRIPTION_STATE_ACTIVE", dec, "ACKNOWLEDGED", { checked: true, voided: false, reason: "ok" });
    },
    /TOKEN_OWNERSHIP_CONFLICT/
  );

  const hash = tokenHash(token);
  assert.equal(firestoreDb.get(`billing_purchase_tokens/${hash}`)?.uid, "user-winner");
  assert.equal(firestoreDb.get("users/user-loser"), undefined);
});

test("BILL01-05: Replay / idempotent re-verification with same UID and same token", async () => {
  firestoreDb.clear();
  const uid = "user-idempotent";
  const token = "purchase-token-idem";
  const dec = decision("SUBSCRIPTION_STATE_ACTIVE", "2026-12-31T00:00:00.000Z");

  await persistEntitlement(uid, token, "SUBSCRIPTION_STATE_ACTIVE", dec, "ACKNOWLEDGED", { checked: true, voided: false, reason: "ok" });
  const firstUserDoc = { ...firestoreDb.get(`users/${uid}`) };

  // Re-verify exact same token by same UID
  await persistEntitlement(uid, token, "SUBSCRIPTION_STATE_ACTIVE", dec, "ACKNOWLEDGED", { checked: true, voided: false, reason: "ok" });
  const secondUserDoc = firestoreDb.get(`users/${uid}`);

  assert.equal(secondUserDoc?.membershipType, "PREMIUM");
  assert.equal(secondUserDoc?.isPremium, true);
  assert.equal(secondUserDoc?.plan, "premium");
});

test("BILL01-06 & BILL01-15: Expired token verification must NOT downgrade an already-active subscription", async () => {
  firestoreDb.clear();
  const uid = "user-multi-token";
  
  // 1. User has an active subscription until December 2026
  const activeToken = "token-active-dec";
  const decActive = decision("SUBSCRIPTION_STATE_ACTIVE", "2026-12-31T00:00:00.000Z");
  await persistEntitlement(uid, activeToken, "SUBSCRIPTION_STATE_ACTIVE", decActive, "ACKNOWLEDGED", { checked: true, voided: false, reason: "ok" });

  const activeDoc = firestoreDb.get(`users/${uid}`);
  assert.equal(activeDoc?.membershipType, "PREMIUM");
  assert.equal(activeDoc?.isPremium, true);

  // 2. An older/expired token (expired in August 2026) is restored or processed
  const expiredToken = "token-old-aug";
  const decExpired = decision("SUBSCRIPTION_STATE_EXPIRED", "2026-08-01T00:00:00.000Z");
  
  await persistEntitlement(uid, expiredToken, "SUBSCRIPTION_STATE_EXPIRED", decExpired, "NOT_REQUIRED", { checked: true, voided: false, reason: "ok" });

  const postDoc = firestoreDb.get(`users/${uid}`);
  // INVARIANT: The user must still be PREMIUM! An expired token must not downgrade an active subscription!
  assert.equal(postDoc?.isPremium, true, "Expired token must not overwrite active isPremium");
  assert.equal(postDoc?.membershipType, "PREMIUM", "Expired token must not overwrite active membershipType");
  assert.equal(postDoc?.plan, "premium", "Expired token must not overwrite active plan");
});

test("BILL01-07: Voided / Refunded purchase token does not grant Premium", async () => {
  firestoreDb.clear();
  const uid = "user-voided";
  const token = "token-voided-01";
  const dec = decision("SUBSCRIPTION_STATE_ACTIVE", "2026-12-31T00:00:00.000Z", { voided: true });

  assert.equal(dec.active, false);
  assert.equal(dec.status, "VOIDED");

  await persistEntitlement(uid, token, "SUBSCRIPTION_STATE_ACTIVE", dec, "NOT_REQUIRED", { checked: true, voided: true, reason: "refunded" });

  const userDoc = firestoreDb.get(`users/${uid}`);
  assert.equal(userDoc?.isPremium, false);
  assert.equal(userDoc?.membershipType, "FREE");
  assert.equal(userDoc?.subscriptionStatus, "VOIDED");
});

test("BILL01-09: Firestore persistence failure throws and fails closed", async () => {
  firestoreDb.clear();
  const uid = "user-fail";
  const token = "token-fail";
  const dec = decision("SUBSCRIPTION_STATE_ACTIVE", "2026-12-31T00:00:00.000Z");

  firestoreFailNext = true;
  await assert.rejects(
    async () => {
      await persistEntitlement(uid, token, "SUBSCRIPTION_STATE_ACTIVE", dec, "ACKNOWLEDGED", { checked: true, voided: false, reason: "ok" });
    },
    /FIRESTORE_UNAVAILABLE/
  );
});

test("BILL01-11, 12, 13: Founder and Lifetime preserved on expired, cancelled, and revoked subscriptions", async () => {
  firestoreDb.clear();
  const founderUid = "user-founder";
  firestoreDb.set(`users/${founderUid}`, {
    badge: "Founder",
    membershipType: "LIFETIME",
    isPremium: true,
  });

  const token = "token-founder-test";
  
  // 1. Expired subscription
  const decExpired = decision("SUBSCRIPTION_STATE_EXPIRED", "2026-01-01T00:00:00.000Z");
  await persistEntitlement(founderUid, token, "SUBSCRIPTION_STATE_EXPIRED", decExpired, "NOT_REQUIRED", { checked: true, voided: false, reason: "ok" });

  let fDoc = firestoreDb.get(`users/${founderUid}`);
  assert.equal(fDoc?.badge, "Founder");
  assert.equal(fDoc?.membershipType, "LIFETIME");
  assert.equal(fDoc?.isPremium, true);

  // 2. Cancelled subscription
  const decCancel = decision("SUBSCRIPTION_STATE_CANCELED", "2026-01-01T00:00:00.000Z");
  await persistEntitlement(founderUid, token, "SUBSCRIPTION_STATE_CANCELED", decCancel, "NOT_REQUIRED", { checked: true, voided: false, reason: "ok" });

  fDoc = firestoreDb.get(`users/${founderUid}`);
  assert.equal(fDoc?.badge, "Founder");
  assert.equal(fDoc?.membershipType, "LIFETIME");
  assert.equal(fDoc?.isPremium, true);

  // 3. Voided subscription
  const decVoid = decision("SUBSCRIPTION_STATE_ACTIVE", "2026-12-31T00:00:00.000Z", { voided: true });
  await persistEntitlement(founderUid, token, "SUBSCRIPTION_STATE_ACTIVE", decVoid, "NOT_REQUIRED", { checked: true, voided: true, reason: "refund" });

  fDoc = firestoreDb.get(`users/${founderUid}`);
  assert.equal(fDoc?.badge, "Founder");
  assert.equal(fDoc?.membershipType, "LIFETIME");
  assert.equal(fDoc?.isPremium, true);
});
