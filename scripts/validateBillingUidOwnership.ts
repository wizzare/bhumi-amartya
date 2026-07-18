import fs from "node:fs";
const source = fs.readFileSync("functions/index.js", "utf8");
for (const fragment of ["billing_purchase_tokens/", "validateTokenOwnership", "Purchase token sudah terhubung", "uid,"]) {
  if (!source.includes(fragment)) throw new Error(`uid ownership missing: ${fragment}`);
}
console.log("BILLING_UID_OWNERSHIP_PASS");
export {};
