import type { ArsipAkashiInput } from "../types";
import { CANONICAL_SYSTEM_IDS, ARSIP_AKASHI_SOUL_LETTER_IDS } from "../types";
import { ARSIP_AKASHI_SECTION_IDS, type ArsipAkashiSectionId } from "../contracts";
import type {
  ArsipAkashiInsightModel,
  ArsipAkashiSectionInsight,
  ArsipAkashiSoulLetterTheme,
} from "./types";
import { INSIGHT_SYNTHESIS_VERSION } from "./types";
import { analyzeGlobalCoverage, analyzeSectionCoverage } from "./coverage";
import { selectFactsForSection } from "./factSelector";
import { clusterThemes } from "./themeCluster";
import { resolveTensions, findRecurringPatterns } from "./contradictionResolver";

function computeDeterministicKey(input: ArsipAkashiInput): string {
  const stable: string[] = [
    input.userId,
    input.blueprintFingerprint,
    input.sourceVersion,
  ];

  for (const sys of CANONICAL_SYSTEM_IDS) {
    const entry = input.systems[sys];
    if (entry) {
      stable.push(entry.calculationFingerprint);
    }
  }

  const raw = stable.join("|");
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  return `insight-${Math.abs(hash).toString(16)}`;
}

function buildSectionInsight(
  sectionId: ArsipAkashiSectionId,
  input: ArsipAkashiInput,
): ArsipAkashiSectionInsight {
  const coverage = analyzeSectionCoverage(sectionId, input);
  const selectedFacts = selectFactsForSection(sectionId, input);
  const { primaryThemes, supportingThemes } = clusterThemes(selectedFacts);
  const tensions = resolveTensions(primaryThemes, supportingThemes, selectedFacts);
  const recurringPatterns = findRecurringPatterns(primaryThemes);

  return {
    sectionId,
    coverage: {
      eligibleSystemCount: coverage.eligibleSystemCount,
      contributingSystemCount: coverage.contributingSystemCount,
      selectedFactCount: selectedFacts.length,
      availableSystems: coverage.availableSystems,
      contributingSystems: coverage.contributingSystems,
      unavailableSystems: coverage.unavailableSystems,
    },
    selectedFacts,
    primaryThemes,
    supportingThemes,
    tensions,
    recurringPatterns,
    emotionalMeaning: "",
    practicalDirection: "",
    limitations: coverage.unavailableSystems.length > 0 ? [`${coverage.unavailableSystems.length} system(s) unavailable for this section`] : [],
    provenance: selectedFacts.map((f) => f.factId),
    synthesisVersion: INSIGHT_SYNTHESIS_VERSION,
  };
}

function buildSoulLetterThemes(input: ArsipAkashiInput): ArsipAkashiSoulLetterTheme[] {
  const themes: ArsipAkashiSoulLetterTheme[] = [];
  const themeIds = [
    "recurring-patterns", "emotional-wounds", "inner-child", "self-sabotage",
    "karmic-lessons", "healing", "growth", "returning-to-self",
    "forgiveness", "future-direction",
  ] as const;

  for (const themeId of themeIds) {
    const selectedFacts = selectFactsForSection("soul-letters", input);
    const relevant = selectedFacts.filter(
      (f) => f.domain === "shadow" || f.domain === "growth" || f.domain === "karma" || f.domain === "spirituality",
    );

    themes.push({
      themeId,
      supportingFactIds: relevant.slice(0, 5).map((f) => f.factId),
      contributingSystems: Array.from(new Set(relevant.map((f) => f.systemId))).sort(),
      emotionalDirection: themeId === "self-sabotage" || themeId === "emotional-wounds" ? "healing" : "growth",
      growthDirection: "",
      limitations: [],
      coverageStatus: relevant.length >= 3 ? "fully-supported" : relevant.length >= 1 ? "partially-supported" : "limited",
    });
  }

  return themes;
}

export function buildInsightModel(input: ArsipAkashiInput): ArsipAkashiInsightModel {
  const globalCoverage = analyzeGlobalCoverage(input);

  const sections: ArsipAkashiSectionInsight[] = [];
  for (const sectionId of ARSIP_AKASHI_SECTION_IDS) {
    if (sectionId === "soul-letters") continue;
    sections.push(buildSectionInsight(sectionId, input));
  }

  const soulLetterThemes = buildSoulLetterThemes(input);

  const allLimitations: string[] = [];
  if (globalCoverage.unavailableSystems.length > 0) {
    allLimitations.push(`${globalCoverage.unavailableSystems.length} system(s) unavailable: ${globalCoverage.unavailableSystems.join(", ")}`);
  }

  return {
    userId: input.userId,
    generatedAt: input.referenceDate,
    blueprintFingerprint: input.blueprintFingerprint,
    sourceVersion: INSIGHT_SYNTHESIS_VERSION,
    sections,
    soulLetterThemes,
    globalCoverage,
    limitations: allLimitations,
    provenance: sections.flatMap((s) => s.provenance),
    deterministicKey: computeDeterministicKey(input),
    timezone: input.timezone,
  };
}
