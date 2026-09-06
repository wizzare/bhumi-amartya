/**
 * BHUMI AMARTYA - Journal Prompt Generator
 * Generates deeply personalized journaling prompts based on:
 * - User's identity blueprint (Life Path, Arcana, Human Design)
 * - Emotional patterns and previous journal history
 * - Current healing cycle
 * - Nervous system needs
 */

import type { CoreIdentity, JournalPrompt, AIGenerationContext } from "../data/types";
import { buildUnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";
import { isEnlEdition } from "@/lib/config/edition";

// ============= PROMPT THEMES BY LIFE PATH =============

const lifePathThemes: Record<number, string[]> = {
  1: ["pioneering", "self-trust", "taking action", "fear of loneliness", "leadership"],
  2: ["partnerships", "boundaries", "self-worth in relationships", "resentment", "balance"],
  3: ["creative expression", "scattered energy", "communication", "joy", "authenticity"],
  4: ["stability", "responsibility", "rest", "burnout", "foundation"],
  5: ["freedom", "exploration", "limits", "addiction", "groundedness"],
  6: ["responsibility to others", "over-giving", "boundaries", "support-seeking", "community"],
  7: ["inner knowing", "doubt", "trust", "perfectionism", "spirituality"],
  8: ["power", "control", "abundance", "fear of loss", "integrity"],
  9: ["completion", "letting go", "wholeness", "detachment", "empathy"],
};

// ============= PROMPT THEMES BY ARCANA =============

const arcanaThemes: Record<number, string[]> = {
  0: ["innocence", "new beginnings", "trust", "vulnerability"],
  1: ["willpower", "manifestation", "agency", "self-doubt"],
  2: ["intuition", "hidden knowledge", "receptivity", "confusion"],
  3: ["abundance", "fertility", "creativity", "self-love"],
  4: ["structure", "authority", "control", "rigidity"],
  5: ["conflict", "communication breakdown", "sibling wounds", "curiosity"],
  6: ["love", "choice", "relationships", "heart-centered decisions"],
  7: ["introspection", "solitude", "truth-seeking", "loneliness"],
  8: ["power", "willpower", "mastery", "self-doubt"],
  9: ["introspection", "patience", "waiting", "integration"],
  10: ["cycles", "karma", "luck", "acceptance"],
  11: ["justice", "truth", "balance", "accountability"],
  12: ["surrender", "sacrifice", "new perspective", "healing"],
  13: ["transformation", "death/rebirth", "endings", "renewal"],
  14: ["integration", "balance", "alchemy", "hope"],
  15: ["shadow", "primal energy", "authenticity", "liberation"],
  16: ["destruction", "revelation", "collapse", "breakthrough"],
  17: ["hope", "inspiration", "dreams", "guidance"],
  18: ["illusion", "fear", "subconscious", "shadow work"],
  19: ["illumination", "consciousness", "clarity", "authenticity"],
  20: ["calling", "awakening", "purpose", "resurrection"],
  21: ["completion", "wholeness", "integration", "celebration"],
};

// ============= CORE PROMPT TEMPLATES =============

const prompts = {
  // Self-worth and inner value
  selfWorth: [
    "Bagian mana dari dirimu yang paling lelah akhir-akhir ini, tetapi belum sempat benar-benar didengarkan?",
    "Apa yang kamu butuhkan dari dirimu sendiri hari ini?",
    "Jika tubuhmu berbicara, apa yang mau dia sampaikan?",
    "Siapa dirimu di luar semua yang kamu lakukan?",
  ],

  // Boundaries and relationships
  relationships: [
    "Dalam hubunganmu dengan orang-orang di sekitar, di mana batasan dirimu paling lembut?",
    "Apa yang takut hilang jika kamu benar-benar mengatakan 'tidak'?",
    "Siapa versi dirimu yang belum pernah jadi di hadapan mereka?",
    "Apa yang kamu korbankan untuk terhubung dengan orang lain?",
  ],

  // Grief and letting go
  grief: [
    "Apa yang sedang meninggalkanmu, dan apa yang ingin kamu katakan kepadanya?",
    "Di mana luka ini dimulai?",
    "Bagian apa dari dirimu yang belum siap melepas?",
    "Jika kamu membiarkan diri menangis sepenuh hati, suara apa yang akan keluar?",
  ],

  // Creativity and authenticity
  creativity: [
    "Versi mana dari dirimu yang paling takut untuk dilihat?",
    "Apa yang ingin diciptakan melalui tanganmu?",
    "Jika tidak ada yang menilai, apa yang ingin kamu ekspresikan?",
    "Seni apa dalam dirimu yang masih mencari bentuk?",
  ],

  // Fear and courage
  fear: [
    "Ketakutan apa yang paling sering berbisik ke telingamu?",
    "Jika keberanian punya warna, warna apa yang paling resonan untuk dirimu?",
    "Apa yang akan berubah jika kamu tidak takut?",
    "Kemana takutmu mencoba melindungimu?",
  ],

  // Anger and power
  anger: [
    "Kemarahan apa dalam dirimu yang belum boleh marah?",
    "Kekuatan mana dari dirimu yang sedang ditekan?",
    "Apa yang ingin diperbaiki dengan suara yang lebih keras?",
    "Bagian mana dari dirimu yang ingin berdiri tegak?",
  ],

  // Rest and cycles
  rest: [
    "Apa yang sedang meminta untuk berhenti dan diistirahatkan?",
    "Di mana tubuhmu mengatakan 'sudah cukup'?",
    "Ritme apa yang sesungguhnya ingin kamu ikuti?",
    "Jika diizinkan, apa yang akan kamu lepaskan hari ini?",
  ],

  // Presence and now
  presence: [
    "Apa yang sedang terjadi di bawah permukaanmu yang jarang kamu lihat?",
    "Saat ini, tubuhmu ingin memberitahu apa?",
    "Apa yang indah tentang hidupmu yang biasanya kamu lewatkan?",
    "Jika kamu benar-benar ada di sini, apa yang kamu perhatikan?",
  ],

  // Integration and healing
  healing: [
    "Bagian mana dari luka lamamu yang sedang mencari cahaya?",
    "Apa yang sudah kamu pelajari tentang dirimu melalui rasa sakit?",
    "Ke mana perjalanan penyembuhanmu saat ini membawamu?",
    "Siapa yang kamu menjadi setelah semua ini?",
  ],
};

const promptsEN = {
  selfWorth: [
    "Which part of you has been most tired lately, but hasn't had the chance to be truly heard?",
    "What do you need from yourself today?",
    "If your body could speak, what would it want to tell you?",
    "Who are you beyond everything you do?",
  ],
  relationships: [
    "In your relationships with people around you, where are your boundaries softest?",
    "What are you afraid of losing if you truly say 'no'?",
    "Who is the version of you that hasn't yet shown up in front of them?",
    "What are you sacrificing to stay connected with others?",
  ],
  grief: [
    "What is currently leaving you, and what would you like to say to it?",
    "Where did this wound begin?",
    "Which part of you is not yet ready to let go?",
    "If you allowed yourself to cry wholeheartedly, what sound would come out?",
  ],
  creativity: [
    "Which version of you is most afraid of being seen?",
    "What wants to be created through your hands?",
    "If no one were judging, what would you express?",
    "What art within you is still searching for its form?",
  ],
  fear: [
    "What fear whispers to your ear most frequently?",
    "If courage had a color, what color would resonate most with you?",
    "What would change if you were not afraid?",
    "Where is your fear trying to protect you?",
  ],
  anger: [
    "What anger within you hasn't been allowed to be angry?",
    "Which power of yours is currently being suppressed?",
    "What wants to be corrected with a louder voice?",
    "Which part of you wants to stand tall?",
  ],
  rest: [
    "What is asking to stop and be rested?",
    "Where is your body saying 'enough'?",
    "What rhythm do you truly want to follow?",
    "If permitted, what would you let go of today?",
  ],
  presence: [
    "What is happening beneath your surface that you rarely notice?",
    "Right now, what does your body want to tell you?",
    "What is beautiful about your life that you usually miss?",
    "If you were truly here right now, what do you notice?",
  ],
  healing: [
    "Which part of your old wound is searching for light?",
    "What have you learned about yourself through the pain?",
    "Where is your healing journey currently leading you?",
    "Who are you becoming after all of this?",
  ],
};

// ============= PROMPT GENERATION LOGIC =============

export function generateJournalPrompt(
  coreIdentity: CoreIdentity,
  context?: {
    currentMood?: number;
    emotionalPattern?: string;
    recentThemes?: string[];
    astroEnergyIntensity?: "low" | "medium" | "high";
  }
): JournalPrompt {
  const { lifePath, arcanaCenter, humanDesign } = coreIdentity;
  const isEn = isEnlEdition();
  const synthesis = buildUnifiedBlueprintSynthesis({
    language: isEn ? "en" : "id",
    profile: null,
    blueprint: {
      lifePath: { number: lifePath },
      humanDesign: { type: humanDesign },
      destinyMatrix: { arcanaCenter },
      astrology: { sunSign: coreIdentity.sunSign },
    },
  });
  const synthesisText = [
    synthesis.blueprintSummary,
    ...synthesis.coreNeeds,
    synthesis.practiceThemes.reflection,
  ].join(" ").toLowerCase();
  const mood = context?.currentMood || 5;
  const intensity = context?.astroEnergyIntensity || "medium";

  // ---------------------------------
  // Determine primary theme
  // ---------------------------------

  let primaryTheme = "self-worth"; // default
  let subTheme = "";

  // Low mood → grief/rest themes
  if (mood <= 3) {
    const lowMoodThemes = ["grief", "rest", "fear"];
    primaryTheme = lowMoodThemes[Math.floor(Math.random() * lowMoodThemes.length)];
  }
  // Medium-low → anxiety/boundaries
  else if (mood <= 5) {
    if (Math.random() > 0.5) {
      primaryTheme = "fear";
    } else {
      primaryTheme = "relationships";
    }
  }
  // Medium-high → creativity/presence
  else if (mood <= 7) {
    const highMoodThemes = ["creativity", "presence", "healing"];
    primaryTheme = highMoodThemes[Math.floor(Math.random() * highMoodThemes.length)];
  }
  // High mood → integration
  else {
    primaryTheme = "healing";
  }

  if (synthesisText.includes("structure") || synthesisText.includes("responsibility")) {
    primaryTheme = mood < 5 ? "rest" : primaryTheme;
    subTheme = "integration";
  } else if (synthesisText.includes("relationship") || synthesisText.includes("harmony") || synthesisText.includes("care")) {
    primaryTheme = "relationships";
  } else if (synthesisText.includes("initiative") || synthesisText.includes("self-trust")) {
    if (["fear", "anxiety"].includes(context?.emotionalPattern || "")) {
      primaryTheme = "fear";
    }
  }

  // ---------------------------------
  // Select specific prompt
  // ---------------------------------

  const themeKey = primaryTheme as keyof typeof prompts;
  const activePrompts = isEn ? promptsEN : prompts;
  const promptOptions = activePrompts[themeKey] || activePrompts.selfWorth;
  const selectedPrompt =
    promptOptions[Math.floor(Math.random() * promptOptions.length)];

  // ---------------------------------
  // Generate sub-prompts for deeper reflection
  // ---------------------------------

  const subPrompts = generateSubPrompts(primaryTheme, coreIdentity);

  // ---------------------------------
  // Determine emotional depth based on context
  // ---------------------------------

  let emotionalDepth: "surface" | "medium" | "deep" = "medium";
  if (mood <= 3 || intensity === "high") {
    emotionalDepth = "deep";
  } else if (mood >= 8) {
    emotionalDepth = "surface"; // Lighter prompts when already good
  }

  // ---------------------------------
  // Determine related life area
  // ---------------------------------

  const lifeAreas = ["relationships", "health", "creativity", "spirituality", "purpose"];
  const relatedArea =
    lifeAreas[Math.floor(Math.random() * lifeAreas.length)];

  // ---------------------------------
  // Build full prompt object
  // ---------------------------------

  return {
    id: `prompt-${Date.now()}`,
    prompt: selectedPrompt,
    subPrompts,
    theme: primaryTheme,
    emotionalDepth,
    purpose: isEn
      ? `Exploring the theme of ${primaryTheme} currently present in your life.`
      : `Mengeksplorasi ${primaryTheme} yang sedang hadir dalam hidupmu saat ini.`,
    relatedArea,
    generatedBasedOn: {
      lifePathInsight: isEn
        ? "Today's reflection is directed toward one question that feels honest, not an answer that must be perfect."
        : "Refleksi hari ini diarahkan pada satu pertanyaan yang terasa jujur, bukan pada jawaban yang harus sempurna.",
      arcanaInsight: isEn
        ? "There is room to look at old patterns gently and then choose a healthier response."
        : "Ada ruang untuk melihat pola lama dengan lembut lalu memilih respons yang lebih sehat.",
      humanDesignInsight: isEn
        ? "Today's support rhythm starts from listening to your body before forcing a decision."
        : "Ritme dukungan hari ini dimulai dari mendengar tubuh sebelum memaksa keputusan.",
      emotionalPattern: context?.emotionalPattern,
    },
  };
}

// ============= HELPER: Generate sub-prompts =============

function generateSubPrompts(
  theme: string,
  coreIdentity: CoreIdentity
): string[] {
  const isEn = isEnlEdition();
  const baseSubPrompts: Record<string, string[]> = {
    selfWorth: [
      "Apa kepercayaan yang paling sulit kamu pegang tentang dirimu?",
      "Jika kamu bisa menerima satu hal tentang dirimu hari ini, apa itu?",
    ],
    relationships: [
      "Bagaimana caramu mencintai berbeda dengan cara orang lain mencintaimu?",
      "Apa yang mebutuh didengar dalam hubungan ini?",
    ],
    grief: [
      "Apa yang akan kamu pelajari jika kamu membiarkan diri sedih sepenuhnya?",
      "Apa yang tetap tersisa setelah kehilangan ini?",
    ],
    creativity: [
      "Apa bentuk yang paling murni dari ungkapanmu?",
      "Siapa seniman sejati dalam dirimu?",
    ],
    fear: [
      "Apa yang takutmu coba lindungi?",
      "Jika takut itu adalah teman, apa yang mau dia ajarkan?",
    ],
    anger: [
      "Apa kebenaran yang sedang dilawan oleh kemarahanmu?",
      "Jika kemarahan bisa berbicara dengan kasih sayang, apa katanya?",
    ],
    rest: [
      "Apa yang sedang meminta ijin untuk tidak sempurna?",
      "Bagaimana rasanya memberikan dirimu grasi?",
    ],
    presence: [
      "Apa yang indah sedang terjadi di sekitarmu sekarang?",
      "Jika kamu hanya mendengarkan tanpa mengubah, apa yang kamu dengar?",
    ],
    healing: [
      "Bagian mana dari dirimu yang sedang menjadi lebih utuh?",
      "Apa pembelajaran terbesar dari perjalanan ini?",
    ],
  };

  const baseSubPromptsEN: Record<string, string[]> = {
    selfWorth: [
      "What is the hardest belief for you to hold about yourself?",
      "If you could accept one thing about yourself today, what would it be?",
    ],
    relationships: [
      "How is the way you love different from how others love you?",
      "What needs to be heard in this relationship?",
    ],
    grief: [
      "What would you learn if you allowed yourself to be fully sad?",
      "What still remains after this loss?",
    ],
    creativity: [
      "What is the purest form of your expression?",
      "Who is the true artist within you?",
    ],
    fear: [
      "What is your fear trying to protect?",
      "If fear were a friend, what would it want to teach you?",
    ],
    anger: [
      "What truth is your anger fighting against?",
      "If anger could speak with compassion, what would it say?",
    ],
    rest: [
      "What is asking for permission to be imperfect?",
      "How does it feel to give yourself grace?",
    ],
    presence: [
      "What beautiful thing is happening around you right now?",
      "If you only listened without changing anything, what do you hear?",
    ],
    healing: [
      "Which part of you is becoming more whole?",
      "What is the greatest learning from this journey?",
    ],
  };

  const activeMap = isEn ? baseSubPromptsEN : baseSubPrompts;
  return activeMap[theme] || [];
}

// ============= EXPORT for use in components =============

export function generateDailyJournalPrompt(
  coreIdentity: CoreIdentity,
  currentMood: number,
  emotionalPattern?: string
): JournalPrompt {
  return generateJournalPrompt(coreIdentity, {
    currentMood,
    emotionalPattern,
  });
}
