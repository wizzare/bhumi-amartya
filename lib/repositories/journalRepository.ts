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
import type { JournalEntry } from "@/lib/data/types";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";

function assertAuthenticatedOwner(uid: string): void {
  if (typeof window === "undefined") return;
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User must be authenticated before accessing journal data.");
  }

  if (currentUser.uid !== uid) {
    throw new Error("Authenticated user does not match requested journal.");
  }
}

const journalEntriesCollection = (uid: string) =>
  collection(db, "journals", uid, "entries");
const journalEntryPath = (uid: string, entryId: string) => `journals/${uid}/entries/${entryId}`;
const journalEntriesPath = (uid: string) => `journals/${uid}/entries`;

export const journalRepository = {
  async getJournalEntries(uid: string, limitCount?: number): Promise<JournalEntry[]> {
    assertAuthenticatedOwner(uid);
    let entriesQuery = query(journalEntriesCollection(uid), orderBy("dateCreated", "desc"));
    if (limitCount) {
      entriesQuery = query(entriesQuery, limit(limitCount));
    }
    const snapshot = await debugFirestoreOperation(
      { operation: "getDocs", path: journalEntriesPath(uid), uid },
      () => getDocs(entriesQuery),
    );
    return snapshot.docs.map((entryDoc) => entryDoc.data() as JournalEntry);
  },

  async createJournalEntry(uid: string, entry: JournalEntry): Promise<void> {
    assertAuthenticatedOwner(uid);
    const entryRef = doc(journalEntriesCollection(uid), entry.id);
    await debugFirestoreOperation(
      { operation: "setDoc", path: journalEntryPath(uid, entry.id), uid },
      () => setDoc(entryRef, sanitizeForFirestore({
        ...entry,
        userId: uid,
        updatedAt: new Date().toISOString(),
      })),
    );
  },

  async updateJournalEntry(
    uid: string,
    entryId: string,
    data: Partial<JournalEntry>,
  ): Promise<void> {
    assertAuthenticatedOwner(uid);
    const entryRef = doc(journalEntriesCollection(uid), entryId);
    await debugFirestoreOperation(
      { operation: "setDoc", path: journalEntryPath(uid, entryId), uid },
      () => setDoc(
        entryRef,
        sanitizeForFirestore({
          ...data,
          userId: uid,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true },
      ),
    );
  },

  async deleteJournalEntry(uid: string, entryId: string): Promise<void> {
    assertAuthenticatedOwner(uid);
    await deleteDoc(doc(journalEntriesCollection(uid), entryId));
  },

  async saveEntry(uid: string, entry: JournalEntry): Promise<void> {
    await this.createJournalEntry(uid, entry);
  },
};
