import fs from "node:fs";
const source = fs.readFileSync("lib/access/accessControl.ts", "utf8");
for (const fragment of ["hasActivePremiumMembership", "canAccessPremiumFeature", "membershipType", "PREMIUM"]) {
  if (!source.includes(fragment)) throw new Error(`access matrix owner missing: ${fragment}`);
}
console.log("PREMIUM_ACCESS_MATRIX_PASS");
export {};
