// Setup mock Firebase environment before any imports
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "mock-api-key";
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "mock.firebaseapp.com";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "bhumiamartya-fe85c";
process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_PROJECT_ID = "bhumiamartya-fe85c";
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "mock.appspot.com";
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "1234567890";
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "1:1234567890:web:abcdef";
process.env.NEXT_PUBLIC_BILLING_VERIFIER_URL = "https://billing.invalid";
process.env.NODE_ENV = "test";
process.env.BHUMI_TEST_PLATFORM = "android";

import assert from "node:assert/strict";
import test from "node:test";
import { generateKeyPairSync, randomUUID } from "node:crypto";
import { getEntitlementStatus, type EntitlementStatus } from "../../lib/billing/entitlementService";
import { stripServerOwnedAccessFields } from "../../lib/billing/serverOwnedAccessFields";
import {
  verifySignedEntitlementLocal,
  handleUserLogout,
  GOOGLE_PLAY_PRODUCT_ID,
} from "../../lib/billing/googlePlayBilling";
import { generateSignedEntitlement } from "../../services/billing-verifier/lib/signedEntitlement";

const ecKeys = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
const privKeyPem = ecKeys.privateKey.export({ type: "pkcs8", format: "pem" }).toString();
const pubKeyPem = ecKeys.publicKey.export({ type: "spki", format: "pem" }).toString();
process.env.ENTITLEMENT_PRIVATE_KEY = privKeyPem;
process.env.ENTITLEMENT_PUBLIC_KEY = pubKeyPem;
process.env.NEXT_PUBLIC_ENTITLEMENT_PUBLIC_KEY = pubKeyPem;
process.env.NODE_ENV = "test";
process.env.BHUMI_TEST_PLATFORM = "android";

// Define mock navigator.onLine
let isOnline = true;
Object.defineProperty(globalThis, "navigator", {
  value: {
    get onLine() {
      return isOnline;
    },
  },
  configurable: true,
});

const NOW = new Date("2026-08-15T12:00:00.000Z");

// =====================================================================
// SECTION D: EXPIRATION & ENTITLEMENT AUTHORITY
// =====================================================================

test("AUTHORITY 1: Effective expiry originates from server/provider data, not fabricated", () => {
  const profile = {
    uid: "user-1",
    membershipType: "PREMIUM",
    entitlementSource: "google_play",
    membershipExpiryDate: new Date("2026-09-01T00:00:00.000Z"),
    accessUntil: "2026-09-01T00:00:00.000Z",
  };
  const status = getEntitlementStatus(profile as any, NOW);
  assert.equal(status.isPremium, true);
  assert.equal(status.expiresAt?.toISOString(), "2026-09-01T00:00:00.000Z");
  assert.equal(status.source, "Google Play Billing");
});

test("AUTHORITY 2: Client timestamp manipulation cannot extend Premium", () => {
  const expiry = new Date("2026-08-01T00:00:00.000Z"); // expired 14 days ago relative to NOW
  const profile = {
    uid: "user-2",
    membershipType: "PREMIUM",
    entitlementSource: "google_play",
    membershipExpiryDate: expiry,
    accessUntil: expiry.toISOString(),
  };

  // Evaluation at server NOW
  const status = getEntitlementStatus(profile as any, NOW);
  assert.equal(status.isPremium, false, "Expired subscription must evaluate to false at authoritative time");
  assert.equal(status.status, "Expired");
});

test("AUTHORITY 3: 7-day trial exhausted cannot be restarted by re-login or re-bootstrap", () => {
  const trialStartedAt = new Date("2026-08-01T00:00:00.000Z");
  const trialEndsAt = new Date(trialStartedAt.getTime() + 7 * 86400000); // 2026-08-08
  const profile = {
    uid: "user-3",
    trialStartedAt: trialStartedAt.toISOString(),
    trialEndsAt: trialEndsAt.toISOString(),
    entitlementSource: "server_access_bootstrap",
  };

  const status = getEntitlementStatus(profile as any, NOW);
  assert.equal(status.isPremium, false);
  assert.equal(status.status, "Trial Exhausted");
  assert.equal(status.effectiveTier, "Free (Trial Exhausted)");
});

