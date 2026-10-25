import assert from "node:assert/strict";
import test from "node:test";
import { loadConfig } from "../lib/config.mjs";

const PROJECT = "demo-bhumi-qa-bootstrap";
const QA_PROJECT = "bhumi-amartya-qa";
const ISSUER = `https://securetoken.google.com/${PROJECT}`;
const baseEnv = {
  BHUMI_QA_BACKEND: "1",
  FIRESTORE_EMULATOR_HOST: "127.0.0.1:8088",
  QA_BOOTSTRAP_PROJECT_ID: PROJECT,
  QA_BOOTSTRAP_ISSUER: ISSUER,
  QA_BOOTSTRAP_AUDIENCE: PROJECT,
};
const realQaEnv = {
  BHUMI_QA_BACKEND: "1",
  FIRESTORE_EMULATOR_HOST: "127.0.0.1:8088",
  QA_BOOTSTRAP_ALLOW_REAL_QA: "1",
  QA_BOOTSTRAP_AUTH_PROJECT_ID: QA_PROJECT,
  QA_BOOTSTRAP_FIRESTORE_PROJECT_ID: PROJECT,
  QA_BOOTSTRAP_IDENTITY_TOOLKIT_API_KEY: "synthetic-qa-api-key",
};

const rejectsWith = (env, code) => {
  assert.throws(() => loadConfig(env), (error) => error.code === code);
};

test("loads a fail-closed local-only configuration", () => {
  const config = loadConfig({
    ...baseEnv,
    GCLOUD_PROJECT: PROJECT,
    FIREBASE_CONFIG: JSON.stringify({ projectId: PROJECT }),
  });
  assert.equal(config.projectId, PROJECT);
  assert.equal(config.authProjectId, PROJECT);
  assert.equal(config.firestoreProjectId, PROJECT);
  assert.equal(config.requireRevocation, false);
  assert.equal(config.firestoreHost, "127.0.0.1:8088");
  assert.equal(config.host, "127.0.0.1");
  assert.equal(config.issuer, ISSUER);
  assert.equal(config.audience, PROJECT);
  assert.deepEqual(config.allowedOrigins, [
    "https://localhost",
    "http://localhost",
    "capacitor://localhost",
  ]);
});

test("requires the explicit local QA backend flag", () => {
  const env = { ...baseEnv };
  delete env.BHUMI_QA_BACKEND;
  rejectsWith(env, "QA_BACKEND_FLAG_REQUIRED");
  rejectsWith({ ...baseEnv, BHUMI_QA_BACKEND: "0" }, "QA_BACKEND_FLAG_REQUIRED");
});

test("rejects non-demo and production project identities", () => {
  rejectsWith({ ...baseEnv, QA_BOOTSTRAP_PROJECT_ID: QA_PROJECT }, "QA_BOOTSTRAP_REAL_QA_NOT_ALLOWED");
  rejectsWith({ ...baseEnv, QA_BOOTSTRAP_PROJECT_ID: "bhumiamartya-fe85c" }, "QA_PRODUCTION_PROJECT_FORBIDDEN");
  rejectsWith({ ...baseEnv, FIREBASE_PROJECT_ID: "bhumiamartya-fe85c" }, "QA_PRODUCTION_PROJECT_FORBIDDEN");
  rejectsWith({ ...baseEnv, GCLOUD_PROJECT: "bhumiamartya-fe85c" }, "QA_PRODUCTION_PROJECT_FORBIDDEN");
  rejectsWith({ ...baseEnv, FIREBASE_CONFIG: JSON.stringify({ projectId: "bhumiamartya-fe85c" }) }, "QA_PRODUCTION_PROJECT_FORBIDDEN");
});

test("accepts the exact QA auth project with an isolated demo Firestore project", () => {
  const config = loadConfig(realQaEnv);
  assert.equal(config.authProjectId, QA_PROJECT);
  assert.equal(config.firestoreProjectId, PROJECT);
  assert.equal(config.issuer, `https://securetoken.google.com/${QA_PROJECT}`);
  assert.equal(config.audience, QA_PROJECT);
  assert.equal(config.requireRevocation, true);
  assert.equal(config.identityToolkit.enabled, true);
  assert.equal(config.identityToolkit.apiKey, "synthetic-qa-api-key");
});

