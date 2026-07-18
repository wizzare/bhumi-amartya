import fs from "node:fs";
const files = ["services/billing-verifier/api/billing/google-play/verify.ts", "services/billing-verifier/lib/firebaseAdmin.ts", "lib/billing/googlePlayBilling.ts"];
for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  if (source.includes("console.log(idToken)") || source.includes("console.log(token)") || source.includes("console.log(process.env")) throw new Error(`secret logging in ${file}`);
  if (file.includes("route.ts") && source.includes("purchaseToken: token")) throw new Error("token returned to client");
}
console.log("VERCEL_BILLING_NO_SECRETS_PASS"); export {};
