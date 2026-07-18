import type { HumanMeaning } from "@/lib/types/humanMeaning";
import type { ProfileSection } from "@/lib/types/profileRuntime";

export class ProfileRuntimeAdapter {
  public static buildProfile(
    meaning: HumanMeaning,
  ): ProfileSection[] {
    return [
      this.buildSection1(meaning),
      this.buildSection2(meaning),
      this.buildSection3(meaning),
      this.buildSection4(meaning),
      this.buildSection5(meaning),
      this.buildSection6(meaning),
      this.buildSection7(meaning),
      this.buildSection8(meaning),
      this.buildSoulIdentitySection(meaning),
      this.buildOriginCivilizationSection(),
    ];
  }

  private static buildSection1(meaning: HumanMeaning): ProfileSection {
    return {
      title: "SIAPA DIRIMU",
      cards: [
        {
          title: "Arketipe Utama",
          shortMeaning: meaning.identity.archetype.short,
          expandableInsight: meaning.identity.archetype.medium,
          actionableReflection: meaning.identity.archetype.long,
        },
        {
          title: "Cara Berpikir & Memaknai Kehidupan",
          shortMeaning: meaning.purpose.short,
          expandableInsight: meaning.purpose.medium,
          actionableReflection: meaning.purpose.long,
        },
        {
          title: "Nilai & Kebutuhan Batin",
          shortMeaning: meaning.identity.hiddenCharacter.short,
          expandableInsight: meaning.identity.hiddenCharacter.medium,
          actionableReflection: meaning.identity.hiddenCharacter.long,
        },
        {
          title: "Cara Hadir di Dunia",
          shortMeaning: meaning.identity.hiddenCharacter.short,
          expandableInsight: meaning.identity.hiddenCharacter.medium,
          actionableReflection: meaning.identity.hiddenCharacter.long,
        },
      ],
    };
  }

  private static buildSection2(meaning: HumanMeaning): ProfileSection {
    return {
      title: "ENERGI & MEKANIKA",
      cards: [
        {
          title: "Ritme Energi Alami",
          shortMeaning: meaning.energy.authority.short,
          expandableInsight: meaning.energy.authority.medium,
          actionableReflection: meaning.energy.authority.long,
        },
        {
          title: "Cara Mengambil Keputusan",
          shortMeaning: meaning.energy.strategy.short,
          expandableInsight: meaning.energy.strategy.medium,
          actionableReflection: meaning.energy.strategy.long,
        },
        {
          title: "Pola Respons terhadap Kehidupan",
          shortMeaning: meaning.energy.vitality.short,
          expandableInsight: meaning.energy.vitality.medium,
          actionableReflection: meaning.energy.vitality.long,
        },
        {
          title: "Fokus, Produktivitas & Konsistensi",
          shortMeaning: meaning.energy.bodyMechanics.short,
          expandableInsight: meaning.energy.bodyMechanics.medium,
          actionableReflection: meaning.energy.bodyMechanics.long,
        },
        {
          title: "Cara Memulihkan Energi",
          shortMeaning: meaning.energy.bodyMechanics.short,
          expandableInsight: meaning.energy.bodyMechanics.medium,
          actionableReflection: meaning.energy.bodyMechanics.long,
        },
      ],
    };
  }

  private static buildSection3(meaning: HumanMeaning): ProfileSection {
    return {
      title: "LUKA, BAYANGAN & WARISAN",
      cards: [
        {
          title: "Luka Inti",
          shortMeaning: meaning.shadow.emotionalNeeds.short,
          expandableInsight: meaning.shadow.emotionalNeeds.medium,
          actionableReflection: meaning.shadow.emotionalNeeds.long,
        },
        {
          title: "Mekanisme Perlindungan Diri",
          shortMeaning: meaning.shadow.sabotage.short,
          expandableInsight: meaning.shadow.sabotage.medium,
          actionableReflection: meaning.shadow.sabotage.long,
        },
        {
          title: "Pola Self-Sabotage",
          shortMeaning: meaning.shadow.triggers.short,
          expandableInsight: meaning.shadow.triggers.medium,
          actionableReflection: meaning.shadow.triggers.long,
        },
        {
          title: "Ketakutan yang Tersembunyi",
          shortMeaning: meaning.shadow.ancestralLegacy.short,
          expandableInsight: meaning.shadow.ancestralLegacy.medium,
          actionableReflection: meaning.shadow.ancestralLegacy.long,
        },
        {
          title: "Warisan Keluarga & Leluhur",
          shortMeaning: meaning.shadow.soulLesson.short,
          expandableInsight: meaning.shadow.soulLesson.medium,
          actionableReflection: meaning.shadow.soulLesson.long,
        },
        {
          title: "Karma dan Pola yang Berulang",
          shortMeaning: meaning.shadow.soulTrace.short,
          expandableInsight: meaning.shadow.soulTrace.medium,
          actionableReflection: meaning.shadow.soulTrace.long,
        },
        {
          title: "Arah Penyembuhan & Integrasi",
          shortMeaning: meaning.shadow.soulLesson.short,
          expandableInsight: meaning.shadow.soulLesson.medium,
          actionableReflection: meaning.shadow.soulLesson.long,
        },
      ],
    };
  }

