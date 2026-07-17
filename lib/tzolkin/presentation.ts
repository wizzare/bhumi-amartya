import { SOLAR_SEALS } from "./dictionaries";
import type { GalacticTone, SolarSeal, TzolkinBlueprint, TzolkinOracle } from "./types";

export const TZOLKIN_PRESENTATION_SOURCE_VERSION = "tzolkin-presentation-r5-1.0.0";

export const TZOLKIN_SOURCE_PROVENANCE = {
  cutoff: "2026-07-14T13:00:00+07:00",
  calculation: {
    classification: "STRUCTURED_PRE_CUTOFF_SOURCE" as const,
    lastVerifiedCommit: "eac8065a0fe17e757432da360e665ecff1255a93",
    lastVerifiedAt: "2026-06-28T16:30:56+07:00",
  },
  dictionaries: {
    classification: "STRUCTURED_PRE_CUTOFF_SOURCE" as const,
    lastVerifiedCommit: "eac8065a0fe17e757432da360e665ecff1255a93",
    lastVerifiedAt: "2026-06-28T16:30:56+07:00",
  },
  legacySummary: { classification: "LEGACY_SOURCE" as const, usedByPresentation: false },
  postCutoffPolicy: { classification: "POST_CUTOFF_FORWARD_SOURCE" as const, usedByPresentation: false },
  presentation: { classification: "FOUNDER_APPROVED_FUNCTIONAL_RECONSTRUCTION" as const },
  exactV4Claim: { classification: "UNPROVEN" as const },
} as const;

export type TzolkinSourceClassification =
  | "EXACT_V4_SOURCE"
  | "STRUCTURED_PRE_CUTOFF_SOURCE"
  | "LEGACY_SOURCE"
  | "POST_CUTOFF_FORWARD_SOURCE"
  | "FOUNDER_APPROVED_FUNCTIONAL_RECONSTRUCTION"
  | "UNPROVEN";

type DeepPartial<T> = T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

export type TzolkinPresentationInput = DeepPartial<TzolkinBlueprint>;

export type TzolkinSectionContract = {
  sectionId: string;
  label: string;
  rawValue: string | number | boolean | null;
  displayValue: string;
  kinNumber: number | null;
  toneNumber: number | null;
  toneName: string | null;
  sealNumber: number | null;
  sealName: string | null;
  color: string | null;
  direction: string | null;
  shortExplanation: string;
  fullExplanation: string;
  sourceType: TzolkinSourceClassification;
  sourceVersion: string;
  canonicalStatus: "canonical" | "derived-presentation";
  availabilityStatus: "available";
};

export type TzolkinSectionGroup = {
  groupId: string;
  title: string;
  sections: TzolkinSectionContract[];
};

export type TzolkinIdentityReadContract = {
  kin: TzolkinSectionContract | null;
  kinNumber: number | null;
  galacticSignature: TzolkinSectionContract | null;
  tone: TzolkinSectionContract | null;
  toneNumber: number | null;
  seal: TzolkinSectionContract | null;
  sealNumber: number | null;
  color: string | null;
  wavespell: TzolkinSectionContract | null;
  castle: TzolkinSectionContract | null;
  guide: TzolkinSectionContract | null;
  analog: TzolkinSectionContract | null;
  antipode: TzolkinSectionContract | null;
  occult: TzolkinSectionContract | null;
  isGap: boolean | null;
  gap: TzolkinSectionContract | null;
  archetypeThemes: TzolkinSectionContract | null;
  giftThemes: TzolkinSectionContract | null;
  challengeThemes: TzolkinSectionContract | null;
  emotionalThemes: TzolkinSectionContract | null;
  relationshipThemes: TzolkinSectionContract | null;
  workThemes: TzolkinSectionContract | null;
  growthDirection: TzolkinSectionContract | null;
  summary: string[];
  sourceVersion: string;
  sourceClassification: {
    calculation: "STRUCTURED_PRE_CUTOFF_SOURCE";
    dictionaries: "STRUCTURED_PRE_CUTOFF_SOURCE";
    legacySummary: "LEGACY_SOURCE";
    presentation: "FOUNDER_APPROVED_FUNCTIONAL_RECONSTRUCTION";
    exactV4Claim: "UNPROVEN";
  };
};

export type TzolkinPresentation = {
  status: "complete" | "partial" | "unavailable";
  canonicalName: "Tzolkin";
  hero: {
    title: "Kalender Kesadaran Maya";
    kin: string | null;
    galacticSignature: string | null;
    tone: string | null;
    seal: string | null;
    insight: string;
    action: "Lihat detail selengkapnya";
  };
  profileCard: {
    title: "Tzolkin Maya";
    kin: string | null;
    tone: string | null;
    seal: string | null;
    insight: string;
    action: "Lihat detail selengkapnya";
    href: "/blueprint/tzolkin";
  };
  groups: TzolkinSectionGroup[];
  readContract: TzolkinIdentityReadContract;
  summary: string[];
  summaryText: string;
  sourceVersion: string;
};

const SOURCE_CLASSIFICATION: TzolkinIdentityReadContract["sourceClassification"] = {
  calculation: "STRUCTURED_PRE_CUTOFF_SOURCE",
  dictionaries: "STRUCTURED_PRE_CUTOFF_SOURCE",
  legacySummary: "LEGACY_SOURCE",
  presentation: "FOUNDER_APPROVED_FUNCTIONAL_RECONSTRUCTION",
  exactV4Claim: "UNPROVEN",
};

const COLOR_DIRECTION: Record<string, string> = {
  Merah: "Timur", Red: "East", Putih: "Utara", White: "North",
  Biru: "Barat", Blue: "West", Kuning: "Selatan", Yellow: "South",
  Hijau: "Tengah", Green: "Center",
};

const isText = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const validKin = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 260;

function clean(value: unknown): string {
  return isText(value) ? value.replace(/\s+/g, " ").trim().replace(/[.。]+$/g, "") : "";
}

