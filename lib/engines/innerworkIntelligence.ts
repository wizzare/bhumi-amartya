import {
  WORKOUT_DATABASE,
  YOGA_DATABASE,
  HEALTHY_FOOD_DATABASE,
  AUDIO_HEALING_DATABASE,
  InnerworkContent
} from "@/lib/data/innerworkContent";
import { AstroHouseActivation } from "@/lib/astrology/astroHouseActivations";
import { PhysicalActivity } from "@/lib/repositories/activityRepository";
import { ProgressMetrics } from "@/lib/engines/progressCalculationEngine";
import { seededIndex } from "@/lib/dailyGuidance/dailyContentKey";
import { WellnessMapping } from "@/lib/engines/wellnessMappingEngine";
import type { UnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";
import { INNERWORK_VARIATION_LIBRARY } from "@/lib/data/innerworkVariationLibrary";
import type { GaiaProfile, GaiaTheme } from "@/lib/profile/gaia/types";

export interface InnerworkRecommendationInput {
  activations: AstroHouseActivation[];
  hdType: string;
  lifePath: number;
  arcanaCenter: number;
  rawBlueprint?: Record<string, unknown> | null;
  activityHistory?: PhysicalActivity[];
  progressMetrics?: ProgressMetrics;
  localDateKey?: string;
  wellnessMapping?: WellnessMapping | null;
  unifiedBlueprint?: UnifiedBlueprintSynthesis | null;
  gaiaProfile?: GaiaProfile | null;
}

export interface InnerworkRecommendationResult {
  workout: InnerworkContent & { reason: string };
  yoga: InnerworkContent & { reason: string };
  healthyFood: InnerworkContent & { reason: string };
  audioHealing: InnerworkContent & { reason: string };
  journaling: InnerworkContent & { reason: string };
  meditation: InnerworkContent & { reason: string };
  manifestation: InnerworkContent & { reason: string };
}

const FIRE_SIGNS = new Set(["Aries", "Leo", "Sagittarius"]);
const EARTH_SIGNS = new Set(["Taurus", "Virgo", "Capricorn"]);
const AIR_SIGNS = new Set(["Gemini", "Libra", "Aquarius"]);
const WATER_SIGNS = new Set(["Cancer", "Scorpio", "Pisces"]);

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : {};
}

function readPath(source: unknown, path: string[]): unknown {
  let cursor = source;
  for (const key of path) {
    if (!cursor || typeof cursor !== "object") return undefined;
    cursor = (cursor as UnknownRecord)[key];
  }
  return cursor;
}

function readFirst(source: unknown, paths: string[][]): unknown {
  for (const path of paths) {
    const value = readPath(source, path);
    if (value !== undefined && value !== null && value !== "") return value;
  }
}

function fieldText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.filter(Boolean).map(fieldText).filter(Boolean).join(", ");
  if (value && typeof value === "object") return Object.values(value as Record<string, unknown>).map(fieldText).filter(Boolean).join(", ");
  return "";
}

function hasSignal(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return Boolean(value.trim());
  if (Array.isArray(value)) return value.some(hasSignal);
  if (typeof value === "object") return Object.values(value as UnknownRecord).some(hasSignal);
  return true;
}

function planetSign(input: InnerworkRecommendationInput, planet: string): string {
  const full = (input.unifiedBlueprint?.fullBlueprint || {}) as UnknownRecord;
  const raw = input.rawBlueprint || {};
  const astrology = record(readFirst(raw, [["astrology"], ["natalChart"]]));
  const natalChart = record(full.natalChart);
  const source = Object.keys(astrology).length ? astrology : natalChart;
  const planets = (source.planets && typeof source.planets === "object" ? source.planets : {}) as Record<string, unknown>;
  const entry = planets[planet] || planets[planet.toLowerCase()] || planets[planet.charAt(0).toUpperCase() + planet.slice(1)];
  const direct = (source as UnknownRecord)[`${planet}Sign`] || (source as UnknownRecord)[planet] || (natalChart as UnknownRecord)[planet];
  return typeof entry === "object" && entry ? fieldText((entry as Record<string, unknown>).sign) : fieldText(direct);
}

