import { AIGateway } from "@/lib/ai/gateway";
import { buildIdentitySnapshot } from "@/lib/ai/identitySnapshot";
import { MemoryCompiler } from "@/lib/livingIntelligence/memoryCompiler";
import { buildCircadianContext } from "@/lib/livingIntelligence/circadianEngine";
import { ReflectionEngine } from "@/lib/livingIntelligence/reflectionEngine";
import { JourneyEngine } from "@/lib/livingIntelligence/journeyEngine";
import { WellnessEngine } from "@/lib/livingIntelligence/wellnessEngine";
import { PotentialEngine } from "@/lib/livingIntelligence/potentialEngine";
import { DailyIntelligenceObject } from "@/lib/types/dailyIntelligence";
import {
  DAILY_GUIDANCE_CONTENT_VERSION,
  DAILY_GUIDANCE_PROMPT_VERSION,
  DAILY_GUIDANCE_SCHEMA_VERSION,
} from "@/lib/dailyGuidance/version";
import { createDailyContentSeed } from "@/lib/dailyGuidance/dailyContentKey";
import { generateBlueprintHash, generateMemoryHash } from "@/lib/utils/hashing";

export const dailyGuidanceEngine = {
  async generateLanguageFace(brain: DailyIntelligenceObject, context: any): Promise<any> {
    const identity = buildIdentitySnapshot(context.profile || context.user, context.blueprint);
    const memory = await MemoryCompiler.compile(
      brain.uid || context.uid || context.user?.uid || "",
      brain.localDateKey || context.localDateKey || "",
      identity,
    );
    const language = context.language === "en" ? "en" : "id";
    const circadian = buildCircadianContext(new Date(), language);
    const reflection = ReflectionEngine.calculate(memory, identity, circadian);
    const journey = JourneyEngine.calculate(memory, reflection, identity, circadian);
    const wellness = WellnessEngine.calculate(memory, reflection, journey, identity, circadian, { language });
    const potential = PotentialEngine.calculate(identity, memory, reflection, journey, wellness, circadian);

    const response = await AIGateway.generateStructuredJson<Record<string, any>>({
      promptKey: "daily-guidance",
      language,
      identity,
      memory,
      reflection,
      journey,
      wellness,
      potential,
      circadian,
      validateResponse: isDailyGuidanceProviderOutput,
      additionalContext: {
        ...context,
        brain,
        reflectionContext: reflection,
        journeyContext: journey,
        wellnessContext: wellness,
        potentialContext: potential,
      },
    });

    if (response.ok && response.data) {
      return this.mapToGuidance(brain, response.data, context);
    }
    return this.generateFallbackFace(brain, context);
  },

  mapToGuidance(brain: DailyIntelligenceObject, output: any, context?: any): any {
    const now = new Date().toISOString();
    return applyDynamicInfluence({
      uid: brain.uid,
      date: brain.localDateKey,
      localDateKey: brain.localDateKey,
      schemaVersion: DAILY_GUIDANCE_SCHEMA_VERSION,
      generatedWithPromptVersion: DAILY_GUIDANCE_PROMPT_VERSION,
      guidanceVersion: DAILY_GUIDANCE_CONTENT_VERSION,
      dailyVariationSeed: createDailyContentSeed({
        uid: brain.uid,
        localDateKey: brain.localDateKey,
        blueprint: context?.blueprint,
      }),
      blueprintHash: generateBlueprintHash(context?.blueprint),
      memoryHash: generateMemoryHash(context),
      theme: brain.theme,
      focus: brain.focus,
      soulReflectionText: output.soulReflectionText || output.soulReflection?.dailyMessage || "",
      dailyNoteText: output.dailyNoteText || output.companionReflection?.preview || "",
      companionReflection: output.companionReflection || null,
      categories: output.categories || null,
      manifestation: output.manifestation || null,
      astrologyToday: output.astroEnergy?.currentEnergy || context?.astrologyToday || context?.currentSky?.summary || "",
      aiInsight: output.soulReflectionText || output.soulReflection?.dailyMessage || "",
      journalPrompt: output.journalingPrompt?.prompt || "",
      meditationSuggestion: output.meditationRecommendation?.title || "",
      audioHealingSuggestion: output.audioHealingSuggestion || output.healingAudio?.title || "",
      emotionalFocus: output.soulReflection?.theme || "",
      spiritualFocus: output.soulReflection?.theme || "",
      groundedAction: output.soulReflection?.guidance || "",
      dailyPractices: output.dailyInnerwork?.tasks || [],
      innerworkRecommendations: output.innerworkRecommendations || null,
      generatedAt: now,
      createdAt: now,
      updatedAt: now,
      profileSnapshot: context?.profile ?? context?.user ?? null,
      blueprintSnapshot: context?.blueprint ?? null,
      previousProgressSummary: context?.previousGuidance?.dailyNoteText ?? "",
      source: "ai"
    }, context);
  },

  generateFallbackFace(brain: DailyIntelligenceObject, context?: any): any {
    const now = new Date().toISOString();
    return applyDynamicInfluence({
      uid: brain.uid,
      date: brain.localDateKey,
      localDateKey: brain.localDateKey,
      schemaVersion: DAILY_GUIDANCE_SCHEMA_VERSION,
      generatedWithPromptVersion: DAILY_GUIDANCE_PROMPT_VERSION,
      guidanceVersion: DAILY_GUIDANCE_CONTENT_VERSION,
      dailyVariationSeed: createDailyContentSeed({
        uid: brain.uid,
        localDateKey: brain.localDateKey,
        blueprint: context?.blueprint,
      }),
      blueprintHash: generateBlueprintHash(context?.blueprint),
      memoryHash: generateMemoryHash(context),
      theme: brain.theme,
      focus: brain.focus,
      soulReflectionText: "",
      dailyNoteText: "",
      categories: {
        general: { insight: "Hari ini tentang keseimbangan diri.", reason: "", advice: "Jaga fokusmu." },
        mental: { insight: "Pikiranmu stabil.", reason: "", advice: "Jaga ketenangan." },
        finance: { insight: "Fokus pada kestabilan keuangan.", reason: "", advice: "Kelola dengan baik." },
        love: { insight: "Fokus pada keharmonisan.", reason: "", advice: "Dengarkan pasangan." },
        relational: { insight: "Relasimu berjalan baik.", reason: "", advice: "Jaga komunikasi." },
        spiritual: { insight: "Pertumbuhan batinmu berjalan.", reason: "", advice: "Dengarkan dirimu." },
        challenges: { insight: "Hadapi rintangan dengan tenang.", reason: "", advice: "Ambil langkah perlahan." },
        opportunities: { insight: "Peluang baru ada di depan.", reason: "", advice: "Manfaatkan dengan bijak." }
      },
      manifestation: {
        affirmation: "Aku memilih hadir dengan jujur pada keadaan hari ini.",
        assumption: "Aku percaya arah kecil yang tepat bisa tumbuh dari kesadaran yang tenang.",
        attraction: "Aku mengundang kejernihan, keberanian lembut, dan ritme yang membumi.",
      },
      astrologyToday: context?.astrologyToday || context?.currentSky?.summary || "",
      aiInsight: "Hari ini tentang .",
      journalPrompt: "",
      meditationSuggestion: "",
      dailyPractices: [],
      generatedAt: now,
      createdAt: now,
      updatedAt: now,
      profileSnapshot: context?.profile ?? context?.user ?? null,
      blueprintSnapshot: context?.blueprint ?? null,
      previousProgressSummary: context?.previousGuidance?.dailyNoteText ?? "",
      source: "fallback"
    }, context);
  }
};

