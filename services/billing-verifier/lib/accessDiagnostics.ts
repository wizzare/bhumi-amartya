export type SafeAuthCode =
  | "AUTH_MISSING"
  | "AUTH_EXPIRED"
  | "AUTH_REVOKED"
  | "AUTH_INVALID"
  | "AUTH_MALFORMED"
  | "AUTH_PROJECT_MISMATCH"
  | "AUTH_CERTIFICATE_FETCH_FAILED"
  | "AUTH_INVALID_CREDENTIAL"
  | "AUTH_ARGUMENT_ERROR"
  | "AUTH_VERIFICATION_TIMEOUT"
  | "AUTH_NETWORK_FAILURE"
  | "AUTH_VERIFIER_CONFIGURATION_ERROR"
  | "AUTH_UNKNOWN"
  | "AUTH_VALID";

export type SafeErrorNameCategory = "STAGE_TIMEOUT" | "FIREBASE_AUTH_ERROR" | "TYPE_ERROR" | "ERROR" | "OTHER" | "NONE";
export type TokenSegmentCount = "0" | "1" | "2" | "3" | "4+";
export type TokenLengthBucket = "<100" | "100-499" | "500-1999" | "2000+";
export type ClaimMatch = boolean | "unavailable";
export type ExpState = "valid" | "expired" | "missing" | "unavailable";
export type IatState = "valid" | "future" | "missing" | "unavailable";

export type SafeTokenDiagnostics = {
  tokenSegmentCount: TokenSegmentCount;
  tokenLengthBucket: TokenLengthBucket;
  audMatch: ClaimMatch;
  issMatch: ClaimMatch;
  expState: ExpState;
  iatState: IatState;
  subPresent: boolean;
  kidPresent: boolean;
};

export type CertificateProbe = {
  reachable: boolean;
  httpStatusClass: "2xx" | "4xx" | "5xx" | "timeout" | "network_error";
  durationBucket: "<250ms" | "250-999ms" | "1000-2999ms" | "3000ms+";
};

export type SafeBootstrapDiagnosticLog = SafeTokenDiagnostics & {
  certEndpointReachable: boolean;
  httpStatusClass: CertificateProbe["httpStatusClass"];
  durationBucket: CertificateProbe["durationBucket"];
};

export type SafeAuthErrorMapping = {
  status: number;
  code: SafeAuthCode;
  retryable: boolean;
  safeErrorNameCategory: SafeErrorNameCategory;
};

export const FIREBASE_ID_TOKEN_CERTIFICATE_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

export function parseBearerAuthorization(authorization: string): { token?: string; code?: "AUTH_MISSING" | "AUTH_MALFORMED" } {
  if (!authorization.startsWith("Bearer ")) return { code: "AUTH_MISSING" };
  const token = authorization.slice(7).trim();
  return token ? { token } : { code: "AUTH_MALFORMED" };
}

function segmentCount(token: string): TokenSegmentCount {
  const count = token ? token.split(".").length : 0;
  return count >= 4 ? "4+" : String(count) as TokenSegmentCount;
}

function tokenLengthBucket(token: string): TokenLengthBucket {
  if (token.length < 100) return "<100";
  if (token.length < 500) return "100-499";
  if (token.length < 2000) return "500-1999";
  return "2000+";
}

