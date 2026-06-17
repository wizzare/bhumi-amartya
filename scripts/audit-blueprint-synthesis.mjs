import { createBlueprintUtilizationReport } from "../lib/dailyGuidance/blueprintUtilizationAudit.ts";
import { buildUnifiedBlueprintSynthesis } from "../lib/dailyGuidance/unifiedBlueprintSynthesis.ts";

const sharedProfile = {
  uid: "blueprint-audit-user",
  name: "Audit User",
  language: "id",
};

const userABlueprint = {
  lifePath: {
    number: 4,
    birthdayNumber: 9,
    attitudeNumber: 6,
    maturityNumber: 8,
    personalYear: 3,
  },
  humanDesign: {
    status: "verified",
    type: "Manifesting Generator",
    strategy: "Wait to Respond",
    authority: "Emotional",
    profile: "1/3",
    incarnationCross: "Right Angle Cross of Planning",
    channels: ["20-34"],
    gates: [20, 34],
    definedCenters: ["Sacral", "Throat", "Solar Plexus"],
    openCenters: ["Head", "Ajna"],
  },
  destinyMatrix: {
    arcanaCenter: "8",
    commonEnergy: "Strength",
    moneyLine: 20,
    loveLine: 10,
    karmicTail: "14-5-19",
  },
  astrology: {
    sunSign: "Gemini",
    moonSign: "Cancer",
    ascendant: "Scorpio",
    venus: "Taurus",
    saturn: "Sagittarius",
    mc: "Leo",
    northNode: "Aries",
    housePlacements: { venus: 7, saturn: 2 },
  },
};

const userBBlueprint = {
  ...userABlueprint,
  destinyMatrix: {
    ...userABlueprint.destinyMatrix,
    moneyLine: 6,
    loveLine: 18,
    karmicTail: "12-18-6",
  },
  astrology: {
    ...userABlueprint.astrology,
    ascendant: "Pisces",
    venus: "Virgo",
    saturn: "Capricorn",
    mc: "Sagittarius",
    northNode: "Libra",
    housePlacements: { venus: 4, saturn: 10 },
  },
};

function summarize(label, blueprint) {
  const synthesis = buildUnifiedBlueprintSynthesis({
    language: "id",
    profile: sharedProfile,
    blueprint,
    astrologyToday: "Moon phase and daily sky audit context",
  });

  return {
    label,
    blueprintSummary: synthesis.blueprintSummary,
    differentiators: synthesis.differentiators,
    utilization: createBlueprintUtilizationReport(blueprint).map((item) => ({
      module: item.module,
      score: item.estimatedUtilizationScore,
      consumed: item.consumedBlueprintFields.length,
      available: item.availableBlueprintFields.length,
    })),
  };
}

const result = {
  userA: summarize("User A", userABlueprint),
  userB: summarize("User B", userBBlueprint),
};

console.log(JSON.stringify({
  ...result,
  meaningfulDifferentiation: JSON.stringify(result.userA.differentiators) !== JSON.stringify(result.userB.differentiators),
}, null, 2));
