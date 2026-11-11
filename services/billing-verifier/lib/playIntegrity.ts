import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { GoogleAuth } from "google-auth-library";
import { PACKAGE_NAME } from "./security";

const PLAY_INTEGRITY_SCOPE = "https://www.googleapis.com/auth/playintegrity";
const CHALLENGE_TTL_SECONDS = 5 * 60;
const INTEGRITY_TIMESTAMP_MAX_DRIFT_MS = 10 * 60 * 1000;

export type ChallengeSignalBindingInput = {
  deviceIdHash?: string | null;
  appSetIdHash?: string | null;
  installIdHash?: string | null;
};

export type ChallengeIssueResult = {
  nonce: string;
  challengeToken: string;
  expiresAt: string;
  signalBound?: boolean;
};

export type ChallengeVerificationResult =
  | {
      valid: true;
      nonce: string;
      nonceHash: string;
      uidHash: string;
      signalBound: boolean;
    }
  | {
      valid: false;
      reason: string;
    };

export type PlayIntegrityVerificationResult = {
  verified: boolean;
  appRecognitionVerdict: string | null;
  deviceRecognitionVerdict: string[];
  appPackageName?: string | null;
  appVersionCode?: number | null;
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

function cleanSignalHash(val?: string | null): string {
  if (typeof val !== "string") return "";
  const trimmed = val.trim().toLowerCase();
  return /^[a-f0-9-]{16,128}$/i.test(trimmed) ? trimmed : "";
}

export function computeSignalBindingHash(signals?: ChallengeSignalBindingInput | null): string | null {
  if (!signals) return null;
  const dev = cleanSignalHash(signals.deviceIdHash);
  const appset = cleanSignalHash(signals.appSetIdHash);
  const inst = cleanSignalHash(signals.installIdHash);
  if (!dev && !appset && !inst) return null;
  return createHash("sha256")
    .update(`bhumi-sigbind-v1:${dev}|${appset}|${inst}`)
    .digest("base64url")
    .slice(0, 22);
}

export function issueIntegrityChallenge(
  uid: string,
  secret: string,
  nowMs = Date.now(),
  signals?: ChallengeSignalBindingInput | null,
): ChallengeIssueResult {
  const randomNonce = randomBytes(24).toString("base64url");
  const sigBind = computeSignalBindingHash(signals);
  const nonce = sigBind ? `${randomNonce}.${sigBind}` : randomNonce;
  const iat = Math.floor(nowMs / 1000);
  const exp = iat + CHALLENGE_TTL_SECONDS;
  const payload: { u: string; n: string; iat: number; exp: number; sh?: string } = {
    u: computeUidHash(uid),
    n: nonce,
    iat,
    exp,
    ...(sigBind ? { sh: sigBind } : {}),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sigHex = createHmac("sha256", secret).update(`challenge-v1:${payloadB64}`).digest("hex");
  return {
    nonce,
    challengeToken: `${payloadB64}.${sigHex}`,
    expiresAt: new Date(exp * 1000).toISOString(),
    signalBound: Boolean(sigBind),
  };
}

export function verifyIntegrityChallengeToken(
  challengeToken: string,
  uid: string,
  secret: string,
  nowMs = Date.now(),
  submittedSignals?: ChallengeSignalBindingInput | null,
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

  let parsed: { u?: string; n?: string; iat?: number; exp?: number; sh?: string };
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

  const signalBound = typeof parsed.sh === "string" && parsed.sh.length > 0;
  if (signalBound) {
    const submittedHash = computeSignalBindingHash(submittedSignals);
    if (!submittedHash || submittedHash !== parsed.sh || !parsed.n.endsWith(`.${parsed.sh}`)) {
      return { valid: false, reason: "CHALLENGE_SIGNAL_BINDING_MISMATCH" };
    }
  }

  const nonceHash = createHash("sha256").update(`nonce-v1:${parsed.n}`).digest("hex");
  return {
    valid: true,
    nonce: parsed.n,
    nonceHash,
    uidHash,
    signalBound,
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
      packageName?: string;
      certificateSha256Digest?: string[];
      versionCode?: string | number;
    };
    deviceIntegrity?: {
      deviceRecognitionVerdict?: string[];
    };
  };
};

function resolveMinPlayVersionCode(explicit?: number): number {
  if (typeof explicit === "number" && Number.isFinite(explicit) && explicit > 0) {
    return explicit;
  }
  const envVal = Number(process.env.BHUMI_MIN_PLAY_VERSION_CODE || "");
  return Number.isFinite(envVal) && envVal > 0 ? envVal : 122;
}

export function normalizeCertDigestToBase64Url(input: string): string | null {
  const cleaned = input.trim();
  if (!cleaned) return null;
  const compactHex = cleaned.replace(/:/g, "");
  if (/^[a-f0-9]{64}$/i.test(compactHex)) {
    return Buffer.from(compactHex, "hex").toString("base64url");
  }
  const urlSafe = cleaned.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return /^[A-Za-z0-9_-]{16,128}$/.test(urlSafe) ? urlSafe : null;
}

function resolveExpectedCertDigests(explicit?: string[]): { configured: boolean; digests: string[] } {
  const raw =
    Array.isArray(explicit)
      ? explicit
      : (process.env.BHUMI_PLAY_CERT_SHA256_B64 || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
  return {
    configured: raw.length > 0,
    digests: raw
      .map((s) => normalizeCertDigestToBase64Url(s))
      .filter((s): s is string => Boolean(s)),
  };
}

export async function decodeAndVerifyPlayIntegrityToken(params: {
  integrityToken: string;
  expectedNonce: string;
  packageName?: string;
  minVersionCode?: number;
  expectedCertDigests?: string[];
  nowMs?: number;
  fetchImpl?: typeof fetch;
  accessTokenProvider?: () => Promise<string>;
}): Promise<PlayIntegrityVerificationResult> {
  const {
    integrityToken,
    expectedNonce,
    packageName = PACKAGE_NAME,
    minVersionCode: explicitMinVersionCode,
    expectedCertDigests: explicitCertDigests,
    nowMs = Date.now(),
    fetchImpl = fetch,
    accessTokenProvider = getPlayIntegrityAccessToken,
  } = params;
  const minVersionCode = resolveMinPlayVersionCode(explicitMinVersionCode);
  const { configured: certPinConfigured, digests: expectedCertDigests } =
    resolveExpectedCertDigests(explicitCertDigests);

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
    const appPackageName =
      typeof ext?.appIntegrity?.packageName === "string" ? ext.appIntegrity.packageName : null;
    const rawVersionCode =
      ext?.appIntegrity?.versionCode !== undefined ? Number(ext.appIntegrity.versionCode) : NaN;
    const appVersionCode = Number.isFinite(rawVersionCode) ? rawVersionCode : null;
    const certDigests = Array.isArray(ext?.appIntegrity?.certificateSha256Digest)
      ? ext!.appIntegrity!.certificateSha256Digest.filter(
          (item): item is string => typeof item === "string" && item.length > 0,
        )
      : [];
    const devVerdicts = Array.isArray(ext?.deviceIntegrity?.deviceRecognitionVerdict)
      ? ext!.deviceIntegrity!.deviceRecognitionVerdict
      : [];

    if (!reqDetails || reqDetails.requestPackageName !== packageName) {
      return {
        verified: false,
        appRecognitionVerdict: appVerdict,
        deviceRecognitionVerdict: devVerdicts,
        appPackageName,
        appVersionCode,
        reason: "INTEGRITY_PACKAGE_MISMATCH",
      };
    }

    if (appPackageName && appPackageName !== packageName) {
      return {
        verified: false,
        appRecognitionVerdict: appVerdict,
        deviceRecognitionVerdict: devVerdicts,
        appPackageName,
        appVersionCode,
        reason: "INTEGRITY_PACKAGE_MISMATCH",
      };
    }

    if (reqDetails.nonce !== expectedNonce) {
      return {
        verified: false,
        appRecognitionVerdict: appVerdict,
        deviceRecognitionVerdict: devVerdicts,
        appPackageName,
        appVersionCode,
        reason: "INTEGRITY_NONCE_MISMATCH",
      };
    }

    const tsMs = Number(reqDetails.timestampMillis || 0);
    if (!Number.isFinite(tsMs) || Math.abs(nowMs - tsMs) > INTEGRITY_TIMESTAMP_MAX_DRIFT_MS) {
      return {
        verified: false,
        appRecognitionVerdict: appVerdict,
        deviceRecognitionVerdict: devVerdicts,
        appPackageName,
        appVersionCode,
        reason: "INTEGRITY_TIMESTAMP_STALE",
      };
    }

    if (appVerdict !== "PLAY_RECOGNIZED") {
      return {
        verified: false,
        appRecognitionVerdict: appVerdict,
        deviceRecognitionVerdict: devVerdicts,
        appPackageName,
        appVersionCode,
        reason: "APP_NOT_PLAY_RECOGNIZED",
      };
    }

    if (appVersionCode !== null && appVersionCode < minVersionCode) {
      return {
        verified: false,
        appRecognitionVerdict: appVerdict,
        deviceRecognitionVerdict: devVerdicts,
        appPackageName,
        appVersionCode,
        reason: "INTEGRITY_VERSION_TOO_OLD",
      };
    }

    if (
      certPinConfigured &&
      (expectedCertDigests.length === 0 ||
        !certDigests.some((digest) => {
          const normalized = normalizeCertDigestToBase64Url(digest);
          return normalized !== null && expectedCertDigests.includes(normalized);
        }))
    ) {
      return {
        verified: false,
        appRecognitionVerdict: appVerdict,
        deviceRecognitionVerdict: devVerdicts,
        appPackageName,
        appVersionCode,
        reason: "INTEGRITY_CERT_MISMATCH",
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
        appPackageName,
        appVersionCode,
        reason: "DEVICE_INTEGRITY_UNMET",
      };
    }

    return {
      verified: true,
      appRecognitionVerdict: appVerdict,
      deviceRecognitionVerdict: devVerdicts,
      appPackageName,
      appVersionCode,
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
