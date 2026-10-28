import { DateTime } from "luxon";
import {
  calculateDailyTransitToNatalAspects,
  computeDailyTimeWindow,
  type DailyTimeWindow,
  type DailyTransitToNatalAspect,
} from "./dailyTransitCalculator";
import {
  extractNatalPlacements,
  PLANET_LABELS_ID,
  resolveSafeTimezone,
  type NatalPlacement,
} from "@/lib/weeklyGuidance/weeklyTransitCalculator";
import {
  extractFullCanonicalBlueprint,
  type ExtractedBlueprint,
} from "@/lib/weeklyGuidance/weeklyGuidanceEngine";
import { calculateCanonicalDestinyMatrixBlueprint } from "@/lib/engines/destinyMatrixBlueprintAdapter";
import { calculateBhumiMatrix } from "@/lib/engines/calculateBhumiMatrix";
import { resolveDestinyMatrixArcanaAtAge } from "@/lib/destiny-matrix/annualArcana";
import { calculatePersonalYear } from "@/lib/calculations/calculateLifePath";
import { destinyMatrixArcanaDictionary } from "@/lib/data/destinyMatrixArcanaDictionary";
import { lifePathData } from "@/lib/data/numerology";
import { calculateBazi } from "@/lib/bazi/calculateBazi";
import type { BaziElement, BaziPolarity } from "@/lib/bazi/types";
import { calculateWeton } from "@/lib/weton/calculateWeton";
import {
  DAY_INTERPRETATIONS,
  PASARAN_INTERPRETATIONS,
  NEPTU_INTERPRETATIONS,
  WUKU_DATA,
} from "@/lib/weton/dictionaries";
import { calculateTzolkin } from "@/lib/tzolkin/calculateTzolkin";
import {
  buildDailyAstroSynthesis,
  type DailyAstroSynthesis,
} from "@/lib/astrology/dailyAstroSynthesis";
import type {
  RelationshipStatus,
  ReadingFoundationEntry,
  WeeklyAstrologicalEvidence,
} from "@/lib/weeklyGuidance/types";

// ============================================================================
// TYPES & DEFINITIONS (PARITY WITH WEEKLY GUIDANCE + FOUR FOUNDATIONS)
// ============================================================================

export type DailyGuidanceSection = {
  key: string;
  title: string;
  focus: string;
  domain: string;
  summary: string;
  intensity: "high" | "medium" | "subtle";
  evidence: WeeklyAstrologicalEvidence;
  astrologicalMeaning: string;
  spiritualMeaning: string;
  blueprintContribution: string;
  crossSystemSynthesis?: string;
  readingFoundations?: ReadingFoundationEntry[];
  advice: string[];
  phases: { pagi: string[]; siang: string[]; malam: string[] };
  paragraphs: string[];
  sourceDomains: string[];
  timingEvidence?: string[];
};

export interface TenGodRelation {
  code: string;
  nameId: string;
  chinese: string;
  category: "Resource" | "Wealth" | "Officer" | "Output" | "Friend";
  elementDynamic: string;
  summary: string;
  domainFocus: {
    thinking: string;
    economy: string;
    identity: string;
  };
}

export type DailyCosmicSummary = {
  dateKey: string;
  dateFormatted: string;
  wetonToday?: {
    weton: string;
    day: string;
    pasaran: string;
    neptuDay?: number;
    neptuPasaran?: number;
    totalNeptu?: number;
    wuku?: string;
    wukuDescription?: string;
    watak?: string;
    pasaranWatak?: string;
  };
  baziToday?: {
    display: string;
    stem: string;
    stemPinyin: string;
    branch: string;
    branchPinyin: string;
    element: string;
    polarity: string;
    isDayRen: boolean;
    dayRenNote?: string;
    stemMeaning?: string;
    tenGodRelation?: TenGodRelation;
    natalRelation?: string;
  };
  tzolkinToday?: {
    kin: number;
    kinName: string;
    solarSeal?: {
      name: string;
      code?: string;
      keyword: string;
      gift?: string;
      challenge?: string;
      purpose?: string;
    };
    galacticTone?: {
      name: string;
      function: string;
      gift?: string;
      lesson?: string;
    };
    wavespellName: string;
    wavespellMeaning: string;
    wavespellGrowthDirection?: string;
  };
  collectiveTheme: string;
  lunarPhaseSummary: string;
  planetaryMotionSummary: string;
  keyEvents: string[];
  mostActivePersonalTransit: {
    summary: string;
    transitBody: string;
    transitSign: string;
    transitHouse: number;
    natalBody: string;
    natalSign: string;
    natalHouse: number;
    aspectLabel: string;
    orb: number;
    phaseLabel: string;
    exactTimeFormatted?: string;
  } | null;
  activePlacidusHouses: number[];
  top3HighlightedDomains: Array<{
    key: string;
    title: string;
    headline: string;
    intensity: "high" | "medium" | "subtle";
  }>;
  mainSpiritualMessage: string;
};

export type DailyGuidance = {
  uid: string;
  timezone: string;
  dateKey: string;
  dateFormatted: string;
  state: "ready" | "limited" | "unavailable";
  relationshipStatus?: RelationshipStatus;
  availableSources: string[];
  limitedSources: string[];
  unavailableSources: string[];
  cosmicSummary: DailyCosmicSummary;
  sections: DailyGuidanceSection[];
  dailyDirection: {
    title: string;
    paragraphs: string[];
  };
  generatedAt: string;
};

export interface BuildDailyGuidanceInput {
  uid: string;
  profile: Record<string, unknown>;
  blueprint: Record<string, unknown>;
  referenceDate?: Date;
  timezone?: string;
  appNow?: Date;
}

export const DAILY_DOMAIN_DEFINITIONS = [
  {
    key: "kabarHariIni",
    title: "Kabar Hari Ini",
    focus: "arah keseluruhan, iklim kosmik, dan vitalitas diri",
    domain: "identity",
    primaryHouses: [1, 10],
    preferredBodies: ["Sun", "Moon", "Ascendant"],
  },
  {
    key: "pikiran",
    title: "Pikiran",
    focus: "pola pikir, cara memilah keputusan, dan komunikasi",
    domain: "thinking",
    primaryHouses: [3, 9],
    preferredBodies: ["Mercury", "Uranus"],
  },
  {
    key: "ekonomi",
    title: "Ekonomi & Rezeki",
    focus: "pekerjaan, pengelolaan uang, dan tanggung jawab materi",
    domain: "economy",
    primaryHouses: [2, 10, 6],
    preferredBodies: ["Venus", "Jupiter", "Saturn"],
  },
  {
    key: "asmara",
    title: "Asmara & Percintaan",
    focus: "kedekatan emosional, kehangatan, dan relasi intim",
    domain: "relationship",
    primaryHouses: [7, 5],
    preferredBodies: ["Venus", "Mars", "Moon"],
  },
  {
    key: "orangTerdekat",
    title: "Orang Terdekat",
    focus: "hubungan keluarga, sahabat, dan batasan sosial yang sehat",
    domain: "social",
    primaryHouses: [4, 11],
    preferredBodies: ["Moon", "Mercury", "Saturn"],
  },
  {
    key: "maknaBatin",
    title: "Makna Batin",
    focus: "keheningan jiwa, evolusi kesadaran, dan ruang doa",
    domain: "spirituality",
    primaryHouses: [12, 9, 8],
    preferredBodies: ["Moon", "Neptune", "Pluto"],
  },
  {
    key: "yangMungkinTerasaBerat",
    title: "Yang Mungkin Terasa Berat",
    focus: "tekanan, titik gesekan batin, dan ruang pemulihan",
    domain: "shadow",
    primaryHouses: [6, 8, 12],
    preferredBodies: ["Saturn", "Pluto", "Chiron", "Mars"],
  },
  {
    key: "ruangYangSedangTerbuka",
    title: "Peluang yang Terbuka",
    focus: "potensi bertumbuh, rahmat kosmik, dan inisiatif baru",
    domain: "growth",
    primaryHouses: [5, 9, 10, 11],
    preferredBodies: ["Jupiter", "Venus", "Sun"],
  },
] as const;

// ============================================================================
// BAZI FIVE ELEMENTS & TEN GODS CALCULATION
// ============================================================================

const BAZI_STEMS = [
  { char: "甲", pinyin: "Jia", element: "Wood" as BaziElement, polarity: "Yang" as BaziPolarity },
  { char: "乙", pinyin: "Yi", element: "Wood" as BaziElement, polarity: "Yin" as BaziPolarity },
  { char: "丙", pinyin: "Bing", element: "Fire" as BaziElement, polarity: "Yang" as BaziPolarity },
  { char: "丁", pinyin: "Ding", element: "Fire" as BaziElement, polarity: "Yin" as BaziPolarity },
  { char: "戊", pinyin: "Wu", element: "Earth" as BaziElement, polarity: "Yang" as BaziPolarity },
  { char: "己", pinyin: "Ji", element: "Earth" as BaziElement, polarity: "Yin" as BaziPolarity },
  { char: "庚", pinyin: "Geng", element: "Metal" as BaziElement, polarity: "Yang" as BaziPolarity },
  { char: "辛", pinyin: "Xin", element: "Metal" as BaziElement, polarity: "Yin" as BaziPolarity },
  { char: "壬", pinyin: "Ren", element: "Water" as BaziElement, polarity: "Yang" as BaziPolarity },
  { char: "癸", pinyin: "Gui", element: "Water" as BaziElement, polarity: "Yin" as BaziPolarity },
] as const;

const GENERATES: Record<BaziElement, BaziElement> = {
  Wood: "Fire",
  Fire: "Earth",
  Earth: "Metal",
  Metal: "Water",
  Water: "Wood",
};

