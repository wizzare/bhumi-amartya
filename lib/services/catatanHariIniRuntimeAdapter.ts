import type { HumanMeaning, HumanNarrative } from "@/lib/types/humanMeaning";
import type { DashboardAstroRuntime } from "@/lib/services/dashboardAstroRuntimeAdapter";
import type { DashboardJourneyRuntime } from "@/lib/services/dashboardJourneyRuntimeAdapter";
import type { DailyState } from "@/lib/repositories/dailyStateRepository";
import type { DashboardDailyNoteCategories, DashboardDailyNoteCategory } from "@/lib/services/dashboardMirrorRuntimeAdapter";
import type { AstroAwarenessContext } from "../engines/astroAwarenessEngine";

export type CalendarContext = {
  tone: string;
  focus: string;
};

export type CatatanHariIniRuntimeInput = {
  meaning: HumanMeaning;
  astro: DashboardAstroRuntime;
  journey: DashboardJourneyRuntime;
  state: DailyState | null;
  calendar: CalendarContext;
  awareness?: AstroAwarenessContext;
};

export class CatatanHariIniRuntimeAdapter {
  public static build(input: CatatanHariIniRuntimeInput): DashboardDailyNoteCategories {
    const state = this.stateContext(input.state);
    
    const sharedReason = [
      input.calendar.tone,
      input.astro.humanImpact,
      input.journey.innerworkCompletion,
      state.summary
    ].filter(Boolean).join(" ");

    const sharedAdvice = [
      input.calendar.focus,
      input.astro.dailyFocus,
      state.action,
    ].filter(Boolean).join(" ");

    return {
      general: this.category(input.meaning.timing.currentState, sharedReason, input.astro.practicalAwareness, sharedAdvice),
      mental: this.category(input.meaning.energy.authority, sharedReason, input.journey.activeChallenge, sharedAdvice),
      finance: this.category(input.meaning.talents.wealthFlow, sharedReason, input.meaning.talents.workStyle.long, sharedAdvice),
      love: this.category(input.meaning.relationships.attraction, sharedReason, input.meaning.relationships.loveLanguage.long, sharedAdvice),
      relational: this.category(input.meaning.relationships.pattern, sharedReason, input.meaning.relationships.boundaries.long, sharedAdvice),
      spiritual: this.category(input.meaning.spirituality.path, sharedReason, input.meaning.spirituality.evolution.long, sharedAdvice),
      challenges: this.category(input.meaning.shadow.sabotage, sharedReason, input.journey.currentGrowthArea, sharedAdvice),
      opportunities: this.category(input.meaning.talents.potential, sharedReason, input.journey.journeyProgress, sharedAdvice),
      advice: this.category(input.meaning.timing.dailyFocus, sharedReason, input.astro.practicalAwareness, sharedAdvice),
    };
  }

  public static calendarContext(dateKey: string): CalendarContext {
    const day = new Date(dateKey + "T12:00:00").getDay();
    return [
      { tone: "Minggu memberi ruang untuk melihat kembali perjalananmu tanpa terburu-buru.", focus: "Gunakan hari ini untuk refleksi dan persiapan yang ringan." },
      { tone: "Senin membawa energi permulaan, arah, dan penentuan prioritas.", focus: "Tentukan satu prioritas yang memberi arah pada pekanmu." },
      { tone: "Selasa mendukung momentum dan pelaksanaan yang terukur.", focus: "Teruskan satu pekerjaan yang sudah jelas langkah berikutnya." },
      { tone: "Rabu mengajakmu menilai ritme dan melakukan penyesuaian.", focus: "Periksa apa yang perlu diteruskan, diubah, atau dikurangi." },
      { tone: "Kamis mendukung integrasi pengalaman dan pembelajaran.", focus: "Ambil satu pelajaran lalu terapkan dalam tindakan nyata." },
      { tone: "Jumat membawa tema penyelesaian dan penghargaan atas hasil.", focus: "Tutup satu lingkaran sebelum membuka pekerjaan baru." },
      { tone: "Sabtu memberi ruang bagi pemulihan dan kehidupan personal.", focus: "Pulihkan tenaga dan rawat satu kebutuhan pribadimu." },
    ][day];
  }

  private static category(
    identity: HumanNarrative,
    context: string,
    reflection: string,
    advice: string,
  ): DashboardDailyNoteCategory {
    return {
      insight: identity.short,
      reason: identity.medium + " " + context,
      reflection,
      advice,
    };
  }

  private static stateContext(state: DailyState | null): { summary: string; action: string } {
    const metrics = state?.wellnessSnapshot?.metrics;
    const mood = state?.moodLevel ?? metrics?.emotion;
    const energy = metrics?.energy;
    const stressSignal = state?.nervousSystemState?.toLowerCase() ?? "";
    const stressed = /stress|tegang|cemas|fight|flight|freeze/.test(stressSignal) || (metrics?.emotion !== undefined && metrics.emotion <= 4);

    if ((energy !== undefined && energy <= 4) || (mood !== undefined && mood <= 4)) {
      return {
        summary: "Kondisimu sedang membutuhkan beban yang lebih ringan dan ruang pemulihan yang nyata.",
        action: "Kurangi tuntutan, pilih satu langkah kecil, lalu berhenti sebelum tenaga habis.",
      };
    }
    if (stressed) {
      return {
        summary: "Sistem tubuhmu sedang lebih peka terhadap tekanan, sehingga keputusan perlu dibuat setelah ketegangan menurun.",
        action: "Tenangkan tubuh lebih dulu, lalu jawab hanya hal yang benar-benar perlu.",
      };
    }
    if (energy !== undefined && energy >= 8 && mood !== undefined && mood >= 7) {
      return {
        summary: "Energi dan suasana hatimu cukup kuat untuk membawa satu hal penting menuju kemajuan.",
        action: "Gunakan tenaga yang tersedia untuk satu hasil bermakna, bukan untuk membuka terlalu banyak arah.",
      };
    }
    if (!state?.wellnessSnapshot?.checkInCompleted && state?.moodLevel == null) {
      return {
        summary: "Check-in hari ini belum tercatat, jadi arah terbaik adalah tetap peka pada perubahan kapasitasmu.",
        action: "Periksa tubuh dan suasana hati sebelum menambah komitmen.",
      };
    }
    return {
      summary: "Kondisimu cukup stabil untuk bergerak dengan ritme yang seimbang.",
      action: "Jaga tempo, selesaikan satu hal, dan sisakan tenaga untuk pemulihan.",
    };
  }
}
