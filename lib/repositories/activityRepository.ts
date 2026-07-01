import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
  limit,
  arrayUnion,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";
import { waitForFirebaseAuthOwner } from "@/lib/auth/waitForFirebaseAuthOwner";

export type PhysicalActivityCategory = "yoga" | "workout" | "healthyFood";

export interface PhysicalActivity {
  id: string;
  uid: string;
  category: PhysicalActivityCategory;
  contentId: string;
  title: string;
  completedAt: string;
  localDate: string;
  duration?: number;
  blueprintHash?: string;
  memoryHash?: string;
  sourceVersion: string;
  moodBefore?: number;
  moodAfter?: number;
}

function assertAuthenticatedOwner(uid: string): void {
  if (typeof window === "undefined") return;
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User must be authenticated before accessing activity data.");
  }

  if (currentUser.uid !== uid) {
    throw new Error("Authenticated user does not match requested activity.");
  }
}

const activitiesCollection = (uid: string) =>
  collection(db, "activities", uid, "entries");

const dailyStateDoc = (uid: string, date: string) =>
  doc(db, "dailyStates", uid, "entries", date);
const localActivitiesKey = (uid: string) => `moana:activities:${uid}`;
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

function readLocalJson<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : fallback;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

export const activityRepository = {
  async completeActivity(params: {
    uid: string;
    date: string;
    activity: Omit<PhysicalActivity, "uid" | "localDate" | "completedAt">;
    blueprintHash?: string;
    memoryHash?: string;
  }): Promise<void> {
    const { uid, date, activity, blueprintHash, memoryHash } = params;
    if (canUseLocalAuditStore(uid)) {
      const fullActivity: PhysicalActivity = {
        ...activity,
        uid,
        localDate: date,
        completedAt: new Date().toISOString(),
        blueprintHash,
        memoryHash,
      };
      const activities = readLocalJson<PhysicalActivity[]>(localActivitiesKey(uid), []);
      window.localStorage.setItem(localActivitiesKey(uid), JSON.stringify([fullActivity, ...activities]));

      const previousState = readLocalJson<Record<string, unknown>>(localDailyStateKey(uid, date), {});
      const completedActivityIds = Array.isArray(previousState.completedActivityIds)
        ? [...previousState.completedActivityIds, fullActivity.id]
        : [fullActivity.id];
      window.localStorage.setItem(localDailyStateKey(uid, date), JSON.stringify({
        ...previousState,
        uid,
        date,
        completedActivityIds,
        yogaDone: activity.category === "yoga" ? true : previousState.yogaDone,
        workoutDone: activity.category === "workout" ? true : previousState.workoutDone,
        updatedAt: new Date().toISOString(),
      }));
      return;
    }

    await ensureAuthenticatedOwner(uid);

    const fullActivity: PhysicalActivity = {
      ...activity,
      uid,
      localDate: date,
      completedAt: new Date().toISOString(),
      blueprintHash,
      memoryHash,
    };

    // 1. Save detailed activity record
    const activityRef = doc(activitiesCollection(uid), fullActivity.id);
    await debugFirestoreOperation(
      { operation: "setDoc", path: `activities/${uid}/entries/${fullActivity.id}`, uid },
      () => setDoc(activityRef, sanitizeForFirestore({
        ...fullActivity,
        updatedAt: new Date().toISOString(),
      }))
    );

    // 2. Update Daily State (Build 31.35 Hardening)
    // LIANA V3: Update yogaDone/workoutDone flags for progress tracking
    const updateData: any = {
      uid,
      date,
      completedActivityIds: arrayUnion(fullActivity.id),
      updatedAt: new Date().toISOString(),
    };

    if (activity.category === "yoga") {
      updateData.yogaDone = true;
    } else if (activity.category === "workout") {
      updateData.workoutDone = true;
    }

    await debugFirestoreOperation(
      { operation: "setDoc", path: `dailyStates/${uid}/entries/${date}`, uid },
      () => setDoc(dailyStateDoc(uid, date), updateData, { merge: true })
    );
  },

  async getRecentActivities(uid: string, limitCount = 10): Promise<PhysicalActivity[]> {
    if (canUseLocalAuditStore(uid)) {
      return readLocalJson<PhysicalActivity[]>(localActivitiesKey(uid), []).slice(0, limitCount);
    }

    await ensureAuthenticatedOwner(uid);
    const q = query(
      activitiesCollection(uid),
      orderBy("completedAt", "desc"),
      limit(limitCount)
    );
    const snapshot = await debugFirestoreOperation(
      { operation: "getDocs", path: `activities/${uid}/entries`, uid },
      () => getDocs(q)
    );
    return snapshot.docs.map(doc => doc.data() as PhysicalActivity);
  },

  async getActivitiesByCategory(uid: string, category: PhysicalActivityCategory): Promise<PhysicalActivity[]> {
    if (canUseLocalAuditStore(uid)) {
      return readLocalJson<PhysicalActivity[]>(localActivitiesKey(uid), [])
        .filter((activity) => activity.category === category);
    }

    await ensureAuthenticatedOwner(uid);
    const q = query(
      activitiesCollection(uid),
      where("category", "==", category),
      orderBy("completedAt", "desc")
    );
    const snapshot = await debugFirestoreOperation(
      { operation: "getDocs", path: `activities/${uid}/entries`, uid },
      () => getDocs(q)
    );
    return snapshot.docs.map(doc => doc.data() as PhysicalActivity);
  },

  async getActivitiesByDateRange(uid: string, startDate: string, endDate: string): Promise<PhysicalActivity[]> {
    if (canUseLocalAuditStore(uid)) {
      return readLocalJson<PhysicalActivity[]>(localActivitiesKey(uid), [])
        .filter((activity) => activity.localDate >= startDate && activity.localDate <= endDate);
    }

    await ensureAuthenticatedOwner(uid);
    const q = query(
      activitiesCollection(uid),
      where("localDate", ">=", startDate),
      where("localDate", "<=", endDate),
      orderBy("localDate", "desc")
    );
    const snapshot = await debugFirestoreOperation(
      { operation: "getDocs", path: `activities/${uid}/entries`, uid },
      () => getDocs(q)
    );
    return snapshot.docs.map(doc => doc.data() as PhysicalActivity);
  }
};
// LIANA V3 PATCH
