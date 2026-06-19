import { dailyGuidanceDocId, dailyGuidancePath, dailyGuidanceRepository } from "@/lib/repositories/dailyGuidanceRepository";
import { DailyGuidance, DailyGuidanceContext, DailyGuidancePractice } from "@/lib/dailyGuidance/types";
import { generateGeminiJson } from "@/lib/ai/gemini";
import { buildDailyGuidancePrompt } from "@/lib/prompts/dailyGuidancePrompt";
import { buildAstroWeatherReflection } from "@/lib/astrology/astroWeather";
import { AstroHouseActivation, buildAstroHouseActivations } from "@/lib/astrology/astroHouseActivations";
import { innerworkIntelligence } from "@/lib/engines/innerworkIntelligence";
import type { DailyGuidanceInput, DailyGuidanceOutput } from "@/lib/orchestrators/types";
import { profileToCoreIdentity, profileToDashboardUser } from "@/lib/mappers/userProfileMapper";
import { UserProfile } from "@/lib/types/user";
import { Blueprint } from "@/lib/types/blueprint";
import { buildAdaptiveDailyGuidanceContext } from "@/lib/dailyGuidance/adaptiveContext";
import { generateAdaptiveDailyPractices } from "@/lib/dailyGuidance/adaptiveDailyPracticeGenerator";
import { reflectionRepository } from "@/lib/repositories/reflectionRepository";
import { journalRepository } from "@/lib/repositories/journalRepository";
import { meditationRepository } from "@/lib/repositories/meditationRepository";
import { audioHealingRepository } from "@/lib/repositories/audioHealingRepository";
import { activityRepository } from "@/lib/repositories/activityRepository";
import { generateBlueprintHash, generateMemoryHash, calculateSimilarity } from "@/lib/utils/hashing";
import {
  buildUnifiedBlueprintSynthesis,
  getArchetypes,
} from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";
import {
  generateLocalDailyGuidance,
  generateLocalManifestation,
} from "@/lib/orchestrators/localDailyGuidanceFallback";
import {
  DAILY_GUIDANCE_PROMPT_VERSION,
  DAILY_GUIDANCE_SCHEMA_VERSION,
  getDailyGuidanceStaleReason,
} from "@/lib/dailyGuidance/version";
import { getCanonicalHumanDesign, getCanonicalHumanDesignType } from "@/lib/humandesign/hdAudit";

/**
 * BHUMI AMARTYA - Daily AI Guidance Engine
 * Responsible for generating and retrieving daily guidance.
 */

// Build 31.3 Cooldown Lock (In-memory, instance-specific)
const activeGenerations = new Map<string, number>();
const COOLDOWN_MS = 30000; // 30 seconds protection

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function safeText(value: any, fallback: string = ""): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function safeList<T>(value: any): T[] {
  return Array.isArray(value) ? value : [];
}

function safeRecord(value: any): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function firstText(...values: any[]): string {
  for (const value of values) {
    const text = safeText(value).trim();
    if (text) return text;
  }
  return "";
}

function localizeDailyNoteLabel(value: string): string {
  const labels: Record<string, string> = {
    mercury: "Merkurius",
    venus: "Venus",
    mars: "Mars",
    moon: "Bulan",
    sun: "Matahari",
    saturn: "Saturnus",
    jupiter: "Jupiter",
    pluto: "Pluto",
    "wait to respond": "menunggu respons tubuh",
    "wait for invitation": "menunggu undangan yang tepat",
    "inform before action": "memberi informasi sebelum bergerak",
    "wait a lunar cycle": "menunggu kejernihan dalam satu siklus bulan",
    sacral: "sakral",
    emotional: "emosional",
    lunar: "lunar",
    splenic: "instingtif",
    ego: "kehendak",
    "self-projected": "arah diri",
    mental: "kejernihan mental",
  };
  return labels[value.toLowerCase()] || value;
}

