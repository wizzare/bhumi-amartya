const PRODUCTION_PROJECT_ID = "bhumiamartya-fe85c";
const QA_PROJECT_ID = "bhumi-amartya-qa";
const DEFAULT_PROJECT_ID = "demo-bhumi-qa-bootstrap";
const DEFAULT_JWKS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
const DEFAULT_IDENTITY_TOOLKIT_URL = "https://identitytoolkit.googleapis.com/v1/accounts:lookup";
const DEMO_PROJECT_PATTERN = /^demo-[a-z0-9-]+$/;
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]", "::1"]);
const DEFAULT_ORIGINS = ["https://localhost", "http://localhost", "capacitor://localhost"];

function reject(code) {
  throw Object.assign(new Error(code), { code });
}

export function parseEmulatorHost(raw) {
  if (typeof raw !== "string" || !raw.trim()) reject("QA_FIRESTORE_EMULATOR_HOST_REQUIRED");
  if (raw.includes("://") || raw.includes("/") || raw.includes("?") || raw.includes("#")) {
    reject("QA_FIRESTORE_EMULATOR_HOST_INVALID");
  }
  let url;
  try {
    url = new URL(`http://${raw}`);
  } catch {
    reject("QA_FIRESTORE_EMULATOR_HOST_INVALID");
  }
  if (
    url.protocol !== "http:" ||
    !LOOPBACK_HOSTS.has(url.hostname) ||
    !url.port ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    reject("QA_FIRESTORE_EMULATOR_HOST_INVALID");
  }
  return url.host;
}

function parseAuthProjectId(env) {
  const projectId = env.QA_BOOTSTRAP_AUTH_PROJECT_ID || env.QA_BOOTSTRAP_PROJECT_ID || DEFAULT_PROJECT_ID;
  if (typeof projectId !== "string" || !projectId) reject("QA_BOOTSTRAP_PROJECT_ID_INVALID");
  if (projectId === PRODUCTION_PROJECT_ID) reject("QA_PRODUCTION_PROJECT_FORBIDDEN");
  if (projectId === QA_PROJECT_ID) {
    if (env.QA_BOOTSTRAP_ALLOW_REAL_QA !== "1") reject("QA_BOOTSTRAP_REAL_QA_NOT_ALLOWED");
  } else if (!DEMO_PROJECT_PATTERN.test(projectId)) {
    reject("QA_BOOTSTRAP_PROJECT_ID_INVALID");
  }
  return projectId;
}

function parseFirestoreProjectId(env, authProjectId) {
  const projectId = env.QA_BOOTSTRAP_FIRESTORE_PROJECT_ID || authProjectId;
  if (projectId === PRODUCTION_PROJECT_ID) reject("QA_PRODUCTION_PROJECT_FORBIDDEN");
  if (authProjectId === QA_PROJECT_ID && projectId === authProjectId) {
    reject("QA_BOOTSTRAP_FIRESTORE_PROJECT_NOT_ISOLATED");
  }
  if (typeof projectId !== "string" || !DEMO_PROJECT_PATTERN.test(projectId)) {
    reject("QA_BOOTSTRAP_FIRESTORE_PROJECT_ID_INVALID");
  }
  return projectId;
}

function parseIssuer(env, projectId) {
  const expected = `https://securetoken.google.com/${projectId}`;
  const issuer = env.QA_BOOTSTRAP_ISSUER || expected;
  if (issuer !== expected) reject("QA_BOOTSTRAP_ISSUER_INVALID");
  return issuer;
}

function parseAudience(env, projectId) {
  const audience = env.QA_BOOTSTRAP_AUDIENCE || projectId;
  if (audience !== projectId) reject("QA_BOOTSTRAP_AUDIENCE_INVALID");
  return audience;
}

function normalizeOrigin(value) {
  if (typeof value !== "string" || !value) reject("QA_BOOTSTRAP_ORIGIN_INVALID");
  if (value === "capacitor://localhost") return value;
  let url;
  try {
    url = new URL(value);
  } catch {
    reject("QA_BOOTSTRAP_ORIGIN_INVALID");
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    !LOOPBACK_HOSTS.has(url.hostname) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    reject("QA_BOOTSTRAP_ORIGIN_INVALID");
  }
  return url.origin;
}

function parseOrigins(env) {
  const raw = env.QA_BOOTSTRAP_ALLOWED_ORIGINS;
  const values = raw
    ? raw.split(",").map((value) => value.trim()).filter(Boolean)
    : DEFAULT_ORIGINS;
  if (values.length === 0) reject("QA_BOOTSTRAP_ORIGIN_INVALID");
  return Object.freeze([...new Set(values.map(normalizeOrigin))]);
}

function parsePort(env, tls) {
  const raw = env.QA_BOOTSTRAP_PORT;
  if (raw === undefined || raw === "") return tls ? 8443 : 8787;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 0 || port > 65535) reject("QA_BOOTSTRAP_PORT_INVALID");
  return port;
}

