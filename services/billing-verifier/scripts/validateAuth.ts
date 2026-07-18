import fs from "node:fs";
const source = fs.readFileSync("api/billing/google-play/verify.ts", "utf8");
for (const item of ["Bearer ", "verifyIdToken", "AUTH_MISSING", "AUTH_INVALID"]) if (!source.includes(item)) throw new Error(`auth contract missing: ${item}`);
if (source.includes("body.uid")) throw new Error("body UID accepted");
console.log("BILLING_SERVER_AUTH_PASS");
