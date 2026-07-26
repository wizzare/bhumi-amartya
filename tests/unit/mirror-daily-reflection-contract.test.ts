/**
 * tests/unit/mirror-daily-reflection-contract.test.ts
 *
 * Contract tests for buildMirrorDailyReflection().
 *
 * Covers:
 *  1. Unavailable synthesis with non-empty error text in dailyConclusion
 *     -> must return unavailable state, NOT wrap error text in greeting/farewell
 *  2. Valid synthesis with valid conclusion
 *     -> must render reflection normally with greeting and farewell
 *  3. Limited synthesis with valid conclusion
 *     -> must render with "limited" state
 *  4. Empty/missing conclusion (synthesis state not "unavailable")
 *     -> must return unavailable state
 *  5. Null guidance -> unavailable state
 *  6. Error param -> error state
 *  7. Loading param -> loading state with empty text
 *  8. No production write in any path (static source check)
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildMirrorDailyReflection } from "../../lib/dailyGuidance/mirrorDailyReflection.js";
import type { DailyGuidance } from "../../lib/dailyGuidance/types.js";

const TIMEZONE = "Asia/Jakarta";
const NOW = new Date("2026-07-27T05:00:00Z");
const USERNAME = "Test User";

const UNAVAILABLE_TEXT =
  "Refleksi Jiwa hari ini belum tersedia karena Kesimpulan Hari Ini belum selesai disusun.";

const SYNTHESIS_UNAVAILABLE_ERROR =
  "Catatan Hari Ini belum bisa disusun karena sumber minimum dari profil dan Arsip Akashi belum tersedia.";

function makeGuidanceBase(): Partial<DailyGuidance> {
  return {
    uid: "test-uid",
    date: "2026-07-27",
    localDateKey: "2026-07-27",
    aiInsight: "test",
    journalPrompt: "test",
    meditationSuggestion: "test",
    dailyPractices: [],
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    profileSnapshot: null,
    blueprintSnapshot: null,
  };
}

let passed = 0;

function test(label: string, condition: boolean, detail?: string) {
  assert.equal(condition, true, detail ? `${label}: ${detail}` : label);
  passed += 1;
  console.log(`PASS: ${label}`);
}

// TEST 1: unavailable synthesis with non-empty error text in dailyConclusion
{
  const guidance = {
    ...makeGuidanceBase(),
    dailySynthesisState: "unavailable" as const,
    dailyConclusion: {
      title: "Kesimpulan Hari Ini" as const,
      text: SYNTHESIS_UNAVAILABLE_ERROR,
      localDateKey: "2026-07-27",
      timezone: TIMEZONE,
      owner: "daily-synthesis" as const,
      sourceVersion: "test",
    },
    soulReflectionText: SYNTHESIS_UNAVAILABLE_ERROR,
  } as DailyGuidance;

  const result = buildMirrorDailyReflection({
    guidance,
    userName: USERNAME,
    now: NOW,
    timezone: TIMEZONE,
  });

  test("unavailable synthesis -> state is unavailable", result.state === "unavailable", `got: ${result.state}`);
  test("unavailable synthesis -> text is controlled unavailable copy", result.text === UNAVAILABLE_TEXT, `got: ${result.text}`);
  test("unavailable synthesis -> error text not wrapped in greeting", !result.text.includes("Halo,"), `text started with greeting: ${result.text.slice(0, 80)}`);
  test("unavailable synthesis -> error text not wrapped in farewell", !result.text.includes("Peluk hangat dari Bhumi"), "farewell present unexpectedly");
  test("unavailable synthesis -> synthesis error message not in output", !result.text.includes(SYNTHESIS_UNAVAILABLE_ERROR), "error message leaked into output");
  test("unavailable synthesis -> dailyConclusionText is null", result.dailyConclusionText === null, `got: ${result.dailyConclusionText}`);
}

// TEST 2: valid synthesis with valid conclusion
{
  const VALID_CONCLUSION = "Hari ini temanya adalah keseimbangan antara gerak dan diam.";

  const guidance = {
    ...makeGuidanceBase(),
    dailySynthesisState: "ready" as const,
    dailyVariationSeed: "seed-abc",
    dailyConclusion: {
      title: "Kesimpulan Hari Ini" as const,
      text: VALID_CONCLUSION,
      localDateKey: "2026-07-27",
      timezone: TIMEZONE,
      owner: "daily-synthesis" as const,
      sourceVersion: "test",
    },
  } as DailyGuidance;

  const result = buildMirrorDailyReflection({
    guidance,
    userName: USERNAME,
    now: NOW,
    timezone: TIMEZONE,
  });

  test("valid synthesis -> state is ready", result.state === "ready", `got: ${result.state}`);
  test("valid synthesis -> text includes conclusion", result.text.includes(VALID_CONCLUSION), `conclusion not found`);
  test("valid synthesis -> text includes greeting", result.text.includes("Halo,"), "greeting missing");
  test("valid synthesis -> text includes farewell", result.text.includes("Peluk hangat dari Bhumi"), "farewell missing");
  test("valid synthesis -> dailyConclusionText equals conclusion", result.dailyConclusionText === VALID_CONCLUSION, `got: ${result.dailyConclusionText}`);
  test("valid synthesis -> localDateKey forwarded", result.localDateKey === "2026-07-27", `got: ${result.localDateKey}`);
}

// TEST 3: limited synthesis with valid conclusion
{
  const VALID_CONCLUSION = "Fokus pada satu hal yang paling bermakna.";

  const guidance = {
    ...makeGuidanceBase(),
    dailySynthesisState: "limited" as const,
    dailyConclusion: {
      title: "Kesimpulan Hari Ini" as const,
      text: VALID_CONCLUSION,
      localDateKey: "2026-07-27",
      timezone: TIMEZONE,
      owner: "daily-synthesis" as const,
      sourceVersion: "test",
    },
  } as DailyGuidance;

  const result = buildMirrorDailyReflection({
    guidance,
    userName: USERNAME,
    now: NOW,
    timezone: TIMEZONE,
  });

  test("limited synthesis -> state is limited", result.state === "limited", `got: ${result.state}`);
  test("limited synthesis -> reflection still renders", result.text.includes(VALID_CONCLUSION), "conclusion not in output");
}

// TEST 4: empty/missing conclusion, synthesis state not "unavailable"
{
  const guidance = {
    ...makeGuidanceBase(),
    dailySynthesisState: "ready" as const,
    // no dailyConclusion
  } as DailyGuidance;

  const result = buildMirrorDailyReflection({
    guidance,
    userName: USERNAME,
    now: NOW,
    timezone: TIMEZONE,
  });

  test("empty conclusion -> state is unavailable", result.state === "unavailable", `got: ${result.state}`);
  test("empty conclusion -> text is controlled unavailable copy", result.text === UNAVAILABLE_TEXT, `got: ${result.text}`);
}

// TEST 5: null guidance
{
  const result = buildMirrorDailyReflection({
    guidance: null,
    userName: USERNAME,
    now: NOW,
    timezone: TIMEZONE,
  });

  test("null guidance -> state is unavailable", result.state === "unavailable", `got: ${result.state}`);
  test("null guidance -> dailyConclusionText is null", result.dailyConclusionText === null);
}

// TEST 6: error param
{
  const result = buildMirrorDailyReflection({
    guidance: null,
    userName: USERNAME,
    now: NOW,
    timezone: TIMEZONE,
    error: "fetch failed",
  });

  test("error param -> state is error", result.state === "error", `got: ${result.state}`);
  test("error param -> text includes muat ulang", result.text.includes("muat ulang"), `got: ${result.text}`);
}

// TEST 7: loading param
{
  const result = buildMirrorDailyReflection({
    guidance: null,
    userName: USERNAME,
    now: NOW,
    timezone: TIMEZONE,
    loading: true,
  });

  test("loading param -> state is loading", result.state === "loading", `got: ${result.state}`);
  test("loading param -> text is empty", result.text === "", `got: ${result.text}`);
}

// TEST 8: no production writes in source (static check)
{
  const src = readFileSync("lib/dailyGuidance/mirrorDailyReflection.ts", "utf8");

  test("no firebase import", !src.includes("firebase") && !src.includes("firestore"), "file imports firebase");
  test("no write calls", !src.includes("setDoc") && !src.includes("addDoc") && !src.includes("updateDoc"), "file contains write call");
}

console.log(`\nmirror-daily-reflection-contract: ${passed} assertions passed`);
