import fs from "node:fs";
const source = fs.readFileSync("api/billing/google-play/verify.ts", "utf8");
for (const item of ["export default async function handler", "nodejs20.x", "OPTIONS", "METHOD_NOT_ALLOWED"]) if (!source.includes(item)) throw new Error(`route contract missing: ${item}`);
console.log("BILLING_SERVER_ROUTE_PASS");
