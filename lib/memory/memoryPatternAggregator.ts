/**
 * Pattern Aggregator — grounded wording, no diagnosis.
 * Filters candidates to promotable patterns (3+ evidence) unless pinned.
 * Dismissed candidates excluded.
 */

import type { MemoryCandidate } from "./memoryCandidate";
import { isPromotable } from "./memoryCandidate";

export interface JourneyMemoryPattern {
  theme: string;
  label: string; // grounded, e.g. "Proses pelepasan muncul dalam 4 catatan selama 9 hari."
  evidenceCount: number;
  daysSpan: number;
  originatingModes: string[];
  confidence: number;
  lastSeenAt: string;
  candidateId: string;
  state: MemoryCandidate["state"];
}

export const MEMORY_DECAY_DAYS = 90;

export function isCandidateWithinRetention(
  candidate: MemoryCandidate,
  now = new Date(),
  decayDays = MEMORY_DECAY_DAYS,
): boolean {
  if (candidate.pinned) return true;
  const lastSeen = new Date(candidate.lastSeenAt);
  if (Number.isNaN(lastSeen.getTime())) return false;
  const ageMs = now.getTime() - lastSeen.getTime();
  return ageMs <= decayDays * 24 * 60 * 60 * 1000;
}

export function aggregateForJourney(candidates: MemoryCandidate[], now = new Date()): JourneyMemoryPattern[] {
  return candidates
    .filter(c => c.state !== "DISMISSED")
    .filter(c => isCandidateWithinRetention(c, now))
    .filter(c => isPromotable(c.evidence.length) || c.pinned)
    .map(c => ({
      theme: c.theme,
      label: c.correctedLabel || c.label,
      evidenceCount: c.evidence.length,
      daysSpan: (() => {
        if (c.evidence.length < 2) return 1;
        const dates = c.evidence.map(e=> new Date(e.date).getTime()).filter(n=>!isNaN(n));
        if (dates.length<2) return 1;
        return Math.max(1, Math.ceil((Math.max(...dates)-Math.min(...dates))/(24*60*60*1000))+1);
      })(),
      originatingModes: c.originatingModes as string[],
      confidence: c.confidence,
      lastSeenAt: c.lastSeenAt,
      candidateId: c.id,
      state: c.state,
    }))
    .sort((a,b)=> b.confidence - a.confidence || b.evidenceCount - a.evidenceCount);
}

export function conciseJourneyNote(pattern: JourneyMemoryPattern, locale: "id"|"en"|"ms"="id"): string {
  if (locale==="en") return `Theme "${pattern.theme}" appeared in ${pattern.evidenceCount} entries over ${pattern.daysSpan} days.`;
  if (locale==="ms") return `Tema "${pattern.theme}" muncul dalam ${pattern.evidenceCount} catatan selama ${pattern.daysSpan} hari.`;
  return pattern.label;
}
