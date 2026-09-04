import { SOLAR_SEALS } from "./dictionaries";
import type { GalacticTone, SolarSeal, TzolkinBlueprint, TzolkinOracle } from "./types";
import { isEnlEdition } from "@/lib/config/edition";

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
  return isText(value) ? value.replace(/\s*\((?:OC|Cauac|Ahau|Akbal|GAP)\)/gi, "").replace(/\s+/g, " ").trim().replace(/[.。]+$/g, "") : "";
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

function identitySections(input: TzolkinPresentationInput, isEn = false) {
  const kinNumber = validKin(input.kin) ? input.kin : null;
  const tone = toneIdentity(input.galacticTone);
  const seal = sealIdentity(input.solarSeal);
  const shared = baseFields({ kinNumber, toneNumber: tone.number, toneName: tone.name, sealNumber: seal.number, sealName: seal.name, color: seal.color, direction: seal.direction });
  const keyword = safeMeaning(input.solarSeal?.keyword) || (isEn ? "archetypal quality" : "kualitas arketipal yang tersimpan");
  const sealGift = safeMeaning(input.solarSeal?.gift) || (isEn ? "express natural strength consciously" : "menggunakan kekuatan alaminya secara sadar");
  const sealChallenge = safeMeaning(input.solarSeal?.challenge) || (isEn ? "maintain balanced responses" : "menjaga respons tetap seimbang");
  const toneFunction = safeMeaning(input.galacticTone?.function) || (isEn ? "distinct rhythm" : "ritme yang khas");
  const toneGift = safeMeaning(input.galacticTone?.gift) || (isEn ? "organize energy according to need" : "menata energi sesuai kebutuhan");
  const toneShadow = safeMeaning(input.galacticTone?.shadow) || (isEn ? "lose rhythm under rising pressure" : "kehilangan ritme ketika tekanan meningkat");
  const toneLesson = safeMeaning(input.galacticTone?.lesson) || (isEn ? "return to aligned cadence" : "kembali pada langkah yang selaras");

  const kin = kinNumber ? section({
    sectionId: "kin", label: "Kin", rawValue: kinNumber, displayValue: `Kin ${kinNumber}`, ...shared,
    shortExplanation: isEn
      ? `Kin ${kinNumber} unites the rhythm of ${tone.name || "the tone"} and the archetype of ${seal.name || "the seal"}.`
      : `Kin ${kinNumber} menyatukan ritme ${tone.name || "yang tersedia"} dan arketipe ${seal.name || "yang tersedia"}.`,
    fullExplanation: isEn
      ? `Your identity pattern brings together the rhythm of ${tone.name || "the tone"} with the quality of ${keyword}, giving you a distinctive tempo through experience. Your strength emerges when you can ${sealGift}, while friction may be felt when ${sealChallenge}. The Kin number marks your position in the cycle, not a rigid destiny.`
      : `Pola identitasmu mempertemukan ritme ${tone.name || "yang tersedia"} dengan kualitas ${keyword}, sehingga kamu cenderung bergerak melalui pengalaman dengan tempo yang khas. Kekuatanmu muncul saat kamu dapat ${sealGift}, sementara gesekan dapat terasa ketika ${sealChallenge}. Nomor Kin adalah penanda posisi dalam siklus, bukan penentu nasib.`,
  }) : null;

  const galacticSignature = isText(input.kinName) ? section({
    sectionId: "galactic-signature", label: "Galactic Signature", rawValue: input.kinName,
    displayValue: clean(input.kinName), ...shared,
    shortExplanation: isEn
      ? `Galactic Signature blends ${tone.name || "rhythm"} and ${seal.name || "archetype"} into one canonical identity.`
      : `Galactic Signature memadukan ${tone.name || "ritme"} dan ${seal.name || "arketipe"} dalam satu identitas canonical.`,
    fullExplanation: isEn
      ? `This combination allows the quality of ${keyword} to express through channels related to ${toneFunction}. The gift of ${sealGift} becomes more focused when life's cadence is not rushed and each stage receives sufficient room.`
      : `Kombinasi ini membuat kualitas ${keyword} diekspresikan melalui cara yang berhubungan dengan ${toneFunction}. Bakat ${sealGift} menjadi lebih terarah ketika ritme hidup tidak dipaksakan dan setiap tahap diberi ruang yang cukup.`,
  }) : null;

  const toneSection = tone.number && tone.name ? section({
    sectionId: "galactic-tone", label: "Galactic Tone", rawValue: clean(input.galacticTone?.name),
    displayValue: `${tone.number} · ${tone.name}`, ...shared,
    shortExplanation: isEn
      ? `Galactic Tone ${tone.number} ${tone.name} carries the rhythm of ${toneFunction}.`
      : `Galactic Tone ${tone.number} ${tone.name} membawa ritme ${toneFunction}.`,
    fullExplanation: isEn
      ? `You tend to organize your engagement with life through ${toneFunction}, guiding how you initiate, structure, sustain, or complete things. Your strength unfolds through the ability to ${toneGift}. When ${toneShadow}, the invitation is to ${toneLesson}.`
      : `Kamu cenderung mengatur keterlibatan dengan kehidupan melalui ${toneFunction}, yang membantu menentukan cara memulai, menata, mempertahankan, atau menyelesaikan sesuatu. Kekuatanmu muncul melalui kemampuan untuk ${toneGift}. Ketika ${toneShadow}, undangannya adalah ${toneLesson}.`,
  }) : null;

  const sealSection = seal.name ? section({
    sectionId: "solar-seal", label: "Solar Seal", rawValue: seal.name, displayValue: seal.name, ...shared,
    shortExplanation: isEn
      ? `Solar Seal ${seal.name} brings focus to ${keyword}.`
      : `Solar Seal ${seal.name} membawa perhatian pada ${keyword}.`,
    fullExplanation: isEn
      ? `There is an archetypal quality centered on ${keyword} visible in how you respond to your surroundings. Its natural gift is ${sealGift}, while the aspect to balance is ${sealChallenge}. This expression matures when held with awareness and not treated as a rigid identity.`
      : `Ada kualitas arketipal yang berpusat pada ${keyword} dan terlihat melalui cara kamu merespons lingkungan. Bakat alaminya adalah ${sealGift}, sementara sisi yang perlu dijaga adalah ${sealChallenge}. Ekspresi ini semakin matang ketika digunakan dengan kesadaran dan tidak diperlakukan sebagai identitas yang kaku.`,
  }) : null;

  return { kinNumber, tone, seal, shared, keyword, sealGift, sealChallenge, toneFunction, toneGift, toneShadow, toneLesson, kin, galacticSignature, toneSection, sealSection };
}