function buildPersonalDailyNote(params: {
  synthesis: any;
  context: any;
  userName: string;
  dateSeed: string;
}): string {
  const signals = safeRecord(params.synthesis?.identitySignals);
  const blueprint = safeRecord(params.context?.blueprint);
  const humanDesign = safeRecord(getCanonicalHumanDesign(blueprint.humanDesign));
  const bodies = safeList<any>(params.context?.currentSky?.bodies);
  const activeTransits = safeList<any>(params.context?.astrologyTransits?.activeTransits);
  const seed = simpleHash([
    params.dateSeed,
    params.userName,
    signals.lifePath,
    signals.humanDesignType,
    signals.arcanaCenter,
    signals.sunSign,
    signals.moonSign,
  ].map((value) => safeText(value)).join("|"));

  const preferredBodies = ["Mercury", "Venus", "Mars", "Moon", "Saturn", "Jupiter", "Pluto", "Sun"];
  const bodyFromSky = preferredBodies
    .map((name) => bodies.find((body) => safeText(body.body || body.name || body.planet).toLowerCase() === name.toLowerCase()))
    .find(Boolean);
  const transit = activeTransits[seed % Math.max(activeTransits.length, 1)] || bodyFromSky || {};

  const houseActivations = safeList<any>(params.context?.astroHouseActivations);
  const houseTransit = houseActivations.find(a => a.planet === (transit.planet || transit.body || transit.name));
  const houseInfo = houseTransit ? ` di area ${houseTransit.lifeArea.toLowerCase()}` : "";

  const planetName = transit.planet || transit.body || transit.name || "Merkurius";
  const planet = localizeDailyNoteLabel(firstText(transit.planet, transit.body, transit.name, "Merkurius"));
  const sign = firstText(transit.sign, transit.zodiacSign, params.context?.currentSky?.moonSign, "tema analitis");
  const transitSummary = firstText(
    params.context?.astrologyTransits?.summary,
    params.context?.astrologyToday,
    safeList<any>(transit.themes).join(", "),
    "fokus mental, keputusan kecil, dan cara kamu mengatur respons harian"
  );

  const lifePath = String(firstText(signals.lifePath, blueprint.lifePath?.number));
  const hdType = String(firstText(signals.humanDesignType, humanDesign.type)).toLowerCase();
  const authority = String(firstText(signals.authority, humanDesign.authority)).toLowerCase();

  const lifePathMeanings: Record<string, string> = {
    "1": "belajar memimpin langkahmu sendiri dengan mandiri",
    "2": "belajar mendengarkan kebutuhan bersama sambil tetap menghargai batas dirimu",
    "3": "belajar menuangkan perasaan jujurmu menjadi inspirasi bagi orang lain",
    "4": "belajar merapikan langkah harian secara konsisten dan terarah",
    "5": "belajar menyalurkan rasa penasaranmu tanpa membuat energimu tercecer",
    "6": "belajar merawat kebersamaan dengan tanggung jawab yang seimbang",
    "7": "belajar mengamati kebenaran di balik situasi sebelum kamu bertindak",
    "8": "belajar mengelola kendali dan daya pribadi secara bijaksana",
    "9": "belajar merampungkan hal yang telah selesai dan melepaskan masa lalu",
    "11": "belajar mengalirkan ide-ide besarmu menjadi aksi nyata yang sederhana",
    "22": "belajar menyusun fondasi jangka panjang lewat disiplin kecil sehari-hari",
    "33": "belajar melayani kepedulian batinmu dengan bijak tanpa merugikan diri sendiri",
  };

  let decisionMeaning = "mengikuti kejujuran batinmu sebelum mengambil keputusan";
  if (hdType.includes("generator")) {
    if (authority.includes("sacral") || authority.includes("sakral")) {
      decisionMeaning = "bergerak berdasarkan respons fisik tubuhmu secara jujur, bukan dari desakan pikiran";
    } else if (authority.includes("emotional") || authority.includes("emosional")) {
      decisionMeaning = "menunggu kejernihan emosimu setelah gelombang perasaan mereda";
    } else {
      decisionMeaning = "menghormati tanggapan alami dari dalam tubuhmu";
    }
  } else if (hdType.includes("projector")) {
    if (authority.includes("splenic") || authority.includes("splenik") || authority.includes("instingtif")) {
      decisionMeaning = "mendengarkan insting spontan tubuhmu dan mengutamakan jeda sebelum setuju";
    } else if (authority.includes("emotional") || authority.includes("emosional")) {
      decisionMeaning = "menunggu hingga emosimu terasa jernih dan tenang sebelum merespons situasi";
    } else {
      decisionMeaning = "menjaga energimu dan mengutamakan jeda sebelum membagikan perhatianmu";
    }
  } else if (hdType.includes("manifestor")) {
    decisionMeaning = "mengomunikasikan langkah tindakanmu kepada lingkungan sekitar sebelum memulai arah baru";
  } else if (hdType.includes("reflector")) {
    decisionMeaning = "memberikan waktu bagi dirimu seiring berjalannya siklus untuk mengkristalkan pilihan";
  }

  const lpMeaning = lifePathMeanings[lifePath] || "mengenali pola yang membuat hidupmu lebih stabil";

  const transitText = `${planetName} ${sign} ${transitSummary}`.toLowerCase();
  const dominantTheme = transitText.includes("venus") || transitText.includes("relasi") || transitText.includes("hubungan")
    ? "relationship"
    : transitText.includes("mars") || transitText.includes("aksi") || transitText.includes("energi")
      ? "action"
      : transitText.includes("saturn") || transitText.includes("struktur") || transitText.includes("tanggung")
        ? "structure"
        : transitText.includes("moon") || transitText.includes("bulan") || transitText.includes("emosi")
          ? "emotion"
          : transitText.includes("pluto") || transitText.includes("lepas") || transitText.includes("transform")
            ? "release"
            : "clarity";

  const focusByTransit: Record<string, string> = {
    clarity: "Pilih satu keputusan kecil yang paling membutuhkan kejelasan, lalu rapikan informasinya sebelum kamu merespons.",
    structure: "Bereskan satu fondasi kecil: jadwal, prioritas, batas kerja, atau tugas tertunda yang membuat pikiran terus kembali ke tempat yang sama.",
    relationship: "Pilih satu percakapan yang perlu dibuat lebih jujur, lalu jawab dari rasa yang tenang, bukan dari keinginan untuk menyenangkan semua orang.",
    action: "Arahkan energi pada satu langkah yang benar-benar mendapat respons dari tubuhmu, bukan pada semua hal yang terlihat mendesak sekaligus.",
    emotion: "Beri ruang pada satu rasa yang paling kuat muncul hari ini, lalu cari tindakan sederhana yang membuat tubuhmu merasa lebih aman.",
    release: "Lepaskan satu hal kecil yang sudah tidak perlu kamu bawa hari ini: ekspektasi, jawaban lama, atau tanggung jawab yang bukan milikmu.",
  };

  const questionByTransit: Record<string, string> = {
    clarity: "Hal apa yang sebenarnya sudah jelas, tetapi masih kutunda karena takut harus mengubah cara bergerakku?",
    structure: "Fondasi kecil apa yang perlu kubereskan agar energiku tidak terus bocor ke hal yang berserakan?",
    relationship: "Di percakapan mana aku perlu lebih jujur tanpa kehilangan kelembutan?",
    action: "Langkah mana yang benar-benar mendapat respons dari tubuhmu, dan mana yang hanya lahir dari terburu-buru?",
    emotion: "Rasa apa yang sedang meminta didengar sebelum aku mengambil keputusan hari ini?",
    release: "Apa yang bisa kulepaskan hari ini supaya ruang batinku terasa lebih ringan and jernih?",
  };

  return [
    `Hari ini energi ${planet}${houseInfo} di ${sign} mengajakmu menyelaraskan pikiran dan keputusan kecil dengan tema ${transitSummary.toLowerCase()}. Kamu mungkin lebih cepat menangkap sinyal batin, lebih peka pada hal-hal yang belum rapi, atau ingin bergerak menyelesaikan urusan yang tertunda.`,
    `Dalam proses ini, kamu diajak untuk ${lpMeaning}. Langkahmu akan terasa jauh lebih selaras ketika kamu ${decisionMeaning}. Di lapisan yang lebih dalam, hadapi setiap tantangan hari ini dengan welas asih dan jagalah ketenangan hatimu tanpa harus memikul semua beban sendirian.`,
    `Fokus hari ini:\n${focusByTransit[dominantTheme]}`,
    `Pertanyaan refleksi:\n${questionByTransit[dominantTheme]}`,
  ].join("\n\n");
}

