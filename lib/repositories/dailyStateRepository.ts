import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";

export type DailyState = {
  uid: string;
  date: string;
  moodLevel?: number | null;
  emotionalWord?: string;
  nervousSystemState?: string;
  groundingDone?: boolean;
  journalingDone?: boolean;
  meditationDone?: boolean;
  audioHealingDone?: boolean;
  workoutDone?: boolean;
  yogaDone?: boolean;
  herbalDone?: boolean;
  completedActivityIds?: string[]; // Build 31.35 Upgrade
  updatedAt: string;
};

function assertAuthenticatedOwner(uid: string): void {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User must be authenticated before accessing daily state.");
  }

  if (currentUser.uid !== uid) {
    throw new Error("Authenticated user does not match requested daily state.");
  }
}

const dailyStateDoc = (uid: string, date: string) =>
  doc(db, "dailyStates", uid, "entries", date);
const dailyStatePath = (uid: string, date: string) => `dailyStates/${uid}/entries/${date}`;

export const dailyStateRepository = {
  async getDailyState(uid: string, date: string): Promise<DailyState | null> {
    assertAuthenticatedOwner(uid);
    const snapshot = await debugFirestoreOperation(
      { operation: "getDoc", path: dailyStatePath(uid, date), uid },
      () => getDoc(dailyStateDoc(uid, date)),
    );
    return snapshot.exists() ? (snapshot.data() as DailyState) : null;
  },

  async saveDailyState(
    uid: string,
    date: string,
    data: Partial<Omit<DailyState, "uid" | "date" | "updatedAt">>,
  ): Promise<void> {
    assertAuthenticatedOwner(uid);
    await debugFirestoreOperation(
      { operation: "setDoc", path: dailyStatePath(uid, date), uid },
      () => setDoc(
        dailyStateDoc(uid, date),
        sanitizeForFirestore({
          ...data,
          uid,
          date,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true },
      ),
    );
  },
};
