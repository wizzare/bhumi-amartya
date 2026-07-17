import { MemoryContext, ReflectionContext, JourneyContext, WellnessContext, CircadianContext, PotentialContext } from "./types";
import { IdentitySnapshot } from "../ai/types";

export class PotentialEngine {
  public static calculate(
    identity: IdentitySnapshot,
    memory: MemoryContext,
    reflection: ReflectionContext,
    journey: JourneyContext,
    wellness: WellnessContext,
    circadian: CircadianContext
  ): PotentialContext {
    console.log(`[POTENTIAL_ENGINE] Mapping Evolving Potential Gates for user: ${identity.uid}`);

    // 1. Inherit static strengths from Blueprint snapshot (IdentitySnapshot)
    const naturalStrengths = [
      identity.humanDesignType ? `hd_${identity.humanDesignType.toLowerCase().replace(/\s+/g, "_")}` : "",
      identity.lifePathRole ? `role_${identity.lifePathRole.toLowerCase().replace(/\s+/g, "_")}` : "",
      identity.strategy ? `strategy_${identity.strategy.toLowerCase().replace(/\s+/g, "_")}` : "",
    ].filter(Boolean);

    const hiddenStrengths = [
      identity.sunSign ? `sun_${identity.sunSign.toLowerCase()}` : "",
      identity.moonSign ? `moon_${identity.moonSign.toLowerCase()}` : "",
      identity.ascendant ? `asc_${identity.ascendant.toLowerCase()}` : "",
    ].filter(Boolean);

    // 2. Map Active vs Dormant states based on Wellness Domain Attentions
    const activeStrengths: string[] = [];
    const dormantStrengths: string[] = [];

    const mapDomainToStrength = (domainKey: keyof typeof wellness.domains, strengthTags: string[]) => {
      const detail = wellness.domains[domainKey];
      if (detail.currentState === "needs-attention") {
        dormantStrengths.push(...strengthTags);
      } else {
        activeStrengths.push(...strengthTags);
      }
    };

    mapDomainToStrength("sleep", ["istirahat_mendalam", "regenerasi_malam"]);
    mapDomainToStrength("movement", ["vitalitas_fisik", "disiplin_tubuh"]);
    mapDomainToStrength("journal", ["kejujuran_diri", "refleksi_tertulis"]);
    mapDomainToStrength("social", ["koneksi_empati", "keterbukaan_sosial"]);
    mapDomainToStrength("purpose", ["kejelasan_visi", "keselarasan_tujuan"]);

    // 3. Map Activation & Optimization signals from Wellness domain details
    const activationSignals: string[] = [];
    const optimizationSignals: string[] = [];

    Object.entries(wellness.domains).forEach(([name, detail]) => {
      if (detail.currentState === "recovering") {
        activationSignals.push(`activate_${name}`);
      } else if (detail.currentState === "stable" && detail.consistencyRate < 50) {
        optimizationSignals.push(`optimize_${name}`);
      }
    });

    // 4. Map Light side and Shadow activation from reflection context
    const lightSideSignals = [...reflection.recurringThemes];
    
    const shadowActive = reflection.narrativeDirection === "gentle-support" || wellness.overall.overallAttention === "high";
    const shadowActivation = shadowActive ? [...reflection.unresolvedThemes] : [];
    const shadowIntegration = shadowActive ? [...reflection.setbacks] : [];

    // 5. Bridge Wellness domains contextually to Chakra Activations
    const getChakraState = (keys: Array<keyof typeof wellness.domains>): "active" | "dormant" | "needs-care" => {
      let needsCare = false;
      let dormant = true;
      keys.forEach(k => {
        const detail = wellness.domains[k];
        if (detail.currentState === "needs-attention") needsCare = true;
        if (detail.currentState === "stable" || detail.currentState === "developing" || detail.currentState === "recovering") dormant = false;
      });
      return needsCare ? "needs-care" : dormant ? "dormant" : "active";
    };

    const chakraActivation = [
      { chakraName: "root" as const, state: getChakraState(["sleep", "environment"]) },
      { chakraName: "sacral" as const, state: getChakraState(["movement", "creativity"]) },
      { chakraName: "solar_plexus" as const, state: getChakraState(["purpose", "learning"]) },
      { chakraName: "heart" as const, state: getChakraState(["emotion", "social"]) },
      { chakraName: "throat" as const, state: getChakraState(["journal", "breathing"]) },
      { chakraName: "third_eye" as const, state: getChakraState(["meditation", "learning"]) },
      { chakraName: "crown" as const, state: getChakraState(["spiritual", "meditation"]) },
    ];

    // 6. Inherit spiritual gifts from Numerology centers
    const spiritualGiftSignals = [
      identity.lifePathNumber ? `lifepath_${identity.lifePathNumber}` : "",
      identity.arcanaCenter ? `arcana_${identity.arcanaCenter}` : "",
    ].filter(Boolean);

    // 7. Potential Momentum & Potential Readiness
    let potentialMomentum: "emerging" | "stable" | "accelerating" | "recovering" = "stable";
    if (wellness.overall.overallMomentum === "recovering") {
      potentialMomentum = "recovering";
    } else if (journey.momentum.velocity === "accelerating") {
      potentialMomentum = "accelerating";
    } else if (journey.momentum.direction === "upward") {
      potentialMomentum = "emerging";
    }

    let potentialReadiness: "ready" | "developing" | "supported" | "blocked" | "recovering" = "developing";
    if (wellness.overall.overallAttention === "high") {
      potentialReadiness = "blocked";
    } else if (wellness.overall.overallRecovery) {
      potentialReadiness = "recovering";
    } else if (journey.consistencyRate > 70) {
      potentialReadiness = "ready";
    } else if (journey.consistencyRate > 35) {
      potentialReadiness = "supported";
    }

    // 8. Re-use Journey nextGrowthSignals
    const growthSignals = [...journey.nextGrowthSignals];

    const potentialContext: PotentialContext = {
      naturalStrengths,
      hiddenStrengths,
      activeStrengths,
      dormantStrengths,
      activationSignals,
      optimizationSignals,
      lightSideSignals,
      shadowActivation,
      shadowIntegration,
      chakraActivation,
      spiritualGiftSignals,
      potentialMomentum,
      potentialReadiness,
      growthSignals,
    };

    return Object.freeze(potentialContext);
  }
}
