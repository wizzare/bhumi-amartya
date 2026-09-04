import {
  DAY_INTERPRETATIONS,
  NEPTU_INTERPRETATIONS,
  PASARAN_INTERPRETATIONS,
} from "./dictionaries";
import type {
  JavaneseDay,
  Pasaran,
  PranataMangsaResult,
  WetonBlueprint,
  WukuResult,
} from "./types";
import { isEnlEdition } from "@/lib/config/edition";

export type WetonPresentationInput = Partial<
  Omit<WetonBlueprint, "wuku" | "pranataMangsa">
> & {
  wuku?: Partial<WukuResult> | null;
  pranataMangsa?: Partial<PranataMangsaResult> | null;
};

export type WetonPresentationSectionId =
  | "identity"
  | "neptu"
  | "wuku"
  | "pranata-mangsa"
  | "character"
  | "social"
  | "strengths-challenges"
  | "relationship"
  | "work"
  | "money"
  | "growth";

export type WetonPresentationValue = {
  label: string;
  value: string;
};

export type WetonPresentationSection = {
  id: WetonPresentationSectionId;
  title: string;
  values: WetonPresentationValue[];
  narrative: string;
};

export type WetonProfileCardPresentation = {
  title: "Weton";
  weton?: string;
  dayAndPasaran?: string;
  totalNeptu?: string;
  insight?: string;
  href: "/blueprint/weton";
};

export type TulangWangiPresentation = {
  isIncluded: true;
  wetonName: string;
  canonicalLabel: "Tulang Wangi";
  alternativeLabel: "Balung Kuning";
  statusText: string;
  shortNarrative: string;
  detailParagraphs: string[];
  culturalContext: string;
  sourceType: "CULTURAL_PRESENTATION_CLASSIFICATION";
  sourceVersion: string;
};

export type WetonPresentation = {
  status: "ready" | "partial" | "unavailable";
  canonicalName: "Weton";
  hero: string;
  sections: WetonPresentationSection[];
  summary: string[];
  summaryText: string;
  profileCard: WetonProfileCardPresentation;
  tulangWangi?: TulangWangiPresentation;
  missing: string[];
};

const DAYS = Object.keys(DAY_INTERPRETATIONS) as JavaneseDay[];
const PASARAN = Object.keys(PASARAN_INTERPRETATIONS) as Pasaran[];
export const TULANG_WANGI_REGISTRY = [
  "Senin Kliwon",
  "Senin Wage",
  "Senin Pahing",
  "Selasa Legi",
  "Rabu Kliwon",
  "Rabu Pahing",
  "Kamis Wage",
  "Sabtu Wage",
  "Sabtu Legi",
  "Minggu Pon",
  "Minggu Kliwon",
] as const;
const TULANG_WANGI_LOOKUP = new Set<string>(TULANG_WANGI_REGISTRY);

function text(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized || undefined;
}

function positiveNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

function lowerFirst(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function withoutPeriod(value: string): string {
  return value.replace(/[.!?]+$/g, "").trim();
}

function sentence(value: string): string {
  const normalized = withoutPeriod(value);
  return normalized ? `${normalized}.` : "";
}

function summaryPhrase(value: string): string {
  return value
    .replace(/\bWuku\s+\S+\s+menambahkan tema\s+/gi, "Tema pendampingnya menekankan ")
    .replace(/Pelajaran Wuku\s+\S+\s+mengarahkan kekuatan itu pada\s+/gi, "Arah simboliknya menekankan ")
    .trim();
}

function listPhrase(values: unknown, limit = 2): string | undefined {
  if (!Array.isArray(values)) return undefined;
  const valid = values.map(text).filter((value): value is string => Boolean(value)).slice(0, limit);
  if (valid.length === 0) return undefined;
  if (valid.length === 1) return valid[0];
  return `${valid[0]} serta ${valid[1]}`;
}

function canonicalValue<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  if (!value) return undefined;
  const normalized = value.replace(/\s+/g, " ").trim().toLocaleLowerCase("id-ID");
  return allowed.find((candidate) => candidate.toLocaleLowerCase("id-ID") === normalized);
}

