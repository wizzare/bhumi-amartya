import { synthesizeGaiaProfile } from "../lib/profile/gaia/synthesisEngine";
import { buildUnifiedBlueprintSynthesis } from "../lib/dailyGuidance/unifiedBlueprintSynthesis";
import { buildDailyGuidancePrompt } from "../lib/prompts/dailyGuidancePrompt";

async function run() {
  const hd = {
      type: "Manifesting Generator",
      strategy: "To Respond",
      authority: "Sacral",
      profile: "5/1",
      definition: "Single Definition",
      digestion: "Hot Thirst",
      cognition: "Smell",
      motivation: "Hope",
      environment: "Artificial Shores",
      perspective: "Probability",
      variables: { value: "PLR DLR" }
  };

  const dummyInput = {
    numerology: { lifePath: 11, expression: 7, soulUrge: 11, personality: 5, personalYear: 8, birthDay: 18 },
    humanDesign: hd,
    astrology: {
      sunSign: "Gemini", moonSign: "Libra", ascendant: "Cancer",
      planets: [{ name: "Sun", sign: "Gemini" }]
    },
    destinyMatrix: {
      center: 6,
      karmicTail: [18, 9, 9],
      talentsGreat: [6, 17, 11]
    }
  };

  const profileEcho = synthesizeGaiaProfile(dummyInput as any);
  
  const dailyInput = {
    language: "id",
    user: { name: "Widhi" } as any,
    blueprint: dummyInput as any,
    astrologyToday: { summary: "Bulan di Scorpio" } as any,
    adaptiveContext: null as any,
    generatedAt: new Date().toISOString()
  };
  
  const prompt = buildDailyGuidancePrompt(dailyInput as any);
  
  console.log("=== PROFILE ECHO (SYNTHESIS) ===");
  console.log(JSON.stringify((profileEcho as any).synthesis || profileEcho, null, 2));
  
  console.log("\n=== UNIFIED BLUEPRINT (FOR DAILY GUIDANCE) ===");
  // extract from prompt what unified blueprint looks like
  const p = JSON.parse(prompt);
  console.log(JSON.stringify(p.userContext.unifiedBlueprint.fullBlueprint, null, 2));
  
  // also check bhumiSoulMirrorTemplate (Refleksi Jiwa)
  console.log("\n=== REFLEKSI JIWA TEMPLATE ===");
  console.log(p.userContext.bhumiSoulMirrorTemplate);
  
  // also check bhumiDailyReflectionTemplate (Catatan Hari Ini)
  console.log("\n=== CATATAN HARI INI TEMPLATE ===");
  console.log(p.userContext.bhumiDailyReflectionTemplate);
}

run().catch(console.error);
