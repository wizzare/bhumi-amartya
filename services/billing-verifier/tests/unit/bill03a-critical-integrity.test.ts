import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { tokenHash } from "../../lib/security";

const require = createRequire(import.meta.url);
const Module = require("node:module");
const originalLoad = Module._load;

const firestoreDb = new Map<string, Record<string, unknown>>();

// Mock Firebase Admin
Module._load = function(request: string, parent: unknown, ...args: unknown[]) {
  if (request.endsWith("/firebaseAdmin") || request.endsWith("lib/firebaseAdmin")) {
    return {
      adminDb: () => ({
        doc: (path: string) => path,
        runTransaction: async (callback: (tx: any) => Promise<unknown>) => {
          const txWrites: Array<{ path: string; data: Record<string, unknown>; merge?: boolean }> = [];
          const tx = {
            get: async (docRef: string) => {
              const current = firestoreDb.get(docRef);
              return {
                exists: Boolean(current),
                data: () => (current ? JSON.parse(JSON.stringify(current)) : undefined),
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

// Now import target modules
const { decision, persistEntitlement } = require("../../lib/entitlement");

function resetFirestore() {
  firestoreDb.clear();
}

// =====================================================================
// SECTION A: CRITICAL REFUND GUARD AUDIT (A01 - A08)
// =====================================================================

test("A01: Effective active token refunded with result.date = null MUST revoke access", async () => {
  resetFirestore();
  const uid = "user-a01";
  const token = "token-active-a01";
  const hash = tokenHash(token);

  // Seed user with active paid subscription
  const futureDate = new Date(Date.now() + 14 * 24 * 3600 * 1000);
  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hash,
    accessUntil: futureDate.toISOString(),
  });
  firestoreDb.set(`billing_purchase_tokens/${hash}`, {
    uid,
    tokenHash: hash,
    entitlementStatus: "ACTIVE",
  });

  // Action: Google Play reports refund/void with date = null
  const voidResult = { active: false, status: "VOIDED", date: null };
  const voidedCheck = { checked: true, voided: true, reason: "REFUND" };

  await persistEntitlement(uid, token, "SUBSCRIPTION_STATE_CANCELED", voidResult, "NOT_REQUIRED", voidedCheck);

  const user = firestoreDb.get(`users/${uid}`) as any;
  const tokenDoc = firestoreDb.get(`billing_purchase_tokens/${hash}`) as any;

  assert.equal(tokenDoc.entitlementStatus, "VOIDED", "Token ledger record must be marked VOIDED");
  assert.equal(user.isPremium, false, "A01 INVARIANT: Refunded effective token MUST set isPremium to false");
  assert.equal(user.membershipType, "FREE", "A01 INVARIANT: membershipType must downgrade to FREE");
  assert.equal(user.activeTokenHash, null, "A01 INVARIANT: activeTokenHash must be cleared");
});

test("A02: Effective active token refunded with result.date < existingExpiry MUST revoke access", async () => {
  resetFirestore();
  const uid = "user-a02";
  const token = "token-active-a02";
  const hash = tokenHash(token);

  const futureDate = new Date(Date.now() + 20 * 24 * 3600 * 1000);
  const earlierDate = new Date(Date.now() - 5 * 24 * 3600 * 1000);
  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hash,
    accessUntil: futureDate.toISOString(),
  });

  // Action: Refund carries earlier date (e.g. original transaction timestamp)
  const voidResult = { active: false, status: "VOIDED", date: earlierDate };
  const voidedCheck = { checked: true, voided: true, reason: "CHARGEBACK" };

  await persistEntitlement(uid, token, "SUBSCRIPTION_STATE_CANCELED", voidResult, "NOT_REQUIRED", voidedCheck);

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, false, "A02 INVARIANT: Active token refund with earlier date MUST revoke access");
  assert.equal(user.membershipType, "FREE", "A02 INVARIANT: membershipType must downgrade to FREE");
  assert.equal(user.activeTokenHash, null, "A02 INVARIANT: activeTokenHash must be cleared");
});

test("A03: Historical/other token refunded with result.date = null does NOT revoke independent active subscription", async () => {
  resetFirestore();
  const uid = "user-a03";
  const activeToken = "token-active-current";
  const activeHash = tokenHash(activeToken);
  const oldToken = "token-historical-old";
  const oldHash = tokenHash(oldToken);

  const futureDate = new Date(Date.now() + 25 * 24 * 3600 * 1000);
  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: activeHash,
    accessUntil: futureDate.toISOString(),
  });
  firestoreDb.set(`billing_purchase_tokens/${oldHash}`, {
    uid,
    tokenHash: oldHash,
    entitlementStatus: "EXPIRED",
  });

  // Action: Refund for the historical old token arrives
  const voidResult = { active: false, status: "VOIDED", date: null };
  const voidedCheck = { checked: true, voided: true, reason: "FRAUD" };

  await persistEntitlement(uid, oldToken, "SUBSCRIPTION_STATE_CANCELED", voidResult, "NOT_REQUIRED", voidedCheck);

  const user = firestoreDb.get(`users/${uid}`) as any;
  const oldTokenDoc = firestoreDb.get(`billing_purchase_tokens/${oldHash}`) as any;

  assert.equal(oldTokenDoc.entitlementStatus, "VOIDED", "Historical token is updated to VOIDED");
  assert.equal(user.isPremium, true, "A03 INVARIANT: Independent active subscription remains intact");
  assert.equal(user.activeTokenHash, activeHash, "Active token hash remains activeHash");
  assert.equal(user.membershipType, "PREMIUM");
});

test("A04: Active token revoked while user has Lifetime -> Lifetime remains permanently intact", async () => {
  resetFirestore();
  const uid = "user-a04";
  const token = "token-lifetime-user";
  const hash = tokenHash(token);

  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "LIFETIME",
    activeTokenHash: hash,
  });

  const voidResult = { active: false, status: "VOIDED", date: null };
  const voidedCheck = { checked: true, voided: true, reason: "REFUND" };

  await persistEntitlement(uid, token, "SUBSCRIPTION_STATE_CANCELED", voidResult, "NOT_REQUIRED", voidedCheck);

  const user = firestoreDb.get(`users/${uid}`) as any;
  const tokenDoc = firestoreDb.get(`billing_purchase_tokens/${hash}`) as any;

  assert.equal(tokenDoc.entitlementStatus, "VOIDED");
  assert.equal(user.membershipType, "LIFETIME", "A04 INVARIANT: Lifetime membershipType must NEVER be altered");
  assert.equal(user.isPremium, true, "Lifetime user remains premium");
});

