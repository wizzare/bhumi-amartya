import { DailyState } from "@/lib/repositories/dailyStateRepository";
import { WeeklyReflection } from "@/lib/repositories/reflectionRepository";

export const reflectionEngine = {
  /**
   * Generates a weekly soul summary based on 7 days of activity.
   */
  generateWeeklySummary(uid: string, weekId: string, states: DailyState[]): WeeklyReflection {
    const totalActivities = states.reduce((acc, s) => {
      return acc + [s.journalingDone, s.meditationDone, s.audioHealingDone, s.workoutDone, s.yogaDone, s.herbalDone].filter(Boolean).length;
    }, 0);

    const journalCount = states.filter(s => s.journalingDone).length;
    const meditationCount = states.filter(s => s.meditationDone).length;

    // Determine Theme
    let theme = "Keseimbangan Batin";
    if (journalCount > meditationCount) theme = "Kejernihan Pikiran";
    if (meditationCount > journalCount) theme = "Ketenteraman Tubuh";
    if (totalActivities < 5) theme = "Awal Kesadaran";

    return {
      uid,
      weekId,
      startDate: states[states.length - 1]?.date || "",
      endDate: states[0]?.date || "",
      theme,
      lessons: [
        "Setiap langkah kecil dalam innerwork membangun fondasi ketenangan yang lebih kuat.",
        "Konsistensi lebih berharga daripada intensitas sesaat."
      ],
      smallWins: [
        `Menyelesaikan total ${totalActivities} aktivitas pilar minggu ini.`,
        journalCount > 0 ? "Berhasil menuangkan pikiran ke dalam jurnal." : "Mulai menyisihkan waktu untuk diri sendiri."
      ],
      mainChallenge: totalActivities < 10 ? "Menjaga ritme di tengah kesibukan harian." : "Memperdalam kualitas kehadiran saat praktik.",
      focusNextWeek: "Mencoba pilar innerwork yang belum sempat kamu eksplorasi minggu ini.",
      soulSummary: `Minggu ini perjalanan jiwamu berfokus pada ${theme.toLowerCase()}. Dengan ${totalActivities} jejak aktivitas, kamu sedang memperkuat akar kesadaranmu.`,
      generatedAt: new Date().toISOString()
    };
  }
};
