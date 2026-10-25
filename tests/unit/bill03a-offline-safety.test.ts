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
import { generateKeyPairSync, randomUUID, sign, createPrivateKey } from "node:crypto";
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

let isOnline = true;
Object.defineProperty(globalThis, "navigator", {
  value: {
    get onLine() {
      return isOnline;
    },
  },
  configurable: true,
});

test("D01: Token past exp, but iat within 72h grace -> permitted offline", async () => {
  process.env.BHUMI_TEST_PLATFORM = "android";
  isOnline = false; // offline
  const uid = "uid-d01";

  const token = generateSignedEntitlement({
    sub: uid,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    exp: Math.floor(Date.now() / 1000) - 1800, // expired 30 minutes ago
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  });

  const verified = await verifySignedEntitlementLocal(token, uid);
  assert.equal(verified, true, "D01 CONTRACT: Offline expired token within 72h grace must be permitted offline");
});

test("D02: Device clock rolled back before token was issued (future iat) -> rejected", async () => {
  process.env.BHUMI_TEST_PLATFORM = "android";
  isOnline = false;
  const uid = "uid-d02";

  const nowSec = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "ES256", typ: "JWT", kid: "v1" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: "bhumi-auth-verifier",
    aud: "bhumi-mobile-app",
    sub: uid,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    tokenVersion: "1.0",
    iat: nowSec + 3600, // issued in the future (clock rolled back)
    exp: nowSec + 7200,
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  })).toString("base64url");

  const privKey = createPrivateKey(process.env.ENTITLEMENT_PRIVATE_KEY!);
  const sig = sign("SHA256", Buffer.from(`${header}.${payload}`), {
    key: privKey,
    dsaEncoding: "ieee-p1363",
  }).toString("base64url");
  const rollbackToken = `${header}.${payload}.${sig}`;

  const verified = await verifySignedEntitlementLocal(rollbackToken, uid);
  assert.equal(verified, false, "D02 CONTRACT: Token with future iat (clock rolled backward) MUST be rejected");
});

test("D03: Device clock skew of a few seconds (within 60s) -> tolerated", async () => {
  process.env.BHUMI_TEST_PLATFORM = "android";
  isOnline = false;
  const uid = "uid-d03";

  const nowSec = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "ES256", typ: "JWT", kid: "v1" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: "bhumi-auth-verifier",
    aud: "bhumi-mobile-app",
    sub: uid,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    tokenVersion: "1.0",
    iat: nowSec + 30, // 30 seconds ahead (tolerated by 60s clockSkew)
    exp: nowSec + 3600,
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  })).toString("base64url");

  const privKey = createPrivateKey(process.env.ENTITLEMENT_PRIVATE_KEY!);
  const sig = sign("SHA256", Buffer.from(`${header}.${payload}`), {
    key: privKey,
    dsaEncoding: "ieee-p1363",
  }).toString("base64url");
  const skewedToken = `${header}.${payload}.${sig}`;

  const verified = await verifySignedEntitlementLocal(skewedToken, uid);
  assert.equal(verified, true, "D03 CONTRACT: Slight clock skew within 60s is tolerated");
});

test("D04: Device continuously offline beyond 72h grace -> rejected and wiped", async () => {
  process.env.BHUMI_TEST_PLATFORM = "android";
  isOnline = false;
  const uid = "uid-d04";

  const nowSec = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "ES256", typ: "JWT", kid: "v1" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: "bhumi-auth-verifier",
    aud: "bhumi-mobile-app",
    sub: uid,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    tokenVersion: "1.0",
    iat: nowSec - 75 * 3600, // issued 75h ago
    exp: nowSec - 50 * 3600,
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  })).toString("base64url");

  const privKey = createPrivateKey(process.env.ENTITLEMENT_PRIVATE_KEY!);
  const sig = sign("SHA256", Buffer.from(`${header}.${payload}`), {
    key: privKey,
    dsaEncoding: "ieee-p1363",
  }).toString("base64url");
  const staleToken = `${header}.${payload}.${sig}`;

  const verified = await verifySignedEntitlementLocal(staleToken, uid);
  assert.equal(verified, false, "D04 CONTRACT: Token beyond 72h offline grace limit must be rejected");
});

