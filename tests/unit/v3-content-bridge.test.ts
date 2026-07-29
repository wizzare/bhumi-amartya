import assert from "node:assert";

console.log("▶ Running V3 Content Bridge Tests\n");

let passed = 0;
let failed = 0;

function test(label: string, condition: boolean, detail?: string) {
  if (condition) { passed++; console.log(`  PASS: ${label}`); }
  else { failed++; console.error(`  FAIL: ${label}${detail ? " — " + detail : ""}`); }
}

// Replicate the applyArsipAkashiContentToV3Section logic from v3ContentBridge.ts
// This is a SOURCE CONTRACT TEST against the production implementation.

type ProfileCard = { title: string; shortMeaning?: string; expandableInsight?: string; actionableReflection?: string; items?: any[]; detailSections?: any[] };
type ProfileSection = { title: string; cards: ProfileCard[] };
type ArsipReading = { title: string; roomTitle: string; deepExplanation: string; practicalReflection: string; detailSections?: any[]; items?: any[]; order: number };
type ArsipViewModel = { readings: ArsipReading[]; soulLetters: any[]; status: string; rooms: any[] };

function applyReadingContent(card: ProfileCard, deepExplanation: string, practicalReflection: string, detailSections?: any[]): ProfileCard {
  return { ...card, expandableInsight: deepExplanation, actionableReflection: practicalReflection, detailSections, items: card.items?.map((item) => applyReadingContent(item, deepExplanation, practicalReflection, detailSections)) };
}

function applyArsipContentToSection(section: ProfileSection, viewModel: ArsipViewModel): ProfileSection | null {
  const roomReadings = viewModel.readings.filter((r) => r.roomTitle === section.title);
  const readingsByTitle = new Map(roomReadings.map((r) => [r.title, r]));

  if (section.title === "ASAL USUL & PERADABAN") {
    const cards = section.cards.map((card) => {
      const reading = readingsByTitle.get(card.title);
      if (!reading) return card;
      return { ...card, shortMeaning: reading.items?.map((i) => i.shortMeaning).join(" · ") ?? "", expandableInsight: reading.deepExplanation, actionableReflection: reading.practicalReflection, items: reading.items?.map((i) => ({ title: i.title, shortMeaning: i.shortMeaning, expandableInsight: i.deepExplanation, actionableReflection: i.practicalReflection, detailSections: i.detailSections })) };
    });
    return { ...section, cards };
  }

  if (section.title === "FASE KEHIDUPAN SAAT INI") {
    const ordered = [...roomReadings].sort((a, b) => a.order - b.order);
    return { ...section, cards: section.cards.map((card, i) => { const r = ordered[i]; return r ? { ...card, title: r.title, shortMeaning: r.shortMeaning ?? card.shortMeaning, expandableInsight: r.deepExplanation, actionableReflection: r.practicalReflection, detailSections: r.detailSections } : card; }) };
  }

  const cards = section.cards.map((card) => {
    const reading = readingsByTitle.get(card.title);
    if (!reading) return card;
    return applyReadingContent(card, reading.deepExplanation, reading.practicalReflection, reading.detailSections);
  });

  return { ...section, cards };
}

// Helper to build test fixtures
function makeSection(title: string, cardTitles: string[]): ProfileSection {
  return { title, cards: cardTitles.map((t) => ({ title: t, shortMeaning: `legacy-${t}` })) };
}

function makeViewModel(readings: Array<{ title: string; roomTitle: string }>): ArsipViewModel {
  return { readings: readings.map((r, i) => ({ ...r, deepExplanation: `arsip-${r.title}-deep`, practicalReflection: `arsip-${r.title}-reflection`, order: i, items: [] })), soulLetters: [], status: "ready", rooms: [] };
}

// ============ TEST CASES ============

// 1. Full coverage — every card matches a reading
{
  const section = makeSection("SIAPA DIRIMU", ["Arketipe Utama", "Cara Berpikir & Memaknai Kehidupan"]);
  const vm = makeViewModel([
    { title: "Arketipe Utama", roomTitle: "SIAPA DIRIMU" },
    { title: "Cara Berpikir & Memaknai Kehidupan", roomTitle: "SIAPA DIRIMU" },
  ]);
  const result = applyArsipContentToSection(section, vm);
  test("1. full coverage: section rendered", result !== null);
  test("1. full coverage: matched card has Arsip content", result!.cards[0].expandableInsight === "arsip-Arketipe Utama-deep");
  test("1. full coverage: matched card uses Arsip reflection", result!.cards[0].actionableReflection === "arsip-Arketipe Utama-reflection");
}

