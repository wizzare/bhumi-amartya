import fs from "node:fs";
const source = fs.readFileSync("functions/index.js", "utf8");
for (const state of ["SUBSCRIPTION_STATE_ACTIVE", "SUBSCRIPTION_STATE_IN_GRACE_PERIOD", "SUBSCRIPTION_STATE_CANCELED", "SUBSCRIPTION_STATE_EXPIRED"]) {
  if (!source.includes(state)) throw new Error(`lifecycle state missing: ${state}`);
}
if (!source.includes("purchase_voided_or_refunded")) throw new Error("voided state missing");
console.log("BILLING_LIFECYCLE_STATES_PASS");
export {};
