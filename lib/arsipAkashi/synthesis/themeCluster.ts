import type { ArsipAkashiSelectedFact, ArsipAkashiThemeCluster, InsightStabilityType } from "./types";
import type { CanonicalSystemId } from "../types";

const THEME_GROUP_MAP: Record<string, string> = {
  identity: "identity",
  mechanics: "energy-patterns",
  shadow: "shadow-and-wounds",
  relationships: "relationship-dynamics",
  talents: "work-and-talents",
  health: "health-and-environment",
  spirituality: "spirituality",
  timing: "timing-and-cycles",
  location: "location-context",
  karma: "karma-and-life-lessons",
  growth: "growth-and-potential",
  resources: "resources-and-wealth",
};

export function clusterThemes(
  selectedFacts: ArsipAkashiSelectedFact[],
): { primaryThemes: ArsipAkashiThemeCluster[]; supportingThemes: ArsipAkashiThemeCluster[] } {
  const groups = new Map<string, { factIds: string[]; systems: Set<CanonicalSystemId>; types: InsightStabilityType[] }>();

  for (const fact of selectedFacts) {
    const groupKey = THEME_GROUP_MAP[fact.domain] ?? fact.domain;
    if (!groups.has(groupKey)) {
      groups.set(groupKey, { factIds: [], systems: new Set(), types: [] });
    }
    const g = groups.get(groupKey)!;
    g.factIds.push(fact.factId);
    g.systems.add(fact.systemId);
    g.types.push(fact.stabilityType);
  }

  const primaryThemes: ArsipAkashiThemeCluster[] = [];
  const supportingThemes: ArsipAkashiThemeCluster[] = [];

  for (const themeId of Array.from(groups.keys())) {
    const group = groups.get(themeId)!;
    const contributingSystems = Array.from(group.systems).sort();
    const types = Array.from(new Set(group.types));
    const stabilityType: InsightStabilityType =
      types.includes("stable-identity") ? "stable-identity" :
      types.includes("recurring-pattern") ? "recurring-pattern" :
      types.includes("contextual-expression") ? "contextual-expression" :
      types.includes("active-timing") ? "active-timing" :
      types[0] ?? "stable-identity";

    const cluster: ArsipAkashiThemeCluster = {
      themeId,
      supportingFactIds: group.factIds,
      contributingSystems,
      agreementLevel: contributingSystems.length >= 3 ? "strong" : contributingSystems.length >= 2 ? "moderate" : "partial",
      stabilityType,
      limitations: [],
    };

    if (
      themeId === "identity" ||
      themeId === "shadow-and-wounds" ||
      themeId === "relationship-dynamics" ||
      themeId === "work-and-talents" ||
      themeId === "growth-and-potential"
    ) {
      primaryThemes.push(cluster);
    } else {
      supportingThemes.push(cluster);
    }
  }

  return {
    primaryThemes: primaryThemes.sort((a, b) => b.contributingSystems.length - a.contributingSystems.length),
    supportingThemes: supportingThemes.sort((a, b) => b.contributingSystems.length - a.contributingSystems.length),
  };
}
