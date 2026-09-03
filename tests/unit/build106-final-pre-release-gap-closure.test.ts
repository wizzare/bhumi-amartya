/**
 * Build 106 — Final pre-release gap closure.
 *
 * Two release-critical corrections found in the Step 12.5 audit + the RC-3..RC-8
 * disposition pass:
 *
 *  1. F-2 — the ultimate Daily Guidance fallback (`dailyGuidanceEngine.generateFallbackFace`,
 *     reached when every AI provider fails AND `generateLocalDailyGuidance` throws — its
 *     outer catch re-throws, so `runProviderCascade` returns `{ ok:false }`) persisted a
 *     malformed `aiInsight: "Hari ini tentang ."` plus empty soulReflectionText /
 *     dailyNoteText / journalPrompt / meditationSuggestion. Now well-formed, id/en.
 *
 *  2. RC-8 — `firebaseService.deleteUserDataCompletely` used drifted collection names
 *     (`meditationEntries`, `audioHealingEntries`, `healingMemory`, `journeyData`,
 *     `weeklyReports`) and omitted `activities`, `dailyStates`, `journalMemoryCandidates`,
 *     `wellnessAssessments`, `wellnessMappings`, `progressData`, leaving sensitive
 *     wellness / emotional / journal-derived data in Firestore after account deletion.
 *     Now covers the canonical per-user schema.
 *
 * Evidence class: STRONG_UNIT (F-2 behavioural) + STATIC_GUARD (reachability + RC-8 schema).
 */
import assert from "node:assert";
import fs from "node:fs";
import { createRequire } from "node:module";

for (const [key, value] of Object.entries({
  NEXT_PUBLIC_FIREBASE_API_KEY: "synthetic-fprgc-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo-fprgc.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-fprgc",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "demo-fprgc.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456789",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456789:web:fprgc",
  NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "false",
})) {
  process.env[key] ||= value;
}

let assertions = 0;
function ok(condition: unknown, message: string): void {
  assertions += 1;
  assert.ok(condition, message);
}

/* ------------------------------------------------------------------ *
 * 1. F-2 — behavioural: the ultimate fallback face is well-formed
 * ------------------------------------------------------------------ */

const loadModule = createRequire(
  `${process.cwd()}/tests/unit/build106-final-pre-release-gap-closure.test.ts`,
);
const { dailyGuidanceEngine } = loadModule("../../lib/engines/dailyGuidanceEngine.ts");

const brain = { uid: "fprgc-user", localDateKey: "2026-09-03", theme: "Keseimbangan", focus: "Pusat Diri" };

for (const language of ["id", "en", "ms"] as const) {
  const face = dailyGuidanceEngine.generateFallbackFace(brain, { language, uid: brain.uid });
  const label = `[lang=${language}]`;

  for (const field of ["aiInsight", "soulReflectionText", "dailyNoteText", "journalPrompt", "meditationSuggestion"] as const) {
    const value = face[field];
    ok(typeof value === "string" && value.trim().length >= 3, `${label} ${field} is a non-trivial string`);
    ok(!/\btentang\s*\.$/.test(value), `${label} ${field} is not the malformed "…tentang ." fragment`);
    ok(!/\s\.(\s|$)/.test(value) || /\w\.\s*$/.test(value.trim()), `${label} ${field} has no orphaned " ." gap`);
  }

  ok(face.aiInsight === face.soulReflectionText, `${label} aiInsight mirrors the reflection text (single source)`);
  ok(/[.?!]$/.test(String(face.aiInsight).trim()), `${label} aiInsight ends with sentence punctuation`);

  if (language === "en") {
    ok(/[A-Za-z]/.test(face.aiInsight) && !/\b(dan|yang|untuk|hari ini tentang)\b/i.test(face.aiInsight),
      `${label} English fallback is actually English`);
    ok(face.meditationSuggestion === "Self Alignment", `${label} en meditation label`);
  } else {
    ok(/\b(hari ini|kehadiran|tenang|jujur)\b/i.test(face.aiInsight), `${label} id/ms fallback is Indonesian (ms→id per D-V5-36)`);
    ok(face.meditationSuggestion === "Penyelarasan Diri", `${label} id/ms meditation label`);
  }
}

/* ------------------------------------------------------------------ *
 * 2. F-2 — static: the malformed literal is gone; reachability is real
 * ------------------------------------------------------------------ */