export const dailyGuidanceEngine = {
  /**
   * Main entry point to get today\u0027s guidance.
   * Checks Firestore first, then generates if missing or hashes mismatch.
   */
  async getOrCreateDailyGuidance(
    uid: string,
    date: string,
    context: DailyGuidanceContext
  ): Promise<DailyGuidance> {
    const docId = dailyGuidanceDocId(uid, date);
    const now = Date.now();

    // 1. Cooldown Protection (Build 31.3)
    const lastGenTime = activeGenerations.get(uid);
    if (lastGenTime && now - lastGenTime < COOLDOWN_MS) {
      console.log(`[QUOTA PROTECT] Generation cooled down for ${uid}. Returning existing if available.`);
      const existing = await dailyGuidanceRepository.getDailyGuidance(uid, date).catch(() => null);
      if (existing) return existing;
    }

    // 2. Hash Calculation
    const bpHash = generateBlueprintHash(context.blueprint);
    const memHash = generateMemoryHash(context);

    // 3. Cache Check (Firestore)
    let existing: DailyGuidance | null = null;
    let recent: DailyGuidance[] = [];
    try {
      existing = await dailyGuidanceRepository.getDailyGuidance(uid, date);
      recent = await dailyGuidanceRepository.getRecentGuidance(uid, 5);
    } catch (error) {
      console.error("[GUIDANCE LOAD ERROR] " + String(error));
    }

    const previousGuidance = recent.find(g => g.localDateKey !== date);

    if (existing) {
      const hashesMatch = existing.blueprintHash === bpHash && existing.memoryHash === memHash;
      const staleReason = getDailyGuidanceStaleReason(existing, {
        uid,
        localDateKey: date,
        blueprint: context.blueprint,
        context,
        previousGuidance
      });

      if (hashesMatch && !staleReason) {
        console.log(`[DAILY GUIDANCE CACHE HIT] Valid guidance for ${uid} on ${date}.`);
        return existing;
      }

      if (!hashesMatch) {
        console.log(`[DAILY GUIDANCE CACHE MISS] Hashes changed for ${uid}. BP: ${existing.blueprintHash === bpHash}, Mem: ${existing.memoryHash === memHash}`);
      } else {
        console.log(`[DAILY GUIDANCE CACHE STALE] Reason: ${staleReason}`);
      }
    } else {
      console.log(`[DAILY GUIDANCE CACHE MISS] No guidance for ${uid} on ${date}.`);
    }

    // 4. Generate new with Cooldown Lock
    if (lastGenTime && now - lastGenTime < COOLDOWN_MS) {
      console.log(`[GENERATION SKIPPED] Cooldown protection active for ${uid}.`);
      if (existing) return existing;
    }

    activeGenerations.set(uid, now);
    try {
      console.log(`[GENERATION STARTED] Triggering Gemini for ${uid}`);
      const guidance = await this.generateDailyGuidance(uid, date, context);

      // Attach hashes and required fields
      guidance.blueprintHash = bpHash;
      guidance.memoryHash = memHash;
      guidance.localDate = date;
      guidance.content = guidance.soulReflectionText || guidance.dailyNoteText || "";
      guidance.status = "success";
      guidance.fallbackUsed = false;
      guidance.model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

      // Save to Firestore
      await dailyGuidanceRepository.saveDailyGuidance(guidance).catch(e => console.error("[GUIDANCE WRITE ERROR]", e));

      return guidance;
    } catch (error) {
      console.error("[AI FAILED] Using fallback logic.", error);
      const is429 = String(error).includes("429") || String(error).includes("quota") || String(error).includes("exhausted");
      if (is429) console.log(`[429 HANDLED] Gemini quota reached for ${uid}, seeking recent successful guidance.`);

      const lastValid = recent.find(g => g.source === "ai" || g.source === "fallback" || g.source === "local-fallback");
      const previousGuidanceDate = lastValid?.localDateKey || lastValid?.date;
      const fallbackReason = is429 ? "gemini_quota_reached" : "gemini_generation_failed";

      console.log(`[FALLBACK USED] Generating fresh local deterministic fallback for ${uid}.`);
      const fallback = this.generateFallbackDailyGuidance(uid, date, {
        ...context,
        date,
        localDateKey: date,
        // Previous guidance is context for variation and anti-repetition only.
        previousGuidance: recent,
      }) as DailyGuidance & {
        fallbackReason: string;
        generatedForDate: string;
        previousGuidanceDate?: string;
      };
      fallback.blueprintHash = bpHash;
      fallback.memoryHash = memHash;
      fallback.localDate = date;
      fallback.content = fallback.soulReflectionText || fallback.dailyNoteText || "";
      fallback.status = "fallback";
      fallback.fallbackUsed = true;
      fallback.fallbackReason = fallbackReason;
      fallback.generatedForDate = date;
      fallback.previousGuidanceDate = previousGuidanceDate;
      fallback.note = "Refleksi sedang dipersiapkan. Bhumi sedang membaca perjalananmu dengan lebih lembut.";

      if (process.env.NODE_ENV !== "production") {
        console.log("[DAILY_GUIDANCE_FALLBACK_FRESH]", {
          todayDate: date,
          previousGuidanceDate,
          fallbackReason,
        });
      }

      await dailyGuidanceRepository.saveDailyGuidance(fallback).catch(() => {});
      return fallback;
    } finally {
      // Release lock after cooldown
      setTimeout(() => activeGenerations.delete(uid), COOLDOWN_MS);
    }
  },

  async regenerateTodayGuidance(
    uid: string,
    date: string,
    context: DailyGuidanceContext
  ): Promise<DailyGuidance> {
    const guidance = await this.generateDailyGuidance(uid, date, context);
    await dailyGuidanceRepository.saveDailyGuidance(guidance);
    return guidance;
  },

  /**
   * Generates new daily guidance using AI with fallback logic.
   */
  async generateDailyGuidance(
    uid: string,
    date: string,
    context: DailyGuidanceContext
  ): Promise<DailyGuidance> {
    const { profile, blueprint, language } = context;

    // BUILD 31.3 Evolution: Fetching history if missing from client (limited to recent 15 for prompt context)
    const journalHistory = (context.previousJournalEntries && context.previousJournalEntries.length > 0)
      ? context.previousJournalEntries
      : await journalRepository.getJournalEntries(uid, 15).catch(() => []);

    const meditationHistory = (context.previousMeditationEntries && context.previousMeditationEntries.length > 0)
      ? context.previousMeditationEntries
      : await meditationRepository.getMeditationEntries(uid, 15).catch(() => []);

    const audioHistory = (context.previousAudioHealingEntries && context.previousAudioHealingEntries.length > 0)
      ? context.previousAudioHealingEntries
      : await audioHealingRepository.getAudioHealingEntries(uid, 15).catch(() => []);

    const activityHistory = (context.activityHistory && Array.isArray(context.activityHistory) && context.activityHistory.length > 0)
      ? context.activityHistory
      : await activityRepository.getRecentActivities(uid, 15).catch(() => []);

    // Build the input for the AI orchestrator
    let recentGuidance: DailyGuidance[] = [];
    try {
      recentGuidance = await dailyGuidanceRepository.getRecentGuidance(uid, 7);
    } catch (error) {
      console.error("[GUIDANCE RECENT LOAD ERROR]");
    }
    const previousGuidance = recentGuidance.filter((guidance) => guidance.date < date);
    const adaptiveContext = buildAdaptiveDailyGuidanceContext({
      uid,
      date,
      journalEntries: journalHistory.map((entry) => ({ ...entry })),
      meditationEntries: meditationHistory,
      audioHealingEntries: audioHistory,
      previousGuidance,
    });

    // BUILD 31.3: Integration of Weekly Reflections for Sprint 1 Evolution
    let recentWeeklyReflections: any[] = [];
    try {
      recentWeeklyReflections = await reflectionRepository.getRecentWeeklyReflections(uid, 2);
    } catch (e) {
      console.warn("[SPRINT 1] Weekly reflection load failed.");
    }

    const previousProgressSummary = adaptiveContext.previousProgressSummary;
    const natalChart = ((blueprint as any)?.natalChart ?? (blueprint as any)?.astrology ?? null) as Record<string, unknown> | null;
    const natalHouses = context.natalHouses ?? (natalChart as any)?.houses ?? null;
    const { houseData, activations: astroHouseActivations } = buildAstroHouseActivations({
      uid,
      currentSky: context.currentSky,
      natalChart,
      natalHouses,
    });

    const input: DailyGuidanceInput = {
      user: profileToDashboardUser(profile as any),
      identity: profileToCoreIdentity(profile as any, blueprint as any),
      blueprint: blueprint as unknown as Blueprint,
      emotionalState: (profile as any)?.emotionalState || { currentMood: 5, recurringThemes: [] },
      emotionalMemory: (profile as any)?.emotionalMemory || { recurringThemes: [], recurringWounds: [] },
      healingProgress: (profile as any)?.healingProgress || { healingStreak: 0 },
      astrologyTransits: context.astrologyToday ? { summary: context.astrologyToday, activeTransits: [], source: "manual", generatedAt: new Date().toISOString() } : null,
      currentSky: context.currentSky ?? null,
      houseData: houseData as unknown as Record<string, unknown>,
      astroHouseActivations: astroHouseActivations as unknown as Array<Record<string, unknown>>,
      natalHouses,
      journalHistory: journalHistory.map((entry) => ({ ...entry })),
      meditationHistory: meditationHistory,
      audioHealingHistory: audioHistory,
      activityHistory: activityHistory.map((entry) => ({ ...entry })),
      momentumState: context.momentumState ?? null,
      healingMemory: context.healingMemory ?? null,
      weeklyReflections: recentWeeklyReflections,
      adaptiveContext,
      previousGuidance: previousGuidance[0] || null,
      language: language || "id",
      generatedAt: new Date().toISOString(),
    };

    try {
      const prompt = buildDailyGuidancePrompt(input);
      const aiOutput = await generateGeminiJson<DailyGuidanceOutput>(prompt);

      let guidance = this.mapOutputToDailyGuidance(uid, date, { ...context, previousGuidance, houseData: houseData as unknown as Record<string, unknown>, astroHouseActivations: astroHouseActivations as unknown as Array<Record<string, unknown>>, natalHouses }, aiOutput, "ai", adaptiveContext);
      guidance.previousProgressSummary = previousProgressSummary;
      guidance.promptContextLength = prompt.length;

      return guidance;
    } catch (error) {
      console.error("AI Daily Guidance generation failed, using fallback:", error);
      const fallback = this.generateFallbackDailyGuidance(uid, date, { ...context, previousGuidance, houseData: houseData as unknown as Record<string, unknown>, astroHouseActivations: astroHouseActivations as unknown as Array<Record<string, unknown>>, natalHouses }, adaptiveContext);
      fallback.previousProgressSummary = previousProgressSummary;
      return fallback;
    }
  },

  /**
   * Deterministic fallback if AI fails.
   */
  generateFallbackDailyGuidance(
    uid: string,
    date: string,
    context: DailyGuidanceContext,
    adaptiveContext = buildAdaptiveDailyGuidanceContext({
      uid,
      date,
      journalEntries: context.previousJournalEntries,
      meditationEntries: context.previousMeditationEntries,
      audioHealingEntries: context.previousAudioHealingEntries,
      previousGuidance: context.previousGuidance,
    }),
  ): DailyGuidance {
    const { profile, blueprint, language } = context;
    const isId = language === "id";
    const synthesis = buildUnifiedBlueprintSynthesis({
      language: language || "id",
      profile,
      blueprint,
      astrologyToday: context.astrologyToday,
      adaptiveContext,
    });

    const name = (profile as any)?.fullName || (profile as any)?.name || "Jiwa";
    const variationNumber = simpleHash(adaptiveContext.dailyVariationSeed);
    const restart = adaptiveContext.completionRateYesterday === 0;
    const strongCompletion = adaptiveContext.completionRateYesterday >= 80;
    const focusOptions = !isId
      ? ["returning gently", "embodied clarity", "small consistent action", "emotional honesty"]
      : ["mulai lagi dengan lembut", "kejernihan tubuh", "aksi kecil yang konsisten", "kejujuran emosi"];
    const dailyFocus = focusOptions[variationNumber % focusOptions.length];

    const aiInsight = !isId
      ? `${name}, today invites ${dailyFocus}. ${restart ? "If yesterday was empty, this is not failure; it is a clean restart." : strongCompletion ? "Yesterday\u0027s strong completion deserves appreciation before you reach for the next edge." : "Let yesterday\u0027s rhythm inform one grounded step."} ${synthesis.blueprintSummary}`
      : `${name}, hari ini mengajakmu pada ${dailyFocus}. ${restart ? "Jika kemarin kosong, ini bukan kegagalan; ini awal ulang yang lembut." : strongCompletion ? "Ritme kuat kemarin layak diapresiasi sebelum kamu masuk ke tepi pertumbuhan berikutnya." : "Biarkan ritme kemarin menjadi informasi untuk satu langkah yang membumi."} ${synthesis.blueprintSummary}`;
    const companionReflection = this.generateFallbackCompanionReflection({
      language: language || "id",
      name,
      traits: {
        lifePath: (blueprint as any)?.lifePath?.number,
        humanDesignType: getCanonicalHumanDesignType((blueprint as any)?.humanDesign) || undefined,
        arcana: (blueprint as any)?.destinyMatrix?.center,
      },
      sky: context.currentSky,
      astrologyToday: context.astrologyToday,
      blueprintSummary: synthesis.blueprintSummary,
      astroHouseActivations: context.astroHouseActivations,
      journalEntries: context.previousJournalEntries,
      meditationEntries: context.previousMeditationEntries,
      audioHealingEntries: context.previousAudioHealingEntries,
      adaptiveContext,
      momentumState: context.momentumState,
      healingMemory: context.healingMemory,
    });
    const soulReflectionText = this.generateFallbackSoulReflection(
      language || "id",
      date,
      uid,
      {
        name,
        lifePath: (blueprint as any)?.lifePath?.number,
        humanDesignType: getCanonicalHumanDesignType((blueprint as any)?.humanDesign) || undefined,
        humanDesignProfile: getCanonicalHumanDesign((blueprint as any)?.humanDesign)?.profile || undefined,
        arcana: (blueprint as any)?.destinyMatrix?.center,
        sunSign: (blueprint as any)?.astrology?.sunSign,
        moonSign: (blueprint as any)?.astrology?.moonSign,
      }
    );

    const dailyNoteText = this.generateFallbackDailyNote(synthesis, context, name);

    const practices: DailyGuidancePractice[] = generateAdaptiveDailyPractices({
      date,
      language: language || "id",
      profile,
      blueprint,
      astrologyToday: context.astrologyToday,
      adaptiveContext,
      previousGuidance: context.previousGuidance,
    });

    return {
      uid,
      date,
      localDateKey: date,
      schemaVersion: DAILY_GUIDANCE_SCHEMA_VERSION,
      generatedWithPromptVersion: DAILY_GUIDANCE_PROMPT_VERSION,
      dailyVariationSeed: adaptiveContext.dailyVariationSeed,
      generatedAt: new Date().toISOString(),
      profileSnapshot: profile,
      blueprintSnapshot: blueprint,
      astrologyToday: context.astrologyToday || (isId ? "Bintang-bintang mendukung perjalananmu." : "Stars support your journey."),
      previousProgressSummary: adaptiveContext.previousProgressSummary,
      completionRateYesterday: adaptiveContext.completionRateYesterday,
      journalCompletedYesterday: adaptiveContext.journalCompletedYesterday,
      meditationCompletedYesterday: adaptiveContext.meditationCompletedYesterday,
      audioCompletedYesterday: adaptiveContext.audioCompletedYesterday,
      practiceCompletedCountYesterday: adaptiveContext.practiceCompletedCountYesterday,
      streakDays: adaptiveContext.streakDays,
      adaptiveTone: adaptiveContext.adaptiveTone,
      blueprintSummary: synthesis.blueprintSummary,

      categories: {
        general: {
          insight: !isId ? "Steady energy for reflection." : "Energi yang stabil untuk refleksi.",
          reason: !isId ? "Based on current Sun and Moon alignment." : "Berdasarkan posisi Matahari dan Bulan hari ini yang selaras dengan jalurnya.",
          reflection: !isId ? "What are you grateful for?" : "Apa satu hal yang kamu syukuri dari dirimu hari ini?",
          advice: !isId ? "Stay grounded." : "Ambil waktu sejenak untuk menjejak bumi. Biarkan dirimu merasakan ketenangan."
        }
      } as any,

      soulReflectionText,
      dailyNoteText,
      manifestation: generateLocalManifestation({
        user: profileToDashboardUser(profile as any),
        identity: profileToCoreIdentity(profile as any, blueprint as any),
        blueprint: blueprint as unknown as Blueprint,
        emotionalState: (profile as any)?.emotionalState || { currentMood: 5, recurringThemes: [] },
        emotionalMemory: (profile as any)?.emotionalMemory || { recurringThemes: [], recurringWounds: [] },
        healingProgress: (profile as any)?.healingProgress || { healingStreak: 0 },
        astrologyTransits: context.astrologyToday ? { summary: context.astrologyToday, activeTransits: [], source: "manual", generatedAt: new Date().toISOString() } : null,
        language: language || "id",
        generatedAt: new Date().toISOString(),
        adaptiveContext,
      } as unknown as DailyGuidanceInput, "ai_missing"),
      innerworkRecommendations: innerworkIntelligence.getRecommendations({
        activations: (context.astroHouseActivations as AstroHouseActivation[]) || [],
        hdType: getCanonicalHumanDesignType((context.blueprint as any)?.humanDesign) || "",
        lifePath: Number((context.blueprint as any)?.lifePath?.number || 0),
        arcanaCenter: Number((context.blueprint as any)?.destinyMatrix?.center || 0),
        rawBlueprint: context.blueprint as Record<string, unknown> | null,
        unifiedBlueprint: synthesis,
        activityHistory: context.activityHistory || [],
        localDateKey: date,
        gaiaProfile: ((context.profile as any)?.gaiaProfile || null),
      }),

      houseData: context.houseData ?? null,
      astroHouseActivations: context.astroHouseActivations ?? [],
      companionReflection,
      aiInsight,
      journalPrompt: restart ? (isId ? "Apa yang membuatmu lebih mudah mulai lagi?" : "What makes it easier to restart?") : (isId ? "Apa niat hatimu?" : "What is your heart\u0027s intention?"),
      meditationSuggestion: isId ? "Meditasi napas 5 menit" : "5-minute meditation",
      dailyPractices: practices,
      emotionalFocus: (blueprint as any)?.lifePath?.role || "Keseimbangan",
      spiritualFocus: "Pertumbuhan",
      groundedAction: isId ? "Minum air dan peregangan." : "Drink water and stretch.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: "local-fallback",
    };
  },

  generateFallbackCompanionReflection(input: {
    language: "id" | "en";
    name: string;
    traits: { lifePath?: number; humanDesignType?: string; arcana?: number };
    sky?: Record<string, unknown> | null;
    astrologyToday?: string | null;
    blueprintSummary?: string | null;
    astroHouseActivations?: Array<Record<string, unknown>>;
    journalEntries?: Array<Record<string, unknown>>;
    meditationEntries?: Array<Record<string, unknown>>;
    audioHealingEntries?: Array<Record<string, unknown>>;
    adaptiveContext: ReturnType<typeof buildAdaptiveDailyGuidanceContext>;
    momentumState?: Record<string, unknown> | null;
    healingMemory?: Record<string, unknown> | null;
  }) {
    const isId = input.language === "id";
    const firstName = input.name.split(" ")[0] || (isId ? "kamu" : "friend");
    const completionLine = input.adaptiveContext.completionRateYesterday === 0
      ? (isId ? "Cukup mulai dari satu kepulangan kecil yang jujur." : "Begin with one honest small return.")
      : (isId ? "Lanjutkan ritme yang sudah ada." : "Continue the existing rhythm.");

    return {
      preview: `${firstName}, ${completionLine}...`,
      fullReflection: `${firstName}, ${completionLine}\n\nBiarkan hari ini tetap praktis.`,
    };
  },

  generateFallbackDailyNote(synthesis: any, context: any, userName: string): string {
    return buildPersonalDailyNote({
      synthesis,
      context,
      userName,
      dateSeed: safeText(context.localDateKey || context.date || context.generatedAt).slice(0, 10),
    });
  },

  generateFallbackSoulReflection(
    language: "id" | "en",
    date: string,
    uid: string,
    traits: { name?: string; lifePath?: number; humanDesignType?: string; humanDesignProfile?: string; arcana?: number; sunSign?: string; moonSign?: string }
  ): string {
    const isId = language === "id";
    const firstName = (traits.name || "").trim().split(/\s+/)[0] || (isId ? "kamu" : "friend");
    const archetypes = getArchetypes(traits.lifePath || null, traits.arcana ? String(traits.arcana) : null, traits.humanDesignType || null);
    const dominantArchetype = archetypes[0] || (isId ? "Jiwa" : "Soul");
    const seed = simpleHash([uid, date, firstName, traits.lifePath, traits.humanDesignType].join("|"));

    const mirrorInsights = isId
      ? [
          `${firstName}, sebagai seorang ${dominantArchetype}, intimu adalah tentang membangun fondasi yang jujur.`,
          `${firstName}, energi ${dominantArchetype} dalam dirimu mengingatkan bahwa kamu memiliki otoritas penuh.`,
          `${firstName}, sebagai ${dominantArchetype}, kamu dirancang untuk bergerak dengan ritme yang spesifik.`,
        ]
      : [
          `${firstName}, as a ${dominantArchetype}, your core is about building an honest foundation.`,
          `${firstName}, the ${dominantArchetype} energy within you reminds you that you have full authority.`,
          `${firstName}, as a ${dominantArchetype}, you are designed to move with a specific rhythm.`,
        ];

    return mirrorInsights[seed % mirrorInsights.length];
  },

  normalizeSoulReflection(text: string | undefined, language: "id" | "en", date: string, uid: string, traits: { name?: string; lifePath?: number; humanDesignType?: string; humanDesignProfile?: string; arcana?: number; sunSign?: string; moonSign?: string }): string {
    const fallback = this.generateFallbackSoulReflection(language, date, uid, traits);
    const value = text?.replace(/\s+/g, " ").trim();
    if (!value) return fallback;
    if (value.length <= 320) return value;
    const sentences = value.match(/[^.!?]+[.!?]+/g) ?? [value];
    return sentences.slice(0, 4).join(" ").trim().slice(0, 320);
  },

  /**
   * Helper to map AI output to the DailyGuidance structure.
   */
  mapOutputToDailyGuidance(
    uid: string,
    date: string,
    context: DailyGuidanceContext,
    output: DailyGuidanceOutput,
    source: "ai" | "fallback" | "local-fallback",
    adaptiveContext = buildAdaptiveDailyGuidanceContext({
      uid,
      date,
      journalEntries: context.previousJournalEntries,
      meditationEntries: context.previousMeditationEntries,
      audioHealingEntries: context.previousAudioHealingEntries,
      previousGuidance: context.previousGuidance,
    }),
  ): DailyGuidance {
    const synthesis = buildUnifiedBlueprintSynthesis({
      language: context.language || "id",
      profile: context.profile,
      blueprint: context.blueprint,
      astrologyToday: context.astrologyToday,
      adaptiveContext,
    });

    return {
      uid,
      date,
      localDateKey: date,
      schemaVersion: DAILY_GUIDANCE_SCHEMA_VERSION,
      generatedWithPromptVersion: DAILY_GUIDANCE_PROMPT_VERSION,
      dailyVariationSeed: adaptiveContext.dailyVariationSeed,
      generatedAt: new Date().toISOString(),
      profileSnapshot: context.profile,
      blueprintSnapshot: context.blueprint,
      astrologyToday: (output.astroEnergy?.currentEnergy || "Cosmic") + ": " + (output.astroEnergy?.description || "In flux"),
      previousProgressSummary: adaptiveContext.previousProgressSummary,
      completionRateYesterday: adaptiveContext.completionRateYesterday,
      journalCompletedYesterday: adaptiveContext.journalCompletedYesterday,
      meditationCompletedYesterday: adaptiveContext.meditationCompletedYesterday,
      audioCompletedYesterday: adaptiveContext.audioCompletedYesterday,
      practiceCompletedCountYesterday: adaptiveContext.practiceCompletedCountYesterday,
      streakDays: adaptiveContext.streakDays,
      adaptiveTone: adaptiveContext.adaptiveTone,
      blueprintSummary: output.blueprintSummary || synthesis.blueprintSummary,
      categories: output.categories,
      manifestation: output.manifestation || generateLocalManifestation({
        user: profileToDashboardUser(context.profile as any),
        identity: profileToCoreIdentity(context.profile as any, context.blueprint as any),
        blueprint: context.blueprint as unknown as Blueprint,
        emotionalState: (context.profile as any)?.emotionalState || { currentMood: 5, recurringThemes: [] },
        emotionalMemory: (context.profile as any)?.emotionalMemory || { recurringThemes: [], recurringWounds: [] },
        healingProgress: (context.profile as any)?.healingProgress || { healingStreak: 0 },
        astrologyTransits: context.astrologyToday ? { summary: context.astrologyToday, activeTransits: [], source: "manual", generatedAt: new Date().toISOString() } : null,
        language: context.language || "id",
        generatedAt: new Date().toISOString(),
        adaptiveContext,
      } as unknown as DailyGuidanceInput, "partial_json"),
      innerworkRecommendations: innerworkIntelligence.getRecommendations({
        activations: (context.astroHouseActivations as AstroHouseActivation[]) || [],
        hdType: getCanonicalHumanDesignType((context.blueprint as any)?.humanDesign) || "",
        lifePath: Number((context.blueprint as any)?.lifePath?.number || 0),
        arcanaCenter: Number((context.blueprint as any)?.destinyMatrix?.center || 0),
        rawBlueprint: context.blueprint as Record<string, unknown> | null,
        unifiedBlueprint: synthesis,
        activityHistory: context.activityHistory || [],
        localDateKey: date,
        gaiaProfile: ((context.profile as any)?.gaiaProfile || null),
      }),
      soulReflectionText: output.soulReflectionText || output.soulReflection?.dailyMessage || "",
      dailyNoteText: output.dailyNoteText || output.companionReflection?.preview || "",
      houseData: context.houseData ?? null,
      astroHouseActivations: context.astroHouseActivations ?? [],
      companionReflection: output.companionReflection || { preview: "", fullReflection: "" },
      aiInsight: output.companionReflection?.preview ?? output.soulReflection?.dailyMessage ?? synthesis.blueprintSummary,
      journalPrompt: output.journalingPrompt?.prompt || "Apa niatmu hari ini?",
      meditationSuggestion: output.meditationRecommendation?.title || "Meditasi napas",
      audioHealingSuggestion: output.healingAudio?.title,
      dailyPractices: (output.dailyInnerwork?.tasks || []).map((t: any) => ({
        id: t.id,
        category: t.category,
        title: t.task,
        description: t.instruction,
        estimatedMinutes: t.duration,
        completed: t.completed,
      })),
      emotionalFocus: output.soulReflection?.theme || "Growth",
      spiritualFocus: output.dailyInnerwork?.theme || "Balance",
      groundedAction: output.soulReflection?.guidance || "Breathe",
      innerworkNarrative: output.innerworkNarrative,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source,
    };
  }
};
