// T-ASTRO-04/07 synthesis self-checks — run: npx tsx tests/unit/v5-daily-synthesis.test.ts
import { buildDailyAstroSynthesis, astroContextFromSynthesis, ASTRO_SYNTHESIS_SOURCE_VERSION } from "../../lib/astrology/dailyAstroSynthesis";
import { getCanonicalToday, getYesterdayCanonical } from "../../lib/dailyGuidance/canonicalToday";

let passed = 0, failed = 0;
function test(label: string, condition: boolean) {
  if (condition) { passed++; console.log(`PASS: ${label}`); }
  else { failed++; console.error(`FAIL: ${label}`); }
}

const fixedNow = new Date("2026-08-24T04:00:00Z");
const s = buildDailyAstroSynthesis({ uid: "SYNTHETIC", profileTimezone: "Asia/Jakarta", now: fixedNow });

test("dateKey follows profile timezone (Jakarta -> same day 11:00)", s.dateKey === "2026-08-24");
test("timezone resolved from profile", s.timezone === "Asia/Jakarta");
test("calculationInstant preserves instant", s.calculationInstant.getTime() === fixedNow.getTime());
test("moonPhase present with label+theme", !!s.moonPhase.label && !!s.moonPhase.theme);
test("moonSign present", typeof s.moonPhase.sign === "string" && s.moonPhase.sign.length > 0);
test("westernEvents is variable-count array", Array.isArray(s.westernEvents));
test("eastern tzolkin current-day computed", !!s.eastern.tzolkin && s.eastern.tzolkin.kin >= 1 && s.eastern.tzolkin.kin <= 260);
test("eastern weton current-day computed", !!s.eastern.weton && /\w+\s+\w+/.test(s.eastern.weton.weton));
test("eclipse globalNext found and future", !!s.eclipses.globalNext && s.eclipses.globalNext.peakUtc.getTime() > fixedNow.getTime());
test("local visibility honest without observer", s.eclipses.localAvailable === false && s.eclipses.localVisible === null);
test("majorCycles marked open scope", s.majorCycles.openScope === true);
test("sourceVersion stamped", s.sourceVersion === ASTRO_SYNTHESIS_SOURCE_VERSION);

// Timezone boundary: UTC 20:00 -> Jakarta is NEXT day, UTC key differs
const sLate = buildDailyAstroSynthesis({ profileTimezone: "Asia/Jakarta", now: new Date("2026-08-24T17:30:00Z") });
const sUtc = buildDailyAstroSynthesis({ profileTimezone: "UTC", now: new Date("2026-08-24T17:30:00Z") });
test("canonical date respects timezone boundary", sLate.dateKey === "2026-08-25" && sUtc.dateKey === "2026-08-24");

// Determinism: same inputs -> identical dateKey & event count
const again = buildDailyAstroSynthesis({ uid: "SYNTHETIC", profileTimezone: "Asia/Jakarta", now: fixedNow });
test("deterministic for same inputs", again.dateKey === s.dateKey && again.westernEvents.length === s.westernEvents.length);

// --- Wellness adapter contract ---
const ctx = astroContextFromSynthesis(s);
test("astroContext.moonPhase mirrors label", ctx.moonPhase === s.moonPhase.label);
test("astroContext.moonSign mirrors sign", ctx.moonSign === s.moonPhase.sign);
test("validForLocalDate = synthesis dateKey", ctx.validForLocalDate === s.dateKey);
test("retrogradeTags end with -retrograde", (ctx.retrogradeTags || []).every((t) => t.endsWith("-retrograde")));
test("aspectTags only canonical aspect names", (ctx.aspectTags || []).every((t) => ["conjunction","sextile","square","trine","opposition"].some((n) => t.includes(n))));
test("intensity within enum", ["low","moderate","high"].includes(ctx.astroIntensity || ""));
test("quiet sky -> low intensity", (() => {
  const quiet = { ...s, westernEvents: [] };
  return astroContextFromSynthesis(quiet).astroIntensity === "low" && (astroContextFromSynthesis(quiet).majorTransitTags || []).length === 0;
})());

// CanonicalToday sanity (T-ASTRO-10)
const c = getCanonicalToday({ uid: "U", profileTimezone: "Asia/Jakarta", now: fixedNow });
const y = getYesterdayCanonical({ uid: "U", profileTimezone: "Asia/Jakarta", now: fixedNow });
test("yesterday = today - 1 in key space", y.localDateKey === "2026-08-23");

console.log(`\nV5_DAILY_SYNTHESIS_TESTS: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