test("A05: Active token refunded while user has active tester grant (Penjaga Bhumi Inti) -> Paid revoked, tester grant intact", async () => {
  resetFirestore();
  const uid = "user-a05";
  const token = "token-tester-paid";
  const hash = tokenHash(token);

  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hash,
    badge: "Penjaga Bhumi Inti",
    testerBadge: "Penjaga Bhumi Inti",
    accessUntil: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
  });

  const voidResult = { active: false, status: "VOIDED", date: null };
  const voidedCheck = { checked: true, voided: true, reason: "REFUND" };

  await persistEntitlement(uid, token, "SUBSCRIPTION_STATE_CANCELED", voidResult, "NOT_REQUIRED", voidedCheck);

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.membershipType, "FREE", "A05 INVARIANT: Paid Google Play membershipType revoked to FREE");
  assert.equal(user.activeTokenHash, null, "Paid token hash cleared");
  assert.equal(user.badge, "Penjaga Bhumi Inti", "A05 INVARIANT: Tester badge preserved on user doc");
  assert.equal(user.testerBadge, "Penjaga Bhumi Inti", "A05 INVARIANT: Tester badge preserved on user doc");
});

test("A06: Legacy account without activeTokenHash on users/{uid}, then effective token is refunded -> MUST revoke", async () => {
  resetFirestore();
  const uid = "user-a06-legacy";
  const token = "token-legacy-purchase";
  const hash = tokenHash(token);

  // Legacy user without activeTokenHash field
  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    accessUntil: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
  });

  const voidResult = { active: false, status: "VOIDED", date: null };
  const voidedCheck = { checked: true, voided: true, reason: "REFUND" };

  await persistEntitlement(uid, token, "SUBSCRIPTION_STATE_CANCELED", voidResult, "NOT_REQUIRED", voidedCheck);

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, false, "A06 INVARIANT: Legacy user without activeTokenHash MUST revoke on refund");
  assert.equal(user.membershipType, "FREE");
});

test("A07: Concurrent refund and renewal authoritative state handling", async () => {
  resetFirestore();
  const uid = "user-a07";
  const tokenA = "token-renewed";
  const tokenB = "token-voided";
  const hashA = tokenHash(tokenA);
  const hashB = tokenHash(tokenB);

  const renewedDate = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  const activeResult = { active: true, status: "ACTIVE", date: renewedDate };
  const voidResult = { active: false, status: "VOIDED", date: null };
  const voidedCheck = { checked: true, voided: true, reason: "REFUND" };

  // First verify renewed token A
  await persistEntitlement(uid, tokenA, "SUBSCRIPTION_STATE_ACTIVE", activeResult, "ACKNOWLEDGED", { checked: false, voided: false, reason: "NONE" });
  // Then refund arrives for older token B
  await persistEntitlement(uid, tokenB, "SUBSCRIPTION_STATE_CANCELED", voidResult, "NOT_REQUIRED", voidedCheck);

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, true, "Authoritative active renewal prevails over older token refund");
  assert.equal(user.activeTokenHash, hashA);
});

