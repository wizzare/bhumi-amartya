export const AI_CONFIG = {
  activeProvider: process.env.AI_PROVIDER || "minimax",
  defaultModel: process.env.AI_MODEL || "MiniMax/MiniMax-M2",
  timeoutMs: Number(process.env.AI_TIMEOUT_MS) || 15000, // 15 seconds boundary
  maxRetries: Number(process.env.AI_MAX_RETRIES) || 1, // Retry exactly once on transient errors

  providers: {
    minimax: {
      baseUrl: process.env.MINIMAX_BASE_URL || "https://api.minimax.chat/v1",
      apiKey: process.env.MINIMAX_API_KEY || "",
      defaultModel: process.env.MINIMAX_MODEL || "MiniMax/MiniMax-M2",
    },
    nvidia: {
      baseUrl: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
      apiKey: process.env.NVIDIA_API_KEY || "",
      defaultModel: "moonshotai/kimi-k2.6",
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || "",
      defaultModel: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    },
    openrouter: {
      baseUrl: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY || "",
      defaultModel: "moonshotai/kimi-k2.6",
    }
  }
};
