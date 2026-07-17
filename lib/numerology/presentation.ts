import {
  birthDayData,
  expressionData,
  lifePathData,
  personalityData,
  personalYearData,
  soulUrgeData,
} from "@/lib/data/numerology";

export type NumerologySection = {
  sectionId: string;
  label: string;
  rawValue?: number;
  displayValue?: string;
  shortExplanation?: string;
  fullExplanation?: string;
  sourceType: "lib/data/numerology" | "calculation" | "fallback";
  sourceVersion: "v4-structured";
  availabilityStatus: "available" | "unavailable";
};

export type NumerologyIdentityContext = {
  lifePath?: number;
  expressionNumber?: number;
  soulUrge?: number;
  personalityNumber?: number;
  birthdayNumber?: number;
  personalYear?: number;
  coreJourney?: string;
  majorLesson?: string;
  strengths: string[];
  challenges: string[];
  lightExpression?: string;
  shadowExpression?: string;
  growthDirection?: string;
  summary: string[];
  sourceVersion: "v4-structured";
};

const firstSentence = (value: string) => value.split(/(?<=[.!?])\s+/)[0] || value;

function section(
  sectionId: string,
  label: string,
  rawValue: number | undefined,
  shortExplanation: string | undefined,
  fullExplanation: string | undefined,
): NumerologySection {
  return {
    sectionId,
    label,
    rawValue,
    displayValue: rawValue === undefined ? undefined : String(rawValue),
    shortExplanation,
    fullExplanation,
    sourceType: shortExplanation ? "lib/data/numerology" : "fallback",
    sourceVersion: "v4-structured",
    availabilityStatus: rawValue === undefined || !shortExplanation ? "unavailable" : "available",
  };
}

