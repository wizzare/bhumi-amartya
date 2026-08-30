import { check, runSuite } from "../helpers/assertHarness";

type SubscriptionDecision = {
  active: boolean;
  entitlementStatus: string;
  reason: string;
};

function buildEntitlementDecision(subscriptionState: string, expiryTime: number | null): SubscriptionDecision {
  const activeStates = new Set(["SUBSCRIPTION_STATE_ACTIVE", "SUBSCRIPTION_STATE_IN_GRACE_PERIOD"]);
  const now = Date.now();
  const active = activeStates.has(subscriptionState) && Boolean(expiryTime && expiryTime > now);

  if (active) {
    return { active: true, entitlementStatus: "active", reason: "verified_active" };
  }
  return { active: false, entitlementStatus: "expired_or_pending", reason: "inactive_state" };
}

function validateTokenOwnership(existingTokenData: { uid: string } | null, callerUid: string) {
  if (!existingTokenData || !existingTokenData.uid) return { ok: true, idempotent: false };
  if (existingTokenData.uid === callerUid) return { ok: true, idempotent: true };
  return { ok: false, idempotent: false, reason: "purchase_token_already_linked_to_another_uid" };
}

function runTests() {
  console.log("==================================================");
  console.log("RUNNING BILLING SERVER STATE MACHINE UNIT TESTS");
  console.log("==================================================");

  // Test 1: PENDING
  const d1 = buildEntitlementDecision("SUBSCRIPTION_STATE_PENDING", Date.now() + 10000);
  check(d1.active === false, "Test 1 Failed: PENDING must not be active");
  console.log("✓ Test 1 Passed: PENDING state does not grant entitlement.");

  // Test 2: ACTIVE
  const d2 = buildEntitlementDecision("SUBSCRIPTION_STATE_ACTIVE", Date.now() + 86400000);
  check(d2.active === true, "Test 2 Failed: ACTIVE must be active");
  console.log("✓ Test 2 Passed: ACTIVE state grants entitlement.");

  // Test 3: Idempotent same UID
  const c1 = validateTokenOwnership({ uid: "user_123" }, "user_123");
  check(c1.ok === true && c1.idempotent === true, "Test 3 Failed: Same UID must be idempotent");
  console.log("✓ Test 3 Passed: Re-verifying same token by same UID is idempotent.");

  // Test 4: Rejected different UID
  const c2 = validateTokenOwnership({ uid: "user_123" }, "user_456");
  check(c2.ok === false, "Test 4 Failed: Different UID must be rejected");
  console.log("✓ Test 4 Passed: Token registered to another UID is rejected.");

  console.log("\n==================================================");
  console.log("ALL BILLING SERVER STATE MACHINE TESTS PASSED");
  console.log("==================================================");
}

runSuite("billing_server_state_machine", runTests);
