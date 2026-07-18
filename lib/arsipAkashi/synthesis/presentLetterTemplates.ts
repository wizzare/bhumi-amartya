import type { ArsipAkashiInsightModel } from "./types";

function hashKey(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = ((h << 5) - h + value.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pick<T>(items: T[], key: string): T {
  return items[hashKey(key) % items.length];
}

const PARAGRAPH_POOLS: string[][] = [
  [
    "Ada sesuatu dalam fase yang sedang kamu jalani yang meminta perhatian lebih jujur daripada biasanya.",
    "Kamu sedang berada di bagian perjalanan yang tidak cukup dijawab dengan terus bergerak.",
    "Bab ini terasa lebih dekat karena beberapa kebutuhan batinmu mulai terdengar bersamaan.",
  ],
  [
    "Pola lama bisa terasa lebih aktif ketika tuntutan dari luar bertemu dengan kebutuhanmu untuk tetap menjadi diri sendiri.",
    "Ketegangan yang muncul bukan tanda bahwa kamu salah arah, melainkan tanda bahwa cara lama mulai membutuhkan penyesuaian.",
    "Ada jarak antara apa yang sanggup kamu berikan dan apa yang sebenarnya sedang kamu perlukan.",
  ],
  [
    "Di balik kegelisahan itu ada pemahaman baru tentang batas, ritme, dan jenis kedekatan yang membuatmu tetap utuh.",
    "Pengalaman sekarang sedang memperlihatkan mana yang benar-benar penting dan mana yang hanya kamu bawa karena kebiasaan.",
    "Makna fase ini bukan menjadi lebih keras, tetapi belajar membaca sinyal dirimu sebelum semuanya terasa terlalu penuh.",
  ],
  [
    "Yang perlu dirawat sekarang adalah ruang untuk berhenti sejenak sebelum menjawab semua permintaan yang datang.",
    "Kamu tidak perlu menyelesaikan seluruh bab ini hari ini; cukup jujur tentang satu hal yang paling membutuhkan perhatian.",
    "Perawatan yang paling tepat mungkin berupa ritme yang lebih sederhana, batas yang lebih jelas, atau keberanian meminta dukungan.",
  ],
  [
    "Arah yang membumi untuk fase ini adalah memilih satu langkah kecil yang bisa kamu ulang tanpa memaksa hasil.",
    "Biarkan keputusanmu lahir dari kejernihan yang bertumbuh, bukan dari ketakutan untuk tertinggal.",
    "Kamu boleh bergerak perlahan sambil tetap mempercayai bahwa bab ini sedang mengajarkan sesuatu yang penting.",
  ],
];

const SENTENCE_SUFFIXES = [
  "Perhatikan bagaimana tubuhmu merespons ketika kamu memberi ruang pada kebenaran itu.",
  "Dari sana, pilihan yang lebih selaras biasanya mulai terasa lebih mudah dikenali.",
  "Tidak semua jawaban harus datang sekaligus agar langkahmu tetap memiliki arah.",
  "Kejelasan tumbuh ketika kamu bersedia hadir tanpa menghakimi apa yang sedang kamu rasakan.",
  "Yang berubah sekarang bukan seluruh dirimu, melainkan cara kamu menemani dirimu sendiri.",
  "Kamu bisa membawa pelajaran ini tanpa menjadikannya hukuman baru untuk dirimu.",
  "Berikan waktu pada proses itu agar maknanya tidak tertutup oleh desakan untuk segera selesai.",
  "Dengan begitu, fase sementara ini dapat menjadi pengetahuan yang berguna tanpa mendefinisikan seluruh hidupmu.",
  "Rasa yang muncul sekarang boleh menjadi informasi tanpa berubah menjadi vonis tentang siapa dirimu.",
  "Kamu sedang belajar membedakan kebutuhan yang mendesak dari suara lama yang hanya meminta kepastian.",
  "Satu jeda yang sadar dapat memberi bentuk baru pada keputusan yang sebelumnya terasa buntu.",
  "Hubunganmu dengan dirimu sendiri adalah tempat pertama untuk menguji arah yang sedang kamu pilih.",
  "Tidak ada keharusan untuk membuktikan pertumbuhanmu melalui kecepatan atau kesempurnaan.",
  "Fase ini akan berlalu, tetapi pemahaman yang kamu bangun darinya dapat tetap berguna.",
  "Pilihlah cara berjalan yang masih menyisakan tenaga untuk menikmati hidup di sepanjang prosesnya.",
];

export interface PresentLetterContext {
  phaseThemes: string[];
  identityThemes: string[];
  patterns: string[];
  tensions: string[];
  factIds: string[];
  contributingSystems: string[];
  timingLimitations: string[];
  referenceDate: string;
  signatureTokens: string[];
}

export function buildPresentLetterContext(model: ArsipAkashiInsightModel): PresentLetterContext {
  const phase = model.sections.find((section) => section.sectionId === "current-life-phase");
  const identity = model.sections.find((section) => section.sectionId === "soul-identity");
  const activeSections = model.sections.filter((section) =>
    ["current-life-phase", "soul-identity", "energy-mechanics", "wounds-shadow-lineage", "love-relationships", "work-talents", "body-environment", "spirituality-evolution"].includes(section.sectionId),
  );
  const selectedFacts = activeSections.flatMap((section) => section.selectedFacts);
  const timingFacts = selectedFacts.filter((fact) => fact.domain === "timing" || fact.systemId === "natal-chart");

  return {
    phaseThemes: phase?.primaryThemes.map((theme) => theme.themeId) ?? [],
    identityThemes: identity?.primaryThemes.map((theme) => theme.themeId) ?? [],
    patterns: activeSections.flatMap((section) => section.recurringPatterns.map((pattern) => pattern.patternId)).slice(0, 8),
    tensions: activeSections.flatMap((section) => section.tensions.map((tension) => tension.tensionId)).slice(0, 8),
    factIds: [...new Set(selectedFacts.map((fact) => fact.factId))].slice(0, 40),
    contributingSystems: [...new Set(selectedFacts.map((fact) => fact.systemId))].sort(),
    timingLimitations: [...new Set(timingFacts.flatMap((fact) => fact.warnings))],
    referenceDate: model.generatedAt,
    signatureTokens: selectedFacts.map((fact) => fact.value.slice(0, 24)).slice(0, 40),
  };
}

export function composePresentSelfParagraphs(
  model: ArsipAkashiInsightModel,
  context: PresentLetterContext,
): string[][] {
  const signature = [
    model.generatedAt,
    context.phaseThemes.join(","),
    context.identityThemes.join(","),
    context.patterns.join(","),
    context.tensions.join(","),
    context.factIds.map((id) => id.slice(0, 14)).join("|"),
    context.signatureTokens.join("|"),
  ].join("|");

  const usedSuffixes = new Set<string>();
  const chooseSuffix = (key: string): string => {
    const available = SENTENCE_SUFFIXES.filter((sentence) => !usedSuffixes.has(sentence));
    const sentence = pick(available, key);
    usedSuffixes.add(sentence);
    return sentence;
  };

  return PARAGRAPH_POOLS.map((pool, paragraphIndex) => {
    const opening = pick(pool, `${signature}-opening-${paragraphIndex}`);
    const suffixA = chooseSuffix(`${signature}-suffix-a-${paragraphIndex}`);
    const suffixB = chooseSuffix(`${signature}-suffix-b-${paragraphIndex}`);
    const suffixC = chooseSuffix(`${signature}-suffix-c-${paragraphIndex}`);
    return [opening, suffixA, suffixB, suffixC];
  });
}
