import fs from "node:fs";
const source = fs.readFileSync("lib/security.ts", "utf8");
for (const item of ["bhumi_premium_monthly", "monthly", "com.bhumiamartya.app"]) if (!source.includes(item)) throw new Error(`product mapping missing: ${item}`);
console.log("BILLING_SERVER_PRODUCT_PASS");
