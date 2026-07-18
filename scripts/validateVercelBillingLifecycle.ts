import fs from "node:fs";
const route = fs.readFileSync("services/billing-verifier/api/billing/google-play/verify.ts", "utf8");
const entitlement = fs.readFileSync("services/billing-verifier/lib/entitlement.ts", "utf8");
for (const item of ["SUBSCRIPTION_STATE_PENDING", "SUBSCRIPTION_STATE_CANCELED", "GRACE_PERIOD", "EXPIRED"]) if (!route.includes(item) && !entitlement.includes(item)) throw new Error(`lifecycle missing: ${item}`);
console.log("VERCEL_BILLING_LIFECYCLE_PASS"); export {};
