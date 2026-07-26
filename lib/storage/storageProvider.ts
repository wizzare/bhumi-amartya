import { safeJsonParse } from '@/lib/storage/safeJson';
import { 
  UserProfile, 
  UserBlueprint, 
  JournalEntry, 
  MeditationEntry, 
  AudioHealingEntry, 
  HealingMemory, 
  JourneyData, 
  WeeklySoulReport, 
  NotificationPreferences,
  firebaseService
} from '@/lib/firebase/service';
import { app, auth, db } from '@/lib/firebase/firebase';
import { getActiveUserId } from '@/lib/auth/getActiveUserId';
import { readOwnedCacheObject, writeOwnedCacheObject } from '@/lib/storage/derivedCacheOwnership';
import { repairHumanDesignIfPossible } from '@/lib/humandesign/repairHumanDesign';
import { settleWithTimeout } from '@/lib/storage/settleWithTimeout';

// Storage Provider Interface
export interface StorageProvider {
  // User Profile
  getUserProfile(): Promise<UserProfile | null>;
  saveUserProfile(profile: UserProfile): Promise<boolean>;
  
  // User Blueprint
  getUserBlueprint(): Promise<UserBlueprint | null>;
  saveUserBlueprint(blueprint: UserBlueprint): Promise<boolean>;
  deleteUserBlueprint(): Promise<boolean>;

  // Journal Entries
  getJournalEntries(): Promise<JournalEntry[]>;
  saveJournalEntry(entry: JournalEntry): Promise<boolean>;
  
  // Meditation Entries
  getMeditationEntries(): Promise<MeditationEntry[]>;
  saveMeditationEntry(entry: MeditationEntry): Promise<boolean>;
  
  // Audio Healing Entries
  getAudioHealingEntries(): Promise<AudioHealingEntry[]>;
  saveAudioHealingEntry(entry: AudioHealingEntry): Promise<boolean>;
  
  // Healing Memory
  getHealingMemory(): Promise<HealingMemory | null>;
  saveHealingMemory(memory: HealingMemory): Promise<boolean>;
  
  // Journey Data
  getJourneyData(): Promise<JourneyData | null>;
  saveJourneyData(journey: JourneyData): Promise<boolean>;
  
  // Weekly Reports
  getWeeklyReport(): Promise<WeeklySoulReport | null>;
  saveWeeklyReport(report: WeeklySoulReport): Promise<boolean>;
  
  // Notification Preferences
  getNotificationPreferences(): Promise<NotificationPreferences | null>;
  saveNotificationPreferences(prefs: NotificationPreferences): Promise<boolean>;
  
  // User Plan
  getUserPlan(): Promise<any | null>;
  saveUserPlan(plan: any): Promise<boolean>;

  // Data Cleanup
  deleteUserDataCompletely(): Promise<boolean>;
}

// Local Storage Implementation
class LocalStorageProvider implements StorageProvider {
  constructor() {
    this.cleanupLegacyKeys();
  }

  private cleanupLegacyKeys() {
    if (typeof window === 'undefined') return;
    const forbidden = [
      'bhumiUserProfile', 'bhumiUserBlueprint',
      'bhumiProfile', 'bhumiBlueprint',
      'widhi-debug-123', 'firstUserProfile'
    ];
    forbidden.forEach(key => {
      if (localStorage.getItem(key)) {
        console.warn("[USER ISOLATION] Deleting legacy key:", key);
        localStorage.removeItem(key);
      }
    });
  }

  private getUserId(): string | null {
    if (typeof window === 'undefined') return null;

    // First priority: Firebase Auth
    const authUid = auth.currentUser?.uid;
    if (authUid) return authUid;

    // Fallback: ONLY if we are in local mode and have exactly one scoped profile
    // This is safer than picking the first one if multiple exist.
    // For now, let's stick to auth.currentUser if we want to avoid leaks.
    return null;
  }

  private cacheMatchesActiveUser(cachedUid?: string | null): boolean {
    const activeUid = this.getUserId();
    if (!activeUid) return false;
    if (!cachedUid) return false;
    return cachedUid === activeUid;
  }

