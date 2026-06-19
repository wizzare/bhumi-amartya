import { arrayUnion, collection, doc, getDoc, query, getDocs, limit, orderBy, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { DailyState } from "./dailyStateRepository";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import type { JourneyDailyMemory, JourneyDailyRecord, JourneyPracticeResult } from "@/lib/types/journeyDailyRecord";
import { reflectionEngine } from "@/lib/engines/reflectionEngine";
import { journeyStoryEngine } from "@/lib/engines/journeyStoryEngine";
import { calculatePracticeEffectiveness } from "@/lib/engines/completionEngine";
import { growthNarrativeEngine } from "@/lib/engines/growthNarrativeEngine";
import { journeyNarrativeEngine } from "@/lib/engines/journeyNarrativeEngine";


const dailyRecordDoc = (uid: string, appDate: string) =>
  doc(db, "journeyDailyRecords", uid, "entries", appDate);

const defaultCompletion = {
  completed: false,
  skipped: true,
  reason: "unknown",
};

export const journeyRepository = {
  async ensureDailyRecord(
    uid: string,
    appDate: string,
    initial: Partial<JourneyDailyRecord> = {},
  ): Promise<JourneyDailyRecord> {
    const ref = dailyRecordDoc(uid, appDate);
    const snapshot = await getDoc(ref);
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
    await setDoc(ref, sanitizeForFirestore(record));
    return record;
  },

  async updateDailyRecord(
    uid: string,
    appDate: string,
    patch: Partial<Omit<JourneyDailyRecord, "id" | "userId" | "date" | "appDate" | "createdAt">>,
  ): Promise<void> {
    await this.ensureDailyRecord(uid, appDate);
    await setDoc(
      dailyRecordDoc(uid, appDate),
      sanitizeForFirestore({ ...patch, updatedAt: new Date().toISOString() }),
      { merge: true },
    );
  },

  async appendPracticeResult(uid: string, appDate: string, result: JourneyPracticeResult): Promise<void> {
    await this.ensureDailyRecord(uid, appDate);
    await setDoc(
      dailyRecordDoc(uid, appDate),
      {
        practiceResults: arrayUnion(sanitizeForFirestore(result)),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  },

  async getDailyRecord(uid: string, appDate: string): Promise<JourneyDailyRecord | null> {
    const snapshot = await getDoc(dailyRecordDoc(uid, appDate));
    return snapshot.exists() ? snapshot.data() as JourneyDailyRecord : null;
  },

  async getRecentDailyRecords(uid: string, count: number): Promise<JourneyDailyRecord[]> {
    const snapshot = await getDocs(query(
      collection(db, "journeyDailyRecords", uid, "entries"),
      orderBy("appDate", "desc"),
      limit(count),
    ));
    return snapshot.docs.map((entry) => entry.data() as JourneyDailyRecord);
  },

  async getDailyMemory(uid: string): Promise<JourneyDailyMemory> {
    const last30Days = await this.getRecentDailyRecords(uid, 30);
    
    // Calculate V1 Journey Learning Layers
    const weeklyLearning = reflectionEngine.calculateWeeklyLearning(last30Days);
    const monthlyLearning = journeyStoryEngine.calculateMonthlyTheme(last30Days);
    const practiceInsights = calculatePracticeEffectiveness(last30Days);
    const growthNarrative = growthNarrativeEngine.calculateGrowthNarrative(last30Days);
    const coachMemory = journeyNarrativeEngine.generateCoachMemory(last30Days);

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
