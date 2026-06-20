/**
 * BHUMI AMARTYA - Journey Narrative Engine
 * Transforms activity data into a soulful growth story using full blueprint context.
 */

import { DailyState } from "@/lib/repositories/dailyStateRepository";
import { UnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";
import { JourneyDailyRecord, CoachMemorySummary } from "@/lib/types/journeyDailyRecord";


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
  },

  generateCoachMemory(records: JourneyDailyRecord[], synthesis?: UnifiedBlueprintSynthesis): CoachMemorySummary {
    const last30 = records.slice(0, 30);
    const bhumiObservations: string[] = [];

    let somaticCompleted = 0;
    let mentalCompleted = 0;
    let shortCompleted = 0;
    let longCompleted = 0;
    let lowSleepCompleted = 0;
    let lowSleepTotal = 0;

    last30.forEach(rec => {
      const comp = rec.innerworkCompletion ?? { completed: false, skipped: true };
      if (!comp.completed) {
        if (rec.wellnessState?.sleep && Number(rec.wellnessState.sleep) < 6) {
          lowSleepTotal++;
        }
        return;
      }

      const pType = rec.innerworkRecommendation?.practiceType || comp.actualPracticeType || "unknown";
      if (pType.toLowerCase().includes("journal")) {
        mentalCompleted++;
      } else if (pType.toLowerCase().includes("medit") || pType.toLowerCase().includes("yoga") || pType.toLowerCase().includes("audio")) {
        somaticCompleted++;
      }

      const duration = comp.actualDuration || rec.innerworkRecommendation?.durationMinutes || 0;
      if (duration > 0) {
        if (duration <= 6) shortCompleted++;
        else longCompleted++;
      }

      if (rec.wellnessState?.sleep && Number(rec.wellnessState.sleep) < 6) {
        lowSleepTotal++;
        lowSleepCompleted++;
      }
    });

    if (somaticCompleted === 0 && mentalCompleted === 0) {
      return {
        coachMemory: "Bhumi masih belajar mengenali ritmemu. Teruskan praktik dan refleksimu agar Bhumi dapat memberikan catatan yang lebih personal.",
        bhumiObservations: [
          "Bhumi masih belajar mengenali ritmemu.",
          "Teruskan praktik dan refleksimu agar Bhumi dapat memberikan catatan yang lebih personal."
        ]
      };
    }

    // Heuristics 1: Somatic vs Mental
    if (somaticCompleted > mentalCompleted) {
      bhumiObservations.push("Kamu cenderung berkembang lebih baik melalui praktik singkat yang langsung melibatkan tubuh dibanding praktik yang terlalu panjang.");
    } else if (mentalCompleted > somaticCompleted) {
      bhumiObservations.push("Kamu cenderung lebih cepat menemukan kejernihan saat menuangkan isi kepala ke dalam tulisan dibanding meditasi hening.");
    } else {
      bhumiObservations.push("Kamu menyeimbangkan pemrosesan fisik dan mental dengan baik sepanjang perjalananmu.");
    }

    // Heuristics 2: Short vs Long
    if (shortCompleted > longCompleted) {
      bhumiObservations.push("Kamu lebih mudah bergerak maju ketika langkahnya sederhana dan tidak terlalu membebani.");
    } else if (longCompleted > shortCompleted) {
      bhumiObservations.push("Kamu menikmati eksplorasi diri yang mendalam dan memberikan waktu lebih panjang untuk meresapi setiap panduan.");
    }

    // Heuristics 3: Sleep/Energy behaviors
    if (lowSleepTotal > 0 && (lowSleepCompleted / lowSleepTotal) < 0.3) {
      bhumiObservations.push("Ketika tidurmu kurang dari 6 jam, kamu cenderung melompati praktik. Di hari seperti ini, Bhumi akan membantumu dengan langkah pemulihan yang sangat ringan.");
    }

    // Fallback seed data if no records exist to ensure "No Coming Soon"
    if (bhumiObservations.length === 0) {
      bhumiObservations.push(
        "Bhumi masih belajar mengenali ritmemu.",
        "Teruskan praktik dan refleksimu agar Bhumi dapat memberikan catatan yang lebih personal."
      );
    }

    const coachMemory = `Akhir-akhir ini, Bhumi memperhatikan bahwa ${bhumiObservations.join(" Selain itu, ").replace(/^Kamu/, "kamu")}`;

    return {
      coachMemory,
      bhumiObservations
    };
  }
};

