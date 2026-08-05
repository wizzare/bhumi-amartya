import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { shouldCreateAcknowledgementJob } from "../../services/billing-verifier/lib/purchaseLedger";

let passed = 0;
async function test(label: string, work: () => void | Promise<void>) {
  await work();
  passed++;
  console.log(`PASS ${passed}: ${label}`);
}

async function run() {
  const producerSrc = readFileSync(join(__dirname, "../../services/billing-verifier/lib/purchaseLedger.ts"), "utf8");
  const consumerSrc = readFileSync(join(__dirname, "../../services/billing-verifier/api/billing/reconcile.ts"), "utf8");

  await test("producer uses canonical FIRESTORE_SYNC job type", () => {
    assert.ok(producerSrc.includes("'FIRESTORE_SYNC'"), "producer must insert FIRESTORE_SYNC");
    assert.ok(!producerSrc.includes("'SYNC_FIRESTORE_ENTITLEMENT'"), "legacy sync string must not remain");
  });

  await test("producer uses canonical ACKNOWLEDGEMENT job type", () => {
    assert.ok(producerSrc.includes("'ACKNOWLEDGEMENT'"), "producer must insert ACKNOWLEDGEMENT");
    assert.ok(!producerSrc.includes("'ACKNOWLEDGE_GOOGLE_PLAY'"), "legacy ack string must not remain");
  });

  await test("consumer claims canonical FIRESTORE_SYNC and ACKNOWLEDGEMENT", () => {
    assert.ok(consumerSrc.includes('job.job_type === "FIRESTORE_SYNC"'), "consumer must handle FIRESTORE_SYNC");
    assert.ok(consumerSrc.includes('job.job_type === "ACKNOWLEDGEMENT"'), "consumer must handle ACKNOWLEDGEMENT");
  });

  await test("PURCHASED + acknowledgementRequired creates acknowledge job decision", () => {
    assert.equal(
      shouldCreateAcknowledgementJob({
        uid: "u1", purchaseToken: "tok-synth", productId: "p", packageName: "pk", provider: "google_play",
        purchaseState: "PURCHASED", entitlementStatus: "ACTIVE_PENDING_SYNC",
        acknowledged: false, acknowledgementRequired: true,
      }),
      true
    );
  });

  await test("already acknowledged or ack-not-required does not create acknowledge job", () => {
    assert.equal(
      shouldCreateAcknowledgementJob({
        uid: "u1", purchaseToken: "tok-synth", productId: "p", packageName: "pk", provider: "google_play",
        purchaseState: "PURCHASED", entitlementStatus: "ACTIVE_PENDING_SYNC",
        acknowledged: true, acknowledgementRequired: true,
      }),
      false
    );
    assert.equal(
      shouldCreateAcknowledgementJob({
        uid: "u1", purchaseToken: "tok-synth", productId: "p", packageName: "pk", provider: "google_play",
        purchaseState: "PURCHASED", entitlementStatus: "ACTIVE_PENDING_SYNC",
        acknowledged: false, acknowledgementRequired: false,
      }),
      false
    );
  });

  await test("PENDING/CANCELED/EXPIRED do not create acknowledge job", () => {
    for (const state of ["SUBSCRIPTION_STATE_PENDING", "SUBSCRIPTION_STATE_CANCELED", "SUBSCRIPTION_STATE_EXPIRED"]) {
      assert.equal(
        shouldCreateAcknowledgementJob({
          uid: "u1", purchaseToken: "tok-synth", productId: "p", packageName: "pk", provider: "google_play",
          purchaseState: state, entitlementStatus: "UNKNOWN",
          acknowledged: false, acknowledgementRequired: true,
        }),
        false,
        `state ${state} must not create ack job`
      );
    }
  });

  console.log(`BUILD84_JOB_TYPE_REGRESSION_PASS tests=${passed}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});