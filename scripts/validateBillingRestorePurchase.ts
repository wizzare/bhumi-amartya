import fs from "node:fs";
const billing = fs.readFileSync("lib/billing/googlePlayBilling.ts", "utf8");
const page = fs.readFileSync("app/upgrade/page.tsx", "utf8");
if (!billing.includes("restorePurchases") || !page.includes("handleRestore")) throw new Error("restore path missing");
if (!page.includes("processAndVerifyPurchaseToken")) throw new Error("restore does not use the shared verifier");
console.log("BILLING_RESTORE_PURCHASE_PASS");
export {};
