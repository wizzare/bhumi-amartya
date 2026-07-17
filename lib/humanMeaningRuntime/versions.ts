export const HUMAN_MEANING_RUNTIME_VERSION = "human-meaning-runtime-v1" as const;
export const HUMAN_MEANING_KNOWLEDGE_VERSION = "human-meaning-knowledge-v1" as const;
export const HUMAN_MEANING_BEHAVIOR_VERSION = "human-meaning-behavior-v1" as const;

export interface HumanMeaningRuntimeVersions {
  readonly runtimeVersion: typeof HUMAN_MEANING_RUNTIME_VERSION;
  readonly knowledgeVersion: typeof HUMAN_MEANING_KNOWLEDGE_VERSION;
  readonly behaviorVersion: typeof HUMAN_MEANING_BEHAVIOR_VERSION;
}

export const HUMAN_MEANING_VERSIONS: HumanMeaningRuntimeVersions = Object.freeze({
  runtimeVersion: HUMAN_MEANING_RUNTIME_VERSION,
  knowledgeVersion: HUMAN_MEANING_KNOWLEDGE_VERSION,
  behaviorVersion: HUMAN_MEANING_BEHAVIOR_VERSION,
});