function cycleSections(input: TzolkinPresentationInput, shared: ReturnType<typeof baseFields>, isEn = false) {
  const wavespell = isText(input.wavespell?.name) ? section({
    sectionId: "wavespell", label: "Wavespell", rawValue: input.wavespell.name, displayValue: clean(input.wavespell.name), ...shared,
    shortExplanation: isEn
      ? `This Wavespell carries the thematic field of ${safeMeaning(input.wavespell.theme) || "gradual evolution"}.`
      : `Wavespell ini membawa medan tematik ${safeMeaning(input.wavespell.theme) || "perkembangan bertahap"}.`,
    fullExplanation: isEn
      ? `The journey surrounding your Kin unfolds under the theme of ${safeMeaning(input.wavespell.theme) || "gradual evolution"}, a symbolic cycle offering wider context to lived experience. ${clean(input.wavespell.meaning) || "Each stage invites core qualities to evolve through sequential steps"}. The practical invitation is to ${safeMeaning(input.wavespell.growthDirection).replace(/^menuju\s+/, "") || "embrace the process without forcing immediate outcomes"}.`
      : `Perjalanan yang mengelilingi Kin-mu bergerak dalam tema ${safeMeaning(input.wavespell.theme) || "perkembangan bertahap"}, sebuah rangkaian simbolik yang memberi konteks lebih luas pada pengalaman. ${clean(input.wavespell.meaning) || "Setiap tahap mengajak kualitas inti berkembang melalui proses yang berurutan"}. Undangan praktisnya adalah ${safeMeaning(input.wavespell.growthDirection).replace(/^menuju\s+/, "") || "menjalani proses tanpa memaksakan hasil"}.`,
  }) : null;
  const castle = isText(input.castle?.name) ? section({
    sectionId: "castle", label: "Castle", rawValue: input.castle.name, displayValue: clean(input.castle.name), ...shared,
    shortExplanation: isEn
      ? `This Castle provides the symbolic atmosphere of ${safeMeaning(input.castle.theme) || "evolution within a wider cycle"}.`
      : `Castle ini memberi atmosfer simbolik ${safeMeaning(input.castle.theme) || "perkembangan dalam siklus yang lebih besar"}.`,
    fullExplanation: isEn
      ? `${clean(input.castle.name)} is a 52-day symbolic domain, not a literal cosmic locale. Its atmosphere relates to ${safeMeaning(input.castle.meaning).replace(/[.!?]+\s+/g, ", ") || "movement through broader developmental phases"}. In daily life, it invites you to ${safeMeaning(input.castle.spiritualLesson).replace(/^mempelajari cara\s+/, "") || "ground its lesson into livable steps"}.`
      : `${clean(input.castle.name)} adalah domain simbolik 52 hari, bukan lokasi kosmis yang literal. Atmosfernya berkaitan dengan ${safeMeaning(input.castle.meaning).replace(/[.!?]+\s+/g, ", ") || "gerak melalui tahap perkembangan yang lebih luas"}. Dalam keseharian, temanya mengajakmu ${safeMeaning(input.castle.spiritualLesson).replace(/^mempelajari cara\s+/, "") || "membumikan pelajaran menjadi langkah yang dapat dijalani"}.`,
  }) : null;
  const gap = input.gap === true ? section({
    sectionId: "galactic-activation-portal", label: "Galactic Activation Portal", rawValue: true,
    displayValue: "Galactic Activation Portal · GAP", ...shared,
    shortExplanation: isEn
      ? "GAP is a canonical symbolic classification in the Tzolkin matrix."
      : "GAP adalah klasifikasi simbolik canonical dalam sistem Tzolkin.",
    fullExplanation: isEn
      ? "Galactic Activation Portal is a classification for specific positions within the Tzolkin grid. This marker invites mindful attunement to experiential intensity, but conveys no supernatural abilities, special shields, or elevated status."
      : "Galactic Activation Portal adalah klasifikasi pola tertentu di dalam matriks Tzolkin. Status ini dapat dipakai sebagai undangan untuk lebih sadar terhadap intensitas pengalaman, tetapi tidak memberi kekuatan paranormal, perlindungan khusus, atau kedudukan yang lebih tinggi.",
  }) : null;
  return { wavespell, castle, gap };
}

type OracleRole = "guide" | "analog" | "antipode" | "occult";

