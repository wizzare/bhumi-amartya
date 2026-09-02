import { calculateCurrentSky, type CurrentSky } from "./calculateCurrentSky";
import { selectRelevantWesternEvents, type RelevantWesternEvent } from "./relevantWesternEvents";
import { findNextGlobalEclipse, findNextVisibleEclipse, type EclipseKindInfo, type ObserverLocation } from "./calculateEclipses";
import { calculateTzolkin } from "../tzolkin/calculateTzolkin";
import { calculateWeton } from "../weton/calculateWeton";
import { getCanonicalToday } from "../dailyGuidance/canonicalToday";

// T-ASTRO-04 (D-V5-26): ONE canonical Daily Astro Synthesis.
// Composes the already-proven engines (current sky, relevance contract, dynamic
// eclipses, current-day Tzolkin/Weton) into a single shared context object that
// AstroTodayCard renders and Wellness / Catatan Hari Ini / Panduan Minggu Ini
// consume as a contextual LENS (R-PRD-36/41) — never diagnosis, never override.

export const ASTRO_SYNTHESIS_SOURCE_VERSION = "v5-synthesis-1";

export interface SynthesisMoonPhase {
  label: string;
  sign?: string;
  theme: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  phaseAngle: number;
}

export interface SynthesisEclipses {
  globalNext: EclipseKindInfo | null;
  /** Same event as globalNext when reliable coordinates exist; otherwise null. */
  localVisible: EclipseKindInfo | null;
  localAvailable: boolean;
}

export interface SynthesisEastern {
  tzolkin: { kin: number; kinName: string; wavespellName: string; wavespellMeaning: string } | null;
  weton: { weton: string; pasaran: string } | null;
}

export interface DailyAstroSynthesis {
  dateKey: string;
  timezone: string;
  calculationInstant: Date;
  sky: CurrentSky;
  moonPhase: SynthesisMoonPhase;
  westernEvents: RelevantWesternEvent[];
  eastern: SynthesisEastern;
  eclipses: SynthesisEclipses;
  /**
   * Major-cycle scope beyond eclipses is OPEN (handover §5.4 / D-V5-26):
   * only canonical signals already defined in V5 may appear here. Do not invent.
   */
  majorCycles: { openScope: true };
  sourceVersion: string;
}

export interface BuildSynthesisInput {
  uid?: string;
  profileTimezone?: string | null;
  browserTimezone?: string;
  now?: Date;
  observer?: ObserverLocation | null;
}

function safe<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}

export function buildDailyAstroSynthesis(input: BuildSynthesisInput = {}): DailyAstroSynthesis {
  const canonical = getCanonicalToday({
    uid: input.uid ?? "",
    profileTimezone: input.profileTimezone,
    browserTimezone: input.browserTimezone,
    now: input.now,
  });

  const sky = calculateCurrentSky(canonical.calculationInstant);
  const westernEvents = selectRelevantWesternEvents(sky);
  const moon = sky.bodies.find((b) => b.body === "Moon");

  const tzolkin = safe(() => {
    const t = calculateTzolkin({ birthDate: canonical.localDateKey });
    return { kin: t.kin, kinName: t.kinName, wavespellName: t.wavespell.name, wavespellMeaning: t.wavespell.meaning };
  });
  const weton = safe(() => {
    const w = calculateWeton({ birthDate: canonical.localDateKey });
    return { weton: w.weton, pasaran: w.pasaran };
  });

  const globalNext = findNextGlobalEclipse(canonical.calculationInstant);
  const visible = input.observer ? findNextVisibleEclipse(canonical.calculationInstant, input.observer) : null;

  return {
    dateKey: canonical.localDateKey,
    timezone: canonical.timezone,
    calculationInstant: canonical.calculationInstant,
    sky,
    moonPhase: {
      label: sky.moonInfo.label,
      sign: moon?.sign,
      theme: sky.moonInfo.theme,
      startDate: sky.moonInfo.startDate,
      endDate: sky.moonInfo.endDate,
      daysRemaining: sky.moonInfo.daysRemaining,
      phaseAngle: sky.moonPhaseAngle,
    },
    westernEvents,
    eastern: { tzolkin, weton },
    eclipses: {
      globalNext,
      localVisible: visible?.visibleAtObserver ? visible.global : null,
      // Honest unavailability per D-V5-29: without reliable location data we do NOT invent visibility.
      localAvailable: !!visible && visible.visibleAtObserver,
    },
    majorCycles: { openScope: true },
    sourceVersion: ASTRO_SYNTHESIS_SOURCE_VERSION,
  };
}

/** T-ASTRO-09 adapter: aggregated summary for weekly guidance — lens only, no dump. */
export function weeklyAstroContextFromSynthesis(synthesis: DailyAstroSynthesis) {
  return {
    dateKey: synthesis.dateKey,
    moonPhaseLabel: synthesis.moonPhase.label,
    relevantEventCount: synthesis.westernEvents.length,
    retrogradeBodies: [...new Set(synthesis.westernEvents.filter((e) => e.isRetrograde).map((e) => e.body))],
    eclipseNearby: !!synthesis.eclipses.globalNext,
  };
}

/** Canonical major-aspect names used for wellness tags — mirrors relevantWesternEvents. */
const ASPECT_TAG_NAMES = ["conjunction", "sextile", "square", "trine", "opposition"] as const;

/**
 * T-ASTRO-07 adapter: maps the synthesis onto the exact astroContext shape consumed by
 * selectWellnessPackages scoring (wellnessRecommendationEngine.ts EnvironmentalContext).
 * Lens only: tags describe the sky, never the user's condition.
 */
export function astroContextFromSynthesis(synthesis: DailyAstroSynthesis): NonNullable<import("../engines/wellnessRecommendationEngine").EnvironmentalContext["astroContext"]> {
  const retrogradeTags = synthesis.westernEvents.filter((e) => e.isRetrograde).map((e) => `${e.body}-retrograde`);
  const ingressTags = synthesis.westernEvents.filter((e) => e.reasons.some((r) => r.type === "ingress")).map((e) => `${e.body}-ingress`);
  const aspectTags = synthesis.westernEvents.flatMap((e) => e.aspects.map((a) => `${e.body}-${a.aspect}-${a.partner}`));
  const intensity: "low" | "moderate" | "high" =
    synthesis.westernEvents.length >= 6 ? "high" : synthesis.westernEvents.length >= 2 ? "moderate" : "low";
  return {
    moonPhase: synthesis.moonPhase.label,
    moonSign: synthesis.moonPhase.sign ?? undefined,
    majorTransitTags: synthesis.westernEvents.slice(0, 5).map((e) => `${e.body}-in-${e.sign.toLowerCase()}`),
    retrogradeTags: [...new Set(retrogradeTags)],
    ingressTags: [...new Set(ingressTags)],
    aspectTags: [...new Set(aspectTags)].filter((tag) => ASPECT_TAG_NAMES.some((name) => tag.includes(name))),
    astroIntensity: intensity,
    astroTheme: synthesis.eclipses.globalNext ? "eclipse-window-nearby" : undefined,
    validForLocalDate: synthesis.dateKey,
    sourceVersion: ASTRO_SYNTHESIS_SOURCE_VERSION,
  };
}
