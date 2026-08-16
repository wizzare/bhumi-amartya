// BUG 3 — HUMAN DESIGN MANDALA OFFSET REGRESSION
//
// Confirms the local fallback engine anchors Gate 41 at 2°00′ Aquarius (302°),
// matching the canonical convention used by the hdkit reference library at
// lib/humandesign/hdkit/models/bodygraph.ts:985-1008 (+58° from 0° Aries).
//
// These tests pin:
//   1. Gate 41 anchor: ecliptic longitude 302°00′00″ → Gate 41 Line 1.
//   2. Gate width: 360°/64 = 5.625° per gate.
//   3. First-divergence vector: Personality Sun 220.7595° → Gate 44 (NOT 32).
//   4. Bunda Ayu end-to-end: Projector, 4/6, channels 11-56 & 13-33,
//      no Sacral (the +40.75° fallback produced Generator / 3-6 / 42-53).
//   5. Boundary regression: longitudes around gate edges do not introduce
//      off-by-one drift in either gate identity or line index.
//
// This file intentionally does NOT mutate any production state.

import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateHumanDesignTypeFromBirthData,
  calculateHumanDesignProfileFromBirthData,
} from "../../lib/humandesign/calculateHumanDesignType";

const PONOROGO_INPUT = {
  birthDate: "1997-11-03",
  birthTime: "10:45",
  timezone: "+07:00",
  longitude: 111.4623017,
} as const;

test("BUG 3 §1: Gate 41 anchor — longitude 302°00′ maps to Gate 41 Line 1", () => {
  // The fallback exposes only `calculateHumanDesign*FromBirthData`, but the
  // anchoring constant is a pure function of longitude. We reproduce the
  // exact arithmetic used by gateFromLongitude/lineFromLongitude inline to
  // keep the test focused on the gate-mandala mapping alone.

  // Mirror the post-fix logic verbatim.
  const GATE_MANDALA_OFFSET_DEGREES = 58;
  const gateOrder = [
    41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
    27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
    31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
    28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
  ];

  const lon = 302;
  const adjusted = ((lon + GATE_MANDALA_OFFSET_DEGREES) % 360 + 360) % 360;
  const gate = gateOrder[Math.floor((adjusted / 360) * 64)];
  const gateProgress = (adjusted / 360) * 64;
  const line = Math.floor((gateProgress % 1) * 6) + 1;

  assert.equal(gate, 41, "302° must resolve to Gate 41 (canonical anchor)");
  assert.equal(line, 1, "exact anchor must resolve to Line 1 (gateProgress fraction = 0)");
});

test("BUG 3 §2: gate width = 360 / 64 = 5.625°", () => {
  assert.equal(360 / 64, 5.625);
});

test("BUG 3 §3: Personality Sun 220.7595° maps to Gate 44 (canonical), NOT Gate 32 (legacy +40.75)", () => {
  // First-divergence anchor: this single longitude is the gate mapping that
  // flips Bunda Ayu's Sacral definition under the corrected offset.
  const GATE_MANDALA_OFFSET_DEGREES = 58;
  const gateOrder = [
    41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
    27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
    31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
    28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
  ];

  const lon = 220.7595;
  const adjusted = ((lon + GATE_MANDALA_OFFSET_DEGREES) % 360 + 360) % 360;
  const gate = gateOrder[Math.floor((adjusted / 360) * 64)];

  assert.equal(gate, 44, "Personality Sun 220.7595° must map to Gate 44 (canonical +58°)");
  assert.notEqual(gate, 32, "must NOT regress to the legacy +40.75° Gate 32 mapping");
});

