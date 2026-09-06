import type { DailyGuidance, DailyGuidanceCategory } from "@/lib/dailyGuidance/types";
import { DAILY_GUIDANCE_CONTENT_VERSION, DAILY_GUIDANCE_PROMPT_VERSION, DAILY_GUIDANCE_SCHEMA_VERSION } from "@/lib/dailyGuidance/version";
import type { ArsipAkashiProfileViewModel, ArsipAkashiProfileReading } from "@/lib/arsipAkashi/profile/viewModel";
import { generateBlueprintHash, generateMemoryHash } from "@/lib/utils/hashing";
import { isEnlEdition } from "@/lib/config/edition";

type DailySynthesisInput = {
  uid: string;
  profile: Record<string, unknown>;
  blueprint: Record<string, unknown>;
  arsipViewModel: ArsipAkashiProfileViewModel;
  localDateKey: string;
  timezone: string;
  referenceDate?: Date;
};

const SOURCE_VERSION = "profile-daily-synthesis-v1";
const RAW_READING_TITLES = [
  "Arketipe Utama",
  "Cara Hadir di Dunia",
  "Cara Berpikir & Memaknai Kehidupan",
  "Cara Mengambil Keputusan",
  "Fokus, Produktivitas & Konsistensi",
  "Ekonomi & Pola Penghasilan",
  "Money Block",
  "Talenta Alami",
  "Gaya Kerja",
  "Arah Karya & Kontribusi",
  "Kebutuhan Emosional dalam Relasi",
  "Love Block",
  "Pola Ketertarikan & Pilihan Pasangan",
  "Konflik, Komunikasi & Batas Diri",
  "Mekanisme Perlindungan Diri",
  "Luka Inti",
  "Jalur Spiritual",
  "Jejak Intuisi",
  "Pelajaran Jiwa",
  "Arah Evolusi",
  "Pola Self-Sabotage",
  "Ketakutan yang Tersembunyi",
  "Peta Chakra",
  "Ritme Energi Alami",
  "Kemampuan yang Perlu Dipelajari",
  "Arah Penyembuhan & Integrasi",
  "Potensi Matang",
];

function cleanText(value: unknown): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,!?])/g, "$1")
    .replace(/([.!?])([^\s])/g, "$1 $2")
    .trim();
}

