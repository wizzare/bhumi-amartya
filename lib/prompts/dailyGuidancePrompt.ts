import type { DailyGuidanceInput } from "@/lib/orchestrators/types";
import { buildBhumiDailyReflectionPrompt } from "@/lib/prompts/bhumiDailyReflectionPrompt";
import { buildBhumiSoulMirrorPrompt } from "@/lib/prompts/bhumiSoulMirrorPrompt";
import { buildBhumiManifestationPrompt } from "@/lib/prompts/bhumiManifestationPrompt";
import { buildUnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";

export function buildDailyGuidancePrompt(input: DailyGuidanceInput): string {
  const emotionalMemory = input.emotionalMemory ?? {};
  const unifiedBlueprint = buildUnifiedBlueprintSynthesis({
    language: input.language,
    profile: input.user as unknown as Record<string, unknown>,
    blueprint: input.blueprint as unknown as Record<string, unknown>,
    astrologyToday: input.astrologyTransits?.summary,
    adaptiveContext: input.adaptiveContext,
  });

  return JSON.stringify(
    {
      role: "Bhumi Amartya daily AI orchestration engine",
      instruction:
        "Generate original, user-aware daily dashboard guidance following the BHUMI AMARTYA V1.4.2 STRICT INTELLIGENCE CHAIN. Every output field must be a synthesis of the FULL COMBINED BLUEPRINT and TODAY'S COSMIC CONTEXT, integrated with the USER'S ACTUAL JOURNEY (Memory). Return valid JSON only. No markdown.",
      repetitionAvoidanceRule:
        "REPETITION AVOIDANCE: You are provided with yesterday's soulReflectionText and dailyNoteText in userContext.previousGuidance. You MUST ensure today's text is significantly different in phrasing, focus, and narrative structure while remaining true to the blueprint. Do not repeat the same analogies or opening hooks.",
      intelligenceChainRule:
        "STRICT CHAIN RULE: 1. Full Blueprint + Journey Memory → Refleksi Jiwa (No transits). 2. Full Blueprint + Astro Today + Journey Memory → Catatan Hari Ini. 3. Catatan Hari Ini + House Activation + User Progress → Innerwork. 4. Innerwork + Catatan Hari Ini + Full Blueprint → Manifestasi Hari Ini.",
      blueprintDefinition:
        "BLUEPRINT DATA: Use ALL available data in userContext.blueprint: Numerology (number, archetype, lesson), Human Design (Type, Strategy, Authority, Profile, Defined/Open Centers, Gates, Channels, Incarnation Cross), Natal Chart (Sun, Moon, Ascendant, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Chiron, North Node, Lilith, House placements), Destiny Matrix (Arcana Center, Money Line, Love Line, Karmic Tail, Talents). Never simplify the blueprint to just 4-5 labels.",
      strictFilter:
        "CRITICAL: Do NOT use generic spiritual cliches: 'dengarkan suara hati', 'beri ruang', 'renungkan perlahan', 'biarkan energi mengalir', 'proses batin', 'kelembutan'. If these concepts are needed, they MUST be translated into the user's specific archetype language and blueprint context.",
      safety:
        "This is reflective wellbeing guidance, not medical, legal, or financial advice. Do not make fear-based spiritual claims. Keep language grounded, compassionate, non-diagnostic, practical, and agency-preserving. Never use prohibited phrases: blueprint pattern, isolated system, synthesis, deterministic, Soul Core, generated from, engine, fallback, source, local-fallback.",
      language: input.language,
      architectureV141: {
        mirrorWeightingRule: "PHASE 4 – BLUEPRINT WEIGHTING: Refleksi Jiwa (Mirror) must prioritize: Life Path (25%), Human Design (25%), Arcana Center (20%), Natal Sun (15%), Natal Moon (15%). Prevent astrology transits from overpowering the identity blueprint.",
        archetypeRule: "PHASE 5 – CORE ARCHETYPE ENGINE: Use the provided Dominant Archetypes in Refleksi Jiwa. Write from the archetype's perspective (e.g., 'Sebagai seorang Builder...', 'Bagian Pioneer dalam dirimu...'). Avoid generic 'you' statements.",
        genericFilterRule: "PHASE 6 – GENERIC LANGUAGE FILTER: REDUCE overused phrases: 'dengarkan suara hati', 'beri ruang', 'renungkan perlahan', 'biarkan energi mengalir', 'proses batin', 'kelembutan'. These may only appear when strongly justified by Blueprint or Transit.",
        mirrorRule: "SECTION 1 – REFLEKSI JIWA (MIRROR): Purpose: Answer 'Siapa dirimu secara mendasar?'. Use ONLY core blueprint + archetypes. Similarity between users MUST be < 30%.",
        compassRule: "SECTION 2 – CATATAN HARI INI (COMPASS): Purpose: Answer 'Hari ini apa yang sedang mempengaruhi dirimu?'. Formula: Mirror x Transit mapped to Natal Houses.",
        houseImpactRule: "PHASE 3 – HOUSE IMPACT: Compass must be driven by house activation. e.g. Mars in House 2 = Money/Self-worth, Mars in House 7 = Relationships, Mars in House 10 = Career. If a house is active, you MUST discuss its specific themes.",
      },
      userContext: {
        user: input.user,
        identity: input.identity,
        blueprint: input.blueprint || null,
        unifiedBlueprint,
        dominantArchetypes: unifiedBlueprint.archetypes,
        emotionalState: input.emotionalState,
        emotionalMemory: {
          timeframe: emotionalMemory.timeframe ?? null,
          emotionalTrends: emotionalMemory.emotionalTrends ?? [],
          recurringThemes: emotionalMemory.recurringThemes ?? [],
          recurringWounds: emotionalMemory.recurringWounds ?? [],
          emotionalCycles: emotionalMemory.emotionalCycles ?? [],
          healingMilestones: emotionalMemory.healingMilestones ?? [],
          healingActions: (emotionalMemory.healingActions ?? []).slice(-10),
          suggestedFocus: emotionalMemory.suggestedFocus ?? null,
          nextHealingEdge: emotionalMemory.nextHealingEdge ?? null,
        },
        healingProgress: input.healingProgress,
        astrologyTransits: input.astrologyTransits,
        currentSky: input.currentSky ?? null,
        houseData: input.houseData ?? null,
        astroHouseActivations: input.astroHouseActivations ?? [],
        natalHouses: input.natalHouses ?? null,
        journalHistory: input.journalHistory ?? [],
        meditationHistory: input.meditationHistory ?? [],
        audioHealingHistory: input.audioHealingHistory ?? [],
        activityHistory: input.activityHistory ?? null,
        momentumState: input.momentumState ?? null,
        healingMemory: input.healingMemory ?? null,
        previousGuidance: input.previousGuidance ? {
          soulReflectionText: input.previousGuidance.soulReflectionText,
          dailyNoteText: input.previousGuidance.dailyNoteText,
          generatedAt: input.previousGuidance.generatedAt,
        } : null,
        bhumiSoulMirrorTemplate: buildBhumiSoulMirrorPrompt({
          input,
          journalHistory: input.journalHistory,
          meditationHistory: input.meditationHistory,
          audioHealingHistory: input.audioHealingHistory,
          weeklyReflections: input.weeklyReflections,
          momentumState: input.momentumState,
          healingMemory: input.healingMemory,
          unifiedBlueprint: unifiedBlueprint as unknown as Record<string, unknown>,
        }),
        bhumiManifestationTemplate: buildBhumiManifestationPrompt({
          input,
          journalHistory: input.journalHistory,
          meditationHistory: input.meditationHistory,
          audioHealingHistory: input.audioHealingHistory,
          weeklyReflections: input.weeklyReflections,
          momentumState: input.momentumState,
          healingMemory: input.healingMemory,
          unifiedBlueprint: unifiedBlueprint as unknown as Record<string, unknown>,
        }),
        bhumiDailyReflectionTemplate: buildBhumiDailyReflectionPrompt({
          input,
          currentSky: input.currentSky,
          natalHouses: input.natalHouses,
          journalHistory: input.journalHistory,
          meditationHistory: input.meditationHistory,
          audioHealingHistory: input.audioHealingHistory,
          activityHistory: input.activityHistory,
          weeklyReflections: input.weeklyReflections,
          momentumState: input.momentumState,
          healingMemory: input.healingMemory,
          unifiedBlueprint: unifiedBlueprint as unknown as Record<string, unknown>,
        }),
        adaptiveDailyProgression: input.adaptiveContext ?? null,
        dailyVariationSeed: input.adaptiveContext?.dailyVariationSeed ?? input.generatedAt.slice(0, 10),
        requiredToneRule:
          "Use adaptiveDailyProgression.adaptiveTone exactly: gentle_encouraging_restart means gentle, encouraging, restart tone; appreciative_growth_oriented means appreciative and growth-oriented tone; steady_supportive means steady, supportive tone.",
        synthesisRule:
          "Every dashboard field must reflect the V1.4.1 architecture. (MIRROR) Weighting: Life Path 25%, HD 25%, Arcana 20%, Sun 15%, Moon 15%. (COMPASS) Driven by house activation. Use 'kamu' and 'dirimu' instead of 'Anda' or 'pengguna'.",
        archetypeApplicationRule:
          "For Refleksi Jiwa (Mirror), select the most relevant Dominant Archetype for today and write from that perspective. Example: 'Sebagai seorang Builder, fokusmu hari ini adalah...' or 'Bagian Sage dalam dirimu mengingatkan bahwa...'.",
        reasonEngineRule:
          "For the 'reason' field in each category, you must use the provided astroHouseActivations. Map each planet's energy and its active house to the relevant life area according to SECTION 3. Expand the 'reason' to 3-5 sentences explaining the relationship between Transit, Blueprint, and the user's Psychology. Technical terms like 'House 10' or 'Mars di House 7' must remain visible.",
        reflectionRule:
          "For the 'reflection' field in each category, provide 2-3 deep reflective questions related to the category's theme and today's cosmic context. Help the user look inward.",
        adviceRule:
          "For the 'advice' field in each category, provide a warm, grounded, and practical mentor-like guidance (10-20 sentences). Your tone should be membumi, hangat, and supportive.",
        separateReflectionRule:
          "Soul Reflection (Mirror) is about WHO YOU ARE FUNDAMENTALLY. Write from an ARCHETYPE PERSPECTIVE. Today's Note (Compass) is about HOW TODAY AFFECTS YOU. They must not repeat the same data sources or ideas.",
        dailyPracticeRules:
          "Generate exactly 3 dailyInnerwork.tasks following SECTION 4: Mirror + Compass synthesis. Grounding first, reflection/journaling second, action/real life third. Each must be measurable, personalized, achievable in 5-20 minutes.",
        generatedAt: input.generatedAt,
      },
      outputSchema: {
        blueprintSummary: "string, natural synthesis of current needs from the unified blueprint model; do not list labels as reasons",

        // V2 Categories (Catatan Hari Ini / Compass)
        categories: {
          general: {
            insight: "string (Bahasa Indonesia), general mood and energy theme for today (Compass)",
            reason: "string (Bahasa Indonesia), use reasonEngineRule. 3-5 sentences. Explain connection between Today's Sky and Natal Houses.",
            reflection: "string (Bahasa Indonesia), use reflectionRule. 2-3 questions.",
            advice: "string (Bahasa Indonesia), use adviceRule. 10-20 sentences."
          },
          mental: {
            insight: "string (Bahasa Indonesia), cognitive focus and mental clarity status",
            reason: "string (Bahasa Indonesia), use reasonEngineRule. Focus on Mercury/House 3 or Ajna Center transits.",
            reflection: "string (Bahasa Indonesia), use reflectionRule. 2-3 questions.",
            advice: "string (Bahasa Indonesia), use adviceRule. 10-20 sentences."
          },
          finance: {
            insight: "string (Bahasa Indonesia), approach to resources and material stability",
            reason: "string (Bahasa Indonesia), use reasonEngineRule. Focus on House 2 or House 10 transits.",
            reflection: "string (Bahasa Indonesia), use reflectionRule. 2-3 questions.",
            advice: "string (Bahasa Indonesia), use adviceRule. 10-20 sentences."
          },
          love: {
            insight: "string (Bahasa Indonesia), emotional intimacy and romantic tone",
            reason: "string (Bahasa Indonesia), use reasonEngineRule. Focus on House 5, 7 or 11 transits.",
            reflection: "string (Bahasa Indonesia), use reflectionRule. 2-3 questions.",
            advice: "string (Bahasa Indonesia), use adviceRule. 10-20 sentences."
          },
          relational: {
            insight: "string (Bahasa Indonesia), communication with friends, family, and community",
            reason: "string (Bahasa Indonesia), use reasonEngineRule. Focus on House 11 or Mercury transits.",
            reflection: "string (Bahasa Indonesia), use reflectionRule. 2-3 questions.",
            advice: "string (Bahasa Indonesia), use adviceRule. 10-20 sentences."
          },
          spiritual: {
            insight: "string (Bahasa Indonesia), connection to meaning and inner silence",
            reason: "string (Bahasa Indonesia), use reasonEngineRule. Focus on House 12 or Neptune transits.",
            reflection: "string (Bahasa Indonesia), use reflectionRule. 2-3 questions.",
            advice: "string (Bahasa Indonesia), use adviceRule. 10-20 sentences."
          },
          challenges: {
            insight: "string (Bahasa Indonesia), the specific friction point today (Challenges)",
            reason: "string (Bahasa Indonesia), use reasonEngineRule. Focus on Retrogrades/Saturn/Mars transits.",
            reflection: "string (Bahasa Indonesia), use reflectionRule. 2-3 questions.",
            advice: "string (Bahasa Indonesia), use adviceRule. 10-20 sentences."
          },
          opportunities: {
            insight: "string (Bahasa Indonesia), the specific opening or potential today (Peluang)",
            reason: "string (Bahasa Indonesia), use reasonEngineRule. Focus on Jupiter or North Node transits.",
            reflection: "string (Bahasa Indonesia), use reflectionRule. 2-3 questions.",
            advice: "string (Bahasa Indonesia), use adviceRule. 10-20 sentences."
          }
        },

        soulReflectionText: "string, (REFLEKSI JIWA / MIRROR) 80-150 words. Write a living daily mirror based on bhumiSoulMirrorTemplate. Answer 'Siapa dirimu hari ini?'. Integrate core blueprint essence with journey memory (journal/meditation/audio/weekly). Follow Mirror-Insight-Invitation flow. NO TRANSITS. Mentor tone.",
        dailyNoteText: "string, (CATATAN HARI INI / COMPASS) 120-220 words. Answer 'Hari ini apa yang sedang mempengaruhi dirimu?'. Formula: Mirror x Transit integrated with Journey Memory. Map transits to Natal Houses. Practical and grounded tone.",
        companionReflection: {
          preview:
            "string, 100-150 words for Dashboard Catatan Hari Ini preview. Ending with ...",
          fullReflection:
            "string, 900-1300 words for Read More. Detailed Compass interpretation including at least three relevant planet-house effects.",
        },
        soulReflection: {
          dailyMessage: "string, 2-4 sentences only. (MIRROR) Short timeless emotional reminder of identity and current journey stage. NO astrology/transits.",
          theme: "string",
          affirmation: "string",
          warningSign: "optional string",
          guidance: "string",
          emotionalTone: "one of gentle, empowering, grounding, introspective, celebratory",
        },
        astroEnergy: {
          currentEnergy: "string",
          description: "string",
          emoji: "string",
          intensity: "one of low, medium, high",
          recommendation: "string",
          affectedAreas: ["string"],
        },
        dailyInnerwork: {
          tasks: [
            {
              id: "string",
              task: "string",
              duration: "number",
              category: "one of grounding, reflection, action",
              emoji: "string",
              purpose: "string",
              instruction: "string",
              completed: false,
            },
          ],
          theme: "string",
          focusArea: "string",
          totalDuration: "number",
          difficulty: "one of beginner, intermediate, advanced",
        },
        journalingPrompt: {
          prompt: "string",
          subPrompts: ["string"],
          theme: "string",
          emotionalDepth: "one of surface, medium, deep",
          purpose: "string",
          relatedArea: "string",
        },
        shadowInsight: "string",
        meditationRecommendation: {
          title: "string",
          duration: "number",
          type: "string",
          focusArea: "string",
          description: "string",
          technique: "string",
          energyEffect: "string",
        },
        audioHealingSuggestion: "string",
        healingRecommendation: {
          id: "string",
          type: "string",
          title: "string",
          description: "string",
          duration: "number",
          basedOnEmotionalAnalysis: "string",
          addressesWound: "string",
          supportedBy: "string",
          instructions: ["string"],
          tips: ["string"],
          bestTiming: "string",
          frequency: "string",
          integratesWithPractice: ["string"],
          supportiveReminder: "string",
        },
        healingAudio: {
          title: "string",
          frequency: "optional string",
          duration: "number",
          purpose: "string",
          affinity: "string",
          vibe: "string",
          artistOrSource: "string",
        },
        innerworkNarrative: "string (Bahasa Indonesia), 3-5 sentences inviting user to SECTION 4 innerwork.",
        manifestation: {
          affirmation: "string (Bahasa Indonesia), (MANIFESTASI) Grounded 'I am' or 'I choose' statement based on bhumiManifestationTemplate. Max 2 sentences.",
          attraction: "string (Bahasa Indonesia), (MANIFESTASI) Energy or quality to embody based on bhumiManifestationTemplate. Max 2 sentences.",
          assumption: "string (Bahasa Indonesia), (MANIFESTASI) Perspective or belief worth practicing today based on bhumiManifestationTemplate. Max 2 sentences."
        },
        soulProgress: {
          healingStreak: "number",
          consciousnessLevel: "number",
          totalJournalEntries: "number",
          totalMeditationMinutes: "number",
          totalInnerworkSessions: "number",
          currentPhase: "string",
          nextMilestone: "string",
          progressPercentage: "number",
        },
        reminderState: {
          groundingDone: "boolean",
          journalingDone: "boolean",
          meditationDone: "boolean",
          moodLevel: "number",
          needsSupport: "boolean",
        },
      },
    },
    null,
    2,
  );
}

