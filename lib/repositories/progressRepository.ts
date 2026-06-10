import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/config";
import type { ProgressMetrics } from "@/lib/engines/progressCalculationEngine";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";

function assertAuthenticatedOwner(uid: string): void {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User must be authenticated before accessing progress data.");
  }

  if (currentUser.uid !== uid) {
    throw new Error("Authenticated user does not match requested progress data.");
  }
}

const progressDataDoc = (uid: string) => doc(db, "progressData", uid);
const progressDataPath = (uid: string) => `progressData/${uid}`;

export const progressRepository = {
  async getProgressData(uid: string): Promise<ProgressMetrics | null> {
    assertAuthenticatedOwner(uid);
    const snapshot = await debugFirestoreOperation(
      { operation: "getDoc", path: progressDataPath(uid), uid },
      () => getDoc(progressDataDoc(uid))
    );

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as ProgressMetrics;
  },

  async saveProgressData(uid: string, metrics: ProgressMetrics): Promise<void> {
    assertAuthenticatedOwner(uid);
    await debugFirestoreOperation(
      { operation: "setDoc", path: progressDataPath(uid), uid },
      () =>
        setDoc(
          progressDataDoc(uid),
          sanitizeForFirestore({
            ...metrics,
            userId: uid,
            updatedAt: new Date().toISOString(),
          })
        )
    );
  },
};
