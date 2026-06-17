type UnknownRecord = Record<string, unknown>;

export type DestinyChakraKey =
  | "sahasrara"
  | "ajna"
  | "vishudha"
  | "anahata"
  | "manipura"
  | "svadhisthana"
  | "muladhara";

export type DestinyHealthChartValue = {
  physics?: number;
  energy?: number;
  emotion?: number;
};

export type DestinyHealthChart = Partial<Record<DestinyChakraKey, DestinyHealthChartValue>>;

export type DestinyIntelligence = {
  soulSearching?: number;
  socialization?: number;
  spiritualKnowledge?: number;
  healthChart?: DestinyHealthChart;
};

export type DestinyChakraInterpretation = {
  chakra: DestinyChakraKey;
  values: DestinyHealthChartValue;
  themes: string[];
  summary: string;
};

export type DestinyMatrixIntelligenceResult = {
  intelligence: DestinyIntelligence;
  dominantChakra?: DestinyChakraKey;
  interpretations: DestinyChakraInterpretation[];
  soulSignature: string[];
};

export type DestinyProfileSections = {
  soulMission: string;
  greatestPotential: string;
  repeatingPatterns: string;
  innerChild: string;
  ancestorKarma: string;
  moneyAndWork: string;
  loveAndRelationships: string;
  healthChartSummary?: string;
};

const CHAKRA_KEYS: DestinyChakraKey[] = [
  "sahasrara",
  "ajna",
  "vishudha",
  "anahata",
  "manipura",
  "svadhisthana",
  "muladhara",
];

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : {};
}

function readValue(source: unknown, paths: string[][]): unknown {
  for (const path of paths) {
    let cursor = source;
    for (const key of path) {
      if (!cursor || typeof cursor !== "object" || !(key in cursor)) {
        cursor = undefined;
        break;
      }
      cursor = (cursor as UnknownRecord)[key];
    }
    if (cursor !== undefined && cursor !== null && cursor !== "") return cursor;
  }
  return undefined;
}

function readNumber(source: unknown, paths: string[][]): number | undefined {
  const value = readValue(source, paths);
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return undefined;
}

function compact(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(compact).filter(Boolean).slice(0, 5).join(", ");
  if (typeof value === "object") {
    const record = value as UnknownRecord;
    return compact(record.name || record.label || record.title || record.value || record.description)
      || Object.entries(record)
        .filter(([, entryValue]) => compact(entryValue))
        .slice(0, 3)
        .map(([key, entryValue]) => `${key}: ${compact(entryValue)}`)
        .join(", ");
  }
  return "";
}

function trimSentence(value: string | undefined): string {
  return (value ?? "").replace(/[.。]+$/g, "");
}

function normalizeHealthValue(value: unknown): DestinyHealthChartValue | undefined {
  if (Array.isArray(value)) {
    const [physics, energy, emotion] = value;
    const next = {
      physics: typeof physics === "number" ? physics : undefined,
      energy: typeof energy === "number" ? energy : undefined,
      emotion: typeof emotion === "number" ? emotion : undefined,
    };
    return Object.values(next).some((item) => item !== undefined) ? next : undefined;
  }

  const record = asRecord(value);
  const next = {
    physics: readNumber(record, [["physics"], ["physical"], ["earthLine"]]),
    energy: readNumber(record, [["energy"], ["skyLine"]]),
    emotion: readNumber(record, [["emotion"], ["emotions"], ["emotional"]]),
  };

  return Object.values(next).some((item) => item !== undefined) ? next : undefined;
}

function normalizeChartHeart(value: unknown): DestinyHealthChart | undefined {
  const chartHeart = asRecord(value);
  const mapping: Array<[DestinyChakraKey, string]> = [
    ["sahasrara", "sah"],
    ["ajna", "aj"],
    ["vishudha", "vish"],
    ["anahata", "anah"],
    ["manipura", "man"],
    ["svadhisthana", "svad"],
    ["muladhara", "mul"],
  ];

  const healthChart = mapping.reduce<DestinyHealthChart>((chart, [chakra, prefix]) => {
    const physics = readNumber(chartHeart, [[`${prefix}physics`]]);
    const energy = readNumber(chartHeart, [[`${prefix}energy`]]);
    const emotion = readNumber(chartHeart, [[`${prefix}emotions`], [`${prefix}emotion`]]);
    const values = { physics, energy, emotion };
    if (Object.values(values).some((item) => item !== undefined)) chart[chakra] = values;
    return chart;
  }, {});

  return Object.keys(healthChart).length > 0 ? healthChart : undefined;
}

