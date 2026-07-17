// @ts-expect-error
import { CanonicalTranslatorService } from "../lib/services/canonicalTranslatorService.ts";
// @ts-expect-error
import { HumanMeaningService } from "../lib/services/humanMeaningService.ts";
import type { Blueprint } from "../lib/types/blueprint";

const user1 = {
  name: "User 1 (LP 4, Generator, Sun Gemini, Weton Rabu Pon)",
  blueprint: {
    status: "ready",
    numerology: { lifePath: { number: 4 } },
    humanDesign: { profile: "1/3", type: "Manifesting Generator", authority: "Emotional", strategy: "Wait to Respond" },
    destinyMatrix: {
      destinyPoint: 4,
      karmicTail: [21, 4, 10],
      talentsFather: [8, 14, 6],
      loveLine: [3, 13, 10],
      yearlyArcana: 7
    },
    astrology: { sunSign: "Gemini", moonSign: "Scorpio", chiron: "Capricorn" },
    bazi: { dominantElement: "Tanah (Earth)", dayMaster: { element: "Earth" }, fiveElements: { Earth: 40, Water: 10 } },
    vedic: { darakaraka: { planet: "Venus" }, currentMahadasha: { planet: "Saturn" } },
    weton: { weton: "Rabu Pon" }
  } as unknown as Blueprint
};

const user2 = {
  name: "User 2 (LP 4, Projector, Sun Scorpio, Weton Jumat Kliwon)",
  blueprint: {
    status: "ready",
    numerology: { lifePath: { number: 4 } },
    humanDesign: { profile: "2/4", type: "Projector", authority: "Splenic", strategy: "Wait for Invitation" },
    destinyMatrix: {
      destinyPoint: 15,
      karmicTail: [15, 5, 8],
      talentsFather: [11, 21, 10],
      loveLine: [6, 18, 12],
      yearlyArcana: 15
    },
    astrology: { sunSign: "Scorpio", moonSign: "Leo", chiron: "Aries" },
    bazi: { dominantElement: "Air (Water)", dayMaster: { element: "Water" }, fiveElements: { Water: 50, Earth: 5 } },
    vedic: { darakaraka: { planet: "Saturn" }, currentMahadasha: { planet: "Jupiter" } },
    weton: { weton: "Jumat Kliwon" }
  } as unknown as Blueprint
};

function runSimulation() {
  console.log("=== COMPARING SAME LIFE PATH (LP 4) UNIQUENESS ===");

  const c1 = CanonicalTranslatorService.translate(user1.blueprint);
  const m1 = HumanMeaningService.generate(c1);

  const c2 = CanonicalTranslatorService.translate(user2.blueprint);
  const m2 = HumanMeaningService.generate(c2);

  console.log(`\n--- ${user1.name} ---`);
  console.log("1. Archetype / Identity Summary:");
  console.log("   - Short: ", m1.identity.short);
  console.log("   - Medium:", m1.identity.medium);
  console.log("2. Purpose / Soul Mission:");
  console.log("   - Short: ", m1.purpose.short);
  console.log("   - Medium:", m1.purpose.medium);
  console.log("3. Current Focus (Energy Mechanics):");
  console.log("   - Short: ", m1.energy.short);
  console.log("   - Medium:", m1.energy.medium);
  console.log("4. Shadow / Soul Challenge:");
  console.log("   - Short: ", m1.shadow.short);
  console.log("   - Medium:", m1.shadow.medium);
  console.log("5. Growing Area / Element Vitality:");
  console.log("   - Short: ", m1.health.element.short);
  console.log("   - Medium:", m1.health.element.medium);
  console.log("6. Recommendation / Work Style:");
  console.log("   - Short: ", m1.talents.workStyle.short);
  console.log("   - Medium:", m1.talents.workStyle.medium);

  console.log(`\n--- ${user2.name} ---`);
  console.log("1. Archetype / Identity Summary:");
  console.log("   - Short: ", m2.identity.short);
  console.log("   - Medium:", m2.identity.medium);
  console.log("2. Purpose / Soul Mission:");
  console.log("   - Short: ", m2.purpose.short);
  console.log("   - Medium:", m2.purpose.medium);
  console.log("3. Current Focus (Energy Mechanics):");
  console.log("   - Short: ", m2.energy.short);
  console.log("   - Medium:", m2.energy.medium);
  console.log("4. Shadow / Soul Challenge:");
  console.log("   - Short: ", m2.shadow.short);
  console.log("   - Medium:", m2.shadow.medium);
  console.log("5. Growing Area / Element Vitality:");
  console.log("   - Short: ", m2.health.element.short);
  console.log("   - Medium:", m2.health.element.medium);
  console.log("6. Recommendation / Work Style:");
  console.log("   - Short: ", m2.talents.workStyle.short);
  console.log("   - Medium:", m2.talents.workStyle.medium);
}

runSimulation();
