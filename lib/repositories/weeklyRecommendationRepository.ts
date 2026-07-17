import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { WeeklyRecommendation } from "../types/communication";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";
import { DateTime } from "luxon";

export class WeeklyRecommendationRepository {
  private static getWeekId(date: Date = new Date(), timezone?: string): string {
    return DateTime.fromJSDate(date, timezone ? { zone: timezone } : undefined).toFormat("kkkk-'W'WW");
  }

  public static async get(uid: string, date: Date = new Date(), timezone?: string): Promise<WeeklyRecommendation | null> {
    const weekId = this.getWeekId(date, timezone);
    const docRef = doc(db, "users", uid, "weeklyRecommendations", weekId);
    const path = `users/${uid}/weeklyRecommendations/${weekId}`;

    const snapshot = await debugFirestoreOperation(
      { operation: "getDoc", path, uid },
      () => getDoc(docRef)
    );

    if (snapshot.exists()) {
      return snapshot.data() as WeeklyRecommendation;
    }
    return null;
  }

  public static async save(recommendation: WeeklyRecommendation): Promise<void> {
    const docRef = doc(db, "users", recommendation.uid, "weeklyRecommendations", recommendation.weekId);
    const path = `users/${recommendation.uid}/weeklyRecommendations/${recommendation.weekId}`;

    await debugFirestoreOperation(
      { operation: "setDoc", path, uid: recommendation.uid },
      () => setDoc(docRef, sanitizeForFirestore(recommendation), { merge: true })
    );
  }
}
