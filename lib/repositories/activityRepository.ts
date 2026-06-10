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

export const activityRepository = {
  async completeActivity(params: {
    uid: string;
    date: string;
    activity: Omit<PhysicalActivity, "uid" | "localDate" | "completedAt">;
    blueprintHash?: string;
    memoryHash?: string;
  }): Promise<void> {
    const { uid, date, activity, blueprintHash, memoryHash } = params;
    assertAuthenticatedOwner(uid);

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
    const updateData: any = {
      completedActivityIds: arrayUnion(fullActivity.id),
      updatedAt: new Date().toISOString(),
    };

    // Backward compatibility flags
    if (activity.category === "yoga") updateData.yogaDone = true;
    if (activity.category === "workout") updateData.workoutDone = true;
    if (activity.category === "healthyFood") updateData.herbalDone = true;

    await debugFirestoreOperation(
      { operation: "setDoc", path: `dailyStates/${uid}/entries/${date}`, uid },
      () => setDoc(dailyStateDoc(uid, date), updateData, { merge: true })
    );
  },

  async getRecentActivities(uid: string, limitCount = 10): Promise<PhysicalActivity[]> {
    assertAuthenticatedOwner(uid);
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
    assertAuthenticatedOwner(uid);
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
    assertAuthenticatedOwner(uid);
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
