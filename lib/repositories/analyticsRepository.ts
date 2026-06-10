import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { AnalyticsEventName } from "@/lib/analytics/usageAnalytics";

export const analyticsRepository = {
  async trackEvent(eventName: AnalyticsEventName, uid: string | null): Promise<void> {
    try {
      await addDoc(collection(db, "analytics"), {
        eventName,
        uid,
        timestamp: serverTimestamp(),
        date: new Date().toISOString().slice(0, 10),
      });
    } catch (error) {
      console.error("[Analytics Repository] Failed to track event:", error);
    }
  }
};
