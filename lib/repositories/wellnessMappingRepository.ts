import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { WellnessMapping } from "@/lib/engines/wellnessMappingEngine";

const COLLECTION_NAME = "wellnessMappings";

export const wellnessMappingRepository = {
  async saveMapping(uid: string, mapping: WellnessMapping): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, uid);
    await setDoc(docRef, {
      ...mapping,
      uid,
      version: "v1.0"
    });
  },

  async getMapping(uid: string): Promise<WellnessMapping | null> {
    const docRef = doc(db, COLLECTION_NAME, uid);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      return snapshot.data() as WellnessMapping;
    }

    return null;
  }
};
