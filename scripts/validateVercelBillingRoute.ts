import fs from "node:fs";
const route = fs.readFileSync("services/billing-verifier/api/billing/google-play/verify.ts", "utf8");
const vercel = fs.readFileSync("services/billing-verifier/vercel.json", "utf8");
const packageJson = fs.readFileSync("services/billing-verifier/package.json", "utf8");
for (const item of ["export default async function handler", "OPTIONS", "METHOD_NOT_ALLOWED"]) if (!route.includes(item)) throw new Error(`route contract missing: ${item}`);
if (!route.includes('runtime: "nodejs"') || !vercel.includes('"sin1"') || !packageJson.includes('"node": "20.x"')) throw new Error("runtime/region missing");
console.log("VERCEL_BILLING_ROUTE_PASS"); export {};
