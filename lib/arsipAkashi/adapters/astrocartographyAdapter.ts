import type {
  AstrocartographyResult,
  AstrocartographyLine,
} from "@/lib/astrocartography/types";
import type { ArsipAkashiSystemEntry, ArsipAkashiNormalizedFact } from "../types";

const SYSTEM_ID = "astrocartography" as const;
const ADAPTER_VERSION = "astrocartography-adapter-v1";
const SOURCE_PATH = "lib/astrocartography/calculateAstrocartography.ts";

function fingerprinted(astro: AstrocartographyResult): string {
  const stable = {
    utcInstant: astro.utcInstant,
    julianDate: astro.julianDate,
    lineCount: astro.lines.length,
    bodyCount: astro.bodies.length,
    bodyIds: astro.bodies.map((b) => b.body).sort(),
    lineIds: astro.lines.map((l) => l.lineId).sort(),
  };
  const d = JSON.stringify(stable, Object.keys(stable).sort());
  const hash = Array.from(d).reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  return `astrocartography-fp-${hash}`;
}

function fact(
  field: string, domain: string, value: string, eligible: boolean,
  warnings?: string[],
): ArsipAkashiNormalizedFact {
  return {
    factId: `${SYSTEM_ID}/${domain}/${field}`,
    systemId: SYSTEM_ID,
    domain: domain as any,
    label: field,
    value,
    sourcePath: SOURCE_PATH,
    sourceVersion: ADAPTER_VERSION,
    interpretationEligibility: eligible,
    confidence: 1,
    warnings: warnings ?? [],
  };
}

export function adaptAstrocartographyToArsipAkashi(
  astro: AstrocartographyResult,
  selectedLocation?: { name: string; country: string; latitude: number; longitude: number },
): ArsipAkashiSystemEntry {
  const facts: ArsipAkashiNormalizedFact[] = [
    fact("utcInstant", "timing", astro.utcInstant ?? "unavailable", false),
    fact("bodyCount", "mechanics", String(astro.bodies.length), false),
    fact("lineCount", "location", String(astro.lines.length), false),
  ];

  const uniqueBodyIds = [...new Set(astro.lines.map((l: AstrocartographyLine) => l.lineId))];
  facts.push(fact("planetaryLines", "location", uniqueBodyIds.join(", "), true));

  if (selectedLocation) {
    facts.push(
      fact("selectedLocation", "location", selectedLocation.name, true),
      fact("selectedCountry", "location", selectedLocation.country, false),
      fact("selectedCoordinates", "location",
        `${selectedLocation.latitude},${selectedLocation.longitude}`, false),
    );
  }

  return {
    systemId: SYSTEM_ID,
    availability: "available",
    sourceOwner: SOURCE_PATH,
    normalizedFacts: facts,
    calculationFingerprint: fingerprinted(astro),
    calculationVersion: ADAPTER_VERSION,
    warnings: [],
    generatedAt: astro.utcInstant ?? new Date(0).toISOString(),
  };
}
