import { WellnessSnapshot } from "@/lib/data/types";
import { WELLNESS_RECOMMENDATION_LIBRARY, type WellnessRecommendation as LibraryRecommendation } from "@/lib/data/wellnessRecommendationLibrary";
import { scoreLifeSituationFit, type LifeSituationContext } from "@/lib/intelligence/lifeSituationIntelligence";
import type { PreferenceWeightMap } from "@/lib/intelligence/recommendationPreferenceEngine";
import type { CapacityAdjustmentMap } from "@/lib/intelligence/recommendationCapacityEngine";
import type { ContextBoostMap } from "@/lib/intelligence/recommendationContextEngine";
import type { AkashiWellnessContext } from "@/lib/intelligence/wellnessAkashiContext";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";

export type RecommendationPeriod = "morning" | "afternoon" | "evening";
export type RecommendationPriority = "PRIMARY" | "SECONDARY" | "OPTIONAL" | "MICRO";
export const RECOMMENDATION_ELIGIBILITY_VERSION = "r3-universal-2026-07-16-v2";

export interface UserWellnessPreferences {
  preferredDomains?: string[];
  preferredIds?: string[];
  worldviewScopes?: Array<"UNIVERSAL" | "SPIRITUAL_NEUTRAL" | "TRADITION_SPECIFIC" | "CULTURAL_RITUAL">;
  traditionTags?: string[];
  allowSpiritualContent?: boolean;
  respiratorySensitivity?: boolean;
  indoorVentilation?: "good" | "unknown" | "poor";
  fireSafe?: boolean;
  allowAstroContext?: boolean;
}

export interface RecommendationHistoryItem {
  recommendationId: string;
  completedAt: string;
  period?: RecommendationPeriod;
}

export interface EnvironmentalContext {
  weather?: LibraryRecommendation["weather"];
  indoorOutdoor?: LibraryRecommendation["indoorOutdoor"];
  localDate?: string;
  dayOfWeek?: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  isWeekday?: boolean;
  isWeekend?: boolean;
  weatherCondition?: string;
  temperatureLevel?: "normal" | "hot" | "extreme" | "unknown";
  precipitationLevel?: "none" | "rain" | "heavy_rain" | "storm" | "unknown";
  airQualityLevel?: "good" | "moderate" | "poor" | "hazardous" | "unknown";
  windLevel?: "normal" | "strong" | "storm" | "unknown";
  hazardType?: "earthquake" | "storm" | "local_disruption" | "none" | "unknown";
  hazardSeverity?: "none" | "advisory" | "active" | "unknown";
  localDisruption?: string;
  sourceTimestamp?: string;
  sourceLocationScope?: string;
  environmentContextRevision?: string;
  astroContext?: {
    moonPhase?: string;
    moonSign?: string;
    majorTransitTags?: string[];
    retrogradeTags?: string[];
    ingressTags?: string[];
    aspectTags?: string[];
    astroIntensity?: "low" | "moderate" | "high" | "unknown";
    astroTheme?: string;
    validForLocalDate?: string;
    sourceVersion?: string;
  };
  astroContextRevision?: string;
}

export interface PackageRecommendation {
  id: string;
  title: string;
  description: string;
  period: RecommendationPeriod;
  priority: RecommendationPriority;
  estimatedDuration: number;
  reason: string;
  domain: LibraryRecommendation["domain"];
  intensity: "micro" | "gentle" | "moderate";
  safetyAdjustment: string;
  sourceContext: string;
}

export interface WellnessPackage {
  period: RecommendationPeriod;
  recommendations: PackageRecommendation[];
}

export interface WellnessPackages {
  morning: WellnessPackage;
  afternoon: WellnessPackage;
  evening: WellnessPackage;
}

export interface JourneyCompactContext {
  helpedCategories?: string[];
  recentlySkippedIds?: string[];
  yesterdaySummary?: {
    totalCompleted: number;
    completionRate: number;
    journalCompleted: boolean;
    meditationCompleted: boolean;
    audioCompleted: boolean;
  };
}

