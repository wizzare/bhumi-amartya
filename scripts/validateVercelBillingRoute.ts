import fs from "node:fs";
const route = fs.readFileSync("services/billing-verifier/api/billing/google-play/verify.ts", "utf8");
const vercel = fs.readFileSync("services/billing-verifier/vercel.json", "utf8");
for (const item of ["export default async function handler", "OPTIONS", "METHOD_NOT_ALLOWED"]) if (!route.includes(item)) throw new Error(`route contract missing: ${item}`);
if (!vercel.includes('"nodejs20.x"') || !vercel.includes('"sin1"')) throw new Error("runtime/region missing");
console.log("VERCEL_BILLING_ROUTE_PASS"); export {};