  async getUserProfile(): Promise<UserProfile | null> {
    if (typeof window === 'undefined') return null;
    const uid = this.getUserId();
    if (!uid) return null;

    // Forbidden: unscoped key
    if (localStorage.getItem('bhumiUserProfile')) {
      console.warn("[USER ISOLATION] Deleting forbidden unscoped key: bhumiUserProfile");
      localStorage.removeItem('bhumiUserProfile');
    }

    const scopedKey = `bhumiProfile:${uid}`;
    const stored = localStorage.getItem(scopedKey);
    const parsed = stored ? safeJsonParse<UserProfile | null>(stored, null) : null;

    if (parsed && parsed.uid !== uid) {
      console.warn("[USER DATA MISMATCH BLOCKED]", { reason: "profile_uid_mismatch", activeUid: uid, profileUid: parsed.uid });
      localStorage.removeItem(scopedKey);
      return null;
    }

    console.log("[USER DATA LOAD]", {
      authUid: auth.currentUser?.uid ?? null,
      profileUid: parsed?.uid ?? null,
      source: "local-scoped",
      profileExists: !!parsed,
    });
    return parsed;
  }

  async saveUserProfile(profile: UserProfile): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (!profile.uid) return false;
    try {
      localStorage.setItem(`bhumiProfile:${profile.uid}`, JSON.stringify(profile));
      localStorage.removeItem('bhumiUserProfile');
      console.log("[PROFILE SAVE]", {
        uid: profile.uid,
        email: profile.email ?? null,
        source: "local-scoped",
      });
      return true;
    } catch {
      return false;
    }
  }

  async getUserBlueprint(): Promise<UserBlueprint | null> {
    if (typeof window === 'undefined') return null;
    const uid = this.getUserId();
    if (!uid) return null;

    // Forbidden: unscoped key
    if (localStorage.getItem('bhumiUserBlueprint')) {
      console.warn("[USER ISOLATION] Deleting forbidden unscoped key: bhumiUserBlueprint");
      localStorage.removeItem('bhumiUserBlueprint');
    }

    const scopedKey = `bhumiBlueprint:${uid}`;
    const stored = localStorage.getItem(scopedKey);
    const parsed = stored ? safeJsonParse<UserBlueprint | null>(stored, null) : null;

    if (parsed && parsed.uid !== uid) {
      console.warn("[USER DATA MISMATCH BLOCKED]", { reason: "blueprint_uid_mismatch", activeUid: uid, blueprintUid: parsed.uid });
      localStorage.removeItem(scopedKey);
      return null;
    }

    console.log("[USER DATA LOAD]", {
      authUid: auth.currentUser?.uid ?? null,
      blueprintUid: parsed?.uid ?? null,
      source: "local-scoped",
      blueprintExists: !!parsed,
    });
    return parsed;
  }

  async saveUserBlueprint(blueprint: UserBlueprint): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (!blueprint.uid) return false;
    try {
      localStorage.setItem(`bhumiBlueprint:${blueprint.uid}`, JSON.stringify(blueprint));
      localStorage.removeItem('bhumiUserBlueprint');
      console.log("[BLUEPRINT SAVE]", {
        uid: blueprint.uid,
        source: "local-scoped",
      });
      return true;
    } catch {
      return false;
    }
  }

  async deleteUserBlueprint(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const uid = this.getUserId();
    if (!uid) return false;
    localStorage.removeItem(`bhumiBlueprint:${uid}`);
    return true;
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    if (typeof window === 'undefined') return [];
    const uid = this.getUserId();
    if (!uid) return [];

    if (localStorage.getItem('bhumiJournalEntries')) {
      console.warn("[USER ISOLATION] Deleting forbidden unscoped key: bhumiJournalEntries");
      localStorage.removeItem('bhumiJournalEntries');
    }

    const scopedKey = `bhumiJournalEntries:${uid}`;
    const stored = localStorage.getItem(scopedKey);
    const entries = stored ? safeJsonParse<JournalEntry[]>(stored, []) : [];
    return entries.filter((entry) => entry.uid === uid);
  }

  async saveJournalEntry(entry: JournalEntry): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const uid = entry.uid || this.getUserId();
    if (!uid) return false;
    try {
      const entries = await this.getJournalEntries();
      const nextEntries = [{ ...entry, uid }, ...entries.filter(e => e.id !== entry.id)];
      localStorage.setItem(`bhumiJournalEntries:${uid}`, JSON.stringify(nextEntries));
      return true;
    } catch {
      return false;
    }
  }

  async getMeditationEntries(): Promise<MeditationEntry[]> {
    if (typeof window === 'undefined') return [];
    const uid = this.getUserId();
    if (!uid) return [];

    if (localStorage.getItem('bhumiMeditationEntries')) {
      console.warn("[USER ISOLATION] Deleting forbidden unscoped key: bhumiMeditationEntries");
      localStorage.removeItem('bhumiMeditationEntries');
    }

    const scopedKey = `bhumiMeditationEntries:${uid}`;
    const stored = localStorage.getItem(scopedKey);
    const entries = stored ? safeJsonParse<MeditationEntry[]>(stored, []) : [];
    return entries.filter((entry) => entry.uid === uid);
  }

  async saveMeditationEntry(entry: MeditationEntry): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const uid = entry.uid || this.getUserId();
    if (!uid) return false;
    try {
      const entries = await this.getMeditationEntries();
      const nextEntries = [{ ...entry, uid }, ...entries.filter(e => e.id !== entry.id)];
      localStorage.setItem(`bhumiMeditationEntries:${uid}`, JSON.stringify(nextEntries));
      return true;
    } catch {
      return false;
    }
  }

  async getAudioHealingEntries(): Promise<AudioHealingEntry[]> {
    if (typeof window === 'undefined') return [];
    const uid = this.getUserId();
    if (!uid) return [];

    if (localStorage.getItem('bhumiAudioHealingEntries')) {
      console.warn("[USER ISOLATION] Deleting forbidden unscoped key: bhumiAudioHealingEntries");
      localStorage.removeItem('bhumiAudioHealingEntries');
    }

    const scopedKey = `bhumiAudioHealingEntries:${uid}`;
    const stored = localStorage.getItem(scopedKey);
    const entries = stored ? safeJsonParse<AudioHealingEntry[]>(stored, []) : [];
    return entries.filter((entry) => entry.uid === uid);
  }

  async saveAudioHealingEntry(entry: AudioHealingEntry): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const uid = entry.uid || this.getUserId();
    if (!uid) return false;
    try {
      const entries = await this.getAudioHealingEntries();
      const nextEntries = [{ ...entry, uid }, ...entries.filter(e => e.id !== entry.id)];
      localStorage.setItem(`bhumiAudioHealingEntries:${uid}`, JSON.stringify(nextEntries));
      return true;
    } catch {
      return false;
    }
  }

  async getHealingMemory(): Promise<HealingMemory | null> {
    if (typeof window === 'undefined') return null;
    const uid = this.getUserId();
    if (!uid) return null;

    if (localStorage.getItem('bhumiHealingMemory')) {
      localStorage.removeItem('bhumiHealingMemory');
    }

    const scopedKey = `bhumiHealingMemory:${uid}`;
    const stored = localStorage.getItem(scopedKey);
    const parsed = stored ? safeJsonParse<HealingMemory | null>(stored, null) : null;
    if (parsed && parsed.uid !== uid) {
      localStorage.removeItem(scopedKey);
      return null;
    }
    return parsed;
  }

  async saveHealingMemory(memory: HealingMemory): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const uid = memory.uid || this.getUserId();
    if (!uid) return false;
    try {
      localStorage.setItem(`bhumiHealingMemory:${uid}`, JSON.stringify({ ...memory, uid }));
      return true;
    } catch {
      return false;
    }
  }

  async getJourneyData(): Promise<JourneyData | null> {
    if (typeof window === 'undefined') return null;
    const uid = this.getUserId();
    if (!uid) return null;

    if (localStorage.getItem('bhumiJourneyData')) {
      localStorage.removeItem('bhumiJourneyData');
    }

    const scopedKey = `bhumiJourneyData:${uid}`;
    const stored = localStorage.getItem(scopedKey);
    const parsed = stored ? safeJsonParse<JourneyData | null>(stored, null) : null;
    if (parsed && parsed.uid !== uid) {
      localStorage.removeItem(scopedKey);
      return null;
    }
    return parsed;
  }

  async saveJourneyData(journey: JourneyData): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const uid = journey.uid || this.getUserId();
    if (!uid) return false;
    try {
      localStorage.setItem(`bhumiJourneyData:${uid}`, JSON.stringify({ ...journey, uid }));
      return true;
    } catch {
      return false;
    }
  }

  async getWeeklyReport(): Promise<WeeklySoulReport | null> {
    if (typeof window === 'undefined') return null;
    const uid = this.getUserId();
    if (!uid) return null;

    if (localStorage.getItem('bhumiWeeklySoulReport')) {
      localStorage.removeItem('bhumiWeeklySoulReport');
    }

    const scopedKey = `bhumiWeeklySoulReport:${uid}`;
    const stored = localStorage.getItem(scopedKey);
    const parsed = stored ? safeJsonParse<(WeeklySoulReport & { uid?: string }) | null>(stored, null) : null;
    if (parsed && (parsed as any)?.uid !== uid) {
      localStorage.removeItem(scopedKey);
      return null;
    }
    return parsed;
  }

  async saveWeeklyReport(report: WeeklySoulReport): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const uid = (report as any).uid || this.getUserId();
    if (!uid) return false;
    try {
      localStorage.setItem(`bhumiWeeklySoulReport:${uid}`, JSON.stringify({ ...report, uid }));
      return true;
    } catch {
      return false;
    }
  }

  async getNotificationPreferences(): Promise<NotificationPreferences | null> {
    if (typeof window === 'undefined') return null;
    const uid = this.getUserId();
    if (!uid) return null;
    const stored = localStorage.getItem(`bhumiNotifications:${uid}`);
    return stored ? safeJsonParse<NotificationPreferences | null>(stored, null) : null;
  }

  async saveNotificationPreferences(prefs: NotificationPreferences): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const uid = prefs.uid || this.getUserId();
    if (!uid) return false;
    try {
      localStorage.setItem(`bhumiNotifications:${uid}`, JSON.stringify({ ...prefs, uid }));
      return true;
    } catch {
      return false;
    }
  }

  async getUserPlan(): Promise<any | null> {
    if (typeof window === 'undefined') return null;
    const uid = this.getUserId();
    if (!uid) return null;
    const stored = localStorage.getItem(`bhumiUserPlan:${uid}`);
    return stored ? safeJsonParse<any>(stored, null) : null;
  }

  async saveUserPlan(plan: any): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const uid = this.getUserId();
    if (!uid) return false;
    try {
      localStorage.setItem(`bhumiUserPlan:${uid}`, JSON.stringify(plan));
      return true;
    } catch {
      return false;
    }
  }

  async deleteUserDataCompletely(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const uid = this.getUserId();
    if (!uid) return false;

    const keysToDelete = [
      `bhumiProfile:${uid}`,
      `bhumiBlueprint:${uid}`,
      `bhumiJournalEntries:${uid}`,
      `bhumiMeditationEntries:${uid}`,
      `bhumiAudioHealingEntries:${uid}`,
      `bhumiHealingMemory:${uid}`,
      `bhumiJourneyData:${uid}`,
      `bhumiWeeklySoulReport:${uid}`,
      `bhumiNotifications:${uid}`,
      `bhumiUserPlan:${uid}`,
    ];

    keysToDelete.forEach(key => localStorage.removeItem(key));

    const uidScopedPrefixes = [
      `dailyGuidance:${uid}:`,
      `bhumiDailyGuidance:${uid}:`,
      `bhumiUserPlan:${uid}`,
      `bhumiLanguage:${uid}`,
      `bhumi-language:${uid}`,
    ];

    const appDataPrefixes = [
      "bhumi",
      "dailyGuidance",
      "setupCompleted",
      "userRouteState",
    ];

    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);
      if (!key) continue;

      const isKnownUidScopedKey = key.includes(uid) && appDataPrefixes.some(prefix => key.startsWith(prefix));
      const isKnownPrefix = uidScopedPrefixes.some(prefix => key.startsWith(prefix));

      if (isKnownUidScopedKey || isKnownPrefix) {
        localStorage.removeItem(key);
      }
    }

    return true;
  }
}

