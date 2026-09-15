import { auth } from "@/lib/firebase/firebase";
import {
  readOwnedCacheArray,
  readOwnedCacheObject,
  writeOwnedCacheObject,
} from "@/lib/storage/derivedCacheOwnership";
import { getCanonicalHumanDesignType } from "@/lib/humandesign/hdAudit";
import { isEnlEdition } from "@/lib/config/edition";

type UnknownRecord = Record<string, unknown>;

export const WEEKLY_SOUL_REPORT_STORAGE_KEY = "bhumiWeeklySoulReport";

export type WeeklySoulReportInput = {
  profile?: UnknownRecord | null;
  blueprint?: UnknownRecord | null;
  journalEntries?: UnknownRecord[];
  meditationEntries?: UnknownRecord[];
  audioHealingEntries?: UnknownRecord[];
  healingInsights?: UnknownRecord | null;
  journeyData?: UnknownRecord | null;
  compiledInnerwork?: UnknownRecord | null;
  progressData?: UnknownRecord | null;
};

export type WeeklySoulReportOutput = {
  uid?: string;
  weekStart: string;
  weekEnd: string;
  totalJournal: number;
  totalMeditation: number;
  totalAudioHealing: number;
  dominantTheme: string;
  emotionalPattern: string;
  bodyPattern: string;
  growthSummary: string;
  weeklyReflection: string;
  blueprintReflection: string;
  recommendedFocusNextWeek: string;
  recommendedJournalPrompt: string;
  recommendedMeditation: string;
  recommendedAudioHealing: string;
  closingMessage: string;
};

function getDateOnly(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return value.slice(0, 10);
}

