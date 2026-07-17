import { MemoryContext, CircadianContext, ReflectionContext, JourneyContext, WellnessContext, PotentialContext } from "../livingIntelligence/types";

export type Language = "id" | "ms" | "en";

export interface LanguageContext {
  language: Language;
}

export interface IdentitySnapshot {
  uid: string;
  fullName: string;
  lifePathNumber: number;
  lifePathRole: string;
  arcanaCenter: number;
  humanDesignType: string;
  humanDesignProfile: string;
  authority: string;
  strategy: string;
  sunSign: string;
  moonSign: string;
  ascendant: string;
  derivedNumerology: any;
}

export interface AIRequest {
  promptKey: string;             // e.g. "mirror", "compass", "daily-guidance", "soul-identity"
  language: Language;
  identity: IdentitySnapshot;
  memory: MemoryContext;
  reflection?: ReflectionContext;
  journey?: JourneyContext;
  wellness?: WellnessContext;
  potential?: PotentialContext;
  circadian?: CircadianContext;
  languageContext?: LanguageContext;
  additionalContext?: Record<string, any>;
  temperature?: number;
  maxTokens?: number;
  validateResponse?: (value: unknown) => boolean;
}

export interface AIExecutionMetadata {
  attempts: number;
  providerTrace: Array<{ provider: string; model: string; error?: string }>;
  failureReasons: Record<string, string>;
  fallbackReason?: string;
}

export interface AIResponse<T> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  provider: string;
  model: string;
  elapsedMs: number;
  metadata?: AIExecutionMetadata;
}

export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl?: string;
  apiKey?: string;
  defaultModel: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  maxTokens?: number;
  temperature?: number;
}
