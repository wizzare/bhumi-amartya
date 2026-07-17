import { executeHumanMeaningRuntime } from "@/lib/humanMeaningRuntime/publicInterface";
import { normalizeBlueprintInput } from "@/lib/humanMeaningRuntime/inputValidator";
import { createInputFingerprint, stableSerialize } from "@/lib/humanMeaningRuntime/runtimeUtils";
import type { UnifiedBlueprintInput } from "@/lib/humanMeaningRuntime/types";

export const R1A_FIXTURE_TIME = new Date("2026-07-13T05:00:00.000Z");

export const FULL_EIGHT_SYSTEM_FIXTURE: UnifiedBlueprintInput = {
  humanDesign: { type: "Generator", authority: "Emotional" },
  bazi: { dayMaster: { element: "Metal" } },
  natalChart: { moon: { sign: "Pisces" }, mercury: { sign: "Virgo" } },
  numerology: { lifePath: 5 },
  destinyMatrix: { center: 7 },
  vedic: { moonSign: "Cancer" },
  weton: { day: "Jumat Kliwon" },
  tzolkin: { kin: 42 },
};

export const SINGLE_SYSTEM_FIXTURE: UnifiedBlueprintInput = {
  humanDesign: { type: "Generator" },
};

export const MULTI_SYSTEM_PARTIAL_FIXTURE: UnifiedBlueprintInput = {
  humanDesign: { type: "Generator" },
  bazi: { dayMaster: { element: "Metal" } },
  lifePath: { number: 5 },
};

export const CONFLICTING_PATTERN_FIXTURE: UnifiedBlueprintInput = {
  humanDesign: { type: "Manifestor" },
  bazi: { dayMaster: { element: "Metal" } },
  natalChart: { moon: { sign: "Pisces" } },
  lifePath: { number: 7 },
};

const IDENTICAL_BLUEPRINT = {
  humanDesign: { type: "Generator" },
  bazi: { dayMaster: { element: "Metal" } },
  lifePath: { number: 5 },
};

export const R1A_BEHAVIORAL_FIXTURES: readonly { readonly name: string; readonly input: unknown; readonly cacheScope?: string }[] = [
  { name: "full-eight-system", input: FULL_EIGHT_SYSTEM_FIXTURE },
  { name: "single-system", input: SINGLE_SYSTEM_FIXTURE },
  { name: "multi-system-partial", input: MULTI_SYSTEM_PARTIAL_FIXTURE },
  { name: "conflicting-pattern", input: CONFLICTING_PATTERN_FIXTURE },
  { name: "missing-data", input: {} },
  { name: "identical-blueprint-user-a", input: { ...IDENTICAL_BLUEPRINT, userId: "fixture-user-a" }, cacheScope: "fixture-user-a" },
  { name: "identical-blueprint-user-b", input: { ...IDENTICAL_BLUEPRINT, userId: "fixture-user-b" }, cacheScope: "fixture-user-b" },
  { name: "distinct-blueprint-a", input: IDENTICAL_BLUEPRINT },
  { name: "distinct-blueprint-b", input: { humanDesign: { type: "Manifestor" }, natalChart: { moon: { sign: "Pisces" } }, lifePath: { number: 7 } } },
] as const;

export function buildR1ABehavioralFingerprintReport() {
  return R1A_BEHAVIORAL_FIXTURES.map((fixture) => {
    const options = { now: R1A_FIXTURE_TIME, bypassCache: true, cacheScope: fixture.cacheScope };
    const first = executeHumanMeaningRuntime(fixture.input, options);
    const second = executeHumanMeaningRuntime(fixture.input, options);
    let inputFingerprint: string | null = null;
    try {
      inputFingerprint = createInputFingerprint(normalizeBlueprintInput(fixture.input));
    } catch {
      inputFingerprint = null;
    }
    if (!first.ok) {
      return {
        fixture: fixture.name,
        inputFingerprint,
        knowledgeVersion: "human-meaning-knowledge-v1",
        runtimeVersion: "human-meaning-runtime-v1",
        outputFingerprint: null,
        validationResult: first.error.code,
        provenanceSummary: [],
        deterministicRerun: stableSerialize(first) === stableSerialize(second),
      };
    }
    return {
      fixture: fixture.name,
      inputFingerprint: first.output.inputFingerprint,
      knowledgeVersion: first.output.knowledgeVersion,
      runtimeVersion: first.output.runtimeVersion,
      outputFingerprint: first.output.outputFingerprint,
      validationResult: "PASS",
      provenanceSummary: first.output.provenance.lineage,
      deterministicRerun: stableSerialize(first) === stableSerialize(second),
    };
  });
}
