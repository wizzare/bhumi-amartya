import type { DailyGuidance, DailyGuidanceCategory } from "@/lib/dailyGuidance/types";
import { seededIndex } from "@/lib/dailyGuidance/dailyContentKey";
import { DAILY_GUIDANCE_CONTENT_VERSION } from "@/lib/dailyGuidance/version";

const FRIENDLY_FALLBACK =
  "Hari ini, pilih satu langkah kecil yang paling ramah untuk tubuh dan batinmu. Tidak perlu menyelesaikan semuanya. Cukup hadir, rapikan satu hal, lalu beri ruang untuk bernapas.";

const TECHNICAL_SIGNAL = /\b(?:money line|love line|karmic tail)\b/i;
const RAW_NUMBER_PATTERN = /(?:\b(?:money line|love line|karmic tail)\b\s*[:\-]?\s*)?(?:\d+\s*[,/\-]\s*){1,}\d+/i;

export function normalizeUserFacingText(value: string | undefined): string | undefined {
  if (!value) return value;

  const normalized = value
    .replace(/pesan (?:lembut )?dari sahabat bhumi(?: untukmu)?[.:]?\s*/gi, "")
    .replace(/pesan sahabat bhumi hari ini\s*/gi, "Hari ini ")
    .replace(/hari ini,? sahabat bhumi mengajakmu\s*/gi, "Hari ini, ")
    .replace(/sahabat bhumi mengajakmu\s*/gi, "Cobalah ")
    .replace(/saran mentor/gi, "Saran Bhumi")
    .replace(/berdasarkan blueprint gabunganmu/gi, "Membaca jiwamu hari ini")
    .replace(/membaca blueprint gabunganmu bersama kondisi langit/gi, "Membaca jiwamu bersama kondisi langit")
    .replace(/blueprint gabunganmu/gi, "jiwamu")
    .replace(/blueprint gabungan/gi, "gambaran dirimu")
    .replace(/pengaruh ke blueprint/gi, "Pengaruh ke Jiwamu");

  const safeLines = normalized
    .split(/\r?\n/)
    .filter((line) => !TECHNICAL_SIGNAL.test(line) && !RAW_NUMBER_PATTERN.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return safeLines || FRIENDLY_FALLBACK;
}

const ADVICE_THEMES = [
  "pelepasan", "komunikasi", "tubuh dan istirahat", "karya dan arah", "relasi",
  "keberanian memulai", "batas sehat", "grounding", "refleksi malam", "merapikan prioritas",
] as const;

const ADVICE_VARIATIONS: Record<(typeof ADVICE_THEMES)[number], string[]> = {
  pelepasan: [
    "Lepaskan satu hal kecil yang tidak lagi perlu kamu bawa hari ini. Ruang yang terbuka tidak harus segera diisi; biarkan batinmu merasakan lega lebih dulu.",
    "Pilih satu beban yang bisa kamu letakkan sementara. Tidak semua yang belum selesai harus ikut masuk ke langkah berikutnya.",
  ],
  komunikasi: [
    "Sampaikan satu hal penting dengan kalimat yang sederhana dan jujur. Dengarkan tubuhmu sebelum menjawab agar kata-katamu lahir dari kejernihan, bukan ketegangan.",
    "Rapikan satu percakapan yang terasa menggantung. Kamu tidak perlu menjelaskan semuanya; cukup hadir dengan satu kebenaran yang lembut.",
  ],
  "tubuh dan istirahat": [
    "Mulailah dari tubuh: minum, bernapas lebih pelan, dan beri jeda sebelum menambah tugas. Istirahat kecil hari ini dapat menjaga keputusanmu tetap jernih.",
    "Dengarkan sinyal tubuh sebelum mengejar daftar berikutnya. Pilih ritme yang bisa kamu jalani tanpa meninggalkan dirimu sendiri.",
  ],
  "karya dan arah": [
    "Pilih satu pekerjaan yang paling mendekatkanmu pada arah yang penting. Selesaikan bagian kecilnya dengan utuh sebelum membuka terlalu banyak pintu baru.",
    "Bawa energimu kembali pada karya yang benar-benar membutuhkan kehadiranmu. Kemajuan hari ini cukup diukur dari satu langkah yang selesai dan bermakna.",
  ],
  relasi: [
    "Rawat satu relasi melalui perhatian yang jujur, tanpa mengabaikan kebutuhanmu sendiri. Kedekatan yang sehat tidak meminta kamu kehilangan pusat diri.",
    "Berikan ruang untuk mendengar sebelum memperbaiki atau menyimpulkan. Satu respons yang hangat dapat lebih berarti daripada banyak nasihat.",
  ],
  "keberanian memulai": [
    "Mulailah dari versi terkecil yang masih terasa nyata. Keberanian hari ini bukan tentang lompatan besar, melainkan kesediaan membuka langkah pertama.",
    "Jangan menunggu semuanya terasa sempurna. Pilih satu awal yang cukup aman untuk dicoba, lalu biarkan keyakinan tumbuh setelah kamu bergerak.",
  ],
  "batas sehat": [
    "Tetapkan satu batas yang melindungi waktu dan tenagamu hari ini. Kamu boleh tetap peduli tanpa harus selalu tersedia untuk semuanya.",
    "Perhatikan bagian dirimu yang cepat berkata iya ketika tubuh ingin berhenti. Beri jawaban yang jujur dan tetap lembut.",
  ],
  grounding: [
    "Kembali pada hal yang paling dekat: napas, kaki yang menapak, dan satu tugas sederhana. Saat pikiran melebar, tubuh dapat membawamu pulang ke saat ini.",
    "Rapikan ruang kecil di sekitarmu lalu duduk sejenak tanpa tuntutan. Kehadiran yang sederhana akan membantu energimu kembali terkumpul.",
  ],
  "refleksi malam": [
    "Sisakan beberapa menit malam ini untuk melihat apa yang menguatkan dan mengurasmu. Bawa satu pelajaran ke esok hari, lalu izinkan sisanya selesai.",
    "Sebelum beristirahat, tulis satu hal yang ingin kamu syukuri dan satu hal yang ingin kamu lepaskan. Biarkan malam menjadi ruang penutup yang lembut.",
  ],
  "merapikan prioritas": [
    "Ambil satu langkah kecil yang membuat batinmu terasa lebih rapi. Hari ini bukan tentang menyelesaikan semuanya, tetapi memilih satu hal yang benar-benar perlu kamu rawat.",
    "Bedakan yang penting dari yang hanya terasa mendesak. Pilih satu prioritas, beri waktu yang jelas, lalu izinkan hal lain menunggu.",
  ],
};

const THEME_ACTIONS: Record<(typeof ADVICE_THEMES)[number], string[]> = {
  pelepasan: ["Tulis yang ingin kamu lepaskan, lalu tutup catatan itu tanpa menghakimi dirimu.", "Rapikan satu sudut kecil sebagai tanda bahwa kamu siap memberi ruang baru."],
  komunikasi: ["Pilih waktu yang tenang dan sampaikan kebutuhanmu tanpa menambah penjelasan yang tidak perlu.", "Sebelum berbicara, tarik tiga napas dan tentukan satu pesan utama yang ingin dijaga."],
  "tubuh dan istirahat": ["Sisihkan sepuluh menit tanpa layar agar tubuhmu punya kesempatan kembali tenang.", "Beri dirimu air, peregangan ringan, dan satu jeda sebelum meneruskan aktivitas."],
  "karya dan arah": ["Tetapkan waktu singkat untuk satu tugas utama, lalu akhiri dengan mencatat langkah berikutnya.", "Pilih hasil kecil yang jelas dan selesaikan tanpa membuka pekerjaan baru di tengah jalan."],
  relasi: ["Tanyakan apa yang benar-benar dibutuhkan, lalu dengarkan jawabannya tanpa buru-buru memperbaiki.", "Berikan satu respons hangat sambil tetap menjaga batas yang membuatmu merasa aman."],
  "keberanian memulai": ["Luangkan sepuluh menit untuk mencoba langkah pertama, tanpa menuntut hasil yang sempurna.", "Buat satu tindakan pembuka yang cukup kecil untuk dilakukan sebelum keraguan membesar."],
  "batas sehat": ["Tentukan satu hal yang tidak akan kamu ambil hari ini, lalu gunakan ruangnya untuk pulih.", "Sampaikan satu batas dengan singkat, jelas, dan tanpa meminta maaf atas kebutuhan yang wajar."],
  grounding: ["Letakkan ponsel sejenak, rasakan kaki menapak, lalu kerjakan satu hal sampai selesai.", "Ambil tiga napas panjang dan rapikan satu benda di dekatmu sebelum memilih langkah berikutnya."],
  "refleksi malam": ["Tutup hari dengan tiga baris jurnal, lalu berhenti sebelum refleksi berubah menjadi penilaian diri.", "Catat satu pelajaran dan satu rasa syukur, kemudian izinkan tubuhmu benar-benar beristirahat."],
  "merapikan prioritas": ["Tulis tiga hal, lingkari satu yang paling penting, dan biarkan dua lainnya menunggu.", "Pilih satu prioritas yang realistis dan beri batas waktu agar energimu tidak tercecer."],
};

function selectAdviceTheme(categoryKey: string, guidance: DailyGuidance): (typeof ADVICE_THEMES)[number] {
  const context = [guidance.soulReflectionText, guidance.dailyNoteText, guidance.astrologyToday, guidance.previousProgressSummary]
    .filter(Boolean).join(" ").toLowerCase();
  const keywordThemes: Array<[RegExp, (typeof ADVICE_THEMES)[number]]> = [
    [/lepas|selesai|waning|penutup/, "pelepasan"], [/komunik|merkuri|bicara|percakapan/, "komunikasi"],
    [/tubuh|istirahat|lelah|napas/, "tubuh dan istirahat"], [/karya|karier|kerja|tujuan/, "karya dan arah"],
    [/relasi|cinta|keluarga|venus/, "relasi"], [/mulai|awal|new moon|berani/, "keberanian memulai"],
    [/batas|saturn|kapasitas/, "batas sehat"], [/ground|membumi|stabil/, "grounding"],
    [/malam|tidur|hening/, "refleksi malam"], [/prioritas|fokus|rapikan/, "merapikan prioritas"],
  ];
  const categoryMap: Record<string, (typeof ADVICE_THEMES)[number]> = {
    mental: "komunikasi", finance: "karya dan arah", love: "relasi", relational: "relasi",
    spiritual: "refleksi malam", challenges: "batas sehat", opportunities: "keberanian memulai",
    advice: "merapikan prioritas", general: "grounding",
  };
  return (categoryKey !== "general" && categoryKey !== "advice" ? categoryMap[categoryKey] : undefined)
    || keywordThemes.find(([pattern]) => pattern.test(context))?.[1]
    || categoryMap[categoryKey]
    || ADVICE_THEMES[seededIndex(`${guidance.uid}|${guidance.localDateKey || guidance.date}|${categoryKey}`, ADVICE_THEMES.length)];
}

function buildPersonalFallbackAdvice(categoryKey: string, guidance: DailyGuidance): string {
  const seed = `${guidance.dailyVariationSeed || `${guidance.uid}|${guidance.localDateKey || guidance.date}`}|${categoryKey}|fanta-advice`;
  const theme = selectAdviceTheme(categoryKey, guidance);
  const options = ADVICE_VARIATIONS[theme];
  const advice = options[seededIndex(seed, options.length)];
  const actions = THEME_ACTIONS[theme];
  const action = actions[seededIndex(`${seed}|action`, actions.length)];
  return `${advice} ${action}`.replace(/\s+/g, " ").trim();
}

const BAD_ADVICE_PATTERN = /ini selaras dengan|pesan harianmu|inti dirimu|kamu berada di|berdasarkan|["“”]/i;
const INCOMPLETE_ENDING_PATTERN = /\b(?:di|dan|yang|untuk|dengan)$/i;

function sentenceCount(value: string): number {
  return value.split(/[.!?]+/).map((item) => item.trim()).filter(Boolean).length;
}

function isInvalidAdvice(value: string | undefined): boolean {
  if (!value) return true;
  const text = value.replace(/\s+/g, " ").trim();
  const lower = text.toLowerCase();
  return text.length < 100
    || text.length > 350
    || sentenceCount(text) < 2
    || sentenceCount(text) > 3
    || BAD_ADVICE_PATTERN.test(text)
    || INCOMPLETE_ENDING_PATTERN.test(text.replace(/[.!?]+$/, "").trim())
    || [
    "stay grounded.",
    "ambil waktu sejenak untuk menjejak bumi. biarkan dirimu merasakan ketenangan.",
    "pesan sahabat bhumi hari ini mengajakmu memilih satu langkah kecil yang paling ramah untuk tubuh dan batinmu. tidak perlu menyelesaikan semuanya. cukup hadir, rapikan satu hal, lalu beri ruang untuk bernapas.",
  ].includes(lower);
}

function sanitizeAdvice(value: string | undefined, categoryKey: string, guidance: DailyGuidance, forceFallback: boolean): string {
  const normalized = normalizeUserFacingText(value)?.replace(/\s+/g, " ").trim();
  if (forceFallback || isInvalidAdvice(normalized) || normalized === FRIENDLY_FALLBACK) {
    return buildPersonalFallbackAdvice(categoryKey, guidance);
  }
  return normalized as string;
}

function normalizeCategory(categoryKey: string, category: DailyGuidanceCategory, guidance: DailyGuidance, forceFallback: boolean): DailyGuidanceCategory {
  return {
    ...category,
    insight: normalizeUserFacingText(category.insight) || FRIENDLY_FALLBACK,
    reason: normalizeUserFacingText(category.reason) || FRIENDLY_FALLBACK,
    reflection: normalizeUserFacingText(category.reflection),
    advice: sanitizeAdvice(category.advice, categoryKey, guidance, forceFallback),
  };
}

export function normalizeUserFacingGuidance(guidance: DailyGuidance): DailyGuidance {
  const adviceCounts = new Map<string, number>();
  Object.values(guidance.categories || {}).forEach((category) => {
    const key = (category.advice || "").trim().toLowerCase();
    if (key) adviceCounts.set(key, (adviceCounts.get(key) || 0) + 1);
  });
  const categories = guidance.categories
    ? Object.fromEntries(
        Object.entries(guidance.categories).map(([key, category]) => {
          const adviceKey = (category.advice || "").trim().toLowerCase();
          return [key, normalizeCategory(key, category, guidance, Boolean(adviceKey && (adviceCounts.get(adviceKey) || 0) > 1))];
        }),
      ) as DailyGuidance["categories"]
    : undefined;

  return {
    ...guidance,
    guidanceVersion: DAILY_GUIDANCE_CONTENT_VERSION,
    categories,
    soulReflectionText: normalizeUserFacingText(guidance.soulReflectionText),
    dailyNoteText: normalizeUserFacingText(guidance.dailyNoteText),
    content: normalizeUserFacingText(guidance.content),
    aiInsight: normalizeUserFacingText(guidance.aiInsight) || FRIENDLY_FALLBACK,
    astrologyToday: normalizeUserFacingText(guidance.astrologyToday) || "Amati ritmemu hari ini dengan lembut.",
    previousProgressSummary: normalizeUserFacingText(guidance.previousProgressSummary) || "",
    journalPrompt: normalizeUserFacingText(guidance.journalPrompt) || "Apa satu hal yang paling ingin kamu rawat hari ini?",
    meditationSuggestion: normalizeUserFacingText(guidance.meditationSuggestion) || "Bernapas perlahan selama beberapa menit.",
    audioHealingSuggestion: normalizeUserFacingText(guidance.audioHealingSuggestion),
    emotionalFocus: normalizeUserFacingText(guidance.emotionalFocus) || "Kehadiran",
    spiritualFocus: normalizeUserFacingText(guidance.spiritualFocus) || "Kejernihan",
    groundedAction: normalizeUserFacingText(guidance.groundedAction) || FRIENDLY_FALLBACK,
    companionReflection: guidance.companionReflection
      ? {
          preview: normalizeUserFacingText(guidance.companionReflection.preview) || FRIENDLY_FALLBACK,
          fullReflection: normalizeUserFacingText(guidance.companionReflection.fullReflection) || FRIENDLY_FALLBACK,
        }
      : undefined,
  };
}
