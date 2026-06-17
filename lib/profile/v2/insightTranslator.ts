/**
 * BHUMI AMARTYA - Insight Translator V2
 * Converts technical blueprint data into human-centric, reflective narratives.
 * Follows the "Founder Test": Warm, Non-Technical, Mentor-like.
 */

import { buildDestinyProfileSections } from "@/lib/engines/destinyMatrixIntelligence";
import { careerIntelligenceEngine, CareerIntelligence } from "@/lib/engines/careerIntelligenceEngine";
import { calculateHumanDesignStyle, HumanDesignStyle } from "@/lib/humandesign/intelligence/styleEngine";
import { getCrossMission } from "@/lib/humandesign/intelligence/crossIntelligence";
import { getCanonicalHumanDesignType, isCanonicalHumanDesign } from "@/lib/humandesign/hdAudit";

export interface TranslatedProfile {
  astrology: {
    sunSign: string;
    moonSign: string;
    ascendant: string;
  };
  identity: {
    title: string;
    description: string;
    coreEssence: string;
  };
  soulMap: {
    title: string;
    whyPatterns: string;
    innerChildNeeds: string;
    healingPath: string;
  };
  potentials: {
    title: string;
    strengths: string[];
    soulMission: string;
    lightManifestation: string;
    career: CareerIntelligence;
    hdStyle: HumanDesignStyle;
  };
  destinyMatrix: {
    soulMission: string;
    greatestPotential: string;
    repeatingPatterns: string;
    innerChild: string;
    ancestorKarma: string;
    moneyAndWork: string;
    loveAndRelationships: string;
    healthChartSummary?: string;
  };
}

const LIFE_PATH_DICT: Record<number, { essence: string; path: string }> = {
  1: {
    essence: "Perintis yang Mandiri",
    path: "Kamu memiliki dorongan alami untuk memulai hal baru dan berdiri tegak dengan keyakinan sendiri. Perjalananmu adalah tentang menemukan keberanian untuk memimpin tanpa harus merasa kesepian."
  },
  2: {
    essence: "Pembawa Harmoni",
    path: "Kamu memiliki kepekaan luar biasa dalam merasakan dinamika di sekitar. Perjalananmu adalah tentang menciptakan kedamaian tanpa harus mengorbankan kebutuhan dirimu sendiri."
  },
  3: {
    essence: "Komunikator Kreatif",
    path: "Dunia batinmu kaya dengan ekspresi dan warna. Perjalananmu adalah tentang membagikan keindahan dan keceriaan yang kamu rasakan agar orang lain ikut terinspirasi."
  },
  4: {
    essence: "Pembangun yang Kokoh",
    path: "Kamu adalah jangkar yang memberikan rasa aman bagi sekitar. Perjalananmu adalah tentang membangun fondasi hidup yang stabil dengan ketekunan dan dedikasi yang tulus."
  },
  5: {
    essence: "Jiwa yang Merdeka",
    path: "Kamu mencintai perubahan dan eksplorasi. Perjalananmu adalah tentang menemukan kebebasan sejati yang lahir dari pemahaman bahwa setiap petualangan memiliki maknanya sendiri."
  },
  6: {
    essence: "Pengasuh yang Tulus",
    path: "Kamu memiliki hati yang besar untuk merawat dan menjaga. Perjalananmu adalah tentang belajar bahwa cinta yang paling murni dimulai dari kerelaan untuk merawat dirimu sendiri lebih dulu."
  },
  7: {
    essence: "Pencari Kebenaran",
    path: "Kamu selalu ingin tahu apa yang ada di balik permukaan. Perjalananmu adalah tentang menyelami keheningan untuk menemukan jawaban-jawaban yang hanya bisa didengar oleh hati."
  },
  8: {
    essence: "Penata Daya dan Kelimpahan",
    path: "Kamu memiliki kemampuan untuk mewujudkan visi menjadi kenyataan materi. Perjalananmu adalah tentang menggunakan kekuatanmu untuk menciptakan kebermanfaatan yang luas bagi banyak orang."
  },
  9: {
    essence: "Jiwa yang Bijaksana",
    path: "Kamu memiliki pandangan yang luas melampaui kepentingan pribadi. Perjalananmu adalah tentang belajar melepaskan dengan ikhlas dan melayani kemanusiaan dengan kasih tanpa syarat."
  },
  11: {
    essence: "Penuntun Intuitif",
    path: "Kamu memiliki radar batin yang sangat tajam. Perjalananmu adalah tentang menurunkan inspirasi langit menjadi langkah nyata yang bisa membantu orang lain melihat jalan mereka."
  },
  22: {
    essence: "Arsitek Visi Besar",
    path: "Kamu bermimpi besar dan memiliki ketangguhan untuk membangunnya. Perjalananmu adalah tentang menjaga idealisme tinggi sambil tetap menjejak bumi dalam setiap langkah kecil."
  },
  33: {
    essence: "Penyampai Kasih Murni",
    path: "Kamu adalah perwujudan empati yang dalam. Perjalananmu adalah tentang menjadi pelindung bagi yang lemah dan penyembuh bagi yang terluka melalui kehadiranmu yang menenangkan."
  }
};

