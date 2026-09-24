export type GoogleSignInErrorCategory =
  | "DEVELOPER_ERROR"
  | "SIGN_IN_FAILED"
  | "SIGN_IN_CANCELLED"
  | "CREDENTIAL_MANAGER_ERROR"
  | "NO_CREDENTIAL"
  | "FIREBASE_CREDENTIAL_ERROR"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export type GoogleSignInErrorStage =
  | "NATIVE_GOOGLE_SIGN_IN"
  | "ID_TOKEN_RETRIEVAL"
  | "FIREBASE_CREDENTIAL_EXCHANGE"
  | "PROFILE_PROVISIONING"
  | "UNKNOWN";

export interface ClassifiedGoogleSignInError {
  provider: "google";
  category: GoogleSignInErrorCategory;
  code: string | number | null;
  stage: GoogleSignInErrorStage;
  message: string;
  nativeFlow: "credential_manager" | "legacy_fallback" | "web_popup" | "unknown";
  credentialManagerEnabled?: boolean;
}

export class GoogleSignInFailure extends Error {
  readonly code: string | number | null;

  constructor(readonly diagnostic: ClassifiedGoogleSignInError) {
    super(diagnostic.message);
    this.name = "GoogleSignInFailure";
    this.code = diagnostic.code;
  }
}

const knownCodes = new Set<string | number>([
  7, 10, 16, 12500, 12501,
  "7", "10", "16", "12500", "12501",
  "DEVELOPER_ERROR", "SIGN_IN_FAILED", "SIGN_IN_CANCELLED", "CANCELED", "CANCELLED",
  "NETWORK_ERROR", "NO_CREDENTIAL", "CREDENTIAL_MANAGER_ERROR",
  "auth/popup-timeout", "auth/popup-blocked", "auth/popup-closed-by-user",
  "auth/cancelled-popup-request", "auth/network-request-failed",
  "auth/invalid-credential", "auth/account-exists-with-different-credential",
  "auth/operation-not-allowed", "auth/user-disabled", "auth/internal-error",
]);

export function classifyGoogleSignInError(
  error: unknown,
  stage: GoogleSignInErrorStage = "UNKNOWN",
  credentialManagerEnabled?: boolean,
  nativeFlow: ClassifiedGoogleSignInError["nativeFlow"] = credentialManagerEnabled === undefined
    ? "unknown"
    : credentialManagerEnabled ? "credential_manager" : "legacy_fallback",
): ClassifiedGoogleSignInError {
  if (error instanceof GoogleSignInFailure) return error.diagnostic;
  const candidate = error && typeof error === "object"
    ? error as { code?: unknown; statusCode?: unknown; message?: unknown; errorMessage?: unknown }
    : {};
  const rawCode = candidate.code ?? candidate.statusCode;
  let code = (typeof rawCode === "string" || typeof rawCode === "number") && knownCodes.has(rawCode)
    ? rawCode : null;
  const message = typeof error === "string" ? error
    : typeof candidate.message === "string" ? candidate.message
    : typeof candidate.errorMessage === "string" ? candidate.errorMessage : "";
  const normalizedMessage = message.toLowerCase();
  const signal = `${code ?? ""} ${normalizedMessage}`.toLowerCase();

  let category: GoogleSignInErrorCategory = "UNKNOWN";

  if (code === 10 || code === "10" || /developer[_ ]error|\b(?:code|status(?:code)?)\s*[:=]?\s*10\b|^\s*10\s*[:.]?\s*$|apiexception:\s*10\b/.test(signal)) {
    category = "DEVELOPER_ERROR";
    code ??= 10;
  } else if (code === 12501 || code === "12501" || code === 16 || code === "16" || signal.includes("cancel") || code === "auth/popup-closed-by-user") {
    category = "SIGN_IN_CANCELLED";
  } else if (code === 7 || code === "7" || signal.includes("network") || signal.includes("connection")) {
    category = "NETWORK_ERROR";
  } else if (code === "NO_CREDENTIAL" || /no credentials? available|no accounts|nocredential/.test(normalizedMessage)) {
    category = "NO_CREDENTIAL";
  } else if (code === "CREDENTIAL_MANAGER_ERROR" || /credential\s*manager|getcredentialexception/.test(normalizedMessage)) {
    category = "CREDENTIAL_MANAGER_ERROR";
  } else if (code === 12500 || code === "12500" || code === "SIGN_IN_FAILED") {
    category = "SIGN_IN_FAILED";
  }

  if ((category === "UNKNOWN" || category === "SIGN_IN_FAILED") && stage === "FIREBASE_CREDENTIAL_EXCHANGE") {
    category = "FIREBASE_CREDENTIAL_ERROR";
  }

  return {
    provider: "google",
    category,
    code,
    stage,
    message: category,
    nativeFlow,
    credentialManagerEnabled,
  };
}

export function googleSignInCategoryMessage(category: GoogleSignInErrorCategory): string {
  const messages: Record<GoogleSignInErrorCategory, string> = {
    DEVELOPER_ERROR: "Konfigurasi login Google aplikasi belum sesuai. Hubungi dukungan aplikasi.",
    SIGN_IN_FAILED: "Login Google belum berhasil. Silakan coba lagi.",
    SIGN_IN_CANCELLED: "Login Google dibatalkan. Silakan coba lagi saat siap.",
    CREDENTIAL_MANAGER_ERROR: "Layanan login Google di perangkat belum tersedia. Coba lagi atau perbarui layanan Google Play.",
    NO_CREDENTIAL: "Akun Google belum tersedia. Tambahkan akun Google di perangkat, lalu coba lagi.",
    FIREBASE_CREDENTIAL_ERROR: "Akun Google belum dapat diverifikasi. Silakan coba lagi.",
    NETWORK_ERROR: "Koneksi ke Google terputus. Periksa koneksi internetmu, lalu coba lagi.",
    UNKNOWN: "Login Google belum berhasil. Silakan coba lagi.",
  };
  return messages[category];
}
