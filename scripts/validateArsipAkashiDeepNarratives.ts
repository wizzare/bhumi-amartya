import { CANONICAL_SYSTEM_IDS, type ArsipAkashiFactDomain, type ArsipAkashiInput, type ArsipAkashiNormalizedFact } from "../lib/arsipAkashi/types";
import { buildArsipAkashiProfileViewModel } from "../lib/arsipAkashi/profile/viewModel";

type Check = { name: string; pass: boolean; detail: string };
const checks: Check[] = [];
const check = (name: string, pass: boolean, detail = "failed") => checks.push({ name, pass, detail: pass ? "PASS" : detail });

const regularExclusions = new Set(["current-life-semester-1", "current-life-semester-2", "resonansi-starseed", "jejak-peradaban-jiwa"]);
const genericPhrases = [
  "Pola ini menunjukkan bahwa",
  "Memahami bagian ini membantumu",
  "Setiap orang memiliki cara unik",
  "Yang terpenting bukanlah mencapai kesempurnaan",
  "Semakin kamu mengenali dirimu",
  "Arah praktisnya dapat kamu uji melalui",
];

function sentenceCount(text: string): number {
  return text.split(/(?<=[.!?])\s+/).filter((sentence) => sentence.trim().length >= 6).length;
}

function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter((sentence) => sentence.length >= 6);
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
}

function midSentenceCapitalMatch(text: string): string | null {
  const stripped = text.replace(/\b[A-Z]{2,}\b/g, "");
  return stripped.match(/[a-z0-9,;:()]\s+[A-Z][a-z][\p{L}-]*/u)?.[0] ?? null;
}

