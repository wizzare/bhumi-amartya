import { getCanonicalHumanDesignType } from "@/lib/humandesign/hdAudit";

type UnknownRecord = Record<string, unknown>;

export type AstroTodayInput = {
  currentSunSign?: string | null;
  moonPhase?: string | null;
  retrogrades?: string[];
  currentTheme?: string | null;
  sourceType?: "real_astrology" | "symbolic_fallback" | "approximation";
};

export type BlueprintAstroInsightInput = {
  profile?: UnknownRecord | null;
  blueprint?: UnknownRecord | null;
  astroToday?: AstroTodayInput | null;
};

export type BlueprintAstroInsight = {
  personalizedReflection: string;
  activeLifeAreas: string[];
};

const AREA_SCORES: Record<string, string[]> = {
  "lifePath:1": ["Kepemimpinan", "Karir", "Kreativitas"],
  "lifePath:2": ["Hubungan", "Keluarga", "Healing"],
  "lifePath:3": ["Kreativitas", "Komunikasi", "Belajar"],
  "lifePath:4": ["Karir", "Finansial", "Tubuh & Kesehatan"],
  "lifePath:5": ["Belajar", "Kreativitas", "Karir"],
  "lifePath:6": ["Keluarga", "Hubungan", "Healing"],
  "lifePath:7": ["Spiritualitas", "Belajar", "Istirahat"],
  "lifePath:8": ["Finansial", "Kepemimpinan", "Karir"],
  "lifePath:9": ["Healing", "Spiritualitas", "Kreativitas"],
  "lifePath:11": ["Spiritualitas", "Komunikasi", "Healing"],
  "lifePath:22": ["Karir", "Kepemimpinan", "Finansial"],
  "lifePath:33": ["Healing", "Keluarga", "Spiritualitas"],
  "hd:Generator": ["Tubuh & Kesehatan", "Karir", "Kreativitas"],
  "hd:Manifesting Generator": ["Kreativitas", "Karir", "Belajar"],
  "hd:Projector": ["Istirahat", "Hubungan", "Kepemimpinan"],
  "hd:Manifestor": ["Kepemimpinan", "Karir", "Komunikasi"],
  "hd:Reflector": ["Istirahat", "Spiritualitas", "Hubungan"],
  "sun:Taurus": ["Tubuh & Kesehatan", "Finansial", "Istirahat"],
  "sun:Libra": ["Hubungan", "Komunikasi", "Kreativitas"],
  "sun:Gemini": ["Komunikasi", "Belajar", "Kreativitas"],
  "sun:Cancer": ["Keluarga", "Healing", "Hubungan"],
  "sun:Leo": ["Kreativitas", "Kepemimpinan", "Hubungan"],
  "sun:Virgo": ["Tubuh & Kesehatan", "Karir", "Healing"],
  "sun:Scorpio": ["Healing", "Hubungan", "Spiritualitas"],
  "sun:Capricorn": ["Karir", "Finansial", "Kepemimpinan"],
};

function getString(record: UnknownRecord | null | undefined, path: string[]): string | null {
  const value = path.reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as UnknownRecord)[key];
  }, record);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getNumber(record: UnknownRecord | null | undefined, path: string[]): number | null {
  const value = path.reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as UnknownRecord)[key];
  }, record);
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function addScores(scores: Map<string, number>, key: string, weight = 1): void {
  const areas = AREA_SCORES[key] ?? [];
  areas.forEach((area, index) => {
    scores.set(area, (scores.get(area) ?? 0) + weight + (areas.length - index) * 0.1);
  });
}

function pickActiveLifeAreas(input: {
  lifePathNumber: number | null;
  humanDesignType: string | null;
  sunSign: string | null;
  astroToday: AstroTodayInput | null | undefined;
}): string[] {
  const scores = new Map<string, number>();
  addScores(scores, `lifePath:${input.lifePathNumber}`, 1.3);
  addScores(scores, `hd:${input.humanDesignType}`, 1.2);
  addScores(scores, `sun:${input.sunSign}`, 1);
  const areas = ["Healing", "Komunikasi", "Istirahat", "Karir", "Hubungan", "Kreativitas", "Spiritualitas"];
  if (scores.size === 0) return areas.slice(0, 3);
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([area]) => area);
}

function getObservation(seed: number): string {
  const observations = [
    "Beberapa hari terakhir mungkin terasa seperti banyak hal sedang disusun ulang sekaligus.",
    "Ada hal yang tampaknya masih datang dan pergi di pikiranmu belakangan ini.",
    "Hari ini mungkin bukan tentang mencari jawaban baru. Mungkin lebih tentang mendengar ulang sesuatu yang sebenarnya sudah lama kamu tahu.",
    "Kalau akhir-akhir ini kamu merasa sedikit lelah mengambil keputusan, tidak apa-apa. Tidak semua hal harus selesai hari ini.",
    "Mungkin kamu sedang merasakan tarikan untuk kembali ke dalam, menjauh sejenak dari keriuhan di luar.",
  ];
  return observations[seed % observations.length];
}