function oracleSection(role: OracleRole, oracle: DeepPartial<TzolkinOracle> | undefined, kinNumber: number | null, isEn = false): TzolkinSectionContract | null {
  const value = oracle?.[role];
  const seal = sealIdentity(value?.seal);
  if (!seal.name) return null;
  const tone = toneIdentity(value?.tone);
  const shared = baseFields({ kinNumber, toneNumber: tone.number, toneName: tone.name, sealNumber: seal.number, sealName: seal.name, color: seal.color, direction: seal.direction });
  const keyword = safeMeaning(value?.seal?.keyword) || (isEn ? "supporting quality" : "kualitas pendukung");
  const gift = safeMeaning(value?.seal?.gift) || (isEn ? "use this quality mindfully" : "menggunakan kualitas ini secara sadar");
  const challenge = safeMeaning(value?.seal?.challenge) || (isEn ? "keep this quality balanced" : "menjaga kualitas ini tetap seimbang");
  const configs: Record<OracleRole, { label: string; short: string; full: string }> = {
    guide: {
      label: "Guide",
      short: isEn ? `${seal.name} aids orientation through the quality of ${keyword}.` : `${seal.name} membantu orientasi melalui kualitas ${keyword}.`,
      full: isEn
        ? `The direction that supports you grows through the quality of ${keyword}, especially when reconnecting with decisions that feel aligned. Its tangible expression is to ${gift}. The Guide is read as behavioral orientation, not an external entity governing your journey.`
        : `Arah yang mendukungmu tumbuh melalui kualitas ${keyword}, terutama ketika kamu perlu kembali pada keputusan yang terasa selaras. Bentuk nyatanya adalah ${gift}. Guide dibaca sebagai orientasi perilaku, bukan makhluk eksternal yang mengendalikan jalanmu.`,
    },
    analog: {
      label: "Analog",
      short: isEn ? `${seal.name} brings complementary energy through ${keyword}.` : `${seal.name} membawa energi pelengkap melalui ${keyword}.`,
      full: isEn
        ? `Your complementary energy operates through ${keyword} and helps balance how core qualities express. In relationships or collaboration, support is felt when there is room to ${gift}. Analog represents complementary patterns, not a guarantee of relationship ease.`
        : `Energi pelengkapmu bekerja melalui ${keyword} dan membantu menyeimbangkan cara kualitas inti diekspresikan. Dalam hubungan atau kolaborasi, dukungan terasa ketika ada ruang untuk ${gift}. Analog menggambarkan pola saling melengkapi, bukan jaminan kompatibilitas.`,
    },
    antipode: {
      label: "Antipode",
      short: isEn ? `${seal.name} introduces a polarity that expands your range.` : `${seal.name} menghadirkan polaritas yang memperluas kapasitasmu.`,
      full: isEn
        ? `The polarity of ${keyword} can feel like friction because it challenges you beyond habitual comfort. Strain arises when ${challenge}, yet this dynamic expands your response repertoire. The Antipode is neither foe nor omen; it is a symbol of integration practice.`
        : `Polaritas ${keyword} dapat terasa sebagai gesekan karena mengajakmu menggunakan cara yang tidak selalu nyaman. Tekanan muncul ketika ${challenge}, tetapi pengalaman ini juga membuka ruang untuk memperluas respons. Antipode bukan musuh atau pertanda buruk; ia adalah simbol latihan integrasi.`,
    },
    occult: {
      label: "Occult",
      short: isEn ? `${seal.name} reflects a quieter resource unfolding through ${keyword}.` : `${seal.name} menggambarkan sumber daya yang bekerja lebih tenang melalui ${keyword}.`,
      full: isEn
        ? `A resource that may not be immediately obvious relates to ${keyword} and matures at its own quiet pace. This quality becomes available as you learn to ${gift}. Occult here signifies an unforced, subtle symbolic layer, not hidden occult power or psychic skill.`
        : `Sumber daya yang tidak selalu langsung terlihat berkaitan dengan ${keyword} dan dapat matang secara perlahan. Kualitas ini menjadi lebih tersedia ketika kamu belajar ${gift}. Occult di sini berarti lapisan simbolik yang tersembunyi, bukan kekuatan rahasia atau kemampuan supernatural.`,
    },
  };
  const config = configs[role];
  return section({ sectionId: role, label: config.label, rawValue: seal.name, displayValue: seal.name, ...shared, shortExplanation: config.short, fullExplanation: config.full });
}