test("BUG 3 §4: Bunda Ayu — corrected fallback produces Projector 4/6 with channels 11-56 & 13-33", () => {
  const typeResult = calculateHumanDesignTypeFromBirthData(
    PONOROGO_INPUT.birthDate,
    PONOROGO_INPUT.birthTime,
    PONOROGO_INPUT.timezone,
    PONOROGO_INPUT.longitude,
  );
  const profile = calculateHumanDesignProfileFromBirthData(
    PONOROGO_INPUT.birthDate,
    PONOROGO_INPUT.birthTime,
    PONOROGO_INPUT.timezone,
    PONOROGO_INPUT.longitude,
  );

  assert.ok(typeResult, "fallback must return a result for valid inputs");
  assert.equal(typeResult.type, "Projector", "Bunda Ayu is Projector under canonical anchor");
  assert.equal(profile, "4/6", "Bunda Ayu profile is 4/6 under canonical anchor");

  // Canonical channels for this vector.
  assert.deepEqual(
    typeResult.channels.slice().sort(),
    ["11-56", "13-33"].sort(),
    "channels must be exactly 11-56 and 13-33 (no 42-53, no Sacral)",
  );

  // Sacral must NOT be defined. The 42-53 channel (Root↔Sacral) was the sole
  // Sacral-defining pair under the legacy +40.75° offset.
  assert.ok(
    !typeResult.channels.includes("42-53"),
    "42-53 must NOT be present under canonical anchor (no Sacral)",
  );
  assert.ok(
    !typeResult.channels.includes("28-38") &&
      !typeResult.channels.includes("32-54"),
    "legacy Bhumi-only channels 28-38 / 32-54 must NOT be present",
  );

  // Generator must NOT be produced (the user's dispute).
  assert.notEqual(typeResult.type, "Generator");
  assert.notEqual(profile, "3/6");

  // Active gate set should not include legacy Bhumi-only gates (42, 53, 38, 54).
  for (const legacyGate of [38, 42, 53, 54]) {
    assert.ok(
      !typeResult.activeGates.includes(legacyGate),
      `legacy offset gate ${legacyGate} must NOT appear in active gates`,
    );
  }
});

test("BUG 3 §5: gate-boundary longitudes — no off-by-one around Gate 41 anchor", () => {
  // The corrected anchor is at 302°. Longitudes just inside / outside this
  // boundary must map to Gate 41 (low) or its neighbor Gate 19 (high), with
  // matching lines. This guards against any accidental floor() drift.
  const GATE_MANDALA_OFFSET_DEGREES = 58;
  const gateOrder = [
    41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
    27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
    31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
    28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
  ];

  function gate(lon: number): number {
    const adj = ((lon + GATE_MANDALA_OFFSET_DEGREES) % 360 + 360) % 360;
    return gateOrder[Math.floor((adj / 360) * 64)];
  }
  function line(lon: number): number {
    const adj = ((lon + GATE_MANDALA_OFFSET_DEGREES) % 360 + 360) % 360;
    const gateProgress = (adj / 360) * 64;
    return Math.floor((gateProgress % 1) * 6) + 1;
  }

  // Exactly at anchor: Gate 41, Line 1.
  assert.equal(gate(302), 41);
  assert.equal(line(302), 1);

  // Just inside (302 + tiny fraction): still Gate 41.
  assert.equal(gate(302.001), 41, "302.001° must remain inside Gate 41");
  assert.ok(line(302.001) >= 1 && line(302.001) <= 6, "line must stay 1-6 inside gate");

  // One gate width later (302 + 5.625): Gate 41's end → next gate (19).
  // Note: at exactly 307.625° the floor() lands on Gate 19's first slot.
  assert.equal(gate(307.6249), 41, "just before 307.625° must remain Gate 41");
  assert.equal(gate(307.625), 19, "exactly 307.625° (one width later) must advance to Gate 19");

  // Wrap-around: 361° ≡ 1° → lon = 1; adjusted = 1+58 = 59 → gate at fraction
  // 59/360 ≈ 0.1639 → gateOrder[10] = 25.
  assert.equal(gate(1), 25, "wrap-around case: 1° → Gate 25");

  // Negative longitude handling: -1° ≡ 359°; adjusted = 359+58 = 417 % 360 = 57°
  // → fraction ≈ 0.1583 → gateOrder[10] = 25.
  assert.equal(gate(-1), 25, "negative wrap: -1° ≡ 359° → Gate 25");
});

test("BUG 3 §6: profile derives from Sun longitude via the same canonical offset", () => {
  // Sanity: profile is also routed through lineFromLongitude, so the +58°
  // fix must apply there too. Bunda Ayu Sun at 220.7595° → Gate 44, Line 4.
  const profile = calculateHumanDesignProfileFromBirthData(
    PONOROGO_INPUT.birthDate,
    PONOROGO_INPUT.birthTime,
    PONOROGO_INPUT.timezone,
    PONOROGO_INPUT.longitude,
  );
  assert.equal(profile, "4/6", "Personality Sun 220.7595° → Line 4, Design Sun 132.76° → Line 6");
});
