const firebaseEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "test.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1234567890",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:1234567890:web:test",
  NEXT_PUBLIC_BILLING_VERIFIER_URL: "https://verifier.test",
};
for (const [key, value] of Object.entries(firebaseEnv)) {
  if (!process.env[key]) process.env[key] = value;
}

import { recoverAndRefreshPremiumPurchases } from "../../lib/billing/premiumRecovery";
import { processAndVerifyPurchaseToken } from "../../lib/billing/googlePlayBilling";
import { auth } from "../../lib/firebase/firebase";

async function runTests() {
  console.log("[TEST START] Immediate Purchase Auth & State Filtering Unit Tests");

  const verifiedTokens: string[] = [];
  let refreshCalls = 0;

  const mockVerify = async (p: { purchaseToken?: string }) => {
    if (!p.purchaseToken) throw new Error("NO_TOKEN");
    verifiedTokens.push(p.purchaseToken);
    return { ok: true, active: true };
  };

  const mockRefresh = async () => {
    refreshCalls++;
  };

  // Test A: auth.currentUser immediately available -> verifier called
  verifiedTokens.length = 0;
  const testA = await recoverAndRefreshPremiumPurchases(
    [{ purchaseToken: "token-purchased-1", products: ["bhumi_premium_monthly"], purchaseState: 1 }],
    "bhumi_premium_monthly",
    mockVerify,
    mockRefresh
  );
  if (testA.state !== "ACCESS_ACTIVE" || verifiedTokens[0] !== "token-purchased-1") {
    throw new Error(`Test A FAILED: expected ACCESS_ACTIVE, got ${testA.state}`);
  }
  console.log("PASS: Test A - auth.currentUser immediately available -> verifier called");

  // Helper for auth property mocking
  let overrideUser: any = undefined; // undefined = default
  const proto = Object.getPrototypeOf(auth);
  const origDesc = Object.getOwnPropertyDescriptor(proto, "currentUser") || Object.getOwnPropertyDescriptor(auth, "currentUser");

  Object.defineProperty(auth, "currentUser", {
    get() {
      if (overrideUser !== undefined) return overrideUser;
      return origDesc ? origDesc.get?.call(auth) : null;
    },
    set(v) {
      if (origDesc && origDesc.set) {
        origDesc.set.call(auth, v);
      }
    },
    configurable: true,
  });

  const dummyUser = {
    uid: "test-user-b",
    getIdToken: async () => "mock-token",
    _stopProactiveRefresh: () => {},
  };

  // Test B1: auth.currentUser null initially, resolves via authStateReady -> verifier called
  {
    const originalAuthStateReady = (auth as any).authStateReady;
    try {
      overrideUser = null;
      (auth as any).authStateReady = async () => {
        overrideUser = dummyUser;
      };

      const globalFetch = globalThis.fetch;
      let fetchCalled = false;
      globalThis.fetch = (async () => {
        fetchCalled = true;
        return {
          ok: true,
          status: 200,
          json: async () => ({ ok: true, active: true }),
        } as any;
      }) as any;

      const res = await processAndVerifyPurchaseToken({ purchaseToken: "token-b1", purchaseState: 1 });
      globalThis.fetch = globalFetch;

      if (!res.ok || !fetchCalled) {
        throw new Error("Test B1 FAILED: processAndVerifyPurchaseToken did not call verifier after authStateReady resolved");
      }
      console.log("PASS: Test B1 - auth.currentUser null initially, resolves via authStateReady -> verifier called");
    } finally {
      overrideUser = undefined;
      (auth as any).authStateReady = originalAuthStateReady;
    }
  }

  // Test B2 (Focused Regression): authStateReady resolves STILL null -> onAuthStateChanged listener emits user -> unsubscribes -> verifier called
  {
    const originalAuthStateReady = (auth as any).authStateReady;
    const originalOnAuthStateChanged = (auth as any).onAuthStateChanged;
    let unsubscribed = false;
    try {
      overrideUser = null;
      (auth as any).authStateReady = async () => {}; // resolves, but user remains null
      (auth as any).onAuthStateChanged = (cb: (u: any) => void) => {
        const t = setTimeout(() => {
          overrideUser = dummyUser;
          cb(dummyUser);
        }, 50);
        return () => {
          clearTimeout(t);
          unsubscribed = true;
        };
      };

      const globalFetch = globalThis.fetch;
      let fetchCalled = false;
      globalThis.fetch = (async () => {
        fetchCalled = true;
        return {
          ok: true,
          status: 200,
          json: async () => ({ ok: true, active: true }),
        } as any;
      }) as any;

      const res = await processAndVerifyPurchaseToken({ purchaseToken: "token-b2", purchaseState: 1 });
      globalThis.fetch = globalFetch;

      if (!res.ok || !fetchCalled) {
        throw new Error("Test B2 FAILED: verifier not called after onAuthStateChanged user emission");
      }
      if (!unsubscribed) {
        throw new Error("Test B2 FAILED: onAuthStateChanged listener was not unsubscribed after receiving user");
      }
      console.log("PASS: Test B2 - onAuthStateChanged recovery path resolves user, unsubscribes cleanly -> verifier called");
    } finally {
      overrideUser = undefined;
      (auth as any).authStateReady = originalAuthStateReady;
      (auth as any).onAuthStateChanged = originalOnAuthStateChanged;
    }
  }

  // Test C: auth.currentUser remains null after bounded wait -> timeout unsubscribes cleanly -> throws AUTH_MISSING
  {
    const originalAuthStateReady = (auth as any).authStateReady;
    const originalOnAuthStateChanged = (auth as any).onAuthStateChanged;
    let unsubscribedOnTimeout = false;
    try {
      overrideUser = null;
      (auth as any).authStateReady = async () => {};
      (auth as any).onAuthStateChanged = (cb: any) => {
        return () => {
          unsubscribedOnTimeout = true;
        };
      };

      let threw = false;
      try {
        await processAndVerifyPurchaseToken({ purchaseToken: "token-c", purchaseState: 1 });
      } catch (err: any) {
        if (err.message === "AUTH_MISSING") threw = true;
      }
      if (!threw) {
        throw new Error("Test C FAILED: expected AUTH_MISSING error when auth remains null");
      }
      if (!unsubscribedOnTimeout) {
        throw new Error("Test C FAILED: onAuthStateChanged listener was not unsubscribed after timeout");
      }
      console.log("PASS: Test C - auth.currentUser remains null after timeout -> listener unsubscribes cleanly -> throws AUTH_MISSING");
    } finally {
      overrideUser = undefined;
      (auth as any).authStateReady = originalAuthStateReady;
      (auth as any).onAuthStateChanged = originalOnAuthStateChanged;
    }
  }

  // Test D: PURCHASED = 1 -> processed
  verifiedTokens.length = 0;
  const testD = await recoverAndRefreshPremiumPurchases(
    [{ purchaseToken: "token-purchased-1", products: ["bhumi_premium_monthly"], purchaseState: 1 }],
    "bhumi_premium_monthly",
    mockVerify,
    mockRefresh
  );
  if (testD.state !== "ACCESS_ACTIVE" || verifiedTokens.length !== 1) {
    throw new Error(`Test D FAILED: expected PURCHASED=1 to be processed`);
  }
  console.log("PASS: Test D - PURCHASED = 1 -> processed");

  // Test E: PENDING = 2 → PAYMENT_PENDING (processed as transitional, not passed to verifier)
  verifiedTokens.length = 0;
  const pendingVerifyMock = async (p: { purchaseToken?: string }) => {
    verifiedTokens.push(p.purchaseToken!);
    return { ok: true, active: false, status: "SUBSCRIPTION_PENDING" };
  };
  const testE = await recoverAndRefreshPremiumPurchases(
    [{ purchaseToken: "token-pending-2", products: ["bhumi_premium_monthly"], purchaseState: 2 }],
    "bhumi_premium_monthly",
    pendingVerifyMock,
    mockRefresh
  );
  if (testE.state !== "PAYMENT_PENDING" || testE.permanentFailures !== 0 || testE.pendingCount !== 1) {
    throw new Error(`Test E FAILED: expected PENDING=2 to yield PAYMENT_PENDING with pendingCount=1, got state=${testE.state} permanentFailures=${testE.permanentFailures} pendingCount=${testE.pendingCount}`);
  }
  console.log("PASS: Test E - PENDING = 2 → PAYMENT_PENDING (transitional, no Premium)");

  // Test F: UNSPECIFIED = 0 -> not processed
  verifiedTokens.length = 0;
  const testF = await recoverAndRefreshPremiumPurchases(
    [{ purchaseToken: "token-unspecified-0", products: ["bhumi_premium_monthly"], purchaseState: 0 }],
    "bhumi_premium_monthly",
    mockVerify,
    mockRefresh
  );
  if (testF.state !== "NO_ACTIVE_PURCHASE" || verifiedTokens.length !== 0) {
    throw new Error(`Test F FAILED: expected UNSPECIFIED=0 to NOT be processed`);
  }
  console.log("PASS: Test F - UNSPECIFIED = 0 -> not processed");

  console.log("ALL UNIT TESTS PASSED 100%");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
