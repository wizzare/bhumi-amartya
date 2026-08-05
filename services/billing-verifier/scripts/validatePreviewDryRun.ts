import fs from "node:fs";

const route = fs.readFileSync("api/billing/google-play/verify.ts", "utf8");
const security = fs.readFileSync("lib/security.ts", "utf8");
if (!security.includes('process.env.VERCEL_ENV === "preview"')) throw new Error("dry-run is not Preview-only");
if (!security.includes('process.env.BILLING_PREVIEW_DRY_RUN === "true"')) throw new Error("dry-run is not environment-gated");
if (!route.includes("previewDryRunEnabled()")) throw new Error("route does not enforce dry-run gate");
if (!route.includes('status: "PREVIEW_DRY_RUN"')) throw new Error("dry-run response missing");
const dryRunIndex = route.indexOf("previewDryRunEnabled()");
const persistenceIndex = route.indexOf("persistEntitlement(decoded.uid");
if (dryRunIndex < 0 || persistenceIndex < 0 || dryRunIndex > persistenceIndex) throw new Error("dry-run check occurs after entitlement write");
if (route.includes("body.BILLING_PREVIEW_DRY_RUN") || route.includes("body.preview")) throw new Error("request body controls dry-run");
console.log("BILLING_SERVER_PREVIEW_DRY_RUN_PASS");
export {};
