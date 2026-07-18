import fs from "node:fs";
const route = fs.readFileSync("services/billing-verifier/api/billing/google-play/verify.ts", "utf8");
const entitlement = fs.readFileSync("services/billing-verifier/lib/entitlement.ts", "utf8");
if (!route.includes("persistEntitlement") || !entitlement.includes('result.active ? "PREMIUM"')) throw new Error("premium precedence missing");
console.log("VERCEL_BILLING_TRIAL_PRECEDENCE_PASS"); export {};
