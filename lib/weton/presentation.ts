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
  hero: "Jejak Hari Kelahiranmu";
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

function buildTulangWangi(
  day: JavaneseDay | undefined,
  pasaran: Pasaran | undefined,
): TulangWangiPresentation | undefined {
  if (!day || !pasaran) return undefined;
  const wetonName = `${day} ${pasaran}`;
  if (!TULANG_WANGI_LOOKUP.has(wetonName)) return undefined;

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
): string | undefined {
  if (day && pasaran) {
    const dayMeaning = DAY_INTERPRETATIONS[day];
    const pasaranMeaning = PASARAN_INTERPRETATIONS[pasaran];
    return [
      sentence(`Perpaduan ${day} dan ${pasaran} mempertemukan sisi yang ${dayMeaning.watak} dengan ritme sosial yang ${lowerFirst(pasaranMeaning.watak.replace(/^membawa\s+/i, ""))}`),
      sentence(`Saat tekanan datang, pola ini meminta kamu ${dayMeaning.challenge} sambil ${pasaranMeaning.challenge}`),
      sentence("Dalam keseharian, keputusan terasa paling jernih ketika ketegasan dan kepekaan diberi ruang yang seimbang"),
    ].join(" ");
  }
  if (fallback) {
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
}): string[] {
  if (!input.day || !input.pasaran || !input.relationship || !input.work || !input.money || !input.growth) {
    return [];
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
): WetonPresentation {
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

  const identity = identityNarrative(day, pasaran, watak);
  if (identity && (day || pasaran || weton)) {
    sections.push({
      id: "identity",
      title: "Hari, Pasaran, dan Weton",
      values: [
        day ? { label: "Hari", value: day } : null,
        pasaran ? { label: "Pasaran", value: pasaran } : null,
        weton ? { label: "Weton", value: weton } : null,
      ].filter((value): value is WetonPresentationValue => Boolean(value)),
      narrative: identity,
    });
  }

  if (neptuDay || neptuPasaran || totalNeptu) {
    const meaning = totalNeptu ? NEPTU_INTERPRETATIONS[totalNeptu] : undefined;
    const narrative = meaning
      ? `${sentence(`Susunan nilai ini menggambarkan ritme yang ${meaning.watak}; ia bukan ukuran baik-buruk ataupun janji nasib`)} ${sentence(`Dalam praktik sehari-hari, kekuatannya muncul lewat ${meaning.strength}, sedangkan ruang latihannya ada pada ${meaning.challenge}`)}`
      : `${sentence("Susunan nilai ini dipakai sebagai penanda ritme dalam pembacaan tradisional, bukan sebagai ukuran baik atau buruk") } ${sentence("Maknanya baru berguna ketika dibaca bersama kecenderungan perilaku dan pilihan nyata sehari-hari")}`;
    sections.push({
      id: "neptu",
      title: "Neptu",
      values: [
        neptuDay ? { label: "Neptu Hari", value: String(neptuDay) } : null,
        neptuPasaran ? { label: "Neptu Pasaran", value: String(neptuPasaran) } : null,
        totalNeptu ? { label: "Total Neptu", value: String(totalNeptu) } : null,
      ].filter((value): value is WetonPresentationValue => Boolean(value)),
      narrative,
    });
  }

  if (wukuName && wukuDescription) {
    sections.push({
      id: "wuku",
      title: "Wuku",
      values: [{ label: "Wuku", value: wukuIndex ? `${wukuName} · ke-${wukuIndex}` : wukuName }],
      narrative: `${sentence(`Dalam simbolisme tradisional, ${wukuDescription}`)} ${sentence(growth ? `Di keseharian, tema ini bertemu dengan kebutuhanmu untuk ${lowerFirst(growth)}` : "Di keseharian, tema ini mengajakmu peka pada cara memulai, bertahan, dan menyelesaikan proses")}`,
    });
  }

  if (pranataName && pranataDescription) {
    sections.push({
      id: "pranata-mangsa",
      title: "Pranata Mangsa",
      values: [{ label: "Pranata Mangsa", value: pranataName }],
      narrative: `${sentence(`Dalam penanggalan tradisional, ${pranataDescription}`)} ${sentence("Tema musim ini dapat dibaca sebagai kepekaan terhadap kapan perlu menjaga tenaga, menyesuaikan arah, atau bergerak dengan lebih mantap")}`,
    });
  }

  if (watak || (day && pasaran)) {
    const dayChallenge = day ? DAY_INTERPRETATIONS[day].challenge : challenges;
    sections.push({
      id: "character",
      title: "Karakter dan Pola Emosi",
      values: [],
      narrative: `${sentence(watak ? `Karakter dasarmu tergambar sebagai ${lowerFirst(watak)}` : `Karakter dasarmu memadukan ${DAY_INTERPRETATIONS[day!].watak} dengan ${lowerFirst(PASARAN_INTERPRETATIONS[pasaran!].watak)}`)} ${sentence(dayChallenge ? `Secara emosional, ruang tumbuhmu adalah ${lowerFirst(dayChallenge)}` : "Secara emosional, kamu membutuhkan jeda agar respons tidak bergerak lebih cepat daripada kejernihan")}`,
    });
  }

  if (pasaran) {
    const meaning = PASARAN_INTERPRETATIONS[pasaran];
    sections.push({
      id: "social",
      title: "Cara Bersosialisasi",
      values: [],
      narrative: `${sentence(`Di tengah orang lain, kamu cenderung ${meaning.strength}`)} ${sentence(`Ritme sosialmu menjadi lebih sehat ketika kamu ${meaning.challenge}`)}`,
    });
  }

  if (strengths || challenges) {
    sections.push({
      id: "strengths-challenges",
      title: "Kekuatan dan Tantangan",
      values: [],
      narrative: `${sentence(strengths ? `Kekuatanmu terlihat melalui kemampuan untuk ${lowerFirst(strengths)}` : "Kekuatanmu tumbuh ketika kemampuan alami diberi arah yang jelas")} ${sentence(challenges ? `Tantanganmu adalah ${lowerFirst(challenges)}` : "Tantangan utamamu adalah menjaga tenaga tetap seimbang saat keadaan menekan")}`,
    });
  }

  if (relationship) {
    sections.push({
      id: "relationship",
      title: "Relasi",
      values: [],
      narrative: `${sentence(`Dalam relasi, kamu cenderung ${lowerFirst(relationship)}`)} ${sentence(pasaran ? `Kedekatan terasa aman ketika kebutuhan itu berjalan bersama kemampuanmu untuk ${PASARAN_INTERPRETATIONS[pasaran].challenge}` : "Kedekatan terasa aman ketika perhatian pada orang lain tidak menghapus batas dan kebutuhanmu sendiri")}`,
    });
  }

  if (work) {
    sections.push({
      id: "work",
      title: "Cara Bekerja dan Berkontribusi",
      values: [],
      narrative: `${sentence(`Dalam bekerja, kamu cenderung ${lowerFirst(work)}`)} ${sentence(day ? `Kontribusimu paling terasa saat kemampuan untuk ${DAY_INTERPRETATIONS[day].strength} diberi tujuan yang konkret` : "Kontribusimu paling terasa ketika tanggung jawab dan kapasitas diri tetap seimbang")}`,
    });
  }

  if (money) {
    sections.push({
      id: "money",
      title: "Pola Rezeki",
      values: [],
      narrative: `${sentence(`Dalam mengelola peluang dan sumber daya, ${lowerFirst(money)}`)} ${sentence("Ini bukan jaminan hasil tertentu; pola tersebut menjadi berguna ketika dijalankan dengan perhitungan, batas yang sehat, dan konsistensi")}`,
    });
  }

  if (growth) {
    sections.push({
      id: "growth",
      title: "Arah Pertumbuhan",
      values: [],
      narrative: `${sentence(`Arah pertumbuhanmu adalah ${lowerFirst(growth)}`)} ${sentence(challenges ? `Ekspresi yang lebih matang muncul ketika kamu mengolah ${lowerFirst(challenges)} tanpa menolak kekuatan yang sudah ada` : "Ekspresi yang lebih matang muncul ketika pemahaman itu diterjemahkan menjadi pilihan yang sadar")}`,
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
  });
  const tulangWangi = buildTulangWangi(day, pasaran);
  const missing = [
    !day ? "Hari" : null,
    !pasaran ? "Pasaran" : null,
    !weton ? "Weton" : null,
    !totalNeptu ? "Total Neptu" : null,
    !wukuName || !wukuDescription ? "Wuku" : null,
    !pranataName || !pranataDescription ? "Pranata Mangsa" : null,
  ].filter((value): value is string => Boolean(value));
  const status = sections.length === 0 ? "unavailable" : missing.length === 0 ? "ready" : "partial";

  return {
    status,
    canonicalName: "Weton",
    hero: "Jejak Hari Kelahiranmu",
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
