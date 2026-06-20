import { DailyIntelligenceObject } from "@/lib/types/dailyIntelligence";
import { simpleHash } from "@/lib/utils/hashing";

export const dailyIntelligenceEngine = {
  async synthesize(input: any): Promise<DailyIntelligenceObject> {
    const { uid, date, blueprint, journey, wellness, dailyState, astrology } = input;
    const issueKey = this.deriveIssue(wellness, blueprint);
    const navigatorMode = (wellness?.mode || "REFLECTION") as "RECOVERY" | "REFLECTION" | "GROWTH";
    const journeyStage = this.calculateStage(journey);
    const theme = this.pickTheme(issueKey, astrology);
    const focus = this.pickFocus(theme, dailyState);
    const voiceTone = this.deriveTone(navigatorMode, journeyStage);
    const seed = simpleHash(`${uid}|${date}`);
    return {
      uid,
      localDateKey: date,
      seed,
      theme,
      focus,
      issueKey,
      navigatorMode,
      journeyStage,
      emotion: dailyState?.emotion || "Steady",
      challenge: "Mengenali batasan diri harian.",
      growth: "Memberi ruang untuk jeda sadar.",
      suggestion: "Tutup mata sejenak dan tarik napas dalam.",
      energyLevel: dailyState?.energy || 5,
      dominantSignal: "WELLNESS:SYNC",
      confidence: 0.85,
      voiceTone,
      reflectionSeed: simpleHash(`${seed}|poetic`),
      guidanceSeed: simpleHash(`${seed}|practical`),
      generatedAt: new Date().toISOString(),
      memoryHash: input.memoryHash || "",
    };
  },

  deriveIssue(wellness: any, blueprint: any): string {
    return wellness?.issueKey || "general";
  },

  calculateStage(journey: any): number {
    return journey?.stage || 1;
  },

  pickTheme(issue: string, astrology: any): string {
    return "Keseimbangan";
  },

  pickFocus(theme: string, state: any): string {
    return "Pusat Diri";
  },

  deriveTone(mode: "RECOVERY" | "REFLECTION" | "GROWTH", stage: number): "steady" | "warm" | "direct" | "poetic" {
    if (mode === "RECOVERY") return "warm";
    if (mode === "GROWTH") return "direct";
    return "steady";
  }
};