function lower(value: unknown): string {
  const normalized = clean(value);
  return normalized ? normalized.charAt(0).toLocaleLowerCase("id-ID") + normalized.slice(1) : "";
}

function safeMeaning(value: unknown): string {
  return lower(value)
    .replace(/kekuatan mistis/gi, "kepekaan intuitif")
    .replace(/energi ilahi/gi, "inspirasi yang bermakna")
    .replace(/kehendak ilahi/gi, "nilai yang lebih luas")
    .replace(/menciptakan keajaiban/gi, "menghadirkan kemungkinan baru")
    .replace(/penyembuhan/gi, "pemulihan")
    .replace(/menyembuhkan/gi, "mendukung pemulihan")
    .replace(/pencerahan/gi, "kejernihan")
    .replace(/spiritual/gi, "batin");
}

function toneIdentity(tone: DeepPartial<GalacticTone> | undefined) {
  if (!isText(tone?.name)) return { number: null, name: null };
  const match = tone.name.match(/^(\d+)\s*-\s*(.+)$/);
  const number = match ? Number(match[1]) : null;
  return {
    number: number && number >= 1 && number <= 13 ? number : null,
    name: clean(match?.[2] || tone.name),
  };
}

function sealIdentity(seal: DeepPartial<SolarSeal> | undefined) {
  if (!isText(seal?.name)) return { number: null, name: null, color: null, direction: null };
  const name = clean(seal.name);
  const number = SOLAR_SEALS.findIndex((candidate) => candidate.name === name) + 1;
  const color = Object.keys(COLOR_DIRECTION).find((candidate) => name.includes(candidate)) || null;
  return { number: number > 0 ? number : null, name, color, direction: color ? COLOR_DIRECTION[color] : null };
}

function section(
  values: Omit<TzolkinSectionContract, "sourceType" | "sourceVersion" | "canonicalStatus" | "availabilityStatus">,
): TzolkinSectionContract {
  return {
    ...values,
    sourceType: "FOUNDER_APPROVED_FUNCTIONAL_RECONSTRUCTION",
    sourceVersion: TZOLKIN_PRESENTATION_SOURCE_VERSION,
    canonicalStatus: "derived-presentation",
    availabilityStatus: "available",
  };
}

function baseFields(input: {
  kinNumber?: number | null;
  toneNumber?: number | null;
  toneName?: string | null;
  sealNumber?: number | null;
  sealName?: string | null;
  color?: string | null;
  direction?: string | null;
}) {
  return {
    kinNumber: input.kinNumber ?? null,
    toneNumber: input.toneNumber ?? null,
    toneName: input.toneName ?? null,
    sealNumber: input.sealNumber ?? null,
    sealName: input.sealName ?? null,
    color: input.color ?? null,
    direction: input.direction ?? null,
  };
}

function identitySections(input: TzolkinPresentationInput) {
  const kinNumber = validKin(input.kin) ? input.kin : null;
  const tone = toneIdentity(input.galacticTone);
  const seal = sealIdentity(input.solarSeal);
  const shared = baseFields({ kinNumber, toneNumber: tone.number, toneName: tone.name, sealNumber: seal.number, sealName: seal.name, color: seal.color, direction: seal.direction });
  const keyword = safeMeaning(input.solarSeal?.keyword) || "kualitas arketipal yang tersimpan";
  const sealGift = safeMeaning(input.solarSeal?.gift) || "menggunakan kekuatan alaminya secara sadar";
  const sealChallenge = safeMeaning(input.solarSeal?.challenge) || "menjaga respons tetap seimbang";
  const toneFunction = safeMeaning(input.galacticTone?.function) || "ritme yang khas";
  const toneGift = safeMeaning(input.galacticTone?.gift) || "menata energi sesuai kebutuhan";
  const toneShadow = safeMeaning(input.galacticTone?.shadow) || "kehilangan ritme ketika tekanan meningkat";
  const toneLesson = safeMeaning(input.galacticTone?.lesson) || "kembali pada langkah yang selaras";

  const kin = kinNumber ? section({
    sectionId: "kin", label: "Kin", rawValue: kinNumber, displayValue: `Kin ${kinNumber}`, ...shared,
    shortExplanation: `Kin ${kinNumber} menyatukan ritme ${tone.name || "yang tersedia"} dan arketipe ${seal.name || "yang tersedia"}.`,
    fullExplanation: `Pola identitasmu mempertemukan ritme ${tone.name || "yang tersedia"} dengan kualitas ${keyword}, sehingga kamu cenderung bergerak melalui pengalaman dengan tempo yang khas. Kekuatanmu muncul saat kamu dapat ${sealGift}, sementara gesekan dapat terasa ketika ${sealChallenge}. Nomor Kin adalah penanda posisi dalam siklus, bukan penentu nasib.`,
  }) : null;

  const galacticSignature = isText(input.kinName) ? section({
    sectionId: "galactic-signature", label: "Galactic Signature", rawValue: input.kinName,
    displayValue: clean(input.kinName), ...shared,
    shortExplanation: `Galactic Signature memadukan ${tone.name || "ritme"} dan ${seal.name || "arketipe"} dalam satu identitas canonical.`,
    fullExplanation: `Kombinasi ini membuat kualitas ${keyword} diekspresikan melalui cara yang berhubungan dengan ${toneFunction}. Bakat ${sealGift} menjadi lebih terarah ketika ritme hidup tidak dipaksakan dan setiap tahap diberi ruang yang cukup.`,
  }) : null;

  const toneSection = tone.number && tone.name ? section({
    sectionId: "galactic-tone", label: "Galactic Tone", rawValue: clean(input.galacticTone?.name),
    displayValue: `${tone.number} · ${tone.name}`, ...shared,
    shortExplanation: `Galactic Tone ${tone.number} ${tone.name} membawa ritme ${toneFunction}.`,
    fullExplanation: `Kamu cenderung mengatur keterlibatan dengan kehidupan melalui ${toneFunction}, yang membantu menentukan cara memulai, menata, mempertahankan, atau menyelesaikan sesuatu. Kekuatanmu muncul melalui kemampuan untuk ${toneGift}. Ketika ${toneShadow}, undangannya adalah ${toneLesson}.`,
  }) : null;

  const sealSection = seal.name ? section({
    sectionId: "solar-seal", label: "Solar Seal", rawValue: seal.name, displayValue: seal.name, ...shared,
    shortExplanation: `Solar Seal ${seal.name} membawa perhatian pada ${keyword}.`,
    fullExplanation: `Ada kualitas arketipal yang berpusat pada ${keyword} dan terlihat melalui cara kamu merespons lingkungan. Bakat alaminya adalah ${sealGift}, sementara sisi yang perlu dijaga adalah ${sealChallenge}. Ekspresi ini semakin matang ketika digunakan dengan kesadaran dan tidak diperlakukan sebagai identitas yang kaku.`,
  }) : null;

  return { kinNumber, tone, seal, shared, keyword, sealGift, sealChallenge, toneFunction, toneGift, toneShadow, toneLesson, kin, galacticSignature, toneSection, sealSection };
}

