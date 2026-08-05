import assert from "node:assert/strict";
import { shouldCreateAcknowledgementJob, type LedgerTxParams } from "../../services/billing-verifier/lib/purchaseLedger";

let passed = 0;
function check(label: string, actual: boolean, expected: boolean) {
  assert.equal(actual, expected, label);
  passed++;
  console.log(`PASS ${passed}: ${label} => ${expected ? "creates" : "does not create"} ACK job`);
}

const base: Omit<LedgerTxParams, "purchaseState" | "entitlementStatus" | "acknowledged" | "acknowledgementRequired"> = {
  uid: "user-1",
  purchaseToken: "tok-1",
  productId: "bhumi_premium_monthly",
  packageName: "com.bhumiamartya.app",
  provider: "google_play",
};

function evalAck(state: string, ackRequired: boolean, acknowledged: boolean): boolean {
  return shouldCreateAcknowledgementJob({
    ...base,
    purchaseState: state,
    entitlementStatus: "ACTIVE_PENDING_SYNC",
    acknowledged,
    acknowledgementRequired: ackRequired,
  });
}

async function run() {
  // Valid purchased + ack required + not acknowledged => creates
  check("PURCHASED + ack required + not acknowledged", evalAck("PURCHASED", true, false), true);
  check("SUBSCRIPTION_STATE_ACTIVE + ack required + not acknowledged", evalAck("SUBSCRIPTION_STATE_ACTIVE", true, false), true);

  // PENDING purchase must NOT create an acknowledgement job
  check("PENDING purchase => no ACK job", evalAck("SUBSCRIPTION_STATE_PENDING", true, false), false);
  check("SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED => no ACK job", evalAck("SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED", true, false), false);

  // CANCELLED -> no ACK job
  check("CANCELLED purchase => no ACK job", evalAck("SUBSCRIPTION_STATE_CANCELED", true, false), false);

  // EXPIRED subscription -> no ACK job
  check("EXPIRED subscription => no ACK job", evalAck("SUBSCRIPTION_STATE_EXPIRED", true, false), false);
  check("SUBSCRIPTION_STATE_INACTIVE => no ACK job", evalAck("SUBSCRIPTION_STATE_INACTIVE", true, false), false);

  // Already acknowledged -> no duplicate job (acknowledged === true)
  check("already acknowledged => no ACK job", evalAck("PURCHASED", true, true), false);
  check("already acknowledged ACTIVE => no ACK job", evalAck("SUBSCRIPTION_STATE_ACTIVE", true, true), false);

  // Renewal that does not require acknowledgement -> no ACK job (ackRequired false)
  check("renewal not requiring ack => no ACK job", evalAck("SUBSCRIPTION_STATE_ACTIVE", false, false), false);
  check("renewal not requiring ack PURCHASED => no ACK job", evalAck("PURCHASED", false, false), false);

  // Duplicate verifier request with guaranteed no-op: same token, ack already true -> idempotent (no new job)
  const dupResultA = shouldCreateAcknowledgementJob({ ...base, purchaseState: "PURCHASED", entitlementStatus: "ACTIVE_PENDING_SYNC", acknowledged: false, acknowledgementRequired: true });
  const dupResultB = shouldCreateAcknowledgementJob({ ...base, purchaseState: "PURCHASED", entitlementStatus: "ACTIVE_SYNCED", acknowledged: true, acknowledgementRequired: false });
  check("duplicate verifier (2nd call already acknowledged + not required) => no duplicate job", dupResultB, false);
  if (dupResultA !== true) { throw new Error("sanity: first call should require job"); }

  console.log(`BUILD84_ACK_STATE_PASS tests=${passed}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});