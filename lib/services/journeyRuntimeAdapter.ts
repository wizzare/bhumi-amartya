import type { CanonicalIdentity } from "@/lib/types/canonical";
import type { HumanMeaning } from "@/lib/types/humanMeaning";
import type { InnerworkRuntimeData } from "@/lib/types/innerworkRuntime";
import type { JourneyInput, JourneyIntelligence } from "@/lib/types/journeyRuntime";

export class JourneyRuntimeAdapter {
  public static generateIntelligence(
    canonical: CanonicalIdentity,
    meaning: HumanMeaning,
    innerwork: InnerworkRuntimeData,
    input: JourneyInput
  ): JourneyIntelligence {
    const isExhausted = input.dailyCheckIn.energy <= 4 || input.dailyCheckIn.sleep < 6;
    const isAnxious = input.dailyCheckIn.mood.toLowerCase().includes("cemas") || input.dailyCheckIn.mood.toLowerCase().includes("anxious");
    const activePractices = Object.values(input.logs).filter(Boolean).length;

    return {
      growthSignal: this.buildGrowthSignal(canonical, isExhausted, activePractices),
      momentumSignal: this.buildMomentumSignal(meaning, activePractices),
      stuckSignal: this.buildStuckSignal(canonical, isAnxious, input.logs),
      patternSignal: this.buildPatternSignal(canonical, meaning, input),
      blindSpotSignal: this.buildBlindSpotSignal(canonical, meaning, input),
      nextSmallStep: this.buildNextSmallStep(innerwork, input),
    };
  }

  private static buildGrowthSignal(canonical: CanonicalIdentity, isExhausted: boolean, activePractices: number): string {
    if (isExhausted) {
      return "Tubuhmu sedang meminta jeda. Memaksa produktivitas saat ini justru menghambat pertumbuhan jangka panjangmu.";
    }
    if (activePractices >= 3) {
      return "Fondasi keseharianmu sangat kuat. Kamu berada dalam posisi prima untuk mengambil keputusan besar atau memulai proyek baru.";
    }
    return "Pertumbuhan yang stabil. Perhatikan ritme harianmu agar tidak terlalu terburu-buru mengejar hasil.";
  }

  private static buildMomentumSignal(meaning: HumanMeaning, activePractices: number): string {
    if (activePractices > 0) {
      return `Konsistensimu sedang selaras dengan energi alamimu: ${meaning.energy.short.toLowerCase()}. Pertahankan ritme ini tanpa memaksakan intensitas.`;
    }
    return "Momentum sedang melambat. Ini bukan saatnya mengkritik diri sendiri, melainkan saat yang tepat untuk mengevaluasi kembali prioritasmu.";
  }

  private static buildStuckSignal(canonical: CanonicalIdentity, isAnxious: boolean, logs: JourneyInput["logs"]): string {
    const karmicTail = canonical.shadow.karmicTail.join("-");
    if (isAnxious) {
      if (karmicTail === "15-5-8") {
        return "Kamu merasa terjebak karena berusaha mengontrol hal-hal di luar kuasamu. Lepaskan perfeksionismemu sejenak.";
      }
      if (karmicTail === "18-6-15") {
        return "Rasa cemas ini muncul karena kamu terlalu fokus pada ekspektasi orang lain, melupakan batas sehatmu sendiri.";
      }
      return "Ada kecemasan yang mendasari siklus stagnasimu saat ini. Kembali pada rutinitas fisik untuk menjangkarkan pikiranmu.";
    }
    if (!logs.meditation && !logs.journaling) {
      return "Tanpa refleksi, hari-harimu berjalan secara otomatis. Kamu tidak terjebak, kamu hanya kehilangan kesadaran pada arah tujuanmu.";
    }
    return "Tidak ada sinyal stagnasi yang kuat. Terus melangkah.";
  }

  private static buildPatternSignal(canonical: CanonicalIdentity, meaning: HumanMeaning, input: JourneyInput): string {
    const lifePath = canonical.purpose.lifePath;
    if (input.dailyCheckIn.energy > 7 && input.logs.workout) {
      return "Pola Positif: Menyelaraskan gerak tubuh dengan energi tinggimu menghasilkan kejernihan mental yang luar biasa sepanjang hari.";
    }
    if (input.dailyCheckIn.sleep < 6) {
      return `Pola Sabotase: Kurang tidur mengaktifkan sisi protektifmu. Mengingat tujuan hidupmu (${meaning.purpose.short}), kelelahan akan membuatmu bersikap reaktif.`;
    }
    return `Pola Netral: Kebiasaanmu saat ini cukup seimbang untuk menopang kebutuhan emosionalmu.`;
  }

  private static buildBlindSpotSignal(canonical: CanonicalIdentity, meaning: HumanMeaning, input: JourneyInput): string {
    if (canonical.energy.strategy.includes("Respond") && input.logs.workout === false) {
      return "Blind Spot: Energi Generator-mu tidak tersalurkan. Kamu mungkin merasa gelisah bukan karena masalah mental, melainkan karena kelebihan energi fisik yang tidak terpakai.";
    }
    if (canonical.energy.strategy.includes("Invitation") && input.dailyCheckIn.energy < 5) {
      return "Blind Spot: Kamu telah menyerap energi dari lingkungan yang tidak sehat. Sebagai Projector, kelelahanmu sering kali adalah milik orang lain yang kamu bawa pulang.";
    }
    if (input.logs.meditation === false && input.logs.journaling === false) {
      return "Blind Spot: Kamu bergerak terlalu cepat dari satu tugas ke tugas lain tanpa memberi ruang bagi intuisimu untuk berbicara.";
    }
    return "Kesadaran diri sedang tinggi. Kamu cukup peka terhadap kebutuhan aslimu hari ini.";
  }

  private static buildNextSmallStep(innerwork: InnerworkRuntimeData, input: JourneyInput): string {
    // Find a recommended module that the user HAS NOT done today
    const missedPractices = innerwork.recommendations.filter(rec => {
      const moduleKey = rec.module.toLowerCase().replace(" ", "") as keyof JourneyInput["logs"];
      // Handle mapping module names to the boolean log keys
      let key = moduleKey;
      if (rec.module === "Audio Healing") key = "audioHealing" as keyof JourneyInput["logs"];
      if (rec.module === "Healthy Food") key = "healthyFood" as keyof JourneyInput["logs"];
      
      return !input.logs[key];
    });

    if (missedPractices.length > 0) {
      const next = missedPractices[0];
      return `Langkah terkecil untuk kembali selaras hari ini: Lakukan ${next.suggestion}. ${next.reasoning}.`;
    }
    
    return "Kamu telah memenuhi semua kebutuhan spiritual dan fisik dasarmu hari ini. Langkah selanjutnya: Istirahat dan biarkan proses kehidupan bekerja untukmu.";
  }
}