// Firebase Storage Implementation
class FirebaseStorageProvider implements StorageProvider {
  private getCurrentUserId(): string | null {
    const authUid = auth.currentUser?.uid;
    if (authUid) return authUid;

    // In Firebase mode, we should NOT rely on localStorage to find the active user ID
    // but if we are in a hybrid state, we might need a way to know WHO is active.
    // However, for strictness, we only use auth.currentUser.
    console.log("[ACTIVE USER ID]", {
      source: auth.currentUser?.uid ? "auth.currentUser" : "none",
      uid: authUid,
    });
    return authUid || null;
  }

  async getUserProfile(): Promise<UserProfile | null> {
    const uid = this.getCurrentUserId();
    if (!uid) return null;
    const profile = await firebaseService.getUserProfile(uid);
    console.log("[USER DATA LOAD]", {
      uid,
      email: profile?.email ?? null,
      source: "firebase",
      profileExists: !!profile,
    });
    return profile;
  }

  async saveUserProfile(profile: UserProfile): Promise<boolean> {
    const uid = this.getCurrentUserId();
    if (!uid || profile.uid !== uid) {
       console.warn("[USER DATA MISMATCH BLOCKED]", { reason: "profile_save_uid_mismatch", activeUid: uid, profileUid: profile.uid });
       return false;
    }
    return await firebaseService.saveUserProfile(profile);
  }

