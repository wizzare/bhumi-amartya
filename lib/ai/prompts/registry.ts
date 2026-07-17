import { AIRequest } from "../types";
import { buildSoulIdentityPrompt } from "../../prompts/soulIdentityPrompt";
import { buildDailyGuidancePrompt } from "../../prompts/dailyGuidancePrompt";
import { DAILY_GUIDANCE_PROMPT_VERSION } from "../../dailyGuidance/version";

export const DAILY_GUIDANCE_PROMPT_ID = "daily-guidance" as const;
export const DAILY_GUIDANCE_OUTPUT_CONTRACT = Object.freeze([
  "soulReflectionText|soulReflection.dailyMessage",
  "dailyNoteText|companionReflection.preview",
  "astroEnergy.currentEnergy",
  "journalingPrompt.prompt",
  "meditationRecommendation.title",
] as const);

export const DAILY_GUIDANCE_PROMPT_DEFINITION = Object.freeze({
  id: DAILY_GUIDANCE_PROMPT_ID,
  version: DAILY_GUIDANCE_PROMPT_VERSION,
  outputContract: DAILY_GUIDANCE_OUTPUT_CONTRACT,
});

export class PromptRegistry {
  public static getDefinition(promptKey: string) {
    if (promptKey === DAILY_GUIDANCE_PROMPT_ID) {
      return DAILY_GUIDANCE_PROMPT_DEFINITION;
    }
    return null;
  }

