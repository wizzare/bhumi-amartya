/**
 * Build 106 — DS-J4: R-PRD-18 "Mood trend visualization (progress WITHOUT streaks)"
 * / R-XC-02 "Gentle habit philosophy — no streak pressure" / V5_PRD §4
 * Non-Requirements ("no streak UI, no completion checklist, no badges").
 *
 * Audit outcome (2026-09-02): there is no dedicated MoodTrend component; the mood
 * surface is the Insights page ("Emosi yang paling sering muncul" +
 * body-signal frequencies). The violation was streak-pressure UI on the rendered
 * progress surfaces:
 *   - components/insights/InsightPageClient.tsx : "🔥 Streak Saat Ini" /
 *     "{n} Hari Berturut-turut" section + a streak sentence in the closing message
 *   - components/dashboard/SoulProgress.tsx (unmounted) : "Gamified Healing" +
 *     "Healing Streak {n} hari 🔥"
 *   - components/profile/HealingProgressSummary.tsx (unmounted) : "Healing streak" row
 * All three were de-streaked to plain "days active" / consistency framing.
 *
 * Evidence class: STATIC_GUARD (rendered browser check is DS-J4 / Step 11).
 */
import fs from "node:fs";
import { createRequire } from "node:module";

for (const [key, value] of Object.entries({
  NEXT_PUBLIC_FIREBASE_API_KEY: "synthetic-dsj4-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo-dsj4.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-dsj4",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "demo-dsj4.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456789",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456789:web:dsj4",
  NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "false",
})) {
  process.env[key] ||= value;
}

const loadModule = createRequire(`${process.cwd()}/tests/unit/build106-ds-j4-mood-trend-no-streak.test.ts`);
const { calculateProgressMetrics } = loadModule("../../lib/engines/progressCalculationEngine.ts");
const { createProgressData } = loadModule("../../lib/insights/createInsightProgress.ts");

let passed = 0;
let failed = 0;
function ok(name: string, condition: boolean) {
  if (condition) {
    console.log(`PASS: ${name}`);
    passed += 1;
  } else {
    console.error(`FAIL: ${name}`);
    failed += 1;
  }
}

const MOOD_PROGRESS_SURFACES = [
  "components/insights/InsightPageClient.tsx",
  "components/dashboard/SoulProgress.tsx",
  "components/profile/HealingProgressSummary.tsx",
];

// Streak-pressure signals that must not appear in the rendered progress surfaces.
// (Comments are stripped first so a rule-citing comment does not trip the guard.)
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

for (const file of MOOD_PROGRESS_SURFACES) {
  const src = stripComments(fs.readFileSync(file, "utf8"));
  ok(`${file}: no "streak" language`, !/streak/i.test(src));
  ok(`${file}: no fire/streak emoji`, !src.includes("🔥"));
  ok(`${file}: no "Berturut-turut" consecutive-day counter`, !/berturut-turut/i.test(src));
  ok(`${file}: no "Gamified" framing`, !/gamified/i.test(src));
  ok(`${file}: no badges / leaderboard / points UI`, !/\b(leaderboard|badge|poin\b|points\b|peringkat)\b/i.test(src));
}

// The de-streaked surfaces still show progress, just without a run to keep alive.
const insights = fs.readFileSync("components/insights/InsightPageClient.tsx", "utf8");
ok(
  "insights: still surfaces a mood signal (Emosi yang paling sering muncul)",
  insights.includes("Emosi yang paling sering muncul"),
);
ok(
  "insights: still surfaces a gentle consistency reading",
  /Konsistensi Innerwork/.test(insights) && /consistencyScore/.test(insights),
);
ok(
  "insights: R-PRD-18 / R-XC-02 intent anchored in a comment",
  /R-PRD-18[\s\S]{0,40}R-XC-02|R-XC-02[\s\S]{0,40}R-PRD-18|R-PRD-18.*streak/i.test(insights),
);

const soulProgress = fs.readFileSync("components/dashboard/SoulProgress.tsx", "utf8");
ok("SoulProgress: prop is daysActive, not healingStreak", /daysActive/.test(soulProgress) && !/healingStreak/.test(soulProgress));

const healingSummary = fs.readFileSync("components/profile/HealingProgressSummary.tsx", "utf8");
ok("HealingProgressSummary: prop is daysActive, not healingStreak", /daysActive/.test(healingSummary) && !/healingStreak/.test(healingSummary));