  private static buildSection4(meaning: HumanMeaning): ProfileSection {
    return {
      title: "KARYA & TALENTA",
      cards: [
        {
          title: "Talenta Alami",
          shortMeaning: meaning.talents.dna.short,
          expandableInsight: meaning.talents.dna.medium,
          actionableReflection: meaning.talents.dna.long,
        },
        {
          title: "Gaya Kerja",
          shortMeaning: meaning.talents.potential.short,
          expandableInsight: meaning.talents.potential.medium,
          actionableReflection: meaning.talents.potential.long,
        },
        {
          title: "Arah Karya & Kontribusi",
          shortMeaning: meaning.talents.workStyle.short,
          expandableInsight: meaning.talents.workStyle.medium,
          actionableReflection: meaning.talents.workStyle.long,
        },
        {
          title: "Ekonomi & Pola Penghasilan",
          shortMeaning: meaning.talents.wealthFlow.short,
          expandableInsight: meaning.talents.wealthFlow.medium,
          actionableReflection: meaning.talents.wealthFlow.long,
        },
        {
          title: "Money Block",
          shortMeaning: meaning.shadow.moneyBlock.short,
          expandableInsight: meaning.shadow.moneyBlock.medium,
          actionableReflection: meaning.shadow.moneyBlock.long,
        },
        {
          title: "Arah Karier dan Bidang yang Sesuai",
          shortMeaning: meaning.talents.potential.short,
          expandableInsight: meaning.talents.potential.medium,
          actionableReflection: meaning.talents.potential.long,
        },
        {
          title: "Kemampuan yang Sudah Dimiliki",
          shortMeaning: meaning.talents.dna.short,
          expandableInsight: meaning.talents.dna.medium,
          actionableReflection: meaning.talents.dna.long,
        },
        {
          title: "Kemampuan yang Perlu Dipelajari",
          shortMeaning: meaning.talents.workStyle.short,
          expandableInsight: meaning.talents.workStyle.medium,
          actionableReflection: meaning.talents.workStyle.long,
        },
      ],
    };
  }

  private static buildSection5(meaning: HumanMeaning): ProfileSection {
    return {
      title: "CINTA & RELASI",
      cards: [
        {
          title: "Kebutuhan Emosional dalam Relasi",
          shortMeaning: meaning.relationships.attraction.short,
          expandableInsight: meaning.relationships.attraction.medium,
          actionableReflection: meaning.relationships.attraction.long,
        },
        {
          title: "Cara Memberi dan Menerima Cinta",
          shortMeaning: meaning.relationships.pattern.short,
          expandableInsight: meaning.relationships.pattern.medium,
          actionableReflection: meaning.relationships.pattern.long,
        },
        {
          title: "Pola Ketertarikan & Pilihan Pasangan",
          shortMeaning: meaning.relationships.loveLanguage.short,
          expandableInsight: meaning.relationships.loveLanguage.medium,
          actionableReflection: meaning.relationships.loveLanguage.long,
        },
        {
          title: "Konflik, Komunikasi & Batas Diri",
          shortMeaning: meaning.relationships.boundaries.short,
          expandableInsight: meaning.relationships.boundaries.medium,
          actionableReflection: meaning.relationships.boundaries.long,
        },
        {
          title: "Love Block dan Pola Berulang",
          shortMeaning: meaning.shadow.loveBlock.short,
          expandableInsight: meaning.shadow.loveBlock.medium,
          actionableReflection: meaning.shadow.loveBlock.long,
        },
        {
          title: "Arah Relasi yang Lebih Matang",
          shortMeaning: meaning.relationships.pattern.short,
          expandableInsight: meaning.relationships.pattern.medium,
          actionableReflection: meaning.relationships.pattern.long,
        },
      ],
    };
  }

