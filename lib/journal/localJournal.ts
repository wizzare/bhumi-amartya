import { refreshHealingInsights } from "@/lib/healing/createHealingInsights";
import { refreshJourneyData } from "@/lib/journey/createJourneyData";
import { refreshCompiledInnerwork } from "@/lib/ai/compileUserInnerwork";
import { refreshProgressData } from "@/lib/insights/createInsightProgress";
import { saveLastActivity } from "@/lib/activity/getLastActivity";
import { readOwnedCacheArray, withActiveUid } from "@/lib/storage/derivedCacheOwnership";
import { buildUnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";
import { auth } from "@/lib/firebase/firebase";
import { dailyStateRepository } from "@/lib/repositories/dailyStateRepository";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { normalizeJournalEntryPrivacy } from "@/lib/journal/privacy";
import type { JournalEntryPrivacy } from "@/lib/journal/privacy";
import { isEnlEdition } from "@/lib/config/edition";

export const JOURNAL_STORAGE_KEY = "bhumiJournalEntries";
export const JOURNAL_DRAFT_PREFIX = "bhumiJournalDraft";

export type JournalType = "FREE" | "GUIDED" | "EMOTION" | "CBT" | "SPIRITUAL_AWAKENING";
export type MemoryProvenance = "user-written" | "ai-interpretation" | "ai-insight";

function getScopedJournalKey(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) return JOURNAL_STORAGE_KEY; // Fallback to unscoped for legacy or unauthenticated
  return `${JOURNAL_STORAGE_KEY}:${uid}`;
}

function getScopedDraftKey(journalType: JournalType): string {
  const uid = auth.currentUser?.uid;
  const base = `${JOURNAL_DRAFT_PREFIX}:${journalType}`;
  if (!uid) return base;
  return `${base}:${uid}`;
}

export type JournalTheme =
  | "Inner Child"
  | "Love Block"
  | "Money Block"
  | "Repeating Patterns"
  | "Self Worth"
  | "Family Dynamics"
  | "Karmic Lessons"
  | "Ancestral Patterns"
  | "Forgiveness"
  | "Purpose & Calling";

export type BlueprintJournalContext = {
  birthDate?: string | null;
  sunSign?: string | null;
  lifePathNumber?: number | null;
  humanDesignType?: string | null;
  arcanaCenter?: number | null;
  natalChart?: unknown;
  destinyMatrix?: unknown;
};

export type JournalPrompt = {
  // theme is a display label. For Zone-B handoff it is the practice title (string); for direct
  // entry it is the generic "Refleksi Bebas" label. Not constrained to JournalTheme (W1).
  theme: string;
  dashboardQuestion: string;
  questions: string[];
};

export type JournalInsight = {
  insight: string;
  tomorrowFocus: string;
};

export type LocalJournalEntry = {
  uid?: string;
  id?: string;
  date: string;
  // Theme is a display label. Can be a THEME_BANK key (JournalTheme), a Zone-B practice title
  // (string from sourceTheme + label), or the generic "Refleksi Bebas" label for direct entry (W1).
  theme: string;
  questions: string[];
  journalText: string;
  emotionalState: string;
  bodySignals: string[];
  createdAt: string;
  insight: string;
  tomorrowFocus: string;
  journalType?: JournalType;
  privacy?: Partial<JournalEntryPrivacy>;
  provenance?: MemoryProvenance;
  // Per-mode structured payloads (optional, matching journalType)
  cbt?: {
    situation?: string;
    automaticThought?: string;
    interpretation?: string;
    evidenceFor?: string;
    evidenceAgainst?: string;
    alternativePerspective?: string;
    underlyingNeed?: string;
    nextStep?: string;
    reflectionSummary?: string;
  };
  emotion?: {
    primaryFeeling?: string;
    bodySensation?: string;
    triggerContext?: string;
    needBehindFeeling?: string;
  };
  guided?: {
    promptResponses?: Array<{ question?: string; answer: string }>;
  };
  spiritual?: {
    experienceDescription?: string;
    meaningExplored?: string;
    connectionTheme?: string;
  };
  sourceContext?: {
    lifePathNumber?: number | null;
    humanDesignType?: string | null;
    arcanaCenter?: number | null;
    sunSign?: string | null;
    previousEntryCount: number;
  };
};

