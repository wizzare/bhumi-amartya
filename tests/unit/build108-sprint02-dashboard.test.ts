/**
 * Build 108 ENL — Sprint 2 (Dashboard & Environment) Unit & Invariant Test
 *
 * Verifies:
 * 1. Dictionary parity for dashboard, environment, and weeklyGuidance across all locales.
 * 2. DashboardClient English edition integration and localized fallback/quote rendering.
 * 3. CoreIdentity HD convergence and localized unavailable/calculating labels.
 * 4. EnvironmentContextCard & Environment page full English localization (N/S, E/W, weather, moon, AQI, UV, Kp).
 * 5. WeeklyGuidanceCard date formatting and phase translations.
 * 6. AstroTodayCard date formatting, transits, and moon heading translations.
 * 7. GuardianIdentityCard greetings, badges, and recognition date formatting.
 * 8. PendingHdRecoveryBanner & AccuracyUpgradeBanner English localization + canonical HD guards.
 * 9. TrialWelcomePopup & ReviewDialog English modals.
 * 10. DailyNoteV2, AIReminderState, and PenjagaBhumiIntiBanner English copy.
 * 11. SafetyActionCard & supportResourceLibrary English disclaimers and actions.
 * 12. Helper runtime tests for environment strings in English.
 *
 * Runner: node --import tsx tests/unit/build108-sprint02-dashboard.test.ts
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

import { getCompatDictionaries } from "../../lib/i18n/index.ts";
import { getAqiLabel, getUvLabel, normalizeMoonPhaseLabel } from "../../lib/environment/service.tsx";
import { kpActivityLabel } from "../../lib/environment/schumann.ts";
import { SUPPORT_DISCLAIMERS } from "../../lib/data/supportResourceLibrary.ts";

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

/* ------------------------------------------------- 1. Dictionary Parity */
function testDictionaryParity(): void {
  const dicts = getCompatDictionaries();
  const en = dicts.en;
  const id = dicts.id;
  const ms = dicts.ms;

  // Dashboard keys
  const dashboardKeys = [
    "coreIdentity", "lifePath", "arcanaCenter", "sunSign", "humanDesign",
    "humanDesignPending", "humanDesignNeedsTimezone", "openingSpace", "syncingSpace",
    "syncingDescription", "reloadButton", "setupButton", "footerQuote",
    "calculatingInProgress", "cannotCalculate"
  ];
  for (const k of dashboardKeys) {
    ok(en?.dashboard?.[k], "en-US has dashboard." + k);
    ok(id?.dashboard?.[k], "id-ID has dashboard." + k);
    ok(ms?.dashboard?.[k], "ms-MY has dashboard." + k);
  }

  // Environment keys
  const envKeys = [
    "back", "pageTitle", "pageSubtitle", "readingSignals", "waitAMoment",
    "refreshingData", "detectedArea", "awaitingSync", "feelsLike", "sunrise",
    "sunset", "awaitingDaylight", "illumination", "awaitingNight", "airQualityAround",
    "syncFooter", "permissionDenied", "unsupported", "loadError", "settingsHintFull",
    "windUnit", "waitingPermission", "locationNotDetected", "readingLocation"
  ];
  for (const k of envKeys) {
    ok(en?.environment?.[k], "en-US has environment." + k);
    ok(id?.environment?.[k], "id-ID has environment." + k);
    ok(ms?.environment?.[k], "ms-MY has environment." + k);
  }

  // WeeklyGuidance keys
  const weeklyKeys = [
    "title", "subtitle", "preparing", "completeProfile", "earlyWeek",
    "midWeek", "weekend", "bhumiAdvice", "weeklyDirection"
  ];
  for (const k of weeklyKeys) {
    ok(en?.weeklyGuidance?.[k], "en-US has weeklyGuidance." + k);
    ok(id?.weeklyGuidance?.[k], "id-ID has weeklyGuidance." + k);
    ok(ms?.weeklyGuidance?.[k], "ms-MY has weeklyGuidance." + k);
  }

  console.log("  1. Dictionary parity (dashboard, environment, weekly) PASS");
}

