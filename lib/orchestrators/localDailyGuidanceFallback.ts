import type { DailyGuidanceInput, DailyGuidanceOutput } from "@/lib/orchestrators/types";
import { buildUnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";
import { seededIndex } from "@/lib/dailyGuidance/dailyContentKey";
import { refreshDailyCompanionCategories } from "@/lib/dailyGuidance/mentorAdvice";
import { WellnessMapping } from "@/lib/engines/wellnessMappingEngine";
import { blueprintSynthesisNarrative } from "@/lib/engines/blueprintSynthesisNarrative";
import { calculateHumanDesignStyle } from "@/lib/humandesign/intelligence/styleEngine";
import { careerIntelligenceEngine } from "@/lib/engines/careerIntelligenceEngine";
import { natalIntelligenceEngine } from "@/lib/astrology/natalIntelligence";
import { destinyMatrixV3Engine } from "@/lib/engines/destinyMatrixV3";
import { astroContextEngine } from "@/lib/engines/astroContextEngine";
import { getCanonicalHumanDesign } from "@/lib/humandesign/hdAudit";
import { getTimeOfDayGreeting } from "@/lib/dailyGuidance/timeOfDayGreeting";

function safeString(value: any, fallback: string = ""): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function safeArray<T>(value: any): T[] {
  return Array.isArray(value) ? value : [];
}

function safeObject(value: any): Record<string, any> {
  return (value && typeof value === "object" && !Array.isArray(value)) ? value : {};
}

function slug(value: any): string {
  const str = safeString(value);
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "unknown";
}

function toneFromMood(mood: number): DailyGuidanceOutput["soulReflection"]["emotionalTone"] {
  if (mood <= 3) return "grounding";
  if (mood <= 5) return "gentle";
  if (mood <= 7) return "introspective";
  return "empowering";
}

function intensityFromMood(mood: number): "low" | "medium" | "high" {
  if (mood <= 3) return "high";
  if (mood <= 7) return "medium";
  return "low";
}

function hashSeed(seed: string): number {
  return seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function firstNonEmpty(...values: any[]): string {
  for (const value of values) {
    const text = safeString(value).trim();
    if (text) return text;
  }
  return "";
}

function weekdayName(localDateKey: string, language: "id" | "en"): string {
  const date = new Date(`${localDateKey}T12:00:00`);
  const locale = language === "id" ? "id-ID" : "en-US";
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString(locale, { weekday: "long" })
    : localDateKey;
}

function dayOffset(localDateKey: string): number {
  return Number(localDateKey.replaceAll("-", "")) || 0;
}

function pickDaily<T>(items: T[], seed: string, localDateKey: string, offset = 0): T {
  const index = (seededIndex(seed, items.length, offset) + dayOffset(localDateKey)) % items.length;
  return items[index];
}

function compactBlueprintSignal(value: any): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(compactBlueprintSignal).filter(Boolean).slice(0, 4).join(", ");
  if (typeof value === "object") {
    return firstNonEmpty(value.name, value.label, value.title, value.value, value.description, value.theme)
      || Object.entries(value)
        .filter(([, entryValue]) => compactBlueprintSignal(entryValue))
        .slice(0, 3)
        .map(([key, entryValue]) => `${key}: ${compactBlueprintSignal(entryValue)}`)
        .join(", ");
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
    "mental": "kejernihan mental",
  };
  return labels[value.toLowerCase()] || value;
}

function buildPersonalDailyNote(params: {
  synthesis: any;
  context: any;
  userName: string;
  dateSeed: string;
}): string {
  const signals = safeObject(params.synthesis?.identitySignals);
  const fullBlueprint = safeObject(params.synthesis?.fullBlueprint);
  const blueprint = safeObject(params.context?.blueprint);
  const adaptive = safeObject(params.context?.adaptiveContext);
  const astrology = safeObject(blueprint.astrology || blueprint.natalChart);
  const humanDesign = safeObject(getCanonicalHumanDesign(blueprint.humanDesign));
  const destinyMatrix = safeObject(blueprint.destinyMatrix);
  const activeTransits = safeArray<any>(params.context?.astrologyTransits?.activeTransits);
  const bodies = safeArray<any>(params.context?.currentSky?.bodies);
  const seed = hashSeed([
    params.dateSeed,
    params.userName,
    signals.lifePath,
    signals.humanDesignType,
    signals.arcanaCenter,
    signals.sunSign,
    signals.moonSign,
  ].map((value) => safeString(value)).join("|"));

  const weekday = new Date(`${params.dateSeed}T12:00:00`).getDay();
  const wName = weekdayName(params.dateSeed, params.synthesis.language || "id");

  const preferredBodies = ["Mercury", "Venus", "Mars", "Moon", "Saturn", "Jupiter", "Pluto", "Sun"];
  const bodyFromSky = preferredBodies
    .map((name) => bodies.find((body) => safeString(body.body || body.name || body.planet).toLowerCase() === name.toLowerCase()))
    .find(Boolean);
  const transit = activeTransits[seed % Math.max(activeTransits.length, 1)] || bodyFromSky || {};
  const planet = localizeDailyNoteLabel(firstNonEmpty(transit.planet, transit.body, transit.name, "Merkurius"));
  const sign = firstNonEmpty(transit.sign, transit.zodiacSign, params.context?.currentSky?.moonSign, "tema analitis");
  const transitSummary = firstNonEmpty(
    params.context?.astrologyTransits?.summary,
    params.context?.astrologyToday,
    safeArray<any>(transit.themes).join(", "),
    "fokus mental, keputusan kecil, dan caramu mengatur respons harian"
  );

  const lifePath = firstNonEmpty(signals.lifePath, blueprint.lifePath?.number);
  const humanDesignType = firstNonEmpty(signals.humanDesignType, humanDesign.type);
  const strategy = localizeDailyNoteLabel(firstNonEmpty(signals.strategy, humanDesign.strategy));
  const authority = localizeDailyNoteLabel(firstNonEmpty(signals.authority, humanDesign.authority));
  const arcanaCenter = firstNonEmpty(signals.arcanaCenter, destinyMatrix.center);
  const sunSign = firstNonEmpty(signals.sunSign, astrology.sunSign);
  const moonSign = firstNonEmpty(signals.moonSign, astrology.moonSign);
  const ascendant = firstNonEmpty(signals.ascendant, astrology.ascendant);

  // Journey Context
  const completionYesterday = adaptive.completionRateYesterday || 0;
  const isId = params.synthesis.language !== "en";

  let activityNote = "";
  if (completionYesterday >= 80) {
      activityNote = isId ? `Keberhasilanmu menyelesaikan praktik kemarin membawa momentum segar untuk hari ${wName} ini.` : `Your successful completion yesterday brings fresh momentum for this ${wName}.`;
  } else if (completionYesterday === 0) {
      activityNote = isId ? `Hari ${wName} ini adalah kesempatan baru untuk mulai kembali dengan ritme yang lebih ramah.` : `This ${wName} is a new chance to restart with a kinder rhythm.`;
  }

  const lifePathThemes: Record<string, string> = {
    "1": "memulai dengan keputusan yang mandiri",
    "2": "menjaga harmoni tanpa menghilangkan kebutuhanmu sendiri",
    "3": "mengubah rasa menjadi ekspresi yang jelas",
    "4": "membangun struktur, ritme, dan konsistensi",
    "5": "mengelola kebebasan supaya tidak berubah menjadi energi tercecer",
    "6": "merawat orang lain tanpa kehilangan pusat dirimu",
    "7": "membaca makna sebelum mengambil kesimpulan",
    "8": "memakai daya dan kendali dengan lebih bersih",
    "9": "melepaskan pola lama dengan kedewasaan",
    "11": "menurunkan intuisi menjadi langkah yang bisa dijalankan",
    "22": "menjaga visi besar lewat fondasi kecil yang stabil",
    "33": "melayani dengan hati tanpa memikul semuanya",
  };
  const humanDesignThemes: Record<string, string> = {
    generator: "tubuhmu perlu merasa punya respons yang nyata sebelum menambah beban",
    "manifesting generator": "energi cepatmu tetap butuh jeda agar tidak meloncat ke terlalu banyak arah",
    projector: "perhatianmu lebih tajam ketika kamu memilih tempat yang benar-benar layak menerima energimu",
    manifestor: "dorongan memulai akan terasa lebih bersih ketika kamu menyampaikan arah tanpa harus membela diri",
    reflector: "kejernihanmu sangat dipengaruhi lingkungan, ritme, dan siapa yang sedang kamu serap hari ini",
  };
  const arcanaThemes: Record<string, string> = {
    "4": "disiplin yang tidak kaku",
    "6": "pilihan relasi yang lebih sadar",
    "8": "kekuatan batin, batas, dan keberanian mengatur ulang kendali",
    "9": "kebijaksanaan, penyelesaian, dan keberanian menutup siklus lama",
    "11": "kepekaan yang perlu diterjemahkan menjadi tindakan sederhana",
    "12": "melihat dari sudut pandang baru sebelum bereaksi",
  };

  const lpTheme = lifePathThemes[lifePath] || "mengenali pola yang membuat hidupmu lebih stabil";
  const hdTheme = humanDesignThemes[humanDesignType.toLowerCase()] || "cara tubuhmu mengambil keputusan perlu dihormati sebelum pikiran mempercepat cerita";
  const arcanaTheme = arcanaThemes[arcanaCenter] || "pusat energimu sedang diminta bekerja lebih sadar";
  const natalLine = [
    sunSign && `Matahari ${sunSign}`,
    moonSign && `Bulan ${moonSign}`,
    ascendant && `Ascendant ${ascendant}`,
  ].filter(Boolean).join(", ");

  const transitText = `${planet} ${sign} ${transitSummary}`.toLowerCase();
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

  const questionByTransit: Record<string, string> = {
    clarity: "Hal apa yang sebenarnya sudah jelas, tetapi masih kutunda karena takut harus mengubah cara bergerakku?",
    structure: "Fondasi kecil apa yang perlu kubereskan agar energiku tidak terus bocor ke hal yang berserakan?",
    relationship: "Di percakapan mana aku perlu lebih jujur tanpa kehilangan kelembutan?",
    action: "Langkah mana yang benar-benar mendapat respons dari tubuhmu, dan mana yang hanya lahir dari terburu-buru?",
    emotion: "Rasa apa yang sedang meminta didengar sebelum aku mengambil keputusan hari ini?",
    release: "Apa yang bisa kulepaskan hari ini supaya ruang batinku terasa lebih ringan dan jernih?",
  };
  const natalPhrase = natalLine
    ? `Dengan warna dasar batinmu, dorongan ini menyentuh cara alamimu mencari aman, membaca detail, dan menjaga ritme yang bisa dipercaya.`
    : "Dorongan ini menyentuh cara alamimu mencari aman, membaca situasi, dan menjaga ritme yang bisa dipercaya.";

  const hdStyle = calculateHumanDesignStyle(params.synthesis.fullBlueprint as any);
  const career = careerIntelligenceEngine.calculateCareer(params.synthesis.fullBlueprint as any);
  const natal = natalIntelligenceEngine.calculateIntelligence(params.synthesis.fullBlueprint as any);
  const dmV3 = destinyMatrixV3Engine.calculateIntelligence({
    destinyMatrix: params.synthesis.fullBlueprint.destinyMatrix,
    input: params.synthesis.fullBlueprint.lifePath
  } as any);
  const integrated = blueprintSynthesisNarrative.generateIdentityNarrative(params.synthesis, hdStyle, career, natal, dmV3, params.synthesis.language || "id");
  const astroContext = astroContextEngine.synthesize(params.synthesis, params.context.astrologyTransits, integrated, params.synthesis.language || "id");

  return [
    `Tema saat ini: ${astroContext.timingTheme}. ${astroContext.timingInsight} ${activityNote}`,
    `Langkah alamimu berkembang lewat ${lpTheme}; energimu juga lebih selaras ketika ${hdTheme}. Di saat yang sama, ada ruang untuk menyapa sisi dirimu yang ingin merawat ${arcanaTheme} dengan lebih lembut.`,
    `Fokus harian:\n${astroContext.timingFocus}`,
    `Pertanyaan refleksi:\n${questionByTransit[dominantTheme]}`,
    isId ? `Insight Gaya Hidup:\n${integrated.lifestyleAdvice}` : `Lifestyle Insight:\n${integrated.lifestyleAdvice}`
  ].join("\n\n");
}

function generateSoulReflection(synthesis: any, userName: string, seedSource: string = "", wellnessMapping?: WellnessMapping | null, astrologyTransits?: any): string {
  const signals = safeObject(synthesis?.identitySignals);
  const fullBlueprint = safeObject(synthesis?.fullBlueprint);
  const fullHD = safeObject(fullBlueprint.humanDesign);
  const fullDestiny = safeObject(fullBlueprint.destinyMatrix);
  const fullNatal = safeObject(fullBlueprint.natalChart);

  // Use dateKey from seedSource for weekday deterministic rhythm
  const dateKey = seedSource.split("|").find(s => s.match(/^\d{4}-\d{2}-\d{2}$/)) || new Date().toISOString().slice(0, 10);
  const weekday = new Date(`${dateKey}T12:00:00`).getDay();

  const isId = synthesis.language !== "en";
  const firstName = userName.split(" ")[0] || (isId ? "kamu" : "friend");
  const greeting = getTimeOfDayGreeting(new Date(), isId ? "id" : "en");

  const lp = String(signals.lifePath || "");
  const hd = String(signals.humanDesignType || "");

  // Weekday Themes
  const weekdayThemes: Record<number, { id: string; en: string }> = {
    1: { id: "Niat & Arah", en: "Intention & Direction" },
    2: { id: "Disiplin & Aksi", en: "Discipline & Action" },
    3: { id: "Kejernihan & Pembelajaran", en: "Clarity & Learning" },
    4: { id: "Makna & Kedalaman", en: "Meaning & Depth" },
    5: { id: "Penyelesaian & Refleksi", en: "Completion & Reflection" },
    6: { id: "Pemulihan & Integrasi", en: "Recovery & Integration" },
    0: { id: "Syukur & Keheningan", en: "Gratitude & Silence" }
  };

  const rhythm = weekdayThemes[weekday];
  const rhythmLine = isId
    ? (rhythm.id === "Pemulihan & Integrasi" ? "Jika tubuhmu meminta jeda hari ini, tidak apa-apa mendengarkannya." : "Hari ini ada ruang untuk menyelaraskan kembali apa yang penting bagimu.")
    : (rhythm.en === "Recovery & Integration" ? "If your body asks for a pause today, it is okay to listen." : "Today offers space to realign what matters to you.");

  const openings = isId
    ? [
        `Hai ${firstName}, mari berhenti sejenak dan mendengarkan apa yang sedang bergerak di dalam dirimu.`,
        `${firstName}, mari sejenak menengok ke dalam di hari ${weekdayName(dateKey, "id")} ini.`,
        `${greeting} ${firstName}, hari ini ada ruang untuk berjalan dengan lebih sadar.`,
        `Hai ${firstName}, izinkan jiwamu berbicara pelan hari ini.`,
      ]
    : [
        `Hi ${firstName}, take a moment to listen to what is moving within you.`,
        `${firstName}, let's take a moment to look inward on this ${weekdayName(dateKey, "en")}.`,
        `${greeting} ${firstName}, today offers room to move with greater awareness.`,
        `Hi ${firstName}, allow your soul to speak softly today.`,
      ];

  const opening = pickDaily(openings, `${seedSource}|reflection-opening`, dateKey);

  // Identity Insights (Varied by date seed as well)
  const identityInsights: Record<string, string[]> = {
    "Generator": isId
      ? ["Mulailah dari respons sederhana yang kamu rasakan di tubuh sebelum terburu-buru memberikan tenagamu.", "Pastikan baterai energimu digunakan untuk hal yang kamu cintai secara jujur."]
      : ["Start from the simple responses you feel in your body before rushing to give your energy.", "Ensure your energy is used for what you honestly love."],
    "Projector": isId
      ? ["Kepekaan dirimu akan bekerja dengan lebih tenang ketika kamu tidak memaksa semua hal selesai sekaligus.", "Kelola energimu dengan bijak, luangkan waktu untuk melihat sekeliling dengan jernih."]
      : ["Your inner sensitivity will work more peacefully when you don't force everything to be finished at once.", "Manage your energy wisely, take time to see your surroundings clearly."],
    "Manifestor": isId
      ? ["Dorongan untuk bergerak dari dalam dirimu adalah arah yang nyata; cukup komunikasikan langkahmu dengan lembut.", "Doronganmu untuk memulai adalah kekuatan besar yang bisa disalurkan pelan-pelan."]
      : ["The urge to move from within is a real direction; simply communicate your steps gently.", "Your urge to initiate is a great strength that can be channeled slowly."],
  };

  const defaultInsight = isId
    ? ["Mungkin ada bagian dirimu yang sedang bertumbuh pelan-pelan."]
    : ["Perhaps there is a part of you growing slowly right now."];

  const hdInsight = pickDaily(identityInsights[hd] || defaultInsight, `${seedSource}|hd-insight`, dateKey);

  const reflections: Record<number, string[]> = {
    1: isId
      ? ["Niat mana yang paling membuat hatimu hidup?", "Apa satu hal kecil yang ingin kamu mulai hari ini?"]
      : ["Which intention makes your heart most alive?", "What is one small thing you want to start today?"],
    5: isId
      ? ["Lingkaran mana yang sudah siap kamu tutup?", "Hargai setiap usaha yang sudah kamu lakukan sepekan ini."]
      : ["Which loop are you ready to close?", "Value every effort you've made this week."],
  };

  const dailyReflection = pickDaily(reflections[weekday] || (isId ? ["Hadir dan rasakan keadaanmu hari ini dengan ramah."] : ["Be present and welcome your state today with gentleness."]), `${seedSource}|daily-reflection`, dateKey);

  // BUILD 40B/40C: Deep Synthesis Integration
  const hdStyle = calculateHumanDesignStyle(synthesis.fullBlueprint as any);
  const career = careerIntelligenceEngine.calculateCareer(synthesis.fullBlueprint as any);
  const natal = natalIntelligenceEngine.calculateIntelligence(synthesis.fullBlueprint as any);
  const dmV3 = destinyMatrixV3Engine.calculateIntelligence({
    destinyMatrix: synthesis.fullBlueprint.destinyMatrix,
    input: synthesis.fullBlueprint.lifePath
  } as any);

  const integrated = blueprintSynthesisNarrative.generateIdentityNarrative(synthesis, hdStyle, career, natal, dmV3, synthesis.language || "id");
  const astroContext = astroContextEngine.synthesize(synthesis, astrologyTransits, integrated, synthesis.language || "id");

  return [
    opening,
    `"${hdInsight}"`,
    rhythmLine,
    astroContext.timingInsight,
    integrated.coreNarrative,
    dailyReflection,
    wellnessMapping?.results?.[0] ? (isId ? "Luangkan sedikit waktu untuk menemani apa yang sedang bergerak di dalam perasaanmu hari ini." : "Take a moment to simply accompany whatever is moving through your feelings today.") : ""
  ].filter(Boolean).join("\n\n");
}

function generateDailyNote(synthesis: any, input: any, userName: string): string {
  return buildPersonalDailyNote({
    synthesis,
    context: input,
    userName,
    dateSeed: safeString(input.adaptiveContext?.dailyVariationSeed) || safeString(input.generatedAt).slice(0, 10),
  });
}

export function generateLocalManifestation(input: DailyGuidanceInput, reason: string = "unknown"): DailyGuidanceOutput["manifestation"] {
  const isId = input.language !== "en";
  const mood = Number(input.emotionalState?.currentMood) || 6;
  const lp = String(input.blueprint?.lifePath?.number || "");
  const arcana = String(input.blueprint?.destinyMatrix?.center || "");
  const synthesis = buildUnifiedBlueprintSynthesis({
    language: input.language || "id",
    profile: input.user as unknown as Record<string, unknown>,
    blueprint: input.blueprint as unknown as Record<string, unknown>,
    astrologyToday: input.astrologyTransits?.summary,
    adaptiveContext: input.adaptiveContext,
  });
  const moneyLine = compactBlueprintSignal(synthesis.fullBlueprint.destinyMatrix.moneyLine);
  const loveLine = compactBlueprintSignal(synthesis.fullBlueprint.destinyMatrix.loveLine);
  const venus = safeString(synthesis.fullBlueprint.natalChart.venus);
  const saturn = safeString(synthesis.fullBlueprint.natalChart.saturn);
  const topWellnessTheme = input.wellnessMapping?.results?.[0]?.category;
  const seedSource = safeString(input.adaptiveContext?.dailyVariationSeed) || input.generatedAt.slice(0, 10);

  // Determine Category
  let category = "general";
  if (topWellnessTheme === "BURNOUT") category = "grounding";
  else if (topWellnessTheme === "ANXIETY") category = "grounding";
  else if (topWellnessTheme === "GROWTH_PHASE") category = "expansion";
  else if (mood <= 4) category = "grounding";
  else if (moneyLine || saturn) category = "clarity";
  else if (loveLine || venus) category = "worth";
  else if (["2", "6", "12"].includes(lp) || ["6", "12"].includes(arcana)) category = "worth";
  else if (["1", "7", "11"].includes(lp) || ["7", "11"].includes(arcana)) category = "clarity";
  else if (mood <= 6) category = "processing";
  else if (mood >= 8) category = "expansion";

  const matrix: Record<string, Array<{ affirmation: string; assumption: string; attraction: string }>> = {
    grounding: [
      {
        affirmation: isId ? "Hari ini aku boleh bergerak tanpa memaksa diriku membuktikan apa pun." : "Today I am allowed to move without forcing myself to prove anything.",
        assumption: isId ? "Aku boleh percaya bahwa jeda adalah bagian dari pertumbuhan, bukan tanda tertinggal." : "I choose to believe that a pause is part of growth, not a sign of falling behind.",
        attraction: isId ? "Aku mengundang energi tenang, cukup, dan hadir." : "I invite calm, sufficient, and present energy."
      },
      {
        affirmation: isId ? "Aku menghargai batasan tubuhku sebagai bentuk cinta paling jujur hari ini." : "I respect my body's limits as the most honest form of self-love today.",
        assumption: isId ? "Aku percaya bahwa merasa cukup adalah kunci untuk memulai kembali dengan bersih." : "I believe that feeling 'enough' is the key to a clean restart.",
        attraction: isId ? "Aku mengundang energi pemulihan, kelembutan, dan kepulangan." : "I invite restorative, gentle, and returning energy."
      }
    ],
    worth: [
      {
        affirmation: isId ? "Nilai diriku tidak bergantung pada seberapa banyak aku dibutuhkan orang lain." : "My worth does not depend on how much I am needed by others.",
        assumption: isId ? "Aku boleh percaya bahwa diterima tidak selalu harus diawali dengan membuktikan diri." : "I can believe that being accepted doesn't always have to start with proving myself.",
        attraction: isId ? "Aku mengundang energi cukup, utuh, dan layak diterima." : "I invite sufficient, whole, and worthy energy."
      },
      {
        affirmation: isId ? "Aku boleh menerima dukungan tanpa harus selalu menjadi yang paling kuat." : "I can receive support without always needing to be the strongest one.",
        assumption: isId ? "Aku percaya bahwa kelembutan juga bagian dari rasa layak." : "I believe tenderness is also part of worthiness.",
        attraction: isId ? "Aku mengundang energi diterima, dirawat, dan tidak tergesa." : "I invite accepted, cared-for, and unhurried energy."
      }
    ],
    clarity: [
      {
        affirmation: isId ? "Aku tidak harus melihat seluruh jalan untuk mengambil satu langkah yang jujur hari ini." : "I don't have to see the whole path to take one honest step today.",
        assumption: isId ? "Aku boleh percaya bahwa kejelasan tumbuh ketika aku hadir pada langkah kecil yang bisa kulakukan." : "I can believe that clarity grows when I am present for the small steps I can take.",
        attraction: isId ? "Aku mengundang energi jernih, sederhana, dan selaras." : "I invite clear, simple, and aligned energy."
      },
      {
        affirmation: isId ? "Aku memilih satu arah kecil yang terasa benar, lalu membiarkan sisanya menunggu." : "I choose one small direction that feels true and let the rest wait.",
        assumption: isId ? "Aku percaya bahwa arah yang jujur tidak perlu dipaksa menjadi sempurna." : "I believe an honest direction does not need to be forced into perfection.",
        attraction: isId ? "Aku mengundang energi fokus, lapang, dan mudah dipraktikkan." : "I invite focused, spacious, and practical energy."
      }
    ],
    processing: [
      {
        affirmation: isId ? "Aku mengizinkan perasaanku hadir tanpa menjadikannya penguasa seluruh hariku." : "I allow my feelings to be present without letting them rule my entire day.",
        assumption: isId ? "Aku boleh percaya bahwa merasakan bukan berarti tenggelam." : "I can believe that feeling does not mean drowning.",
        attraction: isId ? "Aku mengundang energi lembut, stabil, dan memulihkan." : "I invite gentle, stable, and healing energy."
      },
      {
        affirmation: isId ? "Aku bisa mendengar rasaku dengan tenang tanpa harus langsung menyelesaikan semuanya." : "I can listen to my feelings calmly without solving everything at once.",
        assumption: isId ? "Aku percaya bahwa pelan-pelan tetap bisa membawa perubahan yang nyata." : "I believe moving slowly can still create real change.",
        attraction: isId ? "Aku mengundang energi sabar, jujur, dan menenangkan." : "I invite patient, honest, and soothing energy."
      }
    ],
    expansion: [
      {
        affirmation: isId ? "Aku membuka diri pada kemungkinan yang lebih besar dari apa yang bisa kupikirkan hari ini." : "I open myself to possibilities greater than what I can conceive today.",
        assumption: input.language === "en"
          ? "I believe my capacity expands as I grow in the courage to be honest."
          : "Aku percaya bahwa kapasitas diriku berkembang seiring dengan keberanianku untuk jujur.",
        attraction: isId ? "Aku mengundang energi luas, berdaya, dan penuh kemungkinan." : "I invite expansive, empowered, and possibility-filled energy."
      },
      {
        affirmation: isId ? "Aku bertumbuh dengan ritme yang tetap menghormati tubuh dan hatiku." : "I grow at a rhythm that still honors my body and heart.",
        assumption: isId ? "Aku percaya bahwa peluang yang tepat bisa hadir tanpa membuatku meninggalkan diriku." : "I believe the right openings can arrive without making me abandon myself.",
        attraction: isId ? "Aku mengundang energi terbuka, matang, dan membumi." : "I invite open, mature, and grounded energy."
      }
    ],
    general: [
      {
        affirmation: isId ? "Aku memilih bergerak dengan tenang, percaya bahwa langkah kecil hari ini tetap berarti." : "I choose to move calmly, trusting that today's small steps still matter.",
        assumption: isId ? "Aku sudah menjadi pribadi yang lebih sadar dan lebih percaya pada ritme hidupku sendiri." : "I am already a more conscious person, trusting my own life rhythm.",
        attraction: isId ? "Aku mengundang energi selaras, tenang, dan bermakna." : "I invite aligned, calm, and meaningful energy."
      },
      {
        affirmation: isId ? "Aku pulang pada diriku melalui satu pilihan yang sederhana dan jujur." : "I return to myself through one simple and honest choice.",
        assumption: isId ? "Aku percaya bahwa hari ini cukup dimulai dari hal yang paling dekat." : "I believe today can begin with what is nearest.",
        attraction: isId ? "Aku mengundang energi hadir, ringan, dan terarah." : "I invite present, light, and directed energy."
      }
    ]
  };

  const options = matrix[category] || matrix.general;
  const dateKey = safeString(input.adaptiveContext?.dailyVariationSeed).slice(0, 10) || input.generatedAt.slice(0, 10);
  const dayOffset = Number(dateKey.replaceAll("-", "")) || 0;
  const picked = options[(seededIndex(`${category}|${lp}|${arcana}`, options.length) + dayOffset) % options.length];

  return picked;
}

export function generateLocalDailyGuidance(input: DailyGuidanceInput): DailyGuidanceOutput {
  const safeInput = {
    ...input,
    user: safeObject(input?.user),
    identity: safeObject(input?.identity),
    blueprint: safeObject(input?.blueprint),
    emotionalState: safeObject(input?.emotionalState),
    emotionalMemory: safeObject(input?.emotionalMemory),
    healingProgress: safeObject(input?.healingProgress),
    adaptiveContext: safeObject(input?.adaptiveContext),
    language: input?.language || "id",
    generatedAt: input?.generatedAt || new Date().toISOString(),
  };

  let synthesis;
  try {
    synthesis = buildUnifiedBlueprintSynthesis({
      language: safeInput.language,
      profile: safeInput.user as unknown as Record<string, unknown>,
      blueprint: safeInput.blueprint as unknown as Record<string, unknown>,
      astrologyToday: safeInput.astrologyTransits?.summary,
      adaptiveContext: safeInput.adaptiveContext as any,
    });
  } catch (err) {
    synthesis = {
      blueprintSummary: safeInput.language === "en"
        ? "Today is a day for steady progress and gentle self-care."
        : "Hari ini adalah hari untuk kemajuan yang stabil dan perawatan diri yang lembut.",
      coreNeeds: ["presence", "care", "steadiness"],
      practiceThemes: { grounding: "presence", reflection: "clarity", action: "one small step" },
      progressTone: { key: "steady" as const, label: "steady", durationRange: [5, 10] as [number, number], practiceDepth: "steady" as const },
      archetypes: [],
      identitySignals: {
        lifePath: null, arcanaCenter: null, commonEnergy: null, karmicPatterns: [],
        humanDesignType: null, humanDesignProfile: null, authority: null, strategy: null,
        sunSign: null, moonSign: null, ascendant: null
      },
      fullBlueprint: {
        lifePath: { lifePath: null },
        humanDesign: { type: null, strategy: null, authority: null, profile: null },
        destinyMatrix: { arcanaCenter: null, commonEnergy: null, karmicPatterns: [] },
        natalChart: { sun: null, moon: null, ascendant: null },
      },
      differentiators: [],
    };
  }

  try {
    const mood = Number(safeInput.emotionalState.currentMood) || 6;
    const adaptive = safeInput.adaptiveContext;
    const seed = safeString(adaptive?.dailyVariationSeed) || safeInput.generatedAt.slice(0, 10);
    const seedHash = hashSeed(seed);
    const restart = (Number(adaptive?.completionRateYesterday) || 0) === 0;
    const strongCompletion = (Number(adaptive?.completionRateYesterday) || 0) >= 80;

    const identity = safeInput.identity;
    const emotionalMemory = safeInput.emotionalMemory;
    const emotionalState = safeInput.emotionalState;

    const topTheme = safeString(
      (safeArray<any>(emotionalMemory.recurringThemes)[0])?.theme ||
      safeArray<any>(emotionalState.recurringThemes)[0] ||
      identity.lifePathArchetype,
      "Balance"
    );

    const topWound = safeString(
      (safeArray<any>(emotionalMemory.recurringWounds)[0])?.wound ||
      emotionalMemory.nextHealingEdge ||
      identity.arcanaMeaning,
      "the unknown"
    );

    const transit = safeArray<any>(safeInput.astrologyTransits?.activeTransits)[0];
    const transitName = transit
      ? `${safeString(transit.planet)}${transit.sign ? ` in ${safeString(transit.sign)}` : ""}`
      : `${safeString(identity.sunSign, "Cosmic")} integration`;

    const variationThemes = [
      topTheme,
      identity.sunSign,
      identity.lifePathArchetype,
      identity.arcanaMeaning,
    ].filter(t => typeof t === "string" && t.length > 0);

    const transitThemes = safeArray<any>(transit?.themes).length ? safeArray<any>(transit?.themes) : [
      variationThemes[seedHash % variationThemes.length] || topTheme,
      identity.sunSign,
    ].filter(t => typeof t === "string" && t.length > 0);

    if (transitThemes.length === 0) transitThemes.push("Clarity", "Presence");

    const humanDesign = `${safeString(identity.humanDesign)} ${safeString(identity.humanDesignProfile)}`.trim() || "Natural Design";
    const meditationDuration = mood <= 4 ? 8 : 12;
    const innerworkDuration = mood <= 4 ? 10 : 15;
    const totalInnerworkDuration = innerworkDuration + 6 + meditationDuration;

    const userName = safeString(identity.name, "Jiwa");

    const soulReflectionText = generateSoulReflection(synthesis, userName, [
      safeInput.user.id,
      seed,
      safeInput.generatedAt.slice(0, 10),
    ].filter(Boolean).join("|"), safeInput.wellnessMapping, safeInput.astrologyTransits);
    const dailyNoteText = generateDailyNote(synthesis, safeInput, userName);

    return {
      blueprintSummary: synthesis.blueprintSummary,
      soulReflectionText,
      dailyNoteText,

    // V2 Categories Fallback
    categories: refreshDailyCompanionCategories({
        general: {
          insight: safeInput.language === "en" ? "Steady energy for reflection." : "Energi yang stabil untuk refleksi.",
          reason: safeInput.language === "en" ? "Based on current Sun and Moon alignment." : "Berdasarkan posisi Matahari dan Bulan hari ini yang selaras dengan jalurnya.",
          reflection: "", advice: ""
        },
        mental: {
          insight: safeInput.language === "en" ? "Focus on clarity." : "Fokus pada kejernihan.",
          reason: safeInput.language === "en" ? "Mercury's current position supporting your path." : "Posisi Merkurius mendukung jalurmu hari ini untuk melihat segalanya lebih jernih.",
          reflection: "", advice: ""
        },
        finance: {
          insight: safeInput.language === "en" ? "Mindful resource management." : "Kelola sumber daya dengan sadar.",
          reason: "", reflection: "", advice: ""
        },
        love: {
          insight: safeInput.language === "en" ? "Open heart for connection." : "Buka hati untuk koneksi.",
          reason: "", reflection: "", advice: ""
        },
        relational: {
          insight: safeInput.language === "en" ? "Patience in communication." : "Kesabaran dalam komunikasi.",
          reason: "", reflection: "", advice: ""
        },
        spiritual: {
          insight: safeInput.language === "en" ? "Inner silence is accessible." : "Hening batin mudah diakses.",
          reason: "", reflection: "", advice: ""
        },
        challenges: {
          insight: safeInput.language === "en" ? "Potential for rushing." : "Potensi untuk terburu-buru.",
          reason: "", reflection: "", advice: ""
        },
        opportunities: {
          insight: safeInput.language === "en" ? "Openings for growth." : "Terbukanya peluang pertumbuhan.",
          reason: "", reflection: "", advice: ""
        },
        advice: {
          insight: safeInput.language === "en" ? "Integrate today's lesson." : "Integrasikan pelajaran hari ini.",
          reason: "", reflection: "", advice: ""
        }
      }, {
        language: safeInput.language || "id",
        dailyVariationSeed: seed,
        localDateKey: seed.slice(0, 10),
        completionRateYesterday: Number(adaptive?.completionRateYesterday) || 0,
        streakDays: Number(adaptive?.streakDays) || 0,
        practiceCompletedCountYesterday: Number(adaptive?.practiceCompletedCountYesterday) || 0,
        astrologyToday: safeInput.astrologyTransits?.summary,
        wellnessMapping: safeInput.wellnessMapping,
        unifiedBlueprint: synthesis,
      }) as DailyGuidanceOutput["categories"],

      soulReflection: {
        dailyMessage: soulReflectionText,
        theme: safeString(transitThemes[0], "Pertumbuhan"),
        affirmation: safeInput.language === "id"
          ? `Aku melangkah di jalanku dengan kehadiran, kejujuran, dan kasih sayang.`
          : `I meet my path with presence, honesty, and care.`,
        warningSign: mood <= 4 ? (safeInput.language === "id" ? "Jika tubuhmu meminta untuk melambat, perlakukan itu sebagai panduan, bukan hambatan." : "If your body asks for slowness, treat that as guidance rather than resistance.") : undefined,
        guidance: safeInput.language === "id"
          ? `Pilih satu tindakan nyata yang mendukung dirimu dan biarkan sisanya menjadi opsional.`
          : `Choose one grounded action that supports you and let the rest become optional.`,
        emotionalTone: toneFromMood(mood),
      },
      astroEnergy: {
        currentEnergy: transitName,
        description: safeInput.language === "id"
          ? `Kondisi langit menekankan tema batinmu hari ini.`
          : `The current sky highlights themes for your inner field.`,
        emoji: mood <= 4 ? "*" : "+",
        intensity: transit?.intensity || intensityFromMood(mood),
        recommendation: safeInput.language === "id"
          ? `Bekerjalah dengan energi dirimu melalui satu praktik tubuh sebelum mencoba memahaminya lewat pikiran.`
          : `Work with your energy through one embodied practice before making meaning from it.`,
        affectedAreas: transitThemes,
      },
      dailyInnerwork: {
        tasks: [
          {
            id: `journal-${slug(seed)}-${slug(transitThemes[0])}`,
            task: restart
              ? (safeInput.language === "id" ? "Tulis satu kalimat di jurnal yang membuat kepulangan hari ini terasa mungkin." : "Journal one sentence that makes returning feel possible.")
              : (safeInput.language === "id" ? `Tulis di jurnal tentang bagaimana apa yang kamu rasakan muncul dalam harimu.` : `Journal about how what you feel is showing up.`),
            duration: innerworkDuration,
            category: "journaling",
            emoji: "write",
            purpose: safeInput.language === "id" ? `Mengubah rasa menjadi refleksi sadar.` : `To turn feeling into conscious reflection.`,
            instruction: safeInput.language === "id" ? `Tulis tiga kalimat jujur, lalu garis bawahi kalimat yang terasa paling hidup bagi jiwamu.` : `Write three honest sentences, then underline the sentence that feels most alive.`,
            completed: false,
          },
          {
            id: `ground-${slug(seed)}-${slug(identity.humanDesign)}`,
            task: safeInput.language === "id" ? `Murnikan energi batinmu sebelum memberikan respons.` : `Ground your inner energy before responding.`,
            duration: 6,
            category: "grounding",
            emoji: "root",
            purpose: safeInput.language === "id" ? "Membiarkan sistem saraf memimpin sebelum pikiran memberikan penjelasan." : "To let the nervous system lead before the mind explains.",
            instruction: safeInput.language === "id" ? "Tempelkan kedua telapak kaki ke lantai, lemaskan rahang, dan bernapaslah sampai bahumu terasa turun dan rileks." : "Place both feet down, soften your jaw, and breathe until your shoulders lower.",
            completed: false,
          },
          {
            id: `meditate-${slug(seed)}-${slug(identity.sunSign)}`,
            task: safeInput.language === "id" ? `Bermeditasi dengan dirimu.` : `Meditate with your inner self.`,
            duration: meditationDuration,
            category: "meditation",
            emoji: "still",
            purpose: safeInput.language === "id" ? `Mengintegrasikan apa yang kamu rasakan tanpa memprosesnya secara berlebihan lewat logika.` : `To integrate what you feel without overprocessing.`,
            instruction: safeInput.language === "id" ? "Ikuti aliran napas dan sebutkan satu sensasi tubuh pada setiap embusan napasmu." : "Follow the breath and name one sensation on every exhale.",
            completed: false,
          },
        ],
        theme: safeString(transitThemes[0], "Kehadiran"),
        focusArea: safeString(transitThemes[0], "Diri"),
        totalDuration: totalInnerworkDuration,
        difficulty: mood <= 4 ? "beginner" : mood >= 8 ? "advanced" : "intermediate",
      },
      journalingPrompt: {
        prompt: restart
          ? (safeInput.language === "id" ? "Apa yang akan membuat awal yang baru hari ini terasa ramah dan tidak berat bagi jiwamu?" : "What would make beginning again feel kind instead of heavy today?")
          : strongCompletion
            ? (safeInput.language === "id" ? `Apa yang diajarkan oleh konsistensi kemarin tentang dirimu dalam hidupmu?` : `What is yesterday's consistency teaching me about myself?`)
            : (safeInput.language === "id" ? `Apa yang perlu dipahami oleh dirimu yang paling dalam hari ini?` : `What does my deep self need to understand today?`),
        subPrompts: safeInput.language === "id" ? [
          `Di bagian tubuh mana rasa saat ini paling terasa?`,
          `Apa yang kamu butuhkan sebelum kamu mengambil tindakan nyata?`,
          `Seperti apa rasanya dukungan jika kamu berhenti merasa harus terus membuktikannya?`,
        ] : [
          `Where does this feeling live in my body?`,
          `What do I need before taking action?`,
          `What would support look like if I stopped earning it?`,
        ],
        theme: safeString(transitThemes[0], "Refleksi"),
        emotionalDepth: mood <= 4 ? "surface" : "medium",
        purpose: `To connect emotional memory with today's context.`,
        relatedArea: safeString(transitThemes[0], "Pertumbuhan"),
      },
      shadowInsight: safeInput.language === "id"
        ? `Tepi batin hari ini adalah menganggap apa yang kamu rasakan sebagai bukti bahwa kamu tertinggal. Integrasinya adalah memperlakukannya sebagai sinyal untuk perawatan diri, penyesuaian ritme, dan batas diri yang lebih jelas.`
        : `The inner edge today is turning what you feel into proof that you are behind. The integration is to treat it as a signal for care, pacing, and clearer boundaries.`,
      meditationRecommendation: {
        title: safeInput.language === "id" ? `Penyelarasan Diri` : `Self Alignment`,
        duration: meditationDuration,
        type: "grounding",
        focusArea: safeString(transitThemes[0], "Kehadiran"),
        description: safeInput.language === "id" ? `Praktik hening untuk mengintegrasikan apa yang kamu rasakan melalui tubuh.` : `A quiet practice for integrating what you feel through the body.`,
        technique: safeInput.language === "id" ? "Pernapasan embusan pelan dengan pemindaian tubuh secara menyeluruh." : "Slow exhale breathing with body scanning",
        energyEffect: mood <= 4 ? "settling" : "centering",
      },
      healingRecommendation: {
        id: `healing-${slug(topTheme)}`,
        type: "somatic",
        title: safeInput.language === "id" ? `Temui dirimu melalui tubuh` : `Meet yourself through the body`,
        description: safeInput.language === "id" ? `Praktik singkat untuk membantu apa yang kamu rasakan berpindah dari tekanan mental menjadi kejernihan yang dirasakan tubuh.` : `A short practice to help what you feel move from mental pressure into embodied clarity.`,
        duration: 10,
        basedOnEmotionalAnalysis: topTheme,
        addressesWound: topWound,
        supportedBy: "emotional memory and current context",
        instructions: safeInput.language === "id" ? [
          "Sebutkan perasaanmu tanpa menghakiminya sama sekali.",
          "Temukan di mana letak perasaan tersebut di dalam tubuhmu.",
          "Tawarkan satu tindakan dukungan nyata untuk dirimu sendiri hari ini.",
        ] : [
          "Name the feeling without judging it.",
          "Locate the feeling in the body.",
          "Offer one concrete support action today.",
        ],
        tips: safeInput.language === "id" ? [
          "Jaga agar praktik ini tetap kecil dan mudah untuk diselesaikan.",
          "Pilih regulasi emosi sebelum mencoba melakukan interpretasi pikiran.",
        ] : [
          "Keep the practice small enough to complete.",
          "Choose regulation before interpretation.",
        ],
        bestTiming: mood <= 4 ? "immediately" : "today",
        frequency: "once today",
        integratesWithPractice: ["journaling", "grounding", "meditation"],
        supportiveReminder: safeInput.language === "id" ? `Kamu bisa bekerja dengan apa yang kamu rasakan tanpa harus merasa tertelan olehnya.` : `You can work with what you feel without becoming consumed by it.`,
      },
      healingAudio: {
        title: restart ? (safeInput.language === "id" ? "Alunan Kepulangan yang Lembut" : "Gentle Return Sound bath") : (safeInput.language === "id" ? `Penyelarasan ${safeString(transitThemes[0], "Keseimbangan")}` : `${safeString(transitThemes[0], "Balance")} Attunement`),
        frequency: mood <= 4 ? "396Hz" : "432Hz",
        duration: restart ? 8 : 12,
        purpose: restart
          ? (safeInput.language === "id" ? "Mendukung awal ulang tanpa tekanan setelah hari yang tidak lengkap." : "Support a low-pressure restart after an incomplete day.")
          : (safeInput.language === "id" ? `Mendukung dirimu dengan grounding sensorik yang stabil.` : `Support yourself with steady sensory grounding.`),
        affinity: "Diri",
        vibe: mood <= 4 ? "calming" : "balancing",
        artistOrSource: "Bhumi Amartya",
      },
      soulProgress: {
        healingStreak: Number(safeInput.healingProgress.healingStreak) || 0,
        consciousnessLevel: Number(safeInput.healingProgress.consciousnessLevel) || 50,
        totalJournalEntries: Number(safeInput.healingProgress.totalJournalEntries) || 0,
        totalMeditationMinutes: Number(safeInput.healingProgress.totalMeditationMinutes) || 0,
        totalInnerworkSessions: Number(safeInput.healingProgress.totalInnerworkSessions) || 0,
        currentPhase: (Number(safeInput.healingProgress.healingStreak) || 0) > 7 ? "Integration" : "Attunement",
        nextMilestone:
          (Number(safeInput.healingProgress.healingStreak) || 0) > 7
            ? (safeInput.language === "id" ? "Perdalam konsistensi dengan penyempurnaan yang lembut." : "Deepen consistency with gentle refinement")
            : (safeInput.language === "id" ? "Selesaikan ritme tujuh hari dari pemeriksaan diri yang jujur." : "Complete a seven-day rhythm of honest check-ins"),
        progressPercentage: Math.min(100, Math.max(1, Number(safeInput.healingProgress.consciousnessLevel) || 1)),
      },
      reminderState: {
        groundingDone: false,
        journalingDone: false,
        meditationDone: false,
        moodLevel: mood,
        needsSupport: mood <= 4,
        reminderMessage: safeInput.language === "id" ? `Mulailah dengan kehadiran sebelum menuntut dirimu melakukan lebih banyak.` : `Begin with presence before asking yourself to do more.`,
        reminderCategory: mood <= 4 ? "grounding" : "journaling",
      },
      manifestation: generateLocalManifestation(safeInput as any, "ai_missing"),
    };
  } catch (err) {
    console.error("[LOCAL_DG_FALLBACK_INTERNAL_ERROR]", err);
    throw err;
  }
}
