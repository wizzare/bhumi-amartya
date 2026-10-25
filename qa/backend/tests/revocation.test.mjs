import assert from "node:assert/strict";
import test from "node:test";
import { createIdentityToolkitRevocationChecker } from "../lib/revocation.mjs";

const LOOKUP_URL = "https://identitytoolkit.googleapis.com/v1/accounts:lookup";
const API_KEY = "synthetic-qa-api-key";
const NOW = Math.floor(Date.parse("2026-10-23T12:00:00.000Z") / 1000);
const decoded = { uid: "synthetic-user-a", claims: { auth_time: NOW - 60 } };

function response(body, ok = true) {
  return { ok, json: async () => body };
}

function checker(fetchImpl) {
  return createIdentityToolkitRevocationChecker({
    fetchImpl,
    lookupUrl: LOOKUP_URL,
    apiKey: API_KEY,
  });
}

const rejectsWith = async (fetchImpl, token, expected, value = decoded) => {
  await assert.rejects(
    () => checker(fetchImpl)(token, value),
    (error) => error.code === expected,
  );
};

test("accepts a matching, enabled, non-revoked QA user", async () => {
  let captured;
  const fetchImpl = async (url, init) => {
    captured = { url, init };
    return response({ users: [{ localId: "synthetic-user-a", disabled: false, validSince: String(NOW - 120) }] });
  };
  await checker(fetchImpl)("synthetic-token", decoded);
  assert.equal(captured.url, `${LOOKUP_URL}?key=${encodeURIComponent(API_KEY)}`);
  assert.equal(captured.init.method, "POST");
  assert.equal(captured.init.headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(captured.init.body), { idToken: "synthetic-token" });

  await checker(async () => response({ users: [{ localId: "synthetic-user-a", disabled: false }] }))("synthetic-token", decoded);
});

test("rejects revoked, disabled, and mismatched accounts", async () => {
  await rejectsWith(
    async () => response({ users: [{ localId: "synthetic-user-a", disabled: false, validSince: String(NOW) }] }),
    "synthetic-token",
    "TOKEN_REVOKED",
  );
  await rejectsWith(
    async () => response({ users: [{ localId: "synthetic-user-a", disabled: true, validSince: "0" }] }),
    "synthetic-token",
    "TOKEN_USER_DISABLED",
  );
  await rejectsWith(
    async () => response({ users: [{ localId: "synthetic-user-b", disabled: false, validSince: "0" }] }),
    "synthetic-token",
    "TOKEN_REVOCATION_SUBJECT_MISMATCH",
  );
});

test("fails closed on missing auth_time, malformed responses, and upstream errors", async () => {
  await rejectsWith(async () => response({ users: [] }), "synthetic-token", "TOKEN_AUTH_TIME", { uid: "synthetic-user-a", claims: {} });
  await rejectsWith(async () => response({ users: [] }), "synthetic-token", "TOKEN_REVOCATION_INVALID");
  await rejectsWith(async () => response({ users: [{ localId: "synthetic-user-a", disabled: false, validSince: "not-a-number" }] }), "synthetic-token", "TOKEN_REVOCATION_INVALID");
  await rejectsWith(async () => response({ users: [{ localId: "synthetic-user-a", disabled: false, validSince: "0" }] }, false), "synthetic-token", "TOKEN_REVOCATION_UNAVAILABLE");
  await rejectsWith(async () => { throw new Error("network"); }, "synthetic-token", "TOKEN_REVOCATION_UNAVAILABLE");
  await rejectsWith(async () => response({ users: [{ localId: "synthetic-user-a", disabled: false, validSince: "0" }] }), "", "TOKEN_REVOCATION_INVALID");
});
