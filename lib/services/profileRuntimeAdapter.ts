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
          title: "Misi Kehidupan",
          shortMeaning: meaning.purpose.short,
          expandableInsight: meaning.purpose.medium,
          actionableReflection: meaning.purpose.long,
        },
        {
          title: "Karakter Tersembunyi",
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
          title: "Otoritas Batin",
          shortMeaning: meaning.energy.authority.short,
          expandableInsight: meaning.energy.authority.medium,
          actionableReflection: meaning.energy.authority.long,
        },
        {
          title: "Strategi Aksi",
          shortMeaning: meaning.energy.strategy.short,
          expandableInsight: meaning.energy.strategy.medium,
          actionableReflection: meaning.energy.strategy.long,
        },
        {
          title: "Kapasitas Vitalitas",
          shortMeaning: meaning.energy.vitality.short,
          expandableInsight: meaning.energy.vitality.medium,
          actionableReflection: meaning.energy.vitality.long,
        },
        {
          title: "Cara Tubuhmu Bekerja",
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
          title: "Kebutuhan Emosional",
          shortMeaning: meaning.shadow.emotionalNeeds.short,
          expandableInsight: meaning.shadow.emotionalNeeds.medium,
          actionableReflection: meaning.shadow.emotionalNeeds.long,
        },
        {
          title: "Pola Sabotase",
          shortMeaning: meaning.shadow.sabotage.short,
          expandableInsight: meaning.shadow.sabotage.medium,
          actionableReflection: meaning.shadow.sabotage.long,
        },
        {
          title: "Trigger Emosional",
          shortMeaning: meaning.shadow.triggers.short,
          expandableInsight: meaning.shadow.triggers.medium,
          actionableReflection: meaning.shadow.triggers.long,
        },
        {
          title: "Warisan Leluhur",
          shortMeaning: meaning.shadow.ancestralLegacy.short,
          expandableInsight: meaning.shadow.ancestralLegacy.medium,
          actionableReflection: meaning.shadow.ancestralLegacy.long,
        },
        {
          title: "Pelajaran Jiwa",
          shortMeaning: meaning.shadow.soulLesson.short,
          expandableInsight: meaning.shadow.soulLesson.medium,
          actionableReflection: meaning.shadow.soulLesson.long,
        },
        {
          title: "Jejak Jiwa",
          shortMeaning: meaning.shadow.soulTrace.short,
          expandableInsight: meaning.shadow.soulTrace.medium,
          actionableReflection: meaning.shadow.soulTrace.long,
        },
        {
          title: "Money Block",
          shortMeaning: meaning.shadow.moneyBlock.short,
          expandableInsight: meaning.shadow.moneyBlock.medium,
          actionableReflection: meaning.shadow.moneyBlock.long,
        },
        {
          title: "Love Block",
          shortMeaning: meaning.shadow.loveBlock.short,
          expandableInsight: meaning.shadow.loveBlock.medium,
          actionableReflection: meaning.shadow.loveBlock.long,
        },
      ],
    };
  }

  private static buildSection4(meaning: HumanMeaning): ProfileSection {
    return {
      title: "KARYA & TALENTA",
      cards: [
        {
          title: "DNA Talenta",
          shortMeaning: meaning.talents.dna.short,
          expandableInsight: meaning.talents.dna.medium,
          actionableReflection: meaning.talents.dna.long,
        },
        {
          title: "Potensi Bakat",
          shortMeaning: meaning.talents.potential.short,
          expandableInsight: meaning.talents.potential.medium,
          actionableReflection: meaning.talents.potential.long,
        },
        {
          title: "Gaya Karya",
          shortMeaning: meaning.talents.workStyle.short,
          expandableInsight: meaning.talents.workStyle.medium,
          actionableReflection: meaning.talents.workStyle.long,
        },
        {
          title: "Aliran Rezeki",
          shortMeaning: meaning.talents.wealthFlow.short,
          expandableInsight: meaning.talents.wealthFlow.medium,
          actionableReflection: meaning.talents.wealthFlow.long,
        },
      ],
    };
  }

  private static buildSection5(meaning: HumanMeaning): ProfileSection {
    return {
      title: "CINTA & RELASI",
      cards: [
        {
          title: "Gaya Ketertarikan",
          shortMeaning: meaning.relationships.attraction.short,
          expandableInsight: meaning.relationships.attraction.medium,
          actionableReflection: meaning.relationships.attraction.long,
        },
        {
          title: "Pola Relasi",
          shortMeaning: meaning.relationships.pattern.short,
          expandableInsight: meaning.relationships.pattern.medium,
          actionableReflection: meaning.relationships.pattern.long,
        },
        {
          title: "Bahasa Cinta Alami",
          shortMeaning: meaning.relationships.loveLanguage.short,
          expandableInsight: meaning.relationships.loveLanguage.medium,
          actionableReflection: meaning.relationships.loveLanguage.long,
        },
        {
          title: "Batasan Sehat",
          shortMeaning: meaning.relationships.boundaries.short,
          expandableInsight: meaning.relationships.boundaries.medium,
          actionableReflection: meaning.relationships.boundaries.long,
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
        {
          title: "Aura Dominan",
          shortMeaning: meaning.spirituality.aura.short,
          expandableInsight: meaning.spirituality.aura.medium,
          actionableReflection: meaning.spirituality.aura.long,
        },
        {
          title: "Clair Potential",
          shortMeaning: meaning.spirituality.clair.short,
          expandableInsight: meaning.spirituality.clair.medium,
          actionableReflection: meaning.spirituality.clair.long,
        },
      ],
    };
  }

  private static buildSection8(meaning: HumanMeaning): ProfileSection {
    return {
      title: "FASE KEHIDUPAN SAAT INI",
      cards: [
        {
          title: "Musim Kehidupan",
          shortMeaning: meaning.timing.season.short,
          expandableInsight: meaning.timing.season.medium,
          actionableReflection: meaning.timing.season.long,
        },
        {
          title: "Semester 1",
          shortMeaning: meaning.timing.semester1.short,
          expandableInsight: meaning.timing.semester1.medium,
          actionableReflection: meaning.timing.semester1.long,
        },
        {
          title: "Semester 2",
          shortMeaning: meaning.timing.semester2.short,
          expandableInsight: meaning.timing.semester2.medium,
          actionableReflection: meaning.timing.semester2.long,
        },
        {
          title: "Kondisimu Saat Ini",
          shortMeaning: meaning.timing.currentState.short,
          expandableInsight: meaning.timing.currentState.medium,
          actionableReflection: meaning.timing.currentState.long,
        },
        {
          title: "Fokus Hari Ini",
          shortMeaning: meaning.timing.dailyFocus.short,
          expandableInsight: meaning.timing.dailyFocus.medium,
          actionableReflection: meaning.timing.dailyFocus.long,
        },
        {
          title: "Area Pertumbuhan",
          shortMeaning: meaning.timing.growthArea.short,
          expandableInsight: meaning.timing.growthArea.medium,
          actionableReflection: meaning.timing.growthArea.long,
        },
      ],
    };
  }
}