function blueprintPracticeSignals(input: InnerworkRecommendationInput) {
  const full = input.unifiedBlueprint?.fullBlueprint;
  const raw = input.rawBlueprint || {};
  const fullRecord = (full || {}) as UnknownRecord;
  const rawNumerology = record(readFirst(raw, [["numerology"]]));
  const rawLifePath = record(readFirst(raw, [["lifePath"]]));
  const hd = { ...record(readFirst(raw, [["humanDesign"]])), ...record(full?.humanDesign) };
  const destiny = { ...record(readFirst(raw, [["destinyMatrix"]])), ...record(full?.destinyMatrix) };
  const natal = { ...record(readFirst(raw, [["astrology"], ["natalChart"]])), ...record(full?.natalChart) };
  const numerology = { ...rawNumerology, ...rawLifePath };
  const moon = planetSign(input, "moon") || fieldText(natal.moonSign);
  const mars = planetSign(input, "mars");
  const venus = planetSign(input, "venus");
  const saturn = planetSign(input, "saturn");
  const mercury = planetSign(input, "mercury");
  const sun = planetSign(input, "sun") || fieldText(natal.sunSign);
  const ascendant = fieldText(natal.ascendant);
  const midheaven = fieldText(natal.midheaven || natal.mc);
  const jupiter = planetSign(input, "jupiter");
  const uranus = planetSign(input, "uranus");
  const neptune = planetSign(input, "neptune");
  const pluto = planetSign(input, "pluto");
  const chiron = planetSign(input, "chiron");
  const northNode = planetSign(input, "northNode");
  const southNode = planetSign(input, "southNode");
  const element = FIRE_SIGNS.has(mars) || FIRE_SIGNS.has(moon) ? "fire"
    : AIR_SIGNS.has(mercury) || AIR_SIGNS.has(moon) ? "air"
      : WATER_SIGNS.has(moon) || WATER_SIGNS.has(venus) ? "water"
        : EARTH_SIGNS.has(moon) || EARTH_SIGNS.has(mars) ? "earth"
          : "";
  const destinyIntelligence = record(destiny.destinyIntelligence);
  const openCenters = fieldText(hd.openCenters);
  const definedCenters = fieldText(hd.definedCenters || hd.centers);
  const moneyLine = fieldText(destiny.moneyLine);
  const loveLine = fieldText(destiny.loveLine);
  const karmicTail = fieldText(destiny.karmicTail);
  const familyLines = fieldText([destiny.fatherLine, destiny.motherLine, destiny.ancestorLine]);
  const talents = fieldText(destiny.talentsGreat || destiny.talents || destiny.talentsFather || destiny.talentsMother);
  const purpose = fieldText(destiny.purposes || destiny.purposePoints || northNode || numerology.soulUrge);
  const expression = fieldText(numerology.expression || numerology.destinyNumber);
  const soulUrge = fieldText(numerology.soulUrge || numerology.soul);
  const personality = fieldText(numerology.personality);
  const lifePathStrengths = fieldText(readFirst(raw, [["lifePath", "positiveTraits"], ["numerology", "strengths"], ["lifePath", "strengths"]]));
  const lifePathChallenges = fieldText(readFirst(raw, [["lifePath", "negativeTraits"], ["numerology", "challenges"], ["lifePath", "challenges"]]));
  const centers = fieldText([definedCenters, openCenters]);
  const variables = fieldText(hd.variables);
  const digestion = fieldText(hd.digestion || readPath(hd, ["variables", "digestion"]));
  const environment = fieldText(hd.environment || readPath(hd, ["variables", "environment"]));
  const cognition = fieldText(hd.cognition || readPath(hd, ["variables", "cognition"]));
  const motivation = fieldText(hd.motivation || readPath(hd, ["variables", "motivation"]));
  const channels = fieldText(hd.channels);
  const gates = fieldText(hd.gates);
  const chakra = fieldText(destinyIntelligence.dominantChakra || destiny.chakraMatrix || destiny.healthChart || destinyIntelligence.healthChart);
  const elements = fieldText(readFirst(raw, [["elements"], ["elementComposition"], ["astrology", "elements"], ["natalChart", "elements"]]));
  const modalities = fieldText(readFirst(raw, [["modalities"], ["astrology", "modalities"], ["natalChart", "modalities"]]));
  const houses = fieldText(natal.houses || natal.housePlacements || natal.dominantHouses);
  const outerPlanets = fieldText([uranus, neptune, pluto]);
  const nodes = fieldText([northNode, southNode]);

  const sourcePresence = {
    numerology: [input.lifePath, expression, soulUrge, personality, lifePathStrengths, lifePathChallenges].some(hasSignal),
    humanDesign: [input.hdType, hd.type, hd.strategy, hd.authority, hd.profile, hd.signature, hd.notSelfTheme, hd.notSelf, centers, gates, channels, digestion, environment, cognition, motivation, variables].some(hasSignal),
    natal: [sun, moon, ascendant, midheaven, mercury, venus, mars, jupiter, saturn, outerPlanets, chiron, nodes, elements, modalities, houses].some(hasSignal),
    destinyMatrix: [input.arcanaCenter, destiny.arcanaCenter, destiny.center, moneyLine, loveLine, karmicTail, familyLines, talents, purpose, chakra].some(hasSignal),
  };

  const fingerprint = [
    input.lifePath, expression, soulUrge, personality, lifePathStrengths, lifePathChallenges,
    input.hdType, hd.strategy, hd.authority, hd.profile, hd.signature, hd.notSelfTheme || hd.notSelf, centers, gates, channels, digestion, environment, cognition, motivation, variables,
    sun, moon, ascendant, midheaven, mercury, venus, mars, jupiter, saturn, outerPlanets, chiron, nodes, elements, modalities, houses,
    destiny.arcanaCenter || destiny.center || input.arcanaCenter, moneyLine, loveLine, karmicTail, familyLines, talents, purpose, chakra,
  ].map(fieldText).filter(Boolean).join("|");

  const themeScores = {
    shadow: [saturn, chiron, southNode, karmicTail, familyLines, hd.notSelfTheme || hd.notSelf, openCenters, lifePathChallenges].filter(hasSignal).length,
    relationships: [venus, moon, loveLine, hd.definition, hd.profile, soulUrge].filter(hasSignal).length,
    career: [midheaven, mercury, mars, jupiter, moneyLine, talents, expression, environment, motivation, channels].filter(hasSignal).length,
    spirituality: [northNode, purpose, destiny.arcanaCenter || destiny.center, outerPlanets, soulUrge, hd.incarnationCross].filter(hasSignal).length,
    talents: [expression, lifePathStrengths, talents, mercury, jupiter, channels, gates].filter(hasSignal).length,
    energy: [element, elements, modalities, chakra, centers, digestion, cognition, mars, sun].filter(hasSignal).length,
  };

  return {
    element,
    decisionRhythm: fieldText(hd.authority || hd.strategy || hd.type || input.hdType),
    restoration: fieldText([environment, digestion, cognition].filter(Boolean)),
    motivation,
    emotionalEdge: fieldText(hd.notSelfTheme || hd.notSelf || saturn || chiron || southNode || karmicTail || lifePathChallenges),
    bodyFocus: fieldText([chakra, centers, elements, modalities].filter(Boolean)),
    breathFocus: element === "fire" ? "hembusan panjang untuk mendinginkan dorongan aksi"
      : element === "air" ? "napas perut untuk membumikan pikiran"
        : element === "water" ? "napas lembut ke area dada untuk memberi ruang emosi"
          : element === "earth" ? "napas stabil dengan perhatian pada kaki dan panggul"
            : "napas pelan dengan pemindaian tubuh",
    moneyLine,
    loveLine,
    shadowFocus: fieldText([karmicTail, familyLines, saturn, chiron, hd.notSelfTheme || hd.notSelf, openCenters, lifePathChallenges].filter(Boolean)),
    healingFocus: fieldText([chiron, moon, loveLine, familyLines, chakra, neptune, southNode].filter(Boolean)),
    talents: fieldText([talents, expression, lifePathStrengths, mercury, jupiter, gates, channels].filter(Boolean)),
    purpose,
    persona: personality,
    sourcePresence,
    themeScores,
    fingerprint,
  };
}

