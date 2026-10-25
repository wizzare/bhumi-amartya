import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Module = require("node:module");
const originalLoad = Module._load;
let data: Record<string, unknown> | undefined;
let writes = 0;
let authFailure = false;
let dbFailure = false;
let assertions = 0;
const equal = (actual: unknown, expected: unknown) => { assertions++; assert.deepEqual(actual, expected); };
let serial = Promise.resolve();
Module._load = function(request: string, parent: unknown, ...args: unknown[]) {
  if (request.endsWith("/firebaseAdmin")) return {
    adminAuth: () => ({ verifyIdToken: async (token: string, revoked: boolean) => {
      equal([token, revoked], ["synthetic-token", true]);
      if (authFailure) throw new Error("sensitive-provider-payload");
      return { uid: "synthetic-owner" };
    } }),
    adminDb: () => ({
      doc: (path: string) => { equal(path, "users/synthetic-owner"); return path; },
      runTransaction: (callback: (tx: unknown) => Promise<unknown>) => {
        const work = serial.then(async () => {
          if (dbFailure) throw new Error("sensitive-provider-payload");
          return callback({
            get: async () => ({ data: () => data }),
            set: (_ref: string, grant: Record<string, unknown>, options: unknown) => {
              equal(options, { merge: true });
              writes++; data = { ...data, ...grant };
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
  equal(preflight.headers["Access-Control-Allow-Headers"], "Authorization, Content-Type");
  equal((await invoke({ headers: { origin: "https://untrusted.invalid" } })).status, 403);
  for (const body of [{ uid: "synthetic-other" }, { trialStartedAt: "2099-01-01" }, { trialEndsAt: "2099-01-08" }, [], "invalid"]) equal((await invoke({ body })).status, 400);
  equal(writes, 0);
  data = { displayName: "synthetic" };
  const before = Date.now();
  const outcomes = await Promise.all([invoke(), invoke()]);
  equal(outcomes.map(value => value.body.outcome), ["PROVISIONED", "ALREADY_PRESENT"]);
  equal(writes, 1);
  const grant = { ...data } as Record<string, unknown>;
  equal(Date.parse(String(grant.trialEndsAt)) - Date.parse(String(grant.trialStartedAt)), 604800000);
  equal(Date.parse(String(grant.trialStartedAt)) >= before && Date.parse(String(grant.trialStartedAt)) <= Date.now(), true);
  equal(grant.accessStart, grant.trialStartedAt);
  equal(grant.accessUntil, grant.trialEndsAt);
  equal(grant.entitlementSource, "server_access_bootstrap");
  equal(grant.updatedBy, "server_access_bootstrap");
  equal(grant.displayName, "synthetic");
  equal((await invoke()).body.outcome, "ALREADY_PRESENT");
  equal(data, grant);
  data = { ...grant, trialStartedAt: "2020-01-01T00:00:00.000Z", accessStart: "2020-01-01T00:00:00.000Z", trialEndsAt: "2020-01-08T00:00:00.000Z", accessUntil: "2020-01-08T00:00:00.000Z" };
  equal((await invoke()).body.outcome, "ALREADY_PRESENT");
  for (const higher of [{ membershipType: "LIFETIME" }, { membershipType: "PREMIUM", entitlementSource: "google_play" }, { badge: "other", guardianBadge: "Founder" }, { isPremium: true }]) {
    data = higher;
    equal((await invoke()).body.outcome, "HIGHER_ENTITLEMENT");
    equal(data, higher);
  }
  for (const invalid of [
    { trialStartedAt: grant.trialStartedAt }, { trialEndsAt: null }, { membershipType: "TRIAL" },
    { ...grant, entitlementSource: "firebase_auth_creation_time" }, { ...grant, accessSource: "client" },
    { ...grant, trialStartedAt: "invalid" }, { ...grant, trialEndsAt: "2099-01-01" },
    { ...grant, updatedBy: undefined }, { ...grant, accessUntil: null },
    { ...grant, accessSourceVersion: "unknown" }, { ...grant, entitlementSource: undefined },
  ]) {
    data = invalid;
    const response = await invoke();
    equal(response.status, 409);
    equal(response.body, { ok: false, outcome: "DATA_CONFLICT" });
    equal(data, invalid);
  }
  equal(writes, 1);
  data = undefined; dbFailure = true;
  equal((await invoke()).body.error, "ENTITLEMENT_WRITE_FAILURE");
  equal(writes, 1);
  console.log(`bootstrap assertions: ${assertions}`);
});
