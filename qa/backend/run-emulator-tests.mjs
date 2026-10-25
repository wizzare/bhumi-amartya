import { spawnSync } from "node:child_process";

const tests = [
  "qa/backend/tests/token-verifier.test.mjs",
  "qa/backend/tests/revocation.test.mjs",
  "qa/backend/tests/server-revocation.test.mjs",
  "qa/backend/tests/bootstrap-contract.test.mjs",
  "qa/backend/tests/config.test.mjs",
  "qa/backend/tests/local-bootstrap.integration.test.mjs",
];

const env = {
  ...process.env,
  BHUMI_QA_BACKEND: "1",
  QA_BOOTSTRAP_PROJECT_ID: "demo-bhumi-qa-bootstrap",
  QA_BOOTSTRAP_ISSUER: "https://securetoken.google.com/demo-bhumi-qa-bootstrap",
  QA_BOOTSTRAP_AUDIENCE: "demo-bhumi-qa-bootstrap",
  FIRESTORE_EMULATOR_HOST: "127.0.0.1:8088",
};

for (const key of [
  "QA_BOOTSTRAP_AUTH_PROJECT_ID",
  "QA_BOOTSTRAP_FIRESTORE_PROJECT_ID",
  "QA_BOOTSTRAP_ALLOW_REAL_QA",
  "QA_BOOTSTRAP_IDENTITY_TOOLKIT_API_KEY",
  "QA_BOOTSTRAP_IDENTITY_TOOLKIT_URL",
  "QA_BOOTSTRAP_TLS_CERT_FILE",
  "QA_BOOTSTRAP_TLS_KEY_FILE",
  "QA_BOOTSTRAP_PORT",
]) {
  delete env[key];
}

const command = [
  "firebase emulators:exec",
  "--config qa/firebase/firebase.json",
  "--project demo-bhumi-qa-bootstrap",
  "--only firestore",
  `"node --test ${tests.join(" ")}"`,
].join(" ");

const result = spawnSync(command, { stdio: "inherit", env, shell: true });

process.exit(result.status ?? 1);
