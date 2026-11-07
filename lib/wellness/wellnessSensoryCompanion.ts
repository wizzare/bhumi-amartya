/**
 * Bhumi Amartya — Build 121 Wellness Sensory Companion
 * Deterministic, safe, non-medical crystal and aroma daily reflection companions.
 *
 * Invariants:
 * - No medical claims, no procedures, non-literal symbolic framing.
 * - Strict consent and worldview opt-out: respects allowSpiritualContent / allowHolisticCompanions.
 * - Strict respiratory, allergy, pet, and infant safeguards.
 * - Absolute prohibition on essential oil ingestion or undiluted topical application.
 * - Always provides free, accessible natural alternatives without product.
 * - Deterministic daily selection by UID, date, check-in condition, and preferences.
 * - Check-in real conditions take precedence over symbolic Blueprint interpretation.
 */

import type { UserWellnessPreferences } from "@/lib/engines/wellnessRecommendationEngine";

export interface CrystalCompanion {
  id: string;
  name: string;
  symbolicMeaning: string;
  contextRationale: string;
  safePractice: string;
  noProductAlternative: string;
  disclaimer: string;
}

export interface AromaCompanion {
  id: string;
  name: string;
  sensoryExperience: string;
  contextRationale: string;
  safePractice: string;
  safetyNotes: string;
  noProductAlternative: string;
  disclaimer: string;
}

export interface SensoryCompanionResult {
  crystal: CrystalCompanion | null;
  aroma: AromaCompanion | null;
  seed: string;
  optedOut?: boolean;
  optOutReason?: string;
  safetyWarnings?: string[];
}

export interface DeterministicInput {
  uid: string;
  date: string;
  condition?: string;
  capacity?: string;
  careFocus?: string;
  checkIn?: {
    metrics?: {
      sleep?: number;
      energy?: number;
      emotion?: number;
      focus?: number;
      social?: number;
    };
    needs?: string[];
    currentIssue?: string;
    healthCondition?: string;
  };
  blueprint?: {
    hdType?: string;
    hdAuthority?: string;
    hdProfile?: string;
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    lifePath?: number;
    centerArcana?: number;
  };
  journeyContext?: {
    activeFocus?: string;
    stage?: string;
  };
  arsipContext?: {
    anchorTheme?: string;
  };
  preferences?: UserWellnessPreferences & {
    allowHolisticCompanions?: boolean;
    hasBabiesOrPets?: boolean;
    petFriendly?: boolean;
    childSafe?: boolean;
    rejectedCrystalIds?: string[];
    rejectedAromaIds?: string[];
    crystalOptOut?: boolean;
    aromaOptOut?: boolean;
  };
}

