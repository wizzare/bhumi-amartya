import { buildTransitNarrative } from "../lib/astrology/personalizedTransitNarrative";
import type { BodyStatus } from "../lib/astrology/calculateCurrentSky";
import type { AstroHouseActivation } from "../lib/astrology/astroHouseActivations";

const goldenUsers = [
  {
    name: "Widhi",
    blueprint: {
      lifePath: { number: 22 },
      humanDesign: { type: "Manifesting Generator" },
      destinyMatrix: { arcanaCenter: "8" },
      astrology: {
        sunSign: "Taurus",
        moonSign: "Libra",
        ascendant: "Libra",
      },
    },
  },
  {
    name: "Ning",
    blueprint: {
      lifePath: { number: 6 },
      humanDesign: { type: "Projector" },
      destinyMatrix: { arcanaCenter: "6" },
      astrology: {
        sunSign: "Libra",
        moonSign: "Cancer",
        ascendant: "Virgo",
      },
    },
  },
  {
    name: "Widya",
    blueprint: {
      lifePath: { number: 4 },
      humanDesign: { type: "Manifesting Generator" },
      destinyMatrix: { arcanaCenter: "4" },
      astrology: {
        sunSign: "Gemini",
        moonSign: "Scorpio",
        ascendant: "Aries",
      },
    },
  },
  {
    name: "Amartya",
    blueprint: {
      lifePath: { number: 9 },
      humanDesign: { type: "Projector" },
      destinyMatrix: { arcanaCenter: "9" },
      astrology: {
        sunSign: "Gemini",
        moonSign: "Taurus",
        ascendant: "Leo",
      },
    },
  },
  {
    name: "Eva Syana",
    blueprint: {
      lifePath: { number: 11 },
      humanDesign: { type: "Reflector" },
      destinyMatrix: { arcanaCenter: "12" },
      astrology: {
        sunSign: "Virgo",
        moonSign: "Taurus",
        ascendant: "Pisces",
      },
    },
  },
];

const planets: BodyStatus[] = [
  { body: "Sun", sign: "Taurus", longitude: 45, isRetrograde: false },
  { body: "Moon", sign: "Libra", longitude: 195, isRetrograde: false },
  { body: "Mercury", sign: "Gemini", longitude: 75, isRetrograde: true },
  { body: "Venus", sign: "Cancer", longitude: 105, isRetrograde: false },
  { body: "Mars", sign: "Leo", longitude: 135, isRetrograde: false },
  { body: "Jupiter", sign: "Gemini", longitude: 80, isRetrograde: false },
  { body: "Saturn", sign: "Pisces", longitude: 345, isRetrograde: true },
  { body: "Uranus", sign: "Taurus", longitude: 52, isRetrograde: false },
  { body: "Neptune", sign: "Pisces", longitude: 358, isRetrograde: false },
  { body: "Pluto", sign: "Aquarius", longitude: 302, isRetrograde: true },
  { body: "Chiron", sign: "Aries", longitude: 15, isRetrograde: false },
];

function runValidation() {
  console.log("=== START GOLDEN USER ASTRO NARRATIVE VALIDATION ===");
  let failed = false;

  for (const user of goldenUsers) {
    console.log(`\nTesting User: ${user.name}`);
    console.log(`Blueprint: LP ${user.blueprint.lifePath.number}, HD ${user.blueprint.humanDesign.type}, Arcana ${user.blueprint.destinyMatrix.arcanaCenter}`);

    // Map over planets and simulate different house activations
    for (let i = 0; i < planets.length; i++) {
      const planet = planets[i];
      // Simulate different houses for each planet (e.g. Sun in house 1, Moon in house 4, etc.)
      const simulatedHouse = (i % 12) + 1;
      const activation: AstroHouseActivation = {
        planet: planet.body,
        sign: planet.sign,
        degree: 15,
        house: simulatedHouse,
        isRetrograde: planet.isRetrograde,
        severity: "medium",
        lifeArea: `Life Area ${simulatedHouse}`,
        keywords: [],
        meaningForPrompt: "",
        sourceType: "whole_sign_fallback",
      };

      const narrative = buildTransitNarrative(planet, activation, { blueprint: user.blueprint });

      // Check for raw blueprint echoes in the user-facing fields
      const textToVerify = `${narrative.personalImpact} ${narrative.action}`.toLowerCase();
      const echoes = [
        "generator",
        "projector",
        "manifestor",
        "reflector",
        "life path",
        "arcana",
        "karmic tail",
        "money line",
        "love line",
        "house 1",
        "house 2",
        "house 3",
        "house 4",
        "house 5",
        "house 6",
        "house 7",
        "house 8",
        "house 9",
        "house 10",
        "house 11",
        "house 12",
      ];

      const foundEchoes = echoes.filter((echo) => textToVerify.includes(echo));

      if (foundEchoes.length > 0) {
        console.error(`  [FAIL] Planet: ${planet.body} (House ${simulatedHouse}) contains blueprint echoes: ${foundEchoes.join(", ")}`);
        console.error(`    Text: "${narrative.personalImpact}"`);
        failed = true;
      } else {
        console.log(`  [PASS] Planet: ${planet.body} (House ${simulatedHouse})`);
        console.log(`    Title: ${narrative.title}`);
        console.log(`    Kolektif: ${narrative.collectiveTheme}`);
        console.log(`    Personal: ${narrative.personalImpact}`);
        console.log(`    Action: ${narrative.action}`);
      }
    }
  }

  if (failed) {
    console.error("\n=== VALIDATION RESULT: FAILED ===");
    process.exit(1);
  } else {
    console.log("\n=== VALIDATION RESULT: ALL PASSED ===");
    console.log("No blueprint echoes leaked, and narrative differentiation works correctly!");
  }
}

runValidation();
