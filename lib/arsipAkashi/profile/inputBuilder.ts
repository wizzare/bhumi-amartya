import type { Blueprint } from "@/lib/types/blueprint";
import type { ArsipAkashiInput, ArsipAkashiSystemEntry } from "../types";
import { normalizeArsipFactValue } from "../factValue";

import { adaptWetonToArsipAkashi } from "../adapters/wetonAdapter";
import { adaptBaziToArsipAkashi } from "../adapters/baziAdapter";
import { adaptVedicToArsipAkashi } from "../adapters/vedicAdapter";
import { adaptTzolkinToArsipAkashi } from "../adapters/tzolkinAdapter";
import { adaptWholeSignToArsipAkashi } from "../adapters/wholeSignAdapter";
import { adaptAstrocartographyToArsipAkashi } from "../adapters/astrocartographyAdapter";
import { adaptZiWeiToArsipAkashi } from "../adapters/ziWeiAdapter";
import { localDateParts } from "./timing";
import { calculateCanonicalDestinyMatrixBlueprint } from "@/lib/engines/destinyMatrixBlueprintAdapter";

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
  profile: { uid: string; timezone?: string; birthDate?: string; birthTime?: string; birthCity?: string; birthPlace?: string; gender?: string | null; referenceDate?: string } | null,
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
          label: "lifePathNumber", value: String(n.lifePathNumber ?? n.lifePath ?? n.number ?? "unknown"),
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
        ...(n.soulUrge != null ? [{
          factId: `numerology/identity/soulUrge`,
          systemId: "numerology" as const, domain: "identity" as const,
          label: "soulUrge", value: normalizeArsipFactValue(n.soulUrge),
          sourcePath: "lib/numerology", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        }] : []),
        ...(n.birthdayNumber != null || n.birthDay != null ? [{
          factId: `numerology/identity/birthdayNumber`,
          systemId: "numerology" as const, domain: "identity" as const,
          label: "birthdayNumber", value: normalizeArsipFactValue(n.birthdayNumber ?? n.birthDay),
          sourcePath: "lib/numerology", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        }] : []),
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
        ...(hd.notSelfTheme ? [{
          factId: `human-design/shadow/notSelfTheme`,
          systemId: "human-design" as const, domain: "shadow" as const,
          label: "notSelfTheme", value: normalizeArsipFactValue(hd.notSelfTheme),
          sourcePath: "lib/humandesign", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        }] : hd.type ? [{
          factId: `human-design/shadow/notSelfTheme`,
          systemId: "human-design" as const, domain: "shadow" as const,
          label: "notSelfTheme",
          value: hd.type.toLowerCase().includes("generator")
            ? "Frustrasi"
            : hd.type.toLowerCase().includes("projector")
              ? "Kepahitan"
              : hd.type.toLowerCase().includes("manifestor")
                ? "Kemarahan"
                : "Kekecewaan",
          sourcePath: "lib/humandesign", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        }] : []),
        ...(hd.type ? [{
          factId: `human-design/health/energyRecharge`,
          systemId: "human-design" as const, domain: "health" as const,
          label: "energyRecharge",
          value: hd.type.toLowerCase().includes("generator")
            ? "penyelarasan respons tubuh dan gerak fisik teratur"
            : hd.type.toLowerCase().includes("projector")
              ? "istirahat sebelum lelah dan jeda pemulihan tenang"
              : hd.type.toLowerCase().includes("manifestor")
                ? "jeda ritme mandiri setelah inisiasi karya"
                : "pengamatan siklus dan ruang tanpa tekanan luar",
          sourcePath: "lib/humandesign", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        }] : []),
        ...(hd.type || hd.strategy ? [{
          factId: `human-design/talents/workType`,
          systemId: "human-design" as const, domain: "talents" as const,
          label: "workType",
          value: `gaya kerja ${normalizeArsipFactValue(hd.type ?? "mandiri")} beroperasi melalui ${normalizeArsipFactValue(hd.strategy ?? "kejelasan langkah")}`,
          sourcePath: "lib/humandesign", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        }, {
          factId: `human-design/resources/resourcePacing`,
          systemId: "human-design" as const, domain: "resources" as const,
          label: "resourcePacing",
          value: `ritme energi sumber daya ${normalizeArsipFactValue(hd.type ?? "harian")} dengan otoritas ${normalizeArsipFactValue(hd.authority ?? "kejelasan batin")}`,
          sourcePath: "lib/humandesign", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        }] : []),
        ...(hd.profile || hd.strategy ? [{
          factId: `human-design/relationships/interactionStyle`,
          systemId: "human-design" as const, domain: "relationships" as const,
          label: "interactionStyle",
          value: `profil relasi ${normalizeArsipFactValue(hd.profile ?? "intrapersonal")} melalui strategi ${normalizeArsipFactValue(hd.strategy ?? "kejelasan batin")}`,
          sourcePath: "lib/humandesign", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        }] : []),
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
          label: "sunSign", value: normalizeArsipFactValue(a.sun?.sign ?? a.sunSign),
          sourcePath: "lib/natal-chart", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        },
        {
          factId: `natal-chart/identity/moonSign`,
          systemId: "natal-chart", domain: "identity",
          label: "moonSign", value: normalizeArsipFactValue(a.moon?.sign ?? a.moonSign),
          sourcePath: "lib/natal-chart", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        },
        {
          factId: `natal-chart/mechanics/ascendant`,
          systemId: "natal-chart", domain: "mechanics",
          label: "ascendant", value: normalizeArsipFactValue(a.ascendant?.sign ?? a.risingSign),
          sourcePath: "lib/natal-chart", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        },
        ...(a.planets?.Venus?.sign || a.venusSign || a.venus?.sign ? [{
          factId: `natal-chart/relationships/venusSign`,
          systemId: "natal-chart" as const, domain: "relationships" as const,
          label: "venusSign", value: normalizeArsipFactValue(a.planets?.Venus?.sign ?? a.venusSign ?? a.venus?.sign),
          sourcePath: "lib/natal-chart", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        }] : []),
        ...(a.planets?.Mars?.sign || a.marsSign || a.mars?.sign ? [{
          factId: `natal-chart/mechanics/marsSign`,
          systemId: "natal-chart" as const, domain: "mechanics" as const,
          label: "marsSign", value: normalizeArsipFactValue(a.planets?.Mars?.sign ?? a.marsSign ?? a.mars?.sign),
          sourcePath: "lib/natal-chart", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        }] : []),
        ...(a.chiron || a.planets?.Chiron?.sign ? [{
          factId: `natal-chart/shadow/chiron`,
          systemId: "natal-chart" as const, domain: "shadow" as const,
          label: "chiron", value: normalizeArsipFactValue(a.chiron ?? a.planets?.Chiron?.sign),
          sourcePath: "lib/natal-chart", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        }] : []),
        ...(a.lilith?.sign ? [{
          factId: `natal-chart/shadow/lilith`,
          systemId: "natal-chart" as const, domain: "shadow" as const,
          label: "lilith", value: normalizeArsipFactValue(a.lilith.sign),
          sourcePath: "lib/natal-chart", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        }] : []),
        ...(a.dominantElement || a.dominance?.dominantElement ? [{
          factId: `natal-chart/health/elementBalance`,
          systemId: "natal-chart" as const, domain: "health" as const,
          label: "elementBalance",
          value: `keseimbangan elemen ${normalizeArsipFactValue(a.dominantElement ?? a.dominance?.dominantElement)}`,
          sourcePath: "lib/natal-chart", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        }] : []),
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
    let dmKarmicTail = dm.karmicTail;
    const dmBirthDate = String(bp?.input?.birthDate || (profile as any)?.birthDate || "");
    if (dmBirthDate) {
      try {
        const canonicalDM = calculateCanonicalDestinyMatrixBlueprint(dmBirthDate);
        if (Array.isArray(canonicalDM.karmicTail) && canonicalDM.karmicTail.length === 3) {
          dmKarmicTail = canonicalDM.karmicTail;
        }
      } catch {}
    }
    systems["destiny-matrix"] = {
      systemId: "destiny-matrix",
      availability: "available",
      sourceOwner: "lib/destiny-matrix",
      normalizedFacts: [
        {
          factId: `destiny-matrix/identity/mainArcana`,
          systemId: "destiny-matrix", domain: "identity",
          label: "mainArcana", value: normalizeArsipFactValue(dm.energyType ?? dm.dayPoint ?? dm.center ?? dm.arcanaCenter),
          sourcePath: "lib/destiny-matrix", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        },
        {
          factId: `destiny-matrix/mechanics/energyType`,
          systemId: "destiny-matrix", domain: "mechanics",
          label: "energyType", value: normalizeArsipFactValue(dm.energyType ?? dm.destinyPoint ?? dm.center),
          sourcePath: "lib/destiny-matrix", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        },
        ...(dmKarmicTail && (Array.isArray(dmKarmicTail) ? dmKarmicTail.length > 0 : true) ? [{
          factId: `destiny-matrix/shadow/karmicTail`,
          systemId: "destiny-matrix" as const, domain: "shadow" as const,
          label: "karmicTail", value: Array.isArray(dmKarmicTail) ? dmKarmicTail.join("-") : String(dmKarmicTail),
          sourcePath: "lib/destiny-matrix", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        }, {
          factId: `destiny-matrix/karma/karmicTail`,
          systemId: "destiny-matrix" as const, domain: "karma" as const,
          label: "karmicTail", value: Array.isArray(dmKarmicTail) ? dmKarmicTail.join("-") : String(dmKarmicTail),
          sourcePath: "lib/destiny-matrix", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        }] : []),
        ...(dm.loveLine || dm.dayPoint || dm.energyType ? [{
          factId: `destiny-matrix/relationships/loveLine`,
          systemId: "destiny-matrix" as const, domain: "relationships" as const,
          label: "loveLine",
          value: dm.loveLine
            ? (Array.isArray(dm.loveLine) ? dm.loveLine.join("-") : String(dm.loveLine))
            : `jalur relasi arcana ${dm.dayPoint ?? dm.energyType ?? dm.center}`,
          sourcePath: "lib/destiny-matrix", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        }] : []),
        ...(dm.moneyLine || dm.destinyPoint || dm.center ? [{
          factId: `destiny-matrix/resources/moneyLine`,
          systemId: "destiny-matrix" as const, domain: "resources" as const,
          label: "moneyLine",
          value: dm.moneyLine
            ? (Array.isArray(dm.moneyLine) ? dm.moneyLine.join("-") : String(dm.moneyLine))
            : `jalur rezeki arcana ${dm.destinyPoint ?? dm.center ?? dm.energyType}`,
          sourcePath: "lib/destiny-matrix", sourceVersion: "v1",
          interpretationEligibility: true, confidence: 1, warnings: [],
        }] : []),
      ],
      calculationFingerprint: `destiny-matrix-fp-${fp.slice(0, 8)}`,
      calculationVersion: "v1", warnings: [], generatedAt: now,
    };
  } else {
    systems["destiny-matrix"] = unavailableEntry("destiny-matrix", "Destiny Matrix data not available", now);
  }

  // Whole Sign
  if (bp?.wholeSign) {
    try {
      systems["whole-sign"] = adaptWholeSignToArsipAkashi(bp.wholeSign);
    } catch {
      systems["whole-sign"] = unavailableEntry("whole-sign", "Whole Sign calculation error", now);
    }
  } else {
    systems["whole-sign"] = unavailableEntry("whole-sign", "Whole Sign requires separate calculation flow", now);
  }

  // Astrocartography
  if (bp?.astrocartography) {
    try {
      systems["astrocartography"] = adaptAstrocartographyToArsipAkashi(bp.astrocartography);
    } catch {
      systems["astrocartography"] = unavailableEntry("astrocartography", "Astrocartography calculation error", now);
    }
  } else {
    systems["astrocartography"] = unavailableEntry("astrocartography", "Astrocartography requires separate calculation flow", now);
  }

  // Zi Wei Dou Shu
  if (bp?.ziWei) {
    try {
      systems["zi-wei-dou-shu"] = adaptZiWeiToArsipAkashi(bp.ziWei);
    } catch {
      systems["zi-wei-dou-shu"] = unavailableEntry("zi-wei-dou-shu", "Zi Wei calculation error", now);
    }
  } else {
    systems["zi-wei-dou-shu"] = unavailableEntry("zi-wei-dou-shu", "Zi Wei requires an authenticated active-profile boundary", now);
  }

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
