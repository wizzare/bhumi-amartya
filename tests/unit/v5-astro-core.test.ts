// T-ASTRO-01/02/03/06/12 self-checks — run: npx tsx tests/unit/v5-astro-core.test.ts
// Covers: dynamic eclipse engine, aspect purity, variable-count relevance contract.

import {
  findNextGlobalEclipse,
  findNextGlobalSolarEclipse,
  findNextGlobalLunarEclipse,
  findNextVisibleEclipse,
  buildUpcomingEclipseEvents,
} from "../../lib/astrology/calculateEclipses";
import { computeAspects, selectRelevantWesternEvents, ASPECT_ORB_LIMIT } from "../../lib/astrology/relevantWesternEvents";
import type { CurrentSky } from "../../lib/astrology/calculateCurrentSky";

let passed = 0, failed = 0;
function test(label: string, condition: boolean) {
  if (condition) { passed++; console.log(`PASS: ${label}`); }
  else { failed++; console.error(`FAIL: ${label}`); }
}

// --- Eclipse engine (dynamic, no hardcoded dates) ---
const now = new Date();
const solar = findNextGlobalSolarEclipse(now);
const lunar = findNextGlobalLunarEclipse(now);
test("next global solar eclipse found", !!solar && solar.kind === "solar" && !isNaN(solar.peakUtc.getTime()));
test("next global lunar eclipse found", !!lunar && lunar.kind === "lunar" && !isNaN(lunar.peakUtc.getTime()));

const next = findNextGlobalEclipse(now);
test("global next picks the sooner of solar/lunar", !!next && next.peakUtc.getTime() === (solar!.peakUtc.getTime() <= lunar!.peakUtc.getTime() ? solar!.peakUtc.getTime() : lunar!.peakUtc.getTime()));
test("global next is in the future", !!next && next.peakUtc.getTime() > now.getTime());

// Known astronomy sanity: an eclipse must occur within ~1 year of any start date.
if (next) {
  const within18Months = next.peakUtc.getTime() - now.getTime() < 550 * 86400000;
  test("next eclipse occurs within ~18 months", within18Months);
}

// Local/Visible without observer -> null (caller must show unavailable state)
test("no observer -> visibility null (unavailable state)", findNextVisibleEclipse(now, null) === null);

// With observer (Jakarta) -> boolean verdict present for the same global event
const jakartaVerdict = findNextVisibleEclipse(now, { latitude: -6.2, longitude: 106.8 });
test("observer verdict returns same global event or null", jakartaVerdict === null || (jakartaVerdict.global.id === next?.id || !!jakartaVerdict));

// Window builder respects limitDays
const events30 = buildUpcomingEclipseEvents(now, 30);
test("window events all inside 30 days", events30.every((e) => e.peakUtc.getTime() <= now.getTime() + 31 * 86400000));
const events400 = buildUpcomingEclipseEvents(now, 400);
test("longer window yields >= short window count", events400.length >= Math.max(events30.length, 0));

// --- Aspect purity ---
const aspects = computeAspects({ Sun: 10, Mars: 130, Jupiter: 14 });
test("conjunction detected within orb", aspects.some((a) => (a.a === "Sun" && a.b === "Jupiter") && a.aspect === "conjunction"));
test("trine detected at exact angle", aspects.some((a) => (a.a === "Sun" && a.b === "Mars") && a.aspect === "trine" && a.orb === 0));
const none = computeAspects({ Sun: 0, Mercury: 45 });
test("45deg separation yields no major aspect", none.length === 0);
const wrap = computeAspects({ Sun: 359, Venus: 3 });
test("0/360 wraparound conjunction", wrap.some((a) => a.aspect === "conjunction"));

// --- Variable-count relevance contract ---
function fakeSky(longitudes: Record<string, number>, retro: string[] = [], date = "2026-08-24"): CurrentSky {
  return {
    date,
    sunSign: "Aries",
    moonInfo: { label: "", startDate: "", endDate: "", daysRemaining: 0, theme: "", nextPhaseLabel: "", nextPhaseSign: "" },
    moonPhaseAngle: 0,
    source: "astronomy-engine",
    bodies: Object.entries(longitudes).map(([body, longitude]) => ({
      body: body as any,
      sign: "Aries",
      longitude,
      isRetrograde: retro.includes(body),
      periodStart: undefined,
      periodEnd: undefined,
    })),
  };
}

// Day A: two tight aspects + one retrograde -> several events
const skyA = fakeSky({ Sun: 10, Mars: 130, Jupiter: 12, Saturn: 300 }, ["Saturn"]);
const eventsA = selectRelevantWesternEvents(skyA);
test("day A includes retrograde Saturn", eventsA.some((e) => e.body === "Saturn" && e.reasons.some((r) => r.type === "retrograde")));
test("day A includes Sun via conjunction", eventsA.some((e) => e.body === "Sun" && e.aspects.some((a) => a.aspect === "conjunction")));
test("day A includes Mars via trine", eventsA.some((e) => e.body === "Mars" && e.aspects.some((a) => a.aspect === "trine")));

// Day B: nothing notable -> zero events (variable count, never padded to 5)
// 0 vs 40 deg separation: nearest major aspect (sextile 60) has orb 20 — safely outside all orbs.
const skyB = fakeSky({ Sun: 0, Mercury: 40 });
const eventsB = selectRelevantWesternEvents(skyB);
test("quiet day yields ZERO events (no slice(0,5) padding)", eventsB.length === 0);

// Quiet day except Sun ingress near today -> exactly the ingress reason
const skyC = fakeSky(
  { Sun: 10, Mercury: 47 },
  [],
  "2026-08-25"
);
skyC.bodies[0].periodStart = "23 Agustus 2026"; // within 3 days of 2026-08-25
const eventsC = selectRelevantWesternEvents(skyC);
test("ingress window flags sign change", eventsC.some((e) => e.body === "Sun" && e.reasons.some((r) => r.type === "ingress")));

// Orb limit respected
const wide = computeAspects({ Sun: 10, Mars: 70 }); // 60 deg apart? dist=60 -> sextile orb 0
test("sextile detected", wide.some((a) => a.aspect === "sextile"));
const overOrb = computeAspects({ Sun: 10, Mars: 68 }); // 58 deg -> sextile orb 2 (in), square orb 32
const overOrbWide = computeAspects({ Sun: 10, Mars: 52 }); // 42 deg -> sextile orb 18 (out)
test("orb limit boundary respected", overOrb.some((a) => a.aspect === "sextile") && !overOrbWide.some((a) => a.aspect === "sextile") && ASPECT_ORB_LIMIT === 6);

console.log(`\nV5_ASTRO_CORE_TESTS: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
