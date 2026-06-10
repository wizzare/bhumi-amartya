import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { EmotionalMemory } from "@/lib/data/types";
import { initializeEmotionalMemory } from "@/lib/engines/updateEmotionalMemory";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";

type HealingProgressDocument = {
  emotionalMemory?: EmotionalMemory;
};

const healingProgressDoc = (uid: string) => doc(db, "healingProgress", uid);
const healingProgressPath = (uid: string) => `healingProgress/${uid}`;

export const emotionalMemoryRepository = {
  async getOrCreate(uid: string): Promise<EmotionalMemory> {
    const snapshot = await debugFirestoreOperation(
      { operation: "getDoc", path: healingProgressPath(uid), uid },
      () => getDoc(healingProgressDoc(uid)),
    );
    if (snapshot.exists()) {
      const data = snapshot.data() as HealingProgressDocument;
      if (data.emotionalMemory) {
        return data.emotionalMemory;
      }
    }

    const memory = initializeEmotionalMemory(uid);
    await this.save(uid, memory);
    return memory;
  },

  async save(uid: string, memory: EmotionalMemory): Promise<void> {
    await debugFirestoreOperation(
      { operation: "setDoc", path: healingProgressPath(uid), uid },
      () => setDoc(
        healingProgressDoc(uid),
        sanitizeForFirestore({
          emotionalMemory: {
            ...memory,
            userId: uid,
            updatedAt: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        }),
        { merge: true },
      ),
    );
  },
};
