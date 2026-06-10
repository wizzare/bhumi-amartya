import { generateGeminiJson } from "@/lib/ai/gemini";
import { generateAdaptiveDailyPractices } from "@/lib/dailyGuidance/adaptiveDailyPracticeGenerator";
import { buildUnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";
import { generateLocalDailyGuidance } from "@/lib/orchestrators/localDailyGuidanceFallback";
import { buildDailyGuidancePrompt } from "@/lib/prompts/dailyGuidancePrompt";
import type { DailyGuidanceInput, DailyGuidanceOutput } from "@/lib/orchestrators/types";

type DailyPracticeCategory = "grounding" | "reflection" | "action";

function assertString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Daily guidance response is missing ${field}.`);
  }
}

function normalizeOutput(output: DailyGuidanceOutput, input: DailyGuidanceInput): DailyGuidanceOutput {
  const synthesis = buildUnifiedBlueprintSynthesis({
    language: input.language,
    profile: input.user as unknown as Record<string, unknown>,
    blueprint: input.blueprint as unknown as Record<string, unknown>,
    astrologyToday: input.astrologyTransits?.summary,
    adaptiveContext: input.adaptiveContext,
  });

  assertString(output.soulReflectionText || output.soulReflection?.dailyMessage, "soulReflectionText");
  assertString(output.dailyNoteText || output.companionReflection?.preview, "dailyNoteText");
  assertString(output.astroEnergy?.currentEnergy, "astroEnergy.currentEnergy");
  assertString(output.shadowInsight, "shadowInsight");
  assertString(output.meditationRecommendation?.title, "meditationRecommendation.title");
  assertString(output.healingRecommendation?.title, "healingRecommendation.title");
  assertString(output.journalingPrompt?.prompt, "journalingPrompt.prompt");
  assertString(output.healingAudio?.title, "healingAudio.title");

  const generatedPractices = input.adaptiveContext
    ? generateAdaptiveDailyPractices({
      date: input.adaptiveContext.dailyVariationSeed,
      language: input.language,
      profile: input.user as unknown as Record<string, unknown>,
      blueprint: input.blueprint as unknown as Record<string, unknown>,
      astrologyToday: input.astrologyTransits?.summary,
      adaptiveContext: input.adaptiveContext,
      aiPractices: output.dailyInnerwork?.tasks?.map((task) => ({
        id: task.id,
        title: task.task,
        description: task.instruction,
        estimatedMinutes: task.duration,
        completed: task.completed,
      })),
    })
    : null;

  const tasks = generatedPractices
    ? generatedPractices.map((practice) => ({
      id: practice.id,
      task: practice.title,
      duration: practice.estimatedMinutes ?? 10,
      category: (practice.category ?? practice.id) as DailyPracticeCategory,
      emoji: practice.id === "grounding" ? "o" : practice.id === "reflection" ? "*" : "->",
      purpose: practice.id === "grounding"
        ? "Regulate the nervous system before the day expands."
        : practice.id === "reflection"
          ? "Turn yesterday's pattern into one compassionate insight."
          : "Translate inner clarity into a small real-life completion.",
      instruction: practice.description,
      completed: false,
    }))
    : (output.dailyInnerwork?.tasks || []).map((task, index) => ({
      ...task,
      id: task.id || `innerwork-${index + 1}`,
      completed: false,
    }));
  const totalDuration = tasks.reduce((sum, task) => sum + Number(task.duration || 0), 0);

  return {
    ...output,
    blueprintSummary: output.blueprintSummary || synthesis.blueprintSummary,
    dailyInnerwork: {
      ...output.dailyInnerwork,
      tasks,
      totalDuration,
    },
  };
}

export async function generateDailyGuidance(
  input: DailyGuidanceInput,
): Promise<DailyGuidanceOutput> {
  const prompt = buildDailyGuidancePrompt(input);
  const output = await generateGeminiJson<DailyGuidanceOutput>(prompt).catch(() =>
    generateLocalDailyGuidance(input),
  );

  return normalizeOutput(output, input);
}
