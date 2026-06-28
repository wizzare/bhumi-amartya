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
        {
          title: "Soul Archetype",
          shortMeaning: meaning.soulIdentity.archetype.short,
          expandableInsight: meaning.soulIdentity.archetype.medium,
          actionableReflection: meaning.soulIdentity.archetype.long,
        },
      ],
    };
  }

  private static buildOriginCivilizationSection(): ProfileSection {
    return {
      title: "ASAL USUL & PERADABAN",
      cards: [
        this.buildStarseedInsight(),
        this.buildCivilizationInsight(),
      ],
    };
  }

  private static buildStarseedInsight() {
    const sirius = this.buildStarseedReading("Sirius", "🥇");
    const arcturus = this.buildStarseedReading("Arcturus", "🥈");
    const pleiades = this.buildStarseedReading("Pleiades", "🥉");

    return {
      title: "Resonansi Starseed",
      shortMeaning: "",
      expandableInsight: "",
      actionableReflection: "",
      items: [sirius, arcturus, pleiades],
    };
  }

  private static buildCivilizationInsight() {
    const lemuria = this.buildCivilizationReading("Lemuria", "🥇");
    const atlantis = this.buildCivilizationReading("Atlantis", "🥈");
    const mu = this.buildCivilizationReading("Mu", "🥉");

    return {
      title: "Resonansi Peradaban",
      shortMeaning: "",
      expandableInsight: "",
      actionableReflection: "",
      items: [lemuria, atlantis, mu],
    };
  }

  private static buildStarseedReading(
    name: "Sirius" | "Pleiades" | "Arcturus",
    medal: "🥇" | "🥈" | "🥉",
  ) {
    const readings = {
      Sirius: {
        why: "Pada peta dirimu, lapisan ini terbaca kuat karena ada dorongan untuk membuat hidup terasa lebih tertata, berguna, dan bisa diandalkan.",
        deep: "Dalam perjalananmu, rasa ingin tahu biasanya tidak berhenti sebagai pikiran. Kamu cenderung mencari pola, memahami akar persoalan, lalu mengubahnya menjadi pegangan yang lebih jelas bagi dirimu dan orang lain.",
        light: "Saat sedang bertumbuh, kamu tampak jernih, teliti, dan mampu menenangkan keadaan tanpa harus menguasai ruangan.",
        shadow: "Saat tertekan, kualitas yang sama bisa berubah menjadi kebutuhan untuk mengontrol, terlalu banyak menganalisis, atau menjaga jarak dari rasa rentan.",
        balanced: "Ketika sehat, kamu memakai pengetahuan untuk membuat hidup lebih jernih dan manusiawi.",
        unbalanced: "Ketika terluka, kamu bisa tampak kuat, padahal sedang memakai struktur untuk menahan rasa tidak aman.",
        weave: "Benang merahnya: kamu sedang belajar memakai kejernihan sebagai pelayanan, bukan sebagai benteng.",
        reflection: "Apa satu pengetahuan yang hari ini bisa kamu ubah menjadi tindakan kecil yang benar-benar membantu?",
      },
      Pleiades: {
        why: "Pada peta dirimu, lapisan ini hadir karena ada kepekaan yang bekerja lewat rasa aman, kehangatan, dan cara merawat yang halus.",
        deep: "Dalam hidupmu, kepekaan bukan hanya soal merasa banyak hal. Ia menjadi berarti ketika kamu mampu membuat ruang lebih aman, lebih jujur, dan lebih lembut bagi dirimu maupun orang lain.",
        light: "Saat kamu bertumbuh, kamu tidak memaksa orang untuk berubah. Kamu membantu keadaan melembut dengan hadir lebih utuh.",
        shadow: "Saat tertekan, kamu bisa terlalu cepat membaca kebutuhan orang lain sampai kebutuhanmu sendiri tertinggal.",
        balanced: "Ketika sehat, kelembutanmu punya batas sehingga kasih tidak berubah menjadi pengorbanan diri.",
        unbalanced: "Ketika terluka, kamu bisa menjaga harmoni di luar sambil menahan terlalu banyak hal di dalam.",
        weave: "Benang merahnya: kelembutanmu menjadi matang ketika ia tetap punya batas.",
        reflection: "Di mana hari ini kamu bisa tetap lembut tanpa meninggalkan batasmu sendiri?",
      },
      Arcturus: {
        why: "Pada peta dirimu, lapisan ini muncul karena kamu punya kepekaan terhadap pola halus dan kebutuhan untuk merapikan hal yang terasa tercecer.",
        deep: "Dalam perjalananmu, kamu sering lebih dulu merasakan ketika sesuatu tidak selaras. Kualitas ini menjadi matang ketika tidak dipakai untuk menyelamatkan semua orang, tetapi untuk hadir lebih stabil dan jernih.",
        light: "Saat kamu bertumbuh, kamu membantu keadaan menjadi lebih tenang karena dirimu sendiri mulai tertata.",
        shadow: "Saat tertekan, kamu bisa lelah karena terlalu banyak membaca suasana atau merasa harus memperbaiki semuanya.",
        balanced: "Ketika sehat, sensitivitasmu menjadi kehadiran yang menata ulang ritme tanpa memaksakan apa pun.",
        unbalanced: "Ketika terluka, kamu bisa kehilangan tubuhmu sendiri karena terlalu sibuk merasakan keadaan sekitar.",
        weave: "Benang merahnya: kamu tidak harus memperbaiki semuanya untuk tetap membawa ketenangan.",
        reflection: "Apa satu hal yang bisa kamu rapikan hari ini agar energimu kembali terasa utuh?",
      },
    };
    const reading = readings[name];

    return {
      title: `${medal} ${name}`,
      shortMeaning: "",
      expandableInsight: [
        `Mengapa Resonansi Ini Muncul\n${reading.why}`,
        `Makna Mendalam\n${reading.deep}`,
        `Ekspresi Terang\n${reading.light}`,
        `Ekspresi Bayangan\n${reading.shadow}`,
        `Saat Seimbang\n${reading.balanced}`,
        `Saat Belum Seimbang\n${reading.unbalanced}`,
        `Benang Merah Bacaan\n${reading.weave}`,
      ].join("\n\n"),
      actionableReflection: reading.reflection,
    };
  }

  private static buildCivilizationReading(
    name: "Atlantis" | "Lemuria" | "Mu",
    medal: "🥇" | "🥈" | "🥉",
  ) {
    const readings = {
      Atlantis: {
        why: "Pada peta dirimu, lapisan ini muncul karena ada kemampuan untuk membangun, menyusun, dan memberi bentuk pada sesuatu yang sebelumnya masih tersebar.",
        deep: "Dalam perjalananmu, kapasitas besar perlu selalu ditemani hati. Kamu tidak hanya diminta mencipta atau mengatur, tetapi juga memastikan kekuatanmu benar-benar melayani kehidupan.",
        light: "Saat kamu bertumbuh, kamu mampu mengubah wawasan menjadi bentuk yang bisa menolong orang lain.",
        shadow: "Saat tertekan, kapasitas ini bisa berubah menjadi kontrol, standar yang terlalu dingin, atau kebutuhan membuktikan diri lewat hasil.",
        balanced: "Ketika sehat, kekuatanmu menjadi wadah yang melindungi kehidupan.",
        unbalanced: "Ketika terluka, kamu bisa terlalu mengejar hasil sampai lupa bahwa kekuatan membutuhkan hati.",
        weave: "Benang merahnya: kemampuanmu membangun menjadi paling indah ketika tidak kehilangan rasa.",
        reflection: "Kapasitas apa yang hari ini perlu kamu gunakan dengan lebih rendah hati?",
      },
      Lemuria: {
        why: "Pada peta dirimu, lapisan ini terbaca kuat karena banyak hal dalam hidupmu matang lewat tubuh, relasi, rasa aman, dan kepedulian sehari-hari.",
        deep: "Dalam perjalananmu, kelembutan tidak cukup hanya dirasakan. Ia perlu menjadi cara hidup yang membumi: cara kamu hadir, merawat, memberi ruang, dan kembali pada ritme yang sehat.",
        light: "Saat kamu bertumbuh, kehadiranmu terasa merawat tanpa menguasai. Orang bisa merasa lebih diterima karena kamu tidak perlu memaksa apa pun.",
        shadow: "Saat tertekan, kamu bisa memberi terlalu banyak, menghindari batas, atau berharap orang memahami kebutuhanmu tanpa kamu mengatakannya.",
        balanced: "Ketika sehat, kelembutanmu punya bentuk sehingga bisa diandalkan.",
        unbalanced: "Ketika terluka, kamu bisa menjaga orang lain sambil diam-diam mengabaikan dirimu sendiri.",
        weave: "Benang merahnya: rasa sayangmu perlu punya bentuk agar tidak berubah menjadi kelelahan.",
        reflection: "Bentuk nyata apa yang bisa kamu berikan pada kelembutanmu hari ini?",
      },
      Mu: {
        why: "Pada peta dirimu, lapisan ini hadir karena ada kebutuhan untuk kembali pada akar, kesederhanaan, dan rasa memiliki yang tidak dibuat-buat.",
        deep: "Dalam perjalananmu, tidak semua jawaban datang dari hal besar. Sebagian muncul saat kamu kembali pada tubuh, ritme, keluarga batin, dan pengalaman sederhana yang paling jujur.",
        light: "Saat kamu bertumbuh, kamu membawa stabilitas yang tenang. Kamu bisa menjaga hal penting tetap hidup tanpa banyak suara.",
        shadow: "Saat tertekan, kamu bisa tertahan oleh nostalgia atau menjadikan masa lalu sebagai tempat berlindung.",
        balanced: "Ketika sehat, akar menjadi sumber tenaga untuk bergerak.",
        unbalanced: "Ketika terluka, kamu bisa menyebut sesuatu sebagai kesetiaan, padahal sebenarnya itu ketakutan meninggalkan pola lama.",
        weave: "Benang merahnya: akar yang sehat menguatkan langkahmu, bukan menahanmu di tempat lama.",
        reflection: "Akar apa yang masih menguatkanmu, dan apa yang sudah tidak perlu kamu bawa?",
      },
    };
    const reading = readings[name];

    return {
      title: `${medal} ${name}`,
      shortMeaning: "",
      expandableInsight: [
        `Mengapa Resonansi Ini Muncul\n${reading.why}`,
        `Makna Mendalam\n${reading.deep}`,
        `Ekspresi Terang\n${reading.light}`,
        `Ekspresi Bayangan\n${reading.shadow}`,
        `Saat Seimbang\n${reading.balanced}`,
        `Saat Belum Seimbang\n${reading.unbalanced}`,
        `Benang Merah Bacaan\n${reading.weave}`,
      ].join("\n\n"),
      actionableReflection: reading.reflection,
    };
  }
}
