import { safeJsonParse } from "@/lib/storage/safeJson";

export const USER_PLAN_STORAGE_KEY = "bhumiUserPlan";

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
