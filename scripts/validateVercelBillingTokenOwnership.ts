import fs from "node:fs";
const route = fs.readFileSync("services/billing-verifier/api/billing/google-play/verify.ts", "utf8");
const entitlement = fs.readFileSync("services/billing-verifier/lib/entitlement.ts", "utf8");
for (const item of ["persistEntitlement", "decoded.uid", "TOKEN_OWNERSHIP_CONFLICT"]) if (!route.includes(item) && !entitlement.includes(item)) throw new Error(`ownership contract missing: ${item}`);
console.log("VERCEL_BILLING_TOKEN_OWNERSHIP_PASS"); export {};
