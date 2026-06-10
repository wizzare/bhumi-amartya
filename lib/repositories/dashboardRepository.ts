import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { DashboardData } from "@/lib/data/types";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";

type DashboardStateDocument = {
  dashboard?: DashboardData;
};

function todayKey() {
  return getLocalDateKey();
}

const dashboardDoc = (uid: string) => doc(db, "dailyStates", uid, "entries", todayKey());
const dashboardPath = (uid: string) => `dailyStates/${uid}/entries/${todayKey()}`;

export const dashboardRepository = {
  async getCurrent(uid: string): Promise<DashboardData | null> {
    const snapshot = await debugFirestoreOperation(
      { operation: "getDoc", path: dashboardPath(uid), uid },
      () => getDoc(dashboardDoc(uid)),
    );
    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data() as DashboardStateDocument;
    return data.dashboard || null;
  },

  async saveCurrent(uid: string, data: DashboardData): Promise<void> {
    await debugFirestoreOperation(
      { operation: "setDoc", path: dashboardPath(uid), uid },
      () => setDoc(
        dashboardDoc(uid),
        sanitizeForFirestore({
          dashboard: data,
          userId: uid,
          date: todayKey(),
          updatedAt: new Date().toISOString(),
        }),
        { merge: true },
      ),
    );
  },
};
