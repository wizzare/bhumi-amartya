import assert from "node:assert/strict";
import { recoverAndRefreshPremiumPurchases, type RecoverablePurchase } from "../../lib/billing/premiumRecovery";

const PRODUCT = "bhumi_premium_monthly";
const purchase = (token: string): RecoverablePurchase => ({ purchaseToken: token, products: [PRODUCT] });

async function runTests() {
  console.log("[TEST START] Pending Purchase Recovery & Classification Unit Tests");

  // 1. active:true -> VERIFIED / ACCESS_ACTIVE
  {
    let refreshes = 0;
    const res = await recoverAndRefreshPremiumPurchases(
      [purchase("token-active")],
      PRODUCT,
      async () => ({ ok: true, active: true }),
      async () => { refreshes++; }
    );
    assert.equal(res.state, "ACCESS_ACTIVE");
    assert.equal(res.verified, 1);
    assert.equal(res.permanentFailures, 0);
    assert.equal(res.pendingCount, 0);
    assert.equal(res.accessActive, true);
    assert.equal(res.verifiedAny, true);
    assert.equal(refreshes, 1);
    console.log("PASS 1: active:true -> VERIFIED (ACCESS_ACTIVE)");
  }

  // 2 & 3 & 4. ok:true + active:false + status SUBSCRIPTION_PENDING -> PAYMENT_PENDING, permanentFailures=0, no Premium, no refresh/ack
  {
    let refreshes = 0;
    const res = await recoverAndRefreshPremiumPurchases(
      [purchase("token-pending")],
      PRODUCT,
      async () => ({ ok: true, active: false, status: "SUBSCRIPTION_PENDING" }),
      async () => { refreshes++; }
    );
    assert.equal(res.state, "PAYMENT_PENDING");
    assert.equal(res.verified, 0);
    assert.equal(res.permanentFailures, 0, "permanentFailures must remain 0 for pending purchases");
    assert.equal(res.pendingCount, 1);
    assert.equal(res.accessActive, false, "pending purchase must NOT grant Premium");
    assert.equal(res.verifiedAny, false);
    assert.equal(refreshes, 0, "pending purchase must NOT trigger profile refresh / entitlement persistence");
    console.log("PASS 2-4: ok:true + active:false + status SUBSCRIPTION_PENDING -> PAYMENT_PENDING, permanentFailures=0, no Premium, no refresh");
  }

  // 5. retryable verifier/network failure -> remains RETRYABLE, not pending/permanent
  {
    const res = await recoverAndRefreshPremiumPurchases(
      [purchase("token-retryable")],
      PRODUCT,
      async () => { throw Object.assign(new Error("Network Error"), { retryable: true }); },
      async () => {}
    );
    assert.equal(res.state, "RETRYABLE_VERIFICATION_FAILURE");
    assert.equal(res.retryableFailures, 1);
    assert.equal(res.permanentFailures, 0);
    assert.equal(res.pendingCount, 0);
    assert.equal(res.accessActive, false);
    console.log("PASS 5: retryable verifier/network failure -> RETRYABLE_VERIFICATION_FAILURE");
  }

  // 6. genuinely invalid/expired purchase -> remains PERMANENT_VERIFICATION_FAILURE
  {
    const res = await recoverAndRefreshPremiumPurchases(
      [purchase("token-invalid")],
      PRODUCT,
      async () => ({ ok: true, active: false, status: "EXPIRED" }),
      async () => {}
    );
    assert.equal(res.state, "PERMANENT_VERIFICATION_FAILURE");
    assert.equal(res.permanentFailures, 1);
    assert.equal(res.pendingCount, 0);
    assert.equal(res.accessActive, false);
    console.log("PASS 6: genuinely invalid/expired purchase -> PERMANENT_VERIFICATION_FAILURE");
  }

  // 7. same pending purchase later returns active:true -> normal verification succeeds and Premium is granted
  {
    let isNowActive = false;
    let refreshes = 0;
    const verifyMock = async () => {
      if (isNowActive) {
        return { ok: true, active: true, status: "ACTIVE" };
      }
      return { ok: true, active: false, status: "SUBSCRIPTION_PENDING" };
    };

    // First attempt: pending
    const res1 = await recoverAndRefreshPremiumPurchases([purchase("token-transition")], PRODUCT, verifyMock, async () => { refreshes++; });
    assert.equal(res1.state, "PAYMENT_PENDING");
    assert.equal(res1.accessActive, false);
    assert.equal(refreshes, 0);

    // Second attempt after payment settles: active
    isNowActive = true;
    const res2 = await recoverAndRefreshPremiumPurchases([purchase("token-transition")], PRODUCT, verifyMock, async () => { refreshes++; });
    assert.equal(res2.state, "ACCESS_ACTIVE");
    assert.equal(res2.accessActive, true);
    assert.equal(res2.verified, 1);
    assert.equal(refreshes, 1);
    console.log("PASS 7: pending purchase later settling to active:true -> ACCESS_ACTIVE & Premium granted");
  }

  // 8. Precedence invariant: verified > 0 (ACCESS_ACTIVE) takes precedence over PAYMENT_PENDING
  {
    let refreshes = 0;
    const res = await recoverAndRefreshPremiumPurchases(
      [purchase("token-active-1"), purchase("token-pending-2")],
      PRODUCT,
      async (p) => {
        if (p.purchaseToken === "token-active-1") return { ok: true, active: true, status: "ACTIVE" };
        return { ok: true, active: false, status: "SUBSCRIPTION_PENDING" };
      },
      async () => { refreshes++; }
    );
    assert.equal(res.state, "ACCESS_ACTIVE");
    assert.equal(res.verified, 1);
    assert.equal(res.pendingCount, 1);
    assert.equal(res.accessActive, true);
    assert.equal(refreshes, 1);
    console.log("PASS 8: state-precedence invariant: ACCESS_ACTIVE takes precedence over PAYMENT_PENDING when active purchase exists");
  }

  console.log("ALL PENDING PURCHASE CLASSIFICATION TESTS PASSED 100%");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
