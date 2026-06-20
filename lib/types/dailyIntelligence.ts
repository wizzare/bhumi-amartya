export interface DailyIntelligenceObject {
  uid: string;
  localDateKey: string;
  seed: string;
  theme: string;
  focus: string;
  issueKey: string;
  navigatorMode: "RECOVERY" | "REFLECTION" | "GROWTH";
  journeyStage: number;
  emotion: string;
  challenge: string;
  growth: string;
  suggestion: string;
  energyLevel: number;
  dominantSignal: string;
  confidence: number;
  voiceTone: "steady" | "warm" | "direct" | "poetic";
  reflectionSeed: string;
  guidanceSeed: string;
  generatedAt: string;
  memoryHash: string;
}
