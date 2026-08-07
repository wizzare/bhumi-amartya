import { doc, getDoc, setDoc, collection, addDoc, query, where, orderBy, limit, getDocs, updateDoc, deleteDoc, serverTimestamp, documentId } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Timestamp } from 'firebase/firestore';
import { isCanonicalHumanDesign } from '@/lib/humandesign/hdAudit';

/**
 * P0 HOTFIX: Safely converts various date formats to Firestore Timestamp.
 * Prevents "Invalid time value" RangeError by avoiding new Date(timestampObject).
 */
function toValidTimestamp(value: unknown, fallback: any): any {
  if (value instanceof Timestamp) {
    return value;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? fallback : Timestamp.fromDate(value);
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? fallback : Timestamp.fromDate(parsed);
  }

  return fallback;
}
import type { GaiaProfile } from '@/lib/profile/gaia/types';
import { sanitizeForFirestore } from '@/lib/firebase/sanitizeForFirestore';
import { stripServerOwnedAccessFields } from '@/lib/billing/serverOwnedAccessFields';
import type { WetonBlueprint } from '@/lib/weton/types';
import type { BaziBlueprint } from '@/lib/bazi/types';
import type { VedicBlueprint } from '@/lib/vedic/types';

// Type definitions matching the localStorage structures
export interface UserProfile {
  uid: string;
  fullName: string;
  displayName: string;
  email: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthPlace: string;
  cityOfBirth?: string;
  birthCountry: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone?: string | null;
  language: string;
  setupCompleted: boolean;
  authProvider: "google" | "local" | null;
  plan?: UserPlan;
  createdAt: string;
  updatedAt: string;
  photoURL?: string;
  onboardingCompleted?: boolean;
  profile?: {
    language: string;
    onboardingCompleted: boolean;
    timezone?: string | null;
    birthCity?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    blueprintInput: {
      birthDate: string;
      birthTime: string;
      birthCity: string;
    };
  };
  isDeveloper?: boolean;
  trialStartedAt?: string;
  trialEndsAt?: string;
  lastActiveAt?: string;
  appVersion?: string;
  buildNumber?: string;
  profileVersion?: string;
  engineVersion?: string;
  migrationVersion?: string;
  gaiaProfile?: GaiaProfile;

  // Guardian Identity V3
  guardianRole?: "founder" | "admin" | "user";
  guardianBadge?: "core_guardian" | "guardian";
  testerBadge?: "Founder" | "Penjaga Bhumi Inti" | "Penjaga Bhumi Alfa" | "Penjaga Bhumi";
  recognitionTier?: "FOUNDER" | "CORE_GUARDIAN" | "GUARDIAN";
  recognitionDate?: string;
  membershipType?: "FREE" | "TRIAL" | "PREMIUM" | "LIFETIME" | "REGULAR" | string | null;
  membershipExpiryDate?: string | null;
  membershipExpiresAt?: string;
  isFoundingMember?: boolean;
}

export interface UserPlan {
  plan: "free" | "pro";
  startedAt: string;
  expiresAt?: string;
  source: "local-mvp" | "google-play" | "developer-override";
}

export interface UserBlueprint {
  uid: string;
  status: "pending" | "ready" | "error";
  humanDesign?: {
    type: string | null;
    profile: string | null;
    authority: string | null;
    strategy: string | null;
    notSelfTheme: string | null;
    signature: string | null;
    definedCenters: string[];
    openCenters: string[];
    gatesPersonality: string[];
    gatesDesign: string[];
    status: "pending" | "ready" | "error" | "needs_verified_engine" | "verified";
    source: "human-design-py" | "local-fallback" | "pending" | "error" | "verified-override" | "manual_verified";
    note?: string;
  };
  numerology?: {
    number: number;
    role: string;
    purpose: string;
    challenges: string[];
    lessons: string[];
  };
  astrology?: {
    sunSign: string;
    moonSign: string;
    risingSign: string;
    natalChart?: any;
  };
  destinyMatrix?: {
    center: number;
    centerName: string;
    influence: string[];
    connections: any[];
  };
  lifePath?: {
    number: number;
    role: string;
    traits: string[];
    challenges: string[];
  };
  dailyReflection?: {
    content: string;
    energy: string;
    focus: string;
  };
  weton?: WetonBlueprint;
  bazi?: BaziBlueprint;
  vedic?: VedicBlueprint;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  uid: string;
  date: string;
  theme: string;
  questions: string[];
  journalText: string;
  emotionalState: string;
  bodySignals: string[];
  createdAt: string;
  insight: string;
  tomorrowFocus: string;
  sourceContext?: {
    lifePathNumber?: number | null;
    humanDesignType?: string | null;
    arcanaCenter?: number | null;
    sunSign?: string | null;
    previousEntryCount: number;
  };
}

