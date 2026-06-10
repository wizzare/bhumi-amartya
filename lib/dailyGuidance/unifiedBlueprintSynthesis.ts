import type { DailyGuidanceAdaptiveContext } from "@/lib/dailyGuidance/types";

type UnknownRecord = Record<string, unknown>;

export type UnifiedBlueprintSynthesisInput = {
  language: "id" | "en";
  profile: UnknownRecord | null;
  blueprint: UnknownRecord | null;
  astrologyToday?: string | null;
  adaptiveContext?: DailyGuidanceAdaptiveContext;
};

export type ProgressTone = {
  key: "restart" | "steady" | "growth" | "celebration";
  label: string;
  durationRange: [number, number];
  practiceDepth: "light" | "steady" | "deep";
};

export type UnifiedBlueprintSynthesis = {
  blueprintSummary: string;
  coreNeeds: string[];
  practiceThemes: {
    grounding: string;
    reflection: string;
    action: string;
  };
  progressTone: ProgressTone;
  archetypes: string[];
  identitySignals: {
    lifePath: number | null;
    arcanaCenter: string | null;
    commonEnergy: string | null;
    karmicPatterns: string[];
    humanDesignType: string | null;
    humanDesignProfile: string | null;
    authority: string | null;
    strategy: string | null;
    sunSign: string | null;
    moonSign: string | null;
    ascendant: string | null;
  };
};

function readValue(source: unknown, path: string[]): unknown {
  let cursor = source;

  for (const key of path) {
    if (!cursor || typeof cursor !== "object" || !(key in cursor)) return null;
    cursor = (cursor as UnknownRecord)[key];
  }

  return cursor;
}

function readString(source: unknown, paths: string[][]): string | null {
  for (const path of paths) {
    const value = readValue(source, path);
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function readNumber(source: unknown, paths: string[][]): number | null {
  for (const path of paths) {
    const value = readValue(source, path);
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return null;
}

function readStringArray(source: unknown, paths: string[][]): string[] {
  for (const path of paths) {
    const value = readValue(source, path);
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object") {
            return readString(item, [["theme"], ["pattern"], ["name"], ["description"]]);
          }
          return null;
        })
        .filter((item): item is string => Boolean(item?.trim()));
    }
  }
  return [];
}

function normalizeHumanDesignType(type: string | null): string {
  return (type ?? "").toLowerCase().replace(/[^a-z]/g, "");
}

export function getHumanDesignPracticeTheme(type: string | null): UnifiedBlueprintSynthesis["practiceThemes"] {
  const normalized = normalizeHumanDesignType(type);

  if (normalized === "generator") {
    return {
      grounding: "body signal and sustainable energy",
      reflection: "what feels available to respond to",
      action: "one task that has a clear inner yes",
    };
  }

  if (normalized === "manifestinggenerator") {
    return {
      grounding: "body response before moving quickly",
      reflection: "small experiments without overcommitting",
      action: "one focused step from a multi-step idea",
    };
  }

  if (normalized === "projector") {
    return {
      grounding: "rest, observation, and energy management",
      reflection: "clarity before giving attention away",
      action: "one invited or well-timed contribution",
    };
  }

  if (normalized === "manifestor") {
    return {
      grounding: "conscious initiation and nervous system space",
      reflection: "the impact of today's energy",
      action: "one clear step with simple communication",
    };
  }

  if (normalized === "reflector") {
    return {
      grounding: "environmental sensitivity and spacious pacing",
      reflection: "what the day mirrors back",
      action: "one adjustment that makes the environment feel clearer",
    };
  }

  return {
    grounding: "body steadiness and present-moment regulation",
    reflection: "honest emotional check-in",
    action: "one practical step that matches today's capacity",
  };
}

export function getLifePathPracticeTheme(lifePath: number | null): UnifiedBlueprintSynthesis["practiceThemes"] {
  const themes: Record<number, UnifiedBlueprintSynthesis["practiceThemes"]> = {
    1: { grounding: "self-trust", reflection: "initiative without self-pressure", action: "one leadership step" },
    2: { grounding: "emotional sensitivity", reflection: "harmony and cooperation", action: "one relational repair or support step" },
    3: { grounding: "creative regulation", reflection: "expression and communication", action: "one small act of honest expression" },
    4: { grounding: "structure and consistency", reflection: "discipline with kindness", action: "one organized completion" },
    5: { grounding: "freedom with steadiness", reflection: "flexibility without scattering", action: "one exploratory but contained step" },
    6: { grounding: "responsibility with balance", reflection: "care without carrying everything", action: "one home, family, or community support step" },
    7: { grounding: "quiet introspection", reflection: "study and spiritual depth", action: "one researched or contemplative next step" },
    8: { grounding: "power with responsibility", reflection: "leadership, money, and integrity", action: "one clean decision or ownership step" },
    9: { grounding: "compassionate release", reflection: "closure and service", action: "one act of completion or generosity" },
    11: { grounding: "emotional regulation", reflection: "intuition and inspiration", action: "one inspired step made practical" },
    22: { grounding: "long-term steadiness", reflection: "vision grounded in reality", action: "one building block for a larger plan" },
    33: { grounding: "heart-led steadiness", reflection: "healing and service", action: "one compassionate leadership step" },
  };

  return lifePath ? themes[lifePath] ?? themes[9] : {
    grounding: "simple steadiness",
    reflection: "current emotional truth",
    action: "one doable support step",
  };
}

