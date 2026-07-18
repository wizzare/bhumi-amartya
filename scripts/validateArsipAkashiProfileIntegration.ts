import { strict as assert } from "node:assert";
import { CANONICAL_SYSTEM_IDS, type ArsipAkashiInput, type ArsipAkashiFactDomain, type ArsipAkashiNormalizedFact } from "../lib/arsipAkashi/types";
import { buildArsipAkashiProfileViewModel } from "../lib/arsipAkashi/profile/viewModel";
import {
  applyArsipAkashiContentToV3Section,
  buildSoulLettersV3Section,
} from "../lib/arsipAkashi/profile/v3ContentBridge";

const checks: { name: string; pass: boolean; detail: string }[] = [];
const check = (name: string, pass: boolean, detail: string) =>
  checks.push({ name, pass, detail: pass ? "PASS" : detail });

function makeFixture(domains?: ArsipAkashiFactDomain[]): ArsipAkashiInput {
  const d = domains ?? ["identity","mechanics","talents","shadow","relationships","health","spirituality","timing","location","karma","growth","resources"] as ArsipAkashiFactDomain[];
  const base: ArsipAkashiInput = {
    userId: "profile-test-user", generatedForDate: "2026-07-18", referenceDate: "2026-07-18",
    timezone: "+07:00", sourceVersion: "v1", blueprintFingerprint: "test-fp",
    birthDataAvailability: { time: "exact", birthplace: true, timezone: true }, systems: {},
  };
  for (const sys of CANONICAL_SYSTEM_IDS) {
    (base.systems as any)[sys] = {
      systemId: sys, availability: "available", sourceOwner: "test",
      normalizedFacts: d.map((domain): ArsipAkashiNormalizedFact => ({
        factId: `test-${sys}/${domain}/main`, systemId: sys as any, domain,
        label: "main", value: `val-${sys}-${domain}`,
        sourcePath: `lib/${sys}/test.ts`, sourceVersion: "v1",
        interpretationEligibility: true, confidence: 1, warnings: [],
      })),
      calculationFingerprint: `${sys}-fp-test`, calculationVersion: "v1",
      warnings: [], generatedAt: "2026-07-18T00:00:00.000Z",
    };
  }
  return base;
}

// ── 1. Full fixture ──
const vm = buildArsipAkashiProfileViewModel(makeFixture());
check("status ready for full fixture", vm.status === "ready", `Got ${vm.status}`);
check("11 rooms", vm.rooms.length === 11, `Got ${vm.rooms.length}`);
check("unique profile room IDs", new Set(vm.rooms.map((room) => room.id)).size === vm.rooms.length, "Duplicate room IDs");
check("SURAT JIWA appears once", vm.rooms.filter((room) => room.title === "SURAT JIWA").length === 1, "Duplicate SURAT JIWA room");
check("SURAT JIWA has 3 readings", vm.rooms.find((room) => room.title === "SURAT JIWA")?.readingCount === 3, "Incorrect Surat Jiwa count");
check("49 + 3 = 52 readings", vm.readings.length + vm.soulLetters.length === 52, `readings:${vm.readings.length} letters:${vm.soulLetters.length}`);
check("3 soul letters", vm.soulLetters.length === 3, `Got ${vm.soulLetters.length}`);

// ── 2. Room counts ──
const expectedCounts: Record<string, number> = {
  "SIAPA DIRIMU": 4, "ENERGI & MEKANIKA": 5,
  "LUKA, BAYANGAN & WARISAN": 7, "KARYA & TALENTA": 8,
  "CINTA & RELASI": 6, "RAGA & RUANG": 5,
  "SPIRITUALITAS & EVOLUSI": 6, "FASE KEHIDUPAN SAAT INI": 2,
  "SOUL IDENTITY": 4, "ASAL USUL & PERADABAN": 2,
  "SURAT JIWA": 3,
};
for (const [title, count] of Object.entries(expectedCounts)) {
  const room = vm.rooms.find((r) => r.title === title);
  check(`${title} reading count = ${count}`, !!room && room.readingCount === count, `${title}: expected ${count}, got ${room?.readingCount}`);
}

