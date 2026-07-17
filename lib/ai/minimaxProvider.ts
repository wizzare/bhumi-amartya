import OpenAI from "openai";
import { AIProvider } from "./provider";
import { AI_CONFIG } from "./config";
import { TimeoutError, ProviderError } from "./errors";
import { dgCheckpoint, dgProviderFailure } from "./dailyGuidanceForensics";

/**
 * MiniMaxProvider
 *
 * Default AI provider for Bhumi Amartya V4 (Build 4.1.4).
 * Implements the standard AIProvider interface so it can be swapped
 * in/out of the registry without touching the gateway, prompt registry,
 * or any orchestrator.
 *
 * The MiniMax API is OpenAI-compatible, so we use the OpenAI SDK
 * pointed at the configured MiniMax base URL.
 */
export class MiniMaxProvider implements AIProvider {
  public id = "minimax";
  public defaultModel = AI_CONFIG.providers.minimax.defaultModel;

  private getClient() {
    const apiKey =
      AI_CONFIG.providers.minimax.apiKey || process.env.MINIMAX_API_KEY || "";
    if (!apiKey) {
      throw new Error("Missing MINIMAX_API_KEY for server-side AI generation.");
    }
    return new OpenAI({
      apiKey,
      baseURL: AI_CONFIG.providers.minimax.baseUrl,
    });
  }

  public async generateText(
    prompt: string,
    options: { model?: string; temperature?: number; maxTokens?: number; timeoutMs?: number }
  ): Promise<string> {
    const forensicStart = Date.now();
    const client = this.getClient();
    const model = options.model || this.defaultModel;
    const timeout = options.timeoutMs || AI_CONFIG.timeoutMs;

    console.log("[AI_PROVIDER] minimax");
    console.log(`[AI_PROVIDER_REQUEST] model=${model} timeoutMs=${timeout}`);

    const apiCall = client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 900,
    });
    dgCheckpoint("DG-8", forensicStart, {
      file: "lib/ai/minimaxProvider.ts",
      function: "generateText",
      line: 51,
      provider: "minimax",
      model,
      activeProvider: AI_CONFIG.activeProvider,
      minimaxEndpoint: AI_CONFIG.providers.minimax.baseUrl,
      promptLength: prompt.length,
      timeout,
      retryCount: null,
      input: {
        model,
        temperature: options.temperature ?? 0.7,
        maxTokens: options.maxTokens ?? 900,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new TimeoutError("MiniMax request timed out")), timeout)
    );

    try {
      const response = await Promise.race([apiCall, timeoutPromise]);
      const text = response.choices[0]?.message?.content || "";
      console.log(`[AI_PROVIDER_RESPONSE] model=${model} length=${text.length}`);
      dgCheckpoint("DG-9", forensicStart, {
        file: "lib/ai/minimaxProvider.ts",
        function: "generateText",
        line: 73,
        provider: "minimax",
        model,
        activeProvider: AI_CONFIG.activeProvider,
        minimaxEndpoint: AI_CONFIG.providers.minimax.baseUrl,
        promptLength: prompt.length,
        responseLength: text.length,
        output: {
          id: response.id,
          model: response.model,
          choices: response.choices.length,
          textLength: text.length,
        },
      });
      return text;
    } catch (error: any) {
      console.error(
        `[AI_PROVIDER_ERROR] minimax model=${model} code=${error?.code || error?.status || "UNKNOWN"}`
      );
      dgProviderFailure("DG-8", forensicStart, {
        file: "lib/ai/minimaxProvider.ts",
        functionName: "generateText",
        line: 92,
        error,
        input: {
          model,
          temperature: options.temperature ?? 0.7,
          maxTokens: options.maxTokens ?? 900,
        },
        prompt,
        timeoutMs: timeout,
        retryCount: 0,
        extra: {
          provider: "minimax",
          model,
          activeProvider: AI_CONFIG.activeProvider,
          httpStatus: error?.status ?? null,
          providerResponseBody: error?.response?.body ?? error?.error ?? error?.message ?? null,
        },
      });
      if (error instanceof TimeoutError) {
        throw error;
      }
      throw new ProviderError(
        error?.message || "MiniMax generation failed",
        error?.code || "MINIMAX_ERROR"
      );
    }
  }

  public async generateJson<T>(
    prompt: string,
    options: { model?: string; temperature?: number; maxTokens?: number; timeoutMs?: number }
  ): Promise<T> {
    const forensicStart = Date.now();
    const text = await this.generateText(prompt, options);
    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    try {
      const parsed = JSON.parse(cleaned) as T;
      dgCheckpoint("DG-10", forensicStart, {
        file: "lib/ai/minimaxProvider.ts",
        function: "generateJson",
        line: 127,
        provider: "minimax",
        model: options.model || this.defaultModel,
        activeProvider: AI_CONFIG.activeProvider,
        minimaxEndpoint: AI_CONFIG.providers.minimax.baseUrl,
        promptLength: prompt.length,
        responseLength: text.length,
        jsonLength: cleaned.length,
        output: { parsed: Boolean(parsed) },
      });
      return parsed;
    } catch (e: any) {
      console.error("[DG-10 RAW_RESPONSE_BEFORE_PARSE]", text);
      dgProviderFailure("DG-10", forensicStart, {
        file: "lib/ai/minimaxProvider.ts",
        functionName: "generateJson",
        line: 143,
        error: e,
        input: { model: options.model || this.defaultModel },
        prompt,
        rawResponse: text,
        timeoutMs: options.timeoutMs || AI_CONFIG.timeoutMs,
        retryCount: 0,
        extra: {
          provider: "minimax",
          model: options.model || this.defaultModel,
          activeProvider: AI_CONFIG.activeProvider,
          jsonLength: cleaned.length,
        },
      });
      throw new ProviderError(
        `Invalid JSON returned by MiniMax: ${e.message}`,
        "JSON_PARSE_ERROR"
      );
    }
  }
}
