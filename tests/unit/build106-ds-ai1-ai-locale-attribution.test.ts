/**
 * Build 106 — DS-AI1: R-PRD-31 (AI content renders in the user locale, with
 * source attribution / companion-not-authority framing).
 *
 * Two halves:
 *  - Journal AI path (already locale-aware): behavioral — generateJournalAIResponse
 *    returns locale-matched reflective text with `provenance: "ai-insight"`, and
 *    crisis input is suppressed with `provenance: "none"`.
 *  - Daily-guidance path (this step's fix): the single funnel
 *    buildDailyGuidancePrompt now emits an outputLanguageRule keyed to the user's
 *    locale that overrides the legacy "(Bahasa Indonesia)" schema hints, plus an
 *    attributionRule; and the id/en/ms locale is carried end to end
 *    (route -> service -> engine -> AIGateway -> prompt registry) instead of
 *    collapsing to id. Verified as a source-invariant guard — rendered en/ms
 *    dashboard output remains RC-9 (browser, Step 11), NOT marked PASS here.
 *
 * Evidence class: STRONG_UNIT (journal) + STATIC_GUARD (daily-guidance plumbing).
 */
import fs from "node:fs";
import { generateJournalAIResponse } from "../../lib/journal/journalAIContract.ts";

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

// ---------------------------------------------------------------------------
// 1. Journal AI path — behavioral (locale + attribution already implemented)
// ---------------------------------------------------------------------------
const idResp = generateJournalAIResponse({ journalType: "FREE", content: "Hari ini terasa berat tapi aku bertahan.", locale: "id" });
ok("journal AI (id): reflective text produced", !!idResp.reflectiveText && idResp.reflectiveText.trim().length > 0);
ok("journal AI (id): attributed as ai-insight", idResp.provenance === "ai-insight" && idResp.suppressed === false);
ok("journal AI (id): tentative / non-authoritative phrasing", /kemungkinan|mungkin/i.test(idResp.reflectiveText || ""));

const enResp = generateJournalAIResponse({ journalType: "EMOTION", content: "Today felt heavy but I kept going.", locale: "en" });
ok("journal AI (en): reflective text produced", !!enResp.reflectiveText && enResp.reflectiveText.trim().length > 0);
ok("journal AI (en): English output, not Indonesian", /\b(one possible reflection|there may be|you)\b/i.test(enResp.reflectiveText || "") && !/kamu bisa menyimpan/i.test(enResp.reflectiveText || ""));
ok("journal AI (en): attributed as ai-insight", enResp.provenance === "ai-insight");

const msResp = generateJournalAIResponse({ journalType: "GUIDED", content: "Hari ini terasa berat tetapi saya teruskan juga.", locale: "ms" });
ok("journal AI (ms): reflective text produced", !!msResp.reflectiveText && msResp.reflectiveText.trim().length > 0);
ok("journal AI (ms): Malay output (anda), not id (kamu)", /\banda\b/i.test(msResp.reflectiveText || "") && !/\bkamu\b/i.test(msResp.reflectiveText || ""));
ok("journal AI (ms): attributed as ai-insight", msResp.provenance === "ai-insight");

const crisisResp = generateJournalAIResponse({ journalType: "FREE", content: "kadang aku ingin mati saja", locale: "id" });
ok("journal AI (crisis): suppressed, no AI text", crisisResp.suppressed === true && !crisisResp.reflectiveText);
ok("journal AI (crisis): provenance none (no fabricated attribution)", crisisResp.provenance === "none" && crisisResp.reason === "crisis");

// ---------------------------------------------------------------------------
// 2. Daily-guidance path — source-invariant guard
// ---------------------------------------------------------------------------
const promptSrc = fs.readFileSync("lib/prompts/dailyGuidancePrompt.ts", "utf8");
const registrySrc = fs.readFileSync("lib/ai/prompts/registry.ts", "utf8");
const engineSrc = fs.readFileSync("lib/engines/dailyGuidanceEngine.ts", "utf8");
const routeSrc = fs.readFileSync("app/api/ai/daily-guidance/route.ts", "utf8");
const serviceSrc = fs.readFileSync("lib/services/dailyGuidanceService.ts", "utf8");
const inputTypeSrc = fs.readFileSync("lib/orchestrators/types.ts", "utf8");
const contextTypeSrc = fs.readFileSync("lib/dailyGuidance/types.ts", "utf8");

ok(
  "prompt: OUTPUT_LANGUAGE_NAMES covers id/en/ms",
  /OUTPUT_LANGUAGE_NAMES[\s\S]{0,120}id:\s*"Bahasa Indonesia"[\s\S]{0,80}en:\s*"English"[\s\S]{0,80}ms:\s*"Bahasa Melayu"/.test(promptSrc),
);
ok(
  "prompt: emits an outputLanguageRule keyed to the user's locale (not hardcoded id)",
  /outputLanguageRule:\s*[\s\S]{0,400}\$\{outputLanguageName\}[\s\S]{0,200}\$\{outputLanguage\}/.test(promptSrc),
);
ok(
  "prompt: outputLanguageRule explicitly OVERRIDES the (Bahasa Indonesia) schema hints",
  /OVERRIDES any "\(Bahasa Indonesia\)" hint/.test(promptSrc),
);
ok(
  "prompt: attributionRule frames output as reflective AI companion, not authority",
  /attributionRule:\s*[\s\S]{0,300}(not authoritative|not an? .*oracle|reflective AI companion)/i.test(promptSrc),
);
ok(
  "prompt: R-PRD-31 referenced",
  /R-PRD-31/.test(promptSrc),
);