  async getUserBlueprint(): Promise<UserBlueprint | null> {
    const uid = this.getCurrentUserId();
    if (!uid) return null;
    const [blueprint, profile] = await Promise.all([
      firebaseService.getUserBlueprint(uid),
      firebaseService.getUserProfile(uid).catch(() => null),
    ]);

    if (blueprint && blueprint.uid !== uid) {
       console.warn("[USER DATA MISMATCH BLOCKED]", { reason: "blueprint_load_uid_mismatch", activeUid: uid, blueprintUid: blueprint.uid });
       return null;
    }
    const repair = blueprint ? repairHumanDesignIfPossible(blueprint as any, profile as any) : null;
    if (repair?.repaired) {
      console.log("[BLUEPRINT HD REPAIR]", {
        uid,
        source: "firebase",
        reason: repair.reason,
      });
      await firebaseService.saveUserBlueprint(repair.blueprint as UserBlueprint);
      return repair.blueprint as UserBlueprint;
    }
    return blueprint;
  }

  async saveUserBlueprint(blueprint: UserBlueprint): Promise<boolean> {
    const uid = this.getCurrentUserId();
    if (!uid || blueprint.uid !== uid) {
      console.warn("[USER DATA MISMATCH BLOCKED]", { reason: "blueprint_save_uid_mismatch", activeUid: uid, blueprintUid: blueprint.uid });
      return false;
    }
    return await firebaseService.saveUserBlueprint(blueprint);
  }

