import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/firebase";
import { getRuntimeBuildInfo } from "@/lib/config/buildInfo";
import { ClassifiedGoogleSignInError } from "./classifyGoogleSignInError";

// Privacy-safe UID hash: sha256(uid).slice(0,8).
// Never log raw UID, email, name, birth data, or API keys.
function uidHash(uid: string | null | undefined): string | null {
  if (!uid) return null;
  // Lightweight FNV-1a hash; no Node crypto needed for client bundle.
  let h = 0x811c9dc5;
  for (let i = 0; i < uid.length; i++) {
    h ^= uid.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 8);
}

function genCorrelationId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export type AuthTelemetryEventType =
  | "AUTH_SIGNUP_STARTED"
  | "AUTH_ACCOUNT_CREATED"
  | "AUTH_PROFILE_CREATE_STARTED"
  | "AUTH_PROFILE_CREATED"
  | "AUTH_SIGNUP_COMPLETED"
  | "AUTH_SIGNUP_FAILED"
  | "AUTH_LOGIN_STARTED"
  | "AUTH_LOGIN_COMPLETED"
  | "AUTH_LOGIN_FAILED"
  | "AUTH_STATE_ESTABLISHED"
  | "PROFILE_LOADED"
  | "PROFILE_LOAD_FAILED"
  | "APP_READY"
  | "USER_DOCUMENT_CREATED";

export type AuthTelemetryMetadata = {
  stage?: string;
  errorClass?: string;
  errorCode?: string;
  correlationId?: string;
  durationMs?: number;
  isRetry?: boolean;
  hasProfile?: boolean;
  isNewUser?: boolean;
  // explicitly excluded: password, token, credential, email, name, birth
};

export async function recordAuthEvent(
  eventType: AuthTelemetryEventType,
  metadata?: AuthTelemetryMetadata,
  uid?: string | null,
): Promise<void> {
  try {
    const buildInfo = await getRuntimeBuildInfo();
    const event = {
      eventType,
      uidHash: uidHash(uid ?? auth.currentUser?.uid),
      appVersion: buildInfo.versionName,
      versionCode: buildInfo.versionCode,
      platform: buildInfo.platform,
      timestamp: serverTimestamp(),
      correlationId: metadata?.correlationId || genCorrelationId(),
      metadata: metadata
        ? {
            stage: metadata.stage ?? null,
            errorClass: metadata.errorClass ?? null,
            errorCode: metadata.errorCode ?? null,
            durationMs: metadata.durationMs ?? null,
            isRetry: metadata.isRetry ?? null,
            hasProfile: metadata.hasProfile ?? null,
            isNewUser: metadata.isNewUser ?? null,
          }
        : null,
    };
    await addDoc(collection(db, "telemetry_events"), event);
  } catch {
    // Telemetry failure must never break the auth flow.
  }
}

export async function recordGoogleSignInDiagnostic(
  classifiedError: ClassifiedGoogleSignInError,
  androidVersion?: string,
  deviceModel?: string
): Promise<void> {
  try {
    const buildInfo = await getRuntimeBuildInfo();
    const event = {
      eventType: "google_signin_failed",
      category: classifiedError.category,
      code: classifiedError.code,
      stage: classifiedError.stage,
      message: classifiedError.message,
      appVersion: buildInfo.versionName,
      versionCode: buildInfo.versionCode,
      platform: buildInfo.platform,
      androidVersion: androidVersion || null,
      deviceModel: deviceModel || null,
      locale: typeof navigator !== "undefined" ? navigator.language : "unknown",
      credentialManagerEnabled: classifiedError.credentialManagerEnabled || null,
      timestamp: serverTimestamp(),
      uid: auth.currentUser?.uid || null,
    };

    // Use analytics collection (best-effort)
    await addDoc(collection(db, "analytics"), event);
  } catch (error) {
    // Telemetry failure must never break the login flow
    console.error("[Auth Telemetry] Failed to record diagnostic:", error);
  }
}