function cycleSections(input: TzolkinPresentationInput, shared: ReturnType<typeof baseFields>) {
  const wavespell = isText(input.wavespell?.name) ? section({
    sectionId: "wavespell", label: "Wavespell", rawValue: input.wavespell.name, displayValue: clean(input.wavespell.name), ...shared,
    shortExplanation: `Wavespell ini membawa medan tematik ${safeMeaning(input.wavespell.theme) || "perkembangan bertahap"}.`,
    fullExplanation: `Perjalanan yang mengelilingi Kin-mu bergerak dalam tema ${safeMeaning(input.wavespell.theme) || "perkembangan bertahap"}, sebuah rangkaian simbolik yang memberi konteks lebih luas pada pengalaman. ${clean(input.wavespell.meaning) || "Setiap tahap mengajak kualitas inti berkembang melalui proses yang berurutan"}. Undangan praktisnya adalah ${safeMeaning(input.wavespell.growthDirection).replace(/^menuju\s+/, "") || "menjalani proses tanpa memaksakan hasil"}.`,
  }) : null;
  const castle = isText(input.castle?.name) ? section({
    sectionId: "castle", label: "Castle", rawValue: input.castle.name, displayValue: clean(input.castle.name), ...shared,
    shortExplanation: `Castle ini memberi atmosfer simbolik ${safeMeaning(input.castle.theme) || "perkembangan dalam siklus yang lebih besar"}.`,
    fullExplanation: `${clean(input.castle.name)} adalah domain simbolik 52 hari, bukan lokasi kosmis yang literal. Atmosfernya berkaitan dengan ${safeMeaning(input.castle.meaning).replace(/[.!?]+\s+/g, ", ") || "gerak melalui tahap perkembangan yang lebih luas"}. Dalam keseharian, temanya mengajakmu ${safeMeaning(input.castle.spiritualLesson).replace(/^mempelajari cara\s+/, "") || "membumikan pelajaran menjadi langkah yang dapat dijalani"}.`,
  }) : null;
  const gap = input.gap === true ? section({
    sectionId: "galactic-activation-portal", label: "Galactic Activation Portal", rawValue: true,
    displayValue: "Galactic Activation Portal · GAP", ...shared,
    shortExplanation: "GAP adalah klasifikasi simbolik canonical dalam sistem Tzolkin.",
    fullExplanation: "Galactic Activation Portal adalah klasifikasi pola tertentu di dalam matriks Tzolkin. Status ini dapat dipakai sebagai undangan untuk lebih sadar terhadap intensitas pengalaman, tetapi tidak memberi kekuatan paranormal, perlindungan khusus, atau kedudukan yang lebih tinggi.",
  }) : null;
  return { wavespell, castle, gap };
}

type OracleRole = "guide" | "analog" | "antipode" | "occult";

function oracleSection(role: OracleRole, oracle: DeepPartial<TzolkinOracle> | undefined, kinNumber: number | null): TzolkinSectionContract | null {
  const value = oracle?.[role];
  const seal = sealIdentity(value?.seal);
  if (!seal.name) return null;
  const tone = toneIdentity(value?.tone);
  const shared = baseFields({ kinNumber, toneNumber: tone.number, toneName: tone.name, sealNumber: seal.number, sealName: seal.name, color: seal.color, direction: seal.direction });
  const keyword = safeMeaning(value?.seal?.keyword) || "kualitas pendukung";
  const gift = safeMeaning(value?.seal?.gift) || "menggunakan kualitas ini secara sadar";
  const challenge = safeMeaning(value?.seal?.challenge) || "menjaga kualitas ini tetap seimbang";
  const configs: Record<OracleRole, { label: string; short: string; full: string }> = {
    guide: {
      label: "Guide",
      short: `${seal.name} membantu orientasi melalui kualitas ${keyword}.`,
      full: `Arah yang mendukungmu tumbuh melalui kualitas ${keyword}, terutama ketika kamu perlu kembali pada keputusan yang terasa selaras. Bentuk nyatanya adalah ${gift}. Guide dibaca sebagai orientasi perilaku, bukan makhluk eksternal yang mengendalikan jalanmu.`,
    },
    analog: {
      label: "Analog",
      short: `${seal.name} membawa energi pelengkap melalui ${keyword}.`,
      full: `Energi pelengkapmu bekerja melalui ${keyword} dan membantu menyeimbangkan cara kualitas inti diekspresikan. Dalam hubungan atau kolaborasi, dukungan terasa ketika ada ruang untuk ${gift}. Analog menggambarkan pola saling melengkapi, bukan jaminan kompatibilitas.`,
    },
    antipode: {
      label: "Antipode",
      short: `${seal.name} menghadirkan polaritas yang memperluas kapasitasmu.`,
      full: `Polaritas ${keyword} dapat terasa sebagai gesekan karena mengajakmu menggunakan cara yang tidak selalu nyaman. Tekanan muncul ketika ${challenge}, tetapi pengalaman ini juga membuka ruang untuk memperluas respons. Antipode bukan musuh atau pertanda buruk; ia adalah simbol latihan integrasi.`,
    },
    occult: {
      label: "Occult",
      short: `${seal.name} menggambarkan sumber daya yang bekerja lebih tenang melalui ${keyword}.`,
      full: `Sumber daya yang tidak selalu langsung terlihat berkaitan dengan ${keyword} dan dapat matang secara perlahan. Kualitas ini menjadi lebih tersedia ketika kamu belajar ${gift}. Occult di sini berarti lapisan simbolik yang tersembunyi, bukan kekuatan rahasia atau kemampuan supernatural.`,
    },
  };
  const config = configs[role];
  return section({ sectionId: role, label: config.label, rawValue: seal.name, displayValue: seal.name, ...shared, shortExplanation: config.short, fullExplanation: config.full });
}

