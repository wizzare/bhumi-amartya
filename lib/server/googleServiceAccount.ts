import { createSign } from 'node:crypto';
import { headers } from 'next/headers';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const STS_URL = 'https://sts.googleapis.com/v1/token';
const IAM_CREDENTIALS_URL = 'https://iamcredentials.googleapis.com/v1';
const DEFAULT_WIF = {
  projectNumber: '59259824153',
  serviceAccountEmail: 'bhumi-founder-play-reports@bhumiamartya-fe85c.iam.gserviceaccount.com',
  poolId: 'vercel',
  providerId: 'vercel-bhumi',
};
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/playdeveloperreporting',
  'https://www.googleapis.com/auth/devstorage.read_only',
  'https://www.googleapis.com/auth/androidpublisher',
];

type TokenCache = { token: string; expiresAt: number };
let tokenCache: TokenCache | null = null;

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function keyCredentials() {
  const clientEmail = String(process.env.GOOGLE_PLAY_CLIENT_EMAIL || '').trim();
  const privateKey = String(process.env.GOOGLE_PLAY_PRIVATE_KEY || '').replace(/\\n/g, '\n').trim();
  if (!clientEmail || !privateKey) return null;
  return { clientEmail, privateKey };
}

function wifCredentials() {
  const projectNumber = String(process.env.GCP_PROJECT_NUMBER || DEFAULT_WIF.projectNumber).trim();
  const serviceAccountEmail = String(process.env.GCP_SERVICE_ACCOUNT_EMAIL || DEFAULT_WIF.serviceAccountEmail).trim();
  const poolId = String(process.env.GCP_WORKLOAD_IDENTITY_POOL_ID || DEFAULT_WIF.poolId).trim();
  const providerId = String(process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID || DEFAULT_WIF.providerId).trim();
  if (!projectNumber || !serviceAccountEmail || !poolId || !providerId) return null;
  return { projectNumber, serviceAccountEmail, poolId, providerId };
}

async function resolveOidcToken(explicitToken = '') {
  if (explicitToken) return explicitToken;
  const envToken = String(process.env.VERCEL_OIDC_TOKEN || '').trim();
  if (envToken) return envToken;
  try {
    const requestHeaders = await headers();
    return String(requestHeaders.get('x-vercel-oidc-token') || '').trim();
  } catch {
    return '';
  }
}

export function googlePlayCredentialStatus() {
  const key = keyCredentials();
  const wif = wifCredentials();
  return {
    serviceAccount: Boolean(key || wif),
    authMode: wif ? 'wif' as const : key ? 'key' as const : 'missing' as const,
    reportBucket: Boolean(String(process.env.GOOGLE_PLAY_REPORT_BUCKET || '').trim()),
  };
}

async function getKeyAccessToken() {
  const c = keyCredentials();
  if (!c) throw new Error('GOOGLE_PLAY_SERVICE_ACCOUNT_MISSING');

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64Url(JSON.stringify({
    iss: c.clientEmail,
    scope: GOOGLE_SCOPES.join(' '),
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${base64Url(signer.sign(c.privateKey))}`;

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`GOOGLE_OAUTH_FAILED:${response.status}:${detail.slice(0, 160)}`);
  }

  const data = await response.json() as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new Error('GOOGLE_OAUTH_TOKEN_MISSING');
  return {
    token: data.access_token,
    expiresAt: Date.now() + Math.max(300, Number(data.expires_in || 3600) - 120) * 1000,
  };
}

async function getWifAccessToken(oidcToken: string) {
  const c = wifCredentials();
  if (!c) throw new Error('GOOGLE_WIF_CONFIG_MISSING');
  if (!oidcToken) throw new Error('VERCEL_OIDC_TOKEN_MISSING');

  const audience = `//iam.googleapis.com/projects/${c.projectNumber}/locations/global/workloadIdentityPools/${c.poolId}/providers/${c.providerId}`;
  const stsResponse = await fetch(STS_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grantType: 'urn:ietf:params:oauth:grant-type:token-exchange',
      audience,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      requestedTokenType: 'urn:ietf:params:oauth:token-type:access_token',
      subjectToken: oidcToken,
      subjectTokenType: 'urn:ietf:params:oauth:token-type:jwt',
    }),
    cache: 'no-store',
  });

  if (!stsResponse.ok) {
    const detail = await stsResponse.text().catch(() => '');
    throw new Error(`GOOGLE_STS_FAILED:${stsResponse.status}:${detail.slice(0, 160)}`);
  }

  const stsData = await stsResponse.json() as { access_token?: string };
  if (!stsData.access_token) throw new Error('GOOGLE_STS_TOKEN_MISSING');

  const impersonationResponse = await fetch(
    `${IAM_CREDENTIALS_URL}/projects/-/serviceAccounts/${encodeURIComponent(c.serviceAccountEmail)}:generateAccessToken`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${stsData.access_token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ scope: GOOGLE_SCOPES, lifetime: '3600s' }),
      cache: 'no-store',
    },
  );

  if (!impersonationResponse.ok) {
    const detail = await impersonationResponse.text().catch(() => '');
    throw new Error(`GOOGLE_IMPERSONATION_FAILED:${impersonationResponse.status}:${detail.slice(0, 160)}`);
  }

  const tokenData = await impersonationResponse.json() as { accessToken?: string; expireTime?: string };
  if (!tokenData.accessToken) throw new Error('GOOGLE_IMPERSONATION_TOKEN_MISSING');
  const expireTime = Date.parse(String(tokenData.expireTime || ''));
  return {
    token: tokenData.accessToken,
    expiresAt: Number.isFinite(expireTime) ? expireTime - 120_000 : Date.now() + 50 * 60 * 1000,
  };
}

export async function getGoogleAccessToken(oidcToken = '') {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;

  const wif = wifCredentials();
  const key = keyCredentials();
  if (!wif && !key) throw new Error('GOOGLE_PLAY_AUTH_MISSING');

  const next = wif
    ? await getWifAccessToken(await resolveOidcToken(oidcToken))
    : await getKeyAccessToken();

  tokenCache = next;
  return next.token;
}