export interface SelectWellnessPackagesInput {
  snapshot: WellnessSnapshot;
  preferences?: UserWellnessPreferences;
  history?: RecommendationHistoryItem[];
  environment?: EnvironmentalContext;
  lifeSituationContext?: LifeSituationContext;
  preferenceWeights?: PreferenceWeightMap;
  capacityAdjustments?: CapacityAdjustmentMap;
  contextBoosts?: ContextBoostMap;
  lastSeenAt?: Record<string, string>;
  akashiContext?: AkashiWellnessContext;
  akashiContextRevision?: string;
  journeyContext?: JourneyCompactContext;
}

export interface WellnessRecommendation {
  primaryAction: {
    label: string;
    action: string; // e.g., 'meditation', 'journaling', 'audio'
  };
  supportingAdvice: string[];
}

export function getWellnessRecommendation(snapshot: WellnessSnapshot): WellnessRecommendation {
  const { metrics } = snapshot;
  const recommendations: string[] = [];

  // Priority based on hierarchy: Sleep > Energy > Emotion > Focus

  let primaryAction = { label: "Mulai Journaling", action: "journaling" };

  if (metrics.sleep < 4) {
    recommendations.push("Dengarkan Alunan Kepulangan (Relaxation Audio)");
    recommendations.push("Istirahat lebih awal malam ini");
    primaryAction = { label: "Dengarkan Audio Healing", action: "audio" };
  }

  if (metrics.energy < 4) {
    recommendations.push("Lakukan Meditasi Grounding");
    recommendations.push("Yoga Pemulihan Lembut (Gentle Yoga)");
    if (metrics.sleep >= 4) {
      primaryAction = { label: "Mulai Meditasi", action: "meditation" };
    }
  }

  if (metrics.emotion < 4) {
    recommendations.push("Gunakan Audio Healing untuk regulasi emosi");
    recommendations.push("Tuliskan perasaanmu di Jurnal");
    if (metrics.sleep >= 4 && metrics.energy >= 4) {
      primaryAction = { label: "Dengarkan Audio Healing", action: "audio" };
    }
  }

  if (metrics.focus < 4) {
    recommendations.push("Journaling singkat untuk menjernihkan pikiran");
    recommendations.push("Jalan santai sejenak (Walking)");
    if (metrics.sleep >= 4 && metrics.energy >= 4 && metrics.emotion >= 4) {
      primaryAction = { label: "Mulai Journaling", action: "journaling" };
    }
  }

  // Default if all good
  if (recommendations.length === 0) {
    recommendations.push("Pertahankan ritme baikmu hari ini");
    recommendations.push("Lanjutkan praktik harianmu");
  }

  return {
    primaryAction,
    supportingAdvice: recommendations.slice(0, 3)
  };
}

function normalizeHealth(value: WellnessSnapshot["healthCondition"]): "normal" | "kurang_fit" | "ringan" | "sedang" | "berat" {
  switch (value) {
    case "Less Fit": return "kurang_fit";
    case "Mild Illness": return "ringan";
    case "Moderate Illness": return "sedang";
    case "Severe Illness": return "berat";
    case "kurang_fit":
    case "ringan":
    case "sedang":
    case "berat": return value;
    default: return "normal";
  }
}

function isSafeForHealth(item: LibraryRecommendation, health: ReturnType<typeof normalizeHealth>): boolean {
  const isStrenuous = item.difficulty === "advanced" || item.energyLevel === "high" || item.estimatedDuration > 20;
  const isMovement = item.domain === "physical";
  if (health === "berat") return !isStrenuous && !(isMovement && item.estimatedDuration > 10);
  if (health === "sedang") return !isStrenuous && !(isMovement && item.estimatedDuration > 15);
  if (health === "ringan") return !isStrenuous;
  if (health === "kurang_fit") return item.difficulty !== "advanced";
  return true;
}

