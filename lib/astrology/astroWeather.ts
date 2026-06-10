import type { JournalEntry } from "@/lib/data/types";
import type { AstrologyTransitContext } from "@/lib/orchestrators/types";
import type { Blueprint } from "@/lib/types/blueprint";
import type { UserHealingProgress } from "@/lib/types/user";
import type { DailyState } from "@/lib/repositories/dailyStateRepository";

type TransitRecord = AstrologyTransitContext["activeTransits"][number];

export type AstroWeatherReflection = {
  currentSky: {
    moonPhase: string | null;
    nextMajorMoonPhase?: string;
    retrogrades: string[];
    majorAspects: string[];
    eclipses: string[];
    transitSummary: string;
    planetPeriods?: Array<{ planet: string; sign: string; period: string }>;
  };
  collectiveTheme: string;
  personalReflection: string;
  suggestedPractice: string;
  journalPrompt: string;
};

const FALLBACK_MESSAGE = "Belum ada data transit astrologi hari ini.";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : null))
    .filter((item): item is string => Boolean(item));
}

function formatTransit(transit: TransitRecord): string {
  const parts = [
    transit.planet,
    transit.aspect,
    transit.sign ? `di ${transit.sign}` : null,
    transit.house ? `rumah ${transit.house}` : null,
  ].filter(Boolean);

  return parts.join(" ");
}

function extractMoonPhase(transits: Record<string, unknown>): string | null {
  const moonPhase =
    asString(transits.moonPhase) ||
    asString(transits.lunarPhase) ||
    asString(transits.currentMoonPhase);

  if (!moonPhase) return null;
  const normalized = moonPhase.toLowerCase();
  if (normalized.includes("full")) return "Bulan Purnama";
  if (normalized.includes("new")) return "Bulan Baru";
  return moonPhase;
}

function extractRetrogrades(
  transits: AstrologyTransitContext,
  rawTransits: Record<string, unknown>,
): string[] {
  const explicit = asStringArray(rawTransits.retrogrades);
  const active = (transits.activeTransits ?? [])
    .filter((transit) => transit.aspect?.toLowerCase().includes("retrograde"))
    .map((transit) => transit.planet);

  return Array.from(new Set([...explicit, ...active]));
}

function extractAspects(
  transits: AstrologyTransitContext,
  rawTransits: Record<string, unknown>,
): string[] {
  const explicit = asStringArray(rawTransits.majorAspects);
  const active = (transits.activeTransits ?? [])
    .filter((transit) => transit.aspect && !transit.aspect.toLowerCase().includes("retrograde"))
    .map(formatTransit);

  return Array.from(new Set([...explicit, ...active])).slice(0, 5);
}

function extractJournalSummary(entries: JournalEntry[]): string {
  const latest = entries[0];
  if (!latest) return "belum ada ringkasan jurnal terbaru";

  const analysis = latest.emotionalAnalysis;
  if (analysis) {
    const themes = analysis.recurringThemes.slice(0, 2).join(", ");
    return [
      analysis.primaryEmotion,
      themes ? `tema ${themes}` : null,
      analysis.gentleInsight,
    ]
      .filter(Boolean)
      .join("; ");
  }

  return latest.content.trim().slice(0, 120) || "jurnal terbaru masih sangat singkat";
}

function choosePractice(
  moodLevel: number | null | undefined,
  themes: string[],
  healingProgress: UserHealingProgress,
): string {
  if (moodLevel !== null && moodLevel !== undefined && moodLevel <= 4) {
    return "grounding 5 menit dengan napas pelan, telapak kaki menyentuh lantai, lalu tulis satu kebutuhan tubuh.";
  }

  if (themes.some((theme) => theme.toLowerCase().includes("boundary"))) {
    return "refleksi batas diri: tulis satu batas sehat yang perlu kamu jaga hari ini.";
  }

  if (healingProgress.totalMeditationMinutes < 20) {
    return "meditasi singkat 8 menit untuk memperhatikan tubuh sebelum mengambil kesimpulan.";
  }

  return "jalan pelan atau journaling ringan untuk menamai apa yang sedang bergerak di dalam diri.";
}

