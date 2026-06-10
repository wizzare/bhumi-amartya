import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import type { UserHealingProgress } from "@/lib/types/user";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";

function assertAuthenticatedOwner(uid: string): void {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User must be authenticated before accessing healing data.");
  }

  if (currentUser.uid !== uid) {
    throw new Error("Authenticated user does not match requested healing progress.");
  }
}

const healingProgressDoc = (uid: string) => doc(db, "healingProgress", uid);
const healingProgressPath = (uid: string) => `healingProgress/${uid}`;
const healingNotePath = (uid: string, noteId: string) => `healingProgress/${uid}/notes/${noteId}`;

function emptyHealingProgress(): UserHealingProgress {
  return {
    healingStreak: 0,
    totalJournalEntries: 0,
    totalMeditationMinutes: 0,
    totalInnerworkSessions: 0,
    consciousnessLevel: 1,
    updatedAt: new Date().toISOString(),
  };
}

export const healingRepository = {
  async getHealingProgress(uid: string): Promise<UserHealingProgress> {
    assertAuthenticatedOwner(uid);
    const snapshot = await debugFirestoreOperation(
      { operation: "getDoc", path: healingProgressPath(uid), uid },
      () => getDoc(healingProgressDoc(uid)),
    );
    return snapshot.exists()
      ? { ...emptyHealingProgress(), ...(snapshot.data() as Partial<UserHealingProgress>) }
      : emptyHealingProgress();
  },

  async saveHealingProgress(uid: string, data: Partial<UserHealingProgress>): Promise<void> {
    assertAuthenticatedOwner(uid);
    await debugFirestoreOperation(
      { operation: "setDoc", path: healingProgressPath(uid), uid },
      () => setDoc(
        healingProgressDoc(uid),
        sanitizeForFirestore({
          ...data,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true },
      ),
    );
  },

  async saveNote(uid: string, content: string): Promise<void> {
    assertAuthenticatedOwner(uid);
    const noteId = `healing-note-${Date.now()}`;
    await debugFirestoreOperation(
      { operation: "setDoc", path: healingNotePath(uid, noteId), uid },
      () => setDoc(
        doc(db, "healingProgress", uid, "notes", noteId),
        sanitizeForFirestore({
          id: noteId,
          userId: uid,
          content,
          createdAt: new Date().toISOString(),
        }),
      ),
    );
  },
};
