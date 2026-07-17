import OpenAI from "openai";
import { AIProvider } from "./provider";
import { AI_CONFIG } from "./config";
import { TimeoutError, ProviderError } from "./errors";

export class OpenRouterProvider implements AIProvider {
  public id = "openrouter";
  public defaultModel = AI_CONFIG.providers.openrouter.defaultModel;

  private getClient() {
    const apiKey = AI_CONFIG.providers.openrouter.apiKey || process.env.OPENROUTER_API_KEY || "";
    if (!apiKey) {
      throw new Error("Missing OPENROUTER_API_KEY for server-side AI generation.");
    }
    return new OpenAI({
      apiKey,
      baseURL: AI_CONFIG.providers.openrouter.baseUrl,
    });
  }

  public async generateText(
    prompt: string, 
    options: { model?: string; temperature?: number; maxTokens?: number; timeoutMs?: number }
  ): Promise<string> {
    const client = this.getClient();
    const model = options.model || this.defaultModel;
    const timeout = options.timeoutMs || AI_CONFIG.timeoutMs;
    
    const apiCall = client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 900,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new TimeoutError("OpenRouter request timed out")), timeout)
    );

    try {
      const response = await Promise.race([apiCall, timeoutPromise]);
      return response.choices[0]?.message?.content || "";
    } catch (error: any) {
      if (error instanceof TimeoutError) {
        throw error;
      }
      throw new ProviderError(error?.message || "OpenRouter generation failed", error?.code || "OPENROUTER_ERROR");
    }
  }

  public async generateJson<T>(
    prompt: string, 
    options: { model?: string; temperature?: number; maxTokens?: number; timeoutMs?: number }
  ): Promise<T> {
    const text = await this.generateText(prompt, options);
    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();
    
    try {
      return JSON.parse(cleaned) as T;
    } catch (e: any) {
      throw new ProviderError(`Invalid JSON returned by OpenRouter: ${e.message}`, "JSON_PARSE_ERROR");
    }
  }
}
