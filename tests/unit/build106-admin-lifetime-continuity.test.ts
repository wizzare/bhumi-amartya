import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  BUILD106_ADMIN_IDENTITY_SLOTS,
  buildAdminLifetimeProfilePatch,
  validateAdminUidAssignments,
} from "../../lib/auth/adminContinuity";
import {
  hasPrivilegedPageAccessForUid,
  isAdminUser,
  resolvePrivilegedRole,
} from "../../lib/auth/privilegedUser";
import { getEntitlementStatus } from "../../lib/billing/entitlementService";
import { getUserAccess } from "../../lib/access/accessControl";

let passed = 0;
function test(label: string, work: () => void) {
  work();
  passed += 1;
  console.log(`PASS ${passed}: ${label}`);
}

const assignments = validateAdminUidAssignments({
  ADMIN_1: "synthetic-admin-1",
  ADMIN_2: "synthetic-admin-2",
  ADMIN_3: "synthetic-admin-3",
  ADMIN_4: "synthetic-admin-4",
});
const patch = buildAdminLifetimeProfilePatch();

test("continuity contract contains exactly four unique UID slots", () => {
  assert.equal(BUILD106_ADMIN_IDENTITY_SLOTS.length, 4);
  assert.equal(new Set(Object.values(assignments)).size, 4);
});

test("trusted reconciliation uses existing role and lifetime fields only", () => {
  assert.deepEqual(patch, {
    role: "admin",
    membershipType: "LIFETIME",
    membershipExpiryDate: null,
    entitlementSource: "admin_lifetime",
  });
  assert.equal("isPremium" in patch, false);
  assert.equal("email" in patch, false);
  assert.equal("name" in patch, false);
});

for (const [slot, uid] of Object.entries(assignments)) {
  test(`${slot} resolves UID-bound Firestore admin and lifetime Premium access`, () => {
    const profile = { uid, ...patch, isPremium: false } as any;
    assert.equal(isAdminUser(profile), true);
    assert.equal(resolvePrivilegedRole(profile), "admin");
    assert.equal(hasPrivilegedPageAccessForUid(uid, profile), true);

    const entitlement = getEntitlementStatus(profile, new Date("2026-09-03T00:00:00Z"));
    assert.equal(entitlement.isPremium, true);
    assert.equal(entitlement.reason, "admin");
    assert.equal(entitlement.expiresAt, null);
    assert.equal(entitlement.effectiveTier, "Admin (Lifetime)");
    assert.notEqual(entitlement.source, "Google Play Billing");

    const access = getUserAccess(profile);
    assert.equal(access.isPremium, true);
    assert.equal(access.isTrialActive, false);
    assert.deepEqual(access.lockedFeatures, []);
  });

  test(`${slot} survives logout/login equivalent re-hydration by the same UID`, () => {
    const rehydratedProfile = JSON.parse(JSON.stringify({ uid, ...patch }));
    assert.equal(hasPrivilegedPageAccessForUid(uid, rehydratedProfile), true);
    assert.equal(getEntitlementStatus(rehydratedProfile).reason, "admin");
  });
}

test("active Google Play state coexists without becoming the admin authority", () => {
  const profile = {
    uid: assignments.ADMIN_1,
    role: "admin",
    membershipType: "PREMIUM",
    entitlementSource: "google_play",
    membershipExpiryDate: "2099-01-01T00:00:00Z",
  } as any;
  const entitlement = getEntitlementStatus(profile, new Date("2026-09-03T00:00:00Z"));
  assert.equal(entitlement.reason, "admin");
  assert.equal(entitlement.expiresAt, null);
});

test("expired Google Play state cannot revoke role-derived admin lifetime", () => {
  const profile = {
    uid: assignments.ADMIN_2,
    role: "admin",
    membershipType: "PREMIUM",
    entitlementSource: "google_play",
    membershipExpiryDate: "2025-01-01T00:00:00Z",
  } as any;
  const entitlement = getEntitlementStatus(profile, new Date("2026-09-03T00:00:00Z"));
  assert.equal(entitlement.isPremium, true);
  assert.equal(entitlement.reason, "admin");
  assert.equal(entitlement.expiresAt, null);
});

test("normal Premium user receives Premium but never admin access", () => {
  const uid = "synthetic-premium-user";
  const profile = {
    uid,
    role: "user",
    membershipType: "PREMIUM",
    entitlementSource: "google_play",
    membershipExpiryDate: "2099-01-01T00:00:00Z",
  } as any;
  assert.equal(getEntitlementStatus(profile).isPremium, true);
  assert.equal(hasPrivilegedPageAccessForUid(uid, profile), false);
});

test("expired and free normal users remain unchanged", () => {
  const expired = {
    uid: "synthetic-expired-user",
    role: "user",
    membershipType: "PREMIUM",
    entitlementSource: "google_play",
    membershipExpiryDate: "2025-01-01T00:00:00Z",
  } as any;
  const free = { uid: "synthetic-free-user", role: "user", membershipType: "FREE" } as any;
  assert.equal(getEntitlementStatus(expired, new Date("2026-09-03T00:00:00Z")).isPremium, false);
  assert.equal(getEntitlementStatus(free, new Date("2026-09-03T00:00:00Z")).isPremium, false);
  assert.equal(hasPrivilegedPageAccessForUid(free.uid, free), false);
});

