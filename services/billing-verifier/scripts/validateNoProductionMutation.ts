import fs from "node:fs";
for (const file of ["api/billing/google-play/verify.ts", "lib/entitlement.ts"]) if (/purchasePremium|consumeAsync|console\.log\(.*token/i.test(fs.readFileSync(file, "utf8"))) throw new Error("unsafe production mutation/logging");
console.log("BILLING_SERVER_NO_PRODUCTION_MUTATION_PASS");