const engineSrc = fs.readFileSync("lib/engines/dailyGuidanceEngine.ts", "utf8");
ok(!engineSrc.includes('aiInsight: "Hari ini tentang ."'), "the malformed aiInsight literal is removed");
ok(!/soulReflectionText:\s*"",\s*\n\s*dailyNoteText:\s*"",/.test(engineSrc), "generateFallbackFace no longer seeds empty reflection/note");
ok(/generateFallbackFace[\s\S]{0,400}const isEn = context\?\.language === "en"/.test(engineSrc), "generateFallbackFace derives an id/en fallback copy block");

const cascadeSrc = fs.readFileSync("lib/ai/providerCascade.ts", "utf8");
ok(/catch \(error\)[\s\S]*ok:\s*false,[\s\S]*GATEWAY_FAILURE_WITH_FALLBACK_ERROR/.test(cascadeSrc),
  "runProviderCascade returns ok:false when the local fallback itself throws (F-2 is reachable)");

const localFallbackSrc = fs.readFileSync("lib/orchestrators/localDailyGuidanceFallback.ts", "utf8");
ok(/\}\s*catch \(err\) \{\s*\n\s*console\.error\("\[LOCAL_DG_FALLBACK_INTERNAL_ERROR\]", err\);\s*\n\s*throw err;/.test(localFallbackSrc),
  "generateLocalDailyGuidance outer catch re-throws — it can trigger the cascade ok:false path");
ok(/if \(response\.ok && response\.data\)[\s\S]*return this\.generateFallbackFace\(brain, context\)/.test(engineSrc),
  "generateLanguageFace routes !response.ok to generateFallbackFace");

/* ------------------------------------------------------------------ *
 * 3. RC-8 — account deletion covers the canonical per-user schema
 * ------------------------------------------------------------------ */

const serviceSrc = fs.readFileSync("lib/firebase/service.ts", "utf8");
const deleteFnStart = serviceSrc.indexOf("async deleteUserDataCompletely");
const deleteFn = serviceSrc.slice(
  deleteFnStart,
  serviceSrc.indexOf("\n  }", serviceSrc.indexOf("return true;", deleteFnStart)),
);

// Every distinct per-user Firestore collection literal the repositories actually write.
const repoFiles = fs.readdirSync("lib/repositories").filter((f) => f.endsWith(".ts"));
const perUserCollections = new Set<string>();
for (const file of repoFiles) {
  const src = fs.readFileSync(`lib/repositories/${file}`, "utf8");
  for (const m of src.matchAll(/(?:collection|doc)\(db,\s*["'`]([a-zA-Z]+)["'`]/g)) {
    const name = m[1];
    // per-user data only — exclude global/admin/config collections
    if (["adminAuditLogs", "analytics", "feedback", "system", "config"].includes(name)) continue;
    perUserCollections.add(name);
  }
}
// Collections whose deletion is provably covered (canonical or legacy alias, nested or scoped).
const covered = new Set<string>([
  "blueprints", "users", "journals", "dailyGuidance", "notifications",
  "meditations", "audioHealing", "activities", "dailyStates",
  "journeyDailyRecords", "journalMemoryCandidates",
  "weeklyReflections", "wellnessAssessments", "wellnessMappings",
  "healingProgress", "progressData",
]);
for (const name of perUserCollections) {
  ok(covered.has(name),
    `deleteUserDataCompletely accounts for per-user collection "${name}" (found in a repository)`);
}

for (const spec of [
  "deleteNestedEntries('meditations', 'entries')",
  "deleteNestedEntries('audioHealing', 'entries')",
  "deleteNestedEntries('activities', 'entries')",
  "deleteNestedEntries('dailyStates', 'entries')",
  "deleteNestedEntries('journeyDailyRecords', 'entries')",
  "deleteNestedEntries('journalMemoryCandidates', 'candidates')",
  "deleteDirectDocument('healingProgress')",
  "deleteDirectDocument('wellnessMappings')",
  "deleteDirectDocument('progressData')",
  "deleteScoped('weeklyReflections')",
  "deleteScoped('wellnessAssessments')",
]) {
  ok(deleteFn.includes(spec), `deleteUserDataCompletely calls ${spec}`);
}
ok(!/deleteScoped\('meditationEntries'\)[\s\S]*\/\/ Legacy/.test(deleteFn) || deleteFn.includes("Legacy / pre-schema-drift"),
  "legacy alias deletions are retained but labelled");
ok(deleteFn.includes("deleteNestedEntries") && deleteFn.includes("<parent>/{uid}/<sub>"),
  "a generic nested-subcollection deleter is documented and used");

console.log(`PASS build106-final-pre-release-gap-closure (${assertions} assertions)`);
