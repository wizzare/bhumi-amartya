import assert from "node:assert/strict";
import test from "node:test";
import { loadVercelQaConfig } from "../lib/config.mjs";
import { createQaServices } from "../lib/services.mjs";

const config = loadVercelQaConfig({
  BHUMI_QA_VERCEL: "1",
  QA_VERCEL_WIF_POOL_ID: "vercel-qa",
  QA_VERCEL_WIF_PROVIDER_ID: "vercel-qa",
  QA_VERCEL_SERVICE_ACCOUNT_EMAIL: "qa-bootstrap@bhumi-amartya-qa.iam.gserviceaccount.com",
});

test("wires Firestore and Admin Auth to the short-lived auth client", async () => {
  let firestoreOptions;
  let settings;
  let disposed = false;
  const fakeDb = {
    settings(value) {
      settings = value;
    },
    async terminate() {
      disposed = true;
    },
  };
  const fakeAdmin = {
    app: { name: "fake" },
    auth: {
      async verifyIdToken(token, checkRevoked) {
        assert.equal(token, "firebase-token");
        assert.equal(checkRevoked, true);
        return { uid: "synthetic-user" };
      },
    },
  };
  const services = createQaServices({
    config,
    subjectToken: "oidc-token",
    authClientFactory: () => ({ getAccessToken: async () => ({ access_token: "access" }) }),
    firestoreFactory: (options) => {
      firestoreOptions = options;
      return fakeDb;
    },
    adminAuthFactory: () => fakeAdmin,
  });

  assert.equal(firestoreOptions.projectId, "bhumi-amartya-qa");
  assert.equal(firestoreOptions.databaseId, "(default)");
  assert.deepEqual(settings, { preferRest: true });
  assert.deepEqual(await services.verifier("firebase-token"), { uid: "synthetic-user" });
  await services.dispose();
  assert.equal(disposed, true);
});

test("does not terminate an injected database", async () => {
  let terminated = false;
  const db = {
    async terminate() {
      terminated = true;
    },
  };
  const services = createQaServices({
    config,
    subjectToken: "oidc-token",
    authClientFactory: () => ({ getAccessToken: async () => ({ access_token: "access" }) }),
    db,
    verifier: async () => ({ uid: "synthetic-user" }),
  });
  await services.dispose();
  assert.equal(terminated, false);
});
