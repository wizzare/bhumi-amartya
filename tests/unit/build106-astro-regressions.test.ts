/**
 * Build 106 Step 6 — Astrology regression closure (R-35, R-37, R-39, R-40, R-41).
 *
 * Pins the fixes for the known Build 105 regressions:
 *   R-37  fixed 5 western bodies via .slice(0,5)      -> variable-count relevant events
 *   R-39  hardcoded eclipse dates + countdown         -> dynamic astronomy-engine eclipses
 *   R-40  Blueprint group rendered inside Astro Today  -> removed
 *   R-35  no shared canonical Daily Astro Synthesis    -> one buildDailyAstroSynthesis object
 *   R-41  Astro is a non-diagnostic lens              -> tags describe the sky, not the user
 *
 * Runner: tsx --import ./tests/helpers/releaseTestEnv.mjs tests/unit/build106-astro-regressions.test.ts
 */
import assert from "node:assert";
import { readFileSync } from "node:fs";

let assertions = 0;
function ok(cond: unknown, msg: string): void { assertions += 1; assert.ok(cond, msg); }
function eq<T>(a: T, b: T, msg: string): void { assertions += 1; assert.strictEqual(a, b, msg); }

async function run(): Promise<void> {
  const cardSrc = readFileSync("components/dashboard/AstroTodayCard.tsx", "utf8");
  const eventsSrc = readFileSync("lib/data/astronomicalEvents.ts", "utf8");
  const awarenessSrc = readFileSync("lib/engines/astroAwarenessEngine.ts", "utf8");
  const dailyCtxSrc = readFileSync("lib/dailyContext/buildDailyContext.ts", "utf8");

  /* ---------------- R-37: no fixed western-body slice ---------------- */
  ok(!/sky\.bodies[\s\S]{0,120}\.slice\(0,\s*5\)/.test(cardSrc), "R-37: AstroTodayCard no longer slices sky.bodies to 5");
  ok(cardSrc.includes("synthesis.westernEvents"), "R-37: AstroTodayCard renders synthesis.westernEvents (variable count)");
  ok(cardSrc.includes("relevantEventsCount"), "R-37: western group summary is a variable count label");

  // Behavioural variable-count proof lives in v5-astro-core.test.ts
  // ("quiet day yields ZERO events (no slice(0,5) padding)"). Here we pin the
  // relevance contract shape + that the card wiring changed.
  const { computeAspects, ASPECT_ORB_LIMIT, selectRelevantWesternEvents } =
    await import("../../lib/astrology/relevantWesternEvents.ts");
  eq(ASPECT_ORB_LIMIT, 6, "aspect orb limit is 6 degrees");
  eq(computeAspects({ Sun: 0, Mars: 0.5 }).length, 1, "conjunction within orb detected");
  eq(computeAspects({ Sun: 0, Mars: 45 }).length, 0, "45deg is not a major aspect");
  ok(typeof selectRelevantWesternEvents === "function", "selectRelevantWesternEvents is the variable-count selector consumed by the synthesis");

  /* ---------------- R-39: dynamic eclipses, no hardcoded dates ---------------- */
  ok(!/export const KNOWN_ECLIPSES/.test(eventsSrc), "R-39: the KNOWN_ECLIPSES hardcoded array is retired from astronomicalEvents.ts");
  ok(!/\{\s*id:\s*"eclipse_solar_2026/.test(eventsSrc), "R-39: no hardcoded eclipse entries remain in astronomicalEvents.ts");
  ok(!/2026-08-12|2026-08-28|12 Agustus 2026|28 Agustus 2026/.test(cardSrc), "R-39: AstroTodayCard has no hardcoded eclipse dates");
  ok(awarenessSrc.includes("buildUpcomingEclipseEvents"), "R-39: astroAwarenessEngine computes eclipses dynamically");
  ok(!/daysUntil\("2026/.test(cardSrc), "R-39: no hardcoded eclipse countdown");

  const { findNextGlobalEclipse, findNextVisibleEclipse } = await import("../../lib/astrology/calculateEclipses.ts");
  const now = new Date("2026-06-01T00:00:00Z");
  const g = findNextGlobalEclipse(now);
  ok(g && g.peakUtc.getTime() > now.getTime(), "R-39: next global eclipse is computed and in the future");
  ok(g && (g.kind === "solar" || g.kind === "lunar"), "R-39: eclipse has a real kind");
  eq(findNextVisibleEclipse(now, null), null, "R-39: no observer coords -> visibility is null (honest unavailable, D-V5-29)");

  /* ---------------- R-40: no Blueprint group inside Astro Today ---------------- */
  ok(!cardSrc.includes('title: "Menyentuh Blueprint-mu Hari Ini"'), "R-40: the 'Menyentuh Blueprint-mu' group is removed from Astro Today");
  ok(!/id:\s*"blueprint"/.test(cardSrc), "R-40: no blueprint group id in the Astro Today groups");
  ok(!/from "lucide-react"[\s\S]*\bZap\b/.test(cardSrc.split("\n")[3] || ""), "R-40: unused Zap icon import removed");

  /* ---------------- R-35: one canonical Daily Astro Synthesis ---------------- */
  const { buildDailyAstroSynthesis, astroContextFromSynthesis, ASTRO_SYNTHESIS_SOURCE_VERSION } =
    await import("../../lib/astrology/dailyAstroSynthesis.ts");
  ok(cardSrc.includes("buildDailyAstroSynthesis"), "R-35: AstroTodayCard consumes buildDailyAstroSynthesis");
  const synth = buildDailyAstroSynthesis({ uid: "astro-uid", profileTimezone: "Asia/Jakarta", now: new Date("2026-08-25T05:00:00Z") });
  ok(synth.sky && synth.moonPhase && Array.isArray(synth.westernEvents) && synth.eastern && synth.eclipses, "R-35: synthesis has sky/moon/western/eastern/eclipses in one object");
  eq(synth.sourceVersion, ASTRO_SYNTHESIS_SOURCE_VERSION, "R-35: synthesis stamps its source version");
  eq((synth.majorCycles as any).openScope, true, "R-35/D-V5-26: major-cycle scope is explicitly open (no invented signals)");
  ok(synth.eastern.tzolkin !== undefined && synth.eastern.weton !== undefined, "R-38: current-day Tzolkin/Weton present in the synthesis");

  /* ---------------- R-41: lens tags describe the SKY, never the user ---------------- */
  const ctx = astroContextFromSynthesis(synth);
  ok(["low", "moderate", "high"].includes(ctx.astroIntensity!), "R-41: astroIntensity is a sky descriptor enum");
  ok(ctx.retrogradeTags!.every((t) => t.endsWith("-retrograde")), "R-41: retrograde tags name a body's motion, not a diagnosis");
  ok(!/depresi|disorder|kamu (sedang|akan)|you (are|will) (feel|be)/i.test(JSON.stringify(ctx)), "R-41: no diagnostic / user-state language in the astro context");
  eq(ctx.validForLocalDate, synth.dateKey, "R-41: context is scoped to the synthesis date");

  /* ---------------- DS-DC1 closed: buildDailyContext uses the real type ---------------- */
  ok(dailyCtxSrc.includes('import type { DailyAstroSynthesis } from "@/lib/astrology/dailyAstroSynthesis"'), "DS-DC1: buildDailyContext imports the real DailyAstroSynthesis type");
  ok(!/type DailyAstroSynthesis = any/.test(dailyCtxSrc), "DS-DC1: the local `= any` stub is gone");

  console.log(`PASS build106-astro-regressions (${assertions} assertions)`);
}

run().then(
  () => process.exit(0),
  (error) => { console.error(error); process.exit(1); },
);
