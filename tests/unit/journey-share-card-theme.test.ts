import {
  extractThemeExplanationCandidates,
  createDailyShareCardContent,
} from "../../lib/profile/dailyShareCardEngine";
import type { DailyGuidance } from "../../lib/dailyGuidance/types";

console.log("▶ Running Journey Share Card Theme & Persistence Unit Tests\n");

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
    preview: "COMPANION PREVIEW FALLBACK TEXT ONLY.",
    fullReflection: "PRIMARY FULL REFLECTION: Hari ini kamu belajar memberi ruang untuk diri sendiri.",
  },
  dailyNarrativeParagraphs: [
    "PRIMARY NARRATIVE: Ada kecenderungan melihat sesuatu lebih jernih setelah diberi jarak sejenak.",
  ],
  categories: {
    general: {
      insight: "PRIMARY GENERAL INSIGHT: Pikiranmu beristirahat ketika fokus pada satu tugas.",
      reason: "Sun transit",
      advice: "Jeda",
    },
    mental: { insight: "PRIMARY MENTAL INSIGHT: Rezeki tumbuh dari ketenangan.", reason: "Mercury", advice: "Fokus" },
    finance: { insight: "PRIMARY FINANCE INSIGHT: Kedekatan terasa lebih sehat.", reason: "Venus", advice: "Hemat" },
    love: { insight: "PRIMARY LOVE INSIGHT: Batas yang hangat menjaga energi.", reason: "Moon", advice: "Dengar" },
    relational: { insight: "PRIMARY RELATIONAL INSIGHT: Keheningan pagi membawa kejernihan.", reason: "Mars", advice: "Batas" },
    spiritual: { insight: "PRIMARY SPIRITUAL INSIGHT: Tekanan hari ini adalah sinyal untuk melambat.", reason: "Neptune", advice: "Doa" },
    challenges: { insight: "PRIMARY CHALLENGES INSIGHT: Peluang baru muncul dari keberanian menguji.", reason: "Saturn", advice: "Jeda" },
    opportunities: { insight: "PRIMARY OPPORTUNITIES INSIGHT: Ingat untuk beristirahat.", reason: "Jupiter", advice: "Uji" },
    advice: { insight: "PRIMARY ADVICE INSIGHT: Tidur teratur menjaga stamina.", reason: "General", advice: "Tidur" },
  },
  soulReflectionText: "SECONDARY SOUL REFLECTION FALLBACK TEXT ONLY.",
  dailyNoteText: "SECONDARY DAILY NOTE FALLBACK TEXT ONLY.",
  dailyConclusion: {
    title: "Kesimpulan Hari Ini",
    text: "SECONDARY DAILY CONCLUSION FALLBACK TEXT ONLY.",
    localDateKey: "2026-07-30",
    timezone: "Asia/Jakarta",
    owner: "daily-synthesis",
    sourceVersion: "1.0",
  },
};

// 1. Primary Source Prioritization Test
{
  const { primary, secondary } = extractThemeExplanationCandidates(mockGuidance);
  test("Primary candidates array is non-empty", primary.length > 0);
  test("Secondary candidates array is non-empty", secondary.length > 0);

  const content = createDailyShareCardContent({
    profileSections: [],
    dateKey: "2026-07-30",
    userSeed: "user-seed-789",
    guidance: mockGuidance,
  });

  const isSelectedFromPrimary = primary.some((p) => p.text === content.soulMessage.summary);
  const isSelectedFromSecondary = secondary.some((s) => s.text === content.soulMessage.summary);

  test("Theme summary is strictly chosen from PRIMARY candidates when available", isSelectedFromPrimary && !isSelectedFromSecondary);
}

// 2. Secondary Fallback Source Test (when primary is empty)
{
  const secondaryOnlyGuidance: DailyGuidance = {
    ...mockGuidance,
    companionReflection: { preview: "FALLBACK PREVIEW TEXT ONLY FOR CARD.", fullReflection: "" },
    dailyNarrativeParagraphs: [],
    categories: undefined,
  };

  const { primary, secondary } = extractThemeExplanationCandidates(secondaryOnlyGuidance);
  test("Primary is empty for fallback fixture", primary.length === 0);
  test("Secondary is non-empty for fallback fixture", secondary.length > 0);

  const content = createDailyShareCardContent({
    profileSections: [],
    dateKey: "2026-07-30",
    userSeed: "user-seed-789",
    guidance: secondaryOnlyGuidance,
  });

  test("Secondary fallback candidate chosen when primary is empty", secondary.some((s) => s.text === content.soulMessage.summary));
}

// 3. Re-render Card Persistence (same cardInstanceSeed produces identical theme)
{
  const cardSeed = "instance-seed-alpha-123";
  const render1 = createDailyShareCardContent({
    profileSections: [],
    dateKey: "2026-07-30",
    userSeed: "user-seed-789",
    guidance: mockGuidance,
    cardInstanceSeed: cardSeed,
  });
  const render2 = createDailyShareCardContent({
    profileSections: [],
    dateKey: "2026-07-30",
    userSeed: "user-seed-789",
    guidance: mockGuidance,
    cardInstanceSeed: cardSeed,
  });

  test("Re-render with same cardInstanceSeed produces identical preview theme summary", render1.soulMessage.summary === render2.soulMessage.summary);
}

// 4. Preview and Export share exact same selectedTheme
{
  const cardSeed = "instance-seed-export-verify";
  const previewState = createDailyShareCardContent({
    profileSections: [],
    dateKey: "2026-07-30",
    userSeed: "user-seed-789",
    guidance: mockGuidance,
    cardInstanceSeed: cardSeed,
  });

  // Export operation simulates reading locked card state
  const exportState = createDailyShareCardContent({
    profileSections: [],
    dateKey: "2026-07-30",
    userSeed: "user-seed-789",
    guidance: mockGuidance,
    cardInstanceSeed: cardSeed,
  });

  test("Preview state and Export PNG state use identical selectedTheme text", previewState.soulMessage.summary === exportState.soulMessage.summary);
}

// 5. Two different cardInstanceSeed values can select different candidates
{
  const seedA = "instance-seed-A-111";
  const seedB = "instance-seed-B-999";

  const cardA = createDailyShareCardContent({
    profileSections: [],
    dateKey: "2026-07-30",
    userSeed: "user-seed-789",
    guidance: mockGuidance,
    cardInstanceSeed: seedA,
  });
  const cardB = createDailyShareCardContent({
    profileSections: [],
    dateKey: "2026-07-30",
    userSeed: "user-seed-789",
    guidance: mockGuidance,
    cardInstanceSeed: seedB,
  });

  test("Card A and Card B produce valid non-empty theme summaries", Boolean(cardA.soulMessage.summary && cardB.soulMessage.summary));
}

// 6. Ultimate Fallback (when no candidates exist at all)
{
  const emptyContent = createDailyShareCardContent({
    profileSections: [],
    dateKey: "2026-07-30",
    userSeed: "test-user-seed",
    guidance: null,
  });
  test("Ultimate fallback theme used when guidance is null", emptyContent.soulMessage.summary === "Tidak semua hal perlu dipaksa hari ini.");
}

console.log(`\nResults: ${passed + failed} tests, ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
