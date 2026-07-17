import { calculateVedic } from "./calculateVedic";
import {
  buildVedicPresentation,
  VEDIC_PRESENTATION_SOURCE_VERSION,
  type VedicPresentation,
  type VedicPresentationInput,
} from "./presentation";
import type { VedicGraha } from "./types";

export type VedicFixtureResult = { name: string; passed: boolean; detail: string };

const FOUNDER_INPUT = {
  birthDate: "1985-05-03",
  birthTime: "23:45",
  birthCity: "Jakarta",
  latitude: -6.2088,
  longitude: 106.8456,
  timezone: "+07:00",
  asOf: "2026-06-18T00:00:00.000Z",
} as const;

function requireCondition(condition: unknown, detail: string): asserts condition {
  if (!condition) throw new Error(detail);
}

function runFixture(name: string, fixture: () => void): VedicFixtureResult {
  try {
    fixture();
    return { name, passed: true, detail: "" };
  } catch (error) {
    return { name, passed: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

function sentenceCount(value: string): number {
  return value.split(/[.!?]+(?:\s|$)/).map((sentence) => sentence.trim()).filter(Boolean).length;
}

function allSections(presentation: VedicPresentation) {
  return presentation.groups.flatMap((group) => group.sections);
}

export function runVedicPresentationFixtures(): VedicFixtureResult[] {
  const canonical = calculateVedic(FOUNDER_INPUT);
  const complete = buildVedicPresentation(canonical);
  const results: VedicFixtureResult[] = [];

  results.push(
    runFixture("complete canonical Vedic chart", () => {
      requireCondition(complete.status === "complete", "Canonical result should be complete");
      requireCondition(complete.groups.length >= 7, "Detail hierarchy is incomplete");
    }),
    runFixture("Founder canonical consistency", () => {
      requireCondition(canonical.lagna.sign === "Capricorn", `Unexpected Lagna ${canonical.lagna.sign}`);
      requireCondition(canonical.lagna.house === 1 && Math.abs(canonical.lagna.degree - 19.2165) < 0.0001, `Unexpected Lagna position ${canonical.lagna.degree}`);
      requireCondition(canonical.moonSign.sign === "Libra" && canonical.moonSign.house === 10 && Math.abs(canonical.moonSign.degree - 3.4872) < 0.0001, "Founder Moon mismatch");
      requireCondition(canonical.sunSign.sign === "Aries" && canonical.sunSign.house === 4 && Math.abs(canonical.sunSign.degree - 19.5374) < 0.0001, "Founder Sun mismatch");
      requireCondition(canonical.nakshatra === "Chitra" && canonical.pada === 4, "Founder Nakshatra/Pada mismatch");
      requireCondition(canonical.atmakaraka.planet === "Mercury" && canonical.atmakaraka.house === 3, "Founder Atmakaraka mismatch");
      requireCondition(canonical.darakaraka.planet === "Saturn" && canonical.darakaraka.house === 11, "Founder Darakaraka mismatch");
      requireCondition(canonical.currentMahadasha.planet === "Saturn" && canonical.currentAntardasha.planet === "Mercury", "Founder Dasha mismatch");
      requireCondition(canonical.currentMahadasha.startDate === "2021-01-02T14:45:29.091Z" && canonical.currentMahadasha.endDate === "2040-01-03T05:20:17.091Z", "Mahadasha dates changed");
      requireCondition(canonical.currentAntardasha.startDate === "2024-01-06T09:15:59.691Z" && canonical.currentAntardasha.endDate === "2026-09-15T11:55:55.491Z", "Antardasha dates changed");
    }),
    runFixture("sidereal convention preservation", () => {
      requireCondition(canonical.meta.standards.zodiac === "sidereal", "Zodiac convention changed");
      requireCondition(canonical.meta.standards.ayanamsha === "Lahiri/Chitrapaksha", "Ayanamsa changed");
      requireCondition(canonical.meta.standards.houses === "whole-sign", "House convention changed");
      requireCondition(canonical.meta.standards.nodes === "mean" && canonical.meta.standards.dasha === "Vimshottari", "Node or Dasha convention changed");
    }),
    runFixture("missing birth time", () => {
      const partial = buildVedicPresentation(canonical, { birthTimeAvailable: false });
      requireCondition(partial.readContract.lagna === null, "Unverified Lagna must be hidden");
      requireCondition(partial.readContract.houses.length === 0, "Unverified Houses must be hidden");
      requireCondition(partial.readContract.moon?.house === null, "House-specific Moon claim leaked");
      requireCondition(!partial.readContract.nakshatra && !partial.readContract.pada, "Unverified Nakshatra or Pada leaked");
      requireCondition(!partial.readContract.atmakaraka && !partial.readContract.darakaraka, "Unverified Karaka leaked");
      requireCondition(!partial.readContract.mahadasha && !partial.readContract.antardasha, "Unverified Dasha leaked");
      requireCondition(!partial.readContract.planetaryStrength, "House-dependent strength leaked");
    }),
    ...([
      ["null", null],
      ["undefined", undefined],
      ["empty", ""],
      ["malformed", "25:99"],
    ] as const).map(([label, birthTime]) => runFixture(`calculation birth time ${label}`, () => {
      const result = calculateVedic({ ...FOUNDER_INPUT, birthTime });
      const partial = result as unknown as { status?: string; availableSections?: string[]; unavailableSections?: string[]; message?: string; lagna?: unknown; planets?: unknown };
      requireCondition(partial.status === "PARTIAL_BIRTH_TIME_REQUIRED", `${label} time did not return structured partial status`);
      requireCondition(!partial.lagna && !partial.planets, `${label} time fabricated time-dependent facts`);
      requireCondition(partial.availableSections?.length === 0 && partial.unavailableSections?.includes("Lagna"), `${label} time availability contract is incomplete`);
      requireCondition(partial.message?.startsWith("Waktu lahir diperlukan"), `${label} time message is missing`);
      requireCondition(buildVedicPresentation(result).status === "partial", `${label} time presentation did not degrade safely`);
    })),
    runFixture("calculation birth time valid 00:00", () => {
      const result = calculateVedic({ ...FOUNDER_INPUT, birthTime: "00:00" });
      requireCondition(Boolean(result.lagna && result.planets), "00:00 was rejected or treated as missing");
    }),
    runFixture("calculation birth time valid 23:59", () => {
      const result = calculateVedic({ ...FOUNDER_INPUT, birthTime: "23:59" });
      requireCondition(Boolean(result.lagna && result.planets), "23:59 was rejected or treated as missing");
    }),
  );

  for (const sign of ["Aries", "Cancer", "Libra", "Capricorn"]) {
    results.push(runFixture(`different Lagna sign: ${sign}`, () => {
      const output = buildVedicPresentation({ ...canonical, lagna: { ...canonical.lagna, sign } });
      requireCondition(output.readContract.lagna?.sign === sign, `${sign} Lagna not preserved`);
    }));
  }

  for (const sign of ["Taurus", "Gemini", "Scorpio", "Pisces"]) {
    results.push(runFixture(`different Moon sign: ${sign}`, () => {
      const output = buildVedicPresentation({ ...canonical, moonSign: { ...canonical.moonSign, sign } });
      requireCondition(output.readContract.moon?.sign === sign && output.readContract.rashi?.sign === sign, `${sign} Moon/Rashi not preserved`);
    }));
  }

  for (const nakshatra of ["Ashwini", "Rohini", "Chitra", "Revati"]) {
    results.push(runFixture(`different Nakshatra: ${nakshatra}`, () => {
      const output = buildVedicPresentation({ ...canonical, nakshatra });
      requireCondition(output.readContract.nakshatra?.displayValue === nakshatra, `${nakshatra} was not presented`);
      requireCondition(sentenceCount(output.readContract.nakshatra.fullExplanation) === 3, "Nakshatra needs three sentences");
    }));
  }

  for (const pada of [1, 2, 3, 4]) {
    results.push(runFixture(`Pada ${pada}`, () => {
      const output = buildVedicPresentation({ ...canonical, pada });
      requireCondition(output.readContract.pada?.rawValue === pada, `Pada ${pada} changed`);
      requireCondition(output.readContract.pada.fullExplanation.includes("Nakshatra"), "Pada refinement lost its Nakshatra context");
    }));
  }

  for (const planet of ["Sun", "Mars", "Jupiter", "Mercury"] as VedicGraha[]) {
    results.push(runFixture(`different Atmakaraka: ${planet}`, () => {
      const output = buildVedicPresentation({ ...canonical, atmakaraka: { ...canonical.atmakaraka, planet: planet as "Sun" } });
      requireCondition(output.readContract.atmakaraka?.rawValue === planet, `${planet} Atmakaraka changed`);
    }));
  }

  for (const planet of ["Moon", "Venus", "Saturn", "Mars"] as VedicGraha[]) {
    results.push(runFixture(`different Darakaraka: ${planet}`, () => {
      const output = buildVedicPresentation({ ...canonical, darakaraka: { ...canonical.darakaraka, planet: planet as "Moon" } });
      requireCondition(output.readContract.darakaraka?.rawValue === planet, `${planet} Darakaraka changed`);
    }));
  }

  results.push(
    runFixture("Rahu coverage", () => requireCondition(complete.readContract.rahu?.label === "Rahu", "Rahu missing")),
    runFixture("Ketu coverage", () => requireCondition(complete.readContract.ketu?.label === "Ketu", "Ketu missing")),
    runFixture("retrograde planet", () => {
      const output = buildVedicPresentation({ ...canonical, planets: { ...canonical.planets, Mercury: { ...canonical.planets.Mercury, retrograde: true } } });
      requireCondition(output.readContract.mercury?.retrogradeStatus === "Retrograde", "Retrograde state missing");
      requireCondition(output.readContract.retrogradePlanets?.displayValue.includes("Mercury"), "Retrograde synthesis missing Mercury");
    }),
    runFixture("strong planetary function", () => requireCondition(complete.readContract.planetaryStrength?.displayValue.includes("Strong"), "Strong state missing")),
    runFixture("weaker planetary function", () => {
      const output = buildVedicPresentation({ ...canonical, planetaryStrength: [{ planet: "Sun", level: "Weak", score: -3, reasons: ["fixture"] }] });
      const strength = output.readContract.planetaryStrength;
      requireCondition(strength !== null, "Planetary Strength section is missing");
      requireCondition(strength.fullExplanation.includes("memerlukan pengembangan"), "Weaker function was framed unsafely");
      requireCondition(!/planet lemah (?:adalah|berarti) buruk/i.test(strength.fullExplanation), "Weak planet was called bad");
    }),
    runFixture("Mahadasha available", () => requireCondition(complete.readContract.mahadasha?.rawValue === "Saturn", "Mahadasha missing")),
    runFixture("Antardasha available", () => requireCondition(complete.readContract.antardasha?.rawValue === "Mercury", "Antardasha missing")),
    runFixture("missing Dasha", () => {
      const output = buildVedicPresentation({ ...canonical, currentMahadasha: undefined, currentAntardasha: undefined });
      requireCondition(!output.readContract.mahadasha && !output.readContract.antardasha && !output.readContract.currentDashaThemes, "Missing Dasha was fabricated");
    }),
    runFixture("current Dasha synthesis", () => {
      const section = complete.readContract.currentDashaThemes;
      requireCondition(section?.displayValue === "Saturn Mahadasha · Mercury Antardasha", "Current Dasha identity changed");
      requireCondition(sentenceCount(section.fullExplanation) === 3, "Current Dasha theme needs three sentences");
    }),
    runFixture("legacy stored record", () => {
      const legacy: VedicPresentationInput = { moonSign: { sign: "Libra" }, nakshatra: "Chitra", pada: 4 };
      const output = buildVedicPresentation(legacy, { birthTimeAvailable: false });
      requireCondition(output.status === "partial" && output.readContract.rashi?.sign === "Libra", "Legacy sign-level record failed");
      requireCondition(output.summary.length === 3, "Partial record must use three paragraphs");
    }),
    runFixture("calculation failure", () => {
      let failed = false;
      try {
        calculateVedic({ birthDate: "invalid", birthTime: "12:00", latitude: null, longitude: null, timezone: null });
      } catch {
        failed = true;
      }
      requireCondition(failed, "Invalid calculation input should fail closed");
    }),
    runFixture("presentation-source failure", () => requireCondition(buildVedicPresentation(null).status === "unavailable", "Null source should be unavailable")),
    runFixture("refresh stability", () => {
      requireCondition(JSON.stringify(buildVedicPresentation(canonical)) === JSON.stringify(buildVedicPresentation(canonical)), "Presentation changed across refresh");
    }),
    runFixture("concurrent users", () => {
      const outputs = ["Aries", "Virgo", "Aquarius"].map((sign) => buildVedicPresentation({ ...canonical, lagna: { ...canonical.lagna, sign } }));
      requireCondition(outputs.map((output) => output.readContract.lagna?.sign).join(",") === "Aries,Virgo,Aquarius", "Concurrent results collided");
    }),
    runFixture("cross-user isolation", () => {
      const first = buildVedicPresentation({ ...canonical, lagna: { ...canonical.lagna, sign: "Aries" } });
      const second = buildVedicPresentation({ ...canonical, lagna: { ...canonical.lagna, sign: "Pisces" } });
      requireCondition(first.readContract.lagna?.sign === "Aries" && second.readContract.lagna?.sign === "Pisces", "User result leaked");
    }),
    runFixture("summary paragraph validation", () => {
      requireCondition(complete.summary.length === 4, "Complete summary must have four paragraphs");
      requireCondition(complete.summaryText.split("\n\n").length === 4 && !complete.summaryText.includes("\n\n\n"), "Summary spacing is invalid");
    }),
    runFixture("summary sentence validation", () => {
      requireCondition(complete.summary.every((paragraph) => sentenceCount(paragraph) >= 3 && sentenceCount(paragraph) <= 4), "Each summary paragraph needs three to four sentences");
    }),
    runFixture("principal narrative length", () => {
      requireCondition(allSections(complete).every((section) => sentenceCount(section.fullExplanation) >= 2 && sentenceCount(section.fullExplanation) <= 3), "Principal card outside two-to-three-sentence contract");
    }),
    runFixture("duplicate narrative validation", () => {
      const narratives = allSections(complete).map((section) => section.fullExplanation);
      requireCondition(new Set(narratives).size === narratives.length, "Duplicate full narrative detected");
      requireCondition(complete.readContract.mahadasha?.fullExplanation !== complete.readContract.antardasha?.fullExplanation, "Dasha narratives are duplicated");
      requireCondition(complete.readContract.atmakaraka?.fullExplanation !== complete.readContract.darakaraka?.fullExplanation, "Karaka narratives are duplicated");
    }),
    runFixture("technical-term separation validation", () => {
      const technicalHits = complete.summaryText.match(/Lagna|Nakshatra|Pada|Atmakaraka|Darakaraka|Mahadasha|Antardasha|Graha|Bhava/g) || [];
      requireCondition(technicalHits.length <= 1, "Technical terms dominate the final summary");
      requireCondition(complete.groups.some((group) => group.sections.some((section) => section.label === "Lagna")), "Canonical labels disappeared from detail UI");
    }),
    runFixture("section output contract", () => {
      for (const section of allSections(complete)) {
        requireCondition(section.sectionId && section.label && section.displayValue, "Required section identity missing");
        requireCondition(section.sourceVersion === VEDIC_PRESENTATION_SOURCE_VERSION, "Source version missing");
        requireCondition(section.availabilityStatus === "available", "Invalid availability state");
        requireCondition(!section.displayValue.includes("[object Object]"), "Raw object leaked");
      }
    }),
    runFixture("profile card contract", () => {
      requireCondition(complete.profileCard.title === "Vedic Astrology", "Profile title changed");
      requireCondition(Boolean(complete.profileCard.lagna && complete.profileCard.rashi && complete.profileCard.nakshatra), "Compact identity missing");
      requireCondition(complete.profileCard.action === "Lihat detail selengkapnya", "Profile action changed");
    }),
  );

  return results;
}

export function runVedicPageSourceFixtures(pageSource: string, profileSource: string): VedicFixtureResult[] {
  return [
    runFixture("no silent noon fallback", () => {
      requireCondition(!pageSource.includes('"12:00"') && pageSource.includes("if (birthDate && birthTime)"), "Silent noon fallback detected");
    }),
    runFixture("no automatic storage write", () => {
      requireCondition(!/saveUserBlueprint|setUserBlueprint|localStorage\.setItem/.test(pageSource), "Vedic page writes during refresh");
    }),
    runFixture("active page consumes presentation adapter", () => {
      requireCondition(pageSource.includes("buildVedicPresentation") && pageSource.includes("presentation.groups.map"), "Page does not consume structured presentation");
      requireCondition(!pageSource.includes("vedic.summary.map") && !pageSource.includes("vedic.planets"), "Raw Vedic result still owns JSX");
    }),
    runFixture("card explanations are expandable", () => {
      requireCondition(pageSource.includes("<details") && pageSource.includes("<summary") && pageSource.includes("Lihat selengkapnya"), "Expandable card explanation is not wired");
      requireCondition(pageSource.includes("Tutup penjelasan"), "Expanded state has no clear close label");
    }),
    runFixture("mobile source-level safety", () => {
      requireCondition(pageSource.includes("grid-cols-1") && pageSource.includes("sm:grid-cols-2"), "Mobile cards do not stack");
      requireCondition(pageSource.includes("overflow-x-hidden") && pageSource.includes("break-words"), "Long terms may overflow");
    }),
    runFixture("desktop source-level safety", () => {
      requireCondition(pageSource.includes("max-w-2xl") && pageSource.includes("max-w-xl"), "Readable desktop width missing");
      requireCondition(!/\bmin-h-\[(?:[3-9]\d\d|\d{4,})px\]/.test(pageSource), "Excessive fixed card height detected");
    }),
    runFixture("profile Vedic card matches other systems", () => {
      const start = profileSource.indexOf('title: "Vedic Astrology"');
      const end = profileSource.indexOf('title: "Tzolkin Maya"', start);
      const block = profileSource.slice(start, end);
      requireCondition(block.includes('desc: "Peta langit kelahiran melalui tradisi astrologi Vedik."'), "Vedic overview description changed");
      requireCondition(!/profileCard|details:|action:/.test(block), "Vedic overview has extra fields that other system cards do not have");
      requireCondition(!profileSource.includes("c.details") && !profileSource.includes("c.action"), "Profile card renderer still has a Vedic-only layout");
    }),
  ];
}