const THEME_BANK: Record<JournalTheme, { dashboardQuestion: string; questions: string[] }> = {
  "Inner Child": {
    dashboardQuestion: "Kapan terakhir kali kamu merasa harus kuat padahal sebenarnya ingin didengar?",
    questions: [
      "Apa kenangan masa kecil yang masih sering muncul dalam pikiranmu?",
      "Apa yang paling ingin didengar oleh dirimu saat kecil?",
      "Bagian mana dari dirimu yang masih berusaha mendapatkan pengakuan?",
    ],
  },
  "Love Block": {
    dashboardQuestion: "Pola apa yang sering muncul saat kamu ingin mencintai atau menerima cinta?",
    questions: [
      "Apa yang biasanya membuatmu menahan diri saat ingin membuka hati?",
      "Kapan kamu merasa cinta harus diperjuangkan dengan mengorbankan dirimu?",
      "Bentuk cinta seperti apa yang sebenarnya terasa aman untukmu?",
    ],
  },
  "Money Block": {
    dashboardQuestion: "Keyakinan lama apa tentang uang yang masih memengaruhi pilihanmu hari ini?",
    questions: [
      "Apa kalimat tentang uang yang paling sering kamu dengar saat tumbuh?",
      "Di bagian mana kamu merasa bersalah ketika menerima lebih banyak?",
      "Apa arti rasa aman finansial jika tidak harus dibuktikan pada siapa pun?",
    ],
  },
  "Repeating Patterns": {
    dashboardQuestion: "Pola apa yang terasa berulang dalam hidupmu, meski bentuk situasinya berbeda?",
    questions: [
      "Situasi apa yang belakangan terasa seperti pengulangan dari masa lalu?",
      "Respons otomatis apa yang biasanya muncul sebelum kamu sempat memilih dengan sadar?",
      "Apa pilihan kecil yang bisa memutus pola itu hari ini?",
    ],
  },
  "Self Worth": {
    dashboardQuestion: "Di mana kamu masih mengukur nilai dirimu dari respons orang lain?",
    questions: [
      "Kapan kamu merasa harus menjadi berguna agar tetap layak dicintai?",
      "Apa kualitas dirimu yang sering kamu kecilkan?",
      "Bagaimana rasanya jika nilai dirimu tidak perlu dibuktikan hari ini?",
    ],
  },
  "Family Dynamics": {
    dashboardQuestion: "Peran keluarga apa yang masih terbawa dalam caramu mengambil keputusan?",
    questions: [
      "Peran apa yang paling sering kamu jalani dalam keluarga?",
      "Bagian mana dari peran itu yang masih terasa berat sampai sekarang?",
      "Batas sehat apa yang ingin kamu bangun tanpa kehilangan kasih?",
    ],
  },
  "Karmic Lessons": {
    dashboardQuestion: "Pelajaran apa yang terus datang sampai kamu benar-benar mendengarnya?",
    questions: [
      "Tema hidup apa yang terasa terus mengulang dalam perjalananmu?",
      "Apa yang sedang diminta hidup untuk kamu lepaskan atau pelajari?",
      "Jika pengalaman ini adalah guru, pesan apa yang ia bawa?",
    ],
  },
  "Ancestral Patterns": {
    dashboardQuestion: "Pola leluhur apa yang ingin kamu hormati tanpa harus kamu lanjutkan?",
    questions: [
      "Pola keluarga apa yang kamu sadari hidup di dalam keputusanmu?",
      "Apa beban yang mungkin bukan sepenuhnya milikmu?",
      "Warisan batin apa yang ingin kamu ubah menjadi kebijaksanaan?",
    ],
  },
  Forgiveness: {
    dashboardQuestion: "Apa yang siap kamu lepaskan tanpa harus membenarkan apa yang terjadi?",
    questions: [
      "Siapa atau bagian mana dari dirimu yang masih menunggu pengampunan?",
      "Apa rasa sakit yang selama ini kamu pegang agar tetap merasa aman?",
      "Apa bentuk melepaskan yang terasa realistis untuk hari ini?",
    ],
  },
  "Purpose & Calling": {
    dashboardQuestion: "Panggilan apa yang pelan-pelan meminta ruang lebih besar dalam hidupmu?",
    questions: [
      "Aktivitas apa yang membuatmu merasa lebih hidup dan terhubung?",
      "Ketakutan apa yang muncul saat kamu membayangkan hidup lebih selaras dengan panggilanmu?",
      "Langkah kecil apa yang bisa kamu ambil tanpa harus menunggu semuanya sempurna?",
    ],
  },
};

