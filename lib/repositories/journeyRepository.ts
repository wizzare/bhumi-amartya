import { arrayUnion, collection, doc, getDoc, query, getDocs, limit, orderBy, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { DailyState } from "./dailyStateRepository";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import { waitForFirebaseAuthOwner } from "@/lib/auth/waitForFirebaseAuthOwner";
import type { JourneyDailyMemory, JourneyDailyRecord, JourneyPracticeResult } from "@/lib/types/journeyDailyRecord";
import { reflectionEngine } from "@/lib/engines/reflectionEngine";
import { journeyStoryEngine } from "@/lib/engines/journeyStoryEngine";
import { calculatePracticeEffectiveness } from "@/lib/engines/completionEngine";
import { growthNarrativeEngine } from "@/lib/engines/growthNarrativeEngine";
import { journeyNarrativeEngine } from "@/lib/engines/journeyNarrativeEngine";


const dailyRecordDoc = (uid: string, appDate: string) =>
  doc(db, "journeyDailyRecords", uid, "entries", appDate);
const dailyRecordPath = (uid: string, appDate: string) =>
  `journeyDailyRecords/${uid}/entries/${appDate}`;
const localDailyStatePrefix = (uid: string) => `moana:dailyStates:${uid}:`;
const localDailyStateKey = (uid: string, date: string) => `${localDailyStatePrefix(uid)}${date}`;
const localDailyRecordKey = (uid: string, appDate: string) => `moana:journeyDailyRecords:${uid}:${appDate}`;
const localDailyRecordPrefix = (uid: string) => `moana:journeyDailyRecords:${uid}:`;

const defaultCompletion = {
  completed: false,
  skipped: true,
  reason: "unknown",
};

function canUseLocalAuditStore(uid: string): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NODE_ENV !== "development") return false;
  const auditUser = window.localStorage.getItem("bhumi_audit_user");
  return Boolean(auditUser && uid === `${auditUser}_uid`);
}

async function ensureAuthenticatedOwner(uid: string): Promise<void> {
  if (typeof window !== "undefined") {
    await waitForFirebaseAuthOwner(auth, uid);
  }

  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error(`missing auth: expected uid ${uid}, current auth uid null`);
  }
  if (currentUser.uid !== uid) {
    throw new Error(`auth uid mismatch: expected uid ${uid}, current auth uid ${currentUser.uid}`);
  }
}

function readLocalJson<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : fallback;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

function writeLocalDailyRecord(uid: string, appDate: string, record: JourneyDailyRecord): void {
  window.localStorage.setItem(localDailyRecordKey(uid, appDate), JSON.stringify(record));
}

function getLocalDailyRecord(uid: string, appDate: string): JourneyDailyRecord | null {
  return readLocalJson<JourneyDailyRecord | null>(localDailyRecordKey(uid, appDate), null);
}

function getLocalDailyRecords(uid: string, count: number): JourneyDailyRecord[] {
  const records: JourneyDailyRecord[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(localDailyRecordPrefix(uid))) continue;
    const record = readLocalJson<JourneyDailyRecord | null>(key, null);
    if (record) records.push(record);
  }
  return records
    .sort((a, b) => String(b.appDate || b.date).localeCompare(String(a.appDate || a.date)))
    .slice(0, count);
}

function getLocalDailyStates(uid: string, count: number): DailyState[] {
  const states: DailyState[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(localDailyStatePrefix(uid))) continue;
    const state = readLocalJson<DailyState | null>(key, null);
    if (state) states.push(state);
  }
  return states
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, count);
}

function createLocalDailyRecord(uid: string, appDate: string, initial: Partial<JourneyDailyRecord> = {}): JourneyDailyRecord {
  const now = new Date().toISOString();
  return {
    id: `${uid}_${appDate}`,
    userId: uid,
    date: appDate,
    appDate,
    dayOfWeek: new Intl.DateTimeFormat("id-ID", { weekday: "long", timeZone: "UTC" })
      .format(new Date(`${appDate}T12:00:00Z`)),
    createdAt: now,
    updatedAt: now,
    dominantIssue: "",
    issueCategory: "",
    navigatorMode: "REFLECTION",
    wellnessState: {},
    dailyScanCompleted: false,
    dailyScanSummary: "",
    catatanSummary: "",
    catatanMainDirection: "",
    catatanChallenge: "",
    catatanOpportunity: "",
    astroSummary: "",
    astroEvents: [],
    profileSignals: [],
    innerworkRecommendation: null,
    innerworkCompletion: defaultCompletion,
    sourceConfidence: 0,
    ...initial,
  };
}

