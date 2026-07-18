import fs from "node:fs";
const route = fs.readFileSync("services/billing-verifier/api/billing/google-play/verify.ts", "utf8");
for (const item of ["authorization", "Bearer ", "verifyIdToken", "AUTH_MISSING", "AUTH_INVALID", "AUTH_EXPIRED", "AUTH_REVOKED"]) if (!route.includes(item)) throw new Error(`auth contract missing: ${item}`);
if (route.includes("body.uid") || route.includes("body.userId")) throw new Error("client uid accepted");
console.log("VERCEL_BILLING_AUTH_PASS"); export {};