function resolveIdentity(input: WetonPresentationInput) {
  const storedWeton = text(input.weton);
  const wetonParts = storedWeton?.split(" ") ?? [];
  const dayCandidate = text(input.day) ?? wetonParts.find((part) => canonicalValue(part, DAYS));
  const pasaranCandidate = text(input.pasaran) ?? wetonParts.find((part) => canonicalValue(part, PASARAN));
  const day = canonicalValue(dayCandidate, DAYS);
  const pasaran = canonicalValue(pasaranCandidate, PASARAN);
  const weton = storedWeton ?? (day && pasaran ? `${day} ${pasaran}` : undefined);
  return { day, pasaran, weton };
}

const DAY_INTERPRETATIONS_EN: Record<JavaneseDay, {
  watak: string;
  strength: string;
  challenge: string;
  work: string;
}> = {
  Minggu: {
    watak: "warm, open, and naturally inclined to provide direction",
    strength: "inspiring enthusiasm and seeing the big picture",
    challenge: "maintaining humility when stepping forward to lead",
    work: "thrives when entrusted to take initiative and set visions",
  },
  Senin: {
    watak: "sensitive, calm, and attuned to reading atmosphere",
    strength: "nurturing relationships and understanding unspoken needs",
    challenge: "avoiding harboring emotional burdens for too long",
    work: "excels in roles requiring care, empathy, and continuity",
  },
  Selasa: {
    watak: "decisive, active, and courageous in facing obstacles",
    strength: "moving swiftly and defending what is truly important",
    challenge: "moderating reactions so courage does not become haste",
    work: "suited for dynamic environments that allow tangible action",
  },
  Rabu: {
    watak: "intellectual, versatile, and adept at connecting diverse viewpoints",
    strength: "communicating, learning, and finding middle ground",
    challenge: "committing to choices without lingering excessively on possibilities",
    work: "shines in communication, analysis, education, or coordination",
  },
  Kamis: {
    watak: "authoritative, generous-hearted, and oriented toward growth",
    strength: "building trust and structuring long-term goals",
    challenge: "balancing grand conviction with practical implementation details",
    work: "strong in leadership, development, and roles with broad benefit",
  },
  Jumat: {
    watak: "refined, reflective, and dedicated to harmony",
    strength: "reconciling differences, elevating beauty, and aligning values with action",
    challenge: "stating boundaries clearly when seeking to maintain peace",
    work: "grows in service, creative pursuits, or human relations",
  },
  Sabtu: {
    watak: "steadfast, independent, and resilient through prolonged processes",
    strength: "disciplined, accountable, and loyal to commitments",
    challenge: "softening demeanor when self-imposed standards become overly heavy",
    work: "excels in work demanding structure, endurance, and deep responsibility",
  },
};

const PASARAN_INTERPRETATIONS_EN: Record<Pasaran, {
  watak: string;
  strength: string;
  challenge: string;
  relationship: string;
  money: string;
}> = {
  Legi: {
    watak: "gentleness, warmth, and a calming appeal",
    strength: "creating ease and bridging differences",
    challenge: "not sacrificing personal needs simply to be accepted",
    relationship: "showing love through quiet attention, loyalty, and a peaceful atmosphere",
    money: "sustenance tends to grow through trust, good relations, and consistency",
  },
  Pahing: {
    watak: "vitality, autonomy, and resolute willpower",
    strength: "driving change and holding ground when courage is demanded",
    challenge: "allowing room for others' rhythms and perspectives",
    relationship: "loving intensely and requiring direct honesty",
    money: "opportunities open when boldness is paired with calculation and risk management",
  },
  Pon: {
    watak: "composure, deliberate judgment, and a focus on stability",
    strength: "organizing resources and keeping decisions grounded",
    challenge: "avoiding clinging to old patterns simply because they feel safe",
    relationship: "building closeness through reliability, security, and tangible acts",
    money: "sustenance strengthens through planning, stewardship, and patience",
  },
  Wage: {
    watak: "simplicity, precision, and sensitivity to limits",
    strength: "working with diligence and identifying what needs refinement",
    challenge: "not underestimating personal abilities or falling into worry",
    relationship: "requiring clarity, personal space, and partners who value sincerity",
    money: "stability is built through discipline, efficiency, and measured choices",
  },
  Kliwon: {
    watak: "inner depth, intuition, and powerful presence",
    strength: "reading hidden layers and giving meaning to experience",
    challenge: "grounding intuition so it does not drift into suspicion or doubt",
    relationship: "seeking deep, honest bonds imbued with inner meaning",
    money: "opportunities emerge from specialized skill, sharp intuition, and a carefully maintained reputation",
  },
};