function synthesisSections(
  input: TzolkinPresentationInput,
  identity: ReturnType<typeof identitySections>,
  relationships: Record<OracleRole, TzolkinSectionContract | null>,
) {
  const shared = identity.shared;
  const archetypeThemes = identity.kin && identity.toneSection && identity.sealSection ? section({
    sectionId: "core-archetype", label: "Core Archetype", rawValue: clean(input.kinName), displayValue: clean(input.kinName), ...shared,
    shortExplanation: `Pola intimu menyatukan ${identity.keyword} dengan ritme ${identity.tone.name || "yang khas"}.`,
    fullExplanation: `Cara utama hadir tumbuh dari perpaduan ${identity.keyword} dan ritme ${identity.toneFunction}, sehingga kekuatan dan tempo hidupmu saling membentuk. Bakatmu terlihat saat kamu dapat ${identity.sealGift}. Ekspresi yang matang muncul ketika ${identity.sealChallenge} tidak dihindari, melainkan diolah sebagai umpan balik.`,
  }) : null;
  const giftThemes = isText(input.solarSeal?.gift) || isText(input.galacticTone?.gift) ? section({
    sectionId: "natural-gift", label: "Natural Gift", rawValue: clean(input.solarSeal?.gift || input.galacticTone?.gift), displayValue: "Karunia alami", ...shared,
    shortExplanation: `Karunia alammu tumbuh melalui kemampuan untuk ${identity.sealGift}.`,
    fullExplanation: `Kekuatanmu muncul saat kamu dapat ${identity.sealGift} dan menyalurkannya melalui kemampuan untuk ${identity.toneGift}. Kedua kualitas ini menjadi kontribusi nyata ketika dipakai sesuai kebutuhan, bukan untuk membuktikan nilai diri.`,
  }) : null;
  const challengeThemes = isText(input.solarSeal?.challenge) || isText(input.galacticTone?.shadow) ? section({
    sectionId: "recurring-challenge", label: "Recurring Challenge", rawValue: clean(input.solarSeal?.challenge || input.galacticTone?.shadow), displayValue: "Tantangan berulang", ...shared,
    shortExplanation: `Gesekan berulang muncul ketika ${identity.sealChallenge}.`,
    fullExplanation: `Tantangan lebih mudah muncul ketika ${identity.sealChallenge} atau saat kamu ${identity.toneShadow}. Ini bukan tanda kegagalan, melainkan petunjuk untuk memperlambat respons dan memilih cara yang lebih seimbang.`,
  }) : null;
  const emotionalThemes = challengeThemes ? section({
    sectionId: "emotional-pattern", label: "Emotional Pattern", rawValue: "pressure-and-balance", displayValue: "Tekanan dan keseimbangan", ...shared,
    shortExplanation: "Tekanan batin lebih mudah reda ketika ritme dikenali sebelum respons diberikan.",
    fullExplanation: `Ketika sedang tertekan, pola ${identity.toneShadow} dapat membuat respons terasa lebih sempit atau terburu-buru. Keseimbangan kembali saat kamu memberi nama pada kebutuhan, mengatur tempo, dan tidak menjadikan tantangan sebagai identitas diri. Pola ini adalah refleksi simbolik, bukan diagnosis kesehatan mental atau gangguan batin.`,
  }) : null;
  const relationshipThemes = relationships.analog || relationships.antipode ? section({
    sectionId: "relationship-pattern", label: "Relationship Pattern", rawValue: "symbolic-support-polarity", displayValue: "Dukungan dan batas sehat", ...shared,
    shortExplanation: "Kedekatan tumbuh melalui keseimbangan antara dukungan pelengkap dan keberanian menghadapi perbedaan.",
    fullExplanation: `Dalam hubungan, dukungan terasa ketika kualitas ${relationships.analog?.sealName || "pelengkap"} mendapat ruang tanpa menghapus kebutuhan pribadi. Gesekan dari kualitas ${relationships.antipode?.sealName || "yang berlawanan"} dapat memperjelas batas dan cara bernegosiasi. Timbal balik tumbuh melalui komunikasi dan pilihan sadar, bukan kecocokan yang dijamin oleh simbol.`,
  }) : null;
  const workThemes = identity.sealSection || identity.toneSection ? section({
    sectionId: "work-contribution", label: "Work and Contribution", rawValue: "rhythm-and-gift", displayValue: "Ritme kontribusi", ...shared,
    shortExplanation: `Kontribusimu menguat ketika ${identity.sealGift} dijalankan melalui ritme ${identity.toneFunction}.`,
    fullExplanation: `Cara berkaryamu terasa bermakna ketika kemampuan untuk ${identity.sealGift} bertemu dengan ritme ${identity.toneFunction}. Ide dan tenaga lebih mudah menjadi kontribusi ketika tahapan kerja tidak dipaksakan sekaligus. Gesekan dapat muncul saat ${identity.toneShadow}, tetapi pola ini tidak menentukan satu profesi atau menjanjikan keberhasilan tertentu.`,
  }) : null;
  const growthDirection = identity.toneSection || relationships.occult ? section({
    sectionId: "growth-direction", label: "Growth Direction", rawValue: "integration", displayValue: "Arah pertumbuhan", ...shared,
    shortExplanation: `Pertumbuhan mengajakmu ${identity.toneLesson}.`,
    fullExplanation: `Perjalananmu sering mengajakmu ${identity.toneLesson}, terutama ketika pola lama tidak lagi memberi ruang bagi perkembangan. Sumber daya ${relationships.occult?.sealName || "yang lebih tenang"} dapat membantu jika diberi waktu untuk matang tanpa dibesar-besarkan. Arah dewasa muncul melalui latihan yang konsisten, bukan tuntutan untuk menjadi istimewa.`,
  }) : null;
  return { archetypeThemes, giftThemes, challengeThemes, emotionalThemes, relationshipThemes, workThemes, growthDirection };
}

