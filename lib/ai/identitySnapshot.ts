import { IdentitySnapshot } from "./types";
import { buildUnifiedBlueprintSynthesis } from "../dailyGuidance/unifiedBlueprintSynthesis";
import { getCanonicalHumanDesign } from "../humandesign/hdAudit";

export function buildIdentitySnapshot(
  userProfile: any,
  blueprint: any
): IdentitySnapshot {
  const synthesis = buildUnifiedBlueprintSynthesis({
    language: userProfile.language === "en" ? "en" : "id",
    profile: userProfile,
    blueprint: blueprint,
  });

  const hd = getCanonicalHumanDesign(blueprint?.humanDesign);

  return {
    uid: userProfile.uid || userProfile.id || "",
    fullName: userProfile.fullName || "",
    lifePathNumber: synthesis.identitySignals.lifePath || 0,
    lifePathRole: blueprint?.numerology?.role || "",
    arcanaCenter: Number(synthesis.identitySignals.arcanaCenter) || 0,
    humanDesignType: synthesis.identitySignals.humanDesignType || "",
    humanDesignProfile: synthesis.identitySignals.humanDesignProfile || "",
    authority: synthesis.identitySignals.authority || "",
    strategy: synthesis.identitySignals.strategy || "",
    sunSign: synthesis.identitySignals.sunSign || "",
    moonSign: synthesis.identitySignals.moonSign || "",
    ascendant: synthesis.identitySignals.ascendant || "",
    derivedNumerology: synthesis.fullBlueprint.lifePath || {},
  };
}
export { getCanonicalHumanDesign } from "../humandesign/hdAudit";