test("A08: Idempotent repeated refund processing", async () => {
  resetFirestore();
  const uid = "user-a08";
  const token = "token-a08";
  const hash = tokenHash(token);

  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hash,
    accessUntil: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
  });

  const voidResult = { active: false, status: "VOIDED", date: null };
  const voidedCheck = { checked: true, voided: true, reason: "REFUND" };

  await persistEntitlement(uid, token, "SUBSCRIPTION_STATE_CANCELED", voidResult, "NOT_REQUIRED", voidedCheck);
  const firstDoc = { ...firestoreDb.get(`users/${uid}`) };
  delete firstDoc.updatedAt;
  delete firstDoc.entitlementUpdatedAt;

  // Second pass: identical replay
  await persistEntitlement(uid, token, "SUBSCRIPTION_STATE_CANCELED", voidResult, "NOT_REQUIRED", voidedCheck);
  const secondDoc = { ...firestoreDb.get(`users/${uid}`) };
  delete secondDoc.updatedAt;
  delete secondDoc.entitlementUpdatedAt;

  assert.deepEqual(firstDoc, secondDoc, "Repeated refund produces idempotent identical output");
});

// =====================================================================
// SECTION B: ACTIVE TOKEN HASH CORRECTNESS (B01 - B06)
// =====================================================================

test("B01: Token A ends Dec 1, Token B ends Nov 1; B verified last -> activeTokenHash must retain Token A (NOT last-token-wins)", async () => {
  resetFirestore();
  const uid = "user-b01";
  const tokenA = "token-ends-december";
  const tokenB = "token-ends-november";
  const hashA = tokenHash(tokenA);
  const hashB = tokenHash(tokenB);

  const dec1 = new Date(Date.now() + 60 * 24 * 3600 * 1000);
  const nov1 = new Date(Date.now() + 30 * 24 * 3600 * 1000);

  // 1. Token A verified first (expires Dec 1)
  await persistEntitlement(
    uid,
    tokenA,
    "SUBSCRIPTION_STATE_ACTIVE",
    { active: true, status: "ACTIVE", date: dec1 },
    "ACKNOWLEDGED",
    { checked: false, voided: false, reason: "NONE" }
  );

  let user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.activeTokenHash, hashA, "Token A is initially activeTokenHash");
  assert.equal(new Date(user.accessUntil).getTime(), dec1.getTime());

  // 2. Token B verified last (expires Nov 1, earlier than Dec 1)
  await persistEntitlement(
    uid,
    tokenB,
    "SUBSCRIPTION_STATE_ACTIVE",
    { active: true, status: "ACTIVE", date: nov1 },
    "ACKNOWLEDGED",
    { checked: false, voided: false, reason: "NONE" }
  );

  user = firestoreDb.get(`users/${uid}`) as any;
  // B01 CRITICAL CONTRACT: activeTokenHash MUST point to Token A which provides the Dec 1 effective expiry!
  assert.equal(new Date(user.accessUntil).getTime(), dec1.getTime(), "Effective expiry must remain Dec 1");
  assert.equal(user.activeTokenHash, hashA, "B01 INVARIANT: activeTokenHash must point to Token A, NOT last-token-wins (Token B)");
});

test("B02: Token A and B both active; A canceled paid-through -> B still protects access", async () => {
  resetFirestore();
  const uid = "user-b02";
  const tokenA = "token-a-canceled";
  const tokenB = "token-b-active";
  const hashA = tokenHash(tokenA);
  const hashB = tokenHash(tokenB);

  const dec1 = new Date(Date.now() + 45 * 24 * 3600 * 1000);
  const nov1 = new Date(Date.now() + 20 * 24 * 3600 * 1000);

  // Verify B first
  await persistEntitlement(uid, tokenB, "SUBSCRIPTION_STATE_ACTIVE", { active: true, status: "ACTIVE", date: dec1 }, "ACKNOWLEDGED", { checked: false, voided: false, reason: "NONE" });
  // Verify A (canceled, but paid through Nov 1)
  const aDecision = decision("SUBSCRIPTION_STATE_CANCELED", nov1.toISOString());
  await persistEntitlement(uid, tokenA, "SUBSCRIPTION_STATE_CANCELED", aDecision, "ACKNOWLEDGED", { checked: false, voided: false, reason: "NONE" });

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, true, "B02 INVARIANT: User remains premium");
  assert.equal(user.activeTokenHash, hashB, "Token B provides the longer active access");
});