  public static buildPrompt(request: AIRequest): string {
    const { promptKey, language, additionalContext } = request;

    if (promptKey === "soul-reflection") {
      const { additionalContext } = request;
      const contextParts: string[] = [];
      const identity = request.identity;

      contextParts.push(`Core growth pattern: ${identity.lifePathNumber}`);
      contextParts.push(`Inner integration pattern: ${identity.arcanaCenter}`);
      contextParts.push(`Personal expression pattern: ${identity.sunSign}`);
      if (identity.moonSign) {
        contextParts.push(`Emotional rhythm pattern: ${identity.moonSign}`);
      }
      contextParts.push(`Body rhythm pattern: ${identity.humanDesignType}`);
      if (additionalContext?.yearlyCycle) {
        contextParts.push(`Yearly Cycle: ${additionalContext.yearlyCycle}`);
      }
      if (additionalContext?.mood) {
        contextParts.push(`Current Mood: ${additionalContext.mood}`);
      }
      if (additionalContext?.emotionalTags && additionalContext.emotionalTags.length > 0) {
        contextParts.push(`Emotional Patterns: ${additionalContext.emotionalTags.join(", ")}`);
      }
      if (additionalContext?.corePattern) {
        contextParts.push(`Core Emotional Pattern: ${additionalContext.corePattern}`);
      }

      const userContext = contextParts.join("\n");

      return `
Kamu adalah AI emotional companion bernama Bhumi.

Tugasmu bukan meramal,
bukan menggurui,
dan bukan memberikan motivasi toxic positivity.

Tugasmu adalah membantu manusia merasa:
dipahami,
dilihat,
dan dipeluk lukanya dengan lembut.

STYLE WAJIB:
- Bahasa Indonesia
- Lembut
- Intimate
- Membumi
- Reflektif
- Hangat
- Tidak terlalu puitis
- Tidak seperti motivator
- Tidak seperti spiritual guru
- Tidak menggunakan bahasa Inggris
- Hindari kalimat klise seperti:
  "kamu kuat",
  "semesta mendukungmu",
  "energi positif"

FORMAT:
- Maksimal 3 paragraf pendek
- Gunakan spacing/napas
- Nyaman dibaca di mobile
- Fokus pada emotional truth
- Berikan gentle awareness
- Tutup dengan grounding ringan

PENTING:
Jangan menyebut label, angka, sistem, atau kategori spiritual user di output.
Terjemahkan semua konteks menjadi bahasa manusia yang alami.
Fokus pada pola emosional di balik kombinasi data tersebut.

========================
USER CONTEXT
========================

${userContext}

========================
OUTPUT
========================

Buat soul reflection personal.
`;
    }

    if (promptKey === "soul-identity") {
      return buildSoulIdentityPrompt({
        user: additionalContext?.user || additionalContext?.profile,
        blueprint: additionalContext?.blueprint,
        language: language === "en" ? "en" : "id",
        memory: request.memory,
        circadian: request.circadian,
        resonanceResult: additionalContext?.resonanceResult,
      });
    }

    if (promptKey === DAILY_GUIDANCE_PROMPT_ID) {
      const memory = request.memory;
      const reflection = request.reflection;
      const journey = request.journey;
      const wellness = request.wellness;
      const potential = request.potential;
      const emotionalMemory = {
        ...additionalContext?.emotionalMemory,
        recurringThemes: memory.dominantThemes?.map((theme: string) => ({
          theme,
          count: 1,
          firstAppeared: "",
          lastAppeared: "",
        })) || additionalContext?.emotionalMemory?.recurringThemes || [],
        recurringWounds: memory.recurringWounds?.map((wound: string) => ({
          wound,
          intensity: "moderate",
          healingProgress: "some-progress",
        })) || additionalContext?.emotionalMemory?.recurringWounds || [],
        nextHealingEdge: memory.healingEdges?.[0] || additionalContext?.emotionalMemory?.nextHealingEdge || null,
      };

      const previousGuidance = (memory.previousReflection || memory.previousDailyNote)
        ? {
            soulReflectionText: memory.previousReflection || "",
            dailyNoteText: memory.previousDailyNote || "",
            generatedAt: "",
          }
        : additionalContext?.previousGuidance || null;

      return buildDailyGuidancePrompt({
        language: language === "en" ? "en" : "id",
        user: additionalContext?.user || additionalContext?.profile,
        blueprint: additionalContext?.blueprint,
        astrologyTransits: additionalContext?.astrologyTransits,
        currentSky: additionalContext?.currentSky,
        houseData: additionalContext?.houseData,
        astroHouseActivations: additionalContext?.astroHouseActivations,
        natalHouses: additionalContext?.natalHouses,
        journalHistory: memory.journalHistory || additionalContext?.journalHistory || [],
        meditationHistory: memory.meditationHistory || additionalContext?.meditationHistory || [],
        audioHealingHistory: memory.audioHealingHistory || additionalContext?.audioHealingHistory || [],
        activityHistory: memory.activityHistory || additionalContext?.activityHistory || null,
        momentumState: additionalContext?.momentumState,
        healingMemory: memory.growthNarrative || additionalContext?.healingMemory || null,
        environmentContext: additionalContext?.environmentContext,
        previousGuidance,
        identity: request.identity as any,
        emotionalState: additionalContext?.emotionalState,
        emotionalMemory,
        healingProgress: additionalContext?.healingProgress,
        adaptiveContext: additionalContext?.adaptiveContext,
        reflectionContext: reflection,
        journeyContext: journey,
        wellnessContext: wellness,
        potentialContext: potential,
        humanMeaning: additionalContext?.humanMeaning, // V4 Canonical Meaning
        isWeeklyRecommendation: additionalContext?.isWeeklyRecommendation === true,
        weeklyGrowthSignals: additionalContext?.weeklyGrowthSignals,
        recentHealthContext: additionalContext?.recentHealthContext,
        dailyState: additionalContext?.dailyState ?? additionalContext?.wellnessState,
        wellnessState: additionalContext?.wellnessState,
        recentDailyStates: additionalContext?.recentDailyStates,
        timeHorizon: additionalContext?.timeHorizon,
        generatedAt: additionalContext?.generatedAt || new Date().toISOString(),
      } as any);
    }

    throw new Error(`Unknown prompt key: ${promptKey}`);
  }
}
