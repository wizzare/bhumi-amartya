import type { ArsipAkashiThemeCluster, ArsipAkashiTension, ArsipAkashiRecurringPattern } from "./types";
import type { ArsipAkashiSelectedFact } from "./types";
import type { CanonicalSystemId } from "../types";

const CONTRADICTORY_PAIRS: Array<[string, string, string]> = [
  ["identity", "relationship-dynamics", "independence leans toward space; connection leans toward closeness"],
  ["spirituality", "health-and-environment", "inner calling may differ from external demands"],
  ["growth-and-potential", "shadow-and-wounds", "aspiration and lived experience may feel misaligned"],
  ["work-and-talents", "resources-and-wealth", "expression and material needs may pull in different directions"],
  ["timing-and-cycles", "identity", "current timing may not reflect your stable core"],
  ["location-context", "identity", "a place that resonates does not define who you are"],
];

export function resolveTensions(
  primaryThemes: ArsipAkashiThemeCluster[],
  supportingThemes: ArsipAkashiThemeCluster[],
  selectedFacts: ArsipAkashiSelectedFact[],
): ArsipAkashiTension[] {
  const allThemes = [...primaryThemes, ...supportingThemes];
  const tensions: ArsipAkashiTension[] = [];

  for (const [themeA, themeB, resolution] of CONTRADICTORY_PAIRS) {
    const a = allThemes.find((t) => t.themeId === themeA);
    const b = allThemes.find((t) => t.themeId === themeB);
    if (!a || !b) continue;

    const allFactIds = Array.from(new Set([...a.supportingFactIds, ...b.supportingFactIds]));
    const allSystems = Array.from(new Set<CanonicalSystemId>([...a.contributingSystems, ...b.contributingSystems])).sort();

    tensions.push({
      tensionId: `${themeA}-vs-${themeB}`,
      themeA,
      themeB,
      supportingFactIds: allFactIds,
      contributingSystems: allSystems,
      contextualResolution: resolution,
      limitations: [],
    });
  }

  return tensions;
}

export function findRecurringPatterns(
  primaryThemes: ArsipAkashiThemeCluster[],
): ArsipAkashiRecurringPattern[] {
  const patterns: ArsipAkashiRecurringPattern[] = [];

  for (const theme of primaryThemes) {
    if (theme.stabilityType === "stable-identity") continue;
    if (theme.stabilityType === "location-context") continue;

    patterns.push({
      patternId: `pattern-${theme.themeId}`,
      domains: [theme.themeId],
      supportingFactIds: theme.supportingFactIds,
      contributingSystems: theme.contributingSystems,
      occurrence: theme.contributingSystems.length >= 3 ? "cross-system" : "within-system",
      emotionalValence: theme.themeId === "shadow-and-wounds" ? "challenge" : "growth",
      limitations: theme.limitations,
    });
  }

  return patterns;
}
