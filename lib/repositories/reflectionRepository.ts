import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";

export interface WeeklyReflection {
  uid: string;
  weekId: string; // YYYY-Wxx
  startDate: string;
  endDate: string;
  theme: string;
  lessons: string[];
  smallWins: string[];
  mainChallenge: string;
  focusNextWeek: string;
  soulSummary: string;
  generatedAt: string;
}

export const reflectionRepository = {
  async getWeeklyReflection(uid: string, weekId: string): Promise<WeeklyReflection | null> {
    const docRef = doc(db, "weeklyReflections", `${uid}_${weekId}`);
    const snapshot = await debugFirestoreOperation(
      { operation: "getDoc", path: `weeklyReflections/${uid}_${weekId}`, uid },
      () => getDoc(docRef)
    );
    return snapshot.exists() ? (snapshot.data() as WeeklyReflection) : null;
  },

  async saveWeeklyReflection(data: WeeklyReflection): Promise<void> {
    const docRef = doc(db, "weeklyReflections", `${data.uid}_${data.weekId}`);
    await debugFirestoreOperation(
      { operation: "setDoc", path: `weeklyReflections/${data.uid}_${data.weekId}`, uid: data.uid },
      () => setDoc(docRef, sanitizeForFirestore(data), { merge: true })
    );
  },

  async getRecentWeeklyReflections(uid: string, limitCount: number = 4): Promise<WeeklyReflection[]> {
    const q = query(
      collection(db, "weeklyReflections"),
      where("uid", "==", uid),
      orderBy("weekId", "desc"),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as WeeklyReflection);
  }
};
