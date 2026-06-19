import type { HumanMeaning } from "@/lib/types/humanMeaning";
import type { CanonicalIdentity } from "@/lib/types/canonical";
import type { InnerworkRuntimeData, InnerworkRecommendation } from "@/lib/types/innerworkRuntime";

export class InnerworkRuntimeAdapter {
  public static buildRecommendations(
    meaning: HumanMeaning,
    canonical: CanonicalIdentity
  ): InnerworkRuntimeData {
    return {
      recommendations: [
        this.buildMeditation(meaning, canonical),
        this.buildJournaling(meaning, canonical),
        this.buildAudioHealing(meaning, canonical),
        this.buildYoga(meaning, canonical),
        this.buildWorkout(meaning, canonical),
        this.buildHealthyFood(meaning, canonical),
      ],
    };
  }

  private static buildMeditation(meaning: HumanMeaning, canonical: CanonicalIdentity): InnerworkRecommendation {
    const timing = canonical.timing.currentDasha;
    let suggestion = "Meditasi Kesadaran Napas (Mindfulness)";
    
    if (timing === "Rahu" || timing === "Ketu") {
      suggestion = "Meditasi Grounding & Pelepasan Ego";
    } else if (timing === "Jupiter" || timing === "Venus") {
      suggestion = "Meditasi Syukur & Visualisasi Kelimpahan";
    } else {
      suggestion = "Meditasi Ketenangan Batin (Vipassana)";
    }

    return {
      module: "Meditation",
      suggestion,
      reasoning: `Berdasarkan fase hidupmu saat ini, ${meaning.timing.medium.toLowerCase()}`,
    };
  }

  private static buildJournaling(meaning: HumanMeaning, canonical: CanonicalIdentity): InnerworkRecommendation {
    const lifePath = canonical.purpose.lifePath;
    let suggestion = "Jurnal Refleksi Harian";

    if (lifePath === 22 || lifePath === 4) {
      suggestion = "Jurnal Perencanaan Strategis & Syukur";
    } else if (lifePath === 6 || lifePath === 9) {
      suggestion = "Jurnal Pelepasan Emosi & Empati";
    } else if (lifePath === 11) {
      suggestion = "Jurnal Saluran Intuitif (Automatic Writing)";
    }

    return {
      module: "Journaling",
      suggestion,
      reasoning: `Sesuai dengan dorongan tujuan hidupmu, ${meaning.purpose.medium.toLowerCase()}`,
    };
  }

  private static buildAudioHealing(meaning: HumanMeaning, canonical: CanonicalIdentity): InnerworkRecommendation {
    const shadow = canonical.shadow.karmicTail.join("-");
    let suggestion = "Binaural Beats untuk Relaksasi";

    if (shadow === "18-6-15" || shadow === "12-16-4") {
      suggestion = "Frekuensi 432Hz untuk Penyembuhan Luka & Self-Love";
    } else if (shadow === "15-5-8" || shadow === "21-4-10") {
      suggestion = "Solfeggio 396Hz untuk Melepaskan Ketakutan & Kontrol";
    } else if (shadow === "9-3-21") {
      suggestion = "Frekuensi 528Hz untuk Perbaikan Keselarasan Batin";
    }

    return {
      module: "Audio Healing",
      suggestion,
      reasoning: `Untuk membantu melembutkan pola sabotasemu, ${meaning.shadow.medium.toLowerCase()}`,
    };
  }

  private static buildYoga(meaning: HumanMeaning, canonical: CanonicalIdentity): InnerworkRecommendation {
    const energyType = canonical.energy.strategy;
    let suggestion = "Hatha Yoga";

    if (energyType.includes("Respond")) {
      suggestion = "Vinyasa Flow Dinamis";
    } else if (energyType.includes("Invitation")) {
      suggestion = "Yin Yoga Restoratif";
    } else if (energyType.includes("Lunar")) {
      suggestion = "Kundalini Yoga Perlahan";
    }

    return {
      module: "Yoga",
      suggestion,
      reasoning: `Dirancang untuk selaras dengan ritme energimu, di mana ${meaning.energy.medium.toLowerCase()}`,
    };
  }

  private static buildWorkout(meaning: HumanMeaning, canonical: CanonicalIdentity): InnerworkRecommendation {
    const authority = canonical.energy.authority;
    let suggestion = "Latihan Ketahanan Ringan";

    if (authority === "Sacral" || authority === "Emotional") {
      suggestion = "Latihan Kekuatan Intensitas Tinggi (HIIT / Angkat Beban)";
    } else if (authority === "Splenic" || authority === "Self-Projected") {
      suggestion = "Latihan Kardio Berbasis Kesadaran (Pilates / Renang)";
    } else {
      suggestion = "Jalan Kaki Lambat di Alam & Peregangan";
    }

    return {
      module: "Workout",
      suggestion,
      reasoning: `Sesuai dengan otoritas tubuhmu, pastikan rutinitas ini tidak dipaksakan, melainkan ${meaning.energy.short.toLowerCase()}`,
    };
  }

  private static buildHealthyFood(meaning: HumanMeaning, canonical: CanonicalIdentity): InnerworkRecommendation {
    const element = canonical.energy.dominantElement;
    let suggestion = "Pola Makan Seimbang Berbasis Tanaman";

    if (element.includes("Api")) {
      suggestion = "Makanan Bersifat Pendingin (Hydrating: Buah Air, Sayur Mentah)";
    } else if (element.includes("Air") || element.includes("Logam")) {
      suggestion = "Makanan Bersifat Menghangatkan (Root Vegetables, Rempah-Rempah)";
    } else if (element.includes("Tanah") || element.includes("Kayu")) {
      suggestion = "Diet Seimbang Protein Kaya & Fermentasi";
    }

    return {
      module: "Healthy Food",
      suggestion,
      reasoning: `Tubuhmu membutuhkan asupan yang menyeimbangkan elemen alamimu, mengingat ${meaning.identity.long.substring(0, 100).toLowerCase()}...`,
    };
  }
}
