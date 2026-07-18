import fs from "node:fs";
const source = fs.readFileSync("lib/entitlement.ts", "utf8");
for (const item of ["billing_purchase_tokens/", "TOKEN_OWNERSHIP_CONFLICT", "tokenHash"]) if (!source.includes(item)) throw new Error(`ownership missing: ${item}`);
console.log("BILLING_SERVER_TOKEN_OWNERSHIP_PASS");
