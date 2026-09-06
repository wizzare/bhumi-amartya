import type { HumanMeaning } from "@/lib/types/humanMeaning";
import type { ProfileSection } from "@/lib/types/profileRuntime";
import { isEnlEdition } from "@/lib/config/edition";

export class ProfileRuntimeAdapter {
  private static t(id: string, en: string): string {
    return isEnlEdition() ? en : id;
  }
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
      title: this.t("SIAPA DIRIMU", "WHO YOU ARE"),
      cards: [
        {
          title: this.t("Arketipe Utama", "Core Archetype"),
          shortMeaning: meaning.identity.archetype.short,
          expandableInsight: meaning.identity.archetype.medium,
          actionableReflection: meaning.identity.archetype.long,
        },
        {
          title: this.t("Cara Berpikir & Memaknai Kehidupan", "Thinking & Meaning-Making"),
          shortMeaning: meaning.purpose.short,
          expandableInsight: meaning.purpose.medium,
          actionableReflection: meaning.purpose.long,
        },
        {
          title: this.t("Nilai & Kebutuhan Batin", "Values & Inner Needs"),
          shortMeaning: meaning.identity.hiddenCharacter.short,
          expandableInsight: meaning.identity.hiddenCharacter.medium,
          actionableReflection: meaning.identity.hiddenCharacter.long,
        },
        {
          title: this.t("Cara Hadir di Dunia", "How You Show Up"),
          shortMeaning: meaning.identity.hiddenCharacter.short,
          expandableInsight: meaning.identity.hiddenCharacter.medium,
          actionableReflection: meaning.identity.hiddenCharacter.long,
        },
      ],
    };
  }

  private static buildSection2(meaning: HumanMeaning): ProfileSection {
    return {
      title: this.t("ENERGI & MEKANIKA", "ENERGY & MECHANICS"),
      cards: [
        {
          title: this.t("Ritme Energi Alami", "Natural Energy Rhythm"),
          shortMeaning: meaning.energy.authority.short,
          expandableInsight: meaning.energy.authority.medium,
          actionableReflection: meaning.energy.authority.long,
        },
        {
          title: this.t("Cara Mengambil Keputusan", "Decision-Making Style"),
          shortMeaning: meaning.energy.strategy.short,
          expandableInsight: meaning.energy.strategy.medium,
          actionableReflection: meaning.energy.strategy.long,
        },
        {
          title: this.t("Pola Respons terhadap Kehidupan", "Life Response Pattern"),
          shortMeaning: meaning.energy.vitality.short,
          expandableInsight: meaning.energy.vitality.medium,
          actionableReflection: meaning.energy.vitality.long,
        },
        {
          title: this.t("Fokus, Produktivitas & Konsistensi", "Focus, Productivity & Consistency"),
          shortMeaning: meaning.energy.bodyMechanics.short,
          expandableInsight: meaning.energy.bodyMechanics.medium,
          actionableReflection: meaning.energy.bodyMechanics.long,
        },
        {
          title: this.t("Cara Memulihkan Energi", "Energy Recovery"),
          shortMeaning: meaning.energy.bodyMechanics.short,
          expandableInsight: meaning.energy.bodyMechanics.medium,
          actionableReflection: meaning.energy.bodyMechanics.long,
        },
      ],
    };
  }

  private static buildSection3(meaning: HumanMeaning): ProfileSection {
    return {
      title: this.t("LUKA, BAYANGAN & WARISAN", "WOUNDS, SHADOWS & LEGACY"),
      cards: [
        {
          title: this.t("Luka Inti", "Core Wound"),
          shortMeaning: meaning.shadow.emotionalNeeds.short,
          expandableInsight: meaning.shadow.emotionalNeeds.medium,
          actionableReflection: meaning.shadow.emotionalNeeds.long,
        },
        {
          title: this.t("Mekanisme Perlindungan Diri", "Self-Protection Mechanism"),
          shortMeaning: meaning.shadow.sabotage.short,
          expandableInsight: meaning.shadow.sabotage.medium,
          actionableReflection: meaning.shadow.sabotage.long,
        },
        {
          title: this.t("Pola Self-Sabotage", "Self-Sabotage Pattern"),
          shortMeaning: meaning.shadow.triggers.short,
          expandableInsight: meaning.shadow.triggers.medium,
          actionableReflection: meaning.shadow.triggers.long,
        },
        {
          title: this.t("Ketakutan yang Tersembunyi", "Hidden Fears"),
          shortMeaning: meaning.shadow.ancestralLegacy.short,
          expandableInsight: meaning.shadow.ancestralLegacy.medium,
          actionableReflection: meaning.shadow.ancestralLegacy.long,
        },
        {
          title: this.t("Warisan Keluarga & Leluhur", "Family & Ancestral Legacy"),
          shortMeaning: meaning.shadow.soulLesson.short,
          expandableInsight: meaning.shadow.soulLesson.medium,
          actionableReflection: meaning.shadow.soulLesson.long,
        },
        {
          title: this.t("Karma dan Pola yang Berulang", "Karma & Repeating Patterns"),
          shortMeaning: meaning.shadow.soulTrace.short,
          expandableInsight: meaning.shadow.soulTrace.medium,
          actionableReflection: meaning.shadow.soulTrace.long,
        },
        {
          title: this.t("Arah Penyembuhan & Integrasi", "Direction of Healing & Integration"),
          shortMeaning: meaning.shadow.soulLesson.short,
          expandableInsight: meaning.shadow.soulLesson.medium,
          actionableReflection: meaning.shadow.soulLesson.long,
        },
      ],
    };
  }

  private static buildSection4(meaning: HumanMeaning): ProfileSection {
    return {
      title: this.t("KARYA & TALENTA", "WORK & TALENT"),
      cards: [
        {
          title: this.t("Talenta Alami", "Natural Talents"),
          shortMeaning: meaning.talents.dna.short,
          expandableInsight: meaning.talents.dna.medium,
          actionableReflection: meaning.talents.dna.long,
        },
        {
          title: this.t("Gaya Kerja", "Work Style"),
          shortMeaning: meaning.talents.potential.short,
          expandableInsight: meaning.talents.potential.medium,
          actionableReflection: meaning.talents.potential.long,
        },
        {
          title: this.t("Arah Karya & Kontribusi", "Creative Direction & Contribution"),
          shortMeaning: meaning.talents.workStyle.short,
          expandableInsight: meaning.talents.workStyle.medium,
          actionableReflection: meaning.talents.workStyle.long,
        },
        {
          title: this.t("Ekonomi & Pola Penghasilan", "Economics & Income Patterns"),
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
          title: this.t("Arah Karier dan Bidang yang Sesuai", "Career Direction & Suitable Fields"),
          shortMeaning: meaning.talents.potential.short,
          expandableInsight: meaning.talents.potential.medium,
          actionableReflection: meaning.talents.potential.long,
        },
        {
          title: this.t("Kemampuan yang Sudah Dimiliki", "Existing Abilities"),
          shortMeaning: meaning.talents.dna.short,
          expandableInsight: meaning.talents.dna.medium,
          actionableReflection: meaning.talents.dna.long,
        },
        {
          title: this.t("Kemampuan yang Perlu Dipelajari", "Abilities to Develop"),
          shortMeaning: meaning.talents.workStyle.short,
          expandableInsight: meaning.talents.workStyle.medium,
          actionableReflection: meaning.talents.workStyle.long,
        },
      ],
    };
  }

  private static buildSection5(meaning: HumanMeaning): ProfileSection {
    return {
      title: this.t("CINTA & RELASI", "LOVE & RELATIONSHIPS"),
      cards: [
        {
          title: this.t("Kebutuhan Emosional dalam Relasi", "Emotional Needs in Relationships"),
          shortMeaning: meaning.relationships.attraction.short,
          expandableInsight: meaning.relationships.attraction.medium,
          actionableReflection: meaning.relationships.attraction.long,
        },
        {
          title: this.t("Cara Memberi dan Menerima Cinta", "Giving & Receiving Love"),
          shortMeaning: meaning.relationships.pattern.short,
          expandableInsight: meaning.relationships.pattern.medium,
          actionableReflection: meaning.relationships.pattern.long,
        },
        {
          title: this.t("Pola Ketertarikan & Pilihan Pasangan", "Attraction Patterns & Partner Choice"),
          shortMeaning: meaning.relationships.loveLanguage.short,
          expandableInsight: meaning.relationships.loveLanguage.medium,
          actionableReflection: meaning.relationships.loveLanguage.long,
        },
        {
          title: this.t("Konflik, Komunikasi & Batas Diri", "Conflict, Communication & Boundaries"),
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
          title: this.t("Arah Relasi yang Lebih Matang", "Toward More Mature Relationships"),
          shortMeaning: meaning.relationships.pattern.short,
          expandableInsight: meaning.relationships.pattern.medium,
          actionableReflection: meaning.relationships.pattern.long,
        },
      ],
    };
  }

  private static buildSection6(meaning: HumanMeaning): ProfileSection {
    return {
      title: this.t("RAGA & RUANG", "BODY & SPACE"),
      cards: [
        {
          title: this.t("Peta Chakra", "Chakra Map"),
          shortMeaning: meaning.health.chakra.short,
          expandableInsight: meaning.health.chakra.medium,
          actionableReflection: meaning.health.chakra.long,
        },
        {
          title: this.t("Sistem Cerna", "Digestive System"),
          shortMeaning: meaning.health.digestion.short,
          expandableInsight: meaning.health.digestion.medium,
          actionableReflection: meaning.health.digestion.long,
        },
        {
          title: this.t("Lingkungan Ideal", "Ideal Environment"),
          shortMeaning: meaning.health.environment.short,
          expandableInsight: meaning.health.environment.medium,
          actionableReflection: meaning.health.environment.long,
        },
        {
          title: this.t("Ritme Tubuh", "Body Rhythm"),
          shortMeaning: meaning.health.rhythm.short,
          expandableInsight: meaning.health.rhythm.medium,
          actionableReflection: meaning.health.rhythm.long,
        },
        {
          title: this.t("Energi Dominan", "Dominant Energy"),
          shortMeaning: meaning.health.element.short,
          expandableInsight: meaning.health.element.medium,
          actionableReflection: meaning.health.element.long,
        },
      ],
    };
  }

  private static buildSection7(meaning: HumanMeaning): ProfileSection {
    return {
      title: this.t("SPIRITUALITAS & EVOLUSI", "SPIRITUALITY & EVOLUTION"),
      cards: [
        {
          title: this.t("Jalur Spiritual", "Spiritual Path"),
          shortMeaning: meaning.spirituality.path.short,
          expandableInsight: meaning.spirituality.path.medium,
          actionableReflection: meaning.spirituality.path.long,
        },
        {
          title: this.t("Evolusi Jiwa", "Soul Evolution"),
          shortMeaning: meaning.spirituality.evolution.short,
          expandableInsight: meaning.spirituality.evolution.medium,
          actionableReflection: meaning.spirituality.evolution.long,
        },
        {
          title: this.t("Potensi Spiritual", "Spiritual Potential"),
          shortMeaning: meaning.spirituality.potential.short,
          expandableInsight: meaning.spirituality.potential.medium,
          actionableReflection: meaning.spirituality.potential.long,
        },
        {
          title: this.t("Bakat Spiritual", "Spiritual Gifts"),
          shortMeaning: meaning.spirituality.talents.short,
          expandableInsight: meaning.spirituality.talents.medium,
          actionableReflection: meaning.spirituality.talents.long,
        },
        {
          title: this.t("Jejak Intuisi", "Intuition Trace"),
          shortMeaning: meaning.spirituality.intuition.short,
          expandableInsight: meaning.spirituality.intuition.medium,
          actionableReflection: meaning.spirituality.intuition.long,
        },
        {
          title: this.t("Potensi Channeling", "Channeling Potential"),
          shortMeaning: meaning.spirituality.channeling.short,
          expandableInsight: meaning.spirituality.channeling.medium,
          actionableReflection: meaning.spirituality.channeling.long,
        },
      ],
    };
  }

  private static buildSection8(meaning: HumanMeaning): ProfileSection {
    return {
      title: this.t("FASE KEHIDUPAN SAAT INI", "CURRENT LIFE PHASE"),
      cards: [
        {
          title: this.t("Peruntungan Semester 1", "First Half Outlook"),
          shortMeaning: meaning.timing.season.short,
          expandableInsight: meaning.timing.season.medium,
          actionableReflection: meaning.timing.season.long,
        },
        {
          title: this.t("Peruntungan Semester 2", "Second Half Outlook"),
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
      title: this.t("ASAL USUL & PERADABAN", "ORIGINS & CIVILIZATION"),
      cards: [
        {
          title: this.t("Resonansi Starseed", "Starseed Resonance"),
          shortMeaning: "",
          expandableInsight: "",
          actionableReflection: "",
          items: [],
        },
        {
          title: this.t("Jejak Peradaban Jiwa", "Soul Civilization Trace"),
          shortMeaning: "",
          expandableInsight: "",
          actionableReflection: "",
          items: [],
        },
      ],
    };
  }

}
