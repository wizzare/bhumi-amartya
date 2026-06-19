import type { HumanMeaning } from "@/lib/types/humanMeaning";
import type { DailyState } from "@/lib/repositories/dailyStateRepository";
import { getCompletionSummary } from "@/lib/engines/completionEngine";
import { growthEngine } from "@/lib/engines/growthEngine";

export type DashboardJourneyRuntime = {
  innerworkCompletion: string;
  currentGrowthArea: string;
  journeyProgress: string;
  activeChallenge: string;
};

export class DashboardJourneyRuntimeAdapter {
  public static build(
    meaning: HumanMeaning,
    currentState: DailyState | null,
    recentStates: DailyState[],
  ): DashboardJourneyRuntime {
    const completion = getCompletionSummary(currentState);
    const growth = growthEngine.calculateGrowth(recentStates);
    const milestone = growth.currentMilestone === "The Canopy"
      ? "fase pertumbuhan yang matang"
      : growth.currentMilestone === "The Sapling"
        ? "fase penguatan kebiasaan"
        : growth.currentMilestone === "The Sprout"
          ? "fase tumbuh yang mulai konsisten"
          : "fase membangun fondasi";
    const strongest = Object.entries(growth.signals)
      .sort(([, left], [, right]) => right - left)[0]?.[0];
    const latestInnerwork = recentStates
      .filter((state) => state.innerworkJourney?.completed)
      .sort((left, right) => right.date.localeCompare(left.date))[0]?.innerworkJourney;
    const latestResult = latestInnerwork
      ? `Praktik terakhir adalah ${latestInnerwork.practiceTitle} (${latestInnerwork.innerworkType}) untuk isu ${latestInnerwork.dominantIssue}, dengan hasil ${latestInnerwork.reflectionResult}.`
      : "";
    const signalLabels: Record<string, string> = {
      awareness: "kesadaran diri",
      consistency: "konsistensi",
      depth: "kedalaman refleksi",
      balance: "keseimbangan",
      courage: "keberanian",
      acceptance: "penerimaan",
    };

    return {
      innerworkCompletion: completion.count === 0
        ? latestResult || "Praktik harianmu belum dimulai, jadi langkah berikutnya perlu dibuat ringan dan mudah dimasuki."
        : `${completion.count} dari ${completion.total} praktik utama sudah selesai; ritmemu hari ini sudah bergerak. ${latestResult}`,
      currentGrowthArea: meaning.timing.growthArea.medium,
      journeyProgress: `Perjalananmu sedang berada dalam ${milestone}, dengan kekuatan utama pada ${signalLabels[strongest] || "kesadaran diri"}.`,
      activeChallenge: meaning.shadow.triggers.medium,
    };
  }
}