export function normalizeDestinyMatrixIntelligence(source: unknown): DestinyIntelligence {
  const root = asRecord(source);
  const destinyMatrix = asRecord(root.destinyMatrix || root);
  const intelligence = asRecord(destinyMatrix.destinyIntelligence || root.destinyIntelligence);
  const healthSource = asRecord(
    intelligence.healthChart
      || destinyMatrix.healthChart
      || destinyMatrix.chakraMatrix
      || root.healthChart
      || root.chakraMatrix,
  );

  const nestedHealthChart = CHAKRA_KEYS.reduce<DestinyHealthChart>((chart, chakra) => {
    const value = normalizeHealthValue(healthSource[chakra]);
    if (value) chart[chakra] = value;
    return chart;
  }, {});
  const chartHeartHealthChart = normalizeChartHeart(destinyMatrix.chartHeart || root.chartHeart);
  const healthChart = Object.keys(nestedHealthChart).length > 0 ? nestedHealthChart : chartHeartHealthChart;

  return {
    soulSearching: readNumber(intelligence, [["soulSearching"], ["soul"]])
      ?? readNumber(destinyMatrix, [["soulSearching"], ["purposes", "soulSearching"], ["purposes", "soul"]]),
    socialization: readNumber(intelligence, [["socialization"], ["social"]])
      ?? readNumber(destinyMatrix, [["socialization"], ["purposes", "socialization"], ["purposes", "social"]]),
    spiritualKnowledge: readNumber(intelligence, [["spiritualKnowledge"], ["spiritual"]])
      ?? readNumber(destinyMatrix, [["spiritualKnowledge"], ["purposes", "spiritualKnowledge"], ["purposes", "spiritual"]]),
    healthChart,
  };
}

function total(value: DestinyHealthChartValue): number {
  return (value.physics ?? 0) + (value.energy ?? 0) + (value.emotion ?? 0);
}

function formatTriple(value: DestinyHealthChartValue): string {
  return [value.physics, value.energy, value.emotion]
    .map((item) => item === undefined ? "?" : String(item))
    .join("/");
}

function interpretChakra(chakra: DestinyChakraKey, values: DestinyHealthChartValue): DestinyChakraInterpretation {
  const triple = formatTriple(values);
  if (chakra === "ajna") {
    return {
      chakra,
      values,
      themes: ["mental processing", "pattern recognition", "overthinking"],
      summary: `Ajna ${triple}: mental processing tinggi, pattern recognition kuat, rentan overthinking, dan sulit mematikan pikiran saat tubuh butuh jeda.`,
    };
  }
  if (chakra === "anahata") {
    return {
      chakra,
      values,
      themes: ["empathy", "relational sensitivity", "self-neglect risk"],
      summary: `Anahata ${triple}: empati tinggi, mudah memahami orang lain, tetapi perlu menjaga agar kebutuhan diri tidak ikut terabaikan.`,
    };
  }
  if (chakra === "muladhara") {
    return {
      chakra,
      values,
      themes: ["safety", "stability", "uncertainty sensitivity"],
      summary: `Muladhara ${triple}: tema rasa aman dominan, tubuh sensitif terhadap ketidakpastian, dan grounding perlu menjadi pintu awal.`,
    };
  }
  if (chakra === "manipura") {
    return {
      chakra,
      values,
      themes: ["willpower", "money and work", "personal agency"],
      summary: `Manipura ${triple}: daya eksekusi, uang, karya, dan batas personal perlu dibaca sebagai satu pola energi.`,
    };
  }
  if (chakra === "vishudha") {
    return {
      chakra,
      values,
      themes: ["expression", "voice", "truth"],
      summary: `Vishudha ${triple}: ekspresi dan kejujuran menjadi kanal penting agar pikiran dan rasa tidak tertahan di dalam.`,
    };
  }
  if (chakra === "svadhisthana") {
    return {
      chakra,
      values,
      themes: ["creativity", "pleasure", "emotional flow"],
      summary: `Svadhisthana ${triple}: kreativitas, rasa, dan aliran emosi perlu diberi ruang yang aman untuk bergerak.`,
    };
  }
  return {
    chakra,
    values,
    themes: ["meaning", "trust", "spiritual integration"],
    summary: `Sahasrara ${triple}: pencarian makna dan rasa percaya perlu diturunkan menjadi praktik harian yang tetap membumi.`,
  };
}