const NEPTU_INTERPRETATIONS_EN: Record<number, {
  watak: string;
  strength: string;
  challenge: string;
  mission: string;
}> = {
  7: { watak: "concise and quick to grasp the core", strength: "focusing on priorities by directing energy toward a single point of achievement", challenge: "practicing patience for results to mature naturally before taking the next step", mission: "channeling sharpness into constructive decisions" },
  8: { watak: "calm yet resolute", strength: "steady resilience in navigating life's pressures and daily obstacles", challenge: "cultivating flexibility to avoid rigidity when sudden change occurs", mission: "building dependable foundations" },
  9: { watak: "sensitive and idealistic", strength: "sincere care for the needs of others and the surrounding environment", challenge: "guarding personal boundaries so caring does not excessively deplete personal energy", mission: "offering care without losing your own center" },
  10: { watak: "autonomous and practical", strength: "bold initiative in taking the first step toward tangible change", challenge: "welcoming help from others without feeling a loss of personal agency", mission: "pioneering paths through measured action" },
  11: { watak: "dynamic and communicative", strength: "swift adaptability to novel situations while maintaining inner balance", challenge: "maintaining consistency amidst myriad choices and shifting directions", mission: "uniting concepts with tangible execution" },
  12: { watak: "balanced and socially oriented", strength: "close collaboration with others to achieve greater collective outcomes", challenge: "assertiveness in decision-making when situations require clear boundaries and direction", mission: "fostering harmony that retains purposeful direction" },
  13: { watak: "strong and resilient", strength: "unwavering courage to uphold core values and confront difficult challenges", challenge: "exercising self-mastery so resolve does not tip into overbearing drive", mission: "using strength to protect and build" },
  14: { watak: "broad-minded and responsible", strength: "wise leadership in guiding others toward common goals", challenge: "avoiding overload from shouldering responsibilities that could be shared", mission: "leading with wisdom and shared accountability" },
  15: { watak: "magnetic and outcome-oriented", strength: "positive influence capable of mobilizing others to act and develop", challenge: "balancing ambition so the drive for results honors process and relationships", mission: "channeling influence into collective benefit" },
  16: { watak: "profound and principled", strength: "steadfast integrity in honoring values and acting from conviction", challenge: "avoiding inflexibility when circumstances demand adaptation", mission: "preserving values while remaining receptive to renewal" },
  17: { watak: "visionary and tested by experience", strength: "untiring perseverance in manifesting large visions despite hurdles", challenge: "releasing control over outcomes and trusting process and timing", mission: "bringing big visions to life through patient steps" },
  18: { watak: "intense and powerfully endowed", strength: "deep personal transformation through courage in the face of change", challenge: "managing pressure so intense energy does not turn into exhaustion or inner turmoil", mission: "directing great power into mature, enduring change" },
};

