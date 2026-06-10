import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { AstrologyTransitContext } from "@/lib/orchestrators/types";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";

const currentTransitsDoc = doc(db, "system", "astrology", "transits", "current");
const currentTransitsPath = "system/astrology/transits/current";

export const astrologyRepository = {
  async getCurrentTransits(): Promise<AstrologyTransitContext | null> {
    const snapshot = await debugFirestoreOperation(
      { operation: "getDoc", path: currentTransitsPath },
      () => getDoc(currentTransitsDoc),
    );
    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as AstrologyTransitContext;
  },
};