export function interpretDestinyMatrixIntelligence(source: unknown): DestinyMatrixIntelligenceResult {
  const intelligence = normalizeDestinyMatrixIntelligence(source);
  const healthChart = intelligence.healthChart ?? {};
  const interpretations = CHAKRA_KEYS
    .map((chakra) => {
      const values = healthChart[chakra];
      return values ? interpretChakra(chakra, values) : null;
    })
    .filter((item): item is DestinyChakraInterpretation => Boolean(item));
  const dominantChakra = interpretations
    .slice()
    .sort((a, b) => total(b.values) - total(a.values))[0]?.chakra;
  const soulSignature = [
    intelligence.soulSearching !== undefined ? `Soul Searching ${intelligence.soulSearching}` : "",
    intelligence.socialization !== undefined ? `Socialization ${intelligence.socialization}` : "",
    intelligence.spiritualKnowledge !== undefined ? `Spiritual Knowledge ${intelligence.spiritualKnowledge}` : "",
    dominantChakra ? `Dominan ${dominantChakra}` : "",
  ].filter(Boolean);

  return {
    intelligence,
    dominantChakra,
    interpretations,
    soulSignature,
  };
}

export function buildDestinyProfileSections(blueprint: unknown): DestinyProfileSections {
  const root = asRecord(blueprint);
  const destinyMatrix = asRecord(root.destinyMatrix);
  const hd = asRecord(root.humanDesign);
  const astrology = asRecord(root.astrology || root.natalChart);
  const result = interpretDestinyMatrixIntelligence(root);
  const dominant = result.interpretations.find((item) => item.chakra === result.dominantChakra);

  const arcanaCenter = compact(destinyMatrix.arcanaCenter || destinyMatrix.center);
  const soul = result.intelligence.soulSearching;
  const social = result.intelligence.socialization;
  const spiritual = result.intelligence.spiritualKnowledge;
  const northNode = compact(astrology.northNode);
  const southNode = compact(astrology.southNode);
  const incarnationCross = compact(asRecord(hd.incarnationCross).name || hd.incarnationCross);
  const channels = compact(hd.channels);
  const gates = compact(hd.gates);
  const mercury = compact(astrology.mercury);
  const jupiter = compact(astrology.jupiter);
  const mc = compact(astrology.mc || astrology.midheaven);
  const karmicTail = compact(destinyMatrix.karmicTail);
  const saturn = compact(astrology.saturn);
  const openCenters = compact(hd.openCenters || asRecord(hd.centers).open);
  const moon = compact(astrology.moon || astrology.moonSign);
  const house4 = compact(asRecord(astrology.housePlacements).moon || asRecord(astrology.houses).house4 || asRecord(astrology.houses)["4"]);
  const motherLine = compact(destinyMatrix.motherLine || destinyMatrix.motherProgram);
  const fatherLine = compact(destinyMatrix.fatherLine || destinyMatrix.fatherProgram);
  const ancestorLine = compact(destinyMatrix.ancestorLine);
  const talents = compact(destinyMatrix.talents || destinyMatrix.talentsGreat || destinyMatrix.talentaAgung);
  const moneyLine = compact(destinyMatrix.moneyLine);
  const loveLine = compact(destinyMatrix.loveLine);
  const mars = compact(astrology.mars);
  const venus = compact(astrology.venus);
  const manipura = trimSentence(result.interpretations.find((item) => item.chakra === "manipura")?.summary);
  const anahata = trimSentence(result.interpretations.find((item) => item.chakra === "anahata")?.summary);
  const muladhara = trimSentence(result.interpretations.find((item) => item.chakra === "muladhara")?.summary);
  const dominantSummary = trimSentence(dominant?.summary);

  return {
    soulMission: `Misi Jiwa terbaca dari Arcana Center ${arcanaCenter || "belum tersedia"}${soul !== undefined ? `, Soul Searching ${soul}` : ""}${spiritual !== undefined ? `, Spiritual Knowledge ${spiritual}` : ""}${northNode ? `, North Node ${northNode}` : ""}${incarnationCross ? `, dan ${incarnationCross}` : ""}. Arah utamanya adalah membawa kualitas batin ini ke tindakan yang nyata, bukan hanya menjadi konsep spiritual.`,
    greatestPotential: `Potensi Terbesar muncul dari ${[talents && `Talents ${talents}`, channels && `HD Channels ${channels}`, gates && `HD Gates ${gates}`, mercury && `Mercury ${mercury}`, jupiter && `Jupiter ${jupiter}`, mc && `MC ${mc}`, social !== undefined && `Socialization ${social}`, spiritual !== undefined && `Spiritual Knowledge ${spiritual}`, dominantSummary].filter(Boolean).join("; ") || "talenta yang masih perlu dilengkapi datanya"}. Ini menunjukkan cara alami user mengubah wawasan menjadi kontribusi.`,
    repeatingPatterns: `Pola Berulang dibaca dari ${[karmicTail && `Karmic Tail ${karmicTail}`, southNode && `South Node ${southNode}`, saturn && `Saturn ${saturn}`, openCenters && `Open Centers ${openCenters}`, arcanaCenter && `Shadow Arcana ${arcanaCenter}`].filter(Boolean).join("; ") || "data bayangan yang belum lengkap"}. Pola ini bukan hukuman, melainkan tempat latihan respons baru.`,
    innerChild: `Inner Child terbaca dari ${[moon && `Moon ${moon}`, house4 && `House 4 ${house4}`, motherLine && `Mother Line ${motherLine}`, fatherLine && `Father Line ${fatherLine}`, anahata, muladhara].filter(Boolean).join("; ") || "data emosi dasar yang belum lengkap"}. Bagian ini perlu merasa aman sebelum diminta menjadi kuat.`,
    ancestorKarma: `Karma Leluhur dibaca dari ${[fatherLine && `Father Line ${fatherLine}`, motherLine && `Mother Line ${motherLine}`, ancestorLine && `Ancestor Line ${ancestorLine}`, karmicTail && `Karmic Tail ${karmicTail}`].filter(Boolean).join("; ") || "garis keluarga yang belum lengkap"}. Fokusnya adalah membedakan warisan yang menguatkan dan pola yang tidak perlu diteruskan.`,
    moneyAndWork: `Uang & Karya dibaca dari ${[moneyLine && `Money Line ${moneyLine}`, mc && `MC ${mc}`, mars && `Mars ${mars}`, jupiter && `Jupiter ${jupiter}`, manipura].filter(Boolean).join("; ") || "data karya yang belum lengkap"}. Ini membantu rekomendasi bergerak dari motivasi umum menuju ritme kerja yang sesuai tubuh.`,
    loveAndRelationships: `Relasi & Cinta dibaca dari ${[loveLine && `Love Line ${loveLine}`, venus && `Venus ${venus}`, moon && `Moon ${moon}`, anahata, compact(hd.profile) && `HD Profile ${compact(hd.profile)}`].filter(Boolean).join("; ") || "data relasi yang belum lengkap"}. Relasi yang sehat dimulai dari cara user menjaga hati tanpa meninggalkan diri sendiri.`,
    healthChartSummary: result.interpretations.map(i => i.summary).join(" "),
  };
}
