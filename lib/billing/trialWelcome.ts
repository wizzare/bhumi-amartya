const NEW_TRIAL_WELCOME_WINDOW_MS = 24 * 60 * 60 * 1000;

type TrialWelcomeProfile = {
  uid?: string | null;
  setupCompleted?: boolean;
  trialStartedAt?: unknown;
};

type TrialWelcomeEntitlement = {
  isPremium: boolean;
  reason: string;
  status: string;
};

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (value && typeof value === "object") {
    if ("toDate" in value && typeof (value as { toDate?: unknown }).toDate === "function") {
      return (value as { toDate: () => Date }).toDate();
    }
    if ("seconds" in value && typeof (value as { seconds?: unknown }).seconds === "number") {
      return new Date((value as { seconds: number }).seconds * 1000);
    }
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

export function getTrialWelcomePreferenceKey(profile: TrialWelcomeProfile): string | null {
  const startedAt = toDate(profile.trialStartedAt);
  if (!profile.uid || !startedAt) return null;
  return `bhumi.trial-welcome.v1.${profile.uid}.${startedAt.getTime()}`;
}

export function shouldShowTrialWelcome(
  profile: TrialWelcomeProfile,
  entitlement: TrialWelcomeEntitlement,
  now = new Date(),
): boolean {
  const startedAt = toDate(profile.trialStartedAt);
  if (!profile.uid || profile.setupCompleted !== true || !startedAt) return false;
  if (!entitlement.isPremium || entitlement.reason !== "trial" || entitlement.status !== "Active") return false;

  const ageMs = now.getTime() - startedAt.getTime();
  return ageMs >= 0 && ageMs <= NEW_TRIAL_WELCOME_WINDOW_MS;
}
