import fs from "node:fs";
const source = fs.readFileSync("api/billing/google-play/verify.ts", "utf8");
for (const item of ["Bearer ", "verifyIdToken", "AUTH_MISSING", "mapAuthVerificationError"]) if (!source.includes(item)) throw new Error(`auth contract missing: ${item}`);
const diagnostics = fs.readFileSync("lib/accessDiagnostics.ts", "utf8");
for (const item of ["AUTH_EXPIRED", "AUTH_REVOKED", "AUTH_INVALID_CREDENTIAL", "AUTH_VERIFICATION_TIMEOUT", "AUTH_UNKNOWN", "key-fetch-error"]) if (!diagnostics.includes(item)) throw new Error(`typed auth mapping missing: ${item}`);
if (diagnostics.includes("error.message") || diagnostics.includes("error.stack") || diagnostics.includes("error.cause")) throw new Error("raw auth error data is inspected");
if (source.includes("body.uid")) throw new Error("body UID accepted");
console.log("BILLING_SERVER_AUTH_PASS");
