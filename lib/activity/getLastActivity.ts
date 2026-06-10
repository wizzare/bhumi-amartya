import { readOwnedCacheObject, writeOwnedCacheObject } from "@/lib/storage/derivedCacheOwnership";

export const LAST_ACTIVITY_STORAGE_KEY = "bhumiLastActivity";

export type ActivityType = "journal" | "meditation" | "audioHealing";

export type LastActivityState = {
  uid?: string;
  lastActivityDate: string | null;
  lastActivityType: ActivityType | null;
};

const DEFAULT_LAST_ACTIVITY_STATE: LastActivityState = {
  lastActivityDate: null,
  lastActivityType: null,
};

export function getLastActivity(): LastActivityState {
  if (typeof window === "undefined") return DEFAULT_LAST_ACTIVITY_STATE;

  const parsed = readOwnedCacheObject<LastActivityState>(LAST_ACTIVITY_STORAGE_KEY, "lastActivity");

  if (
    parsed
    && (parsed.lastActivityDate === null || typeof parsed.lastActivityDate === "string")
    && (parsed.lastActivityType === null || ["journal", "meditation", "audioHealing"].includes(parsed.lastActivityType))
  ) {
    return parsed;
  }

  return DEFAULT_LAST_ACTIVITY_STATE;
}

export function saveLastActivity(activityType: ActivityType, date = new Date()): LastActivityState {
  if (typeof window === "undefined") return DEFAULT_LAST_ACTIVITY_STATE;

  const nextState: LastActivityState = {
    lastActivityDate: date.toISOString(),
    lastActivityType: activityType,
  };

  return writeOwnedCacheObject(LAST_ACTIVITY_STORAGE_KEY, nextState, "lastActivity");
}