export interface MeditationEntry {
  id: string;
  uid: string;
  date: string;
  theme: string;
  practices: string[];
  emotionalState: string;
  bodySignals: string[];
  bodyReflection: string;
  createdAt: string;
  insight: string;
  nextFocus: string;
  mudraName?: string;
}

export interface AudioHealingEntry {
  id: string;
  uid: string;
  date: string;
  playlistUrl: string;
  emotionalState: string;
  bodySignals: string[];
  reflectionText: string;
  createdAt: string;
  insight: string;
  nextFocus: string;
}

export interface HealingMemory {
  uid: string;
  dominantThemes: Array<{ theme: string; count: number }>;
  recurringPatterns: string[];
  recurringEmotions: Array<{ emotion: string; count: number }>;
  recurringBodySignals: Array<{ signal: string; count: number }>;
  growthIndicators: string[];
  healingStage: "Awareness" | "Acceptance" | "Release" | "Integration" | "Service";
  healingStageExplanation: string;
  recommendedFocus: string;
  lastUpdated: string;
}

export interface JourneyData {
  uid: string;
  currentStage: {
    stage: "Awareness" | "Acceptance" | "Release" | "Rebuilding" | "Integration" | "Alignment";
    label: string;
    reason: string;
  };
  dominantThemes: Array<{
    theme: string;
    frequency: number;
    reason: string;
  }>;
  progressSummary: {
    journalEntries: number;
    meditationSessions: number;
    audioHealingSessions: number;
    currentStreak: number;
  };
  timeline: Array<{
    date: string;
    dominantTheme: string;
    activityType: "Journal" | "Meditasi" | "Audio Healing";
  }>;
  weeklyFocus: {
    theme: string;
    why: string;
  };
  recommendedNextStep: {
    journal: string;
    meditation: string;
    audioHealing: string;
  };
  updatedAt: string;
  source: string;
  futureHooks: {
    geminiAnalysis: boolean;
    pushNotifications: boolean;
    aiCompanion: boolean;
    premiumInsights: boolean;
  };
}

export interface WeeklySoulReport {
  weekStart: string;
  weekEnd: string;
  totalJournal: number;
  totalMeditation: number;
  totalAudioHealing: number;
  dominantTheme: string;
  emotionalPattern: string;
  bodyPattern: string;
  growthSummary: string;
  blueprintReflection: string;
  recommendedFocusNextWeek: string;
  recommendedJournalPrompt: string;
  recommendedMeditation: string;
  recommendedAudioHealing: string;
  closingMessage: string;
}

