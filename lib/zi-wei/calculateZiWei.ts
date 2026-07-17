import { astro } from "iztro";
import type { ZiWeiDecade, ZiWeiGender, ZiWeiInput, ZiWeiPalace, ZiWeiResult, ZiWeiStar, ZiWeiTransformation } from "./types";

const METHOD = {
  id: "iztro-default-complete-book-v2.5.8",
  sourceVersion: "iztro@2.5.8",
  sourceClassification: "FOUNDER_APPROVED_FUNCTIONAL_RECONSTRUCTION",
  calendarOwner: "lunar-lite@0.2.8 via iztro@2.5.8",
  calendarConvention: "Chinese lunar calendar",
  leapMonthPolicy: "Leap-month days 1–15 retain the nominal month; days after 15 advance one month for placement",
  timeConvention: "local civil time; no true-solar-time correction",
  dayBoundary: "late Zi hour (23:00–00:00) advances to the following day",
  algorithm: "default",
} as const;

const PALACES: Record<string, string> = {
  soul: "Life Palace", parents: "Parents Palace", spirit: "Fortune Palace", property: "Property Palace",
  career: "Career Palace", friends: "Friends and Servants Palace", surface: "Travel Palace", health: "Health Palace",
  wealth: "Wealth Palace", children: "Children Palace", spouse: "Spouse Palace", siblings: "Siblings Palace",
};

const STARS: Record<string, string> = {
  emperor: "Zi Wei", advisor: "Tian Ji", sun: "Tai Yang", general: "Wu Qu", fortunate: "Tian Tong",
  judge: "Lian Zhen", empress: "Tian Fu", moon: "Tai Yin", wolf: "Tan Lang", advocator: "Ju Men",
  minister: "Tian Xiang", sage: "Tian Liang", marshal: "Qi Sha", rebel: "Po Jun",
  officer: "Zuo Fu", helper: "You Bi", scholar: "Wen Chang", artist: "Wen Qu", money: "Lu Cun",
  horse: "Tian Ma", driven: "Qing Yang", tangled: "Tuo Luo", impulsive: "Huo Xing", spark: "Ling Xing",
  assistant: "Tian Kui", aide: "Tian Yue", ideologue: "Di Kong", fickle: "Di Jie",
};

const TRANSFORMATIONS: Record<string, ZiWeiTransformation["type"]> = {
  A: "Hua Lu", B: "Hua Quan", C: "Hua Ke", D: "Hua Ji",
};

const STEMS: Record<string, string> = { jia: "Jia", yi: "Yi", bing: "Bing", ding: "Ding", wu: "Wu", ji: "Ji", geng: "Geng", xin: "Xin", ren: "Ren", gui: "Gui", 甲: "Jia", 乙: "Yi", 丙: "Bing", 丁: "Ding", 戊: "Wu", 己: "Ji", 庚: "Geng", 辛: "Xin", 壬: "Ren", 癸: "Gui" };
const BRANCHES: Record<string, string> = { zi: "Zi", chou: "Chou", yin: "Yin", mao: "Mao", chen: "Chen", si: "Si", woo: "Wu", wei: "Wei", shen: "Shen", you: "You", xu: "Xu", hai: "Hai", 子: "Zi", 丑: "Chou", 寅: "Yin", 卯: "Mao", 辰: "Chen", 巳: "Si", 午: "Wu", 未: "Wei", 申: "Shen", 酉: "You", 戌: "Xu", 亥: "Hai" };

