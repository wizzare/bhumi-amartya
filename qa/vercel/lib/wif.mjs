import { ExternalAccountClient } from "google-auth-library";

const MAX_OIDC_TOKEN_BYTES = 16 * 1024;
const JWT_SEGMENT = /^[A-Za-z0-9_-]+$/;

function reject(code) {
  throw Object.assign(new Error(code), { code });
}

export function getVercelOidcToken(req, env = process.env) {
  const header = req?.headers?.["x-vercel-oidc-token"];
  const headerValue = Array.isArray(header) ? header[0] : header;
  const token = String(headerValue || env.VERCEL_OIDC_TOKEN || "").trim();
  if (!token) reject("QA_VERCEL_OIDC_TOKEN_MISSING");
  if (Buffer.byteLength(token, "utf8") > MAX_OIDC_TOKEN_BYTES) reject("QA_VERCEL_OIDC_TOKEN_INVALID");
  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((part) => !JWT_SEGMENT.test(part))) {
    reject("QA_VERCEL_OIDC_TOKEN_INVALID");
  }
  return token;
}

export function buildExternalAccountConfig({ config, subjectToken }) {
  if (!config?.wif || typeof subjectToken !== "string" || !subjectToken) {
    reject("QA_VERCEL_WIF_CONFIG_INVALID");
  }
  return Object.freeze({
    type: "external_account",
    audience: config.wif.audience,
    subject_token_type: config.wif.subjectTokenType,
    token_url: config.wif.tokenUrl,
    service_account_impersonation_url: config.wif.serviceAccountImpersonationUrl,
    subject_token_supplier: Object.freeze({
      getSubjectToken: async () => subjectToken,
    }),
  });
}

export function createQaAuthClient({ config, subjectToken, factory = ExternalAccountClient.fromJSON }) {
  const authClient = factory(buildExternalAccountConfig({ config, subjectToken }));
  if (!authClient || typeof authClient.getAccessToken !== "function") {
    reject("QA_VERCEL_WIF_CLIENT_INVALID");
  }
  return authClient;
}

export function createAdminCredential(authClient) {
  if (!authClient || typeof authClient.getAccessToken !== "function") {
    reject("QA_VERCEL_WIF_CLIENT_INVALID");
  }
  return Object.freeze({
    async getAccessToken() {
      const result = await authClient.getAccessToken();
      const accessToken = typeof result === "string"
        ? result
        : result?.access_token || result?.token;
      if (typeof accessToken !== "string" || !accessToken) {
        reject("QA_VERCEL_ACCESS_TOKEN_MISSING");
      }
      const expiryDate = Number(authClient.credentials?.expiry_date || result?.expiry_date);
      const expiresIn = Number.isFinite(expiryDate)
        ? Math.max(1, Math.min(3600, Math.floor((expiryDate - Date.now()) / 1000)))
        : 3600;
      return { access_token: accessToken, expires_in: expiresIn };
    },
  });
}
