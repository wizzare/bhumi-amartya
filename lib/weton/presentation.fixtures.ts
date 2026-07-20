import { calculateWeton } from "./calculateWeton";
import {
  buildWetonPresentation,
  TULANG_WANGI_REGISTRY,
  type WetonPresentationInput,
} from "./presentation";

export type WetonFixtureResult = {
  name: string;
  passed: boolean;
  detail: string;
};

function requireCondition(condition: unknown, detail: string): asserts condition {
  if (!condition) throw new Error(detail);
}

function sentenceCount(value: string): number {
  return value
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean).length;
}

function runFixture(name: string, fixture: () => void): WetonFixtureResult {
  try {
    fixture();
    return { name, passed: true, detail: "PASS" };
  } catch (error) {
    return {
      name,
      passed: false,
      detail: error instanceof Error ? error.message : "Unknown fixture failure",
    };
  }
}

function canonicalSamples() {
  const start = Date.UTC(2020, 6, 5);
  return Array.from({ length: 70 }, (_, index) => {
    const date = new Date(start + index * 86_400_000).toISOString().slice(0, 10);
    return calculateWeton({ birthDate: date, birthTime: "12:00" });
  });
}

export async function runWetonPresentationFixtures(): Promise<WetonFixtureResult[]> {
  const samples = canonicalSamples();
  const primary = calculateWeton({ birthDate: "1985-05-03", birthTime: "23:45" });
  const secondary = calculateWeton({ birthDate: "1992-11-17", birthTime: "08:15" });
  const completePresentation = buildWetonPresentation(primary);
  const legacy: WetonPresentationInput = {
    weton: "Sabtu Legi",
    day: "Sabtu",
    pasaran: "Legi",
    totalNeptu: 14,
    watak: primary.watak,
    strengths: primary.strengths,
    challenges: primary.challenges,
    relationshipStyle: primary.relationshipStyle,
    workStyle: primary.workStyle,
    moneyStyle: primary.moneyStyle,
    lifeMission: primary.lifeMission,
  };

  const results = [
    runFixture("canonical calculation regression", () => {
      requireCondition(primary.day === "Sabtu", "Expected Hari Sabtu");
      requireCondition(primary.pasaran === "Legi", "Expected Pasaran Legi");
      requireCondition(primary.totalNeptu === 14, "Expected Total Neptu 14");
      requireCondition(primary.wuku.name === "Bala", "Expected Wuku Bala");
      requireCondition(primary.pranataMangsa.name === "Desta", "Expected Pranata Mangsa Desta");
    }),
    runFixture("every weekday", () => {
      requireCondition(new Set(samples.map((sample) => sample.day)).size === 7, "Not every weekday was covered");
    }),
    runFixture("every Pasaran", () => {
      requireCondition(new Set(samples.map((sample) => sample.pasaran)).size === 5, "Not every Pasaran was covered");
    }),
    runFixture("varied Hari-Pasaran combinations", () => {
      requireCondition(new Set(samples.map((sample) => sample.weton)).size === 35, "Expected all 35 combinations");
    }),
    runFixture("low medium high Neptu", () => {
      const totals = samples.map((sample) => sample.totalNeptu);
      requireCondition(totals.some((value) => value <= 10), "Low Neptu missing");
      requireCondition(totals.some((value) => value >= 11 && value <= 14), "Medium Neptu missing");
      requireCondition(totals.some((value) => value >= 15), "High Neptu missing");
    }),
    runFixture("Wuku available", () => {
      requireCondition(completePresentation.sections.some((section) => section.id === "wuku"), "Wuku section missing");
    }),
    runFixture("Wuku unavailable", () => {
      const presentation = buildWetonPresentation({ ...primary, wuku: null });
      requireCondition(!presentation.sections.some((section) => section.id === "wuku"), "Wuku section should be omitted");
    }),
    runFixture("Pranata Mangsa available", () => {
      requireCondition(completePresentation.sections.some((section) => section.id === "pranata-mangsa"), "Pranata Mangsa section missing");
    }),
    runFixture("Pranata Mangsa unavailable", () => {
      const presentation = buildWetonPresentation({ ...primary, pranataMangsa: null });
      requireCondition(!presentation.sections.some((section) => section.id === "pranata-mangsa"), "Pranata Mangsa section should be omitted");
    }),
    runFixture("missing birth time", () => {
      const first = calculateWeton({ birthDate: "2001-02-03" });
      const second = calculateWeton({ birthDate: "2001-02-03", birthTime: null });
      requireCondition(JSON.stringify(first) === JSON.stringify(second), "Missing birth time is not deterministic");
    }),
    runFixture("legacy record", () => {
      const presentation = buildWetonPresentation(legacy);
      requireCondition(presentation.status === "partial", "Legacy partial record should remain safely partial");
      requireCondition(presentation.profileCard.weton === "Sabtu Legi", "Legacy Weton identity was lost");
    }),
    runFixture("calculation failure", () => {
      let failed = false;
      try {
        calculateWeton({ birthDate: "invalid-date" });
      } catch {
        failed = true;
      }
      requireCondition(failed, "Invalid calculation input should fail explicitly");
    }),
    runFixture("presentation failure", () => {
      const presentation = buildWetonPresentation({ weton: "", totalNeptu: 0 });
      requireCondition(presentation.status === "unavailable", "Invalid presentation input should be unavailable");
      requireCondition(!JSON.stringify(presentation).includes("undefined"), "Unsafe undefined text leaked");
    }),
    runFixture("partial data safety", () => {
      const serialized = JSON.stringify(buildWetonPresentation({ ...legacy, wuku: null, pranataMangsa: null }));
      requireCondition(!serialized.includes("null"), "Null leaked into presentation output");
      requireCondition(!serialized.includes("undefined"), "Undefined leaked into presentation output");
      requireCondition(!serialized.includes("\":0"), "Zero leaked as a meaningful presentation value");
      requireCondition(!serialized.includes("\":\"\""), "Empty string leaked as a meaningful presentation value");
    }),
    runFixture("refresh stability", () => {
      requireCondition(
        JSON.stringify(buildWetonPresentation(primary)) === JSON.stringify(buildWetonPresentation(primary)),
        "Presentation changed for identical input",
      );
    }),
    runFixture("concurrent users", () => {
      const outputs = [buildWetonPresentation(primary), buildWetonPresentation(secondary)];
      requireCondition(outputs[0].profileCard.weton !== outputs[1].profileCard.weton, "Concurrent results were conflated");
    }),
    runFixture("cross-user isolation", () => {
      const before = JSON.stringify(buildWetonPresentation(primary));
      buildWetonPresentation(secondary);
      const after = JSON.stringify(buildWetonPresentation(primary));
      requireCondition(before === after, "Another user's presentation changed the first result");
    }),
    runFixture("summary paragraph validation", () => {
      requireCondition(completePresentation.summary.length === 4, "Complete summary must have four paragraphs");
      requireCondition(
        completePresentation.summaryText.split("\n\n").length === completePresentation.summary.length,
        "Summary must contain exactly one blank line between paragraphs",
      );
    }),
    runFixture("summary sentence validation", () => {
      requireCondition(
        completePresentation.summary.every((paragraph) => {
          const count = sentenceCount(paragraph);
          return count >= 3 && count <= 4;
        }),
        "Every summary paragraph must contain three or four sentences",
      );
    }),
    runFixture("summary raw-value validation", () => {
      requireCondition(!/[•\n]-\s/.test(completePresentation.summaryText), "Summary must not contain bullets");
      requireCondition(!/\b(Hari|Pasaran|Weton|Neptu|Wuku|Pranata Mangsa)\b/.test(completePresentation.summaryText), "Summary repeated raw technical terminology");
    }),
    runFixture("main card sentence validation", () => {
      requireCondition(
        completePresentation.sections.every((section) => {
          const count = sentenceCount(section.narrative);
          return count >= 2 && count <= 3;
        }),
        "Every main card must contain two or three sentences",
      );
    }),
    runFixture("duplicate narrative validation", () => {
      const narratives = completePresentation.sections.map((section) => section.narrative);
      requireCondition(new Set(narratives).size === narratives.length, "Duplicate main-card narrative detected");
    }),
  ];

  for (const wetonName of TULANG_WANGI_REGISTRY) {
    const [day, pasaran] = wetonName.split(" ");
    results.push(runFixture(`Tulang Wangi registry: ${wetonName}`, () => {
      const presentation = buildWetonPresentation({
        day: day as WetonPresentationInput["day"],
        pasaran: pasaran as WetonPresentationInput["pasaran"],
        weton: wetonName,
      });
      requireCondition(presentation.tulangWangi?.isIncluded === true, `${wetonName} should match`);
      requireCondition(presentation.tulangWangi.wetonName === wetonName, "Canonical name changed");
    }));
  }

  results.push(
    runFixture("Tulang Wangi non-matching Weton", () => {
      const presentation = buildWetonPresentation({ day: "Jumat", pasaran: "Pon", weton: "Jumat Pon" });
      requireCondition(!presentation.tulangWangi, "Non-matching users must not receive a classification");
    }),
    runFixture("Tulang Wangi casing normalization", () => {
      const presentation = buildWetonPresentation({
        day: "sabtu" as WetonPresentationInput["day"],
        pasaran: "legi" as WetonPresentationInput["pasaran"],
      });
      requireCondition(presentation.tulangWangi?.wetonName === "Sabtu Legi", "Casing was not normalized");
    }),
    runFixture("Tulang Wangi spacing normalization", () => {
      const presentation = buildWetonPresentation({
        day: "  Sabtu  " as WetonPresentationInput["day"],
        pasaran: "  Legi " as WetonPresentationInput["pasaran"],
      });
      requireCondition(presentation.tulangWangi?.wetonName === "Sabtu Legi", "Spacing was not normalized");
    }),
    runFixture("Tulang Wangi rejects Neptu-only match", () => {
      const presentation = buildWetonPresentation({ totalNeptu: 14 });
      requireCondition(!presentation.tulangWangi, "Neptu alone must not classify Tulang Wangi");
    }),
    runFixture("Founder Sabtu Legi", () => {
      const classification = completePresentation.tulangWangi;
      requireCondition(classification?.isIncluded === true, "Founder Weton should match");
      requireCondition(classification.wetonName === "Sabtu Legi", "Founder canonical Weton must remain visible");
      requireCondition(sentenceCount(classification.shortNarrative) === 3, "Founder short narrative must contain three sentences");
      requireCondition(classification.detailParagraphs.length === 2, "Expandable cultural explanation is missing");
    }),
    runFixture("Tulang Wangi cultural context", () => {
      const classification = completePresentation.tulangWangi;
      requireCondition(classification?.sourceType === "CULTURAL_PRESENTATION_CLASSIFICATION", "Incorrect classification source type");
      requireCondition(classification.culturalContext.includes("tradisi budaya Jawa"), "Cultural context is missing");
      requireCondition(classification.detailParagraphs.join(" ").includes("tidak menjadi kepastian ilmiah"), "Scientific uncertainty note is missing");
    }),
    runFixture("Tulang Wangi supernatural claim safety", () => {
      const serialized = JSON.stringify(completePresentation.tulangWangi).toLocaleLowerCase("id-ID");
      requireCondition(!/pasti memiliki|dijamin memiliki|kemampuan gaib yang pasti/.test(serialized), "Supernatural certainty claim detected");
      requireCondition(!/roh akan|kerasukan|wajib tidak keluar|bencana|malapetaka/.test(serialized), "Fear-based warning detected");
    }),
    runFixture("Tulang Wangi deterministic refresh", () => {
      requireCondition(
        JSON.stringify(buildWetonPresentation(primary).tulangWangi) === JSON.stringify(buildWetonPresentation(primary).tulangWangi),
        "Classification changed across refresh",
      );
    }),
    runFixture("Tulang Wangi cross-user isolation", () => {
      const matching = buildWetonPresentation(primary);
      const nonMatching = buildWetonPresentation({ day: "Jumat", pasaran: "Pon" });
      requireCondition(matching.tulangWangi?.isIncluded === true && !nonMatching.tulangWangi, "Classification leaked across users");
    }),
  );

  return results;
}

