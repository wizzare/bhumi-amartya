import fs from "node:fs";
const source = fs.readFileSync("functions/index.js", "utf8");
const settings = fs.readFileSync("app/settings/page.tsx", "utf8");
if (!source.includes('decision.active\n          ? "Penghuni Bhumi"')) throw new Error("premium badge sync missing");
if (!source.includes('entitlementSource: "google_play"')) throw new Error("entitlement source missing");
if (!settings.includes('getCurrentBadge(originalProfile as any) || "Penghuni Bhumi"')) throw new Error("settings badge owner missing");
console.log("PENGHUNI_BHUMI_BADGE_PASS");
export {};