export function getProgressTone(completionRateYesterday: number, streakDays = 0): ProgressTone {
  if (streakDays >= 7 && completionRateYesterday > 0) {
    return { key: "celebration", label: "celebration, consistency, and gentle refinement", durationRange: [10, 20], practiceDepth: "deep" };
  }

  if (completionRateYesterday === 0) {
    return { key: "restart", label: "gentle, supportive restart", durationRange: [5, 10], practiceDepth: "light" };
  }

  if (completionRateYesterday > 80) {
    return { key: "growth", label: "growth, expansion, and next level", durationRange: [10, 20], practiceDepth: "deep" };
  }

  return { key: "steady", label: "steady, supportive continuation", durationRange: [5, 15], practiceDepth: "steady" };
}

function mergeThemes(primary: string, secondary: string, fallback: string): string {
  const parts = [primary, secondary].filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1 || primary === secondary) return parts[0];
  return `${primary}, held together with ${secondary}`;
}

function humanizeNeed(need: string, language: "id" | "en"): string {
  const text = need.toLowerCase();

  if (text.includes("structure") || text.includes("discipline") || text.includes("consistency")) {
    return language === "en"
      ? "one clear structure that makes the day feel easier to hold"
      : "satu struktur kecil yang membuat hari terasa lebih mudah dipegang";
  }
  if (text.includes("current sky")) {
    return language === "en"
      ? "awareness of today's mood without letting it decide everything for you"
      : "kesadaran pada suasana hari ini tanpa membiarkannya menentukan semuanya";
  }
  if (text.includes("relational") || text.includes("relationship") || text.includes("cooperation") || text.includes("invited") || text.includes("well-timed")) {
    return language === "en"
      ? "one relationship or conversation handled with more timing and care"
      : "satu relasi atau percakapan yang dijaga dengan waktu dan kepedulian yang lebih pas";
  }
  if (text.includes("home") || text.includes("family") || text.includes("community") || text.includes("inner yes")) {
    return language === "en"
      ? "one caring action that supports others without ignoring your own capacity"
      : "satu tindakan peduli yang mendukung orang lain tanpa mengabaikan kapasitasmu";
  }
  if (text.includes("environment") || text.includes("spacious") || text.includes("sensitivity")) {
    return language === "en"
      ? "an environment that gives your sensitivity more room to breathe"
      : "lingkungan yang memberi kepekaanmu lebih banyak ruang untuk bernapas";
  }
  if (text.includes("self-trust") || text.includes("initiative") || text.includes("conscious initiation")) {
    return language === "en"
      ? "permission to trust the first honest step without forcing the whole path"
      : "izin untuk mempercayai langkah jujur pertama tanpa memaksa seluruh jalan";
  }
  if (text.includes("freedom") || text.includes("flexibility") || text.includes("explor")) {
    return language === "en"
      ? "enough freedom to move without scattering your energy everywhere"
      : "ruang bergerak yang cukup tanpa membuat energimu tersebar ke mana-mana";
  }
  if (text.includes("quiet") || text.includes("study") || text.includes("contemplative") || text.includes("introspection")) {
    return language === "en"
      ? "quiet space to understand what is true before acting on it"
      : "ruang hening untuk memahami yang benar sebelum bertindak";
  }
  if (text.includes("long-term") || text.includes("vision") || text.includes("building block")) {
    return language === "en"
      ? "one grounded building block for something that matters long term"
      : "satu pijakan membumi untuk sesuatu yang penting dalam jangka panjang";
  }
  if (text.includes("compassion") || text.includes("service") || text.includes("healing")) {
    return language === "en"
      ? "care that includes other people without leaving yourself behind"
      : "kepedulian yang tetap menyertakan dirimu sendiri";
  }
  if (text.includes("body") || text.includes("energy") || text.includes("ground") || text.includes("tubuh")) {
    return language === "en"
      ? "a slower check-in with the body before choosing the next step"
      : "jeda yang lebih pelan untuk mendengar tubuh sebelum memilih langkah";
  }
  if (text.includes("emotion") || text.includes("heart") || text.includes("harmony") || text.includes("care")) {
    return language === "en"
      ? "more room for feelings without letting them run the whole day"
      : "ruang yang lebih lembut untuk emosi tanpa membiarkannya mengambil alih hari";
  }
  if (text.includes("leadership") || text.includes("power") || text.includes("money") || text.includes("ownership") || text.includes("responsibility with balance")) {
    return language === "en"
      ? "a cleaner relationship with responsibility, choice, and personal power"
      : "relasi yang lebih jernih dengan tanggung jawab, pilihan, dan daya diri";
  }
  if (text.includes("expression") || text.includes("communication") || text.includes("creative")) {
    return language === "en"
      ? "honest expression in a form that feels safe enough to begin"
      : "ekspresi jujur dalam bentuk yang cukup aman untuk dimulai";
  }
  if (text.includes("rest") || text.includes("observation") || text.includes("clarity")) {
    return language === "en"
      ? "clarity that comes from pausing before giving energy away"
      : "kejernihan yang muncul dari jeda sebelum memberi energi ke luar";
  }
  if (text.includes("release") || text.includes("closure") || text.includes("transform")) {
    return language === "en"
      ? "permission to close one small loop without rushing the whole process"
      : "izin untuk menutup satu lingkaran kecil tanpa memburu seluruh proses";
  }
  if (text.includes("restart")) {
    return language === "en"
      ? "a gentle restart without turning yesterday into a verdict"
      : "awal ulang yang lembut tanpa menjadikan kemarin sebagai vonis";
  }
  if (text.includes("growth") || text.includes("expansion") || text.includes("next level")) {
    return language === "en"
      ? "a slightly braver step that still respects capacity"
      : "langkah yang sedikit lebih berani, tetap sesuai kapasitas";
  }
  if (text.includes("celebration") || text.includes("consistency")) {
    return language === "en"
      ? "appreciation for the rhythm already being built"
      : "apresiasi untuk ritme yang sudah mulai terbangun";
  }

  return need;
}

