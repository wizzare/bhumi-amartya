import { CANONICAL_SYSTEM_IDS, type ArsipAkashiFactDomain, type ArsipAkashiInput, type ArsipAkashiNormalizedFact } from "../lib/arsipAkashi/types";
import { buildArsipAkashiProfileViewModel } from "../lib/arsipAkashi/profile/viewModel";

type Check = { name: string; pass: boolean; detail: string };

const checks: Check[] = [];
const check = (name: string, pass: boolean, detail = "failed") => checks.push({ name, pass, detail: pass ? "PASS" : detail });

const sectionTitles = [
  "KONDISI UMUM",
  "KARIER & EKONOMI",
  "ASMARA, PERCINTAAN, RELASI SOSIAL & KELUARGA",
  "KESEHATAN FISIK & MENTAL",
  "KONDISI SPIRITUAL",
  "TANTANGAN",
  "SARAN UNTUK MENJALANI SEMESTER",
];

function makeFixture(id: string, fingerprint: string, relationshipSeed: string): ArsipAkashiInput {
  const domains: ArsipAkashiFactDomain[] = ["identity", "mechanics", "talents", "shadow", "relationships", "health", "spirituality", "timing", "location", "karma", "growth", "resources"];
  const input: ArsipAkashiInput = {
    userId: id,
    generatedForDate: "2026-07-18",
    referenceDate: "2026-07-18T08:00:00+07:00",
    timezone: "Asia/Jakarta",
    sourceVersion: "semester-validation-v1",
    blueprintFingerprint: fingerprint,
    birthDataAvailability: { time: "exact", birthplace: true, timezone: true },
    systems: {},
  };
  for (const systemId of CANONICAL_SYSTEM_IDS) {
    input.systems[systemId] = {
      systemId,
      availability: "available",
      sourceOwner: "test",
      normalizedFacts: domains.map((domain, index): ArsipAkashiNormalizedFact => ({
        factId: `${systemId}/${domain}/${relationshipSeed}/${index}`,
        systemId,
        domain,
        label: "main",
        value: index % 4 === 0
          ? `{"skor":3,"peringkat":1,"dominantSigns":["Taurus","Capricorn"]}`
          : index % 4 === 1
            ? `Api, Kayu, 乙 酉 (age 41-50)`
            : `${systemId}-${domain}-${relationshipSeed}`,
        normalizedValue: `${domain}-${relationshipSeed}`,
        confidence: 0.91,
        sourcePath: `lib/${systemId}/validation.ts`,
        sourceVersion: "v1",
        interpretationEligibility: true,
        warnings: [],
      })),
      calculationFingerprint: `${systemId}-fingerprint`,
      calculationVersion: "v1",
      warnings: [],
      generatedAt: "2026-07-18T01:00:00.000Z",
    };
  }
  return input;
}

function flatten(reading: any): string {
  return [
    reading.title,
    reading.shortMeaning,
    reading.narrative,
    reading.deepExplanation,
    reading.practicalReflection,
    ...(reading.detailSections ?? []).flatMap((section: any) => [section.title, section.body]),
  ].filter(Boolean).join("\n");
}

function paragraphs(reading: any): string[] {
  return (reading.detailSections ?? [])
    .flatMap((section: any) => String(section.body).split(/\n\n+/))
    .map((paragraph: string) => paragraph.trim())
    .filter(Boolean);
}

function normalizedParagraphs(reading: any): string[] {
  return paragraphs(reading).map((paragraph) => paragraph.toLowerCase().replace(/\s+/g, " ").trim());
}

function countPattern(text: string, pattern: RegExp): number {
  return (text.match(pattern) ?? []).length;
}

const vmA = buildArsipAkashiProfileViewModel(makeFixture("founder-semester-a", "founder-semester-fp-a", "single"));
const vmB = buildArsipAkashiProfileViewModel(makeFixture("founder-semester-b", "founder-semester-fp-b", "dating"));
const rerunA = buildArsipAkashiProfileViewModel(makeFixture("founder-semester-a", "founder-semester-fp-a", "single"));
const semesters = vmA.readings.filter((reading) => reading.roomTitle === "FASE KEHIDUPAN SAAT INI").sort((a, b) => a.order - b.order);
const rerunSemesters = rerunA.readings.filter((reading) => reading.roomTitle === "FASE KEHIDUPAN SAAT INI").sort((a, b) => a.order - b.order);
const text = semesters.map(flatten).join("\n");
const lower = text.toLowerCase();

check("two semester readings", semesters.length === 2, `Got ${semesters.length}`);
check("canonical semester IDs", semesters.map((reading) => reading.id).join(",") === "current-life-semester-1,current-life-semester-2", semesters.map((reading) => reading.id).join(","));
for (const reading of semesters) {
  check(`${reading.id} has exactly seven sections`, reading.detailSections?.length === 7, `Got ${reading.detailSections?.length}`);
  check(`${reading.id} section titles match`, JSON.stringify(reading.detailSections?.map((section) => section.title)) === JSON.stringify(sectionTitles), "Wrong section titles");
  check(`${reading.id} no Refleksi Praktis`, reading.practicalReflection === "" && !flatten(reading).includes("REFLEKSI PRAKTIS") && !flatten(reading).includes("Refleksi Praktis"), "Refleksi Praktis visible");
  check(`${reading.id} no Penjelasan Mendalam label`, !flatten(reading).includes("PENJELASAN MENDALAM") && !flatten(reading).includes("Penjelasan Mendalam"), "Penjelasan Mendalam visible");
  check(`${reading.id} no paragraph duplicates`, new Set(normalizedParagraphs(reading)).size === normalizedParagraphs(reading).length, "Duplicate paragraph in reading");
}

