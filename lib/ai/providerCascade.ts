import type { AIExecutionMetadata, AIResponse } from "./types";
import type { AIProvider } from "./provider";

export interface ProviderCascadeOptions<T> {
  providers: AIProvider[];
  requestedProviderId?: string;
  activeProviderId?: string;
  requestedModel?: string;
  prompt: string;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
  validate?: (value: unknown) => value is T;
  fallback: () => T;
  startedAt?: number;
}

export function orderProviders(
  providers: AIProvider[],
  requestedProviderId?: string,
  activeProviderId?: string,
): AIProvider[] {
  const byId = new Map(providers.map((provider) => [provider.id, provider]));
  const ordered: AIProvider[] = [];
  const added = new Set<string>();

  const add = (id?: string) => {
    if (!id || added.has(id)) return;
    const provider = byId.get(id);
    if (!provider) return;
    ordered.push(provider);
    added.add(id);
  };

  add(requestedProviderId);
  add(activeProviderId);
  providers.forEach((provider) => add(provider.id));
  return ordered;
}

export async function runProviderCascade<T>(
  options: ProviderCascadeOptions<T>,
): Promise<AIResponse<T>> {
  const startedAt = options.startedAt ?? Date.now();
  const providers = orderProviders(
    options.providers,
    options.requestedProviderId,
    options.activeProviderId,
  );
  const providerTrace: AIExecutionMetadata["providerTrace"] = [];
  const failureReasons: Record<string, string> = {};

  for (const provider of providers) {
    const model = options.requestedModel || provider.defaultModel;
    try {
      const data = await provider.generateJson<T>(options.prompt, {
        model,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        timeoutMs: options.timeoutMs,
      });
      if (options.validate && !options.validate(data)) {
        throw new Error("SCHEMA_VALIDATION_FAILED");
      }
      providerTrace.push({ provider: provider.id, model });
      return {
        ok: true,
        data,
        provider: provider.id,
        model,
        elapsedMs: Date.now() - startedAt,
        metadata: {
          attempts: providerTrace.length,
          providerTrace,
          failureReasons,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failureReasons[provider.id] = message;
      providerTrace.push({ provider: provider.id, model, error: message });
    }
  }

  const fallbackReason = providers.length === 0
    ? "no_providers_with_credentials"
    : "all_providers_failed";
  try {
    const data = options.fallback();
    if (options.validate && !options.validate(data)) {
      throw new Error("FALLBACK_SCHEMA_VALIDATION_FAILED");
    }
    return {
      ok: true,
      data,
      provider: "local-fallback",
      model: "local-deterministic-template",
      elapsedMs: Date.now() - startedAt,
      metadata: {
        attempts: providerTrace.length,
        providerTrace,
        failureReasons,
        fallbackReason,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      error: {
        code: "GATEWAY_FAILURE_WITH_FALLBACK_ERROR",
        message,
      },
      provider: "local-fallback",
      model: "local-deterministic-template",
      elapsedMs: Date.now() - startedAt,
      metadata: {
        attempts: providerTrace.length,
        providerTrace,
        failureReasons,
        fallbackReason: "all_providers_and_fallback_failed",
      },
    };
  }
}
