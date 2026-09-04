import {
  birthDayData,
  birthDayDataEn,
  expressionData,
  expressionDataEn,
  lifePathData,
  lifePathDataEn,
  personalityData,
  personalityDataEn,
  personalYearData,
  personalYearDataEn,
  soulUrgeData,
  soulUrgeDataEn,
} from "@/lib/data/numerology";
import { isEnlEdition } from "@/lib/config/edition";

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

export function buildNumerologyPresentation(
  input: {
    lifePath?: number;
    expression?: number;
    soulUrge?: number;
    personality?: number;
    birthday?: number;
    personalYear?: number;
  },
  options?: { isEn?: boolean },
): { sections: NumerologySection[]; identity: NumerologyIdentityContext } {
  const isEn = options?.isEn ?? isEnlEdition();

  const activeLifeData = isEn ? lifePathDataEn : lifePathData;
  const activeExpressionData = isEn ? expressionDataEn : expressionData;
  const activeSoulData = isEn ? soulUrgeDataEn : soulUrgeData;
  const activePersonalityData = isEn ? personalityDataEn : personalityData;
  const activeBirthDayData = isEn ? birthDayDataEn : birthDayData;
  const activeYearData = isEn ? personalYearDataEn : personalYearData;

  const life = input.lifePath === undefined ? undefined : activeLifeData[input.lifePath];
  const expression = input.expression === undefined ? undefined : activeExpressionData[input.expression];
  const soul = input.soulUrge === undefined ? undefined : activeSoulData[input.soulUrge];
  const personality = input.personality === undefined ? undefined : activePersonalityData[input.personality];
  const birthday = input.birthday === undefined ? undefined : activeBirthDayData[input.birthday];
  const year = input.personalYear === undefined ? undefined : activeYearData[input.personalYear];

  const sections: NumerologySection[] = isEn
    ? [
        section(
          "life-path",
          "Life Path",
          input.lifePath,
          life ? `Your primary journey calls you to ${life.coreJourney}.` : undefined,
          life
            ? `Your life path moves through the calling to ${life.coreJourney}. The overarching lesson is ${life.majorLesson}. In daily life, this direction appears ${life.dailyExpression}.`
            : undefined,
        ),
        section(
          "expression",
          "Expression Number",
          input.expression,
          expression ? `Your potential naturally flows ${expression.summary}.` : undefined,
          expression
            ? `Your natural way of expressing yourself emerges ${expression.summary}. This energy helps translate ideas into tangible contributions.`
            : undefined,
        ),
        section(
          "soul-urge",
          "Soul Urge",
          input.soulUrge,
          soul ? `Your inner self seeks ${soul.summary}.` : undefined,
          soul
            ? `Your deepest inner motivation gravitates toward ${soul.summary}. This need gives color to choices that feel deeply meaningful.`
            : undefined,
        ),
        section(
          "personality",
          "Personality Number",
          input.personality,
          personality ? `Others often perceive you as ${personality.summary}.` : undefined,
          personality
            ? `In social encounters, your presence is often felt as ${personality.summary}. This outer impression serves as the initial bridge before people discover your depth.`
            : undefined,
        ),
        section(
          "birthday",
          "Birthday Number",
          input.birthday,
          birthday ? `You carry a natural gift of ${birthday.summary}.` : undefined,
          birthday
            ? `Your birth date carries an innate inclination toward ${birthday.summary}. This talent serves as a supportive resource alongside your daily steps.`
            : undefined,
        ),
        section(
          "personal-year",
          "Personal Year",
          input.personalYear,
          year ? `This year invites you toward ${year.summary}.` : undefined,
          year
            ? `This year's cycle invites you to ${year.summary}. It is not an unyielding prediction, but a reflective compass to keep your steps conscious and grounded.`
            : undefined,
        ),
      ]
    : [
        section("life-path", "Life Path", input.lifePath, life ? `Jalan utama yang mengajakmu ${life.coreJourney}.` : undefined, life ? `Jalan hidupmu bergerak melalui panggilan untuk ${life.coreJourney}. Pelajaran besarnya adalah ${life.majorLesson}. Dalam keseharian, arah ini tampak ${life.dailyExpression}.` : undefined),
        section("expression", "Expression Number", input.expression, expression ? `Potensimu mengalir ${expression.summary}.` : undefined, expression ? `Cara alami mengekspresikan diri hadir ${expression.summary}. Energi ini membantumu mengubah gagasan menjadi kontribusi yang terasa nyata.` : undefined),
        section("soul-urge", "Soul Urge", input.soulUrge, soul ? `Batinmu mencari ${soul.summary}.` : undefined, soul ? `Dorongan terdalam dalam dirimu mengarah pada ${soul.summary}. Kebutuhan ini memberi warna pada pilihan yang terasa benar-benar bermakna.` : undefined),
        section("personality", "Personality Number", input.personality, personality ? `Orang lain dapat menangkapmu sebagai ${personality.summary}.` : undefined, personality ? `Dalam perjumpaan, kehadiranmu sering terasa sebagai ${personality.summary}. Kesan luar ini menjadi jembatan pertama sebelum orang mengenal kedalamanmu.` : undefined),
        section("birthday", "Birthday Number", input.birthday, birthday ? `Ada bakat alami berupa ${birthday.summary}.` : undefined, birthday ? `Tanggal lahirmu membawa kecenderungan alami berupa ${birthday.summary}. Bakat ini dapat menjadi modal lembut yang menyertai langkahmu sehari-hari.` : undefined),
        section("personal-year", "Personal Year", input.personalYear, year ? `Tahun ini mengundangmu ${year.summary}.` : undefined, year ? `Siklus tahun ini mengundangmu untuk ${year.summary}. Ia bukan kepastian peristiwa, melainkan arah refleksi agar langkahmu tetap sadar dan membumi.` : undefined),
      ];

  const strengths = life?.positiveTraits || [];
  const challenges = life?.negativeTraits || [];
  const lightExpression = life
    ? isEn
      ? `When lived with awareness, your strength shines through when you ${life.dailyExpression}.`
      : `Saat dijalani dengan sadar, kekuatanmu tampak ketika kamu ${life.dailyExpression}.`
    : undefined;
  const shadowExpression = life
    ? isEn
      ? `Challenges may arise when ${life.majorLesson.replace(/^learning to /, "you have not yet had the chance to ")}.`
      : `Tantangan dapat muncul ketika ${life.majorLesson.replace(/^belajar /, "kamu belum sempat belajar ")}.`
    : undefined;
  const summary: string[] = [];

  if (isEn) {
    if (life) {
      summary.push(
        `Your life path begins from a calling to ${life.coreJourney}. This direction provides a compass for what feels truly important, inviting you to keep growing. You do not need to walk this path in a rush; its meaning matures through consistent, intentional steps.`,
      );
    }
    if (soul || expression || personality || birthday) {
      summary.push(
        `${soul ? `Within, you carry ${soul.summary}.` : "Within, there is an inner need waiting to be heard honestly."} ${expression ? `Your outward expression emerges ${expression.summary}.` : "How you express it can adapt across the seasons of your life."} ${personality ? `Others may initially see you as ${personality.summary}.` : "Your true depth unfolds as trust deepens."}${birthday ? ` Your innate gift shines through ${birthday.summary}.` : ""}`,
      );
    }
    if (life) {
      summary.push(
        `Your strengths flourish from being ${life.positiveTraits.slice(0, 2).join(" and ").toLowerCase()}. On the other hand, tendencies toward being ${life.negativeTraits[0]?.toLowerCase() || "unconscious habits"} can weigh down your journey if left unexamined. Conscious awareness and healthy boundaries transform this energy into strength rather than pressure.`,
      );
    }
    if (year) {
      summary.push(
        `At this time, your attention is invited toward ${year.summary}. Hold this theme as a flexible invitation rather than a rigid prophecy. Make room for lived experience to illuminate your next step.`,
      );
    }
  } else {
    if (life) summary.push(`Jalan hidupmu berangkat dari panggilan untuk ${life.coreJourney}. Arah ini memberi kompas pada hal-hal yang terasa penting dan membuatmu ingin terus bertumbuh. Kamu tidak perlu menjalaninya dengan tergesa-gesa; maknanya tumbuh melalui pilihan kecil yang konsisten.`);
    if (soul || expression || personality || birthday) summary.push(`${soul ? `Di dalam, kamu membawa ${soul.summary}.` : "Di dalam, ada kebutuhan yang ingin didengarkan dengan jujur."} ${expression ? `Cara keluarnya hadir ${expression.summary}.` : "Cara mengekspresikannya dapat berubah mengikuti musim hidup."} ${personality ? `Orang lain mungkin mula-mula melihatmu sebagai ${personality.summary}.` : "Kedalamanmu akan terbaca seiring kepercayaan tumbuh."}${birthday ? ` Bakat bawaanmu terasa melalui ${birthday.summary}.` : ""}`);
    if (life) summary.push(`Kekuatanmu bertumbuh dari ${life.positiveTraits.slice(0, 2).join(" dan ").toLowerCase()}. Di sisi lain, ${life.negativeTraits[0]?.toLowerCase() || "beban lama"} dapat membuat langkah terasa berat bila tidak disadari. Kesadaran dan batas yang sehat membantu energi ini menjadi daya, bukan tekanan.`);
    if (year) summary.push(`Saat ini, perhatianmu diajak untuk ${year.summary}. Jadikan tema ini undangan yang lentur, bukan ramalan yang mengikat. Beri ruang bagi pengalaman nyata untuk menunjukkan arah berikutnya.`);
  }

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

export function getNumerologyCardMeaning(lifePath?: number, isEn = isEnlEdition()): string {
  const activeData = isEn ? lifePathDataEn : lifePathData;
  const data = lifePath === undefined ? undefined : activeData[lifePath];
  if (isEn) {
    return data ? `Your learning and growth journey moves through ${data.coreJourney}.` : "A gentle map to discover your growth path.";
  }
  return data ? `Jalan belajar dan pertumbuhanmu melalui ${data.coreJourney}.` : "Peta lembut untuk mengenal arah pertumbuhanmu.";
}

export function getNumerologyCardShortMeaning(lifePath?: number, isEn = isEnlEdition()): string {
  const activeData = isEn ? lifePathDataEn : lifePathData;
  const data = lifePath === undefined ? undefined : activeData[lifePath];
  if (isEn) {
    return data ? firstSentence(data.coreJourney).replace(/^./, (letter) => letter.toUpperCase()) : "Discovering soul growth.";
  }
  return data ? firstSentence(data.coreJourney).replace(/^./, (letter) => letter.toUpperCase()) : "Mengenal arah pertumbuhan jiwa.";
}