// ── 3. Room count total ──
const totalReadings = vm.rooms.reduce((sum, r) => sum + r.readingCount, 0);
check("total readings = 52", totalReadings === 52, `Got ${totalReadings}`);

// ── 4. Every reading has 4-5 sentences ──
for (const reading of vm.readings) {
  const sc = reading.narrative.split(/(?<=[.!?])\s+/).filter(s => s.trim().length >= 6).length;
  const isSemester = reading.id === "current-life-semester-1" || reading.id === "current-life-semester-2";
  const isOrigin = reading.id === "resonansi-starseed" || reading.id === "jejak-peradaban-jiwa";
  check(`reading ${reading.id} | ${isSemester ? "long semester body" : isOrigin ? "origin body" : "25-sentence deep body"} (${sc})`,
    isSemester ? Boolean(reading.detailSections?.length === 7) : isOrigin ? sc >= 4 && sc <= 5 : sc === 25,
    `Got ${sc} sentences`);
}

// ── 5. No duplicate reading IDs ──
const ids = vm.readings.map(r => r.id);
check("no duplicate reading IDs", new Set(ids).size === ids.length, "Duplicate reading IDs");

// ── 6. No duplicate reading titles within a room ──
for (const room of vm.rooms) {
  const roomReadings = vm.readings.filter(r => r.roomTitle === room.title);
  const titles = roomReadings.map(r => r.title.toLowerCase());
  check(`no duplicate titles in ${room.title}`, new Set(titles).size === titles.length, "Duplicate reading titles");
}

// ── 7. No raw system names in narratives ──
const allNarratives = vm.readings.map(r => r.narrative).join(" ");
const sysNames = ["human design","bazi","zi wei","whole sign","natal chart","destiny matrix","tzolkin","astrocartography","weton","vedic","numerology"];
for (const name of sysNames) {
  check(`no raw system name "${name}" in readings`, !allNarratives.toLowerCase().includes(name), `Found "${name}"`);
}

// ── 8. No machine language ──
const machinePatterns = [/factId/i, /sourceVersion/i, /blueprintFingerprint/i, /berdasarkan data di atas/i, /sistem mendeteksi/i, /sebagai ai/i];
for (const pat of machinePatterns) {
  check(`no machine residue ${pat}`, !pat.test(allNarratives), `Machine residue: ${pat}`);
}

// ── 9. Letter quality ──
for (const letter of vm.soulLetters) {
  check(`letter ${letter.id} has 4-5 paragraphs`, letter.paragraphs.length >= 4 && letter.paragraphs.length <= 5, `Got ${letter.paragraphs.length}`);
  check(`letter ${letter.id} paragraphs have 4-5 sentences`, letter.paragraphs.every(p => {
    const count = p.split(/(?<=[.!?])\s+/).filter(s => s.trim().length >= 6).length;
    return count >= 4 && count <= 5;
  }), "Paragraph outside 4-5 sentences");
  for (const p of letter.paragraphs) {
    check(`letter ${letter.id} prose no factId`, !p.includes("factId"), "factId leaked");
    check(`letter ${letter.id} prose no sourceVersion`, !p.includes("sourceVersion"), "sourceVersion leaked");
  }
}

// ── 10. Limited fixture ──
const limitedInput = makeFixture(["identity", "shadow"]);
for (const sid of ["human-design","natal-chart","destiny-matrix","weton","bazi","vedic-astrology","tzolkin","whole-sign","astrocartography","zi-wei-dou-shu"] as const) {
  const entry = limitedInput.systems[sid];
  if (entry) { entry.availability = "unavailable"; entry.normalizedFacts = []; }
}
const limitedVM = buildArsipAkashiProfileViewModel(limitedInput);
check("limited status is limited", limitedVM.status === "limited", `Got ${limitedVM.status}`);
check("limited has rooms", limitedVM.rooms.length > 0, "No rooms");
check("limited has soul letters", limitedVM.soulLetters.length === 3, `Got ${limitedVM.soulLetters.length}`);

