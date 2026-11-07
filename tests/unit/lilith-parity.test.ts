import assert from "node:assert/strict";
import { calculateNatalChart } from "../../lib/astrology/calculateNatalChart";
import { calculateNatalBasics, calculateMeanBlackMoonLilithLongitude } from "../../lib/astrology/calculateNatalBasics";
import { buildFullAstrologyReading } from "../../lib/astrology/synthesis";

console.log("=== NATAL CHART LILITH EPHEMERIS & INTEGRATION TEST ===");

// 1. Founder Benchmark Test: 1985-05-03 23:45 WIB Jakarta (-6.2088, 106.8456)
const founderNatal = calculateNatalChart({
  birthDate: "1985-05-03",
  birthTime: "23:45",
  timezone: "Asia/Jakarta",
  latitude: -6.2088,
  longitude: 106.8456,
});

console.log("Founder Natal Lilith:", founderNatal.lilith);
assert.equal(founderNatal.lilith.name, "Black Moon Lilith");
assert.equal(founderNatal.lilith.sign, "Aries", "Founder Lilith must be in Aries");
assert.equal(founderNatal.lilith.house, 3, "Founder Lilith must be in House 3 (Placidus)");
assert.ok(Math.abs(founderNatal.lilith.longitude - 26.7777) < 0.01, "Founder Lilith longitude must be ~26.78 deg");
assert.equal(founderNatal.lilith.formattedDegree, "26\u00B047\u2032 Aries");

// 2. Parity between calculateNatalChart and calculateNatalBasics
const basicsResult = calculateNatalBasics({
  birthDate: "1985-05-03",
  birthTime: "23:45",
  timezone: "+07:00",
  latitude: -6.2088,
  longitude: 106.8456,
});

assert.ok(basicsResult.lilith, "Lilith must exist in natal basics");
assert.equal(basicsResult.lilith.sign, "Aries", "Basics Lilith must be in Aries");
assert.equal(basicsResult.lilith.house, 3, "Basics Lilith must be in House 3 (Whole Sign)");

// 3. Full Reading / UI Consumer Test
const fullReading = buildFullAstrologyReading({
  birthDate: "1985-05-03",
  birthTime: "23:45",
  timezone: "Asia/Jakarta",
  latitude: -6.2088,
  longitude: 106.8456,
});

const lilithReading = fullReading.planetReadings.find((pr) => pr.planet.name === "Black Moon Lilith");
assert.ok(lilithReading, "Full reading must contain Black Moon Lilith");
assert.equal(lilithReading.planet.sign, "Aries", "Reading planet sign must be Aries");
assert.equal(lilithReading.planet.house, 3, "Reading planet house must be 3");
assert.ok(lilithReading.pillar.penjelasan.length > 50, "Pillar penjelasan must be populated");
assert.ok(lilithReading.pillar.gift.length > 20, "Pillar gift must be populated");
assert.ok(lilithReading.pillar.shadow.length > 20, "Pillar shadow must be populated");
assert.ok(lilithReading.pillar.integrasi.length > 20, "Pillar integrasi must be populated");

console.log("PASS: Lilith ephemeris, Placidus & Whole Sign house assignment, and UI reading parity verified.");
