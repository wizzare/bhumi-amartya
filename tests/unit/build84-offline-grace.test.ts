import assert from "node:assert/strict";

let passed = 0;
async function test(label: string, work: () => void | Promise<void>) {
  try {
    await work();
    passed++;
    console.log(`PASS ${passed}: ${label}`);
  } catch (err: any) {
    console.error(`FAIL: ${label}`, err);
    throw err;
  }
}

async function run() {
  // Set mock Firebase client environment variables BEFORE importing firebase-dependent modules
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "mock-api-key";
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "mock.firebaseapp.com";
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "bhumiamartya-fe85c";
  process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_PROJECT_ID = "bhumiamartya-fe85c";
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "mock.appspot.com";
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "1234567890";
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "1:1234567890:web:abcdef";
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS = "false";
  process.env.NEXT_PUBLIC_USE_AUTH_EMULATOR = "false";
  process.env.NEXT_PUBLIC_USE_FIRESTORE_EMULATOR = "false";
  process.env.NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR = "false";
  process.env.NODE_ENV = "test";
  process.env.BHUMI_TEST_PLATFORM = "android";

  // Dynamic imports to ensure env vars are populated when config initializes
  const { generateEs256KeyPair } = await import("../../services/billing-verifier/scripts/generateKeys");
  const { generateSignedEntitlement } = await import("../../services/billing-verifier/lib/signedEntitlement");
  const { verifySignedEntitlementLocal } = await import("../../lib/billing/googlePlayBilling");

  // Mock Capacitor globally for testing in Node
  (globalThis as any).Capacitor = {
    getPlatform: () => "android",
  };

  // Mock Preferences globally
  (globalThis as any).Preferences = {
    get: async () => ({ value: null }),
    set: async () => {},
    remove: async () => {},
  };

  // Mock navigator.onLine
  let isOnline = true;
  Object.defineProperty(globalThis, "navigator", {
    value: {
      get onLine() {
        return isOnline;
      },
    },
    configurable: true,
  });

  const keys = generateEs256KeyPair();
  process.env.ENTITLEMENT_PRIVATE_KEY = keys.privateKey;
  process.env.NEXT_PUBLIC_ENTITLEMENT_PUBLIC_KEY = keys.publicKey;

  const uid = "user-grace-123";
  const productId = "bhumi_premium_monthly";

  await test("valid token within 24h window (online or offline)", async () => {
    isOnline = true;
    const token = generateSignedEntitlement({
      sub: uid,
      productId,
      status: "ACTIVE",
      exp: Math.floor(Date.now() / 1000) + 3600,
      jti: "jti-1",
      syncStatus: "ACTIVE_SYNCED",
    });

    const verifiedOnline = await verifySignedEntitlementLocal(token, uid);
    assert.equal(verifiedOnline, true, "Valid unexpired token verifies online");

    isOnline = false;
    const verifiedOffline = await verifySignedEntitlementLocal(token, uid);
    assert.equal(verifiedOffline, true, "Valid unexpired token verifies offline");
  });

  await test("expired token within 72h offline grace (offline) is allowed", async () => {
    isOnline = false;
    // Token issued 30 hours ago, expired 6 hours ago (TTL was 24h)
    const iat = Math.floor(Date.now() / 1000) - 30 * 3600;
    const exp = iat + 24 * 3600;

    const token = generateSignedEntitlement({
      sub: uid,
      productId,
      status: "ACTIVE",
      exp,
      jti: "jti-grace-1",
      syncStatus: "ACTIVE_SYNCED",
    });

    // Override iat/exp
    const parts = token.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    payload.iat = iat;
    payload.exp = exp;
    parts[1] = Buffer.from(JSON.stringify(payload)).toString("base64url");

    // Resign using Node crypto
    const crypto = await import("node:crypto");
    const privateKey = crypto.createPrivateKey(keys.privateKey);
    const signatureBuffer = crypto.sign("sha256", Buffer.from(`${parts[0]}.${parts[1]}`), {
      key: privateKey,
      dsaEncoding: "ieee-p1363",
    });
    parts[2] = signatureBuffer.toString("base64url");
    const signedToken = parts.join(".");

    const verified = await verifySignedEntitlementLocal(signedToken, uid);
    assert.equal(verified, true, "Expired token within 72h offline grace is accepted when offline");
  });

  await test("expired token within 72h offline grace (online) is rejected (forces refresh)", async () => {
    isOnline = true;
    const iat = Math.floor(Date.now() / 1000) - 30 * 3600;
    const exp = iat + 24 * 3600;

    const token = generateSignedEntitlement({
      sub: uid,
      productId,
      status: "ACTIVE",
      exp,
      jti: "jti-grace-2",
      syncStatus: "ACTIVE_SYNCED",
    });

    const parts = token.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    payload.iat = iat;
    payload.exp = exp;
    parts[1] = Buffer.from(JSON.stringify(payload)).toString("base64url");

    const crypto = await import("node:crypto");
    const privateKey = crypto.createPrivateKey(keys.privateKey);
    const signatureBuffer = crypto.sign("sha256", Buffer.from(`${parts[0]}.${parts[1]}`), {
      key: privateKey,
      dsaEncoding: "ieee-p1363",
    });
    parts[2] = signatureBuffer.toString("base64url");
    const signedToken = parts.join(".");

    const verified = await verifySignedEntitlementLocal(signedToken, uid);
    assert.equal(verified, false, "Expired token within 72h offline grace is rejected when online");
  });

  await test("token beyond 72h limit (offline) is rejected", async () => {
    isOnline = false;
    const iat = Math.floor(Date.now() / 1000) - 73 * 3600; // 73 hours ago
    const exp = iat + 24 * 3600;

    const token = generateSignedEntitlement({
      sub: uid,
      productId,
      status: "ACTIVE",
      exp,
      jti: "jti-grace-3",
      syncStatus: "ACTIVE_SYNCED",
    });

    const parts = token.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    payload.iat = iat;
    payload.exp = exp;
    parts[1] = Buffer.from(JSON.stringify(payload)).toString("base64url");

    const crypto = await import("node:crypto");
    const privateKey = crypto.createPrivateKey(keys.privateKey);
    const signatureBuffer = crypto.sign("sha256", Buffer.from(`${parts[0]}.${parts[1]}`), {
      key: privateKey,
      dsaEncoding: "ieee-p1363",
    });
    parts[2] = signatureBuffer.toString("base64url");
    const signedToken = parts.join(".");

    const verified = await verifySignedEntitlementLocal(signedToken, uid);
    assert.equal(verified, false, "Token beyond 72h limit is rejected");
  });

  await test("user switches UID during grace -> rejected", async () => {
    isOnline = false;
    const token = generateSignedEntitlement({
      sub: uid,
      productId,
      status: "ACTIVE",
      exp: Math.floor(Date.now() / 1000) + 3600,
      jti: "jti-grace-4",
      syncStatus: "ACTIVE_SYNCED",
    });

    const verified = await verifySignedEntitlementLocal(token, "different-uid");
    assert.equal(verified, false, "Mismatched UID is rejected");
  });

  await test("clock moved forward beyond 72h grace => rejected", async () => {
    isOnline = false;
    const iat = Math.floor(Date.now() / 1000) - 10 * 3600;
    const exp = iat + 24 * 3600;

    const token = generateSignedEntitlement({
      sub: uid,
      productId,
      status: "ACTIVE",
      exp,
      jti: "jti-grace-forward",
      syncStatus: "ACTIVE_SYNCED",
    });

    // simulate device clock moved forward by editing claims to old iat/exp
    const parts = token.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    payload.iat = Math.floor(Date.now() / 1000) - 80 * 3600;
    payload.exp = payload.iat + 24 * 3600;
    parts[1] = Buffer.from(JSON.stringify(payload)).toString("base64url");

    const crypto = await import("node:crypto");
    const privateKey = crypto.createPrivateKey(keys.privateKey);
    const signatureBuffer = crypto.sign("sha256", Buffer.from(`${parts[0]}.${parts[1]}`), {
      key: privateKey,
      dsaEncoding: "ieee-p1363",
    });
    parts[2] = signatureBuffer.toString("base64url");
    const signedToken = parts.join(".");

    const verified = await verifySignedEntitlementLocal(signedToken, uid);
    assert.equal(verified, false, "Clock-forward beyond grace gets rejected");
  });

  await test("clock moved backward but token still within 24h validity => accepted", async () => {
    isOnline = false;
    const token = generateSignedEntitlement({
      sub: uid,
      productId,
      status: "ACTIVE",
      exp: Math.floor(Date.now() / 1000) + 3600,
      jti: "jti-grace-backward",
      syncStatus: "ACTIVE_SYNCED",
    });

    const verified = await verifySignedEntitlementLocal(token, uid);
    assert.equal(verified, true, "Valid token remains accepted despite backward clock scenario");
  });

  console.log(`BUILD84_OFFLINE_GRACE_PASS tests=${passed}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