const THEME_BANK_EN: Record<JournalTheme, { dashboardQuestion: string; questions: string[] }> = {
  "Inner Child": {
    dashboardQuestion: "When was the last time you felt you had to be strong when you actually wanted to be heard?",
    questions: [
      "What childhood memory still frequently comes to your mind?",
      "What did your younger self want to hear most?",
      "Which part of you is still trying to get validation?",
    ],
  },
  "Love Block": {
    dashboardQuestion: "What pattern often appears when you want to love or receive love?",
    questions: [
      "What usually makes you hold back when you want to open your heart?",
      "When do you feel love must be fought for by sacrificing yourself?",
      "What form of love actually feels safe for you?",
    ],
  },
  "Money Block": {
    dashboardQuestion: "What old belief about money still influences your choices today?",
    questions: [
      "What statement about money did you hear most often growing up?",
      "Where do you feel guilty when receiving more?",
      "What does financial security mean if it doesn't need to be proven to anyone?",
    ],
  },
  "Repeating Patterns": {
    dashboardQuestion: "What pattern feels repeated in your life, even if the situation looks different?",
    questions: [
      "What situation lately feels like a repetition from the past?",
      "What automatic response usually appears before you get to choose consciously?",
      "What small choice can break that pattern today?",
    ],
  },
  "Self Worth": {
    dashboardQuestion: "Where are you still measuring your self-worth from other people's responses?",
    questions: [
      "When do you feel you have to be useful to remain worthy of love?",
      "What quality of yours do you often diminish?",
      "How would it feel if your self-worth didn't need to be proven today?",
    ],
  },
  "Family Dynamics": {
    dashboardQuestion: "What family role is still carried over in the way you make decisions?",
    questions: [
      "What role did you take most often in your family?",
      "Which part of that role still feels heavy until now?",
      "What healthy boundary do you want to build without losing love?",
    ],
  },
  "Karmic Lessons": {
    dashboardQuestion: "What lesson keeps coming until you truly listen to it?",
    questions: [
      "What life theme feels like it keeps repeating in your journey?",
      "What is life currently asking you to release or learn?",
      "If this experience were a teacher, what message does it bring?",
    ],
  },
  "Ancestral Patterns": {
    dashboardQuestion: "What ancestral pattern do you want to honor without having to continue it?",
    questions: [
      "What family pattern do you notice living in your decisions?",
      "What burden might not be entirely yours?",
      "What inner legacy do you want to transform into wisdom?",
    ],
  },
  Forgiveness: {
    dashboardQuestion: "What are you ready to release without having to justify what happened?",
    questions: [
      "Who or which part of yourself is still waiting for forgiveness?",
      "What pain have you been holding onto just to feel safe?",
      "What form of letting go feels realistic for today?",
    ],
  },
  "Purpose & Calling": {
    dashboardQuestion: "What calling is slowly asking for a larger space in your life?",
    questions: [
      "What activity makes you feel more alive and connected?",
      "What fear arises when you imagine living more aligned with your calling?",
      "What small step can you take without waiting for everything to be perfect?",
    ],
  },
};

const THEMES = Object.keys(THEME_BANK) as JournalTheme[];

function getDateSeed(date: Date): number {
  return Number(date.toISOString().slice(0, 10).replaceAll("-", ""));
}

