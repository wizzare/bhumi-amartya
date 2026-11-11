import { createHash, createHmac, createSign, randomBytes, timingSafeEqual } from "node:crypto";

const PACKAGE_NAME = "com.bhumiamartya.app";
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
  | { valid: true; nonce: string; nonceHash: string; uidHash: string; signalBound: boolean }
  | { valid: false; reason: string };

export type PlayIntegrityVerificationResult = {
  verified: boolean;
  appRecognitionVerdict: string | null;
  deviceRecognitionVerdict: string[];
  appVersionCode?: number | null;
  reason: string;
};

function computeUidSha256(uid: string): string {
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
  const payloadB64 = Buffer.from(
    JSON.stringify({
      u: computeUidSha256(uid),
      n: nonce,
      iat,
      exp,
      ...(sigBind ? { sh: sigBind } : {}),
    }),
    "utf8",
  ).toString("base64url");
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
  const expectedSig = createHmac("sha256", secret).update(`challenge-v1:${payloadB64}`).digest("hex");
  const sigBuf = Buffer.from(sigHex, "utf8");
  const expBuf = Buffer.from(expectedSig, "utf8");
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return { valid: false, reason: "CHALLENGE_SIGNATURE_INVALID" };
  }
  let parsed: { u?: string; n?: string; exp?: number; sh?: string };
  try {
    parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return { valid: false, reason: "CHALLENGE_PAYLOAD_INVALID" };
  }
  const uidHash = computeUidSha256(uid);
  if (parsed.u !== uidHash || typeof parsed.n !== "string" || parsed.n.length < 16) {
    return { valid: false, reason: "CHALLENGE_UID_MISMATCH" };
  }
  if (typeof parsed.exp !== "number" || Math.floor(nowMs / 1000) > parsed.exp) {
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
  return { valid: true, nonce: parsed.n, nonceHash, uidHash, signalBound };
}

function normalizePrivateKey(rawKey?: string): string {
  const trimmed = (rawKey || "").trim();
  if (!trimmed) return "";
  return trimmed.startsWith("-----BEGIN")
    ? trimmed.replace(/\\n/g, "\n")
    : Buffer.from(trimmed, "base64").toString("utf8");
}

async function getPlayIntegrityAccessToken(fetchImpl: typeof fetch): Promise<string> {
  const clientEmail = process.env.GOOGLE_PLAY_CLIENT_EMAIL?.trim() || "";
  const privateKey = normalizePrivateKey(process.env.GOOGLE_PLAY_PRIVATE_KEY);
  if (!clientEmail || !privateKey) {
    throw new Error("PLAY_INTEGRITY_CREDENTIALS_MISSING");
  }
  const nowSec = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claim = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      scope: PLAY_INTEGRITY_SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      exp: nowSec + 3600,
      iat: nowSec,
    }),
  ).toString("base64url");
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  const assertion = `${header}.${claim}.${signer.sign(privateKey, "base64url")}`;
  const res = await fetchImpl("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    throw new Error("PLAY_INTEGRITY_ACCESS_TOKEN_ERROR");
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) {
    throw new Error("PLAY_INTEGRITY_ACCESS_TOKEN_MISSING");
  }
  return json.access_token;
}

export async function decodeAndVerifyPlayIntegrityToken(params: {
  integrityToken: string;
  expectedNonce: string;
  packageName?: string;
  nowMs?: number;
  fetchImpl?: typeof fetch;
}): Promise<PlayIntegrityVerificationResult> {
  const {
    integrityToken,
    expectedNonce,
    packageName = PACKAGE_NAME,
    nowMs = Date.now(),
    fetchImpl = fetch,
  } = params;
  if (!integrityToken || integrityToken.length > 8192) {
    return { verified: false, appRecognitionVerdict: null, deviceRecognitionVerdict: [], reason: "INTEGRITY_TOKEN_INVALID" };
  }
  try {
    const token = await getPlayIntegrityAccessToken(fetchImpl);
    const url = `https://playintegrity.googleapis.com/v1/${encodeURIComponent(packageName)}:decodeIntegrityToken`;
    const response = await fetchImpl(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
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
    const body = (await response.json()) as {
      tokenPayloadExternal?: {
        requestDetails?: { requestPackageName?: string; nonce?: string; timestampMillis?: string | number };
        appIntegrity?: { appRecognitionVerdict?: string };
        deviceIntegrity?: { deviceRecognitionVerdict?: string[] };
      };
    };
    const ext = body.tokenPayloadExternal;
    const reqDetails = ext?.requestDetails;
    const appVerdict = ext?.appIntegrity?.appRecognitionVerdict || null;
    const devVerdicts = Array.isArray(ext?.deviceIntegrity?.deviceRecognitionVerdict)
      ? ext!.deviceIntegrity!.deviceRecognitionVerdict
      : [];

    if (!reqDetails || reqDetails.requestPackageName !== packageName) {
      return { verified: false, appRecognitionVerdict: appVerdict, deviceRecognitionVerdict: devVerdicts, reason: "INTEGRITY_PACKAGE_MISMATCH" };
    }
    if (reqDetails.nonce !== expectedNonce) {
      return { verified: false, appRecognitionVerdict: appVerdict, deviceRecognitionVerdict: devVerdicts, reason: "INTEGRITY_NONCE_MISMATCH" };
    }
    const tsMs = Number(reqDetails.timestampMillis || 0);
    if (!Number.isFinite(tsMs) || Math.abs(nowMs - tsMs) > INTEGRITY_TIMESTAMP_MAX_DRIFT_MS) {
      return { verified: false, appRecognitionVerdict: appVerdict, deviceRecognitionVerdict: devVerdicts, reason: "INTEGRITY_TIMESTAMP_STALE" };
    }
    if (appVerdict !== "PLAY_RECOGNIZED") {
      return { verified: false, appRecognitionVerdict: appVerdict, deviceRecognitionVerdict: devVerdicts, reason: "APP_NOT_PLAY_RECOGNIZED" };
    }
    if (!devVerdicts.includes("MEETS_DEVICE_INTEGRITY") && !devVerdicts.includes("MEETS_STRONG_INTEGRITY")) {
      return { verified: false, appRecognitionVerdict: appVerdict, deviceRecognitionVerdict: devVerdicts, reason: "DEVICE_INTEGRITY_UNMET" };
    }
    return { verified: true, appRecognitionVerdict: appVerdict, deviceRecognitionVerdict: devVerdicts, reason: "VERIFIED" };
  } catch {
    return { verified: false, appRecognitionVerdict: null, deviceRecognitionVerdict: [], reason: "INTEGRITY_VERIFICATION_ERROR" };
  }
}

export async function verifyAppCheckHeaderToken(
  appCheckHeader: string | undefined,
  verifier?: (token: string) => Promise<unknown>,
): Promise<boolean> {
  if (!appCheckHeader || !appCheckHeader.trim() || !verifier) return false;
  try {
    await verifier(appCheckHeader.trim());
    return true;
  } catch {
    return false;
  }
}
