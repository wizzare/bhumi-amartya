import fs from "node:fs";
const files = ["functions/index.js", "lib/billing/googlePlayBilling.ts", "app/upgrade/page.tsx"];
for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  if (/purchase\s*\(|consumeAsync|acknowledgePurchase/.test(source) && file !== "functions/index.js") {
    throw new Error(`production purchase mutation in validator scope: ${file}`);
  }
}
console.log("BILLING_NO_PRODUCTION_MUTATION_PASS");
export {};
