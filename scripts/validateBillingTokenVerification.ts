import fs from "node:fs";
const source = fs.readFileSync("functions/index.js", "utf8");
for (const fragment of ["context.auth.uid", "purchases.subscriptionsv2.get", "purchaseToken", "verifiedProductId", "verifiedBasePlanId", "acknowledge"]) {
  if (!source.includes(fragment)) throw new Error(`token verification missing: ${fragment}`);
}
console.log("BILLING_TOKEN_VERIFICATION_PASS");
export {};