type HumanSealTheme = {
  presence: string;
  gift: string;
  tension: string;
  connection: string;
  contribution: string;
  balance: string;
};

const HUMAN_SEAL_THEMES: Record<number, HumanSealTheme> = {
  1: { presence: "Kamu mudah melihat awal baru bahkan ketika orang lain masih ragu untuk bergerak", gift: "merawat gagasan sampai cukup kuat untuk tumbuh", tension: "terlalu cepat mengambil tanggung jawab atas kebutuhan semua orang", connection: "kepercayaan tumbuh melalui perhatian yang nyata dan konsisten", contribution: "menciptakan ruang yang membuat orang atau gagasan merasa aman untuk berkembang", balance: "menerima dukungan tanpa merasa kehilangan kemandirian" },
  2: { presence: "Dirimu peka pada kata, suasana, dan pesan yang belum terucapkan", gift: "menyampaikan sesuatu dengan jernih dan menghidupkan percakapan", tension: "terlalu banyak menimbang kata sampai pesan utama menghilang", connection: "kedekatan tumbuh melalui kejujuran dan kesediaan untuk benar-benar mendengar", contribution: "membuat pemahaman menjadi lebih mudah dibagikan", balance: "berbicara dari ketenangan, bukan dari kebutuhan untuk segera dipahami" },
  3: { presence: "Dunia batinmu kaya dan sering menangkap kemungkinan sebelum bentuknya terlihat", gift: "mengubah imajinasi menjadi gambaran yang memberi harapan", tension: "terseret kekhawatiran ketika kepastian belum tersedia", connection: "rasa aman tumbuh bersama orang yang menghormati kepekaan dan ruang hening", contribution: "membantu orang melihat kemungkinan di balik keadaan yang terbatas", balance: "membedakan firasat yang jernih dari ketakutan yang sedang membesar" },
  4: { presence: "Kamu terbiasa melihat potensi yang masih tersembunyi di balik proses", gift: "memberi perhatian yang sabar sampai sesuatu menemukan waktunya", tension: "mendorong pertumbuhan sebelum kesiapan benar-benar terbentuk", connection: "hubungan berkembang saat masing-masing orang diberi ruang untuk berubah", contribution: "menumbuhkan ide dan kemampuan orang lain secara bertahap", balance: "menghargai kemajuan kecil tanpa memaksa hasil" },
  5: { presence: "Kamu hadir dengan tenaga yang langsung, hidup, dan peka pada keadaan sekitar", gift: "mengubah dorongan menjadi tindakan yang berani", tension: "bereaksi terlalu cepat ketika tubuh dan perasaan sedang tegang", connection: "kedekatan terasa sehat ketika ada kejujuran, gairah hidup, dan batas yang jelas", contribution: "menggerakkan keadaan yang terlalu lama diam", balance: "mendengarkan tubuh sebelum memutuskan langkah" },
  6: { presence: "Kamu mampu tetap hadir ketika keadaan sedang berubah atau harus dilepaskan", gift: "membantu proses berakhir dengan lebih jernih dan bermartabat", tension: "bertahan pada sesuatu yang sebenarnya sudah selesai", connection: "kepercayaan tumbuh saat perubahan dapat dibicarakan tanpa saling menahan", contribution: "membuka ruang bagi peralihan yang lebih sehat", balance: "menerima bahwa melepaskan tidak selalu berarti kehilangan" },
  7: { presence: "Kamu cenderung memahami hidup melalui tindakan dan pengalaman langsung", gift: "menyelesaikan sesuatu dengan keterampilan yang terasah", tension: "mengukur nilai diri hanya dari seberapa banyak yang berhasil diselesaikan", connection: "dukungan terasa melalui kerja sama yang konkret dan dapat diandalkan", contribution: "mengubah pengetahuan menjadi sesuatu yang benar-benar berguna", balance: "beristirahat sebelum kelelahan mengaburkan arah" },
  8: { presence: "Kepekaanmu mudah menangkap keindahan, keteraturan, dan bagian yang belum selaras", gift: "menciptakan harmoni tanpa menghilangkan keunikan", tension: "menuntut kesempurnaan ketika keadaan hanya membutuhkan perbaikan kecil", connection: "kedekatan tumbuh dalam suasana yang hangat, indah, dan saling menghargai", contribution: "membawa rasa, bentuk, dan keseimbangan ke dalam pekerjaan", balance: "menerima bahwa sesuatu tetap bermakna meski belum sempurna" },
  9: { presence: "Perasaanmu bergerak dalam dan membuatmu cepat menangkap perubahan suasana", gift: "membiarkan emosi mengalir menjadi pemahaman", tension: "menahan terlalu lama atau tenggelam dalam perasaan yang belum diberi nama", connection: "hubungan terasa aman ketika emosi dapat hadir tanpa dihakimi", contribution: "membantu suasana yang berat kembali bergerak", balance: "memberi ruang pada perasaan tanpa membiarkannya menentukan seluruh arah" },
  10: { presence: "Kamu membawa kehangatan dan kesetiaan yang terasa nyata bagi orang terdekat", gift: "menjaga hubungan dengan ketulusan dan perhatian", tension: "melupakan kebutuhan sendiri demi mempertahankan kedekatan", connection: "kepercayaan tumbuh melalui kesetiaan yang tetap menghormati kebebasan", contribution: "menciptakan rasa kebersamaan yang manusiawi", balance: "menetapkan batas tanpa menutup hati" },
  11: { presence: "Kamu mudah membawa keluwesan dan sudut pandang segar ke dalam suasana yang kaku", gift: "menggunakan kreativitas dan humor untuk membuka kemungkinan", tension: "menutupi hal penting dengan kesibukan atau candaan", connection: "kedekatan tumbuh saat ada ruang untuk bermain sekaligus berbicara jujur", contribution: "membuat proses belajar dan bekerja terasa lebih hidup", balance: "tetap ringan tanpa menghindari kedalaman" },
  12: { presence: "Kamu memiliki dorongan kuat untuk memilih jalan berdasarkan pemahamanmu sendiri", gift: "mengambil keputusan dengan pertimbangan yang matang", tension: "menjadi terlalu yakin hingga sulit menerima sudut pandang lain", connection: "hubungan berkembang ketika kebebasan dan tanggung jawab berjalan bersama", contribution: "membantu orang melihat pilihan dengan lebih sadar", balance: "mendengarkan masukan tanpa menyerahkan kendali atas keputusan pribadi" },
  13: { presence: "Kamu terdorong memperluas ruang hidup dan menjelajahi hal yang belum dikenal", gift: "membuka jalan menuju pengalaman dan wawasan baru", tension: "terus bergerak hingga kehilangan tempat untuk berakar", connection: "kedekatan tumbuh bersama orang yang memberi ruang tanpa menjauh", contribution: "membawa perspektif baru ke dalam lingkungan yang terbiasa dengan pola lama", balance: "menjaga keberanian menjelajah sambil tetap memiliki pijakan" },
  14: { presence: "Daya hadirmu tenang dan kuat ketika kamu tidak berusaha mengendalikan setiap keadaan", gift: "menerima pengalaman dengan perhatian yang utuh", tension: "menahan orang atau hasil karena takut kehilangan kendali", connection: "kepercayaan tumbuh melalui kesabaran dan penerimaan yang tidak pasif", contribution: "menciptakan ruang hening yang membantu orang melihat lebih jernih", balance: "membedakan penerimaan dari menyerah" },
  15: { presence: "Kamu cenderung melihat gambaran besar dan arah yang belum tampak bagi banyak orang", gift: "mengubah pengamatan luas menjadi visi yang dapat dipahami", tension: "terlalu fokus pada kekurangan hingga kehilangan harapan", connection: "hubungan terasa mendukung ketika gagasan besar dapat dibicarakan dengan tetap berpijak", contribution: "memberi arah dan kemungkinan baru tanpa mengabaikan kenyataan", balance: "membawa visi kembali pada satu langkah yang dapat dilakukan hari ini" },
  16: { presence: "Kamu memiliki keberanian untuk mempertanyakan hal yang tidak lagi terasa benar", gift: "menggunakan kecerdasan untuk menembus kebingungan", tension: "menjadi defensif ketika keyakinanmu diuji", connection: "kedekatan berkembang melalui keberanian untuk berbeda tanpa merendahkan", contribution: "membantu keputusan dibuat dengan lebih jujur dan cermat", balance: "mempertahankan ketegasan tanpa menutup diri dari koreksi" },
  17: { presence: "Kamu peka pada waktu, perubahan kecil, dan hubungan antara satu peristiwa dengan yang lain", gift: "menemukan langkah yang selaras dengan keadaan nyata", tension: "merasa tersesat ketika tanda dari luar tidak segera terlihat", connection: "dukungan terasa dari orang yang membantu menjaga pijakan dan arah", contribution: "menghubungkan gagasan dengan kebutuhan yang benar-benar ada", balance: "kembali pada tubuh, lingkungan, dan hal yang dapat disentuh" },
  18: { presence: "Kamu membawa kejernihan yang membuat hal rumit lebih mudah terlihat apa adanya", gift: "memilah informasi dan menunjukkan inti persoalan", tension: "mengubah ketelitian menjadi kritik yang terlalu tajam", connection: "kepercayaan tumbuh melalui kejujuran yang tetap memiliki kelembutan", contribution: "membantu orang melihat pola dan mengambil keputusan dengan lebih jernih", balance: "menyampaikan kebenaran tanpa menghilangkan rasa hormat" },
  19: { presence: "Tenagamu kuat saat keadaan membutuhkan pembaruan dan keberanian untuk berubah", gift: "menggerakkan proses yang mandek menuju bentuk baru", tension: "mendorong perubahan begitu keras hingga tubuh dan hubungan kehilangan waktu untuk menyesuaikan", connection: "kedekatan tumbuh ketika perubahan dijalani bersama, bukan dipaksakan", contribution: "membantu sistem lama menemukan cara kerja yang lebih hidup", balance: "memberi jeda agar perubahan dapat berakar" },
  20: { presence: "Kamu memiliki daya hadir yang hangat, terang, dan mudah memengaruhi suasana di sekitarmu", gift: "melihat sesuatu sampai ke inti lalu membagikan pemahaman dengan murah hati", tension: "membawa standar terlalu tinggi dan merasa harus selalu tampak utuh", connection: "kedekatan tumbuh melalui ketulusan, kejujuran, dan penerimaan yang tidak dibuat-buat", contribution: "membawa kejelasan dan kehangatan ke dalam hal-hal yang nyata", balance: "membiarkan diri tetap manusiawi tanpa mengecilkan cahaya yang kamu bawa" },
};

