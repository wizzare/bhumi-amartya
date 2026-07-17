import { buildNumerologyPresentation } from "@/lib/numerology/presentation";

export const numerologyPresentationFixtures = [
  ...Array.from({ length: 9 }, (_, index) => ({ id: `life-path-${index + 1}`, lifePath: index + 1 })),
  { id: "master-11", lifePath: 11 },
  { id: "master-22", lifePath: 22 },
  { id: "master-33", lifePath: 33 },
  { id: "complete-name-derived", lifePath: 7, expression: 3, soulUrge: 2, personality: 1, birthday: 9, personalYear: 5 },
  { id: "missing-name", lifePath: 6, birthday: 4, personalYear: 8 },
  { id: "missing-birth-date", expression: 4, soulUrge: 6, personality: 7 },
  { id: "personal-year-unavailable", lifePath: 8, expression: 1 },
] as const;

export type NumerologyFixtureResult = {
  id: string;
  passed: boolean;
  reason: string;
};

export function validateNumerologyPresentationFixtures(): NumerologyFixtureResult[] {
  const results: NumerologyFixtureResult[] = numerologyPresentationFixtures.map((fixture) => {
    const { sections, identity } = buildNumerologyPresentation(fixture);
    const available = sections.filter((section) => section.availabilityStatus === "available");
    const valid = available.every((section) => Boolean(section.shortExplanation && section.fullExplanation));
    return { id: fixture.id, passed: valid, reason: valid ? "source-backed sections resolve" : "available section has missing narrative" };
  });

  const masterValues = [11, 22, 33].map((lifePath) => buildNumerologyPresentation({ lifePath }).identity.lifePath);
  results.push({ id: "master-number-preservation", passed: masterValues.join(",") === "11,22,33", reason: "master values are not reduced" });

  const lifePathNarratives = Array.from({ length: 9 }, (_, index) => buildNumerologyPresentation({ lifePath: index + 1 }).identity.summary[0]);
  results.push({ id: "life-path-differentiation", passed: new Set(lifePathNarratives).size === 9, reason: "Life Path 1–9 use distinct source journeys" });

  const first = buildNumerologyPresentation({ lifePath: 2, expression: 4 }).identity.summary.join("\n");
  const second = buildNumerologyPresentation({ lifePath: 8, expression: 1 }).identity.summary.join("\n");
  results.push({ id: "cross-user-isolation", passed: first !== second, reason: "different inputs produce different presentation output" });
  return results;
}
