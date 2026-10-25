import assert from "node:assert/strict";
import test from "node:test";
import { createTokenVerifier } from "../lib/token-verifier.mjs";
import { createSigningMaterial, signToken } from "./helpers.mjs";

const ISSUER = "https://securetoken.google.com/demo-bhumi-qa-bootstrap";
const AUDIENCE = "demo-bhumi-qa-bootstrap";
const NOW = Date.parse("2026-10-23T12:00:00.000Z");
const material = createSigningMaterial();
const verifier = createTokenVerifier({
  jwks: material.publicJwks,
  issuer: ISSUER,
  audience: AUDIENCE,
  now: () => NOW,
});
const strictVerifier = createTokenVerifier({
  jwks: material.publicJwks,
  issuer: ISSUER,
  audience: AUDIENCE,
  now: () => NOW,
  requireAuthTime: true,
});

const token = (overrides = {}) => signToken({
  material,
  issuer: ISSUER,
  audience: AUDIENCE,
  subject: "synthetic-user-a",
  now: NOW,
  ...overrides,
});

const rejectsWith = async (value, code) => {
  await assert.rejects(() => verifier(value), (error) => error.code === code);
};

test("accepts a correctly signed QA token", async () => {
  const decoded = await verifier(token());
  assert.equal(decoded.uid, "synthetic-user-a");
  assert.equal(decoded.claims.iss, ISSUER);
  assert.equal(decoded.claims.aud, AUDIENCE);
});

test("accepts an audience array containing the QA project", async () => {
  const decoded = await verifier(token({ claims: { aud: [AUDIENCE, "other-audience"] } }));
  assert.equal(decoded.uid, "synthetic-user-a");
});

test("rejects malformed compact tokens", async () => {
  await rejectsWith("not-a-jwt", "TOKEN_MALFORMED");
  await rejectsWith("a.b", "TOKEN_MALFORMED");
  await rejectsWith("a.b.c.d", "TOKEN_MALFORMED");
  await rejectsWith("", "TOKEN_MALFORMED");
});

test("rejects unsupported algorithms", async () => {
  await rejectsWith(token({ header: { alg: "none" } }), "TOKEN_ALGORITHM");
  await rejectsWith(token({ header: { alg: "HS256" } }), "TOKEN_ALGORITHM");
});

test("rejects unknown key identifiers", async () => {
  await rejectsWith(token({ header: { kid: "unknown-key" } }), "TOKEN_KID");
});

test("rejects a token signed by a different RSA key", async () => {
  const attacker = createSigningMaterial(material.kid);
  await rejectsWith(token({ material: attacker }), "TOKEN_SIGNATURE");
});

test("rejects expired tokens", async () => {
  await rejectsWith(token({ expiresInSeconds: -1 }), "TOKEN_EXPIRED");
});

test("rejects tokens issued too far in the future", async () => {
  await rejectsWith(token({ issuedAtSeconds: Math.floor(NOW / 1000) + 3600 }), "TOKEN_ISSUED_AT");
});

test("rejects tokens that are not yet valid", async () => {
  await rejectsWith(token({ claims: { nbf: Math.floor(NOW / 1000) + 3600 } }), "TOKEN_NOT_YET_VALID");
});

test("rejects wrong issuer and audience", async () => {
  await rejectsWith(token({ issuer: "https://securetoken.google.com/other-project" }), "TOKEN_ISSUER");
  await rejectsWith(token({ audience: "other-project" }), "TOKEN_AUDIENCE");
});

test("rejects production Firebase project tokens", async () => {
  await rejectsWith(token({
    issuer: "https://securetoken.google.com/bhumiamartya-fe85c",
    audience: "bhumiamartya-fe85c",
  }), "TOKEN_ISSUER");
});

test("rejects missing, empty, or path-like subjects", async () => {
  await rejectsWith(token({ subject: undefined }), "TOKEN_SUBJECT");
  await rejectsWith(token({ subject: "" }), "TOKEN_SUBJECT");
  await rejectsWith(token({ subject: "owner/other" }), "TOKEN_SUBJECT");
});

test("rejects malformed expiry and issued-at claims", async () => {
  await rejectsWith(token({ claims: { exp: "9999999999" } }), "TOKEN_EXPIRY");
  await rejectsWith(token({ claims: { iat: "1" } }), "TOKEN_ISSUED_AT");
});

test("strict verification requires a bounded auth_time", async () => {
  const accepted = await strictVerifier(token());
  assert.equal(accepted.claims.auth_time, Math.floor(NOW / 1000) - 60);
  await assert.rejects(() => strictVerifier(token({ claims: { auth_time: undefined } })), (error) => error.code === "TOKEN_AUTH_TIME");
  await assert.rejects(() => strictVerifier(token({ claims: { auth_time: "1" } })), (error) => error.code === "TOKEN_AUTH_TIME");
  await assert.rejects(() => strictVerifier(token({ claims: { auth_time: Math.floor(NOW / 1000) + 3600 } })), (error) => error.code === "TOKEN_AUTH_TIME");
  const legacy = await verifier(token({ claims: { auth_time: undefined } }));
  assert.equal(legacy.uid, "synthetic-user-a");
});

test("rejects a JWKS without usable RSA signing keys", () => {
  assert.throws(
    () => createTokenVerifier({
      jwks: { keys: [{ kty: "EC", kid: "ec-key" }] },
      issuer: ISSUER,
      audience: AUDIENCE,
    }),
    (error) => error.code === "JWKS_NO_USABLE_KEYS",
  );
});
