/**
 * V5-04 Mode-aware Memory Extraction
 * Understands FREE / GUIDED / EMOTION / CBT / SPIRITUAL_AWAKENING differently.
 * Do not treat all entries as identical blobs. Do not invent fields outside canonical model.
 * Crisis content suppresses extraction (safety).
 */

import type { LocalJournalEntry, JournalType } from "@/lib/journal/localJournal";
import { crisisScanJournalText } from "@/lib/journal/journalSafety";
import { canExtractJournalMemory } from "@/lib/journal/privacy";
import type { MemoryCandidateEvidence, MemoryProvenance } from "@/lib/memory/memoryCandidate";

export interface ExtractionSignals {
  theme: string; // normalized lower slug
  rawTheme: string; // display label
  mode: JournalType;
  provenance: MemoryProvenance;
  evidence: MemoryCandidateEvidence;
  // Mode-specific signals for debugging / future aggregation
  signals: Record<string, unknown>;
  suppressed: boolean; // crisis suppressed
}

function normalizeTheme(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 48);
}

function snippet(text: string, max=80): string {
  const s = text.trim().replace(/\s+/g, " ");
  return s.length > max ? s.slice(0, max) + "…" : s;
}

export function extractMemorySignals(
  entry: LocalJournalEntry,
  uid: string,
): ExtractionSignals | null {
  if (!canExtractJournalMemory(entry.privacy)) return null;
  const mode: JournalType = (entry.journalType as JournalType) || "FREE";
  const textForSafety = entry.journalText || entry.theme || "";
  const scan = crisisScanJournalText(textForSafety);
  if (scan.shouldSuppressAI) {
    // Crisis content: preserve safety, suppress AI memory extraction
    return {
      theme: normalizeTheme(entry.theme || "support_needed"),
      rawTheme: entry.theme || "support_needed",
      mode,
      provenance: "user-written",
      evidence: { entryId: entry.id || "unknown", date: entry.date, mode, provenance: "user-written", snippet: snippet(textForSafety, 40) },
      signals: { crisis: true, matched: scan.matchedKeywords },
      suppressed: true,
    };
  }

  const theme = normalizeTheme(entry.theme || "refleksi");
  const rawTheme = entry.theme || "Refleksi";

  // Provenance: journalText is user-written; insight is ai-insight
  // For candidate we store user-written provenance (the entry itself), AI insight is separate
  const baseEvidence: MemoryCandidateEvidence = {
    entryId: entry.id || `entry-${entry.createdAt}`,
    date: entry.date,
    mode,
    provenance: "user-written",
    snippet: snippet(entry.journalText || rawTheme),
  };

  if (mode === "EMOTION") {
    return {
      theme,
      rawTheme,
      mode,
      provenance: "user-written",
      evidence: baseEvidence,
      signals: {
        emotion: entry.emotion?.primaryFeeling,
        bodySignal: entry.emotion?.bodySensation,
        trigger: entry.emotion?.triggerContext,
        need: entry.emotion?.needBehindFeeling,
        contextualTheme: theme,
      },
      suppressed: false,
    };
  }

  if (mode === "CBT") {
    return {
      theme,
      rawTheme,
      mode,
      provenance: "user-written",
      evidence: baseEvidence,
      signals: {
        situation: entry.cbt?.situation,
        thoughts: entry.cbt?.automaticThought,
        emotions: entry.emotion?.primaryFeeling,
        evidenceFor: entry.cbt?.evidenceFor,
        evidenceAgainst: entry.cbt?.evidenceAgainst,
        alternativeThought: entry.cbt?.alternativePerspective,
        action: entry.cbt?.nextStep,
      },
      suppressed: false,
    };
  }

  if (mode === "SPIRITUAL_AWAKENING") {
    return {
      theme,
      rawTheme,
      mode,
      provenance: "user-written",
      evidence: baseEvidence,
      signals: {
        spiritualQuestion: entry.spiritual?.experienceDescription,
        meaning: entry.spiritual?.meaningExplored,
        innerShift: entry.spiritual?.connectionTheme,
        livedExperience: entry.journalText,
      },
      suppressed: false,
    };
  }

  if (mode === "GUIDED") {
    return {
      theme,
      rawTheme,
      mode,
      provenance: "user-written",
      evidence: baseEvidence,
      signals: {
        promptTheme: entry.theme,
        response: entry.guided?.promptResponses?.map(r=>r.answer).join(" ") || entry.journalText,
        recurringSubject: theme,
      },
      suppressed: false,
    };
  }

  // FREE: content-derived signals only
  return {
    theme,
    rawTheme,
    mode,
    provenance: "user-written",
    evidence: baseEvidence,
    signals: {
      contentDerived: true,
      journalTextSnippet: snippet(entry.journalText),
    },
    suppressed: false,
  };
}