function isSafeForEnergy(item: LibraryRecommendation, energy: number): boolean {
  if (energy <= 3) return item.energyLevel !== "high" && item.estimatedDuration <= 15;
  if (energy <= 5) return item.energyLevel !== "high" && item.estimatedDuration <= 25;
  return true;
}

function environmentSafety(item: LibraryRecommendation, environment?: EnvironmentalContext): { eligible: boolean; score: number; reason?: string } {
  if (!environment) return { eligible: true, score: 0 };
  const searchable = `${item.title} ${item.shortDescription} ${item.tags.join(" ")} ${item.indoorOutdoor}`.toLowerCase();
  const outdoor = item.indoorOutdoor === "outdoor" || /outdoor|jalan|taman|grounding alam/.test(searchable);
  const smoke = item.smokeExposure || item.fireExposure || /incense|dupa|asap|smoke/.test(searchable);
  const heavyHazard = environment.hazardSeverity === "active";
  if (heavyHazard) {
    return { eligible: false, score: -100, reason: "Keselamatan lokasi menjadi prioritas utama hari ini." };
  }
  if (environment.precipitationLevel === "heavy_rain" || environment.precipitationLevel === "storm" || environment.windLevel === "storm") {
    if (outdoor) return { eligible: false, score: -80, reason: "Kondisi cuaca membuat praktik luar ruang kurang aman." };
    return { eligible: true, score: 8, reason: "Dipilih sebagai praktik dalam ruang saat cuaca kurang bersahabat." };
  }
  if (environment.temperatureLevel === "extreme") {
    if (outdoor || item.energyLevel === "high" || item.estimatedDuration > 20) return { eligible: false, score: -70, reason: "Intensitas diturunkan karena panas yang cukup kuat." };
    return { eligible: true, score: 8, reason: "Dipilih dengan intensitas rendah agar tubuh tetap sejuk." };
  }
  if (environment.airQualityLevel === "poor" || environment.airQualityLevel === "hazardous") {
    if (outdoor || smoke) return { eligible: false, score: -90, reason: "Praktik luar ruang atau berbasis asap dihindari karena kualitas udara." };
    return { eligible: true, score: 10, reason: "Dipilih sebagai praktik dalam ruang dengan paparan rendah." };
  }
  if (environment.windLevel === "strong" && outdoor) return { eligible: false, score: -60, reason: "Angin kuat membuat praktik terbuka kurang sesuai." };
  return { eligible: true, score: 0 };
}

function astroSupportScore(item: LibraryRecommendation, environment?: EnvironmentalContext): number {
  const theme = environment?.astroContext?.astroTheme?.toLowerCase() || "";
  if (!theme) return 0;
  const reflective = item.domain === "mind" || item.domain === "emotional" || item.domain === "spiritual" || /journal|medit|napas|refleksi/.test(`${item.title} ${item.tags.join(" ")}`.toLowerCase());
  return reflective && /refleksi|ground|closure|rest|tenang|komunikasi|emosi/.test(theme) ? 3 : 0;
}

type WorldviewScope = "UNIVERSAL" | "SPIRITUAL_NEUTRAL" | "TRADITION_SPECIFIC" | "CULTURAL_RITUAL";

function worldviewScope(item: LibraryRecommendation): WorldviewScope {
  if (item.worldviewScope) return item.worldviewScope;
  const text = `${item.title} ${item.shortDescription} ${item.tags.join(" ")} ${item.culturalOrigin}`.toLowerCase();
  if (/(buddh|dharma|sangha|pali|tisarana|prayer|doa|mantra|dhikr|gregorian|sufi|rumi|deity|scripture|sacred|chant)/i.test(text) || item.preferenceGroup === "RELIGIOUS") return "TRADITION_SPECIFIC";
  if (/(incense|dupa|smudg|candle|ritual|altar|offering|ceremon)/i.test(text) || item.preferenceGroup === "RITUAL") return "CULTURAL_RITUAL";
  if (item.domain === "spiritual" || item.preferenceGroup === "CULTURAL" || item.preferenceGroup === "HOLISTIC") return item.preferenceRequired ? "SPIRITUAL_NEUTRAL" : "UNIVERSAL";
  return "UNIVERSAL";
}