test("requires explicit real-QA authorization, a separate data project, and a lookup key", () => {
  rejectsWith({ ...realQaEnv, QA_BOOTSTRAP_ALLOW_REAL_QA: "0" }, "QA_BOOTSTRAP_REAL_QA_NOT_ALLOWED");
  rejectsWith({ ...realQaEnv, QA_BOOTSTRAP_FIRESTORE_PROJECT_ID: QA_PROJECT }, "QA_BOOTSTRAP_FIRESTORE_PROJECT_NOT_ISOLATED");
  rejectsWith({ ...realQaEnv, QA_BOOTSTRAP_IDENTITY_TOOLKIT_API_KEY: "" }, "QA_BOOTSTRAP_IDENTITY_TOOLKIT_API_KEY_REQUIRED");
  rejectsWith({ ...realQaEnv, QA_BOOTSTRAP_IDENTITY_TOOLKIT_URL: "https://attacker.invalid/lookup" }, "QA_BOOTSTRAP_IDENTITY_TOOLKIT_URL_FORBIDDEN");
  rejectsWith({ ...baseEnv, QA_BOOTSTRAP_IDENTITY_TOOLKIT_API_KEY: "synthetic-qa-api-key" }, "QA_BOOTSTRAP_IDENTITY_TOOLKIT_API_KEY_UNEXPECTED");
  rejectsWith({ ...realQaEnv, QA_BOOTSTRAP_FIRESTORE_PROJECT_ID: "bhumiamartya-fe85c" }, "QA_PRODUCTION_PROJECT_FORBIDDEN");
});

test("rejects production credentials", () => {
  for (const key of ["FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY", "GOOGLE_APPLICATION_CREDENTIALS"]) {
    rejectsWith({ ...baseEnv, [key]: "synthetic-value" }, "QA_PRODUCTION_CREDENTIALS_FORBIDDEN");
  }
});

test("requires a loopback Firestore emulator host", () => {
  rejectsWith({ ...baseEnv, FIRESTORE_EMULATOR_HOST: "" }, "QA_FIRESTORE_EMULATOR_HOST_REQUIRED");
  rejectsWith({ ...baseEnv, FIRESTORE_EMULATOR_HOST: "firestore.googleapis.com:443" }, "QA_FIRESTORE_EMULATOR_HOST_INVALID");
  rejectsWith({ ...baseEnv, FIRESTORE_EMULATOR_HOST: "127.0.0.1:8088/path" }, "QA_FIRESTORE_EMULATOR_HOST_INVALID");
  rejectsWith({ ...baseEnv, FIRESTORE_EMULATOR_HOST: "http://127.0.0.1:8088" }, "QA_FIRESTORE_EMULATOR_HOST_INVALID");
  rejectsWith({ ...baseEnv, FIRESTORE_EMULATOR_HOST: "127.0.0.1" }, "QA_FIRESTORE_EMULATOR_HOST_INVALID");
});

test("pins issuer and audience to the demo project", () => {
  rejectsWith({ ...baseEnv, QA_BOOTSTRAP_ISSUER: "https://securetoken.google.com/bhumiamartya-fe85c" }, "QA_BOOTSTRAP_ISSUER_INVALID");
  rejectsWith({ ...baseEnv, QA_BOOTSTRAP_AUDIENCE: "bhumiamartya-fe85c" }, "QA_BOOTSTRAP_AUDIENCE_INVALID");
});

test("restricts JWKS sources", () => {
  rejectsWith({ ...baseEnv, QA_BOOTSTRAP_JWKS_URL: "https://attacker.invalid/jwks.json" }, "QA_BOOTSTRAP_JWKS_URL_FORBIDDEN");
  rejectsWith({
    ...baseEnv,
    QA_BOOTSTRAP_JWKS_JSON: "{}",
    QA_BOOTSTRAP_JWKS_FILE: "synthetic.json",
  }, "QA_BOOTSTRAP_JWKS_SOURCE_CONFLICT");
});

test("restricts origins and ports", () => {
  rejectsWith({ ...baseEnv, QA_BOOTSTRAP_ALLOWED_ORIGINS: "https://attacker.invalid" }, "QA_BOOTSTRAP_ORIGIN_INVALID");
  rejectsWith({ ...baseEnv, QA_BOOTSTRAP_ALLOWED_ORIGINS: "http://127.0.0.1:3000/path" }, "QA_BOOTSTRAP_ORIGIN_INVALID");
  rejectsWith({ ...baseEnv, QA_BOOTSTRAP_PORT: "not-a-port" }, "QA_BOOTSTRAP_PORT_INVALID");
  rejectsWith({ ...baseEnv, QA_BOOTSTRAP_PORT: "70000" }, "QA_BOOTSTRAP_PORT_INVALID");
});

test("accepts loopback origins on explicit ports", () => {
  const config = loadConfig({
    ...baseEnv,
    QA_BOOTSTRAP_ALLOWED_ORIGINS: "http://127.0.0.1:3000,http://localhost:3000,capacitor://localhost",
    QA_BOOTSTRAP_PORT: "0",
  });
  assert.deepEqual(config.allowedOrigins, [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "capacitor://localhost",
  ]);
  assert.equal(config.port, 0);
});