const CONTROLS: Record<BaziElement, BaziElement> = {
  Wood: "Earth",
  Earth: "Water",
  Water: "Fire",
  Fire: "Metal",
  Metal: "Wood",
};

const STEM_MEANINGS: Record<string, string> = {
  Jia: "Pilar 甲 (Jia - Kayu Yang) mencerminkan pertumbuhan lurus pohon besar: visioner, mandiri, dan berakar kuat.",
  Yi: "Pilar 乙 (Yi - Kayu Yin) mencerminkan kelenturan sulur: adaptif, cerdas berjejaring, dan lembut namun gigih.",
  Bing: "Pilar 丙 (Bing - Api Yang) mencerminkan kehangatan matahari: terbuka, menerangi arah, dan memberi inspirasi luas.",
  Ding: "Pilar 丁 (Ding - Api Yin) mencerminkan cahaya pelita: intuitif, fokus mendalam, dan memberi pencerahan personal.",
  Wu: "Pilar 戊 (Wu - Tanah Yang) mencerminkan kekokohan gunung: stabil, protektif, dan teguh memegang tanggung jawab.",
  Ji: "Pilar 己 (Ji - Tanah Yin) mencerminkan kesuburan tanah: merawat potensi, praktis, dan menyuburkan pertumbuhan sekitar.",
  Geng: "Pilar 庚 (Geng - Logam Yang) mencerminkan ketajaman pedang: berani, tegas, dan berintegritas dalam pembenahan.",
  Xin: "Pilar 辛 (Xin - Logam Yin) mencerminkan kemilau permata: presisi, bernilai luhur, dan peka terhadap kualitas sejati.",
  Ren: "Pilar 壬 (Ren - Air Yang) mencerminkan samudra luas: dinamis, sangat adaptif, cerdas, dan menghubungkan banyak arah hidup.",
  Gui: "Pilar 癸 (Gui - Air Yin) mencerminkan embun dan hujan: menyejukkan, intuitif, sabar menembus celah, dan menumbuhkan perlahan.",
};

