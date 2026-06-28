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
const FALLBACK_REFLECTION = "Hari ini adalah ruang untuk mendengar dirimu dengan lebih jernih.";
const FALLBACK_CATATAN = "Setiap langkah kecil yang kamu ambil hari ini memiliki maknanya sendiri.";

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
  return (value ?? "")
    .replace(/[#*_`>~[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripMirrorGreeting(value: string): string {
  return value.replace(/^Hai [^,]+, selamat hari [^.]+.\s*/i, "");
}

function splitSentences(value: string): string[] {
  return clean(value)
    .split(/(?<=[.!?])["'”’]?\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function snippet(value: string | null | undefined, fallback: string, maxSentences = 2): string {
  const cleaned = clean(value);
  if (!cleaned) return fallback;
  const sentences = splitSentences(cleaned);
  const selected = sentences.length > 0
    ? sentences.slice(0, maxSentences).join(" ")
    : cleaned;
  return selected.length > 220 ? `${selected.slice(0, 217).trim()}...` : selected;
}

function buildReflection(guidance?: DailyGuidance | null): string {
  return snippet(stripMirrorGreeting(clean(guidance?.soulReflectionText)), FALLBACK_REFLECTION, 2);
}

function pickDaily<T>(items: T[], seed: string, fallback: T): T {
  if (items.length === 0) return fallback;
  return items[hash(seed) % items.length];
}

function buildCatatanHariIni(guidance?: DailyGuidance | null) {
  return {
    label: "Pesan untuk Jiwamu",
    content: snippet(guidance?.dailyNoteText, FALLBACK_CATATAN, 2),
  };
}

function buildManifestation(manifestation: DailyManifestation | null | undefined) {
  const affirmation = snippet(manifestation?.affirmation, FALLBACK_MANIFESTATION, 2);
  return {
    label: "Law of Affirmation",
    content: affirmation,
  };
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
      content: snippet(card.shortMeaning, "Hari ini, dengarkan bagian dirimu yang meminta ruang untuk tumbuh tanpa tergesa-gesa.", 2),
      reflection: snippet(card.actionableReflection, "Amati bagian dirimu ini hari ini dengan lebih lembut.", 1),
      theme: "general",
      chapter: section.title,
    }))
  );
  const gaiaPool = gaiaInsights.map((insight) => ({
    id: `gaia:${insight.id}`,
    label: insight.title,
    content: snippet(insight.summary || insight.narrative, "Hari ini, dengarkan bagian dirimu yang meminta ruang untuk tumbuh tanpa tergesa-gesa.", 2),
    reflection: snippet(insight.guidance?.[0], "Amati bagian dirimu ini hari ini dengan lebih lembut.", 1),
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
  return {
    dateKey,
    reflection: buildReflection(guidance),
    catatanHariIni: buildCatatanHariIni(guidance),
    profileInsight,
    manifestation: buildManifestation(guidance?.manifestation),
    footerQuote: "Ruang Untuk Pulang dan Kenali Diri",
  };
}
