import { Capacitor, registerPlugin } from "@capacitor/core";
import {
  isExemptReviewAccount,
  shouldRequestPlayReview,
  REVIEW_MAX_REQUESTS_PER_ACCOUNT_DEVICE,
  REVIEW_MIN_ACCOUNT_AGE_MS,
  REVIEW_RETRY_COOLDOWN_MS,
} from "./reviewEligibility";

export interface ReviewPlugin {
  requestReview(): Promise<{
    flowCompleted?: boolean;
    submittedReviewKnown?: boolean;
    reason?: string;
  } | void>;
}

const Review = registerPlugin<ReviewPlugin>("Review");
const USER_REVIEW_KEY_PREFIX = "bhumi_review_v2_user_";

export type UserReviewState = {
  requestCount: number;
  lastRequestedAtMs: number | null;
  optedOut?: boolean;
  deferredUntilMs?: number | null;
};

export const REVIEW_KEYS = {
  INSTALL_DATE: "bhumi_review_install_date",
  LOGIN_DAYS: "bhumi_review_login_days",
  SESSION_COUNT: "bhumi_review_session_count",
  MIRROR_READ_COUNT: "bhumi_review_mirror_read_count",
  DAILY_NOTE_READ_COUNT: "bhumi_review_daily_note_read_count",
  PROMPT_SHOWN: "bhumi_review_prompt_shown",
  NEXT_PROMPT_DATE: "bhumi_review_next_prompt_date",
  OPT_OUT: "bhumi_review_prompt_opt_out",
  ACTION_REQUESTED_AT: "bhumi_review_action_requested_at",
  SHOWN_SESSION: "bhumi_review_prompt_shown_session",
};

export const REVIEW_LIMITS = {
  MIN_INSTALL_DAYS: REVIEW_MIN_ACCOUNT_AGE_MS / 86_400_000,
  MIN_LOGIN_DAYS: 1,
  MIN_SESSIONS: 1,
  PROMPT_COOLDOWN_DAYS: REVIEW_RETRY_COOLDOWN_MS / 86_400_000,
};

export function parseCanonicalAccountTimestamp(value: unknown): number | null {
  try {
    if (!value) return null;
    if (typeof value === "object" && value !== null) {
      const obj = value as { toDate?: () => Date; seconds?: number; _seconds?: number };
      if (typeof obj.toDate === "function") {
        const ms = obj.toDate().getTime();
        return Number.isFinite(ms) && ms > 0 ? ms : null;
      }
      if (typeof obj.seconds === "number") {
        const ms = obj.seconds * 1000;
        return Number.isFinite(ms) && ms > 0 ? ms : null;
      }
      if (typeof obj._seconds === "number") {
        const ms = obj._seconds * 1000;
        return Number.isFinite(ms) && ms > 0 ? ms : null;
      }
    }
    const ms = typeof value === "number" ? value : Date.parse(String(value));
    return Number.isFinite(ms) && ms > 0 ? ms : null;
  } catch {
    return null;
  }
}

export class ReviewTriggerService {
  private activeSessionUid: string | null = null;
  private requestedInCurrentSession = new Set<string>();

  getStorageItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setStorageItem(key: string, value: string) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // A storage failure should not interrupt login or dashboard use.
    }
  }

  protected isAndroidNativeRuntime(): boolean {
    if (typeof window === "undefined") return false;
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
  }

  protected isOnline(): boolean {
    if (typeof navigator === "undefined" || typeof navigator.onLine !== "boolean") return true;
    return navigator.onLine;
  }

  protected invokeNativeReview(): Promise<unknown> {
    return Review.requestReview();
  }

  userKey(uid: string): string {
    return `${USER_REVIEW_KEY_PREFIX}${encodeURIComponent(uid)}`;
  }

  readUserState(uid: string): UserReviewState {
    try {
      const raw = this.getStorageItem(this.userKey(uid));
      const value = raw ? (JSON.parse(raw) as Partial<UserReviewState>) : null;
      return {
        requestCount:
          typeof value?.requestCount === "number" &&
          Number.isInteger(value.requestCount) &&
          value.requestCount >= 0
            ? value.requestCount
            : 0,
        lastRequestedAtMs:
          typeof value?.lastRequestedAtMs === "number" &&
          Number.isFinite(value.lastRequestedAtMs) &&
          value.lastRequestedAtMs > 0
            ? value.lastRequestedAtMs
            : null,
        optedOut: Boolean(value?.optedOut),
        deferredUntilMs:
          typeof value?.deferredUntilMs === "number" &&
          Number.isFinite(value.deferredUntilMs) &&
          value.deferredUntilMs > 0
            ? value.deferredUntilMs
            : null,
      };
    } catch {
      return { requestCount: 0, lastRequestedAtMs: null, optedOut: false, deferredUntilMs: null };
    }
  }

  writeUserState(uid: string, state: UserReviewState) {
    this.setStorageItem(this.userKey(uid), JSON.stringify(state));
  }

  /**
   * Resets transient in-memory session state when switching Firebase accounts
   * while preserving per-UID persisted request history in localStorage.
   */
  syncActiveUser(uid: string | null | undefined) {
    const normalized = typeof uid === "string" && uid.trim() ? uid.trim() : null;
    if (this.activeSessionUid !== normalized) {
      this.activeSessionUid = normalized;
      this.requestedInCurrentSession.clear();
    }
  }

  hasRequestedInCurrentSession(uid: string): boolean {
    return this.requestedInCurrentSession.has(uid);
  }

  // Preserve existing engagement counters for compatibility. The prompt policy
  // relies on canonical account age (72h) and per-UID cooldown rather than local install date.
  initialize() {
    if (typeof window === "undefined") return;
    if (!this.getStorageItem(REVIEW_KEYS.INSTALL_DATE)) {
      this.setStorageItem(REVIEW_KEYS.INSTALL_DATE, new Date().toISOString());
    }
    const today = new Date().toISOString().slice(0, 10);
    if (this.getStorageItem(REVIEW_KEYS.SHOWN_SESSION) !== today) {
      const sessions = Number(this.getStorageItem(REVIEW_KEYS.SESSION_COUNT) || "0") || 0;
      this.setStorageItem(REVIEW_KEYS.SESSION_COUNT, String(sessions + 1));
      this.setStorageItem(REVIEW_KEYS.SHOWN_SESSION, today);
    }
  }

  trackWellnessView() {
    const count = Number(this.getStorageItem(REVIEW_KEYS.MIRROR_READ_COUNT) || "0") || 0;
    this.setStorageItem(REVIEW_KEYS.MIRROR_READ_COUNT, String(count + 1));
  }

  trackJourneyView() {
    const count = Number(this.getStorageItem(REVIEW_KEYS.DAILY_NOTE_READ_COUNT) || "0") || 0;
    this.setStorageItem(REVIEW_KEYS.DAILY_NOTE_READ_COUNT, String(count + 1));
  }

  /**
   * Existing users: eligible at their next settled Dashboard login.
   * New users: eligible from 72 hours after canonical Firebase Auth account creation.
   * Both: Play controls actual dialog visibility and review submission.
   */
  isEligibleForDashboard(
    profile: any,
    firebaseCreatedAt?: string | number | null,
    nowMs: number = Date.now(),
  ): boolean {
    if (!this.isAndroidNativeRuntime()) return false;
    if (!this.isOnline()) return false;
    if (!profile || typeof profile.uid !== "string" || !profile.uid.trim()) return false;

    const uid = profile.uid.trim();
    this.syncActiveUser(uid);

    if (this.requestedInCurrentSession.has(uid)) return false;
    if (profile.setupCompleted === false || profile.onboardingCompleted === false) return false;
    if (isExemptReviewAccount(profile)) return false;
    if (this.getStorageItem(REVIEW_KEYS.OPT_OUT) === "true") return false;

    const legacyNext = parseCanonicalAccountTimestamp(this.getStorageItem(REVIEW_KEYS.NEXT_PROMPT_DATE));
    if (legacyNext && nowMs < legacyNext) return false;

    // Canonical account creation timestamp priority:
    // 1. Firebase Auth metadata.creationTime
    // 2. Canonical profile registration/creation timestamps
    // Local installation date is intentionally NEVER used as account-age authority.
    const createdAtMs =
      parseCanonicalAccountTimestamp(firebaseCreatedAt) ??
      parseCanonicalAccountTimestamp(profile.firebaseCreatedAt) ??
      parseCanonicalAccountTimestamp(profile.registeredAt) ??
      parseCanonicalAccountTimestamp(profile.createdAt);

    const state = this.readUserState(uid);
    return shouldRequestPlayReview({
      accountCreatedAtMs: createdAtMs,
      nowMs,
      requestCount: state.requestCount,
      lastRequestedAtMs: state.lastRequestedAtMs,
      optedOut: state.optedOut,
      deferredUntilMs: state.deferredUntilMs,
    });
  }

  // Kept for compatibility with earlier feature consumers.
  isEligible(): boolean {
    if (this.getStorageItem(REVIEW_KEYS.OPT_OUT) === "true") return false;
    const next = parseCanonicalAccountTimestamp(this.getStorageItem(REVIEW_KEYS.NEXT_PROMPT_DATE));
    return !next || Date.now() >= next;
  }

  /**
   * Invoke Play's native review sheet. An API success does NOT mean the user
   * submitted a rating, and Play can suppress the sheet due to its own quota.
   * No automatic store redirect and no custom star pre-screen.
   */
  async requestReview(uid?: string, nowMs: number = Date.now()): Promise<boolean> {
    const normalizedUid = typeof uid === "string" && uid.trim() ? uid.trim() : null;
    if (!normalizedUid || !this.isAndroidNativeRuntime() || !this.isOnline()) return false;

    this.syncActiveUser(normalizedUid);
    if (this.requestedInCurrentSession.has(normalizedUid)) return false;

    const state = this.readUserState(normalizedUid);
    if (state.optedOut || this.getStorageItem(REVIEW_KEYS.OPT_OUT) === "true") return false;
    if (state.requestCount >= REVIEW_MAX_REQUESTS_PER_ACCOUNT_DEVICE) return false;
    if (
      state.lastRequestedAtMs !== null &&
      nowMs - state.lastRequestedAtMs < REVIEW_RETRY_COOLDOWN_MS
    ) {
      return false;
    }
    if (state.deferredUntilMs !== null && state.deferredUntilMs !== undefined && nowMs < state.deferredUntilMs) {
      return false;
    }

    this.requestedInCurrentSession.add(normalizedUid);
    this.writeUserState(normalizedUid, {
      ...state,
      requestCount: state.requestCount + 1,
      lastRequestedAtMs: nowMs,
    });
    this.setStorageItem(REVIEW_KEYS.ACTION_REQUESTED_AT, new Date(nowMs).toISOString());

    try {
      await this.invokeNativeReview();
      return true; // Review flow API call completed; NOT proof of a submitted review.
    } catch {
      return false;
    }
  }

  // Legacy custom ReviewDialog actions remain safe if consumed elsewhere.
  markDismissed(uid?: string, nowMs: number = Date.now()) {
    const deferredUntilMs = nowMs + REVIEW_RETRY_COOLDOWN_MS;
    this.setStorageItem(REVIEW_KEYS.PROMPT_SHOWN, "true");
    this.setStorageItem(REVIEW_KEYS.NEXT_PROMPT_DATE, new Date(deferredUntilMs).toISOString());
    if (uid && uid.trim()) {
      const state = this.readUserState(uid.trim());
      this.writeUserState(uid.trim(), {
        ...state,
        deferredUntilMs,
      });
    }
  }

  markOptOut(uid?: string) {
    this.setStorageItem(REVIEW_KEYS.OPT_OUT, "true");
    if (uid && uid.trim()) {
      const state = this.readUserState(uid.trim());
      this.writeUserState(uid.trim(), {
        ...state,
        optedOut: true,
      });
    }
  }
}

export const reviewTriggerService = new ReviewTriggerService();