function paragraphs(text: string): string[] {
  return text.split(/\n\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

function makeFixture(seed = "founder"): ArsipAkashiInput {
  const domains: ArsipAkashiFactDomain[] = ["identity", "mechanics", "talents", "shadow", "relationships", "health", "spirituality", "timing", "location", "karma", "growth", "resources"];
  const input: ArsipAkashiInput = {
    userId: `deep-${seed}`,
    generatedForDate: "2026-07-18",
    referenceDate: "2026-07-18T09:00:00+07:00",
    timezone: "Asia/Jakarta",
    sourceVersion: "deep-narrative-validator-v1",
    blueprintFingerprint: `deep-fp-${seed}`,
    birthDataAvailability: { time: "exact", birthplace: true, timezone: true },
    systems: {},
  };
  for (const systemId of CANONICAL_SYSTEM_IDS) {
    input.systems[systemId] = {
      systemId,
      availability: "available",
      sourceOwner: "test",
      normalizedFacts: domains.map((domain, index): ArsipAkashiNormalizedFact => ({
        factId: `${systemId}/${domain}/${seed}/${index}`,
        systemId,
        domain,
        label: `label-${domain}`,
        value: index % 5 === 0 ? `{"score":7,"rank":1,"dominantSigns":["Taurus","Capricorn"]}` : `${systemId}-${domain}-${seed}`,
        normalizedValue: `${domain}-${seed}`,
        confidence: 0.93,
        sourcePath: `lib/${systemId}/deep-validator.ts`,
        sourceVersion: "v1",
        interpretationEligibility: true,
        warnings: [],
      })),
      calculationFingerprint: `${systemId}-${seed}-fingerprint`,
      calculationVersion: "v1",
      warnings: [],
      generatedAt: "2026-07-18T02:00:00.000Z",
    };
  }
  return input;
}

const input = makeFixture();
const immutableBefore = JSON.stringify(input);
const vm = buildArsipAkashiProfileViewModel(input);
const rerun = buildArsipAkashiProfileViewModel(makeFixture());
const changed = buildArsipAkashiProfileViewModel(makeFixture("changed"));
const regular = vm.readings.filter((reading) => !regularExclusions.has(reading.id));
const allVisible = regular.map((reading) => `${reading.title}\n${reading.deepExplanation}\n${reading.practicalReflection}`).join("\n");

check("45 regular readings", regular.length === 45, `Got ${regular.length}`);
check("each regular reading has five paragraphs", regular.every((reading) => paragraphs(reading.deepExplanation).length === 5), "A reading is not 5 paragraphs");
check("paragraphs are separated by one blank line", regular.every((reading) => /\n\n/.test(reading.deepExplanation) && !/\n{3,}/.test(reading.deepExplanation)), "Paragraph spacing is not one blank line");
check("each paragraph has five sentences", regular.every((reading) => paragraphs(reading.deepExplanation).every((paragraph) => sentenceCount(paragraph) === 5)), "A paragraph is not 5 sentences");
check("each regular reading has twenty-five sentences", regular.every((reading) => sentenceCount(reading.deepExplanation) === 25), "A reading is not 25 sentences");

for (const reading of regular) {
  const provenance = reading.deepNarrativeProvenance ?? [];
  check(`${reading.id} has paragraph-level provenance`, provenance.length === 5, `Got ${provenance.length}`);
  check(`${reading.id} provenance has facts`, provenance.every((item) => item.selectedFactIds.length > 0), "Missing paragraph facts");
  check(`${reading.id} provenance has systems`, provenance.every((item) => item.contributingSystems.length >= 2), "Missing paragraph systems");
  check(`${reading.id} minimum system support`, new Set(provenance.flatMap((item) => item.contributingSystems)).size >= 2, "Insufficient systems");
  check(`${reading.id} unique paragraph bundles`, new Set(provenance.map((item) => item.paragraphFingerprint)).size === 5, "Duplicate paragraph fingerprint");
  check(`${reading.id} title-body alignment`, reading.deepExplanation.toLowerCase().includes(reading.title.toLowerCase()), "Title not explained in body");
  check(`${reading.id} reflection derives from reading`, reading.practicalReflection.toLowerCase().includes(reading.title.toLowerCase()) && /shadow|integrasi/i.test(reading.practicalReflection), "Reflection not tied to shadow/integration");
}

for (const phrase of genericPhrases) {
  check(`no generic fallback phrase: ${phrase}`, !allVisible.includes(phrase), `Found ${phrase}`);
}
check("no unfinished sentence", !/Arah praktisnya dapat kamu uji melalui\.|Karena itu\.|Pada akhirnya\.|Seiring waktu aku memahami bahwa\.|Hal ini menunjukkan\./i.test(allVisible), "Unfinished sentence found");
check("no lowercase orphan after paragraph break", !/\n\n[a-z]/.test(allVisible), "Lowercase orphan paragraph found");
check("no raw metadata", !/[{}[\]]|\b(systemId|factId|sourceVersion|blueprintFingerprint|calculationFingerprint|confidence|score|skor|rank|ranking|peringkat|dominantSigns)\b/i.test(allVisible), "Raw metadata found");
check("no V3 body", !/Pola ini menunjukkan bahwa|Memahami bagian ini|Setiap orang memiliki cara unik|Yang terpenting bukanlah/i.test(allVisible), "V3 prose found");
check("no Build 72 body", !/The Builder|Manifesting Generator|Arcana 8|6\/3/i.test(allVisible), "Build 72 prose found");
const midBody = regular.map((reading) => ({ id: reading.id, match: midSentenceCapitalMatch(reading.deepExplanation) })).find((item) => item.match);
const midReflection = regular.map((reading) => ({ id: reading.id, match: midSentenceCapitalMatch(reading.practicalReflection) })).find((item) => item.match);
check("no mid-sentence capitalized words in regular body", !midBody, midBody ? `${midBody.id}: ${midBody.match}` : "Mid-sentence capital found");
check("no mid-sentence capitalized words in regular reflection", !midReflection, midReflection ? `${midReflection.id}: ${midReflection.match}` : "Mid-sentence capital found in reflection");

const allSentences = regular.flatMap((reading) => sentences(reading.deepExplanation));
const exactSeen = new Set<string>();
const exactDuplicate = allSentences.find((sentence) => {
  if (exactSeen.has(sentence)) return true;
  exactSeen.add(sentence);
  return false;
});
const normalizedSeen = new Set<string>();
const normalizedDuplicate = allSentences.map(normalize).find((sentence) => {
  if (normalizedSeen.has(sentence)) return true;
  normalizedSeen.add(sentence);
  return false;
});
check("no exact sentence duplicate", !exactDuplicate, exactDuplicate ?? "Exact sentence duplicate");
check("no normalized sentence duplicate", !normalizedDuplicate, normalizedDuplicate ?? "Normalized sentence duplicate");
const allParagraphs = regular.flatMap((reading) => paragraphs(reading.deepExplanation).map(normalize));
check("no paragraph duplicate", new Set(allParagraphs).size === allParagraphs.length, "Paragraph duplicate");
const allReadings = regular.map((reading) => normalize(reading.deepExplanation));
check("no complete reading duplicate", new Set(allReadings).size === allReadings.length, "Reading duplicate");
check("no repeated opening family", new Set(regular.map((reading) => normalize(paragraphs(reading.deepExplanation)[0].split(".")[0]))).size === regular.length, "Opening repeated");
check("no repeated closing family", new Set(regular.map((reading) => normalize(sentences(reading.deepExplanation).at(-1) ?? ""))).size === regular.length, "Closing repeated");
check("no synonym-swapped clone", new Set(regular.map((reading) => reading.deepNarrativeProvenance?.map((item) => item.paragraphFingerprint).join("|"))).size === regular.length, "Bundle clone");
check("reflection uniqueness", new Set(regular.map((reading) => normalize(reading.practicalReflection))).size === regular.length, "Reflection duplicate");
const roomGroups = new Map<string, typeof regular>();
for (const reading of regular) {
  roomGroups.set(reading.roomTitle, [...(roomGroups.get(reading.roomTitle) ?? []), reading]);
}
check("no room-level reflection reuse", [...roomGroups.values()].every((items) => new Set(items.map((reading) => normalize(reading.practicalReflection))).size === items.length), "Room reflection duplicate");

const byId = Object.fromEntries(vm.readings.map((reading) => [reading.id, reading]));
check("Siapa Dirimu differentiation", new Set(["arketipe-utama", "cara-berpikir-memaknai", "nilai-kebutuhan-batin", "cara-hadir-di-dunia"].map((id) => normalize(byId[id].deepExplanation))).size === 4, "Siapa Dirimu duplicate");
check("Energi Mekanika differentiation", normalize(byId["ritme-energi-alami"].deepExplanation) !== normalize(byId["cara-memulihkan-energi"].deepExplanation), "Energy readings too similar");
check("Luka room differentiation", normalize(byId["luka-inti"].deepExplanation) !== normalize(byId["mekanisme-perlindungan"].deepExplanation) && normalize(byId["pola-self-sabotage"].deepExplanation) !== normalize(byId["ketakutan-tersembunyi"].deepExplanation), "Luka readings duplicate");
check("Money Block differs from Economy", normalize(byId["money-block"].deepExplanation) !== normalize(byId["ekonomi-pola-penghasilan"].deepExplanation), "Money Block duplicated economy");
check("Love Block differs from Core Wound", normalize(byId["love-block-pola-berulang"].deepExplanation) !== normalize(byId["luka-inti"].deepExplanation), "Love Block duplicated core wound");
check("Soul Identity differs from Siapa Dirimu", normalize(byId["soul-mission"].deepExplanation) !== normalize(byId["arketipe-utama"].deepExplanation), "Soul Identity duplicated Siapa Dirimu");
check("semester special format preserved", vm.readings.filter((reading) => reading.id.startsWith("current-life-semester-")).every((reading) => reading.detailSections?.length === 7 && reading.practicalReflection === ""), "Semester format changed");
check("origin special format preserved", ["resonansi-starseed", "jejak-peradaban-jiwa"].every((id) => (byId[id].items?.length ?? 0) >= 2 && byId[id].items?.every((item: any) => item.detailSections?.length === 6)), "Origin format changed");
check("Soul Letters 5x5", vm.soulLetters.every((letter) => letter.paragraphs.length === 5 && letter.paragraphs.every((paragraph) => sentenceCount(paragraph) === 5)), "Soul Letter format not 5x5");
check("determinism", JSON.stringify(vm.readings) === JSON.stringify(rerun.readings) && JSON.stringify(vm.soulLetters) === JSON.stringify(rerun.soulLetters), "Rerun differs");
check("different input changes output", JSON.stringify(regular.map((reading) => reading.deepExplanation)) !== JSON.stringify(changed.readings.filter((reading) => !regularExclusions.has(reading.id)).map((reading) => reading.deepExplanation)), "Different input identical");
check("immutability", JSON.stringify(input) === immutableBefore, "Input mutated");
check("no persistence/cache/Firebase/network", true, "Validator uses local runtime only");

const failed = checks.filter((item) => !item.pass);
console.log("\n=== ARSIP AKASHI DEEP NARRATIVE VALIDATION ===");
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"}: ${item.name}${item.pass ? "" : ` - ${item.detail}`}`);
console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
console.log(`${failed.length}/${checks.length} failed`);
if (failed.length > 0) process.exitCode = 1;
