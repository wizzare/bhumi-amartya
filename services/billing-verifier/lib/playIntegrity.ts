import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { GoogleAuth } from "google-auth-library";
import { PACKAGE_NAME } from "./security";

const PLAY_INTEGRITY_SCOPE = "https://www.googleapis.com/auth/playintegrity";
const CHALLENGE_TTL_SECONDS = 5 * 60;
const INTEGRITY_TIMESTAMP_MAX_DRIFT_MS = 10 * 60 * 1000;

export type ChallengeIssueResult = {
  nonce: string;
  challengeToken: string;
  expiresAt: string;
};

export type ChallengeVerificationResult =
  | {
      valid: true;
      nonce: string;
      nonceHash: string;
      uidHash: string;
    }
  | {
      valid: false;
      reason: string;
    };

export type PlayIntegrityVerificationResult = {
  verified: boolean;
  appRecognitionVerdict: string | null;
  deviceRecognitionVerdict: string[];
  reason: string;
};

export function resolveAntiAbuseHmacSecret(
  env: Record<string, string | undefined> = process.env,
): string {
  const configured = env.BHUMI_ANTI_ABUSE_HMAC_SECRET?.trim();
  if (configured && configured.length >= 16) {
    return configured;
  }
  if (env.NODE_ENV === "production") {
    throw new Error("ANTI_ABUSE_HMAC_SECRET_MISSING");
  }
  return "bhumi-dev-local-anti-abuse-hmac-key-only";
}

export function computeUidHash(uid: string): string {
  return createHash("sha256").update(`bhumi-uid-v1:${uid}`).digest("hex").slice(0, 32);
}

export function issueIntegrityChallenge(
  uid: string,
  secret: string,
  nowMs = Date.now(),
): ChallengeIssueResult {
  const nonce = randomBytes(24).toString("base64url");
  const iat = Math.floor(nowMs / 1000);
  const exp = iat + CHALLENGE_TTL_SECONDS;
  const payload = {
    u: computeUidHash(uid),
    n: nonce,
    iat,
    exp,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sigHex = createHmac("sha256", secret).update(`challenge-v1:${payloadB64}`).digest("hex");
  return {
    nonce,
    challengeToken: `${payloadB64}.${sigHex}`,
    expiresAt: new Date(exp * 1000).toISOString(),
  };
}

export function verifyIntegrityChallengeToken(
  challengeToken: string,
  uid: string,
  secret: string,
  nowMs = Date.now(),
): ChallengeVerificationResult {
  if (!challengeToken || typeof challengeToken !== "string") {
    return { valid: false, reason: "CHALLENGE_TOKEN_MISSING" };
  }
  const parts = challengeToken.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { valid: false, reason: "CHALLENGE_TOKEN_MALFORMED" };
  }
  const [payloadB64, sigHex] = parts;
  const expectedSig = createHmac("sha256", secret)
    .update(`challenge-v1:${payloadB64}`)
    .digest("hex");

  const sigBuf = Buffer.from(sigHex, "utf8");
  const expBuf = Buffer.from(expectedSig, "utf8");
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return { valid: false, reason: "CHALLENGE_SIGNATURE_INVALID" };
  }

  let parsed: { u?: string; n?: string; iat?: number; exp?: number };
  try {
    parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return { valid: false, reason: "CHALLENGE_PAYLOAD_INVALID" };
  }

  const uidHash = computeUidHash(uid);
  if (parsed.u !== uidHash || typeof parsed.n !== "string" || parsed.n.length < 16) {
    return { valid: false, reason: "CHALLENGE_UID_MISMATCH" };
  }

  const nowSec = Math.floor(nowMs / 1000);
  if (typeof parsed.exp !== "number" || nowSec > parsed.exp) {
    return { valid: false, reason: "CHALLENGE_EXPIRED" };
  }

  const nonceHash = createHash("sha256").update(`nonce-v1:${parsed.n}`).digest("hex");
  return {
    valid: true,
    nonce: parsed.n,
    nonceHash,
    uidHash,
  };
}

function normalizePrivateKey(rawKey?: string): string {
  const trimmed = (rawKey || "").trim();
  if (!trimmed) return "";
  return trimmed.startsWith("-----BEGIN")
    ? trimmed.replace(/\\n/g, "\n")
    : Buffer.from(trimmed, "base64").toString("utf8");
}

async function getPlayIntegrityAccessToken(): Promise<string> {
  const clientEmail = process.env.GOOGLE_PLAY_CLIENT_EMAIL?.trim() || "";
  const privateKey = normalizePrivateKey(process.env.GOOGLE_PLAY_PRIVATE_KEY);
  if (!clientEmail || !privateKey) {
    throw new Error("PLAY_INTEGRITY_CREDENTIALS_MISSING");
  }
  const auth = new GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: [PLAY_INTEGRITY_SCOPE],
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  if (!accessToken.token) {
    throw new Error("PLAY_INTEGRITY_ACCESS_TOKEN_MISSING");
  }
  return accessToken.token;
}