function isWorldviewEligible(item: LibraryRecommendation, input: Pick<SelectWellnessPackagesInput, "preferences" | "environment">): boolean {
  const scope = worldviewScope(item);
  if (scope === "UNIVERSAL") return true;
  const preferences = input.preferences;
  if (!preferences) return false;
  if (!preferences.worldviewScopes?.includes(scope)) return false;
  if (scope === "SPIRITUAL_NEUTRAL" && preferences.allowSpiritualContent === false) return false;
  const text = `${item.title} ${item.tags.join(" ")}`.toLowerCase();
  if (item.smokeExposure || item.fireExposure || /(incense|dupa|smudg|candle|fire)/i.test(text)) {
    if (preferences.respiratorySensitivity || preferences.indoorVentilation === "poor" || preferences.fireSafe === false) return false;
  }
  if (preferences.traditionTags?.length && scope === "TRADITION_SPECIFIC") {
    return preferences.traditionTags.some((tag) => text.includes(tag.toLowerCase()));
  }
  return scope !== "TRADITION_SPECIFIC" || Boolean(preferences.traditionTags?.length);
}

export function isRecommendationEligible(item: LibraryRecommendation, input: Pick<SelectWellnessPackagesInput, "preferences" | "environment">): boolean {
  return isWorldviewEligible(item, input) && environmentSafety(item, input.environment).eligible;
}

function dayContextScore(item: LibraryRecommendation, environment?: EnvironmentalContext): number {
  const day = environment?.dayOfWeek;
  if (!day) return 0;
  const searchable = `${item.tags.join(" ")} ${item.applicableContexts.join(" ")} ${item.subcategory}`.toLowerCase();
  const keywords: Record<NonNullable<EnvironmentalContext["dayOfWeek"]>, string[]> = {
    Monday: ["ground", "focus", "planning", "gentle", "morning"],
    Tuesday: ["focus", "confidence", "momentum", "priority"],
    Wednesday: ["rest", "breath", "communication", "calm"],
    Thursday: ["steady", "review", "rest", "focus"],
    Friday: ["release", "rest", "reflection", "evening"],
    Saturday: ["recovery", "nature", "relationship", "home", "rest"],
    Sunday: ["rest", "reflection", "reset", "gentle", "meaning"],
  };
  return keywords[day].reduce((score, keyword) => score + (searchable.includes(keyword) ? 2 : 0), 0);
}

function scoreCandidate(
  item: LibraryRecommendation,
  input: SelectWellnessPackagesInput,
  now: number,
): number {
  const { snapshot } = input;
  const energy = snapshot.metrics?.energy ?? 5;
  const contextScore = input.lifeSituationContext ? scoreLifeSituationFit(snapshot, item, input.lifeSituationContext) : 0;
  const preference = input.preferenceWeights?.get(item.id) ?? 0;
  const capacity = input.capacityAdjustments?.get(item.id) ?? 0;
  const context = input.contextBoosts?.get(item.id) ?? 0;
  const day = dayContextScore(item, input.environment);
  const environmental = environmentSafety(item, input.environment);
  const astro = input.preferences?.allowAstroContext === false ? 0 : astroSupportScore(item, input.environment);
  const akashi = akashiScore(item, input.akashiContext);
  const explicitPreference = input.preferences?.preferredIds?.includes(item.id) ? 12 : 0;
  const domainPreference = input.preferences?.preferredDomains?.includes(item.domain) ? 8 : 0;
  const lowEnergyFit = energy <= 4 && (item.energyLevel === "low" || item.estimatedDuration <= 10) ? 8 : 0;
  const lastSeen = input.lastSeenAt?.[item.id];
  const recencyPenalty = lastSeen && now - new Date(lastSeen).getTime() < 48 * 60 * 60 * 1000 ? -16 : 0;
  const journeyHelpedBoost = input.journeyContext?.helpedCategories?.includes(item.domain) ? 4 : 0;
  const journeySkipPenalty = input.journeyContext?.recentlySkippedIds?.includes(item.id) ? -6 : 0;
  return contextScore + preference + capacity + context + day + astro + akashi + environmental.score + explicitPreference + domainPreference + lowEnergyFit + recencyPenalty + journeyHelpedBoost + journeySkipPenalty;
}