export interface NotificationPreferences {
  uid: string;
  preferences: {
    dailyReminders: boolean;
    weeklyReports: boolean;
    healingSuggestions: boolean;
    marketing: boolean;
  };
  lastNotificationSent?: string;
  notificationHistory: Array<{
    type: string;
    message: string;
    sentAt: string;
    read: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Firebase Service Layer
export class FirebaseService {
  private logFirestore(operation: string, collectionName: string, documentId?: string) {
    void operation;
    void collectionName;
    void documentId;
  }

  // User Profile Operations
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      this.logFirestore("getDoc", "users", uid);
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          trialStartedAt: data.trialStartedAt?.toDate?.()?.toISOString(),
          trialEndsAt: data.trialEndsAt?.toDate?.()?.toISOString(),
          lastActiveAt: data.lastActiveAt?.toDate?.()?.toISOString()
        } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async saveUserProfile(profile: UserProfile): Promise<boolean> {
    try {
      this.logFirestore("setDoc", "users", profile.uid);
      const userRef = doc(db, 'users', profile.uid);
      const userData = {
        ...profile,
        createdAt: toValidTimestamp(profile.createdAt, serverTimestamp()),
        updatedAt: serverTimestamp(),
        lastActiveAt: toValidTimestamp(profile.lastActiveAt, null)
      };
      
      // Remove ID from the data since it's the document ID
      delete (userData as any).id;
      const safeUserData = stripServerOwnedAccessFields(userData);
      
      await setDoc(userRef, sanitizeForFirestore(safeUserData), { merge: true });
      return true;
    } catch (error) {
      console.error('Error saving user profile:', error);
      return false;
    }
  }

  // User Blueprint Operations
  async getUserBlueprint(uid: string): Promise<UserBlueprint | null> {
    try {
      this.logFirestore("getDoc", "blueprints", uid);
      const blueprintDoc = await getDoc(doc(db, 'blueprints', uid));
      if (blueprintDoc.exists()) {
        const data = blueprintDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as UserBlueprint;
      }
      return null;
    } catch (error) {
      console.error('Error getting user blueprint:', error);
      return null;
    }
  }

  async saveUserBlueprint(blueprint: UserBlueprint): Promise<boolean> {
    try {
      this.logFirestore("setDoc", "blueprints", blueprint.uid);
      const blueprintRef = doc(db, 'blueprints', blueprint.uid);

      // HOTFIX: last-write safety guard — canonical must never be overwritten.
      // Re-read the latest document and abort if a canonical chart already exists.
      try {
        const latestSnap = await getDoc(blueprintRef);
        const latestHd = latestSnap.exists() ? (latestSnap.data() as { humanDesign?: unknown })?.humanDesign : undefined;
        if (isCanonicalHumanDesign(latestHd)) {
          console.warn("[HD WRITE GUARD] Canonical chart already exists. Aborting write.", { uid: blueprint.uid });
          return false;
        }
      } catch (readErr) {
        console.warn("[HD WRITE GUARD] Latest read check failed; continuing with guarded save path.", { uid: blueprint.uid, readErr });
      }

      const blueprintData = {
        ...blueprint,
        createdAt: toValidTimestamp(blueprint.createdAt, serverTimestamp()),
        updatedAt: serverTimestamp()
      };

      await setDoc(blueprintRef, sanitizeForFirestore(blueprintData));
      return true;
    } catch (error) {
      console.error('Error saving user blueprint:', error);
      return false;
    }
  }

  async deleteUserBlueprint(uid: string): Promise<boolean> {
    try {
      this.logFirestore("deleteDoc", "blueprints", uid);
      await deleteDoc(doc(db, 'blueprints', uid));
      return true;
    } catch (error) {
      console.error('Error deleting user blueprint:', error);
      return false;
    }
  }

  async deleteUserDataCompletely(uid: string): Promise<boolean> {
    try {
      this.logFirestore("deleteAll", "scoped", uid);

      const deleteScoped = async (collectionName: string) => {
        const q = query(collection(db, collectionName), where('uid', '==', uid));
        const snapshot = await getDocs(q);
        await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)));
      };

      const deleteDirectDocument = async (collectionName: string) => {
        await deleteDoc(doc(db, collectionName, uid));
      };

      const deleteDailyGuidance = async () => {
        const dailyGuidance = collection(db, 'dailyGuidance');
        const byUid = query(dailyGuidance, where('uid', '==', uid));
        const byDocumentPrefix = query(
          dailyGuidance,
          where(documentId(), '>=', `${uid}_`),
          where(documentId(), '<', `${uid}_\uf8ff`)
        );
        const snapshots = await Promise.all([
          getDocs(byUid),
          getDocs(byDocumentPrefix),
        ]);
        const refsByPath = new Map();

        snapshots.forEach(snapshot => {
          snapshot.docs.forEach(d => refsByPath.set(d.ref.path, d.ref));
        });

        await Promise.all(Array.from(refsByPath.values()).map(ref => deleteDoc(ref)));
      };

      const deleteNestedJournalEntries = async () => {
        const entriesSnapshot = await getDocs(collection(db, 'journals', uid, 'entries'));
        await Promise.all(entriesSnapshot.docs.map(d => deleteDoc(d.ref)));
        await deleteDoc(doc(db, 'journals', uid));
      };