// The longitudinal wellness engine already forbids streak/points/badges in its
// output by its own test — reference it so this contract is not orphaned.
ok(
  "longitudinalWellnessEngine test still forbids streak/points/badges/leaderboard",
  /for \(const forbidden of \[[\s\S]*"streak"[\s\S]*"badges"[\s\S]*"leaderboard"/.test(
    fs.readFileSync("lib/engines/longitudinalWellnessEngine.test.ts", "utf8"),
  ),
);

// --- progressCalculationEngine: score / phase / milestones are NOT streak-driven ---
{
  const day = (iso: string) => ({ dateCreated: `${iso}T09:00:00.000Z`, theme: "test", content: "x" });
  const isoDaysAgo = (n: number) => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };

  // Same 6 active days, all inside the last week, same recency — one is an
  // unbroken run from today, the other has a gap (day 3 missing). Old logic gave
  // the unbroken run a streak bonus; the de-streaked logic must score them equal.
  const consecutive = [0, 1, 2, 3, 4, 5].map((n) => day(isoDaysAgo(n)));
  const gapped = [0, 1, 2, 4, 5, 6].map((n) => day(isoDaysAgo(n)));

  const mC = calculateProgressMetrics({ journalEntries: consecutive, meditationEntries: [], audioHealingEntries: [] });
  const mS = calculateProgressMetrics({ journalEntries: gapped, meditationEntries: [], audioHealingEntries: [] });

  ok(
    "consistencyScore does not reward an unbroken run over the same count with a gap",
    mC.consistencyScore === mS.consistencyScore,
  );
  ok("activeDays30 is exposed and counts distinct active days (not a chain)", mC.activeDays30 === 6 && mS.activeDays30 === 6);
  ok(
    "journeyPhase is the same for consecutive vs spread with equal engagement",
    mC.journeyPhase === mS.journeyPhase,
  );
  ok(
    "milestone copy is '7 Hari Aktif' (active days), never a 'streak'/'Bertumbuh' chain badge",
    (() => {
      const seven = [0, 1, 2, 3, 4, 8, 15].map((n) => day(isoDaysAgo(n)));
      const m = calculateProgressMetrics({ journalEntries: seven, meditationEntries: [], audioHealingEntries: [] });
      const joined = m.milestones.join(" ");
      return joined.includes("7 Hari Aktif") && !/streak/i.test(joined) && !joined.includes("7 Hari Bertumbuh");
    })(),
  );
  ok(
    "engine source: consistencyScore has no streak term; phase gates on activeDays30",
    (() => {
      const src = fs.readFileSync("lib/engines/progressCalculationEngine.ts", "utf8");
      return !/streakScore/.test(src) && /activeDaysScore \* 0\.4/.test(src) && /determineJourneyPhase\(\s*totalEntries,\s*activeDays30/.test(src);
    })(),
  );
}

// --- createInsightProgress: the engine actually rendered by /insights --------
{
  const today = new Date();
  const isoDaysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() - n);
    return d.toISOString().slice(0, 10);
  };
  const entry = (n: number) => ({ date: isoDaysAgo(n), emotionalState: "tenang", theme: "Self Worth" });
  const consecutive = [0, 1, 2, 3, 4, 5].map(entry);
  const gapped = [0, 1, 2, 4, 5, 6].map(entry);
  const c = createProgressData({ journalEntries: consecutive, meditationEntries: [], audioHealingEntries: [], compiledInnerwork: null });
  const g = createProgressData({ journalEntries: gapped, meditationEntries: [], audioHealingEntries: [], compiledInnerwork: null });

  ok("rendered insights engine does not reward consecutive streak", c.consistencyScore === g.consistencyScore);
  ok("rendered insights engine exposes equal activeDays30", c.activeDays30 === 6 && g.activeDays30 === 6);
  ok(
    "rendered insights milestone is 7 Hari Aktif",
    (() => {
      const seven = createProgressData({
        journalEntries: [0, 1, 2, 4, 8, 12, 20].map(entry),
        meditationEntries: [],
        audioHealingEntries: [],
        compiledInnerwork: null,
      });
      const labels = seven.milestones.map((item: { label: string }) => item.label).join(" ");
      return labels.includes("7 Hari Aktif") && !labels.includes("7 Hari Bertumbuh");
    })(),
  );
  ok(
    "rendered insights engine source has no streak score or streak phase gate",
    (() => {
      const src = fs.readFileSync("lib/insights/createInsightProgress.ts", "utf8");
      return !/streakScore/.test(src) && /activeDaysScore/.test(src) && /determineStage\(allEntries\.length, activeDays30/.test(src);
    })(),
  );
}

console.log(
  `\nBUILD106_DS_J4_${failed === 0 ? "PASS" : "FAIL"} assertions=${passed} failed=${failed}`,
);
process.exit(failed === 0 ? 0 : 1);
