import type { DailyGuidance } from "@/lib/dailyGuidance/types";
import type { ProfileSection } from "@/lib/types/profileRuntime";
import { normalizeIndonesianSentenceCase } from "@/lib/utils/sentenceCase";

export type SoulMessageSection = {
  title: string;
  themeLabel: string;
  summary: string;
  source: "dailyConclusion";
};

export type ProfileTodaySection = {
  title: string;
  sourceSectionId: string;
  sectionTitle: string;
  summary: string;
  source: "akashiArchive";
};

export type ManifestationTodaySection = {
  title: string;
  lawType: "Law of Affirmation" | "Law of Assumption" | "Law of Attraction";
  text: string;
  source: "wellnessManifestation";
};

export type DailyShareCardContent = {
  soulMessage: SoulMessageSection;
  profileToday: ProfileTodaySection;
  manifestationToday: ManifestationTodaySection;
  metadata: {
    dateKey: string;
    locale: string;
    seedVersion: string;
  };
};

type ProfileSectionCandidate = {
  id: string;
  roomTitle: string;
  narrative: string;
  fallback: string;
};

type ManifestationCandidate = {
  id: string;
  lawType: ManifestationTodaySection["lawType"];
  text: string;
};

export type ThemeExplanationCandidate = {
  id: string;
  text: string;
  sourceTier: "primary" | "secondary";
};