export function calculateCandidateScore(
  item: LibraryRecommendation,
  input: SelectWellnessPackagesInput,
): number {
  return scoreCandidate(item, input, Date.now());
}

function akashiScore(item: LibraryRecommendation, context?: AkashiWellnessContext): number {
  if (!context?.enabled || !context.activatedPatternIds.length) return 0;
  const searchable = `${item.title} ${item.shortDescription} ${item.tags.join(" ")} ${item.applicableContexts.join(" ")}`.toLowerCase();
  if (context.activatedPatternIds.includes("overthinking") && /journal|medit|ground|body|napas|yoga/.test(searchable)) return 5;
  if (context.activatedPatternIds.includes("emotional_suppression") && /journal|audio|medit|gentle|reflection/.test(searchable)) return 5;
  if (context.activatedPatternIds.includes("over_responsibility") && /rest|journal|medit|boundary|gentle/.test(searchable)) return 6;
  if (context.activatedPatternIds.includes("love_block") && /journal|medit|audio|calm|boundary/.test(searchable)) return 5;
  if (context.activatedPatternIds.includes("money_block") && /journal|ground|clarity|small|focus/.test(searchable)) return 5;
  if (context.activatedPatternIds.includes("grounding_need") && /ground|body|medit|yoga|breath/.test(searchable)) return 4;
  if (context.activatedPatternIds.includes("self_sabotage") && /short|micro|journal|medit|small|gentle/.test(searchable)) return 4;
  return 0;
}

function reasonFor(item: LibraryRecommendation, snapshot: WellnessSnapshot, input: SelectWellnessPackagesInput): string {
  const environmental = environmentSafety(item, input.environment);
  if (environmental.reason) return environmental.reason;
  const health = normalizeHealth(snapshot.healthCondition);
  if (health === "berat" || health === "sedang") return "Dipilih dengan intensitas ringan sesuai kapasitas tubuh yang kamu catat hari ini.";
  if ((snapshot.metrics?.energy ?? 5) <= 4) return "Dipilih karena durasinya singkat dan lebih mudah dijalankan saat energi sedang terbatas.";
  if (input.environment?.isWeekend) return "Dipilih untuk memberi ruang pemulihan di akhir pekan tanpa melampaui kapasitasmu.";
  if (input.environment?.dayOfWeek === "Monday") return "Dipilih untuk membantumu memasuki awal pekan dengan langkah yang tetap terukur.";
  if (input.environment?.dayOfWeek === "Friday") return "Dipilih untuk membantu melepas beban yang terkumpul menjelang akhir pekan.";
  if (input.lifeSituationContext?.activeCount) return "Dipilih karena selaras dengan konteks yang sedang kamu hadapi hari ini.";
  if (input.preferences?.allowAstroContext !== false && input.environment?.astroContext?.astroTheme && (item.domain === "mind" || item.domain === "emotional" || item.domain === "spiritual")) return "Tema langit hari ini menjadi konteks tambahan untuk refleksi, tanpa menentukan pilihanmu.";
  if (input.akashiContext?.enabled && input.akashiContext.activatedPatternIds.length) return "Dipilih karena kebutuhan hari ini mungkin menyentuh pola yang pernah berulang; praktik ini membantu meresponsnya dengan langkah yang lebih ringan.";
  if (input.preferenceWeights?.has(item.id)) return "Dipilih berdasarkan pola praktik yang sebelumnya kamu selesaikan.";
  return "Dipilih sebagai langkah sederhana yang sesuai dengan kondisi hari ini.";
}

