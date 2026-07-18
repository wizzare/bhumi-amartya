import { existsSync, readFileSync } from "node:fs";

type Fixture = { name: string; guardianRole?: string; role?: string; premium?: boolean; expired?: boolean };
const fixtures: Fixture[] = [
  { name: "Founder", guardianRole: "founder", premium: true },
  { name: "Admin", guardianRole: "admin", premium: false },
  { name: "Regular", guardianRole: "user", premium: false },
  { name: "Premium non-admin", guardianRole: "user", premium: true },
  { name: "Expired", guardianRole: "user", premium: false, expired: true },
];
const isAdmin = (fixture: Fixture) => fixture.guardianRole === "founder" || fixture.guardianRole === "admin" || fixture.role === "admin";
const source = readFileSync("components/navigation/AppNav.tsx", "utf8");
const routes = ["/settings", "/inbox", "/premium-bhumi", "/admin/activity"];
if (!source.includes("Inbox") || !source.includes("/inbox") || !source.includes("guardianRole === \"admin\"") || !source.includes("role === \"admin\"")) throw new Error("validateInboxNavRoleVisibility: navigation role policy missing");
if (routes.some((route) => !existsSync(route === "/settings" ? "app/settings/page.tsx" : route === "/inbox" ? "app/inbox/page.tsx" : route === "/premium-bhumi" ? "app/premium-bhumi/page.tsx" : "app/admin/activity/page.tsx"))) throw new Error("validateInboxNavRoleVisibility: route missing");
if (fixtures.some((fixture) => isAdmin(fixture) !== (fixture.name === "Founder" || fixture.name === "Admin"))) throw new Error("validateInboxNavRoleVisibility: fixture role mismatch");
if ((source.match(/href: \"\/inbox\"/g) || []).length !== 1) throw new Error("validateInboxNavRoleVisibility: duplicate Inbox item");
if (/CommunicationCenterService|sendPersonalMessage|sendBroadcast|sendAdminReply|sendUserReply|setDoc\(|updateDoc\(/.test(source)) throw new Error("validateInboxNavRoleVisibility: communication write touched");
if (/firebase|firestore|package\.json|package-lock/.test(source)) throw new Error("validateInboxNavRoleVisibility: persistence/config touched");
console.log("validateInboxNavRoleVisibility: PASS 15/15");