/* ------------------------------------------------- 2. DashboardClient Audit */
function testDashboardClientAudit(): void {
  const file = path.join(ROOT, "components/dashboard/DashboardClient.tsx");
  const src = fs.readFileSync(file, "utf8");

  ok(src.includes('import { isEnlEdition } from "@/lib/config/edition"'), "DashboardClient imports isEnlEdition");
  ok(/legacyUiLanguage.*=\s*isEnl\s*\|\|\s*language\s*===\s*"en"\s*\?\s*"en"\s*:\s*"id"/.test(src), "legacyUiLanguage respects ENL edition");
  ok(src.includes("t.dashboard.openingSpace"), "Uses localized openingSpace");
  ok(src.includes("t.dashboard.syncingSpace"), "Uses localized syncingSpace");
  ok(src.includes("t.dashboard.syncingDescription"), "Uses localized syncingDescription");
  ok(src.includes("t.dashboard.reloadButton"), "Uses localized reloadButton");
  ok(src.includes("t.dashboard.setupButton"), "Uses localized setupButton");
  ok(src.includes("calculatingInProgress"), "Passes calculatingInProgress to CoreIdentity");
  ok(src.includes("cannotCalculate"), "Passes cannotCalculate to CoreIdentity");
  ok(src.includes("t.dashboard.footerQuote"), "Uses localized footerQuote");

  console.log("  2. DashboardClient audit ........................... PASS");
}

/* ------------------------------------------------- 3. CoreIdentity Invariants */
function testCoreIdentityInvariants(): void {
  const file = path.join(ROOT, "components/dashboard/CoreIdentity.tsx");
  const src = fs.readFileSync(file, "utf8");

  ok(src.includes("isRecognizedHumanDesignType"), "CoreIdentity imports isRecognizedHumanDesignType");
  ok(/if\s*\(\s*isRecognizedHumanDesignType\(hdState\.type\)\s*\)/.test(src), "CoreIdentity early-returns recognized type");
  ok(!src.includes("Perlu dihitung ulang"), "No hardcoded Perlu dihitung ulang");
  ok(!/perlu kalkulasi ulang/i.test(src), "No hardcoded perlu kalkulasi ulang");
  ok(src.includes("calculatingInProgress?: string"), "Supports calculatingInProgress label");
  ok(src.includes("cannotCalculate?: string"), "Supports cannotCalculate label");

  console.log("  3. CoreIdentity invariants ......................... PASS");
}

/* ------------------------------------------------- 4. Environment Components Audit */
function testEnvironmentAudit(): void {
  // Card
  const cardFile = path.join(ROOT, "components/dashboard/EnvironmentContextCard.tsx");
  const cardSrc = fs.readFileSync(cardFile, "utf8");
  ok(cardSrc.includes("isEnlEdition"), "EnvironmentContextCard imports isEnlEdition");
  ok(cardSrc.includes('isEn ? "N" : "LU"'), "EnvironmentContextCard formats latitude in English");
  ok(cardSrc.includes('isEn ? "E" : "BT"'), "EnvironmentContextCard formats longitude in English");
  ok(cardSrc.includes("kpActivityLabel"), "EnvironmentContextCard uses kpActivityLabel");
  ok(cardSrc.includes('isEn && context.earthActivity.status === "Stabil" ? "Stable"'), "EnvironmentContextCard localizes earth activity");

  // Page
  const pageFile = path.join(ROOT, "app/dashboard/environment/page.tsx");
  const pageSrc = fs.readFileSync(pageFile, "utf8");
  ok(pageSrc.includes("isEnlEdition"), "Environment page imports isEnlEdition");
  ok(pageSrc.includes("localizeWeatherCondition"), "Environment page uses localizeWeatherCondition");
  ok(pageSrc.includes("normalizeMoonPhaseLabel(context.moon?.phase, isEn)"), "Environment page localizes moon phase");
  ok(pageSrc.includes("getAqiLabel(context.airQuality.aqi, isEn)"), "Environment page localizes AQI");
  ok(pageSrc.includes("getUvLabel(num, isEn)"), "Environment page localizes UV");
  ok(pageSrc.includes("kpActivityLabel(context.spaceWeather.kpIndex, isEn)"), "Environment page localizes Kp geomagnetic");
  ok(pageSrc.includes('t.environment.sunrise'), "Environment page localizes sunrise");
  ok(pageSrc.includes("t.environment.syncFooter"), "Environment page localizes sync footer");

  console.log("  4. Environment components audit .................... PASS");
}

