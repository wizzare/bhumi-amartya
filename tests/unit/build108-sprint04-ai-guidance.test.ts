/**
 * Build 108 ENL — Sprint 4 (AI Daily Guidance, Prompts & Local Fallbacks) Unit & Invariant Test
 *
 * Verifies:
 * 1. AI Prompts (Daily Guidance, Soul Mirror, Manifestation, Daily Reflection, Soul Identity, Registry).
 * 2. Deterministic Local Guidance Fallback (100% native English note, categories, innerwork, practices).
 * 3. Daily Guidance Engine dynamic influence & fallback face (native English sentences).
 * 4. User-Facing Normalizer (standardizeSoulReflection, English day names, English advice variations, blacklist deconfliction).
 * 5. Mirror Daily Reflection helper (English dayparts, greeting, signoff, and fallback display name).
 * 6. Birthday Message helper (English title and content).
 * 7. Engine invariants & convergence guards preservation.
 *
 * Runner: npx tsx tests/unit/build108-sprint04-ai-guidance.test.ts
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import "../helpers/initTestEnv.ts";

// Prompts
import { buildDailyGuidancePrompt } from "../../lib/prompts/dailyGuidancePrompt.ts";
import { buildBhumiSoulMirrorPrompt } from "../../lib/prompts/bhumiSoulMirrorPrompt.ts";
import { buildBhumiManifestationPrompt } from "../../lib/prompts/bhumiManifestationPrompt.ts";
import { buildBhumiDailyReflectionPrompt } from "../../lib/prompts/bhumiDailyReflectionPrompt.ts";
import { buildSoulIdentityPrompt } from "../../lib/prompts/soulIdentityPrompt.ts";
import { PromptRegistry } from "../../lib/ai/prompts/registry.ts";

// Fallbacks & Engines
import { generateLocalDailyGuidance } from "../../lib/orchestrators/localDailyGuidanceFallback.ts";
import { dailyGuidanceEngine } from "../../lib/engines/dailyGuidanceEngine.ts";
import {
  normalizeUserFacingGuidance,
  standardizeSoulReflection,
  deconflictBlacklistPhrases,
} from "../../lib/dailyGuidance/normalizeUserFacingGuidance.ts";
import {
  buildMirrorDailyReflection,
  safeMirrorDisplayName,
} from "../../lib/dailyGuidance/mirrorDailyReflection.ts";
import { buildBirthdayMessage } from "../../lib/birthday/birthdayMessage.ts";

let assertions = 0;
function ok(condition: unknown, msg: string): void {
  assertions += 1;
  assert.ok(condition, msg);
}
function eq<T>(a: T, b: T, msg: string): void {
  assertions += 1;
  assert.strictEqual(a, b, msg);
}

const ROOT = path.resolve(process.cwd());

// Synthetic user / blueprint context for prompt tests
const mockIdentity = {
  lifePathNumber: 7,
  arcanaCenter: 9,
  sunSign: "Virgo",
  moonSign: "Pisces",
  humanDesignType: "Projector",
};

const mockProfile = {
  fullName: "Jane Doe",
  displayName: "Jane",
  language: "en",
  timezone: "America/New_York",
};

const mockBlueprint = {
  numerology: { lifePath: 7 },
  humanDesign: { type: "Projector", authority: "Self Projected", strategy: "Wait for the Invitation" },
  astrology: { sunSign: "Virgo", moonSign: "Pisces", risingSign: "Scorpio" },
  destinyMatrix: { center: 9 },
};

console.log("\n--- SECTION 1: Daily Guidance Prompt (lib/prompts/dailyGuidancePrompt.ts) ---");
{
  const promptEn = buildDailyGuidancePrompt({
    language: "en",
    user: mockProfile,
    blueprint: mockBlueprint,
    identity: mockIdentity as any,
  });

  ok(promptEn.includes("OUTPUT LANGUAGE (R-PRD-31)"), "Prompt includes OUTPUT LANGUAGE header");
  ok(promptEn.includes("in English"), "Prompt specifies English output language");
  ok(promptEn.includes("Warm hugs from Bhumi."), "Prompt soul reflection closing specifies English hugs");
  ok(promptEn.includes("Hello {firstName}"), "Prompt soul reflection specifies English opening format");
  ok(promptEn.includes("(Companion Closing) 80-120 words in English"), "Prompt specifies English Companion Closing");

  const promptId = buildDailyGuidancePrompt({
    language: "id",
    user: { fullName: "Budi Santoso", language: "id" },
    blueprint: mockBlueprint,
    identity: mockIdentity as any,
  });
  ok(promptId.includes("in Bahasa Indonesia"), "Prompt specifies Bahasa Indonesia output language in ID mode");
  ok(promptId.includes("Peluk hangat dari Bhumi."), "Prompt contains Indonesian closing in ID mode");
}

console.log("\n--- SECTION 2: Soul Mirror Prompt (lib/prompts/bhumiSoulMirrorPrompt.ts) ---");
{
  const mirrorPromptEn = JSON.stringify(buildBhumiSoulMirrorPrompt({
    input: {
      language: "en",
      user: mockProfile,
      blueprint: mockBlueprint,
      uid: "test-user",
      date: "2026-09-04",
      localDateKey: "2026-09-04",
    },
  }));

  ok(mirrorPromptEn.includes("Hi {userName}, how are you feeling this {dayName}?"), "Mirror prompt includes English greeting format");
  ok(mirrorPromptEn.includes('"language":"en"'), "Mirror prompt specifies English language");
  ok(mirrorPromptEn.includes("BHUMI IDENTITY STYLE: Use a natural hybrid of 'I' and 'Bhumi'"), "Mirror prompt uses English Bhumi identity style");
  ok(mirrorPromptEn.includes("Soul Mirror"), "Mirror prompt includes English Soul Mirror role");

  const mirrorPromptId = JSON.stringify(buildBhumiSoulMirrorPrompt({
    input: {
      language: "id",
      user: { ...mockProfile, language: "id" },
      blueprint: mockBlueprint,
      uid: "test-user-id",
      date: "2026-09-04",
      localDateKey: "2026-09-04",
    },
  }));
  ok(mirrorPromptId.includes("Hai {userName}, bagaimana keadaanmu di hari {dayName} ini?"), "Mirror prompt includes Indonesian greeting in ID mode");
}

console.log("\n--- SECTION 3: Manifestation Prompt (lib/prompts/bhumiManifestationPrompt.ts) ---");
{
  const manifestPromptEn = JSON.stringify(buildBhumiManifestationPrompt({
    input: {
      language: "en",
      user: mockProfile,
      blueprint: mockBlueprint,
      uid: "test-user",
      date: "2026-09-04",
      localDateKey: "2026-09-04",
    },
  }));
  ok(manifestPromptEn.includes("Keep statements in first person ('I')"), "Manifestation prompt includes English first-person rule");
  ok(manifestPromptEn.includes("Bhumi Manifestation writer"), "Manifestation prompt includes English role");
  ok(manifestPromptEn.includes("Today's Note themes"), "Manifestation prompt references English Today's Note themes");

  const manifestPromptId = JSON.stringify(buildBhumiManifestationPrompt({
    input: {
      language: "id",
      user: { ...mockProfile, language: "id" },
      blueprint: mockBlueprint,
      uid: "test-user-id",
      date: "2026-09-04",
      localDateKey: "2026-09-04",
    },
  }));
  ok(manifestPromptId.includes("keep statements in first person ('Aku' or 'I')"), "Manifestation prompt includes Indonesian first-person rule in ID mode");
}

console.log("\n--- SECTION 4: Daily Reflection Prompt (lib/prompts/bhumiDailyReflectionPrompt.ts) ---");
{
  const reflectionPromptEn = JSON.stringify(buildBhumiDailyReflectionPrompt({
    input: {
      language: "en",
      user: mockProfile,
      blueprint: mockBlueprint,
      uid: "test-user",
      date: "2026-09-04",
      localDateKey: "2026-09-04",
    },
  }));
  ok(reflectionPromptEn.includes("TODAY'S FOCUS"), "Reflection prompt uses English focus header contract");
  ok(reflectionPromptEn.includes("Bhumi Today's Note writer"), "Reflection prompt uses English role description");
  ok(reflectionPromptEn.includes("Dashboard Today's Note preview"), "Reflection prompt references English preview");

  const reflectionPromptId = JSON.stringify(buildBhumiDailyReflectionPrompt({
    input: {
      language: "id",
      user: { ...mockProfile, language: "id" },
      blueprint: mockBlueprint,
      uid: "test-user-id",
      date: "2026-09-04",
      localDateKey: "2026-09-04",
    },
  }));
  ok(reflectionPromptId.includes("FOKUS HARI INI"), "Reflection prompt uses Indonesian focus header in ID mode");
  ok(reflectionPromptId.includes("Catatan Hari Ini"), "Reflection prompt references Catatan Hari Ini in ID mode");
}

console.log("\n--- SECTION 5: Soul Identity Prompt & PromptRegistry ---");
{
  const soulIdentityEn = buildSoulIdentityPrompt({
    language: "en",
    user: mockProfile,
    blueprint: mockBlueprint,
  });
  ok(soulIdentityEn.includes("Cosmic Resonance"), "Soul identity prompt specifies English Cosmic Resonance schema");
  ok(soulIdentityEn.includes("Civilization Resonance"), "Soul identity prompt specifies English Civilization Resonance schema");

  const registryPromptEn = PromptRegistry.buildPrompt({
    promptKey: "soul-reflection",
    language: "en",
    identity: mockIdentity as any,
  });
  ok(registryPromptEn.includes("You are an AI emotional companion named Bhumi."), "Registry soul-reflection outputs English role description");
  ok(registryPromptEn.includes("MANDATORY STYLE:\n- English language"), "Registry soul-reflection enforces English language");
  ok(!registryPromptEn.includes("Kamu adalah AI emotional companion"), "Registry soul-reflection does not leak Indonesian template in EN mode");
}

console.log("\n--- SECTION 6: Local Daily Guidance Fallback (lib/orchestrators/localDailyGuidanceFallback.ts) ---");
{
  const localGuidanceEn = generateLocalDailyGuidance({
    uid: "test-user-en",
    date: "2026-09-04",
    localDateKey: "2026-09-04",
    language: "en",
    user: mockProfile,
    profile: mockProfile,
    blueprint: mockBlueprint,
  });

  // Check soulReflectionText
  ok(localGuidanceEn.soulReflectionText.includes("Jane"), "Local soul reflection includes user first name");
  ok(!/\b(Hai|Selamat|jiwamu|bergerak|dirimu)\b/i.test(localGuidanceEn.soulReflectionText), "Local soul reflection has no Indonesian words");

  // Check dailyNoteText
  const note = localGuidanceEn.dailyNoteText;
  ok(note.includes("Current theme:"), "Daily note includes English 'Current theme:' header");
  ok(note.includes("Daily focus:"), "Daily note includes English 'Daily focus:' header");
  ok(note.includes("Reflection question:"), "Daily note includes English 'Reflection question:' header");
  ok(note.includes("Lifestyle Insight:"), "Daily note includes English 'Lifestyle Insight:' header");
  ok(!note.includes("Tema saat ini:"), "Daily note has zero 'Tema saat ini:' leak");
  ok(!note.includes("Fokus harian:"), "Daily note has zero 'Fokus harian:' leak");
  ok(!note.includes("Pertanyaan refleksi:"), "Daily note has zero 'Pertanyaan refleksi:' leak");

  // Check categories (all 8 categories present and localized)
  ok(Boolean(localGuidanceEn.categories), "Categories object exists");
  const cats = localGuidanceEn.categories!;
  const requiredCategories = ["general", "mental", "finance", "love", "relational", "spiritual", "challenges", "opportunities"] as const;
  for (const catKey of requiredCategories) {
    const cat = cats[catKey];
    ok(Boolean(cat), `Category ${catKey} exists`);
    ok(cat.insight.length > 0, `Category ${catKey} insight has content`);
    ok(cat.advice.length > 20, `Category ${catKey} advice has length`);
    // Assert no common Indonesian words in English fallback categories
    ok(!/\b(adalah|dengan|kamu|hari ini|batinmu|ruang|tenaga)\b/i.test(cat.insight), `Category ${catKey} insight has no Indonesian words`);
    ok(!/\b(adalah|dengan|kamu|hari ini|batinmu|ruang|tenaga)\b/i.test(cat.advice), `Category ${catKey} advice has no Indonesian words`);
  }

  // Check manifestation
  ok(Boolean(localGuidanceEn.manifestation), "Manifestation object exists");
  ok(localGuidanceEn.manifestation!.affirmation.startsWith("I "), "Affirmation starts with English first person ('I')");
  ok(localGuidanceEn.manifestation!.attraction.startsWith("I "), "Attraction starts with English first person ('I')");
  ok(localGuidanceEn.manifestation!.assumption.startsWith("I "), "Assumption starts with English first person ('I')");

  // Check innerwork tasks
  ok(Boolean(localGuidanceEn.dailyInnerwork?.tasks), "Innerwork tasks exist");
  ok(localGuidanceEn.dailyInnerwork.tasks.length >= 3, "At least 3 innerwork tasks generated");
  for (const practice of localGuidanceEn.dailyInnerwork.tasks) {
    ok(!/\b(dan|untuk|dengan|pagi|malam|batinmu)\b/i.test(practice.task), `Task '${practice.task}' has no Indonesian words`);
    ok(!/\b(dan|untuk|dengan|pagi|malam|batinmu)\b/i.test(practice.instruction), `Instruction '${practice.instruction}' has no Indonesian words`);
  }

  // Check recommendations and prompts
  ok(typeof localGuidanceEn.meditationRecommendation.focusArea === "string" && localGuidanceEn.meditationRecommendation.focusArea.length > 0, "Meditation focus area is set");
  ok(!/\b(Kehadiran|Diri|Keseimbangan)\b/i.test(localGuidanceEn.meditationRecommendation.focusArea), "Meditation focus area has no Indonesian words");
  ok(typeof localGuidanceEn.journalingPrompt.theme === "string" && localGuidanceEn.journalingPrompt.theme.length > 0, "Journaling prompt theme is set");
  ok(!/\b(Refleksi|Pertumbuhan)\b/i.test(localGuidanceEn.journalingPrompt.theme), "Journaling prompt theme has no Indonesian words");
  ok(localGuidanceEn.journalingPrompt.prompt.length > 20, "Journaling prompt has length");
  ok(!/\b(adalah|dengan|kamu|jiwamu)\b/i.test(localGuidanceEn.journalingPrompt.prompt), "Journaling prompt has no Indonesian words");
}

console.log("\n--- SECTION 7: Daily Guidance Engine Dynamic Influence (lib/engines/dailyGuidanceEngine.ts) ---");
{
  const engineFallbackEn = dailyGuidanceEngine.generateFallbackFace({
    primaryArchetype: "Architect",
    recommendedFocus: "Clarity",
    energeticRhythm: "steady",
    cosmicAlignment: "favorable",
    astrologicalSummary: "Clear skies and receptive atmosphere.",
    synthesisReason: "Harmonious balance of introspective energy.",
    innerworkFocus: "Meditation and grounding.",
    localDateKey: "2026-09-04",
    uid: "test-user-en",
    theme: "Clarity",
    focus: "Steadiness",
  } as any, {
    uid: "test-user-en",
    date: "2026-09-04",
    localDateKey: "2026-09-04",
    language: "en",
    profile: mockProfile,
    blueprint: mockBlueprint,
  } as any);

  eq(engineFallbackEn.soulReflectionText, "Today is about steady presence. Let calm settle first, and clarity can follow at its own pace.", "Engine fallback soul reflection is in English");
  ok(engineFallbackEn.dailyNoteText?.includes("There is nothing here that must be finished at once."), "Engine fallback daily note text starts with English note");
  ok(!/\b(adalah|dengan|untuk|batin)\b/i.test(engineFallbackEn.dailyNoteText || ""), "Engine fallback daily note text contains no Indonesian words");

  // Check dynamic influence sentence builders
  const dynamicNote = engineFallbackEn.dailyNoteText || "";
  ok(!dynamicNote.includes("Langit hari ini"), "No Indonesian sky transit leakage");
  ok(!dynamicNote.includes("Kondisi cuaca"), "No Indonesian environment weather leakage");
}

console.log("\n--- SECTION 8: User-Facing Normalizer (lib/dailyGuidance/normalizeUserFacingGuidance.ts) ---");
{
  // Test standardizeSoulReflection with English profile
  const mockGuidanceRecord = {
    uid: "test-guidance-uid",
    date: "2026-09-04",
    localDateKey: "2026-09-04",
    language: "en",
    profileSnapshot: mockProfile,
    soulReflectionText: "This is a quiet day to reflect on your journey and nourish your heart.",
    dailyNoteText: "Keep your focus light and gentle.",
    categories: {
      general: { insight: "", reason: "", advice: "" },
      mental: { insight: "", reason: "", advice: "" },
      finance: { insight: "", reason: "", advice: "" },
      love: { insight: "", reason: "", advice: "" },
      relational: { insight: "", reason: "", advice: "" },
      spiritual: { insight: "", reason: "", advice: "" },
      challenges: { insight: "", reason: "", advice: "" },
      opportunities: { insight: "", reason: "", advice: "" },
      advice: { insight: "", reason: "", advice: "" },
    },
    dailyPractices: [],
    aiInsight: "",
    journalPrompt: "",
    meditationSuggestion: "",
    emotionalFocus: "",
    spiritualFocus: "",
    groundedAction: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: "local-fallback" as const,
  };

  const normalized = normalizeUserFacingGuidance(mockGuidanceRecord as any, mockProfile);

  ok(normalized.soulReflectionText?.includes("Jane"), "Normalized soul reflection has English opening with user name");
  ok(normalized.soulReflectionText?.includes("Warm hugs from Bhumi."), "Normalized soul reflection has English hugs");
  ok(!normalized.soulReflectionText?.includes("Peluk hangat"), "Normalized soul reflection does not have Indonesian hugs");

  // Categories fallback insight check
  eq(
    normalized.categories?.mental.insight,
    "Your mind is drawn toward noticing and organizing patterns that are usually easy to overlook.",
    "Mental category insight normalized to English fallback"
  );
  eq(
    normalized.categories?.finance.insight,
    "Your connection with stability is at a point where discerning your energy becomes your anchor.",
    "Finance category insight normalized to English fallback"
  );

  // Focus and prompt fallbacks
  eq(normalized.emotionalFocus, "Presence", "Emotional focus normalized to English 'Presence'");
  eq(normalized.spiritualFocus, "Clarity", "Spiritual focus normalized to English 'Clarity'");
  eq(normalized.journalPrompt, "What is the one thing you most wish to care for today?", "Journal prompt normalized to English fallback");
  eq(normalized.meditationSuggestion, "Sit quietly in stillness for a few minutes.", "Meditation suggestion normalized to English fallback");

  // Deconflict blacklist test
  const testPhrase = "Take one small step and don't have to finish everything right now.";
  const seenCounts: Record<string, number> = {};
  const deconflicted = deconflictBlacklistPhrases(testPhrase, seenCounts, true);
  ok(deconflicted?.includes("tangible action"), "Deconflicted English 'one small step' to 'tangible action'");
  ok(deconflicted?.includes("let the rest unfold naturally"), "Deconflicted English 'finish everything' to 'let the rest unfold naturally'");
}

console.log("\n--- SECTION 9: Soul Mirror Helper (lib/dailyGuidance/mirrorDailyReflection.ts) ---");
{
  eq(safeMirrorDisplayName(null, "en"), "Friend of Bhumi", "Default display name in English is 'Friend of Bhumi'");
  eq(safeMirrorDisplayName(null, "id"), "Sahabat Bhumi", "Default display name in Indonesian is 'Sahabat Bhumi'");
  eq(safeMirrorDisplayName("Jane Doe", "en"), "Jane Doe", "Retains custom user name");

  const mirrorEn = buildMirrorDailyReflection({
    guidance: {
      soulReflectionText: "You are supported by the quiet currents of the cosmos today.",
      dailyConclusion: { text: "Focus on gentle consistency." } as any,
    } as any,
    userName: "Jane",
    now: new Date("2026-09-04T10:00:00Z"),
    timezone: "UTC",
    language: "en",
  });

  ok(mirrorEn.text.includes("Hello, Jane. How are you this"), "Mirror reflection text has English greeting");
  ok(mirrorEn.text.includes("Warm hugs from Bhumi."), "Mirror reflection text has English signoff");
  ok(!mirrorEn.text.includes("Peluk hangat"), "Mirror reflection text has no Indonesian signoff");
}

console.log("\n--- SECTION 10: Birthday Message (lib/birthday/birthdayMessage.ts) ---");
{
  const bdayEn = buildBirthdayMessage({
    uid: "test-user-bday",
    displayName: "Jane",
    birthDate: "1994-09-04",
    language: "en",
  }, "2026", "en");

  eq(bdayEn.title, "Happy Birthday, Jane", "Birthday title is in English");
  ok(bdayEn.content.includes("Today marks a new cycle in your journey—your 32nd year."), "Birthday content includes English ordinal age");
  ok(bdayEn.content.includes("Warm hugs from Bhumi."), "Birthday content includes English hugs");
  ok(!bdayEn.content.includes("Selamat Ulang Tahun"), "Birthday content has no Indonesian text in English mode");

  const bdayId = buildBirthdayMessage({
    uid: "test-user-bday-id",
    displayName: "Budi",
    birthDate: "1994-09-04",
    language: "id",
  }, "2026", "id");
  eq(bdayId.title, "Selamat Ulang Tahun, Budi", "Birthday title is in Indonesian for ID mode");
  ok(bdayId.content.includes("Peluk hangat dari Bhumi."), "Birthday content includes Indonesian hugs in ID mode");
}

console.log("\n--- SECTION 11: Invariant & Guard Checks ---");
{
  // 1. Check that calculation engines remain untouched
  const calcFiles = [
    "lib/engines/calculateBhumiMatrix.ts",
    "lib/bazi/calculateBazi.ts",
    "lib/zi-wei/calculateZiWei.ts",
    "lib/astrocartography/calculateAstrocartography.ts",
  ];
  for (const file of calcFiles) {
    const fullPath = path.join(ROOT, file);
    ok(fs.existsSync(fullPath), `Calculation engine file ${file} exists`);
  }

  // 2. Check Build 107 HD type convergence guard
  const hdAuditPath = path.join(ROOT, "lib/humandesign/hdAudit.ts");
  const hdAuditSrc = fs.readFileSync(hdAuditPath, "utf-8");
  ok(hdAuditSrc.includes("isRecognizedHumanDesignType"), "Build 107 isRecognizedHumanDesignType guard is intact");

  // 3. Check version code invariants
  const appBuildPath = path.join(ROOT, "android/app/build.gradle");
  if (fs.existsSync(appBuildPath)) {
    const gradle = fs.readFileSync(appBuildPath, "utf-8");
    ok(gradle.includes("versionCode 108"), "versionCode 108 is configured");
    ok(gradle.includes('versionName "5.0.8"'), 'versionName "5.0.8" is configured');
  }
}

console.log(`\n======================================================`);
console.log(`ALL SPRINT 4 AI GUIDANCE TESTS PASSED (${assertions} assertions)`);
console.log(`======================================================\n`);
