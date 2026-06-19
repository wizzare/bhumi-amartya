import { arrayUnion, doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";

export type ZoneAReflectionPayload = {
  uid: string;
  date: string;
  dominantIssue: string;
  issueCategory: string;
  navigatorMode: string;
  practiceId: string;
  practiceType: string;
  practiceTitle: string;
  durationMinutes: number;
  reflectionResult: string;
  reflectionResponse: string;
  sourceSignals: string[];
  createdAt: string;
};

async function assertOwner(uid: string): Promise<void> {
  await auth.authStateReady();
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    throw new Error("Sesi pengguna belum siap untuk menyimpan refleksi.");
  }
}

export const innerworkReflectionRepository = {
  async saveZoneAReflection(payload: ZoneAReflectionPayload): Promise<{ journeySynced: boolean }> {
    await assertOwner(payload.uid);

    const dailyStateRef = doc(db, "dailyStates", payload.uid, "entries", payload.date);
    const journeyRef = doc(db, "journeyDailyRecords", payload.uid, "entries", payload.date);
    await debugFirestoreOperation(
      { operation: "setDoc", path: `dailyStates/${payload.uid}/entries/${payload.date}`, uid: payload.uid },
      () => setDoc(dailyStateRef, sanitizeForFirestore({
      uid: payload.uid,
      date: payload.date,
      innerworkDone: true,
      innerworkReflection: payload.reflectionResult,
      innerworkJourney: {
        date: payload.date,
        userId: payload.uid,
        dominantIssue: payload.dominantIssue,
        issueCategory: payload.issueCategory,
        innerworkType: payload.practiceType,
        practiceId: payload.practiceId,
        practiceTitle: payload.practiceTitle,
        durationMinutes: payload.durationMinutes,
        navigatorMode: payload.navigatorMode,
        completed: true,
        reflectionResult: payload.reflectionResult,
        sourceSignals: payload.sourceSignals,
        createdAt: payload.createdAt,
      },
      updatedAt: payload.createdAt,
      }), { merge: true }),
    );

    const practiceResult = sanitizeForFirestore({
      zone: "A",
      issue: payload.dominantIssue,
      issueCategory: payload.issueCategory,
      practiceId: payload.practiceId,
      practiceCategory: payload.practiceType,
      practiceTitle: payload.practiceTitle,
      durationMinutes: payload.durationMinutes,
      completedAt: payload.createdAt,
      reflectionResult: payload.reflectionResult,
      reflectionResponse: payload.reflectionResponse,
      practiceHelped: payload.reflectionResult === "Lebih Tenang"
        ? true
        : payload.reflectionResult === "Sedikit Lebih Berat"
          ? false
          : null,
    });

    try {
      await debugFirestoreOperation(
        { operation: "setDoc", path: `journeyDailyRecords/${payload.uid}/entries/${payload.date}`, uid: payload.uid },
        () => setDoc(journeyRef, sanitizeForFirestore({
      id: `${payload.uid}_${payload.date}`,
      userId: payload.uid,
      date: payload.date,
      appDate: payload.date,
      dominantIssue: payload.dominantIssue,
      issueCategory: payload.issueCategory,
      navigatorMode: payload.navigatorMode,
      innerworkRecommendation: {
        practiceId: payload.practiceId,
        practiceType: payload.practiceType,
        practiceTitle: payload.practiceTitle,
        durationMinutes: payload.durationMinutes,
        intensity: "guided",
        reason: `Praktik Zone A untuk ${payload.dominantIssue}.`,
        sourceSignals: payload.sourceSignals,
      },
      innerworkCompletion: {
        completed: true,
        skipped: false,
        completedAt: payload.createdAt,
        actualPracticeId: payload.practiceId,
        actualPracticeType: payload.practiceType,
        actualDuration: payload.durationMinutes,
        reflectionResult: payload.reflectionResult,
        reflectionResponse: payload.reflectionResponse,
        practiceHelped: payload.reflectionResult === "Lebih Tenang"
          ? true
          : payload.reflectionResult === "Sedikit Lebih Berat"
            ? false
            : null,
        userFelt: payload.reflectionResult,
      },
      practiceResults: arrayUnion(practiceResult),
      sourceConfidence: 1,
      updatedAt: payload.createdAt,
        }), { merge: true }),
      );
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(`bhumi.pendingZoneAReflection:${payload.uid}:${payload.date}`);
      }
      return { journeySynced: true };
    } catch (error) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          `bhumi.pendingZoneAReflection:${payload.uid}:${payload.date}`,
          JSON.stringify(payload),
        );
      }
      console.warn("[ZONE_A_JOURNEY_SYNC_DEFERRED]", error);
      return { journeySynced: false };
    }
  },

  async retryPending(uid: string, date: string): Promise<boolean> {
    if (typeof window === "undefined") return false;
    const key = `bhumi.pendingZoneAReflection:${uid}:${date}`;
    const raw = window.localStorage.getItem(key);
    if (!raw) return true;
    try {
      const payload = JSON.parse(raw) as ZoneAReflectionPayload;
      const result = await this.saveZoneAReflection(payload);
      return result.journeySynced;
    } catch {
      return false;
    }
  },
};
