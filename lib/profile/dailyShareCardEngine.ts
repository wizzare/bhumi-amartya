import type { DailyGuidance, DailyGuidanceCategory, DailyManifestation } from "@/lib/dailyGuidance/types";
import type { ProfileEchoV1 } from "@/lib/profile/echo";
import type { GaiaInsight } from "@/lib/profile/gaia/types";
import { applyDynamicGreetingPrefix } from "@/lib/dailyGuidance/timeOfDayGreeting";

export type DailyShareInsight = {
  id: string;
  label: string;
  content: string; // Used for summary
  reflection?: string;
  theme?: string;
  chapter: ProfileEchoV1["chapters"][number]["id"];
};

export type DailyShareCardContent = {
  dateKey: string;
  reflection: string;
  catatanHariIni: { label: string; content: string };
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

function truncateSentences(text: string, maxSentences: number): string {
  if (!text || typeof text !== "string") return "";
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  if (sentences.length <= maxSentences) return text.trim();
  return sentences.slice(0, maxSentences).join(" ").trim();
}

function buildReflection(guidance?: DailyGuidance | null, now: Date = new Date()): string {
  const sources = [
    guidance?.soulReflectionText,
    guidance?.dailyNoteText ?? guidance?.companionReflection?.fullReflection,
    guidance?.astrologyToday,
  ].map(clean).filter(Boolean);

  if (sources.length === 0) {
    return "Hari ini adalah ruang untuk mendengar dirimu dengan lebih jernih. Tidak semua jawaban perlu datang sekaligus; satu langkah yang jujur sudah cukup.";
  }

  return applyDynamicGreetingPrefix(truncateSentences(sources.join(" "), 3), "id", now);
}

function pickDaily<T>(items: T[], seed: string, fallback: T): T {
  if (items.length === 0) return fallback;
  return items[hash(seed) % items.length];
}

function buildCatatanHariIni(guidance: DailyGuidance | null | undefined, seed: string) {
  const note = clean(guidance?.dailyNoteText ?? guidance?.companionReflection?.fullReflection);
  const selectedInsight = note || "Setiap langkah kecil yang kamu ambil hari ini memiliki maknanya sendiri.";
  return {
    label: "Catatan Hari Ini",
    content: truncateSentences(selectedInsight, 3),
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
  now = new Date(),
}: {
  echo: ProfileEchoV1;
  dateKey: string;
  userSeed: string;
  guidance?: DailyGuidance | null;
  gaiaInsights?: GaiaInsight[];
  now?: Date;
}): DailyShareCardContent {
  const legacyPool = echo.chapters.flatMap((chapter) => chapter.features
    .filter((feature) => feature.status === "READY" && clean(feature.summary))
    .map((feature) => ({
      id: `${chapter.id}:${feature.id}`,
      label: feature.title,
      content: truncateSentences(feature.summary, 3),
      reflection: "Amati bagian dirimu ini hari ini dengan lebih lembut.",
      theme: "general",
      chapter: chapter.id,
    })));
  const gaiaPool = gaiaInsights.map((insight) => ({
    id: `gaia:${insight.id}`,
    label: insight.title,
    content: truncateSentences(insight.summary || insight.narrative, 3),
    reflection: truncateSentences(insight.guidance?.[0] ?? "Amati bagian dirimu ini hari ini dengan lebih lembut.", 1),
    theme: insight.theme,
    chapter: "identity" as const,
  }));
  const pool = [...legacyPool, ...gaiaPool];

  const day = dayNumber(dateKey);
  const cycleLength = Math.max(pool.length, 1);
  const cycle = Math.floor(day / cycleLength);
  const position = ((day % cycleLength) + cycleLength) % cycleLength;
  const ordered = seededShuffle(pool, `${userSeed}:${cycle}`);
  const profileInsight = ordered[position % ordered.length] ?? {
    id: "profile:fallback",
    label: "Cermin Jiwa",
    content: "Hari ini, dengarkan bagian dirimu yang meminta ruang untuk tumbuh tanpa tergesa-gesa.",
    reflection: "Langkah kecil apa yang bisa kuambil dengan lebih tulus?",
    theme: "general",
    chapter: "identity" as const,
  };
  const dailySeed = `${userSeed}:${dateKey}`;

  return {
    dateKey,
    reflection: buildReflection(guidance, now),
    catatanHariIni: buildCatatanHariIni(guidance, dailySeed),
    profileInsight,
    manifestation: buildManifestation(guidance?.manifestation, dailySeed),
    footerQuote: "Ruang Untuk Pulang dan Kenali Diri",
  };
}
