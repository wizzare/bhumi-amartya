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
    const totalDays = states.length || 1;
    const completedDays = states.filter(s => [s.journalingDone, s.meditationDone, s.audioHealingDone, s.workoutDone, s.yogaDone, s.herbalDone].filter(Boolean).length >= 2).length;

    const journalCount = states.filter(s => s.journalingDone).length;
    const meditationCount = states.filter(s => s.meditationDone).length;
    const varietyCount = states.reduce((acc, s) => {
        const dailyVariety = [s.journalingDone, s.meditationDone, s.audioHealingDone, s.workoutDone, s.yogaDone, s.herbalDone].filter(Boolean).length;
        return acc + dailyVariety;
    }, 0);

    const signals: GrowthSignals = {
      awareness: Math.min(100, (totalDays * 10)), // Simulated based on usage days
      consistency: Math.round((completedDays / totalDays) * 100),
      depth: Math.min(100, (journalCount * 20)),
      balance: Math.min(100, (varietyCount * 5)),
      courage: Math.min(100, (meditationCount * 15)), // Placeholder logic
      acceptance: 75 // Baseline for Alpha
    };

    let milestone = "The Seed";
    let icon = "🌱";
    if (completedDays >= 30) { milestone = "The Canopy"; icon = "☀️"; }
    else if (completedDays >= 14) { milestone = "The Sapling"; icon = "🌳"; }
    else if (completedDays >= 7) { milestone = "The Sprout"; icon = "🌿"; }

    return {
      signals,
      currentMilestone: milestone,
      milestoneIcon: icon,
      story: `Berdasarkan ${completedDays} hari aktifmu, jiwamu sedang berada di fase ${milestone}. Kamu menunjukkan kekuatan dalam ${signals.consistency > 50 ? 'konsistensi' : 'eksplorasi'} dan sedang membangun akar yang dalam bagi pertumbuhanmu.`
    };
  }
};