      await Promise.all([
        deleteDirectDocument('blueprints'),
        deleteDirectDocument('users'),
        deleteScoped('journalEntries'),
        deleteScoped('meditationEntries'),
        deleteScoped('audioHealingEntries'),
        deleteScoped('healingMemory'),
        deleteScoped('journeyData'),
        deleteScoped('notifications'),
        deleteScoped('weeklyReports'),
        deleteDirectDocument('healingMemory'),
        deleteDirectDocument('journeyData'),
        deleteDirectDocument('notifications'),
        deleteDailyGuidance(),
        deleteNestedJournalEntries(),
      ]);

      return true;
    } catch (error) {
      console.error('Error deleting user data completely:', error);
      return false;
    }
  }

  // Journal Entry Operations
  async getJournalEntries(uid: string, limitCount: number = 50): Promise<JournalEntry[]> {
    try {
      this.logFirestore("getDocs(query)", "journalEntries", uid);
      const q = query(
        collection(db, 'journalEntries'),
        where('uid', '==', uid),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as JournalEntry;
      });
    } catch (error) {
      console.error('Error getting journal entries:', error);
      return [];
    }
  }

  async saveJournalEntry(entry: JournalEntry): Promise<string | null> {
    try {
      this.logFirestore("addDoc", "journalEntries", entry.uid);
      const entryData = {
        ...entry,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Remove ID from the data since we're adding a new document
      delete (entryData as any).id;
      
      const docRef = await addDoc(collection(db, 'journalEntries'), entryData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving journal entry:', error);
      return null;
    }
  }

  async updateJournalEntry(id: string, entry: Partial<JournalEntry>): Promise<boolean> {
    try {
      this.logFirestore("updateDoc", "journalEntries", id);
      const entryRef = doc(db, 'journalEntries', id);
      const updateData = {
        ...entry,
        updatedAt: serverTimestamp()
      };
      await updateDoc(entryRef, updateData);
      return true;
    } catch (error) {
      console.error('Error updating journal entry:', error);
      return false;
    }
  }

  async deleteJournalEntry(id: string): Promise<boolean> {
    try {
      this.logFirestore("deleteDoc", "journalEntries", id);
      await deleteDoc(doc(db, 'journalEntries', id));
      return true;
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      return false;
    }
  }

  // Meditation Entry Operations
  async getMeditationEntries(uid: string, limitCount: number = 50): Promise<MeditationEntry[]> {
    try {
      this.logFirestore("getDocs(query)", "meditationEntries", uid);
      const q = query(
        collection(db, 'meditationEntries'),
        where('uid', '==', uid),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as MeditationEntry;
      });
    } catch (error) {
      console.error('Error getting meditation entries:', error);
      return [];
    }
  }

  async saveMeditationEntry(entry: MeditationEntry): Promise<string | null> {
    try {
      this.logFirestore("addDoc", "meditationEntries", entry.uid);
      const entryData = {
        ...entry,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      delete (entryData as any).id;
      
      const docRef = await addDoc(collection(db, 'meditationEntries'), entryData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving meditation entry:', error);
      return null;
    }
  }

  // Audio Healing Entry Operations
  async getAudioHealingEntries(uid: string, limitCount: number = 50): Promise<AudioHealingEntry[]> {
    try {
      this.logFirestore("getDocs(query)", "audioHealingEntries", uid);
      const q = query(
        collection(db, 'audioHealingEntries'),
        where('uid', '==', uid),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as AudioHealingEntry;
      });
    } catch (error) {
      console.error('Error getting audio healing entries:', error);
      return [];
    }
  }

  async saveAudioHealingEntry(entry: AudioHealingEntry): Promise<string | null> {
    try {
      this.logFirestore("addDoc", "audioHealingEntries", entry.uid);
      const entryData = {
        ...entry,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      delete (entryData as any).id;
      
      const docRef = await addDoc(collection(db, 'audioHealingEntries'), entryData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving audio healing entry:', error);
      return null;
    }
  }

  // Healing Memory Operations
  async getHealingMemory(uid: string): Promise<HealingMemory | null> {
    try {
      this.logFirestore("getDoc", "healingMemory", uid);
      const memoryDoc = await getDoc(doc(db, 'healingMemory', uid));
      if (memoryDoc.exists()) {
        return memoryDoc.data() as HealingMemory;
      }
      return null;
    } catch (error) {
      console.error('Error getting healing memory:', error);
      return null;
    }
  }

  async saveHealingMemory(memory: HealingMemory): Promise<boolean> {
    try {
      if (!memory?.uid) {
        console.warn("[FirebaseService] saveHealingMemory skipped: missing uid");
        return false;
      }
      this.logFirestore("setDoc", "healingMemory", memory.uid);
      const memoryRef = doc(db, 'healingMemory', memory.uid);
      await setDoc(memoryRef, sanitizeForFirestore(memory));
      return true;
    } catch (error) {
      console.error('Error saving healing memory:', error);
      return false;
    }
  }

  // Journey Data Operations
  async getJourneyData(uid: string): Promise<JourneyData | null> {
    try {
      this.logFirestore("getDoc", "journeyData", uid);
      const journeyDoc = await getDoc(doc(db, 'journeyData', uid));
      if (journeyDoc.exists()) {
        return journeyDoc.data() as JourneyData;
      }
      return null;
    } catch (error) {
      console.error('Error getting journey data:', error);
      return null;
    }
  }

  async saveJourneyData(journey: JourneyData): Promise<boolean> {
    try {
      if (!journey?.uid) {
        console.warn("[FirebaseService] saveJourneyData skipped: missing uid");
        return false;
      }
      this.logFirestore("setDoc", "journeyData", journey.uid);
      const journeyRef = doc(db, 'journeyData', journey.uid);
      await setDoc(journeyRef, sanitizeForFirestore(journey));
      return true;
    } catch (error) {
      console.error('Error saving journey data:', error);
      return false;
    }
  }

  // Weekly Report Operations
  async getWeeklyReport(uid: string, weekStart: string): Promise<WeeklySoulReport | null> {
    try {
      const reportId = `${uid}_${weekStart}_week`;
      this.logFirestore("getDoc", "weeklyReports", reportId);
      const reportDoc = await getDoc(doc(db, 'weeklyReports', reportId));
      if (reportDoc.exists()) {
        const data = reportDoc.data();
        if (data.uid === uid) {
          return data as WeeklySoulReport;
        }
        console.warn("[USER DATA MISMATCH BLOCKED]", { reason: "weekly_report_uid_mismatch", requestedUid: uid, reportUid: data.uid });
      }
      return null;
    } catch (error) {
      console.error('Error getting weekly report:', error);
      return null;
    }
  }

  async saveWeeklyReport(uid: string, weekStart: string, report: WeeklySoulReport): Promise<boolean> {
    try {
      const reportId = `${uid}_${weekStart}_week`;
      this.logFirestore("setDoc", "weeklyReports", reportId);
      const reportRef = doc(db, 'weeklyReports', reportId);
      const reportData = {
        ...report,
        uid,
        weekStart,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(reportRef, sanitizeForFirestore(reportData));
      return true;
    } catch (error) {
      console.error('Error saving weekly report:', error);
      return false;
    }
  }

  // Notification Preferences Operations
  async getNotificationPreferences(uid: string): Promise<NotificationPreferences | null> {
    try {
      this.logFirestore("getDoc", "notifications", uid);
      const prefsDoc = await getDoc(doc(db, 'notifications', uid));
      if (prefsDoc.exists()) {
        const data = prefsDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as NotificationPreferences;
      }
      return null;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return null;
    }
  }

  async saveNotificationPreferences(prefs: NotificationPreferences): Promise<boolean> {
    try {
      if (!prefs?.uid) {
        console.warn("[FirebaseService] saveNotificationPreferences skipped: missing uid");
        return false;
      }
      this.logFirestore("setDoc", "notifications", prefs.uid);
      const prefsRef = doc(db, 'notifications', prefs.uid);
      const prefsData = {
        ...prefs,
        createdAt: toValidTimestamp(prefs.createdAt, serverTimestamp()),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(prefsRef, sanitizeForFirestore(prefsData));
      return true;
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      return false;
    }
  }
}

export const firebaseService = new FirebaseService();
