import type { CanonicalDestinyMatrix } from "../types/destinyMatrix";
import { destinyMatrixArcanaDictionary, destinyMatrixArcanaDictionaryEn, type ArcanaDictionaryEntry } from "../data/destinyMatrixArcanaDictionary";
import { DESTINY_MATRIX_AGE_CYCLE } from "./topology";
import { isEnlEdition } from "@/lib/config/edition";

export type DestinyMatrixAnnualArcana = {
  age: number;
  arcana: number;
  arcanaName: string;
  periodStart: string;
  periodEnd?: string;
  ageRangeLabel: string;
  shortTheme: string;
  integratedParagraphs: string[];
  centerConnection: string;
  loveConnection: string;
  moneyConnection: string;
  karmicConnection: string;
  practicalInvitation: string;
  sourceClassification: "FOUNDER_APPROVED_FUNCTIONAL_RECONSTRUCTION";
  sourceVersion: "v3-build-72-age-ring-reconstruction-1";
  availabilityStatus: "available";
};

export type DestinyMatrixAnnualArcanaContext = {
  birthDate?: string | null;
  timezone?: string | null;
  asOf?: Date;
};

type LocalDate = { year: number; month: number; day: number };

const SOURCE_CLASSIFICATION = "FOUNDER_APPROVED_FUNCTIONAL_RECONSTRUCTION" as const;
const SOURCE_VERSION = "v3-build-72-age-ring-reconstruction-1" as const;

const clean = (value: string) => value
  .replace(/\s*\([^)]*\)/g, "")
  .replace(/Burnout/gi, "kelelahan")
  .replace(/kecanduan/gi, "dorongan yang sulit dilepaskan")
  .replace(/obsesi/gi, "keterpakuan")
  .replace(/godaan/gi, "tarikan yang kuat")
  .replace(/kemakmuran/gi, "penciptaan nilai")
  .trim();
const phrase = (value: string, isEn = false) => {
  const cleaned = clean(value);
  return isEn ? cleaned.charAt(0).toLowerCase() + cleaned.slice(1) : cleaned.toLocaleLowerCase("id-ID");
};

function meaning(value: number, isEn = false): ArcanaDictionaryEntry {
  const dict = isEn ? destinyMatrixArcanaDictionaryEn : destinyMatrixArcanaDictionary;
  const result = dict[value] || destinyMatrixArcanaDictionary[value];
  if (!result) throw new Error(`Verified Arcana dictionary has no entry for ${value}.`);
  return result;
}

function parseBirthDate(value?: string | null): LocalDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const result = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  const date = new Date(Date.UTC(result.year, result.month - 1, result.day));
  return date.getUTCFullYear() === result.year && date.getUTCMonth() === result.month - 1 && date.getUTCDate() === result.day ? result : null;
}

function dateInTimezone(instant: Date, timezone?: string | null): LocalDate {
  const offset = /^([+-])(\d{2}):(\d{2})$/.exec(timezone ?? "");
  if (offset) {
    const minutes = (Number(offset[2]) * 60 + Number(offset[3])) * (offset[1] === "-" ? -1 : 1);
    const shifted = new Date(instant.getTime() + minutes * 60_000);
    return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1, day: shifted.getUTCDate() };
  }
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone || "UTC", year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(instant);
    const read = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
    return { year: read("year"), month: read("month"), day: read("day") };
  } catch {
    return { year: instant.getUTCFullYear(), month: instant.getUTCMonth() + 1, day: instant.getUTCDate() };
  }
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function birthdayInYear(birth: LocalDate, year: number): LocalDate {
  return { year, month: birth.month, day: Math.min(birth.day, daysInMonth(year, birth.month)) };
}

function compareDate(left: LocalDate, right: LocalDate): number {
  return left.year - right.year || left.month - right.month || left.day - right.day;
}