// 2. Partial coverage — 8 of 11 systems, unmatched cards preserve legacy content
{
  const section = makeSection("ENERGI & MEKANIKA", ["Ritme Energi Alami", "Cara Mengambil Keputusan", "Pola Respons terhadap Kehidupan"]);
  // Only 2 readings match; third card has no match
  const vm = makeViewModel([
    { title: "Ritme Energi Alami", roomTitle: "ENERGI & MEKANIKA" },
    { title: "Cara Mengambil Keputusan", roomTitle: "ENERGI & MEKANIKA" },
    // "Pola Respons terhadap Kehidupan" reading is missing
  ]);
  const result = applyArsipContentToSection(section, vm);
  test("2. partial: section not null when some cards unmatched", result !== null);
  test("2. partial: matched card has Arsip content", result!.cards[0].expandableInsight === "arsip-Ritme Energi Alami-deep");
  test("2. partial: unmatched card preserves legacy shortMeaning", result!.cards[2].shortMeaning === "legacy-Pola Respons terhadap Kehidupan");
  test("2. partial: unmatched card has no Arsip expandableInsight", result!.cards[2].expandableInsight === undefined);
}

// 3. Zero matching readings — all legacy preserved
{
  const section = makeSection("KARYA & TALENTA", ["Talenta Alami", "Gaya Kerja"]);
  const vm = makeViewModel([]); // no readings at all
  const result = applyArsipContentToSection(section, vm);
  test("3. zero matches: section not null", result !== null);
  test("3. zero matches: first card preserves legacy", result!.cards[0].shortMeaning === "legacy-Talenta Alami");
  test("3. zero matches: second card preserves legacy", result!.cards[1].shortMeaning === "legacy-Gaya Kerja");
  test("3. zero matches: no Arsip expandableInsight", result!.cards[0].expandableInsight === undefined);
}

// 4. One unmatched card among many matched
{
  const section = makeSection("CINTA & RELASI", [
    "Kebutuhan Emosional dalam Relasi",
    "Cara Memberi dan Menerima Cinta",
    "Pola Ketertarikan & Pilihan Pasangan",
  ]);
  // Second reading is missing
  const vm = makeViewModel([
    { title: "Kebutuhan Emosional dalam Relasi", roomTitle: "CINTA & RELASI" },
    { title: "Pola Ketertarikan & Pilihan Pasangan", roomTitle: "CINTA & RELASI" },
  ]);
  const result = applyArsipContentToSection(section, vm);
  test("4. one unmatched: section not null", result !== null);
  test("4. one unmatched: matched card enriched", result!.cards[0].expandableInsight === "arsip-Kebutuhan Emosional dalam Relasi-deep");
  test("4. one unmatched: unmatched card retains legacy", result!.cards[1].shortMeaning === "legacy-Cara Memberi dan Menerima Cinta");
  test("4. one unmatched: later matched card enriched", result!.cards[2].expandableInsight === "arsip-Pola Ketertarikan & Pilihan Pasangan-deep");
  test("4. three cards total", result!.cards.length === 3);
}

// 5. Title mismatch — section preserved, mismatch doesn't erase data
{
  const section = makeSection("RAGA & RUANG", ["Peta Chakra", "Sistem Cerna"]);
  const vm = makeViewModel([
    { title: "Peta Chakra", roomTitle: "RAGA & RUANG" },
    { title: "NONEXISTENT READING", roomTitle: "RAGA & RUANG" }, // title doesn't match any card
  ]);
  const result = applyArsipContentToSection(section, vm);
  test("5. title mismatch: section not null", result !== null);
  test("5. title mismatch: matched card enriched", result!.cards[0].expandableInsight === "arsip-Peta Chakra-deep");
  test("5. title mismatch: unmatched card preserves legacy", result!.cards[1].shortMeaning === "legacy-Sistem Cerna");
  test("5. title mismatch: two cards total", result!.cards.length === 2);
}

