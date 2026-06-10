import { buildUnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";

type UnknownRecord = Record<string, unknown>;

export type RetentionNotificationState =
  | "no_activity_today"
  | "partial_activity_today"
  | "completed_practices_today"
  | "three_day_absence"
  | "seven_day_streak"
  | "fourteen_day_streak"
  | "journal_milestone"
  | "meditation_milestone"
  | "audio_healing_milestone";

export type RetentionMilestoneType =
  | "journal"
  | "meditation"
  | "audioHealing"
  | "practice"
  | "streak";

export type RetentionTimelineItem = {
  id: string;
  date: string;
  type: RetentionMilestoneType;
  title: string;
  description: string;
};

export type AdaptiveRetentionOutput = {
  notificationState: RetentionNotificationState;
  notificationMessage: string;
  healingMemoryReflection: string;
  todayReflection: string;
  changedSinceYesterday: string;
  progressMade: string;
  weeklyReflection: string;
  timeline: RetentionTimelineItem[];
};

export type AdaptiveRetentionInput = {
  language: "id" | "en";
  profile?: UnknownRecord | null;
  blueprint?: UnknownRecord | null;
  journalEntries?: UnknownRecord[];
  meditationEntries?: UnknownRecord[];
  audioHealingEntries?: UnknownRecord[];
  dailyPractices?: UnknownRecord[];
  astrologyToday?: string | null;
};

function readDate(entry: UnknownRecord): string | null {
  const value = entry.date ?? entry.dateCreated ?? entry.createdAt ?? entry.completedAt;
  return typeof value === "string" && value.trim() ? value.slice(0, 10) : null;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function daysBetween(date: string | null, now = new Date()): number | null {
  if (!date) return null;
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(now.toISOString().slice(0, 10) + "T00:00:00");
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000));
}

function entriesToday(entries: UnknownRecord[], today = todayKey()): UnknownRecord[] {
  return entries.filter((entry) => readDate(entry) === today);
}

function sortedDates(entries: UnknownRecord[]): string[] {
  return [...new Set(entries.map(readDate).filter((date): date is string => Boolean(date)))]
    .sort((a, b) => a.localeCompare(b));
}