type DecodedIntegrityPayload = {
  tokenPayloadExternal?: {
    requestDetails?: {
      requestPackageName?: string;
      nonce?: string;
      timestampMillis?: string | number;
    };
    appIntegrity?: {
      appRecognitionVerdict?: string;
    };
    deviceIntegrity?: {
      deviceRecognitionVerdict?: string[];
    };
  };
};

export async function decodeAndVerifyPlayIntegrityToken(params: {
  integrityToken: string;
  expectedNonce: string;
  packageName?: string;
  nowMs?: number;
  fetchImpl?: typeof fetch;
  accessTokenProvider?: () => Promise<string>;
}): Promise<PlayIntegrityVerificationResult> {
  const {
    integrityToken,
    expectedNonce,
    packageName = PACKAGE_NAME,
    nowMs = Date.now(),
    fetchImpl = fetch,
    accessTokenProvider = getPlayIntegrityAccessToken,
  } = params;

  if (!integrityToken || integrityToken.length > 8192) {
    return {
      verified: false,
      appRecognitionVerdict: null,
      deviceRecognitionVerdict: [],
      reason: "INTEGRITY_TOKEN_INVALID",
    };
  }

  try {
    const token = await accessTokenProvider();
    const url = `https://playintegrity.googleapis.com/v1/${encodeURIComponent(packageName)}:decodeIntegrityToken`;
    const response = await fetchImpl(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ integrity_token: integrityToken }),
    });

    if (!response.ok) {
      return {
        verified: false,
        appRecognitionVerdict: null,
        deviceRecognitionVerdict: [],
        reason: `INTEGRITY_DECODE_HTTP_${response.status}`,
      };
    }

    const body = (await response.json()) as DecodedIntegrityPayload;
    const ext = body.tokenPayloadExternal;
    const reqDetails = ext?.requestDetails;
    const appVerdict = ext?.appIntegrity?.appRecognitionVerdict || null;
    const devVerdicts = Array.isArray(ext?.deviceIntegrity?.deviceRecognitionVerdict)
      ? ext!.deviceIntegrity!.deviceRecognitionVerdict
      : [];

    if (!reqDetails || reqDetails.requestPackageName !== packageName) {
      return {
        verified: false,
        appRecognitionVerdict: appVerdict,
        deviceRecognitionVerdict: devVerdicts,
        reason: "INTEGRITY_PACKAGE_MISMATCH",
      };
    }

    if (reqDetails.nonce !== expectedNonce) {
      return {
        verified: false,
        appRecognitionVerdict: appVerdict,
        deviceRecognitionVerdict: devVerdicts,
        reason: "INTEGRITY_NONCE_MISMATCH",
      };
    }

    const tsMs = Number(reqDetails.timestampMillis || 0);
    if (!Number.isFinite(tsMs) || Math.abs(nowMs - tsMs) > INTEGRITY_TIMESTAMP_MAX_DRIFT_MS) {
      return {
        verified: false,
        appRecognitionVerdict: appVerdict,
        deviceRecognitionVerdict: devVerdicts,
        reason: "INTEGRITY_TIMESTAMP_STALE",
      };
    }

    if (appVerdict !== "PLAY_RECOGNIZED") {
      return {
        verified: false,
        appRecognitionVerdict: appVerdict,
        deviceRecognitionVerdict: devVerdicts,
        reason: "APP_NOT_PLAY_RECOGNIZED",
      };
    }

    const meetsDevice =
      devVerdicts.includes("MEETS_DEVICE_INTEGRITY") ||
      devVerdicts.includes("MEETS_STRONG_INTEGRITY");
    if (!meetsDevice) {
      return {
        verified: false,
        appRecognitionVerdict: appVerdict,
        deviceRecognitionVerdict: devVerdicts,
        reason: "DEVICE_INTEGRITY_UNMET",
      };
    }

    return {
      verified: true,
      appRecognitionVerdict: appVerdict,
      deviceRecognitionVerdict: devVerdicts,
      reason: "VERIFIED",
    };
  } catch {
    return {
      verified: false,
      appRecognitionVerdict: null,
      deviceRecognitionVerdict: [],
      reason: "INTEGRITY_VERIFICATION_ERROR",
    };
  }
}

export async function verifyAppCheckHeaderToken(
  appCheckHeader: string | undefined,
  verifier?: (token: string) => Promise<unknown>,
): Promise<boolean> {
  if (!appCheckHeader || !appCheckHeader.trim() || !verifier) {
    return false;
  }
  try {
    await verifier(appCheckHeader.trim());
    return true;
  } catch {
    return false;
  }
}
