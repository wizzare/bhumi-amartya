import { auth } from "@/lib/firebase/firebase";
import {
  readOwnedCacheArray,
  readOwnedCacheObject,
  writeOwnedCacheObject,
} from "@/lib/storage/derivedCacheOwnership";

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
  return new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
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

function topOrFallback(items: Array<{ value: string; count: number }>, fallback: string): string {
  if (items.length === 0) return fallback;
  return items
    .slice(0, 3)
    .map((item) => item.value)
    .join(", ");
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
  const lifePath = getNumber(blueprint, ["lifePath", "number"]) ?? getNumber(blueprint, ["numerology", "number"]);
  const humanDesignType = getString(blueprint, ["humanDesign", "type"]);
  const arcanaCenter = getNumber(blueprint, ["arcanaCenter", "number"]) ?? getNumber(blueprint, ["destinyMatrix", "center"]);
  const sunSign = getString(blueprint, ["sunSign", "sign"]) ?? getString(blueprint, ["natalChart", "sunSign"]);

  const lines: string[] = [];
  if (lifePath) lines.push("Minggu ini, perjalananmu tampak lebih mudah tumbuh lewat langkah kecil yang konsisten daripada dorongan besar yang sulit dijaga.");
  if (humanDesignType) lines.push("Tubuhmu cenderung memberi sinyal yang lebih jelas saat ritmemu tidak dipaksa.");
  if (arcanaCenter) lines.push("Ada undangan untuk melihat pola lama dengan jujur, lalu membuka ruang bagi respons yang lebih baru.");
  if (sunSign) lines.push("Cara kamu merawat emosi minggu ini mungkin terasa lebih personal saat kamu memberi ruang pada kebutuhan yang biasanya dilewati.");

  if (lines.length === 0) {
    return "Perjalananmu akan terasa lebih selaras ketika kamu mendengar sinyal tubuhmu sebelum mengambil keputusan besar.";
  }

  return lines.join(" ");
}

function buildGrowthSummary(input: {
  totalActivities: number;
  dominantTheme: string;
  streakDays: number;
  consistencyScore: number;
}): string {
  const { totalActivities, dominantTheme, streakDays, consistencyScore } = input;

  if (totalActivities === 0) {
    return "Belum ada aktivitas innerwork dalam 7 hari terakhir, jadi laporan masih menunggu jejak pertamamu minggu ini.";
  }

  return `Dalam 7 hari terakhir kamu menyelesaikan ${totalActivities} aktivitas innerwork. Hal yang paling sering muncul adalah ${dominantTheme}, dengan ritme ${streakDays} hari berturut-turut dan consistency score ${consistencyScore}. Ini menunjukkan perjalananmu sedang bergerak pelan tapi nyata, terutama saat kamu memilih hadir untuk dirimu sendiri.`;
}

function buildWeeklyReflection(input: {
  totalActivities: number;
  previousWeekActivities: number;
  streakDays: number;
}): string {
  const { totalActivities, previousWeekActivities, streakDays } = input;

  if (totalActivities === 0) {
    return "Minggu ini masih menunggu jejak pertamanya. Kamu bisa mulai dari satu praktik kecil yang terasa paling mungkin.";
  }

  if (totalActivities > previousWeekActivities) {
    return "Minggu ini kamu tampak lebih konsisten hadir untuk dirimu sendiri dibanding minggu sebelumnya.";
  }

  if (streakDays >= 7) {
    return "Minggu ini memperlihatkan ritme yang mulai bisa kamu percaya. Tidak perlu dibuat besar; cukup dijaga agar tetap manusiawi.";
  }

  return "Minggu ini tetap punya gerak. Bahkan ketika belum penuh, ada bagian dari dirimu yang masih memilih kembali.";
}

function buildClosingMessage(input: {
  dominantTheme: string;
  emotionalPattern: string;
  bodyPattern: string;
}): string {
  const { dominantTheme, emotionalPattern, bodyPattern } = input;

  return `Minggu ini memperlihatkan bahwa perjalananmu tidak selalu lurus, tetapi tetap punya arah yang lembut. ${dominantTheme} tampak berulang sebagai undangan untuk mengenali apa yang sedang kamu pelajari tentang dirimu, bukan sebagai tekanan untuk cepat selesai. Saat emosi seperti ${emotionalPattern} muncul, tubuhmu juga berbicara lewat sinyal seperti ${bodyPattern}. Itu tanda bahwa dirimu sedang memproses, bukan gagal. Minggu depan, kamu bisa melanjutkan dengan ritme yang lebih manusiawi: satu langkah sadar, satu jeda napas, lalu kembali memilih hal yang membuatmu merasa lebih utuh. Kamu tidak perlu menjadi sempurna untuk bertumbuh. Cukup terus hadir, karena kehadiranmu sendiri sudah menjadi bentuk healing yang nyata.`;
}

