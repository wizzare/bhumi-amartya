import { collection, query, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

export interface GoogleSignInFailureEvent {
  id: string;
  eventType: string;
  category: string;
  code: string | number | null;
  stage: string;
  message: string;
  appVersion: string;
  versionCode: number;
  platform: string;
  androidVersion: string | null;
  deviceModel: string | null;
  locale: string;
  credentialManagerEnabled: boolean | null;
  timestamp: Timestamp;
  uid: string | null;
}

export const diagnosticRepository = {
  async getGoogleSignInFailures(pageSize = 50): Promise<GoogleSignInFailureEvent[]> {
    try {
      const q = query(
        collection(db, "analytics"),
        orderBy("timestamp", "desc"),
        limit(pageSize)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map(d => ({ ...d.data(), id: d.id } as any))
        .filter((event: any) => event.eventType === "google_signin_failed");
    } catch (error) {
      console.error("[Diagnostic Repository] Failed to fetch failures:", error);
      return [];
    }
  }
};
