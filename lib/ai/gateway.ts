import { AIRequest, AIResponse, LanguageContext } from "./types";
import { CircadianContext, MemoryContext, ReflectionContext, JourneyContext, WellnessContext, PotentialContext } from "../livingIntelligence/types";
import { AIProviderRegistry } from "./provider";
import { PromptRegistry } from "./prompts/registry";
import { AI_CONFIG } from "./config";
import { NvidiaProvider } from "./nvidia";
import { GeminiProvider } from "./geminiProvider";
import { OpenRouterProvider } from "./openrouterProvider";
import { MiniMaxProvider } from "./minimaxProvider";
import { generateLocalDailyGuidance } from "../orchestrators/localDailyGuidanceFallback";
import { CanonicalTranslatorService } from "../services/canonicalTranslatorService";
import { HumanMeaningService } from "../services/humanMeaningService";
import { ValidationError } from "./errors";
import { logProviderHealth } from "./providerHealth";
import { dgCheckpoint, dgFailure, dgProviderFailure } from "./dailyGuidanceForensics";
import { runProviderCascade } from "./providerCascade";

// Export compatibility context types for future Sprint usage
export type { CircadianContext, MemoryContext, LanguageContext, ReflectionContext, JourneyContext, WellnessContext, PotentialContext };

// Register all providers at module load time
// Priority: MiniMax (default) -> Gemini -> OpenRouter -> Local Deterministic Fallback
AIProviderRegistry.register(new MiniMaxProvider());
AIProviderRegistry.register(new NvidiaProvider());
AIProviderRegistry.register(new GeminiProvider());
AIProviderRegistry.register(new OpenRouterProvider());

// Run startup health validation (logs presence, never values)
logProviderHealth();

export class AIGateway {
  public static async generateStructuredJson<T>(
    request: AIRequest
  ): Promise<AIResponse<T>> {
    const startTime = Date.now();
    const promptKey = request.promptKey;
    const language = request.language;

    if (!promptKey) {
      throw new ValidationError("Missing promptKey in AIRequest");
    }

    const providerId = request.additionalContext?.provider || AI_CONFIG.activeProvider;
    const model = request.additionalContext?.model || AI_CONFIG.defaultModel;
    dgCheckpoint("DG-7", startTime, {
      file: "lib/ai/gateway.ts",
      function: "generateStructuredJson",
      line: 47,
      provider: providerId,
      model,
      activeProvider: AI_CONFIG.activeProvider,
      minimaxEndpoint: AI_CONFIG.providers.minimax.baseUrl,
      input: {
        promptKey,
        language,
        hasIdentity: Boolean(request.identity),
        hasMemory: Boolean(request.memory),
        hasJourney: Boolean(request.journey),
      },
    });

    let prompt = "";
    try {
      prompt = PromptRegistry.buildPrompt(request);
      dgCheckpoint("DG-6", startTime, {
        file: "lib/ai/gateway.ts",
        function: "PromptRegistry.buildPrompt",
        line: 63,
        provider: providerId,
        model,
        activeProvider: AI_CONFIG.activeProvider,
        minimaxEndpoint: AI_CONFIG.providers.minimax.baseUrl,
        promptLength: prompt.length,
        output: { promptLength: prompt.length },
      });
    } catch (err: any) {
      dgFailure("DG-6", startTime, {
        file: "lib/ai/gateway.ts",
        functionName: "PromptRegistry.buildPrompt",
        line: 73,
        error: err,
        input: request,
        output: null,
        extra: { provider: providerId, model, activeProvider: AI_CONFIG.activeProvider },
      });
      return {
        ok: false,
        error: {
          code: "PROMPT_BUILD_ERROR",
          message: err.message || "Failed to build prompt",
        },
        provider: providerId,
        model,
        elapsedMs: Date.now() - startTime,
      };
    }

    const temperature = request.temperature ?? 0.7;
    const maxTokens = request.maxTokens ?? 900;
    const timeoutMs = AI_CONFIG.timeoutMs;

    const result = await runProviderCascade<T>({
      providers: AIProviderRegistry.getAvailableProviders(),
      requestedProviderId: request.additionalContext?.provider,
      activeProviderId: AI_CONFIG.activeProvider,
      requestedModel: request.additionalContext?.model,
      prompt,
      temperature,
      maxTokens,
      timeoutMs,
      validate: request.validateResponse
        ? ((value: unknown): value is T => request.validateResponse?.(value) === true)
        : undefined,
      fallback: () => this.executeLocalFallback<T>(promptKey, request),
      startedAt: startTime,
    });

    for (const attempt of result.metadata?.providerTrace ?? []) {
      if (!attempt.error) continue;
      dgProviderFailure("DG-8", startTime, {
        file: "lib/ai/gateway.ts",
        functionName: "generateStructuredJson",
        line: 104,
        error: new Error(attempt.error),
        input: { promptKey, language, provider: attempt.provider, model: attempt.model },
        prompt,
        timeoutMs,
        retryCount: 0,
        extra: { activeProvider: AI_CONFIG.activeProvider },
      });
    }

    dgCheckpoint(result.provider === "local-fallback" ? "DG-11" : "DG-10", startTime, {
      file: "lib/ai/gateway.ts",
      function: "generateStructuredJson",
      line: 121,
      provider: result.provider,
      model: result.model,
      activeProvider: AI_CONFIG.activeProvider,
      promptLength: prompt.length,
      output: { ok: result.ok, attempts: result.metadata?.attempts ?? 0 },
    });
    return result;
  }

  private static executeLocalFallback<T>(promptKey: string, request: AIRequest): T {
    if (promptKey === "daily-guidance") {
      const input = {
        language: request.language,
        user: request.additionalContext?.user || request.additionalContext?.profile,
        blueprint: request.additionalContext?.blueprint,
        astrologyTransits: request.additionalContext?.astrologyTransits,
        currentSky: request.additionalContext?.currentSky,
        houseData: request.additionalContext?.houseData,
        astroHouseActivations: request.additionalContext?.astroHouseActivations,
        natalHouses: request.additionalContext?.natalHouses,
        journalHistory: request.additionalContext?.journalHistory,
        meditationHistory: request.additionalContext?.meditationHistory,
        audioHealingHistory: request.additionalContext?.audioHealingHistory,
        activityHistory: request.additionalContext?.activityHistory,
        momentumState: request.additionalContext?.momentumState,
        healingMemory: request.additionalContext?.healingMemory,
        environmentContext: request.additionalContext?.environmentContext,
        previousGuidance: request.additionalContext?.previousGuidance,
        identity: request.identity,
        emotionalState: request.additionalContext?.emotionalState,
        emotionalMemory: request.additionalContext?.emotionalMemory,
        healingProgress: request.additionalContext?.healingProgress,
        adaptiveContext: request.additionalContext?.adaptiveContext,
      };
      
      const fallbackResult = generateLocalDailyGuidance(input as any);
      return fallbackResult as unknown as T;
    }

    if (promptKey === "soul-identity") {
      const blueprint = request.additionalContext?.blueprint;
      if (!blueprint) {
        throw new Error("Missing blueprint in additionalContext for soul-identity fallback");
      }
      const canonical = CanonicalTranslatorService.translate(blueprint);
      const meaning = HumanMeaningService.generate(canonical, undefined);
      return meaning.soulIdentity as unknown as T;
    }

    throw new Error(`No local fallback template registered for prompt key: ${promptKey}`);
  }
}