export function getTodayJournalPrompt(
  context: BlueprintJournalContext,
  previousEntries: LocalJournalEntry[] = [],
  date = new Date(),
): JournalPrompt {
  const isEn = isEnlEdition();
  const lifePathSeed = context.lifePathNumber ?? 0;
  const arcanaSeed = context.arcanaCenter ?? 0;
  const designSeed = context.humanDesignType?.length ?? 0;
  const previousSeed = previousEntries.length;
  const themeIndex = (getDateSeed(date) + lifePathSeed + arcanaSeed + designSeed + previousSeed) % THEMES.length;
  const theme = THEMES[themeIndex];
  const bank = isEn ? THEME_BANK_EN : THEME_BANK;

  const labels: Record<JournalTheme, string> = {
    "Inner Child": "Diri Masa Kecil",
    "Love Block": "Hambatan Cinta",
    "Money Block": "Hambatan Finansial",
    "Repeating Patterns": "Pola Berulang",
    "Self Worth": "Harga Diri",
    "Family Dynamics": "Dinamika Keluarga",
    "Karmic Lessons": "Pelajaran Karma",
    "Ancestral Patterns": "Pola Leluhur",
    Forgiveness: "Pengampunan",
    "Purpose & Calling": "Tujuan dan Panggilan",
  };
  return {
    theme: labels[theme],
    ...bank[theme],
  };
}

export const GENERIC_JOURNAL_THEME = "Refleksi Bebas";

export function createGenericJournalPrompt(
  previousEntries: LocalJournalEntry[] = [],
): JournalPrompt {
  const isEn = isEnlEdition();
  const seeded = getTodayJournalPrompt(
    { birthDate: null, sunSign: null, lifePathNumber: 0, humanDesignType: null, arcanaCenter: 0, natalChart: null, destinyMatrix: null },
    previousEntries,
  );
  return {
    theme: isEn ? "Free Reflection" : GENERIC_JOURNAL_THEME,
    dashboardQuestion: seeded.dashboardQuestion,
    questions: seeded.questions,
  };
}

export function loadLocalJournalEntries(): LocalJournalEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const scopedKey = getScopedJournalKey();
    const parsed = readOwnedCacheArray<LocalJournalEntry>(scopedKey, "journalEntries");
    // V5-03: collection keyed by id+createdAt, multi-entry per day — no per-day singleton validation.
    // Legacy date-prefix check removed; return full collection newest-first.
    return parsed;
  } catch {
    return [];
  }
}

export function getEntriesByType(type: JournalType, limit?: number): LocalJournalEntry[] {
  const entries = loadLocalJournalEntries();
  const filtered = entries.filter((e) => (e.journalType || "FREE") === type);
  return typeof limit === "number" ? filtered.slice(0, limit) : filtered;
}

export function getJournalHistoryGroupedByWeek(): Array<{ weekLabel: string; entries: LocalJournalEntry[] }> {
  const entries = loadLocalJournalEntries();
  const groups = new Map<string, LocalJournalEntry[]>();
  for (const entry of entries) {
    const d = new Date(entry.createdAt);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const label = weekStart.toISOString().slice(0, 10);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(entry);
  }
  return Array.from(groups.entries()).map(([weekLabel, groupEntries]) => ({ weekLabel, entries: groupEntries }));
}

// Per-mode draft persistence — autosave every 30s, conflict resolution via timestamp.
export type JournalDraft = {
  journalType: JournalType;
  journalText: string;
  emotionalState: string;
  bodySignals: string[];
  cbt?: LocalJournalEntry["cbt"];
  emotion?: LocalJournalEntry["emotion"];
  guided?: LocalJournalEntry["guided"];
  spiritual?: LocalJournalEntry["spiritual"];
  updatedAt: string;
};

export function savePerModeDraft(draft: JournalDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(getScopedDraftKey(draft.journalType), JSON.stringify(draft));
  } catch {
    // quota
  }
}

export function loadPerModeDraft(journalType: JournalType): JournalDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(getScopedDraftKey(journalType));
    if (!raw) return null;
    return JSON.parse(raw) as JournalDraft;
  } catch {
    return null;
  }
}

export function clearPerModeDraft(journalType: JournalType): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(getScopedDraftKey(journalType));
  } catch {
    // ignore
  }
}