  async deleteUserBlueprint(): Promise<boolean> {
    const uid = this.getCurrentUserId();
    if (!uid) return false;
    return await firebaseService.deleteUserBlueprint(uid);
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    const uid = this.getCurrentUserId();
    if (!uid) return [];
    return await firebaseService.getJournalEntries(uid);
  }

  async saveJournalEntry(entry: JournalEntry): Promise<boolean> {
    const uid = this.getCurrentUserId();
    if (!uid || entry.uid !== uid) return false;
    const result = await firebaseService.saveJournalEntry(entry);
    return result !== null;
  }

  async getMeditationEntries(): Promise<MeditationEntry[]> {
    const uid = this.getCurrentUserId();
    if (!uid) return [];
    return await firebaseService.getMeditationEntries(uid);
  }

  async saveMeditationEntry(entry: MeditationEntry): Promise<boolean> {
    const uid = this.getCurrentUserId();
    if (!uid || entry.uid !== uid) return false;
    const result = await firebaseService.saveMeditationEntry(entry);
    return result !== null;
  }

  async getAudioHealingEntries(): Promise<AudioHealingEntry[]> {
    const uid = this.getCurrentUserId();
    if (!uid) return [];
    return await firebaseService.getAudioHealingEntries(uid);
  }

  async saveAudioHealingEntry(entry: AudioHealingEntry): Promise<boolean> {
    const uid = this.getCurrentUserId();
    if (!uid || entry.uid !== uid) return false;
    const result = await firebaseService.saveAudioHealingEntry(entry);
    return result !== null;
  }

  async getHealingMemory(): Promise<HealingMemory | null> {
    const uid = this.getCurrentUserId();
    if (!uid) return null;
    return await firebaseService.getHealingMemory(uid);
  }

  async saveHealingMemory(memory: HealingMemory): Promise<boolean> {
    const uid = this.getCurrentUserId();
    if (!uid || memory.uid !== uid) return false;
    return await firebaseService.saveHealingMemory(memory);
  }

  async getJourneyData(): Promise<JourneyData | null> {
    const uid = this.getCurrentUserId();
    if (!uid) return null;
    return await firebaseService.getJourneyData(uid);
  }

  async saveJourneyData(journey: JourneyData): Promise<boolean> {
    const uid = this.getCurrentUserId();
    if (!uid || journey.uid !== uid) return false;
    return await firebaseService.saveJourneyData(journey);
  }

