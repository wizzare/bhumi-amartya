import fs from "node:fs";

const nextConfig = fs.readFileSync("next.config.ts", "utf8");
const capacitor = fs.readFileSync("capacitor.config.ts", "utf8");
const client = fs.readFileSync("lib/billing/googlePlayBilling.ts", "utf8");
const route = fs.readFileSync("services/billing-verifier/api/billing/google-play/verify.ts", "utf8");
const firebaseAdmin = fs.readFileSync("services/billing-verifier/lib/firebaseAdmin.ts", "utf8");
const entitlement = fs.readFileSync("services/billing-verifier/lib/entitlement.ts", "utf8");
const googlePlay = fs.readFileSync("services/billing-verifier/lib/googlePlay.ts", "utf8");
const project = fs.readFileSync(".vercel/repo.json", "utf8");
if (!nextConfig.includes('output: \'export\'')) throw new Error("static export owner changed");
if (!capacitor.includes('webDir: \'out\'')) throw new Error("Capacitor output contract changed");
if (!route.includes("VercelRequest") || !route.includes("VercelResponse")) throw new Error("billing verifier is not a Vercel Node handler");
if (!googlePlay.includes("GoogleAuth") || !firebaseAdmin.includes("adminAuth") || !entitlement.includes("runTransaction")) throw new Error("server ownership contract incomplete");
if (!client.includes("/api/billing/google-play/verify") || client.includes("httpsCallable")) throw new Error("client verifier ownership is not canonical");
if (!project.includes("bhumi-amartya-clean")) throw new Error("Vercel project link not found");
if (route.includes("Access-Control-Allow-Origin: *")) throw new Error("permissive CORS detected");
console.log("BILLING_DEPLOYMENT_ARCHITECTURE_AUDIT_PASS");
export {};
