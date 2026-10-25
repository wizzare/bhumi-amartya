import { randomUUID } from "node:crypto";
import { Firestore } from "@google-cloud/firestore";
import { deleteApp, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { createAdminCredential, createQaAuthClient } from "./wif.mjs";

const APP_NAME_PREFIX = "qa-vercel-bootstrap";

function reject(code) {
  throw Object.assign(new Error(code), { code });
}

export function createQaAdminAuth({ config, authClient, appName = `${APP_NAME_PREFIX}-${randomUUID()}` }) {
  if (!config?.projectId || !authClient) reject("QA_VERCEL_ADMIN_CONFIG_INVALID");
  const app = initializeApp({
    projectId: config.projectId,
    credential: createAdminCredential(authClient),
  }, appName);
  return { app, auth: getAuth(app) };
}

export function createQaServices({
  config,
  subjectToken,
  authClientFactory,
  firestoreFactory,
  adminAuthFactory,
  verifier,
  db,
}) {
  const authClient = authClientFactory
    ? authClientFactory({ config, subjectToken })
    : createQaAuthClient({ config, subjectToken });

  let activeDb = db || null;
  let admin = null;
  if (!activeDb) {
    const factory = firestoreFactory || ((options) => new Firestore(options));
    activeDb = factory({
      projectId: config.projectId,
      databaseId: config.firestoreDatabaseId,
      authClient,
    });
    if (typeof activeDb.settings === "function") {
      activeDb.settings({ preferRest: true });
    }
  }

  let activeVerifier = verifier || null;
  if (!activeVerifier) {
    const factory = adminAuthFactory || createQaAdminAuth;
    admin = factory({ config, authClient });
    if (!admin?.auth || typeof admin.auth.verifyIdToken !== "function") {
      reject("QA_VERCEL_ADMIN_AUTH_INVALID");
    }
    activeVerifier = (token) => admin.auth.verifyIdToken(token, true);
  }

  return {
    db: activeDb,
    verifier: activeVerifier,
    async dispose() {
      if (admin?.app) {
        try {
          await deleteApp(admin.app);
        } catch {}
      }
      if (!db && typeof activeDb.terminate === "function") {
        try {
          await activeDb.terminate();
        } catch {}
      }
    },
  };
}
