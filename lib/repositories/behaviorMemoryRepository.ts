/**
 * BHUMI V4 — Behavior Memory Repository
 * Sprint E: Recommendation Intelligence
 * Sprint E Hotfix: Atomic Idempotency (Blocker 2)
 *
 * Stores per-user recommendation behavioral signals in Firestore.
 * Path: users/{uid}/behaviorMemory/wellness
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";

export const CONTEXT_HISTORY_MAX_RECORDS = 30;
export const SEASONAL_REINTRODUCTION_DAYS = 21;
const MAX_SEEN_KEYS = 200;

export interface RecommendationMemoryEntry {
  id: string;
  recommendedCount: number;
  completedCount: number;
  skippedCount: number;
  expiredCount: number;
  lastCompletedAt: string | null;
  lastRecommendedAt: string | null;
}

export interface CapacityProfile {
  lowEnergy: { totalDuration: number; count: number };
  medEnergy: { totalDuration: number; count: number };
  highEnergy: { totalDuration: number; count: number };
}

export interface ContextCompletionRecord {
  lifeSituationIds: string[];
  completedIds: string[];
  date: string;
}

export interface BehaviorMemoryDocument {
  uid: string;
  updatedAt: string;
  recommendations: Record<string, RecommendationMemoryEntry>;
  lastSeenAt: Record<string, string>;
  capacityProfile: CapacityProfile;
  contextCompletions: ContextCompletionRecord[];
  seenRecommendationKeys: string[];
}

const BEHAVIOR_MEMORY_DOC_ID = "wellness";

function memoryDocRef(uid: string) {
  return doc(db, "users", uid, "behaviorMemory", BEHAVIOR_MEMORY_DOC_ID);
}

function memoryDocPath(uid: string) {
  return `users/${uid}/behaviorMemory/${BEHAVIOR_MEMORY_DOC_ID}`;
}

export function defaultCapacityProfile(): CapacityProfile {
  return {
    lowEnergy: { totalDuration: 0, count: 0 },
    medEnergy: { totalDuration: 0, count: 0 },
    highEnergy: { totalDuration: 0, count: 0 },
  };
}

function defaultMemoryEntry(id: string): RecommendationMemoryEntry {
  return {
    id,
    recommendedCount: 0,
    completedCount: 0,
    skippedCount: 0,
    expiredCount: 0,
    lastCompletedAt: null,
    lastRecommendedAt: null,
  };
}

export function emptyDocument(uid: string): BehaviorMemoryDocument {
  return {
    uid,
    updatedAt: new Date().toISOString(),
    recommendations: {},
    lastSeenAt: {},
    capacityProfile: defaultCapacityProfile(),
    contextCompletions: [],
    seenRecommendationKeys: [],
  };
}

export const behaviorMemoryRepository = {
  async get(uid: string): Promise<BehaviorMemoryDocument> {
    const ref = memoryDocRef(uid);
    const snapshot = await debugFirestoreOperation(
      { operation: "getDoc", path: memoryDocPath(uid), uid },
      () => getDoc(ref)
    );
    if (snapshot.exists()) {
      const data = snapshot.data() as BehaviorMemoryDocument;
      return {
        ...emptyDocument(uid),
        ...data,
        capacityProfile: {
          ...defaultCapacityProfile(),
          ...(data.capacityProfile ?? {}),
        },
        contextCompletions: data.contextCompletions ?? [],
        seenRecommendationKeys: data.seenRecommendationKeys ?? [],
        lastSeenAt: data.lastSeenAt ?? {},
        recommendations: data.recommendations ?? {},
      };
    }
    return emptyDocument(uid);
  },

  async ensureExists(uid: string): Promise<void> {
    const ref = memoryDocRef(uid);
    const snapshot = await debugFirestoreOperation(
      { operation: "getDoc", path: memoryDocPath(uid), uid },
      () => getDoc(ref)
    );
    if (!snapshot.exists()) {
      await debugFirestoreOperation(
        { operation: "setDoc", path: memoryDocPath(uid), uid },
        () =>
          setDoc(ref, sanitizeForFirestore(emptyDocument(uid)), { merge: true })
      );
    }
  },

  async recordRecommended(
    uid: string,
    ids: string[],
    dateKey: string,
    period: string,
    now: string = new Date().toISOString()
  ): Promise<void> {
    const ref = memoryDocRef(uid);

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);

      const data: BehaviorMemoryDocument = snap.exists()
        ? (snap.data() as BehaviorMemoryDocument)
        : emptyDocument(uid);

      const existingKeys = new Set(data.seenRecommendationKeys ?? []);
      const newKeys: string[] = [];
      const updates: Record<string, unknown> = {};

      for (const id of ids) {
        const key = `${dateKey}:${period}:${id}`;
        if (existingKeys.has(key)) continue;

        newKeys.push(key);
        updates[`recommendations.${id}.recommendedCount`] = increment(1);
        updates[`recommendations.${id}.lastRecommendedAt`] = now;
        updates[`recommendations.${id}.id`] = id;
        updates[`lastSeenAt.${id}`] = now;
      }

      if (newKeys.length === 0) return;

      const allKeys = [...(data.seenRecommendationKeys ?? []), ...newKeys];
      updates["seenRecommendationKeys"] = allKeys.slice(-MAX_SEEN_KEYS);
      updates["updatedAt"] = now;

      if (snap.exists()) {
        transaction.update(ref, updates);
      } else {
        const initRecs: Record<string, RecommendationMemoryEntry> = {};
        for (const id of newKeys.map((k) => k.split(":")[2])) {
          if (!id) continue;
          initRecs[id] = { ...defaultMemoryEntry(id), recommendedCount: 1, lastRecommendedAt: now };
        }
        const initLastSeen: Record<string, string> = {};
        for (const id of newKeys.map((k) => k.split(":")[2])) {
          if (id) initLastSeen[id] = now;
        }
        const initDoc: BehaviorMemoryDocument = {
          ...emptyDocument(uid),
          recommendations: initRecs,
          lastSeenAt: initLastSeen,
          seenRecommendationKeys: allKeys.slice(-MAX_SEEN_KEYS),
          updatedAt: now,
        };
        transaction.set(ref, sanitizeForFirestore(initDoc));
      }
    });
  },

  async recordCompleted(
    uid: string,
    id: string,
    durationMinutes: number,
    energyLevel: number,
    lifeSituationIds: string[],
    dateKey: string,
    now: string = new Date().toISOString()
  ): Promise<void> {
    const ref = memoryDocRef(uid);
    const completionKey = `${dateKey}:${id}:completed`;

    const bucket: keyof CapacityProfile =
      energyLevel < 4
        ? "lowEnergy"
        : energyLevel > 7
        ? "highEnergy"
        : "medEnergy";

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);

      const data: BehaviorMemoryDocument = snap.exists()
        ? (snap.data() as BehaviorMemoryDocument)
        : emptyDocument(uid);

      const seenKeys = new Set(data.seenRecommendationKeys ?? []);
      if (seenKeys.has(completionKey)) return;

      const existingCompletions = data.contextCompletions ?? [];
      const existingIndex = existingCompletions.findIndex((r) => r.date === dateKey);

      let updatedCompletions: ContextCompletionRecord[];
      if (existingIndex >= 0) {
        const existing = existingCompletions[existingIndex];
        const mergedIds = [...new Set([...existing.completedIds, id])];
        updatedCompletions = [...existingCompletions];
        updatedCompletions[existingIndex] = { ...existing, completedIds: mergedIds };
      } else {
        updatedCompletions = [
          ...existingCompletions,
          { lifeSituationIds, completedIds: [id], date: dateKey },
        ];
      }

      const bounded = updatedCompletions.slice(-CONTEXT_HISTORY_MAX_RECORDS);
      const allKeys = [...(data.seenRecommendationKeys ?? []), completionKey];
      const trimmedKeys = allKeys.slice(-MAX_SEEN_KEYS);

      if (snap.exists()) {
        transaction.update(ref, {
          [`recommendations.${id}.completedCount`]: increment(1),
          [`recommendations.${id}.lastCompletedAt`]: now,
          [`recommendations.${id}.id`]: id,
          [`capacityProfile.${bucket}.totalDuration`]: increment(durationMinutes),
          [`capacityProfile.${bucket}.count`]: increment(1),
          contextCompletions: sanitizeForFirestore(bounded),
          seenRecommendationKeys: trimmedKeys,
          updatedAt: now,
        });
      } else {
        const initRec: RecommendationMemoryEntry = {
          ...defaultMemoryEntry(id),
          completedCount: 1,
          lastCompletedAt: now,
        };
        const initCapacity = defaultCapacityProfile();
        initCapacity[bucket].totalDuration = durationMinutes;
        initCapacity[bucket].count = 1;

        const initDoc: BehaviorMemoryDocument = {
          ...emptyDocument(uid),
          recommendations: { [id]: initRec },
          capacityProfile: initCapacity,
          contextCompletions: sanitizeForFirestore(bounded) as ContextCompletionRecord[],
          seenRecommendationKeys: trimmedKeys,
          updatedAt: now,
        };
        transaction.set(ref, sanitizeForFirestore(initDoc));
      }
    });
  },

  async recordSkipped(
    uid: string,
    id: string,
    now: string = new Date().toISOString()
  ): Promise<void> {
    const ref = memoryDocRef(uid);
    await debugFirestoreOperation(
      { operation: "updateDoc", path: memoryDocPath(uid), uid },
      () =>
        updateDoc(ref, {
          [`recommendations.${id}.skippedCount`]: increment(1),
          [`recommendations.${id}.id`]: id,
          updatedAt: now,
        })
    );
  },

  async recordExpired(
    uid: string,
    ids: string[],
    now: string = new Date().toISOString()
  ): Promise<void> {
    if (ids.length === 0) return;
    const fieldsToUpdate: Record<string, unknown> = { updatedAt: now };
    for (const id of ids) {
      fieldsToUpdate[`recommendations.${id}.expiredCount`] = increment(1);
      fieldsToUpdate[`recommendations.${id}.id`] = id;
    }
    const ref = memoryDocRef(uid);
    await debugFirestoreOperation(
      { operation: "updateDoc", path: memoryDocPath(uid), uid },
      () => updateDoc(ref, fieldsToUpdate)
    );
  },
};