const CRYSTAL_CATALOG: CrystalCompanion[] = [
  {
    id: "clear-quartz",
    name: "Kuarsa Bening (Clear Quartz)",
    symbolicMeaning: "Kejernihan pandangan dan kemurnian fokus batin.",
    contextRationale: "Menemani hari saat pikiran membutuhkan ruang bersih untuk memilah prioritas.",
    safePractice: "Pegang batu kuarsa sejuk di telapak tangan sejenak sebagai sauh fisik saat bernapas tenang.",
    noProductAlternative: "Cukup letakkan telapak tangan di atas permukaan kayu alami atau batu kali yang bersih.",
    disclaimer: "Simbolik refleksi batin; bukan prosedur terapi klinis atau pengganti pengobatan medis.",
  },
  {
    id: "amethyst",
    name: "Amethyst (Kecubung Ungu)",
    symbolicMeaning: "Ketenangan pikiran, jeda reflektif, dan meredakan riak ketegangan.",
    contextRationale: "Cocok saat ritme hari terasa padat dan batin memerlukan jeda untuk mengendurkan beban.",
    safePractice: "Letakkan di dekat meja kerja atau area istirahat sebagai pengingat visual untuk memperlambat tempo.",
    noProductAlternative: "Pejamkan mata sejenak dan bayangkan warna teduh ungu senja di cakrawala.",
    disclaimer: "Simbolik refleksi batin; bukan prosedur terapi klinis atau pengganti pengobatan medis.",
  },
  {
    id: "rose-quartz",
    name: "Rose Quartz (Kuarsa Mawar)",
    symbolicMeaning: "Kelembutan sikap pada diri sendiri dan keterbukaan empati.",
    contextRationale: "Mendampingi pemulihan saat energi batin terasa lelah akibat kritik diri yang berlebihan.",
    safePractice: "Genggam lembut di dekat area dada saat melakukan tiga tarikan napas penuh penerimaan.",
    noProductAlternative: "Letakkan kedua telapak tangan di dada hangat sambil menghembuskan napas lembut.",
    disclaimer: "Simbolik refleksi batin; bukan prosedur terapi klinis atau pengganti pengobatan medis.",
  },
  {
    id: "black-tourmaline",
    name: "Black Tourmaline (Turmalin Hitam)",
    symbolicMeaning: "Sauh rasa aman, stabilitas pijakan, dan batas ruang pribadi yang sehat.",
    contextRationale: "Membantu menstabilkan diri ketika suasana sekitar terasa bising atau menguras energi.",
    safePractice: "Genggam saat duduk tegak dengan kedua telapak kaki menapak rata ke lantai.",
    noProductAlternative: "Berjalan tanpa alas kaki di atas rumput atau lantai sejuk untuk merasakan daya topang bumi.",
    disclaimer: "Simbolik refleksi batin; bukan prosedur terapi klinis atau pengganti pengobatan medis.",
  },
  {
    id: "selenite",
    name: "Selenite Bening",
    symbolicMeaning: "Keringanan ruang batin dan pelepasan residu mental yang menumpuk.",
    contextRationale: "Mendukung transisi menuju malam yang lebih tenang dan lapang.",
    safePractice: "Sentuh permukaannya yang halus sebelum menutup agenda harian.",
    noProductAlternative: "Buka telapak tangan ke atas dan hembuskan napas panjang seolah melepas beban hari ini.",
    disclaimer: "Simbolik refleksi batin; bukan prosedur terapi klinis atau pengganti pengobatan medis.",
  },
  {
    id: "citrine",
    name: "Citrine (Kuarsa Kuning)",
    symbolicMeaning: "Daya juang yang cerah, optimisme hangat, dan keberanian melangkah.",
    contextRationale: "Membangkitkan semangat ketika hari membutuhkan inisiatif dan kejernihan bertindak.",
    safePractice: "Letakkan di dekat area kerja di bawah cahaya alami sebagai pengingat untuk melangkah tanpa ragu.",
    noProductAlternative: "Duduklah beberapa menit menghadap sinar matahari pagi dan rasakan kehangatannya.",
    disclaimer: "Simbolik refleksi batin; bukan prosedur terapi klinis atau pengganti pengobatan medis.",
  },
  {
    id: "smoky-quartz",
    name: "Smoky Quartz (Kuarsa Asap)",
    symbolicMeaning: "Ketahanan batin menghadapi tekanan dan pelepasan ketegangan fisik.",
    contextRationale: "Mendukung stabilisasi saat menghadapi situasi kompleks atau tenggat waktu yang menuntut.",
    safePractice: "Genggam kuat beberapa detik lalu lepaskan perlahan bersama hembusan napas panjang.",
    noProductAlternative: "Tekan kedua telapak kaki kuat-kuat ke lantai, lalu lemaskan secara bertahap.",
    disclaimer: "Simbolik refleksi batin; bukan prosedur terapi klinis atau pengganti pengobatan medis.",
  },
];

