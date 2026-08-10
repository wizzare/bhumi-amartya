import { createSign } from 'node:crypto';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';

type TokenCache = { token: string; expiresAt: number };
let tokenCache: TokenCache | null = null;

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function credentials() {
  const clientEmail = String(process.env.GOOGLE_PLAY_CLIENT_EMAIL || '').trim();
  const privateKey = String(process.env.GOOGLE_PLAY_PRIVATE_KEY || '').replace(/\\n/g, '\n').trim();
  if (!clientEmail || !privateKey) return null;
  return { clientEmail, privateKey };
}

export function googlePlayCredentialStatus() {
  const c = credentials();
  return {
    serviceAccount: Boolean(c),
    reportBucket: Boolean(String(process.env.GOOGLE_PLAY_REPORT_BUCKET || '').trim()),
  };
}

export async function getGoogleAccessToken() {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;
  const c = credentials();
  if (!c) throw new Error('GOOGLE_PLAY_SERVICE_ACCOUNT_MISSING');

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64Url(JSON.stringify({
    iss: c.clientEmail,
    scope: [
      'https://www.googleapis.com/auth/playdeveloperreporting',
      'https://www.googleapis.com/auth/devstorage.read_only',
      'https://www.googleapis.com/auth/androidpublisher',
    ].join(' '),
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
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + Math.max(300, Number(data.expires_in || 3600) - 120) * 1000,
  };
  return tokenCache.token;
}
