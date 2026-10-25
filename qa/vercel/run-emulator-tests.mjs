import { spawnSync } from "node:child_process";

const tests = [
  "qa/vercel/tests/config.test.mjs",
  "qa/vercel/tests/wif.test.mjs",
  "qa/vercel/tests/services.test.mjs",
  "qa/vercel/tests/rate-limit.test.mjs",
  "qa/vercel/tests/packaging.test.mjs",
  "qa/vercel/tests/routing.test.mjs",
  "qa/vercel/tests/handler.integration.test.mjs",
];

const env = {
  ...process.env,
  BHUMI_QA_VERCEL: "1",
  QA_VERCEL_PROJECT_ID: "bhumi-amartya-qa",
  QA_VERCEL_PROJECT_NUMBER: "125330899891",
  QA_VERCEL_WIF_POOL_ID: "vercel-qa",
  QA_VERCEL_WIF_PROVIDER_ID: "vercel-qa",
  QA_VERCEL_SERVICE_ACCOUNT_EMAIL: "qa-bootstrap@bhumi-amartya-qa.iam.gserviceaccount.com",
  QA_VERCEL_ALLOWED_ORIGINS: "https://localhost,http://localhost,capacitor://localhost",
  QA_VERCEL_RATE_LIMIT: "60",
  FIRESTORE_EMULATOR_HOST: "127.0.0.1:8088",
};

const command = [
  "firebase emulators:exec",
  "--config qa/firebase/firebase.json",
  "--project demo-bhumi-qa-bootstrap",
  "--only firestore",
  `"node --test ${tests.join(" ")}"`,
].join(" ");

const result = spawnSync(command, { stdio: "inherit", env, shell: true });

process.exit(result.status ?? 1);
