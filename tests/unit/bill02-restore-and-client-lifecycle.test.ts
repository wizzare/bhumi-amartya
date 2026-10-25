import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { generateKeyPairSync, randomUUID } from "node:crypto";

// Setup environment before any imports
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

const ecKeys = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
const privKeyPem = ecKeys.privateKey.export({ type: "pkcs8", format: "pem" }).toString();
const pubKeyPem = ecKeys.publicKey.export({ type: "spki", format: "pem" }).toString();
process.env.ENTITLEMENT_PRIVATE_KEY = privKeyPem;
process.env.ENTITLEMENT_PUBLIC_KEY = pubKeyPem;
process.env.NEXT_PUBLIC_ENTITLEMENT_PUBLIC_KEY = pubKeyPem;

const require = createRequire(import.meta.url);
const Module = require("node:module");
const originalLoad = Module._load;

let currentPlatform = "android";
const stored = new Map<string, string>();
const prefStored = new Map<string, string>();

let currentUser: { uid: string; getIdToken: () => Promise<string> } | null = {
  uid: "test-uid-user-1",
  getIdToken: async () => "mock-id-token-user-1",
};

const listeners = new Map<string, (...args: any[]) => any>();
let mockPurchasesOnDevice: any[] = [];
let queryCount = 0;
let restoreTimeoutTrigger = false;

const mockPlugin = {
  initialize: async () => ({ connected: true, productId: "bhumi_premium_monthly", basePlanId: "monthly" }),
  queryPremiumSubscription: async () => ({ productId: "bhumi_premium_monthly" }),
  purchasePremium: async () => ({ purchases: mockPurchasesOnDevice }),
  restorePurchases: async () => {
    queryCount++;
    if (restoreTimeoutTrigger) {
      // Simulate timeout by returning a promise that never resolves or rejects with TIMEOUT
      const err = new Error("Restore timed out.");
      (err as any).code = "TIMEOUT";
      throw err;
    }
    return { purchases: mockPurchasesOnDevice };
  },
  addListener: async (name: string, callback: (...args: any[]) => any) => {
    listeners.set(name, callback);
    return { remove: () => { listeners.delete(name); } };
  },
};

Module._load = function(request: string, parent: unknown, ...args: unknown[]) {
  if (request === "@capacitor/core") {
    return {
      Capacitor: {
        getPlatform: () => currentPlatform,
        isNativePlatform: () => currentPlatform === "android",
      },
      registerPlugin: (name: string) => {
        if (name === "SecureStorage") {
          return {
            set: async ({ key, value }: { key: string; value: string }) => {
              stored.set(key, value);
              return { value: true };
            },
            get: async ({ key }: { key: string }) => ({ value: stored.get(key) || null }),
            remove: async ({ key }: { key: string }) => {
              stored.delete(key);
              return { value: true };
            },
          };
        }
        return mockPlugin;
      },
    };
  }
  if (request === "@/lib/firebase/firebase") {
    return {
      auth: {
        get currentUser() { return currentUser; },
        authStateReady: async () => {},
        onAuthStateChanged: (cb: (u: any) => void) => {
          cb(currentUser);
          return () => {};
        },
      },
    };
  }
  if (request === "@capacitor/preferences") {
    return {
      Preferences: {
        set: async ({ key, value }: { key: string; value: string }) => { prefStored.set(key, value); },
        get: async ({ key }: { key: string }) => ({ value: prefStored.get(key) || null }),
        remove: async ({ key }: { key: string }) => { prefStored.delete(key); },
      },
    };
  }
  return originalLoad.call(this, request, parent, ...args);
};

const {
  recoverAndRefreshPremiumPurchases,
  orchestratePremiumRestore,
} = require("../../lib/billing/premiumRecovery");

const {
  isGooglePlayBillingAvailable,
  restorePremiumPurchases,
  restoreAndRecoverPremium,
  autoRecoverActiveSubscriptions,
  handleUserLogout,
  verifySignedEntitlementLocal,
  clearOnPostVerification,
  setOnPostVerification,
  GOOGLE_PLAY_PRODUCT_ID,
} = require("../../lib/billing/googlePlayBilling");

const { generateSignedEntitlement } = require("../../services/billing-verifier/lib/signedEntitlement");

// Define navigator.onLine for test environment
let isOnline = true;
Object.defineProperty(globalThis, "navigator", {
  value: {
    get onLine() {
      return isOnline;
    },
  },
  configurable: true,
});