function defaultReport(weekStart: string, weekEnd: string, blueprint: UnknownRecord | null | undefined): WeeklySoulReportOutput {
  return {
    weekStart,
    weekEnd,
    totalJournal: 0,
    totalMeditation: 0,
    totalAudioHealing: 0,
    dominantTheme: "Belum ada pola dominan",
    emotionalPattern: "Belum ada pola emosi",
    bodyPattern: "Belum ada pola tubuh",
    growthSummary: "Belum ada aktivitas innerwork dalam 7 hari terakhir, jadi laporan masih menunggu jejak pertamamu minggu ini.",
    weeklyReflection: "Minggu ini masih menunggu jejak pertamanya. Kamu bisa mulai dari satu praktik kecil yang terasa paling mungkin.",
    blueprintReflection: buildBlueprintReflection(blueprint),
    recommendedFocusNextWeek: "Mulai dari satu praktik kecil setiap hari agar ritme innerwork-mu terbentuk.",
    recommendedJournalPrompt: "Hari ini, apa yang paling ingin didengar oleh dirimu tanpa dihakimi?",
    recommendedMeditation: "Grounding napas 5 menit sambil meletakkan perhatian pada dada dan perut.",
    recommendedAudioHealing: "Pilih audio yang paling menenangkan tubuhmu, lalu dengarkan tanpa target berlebihan.",
    closingMessage: "Kamu boleh mulai pelan. Perjalananmu tidak ditentukan oleh seberapa cepat kamu berubah, tetapi oleh seberapa jujur kamu hadir untuk dirimu dari hari ke hari.",
  };
}

export function createWeeklySoulReport(input: WeeklySoulReportInput): WeeklySoulReportOutput {
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
  const emotionalPattern =
    getString(input.compiledInnerwork, ["emotionalPattern"])
    ?? topOrFallback(emotionalCounts, "emosi sedang bergerak naik-turun");
  const bodyPattern =
    getString(input.compiledInnerwork, ["bodyPattern"])
    ?? topOrFallback(bodySignalCounts, "tubuhmu meminta jeda yang lebih lembut");

  const streakDays = getNumber(input.progressData, ["streakDays"]) ?? 0;
  const consistencyScore = getNumber(input.progressData, ["consistencyScore"]) ?? 0;
  const growthSummary = buildGrowthSummary({
    totalActivities: allEntries.length,
    dominantTheme,
    streakDays,
    consistencyScore,
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
    }),
    blueprintReflection: buildBlueprintReflection(input.blueprint),
    recommendedFocusNextWeek:
      getString(input.healingInsights, ["weeklyFocus", "practice"])
      ?? getString(input.compiledInnerwork, ["weeklyMessage"])
      ?? "Fokus pada konsistensi lembut: satu praktik kecil setiap hari.",
    recommendedJournalPrompt:
      getString(input.compiledInnerwork, ["recommendedNextJournalQuestion"])
      ?? getString(input.healingInsights, ["recommendedJournal"])
      ?? getString(input.journeyData, ["recommendedNextStep", "journal"])
      ?? "Apa kebutuhan paling jujur dari dirimu minggu ini?",
    recommendedMeditation:
      getString(input.compiledInnerwork, ["recommendedMeditationFocus"])
      ?? getString(input.healingInsights, ["recommendedMeditation"])
      ?? getString(input.journeyData, ["recommendedNextStep", "meditation"])
      ?? "Meditasi napas 7 menit untuk menenangkan sistem saraf.",
    recommendedAudioHealing:
      getString(input.compiledInnerwork, ["recommendedAudioHealingFocus"])
      ?? getString(input.healingInsights, ["recommendedAudioHealing"])
      ?? getString(input.journeyData, ["recommendedNextStep", "audioHealing"])
      ?? "Audio grounding lembut sambil mengamati sinyal tubuhmu.",
    closingMessage: buildClosingMessage({
      dominantTheme,
      emotionalPattern,
      bodyPattern,
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
