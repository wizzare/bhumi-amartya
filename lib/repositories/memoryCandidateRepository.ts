/**
 * V5-04 Memory Candidate Repository
 * Firestore: `journalMemoryCandidates/{uid}/candidates/{candidateId}`
 * Local cache: `bhumiMemoryCandidates:{uid}` (offline, reconciles to cloud)
 * States: PENDING | CONFIRMED | CORRECTED | DISMISSED — user-correctable.
 * Dismissed memory is excluded from Journey influence.
 */

import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import type { MemoryCandidate, MemoryCandidateState } from "@/lib/memory/memoryCandidate";
import { computeConfidence, groundedThemeLabel } from "@/lib/memory/memoryCandidate";
import { extractMemorySignals } from "@/lib/journal/journalMemoryExtraction";
import type { LocalJournalEntry } from "@/lib/journal/localJournal";

const CACHE_PREFIX = "bhumiMemoryCandidates";

function getScopedCacheKey(uid: string): string {
  return `${CACHE_PREFIX}:${uid}`;
}

function readLocalCache(uid: string): MemoryCandidate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(getScopedCacheKey(uid));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MemoryCandidate[];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function writeLocalCache(uid: string, candidates: MemoryCandidate[]): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(getScopedCacheKey(uid), JSON.stringify(candidates)); } catch {}
}

function candidateCollection(uid: string) {
  return collection(db, "journalMemoryCandidates", uid, "candidates");
}
function candidateDoc(uid: string, candidateId: string) {
  return doc(db, "journalMemoryCandidates", uid, "candidates", candidateId);
}

function normalizeThemeKey(theme: string): string {
  return theme.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").slice(0, 40) || "theme";
}

function daysSpanOfEvidence(candidates: MemoryCandidate["evidence"]): number {
  if (candidates.length < 2) return 1;
  const dates = candidates.map(e => new Date(e.date).getTime()).filter(n=>!isNaN(n));
  if (dates.length < 2) return 1;
  const min = Math.min(...dates), max = Math.max(...dates);
  return Math.max(1, Math.ceil((max - min) / (24*60*60*1000)) + 1);
}

