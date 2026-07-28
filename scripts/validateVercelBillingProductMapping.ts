import fs from "node:fs";
const route = fs.readFileSync("services/billing-verifier/api/billing/google-play/verify.ts", "utf8");
const security = fs.readFileSync("services/billing-verifier/lib/security.ts", "utf8");
const client = fs.readFileSync("lib/billing/googlePlayBilling.ts", "utf8");
for (const source of [security, client]) if (!source.includes("bhumi_premium_monthly") || !source.includes("com.bhumiamartya.app")) throw new Error("canonical mapping missing");
if (!client.includes('httpsCallable(functionsInstance, "verifyGooglePlayPurchase")') || client.includes("fetch(")) throw new Error("client callable ownership is not canonical");
console.log("VERCEL_BILLING_PRODUCT_MAPPING_PASS"); export {};