function synthesisSections(
  input: TzolkinPresentationInput,
  identity: ReturnType<typeof identitySections>,
  relationships: Record<OracleRole, TzolkinSectionContract | null>,
  isEn = false,
) {
  const shared = identity.shared;
  const archetypeThemes = identity.kin && identity.toneSection && identity.sealSection ? section({
    sectionId: "core-archetype", label: "Core Archetype", rawValue: clean(input.kinName), displayValue: clean(input.kinName), ...shared,
    shortExplanation: isEn
      ? `Your core pattern unites ${identity.keyword} with the rhythm of ${identity.tone.name || "the tone"}.`
      : `Pola intimu menyatukan ${identity.keyword} dengan ritme ${identity.tone.name || "yang khas"}.`,
    fullExplanation: isEn
      ? `Your primary way of being arises from weaving ${identity.keyword} with the rhythm of ${identity.toneFunction}, so your strength and life tempo mutually shape each other. Your gift shines when you can ${identity.sealGift}. Mature expression comes when ${identity.sealChallenge} is not evaded, but welcomed as constructive feedback.`
      : `Cara utama hadir tumbuh dari perpaduan ${identity.keyword} dan ritme ${identity.toneFunction}, sehingga kekuatan dan tempo hidupmu saling membentuk. Bakatmu terlihat saat kamu dapat ${identity.sealGift}. Ekspresi yang matang muncul ketika ${identity.sealChallenge} tidak dihindari, melainkan diolah sebagai umpan balik.`,
  }) : null;
  const giftThemes = isText(input.solarSeal?.gift) || isText(input.galacticTone?.gift) ? section({
    sectionId: "natural-gift", label: isEn ? "Natural Gift" : "Natural Gift", rawValue: clean(input.solarSeal?.gift || input.galacticTone?.gift), displayValue: isEn ? "Natural gift" : "Karunia alami", ...shared,
    shortExplanation: isEn
      ? `Your natural gift unfolds through your capacity to ${identity.sealGift}.`
      : `Karunia alammu tumbuh melalui kemampuan untuk ${identity.sealGift}.`,
    fullExplanation: isEn
      ? `Your strength shines when you can ${identity.sealGift} and channel it through the ability to ${identity.toneGift}. Both qualities become meaningful contributions when offered according to need, rather than to prove your worth.`
      : `Kekuatanmu muncul saat kamu dapat ${identity.sealGift} dan menyalurkannya melalui kemampuan untuk ${identity.toneGift}. Kedua kualitas ini menjadi kontribusi nyata ketika dipakai sesuai kebutuhan, bukan untuk membuktikan nilai diri.`,
  }) : null;
  const challengeThemes = isText(input.solarSeal?.challenge) || isText(input.galacticTone?.shadow) ? section({
    sectionId: "recurring-challenge", label: "Recurring Challenge", rawValue: clean(input.solarSeal?.challenge || input.galacticTone?.shadow), displayValue: isEn ? "Recurring challenge" : "Tantangan berulang", ...shared,
    shortExplanation: isEn
      ? `Recurring friction surfaces when ${identity.sealChallenge}.`
      : `Gesekan berulang muncul ketika ${identity.sealChallenge}.`,
    fullExplanation: isEn
      ? `Challenges emerge more easily when ${identity.sealChallenge} or when you ${identity.toneShadow}. This is not a failure, but an invitation to soften your pace and respond with greater balance.`
      : `Tantangan lebih mudah muncul ketika ${identity.sealChallenge} atau saat kamu ${identity.toneShadow}. Ini bukan tanda kegagalan, melainkan petunjuk untuk memperlambat respons dan memilih cara yang lebih seimbang.`,
  }) : null;
  const emotionalThemes = challengeThemes ? section({
    sectionId: "emotional-pattern", label: "Emotional Pattern", rawValue: "pressure-and-balance", displayValue: isEn ? "Pressure and balance" : "Tekanan dan keseimbangan", ...shared,
    shortExplanation: isEn
      ? "Inner strain dissolves more easily when rhythm is recognized before reacting."
      : "Tekanan batin lebih mudah reda ketika ritme dikenali sebelum respons diberikan.",
    fullExplanation: isEn
      ? `Under stress, the pattern of ${identity.toneShadow} can make reactions feel contracted or hurried. Equilibrium returns as you name your needs, pace yourself, and refrain from equating challenges with your identity. This pattern is symbolic reflection, not a psychiatric diagnosis.`
      : `Ketika sedang tertekan, pola ${identity.toneShadow} dapat membuat respons terasa lebih sempit atau terburu-buru. Keseimbangan kembali saat kamu memberi nama pada kebutuhan, mengatur tempo, dan tidak menjadikan tantangan sebagai identitas diri. Pola ini adalah refleksi simbolik, bukan diagnosis kesehatan mental atau gangguan batin.`,
  }) : null;
  const relationshipThemes = relationships.analog || relationships.antipode ? section({
    sectionId: "relationship-pattern", label: "Relationship Pattern", rawValue: "symbolic-support-polarity", displayValue: isEn ? "Support and healthy boundaries" : "Dukungan dan batas sehat", ...shared,
    shortExplanation: isEn
      ? "Closeness flourishes through balance between complementary warmth and courage in difference."
      : "Kedekatan tumbuh melalui keseimbangan antara dukungan pelengkap dan keberanian menghadapi perbedaan.",
    fullExplanation: isEn
      ? `In relationship, support is felt when qualities of ${relationships.analog?.sealName || "complementary peers"} have space without compromising personal needs. Friction with ${relationships.antipode?.sealName || "opposing polarities"} clarifies boundaries and honest communication. Reciprocity evolves through conscious choice, not astrological guarantee.`
      : `Dalam hubungan, dukungan terasa ketika kualitas ${relationships.analog?.sealName || "pelengkap"} mendapat ruang tanpa menghapus kebutuhan pribadi. Gesekan dari kualitas ${relationships.antipode?.sealName || "yang berlawanan"} dapat memperjelas batas dan cara bernegosiasi. Timbal balik tumbuh melalui komunikasi dan pilihan sadar, bukan kecocokan yang dijamin oleh simbol.`,
  }) : null;
  const workThemes = identity.sealSection || identity.toneSection ? section({
    sectionId: "work-contribution", label: "Work and Contribution", rawValue: "rhythm-and-gift", displayValue: isEn ? "Contribution rhythm" : "Ritme kontribusi", ...shared,
    shortExplanation: isEn
      ? `Your contribution strengthens when ${identity.sealGift} aligns with the rhythm of ${identity.toneFunction}.`
      : `Kontribusimu menguat ketika ${identity.sealGift} dijalankan melalui ritme ${identity.toneFunction}.`,
    fullExplanation: isEn
      ? `Your work feels meaningful when the ability to ${identity.sealGift} meets the rhythm of ${identity.toneFunction}. Ideas and energy materialize more smoothly when creative stages are not forced at once. Strain can emerge when ${identity.toneShadow}, though this pattern does not prescribe a single career path.`
      : `Cara berkaryamu terasa bermakna ketika kemampuan untuk ${identity.sealGift} bertemu dengan ritme ${identity.toneFunction}. Ide dan tenaga lebih mudah menjadi kontribusi ketika tahapan kerja tidak dipaksakan sekaligus. Gesekan dapat muncul saat ${identity.toneShadow}, tetapi pola ini tidak menentukan satu profesi atau menjanjikan keberhasilan tertentu.`,
  }) : null;
  const growthDirection = identity.toneSection || relationships.occult ? section({
    sectionId: "growth-direction", label: "Growth Direction", rawValue: "integration", displayValue: isEn ? "Growth direction" : "Arah pertumbuhan", ...shared,
    shortExplanation: isEn
      ? `Growth calls you to ${identity.toneLesson}.`
      : `Pertumbuhan mengajakmu ${identity.toneLesson}.`,
    fullExplanation: isEn
      ? `Your journey often invites you to ${identity.toneLesson}, especially when outgrown patterns no longer sustain your growth. The quieter resource of ${relationships.occult?.sealName || "hidden strength"} assists when allowed to ripen without fanfare. Mature navigation emerges through steady practice, not pressure to be extraordinary.`
      : `Perjalananmu sering mengajakmu ${identity.toneLesson}, terutama ketika pola lama tidak lagi memberi ruang bagi perkembangan. Sumber daya ${relationships.occult?.sealName || "yang lebih tenang"} dapat membantu jika diberi waktu untuk matang tanpa dibesar-besarkan. Arah dewasa muncul melalui latihan yang konsisten, bukan tuntutan untuk menjadi istimewa.`,
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

const HUMAN_SEAL_THEMES_EN: Record<number, HumanSealTheme> = {
  1: { presence: "You readily see fresh beginnings even when others hesitate to move", gift: "nurture ideas until they are strong enough to grow", tension: "take responsibility for everyone's needs too quickly", connection: "trust builds through genuine and consistent care", contribution: "create spaces where people and ideas feel safe to flourish", balance: "receive support without feeling a loss of independence" },
  2: { presence: "You are attuned to words, atmosphere, and unspoken messages", gift: "convey messages with clarity and enliven conversation", tension: "over-weigh words until the core message disappears", connection: "closeness grows through honesty and willingness to truly listen", contribution: "make understanding easier to share", balance: "speak from composure rather than an urgent need to be understood" },
  3: { presence: "Your inner world is rich, often perceiving possibilities before they take form", gift: "translate imagination into visions that inspire hope", tension: "get pulled into worry when certainty is not yet available", connection: "safety grows with those who respect sensitivity and quiet space", contribution: "help others see possibilities behind constrained circumstances", balance: "discern clear intuition from expanding fear" },
  4: { presence: "You naturally see latent potential hidden within ongoing processes", gift: "offer patient attention until something finds its proper timing", tension: "push for growth before readiness has genuinely formed", connection: "relationships flourish when each person is given room to evolve", contribution: "gradually cultivate the ideas and capabilities of others", balance: "appreciate small increments of progress without forcing outcomes" },
  5: { presence: "You arrive with direct, vivid energy responsive to your immediate surroundings", gift: "turn instinct into courageous action", tension: "react too quickly when body and feelings are tense", connection: "closeness feels healthy with honesty, vitality, and clear boundaries", contribution: "mobilize situations that have remained stagnant for too long", balance: "listen to the body before deciding on the next step" },
  6: { presence: "You are able to stay present when situations are shifting or must be released", gift: "help endings unfold with greater clarity and dignity", tension: "hold onto what has already concluded", connection: "trust deepens when transitions can be discussed without holding each other back", contribution: "create room for healthier transitions", balance: "accept that letting go does not always mean loss" },
  7: { presence: "You tend to understand life through direct action and hands-on experience", gift: "bring tasks to completion with refined skill", tension: "measure self-worth solely by how much you manage to finish", connection: "support is felt through tangible, dependable collaboration", contribution: "translate knowledge into genuinely useful outcomes", balance: "rest before fatigue clouds your direction" },
  8: { presence: "Your sensitivity readily notices beauty, order, and what is out of harmony", gift: "create harmony without erasing individuality", tension: "demand perfection when a situation only calls for small adjustments", connection: "closeness thrives in warm, beautiful, mutually respectful environments", contribution: "bring aesthetic grace, form, and balance into work", balance: "accept that something can be deeply meaningful even if imperfect" },
  9: { presence: "Your feelings run deep, making you swift to sense emotional shifts", gift: "allow emotion to flow into clarity and understanding", tension: "hold feelings too long or submerge in unnamed emotional currents", connection: "relationships feel safe when emotions can be present without judgment", contribution: "help heavy atmospheres regain movement and ease", balance: "give room to feelings without letting them dictate your entire course" },
  10: { presence: "You bring warmth and loyalty that feels palpable to those closest to you", gift: "tend relationships with heartfelt sincerity and attention", tension: "neglect personal needs in order to preserve closeness", connection: "trust grows through loyalty that honors mutual freedom", contribution: "foster a humane sense of togetherness and belonging", balance: "set healthy boundaries without closing your heart" },
  11: { presence: "You easily bring flexibility and fresh perspectives into rigid atmospheres", gift: "use playfulness and creativity to open new possibilities", tension: "mask important matters with busyness or humor", connection: "closeness flourishes when there is room to play and converse honestly", contribution: "make learning and working feel lively and engaging", balance: "stay lighthearted without avoiding emotional depth" },
  12: { presence: "You have an innate drive to choose paths grounded in your own understanding", gift: "make decisions with mature discernment", tension: "become overly rigid until other perspectives are hard to receive", connection: "relationships flourish when freedom and responsibility walk together", contribution: "help others make choices with greater conscious awareness", balance: "listen to input without surrendering sovereignty over your decisions" },
  13: { presence: "You are driven to expand your horizons and explore the unfamiliar", gift: "pioneer pathways toward new experiences and insights", tension: "move continuously until you lose ground to anchor yourself", connection: "closeness grows with those who give you space without pulling away", contribution: "introduce fresh perspectives to environments settled in old routines", balance: "preserve exploratory courage while staying firmly rooted" },
  14: { presence: "Your presence is calm and powerful when not attempting to control every outcome", gift: "receive experience with complete, centered presence", tension: "hold onto people or outcomes from fear of losing control", connection: "trust deepens through patience and non-passive acceptance", contribution: "create quiet space that helps others see more clearly", balance: "distinguish conscious acceptance from resignation" },
  15: { presence: "You tend to perceive the grand design and directions unseen by many", gift: "transform broad vision into an understandable roadmap", tension: "become hyper-focused on flaws until hope begins to wane", connection: "relationships feel supportive when big ideas can be discussed on solid ground", contribution: "offer vision and fresh avenues without disregarding reality", balance: "ground vision back into one actionable step you can take today" },
  16: { presence: "You have the courage to question what no longer rings true", gift: "employ discerning intelligence to cut through confusion", tension: "become defensive when convictions are challenged", connection: "closeness develops through the bravery to differ without condescension", contribution: "help decisions be made with greater honesty and rigor", balance: "maintain conviction without closing yourself to correction" },
  17: { presence: "You are attuned to timing, subtle shifts, and the interconnectivity of events", gift: "find steps attuned to real-world conditions", tension: "feel disoriented when external signs do not immediately appear", connection: "support is felt from those who help maintain grounding and orientation", contribution: "anchor concepts to genuine, practical needs", balance: "return to body, environment, and tangible reality" },
  18: { presence: "You bring a clarity that lets complex realities be seen as they are", gift: "filter information and pinpoint the heart of an issue", tension: "turn precision into overly sharp criticism", connection: "trust grows through honesty delivered with gentleness", contribution: "help others recognize patterns and make decisions with lucid clarity", balance: "deliver truth without diminishing mutual respect" },
  19: { presence: "Your energy surges when situations call for renewal and courage to transform", gift: "mobilize stagnant processes into vibrant new forms", tension: "drive change so intensely that body and relationships lack time to adapt", connection: "closeness deepens when change is navigated together rather than imposed", contribution: "help legacy systems discover more vibrant ways of operating", balance: "pause intentionally so transformation can take root" },
  20: { presence: "You carry a warm, luminous presence that easily influences the atmosphere", gift: "see through to the essence and generously share understanding", tension: "hold excessively high standards and feel an urge to appear invulnerable", connection: "closeness flourishes through sincerity, authenticity, and natural acceptance", contribution: "bring clarity and warmth into tangible, everyday matters", balance: "allow yourself to remain human without dimming the light you offer" },
};

const HUMAN_TONE_THEMES_EN: Record<number, { rhythm: string; tension: string; growth: string }> = {
  1: { rhythm: "focusing attention on a single, truly essential aim", tension: "easily losing focus when too many demands vie for attention", growth: "choosing one intention and guarding it through simple steps" },
  2: { rhythm: "discerning contrast before establishing a point of equilibrium", tension: "remaining trapped between two alternatives for too long", growth: "treating tension as informative feedback rather than a reason to stop" },
  3: { rhythm: "moving through active engagement and service that yields tangible benefit", tension: "scattering energy by attempting to answer every call", growth: "directing vital energy toward the most tangible forms of contribution" },
  4: { rhythm: "establishing boundaries and structure so ideas can stand firm", tension: "becoming rigid when plans inevitably shift", growth: "building frameworks sturdy enough to protect yet flexible enough to adapt" },
  5: { rhythm: "gathering strength and resources before stepping into a role", tension: "over-controlling out of apprehension over losing influence", growth: "channeling power to empower others rather than subdue" },
  6: { rhythm: "organizing life through balance, rhythm, and intentional cadence", tension: "feeling overwhelmed when routines lose adaptability", growth: "recalibrating your pace without turning to self-blame" },
  7: { rhythm: "receiving inspiration through deep sensitivity and attunement", tension: "struggling to separate inner wisdom from transient noise", growth: "returning to quiet stillness before assigning meaning to experience" },
  8: { rhythm: "harmonizing actions with values you genuinely hold dear", tension: "feeling conflicted when choices clash with personal ethics", growth: "taking small actions that faithfully reflect your core values" },
  9: { rhythm: "propelling life forward through focused, purposeful intention", tension: "losing momentum when core purpose gets tangled with competing desires", growth: "clarifying your underlying reasons before multiplying effort" },
  10: { rhythm: "bringing ideas into manifest forms that can be seen and utilized", tension: "perfectionism making completions feel perpetually deficient", growth: "finishing meaningfully without waiting for everything to be flawless" },
  11: { rhythm: "releasing outdated structures so new space can open", tension: "dismantling too hastily before discerning what remains useful", growth: "letting go consciously while preserving essential lessons" },
  12: { rhythm: "growing through collaboration and the mutual exchange of understanding", tension: "losing personal voice in order to preserve harmony", growth: "contributing to the collective without abandoning personal needs" },
  13: { rhythm: "bringing experiences to completion while staying fully present to the process", tension: "finding it hard to rest from a belief that more must still be refined", growth: "accepting closure as part of rhythm and allowing the body time to recover" },
};

const HUMAN_CASTLE_DIRECTIONS_EN: Record<string, string> = {
  "Kastil Timur Merah": "courageously initiating while building a sturdy foundation",
  "Kastil Utara Putih": "sorting what matters and shedding burdens no longer needed",
  "Kastil Barat Biru": "transforming pressure into more honest renewal",
  "Kastil Selatan Kuning": "sharing fruits and wisdom without depleting oneself",
  "Kastil Tengah Hijau": "integrating presence, beauty, and purpose into everyday living",
  "Red Eastern Castle": "courageously initiating while building a sturdy foundation",
  "White Northern Castle": "sorting what matters and shedding burdens no longer needed",
  "Blue Western Castle": "transforming pressure into more honest renewal",
  "Yellow Southern Castle": "sharing fruits and wisdom without depleting oneself",
  "Green Central Castle": "integrating presence, beauty, and purpose into everyday living",
};

const DEFAULT_HUMAN_SEAL_THEME = HUMAN_SEAL_THEMES[18];
const DEFAULT_HUMAN_TONE_THEME = HUMAN_TONE_THEMES[6];

function humanSealTheme(number: number | null | undefined, isEn = false): HumanSealTheme {
  const dict = isEn ? HUMAN_SEAL_THEMES_EN : HUMAN_SEAL_THEMES;
  const def = isEn ? HUMAN_SEAL_THEMES_EN[18] : DEFAULT_HUMAN_SEAL_THEME;
  return number ? dict[number] || def : def;
}

function humanToneTheme(number: number | null | undefined, isEn = false) {
  const dict = isEn ? HUMAN_TONE_THEMES_EN : HUMAN_TONE_THEMES;
  const def = isEn ? HUMAN_TONE_THEMES_EN[6] : DEFAULT_HUMAN_TONE_THEME;
  return number ? dict[number] || def : def;
}

function buildSummary(
  identity: ReturnType<typeof identitySections>,
  cycles: ReturnType<typeof cycleSections>,
  relationships: Record<OracleRole, TzolkinSectionContract | null>,
  complete: boolean,
  isEn = false,
): string[] {
  const core = humanSealTheme(identity.seal.number, isEn);
  const rhythm = humanToneTheme(identity.tone.number, isEn);
  const support = humanSealTheme(relationships.analog?.sealNumber || relationships.guide?.sealNumber, isEn);
  const challenge = humanSealTheme(relationships.antipode?.sealNumber, isEn);
  const hidden = humanSealTheme(relationships.occult?.sealNumber, isEn);

  if (isEn) {
    const p1 = `${core.presence}. Your natural way of moving is through ${rhythm.rhythm}. You feel most aligned when you can ${core.gift} without forcing yourself into an overly rigid expectation.`;
    const p2 = `In relationships, ${core.connection}. Environments that support you typically offer space to ${support.gift} while honoring personal boundaries. Differences become constructive when you can ${challenge.balance} and grant others space to do the same.`;
    const p3 = `Recurring tension arises when you ${core.tension} or when ${rhythm.tension}. Behind those moments, strength quietly grows through the ability to ${hidden.gift}. Balance returns when you can ${hidden.balance} and ${rhythm.growth}.`;
    if (!complete) return [p1, p2, p3];
    const matureDirection = isText(cycles.castle?.rawValue) ? HUMAN_CASTLE_DIRECTIONS_EN[cycles.castle.rawValue] : null;
    const p4 = `Your growth direction invites you to ${matureDirection || rhythm.growth}. Your contribution becomes meaningful when you can ${core.contribution} and let the results serve daily life. The most grounded step is to ${core.balance}, maintain a sustainable rhythm, and give change time to take root.`;
    return [p1, p2, p3, p4];
  }

  const p1 = `${core.presence}. Cara alammu bergerak adalah dengan ${rhythm.rhythm}. Dirimu terasa paling selaras ketika dapat ${core.gift} tanpa memaksa diri memenuhi gambaran yang terlalu sempurna.`;
  const p2 = `Dalam hubungan, ${core.connection}. Lingkungan yang mendukungmu biasanya memberi ruang untuk ${support.gift} sambil tetap menghormati batas pribadi. Perbedaan dapat menjadi berguna ketika kamu mampu ${challenge.balance} dan memberi orang lain kesempatan melakukan hal yang sama.`;
  const p3 = `Tekanan berulang muncul saat kamu ${core.tension} atau ketika ${rhythm.tension}. Di balik situasi itu, ada kekuatan yang tumbuh perlahan melalui kemampuan untuk ${hidden.gift}. Keseimbangan kembali ketika kamu dapat ${hidden.balance} serta ${rhythm.growth}.`;
  if (!complete) return [p1, p2, p3];
  const matureDirection = isText(cycles.castle?.rawValue) ? HUMAN_CASTLE_DIRECTIONS[cycles.castle.rawValue] : null;
  const p4 = `Arah pertumbuhanmu mengajakmu ${matureDirection || rhythm.growth}. Kontribusimu menjadi bermakna ketika kamu dapat ${core.contribution} dan membiarkan hasilnya berguna bagi kehidupan sehari-hari. Langkah paling membumi adalah ${core.balance}, menjaga ritme yang dapat dipertahankan, dan memberi perubahan waktu untuk berakar.`;
  return [p1, p2, p3, p4];
}

export function buildTzolkinPresentation(
  input: TzolkinPresentationInput | null | undefined,
  options?: { isEn?: boolean } | unknown,
): TzolkinPresentation {
  const isEn =
    typeof options === "object" && options !== null && "isEn" in options
      ? Boolean((options as { isEn?: boolean }).isEn)
      : isEnlEdition();
  const emptyContract: TzolkinIdentityReadContract = {
    kin: null, kinNumber: null, galacticSignature: null, tone: null, toneNumber: null, seal: null, sealNumber: null,
    color: null, wavespell: null, castle: null, guide: null, analog: null, antipode: null, occult: null,
    isGap: null, gap: null, archetypeThemes: null, giftThemes: null, challengeThemes: null, emotionalThemes: null,
    relationshipThemes: null, workThemes: null, growthDirection: null, summary: [],
    sourceVersion: TZOLKIN_PRESENTATION_SOURCE_VERSION, sourceClassification: SOURCE_CLASSIFICATION,
  };
  const unavailable: TzolkinPresentation = {
    status: "unavailable", canonicalName: "Tzolkin",
    hero: {
      title: isEn ? "Maya Consciousness Calendar" as any : "Kalender Kesadaran Maya",
      kin: null, galacticSignature: null, tone: null, seal: null,
      insight: isEn ? "Complete your birth date to unlock your Tzolkin reading." : "Lengkapi tanggal kelahiran untuk membuka pembacaan Tzolkin.",
      action: isEn ? "View full details" as any : "Lihat detail selengkapnya",
    },
    profileCard: {
      title: isEn ? "Maya Tzolkin" as any : "Tzolkin Maya",
      kin: null, tone: null, seal: null,
      insight: isEn ? "Time codes and consciousness rhythms from the sacred Maya calendar." : "Kode waktu dan ritme kesadaran dari kalender sakral Maya.",
      action: isEn ? "View full details" as any : "Lihat detail selengkapnya",
      href: "/blueprint/tzolkin",
    },
    groups: [], readContract: emptyContract, summary: [], summaryText: "", sourceVersion: TZOLKIN_PRESENTATION_SOURCE_VERSION,
  };
  if (!input || typeof input !== "object") return unavailable;

  const identity = identitySections(input, isEn);
  const cycles = cycleSections(input, identity.shared, isEn);
  const relationships = {
    guide: oracleSection("guide", input.oracle, identity.kinNumber, isEn),
    analog: oracleSection("analog", input.oracle, identity.kinNumber, isEn),
    antipode: oracleSection("antipode", input.oracle, identity.kinNumber, isEn),
    occult: oracleSection("occult", input.oracle, identity.kinNumber, isEn),
  };
  const synthesis = synthesisSections(input, identity, relationships, isEn);
  const core = [identity.kin, identity.galacticSignature, identity.toneSection, identity.sealSection].filter(Boolean).length;
  const optional = [cycles.wavespell, cycles.castle, relationships.guide, relationships.analog, relationships.antipode, relationships.occult].filter(Boolean).length;
  const status = core === 4 && optional === 6 ? "complete" : core > 0 ? "partial" : "unavailable";
  if (status === "unavailable") return unavailable;
  const summary = buildSummary(identity, cycles, relationships, status === "complete", isEn);
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
    { groupId: "galactic-identity", title: isEn ? "Your Galactic Identity" : "Identitas Galaktikmu", sections: compact([identity.kin, identity.galacticSignature, identity.toneSection, identity.sealSection]) },
    { groupId: "journey-rhythm", title: isEn ? "Your Journey's Rhythm" : "Irama Perjalananmu", sections: compact([cycles.wavespell, cycles.castle, cycles.gap]) },
    { groupId: "energy-directions", title: isEn ? "Energy Directions Around You" : "Arah Energi di Sekitarmu", sections: compact([relationships.guide, relationships.analog, relationships.antipode, relationships.occult]) },
    { groupId: "gifts-challenges", title: isEn ? "Gifts and Challenges" : "Karunia dan Tantangan", sections: compact([synthesis.archetypeThemes, synthesis.giftThemes, synthesis.challengeThemes, synthesis.emotionalThemes]) },
    { groupId: "relation-work-growth", title: isEn ? "Relationships, Work, and Growth" : "Relasi, Karya, dan Pertumbuhan", sections: compact([synthesis.relationshipThemes, synthesis.workThemes, synthesis.growthDirection]) },
  ].filter((group) => group.sections.length > 0);
  const insight = isEn
    ? `You carry the quality of ${identity.keyword} through the rhythm of ${identity.tone.name || "your characteristic tempo"}, with strengths unfolding when you ${identity.sealGift}.`
    : `Kamu membawa kualitas ${identity.keyword} melalui ritme ${identity.tone.name || "yang khas"}, dengan kekuatan yang muncul saat ${identity.sealGift}.`;
  return {
    status, canonicalName: "Tzolkin",
    hero: {
      title: isEn ? "Maya Consciousness Calendar" as any : "Kalender Kesadaran Maya",
      kin: identity.kin?.displayValue || null,
      galacticSignature: identity.galacticSignature?.displayValue || null,
      tone: identity.toneSection?.displayValue || null,
      seal: identity.sealSection?.displayValue || null,
      insight,
      action: isEn ? "View full details" as any : "Lihat detail selengkapnya",
    },
    profileCard: {
      title: isEn ? "Maya Tzolkin" as any : "Tzolkin Maya",
      kin: identity.kin?.displayValue || null,
      tone: identity.toneSection?.displayValue || null,
      seal: identity.sealSection?.displayValue || null,
      insight,
      action: isEn ? "View full details" as any : "Lihat detail selengkapnya",
      href: "/blueprint/tzolkin",
    },
    groups, readContract, summary, summaryText: summary.join("\n\n"), sourceVersion: TZOLKIN_PRESENTATION_SOURCE_VERSION,
  };
}
