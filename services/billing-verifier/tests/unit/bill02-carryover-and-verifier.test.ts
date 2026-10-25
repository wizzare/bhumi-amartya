import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Module = require("node:module");
const originalLoad = Module._load;

const firestoreDb = new Map<string, Record<string, unknown>>();

Module._load = function(request: string, parent: unknown, ...args: unknown[]) {
  if (request.endsWith("/firebaseAdmin") || request.endsWith("lib/firebaseAdmin")) {
    return {
      adminAuth: () => ({
        verifyIdToken: async (token: string) => {
          if (!token || token.includes("malformed") || token.includes("expired")) {
            throw new Error("auth/id-token-expired");
          }
          return { uid: token.startsWith("uid-") ? token : "user-carryover" };
        },
      }),
      adminDb: () => ({
        doc: (path: string) => path,
        runTransaction: async (callback: (tx: any) => Promise<unknown>) => {
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
  return originalLoad.call(this, request, parent, ...args);
};

const { decision, persistEntitlement } = require("../../lib/entitlement");
const { tokenHash } = require("../../lib/security");

test("BILL-02 Carryover 1: Token A active, Token B expired -> Active subscription intact", async () => {
  firestoreDb.clear();
  const uid = "user-c1";
  const decA = decision("SUBSCRIPTION_STATE_ACTIVE", "2026-12-31T00:00:00.000Z");
  await persistEntitlement(uid, "token-A-active", "SUBSCRIPTION_STATE_ACTIVE", decA, "ACKNOWLEDGED", { checked: true, voided: false, reason: "ok" });

  const decB = decision("SUBSCRIPTION_STATE_EXPIRED", "2026-08-01T00:00:00.000Z");
  await persistEntitlement(uid, "token-B-expired", "SUBSCRIPTION_STATE_EXPIRED", decB, "NOT_REQUIRED", { checked: true, voided: false, reason: "ok" });

  const user = firestoreDb.get(`users/${uid}`);
  assert.equal(user?.isPremium, true, "User must remain Premium");
  assert.equal(user?.membershipType, "PREMIUM");
});

test("BILL-02 Carryover 2: Token A active (Dec 2026), Token B older refunded (Aug 2026) -> Active subscription intact", async () => {
  firestoreDb.clear();
  const uid = "user-c2";
  const decA = decision("SUBSCRIPTION_STATE_ACTIVE", "2026-12-31T00:00:00.000Z");
  await persistEntitlement(uid, "token-A-active", "SUBSCRIPTION_STATE_ACTIVE", decA, "ACKNOWLEDGED", { checked: true, voided: false, reason: "ok" });

  // Older token B from August gets refunded/voided
  const decB = decision("SUBSCRIPTION_STATE_ACTIVE", "2026-08-01T00:00:00.000Z", { voided: true });
  await persistEntitlement(uid, "token-B-voided", "SUBSCRIPTION_STATE_ACTIVE", decB, "NOT_REQUIRED", { checked: true, voided: true, reason: "refund" });

  // Token B document must be marked VOIDED
  const hashB = tokenHash("token-B-voided");
  const tokenDocB = firestoreDb.get(`billing_purchase_tokens/${hashB}`);
  assert.equal(tokenDocB?.entitlementStatus, "VOIDED", "Token B itself must be VOIDED");

  // User must STILL be Premium because Token A is independently active until Dec 2026!
  const user = firestoreDb.get(`users/${uid}`);
  assert.equal(user?.isPremium, true, "Refunding an older separate token B must NOT revoke active subscription Token A");
  assert.equal(user?.membershipType, "PREMIUM");
});

test("BILL-02 Carryover 3: Token A active (Dec 2026), Token B revoked (past expiry) -> Active subscription intact", async () => {
  firestoreDb.clear();
  const uid = "user-c3";
  const decA = decision("SUBSCRIPTION_STATE_ACTIVE", "2026-12-31T00:00:00.000Z");
  await persistEntitlement(uid, "token-A-active", "SUBSCRIPTION_STATE_ACTIVE", decA, "ACKNOWLEDGED", { checked: true, voided: false, reason: "ok" });

  // Token B revoked
  const decB = decision("SUBSCRIPTION_STATE_CANCELED", "2026-07-01T00:00:00.000Z");
  await persistEntitlement(uid, "token-B-revoked", "SUBSCRIPTION_STATE_CANCELED", decB, "NOT_REQUIRED", { checked: true, voided: false, reason: "revoked" });

  const user = firestoreDb.get(`users/${uid}`);
  assert.equal(user?.isPremium, true, "Revoked past token must not downgrade active subscription");
});

test("BILL-02 Carryover 4: Token A expired first, Token B active second -> User becomes Premium", async () => {
  firestoreDb.clear();
  const uid = "user-c4";
  const decA = decision("SUBSCRIPTION_STATE_EXPIRED", "2026-08-01T00:00:00.000Z");
  await persistEntitlement(uid, "token-A-expired", "SUBSCRIPTION_STATE_EXPIRED", decA, "NOT_REQUIRED", { checked: true, voided: false, reason: "ok" });

  const decB = decision("SUBSCRIPTION_STATE_ACTIVE", "2026-12-31T00:00:00.000Z");
  await persistEntitlement(uid, "token-B-active", "SUBSCRIPTION_STATE_ACTIVE", decB, "ACKNOWLEDGED", { checked: true, voided: false, reason: "ok" });

  const user = firestoreDb.get(`users/${uid}`);
  assert.equal(user?.isPremium, true, "Subsequent active token must upgrade user to Premium");
  assert.equal(user?.membershipType, "PREMIUM");
});

test("BILL-02 Carryover 5: Founder/Lifetime with token voided -> Lifetime preserved", async () => {
  firestoreDb.clear();
  const uid = "user-c5-founder";
  firestoreDb.set(`users/${uid}`, { badge: "Founder", membershipType: "LIFETIME", isPremium: true });

  const decVoid = decision("SUBSCRIPTION_STATE_ACTIVE", "2026-12-31T00:00:00.000Z", { voided: true });
  await persistEntitlement(uid, "token-voided", "SUBSCRIPTION_STATE_ACTIVE", decVoid, "NOT_REQUIRED", { checked: true, voided: true, reason: "refund" });

  const user = firestoreDb.get(`users/${uid}`);
  assert.equal(user?.badge, "Founder");
  assert.equal(user?.membershipType, "LIFETIME");
  assert.equal(user?.isPremium, true, "Founder/Lifetime must NEVER be revoked by voided token");
});

test("BILL-02 Carryover 6: Verification order permutation (expired then active vs active then expired)", async () => {
  firestoreDb.clear();
  const uid1 = "user-perm-1";
  const uid2 = "user-perm-2";

  const decExp = decision("SUBSCRIPTION_STATE_EXPIRED", "2026-08-01T00:00:00.000Z");
  const decAct = decision("SUBSCRIPTION_STATE_ACTIVE", "2026-12-31T00:00:00.000Z");

  // Order 1: Expired -> Active
  await persistEntitlement(uid1, "tok-e1", "SUBSCRIPTION_STATE_EXPIRED", decExp, "NOT_REQUIRED", { checked: true, voided: false, reason: "ok" });
  await persistEntitlement(uid1, "tok-a1", "SUBSCRIPTION_STATE_ACTIVE", decAct, "ACKNOWLEDGED", { checked: true, voided: false, reason: "ok" });

  // Order 2: Active -> Expired
  await persistEntitlement(uid2, "tok-a2", "SUBSCRIPTION_STATE_ACTIVE", decAct, "ACKNOWLEDGED", { checked: true, voided: false, reason: "ok" });
  await persistEntitlement(uid2, "tok-e2", "SUBSCRIPTION_STATE_EXPIRED", decExp, "NOT_REQUIRED", { checked: true, voided: false, reason: "ok" });

  const user1 = firestoreDb.get(`users/${uid1}`);
  const user2 = firestoreDb.get(`users/${uid2}`);

  // Invariant: Both users must end up with identical active Premium state!
  assert.equal(user1?.isPremium, true);
  assert.equal(user2?.isPremium, true);
  assert.equal(user1?.membershipType, "PREMIUM");
  assert.equal(user2?.membershipType, "PREMIUM");
  assert.equal(user1?.accessUntil, user2?.accessUntil);
});

test("BILL-02 Carryover 7: Concurrent verification of two requests for same UID", async () => {
  firestoreDb.clear();
  const uid = "user-concurrent";
  const dec1 = decision("SUBSCRIPTION_STATE_ACTIVE", "2026-11-30T00:00:00.000Z");
  const dec2 = decision("SUBSCRIPTION_STATE_ACTIVE", "2026-12-31T00:00:00.000Z");

  // Two parallel calls
  await Promise.all([
    persistEntitlement(uid, "token-parallel-1", "SUBSCRIPTION_STATE_ACTIVE", dec1, "ACKNOWLEDGED", { checked: true, voided: false, reason: "ok" }),
    persistEntitlement(uid, "token-parallel-2", "SUBSCRIPTION_STATE_ACTIVE", dec2, "ACKNOWLEDGED", { checked: true, voided: false, reason: "ok" }),
  ]);

  const user = firestoreDb.get(`users/${uid}`);
  assert.equal(user?.isPremium, true);
  assert.equal(user?.membershipType, "PREMIUM");
  // Union expiry must pick the maximum expiry date (Dec 31)
  assert.ok(user?.accessUntil?.toString().includes("2026-12-31"));
});
