const { generateLocalManifestation } = require('../lib/orchestrators/localDailyGuidanceFallback');

// Mock Input
const mockInput = {
  language: "id",
  emotionalState: { currentMood: 3 },
  blueprint: { lifePath: { number: 4 }, destinyMatrix: { center: 8 } },
  wellnessMapping: { results: [{ category: "BURNOUT", label: "Burnout" }] },
  generatedAt: new Date().toISOString(),
  adaptiveContext: { dailyVariationSeed: "2026-06-12" }
};

console.log("--- TESTING MANIFESTATION FALLBACK ---");
try {
  const result = generateLocalManifestation(mockInput, "unit_test");
  console.log("RESULT_FOUND:", !!result);
  console.log("Affirmation:", result.affirmation);
  console.log("Assumption:", result.assumption);
  console.log("Attraction:", result.attraction);

  if (result.affirmation && result.affirmation !== "Manifestasi hari ini sedang disiapkan") {
      console.log("VALIDATION: SUCCESS (Fallback works and contains actual content)");
  } else {
      console.log("VALIDATION: FAILED (Still returning placeholder)");
  }
} catch (err) {
  console.error("TEST_ERROR:", err.message);
}
