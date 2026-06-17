import type { DailyGuidance, DailyGuidanceCategory, DailyManifestation } from "@/lib/dailyGuidance/types";
import type { ProfileEchoV1 } from "@/lib/profile/echo";
import type { GaiaInsight } from "@/lib/profile/gaia/types";

export type DailyShareInsight = {
  id: string;
  label: string;
  content: string;
  chapter: ProfileEchoV1["chapters"][number]["id"];
};

export type DailyShareCardContent = {
  dateKey: string;
  reflection: string;
  dailyAdvice: { label: string; content: string };
  profileInsight: DailyShareInsight;
  manifestation: { label: string; content: string };
  footerQuote: string;
};

const DAY_MS = 86_400_000;
const FALLBACK_ADVICE = "Pilih satu langkah kecil yang paling jujur untukmu hari ini, lalu beri ruang agar tubuh dan pikiranmu bergerak dalam ritme yang sama.";
const FALLBACK_MANIFESTATION = "Hari ini aku memilih hadir sepenuhnya bagi diriku sendiri.";

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const shuffled = [...items];
  let state = hash(seed) || 1;
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const target = state % (index + 1);
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}

function dayNumber(dateKey: string): number {
  const parsed = Date.parse(`${dateKey}T00:00:00Z`);
  return Number.isFinite(parsed) ? Math.floor(parsed / DAY_MS) : 0;
}

function clean(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function buildReflection(guidance?: DailyGuidance | null): string {
  const sources = [
    guidance?.soulReflectionText,
    guidance?.dailyNoteText ?? guidance?.companionReflection?.fullReflection,
    guidance?.astrologyToday,
  ].map(clean).filter(Boolean);

  if (sources.length === 0) {
    return "Hari ini adalah ruang untuk mendengar dirimu dengan lebih jernih. Tidak semua jawaban perlu datang sekaligus; satu langkah yang jujur sudah cukup.";
  }

  return sources.map((source) => source.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ")).join(" ");
}

function pickDaily<T>(items: T[], seed: string, fallback: T): T {
  if (items.length === 0) return fallback;
  return items[hash(seed) % items.length];
}

function buildDailyAdvice(guidance: DailyGuidance | null | undefined, seed: string) {
  const categories = Object.values(guidance?.categories ?? {}) as DailyGuidanceCategory[];
  const advice = categories.map((category) => clean(category.advice)).filter(Boolean);
  return {
    label: "Saran Bhumi",
    content: pickDaily(advice, `${seed}:advice`, FALLBACK_ADVICE),
  };
}

function buildManifestation(manifestation: DailyManifestation | null | undefined, seed: string) {
  const laws = [
    { label: "Law of Affirmation", content: clean(manifestation?.affirmation) },
    { label: "Law of Assumption", content: clean(manifestation?.assumption) },
    { label: "Law of Attraction", content: clean(manifestation?.attraction) },
  ].filter((law) => law.content);
  return pickDaily(laws, `${seed}:manifestation`, {
    label: "Law of Affirmation",
    content: FALLBACK_MANIFESTATION,
  });
}

export function createDailyShareCardContent({
  echo,
  dateKey,
  userSeed,
  guidance,
  gaiaInsights = [],
}: {
  echo: ProfileEchoV1;
  dateKey: string;
  userSeed: string;
  guidance?: DailyGuidance | null;
  gaiaInsights?: GaiaInsight[];
}): DailyShareCardContent {
  const legacyPool = echo.chapters.flatMap((chapter) => chapter.features
    .filter((feature) => feature.status === "READY" && clean(feature.summary))
    .map((feature) => ({
      id: `${chapter.id}:${feature.id}`,
      label: feature.title,
      content: feature.summary,
      chapter: chapter.id,
    })));
  const gaiaPool = gaiaInsights.map((insight) => ({
    id: `gaia:${insight.id}`,
    label: insight.title,
    content: insight.narrative,
    chapter: "identity" as const,
  }));
  const pool = gaiaPool.length ? gaiaPool : legacyPool;

  const day = dayNumber(dateKey);
  const cycleLength = Math.max(pool.length, 1);
  const cycle = Math.floor(day / cycleLength);
  const position = ((day % cycleLength) + cycleLength) % cycleLength;
  const ordered = seededShuffle(pool, `${userSeed}:${cycle}`);
  const profileInsight = ordered[position % ordered.length] ?? {
    id: "profile:fallback",
    label: "Cermin Jiwa",
    content: "Hari ini, dengarkan bagian dirimu yang meminta ruang untuk tumbuh tanpa tergesa-gesa.",
    chapter: "identity" as const,
  };
  const dailySeed = `${userSeed}:${dateKey}`;

  return {
    dateKey,
    reflection: buildReflection(guidance),
    dailyAdvice: buildDailyAdvice(guidance, dailySeed),
    profileInsight,
    manifestation: buildManifestation(guidance?.manifestation, dailySeed),
    footerQuote: "Ruang Untuk Pulang dan Kenali Diri",
  };
}