const AROMA_CATALOG: AromaCompanion[] = [
  {
    id: "lavender",
    name: "Aroma Lavender Alami",
    sensoryExperience: "Kenyamanan aroma floral lembut yang membantu mengendurkan otot dan menenangkan indra.",
    contextRationale: "Menghadirkan suasana teduh saat tubuh dan pikiran bersiap mengakhiri kesibukan.",
    safePractice: "Gunakan 1-2 tetes pada diffuser ruangan berventilasi baik, atau teteskan pada saputangan kain.",
    safetyNotes: "Hanya untuk penggunaan luar. Jangan ditelan. Hindari kontak langsung dengan mata atau kulit tanpa pelarut. Jauhkan dari jangkauan hewan peliharaan.",
    noProductAlternative: "Jika sensitif aroma atau tidak memiliki minyak atsiri, seduh secangkir teh chamomile hangat dan hirup uapnya yang lembut.",
    disclaimer: "Pengalaman sensorik kenyamanan; bukan obat, perawatan medis, atau pengganti intervensi kesehatan.",
  },
  {
    id: "sweet-orange",
    name: "Aroma Jeruk Segar (Sweet Orange / Citrus)",
    sensoryExperience: "Kesegaran wangi sitrus cerah yang membangkitkan suasana hati dan menyegarkan udara.",
    contextRationale: "Memberi sentuhan energi positif di tengah aktivitas siang yang membutuhkan kejernihan.",
    safePractice: "Teteskan 1 tetes pada diffuser, atau letakkan kulit jeruk manis segar di meja kerja.",
    safetyNotes: "Jangan dioleskan langsung ke kulit sebelum terpapar sinar matahari (fototoksik). Jangan ditelan. Jaga sirkulasi udara tetap baik.",
    noProductAlternative: "Cukup kupas buah jeruk atau lemon segar dan nikmati semerbak aroma alami dari kulit buahnya.",
    disclaimer: "Pengalaman sensorik kenyamanan; bukan obat, perawatan medis, atau pengganti intervensi kesehatan.",
  },
  {
    id: "peppermint",
    name: "Aroma Peppermint Lembut",
    sensoryExperience: "Sensasi mint sejuk yang membuka ruang pernapasan dan menyegarkan fokus pikiran.",
    contextRationale: "Membantu menyegarkan kepala yang terasa penat setelah sesi kerja berjam-jam.",
    safePractice: "Hirup perlahan dari botol terbuka berjarak 10 cm, atau gunakan diffuser mini berventilasi.",
    safetyNotes: "Gunakan secukupnya. Hindari penggunaan dekat anak di bawah umur atau hewan peliharaan. Jangan mengenai mata. Tidak untuk ditelan.",
    noProductAlternative: "Remas beberapa helai daun mint atau daun kemangi segar di telapak tangan lalu hirup aromanya.",
    disclaimer: "Pengalaman sensorik kenyamanan; bukan obat, perawatan medis, atau pengganti intervensi kesehatan.",
  },
  {
    id: "sandalwood",
    name: "Aroma Kayu Cendana (Sandalwood)",
    sensoryExperience: "Kehangatan aroma kayu tenang yang memperdalam napas dan memperlambat ritme batin.",
    contextRationale: "Mendukung momen kontemplasi hening atau refleksi malam yang membutuhkan kedalaman rasa.",
    safePractice: "Gunakan minyak atsiri cendana encer pada diffuser keramik dengan ventilasi udara yang mengalir.",
    safetyNotes: "Hanya untuk penggunaan luar. Jangan ditelan. Gunakan di ruangan dengan sirkulasi udara baik. Hindari paparan asap pekat jika memiliki asma atau alergi saluran pernapasan.",
    noProductAlternative: "Duduklah dengan tenang di dekat ventilasi udara alami dan nikmati aliran oksigen segar.",
    disclaimer: "Pengalaman sensorik kenyamanan; bukan obat, perawatan medis, atau pengganti intervensi kesehatan.",
  },
  {
    id: "chamomile",
    name: "Aroma Chamomile Alami",
    sensoryExperience: "Kelembutan herbal manis yang sangat ramah indra, menenangkan saraf tanpa aroma tajam.",
    contextRationale: "Pilihan paling aman dan menenangkan ketika tubuh memerlukan relaksasi hipoalergenik.",
    safePractice: "Gunakan uap teh chamomile hangat atau 1 tetes minyak chamomile murni pada wadah air hangat berjarak aman.",
    safetyNotes: "Hanya untuk penggunaan luar jika memakai minyak atsiri. Jangan ditelan. Aman untuk ruangan keluarga.",
    noProductAlternative: "Seduh kantung teh chamomile di cangkir dan hirup kehangatan uapnya beberapa tarikan napas.",
    disclaimer: "Pengalaman sensorik kenyamanan; bukan obat, perawatan medis, atau pengganti intervensi kesehatan.",
  },
  {
    id: "natural-air",
    name: "Sirkulasi Udara Segar Alami",
    sensoryExperience: "Aliran oksigen murni tanpa tambahan wewangian, memberikan ruang bernapas yang bersih dan netral.",
    contextRationale: "Didedikasikan untuk menjaga kebersihan saluran pernapasan tanpa paparan partikel minyak atsiri.",
    safePractice: "Buka jendela ruangan lebar-lebar selama 10-15 menit agar udara segar mengalir bebas.",
    safetyNotes: "Bebas alergen, 100% aman untuk penderita asma, bayi, dan hewan peliharaan. Hanya untuk kenyamanan sirkulasi udara luar. Jangan ditelan.",
    noProductAlternative: "Cukup berdiri di dekat pintu atau jendela terbuka sambil melakukan latihan napas 4-7-8.",
    disclaimer: "Praktik sirkulasi udara alami untuk kenyamanan lingkungan hidup; bukan obat, perawatan medis, atau pengganti intervensi kesehatan.",
  },
];

