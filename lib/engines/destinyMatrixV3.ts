/**
 * BHUMI AMARTYA - Destiny Matrix Intelligence V3
 * Focus: Family, Generational, and Life Cycle Intelligence.
 */

import { Blueprint, DestinyMatrixBlueprint } from "@/lib/types/blueprint";

export interface FamilyIntelligence {
  fatherPattern: string;
  motherPattern: string;
  ancestorTheme: string;
  generationalLegacy: string;
  familyWound: string;
  familyGift: string;
}

export interface TalentHeritage {
  naturalGifts: string[];
  hiddenGifts: string[];
  legacyTalents: string[];
}

export interface LifeCycleIntelligence {
  yearlyTheme: string;
  ageLesson: string;
  growthFocus: string;
  currentChallenge: string;
}

export interface DestinyMatrixV3 {
  family: FamilyIntelligence;
  talents: TalentHeritage;
  lifeCycle: LifeCycleIntelligence;
}

const ARCANA_KEYWORDS: Record<number, { gift: string; shadow: string; theme: string }> = {
  1: { gift: "Inisiatif", shadow: "Manipulasi", theme: "Sang Pesulap" },
  2: { gift: "Intuisi", shadow: "Kepalsuan", theme: "Sang Pendeta Tinggi" },
  3: { gift: "Kelimpahan", shadow: "Kontrol", theme: "Sang Ratu" },
  4: { gift: "Struktur", shadow: "Kekakuan", theme: "Sang Kaisar" },
  5: { gift: "Tradisi", shadow: "Dogmatisme", theme: "Sang Guru" },
  6: { gift: "Relasi", shadow: "Ketergantungan", theme: "Para Pecinta" },
  7: { gift: "Kemenangan", shadow: "Agresi", theme: "Kereta Perang" },
  8: { gift: "Keadilan", shadow: "Penghakiman", theme: "Keadilan" },
  9: { gift: "Kebijaksanaan", shadow: "Isolasi", theme: "Sang Pertapa" },
  10: { gift: "Keberuntungan", shadow: "Fatalisme", theme: "Roda Keberuntungan" },
  11: { gift: "Kekuatan", shadow: "Kekerasan", theme: "Kekuatan" },
  12: { gift: "Perspektif Baru", shadow: "Pengorbanan Diri", theme: "Sang Tergantung" },
  13: { gift: "Transformasi", shadow: "Ketakutan Berubah", theme: "Kematian \u0026 Kebangkitan" },
  14: { gift: "Moderasi", shadow: "Ketidakseimbangan", theme: "Temperansi" },
  15: { gift: "Antusiasme", shadow: "Keterikatan", theme: "Sang Iblis" },
  16: { gift: "Pencerahan", shadow: "Kehancuran", theme: "Menara" },
  17: { gift: "Harapan", shadow: "Keputusasaan", theme: "Bintang" },
  18: { gift: "Imajinasi", shadow: "Kebingungan", theme: "Bulan" },
  19: { gift: "Vitalitas", shadow: "Arogansi", theme: "Matahari" },
  20: { gift: "Kebangkitan", shadow: "Penolakan", theme: "Penghakiman Terakhir" },
  21: { gift: "Penyelesaian", shadow: "Keterbatasan", theme: "Dunia" },
  22: { gift: "Kebebasan", shadow: "Kecerobohan", theme: "Sang Pandir" }
};

export const destinyMatrixV3Engine = {
  calculateIntelligence(blueprint: Blueprint): DestinyMatrixV3 {
    const dm = blueprint.destinyMatrix || {};
    const birthDate = blueprint.input?.birthDate || "";

    // 1. Family Intelligence
    const fatherLine = dm.fatherLine || [];
    const motherLine = dm.motherLine || [];
    const ancestorLine = dm.ancestorLine || [];

    const fGift = fatherLine[0] ? ARCANA_KEYWORDS[fatherLine[0]]?.gift : "Kepemimpinan";
    const mGift = motherLine[0] ? ARCANA_KEYWORDS[motherLine[0]]?.gift : "Pengayoman";

    const family = {
      fatherPattern: `Mewarisi pola ${fGift} dalam mengambil tanggung jawab.`,
      motherPattern: `Mewarisi pola ${mGift} dalam mengolah emosi.`,
      ancestorTheme: ancestorLine[0] ? ARCANA_KEYWORDS[ancestorLine[0]]?.theme : "Kebijaksanaan Leluhur",
      generationalLegacy: "Membangun jembatan antara tradisi dan inovasi.",
      familyWound: fatherLine[1] ? `Tantangan dalam ${ARCANA_KEYWORDS[fatherLine[1]]?.shadow.toLowerCase()}` : "Komunikasi batin",
      familyGift: motherLine[0] ? ARCANA_KEYWORDS[motherLine[0]]?.gift : "Ketangguhan emosional"
    };

    // 2. Talent Heritage
    const talents = {
      naturalGifts: (dm.talentsGreat || []).map(g => ARCANA_KEYWORDS[g]?.gift || String(g)),
      hiddenGifts: (dm.talentsFather || []).map(g => ARCANA_KEYWORDS[g]?.gift || String(g)),
      legacyTalents: (dm.talentsMother || []).map(g => ARCANA_KEYWORDS[g]?.gift || String(g))
    };

    // 3. Life Cycle
    const age = this.calculateAge(birthDate);
    const yearlyArcana = dm.yearlyArcana || 10;

    const lifeCycle = {
      yearlyTheme: ARCANA_KEYWORDS[yearlyArcana]?.theme || "Pertumbuhan",
      ageLesson: `Pelajaran di usia ${age} tahun adalah tentang ${ARCANA_KEYWORDS[yearlyArcana]?.gift.toLowerCase()}.`,
      growthFocus: ARCANA_KEYWORDS[yearlyArcana]?.gift || "Kesadaran",
      currentChallenge: ARCANA_KEYWORDS[yearlyArcana]?.shadow || "Keraguan"
    };

    return { family, talents, lifeCycle };
  },

  calculateAge(birthDate: string): number {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
};
