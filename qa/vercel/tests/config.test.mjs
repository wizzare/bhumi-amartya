import assert from "node:assert/strict";
import test from "node:test";
import { loadVercelQaConfig } from "../lib/config.mjs";

const baseEnv = {
  BHUMI_QA_VERCEL: "1",
  QA_VERCEL_PROJECT_ID: "bhumi-amartya-qa",
  QA_VERCEL_PROJECT_NUMBER: "125330899891",
  QA_VERCEL_WIF_POOL_ID: "vercel-qa",
  QA_VERCEL_WIF_PROVIDER_ID: "vercel-qa",
  QA_VERCEL_SERVICE_ACCOUNT_EMAIL: "qa-bootstrap@bhumi-amartya-qa.iam.gserviceaccount.com",
  QA_VERCEL_ALLOWED_ORIGINS: "https://localhost,capacitor://localhost",
  QA_VERCEL_RATE_LIMIT: "60",
};

test("loads a fixed QA-only configuration", () => {
  const config = loadVercelQaConfig(baseEnv);
  assert.equal(config.service, "qa-vercel-bootstrap");
  assert.equal(config.projectId, "bhumi-amartya-qa");
  assert.equal(config.projectNumber, "125330899891");
  assert.equal(config.issuer, "https://securetoken.google.com/bhumi-amartya-qa");
  assert.equal(config.audience, "bhumi-amartya-qa");
  assert.equal(config.wif.audience, "//iam.googleapis.com/projects/125330899891/locations/global/workloadIdentityPools/vercel-qa/providers/vercel-qa");
  assert.equal(config.wif.serviceAccountImpersonationUrl, "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/qa-bootstrap@bhumi-amartya-qa.iam.gserviceaccount.com:generateAccessToken");
  assert.deepEqual(config.allowedOrigins, ["https://localhost", "capacitor://localhost"]);
  assert.equal(config.rateLimit.limit, 60);
});

test("rejects missing QA flag", () => {
  assert.throws(() => loadVercelQaConfig({ ...baseEnv, BHUMI_QA_VERCEL: undefined }), { code: "QA_VERCEL_FLAG_REQUIRED" });
});

test("rejects production project and project number", () => {
  assert.throws(() => loadVercelQaConfig({ ...baseEnv, QA_VERCEL_PROJECT_ID: "bhumiamartya-fe85c" }), { code: "QA_VERCEL_PRODUCTION_PROJECT_FORBIDDEN" });
  assert.throws(() => loadVercelQaConfig({ ...baseEnv, QA_VERCEL_PROJECT_NUMBER: "999" }), { code: "QA_VERCEL_PROJECT_NUMBER_INVALID" });
});

test("rejects production credentials and project environment", () => {
  assert.throws(() => loadVercelQaConfig({ ...baseEnv, FIREBASE_PRIVATE_KEY: "secret" }), { code: "QA_VERCEL_PRODUCTION_CREDENTIALS_FORBIDDEN" });
  assert.throws(() => loadVercelQaConfig({ ...baseEnv, GOOGLE_APPLICATION_CREDENTIALS: "secret.json" }), { code: "QA_VERCEL_PRODUCTION_CREDENTIALS_FORBIDDEN" });
  assert.throws(() => loadVercelQaConfig({ ...baseEnv, FIREBASE_PROJECT_ID: "bhumiamartya-fe85c" }), { code: "QA_VERCEL_PRODUCTION_PROJECT_FORBIDDEN" });
});

test("rejects invalid WIF and service-account identifiers", () => {
  assert.throws(() => loadVercelQaConfig({ ...baseEnv, QA_VERCEL_WIF_POOL_ID: "Bad Pool" }), { code: "QA_VERCEL_WIF_POOL_INVALID" });
  assert.throws(() => loadVercelQaConfig({ ...baseEnv, QA_VERCEL_WIF_PROVIDER_ID: "x" }), { code: "QA_VERCEL_WIF_PROVIDER_INVALID" });
  assert.throws(() => loadVercelQaConfig({ ...baseEnv, QA_VERCEL_SERVICE_ACCOUNT_EMAIL: "qa@bhumiamartya-fe85c.iam.gserviceaccount.com" }), { code: "QA_VERCEL_SERVICE_ACCOUNT_INVALID" });
});

test("rejects non-local CORS origins", () => {
  assert.throws(() => loadVercelQaConfig({ ...baseEnv, QA_VERCEL_ALLOWED_ORIGINS: "https://evil.example" }), { code: "QA_VERCEL_ORIGIN_INVALID" });
  assert.throws(() => loadVercelQaConfig({ ...baseEnv, QA_VERCEL_ALLOWED_ORIGINS: "*" }), { code: "QA_VERCEL_ORIGIN_INVALID" });
});
