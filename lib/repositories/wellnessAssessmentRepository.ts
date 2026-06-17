import { doc, setDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { AssessmentResult } from "@/lib/engines/assessmentScoringEngine";

export interface WellnessAssessmentDoc {
  uid: string;
  type: "daily" | "weekly" | "monthly";
  assessmentVersion: string;
  timestamp: string;
  responses: { questionId: number; score: number }[];
  dimensionScores: AssessmentResult;
}

const COLLECTION_NAME = "wellnessAssessments";

export const wellnessAssessmentRepository = {
  async saveAssessment(uid: string, data: Omit<WellnessAssessmentDoc, "uid">): Promise<void> {
    const timestamp = new Date().toISOString();
    const docId = `${uid}_${timestamp.replace(/[:.]/g, "-")}`;
    const docRef = doc(db, COLLECTION_NAME, docId);

    await setDoc(docRef, {
      ...data,
      uid,
      timestamp
    });
  },

  async getLatestAssessment(uid: string): Promise<WellnessAssessmentDoc | null> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("uid", "==", uid),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    return snapshot.docs[0].data() as WellnessAssessmentDoc;
  }
};
