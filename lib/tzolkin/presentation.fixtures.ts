import { calculateTzolkin } from "./calculateTzolkin";
import { GALACTIC_TONES, SOLAR_SEALS } from "./dictionaries";
import {
  buildTzolkinPresentation,
  TZOLKIN_PRESENTATION_SOURCE_VERSION,
  TZOLKIN_SOURCE_PROVENANCE,
  type TzolkinPresentation,
  type TzolkinPresentationInput,
} from "./presentation";

export type TzolkinFixtureResult = { name: string; passed: boolean; detail: string };

function requireCondition(condition: unknown, detail: string): asserts condition {
  if (!condition) throw new Error(detail);
}

function runFixture(name: string, fixture: () => void): TzolkinFixtureResult {
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

function allSections(presentation: TzolkinPresentation) {
  return presentation.groups.flatMap((group) => group.sections);
}

function addUtcDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function runTzolkinPresentationFixtures(): TzolkinFixtureResult[] {
  const founder = calculateTzolkin({ birthDate: "1985-05-03" });
  const complete = buildTzolkinPresentation(founder);
  const kin1 = calculateTzolkin({ birthDate: "1988-03-10" });
  const kin260 = calculateTzolkin({ birthDate: "1988-03-09" });
  const results: TzolkinFixtureResult[] = [];

  results.push(
    runFixture("Kin 1", () => requireCondition(kin1.kin === 1 && buildTzolkinPresentation(kin1).readContract.kinNumber === 1, "Kin 1 changed")),
    runFixture("Kin 260", () => requireCondition(kin260.kin === 260 && buildTzolkinPresentation(kin260).readContract.kinNumber === 260, "Kin 260 changed")),
    runFixture("Founder canonical consistency", () => {
      requireCondition(founder.kin === 260, `Founder Kin changed to ${founder.kin}`);
      requireCondition(founder.galacticTone.name === "13 - Cosmic", "Founder Tone changed");
      requireCondition(founder.solarSeal.name === "Matahari Kuning", "Founder Seal changed");
      requireCondition(founder.wavespell.name === "Gelombang Bintang Kuning" && founder.castle.name === "Kastil Tengah Hijau", "Founder cycle changed");
      requireCondition(founder.gap === true, "Founder GAP changed");
      requireCondition(founder.oracle.guide.seal.name === "Benih Kuning", "Founder Guide changed");
      requireCondition(founder.oracle.analog.seal.name === "Badai Biru", "Founder Analog changed");
      requireCondition(founder.oracle.antipode.seal.name === "Anjing Putih", "Founder Antipode changed");
      requireCondition(founder.oracle.occult.seal.name === "Naga Merah", "Founder Occult changed");
    }),
    runFixture("complete record", () => requireCondition(complete.status === "complete" && complete.groups.length === 5, "Complete hierarchy failed")),
  );

  const toneResults = new Map<number, ReturnType<typeof calculateTzolkin>>();
  const sealResults = new Map<number, ReturnType<typeof calculateTzolkin>>();
  for (let day = 0; day < 260; day += 1) {
    const result = calculateTzolkin({ birthDate: addUtcDays("1988-03-10", day) });
    const toneNumber = Number(result.galacticTone.name.split(" - ")[0]);
    const sealNumber = SOLAR_SEALS.findIndex((seal) => seal.name === result.solarSeal.name) + 1;
    if (!toneResults.has(toneNumber)) toneResults.set(toneNumber, result);
    if (!sealResults.has(sealNumber)) sealResults.set(sealNumber, result);
  }
  for (let tone = 1; tone <= 13; tone += 1) {
    results.push(runFixture(`Galactic Tone ${tone}`, () => {
      const canonical = toneResults.get(tone);
      requireCondition(canonical, `No fixture for Tone ${tone}`);
      const output = buildTzolkinPresentation(canonical);
      requireCondition(output.readContract.toneNumber === tone, `Tone ${tone} changed`);
      requireCondition(output.readContract.tone?.toneName === GALACTIC_TONES[tone - 1].name.split(" - ")[1], `Tone ${tone} name changed`);
    }));
  }
  for (let seal = 1; seal <= 20; seal += 1) {
    results.push(runFixture(`Solar Seal ${seal}`, () => {
      const canonical = sealResults.get(seal);
      requireCondition(canonical, `No fixture for Seal ${seal}`);
      const output = buildTzolkinPresentation(canonical);
      requireCondition(output.readContract.sealNumber === seal, `Seal ${seal} changed`);
      requireCondition(output.readContract.seal?.sealName === SOLAR_SEALS[seal - 1].name, `Seal ${seal} name changed`);
    }));
  }

  for (const fixture of [
    ["1988-03-10", "Gelombang Naga Merah", "Kastil Timur Merah"],
    ["1987-10-04", "Gelombang Manusia Kuning", "Kastil Utara Putih"],
    ["1987-11-25", "Gelombang Benih Kuning", "Kastil Barat Biru"],
    ["1988-01-16", "Gelombang Ksatria Kuning", "Kastil Selatan Kuning"],
    ["1988-03-09", "Gelombang Bintang Kuning", "Kastil Tengah Hijau"],
  ]) {
    results.push(runFixture(`Wavespell and Castle: ${fixture[0]}`, () => {
      const output = calculateTzolkin({ birthDate: fixture[0] });
      requireCondition(output.wavespell.name === fixture[1] && output.castle.name === fixture[2], `Cycle changed for ${fixture[0]}`);
    }));
  }

  results.push(
    runFixture("Guide mapping", () => requireCondition(complete.readContract.guide?.sealName === founder.oracle.guide.seal.name, "Guide changed")),
    runFixture("Analog mapping", () => requireCondition(complete.readContract.analog?.sealName === founder.oracle.analog.seal.name, "Analog changed")),
    runFixture("Antipode mapping", () => requireCondition(complete.readContract.antipode?.sealName === founder.oracle.antipode.seal.name, "Antipode changed")),
    runFixture("Occult mapping", () => requireCondition(complete.readContract.occult?.sealName === founder.oracle.occult.seal.name, "Occult changed")),
    runFixture("relationship narratives distinct", () => {
      const narratives = [complete.readContract.guide, complete.readContract.analog, complete.readContract.antipode, complete.readContract.occult].map((item) => item?.fullExplanation);
      requireCondition(narratives.every(Boolean) && new Set(narratives).size === 4, "Oracle narratives duplicated");
    }),
    runFixture("GAP true", () => {
      const gap = complete.readContract.gap;
      requireCondition(complete.readContract.isGap === true && gap, "GAP true missing");
      requireCondition(gap.fullExplanation.includes("tidak memberi kekuatan paranormal"), "Scientific and supernatural boundary missing");
      requireCondition(!/menjamin|membuka portal|manusia pilihan|lebih unggul/i.test(gap.fullExplanation), "Unsafe GAP claim");
    }),
    runFixture("GAP false", () => {
      const output = buildTzolkinPresentation(calculateTzolkin({ birthDate: "1987-08-13" }));
      requireCondition(output.readContract.isGap === false && output.readContract.gap === null, "False GAP must be omitted");
    }),
    runFixture("legacy stored record", () => {
      const legacy: TzolkinPresentationInput = { kin: 260, kinName: founder.kinName, solarSeal: founder.solarSeal, galacticTone: founder.galacticTone, color: founder.color };
      const output = buildTzolkinPresentation(legacy);
      requireCondition(output.status === "partial" && output.summary.length === 3, "Legacy record failed");
    }),
    runFixture("partial relationship data", () => {
      const output = buildTzolkinPresentation({ ...founder, oracle: { guide: founder.oracle.guide } });
      requireCondition(output.readContract.guide && !output.readContract.analog && !output.readContract.antipode && !output.readContract.occult, "Missing relationship fabricated");
    }),
    runFixture("missing Wavespell", () => requireCondition(!buildTzolkinPresentation({ ...founder, wavespell: undefined }).readContract.wavespell, "Wavespell fabricated")),
    runFixture("missing Castle", () => requireCondition(!buildTzolkinPresentation({ ...founder, castle: undefined }).readContract.castle, "Castle fabricated")),
    runFixture("calculation failure", () => {
      let failed = false;
      try { calculateTzolkin({ birthDate: "invalid" }); } catch { failed = true; }
      requireCondition(failed, "Invalid date should fail closed");
    }),
    runFixture("presentation-source failure", () => requireCondition(buildTzolkinPresentation(null).status === "unavailable", "Null source should be unavailable")),
    runFixture("refresh stability", () => requireCondition(JSON.stringify(buildTzolkinPresentation(founder)) === JSON.stringify(buildTzolkinPresentation(founder)), "Refresh changed output")),
    runFixture("concurrent users", () => {
      const outputs = [kin1, calculateTzolkin({ birthDate: "1987-08-13" }), kin260].map(buildTzolkinPresentation);
      requireCondition(outputs.map((output) => output.readContract.kinNumber).join(",") === "1,52,260", "Concurrent output collided");
    }),
    runFixture("cross-user isolation", () => requireCondition(buildTzolkinPresentation(kin1).readContract.kinNumber === 1 && buildTzolkinPresentation(kin260).readContract.kinNumber === 260, "User output leaked")),
    runFixture("summary paragraph validation", () => requireCondition(complete.summary.length === 4 && complete.summaryText.split("\n\n").length === 4 && !complete.summaryText.includes("\n\n\n"), "Summary paragraphs invalid")),
    runFixture("summary sentence validation", () => requireCondition(complete.summary.every((paragraph) => sentenceCount(paragraph) >= 3 && sentenceCount(paragraph) <= 4), "Summary sentence count invalid")),
    runFixture("principal narrative length", () => requireCondition(allSections(complete).every((item) => sentenceCount(item.fullExplanation) >= 2 && sentenceCount(item.fullExplanation) <= 3), "Card sentence count invalid")),
    runFixture("duplicate narrative validation", () => {
      const narratives = allSections(complete).map((item) => item.fullExplanation);
      requireCondition(new Set(narratives).size === narratives.length, "Duplicate narrative detected");
      requireCondition(buildTzolkinPresentation(kin1).summaryText !== complete.summaryText, "Different Kin received same summary");
    }),
    runFixture("technical-term exclusion validation", () => {
      const forbidden = /Tzolkin|\bKin\b|Galactic Tone|Solar Seal|Wavespell|Castle|Guide|Analog|Antipode|Occult|\bGAP\b|Galactic Activation Portal|Presence|Enchantment|\bKan\b|Cauac|Ahau|Akbal|archetype|polarity|symbolic field|cosmic frequency/i;
      requireCondition(!forbidden.test(complete.summaryText), "Technical Tzolkin term remains in summary");
      requireCondition(allSections(complete).some((item) => item.label === "Galactic Tone"), "Canonical label missing");
    }),
    runFixture("English-term exclusion validation", () => {
      const english = /\b(?:Purpose|Challenge|Service|Form|Radiance|Equality|Attunement|Integrity|Intention|Manifestation|Liberation|Cooperation|Cosmic|Turning|Crossing|Burning|Giving|Presence|Enchantment)\b/i;
      requireCondition(!english.test(complete.summaryText), "English dictionary term remains in summary");
    }),
    runFixture("summary grammar and duplicate-word validation", () => {
      requireCondition(!/\b([A-Za-zÀ-ÿ]+)\s+\1\b/i.test(complete.summaryText), "Duplicate word detected");
      requireCondition(!/melalui melalui|saat saat|dan dan|yang yang|untuk untuk|ke dalam dalam/i.test(complete.summaryText), "Awkward joined fragment detected");
      const openings = complete.summary.flatMap((paragraph) => paragraph.split(/[.!?]+/).map((sentence) => sentence.trim().split(/\s+/)[0]).filter(Boolean));
      requireCondition(new Set(openings).size === openings.length, "Sentence opening repeats mechanically");
    }),
    runFixture("friend-like narrative validation", () => {
      requireCondition(/Kamu|Dirimu|hubungan|keseimbangan|keseharian/.test(complete.summaryText), "Personal lived language is missing");
      requireCondition(!/sistem|klasifikasi|domain|teknis|kamus|kalender|medan tematik|atmosfer simbolik/i.test(complete.summaryText), "Summary still explains a system");
      requireCondition(!/[•\-*]\s/.test(complete.summaryText), "Summary contains bullet-like output");
    }),
    runFixture("cross-user paragraph differentiation", () => {
      const other = buildTzolkinPresentation(kin1);
      requireCondition(other.summary.length === 4, "Comparison summary is incomplete");
      requireCondition(complete.summary.every((paragraph) => !other.summary.includes(paragraph)), "Different users share an identical summary paragraph");
      requireCondition(complete.summaryText !== other.summaryText, "Different users share an identical summary");
    }),
    runFixture("partial summary humanization", () => {
      const partial = buildTzolkinPresentation({ kin: founder.kin, kinName: founder.kinName, solarSeal: founder.solarSeal, galacticTone: founder.galacticTone });
      requireCondition(partial.summary.length === 3, "Partial data must use three paragraphs");
      requireCondition(!/Tzolkin|\bKin\b|Galactic Tone|Solar Seal|Wavespell|Castle|Guide|Analog|Antipode|Occult|\bGAP\b|Cosmic|Ahau/i.test(partial.summaryText), "Partial summary leaked technical terms");
    }),
    runFixture("safe partial values", () => requireCondition(buildTzolkinPresentation({ kin: 0, kinName: "", gap: false }).status === "unavailable", "Empty values treated as meaningful")),
    runFixture("structured identity read contract", () => {
      const contract = complete.readContract;
      requireCondition(contract.kinNumber === 260 && contract.toneNumber === 13 && contract.sealNumber === 20, "Identity contract changed");
      requireCondition(contract.archetypeThemes && contract.giftThemes && contract.challengeThemes && contract.emotionalThemes, "Archetype contract incomplete");
      requireCondition(contract.relationshipThemes && contract.workThemes && contract.growthDirection, "Lived themes incomplete");
    }),
    runFixture("pre-cutoff source classification", () => {
      requireCondition(TZOLKIN_SOURCE_PROVENANCE.calculation.classification === "STRUCTURED_PRE_CUTOFF_SOURCE", "Calculation provenance changed");
      requireCondition(new Date(TZOLKIN_SOURCE_PROVENANCE.calculation.lastVerifiedAt) < new Date(TZOLKIN_SOURCE_PROVENANCE.cutoff), "Calculation is not pre-cutoff");
    }),
    runFixture("dictionary source classification", () => {
      requireCondition(TZOLKIN_SOURCE_PROVENANCE.dictionaries.classification === "STRUCTURED_PRE_CUTOFF_SOURCE", "Dictionary provenance changed");
      requireCondition(new Date(TZOLKIN_SOURCE_PROVENANCE.dictionaries.lastVerifiedAt) < new Date(TZOLKIN_SOURCE_PROVENANCE.cutoff), "Dictionary is not pre-cutoff");
      requireCondition(TZOLKIN_SOURCE_PROVENANCE.postCutoffPolicy.classification === "POST_CUTOFF_FORWARD_SOURCE" && !TZOLKIN_SOURCE_PROVENANCE.postCutoffPolicy.usedByPresentation, "Post-cutoff policy unsafe");
    }),
    runFixture("functional reconstruction provenance", () => requireCondition(complete.readContract.sourceClassification.presentation === "FOUNDER_APPROVED_FUNCTIONAL_RECONSTRUCTION", "Presentation provenance changed")),
    runFixture("no exact V4 claim", () => requireCondition(complete.readContract.sourceClassification.exactV4Claim === "UNPROVEN", "Unproven source labeled exact")),
    runFixture("stable sourceVersion", () => requireCondition(allSections(complete).every((item) => item.sourceVersion === TZOLKIN_PRESENTATION_SOURCE_VERSION), "Source version unstable")),
    runFixture("Kin wraparound and cycle boundaries", () => {
      requireCondition(calculateTzolkin({ birthDate: "1988-03-09" }).kin === 260 && calculateTzolkin({ birthDate: "1988-03-10" }).kin === 1, "Kin wraparound changed");
      requireCondition(calculateTzolkin({ birthDate: "1988-02-29" }).kin === calculateTzolkin({ birthDate: "1988-02-28" }).kin, "Leap-day convention changed");
    }),
  );
  return results;
}

export function runTzolkinPageSourceFixtures(pageSource: string, profileSource: string, presentationSource: string): TzolkinFixtureResult[] {
  return [
    runFixture("no automatic storage write", () => requireCondition(!/saveUserBlueprint|setUserBlueprint|localStorage\.setItem/.test(pageSource), "Page writes during refresh")),
    runFixture("active page consumes presentation adapter", () => {
      requireCondition(pageSource.includes("buildTzolkinPresentation") && pageSource.includes("presentation.groups.map"), "Page does not consume adapter");
      requireCondition(!pageSource.includes("tzolkin.summary.map") && !pageSource.includes("tzolkin.oracle.guide"), "Raw result owns JSX");
    }),
    runFixture("provenance not exposed", () => requireCondition(!/sourceClassification|SOURCE_PROVENANCE|EXACT_V4_SOURCE/.test(pageSource), "Provenance leaked to UI")),
    runFixture("card explanations expandable", () => requireCondition(pageSource.includes("<details") && pageSource.includes("<summary") && pageSource.includes("Lihat selengkapnya") && pageSource.includes("Tutup penjelasan"), "Expandable content missing")),
    runFixture("mobile source safety", () => requireCondition(pageSource.includes("grid-cols-1") && pageSource.includes("sm:grid-cols-2") && pageSource.includes("overflow-x-hidden") && pageSource.includes("break-words"), "Mobile safety missing")),
    runFixture("desktop source safety", () => requireCondition(pageSource.includes("max-w-2xl") && pageSource.includes("max-w-xl") && !/\bmin-h-\[(?:[3-9]\d\d|\d{4,})px\]/.test(pageSource), "Desktop safety missing")),
    runFixture("profile Tzolkin card matches other systems", () => {
      const start = profileSource.indexOf('title: "Tzolkin Maya"');
      const block = profileSource.slice(start, profileSource.indexOf("  ];", start));
      requireCondition(block.includes('desc: "Kode waktu dan ritme kesadaran dari kalender sakral Maya."'), "Tzolkin overview description changed");
      requireCondition(!/profileCard|details:|action:/.test(block), "Tzolkin overview has extra fields");
      requireCondition(!profileSource.includes("c.details") && !profileSource.includes("c.action"), "Profile renderer still has a Tzolkin-only layout");
    }),
    runFixture("no Founder-specific summary hardcode", () => {
      requireCondition(!presentationSource.includes("1985-05-03") && !presentationSource.includes("Kin 260"), "Founder-specific canonical input was hardcoded");
      requireCondition(!presentationSource.includes("Kamu memiliki daya hadir yang kuat, hangat"), "Founder quality-reference paragraph was copied verbatim");
    }),
  ];
}
