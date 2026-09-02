import fs from "node:fs";
import {
  DEFAULT_NOTIFICATION_CATEGORIES,
  evaluateNotificationPolicy,
  notificationCopy,
} from "../../lib/notifications/notificationPolicy.ts";
import {
  availablePaths,
  buildTinyStep,
  canContinueYesterday,
  dailyRhythmFallback,
  getNeedOptions,
  periodicReflectionDue,
  primaryPathForNeed,
  resolveOrientation,
  shouldOfferEveningReflection,
} from "../../lib/dailyRhythm/runtime.ts";
import {
  canExtractJournalMemory,
  canSyncJournalEntry,
  isVisibleInJournalHistory,
  normalizeJournalEntryPrivacy,
  requiresJournalUnlock,
} from "../../lib/journal/privacy.ts";
import { extractMemorySignals } from "../../lib/journal/journalMemoryExtraction.ts";
import {
  aggregateForJourney,
  isCandidateWithinRetention,
  MEMORY_DECAY_DAYS,
} from "../../lib/memory/memoryPatternAggregator.ts";
import type { MemoryCandidate } from "../../lib/memory/memoryCandidate.ts";

let passed = 0;
function check(name: string, condition: unknown): void {
  if (!condition) throw new Error(`FAIL ${name}`);
  passed += 1;
  console.log(`PASS ${name}`);
}

const enabled = { daily: true, return: true, weekly: true, milestone: true } as const;
const daytime = new Date("2026-09-02T10:00:00+07:00");
const basePolicy = { locale: "id-ID", now: daytime, timezone: "Asia/Jakarta", categories: enabled } as const;

check("notifications default to explicit opt-in", Object.values(DEFAULT_NOTIFICATION_CATEGORIES).every((value) => value === false));
check("notification copy exists in id", notificationCopy("daily", "id-ID").body.length > 0);
check("notification copy exists in en", notificationCopy("return", "en-US").title === "Thinking of you");
check("notification copy exists in ms", notificationCopy("weekly", "ms-MY").body.length > 0);
check("opt-out suppresses", evaluateNotificationPolicy({ ...basePolicy, category: "daily", categories: DEFAULT_NOTIFICATION_CATEGORIES }).status === "suppressed_opt_out");
check("quiet hours suppress", evaluateNotificationPolicy({ ...basePolicy, category: "daily", now: new Date("2026-09-02T23:00:00+07:00") }).status === "suppressed_quiet_hours");
check("comfort suppresses non-return", evaluateNotificationPolicy({ ...basePolicy, category: "daily", comfortModeActive: true }).status === "suppressed_comfort");
check("comfort permits opted-in return", evaluateNotificationPolicy({ ...basePolicy, category: "return", comfortModeActive: true, absenceDays: 3 }).status === "eligible");
check("low energy suppresses non-return", evaluateNotificationPolicy({ ...basePolicy, category: "weekly", tiredCheckIns: 3 }).status === "suppressed_low_energy");
check("three dismissals reduce daily", evaluateNotificationPolicy({ ...basePolicy, category: "daily", consecutiveDismissals: 3 }).status === "suppressed_dismissals");
check("return waits three days", evaluateNotificationPolicy({ ...basePolicy, category: "return", absenceDays: 2 }).status === "suppressed_not_due");
check("frequency dedup suppresses", evaluateNotificationPolicy({ ...basePolicy, category: "milestone", alreadyDelivered: true }).status === "suppressed_frequency");

const now = new Date("2026-09-02T12:00:00Z");
check("orientation new", resolveOrientation({ now }) === "new");
check("orientation same day", resolveOrientation({ now, lastOpenedAt: "2026-09-02T01:00:00Z" }) === "same-day");
check("orientation next day", resolveOrientation({ now, lastOpenedAt: "2026-09-01T01:00:00Z" }) === "next-day");
check("orientation three-day absence", resolveOrientation({ now, lastOpenedAt: "2026-08-29T01:00:00Z" }) === "absence-3");
check("orientation seven-day absence", resolveOrientation({ now, lastOpenedAt: "2026-08-20T01:00:00Z" }) === "absence-7");
check("orientation thirty-day absence", resolveOrientation({ now, lastOpenedAt: "2026-07-01T01:00:00Z" }) === "absence-30");
check("new users see full optional needs", getNeedOptions(false).length === 7);
check("familiar users see adaptive three", getNeedOptions(true, ["overwhelmed", "unknown"]).join(",") === "overwhelmed,unknown,tired");
check("unknown enters comfort", primaryPathForNeed("unknown") === "comfort");
check("tired enters comfort", primaryPathForNeed("tired") === "comfort");
check("reflective enters journal", primaryPathForNeed("reflective") === "journal");
check("do nothing remains a path", availablePaths().includes("do-nothing"));
check("comfort remains a path", availablePaths().includes("comfort"));
check("tiny step is invitational id", buildTinyStep("id").includes("Kalau kamu mau"));
check("tiny step is invitational en", buildTinyStep("en").includes("If you want"));
check("tiny step is invitational ms", buildTinyStep("ms").includes("Jika anda mahu"));
check("AI fallback is gentle", dailyRhythmFallback("ai", "en").includes("quiet moment"));
check("network fallback preserves note", dailyRhythmFallback("network", "id").includes("Catatan terakhir"));
check("empty fallback does not invent context", dailyRhythmFallback("empty", "ms").includes("tanpa sebarang jawapan"));
check("evening reflection requires journal", !shouldOfferEveningReflection({ localHour: 20, journaledToday: false }));
check("evening reflection is contextual", shouldOfferEveningReflection({ localHour: 20, journaledToday: true }));
check("evening reflection respects quiet boundary", !shouldOfferEveningReflection({ localHour: 22, journaledToday: true }));
check("continue yesterday accepts yesterday", canContinueYesterday("2026-09-01T15:00:00Z", now));
check("continue yesterday rejects older draft", !canContinueYesterday("2026-08-30T15:00:00Z", now));
check("weekly reflection is opt-in Sunday", periodicReflectionDue({ kind: "weekly", optedIn: true, activityCount: 1, localDate: new Date("2026-09-06T12:00:00Z") }));
check("weekly reflection rejects opt-out", !periodicReflectionDue({ kind: "weekly", optedIn: false, activityCount: 4, localDate: new Date("2026-09-06T12:00:00Z") }));
check("monthly reflection is first-day only", periodicReflectionDue({ kind: "monthly", optedIn: true, activityCount: 1, localDate: new Date("2026-10-01T12:00:00Z") }));
check("periodic reflection requires activity", !periodicReflectionDue({ kind: "monthly", optedIn: true, activityCount: 0, localDate: new Date("2026-10-01T12:00:00Z") }));

