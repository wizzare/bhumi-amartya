import { createServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import { readFileSync } from "node:fs";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { bootstrapFirstLogin, bootstrapTrialOnly } from "./first-login.mjs";
import { createIdentityToolkitRevocationChecker } from "./revocation.mjs";
import { createTokenVerifier, loadJwks } from "./token-verifier.mjs";

export const MAX_BODY_BYTES = 16 * 1024;
const TRIAL_ROUTE = "/api/access/bootstrap-trial";
const FIRST_LOGIN_ROUTE = "/api/qa/bootstrap-first-login";
const HEALTH_ROUTES = new Set(["/healthz", "/api/healthz"]);
const APP_NAME = "qa-local-bootstrap";

export function sendJson(res, status, body, extraHeaders = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...extraHeaders,
  });
  res.end(JSON.stringify(body));
}

export function corsHeaders(origin) {
  return origin
    ? {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        Vary: "Origin",
      }
    : {
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        Vary: "Origin",
      };
}

export function originAllowed(config, origin) {
  if (!origin) return true;
  return config.allowedOrigins.includes(origin);
}

async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    let body;
    try {
      if (Buffer.isBuffer(req.body)) body = req.body.toString("utf8");
      else if (typeof req.body === "string") body = req.body;
      else body = JSON.stringify(req.body);
    } catch {
      throw Object.assign(new Error("BODY_INVALID"), { code: "BODY_INVALID" });
    }
    if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
      throw Object.assign(new Error("BODY_TOO_LARGE"), { code: "BODY_TOO_LARGE" });
    }
    return body;
  }

  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BODY_BYTES) {
      throw Object.assign(new Error("BODY_TOO_LARGE"), { code: "BODY_TOO_LARGE" });
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function parseBody(raw) {
  if (!raw.trim()) return null;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw Object.assign(new Error("BODY_INVALID"), { code: "BODY_INVALID" });
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw Object.assign(new Error("BODY_INVALID"), { code: "BODY_INVALID" });
  }
  if (Object.keys(parsed).length > 0) {
    throw Object.assign(new Error("BODY_INVALID"), { code: "BODY_INVALID" });
  }
  return parsed;
}

export function bearerToken(req) {
  const authorization = req.headers.authorization;
  if (typeof authorization !== "string" || !authorization.startsWith("Bearer ")) return null;
  const token = authorization.slice(7).trim();
  return token || null;
}

function statusFor(result) {
  if (result.outcome === "DATA_CONFLICT") return 409;
  if (result.ok) return 200;
  return 500;
}

export async function handleRequest({ config, verifier, revocationCheck, db, now = () => new Date(), req, res }) {
  try {
    const requestUrl = new URL(req.url || "/", "http://127.0.0.1");
    if (req.method === "GET" && HEALTH_ROUTES.has(requestUrl.pathname)) {
      sendJson(res, 200, {
        ok: true,
        service: config.service,
        projectId: config.projectId,
        authProjectId: config.authProjectId || config.projectId,
        firestoreProjectId: config.firestoreProjectId || config.projectId,
        firestoreHost: config.firestoreHost,
        issuer: config.issuer,
        audience: config.audience,
        revocationEnabled: Boolean(config.requireRevocation),
        firstLoginRoute: true,
      });
      return;
    }

    if (requestUrl.pathname !== TRIAL_ROUTE && requestUrl.pathname !== FIRST_LOGIN_ROUTE) {
      sendJson(res, 404, { ok: false, outcome: "NOT_FOUND" });
      return;
    }

    const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
    if (!originAllowed(config, origin)) {
      sendJson(res, 403, { ok: false, outcome: "ORIGIN_NOT_ALLOWED" });
      return;
    }

    const headers = corsHeaders(origin);
    if (req.method === "OPTIONS") {
      res.writeHead(204, headers);
      res.end();
      return;
    }
    if (req.method !== "POST") {
      sendJson(res, 405, { ok: false, outcome: "METHOD_NOT_ALLOWED" }, headers);
      return;
    }

    const contentLength = Number(req.headers["content-length"] || 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      sendJson(res, 413, { ok: false, outcome: "BODY_INVALID" }, headers);
      return;
    }

    try {
      parseBody(await readBody(req));
    } catch (error) {
      const status = error?.code === "BODY_TOO_LARGE" ? 413 : 400;
      sendJson(res, status, { ok: false, outcome: "BODY_INVALID" }, headers);
      return;
    }

    const token = bearerToken(req);
    if (!token) {
      sendJson(res, 401, { ok: false, outcome: "AUTH_MISSING" }, headers);
      return;
    }

    let decoded;
    try {
      decoded = await verifier(token);
      if (revocationCheck) await revocationCheck(token, decoded);
    } catch (error) {
      if (error?.code === "QA_VERCEL_UNAVAILABLE" || error?.code === "TOKEN_REVOCATION_UNAVAILABLE") {
        sendJson(res, 503, { ok: false, outcome: "QA_BACKEND_UNAVAILABLE" }, headers);
        return;
      }
      sendJson(res, 401, { ok: false, outcome: "AUTH_INVALID" }, headers);
      return;
    }

    const result = requestUrl.pathname === FIRST_LOGIN_ROUTE
      ? await bootstrapFirstLogin({ db, uid: decoded.uid, claims: decoded.claims, now })
      : await bootstrapTrialOnly({ db, uid: decoded.uid, now });

    sendJson(res, statusFor(result), result, headers);
  } catch {
    sendJson(res, 500, { ok: false, outcome: "RETRYABLE_ERROR" });
  }
}

export function createLocalBootstrapServer({ config, verifier, revocationCheck, db, now = () => new Date() }) {
  if (config.requireRevocation && typeof revocationCheck !== "function") {
    throw Object.assign(new Error("QA_REVOCATION_CONFIG_REQUIRED"), { code: "QA_REVOCATION_CONFIG_REQUIRED" });
  }
  const handler = (req, res) => handleRequest({ config, verifier, revocationCheck, db, now, req, res });
  if (!config.tls) return createServer(handler);
  let cert;
  let key;
  try {
    cert = readFileSync(config.tls.certFile);
    key = readFileSync(config.tls.keyFile);
  } catch {
    throw Object.assign(new Error("QA_TLS_READ_FAILED"), { code: "QA_TLS_READ_FAILED" });
  }
  return createHttpsServer({ cert, key }, handler);
}

export async function startLocalBootstrapServer(config) {
  const existing = getApps().find((app) => app.name === APP_NAME);
  const firestoreProjectId = config.firestoreProjectId || config.projectId;
  if (existing && existing.options.projectId !== firestoreProjectId) {
    throw Object.assign(new Error("QA_ADMIN_APP_PROJECT_MISMATCH"), { code: "QA_ADMIN_APP_PROJECT_MISMATCH" });
  }
  const app = existing || initializeApp({ projectId: firestoreProjectId }, APP_NAME);
  const db = getFirestore(app);
  const jwks = await loadJwks(config.jwks);
  const verifier = createTokenVerifier({
    jwks,
    issuer: config.issuer,
    audience: config.audience,
    requireAuthTime: Boolean(config.requireRevocation),
  });
  const revocationCheck = config.requireRevocation
    ? createIdentityToolkitRevocationChecker({
        lookupUrl: config.identityToolkit?.lookupUrl,
        apiKey: config.identityToolkit?.apiKey,
      })
    : undefined;
  const server = createLocalBootstrapServer({ config, verifier, revocationCheck, db });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(config.port, config.host, resolve);
  });
  return { app, db, server, verifier, revocationCheck };
}
