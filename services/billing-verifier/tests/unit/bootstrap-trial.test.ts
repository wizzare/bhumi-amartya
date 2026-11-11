import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Module = require("node:module");
const originalLoad = Module._load;
const users = new Map<string, Record<string, unknown>>();
const deviceClaims = new Map<string, Record<string, unknown>>();
const auditLogs: Record<string, unknown>[] = [];
let activeUid = "synthetic-owner";
let writes = 0;
let authFailure = false;
let dbFailure = false;
let assertions = 0;
const equal = (actual: unknown, expected: unknown) => { assertions++; assert.deepEqual(actual, expected); };
let serial = Promise.resolve();

function makeDocRef(docPath: string) {
  const isUser = docPath === "users/synthetic-owner" || docPath === "users/synthetic-owner-2";
  const isConfig = docPath === "app_config/antiAbuse";
  const isClaim = /^antiAbuseDeviceClaims\/[a-f0-9]{64}$/.test(docPath);
  const isAudit = /^antiAbuseAuditLogs\/audit-\d+$/.test(docPath);
  equal(isUser || isConfig || isClaim || isAudit, true);
  return {
    id: docPath.split("/").pop() || docPath,
    path: docPath,
    get: async () => {
      if (isConfig) return { exists: false, data: () => undefined };
      const store = isUser ? users : deviceClaims;
      const val = store.get(docPath);
      return { exists: val !== undefined, data: () => val };
    },
  };
}

Module._load = function(request: string, parent: unknown, ...args: unknown[]) {
  if (request.endsWith("/firebaseAdmin")) return {
    adminAuth: () => ({ verifyIdToken: async (token: string, revoked: boolean) => {
      equal([token, revoked], ["synthetic-token", true]);
      if (authFailure) throw new Error("sensitive-provider-payload");
      return { uid: activeUid };
    } }),
    adminDb: () => ({
      doc: (docPath: string) => makeDocRef(docPath),
      collection: (name: string) => {
        equal(name, "antiAbuseAuditLogs");
        return { doc: () => makeDocRef(`antiAbuseAuditLogs/audit-${auditLogs.length + 1}`) };
      },
      runTransaction: (callback: (tx: unknown) => Promise<unknown>) => {
        const work = serial.then(async () => {
          if (dbFailure) throw new Error("sensitive-provider-payload");
          return callback({
            get: async (ref: { path: string }) => {
              const store = ref.path.startsWith("users/") ? users : deviceClaims;
              const val = store.get(ref.path);
              return { exists: val !== undefined, data: () => val };
            },
            set: (ref: { path: string }, payload: Record<string, unknown>, options?: unknown) => {
              if (ref.path.startsWith("users/")) {
                equal(options, { merge: true });
                writes++;
                users.set(ref.path, { ...users.get(ref.path), ...payload });
                return;
              }
              if (ref.path.startsWith("antiAbuseDeviceClaims/")) {
                equal(options, { merge: true });
                deviceClaims.set(ref.path, { ...deviceClaims.get(ref.path), ...payload });
                return;
              }
              if (ref.path.startsWith("antiAbuseAuditLogs/")) {
                auditLogs.push(payload);
                return;
              }
              throw new Error("UNEXPECTED_TX_SET_PATH: " + ref.path);
            },
          });
        });
        serial = work.then(() => {}, () => {});
        return work;
      },
    }),
  };
  return originalLoad.call(this, request, parent, ...args);
};
globalThis.fetch = async () => { throw new Error("UNEXPECTED_NETWORK"); };
const handler = require("../../api/access/bootstrap-trial").default;
Module._load = originalLoad;
async function invoke(overrides: Record<string, unknown> = {}) {
  let status = 0;
  let body: Record<string, unknown> = {};
  const headers: Record<string, string> = {};
  await handler({ method: "POST", headers: { authorization: "Bearer synthetic-token", origin: "https://localhost" }, ...overrides }, {
    setHeader(name: string, value: string) { headers[name] = value; },
    status(value: number) { status = value; return this; },
    json(value: Record<string, unknown>) { body = value; }, end() {},
  });
  equal(JSON.stringify(body).includes("sensitive-provider-payload"), false);
  equal(headers["Cache-Control"], "no-store");
  return { status, body, headers };
}

