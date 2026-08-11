import type { DailyGuidance, DailyGuidanceCategory } from "@/lib/dailyGuidance/types";
import { seededIndex } from "@/lib/dailyGuidance/dailyContentKey";
import { DAILY_GUIDANCE_CONTENT_VERSION } from "@/lib/dailyGuidance/version";
import { getTimeAwareGreeting, getTimeAwareClosing } from "@/lib/dailyGuidance/timeOfDayGreeting";


const CATEGORY_SPECIFIC_FALLBACK_INSIGHTS: Record<string, string> = {
  general: "Ada pergeseran halus dalam caramu merasakan sekeliling hari ini, seperti langit pagi yang berganti ritme perlahan.",
  mental: "Kepalamu sedang cenderung menyusun dan menganalisis pola-pola yang biasanya terlewatkan.",
  finance: "Hubunganmu dengan stabilitas sedang berada pada titik di mana memilah tenagamu menjadi jangkar utama.",
  love: "Batinmu hari ini mencerminkan kebutuhan yang tenang untuk merasa diterima apa adanya tanpa perlu membuktikan nilai dirimu.",
  relational: "Lingkaran sosial di sekitarmu sedang menguji caramu merespons dinamika luar sambil tetap berdiri di pusat dirimu.",
  spiritual: "Hari ini membawa kesempatan untuk menyadari makna di balik kebetulan kecil yang hadir di sepanjang jalanmu.",
  challenges: "Ada kecenderungan batin untuk mempercepat keputusan atau menolak bantuan karena ingin segera selesai.",
  opportunities: "Pintu kecil untuk mencoba pendekatan yang tidak biasa sedang terbuka jika kamu bersedia memperhatikan.",
  advice: "Langkah yang paling membumi adalah menyatukan pemahaman kecil hari ini menjadi satu wujud yang nyata."
};

const TECHNICAL_SIGNAL = /\b(?:money line|love line|karmic tail)\b/i;
const RAW_NUMBER_PATTERN = /(?:\b(?:money line|love line|karmic tail)\b\s*[:\-]?\s*)?(?:\d+\s*[,/\-]\s*){1,}\d+/i;
const RAW_RUNTIME_SIGNAL = /\b(?:rank|score|dominant signs|open-meteo|usgs|bigdatacloud|gemini|us_aqi|cautionflags|memoryhash)\b|misi jiwamu|hadiah alami|pelajaran utamamu/i;