function intensityFor(item: LibraryRecommendation, snapshot: WellnessSnapshot): PackageRecommendation["intensity"] {
  const energy = snapshot.metrics?.energy ?? 5;
  if (energy <= 4 || snapshot.healthCondition === "berat" || snapshot.healthCondition === "sedang" || snapshot.healthCondition === "Severe Illness" || snapshot.healthCondition === "Moderate Illness") return "micro";
  if (item.estimatedDuration <= 10 || item.difficulty === "beginner") return "gentle";
  return "moderate";
}

function safetyAdjustmentFor(snapshot: WellnessSnapshot): string {
  const health = snapshot.healthCondition;
  if (health === "berat" || health === "Severe Illness") return "Intensitas fisik berat disaring; prioritaskan pemulihan.";
  if (health === "sedang" || health === "Moderate Illness") return "Durasi dan intensitas dikurangi untuk menjaga kapasitas.";
  if (health === "ringan" || health === "Mild Illness" || health === "kurang_fit" || health === "Less Fit") return "Dipilih dengan intensitas lebih ringan.";
  return "Tidak ada penyesuaian keselamatan tambahan.";
}

function selectForPeriod(period: RecommendationPeriod, input: SelectWellnessPackagesInput, used: Set<string>): PackageRecommendation[] {
  const health = normalizeHealth(input.snapshot.healthCondition);
  const now = Date.now();
  const targetLocalDate = input.environment?.localDate || getLocalDateKey(new Date(now), "Asia/Jakarta");
  const completedToday = new Set((input.history ?? [])
    .filter((item) => item.completedAt.slice(0, 10) === targetLocalDate)
    .map((item) => item.recommendationId));
  const candidates = WELLNESS_RECOMMENDATION_LIBRARY
    .filter((item) => item.recommendedTime === "flexible" || item.recommendedTime === period)
    .filter((item) => isSafeForHealth(item, health) && isSafeForEnergy(item, input.snapshot.metrics?.energy ?? 5))
    .filter((item) => environmentSafety(item, input.environment).eligible)
    .filter((item) => isWorldviewEligible(item, input))
    .filter((item) => !item.avoidWhen?.some((condition) => health === "berat" && /illness|injury|pain/i.test(condition)))
    .filter((item) => !completedToday.has(item.id))
    .filter((item) => !used.has(item.id))
    .filter((item) => {
      const last = (input.history ?? []).find((history) => history.recommendationId === item.id);
      if (!last) return true;
      return now - new Date(last.completedAt).getTime() >= item.repeatCooldown * 60 * 60 * 1000;
    })
    .sort((a, b) => scoreCandidate(b, input, now) - scoreCandidate(a, input, now) || a.id.localeCompare(b.id));

  const selected = candidates.slice(0, health === "berat" || health === "sedang" || (input.snapshot.metrics?.energy ?? 5) <= 4 ? 3 : 4);
  if (!selected.length) return [];
  const result = selected.map((item, index) => ({
    id: item.id,
    title: item.title,
    description: item.shortDescription,
    period,
    priority: index === 0 ? "PRIMARY" : index === 1 ? "SECONDARY" : item.estimatedDuration <= 5 ? "MICRO" : "OPTIONAL",
    estimatedDuration: item.estimatedDuration,
    reason: reasonFor(item, input.snapshot, input),
    domain: item.domain,
    intensity: intensityFor(item, input.snapshot),
    safetyAdjustment: safetyAdjustmentFor(input.snapshot),
    sourceContext: input.lifeSituationContext?.narrative || "Kondisi harian dan riwayat praktik pengguna",
  } satisfies PackageRecommendation));
  result.forEach((item) => used.add(item.id));
  return result;
}

export function selectWellnessPackages(input: SelectWellnessPackagesInput): WellnessPackages {
  const used = new Set<string>();
  return {
    morning: { period: "morning", recommendations: selectForPeriod("morning", input, used) },
    afternoon: { period: "afternoon", recommendations: selectForPeriod("afternoon", input, used) },
    evening: { period: "evening", recommendations: selectForPeriod("evening", input, used) },
  };
}