function isoDate(date: LocalDate): string {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

function previousDay(date: LocalDate): LocalDate {
  const value = new Date(Date.UTC(date.year, date.month - 1, date.day));
  value.setUTCDate(value.getUTCDate() - 1);
  return { year: value.getUTCFullYear(), month: value.getUTCMonth() + 1, day: value.getUTCDate() };
}

function ageOnDate(birth: LocalDate, current: LocalDate): number {
  let age = current.year - birth.year;
  if (compareDate(current, birthdayInYear(birth, current.year)) < 0) age -= 1;
  return age;
}

function graphValue(matrix: CanonicalDestinyMatrix, nodeId: string): number | null {
  return matrix.graph.nodes.find((node) => node.id === nodeId)?.value ?? null;
}

export function resolveDestinyMatrixArcanaAtAge(matrix: CanonicalDestinyMatrix, age: number): number | null {
  if (!Number.isInteger(age) || age < 0 || age > 79) return null;
  const segmentIndex = Math.floor(age / 10);
  const offset = age % 10;
  const segment = matrix.timeline.segments[segmentIndex];
  if (!segment) return null;
  if (offset === 0) return graphValue(matrix, segment.fromNodeId);
  const point = DESTINY_MATRIX_AGE_CYCLE.points.find((candidate) => offset >= candidate.offsetStart && offset <= candidate.offsetEnd);
  const nodeId = point ? segment.nodeIds[point.valueIndex] : null;
  return nodeId ? graphValue(matrix, nodeId) : null;
}

function connectionMeanings(matrix: CanonicalDestinyMatrix, isEn = false) {
  const values = new Map(matrix.graph.nodes.map((node) => [node.id, node.value]));
  const at = (nodeId: string) => {
    const value = values.get(nodeId);
    return value ? meaning(value, isEn) : null;
  };
  return {
    center: at("BM05"),
    karmic: at("BM17"),
    love: at("BM21"),
    money: at("BM22"),
  };
}

export function buildDestinyMatrixAnnualArcana(
  matrix: CanonicalDestinyMatrix,
  context: DestinyMatrixAnnualArcanaContext,
  options: { isEn?: boolean } = {},
): DestinyMatrixAnnualArcana | null {
  const isEn = options.isEn ?? isEnlEdition();
  const birth = parseBirthDate(context.birthDate);
  if (!birth) return null;
  const current = dateInTimezone(context.asOf ?? new Date(), context.timezone);
  const age = ageOnDate(birth, current);
  const arcana = resolveDestinyMatrixArcanaAtAge(matrix, age);
  if (arcana === null) return null;

  let rangeStartAge = age;
  while (rangeStartAge > 0 && resolveDestinyMatrixArcanaAtAge(matrix, rangeStartAge - 1) === arcana) rangeStartAge -= 1;
  let nextAge = age + 1;
  while (nextAge <= 79 && resolveDestinyMatrixArcanaAtAge(matrix, nextAge) === arcana) nextAge += 1;

  const start = birthdayInYear(birth, birth.year + rangeStartAge);
  const endExclusive = nextAge <= 79 ? birthdayInYear(birth, birth.year + nextAge) : null;
  const annual = meaning(arcana, isEn);
  const related = connectionMeanings(matrix, isEn);
  if (!related.center) return null;

  const centerConnection = isEn
    ? `Your core pattern supports this phase through ${phrase(related.center.gift, isEn)}, provided your determination does not turn into an urge to micromanage every outcome.`
    : `Pola intimu membantu fase ini melalui ${phrase(related.center.gift)}, selama ketegasan tidak berubah menjadi kebutuhan untuk mengendalikan seluruh hasil.`;
  const karmicConnection = related.karmic
    ? (isEn
      ? `Past patterns may resurface through ${phrase(related.karmic.challenge, isEn)}, making conscious resolution more essential than reverting to familiar reactions.`
      : `Pola lama dapat kembali terlihat melalui ${phrase(related.karmic.challenge)}, sehingga penyelesaian yang sadar lebih penting daripada mengulang respons yang terasa akrab.`)
    : "";
  const loveConnection = related.love
    ? (isEn
      ? `In intimacy, this phase may sharpen the need for ${phrase(related.love.relationshipPattern, isEn)}, while inviting deeper honesty and clearer boundaries.`
      : `Dalam kedekatan, fase ini dapat menajamkan kebutuhan akan ${phrase(related.love.relationshipPattern)}, sekaligus meminta batas dan kepercayaan yang lebih jujur.`)
    : "";
  const moneyConnection = related.money
    ? (isEn
      ? `In work and resources, your focus is guided toward ${phrase(related.money.growthDirection, isEn)}, with decisions grounded in reality.`
      : `Dalam karya dan sumber daya, perhatianmu diarahkan untuk ${phrase(related.money.growthDirection)}, dengan keputusan yang tetap perlu berpijak pada kenyataan.`)
    : "";
  const practicalInvitation = isEn
    ? `Choose one key priority, reflect on what drives it, and channel it into a clear, sustainable step forward.`
    : `Pilih satu dorongan yang paling penting, periksa alasan di baliknya, lalu salurkan ke langkah yang jelas dan dapat dipertahankan.`;

  const paragraph1 = isEn
    ? `This phase focuses your attention on ${phrase(annual.coreEssence, isEn)}, bringing subtle patterns into sharp relief so they can no longer be overlooked. Opportunity unfolds through ${phrase(annual.lightSide, isEn)}, while friction may arise when ${phrase(annual.shadowSide, isEn)} takes over. ${centerConnection}`
    : `Fase ini membawa perhatianmu pada ${phrase(annual.coreEssence)}, sehingga hal yang selama ini samar mungkin terasa lebih kuat dan lebih sulit diabaikan. Peluangnya muncul melalui ${phrase(annual.lightSide)}, sedangkan ketegangan dapat hadir ketika ${phrase(annual.shadowSide)} mengambil terlalu banyak ruang. ${centerConnection}`;
  const paragraph2 = related.love && related.karmic
    ? (isEn
      ? `${loveConnection} ${karmicConnection} What supports you is holding space, expressing your needs, and choosing fresh responses without judging recurring patterns as failure.`
      : `${loveConnection} ${karmicConnection} Yang perlu dijaga adalah kemampuan memberi ruang, menyampaikan kebutuhan, dan memilih respons baru tanpa menganggap pola yang kembali muncul sebagai kegagalan.`)
    : (isEn
      ? `Your relationship with yourself and others invites deeper honesty during this phase. Available patterns encourage holding boundaries without closing the door to intimacy. Slow, conscious responses will serve you far better than forced certainty.`
      : `Hubungan dengan diri sendiri dan orang lain mungkin meminta perhatian yang lebih jujur selama fase ini. Pola yang tersedia mengajakmu menjaga batas tanpa menutup ruang bagi kedekatan. Respons yang perlahan dan sadar akan lebih membantu daripada kepastian yang dipaksakan.`);
  const paragraph3 = related.money
    ? (isEn
      ? `${moneyConnection} Ambition becomes a constructive force when not used to prove self-worth or rush the unfolding process. ${practicalInvitation}`
      : `${moneyConnection} Ambisi dapat menjadi tenaga yang membangun ketika tidak dipakai untuk membuktikan harga diri atau menekan proses agar segera selesai. ${practicalInvitation}`)
    : (isEn
      ? `Your direction in work and action can still be navigated through the central theme of this phase. Progress does not need to be proven through hasty results or specific material promises. ${practicalInvitation}`
      : `Arah kerja dan tindakan tetap dapat dibaca melalui tema utama fase ini. Kemajuan tidak harus dibuktikan lewat hasil yang tergesa-gesa atau janji materi tertentu. ${practicalInvitation}`);
  const complete = Boolean(related.center && related.love && related.karmic && related.money);
  const partialParagraph = isEn
    ? `${loveConnection || karmicConnection || moneyConnection || "The available aspects encourage mindful attention to emerging dynamics."} Missing contextual data is never replaced by assumptions from other systems. ${practicalInvitation}`
    : `${loveConnection || karmicConnection || moneyConnection || "Bagian yang tersedia tetap mengajakmu memperhatikan respons yang sedang menguat."} Data pendukung yang belum tersedia tidak diganti dengan tafsir dari sistem lain. ${practicalInvitation}`;

  const ageRangeLabel = rangeStartAge === nextAge - 1
    ? (isEn ? `Age ${rangeStartAge}` : `Usia ${rangeStartAge}`)
    : (isEn ? `Ages ${rangeStartAge}–${nextAge - 1}` : `Usia ${rangeStartAge}–${nextAge - 1}`);

  return {
    age,
    arcana,
    arcanaName: annual.name,
    periodStart: isoDate(start),
    periodEnd: endExclusive ? isoDate(previousDay(endExclusive)) : undefined,
    ageRangeLabel,
    shortTheme: phrase(annual.coreEssence, isEn),
    integratedParagraphs: complete ? [paragraph1, paragraph2, paragraph3] : [paragraph1, partialParagraph],
    centerConnection,
    loveConnection,
    moneyConnection,
    karmicConnection,
    practicalInvitation,
    sourceClassification: SOURCE_CLASSIFICATION,
    sourceVersion: SOURCE_VERSION,
    availabilityStatus: "available",
  };
}
