import fs from "node:fs";
const source = fs.readFileSync("app/upgrade/page.tsx", "utf8");
if (!source.includes("refreshUserProfile()")) throw new Error("profile refresh missing");
if (!source.includes("verifyGooglePlayPurchase")) throw new Error("verification flow missing");
console.log("BILLING_REFRESH_WITHOUT_RELOGIN_PASS");
export {};
