const QA_PROJECT_ID = "bhumi-amartya-qa";
const QA_PROJECT_NUMBER = "125330899891";
const PRODUCTION_PROJECT_ID = "bhumiamartya-fe85c";
const QA_SERVICE_ACCOUNT_DOMAIN = `@${QA_PROJECT_ID}.iam.gserviceaccount.com`;
const DEFAULT_ORIGINS = ["https://localhost", "http://localhost", "capacitor://localhost"];
const POOL_ID_PATTERN = /^[a-z][a-z0-9-]{3,31}$/;
const SERVICE_ACCOUNT_PATTERN = /^[a-z0-9-]{6,30}$/;
const DATABASE_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

function reject(code) {
  throw Object.assign(new Error(code), { code });
}

function normalizeOrigin(value) {
  if (typeof value !== "string" || !value) reject("QA_VERCEL_ORIGIN_INVALID");
  if (value === "capacitor://localhost") return value;
  let url;
  try {
    url = new URL(value);
  } catch {
    reject("QA_VERCEL_ORIGIN_INVALID");
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.hostname !== "localhost" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    reject("QA_VERCEL_ORIGIN_INVALID");
  }
  return url.origin;
}

function parseOrigins(env) {
  const raw = env.QA_VERCEL_ALLOWED_ORIGINS;
  const values = raw
    ? raw.split(",").map((value) => value.trim()).filter(Boolean)
    : DEFAULT_ORIGINS;
  if (values.length === 0) reject("QA_VERCEL_ORIGIN_INVALID");
  return Object.freeze([...new Set(values.map(normalizeOrigin))]);
}

function parsePositiveInteger(raw, fallback, code, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (raw === undefined || raw === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) reject(code);
  return value;
}

function assertNoProductionCredentials(env) {
  for (const key of [
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
    "GOOGLE_APPLICATION_CREDENTIALS",
    "GOOGLE_APPLICATION_CREDENTIALS_JSON",
    "FIREBASE_SERVICE_ACCOUNT",
  ]) {
    if (env[key]) reject("QA_VERCEL_PRODUCTION_CREDENTIALS_FORBIDDEN");
  }
  for (const key of ["FIREBASE_PROJECT_ID", "GCLOUD_PROJECT", "GOOGLE_CLOUD_PROJECT"]) {
    if (env[key] && env[key] !== QA_PROJECT_ID) reject("QA_VERCEL_PRODUCTION_PROJECT_FORBIDDEN");
  }
  if (env.FIREBASE_CONFIG) {
    let parsed;
    try {
      parsed = JSON.parse(env.FIREBASE_CONFIG);
    } catch {
      reject("QA_VERCEL_FIREBASE_CONFIG_INVALID");
    }
    if (parsed?.projectId && parsed.projectId !== QA_PROJECT_ID) {
      reject("QA_VERCEL_PRODUCTION_PROJECT_FORBIDDEN");
    }
  }
}

function parseProject(env) {
  const projectId = env.QA_VERCEL_PROJECT_ID || QA_PROJECT_ID;
  if (projectId !== QA_PROJECT_ID) reject("QA_VERCEL_PRODUCTION_PROJECT_FORBIDDEN");
  if (env.QA_VERCEL_PROJECT_NUMBER !== undefined && env.QA_VERCEL_PROJECT_NUMBER !== QA_PROJECT_NUMBER) {
    reject("QA_VERCEL_PROJECT_NUMBER_INVALID");
  }
  return { projectId, projectNumber: QA_PROJECT_NUMBER };
}

function parseWif(env) {
  const poolId = env.QA_VERCEL_WIF_POOL_ID;
  const providerId = env.QA_VERCEL_WIF_PROVIDER_ID;
  const serviceAccountEmail = env.QA_VERCEL_SERVICE_ACCOUNT_EMAIL;
  if (typeof poolId !== "string" || !POOL_ID_PATTERN.test(poolId)) reject("QA_VERCEL_WIF_POOL_INVALID");
  if (typeof providerId !== "string" || !POOL_ID_PATTERN.test(providerId)) reject("QA_VERCEL_WIF_PROVIDER_INVALID");
  if (typeof serviceAccountEmail !== "string" || !serviceAccountEmail.endsWith(QA_SERVICE_ACCOUNT_DOMAIN)) {
    reject("QA_VERCEL_SERVICE_ACCOUNT_INVALID");
  }
  const localPart = serviceAccountEmail.slice(0, -QA_SERVICE_ACCOUNT_DOMAIN.length);
  if (!SERVICE_ACCOUNT_PATTERN.test(localPart)) reject("QA_VERCEL_SERVICE_ACCOUNT_INVALID");

  const audience = `//iam.googleapis.com/projects/${QA_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`;
  const serviceAccountImpersonationUrl = `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccountEmail}:generateAccessToken`;
  return Object.freeze({
    poolId,
    providerId,
    serviceAccountEmail,
    audience,
    serviceAccountImpersonationUrl,
    tokenUrl: "https://sts.googleapis.com/v1/token",
    subjectTokenType: "urn:ietf:params:oauth:token-type:jwt",
  });
}

export function loadVercelQaConfig(env = process.env) {
  if (env.BHUMI_QA_VERCEL !== "1") reject("QA_VERCEL_FLAG_REQUIRED");
  assertNoProductionCredentials(env);
  const { projectId, projectNumber } = parseProject(env);
  const firestoreDatabaseId = env.QA_VERCEL_FIRESTORE_DATABASE_ID || "(default)";
  if (firestoreDatabaseId !== "(default)" && !DATABASE_ID_PATTERN.test(firestoreDatabaseId)) {
    reject("QA_VERCEL_DATABASE_INVALID");
  }
  return Object.freeze({
    service: "qa-vercel-bootstrap",
    projectId,
    projectNumber,
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    firestoreDatabaseId,
    allowedOrigins: parseOrigins(env),
    wif: parseWif(env),
    rateLimit: Object.freeze({
      limit: parsePositiveInteger(env.QA_VERCEL_RATE_LIMIT, 60, "QA_VERCEL_RATE_LIMIT_INVALID", { min: 1, max: 600 }),
      windowMs: 60_000,
    }),
    maxBodyBytes: 16 * 1024,
  });
}

export { DEFAULT_ORIGINS, PRODUCTION_PROJECT_ID, QA_PROJECT_ID, QA_PROJECT_NUMBER };
