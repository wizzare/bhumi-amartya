import type { HumanMeaningRuntime } from "@/lib/humanMeaningRuntime/types";
import { stableFingerprint } from "@/lib/humanMeaningRuntime/runtimeUtils";

const MAX_STABLE_ENTRIES = 100;
const stableRuntimeCache = new Map<string, HumanMeaningRuntime>();

export const humanMeaningRuntimeCache = {
  createKey(
    inputFingerprint: string,
    versions: Readonly<{ runtimeVersion: string; knowledgeVersion: string; behaviorVersion: string }>,
    scope = "shared-blueprint",
  ): string {
    const scopeFingerprint = stableFingerprint({ scope });
    return `${versions.runtimeVersion}:${versions.knowledgeVersion}:${versions.behaviorVersion}:${inputFingerprint}:${scopeFingerprint}`;
  },
  get(key: string): HumanMeaningRuntime | null {
    return stableRuntimeCache.get(key) || null;
  },
  set(key: string, value: HumanMeaningRuntime): void {
    stableRuntimeCache.delete(key);
    stableRuntimeCache.set(key, value);
    while (stableRuntimeCache.size > MAX_STABLE_ENTRIES) {
      const oldest = stableRuntimeCache.keys().next().value as string | undefined;
      if (!oldest) break;
      stableRuntimeCache.delete(oldest);
    }
  },
  clear(): void {
    stableRuntimeCache.clear();
  },
  size(): number {
    return stableRuntimeCache.size;
  },
  has(key: string): boolean {
    return stableRuntimeCache.has(key);
  },
};
