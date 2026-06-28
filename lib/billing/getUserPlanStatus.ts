import { safeJsonParse } from "@/lib/storage/safeJson";
import { getUserRole } from "@/lib/auth/getUserRole";
import { isGaiaAccessOverrideActive } from "@/lib/billing/gaiaAccess";

export const USER_PLAN_STORAGE_KEY = "bhumiUserPlan";
export const FREE_TRIAL_DAYS = 3;

const LOCAL_DEVELOPER_PRO_EMAILS = [
  "wizzare@gmail.com",
  "dj.neynna@gmail.com",
] as const;

export const DEVELOPER_PRO_EMAILS =
  process.env.NODE_ENV === "production" ? [] : ([...LOCAL_DEVELOPER_PRO_EMAILS] as string[]);

export type UserPlan = {
  plan: "free" | "pro";
  startedAt: string;
  expiresAt?: string;
  source: "local-mvp" | "google-play" | "developer-override";
};

export type UserPlanStatus = {
  plan: "free" | "pro";
  isPro: boolean;
  isDeveloper: boolean;
  isTrialActive: boolean;
  trialDaysLeft: number | null;
  isLocked: boolean;
  source: UserPlan["source"];
};

export type UserPlanStatusInput = (UserPlan & { email?: string | null }) | null | undefined;

type NormalizedUserPlan = {
  plan: "free" | "pro";
  startedAt?: string;
  expiresAt?: string;
  source?: string;
};

export function normalizeUserPlan(input: unknown): NormalizedUserPlan {
  const read = (value: unknown): NormalizedUserPlan => {
    if (!value) return { plan: "free" };
    if (typeof value === "string") {
      return { plan: value.toLowerCase() === "pro" ? "pro" : "free" };
    }
    if (typeof value === "object") {
      const obj = value as Record<string, unknown>;
      if ("plan" in obj && typeof obj.plan === "object" && obj.plan) {
        return read(obj.plan);
      }
      const planValue = typeof obj.plan === "string"
        ? obj.plan
        : (typeof obj.status === "string" ? obj.status : "free");
      return {
        plan: planValue.toLowerCase() === "pro" ? "pro" : "free",
        startedAt: typeof obj.startedAt === "string" ? obj.startedAt : undefined,
        expiresAt: typeof obj.expiresAt === "string" ? obj.expiresAt : undefined,
        source: typeof obj.source === "string" ? obj.source : undefined,
      };
    }
    return { plan: "free" };
  };
  return read(input);
}

export function isDeveloperProEmail(email?: string | null): boolean {
  return DEVELOPER_PRO_EMAILS.includes((email || "").trim().toLowerCase());
}

export function createDefaultUserPlan(now = new Date()): UserPlan {
  return {
    plan: "free",
    startedAt: now.toISOString(),
    source: "local-mvp",
  };
}

export function getUserPlanStatus(planObject: UserPlanStatusInput, now = new Date()): UserPlanStatus {
  if (isGaiaAccessOverrideActive(now)) {
    return {
      plan: "free",
      isPro: false,
      isDeveloper: false,
      isTrialActive: true,
      trialDaysLeft: null,
      isLocked: false,
      source: "local-mvp",
    };
  }
  const role = getUserRole({ email: planObject?.email ?? null });
  if (role.isAdmin || role.isDev || isDeveloperProEmail(planObject?.email)) {
    return {
      plan: "pro",
      isPro: true,
      isDeveloper: true,
      isTrialActive: true,
      trialDaysLeft: null,
      isLocked: false,
      source: "developer-override",
    };
  }

  const normalizedPlan = normalizeUserPlan(planObject);
  const plan = normalizedPlan.plan;
  const isPro = plan === "pro";
  const source = (normalizedPlan.source as UserPlan["source"] | undefined) || "local-mvp";

  if (isPro) {
    return {
      plan,
      isPro: true,
      isDeveloper: false,
      isTrialActive: false,
      trialDaysLeft: null,
      isLocked: false,
      source,
    };
  }

  const startedAt = normalizedPlan.startedAt ? new Date(normalizedPlan.startedAt) : now;
  const elapsedMs = Math.max(0, now.getTime() - startedAt.getTime());
  const elapsedDays = Math.floor(elapsedMs / 86_400_000);
  const trialDaysLeft = Math.max(0, FREE_TRIAL_DAYS - elapsedDays);
  const isTrialActive = elapsedDays < FREE_TRIAL_DAYS;

  return {
    plan,
    isPro: false,
    isDeveloper: false,
    isTrialActive,
    trialDaysLeft,
    isLocked: !isTrialActive,
    source,
  };
}

export function getOrCreateLocalUserPlan(): UserPlan {
  if (typeof window === "undefined") {
    return createDefaultUserPlan();
  }

  try {
    const stored = window.localStorage.getItem(USER_PLAN_STORAGE_KEY);
    if (stored) {
      const parsed = safeJsonParse<UserPlan | null>(stored, null);
      if (parsed && (parsed.plan === "free" || parsed.plan === "pro")) {
        return parsed;
      }
    }
  } catch {
    // Recreate malformed local MVP plan data.
  }

  const defaultPlan = createDefaultUserPlan();
  window.localStorage.setItem(USER_PLAN_STORAGE_KEY, JSON.stringify(defaultPlan));
  return defaultPlan;
}