function buildTulangWangi(
  day: JavaneseDay | undefined,
  pasaran: Pasaran | undefined,
  isEn = false,
): TulangWangiPresentation | undefined {
  if (!day || !pasaran) return undefined;
  const wetonName = `${day} ${pasaran}`;
  if (!TULANG_WANGI_LOOKUP.has(wetonName)) return undefined;

  if (isEn) {
    return {
      isIncluded: true,
      wetonName,
      canonicalLabel: "Tulang Wangi",
      alternativeLabel: "Balung Kuning",
      statusText: `${wetonName} is among the Wetons traditionally recognized in Javanese lore as Tulang Wangi.`,
      shortNarrative: [
        "You may perceive atmospheric changes more quickly, including unspoken tension among others.",
        "This sensitivity can mature into sharp intuition and a grounded presence, though healthy boundaries remain essential so outside burdens are not carried home.",
        "With steady grounding, what you sense is more readily channeled into wisdom rather than restlessness.",
      ].join(" "),
      detailParagraphs: [
        "Tulang Wangi is a term in Javanese cultural tradition for select Day and Pasaran combinations. Individuals born under these signs are traditionally described as possessing strong presence, intuition, or heightened sensitivity to shifting emotional atmospheres.",
        "This interpretation is a cultural symbol offering space to reflect on intuition, personal boundaries, and inner balance. It is not an empirical certainty and does not guarantee paranormal abilities.",
      ],
      culturalContext: "This classification originates in specific Javanese cultural traditions and does not represent universal consensus across every Primbon or community.",
      sourceType: "CULTURAL_PRESENTATION_CLASSIFICATION",
      sourceVersion: "tulang-wangi-registry-v1",
    };
  }

  return {
    isIncluded: true,
    wetonName,
    canonicalLabel: "Tulang Wangi",
    alternativeLabel: "Balung Kuning",
    statusText: `${wetonName} termasuk dalam salah satu Weton yang dalam sebagian tradisi Jawa dikenal sebagai Tulang Wangi.`,
    shortNarrative: [
      "Kamu mungkin lebih cepat menangkap perubahan suasana, termasuk ketegangan yang belum sempat diucapkan orang lain.",
      "Kepekaan ini dapat tumbuh menjadi intuisi dan daya hadir yang kuat, tetapi batas yang sehat tetap penting agar beban sekitar tidak ikut terbawa pulang.",
      "Saat memiliki pijakan yang tenang, apa yang kamu rasakan lebih mudah diolah menjadi kebijaksanaan daripada kegelisahan.",
    ].join(" "),
    detailParagraphs: [
      "Tulang Wangi adalah istilah dalam sebagian kepercayaan masyarakat Jawa untuk beberapa kombinasi Hari dan Pasaran. Orang yang termasuk di dalamnya secara tradisional digambarkan memiliki kehadiran kuat, intuisi, atau kepekaan terhadap perubahan suasana dan emosi di sekitarnya.",
      "Pembacaan ini merupakan simbol budaya yang dapat dipakai sebagai ruang refleksi tentang intuisi, batas diri, dan keseimbangan batin. Ia tidak menjadi kepastian ilmiah dan tidak menjamin kemampuan supranatural tertentu.",
    ],
    culturalContext: "Klasifikasi ini berasal dari sebagian tradisi budaya Jawa dan tidak mewakili kesepakatan universal setiap Primbon atau komunitas.",
    sourceType: "CULTURAL_PRESENTATION_CLASSIFICATION",
    sourceVersion: "tulang-wangi-registry-v1",
  };
}

function identityNarrative(
  day: JavaneseDay | undefined,
  pasaran: Pasaran | undefined,
  fallback: string | undefined,
  isEn = false,
): string | undefined {
  if (day && pasaran) {
    if (isEn) {
      const dayMeaning = DAY_INTERPRETATIONS_EN[day];
      const pasaranMeaning = PASARAN_INTERPRETATIONS_EN[pasaran];
      return [
        sentence(`The pairing of ${day} and ${pasaran} unites a disposition that is ${dayMeaning.watak} with a social rhythm that brings ${pasaranMeaning.watak}`),
        sentence(`When pressure arises, this pattern calls on you to ${dayMeaning.challenge} while ${pasaranMeaning.challenge}`),
        sentence("In everyday life, decisions feel clearest when resolve and sensitivity are given balanced room"),
      ].join(" ");
    }
    const dayMeaning = DAY_INTERPRETATIONS[day];
    const pasaranMeaning = PASARAN_INTERPRETATIONS[pasaran];
    return [
      sentence(`Perpaduan ${day} dan ${pasaran} mempertemukan sisi yang ${dayMeaning.watak} dengan ritme sosial yang ${lowerFirst(pasaranMeaning.watak.replace(/^membawa\s+/i, ""))}`),
      sentence(`Saat tekanan datang, pola ini meminta kamu ${dayMeaning.challenge} sambil ${pasaranMeaning.challenge}`),
      sentence("Dalam keseharian, keputusan terasa paling jernih ketika ketegasan dan kepekaan diberi ruang yang seimbang"),
    ].join(" ");
  }
  if (fallback) {
    if (isEn) {
      return `${sentence(`Saved records describe an inclination that is ${lowerFirst(fallback)}`)} ${sentence("This meaning is read as reflective perspective, not a rigid constraint limiting your choices")}`;
    }
    return `${sentence(`Catatan yang tersimpan menggambarkan kecenderungan yang ${lowerFirst(fallback)}`)} ${sentence("Makna ini dibaca sebagai bahan refleksi, bukan ketetapan yang membatasi pilihanmu")}`;
  }
  return undefined;
}

