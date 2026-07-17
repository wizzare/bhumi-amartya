import { AIGateway } from "@/lib/ai/gateway";
import { buildIdentitySnapshot } from "@/lib/ai/identitySnapshot";
import { MemoryCompiler } from "@/lib/livingIntelligence/memoryCompiler";
import { buildCircadianContext } from "@/lib/livingIntelligence/circadianEngine";
import { ReflectionEngine } from "@/lib/livingIntelligence/reflectionEngine";
import { JourneyEngine } from "@/lib/livingIntelligence/journeyEngine";
import { WellnessEngine } from "@/lib/livingIntelligence/wellnessEngine";
import { PotentialEngine } from "@/lib/livingIntelligence/potentialEngine";
import { CanonicalHumanMeaningService } from "@/lib/services/canonicalHumanMeaningService";
import { CanonicalTranslatorService } from "@/lib/services/canonicalTranslatorService";
import { astrologyRepository } from "@/lib/repositories/astrologyRepository";
import { WeeklyRecommendationRepository } from "@/lib/repositories/weeklyRecommendationRepository";
import type { WeeklyRecommendation } from "@/lib/types/communication";
import type { UserProfile } from "@/lib/types/user";
import type { Blueprint } from "@/lib/types/blueprint";
import { DateTime } from "luxon";
import { buildRepeatedLifeSituationContext } from "@/lib/intelligence/lifeSituationIntelligence";

// --- Category-specific fallbacks: concise, honest, non-duplicating ---
// No generic affirmations. No interchangeable spiritual phrases.
const CATEGORY_FALLBACKS = {
  kabarMingguIni:
    "Minggu ini membawa ruang untuk menemukan ritme yang lebih selaras dengan kebutuhan dirimu — antara apa yang ingin dicapai dan apa yang perlu dijaga.",
  pikiran:
    "Perhatianmu cenderung terfokus pada satu hal dalam satu waktu. Minggu ini, prioritaskan satu keputusan yang paling berdampak daripada mencoba menyelesaikan semua sekaligus.",
  ekonomi:
    "Ada satu langkah kecil yang bisa dilakukan minggu ini di bidang pekerjaanmu — bisa berupa meninjau satu keterampilan yang ingin dikuatkan, atau merapikan satu bagian dari alur kerjamu.",
  asmara:
    "Koneksi yang nyata tumbuh dari kejujuran, bukan dari kata-kata sempurna. Minggu ini, perhatikan satu momen ketika kamu bisa lebih hadir — bukan lebih sempurna — bagi orang yang kamu cintai.",
  orangTerdekat:
    "Hubungan dengan orang-orang terdekatmu mendapat energi ketika kamu hadir sepenuhnya, bukan hanya ketika ada keperluan. Satu percakapan bermakna lebih baik dari sepuluh perbincangan dangkal.",
  maknaBatin:
    "Setiap minggu menyimpan pelajaran yang tidak selalu terlihat saat itu terjadi. Perhatikan pola apa yang berulang dalam pengalamanmu — itu biasanya sinyal dari sesuatu yang sedang ingin dipahami lebih dalam.",
  yangLagiBerat:
    "Jika ada sesuatu yang terasa berat minggu ini, izinkan dirimu untuk mengakuinya tanpa harus segera menyelesaikannya. Tidak semua beban perlu ditanggung sendirian.",
  ruangBaru:
    "Ada potensi yang belum sepenuhnya dijelajahi dalam dirimu. Minggu ini bisa menjadi waktu yang tepat untuk memulai satu hal kecil di arah yang selama ini terasa menarik — bukan karena harus, tapi karena memang ingin.",
};

function getMondayWeekRange(now: DateTime): { monday: DateTime; sunday: DateTime } {
  const monday = now.minus({ days: now.weekday - 1 }).startOf("day");
  const sunday = monday.plus({ days: 6 }).endOf("day");
  return { monday, sunday };
}

// Generic affirmation detection — flag AI output that is clearly non-specific
const GENERIC_AFFIRMATION_PATTERNS = [
  /segala hal berjalan baik/i,
  /ketenangan batin menarik/i,
  /kembali ke inti dirimu/i,
  /mulailah harimu dengan keheningan/i,
  /aku selaras dengan ritme alam/i,
  /semua akan baik-baik saja/i,
  /alam semesta mendukungmu/i,
];