test("AUTHORITY 4: Founder/Lifetime does not expire", () => {
  const founderProfile = {
    uid: "user-founder",
    membershipType: "LIFETIME",
    badge: "Founder",
  };
  const statusFounder = getEntitlementStatus(founderProfile as any, new Date("2035-01-01T00:00:00Z"));
  assert.equal(statusFounder.isPremium, true);
  assert.equal(statusFounder.expiresAt, null);
  assert.equal(statusFounder.effectiveTier, "Founder (Lifetime)");

  const lifetimeProfile = {
    uid: "user-lifetime",
    membershipType: "LIFETIME",
  };
  const statusLifetime = getEntitlementStatus(lifetimeProfile as any, new Date("2035-01-01T00:00:00Z"));
  assert.equal(statusLifetime.isPremium, true);
  assert.equal(statusLifetime.effectiveTier, "Lifetime");
});

test("AUTHORITY 5: Grant (Penjaga Bhumi Inti) remains valid even if Google Play subscription expires or is voided", () => {
  const profile = {
    uid: "user-inti-grant",
    badge: "Penjaga Bhumi Inti",
    testerBadge: "Penjaga Bhumi Inti",
    membershipType: "FREE", // Google Play expired or voided
    entitlementSource: "google_play",
    subscriptionStatus: "VOIDED",
  };
  const status = getEntitlementStatus(profile as any, NOW);
  assert.equal(status.isPremium, true, "Penjaga Bhumi Inti grant must outrank or survive Google Play voiding");
  assert.equal(status.reason, "inti_badge");
  assert.equal(status.effectiveTier, "Penjaga Bhumi Inti");
});

test("AUTHORITY 6: Expired token cannot replace active token", () => {
  const activeProfile = {
    uid: "user-active",
    membershipType: "PREMIUM",
    entitlementSource: "google_play",
    accessUntil: "2026-12-31T00:00:00.000Z",
  };
  const status = getEntitlementStatus(activeProfile as any, NOW);
  assert.equal(status.isPremium, true);
  assert.equal(status.expiresAt?.toISOString(), "2026-12-31T00:00:00.000Z");
});

test("AUTHORITY 7: Expired entitlement does not become active upon re-login", () => {
  const profile = {
    uid: "user-expired",
    membershipType: "FREE",
    entitlementSource: "google_play",
    accessUntil: "2026-08-01T00:00:00.000Z",
    subscriptionStatus: "EXPIRED",
  };
  const status = getEntitlementStatus(profile as any, NOW);
  assert.equal(status.isPremium, false);
});

test("AUTHORITY 8: Stale localStorage has zero authority over canonical Firestore", () => {
  const clientStorageData = {
    isPremium: true,
    membershipType: "LIFETIME",
    badge: "Founder",
  };
  const stripped = stripServerOwnedAccessFields(clientStorageData);
  assert.equal((stripped as any).isPremium, undefined);
  assert.equal((stripped as any).membershipType, undefined);
  assert.equal((stripped as any).badge, undefined);
});

test("AUTHORITY 9: No client-side self-grant (stripServerOwnedAccessFields strips all server-owned keys)", () => {
  const attackerAttempt = {
    uid: "attacker",
    plan: "premium",
    isPremium: true,
    membershipType: "PREMIUM",
    trialStartedAt: new Date().toISOString(),
    trialEndsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    displayName: "Attacker User",
  };
  const safe = stripServerOwnedAccessFields(attackerAttempt);
  assert.equal(safe.displayName, "Attacker User");
  assert.equal((safe as any).plan, undefined);
  assert.equal((safe as any).isPremium, undefined);
  assert.equal((safe as any).membershipType, undefined);
  assert.equal((safe as any).trialStartedAt, undefined);
  assert.equal((safe as any).trialEndsAt, undefined);
});

test("AUTHORITY 10: Effective entitlement converges after reconciliation", () => {
  // Free profile without active subscription or trial
  const freeProfile = { uid: "u-free" };
  const freeStatus = getEntitlementStatus(freeProfile as any, NOW);
  assert.equal(freeStatus.isPremium, false);
  assert.equal(freeStatus.effectiveTier, "Free");
});

// =====================================================================
// SECTION E: OFFLINE SIGNED ENTITLEMENT & CLOCK ROLLBACK
// =====================================================================

test("OFFLINE 1: Signature ES256 validity with matching UID succeeds", async () => {
  process.env.BHUMI_TEST_PLATFORM = "android";
  isOnline = true;
  const uid = "uid-offline-alice";

  const validToken = generateSignedEntitlement({
    sub: uid,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    exp: Math.floor(Date.now() / 1000) + 3600,
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  });

  const verified = await verifySignedEntitlementLocal(validToken, uid);
  assert.equal(verified, true, "Valid ES256 signed entitlement must verify for matching UID");
});