  async getWeeklyReport(): Promise<WeeklySoulReport | null> {
    const uid = this.getCurrentUserId();
    if (!uid) return null;
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];
    return await firebaseService.getWeeklyReport(uid, weekStartStr);
  }

  async saveWeeklyReport(report: WeeklySoulReport): Promise<boolean> {
    const uid = this.getCurrentUserId();
    if (!uid) return false;
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];
    return await firebaseService.saveWeeklyReport(uid, weekStartStr, report);
  }

  async getNotificationPreferences(): Promise<NotificationPreferences | null> {
    const uid = this.getCurrentUserId();
    if (!uid) return null;
    return await firebaseService.getNotificationPreferences(uid);
  }

  async saveNotificationPreferences(prefs: NotificationPreferences): Promise<boolean> {
    const uid = this.getCurrentUserId();
    if (!uid || prefs.uid !== uid) return false;
    return await firebaseService.saveNotificationPreferences(prefs);
  }

  async getUserPlan(): Promise<any | null> {
    const uid = this.getCurrentUserId();
    if (!uid) return null;
    const profile = await firebaseService.getUserProfile(uid);
    return profile?.plan || null;
  }

  async saveUserPlan(plan: any): Promise<boolean> {
    const uid = this.getCurrentUserId();
    if (!uid) return false;
    const currentProfile = await firebaseService.getUserProfile(uid);
    if (!currentProfile) return false;
    
    const updatedProfile = {
      ...currentProfile,
      plan,
      updatedAt: new Date().toISOString()
    };
    
    return await firebaseService.saveUserProfile(updatedProfile);
  }

  async deleteUserDataCompletely(): Promise<boolean> {
    const uid = this.getCurrentUserId();
    if (!uid) return false;
    return await firebaseService.deleteUserDataCompletely(uid);
  }
}

// Dual Storage Provider (Local + Firebase)
class DualStorageProvider implements StorageProvider {
  private localStorageProvider: LocalStorageProvider;
  private firebaseStorageProvider: FirebaseStorageProvider;
  private FIREBASE_TIMEOUT_MS = 3000;

  constructor() {
    this.localStorageProvider = new LocalStorageProvider();
    this.firebaseStorageProvider = new FirebaseStorageProvider();
  }

