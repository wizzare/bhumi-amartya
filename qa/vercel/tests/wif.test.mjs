import assert from "node:assert/strict";
import test from "node:test";
import { loadVercelQaConfig } from "../lib/config.mjs";
import {
  buildExternalAccountConfig,
  createAdminCredential,
  createQaAuthClient,
  getVercelOidcToken,
} from "../lib/wif.mjs";

const env = {
  BHUMI_QA_VERCEL: "1",
  QA_VERCEL_WIF_POOL_ID: "vercel-qa",
  QA_VERCEL_WIF_PROVIDER_ID: "vercel-qa",
  QA_VERCEL_SERVICE_ACCOUNT_EMAIL: "qa-bootstrap@bhumi-amartya-qa.iam.gserviceaccount.com",
};

const config = loadVercelQaConfig(env);
const token = "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZXN0In0.signature";

test("reads the Vercel OIDC token from the function header", () => {
  assert.equal(getVercelOidcToken({ headers: { "x-vercel-oidc-token": token } }, {}), token);
});

test("falls back to VERCEL_OIDC_TOKEN and rejects missing/malformed tokens", () => {
  assert.equal(getVercelOidcToken({ headers: {} }, { VERCEL_OIDC_TOKEN: token }), token);
  assert.throws(() => getVercelOidcToken({ headers: {} }, {}), { code: "QA_VERCEL_OIDC_TOKEN_MISSING" });
  assert.throws(() => getVercelOidcToken({ headers: { "x-vercel-oidc-token": "not-a-jwt" } }, {}), { code: "QA_VERCEL_OIDC_TOKEN_INVALID" });
});

test("builds a keyless WIF external-account configuration", async () => {
  const external = buildExternalAccountConfig({ config, subjectToken: token });
  assert.equal(external.type, "external_account");
  assert.equal(external.audience, config.wif.audience);
  assert.equal(external.service_account_impersonation_url, config.wif.serviceAccountImpersonationUrl);
  assert.equal(await external.subject_token_supplier.getSubjectToken(), token);
  assert.equal("private_key" in external, false);
});

test("creates an auth client without exposing credentials", () => {
  const fake = { getAccessToken: async () => ({ access_token: "access" }) };
  let received;
  const client = createQaAuthClient({
    config,
    subjectToken: token,
    factory: (options) => {
      received = options;
      return fake;
    },
  });
  assert.equal(client, fake);
  assert.equal(received.type, "external_account");
});

test("adapts a short-lived access token for Firebase Admin Auth", async () => {
  const credential = createAdminCredential({
    credentials: { expiry_date: Date.now() + 60_000 },
    getAccessToken: async () => ({ access_token: "short-lived" }),
  });
  const result = await credential.getAccessToken();
  assert.equal(result.access_token, "short-lived");
  assert.equal(result.expires_in > 0, true);
  assert.equal(result.expires_in <= 60, true);
});
