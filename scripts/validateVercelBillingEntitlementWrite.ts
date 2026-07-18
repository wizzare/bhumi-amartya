import fs from "node:fs";
const route = fs.readFileSync("services/billing-verifier/api/billing/google-play/verify.ts", "utf8");
const entitlement = fs.readFileSync("services/billing-verifier/lib/entitlement.ts", "utf8");
for (const item of ["membershipType", '"PREMIUM"', "accessUntil", 'entitlementSource: "google_play"', "entitlementUpdatedAt", "Timestamp.fromDate"]) if (!route.includes(item) && !entitlement.includes(item)) throw new Error(`entitlement write missing: ${item}`);
console.log("VERCEL_BILLING_ENTITLEMENT_WRITE_PASS"); export {};