export const memoryCandidateRepository = {
  /** Get all candidates — prefers Firestore when authenticated, falls back to local cache */
  async getCandidates(uid: string): Promise<MemoryCandidate[]> {
    // Try Firestore
    try {
      if (auth.currentUser?.uid === uid) {
        const snap = await debugFirestoreOperation(
          { operation: "getDocs", path: `journalMemoryCandidates/${uid}/candidates`, uid },
          () => getDocs(candidateCollection(uid)),
        );
        const cloud = snap.docs.map(d => d.data() as MemoryCandidate);
        // Merge to local cache (cloud wins)
        writeLocalCache(uid, cloud);
        return cloud;
      }
    } catch {}
    return readLocalCache(uid);
  },

  /** Get confirmed candidates for DailyContext influence — only CONFIRMED/CORRECTED */
  async getActiveCandidates(uid: string): Promise<MemoryCandidate[]> {
    const all = await this.getCandidates(uid);
    return all.filter(c => c.state === "CONFIRMED" || c.state === "CORRECTED");
  },

  /** All non-dismissed (includes PENDING) — for dashboard listing */
  async getNonDismissedCandidates(uid: string): Promise<MemoryCandidate[]> {
    const all = await this.getCandidates(uid);
    return all.filter(c => c.state !== "DISMISSED");
  },

  /** Upsert from a new journal entry — mode-aware, evidence accumulation */
  async upsertFromEntry(uid: string, entry: LocalJournalEntry): Promise<MemoryCandidate | null> {
    const signals = extractMemorySignals(entry, uid);
    if (!signals || signals.suppressed) return null; // crisis suppressed

    const themeKey = normalizeThemeKey(signals.theme);
    const candidateId = `theme-${themeKey}`;
    const now = new Date().toISOString();

    // Load current (prefer cloud, else local)
    const existing = (await this.getCandidates(uid)).find(c => c.id === candidateId) || null;

    // If dismissed, do not auto-promote — keep dismissed, append evidence but stay dismissed
    if (existing?.state === "DISMISSED") {
      // Append evidence but keep dismissed state (so it does not influence Journey)
      const updated: MemoryCandidate = {
        ...existing,
        evidence: [...existing.evidence, signals.evidence].slice(-10),
        lastSeenAt: now,
        confidence: computeConfidence(existing.evidence.length + 1),
        originatingModes: Array.from(new Set([...existing.originatingModes, signals.mode])),
      };
      await this.saveCandidate(uid, updated);
      return updated;
    }

    if (existing) {
      // Accumulate evidence
      const newEvidence = [...existing.evidence, signals.evidence].slice(-10);
      const span = daysSpanOfEvidence(newEvidence);
      const updated: MemoryCandidate = {
        ...existing,
        evidence: newEvidence,
        originatingModes: Array.from(new Set([...existing.originatingModes, signals.mode])),
        confidence: computeConfidence(newEvidence.length),
        label: groundedThemeLabel(existing.theme, newEvidence.length, span),
        lastSeenAt: now,
        extractionTimestamp: now,
      };
      await this.saveCandidate(uid, updated);
      return updated;
    }

    // New candidate — one-off does not auto-promote but is stored as PENDING
    const evidence = [signals.evidence];
    const candidate: MemoryCandidate = {
      id: candidateId,
      uid,
      category: "recurring_theme",
      theme: signals.theme,
      label: groundedThemeLabel(signals.theme, 1, 1), // grounded, indicates not yet pattern
      originatingModes: [signals.mode],
      evidence,
      confidence: computeConfidence(1),
      provenance: signals.provenance,
      state: "PENDING",
      extractionTimestamp: now,
      lastSeenAt: now,
    };
    await this.saveCandidate(uid, candidate);
    return candidate;
  },

  async saveCandidate(uid: string, candidate: MemoryCandidate): Promise<void> {
    // Always write local cache
    const all = readLocalCache(uid);
    const idx = all.findIndex(c => c.id === candidate.id);
    if (idx >= 0) all[idx] = candidate; else all.push(candidate);
    writeLocalCache(uid, all);

    // Try Firestore
    try {
      if (auth.currentUser?.uid === uid) {
        await debugFirestoreOperation(
          { operation: "setDoc", path: `journalMemoryCandidates/${uid}/candidates/${candidate.id}`, uid },
          () => setDoc(candidateDoc(uid, candidate.id), sanitizeForFirestore(candidate), { merge: true }),
        );
      }
    } catch {}
  },

  async updateState(uid: string, candidateId: string, state: MemoryCandidateState, correctedLabel?: string): Promise<void> {
    const all = await this.getCandidates(uid);
    const c = all.find(x => x.id === candidateId);
    if (!c) throw new Error(`candidate not found: ${candidateId}`);
    const updated: MemoryCandidate = {
      ...c,
      state,
      correctedLabel: state === "CORRECTED" ? (correctedLabel || c.label) : undefined,
      label: state === "CORRECTED" && correctedLabel ? correctedLabel : c.label,
      dismissedAt: state === "DISMISSED" ? new Date().toISOString() : undefined,
    };
    await this.saveCandidate(uid, updated);
  },

  async confirm(uid: string, candidateId: string): Promise<void> { await this.updateState(uid, candidateId, "CONFIRMED"); },
  async correct(uid: string, candidateId: string, correctedLabel: string): Promise<void> { await this.updateState(uid, candidateId, "CORRECTED", correctedLabel); },
  async dismiss(uid: string, candidateId: string): Promise<void> { await this.updateState(uid, candidateId, "DISMISSED"); },

  async deleteCandidate(uid: string, candidateId: string): Promise<void> {
    // Remove from local
    const all = readLocalCache(uid);
    writeLocalCache(uid, all.filter(c => c.id !== candidateId));
    try {
      if (auth.currentUser?.uid === uid) {
        await debugFirestoreOperation(
          { operation: "setDoc", path: `journalMemoryCandidates/${uid}/candidates/${candidateId}`, uid },
          () => deleteDoc(candidateDoc(uid, candidateId)),
        );
      }
    } catch {}
  },

  // For tests: clear local
  _clearLocal(uid: string): void { if (typeof window !== "undefined") window.localStorage.removeItem(getScopedCacheKey(uid)); },
};
