/**
 * V5-05 Daily Context — Canonical 5-source builder
 *
 * Priority (highest → lowest):
 * 1. User Input  (today's explicit check-in / journal text)
 * 2. Wellness State (metrics, healthCondition, nervousSystem)
 * 3. Confirmed Memory (MemoryCandidate CONFIRMED/CORRECTED, not DISMISSED/PENDING)
 * 4. Astro Synthesis (DailyAstroSynthesis)
 * 5. Environment Context (NormalizedEnvironment)
 *
 * Higher priority never overridden by lower.
 * Output feeds: Catatan Hari Ini, Wellness curation, Panduan Minggu (weeklyGuidance).
 */

import type { WellnessSnapshot } from "@/lib/data/types";
import type { DailyState } from "@/lib/repositories/dailyStateRepository";
import type { MemoryCandidate } from "@/lib/memory/memoryCandidate";
// Build 106: DailyAstroSynthesis is recovered in Step 6 (Astrology). This builder
// only reads astro as a weak 4th-priority source via `as any` casts, so a
// structural stub is sufficient here — reconcile to the real type in Step 6.
type DailyAstroSynthesis = any;
// Use generic for env to avoid coupling to specific Environment type versions
type NormalizedEnvironment = any;

export type UserInputContext = {
  emotionalWord?: string | null;
  todayJournalText?: string | null;
  checkInCompleted?: boolean;
  todayMood?: number | null;
};

export type WellnessContext = {
  snapshot: WellnessSnapshot | null;
  dailyState: DailyState | null;
};

export type DailyContextInput = {
  date: string;
  userInput: UserInputContext;
  wellness: WellnessContext;
  confirmedMemory: MemoryCandidate[]; // only CONFIRMED/CORRECTED
  astro: DailyAstroSynthesis | null;
  environment: NormalizedEnvironment | null;
};

export type DailyContext = {
  date: string;
  resolved: {
    theme: string | null;
    emotionalNeed: string | null;
    physicalNeed: string | null;
    source: "user_input" | "wellness" | "memory" | "astro" | "environment" | "none";
  };
  sources: {
    userInput: UserInputContext;
    wellness: WellnessContext;
    memory: { candidates: MemoryCandidate[]; primaryLabel: string | null };
    astro: DailyAstroSynthesis | null;
    environment: NormalizedEnvironment | null;
  };
  // priority-ordered notes for downstream consumers
  priorityNotes: string[];
  memoryLabel: string | null;
};

function firstNonEmpty(...vals: Array<string | null | undefined>): string | null {
  for (const v of vals) if (v && String(v).trim()) return String(v).trim();
  return null;
}

export function buildDailyContext(input: DailyContextInput): DailyContext {
  const { userInput, wellness, confirmedMemory, astro, environment, date } = input;

  // 1. User Input highest — direct emotionalWord / journal snippet
  const userTheme = firstNonEmpty(userInput.emotionalWord, userInput.todayJournalText?.slice(0, 60));

  // 2. Wellness — snapshot health/energy -> theme is currentIssue already elsewhere; here fallback to snapshot health
  const wellnessTheme = wellness.snapshot ? firstNonEmpty(
    wellness.snapshot.healthCondition && wellness.snapshot.healthCondition !== "normal" ? String(wellness.snapshot.healthCondition) : null,
    wellness.snapshot.lifeSituation?.[0] || null,
  ) : null;

  // 3. Confirmed Memory — most confident candidate's grounded label (already grounded, never diagnostic)
  const primaryMemory = confirmedMemory.length
    ? [...confirmedMemory].sort((a,b)=> b.confidence - a.confidence)[0]
    : null;
  const memoryLabel = primaryMemory ? (primaryMemory.correctedLabel || primaryMemory.label) : null;

  // 4/5 Astro / Env are weak context — only theme tags
  const astroTheme = astro ? (astro as any).summary || (astro as any).sky?.moonPhaseLabel || null : null;
  const envTheme = environment ? (environment as any).weather?.condition || (environment as any).airQuality?.aqi ? String((environment as any).weather?.condition) : null : null;

  // Priority resolution
  let resolvedTheme: string | null = null;
  let source: DailyContext["resolved"]["source"] = "none";
  if (userTheme) { resolvedTheme = userTheme; source = "user_input"; }
  else if (wellnessTheme) { resolvedTheme = wellnessTheme; source = "wellness"; }
  else if (memoryLabel) { resolvedTheme = memoryLabel; source = "memory"; }
  else if (astroTheme) { resolvedTheme = astroTheme; source = "astro"; }
  else if (envTheme) { resolvedTheme = envTheme; source = "environment"; }

  const priorityNotes: string[] = [];
  if (userTheme) priorityNotes.push(`user_input: ${userTheme}`);
  if (wellnessTheme) priorityNotes.push(`wellness: ${wellnessTheme}`);
  if (memoryLabel) priorityNotes.push(`memory: ${memoryLabel}`);
  if (astroTheme) priorityNotes.push(`astro: ${astroTheme}`);
  if (envTheme) priorityNotes.push(`env: ${envTheme}`);

  return {
    date,
    resolved: {
      theme: resolvedTheme,
      emotionalNeed: null, // derived downstream by wellnessContextSynthesis
      physicalNeed: null,
      source,
    },
    sources: {
      userInput,
      wellness,
      memory: { candidates: confirmedMemory, primaryLabel: memoryLabel },
      astro,
      environment,
    },
    priorityNotes,
    memoryLabel,
  };
}

// Helper for downstream: whether memory should influence today (only if not overridden)
export function shouldApplyMemory(context: DailyContext): boolean {
  return context.resolved.source === "memory";
}
