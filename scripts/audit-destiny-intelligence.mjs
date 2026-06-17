import {
  buildDestinyProfileSections,
  interpretDestinyMatrixIntelligence,
} from "../lib/engines/destinyMatrixIntelligence.ts";

const baseBlueprint = {
  lifePath: { number: 4, role: "Builder", positiveTraits: [], negativeTraits: [] },
  humanDesign: {
    status: "verified",
    type: "Manifesting Generator",
    strategy: "Wait to Respond",
    authority: "Emotional",
    profile: "1/3",
    incarnationCross: { name: "Right Angle Cross of Planning" },
    channels: ["20-34"],
    gates: [20, 34],
    openCenters: ["Head", "Ajna"],
  },
  destinyMatrix: {
    center: 8,
    arcanaCenter: 8,
    moneyLine: [20, 8, 11],
    loveLine: [10, 8, 6],
    karmicTail: [14, 5, 19],
  },
  astrology: {
    sunSign: "Gemini",
    moonSign: "Cancer",
    northNode: "Aries",
    southNode: "Libra",
    venus: "Taurus",
    saturn: "Sagittarius",
    mercury: "Gemini",
    jupiter: "Aries",
    mars: "Leo",
    mc: "Leo",
  },
};

const userA = {
  ...baseBlueprint,
  destinyMatrix: {
    ...baseBlueprint.destinyMatrix,
    destinyIntelligence: {
      soulSearching: 8,
      socialization: 16,
      spiritualKnowledge: 6,
      healthChart: {
        ajna: { physics: 14, energy: 18, emotion: 5 },
        anahata: { physics: 6, energy: 8, emotion: 4 },
        muladhara: { physics: 5, energy: 8, emotion: 6 },
      },
    },
  },
};

const userB = {
  ...baseBlueprint,
  destinyMatrix: {
    ...baseBlueprint.destinyMatrix,
    moneyLine: [6, 8, 12],
    loveLine: [18, 8, 21],
    karmicTail: [12, 18, 6],
    destinyIntelligence: {
      soulSearching: 7,
      socialization: 14,
      spiritualKnowledge: 21,
      healthChart: {
        ajna: { physics: 5, energy: 6, emotion: 4 },
        anahata: { physics: 19, energy: 21, emotion: 4 },
        muladhara: { physics: 5, energy: 13, emotion: 18 },
      },
    },
  },
};

function summarize(label, blueprint) {
  const intelligence = interpretDestinyMatrixIntelligence(blueprint);
  const profileSections = buildDestinyProfileSections(blueprint);
  const innerwork = {
    workout: intelligence.dominantChakra === "anahata" ? "Heart Recovery Walk" : "Mindful Grounding Walk",
    yoga: intelligence.dominantChakra === "anahata" ? "Heart Opening Yoga" : "Grounding Earth Flow",
    food: intelligence.dominantChakra === "ajna" ? "Lemongrass Calm" : "Turmeric Glow",
    audio: intelligence.dominantChakra === "anahata" ? "432Hz Heart Integration" : "396Hz Mental Grounding",
    reason: intelligence.interpretations.find((item) => item.chakra === intelligence.dominantChakra)?.summary,
  };

  return {
    label,
    reflectionDifferentiators: intelligence.soulSignature,
    soulMission: profileSections.soulMission,
    greatestPotential: profileSections.greatestPotential,
    repeatingPatterns: profileSections.repeatingPatterns,
    innerChild: profileSections.innerChild,
    innerwork,
  };
}

const result = {
  userA: summarize("User A", userA),
  userB: summarize("User B", userB),
};

console.log(JSON.stringify({
  ...result,
  acceptance: {
    reflectionDifferent: JSON.stringify(result.userA.reflectionDifferentiators) !== JSON.stringify(result.userB.reflectionDifferentiators),
    soulMissionDifferent: result.userA.soulMission !== result.userB.soulMission,
    potentialDifferent: result.userA.greatestPotential !== result.userB.greatestPotential,
    repeatingPatternsDifferent: result.userA.repeatingPatterns !== result.userB.repeatingPatterns,
    innerChildDifferent: result.userA.innerChild !== result.userB.innerChild,
    innerworkDifferent: JSON.stringify(result.userA.innerwork) !== JSON.stringify(result.userB.innerwork),
  },
}, null, 2));