const HUMAN_TONE_THEMES: Record<number, { rhythm: string; tension: string; growth: string }> = {
  1: { rhythm: "menyatukan perhatian pada satu tujuan yang benar-benar penting", tension: "mudah kehilangan arah ketika terlalu banyak hal meminta perhatian", growth: "memilih satu niat dan menjaganya melalui langkah sederhana" },
  2: { rhythm: "mengenali perbedaan sebelum menemukan titik keseimbangan", tension: "terlalu lama terjebak antara dua pilihan", growth: "menggunakan ketegangan sebagai informasi, bukan alasan untuk berhenti" },
  3: { rhythm: "bergerak melalui keterlibatan dan tindakan yang memberi manfaat", tension: "tenaga mudah tersebar karena ingin merespons semuanya", growth: "menyalurkan energi pada bentuk kontribusi yang paling nyata" },
  4: { rhythm: "membentuk batas dan struktur agar gagasan dapat berdiri", tension: "menjadi kaku ketika rencana berubah", growth: "membuat kerangka yang cukup kuat sekaligus tetap lentur" },
  5: { rhythm: "mengumpulkan daya dan sumber daya sebelum mengambil peran", tension: "mengendalikan terlalu banyak karena takut kehilangan pengaruh", growth: "menggunakan kekuatan untuk menguatkan, bukan menekan" },
  6: { rhythm: "menata kehidupan melalui keseimbangan, pengulangan, dan ritme", tension: "merasa kewalahan ketika rutinitas kehilangan keluwesan", growth: "mengatur ulang tempo tanpa menyalahkan diri" },
  7: { rhythm: "menangkap inspirasi melalui kepekaan dan perhatian yang dalam", tension: "sulit membedakan pesan batin dari kebisingan sesaat", growth: "kembali pada ketenangan sebelum memberi makna pada pengalaman" },
  8: { rhythm: "menyelaraskan tindakan dengan nilai yang benar-benar diyakini", tension: "merasa terpecah ketika pilihan tidak sesuai dengan prinsip pribadi", growth: "membuat tindakan kecil yang konsisten dengan nilai utama" },
  9: { rhythm: "menggerakkan hidup melalui niat yang terarah", tension: "kehilangan momentum ketika tujuan bercampur dengan terlalu banyak keinginan", growth: "menjernihkan alasan sebelum menambah usaha" },
  10: { rhythm: "membawa gagasan menuju hasil yang dapat dilihat dan digunakan", tension: "perfeksionisme membuat penyelesaian terasa selalu kurang", growth: "menyelesaikan dengan baik tanpa menunggu semuanya sempurna" },
  11: { rhythm: "melepaskan bentuk lama agar ruang baru dapat muncul", tension: "membongkar terlalu cepat sebelum memahami apa yang masih berguna", growth: "melepaskan dengan sadar sambil menjaga pelajaran yang penting" },
  12: { rhythm: "bertumbuh melalui kerja sama dan pertukaran pemahaman", tension: "kehilangan suara pribadi demi menjaga kebersamaan", growth: "berkontribusi pada kelompok tanpa meninggalkan kebutuhan diri" },
  13: { rhythm: "menuntaskan pengalaman sambil tetap hadir penuh pada prosesnya", tension: "sulit beristirahat karena merasa masih ada yang harus disempurnakan", growth: "menerima akhir sebagai bagian dari ritme dan memberi tubuh waktu untuk pulih" },
};