function resetFixtures() {
  process.env.BHUMI_TEST_PLATFORM = "android";
  currentPlatform = "android";
  isOnline = true;
  stored.clear();
  prefStored.clear();
  listeners.clear();
  mockPurchasesOnDevice = [];
  queryCount = 0;
  restoreTimeoutTrigger = false;
  currentUser = {
    uid: "test-uid-user-1",
    getIdToken: async () => "mock-id-token-user-1",
  };
  clearOnPostVerification();
}

// ---------------------------------------------------------------------
// BILL02-01: Restore active purchase belonging to same UID
// ---------------------------------------------------------------------
test("BILL02-01: Restore active purchase belonging to same UID -> ACCESS_ACTIVE", async () => {
  resetFixtures();
  let refreshCalled = false;

  const purchases = [
    { purchaseToken: "token-active-01", products: [GOOGLE_PLAY_PRODUCT_ID], purchaseState: 1 },
  ];

  const verifyMock = async (p: any) => {
    assert.equal(p.purchaseToken, "token-active-01");
    return { ok: true, active: true, status: "ACTIVE" };
  };

  const refreshMock = async () => {
    refreshCalled = true;
  };

  const result = await recoverAndRefreshPremiumPurchases(
    purchases,
    GOOGLE_PLAY_PRODUCT_ID,
    verifyMock,
    refreshMock,
    false
  );

  assert.equal(result.state, "ACCESS_ACTIVE");
  assert.equal(result.verified, 1);
  assert.equal(result.verifiedAny, true);
  assert.equal(result.accessActive, true);
  assert.equal(refreshCalled, true);
});

// ---------------------------------------------------------------------
// BILL02-02: Restore finds no purchase on Google Play
// ---------------------------------------------------------------------
test("BILL02-02: Restore finds no purchase on Google Play -> NO_ACTIVE_PURCHASE", async () => {
  resetFixtures();
  let refreshCalled = false;

  const result = await orchestratePremiumRestore(
    async () => ({ purchases: [] }),
    {
      productId: GOOGLE_PLAY_PRODUCT_ID,
      verify: async () => ({ ok: true, active: true }),
      refresh: async () => { refreshCalled = true; },
      existingAccessActive: false,
    }
  );

  assert.equal(result.state, "NO_ACTIVE_PURCHASE");
  assert.equal(result.attempted, 0);
  assert.equal(result.verified, 0);
  assert.equal(result.accessActive, false);
  assert.equal(refreshCalled, false);
});

// ---------------------------------------------------------------------
// BILL02-03: Restore finds expired token
// ---------------------------------------------------------------------
test("BILL02-03: Restore finds expired token -> PERMANENT_VERIFICATION_FAILURE & accessActive false", async () => {
  resetFixtures();
  let refreshCalled = false;

  const purchases = [
    { purchaseToken: "token-expired-01", products: [GOOGLE_PLAY_PRODUCT_ID], purchaseState: 1 },
  ];

  const verifyMock = async () => ({ ok: true, active: false, status: "EXPIRED" });

  const result = await recoverAndRefreshPremiumPurchases(
    purchases,
    GOOGLE_PLAY_PRODUCT_ID,
    verifyMock,
    async () => { refreshCalled = true; },
    false
  );

  assert.equal(result.state, "PERMANENT_VERIFICATION_FAILURE");
  assert.equal(result.verified, 0);
  assert.equal(result.permanentFailures, 1);
  assert.equal(result.accessActive, false);
  assert.equal(refreshCalled, false);
});

// ---------------------------------------------------------------------
// BILL02-04: Restore finds token bound to another UID
// ---------------------------------------------------------------------
test("BILL02-04: Restore finds token bound to another UID -> PERSISTENCE_FAILURE & access denied", async () => {
  resetFixtures();

  const purchases = [
    { purchaseToken: "token-owned-by-user-2", products: [GOOGLE_PLAY_PRODUCT_ID], purchaseState: 1 },
  ];

  const verifyMock = async () => {
    const err = new Error("TOKEN_OWNERSHIP_CONFLICT");
    (err as any).code = "TOKEN_OWNERSHIP_CONFLICT";
    (err as any).status = 409;
    throw err;
  };

  const result = await recoverAndRefreshPremiumPurchases(
    purchases,
    GOOGLE_PLAY_PRODUCT_ID,
    verifyMock,
    async () => {},
    false
  );

  assert.equal(result.state, "PERSISTENCE_FAILURE");
  assert.equal(result.verified, 0);
  assert.equal(result.accessActive, false);
});

