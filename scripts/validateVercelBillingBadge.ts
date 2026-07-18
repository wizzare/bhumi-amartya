import fs from "node:fs";
const route = fs.readFileSync("services/billing-verifier/api/billing/google-play/verify.ts", "utf8");
const entitlement = fs.readFileSync("services/billing-verifier/lib/entitlement.ts", "utf8");
if (!route.includes("badge") || !entitlement.includes('result.active ? "Penghuni Bhumi"')) throw new Error("badge sync missing");
if (!entitlement.includes('existing.badge === "Founder"')) throw new Error("Founder preservation missing");
console.log("VERCEL_BILLING_BADGE_PASS"); export {};