const HUMAN_CASTLE_DIRECTIONS: Record<string, string> = {
  "Kastil Timur Merah": "berani memulai sambil membangun dasar yang cukup kuat",
  "Kastil Utara Putih": "memilah yang masih penting dan melepaskan beban yang tidak lagi diperlukan",
  "Kastil Barat Biru": "mengubah tekanan menjadi pembaruan yang lebih jujur",
  "Kastil Selatan Kuning": "membagikan hasil dan pengetahuan tanpa menghabiskan diri",
  "Kastil Tengah Hijau": "menyatukan kehadiran, keindahan, dan makna ke dalam keseharian",
};

const DEFAULT_HUMAN_SEAL_THEME = HUMAN_SEAL_THEMES[18];
const DEFAULT_HUMAN_TONE_THEME = HUMAN_TONE_THEMES[6];

function humanSealTheme(number: number | null | undefined): HumanSealTheme {
  return number ? HUMAN_SEAL_THEMES[number] || DEFAULT_HUMAN_SEAL_THEME : DEFAULT_HUMAN_SEAL_THEME;
}

function humanToneTheme(number: number | null | undefined) {
  return number ? HUMAN_TONE_THEMES[number] || DEFAULT_HUMAN_TONE_THEME : DEFAULT_HUMAN_TONE_THEME;
}

function buildSummary(
  identity: ReturnType<typeof identitySections>,
  cycles: ReturnType<typeof cycleSections>,
  relationships: Record<OracleRole, TzolkinSectionContract | null>,
  complete: boolean,
): string[] {
  const core = humanSealTheme(identity.seal.number);
  const rhythm = humanToneTheme(identity.tone.number);
  const support = humanSealTheme(relationships.analog?.sealNumber || relationships.guide?.sealNumber);
  const challenge = humanSealTheme(relationships.antipode?.sealNumber);
  const hidden = humanSealTheme(relationships.occult?.sealNumber);
  const p1 = `${core.presence}. Cara alammu bergerak adalah dengan ${rhythm.rhythm}. Dirimu terasa paling selaras ketika dapat ${core.gift} tanpa memaksa diri memenuhi gambaran yang terlalu sempurna.`;
  const p2 = `Dalam hubungan, ${core.connection}. Lingkungan yang mendukungmu biasanya memberi ruang untuk ${support.gift} sambil tetap menghormati batas pribadi. Perbedaan dapat menjadi berguna ketika kamu mampu ${challenge.balance} dan memberi orang lain kesempatan melakukan hal yang sama.`;
  const p3 = `Tekanan berulang muncul saat kamu ${core.tension} atau ketika ${rhythm.tension}. Di balik situasi itu, ada kekuatan yang tumbuh perlahan melalui kemampuan untuk ${hidden.gift}. Keseimbangan kembali ketika kamu dapat ${hidden.balance} serta ${rhythm.growth}.`;
  if (!complete) return [p1, p2, p3];
  const matureDirection = isText(cycles.castle?.rawValue) ? HUMAN_CASTLE_DIRECTIONS[cycles.castle.rawValue] : null;
  const p4 = `Arah pertumbuhanmu mengajakmu ${matureDirection || rhythm.growth}. Kontribusimu menjadi bermakna ketika kamu dapat ${core.contribution} dan membiarkan hasilnya berguna bagi kehidupan sehari-hari. Langkah paling membumi adalah ${core.balance}, menjaga ritme yang dapat dipertahankan, dan memberi perubahan waktu untuk berakar.`;
  return [p1, p2, p3, p4];
}