// ---------------------------------------------------------------------
// BILL02-05: Restore finds mixed active and expired tokens
// ---------------------------------------------------------------------
test("BILL02-05: Restore finds mixed active and expired tokens -> ACCESS_ACTIVE", async () => {
  resetFixtures();
  let refreshCalled = false;

  const purchases = [
    { purchaseToken: "token-old-expired", products: [GOOGLE_PLAY_PRODUCT_ID], purchaseState: 1 },
    { purchaseToken: "token-new-active", products: [GOOGLE_PLAY_PRODUCT_ID], purchaseState: 1 },
  ];

  const verifyMock = async (p: any) => {
    if (p.purchaseToken === "token-old-expired") {
      return { ok: true, active: false, status: "EXPIRED" };
    }
    return { ok: true, active: true, status: "ACTIVE" };
  };

  const result = await recoverAndRefreshPremiumPurchases(
    purchases,
    GOOGLE_PLAY_PRODUCT_ID,
    verifyMock,
    async () => { refreshCalled = true; },
    false
  );

  assert.equal(result.state, "ACCESS_ACTIVE");
  assert.equal(result.verified, 1);
  assert.equal(result.permanentFailures, 1);
  assert.equal(result.accessActive, true);
  assert.equal(refreshCalled, true);
});

// ---------------------------------------------------------------------
// BILL02-06: Restore called twice concurrently
// ---------------------------------------------------------------------
test("BILL02-06: Concurrent auto-recovery calls are deduplicated via activeRecoveryPromise", async () => {
  resetFixtures();
  mockPurchasesOnDevice = [
    { purchaseToken: "concurrent-tok", products: [GOOGLE_PLAY_PRODUCT_ID], purchaseState: 1 },
  ];

  let verifications = 0;
  setOnPostVerification(async () => {});

  // Intercept fetch for verifier
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    verifications++;
    await new Promise((r) => setTimeout(r, 20));
    return Response.json({ ok: true, active: true, signedEntitlement: "sig-ent" });
  }) as any;

  try {
    const [res1, res2] = await Promise.all([
      autoRecoverActiveSubscriptions(),
      autoRecoverActiveSubscriptions(),
    ]);

    // Both should receive the exact same recovery result without querying twice
    assert.equal(queryCount, 1, "Native restorePurchases must be queried exactly once");
    assert.equal(res1.recoveredCount, 1);
    assert.equal(res2.recoveredCount, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ---------------------------------------------------------------------
// BILL02-07: Logout in middle of restore
// ---------------------------------------------------------------------
test("BILL02-07: Logout in middle of restore -> AUTH_CHANGED invariant discards response", async () => {
  resetFixtures();
  let refreshCalled = false;

  const purchases = [
    { purchaseToken: "tok-logout-race", products: [GOOGLE_PLAY_PRODUCT_ID], purchaseState: 1 },
  ];

  const verifyMock = async () => {
    // User logs out while verifier is in-flight
    currentUser = null;
    return { ok: true, active: true, status: "ACTIVE" };
  };

  const refreshMock = async () => {
    // Refresh checks auth invariant
    if (!currentUser) throw new Error("AUTH_CHANGED");
    refreshCalled = true;
  };

  const result = await recoverAndRefreshPremiumPurchases(
    purchases,
    GOOGLE_PLAY_PRODUCT_ID,
    verifyMock,
    refreshMock,
    false
  );

  assert.equal(refreshCalled, false);
  assert.equal(result.state, "PROFILE_REFRESH_FAILURE");
  assert.equal(result.accessActive, false);
});

// ---------------------------------------------------------------------
// BILL02-08: Login other UID before restore response completes
// ---------------------------------------------------------------------
test("BILL02-08: Login other UID before restore completes -> AUTH_CHANGED & zero leakage", async () => {
  resetFixtures();
  const originalUid = "uid-account-A";
  currentUser = { uid: originalUid, getIdToken: async () => "token-A" };
  let refreshCalled = false;

  const purchases = [
    { purchaseToken: "tok-user-A", products: [GOOGLE_PLAY_PRODUCT_ID], purchaseState: 1 },
  ];

  const verifyMock = async () => {
    // User A logs out and User B logs in during request
    currentUser = { uid: "uid-account-B", getIdToken: async () => "token-B" };
    return { ok: true, active: true, status: "ACTIVE" };
  };

  const refreshMock = async () => {
    if (currentUser?.uid !== originalUid) throw new Error("AUTH_CHANGED");
    refreshCalled = true;
  };

  const result = await recoverAndRefreshPremiumPurchases(
    purchases,
    GOOGLE_PLAY_PRODUCT_ID,
    verifyMock,
    refreshMock,
    false
  );

  assert.equal(refreshCalled, false, "Refresh must NOT run for changed account");
  assert.equal(result.state, "PROFILE_REFRESH_FAILURE");
  assert.equal(result.accessActive, false, "Access must not leak to new account");
});

// ---------------------------------------------------------------------
// BILL02-09: Google Play unreachable
// ---------------------------------------------------------------------
test("BILL02-09: Google Play unreachable / network failure -> RETRYABLE_VERIFICATION_FAILURE", async () => {
  resetFixtures();

  const purchases = [
    { purchaseToken: "tok-unreachable", products: [GOOGLE_PLAY_PRODUCT_ID], purchaseState: 1 },
  ];

  const verifyMock = async () => {
    throw new TypeError("Failed to fetch (offline / network down)");
  };

  const result = await recoverAndRefreshPremiumPurchases(
    purchases,
    GOOGLE_PLAY_PRODUCT_ID,
    verifyMock,
    async () => {},
    false
  );

  assert.equal(result.state, "RETRYABLE_VERIFICATION_FAILURE");
  assert.equal(result.retryableFailures, 1);
  assert.equal(result.accessActive, false);
});

// ---------------------------------------------------------------------
// BILL02-10: Verifier succeeds, but Firestore write fails
// ---------------------------------------------------------------------
test("BILL02-10: Verifier / persistence failure -> PERSISTENCE_FAILURE & fail closed", async () => {
  resetFixtures();

  const purchases = [
    { purchaseToken: "tok-firestore-fail", products: [GOOGLE_PLAY_PRODUCT_ID], purchaseState: 1 },
  ];

  const verifyMock = async () => {
    const err = new Error("ENTITLEMENT_WRITE_FAILURE");
    (err as any).code = "ENTITLEMENT_WRITE_FAILURE";
    (err as any).status = 500;
    throw err;
  };

  const result = await recoverAndRefreshPremiumPurchases(
    purchases,
    GOOGLE_PLAY_PRODUCT_ID,
    verifyMock,
    async () => {},
    false
  );

  assert.equal(result.state, "PERSISTENCE_FAILURE");
  assert.equal(result.accessActive, false);
});

// ---------------------------------------------------------------------
// BILL02-11: Firestore succeeds, HTTP response lost -> retry succeeds idempotently
// ---------------------------------------------------------------------
test("BILL02-11: Dropped response recovery -> retry succeeds idempotently", async () => {
  resetFixtures();
  let attempt = 1;

  const purchases = [
    { purchaseToken: "tok-dropped-response", products: [GOOGLE_PLAY_PRODUCT_ID], purchaseState: 1 },
  ];

  const verifyMock = async () => {
    if (attempt === 1) {
      attempt++;
      throw new TypeError("Network error: connection reset after server write");
    }
    // On retry, server already has record, returns 200 idempotently
    return { ok: true, active: true, status: "ACTIVE" };
  };

  // First attempt fails retryable
  const res1 = await recoverAndRefreshPremiumPurchases(
    purchases,
    GOOGLE_PLAY_PRODUCT_ID,
    verifyMock,
    async () => {},
    false
  );
  assert.equal(res1.state, "RETRYABLE_VERIFICATION_FAILURE");

  // User / client retries
  let refreshCalled = false;
  const res2 = await recoverAndRefreshPremiumPurchases(
    purchases,
    GOOGLE_PLAY_PRODUCT_ID,
    verifyMock,
    async () => { refreshCalled = true; },
    false
  );
  assert.equal(res2.state, "ACCESS_ACTIVE");
  assert.equal(res2.accessActive, true);
  assert.equal(refreshCalled, true);
});

// ---------------------------------------------------------------------
// BILL02-12: User retries restore after timeout
// ---------------------------------------------------------------------
test("BILL02-12: User retries restore after timeout -> safe recovery", async () => {
  resetFixtures();
  restoreTimeoutTrigger = true;

  // First restore times out
  await assert.rejects(restorePremiumPurchases(), (err: any) => {
    assert.equal(err.code, "TIMEOUT");
    return true;
  });

  // Second attempt: timeout cleared
  restoreTimeoutTrigger = false;
  mockPurchasesOnDevice = [
    { purchaseToken: "tok-timeout-retry", products: [GOOGLE_PLAY_PRODUCT_ID], purchaseState: 1 },
  ];

  const restored = await restorePremiumPurchases();
  assert.equal(restored.purchases.length, 1);
  assert.equal(restored.purchases[0].purchaseToken, "tok-timeout-retry");

  let refreshCalled = false;
  const result = await recoverAndRefreshPremiumPurchases(
    restored.purchases,
    GOOGLE_PLAY_PRODUCT_ID,
    async () => ({ ok: true, active: true, status: "ACTIVE" }),
    async () => { refreshCalled = true; },
    false
  );

  assert.equal(result.state, "ACCESS_ACTIVE");
  assert.equal(result.accessActive, true);
  assert.equal(refreshCalled, true);
});

// ---------------------------------------------------------------------
// CLIENT BOUNDARY 01: Web platform fails closed
// ---------------------------------------------------------------------
test("CLIENT-01: Web platform fails closed without throwing", async () => {
  resetFixtures();
  process.env.BHUMI_TEST_PLATFORM = "web";
  currentPlatform = "web";

  // isGooglePlayBillingAvailable must return false on Web
  assert.equal(isGooglePlayBillingAvailable(), false);

  // verifySignedEntitlementLocal must fail closed on Web
  const testSigned = generateSignedEntitlement({
    sub: "test-uid-user-1",
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    exp: Math.floor(Date.now() / 1000) + 3600,
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  });

  const valid = await verifySignedEntitlementLocal(testSigned, "test-uid-user-1");
  assert.equal(valid, false, "Signed entitlement validation must fail closed on Web");

  process.env.BHUMI_TEST_PLATFORM = "android";
});

// ---------------------------------------------------------------------
// CLIENT BOUNDARY 02: SecureStorage UID partitioning
// ---------------------------------------------------------------------
test("CLIENT-02: SecureStorage UID partitioning prevents cross-account entitlement leakage", async () => {
  resetFixtures();
  const uidA = "uid-alice";
  const uidB = "uid-bob";

  // Alice stores entitlement
  stored.set(`signed_entitlement_${uidA}`, "alice-signed-token");
  prefStored.set(`last_entitlement_sync_${uidA}`, "2026-08-15T12:00:00Z");

  // Bob stores entitlement
  stored.set(`signed_entitlement_${uidB}`, "bob-signed-token");
  prefStored.set(`last_entitlement_sync_${uidB}`, "2026-08-15T12:00:00Z");

  // Alice logs out
  await handleUserLogout(uidA);

  // Alice's entitlement is wiped
  assert.equal(stored.get(`signed_entitlement_${uidA}`), undefined);
  assert.equal(prefStored.get(`last_entitlement_sync_${uidA}`), undefined);

  // Bob's entitlement is completely untouched
  assert.equal(stored.get(`signed_entitlement_${uidB}`), "bob-signed-token");
  assert.equal(prefStored.get(`last_entitlement_sync_${uidB}`), "2026-08-15T12:00:00Z");
});

// ---------------------------------------------------------------------
// CLIENT BOUNDARY 03: Offline signed entitlement validation (ECDSA)
// ---------------------------------------------------------------------
test("CLIENT-03: verifySignedEntitlementLocal validates signature & checks claims correctly", async () => {
  resetFixtures();
  currentPlatform = "android";

  const validToken = generateSignedEntitlement({
    sub: "test-uid-user-1",
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    exp: Math.floor(Date.now() / 1000) + 3600,
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  });

  // Valid token matching currentUser
  const ok = await verifySignedEntitlementLocal(validToken, "test-uid-user-1");
  assert.equal(ok, true, "Signature and claims must verify for matching UID");

  // Token presented for wrong UID -> fails closed
  const mismatchOk = await verifySignedEntitlementLocal(validToken, "different-uid");
  assert.equal(mismatchOk, false, "Mismatched UID claim must fail closed");

  // Expired token when online -> fails closed
  const expiredToken = generateSignedEntitlement({
    sub: "test-uid-user-1",
    productId: GOOGLE_PLAY_PRODUCT_ID,
    status: "ACTIVE",
    exp: Math.floor(Date.now() / 1000) - 100, // expired 100s ago
    jti: randomUUID(),
    syncStatus: "ACTIVE_SYNCED",
  });

  const expiredOk = await verifySignedEntitlementLocal(expiredToken, "test-uid-user-1");
  assert.equal(expiredOk, false, "Expired token must fail closed when online");
});
