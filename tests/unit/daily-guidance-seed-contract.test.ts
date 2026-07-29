/**
 * Daily Guidance seed boundary contract.
 *
 * Run with: npx tsx tests/unit/daily-guidance-seed-contract.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildProfileDailyGuidance } from "../../lib/dailyGuidance/profileDailySynthesis.js";
import { createDailyContentSeed } from "../../lib/dailyGuidance/dailyContentKey.js";
import { getDailyGuidanceStaleReason } from "../../lib/dailyGuidance/version.js";
import type { ArsipAkashiProfileViewModel, ArsipAkashiProfileReading } from "../../lib/arsipAkashi/profile/viewModel.js";
import type { DailyGuidance } from "../../lib/dailyGuidance/types.js";

let passed = 0;
function test(label: string, condition: boolean): void {
  assert.equal(condition, true, label);
  passed += 1;
  console.log(`PASS: ${label}`);
}

const uid = "seed-contract-user";
const localDateKey = "2026-07-29";
const profile = { fullName: "Seed Contract", timezone: "Asia/Jakarta", birthDate: "1994-03-21", birthTime: "14:45" };
const blueprint = {
  humanDesign: { type: "Generator", profile: "1/3" },
  lifePath: { number: 4 },
  destinyMatrix: { center: 7 },
  astrology: { sun: { sign: "Aries" }, ascendant: { sign: "Libra" } },
};
const reading: ArsipAkashiProfileReading = {
  id: "primary-archetype", roomId: "primary-archetype", roomTitle: "SIAPA DIRIMU",
  title: "Identity", shortMeaning: "Kamu bertumbuh melalui langkah yang jujur.",
  narrative: "Narasi", deepExplanation: "Penjelasan", practicalReflection: "Refleksi", order: 1,
};
const arsipViewModel: ArsipAkashiProfileViewModel = {
  status: "ready", rooms: [], readings: [reading], soulLetters: [], synthesisVersion: "test-v1", contentVersion: "test-v1",
};

const synthesis = buildProfileDailyGuidance({ uid, profile, blueprint, arsipViewModel, localDateKey, timezone: "Asia/Jakarta" });
const canonicalSeed = createDailyContentSeed({ uid, localDateKey, blueprint });
const companionReflection = "Panduan ini cukup panjang untuk merepresentasikan refleksi harian yang utuh. ".repeat(6).trim();
const recommendation = { id: "seed-contract", title: "Seed contract", reason: "Test-only validation" };

test("Arsip synthesis has its own seed", typeof synthesis.dailySynthesisSeed === "string" && synthesis.dailySynthesisSeed.length > 0);
test("Arsip synthesis does not write dailyVariationSeed", synthesis.dailyVariationSeed === undefined);
test("Arsip synthesis seed is distinct from canonical Daily Guidance seed", synthesis.dailySynthesisSeed !== canonicalSeed);

const freshGuidance: DailyGuidance = {
  ...synthesis,
  dailyVariationSeed: canonicalSeed,
  profileSnapshot: profile,
  blueprintSnapshot: blueprint,
  astrologyToday: "",
  previousProgressSummary: "",
  aiInsight: "Fresh guidance",
  journalPrompt: "Prompt",
  meditationSuggestion: "Meditation",
  dailyPractices: [],
  companionReflection: { preview: "Refleksi seed canonical", fullReflection: companionReflection },
  innerworkRecommendations: {
    workout: recommendation,
    yoga: recommendation,
    healthyFood: recommendation,
    audioHealing: recommendation,
    journaling: recommendation,
    meditation: recommendation,
    manifestation: recommendation,
  },
  createdAt: "2026-07-29T00:00:00.000Z",
  updatedAt: "2026-07-29T00:00:00.000Z",
  source: "local-fallback",
};

const freshStaleReason = getDailyGuidanceStaleReason(freshGuidance, { uid, localDateKey, blueprint });
test(
  "Fresh guidance with canonical seed is accepted",
  freshStaleReason === null,
);

const reloadGuidance = { ...freshGuidance, dailySynthesisSeed: synthesis.dailySynthesisSeed };
test("Reload preserves canonical dailyVariationSeed", reloadGuidance.dailyVariationSeed === canonicalSeed);
const reloadStaleReason = getDailyGuidanceStaleReason(reloadGuidance, { uid, localDateKey, blueprint });
test(
  "Reloaded guidance remains accepted",
  reloadStaleReason === null,
);

const dashboardSource = readFileSync("components/dashboard/DashboardClient.tsx", "utf8");
test(
  "Dashboard does not overwrite dailyVariationSeed with synthesis seed",
  !dashboardSource.includes("dailyVariationSeed: catatanGuidance.dailyVariationSeed"),
);
const existingReadBlock = dashboardSource.match(/if \(existing && !existingStaleReason\) \{([\s\S]*?)\n      \}/)?.[1] ?? "";
test("Dashboard existing-record read does not write Firestore", !existingReadBlock.includes("saveDailyGuidance"));

console.log(`ALL ${passed} ASSERTIONS PASSED`);
