import assert from "node:assert/strict";
import test from "node:test";
import { createLocalBootstrapServer } from "../lib/server.mjs";

const config = {
  service: "qa-local-bootstrap",
  projectId: "bhumi-amartya-qa",
  authProjectId: "bhumi-amartya-qa",
  firestoreProjectId: "demo-bhumi-qa-bootstrap",
  firestoreHost: "127.0.0.1:8088",
  issuer: "https://securetoken.google.com/bhumi-amartya-qa",
  audience: "bhumi-amartya-qa",
  allowedOrigins: ["https://localhost", "http://localhost", "capacitor://localhost"],
  requireRevocation: true,
  tls: null,
};

function fakeDb() {
  const writes = [];
  return {
    writes,
    doc: (path) => ({ path }),
    runTransaction: async (callback) => callback({
      get: async () => ({ exists: false, data: () => ({}) }),
      set: (ref, data) => writes.push({ path: ref.path, data }),
    }),
  };
}

const verifier = async () => ({ uid: "synthetic-user-a", claims: { auth_time: 100 } });

async function start(revocationCheck, db = fakeDb()) {
  const server = createLocalBootstrapServer({ config, verifier, revocationCheck, db });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return { server, db, baseUrl: `http://127.0.0.1:${server.address().port}` };
}

async function post(baseUrl, token = "synthetic-token") {
  const response = await fetch(`${baseUrl}/api/access/bootstrap-trial`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: "{}",
  });
  return { status: response.status, body: await response.json() };
}

test("requires a revocation checker when real QA is configured", () => {
  assert.throws(
    () => createLocalBootstrapServer({ config, verifier, db: fakeDb() }),
    (error) => error.code === "QA_REVOCATION_CONFIG_REQUIRED",
  );
});

test("rejects requests when the revocation check fails", async () => {
  const { server, db, baseUrl } = await start(async () => {
    throw Object.assign(new Error("TOKEN_REVOKED"), { code: "TOKEN_REVOKED" });
  });
  try {
    const result = await post(baseUrl);
    assert.equal(result.status, 401);
    assert.equal(result.body.outcome, "AUTH_INVALID");
    assert.equal(db.writes.length, 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("fails closed with 503 when the revocation service is unavailable", async () => {
  const { server, db, baseUrl } = await start(async () => {
    throw Object.assign(new Error("TOKEN_REVOCATION_UNAVAILABLE"), { code: "TOKEN_REVOCATION_UNAVAILABLE" });
  });
  try {
    const result = await post(baseUrl);
    assert.equal(result.status, 503);
    assert.equal(result.body.outcome, "QA_BACKEND_UNAVAILABLE");
    assert.equal(db.writes.length, 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("provisions only after signature and revocation both pass", async () => {
  let checkedToken;
  const { server, db, baseUrl } = await start(async (token) => { checkedToken = token; });
  try {
    const result = await post(baseUrl);
    assert.equal(result.status, 200);
    assert.equal(result.body.outcome, "PROVISIONED");
    assert.equal(checkedToken, "synthetic-token");
    assert.equal(db.writes.length, 1);
    assert.equal(db.writes[0].path, "users/synthetic-user-a");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
