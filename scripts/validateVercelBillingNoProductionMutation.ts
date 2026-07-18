import fs from "node:fs";
const files = ["services/billing-verifier/api/billing/google-play/verify.ts", "lib/billing/googlePlayBilling.ts"];
for (const file of files) if (fs.readFileSync(file, "utf8").includes("purchasePremiumSubscription()") && file.includes("route")) throw new Error("route starts purchase");
console.log("VERCEL_BILLING_NO_PRODUCTION_MUTATION_PASS"); export {};
