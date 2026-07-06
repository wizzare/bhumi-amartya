import { DailyState } from "@/lib/repositories/dailyStateRepository";
import { WeeklyReflection } from "@/lib/repositories/reflectionRepository";
import { getCompletionItems, getCompletionSummary } from "@/lib/engines/completionEngine";
import { JourneyDailyRecord, WeeklyLearningSummary } from "@/lib/types/journeyDailyRecord";

export const reflectionEngine = {
  /**
   * Generates a weekly soul summary based on 7 days of activity.
   */
  generateWeeklySummary(uid: string, weekId: string, states: DailyState[]): WeeklyReflection {
    const totalActivities = states.reduce((acc, s) => acc + getCompletionSummary(s).count, 0);

    const journalCount = states.filter(s => getCompletionItems(s).some((item) => item.id === "journal" && item.completed)).length;
    const practiceCount = states.filter(s => getCompletionItems(s).some((item) => (item.id === "meditation" || item.id === "audio") && item.completed)).length;

    // Determine Theme
    let theme = "Keseimbangan Batin";
    if (journalCount > practiceCount) theme = "Kejernihan Pikiran";
    if (practiceCount > journalCount) theme = "Ketenteraman Tubuh";
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
  },

  calculateWeeklyLearning(records: JourneyDailyRecord[]): WeeklyLearningSummary {
    const last7 = records.slice(0, 7);
    
    // 1. Frequencies
    const issueCounts: Record<string, number> = {};
    const catCounts: Record<string, number> = {};
    const modeCounts: Record<string, number> = {};
    const skippedCounts: Record<string, number> = {};
    const completedCounts: Record<string, number> = {};
    const reflectionCounts: Record<string, number> = {};

    let totalDuration = 0;
    let completedCount = 0;

    last7.forEach(rec => {
      if (rec.dominantIssue) issueCounts[rec.dominantIssue] = (issueCounts[rec.dominantIssue] || 0) + 1;
      if (rec.issueCategory) catCounts[rec.issueCategory] = (catCounts[rec.issueCategory] || 0) + 1;
      if (rec.navigatorMode) modeCounts[rec.navigatorMode] = (modeCounts[rec.navigatorMode] || 0) + 1;
      
      const comp = rec.innerworkCompletion ?? { completed: false, skipped: true };
      const recType = rec.innerworkRecommendation?.practiceType || "unknown";
      
      if (comp.completed) {
        completedCount++;
        const actType = comp.actualPracticeType || recType;
        completedCounts[actType] = (completedCounts[actType] || 0) + 1;
        if (comp.actualDuration) totalDuration += comp.actualDuration;
        if (comp.reflectionResult) {
          reflectionCounts[comp.reflectionResult] = (reflectionCounts[comp.reflectionResult] || 0) + 1;
        }
      } else if (comp.skipped) {
        skippedCounts[recType] = (skippedCounts[recType] || 0) + 1;
      }
    });

    const getTop = (counts: Record<string, number>, fallback: string): string => {
      const entries = Object.entries(counts);
      if (entries.length === 0) return fallback;
      return entries.sort((a, b) => b[1] - a[1])[0][0];
    };

    const topIssue = getTop(issueCounts, "");
    const topCategory = getTop(catCounts, "boundaries");
    const topMode = getTop(modeCounts, "REFLECTION");
    const topSkipped = getTop(skippedCounts, "Journaling");
    const topCompleted = getTop(completedCounts, "Meditation");
    const topReflection = getTop(reflectionCounts, "Lebih Tenang");

    // 2. Maps to human friendly Indonesian terms
    const themeMap: Record<string, string> = {
      "boundaries": "Batas Diri dan Perlindungan Energi",
      "nervous system": "Menjaga Ketenangan Tubuh",
      "nervous-system": "Menjaga Ketenangan Tubuh",
      "responsibility": "Pelepasan Tanggung Jawab Berlebih",
      "body recovery": "Istirahat dan Pemulihan Tubuh",
      "body-recovery": "Istirahat dan Pemulihan Tubuh",
      "low energy": "Pemulihan Energi Tubuh",
      "low-energy": "Pemulihan Energi Tubuh",
      "emotional release": "Ruang Penerimaan Emosi",
      "emotional-release": "Ruang Penerimaan Emosi",
      "relationship": "Kedekatan dan Hubungan",
      "inner child": "Pemulihan Luka Masa Kecil",
      "inner-child": "Pemulihan Luka Masa Kecil",
      "money and safety": "Rasa Aman Terkait Nilai Diri"
    };

    const issueDescMap: Record<string, string> = {
      "over-responsibility": "kecenderungan memikul terlalu banyak tanggung jawab",
      "boundary-issues": "kesulitan menjaga batas diri",
      "anxiety": "ketegangan pada pikiran dan rasa cemas",
      "grief": "proses pelepasan kesedihan yang mendalam",
      "low-energy": "kelelahan fisik dan kebutuhan tubuh untuk beristirahat"
    };

    const weeklyTheme = themeMap[topCategory.toLowerCase()] || "Keseimbangan Batin";
    
    let weeklyChallenge = "Menjaga ritme kesadaran di tengah aktivitas harian.";
    if (topSkipped.toLowerCase().includes("journal")) {
      weeklyChallenge = "Menyisihkan waktu untuk mengurai isi pikiran ke dalam tulisan.";
    } else if (topSkipped.toLowerCase().includes("medit")) {
      weeklyChallenge = "Menyediakan waktu hening untuk mendengarkan sensasi tubuh.";
    }

    const weeklyOpportunity = `Memberi ruang bagi tema ${weeklyTheme.toLowerCase()} melalui langkah kecil yang dapat dijaga secara konsisten.`;
    
    // Construct Weekly Pattern description
    let issueDescription = issueDescMap[topIssue.toLowerCase()] || topIssue || "pola reaksi emosional yang berulang";
    if (!topIssue) {
      if (topCategory === "boundaries") {
        issueDescription = "kesulitan menjaga batas diri";
      } else if (topCategory === "responsibility") {
        issueDescription = "kecenderungan memikul terlalu banyak tanggung jawab";
      } else {
        const displayCat = themeMap[topCategory.toLowerCase()] || topCategory;
        issueDescription = `pengelolaan tema ${displayCat.toLowerCase()}`;
      }
    }

    const weeklyPattern = `Minggu ini, kamu beberapa kali berhadapan dengan ${issueDescription}.`;

    // Coach observation based on behaviors
    let coachObservation = "Sepertinya kamu lebih mudah menjalani praktik ketika langkahnya sederhana dan melibatkan tubuh.";
    const avgDuration = completedCount > 0 ? totalDuration / completedCount : 0;
    if (avgDuration > 0 && avgDuration <= 6) {
      coachObservation = "Sepertinya kamu lebih mudah bergerak ketika langkahnya sederhana dan tidak terlalu membebani.";
    } else if (completedCounts["Journaling"] && completedCounts["Journaling"] > (completedCounts["Meditation"] || 0)) {
      coachObservation = "Sepertinya tulisan yang terarah lebih membantumu mengurai pikiran daripada praktik dalam keheningan.";
    }

    return {
      weeklyTheme,
      weeklyChallenge,
      weeklyOpportunity,
      weeklyPattern,
      coachObservation
    };
  }
};