function isGenericAffirmation(text: string): boolean {
  if (!text || text.trim().length < 10) return true;
  return GENERIC_AFFIRMATION_PATTERNS.some((pattern) => pattern.test(text));
}

function detectDuplicates(fields: Record<string, string>): string[] {
  const duplicates: string[] = [];
  const keys = Object.keys(fields);
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const a = (fields[keys[i]] || "").trim();
      const b = (fields[keys[j]] || "").trim();
      if (a.length > 20 && a === b) {
        duplicates.push(`${keys[i]}==${keys[j]}`);
      }
    }
  }
  return duplicates;
}

type CategoryFields = {
  kabarMingguIni: string;
  pikiran: string;
  ekonomi: string;
  asmara: string;
  orangTerdekat: string;
  maknaBatin: string;
  yangLagiBerat: string;
  ruangBaru: string;
};

function validateAndSanitize(raw: Partial<CategoryFields>): CategoryFields {
  const categoryKeys = [
    "kabarMingguIni", "pikiran", "ekonomi", "asmara",
    "orangTerdekat", "maknaBatin", "yangLagiBerat", "ruangBaru",
  ] as const;

  const resolved: Record<string, string> = {};
  for (const key of categoryKeys) {
    const value = raw[key];
    const fallback = CATEGORY_FALLBACKS[key];
    if (!value || isGenericAffirmation(value)) {
      console.warn(`[WeeklyRecommendationService] Field "${key}" failed quality check — using category fallback.`);
      resolved[key] = fallback;
    } else {
      resolved[key] = value;
    }
  }

  const duplicates = detectDuplicates(resolved);
  if (duplicates.length > 0) {
    console.warn("[WeeklyRecommendationService] Duplicate content detected between categories:", duplicates);
    duplicates.forEach((pair) => {
      const [, second] = pair.split("==");
      const secondKey = second?.trim() as keyof typeof CATEGORY_FALLBACKS | undefined;
      if (secondKey && CATEGORY_FALLBACKS[secondKey]) {
        console.warn(`[WeeklyRecommendationService] Replacing duplicate field "${secondKey}" with fallback.`);
        resolved[secondKey] = CATEGORY_FALLBACKS[secondKey];
      }
    });
  }

  return resolved as CategoryFields;
}

export class WeeklyRecommendationService {
  public static async getRecommendation(
    uid: string,
    profile: UserProfile,
    blueprint: Blueprint,
  ): Promise<WeeklyRecommendation | null> {
    console.log("[WEEKLY] ENTER");
    if (!blueprint) {
      console.log("[WEEKLY] NULL BLUEPRINT");
      return null;
    }
    const timezone = (profile as any)?.timezone || (profile as any)?.profile?.timezone || "Asia/Jakarta";
    const now = DateTime.now().setZone(timezone);
    try {
      const cached = await WeeklyRecommendationRepository.get(uid, now.toJSDate(), timezone);
      console.log("[WEEKLY] CACHE", cached);
      if (cached && cached.kabarMingguIni && cached.pikiran && cached.ekonomi && cached.asmara
        && cached.orangTerdekat && cached.maknaBatin && cached.yangLagiBerat && cached.ruangBaru) {
        const expiresAt = DateTime.fromISO(cached.expiresAt);
        if (now < expiresAt) {
          console.log("[WEEKLY] RETURN CACHED", cached);
          return cached;
        }
      }
    } catch (err) {
      console.warn("[WeeklyRecommendationService] Cache lookup failed", err);
    }
    console.log("[WEEKLY] GENERATE");
    return await this.generate(uid, profile, blueprint, now);
  }

