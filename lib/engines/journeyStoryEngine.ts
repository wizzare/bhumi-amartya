/**
 * BHUMI AMARTYA - Journey Story Engine
 * Synthesizes participation data and blueprint into a narrative 'Growth Story'.
 */

import { DailyState } from "@/lib/repositories/dailyStateRepository";
import { UnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";
import { JourneyDailyRecord, MonthlyLearningSummary } from "@/lib/types/journeyDailyRecord";


export interface GrowthStory {
  stage: {
    label: string;
    description: string;
  };
  companionMessage: string;
  growthFocus: string;
  growingAreas: string[];
  attentionAreas: string[];
  nextMilestone: string;
}

function hasSection4Activity(state: DailyState): boolean {
  return Boolean(
    state.journalingDone
      || state.meditationDone
      || state.audioHealingDone
      || state.yogaDone
      || state.workoutDone
      || state.herbalDone
      || state.manifestDone,
  );
}

export const journeyStoryEngine = {
  generateStory(states: DailyState[], synthesis: UnifiedBlueprintSynthesis | null): GrowthStory {
    const totalDone = states.filter(hasSection4Activity).length;
    const streak = states.reduce((acc, s, idx) => {
        // Very basic streak estimation from the list
        if (idx < 7 && hasSection4Activity(s)) return acc + 1;
        return acc;
    }, 0);

    const blueprintSummary = synthesis?.blueprintSummary?.split(".")[0]?.trim();
    const reflectionTheme = synthesis?.practiceThemes?.reflection;
    const actionTheme = synthesis?.practiceThemes?.action;
    const groundingTheme = synthesis?.practiceThemes?.grounding;
    const primaryNeed = synthesis?.coreNeeds?.[0];
    const growthSignal = reflectionTheme || primaryNeed || blueprintSummary;

    // 1. Stage Detection
    let stageLabel = "Awal Kesadaran";
    let stageDesc = "Kamu sedang mulai mengenali pola kecil yang berulang. Fokusnya bukan menyelesaikan semua hal, tetapi membangun ritme yang bisa kamu jaga.";
    if (totalDone > 30) {
      stageLabel = "Integrasi Jiwa";
      stageDesc = "Kebiasaan refleksimu mulai menyatu dengan keseharian. Kini kamu sedang belajar menjaga ritme tanpa memaksa diri.";
    } else if (totalDone > 10) {
      stageLabel = "Pendalaman Diri";
      stageDesc = "Kamu mulai melihat pola diri dengan lebih jernih. Tahap ini mengajakmu memilih respons yang lebih sadar dalam keseharian.";
    }

    // 2. Companion Message
    const companionMessage = blueprintSummary
      ? `${blueprintSummary}. Perjalananmu dibaca dari ritme praktik yang benar-benar kamu jalani, bukan dari tuntutan untuk selalu maju.`
      : "";

    // 3. Growth Focus
    const journalCount = states.filter(s => s.journalingDone).length;
    const meditationCount = states.filter(s => s.meditationDone).length;
    const growthFocus = totalDone === 0
      ? growthSignal
        ? `Perjalananmu baru saja dimulai. Fokus awalnya adalah mengenali ${growthSignal} melalui jejak praktik kecil yang kamu bangun.`
        : "Perjalananmu baru saja dimulai. Bhumi akan membantumu melihat pola batin seiring dengan bertambahnya jejak praktikmu."
      : journalCount > meditationCount
        ? `Beri tubuh ruang untuk tenang sebelum menuliskan isi pikiranmu. Pilih satu prioritas yang merawat ${reflectionTheme || primaryNeed || "arah batinmu hari ini"}.`
        : `Rapikan satu prioritas dulu. Energi akan terasa lebih ringan saat kamu mengarahkannya pada ${actionTheme || primaryNeed || "hal yang paling bisa dijalankan hari ini"}.`;

    // 4. Growing Areas
    const growingAreas = totalDone > 0
      ? [`Ritme hadir yang lebih konsisten${groundingTheme ? `, terutama dalam ${groundingTheme}` : ""}`]
      : [`Keberanian untuk memulai dari ${actionTheme || "langkah kecil"}`];

    // 5. Attention Areas
    const attentionAreas = totalDone === 0
      ? [`Berikan dirimu izin untuk memulai dari ${primaryNeed || "ritme yang paling sederhana"} tanpa tekanan harus langsung sempurna.`]
      : streak < 2
        ? [`Ada bagian dirimu yang membutuhkan jeda untuk menjaga ${groundingTheme || "tenaga batin"} sebelum kembali memenuhi kebutuhan orang lain.`]
        : [`Jaga agar konsistensi tetap terhubung dengan ${reflectionTheme || "kejujuran batin"}, bukan berubah menjadi tuntutan untuk selalu sempurna.`];

    // 6. Next Milestone
    const nextMilestone = totalDone >= 30
      ? `Jaga satu praktik sederhana selama tujuh hari yang mendukung ${groundingTheme || "ritme batinmu"} tanpa menambah target baru.`
      : totalDone >= 7
        ? `Pilih satu praktik refleksi yang membantu ${reflectionTheme || "membaca dirimu"} dan lakukan selama lima hari berturut-turut.`
        : `Lakukan satu praktik refleksi sederhana selama tiga hari berturut-turut untuk membangun ritme pulang ke ${primaryNeed || "dirimu"}.`;

    return {
      stage: { label: stageLabel, description: stageDesc },
      companionMessage,
      growthFocus,
      growingAreas,
      attentionAreas,
      nextMilestone
    };
  },

  calculateMonthlyTheme(records: JourneyDailyRecord[]): MonthlyLearningSummary {
    const last30 = records.slice(0, 30);

    const issueCounts: Record<string, number> = {};
    const catCounts: Record<string, number> = {};
    const compCounts: Record<string, number> = {};

    last30.forEach(rec => {
      if (rec.dominantIssue) issueCounts[rec.dominantIssue] = (issueCounts[rec.dominantIssue] || 0) + 1;
      if (rec.issueCategory) catCounts[rec.issueCategory] = (catCounts[rec.issueCategory] || 0) + 1;
      if (rec.innerworkCompletion?.completed) {
        const cat = rec.issueCategory || "Keseimbangan";
        compCounts[cat] = (compCounts[cat] || 0) + 1;
      }
    });

    const getTop = (counts: Record<string, number>, fallback: string): string => {
      const entries = Object.entries(counts);
      if (entries.length === 0) return fallback;
      return entries.sort((a, b) => b[1] - a[1])[0][0];
    };

    const topCategory = getTop(catCounts, "boundaries");
    const topCompletedCat = getTop(compCounts, topCategory);

    const themeMap: Record<string, string> = {
      "boundaries": "belajar menjaga batas diri demi kesehatan energimu sendiri.",
      "responsibility": "belajar membedakan kepedulian dari tanggung jawab.",
      "nervous system": "menjaga ketenangan tubuh di tengah situasi yang tidak menentu.",
      "nervous-system": "menjaga ketenangan tubuh di tengah situasi yang tidak menentu.",
      "low energy": "belajar melambat dan beristirahat tanpa menghakimi diri sendiri.",
      "low-energy": "belajar melambat dan beristirahat tanpa menghakimi diri sendiri.",
      "body recovery": "belajar melambat dan beristirahat tanpa menghakimi diri sendiri.",
      "body-recovery": "belajar melambat dan beristirahat tanpa menghakimi diri sendiri.",
      "emotional release": "memberi ruang bagi rasa duka dan emosi yang terpendam.",
      "emotional-release": "memberi ruang bagi rasa duka dan emosi yang terpendam."
    };

    const monthlyTheme = `Tema utama bulan ini adalah ${themeMap[topCategory.toLowerCase()] || "menemukan keseimbangan batin melalui praktik kesadaran kecil harian."}`;
    const monthlyPattern = "Selama 30 hari terakhir, kamu perlahan membangun ruang yang lebih utuh untuk hadir bersama dirimu sendiri.";
    
    const growthAreaMap: Record<string, string> = {
      "boundaries": "Keamanan Batas Diri",
      "responsibility": "Kemandirian Emosional",
      "nervous system": "Ketenangan Tubuh",
      "low energy": "Pemulihan Vitalitas Fisik",
      "emotional release": "Pelepasan Emosi Berat"
    };
    const monthlyGrowthArea = growthAreaMap[topCompletedCat.toLowerCase()] || "Kesadaran Batin";
    const monthlyNarrative = `Dalam 30 hari terakhir, tema ${topCategory.toLowerCase()} beberapa kali hadir. Pengalaman ini mungkin sedang membantumu memilih tindakan yang lebih sesuai dengan tenaga yang tersedia.`;

    return {
      monthlyTheme,
      monthlyPattern,
      monthlyGrowthArea,
      monthlyNarrative
    };
  }
};

