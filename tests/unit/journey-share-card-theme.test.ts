import {
  extractThemeExplanationCandidates,
  createDailyShareCardContent,
} from "../../lib/profile/dailyShareCardEngine";
import type { DailyGuidance } from "../../lib/dailyGuidance/types";

console.log("▶ Running Journey Share Card Theme Selection Unit Tests\n");

let passed = 0;
let failed = 0;

function test(label: string, condition: boolean, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${label}`);
  } else {
    failed++;
    console.error(`  FAIL: ${label}${detail ? " — " + detail : ""}`);
  }
}

// Mock DailyGuidance fixture
const mockGuidance: DailyGuidance = {
  uid: "user-123",
  date: "2026-07-30",
  astrologyToday: "Sun in Leo",
  previousProgressSummary: "Good",
  aiInsight: "Great day",
  journalPrompt: "Reflect",
  meditationSuggestion: "Breathe",
  dailyPractices: [],
  emotionalFocus: "Calm",
  spiritualFocus: "Grounding",
  groundedAction: "Walk",
  profileSnapshot: null,
  blueprintSnapshot: null,
  companionReflection: {
    preview: "Menemani hari. Tidak semua hal perlu dipaksa hari ini.",
    fullReflection: "## Catatan Hari Ini\nHari ini kamu belajar memberi ruang untuk diri sendiri. #grounding",
  },
  categories: {
    general: {
      insight: "Ada kecenderungan melihat sesuatu lebih jernih setelah diberi jarak sejenak.",
      reason: "Sun transit",
      advice: "Jeda",
    },
    mental: {
      insight: "Pikiranmu beristirahat ketika fokus pada satu tugas.",
      reason: "Mercury",
      advice: "Fokus",
    },
    finance: { insight: "Rezeki tumbuh dari ketenangan.", reason: "Venus", advice: "Hemat" },
    love: { insight: "Kedekatan terasa lebih sehat.", reason: "Moon", advice: "Dengar" },
    relational: { insight: "Batas yang hangat menjaga energi.", reason: "Mars", advice: "Batas" },
    spiritual: { insight: "Keheningan pagi membawa kejernihan.", reason: "Neptune", advice: "Doa" },
    challenges: { insight: "Tekanan hari ini adalah sinyal untuk melambat.", reason: "Saturn", advice: "Jeda" },
    opportunities: { insight: "Peluang baru muncul dari keberanian menguji.", reason: "Jupiter", advice: "Uji" },
    advice: { insight: "Ingat untuk beristirahat.", reason: "General", advice: "Tidur" },
  },
};

// 1. Single explanation section candidate extraction
{
  const candidates = extractThemeExplanationCandidates({
    ...mockGuidance,
    companionReflection: { preview: "Menemani hari. Tidak semua hal perlu dipaksa hari ini.", fullReflection: "" },
    categories: undefined,
  });
  test("Single section produces valid candidates", candidates.length > 0);
  test("Candidate text contains clean sentence", candidates.some((c) => c.text.includes("Menemani hari.")));
}

// 2. Multiple explanation sections
{
  const candidates = extractThemeExplanationCandidates(mockGuidance);
  test("Multiple sections produce candidate list", candidates.length >= 5);
}

// 3. Explanations with Markdown
{
  const candidates = extractThemeExplanationCandidates({
    ...mockGuidance,
    companionReflection: { preview: "", fullReflection: "### **Catatan Hari Ini**\nIni adalah *penjelasan* markdown." },
    categories: undefined,
  });
  test("Markdown formatting stripped from candidates", candidates.every((c) => !c.text.includes("**") && !c.text.includes("###")));
}

// 4. Explanations with headings & headers
{
  const candidates = extractThemeExplanationCandidates({
    ...mockGuidance,
    companionReflection: { preview: "Tema saat ini: Menemani hari.", fullReflection: "" },
    categories: undefined,
  });
  test("Theme prefix label stripped", candidates.some((c) => c.text.startsWith("Menemani hari")));
}

// 5. Empty candidate set
{
  const candidates = extractThemeExplanationCandidates(null);
  test("Null guidance produces empty candidate array", candidates.length === 0);
}

// 6. Duplicate candidate set
{
  const candidates = extractThemeExplanationCandidates({
    ...mockGuidance,
    companionReflection: { preview: "Menemani hari.", fullReflection: "Menemani hari." },
    categories: undefined,
  });
  test("Duplicate phrases deduplicated", candidates.length === 1);
}

// 7. Candidates too long (> 220 chars) filter
{
  const longSentence = "Ini adalah kalimat yang sangat panjang sekali ".repeat(10);
  const candidates = extractThemeExplanationCandidates({
    ...mockGuidance,
    companionReflection: { preview: longSentence, fullReflection: "" },
    categories: undefined,
  });
  test("Candidate longer than 220 chars is excluded", !candidates.some((c) => c.text === longSentence));
}

// 8. Fallback when no candidate exists
{
  const content = createDailyShareCardContent({
    profileSections: [],
    dateKey: "2026-07-30",
    userSeed: "test-user-seed",
    guidance: null,
  });
  test("Fallback summary used when no guidance available", content.soulMessage.summary === "Tidak semua hal perlu dipaksa hari ini.");
  test("Fallback is not undefined or null", content.soulMessage.summary !== undefined && content.soulMessage.summary !== null);
  test("Fallback is not placeholder error", !content.soulMessage.summary.includes("[object Object]") && !content.soulMessage.summary.includes("undefined"));
}

// 9. Stable selection during re-render (same seed produces identical candidate)
{
  const content1 = createDailyShareCardContent({
    profileSections: [],
    dateKey: "2026-07-30",
    userSeed: "user-seed-456",
    guidance: mockGuidance,
  });
  const content2 = createDailyShareCardContent({
    profileSections: [],
    dateKey: "2026-07-30",
    userSeed: "user-seed-456",
    guidance: mockGuidance,
  });
  test("Re-render with same seed produces identical theme summary", content1.soulMessage.summary === content2.soulMessage.summary);
}

// 10. Two separate card generations (different seeds) can produce different candidates
{
  const contentA = createDailyShareCardContent({
    profileSections: [],
    dateKey: "2026-07-30",
    userSeed: "seed-alpha",
    guidance: mockGuidance,
  });
  const contentB = createDailyShareCardContent({
    profileSections: [],
    dateKey: "2026-08-01",
    userSeed: "seed-beta",
    guidance: mockGuidance,
  });
  test("Different seeds produce valid non-empty theme summaries", Boolean(contentA.soulMessage.summary && contentB.soulMessage.summary));
}

// 11. Does NOT select CTA phrases
{
  const candidates = extractThemeExplanationCandidates({
    ...mockGuidance,
    companionReflection: { preview: "Buka halaman premium sekarang.", fullReflection: "" },
    categories: undefined,
  });
  test("Short CTA or non-explanation text excluded", !candidates.some((c) => c.text === "Buka halaman premium sekarang."));
}

// 12. Does NOT select system titles like "Tema 3" or "undefined"
{
  const candidates = extractThemeExplanationCandidates({
    ...mockGuidance,
    companionReflection: { preview: "Tema 3", fullReflection: "undefined" },
    categories: undefined,
  });
  test("Prohibited system titles excluded", candidates.length === 0);
}

// 13. Privacy check: no PII leak in output summary
{
  const content = createDailyShareCardContent({
    profileSections: [],
    dateKey: "2026-07-30",
    userSeed: "secret-user-uid-999",
    guidance: mockGuidance,
  });
  test("Summary contains no UID leak", !content.soulMessage.summary.includes("secret-user-uid-999"));
}

console.log(`\nResults: ${passed + failed} tests, ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
