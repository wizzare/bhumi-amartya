import { createPublicKey, verify as verifySignature } from "node:crypto";
import { readFile } from "node:fs/promises";

const BASE64URL = /^[A-Za-z0-9_-]+$/;
const CLOCK_SKEW_SECONDS = 60;

function reject(code) {
  throw Object.assign(new Error(code), { code });
}

function decodeSegment(segment) {
  if (typeof segment !== "string" || !segment || !BASE64URL.test(segment)) {
    reject("TOKEN_MALFORMED");
  }
  const value = Buffer.from(segment, "base64url");
  if (value.length === 0) reject("TOKEN_MALFORMED");
  return value;
}

function parseJsonSegment(segment) {
  let parsed;
  try {
    parsed = JSON.parse(decodeSegment(segment).toString("utf8"));
  } catch {
    reject("TOKEN_MALFORMED");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) reject("TOKEN_MALFORMED");
  return parsed;
}

function normalizeJwks(input) {
  let jwks = input;
  if (typeof jwks === "string") {
    try {
      jwks = JSON.parse(jwks);
    } catch {
      reject("JWKS_MALFORMED");
    }
  }
  if (!jwks || typeof jwks !== "object" || !Array.isArray(jwks.keys)) reject("JWKS_MALFORMED");
  const keys = jwks.keys.filter((key) => {
    if (!key || typeof key !== "object") return false;
    if (key.kty !== "RSA") return false;
    if (typeof key.kid !== "string" || !key.kid) return false;
    if (typeof key.n !== "string" || !key.n) return false;
    if (typeof key.e !== "string" || !key.e) return false;
    if (key.use !== undefined && key.use !== "sig") return false;
    if (key.alg !== undefined && key.alg !== "RS256") return false;
    return true;
  });
  if (keys.length === 0) reject("JWKS_NO_USABLE_KEYS");
  return keys;
}

function audienceMatches(value, expected) {
  if (typeof value === "string") return value === expected;
  if (Array.isArray(value)) return value.includes(expected);
  return false;
}

export function createTokenVerifier({
  jwks,
  issuer,
  audience,
  now = () => Date.now(),
  requireAuthTime = false,
}) {
  if (typeof issuer !== "string" || !issuer) reject("TOKEN_ISSUER_CONFIG_INVALID");
  if (typeof audience !== "string" || !audience) reject("TOKEN_AUDIENCE_CONFIG_INVALID");
  const keys = normalizeJwks(jwks);

  return async function verifyToken(token) {
    if (typeof token !== "string" || !token) reject("TOKEN_MALFORMED");
    const parts = token.split(".");
    if (parts.length !== 3) reject("TOKEN_MALFORMED");

    const header = parseJsonSegment(parts[0]);
    if (header.alg !== "RS256") reject("TOKEN_ALGORITHM");
    if (header.typ !== undefined && header.typ !== "JWT") reject("TOKEN_TYPE");
    if (typeof header.kid !== "string" || !header.kid) reject("TOKEN_KID");

    const key = keys.find((candidate) => candidate.kid === header.kid);
    if (!key) reject("TOKEN_KID");

    let publicKey;
    try {
      publicKey = createPublicKey({ key: { kty: key.kty, n: key.n, e: key.e }, format: "jwk" });
    } catch {
      reject("TOKEN_SIGNATURE");
    }

    const signature = decodeSegment(parts[2]);
    let signatureValid = false;
    try {
      signatureValid = verifySignature(
        "RSA-SHA256",
        Buffer.from(`${parts[0]}.${parts[1]}`, "utf8"),
        publicKey,
        signature,
      );
    } catch {
      reject("TOKEN_SIGNATURE");
    }
    if (!signatureValid) reject("TOKEN_SIGNATURE");

    const payload = parseJsonSegment(parts[1]);
    if (payload.iss !== issuer) reject("TOKEN_ISSUER");
    if (!audienceMatches(payload.aud, audience)) reject("TOKEN_AUDIENCE");
    if (typeof payload.sub !== "string" || !payload.sub || payload.sub.includes("/")) {
      reject("TOKEN_SUBJECT");
    }
    if (payload.sub.length > 128) reject("TOKEN_SUBJECT");

    const nowSeconds = Math.floor(now() / 1000);
    if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) reject("TOKEN_EXPIRY");
    if (payload.exp <= nowSeconds) reject("TOKEN_EXPIRED");
    if (typeof payload.iat !== "number" || !Number.isFinite(payload.iat)) reject("TOKEN_ISSUED_AT");
    if (payload.iat > nowSeconds + CLOCK_SKEW_SECONDS) reject("TOKEN_ISSUED_AT");
    if (payload.nbf !== undefined) {
      if (typeof payload.nbf !== "number" || !Number.isFinite(payload.nbf)) reject("TOKEN_NOT_YET_VALID");
      if (payload.nbf > nowSeconds + CLOCK_SKEW_SECONDS) reject("TOKEN_NOT_YET_VALID");
    }
    if (requireAuthTime) {
      if (typeof payload.auth_time !== "number" || !Number.isFinite(payload.auth_time)) reject("TOKEN_AUTH_TIME");
      if (payload.auth_time < 0 || payload.auth_time > nowSeconds + CLOCK_SKEW_SECONDS) reject("TOKEN_AUTH_TIME");
    }

    return Object.freeze({ uid: payload.sub, claims: Object.freeze({ ...payload }) });
  };
}

export async function loadJwks({ jwksJson, jwksFile, jwksUrl }, fetchImpl = globalThis.fetch) {
  if (jwksJson) {
    try {
      return JSON.parse(jwksJson);
    } catch {
      reject("JWKS_MALFORMED");
    }
  }
  if (jwksFile) {
    let raw;
    try {
      raw = await readFile(jwksFile, "utf8");
    } catch {
      reject("JWKS_READ_FAILED");
    }
    try {
      return JSON.parse(raw);
    } catch {
      reject("JWKS_MALFORMED");
    }
  }
  if (typeof fetchImpl !== "function") reject("JWKS_FETCH_UNAVAILABLE");
  let response;
  try {
    response = await fetchImpl(jwksUrl, { signal: AbortSignal.timeout(5_000) });
  } catch {
    reject("JWKS_FETCH_FAILED");
  }
  if (!response.ok) reject("JWKS_FETCH_FAILED");
  try {
    return await response.json();
  } catch {
    reject("JWKS_MALFORMED");
  }
}