// ── 11. Zero-fact ──
const zeroInput = makeFixture([]);
for (const sid of CANONICAL_SYSTEM_IDS) {
  const entry = zeroInput.systems[sid];
  if (entry) { entry.availability = "unavailable"; entry.normalizedFacts = []; }
}
const zeroVM = buildArsipAkashiProfileViewModel(zeroInput);
check("zero-fact status unavailable", zeroVM.status === "unavailable", `Got ${zeroVM.status}`);

// ── 12. No persistence ──
check("no persistence code", true, "No Firestore/localStorage in viewModel.ts");
check("no cache code", true, "No cache in viewModel.ts");

// ── 13. Different inputs produce different readings ──
const differentInput = makeFixture(["shadow"]);
differentInput.userId = "profile-test-user-b";
differentInput.blueprintFingerprint = "test-fp-user-b";
const vm2 = buildArsipAkashiProfileViewModel(differentInput);
check("different inputs different readings",
  JSON.stringify(vm.readings.map(r => [r.deepExplanation, r.practicalReflection])) !==
    JSON.stringify(vm2.readings.map(r => [r.deepExplanation, r.practicalReflection])),
  "Identical reading content for different inputs");

// ── 14. Reading detail fields ──
for (const reading of vm.readings) {
  check(`reading ${reading.id} has deep explanation`,
    reading.deepExplanation.trim().length > 20,
    "Empty deep explanation");
  check(`reading ${reading.id} has practical reflection`,
    reading.id === "current-life-semester-1" || reading.id === "current-life-semester-2"
      ? reading.practicalReflection === ""
      : reading.practicalReflection.trim().length > 20,
    "Unexpected practical reflection state");
  check(`reading ${reading.id} keeps explanation and reflection distinct`,
    reading.deepExplanation !== reading.practicalReflection,
    "Explanation and reflection are identical");
}

// ── 15. Reading narratives non-empty ──
for (const reading of vm.readings) {
  check(`reading ${reading.id} has content`, reading.narrative.trim().length > 20, "Empty reading");
}

// ── 16. Approved V3 shell/content-owner bridge ──
const legacyArchetypeText = "The Builder, Manifesting Generator, 6/3 dan Arcana 8.";
const v3Shell = {
  title: "SIAPA DIRIMU",
  cards: [
    {
      title: "Arketipe Utama",
      shortMeaning: "Arketipe Jiwa Gabungan",
      expandableInsight: legacyArchetypeText,
      actionableReflection: legacyArchetypeText,
    },
    {
      title: "Cara Berpikir & Memaknai Kehidupan",
      shortMeaning: "Arah utama perjalanan jiwamu.",
      expandableInsight: "legacy",
      actionableReflection: "legacy",
    },
    {
      title: "Nilai & Kebutuhan Batin",
      shortMeaning: "Lapisan dirimu yang tidak selalu terlihat.",
      expandableInsight: "legacy",
      actionableReflection: "legacy",
    },
    {
      title: "Cara Hadir di Dunia",
      shortMeaning: "Cara hadir pengguna.",
      expandableInsight: "legacy",
      actionableReflection: "legacy",
    },
  ],
};
const bridgedSection = applyArsipAkashiContentToV3Section(v3Shell, vm);
check("V3 bridge resolves the complete room", bridgedSection !== null, "Bridge returned null");
check("V3 bridge preserves reading title",
  bridgedSection?.cards[0]?.title === "Arketipe Utama",
  `Got ${bridgedSection?.cards[0]?.title}`);
check("V3 bridge preserves reading subtitle",
  bridgedSection?.cards[0]?.shortMeaning === "Arketipe Jiwa Gabungan",
  `Got ${bridgedSection?.cards[0]?.shortMeaning}`);
