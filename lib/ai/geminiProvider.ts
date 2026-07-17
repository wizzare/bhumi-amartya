import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "./provider";
import { AI_CONFIG } from "./config";
import { TimeoutError, ProviderError } from "./errors";

export class GeminiProvider implements AIProvider {
  public id = "gemini";
  public defaultModel = AI_CONFIG.providers.gemini.defaultModel;

  private getClient() {
    const apiKey = AI_CONFIG.providers.gemini.apiKey || process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY for server-side AI generation.");
    }
    return new GoogleGenerativeAI(apiKey);
  }

  public async generateText(
    prompt: string, 
    options: { model?: string; temperature?: number; maxTokens?: number; timeoutMs?: number }
  ): Promise<string> {
    const genAI = this.getClient();
    const modelName = options.model || this.defaultModel;
    const timeout = options.timeoutMs || AI_CONFIG.timeoutMs;

    const model = genAI.getGenerativeModel({
      model: modelName,
    });

    const apiCall = model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 900,
      }
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new TimeoutError("Gemini request timed out")), timeout)
    );

    try {
      const result = await Promise.race([apiCall, timeoutPromise]);
      return result.response.text();
    } catch (error: any) {
      if (error instanceof TimeoutError) {
        throw error;
      }
      throw new ProviderError(error?.message || "Gemini generation failed", error?.status || "GEMINI_ERROR");
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
      throw new ProviderError(`Invalid JSON returned by Gemini: ${e.message}`, "JSON_PARSE_ERROR");
    }
  }
}