/* ------------------------------------------------- 5. WeeklyGuidanceCard Audit */
function testWeeklyGuidanceCardAudit(): void {
  const file = path.join(ROOT, "components/dashboard/WeeklyGuidanceCard.tsx");
  const src = fs.readFileSync(file, "utf8");

  ok(src.includes("isEnlEdition"), "WeeklyGuidanceCard imports isEnlEdition");
  ok(src.includes('isEn ? "en-US" : "id-ID"'), "WeeklyGuidanceCard uses en-US date formatting");
  ok(src.includes("t.earlyWeek"), "Uses localized earlyWeek");
  ok(src.includes("t.midWeek"), "Uses localized midWeek");
  ok(src.includes("t.weekend"), "Uses localized weekend");
  ok(src.includes("t.bhumiAdvice"), "Uses localized bhumiAdvice");
  ok(src.includes("t.weeklyDirection"), "Uses localized weeklyDirection");

  console.log("  5. WeeklyGuidanceCard audit ........................ PASS");
}

/* ------------------------------------------------- 6. AstroTodayCard Audit */
function testAstroTodayCardAudit(): void {
  const file = path.join(ROOT, "components/dashboard/AstroTodayCard.tsx");
  const src = fs.readFileSync(file, "utf8");

  ok(src.includes("isEnlEdition"), "AstroTodayCard imports isEnlEdition");
  ok(src.includes('isEn ? "en-US" : "id-ID"'), "AstroTodayCard formats date in en-US");
  ok(src.includes('isEn ? "in" : "di"'), "AstroTodayCard uses English preposition for transits");
  ok(src.includes('isEn ? `Moon in'), "AstroTodayCard localizes moon header");

  console.log("  6. AstroTodayCard audit ............................ PASS");
}

/* ------------------------------------------------- 7. GuardianIdentityCard Audit */
function testGuardianIdentityCardAudit(): void {
  const file = path.join(ROOT, "components/dashboard/GuardianIdentityCard.tsx");
  const src = fs.readFileSync(file, "utf8");

  ok(src.includes("isEnlEdition"), "GuardianIdentityCard imports isEnlEdition");
  ok(src.includes("Welcome to Bhumi Amartya"), "Localizes welcome greeting");
  ok(src.includes("Bhumi Founder"), "Localizes Founder badge");
  ok(src.includes("Bhumi Core Guardian"), "Localizes Core Guardian badge");
  ok(src.includes("Bhumi Guardian"), "Localizes Guardian badge");
  ok(src.includes("Bhumi Admin"), "Localizes Admin badge");
  ok(src.includes("With Bhumi since"), "Localizes recognition date");

  console.log("  7. GuardianIdentityCard audit ...................... PASS");
}

/* ------------------------------------------------- 8. HD Banners Audit */
function testHdBannersAudit(): void {
  // PendingHdRecoveryBanner
  const pendingFile = path.join(ROOT, "components/dashboard/PendingHdRecoveryBanner.tsx");
  const pendingSrc = fs.readFileSync(pendingFile, "utf8");
  ok(pendingSrc.includes("isEnlEdition"), "PendingHdRecoveryBanner imports isEnlEdition");
  ok(pendingSrc.includes("isCanonicalHumanDesign"), "PendingHdRecoveryBanner imports isCanonicalHumanDesign");
  ok(pendingSrc.includes("isCanonicalHumanDesign(nextHD)"), "Guards blueprint write with isCanonicalHumanDesign");
  ok(pendingSrc.includes("Incomplete Birth Data"), "English title for missing birth data");
  ok(pendingSrc.includes("Calculation Pending"), "English title for retriable error");
  ok(pendingSrc.includes("Calculation in Progress"), "English title for pending calculation");
  ok(pendingSrc.includes("Dismiss temporarily"), "English dismiss tooltip");

  // AccuracyUpgradeBanner
  const upgradeFile = path.join(ROOT, "components/dashboard/AccuracyUpgradeBanner.tsx");
  const upgradeSrc = fs.readFileSync(upgradeFile, "utf8");
  ok(upgradeSrc.includes("isEnlEdition"), "AccuracyUpgradeBanner imports isEnlEdition");
  ok(upgradeSrc.includes("isCanonicalHumanDesign"), "AccuracyUpgradeBanner imports isCanonicalHumanDesign");
  ok(upgradeSrc.includes("isCanonicalHumanDesign(nextHD)"), "Guards blueprint write with isCanonicalHumanDesign");
  ok(upgradeSrc.includes("Accuracy Upgrade"), "English upgrade title");
  ok(upgradeSrc.includes("Update Now"), "English upgrade CTA");

  console.log("  8. HD banners audit ................................ PASS");
}

