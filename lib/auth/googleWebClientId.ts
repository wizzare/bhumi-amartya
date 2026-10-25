export const PRODUCTION_GOOGLE_WEB_CLIENT_ID =
  "59259824153-vldlev9s91l6sss3ulqbh8mnaah4n4c9.apps.googleusercontent.com";

export const QA_GOOGLE_WEB_CLIENT_ID_ENV = "NEXT_PUBLIC_QA_GOOGLE_WEB_CLIENT_ID";

const QA_FIREBASE_PROJECT_ID = "bhumi-amartya-qa";
const QA_CLIENT_ID_PATTERN =
  /^125330899891-[a-z0-9]+\.apps\.googleusercontent\.com$/;

type GoogleWebClientEnv = {
  NEXT_PUBLIC_QA_MODE?: string;
  NEXT_PUBLIC_FIREBASE_PROJECT_ID?: string;
  NEXT_PUBLIC_QA_GOOGLE_WEB_CLIENT_ID?: string;
};

export function resolveGoogleWebClientId(env: GoogleWebClientEnv): string {
  const qaMode = env.NEXT_PUBLIC_QA_MODE;
  const qaProject = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === QA_FIREBASE_PROJECT_ID;
  const qaClientConfigured = Boolean(env.NEXT_PUBLIC_QA_GOOGLE_WEB_CLIENT_ID);

  if (qaMode === undefined && !qaProject && !qaClientConfigured) {
    return PRODUCTION_GOOGLE_WEB_CLIENT_ID;
  }

  if (qaMode !== "realQA") {
    throw new Error("QA_GOOGLE_AUTH_MODE_BLOCKED");
  }

  if (!qaProject) {
    throw new Error("QA_GOOGLE_AUTH_PROJECT_MISMATCH");
  }

  const clientId = env.NEXT_PUBLIC_QA_GOOGLE_WEB_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error("QA_GOOGLE_WEB_CLIENT_ID_MISSING");
  }

  if (clientId === PRODUCTION_GOOGLE_WEB_CLIENT_ID) {
    throw new Error("QA_GOOGLE_WEB_CLIENT_ID_PRODUCTION_FORBIDDEN");
  }

  if (!QA_CLIENT_ID_PATTERN.test(clientId)) {
    throw new Error("QA_GOOGLE_WEB_CLIENT_ID_PROJECT_MISMATCH");
  }

  return clientId;
}
