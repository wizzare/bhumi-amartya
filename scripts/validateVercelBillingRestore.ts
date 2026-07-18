import fs from "node:fs";
const client = fs.readFileSync("lib/billing/googlePlayBilling.ts", "utf8");
const page = fs.readFileSync("app/upgrade/page.tsx", "utf8");
if (!client.includes("restorePremiumPurchases") || !page.includes("handleRestore") || !client.includes("/api/billing/google-play/verify")) throw new Error("restore migration missing");
console.log("VERCEL_BILLING_RESTORE_PASS"); export {};