function getPersonalBridge(input: {
  lifePathNumber: number | null;
  humanDesignType: string | null;
}, seed: number): string {
  // HIDDEN BLUEPRINT LOGIC - Humanized
  const isProjector = input.humanDesignType === "Projector";
  const isGenerator = input.humanDesignType === "Generator" || input.humanDesignType === "Manifesting Generator";
  const isManifestor = input.humanDesignType === "Manifestor";
  const isStructureOriented = input.lifePathNumber === 4 || input.lifePathNumber === 22 || input.lifePathNumber === 8;

  const bridges: string[] = [];

  if (isProjector) {
    bridges.push("Kamu biasanya merasa lebih jernih saat tidak memaksakan diri untuk terus terlihat. Menunggu momen yang tepat seringkali memberimu lebih banyak ketenangan.");
  } else if (isGenerator) {
    bridges.push("Tubuhmu biasanya punya cara sendiri untuk memberi tahu apa yang benar-benar punya 'hidup' di dalamnya. Mungkin hari ini ada hal yang meminta untuk tidak dipaksakan.");
  } else if (isManifestor) {
    bridges.push("Doronganmu untuk memulai hal baru seringkali kuat, tapi hari ini mungkin butuh sedikit lebih banyak ruang bernapas sebelum melompat ke inisiatif berikutnya.");
  }

  if (isStructureOriented) {
    bridges.push("Kamu biasanya merasa lebih tenang ketika ada arah yang jelas. Karena itu, ketidakpastian kecil hari ini mungkin terasa lebih mengganggu dibanding biasanya.");
  } else {
    bridges.push("Memberi izin pada dirimu untuk sedikit lebih fleksibel dengan rencana hari ini bisa menjadi bentuk dukungan yang baik untuk batinmu.");
  }

  return bridges[seed % bridges.length];
}

function getAstroContext(astroToday: AstroTodayInput | null | undefined): string {
  if (!astroToday) return "";

  const moonPhase = astroToday.moonPhase?.toLowerCase() || "";
  const sunSign = astroToday.currentSunSign || "";

  let line = "";
  if (moonPhase.includes("full")) {
    line = "Malam ini Bulan sedang mendekati fase penuh. Biasanya momen seperti ini membuat hal-hal yang sebelumnya samar terasa lebih terlihat.";
  } else if (moonPhase.includes("new")) {
    line = "Saat ini Bulan sedang dalam fase baru. Ini adalah waktu yang hening, seolah memberi ruang untuk menanam niat tanpa harus buru-buru melihat hasilnya.";
  } else if (moonPhase.includes("waxing")) {
    line = "Cahaya Bulan yang sedang bertumbuh membawa sedikit lebih banyak dorongan untuk mulai mewujudkan apa yang selama ini hanya ada di pikiran.";
  } else if (moonPhase.includes("waning")) {
    line = "Bulan yang sedang mengecil mengajak kita untuk pelan-pelan melepaskan apa yang sudah tidak lagi relevan untuk dibawa ke depan.";
  }

  if (astroToday.retrogrades && astroToday.retrogrades.length > 0) {
    line += ` Kehadiran planet yang sedang tampak bergerak mundur seperti ${astroToday.retrogrades[0]} seringkali menjadi pengingat untuk tidak tergesa-gesa menyimpulkan sesuatu.`;
  }

  return line;
}

function getReflection(seed: number): string {
  const reflections = [
    "Tidak semua yang sedang berubah harus langsung dipahami. Kadang tubuh hanya sedang meminta waktu untuk mengejar apa yang sudah diketahui hatimu lebih dulu.",
    "Kejelasan tidak selalu datang dari berpikir lebih keras. Kadang ia muncul justru saat kita berhenti mencoba mencari jawaban.",
    "Prosesmu tidak harus selalu terlihat produktif oleh mata orang lain. Ada pertumbuhan yang terjadi di dalam keheningan yang paling dalam.",
    "Jangan biarkan ketakutan akan masa depan mengaburkan langkah kecil yang sebenarnya bisa kamu ambil hari ini.",
  ];
  return reflections[seed % reflections.length];
}

function getAction(seed: number): string {
  const actions = [
    "Kalau ada waktu beberapa menit hari ini, tulis satu hal yang sebenarnya sudah kamu tahu jawabannya tetapi belum kamu izinkan untuk dijalankan.",
    "Coba duduk diam selama 5 menit tanpa memegang ponsel, hanya untuk merasakan bagaimana napasmu masuk dan keluar.",
    "Katakan 'tidak' pada satu permintaan yang sebenarnya membuatmu merasa terbebani hari ini.",
    "Luangkan waktu sejenak untuk menuliskan tiga hal kecil yang membuatmu merasa didukung kemarin.",
  ];
  return actions[seed % actions.length];
}

export function createBlueprintAstroInsight({
  profile,
  blueprint,
  astroToday,
}: BlueprintAstroInsightInput): BlueprintAstroInsight {
  const firstName = (getString(profile, ["fullName"]) || "Jiwa").split(" ")[0];
  const lifePathNumber = getNumber(blueprint, ["lifePath", "number"]) ?? getNumber(blueprint, ["numerology", "number"]);
  const humanDesignType = getCanonicalHumanDesignType((blueprint as any)?.humanDesign);
  const sunSign = getString(blueprint, ["sunSign", "sign"]) ?? getString(blueprint, ["natalChart", "sunSign"]) ?? getString(blueprint, ["astrology", "sunSign"]);

  const date = new Date();
  const seed = date.getDate() + date.getMonth() + (firstName.length);

  const observation = getObservation(seed);
  const astroContext = getAstroContext(astroToday);
  const bridge = getPersonalBridge({ lifePathNumber, humanDesignType }, seed);
  const reflection = getReflection(seed);
  const action = getAction(seed);

  const activeAreas = pickActiveLifeAreas({ lifePathNumber, humanDesignType, sunSign, astroToday });

  const finalReflection = [
    `Hai ${firstName}.`,
    observation,
    astroContext,
    bridge,
    reflection,
    action
  ].filter(Boolean).join("\n\n");

  return {
    personalizedReflection: finalReflection,
    activeLifeAreas: activeAreas,
  };
}