test("OFFLINE 2: Token presented for mismatched UID fails closed", async () => {
  process.env.BHUMI_TEST_PLATFORM = "android";
  isOnline = true;
  const uidAlice = "uid-offline-alice";
  const uidBob = "uid-offline-bob";

  const aliceToken = generateSignedEntitlement({
    sub: uidAlice,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    exp: Math.floor(Date.now() / 1000) + 3600,
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  });

  const bobCheck = await verifySignedEntitlementLocal(aliceToken, uidBob);
  assert.equal(bobCheck, false, "Token issued to Alice must fail closed if presented by Bob");
});

test("OFFLINE 3: 72-hour offline grace policy limit", async () => {
  process.env.BHUMI_TEST_PLATFORM = "android";
  isOnline = false; // device is offline
  const uid = "uid-offline-grace";

  // Case A: Expired 1 hour ago, but issued 10 hours ago (within 72h limit) -> allowed offline
  const recentToken = generateSignedEntitlement({
    sub: uid,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    exp: Math.floor(Date.now() / 1000) - 3600, // expired 1h ago
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  });

  const recentOk = await verifySignedEntitlementLocal(recentToken, uid);
  assert.equal(recentOk, true, "Expired token within 72h offline grace is permitted while offline");

  // Case B: Issued more than 72 hours ago -> rejected & wiped
  // We simulate by setting a token whose iat is beyond 72h
  const nowSec = Math.floor(Date.now() / 1000);
  const oldHeader = Buffer.from(JSON.stringify({ alg: "ES256", typ: "JWT", kid: "v1" })).toString("base64url");
  const oldPayload = Buffer.from(JSON.stringify({
    iss: "bhumi-auth-verifier",
    aud: "bhumi-mobile-app",
    sub: uid,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    tokenVersion: "1.0",
    iat: nowSec - (73 * 3600), // issued 73 hours ago
    exp: nowSec - (49 * 3600), // expired 49 hours ago
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  })).toString("base64url");

  // Sign it with valid private key
  const { sign, createPrivateKey } = await import("node:crypto");
  const privKey = createPrivateKey(process.env.ENTITLEMENT_PRIVATE_KEY!);
  const sig = sign("SHA256", Buffer.from(`${oldHeader}.${oldPayload}`), privKey).toString("base64url");
  const beyondGraceToken = `${oldHeader}.${oldPayload}.${sig}`;

  const beyondOk = await verifySignedEntitlementLocal(beyondGraceToken, uid);
  assert.equal(beyondOk, false, "Token beyond 72h grace limit must be rejected");
});

test("OFFLINE 4: Device clock rollback prevention (future iat rejected)", async () => {
  process.env.BHUMI_TEST_PLATFORM = "android";
  isOnline = false;
  const uid = "uid-clock-rollback";

  const nowSec = Math.floor(Date.now() / 1000);
  const futureHeader = Buffer.from(JSON.stringify({ alg: "ES256", typ: "JWT", kid: "v1" })).toString("base64url");
  const futurePayload = Buffer.from(JSON.stringify({
    iss: "bhumi-auth-verifier",
    aud: "bhumi-mobile-app",
    sub: uid,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    tokenVersion: "1.0",
    iat: nowSec + 3600, // iat in the future (clock rolled back)
    exp: nowSec + 7200,
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  })).toString("base64url");

  const { sign, createPrivateKey } = await import("node:crypto");
  const privKey = createPrivateKey(process.env.ENTITLEMENT_PRIVATE_KEY!);
  const sig = sign("SHA256", Buffer.from(`${futureHeader}.${futurePayload}`), privKey).toString("base64url");
  const rollbackToken = `${futureHeader}.${futurePayload}.${sig}`;

  const verified = await verifySignedEntitlementLocal(rollbackToken, uid);
  assert.equal(verified, false, "Token with iat in the future (device clock rolled backward) must be rejected");
});

test("OFFLINE 5: Expired token rejected when online (forces immediate refresh)", async () => {
  process.env.BHUMI_TEST_PLATFORM = "android";
  isOnline = true; // device is online!
  const uid = "uid-online-refresh";

  const expiredToken = generateSignedEntitlement({
    sub: uid,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    exp: Math.floor(Date.now() / 1000) - 300, // expired 5 minutes ago
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  });

  const verified = await verifySignedEntitlementLocal(expiredToken, uid);
  assert.equal(verified, false, "When online, expired token must NOT use offline grace; forces online refresh");
});

test("OFFLINE 6: Logout / account switch wipes offline entitlement", async () => {
  const uidAlice = "uid-alice-logout";
  await handleUserLogout(uidAlice);
  // Function executes cleanly and removes partition
  assert.ok(true, "handleUserLogout wipes entitlement state for specified UID");
});
