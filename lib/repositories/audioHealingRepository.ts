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
import type { AudioHealingEntry } from "@/lib/audioHealing/localAudioHealing";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";

function assertAuthenticatedOwner(uid: string): void {
  if (typeof window === "undefined") return;
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User must be authenticated before accessing audio healing data.");
  }

  if (currentUser.uid !== uid) {
    throw new Error("Authenticated user does not match requested audio healing data.");
  }
}

const audioHealingEntriesCollection = (uid: string) =>
  collection(db, "audioHealing", uid, "entries");
const audioHealingEntryPath = (uid: string, entryId: string) =>
  `audioHealing/${uid}/entries/${entryId}`;
const audioHealingEntriesPath = (uid: string) => `audioHealing/${uid}/entries`;

export const audioHealingRepository = {
  async getAudioHealingEntries(uid: string, limitCount?: number): Promise<AudioHealingEntry[]> {
    assertAuthenticatedOwner(uid);
    let entriesQuery = query(
      audioHealingEntriesCollection(uid),
      orderBy("createdAt", "desc")
    );
    if (limitCount) {
      entriesQuery = query(entriesQuery, limit(limitCount));
    }
    const snapshot = await debugFirestoreOperation(
      { operation: "getDocs", path: audioHealingEntriesPath(uid), uid },
      () => getDocs(entriesQuery)
    );
    return snapshot.docs.map((entryDoc) => entryDoc.data() as AudioHealingEntry);
  },

  async createAudioHealingEntry(uid: string, entry: AudioHealingEntry): Promise<void> {
    assertAuthenticatedOwner(uid);
    const entryRef = doc(audioHealingEntriesCollection(uid), entry.id);
    await debugFirestoreOperation(
      { operation: "setDoc", path: audioHealingEntryPath(uid, entry.id), uid },
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

  async updateAudioHealingEntry(
    uid: string,
    entryId: string,
    data: Partial<AudioHealingEntry>
  ): Promise<void> {
    assertAuthenticatedOwner(uid);
    const entryRef = doc(audioHealingEntriesCollection(uid), entryId);
    await debugFirestoreOperation(
      { operation: "setDoc", path: audioHealingEntryPath(uid, entryId), uid },
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

  async deleteAudioHealingEntry(uid: string, entryId: string): Promise<void> {
    assertAuthenticatedOwner(uid);
    await deleteDoc(doc(audioHealingEntriesCollection(uid), entryId));
  },

  async saveAudioHealingEntry(uid: string, entry: AudioHealingEntry): Promise<void> {
    await this.createAudioHealingEntry(uid, entry);
  },
};