test("raw client isPremium and identity-looking strings never grant access", () => {
  const uid = "synthetic-name-only-user";
  const profile = {
    uid,
    displayName: "Historical Admin",
    email: "admin-looking@example.test",
    role: "user",
    membershipType: "FREE",
    isPremium: true,
  } as any;
  assert.equal(hasPrivilegedPageAccessForUid(uid, profile), false);
  assert.equal(getEntitlementStatus(profile).isPremium, false);
});

test("authorization fails closed for missing, stale, or mismatched profile state", () => {
  const profile = { uid: assignments.ADMIN_3, ...patch } as any;
  assert.equal(hasPrivilegedPageAccessForUid(assignments.ADMIN_3, null), false);
  assert.equal(hasPrivilegedPageAccessForUid(null, profile), false);
  assert.equal(hasPrivilegedPageAccessForUid("different-auth-uid", profile), false);
  assert.equal(hasPrivilegedPageAccessForUid(assignments.ADMIN_3, { uid: assignments.ADMIN_3 }), false);
});

test("four-account UID validation rejects missing and duplicate assignments", () => {
  assert.throws(() => validateAdminUidAssignments({ ...assignments, ADMIN_4: "" }));
  assert.throws(() => validateAdminUidAssignments({ ...assignments, ADMIN_4: assignments.ADMIN_1 }));
});

test("admin UI uses UID-bound policy and restores the historical action chain", () => {
  const activity = readFileSync("app/admin/activity/page.tsx", "utf8");
  const inbox = readFileSync("components/admin/AdminInboxWorkspace.tsx", "utf8");
  const diagnostics = readFileSync("app/admin/diagnostics/page.tsx", "utf8");

  for (const source of [activity, inbox, diagnostics]) {
    assert.match(source, /hasPrivilegedPageAccessForUid/);
    assert.doesNotMatch(source, /PERMANENT_ADMIN_EMAILS|admin_users/);
  }
  assert.match(activity, /getAllUsersForMonitoring/);
  assert.match(activity, /findUserByExactUidOrEmail/);
  assert.match(activity, /sendPersonalMessage/);
  assert.match(activity, /AdminInboxWorkspace/);
  assert.match(inbox, /getAllUserCommunications/);
  assert.match(inbox, /sendAdminReply/);
  assert.match(inbox, /sendBroadcast/);
});

// Build 106 production hotfix: ADMIN PAGE / MENU EXPOSURE = REMOVE (authorization
// above is unchanged). The shipped navigation must not surface the admin console
// or Auth Diagnostics for any role, and each admin route is gated so a
// production build cannot render it by direct navigation.
test("admin console + Auth Diagnostics are not exposed in the production UI", () => {
  const nav = readFileSync("components/navigation/AppNav.tsx", "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  assert.doesNotMatch(nav, /["']\/admin(\/|["'])/);
  assert.doesNotMatch(nav, /label:\s*["']Admin["']/);
  assert.doesNotMatch(nav, /label:\s*["']Auth Diagnostics["']/);
  assert.doesNotMatch(nav, /hasPrivilegedPageAccessForUid/);

  const gate = readFileSync("lib/config/adminUiExposure.ts", "utf8");
  assert.match(gate, /NEXT_PUBLIC_ENABLE_ADMIN_UI/);
  for (const file of ["app/admin/page.tsx", "app/admin/activity/page.tsx", "app/admin/diagnostics/page.tsx"]) {
    assert.match(readFileSync(file, "utf8"), /isAdminUiExposed/);
  }
  assert.match(readFileSync("scripts/run-prod-build.mjs", "utf8"), /NEXT_PUBLIC_ENABLE_ADMIN_UI:\s*'false'/);
});

test("server founder guard has no unauthenticated development bypass", () => {
  const source = readFileSync("lib/auth/requireFounder.ts", "utf8");
  assert.doesNotMatch(source, /bhumi-dev-bypass|dev-founder-uid/);
  assert.match(source, /collection\("users"\)\.doc\(decodedToken\.uid\)\.get\(\)/);
  assert.match(source, /Authorization state unavailable/);
});

test("canonical profile readers bind the Firestore document ID back to uid", () => {
  const repository = readFileSync("lib/repositories/userRepository.ts", "utf8");
  const service = readFileSync("lib/firebase/service.ts", "utf8");
  assert.match(repository, /return \{ \.\.\.docSnap\.data\(\), uid: docSnap\.id \}/);
  assert.match(service, /uid: userDoc\.id/);
});

test("the reconciliation runner is emulator-only and does not embed account identity", () => {
  const source = readFileSync("scripts/reconcileBuild106AdminLifetimeEmulator.ts", "utf8");
  assert.match(source, /FIRESTORE_EMULATOR_HOST/);
  assert.match(source, /projectId\.startsWith\("demo-"\)/);
  assert.doesNotMatch(source, /@gmail\.com|Maulina|Septi|Nandra|Azian|isPremium:\s*true/);
});

console.log(`BUILD106_ADMIN_LIFETIME_CONTINUITY_PASS assertions=${passed}`);
