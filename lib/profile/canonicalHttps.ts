import { app as firebaseApp } from "@/lib/firebase/config";
import { getAuth } from "firebase/auth";

// RELEASE 119 HTTPS adapter replacing the Firebase Callable transport for the
// three canonical birth endpoints. Response/error semantics mirror callable
// semantics so callers in canonicalBirth.ts behave identically:
//   * 2xx body { ...data }   -> resolves like HttpsCallableResult
//   * 401                    -> throws { code: "functions/unauthenticated" }
//   * 403 permission         -> throws { code: "functions/permission-denied" }
//   * 400 invalid-argument   -> throws { code: "functions/invalid-argument" }
//   * anything else          -> throws { code: "functions/<server-code>" }
//     (callers treat the remainder as UNKNOWN, still fail-closed)

// Base resolution mirrors canonicalAccessBootstrap.verifierUrl(): the deployed
// billing verifier backend hosts the canonical APIs; browsers in non-native
// dev fall back to same-origin routes (which fail-closed until wired).
function canonicalApiBase(): string | null {
  const verifierBase = process.env.NEXT_PUBLIC_BILLING_VERIFIER_URL;
  if (typeof verifierBase === "string" && verifierBase.trim()) {
    return verifierBase.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/api`;
  }
  return null;
}

type CanonicalApiError = Error & { code?: string };

function throwCanonicalError(code: string, message: string): never {
  const error = new Error(message) as CanonicalApiError;
  error.code = code;
  throw error;
}

export async function callCanonicalApi(
  name: "commitCanonicalBirth" | "initializeCanonicalBirth" | "getCanonicalBirth",
  payload: Record<string, unknown>,
): Promise<{ data: unknown }> {
  const base = canonicalApiBase();
  if (!base) {
    throwCanonicalError("functions/unavailable", "Canonical API base is not configured.");
  }
  const currentUser = getAuth(firebaseApp).currentUser;
  if (!currentUser) throwCanonicalError("functions/unauthenticated", "Authentication required.");
  const token = await currentUser.getIdToken();
  let response: Response;
  try {
    response = await fetch(`${base}/api/canonical/${name}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ data: payload }),
      cache: "no-store",
    });
  } catch {
    throwCanonicalError("functions/unavailable", "Canonical API transport failed.");
  }
  if (response.status === 401) throwCanonicalError("functions/unauthenticated", "Authentication required.");
  if (response.status === 403) throwCanonicalError("functions/permission-denied", "Access denied.");
  if (response.status === 400) throwCanonicalError("functions/invalid-argument", "Invalid request.");
  if (!response.ok) throwCanonicalError("functions/internal", "Canonical API failure.");
  const body = (await response.json().catch(() => null)) as { data?: unknown } | Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    throwCanonicalError("functions/internal", "Canonical API returned an unreadable body.");
  }
  return { data: body };
}
