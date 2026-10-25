import { generateKeyPairSync, sign } from "node:crypto";
import { deleteApp, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createTokenVerifier } from "../lib/token-verifier.mjs";
import { createLocalBootstrapServer } from "../lib/server.mjs";

const encoder = (value) => Buffer.from(JSON.stringify(value), "utf8").toString("base64url");

export function createSigningMaterial(kid = "qa-test-key-1") {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const jwk = publicKey.export({ format: "jwk" });
  return {
    kid,
    privateKey,
    publicJwks: { keys: [{ ...jwk, kid, use: "sig", alg: "RS256" }] },
  };
}

export function signToken({
  material,
  issuer,
  audience,
  subject,
  now = Date.now(),
  expiresInSeconds = 3600,
  issuedAtSeconds,
  header = {},
  claims = {},
}) {
  const nowSeconds = Math.floor(new Date(now).getTime() / 1000);
  const tokenHeader = { alg: "RS256", typ: "JWT", kid: material.kid, ...header };
  const tokenPayload = {
    iss: issuer,
    aud: audience,
    sub: subject,
    iat: issuedAtSeconds ?? nowSeconds - 60,
    exp: nowSeconds + expiresInSeconds,
    auth_time: nowSeconds - 60,
    firebase: { sign_in_provider: "google.com" },
    ...claims,
  };
  const signingInput = `${encoder(tokenHeader)}.${encoder(tokenPayload)}`;
  const signature = sign("RSA-SHA256", Buffer.from(signingInput, "utf8"), material.privateKey).toString("base64url");
  return `${signingInput}.${signature}`;
}

export async function createTestDb() {
  const appName = `qa-backend-test-${process.pid}-${Date.now()}`;
  const app = initializeApp({ projectId: "demo-bhumi-qa-bootstrap" }, appName);
  return { app, db: getFirestore(app) };
}

export async function closeTestDb(app) {
  await deleteApp(app);
}

export async function startTestServer({ db, jwks, issuer, audience, now }) {
  const verifier = createTokenVerifier({
    jwks,
    issuer,
    audience,
    now: now ? () => new Date(now).getTime() : undefined,
  });
  const config = {
    service: "qa-local-bootstrap",
    projectId: "demo-bhumi-qa-bootstrap",
    firestoreHost: process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8088",
    issuer,
    audience,
    allowedOrigins: ["https://localhost", "http://localhost", "capacitor://localhost"],
  };
  const server = createLocalBootstrapServer({
    config,
    verifier,
    db,
    now: now ? () => new Date(now) : undefined,
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}

export async function closeTestServer(server) {
  await new Promise((resolve) => server.close(resolve));
}

export async function post(baseUrl, path, token, { body, origin, headers = {} } = {}) {
  const requestHeaders = { ...headers };
  if (token) requestHeaders.Authorization = `Bearer ${token}`;
  if (origin) requestHeaders.Origin = origin;
  if (body !== undefined) requestHeaders["Content-Type"] = "application/json";
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let parsed = null;
  try {
    parsed = await response.json();
  } catch {
    parsed = null;
  }
  return { status: response.status, body: parsed, headers: response.headers };
}

export async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  let parsed = null;
  try {
    parsed = await response.json();
  } catch {
    parsed = null;
  }
  return { status: response.status, body: parsed, headers: response.headers };
}

export function syntheticClaims(uid) {
  return {
    name: "Synthetic QA User",
    email: `${uid}@example.invalid`,
    picture: null,
  };
}

export function uniqueUid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function readUser(db, uid) {
  const snapshot = await db.doc(`users/${uid}`).get();
  return snapshot.exists ? snapshot.data() : null;
}

export async function deleteUser(db, uid) {
  await db.doc(`users/${uid}`).delete();
}