  private async withTimeout<T>(operation: string, documentPath: string, promise: Promise<T>, fallback: T): Promise<T> {
    const startedAt = performance.now();
    const firestoreHost = (db as any)._settings?.host ?? "default";
    const diagnostic = {
      operation,
      appName: app.name,
      firestoreHost,
      documentPath,
    };

    if (process.env.NODE_ENV !== "production") {
      console.info("[STORAGE PROVIDER] Firebase operation start", diagnostic);
    }

    return settleWithTimeout(
      promise,
      this.FIREBASE_TIMEOUT_MS,
      () => fallback,
      {
        onTimeout: () => {
        console.warn("[STORAGE PROVIDER] Firebase operation timeout", {
          ...diagnostic,
          elapsedMs: Math.round(performance.now() - startedAt),
        });
        },
        onPrimaryResolved: () => {
          if (process.env.NODE_ENV !== "production") {
            console.info("[STORAGE PROVIDER] Firebase operation success", {
              ...diagnostic,
              elapsedMs: Math.round(performance.now() - startedAt),
            });
          }
        },
        onPrimaryRejected: (error) => {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[STORAGE PROVIDER] Firebase operation failure", {
              ...diagnostic,
              elapsedMs: Math.round(performance.now() - startedAt),
              errorCode: typeof error === "object" && error !== null ? (error as { code?: unknown }).code : undefined,
            });
          }
        },
      },
    );
  }

  private getCurrentUserId(): string | null {
    return auth.currentUser?.uid || null;
  }

  private isPermissionDenied(error: unknown): boolean {
    if (!error || typeof error !== "object") return false;
    const code = (error as { code?: string }).code;
    return code === "permission-denied";
  }

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const firebaseProfile = await this.withTimeout(
        "getUserProfile",
        `users/${this.getCurrentUserId() ?? "unknown"}`,
        this.firebaseStorageProvider.getUserProfile(),
        null
      );
      if (firebaseProfile) return firebaseProfile;
    } catch (error) {
      if (!this.isPermissionDenied(error)) {
        console.error("[STORAGE PROVIDER] Firebase getUserProfile error:", error);
      }
    }
    
    return await this.localStorageProvider.getUserProfile();
  }

  async saveUserProfile(profile: UserProfile): Promise<boolean> {
    const [localSuccess, firebaseSuccess] = await Promise.allSettled([
      this.localStorageProvider.saveUserProfile(profile),
      this.withTimeout("saveUserProfile", `users/${profile.uid}`, this.firebaseStorageProvider.saveUserProfile(profile), false)
    ]);

    return (localSuccess.status === 'fulfilled' && localSuccess.value) ||
           (firebaseSuccess.status === 'fulfilled' && firebaseSuccess.value);
  }

  async getUserBlueprint(): Promise<UserBlueprint | null> {
    try {
      const firebaseBlueprint = await this.withTimeout(
        "getUserBlueprint",
        `blueprints/${this.getCurrentUserId() ?? "unknown"}`,
        this.firebaseStorageProvider.getUserBlueprint(),
        null
      );
      if (firebaseBlueprint) return firebaseBlueprint;
    } catch (error) {
      if (!this.isPermissionDenied(error)) {
        console.error("[STORAGE PROVIDER] Firebase getUserBlueprint error:", error);
      }
    }
    
    return await this.localStorageProvider.getUserBlueprint();
  }

  async saveUserBlueprint(blueprint: UserBlueprint): Promise<boolean> {
    const [localSuccess, firebaseSuccess] = await Promise.allSettled([
      this.localStorageProvider.saveUserBlueprint(blueprint),
      this.withTimeout("saveUserBlueprint", `blueprints/${blueprint.uid}`, this.firebaseStorageProvider.saveUserBlueprint(blueprint), false)
    ]);

    return (localSuccess.status === 'fulfilled' && localSuccess.value) ||
           (firebaseSuccess.status === 'fulfilled' && firebaseSuccess.value);
  }

  async deleteUserBlueprint(): Promise<boolean> {
    const [localSuccess, firebaseSuccess] = await Promise.allSettled([
      this.localStorageProvider.deleteUserBlueprint(),
      this.firebaseStorageProvider.deleteUserBlueprint()
    ]);

    return (localSuccess.status === 'fulfilled' && localSuccess.value) ||
           (firebaseSuccess.status === 'fulfilled' && firebaseSuccess.value);
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    try {
      const firebaseEntries = await this.firebaseStorageProvider.getJournalEntries();
      if (firebaseEntries.length > 0) return firebaseEntries;
    } catch (error) {
      if (!this.isPermissionDenied(error)) throw error;
    }
    
    return await this.localStorageProvider.getJournalEntries();
  }

  async saveJournalEntry(entry: JournalEntry): Promise<boolean> {
    const [localSuccess, firebaseSuccess] = await Promise.allSettled([
      this.localStorageProvider.saveJournalEntry(entry),
      this.firebaseStorageProvider.saveJournalEntry(entry)
    ]);

    return (localSuccess.status === 'fulfilled' && localSuccess.value) ||
           (firebaseSuccess.status === 'fulfilled' && firebaseSuccess.value);
  }

  async getMeditationEntries(): Promise<MeditationEntry[]> {
    try {
      const firebaseEntries = await this.firebaseStorageProvider.getMeditationEntries();
      if (firebaseEntries.length > 0) return firebaseEntries;
    } catch (error) {
      if (!this.isPermissionDenied(error)) throw error;
    }
    
    return await this.localStorageProvider.getMeditationEntries();
  }

  async saveMeditationEntry(entry: MeditationEntry): Promise<boolean> {
    const [localSuccess, firebaseSuccess] = await Promise.allSettled([
      this.localStorageProvider.saveMeditationEntry(entry),
      this.firebaseStorageProvider.saveMeditationEntry(entry)
    ]);

    return (localSuccess.status === 'fulfilled' && localSuccess.value) ||
           (firebaseSuccess.status === 'fulfilled' && firebaseSuccess.value);
  }

  async getAudioHealingEntries(): Promise<AudioHealingEntry[]> {
    try {
      const firebaseEntries = await this.firebaseStorageProvider.getAudioHealingEntries();
      if (firebaseEntries.length > 0) return firebaseEntries;
    } catch (error) {
      if (!this.isPermissionDenied(error)) throw error;
    }
    
    return await this.localStorageProvider.getAudioHealingEntries();
  }

  async saveAudioHealingEntry(entry: AudioHealingEntry): Promise<boolean> {
    const [localSuccess, firebaseSuccess] = await Promise.allSettled([
      this.localStorageProvider.saveAudioHealingEntry(entry),
      this.firebaseStorageProvider.saveAudioHealingEntry(entry)
    ]);

    return (localSuccess.status === 'fulfilled' && localSuccess.value) ||
           (firebaseSuccess.status === 'fulfilled' && firebaseSuccess.value);
  }

  async getHealingMemory(): Promise<HealingMemory | null> {
    const firebaseMemory = await this.firebaseStorageProvider.getHealingMemory();
    if (firebaseMemory) return firebaseMemory;
    return await this.localStorageProvider.getHealingMemory();
  }

  async saveHealingMemory(memory: HealingMemory): Promise<boolean> {
    const [localSuccess, firebaseSuccess] = await Promise.allSettled([
      this.localStorageProvider.saveHealingMemory(memory),
      this.firebaseStorageProvider.saveHealingMemory(memory)
    ]);

    return (localSuccess.status === 'fulfilled' && localSuccess.value) ||
           (firebaseSuccess.status === 'fulfilled' && firebaseSuccess.value);
  }

  async getJourneyData(): Promise<JourneyData | null> {
    const firebaseJourney = await this.firebaseStorageProvider.getJourneyData();
    if (firebaseJourney) return firebaseJourney;
    return await this.localStorageProvider.getJourneyData();
  }

  async saveJourneyData(journey: JourneyData): Promise<boolean> {
    const [localSuccess, firebaseSuccess] = await Promise.allSettled([
      this.localStorageProvider.saveJourneyData(journey),
      this.firebaseStorageProvider.saveJourneyData(journey)
    ]);

    return (localSuccess.status === 'fulfilled' && localSuccess.value) ||
           (firebaseSuccess.status === 'fulfilled' && firebaseSuccess.value);
  }

  async getWeeklyReport(): Promise<WeeklySoulReport | null> {
    const firebaseReport = await this.firebaseStorageProvider.getWeeklyReport();
    if (firebaseReport) return firebaseReport;
    return await this.localStorageProvider.getWeeklyReport();
  }

  async saveWeeklyReport(report: WeeklySoulReport): Promise<boolean> {
    const [localSuccess, firebaseSuccess] = await Promise.allSettled([
      this.localStorageProvider.saveWeeklyReport(report),
      this.firebaseStorageProvider.saveWeeklyReport(report)
    ]);

    return (localSuccess.status === 'fulfilled' && localSuccess.value) ||
           (firebaseSuccess.status === 'fulfilled' && firebaseSuccess.value);
  }

  async getNotificationPreferences(): Promise<NotificationPreferences | null> {
    return await this.firebaseStorageProvider.getNotificationPreferences();
  }

  async saveNotificationPreferences(prefs: NotificationPreferences): Promise<boolean> {
    return await this.firebaseStorageProvider.saveNotificationPreferences(prefs);
  }

  async getUserPlan(): Promise<any | null> {
    const firebasePlan = await this.firebaseStorageProvider.getUserPlan();
    if (firebasePlan) return firebasePlan;
    return await this.localStorageProvider.getUserPlan();
  }

  async saveUserPlan(plan: any): Promise<boolean> {
    const [localSuccess, firebaseSuccess] = await Promise.allSettled([
      this.localStorageProvider.saveUserPlan(plan),
      this.firebaseStorageProvider.saveUserPlan(plan)
    ]);

    return (localSuccess.status === 'fulfilled' && localSuccess.value) ||
           (firebaseSuccess.status === 'fulfilled' && firebaseSuccess.value);
  }

  async deleteUserDataCompletely(): Promise<boolean> {
    const [localSuccess, firebaseSuccess] = await Promise.allSettled([
      this.localStorageProvider.deleteUserDataCompletely(),
      this.firebaseStorageProvider.deleteUserDataCompletely()
    ]);

    const localDeleted = localSuccess.status === 'fulfilled' && localSuccess.value;
    const firebaseDeleted = firebaseSuccess.status === 'fulfilled' && firebaseSuccess.value;

    if (this.getCurrentUserId()) {
      return localDeleted && firebaseDeleted;
    }

    return localDeleted || firebaseDeleted;
  }
}

// Storage Provider Factory
export class StorageProviderFactory {
  static create(providerType: 'local' | 'firebase' | 'dual' = 'dual'): StorageProvider {
    switch (providerType) {
      case 'local':
        return new LocalStorageProvider();
      case 'firebase':
        return new FirebaseStorageProvider();
      case 'dual':
        return new DualStorageProvider();
      default:
        return new DualStorageProvider();
    }
  }
}

// Default export for easy usage
export const storageProvider = StorageProviderFactory.create('dual');
