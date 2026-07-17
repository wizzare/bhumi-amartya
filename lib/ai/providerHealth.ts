import { AI_CONFIG } from "./config";

/**
 * Provider Health Check
 *
 * Validates that the configured AI provider has its required
 * environment variables present at startup.
 *
 * IMPORTANT: Never logs or returns the actual API key value.
 * Only reports presence (✓ Present) or absence (✗ Missing).
 */

export type ProviderHealth = {
  id: string;
  label: string;
  configured: boolean;
  apiKeyPresent: boolean;
  baseUrl: string | null;
  defaultModel: string;
};

export type ProviderHealthReport = {
  activeProvider: string;
  activeConfigured: boolean;
  providers: ProviderHealth[];
  checkedAt: string;
};

function mask(value: string | undefined | null): string {
  if (!value) return "";
  if (value.length <= 8) return "***";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function checkProvider(
  id: string,
  label: string,
  apiKey: string | undefined | null,
  baseUrl: string | undefined | null,
  defaultModel: string
): ProviderHealth {
  return {
    id,
    label,
    configured: Boolean(apiKey),
    apiKeyPresent: Boolean(apiKey),
    baseUrl: baseUrl ?? null,
    defaultModel,
  };
}

export function getProviderHealth(): ProviderHealthReport {
  const providers: ProviderHealth[] = [
    checkProvider(
      "minimax",
      "MiniMax",
      AI_CONFIG.providers.minimax.apiKey || process.env.MINIMAX_API_KEY,
      AI_CONFIG.providers.minimax.baseUrl || process.env.MINIMAX_BASE_URL,
      AI_CONFIG.providers.minimax.defaultModel
    ),
    checkProvider(
      "nvidia",
      "NVIDIA",
      AI_CONFIG.providers.nvidia.apiKey || process.env.NVIDIA_API_KEY,
      AI_CONFIG.providers.nvidia.baseUrl || process.env.NVIDIA_BASE_URL,
      AI_CONFIG.providers.nvidia.defaultModel
    ),
    checkProvider(
      "gemini",
      "Gemini",
      AI_CONFIG.providers.gemini.apiKey || process.env.GEMINI_API_KEY,
      null,
      AI_CONFIG.providers.gemini.defaultModel
    ),
    checkProvider(
      "openrouter",
      "OpenRouter",
      AI_CONFIG.providers.openrouter.apiKey || process.env.OPENROUTER_API_KEY,
      AI_CONFIG.providers.openrouter.baseUrl,
      AI_CONFIG.providers.openrouter.defaultModel
    ),
  ];

  const activeProvider = AI_CONFIG.activeProvider;
  const active = providers.find((p) => p.id === activeProvider);

  return {
    activeProvider,
    activeConfigured: active?.apiKeyPresent ?? false,
    providers,
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Logs a startup banner showing which providers are configured.
 * Does NOT expose API key values.
 */
export function logProviderHealth(): ProviderHealthReport {
  const report = getProviderHealth();

  console.log("\n========================================================");
  console.log("[AI_PROVIDER_HEALTH] Startup validation");
  console.log("========================================================");
  console.log(`[AI_PROVIDER_HEALTH] Active provider: ${report.activeProvider}`);

  for (const p of report.providers) {
    const status = p.apiKeyPresent ? "✓ Present" : "✗ Missing";
    const activeTag = p.id === report.activeProvider ? " (ACTIVE)" : "";
    console.log(
      `[AI_PROVIDER_HEALTH] ${p.label} API Key: ${status}${activeTag} | model: ${p.defaultModel}`
    );
  }

  console.log("========================================================\n");

  return report;
}

/**
 * Convenience helpers for external callers that want to assert
 * a specific provider's API key presence without exposing the value.
 */
export function isProviderConfigured(providerId: string): boolean {
  const report = getProviderHealth();
  const provider = report.providers.find((p) => p.id === providerId);
  return provider?.apiKeyPresent ?? false;
}

export function getActiveProviderId(): string {
  return AI_CONFIG.activeProvider;
}

// Export masked helpers in case external tools need safe introspection.
export const _internal = { mask };