function calculateStreak(entries: UnknownRecord[]): number {
  const dates = new Set(sortedDates(entries));
  const cursor = new Date();
  let streak = 0;

  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function latestDate(entries: UnknownRecord[]): string | null {
  return sortedDates(entries).at(-1) ?? null;
}

function firstDate(entries: UnknownRecord[]): string | null {
  return sortedDates(entries)[0] ?? null;
}

function readText(entry: UnknownRecord): string | null {
  const value = entry.journalText ?? entry.reflectionText ?? entry.bodyReflection ?? entry.insight ?? entry.emotionalState;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readTheme(entry: UnknownRecord): string | null {
  const value = entry.theme ?? entry.emotionalState;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function completedPracticeCount(practices: UnknownRecord[]): number {
  return practices.filter((practice) => practice.completed === true).length;
}

function createTimeline(input: {
  journalEntries: UnknownRecord[];
  meditationEntries: UnknownRecord[];
  audioHealingEntries: UnknownRecord[];
  practices: UnknownRecord[];
  streakDays: number;
  language: "id" | "en";
}): RetentionTimelineItem[] {
  const { journalEntries, meditationEntries, audioHealingEntries, practices, streakDays, language } = input;
  const items: RetentionTimelineItem[] = [];
  const firstJournal = firstDate(journalEntries);
  const firstMeditation = firstDate(meditationEntries);
  const firstAudio = firstDate(audioHealingEntries);
  const today = todayKey();
  const practiceDone = completedPracticeCount(practices);

  if (firstJournal) {
    items.push({
      id: "first-journal",
      date: firstJournal,
      type: "journal",
      title: language === "en" ? "First honest note" : "Catatan jujur pertama",
      description: language === "en" ? "This is where the journey started to leave a trace." : "Di sini perjalananmu mulai meninggalkan jejak.",
    });
  }
  if (firstMeditation) {
    items.push({
      id: "first-meditation",
      date: firstMeditation,
      type: "meditation",
      title: language === "en" ? "First quiet pause" : "Jeda hening pertama",
      description: language === "en" ? "You gave your body a moment to be heard." : "Kamu memberi tubuhmu ruang untuk didengar.",
    });
  }
  if (firstAudio) {
    items.push({
      id: "first-audio",
      date: firstAudio,
      type: "audioHealing",
      title: language === "en" ? "First grounding listen" : "Audio grounding pertama",
      description: language === "en" ? "You let sound support the return to yourself." : "Kamu membiarkan suara membantu proses kembali ke diri.",
    });
  }
  if (journalEntries.length >= 7) {
    items.push({
      id: "journal-7",
      date: latestDate(journalEntries) ?? today,
      type: "journal",
      title: language === "en" ? "7 reflections completed" : "7 refleksi selesai",
      description: language === "en" ? "Your inner world is becoming easier to notice." : "Dunia batinmu mulai lebih mudah dikenali.",
    });
  }
  if (meditationEntries.length >= 7) {
    items.push({
      id: "meditation-7",
      date: latestDate(meditationEntries) ?? today,
      type: "meditation",
      title: language === "en" ? "7 quiet returns" : "7 kali kembali hening",
      description: language === "en" ? "Stillness is beginning to become familiar." : "Keheningan mulai terasa lebih akrab.",
    });
  }
  if (audioHealingEntries.length >= 7) {
    items.push({
      id: "audio-7",
      date: latestDate(audioHealingEntries) ?? today,
      type: "audioHealing",
      title: language === "en" ? "7 grounding listens" : "7 audio grounding",
      description: language === "en" ? "Your body has received repeated support." : "Tubuhmu sudah menerima dukungan yang berulang.",
    });
  }
  if (practiceDone >= 3) {
    items.push({
      id: "practice-today",
      date: today,
      type: "practice",
      title: language === "en" ? "Today's practices completed" : "Praktik hari ini selesai",
      description: language === "en" ? "You followed through on all three small anchors." : "Kamu menyelesaikan tiga jangkar kecil hari ini.",
    });
  }
  if (streakDays >= 7) {
    items.push({
      id: "streak-7",
      date: today,
      type: "streak",
      title: language === "en" ? "7 day rhythm" : "Ritme 7 hari",
      description: language === "en" ? "You are building a returnable rhythm." : "Kamu sedang membangun ritme yang bisa dikembalikan.",
    });
  }
  if (streakDays >= 14) {
    items.push({
      id: "streak-14",
      date: today,
      type: "streak",
      title: language === "en" ? "14 day foundation" : "Fondasi 14 hari",
      description: language === "en" ? "This is no longer a single good day; it is a pattern." : "Ini bukan lagi satu hari baik; ini sudah menjadi pola.",
    });
  }

  return items.sort((a, b) => a.date.localeCompare(b.date)).slice(-8);
}

function chooseNotificationState(input: {
  todayCount: number;
  practicesDone: number;
  absenceDays: number;
  streakDays: number;
  journalCount: number;
  meditationCount: number;
  audioCount: number;
}): RetentionNotificationState {
  const { todayCount, practicesDone, absenceDays, streakDays, journalCount, meditationCount, audioCount } = input;

  if (absenceDays >= 3) return "three_day_absence";
  if (streakDays >= 14) return "fourteen_day_streak";
  if (streakDays >= 7) return "seven_day_streak";
  if ([7, 14, 30].includes(journalCount)) return "journal_milestone";
  if ([7, 14, 30].includes(meditationCount)) return "meditation_milestone";
  if ([7, 14, 30].includes(audioCount)) return "audio_healing_milestone";
  if (practicesDone >= 3 || todayCount >= 3) return "completed_practices_today";
  if (todayCount > 0 || practicesDone > 0) return "partial_activity_today";
  return "no_activity_today";
}

function buildNotificationMessage(input: {
  state: RetentionNotificationState;
  language: "id" | "en";
  need: string;
  streakDays: number;
}): string {
  const { state, language, need, streakDays } = input;
  if (language === "en") {
    const map: Record<RetentionNotificationState, string> = {
      no_activity_today: `A small return can support ${need} today. One breath, one note, or one practice is enough to keep the thread alive.`,
      partial_activity_today: `You have already begun today. A gentle next step can help ${need} become something you can feel, not just think about.`,
      completed_practices_today: `You completed today's anchors. Let that count; tomorrow can begin from this steadier place.`,
      three_day_absence: `It has been a few days. You do not need to catch up; just return with one kind check-in.`,
      seven_day_streak: `Seven days of returning is becoming a real rhythm. Let today's step stay simple enough to repeat.`,
      fourteen_day_streak: `Fourteen days shows a foundation forming. Protect the rhythm by keeping tomorrow human-sized.`,
      journal_milestone: `Your reflections are becoming a memory you can look back on. Write one honest line today.`,
      meditation_milestone: `Your quiet pauses are beginning to have history. Sit for a few minutes and notice what has softened.`,
      audio_healing_milestone: `Your body has received repeated support through sound. Let today's listening stay gentle and grounded.`,
    };
    return map[state];
  }

  const map: Record<RetentionNotificationState, string> = {
    no_activity_today: `Satu langkah kecil hari ini bisa mendukung ${need}. Satu napas, satu catatan, atau satu praktik sudah cukup untuk menjaga benangnya tetap hidup.`,
    partial_activity_today: `Kamu sudah mulai hari ini. Satu langkah lembut lagi bisa membuat ${need} terasa lebih nyata, bukan hanya dipikirkan.`,
    completed_practices_today: "Tiga jangkar hari ini sudah selesai. Biarkan itu benar-benar dihitung; besok bisa dimulai dari tempat yang lebih stabil.",
    three_day_absence: "Sudah beberapa hari jeda. Kamu tidak perlu mengejar apa pun; cukup kembali lewat satu cek-in yang baik pada dirimu.",
    seven_day_streak: `${streakDays} hari kembali pada diri mulai menjadi ritme yang nyata. Jaga agar langkah hari ini tetap sederhana untuk diulang.`,
    fourteen_day_streak: `${streakDays} hari menunjukkan fondasi sedang terbentuk. Lindungi ritmenya dengan langkah yang tetap manusiawi.`,
    journal_milestone: "Refleksimu mulai menjadi memori yang bisa kamu lihat kembali. Tulis satu kalimat jujur hari ini.",
    meditation_milestone: "Jeda heningmu mulai punya sejarah. Duduk beberapa menit dan perhatikan apa yang sudah lebih melunak.",
    audio_healing_milestone: "Tubuhmu sudah menerima dukungan berulang lewat suara. Biarkan sesi hari ini tetap lembut dan membumi.",
  };
  return map[state];
}

export function createAdaptiveRetention(input: AdaptiveRetentionInput): AdaptiveRetentionOutput {
  const language = input.language;
  const journalEntries = input.journalEntries ?? [];
  const meditationEntries = input.meditationEntries ?? [];
  const audioHealingEntries = input.audioHealingEntries ?? [];
  const dailyPractices = input.dailyPractices ?? [];
  const allEntries = [...journalEntries, ...meditationEntries, ...audioHealingEntries];
  const today = todayKey();
  const todayCount = entriesToday(allEntries, today).length;
  const practiceDone = completedPracticeCount(dailyPractices);
  const streakDays = calculateStreak(allEntries);
  const absenceDays = daysBetween(latestDate(allEntries)) ?? 999;
  const synthesis = buildUnifiedBlueprintSynthesis({
    language,
    profile: input.profile ?? null,
    blueprint: input.blueprint ?? null,
    astrologyToday: input.astrologyToday,
  });
  const need = synthesis.blueprintSummary
    .replace(/^Today may feel more workable when you give yourself /, "")
    .replace(/^Hari ini mungkin terasa lebih bisa dijalani saat kamu memberi ruang untuk /, "")
    .split(".")[0]
    .trim();
  const notificationState = chooseNotificationState({
    todayCount,
    practicesDone: practiceDone,
    absenceDays,
    streakDays,
    journalCount: journalEntries.length,
    meditationCount: meditationEntries.length,
    audioCount: audioHealingEntries.length,
  });
  const firstJournal = journalEntries.find((entry) => readDate(entry) === firstDate(journalEntries));
  const latestJournal = journalEntries.find((entry) => readDate(entry) === latestDate(journalEntries));
  const firstJournalDays = daysBetween(firstDate(journalEntries));
  const firstText = firstJournal ? readText(firstJournal) : null;
  const latestTheme = latestJournal ? readTheme(latestJournal) : null;
  const weeklyTotal = allEntries.filter((entry) => {
    const date = readDate(entry);
    if (!date) return false;
    return daysBetween(date)! <= 6;
  }).length;
  const previousWeekTotal = allEntries.filter((entry) => {
    const date = readDate(entry);
    if (!date) return false;
    const days = daysBetween(date)!;
    return days >= 7 && days <= 13;
  }).length;

  return {
    notificationState,
    notificationMessage: buildNotificationMessage({ state: notificationState, language, need, streakDays }),
    healingMemoryReflection: language === "en"
      ? firstJournalDays !== null && firstText
        ? `${firstJournalDays} days ago, you wrote about "${firstText.slice(0, 90)}". Today, the journey shows ${latestTheme ? `"${latestTheme}"` : "a small thread"} beginning to take shape.`
        : "Bhumi will begin remembering your journey as soon as you leave your first reflection, pause, or grounding practice."
      : firstJournalDays !== null && firstText
        ? `${firstJournalDays} hari yang lalu kamu menuliskan "${firstText.slice(0, 90)}". Hari ini, perjalananmu mulai memperlihatkan ${latestTheme ? `"${latestTheme}"` : "satu benang kecil"} yang pelan-pelan terbentuk.`
        : "Bhumi akan mulai mengingat perjalananmu setelah kamu meninggalkan refleksi, jeda, atau praktik grounding pertama.",
    todayReflection: language === "en"
      ? todayCount > 0 || practiceDone > 0
        ? "Today already has a trace. Let it be enough to build from."
        : "Today is still open. Begin with the smallest honest return."
      : todayCount > 0 || practiceDone > 0
        ? "Hari ini sudah punya jejak. Biarkan itu cukup untuk menjadi pijakan."
        : "Hari ini masih terbuka. Mulai dari kepulangan paling kecil yang jujur.",
    changedSinceYesterday: language === "en"
      ? todayCount > 0
        ? "Compared with yesterday, there is already movement in today's record."
        : absenceDays > 0 && absenceDays < 999
          ? `The last recorded step was ${absenceDays} day(s) ago; today can become the next gentle point in the timeline.`
          : "There is no previous trace yet, so today's first step matters."
      : todayCount > 0
        ? "Dibanding kemarin, hari ini sudah ada gerak yang tercatat."
        : absenceDays > 0 && absenceDays < 999
          ? `Jejak terakhir tercatat ${absenceDays} hari lalu; hari ini bisa menjadi titik lembut berikutnya.`
          : "Belum ada jejak sebelumnya, jadi langkah pertama hari ini benar-benar berarti.",
    progressMade: language === "en"
      ? `${journalEntries.length} reflections, ${meditationEntries.length} meditations, ${audioHealingEntries.length} audio sessions, and ${streakDays} day(s) of current rhythm.`
      : `${journalEntries.length} refleksi, ${meditationEntries.length} meditasi, ${audioHealingEntries.length} sesi audio, dan ritme berjalan ${streakDays} hari.`,
    weeklyReflection: language === "en"
      ? weeklyTotal > previousWeekTotal
        ? "This week, you appear more consistent in showing up for yourself than last week."
        : weeklyTotal > 0
          ? "This week still carries movement. Keep the next step small enough to return to."
          : "This week is waiting for its first trace. Begin gently."
      : weeklyTotal > previousWeekTotal
        ? "Minggu ini kamu tampak lebih konsisten hadir untuk dirimu sendiri dibanding minggu sebelumnya."
        : weeklyTotal > 0
          ? "Minggu ini tetap punya gerak. Jaga langkah berikutnya cukup kecil untuk bisa kamu ulangi."
          : "Minggu ini masih menunggu jejak pertamanya. Mulai dengan lembut.",
    timeline: createTimeline({
      journalEntries,
      meditationEntries,
      audioHealingEntries,
      practices: dailyPractices,
      streakDays,
      language,
    }),
  };
}
