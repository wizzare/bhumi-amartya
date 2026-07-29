import type { Blueprint } from "@/lib/types/blueprint";
import type { ArsipAkashiInput, ArsipAkashiSystemEntry } from "../types";
import { normalizeArsipFactValue } from "../factValue";

import { adaptWetonToArsipAkashi } from "../adapters/wetonAdapter";
import { adaptBaziToArsipAkashi } from "../adapters/baziAdapter";
import { adaptVedicToArsipAkashi } from "../adapters/vedicAdapter";
import { adaptTzolkinToArsipAkashi } from "../adapters/tzolkinAdapter";
import { localDateParts } from "./timing";

function stableFingerprint(input: { birthDate?: string; birthTime?: string; timezone?: string }): string {
  const raw = `${input.birthDate ?? ""}|${input.birthTime ?? ""}|${input.timezone ?? ""}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = ((h << 5) - h + raw.charCodeAt(i)) | 0;
  return `bp-${Math.abs(h).toString(16)}`;
}

function unavailableEntry(sysId: string, warning: string, now: string): ArsipAkashiSystemEntry {
  return {
    systemId: sysId as any,
    availability: "unavailable",
    sourceOwner: `lib/${sysId}`,
    normalizedFacts: [],
    calculationFingerprint: `${sysId}-unavailable`,
    calculationVersion: "unknown",
    warnings: [warning],
    generatedAt: now,
  };
}

export function buildArsipAkashiInputFromProfile(
  profile: { uid: string; timezone?: string; birthDate?: string; birthTime?: string; referenceDate?: string } | null,
  blueprint: Blueprint | null,
): ArsipAkashiInput {
  const uid = profile?.uid ?? "unknown";
  const tz = profile?.timezone ?? "+07:00";
  const now = new Date().toISOString();
  const referenceDate = profile?.referenceDate ?? now;
  const activeYear = localDateParts(referenceDate, tz).year;
  const fp = stableFingerprint({ birthDate: profile?.birthDate, birthTime: profile?.birthTime, timezone: tz });

  const systems: ArsipAkashiInput["systems"] = {};
  const bp = blueprint as any;

  // Weton
  if (bp?.weton) {
    systems["weton"] = adaptWetonToArsipAkashi(bp.weton);
  } else {
    systems["weton"] = unavailableEntry("weton", "Weton data not available", now);
  }

  // BaZi
  if (bp?.bazi) {
    systems["bazi"] = adaptBaziToArsipAkashi(bp.bazi);
  } else {
    systems["bazi"] = unavailableEntry("bazi", "BaZi data not available", now);
  }

  // Vedic
  try {
    if (bp?.vedic) {
      systems["vedic-astrology"] = adaptVedicToArsipAkashi(bp.vedic);
    } else {
      systems["vedic-astrology"] = unavailableEntry("vedic-astrology", "Vedic data not available", now);
    }
  } catch {
    systems["vedic-astrology"] = unavailableEntry("vedic-astrology", "Vedic adapter failed", now);
  }

  // Tzolkin
  if (bp?.tzolkin) {
    systems["tzolkin"] = adaptTzolkinToArsipAkashi(bp.tzolkin);
  } else {
    systems["tzolkin"] = unavailableEntry("tzolkin", "Tzolkin data not available", now);
  }

  // Numerology — derive from lifePath (contains lifePathNumber etc.)
  if (bp?.numerology) {
    const n = bp.numerology;
    systems["numerology"] = {
      systemId: "numerology",
      availability: "available",
      sourceOwner: "lib/numerology",
      normalizedFacts: [
        {
          factId: `numerology/identity/lifePathNumber`,
          systemId: "numerology", domain: "identity",
          label: "lifePathNumber", value: String(n.lifePathNumber ?? "unknown"),
          sourcePath: "lib/numerology", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        },
        {
          factId: `numerology/identity/expression`,
          systemId: "numerology", domain: "talents",
          label: "expression", value: normalizeArsipFactValue(n.expression),
          sourcePath: "lib/numerology", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        },
      ],
      calculationFingerprint: `numerology-fp-${fp.slice(0, 8)}`,
      calculationVersion: "v1", warnings: [], generatedAt: now,
    };
  } else {
    systems["numerology"] = unavailableEntry("numerology", "Numerology data not available", now);
  }

  // Human Design
  if (bp?.humanDesign) {
    const hd = bp.humanDesign;
    systems["human-design"] = {
      systemId: "human-design",
      availability: "available",
      sourceOwner: "lib/humandesign",
      normalizedFacts: [
        {
          factId: `human-design/identity/type`,
          systemId: "human-design", domain: "identity",
          label: "type", value: normalizeArsipFactValue(hd.type),
          sourcePath: "lib/humandesign", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        },
        {
          factId: `human-design/mechanics/authority`,
          systemId: "human-design", domain: "mechanics",
          label: "authority", value: normalizeArsipFactValue(hd.authority),
          sourcePath: "lib/humandesign", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        },
        {
          factId: `human-design/mechanics/strategy`,
          systemId: "human-design", domain: "mechanics",
          label: "strategy", value: normalizeArsipFactValue(hd.strategy),
          sourcePath: "lib/humandesign", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        },
        {
          factId: `human-design/identity/profile`,
          systemId: "human-design", domain: "identity",
          label: "profile", value: normalizeArsipFactValue(hd.profile),
          sourcePath: "lib/humandesign", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        },
      ],
      calculationFingerprint: `human-design-fp-${fp.slice(0, 8)}`,
      calculationVersion: "v1", warnings: [], generatedAt: now,
    };
  } else {
    systems["human-design"] = unavailableEntry("human-design", "Human Design data not available", now);
  }

  // Natal Chart (stored as blueprint.astrology)
  if (bp?.astrology) {
    const a = bp.astrology;
    systems["natal-chart"] = {
      systemId: "natal-chart",
      availability: "available",
      sourceOwner: "lib/natal-chart",
      normalizedFacts: [
        {
          factId: `natal-chart/identity/sunSign`,
          systemId: "natal-chart", domain: "identity",
          label: "sunSign", value: normalizeArsipFactValue(a.sun?.sign),
          sourcePath: "lib/natal-chart", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        },
        {
          factId: `natal-chart/identity/moonSign`,
          systemId: "natal-chart", domain: "identity",
          label: "moonSign", value: normalizeArsipFactValue(a.moon?.sign),
          sourcePath: "lib/natal-chart", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        },
        {
          factId: `natal-chart/mechanics/ascendant`,
          systemId: "natal-chart", domain: "mechanics",
          label: "ascendant", value: normalizeArsipFactValue(a.ascendant?.sign),
          sourcePath: "lib/natal-chart", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        },
      ],
      calculationFingerprint: `natal-chart-fp-${fp.slice(0, 8)}`,
      calculationVersion: "v1", warnings: [], generatedAt: now,
    };
  } else {
    systems["natal-chart"] = unavailableEntry("natal-chart", "Natal chart data not available", now);
  }

  // Destiny Matrix
  if (bp?.destinyMatrix) {
    const dm = bp.destinyMatrix;
    systems["destiny-matrix"] = {
      systemId: "destiny-matrix",
      availability: "available",
      sourceOwner: "lib/destiny-matrix",
      normalizedFacts: [
        {
          factId: `destiny-matrix/identity/mainArcana`,
          systemId: "destiny-matrix", domain: "identity",
          label: "mainArcana", value: normalizeArsipFactValue(dm.energyType),
          sourcePath: "lib/destiny-matrix", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        },
        {
          factId: `destiny-matrix/mechanics/energyType`,
          systemId: "destiny-matrix", domain: "mechanics",
          label: "energyType", value: normalizeArsipFactValue(dm.energyType),
          sourcePath: "lib/destiny-matrix", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        },
      ],
      calculationFingerprint: `destiny-matrix-fp-${fp.slice(0, 8)}`,
      calculationVersion: "v1", warnings: [], generatedAt: now,
    };
  } else {
    systems["destiny-matrix"] = unavailableEntry("destiny-matrix", "Destiny Matrix data not available", now);
  }

  // Whole Sign, Astrocartography, Zi Wei — not stored in Blueprint type
  systems["whole-sign"] = unavailableEntry("whole-sign", "Whole Sign requires separate calculation flow", now);
  systems["astrocartography"] = unavailableEntry("astrocartography", "Astrocartography requires separate calculation flow", now);
  systems["zi-wei-dou-shu"] = unavailableEntry("zi-wei-dou-shu", "Zi Wei requires separate calculation flow", now);

  return {
    userId: uid,
    generatedForDate: referenceDate.slice(0, 10),
    referenceDate,
    timezone: tz,
    sourceVersion: "profile-view-v1",
    blueprintFingerprint: fp,
    birthDataAvailability: {
      time: profile?.birthTime ? "exact" : "missing",
      birthplace: true,
      timezone: true,
    },
    systems,
    generationMetadata: { activeYear: String(activeYear), timingPolicyVersion: "semester-timing-v1" },
  };
}