function toDateLabel(value: string): string {
  const isEn = isEnlEdition();
  return new Date(`${value}T00:00:00`).toLocaleDateString(isEn ? "en-US" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getString(record: UnknownRecord | null | undefined, path: string[]): string | null {
  const value = path.reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as UnknownRecord)[key];
  }, record);

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getNumber(record: UnknownRecord | null | undefined, path: string[]): number | null {
  const value = path.reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as UnknownRecord)[key];
  }, record);

  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function countByString(entries: UnknownRecord[], field: string): Array<{ value: string; count: number }> {
  const map = new Map<string, number>();

  entries.forEach((entry) => {
    const value = entry[field];
    if (typeof value === "string" && value.trim()) {
      const normalized = value.trim();
      map.set(normalized, (map.get(normalized) ?? 0) + 1);
    }
  });

  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function countBodySignals(entries: UnknownRecord[]): Array<{ value: string; count: number }> {
  const map = new Map<string, number>();

  entries.forEach((entry) => {
    if (!Array.isArray(entry.bodySignals)) return;
    entry.bodySignals.forEach((signal) => {
      if (typeof signal === "string" && signal.trim()) {
        const normalized = signal.trim();
        map.set(normalized, (map.get(normalized) ?? 0) + 1);
      }
    });
  });

  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function hash(value: string): number {
  let result = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    result ^= value.charCodeAt(i);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function pickVariant(variants: string[], seed: string): string {
  if (variants.length === 0) return "";
  return variants[hash(seed) % variants.length];
}

export function formatHumanList(items: string[], conjunction: "dan" | "atau" = "dan", isEn = false): string {
  if (!items || items.length === 0) return "";
  const cleaned = items
    .map((s) => s.replace(/^[^\p{L}\p{N}]+/gu, "").trim())
    .filter(Boolean)
    .map((s) => (/^[A-Z0-9]{2,}$/.test(s) ? s : s.toLowerCase()));
  if (cleaned.length === 0) return "";
  if (cleaned.length === 1) return cleaned[0];
  if (cleaned.length === 2) return isEn ? `${cleaned[0]} and ${cleaned[1]}` : `${cleaned[0]} ${conjunction} ${cleaned[1]}`;
  const last = cleaned[cleaned.length - 1];
  const rest = cleaned.slice(0, -1).join(", ");
  return isEn ? `${rest}, and ${last}` : `${rest}, ${conjunction} ${last}`;
}

function topOrFallback(items: Array<{ value: string; count: number }>, fallback: string, isEn = false): string {
  if (items.length === 0) return fallback;
  const topValues = items.slice(0, 3).map((item) => item.value);
  return formatHumanList(topValues, "dan", isEn);
}

function filterLastSevenDays(entries: UnknownRecord[], weekStart: string, weekEnd: string): UnknownRecord[] {
  return entries.filter((entry) => {
    const dateValue =
      getDateOnly(entry.date)
      ?? getDateOnly(entry.dateCreated)
      ?? getDateOnly(entry.createdAt);

    return Boolean(dateValue && dateValue >= weekStart && dateValue <= weekEnd);
  });
}

function buildBlueprintReflection(blueprint: UnknownRecord | null | undefined): string {
  const isEn = isEnlEdition();
  const lifePath = getNumber(blueprint, ["lifePath", "number"]) ?? getNumber(blueprint, ["numerology", "number"]);
  const humanDesignType = getCanonicalHumanDesignType((blueprint as any)?.humanDesign);
  const arcanaCenter = getNumber(blueprint, ["arcanaCenter", "number"]) ?? getNumber(blueprint, ["destinyMatrix", "center"]);
  const sunSign = getString(blueprint, ["sunSign", "sign"]) ?? getString(blueprint, ["natalChart", "sunSign"]);

  const lines: string[] = [];
  if (isEn) {
    if (lifePath) lines.push("This week, your journey seems to grow more easily through small, consistent steps than large pushes that are hard to maintain.");
    if (humanDesignType) lines.push("Your body tends to give clearer signals when your rhythm is not forced.");
    if (arcanaCenter) lines.push("There is an invitation to look at old patterns honestly, then make room for newer responses.");
    if (sunSign) lines.push("The way you care for your emotions this week might feel more personal when you give space to needs that are usually passed over.");

    if (lines.length === 0) {
      return "Your journey will feel more aligned when you listen to your body's signals before making big decisions.";
    }
  } else {
    if (lifePath) lines.push("Minggu ini, perjalananmu tampak lebih mudah tumbuh lewat langkah kecil yang konsisten daripada dorongan besar yang sulit dijaga.");
    if (humanDesignType) lines.push("Tubuhmu cenderung memberi sinyal yang lebih jelas saat ritmemu tidak dipaksa.");
    if (arcanaCenter) lines.push("Ada undangan untuk melihat pola lama dengan jujur, lalu membuka ruang bagi respons yang lebih baru.");
    if (sunSign) lines.push("Cara kamu merawat emosi minggu ini mungkin terasa lebih personal saat kamu memberi ruang pada kebutuhan yang biasanya dilewati.");

    if (lines.length === 0) {
      return "Perjalananmu akan terasa lebih selaras ketika kamu mendengar sinyal tubuhmu sebelum mengambil keputusan besar.";
    }
  }

  return lines.join(" ");
}

function buildGrowthSummary(input: {
  totalActivities: number;
  dominantTheme: string;
  streakDays: number;
  consistencyScore: number;
  weekStart?: string;
}): string {
  const { totalActivities, dominantTheme, streakDays, consistencyScore, weekStart = "default" } = input;
  const isEn = isEnlEdition();

  if (totalActivities === 0) {
    const zeroVariants = isEn ? [
      "There have been no innerwork activities recorded this week. You can begin anytime from one small practice that feels achievable.",
      "This week has unfolded quietly without daily practice logs. A short pause or brief reflection is enough to start.",
      "No innerwork entries have been saved this week. Take your time to set a fresh rhythm that fits your capacity."
    ] : [
      "Belum ada aktivitas yang tercatat minggu ini. Kamu bisa mulai kapan pun dari satu latihan singkat yang terasa memungkinkan.",
      "Laporan minggu ini belum menemukan catatan latihan harian. Satu jeda singkat atau satu refleksi kecil sudah cukup untuk memulai.",
      "Minggu ini belum ada catatan innerwork yang tersimpan. Luangkan waktu sejenak untuk memulai ritme baru yang sesuai kapasitasmu."
    ];
    return pickVariant(zeroVariants, weekStart);
  }

  if (isEn) {
    return `In the past 7 days, you completed ${totalActivities} innerwork activities. The theme appearing most frequently was ${dominantTheme}, with a rhythm of ${streakDays} consecutive days and a consistency score of ${consistencyScore}. This shows your journey is moving slowly but genuinely, especially when you choose to show up for yourself.`;
  }

  return `Dalam 7 hari terakhir kamu menyelesaikan ${totalActivities} aktivitas innerwork. Hal yang paling sering muncul adalah ${dominantTheme}, dengan ritme ${streakDays} hari berturut-turut dan skor konsistensi ${consistencyScore}. Ini menunjukkan perjalananmu sedang bergerak pelan tapi nyata, terutama saat kamu memilih hadir untuk dirimu sendiri.`;
}

function buildWeeklyReflection(input: {
  totalActivities: number;
  previousWeekActivities: number;
  streakDays: number;
  weekStart?: string;
}): string {
  const { totalActivities, previousWeekActivities, streakDays, weekStart = "default" } = input;
  const isEn = isEnlEdition();

  if (totalActivities === 0) {
    const zeroVariants = isEn ? [
      "This week has unfolded quietly without practice records. You can start from one light practice or a brief note.",
      "No daily entries were logged this week. Returning can begin with a single pause whenever you are ready.",
      "This week's page has remained open. Take a few minutes today to check in with what you need."
    ] : [
      "Belum ada aktivitas yang tercatat minggu ini. Kamu bisa mulai dari satu latihan singkat atau satu catatan refleksi.",
      "Belum ada catatan latihan yang masuk minggu ini. Kamu bisa kembali memulai lewat satu jeda sederhana saat sudah siap.",
      "Catatan minggu ini masih kosong. Luangkan beberapa menit hari ini untuk memeriksa kebutuhanmu secara jujur."
    ];
    return pickVariant(zeroVariants, weekStart);
  }

  if (totalActivities > previousWeekActivities) {
    return isEn
      ? "This week you seemed more consistently present for yourself compared to the previous week."
      : "Minggu ini kamu tampak lebih konsisten hadir untuk dirimu sendiri dibanding minggu sebelumnya.";
  }

  if (streakDays >= 7) {
    return isEn
      ? "This week shows a rhythm you can begin to trust. No need to make it big; just keep it humane."
      : "Minggu ini memperlihatkan ritme yang mulai bisa kamu percaya. Tidak perlu dibuat besar; cukup dijaga agar tetap manusiawi.";
  }

  const defaultVariants = isEn ? [
    "This week still shows real movement. Even if the rhythm was not daily, your willingness to return provides a solid base.",
    "This week's rhythm moved at a quieter pace. Maintain consistency in small sizes that you can comfortably care for.",
    "There are steps you completed this week. You can build upon this gradual process in the days ahead."
  ] : [
    "Minggu ini tetap memiliki gerak nyata. Meskipun ritmenya belum penuh, kesediaanmu untuk kembali adalah fondasi yang baik.",
    "Ritme minggu ini bergerak dengan tempo yang lebih santai. Jaga konsistensi pada ukuran kecil yang sanggup kamu rawat.",
    "Ada langkah-langkah yang berhasil kamu selesaikan minggu ini. Kamu bisa melanjutkan proses bertahap ini ke minggu berikutnya."
  ];

  return pickVariant(defaultVariants, weekStart);
}

function buildClosingMessage(input: {
  dominantTheme: string;
  emotionalPattern: string;
  bodyPattern: string;
  hasEmotions?: boolean;
  hasBodySignals?: boolean;
}): string {
  const { dominantTheme, emotionalPattern, bodyPattern, hasEmotions, hasBodySignals } = input;
  const isEn = isEnlEdition();

  const openingClause = isEn
    ? "This week shows that your journey is not always linear, but still carries a gentle direction."
    : "Minggu ini memperlihatkan bahwa perjalananmu tidak selalu lurus, tetapi tetap punya arah yang lembut.";

  const themeClause = isEn
    ? `${dominantTheme} has appeared repeatedly as an invitation to notice what you are learning about yourself, rather than pressure to finish quickly.`
    : `${dominantTheme} tampak berulang sebagai ajakan untuk mengenali apa yang sedang kamu pelajari tentang dirimu, bukan sebagai tekanan untuk cepat selesai.`;

  let middleClause = "";
  if (isEn) {
    if (hasEmotions && hasBodySignals) {
      middleClause = `This week you noted feelings or states like ${emotionalPattern}, alongside body signals like ${bodyPattern}. Notice whether these patterns recur and what usually happens beforehand.`;
    } else if (hasEmotions) {
      middleClause = `This week you noted recurring states such as ${emotionalPattern}. You can look back at what situations most frequently accompanied them.`;
    } else if (hasBodySignals) {
      middleClause = `This week you recorded body signals such as ${bodyPattern}. Use this record to observe when these sensations most often appear.`;
    } else {
      middleClause = "This journey does not always demand acceleration; noticing your daily rhythm honestly is already meaningful progress.";
    }
  } else {
    if (hasEmotions && hasBodySignals) {
      middleClause = `Minggu ini kamu mencatat kondisi seperti ${emotionalPattern}, bersama sinyal tubuh seperti ${bodyPattern}. Perhatikan apakah pola ini muncul kembali dan apa yang biasanya terjadi sebelumnya.`;
    } else if (hasEmotions) {
      middleClause = `Minggu ini kamu beberapa kali mencatat kondisi seperti ${emotionalPattern}. Kamu bisa melihat kembali situasi apa yang paling sering menyertainya.`;
    } else if (hasBodySignals) {
      middleClause = `Minggu ini kamu mencatat sinyal tubuh seperti ${bodyPattern}. Gunakan catatan ini untuk memperhatikan kapan keluhan tersebut paling sering muncul.`;
    } else {
      middleClause = "Perjalanan ini tidak selalu menuntut percepatan; mengenali ritme harianmu secara jujur sudah merupakan langkah yang nyata.";
    }
  }

  const closingClause = isEn
    ? "Next week, you can continue with a more humane rhythm: one conscious step, one breath pause, then choosing what makes you feel settled. Pick one small matter you want to tend to next week."
    : "Minggu depan, kamu bisa melanjutkan dengan ritme yang lebih manusiawi: satu langkah sadar, satu jeda napas, lalu kembali memilih hal yang membuatmu merasa tenang. Pilih satu hal kecil yang ingin kamu rawat minggu depan.";

  return `${openingClause} ${themeClause} ${middleClause} ${closingClause}`;
}

function defaultReport(weekStart: string, weekEnd: string, blueprint: UnknownRecord | null | undefined): WeeklySoulReportOutput {
  const isEn = isEnlEdition();
  const growthSummary = buildGrowthSummary({
    totalActivities: 0,
    dominantTheme: isEn ? "No dominant pattern yet" : "Belum ada pola dominan",
    streakDays: 0,
    consistencyScore: 0,
    weekStart,
  });
  const weeklyReflection = buildWeeklyReflection({
    totalActivities: 0,
    previousWeekActivities: 0,
    streakDays: 0,
    weekStart,
  });

  return {
    weekStart,
    weekEnd,
    totalJournal: 0,
    totalMeditation: 0,
    totalAudioHealing: 0,
    dominantTheme: isEn ? "No dominant pattern yet" : "Belum ada pola dominan",
    emotionalPattern: isEn ? "No emotional pattern yet" : "Belum ada pola emosi",
    bodyPattern: isEn ? "No body pattern yet" : "Belum ada pola tubuh",
    growthSummary,
    weeklyReflection,
    blueprintReflection: buildBlueprintReflection(blueprint),
    recommendedFocusNextWeek: isEn
      ? "Start from one small practice every day so your innerwork rhythm takes shape."
      : "Mulai dari satu praktik kecil setiap hari agar ritme innerwork-mu terbentuk.",
    recommendedJournalPrompt: isEn
      ? "Today, what does yourself want to hear most without being judged?"
      : "Hari ini, apa yang paling ingin didengar oleh dirimu tanpa dihakimi?",
    recommendedMeditation: isEn
      ? "5-minute breath grounding while bringing attention to your chest and abdomen."
      : "Grounding napas 5 menit sambil meletakkan perhatian pada dada dan perut.",
    recommendedAudioHealing: isEn
      ? "Choose the audio that calms your body most, then listen without excessive targets."
      : "Pilih audio yang paling menenangkan tubuhmu, lalu dengarkan tanpa target berlebihan.",
    closingMessage: isEn
      ? "You can start at your own pace. Progress is nurtured by showing up honestly for yourself day by day."
      : "Kamu boleh mulai dengan tempo yang tenang. Kemajuan dibangun lewat kesediaan untuk hadir secara jujur dari hari ke hari.",
  };
}

export function createWeeklySoulReport(input: WeeklySoulReportInput): WeeklySoulReportOutput {
  const isEn = isEnlEdition();
  const now = new Date();
  const weekEndDate = new Date(now);
  const weekStartDate = new Date(now);
  weekStartDate.setDate(now.getDate() - 6);

  const weekStart = weekStartDate.toISOString().slice(0, 10);
  const weekEnd = weekEndDate.toISOString().slice(0, 10);

  const journalEntries = filterLastSevenDays(input.journalEntries ?? [], weekStart, weekEnd);
  const meditationEntries = filterLastSevenDays(input.meditationEntries ?? [], weekStart, weekEnd);
  const audioHealingEntries = filterLastSevenDays(input.audioHealingEntries ?? [], weekStart, weekEnd);
  const allEntries = [...journalEntries, ...meditationEntries, ...audioHealingEntries];
  const previousWeekStartDate = new Date(weekStartDate);
  previousWeekStartDate.setDate(weekStartDate.getDate() - 7);
  const previousWeekEndDate = new Date(weekStartDate);
  previousWeekEndDate.setDate(weekStartDate.getDate() - 1);
  const previousWeekStart = previousWeekStartDate.toISOString().slice(0, 10);
  const previousWeekEnd = previousWeekEndDate.toISOString().slice(0, 10);
  const previousWeekActivities = [
    ...filterLastSevenDays(input.journalEntries ?? [], previousWeekStart, previousWeekEnd),
    ...filterLastSevenDays(input.meditationEntries ?? [], previousWeekStart, previousWeekEnd),
    ...filterLastSevenDays(input.audioHealingEntries ?? [], previousWeekStart, previousWeekEnd),
  ].length;

  if (allEntries.length === 0) {
    return defaultReport(weekStart, weekEnd, input.blueprint);
  }

  const dominantTheme =
    getString(input.compiledInnerwork, ["dominantTheme"])
    ?? getString(input.healingInsights, ["weeklyFocus", "theme"])
    ?? getString(input.journeyData, ["weeklyFocus", "theme"])
    ?? countByString(allEntries, "theme")[0]?.value
    ?? "Self Worth";

  const emotionalCounts = countByString(allEntries, "emotionalState");
  const bodySignalCounts = countBodySignals(allEntries);
  const rawEmotions = emotionalCounts.slice(0, 3).map((e) => e.value);
  const rawBodySignals = bodySignalCounts.slice(0, 3).map((b) => b.value);
  const hasEmotions = rawEmotions.length > 0;
  const hasBodySignals = rawBodySignals.length > 0;
  const formattedEmotions = formatHumanList(rawEmotions, "dan", isEn);
  const formattedBodySignals = formatHumanList(rawBodySignals, "dan", isEn);

  const emotionalPattern =
    getString(input.compiledInnerwork, ["emotionalPattern"])
    ?? (hasEmotions ? formattedEmotions : (isEn ? "emotions are fluctuating" : "emosi bergerak dinamis"));
  const bodyPattern =
    getString(input.compiledInnerwork, ["bodyPattern"])
    ?? (hasBodySignals ? formattedBodySignals : (isEn ? "your body is asking for a pause" : "tubuh meminta jeda istirahat"));

  const streakDays = getNumber(input.progressData, ["streakDays"]) ?? 0;
  const consistencyScore = getNumber(input.progressData, ["consistencyScore"]) ?? 0;
  const growthSummary = buildGrowthSummary({
    totalActivities: allEntries.length,
    dominantTheme,
    streakDays,
    consistencyScore,
    weekStart,
  });

  const report: WeeklySoulReportOutput = {
    weekStart,
    weekEnd,
    totalJournal: journalEntries.length,
    totalMeditation: meditationEntries.length,
    totalAudioHealing: audioHealingEntries.length,
    dominantTheme,
    emotionalPattern,
    bodyPattern,
    growthSummary,
    weeklyReflection: buildWeeklyReflection({
      totalActivities: allEntries.length,
      previousWeekActivities,
      streakDays,
      weekStart,
    }),
    blueprintReflection: buildBlueprintReflection(input.blueprint),
    recommendedFocusNextWeek:
      getString(input.healingInsights, ["weeklyFocus", "practice"])
      ?? getString(input.compiledInnerwork, ["weeklyMessage"])
      ?? (isEn ? "Focus on gentle consistency: one small practice every day." : "Fokus pada konsistensi lembut: satu praktik kecil setiap hari."),
    recommendedJournalPrompt:
      getString(input.compiledInnerwork, ["recommendedNextJournalQuestion"])
      ?? getString(input.healingInsights, ["recommendedJournal"])
      ?? getString(input.journeyData, ["recommendedNextStep", "journal"])
      ?? (isEn ? "What is your most honest need from yourself this week?" : "Apa kebutuhan paling jujur dari dirimu minggu ini?"),
    recommendedMeditation:
      getString(input.compiledInnerwork, ["recommendedMeditationFocus"])
      ?? getString(input.healingInsights, ["recommendedMeditation"])
      ?? getString(input.journeyData, ["recommendedNextStep", "meditation"])
      ?? (isEn ? "7-minute breath meditation to calm the nervous system." : "Meditasi napas 7 menit untuk menenangkan sistem saraf."),
    recommendedAudioHealing:
      getString(input.compiledInnerwork, ["recommendedAudioHealingFocus"])
      ?? getString(input.healingInsights, ["recommendedAudioHealing"])
      ?? getString(input.journeyData, ["recommendedNextStep", "audioHealing"])
      ?? (isEn ? "Gentle audio grounding while observing your body signals." : "Audio grounding lembut sambil mengamati sinyal tubuhmu."),
    closingMessage: buildClosingMessage({
      dominantTheme,
      emotionalPattern: hasEmotions ? formattedEmotions : emotionalPattern,
      bodyPattern: hasBodySignals ? formattedBodySignals : bodyPattern,
      hasEmotions,
      hasBodySignals,
    }),
  };

  return report;
}

export function createWeeklySoulReportFromStorage(): WeeklySoulReportOutput | null {
  if (typeof window === "undefined") return null;

  const authUid = auth.currentUser?.uid;
  // Fallback search for scoped profile
  let uid = authUid;
  if (!uid) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('bhumiProfile:')) {
        uid = key.split(':')[1];
        break;
      }
    }
  }

  if (!uid) return null;

  const profile = readOwnedCacheObject<UnknownRecord>(`bhumiProfile:${uid}`, "weeklyReport:profile");
  const blueprint = readOwnedCacheObject<UnknownRecord>(`bhumiBlueprint:${uid}`, "weeklyReport:blueprint");
  const journalEntries = readOwnedCacheArray<UnknownRecord>(`bhumiJournalEntries:${uid}`, "weeklyReport:journalEntries");
  const meditationEntries = readOwnedCacheArray<UnknownRecord>(`bhumiMeditationEntries:${uid}`, "weeklyReport:meditationEntries");
  const audioHealingEntries = readOwnedCacheArray<UnknownRecord>(`bhumiAudioHealingEntries:${uid}`, "weeklyReport:audioHealingEntries");
  const healingInsights = readOwnedCacheObject<UnknownRecord>(`bhumiHealingInsights:${uid}`, "weeklyReport:healingInsights");
  const journeyData = readOwnedCacheObject<UnknownRecord>(`bhumiJourneyData:${uid}`, "weeklyReport:journeyData");
  const compiledInnerwork = readOwnedCacheObject<UnknownRecord>(`bhumiCompiledInnerwork:${uid}`, "weeklyReport:compiledInnerwork");
  const progressData = readOwnedCacheObject<UnknownRecord>(`bhumiProgressData:${uid}`, "weeklyReport:progressData");

  const report = createWeeklySoulReport({
    profile,
    blueprint,
    journalEntries,
    meditationEntries,
    audioHealingEntries,
    healingInsights,
    journeyData,
    compiledInnerwork,
    progressData,
  });

  const ownedReport = writeOwnedCacheObject(WEEKLY_SOUL_REPORT_STORAGE_KEY, report, "weeklyReport");
  console.log("[WEEKLY REPORT SOURCE]", {
    source: "local-derived-refresh",
    uid: ownedReport.uid ?? null,
    totalJournal: ownedReport.totalJournal,
    totalMeditation: ownedReport.totalMeditation,
    totalAudioHealing: ownedReport.totalAudioHealing,
  });
  return ownedReport;
}

export function hasWeeklySoulReportData(report: WeeklySoulReportOutput | null): boolean {
  if (!report) return false;
  return (report.totalJournal + report.totalMeditation + report.totalAudioHealing) > 0;
}

export function formatWeeklyRange(report: WeeklySoulReportOutput): string {
  return `${toDateLabel(report.weekStart)} - ${toDateLabel(report.weekEnd)}`;
}
