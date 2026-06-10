import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  limit,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import type { MeditationEntry } from "@/lib/meditation/createDailyMeditationPractice";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";

function assertAuthenticatedOwner(uid: string): void {
  if (typeof window === "undefined") return;
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User must be authenticated before accessing meditation data.");
  }

  if (currentUser.uid !== uid) {
    throw new Error("Authenticated user does not match requested meditation data.");
  }
}

const meditationEntriesCollection = (uid: string) =>
  collection(db, "meditations", uid, "entries");
const meditationEntryPath = (uid: string, entryId: string) =>
  `meditations/${uid}/entries/${entryId}`;
const meditationEntriesPath = (uid: string) => `meditations/${uid}/entries`;

export const meditationRepository = {
  async getMeditationEntries(uid: string, limitCount?: number): Promise<MeditationEntry[]> {
    assertAuthenticatedOwner(uid);
    let entriesQuery = query(
      meditationEntriesCollection(uid),
      orderBy("createdAt", "desc")
    );
    if (limitCount) {
      entriesQuery = query(entriesQuery, limit(limitCount));
    }
    const snapshot = await debugFirestoreOperation(
      { operation: "getDocs", path: meditationEntriesPath(uid), uid },
      () => getDocs(entriesQuery)
    );
    return snapshot.docs.map((entryDoc) => entryDoc.data() as MeditationEntry);
  },

  async createMeditationEntry(uid: string, entry: MeditationEntry): Promise<void> {
    assertAuthenticatedOwner(uid);
    const entryRef = doc(meditationEntriesCollection(uid), entry.id);
    await debugFirestoreOperation(
      { operation: "setDoc", path: meditationEntryPath(uid, entry.id), uid },
      () =>
        setDoc(
          entryRef,
          sanitizeForFirestore({
            ...entry,
            userId: uid,
            updatedAt: new Date().toISOString(),
          })
        )
    );
  },

  async updateMeditationEntry(
    uid: string,
    entryId: string,
    data: Partial<MeditationEntry>
  ): Promise<void> {
    assertAuthenticatedOwner(uid);
    const entryRef = doc(meditationEntriesCollection(uid), entryId);
    await debugFirestoreOperation(
      { operation: "setDoc", path: meditationEntryPath(uid, entryId), uid },
      () =>
        setDoc(
          entryRef,
          sanitizeForFirestore({
            ...data,
            userId: uid,
            updatedAt: new Date().toISOString(),
          }),
          { merge: true }
        )
    );
  },

  async deleteMeditationEntry(uid: string, entryId: string): Promise<void> {
    assertAuthenticatedOwner(uid);
    await deleteDoc(doc(meditationEntriesCollection(uid), entryId));
  },

  async saveMeditationEntry(uid: string, entry: MeditationEntry): Promise<void> {
    await this.createMeditationEntry(uid, entry);
  },
};