function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getDailySensoryCompanion(input: DeterministicInput): SensoryCompanionResult {
  const checkinMetrics = input.checkIn?.metrics;
  const checkinNeeds = input.checkIn?.needs || [];

  const checkinSig = checkinMetrics
    ? `${checkinMetrics.sleep || 0}-${checkinMetrics.energy || 0}-${checkinMetrics.emotion || 0}-${checkinMetrics.focus || 0}`
    : "no-checkin";

  const prefSig = `${input.preferences?.respiratorySensitivity ? "resp" : "no-resp"}-${input.preferences?.allowSpiritualContent === false ? "nospirit" : "spirit"}`;

  const seed = `${input.uid}:${input.date}:${input.condition || "balance"}:${input.capacity || "med"}:${checkinSig}:${prefSig}`;
  const h = stringHash(seed);

  // 1. Consent and Worldview Opt-Out Guards
  const isSpiritualOptedOut =
    input.preferences?.allowSpiritualContent === false ||
    input.preferences?.allowHolisticCompanions === false ||
    input.preferences?.crystalOptOut === true;

  const isAromaOptedOut = input.preferences?.aromaOptOut === true;

  // 2. Safety Flags
  const isRespiratorySensitive =
    input.preferences?.respiratorySensitivity === true ||
    input.preferences?.indoorVentilation === "poor";

  const hasBabiesOrPets =
    input.preferences?.hasBabiesOrPets === true ||
    input.preferences?.petFriendly === true ||
    input.preferences?.childSafe === true;

  const safetyWarnings: string[] = [];
  if (isRespiratorySensitive) {
    safetyWarnings.push("Sensitivitas pernapasan terdeteksi: diffuser minyak atsiri pekat dihindari.");
  }
  if (hasBabiesOrPets) {
    safetyWarnings.push("Ada anak/hewan peliharaan: aroma tajam seperti peppermint dihindari.");
  }

  // 3. Determine User Priority State from Actual Check-in
  let priorityFocus: "restoration" | "grounding" | "clarity" | "momentum" | "neutral" = "neutral";

  if (checkinMetrics) {
    if ((checkinMetrics.sleep !== undefined && checkinMetrics.sleep <= 4) || (checkinMetrics.emotion !== undefined && checkinMetrics.emotion <= 4)) {
      priorityFocus = "restoration";
    } else if ((checkinMetrics.energy !== undefined && checkinMetrics.energy <= 4) || checkinNeeds.includes("boundary" as any)) {
      priorityFocus = "grounding";
    } else if ((checkinMetrics.focus !== undefined && checkinMetrics.focus <= 4) || checkinNeeds.includes("focus" as any)) {
      priorityFocus = "clarity";
    } else if (checkinMetrics.energy !== undefined && checkinMetrics.energy >= 8 && checkinMetrics.focus !== undefined && checkinMetrics.focus >= 7) {
      priorityFocus = "momentum";
    }
  } else if (input.capacity === "low" || (input.condition && /lelah|stres|cemas|letih/i.test(input.condition))) {
    priorityFocus = "restoration";
  }

  // 4. Select Crystal Deterministically
  let crystal: CrystalCompanion | null = null;
  if (!isSpiritualOptedOut) {
    const rejectedCrystals = new Set(input.preferences?.rejectedCrystalIds || []);
    let eligibleCrystals = CRYSTAL_CATALOG.filter((c) => !rejectedCrystals.has(c.id));
    if (eligibleCrystals.length === 0) eligibleCrystals = CRYSTAL_CATALOG;

    // Weight candidate according to priorityFocus
    let preferredIds: string[] = [];
    if (priorityFocus === "restoration") {
      preferredIds = ["amethyst", "rose-quartz", "selenite"];
    } else if (priorityFocus === "grounding") {
      preferredIds = ["black-tourmaline", "smoky-quartz"];
    } else if (priorityFocus === "clarity") {
      preferredIds = ["clear-quartz"];
    } else if (priorityFocus === "momentum") {
      preferredIds = ["citrine", "clear-quartz"];
    }

    const matchedCrystals = eligibleCrystals.filter((c) => preferredIds.includes(c.id));
    const pool = matchedCrystals.length > 0 ? matchedCrystals : eligibleCrystals;
    const crystalIndex = h % pool.length;
    const baseCrystal = pool[crystalIndex];

    // Tailor rationale: check-in condition first, blueprint context supporting
    let contextRationale = baseCrystal.contextRationale;
    if (input.checkIn?.currentIssue) {
      contextRationale = `Diselaraskan dengan situasi saat ini (${input.checkIn.currentIssue}). ${baseCrystal.contextRationale}`;
    } else if (input.careFocus) {
      contextRationale = `Diselaraskan dengan fokus perawatan hari ini: "${input.careFocus}". ${baseCrystal.contextRationale}`;
    } else if (input.condition) {
      contextRationale = `Menemani kondisi "${input.condition}". ${baseCrystal.contextRationale}`;
    }

    // Add Human Design supporting context if available
    if (input.blueprint?.hdType) {
      const hd = input.blueprint.hdType;
      if (/manifesting generator/i.test(hd)) {
        contextRationale += ` Mengingatkan ritme dinamis Manifesting Generator untuk tetap mengakar dan bernapas sebelum berganti aktivitas.`;
      } else if (/projector/i.test(hd)) {
        contextRationale += ` Membantu Projector merawat ruang batin dan menjaga kapasitas energi tanpa memaksakan diri.`;
      } else if (/reflector/i.test(hd)) {
        contextRationale += ` Mendukung kepekaan alami Reflector dalam merasakan kejernihan lingkungan sekeliling.`;
      } else if (/generator/i.test(hd)) {
        contextRationale += ` Mendampingi respons alami Otoritas Sakralmu dalam menikmati apa yang sedang kamu rawat.`;
      }
    }

    crystal = {
      ...baseCrystal,
      contextRationale,
    };
  }

  // 5. Select Aroma Deterministically with Safety Controls
  let aroma: AromaCompanion | null = null;
  if (!isAromaOptedOut) {
    const rejectedAromas = new Set(input.preferences?.rejectedAromaIds || []);

    if (isRespiratorySensitive) {
      // Respiratory safety: strictly safe zero-aerosol or natural-air
      const safeOptions = AROMA_CATALOG.filter((a) => a.id === "natural-air" || a.id === "sweet-orange" || a.id === "chamomile");
      const chosen = safeOptions[h % safeOptions.length];
      aroma = {
        ...chosen,
        safePractice: "Sensitivitas pernapasan aktif: hindari diffuser uap pekat atau asap dupa. Cukup nikmati ventilasi udara bersih alami atau aroma buah segar.",
        noProductAlternative: "Buka jendela beberapa saat untuk sirkulasi udara alami tanpa pewangi buatan.",
      };
    } else {
      let eligibleAromas = AROMA_CATALOG.filter((a) => !rejectedAromas.has(a.id));
      if (hasBabiesOrPets) {
        // Exclude peppermint around babies or pets
        eligibleAromas = eligibleAromas.filter((a) => a.id !== "peppermint");
      }
      if (eligibleAromas.length === 0) eligibleAromas = AROMA_CATALOG;

      // Weight aroma according to priorityFocus
      let preferredAromaIds: string[] = [];
      if (priorityFocus === "restoration") {
        preferredAromaIds = ["lavender", "chamomile", "sandalwood"];
      } else if (priorityFocus === "clarity") {
        preferredAromaIds = ["sweet-orange", "peppermint"];
      } else if (priorityFocus === "grounding") {
        preferredAromaIds = ["sandalwood", "lavender"];
      } else if (priorityFocus === "momentum") {
        preferredAromaIds = ["sweet-orange"];
      }

      const matchedAromas = eligibleAromas.filter((a) => preferredAromaIds.includes(a.id));
      const pool = matchedAromas.length > 0 ? matchedAromas : eligibleAromas;
      const aromaIndex = (h >> 3) % pool.length;
      const baseAroma = pool[aromaIndex];

      let contextRationale = baseAroma.contextRationale;
      if (input.condition) {
        contextRationale = `Menemani kondisi "${input.condition}". ${baseAroma.contextRationale}`;
      } else if (input.careFocus) {
        contextRationale = `Mendukung fokus "${input.careFocus}". ${baseAroma.contextRationale}`;
      }

      aroma = {
        ...baseAroma,
        contextRationale,
      };

      if (hasBabiesOrPets && aroma.id !== "natural-air") {
        aroma.safetyNotes += " Ruangan ditempati anak/hewan: pastikan ventilasi mengalir dan jauhkan sumber aroma dari jangkauan.";
      }
    }
  }

  return {
    crystal,
    aroma,
    seed,
    optedOut: isSpiritualOptedOut,
    optOutReason: isSpiritualOptedOut ? "Pengguna menonaktifkan konten refleksi spiritual/kristal." : undefined,
    safetyWarnings: safetyWarnings.length > 0 ? safetyWarnings : undefined,
  };
}