function buildSummary(input: {
  day?: JavaneseDay;
  pasaran?: Pasaran;
  strengths?: string;
  challenges?: string;
  relationship?: string;
  work?: string;
  money?: string;
  growth?: string;
  wukuDescription?: string;
  pranataDescription?: string;
}, isEn = false): string[] {
  if (!input.day || !input.pasaran || !input.relationship || !input.work || !input.money || !input.growth) {
    return [];
  }

  if (isEn) {
    const dayMeaning = DAY_INTERPRETATIONS_EN[input.day];
    const pasaranMeaning = PASARAN_INTERPRETATIONS_EN[input.pasaran];
    const paragraphs = [
      [
        sentence(`Your fundamental presence feels ${dayMeaning.watak}`),
        sentence(`Within it lies ${pasaranMeaning.watak}`),
        sentence(`When pressure arises, you grow by learning to ${dayMeaning.challenge}`),
      ].join(" "),
      [
        sentence(`In social circles, your strength shines through the ability to ${pasaranMeaning.strength}`),
        sentence(`Closeness is typically built by ${lowerFirst(input.relationship)}`),
        sentence(`Trust becomes healthier when you ${pasaranMeaning.challenge}`),
      ].join(" "),
      [
        sentence(`In work, you tend to ${lowerFirst(summaryPhrase(input.work))}`),
        sentence(input.strengths ? `Your primary strength is evident in ${lowerFirst(input.strengths)}` : `Your primary strength is evident when ${dayMeaning.strength}`),
        sentence(`In resource management, ${lowerFirst(input.money)}`),
      ].join(" "),
    ];

    const finalSentences = [
      sentence(`Your mature direction invites you to ${lowerFirst(summaryPhrase(input.growth))}`),
      input.wukuDescription
        ? sentence(`Your symbolic birth rhythm highlights ${lowerFirst(input.wukuDescription)}`)
        : sentence(`Your growth space strengthens when working with ${lowerFirst(input.challenges ?? dayMeaning.challenge)}`),
      input.pranataDescription
        ? sentence(`Sensitivity to shifting seasons is reflected through the theme of ${lowerFirst(input.pranataDescription)}`)
        : sentence("Maturity emerges when reflection translates into conscious, measured choices"),
    ];
    paragraphs.push(finalSentences.join(" "));
    return paragraphs;
  }

  const dayMeaning = DAY_INTERPRETATIONS[input.day];
  const pasaranMeaning = PASARAN_INTERPRETATIONS[input.pasaran];
  const paragraphs = [
    [
      sentence(`Cara dasarmu hadir terasa ${dayMeaning.watak}`),
      sentence(`Di dalamnya ada ${lowerFirst(pasaranMeaning.watak.replace(/^membawa\s+/i, ""))}`),
      sentence(`Ketika tekanan datang, kamu bertumbuh dengan belajar ${dayMeaning.challenge}`),
    ].join(" "),
    [
      sentence(`Dalam pergaulan, kekuatanmu tampak melalui kemampuan untuk ${pasaranMeaning.strength}`),
      sentence(`Kedekatan biasanya kamu bangun dengan ${lowerFirst(input.relationship)}`),
      sentence(`Kepercayaan menjadi lebih sehat ketika kamu ${pasaranMeaning.challenge}`),
    ].join(" "),
    [
      sentence(`Dalam karya, kamu cenderung ${lowerFirst(summaryPhrase(input.work))}`),
      sentence(input.strengths ? `Daya utamamu terlihat pada ${lowerFirst(input.strengths)}` : `Daya utamamu terlihat ketika ${dayMeaning.strength}`),
      sentence(`Dalam urusan sumber daya, ${lowerFirst(input.money)}`),
    ].join(" "),
  ];

  const finalSentences = [
    sentence(`Arah dewasamu mengajakmu ${lowerFirst(summaryPhrase(input.growth))}`),
    input.wukuDescription
      ? sentence(`Ritme simbolik kelahiranmu menekankan ${lowerFirst(input.wukuDescription)}`)
      : sentence(`Ruang pertumbuhanmu menguat ketika kamu mengolah ${lowerFirst(input.challenges ?? dayMeaning.challenge)}`),
    input.pranataDescription
      ? sentence(`Kepekaan terhadap perubahan waktu tercermin melalui tema ${lowerFirst(input.pranataDescription)}`)
      : sentence("Kematangan muncul saat refleksi itu diterjemahkan menjadi pilihan yang sadar dan terukur"),
  ];
  paragraphs.push(finalSentences.join(" "));
  return paragraphs;
}