export function loadAllDrafts(): JournalDraft[] {
  if (typeof window === "undefined") return [];
  const types: JournalType[] = ["FREE", "GUIDED", "EMOTION", "CBT", "SPIRITUAL_AWAKENING"];
  return types.map((t) => loadPerModeDraft(t)).filter((d): d is JournalDraft => d !== null);
}

export function saveLocalJournalEntry(entry: LocalJournalEntry): LocalJournalEntry[] {
  const entries = loadLocalJournalEntries();
  const withId = {
    ...entry,
    id: entry.id || `journal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    journalType: entry.journalType || "FREE" as JournalType,
    provenance: entry.provenance || "user-written" as MemoryProvenance,
    privacy: normalizeJournalEntryPrivacy(entry.privacy),
  } as LocalJournalEntry;
  const nextEntry = withActiveUid(withId);
  const nextEntries = [nextEntry, ...entries];
  const scopedKey = getScopedJournalKey();
  window.localStorage.setItem(scopedKey, JSON.stringify(nextEntries));

  // Cleanup forbidden unscoped key
  if (scopedKey !== JOURNAL_STORAGE_KEY) {
    window.localStorage.removeItem(JOURNAL_STORAGE_KEY);
  }

  saveLastActivity("journal");
  refreshHealingInsights();
  refreshJourneyData();
  refreshCompiledInnerwork();
  refreshProgressData();

  // Sync to Firestore for Journey Progress
  const uid = auth.currentUser?.uid;
  if (uid) {
    void dailyStateRepository.saveDailyState(uid, getLocalDateKey(), {
      journalingDone: true,
    }).catch(err => console.error("[SYNC_JOURNAL_ERROR]", err));
  }

  return nextEntries;
}

export function getLatestJournalEntry(entries: LocalJournalEntry[]): LocalJournalEntry | null {
  return entries[0] ?? null;
}

export function generateLocalJournalInsight(input: {
  theme: string;
  journalText: string;
  emotionalState: string;
  bodySignals: string[];
  context: BlueprintJournalContext;
}): JournalInsight {
  const isEn = isEnlEdition();
  const synthesis = buildUnifiedBlueprintSynthesis({
    language: isEn ? "en" : "id",
    profile: null,
    blueprint: {
      lifePath: { number: input.context.lifePathNumber },
      humanDesign: { type: input.context.humanDesignType },
      destinyMatrix: { arcanaCenter: input.context.arcanaCenter },
      astrology: { sunSign: input.context.sunSign },
      natalChart: input.context.natalChart,
    },
  });

  if (isEn) {
    const bodyLine = input.bodySignals.length > 0
      ? `Your body is signaling through ${input.bodySignals.join(", ").toLowerCase()}, so this process deserves to be approached gently.`
      : "Your body has not shown specific signals yet, and that is also valuable information.";

    return {
      insight: `From your writing, the theme of ${input.theme} seems to be asking for space to be heard without judgment. Today's synthesis points toward ${synthesis.practiceThemes.reflection}, so you may be learning to respond to life from awareness rather than old habits. ${bodyLine}`,
      tomorrowFocus: `Tomorrow, pay attention to moments when the emotion "${input.emotionalState || "mixed feelings"}" arises. Take a small pause before acting, then ask: what need do I actually want to hear right now?`,
    };
  }

  const bodyLine = input.bodySignals.length > 0
    ? `Tubuhmu memberi sinyal melalui ${input.bodySignals.join(", ").toLowerCase()}, jadi proses ini layak didekati dengan lembut.`
    : "Tubuhmu belum menunjukkan sinyal khusus, dan itu juga informasi yang berharga.";

  return {
    insight: `Dari tulisanmu, tema ${input.theme} tampak sedang meminta ruang untuk didengar tanpa dihakimi. Sintesis hari ini mengarah pada ${synthesis.practiceThemes.reflection}, sehingga kamu mungkin sedang belajar merespons hidup dari kesadaran, bukan dari kebiasaan lama. ${bodyLine}`,
    tomorrowFocus: `Besok, perhatikan momen ketika emosi "${input.emotionalState || "campur aduk"}" muncul. Ambil jeda kecil sebelum bertindak, lalu tanyakan: kebutuhan apa yang sebenarnya ingin aku dengar sekarang?`,
  };
}