const ULTIMATE_FALLBACK_THEME = "Tidak semua hal perlu dipaksa hari ini.";
const FALLBACK_SOUL_MESSAGE = "Tidak semua hal perlu dipaksa hari ini.";
const FALLBACK_MANIFESTATION = "Hari ini aku memilih hadir sepenuhnya bagi diriku sendiri.";
const FALLBACK_PROFILE_TITLE = "Cermin Jiwa";
const FALLBACK_PROFILE_SUMMARY = "Hari ini, dengarkan bagian dirimu yang meminta ruang untuk tumbuh tanpa tergesa-gesa.";
const SEED_VERSION = "1.0";

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function clean(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/[#*_`>~[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSentences(value: string): string[] {
  return clean(value)
    .split(/(?<=[.!?])["'"']?\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function stripThemePrefix(text: string | null | undefined): string {
  let cleaned = (text ?? "").trim();
  const pattern = /^\s*(tema\s+saat\s+ini|tema|pesan|catatan|penjelasan)\s*:\s*/i;
  while (pattern.test(cleaned)) {
    cleaned = cleaned.replace(pattern, "").trim();
  }
  return cleaned;
}

export function deduplicatePhrases(phrases: string[]): string[] {
  const result: string[] = [];
  const seenNormalized = new Set<string>();
  for (const raw of phrases) {
    const trimmed = (raw ?? "").trim();
    if (!trimmed) continue;
    const normalized = trimmed.toLowerCase().replace(/\s+/g, " ");
    if (!seenNormalized.has(normalized)) {
      seenNormalized.add(normalized);
      result.push(trimmed);
    }
  }
  return result;
}

export function formatSentenceCapitalization(text: string): string {
  return normalizeIndonesianSentenceCase(text);
}

export function composeProfileNarrative(phrases: string[]): { title: string; description: string } {
  const cleanPhrases = deduplicatePhrases(phrases);
  if (cleanPhrases.length === 0) {
    return { title: "", description: "" };
  }
  const title = cleanPhrases[0].trim();
  if (cleanPhrases.length === 1) {
    return { title, description: "" };
  }

  const remaining = cleanPhrases.slice(1).map((p) => p.trim());
  let rawDescription = "";

  if (remaining.length === 1) {
    const p = remaining[0];
    rawDescription = p.endsWith(".") ? p : `${p}.`;
  } else {
    const first = remaining[0];
    const rest = remaining.slice(1).map((p) => {
      let trimmed = p.trim();
      if (trimmed.endsWith(".")) trimmed = trimmed.slice(0, -1);
      return trimmed;
    }).join(", ");

    let combined = `${first}, dengan ${rest}`;
    if (!combined.endsWith(".")) combined += ".";
    rawDescription = combined;
  }

  const description = normalizeIndonesianSentenceCase(rawDescription);
  return { title, description };
}

function snippet(value: string | null | undefined, fallback: string, maxSentences = 2): string {
  const cleaned = clean(value);
  if (!cleaned) return normalizeIndonesianSentenceCase(fallback);
  const rawSentences = splitSentences(cleaned);
  const sentences = deduplicatePhrases(rawSentences);
  const selected = sentences.length > 0
    ? sentences.slice(0, maxSentences).join(" ")
    : cleaned;
  const result = selected.length > 220 ? `${selected.slice(0, 217).trim()}...` : selected;
  return normalizeIndonesianSentenceCase(result);
}

/**
 * Deterministic selection helper based on a given seed.
 */
export function selectDailyCandidate<T extends { id: string }>(
  candidates: T[],
  options: {
    userKey: string;
    dateKey: string;
    domainKey: "PROFILE_TODAY" | "MANIFESTATION_TODAY" | "SOUL_MESSAGE_THEME";
    cardInstanceSeed?: string;
  },
): T | null {
  if (!candidates.length) return null;
  if (candidates.length === 1) return candidates[0];
  const sorted = [...candidates].sort((a, b) => a.id.localeCompare(b.id));
  const seed = `${options.userKey}|${options.dateKey}|${options.domainKey}|${options.cardInstanceSeed || "default"}|${SEED_VERSION}`;
  const index = hash(seed) % sorted.length;
  return sorted[index];
}

function dailySeed(uid: string, dateKey: string, domain: string): string {
  return `${uid}|${dateKey}|${domain}|${SEED_VERSION}`;
}

const PROHIBITED_THEME_PATTERNS = [
  /^tema\s*\d+$/i,
  /^undefined$/i,
  /^null$/i,
  /^\[object\s+object\]$/i,
  /tema\s+tidak\s+tersedia/i,
  /berdasarkan\s+analisis\s+lengkap/i,
  /buka\s+halaman\s+premium/i,
  /langganan\s+premium/i,
  /upgrade\s+ke/i,
  /klik\s+di\s+sini/i,
  /kebijakan\s+privasi/i,
  /syarat\s+dan\s+ketentuan/i,
  /copyright/i,
  /http:\/\//i,
  /https:\/\//i,
];

function isProhibitedThemeText(text: string): boolean {
  if (!text || text.trim().length < 10 || text.trim().length > 220) return true;
  const trimmed = text.trim();
  return PROHIBITED_THEME_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * Extracts theme candidates with strict prioritization:
 * - Primary sources: companionReflection.fullReflection, dailyNarrativeParagraphs, categories.*.insight, categories.*.reason
 * - Secondary fallback sources: dailyConclusion.text, dailyNoteText, soulReflectionText, companionReflection.preview
 */
export function extractThemeExplanationCandidates(guidance?: DailyGuidance | null): {
  primary: ThemeExplanationCandidate[];
  secondary: ThemeExplanationCandidate[];
} {
  if (!guidance) return { primary: [], secondary: [] };

  const primaryRawBlocks: string[] = [];
  const secondaryRawBlocks: string[] = [];

  // Primary Sources
  if (guidance.companionReflection?.fullReflection) primaryRawBlocks.push(guidance.companionReflection.fullReflection);
  if (guidance.dailyNarrativeParagraphs && Array.isArray(guidance.dailyNarrativeParagraphs)) {
    primaryRawBlocks.push(...guidance.dailyNarrativeParagraphs);
  }
  if (guidance.categories) {
    Object.values(guidance.categories).forEach((cat) => {
      if (cat?.insight) primaryRawBlocks.push(cat.insight);
      if (cat?.reason) primaryRawBlocks.push(cat.reason);
    });
  }

  // Secondary Fallback Sources
  if (guidance.dailyConclusion?.text) secondaryRawBlocks.push(guidance.dailyConclusion.text);
  if (guidance.dailyNoteText) secondaryRawBlocks.push(guidance.dailyNoteText);
  if (guidance.soulReflectionText) secondaryRawBlocks.push(guidance.soulReflectionText);
  if (guidance.companionReflection?.preview) secondaryRawBlocks.push(guidance.companionReflection.preview);

  const processBlocks = (blocks: string[], tier: "primary" | "secondary"): ThemeExplanationCandidate[] => {
    const list: string[] = [];
    for (const block of blocks) {
      const cleanedBlock = stripThemePrefix(clean(block));
      if (!cleanedBlock) continue;
      const sentences = splitSentences(cleanedBlock);
      for (const sentence of sentences) {
        const normalizedSentence = normalizeIndonesianSentenceCase(sentence);
        if (!isProhibitedThemeText(normalizedSentence)) {
          list.push(normalizedSentence);
        }
      }
    }
    return deduplicatePhrases(list).map((text, idx) => ({
      id: `theme-${tier}-${idx}-${hash(text).toString(16)}`,
      text,
      sourceTier: tier,
    }));
  };

  return {
    primary: processBlocks(primaryRawBlocks, "primary"),
    secondary: processBlocks(secondaryRawBlocks, "secondary"),
  };
}

function buildSoulMessage(
  guidance?: DailyGuidance | null,
  seed?: string,
  cardInstanceSeed?: string,
): SoulMessageSection {
  const { primary, secondary } = extractThemeExplanationCandidates(guidance);

  let selectedText = ULTIMATE_FALLBACK_THEME;

  // Rule 3 & 4: Primary candidates ALWAYS prioritized before secondary fallbacks
  const targetCandidates = primary.length > 0 ? primary : secondary;

  if (targetCandidates.length > 0) {
    const selected = selectDailyCandidate(targetCandidates, {
      userKey: seed || "default-soul-seed",
      dateKey: "",
      domainKey: "SOUL_MESSAGE_THEME",
      cardInstanceSeed,
    });
    if (selected && selected.text) {
      selectedText = selected.text;
    }
  } else if (guidance?.dailyConclusion?.text || guidance?.dailyNoteText || guidance?.soulReflectionText) {
    const fallbackText = guidance.dailyConclusion?.text || guidance.dailyNoteText || guidance.soulReflectionText || "";
    selectedText = snippet(stripThemePrefix(fallbackText), ULTIMATE_FALLBACK_THEME, 2);
  }

  const summary = normalizeIndonesianSentenceCase(selectedText);

  return {
    title: "Pesan untuk Jiwamu",
    themeLabel: "Tema saat ini",
    summary,
    source: "dailyConclusion",
  };
}

function buildProfileCandidates(sections: ProfileSection[]): ProfileSectionCandidate[] {
  const candidates: ProfileSectionCandidate[] = [];
  const seen = new Set<string>();
  for (const section of sections) {
    const id = section.title.replace(/\s+/g, "-").toLowerCase();
    if (seen.has(id)) continue;
    seen.add(id);
    const rawNarratives = section.cards
      .map((c) => c.shortMeaning || c.actionableReflection || "")
      .filter(Boolean);
    const cleanPhrases = deduplicatePhrases(rawNarratives);
    if (!cleanPhrases.length) continue;

    const { title: archetypeTitle, description: composedDesc } = composeProfileNarrative(cleanPhrases);

    candidates.push({
      id,
      roomTitle: archetypeTitle || section.title,
      narrative: composedDesc || FALLBACK_PROFILE_SUMMARY,
      fallback: FALLBACK_PROFILE_SUMMARY,
    });
  }
  return candidates;
}

function buildProfileToday(
  candidates: ProfileSectionCandidate[],
  seed: string,
  cardInstanceSeed?: string,
): ProfileTodaySection {
  const selected = selectDailyCandidate(candidates, {
    userKey: seed,
    dateKey: "",
    domainKey: "PROFILE_TODAY",
    cardInstanceSeed,
  });
  if (!selected) {
    return {
      title: "Profil Hari Ini",
      sourceSectionId: "fallback",
      sectionTitle: FALLBACK_PROFILE_TITLE,
      summary: normalizeIndonesianSentenceCase(FALLBACK_PROFILE_SUMMARY),
      source: "akashiArchive",
    };
  }
  return {
    title: "Profil Hari Ini",
    sourceSectionId: selected.id,
    sectionTitle: selected.roomTitle,
    summary: snippet(selected.narrative, selected.fallback, 2),
    source: "akashiArchive",
  };
}

function buildManifestationCandidates(
  manifestation: DailyGuidance["manifestation"] | null | undefined,
): ManifestationCandidate[] {
  if (!manifestation) return [];
  const candidates: ManifestationCandidate[] = [];
  if (manifestation.affirmation?.trim()) {
    candidates.push({ id: "affirmation", lawType: "Law of Affirmation", text: normalizeIndonesianSentenceCase(manifestation.affirmation) });
  }
  if (manifestation.assumption?.trim()) {
    candidates.push({ id: "assumption", lawType: "Law of Assumption", text: normalizeIndonesianSentenceCase(manifestation.assumption) });
  }
  if (manifestation.attraction?.trim()) {
    candidates.push({ id: "attraction", lawType: "Law of Attraction", text: normalizeIndonesianSentenceCase(manifestation.attraction) });
  }
  return candidates;
}

function buildManifestationToday(
  candidates: ManifestationCandidate[],
  seed: string,
  cardInstanceSeed?: string,
): ManifestationTodaySection {
  const selected = selectDailyCandidate(candidates, {
    userKey: seed,
    dateKey: "",
    domainKey: "MANIFESTATION_TODAY",
    cardInstanceSeed,
  });
  if (!selected) {
    return {
      title: "Manifestasi Hari Ini",
      lawType: "Law of Affirmation",
      text: normalizeIndonesianSentenceCase(FALLBACK_MANIFESTATION),
      source: "wellnessManifestation",
    };
  }
  return {
    title: "Manifestasi Hari Ini",
    lawType: selected.lawType,
    text: selected.text,
    source: "wellnessManifestation",
  };
}

export function createDailyShareCardContent({
  profileSections,
  dateKey,
  userSeed,
  guidance,
  cardInstanceSeed,
}: {
  profileSections: ProfileSection[];
  dateKey: string;
  userSeed: string;
  guidance?: DailyGuidance | null;
  cardInstanceSeed?: string;
}): DailyShareCardContent {
  const profileSeed = dailySeed(userSeed, dateKey, "PROFILE_TODAY");
  const manifestationSeed = dailySeed(userSeed, dateKey, "MANIFESTATION_TODAY");
  const soulSeed = dailySeed(userSeed, dateKey, "SOUL_MESSAGE_THEME");

  const profileCandidates = buildProfileCandidates(profileSections);
  const manifestationCandidates = buildManifestationCandidates(guidance?.manifestation);

  return {
    soulMessage: buildSoulMessage(guidance, soulSeed, cardInstanceSeed),
    profileToday: buildProfileToday(profileCandidates, profileSeed, cardInstanceSeed),
    manifestationToday: buildManifestationToday(manifestationCandidates, manifestationSeed, cardInstanceSeed),
    metadata: {
      dateKey,
      locale: "id",
      seedVersion: SEED_VERSION,
    },
  };
}