export function buildAstroWeatherReflection({
  transits,
  currentSky,
  blueprint,
  dailyState,
  healingProgress,
  journalEntries,
}: {
  transits: AstrologyTransitContext | null;
  currentSky?: any;
  blueprint: Blueprint;
  dailyState: DailyState | null;
  healingProgress: UserHealingProgress;
  journalEntries: JournalEntry[];
}): AstroWeatherReflection | null {
  if (!transits && !currentSky) return null;

  const rawTransits = asRecord(transits);
  const activeTransits = transits?.activeTransits ?? [];
  const firstTransit = activeTransits[0];
  const themes = activeTransits.flatMap((transit) => transit.themes ?? []).filter(Boolean);

  // Extract Moon Phase Details
  const moonPhase = currentSky?.moonPhase || extractMoonPhase(rawTransits);
  let nextMajorMoonPhase = undefined;
  if (currentSky?.nextMajorPhase) {
    const { phase, date, daysDiff } = currentSky.nextMajorPhase;
    const phaseIndo = phase === "New Moon" ? "Bulan Baru" : "Bulan Purnama";
    nextMajorMoonPhase = `Menuju ${phaseIndo} pada ${date} (±${daysDiff} hari)`;
  }

  // Extract Planet Periods
  const planetPeriods = currentSky?.bodies
    ? currentSky.bodies
        .filter((b: any) => b.body !== "Moon" && b.periodStart && b.periodEnd)
        .map((b: any) => ({
          planet: b.body === "Sun" ? "Matahari" : b.body,
          sign: b.sign,
          period: `${b.periodStart} - ${b.periodEnd}`
        }))
    : undefined;

  const blueprintSunSign =
    blueprint.astrology?.sunSign ||
    blueprint.natalChart?.sunSign ||
    (blueprint as any).sunSign?.sign ||
    (blueprint as any).sunSign ||
    "pacing batin";
  const primaryTheme = themes[0] || dailyState?.emotionalWord || blueprintSunSign;
  const journalSummary = extractJournalSummary(journalEntries);
  const moodText =
    dailyState?.moodLevel !== null && dailyState?.moodLevel !== undefined
      ? `suasana hati ${dailyState.moodLevel}/10`
      : "suasana hati belum dicatat";
  const transitName = firstTransit ? formatTransit(firstTransit) : (transits?.summary || "Energi kosmik");
  const retrogrades = extractRetrogrades(transits || { source: "manual", generatedAt: "", summary: "", activeTransits: [] }, rawTransits);
  const majorAspects = extractAspects(transits || { source: "manual", generatedAt: "", summary: "", activeTransits: [] }, rawTransits);
  const eclipses = asStringArray(rawTransits.eclipses);
  const transitSummary = transits?.summary || transitName || FALLBACK_MESSAGE;
  const suggestedPractice = choosePractice(dailyState?.moodLevel, themes, healingProgress);

  return {
    currentSky: {
      moonPhase,
      nextMajorMoonPhase,
      retrogrades,
      majorAspects,
      eclipses,
      transitSummary,
      planetPeriods,
    },
    collectiveTheme:
      `Cuaca kolektif hari ini mengajak perhatian pada tema ${primaryTheme}. ` +
      "Ini bukan tanda pasti, melainkan konteks lembut untuk membaca ritme, pilihan, dan kapasitas dirimu dengan lebih sadar.",
    personalReflection:
      `Dengan blueprint ${blueprintSunSign}, ${moodText}, dan ringkasan jurnalmu: ${journalSummary}, ` +
      `${transitName} mungkin terasa seperti ajakan untuk memperlambat respons dan mengecek kembali kebutuhan batinmu. ` +
      `Kamu mungkin menyadari tema ${primaryTheme} muncul sebagai bahan refleksi, bukan sesuatu yang harus dipaksakan menjadi keputusan segera.`,
    suggestedPractice,
    journalPrompt:
      `Apa yang mungkin sedang meminta diperhatikan dalam diriku hari ini, dan praktik kecil apa yang bisa membantuku merespons tema ${primaryTheme} dengan lebih membumi?`,
  };
}

export const ASTRO_WEATHER_FALLBACK_MESSAGE = FALLBACK_MESSAGE;
