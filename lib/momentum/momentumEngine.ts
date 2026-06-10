type UnknownRecord = Record<string, unknown>;

export type MomentumLevel = "restarting" | "stabilizing" | "growing" | "thriving";

export type MomentumOutput = {
  momentumLevel: MomentumLevel;
  whatChanged: string;
  currentStreak: number;
  nextMilestone: string;
  reflection: string;
  signals: {
    streakGrowth: boolean;
    increasedCompletion: boolean;
    consistencyImprovement: boolean;
    journalFrequencyImprovement: boolean;
    meditationFrequencyImprovement: boolean;
    emotionalImprovement: boolean;
  };
};

export type MomentumInput = {
  language: "id" | "en";
  journalEntries?: UnknownRecord[];
  meditationEntries?: UnknownRecord[];
  audioHealingEntries?: UnknownRecord[];
  dailyPractices?: UnknownRecord[];
};

function readDate(entry: UnknownRecord): string | null {
  const value = entry.date ?? entry.dateCreated ?? entry.createdAt ?? entry.completedAt;
  return typeof value === "string" && value.trim() ? value.slice(0, 10) : null;
}

function daysAgo(date: string): number {
  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00");
  const start = new Date(`${date}T00:00:00`);
  return Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86400000));
}

function filterWindow(entries: UnknownRecord[], minDaysAgo: number, maxDaysAgo: number): UnknownRecord[] {
  return entries.filter((entry) => {
    const date = readDate(entry);
    if (!date) return false;
    const days = daysAgo(date);
    return days >= minDaysAgo && days <= maxDaysAgo;
  });
}

function uniqueDateCount(entries: UnknownRecord[]): number {
  return new Set(entries.map(readDate).filter((date): date is string => Boolean(date))).size;
}