function createDailyRecordMergeBase(uid: string, appDate: string): Partial<JourneyDailyRecord> {
  return {
    id: `${uid}_${appDate}`,
    userId: uid,
    date: appDate,
    appDate,
    dayOfWeek: new Intl.DateTimeFormat("id-ID", { weekday: "long", timeZone: "UTC" })
      .format(new Date(`${appDate}T12:00:00Z`)),
  };
}

function expandPracticeResults(records: JourneyDailyRecord[]): JourneyDailyRecord[] {
  return records.flatMap((record) => {
    const practiceResults = record.practiceResults ?? [];
    if (practiceResults.length === 0) return [record];

    return practiceResults.map((result) => ({
      ...record,
      dominantIssue: result.issue || record.dominantIssue,
      issueCategory: result.issueCategory || record.issueCategory,
      innerworkRecommendation: {
        practiceId: result.practiceId,
        practiceType: result.practiceCategory,
        practiceTitle: result.practiceTitle,
        durationMinutes: result.durationMinutes,
        intensity: record.innerworkRecommendation?.intensity || "",
        reason: record.innerworkRecommendation?.reason || "",
        sourceSignals: record.innerworkRecommendation?.sourceSignals || [],
      },
      innerworkCompletion: {
        completed: true,
        skipped: false,
        completedAt: result.completedAt,
        actualPracticeId: result.practiceId,
        actualPracticeType: result.practiceCategory,
        actualDuration: result.durationMinutes,
        reflectionResult: result.reflectionResult,
        reflectionResponse: result.reflectionResponse,
        practiceHelped: result.practiceHelped,
      },
    }));
  });
}