test("bootstrap authenticates, preserves authority, writes once and fails closed", async () => {
  equal((await invoke({ headers: {} })).status, 401);
  authFailure = true;
  equal((await invoke()).status, 401);
  authFailure = false;
  equal(writes, 0);
  equal((await invoke({ method: "GET" })).status, 405);
  const preflight = await invoke({ method: "OPTIONS" });
  equal(preflight.status, 204);
  equal(preflight.headers["Access-Control-Allow-Origin"], "https://localhost");
  equal(preflight.headers["Access-Control-Allow-Headers"], "Authorization, Content-Type, X-Firebase-AppCheck");
  equal((await invoke({ headers: { origin: "https://untrusted.invalid" } })).status, 403);
  for (const body of [{ uid: "synthetic-other" }, { trialStartedAt: "2099-01-01" }, { trialEndsAt: "2099-01-08" }, [], "invalid"]) equal((await invoke({ body })).status, 400);
  equal(writes, 0);
  users.set("users/synthetic-owner", { displayName: "synthetic" });
  const before = Date.now();
  const outcomes = await Promise.all([invoke(), invoke()]);
  equal(outcomes.map(value => value.body.outcome), ["PROVISIONED", "ALREADY_PRESENT"]);
  equal(writes, 1);
  equal(auditLogs.length, 1);
  const grant = { ...users.get("users/synthetic-owner") } as Record<string, unknown>;
  equal(Date.parse(String(grant.trialEndsAt)) - Date.parse(String(grant.trialStartedAt)), 604800000);
  equal(Date.parse(String(grant.trialStartedAt)) >= before && Date.parse(String(grant.trialStartedAt)) <= Date.now(), true);
  equal(grant.accessStart, grant.trialStartedAt);
  equal(grant.accessUntil, grant.trialEndsAt);
  equal(grant.entitlementSource, "server_access_bootstrap");
  equal(grant.updatedBy, "server_access_bootstrap");
  equal(grant.antiAbuseMode, "observe");
  equal(grant.trialEligibilityStatus, "ELIGIBLE_FREE");
  equal(grant.displayName, "synthetic");
  equal((await invoke()).body.outcome, "ALREADY_PRESENT");
  equal(users.get("users/synthetic-owner"), grant);
  users.set("users/synthetic-owner", { ...grant, trialStartedAt: "2020-01-01T00:00:00.000Z", accessStart: "2020-01-01T00:00:00.000Z", trialEndsAt: "2020-01-08T00:00:00.000Z", accessUntil: "2020-01-08T00:00:00.000Z" });
  equal((await invoke()).body.outcome, "ALREADY_PRESENT");
  for (const higher of [{ membershipType: "LIFETIME" }, { membershipType: "PREMIUM", entitlementSource: "google_play" }, { badge: "other", guardianBadge: "Founder" }, { isPremium: true }]) {
    users.set("users/synthetic-owner", higher);
    equal((await invoke()).body.outcome, "HIGHER_ENTITLEMENT");
    equal(users.get("users/synthetic-owner"), higher);
  }
  for (const invalid of [
    { trialStartedAt: grant.trialStartedAt }, { trialEndsAt: null }, { membershipType: "TRIAL" },
    { ...grant, entitlementSource: "firebase_auth_creation_time" }, { ...grant, accessSource: "client" },
    { ...grant, trialStartedAt: "invalid" }, { ...grant, trialEndsAt: "2099-01-01" },
    { ...grant, updatedBy: undefined }, { ...grant, accessUntil: null },
    { ...grant, accessSourceVersion: "unknown" }, { ...grant, entitlementSource: undefined },
  ]) {
    users.set("users/synthetic-owner", invalid);
    const response = await invoke();
    equal(response.status, 409);
    equal(response.body, { ok: false, outcome: "DATA_CONFLICT", eligibilityStatus: "ALREADY_GRANTED", mode: "observe" });
    equal(users.get("users/synthetic-owner"), invalid);
  }
  equal(writes, 1);
  users.delete("users/synthetic-owner"); dbFailure = true;
  equal((await invoke()).body.error, "ENTITLEMENT_WRITE_FAILURE");
  dbFailure = false;
  equal(writes, 1);

  const signalPayload = { platform: "android", appVersionCode: 122, deviceIdHash: "a1b2c3d4e5f60718293a4b5c6d7e8f90" };
  const firstClaim = await invoke({ body: signalPayload });
  equal(firstClaim.status, 200);
  equal(firstClaim.body.outcome, "PROVISIONED");
  equal(firstClaim.body.eligibilityStatus, "ELIGIBLE_FREE");
  equal(firstClaim.body.mode, "observe");
  equal(deviceClaims.size, 1);

  activeUid = "synthetic-owner-2";
  const secondClaim = await invoke({ body: signalPayload });
  equal(secondClaim.status, 200);
  equal(secondClaim.body.outcome, "PROVISIONED");
  equal(secondClaim.body.mode, "observe");
  equal(auditLogs[auditLogs.length - 1]?.reasons, ["DEVICE_CLAIM_EXISTS_OTHER_UID", "MODE_OBSERVE_ONLY"]);
  equal(writes, 3);
  console.log(`bootstrap assertions: ${assertions}`);
});