function calculateStreak(entries: UnknownRecord[]): number {
  const dates = new Set(entries.map(readDate).filter((date): date is string => Boolean(date)));
  const cursor = new Date();
  let streak = 0;

  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function completedPracticeCount(practices: UnknownRecord[]): number {
  return practices.filter((practice) => practice.completed === true).length;
}

function difficultEmotionCount(entries: UnknownRecord[]): number {
  const difficultWords = [
    "anxious",
    "anxiety",
    "sad",
    "lost",
    "stuck",
    "angry",
    "takut",
    "cemas",
    "sedih",
    "marah",
    "kehilangan",
    "bingung",
    "lelah",
    "terjebak",
  ];

  return entries.filter((entry) => {
    const value = entry.emotionalState ?? entry.bodyReflection ?? entry.journalText ?? entry.insight;
    if (typeof value !== "string") return false;
    const text = value.toLowerCase();
    return difficultWords.some((word) => text.includes(word));
  }).length;
}

function determineMomentumLevel(input: {
  currentWeekTotal: number;
  currentStreak: number;
  improvementSignals: number;
}): MomentumLevel {
  const { currentWeekTotal, currentStreak, improvementSignals } = input;

  if (currentWeekTotal === 0 || currentStreak === 0) return "restarting";
  if (currentStreak >= 14 && improvementSignals >= 4) return "thriving";
  if (currentStreak >= 7 || improvementSignals >= 3) return "growing";
  return "stabilizing";
}

function nextMilestone(input: {
  language: "id" | "en";
  currentStreak: number;
  journalCount: number;
  meditationCount: number;
  totalInnerwork: number;
}): string {
  const { language, currentStreak, journalCount, meditationCount, totalInnerwork } = input;

  if (currentStreak < 3) return language === "en" ? "Return for 3 gentle days in a row" : "3 hari berturut-turut kembali dengan lembut";
  if (journalCount < 7) return language === "en" ? "Keep 7 reflections as a visible memory" : "7 jurnal tersimpan sebagai memori yang bisa dilihat";
  if (meditationCount < 5) return language === "en" ? "Complete 5 quiet pauses" : "5 meditasi selesai sebagai jeda yang mulai akrab";
  if (totalInnerwork < 10) return language === "en" ? "Collect 10 innerwork traces" : "10 jejak innerwork terkumpul";
  if (currentStreak < 7) return language === "en" ? "Build a 7 day rhythm you can trust" : "7 hari ritme yang bisa kamu percaya";
  return language === "en" ? "Keep the rhythm human enough to continue" : "Menjaga ritme tetap manusiawi agar bisa berlanjut";
}

function buildWhatChanged(input: {
  language: "id" | "en";
  currentWeekTotal: number;
  previousWeekTotal: number;
  currentMonthTotal: number;
  previousMonthTotal: number;
  journalImproved: boolean;
  meditationImproved: boolean;
  emotionalImproved: boolean;
}): string {
  const {
    language,
    currentWeekTotal,
    previousWeekTotal,
    currentMonthTotal,
    previousMonthTotal,
    journalImproved,
    meditationImproved,
    emotionalImproved,
  } = input;

  if (language === "en") {
    if (currentWeekTotal > previousWeekTotal) return "Recently, a more consistent rhythm has started to form.";
    if (currentMonthTotal > previousMonthTotal) return "Compared with a month ago, your journey now has more visible traces.";
    if (journalImproved) return "Your reflections are appearing more often than they did before.";
    if (meditationImproved) return "Your quiet pauses are becoming easier to return to.";
    if (emotionalImproved) return "The emotional record looks a little less heavy than before.";
    return "The rhythm has shifted, but the journey is still moving.";
  }

  if (currentWeekTotal > previousWeekTotal) return "Belakangan ini terlihat ritme yang lebih konsisten mulai terbentuk.";
  if (currentMonthTotal > previousMonthTotal) return "Dibanding sebulan lalu, perjalananmu sekarang punya jejak yang lebih terlihat.";
  if (journalImproved) return "Refleksimu mulai hadir lebih sering daripada sebelumnya.";
  if (meditationImproved) return "Jeda heningmu mulai lebih mudah kamu datangi kembali.";
  if (emotionalImproved) return "Catatan emosimu terlihat sedikit lebih ringan dibanding sebelumnya.";
  return "Ritmemu mungkin berubah, tetapi perjalanan ini masih berjalan.";
}

function buildReflection(input: {
  language: "id" | "en";
  improved: boolean;
  level: MomentumLevel;
}): string {
  const { language, improved, level } = input;

  if (language === "en") {
    if (improved) return "The small steps you have taken are beginning to form a new pattern.";
    if (level === "restarting") return "It is okay if your rhythm changed. The journey is still moving.";
    return "Keep this gentle enough to repeat; momentum grows best when it can breathe.";
  }

  if (improved) return "Langkah kecil yang kamu lakukan mulai membentuk pola baru.";
  if (level === "restarting") return "Tidak apa-apa jika ritmemu berubah. Perjalanan ini masih berjalan.";
  return "Jaga langkah ini tetap cukup lembut untuk diulang; momentum tumbuh saat masih punya ruang bernapas.";
}

export function createMomentum(input: MomentumInput): MomentumOutput {
  const language = input.language;
  const journalEntries = input.journalEntries ?? [];
  const meditationEntries = input.meditationEntries ?? [];
  const audioHealingEntries = input.audioHealingEntries ?? [];
  const practices = input.dailyPractices ?? [];
  const allEntries = [...journalEntries, ...meditationEntries, ...audioHealingEntries];
  const currentWeek = filterWindow(allEntries, 0, 6);
  const previousWeek = filterWindow(allEntries, 7, 13);
  const currentMonth = filterWindow(allEntries, 0, 29);
  const previousMonth = filterWindow(allEntries, 30, 59);
  const currentStreak = calculateStreak(allEntries);
  const currentWeekDays = uniqueDateCount(currentWeek);
  const previousWeekDays = uniqueDateCount(previousWeek);
  const currentWeekJournal = filterWindow(journalEntries, 0, 6).length;
  const previousWeekJournal = filterWindow(journalEntries, 7, 13).length;
  const currentWeekMeditation = filterWindow(meditationEntries, 0, 6).length;
  const previousWeekMeditation = filterWindow(meditationEntries, 7, 13).length;
  const currentDifficultEmotions = difficultEmotionCount(currentWeek);
  const previousDifficultEmotions = difficultEmotionCount(previousWeek);
  const practiceCompletion = completedPracticeCount(practices);

  const signals = {
    streakGrowth: currentStreak >= 3,
    increasedCompletion: practiceCompletion >= 2 || currentWeek.length > previousWeek.length,
    consistencyImprovement: currentWeekDays > previousWeekDays,
    journalFrequencyImprovement: currentWeekJournal > previousWeekJournal,
    meditationFrequencyImprovement: currentWeekMeditation > previousWeekMeditation,
    emotionalImprovement: previousDifficultEmotions > 0 && currentDifficultEmotions < previousDifficultEmotions,
  };
  const improvementSignals = Object.values(signals).filter(Boolean).length;
  const momentumLevel = determineMomentumLevel({
    currentWeekTotal: currentWeek.length,
    currentStreak,
    improvementSignals,
  });
  const improved = improvementSignals >= 2;

  return {
    momentumLevel,
    whatChanged: buildWhatChanged({
      language,
      currentWeekTotal: currentWeek.length,
      previousWeekTotal: previousWeek.length,
      currentMonthTotal: currentMonth.length,
      previousMonthTotal: previousMonth.length,
      journalImproved: signals.journalFrequencyImprovement,
      meditationImproved: signals.meditationFrequencyImprovement,
      emotionalImproved: signals.emotionalImprovement,
    }),
    currentStreak,
    nextMilestone: nextMilestone({
      language,
      currentStreak,
      journalCount: journalEntries.length,
      meditationCount: meditationEntries.length,
      totalInnerwork: allEntries.length,
    }),
    reflection: buildReflection({ language, improved, level: momentumLevel }),
    signals,
  };
}
