import type { DailyGuidance, DailyManifestation } from "@/lib/dailyGuidance/types";
import type { ProfileSection } from "@/lib/types/profileRuntime";
import type { GaiaInsight } from "@/lib/profile/gaia/types";

export type DailyShareInsight = {
  id: string;
  label: string;
  content: string;
  reflection?: string;
  theme?: string;
  chapter: string;
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

// Deterministic weekday rhythmic calculation
function dayNumber(dateKey: string): number {
  const parsed = Date.parse(`${dateKey}T00:00:00Z`);
  return Number.isFinite(parsed) ? Math.floor(parsed / DAY_MS) : 0;
}

function clean(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function buildReflection(guidance?: DailyGuidance | null): string {
  const text = clean(guidance?.soulReflectionText);
  if (!text) {
    return "Hari ini adalah ruang untuk mendengar dirimu dengan lebih jernih. Tidak semua jawaban perlu datang sekaligus; satu langkah yang jujur sudah cukup.";
  }
  return text;
}

function pickDaily<T>(items: T[], seed: string, fallback: T): T {
  if (items.length === 0) return fallback;
  return items[hash(seed) % items.length];
}

function buildCatatanHariIni(guidance?: DailyGuidance | null) {
  const text = clean(guidance?.dailyNoteText);
  const selectedInsight = text || "Setiap langkah kecil yang kamu ambil hari ini memiliki maknanya sendiri.";
  return {
    label: "Catatan Hari Ini",
    content: selectedInsight,
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
  profileSections,
  dateKey,
  userSeed,
  guidance,
  gaiaInsights = [],
}: {
  profileSections: ProfileSection[];
  dateKey: string;
  userSeed: string;
  guidance?: DailyGuidance | null;
  gaiaInsights?: GaiaInsight[];
  now?: Date;
}): DailyShareCardContent {
  const legacyPool = profileSections.flatMap((section) =>
    section.cards.map((card) => ({
      id: `${section.title}:${card.title}`,
      label: card.title,
      content: card.shortMeaning,
      reflection: card.actionableReflection || "Amati bagian dirimu ini hari ini dengan lebih lembut.",
      theme: "general",
      chapter: section.title,
    }))
  );
  const gaiaPool = gaiaInsights.map((insight) => ({
    id: `gaia:${insight.id}`,
    label: insight.title,
    content: insight.summary || insight.narrative,
    reflection: insight.guidance?.[0] || "Amati bagian dirimu ini hari ini dengan lebih lembut.",
    theme: insight.theme,
    chapter: "identity",
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
    chapter: "identity",
  };
  const dailySeed = `${userSeed}:${dateKey}`;

  return {
    dateKey,
    reflection: buildReflection(guidance),
    catatanHariIni: buildCatatanHariIni(guidance),
    profileInsight,
    manifestation: buildManifestation(guidance?.manifestation, dailySeed),
    footerQuote: "Ruang Untuk Pulang dan Kenali Diri",
  };
}
