import { doc, getDoc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import { longitudinalWellnessEngine } from "@/lib/engines/longitudinalWellnessEngine";
import type { LongitudinalWellnessDocument, WellnessEventInput } from "@/lib/types/longitudinalWellness";

const DOCUMENT_ID = "current";

function documentRef(uid: string) {
  return doc(db, "users", uid, "longitudinalWellness", DOCUMENT_ID);
}

export function emptyLongitudinalWellnessDocument(uid: string, now = new Date()): LongitudinalWellnessDocument {
  return {
    uid,
    updatedAt: now.toISOString(),
    events: [],
    snapshot: longitudinalWellnessEngine.observe([], now),
  };
}

export const longitudinalWellnessRepository = {
  async get(uid: string): Promise<LongitudinalWellnessDocument> {
    const snapshot = await getDoc(documentRef(uid));
    if (!snapshot.exists()) return emptyLongitudinalWellnessDocument(uid);
    const stored = snapshot.data() as Partial<LongitudinalWellnessDocument>;
    const events = Array.isArray(stored.events) ? stored.events : [];
    return {
      uid,
      updatedAt: stored.updatedAt || new Date().toISOString(),
      events,
      snapshot: stored.snapshot || longitudinalWellnessEngine.observe(events),
    };
  },

  async recordEvent(uid: string, input: WellnessEventInput): Promise<void> {
    const ref = documentRef(uid);
    await runTransaction(db, async (transaction) => {
      const stored = await transaction.get(ref);
      const current = stored.exists()
        ? (stored.data() as LongitudinalWellnessDocument)
        : emptyLongitudinalWellnessDocument(uid);
      const event = longitudinalWellnessEngine.normalizeEvent(input);
      const deduplicated = (current.events || []).filter((item) => item.eventId !== event.eventId);
      const events = longitudinalWellnessEngine.retain([...deduplicated, event]);
      const now = new Date();
      transaction.set(ref, sanitizeForFirestore({
        uid,
        updatedAt: now.toISOString(),
        events,
        snapshot: longitudinalWellnessEngine.observe(events, now),
      }));
    });
  },
};
