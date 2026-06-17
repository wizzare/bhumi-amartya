import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { NavigatorState } from "@/lib/engines/wellnessNavigatorEngine";

const COLLECTION_NAME = "wellnessNavigator";

export const wellnessNavigatorRepository = {
  async saveNavigatorState(uid: string, state: NavigatorState): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, uid);
    await setDoc(docRef, {
      ...state,
      uid,
      version: "v1.0"
    });
  },

  async getNavigatorState(uid: string): Promise<NavigatorState | null> {
    const docRef = doc(db, COLLECTION_NAME, uid);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      return snapshot.data() as NavigatorState;
    }

    return null;
  }
};