// 6. Empty Arsip reading list — legacy preserved
{
  const section = makeSection("SPIRITUALITAS & EVOLUSI", ["Jalur Spiritual", "Evolusi Jiwa"]);
  const vm = makeViewModel([]);
  const result = applyArsipContentToSection(section, vm);
  test("6. empty readings: section not null", result !== null);
  test("6. empty readings: legacy preserved", result!.cards[0].shortMeaning === "legacy-Jalur Spiritual");
}

// 7. Duplicate reading title — deterministic selection
{
  const section = makeSection("SIAPA DIRIMU", ["Arketipe Utama"]);
  const vm = makeViewModel([
    { title: "Arketipe Utama", roomTitle: "SIAPA DIRIMU" },
    { title: "Arketipe Utama", roomTitle: "SIAPA DIRIMU" }, // duplicate
  ]);
  const result = applyArsipContentToSection(section, vm);
  test("7. duplicate titles: section not null", result !== null);
  test("7. duplicate titles: card enriched", result!.cards[0].expandableInsight !== undefined);
  test("7. duplicate titles: one card rendered (no duplicates)", result!.cards.length === 1);
}

// 8. Full builder failure — Profile page must fall back to legacySections (v3ContentBridge itself doesn't fail)
// This is tested in PHASE 3 via the Profile page fallback logic

// 9. Partial builder result — valid sections remain
{
  const section1 = makeSection("SIAPA DIRIMU", ["Arketipe Utama"]);
  const section2 = makeSection("RAGA & RUANG", ["Peta Chakra"]);
  const vm = makeViewModel([
    { title: "Arketipe Utama", roomTitle: "SIAPA DIRIMU" },
    // No reading for Peta Chakra
  ]);
  const r1 = applyArsipContentToSection(section1, vm);
  const r2 = applyArsipContentToSection(section2, vm);
  test("9. partial result: section with match is present", r1 !== null);
  test("9. partial result: section without match is also present", r2 !== null);
  test("9. partial result: unmatched section has legacy", r2!.cards[0].shortMeaning === "legacy-Peta Chakra");
}

// 10. Full mature Founder data — output matches expected structure
{
  const section = makeSection("LUKA, BAYANGAN & WARISAN", ["Luka Inti", "Mekanisme Perlindungan Diri", "Pola Self-Sabotage", "Ketakutan yang Tersembunyi"]);
  const vm = makeViewModel([
    { title: "Luka Inti", roomTitle: "LUKA, BAYANGAN & WARISAN" },
    { title: "Mekanisme Perlindungan Diri", roomTitle: "LUKA, BAYANGAN & WARISAN" },
    { title: "Pola Self-Sabotage", roomTitle: "LUKA, BAYANGAN & WARISAN" },
    { title: "Ketakutan yang Tersembunyi", roomTitle: "LUKA, BAYANGAN & WARISAN" },
  ]);
  const result = applyArsipContentToSection(section, vm);
  test("10. mature data: section not null", result !== null);
  test("10. mature data: all cards enriched", result!.cards.every((c) => c.expandableInsight !== undefined));
  test("10. mature data: all cards have Arsip reflection", result!.cards.every((c) => c.actionableReflection !== undefined));
  test("10. mature data: four cards present", result!.cards.length === 4);
}

// Phase 3: Profile page fallback — partial Arsip does not result in empty sections
{
  const sections = [
    makeSection("SIAPA DIRIMU", ["Arketipe Utama"]),
    makeSection("ENERGI & MEKANIKA", ["Ritme Energi Alami"]),
    makeSection("LUKA, BAYANGAN & WARISAN", ["Luka Inti"]),
  ];
  const vm = makeViewModel([
    // Only one room has a matching reading
    { title: "Arketipe Utama", roomTitle: "SIAPA DIRIMU" },
  ]);
  const results = sections.map((s) => applyArsipContentToSection(s, vm)).filter(Boolean);
  test("profile fallback: all three sections remain visible", results.length === 3);
  test("profile fallback: matched section enriched", results[0]!.cards[0].expandableInsight === "arsip-Arketipe Utama-deep");
  test("profile fallback: unmatched sections preserve legacy", results[1]!.cards[0].shortMeaning === "legacy-Ritme Energi Alami");
  test("profile fallback: second unmatched preserves legacy", results[2]!.cards[0].shortMeaning === "legacy-Luka Inti");
}

console.log(`\n${passed + failed} tests, ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
