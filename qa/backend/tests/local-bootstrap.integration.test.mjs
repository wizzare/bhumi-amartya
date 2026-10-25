import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import { deleteApp } from "firebase-admin/app";
import { loadConfig } from "../lib/config.mjs";
import { startLocalBootstrapServer } from "../lib/server.mjs";
import {
  closeTestDb,
  closeTestServer,
  createSigningMaterial,
  createTestDb,
  deleteUser,
  post,
  readUser,
  request,
  signToken,
  startTestServer,
  syntheticClaims,
  uniqueUid,
} from "./helpers.mjs";

const EMULATOR = process.env.FIRESTORE_EMULATOR_HOST;
const integrationTest = EMULATOR ? test : test.skip;
const ISSUER = "https://securetoken.google.com/demo-bhumi-qa-bootstrap";
const AUDIENCE = "demo-bhumi-qa-bootstrap";
const material = createSigningMaterial();
const TRIAL_ROUTE = "/api/access/bootstrap-trial";
const FIRST_LOGIN_ROUTE = "/api/qa/bootstrap-first-login";

let app;
let db;
let server;
let baseUrl;

if (EMULATOR) {
  before(async () => {
    const testDb = await createTestDb();
    app = testDb.app;
    db = testDb.db;
    const started = await startTestServer({
      db,
      jwks: material.publicJwks,
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    server = started.server;
    baseUrl = started.baseUrl;
  });

  after(async () => {
    if (server) await closeTestServer(server);
    if (app) await closeTestDb(app);
  });
}

function tokenFor(uid, overrides = {}) {
  return signToken({
    material,
    issuer: ISSUER,
    audience: AUDIENCE,
    subject: uid,
    claims: syntheticClaims(uid),
    ...overrides,
  });
}

async function cleanup(uid) {
  await deleteUser(db, uid);
}

integrationTest("health endpoint exposes only local harness metadata", async () => {
  const health = await request(baseUrl, "/healthz");
  assert.equal(health.status, 200);
  assert.equal(health.body.service, "qa-local-bootstrap");
  assert.equal(health.body.projectId, "demo-bhumi-qa-bootstrap");
  assert.equal(health.body.issuer, ISSUER);
  assert.equal(health.body.audience, AUDIENCE);
  assert.equal(JSON.stringify(health.body).includes("PRIVATE_KEY"), false);
});

integrationTest("trial-only route provisions canonical access without creating a profile", async () => {
  const uid = uniqueUid("trial-only");
  await cleanup(uid);
  const token = tokenFor(uid);

  const first = await post(baseUrl, TRIAL_ROUTE, token);
  assert.equal(first.status, 200);
  assert.equal(first.body.outcome, "PROVISIONED");
  const created = await readUser(db, uid);
  assert.ok(created);
  assert.equal(created.uid, undefined);
  assert.equal(created.plan, "free_trial");
  assert.equal(created.membershipType, "TRIAL");
  assert.equal(created.membership, "REGULAR_TRIAL");
  assert.equal(created.subscriptionStatus, "trialing");
  assert.equal(created.entitlementSource, "server_access_bootstrap");
  assert.equal(created.accessSource, "server_access_bootstrap");
  assert.equal(created.accessSourceVersion, "2026-09-13");
  assert.equal(created.updatedBy, "server_access_bootstrap");
  assert.equal(created.accessStart, created.trialStartedAt);
  assert.equal(created.accessUntil, created.trialEndsAt);
  assert.equal(Date.parse(created.trialEndsAt) - Date.parse(created.trialStartedAt), 604800000);
  assert.equal(created.fullName, undefined);
  assert.equal(created.createdAt, undefined);

  const replay = await post(baseUrl, TRIAL_ROUTE, token);
  assert.equal(replay.status, 200);
  assert.equal(replay.body.outcome, "ALREADY_PRESENT");
  const afterReplay = await readUser(db, uid);
  assert.equal(afterReplay.trialStartedAt, created.trialStartedAt);
  assert.equal(afterReplay.trialEndsAt, created.trialEndsAt);
});

integrationTest("first-login route creates a minimal profile and canonical trial", async () => {
  const uid = uniqueUid("first-login");
  await cleanup(uid);
  const token = tokenFor(uid);

  const first = await post(baseUrl, FIRST_LOGIN_ROUTE, token, { body: {} });
  assert.equal(first.status, 200);
  assert.equal(first.body.outcome, "PROVISIONED_NEW_USER");
  const created = await readUser(db, uid);
  assert.ok(created);
  assert.equal(created.uid, uid);
  assert.equal(created.fullName, "Synthetic QA User");
  assert.equal(created.displayName, "Synthetic QA User");
  assert.equal(created.email, `${uid}@example.invalid`);
  assert.equal(created.language, "id");
  assert.equal(created.setupCompleted, false);
  assert.equal(created.blueprintStatus, "missing");
  assert.ok(created.createdAt);
  assert.equal(created.plan, "free_trial");
  assert.equal(created.membershipType, "TRIAL");
  assert.equal(Date.parse(created.trialEndsAt) - Date.parse(created.trialStartedAt), 604800000);

  const replay = await post(baseUrl, FIRST_LOGIN_ROUTE, token, { body: {} });
  assert.equal(replay.status, 200);
  assert.equal(replay.body.outcome, "ALREADY_PRESENT");
  const afterReplay = await readUser(db, uid);
  assert.equal(afterReplay.trialStartedAt, created.trialStartedAt);
  assert.equal(afterReplay.fullName, created.fullName);
});

integrationTest("first-login preserves an existing profile and adds the trial", async () => {
  const uid = uniqueUid("existing-profile");
  await cleanup(uid);
  await db.doc(`users/${uid}`).set({
    uid,
    fullName: "Existing Synthetic User",
    setupCompleted: true,
    blueprintStatus: "ready",
  });
  const token = tokenFor(uid);

  const result = await post(baseUrl, FIRST_LOGIN_ROUTE, token, { body: {} });
  assert.equal(result.status, 200);
  assert.equal(result.body.outcome, "PROVISIONED_EXISTING_PROFILE");
  const updated = await readUser(db, uid);
  assert.equal(updated.fullName, "Existing Synthetic User");
  assert.equal(updated.setupCompleted, true);
  assert.equal(updated.blueprintStatus, "ready");
  assert.equal(updated.plan, "free_trial");
  assert.equal(updated.trialStartedAt, result.body.trialStartedAt);
});

integrationTest("first-login preserves higher entitlements without writing a trial", async () => {
  const uid = uniqueUid("higher");
  await cleanup(uid);
  await db.doc(`users/${uid}`).set({
    uid,
    fullName: "Synthetic Lifetime User",
    membershipType: "LIFETIME",
  });
  const token = tokenFor(uid);

  const result = await post(baseUrl, FIRST_LOGIN_ROUTE, token, { body: {} });
  assert.equal(result.status, 200);
  assert.equal(result.body.outcome, "HIGHER_ENTITLEMENT");
  const unchanged = await readUser(db, uid);
  assert.equal(unchanged.membershipType, "LIFETIME");
  assert.equal(unchanged.trialStartedAt, undefined);
  assert.equal(unchanged.trialEndsAt, undefined);
});

integrationTest("first-login fails closed on malformed trial state", async () => {
  const uid = uniqueUid("malformed");
  await cleanup(uid);
  await db.doc(`users/${uid}`).set({
    uid,
    fullName: "Synthetic Malformed User",
    trialStartedAt: "2020-01-01T00:00:00.000Z",
  });
  const token = tokenFor(uid);

  const result = await post(baseUrl, FIRST_LOGIN_ROUTE, token, { body: {} });
  assert.equal(result.status, 409);
  assert.equal(result.body.outcome, "DATA_CONFLICT");
  const unchanged = await readUser(db, uid);
  assert.equal(unchanged.trialStartedAt, "2020-01-01T00:00:00.000Z");
  assert.equal(unchanged.trialEndsAt, undefined);
});

integrationTest("token subject isolation prevents cross-user writes", async () => {
  const uidA = uniqueUid("owner-a");
  const uidB = uniqueUid("owner-b");
  const uidVictim = uniqueUid("victim");
  await cleanup(uidA);
  await cleanup(uidB);
  await cleanup(uidVictim);
  const tokenA = tokenFor(uidA);

  const first = await post(baseUrl, FIRST_LOGIN_ROUTE, tokenA, { body: {} });
  assert.equal(first.status, 200);
  assert.ok(await readUser(db, uidA));
  assert.equal(await readUser(db, uidB), null);
  assert.equal(await readUser(db, uidVictim), null);

  const bodyAttempt = await post(baseUrl, FIRST_LOGIN_ROUTE, tokenA, { body: { uid: uidVictim } });
  assert.equal(bodyAttempt.status, 400);
  assert.equal(await readUser(db, uidVictim), null);

  const tokenB = tokenFor(uidB);
  const second = await post(baseUrl, FIRST_LOGIN_ROUTE, tokenB, { body: {} });
  assert.equal(second.status, 200);
  assert.ok(await readUser(db, uidB));
  const docA = await readUser(db, uidA);
  assert.equal(docA.trialStartedAt, first.body.trialStartedAt);
  assert.equal(docA.trialEndsAt, first.body.trialEndsAt);
});

integrationTest("concurrent first-login requests are idempotent", async () => {
  const uid = uniqueUid("concurrent");
  await cleanup(uid);
  const token = tokenFor(uid);

  const results = await Promise.all([
    post(baseUrl, FIRST_LOGIN_ROUTE, token, { body: {} }),
    post(baseUrl, FIRST_LOGIN_ROUTE, token, { body: {} }),
  ]);
  const outcomes = results.map((result) => result.body.outcome).sort();
  assert.deepEqual(outcomes, ["ALREADY_PRESENT", "PROVISIONED_NEW_USER"]);
  const doc = await readUser(db, uid);
  assert.equal(doc.plan, "free_trial");
  assert.equal(Date.parse(doc.trialEndsAt) - Date.parse(doc.trialStartedAt), 604800000);
});

integrationTest("rejects missing, invalid, and production tokens", async () => {
  const uid = uniqueUid("auth");
  await cleanup(uid);

  const missing = await post(baseUrl, TRIAL_ROUTE, null);
  assert.equal(missing.status, 401);
  assert.equal(missing.body.outcome, "AUTH_MISSING");

  const invalid = await post(baseUrl, TRIAL_ROUTE, "not-a-token");
  assert.equal(invalid.status, 401);
  assert.equal(invalid.body.outcome, "AUTH_INVALID");

  const productionToken = signToken({
    material,
    issuer: "https://securetoken.google.com/bhumiamartya-fe85c",
    audience: "bhumiamartya-fe85c",
    subject: uid,
    claims: syntheticClaims(uid),
  });
  const production = await post(baseUrl, TRIAL_ROUTE, productionToken);
  assert.equal(production.status, 401);
  assert.equal(production.body.outcome, "AUTH_INVALID");
  assert.equal(await readUser(db, uid), null);
});

integrationTest("enforces origin, method, and body boundaries", async () => {
  const uid = uniqueUid("boundaries");
  await cleanup(uid);
  const token = tokenFor(uid);

  const badOrigin = await post(baseUrl, TRIAL_ROUTE, token, { origin: "https://attacker.invalid" });
  assert.equal(badOrigin.status, 403);
  assert.equal(badOrigin.body.outcome, "ORIGIN_NOT_ALLOWED");

  const get = await request(baseUrl, TRIAL_ROUTE, { method: "GET" });
  assert.equal(get.status, 405);
  assert.equal(get.body.outcome, "METHOD_NOT_ALLOWED");

  const preflight = await request(baseUrl, TRIAL_ROUTE, {
    method: "OPTIONS",
    headers: { Origin: "https://localhost" },
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), "https://localhost");

  const body = await post(baseUrl, TRIAL_ROUTE, token, { body: { uid: "other" } });
  assert.equal(body.status, 400);
  assert.equal(body.body.outcome, "BODY_INVALID");

  const largeBody = await post(baseUrl, TRIAL_ROUTE, token, { body: "x".repeat(17000) });
  assert.equal(largeBody.status, 413);
  assert.equal(largeBody.body.outcome, "BODY_INVALID");
  assert.equal(await readUser(db, uid), null);
});

integrationTest("accepts an empty object body without granting client-selected identity", async () => {
  const uid = uniqueUid("empty-body");
  await cleanup(uid);
  const token = tokenFor(uid);
  const result = await post(baseUrl, FIRST_LOGIN_ROUTE, token, { body: {} });
  assert.equal(result.status, 200);
  const doc = await readUser(db, uid);
  assert.equal(doc.uid, uid);
  assert.equal(doc.trialStartedAt, result.body.trialStartedAt);
});

integrationTest("runtime entrypoint starts with explicit local configuration", async () => {
  const config = loadConfig({
    ...process.env,
    BHUMI_QA_BACKEND: "1",
    QA_BOOTSTRAP_PROJECT_ID: "demo-bhumi-qa-bootstrap",
    QA_BOOTSTRAP_ISSUER: ISSUER,
    QA_BOOTSTRAP_AUDIENCE: AUDIENCE,
    QA_BOOTSTRAP_JWKS_JSON: JSON.stringify(material.publicJwks),
    QA_BOOTSTRAP_PORT: "0",
  });
  const started = await startLocalBootstrapServer(config);
  const address = started.server.address();
  const health = await request(`http://127.0.0.1:${address.port}`, "/healthz");
  assert.equal(health.status, 200);
  assert.equal(health.body.projectId, "demo-bhumi-qa-bootstrap");
  await closeTestServer(started.server);
  await deleteApp(started.app);
});
