export type TrialBootstrapOutcome = "PROVISIONED" | "ALREADY_PRESENT" | "HIGHER_ENTITLEMENT" | "EXPIRED_BY_ACCOUNT_AGE" | "DATA_CONFLICT" | "AUTH_CREATION_TIME_UNAVAILABLE" | "RETRYABLE_ERROR";
export type TrialBootstrapResponse = { ok: boolean; outcome: TrialBootstrapOutcome };

const inFlight = new Map<string, Promise<TrialBootstrapResponse>>();
const completeUids = new Set<string>();

function verifierUrl() {
  const base = process.env.NEXT_PUBLIC_BILLING_VERIFIER_URL?.trim().replace(/\/+$/, "");
  if (!base) throw Object.assign(new Error("BILLING_VERIFIER_URL_MISSING"), { retryable: true });
  return `${base}/api/access/bootstrap-trial`;
}

export async function bootstrapCanonicalAccess(uid: string, getIdToken: (forceRefresh?: boolean) => Promise<string>, refreshUserProfile: () => Promise<unknown>): Promise<TrialBootstrapResponse> {
  if (completeUids.has(uid)) return { ok: true, outcome: "ALREADY_PRESENT" };
  const existing = inFlight.get(uid);
  if (existing) return existing;
  const request: Promise<TrialBootstrapResponse> = (async (): Promise<TrialBootstrapResponse> => {
    try {
      const response = await fetch(verifierUrl(), { method: "POST", headers: { Authorization: `Bearer ${await getIdToken(true)}`, "Content-Type": "application/json" } });
      const body = await response.json() as Partial<TrialBootstrapResponse>;
      const outcome: TrialBootstrapOutcome = body.outcome || "RETRYABLE_ERROR";
      if (!response.ok || !body.ok) return { ok: false, outcome };
      await refreshUserProfile();
      completeUids.add(uid);
      return { ok: true, outcome };
    } catch {
      return { ok: false, outcome: "RETRYABLE_ERROR" };
    } finally {
      inFlight.delete(uid);
    }
  })();
  inFlight.set(uid, request);
  return request;
}
