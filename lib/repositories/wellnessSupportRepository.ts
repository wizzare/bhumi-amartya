import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { SupportEngineState } from "@/lib/engines/wellnessSupportEngine";

const COLLECTION_NAME = "wellnessSupport";

export const wellnessSupportRepository = {
  async saveSupportState(uid: string, state: SupportEngineState): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, uid);
    await setDoc(docRef, {
      ...state,
      uid,
      version: "v1.0"
    });
  },

  async getSupportState(uid: string): Promise<SupportEngineState | null> {
    const docRef = doc(db, COLLECTION_NAME, uid);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      return snapshot.data() as SupportEngineState;
    }

    return null;
  }
};
