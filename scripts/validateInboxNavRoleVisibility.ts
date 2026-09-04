import { existsSync, readFileSync } from "node:fs";

// Build 106 production hotfix: the "Lainnya" menu carries product surfaces only
// (Settings, Inbox, Premium Bhumi) for every role. The legacy admin console and
// Auth Diagnostics page are no longer exposed in the production UI, and the
// navigation component no longer resolves a privileged role. Admin AUTHORIZATION
// (Firestore role, lifetime entitlement, security rules) is unchanged and is
// covered by tests/unit/build106-admin-lifetime-continuity.test.ts.

const raw = readFileSync("components/navigation/AppNav.tsx", "utf8");
// Strip comments so a rule-citing comment cannot trip the guards below.
const source = raw
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

const productItems = ["/settings", "/inbox", "/premium-bhumi"];
for (const href of productItems) {
  if (!source.includes(`href: "${href}"`)) {
    throw new Error(`validateInboxNavRoleVisibility: expected product nav item ${href} missing`);
  }
}
if (!source.includes('label: "Inbox"')) throw new Error("validateInboxNavRoleVisibility: Inbox item label missing");
if ((source.match(/href: "\/inbox"/g) || []).length !== 1) throw new Error("validateInboxNavRoleVisibility: duplicate Inbox item");

for (const productPage of ["app/settings/page.tsx", "app/inbox/page.tsx", "app/premium-bhumi/page.tsx"]) {
  if (!existsSync(productPage)) throw new Error(`validateInboxNavRoleVisibility: route ${productPage} missing`);
}

// The navigation must not expose the admin console / Auth Diagnostics and must
// not carry any privileged-role gating logic.
if (/\/admin(\/|")/.test(source)) throw new Error("validateInboxNavRoleVisibility: admin route exposed in navigation");
if (/Auth Diagnostics/.test(source)) throw new Error("validateInboxNavRoleVisibility: Auth Diagnostics exposed in navigation");
if (/hasPrivilegedPageAccessForUid|guardianRole|isFounderUser|isAdminUser/.test(source)) {
  throw new Error("validateInboxNavRoleVisibility: privileged-role logic present in navigation");
}
if (/CommunicationCenterService|sendPersonalMessage|sendBroadcast|sendAdminReply|sendUserReply|setDoc\(|updateDoc\(/.test(source)) {
  throw new Error("validateInboxNavRoleVisibility: communication write touched");
}
if (/firebase|firestore|package\.json|package-lock/.test(source)) throw new Error("validateInboxNavRoleVisibility: persistence/config touched");

console.log("validateInboxNavRoleVisibility: PASS");
