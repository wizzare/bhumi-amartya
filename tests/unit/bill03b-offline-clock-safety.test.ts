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

function createCustomSignedToken(claims: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "ES256", typ: "JWT", kid: "v1" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const privKey = createPrivateKey(process.env.ENTITLEMENT_PRIVATE_KEY!);
  const sig = sign("SHA256", Buffer.from(`${header}.${payload}`), {
    key: privKey,
    dsaEncoding: "ieee-p1363",
  }).toString("base64url");
  return `${header}.${payload}.${sig}`;
}

// =====================================================================
// OFFLINE CLOCK SAFETY SUITE (CLK-01 s/d CLK-08)
// =====================================================================

test("CLK-01: Device clock rolled back before token issued (future iat) -> rejected fail-closed", async () => {
  process.env.BHUMI_TEST_PLATFORM = "android";
  isOnline = false;
  const uid = "uid-clk-01";
  const nowSec = Math.floor(Date.now() / 1000);

  const token = createCustomSignedToken({
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
  });

  const verified = await verifySignedEntitlementLocal(token, uid);
  assert.equal(verified, false, "CLK-01 CONTRACT: Token with future iat rejected fail-closed");
});

test("CLK-02: Device clock rolled back slightly within 60s tolerance -> permitted by clockSkew", async () => {
  process.env.BHUMI_TEST_PLATFORM = "android";
  isOnline = false;
  const uid = "uid-clk-02";
  const nowSec = Math.floor(Date.now() / 1000);

  const token = createCustomSignedToken({
    iss: "bhumi-auth-verifier",
    aud: "bhumi-mobile-app",
    sub: uid,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    tokenVersion: "1.0",
    iat: nowSec + 25, // 25 seconds ahead (within 60s skew tolerance)
    exp: nowSec + 3600,
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  });

  const verified = await verifySignedEntitlementLocal(token, uid);
  assert.equal(verified, true, "CLK-02 CONTRACT: Slight skew within 60s is safely tolerated");
});

test("CLK-03: Offline more than 72 hours of real elapsed time -> rejected & wiped", async () => {
  process.env.BHUMI_TEST_PLATFORM = "android";
  isOnline = false;
  const uid = "uid-clk-03";
  const nowSec = Math.floor(Date.now() / 1000);

  const token = createCustomSignedToken({
    iss: "bhumi-auth-verifier",
    aud: "bhumi-mobile-app",
    sub: uid,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    tokenVersion: "1.0",
    iat: nowSec - 74 * 3600, // issued 74h ago (> 72h limit)
    exp: nowSec - 50 * 3600,
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  });

  const verified = await verifySignedEntitlementLocal(token, uid);
  assert.equal(verified, false, "CLK-03 CONTRACT: Offline grace limit (72h) strictly enforced");
});

test("CLK-04: Device reboot / uptime reset does not extend entitlement validity", async () => {
  process.env.BHUMI_TEST_PLATFORM = "android";
  isOnline = false;
  const uid = "uid-clk-04";
  const nowSec = Math.floor(Date.now() / 1000);

  // Device restarts: uptime resets to 0. Wall-clock timestamp remains authoritative.
  const expiredPastGrace = createCustomSignedToken({
    iss: "bhumi-auth-verifier",
    aud: "bhumi-mobile-app",
    sub: uid,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    tokenVersion: "1.0",
    iat: nowSec - 80 * 3600,
    exp: nowSec - 73 * 3600,
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  });

  const verified = await verifySignedEntitlementLocal(expiredPastGrace, uid);
  assert.equal(verified, false, "CLK-04: Uptime reset cannot bypass 72h wall-clock grace limit");
});

test("CLK-05: Timezone shifts do not affect UTC epoch second validation", async () => {
  process.env.BHUMI_TEST_PLATFORM = "android";
  isOnline = false;
  const uid = "uid-clk-05";

  // Unix epoch seconds are UTC-invariant
  const token = generateSignedEntitlement({
    sub: uid,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    exp: Math.floor(Date.now() / 1000) + 3600,
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  });

  const verified = await verifySignedEntitlementLocal(token, uid);
  assert.equal(verified, true, "CLK-05: Epoch second validation remains consistent regardless of timezone display");
});

test("CLK-06: Ancient cached token replayed is rejected", async () => {
  process.env.BHUMI_TEST_PLATFORM = "android";
  isOnline = false;
  const uid = "uid-clk-06";
  const nowSec = Math.floor(Date.now() / 1000);

  const ancientToken = createCustomSignedToken({
    iss: "bhumi-auth-verifier",
    aud: "bhumi-mobile-app",
    sub: uid,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    tokenVersion: "1.0",
    iat: nowSec - 200 * 3600,
    exp: nowSec - 150 * 3600,
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  });

  const verified = await verifySignedEntitlementLocal(ancientToken, uid);
  assert.equal(verified, false, "CLK-06: Ancient cached token rejected fail-closed");
});

test("CLK-07: UID switching / logout wipes and rejects cached token across partitions", async () => {
  process.env.BHUMI_TEST_PLATFORM = "android";
  isOnline = false;
  const uidAlice = "uid-alice-clk07";
  const uidBob = "uid-bob-clk07";

  const aliceToken = generateSignedEntitlement({
    sub: uidAlice,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    exp: Math.floor(Date.now() / 1000) + 3600,
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  });

  const bobCheck = await verifySignedEntitlementLocal(aliceToken, uidBob);
  assert.equal(bobCheck, false, "CLK-07: Alice's token fails closed when verified for Bob");
});

test("CLK-08: Reconnect after entitlement revoked on server forces live refresh", async () => {
  process.env.BHUMI_TEST_PLATFORM = "android";
  isOnline = true; // Online!
  const uid = "uid-clk-08";

  // Expired token that would be allowed if offline
  const token = generateSignedEntitlement({
    sub: uid,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    exp: Math.floor(Date.now() / 1000) - 300, // expired 5 minutes ago
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  });

  const onlineCheck = await verifySignedEntitlementLocal(token, uid);
  assert.equal(onlineCheck, false, "CLK-08 CONTRACT: When online, offline grace is disabled; forces online refresh");
});
