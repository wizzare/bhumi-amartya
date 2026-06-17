import { getCompletionItems, getCompletionSummary } from "@/lib/engines/completionEngine";
import { DailyState } from "@/lib/repositories/dailyStateRepository";

export interface GrowthSignals {
  awareness: number; // 0-100
  consistency: number;
  depth: number;
  balance: number;
  courage: number;
  acceptance: number;
}

export interface GrowthProfile {
  signals: GrowthSignals;
  currentMilestone: string;
  milestoneIcon: string;
  story: string;
}

export const growthEngine = {
  calculateGrowth(states: DailyState[]): GrowthProfile {
    const totalDays = Math.max(states.length, 1);
    const summaries = states.map(getCompletionSummary);
    const completedDays = summaries.filter((summary) => summary.count >= 2).length;
    const fullDays = summaries.filter((summary) => summary.status === "full").length;
    const totalCompletedItems = summaries.reduce((acc, summary) => acc + summary.count, 0);
    const averageCompletion = totalCompletedItems / totalDays;
    const completionRate = Math.round((totalCompletedItems / (totalDays * 6)) * 100);
    const streakDays = calculateCurrentStreak(states);

    const awarenessDays = countSignalDays(states, ["checkIn", "journal"]);
    const depthDays = countSignalDays(states, ["journal", "innerwork"]);
    const balanceDays = summaries.filter((summary) => summary.count >= 3).length;
    const courageDays = states.filter(hasCourageSignal).length;
    const acceptanceDays = countSignalDays(states, ["manifest", "innerwork"]);

    const signals: GrowthSignals = {
      awareness: scoreFromDays(awarenessDays, totalDays, 15),
      consistency: Math.min(100, Math.round(((completedDays / totalDays) * 70) + Math.min(streakDays, 7) * 4)),
      depth: scoreFromDays(depthDays, totalDays, 10),
      balance: Math.min(100, Math.round(((balanceDays / totalDays) * 75) + Math.min(averageCompletion, 6) * 4)),
      courage: scoreFromDays(courageDays, totalDays, 10),
      acceptance: scoreFromDays(acceptanceDays, totalDays, 12),
    };

    let milestone = "The Seed";
    let icon = "*";
    if (fullDays >= 3 || completedDays >= 21 || (streakDays >= 14 && completionRate >= 65)) {
      milestone = "The Canopy";
      icon = "^^";
    } else if (completedDays >= 10 || (streakDays >= 7 && completionRate >= 45)) {
      milestone = "The Sapling";
      icon = "^";
    } else if (completedDays >= 3 || streakDays >= 3 || totalCompletedItems >= 6) {
      milestone = "The Sprout";
      icon = "+";
    }

    return {
      signals,
      currentMilestone: milestone,
      milestoneIcon: icon,
      story: `Berdasarkan ${completedDays} hari aktif dari ${states.length} catatan terakhir, tahap pertumbuhanmu berada di ${milestone}. Sinyal terkuat saat ini adalah ${getStrongestSignal(signals)}, sementara ritmemu tetap dibaca dari jejak aktivitas terbaru.`,
    };
  },
};

function countSignalDays(states: DailyState[], ids: string[]): number {
  return states.filter((state) =>
    getCompletionItems(state).some((item) => ids.includes(item.id) && item.completed),
  ).length;
}

function hasCourageSignal(state: DailyState): boolean {
  const hardCheckIn = state.wellnessSnapshot?.metrics
    ? state.wellnessSnapshot.metrics.emotion <= 3 || state.wellnessSnapshot.metrics.energy <= 3
    : false;

  return Boolean(state.assessmentDone || state.supportPathDone || hardCheckIn);
}

function scoreFromDays(days: number, totalDays: number, baseline = 8): number {
  if (totalDays <= 0 || days <= 0) return baseline;
  return Math.min(100, Math.max(baseline, Math.round((days / totalDays) * 100)));
}

function calculateCurrentStreak(states: DailyState[]): number {
  const activeDates = new Set(
    states
      .filter((state) => getCompletionSummary(state).count > 0)
      .map((state) => state.date),
  );
  const cursor = new Date();
  let streak = 0;

  for (let index = 0; index < 30; index += 1) {
    const key = cursor.toISOString().slice(0, 10);
    if (!activeDates.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getStrongestSignal(signals: GrowthSignals): string {
  const labels: Record<keyof GrowthSignals, string> = {
    awareness: "Kesadaran",
    consistency: "Konsistensi",
    depth: "Kedalaman",
    balance: "Keseimbangan",
    courage: "Keberanian",
    acceptance: "Penerimaan",
  };
  const [key] = (Object.entries(signals) as [keyof GrowthSignals, number][])
    .sort((a, b) => b[1] - a[1])[0];
  return labels[key];
}
