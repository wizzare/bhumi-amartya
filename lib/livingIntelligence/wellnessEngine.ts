import { MemoryContext, ReflectionContext, JourneyContext, CircadianContext, WellnessContext, WellnessDomainDetail } from "./types";
import { IdentitySnapshot, LanguageContext } from "../ai/types";

export class WellnessEngine {
  public static calculate(
    memory: MemoryContext,
    reflection: ReflectionContext,
    journey: JourneyContext,
    identity: IdentitySnapshot,
    circadian: CircadianContext,
    language: LanguageContext
  ): WellnessContext {
    console.log(`[WELLNESS_ENGINE] Calculating Evolving Wellness Rhythms for user: ${identity.uid}`);

    // Re-use Journey Context metrics without recalculating them
    const consistencyRate = journey.consistencyRate;
    const momentumDirection = journey.momentum.direction;
    const microWinsCount = journey.microWins.length;

    // Helper to construct domain templates
    const buildDefaultDomain = (candidates: string[]): WellnessDomainDetail => ({
      currentState: "stable",
      momentum: "stable",
      consistencyRate,
      attentionLevel: "low",
      recoverySignal: false,
      microActionCandidates: candidates,
    });

    // 1. Calculate Sleep domain contextually from Circadian context
    const sleepDisrupted = circadian.timeWindow === "afterMidnight";
    const sleep: WellnessDomainDetail = {
      currentState: sleepDisrupted ? "needs-attention" : "stable",
      momentum: sleepDisrupted ? "downward" : "stable",
      consistencyRate,
      attentionLevel: sleepDisrupted ? "high" : "low",
      recoverySignal: false,
      microActionCandidates: ["sleep", "breathing"],
    };

    // 2. Cascade logic: Sleep decline cascades to influence Movement attention
    const movementNeedsAttention = sleepDisrupted || (memory.activityHistory?.length === 0);
    const movement: WellnessDomainDetail = {
      currentState: movementNeedsAttention ? "needs-attention" : "stable",
      momentum: movementNeedsAttention ? "downward" : "stable",
      consistencyRate,
      attentionLevel: movementNeedsAttention ? "medium" : "low",
      recoverySignal: !!(memory.activityHistory && memory.activityHistory.length > 0 && sleepDisrupted === false),
      microActionCandidates: ["movement", "stretching"],
      dependencyTrigger: sleepDisrupted ? "sleep_declined" : undefined,
    };

    // 3. Cascade logic: Movement stagnation cascades to influence Emotional balance
    const emotionalDisrupted = movementNeedsAttention || (reflection.narrativeDirection === "gentle-support");
    const emotion: WellnessDomainDetail = {
      currentState: emotionalDisrupted ? "needs-attention" : "stable",
      momentum: emotionalDisrupted ? "downward" : "stable",
      consistencyRate,
      attentionLevel: emotionalDisrupted ? "medium" : "low",
      recoverySignal: false,
      microActionCandidates: ["reflection", "gratitude"],
      dependencyTrigger: movementNeedsAttention ? "movement_stagnant" : undefined,
    };

    // 4. Cascade logic: Emotional friction triggers Breathing & Meditation attention
    const breathing: WellnessDomainDetail = {
      currentState: emotionalDisrupted ? "recovering" : "stable",
      momentum: "stable",
      consistencyRate,
      attentionLevel: emotionalDisrupted ? "medium" : "low",
      recoverySignal: emotionalDisrupted,
      microActionCandidates: ["breathing"],
      dependencyTrigger: emotionalDisrupted ? "emotional_tension" : undefined,
    };

    const meditation: WellnessDomainDetail = {
      currentState: emotionalDisrupted ? "needs-attention" : "stable",
      momentum: "stable",
      consistencyRate,
      attentionLevel: emotionalDisrupted ? "medium" : "low",
      recoverySignal: false,
      microActionCandidates: ["meditation"],
      dependencyTrigger: emotionalDisrupted ? "emotional_friction" : undefined,
    };

    // 5. Journal domain based on memory history
    const journalEmpty = (memory.journalHistory?.length === 0);
    const journal: WellnessDomainDetail = {
      currentState: journalEmpty ? "needs-attention" : "stable",
      momentum: "stable",
      consistencyRate,
      attentionLevel: journalEmpty ? "medium" : "low",
      recoverySignal: false,
      microActionCandidates: ["journaling"],
    };

    // 6. Purpose domain derived from Journey stage
    const purposeNeedsAttention = journey.currentStage === "orientation";
    const purpose: WellnessDomainDetail = {
      currentState: purposeNeedsAttention ? "needs-attention" : "stable",
      momentum: "stable",
      consistencyRate,
      attentionLevel: purposeNeedsAttention ? "medium" : "low",
      recoverySignal: false,
      microActionCandidates: ["purpose"],
    };

    // Initialize defaults for remaining domains (Nutrition, Nature, Digital Wellness, Social, Learning, Creativity, Spiritual, Environment)
    const nutrition = buildDefaultDomain(["water", "nutrition"]);
    const nature = buildDefaultDomain(["nature"]);
    const digitalWellness: WellnessDomainDetail = {
      ...buildDefaultDomain(["digital_detox"]),
      currentState: sleepDisrupted ? "needs-attention" : "stable",
      attentionLevel: sleepDisrupted ? "medium" : "low",
      dependencyTrigger: sleepDisrupted ? "sleep_deprived" : undefined,
    };
    const social = buildDefaultDomain(["connection"]);
    const learning = buildDefaultDomain(["learning"]);
    const creativity = buildDefaultDomain(["creative"]);
    const spiritual = buildDefaultDomain(["spiritual"]);
    const environment = buildDefaultDomain(["environment"]);

    // Calculate overall wellness metadata layers
    const overallRhythm = momentumDirection === "upward" ? "harmonious" : momentumDirection === "downward" ? "restoring" : "disrupted";
    const overallBalance = consistencyRate > 70 ? "growing" : consistencyRate < 30 ? "fragile" : "steady";
    const overallRecovery = microWinsCount > 0;

    // Attention count
    let attentionCount = 0;
    const allDomains = [sleep, movement, emotion, breathing, meditation, journal, purpose, digitalWellness];
    allDomains.forEach(d => { if (d.currentState === "needs-attention") attentionCount++; });
    const overallAttention = attentionCount >= 3 ? "high" : attentionCount >= 1 ? "medium" : "low";

    // Overall momentum state
    let overallMomentum: "stable" | "recovering" | "developing" | "needs-attention" = "stable";
    if (overallAttention === "high") {
      overallMomentum = "needs-attention";
    } else if (overallRecovery) {
      overallMomentum = "recovering";
    } else if (overallBalance === "growing") {
      overallMomentum = "developing";
    }

    // Build Explicit Relationship Graph
    const relationships = [
      { source: "sleep", target: "movement", state: sleepDisrupted ? "active" as const : "dormant" as const, influence: sleepDisrupted ? "disrupting" as const : "neutral" as const },
      { source: "movement", target: "emotion", state: movementNeedsAttention ? "active" as const : "dormant" as const, influence: movementNeedsAttention ? "disrupting" as const : "neutral" as const },
      { source: "emotion", target: "reflection", state: emotionalDisrupted ? "active" as const : "dormant" as const, influence: emotionalDisrupted ? "disrupting" as const : "neutral" as const },
      { source: "reflection", target: "purpose", state: purposeNeedsAttention ? "active" as const : "dormant" as const, influence: purposeNeedsAttention ? "disrupting" as const : "neutral" as const },
      { source: "nature", target: "emotion", state: "active" as const, influence: "supporting" as const },
      { source: "digitalWellness", target: "sleep", state: sleepDisrupted ? "active" as const : "dormant" as const, influence: sleepDisrupted ? "disrupting" as const : "neutral" as const },
      { source: "social", target: "emotion", state: "active" as const, influence: "supporting" as const },
      { source: "learning", target: "purpose", state: "active" as const, influence: "supporting" as const }
    ];

    const wellnessContext: WellnessContext = {
      overall: {
        overallRhythm,
        overallBalance,
        overallRecovery,
        overallAttention,
        overallMomentum,
      },
      domains: {
        movement,
        sleep,
        nutrition,
        breathing,
        meditation,
        emotion,
        journal,
        nature,
        digitalWellness,
        social,
        learning,
        creativity,
        spiritual,
        environment,
        purpose,
      },
      relationships,
    };

    return Object.freeze(wellnessContext);
  }
}
