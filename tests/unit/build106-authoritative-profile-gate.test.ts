/**
 * Build 106 — authoritative-state helpers for the new-user lifecycle gate.
 * Invariant D (server-authoritative setup verification) and Invariant G
 * (authoritative reconcile before routing an authenticated user to /setup).
 *
 * Runner: tsx tests/unit/build106-authoritative-profile-gate.test.ts   (no env / no emulator)
 */
import assert from "node:assert";

import {
  verifySetupPersisted,
  reconcileCachedProfileWithServer,
} from "../../lib/auth/authoritativeProfileGate.ts";
import type { UserProfile } from "../../lib/repositories/userRepository.ts";

let assertions = 0;
function eq<T>(actual: T, expected: T, message: string): void {
  assertions += 1;
  assert.strictEqual(actual, expected, message);
}
function ok(cond: unknown, message: string): void {
  assertions += 1;
  assert.ok(cond, message);
}

const UID = "u-build106";
const prof = (over: Partial<UserProfile> = {}): UserProfile =>
  ({ uid: UID, setupCompleted: true, blueprintStatus: "ready", birthDate: "1990-01-02", ...over } as UserProfile);

/* -------------------------------------------------- verifySetupPersisted */
function testVerifySetupPersisted(): void {
  // Real user: server authoritative + blueprint present -> ok via "server".
  let v = verifySetupPersisted({
    uid: UID, isAudit: false,
    serverProfile: { uid: UID, setupCompleted: true },
    serverBlueprintPresent: true,
    localProfile: null, localBlueprintPresent: false,
  });
  ok(v.ok, "server setupCompleted + blueprint -> ok");
  eq(v.source, "server", "source is server, not local");

  // Real user: localStorage says complete but SERVER does not -> NOT ok
  // (this is the exact Invariant D failure: localStorage is not proof).
  v = verifySetupPersisted({
    uid: UID, isAudit: false,
    serverProfile: { uid: UID, setupCompleted: false },
    serverBlueprintPresent: true,
    localProfile: { uid: UID, setupCompleted: true }, localBlueprintPresent: true,
  });
  ok(!v.ok, "localStorage-complete but server-incomplete -> not verified");
  eq(v.source, "none", "no authoritative source");

  // Real user: server read failed (null) -> NOT ok.
  v = verifySetupPersisted({
    uid: UID, isAudit: false,
    serverProfile: null, serverBlueprintPresent: false,
    localProfile: { uid: UID, setupCompleted: true }, localBlueprintPresent: true,
  });
  ok(!v.ok, "null server profile -> not verified even if local looks complete");

  // Real user: server profile complete but blueprint NOT persisted server-side.
  v = verifySetupPersisted({
    uid: UID, isAudit: false,
    serverProfile: { uid: UID, setupCompleted: true }, serverBlueprintPresent: false,
    localProfile: null, localBlueprintPresent: true,
  });
  ok(!v.ok, "server blueprint missing -> not verified");
  eq(v.reason, "server blueprint not persisted", "reason names the blueprint gap");

  // Real user: server uid mismatch -> NOT ok.
  v = verifySetupPersisted({
    uid: UID, isAudit: false,
    serverProfile: { uid: "someone-else", setupCompleted: true }, serverBlueprintPresent: true,
    localProfile: null, localBlueprintPresent: false,
  });
  ok(!v.ok, "server uid mismatch -> not verified");

  // Audit/dev identity: Firestore permission-denied, local mirror is authoritative.
  v = verifySetupPersisted({
    uid: UID, isAudit: true,
    serverProfile: null, serverBlueprintPresent: false,
    localProfile: { uid: UID, setupCompleted: true }, localBlueprintPresent: true,
  });
  ok(v.ok, "audit identity verified from local mirror");
  eq(v.source, "audit-local", "audit source labelled");

  // Audit identity: local mirror incomplete -> not ok.
  v = verifySetupPersisted({
    uid: UID, isAudit: true,
    serverProfile: null, serverBlueprintPresent: false,
    localProfile: { uid: UID, setupCompleted: false }, localBlueprintPresent: true,
  });
  ok(!v.ok, "audit identity with incomplete local mirror -> not verified");

  console.log("  verifySetupPersisted ............................ PASS");
}

/* ------------------------------------------ reconcileCachedProfileWithServer */
function testReconcileCachedProfileWithServer(): void {
  // Warm, complete cache -> use it, no server round trip needed.
  let r = reconcileCachedProfileWithServer({ uid: UID, cached: prof(), server: null });
  eq(r.action, "use-cached", "complete cache is used as-is");
  eq(r.shouldPersistCache, false, "no re-persist for a good cache");

  // Cold cache, server says complete -> hydrate + converge cache (Invariant G).
  r = reconcileCachedProfileWithServer({ uid: UID, cached: null, server: prof() });
  eq(r.action, "hydrate-from-server", "cold cache + complete server -> hydrate");
  eq(r.shouldPersistCache, true, "cache is converged from server");
  eq(r.profile?.setupCompleted, true, "hydrated profile carries setupCompleted");
  eq(r.profile?.uid, UID, "hydrated profile is scoped to the auth uid");

  // Stale cache (setupCompleted false) but server complete -> hydrate, don't bail.
  r = reconcileCachedProfileWithServer({
    uid: UID,
    cached: prof({ setupCompleted: false, blueprintStatus: "missing", birthDate: "" }),
    server: prof(),
  });
  eq(r.action, "hydrate-from-server", "stale cache overridden by authoritative server");
  eq(r.profile?.blueprintStatus, "ready", "server values win over the stale cache");

  // Cache for a different uid + server complete -> hydrate from server (scoped).
  r = reconcileCachedProfileWithServer({
    uid: UID,
    cached: prof({ uid: "other-user" }),
    server: prof(),
  });
  eq(r.action, "hydrate-from-server", "cross-uid cache is not trusted; server used");

  // Genuinely incomplete: cold cache + server also incomplete -> route to /setup.
  r = reconcileCachedProfileWithServer({
    uid: UID, cached: null, server: prof({ setupCompleted: false }),
  });
  eq(r.action, "incomplete", "server also incomplete -> incomplete verdict");
  eq(r.profile, null, "no profile to hand back");

  // Both missing -> incomplete.
  r = reconcileCachedProfileWithServer({ uid: UID, cached: null, server: null });
  eq(r.action, "incomplete", "nothing anywhere -> incomplete");

  console.log("  reconcileCachedProfileWithServer ................ PASS");
}

function run(): void {
  console.log("build106-authoritative-profile-gate:");
  testVerifySetupPersisted();
  testReconcileCachedProfileWithServer();
  console.log(`PASS build106-authoritative-profile-gate (${assertions} assertions)`);
}

try {
  run();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
