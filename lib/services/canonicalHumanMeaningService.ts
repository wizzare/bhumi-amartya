import type { CanonicalIdentity } from "@/lib/types/canonical";
import type { HumanMeaningPayload } from "@/lib/types/humanMeaning";
import type { MemoryContext, ReflectionContext, JourneyContext, WellnessContext, PotentialContext, CircadianContext } from "../livingIntelligence/types";
import { HumanMeaningService } from "./humanMeaningService";

/**
 * BHUMI V4 CANONICAL HUMAN MEANING SERVICE
 * The ONLY authorized gateway that translates Identity Intelligence into Human Meaning.
 */
export class CanonicalHumanMeaningService {
  public static generatePayload(
    identity: CanonicalIdentity,
    reflection: ReflectionContext,
    journey: JourneyContext,
    wellness: WellnessContext,
    potential: PotentialContext,
    circadian: CircadianContext,
    memory: MemoryContext
  ): HumanMeaningPayload {
    const baseMeaning = HumanMeaningService.generate(identity);

    return {
      identity: {
        psychologicalMeaning: baseMeaning.identity.medium,
        behavioralMeaning: baseMeaning.talents.workStyle.medium,
        emotionalMeaning: baseMeaning.shadow.emotionalNeeds.medium,
        archetypeMeaning: baseMeaning.soulIdentity.archetype.medium,
      },
      daily: {
        atmosphericMeaning: circadian.greeting,
        focusMeaning: baseMeaning.timing.dailyFocus.medium,
        challengeMeaning: baseMeaning.shadow.triggers.medium,
        opportunityMeaning: baseMeaning.timing.growthArea.medium,
      },
      relationships: {
        intimacyMeaning: baseMeaning.relationships.loveLanguage.medium,
        socialMeaning: baseMeaning.relationships.pattern.medium,
        familyMeaning: baseMeaning.shadow.ancestralLegacy.medium,
        boundaryMeaning: baseMeaning.relationships.boundaries.medium,
      },
      economics: {
        stabilityMeaning: baseMeaning.shadow.moneyBlock.medium,
        careerMeaning: baseMeaning.talents.wealthFlow.medium,
        talentMeaning: baseMeaning.talents.potential.medium,
        resourceMeaning: baseMeaning.energy.vitality.medium,
      },
      wellness: {
        physicalMeaning: baseMeaning.energy.bodyMechanics.medium,
        mentalMeaning: baseMeaning.health.chakra.medium,
        spiritualMeaning: baseMeaning.spirituality.path.medium,
        circadianMeaning: baseMeaning.health.rhythm.medium,
      },
      growth: {
        currentLessonMeaning: baseMeaning.soulIdentity.lessons.medium,
        milestoneMeaning: baseMeaning.soulIdentity.mission.medium,
        transformationMeaning: baseMeaning.timing.season.medium,
        journeyStageMeaning: baseMeaning.timing.currentState.medium,
      },
      companion: {
        presenceMeaning: reflection.greetingStyle.text,
        observationMeaning: reflection.previousReflectionSummary,
        narrativeDirectionMeaning: "lanjutkan",
      },
    };
  }
}