/* ------------------------------------------------- 9. Popups & Dialogs Audit */
function testPopupsAudit(): void {
  // TrialWelcomePopup
  const trialFile = path.join(ROOT, "components/dashboard/TrialWelcomePopup.tsx");
  const trialSrc = fs.readFileSync(trialFile, "utf8");
  ok(trialSrc.includes("isEnlEdition"), "TrialWelcomePopup imports isEnlEdition");
  ok(trialSrc.includes("Welcome to Bhumi"), "English welcome title");
  ok(trialSrc.includes("Start Exploring"), "English explore CTA");
  ok(trialSrc.includes('isEn ? "Close" : "Tutup"'), "English close aria-label");

  // ReviewDialog
  const reviewFile = path.join(ROOT, "components/rating/ReviewDialog.tsx");
  const reviewSrc = fs.readFileSync(reviewFile, "utf8");
  ok(reviewSrc.includes("isEnlEdition"), "ReviewDialog imports isEnlEdition");
  ok(reviewSrc.includes("How has your journey with Bhumi been?"), "English review question");
  ok(reviewSrc.includes("Rate Bhumi"), "English rate CTA");
  ok(reviewSrc.includes("Maybe Later"), "English dismiss button");
  ok(reviewSrc.includes("Don't Show Again"), "English opt-out button");

  console.log("  9. Popups & dialogs audit .......................... PASS");
}

/* ------------------------------------------------- 10. DailyNote & AI Reminders */
function testDailyNoteAndRemindersAudit(): void {
  // DailyNoteV2
  const dnFile = path.join(ROOT, "components/dashboard/DailyNoteV2.tsx");
  const dnSrc = fs.readFileSync(dnFile, "utf8");
  ok(dnSrc.includes("isEnlEdition"), "DailyNoteV2 imports isEnlEdition");
  ok(dnSrc.includes("Today's Note"), "English Today's Note header");
  ok(dnSrc.includes("Finance & Abundance"), "English Finance section title");
  ok(dnSrc.includes("Love & Relationships"), "English Love section title");
  ok(dnSrc.includes("Today's Conclusion"), "English conclusion label");
  ok(dnSrc.includes('isEn ? "en-US" : "id-ID"'), "English date format");

  // AIReminderState
  const aiFile = path.join(ROOT, "components/dashboard/AIReminderState.tsx");
  const aiSrc = fs.readFileSync(aiFile, "utf8");
  ok(aiSrc.includes("isEnlEdition"), "AIReminderState imports isEnlEdition");
  ok(aiSrc.includes("You haven't taken a moment to ground today"), "English grounding reminder");
  ok(aiSrc.includes("journaling can be a quiet place"), "English journaling reminder");

  // PenjagaBhumiIntiBanner
  const bannerFile = path.join(ROOT, "components/dashboard/PenjagaBhumiIntiBanner.tsx");
  const bannerSrc = fs.readFileSync(bannerFile, "utf8");
  ok(bannerSrc.includes("isEnlEdition"), "PenjagaBhumiIntiBanner imports isEnlEdition");
  ok(bannerSrc.includes("Bhumi Core Guardian"), "English core guardian title");

  // DailyUserFlowGuide
  const guideFile = path.join(ROOT, "components/dashboard/DailyUserFlowGuide.tsx");
  const guideSrc = fs.readFileSync(guideFile, "utf8");
  ok(guideSrc.includes("isEnlEdition"), "DailyUserFlowGuide imports isEnlEdition");
  ok(guideSrc.includes("Choose what feels right"), "English guide heading");

  // SoulReflectionCard
  const soulFile = path.join(ROOT, "components/dashboard/SoulReflectionCard.tsx");
  const soulSrc = fs.readFileSync(soulFile, "utf8");
  ok(soulSrc.includes("isEnlEdition"), "SoulReflectionCard imports isEnlEdition");
  ok(soulSrc.includes("Soul Reflection"), "English Soul Reflection heading");

  console.log(" 10. Daily note, flow guide & reminders audit ....... PASS");
}