test("B03: Token A and B both active; B canceled paid-through -> A still protects access", async () => {
  resetFirestore();
  const uid = "user-b03";
  const tokenA = "token-a-active";
  const tokenB = "token-b-canceled";
  const hashA = tokenHash(tokenA);
  const hashB = tokenHash(tokenB);

  const dec1 = new Date(Date.now() + 45 * 24 * 3600 * 1000);
  const nov1 = new Date(Date.now() + 20 * 24 * 3600 * 1000);

  // Verify A (active through Dec 1)
  await persistEntitlement(uid, tokenA, "SUBSCRIPTION_STATE_ACTIVE", { active: true, status: "ACTIVE", date: dec1 }, "ACKNOWLEDGED", { checked: false, voided: false, reason: "NONE" });
  // Verify B (canceled through Nov 1)
  const bDecision = decision("SUBSCRIPTION_STATE_CANCELED", nov1.toISOString());
  await persistEntitlement(uid, tokenB, "SUBSCRIPTION_STATE_CANCELED", bDecision, "ACKNOWLEDGED", { checked: false, voided: false, reason: "NONE" });

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, true, "B03 INVARIANT: User remains premium");
  assert.equal(user.activeTokenHash, hashA, "Token A protects access");
});

test("B04: Token A expired; Token B still active -> B protects access", async () => {
  resetFirestore();
  const uid = "user-b04";
  const tokenA = "token-a-expired";
  const tokenB = "token-b-active";
  const hashA = tokenHash(tokenA);
  const hashB = tokenHash(tokenB);

  const future = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  const past = new Date(Date.now() - 5 * 24 * 3600 * 1000);

  // Seed user with Token B active
  firestoreDb.set(`users/${uid}`, {
    uid,
    isPremium: true,
    membershipType: "PREMIUM",
    activeTokenHash: hashB,
    accessUntil: future.toISOString(),
  });

  // Action: Expired Token A is checked
  const aDecision = decision("SUBSCRIPTION_STATE_EXPIRED", past.toISOString());
  await persistEntitlement(uid, tokenA, "SUBSCRIPTION_STATE_EXPIRED", aDecision, "NOT_REQUIRED", { checked: false, voided: false, reason: "NONE" });

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, true, "B04 INVARIANT: Active token B protects user access against expired token A");
  assert.equal(user.activeTokenHash, hashB);
});

test("B05: Token B replacement/upgrade from Token A -> activeTokenHash transitions to Token B", async () => {
  resetFirestore();
  const uid = "user-b05";
  const tokenA = "token-upgrade-old";
  const tokenB = "token-upgrade-new";
  const hashA = tokenHash(tokenA);
  const hashB = tokenHash(tokenB);

  const dateA = new Date(Date.now() + 10 * 24 * 3600 * 1000);
  const dateB = new Date(Date.now() + 40 * 24 * 3600 * 1000);

  await persistEntitlement(uid, tokenA, "SUBSCRIPTION_STATE_ACTIVE", { active: true, status: "ACTIVE", date: dateA }, "ACKNOWLEDGED", { checked: false, voided: false, reason: "NONE" });
  let user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.activeTokenHash, hashA);

  // Upgrade token B arrives with later date
  await persistEntitlement(uid, tokenB, "SUBSCRIPTION_STATE_ACTIVE", { active: true, status: "ACTIVE", date: dateB }, "ACKNOWLEDGED", { checked: false, voided: false, reason: "NONE" });
  user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.activeTokenHash, hashB, "B05 INVARIANT: Upgraded token B with later date takes activeTokenHash");
  assert.equal(new Date(user.accessUntil).getTime(), dateB.getTime());
});

test("B06: Restore re-introduces historical token after newer renewal -> newer renewal preserved", async () => {
  resetFirestore();
  const uid = "user-b06";
  const tokenRenewal = "token-newer-renewal";
  const tokenHistorical = "token-older-historical";
  const hashRenewal = tokenHash(tokenRenewal);
  const hashHistorical = tokenHash(tokenHistorical);

  const renewalDate = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  const historicalDate = new Date(Date.now() - 30 * 24 * 3600 * 1000);

  // Active renewal established
  await persistEntitlement(uid, tokenRenewal, "SUBSCRIPTION_STATE_ACTIVE", { active: true, status: "ACTIVE", date: renewalDate }, "ACKNOWLEDGED", { checked: false, voided: false, reason: "NONE" });

  // Restore checks old token
  const historicalDecision = decision("SUBSCRIPTION_STATE_EXPIRED", historicalDate.toISOString());
  await persistEntitlement(uid, tokenHistorical, "SUBSCRIPTION_STATE_EXPIRED", historicalDecision, "NOT_REQUIRED", { checked: false, voided: false, reason: "NONE" });

  const user = firestoreDb.get(`users/${uid}`) as any;
  assert.equal(user.isPremium, true, "B06 INVARIANT: Restore of historical token cannot downgrade active renewal");
  assert.equal(user.activeTokenHash, hashRenewal);
  assert.equal(new Date(user.accessUntil).getTime(), renewalDate.getTime());
});
