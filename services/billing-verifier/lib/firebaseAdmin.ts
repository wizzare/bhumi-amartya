import { cert, getApps, initializeApp, type App, type AppOptions, type Credential } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export const EXPECTED_FIREBASE_PROJECT_ID = "bhumiamartya-fe85c";
export const BHUMI_ADMIN_APP_NAME = "bhumi-billing-verifier-admin";

export type FirebaseAdminEnvironment = {
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_CLIENT_EMAIL?: string;
  FIREBASE_PRIVATE_KEY?: string;
};

export type BhumiAdminAppDependencies = {
  listApps: () => App[];
  initializeNamedApp: (options: AppOptions, name: string) => App;
  createCredential: (serviceAccount: { projectId: string; clientEmail: string; privateKey: string }) => Credential;
  env: FirebaseAdminEnvironment;
};

function configurationError() {
  return Object.assign(new Error("FIREBASE_ADMIN_CONFIGURATION_INVALID"), {
    code: "AUTH_VERIFIER_CONFIGURATION_ERROR",
    name: "VerifierConfigurationError",
  });
}

function reviewedServiceAccount(env: FirebaseAdminEnvironment) {
  const projectId = env.FIREBASE_PROJECT_ID || "";
  const clientEmail = env.FIREBASE_CLIENT_EMAIL || "";
  const privateKey = (env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  if (projectId !== EXPECTED_FIREBASE_PROJECT_ID || !clientEmail || !privateKey) throw configurationError();
  return { projectId, clientEmail, privateKey };
}

function defaultDependencies(): BhumiAdminAppDependencies {
  return {
    listApps: getApps,
    initializeNamedApp: initializeApp,
    createCredential: cert,
    env: {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    },
  };
}

export function getBhumiAdminCredential(env: FirebaseAdminEnvironment = {
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
}, credentialFactory: BhumiAdminAppDependencies["createCredential"] = cert) {
  return credentialFactory(reviewedServiceAccount(env));
}

export function getBhumiAdminApp(overrides: Partial<BhumiAdminAppDependencies> = {}): App {
  const dependencies = { ...defaultDependencies(), ...overrides };
  const serviceAccount = reviewedServiceAccount(dependencies.env);
  const existing = dependencies.listApps().find((app) => app.name === BHUMI_ADMIN_APP_NAME);
  if (existing) {
    if (existing.options.projectId !== EXPECTED_FIREBASE_PROJECT_ID) throw configurationError();
    return existing;
  }
  const credential = dependencies.createCredential(serviceAccount);
  return dependencies.initializeNamedApp({ projectId: EXPECTED_FIREBASE_PROJECT_ID, credential }, BHUMI_ADMIN_APP_NAME);
}

export function resolveBhumiAdminServices(
  app: App,
  factories: { auth: typeof getAuth; firestore: typeof getFirestore } = { auth: getAuth, firestore: getFirestore },
) {
  return { auth: factories.auth(app), firestore: factories.firestore(app) };
}

export const adminAuth = () => resolveBhumiAdminServices(getBhumiAdminApp()).auth;
export const adminDb = () => resolveBhumiAdminServices(getBhumiAdminApp()).firestore;