/* ------------------------------------------------- 11. Safety & Resources Audit */
function testSafetyAudit(): void {
  // Disclaimers
  ok(SUPPORT_DISCLAIMERS.safety_intro_en, "Has safety_intro_en disclaimer");
  ok(SUPPORT_DISCLAIMERS.safety_recommendation_en, "Has safety_recommendation_en disclaimer");
  ok(SUPPORT_DISCLAIMERS.wellness_en, "Has wellness_en disclaimer");

  // SafetyActionCard
  const file = path.join(ROOT, "components/safety/SafetyActionCard.tsx");
  const src = fs.readFileSync(file, "utf8");
  ok(src.includes("isEnlEdition"), "SafetyActionCard imports isEnlEdition");
  ok(src.includes("Support for You"), "English safety header");
  ok(src.includes("Safe Path"), "English safe path header");
  ok(src.includes("24 Hours"), "English 24 Hours tag");
  ok(src.includes("I Want Additional Support"), "English support CTA");
  ok(src.includes("I Am Okay"), "English dismiss CTA");
  ok(src.includes("safety_intro_en"), "Uses safety_intro_en");
  ok(src.includes("safety_recommendation_en"), "Uses safety_recommendation_en");

  console.log(" 11. Safety & resources audit ....................... PASS");
}

/* ------------------------------------------------- 12. Runtime Helpers Evaluation */
function testRuntimeHelpers(): void {
  eq(getAqiLabel(40, true), "Good", "getAqiLabel(40, true) returns Good");
  eq(getAqiLabel(80, true), "Moderate", "getAqiLabel(80, true) returns Moderate");
  eq(getAqiLabel(130, true), "Unhealthy for Sensitive Groups", "getAqiLabel(130, true) returns Unhealthy for Sensitive Groups");
  eq(getAqiLabel(180, true), "Unhealthy", "getAqiLabel(180, true) returns Unhealthy");
  eq(getAqiLabel(250, true), "Very Unhealthy", "getAqiLabel(250, true) returns Very Unhealthy");
  eq(getAqiLabel(350, true), "Hazardous", "getAqiLabel(350, true) returns Hazardous");

  eq(getUvLabel(1, true), "Low", "getUvLabel(1, true) returns Low");
  eq(getUvLabel(4, true), "Moderate", "getUvLabel(4, true) returns Moderate");
  eq(getUvLabel(6, true), "High", "getUvLabel(6, true) returns High");
  eq(getUvLabel(9, true), "Very High", "getUvLabel(9, true) returns Very High");
  eq(getUvLabel(12, true), "Extreme", "getUvLabel(12, true) returns Extreme");

  eq(kpActivityLabel(1, true), "Quiet", "kpActivityLabel(1, true) returns Quiet");
  eq(kpActivityLabel(2.5, true), "Unsettled", "kpActivityLabel(2.5, true) returns Unsettled");
  eq(kpActivityLabel(4, true), "Active", "kpActivityLabel(4, true) returns Active");
  eq(kpActivityLabel(6, true), "Geomagnetic storm", "kpActivityLabel(6, true) returns Geomagnetic storm");
  eq(kpActivityLabel(8, true), "Strong storm", "kpActivityLabel(8, true) returns Strong storm");

  eq(normalizeMoonPhaseLabel("newmoon", true), "New Moon", "normalizeMoonPhaseLabel returns New Moon");
  eq(normalizeMoonPhaseLabel("fullmoon", true), "Full Moon", "normalizeMoonPhaseLabel returns Full Moon");
  eq(normalizeMoonPhaseLabel("waxingcrescent", true), "Waxing Crescent", "normalizeMoonPhaseLabel returns Waxing Crescent");
  eq(normalizeMoonPhaseLabel("lastquarter", true), "Last Quarter", "normalizeMoonPhaseLabel returns Last Quarter");

  console.log(" 12. Runtime helpers evaluation ..................... PASS");
}

/* ------------------------------------------------- Runner */
function run(): void {
  console.log("Running Build 108 Sprint 2 (Dashboard & Environment) test suite:");
  testDictionaryParity();
  testDashboardClientAudit();
  testCoreIdentityInvariants();
  testEnvironmentAudit();
  testWeeklyGuidanceCardAudit();
  testAstroTodayCardAudit();
  testGuardianIdentityCardAudit();
  testHdBannersAudit();
  testPopupsAudit();
  testDailyNoteAndRemindersAudit();
  testSafetyAudit();
  testRuntimeHelpers();

  console.log(`PASS build108-sprint02-dashboard (${assertions} assertions)`);
}

run();
