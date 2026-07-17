import { AI_CONFIG } from "./config";

export interface AIProvider {
  id: string;
  defaultModel: string;
  
  generateText(
    prompt: string, 
    options: { model?: string; temperature?: number; maxTokens?: number; timeoutMs?: number }
  ): Promise<string>;
  
  generateJson<T>(
    prompt: string, 
    options: { model?: string; temperature?: number; maxTokens?: number; timeoutMs?: number }
  ): Promise<T>;
}

export class AIProviderRegistry {
  private static providers = new Map<string, AIProvider>();

  public static register(provider: AIProvider) {
    this.providers.set(provider.id, provider);
  }

  public static get(id: string): AIProvider {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new Error(`AI Provider ${id} is not registered.`);
    }
    return provider;
  }

  public static getAll(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  public static getAvailableProviders(): AIProvider[] {
    const registered = this.getAll();
    return registered.filter(provider => {
      const isDisabled = process.env[`DISABLE_${provider.id.toUpperCase()}`] === "true";
      if (isDisabled) return false;

      const config = (AI_CONFIG.providers as any)[provider.id];
      const apiKey = config?.apiKey || process.env[`${provider.id.toUpperCase()}_API_KEY`] || "";
      return apiKey.trim().length > 0;
    });
  }
}
