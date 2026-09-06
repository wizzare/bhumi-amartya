/**
 * BUILD 108 ENL — CDI-108-01 (Chiron / natal ephemeris accuracy) deterministic test.
 *
 * Verifies the CDI-108-01 contract from BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md §C:
 *
 *   1. The removed linear model is gone from source, and its output is provably
 *      wrong (wrong sign for most fixtures, >5° longitude error).
 *   2. chironLongitudeAt() (Swiss Ephemeris table + Catmull-Rom) matches the
 *      authoritative reference within <0.01°, and fails closed out of range.
 *   3. calculateNatalBasics() emits an accurate ephemeris Chiron, genuine Whole
 *      Sign houses, NO synthesised Placidus, and an explicit accuracy contract.
 *   4. calculateNatalBasicsAsync() fails closed: a dead ephemeris service never
 *      downgrades Chiron or invents Placidus.
 *   5. Placidus and Whole Sign are genuinely distinct systems.
 *   6. Persistence preserves a stored Chiron when a regeneration is not
 *      ephemeris-accurate (no silent blanking / downgrade).
 *   7. Routing (getAstrologyApiUrl) resolves per environment; the proxy exists.
 *
 * No network. node:assert/strict — a failed assertion throws -> exit 1.
 * Runner: npx tsx tests/unit/build108-cdi01-chiron-natal-accuracy.test.ts
 */
import "../helpers/initTestEnv.ts";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { chironLongitudeAt, chironIsRetrograde, CHIRON_EPHEMERIS_META } from "../../lib/astrology/chironEphemeris.ts";
import { calculateNatalBasics, calculateNatalBasicsAsync } from "../../lib/astrology/calculateNatalBasics.ts";
import { getAstrologyApiUrl } from "../../lib/config/astrologyApiUrl.ts";
import { normalizeBlueprint } from "../../lib/repositories/blueprintRepository.ts";

const ROOT = path.resolve(process.cwd());
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

type RefFixture = {
  label: string;
  birthLocal: string;
  timezone: string;
  utcOffsetHours: number;
  birthUtc: string;
  jdUt: number;
  latitude: number;
  longitude: number;
  place: string;
  expected: {
    chironLongitude: number; chironSign: string; chironDegree: number;
    chironHousePlacidus: number | null; chironHouseWholeSign: number;
    ascendantSign: string; ascendantLongitude: number;
    midheavenSign: string; midheavenLongitude: number;
  };
  oldLinear: { chironLongitude: number; chironSign: string; chironDegree: number; errorDegrees: number; signMatch: boolean };
  newTable: { chironLongitude: number; chironSign: string; chironDegree: number; errorDegrees: number; signMatch: boolean };
};

const ref = JSON.parse(
  fs.readFileSync(path.join(ROOT, "tests/fixtures/build108-cdi01-chiron-reference.json"), "utf-8"),
) as { generatedAtUtc: string; source: string; oldLinearModel: { anchorDeg: number; rateDegPerDay: number; j2000Jd: number }; fixtures: RefFixture[] };

let passed = 0;
async function check(name: string, fn: () => void | Promise<void>) {
  await fn();
  passed += 1;
  console.log(`  PASS  ${name}`);
}
const angDiff = (a: number, b: number) => {
  const d = Math.abs(((a - b) % 360) + 360) % 360;
  return Math.min(d, 360 - d);
};
const signOf = (lon: number) => SIGNS[Math.floor((((lon % 360) + 360) % 360) / 30)];

// The literal pre-CDI-108-01 model (lib/astrology/calculateNatalBasics.ts, removed).
function oldLinearChiron(jdUt: number): number {
  const days = jdUt - ref.oldLinearModel.j2000Jd;
  return (((ref.oldLinearModel.anchorDeg + days * ref.oldLinearModel.rateDegPerDay) % 360) + 360) % 360;
}

