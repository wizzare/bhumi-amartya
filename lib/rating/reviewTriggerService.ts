import { Capacitor, registerPlugin } from '@capacitor/core';

export interface ReviewPlugin {
  requestReview(): Promise<void>;
}

const Review = registerPlugin<ReviewPlugin>('Review');

export const REVIEW_KEYS = {
  INSTALL_DATE: 'bhumi_review_install_date',
  LOGIN_DAYS: 'bhumi_review_login_days',
  SESSION_COUNT: 'bhumi_review_session_count',
  MIRROR_READ_COUNT: 'bhumi_review_mirror_read_count',
  DAILY_NOTE_READ_COUNT: 'bhumi_review_daily_note_read_count',
  PROMPT_SHOWN: 'bhumi_review_prompt_shown',
  NEXT_PROMPT_DATE: 'bhumi_review_next_prompt_date',
  OPT_OUT: 'bhumi_review_prompt_opt_out',
  ACTION_REQUESTED_AT: 'bhumi_review_action_requested_at',
  SHOWN_SESSION: 'bhumi_review_prompt_shown_session',
};

export const REVIEW_LIMITS = {
  MIN_INSTALL_DAYS: 3,
  MIN_LOGIN_DAYS: 3,
  MIN_SESSIONS: 3,
  PROMPT_COOLDOWN_DAYS: 30,
};

export class ReviewTriggerService {
  getStorageItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  }

  setStorageItem(key: string, value: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  }

  initialize() {
    if (typeof window === 'undefined') return;
    if (!this.getStorageItem(REVIEW_KEYS.INSTALL_DATE)) {
      this.setStorageItem(REVIEW_KEYS.INSTALL_DATE, new Date().toISOString());
    }

    const sessionMarker = new Date().toISOString().slice(0, 10);
    if (this.getStorageItem(REVIEW_KEYS.SHOWN_SESSION) !== sessionMarker) {
      const currentSessions = parseInt(this.getStorageItem(REVIEW_KEYS.SESSION_COUNT) || '0', 10);
      this.setStorageItem(REVIEW_KEYS.SESSION_COUNT, (currentSessions + 1).toString());
      this.setStorageItem(REVIEW_KEYS.SHOWN_SESSION, sessionMarker);
    }

    const today = new Date().toISOString().slice(0, 10);
    const loginDaysRaw = this.getStorageItem(REVIEW_KEYS.LOGIN_DAYS);
    let loginDays: string[] = [];
    try {
      loginDays = loginDaysRaw ? JSON.parse(loginDaysRaw) : [];
    } catch {
      loginDays = [];
    }
    if (!Array.isArray(loginDays)) loginDays = [];
    if (!loginDays.includes(today)) {
      loginDays.push(today);
      this.setStorageItem(REVIEW_KEYS.LOGIN_DAYS, JSON.stringify(loginDays));
    }
  }

  trackWellnessView() {
    const count = parseInt(this.getStorageItem(REVIEW_KEYS.MIRROR_READ_COUNT) || '0', 10);
    this.setStorageItem(REVIEW_KEYS.MIRROR_READ_COUNT, (count + 1).toString());
  }

  trackJourneyView() {
    const count = parseInt(this.getStorageItem(REVIEW_KEYS.DAILY_NOTE_READ_COUNT) || '0', 10);
    this.setStorageItem(REVIEW_KEYS.DAILY_NOTE_READ_COUNT, (count + 1).toString());
  }

  isEligible(): boolean {
    if (typeof window === 'undefined') return false;

    const installDate = this.getStorageItem(REVIEW_KEYS.INSTALL_DATE);
    if (!installDate) return false;

    const daysSinceInstall = Math.ceil((Date.now() - new Date(installDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceInstall < REVIEW_LIMITS.MIN_INSTALL_DAYS) return false;

    const loginDaysRaw = this.getStorageItem(REVIEW_KEYS.LOGIN_DAYS);
    let loginDays: string[] = [];
    try {
      loginDays = loginDaysRaw ? JSON.parse(loginDaysRaw) : [];
    } catch {
      loginDays = [];
    }
    if (!Array.isArray(loginDays)) loginDays = [];
    if (loginDays.length < REVIEW_LIMITS.MIN_LOGIN_DAYS) return false;

    const sessionCount = parseInt(this.getStorageItem(REVIEW_KEYS.SESSION_COUNT) || '0', 10);
    if (sessionCount < REVIEW_LIMITS.MIN_SESSIONS) return false;

    if (this.getStorageItem(REVIEW_KEYS.OPT_OUT) === 'true') return false;

    const promptShown = this.getStorageItem(REVIEW_KEYS.PROMPT_SHOWN);
    const nextPromptDate = this.getStorageItem(REVIEW_KEYS.NEXT_PROMPT_DATE);
    if (promptShown && nextPromptDate && new Date() < new Date(nextPromptDate)) {
      return false;
    }

    return true;
  }

  isEligibleForDashboard(profile: any): boolean {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return false;
    if (!profile || profile.guardianRole === 'founder' || profile.guardianRole === 'admin' || profile.role === 'admin') return false;
    if (profile.isDeveloper || profile.testerBadge === 'Founder') return false;
    const registered = profile.registeredAt || profile.createdAt || profile.trialStartedAt;
    const registeredMs = registered?.toDate ? registered.toDate().getTime() : new Date(registered || 0).getTime();
    if (!registeredMs || (Date.now() - registeredMs) < REVIEW_LIMITS.MIN_INSTALL_DAYS * 86400000) return false;
    const sessions = Number(profile.participationMetrics?.loginCount || this.getStorageItem(REVIEW_KEYS.SESSION_COUNT) || 0);
    if (sessions < REVIEW_LIMITS.MIN_SESSIONS) return false;
    return this.isEligible();
  }

  async requestReview() {
    if (typeof window === 'undefined') return;
    try {
      this.setStorageItem(REVIEW_KEYS.ACTION_REQUESTED_AT, new Date().toISOString());
      await Review.requestReview();
      this.setStorageItem(REVIEW_KEYS.PROMPT_SHOWN, 'true');
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + REVIEW_LIMITS.PROMPT_COOLDOWN_DAYS);
      this.setStorageItem(REVIEW_KEYS.NEXT_PROMPT_DATE, nextDate.toISOString());
    } catch {
      if (typeof window !== 'undefined') window.open('https://play.google.com/store/apps/details?id=com.bhumiamartya.app', '_blank', 'noopener,noreferrer');
      console.warn('Google Play in-app review unavailable; listing fallback opened.');
    }
  }

  markDismissed() {
    if (typeof window === 'undefined') return;
    this.setStorageItem(REVIEW_KEYS.PROMPT_SHOWN, 'true');
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + REVIEW_LIMITS.PROMPT_COOLDOWN_DAYS);
    this.setStorageItem(REVIEW_KEYS.NEXT_PROMPT_DATE, nextDate.toISOString());
  }

  markOptOut() {
    this.setStorageItem(REVIEW_KEYS.OPT_OUT, 'true');
  }
}

export const reviewTriggerService = new ReviewTriggerService();
