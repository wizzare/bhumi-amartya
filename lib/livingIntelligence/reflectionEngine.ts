import { MemoryContext, CircadianContext, ReflectionContext } from "./types";
import { IdentitySnapshot } from "../ai/types";

export class ReflectionEngine {
  public static calculate(
    memory: MemoryContext,
    identity: IdentitySnapshot,
    circadian: CircadianContext
  ): ReflectionContext {
    console.log(`[REFLECTION_ENGINE] Calculating Narrative Reflection Context for user: ${identity.uid}`);

    // 1. Narrative Direction Detection (analyzing historical logs instead of diagnosing psychology)
    const moodHistory = memory.moodHistory || [];
    const recentMoods = moodHistory.slice(0, 3).map(m => m?.moodLevel).filter(m => typeof m === "number") as number[];

    let narrativeDirection = "lanjutkan pengamatan diri";
    if (recentMoods.length >= 2) {
      const diff = recentMoods[0] - recentMoods[recentMoods.length - 1];

      if (diff > 1) {
        narrativeDirection = "bertumbuh dengan positif";
      } else if (diff < -1) {
        narrativeDirection = "didampingi dengan lembut";
      }
    }

    // 2. Continuity & Transition Decisions
    let narrativeTransition: "continue" | "bridge" | "pivot" = "pivot";
    const yesterdayIssue = (memory.yesterday as any)?.dominantIssue || "";
    const todayIssue = (memory.today as any)?.dominantIssue || "";

    if (yesterdayIssue && todayIssue && yesterdayIssue === todayIssue) {
      narrativeTransition = "continue";
    } else if (yesterdayIssue || todayIssue) {
      narrativeTransition = "bridge";
    }

    // 3. Greeting Strategy & Anti-Repetition
    let format: "salutation-first" | "theme-first" | "poetic-opening" = "salutation-first";
    let text = `${circadian.greeting}, ${identity.fullName?.split(" ")[0] || "sahabat"}`;

    const prevNote = memory.previousDailyNote || "";
    const prevReflection = memory.previousReflection || "";

    // If yesterday used a standard greeting, rotate format to avoid identical openings
    if (prevNote.includes("Selamat") || prevReflection.includes("Selamat") || prevNote.includes("Halo")) {
      const seed = (identity.fullName?.length || 0) + (circadian.hour || 0);
      if (seed % 3 === 1) {
        format = "theme-first";
        text = "Membawa sisa keheningan dari kemarin...";
      } else if (seed % 3 === 2) {
        format = "poetic-opening";
        text = "Pelan-pelan menyambut hari baru...";
      }
    }

    // 4. Extracting narrative segments
    const recurringThemes = memory.dominantThemes || [];
    const unresolvedThemes = memory.recurringWounds || [];
    const improvements = memory.progressMarkers?.map(m => m.description) || [];
    const setbacks = memory.recurringWounds && memory.recurringWounds.length > 0
      ? [`Masih mengamati pola: ${memory.recurringWounds[0]}`]
      : [];

    // Choose tone based on transition
    let toneAdjustment = "steady_supportive";
    if (narrativeTransition === "continue") {
      toneAdjustment = "deeply_reflective_continuity";
    } else if (narrativeDirection === "didampingi dengan lembut") {
      toneAdjustment = "gentle_encouraging_restart";
    } else if (narrativeDirection === "bertumbuh dengan positif") {
      toneAdjustment = "appreciative_growth_oriented";
    }

    // 5. Expose references pointing back to existing HumanMeaningEngine outputs
    const identityReferences = [
      "identity.archetype",
      "purpose",
      "energy.strategy",
      "shadow.soulLesson",
      "talents.potential"
    ];

    const reflectionContext: ReflectionContext = {
      narrativeDirection,
      previousReflectionSummary: prevReflection.slice(0, 150),
      previousDailyNoteSummary: prevNote.slice(0, 150),
      recurringThemes,
      unresolvedThemes,
      improvements,
      setbacks,
      narrativeTransition,
      greetingStyle: {
        format,
        text,
      },
      toneAdjustment,
      identityReferences,
    };

    return Object.freeze(reflectionContext);
  }
}