  private static async generate(
    uid: string,
    profile: UserProfile,
    blueprint: Blueprint,
    now: DateTime,
  ): Promise<WeeklyRecommendation | null> {
    try {
      const dateKey = now.toISODate()!;
      const identity = buildIdentitySnapshot(profile, blueprint);
      const astrologyTransits = await astrologyRepository.getWeeklyTransits();
      const canonicalIdentity = CanonicalTranslatorService.translate(blueprint);

      let memory = null;
      let reflection = null;
      let journey = null;
      let wellness = null;
      let potential = null;
      let circadian = null;
      try { memory = await MemoryCompiler.compile(uid, dateKey, identity); } catch (e) {}
      try { circadian = buildCircadianContext(new Date(), (profile as any)?.profile?.language || profile.language || "id"); } catch (e) {}
      const safeMemory = memory || { dominantThemes: [], recurringWounds: [], healingEdges: [], journalHistory: [] };
      const safeCircadian = circadian || { greeting: "Selamat datang", isNight: false, timeOfDay: "morning" };
      try { reflection = ReflectionEngine.calculate(safeMemory as any, identity, safeCircadian as any); } catch (e) {}
      const safeReflection = reflection || { greetingStyle: { text: "Halo", format: "salutation-first" }, narrativeDirection: "steady", previousReflectionSummary: "" };
      try { journey = JourneyEngine.calculate(safeMemory as any, safeReflection as any, identity, safeCircadian as any); } catch (e) {}
      const safeJourney = journey || { currentStage: "Attunement" };
      try { wellness = WellnessEngine.calculate(safeMemory as any, safeReflection as any, safeJourney as any, identity, safeCircadian as any, { language: (profile as any)?.profile?.language || profile.language || "id" }); } catch (e) {}
      const safeWellness = wellness || {};
      try { potential = PotentialEngine.calculate(identity, safeMemory as any, safeReflection as any, safeJourney as any, safeWellness as any, safeCircadian as any); } catch (e) {}
      const safePotential = potential || {};

      const humanMeaning = CanonicalHumanMeaningService.generatePayload(
        canonicalIdentity,
        safeReflection as any,
        safeJourney as any,
        safeWellness as any,
        safePotential as any,
        safeCircadian as any,
        safeMemory as any,
      );

      // Extract recent health context from compiled memory for health-sensitivity
      const recentHealthContext = (safeMemory as any)?.recentDailyStates
        ? (safeMemory as any).recentDailyStates.slice(0, 3).map((s: any) => ({
            health: s.healthCondition || s.health || "healthy",
            mood: s.moodScore || s.mood,
            energy: s.energyLevel || s.energy,
          }))
        : [];
      const recentDailyStates = (safeMemory as any)?.recentDailyStates || [];
      const repeatedLifeSituationContext = buildRepeatedLifeSituationContext(recentDailyStates);

      const response = await AIGateway.generateStructuredJson<any>({
        promptKey: "daily-guidance",
        language: (profile as any)?.profile?.language || profile.language || "id",
        identity,
        memory: safeMemory as any,
        reflection: safeReflection as any,
        journey: safeJourney as any,
        wellness: safeWellness as any,
        potential: safePotential as any,
        circadian: safeCircadian as any,
        additionalContext: {
          uid,
          profile,
          blueprint,
          astrologyTransits,
          humanMeaning,
          isWeeklyRecommendation: true,
          timeHorizon: "next 7 days",
          recentHealthContext,
          recentDailyStates,
          repeatedLifeSituationContext: repeatedLifeSituationContext.activeCount ? repeatedLifeSituationContext : null,
          // Route Growth signals explicitly so the prompt can populate Ruang Baru and Ekonomi
          weeklyGrowthSignals: {
            talents: humanMeaning.economics?.talentMeaning || "",
            career: humanMeaning.economics?.careerMeaning || "",
            currentLesson: humanMeaning.growth?.currentLessonMeaning || "",
            milestone: humanMeaning.growth?.milestoneMeaning || "",
            transformation: humanMeaning.growth?.transformationMeaning || "",
          },
        },
      });

      console.log("[WEEKLY] AI RESPONSE", response);

      if (response.ok && response.data) {
        const data = response.data;
        const weekId = now.toFormat("kkkk-'W'WW");
        const { monday, sunday } = getMondayWeekRange(now);

        // Map and validate the 8 new category fields
        const rawCategories: Partial<CategoryFields> = {
          kabarMingguIni: data.kabarMingguIni || data.tema || "",
          pikiran: data.pikiran || data.fokus || "",
          ekonomi: data.ekonomi || data.peluang || "",
          asmara: data.asmara || data.manifestasi?.attraction || "",
          orangTerdekat: data.orangTerdekat || data.saranBhumi || "",
          maknaBatin: data.maknaBatin || data.manifestasi?.assumption || "",
          yangLagiBerat: data.yangLagiBerat || data.perluDijaga || "",
          ruangBaru: data.ruangBaru || "",
        };
        const validated = validateAndSanitize(rawCategories);

        const recommendation: WeeklyRecommendation = {
          uid,
          weekId,
          startDate: monday.toISODate()!,
          endDate: sunday.toISODate()!,
          // V2 category fields (validated)
          kabarMingguIni: validated.kabarMingguIni,
          pikiran: validated.pikiran,
          ekonomi: validated.ekonomi,
          asmara: validated.asmara,
          orangTerdekat: validated.orangTerdekat,
          maknaBatin: validated.maknaBatin,
          yangLagiBerat: validated.yangLagiBerat,
          ruangBaru: validated.ruangBaru,
          // V1 legacy fields (backward-compat with cached documents)
          tema: data.tema || validated.kabarMingguIni,
          peluang: data.peluang || validated.ekonomi,
          perluDijaga: data.perluDijaga || validated.yangLagiBerat,
          fokus: data.fokus || validated.pikiran,
          saranBhumi: data.saranBhumi || validated.orangTerdekat,
          manifestasi: {
            affirmation: data.manifestasi?.affirmation || "",
            assumption: data.manifestasi?.assumption || validated.maknaBatin,
            attraction: data.manifestasi?.attraction || validated.asmara,
          },
          generatedAt: now.toISO()!,
          expiresAt: sunday.toISO()!,
        };
        await WeeklyRecommendationRepository.save(recommendation);
        console.log("[WEEKLY] SAVE", recommendation.weekId);
        console.log("[WEEKLY] RETURN", recommendation);
        return recommendation;
      }
      console.log("[WEEKLY] AI FAILED, FALLBACK");
      return this.generateFallback(uid, now);
    } catch (error) {
      console.error("[WeeklyRecommendationService] Generation failed:", error);
      console.log("[WEEKLY] ERROR, FALLBACK");
      return this.generateFallback(uid, now);
    }
  }

