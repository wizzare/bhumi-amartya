import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import type { DailyGuidance, DailyGuidancePractice } from "@/lib/dailyGuidance/types";

function assertAuthenticatedOwner(uid: string): void {
  if (typeof window === "undefined") return;
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User must be authenticated before accessing daily guidance.");
  if (currentUser.uid !== uid) throw new Error("Authenticated user does not match requested daily guidance.");
}

export function dailyGuidanceDocId(uid: string, date: string): string {
  return `${uid}_${date.replaceAll("-", "_")}`;
}

const dailyGuidanceDoc = (uid: string, date: string) =>
  doc(db, "dailyGuidance", dailyGuidanceDocId(uid, date));

export const dailyGuidancePath = (uid: string, date: string) =>
  `dailyGuidance/${dailyGuidanceDocId(uid, date)}`;

export const dailyGuidanceRepository = {
  async getDailyGuidance(uid: string, date: string): Promise<DailyGuidance | null> {
    assertAuthenticatedOwner(uid);
    const snapshot = await debugFirestoreOperation(
      { operation: "getDoc", path: dailyGuidancePath(uid, date), uid },
      () => getDoc(dailyGuidanceDoc(uid, date)),
    );
    return snapshot.exists() ? (snapshot.data() as DailyGuidance) : null;
  },

  async saveDailyGuidance(guidance: DailyGuidance): Promise<void> {
    assertAuthenticatedOwner(guidance.uid);
    console.log("[DAILY_GUIDANCE_FIRESTORE_WRITE]", {
      uid: guidance.uid,
      date: guidance.date,
      path: dailyGuidancePath(guidance.uid, guidance.date),
      schemaVersion: guidance.schemaVersion ?? null,
      promptVersion: guidance.generatedWithPromptVersion ?? null,
    });
    await debugFirestoreOperation(
      { operation: "setDoc", path: dailyGuidancePath(guidance.uid, guidance.date), uid: guidance.uid },
      () => setDoc(
        dailyGuidanceDoc(guidance.uid, guidance.date),
        sanitizeForFirestore(guidance),
      ),
    );
  },

  async getRecentGuidance(uid: string, count = 7): Promise<DailyGuidance[]> {
    assertAuthenticatedOwner(uid);
    const snapshot = await debugFirestoreOperation(
      { operation: "getDocs(query)", path: "dailyGuidance", uid },
      () => getDocs(
        query(
          collection(db, "dailyGuidance"),
          where("uid", "==", uid),
          orderBy("date", "desc"),
          limit(count),
        ),
      ),
    );
    return snapshot.docs.map((entry) => entry.data() as DailyGuidance);
  },

  async updateDailyPracticeProgress(
    uid: string,
    date: string,
    practices: DailyGuidancePractice[],
  ): Promise<void> {
    assertAuthenticatedOwner(uid);
    await debugFirestoreOperation(
      { operation: "setDoc", path: dailyGuidancePath(uid, date), uid },
      () => setDoc(
        dailyGuidanceDoc(uid, date),
        sanitizeForFirestore({
          uid,
          dailyPractices: practices,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true },
      ),
    );
  },
};
