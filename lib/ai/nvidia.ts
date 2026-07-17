import OpenAI from "openai";
import { AIProvider } from "./provider";
import { AI_CONFIG } from "./config";
import { TimeoutError, ProviderError } from "./errors";

export class NvidiaProvider implements AIProvider {
  public id = "nvidia";
  public defaultModel = AI_CONFIG.providers.nvidia.defaultModel;

  private getClient() {
    const apiKey = AI_CONFIG.providers.nvidia.apiKey || process.env.NVIDIA_API_KEY || "";
    if (!apiKey) {
      throw new Error("Missing NVIDIA_API_KEY for server-side AI generation.");
    }
    return new OpenAI({
      apiKey,
      baseURL: AI_CONFIG.providers.nvidia.baseUrl,
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
      setTimeout(() => reject(new TimeoutError("Nvidia NIM request timed out")), timeout)
    );

    try {
      const response = await Promise.race([apiCall, timeoutPromise]);
      return response.choices[0]?.message?.content || "";
    } catch (error: any) {
      if (error instanceof TimeoutError) {
        throw error;
      }
      throw new ProviderError(error?.message || "Nvidia NIM generation failed", error?.code || "NVIDIA_ERROR");
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
      throw new ProviderError(`Invalid JSON returned by Nvidia NIM: ${e.message}`, "JSON_PARSE_ERROR");
    }
  }
}