async function main() {
  console.log(`\nCDI-108-01  reference source: ${ref.source}`);
  console.log(`CDI-108-01  ${ref.fixtures.length} fixtures  |  ephemeris table: ${CHIRON_EPHEMERIS_META.source}\n`);

  // ---- 1. The linear approximation is removed from source, and it is wrong ----
  await check("1a  calculateNatalBasics.ts no longer defines the linear Chiron / Equal-house-as-Placidus code", () => {
    const src = fs.readFileSync(path.join(ROOT, "lib/astrology/calculateNatalBasics.ts"), "utf-8");
    assert.ok(!/function\s+calculateApproximateChironLongitude/.test(src), "linear Chiron helper definition must be deleted");
    assert.ok(!/function\s+buildApproximatePlacidusHouses/.test(src), "Equal-house-as-Placidus builder definition must be deleted");
    assert.ok(!/251\.35\s*\+\s*days\s*\*\s*0\.019777/.test(src), "linear Chiron formula must be gone");
    assert.ok(!/\bplacidusHouses\s*[:=]\s*buildApproximatePlacidusHouses/.test(src), "no synthesised placidusHouses assignment");
    assert.ok(src.includes("chironLongitudeAt"), "must use the Swiss Ephemeris table");
    assert.ok(src.includes('houseSystem: "whole-sign"'), "local engine declares Whole Sign house system");
  });

  await check("1b  the OLD linear model lands in the WRONG sign for most fixtures and exceeds 5° error", () => {
    let wrongSign = 0;
    let bigErr = 0;
    for (const fx of ref.fixtures) {
      const oldLon = oldLinearChiron(fx.jdUt);
      // reference stores the old value rounded to 5 dp
      assert.ok(angDiff(oldLon, fx.oldLinear.chironLongitude) < 1e-3, `${fx.label}: reproduced old value must match reference (${oldLon} vs ${fx.oldLinear.chironLongitude})`);
      if (signOf(oldLon) !== fx.expected.chironSign) wrongSign += 1;
      if (angDiff(oldLon, fx.expected.chironLongitude) > 5) bigErr += 1;
    }
    assert.ok(wrongSign >= Math.ceil(ref.fixtures.length * 0.6), `expected >=60% wrong-sign, got ${wrongSign}/${ref.fixtures.length}`);
    assert.ok(bigErr >= Math.ceil(ref.fixtures.length * 0.6), `expected >=60% with >5° error, got ${bigErr}/${ref.fixtures.length}`);
  });

  // ---- 2. The table matches Swiss Ephemeris and fails closed ----
  await check("2a  chironLongitudeAt() matches the authoritative reference within 0.01° for every fixture", () => {
    for (const fx of ref.fixtures) {
      const got = chironLongitudeAt(new Date(fx.birthUtc));
      assert.notEqual(got, null, `${fx.label}: table must cover ${fx.birthUtc}`);
      const err = angDiff(got as number, fx.expected.chironLongitude);
      assert.ok(err < 0.01, `${fx.label}: table err ${err.toFixed(5)}° exceeds 0.01°`);
      assert.equal(signOf(got as number), fx.expected.chironSign, `${fx.label}: table sign`);
    }
  });

  await check("2b  chironLongitudeAt() fails closed outside the table window (returns null, never an approximation)", () => {
    assert.equal(chironLongitudeAt(new Date("1750-01-01T00:00:00Z")), null, "pre-1900 must be null");
    assert.equal(chironLongitudeAt(new Date("2200-01-01T00:00:00Z")), null, "post-2100 must be null");
    assert.equal(chironLongitudeAt(new Date(Number.NaN)), null, "invalid date must be null");
  });

  await check("2c  chironIsRetrograde() is boolean within range and null outside it", () => {
    assert.equal(typeof chironIsRetrograde(new Date("2013-07-04T12:00:00Z")), "boolean");
    assert.equal(chironIsRetrograde(new Date("1750-01-01T00:00:00Z")), null);
  });

  // ---- 3. calculateNatalBasics: accurate Chiron, genuine Whole Sign, no fake Placidus ----
  await check("3  calculateNatalBasics() — ephemeris Chiron, Whole-Sign houses, NO synthesised Placidus", () => {
    for (const fx of ref.fixtures) {
      const nb = calculateNatalBasics({
        birthDate: fx.birthLocal.slice(0, 10),
        birthTime: fx.birthLocal.slice(11, 16),
        timezone: fx.timezone,
        latitude: fx.latitude,
        longitude: fx.longitude,
      });
      assert.equal(nb.status, "ready", `${fx.label}: status`);
      assert.equal(nb.chironAccuracy, "ephemeris", `${fx.label}: chironAccuracy`);
      assert.equal(nb.houseSystem, "whole-sign", `${fx.label}: houseSystem`);
      assert.equal((nb as any).placidusHouses, undefined, `${fx.label}: no local placidusHouses`);
      assert.equal((nb as any).houses, undefined, `${fx.label}: no local generic houses`);
      assert.ok(nb.wholeSignHouses && Object.keys(nb.wholeSignHouses).length === 12, `${fx.label}: 12 whole-sign houses`);
      assert.equal(nb.chiron, fx.expected.chironSign, `${fx.label}: chiron sign`);
      assert.equal(nb.planets?.Chiron?.sign, fx.expected.chironSign, `${fx.label}: planets.Chiron sign`);
      assert.equal(typeof nb.ascendantLongitude, "number", `${fx.label}: ascendantLongitude present`);
      assert.equal(typeof nb.midheavenLongitude, "number", `${fx.label}: midheavenLongitude present`);
      // CDI-108-01A: with canonical IANA timezone + luxon DST-correct conversion,
      // the end-to-end Chiron longitude matches Swiss Ephemeris to < 0.01°.
      const derr = angDiff(nb.planets!.Chiron!.longitude, fx.expected.chironLongitude);
      assert.ok(derr < 0.01, `${fx.label}: end-to-end Chiron residual ${derr.toFixed(6)}° must be < 0.01°`);
    }
  });

  // ---- 4. calculateNatalBasicsAsync: fail closed ----
  await check("4a  calculateNatalBasicsAsync() with a dead ephemeris service keeps the local chart (fail closed)", async () => {
    const saved = process.env.NEXT_PUBLIC_ASTROLOGY_API_URL;
    process.env.NEXT_PUBLIC_ASTROLOGY_API_URL = "http://127.0.0.1:0/definitely-not-listening";
    try {
      const fx = ref.fixtures.find((f) => f.label === "cancer_fast_arc")!;
      const nb = await calculateNatalBasicsAsync({
        birthDate: fx.birthLocal.slice(0, 10),
        birthTime: fx.birthLocal.slice(11, 16),
        timezone: fx.timezone,
        latitude: fx.latitude,
        longitude: fx.longitude,
      });
      assert.equal(nb.chironAccuracy, "ephemeris", "Chiron stays accurate from the local table");
      assert.equal(nb.chiron, fx.expected.chironSign, "Chiron sign still correct after remote failure");
      assert.equal(nb.houseSystem, "whole-sign", "must NOT claim Placidus when the service is down");
      assert.equal((nb as any).placidusHouses, undefined, "must NOT invent Placidus cusps");
      assert.notEqual(nb.source, "swiss-ephemeris", "source must reflect the local fallback");
    } finally {
      if (saved === undefined) delete process.env.NEXT_PUBLIC_ASTROLOGY_API_URL;
      else process.env.NEXT_PUBLIC_ASTROLOGY_API_URL = saved;
    }
  });

  await check("4b  a birth date outside the ephemeris window fails closed (no Chiron, chironAccuracy=unavailable)", () => {
    const nb = calculateNatalBasics({
      birthDate: "1850-04-10",
      birthTime: "08:00",
      timezone: "Europe/London",
      latitude: 51.5074,
      longitude: -0.1278,
    });
    assert.equal(nb.status, "ready");
    assert.equal(nb.chironAccuracy, "unavailable");
    assert.equal(nb.chiron, undefined, "no Chiron sign when the ephemeris cannot cover the date");
    assert.equal(nb.planets?.Chiron, undefined, "no planets.Chiron when unavailable");
  });

  // ---- 5. Placidus and Whole Sign are genuinely different systems ----
  await check("5  Placidus house != Whole Sign house for a real subset of fixtures", () => {
    const distinct = ref.fixtures.filter(
      (f) => f.expected.chironHousePlacidus !== null && f.expected.chironHousePlacidus !== f.expected.chironHouseWholeSign,
    );
    assert.ok(distinct.length >= 3, `expected >=3 fixtures with distinct houses, got ${distinct.length}`);
  });

  // ---- 6. Persistence preserves a stored Chiron on a non-ephemeris regeneration ----
  await check("6a  normalizeBlueprint preserves a stored Chiron / accuracy markers on an unchanged read", () => {
    const stored = {
      uid: "cdi01-test",
      input: { birthDate: "1990-06-15", birthTime: "14:30", birthCity: "Mumbai", latitude: 19.076, longitude: 72.8777, timezone: "Asia/Kolkata" },
      natalChart: { sunSign: "Gemini", chiron: "Cancer", chironAccuracy: "ephemeris", houseSystem: "whole-sign", calculationStatus: "completed" },
      astrology: { sunSign: "Gemini", chiron: "Cancer", chironAccuracy: "ephemeris", houseSystem: "whole-sign", calculationStatus: "completed" },
    } as any;
    const untouched = normalizeBlueprint("cdi01-test", stored);
    assert.equal((untouched.astrology as any).chiron, "Cancer", "an unchanged read must preserve the stored Chiron");
    assert.equal((untouched.astrology as any).chironAccuracy, "ephemeris");
    assert.equal((untouched.astrology as any).houseSystem, "whole-sign");

    // Fail-closed regeneration: fresh natalChart has NO chiron -> normalized shape
    // drops it (undefined) so a Firestore { merge:true } write keeps the stored value.
    const fresh = normalizeBlueprint("cdi01-test", {
      ...stored,
      natalChart: { sunSign: "Gemini", calculationStatus: "completed" } as any,
      astrology: { sunSign: "Gemini", calculationStatus: "completed" } as any,
    });
    assert.equal((fresh.astrology as any).chiron, undefined, "fail-closed regeneration must not fabricate a Chiron");
  });

  await check("6b  generateBlueprint & recovery engine gate chiron persistence on ephemeris accuracy", () => {
    const src = fs.readFileSync(path.join(ROOT, "lib/engines/generateBlueprint.ts"), "utf-8");
    assert.ok(src.includes('chironAccuracy === "ephemeris"'), "generateBlueprint must gate chiron on ephemeris accuracy");
    const src2 = fs.readFileSync(path.join(ROOT, "lib/engines/blueprintRecoveryEngine.ts"), "utf-8");
    assert.ok(src2.includes('chironAccuracy === "ephemeris"'), "blueprintRecoveryEngine must apply the same guard");
  });

  // ---- 7. Routing ----
  await check("7a  getAstrologyApiUrl() resolves per environment", () => {
    const savedEnv = process.env.NEXT_PUBLIC_ASTROLOGY_API_URL;
    const savedWeb = process.env.NEXT_PUBLIC_WEB_APP_URL;
    delete process.env.NEXT_PUBLIC_ASTROLOGY_API_URL;
    delete process.env.NEXT_PUBLIC_WEB_APP_URL;
    try {
      assert.equal(getAstrologyApiUrl({ isNative: false, isWindow: true }), "/api/humandesign/astrology");
      assert.equal(getAstrologyApiUrl({ isNative: true }), "https://bhumi-amartya-clean.vercel.app/api/humandesign/astrology");
      assert.equal(
        getAstrologyApiUrl({ isNative: true, webAppUrl: "https://example.test/" }),
        "https://example.test/api/humandesign/astrology",
      );
      assert.equal(getAstrologyApiUrl({ isNative: false, isWindow: false }), "https://bhumi-amartya-clean.vercel.app/api/humandesign/astrology");
      process.env.NEXT_PUBLIC_ASTROLOGY_API_URL = "https://ephem.example/calc";
      assert.equal(getAstrologyApiUrl({ isNative: true }), "https://ephem.example/calc", "env override wins");
    } finally {
      if (savedEnv === undefined) delete process.env.NEXT_PUBLIC_ASTROLOGY_API_URL;
      else process.env.NEXT_PUBLIC_ASTROLOGY_API_URL = savedEnv;
      if (savedWeb === undefined) delete process.env.NEXT_PUBLIC_WEB_APP_URL;
      else process.env.NEXT_PUBLIC_WEB_APP_URL = savedWeb;
    }
  });

  await check("7b  the astrology proxy route exists and fails closed", () => {
    const routePath = path.join(ROOT, "app/api/humandesign/astrology/route.ts");
    assert.ok(fs.existsSync(routePath), "app/api/humandesign/astrology/route.ts must exist");
    const src = fs.readFileSync(routePath, "utf-8");
    assert.ok(src.includes("calculationStatus"), "route must return an explicit calculationStatus on failure");
    assert.ok(/service_unavailable|connection_error|timeout/.test(src), "route must surface fail-closed states");
  });

  console.log(`\nCDI_108_01_CHIRON_NATAL_ACCURACY_PASS assertions=${passed}`);
}

main().catch((err) => {
  console.error("CDI_108_01_CHIRON_NATAL_ACCURACY_FAIL", err instanceof Error ? err.stack || err.message : String(err));
  process.exitCode = 1;
});
