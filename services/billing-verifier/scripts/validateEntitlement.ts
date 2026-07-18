import fs from "node:fs";
const source = fs.readFileSync("lib/entitlement.ts", "utf8");
for (const item of ["runTransaction", "membershipType", '"PREMIUM"', "entitlementSource", "Penghuni Bhumi"]) if (!source.includes(item)) throw new Error(`entitlement missing: ${item}`);
console.log("BILLING_SERVER_ENTITLEMENT_PASS");
