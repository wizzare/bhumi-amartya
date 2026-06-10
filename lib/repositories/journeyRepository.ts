import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { DailyState } from "./dailyStateRepository";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";

export const journeyRepository = {
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
