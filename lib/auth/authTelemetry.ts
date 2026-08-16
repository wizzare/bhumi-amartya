import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/firebase";
import { getRuntimeBuildInfo } from "@/lib/config/buildInfo";
import { ClassifiedGoogleSignInError } from "./classifyGoogleSignInError";

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