function decodeJsonSegment(segment: string): Record<string, unknown> | null {
  try {
    const decoded = Buffer.from(segment, "base64url").toString("utf8");
    const value: unknown = JSON.parse(decoded);
    return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function normalizedNowSeconds(now: Date) {
  return Math.floor(now.getTime() / 1000);
}

export function inspectUnsignedToken(token: string, expectedProjectId: string | undefined, now = new Date()): { diagnostics: SafeTokenDiagnostics; preflightCode?: SafeAuthCode } {
  const base: SafeTokenDiagnostics = {
    tokenSegmentCount: segmentCount(token),
    tokenLengthBucket: tokenLengthBucket(token),
    audMatch: "unavailable",
    issMatch: "unavailable",
    expState: "unavailable",
    iatState: "unavailable",
    subPresent: false,
    kidPresent: false,
  };
  if (base.tokenSegmentCount !== "3") return { diagnostics: base, preflightCode: "AUTH_MALFORMED" };

  const [headerSegment, payloadSegment] = token.split(".");
  const header = decodeJsonSegment(headerSegment);
  const payload = decodeJsonSegment(payloadSegment);
  if (!header || !payload) return { diagnostics: base, preflightCode: "AUTH_MALFORMED" };

  const nowSeconds = normalizedNowSeconds(now);
  const audMatch: ClaimMatch = expectedProjectId ? payload.aud === expectedProjectId : "unavailable";
  const issMatch: ClaimMatch = expectedProjectId ? payload.iss === `https://securetoken.google.com/${expectedProjectId}` : "unavailable";
  const expState: ExpState = typeof payload.exp === "number" ? (payload.exp <= nowSeconds ? "expired" : "valid") : "missing";
  const iatState: IatState = typeof payload.iat === "number" ? (payload.iat > nowSeconds ? "future" : "valid") : "missing";
  const diagnostics: SafeTokenDiagnostics = {
    ...base,
    audMatch,
    issMatch,
    expState,
    iatState,
    subPresent: typeof payload.sub === "string" && payload.sub.length > 0,
    kidPresent: typeof header.kid === "string" && header.kid.length > 0,
  };
  if (audMatch === false || issMatch === false) return { diagnostics, preflightCode: "AUTH_PROJECT_MISMATCH" };
  if (expState === "expired") return { diagnostics, preflightCode: "AUTH_EXPIRED" };
  return { diagnostics };
}

export function safeErrorNameCategory(error: unknown): SafeErrorNameCategory {
  const name = error && typeof error === "object" && typeof (error as { name?: unknown }).name === "string"
    ? (error as { name: string }).name
    : "";
  if (name === "StageTimeoutError") return "STAGE_TIMEOUT";
  if (name === "FirebaseAuthError") return "FIREBASE_AUTH_ERROR";
  if (name === "TypeError") return "TYPE_ERROR";
  if (name === "Error") return "ERROR";
  return "OTHER";
}

export function mapSafeAuthError(error: unknown): SafeAuthErrorMapping {
  const safeErrorName = safeErrorNameCategory(error);
  if (safeErrorName === "STAGE_TIMEOUT") {
    return { status: 504, code: "AUTH_VERIFICATION_TIMEOUT", retryable: true, safeErrorNameCategory: safeErrorName };
  }
  const code = error && typeof error === "object" && typeof (error as { code?: unknown }).code === "string"
    ? (error as { code: string }).code
    : "";
  const permanent = (safeCode: SafeAuthCode) => ({ status: 401, code: safeCode, retryable: false, safeErrorNameCategory: safeErrorName } as const);
  switch (code) {
    case "auth/id-token-expired": return permanent("AUTH_EXPIRED");
    case "auth/id-token-revoked": return permanent("AUTH_REVOKED");
    case "auth/invalid-id-token": return permanent("AUTH_INVALID");
    case "auth/argument-error": return permanent("AUTH_ARGUMENT_ERROR");
    case "auth/invalid-credential":
    case "app/invalid-credential": return { status: 503, code: "AUTH_INVALID_CREDENTIAL", retryable: true, safeErrorNameCategory: safeErrorName };
    case "key-fetch-error": return { status: 503, code: "AUTH_CERTIFICATE_FETCH_FAILED", retryable: true, safeErrorNameCategory: safeErrorName };
    case "AUTH_VERIFIER_CONFIGURATION_ERROR": return { status: 503, code: "AUTH_VERIFIER_CONFIGURATION_ERROR", retryable: false, safeErrorNameCategory: safeErrorName };
    default:
      if (safeErrorName === "TYPE_ERROR") return { status: 503, code: "AUTH_NETWORK_FAILURE", retryable: true, safeErrorNameCategory: safeErrorName };
      return permanent("AUTH_UNKNOWN");
  }
}

function durationBucket(durationMs: number): CertificateProbe["durationBucket"] {
  if (durationMs < 250) return "<250ms";
  if (durationMs < 1000) return "250-999ms";
  if (durationMs < 3000) return "1000-2999ms";
  return "3000ms+";
}

export async function probeFirebaseCertificates(fetchImpl: typeof fetch = fetch, now = () => Date.now()): Promise<CertificateProbe> {
  const startedAt = now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetchImpl(FIREBASE_ID_TOKEN_CERTIFICATE_URL, { method: "GET", signal: controller.signal });
    const httpStatusClass = response.status >= 200 && response.status < 300 ? "2xx" : response.status >= 500 ? "5xx" : "4xx";
    return { reachable: true, httpStatusClass, durationBucket: durationBucket(now() - startedAt) };
  } catch (error) {
    const timedOut = error && typeof error === "object" && typeof (error as { name?: unknown }).name === "string" && (error as { name: string }).name === "AbortError";
    return { reachable: false, httpStatusClass: timedOut ? "timeout" : "network_error", durationBucket: durationBucket(now() - startedAt) };
  } finally {
    clearTimeout(timeout);
  }
}

export function safeBootstrapDiagnosticLog(diagnostics: SafeTokenDiagnostics, certificateProbe: CertificateProbe): SafeBootstrapDiagnosticLog {
  return {
    ...diagnostics,
    certEndpointReachable: certificateProbe.reachable,
    httpStatusClass: certificateProbe.httpStatusClass,
    durationBucket: certificateProbe.durationBucket,
  };
}

export function accessBootstrapDiagnosticOnly() {
  return process.env.VERCEL_ENV === "preview" && process.env.ACCESS_BOOTSTRAP_DIAGNOSTIC_ONLY === "true";
}
