/**
 * Build 106 — DS-2C3 regression coverage.
 *
 * Pins the completed-profile ownership decision and the route wiring that keeps
 * cold feature navigation from stranding a completed user on /setup.
 * Evidence class: STRONG_UNIT + STATIC_GUARD.
 */
import assert from "node:assert";
import fs from "node:fs";

import { isCompletedProfileForUser } from "../../lib/auth/authoritativeProfileGate.ts";

let assertions = 0;
function ok(condition: unknown, message: string): void {
  assertions += 1;
  assert.ok(condition, message);
}

const uid = "ds2c3-user";
ok(isCompletedProfileForUser(uid, { uid, setupCompleted: true }), "owned completed profile redirects away from setup");
ok(!isCompletedProfileForUser(uid, { uid, setupCompleted: false }), "owned incomplete profile remains eligible for setup");
ok(!isCompletedProfileForUser(uid, { uid: "other-user", setupCompleted: true }), "cross-user profile cannot drive setup redirect");

const setupPage = fs.readFileSync("app/setup/page.tsx", "utf8");
const resolver = fs.readFileSync("lib/auth/resolveActiveProfile.ts", "utf8");
const accessGuard = fs.readFileSync("components/auth/AccessGuard.tsx", "utf8");
const insights = fs.readFileSync("components/insights/InsightPageClient.tsx", "utf8");

ok(/resolveActiveProfile\(currentAuth\)[\s\S]*isCompletedProfileForUser\(user\.uid, resolved\.profile\)[\s\S]*router\.replace\("\/dashboard"\)/.test(setupPage), "setup mount reconciles and redirects an owned completed profile");
ok(/resolved\.isUnavailable[\s\S]*setMountGuard\("unavailable"\)/.test(setupPage), "setup read failure is not treated as first-time setup");
ok(/auth\?\.refreshUserProfile[\s\S]*isUnavailable:\s*true/.test(resolver), "active-profile resolver performs authoritative refresh and preserves read failure");
ok(/resolveActiveProfile\(currentAuth\)/.test(accessGuard), "AccessGuard resolves the active profile before entitlement evaluation");
ok(!/if\s*\(!auth \|\| auth\.loading \|\| checking\)\s*return\s*<>\{children\}<\/>/.test(accessGuard), "AccessGuard does not render redirecting children while profile state is unresolved");
ok(/resolveActiveProfile\(currentAuth\)/.test(insights), "insights cold navigation uses the active-profile resolver");
ok(!/getItem\("bhumiUserProfile"\)/.test(insights), "insights no longer routes from the forbidden unscoped profile key");
ok(/storageProvider\.getUserBlueprint\(\)/.test(insights), "insights reads the active user's scoped blueprint");

console.log(`PASS build106-ds2c3-cold-nav (${assertions} assertions)`);