export function buildTzolkinPresentation(input: TzolkinPresentationInput | null | undefined): TzolkinPresentation {
  const emptyContract: TzolkinIdentityReadContract = {
    kin: null, kinNumber: null, galacticSignature: null, tone: null, toneNumber: null, seal: null, sealNumber: null,
    color: null, wavespell: null, castle: null, guide: null, analog: null, antipode: null, occult: null,
    isGap: null, gap: null, archetypeThemes: null, giftThemes: null, challengeThemes: null, emotionalThemes: null,
    relationshipThemes: null, workThemes: null, growthDirection: null, summary: [],
    sourceVersion: TZOLKIN_PRESENTATION_SOURCE_VERSION, sourceClassification: SOURCE_CLASSIFICATION,
  };
  const unavailable: TzolkinPresentation = {
    status: "unavailable", canonicalName: "Tzolkin",
    hero: { title: "Kalender Kesadaran Maya", kin: null, galacticSignature: null, tone: null, seal: null, insight: "Lengkapi tanggal kelahiran untuk membuka pembacaan Tzolkin.", action: "Lihat detail selengkapnya" },
    profileCard: { title: "Tzolkin Maya", kin: null, tone: null, seal: null, insight: "Kode waktu dan ritme kesadaran dari kalender sakral Maya.", action: "Lihat detail selengkapnya", href: "/blueprint/tzolkin" },
    groups: [], readContract: emptyContract, summary: [], summaryText: "", sourceVersion: TZOLKIN_PRESENTATION_SOURCE_VERSION,
  };
  if (!input || typeof input !== "object") return unavailable;

  const identity = identitySections(input);
  const cycles = cycleSections(input, identity.shared);
  const relationships = {
    guide: oracleSection("guide", input.oracle, identity.kinNumber),
    analog: oracleSection("analog", input.oracle, identity.kinNumber),
    antipode: oracleSection("antipode", input.oracle, identity.kinNumber),
    occult: oracleSection("occult", input.oracle, identity.kinNumber),
  };
  const synthesis = synthesisSections(input, identity, relationships);
  const core = [identity.kin, identity.galacticSignature, identity.toneSection, identity.sealSection].filter(Boolean).length;
  const optional = [cycles.wavespell, cycles.castle, relationships.guide, relationships.analog, relationships.antipode, relationships.occult].filter(Boolean).length;
  const status = core === 4 && optional === 6 ? "complete" : core > 0 ? "partial" : "unavailable";
  if (status === "unavailable") return unavailable;
  const summary = buildSummary(identity, cycles, relationships, status === "complete");
  const readContract: TzolkinIdentityReadContract = {
    kin: identity.kin, kinNumber: identity.kinNumber, galacticSignature: identity.galacticSignature,
    tone: identity.toneSection, toneNumber: identity.tone.number, seal: identity.sealSection,
    sealNumber: identity.seal.number, color: isText(input.color) ? input.color : identity.seal.color,
    wavespell: cycles.wavespell, castle: cycles.castle, guide: relationships.guide, analog: relationships.analog,
    antipode: relationships.antipode, occult: relationships.occult, isGap: typeof input.gap === "boolean" ? input.gap : null,
    gap: cycles.gap, ...synthesis, summary, sourceVersion: TZOLKIN_PRESENTATION_SOURCE_VERSION,
    sourceClassification: SOURCE_CLASSIFICATION,
  };
  const compact = (items: Array<TzolkinSectionContract | null>) => items.filter((item): item is TzolkinSectionContract => Boolean(item));
  const groups: TzolkinSectionGroup[] = [
    { groupId: "galactic-identity", title: "Identitas Galaktikmu", sections: compact([identity.kin, identity.galacticSignature, identity.toneSection, identity.sealSection]) },
    { groupId: "journey-rhythm", title: "Irama Perjalananmu", sections: compact([cycles.wavespell, cycles.castle, cycles.gap]) },
    { groupId: "energy-directions", title: "Arah Energi di Sekitarmu", sections: compact([relationships.guide, relationships.analog, relationships.antipode, relationships.occult]) },
    { groupId: "gifts-challenges", title: "Karunia dan Tantangan", sections: compact([synthesis.archetypeThemes, synthesis.giftThemes, synthesis.challengeThemes, synthesis.emotionalThemes]) },
    { groupId: "relation-work-growth", title: "Relasi, Karya, dan Pertumbuhan", sections: compact([synthesis.relationshipThemes, synthesis.workThemes, synthesis.growthDirection]) },
  ].filter((group) => group.sections.length > 0);
  const insight = `Kamu membawa kualitas ${identity.keyword} melalui ritme ${identity.tone.name || "yang khas"}, dengan kekuatan yang muncul saat ${identity.sealGift}.`;
  return {
    status, canonicalName: "Tzolkin",
    hero: {
      title: "Kalender Kesadaran Maya", kin: identity.kin?.displayValue || null,
      galacticSignature: identity.galacticSignature?.displayValue || null,
      tone: identity.toneSection?.displayValue || null, seal: identity.sealSection?.displayValue || null,
      insight, action: "Lihat detail selengkapnya",
    },
    profileCard: {
      title: "Tzolkin Maya", kin: identity.kin?.displayValue || null, tone: identity.toneSection?.displayValue || null,
      seal: identity.sealSection?.displayValue || null, insight, action: "Lihat detail selengkapnya", href: "/blueprint/tzolkin",
    },
    groups, readContract, summary, summaryText: summary.join("\n\n"), sourceVersion: TZOLKIN_PRESENTATION_SOURCE_VERSION,
  };
}
