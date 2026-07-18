import type { ArsipAkashiInsightModel } from "./types";
import type { ArsipAkashiSection, ArsipAkashiNarrativeBlock } from "../types";
import { ARSIP_AKASHI_SECTION_IDS, SECTION_DISPLAY_TITLES } from "../contracts";
import { buildSections } from "./narrativeTemplates";
import { sanitizeNarrative } from "./narrativeSanitizer";

export function renderNarratives(model: ArsipAkashiInsightModel): ArsipAkashiSection[] {
  const sections: ArsipAkashiSection[] = [];

  for (const sectionId of ARSIP_AKASHI_SECTION_IDS) {
    if (sectionId === "soul-letters") continue;

    const insight = model.sections.find((s) => s.sectionId === sectionId);
    if (!insight) continue;

    const raw = buildSections(sectionId, insight);
    const cleaned: string[] = [];

    for (const s of raw) {
      const result = sanitizeNarrative(s);
      if (result.issues.length === 0) cleaned.push(s);
    }

    const text = cleaned.join(" ");

    const block: ArsipAkashiNarrativeBlock = {
      blockId: `${sectionId}-block`,
      title: SECTION_DISPLAY_TITLES[sectionId] ?? sectionId,
      text,
      sourceSystemIds: insight.coverage.contributingSystems,
      supportingFactIds: insight.selectedFacts.map((f) => f.factId),
      synthesisType: "cross-system-synthesis",
    };

    sections.push({
      sectionId,
      title: SECTION_DISPLAY_TITLES[sectionId] ?? sectionId,
      summary: cleaned[0] ?? "",
      narrativeBlocks: [block],
      sourceSystemIds: insight.coverage.contributingSystems,
      supportingFactIds: insight.selectedFacts.map((f) => f.factId),
      synthesisType: "cross-system-synthesis",
      confidence: insight.coverage.contributingSystemCount / insight.coverage.eligibleSystemCount,
      limitations: insight.limitations,
      generatedAt: model.generatedAt,
      contentVersion: model.sourceVersion,
    });
  }

  return sections;
}