export const innerworkIntelligence = {
  /**
   * Generates specific activity recommendations based on cosmic triggers and soul blueprint.
   * Build 31.6: Memory-aware and repetition-safe.
   */
  getRecommendations(input: InnerworkRecommendationInput): InnerworkRecommendationResult {
    const { activations, hdType, lifePath, arcanaCenter, activityHistory = [], progressMetrics, localDateKey, wellnessMapping, unifiedBlueprint, gaiaProfile } = input;

    console.log("[INNERWORK PERSONALIZATION] Generating recommendations...");

    const topWellnessTheme = wellnessMapping?.results[0]?.category;
    const destinyInterpretation = unifiedBlueprint?.fullBlueprint.destinyMatrix.intelligenceInterpretation;
    const dominantChakra = destinyInterpretation?.dominantChakra;
    const destiny = unifiedBlueprint?.fullBlueprint.destinyMatrix;
    const healthChart = destiny?.destinyIntelligence?.healthChart;
    const openCenters = unifiedBlueprint?.fullBlueprint.humanDesign.openCenters;
    const moneyLine = destiny?.moneyLine;
    const loveLine = destiny?.loveLine;
    const karmicTail = destiny?.karmicTail;
    const gaiaInsights = gaiaProfile ? Object.values(gaiaProfile.sections).flat().sort((a, b) => b.meta.confidence - a.meta.confidence) : [];
    const dominantGaiaInsight = gaiaInsights[0];
    const dominantGaiaTheme = dominantGaiaInsight?.theme;
    const gaiaSeed = gaiaInsights.slice(0, 8).map((insight) => `${insight.id}:${insight.meta.confidence}:${insight.signals.join(",")}`).join("|");
    const practiceSignals = blueprintPracticeSignals(input);

    // Helper: Get recently completed IDs (last 3 days)
    const getRecentIds = (category: string) => {
      if (!localDateKey) return new Set<string>();

      const thresholdDate = new Date(localDateKey);
      thresholdDate.setDate(thresholdDate.getDate() - 3);
      const thresholdStr = thresholdDate.toISOString().split("T")[0];

      return new Set(
        activityHistory
          .filter(a => a.category === category && a.localDate >= thresholdStr)
          .map(a => a.contentId)
      );
    };

    const recentWorkouts = getRecentIds("workout");
    const recentYoga = getRecentIds("yoga");
    const recentFood = getRecentIds("healthyFood");
    const recentAudio = getRecentIds("audioHealing");
    const mood = progressMetrics?.emotionalStates?.[0]?.frequency || 5;

    const pickDailyCandidate = (items: InnerworkContent[], category: string, preferred?: InnerworkContent) => {
      const recentIds = getRecentIds(category);
      const available = items.filter((item) => !recentIds.has(item.id));
      const pool = available.length > 0 ? available : items;
      const dayOffset = Number((localDateKey || "").replaceAll("-", "")) || 0;
      if (preferred && !recentIds.has(preferred.id)) {
        const preferredIndex = pool.findIndex((item) => item.id === preferred.id);
        if (preferredIndex >= 0 && seededIndex(`${localDateKey || "today"}|${category}|preferred`, 3) !== 0) {
          return pool[preferredIndex];
        }
      }
      const intelligenceSeed = [
        dominantChakra,
        destiny?.destinyIntelligence?.soulSearching,
        destiny?.destinyIntelligence?.socialization,
        destiny?.destinyIntelligence?.spiritualKnowledge,
        moneyLine,
        loveLine,
        karmicTail,
        openCenters,
        healthChart ? JSON.stringify(healthChart) : "",
        gaiaSeed,
        practiceSignals.fingerprint,
      ].map((item) => typeof item === "string" ? item : JSON.stringify(item ?? "")).join("|");
      const differentiatorSeed = unifiedBlueprint?.differentiators?.join("|") || intelligenceSeed;
      const index = (seededIndex(`${category}|${hdType}|${lifePath}|${arcanaCenter}|${differentiatorSeed}`, pool.length) + dayOffset) % pool.length;
      return pool[index];
    };

    const pickThemeIndex = (category: string, preferredThemes: GaiaTheme[]) => {
      const ranked = preferredThemes
        .map((theme) => ({ theme, score: practiceSignals.themeScores[theme] || 0 }))
        .sort((a, b) => b.score - a.score);
      const strongest = ranked[0];
      if (strongest && strongest.score > 0) return themePreference[strongest.theme] ?? 0;
      return seededIndex(`${category}|theme|${practiceSignals.fingerprint || lifePath}`, 6);
    };

    // 0. Temporal Variations (Day-based rotation)
    const dayOfWeek = localDateKey ? new Date(localDateKey).getDay() : new Date().getDay();
    // Use dayOfWeek (0-6) to influence preference

    // 1. Determine Workout
    const marsTransit = activations.find(a => a.planet === "Mars");
    const workoutCandidates = [...Object.values(WORKOUT_DATABASE), ...INNERWORK_VARIATION_LIBRARY.workout];
    const journeyPhase = progressMetrics?.journeyPhase || "Awareness";
    let selectedWorkout: InnerworkContent;

    if (practiceSignals.element === "fire" && mood >= 6) {
      selectedWorkout = WORKOUT_DATABASE["steady-walk"];
    } else if (practiceSignals.element === "air") {
      selectedWorkout = WORKOUT_DATABASE["gentle-stretch"];
    } else if (topWellnessTheme === "BURNOUT" || mood <= 3) {
      selectedWorkout = WORKOUT_DATABASE["restorative-rest"];
    } else if (journeyPhase === "Rebuilding" || (progressMetrics && progressMetrics.streakDays >= 14)) {
      selectedWorkout = WORKOUT_DATABASE["endurance-build"];
    } else if (dominantChakra === "manipura" || moneyLine || (marsTransit && marsTransit.severity === "high")) {
      selectedWorkout = dayOfWeek % 2 === 0 ? WORKOUT_DATABASE["hiit-energy"] : WORKOUT_DATABASE["steady-walk"];
    } else if (hdType === "Projector" || hdType === "Reflector") {
      selectedWorkout = WORKOUT_DATABASE["gentle-stretch"];
    } else {
      selectedWorkout = WORKOUT_DATABASE["steady-walk"];
    }

    if (recentWorkouts.has(selectedWorkout.id)) {
      console.log(`[INNERWORK PERSONALIZATION] Workout ${selectedWorkout.id} skipped (recent).`);
    }
    selectedWorkout = pickDailyCandidate(workoutCandidates, "workout", selectedWorkout);

    // 2. Determine Yoga
    const venusTransit = activations.find(a => a.planet === "Venus");
    const yogaCandidates = [...Object.values(YOGA_DATABASE), ...INNERWORK_VARIATION_LIBRARY.yoga];
    let selectedYoga: InnerworkContent;

    if (practiceSignals.element === "air" || dominantChakra === "muladhara" || topWellnessTheme === "ANXIETY") {
      selectedYoga = YOGA_DATABASE["grounding-earth"];
    } else if (practiceSignals.element === "water" || dominantChakra === "svadhisthana") {
      selectedYoga = YOGA_DATABASE["sacral-fluidity"];
    } else if (dominantChakra === "anahata" || loveLine || (venusTransit && venusTransit.house === 7)) {
      selectedYoga = YOGA_DATABASE["heart-opening"];
    } else if (dominantChakra === "vishudha") {
      selectedYoga = YOGA_DATABASE["throat-clarity"];
    } else if (dominantChakra === "ajna") {
      selectedYoga = YOGA_DATABASE["solar-confidence"]; // Or Ajna focus if available
    } else if (dominantChakra === "sahasrara") {
      selectedYoga = YOGA_DATABASE["crown-connection"];
    } else if (hdType === "Manifesting Generator") {
      selectedYoga = YOGA_DATABASE["sacral-fluidity"];
    } else {
      selectedYoga = YOGA_DATABASE["grounding-earth"];
    }

    if (recentYoga.has(selectedYoga.id)) {
      console.log(`[INNERWORK PERSONALIZATION] Yoga ${selectedYoga.id} skipped (recent).`);
    }
    selectedYoga = pickDailyCandidate(yogaCandidates, "yoga", selectedYoga);

    // 3. Determine Healthy Food
    const foodCandidates = [...Object.values(HEALTHY_FOOD_DATABASE), ...INNERWORK_VARIATION_LIBRARY.healthyFood];
    let selectedFood: InnerworkContent;

    if (topWellnessTheme === "BURNOUT" || mood <= 3) {
      selectedFood = HEALTHY_FOOD_DATABASE["nourishing-soup"];
    } else if (mood >= 8) {
      selectedFood = HEALTHY_FOOD_DATABASE["cooling-mint"];
    } else if (dominantChakra === "muladhara") {
      selectedFood = HEALTHY_FOOD_DATABASE["grounding-food"];
    } else if (dominantChakra === "manipura" || (marsTransit && dayOfWeek % 2 === 1)) {
      selectedFood = HEALTHY_FOOD_DATABASE["ginger-fire"];
    } else {
      selectedFood = dayOfWeek % 2 === 1 ? HEALTHY_FOOD_DATABASE["lemongrass-calm"] : HEALTHY_FOOD_DATABASE["turmeric-glow"];
    }

    if (recentFood.has(selectedFood.id)) {
      console.log(`[INNERWORK PERSONALIZATION] Food ${selectedFood.id} skipped (recent).`);
    }
    selectedFood = pickDailyCandidate(foodCandidates, "healthyFood", selectedFood);

    // 4. Determine Audio Healing
    const audioCandidates = [...Object.values(AUDIO_HEALING_DATABASE), ...INNERWORK_VARIATION_LIBRARY.audioHealing];
    let selectedAudio: InnerworkContent;

    if (practiceSignals.loveLine || topWellnessTheme === "LOSS_AND_GRIEF" || dominantChakra === "anahata") {
      selectedAudio = AUDIO_HEALING_DATABASE["frequency-432"];
    } else if (practiceSignals.element === "air" || mood <= 4 || hdType === "Reflector" || topWellnessTheme === "ANXIETY" || dominantChakra === "muladhara" || dominantChakra === "ajna") {
      selectedAudio = AUDIO_HEALING_DATABASE["frequency-396"];
    } else if (lifePath === 7 || lifePath === 9) {
      selectedAudio = AUDIO_HEALING_DATABASE["frequency-432"];
    } else {
      selectedAudio = AUDIO_HEALING_DATABASE["frequency-528"];
    }

    if (recentAudio.has(selectedAudio.id)) {
      console.log(`[INNERWORK PERSONALIZATION] Audio ${selectedAudio.id} skipped (recent).`);
    }
    selectedAudio = pickDailyCandidate(audioCandidates, "audioHealing", selectedAudio);

    const themePreference: Partial<Record<GaiaTheme, number>> = {
      shadow: 0,
      talents: 2,
      energy: 1,
      relationships: 3,
      career: 5,
      spirituality: 4,
    };
    const selectGaiaPractice = (category: "journaling" | "meditation" | "manifestation") => {
      const candidates = INNERWORK_VARIATION_LIBRARY[category];
      const categoryThemes: Record<"journaling" | "meditation" | "manifestation", GaiaTheme[]> = {
        journaling: ["shadow", "relationships", "career", "spirituality", "talents", "energy"],
        meditation: ["energy", "shadow", "relationships", "spirituality", "talents", "career"],
        manifestation: ["career", "spirituality", "talents", "relationships", "shadow", "energy"],
      };
      const preferredIndex = pickThemeIndex(category, categoryThemes[category]);
      const preferred = preferredIndex === undefined ? undefined : candidates[preferredIndex % candidates.length];
      return pickDailyCandidate(candidates, category, preferred);
    };
    const selectedJournaling = selectGaiaPractice("journaling");
    const selectedMeditation = selectGaiaPractice("meditation");
    const selectedManifestation = selectGaiaPractice("manifestation");

    return {
      workout: { ...selectedWorkout, reason: this.generateReason("workout", selectedWorkout, input) },
      yoga: { ...selectedYoga, reason: this.generateReason("yoga", selectedYoga, input) },
      healthyFood: { ...selectedFood, reason: this.generateReason("healthyFood", selectedFood, input) },
      audioHealing: { ...selectedAudio, reason: this.generateReason("audioHealing", selectedAudio, input) },
      journaling: { ...selectedJournaling, reason: this.generateReason("journaling", selectedJournaling, input) },
      meditation: { ...selectedMeditation, reason: this.generateReason("meditation", selectedMeditation, input) },
      manifestation: { ...selectedManifestation, reason: this.generateReason("manifestation", selectedManifestation, input) },
    };
  },

  generateReason(category: string, item: InnerworkContent, input: InnerworkRecommendationInput): string {
    const { activations, hdType, progressMetrics } = input;
    const marsTransit = activations.find(a => a.planet === "Mars");
    const journeyPhase = progressMetrics?.journeyPhase;
    const destinyInterpretation = input.unifiedBlueprint?.fullBlueprint.destinyMatrix.intelligenceInterpretation;
    const chakraSummary = destinyInterpretation?.dominantChakra
      ? destinyInterpretation.interpretations.find((item) => item.chakra === destinyInterpretation.dominantChakra)?.summary
      : "";
    const detailSuffixText = [
      chakraSummary && `Fokus tubuh: ${chakraSummary}`,
    ].filter(Boolean).join(" ");
    const detailSuffix = detailSuffixText ? ` ${detailSuffixText}` : "";
    const signals = blueprintPracticeSignals(input);
    const sourceCoverage = [
      signals.sourcePresence.numerology && "Numerologi",
      signals.sourcePresence.humanDesign && "Human Design",
      signals.sourcePresence.natal && "Natal",
      signals.sourcePresence.destinyMatrix && "Destiny Matrix",
    ].filter(Boolean).join(", ");
    const sourceFocus = [
      signals.decisionRhythm && "ritme keputusan tubuh",
      signals.restoration && "cara sistemmu pulih",
      signals.element && `kebutuhan ${signals.element === "fire" ? "mendinginkan dorongan aksi" : signals.element === "air" ? "membumikan pikiran" : signals.element === "water" ? "melembutkan emosi" : "menstabilkan tubuh"}`,
      signals.emotionalEdge && "pola bayangan yang sedang minta disadari",
      signals.healingFocus && "bagian batin yang butuh ditemani",
      signals.moneyLine && "tema nilai, kerja, dan menerima",
      signals.loveLine && "tema kedekatan dan batas hati",
      signals.talents && "cara bakatmu perlu diwujudkan",
      signals.purpose && "arah makna yang ingin dibumikan",
    ].filter(Boolean).slice(0, 3).join(", ");
    const focusSuffix = sourceFocus ? ` Fokus latihan: ${sourceFocus}.` : "";
    const coverageSuffix = sourceCoverage ? ` Dibaca dari ${sourceCoverage}.` : "";
    const breathSuffix = signals.breathFocus ? ` Breathwork: ${signals.breathFocus}.` : "";
    const reflectionSuffix = signals.shadowFocus
      ? " Refleksi: respons lama apa yang bisa kamu lihat tanpa langsung mengikutinya?"
      : signals.purpose
        ? " Refleksi: langkah kecil apa yang paling membumikan arah hidupmu hari ini?"
        : " Refleksi: apa yang tubuhmu minta sebelum kamu bergerak lagi?";
    const actionSuffix = signals.moneyLine
      ? " Aksi kecil: rapikan satu keputusan nilai, kerja, atau batas energi."
      : signals.loveLine
        ? " Aksi kecil: hadirkan satu batas atau satu bentuk kasih yang jujur."
        : signals.talents
          ? " Aksi kecil: gunakan satu bakat dalam tindakan yang bisa selesai hari ini."
          : " Aksi kecil: lakukan satu langkah yang cukup ringan untuk benar-benar dijalani.";
    const gaiaInsight = input.gaiaProfile
      ? Object.values(input.gaiaProfile.sections).flat().sort((a, b) => b.meta.confidence - a.meta.confidence)[0]
      : null;
    const gaiaSuffix = gaiaInsight ? ` Profil hari ini menyoroti ${gaiaInsight.title.toLowerCase()}, sehingga praktik ini dipilih untuk membantu tema tersebut hadir dalam langkah nyata.` : "";

    if (category === "workout") {
      if (marsTransit && marsTransit.severity === "high") {
        return `Direkomendasikan karena tubuhmu butuh pelepasan energi yang tetap sadar dan tidak reaktif.${focusSuffix}${coverageSuffix}${detailSuffix}${actionSuffix}${gaiaSuffix}`;
      }
      if (journeyPhase === "Release") {
        return `Direkomendasikan untuk mendukung fase pelepasan emosional yang sedang kamu jalani.${focusSuffix}${coverageSuffix}${detailSuffix}${actionSuffix}`;
      }
      return `Direkomendasikan untuk menjaga kesinambungan kecil tanpa memaksa energi berlebih.${focusSuffix}${coverageSuffix}${detailSuffix}${actionSuffix}${gaiaSuffix}`;
    }

    if (category === "yoga") {
      if (hdType === "Projector" || hdType === "Reflector") {
        return `Gerakan ini membantu memulihkan energi tanpa membuatnya terkuras, terutama saat tubuh perlu membaca ruang sebelum bertindak.${focusSuffix}${coverageSuffix}${detailSuffix}${breathSuffix}${actionSuffix}`;
      }
      return `Direkomendasikan untuk menenangkan sistem saraf dan mengembalikan fokus batin.${focusSuffix}${coverageSuffix}${detailSuffix}${breathSuffix}${actionSuffix}${gaiaSuffix}`;
    }

    if (category === "healthyFood") {
      if (progressMetrics && progressMetrics.streakDays > 7) {
        return `Direkomendasikan untuk menjaga stamina tubuhmu yang sudah konsisten belakangan ini.${coverageSuffix}${detailSuffix}${actionSuffix}`;
      }
      return `Direkomendasikan untuk menjaga asupan dan ritme tubuh tetap jernih hari ini.${focusSuffix}${coverageSuffix}${detailSuffix}${actionSuffix}${gaiaSuffix}`;
    }

    if (category === "audioHealing") {
      return `${item.title.split(' - ')[0]} dipilih sebagai healing practice untuk memberi ruang pada ritme batinmu hari ini.${focusSuffix}${coverageSuffix}${detailSuffix}${breathSuffix}${reflectionSuffix}${gaiaSuffix}`;
    }

    if (category === "journaling") return `Pertanyaan ini dipilih sebagai reflection prompt dan shadow work ringan agar tema yang kuat bisa kamu lihat melalui pengalaman nyata.${focusSuffix}${coverageSuffix}${detailSuffix}${reflectionSuffix}${actionSuffix}${gaiaSuffix}`;
    if (category === "meditation") return `Meditasi ini dipilih untuk membantu tubuh, emosi, dan pikiranmu memproses tema hari ini tanpa tergesa-gesa.${focusSuffix}${coverageSuffix}${detailSuffix}${breathSuffix}${reflectionSuffix}${actionSuffix}${gaiaSuffix}`;
    if (category === "manifestation") return `Latihan manifestasi ini menghubungkan niat dengan satu tindakan yang dapat kamu jalani, bukan sekadar afirmasi.${focusSuffix}${coverageSuffix}${detailSuffix}${reflectionSuffix}${actionSuffix}${gaiaSuffix}`;

    return `Direkomendasikan berdasarkan jati dirimu hari ini.${coverageSuffix}${detailSuffix}`;
  }
};
