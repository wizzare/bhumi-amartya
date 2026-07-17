import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";
import { WellnessSnapshot } from "@/lib/data/types";
import { WellnessMapping } from "@/lib/engines/wellnessMappingEngine";
import { waitForFirebaseAuthOwner } from "@/lib/auth/waitForFirebaseAuthOwner";

export type DailyState = {
  uid: string;
  date: string;
  moodLevel?: number | null;
  emotionalWord?: string;
  nervousSystemState?: string;
  groundingDone?: boolean;
  dailyNoteDone?: boolean;
  journalingDone?: boolean;
  assessmentDone?: boolean;
  manifestDone?: boolean;
  supportPathDone?: boolean;
  innerworkDone?: boolean;
  innerworkReflection?: string;
  innerworkJourney?: {
    date: string;
    userId: string;
    dominantIssue: string;
    issueCategory: string;
    innerworkType: string;
    practiceId: string;
    practiceTitle: string;
    durationMinutes: number;
    navigatorMode: string;
    completed: boolean;
    reflectionResult: string;
    sourceSignals: string[];
    createdAt: string;
  };
  meditationDone?: boolean;
  audioHealingDone?: boolean;
  workoutDone?: boolean;
  yogaDone?: boolean;
  herbalDone?: boolean;
  completedActivityIds?: string[]; // Build 31.35 Upgrade
  checkInRevision?: number;
  checkInFingerprint?: string;
  beliefPreferenceRevision?: number;
  wellnessRecommendationPackage?: {
    generatedForLocalDate: string;
    generatedForCheckInRevision: number;
    generatedForBeliefPreferenceRevision?: number;
    eligibilityVersion?: string;
    worldviewPreferenceRevision?: number;
    generatedAt?: string;
    invalidationReason?: string;
    environmentContextRevision?: string;
    astroContextRevision?: string;
    akashiContextRevision?: string;
    environment?: unknown;
    packages: unknown;
  };
  wellnessSnapshot?: WellnessSnapshot; // V3 Addition
  wellnessMapping?: WellnessMapping; // V3.0.2 Consolidation
  dailySummary?: string; // V3.0.2 Summary
  consolidatedAt?: string;
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
const localDailyStateKey = (uid: string, date: string) => `moana:dailyStates:${uid}:${date}`;

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
  assertAuthenticatedOwner(uid);
}

function getLocalDailyState(uid: string, date: string): DailyState | null {
  const stored = window.localStorage.getItem(localDailyStateKey(uid, date));
  if (!stored) return null;
  try {
    return JSON.parse(stored) as DailyState;
  } catch {
    window.localStorage.removeItem(localDailyStateKey(uid, date));
    return null;
  }
}

function saveLocalDailyState(uid: string, date: string, data: Partial<Omit<DailyState, "uid" | "date" | "updatedAt">>): void {
  const previous = getLocalDailyState(uid, date);
  const next: DailyState = {
    ...(previous ?? { uid, date, updatedAt: new Date().toISOString() }),
    ...data,
    uid,
    date,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(localDailyStateKey(uid, date), JSON.stringify(next));
}

export const dailyStateRepository = {
  async getDailyState(uid: string, date: string): Promise<DailyState | null> {
    if (canUseLocalAuditStore(uid)) {
      return getLocalDailyState(uid, date);
    }

    await ensureAuthenticatedOwner(uid);
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
    if (canUseLocalAuditStore(uid)) {
      saveLocalDailyState(uid, date, data);
      return;
    }

    await ensureAuthenticatedOwner(uid);
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

  async markActivityDone(uid: string, date: string, activityKey: keyof Omit<DailyState, "uid" | "date" | "updatedAt" | "completedActivityIds" | "wellnessSnapshot">): Promise<void> {
    await this.saveDailyState(uid, date, { [activityKey]: true });
  },

  async consolidateDay(uid: string, date: string): Promise<void> {
    await ensureAuthenticatedOwner(uid);
    const state = await this.getDailyState(uid, date);
    if (!state) return;

    const { getCompletionSummary } = await import("@/lib/engines/completionEngine");
    const summary = getCompletionSummary(state);

    const theme = state.wellnessMapping?.results[0]?.label || "Normal";
    const dailySummaryText = `Hari ini (${date}) kamu berfokus pada tema ${theme}. Kamu menyelesaikan ${summary.count}/${summary.total} praktik inti harian. ${summary.label}.`;

    await this.saveDailyState(uid, date, {
      dailySummary: dailySummaryText,
      consolidatedAt: new Date().toISOString(),
    });
  }
};