function cleanupUserFacingSurface(value: string): string {
  let hariIniCount = 0;
  return value
    .replace(/[“”"]/g, "")
    .replace(/([.!?]){2,}/g, "$1")
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/\bhari ini\b/gi, (match) => {
      hariIniCount += 1;
      return hariIniCount <= 2 ? match : "sekarang";
    })
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

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
    .filter((line) => !TECHNICAL_SIGNAL.test(line) && !RAW_NUMBER_PATTERN.test(line) && !RAW_RUNTIME_SIGNAL.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return safeLines ? cleanupUserFacingSurface(safeLines) : undefined;
}

const ADVICE_THEMES = [
  "pelepasan", "komunikasi", "tubuh dan istirahat", "karya dan arah", "relasi",
  "keberanian memulai", "batas sehat", "grounding", "refleksi malam", "merapikan prioritas",
  "kedekatan",
] as const;

const ADVICE_VARIATIONS: Record<(typeof ADVICE_THEMES)[number], string[]> = {
  pelepasan: [
    "Lepaskan satu hal kecil yang tidak lagi perlu kamu bawa hari ini. Ruang yang terbuka tidak harus segera diisi; biarkan batinmu merasakan lega lebih dulu.",
    "Pilih satu beban yang bisa kamu letakkan sementara. Tidak semua yang belum selesai harus ikut masuk ke langkah berikutnya.",
    "Biarkan hari ini berlalu tanpa keharusan memperbaiki semuanya. Terkadang, mengizinkan hal-hal menggantung sejenak adalah cara terbaik untuk melonggarkan beban pikiran."
  ],
  komunikasi: [
    "Sampaikan satu hal penting dengan kalimat yang sederhana dan jujur. Dengarkan tubuhmu sebelum menjawab agar kata-katamu lahir dari kejernihan, bukan ketegangan.",
    "Rapikan satu percakapan yang terasa menggantung. Kamu tidak perlu menjelaskan semuanya; cukup hadir dengan satu kebenaran yang lembut.",
    "Sampaikan pesanmu tanpa perlu membela diri atau membenarkan posisi secara berlebihan. Kejujuran yang sederhana biasanya lebih mudah diterima dan dipahami."
  ],
  "tubuh dan istirahat": [
    "Mulailah dari tubuh: minum, bernapas lebih pelan, dan beri jeda sebelum menambah tugas. Istirahat kecil hari ini dapat menjaga keputusanmu tetap jernih.",
    "Dengarkan sinyal tubuh sebelum mengejar daftar berikutnya. Pilih ritme yang bisa kamu jalani tanpa meninggalkan dirimu sendiri.",
    "Regangkan ketegangan di bahumu dan biarkan tubuhmu bergerak dengan tempo yang lebih alami. Istirahat sejenak bukanlah jeda dari produktivitas, melainkan cara memulihkan kejernihan."
  ],
  "karya dan arah": [
    "Pilih satu pekerjaan yang paling mendekatkanmu pada arah yang penting. Selesaikan bagian kecilnya dengan utuh sebelum membuka terlalu banyak pintu baru.",
    "Bawa energimu kembali pada karya yang benar-benar membutuhkan kehadiranmu. Kemajuan hari ini cukup diukur dari satu langkah yang selesai dan bermakna.",
    "Fokuskan perhatianmu pada satu penyelesaian kecil yang langsung berdampak hari ini. Menjaga fokus tetap sempit membantu menyelesaikan pekerjaan dengan kepuasan yang utuh."
  ],
  relasi: [
    "Rawat satu relasi melalui perhatian yang jujur, tanpa mengabaikan kebutuhanmu sendiri. Kedekatan yang sehat tidak meminta kamu kehilangan pusat diri.",
    "Berikan ruang untuk mendengar sebelum memperbaiki atau menyimpulkan. Satu respons yang hangat dapat lebih berarti daripada banyak nasihat.",
    "Hubungi seseorang untuk sekadar mendengar kabarnya tanpa ada agenda tersembunyi. Kehadiranmu yang tulus akan menghangatkan hubungan tanpa perlu banyak usaha."
  ],
  "keberanian memulai": [
    "Mulailah dari versi terkecil yang masih terasa nyata. Keberanian hari ini bukan tentang lompatan besar, melainkan kesediaan membuka langkah pertama.",
    "Jangan menunggu semuanya terasa sempurna. Pilih satu awal yang cukup aman untuk dicoba, lalu biarkan keyakinan tumbuh setelah kamu bergerak.",
    "Lakukan satu langkah nyata yang paling dekat dan mudah dilakukan sekarang. Keberanian sejati tidak menunggu keyakinan menjadi sempurna, melainkan tumbuh seiring langkah yang kamu ambil."
  ],
  "batas sehat": [
    "Tetapkan satu batas yang melindungi waktu dan tenagamu hari ini. Kamu boleh tetap peduli tanpa harus selalu tersedia untuk semuanya.",
    "Perhatikan bagian dirimu yang cepat berkata iya ketika tubuh ingin berhenti. Beri jawaban yang jujur dan tetap lembut.",
    "Pilih satu hal luar yang ingin kamu tolak dengan sopan hari ini demi kenyamanan batinmu sendiri. Menghormati keterbatasan energimu sendiri adalah langkah awal dari ketenangan."
  ],
  grounding: [
    "Kembali pada hal yang paling dekat: napas, kaki yang menapak, dan satu tugas sederhana. Saat pikiran melebar, tubuh dapat membawamu pulang ke saat ini.",
    "Rapikan ruang kecil di sekitarmu lalu duduk sejenak tanpa tuntutan. Kehadiran yang sederhana akan membantu energimu kembali terkumpul.",
    "Rasakan sentuhan telapak kakimu pada bumi dan tarik napas dalam sejenak. Menyapa kenyataan fisik saat ini akan menenangkan pikiran yang riuh."
  ],
  "refleksi malam": [
    "Sisakan beberapa menit malam ini untuk melihat apa yang menguatkan dan mengurasmu. Bawa satu pelajaran ke esok hari, lalu izinkan sisanya selesai.",
    "Sebelum beristirahat, tulis satu hal yang ingin kamu syukuri dan satu hal yang ingin kamu lepaskan. Biarkan malam menjadi ruang penutup yang lembut.",
    "Tutuplah hari dengan membiarkan semua pencapaian dan kegagalan melebur dalam istirahat yang tenang. Malam ini adalah waktu untuk melepaskan segala tuntutan evaluasi diri."
  ],
  "merapikan prioritas": [
    "Ambil satu langkah kecil yang membuat batinmu terasa lebih rapi. Hari ini bukan tentang menyelesaikan semuanya, tetapi memilih satu hal yang benar-benar perlu kamu rawat.",
    "Bedakan yang penting dari yang hanya terasa mendesak. Pilih satu prioritas, beri waktu yang jelas, lalu izinkan hal lain menunggu.",
    "Tuliskan prioritas utamamu hari ini dan biarkan sisa daftar tugasmu menunggu. Fokus satu per satu akan membersihkan batin yang lelah."
  ],
  kedekatan: [
    "Rawat ruang intim dalam dirimu dengan membiarkan perasaan jujur mengalir tanpa tuntutan pembuktian. Hubungan yang hangat tumbuh dari keberanianmu untuk hadir apa adanya.",
    "Beri perhatian pada hatimu sebelum membagikannya kepada orang lain. Kedekatan yang tulus dimulai saat kamu merasa cukup dan aman dengan dirimu sendiri.",
    "Bagikan satu kerentanan atau rasa syukur kecil dengan orang yang kamu sayangi secara jujur. Mengizinkan dirimu terlihat apa adanya memperdalam ikatan batin kalian."
  ]
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
  "merapikan prioritas": ["Tulis tiga hal, lingkari satu yang paling penting, dan biarkan dua lainnya menunggu.", "Pilih satu prioritas yang realistis and beri batas waktu agar energimu tidak tercecer."],
  kedekatan: [
    "Tulis satu hal yang paling kamu hargai dari caramu mengasihi dan menerima dirimu hari ini.",
    "Luangkan waktu tenang sejenak untuk menyapa perasaanmu sendiri sebelum merespons pesan dari pasangan."
  ]
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
    mental: "komunikasi", finance: "karya dan arah", love: "kedekatan", relational: "relasi",
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

const BLACKLIST_PATTERNS = [
  { key: "langkah_kecil", regex: /satu langkah kecil|langkah kecil/gi, replacement: "tindakan nyata" },
  { key: "tidak_menyelesaikan", regex: /(?:tidak|nggak) (?:perlu|harus) menyelesaikan semuanya|tidak harus diselesaikan sekaligus/gi, replacement: "izinkan sisanya berjalan wajar" },
  { key: "cukup_hadir", regex: /cukup hadir|kembali hadir/gi, replacement: "amati keadaanmu" },
  { key: "beri_ruang", regex: /beri ruang|memberi ruang/gi, replacement: "sediakan celah" },
  { key: "pelan_pelan", regex: /pelan-pelan|perlahan-lahan/gi, replacement: "tanpa tergesa" },
  { key: "jaga_energi", regex: /(?:jaga|menjaga) energi|batas energi/gi, replacement: "hargai tenagamu" },
  { key: "tarik_napas", regex: /tarik napas|tarik nafas|bernapaslah|bernafaslah/gi, replacement: "kembali ke tubuh" }
];

export function deconflictBlacklistPhrases(text: string | undefined, seenCounts: Record<string, number>): string | undefined {
  if (!text) return text;
  let result = text;
  for (const pattern of BLACKLIST_PATTERNS) {
    pattern.regex.lastIndex = 0;
    if (pattern.regex.test(result)) {
      pattern.regex.lastIndex = 0;
      result = result.replace(pattern.regex, pattern.replacement);
      seenCounts[pattern.key] = (seenCounts[pattern.key] || 0) + 1;
    }
  }
  return cleanupUserFacingSurface(result);
}

function sanitizeAdvice(value: string | undefined, categoryKey: string, guidance: DailyGuidance, forceFallback: boolean): string {
  const normalized = normalizeUserFacingText(value)?.replace(/\s+/g, " ").trim();
  if (forceFallback || isInvalidAdvice(normalized)) {
    return buildPersonalFallbackAdvice(categoryKey, guidance);
  }
  return normalized as string;
}

function normalizeCategory(categoryKey: string, category: DailyGuidanceCategory, guidance: DailyGuidance, forceFallback: boolean, seenCounts: Record<string, number>): DailyGuidanceCategory {
  const defaultInsight = CATEGORY_SPECIFIC_FALLBACK_INSIGHTS[categoryKey] || CATEGORY_SPECIFIC_FALLBACK_INSIGHTS.general;
  return {
    ...category,
    insight: deconflictBlacklistPhrases(normalizeUserFacingText(category.insight) || defaultInsight, seenCounts) || "",
    reason: deconflictBlacklistPhrases(normalizeUserFacingText(category.reason) || defaultInsight, seenCounts) || "",
    reflection: deconflictBlacklistPhrases(normalizeUserFacingText(category.reflection), seenCounts),
    advice: deconflictBlacklistPhrases(sanitizeAdvice(category.advice, categoryKey, guidance, forceFallback), seenCounts) || "",
  };
}

function getFirstName(profile: any): string {
  if (!profile) return "Sahabat";
  const nameVal = profile.fullName || profile.displayName || profile.name || 
                  profile.profile?.fullName || profile.profile?.displayName || profile.profile?.name;
  if (typeof nameVal === "string" && nameVal.trim()) {
    return nameVal.trim().split(/\s+/)[0];
  }
  return "Sahabat";
}

function getIndonesianDayName(dateString?: string): string {
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  if (dateString) {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return dayNames[date.getDay()];
    }
  }
  return dayNames[new Date().getDay()];
}

const COMPANION_SENTENCES = [
  "Besok kita lanjut dari titik yang sama.",
  "Tidak semua pertanyaan perlu dijawab sekarang.",
  "Terima kasih sudah hadir untuk dirimu sendiri hari ini.",
  "Ambil jeda sejenak sebelum malam benar-benar larut.",
  "Aku tetap di sini menemanimu.",
  "Biarkan sisanya selesai dengan sendirinya.",
  "Kamu sudah berjalan cukup jauh hari ini, beristirahatlah.",
  "Simpan beberapa pertanyaan untuk esok hari.",
  "Apa yang belum selesai bisa kita temui lagi besok.",
  "Kamu boleh menutup hari tanpa menghakimi diri."
];

export function standardizeSoulReflection(
  text: string | undefined,
  guidance: DailyGuidance,
  profile?: any
): string | undefined {
  if (!text) return text;

  let bodyText = text.trim();

  // Clean leading greeting patterns
  const greetingPattern = /^(?:hai|selamat|membaca jiwamu|halo|jiwa)[^.!?]*?[.!?]\s*/i;
  while (greetingPattern.test(bodyText)) {
    bodyText = bodyText.replace(greetingPattern, "").trim();
  }

  const profileData = profile || guidance.profileSnapshot;
  const firstName = getFirstName(profileData);
  const dateKey = guidance.localDateKey || guidance.date || new Date().toISOString().slice(0, 10);
  const dayName = getIndonesianDayName(dateKey);
  const language = profileData?.language === "en" ? "en" : "id";

  const expectedOpening = getTimeAwareGreeting(firstName, dayName, new Date(), language);

  let paragraphs = bodyText.split(/\r?\n+/).map(p => p.trim()).filter(Boolean);

  while (paragraphs.length > 0) {
    const lastPara = paragraphs[paragraphs.length - 1].toLowerCase();
    if (
      lastPara.includes("peluk hangat") ||
      lastPara.includes("dari bhumi") ||
      lastPara.includes("besok kita melangkah") ||
      lastPara.includes("tidak semua hal harus selesai") ||
      lastPara.includes("terima kasih sudah hadir") ||
      lastPara.includes("ambil jeda sejenak") ||
      lastPara.includes("aku menemanimu") ||
      lastPara.includes("biarkan sisanya") ||
      lastPara.includes("kamu sudah berjalan") ||
      lastPara.includes("simpan beberapa pertanyaan") ||
      lastPara.includes("hari ini cukup") ||
      lastPara.includes("bernapaslah perlahan") ||
      lastPara.includes("apa yang bisa kamu lepaskan") ||
      lastPara.includes("pelan-pelan saja") ||
      lastPara.includes("jaga ritmemu")
    ) {
      paragraphs.pop();
    } else {
      break;
    }
  }

  const cleanBody = paragraphs.join("\n\n");
  const companionSentence = getTimeAwareClosing(new Date(), language);
  const signOff = language === "en" ? "Warm hugs from Bhumi." : "Peluk hangat dari Bhumi.";

  return cleanupUserFacingSurface(`${expectedOpening} ${cleanBody}\n\n${signOff}\n\n${companionSentence}`);
}

export function normalizeUserFacingGuidance(guidance: DailyGuidance, profile?: any): DailyGuidance {
  const seenCounts: Record<string, number> = {
    tidak_menyelesaikan: 1, // Pre-seeded to avoid matching hardcoded header in DailyNoteV2
  };

  const profileData = profile || guidance.profileSnapshot;
  const rawReflection = normalizeUserFacingText(guidance.soulReflectionText) || CATEGORY_SPECIFIC_FALLBACK_INSIGHTS.general;
  const soulReflectionText = deconflictBlacklistPhrases(
    standardizeSoulReflection(rawReflection, guidance, profileData),
    seenCounts
  );

  const dailyNoteText = deconflictBlacklistPhrases(
    normalizeUserFacingText(guidance.dailyNoteText) || CATEGORY_SPECIFIC_FALLBACK_INSIGHTS.general,
    seenCounts
  );

  const adviceCounts = new Map<string, number>();
  Object.values(guidance.categories || {}).forEach((category) => {
    const key = (category.advice || "").trim().toLowerCase();
    if (key) adviceCounts.set(key, (adviceCounts.get(key) || 0) + 1);
  });

  const categories = guidance.categories
    ? Object.fromEntries(
        Object.entries(guidance.categories).map(([key, category]) => {
          const adviceKey = (category.advice || "").trim().toLowerCase();
          const forceFallback = Boolean(adviceKey && (adviceCounts.get(adviceKey) || 0) > 1);
          return [key, normalizeCategory(key, category, guidance, forceFallback, seenCounts)];
        }),
      ) as DailyGuidance["categories"]
    : undefined;

  return {
    ...guidance,
    guidanceVersion: DAILY_GUIDANCE_CONTENT_VERSION,
    categories,
    soulReflectionText,
    dailyNoteText,
    aiInsight: deconflictBlacklistPhrases(normalizeUserFacingText(guidance.aiInsight) || CATEGORY_SPECIFIC_FALLBACK_INSIGHTS.advice, seenCounts) || "",
    astrologyToday: deconflictBlacklistPhrases(normalizeUserFacingText(guidance.astrologyToday) || "Amati ritmemu hari ini dengan lembut.", seenCounts) || "",
    previousProgressSummary: deconflictBlacklistPhrases(normalizeUserFacingText(guidance.previousProgressSummary), seenCounts) || "",
    journalPrompt: deconflictBlacklistPhrases(normalizeUserFacingText(guidance.journalPrompt) || "Apa satu hal yang paling ingin kamu rawat hari ini?", seenCounts) || "",
    meditationSuggestion: deconflictBlacklistPhrases(normalizeUserFacingText(guidance.meditationSuggestion) || "Duduk tenang selama beberapa menit.", seenCounts) || "",
    audioHealingSuggestion: deconflictBlacklistPhrases(normalizeUserFacingText(guidance.audioHealingSuggestion), seenCounts),
    emotionalFocus: deconflictBlacklistPhrases(normalizeUserFacingText(guidance.emotionalFocus) || "Kehadiran", seenCounts) || "",
    spiritualFocus: deconflictBlacklistPhrases(normalizeUserFacingText(guidance.spiritualFocus) || "Kejernihan", seenCounts) || "",
    groundedAction: deconflictBlacklistPhrases(normalizeUserFacingText(guidance.groundedAction) || CATEGORY_SPECIFIC_FALLBACK_INSIGHTS.general, seenCounts) || "",
    companionReflection: {
      preview: deconflictBlacklistPhrases(
        normalizeUserFacingText(guidance.companionReflection?.preview)
        || normalizeUserFacingText(guidance.dailyNoteText)
        || soulReflectionText
        || CATEGORY_SPECIFIC_FALLBACK_INSIGHTS.general,
        seenCounts,
      ) || "",
      fullReflection: deconflictBlacklistPhrases(
        normalizeUserFacingText(guidance.companionReflection?.fullReflection)
        || normalizeUserFacingText(guidance.soulReflectionText)
        || normalizeUserFacingText(guidance.aiInsight)
        || soulReflectionText
        || CATEGORY_SPECIFIC_FALLBACK_INSIGHTS.general,
        seenCounts,
      ) || "",
    },
  };
}