ok(
  "registry: carries the true locale (id/en/ms) into buildDailyGuidancePrompt",
  /buildDailyGuidancePrompt\(\{[\s\S]{0,120}language:\s*language === "en" \? "en" : language === "ms" \? "ms" : "id"/.test(registrySrc),
);
ok(
  "engine: user's true locale passed to AIGateway (not collapsed before the prompt)",
  /uiLanguage[\s\S]{0,200}context\.language === "ms" \? "ms"/.test(engineSrc) &&
    /generateStructuredJson<[\s\S]{0,120}language:\s*uiLanguage/.test(engineSrc),
);
ok(
  "route: request locale normalized to id/en/ms (ms preserved, not -> id)",
  /body\.language\.startsWith\("ms"\)\s*\n?\s*\?\s*"ms"/.test(routeSrc),
);
ok(
  "service: profile locale normalized to id/en/ms (ms preserved)",
  /profile\.language\.startsWith\("ms"\)/.test(serviceSrc),
);
ok(
  "types: DailyGuidanceInput.language and DailyGuidanceContext.language include ms",
  /language:\s*"id"\s*\|\s*"en"\s*\|\s*"ms"/.test(inputTypeSrc) &&
    /language:\s*"id"\s*\|\s*"en"\s*\|\s*"ms"/.test(contextTypeSrc),
);

// ---------------------------------------------------------------------------
// 3. Attribution data model already present on the guidance record
// ---------------------------------------------------------------------------
ok(
  "DailyGuidance record carries a source attribution field (ai | fallback | local-fallback)",
  /source:\s*"ai"\s*\|\s*"fallback"\s*\|\s*"local-fallback"/.test(contextTypeSrc),
);

// ---------------------------------------------------------------------------
// 4. Native Bahasa Melayu in the deterministic synthesis / practice output
// ---------------------------------------------------------------------------
{
  const { buildUnifiedBlueprintSynthesis } = require("../../lib/dailyGuidance/unifiedBlueprintSynthesis.ts");
  const synMs = buildUnifiedBlueprintSynthesis({ language: "ms", profile: null, blueprint: null });
  const synId = buildUnifiedBlueprintSynthesis({ language: "id", profile: null, blueprint: null });
  const synEn = buildUnifiedBlueprintSynthesis({ language: "en", profile: null, blueprint: null });

  ok(
    "synthesis(ms).blueprintSummary is Bahasa Melayu (anda / apabila), not id (kamu) and not en",
    /\banda\b/i.test(synMs.blueprintSummary) &&
      /apabila|boleh dilakukan|kekal/i.test(synMs.blueprintSummary) &&
      !/\bkamu\b/i.test(synMs.blueprintSummary),
  );
  ok(
    "synthesis(ms) differs from synthesis(id) and synthesis(en)",
    synMs.blueprintSummary !== synId.blueprintSummary && synMs.blueprintSummary !== synEn.blueprintSummary,
  );
  ok("synthesis(en).blueprintSummary is English", /Today may feel|Let the day stay practical/.test(synEn.blueprintSummary));

  const { generateAdaptiveDailyPractices } = require("../../lib/dailyGuidance/adaptiveDailyPracticeGenerator.ts");
  const ctx = { dailyVariationSeed: "2026-09-02", completionRateYesterday: 0, streakDays: 0, adaptiveTone: "steady_supportive" };
  const pMs = generateAdaptiveDailyPractices({ date: "2026-09-02", language: "ms", profile: null, blueprint: null, adaptiveContext: ctx });
  const pId = generateAdaptiveDailyPractices({ date: "2026-09-02", language: "id", profile: null, blueprint: null, adaptiveContext: ctx });
  const msJoined = pMs.map((p: any) => `${p.title} ${p.description}`).join(" \n ");
  ok(
    "adaptive practices (ms) render Bahasa Melayu (kedua-dua / namakan / amalan / kelihatan)",
    /kedua-dua|namakan|amalan|kelihatan|perkataan|tugasan/i.test(msJoined),
  );
  ok(
    "adaptive practices (ms) differ from (id)",
    msJoined !== pId.map((p: any) => `${p.title} ${p.description}`).join(" \n "),
  );
}

// pickLocale helper contract
{
  const { pickLocale } = require("../../lib/i18n/pickLocale.ts");
  ok("pickLocale ms uses ms value when supplied", pickLocale("ms", { id: "A", en: "B", ms: "C" }) === "C");
  ok("pickLocale ms falls back to en when ms missing (D-V5-35 chain)", pickLocale("ms", { id: "A", en: "B" }) === "B");
  ok("pickLocale en/id resolve directly", pickLocale("en", { id: "A", en: "B" }) === "B" && pickLocale("id", { id: "A", en: "B" }) === "A");
  ok("pickLocale accepts BCP47 tags", pickLocale("ms-MY", { id: "A", en: "B", ms: "C" }) === "C" && pickLocale("en-US", { id: "A", en: "B" }) === "B");
}

console.log(
  `\nBUILD106_DS_AI1_${failed === 0 ? "PASS" : "FAIL"} assertions=${passed} failed=${failed}`,
);
process.exit(failed === 0 ? 0 : 1);