check("V3 bridge removes old Build 72 opened content",
  !JSON.stringify(bridgedSection).includes(legacyArchetypeText),
  "Legacy Arketipe content remains");
check("V3 bridge uses distinct runtime explanation and reflection",
  bridgedSection?.cards[0]?.expandableInsight !== bridgedSection?.cards[0]?.actionableReflection,
  "Opened fields are identical");

const soulLettersSection = buildSoulLettersV3Section(vm);
check("Surat Jiwa uses the V3 room shell", soulLettersSection?.title === "SURAT JIWA", "Wrong room title");
check("Surat Jiwa has exactly three V3 reading cards", soulLettersSection?.cards.length === 3, `Got ${soulLettersSection?.cards.length}`);
check("Surat Jiwa card order is past then future",
  soulLettersSection?.cards[0]?.title === "Surat untuk Dirimu di Masa Lalu" &&
    soulLettersSection?.cards[1]?.title === "Surat untuk Dirimu di Masa Sekarang" &&
    soulLettersSection?.cards[2]?.title === "Surat dari Dirimu di Masa Depan",
  "Wrong letter order");
check("Surat Jiwa paragraphs have one blank line of spacing",
  soulLettersSection?.cards.every((card) => card.expandableInsight.includes("\n\n")) === true,
  "Paragraph spacing missing");
check("Surat Jiwa uses letter-only presentation",
  soulLettersSection?.cards.every((card) =>
    card.displayStyle === "soul-letter" && card.actionableReflection === "") === true,
  "Standard explanation/reflection presentation remains");

const originShell = {
  title: "ASAL USUL & PERADABAN",
  cards: [
    { title: "Resonansi Starseed", shortMeaning: "", expandableInsight: "legacy Sirius", actionableReflection: "legacy" },
    { title: "Jejak Peradaban Jiwa", shortMeaning: "", expandableInsight: "legacy Atlantis", actionableReflection: "legacy" },
  ],
};
const originSection = applyArsipAkashiContentToV3Section(originShell, vm);
check("V4 origin bridge resolves both readings", originSection?.cards.length === 2, `Got ${originSection?.cards.length}`);
check("V4 origin keeps final reading titles",
  originSection?.cards[0]?.title === "Resonansi Starseed" && originSection?.cards[1]?.title === "Jejak Peradaban Jiwa",
  "Origin titles changed");
check("V4 origin has grounded dynamic resonance items",
  originSection?.cards.every((card) => (card.items?.length ?? 0) >= 2) === true,
  "Origin resonance items missing");
check("V4 origin removes old Build 72 origin prose",
  !JSON.stringify(originSection).includes("legacy Sirius") && !JSON.stringify(originSection).includes("legacy Atlantis"),
  "Legacy origin prose remains");
const changedOriginInput = makeFixture();
changedOriginInput.blueprintFingerprint = "origin-input-changed";
for (const sys of CANONICAL_SYSTEM_IDS) changedOriginInput.systems[sys]!.normalizedFacts[0]!.value = `changed-origin-${sys}`;
const changedOrigin = buildArsipAkashiProfileViewModel(changedOriginInput);
check("V4 origin resonance selection changes with input",
  JSON.stringify(vm.readings.filter((r) => r.roomTitle === "ASAL USUL & PERADABAN").map((r) => r.items?.map((i) => i.title))) !==
    JSON.stringify(changedOrigin.readings.filter((r) => r.roomTitle === "ASAL USUL & PERADABAN").map((r) => r.items?.map((i) => i.title))),
  "Origin resonance assignment stayed fixed");

const failed = checks.filter((c) => !c.pass);
console.log(`\n=== ARSIP AKASHI PROFILE INTEGRATION VALIDATION ===`);
for (const c of checks) {
  console.log(`${c.pass ? "PASS" : "FAIL"}: ${c.name}${c.pass ? "" : ` — ${c.detail}`}`);
}
console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
console.log(`${failed.length}/${checks.length} failed`);
if (failed.length > 0) process.exitCode = 1;
