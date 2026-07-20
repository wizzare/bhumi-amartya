import type { DailyGuidance } from "@/lib/dailyGuidance/types";
import type { ProfileSection } from "@/lib/types/profileRuntime";

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

const FALLBACK_SOUL_MESSAGE = "Refleksi hari ini belum tersedia.";
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

function snippet(value: string | null | undefined, fallback: string, maxSentences = 2): string {
  const cleaned = clean(value);
  if (!cleaned) return fallback;
  const sentences = splitSentences(cleaned);
  const selected = sentences.length > 0
    ? sentences.slice(0, maxSentences).join(" ")
    : cleaned;
  return selected.length > 220 ? `${selected.slice(0, 217).trim()}...` : selected;
}

/**
 * Deterministic daily selection helper.
 *
 * Same inputs always produce the same selected candidate.
 * Candidate array reordering does NOT change the result because selection
 * is based on stable candidate IDs sorted before scoring.
 */
export function selectDailyCandidate<T extends { id: string }>(
  candidates: T[],
  options: {
    userKey: string;
    dateKey: string;
    domainKey: "PROFILE_TODAY" | "MANIFESTATION_TODAY";
  },
): T | null {
  if (!candidates.length) return null;
  if (candidates.length === 1) return candidates[0];
  const sorted = [...candidates].sort((a, b) => a.id.localeCompare(b.id));
  const seed = `${options.userKey}|${options.dateKey}|${options.domainKey}|${SEED_VERSION}`;
  const index = hash(seed) % sorted.length;
  return sorted[index];
}

function dailySeed(uid: string, dateKey: string, domain: string): string {
  return `${uid}|${dateKey}|${domain}|${SEED_VERSION}`;
}

function buildSoulMessage(guidance?: DailyGuidance | null): SoulMessageSection {
  const text = guidance?.dailyConclusion?.text || guidance?.dailyNoteText || guidance?.soulReflectionText || "";
  const summary = snippet(text, FALLBACK_SOUL_MESSAGE, 2);
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
    const narratives = section.cards
      .map((c) => c.shortMeaning || c.actionableReflection || "")
      .filter(Boolean);
    const combined = narratives.join(" ");
    if (!combined.trim()) continue;
    candidates.push({
      id,
      roomTitle: section.title,
      narrative: combined,
      fallback: FALLBACK_PROFILE_SUMMARY,
    });
  }
  return candidates;
}

function buildProfileToday(
  candidates: ProfileSectionCandidate[],
  seed: string,
): ProfileTodaySection {
  const selected = selectDailyCandidate(candidates, {
    userKey: seed,
    dateKey: "",
    domainKey: "PROFILE_TODAY",
  });
  if (!selected) {
    return {
      title: "Profil Hari Ini",
      sourceSectionId: "fallback",
      sectionTitle: FALLBACK_PROFILE_TITLE,
      summary: FALLBACK_PROFILE_SUMMARY,
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
    candidates.push({ id: "affirmation", lawType: "Law of Affirmation", text: manifestation.affirmation });
  }
  if (manifestation.assumption?.trim()) {
    candidates.push({ id: "assumption", lawType: "Law of Assumption", text: manifestation.assumption });
  }
  if (manifestation.attraction?.trim()) {
    candidates.push({ id: "attraction", lawType: "Law of Attraction", text: manifestation.attraction });
  }
  return candidates;
}

function buildManifestationToday(
  candidates: ManifestationCandidate[],
  seed: string,
): ManifestationTodaySection {
  const selected = selectDailyCandidate(candidates, {
    userKey: seed,
    dateKey: "",
    domainKey: "MANIFESTATION_TODAY",
  });
  if (!selected) {
    return {
      title: "Manifestasi Hari Ini",
      lawType: "Law of Affirmation",
      text: FALLBACK_MANIFESTATION,
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
}: {
  profileSections: ProfileSection[];
  dateKey: string;
  userSeed: string;
  guidance?: DailyGuidance | null;
}): DailyShareCardContent {
  const profileSeed = dailySeed(userSeed, dateKey, "PROFILE_TODAY");
  const manifestationSeed = dailySeed(userSeed, dateKey, "MANIFESTATION_TODAY");

  const profileCandidates = buildProfileCandidates(profileSections);
  const manifestationCandidates = buildManifestationCandidates(guidance?.manifestation);

  return {
    soulMessage: buildSoulMessage(guidance),
    profileToday: buildProfileToday(profileCandidates, profileSeed),
    manifestationToday: buildManifestationToday(manifestationCandidates, manifestationSeed),
    metadata: {
      dateKey,
      locale: "id",
      seedVersion: SEED_VERSION,
    },
  };
}
