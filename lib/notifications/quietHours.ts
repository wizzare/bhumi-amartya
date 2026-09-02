/**
 * Quiet Hours + Timezone — canonicalToday contract
 * Default quiet: 22:00 - 07:00 local time (user timezone)
 */
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";

export const QUIET_START_HOUR = 22;
export const QUIET_END_HOUR = 7;

export function resolveUserTimezone(profile?: Record<string, unknown> | null): string {
  return (profile as any)?.timezone
    || (profile as any)?.profile?.timezone
    || (typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "Asia/Jakarta")
    || "Asia/Jakarta";
}

export function getLocalHour(date: Date, timezone: string): number {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "2-digit", hour12: false });
    return Number(fmt.format(date));
  } catch { return date.getHours(); }
}

export function isWithinQuietHours(now: Date, timezone: string, start = QUIET_START_HOUR, end = QUIET_END_HOUR): boolean {
  const hour = getLocalHour(now, timezone);
  if (start > end) return hour >= start || hour < end;
  return hour >= start && hour < end;
}

export function getNextAllowedTime(now: Date, timezone: string): Date {
  if (!isWithinQuietHours(now, timezone)) return now;
  const next = new Date(now);
  // advance hour by hour until outside quiet
  for (let i = 0; i < 24; i++) {
    next.setHours(next.getHours() + 1);
    next.setMinutes(0, 0, 0);
    if (!isWithinQuietHours(next, timezone)) return next;
  }
  return next;
}

export function getLocalDateKeyForTZ(date: Date, timezone: string): string {
  return getLocalDateKey(date, timezone);
}
