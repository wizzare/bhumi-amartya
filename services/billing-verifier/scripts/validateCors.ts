import fs from "node:fs";
const source = fs.readFileSync("lib/security.ts", "utf8");
if (!source.includes("ALLOWED_ORIGINS") || /Access-Control-Allow-Origin[^\n]*\*/.test(source)) throw new Error("CORS contract unsafe");
console.log("BILLING_SERVER_CORS_PASS");
