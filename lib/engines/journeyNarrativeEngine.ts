/**
 * BHUMI AMARTYA - Journey Narrative Engine
 * Transforms activity data into a soulful growth story using full blueprint context.
 */

import { DailyState } from "@/lib/repositories/dailyStateRepository";
import { UnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";

export interface JourneyStory {
  narrative: string;
  growthEdge: string;
  soulInsight: string;
  milestoneTitle: string;
}

export const journeyNarrativeEngine = {
  generateStory(states: DailyState[], synthesis: UnifiedBlueprintSynthesis): JourneyStory {
    const totalDone = states.filter(s => s.journalingDone || s.meditationDone || s.audioHealingDone).length;
    const streak = states.reduce((acc, s, idx) => {
      if (idx === 0 && (s.journalingDone || s.meditationDone || s.audioHealingDone)) return 1;
      // Simple streak logic for demo
      return acc;
    }, 0);

    const name = synthesis.identitySignals.sunSign || "Jiwa";
    const lp = synthesis.identitySignals.lifePath;
    const hd = synthesis.identitySignals.humanDesignType;
    const wound = synthesis.fullBlueprint.destinyMatrix.karmicTail ? `mengolah pola ${synthesis.fullBlueprint.destinyMatrix.karmicTail}` : "mengenali diri";

    // 1. Narrative based on participation + blueprint
    let narrative = `Perjalananmu sejauh ini adalah tentang ${wound}. `;
    if (totalDone > 10) narrative += `Dengan ${totalDone} jejak praktik, kamu mulai menunjukkan kematangan seorang ${hd} yang tekun.`;
    else if (totalDone > 0) narrative += `Setiap langkah kecil yang kamu ambil sedang membangun fondasi bagi misi jiwamu sebagai Life Path ${lp}.`;
    else narrative += "Hari ini adalah lembaran kosong yang menantimu untuk mulai menuliskan cerita pertumbuhan baru.";

    // 2. Growth Edge
    let growthEdge = "Menjaga ritme harian agar tetap hidup.";
    const soulSearching = synthesis.fullBlueprint.destinyMatrix.destinyIntelligence?.soulSearching;

    if (soulSearching && soulSearching > 15) {
      growthEdge = `Memperdalam pencarian makna batin (Soul Searching ${soulSearching}) agar tidak hanya menjadi rutinitas.`;
    } else if (hd === "Projector") {
      growthEdge = "Belajar menunggu momen yang tepat tanpa merasa tertinggal.";
    } else if (streak >= 3) {
      growthEdge = `Mempertahankan momentum ${streak} hari ini dengan kejujuran batin yang lebih dalam.`;
    }

    // 3. Soul Insight
    const yesterdayDone = states[0]?.journalingDone || states[0]?.meditationDone;
    const soulInsight = yesterdayDone
      ? `Keberhasilanmu kemarin adalah bukti bahwa ${synthesis.blueprintSummary.split('.')[0].toLowerCase()}.`
      : `Ingatlah bahwa ${synthesis.blueprintSummary.split('.')[0]}. Kehadiranmu hari ini adalah kontribusi terbesar bagi pertumbuhanmu.`;

    // 4. Milestone
    const milestoneTitle = totalDone >= 30 ? "Penjaga Cahaya" : totalDone >= 7 ? "Pencari Jati Diri" : "Awal Kesadaran";

    return {
      narrative,
      growthEdge,
      soulInsight,
      milestoneTitle
    };
  }
};
