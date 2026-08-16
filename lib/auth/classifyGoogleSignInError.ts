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
  credentialManagerEnabled?: boolean;
}

export function classifyGoogleSignInError(
  error: any,
  stage: GoogleSignInErrorStage = "UNKNOWN",
  credentialManagerEnabled?: boolean
): ClassifiedGoogleSignInError {
  const code = error?.code || error?.statusCode || null;
  const message = error?.message || error?.errorMessage || "Unknown error";
  const normalizedMessage = message.toLowerCase();

  let category: GoogleSignInErrorCategory = "UNKNOWN";

  // 1. Check known status codes
  if (code === 10 || code === "10" || code === "DEVELOPER_ERROR") {
    category = "DEVELOPER_ERROR";
  } else if (code === 12500 || code === "12500") {
    category = "SIGN_IN_FAILED";
  } else if (code === 12501 || code === "12501" || code === 16 || code === "16" || normalizedMessage.includes("cancel")) {
    category = "SIGN_IN_CANCELLED";
  } else if (normalizedMessage.includes("no credentials available") || normalizedMessage.includes("no accounts")) {
    category = "NO_CREDENTIAL";
  } else if (normalizedMessage.includes("credentialmanager") || normalizedMessage.includes("getcredentialexception")) {
    category = "CREDENTIAL_MANAGER_ERROR";
  } else if (normalizedMessage.includes("network") || normalizedMessage.includes("connection")) {
    category = "NETWORK_ERROR";
  }

  // 2. Refine by stage if still UNKNOWN or generic
  if (category === "UNKNOWN" || category === "SIGN_IN_FAILED") {
    if (stage === "FIREBASE_CREDENTIAL_EXCHANGE") {
      category = "FIREBASE_CREDENTIAL_ERROR";
    }
  }

  return {
    provider: "google",
    category,
    code,
    stage,
    message: sanitizeErrorMessage(message),
    credentialManagerEnabled,
  };
}

function sanitizeErrorMessage(message: string): string {
  // Remove potential PII like email addresses from error messages
  return message.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]");
}
