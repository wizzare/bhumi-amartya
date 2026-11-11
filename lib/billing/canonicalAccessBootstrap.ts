import { Capacitor } from "@capacitor/core";
import { assertQaOperationAllowed } from '../config/qaRuntime';
import {
  collectClientAntiAbuseSignals,
  requestNativePlayIntegrityToken,
} from "../antiAbuse/clientSignals";

export type TrialBootstrapOutcome =
  | "PROVISIONED"
  | "ALREADY_PRESENT"
  | "HIGHER_ENTITLEMENT"
  | "FREE_LIMIT_REACHED"
  | "VERIFICATION_REQUIRED"
  | "SIGNAL_UNAVAILABLE"
  | "EXPIRED_BY_ACCOUNT_AGE"
  | "DATA_CONFLICT"
  | "AUTH_CREATION_TIME_UNAVAILABLE"
  | "RETRYABLE_ERROR";

export type TrialBootstrapResponse = {
  ok: boolean;
  outcome: TrialBootstrapOutcome;
  eligibilityStatus?: string;
  reasons?: string[];
  mode?: string;
};

const inFlight = new Map<string, Promise<TrialBootstrapResponse>>();
const completeUids = new Set<string>();

function resolveVerifierEndpoint(apiPath: string): string {
  assertQaOperationAllowed();
  if (process.env.NEXT_PUBLIC_QA_MODE === 'realQA') {
    return `${process.env.NEXT_PUBLIC_BILLING_VERIFIER_URL!.replace(/\/+$/, '')}${apiPath}`;
  }
  // 1. Browser Web runtime: always prefer the same-origin Next.js route handler.
  // This eliminates cross-origin preflight/CORS dependencies in local and web environments.
  if (typeof window !== "undefined" && !Capacitor.isNativePlatform()) {
    return apiPath;
  }

  // 2. Native runtime (Capacitor/Android) or server execution: use canonical remote backend.
  const base = process.env.NEXT_PUBLIC_BILLING_VERIFIER_URL?.trim().replace(/\/+$/, "");
  if (base) return `${base}${apiPath}`;

  if (typeof window !== "undefined") return apiPath;
  throw Object.assign(new Error("BILLING_VERIFIER_URL_MISSING"), { retryable: true });
}

export function verifierUrl(): string {
  return resolveVerifierEndpoint("/api/access/bootstrap-trial");
}

export function challengeVerifierUrl(): string {
  return resolveVerifierEndpoint("/api/access/challenge");
}

export function deletionReconcileUrl(): string {
  return resolveVerifierEndpoint("/api/account/reconcile-deletion");
}

export async function bootstrapCanonicalAccess(uid: string, getIdToken: (forceRefresh?: boolean) => Promise<string>, refreshUserProfile: () => Promise<void>): Promise<TrialBootstrapResponse> {
  assertQaOperationAllowed();
  if (!uid) return { ok: false, outcome: "RETRYABLE_ERROR" };
  if (completeUids.has(uid)) return { ok: true, outcome: "ALREADY_PRESENT" };
  const existing = inFlight.get(uid);
  if (existing) return existing;
  const request: Promise<TrialBootstrapResponse> = (async (): Promise<TrialBootstrapResponse> => {
    try {
      const token = await getIdToken(true);
      const clientSignals = await collectClientAntiAbuseSignals().catch(() => null);

      if (clientSignals && clientSignals.platform === "android") {
        try {
          const chRes = await fetch(challengeVerifierUrl(), {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          if (chRes.ok) {
            const chBody = await chRes.json() as { ok?: boolean; nonce?: string; challengeToken?: string };
            if (chBody?.ok && chBody.nonce && chBody.challengeToken) {
              const pi = await requestNativePlayIntegrityToken(chBody.nonce);
              if (pi.integrityToken) {
                clientSignals.challengeToken = chBody.challengeToken;
                clientSignals.integrityToken = pi.integrityToken;
              }
            }
          }
        } catch {
          // Best-effort: fallback to device signals when challenge/Play Integrity is unavailable
        }
      }

      const response = await fetch(verifierUrl(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: clientSignals ? JSON.stringify(clientSignals) : undefined,
      });
      const body = await response.json() as Partial<TrialBootstrapResponse>;
      const outcome: TrialBootstrapOutcome = body.outcome || "RETRYABLE_ERROR";
      if (!response.ok || !body.ok) {
        if (outcome === "FREE_LIMIT_REACHED" || outcome === "VERIFICATION_REQUIRED" || outcome === "SIGNAL_UNAVAILABLE") {
          await refreshUserProfile().catch(() => {});
          completeUids.add(uid);
        }
        return {
          ok: false,
          outcome,
          eligibilityStatus: body.eligibilityStatus,
          reasons: body.reasons,
          mode: body.mode,
        };
      }
      await refreshUserProfile();
      completeUids.add(uid);
      return {
        ok: true,
        outcome,
        eligibilityStatus: body.eligibilityStatus,
        reasons: body.reasons,
        mode: body.mode,
      };
    } catch {
      return { ok: false, outcome: "RETRYABLE_ERROR" };
    } finally {
      inFlight.delete(uid);
    }
  })();
  inFlight.set(uid, request);
  return request;
}

export async function retryCanonicalAccessVerification(
  uid: string,
  getIdToken: (forceRefresh?: boolean) => Promise<string>,
  refreshUserProfile: () => Promise<void>,
): Promise<TrialBootstrapResponse> {
  if (uid) completeUids.delete(uid);
  return bootstrapCanonicalAccess(uid, getIdToken, refreshUserProfile);
}

export async function reconcileAntiAbuseAccountDeletion(
  getIdToken: (forceRefresh?: boolean) => Promise<string>,
): Promise<boolean> {
  try {
    const token = await getIdToken(true);
    const response = await fetch(deletionReconcileUrl(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function resetCanonicalAccessCache() {
  inFlight.clear();
  completeUids.clear();
}