function sentence(value: string): string {
  const isEn = isEnlEdition();
  let cleaned = cleanText(value);
  const replacement = isEn ? "layer of your self" : "lapisan dirimu";
  for (const title of RAW_READING_TITLES) {
    cleaned = cleaned.replace(new RegExp(`\\b${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g"), replacement);
  }
  if (!cleaned) return "";
  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
}

function capitalizeSentenceStarts(value: string): string {
  return cleanText(value).replace(/(^|[.!?]\s+)([a-zà-ÿ])/g, (_match, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`);
}

function field(source: Record<string, unknown> | undefined, path: string[]): string {
  let current: unknown = source;
  for (const key of path) {
    if (!current || typeof current !== "object") return "";
    current = (current as Record<string, unknown>)[key];
  }
  return cleanText(current);
}

function formatDate(dateKey: string, timezone: string): string {
  const isEn = isEnlEdition();
  const date = new Date(`${dateKey}T12:00:00`);
  return new Intl.DateTimeFormat(isEn ? "en-US" : "id-ID", {
    timeZone: timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function pick<T>(items: T[], seed: string, fallback: T): T {
  if (!items.length) return fallback;
  return items[hash(seed) % items.length];
}

function findReading(readings: ArsipAkashiProfileReading[], ids: string[], roomTitles: string[]): ArsipAkashiProfileReading | undefined {
  return readings.find((reading) => ids.includes(reading.id))
    ?? readings.find((reading) => roomTitles.includes(reading.roomTitle));
}

function short(reading: ArsipAkashiProfileReading | undefined, fallback: string): string {
  return sentence(reading?.shortMeaning || fallback);
}

function buildArsipBundle(viewModel: ArsipAkashiProfileViewModel, seed: string) {
  const isEn = isEnlEdition();
  const readings = viewModel.readings;
  const identity = findReading(readings, ["primary-archetype", "soul-identity"], ["SIAPA DIRIMU", "SOUL IDENTITY", "WHO YOU ARE"]);
  const mechanics = findReading(readings, ["energy-mechanics", "decision-rhythm"], ["ENERGI & MEKANIKA", "ENERGY & MECHANICS"]);
  const shadow = findReading(readings, ["shadow-pattern", "wound-pattern"], ["LUKA, BAYANGAN & WARISAN", "WOUNDS, SHADOW & HERITAGE"]);
  const work = findReading(readings, ["talent-economy", "career-direction"], ["KARYA & TALENTA", "WORK & TALENTS"]);
  const relation = findReading(readings, ["relationship-pattern", "love-pattern"], ["CINTA & RELASI", "LOVE & RELATIONSHIPS"]);
  const body = findReading(readings, ["body-environment", "environmental-sensitivity"], ["RAGA & RUANG", "BODY & SPACE"]);
  const phase = findReading(readings, ["current-life-phase", "semester-reading"], ["FASE KEHIDUPAN SAAT INI", "CURRENT LIFE PHASE"]);
  const spiritual = findReading(readings, ["spiritual-evolution"], ["SPIRITUALITAS & EVOLUSI", "SPIRITUALITY & EVOLUTION"]);
  const selected = [identity, mechanics, shadow, work, relation, body, phase, spiritual].filter(Boolean) as ArsipAkashiProfileReading[];
  const dailyAnchor = pick(selected, seed, selected[0] ?? readings[0]);

  return {
    available: readings.length > 0,
    coverageStatus: viewModel.status,
    identity: short(identity, isEn ? "your soul identity pattern is asking for a more whole presence" : "pola identitas jiwamu sedang meminta kehadiran yang lebih utuh"),
    mechanics: short(mechanics, isEn ? "your energy rhythm today needs to be read more honestly" : "ritme energimu hari ini perlu dibaca dengan lebih jujur"),
    shadow: short(shadow, isEn ? "there is an old pattern that is easier to see when you push yourself too hard" : "ada pola lama yang lebih mudah terlihat saat kamu terlalu memaksa diri"),
    work: short(work, isEn ? "today's work and talents move through simple yet real steps" : "karya dan talenta hari ini bergerak lewat langkah yang sederhana namun nyata"),
    relation: short(relation, isEn ? "today's relationships serve as a mirror for gentleness and healthy boundaries" : "relasi hari ini menjadi cermin untuk kelembutan dan batas sehat"),
    body: short(body, isEn ? "your body and surrounding space need to be your compass before making big decisions" : "tubuh dan ruang sekitar perlu menjadi kompas sebelum kamu mengambil keputusan besar"),
    phase: short(phase, isEn ? "your current life phase invites you to choose direction with greater maturity" : "fase hidup saat ini mengajakmu memilih arah dengan lebih matang"),
    spiritual: short(spiritual, isEn ? "your inner layer is strengthening as meaning is not separated from real life" : "lapisan batinmu sedang menguat saat makna tidak dipisahkan dari kehidupan nyata"),
    anchorTheme: short(dailyAnchor, isEn ? "the way you show up today is asking for a simpler direction" : "cara kamu hadir hari ini sedang meminta arah yang lebih sederhana"),
    contributingRooms: Array.from(new Set(selected.map((reading) => reading.roomTitle))).slice(0, 6),
  };
}

function buildAstrologyBundle(blueprint: Record<string, unknown>, localDateKey: string) {
  const isEn = isEnlEdition();
  const astrology = blueprint.astrology as Record<string, unknown> | undefined;
  const vedic = blueprint.vedic as Record<string, unknown> | undefined;
  const sun = field(astrology, ["sun", "sign"]) || field(astrology, ["sunSign"]);
  const moon = field(astrology, ["moon", "sign"]) || field(vedic, ["moonSign", "sign"]);
  const ascendant = field(astrology, ["ascendant", "sign"]) || field(vedic, ["lagna", "sign"]);
  const dasha = field(vedic, ["currentMahadasha", "planet"]);
  const dayNumber = Number(localDateKey.replace(/-/g, "")) || 0;
  const dailyTone = isEn
    ? ["organizing rhythm", "clarifying feelings", "strengthening boundaries", "opening conversations", "sorting priorities"][dayNumber % 5]
    : ["menata ritme", "menjernihkan rasa", "menguatkan batas", "membuka percakapan", "merapikan prioritas"][dayNumber % 5];

  return {
    available: Boolean(sun || moon || ascendant || dasha),
    sun: sun || (isEn ? "your natal sun pattern" : "pola matahari kelahiranmu"),
    moon: moon || (isEn ? "your natal emotional rhythm" : "irama emosional kelahiranmu"),
    ascendant: ascendant || (isEn ? "how your body meets the world" : "cara tubuhmu bertemu dunia"),
    dasha,
    dailyTone,
  };
}

function buildEnvironmentBundle(profile: Record<string, unknown>, blueprint: Record<string, unknown>, timezone: string) {
  const city = cleanText(profile.birthCity) || cleanText(profile.location) || cleanText(profile.city);
  const astrocartography = blueprint.astrocartography as Record<string, unknown> | undefined;
  const astroSignal = cleanText(astrocartography?.primaryLine || astrocartography?.summary || astrocartography?.theme);

  return {
    available: Boolean(timezone || city || astroSignal),
    city,
    timezone,
    astroSignal,
  };
}

function buildJourneyBundle(profile: Record<string, unknown>) {
  const journey = (profile.journeyState || profile.currentJourney || profile.journeyMemory || profile.wellnessJourney) as Record<string, unknown> | undefined;
  const stage = field(journey, ["stage"]) || field(journey, ["activeStage"]);
  const focus = field(journey, ["activeFocus"]) || field(journey, ["currentFocus"]) || field(journey, ["selectedIntention"]);
  const challenge = field(journey, ["currentChallenge"]) || field(journey, ["challenge"]);
  const action = field(journey, ["pendingAction"]) || field(journey, ["nextAction"]);

  return {
    available: Boolean(stage || focus || challenge || action),
    stage,
    focus,
    challenge,
    action,
  };
}

function category(
  insight: string,
  reason: string,
  advice: string,
  reflection?: string,
  metadata?: {
    sourceReadingIds: string[];
    sourceDomains: string[];
    contributingSystems?: string[];
  },
): DailyGuidanceCategory {
  return {
    insight: sentence(insight),
    reason: sentence(reason),
    advice: sentence(advice),
    reflection: reflection ? sentence(reflection) : undefined,
    ...(metadata ? metadata : {}),
  } as DailyGuidanceCategory;
}

function buildDailyCategories(input: {
  seed: string;
  arsip: ReturnType<typeof buildArsipBundle>;
  astrology: ReturnType<typeof buildAstrologyBundle>;
  environment: ReturnType<typeof buildEnvironmentBundle>;
  journey: ReturnType<typeof buildJourneyBundle>;
  state: "ready" | "limited";
}) {
  const isEn = isEnlEdition();
  const { seed, state } = input;
  const plan = (key: string, values: string[]) => pick(values, `${seed}:${state}:${key}`, values[0]);
  const accentLabel: Record<string, string> = isEn ? {
    general: "for your day's direction",
    mental: "for your mental clarity",
    finance: "for work and money matters",
    love: "for your heart's closeness",
    relational: "for your closest relationships",
    spiritual: "for your inner meaning",
    challenges: "for parts that feel heavy",
    opportunities: "for new spaces opening up",
  } : {
    general: "untuk arah harimu",
    mental: "untuk kejernihan pikiranmu",
    finance: "untuk urusan kerja dan uang",
    love: "untuk kedekatan hatimu",
    relational: "untuk hubungan terdekatmu",
    spiritual: "untuk makna batinmu",
    challenges: "untuk bagian yang terasa berat",
    opportunities: "untuk ruang baru yang terbuka",
  };
  const accent = (key: string) => {
    const label = accentLabel[key] ?? (isEn ? "for your steps" : "untuk langkahmu");
    const accentA = isEn ? [
      "choose calm",
      "reduce scale",
      "organize first",
      "keep rhythm",
      "wait until mature",
      "start close",
    ] : [
      "pilih tenang",
      "kecilkan ukuran",
      "rapikan dulu",
      "jaga ritme",
      "tunggu matang",
      "mulai dekat",
    ];
    const accentB = isEn ? [
      "make real",
      "check body",
      "avoid burdens",
      "give space",
      "speak clearly",
      "close clearly",
    ] : [
      "buat nyata",
      "cek tubuh",
      "hindari beban",
      "beri jeda",
      "ucap jernih",
      "tutup jelas",
    ];
    return `${plan(`${key}:accent-a`, accentA)} ${label}, ${isEn ? "then" : "lalu"} ${plan(`${key}:accent-b`, accentB)}`;
  };
  const adviceAccent = (key: string) => {
    const label = accentLabel[key] ?? (isEn ? "for your steps" : "untuk langkahmu");
    const closing = state === "limited"
      ? plan(`${key}:advice-closing-limited`, isEn ? ["gently", "slowly", "calmly"] : ["dengan lembut", "secara perlahan", "dengan tenang"])
      : plan(`${key}:advice-closing-ready`, isEn ? ["fully", "with confidence", "clearly"] : ["secara utuh", "dengan yakin", "dengan jernih"]);

    const adviceA = isEn ? [
      "choose light",
      "measure small",
      "be honest first",
      "start quietly",
      "set boundaries",
      "save energy",
    ] : [
      "pilih ringan",
      "ukur kecil",
      "jujur dulu",
      "mulai senyap",
      "beri batas",
      "hemat tenaga",
    ];
    const adviceB = isEn ? [
      "finish first",
      "check body",
      "just start",
      "take a breath",
      "speak clearly",
      "create proof",
    ] : [
      "selesai dulu",
      "cek tubuh",
      "cukup mulai",
      "ambil napas",
      "bicara jernih",
      "buat bukti",
    ];

    return `${plan(`${key}:advice-accent-a`, adviceA)} ${label}, ${isEn ? "then" : "lalu"} ${plan(`${key}:advice-accent-b`, adviceB)} ${closing}`;
  };
  const context = state === "limited"
    ? (isEn
        ? "Today is healthiest lived with simple steps, as some things still need to be viewed slowly."
        : "Hari ini lebih sehat dijalani dengan langkah yang sederhana, karena beberapa hal masih perlu kamu lihat pelan-pelan.")
    : (isEn
        ? "Today offers enough room to move more consciously without losing peace."
        : "Hari ini memberi cukup ruang untuk bergerak lebih sadar tanpa kehilangan rasa tenang.");

  if (isEn) {
    return {
      general: category(
        plan("general-theme", [
          "Your daily direction points to the need to organize steps without forcing everything to finish at once.",
          "Today feels like an invitation to choose what truly matters and what only scatters you.",
          "Today's main direction is to show up more fully for small things you can nurture to completion.",
        ]),
        context,
        plan("general-advice", [
          `Choose one most real priority, then ${adviceAccent("general")}.`,
          `Close one small matter before opening new loads; ${adviceAccent("general")}.`,
          `Start with what you can hold today, then ${adviceAccent("general")}.`,
        ]),
        plan("general-reflection", [
          `If many choices seem attractive, ${accent("general")}.`,
          `The right decision today usually feels calmer; ${accent("general")}.`,
          `You don't need to prove everything in one day; ${accent("general")}.`,
        ]),
        {
          sourceReadingIds: ["primary-archetype", "how-you-show-up", "current-life-semester-1", "current-life-semester-2"],
          sourceDomains: ["identity", "growth", "timing"],
        },
      ),
      mental: category(
        plan("mental-theme", [
          "Your mind is clearer today when you create space between initial impulses and final decisions.",
          "There is a need to distinguish inner voices, fear, and facts that can actually be examined.",
          "Your way of thinking is stronger when not all questions are forced to resolution at once.",
        ]),
        plan("mental-tension", [
          "Tension arises when the head wants to confirm something quickly, while the body still asks for a pause.",
          "Confusion can grow if you read all possibilities as equally important.",
          "The mind easily tires if you keep holding decisions that can actually be made in stages.",
        ]),
        plan("mental-advice", [
          `Write down one main decision, one honest reason, then ${adviceAccent("mental")}.`,
          `Before answering something important, ${adviceAccent("mental")}.`,
          `Separate facts from assumptions, then ${adviceAccent("mental")}.`,
        ]),
        plan("mental-reflection", [
          `Clarity today grows from the courage not to react immediately; ${accent("mental")}.`,
          `The simpler the question, the easier mature answers emerge; ${accent("mental")}.`,
          `Your mind doesn't have to win fast; ${accent("mental")}.`,
        ]),
        {
          sourceReadingIds: ["mindset-meaning", "decision-making", "focus-productivity"],
          sourceDomains: ["identity", "mechanics", "talents"],
        },
      ),
      finance: category(
        plan("finance-theme", [
          "Economy and income today ask for orderly decisions, not movement born only of anxiety.",
          "Work and money areas feel healthier when you assess capacity honestly.",
          "Financial responsibilities today are easier to maintain through small, measurable steps.",
        ]),
        plan("finance-tension", [
          "Tension arises when you want to feel safe quickly, but haven't looked at numbers and commitments calmly.",
          "There is a risk of taking on too much load if you equate being productive with being constantly available.",
          "Scarcity feelings can make opportunities look urgent, when some just need to be reviewed more slowly.",
        ]),
        plan("finance-advice", [
          `Check one income-expense stream or one work commitment, then ${adviceAccent("finance")}.`,
          `Tidy up one number, one deadline, or one agreement; ${adviceAccent("finance")}.`,
          `Choose work that yields the clearest result today, then ${adviceAccent("finance")}.`,
        ]),
        plan("finance-reflection", [
          `Today's sustenance is closer to orderliness than self-proof; ${accent("finance")}.`,
          `Your self-worth doesn't need to be proven by taking all opportunities at once; ${accent("finance")}.`,
          `Mature economic steps often feel simple; ${accent("finance")}.`,
        ]),
        {
          sourceReadingIds: ["economy-income", "money-block", "natural-talents", "work-style", "career-direction"],
          sourceDomains: ["resources", "shadow", "talents", "growth"],
        },
      ),
      love: category(
        plan("love-theme", [
          "In romance, closeness today calls for gentle honesty rather than guesswork.",
          "The heart calms down more easily when emotional needs are stated simply.",
          "Love today supports closeness that is slow, honest, and not forcing certainty.",
        ]),
        plan("love-tension", [
          "Tension arises if you expect to be understood without giving language to your needs.",
          "Part of you may want closeness, but still fears appearing overly needy.",
          "Closeness can feel heavy if personal boundaries are stated too late.",
        ]),
        plan("love-advice", [
          `State one need in a short sentence, then ${adviceAccent("love")}.`,
          `Choose conversations that are warm yet clear; ${adviceAccent("love")}.`,
          `Protect your gentleness with understandable boundaries, then ${adviceAccent("love")}.`,
        ]),
        plan("love-reflection", [
          `Healthy love today doesn't have to be dramatic to feel genuine; ${accent("love")}.`,
          `Closeness grows when you stop asking others to guess everything; ${accent("love")}.`,
          `Honest boundaries can be a form of affection; ${accent("love")}.`,
        ]),
        {
          sourceReadingIds: ["emotional-needs-relationship", "love-block-patterns", "attraction-patterns", "conflict-communication"],
          sourceDomains: ["relationships", "shadow", "growth"],
        },
      ),
      relational: category(
        plan("relational-theme", [
          "Those closest to you today can show how you care for yourself while staying connected.",
          "Social and family relationships call for slower responses so old wounds don't lead.",
          "Close connections feel healthier when roles, boundaries, and expectations are not left blurry.",
        ]),
        plan("relational-tension", [
          "Tension arises when you want to keep peace, but the body begins storing objections.",
          "There is an urge to explain too much or close off too quickly.",
          "You can tire easily if you keep holding up the mood without checking your capacity.",
        ]),
        plan("relational-advice", [
          `Choose one conversation that needs slowing down, then ${adviceAccent("relational")}.`,
          `State one small boundary before it becomes distance, then ${adviceAccent("relational")}.`,
          `Reduce automatic responses and ${adviceAccent("relational")}.`,
        ]),
        plan("relational-reflection", [
          `You are allowed to love others without ignoring your own needs; ${accent("relational")}.`,
          `Healthy relationships provide room to speak clearly; ${accent("relational")}.`,
          `Closeness today grows from conscious responses; ${accent("relational")}.`,
        ]),
        {
          sourceReadingIds: ["social-family-patterns", "conflict-communication", "protection-mechanisms", "core-wounds"],
          sourceDomains: ["relationships", "shadow", "karma"],
        },
      ),
      spiritual: category(
        plan("spiritual-theme", [
          "Inner meaning today feels most alive when translated into simple action.",
          "Guidance from within is easier to hear when you don't pursue it tense.",
          "Spirituality today asks for grounded presence, not experiences that must seem grand.",
        ]),
        plan("spiritual-tension", [
          "Tension arises when you want to understand everything immediately, when some meaning needs to mature slowly.",
          "Intuition can be blocked if you force it into rigid certainty.",
          "Subtle inner feelings are hard to read if the body is tired and the schedule is full.",
        ]),
        plan("spiritual-advice", [
          `Create one short practice like silence, prayer, journaling, or a kind act, then ${adviceAccent("spiritual")}.`,
          `Let intuition give direction, then ${adviceAccent("spiritual")}.`,
          `Choose one silent moment and ${adviceAccent("spiritual")}.`,
        ]),
        plan("spiritual-reflection", [
          `True meaning usually makes you more present, not more fearful; ${accent("spiritual")}.`,
          `Today, what is sacred can exist in how you work and care for your body; ${accent("spiritual")}.`,
          `Inner depth doesn't need to be proven; ${accent("spiritual")}.`,
        ]),
        {
          sourceReadingIds: ["spiritual-path", "intuition-traces", "soul-lessons", "evolution-direction", "soul-identity"],
          sourceDomains: ["spirituality", "identity", "growth"],
        },
      ),
      challenges: category(
        plan("challenges-theme", [
          "What feels heavy today likely comes from small pressures held for too long.",
          "The most sensitive part today asks for attention before turning into a sharp reaction.",
          "Today's load is not just about the volume of tasks, but how your body holds everything.",
        ]),
        plan("challenges-tension", [
          "Tension arises when you force yourself to look strong, when energy is asking for limits.",
          "Old patterns can activate when you feel you must control outcomes or avoid discomfort.",
          "The body can signal first before the mind admits that you are full.",
        ]),
        plan("challenges-advice", [
          `Reduce one exposure, task, or conversation, then ${adviceAccent("challenges")}.`,
          `Take a short pause before answering defensive triggers, then ${adviceAccent("challenges")}.`,
          `Choose boundaries achievable today and ${adviceAccent("challenges")}.`,
        ]),
        plan("challenges-reflection", [
          `Boundaries today are not obstacles, but ways to keep your direction alive; ${accent("challenges")}.`,
          `You don't need to wait for a breakdown to admit something feels heavy; ${accent("challenges")}.`,
          `When the body feels safer, your decisions are also clearer; ${accent("challenges")}.`,
        ]),
        {
          sourceReadingIds: ["core-wounds", "self-sabotage-patterns", "hidden-fears", "chakra-map", "natural-energy-rhythm"],
          sourceDomains: ["shadow", "karma", "health", "mechanics"],
        },
      ),
      opportunities: category(
        plan("opportunities-theme", [
          "New space today opens from the courage to try small steps previously delayed.",
          "Opportunities today don't have to be big; they can appear as one knot you finally untangle.",
          "New directions feel closer when you give form to intentions long living inside.",
        ]),
        plan("opportunities-tension", [
          "The challenge is not underestimating small steps just because they don't look like big results yet.",
          "There are opportunities that need to be tested slowly so they don't become new burdens.",
          "The future can feel distant if you wait for all conditions to feel perfect.",
        ]),
        plan("opportunities-advice", [
          `Test one small skill, message, or decision, then ${adviceAccent("opportunities")}.`,
          `Start with practice finished today and ${adviceAccent("opportunities")}.`,
          `Choose one knot that can be untangled, then ${adviceAccent("opportunities")}.`,
        ]),
        plan("opportunities-reflection", [
          `New space often comes after finishing a small thing long left hanging; ${accent("opportunities")}.`,
          `What grows today doesn't need to be announced immediately; ${accent("opportunities")}.`,
          `The future feels friendlier when approached through steps that can be maintained; ${accent("opportunities")}.`,
        ]),
        {
          sourceReadingIds: ["career-direction", "skills-to-learn", "healing-integration-direction", "current-life-semester-1", "matured-potential"],
          sourceDomains: ["talents", "growth", "shadow", "timing"],
        },
      ),
      advice: category(
        plan("global-advice-1", [
          "Today does not need to be a big proof; simply choose one step that makes you more present.",
          "Protect boundaries, choose real steps, and give your body a chance to feel safe.",
          "Move with a small size that can be completed without betraying your rhythm.",
        ]),
        plan("global-advice-2", [
          "Alignment today grows when inner meaning meets realistic action.",
          "What matters is not moving fastest, but moving from a more honest place.",
          "Let today teach you to choose what is enough, rather than chasing perfection.",
        ]),
        "Move with a small size that can be completed",
        "Alignment today grows when inner meaning meets realistic action",
      ),
    };
  }

  return {
    general: category(
      plan("general-theme", [
        "Kabar harimu mengarah pada kebutuhan untuk merapikan langkah tanpa memaksa semua hal selesai sekaligus.",
        "Hari ini terasa seperti ajakan untuk kembali memilih mana yang benar-benar penting dan mana yang hanya membuatmu tersebar.",
        "Arah utama hari ini adalah hadir lebih utuh pada hal kecil yang bisa kamu rawat sampai selesai.",
      ]),
      context,
      plan("general-advice", [
        `Pilih satu prioritas yang paling nyata, lalu ${adviceAccent("general")}.`,
        `Tutup satu urusan kecil sebelum membuka beban baru; ${adviceAccent("general")}.`,
        `Mulailah dari hal yang bisa kamu pegang hari ini, lalu ${adviceAccent("general")}.`,
      ]),
      plan("general-reflection", [
        `Jika banyak pilihan terasa menarik, ${accent("general")}.`,
        `Keputusan yang tepat hari ini biasanya terasa lebih tenang; ${accent("general")}.`,
        `Kamu tidak perlu membuktikan semuanya dalam satu hari; ${accent("general")}.`,
      ]),
      {
        sourceReadingIds: ["arketipe-utama", "cara-hadir-di-dunia", "current-life-semester-1", "current-life-semester-2"],
        sourceDomains: ["identity", "growth", "timing"],
      },
    ),
    mental: category(
      plan("mental-theme", [
        "Pikiranmu hari ini lebih jernih saat kamu memberi jarak antara dorongan pertama dan keputusan akhir.",
        "Ada kebutuhan untuk memilah suara batin, rasa takut, dan fakta yang benar-benar bisa diperiksa.",
        "Cara berpikirmu lebih kuat ketika tidak semua pertanyaan dipaksa selesai dalam satu waktu.",
      ]),
      plan("mental-tension", [
        "Tegangnya muncul ketika kepala ingin cepat memastikan sesuatu, sementara tubuh masih meminta jeda.",
        "Kebingungan bisa membesar bila kamu membaca semua kemungkinan sebagai hal yang sama pentingnya.",
        "Pikiran akan mudah lelah jika kamu terus memegang keputusan yang sebenarnya bisa dibuat bertahap.",
      ]),
      plan("mental-advice", [
        `Tulis satu keputusan utama, satu alasan yang jujur, lalu ${adviceAccent("mental")}.`,
        `Sebelum menjawab sesuatu yang penting, ${adviceAccent("mental")}.`,
        `Pisahkan fakta dari asumsi, lalu ${adviceAccent("mental")}.`,
      ]),
      plan("mental-reflection", [
        `Kejernihan hari ini tumbuh dari keberanian untuk tidak langsung bereaksi; ${accent("mental")}.`,
        `Semakin sederhana pertanyaannya, semakin mudah jawaban matang muncul; ${accent("mental")}.`,
        `Pikiranmu tidak harus menang cepat; ${accent("mental")}.`,
      ]),
      {
        sourceReadingIds: ["cara-berpikir-memaknai", "cara-mengambil-keputusan", "fokus-produktivitas-konsistensi"],
        sourceDomains: ["identity", "mechanics", "talents"],
      },
    ),
    finance: category(
      plan("finance-theme", [
        "Ekonomi dan rezeki hari ini meminta keputusan yang rapi, bukan gerakan yang hanya lahir dari cemas.",
        "Area kerja dan uang terasa lebih sehat ketika kamu menilai kapasitas dengan jujur.",
        "Tanggung jawab finansial hari ini lebih mudah dijaga lewat langkah kecil yang bisa diukur.",
      ]),
      plan("finance-tension", [
        "Tegangnya muncul saat kamu ingin merasa aman cepat, tetapi belum melihat angka dan komitmen dengan tenang.",
        "Ada risiko mengambil terlalu banyak beban bila kamu menyamakan produktif dengan selalu tersedia.",
        "Rasa kurang bisa membuat peluang terlihat mendesak, padahal sebagian hanya perlu ditinjau lebih pelan.",
      ]),
      plan("finance-advice", [
        `Cek satu arus masuk-keluar atau satu komitmen kerja, lalu ${adviceAccent("finance")}.`,
        `Rapikan satu angka, satu tenggat, atau satu kesepakatan; ${adviceAccent("finance")}.`,
        `Pilih pekerjaan yang paling memberi hasil jelas hari ini, lalu ${adviceAccent("finance")}.`,
      ]),
      plan("finance-reflection", [
        `Rezeki hari ini lebih dekat dengan ketertiban daripada pembuktian diri; ${accent("finance")}.`,
        `Nilai dirimu tidak perlu dibuktikan dengan mengambil semua peluang sekaligus; ${accent("finance")}.`,
        `Langkah ekonomi yang matang sering terasa sederhana; ${accent("finance")}.`,
      ]),
      {
        sourceReadingIds: ["ekonomi-pola-penghasilan", "money-block", "talenta-alami", "gaya-kerja", "arah-karya-kontribusi"],
        sourceDomains: ["resources", "shadow", "talents", "growth"],
      },
    ),
    love: category(
      plan("love-theme", [
        "Dalam asmara, kedekatan hari ini meminta kejujuran yang lembut dan tidak penuh tebakan.",
        "Hati lebih mudah tenang ketika kebutuhan emosional disebut dengan sederhana.",
        "Percintaan hari ini mendukung kedekatan yang pelan, jujur, dan tidak memaksa kepastian.",
      ]),
      plan("love-tension", [
        "Tegangnya muncul bila kamu berharap dimengerti tanpa memberi bahasa pada kebutuhanmu.",
        "Ada bagian yang bisa ingin dekat, tetapi tetap takut terlihat terlalu membutuhkan.",
        "Kedekatan dapat terasa berat jika batas pribadi terlambat disebut.",
      ]),
      plan("love-advice", [
        `Ucapkan satu kebutuhan dengan kalimat pendek, lalu ${adviceAccent("love")}.`,
        `Pilih percakapan yang hangat tetapi jelas; ${adviceAccent("love")}.`,
        `Jaga kelembutanmu dengan batas yang bisa dipahami, lalu ${adviceAccent("love")}.`,
      ]),
      plan("love-reflection", [
        `Cinta yang sehat hari ini tidak harus dramatis untuk terasa sungguh-sungguh; ${accent("love")}.`,
        `Kedekatan tumbuh saat kamu berhenti meminta orang lain menebak semuanya; ${accent("love")}.`,
        `Batas yang jujur bisa menjadi bentuk kasih; ${accent("love")}.`,
      ]),
      {
        sourceReadingIds: ["kebutuhan-emosional-relasi", "love-block-pola-berulang", "pola-ketertarikan-pasangan", "konflik-komunikasi-batas"],
        sourceDomains: ["relationships", "shadow", "growth"],
      },
    ),
    relational: category(
      plan("relational-theme", [
        "Orang terdekat hari ini bisa memperlihatkan bagaimana kamu menjaga diri saat tetap ingin terhubung.",
        "Hubungan sosial dan keluarga meminta respons yang lebih pelan agar tidak dipimpin luka lama.",
        "Koneksi terdekat terasa lebih sehat ketika peran, batas, dan harapan tidak dibiarkan kabur.",
      ]),
      plan("relational-tension", [
        "Tegangnya muncul saat kamu ingin menjaga damai, tetapi tubuh mulai menyimpan keberatan.",
        "Ada dorongan untuk menjelaskan terlalu banyak atau menutup diri terlalu cepat.",
        "Kamu bisa mudah lelah jika terus menjadi penyangga suasana tanpa memeriksa kapasitasmu.",
      ]),
      plan("relational-advice", [
        `Pilih satu percakapan yang perlu diperlambat, lalu ${adviceAccent("relational")}.`,
        `Sebutkan satu batas kecil sebelum ia menjadi jarak, lalu ${adviceAccent("relational")}.`,
        `Kurangi respons otomatis dan ${adviceAccent("relational")}.`,
      ]),
      plan("relational-reflection", [
        `Kamu tetap boleh menyayangi orang lain tanpa mengabaikan kebutuhanmu sendiri; ${accent("relational")}.`,
        `Hubungan yang sehat memberi ruang untuk bicara jelas; ${accent("relational")}.`,
        `Kedekatan hari ini tumbuh dari respons yang sadar; ${accent("relational")}.`,
      ]),
      {
        sourceReadingIds: ["pola-relasi-sosial-keluarga", "konflik-komunikasi-batas", "mekanisme-perlindungan", "luka-inti"],
        sourceDomains: ["relationships", "shadow", "karma"],
      },
    ),
    spiritual: category(
      plan("spiritual-theme", [
        "Makna batin hari ini terasa paling hidup ketika turun menjadi tindakan yang sederhana.",
        "Bimbingan dari dalam diri lebih mudah terdengar saat kamu tidak mengejarnya dengan tegang.",
        "Spiritualitas hari ini meminta kehadiran yang membumi, bukan pengalaman yang harus terlihat besar.",
      ]),
      plan("spiritual-tension", [
        "Tegangnya muncul ketika kamu ingin segera memahami semuanya, padahal sebagian makna perlu matang pelan-pelan.",
        "Intuisi bisa tertutup bila kamu memaksanya menjadi kepastian yang kaku.",
        "Rasa batin yang halus akan sulit dibaca jika tubuh terlalu lelah dan agenda terlalu penuh.",
      ]),
      plan("spiritual-advice", [
        `Buat satu praktik pendek seperti hening, doa, journaling, atau tindakan baik, lalu ${adviceAccent("spiritual")}.`,
        `Biarkan intuisi memberi arah, lalu ${adviceAccent("spiritual")}.`,
        `Pilih satu momen sunyi dan ${adviceAccent("spiritual")}.`,
      ]),
      plan("spiritual-reflection", [
        `Makna yang sejati biasanya membuatmu lebih hadir, bukan lebih takut; ${accent("spiritual")}.`,
        `Hari ini, yang sakral bisa hadir dalam cara kamu bekerja dan merawat tubuh; ${accent("spiritual")}.`,
        `Kedalaman batin tidak perlu dibuktikan; ${accent("spiritual")}.`,
      ]),
      {
        sourceReadingIds: ["jalur-spiritual", "jejak-intuisi", "pelajaran-jiwa", "arah-evolusi", "soul-identity"],
        sourceDomains: ["spirituality", "identity", "growth"],
      },
    ),
    challenges: category(
      plan("challenges-theme", [
        "Yang terasa berat hari ini kemungkinan datang dari tekanan kecil yang terlalu lama kamu tahan.",
        "Bagian yang paling sensitif hari ini meminta perhatian sebelum berubah menjadi reaksi tajam.",
        "Beban hari ini bukan hanya soal banyaknya urusan, tetapi cara tubuhmu memegang semuanya.",
      ]),
      plan("challenges-tension", [
        "Tegangnya muncul ketika kamu tetap memaksa diri terlihat kuat, padahal energi sedang meminta batas.",
        "Pola lama bisa aktif saat kamu merasa harus mengontrol hasil atau menghindari rasa tidak nyaman.",
        "Tubuh dapat memberi sinyal lebih dulu sebelum pikiran mengakui bahwa kamu sedang penuh.",
      ]),
      plan("challenges-advice", [
        `Kurangi satu paparan, tugas, atau percakapan, lalu ${adviceAccent("challenges")}.`,
        `Ambil jeda pendek sebelum menjawab hal yang memancing defensif, lalu ${adviceAccent("challenges")}.`,
        `Pilih batas yang bisa dilakukan hari ini dan ${adviceAccent("challenges")}.`,
      ]),
      plan("challenges-reflection", [
        `Batas hari ini bukan penghalang, melainkan cara menjaga arahmu tetap hidup; ${accent("challenges")}.`,
        `Kamu tidak perlu menunggu tumbang untuk mengakui bahwa sesuatu terasa berat; ${accent("challenges")}.`,
        `Saat tubuh lebih aman, keputusanmu juga lebih mudah jernih; ${accent("challenges")}.`,
      ]),
      {
        sourceReadingIds: ["luka-inti", "pola-self-sabotage", "ketakutan-tersembunyi", "peta-chakra", "ritme-energi-alami"],
        sourceDomains: ["shadow", "karma", "health", "mechanics"],
      },
    ),
    opportunities: category(
      plan("opportunities-theme", [
        "Ruang baru hari ini terbuka dari keberanian mencoba langkah kecil yang selama ini tertunda.",
        "Peluang hari ini tidak harus besar; ia bisa muncul sebagai satu simpul yang akhirnya kamu rapikan.",
        "Arah baru terasa lebih dekat ketika kamu memberi bentuk pada niat yang sudah lama hidup di dalam diri.",
      ]),
      plan("opportunities-tension", [
        "Tantangannya adalah tidak meremehkan langkah kecil hanya karena ia belum terlihat seperti hasil besar.",
        "Ada peluang yang perlu diuji pelan-pelan agar tidak berubah menjadi beban baru.",
        "Masa depan bisa terasa jauh bila kamu menunggu semua syarat terasa sempurna.",
      ]),
      plan("opportunities-advice", [
        `Uji satu kemampuan kecil, satu pesan, atau satu keputusan, lalu ${adviceAccent("opportunities")}.`,
        `Mulai dari latihan yang bisa selesai hari ini dan ${adviceAccent("opportunities")}.`,
        `Pilih satu simpul yang bisa dirapikan, lalu ${adviceAccent("opportunities")}.`,
      ]),
      plan("opportunities-reflection", [
        `Ruang baru sering datang setelah kamu menyelesaikan hal kecil yang lama menggantung; ${accent("opportunities")}.`,
        `Yang bertumbuh hari ini tidak perlu langsung diumumkan; ${accent("opportunities")}.`,
        `Masa depan terasa lebih ramah saat didekati lewat langkah yang bisa dijaga; ${accent("opportunities")}.`,
      ]),
      {
        sourceReadingIds: ["arah-karya-kontribusi", "kemampuan-perlu-dipelajari", "arah-penyembuhan-integrasi", "current-life-semester-1", "potensi-matang"],
        sourceDomains: ["talents", "growth", "shadow", "timing"],
      },
    ),
    advice: category(
      plan("global-advice-1", [
        "Hari ini tidak perlu menjadi pembuktian besar; cukup pilih satu langkah yang membuatmu lebih hadir.",
        "Jaga batas, pilih langkah nyata, dan beri tubuh kesempatan untuk ikut merasa aman.",
        "Bergeraklah dengan ukuran kecil yang bisa selesai tanpa mengkhianati ritmemu.",
      ]),
      plan("global-advice-2", [
        "Keselarasan hari ini tumbuh saat makna batin bertemu tindakan yang realistis.",
        "Yang penting bukan bergerak paling cepat, melainkan bergerak dari tempat yang lebih jujur.",
        "Biarkan hari ini mengajarimu memilih yang cukup, bukan mengejar yang sempurna.",
      ]),
      "Bergeraklah dengan ukuran kecil yang bisa selesai",
      "Keselarasan hari ini tumbuh saat makna batin bertemu tindakan yang realistis",
    ),
  };
}

function buildParagraphs(input: {
  name: string;
  dateLabel: string;
  seed: string;
  arsip: ReturnType<typeof buildArsipBundle>;
  astrology: ReturnType<typeof buildAstrologyBundle>;
  environment: ReturnType<typeof buildEnvironmentBundle>;
  journey: ReturnType<typeof buildJourneyBundle>;
  state: "ready" | "limited";
}) {
  const isEn = isEnlEdition();
  const { name, dateLabel, seed, state } = input;
  const plan = (key: string, values: string[]) => pick(values, `${seed}:${state}:${key}`, values[0]);

  if (isEn) {
    const dayOpening = state === "limited"
      ? "Today is better read gently, without forcing answers that are not yet mature."
      : "Today offers room to move more consciously, as long as you do not split your attention in too many directions.";
    const energyPlan = plan("paragraph-energy", [
      "Your daily movement is healthiest when starting from one real priority, then kept until finished.",
      "Today's energy tends to improve when you stop chasing all doors and choose one direction that can be nurtured.",
      "Today's best rhythm comes from slow, clear decisions not made out of fear of missing out.",
    ]);
    const mindPlan = plan("paragraph-mind", [
      "Your mind needs space to distinguish impulses, assumptions, and actual facts.",
      "Clarity emerges when you pause before answering something that feels important.",
      "Today, your head does not need to win all possibilities; it only needs to help you choose consciously.",
    ]);
    const pressurePlan = plan("paragraph-pressure", [
      "The pressure that arises is likely not a sign of failure, but a signal that boundaries need to be made more humane.",
      "Parts that feel heavy need to be heard before turning into hasty reactions.",
      "If your body feels full, it could be an invitation to lighten the load and return to essentials.",
    ]);
    const relationPlan = plan("paragraph-relation", [
      "In relationships, gentleness will be stronger when accompanied by clear language.",
      "Those closest to you can be a mirror, but you still need to choose responses that don't ignore yourself.",
      "Closeness today grows through simple conversations, not guesswork left to accumulate.",
    ]);
    const actionPlan = plan("paragraph-action", [
      "Today's best action is completing one small matter that makes life feel more organized.",
      "Choose one touchable step: a message answered, a schedule organized, or a boundary spoken calmly.",
      "New space opens when one knot is finished and your energy is no longer held in hanging matters.",
    ]);

    const centralTheme = pick([
      "showing up more simply without losing direction",
      "organizing priorities while still listening to feelings",
      "strengthening small steps that can truly be maintained",
      "protecting boundaries so energy is not scattered",
      "bringing inner meaning into real action",
    ], `${seed}:conclusion-theme`, "showing up more simply without losing direction");
    const innerPattern = pick([
      "rushing answers when your sense of safety actually asks for a pause",
      "taking on too much load just to look okay",
      "postponing honesty out of fear of disturbing closeness",
      "comparing your process until small directions feel unworthy",
      "closing body signals when the mind wants to maintain control",
    ], `${seed}:conclusion-pattern`, "rushing answers when your sense of safety actually asks for a pause");
    const practicalDirection = pick([
      "completing one real matter with a more humane rhythm",
      "choosing one conversation that needs to be made clearer",
      "organizing one work, money, or home responsibility decision",
      "giving the body a pause before adding new loads",
      "turning one inner intention into a small finished action",
    ], `${seed}:conclusion-practice`, "completing one real matter with a more humane rhythm");
    const conclusionAccent = pick([
      "Keep a rhythm that makes your body feel safe.",
      "Let small steps be proof that your direction is alive.",
      "Choose a response that is more honest than fast.",
      "Nurture boundaries so energy isn't exhausted before important things finish.",
      "Return to simple things when the mind gets noisy.",
      "Finish the closest thing before chasing further things.",
      "Give space to calm decisions, not just urgent ones.",
      "Let your body be a reminder when ambition moves too fast.",
      "Choose one action that makes life feel a bit cleaner.",
      "Do not ignore small needs that quietly determine your day's quality.",
    ], `${seed}:conclusion-accent:${hash(seed) % 97}`, "Keep a rhythm that makes your body feel safe.");
    const conclusionText = capitalizeSentenceStarts(`Your main theme today is ${centralTheme}. The inner pattern to watch most is the tendency to ${innerPattern}. The healthiest practical direction is ${practicalDirection}. If important relationships or decisions arise, give space before responding so you don't move out of fear. ${conclusionAccent}`);
    const conclusion = sentence(`Today's Conclusion: ${conclusionText}`);

    return {
      paragraphs: [
        sentence(`${name}, ${dateLabel} brings an invitation to re-read your direction more slowly yet clearly. ${dayOpening} What stands out most today is the need to show up more simply, because not everything needs to be answered with equal energy. This is not an absolute prediction, but a reflective space so you can recognize active parts of yourself.`),
        sentence(`${energyPlan} In daily practice, the urge to move needs to be accompanied by a simple question about capacity. If you feel like finishing many things at once, read that as a signal to sort what is truly alive. Today supports a rhythmic decision over a forced one.`),
        sentence(`${mindPlan} A sense of safety will form more easily when you don't turn every thought into an order. If a decision is not yet clear, give it time without ignoring existing responsibilities. What is sought today is not the fastest answer, but the choice you can walk through calmly.`),
        sentence(`${pressurePlan} Shadow does not need to be fought fiercely, because it usually arises when a part of you has worked too long without being heard. If the body gets tense, the mind judges quickly, or the heart wants to close, return to simpler steps first. Today's awareness is not about being perfect, but about stopping automatic repetition of old responses.`),
        sentence(`${relationPlan} Because of that, the right action doesn't have to be big, but specific enough to make your life feel more organized. Choose one conversation, one task, or one body decision you can nurture to completion. The clearer your step size, the less likely you move from pressure.`),
        sentence(`${actionPlan} If you want to move forward, start from touchable things that require no drama. Today's inner meaning will feel stronger when translated into simple behavior. The more you respect this small rhythm, the easier big directions feel unthreatening.`),
        conclusion,
      ],
      conclusion: conclusionText,
    };
  }

  const dayOpening = state === "limited"
    ? "Hari ini lebih baik dibaca dengan lembut, tanpa memaksa jawaban yang belum matang."
    : "Hari ini memberi ruang untuk bergerak lebih sadar, selama kamu tidak memecah perhatian ke terlalu banyak arah.";
  const energyPlan = plan("paragraph-energy", [
    "Gerak harianmu paling sehat saat dimulai dari satu prioritas yang nyata, lalu dijaga sampai selesai.",
    "Energi hari ini cenderung membaik ketika kamu berhenti mengejar semua pintu dan memilih satu arah yang bisa dirawat.",
    "Ritme terbaik hari ini datang dari keputusan yang pelan, jelas, dan tidak dibuat hanya karena takut tertinggal.",
  ]);
  const mindPlan = plan("paragraph-mind", [
    "Pikiranmu membutuhkan ruang untuk membedakan dorongan, asumsi, dan fakta yang benar-benar ada.",
    "Kejernihan muncul ketika kamu memberi jeda sebelum menjawab hal yang terasa penting.",
    "Hari ini, kepala tidak perlu memenangkan semua kemungkinan; ia hanya perlu menemanimu memilih dengan sadar.",
  ]);
  const pressurePlan = plan("paragraph-pressure", [
    "Tekanan yang muncul kemungkinan bukan tanda kamu gagal, melainkan sinyal bahwa batas perlu dibuat lebih manusiawi.",
    "Bagian yang terasa berat perlu didengar sebelum berubah menjadi reaksi yang terlalu cepat.",
    "Jika tubuh terasa penuh, itu bisa menjadi undangan untuk mengurangi beban dan kembali ke hal yang esensial.",
  ]);
  const relationPlan = plan("paragraph-relation", [
    "Dalam hubungan, kelembutan akan lebih kuat bila ditemani bahasa yang jelas.",
    "Orang terdekat bisa menjadi cermin, tetapi kamu tetap perlu memilih respons yang tidak mengabaikan dirimu sendiri.",
    "Kedekatan hari ini tumbuh lewat percakapan yang sederhana, bukan lewat tebakan yang dibiarkan menumpuk.",
  ]);
  const actionPlan = plan("paragraph-action", [
    "Aksi terbaik hari ini adalah menyelesaikan satu urusan kecil yang membuat hidup terasa lebih tertata.",
    "Pilih satu langkah yang bisa disentuh: pesan yang dijawab, jadwal yang dirapikan, atau batas yang diucapkan dengan tenang.",
    "Ruang baru terbuka ketika satu simpul selesai dan energimu tidak lagi tertahan di hal yang menggantung.",
  ]);

  const centralTheme = pick([
    "hadir lebih sederhana tanpa kehilangan arah",
    "merapikan prioritas sambil tetap mendengar rasa",
    "menguatkan langkah kecil yang benar-benar bisa dijaga",
    "menjaga batas agar energi tidak tercecer",
    "membawa makna batin ke tindakan yang nyata",
  ], `${seed}:conclusion-theme`, "hadir lebih sederhana tanpa kehilangan arah");
  const innerPattern = pick([
    "mempercepat jawaban saat rasa amanmu sebenarnya meminta jeda",
    "mengambil terlalu banyak beban agar terlihat baik-baik saja",
    "menunda kejujuran karena takut mengganggu kedekatan",
    "membandingkan prosesmu sampai arah kecil terasa kurang berharga",
    "menutup sinyal tubuh ketika pikiran ingin terus memegang kendali",
  ], `${seed}:conclusion-pattern`, "mempercepat jawaban saat rasa amanmu sebenarnya meminta jeda");
  const practicalDirection = pick([
    "menyelesaikan satu urusan nyata dengan ritme yang lebih manusiawi",
    "memilih satu percakapan yang perlu dibuat lebih jernih",
    "merapikan satu keputusan kerja, uang, atau tanggung jawab rumah",
    "memberi tubuh jeda sebelum kamu menambah beban baru",
    "mengubah satu niat batin menjadi tindakan kecil yang selesai",
  ], `${seed}:conclusion-practice`, "menyelesaikan satu urusan nyata dengan ritme yang lebih manusiawi");
  const conclusionAccent = pick([
    "Jaga ritme yang membuat tubuh ikut merasa aman.",
    "Biarkan langkah kecil menjadi bukti bahwa arahmu masih hidup.",
    "Pilih respons yang lebih jujur daripada respons yang paling cepat.",
    "Rawat batas agar energi tidak habis sebelum hal penting selesai.",
    "Kembalilah pada hal yang sederhana ketika pikiran mulai ramai.",
    "Selesaikan satu hal yang paling dekat sebelum mengejar hal yang lebih jauh.",
    "Beri ruang pada keputusan yang tenang, bukan hanya keputusan yang mendesak.",
    "Biarkan tubuhmu menjadi pengingat ketika ambisi mulai bergerak terlalu cepat.",
    "Pilih satu tindakan yang membuat hidup terasa sedikit lebih bersih.",
    "Jangan abaikan kebutuhan kecil yang diam-diam menentukan kualitas harimu.",
  ], `${seed}:conclusion-accent:${hash(seed) % 97}`, "Jaga ritme yang membuat tubuh ikut merasa aman.");
  const conclusionText = capitalizeSentenceStarts(`tema utama harimu adalah ${centralTheme}. Pola batin yang paling perlu diperhatikan adalah kecenderungan ${innerPattern}. Arah praktis paling sehat adalah ${practicalDirection}. Jika relasi atau keputusan penting muncul, beri ruang sebelum merespons agar kamu tidak bergerak hanya dari takut tertinggal. ${conclusionAccent}`);
  const conclusion = sentence(`Kesimpulan Hari Ini: ${conclusionText}`);

  return {
    paragraphs: [
      sentence(`${name}, ${dateLabel} membawa ajakan untuk membaca ulang arahmu dengan lebih pelan namun jernih. ${dayOpening} Yang paling menonjol hari ini adalah kebutuhan untuk hadir lebih sederhana, karena tidak semua hal perlu dijawab dengan tenaga yang sama. Ini bukan ramalan mutlak, melainkan ruang refleksi agar kamu lebih mudah mengenali bagian diri yang sedang aktif.`),
      sentence(`${energyPlan} Dalam praktik harian, dorongan untuk bergerak perlu ditemani pertanyaan sederhana tentang kapasitas. Jika kamu merasa ingin menyelesaikan banyak hal sekaligus, baca itu sebagai sinyal untuk memilah mana yang benar-benar hidup. Hari ini lebih mendukung keputusan yang ritmis daripada keputusan yang dipaksakan.`),
      sentence(`${mindPlan} Rasa aman akan lebih mudah terbentuk ketika kamu tidak menjadikan setiap pikiran sebagai perintah. Bila ada keputusan yang belum jelas, beri ia waktu tanpa mengabaikan tanggung jawab yang sudah nyata. Yang dicari hari ini bukan jawaban paling cepat, melainkan pilihan yang bisa kamu jalani dengan tenang.`),
      sentence(`${pressurePlan} Shadow tidak perlu dilawan dengan keras, karena ia biasanya muncul saat ada bagian dirimu yang terlalu lama bekerja tanpa didengar. Kalau tubuh mulai tegang, pikiran menjadi cepat menilai, atau hati terasa ingin menutup, kembali dulu ke langkah yang lebih sederhana. Kesadaran hari ini bukan tentang menjadi sempurna, tetapi tentang berhenti mengulang respons lama secara otomatis.`),
      sentence(`${relationPlan} Karena itu, tindakan yang tepat bukan harus besar, melainkan cukup spesifik untuk membuat hidupmu terasa lebih tertata. Pilih satu percakapan, satu pekerjaan, atau satu keputusan tubuh yang benar-benar bisa kamu rawat sampai selesai. Semakin jelas ukuran langkahmu, semakin kecil kemungkinan kamu bergerak hanya dari tekanan.`),
      sentence(`${actionPlan} Bila kamu ingin bergerak maju, mulai dari hal yang bisa disentuh dan tidak membutuhkan drama. Makna batin hari ini akan terasa lebih kuat ketika diterjemahkan menjadi perilaku yang sederhana. Semakin kamu menghormati ritme kecil ini, semakin mudah arah besar terasa tidak menakutkan.`),
      conclusion,
    ],
    conclusion: conclusionText,
  };
}

export function buildProfileDailyGuidance(input: DailySynthesisInput): DailyGuidance {
  const isEn = isEnlEdition();
  const { uid, profile, blueprint, arsipViewModel, localDateKey, timezone } = input;
  const now = input.referenceDate ?? new Date(`${localDateKey}T12:00:00`);
  const name = cleanText(profile.fullName || profile.displayName || profile.name) || (isEn ? "Dear Friend" : "Sahabat Bhumi");
  const dailySynthesisSeed = `${uid}:${localDateKey}:${arsipViewModel.contentVersion}:${generateBlueprintHash(blueprint)}`;
  const arsip = buildArsipBundle(arsipViewModel, dailySynthesisSeed);
  const astrology = buildAstrologyBundle(blueprint, localDateKey);
  const environment = buildEnvironmentBundle(profile, blueprint, timezone);
  const journey = buildJourneyBundle(profile);
  const hasMinimum = Boolean(uid && localDateKey && arsip.available);
  const state: "ready" | "limited" | "unavailable" = !hasMinimum
    ? "unavailable"
    : arsip.available && astrology.available && environment.available
      ? "ready"
      : "limited";

  if (state === "unavailable") {
    const text = isEn
      ? "Today's Note cannot be composed because minimum profile and Akashi Archive sources are not available yet."
      : "Catatan Hari Ini belum bisa disusun karena sumber minimum dari profil dan Arsip Akashi belum tersedia.";
    return {
      uid,
      date: localDateKey,
      localDateKey,
      schemaVersion: DAILY_GUIDANCE_SCHEMA_VERSION,
      generatedWithPromptVersion: DAILY_GUIDANCE_PROMPT_VERSION,
      guidanceVersion: DAILY_GUIDANCE_CONTENT_VERSION,
      dailySynthesisSeed,
      dailySynthesisState: "unavailable",
      dailySynthesisSources: { arsipAkashi: false, dailyAstrology: astrology.available, environment: environment.available, journey: journey.available },
      dailyConclusion: { title: isEn ? "Today's Conclusion" : "Kesimpulan Hari Ini", text, localDateKey, timezone, owner: "daily-synthesis", sourceVersion: SOURCE_VERSION },
      dailyNarrativeParagraphs: [text],
      dailyNoteText: text,
      soulReflectionText: text,
      astrologyToday: "",
      previousProgressSummary: "",
      profileSnapshot: profile,
      blueprintSnapshot: blueprint,
      aiInsight: text,
      journalPrompt: isEn ? "What data needs completing so my daily note can be read more fully?" : "Bagian data apa yang perlu kulengkapi agar catatan harianku bisa dibaca lebih utuh?",
      meditationSuggestion: isEn ? "Sit quietly for three minutes while checking body needs." : "Duduk hening tiga menit sambil mengecek kebutuhan tubuh.",
      dailyPractices: [],
      emotionalFocus: "readiness",
      spiritualFocus: "readiness",
      groundedAction: isEn ? "Complete minimum profile data." : "Lengkapi data profil minimum.",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      source: "local-fallback",
      status: "fallback",
    };
  }

  const { paragraphs, conclusion } = buildParagraphs({
    name,
    dateLabel: formatDate(localDateKey, timezone),
    seed: dailySynthesisSeed,
    arsip,
    astrology,
    environment,
    journey,
    state,
  });
  const dailyNoteText = paragraphs.join("\n\n");

  return {
    uid,
    date: localDateKey,
    localDateKey,
    schemaVersion: DAILY_GUIDANCE_SCHEMA_VERSION,
    generatedWithPromptVersion: DAILY_GUIDANCE_PROMPT_VERSION,
    guidanceVersion: DAILY_GUIDANCE_CONTENT_VERSION,
    dailySynthesisSeed,
    blueprintHash: generateBlueprintHash(blueprint),
    memoryHash: generateMemoryHash({ profile, localDateKey, timezone, arsipRooms: arsip.contributingRooms }),
    dailySynthesisState: state,
    dailySynthesisSources: {
      arsipAkashi: arsip.available,
      dailyAstrology: astrology.available,
      environment: environment.available,
      journey: journey.available,
    },
    dailyConclusion: {
      title: isEn ? "Today's Conclusion" : "Kesimpulan Hari Ini",
      text: conclusion,
      localDateKey,
      timezone,
      owner: "daily-synthesis",
      sourceVersion: SOURCE_VERSION,
    },
    dailyNarrativeParagraphs: paragraphs,
    dailyNoteText,
    soulReflectionText: conclusion,
    astrologyToday: astrology.available
      ? (isEn
          ? `Personal daily theme moves through ${astrology.sun}, ${astrology.moon}, and ${astrology.ascendant}.`
          : `Tema harian personal bergerak melalui ${astrology.sun}, ${astrology.moon}, dan ${astrology.ascendant}.`)
      : (isEn
          ? "Personal astrology today is limited because required birth data is incomplete."
          : "Astrologi personal hari ini terbatas karena data kelahiran yang diperlukan belum lengkap."),
    previousProgressSummary: journey.available
      ? (isEn ? "Journey context available." : "Journey context tersedia.")
      : (isEn ? "Journey context not available." : "Journey context tidak tersedia."),
    profileSnapshot: profile,
    blueprintSnapshot: blueprint,
    categories: buildDailyCategories({ seed: dailySynthesisSeed, arsip, astrology, environment, journey, state }),
    manifestation: {
      affirmation: isEn ? "Today I choose to move with an honest and grounded rhythm." : "Hari ini aku memilih bergerak dengan ritme yang jujur dan membumi.",
      attraction: isEn ? "I open space for opportunities aligned with my core center." : "Aku membuka ruang bagi kesempatan yang sesuai dengan pusat diriku.",
      assumption: isEn ? "I assume small finished steps are a sign that my direction is strengthening." : "Aku menganggap langkah kecil yang selesai sebagai tanda bahwa arahku sedang menguat.",
    },
    aiInsight: paragraphs[0],
    journalPrompt: isEn
      ? "Which part of my day asks for a slower rhythm, and what decision can I make from a more stable place?"
      : "Bagian mana dari hariku yang meminta ritme lebih pelan, dan keputusan apa yang bisa kubuat dari tempat yang lebih stabil?",
    meditationSuggestion: isEn
      ? "5-minute breath meditation to return to the body before making important decisions."
      : "Meditasi napas lima menit untuk kembali ke tubuh sebelum mengambil keputusan penting.",
    dailyPractices: [],
    emotionalFocus: arsip.anchorTheme,
    spiritualFocus: isEn ? "Daily Alignment" : "Keselarasan harian",
    groundedAction: isEn ? "Choose one small step to complete today." : "Pilih satu langkah kecil yang selesai hari ini.",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    source: "local-fallback",
    status: "fallback",
  };
}
