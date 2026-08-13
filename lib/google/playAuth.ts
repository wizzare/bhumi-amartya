import { GoogleAuth } from "google-auth-library";

const DEFAULT_SCOPES = [
  "https://www.googleapis.com/auth/androidpublisher",
  "https://www.googleapis.com/auth/playdeveloperreporting",
  "https://www.googleapis.com/auth/devstorage.read_only",
];

export type PlayAuthSuccess = {
  ok: true;
  token: string;
  expiresAt: number;
};

export type PlayAuthFailure = {
  ok: false;
  code: "CONFIG_REQUIRED" | "AUTH_ERROR" | "UPSTREAM_ERROR";
  message: string;
};

export type PlayAuthResult = PlayAuthSuccess | PlayAuthFailure;

let cachedToken: { token: string; expiresAt: number } | null = null;
let singleFlightPromise: Promise<PlayAuthResult> | null = null;

function normalizePrivateKey(rawKey?: string): string | null {
  if (!rawKey) return null;
  const trimmed = rawKey.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("-----BEGIN")) {
    return trimmed.replace(/\\n/g, "\n");
  }
  try {
    const decoded = Buffer.from(trimmed, "base64").toString("utf-8");
    if (decoded.includes("-----BEGIN")) {
      return decoded.replace(/\\n/g, "\n");
    }
  } catch {
    // Return raw trimmed if base64 decoding fails or isn't base64
  }
  return trimmed.replace(/\\n/g, "\n");
}

export async function getPlayReportsAccessToken(
  customScopes?: string[]
): Promise<PlayAuthResult> {
  const now = Date.now();
  // 5 minute safety buffer before token expiration
  if (cachedToken && cachedToken.expiresAt - now > 5 * 60 * 1000) {
    return {
      ok: true,
      token: cachedToken.token,
      expiresAt: cachedToken.expiresAt,
    };
  }

  if (singleFlightPromise) {
    return singleFlightPromise;
  }

  singleFlightPromise = (async (): Promise<PlayAuthResult> => {
    try {
      const clientEmail = process.env.PLAY_REPORTS_CLIENT_EMAIL?.trim();
      const rawPrivateKey = process.env.PLAY_REPORTS_PRIVATE_KEY;
      const privateKey = normalizePrivateKey(rawPrivateKey);

      if (!clientEmail || !privateKey) {
        return {
          ok: false,
          code: "CONFIG_REQUIRED",
          message: "PLAY_REPORTS_CLIENT_EMAIL or PLAY_REPORTS_PRIVATE_KEY is missing",
        };
      }

      const scopes = customScopes && customScopes.length > 0 ? customScopes : DEFAULT_SCOPES;
      const auth = new GoogleAuth({
        credentials: {
          client_email: clientEmail,
          private_key: privateKey,
        },
        scopes,
      });

      const client = await auth.getClient();
      const response = await client.getAccessToken();

      if (!response.token) {
        return {
          ok: false,
          code: "AUTH_ERROR",
          message: "Failed to obtain access token from Google OAuth 2.0",
        };
      }

      // Default to 3600s expiration if res.res?.data.expires_in is not available
      const expiresInMs = 3600 * 1000;
      const expiresAt = Date.now() + expiresInMs;

      cachedToken = {
        token: response.token,
        expiresAt,
      };

      return {
        ok: true,
        token: response.token,
        expiresAt,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        code: "AUTH_ERROR",
        message: `Google Play Auth Exception: ${errMsg}`,
      };
    } finally {
      singleFlightPromise = null;
    }
  })();

  return singleFlightPromise;
}

export function clearPlayAuthTokenCache(): void {
  cachedToken = null;
  singleFlightPromise = null;
}
