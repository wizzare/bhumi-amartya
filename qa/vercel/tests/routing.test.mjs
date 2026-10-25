import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import entrypoint from "../api/healthz.mjs";

const requiredEnv = {
  BHUMI_QA_VERCEL: "1",
  QA_VERCEL_PROJECT_ID: "bhumi-amartya-qa",
  QA_VERCEL_PROJECT_NUMBER: "125330899891",
  QA_VERCEL_WIF_POOL_ID: "vercel-qa",
  QA_VERCEL_WIF_PROVIDER_ID: "vercel-qa",
  QA_VERCEL_SERVICE_ACCOUNT_EMAIL: "qa-bootstrap@bhumi-amartya-qa.iam.gserviceaccount.com",
};

async function startServer() {
  const server = createServer(entrypoint);
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

test("Vercel health route resolves at /api/healthz without private data", async (t) => {
  const overridden = [
    ...Object.keys(requiredEnv),
    "FIREBASE_CONFIG",
    "GCLOUD_PROJECT",
    "GOOGLE_CLOUD_PROJECT",
    "FIREBASE_PROJECT_ID",
  ];
  const previous = {};
  for (const key of overridden) previous[key] = process.env[key];
  for (const [key, value] of Object.entries(requiredEnv)) process.env[key] = value;
  for (const key of ["FIREBASE_CONFIG", "GCLOUD_PROJECT", "GOOGLE_CLOUD_PROJECT", "FIREBASE_PROJECT_ID"]) {
    delete process.env[key];
  }
  const { server, baseUrl } = await startServer();
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  const response = await fetch(`${baseUrl}/api/healthz`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.projectId, "bhumi-amartya-qa");
  assert.equal(body.firstLoginRoute, true);
  assert.deepEqual(Object.keys(body).sort(), [
    "audience",
    "firstLoginRoute",
    "issuer",
    "ok",
    "projectId",
    "service",
  ]);
  assert.doesNotMatch(JSON.stringify(body), /\b(private_key|client_email|authorization|bearer|credential)\b/i);

  const alias = await fetch(`${baseUrl}/healthz`);
  assert.equal(alias.status, 200);
});
