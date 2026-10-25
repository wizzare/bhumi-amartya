import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import {
  closeTestDb,
  createSigningMaterial,
  createTestDb,
  post,
  readUser,
  request,
  signToken,
  syntheticClaims,
  uniqueUid,
} from "../../backend/tests/helpers.mjs";
import { createTokenVerifier } from "../../backend/lib/token-verifier.mjs";
import { loadVercelQaConfig } from "../lib/config.mjs";
import { createVercelQaHandler } from "../lib/handler.mjs";
import { createRateLimiter } from "../lib/rate-limit.mjs";

const config = loadVercelQaConfig({
  BHUMI_QA_VERCEL: "1",
  QA_VERCEL_WIF_POOL_ID: "vercel-qa",
  QA_VERCEL_WIF_PROVIDER_ID: "vercel-qa",
  QA_VERCEL_SERVICE_ACCOUNT_EMAIL: "qa-bootstrap@bhumi-amartya-qa.iam.gserviceaccount.com",
});

const material = createSigningMaterial();
const oidcHeaders = { "x-vercel-oidc-token": "header.payload.signature" };

function tokenFor(uid, overrides = {}) {
  return signToken({
    material,
    issuer: config.issuer,
    audience: config.audience,
    subject: uid,
    claims: syntheticClaims(uid),
    ...overrides,
  });
}

async function startCandidateServer({ db, rateLimiter, servicesFactory } = {}) {
  const verifier = createTokenVerifier({
    jwks: material.publicJwks,
    issuer: config.issuer,
    audience: config.audience,
  });
  const handler = createVercelQaHandler({
    config,
    rateLimiter,
    servicesFactory: servicesFactory || (async () => ({
      db,
      verifier,
      dispose: async () => undefined,
    })),
  });
  const server = createServer(handler);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}

async function closeServer(server) {
  await new Promise((resolve) => server.close(resolve));
}

test("Vercel QA candidate handler", async (t) => {
  const { app, db } = await createTestDb();
  const { server, baseUrl } = await startCandidateServer({ db });
  t.after(async () => {
    await closeServer(server);
    await closeTestDb(app);
  });

  await t.test("healthz and preflight do not require an OIDC token", async () => {
    const localHealth = await request(baseUrl, "/healthz");
    assert.equal(localHealth.status, 200);
    assert.equal(localHealth.body.projectId, "bhumi-amartya-qa");
    const vercelHealth = await request(baseUrl, "/api/healthz");
    assert.equal(vercelHealth.status, 200);
    assert.equal(vercelHealth.body.projectId, "bhumi-amartya-qa");
    const preflight = await request(baseUrl, "/api/access/bootstrap-trial", {
      method: "OPTIONS",
      headers: { Origin: "https://localhost" },
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get("access-control-allow-origin"), "https://localhost");
  });

  await t.test("rejects disallowed origins and unknown routes", async () => {
    const origin = await post(baseUrl, "/api/access/bootstrap-trial", null, {
      origin: "https://evil.example",
      headers: oidcHeaders,
    });
    assert.equal(origin.status, 403);
    assert.equal(origin.body.outcome, "ORIGIN_NOT_ALLOWED");
    const missing = await request(baseUrl, "/api/unknown");
    assert.equal(missing.status, 404);
  });

  await t.test("returns 401 without a Firebase token and 503 without OIDC", async () => {
    const missing = await post(baseUrl, "/api/access/bootstrap-trial", null, {
      origin: "https://localhost",
      headers: oidcHeaders,
    });
    assert.equal(missing.status, 401);
    const noOidc = await post(baseUrl, "/api/access/bootstrap-trial", tokenFor(uniqueUid("no-oidc")), {
      origin: "https://localhost",
    });
    assert.equal(noOidc.status, 503);
    assert.equal(noOidc.body.outcome, "QA_BACKEND_UNAVAILABLE");
  });

  await t.test("rejects non-empty bodies and invalid Firebase tokens", async () => {
    const uid = uniqueUid("invalid");
    const body = await post(baseUrl, "/api/access/bootstrap-trial", tokenFor(uid), {
      origin: "https://localhost",
      headers: oidcHeaders,
      body: { uid: "attacker" },
    });
    assert.equal(body.status, 400);
    const production = await post(baseUrl, "/api/access/bootstrap-trial", signToken({
      material,
      issuer: "https://securetoken.google.com/bhumiamartya-fe85c",
      audience: "bhumiamartya-fe85c",
      subject: uid,
    }), {
      origin: "https://localhost",
      headers: oidcHeaders,
    });
    assert.equal(production.status, 401);
  });

  await t.test("provisions the canonical seven-day trial and is idempotent", async () => {
    const uid = uniqueUid("trial");
    const first = await post(baseUrl, "/api/access/bootstrap-trial", tokenFor(uid), {
      origin: "https://localhost",
      headers: oidcHeaders,
    });
    assert.equal(first.status, 200);
    assert.equal(first.body.outcome, "PROVISIONED");
    const user = await readUser(db, uid);
    assert.equal(user.entitlementSource, "server_access_bootstrap");
    assert.equal(user.accessSourceVersion, "2026-09-13");
    assert.equal(Date.parse(user.trialEndsAt) - Date.parse(user.trialStartedAt), 7 * 24 * 60 * 60 * 1000);
    const second = await post(baseUrl, "/api/access/bootstrap-trial", tokenFor(uid), {
      origin: "https://localhost",
      headers: oidcHeaders,
    });
    assert.equal(second.status, 200);
    assert.equal(second.body.outcome, "ALREADY_PRESENT");
  });

  await t.test("creates a minimal profile and handles existing-user first login", async () => {
    const uid = uniqueUid("first-login");
    const first = await post(baseUrl, "/api/qa/bootstrap-first-login", tokenFor(uid), {
      origin: "https://localhost",
      headers: oidcHeaders,
    });
    assert.equal(first.status, 200);
    assert.equal(first.body.outcome, "PROVISIONED_NEW_USER");
    const user = await readUser(db, uid);
    assert.equal(user.fullName, "Synthetic QA User");
    assert.equal(user.email, `${uid}@example.invalid`);
    assert.equal(user.onboardingCompleted, false);
    const second = await post(baseUrl, "/api/qa/bootstrap-first-login", tokenFor(uid), {
      origin: "https://localhost",
      headers: oidcHeaders,
    });
    assert.equal(second.status, 200);
    assert.equal(second.body.outcome, "ALREADY_PRESENT");
  });
});

test("rate limit rejects before auth work", async (t) => {
  const { app, db } = await createTestDb();
  const { server, baseUrl } = await startCandidateServer({
    db,
    rateLimiter: createRateLimiter({ limit: 1, windowMs: 60_000 }),
  });
  t.after(async () => {
    await closeServer(server);
    await closeTestDb(app);
  });

  const first = await post(baseUrl, "/api/access/bootstrap-trial", null, {
    origin: "https://localhost",
    headers: oidcHeaders,
  });
  assert.equal(first.status, 401);
  const second = await post(baseUrl, "/api/access/bootstrap-trial", null, {
    origin: "https://localhost",
    headers: oidcHeaders,
  });
  assert.equal(second.status, 429);
  assert.equal(second.body.outcome, "RATE_LIMITED");
  assert.equal(second.headers.get("access-control-allow-origin"), "https://localhost");
});