  private static generateFallback(uid: string, now: DateTime): WeeklyRecommendation {
    const { monday, sunday } = getMondayWeekRange(now);
    const recommendation: WeeklyRecommendation = {
      uid,
      weekId: now.toFormat("kkkk-'W'WW"),
      startDate: monday.toISODate()!,
      endDate: sunday.toISODate()!,
      // V2 category fields — category-specific, non-generic fallbacks
      kabarMingguIni: CATEGORY_FALLBACKS.kabarMingguIni,
      pikiran: CATEGORY_FALLBACKS.pikiran,
      ekonomi: CATEGORY_FALLBACKS.ekonomi,
      asmara: CATEGORY_FALLBACKS.asmara,
      orangTerdekat: CATEGORY_FALLBACKS.orangTerdekat,
      maknaBatin: CATEGORY_FALLBACKS.maknaBatin,
      yangLagiBerat: CATEGORY_FALLBACKS.yangLagiBerat,
      ruangBaru: CATEGORY_FALLBACKS.ruangBaru,
      // V1 legacy fields
      tema: "Penyelarasan Mingguan",
      peluang: CATEGORY_FALLBACKS.ekonomi,
      perluDijaga: CATEGORY_FALLBACKS.yangLagiBerat,
      fokus: CATEGORY_FALLBACKS.pikiran,
      saranBhumi: CATEGORY_FALLBACKS.orangTerdekat,
      manifestasi: {
        affirmation: "Aku hadir sepenuhnya dalam setiap langkah yang aku ambil minggu ini.",
        assumption: CATEGORY_FALLBACKS.maknaBatin,
        attraction: CATEGORY_FALLBACKS.ruangBaru,
      },
      generatedAt: now.toISO()!,
      expiresAt: sunday.toISO()!,
    };
    console.log("[WEEKLY] RETURN (FALLBACK)", recommendation);
    return recommendation;
  }
}