export function buildWetonPresentation(
  rawInput: WetonPresentationInput | null | undefined,
  options?: { isEn?: boolean } | unknown,
): WetonPresentation {
  const isEn =
    typeof options === "object" && options !== null && "isEn" in options
      ? Boolean((options as { isEn?: boolean }).isEn)
      : isEnlEdition();
  const input = rawInput ?? {};
  const { day, pasaran, weton } = resolveIdentity(input);
  const neptuDay = positiveNumber(input.neptuDay);
  const neptuPasaran = positiveNumber(input.neptuPasaran);
  const totalNeptu = positiveNumber(input.totalNeptu);
  const watak = text(input.watak);
  const strengths = listPhrase(input.strengths);
  const challenges = listPhrase(input.challenges);
  const relationship = text(input.relationshipStyle);
  const work = text(input.workStyle);
  const money = text(input.moneyStyle);
  const growth = text(input.lifeMission);
  const wukuName = text(input.wuku?.name);
  const wukuDescription = text(input.wuku?.description);
  const wukuIndex = positiveNumber(input.wuku?.index);
  const pranataName = text(input.pranataMangsa?.name);
  const pranataDescription = text(input.pranataMangsa?.description);
  const sections: WetonPresentationSection[] = [];

  const identity = identityNarrative(day, pasaran, watak, isEn);
  if (identity && (day || pasaran || weton)) {
    sections.push({
      id: "identity",
      title: isEn ? "Day, Pasaran, and Weton" : "Hari, Pasaran, dan Weton",
      values: [
        day ? { label: isEn ? "Day" : "Hari", value: day } : null,
        pasaran ? { label: "Pasaran", value: pasaran } : null,
        weton ? { label: "Weton", value: weton } : null,
      ].filter((value): value is WetonPresentationValue => Boolean(value)),
      narrative: identity,
    });
  }

  if (neptuDay || neptuPasaran || totalNeptu) {
    const meaning = totalNeptu
      ? (isEn ? NEPTU_INTERPRETATIONS_EN[totalNeptu] : NEPTU_INTERPRETATIONS[totalNeptu])
      : undefined;
    const narrative = meaning
      ? isEn
        ? `${sentence(`This numerical rhythm reflects a cadence that is ${meaning.watak}; it is neither an index of good or bad nor a promise of destiny`)} ${sentence(`In daily practice, its strength unfolds through ${meaning.strength}, while its area of cultivation lies in ${meaning.challenge}`)}`
        : `${sentence(`Susunan nilai ini menggambarkan ritme yang ${meaning.watak}; ia bukan ukuran baik-buruk ataupun janji nasib`)} ${sentence(`Dalam praktik sehari-hari, kekuatannya muncul lewat ${meaning.strength}, sedangkan ruang latihannya ada pada ${meaning.challenge}`)}`
      : isEn
        ? `${sentence("This value composition serves as a rhythmic marker in traditional readings, not as a measure of quality")} ${sentence("Its value comes alive when read alongside real behavioral tendencies and conscious daily choices")}`
        : `${sentence("Susunan nilai ini dipakai sebagai penanda ritme dalam pembacaan tradisional, bukan sebagai ukuran baik atau buruk")} ${sentence("Maknanya baru berguna ketika dibaca bersama kecenderungan perilaku dan pilihan nyata sehari-hari")}`;
    sections.push({
      id: "neptu",
      title: "Neptu",
      values: [
        neptuDay ? { label: isEn ? "Day Neptu" : "Neptu Hari", value: String(neptuDay) } : null,
        neptuPasaran ? { label: isEn ? "Pasaran Neptu" : "Neptu Pasaran", value: String(neptuPasaran) } : null,
        totalNeptu ? { label: isEn ? "Total Neptu" : "Total Neptu", value: String(totalNeptu) } : null,
      ].filter((value): value is WetonPresentationValue => Boolean(value)),
      narrative,
    });
  }

  if (wukuName && wukuDescription) {
    sections.push({
      id: "wuku",
      title: "Wuku",
      values: [{ label: "Wuku", value: wukuIndex ? (isEn ? `${wukuName} · No. ${wukuIndex}` : `${wukuName} · ke-${wukuIndex}`) : wukuName }],
      narrative: isEn
        ? `${sentence(`In traditional symbolism, ${wukuDescription}`)} ${sentence(growth ? `In daily life, this theme meets your need to ${lowerFirst(growth)}` : "In daily life, this theme invites sensitivity to how you initiate, persevere, and bring processes to completion")}`
        : `${sentence(`Dalam simbolisme tradisional, ${wukuDescription}`)} ${sentence(growth ? `Di keseharian, tema ini bertemu dengan kebutuhanmu untuk ${lowerFirst(growth)}` : "Di keseharian, tema ini mengajakmu peka pada cara memulai, bertahan, dan menyelesaikan proses")}`,
    });
  }

  if (pranataName && pranataDescription) {
    sections.push({
      id: "pranata-mangsa",
      title: "Pranata Mangsa",
      values: [{ label: "Pranata Mangsa", value: pranataName }],
      narrative: isEn
        ? `${sentence(`In traditional seasonal calendar, ${pranataDescription}`)} ${sentence("This seasonal theme can be understood as awareness of when to conserve energy, adjust direction, or proceed with greater resolve")}`
        : `${sentence(`Dalam penanggalan tradisional, ${pranataDescription}`)} ${sentence("Tema musim ini dapat dibaca sebagai kepekaan terhadap kapan perlu menjaga tenaga, menyesuaikan arah, atau bergerak dengan lebih mantap")}`,
    });
  }

  if (watak || (day && pasaran)) {
    const dayChallenge = day ? (isEn ? DAY_INTERPRETATIONS_EN[day].challenge : DAY_INTERPRETATIONS[day].challenge) : challenges;
    sections.push({
      id: "character",
      title: isEn ? "Character and Emotional Patterns" : "Karakter dan Pola Emosi",
      values: [],
      narrative: isEn
        ? `${sentence(watak ? `Your core character is described as ${lowerFirst(watak)}` : `Your core character combines ${DAY_INTERPRETATIONS_EN[day!].watak} with ${lowerFirst(PASARAN_INTERPRETATIONS_EN[pasaran!].watak)}`)} ${sentence(dayChallenge ? `Emotionally, your growth area is to ${lowerFirst(dayChallenge)}` : "Emotionally, you benefit from pausing so reactions do not outpace clarity")}`
        : `${sentence(watak ? `Karakter dasarmu tergambar sebagai ${lowerFirst(watak)}` : `Karakter dasarmu memadukan ${DAY_INTERPRETATIONS[day!].watak} dengan ${lowerFirst(PASARAN_INTERPRETATIONS[pasaran!].watak)}`)} ${sentence(dayChallenge ? `Secara emosional, ruang tumbuhmu adalah ${lowerFirst(dayChallenge)}` : "Secara emosional, kamu membutuhkan jeda agar respons tidak bergerak lebih cepat daripada kejernihan")}`,
    });
  }

  if (pasaran) {
    const meaning = isEn ? PASARAN_INTERPRETATIONS_EN[pasaran] : PASARAN_INTERPRETATIONS[pasaran];
    sections.push({
      id: "social",
      title: isEn ? "Social Interaction" : "Cara Bersosialisasi",
      values: [],
      narrative: isEn
        ? `${sentence(`Among others, you tend to ${meaning.strength}`)} ${sentence(`Your social rhythm becomes healthier when you ${meaning.challenge}`)}`
        : `${sentence(`Di tengah orang lain, kamu cenderung ${meaning.strength}`)} ${sentence(`Ritme sosialmu menjadi lebih sehat ketika kamu ${meaning.challenge}`)}`,
    });
  }

  if (strengths || challenges) {
    sections.push({
      id: "strengths-challenges",
      title: isEn ? "Strengths and Challenges" : "Kekuatan dan Tantangan",
      values: [],
      narrative: isEn
        ? `${sentence(strengths ? `Your strength is evident through your ability to ${lowerFirst(strengths)}` : "Your strength grows when natural abilities receive clear direction")} ${sentence(challenges ? `Your challenge is to ${lowerFirst(challenges)}` : "Your primary challenge is maintaining balanced energy when circumstances press")}`
        : `${sentence(strengths ? `Kekuatanmu terlihat melalui kemampuan untuk ${lowerFirst(strengths)}` : "Kekuatanmu tumbuh ketika kemampuan alami diberi arah yang jelas")} ${sentence(challenges ? `Tantanganmu adalah ${lowerFirst(challenges)}` : "Tantangan utamamu adalah menjaga tenaga tetap seimbang saat keadaan menekan")}`,
    });
  }

  if (relationship) {
    sections.push({
      id: "relationship",
      title: isEn ? "Relationships" : "Relasi",
      values: [],
      narrative: isEn
        ? `${sentence(`In relationships, you tend to ${lowerFirst(relationship)}`)} ${sentence(pasaran ? `Closeness feels secure when that need walks together with your ability to ${PASARAN_INTERPRETATIONS_EN[pasaran].challenge}` : "Closeness feels secure when caring for others does not erase your own boundaries and needs")}`
        : `${sentence(`Dalam relasi, kamu cenderung ${lowerFirst(relationship)}`)} ${sentence(pasaran ? `Kedekatan terasa aman ketika kebutuhan itu berjalan bersama kemampuanmu untuk ${PASARAN_INTERPRETATIONS[pasaran].challenge}` : "Kedekatan terasa aman ketika perhatian pada orang lain tidak menghapus batas dan kebutuhanmu sendiri")}`,
    });
  }

  if (work) {
    sections.push({
      id: "work",
      title: isEn ? "Work and Contribution" : "Cara Bekerja dan Berkontribusi",
      values: [],
      narrative: isEn
        ? `${sentence(`In work, you tend to ${lowerFirst(work)}`)} ${sentence(day ? `Your contribution is felt most when the capacity to ${DAY_INTERPRETATIONS_EN[day].strength} is directed toward concrete goals` : "Your contribution is felt most when responsibility and personal capacity remain in healthy balance")}`
        : `${sentence(`Dalam bekerja, kamu cenderung ${lowerFirst(work)}`)} ${sentence(day ? `Kontribusimu paling terasa saat kemampuan untuk ${DAY_INTERPRETATIONS[day].strength} diberi tujuan yang konkret` : "Kontribusimu paling terasa ketika tanggung jawab dan kapasitas diri tetap seimbang")}`,
    });
  }

  if (money) {
    sections.push({
      id: "money",
      title: isEn ? "Resource Patterns" : "Pola Rezeki",
      values: [],
      narrative: isEn
        ? `${sentence(`In managing opportunities and resources, ${lowerFirst(money)}`)} ${sentence("This is not a guarantee of specific outcomes; the pattern becomes constructive when applied with discernment, healthy boundaries, and consistency")}`
        : `${sentence(`Dalam mengelola peluang dan sumber daya, ${lowerFirst(money)}`)} ${sentence("Ini bukan jaminan hasil tertentu; pola tersebut menjadi berguna ketika dijalankan dengan perhitungan, batas yang sehat, dan konsistensi")}`,
    });
  }

  if (growth) {
    sections.push({
      id: "growth",
      title: isEn ? "Growth Direction" : "Arah Pertumbuhan",
      values: [],
      narrative: isEn
        ? `${sentence(`Your growth direction is to ${lowerFirst(growth)}`)} ${sentence(challenges ? `A more mature expression emerges when working with ${lowerFirst(challenges)} without discounting the strengths already present` : "A more mature expression emerges when insight is translated into conscious choices")}`
        : `${sentence(`Arah pertumbuhanmu adalah ${lowerFirst(growth)}`)} ${sentence(challenges ? `Ekspresi yang lebih matang muncul ketika kamu mengolah ${lowerFirst(challenges)} tanpa menolak kekuatan yang sudah ada` : "Ekspresi yang lebih matang muncul ketika pemahaman itu diterjemahkan menjadi pilihan yang sadar")}`,
    });
  }

  const summary = buildSummary({
    day,
    pasaran,
    strengths,
    challenges,
    relationship,
    work,
    money,
    growth,
    wukuDescription,
    pranataDescription,
  }, isEn);
  const tulangWangi = buildTulangWangi(day, pasaran, isEn);
  const missing = [
    !day ? (isEn ? "Day" : "Hari") : null,
    !pasaran ? "Pasaran" : null,
    !weton ? "Weton" : null,
    !totalNeptu ? (isEn ? "Total Neptu" : "Total Neptu") : null,
    !wukuName || !wukuDescription ? "Wuku" : null,
    !pranataName || !pranataDescription ? "Pranata Mangsa" : null,
  ].filter((value): value is string => Boolean(value));
  const status = sections.length === 0 ? "unavailable" : missing.length === 0 ? "ready" : "partial";

  return {
    status,
    canonicalName: "Weton",
    hero: isEn ? "Traces of Your Birth Day" : "Jejak Hari Kelahiranmu",
    sections,
    summary,
    summaryText: summary.join("\n\n"),
    profileCard: {
      title: "Weton",
      weton,
      dayAndPasaran: day && pasaran ? `${day} · ${pasaran}` : day ?? pasaran,
      totalNeptu: totalNeptu ? `Total Neptu ${totalNeptu}` : undefined,
      insight: identity?.split(/(?<=[.!?])\s+/)[0],
      href: "/blueprint/weton",
    },
    ...(tulangWangi ? { tulangWangi } : {}),
    missing,
  };
}