export const journeyRepository = {
  async ensureDailyRecord(
    uid: string,
    appDate: string,
    initial: Partial<JourneyDailyRecord> = {},
  ): Promise<JourneyDailyRecord> {
    if (canUseLocalAuditStore(uid)) {
      const existing = getLocalDailyRecord(uid, appDate);
      if (existing) return existing;
      const record = createLocalDailyRecord(uid, appDate, initial);
      writeLocalDailyRecord(uid, appDate, record);
      return record;
    }

    await ensureAuthenticatedOwner(uid);
    const path = dailyRecordPath(uid, appDate);
    const ref = dailyRecordDoc(uid, appDate);
    const snapshot = await debugFirestoreOperation(
      { operation: "getDoc", path, uid },
      () => getDoc(ref),
    );
    if (snapshot.exists()) return snapshot.data() as JourneyDailyRecord;

    const now = new Date().toISOString();
    const record: JourneyDailyRecord = {
      id: `${uid}_${appDate}`,
      userId: uid,
      date: appDate,
      appDate,
      dayOfWeek: new Intl.DateTimeFormat("id-ID", { weekday: "long", timeZone: "UTC" })
        .format(new Date(`${appDate}T12:00:00Z`)),
      createdAt: now,
      updatedAt: now,
      dominantIssue: "",
      issueCategory: "",
      navigatorMode: "REFLECTION",
      wellnessState: {},
      dailyScanCompleted: false,
      dailyScanSummary: "",
      catatanSummary: "",
      catatanMainDirection: "",
      catatanChallenge: "",
      catatanOpportunity: "",
      astroSummary: "",
      astroEvents: [],
      profileSignals: [],
      innerworkRecommendation: null,
      innerworkCompletion: defaultCompletion,
      sourceConfidence: 0,
      ...initial,
    };
    await debugFirestoreOperation(
      { operation: "setDoc", path, uid, payloadKeys: Object.keys(record) },
      () => setDoc(ref, sanitizeForFirestore(record)),
    );
    return record;
  },

  async updateDailyRecord(
    uid: string,
    appDate: string,
    patch: Partial<Omit<JourneyDailyRecord, "id" | "userId" | "date" | "appDate" | "createdAt">>,
  ): Promise<void> {
    if (canUseLocalAuditStore(uid)) {
      const current = await this.ensureDailyRecord(uid, appDate);
      writeLocalDailyRecord(uid, appDate, {
        ...current,
        ...patch,
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    await ensureAuthenticatedOwner(uid);
    const payload = sanitizeForFirestore({
      ...createDailyRecordMergeBase(uid, appDate),
      ...patch,
      updatedAt: new Date().toISOString(),
    });
    await debugFirestoreOperation(
      { operation: "setDoc", path: dailyRecordPath(uid, appDate), uid, payloadKeys: Object.keys(payload) },
      () => setDoc(
        dailyRecordDoc(uid, appDate),
        payload,
        { merge: true },
      ),
    );
  },

  async appendPracticeResult(uid: string, appDate: string, result: JourneyPracticeResult): Promise<void> {
    if (canUseLocalAuditStore(uid)) {
      const current = await this.ensureDailyRecord(uid, appDate);
      writeLocalDailyRecord(uid, appDate, {
        ...current,
        practiceResults: [...(current.practiceResults ?? []), result],
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    await ensureAuthenticatedOwner(uid);
    const payload = sanitizeForFirestore({
      ...createDailyRecordMergeBase(uid, appDate),
      practiceResults: arrayUnion(sanitizeForFirestore(result)),
      updatedAt: new Date().toISOString(),
    });
    await debugFirestoreOperation(
      { operation: "setDoc", path: dailyRecordPath(uid, appDate), uid, payloadKeys: Object.keys(payload) },
      () => setDoc(
        dailyRecordDoc(uid, appDate),
        payload,
        { merge: true },
      ),
    );
  },

  async getDailyRecord(uid: string, appDate: string): Promise<JourneyDailyRecord | null> {
    if (canUseLocalAuditStore(uid)) {
      return getLocalDailyRecord(uid, appDate);
    }

    await ensureAuthenticatedOwner(uid);
    const snapshot = await debugFirestoreOperation(
      { operation: "getDoc", path: dailyRecordPath(uid, appDate), uid },
      () => getDoc(dailyRecordDoc(uid, appDate)),
    );
    return snapshot.exists() ? snapshot.data() as JourneyDailyRecord : null;
  },

  async getRecentDailyRecords(uid: string, count: number): Promise<JourneyDailyRecord[]> {
    if (canUseLocalAuditStore(uid)) {
      return getLocalDailyRecords(uid, count);
    }

    await ensureAuthenticatedOwner(uid);
    const snapshot = await debugFirestoreOperation(
      { operation: "getDocs", path: `journeyDailyRecords/${uid}/entries`, uid },
      () => getDocs(query(
        collection(db, "journeyDailyRecords", uid, "entries"),
        orderBy("appDate", "desc"),
        limit(count),
      )),
    );
    return snapshot.docs.map((entry) => entry.data() as JourneyDailyRecord);
  },

  async getDailyMemory(uid: string): Promise<JourneyDailyMemory> {
    const last30Days = await this.getRecentDailyRecords(uid, 30);
    const weeklyLearningRecords = expandPracticeResults(last30Days.slice(0, 7));
    const monthlyLearningRecords = expandPracticeResults(last30Days);
    
    // Calculate V1 Journey Learning Layers
    const weeklyLearning = reflectionEngine.calculateWeeklyLearning(weeklyLearningRecords);
    const monthlyLearning = journeyStoryEngine.calculateMonthlyTheme(monthlyLearningRecords);
    const practiceInsights = calculatePracticeEffectiveness(monthlyLearningRecords);
    const growthNarrative = growthNarrativeEngine.calculateGrowthNarrative(monthlyLearningRecords);
    const coachMemory = journeyNarrativeEngine.generateCoachMemory(monthlyLearningRecords);

    return {
      yesterday: last30Days[0] ?? null,
      last7Days: last30Days.slice(0, 7),
      last30Days,
      weeklyLearning,
      monthlyLearning,
      practiceInsights,
      growthNarrative,
      coachMemory,
    };
  },

  async getRecentDailyStates(uid: string, limitCount: number = 30): Promise<DailyState[]> {
    if (canUseLocalAuditStore(uid)) {
      return getLocalDailyStates(uid, limitCount);
    }

    await ensureAuthenticatedOwner(uid);
    const q = query(
      collection(db, "dailyStates", uid, "entries"),
      orderBy("date", "desc"),
      limit(limitCount)
    );

    const snapshot = await debugFirestoreOperation(
      { operation: "getDocs", path: `dailyStates/${uid}/entries` },
      () => getDocs(q)
    );

    return snapshot.docs.map(doc => doc.data() as DailyState);
  }
};
