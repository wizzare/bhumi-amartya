import type { DailyGuidance, DailyGuidanceCategory } from "@/lib/dailyGuidance/types";
import { DAILY_GUIDANCE_CONTENT_VERSION, DAILY_GUIDANCE_PROMPT_VERSION, DAILY_GUIDANCE_SCHEMA_VERSION } from "@/lib/dailyGuidance/version";
import type { ArsipAkashiProfileViewModel, ArsipAkashiProfileReading } from "@/lib/arsipAkashi/profile/viewModel";
import { generateBlueprintHash, generateMemoryHash } from "@/lib/utils/hashing";

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
  let cleaned = cleanText(value);
  for (const title of RAW_READING_TITLES) {
    cleaned = cleaned.replace(new RegExp(`\\b${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g"), "lapisan dirimu");
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
  const date = new Date(`${dateKey}T12:00:00`);
  return new Intl.DateTimeFormat("id-ID", {
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
  const readings = viewModel.readings;
  const identity = findReading(readings, ["primary-archetype", "soul-identity"], ["SIAPA DIRIMU", "SOUL IDENTITY"]);
  const mechanics = findReading(readings, ["energy-mechanics", "decision-rhythm"], ["ENERGI & MEKANIKA"]);
  const shadow = findReading(readings, ["shadow-pattern", "wound-pattern"], ["LUKA, BAYANGAN & WARISAN"]);
  const work = findReading(readings, ["talent-economy", "career-direction"], ["KARYA & TALENTA"]);
  const relation = findReading(readings, ["relationship-pattern", "love-pattern"], ["CINTA & RELASI"]);
  const body = findReading(readings, ["body-environment", "environmental-sensitivity"], ["RAGA & RUANG"]);
  const phase = findReading(readings, ["current-life-phase", "semester-reading"], ["FASE KEHIDUPAN SAAT INI"]);
  const spiritual = findReading(readings, ["spiritual-evolution"], ["SPIRITUALITAS & EVOLUSI"]);
  const selected = [identity, mechanics, shadow, work, relation, body, phase, spiritual].filter(Boolean) as ArsipAkashiProfileReading[];
  const dailyAnchor = pick(selected, seed, selected[0] ?? readings[0]);

  return {
    available: readings.length > 0,
    coverageStatus: viewModel.status,
    identity: short(identity, "pola identitas jiwamu sedang meminta kehadiran yang lebih utuh"),
    mechanics: short(mechanics, "ritme energimu hari ini perlu dibaca dengan lebih jujur"),
    shadow: short(shadow, "ada pola lama yang lebih mudah terlihat saat kamu terlalu memaksa diri"),
    work: short(work, "karya dan talenta hari ini bergerak lewat langkah yang sederhana namun nyata"),
    relation: short(relation, "relasi hari ini menjadi cermin untuk kelembutan dan batas sehat"),
    body: short(body, "tubuh dan ruang sekitar perlu menjadi kompas sebelum kamu mengambil keputusan besar"),
    phase: short(phase, "fase hidup saat ini mengajakmu memilih arah dengan lebih matang"),
    spiritual: short(spiritual, "lapisan batinmu sedang menguat saat makna tidak dipisahkan dari kehidupan nyata"),
    anchorTheme: short(dailyAnchor, "cara kamu hadir hari ini sedang meminta arah yang lebih sederhana"),
    contributingRooms: Array.from(new Set(selected.map((reading) => reading.roomTitle))).slice(0, 6),
  };
}

function buildAstrologyBundle(blueprint: Record<string, unknown>, localDateKey: string) {
  const astrology = blueprint.astrology as Record<string, unknown> | undefined;
  const vedic = blueprint.vedic as Record<string, unknown> | undefined;
  const sun = field(astrology, ["sun", "sign"]) || field(astrology, ["sunSign"]);
  const moon = field(astrology, ["moon", "sign"]) || field(vedic, ["moonSign", "sign"]);
  const ascendant = field(astrology, ["ascendant", "sign"]) || field(vedic, ["lagna", "sign"]);
  const dasha = field(vedic, ["currentMahadasha", "planet"]);
  const dayNumber = Number(localDateKey.replace(/-/g, "")) || 0;
  const dailyTone = ["menata ritme", "menjernihkan rasa", "menguatkan batas", "membuka percakapan", "merapikan prioritas"][dayNumber % 5];

  return {
    available: Boolean(sun || moon || ascendant || dasha),
    sun: sun || "pola matahari kelahiranmu",
    moon: moon || "irama emosional kelahiranmu",
    ascendant: ascendant || "cara tubuhmu bertemu dunia",
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
  const { seed, state } = input;
  const plan = (key: string, values: string[]) => pick(values, `${seed}:${state}:${key}`, values[0]);
  const accentLabel: Record<string, string> = {
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
    const label = accentLabel[key] ?? "untuk langkahmu";
    return `${plan(`${key}:accent-a`, [
    "pilih tenang",
    "kecilkan ukuran",
    "rapikan dulu",
    "jaga ritme",
    "tunggu matang",
    "mulai dekat",
  ])} ${label}, lalu ${plan(`${key}:accent-b`, [
    "buat nyata",
    "cek tubuh",
    "hindari beban",
    "beri jeda",
    "ucap jernih",
    "tutup jelas",
  ])}`;
  };
  const adviceAccent = (key: string) => {
    const label = accentLabel[key] ?? "untuk langkahmu";
    const closing = state === "limited"
      ? plan(`${key}:advice-closing-limited`, ["dengan lembut", "secara perlahan", "dengan tenang"])
      : plan(`${key}:advice-closing-ready`, ["secara utuh", "dengan yakin", "dengan jernih"]);

    return `${plan(`${key}:advice-accent-a`, [
    "pilih ringan",
    "ukur kecil",
    "jujur dulu",
    "mulai senyap",
    "beri batas",
    "hemat tenaga",
  ])} ${label}, lalu ${plan(`${key}:advice-accent-b`, [
    "selesai dulu",
    "cek tubuh",
    "cukup mulai",
    "ambil napas",
    "bicara jernih",
    "buat bukti",
  ])} ${closing}`;
  };
  const context = state === "limited"
    ? "Hari ini lebih sehat dijalani dengan langkah yang sederhana, karena beberapa hal masih perlu kamu lihat pelan-pelan."
    : "Hari ini memberi cukup ruang untuk bergerak lebih sadar tanpa kehilangan rasa tenang.";

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
  const { name, dateLabel, seed, state } = input;
  const plan = (key: string, values: string[]) => pick(values, `${seed}:${state}:${key}`, values[0]);
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
  const { uid, profile, blueprint, arsipViewModel, localDateKey, timezone } = input;
  const now = input.referenceDate ?? new Date(`${localDateKey}T12:00:00`);
  const name = cleanText(profile.fullName || profile.displayName || profile.name) || "Sahabat Bhumi";
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
    const text = "Catatan Hari Ini belum bisa disusun karena sumber minimum dari profil dan Arsip Akashi belum tersedia.";
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
      dailyConclusion: { title: "Kesimpulan Hari Ini", text, localDateKey, timezone, owner: "daily-synthesis", sourceVersion: SOURCE_VERSION },
      dailyNarrativeParagraphs: [text],
      dailyNoteText: text,
      soulReflectionText: text,
      astrologyToday: "",
      previousProgressSummary: "",
      profileSnapshot: profile,
      blueprintSnapshot: blueprint,
      aiInsight: text,
      journalPrompt: "Bagian data apa yang perlu kulengkapi agar catatan harianku bisa dibaca lebih utuh?",
      meditationSuggestion: "Duduk hening tiga menit sambil mengecek kebutuhan tubuh.",
      dailyPractices: [],
      emotionalFocus: "readiness",
      spiritualFocus: "readiness",
      groundedAction: "Lengkapi data profil minimum.",
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
      title: "Kesimpulan Hari Ini",
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
      ? `Tema harian personal bergerak melalui ${astrology.sun}, ${astrology.moon}, dan ${astrology.ascendant}.`
      : "Astrologi personal hari ini terbatas karena data kelahiran yang diperlukan belum lengkap.",
    previousProgressSummary: journey.available ? "Journey context tersedia." : "Journey context tidak tersedia.",
    profileSnapshot: profile,
    blueprintSnapshot: blueprint,
    categories: buildDailyCategories({ seed: dailySynthesisSeed, arsip, astrology, environment, journey, state }),
    manifestation: {
      affirmation: "Hari ini aku memilih bergerak dengan ritme yang jujur dan membumi.",
      attraction: "Aku membuka ruang bagi kesempatan yang sesuai dengan pusat diriku.",
      assumption: "Aku menganggap langkah kecil yang selesai sebagai tanda bahwa arahku sedang menguat.",
    },
    aiInsight: paragraphs[0],
    journalPrompt: "Bagian mana dari hariku yang meminta ritme lebih pelan, dan keputusan apa yang bisa kubuat dari tempat yang lebih stabil?",
    meditationSuggestion: "Meditasi napas lima menit untuk kembali ke tubuh sebelum mengambil keputusan penting.",
    dailyPractices: [],
    emotionalFocus: arsip.anchorTheme,
    spiritualFocus: "Keselarasan harian",
    groundedAction: "Pilih satu langkah kecil yang selesai hari ini.",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    source: "local-fallback",
    status: "fallback",
  };
}
