import fs from "node:fs";

const nextConfig = fs.readFileSync("next.config.ts", "utf8");
const capacitor = fs.readFileSync("capacitor.config.ts", "utf8");
const client = fs.readFileSync("lib/billing/googlePlayBilling.ts", "utf8");
if (!nextConfig.includes('output: \'export\'')) throw new Error("static export owner changed");
if (!capacitor.includes('webDir: \'out\'')) throw new Error("Capacitor output contract changed");
if (!client.includes('httpsCallable(functionsInstance, "verifyGooglePlayPurchase")')) throw new Error("Firebase Callable verifier is not canonical");
if (client.includes("fetch(") || client.includes("BILLING_VERIFIER_URL")) throw new Error("HTTP fallback remains active");
if (!fs.existsSync(".vercel/repo.json")) console.warn("BILLING_DEPLOYMENT_ENVIRONMENT_UNVERIFIED: .vercel/repo.json is absent");
console.log("BILLING_DEPLOYMENT_ARCHITECTURE_AUDIT_PASS");
export {};