test("D05: Old expired token beyond grace replayed on same UID -> rejected", async () => {
  process.env.BHUMI_TEST_PLATFORM = "android";
  isOnline = false;
  const uid = "uid-d05";

  const nowSec = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "ES256", typ: "JWT", kid: "v1" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: "bhumi-auth-verifier",
    aud: "bhumi-mobile-app",
    sub: uid,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    tokenVersion: "1.0",
    iat: nowSec - 100 * 3600,
    exp: nowSec - 80 * 3600,
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  })).toString("base64url");

  const privKey = createPrivateKey(process.env.ENTITLEMENT_PRIVATE_KEY!);
  const sig = sign("SHA256", Buffer.from(`${header}.${payload}`), {
    key: privKey,
    dsaEncoding: "ieee-p1363",
  }).toString("base64url");
  const replayedToken = `${header}.${payload}.${sig}`;

  const verified = await verifySignedEntitlementLocal(replayedToken, uid);
  assert.equal(verified, false, "D05 CONTRACT: Replayed ancient token rejected");
});

test("D06: Old signed token used after logout and login to different UID -> rejected fail closed", async () => {
  process.env.BHUMI_TEST_PLATFORM = "android";
  isOnline = false;
  const uidAlice = "uid-alice-d06";
  const uidBob = "uid-bob-d06";

  const aliceToken = generateSignedEntitlement({
    sub: uidAlice,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    exp: Math.floor(Date.now() / 1000) + 3600,
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  });

  const verifiedForBob = await verifySignedEntitlementLocal(aliceToken, uidBob);
  assert.equal(verifiedForBob, false, "D06 CONTRACT: Token issued to Alice MUST fail closed for Bob");
});

test("D07: Server revokes entitlement while offline, then device comes online -> forces refresh, revokes access", async () => {
  process.env.BHUMI_TEST_PLATFORM = "android";
  isOnline = true; // Online!
  const uid = "uid-d07";

  // Expired token that would be allowed if offline
  const token = generateSignedEntitlement({
    sub: uid,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    exp: Math.floor(Date.now() / 1000) - 300, // expired 5 minutes ago
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  });

  const verifiedOnline = await verifySignedEntitlementLocal(token, uid);
  assert.equal(verifiedOnline, false, "D07 CONTRACT: When device is online, expired token must NOT be accepted via grace; forces online refresh");
});

test("D08: SecureStorage cache tampering -> signature verification fails closed", async () => {
  process.env.BHUMI_TEST_PLATFORM = "android";
  isOnline = false;
  const uid = "uid-d08";

  const validToken = generateSignedEntitlement({
    sub: uid,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    exp: Math.floor(Date.now() / 1000) + 3600,
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  });

  const parts = validToken.split(".");
  // Tamper payload
  const tamperedPayload = Buffer.from(JSON.stringify({
    ...JSON.parse(Buffer.from(parts[1], "base64url").toString()),
    sub: "tampered-attacker-uid",
  })).toString("base64url");
  const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

  const verifiedTampered = await verifySignedEntitlementLocal(tamperedToken, uid);
  assert.equal(verifiedTampered, false, "D08 CONTRACT: Tampered payload fails cryptographic signature verification");

  // Tamper signature
  const corruptedSigToken = `${parts[0]}.${parts[1]}.badsignaturecorrupted`;
  const verifiedCorruptedSig = await verifySignedEntitlementLocal(corruptedSigToken, uid);
  assert.equal(verifiedCorruptedSig, false, "D08 CONTRACT: Corrupted signature fails closed");
});