function uniqueNeeds(needs: string[]): string[] {
  const seen = new Set<string>();
  return needs.filter((need) => {
    const key = need.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getArchetypes(lifePath: number | null, arcana: string | null, hdType: string | null): string[] {
  const archetypes: string[] = [];
  const normalizedHD = normalizeHumanDesignType(hdType);

  // Life Path Archetypes
  if (lifePath === 1) archetypes.push("Pioneer", "Initiator");
  if (lifePath === 2) archetypes.push("Harmonizer", "Partner");
  if (lifePath === 3) archetypes.push("Communicator", "Artist");
  if (lifePath === 4) archetypes.push("Builder", "Steward");
  if (lifePath === 5) archetypes.push("Explorer", "Catalyst");
  if (lifePath === 6) archetypes.push("Nurturer", "Guardian");
  if (lifePath === 7) archetypes.push("Seeker", "Analyst");
  if (lifePath === 8) archetypes.push("Manifestor", "Strategist");
  if (lifePath === 9) archetypes.push("Humanitarian", "Sage");
  if (lifePath === 11) archetypes.push("Visionary", "Inspirer");
  if (lifePath === 22) archetypes.push("Master Builder", "Architect");
  if (lifePath === 33) archetypes.push("Master Teacher", "Healer");

  // HD Archetypes
  if (normalizedHD === "manifestor") archetypes.push("Trailblazer", "Leader");
  if (normalizedHD === "generator") archetypes.push("Worker", "Engine");
  if (normalizedHD === "manifestinggenerator") archetypes.push("Multi-tasker", "Fast-mover");
  if (normalizedHD === "projector") archetypes.push("Guide", "Advisor");
  if (normalizedHD === "reflector") archetypes.push("Mirror", "Observer");

  // Arcana specific additions
  if (arcana === "8") archetypes.push("Courageous Soul");
  if (arcana === "9") archetypes.push("Wise Guide");

  // Deduplicate and take top 4
  return Array.from(new Set(archetypes)).slice(0, 4);
}

export function buildUnifiedBlueprintSynthesis(input: UnifiedBlueprintSynthesisInput): UnifiedBlueprintSynthesis {
  const { profile, blueprint } = input;
  const lifePath = readNumber(blueprint, [["numerology", "lifePath"], ["lifePath", "number"], ["lifePath"]])
    ?? readNumber(profile, [["lifePath"]]);
  const humanDesign = readValue(blueprint, [["humanDesign"]]) ?? readValue(profile, [["humanDesign"]]) as UnknownRecord | null;
  const isHDVerified = (humanDesign as UnknownRecord)?.status === "ready" || (humanDesign as UnknownRecord)?.status === "verified";

  const humanDesignType = isHDVerified ? (readString(blueprint, [["humanDesign", "type"], ["humanDesign", "energyType"]])
    ?? readString(profile, [["humanDesignType"]])) : null;
  const humanDesignProfile = isHDVerified ? (readString(blueprint, [["humanDesign", "profile"]])
    ?? readString(profile, [["humanDesignProfile"]])) : null;
  const authority = isHDVerified ? (readString(blueprint, [["humanDesign", "authority"]])
    ?? readString(profile, [["authority"]])) : null;
  const strategy = isHDVerified ? (readString(blueprint, [["humanDesign", "strategy"]])
    ?? readString(profile, [["strategy"]])) : null;
  const arcanaCenter = readString(blueprint, [["destinyMatrix", "arcanaCenter"], ["arcanaCenter", "name"], ["arcanaCenter"]])
    ?? readString(profile, [["arcanaCenter"]]);
  const commonEnergy = readString(blueprint, [["destinyMatrix", "commonEnergy"], ["commonEnergy"]]);
  const karmicPatterns = readStringArray(blueprint, [["destinyMatrix", "karmicPatterns"], ["karmicPatterns"]]);
  const sunSign = readString(blueprint, [["astrology", "sunSign"], ["natalChart", "sunSign"]])
    ?? readString(profile, [["sunSign"]]);
  const moonSign = readString(blueprint, [["astrology", "moonSign"], ["natalChart", "moonSign"]])
    ?? readString(profile, [["moonSign"]]);
  const ascendant = readString(blueprint, [["astrology", "ascendant"], ["natalChart", "ascendant"]])
    ?? readString(profile, [["ascendant"]]);

  const hdThemes = getHumanDesignPracticeTheme(humanDesignType);
  const lifePathThemes = getLifePathPracticeTheme(lifePath);
  const progressTone = getProgressTone(
    input.adaptiveContext?.completionRateYesterday ?? 0,
    input.adaptiveContext?.streakDays ?? 0,
  );

  const archetypes = getArchetypes(lifePath, arcanaCenter, humanDesignType);

  const coreNeeds = [
    mergeThemes(lifePathThemes.grounding, hdThemes.grounding, "grounded steadiness"),
    arcanaCenter || commonEnergy || "emotional integration",
    mergeThemes(lifePathThemes.action, hdThemes.action, "practical action"),
    input.astrologyToday ? "current sky awareness" : sunSign || moonSign || ascendant || "self-awareness",
    progressTone.label,
  ].filter(Boolean);

  const humanNeeds = uniqueNeeds(coreNeeds.map((need) => humanizeNeed(need, input.language))).slice(0, 4);
  const blueprintSummary = input.language === "en"
    ? `Today may feel more workable when you give yourself ${humanNeeds[0] ?? "a steadier rhythm"}, ${humanNeeds[1] ?? "one honest pause"}, and ${humanNeeds[2] ?? "one doable next step"}. Let the day stay practical: one honest check-in, one grounded choice, one small follow-through.`
    : `Hari ini mungkin terasa lebih bisa dijalani saat kamu memberi ruang untuk ${humanNeeds[0] ?? "ritme yang lebih stabil"}, ${humanNeeds[1] ?? "satu jeda jujur"}, dan ${humanNeeds[2] ?? "satu langkah yang bisa dilakukan"}. Biarkan harimu tetap sederhana: satu cek-in jujur, satu pilihan yang membumi, satu langkah kecil yang benar-benar dilakukan.`;

  return {
    blueprintSummary,
    coreNeeds,
    practiceThemes: {
      grounding: mergeThemes(hdThemes.grounding, lifePathThemes.grounding, "grounded steadiness"),
      reflection: mergeThemes(hdThemes.reflection, lifePathThemes.reflection, "honest reflection"),
      action: mergeThemes(hdThemes.action, lifePathThemes.action, "one practical step"),
    },
    progressTone,
    archetypes,
    identitySignals: {
      lifePath,
      arcanaCenter,
      commonEnergy,
      karmicPatterns,
      humanDesignType,
      humanDesignProfile,
      authority,
      strategy,
      sunSign,
      moonSign,
      ascendant,
    },
  };
}
