import fs from "node:fs";
const env = fs.readFileSync(".env.example", "utf8");
if (env.includes("NEXT_PUBLIC_") || fs.readFileSync("api/billing/google-play/verify.ts", "utf8").includes("console.log")) throw new Error("secret exposure contract failed");
console.log("BILLING_SERVER_SECRETS_PASS");
