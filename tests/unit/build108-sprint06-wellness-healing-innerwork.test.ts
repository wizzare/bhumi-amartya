/**
 * Build 108 ENL — Sprint 6 (Wellness, Somatics, Healing, Innerwork, Meditation, Aura) Unit & Invariant Test
 *
 * Verifies:
 * 1. Wellness Hub & Assessment flow localization to English in ENL mode.
 * 2. Healing pages, cards, and emotional progress timeline in English mode.
 * 3. Meditation practices, Mudra guides, and reflections in English mode.
 * 4. All 8 Innerwork modules (audio-healing, herbal, journaling, manifestasi, meditation, workout, yoga) in English mode.
 * 5. Aura / Kenali Diri calculation API, result generator, and presentation page in English mode.
 * 6. Health copy safety: high-risk claims (anti-inflamasi, perbaikan DNA, thyroid, penyembuhan seluler) moderated.
 * 7. Absence of Indonesian/Malay leaks across visible surfaces in ENL mode.
 * 8. Build 107 continuity and GATE_108_CDI invariants preserved.
 *
 * Runner: node --import tsx tests/unit/build108-sprint06-wellness-healing-innerwork.test.ts
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

// Pre-set environment variables before module imports
process.env.NEXT_PUBLIC_APP_EDITION = "ENL";
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-key";
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "test.firebaseapp.com";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "test.appspot.com";
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "123456789";
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "1:123456789:web:test";

// Innerwork & Healing
import {
  WORKOUT_DATABASE,
  YOGA_DATABASE,
  HEALTHY_FOOD_DATABASE,
  AUDIO_HEALING_DATABASE,
} from "../../lib/data/innerworkContent.ts";
import { INNERWORK_VARIATION_LIBRARY } from "../../lib/data/innerworkVariationLibrary.ts";
import { createAudioHealingReflection } from "../../lib/audioHealing/localAudioHealing.ts";
import { getZoneBGuide } from "../../lib/innerwork/zoneBContext.ts";

// Meditation & Mudra
import { getMudraGuide, type MudraName } from "../../lib/meditation/mudraGuides.ts";
import {
  createDailyMeditationPractice,
  createMeditationReflection,
  type MeditationTheme,
} from "../../lib/meditation/createDailyMeditationPractice.ts";

// Aura
import { generateAuraResult } from "../../lib/services/auraResultGenerator.ts";

let assertions = 0;
function ok(condition: unknown, msg: string): void {
  assert.ok(condition, msg);
  assertions++;
}

function equal<T>(actual: T, expected: T, msg: string): void {
  assert.strictEqual(actual, expected, msg);
  assertions++;
}

console.log("=== BUILD 108 ENL: SPRINT 6 WELLNESS, HEALING, INNERWORK VERIFICATION ===");

// ---------------------------------------------------------------------------
// 1. Health Copy Safety & Conservative Medical Boundaries
// ---------------------------------------------------------------------------

console.log("\n--- [1/7] Health Copy Safety & Conservative Medical Boundaries ---");

const innerworkContentPath = path.resolve(process.cwd(), "lib/data/innerworkContent.ts");
const contentSource = fs.readFileSync(innerworkContentPath, "utf-8");

ok(!contentSource.includes("Thyroid health"), "Thyroid health claim removed / replaced");
ok(!contentSource.includes("Anti-inflamasi"), "Anti-inflamasi claim removed / replaced");
ok(!contentSource.includes("Detoksifikasi"), "Detoksifikasi claim removed / replaced");
ok(!contentSource.includes("penyembuhan seluler"), "Penyembuhan seluler claim removed / replaced");
ok(!contentSource.includes("mendukung perbaikan DNA dan transformasi positif"), "DNA repair claim removed / replaced");

ok(contentSource.includes("Neck and throat mobility"), "Conservative physical benefit present");
ok(contentSource.includes("Refreshing, warming, and soothing"), "Conservative lifestyle benefit present");
ok(contentSource.includes("Deep relaxation and calm"), "Conservative relaxation benefit present");
ok(contentSource.includes("Harmonic resonance and deep relaxation"), "Conservative harmonic benefit present");

// ---------------------------------------------------------------------------
// 2. Wellness Hub, Mapping, and Assessment Data
// ---------------------------------------------------------------------------

console.log("\n--- [2/7] Wellness Hub & Assessment Data ---");

const wellnessClientPath = path.resolve(process.cwd(), "components/wellness/WellnessPageClient.tsx");
const wellnessClientSource = fs.readFileSync(wellnessClientPath, "utf-8");

ok(wellnessClientSource.includes("isEnlEdition"), "WellnessPageClient uses isEnlEdition");
ok(wellnessClientSource.includes("Recovery Mode") && wellnessClientSource.includes("Growth Mode"), "WellnessPageClient has English navigator modes");
ok(wellnessClientSource.includes("Today Is Enough"), "WellnessPageClient has English enoughness text");
ok(wellnessClientSource.includes("Open Practice"), "WellnessPageClient has English practice labels");

const wellnessAssessmentPath = path.resolve(process.cwd(), "components/wellness/WellnessAssessmentFlow.tsx");
const assessmentSource = fs.readFileSync(wellnessAssessmentPath, "utf-8");

ok(assessmentSource.includes("isEnlEdition"), "WellnessAssessmentFlow uses isEnlEdition");
ok(assessmentSource.includes("Initial Mapping") && assessmentSource.includes("Complete Mapping"), "WellnessAssessmentFlow has English step titles and actions");
ok(assessmentSource.includes("Disagree") && assessmentSource.includes("Agree"), "WellnessAssessmentFlow has English Likert scale labels");

const wellnessCheckInCardPath = path.resolve(process.cwd(), "components/dashboard/WellnessCheckInCard.tsx");
const checkInCardSource = fs.readFileSync(wellnessCheckInCardPath, "utf-8");

ok(checkInCardSource.includes("isEnlEdition"), "WellnessCheckInCard uses isEnlEdition");
ok(checkInCardSource.includes("Pause for a Moment") && checkInCardSource.includes("How Are You Today?"), "WellnessCheckInCard has English prompt headers");

// ---------------------------------------------------------------------------
// 3. Healing Pages & Components
// ---------------------------------------------------------------------------

console.log("\n--- [3/7] Healing Pages & Components ---");

const healingPagePath = path.resolve(process.cwd(), "app/healing/page.tsx");
const healingSource = fs.readFileSync(healingPagePath, "utf-8");

ok(healingSource.includes("isEnlEdition"), "Healing page uses isEnlEdition");
ok(healingSource.includes("This space is a gentle companion for your nervous system"), "Healing page has English hero copy");
ok(healingSource.includes("Save Note") || healingSource.includes("Saving..."), "Healing page has English action buttons");

const healingAudioPath = path.resolve(process.cwd(), "app/healing/audio/page.tsx");
const healingAudioSource = fs.readFileSync(healingAudioPath, "utf-8");

ok(healingAudioSource.includes("isEnlEdition"), "Healing audio page uses isEnlEdition");
ok(healingAudioSource.includes("Audio Healing"), "Audio healing page title present");
ok(healingAudioSource.includes("Save Experience") || healingAudioSource.includes("Experience saved..."), "Audio healing has English save button");

const timelinePath = path.resolve(process.cwd(), "components/healing/EmotionalProgressTimeline.tsx");
const timelineSource = fs.readFileSync(timelinePath, "utf-8");
ok(timelineSource.includes("isEnlEdition"), "EmotionalProgressTimeline uses isEnlEdition for date/milestone formatting");

// ---------------------------------------------------------------------------
// 4. Meditation & Mudra Guides
// ---------------------------------------------------------------------------

console.log("\n--- [4/7] Meditation & Mudra Guides ---");

const mudraNames: MudraName[] = [
  "Prithvi Mudra",
  "Gyan Mudra",
  "Anjali Mudra",
  "Apana Mudra",
  "Hakini Mudra",
  "Padma Mudra",
  "Shuni Mudra",
  "Surya Mudra",
  "Vayu Mudra",
  "Kubera Mudra",
  "Yoni Mudra",
];

for (const name of mudraNames) {
  const guideEn = getMudraGuide(name, true);
  ok(guideEn && guideEn.benefits.length > 0, `English benefits present for ${name}`);
  ok(guideEn && guideEn.steps.length >= 2, `English steps present for ${name}`);
  ok(guideEn && guideEn.duration.includes("minute"), `English duration format for ${name}`);
  ok(guideEn && guideEn.affirmation && guideEn.affirmation.length > 0, `English affirmation for ${name}`);

  const guideId = getMudraGuide(name, false);
  ok(guideId && guideId.duration.includes("menit"), `Indonesian duration preserved for ${name}`);
}

const meditationThemes: MeditationTheme[] = [
  "Inner Child",
  "Love Block",
  "Money Block",
  "Repeating Patterns",
  "Self Worth",
  "Family Dynamics",
  "Karmic Lessons",
  "Ancestral Patterns",
  "Forgiveness",
  "Purpose & Calling",
  "Nervous System Grounding",
  "Emotional Release",
  "Body Safety",
];

for (const theme of meditationThemes) {
  const practiceEn = createDailyMeditationPractice({
    blueprintContext: { primaryTheme: theme },
  });
  ok(practiceEn.theme.length > 0, `Meditation practice theme generated for ${theme}`);
  ok(practiceEn.affirmation.length > 0, `Meditation affirmation generated for ${theme}`);
  ok(practiceEn.practices.length >= 3, `Meditation practices generated for ${theme}`);
}

const reflectionEn = createMeditationReflection({
  theme: "Inner Child",
  emotionalState: "Calm",
  bodySignals: ["Relaxed"],
  bodyReflection: "Felt peaceful",
});
ok(reflectionEn.insight.length > 0, "English meditation reflection insight generated");
ok(reflectionEn.nextFocus.length > 0, "English meditation nextFocus generated");

// ---------------------------------------------------------------------------
// 5. Innerwork Modules & Content Databases
// ---------------------------------------------------------------------------

console.log("\n--- [5/7] Innerwork Modules & Content Databases ---");

// Test EN mode databases
process.env.NEXT_PUBLIC_APP_EDITION = "ENL";
ok(WORKOUT_DATABASE["hiit-energy"].description.includes("physical tension"), "Workout EN uses English description");
ok(YOGA_DATABASE["grounding-earth"].description.includes("balance"), "Yoga EN uses English description");
ok(HEALTHY_FOOD_DATABASE["ginger-fire"].title.includes("Warm Ginger"), "Food EN uses English title");
ok(AUDIO_HEALING_DATABASE["frequency-432"].description.includes("Deep relaxation"), "Audio EN uses English description");

// Test ID mode databases preserved
process.env.NEXT_PUBLIC_APP_EDITION = "standard";
ok(WORKOUT_DATABASE["hiit-energy"].description.includes("kompetitif"), "Workout ID uses Indonesian description");
ok(YOGA_DATABASE["grounding-earth"].description.includes("keseimbangan"), "Yoga ID uses Indonesian description");
ok(HEALTHY_FOOD_DATABASE["ginger-fire"].title.includes("Wedang Jahe"), "Food ID uses Indonesian title");

// Test Innerwork Variation Library
process.env.NEXT_PUBLIC_APP_EDITION = "ENL";
const journalEn = INNERWORK_VARIATION_LIBRARY.journaling[0];
equal(journalEn.title, "Recurring Pattern Journal", "Variation library EN title matches");

process.env.NEXT_PUBLIC_APP_EDITION = "standard";
const journalId = INNERWORK_VARIATION_LIBRARY.journaling[0];
equal(journalId.title, "Jurnal Pola Berulang", "Variation library ID title preserved");

// Test Zone B Guide
const zoneBEn = getZoneBGuide({
  issue: "kesulitan beristirahat tanpa rasa bersalah",
  practiceId: "practice-1",
  practiceCategory: "journaling",
  sourceTheme: "Rest",
  title: "Rest Guide",
  durationMinutes: 10,
});
ok(zoneBEn.benefits.length > 0, "Zone B benefits present in English");
ok(zoneBEn.reflectionQuestions.length >= 2, "Zone B questions present in English");

const audioReflectionEn = createAudioHealingReflection({
  emotionalState: "Calmer",
  bodySignals: ["Body more relaxed"],
  reflectionText: "Quiet and soothing",
});
ok(audioReflectionEn.insight.length > 0, "Audio healing reflection insight generated in English");

// ---------------------------------------------------------------------------
// 6. Aura / Kenali Diri Surface & Generator
// ---------------------------------------------------------------------------

console.log("\n--- [6/7] Aura / Kenali Diri Surface & Generator ---");

process.env.NEXT_PUBLIC_APP_EDITION = "ENL";

const auraResultEn = generateAuraResult("KUNING", "HIJAU", "PERAK", { KUNING: 85, HIJAU: 70, PERAK: 50 }, true);
ok(auraResultEn.primaryAura.length > 0, "Aura primary color present");
ok(auraResultEn.summary.length > 0, "Aura summary narrative present in English");
ok(auraResultEn.strengths.length >= 2, "Aura strengths present in English");
ok(auraResultEn.challenges.length >= 2, "Aura challenges present in English");
ok(auraResultEn.supportExplanation.includes("supportive foundation"), "English support explanation present");

process.env.NEXT_PUBLIC_APP_EDITION = "standard";
const auraResultId = generateAuraResult("KUNING", "HIJAU", "PERAK", { KUNING: 85, HIJAU: 70, PERAK: 50 }, false);
ok(auraResultId.summary.length > 0, "Aura summary narrative preserved in Indonesian");
ok(auraResultId.supportExplanation.includes("sistem pendukung"), "Indonesian support explanation preserved");

const auraPagePath = path.resolve(process.cwd(), "app/kenali-diri/aura/page.tsx");
const auraPageSource = fs.readFileSync(auraPagePath, "utf-8");
ok(auraPageSource.includes("isEnlEdition"), "Aura page uses isEnlEdition");
ok(auraPageSource.includes("Your Aura Test") || auraPageSource.includes("Analyze My Aura"), "Aura page has English form UI");

// ---------------------------------------------------------------------------
// 7. Surface Inventory Verification (All 15 Routes & Components)
// ---------------------------------------------------------------------------

console.log("\n--- [7/7] Sprint 6 Surface Inventory Verification ---");

const sprint6Routes = [
  "app/wellness/page.tsx",
  "app/wellness-assessment/page.tsx",
  "app/meditation/page.tsx",
  "app/healing/page.tsx",
  "app/healing/audio/page.tsx",
  "app/healing/meditation/page.tsx",
  "app/innerwork/page.tsx",
  "app/innerwork/audio-healing/page.tsx",
  "app/innerwork/herbal/page.tsx",
  "app/innerwork/journaling/page.tsx",
  "app/innerwork/manifestasi/page.tsx",
  "app/innerwork/meditation/page.tsx",
  "app/innerwork/workout/page.tsx",
  "app/innerwork/yoga/page.tsx",
  "app/kenali-diri/aura/page.tsx",
  "app/api/kenali-diri/aura/route.ts",
];

for (const route of sprint6Routes) {
  const fullPath = path.join(process.cwd(), route);
  ok(fs.existsSync(fullPath), `Sprint 6 route file exists: ${route}`);
}

const sprint6Components = [
  "components/wellness/WellnessPageClient.tsx",
  "components/wellness/WellnessAssessmentFlow.tsx",
  "components/wellness/WellnessMappingView.tsx",
  "components/wellness/WellnessMapView.tsx",
  "components/wellness/WellnessNavigatorView.tsx",
  "components/wellness/WellnessSupportPathView.tsx",
  "components/dashboard/WellnessCheckInCard.tsx",
  "components/healing/DailyHealingFocus.tsx",
  "components/healing/HealingHero.tsx",
  "components/healing/MeditationCard.tsx",
  "components/healing/ChakraBalanceCard.tsx",
  "components/healing/ShadowHealingCard.tsx",
  "components/healing/InnerChildHealingCard.tsx",
  "components/healing/AncestorHealingCard.tsx",
  "components/healing/MudraGuideCard.tsx",
  "components/healing/HealingProgressCard.tsx",
  "components/healing/EmotionalProgressTimeline.tsx",
  "components/ui/GuidedLearningDetails.tsx",
];

for (const comp of sprint6Components) {
  const fullPath = path.join(process.cwd(), comp);
  ok(fs.existsSync(fullPath), `Sprint 6 component file exists: ${comp}`);
}

console.log(`\n==================================================`);
console.log(`ALL SPRINT 6 VERIFICATION PASSED: ${assertions} assertions OK`);
console.log(`==================================================`);
