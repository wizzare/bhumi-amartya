import { Capacitor, registerPlugin } from "@capacitor/core";
import {
  shouldRequestPlayReview,
  REVIEW_MIN_ACCOUNT_AGE_MS,
  REVIEW_RETRY_COOLDOWN_MS,
} from "./reviewEligibility";

export interface ReviewPlugin {
  requestReview(): Promise<void>;
}

const Review = registerPlugin<ReviewPlugin>("Review");
const USER_REVIEW_KEY_PREFIX = "bhumi_review_v2_user_";

type UserReviewState = {
  requestCount: number;
  lastRequestedAtMs: number | null;
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

function asTimestamp(value: unknown): number | null {
  try {
    if (!value) return null;
    if (typeof value === "object" && value !== null) {
      const obj = value as { toDate?: () => Date; seconds?: number };
      if (typeof obj.toDate === "function") {
        const ms = obj.toDate().getTime();
        return Number.isFinite(ms) && ms > 0 ? ms : null;
      }
      if (typeof obj.seconds === "number") {
        const ms = obj.seconds * 1000;
        return Number.isFinite(ms) && ms > 0 ? ms : null;
      }
    }
    const ms = new Date(value as string | number).getTime();
    return Number.isFinite(ms) && ms > 0 ? ms : null;
  } catch {
    return null;
  }
}

export class ReviewTriggerService {
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

  private userKey(uid: string): string {
    return `${USER_REVIEW_KEY_PREFIX}${encodeURIComponent(uid)}`;
  }

  private readUserState(uid: string): UserReviewState {
    try {
      const raw = this.getStorageItem(this.userKey(uid));
      const value = raw ? JSON.parse(raw) as Partial<UserReviewState> : null;
      return {
        requestCount: Number.isInteger(value?.requestCount) && (value?.requestCount ?? 0) >= 0
          ? value!.requestCount!
          : 0,
        lastRequestedAtMs: typeof value?.lastRequestedAtMs === "number" && Number.isFinite(value.lastRequestedAtMs)
          ? value.lastRequestedAtMs
          : null,
      };
    } catch {
      return { requestCount: 0, lastRequestedAtMs: null };
    }
  }

  private writeUserState(uid: string, state: UserReviewState) {
    this.setStorageItem(this.userKey(uid), JSON.stringify(state));
  }

  // Preserve existing engagement counters for compatibility. The new prompt
  // policy deliberately does not require 3 device sessions or 3 login days.
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
   * New users: eligible from 72 hours after account creation.
   * Both: Play controls actual dialog visibility and review submission.
   */
  isEligibleForDashboard(profile: any, firebaseCreatedAt?: string | null): boolean {
    if (typeof window === "undefined" || !Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return false;
    if (!profile || typeof profile.uid !== "string" || !profile.uid.trim()) return false;
    if (["founder", "admin", "dev_admin"].includes(String(profile.guardianRole || "").toLowerCase())) return false;
    if (["founder", "admin", "dev_admin"].includes(String(profile.role || "").toLowerCase())) return false;
    if (profile.isDeveloper || profile.testerBadge === "Founder") return false;
    if (this.getStorageItem(REVIEW_KEYS.OPT_OUT) === "true") return false;

    // Respect any previous v1 postponement; never interrupt a recent request.
    const legacyNext = asTimestamp(this.getStorageItem(REVIEW_KEYS.NEXT_PROMPT_DATE));
    if (legacyNext && Date.now() < legacyNext) return false;

    const createdAtMs =
      asTimestamp(firebaseCreatedAt) ??
      asTimestamp(profile.registeredAt) ??
      asTimestamp(profile.createdAt);
    const state = this.readUserState(profile.uid);
    return shouldRequestPlayReview({
      accountCreatedAtMs: createdAtMs,
      nowMs: Date.now(),
      requestCount: state.requestCount,
      lastRequestedAtMs: state.lastRequestedAtMs,
    });
  }

  // Kept for compatibility with earlier feature consumers.
  isEligible(): boolean {
    if (this.getStorageItem(REVIEW_KEYS.OPT_OUT) === "true") return false;
    const next = asTimestamp(this.getStorageItem(REVIEW_KEYS.NEXT_PROMPT_DATE));
    return !next || Date.now() >= next;
  }

  /**
   * Invoke Play's native review sheet. An API success does NOT mean the user
   * submitted a rating, and Play can suppress the sheet due to its own quota.
   * No automatic store redirect and no custom star pre-screen.
   */
  async requestReview(uid?: string): Promise<boolean> {
    if (!uid || !Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return false;
    const state = this.readUserState(uid);
    const now = Date.now();
    this.writeUserState(uid, {
      requestCount: state.requestCount + 1,
      lastRequestedAtMs: now,
    });
    this.setStorageItem(REVIEW_KEYS.ACTION_REQUESTED_AT, new Date(now).toISOString());
    try {
      await Review.requestReview();
      return true; // Review flow call completed; NOT proof of a submitted review.
    } catch {
      return false;
    }
  }

  // Legacy custom ReviewDialog actions remain safe if consumed elsewhere.
  markDismissed() {
    this.setStorageItem(REVIEW_KEYS.PROMPT_SHOWN, "true");
    this.setStorageItem(
      REVIEW_KEYS.NEXT_PROMPT_DATE,
      new Date(Date.now() + REVIEW_RETRY_COOLDOWN_MS).toISOString(),
    );
  }

  markOptOut() {
    this.setStorageItem(REVIEW_KEYS.OPT_OUT, "true");
  }
}

export const reviewTriggerService = new ReviewTriggerService();
