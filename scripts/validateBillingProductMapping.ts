import fs from "node:fs";

const client = fs.readFileSync("lib/billing/googlePlayBilling.ts", "utf8");
const functionsSource = fs.readFileSync("functions/index.js", "utf8");
if (!client.includes('GOOGLE_PLAY_PRODUCT_ID = "bhumi_premium_monthly"')) throw new Error("client product mapping failed");
if (!functionsSource.includes('GOOGLE_PLAY_PREMIUM_PRODUCT_ID = "bhumi_premium_monthly"')) throw new Error("backend product mapping failed");
if (!client.includes('GOOGLE_PLAY_BASE_PLAN_ID = "monthly"') || !functionsSource.includes('GOOGLE_PLAY_PREMIUM_BASE_PLAN_ID = "monthly"')) throw new Error("base plan mapping failed");
if (functionsSource.includes('GOOGLE_PLAY_PREMIUM_PRODUCT_ID = "bhumi_premium"')) throw new Error("legacy product remains active");
console.log("BILLING_PRODUCT_MAPPING_PASS");
export {};
