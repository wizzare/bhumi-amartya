/**
 * V5-04 Memory Candidate Contract
 * Journal → Mode-aware extraction → Candidate → Provenance + confidence → User correction → Journey Memory
 *
 * Provenance must distinguish USER FACT vs AI INTERPRETATION vs AI INSIGHT.
 * No AI inference may silently become a User Fact.
 */

import type { JournalType } from "@/lib/data/types";

export type MemoryProvenance = "user-written" | "ai-interpretation" | "ai-insight";

export type MemoryCandidateState = "PENDING" | "CONFIRMED" | "CORRECTED" | "DISMISSED";

export type MemoryCandidateCategory = "recurring_theme" | "preference" | "growth_goal" | "declared_context" | "progress_signal";

export interface MemoryCandidateEvidence {
  entryId: string;
  date: string; // ISO dateKey
  mode: JournalType;
  provenance: MemoryProvenance;
  snippet?: string; // short grounded excerpt, not full raw text unless consented
}

export interface MemoryCandidate {
  id: string; // stable key: e.g., theme slug + mode
  uid: string;
  category: MemoryCandidateCategory;
  // Grounded wording, never diagnostic. Example: "A theme of separation appears..."
  label: string;
  theme: string; // normalized theme slug for aggregation
  originatingModes: JournalType[];
  evidence: MemoryCandidateEvidence[];
  confidence: number; // 0-1, aggregated from evidence count
  provenance: MemoryProvenance; // dominant provenance
  state: MemoryCandidateState;
  extractionTimestamp: string;
  lastSeenAt: string;
  dismissedAt?: string;
  correctedLabel?: string;
  // Decay support (future): pinned prevents decay
  pinned?: boolean;
}

export function groundedThemeLabel(theme: string, count: number, daysSpan: number): string {
  // Grounded, non-diagnostic wording per §6 Pattern Rule
  const t = theme.toLowerCase();
  if (count >= 4) return `Proses ${t} muncul dalam ${count} catatan selama ${daysSpan} hari.`;
  if (count >= 3) return `Tema ${t} terlihat dalam beberapa catatan terakhir.`;
  if (count === 2) return `Sinyal ${t} muncul lebih dari sekali baru-baru ini.`;
  return `Satu catatan tentang ${t} — belum menjadi pola.`;
}

export function computeConfidence(evidenceCount: number): number {
  if (evidenceCount >= 4) return 0.85;
  if (evidenceCount === 3) return 0.65;
  if (evidenceCount === 2) return 0.4;
  return 0.2;
}

export function isPromotable(evidenceCount: number): boolean {
  // Do not promote one-off sentence into durable pattern automatically (§5)
  return evidenceCount >= 3;
}