function parseTls(env) {
  const certFile = env.QA_BOOTSTRAP_TLS_CERT_FILE;
  const keyFile = env.QA_BOOTSTRAP_TLS_KEY_FILE;
  if (!certFile && !keyFile) return null;
  if (!certFile || !keyFile) reject("QA_BOOTSTRAP_TLS_CONFIG_INCOMPLETE");
  if (typeof certFile !== "string" || typeof keyFile !== "string") reject("QA_BOOTSTRAP_TLS_CONFIG_INVALID");
  return Object.freeze({ certFile, keyFile });
}

function parseJwksSource(env) {
  const json = env.QA_BOOTSTRAP_JWKS_JSON;
  const file = env.QA_BOOTSTRAP_JWKS_FILE;
  const url = env.QA_BOOTSTRAP_JWKS_URL || DEFAULT_JWKS_URL;
  if (json && file) reject("QA_BOOTSTRAP_JWKS_SOURCE_CONFLICT");
  if (url !== DEFAULT_JWKS_URL) reject("QA_BOOTSTRAP_JWKS_URL_FORBIDDEN");
  return Object.freeze({
    jwksJson: json || null,
    jwksFile: file || null,
    jwksUrl: url,
  });
}

function parseIdentityToolkit(env, authProjectId) {
  const lookupUrl = env.QA_BOOTSTRAP_IDENTITY_TOOLKIT_URL || DEFAULT_IDENTITY_TOOLKIT_URL;
  if (lookupUrl !== DEFAULT_IDENTITY_TOOLKIT_URL) reject("QA_BOOTSTRAP_IDENTITY_TOOLKIT_URL_FORBIDDEN");
  const apiKey = env.QA_BOOTSTRAP_IDENTITY_TOOLKIT_API_KEY || null;
  const required = authProjectId === QA_PROJECT_ID;
  if (required && (!apiKey || typeof apiKey !== "string" || apiKey.length < 8 || apiKey.includes(" "))) {
    reject("QA_BOOTSTRAP_IDENTITY_TOOLKIT_API_KEY_REQUIRED");
  }
  if (!required && apiKey) reject("QA_BOOTSTRAP_IDENTITY_TOOLKIT_API_KEY_UNEXPECTED");
  return Object.freeze({ lookupUrl, apiKey, required, enabled: required });
}

function assertNoProductionCredentials(env, firestoreProjectId) {
  for (const key of ["FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY", "GOOGLE_APPLICATION_CREDENTIALS"]) {
    if (env[key]) reject("QA_PRODUCTION_CREDENTIALS_FORBIDDEN");
  }
  for (const key of ["FIREBASE_PROJECT_ID", "GCLOUD_PROJECT", "GOOGLE_CLOUD_PROJECT"]) {
    if (env[key] && env[key] !== firestoreProjectId) reject("QA_PRODUCTION_PROJECT_FORBIDDEN");
  }
  if (env.FIREBASE_CONFIG) {
    let parsed;
    try {
      parsed = JSON.parse(env.FIREBASE_CONFIG);
    } catch {
      reject("QA_FIREBASE_CONFIG_INVALID");
    }
    if (parsed?.projectId && parsed.projectId !== firestoreProjectId) {
      reject("QA_PRODUCTION_PROJECT_FORBIDDEN");
    }
  }
}

export function loadConfig(env = process.env) {
  if (env.BHUMI_QA_BACKEND !== "1") reject("QA_BACKEND_FLAG_REQUIRED");
  const authProjectId = parseAuthProjectId(env);
  const firestoreProjectId = parseFirestoreProjectId(env, authProjectId);
  assertNoProductionCredentials(env, firestoreProjectId);
  const firestoreHost = parseEmulatorHost(env.FIRESTORE_EMULATOR_HOST);
  const issuer = parseIssuer(env, authProjectId);
  const audience = parseAudience(env, authProjectId);
  const jwks = parseJwksSource(env);
  const identityToolkit = parseIdentityToolkit(env, authProjectId);
  const tls = parseTls(env);
  return Object.freeze({
    service: "qa-local-bootstrap",
    projectId: authProjectId,
    authProjectId,
    firestoreProjectId,
    firestoreHost,
    issuer,
    audience,
    allowedOrigins: parseOrigins(env),
    port: parsePort(env, tls),
    host: "127.0.0.1",
    jwks,
    identityToolkit,
    requireRevocation: identityToolkit.required,
    tls,
  });
}

export {
  DEFAULT_IDENTITY_TOOLKIT_URL,
  DEFAULT_JWKS_URL,
  DEFAULT_PROJECT_ID,
  PRODUCTION_PROJECT_ID,
  QA_PROJECT_ID,
};