const HD_TYPE_DICT: Record<string, string> = {
  "Generator": "Kamu memiliki energi yang berlimpah saat melakukan hal yang kamu cintai. Cara terbaik bagimu untuk bergerak adalah dengan mendengarkan respons tubuh; jika batinmu berkata 'iya', maka seluruh semesta akan mendukung langkahmu.",
  "Manifesting Generator": "Kamu bergerak dengan kecepatan tinggi dan mampu melakukan banyak hal sekaligus. Jangan takut dianggap tidak konsisten; kamu memang dirancang untuk mencoba banyak pintu sebelum menemukan satu yang benar-benar tepat.",
  "Projector": "Kamu adalah seorang pembimbing alami yang mampu melihat potensi orang lain dengan sangat jernih. Kamu akan merasa paling berdaya ketika kamu menunggu momen yang tepat di mana kebijaksanaanmu benar-benar dihargai dan diundang.",
  "Manifestor": "Kamu adalah sang pemulai yang memiliki dorongan kuat untuk mengubah keadaan. Kamu akan merasa paling tenang ketika kamu memberikan informasi kepada orang-orang di sekitar sebelum kamu melangkah, agar tidak ada yang menghalangi jalanmu.",
  "Reflector": "Kamu adalah cermin bagi lingkunganmu. Kepekaanmu memungkinkanmu merasakan kesehatan suatu komunitas. Kamu membutuhkan waktu dan ruang yang tepat untuk memproses pengalaman agar kejernihanmu tetap murni."
};

const ARCANA_SHADOW_DICT: Record<number, string> = {
  4: "Kamu mungkin sering merasa harus mengontrol segala sesuatu agar merasa aman. Pola ini muncul karena ada ketakutan batin akan kekacauan yang tidak terduga.",
  8: "Kamu cenderung menahan emosi dan bersikap terlalu keras pada dirimu sendiri demi terlihat bertanggung jawab di mata orang lain.",
  9: "Kesunyian yang mendalam kadang membuatmu merasa terasing atau sulit untuk terhubung kembali dengan dunia luar.",
  15: "Ada keterikatan pada pola-pola lama yang sebenarnya melelahkan, namun terasa sulit dilepaskan karena memberi rasa aman sementara.",
  18: "Ketidakpastian seringkali memicu keraguan yang membuatmu sulit membedakan antara suara batin yang jujur dan rasa takut yang berlebihan."
};

/**
 * Main Translation Function
 */
export function translateBlueprintV2(blueprint: any, language: "id" | "en" = "id"): TranslatedProfile {
  const lpNumber = blueprint.lifePath?.number || 1;
  const hdType = getCanonicalHumanDesignType(blueprint.humanDesign);
  const arcanaNumber = blueprint.destinyMatrix?.center || 0;
  const sunSign = blueprint.astrology?.sunSign || "Zodiak";

  const lpInfo = LIFE_PATH_DICT[lpNumber] || LIFE_PATH_DICT[1];
  const hdDescription = hdType ? HD_TYPE_DICT[hdType] || "" : "";
  const shadowDescription = ARCANA_SHADOW_DICT[arcanaNumber] || "Kamu mungkin sering merasakan tekanan untuk memenuhi ekspektasi luar yang tidak selalu selaras dengan panggilan batinmu.";
  const destinySections = buildDestinyProfileSections(blueprint);
  const careerIntelligence = careerIntelligenceEngine.calculateCareer(blueprint);
  const canonicalHd = isCanonicalHumanDesign(blueprint.humanDesign);
  const hdStyle = calculateHumanDesignStyle(canonicalHd ? blueprint : { ...blueprint, humanDesign: undefined });
  const cross = getCrossMission(canonicalHd ? ((blueprint.humanDesign?.incarnationCross as any)?.name || blueprint.humanDesign?.incarnationCross) : null);

  const isId = language === "id";

  return {
    astrology: {
      sunSign: blueprint.astrology?.sunSign || "Unknown",
      moonSign: blueprint.astrology?.moonSign || "Unknown",
      ascendant: blueprint.astrology?.ascendant || "Unknown"
    },
    identity: {
      title: isId ? "Siapa Aku?" : "Who Am I?",
      coreEssence: `${lpInfo.essence} (${sunSign})`,
      description: `${lpInfo.path} ${hdDescription}`
    },
    soulMap: {
      title: isId ? "Mengapa Pola Ini Muncul?" : "Why These Patterns?",
      whyPatterns: shadowDescription,
      innerChildNeeds: "Bagian terdalam dirimu merindukan ruang di mana kamu boleh menjadi tidak sempurna tanpa harus merasa kehilangan nilai atau kasih sayang.",
      healingPath: "Langkah pemulihanmu dimulai dari keberanian untuk melambat dan memberikan izin pada dirimu sendiri untuk sekadar 'ada', tanpa harus selalu 'melakukan' sesuatu."
    },
    potentials: {
      title: isId ? "Kekuatan Apa yang Bisa Aku Kembangkan?" : "What Strengths Can I Develop?",
      strengths: [
        "Kemampuan untuk melihat kebenaran di balik situasi yang rumit.",
        "Daya tahan batin yang kuat dalam menghadapi tantangan hidup.",
        "Kepekaan alami dalam membangun hubungan yang bermakna."
      ],
      soulMission: cross.soulMission || "Misi jiwamu adalah menjadi jembatan yang menghubungkan ide-ide besar dengan tindakan nyata yang membawa manfaat bagi pertumbuhan diri dan lingkunganmu.",
      lightManifestation: "Saat kamu berada dalam kondisi selaras, kehadiranmu akan menjadi sumber ketenangan dan kejernihan bagi siapa pun yang bersinggungan denganmu.",
      career: careerIntelligence,
      hdStyle,
    },
    destinyMatrix: destinySections,
  };
}