export function computeBaziTenGod(
  natalStemPinyin?: string,
  dailyStemPinyin?: string
): TenGodRelation | undefined {
  if (!natalStemPinyin || !dailyStemPinyin) return undefined;
  const natal = BAZI_STEMS.find((s) => s.pinyin.toLowerCase() === natalStemPinyin.toLowerCase());
  const daily = BAZI_STEMS.find((s) => s.pinyin.toLowerCase() === dailyStemPinyin.toLowerCase());
  if (!natal || !daily) return undefined;

  const samePolarity = natal.polarity === daily.polarity;

  if (natal.element === daily.element) {
    if (samePolarity) {
      return {
        code: "Friend",
        nameId: "Friend (Bi Jian / 比肩)",
        chinese: "比肩",
        category: "Friend",
        elementDynamic: `${daily.element} ${daily.polarity} selaras dengan ${natal.element} ${natal.polarity}`,
        summary: "Energi hari ini menguatkan rasa percaya diri, kemandirian batin, dan keteguhan prinsip hidup.",
        domainFocus: {
          thinking: "mendorong kestabilan cara pandang dan ketegasan dalam memegang prinsip mandiri",
          economy: "menuntut kehati-hatian dalam kerja sama agar tidak memikul beban orang lain sendirian",
          identity: "meneguhkan ketahanan batin dan kemandirian melangkah tanpa keraguan",
        },
      };
    } else {
      return {
        code: "Rob Wealth",
        nameId: "Rob Wealth (Jie Cai / 劫财)",
        chinese: "劫财",
        category: "Friend",
        elementDynamic: `${daily.element} ${daily.polarity} berdampingan dengan ${natal.element} ${natal.polarity}`,
        summary: "Dinamika hari ini menguji kepekaan berbagi dan kemampuan menjaga batas sumber daya pribadi.",
        domainFocus: {
          thinking: "waspadai dorongan tergesa-gesa membandingkan diri dengan pencapaian lingkungan luar",
          economy: "hindari pengeluaran impulsif atau komitmen finansial tanpa perhitungan matang",
          identity: "mengasah batas diri antara kemurahan hati dan perlindungan energi pribadi",
        },
      };
    }
  }

  if (GENERATES[natal.element] === daily.element) {
    if (samePolarity) {
      return {
        code: "Eating God",
        nameId: "Eating God (Shi Shen / 食神)",
        chinese: "食神",
        category: "Output",
        elementDynamic: `${natal.element} ${natal.polarity} melahirkan ${daily.element} ${daily.polarity}`,
        summary: "Hari ini membuka aliran kreativitas yang tenang, apresiasi rasa, dan ide-ide yang mengalir alami.",
        domainFocus: {
          thinking: "sangat baik untuk merancang karya baru, menuangkan gagasan, dan berkomunikasi dengan hangat",
          economy: "peluang rezeki terbuka dari keahlian kreatif, karya nyata, dan pelayanan tulus",
          identity: "membawa ketenangan jiwa dan kepuasan menikmati proses hidup sehari-hari",
        },
      };
    } else {
      return {
        code: "Hurting Officer",
        nameId: "Hurting Officer (Shang Guan / 伤官)",
        chinese: "伤官",
        category: "Output",
        elementDynamic: `${natal.element} ${natal.polarity} melahirkan ${daily.element} ${daily.polarity}`,
        summary: "Hari ini memicu dorongan berpikir kritis, keberanian mendobrak kebiasaan lama, dan ide out-of-the-box.",
        domainFocus: {
          thinking: "ketajaman analisis sangat tinggi; kelola cara menyampaikannya agar tetap santun dan membangun",
          economy: "inovasi baru membuka terobosan kerja, asalkan diimbangi disiplin eksekusi",
          identity: "keberanian bersuara dan menegaskan autentisitas diri melampaui formalitas",
        },
      };
    }
  }

  if (CONTROLS[natal.element] === daily.element) {
    if (samePolarity) {
      return {
        code: "Indirect Wealth",
        nameId: "Indirect Wealth (Pian Cai / 偏财)",
        chinese: "偏财",
        category: "Wealth",
        elementDynamic: `${natal.element} ${natal.polarity} mengelola ${daily.element} ${daily.polarity}`,
        summary: "Hari ini mengasah kejelian menangkap peluang dinamis dan keluwesan mengelola materi.",
        domainFocus: {
          thinking: "pikiran terarah pada strategi praktis, solusi adaptif, dan melihat peluang terselubung",
          economy: "peluang rezeki tak terduga dapat muncul dari jejaring dan inisiatif yang gesit",
          identity: "kelenturan menyelaraskan visi idealis dengan realitas lapangan secara cerdas",
        },
      };
    } else {
      return {
        code: "Direct Wealth",
        nameId: "Direct Wealth (Zheng Cai / 正财)",
        chinese: "正财",
        category: "Wealth",
        elementDynamic: `${natal.element} ${natal.polarity} mengelola ${daily.element} ${daily.polarity}`,
        summary: "Hari ini mendukung keteraturan finansial, ketekunan kerja nyata, dan rezeki yang terukur.",
        domainFocus: {
          thinking: "fokus pada langkah konkret, efisiensi waktu, dan ketelitian penyelesaian detail",
          economy: "rezeki bertumbuh melalui kestabilan, komitmen jangka panjang, dan pengelolaan disiplin",
          identity: "kematangan memegang tanggung jawab kehidupan nyata dengan integritas",
        },
      };
    }
  }

  if (CONTROLS[daily.element] === natal.element) {
    if (samePolarity) {
      return {
        code: "Seven Killings",
        nameId: "Seven Killings (Qi Sha / 七杀)",
        chinese: "七杀",
        category: "Officer",
        elementDynamic: `${daily.element} ${daily.polarity} melatih ${natal.element} ${natal.polarity}`,
        summary: "Hari ini menghadirkan tantangan ketegasan, keberanian bertindak di bawah tekanan, dan disiplin tinggi.",
        domainFocus: {
          thinking: "tuntutan situasi memaksamu menyaring prioritas utama dan memangkas keraguan nalar",
          economy: "disiplin ketat diperlukan untuk menyelesaikan kewajiban dan menjaga batas anggaran",
          identity: "pembentukan karakter tangguh melalui batas diri yang tegas dan kepemimpinan berintegritas",
        },
      };
    } else {
      return {
        code: "Direct Officer",
        nameId: "Direct Officer (Zheng Guan / 正官)",
        chinese: "正官",
        category: "Officer",
        elementDynamic: `${daily.element} ${daily.polarity} memandu ${natal.element} ${natal.polarity}`,
        summary: "Hari ini menaungi kepemimpinan berintegritas, ketertiban, dan pemenuhan tanggung jawab sosial.",
        domainFocus: {
          thinking: "keputusan diambil berdasarkan kepatutan moral, keadilan, dan konsistensi nalar",
          economy: "stabilitas karier dan kepercayaan mitra kerja meningkat melalui profesionalisme",
          identity: "kehormatan diri yang terpancar dari tindakan yang tertata rapi dan bertanggung jawab",
        },
      };
    }
  }

  // Daily generates Natal
  if (samePolarity) {
    return {
      code: "Indirect Resource",
      nameId: "Indirect Resource (Pian Yin / 偏印)",
      chinese: "偏印",
      category: "Resource",
      elementDynamic: `${daily.element} ${daily.polarity} menutrisi ${natal.element} ${natal.polarity}`,
      summary: "Hari ini menajamkan persepsi batin, ketertarikan pada ilmu spiritual atau filosofis, dan penyerapan hikmah unik.",
      domainFocus: {
        thinking: "daya tangkap intuisi sangat kuat untuk membaca apa yang tersirat di balik percakapan",
        economy: "menghindari keputusan spekulatif; mengumpulkan pemahaman mendalam sebelum bertindak",
        identity: "kedalaman perenungan batin dan perlindungan energi dari kebisingan lingkungan luar",
      },
    };
  } else {
    return {
      code: "Direct Resource",
      nameId: "Direct Resource (Zheng Yin / 正印)",
      chinese: "正印",
      category: "Resource",
      elementDynamic: `${daily.element} ${daily.polarity} menutrisi ${natal.element} ${natal.polarity}`,
      summary: "Hari ini membawa energi perlindungan batin, ketenteraman pikiran, pemulihan stamina, dan penyerapan pengetahuan.",
      domainFocus: {
        thinking: "pikiran tenang, mudah menyerap pelajaran baru, dan mampu meredakan kecemasan analitis",
        economy: "didukung oleh reputasi baik, bimbingan orang yang lebih bijak, dan rasa cukup yang menenangkan",
        identity: "rasa damai di dalam diri yang menumbuhkan ketabahan jiwa menghadapi ritme hari",
      },
    };
  }
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

function cleanSentence(text: string): string {
  const clean = text.replace(/\s+/g, " ").replace(/\s+([,.!?])/g, "$1").trim();
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

function formatHousePair(tHouse: number, nHouse: number): string {
  if (tHouse === nHouse) return `rumah ke-${tHouse} Placidus`;
  return `rumah ke-${tHouse} dan ke-${nHouse} Placidus`;
}

function getArcanaTitle(num: number): string {
  const entry = destinyMatrixArcanaDictionary[num];
  return entry ? `Arcana ${num} (${entry.name})` : `Arcana ${num}`;
}

function interpretLovePathArcana(
  loveLine: number[],
  relStatus: RelationshipStatus = "unspecified"
): { summary: string; detail: string } {
  if (loveLine.length !== 3) {
    return {
      summary: "Garis relasi jiwamu memerlukan kejujuran emosional dan penerimaan batas diri.",
      detail: "Keseimbangan memberi dan menerima",
    };
  }

  const [a1, a2, a3] = loveLine;
  const e1 = destinyMatrixArcanaDictionary[a1];
  const e2 = destinyMatrixArcanaDictionary[a2];
  const e3 = destinyMatrixArcanaDictionary[a3];

  const t1 = e1 ? `${e1.name}` : `Arcana ${a1}`;
  const t2 = e2 ? `${e2.name}` : `Arcana ${a2}`;
  const t3 = e3 ? `${e3.name}` : `Arcana ${a3}`;

  if (a1 === 7 && a2 === 10 && a3 === 21) {
    if (relStatus === "single") {
      return {
        summary:
          "Garis cinta Destiny Matrix-mu (7 The Chariot, 10 Wheel of Fortune, 21 The World) menegaskan bahwa kesiapan membuka hati bermula dari kebebasan batinmu sendiri. Jangan mengorbankan integritas jiwamu hanya demi memaksakan kehadiran orang baru.",
        detail:
          "Integrasi The Chariot (kemandirian berarah), Wheel of Fortune (kepercayaan pada waktu semesta), dan The World (keutuhan diri)",
      };
    } else if (relStatus === "in_relationship") {
      return {
        summary:
          "Garis cinta Destiny Matrix-mu (7 The Chariot, 10 Wheel of Fortune, 21 The World) mengarahkanmu untuk menjaga dinamika hubungan yang setara dan lapang. Menghormati ruang bertumbuh satu sama lain justru mempererat komitmen.",
        detail:
          "Integrasi The Chariot (arah bersama), Wheel of Fortune (pasang-surut kedekatan), dan The World (kelapangan hubungan)",
      };
    } else {
      return {
        summary:
          "Garis cinta Destiny Matrix-mu (7 The Chariot, 10 Wheel of Fortune, 21 The World) mengingatkanmu bahwa kehangatan relasi bermula dari keutuhan batin dan penerimaan diri tanpa kompromi berlebihan.",
        detail:
          "Integrasi The Chariot (tujuan hati), Wheel of Fortune (alur rasa), dan The World (keseimbangan batin)",
      };
    }
  }

  const s1 = e1 ? e1.relationshipPattern : "keseimbangan relasi";
  const s2 = e2 ? e2.coreEssence : "penerimaan";
  const s3 = e3 ? e3.growthDirection : "ketulusan";

  return {
    summary: `Garis cinta Destiny Matrix-mu (${a1} ${t1}, ${a2} ${t2}, ${a3} ${t3}) menegaskan bahwa relasimu tumbuh dari ${s1.toLowerCase()} dan kemampuan menyelaraskan ${s2.toLowerCase()} demi mencapai ${s3.toLowerCase()}.`,
    detail: `${t1} - ${t2} - ${t3}`,
  };
}

function interpretKarmicTail(tail: number[]): { summary: string; detail: string } {
  if (tail.length !== 3) {
    return {
      summary: "Ekor karma mengingatkanmu untuk melepaskan beban ekspektasi lama.",
      detail: "Pembersihan residu masa lalu",
    };
  }

  const [k1, k2, k3] = tail;
  const e1 = destinyMatrixArcanaDictionary[k1];
  const e2 = destinyMatrixArcanaDictionary[k2];
  const e3 = destinyMatrixArcanaDictionary[k3];
  const n1 = e1 ? e1.name : `Arcana ${k1}`;
  const n2 = e2 ? e2.name : `Arcana ${k2}`;
  const n3 = e3 ? e3.name : `Arcana ${k3}`;

  if (k1 === 21 && k2 === 7 && k3 === 13) {
    return {
      summary:
        "Ekor karma Destiny Matrix-mu (21 The World, 7 The Chariot, 13 Death) mengingatkan kecenderungan lama untuk merasa harus mengendalikan semua hasil sendirian dan takut akan akhir sebuah siklus. Hari ini adalah ruang aman untuk melepaskan beban yang bukan milikmu.",
      detail:
        "Dinamika 21-7-13: Transformasi pelepasan kontrol (21 keutuhan semesta, 7 ambisi terarah, 13 penutupan siklus)",
    };
  } else if (k1 === 18 && k2 === 6 && k3 === 15) {
    return {
      summary:
        "Ekor karma Destiny Matrix-mu (18 The Moon, 6 The Lovers, 15 The Devil) menyoroti kecurigaan atau keraguan diri saat menghadapi pilihan batin. Lepaskan keterikatan semu dan percayalah pada ketulusan nuranimu.",
      detail:
        "Dinamika 18-6-15: Kejernihan intuisi melampaui ilusi dan keterikatan emosional",
    };
  }

  return {
    summary: `Ekor karma Destiny Matrix-mu (${k1} ${n1}, ${k2} ${n2}, ${k3} ${n3}) mengajakmu mengenali pola lama yang menghambat kemandirian batin.`,
    detail: `${n1} - ${n2} - ${n3}`,
  };
}

function scoreAspectForDomain(
  aspect: DailyTransitToNatalAspect,
  def: (typeof DAILY_DOMAIN_DEFINITIONS)[number]
): number {
  let score = 0;
  const primaryHouses = def.primaryHouses as readonly number[];
  const preferredBodies = def.preferredBodies as readonly string[];

  // 1. House Relevance (Core Astrological Foundation)
  const tInPrimary = primaryHouses.includes(aspect.transitHouse);
  const nInPrimary = primaryHouses.includes(aspect.natalPlacement.house);
  if (tInPrimary && nInPrimary) score += 14;
  else if (tInPrimary) score += 9;
  else if (nInPrimary) score += 8;

  // 2. Planet Relevance
  const tPreferred = preferredBodies.includes(aspect.transitBody);
  const nPreferred = preferredBodies.includes(aspect.natalPlacement.name);
  if (tPreferred && nPreferred) score += 8;
  else if (tPreferred || nPreferred) score += 5;

  // 3. Aspect Type
  if (aspect.aspect === "Conjunction") score += 7;
  else if (aspect.aspect === "Opposition") score += 5;
  else if (aspect.aspect === "Square") score += 3;
  else score += 1;

  if (["Sun", "Moon", "Ascendant"].includes(aspect.natalPlacement.name)) {
    score += 3;
  }
  return score;
}

function buildDynamicDailyPhases(
  matchedAspect: DailyTransitToNatalAspect | undefined,
  def: (typeof DAILY_DOMAIN_DEFINITIONS)[number],
  timezone: string
): { pagi: string[]; siang: string[]; malam: string[] } {
  if (!matchedAspect) {
    return {
      pagi: [
        cleanSentence(
          `Di pagi hari, ritme di bidang ${def.focus} berjalan tenang dan stabil tanpa intervensi kosmik yang mendesak.`
        ),
      ],
      siang: [
        cleanSentence(
          `Memasuki siang hari, rawat konsistensi fokus yang sudah terbukti baik dengan ketenteraman batin.`
        ),
      ],
      malam: [
        cleanSentence(
          `Menjelang malam, jadikan keheningan ini sebagai ruang napas untuk menyegarkan kembali energimu.`
        ),
      ],
    };
  }

  const pName = PLANET_LABELS_ID[matchedAspect.transitBody] || matchedAspect.transitBody;
  const aspLabel = matchedAspect.aspectLabel;

  if (matchedAspect.exactDate) {
    const dtExact = DateTime.fromJSDate(matchedAspect.exactDate, { zone: timezone });
    const hour = dtExact.hour;
    const timeFormatted = matchedAspect.exactTimeFormatted || "hari ini";

    if (hour < 12) {
      return {
        pagi: [
          cleanSentence(
            `Puncak kontak ${aspLabel} antara ${pName} dan ${matchedAspect.natalPlacement.label} natal terjadi di pagi hari (${timeFormatted}); getaran kesadaran ini terasa paling segar sejak jam-jam awal.`
          ),
        ],
        siang: [
          cleanSentence(
            `Memasuki siang hari, energi transit mulai mengendap; gunakan momen ini untuk melanjutkan aktivitas tanpa ketergesaan.`
          ),
        ],
        malam: [
          cleanSentence(
            `Menjelang malam, pengaruh aspek melandai secara alami, memberi ruang bagi integrasi batin yang stabil.`
          ),
        ],
      };
    } else if (hour < 17) {
      return {
        pagi: [
          cleanSentence(
            `Di pagi hari, suasana batin di bidang ${def.focus} mulai berangsur menguat sebagai masa penyesuaian awal.`
          ),
        ],
        siang: [
          cleanSentence(
            `Puncak kontak ${aspLabel} tercapai di siang hari (${timeFormatted}); perhatikan kejernihan responmu saat dinamika kerja atau relasi sedang aktif.`
          ),
        ],
        malam: [
          cleanSentence(
            `Malam hari membawa waktu pemulihan; istirahatkan nalar dan endapkan seluruh pembelajaran hari ini.`
          ),
        ],
      };
    } else {
      return {
        pagi: [
          cleanSentence(
            `Pagi hari berjalan relatif lapang, memberimu waktu menata niat dan prioritas secara mandiri.`
          ),
        ],
        siang: [
          cleanSentence(
            `Sepanjang siang, intensitas di bidang ${def.focus} berangsur naik mendekati waktu puncak kontak.`
          ),
        ],
        malam: [
          cleanSentence(
            `Puncak kontak ${aspLabel} antara ${pName} dan ${matchedAspect.natalPlacement.label} natal tiba di malam hari (${timeFormatted}); sediakan ruang hening untuk merefleksikan makna batinnya.`
          ),
        ],
      };
    }
  }

  if (matchedAspect.nature === "separating") {
    return {
      pagi: [
        cleanSentence(
          `Di pagi hari, sisa gelombang ${aspLabel} ${pName} masih terasa samar, mengajakmu memulai hari dengan langkah teratur.`
        ),
      ],
      siang: [
        cleanSentence(
          `Memasuki siang hari, dinamika transit kian melandai, membuka kelapangan berpikir yang lebih obyektif.`
        ),
      ],
      malam: [
        cleanSentence(
          `Di malam hari, manfaatkan fase pelepasan ini untuk menyucikan beban pikiran sebelum beristirahat.`
        ),
      ],
    };
  }

  return {
    pagi: [
      cleanSentence(
        `Di pagi hari, dorongan halus dari ${aspLabel} ${pName} membangunkan kepekaan batinmu terhadap tema ${def.focus}.`
      ),
    ],
    siang: [
      cleanSentence(
        `Di siang hari, kelola interaksi dengan penuh kesadaran agar energimu tetap terlindungi dengan sehat.`
      ),
    ],
    malam: [
      cleanSentence(
        `Di malam hari, endapkan pengalaman seharian ini ke dalam doa atau refleksi hening.`
      ),
    ],
  };
}

// ============================================================================
// MAIN GENERATOR: BUILD DAILY GUIDANCE (DEEP CROSS-SYSTEM SYNTHESIS)
// ============================================================================

export function buildDailyGuidance(input: BuildDailyGuidanceInput): DailyGuidance {
  const safeZone = resolveSafeTimezone(input.timezone || (input.profile as any)?.timezone);
  const refDate = input.referenceDate || new Date();
  const timeWindow = computeDailyTimeWindow(refDate, safeZone);

  // 1. Cosmic Weather from SwissEph Ephemeris
  const synthesis: DailyAstroSynthesis = buildDailyAstroSynthesis({
    uid: input.uid,
    profileTimezone: safeZone,
    now: refDate,
  });

  // 2. Canonical Blueprint Extraction
  const blueprintObj = (input.blueprint || {}) as Record<string, unknown>;
  const profileObj = (input.profile || {}) as Record<string, unknown>;
  const canonical = extractFullCanonicalBlueprint(blueprintObj, profileObj, refDate);
  const inputBirthDate = String((blueprintObj.input as any)?.birthDate || profileObj.birthDate || "");
  const inputBirthTime = String((blueprintObj.input as any)?.birthTime || profileObj.birthTime || "12:00");

  // Ensure Natal Blueprint Fallbacks if missing from stored blueprint
  let natalWetonFull = canonical.wetonName ? { weton: canonical.wetonName, totalNeptu: canonical.wetonNeptu } : undefined;
  if (!natalWetonFull && inputBirthDate) {
    try {
      const nw = calculateWeton({ birthDate: inputBirthDate });
      natalWetonFull = { weton: nw.weton, totalNeptu: nw.totalNeptu };
    } catch {}
  }

  let natalTzolkinFull = canonical.tzolkinKin ? { kin: canonical.tzolkinKin, kinName: canonical.tzolkinSeal } : undefined;
  if (!natalTzolkinFull && inputBirthDate) {
    try {
      const nt = calculateTzolkin({ birthDate: inputBirthDate });
      natalTzolkinFull = { kin: nt.kin, kinName: nt.kinName };
    } catch {}
  }

  let natalBaziDayMaster = canonical.baziDayMaster;
  if (!natalBaziDayMaster && inputBirthDate) {
    try {
      const nb = calculateBazi({ birthDate: inputBirthDate, birthTime: inputBirthTime, timezone: safeZone });
      if (nb?.dayMaster) {
        natalBaziDayMaster = {
          element: nb.dayMaster.element,
          polarity: nb.dayMaster.polarity,
          stemPinyin: nb.dayMaster.pinyin,
        };
      }
    } catch {}
  }

  // 3. Four Daily Foundations Calculations (Daily Timeframe)
  // A. Weton Jawa Hari Ini (Full calculation & dictionaries)
  let wetonTodayCalc: ReturnType<typeof calculateWeton> | null = null;
  try {
    wetonTodayCalc = calculateWeton({ birthDate: timeWindow.dayKey });
  } catch {}

  const wetonToday: DailyCosmicSummary["wetonToday"] = wetonTodayCalc
    ? {
        weton: wetonTodayCalc.weton,
        day: wetonTodayCalc.day,
        pasaran: wetonTodayCalc.pasaran,
        neptuDay: wetonTodayCalc.neptuDay,
        neptuPasaran: wetonTodayCalc.neptuPasaran,
        totalNeptu: wetonTodayCalc.totalNeptu,
        wuku: wetonTodayCalc.wuku.name,
        wukuDescription: wetonTodayCalc.wuku.description,
        watak: DAY_INTERPRETATIONS[wetonTodayCalc.day]?.watak,
        pasaranWatak: PASARAN_INTERPRETATIONS[wetonTodayCalc.pasaran]?.watak,
      }
    : synthesis.eastern?.weton
    ? {
        weton: synthesis.eastern.weton.weton,
        day: synthesis.eastern.weton.weton.split(" ")[0] || "Hari",
        pasaran: synthesis.eastern.weton.pasaran,
      }
    : undefined;

  const wetonDayMeaning = wetonTodayCalc
    ? DAY_INTERPRETATIONS[wetonTodayCalc.day]
    : { watak: "keseimbangan ritme hidup", strength: "kelapangan pikiran", challenge: "menjaga kesabaran", work: "ketelitian kerja" };
  const wetonPasaranMeaning = wetonTodayCalc
    ? PASARAN_INTERPRETATIONS[wetonTodayCalc.pasaran]
    : { watak: "ketenangan rasa", strength: "keteguhan melangkah", challenge: "menjaga batas", relationship: "kejujuran komunikasi", money: "pengelolaan disiplin" };

  // B. BaZi Tiongkok Hari Ini (Pilar Hari, Deteksi Ren Day, Ten Gods)
  let baziTodayCalc: ReturnType<typeof calculateBazi> | null = null;
  try {
    baziTodayCalc = calculateBazi({
      birthDate: timeWindow.dayKey,
      birthTime: "12:00",
      timezone: safeZone,
    });
  } catch (err) {
    console.warn("[DAILY_BAZI_CALC_FAILED]", err);
  }

  const baziDayPillar = baziTodayCalc?.dayPillar;
  const isDayRen = baziDayPillar?.stemPinyin === "Ren";
  const dayRenNote = isDayRen
    ? "Hari ini dinaungi oleh Ren (壬 - Air Yang) yang mencerminkan energi samudra: luas, adaptif, intuitif, dan mampu menghubungkan banyak arah dinamika hidup."
    : undefined;

  const stemMeaning = baziDayPillar?.stemPinyin
    ? STEM_MEANINGS[baziDayPillar.stemPinyin] || `Pilar ${baziDayPillar.display}`
    : undefined;

  // Compute Ten Gods (Shi Shen) relationship between Daily Stem and Natal Day Master
  const tenGodRelation = computeBaziTenGod(
    natalBaziDayMaster?.stemPinyin,
    baziDayPillar?.stemPinyin
  );

  const baziToday: DailyCosmicSummary["baziToday"] = baziDayPillar
    ? {
        display: baziDayPillar.display,
        stem: baziDayPillar.stem,
        stemPinyin: baziDayPillar.stemPinyin,
        branch: baziDayPillar.branch,
        branchPinyin: baziDayPillar.branchPinyin,
        element: baziDayPillar.element,
        polarity: baziDayPillar.polarity,
        isDayRen,
        dayRenNote,
        stemMeaning,
        tenGodRelation,
        natalRelation: tenGodRelation ? `${tenGodRelation.nameId}: ${tenGodRelation.summary}` : undefined,
      }
    : undefined;

  // C. Tzolkin Maya Hari Ini (Full Daily Kin, Solar Seal, Galactic Tone, Wavespell)
  let tzolkinTodayCalc: ReturnType<typeof calculateTzolkin> | null = null;
  try {
    tzolkinTodayCalc = calculateTzolkin({ birthDate: timeWindow.dayKey });
  } catch {}

  const tzolkinToday: DailyCosmicSummary["tzolkinToday"] = tzolkinTodayCalc
    ? {
        kin: tzolkinTodayCalc.kin,
        kinName: tzolkinTodayCalc.kinName,
        solarSeal: {
          name: tzolkinTodayCalc.solarSeal.name,
          code: tzolkinTodayCalc.solarSeal.code,
          keyword: tzolkinTodayCalc.solarSeal.keyword,
          gift: tzolkinTodayCalc.solarSeal.gift,
          challenge: tzolkinTodayCalc.solarSeal.challenge,
          purpose: tzolkinTodayCalc.solarSeal.purpose,
        },
        galacticTone: {
          name: tzolkinTodayCalc.galacticTone.name,
          function: tzolkinTodayCalc.galacticTone.function,
          gift: tzolkinTodayCalc.galacticTone.gift,
          lesson: tzolkinTodayCalc.galacticTone.lesson,
        },
        wavespellName: tzolkinTodayCalc.wavespell.name,
        wavespellMeaning: tzolkinTodayCalc.wavespell.meaning,
        wavespellGrowthDirection: tzolkinTodayCalc.wavespell.growthDirection,
      }
    : synthesis.eastern?.tzolkin
    ? {
        kin: synthesis.eastern.tzolkin.kin,
        kinName: synthesis.eastern.tzolkin.kinName,
        wavespellName: synthesis.eastern.tzolkin.wavespellName,
        wavespellMeaning: synthesis.eastern.tzolkin.wavespellMeaning,
      }
    : undefined;

  // D. Safe Love Path & Relationship Status
  let lovePath = canonical.dmLoveLine;
  if (inputBirthDate) {
    try {
      const cdm = calculateCanonicalDestinyMatrixBlueprint(inputBirthDate);
      if (cdm?.loveLine && cdm.loveLine.length === 3) {
        lovePath = cdm.loveLine;
      }
    } catch {}
  }

  const relStatus: RelationshipStatus =
    (profileObj.relationshipStatus as RelationshipStatus) || "unspecified";

  // 4. Natal Placements & Daily Transits (SwissEph Root Finding)
  const astroChart =
    (blueprintObj.astrology as Record<string, unknown>) ||
    (blueprintObj.natalChart as Record<string, unknown>) ||
    {};
  const natalHouses =
    astroChart.placidusHouses || astroChart.houses || astroChart.wholeSignHouses;

  const { placements, placidusHouses } = extractNatalPlacements({
    ...blueprintObj,
    astrology: {
      ...astroChart,
      placidusHouses: natalHouses,
    },
  });

  const dailyAspects = calculateDailyTransitToNatalAspects(
    timeWindow,
    placements,
    placidusHouses
  );

  const availableSources: string[] = ["Western Astrology", "SwissEph Ephemeris"];
  const limitedSources: string[] = [];
  const unavailableSources: string[] = [];

  if (placements.length > 0) availableSources.push("Placidus Natal Chart");
  if (canonical.lifePathNumber) availableSources.push("Numerology");
  if (canonical.hdType) availableSources.push("Human Design");
  if (natalBaziDayMaster || baziToday) availableSources.push("BaZi");
  if (canonical.dmCenter) availableSources.push("Destiny Matrix");
  if (natalWetonFull || wetonToday) availableSources.push("Weton");
  if (natalTzolkinFull || tzolkinToday) availableSources.push("Tzolkin");

  // State determination
  let state: "ready" | "limited" | "unavailable" = "ready";
  if (placements.length === 0) {
    state = "limited";
    limitedSources.push("Placidus Natal Chart");
  }

  // 5. Match Aspects to 8 Domains (Collision-Free)
  const sections: DailyGuidanceSection[] = [];
  const domainAspectScores: Array<{ key: string; score: number; aspect?: DailyTransitToNatalAspect }> = [];
  const usedAspectIndices = new Set<number>();
  const domainAspectMatches: Array<{
    def: (typeof DAILY_DOMAIN_DEFINITIONS)[number];
    aspect?: DailyTransitToNatalAspect;
    score: number;
  }> = [];

  for (const def of DAILY_DOMAIN_DEFINITIONS) {
    let bestIdx = -1;
    let bestScore = 0;

    for (let i = 0; i < dailyAspects.length; i++) {
      if (usedAspectIndices.has(i)) continue;
      const sc = scoreAspectForDomain(dailyAspects[i], def);
      if (sc > bestScore) {
        bestScore = sc;
        bestIdx = i;
      }
    }

    // Minimum relevance threshold: 14 to count as direct activation
    if (bestScore >= 14 && bestIdx >= 0) {
      usedAspectIndices.add(bestIdx);
      domainAspectMatches.push({ def, aspect: dailyAspects[bestIdx], score: bestScore });
    } else {
      domainAspectMatches.push({ def, aspect: undefined, score: bestScore });
    }
  }

  // 6. Assemble 8 Domains with Deep Organic Cross-System Synthesis
  for (const { def, aspect: matchedAspect, score: bestScore } of domainAspectMatches) {
    domainAspectScores.push({ key: def.key, score: bestScore, aspect: matchedAspect });

    let intensity: "high" | "medium" | "subtle" = "subtle";
    if (matchedAspect) {
      if (bestScore >= 22 && matchedAspect.orb <= 2.2) {
        intensity = "high";
      } else {
        intensity = "medium";
      }
    }

    // A. Astrological Evidence
    const evidence: WeeklyAstrologicalEvidence = matchedAspect
      ? {
          hasDirectActivation: true,
          transitBody: matchedAspect.transitBody,
          transitLongitude: matchedAspect.transitLongitude,
          transitSign: matchedAspect.transitSign,
          transitDegree: matchedAspect.transitDegree,
          transitMotion: matchedAspect.transitMotion,
          transitPlacidusHouse: matchedAspect.transitHouse,
          isCuspCrossing: matchedAspect.isCuspCrossing,
          cuspCrossingDetail: matchedAspect.cuspCrossingDetail,
          natalTouchedBody: matchedAspect.natalPlacement.name,
          natalLongitude: matchedAspect.natalPlacement.longitude,
          natalSign: matchedAspect.natalPlacement.sign,
          natalDegree: matchedAspect.natalPlacement.degree,
          natalPlacidusHouse: matchedAspect.natalPlacement.house,
          aspectType: matchedAspect.aspect,
          aspectLabel: matchedAspect.aspectLabel,
          aspectOrb: matchedAspect.orb,
          aspectPhase: matchedAspect.nature,
          exactTimeFormatted: matchedAspect.exactTimeFormatted,
          activeHouses: [matchedAspect.transitHouse, matchedAspect.natalPlacement.house],
          activationSummary: `${PLANET_LABELS_ID[matchedAspect.transitBody] || matchedAspect.transitBody} (${matchedAspect.transitSign} ${matchedAspect.transitDegree}°, H${matchedAspect.transitHouse}) ${matchedAspect.aspectLabel} ${matchedAspect.natalPlacement.label} natal (${matchedAspect.natalPlacement.sign} ${matchedAspect.natalPlacement.degree}°, H${matchedAspect.natalPlacement.house}), orb ${matchedAspect.orb}° (${matchedAspect.nature}${matchedAspect.exactTimeFormatted ? `, ${matchedAspect.exactTimeFormatted}` : ""})`,
        }
      : {
          hasDirectActivation: false,
          activeHouses: [...def.primaryHouses],
          activationSummary: `Tidak ada aspek mayor transit yang memicu titik natal secara tajam hari ini; energi di ${formatHousePair(def.primaryHouses[0], def.primaryHouses[1] || def.primaryHouses[0])} mengalir tenang.`,
        };

    // B. Astrological Meaning (What is moving & what natal placements are touched)
    let astroMeaning = "";
    if (matchedAspect) {
      const pName = PLANET_LABELS_ID[matchedAspect.transitBody] || matchedAspect.transitBody;
      const nName = matchedAspect.natalPlacement.label;
      const timingClause = matchedAspect.exactTimeFormatted
        ? ` (kulminasi ${matchedAspect.exactTimeFormatted})`
        : "";
      astroMeaning = `Secara astronomis, transit ${pName} melintasi rumah ke-${matchedAspect.transitHouse} Placidus membentuk kontak ${matchedAspect.aspectLabel} dengan ${nName} natalmu di rumah ke-${matchedAspect.natalPlacement.house} dengan orb ${matchedAspect.orb}° (${matchedAspect.nature}${timingClause}). Dinamika langit ini mengaktifkan poros pengalaman ${formatHousePair(matchedAspect.transitHouse, matchedAspect.natalPlacement.house)}, mempertemukan stimulus eksternal hari ini dengan arketipe dasar chart natalmu.`;
    } else {
      astroMeaning = `Tanpa kontak aspek transit mayor yang mendesak hari ini, bidang ${def.focus} berada dalam ritme asimilasi yang stabil. Wilayah rumah ke-${def.primaryHouses[0]} Placidus memberi kesempatan merawat apa yang sudah tertata tanpa tekanan perubahan mendadak.`;
    }

    // C. Spiritual Meaning & Soul Journey
    let spiritualMeaning = "";
    if (def.key === "kabarHariIni") {
      spiritualMeaning =
        "Hari ini jiwamu diajak hadir seutuhnya di momen sekarang. Perhatikan bagaimana tubuh dan perasaanmu merespons ritme lingkungan tanpa terburu-buru mengambil kesimpulan.";
    } else if (def.key === "pikiran") {
      spiritualMeaning =
        "Kejernihan nalar hari ini lahir dari keberanian mengendapkan ide sebelum menyuarakannya. Pilih percakapan yang membangun dan lepaskan perdebatan yang menguras energi.";
    } else if (def.key === "ekonomi") {
      spiritualMeaning =
        "Hubunganmu dengan rezeki mencerminkan rasa syukur dan integritas kerja. Kelola apa yang ada di tanganmu hari ini dengan ketelitian dan rasa cukup yang menenangkan.";
    } else if (def.key === "asmara") {
      if (relStatus === "single") {
        spiritualMeaning =
          "Bagi hatimu yang sedang sendiri, hari ini mengingatkan bahwa keintiman sejati berakar dari keutuhan rasa aman batinmu. Rawat rasa hormat pada dirimu sendiri sebelum membuka pintu bagi orang lain.";
      } else if (relStatus === "in_relationship") {
        spiritualMeaning =
          "Bagi hubungan yang sedang terjalin, hari ini membuka ruang untuk mendengarkan pasangan tanpa prasangka. Kelembutan tutur katamu menjadi jembatan pengertian yang kuat.";
      } else {
        spiritualMeaning =
          "Kehangatan relasi hari ini tumbuh dari ketulusan dan kemampuan menghormati batas diri secara seimbang.";
      }
    } else if (def.key === "orangTerdekat") {
      spiritualMeaning =
        "Lingkaran terdekatmu adalah cermin kenyamanan batin. Berikan perhatian tulus pada mereka yang mendukungmu dalam diam, dan jaga jarak sehat dari dinamika yang melelahkan.";
    } else if (def.key === "maknaBatin") {
      spiritualMeaning =
        "Di balik hiruk-pikuk aktivitas, ada keheningan suci yang selalu menunggumu pulang. Luangkan waktu jeda untuk menyelaraskan kembali niat jiwamu.";
    } else if (def.key === "yangMungkinTerasaBerat") {
      spiritualMeaning =
        "Rasa berat atau gesekan yang muncul hari ini bukanlah halangan, melainkan petunjuk lembut tentang bagian diri yang meminta kelembutan dan istirahat.";
    } else {
      spiritualMeaning =
        "Peluang hari ini hadir bukan dalam bentuk lompatan besar yang menggebu-gebu, melainkan langkah kecil yang dikerjakan dengan kesungguhan dan ketulusan hati.";
    }

    // D. Deep Cross-System Synthesis & Reading Foundations (Domain-Aware)
    let crossSystemSynthesis = "";
    const foundations: ReadingFoundationEntry[] = [];

    // Sky foundation
    if (matchedAspect) {
      foundations.push({
        system: "Astrologi Western (Placidus)",
        indicator: `${matchedAspect.transitBody} ${matchedAspect.aspectLabel} ${matchedAspect.natalPlacement.name}`,
        detail: `Orb ${matchedAspect.orb}°, H${matchedAspect.transitHouse} transit vs H${matchedAspect.natalPlacement.house} natal (${matchedAspect.nature}${matchedAspect.exactTimeFormatted ? `, ${matchedAspect.exactTimeFormatted}` : ""})`,
      });
    }

    if (def.key === "kabarHariIni") {
      const wetonSnippet = wetonToday
        ? `energi Weton ${wetonToday.weton} (Neptu ${wetonToday.totalNeptu || 14}) yang berwatak ${wetonDayMeaning.watak} serta pasaran ${wetonToday.pasaran} yang ${wetonPasaranMeaning.watak}`
        : "ritme siklus Nusantara yang membumi";

      const baziSnippet = baziToday
        ? baziToday.isDayRen
          ? `Day Ren (${baziToday.display}) — ${baziToday.dayRenNote}`
          : `pilar BaZi ${baziToday.display} (${baziToday.element} ${baziToday.polarity}) dengan dinamika Ten Gods ${tenGodRelation?.nameId || "Harmoni Alamiah"} (${tenGodRelation?.summary || ""})`
        : "aliran pilar BaZi harian";

      const tzolkinSnippet = tzolkinToday
        ? `getaran Tzolkin Maya Kin ${tzolkinToday.kin} (${tzolkinToday.kinName}) bertema ${tzolkinToday.solarSeal?.keyword || "penyelarasan"}`
        : "getaran siklus Maya";

      const blueprintSnippet = canonical.hdType
        ? `desain jiwamu sebagai ${canonical.hdType} (${canonical.hdProfile || ""}) dengan Otoritas ${canonical.hdAuthority || "batiniah"}`
        : "kompas batin cetak birumu";

      crossSystemSynthesis = cleanSentence(
        `Pertemuan transit kosmik hari ini dengan ${wetonSnippet} dan ${baziSnippet} membentuk landasan batin yang mantap. Didukung ${tzolkinSnippet}, kamu diingatkan untuk menyelaraskan tindakan dengan ${blueprintSnippet}, melangkah tanpa ketergesaan dan menjaga integritas diri seutuhnya.`
      );

      if (wetonToday) {
        foundations.push({
          system: "Weton Harian",
          indicator: `${wetonToday.weton} (Neptu ${wetonToday.totalNeptu || 14})`,
          detail: `Watak: ${wetonDayMeaning.watak} · Pasaran: ${wetonPasaranMeaning.watak}`,
        });
      }
      if (baziToday) {
        foundations.push({
          system: "BaZi Harian",
          indicator: baziToday.display,
          detail: `${baziToday.isDayRen ? "Day Ren (Air Yang)" : `Elemen ${baziToday.element}`} · Relasi Ten Gods: ${tenGodRelation?.nameId || "Keseimbangan Unsur"}`,
        });
      }
      if (tzolkinToday) {
        foundations.push({
          system: "Tzolkin Maya",
          indicator: `Kin ${tzolkinToday.kin} · ${tzolkinToday.kinName}`,
          detail: `Fase: ${tzolkinToday.solarSeal?.keyword || ""} · Nada: ${tzolkinToday.galacticTone?.function || ""}`,
        });
      }
      if (canonical.hdType) {
        foundations.push({
          system: "Human Design",
          indicator: `${canonical.hdType} ${canonical.hdProfile || ""}`,
          detail: `Otoritas: ${canonical.hdAuthority || "Alami"} · Strategi Hidup`,
        });
      }
      if (canonical.lifePathNumber) {
        foundations.push({
          system: "Numerologi",
          indicator: `Life Path ${canonical.lifePathNumber}`,
          detail: canonical.personalYear ? `Tahun Pribadi ${canonical.personalYear}` : `Peran: ${canonical.lifePathRole || "Pembangun"}`,
        });
      }
    } else if (def.key === "pikiran") {
      const dmText = natalBaziDayMaster
        ? `Day Master-mu (${natalBaziDayMaster.polarity} ${natalBaziDayMaster.element}${natalBaziDayMaster.stemPinyin ? ` [${natalBaziDayMaster.stemPinyin}]` : ""})`
        : "fondasi temperamen nalar BaZi-mu";

      const tenGodFocus = tenGodRelation
        ? `relasi Ten Gods ${tenGodRelation.nameId} (${tenGodRelation.domainFocus.thinking})`
        : "penyelarasan unsur yang menenangkan nalar";

      const wetonDayFocus = wetonToday
        ? `karakter hari ${wetonToday.day} yang ${wetonDayMeaning.watak}`
        : "kejernihan ritme hari";

      crossSystemSynthesis = cleanSentence(
        `Kejernihan berpikir dan ketepatan keputusan hari ini dipandu oleh interaksi antara ${dmText} dengan energi pilar harian (${baziToday?.display || "BaZi harian"}). Kehadiran ${tenGodFocus} berpadu dengan ${wetonDayFocus}, memberimu kemampuan memilah hal esensial dari kebisingan opini luar. Gunakan ${canonical.hdAuthority ? `Otoritas ${canonical.hdAuthority}` : "keheningan batinmu"} untuk menguji ide sebelum menyatakannya secara terbuka.`
      );

      if (natalBaziDayMaster) {
        foundations.push({
          system: "BaZi",
          indicator: `Day Master: ${natalBaziDayMaster.polarity} ${natalBaziDayMaster.element}`,
          detail: `Ten Gods Harian: ${tenGodRelation?.nameId || "Keseimbangan Elemen"} (${tenGodRelation?.chinese || ""})`,
        });
      }
      if (wetonToday) {
        foundations.push({
          system: "Weton Harian",
          indicator: `Hari ${wetonToday.day}`,
          detail: `Watak Nalar: ${wetonDayMeaning.watak}`,
        });
      }
    } else if (def.key === "ekonomi") {
      const moneyLineArcanas =
        canonical.dmMoneyLine && canonical.dmMoneyLine.length === 3
          ? canonical.dmMoneyLine.map(getArcanaTitle).join(", ")
          : "Garis Keuangan Destiny Matrix";

      const wetonMoneySnippet = wetonToday
        ? `pesan pasaran ${wetonToday.pasaran} bahwa ${wetonPasaranMeaning.money}`
        : "pengelolaan materi yang berhati-hati";

      const baziEconomySnippet = tenGodRelation
        ? `iklim BaZi harian (${baziToday?.display || ""}) yang mengarahkan ${tenGodRelation.domainFocus.economy}`
        : "disiplin kerja nyata";

      crossSystemSynthesis = cleanSentence(
        `Arus rezeki dan tanggung jawab materi hari ini disinari oleh garis keuangan Destiny Matrix (${moneyLineArcanas}). Dalam tradisi Weton Nusantara, ${wetonMoneySnippet}, yang ditegaskan pula oleh ${baziEconomySnippet}. Keseimbangan lintas sistem ini mengingatkan bahwa kemakmuran sejati berakar dari integritas niat, keteraturan pencatatan, dan ketahanan dalam proses kerja harian.`
      );

      if (canonical.dmMoneyLine && canonical.dmMoneyLine.length === 3) {
        foundations.push({
          system: "Destiny Matrix",
          indicator: `Garis Keuangan: ${canonical.dmMoneyLine.join("–")}`,
          detail: "Arketipe integritas profesional & pengelolaan materi",
        });
      }
      if (baziToday) {
        foundations.push({
          system: "BaZi Harian",
          indicator: `Pilar: ${baziToday.display}`,
          detail: `Ten Gods Rezeki: ${tenGodRelation?.nameId || "Peluang Materi"}`,
        });
      }
      if (wetonToday) {
        foundations.push({
          system: "Weton Harian",
          indicator: `Pasaran ${wetonToday.pasaran}`,
          detail: `Pedoman Materi: ${wetonPasaranMeaning.money}`,
        });
      }
    } else if (def.key === "asmara") {
      const loveInterp = interpretLovePathArcana(lovePath, relStatus);
      const wetonRelSnippet = wetonToday
        ? `kearifan pasaran ${wetonToday.pasaran} yang mengajarkan bahwa ${wetonPasaranMeaning.relationship}`
        : "kejujuran rasa dan kehangatan tulus";

      crossSystemSynthesis = cleanSentence(
        `${loveInterp.summary} Nilai ini menyatu selaras dengan ${wetonRelSnippet}. ${
          relStatus === "single"
            ? "Keutuhan dirimu hari ini adalah daya pikat yang sesungguhnya; jangan terburu-buru menurunkan standar nilai batin hanya demi mengusir kesendirian sesaat."
            : relStatus === "in_relationship"
            ? "Rawat rasa saling menghormati dengan mendengarkan secara tulus tanpa menyelipkan prasangka; ruang yang lapang justru mempererat ikatan jiwa."
            : "Jaga kemurnian niat dan kejelasan batas diri dalam setiap interaksi perasaan."
        }`
      );

      foundations.push({
        system: "Destiny Matrix",
        indicator: `Love Path: ${lovePath.join("–")}`,
        detail: `Status: ${relStatus === "single" ? "Single (Kemandirian Batin)" : relStatus === "in_relationship" ? "Berpasangan (Komitmen & Ruang Tumbuh)" : "Netral"} · ${loveInterp.detail}`,
      });
      if (wetonToday) {
        foundations.push({
          system: "Weton Harian",
          indicator: `Pasaran ${wetonToday.pasaran}`,
          detail: `Pola Kasih: ${wetonPasaranMeaning.relationship}`,
        });
      }
      if (canonical.dmCenter) {
        foundations.push({
          system: "Destiny Matrix",
          indicator: `Pusat Jiwa: Arcana ${canonical.dmCenter}`,
          detail: destinyMatrixArcanaDictionary[canonical.dmCenter]?.name || "Jangkar batin",
        });
      }
      if (canonical.hdAuthority) {
        foundations.push({
          system: "Human Design",
          indicator: `Otoritas: ${canonical.hdAuthority}`,
          detail: "Penyelarasan kompas emosional alami",
        });
      }
    } else if (def.key === "orangTerdekat") {
      const wetonNatalSnippet = natalWetonFull
        ? `Weton kelahiranmu (${natalWetonFull.weton}${natalWetonFull.totalNeptu ? `, Neptu ${natalWetonFull.totalNeptu}` : ""})`
        : "kearifan Weton Nusantara";

      const hdProfileSnippet = canonical.hdProfile
        ? `profil Human Design ${canonical.hdProfile}`
        : "pola interaksi sosialmu";

      crossSystemSynthesis = cleanSentence(
        `Dinamika hubungan dengan keluarga dan sahabat hari ini dipandu oleh ${hdProfileSnippet} yang mengajarkan perlunya ruang pribadi untuk menjaga kemurnian energi. Nilai luhur ${wetonNatalSnippet} menuntunmu mengedepankan tepa salira, kerendahan hati, dan kehangatan silaturahmi. Namun, transit kosmik mengingatkan pentingnya batasan sehat: sayangi orang-orang di sekitarmu tanpa harus menyerap seluruh beban emosional yang bukan menjadi tanggung jawabmu.`
      );

      if (natalWetonFull) {
        foundations.push({
          system: "Weton Natal",
          indicator: `${natalWetonFull.weton}${natalWetonFull.totalNeptu ? ` (Neptu ${natalWetonFull.totalNeptu})` : ""}`,
          detail: "Tepa salira & harmoni sosial tradisi Nusantara",
        });
      }
      if (canonical.hdProfile) {
        foundations.push({
          system: "Human Design",
          indicator: `Profil ${canonical.hdProfile}`,
          detail: "Dinamika interaksi sosial & perlindungan energi",
        });
      }
    } else if (def.key === "maknaBatin") {
      const tzolkinSnippet = tzolkinToday
        ? `frekuensi Tzolkin Maya Kin ${tzolkinToday.kin} (${tzolkinToday.kinName}) dalam ${tzolkinToday.wavespellName} (${tzolkinToday.wavespellMeaning}) dengan pelajaran Nada ${tzolkinToday.galacticTone?.name || ""} (${tzolkinToday.galacticTone?.lesson || ""})`
        : "getaran reflektif siklus Maya";

      const centerArcanaSnippet = canonical.dmCenter
        ? `jangkar jiwamu pada ${getArcanaTitle(canonical.dmCenter)} Destiny Matrix`
        : "pusat keheningan batinmu";

      const vedicSnippet = canonical.vedicNakshatra
        ? ` serta arketipe Nakshatra ${canonical.vedicNakshatra} natalmu`
        : "";

      crossSystemSynthesis = cleanSentence(
        `Di lapisan terdalam, ${tzolkinSnippet} memanggil kesadaranmu untuk hening sejenak dari dinamika dunia luar. Kesadaran ini berpadu erat dengan ${centerArcanaSnippet}${vedicSnippet}, mengajakmu menyucikan niat, melepaskan residu kecemasan, dan mempercayai bimbingan Ilahi yang senantiasa menuntun langkah jiwamu.`
      );

      if (tzolkinToday) {
        foundations.push({
          system: "Tzolkin Maya",
          indicator: `Kin ${tzolkinToday.kin} · ${tzolkinToday.kinName}`,
          detail: `Pelajaran Nada: ${tzolkinToday.galacticTone?.lesson || tzolkinToday.wavespellMeaning}`,
        });
      }
      if (canonical.dmCenter) {
        foundations.push({
          system: "Destiny Matrix",
          indicator: `Pusat Jiwa: Arcana ${canonical.dmCenter}`,
          detail: `Jangkar batiniah: ${destinyMatrixArcanaDictionary[canonical.dmCenter]?.name || "Keheningan"}`,
        });
      }
      if (canonical.vedicNakshatra) {
        foundations.push({
          system: "Vedic",
          indicator: `Nakshatra: ${canonical.vedicNakshatra}`,
          detail: "Arketipe batin jiwa Vedic",
        });
      }
    } else if (def.key === "yangMungkinTerasaBerat") {
      const ktInterp = interpretKarmicTail(canonical.dmKarmicTail);
      const wetonChallengeSnippet = wetonToday
        ? `tantangan hari ${wetonToday.day} ${wetonToday.pasaran} (${wetonDayMeaning.challenge})`
        : "titik gesekan hari";

      const notSelfSnippet = canonical.hdNotSelf
        ? `sinyal Not-Self [${canonical.hdNotSelf}]`
        : "kelelahan energi";

      crossSystemSynthesis = cleanSentence(
        `Rasa berat atau gesekan yang mungkin terasa bukanlah halangan tanpa makna, melainkan cermin dari ${ktInterp.summary} Waspadai kemunculan ${notSelfSnippet} saat ekspektasimu berbenturan dengan realitas, serta perhatikan ${wetonChallengeSnippet}. Terimalah keterbatasan tenaga tanpa menghakimi dirimu sendiri; jadikan ini sebagai ruang suci untuk beristirahat dan melepaskan kendali.`
      );

      if (canonical.dmKarmicTail && canonical.dmKarmicTail.length === 3) {
        foundations.push({
          system: "Destiny Matrix",
          indicator: `Ekor Karma: ${canonical.dmKarmicTail.join("–")}`,
          detail: `Shadow work & pelepasan: ${ktInterp.detail}`,
        });
      }
      if (canonical.hdNotSelf) {
        foundations.push({
          system: "Human Design",
          indicator: `Tema Not-Self: ${canonical.hdNotSelf}`,
          detail: "Alarm disonansi energi saat memaksakan kehendak",
        });
      }
      if (wetonToday) {
        foundations.push({
          system: "Weton Harian",
          indicator: `Tantangan Hari: ${wetonToday.day} ${wetonToday.pasaran}`,
          detail: wetonDayMeaning.challenge,
        });
      }
    } else {
      // ruangYangSedangTerbuka
      const annualSnippet = canonical.dmAnnualArcana
        ? `Arcana Tahunan ${getArcanaTitle(canonical.dmAnnualArcana.arcana)} (Usia ${canonical.dmAnnualArcana.age} tahun)`
        : "siklus pertumbuhan usia";

      const tzolkinGrowthSnippet = tzolkinToday
        ? `arah Gelombang Tzolkin ${tzolkinToday.wavespellName} (${tzolkinToday.wavespellGrowthDirection || tzolkinToday.wavespellMeaning})`
        : "momentum pertumbuhan kosmik";

      const wetonStrengthSnippet = wetonToday
        ? `kekuatan hari ${wetonToday.day} ${wetonToday.pasaran} (${wetonDayMeaning.strength})`
        : "daya tahan membumi";

      crossSystemSynthesis = cleanSentence(
        `Pintu pertumbuhan yang terbuka hari ini diselaraskan oleh tema ${annualSnippet}. Didukung oleh ${tzolkinGrowthSnippet} serta ${wetonStrengthSnippet}, semesta memberimu kelapangan untuk memulai inisiatif baru yang bermakna. Kemajuan sejati tidak diukur dari riuhnya pengakuan luar, melainkan dari langkah konsisten yang kamu ambil dengan ketulusan dan keberanian batin.`
      );

      if (canonical.dmAnnualArcana) {
        foundations.push({
          system: "Destiny Matrix",
          indicator: `Arcana Tahunan: Arcana ${canonical.dmAnnualArcana.arcana}`,
          detail: `Usia ${canonical.dmAnnualArcana.age} tahun · Arah evolusi kesadaran`,
        });
      }
      if (tzolkinToday) {
        foundations.push({
          system: "Tzolkin Maya",
          indicator: `Gelombang: ${tzolkinToday.wavespellName}`,
          detail: `Arah Pertumbuhan: ${tzolkinToday.wavespellGrowthDirection || tzolkinToday.wavespellMeaning}`,
        });
      }
      if (wetonToday) {
        foundations.push({
          system: "Weton Harian",
          indicator: `Kekuatan Hari: ${wetonToday.day} ${wetonToday.pasaran}`,
          detail: wetonDayMeaning.strength,
        });
      }
    }

    // E. Executive Summary (1-2 sentences capturing domain essence, distinct from advice)
    let summary = "";
    if (matchedAspect) {
      const pName = PLANET_LABELS_ID[matchedAspect.transitBody] || matchedAspect.transitBody;
      const nName = matchedAspect.natalPlacement.label;
      const natureStr =
        matchedAspect.nature === "exact"
          ? "mencapai titik puncak kontak hari ini"
          : matchedAspect.nature === "applying"
          ? "sedang menguatkan fokus batinmu"
          : "mulai melandai menuju perenungan tenang";
      summary = `Hari ini, getaran ${matchedAspect.aspectLabel} antara ${pName} dan ${nName} natal ${natureStr} di ${formatHousePair(matchedAspect.transitHouse, matchedAspect.natalPlacement.house)}.`;
    } else {
      summary = `Ritme harian di bidang ${def.focus} bergerak tenang dan stabil, memberimu keleluasaan menata prioritas tanpa tekanan mendesak.`;
    }

    // F. Actionable Advice (Exactly 1 distinct practical advice)
    let adviceText = "";
    if (def.key === "kabarHariIni") {
      adviceText =
        "Awali harimu dengan 10 menit bernapas perlahan tanpa membuka gawai, agar energimu membumi sebelum berhadapan dengan tuntutan luar.";
    } else if (def.key === "pikiran") {
      adviceText =
        "Tuliskan 3 hal paling penting di secarik kertas pagi ini, dan selesaikan satu demi satu tanpa membuka banyak tab pikiran sekaligus.";
    } else if (def.key === "ekonomi") {
      adviceText =
        "Periksa kembali rencana pengeluaran hari ini dan tunda keputusan finansial yang terasa didorong oleh rasa cemas sesaat.";
    } else if (def.key === "asmara") {
      if (relStatus === "single") {
        adviceText =
          "Luangkan waktu sore ini untuk melakukan hal yang membuat hatimu nyaman secara mandiri, tanpa terbebani ekspektasi status.";
      } else {
        adviceText =
          "Kirimkan satu pesan hangat atau luangkan waktu 15 menit mendengarkan ceritanya malam ini tanpa menyela.";
      }
    } else if (def.key === "orangTerdekat") {
      adviceText =
        "Katakan tidak dengan sopan pada ajakan yang terasa menguras energimu, dan simpan tenagamu untuk orang-orang yang tulus.";
    } else if (def.key === "maknaBatin") {
      adviceText =
        "Sediakan waktu jeda hening selama 10 menit sebelum tidur untuk menyucikan beban pikiran dari seharian penuh aktivitas.";
    } else if (def.key === "yangMungkinTerasaBerat") {
      adviceText =
        "Ketika rasa tegang muncul, tarik napas dalam-dalam dan akui perasaanmu tanpa menghakimi diri sendiri.";
    } else {
      adviceText =
        "Ambil satu langkah konkret paling sederhana yang sudah lama kamu rencanakan; kemajuan kecil hari ini adalah kemenangan nyata.";
    }

    // G. Daily Phases (Pagi, Siang, Malam)
    const phases = buildDynamicDailyPhases(matchedAspect, def, safeZone);

    sections.push({
      key: def.key,
      title: def.title,
      focus: def.focus,
      domain: def.domain,
      summary,
      intensity,
      evidence,
      astrologicalMeaning: cleanSentence(astroMeaning),
      spiritualMeaning: cleanSentence(spiritualMeaning),
      blueprintContribution: crossSystemSynthesis,
      crossSystemSynthesis,
      readingFoundations: foundations,
      advice: [cleanSentence(adviceText)],
      phases,
      paragraphs: [
        cleanSentence(summary),
        cleanSentence(astroMeaning),
        cleanSentence(spiritualMeaning),
        crossSystemSynthesis,
      ].filter(Boolean),
      sourceDomains: availableSources,
    });
  }

  // 7. Select Top 3 Highlighted Domains
  const sortedDomainScores = [...domainAspectScores].sort((a, b) => b.score - a.score);
  const top3HighlightedDomains = sortedDomainScores.slice(0, 3).map((item) => {
    const sec = sections.find((s) => s.key === item.key)!;
    return {
      key: sec.key,
      title: sec.title,
      headline: sec.summary,
      intensity: sec.intensity,
    };
  });

  // 8. Most Active Personal Transit
  const topAspect = dailyAspects[0] || null;
  const mostActivePersonalTransit = topAspect
    ? {
        summary: `Transit ${PLANET_LABELS_ID[topAspect.transitBody] || topAspect.transitBody} (${topAspect.transitSign} ${topAspect.transitDegree}°, H${topAspect.transitHouse}) ${topAspect.aspectLabel} ${topAspect.natalPlacement.label} natal (${topAspect.natalPlacement.sign} ${topAspect.natalPlacement.degree}°, H${topAspect.natalPlacement.house}) — orb ${topAspect.orb}° (${topAspect.nature}${topAspect.exactTimeFormatted ? `, ${topAspect.exactTimeFormatted}` : ""})`,
        transitBody: topAspect.transitBody,
        transitSign: topAspect.transitSign,
        transitHouse: topAspect.transitHouse,
        natalBody: topAspect.natalPlacement.name,
        natalSign: topAspect.natalPlacement.sign,
        natalHouse: topAspect.natalPlacement.house,
        aspectLabel: topAspect.aspectLabel,
        orb: topAspect.orb,
        phaseLabel: topAspect.nature,
        exactTimeFormatted: topAspect.exactTimeFormatted,
      }
    : null;

  // 9. Collective Cosmic Summary
  const sunBody = synthesis.sky.bodies.find((b) => (b as any).body === "Sun");
  const moonBody = synthesis.sky.bodies.find((b) => (b as any).body === "Moon");
  const retroPlanets = (synthesis.planetaryMotions?.motions || [])
    .filter((m) => m.isRetrograde)
    .map((m) => PLANET_LABELS_ID[m.body] || m.body);

  const retroSummary =
    retroPlanets.length > 0
      ? `Planet bergerak mundur (retrograde): ${retroPlanets.join(", ")}`
      : "Sebagian besar planet bergerak direct";

  const lunarSummary = moonBody
    ? `Bulan di ${moonBody.sign} (${synthesis.moonPhase.label || "Fase Bulan"})`
    : `Fase ${synthesis.moonPhase.label || "Bulan"}`;

  const collectiveTheme = cleanSentence(
    `Di bawah naungan Matahari di ${sunBody?.sign || "langit"} dan lintasan ${lunarSummary}, hari ini mengalirkan kejernihan batin untuk bertindak selaras dengan ritme alamiah tanpa ketergesaan.`
  );

  const mainSpiritualMessage = cleanSentence(
    `Setiap detik hari ini adalah ruang suci untuk belajar mendengarkan kearifan jiwamu sendiri di tengah dinamika dunia luar.`
  );

  const activePlacidusHouses = Array.from(
    new Set(dailyAspects.flatMap((a) => [a.transitHouse, a.natalPlacement.house]))
  ).sort((a, b) => a - b);

  const cosmicSummary: DailyCosmicSummary = {
    dateKey: timeWindow.dayKey,
    dateFormatted: timeWindow.dateFormatted,
    wetonToday,
    baziToday,
    tzolkinToday,
    collectiveTheme,
    lunarPhaseSummary: lunarSummary,
    planetaryMotionSummary: retroSummary,
    keyEvents: synthesis.dailyEvents.map((e) => e.title).filter(Boolean),
    mostActivePersonalTransit,
    activePlacidusHouses,
    top3HighlightedDomains,
    mainSpiritualMessage,
  };

  // 10. Daily Direction
  const dailyDirection = {
    title: "Arah Hari Ini",
    paragraphs: [
      cleanSentence(
        `Hari ini, prioritas tertinggimu adalah menjaga ketenangan pikiran dan kejujuran rasa di tengah setiap pertemuan dan pekerjaan.`
      ),
      cleanSentence(
        `Jadikan kearifan ${canonical.hdType || "desain jiwamu"} dan keselarasan nilai-nilai batinmu sebagai jangkar penuntun saat menghadapi keputusan harian.`
      ),
      cleanSentence(
        `Luangkan waktu jeda yang cukup di sela-sela aktivitas, dan tutup hari ini dengan rasa syukur atas apa yang telah berhasil kamu rawat dengan baik.`
      ),
    ],
  };

  return {
    uid: input.uid,
    timezone: safeZone,
    dateKey: timeWindow.dayKey,
    dateFormatted: timeWindow.dateFormatted,
    state,
    relationshipStatus: relStatus,
    availableSources,
    limitedSources,
    unavailableSources,
    cosmicSummary,
    sections,
    dailyDirection,
    generatedAt: new Date().toISOString(),
  };
}
