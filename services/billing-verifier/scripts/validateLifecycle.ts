import fs from "node:fs";
const source = fs.readFileSync("lib/entitlement.ts", "utf8");
for (const item of ["SUBSCRIPTION_STATE_PENDING", "SUBSCRIPTION_STATE_CANCELED", "GRACE_PERIOD", "EXPIRED"]) if (!source.includes(item)) throw new Error(`lifecycle missing: ${item}`);
console.log("BILLING_SERVER_LIFECYCLE_PASS");
