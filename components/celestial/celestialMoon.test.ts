import assert from "node:assert";
import { CelestialMoon, getMoonIllumination } from "./CelestialMoon";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

for (const angle of [0, 45, 90, 135, 180, 225, 270, 315, 105.07, 300]) {
  const html = renderToStaticMarkup(React.createElement(CelestialMoon, { phaseAngle: angle }));
  assert.ok(html.includes("<svg"));
  assert.ok(!html.includes("NaN"));
}
for (const waxing of [true, false]) {
  const html = renderToStaticMarkup(React.createElement(CelestialMoon, { phaseAngle: 180, illuminationFraction: 0.25, isWaxing: waxing }));
  assert.ok(html.includes("A 22,44"));
  assert.ok(html.includes("25%"));
}
assert.ok(!renderToStaticMarkup(React.createElement(CelestialMoon)).includes("<svg"));
const pair = renderToStaticMarkup(React.createElement(React.Fragment, null, React.createElement(CelestialMoon, { phaseAngle: 90 }), React.createElement(CelestialMoon, { phaseAngle: 90 })));
const ids = [...pair.matchAll(/ id="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length);
console.log("PASS production SVG renderer: 26 assertions");

console.log("=== RUNNING CELESTIAL MOON MATHEMATICAL & GEOMETRIC TEST SUITE ===");

let assertions = 0;
function test(desc: string, fn: () => void) {
  try {
    fn();
    assertions++;
    console.log(`  PASS: ${desc}`);
  } catch (err) {
    console.error(`  FAIL: ${desc}`);
    throw err;
  }
}

// 1. All 8 Canonical Lunar Phases
test("New Moon (Angle 0°): fraction ≈ 0, isWaxing = true", () => {
  const m = getMoonIllumination(0);
  assert.ok(Math.abs(m.fraction - 0) < 0.001, `Fraction expected 0, got ${m.fraction}`);
  assert.strictEqual(m.isWaxing, true);
  assert.strictEqual(m.phaseLabel, "Bulan Baru");
});

test("Waxing Crescent (Angle 45°): fraction ≈ 14.6%, isWaxing = true", () => {
  const m = getMoonIllumination(45);
  assert.ok(Math.abs(m.fraction - 0.146) < 0.01, `Fraction expected ~0.146, got ${m.fraction}`);
  assert.strictEqual(m.isWaxing, true);
  assert.strictEqual(m.phaseLabel, "Sabit Awal");
});

test("First Quarter (Angle 90°): fraction = 50.0%, isWaxing = true", () => {
  const m = getMoonIllumination(90);
  assert.ok(Math.abs(m.fraction - 0.5) < 0.001, `Fraction expected 0.5, got ${m.fraction}`);
  assert.strictEqual(m.isWaxing, true);
  assert.strictEqual(m.phaseLabel, "Perbani Awal");
});

test("Waxing Gibbous (Angle 135°): fraction ≈ 85.4%, isWaxing = true", () => {
  const m = getMoonIllumination(135);
  assert.ok(Math.abs(m.fraction - 0.854) < 0.01, `Fraction expected ~0.854, got ${m.fraction}`);
  assert.strictEqual(m.isWaxing, true);
  assert.strictEqual(m.phaseLabel, "Cembung Awal");
});

test("Full Moon (Angle 180°): fraction = 100.0%, isWaxing = false", () => {
  const m = getMoonIllumination(180);
  assert.ok(Math.abs(m.fraction - 1.0) < 0.001, `Fraction expected 1.0, got ${m.fraction}`);
  assert.strictEqual(m.isWaxing, false);
  assert.strictEqual(m.phaseLabel, "Bulan Purnama");
});

test("Waning Gibbous (Angle 225°): fraction ≈ 85.4%, isWaxing = false", () => {
  const m = getMoonIllumination(225);
  assert.ok(Math.abs(m.fraction - 0.854) < 0.01, `Fraction expected ~0.854, got ${m.fraction}`);
  assert.strictEqual(m.isWaxing, false);
  assert.strictEqual(m.phaseLabel, "Cembung Akhir");
});

test("Last Quarter (Angle 270°): fraction = 50.0%, isWaxing = false", () => {
  const m = getMoonIllumination(270);
  assert.ok(Math.abs(m.fraction - 0.5) < 0.001, `Fraction expected 0.5, got ${m.fraction}`);
  assert.strictEqual(m.isWaxing, false);
  assert.strictEqual(m.phaseLabel, "Perbani Akhir");
});

test("Waning Crescent (Angle 315°): fraction ≈ 14.6%, isWaxing = false", () => {
  const m = getMoonIllumination(315);
  assert.ok(Math.abs(m.fraction - 0.146) < 0.01, `Fraction expected ~0.146, got ${m.fraction}`);
  assert.strictEqual(m.isWaxing, false);
  assert.strictEqual(m.phaseLabel, "Sabit Akhir");
});

// 2. Intermediate Continuous Angle Cases (e.g. 63% illumination)
test("Continuous Intermediate: angle corresponding to ~63% illumination", () => {
  // cos(theta) = 1 - 2*0.63 = -0.26 => theta ≈ 105.07°
  const angle = 105.07;
  const m = getMoonIllumination(angle);
  assert.ok(Math.abs(m.fraction - 0.63) < 0.01, `Fraction expected ~0.63, got ${m.fraction}`);
  assert.strictEqual(m.isWaxing, true);
  assert.strictEqual(m.phaseLabel, "Perbani Awal"); // 90..112.5 range
});

test("Continuous Intermediate: angle corresponding to ~25% waning crescent", () => {
  // cos(theta) = 1 - 2*0.25 = 0.5 => theta = 300° (waning side)
  const angle = 300;
  const m = getMoonIllumination(angle);
  assert.ok(Math.abs(m.fraction - 0.25) < 0.01, `Fraction expected 0.25, got ${m.fraction}`);
  assert.strictEqual(m.isWaxing, false);
  assert.strictEqual(m.phaseLabel, "Sabit Akhir");
});

test("Angle Normalization: handles negative and > 360 values safely", () => {
  const mNeg = getMoonIllumination(-90); // Equivalent to 270
  assert.ok(Math.abs(mNeg.fraction - 0.5) < 0.001);
  assert.strictEqual(mNeg.isWaxing, false);

  const mLarge = getMoonIllumination(450); // Equivalent to 90
  assert.ok(Math.abs(mLarge.fraction - 0.5) < 0.001);
  assert.strictEqual(mLarge.isWaxing, true);
});

console.log(`\nALL ${assertions} LUNAR PHASE & ILLUMINATION TESTS PASSED!\n`);
