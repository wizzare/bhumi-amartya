import { dailyGuidanceDocId, dailyGuidanceRepository } from "@/lib/repositories/dailyGuidanceRepository";
import { generateGeminiJson } from "@/lib/ai/gemini";
import { buildDailyGuidancePrompt } from "@/lib/prompts/dailyGuidancePrompt";
import { DailyIntelligenceObject } from "@/lib/types/dailyIntelligence";

export const dailyGuidanceEngine = {
  async generateLanguageFace(brain: DailyIntelligenceObject, context: any): Promise<any> {
    const prompt = buildDailyGuidancePrompt({ ...context, brain });
    try {
      const aiOutput = await generateGeminiJson(prompt);
      return this.mapToGuidance(brain, aiOutput);
    } catch (e) {
      return this.generateFallbackFace(brain);
    }
  },

  mapToGuidance(brain: DailyIntelligenceObject, output: any): any {
    return {
      uid: brain.uid,
      localDateKey: brain.localDateKey,
      theme: brain.theme,
      focus: brain.focus,
      soulReflectionText: output.soulReflectionText || output.soulReflection?.dailyMessage || "",
      dailyNoteText: output.dailyNoteText || output.companionReflection?.preview || "",
      categories: output.categories || null,
      generatedAt: new Date().toISOString(),
      memoryHash: brain.memoryHash,
      source: "ai"
    };
  },

  generateFallbackFace(brain: DailyIntelligenceObject): any {
    return {
      uid: brain.uid,
      localDateKey: brain.localDateKey,
      theme: brain.theme,
      focus: brain.focus,
      soulReflectionText: "Hari ini tentang .",
      dailyNoteText: "Fokus harimu adalah .",
      categories: {
        general: { insight: "Hari ini tentang keseimbangan diri.", reason: "", advice: "Jaga fokusmu." },
        mental: { insight: "Pikiranmu stabil.", reason: "", advice: "Jaga ketenangan." },
        finance: { insight: "Fokus pada kestabilan keuangan.", reason: "", advice: "Kelola dengan baik." },
        love: { insight: "Fokus pada keharmonisan.", reason: "", advice: "Dengarkan pasangan." },
        relational: { insight: "Relasimu berjalan baik.", reason: "", advice: "Jaga komunikasi." },
        spiritual: { insight: "Pertumbuhan batinmu berjalan.", reason: "", advice: "Dengarkan dirimu." },
        challenges: { insight: "Hadapi rintangan dengan tenang.", reason: "", advice: "Ambil langkah perlahan." },
        opportunities: { insight: "Peluang baru ada di depan.", reason: "", advice: "Manfaatkan dengan bijak." }
      },
      generatedAt: new Date().toISOString(),
      memoryHash: brain.memoryHash,
      source: "fallback"
    };
  }
};