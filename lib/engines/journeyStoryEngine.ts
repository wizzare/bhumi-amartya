/**
 * BHUMI AMARTYA - Journey Story Engine
 * Synthesizes participation data and blueprint into a narrative 'Growth Story'.
 */

import { DailyState } from "@/lib/repositories/dailyStateRepository";
import { UnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";

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

export const journeyStoryEngine = {
  generateStory(states: DailyState[], synthesis: UnifiedBlueprintSynthesis): GrowthStory {
    const totalDone = states.filter(s => s.journalingDone || s.meditationDone || s.audioHealingDone).length;
    const streak = states.reduce((acc, s, idx) => {
        // Very basic streak estimation from the list
        if (idx < 7 && (s.journalingDone || s.meditationDone || s.audioHealingDone)) return acc + 1;
        return acc;
    }, 0);

    // Keep blueprint data available as internal context without exposing its
    // technical labels in the user-facing Journey narrative.
    void synthesis;

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
    const companionMessage = "";

    // 3. Growth Focus
    const journalCount = states.filter(s => s.journalingDone).length;
    const meditationCount = states.filter(s => s.meditationDone).length;
    const growthFocus = journalCount > meditationCount
      ? "Beri tubuh ruang untuk tenang sebelum menuliskan isi pikiranmu. Pilih satu prioritas yang benar-benar perlu dirawat hari ini."
      : "Rapikan satu prioritas dulu. Energi akan terasa lebih ringan saat kamu tidak memaksa semua hal selesai bersamaan.";

    // 4. Growing Areas
    const growingAreas = totalDone > 0
      ? ["Ritme hadir yang lebih konsisten"]
      : ["Keberanian untuk memulai dari langkah kecil"];

    // 5. Attention Areas
    const attentionAreas = streak < 2
      ? ["Ada bagian dirimu yang membutuhkan jeda sebelum kembali memenuhi kebutuhan orang lain."]
      : ["Jaga agar konsistensi tidak berubah menjadi tuntutan untuk selalu sempurna."];

    // 6. Next Milestone
    const nextMilestone = totalDone >= 30
      ? "Jaga satu praktik sederhana selama tujuh hari tanpa menambah target baru."
      : totalDone >= 7
        ? "Pilih satu praktik refleksi dan lakukan selama lima hari berturut-turut."
        : "Lakukan satu praktik refleksi sederhana selama tiga hari berturut-turut untuk membangun ritme pulang ke diri.";

    return {
      stage: { label: stageLabel, description: stageDesc },
      companionMessage,
      growthFocus,
      growingAreas,
      attentionAreas,
      nextMilestone
    };
  }
};
