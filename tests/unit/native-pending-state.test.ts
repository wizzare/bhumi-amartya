import assert from "node:assert/strict";
import { recoverAndRefreshPremiumPurchases, type RecoverablePurchase } from "../../lib/billing/premiumRecovery";

const PRODUCT = "bhumi_premium_monthly";
const p = (token: string, state?: number): RecoverablePurchase =>
  ({ purchaseToken: token, products: [PRODUCT], purchaseState: state });

async function runTests() {
  console.log("[TEST START] Native PurchaseState PENDING/PURCHASED/UNSPECIFIED Classification");

  // A. native purchaseState=2 → PAYMENT_PENDING
  {
    const res = await recoverAndRefreshPremiumPurchases(
      [p("tok-pending", 2)], PRODUCT,
      async () => ({ ok: true, active: false, status: "SUBSCRIPTION_PENDING" }),
      async () => {}
    );
    assert.equal(res.state, "PAYMENT_PENDING", "A: purchaseState=2 must yield PAYMENT_PENDING");
    console.log("PASS A: native purchaseState=2 → PAYMENT_PENDING");
  }

  // B. native purchaseState=2 → permanentFailures = 0
  {
    const res = await recoverAndRefreshPremiumPurchases(
      [p("tok-pending-b", 2)], PRODUCT,
      async () => ({ ok: true, active: false, status: "SUBSCRIPTION_PENDING" }),
      async () => {}
    );
    assert.equal(res.permanentFailures, 0, "B: purchaseState=2 must not increment permanentFailures");
    assert.equal(res.pendingCount, 1);
    console.log("PASS B: native purchaseState=2 → permanentFailures=0");
  }

  // C. native purchaseState=2 → verifier HTTP call NOT required
  //    processAndVerifyPurchaseToken must return before fetch is called
  {
    const { processAndVerifyPurchaseToken } = await import("../../lib/billing/googlePlayBilling");
    const originalFetch = globalThis.fetch;
    let fetchCalled = false;
    globalThis.fetch = async () => { fetchCalled = true; return { ok: true, status: 200, json: async () => ({}) } as any; };
    try {
      const res = await processAndVerifyPurchaseToken({ purchaseToken: "tok-c", purchaseState: 2, products: [PRODUCT] });
      assert.equal(fetchCalled, false, "C: verifier fetch must NOT be called for purchaseState=2");
      assert.equal(res.ok, true);
      assert.equal(res.active, false);
      assert.equal((res as any).status, "SUBSCRIPTION_PENDING");
    } finally {
      globalThis.fetch = originalFetch;
    }
    console.log("PASS C: native purchaseState=2 → verifier HTTP call NOT made");
  }

  // D. native purchaseState=2 → Premium NOT granted (accessActive=false)
  {
    const res = await recoverAndRefreshPremiumPurchases(
      [p("tok-d", 2)], PRODUCT,
      async () => ({ ok: true, active: false, status: "SUBSCRIPTION_PENDING" }),
      async () => {}
    );
    assert.equal(res.accessActive, false, "D: purchaseState=2 must not grant Premium");
    assert.equal(res.verifiedAny, false);
    console.log("PASS D: native purchaseState=2 → Premium NOT granted");
  }

  // E. native purchaseState=2 → acknowledgement NOT triggered (refresh not called)
  {
    let refreshCalled = false;
    const res = await recoverAndRefreshPremiumPurchases(
      [p("tok-e", 2)], PRODUCT,
      async () => ({ ok: true, active: false, status: "SUBSCRIPTION_PENDING" }),
      async () => { refreshCalled = true; }
    );
    assert.equal(refreshCalled, false, "E: acknowledgement/refresh must not be triggered for purchaseState=2");
    assert.equal(res.state, "PAYMENT_PENDING");
    console.log("PASS E: native purchaseState=2 → acknowledgement NOT triggered");
  }

  // F. purchaseState=1 → existing verifier path still executes (fetch IS called)
  {
    const { processAndVerifyPurchaseToken } = await import("../../lib/billing/googlePlayBilling");
    const { auth } = await import("../../lib/firebase/firebase");
    const origDesc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(auth), "currentUser")
      || Object.getOwnPropertyDescriptor(auth, "currentUser");
    Object.defineProperty(auth, "currentUser", {
      get() { return { uid: "u1", getIdToken: async () => "tok" }; },
      configurable: true,
    });
    const originalFetch = globalThis.fetch;
    let fetchCalled = false;
    globalThis.fetch = async () => {
      fetchCalled = true;
      return { ok: true, status: 200, json: async () => ({ ok: true, active: true }) } as any;
    };
    try {
      const res = await processAndVerifyPurchaseToken({ purchaseToken: "tok-f", purchaseState: 1, products: [PRODUCT] });
      assert.equal(fetchCalled, true, "F: verifier fetch MUST be called for purchaseState=1");
      assert.equal(res.ok, true);
    } finally {
      globalThis.fetch = originalFetch;
      if (origDesc) Object.defineProperty(auth, "currentUser", origDesc);
      else delete (auth as any).currentUser;
    }
    console.log("PASS F: purchaseState=1 → existing verifier path executes");
  }

  // G. purchaseState=0 → not treated as pending or active
  {
    const res = await recoverAndRefreshPremiumPurchases(
      [p("tok-g", 0)], PRODUCT,
      async () => ({ ok: true, active: true }),
      async () => {}
    );
    // purchaseState=0 excluded by eligibility filter
    assert.equal(res.state, "NO_ACTIVE_PURCHASE", "G: purchaseState=0 must be excluded");
    assert.equal(res.attempted, 0);
    assert.equal(res.pendingCount, 0);
    console.log("PASS G: purchaseState=0 → excluded (NO_ACTIVE_PURCHASE)");
  }

  // H. pending token later appears as purchaseState=1 → verification succeeds normally
  {
    let refreshed = false;
    // First pass: state=2
    const res1 = await recoverAndRefreshPremiumPurchases(
      [p("tok-h", 2)], PRODUCT,
      async () => ({ ok: true, active: false, status: "SUBSCRIPTION_PENDING" }),
      async () => { refreshed = true; }
    );
    assert.equal(res1.state, "PAYMENT_PENDING");
    assert.equal(refreshed, false);
    // Second pass: same token now state=1
    const res2 = await recoverAndRefreshPremiumPurchases(
      [p("tok-h", 1)], PRODUCT,
      async () => ({ ok: true, active: true }),
      async () => { refreshed = true; }
    );
    assert.equal(res2.state, "ACCESS_ACTIVE", "H: same token state=1 must yield ACCESS_ACTIVE");
    assert.equal(refreshed, true);
    console.log("PASS H: pending token later purchaseState=1 → verification succeeds normally");
  }

  // I. active + pending combination → ACCESS_ACTIVE wins
  {
    let refreshCalls = 0;
    const res = await recoverAndRefreshPremiumPurchases(
      [p("tok-active", 1), p("tok-pending", 2)], PRODUCT,
      async (purchase) => {
        if (purchase.purchaseToken === "tok-active") return { ok: true, active: true };
        return { ok: true, active: false, status: "SUBSCRIPTION_PENDING" };
      },
      async () => { refreshCalls++; }
    );
    assert.equal(res.state, "ACCESS_ACTIVE", "I: ACCESS_ACTIVE must take precedence over PAYMENT_PENDING");
    assert.equal(res.pendingCount, 1);
    assert.equal(res.verified, 1);
    assert.equal(refreshCalls, 1);
    console.log("PASS I: active + pending combination → ACCESS_ACTIVE wins (precedence invariant)");
  }

  console.log("ALL NATIVE PENDING STATE TESTS PASSED 9/9");
}

runTests().catch((err) => { console.error(err); process.exit(1); });