export function isDailyGuidanceProviderOutput(value: unknown): value is Record<string, any> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const output = value as Record<string, any>;
  const hasText = (candidate: unknown) => typeof candidate === "string" && candidate.trim().length > 0;
  return hasText(output.soulReflectionText ?? output.soulReflection?.dailyMessage)
    && hasText(output.dailyNoteText ?? output.companionReflection?.preview)
    && hasText(output.astroEnergy?.currentEnergy)
    && hasText(output.journalingPrompt?.prompt)
    && hasText(output.meditationRecommendation?.title);
}

function text(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const candidate = text(value);
    if (candidate) return candidate;
  }
  return "";
}

function topMappingLabel(context: any): string {
  const result = context?.wellnessMapping?.results?.[0];
  return firstText(result?.label, result?.category, result?.key);
}

function numberValue(value: unknown): number | null {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function list(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function uniqueRecords(records: any[]): any[] {
  const seen = new Set<string>();
  return records.filter((record, index) => {
    const key = [
      firstText(record?.localDateKey, record?.date, record?.appDate, record?.createdAt),
      firstText(
        record?.practiceId,
        record?.innerworkCompletion?.actualPracticeId,
        record?.innerworkRecommendation?.practiceId,
        record?.innerworkCompletion?.actualPracticeType,
        record?.innerworkRecommendation?.practiceType,
      ),
      firstText(record?.dailySummary, record?.emotionalWord, record?.moodLabel),
    ].filter(Boolean).join("|") || `record-${index}`;

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function completedPracticeCount(records: any[]): number {
  return records.filter((record) =>
    record?.completed === true
    || record?.journalingDone === true
    || record?.meditationDone === true
    || record?.audioHealingDone === true
    || record?.workoutDone === true
    || record?.yogaDone === true
    || record?.innerworkCompletion?.completed === true
  ).length;
}

function latestPractice(records: any[]): string {
  const latest = records.find((record) =>
    record?.practiceId
    || record?.innerworkCompletion?.actualPracticeId
    || record?.innerworkRecommendation?.practiceId
    || record?.innerworkCompletion?.actualPracticeType
    || record?.innerworkRecommendation?.practiceType
  );
  return firstText(
    latest?.practiceId,
    latest?.innerworkCompletion?.actualPracticeId,
    latest?.innerworkRecommendation?.practiceId,
    latest?.innerworkCompletion?.actualPracticeType,
    latest?.innerworkRecommendation?.practiceType,
  );
}

function dominantPractice(records: any[]): string {
  const counts = new Map<string, number>();
  for (const record of records) {
    const practice = firstText(
      record?.practiceId,
      record?.innerworkCompletion?.actualPracticeId,
      record?.innerworkRecommendation?.practiceId,
      record?.innerworkCompletion?.actualPracticeType,
      record?.innerworkRecommendation?.practiceType,
    );
    if (practice) counts.set(practice, (counts.get(practice) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
}

function metricValues(records: any[], metric: "energy" | "sleepQuality", limit: number): number[] {
  return records
    .map((record) => numberValue(record?.wellnessSnapshot?.metrics?.[metric] ?? record?.[metric]))
    .filter((value): value is number => value !== null)
    .slice(0, limit);
}

function trendLabel(values: number[]): "naik turun" | "meningkat" | "menurun" | "stabil" | "" {
  if (values.length < 3) return "";
  const deltas = values.slice(0, -1).map((value, index) => value - values[index + 1]).filter((delta) => delta !== 0);
  if (!deltas.length) return "stabil";
  const hasUp = deltas.some((delta) => delta > 0);
  const hasDown = deltas.some((delta) => delta < 0);
  if (hasUp && hasDown) return "naik turun";
  return hasUp ? "meningkat" : "menurun";
}

function buildDailyStateSentence(dailyState: any, previousDailyState: any): string {
  const emotion = firstText(dailyState?.emotionalWord, dailyState?.moodLabel);
  const nervousSystem = firstText(dailyState?.nervousSystemState, dailyState?.wellnessSnapshot?.metrics?.nervousSystemState);
  const energy = numberValue(dailyState?.wellnessSnapshot?.metrics?.energy ?? dailyState?.energy);
  const previousEnergy = numberValue(previousDailyState?.wellnessSnapshot?.metrics?.energy ?? previousDailyState?.energy);

  if (energy !== null && previousEnergy !== null && energy !== previousEnergy) {
    const direction = energy > previousEnergy ? "lebih tinggi" : "lebih rendah";
    return `Hari ini energimu ${direction} dibanding kemarin (${energy}/${previousEnergy}); biarkan pilihan harianmu mengikuti kapasitas nyata itu.`;
  }
  if (emotion && nervousSystem) {
    return `Check-in hari ini mencatat emosimu ${emotion} dan sistem sarafmu ${nervousSystem}; itu menjadi nada utama yang perlu ditemani.`;
  }
  if (emotion) return `Check-in hari ini mencatat emosimu ${emotion}; Bhumi memakai itu sebagai cermin pertama sebelum memberi arah.`;
  if (nervousSystem) return `Sistem sarafmu hari ini memberi sinyal ${nervousSystem}; ritme harianmu perlu membaca sinyal itu dulu.`;
  return "";
}

function buildJourneySentence(context: any, healingMemory: any): string {
  const history = uniqueRecords([
    ...list(context?.journeyHistory),
    ...list(context?.recentDailyStates),
    ...list(healingMemory?.last30Days),
  ]);
  const count = completedPracticeCount(history.slice(0, 30));
  const lastPractice = latestPractice(history);
  const growthNarrative = firstText(healingMemory?.growthNarrative, healingMemory?.weeklyLearning, healingMemory?.coachMemory);

  if (count >= 20) {
    return `Dalam 30 hari terakhir, kamu menyelesaikan ${count} jejak praktik; pola ini menunjukkan perubahan yang dijaga, bukan sekadar niat sesaat.`;
  }
  if (count >= 5) {
    return `Selama beberapa hari terakhir, kamu sudah mengumpulkan ${count} praktik; ${lastPractice ? `yang terakhir terkait ${lastPractice}.` : "konsistensi itu mulai menjadi bahasa tubuhmu."}`;
  }
  if (lastPractice) return `Jejak perjalanan terakhirmu menunjukkan praktik ${lastPractice}; respons tubuh dan batinmu setelahnya layak diperhatikan hari ini.`;
  if (growthNarrative) return `Memori perjalananmu sedang menyorot ${growthNarrative}; tema itu menjadi benang yang Bhumi bawa hari ini.`;
  return "";
}

function buildWellnessSentence(context: any): string {
  const theme = topMappingLabel(context);
  const states = list(context?.recentDailyStates);
  const recentSleep = states
    .map((state) => numberValue(state?.wellnessSnapshot?.metrics?.sleepQuality ?? state?.sleepQuality))
    .filter((value): value is number => value !== null)
    .slice(0, 3);
  const recentEnergy = states
    .map((state) => numberValue(state?.wellnessSnapshot?.metrics?.energy ?? state?.energy))
    .filter((value): value is number => value !== null)
    .slice(0, 3);

  if (recentSleep.length >= 2 && recentSleep[0] > recentSleep[1]) {
    return `Kualitas tidur terakhirmu mulai membaik (${recentSleep[0]}/${recentSleep[1]}); pertahankan pola yang membantu tubuhmu pulih.`;
  }
  if (recentEnergy.length >= 2 && recentEnergy[0] < recentEnergy[1]) {
    return `Energi terakhirmu turun dari ${recentEnergy[1]} ke ${recentEnergy[0]}; jangan memakai standar hari yang lebih kuat untuk membaca hari ini.`;
  }
  if (theme) return `Pemetaan Wellness hari ini paling menyorot ${theme}; rekomendasi Bhumi mengikuti kebutuhan itu, bukan nasihat umum.`;
  return "";
}

function buildAstroSentence(context: any): string {
  const astroTheme = firstText(
    context?.currentSky?.summary,
    context?.astrologyTransits?.summary,
    context?.astrologyToday,
  );
  if (!astroTheme) return "";
  return `Konteks langit hari ini terbaca sebagai ${astroTheme}; gunakan ini sebagai cuaca batin, bukan ramalan.`;
}

function buildPrioritizedCompanionReflection(context: any, healingMemory: any, blueprintTheme: string): {
  text: string;
  sources: Array<{ sentence: string; source: string }>;
  dominantTheme: string;
} {
  const dailyState = context?.dailyState ?? context?.wellnessState ?? null;
  const previousDailyState = context?.previousDailyState ?? context?.previousDayState ?? null;
  const history = uniqueRecords([
    ...list(context?.journeyHistory),
    ...list(context?.recentDailyStates),
    ...list(healingMemory?.last30Days),
  ]);
  const energy = numberValue(dailyState?.wellnessSnapshot?.metrics?.energy ?? dailyState?.energy);
  const emotion = firstText(dailyState?.emotionalWord, dailyState?.moodLabel).toLowerCase();
  const previousSummary = firstText(previousDailyState?.dailySummary, previousDailyState?.emotionalWord);
  const wellnessTheme = topMappingLabel(context);
  const recurringPractice = dominantPractice(history.slice(0, 30));
  const count180 = completedPracticeCount(history.slice(0, 180));
  const count90 = completedPracticeCount(history.slice(0, 90));
  const count30 = completedPracticeCount(history.slice(0, 30));
  const count7 = completedPracticeCount(history.slice(0, 7));
  const energyPattern = trendLabel(metricValues(history, "energy", 7));
  const sleepPattern = trendLabel(metricValues(history, "sleepQuality", 7));
  const isBoundary = /batas|boundary/i.test(`${previousSummary} ${wellnessTheme}`);
  const isLowEnergy = energy !== null && energy <= 4;
  const isRecovery = /tidur|sleep|pemulihan|recovery/i.test(wellnessTheme) || energyPattern === "naik turun";

  if (count180 >= 120) {
    return {
      dominantTheme: "Consistency",
      text: [
        `Aku menangkap ritme yang sudah cukup lama kamu jaga.`,
        `Sejak lama kamu terus kembali ke latihanmu${recurringPractice ? `, terutama ${recurringPractice}` : ""}; jadi perubahan energi hari ini lebih tepat dibaca sebagai penyesuaian, bukan tanda kamu harus mulai dari nol.`,
        "Dari semua kebiasaan yang sudah kamu jaga, bagian mana yang paling perlu dilindungi hari ini?",
        "Lindungi satu kebiasaan inti itu sebelum menambah target baru.",
      ].join(" "),
      sources: [
        { sentence: "Yang paling penting hari ini adalah menjaga ritme yang sudah terbukti bekerja.", source: "Dominant theme: Journey long-term consistency" },
        { sentence: `Sejak lama kamu terus kembali ke latihanmu${recurringPractice ? `, terutama ${recurringPractice}` : ""}; karena itu, perubahan energi hari ini perlu dibaca sebagai penyesuaian ritme, bukan alasan untuk mulai dari nol.`, source: "Journey 180-day practice history + Daily State" },
        { sentence: "Dari semua kebiasaan yang sudah kamu jaga, bagian mana yang paling perlu dilindungi hari ini?", source: "Journey 180-day practice history" },
        { sentence: "Lindungi satu kebiasaan inti itu sebelum menambah target baru.", source: "Journey 180-day practice history" },
      ],
    };
  }

  if (isLowEnergy) {
    const support = count7 >= 5
      ? "Minggu ini kamu tetap kembali ke latihanmu, jadi tubuhmu mungkin bukan berhenti bergerak; ia sedang meminta cara bergerak yang lebih memulihkan."
      : sleepPattern === "meningkat"
        ? "Kualitas tidur mulai memberi sinyal pemulihan, jadi hari ini lebih tepat dipakai untuk menjaga stabilitas tubuh."
        : "Energi yang naik turun belakangan ini membuat pemulihan lebih penting daripada menambah beban baru.";
    return {
      dominantTheme: "Recovery",
      text: [
        "Aku menangkap tubuhmu sedang meminta pemulihan yang lebih jujur.",
        support,
        "Apa satu beban yang bisa kamu turunkan agar tubuhmu tidak harus memintanya lebih keras nanti?",
        "Pilih satu praktik ringan yang membuat tubuhmu merasa aman dulu.",
      ].join(" "),
      sources: [
        { sentence: "Yang paling perlu kamu perhatikan hari ini adalah pemulihan.", source: "Dominant theme: Daily State / Wellness recovery" },
        { sentence: support, source: "Daily State energy trend + Journey recent practice" },
        { sentence: "Apa satu beban yang bisa kamu turunkan agar tubuhmu tidak harus memintanya lebih keras nanti?", source: "Daily State low energy / recovery trend" },
        { sentence: "Pilih satu praktik ringan yang membuat tubuhmu merasa aman dulu.", source: "Daily State low energy / Wellness recovery" },
      ],
    };
  }

  if (isBoundary || /lelah|sensitif|gelisah/.test(emotion)) {
    return {
      dominantTheme: "Boundary",
      text: [
        "Aku menangkap tema batas sedang cukup dekat denganmu.",
        `Catatan sebelumnya tentang ${previousSummary || wellnessTheme || "energi pribadi"} bertemu dengan rasa ${emotion || "yang muncul hari ini"}; ini membuat keputusan kecilmu lebih penting daripada penjelasan panjang.`,
        "Di bagian mana kamu sebenarnya sudah tahu perlu berkata cukup?",
        "Ucapkan satu batas kecil dengan tenang sebelum tubuhmu menanggungnya sebagai lelah.",
      ].join(" "),
      sources: [
        { sentence: "Fokus hari ini adalah batas yang lebih jujur.", source: "Dominant theme: Boundary" },
        { sentence: `Catatan sebelumnya tentang ${previousSummary || wellnessTheme || "energi pribadi"} bertemu dengan rasa ${emotion || "yang muncul hari ini"}; ini membuat keputusan kecilmu lebih penting daripada penjelasan panjang.`, source: "Previous Daily State / Wellness Mapping + Daily State emotion" },
        { sentence: "Di bagian mana kamu sebenarnya sudah tahu perlu berkata cukup?", source: "Boundary theme + Daily State emotion" },
        { sentence: "Ucapkan satu batas kecil dengan tenang sebelum tubuhmu menanggungnya sebagai lelah.", source: "Boundary theme + Daily State emotion" },
      ],
    };
  }

  if (count90 >= 60 || count30 >= 20) {
    const duration = count90 >= 60 ? "beberapa bulan" : "30 hari terakhir";
    return {
      dominantTheme: "Consistency",
      text: [
        "Aku melihat konsistensi mulai menjadi bahasa perjalananmu.",
        `Selama ${duration}, kamu berkali-kali kembali ke latihanmu${recurringPractice ? `, terutama ${recurringPractice}` : ""}; itu berarti arahmu sedang dibentuk oleh pengulangan, bukan oleh suasana hati sesaat.`,
        "Kebiasaan mana yang paling terasa mulai mengubah caramu mengambil keputusan?",
        "Jaga satu pengulangan yang sudah bekerja hari ini.",
      ].join(" "),
      sources: [
        { sentence: "Yang paling menonjol hari ini adalah konsistensi.", source: "Dominant theme: Journey consistency" },
        { sentence: `Selama ${duration}, kamu berkali-kali kembali ke latihanmu${recurringPractice ? `, terutama ${recurringPractice}` : ""}; itu berarti arahmu sedang dibentuk oleh pengulangan, bukan oleh suasana hati sesaat.`, source: "Journey 30/90-day practice history" },
        { sentence: "Kebiasaan mana yang paling terasa mulai mengubah caramu mengambil keputusan?", source: "Journey longitudinal practice history" },
        { sentence: "Jaga satu pengulangan yang sudah bekerja hari ini.", source: "Journey longitudinal practice history" },
      ],
    };
  }

  if (count7 >= 5) {
    return {
      dominantTheme: "Growing Habit",
      text: [
        "Aku melihat ada kebiasaan kecil yang mulai mencari bentuk.",
        `Minggu ini kamu tetap kembali ke latihanmu${recurringPractice ? ` lewat ${recurringPractice}` : ""}; jejak ini belum perlu dibesarkan, hanya perlu dijaga agar tidak putus.`,
        "Apa yang biasanya membuat ritme kecil ini mudah terganggu?",
        "Sederhanakan latihanmu hari ini agar tetap bisa dilakukan.",
      ].join(" "),
      sources: [
        { sentence: "Hari ini yang paling penting adalah menjaga kebiasaan yang baru mulai terbentuk.", source: "Dominant theme: 7-day Journey habit" },
        { sentence: `Minggu ini kamu tetap kembali ke latihanmu${recurringPractice ? ` lewat ${recurringPractice}` : ""}; jejak ini belum perlu dibesarkan, hanya perlu dijaga agar tidak putus.`, source: "Journey 7-day practice history" },
        { sentence: "Apa yang biasanya membuat ritme kecil ini mudah terganggu?", source: "Journey 7-day practice history" },
        { sentence: "Sederhanakan latihanmu hari ini agar tetap bisa dilakukan.", source: "Journey 7-day practice history" },
      ],
    };
  }

  if (isRecovery) {
    const support = sleepPattern === "meningkat"
      ? "Kualitas tidur mulai memberi sinyal pemulihan, jadi hari ini lebih tepat dipakai untuk menjaga stabilitas tubuh."
      : "Energi yang naik turun belakangan ini membuat pemulihan lebih penting daripada menambah beban baru.";
    return {
      dominantTheme: "Recovery",
      text: [
        "Aku menangkap pemulihan sedang menjadi pesan utama tubuhmu.",
        support,
        "Apa satu beban yang bisa kamu turunkan agar tubuhmu tidak harus memintanya lebih keras nanti?",
        "Pilih satu praktik ringan yang membuat tubuhmu merasa aman dulu.",
      ].join(" "),
      sources: [
        { sentence: "Yang paling perlu kamu perhatikan hari ini adalah pemulihan.", source: "Dominant theme: Wellness recovery" },
        { sentence: support, source: "Daily State energy trend / Wellness recovery" },
        { sentence: "Apa satu beban yang bisa kamu turunkan agar tubuhmu tidak harus memintanya lebih keras nanti?", source: "Recovery trend" },
        { sentence: "Pilih satu praktik ringan yang membuat tubuhmu merasa aman dulu.", source: "Wellness recovery" },
      ],
    };
  }

  return {
    dominantTheme: blueprintTheme ? "Meaning" : "Start",
    text: [
      "Aku belum akan berpura-pura mengingat perjalanan yang belum kamu catat.",
      blueprintTheme
        ? `Karena jejak harianmu masih baru, Bhumi baru bisa memakai pola dasar ${blueprintTheme} sebagai pegangan awal.`
        : "Karena jejak harianmu masih baru, Bhumi belum akan berpura-pura mengingat sesuatu yang belum kamu jalani.",
      "Apa satu hal yang paling nyata kamu rasakan sebelum hari ini dimulai?",
      "Isi satu check-in jujur agar Bhumi punya jejak nyata untuk menemanimu besok.",
    ].join(" "),
    sources: [
      { sentence: "Hari ini yang paling penting adalah mulai dengan jujur, bukan banyak.", source: "Dominant theme: New-user start" },
      { sentence: blueprintTheme ? `Karena jejak harianmu masih baru, Bhumi baru bisa memakai pola dasar ${blueprintTheme} sebagai pegangan awal.` : "Karena jejak harianmu masih baru, Bhumi belum akan berpura-pura mengingat sesuatu yang belum kamu jalani.", source: blueprintTheme ? "Blueprint Synthesis / new-user state" : "New-user state" },
      { sentence: "Apa satu hal yang paling nyata kamu rasakan sebelum hari ini dimulai?", source: "New-user state" },
      { sentence: "Isi satu check-in jujur agar Bhumi punya jejak nyata untuk menemanimu besok.", source: "New-user state" },
    ],
  };
}

function buildCompanionReflection(context: any, healingMemory: any, blueprintTheme: string): {
  text: string;
  sources: Array<{ sentence: string; source: string }>;
} {
  return buildPrioritizedCompanionReflection(context, healingMemory, blueprintTheme);
}

function buildInfluence(context: any): {
  mirror: string;
  compass: string;
  manifestation: string;
  general: string;
  finance: string;
  challenge: string;
  opportunity: string;
  categorySupport: Record<string, string>;
  tags: string[];
  sources: Array<{ sentence: string; source: string }>;
} {
  const dailyState = context?.dailyState ?? context?.wellnessState ?? null;
  const previousDailyState = context?.previousDailyState ?? context?.previousDayState ?? null;
  const healingMemory = context?.healingMemory ?? context?.journeyMemory ?? null;
  const emotionalWord = firstText(dailyState?.emotionalWord, dailyState?.moodLabel);
  const nervousSystem = firstText(dailyState?.nervousSystemState, dailyState?.wellnessSnapshot?.metrics?.nervousSystemState);
  const previousSummary = firstText(previousDailyState?.dailySummary, previousDailyState?.emotionalWord);
  const journeyTheme = firstText(
    healingMemory?.growthNarrative,
    healingMemory?.weeklyLearning,
    healingMemory?.monthlyTheme,
    healingMemory?.coachMemory,
  );
  const wellnessTheme = topMappingLabel(context);
  const astroTheme = firstText(
    context?.currentSky?.summary,
    context?.astrologyTransits?.summary,
    context?.astrologyToday,
  );
  const memoryTheme = firstText(
    context?.emotionalMemory?.nextHealingEdge,
    context?.emotionalMemory?.suggestedFocus,
    context?.journalHistory?.[0]?.emotion,
    context?.journalHistory?.[0]?.content,
  );
  const blueprintTheme = firstText(
    context?.unifiedBlueprint?.coreNeeds?.[0],
    context?.blueprintSummary,
    context?.blueprint?.lifePath?.role,
  );
  const dailyStateSentence = buildDailyStateSentence(dailyState, previousDailyState);
  const journeySentence = buildJourneySentence(context, healingMemory);
  const wellnessSentence = buildWellnessSentence(context);
  const astroSentence = buildAstroSentence(context);
  const companionReflection = buildCompanionReflection(context, healingMemory, blueprintTheme);

  const envContext = context?.environmentContext;
  const envSupport = buildEnvironmentSupport(envContext);
  const categorySupport = buildCategorySupport({
    dailyStateSentence,
    journeySentence,
    wellnessSentence,
    astroSentence,
    previousSummary,
    emotionalWord,
    nervousSystem,
    journeyTheme,
    wellnessTheme,
    blueprintTheme,
    envSupport,
  });

  const tags = [
    emotionalWord ? `dailyState:${emotionalWord}` : "",
    nervousSystem ? `nervousSystem:${nervousSystem}` : "",
    previousSummary ? `previousDay:${previousSummary}` : "",
    journeyTheme ? `journey:${journeyTheme}` : "",
    wellnessTheme ? `wellness:${wellnessTheme}` : "",
    astroTheme ? `astro:${astroTheme}` : "",
    memoryTheme ? `memory:${memoryTheme}` : "",
    blueprintTheme ? `blueprint:${blueprintTheme}` : "",
    envContext?.locationLabel ? `env:${envContext.locationLabel}` : "",
  ].filter(Boolean);

  return {
    mirror: appendSentence(companionReflection.text, envSupport.mirror, 720),
    compass: [
      astroSentence,
      wellnessSentence,
      envSupport.compass,
      previousSummary ? `Catatan kemarin masih tertinggal sebagai konteks: ${previousSummary}.` : "",
    ].filter(Boolean).join(" "),
    manifestation: [
      wellnessTheme ? `Aku memilih tindakan yang menghormati kebutuhan ${wellnessTheme}.` : "",
      memoryTheme ? `Aku mengakui pelajaran ${memoryTheme} dan berhenti mengulang respons lama.` : "",
    ].filter(Boolean).join(" "),
    general: [
      dailyStateSentence,
      envSupport.general,
    ].filter(Boolean).join(" "),
    finance: envSupport.finance,
    challenge: [journeySentence, envSupport.challenge].filter(Boolean).join(" "),
    opportunity: [astroSentence, envSupport.opportunity].filter(Boolean).join(" "),
    categorySupport,
    tags,
    sources: companionReflection.sources,
  };
}

function buildCategorySupport(input: {
  dailyStateSentence: string;
  journeySentence: string;
  wellnessSentence: string;
  astroSentence: string;
  previousSummary: string;
  emotionalWord: string;
  nervousSystem: string;
  journeyTheme: string;
  wellnessTheme: string;
  blueprintTheme: string;
  envSupport: ReturnType<typeof buildEnvironmentSupport>;
}): Record<string, string> {
  const dailyTone = firstText(
    input.dailyStateSentence,
    input.emotionalWord ? `Check-in terakhirmu membawa nada ${input.emotionalWord}; bagian ini perlu dibaca dari keadaan nyata itu.` : "",
    input.nervousSystem ? `Sinyal sistem sarafmu ${input.nervousSystem} menjadi konteks penting untuk membaca hari ini.` : "",
  );
  const journeyTone = firstText(
    input.journeySentence,
    input.journeyTheme ? `Memori perjalananmu sedang membawa tema ${input.journeyTheme}; itu memberi arah yang lebih personal.` : "",
  );
  const wellnessTone = firstText(
    input.wellnessSentence,
    input.wellnessTheme ? `Wellness hari ini menyorot ${input.wellnessTheme}; saran perlu mengikuti kebutuhan tubuh itu.` : "",
  );
  const astroTone = input.astroSentence;
  const blueprintTone = input.blueprintTheme ? `Blueprint-mu menjadi dasar yang stabil, sementara konteks hari ini menentukan cara membawakannya.` : "";
  const previousTone = input.previousSummary ? `Jejak kemarin masih terasa melalui ${input.previousSummary}; hari ini tidak berdiri sendiri.` : "";

  return {
    general: [dailyTone, input.envSupport.general].filter(Boolean).join(" "),
    mental: [astroTone, dailyTone].filter(Boolean).join(" "),
    finance: [wellnessTone, input.envSupport.finance].filter(Boolean).join(" "),
    love: [dailyTone, previousTone].filter(Boolean).join(" "),
    relational: [astroTone, journeyTone].filter(Boolean).join(" "),
    spiritual: [journeyTone, blueprintTone].filter(Boolean).join(" "),
    challenges: [journeyTone, input.envSupport.challenge].filter(Boolean).join(" "),
    opportunities: [astroTone, input.envSupport.opportunity].filter(Boolean).join(" "),
  };
}

function buildEnvironmentSupport(envContext: any): {
  mirror: string;
  compass: string;
  general: string;
  finance: string;
  challenge: string;
  opportunity: string;
} {
  if (!envContext) {
    return { mirror: "", compass: "", general: "", finance: "", challenge: "", opportunity: "" };
  }

  const flags = Array.isArray(envContext.cautionFlags) ? envContext.cautionFlags : [];
  const circadian = String(envContext.circadianStatus || "").toLowerCase();
  const weather = String(envContext.weatherSummary || "").toLowerCase();
  const isWarm = flags.includes("heat_stress_possible") || /panas|hangat/.test(weather);
  const isHumid = flags.includes("high_humidity");
  const isAirSensitive = flags.some((flag: string) => /^air_quality_(sensitive|unhealthy|very_unhealthy|hazardous)$/.test(flag));
  const isNight = /night|malam|evening|petang/.test(circadian);
  const isMorning = /morning|pagi|dawn|fajar/.test(circadian);
  const contextSentence = typeof envContext.contextSentence === "string" ? envContext.contextSentence : "";

  if (isAirSensitive) {
    return {
      mirror: "Kualitas udara yang kurang ramah bisa menjadi pengingat lembut untuk membaca tubuh dengan lebih sabar.",
      compass: "Kualitas udara yang kurang ramah sebaiknya hanya menjadi konteks pendukung: pilih ritme yang lebih terlindungi bila tubuh terasa mudah lelah.",
      general: "Kualitas udara yang kurang ramah membuat keputusan kecil tentang ruang, jeda, dan aktivitas luar menjadi lebih layak diperhatikan.",
      finance: "Jika ada urusan luar ruang, pilih cara yang lebih hemat tenaga agar fokusmu tidak habis oleh kondisi sekitar.",
      challenge: "Bila tubuh terasa lebih berat, baca itu sebagai sinyal perawatan, bukan sebagai kesimpulan tentang emosimu.",
      opportunity: "Ruang baru hari ini bisa dimulai dari memilih tempat dan tempo yang lebih ramah untuk tubuh.",
    };
  }

  if (isWarm || isHumid) {
    return {
      mirror: "Udara yang terasa hangat atau lembap bisa menjadi latar kecil untuk memperlakukan tubuhmu lebih lembut.",
      compass: "Udara yang hangat atau lembap mendukung pilihan tempo yang lebih realistis, terutama untuk aktivitas yang banyak menguras tenaga.",
      general: "Kondisi sekitar yang hangat atau lembap bisa menjadi pengingat untuk menyesuaikan ritme tubuh, bukan memaksanya.",
      finance: "Atur urusan praktis dengan jeda yang cukup agar tenaga tidak habis sebelum hal utama selesai.",
      challenge: "Yang berat hari ini mungkin perlu didekati dengan pacing yang lebih ramah untuk tubuh.",
      opportunity: "Pilih peluang yang bisa dijalankan dengan tenaga stabil, bukan yang menuntut dorongan besar sekaligus.",
    };
  }

  if (isNight) {
    return {
      mirror: "Karena hari sudah masuk fase malam, tubuhmu mungkin lebih membutuhkan penutupan daripada dorongan baru.",
      compass: "Fase malam membuat Catatan Hari Ini lebih tepat dibaca sebagai penutup hari, bukan dorongan produktivitas baru.",
      general: "Fase malam mengajak ritme yang lebih menutup dan merapikan.",
      finance: "Tutup urusan praktis yang paling penting, lalu biarkan sisanya menunggu waktu yang lebih jernih.",
      challenge: "Jika pikiran masih penuh, pilih satu hal untuk ditutup agar tubuh tahu hari ini sudah cukup.",
      opportunity: "Ruang baru bisa berupa cara menutup hari dengan lebih sadar.",
    };
  }

  if (isMorning) {
    return {
      mirror: "Fase pagi bisa menjadi latar lembut untuk memulai dengan tempo yang jelas dan tidak berlebihan.",
      compass: "Fase pagi mendukung satu pilihan awal yang sederhana sebelum perhatianmu melebar ke banyak arah.",
      general: "Pagi memberi konteks untuk menyusun ritme, bukan mengejar semuanya sekaligus.",
      finance: "Pilih satu urusan praktis yang paling perlu dibuka lebih dulu.",
      challenge: "",
      opportunity: "Ruang baru hari ini paling mudah dimulai dari satu tindakan awal yang cukup jelas.",
    };
  }

  return {
    mirror: "",
    compass: contextSentence,
    general: contextSentence,
    finance: "",
    challenge: "",
    opportunity: "",
  };
}

function appendSentence(base: string | undefined, addition: string, maxLength = 900): string {
  const cleanBase = text(base);
  const cleanAddition = text(addition);
  if (!cleanAddition) return cleanBase;
  if (!cleanBase) return cleanAddition;
  if (cleanBase.toLowerCase().includes(cleanAddition.toLowerCase())) return cleanBase;
  const combined = `${cleanBase} ${cleanAddition}`.replace(/\s+/g, " ").trim();
  if (combined.length <= maxLength) return combined;
  const truncated = combined.slice(0, maxLength);
  const lastSentenceEnd = Math.max(truncated.lastIndexOf("."), truncated.lastIndexOf("?"), truncated.lastIndexOf("!"));
  if (lastSentenceEnd > Math.floor(maxLength * 0.6)) return truncated.slice(0, lastSentenceEnd + 1).trim();
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength).trim()}.`;
}

function applyDynamicInfluence(guidance: any, context: any): any {
  const influence = buildInfluence(context);
  const categories = guidance.categories ? { ...guidance.categories } : null;

  if (categories?.general) {
    categories.general = {
      ...categories.general,
      reason: appendSentence(categories.general.reason, influence.categorySupport.general || influence.general, 520),
    };
  }
  if (categories?.mental) {
    categories.mental = {
      ...categories.mental,
      reason: appendSentence(categories.mental.reason, influence.categorySupport.mental, 520),
    };
  }
  if (categories?.finance) {
    categories.finance = {
      ...categories.finance,
      reason: appendSentence(categories.finance.reason, influence.categorySupport.finance, 520),
      advice: appendSentence(categories.finance.advice, influence.finance, 360),
    };
  }
  if (categories?.love) {
    categories.love = {
      ...categories.love,
      reason: appendSentence(categories.love.reason, influence.categorySupport.love, 520),
    };
  }
  if (categories?.relational) {
    categories.relational = {
      ...categories.relational,
      reason: appendSentence(categories.relational.reason, influence.categorySupport.relational, 520),
    };
  }
  if (categories?.spiritual) {
    categories.spiritual = {
      ...categories.spiritual,
      reason: appendSentence(categories.spiritual.reason, influence.categorySupport.spiritual, 520),
    };
  }
  if (categories?.challenges) {
    categories.challenges = {
      ...categories.challenges,
      reason: appendSentence(categories.challenges.reason, influence.categorySupport.challenges || influence.challenge, 520),
    };
  }
  if (categories?.opportunities) {
    categories.opportunities = {
      ...categories.opportunities,
      reason: appendSentence(categories.opportunities.reason, influence.categorySupport.opportunities || influence.opportunity, 520),
    };
  }

  const manifestation = guidance.manifestation ? { ...guidance.manifestation } : null;
  if (manifestation) {
    manifestation.affirmation = appendSentence(manifestation.affirmation, influence.manifestation, 260);
  }

  return {
    ...guidance,
    soulReflectionText: text(guidance.soulReflectionText) || influence.mirror,
    dailyNoteText: appendSentence(guidance.dailyNoteText, influence.compass, 900),
    companionReflection: guidance.companionReflection
      ? {
          ...guidance.companionReflection,
          preview: appendSentence(guidance.companionReflection.preview, influence.compass, 500),
          fullReflection: appendSentence(guidance.companionReflection.fullReflection, influence.compass, 1600),
        }
      : guidance.companionReflection,
    categories,
    manifestation,
    dynamicInfluenceTags: influence.tags,
    dynamicSentenceSources: influence.sources,
  };
}
