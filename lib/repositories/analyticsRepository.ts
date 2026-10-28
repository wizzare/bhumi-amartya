import { collection, addDoc, serverTimestamp, type Firestore } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { AnalyticsEventName } from "@/lib/analytics/usageAnalytics";

export const analyticsRepository = {
  async trackEvent(
    eventName: AnalyticsEventName,
    uid: string | null,
    firestoreDb?: Firestore
  ): Promise<void> {
    const targetDb = firestoreDb || db;
    try {
      await addDoc(collection(targetDb, "analytics"), {
        eventName,
        uid,
        timestamp: serverTimestamp(),
        date: new Date().toISOString().slice(0, 10),
      });
    } catch (error: any) {
      const isAlreadyExists =
        error?.code === "already-exists" ||
        String(error?.message || "").includes("Document already exists");

      if (isAlreadyExists) {
        console.warn(
          `[Analytics Repository] Document already exists (idempotent write replay acknowledged): ${eventName}`
        );
        return;
      }

      console.warn("[Analytics Repository] Best-effort telemetry write failed:", error?.message || error);
    }
  }
};