check("no raw JSON", !/[{]\s*"?\w+"?\s*:/.test(text), "JSON-like object found");
check("no object serialization", !/[{}]/.test(text), "Object brace found");
check("no array serialization", !/\[[^\]]+\]/.test(text), "Array found");
check("no raw score", !/\b(score|skor)\b\s*:?/i.test(text), "Score found");
check("no raw ranking", !/\b(rank|ranking|peringkat)\b\s*:?/i.test(text), "Rank found");
check("no raw source ID", !/\b(systemId|sourceId|sourceVersion)\b\s*:?/i.test(text), "Source ID found");
check("no raw fact ID", !/\bfactId\b\s*:?/i.test(text), "factId found");
check("no raw fingerprint", !/\bfingerprint\b/i.test(text), "fingerprint found");
check("no technical age range", !/\b(age|usia)\s*\d+\s*[-–]\s*\d+\b/i.test(text), "Age range found");
check("no raw BaZi string", !/[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/.test(text), "Chinese stem/branch found");
check("no dominantSigns", !/dominantSigns/i.test(text), "dominantSigns found");
check("no raw element label pair", !/\b(Api|Kayu|Tanah|Logam|Air)\s*,\s*(Api|Kayu|Tanah|Logam|Air)\b/.test(text), "Raw element pair found");
check("no raw astrological sign array", !/\bTaurus\b.*\bCapricorn\b/.test(text), "Raw sign payload found");
check("no ISO visible date", !/\b20\d{2}-\d{2}-\d{2}\b/.test(text), "ISO date found");
check("natural semester periods", text.includes("Januari hingga Juni 2026") && text.includes("Juli hingga Desember 2026"), "Natural periods missing");
check("no repeated universal theme sentence", countPattern(text, /Tema yang paling terasa pada periode ini berkaitan dengan/gi) === 0, "Old repeated theme sentence found");
check("no orphan fragment", !/menata prioritas secara bertahap\.?/i.test(text), "Orphan fragment found");
check("no Build 72 prose", !/The Builder|Manifesting Generator|Arcana 8|6\/3/i.test(text), "Build 72 prose found");
check("health non-clinical", lower.includes("non-klinis") && lower.includes("tidak menggantikan bantuan profesional"), "Non-clinical language missing");
check("career uses Karya direction", /arah karya|pekerjaan|usaha|skill|nilai kontribusi/i.test(text), "Career grounding missing");
check("economy uses money block", /money block/i.test(text), "money block missing");
check("relationship status branch correct", /cabang relasi yang terbaca adalah (single|dating|married\/family)/.test(text), "Relationship branch missing");
check("spiritual differs by semester", flatten(semesters[0]).includes("kembali ke dalam") && flatten(semesters[1]).includes("integrasi"), "Spiritual differentiation missing");
check("advice derives from analysis", lower.includes("dari kondisi umum, karier, relasi, tubuh, spiritualitas, dan tantangan"), "Advice derivation missing");

for (let i = 0; i < sectionTitles.length; i++) {
  const left = semesters[0].detailSections?.[i]?.body ?? "";
  const right = semesters[1].detailSections?.[i]?.body ?? "";
  check(`${sectionTitles[i]} differs across semesters`, left !== right, "Identical section");
  check(`${sectionTitles[i]} materially differs`, left.split(/\s+/).filter((word: string) => right.includes(word)).length < Math.max(left.split(/\s+/).length, right.split(/\s+/).length) * 0.8, "Too similar");
}

const allParagraphs = semesters.flatMap(normalizedParagraphs);
check("no paragraph duplicate across semesters", new Set(allParagraphs).size === allParagraphs.length, "Cross-semester paragraph duplicate");
check("generic template dominance absent", countPattern(text, /\bsemester ini\b/gi) < 28, "Too many generic semester references");
check("section-specific semantic bundles", semesters.every((reading) => {
  const recommendation = reading.recommendations?.[0] as { weeklyGuidanceEligibility?: string[] } | undefined;
  const metadata = recommendation?.weeklyGuidanceEligibility?.find((item: string) => item.includes("KONDISI UMUM:"));
  if (!metadata) return false;
  const pieces = metadata.split(";").map((item: string) => item.split(":").slice(1).join(":"));
  return new Set(pieces).size === sectionTitles.length;
}), "Bundle fingerprints not distinct");
check("deterministic output", JSON.stringify(semesters) === JSON.stringify(rerunSemesters), "Rerun differs");
check("different input changes output", JSON.stringify(semesters.map((reading) => reading.detailSections)) !== JSON.stringify(vmB.readings.filter((reading) => reading.roomTitle === "FASE KEHIDUPAN SAAT INI").map((reading) => reading.detailSections)), "Different inputs identical");

const failed = checks.filter((item) => !item.pass);
console.log("\n=== ARSIP AKASHI SEMESTER NARRATIVE VALIDATION ===");
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"}: ${item.name}${item.pass ? "" : ` - ${item.detail}`}`);
console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
console.log(`${failed.length}/${checks.length} failed`);
if (failed.length > 0) process.exitCode = 1;