export function buildNumerologyPresentation(input: {
  lifePath?: number;
  expression?: number;
  soulUrge?: number;
  personality?: number;
  birthday?: number;
  personalYear?: number;
}): { sections: NumerologySection[]; identity: NumerologyIdentityContext } {
  const life = input.lifePath === undefined ? undefined : lifePathData[input.lifePath];
  const expression = input.expression === undefined ? undefined : expressionData[input.expression];
  const soul = input.soulUrge === undefined ? undefined : soulUrgeData[input.soulUrge];
  const personality = input.personality === undefined ? undefined : personalityData[input.personality];
  const birthday = input.birthday === undefined ? undefined : birthDayData[input.birthday];
  const year = input.personalYear === undefined ? undefined : personalYearData[input.personalYear];

  const sections: NumerologySection[] = [
    section("life-path", "Life Path", input.lifePath, life ? `Jalan utama yang mengajakmu ${life.coreJourney}.` : undefined, life ? `Jalan hidupmu bergerak melalui panggilan untuk ${life.coreJourney}. Pelajaran besarnya adalah ${life.majorLesson}. Dalam keseharian, arah ini tampak ${life.dailyExpression}.` : undefined),
    section("expression", "Expression Number", input.expression, expression ? `Potensimu mengalir ${expression.summary}.` : undefined, expression ? `Cara alami mengekspresikan diri hadir ${expression.summary}. Energi ini membantumu mengubah gagasan menjadi kontribusi yang terasa nyata.` : undefined),
    section("soul-urge", "Soul Urge", input.soulUrge, soul ? `Batinmu mencari ${soul.summary}.` : undefined, soul ? `Dorongan terdalam dalam dirimu mengarah pada ${soul.summary}. Kebutuhan ini memberi warna pada pilihan yang terasa benar-benar bermakna.` : undefined),
    section("personality", "Personality Number", input.personality, personality ? `Orang lain dapat menangkapmu sebagai ${personality.summary}.` : undefined, personality ? `Dalam perjumpaan, kehadiranmu sering terasa sebagai ${personality.summary}. Kesan luar ini menjadi jembatan pertama sebelum orang mengenal kedalamanmu.` : undefined),
    section("birthday", "Birthday Number", input.birthday, birthday ? `Ada bakat alami berupa ${birthday.summary}.` : undefined, birthday ? `Tanggal lahirmu membawa kecenderungan alami berupa ${birthday.summary}. Bakat ini dapat menjadi modal lembut yang menyertai langkahmu sehari-hari.` : undefined),
    section("personal-year", "Personal Year", input.personalYear, year ? `Tahun ini mengundangmu ${year.summary}.` : undefined, year ? `Siklus tahun ini mengundangmu untuk ${year.summary}. Ia bukan kepastian peristiwa, melainkan arah refleksi agar langkahmu tetap sadar dan membumi.` : undefined),
  ];

  const strengths = life?.positiveTraits || [];
  const challenges = life?.negativeTraits || [];
  const lightExpression = life ? `Saat dijalani dengan sadar, kekuatanmu tampak ketika kamu ${life.dailyExpression}.` : undefined;
  const shadowExpression = life ? `Tantangan dapat muncul ketika ${life.majorLesson.replace(/^belajar /, "kamu belum sempat belajar ")}.` : undefined;
  const summary: string[] = [];
  if (life) summary.push(`Jalan hidupmu berangkat dari panggilan untuk ${life.coreJourney}. Arah ini memberi kompas pada hal-hal yang terasa penting dan membuatmu ingin terus bertumbuh. Kamu tidak perlu menjalaninya dengan tergesa-gesa; maknanya tumbuh melalui pilihan kecil yang konsisten.`);
  if (soul || expression || personality || birthday) summary.push(`${soul ? `Di dalam, kamu membawa ${soul.summary}.` : "Di dalam, ada kebutuhan yang ingin didengarkan dengan jujur."} ${expression ? `Cara keluarnya hadir ${expression.summary}.` : "Cara mengekspresikannya dapat berubah mengikuti musim hidup."} ${personality ? `Orang lain mungkin mula-mula melihatmu sebagai ${personality.summary}.` : "Kedalamanmu akan terbaca seiring kepercayaan tumbuh."}${birthday ? ` Bakat bawaanmu terasa melalui ${birthday.summary}.` : ""}`);
  if (life) summary.push(`Kekuatanmu bertumbuh dari ${life.positiveTraits.slice(0, 2).join(" dan ").toLowerCase()}. Di sisi lain, ${life.negativeTraits[0]?.toLowerCase() || "beban lama"} dapat membuat langkah terasa berat bila tidak disadari. Kesadaran dan batas yang sehat membantu energi ini menjadi daya, bukan tekanan.`);
  if (year) summary.push(`Saat ini, perhatianmu diajak untuk ${year.summary}. Jadikan tema ini undangan yang lentur, bukan ramalan yang mengikat. Beri ruang bagi pengalaman nyata untuk menunjukkan arah berikutnya.`);

  return {
    sections,
    identity: {
      lifePath: input.lifePath,
      expressionNumber: input.expression,
      soulUrge: input.soulUrge,
      personalityNumber: input.personality,
      birthdayNumber: input.birthday,
      personalYear: input.personalYear,
      coreJourney: life?.coreJourney,
      majorLesson: life?.majorLesson,
      strengths,
      challenges,
      lightExpression,
      shadowExpression,
      growthDirection: year?.summary,
      summary,
      sourceVersion: "v4-structured",
    },
  };
}

export function getNumerologyCardMeaning(lifePath?: number): string {
  const data = lifePath === undefined ? undefined : lifePathData[lifePath];
  return data ? `Jalan belajar dan pertumbuhanmu melalui ${data.coreJourney}.` : "Peta lembut untuk mengenal arah pertumbuhanmu.";
}

export function getNumerologyCardShortMeaning(lifePath?: number): string {
  const data = lifePath === undefined ? undefined : lifePathData[lifePath];
  return data ? firstSentence(data.coreJourney).replace(/^./, (letter) => letter.toUpperCase()) : "Mengenal arah pertumbuhan jiwa.";
}