export function runWetonPageSourceFixtures(pageSource: string): WetonFixtureResult[] {
  return [
    runFixture("Tulang Wangi card placement after identity", () => {
      const hero = pageSource.indexOf("presentation.hero");
      const sections = pageSource.indexOf("presentation.sections.map");
      const identity = pageSource.indexOf('section.id === "identity"');
      const card = pageSource.indexOf("presentation.tulangWangi", identity);
      requireCondition(
        hero >= 0 && sections > hero && identity > sections && card > identity,
        'Card must appear immediately after the "Hari, Pasaran, dan Weton" identity section',
      );
    }),
    runFixture("Tulang Wangi does not replace identity", () => {
      requireCondition(pageSource.includes("presentation.sections.map"), "Normal Weton identity sections were removed");
      requireCondition(pageSource.includes("presentation.canonicalName"), "Canonical Weton name was removed");
    }),
    runFixture("Tulang Wangi expandable context", () => {
      requireCondition(pageSource.includes("<details") && pageSource.includes("presentation.culturalContext"), "Expandable cultural context is not wired");
    }),
    runFixture("Tulang Wangi mobile source safety", () => {
      requireCondition(pageSource.includes("max-w-lg") && pageSource.includes("min-w-0"), "Mobile containment classes are missing");
    }),
    runFixture("Tulang Wangi desktop source safety", () => {
      requireCondition(pageSource.includes("sm:grid-cols-2") && pageSource.includes("max-w-lg"), "Desktop responsive classes are missing");
    }),
  ];
}