  private static buildSection6(meaning: HumanMeaning): ProfileSection {
    return {
      title: "RAGA & RUANG",
      cards: [
        {
          title: "Peta Chakra",
          shortMeaning: meaning.health.chakra.short,
          expandableInsight: meaning.health.chakra.medium,
          actionableReflection: meaning.health.chakra.long,
        },
        {
          title: "Sistem Cerna",
          shortMeaning: meaning.health.digestion.short,
          expandableInsight: meaning.health.digestion.medium,
          actionableReflection: meaning.health.digestion.long,
        },
        {
          title: "Lingkungan Ideal",
          shortMeaning: meaning.health.environment.short,
          expandableInsight: meaning.health.environment.medium,
          actionableReflection: meaning.health.environment.long,
        },
        {
          title: "Ritme Tubuh",
          shortMeaning: meaning.health.rhythm.short,
          expandableInsight: meaning.health.rhythm.medium,
          actionableReflection: meaning.health.rhythm.long,
        },
        {
          title: "Energi Dominan",
          shortMeaning: meaning.health.element.short,
          expandableInsight: meaning.health.element.medium,
          actionableReflection: meaning.health.element.long,
        },
      ],
    };
  }

  private static buildSection7(meaning: HumanMeaning): ProfileSection {
    return {
      title: "SPIRITUALITAS & EVOLUSI",
      cards: [
        {
          title: "Jalur Spiritual",
          shortMeaning: meaning.spirituality.path.short,
          expandableInsight: meaning.spirituality.path.medium,
          actionableReflection: meaning.spirituality.path.long,
        },
        {
          title: "Evolusi Jiwa",
          shortMeaning: meaning.spirituality.evolution.short,
          expandableInsight: meaning.spirituality.evolution.medium,
          actionableReflection: meaning.spirituality.evolution.long,
        },
        {
          title: "Potensi Spiritual",
          shortMeaning: meaning.spirituality.potential.short,
          expandableInsight: meaning.spirituality.potential.medium,
          actionableReflection: meaning.spirituality.potential.long,
        },
        {
          title: "Bakat Spiritual",
          shortMeaning: meaning.spirituality.talents.short,
          expandableInsight: meaning.spirituality.talents.medium,
          actionableReflection: meaning.spirituality.talents.long,
        },
        {
          title: "Jejak Intuisi",
          shortMeaning: meaning.spirituality.intuition.short,
          expandableInsight: meaning.spirituality.intuition.medium,
          actionableReflection: meaning.spirituality.intuition.long,
        },
        {
          title: "Potensi Channeling",
          shortMeaning: meaning.spirituality.channeling.short,
          expandableInsight: meaning.spirituality.channeling.medium,
          actionableReflection: meaning.spirituality.channeling.long,
        },
      ],
    };
  }

  private static buildSection8(meaning: HumanMeaning): ProfileSection {
    return {
      title: "FASE KEHIDUPAN SAAT INI",
      cards: [
        {
          title: "Peruntungan Semester 1",
          shortMeaning: meaning.timing.season.short,
          expandableInsight: meaning.timing.season.medium,
          actionableReflection: meaning.timing.season.long,
        },
        {
          title: "Peruntungan Semester 2",
          shortMeaning: meaning.timing.semester2.short,
          expandableInsight: meaning.timing.semester2.medium,
          actionableReflection: meaning.timing.semester2.long,
        },
      ],
    };
  }

  private static buildSoulIdentitySection(meaning: HumanMeaning): ProfileSection {
    return {
      title: "SOUL IDENTITY",
      cards: [
        {
          title: "Soul Mission",
          shortMeaning: meaning.soulIdentity.mission.short,
          expandableInsight: meaning.soulIdentity.mission.medium,
          actionableReflection: meaning.soulIdentity.mission.long,
        },
        {
          title: "Soul Gifts",
          shortMeaning: meaning.soulIdentity.gifts.short,
          expandableInsight: meaning.soulIdentity.gifts.medium,
          actionableReflection: meaning.soulIdentity.gifts.long,
        },
        {
          title: "Soul Lessons",
          shortMeaning: meaning.soulIdentity.lessons.short,
          expandableInsight: meaning.soulIdentity.lessons.medium,
          actionableReflection: meaning.soulIdentity.lessons.long,
        },
        {
          title: "Soul Shadow",
          shortMeaning: meaning.soulIdentity.shadow.short,
          expandableInsight: meaning.soulIdentity.shadow.medium,
          actionableReflection: meaning.soulIdentity.shadow.long,
        },
      ],
    };
  }

  private static buildOriginCivilizationSection(): ProfileSection {
    return {
      title: "ASAL USUL & PERADABAN",
      cards: [
        {
          title: "Resonansi Starseed",
          shortMeaning: "",
          expandableInsight: "",
          actionableReflection: "",
          items: [],
        },
        {
          title: "Jejak Peradaban Jiwa",
          shortMeaning: "",
          expandableInsight: "",
          actionableReflection: "",
          items: [],
        },
      ],
    };
  }

}