const privateLocal = normalizeJournalEntryPrivacy({ locked: true, hiddenFromHistory: true, localOnly: true });
check("privacy defaults are non-escalating", Object.values(normalizeJournalEntryPrivacy()).every((value) => value === false));
check("local-only does not cloud sync", !canSyncJournalEntry(privateLocal));
check("local-only does not enter Memory", !canExtractJournalMemory(privateLocal));
check("excluded entries do not enter Memory", !canExtractJournalMemory({ excludeFromMemory: true }));
check("hidden entries leave default history", !isVisibleInJournalHistory(privateLocal));
check("locked entries require unlock", requiresJournalUnlock(privateLocal));
check("privacy blocks extraction before content analysis", extractMemorySignals({ id: "private", date: "2026-09-02", theme: "private", questions: [], journalText: "sensitive", emotionalState: "", bodySignals: [], createdAt: now.toISOString(), insight: "", tomorrowFocus: "", privacy: privateLocal }, "synthetic-user") === null);

const candidate = (overrides: Partial<MemoryCandidate>): MemoryCandidate => ({
  id: "theme", uid: "synthetic-user", category: "recurring_theme", label: "Theme", theme: "theme",
  originatingModes: ["FREE"], evidence: [1, 2, 3].map((n) => ({ entryId: String(n), date: "2026-08-01", mode: "FREE", provenance: "user-written" })),
  confidence: 0.8, provenance: "user-written", state: "CONFIRMED", extractionTimestamp: "2026-08-01T00:00:00Z", lastSeenAt: "2026-08-15T00:00:00Z",
  ...overrides,
});
check("memory decay window is 90 days", MEMORY_DECAY_DAYS === 90);
check("recent memory remains active", isCandidateWithinRetention(candidate({}), now));
const stale = candidate({ id: "stale", lastSeenAt: "2026-01-01T00:00:00Z" });
check("stale unpinned memory decays", !isCandidateWithinRetention(stale, now));
const pinned = candidate({ id: "pinned", lastSeenAt: "2026-01-01T00:00:00Z", pinned: true });
check("pinned memory bypasses decay", isCandidateWithinRetention(pinned, now));
check("aggregator excludes stale and keeps pinned", aggregateForJourney([stale, pinned], now).map((item) => item.candidateId).join(",") === "pinned");

const authActions = fs.readFileSync("lib/auth/authActions.ts", "utf8");
const authContext = fs.readFileSync("context/AuthContext.tsx", "utf8");
const login = fs.readFileSync("app/login/page.tsx", "utf8");
check("auth action logs omit profile email", !authActions.includes("email: user.email ?? null"));
check("auth action logs omit raw native result", !authActions.includes("Missing tokens\", result"));
check("AuthContext logs omit identity fields", !authContext.includes("email: firebaseUser?.email ?? null") && !authContext.includes("documentPath: `users/${uid}`"));
check("login omits raw auth error", !login.includes("CRITICAL AUTH ERROR - RAW") && !login.includes("LOGIN SUCCESS] UID"));

const registration = fs.readFileSync("lib/notifications/fcmRegistration.ts", "utf8");
const tokenRepository = fs.readFileSync("lib/repositories/fcmTokenRepository.ts", "utf8");
const reminder = fs.readFileSync("lib/notifications/gentleNightReminder.ts", "utf8");
const settings = fs.readFileSync("app/settings/page.tsx", "utf8");
check("FCM registration has no fake local token", !registration.includes("generateLocalFallbackToken") && !registration.includes("local_${Date.now()}"));
check("FCM registration requires VAPID", registration.includes("NEXT_PUBLIC_FCM_VAPID_KEY") && registration.includes("web-fcm-token-unavailable"));
check("FCM token persistence fails closed", tokenRepository.includes("assertOwner(uid)") && !tokenRepository.includes("catch {}"));
check("FCM tokens are not cached in localStorage", !/\blocalStorage\s*\.\s*(?:getItem|setItem|removeItem)/.test(tokenRepository));
check("reminders default off until opt-in", reminder.includes('return value === "true"'));
check("reminder copy contains no absence guilt", !reminder.includes("Sudah 3 hari") && !reminder.includes("Bhumi kangen"));
check("web opt-out deletes persisted tokens or stays visibly enabled", settings.includes("deleteAllForUser(uid)") && settings.includes("disable-error"));

console.log(`BUILD106_STEP8_CONTRACTS_PASS assertions=${passed}`);