function parseTimeIndex(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  if (hour === 23) return 12;
  if (hour === 0) return 0;
  return Math.floor((hour + 1) / 2);
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function canonicalStar(star: { name: string; brightness?: string; mutagen?: string }): ZiWeiStar {
  return {
    canonicalName: STARS[star.name] ?? star.name,
    technicalName: star.name,
    brightness: star.brightness || null,
    transformation: star.mutagen ? TRANSFORMATIONS[star.mutagen] ?? null : null,
  };
}

function localDateParts(asOf: Date, timezone?: string | null): { year: number; month: number; day: number } {
  const offset = /^([+-])(\d{2}):(\d{2})$/.exec(timezone ?? "");
  if (offset) {
    const minutes = (offset[1] === "-" ? -1 : 1) * (Number(offset[2]) * 60 + Number(offset[3]));
    const local = new Date(asOf.getTime() + minutes * 60_000);
    return { year: local.getUTCFullYear(), month: local.getUTCMonth() + 1, day: local.getUTCDate() };
  }
  if (timezone) {
    try {
      const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(asOf);
      const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
      return { year: value("year"), month: value("month"), day: value("day") };
    } catch {
      // Fall through to the device's local civil date when the stored zone is invalid.
    }
  }
  return { year: asOf.getFullYear(), month: asOf.getMonth() + 1, day: asOf.getDate() };
}

function yearsOld(birthDate: string, asOf: Date, timezone?: string | null): number {
  const [year, month, day] = birthDate.split("-").map(Number);
  const current = localDateParts(asOf, timezone);
  let age = current.year - year;
  if (current.month < month || (current.month === month && current.day < day)) age -= 1;
  return Math.max(0, age);
}

function emptyResult(input: ZiWeiInput, error: string): ZiWeiResult {
  const birthDate = Boolean(input.birthDate && validDate(input.birthDate));
  const exactBirthTime = Boolean(input.birthTime && parseTimeIndex(input.birthTime) !== null);
  return {
    systemName: "Zi Wei Dou Shu", status: "unavailable", method: METHOD,
    birthDataStatus: { birthDate, exactBirthTime, timezone: Boolean(input.timezone), birthplace: Boolean(input.birthCity), gender: Boolean(input.gender), notes: [error] },
    lunarBirth: null, lifePalace: null, bodyPalace: null, bureau: null, lifeMaster: null, bodyMaster: null,
    palaces: [], majorStars: [], supportingStars: [], fourTransformations: [], decadeCycles: [], activeDecade: null,
    annualCycle: null, calculationError: error,
  };
}

export function calculateZiWei(input: ZiWeiInput): ZiWeiResult {
  const birthDate = input.birthDate?.trim() ?? "";
  const birthTime = input.birthTime?.trim() ?? "";
  if (!validDate(birthDate)) return emptyResult(input, "Tanggal lahir yang valid diperlukan.");
  const timeIndex = parseTimeIndex(birthTime);
  if (timeIndex === null) return emptyResult(input, "Waktu lahir yang tepat diperlukan untuk menempatkan Life Palace, Body Palace, dan bintang.");

  const gender: ZiWeiGender = input.gender === "female" ? "female" : "male";
  const hasGender = input.gender === "male" || input.gender === "female";
  const notes: string[] = [];
  if (!input.timezone) notes.push("Zona waktu belum tersimpan; tanggal dan waktu diperlakukan sebagai waktu sipil lokal yang diberikan.");
  if (!input.birthCity) notes.push("Tempat lahir belum tersimpan; metode ini tidak menerapkan koreksi true solar time.");

  try {
    astro.config({ yearDivide: "normal", horoscopeDivide: "normal", ageDivide: "birthday", dayDivide: "forward", algorithm: "default" });
    const chart = astro.bySolar(birthDate, timeIndex, gender, true, "en-US");
    const lunar = chart.rawDates.lunarDate;
    const yearly = chart.rawDates.chineseDate.yearly;

    const palaces: ZiWeiPalace[] = chart.palaces.map((palace) => ({
      index: palace.index,
      key: palace.name,
      name: PALACES[palace.name] ?? palace.name,
      heavenlyStem: STEMS[palace.heavenlyStem] ?? palace.heavenlyStem,
      earthlyBranch: BRANCHES[palace.earthlyBranch] ?? palace.earthlyBranch,
      isBodyPalace: palace.isBodyPalace,
      majorStars: palace.majorStars.map(canonicalStar),
      supportingStars: palace.minorStars.map(canonicalStar),
      decade: hasGender ? { ageStart: palace.decadal.range[0], ageEnd: palace.decadal.range[1] } : null,
    }));
    const lifePalace = palaces.find((palace) => palace.key === "soul") ?? null;
    const bodyPalace = palaces.find((palace) => palace.isBodyPalace) ?? null;
    const fourTransformations = palaces.flatMap((palace) =>
      [...palace.majorStars, ...palace.supportingStars]
        .filter((star) => star.transformation)
        .map((star) => ({
          type: star.transformation!, star: star.canonicalName, palace: palace.name,
          birthYearStem: STEMS[String(yearly[0])] ?? String(yearly[0]),
          tableSource: "iztro@2.5.8 default Heavenly Stem mutagen table", calculationStatus: "calculated" as const,
        })),
    );
    const decadeCycles: ZiWeiDecade[] = hasGender
      ? palaces.map((palace) => ({
          cycleIndex: palace.index, ageStart: palace.decade!.ageStart, ageEnd: palace.decade!.ageEnd,
          palace: palace.name, branch: palace.earthlyBranch,
          dominantMajorStars: palace.majorStars.map((star) => star.canonicalName),
          transformations: palace.majorStars.flatMap((star) => star.transformation ? [star.transformation] : []),
          sourceVersion: METHOD.sourceVersion,
        })).sort((a, b) => a.ageStart - b.ageStart)
      : [];
    const currentAge = yearsOld(birthDate, input.asOf ?? new Date(), input.timezone);
    const activeDecade = decadeCycles.find((cycle) => currentAge >= cycle.ageStart && currentAge <= cycle.ageEnd) ?? null;

    return {
      systemName: "Zi Wei Dou Shu",
      status: notes.length || !hasGender ? "partial" : "complete",
      method: METHOD,
      birthDataStatus: { birthDate: true, exactBirthTime: true, timezone: Boolean(input.timezone), birthplace: Boolean(input.birthCity), gender: hasGender, notes },
      lunarBirth: {
        lunarYear: lunar.lunarYear, lunarMonth: lunar.lunarMonth, lunarDay: lunar.lunarDay, isLeapMonth: lunar.isLeap,
        yearHeavenlyStem: STEMS[String(yearly[0])] ?? String(yearly[0]), yearEarthlyBranch: BRANCHES[String(yearly[1])] ?? String(yearly[1]),
        hourBranch: BRANCHES[String(chart.rawDates.chineseDate.hourly[1])] ?? String(chart.rawDates.chineseDate.hourly[1]),
        hourRange: chart.timeRange, conversionStatus: "calculated",
      },
      lifePalace, bodyPalace, bureau: chart.fiveElementsClass,
      lifeMaster: STARS[chart.soul] ?? chart.soul, bodyMaster: STARS[chart.body] ?? chart.body,
      palaces, majorStars: palaces.flatMap((palace) => palace.majorStars),
      supportingStars: palaces.flatMap((palace) => palace.supportingStars), fourTransformations,
      decadeCycles, activeDecade, annualCycle: null, calculationError: null,
    };
  } catch (error) {
    return emptyResult(input, error instanceof Error ? error.message : "Konversi kalender Zi Wei gagal.");
  }
}
