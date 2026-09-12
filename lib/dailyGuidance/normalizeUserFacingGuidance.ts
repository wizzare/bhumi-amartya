import type { DailyGuidance, DailyGuidanceCategory } from "@/lib/dailyGuidance/types";
import { seededIndex } from "@/lib/dailyGuidance/dailyContentKey";
import { DAILY_GUIDANCE_CONTENT_VERSION } from "@/lib/dailyGuidance/version";
import { getTimeAwareGreeting, getTimeAwareClosing } from "@/lib/dailyGuidance/timeOfDayGreeting";
import { isEnlEdition } from "@/lib/config/edition";

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

const CATEGORY_SPECIFIC_FALLBACK_INSIGHTS_EN: Record<string, string> = {
  general: "There is a subtle shift in how you experience your surroundings today, like morning light gently changing the rhythm.",
  mental: "Your mind is drawn toward noticing and organizing patterns that are usually easy to overlook.",
  finance: "Your connection with stability is at a point where discerning your energy becomes your anchor.",
  love: "Your inner self reflects a quiet need to feel accepted as you are, without needing to prove your worth.",
  relational: "The social world around you is testing how you meet outer dynamics while remaining centered within.",
  spiritual: "Today brings an opportunity to notice meaning in the small coincidences along your path.",
  challenges: "There is an inner urge to rush decisions or decline support simply to finish faster.",
  opportunities: "A small door to try an unconventional approach is opening if you are willing to look closely.",
  advice: "The most grounded move is to turn today's small insight into one clear, tangible expression."
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

const ADVICE_VARIATIONS_EN: Record<(typeof ADVICE_THEMES)[number], string[]> = {
  pelepasan: [
    "Release one small expectation that you no longer need to carry today. An open space does not need to be immediately filled; let your mind feel relief first.",
    "Choose one burden that you can set aside for now. Not everything left unfinished must follow you into your next step.",
    "Let today pass without the urge to fix everything at once. Sometimes, allowing things to pause gently is the kindest way to ease mental weight."
  ],
  komunikasi: [
    "Share one important thought with simple, honest words. Listen to your body before responding so your words come from clarity rather than tension.",
    "Settle one conversation that feels unresolved. You do not need to over-explain; simply show up with quiet honesty.",
    "Communicate without feeling the need to defend yourself or justify your stance. Simple honesty is naturally understood."
  ],
  "tubuh dan istirahat": [
    "Begin with the body: drink water, breathe slower, and take a brief pause before adding more tasks. A small rest now keeps your choices clear.",
    "Listen to what your body is asking before chasing the next item on your list. Choose a pace you can walk without leaving yourself behind.",
    "Release the tension held in your shoulders and allow your body to move at a natural tempo. Rest is not a break from life, but how you restore perspective."
  ],
  "karya dan arah": [
    "Choose the one task that brings you closest to what truly matters. Finish a small part completely before opening too many new doors.",
    "Bring your energy back to the work that genuinely needs your presence. Today's progress is best measured by one meaningful step brought to completion.",
    "Narrow your focus to one small outcome that has an immediate impact today. Keeping your scope clear brings genuine completion and ease."
  ],
  relasi: [
    "Nurture one relationship with honest presence, without abandoning your own needs. Healthy connection never requires you to lose your inner center.",
    "Offer space to listen before offering solutions or drawing conclusions. A warm, understanding response can mean far more than advice.",
    "Reach out to someone simply to hear how they are doing, with no agenda. Sincere presence warms connection effortlessly."
  ],
  "keberanian memulai": [
    "Start with the smallest version that feels real. Courage today is not about a dramatic leap, but a willingness to take the very first step.",
    "Do not wait for conditions to be perfect. Choose one modest beginning that feels safe enough to try, and let confidence grow as you move.",
    "Take one tangible step that is right in front of you. True courage does not wait for certainty; it develops along the way."
  ],
  "batas sehat": [
    "Set one clear boundary that protects your time and energy today. You can remain kind and caring without being constantly available.",
    "Notice the part of you that readily says yes when your body needs to stop. Give an honest, gentle answer instead.",
    "Politely decline one external demand today for your own inner peace. Honoring your personal capacity is the foundation of calm."
  ],
  grounding: [
    "Return to what is closest: your breath, your feet on the ground, and one simple task. When thoughts scatter, physical presence brings you home.",
    "Tidy a small corner around you, then sit quietly for a moment without demands. Simple presence helps your energy gather and settle.",
    "Feel the solid support under your feet and take a few slow, deep breaths. Greeting physical reality right now settles a noisy mind."
  ],
  "refleksi malam": [
    "Set aside a few quiet minutes tonight to observe what energized you and what drained you. Take one lesson into tomorrow, and allow the rest to rest.",
    "Before sleeping, write down one thing you are grateful for and one burden you are willing to release. Let the evening be a soft closure.",
    "Close the day by letting achievements and shortcomings dissolve into peaceful rest. Tonight is a time to release all self-evaluation."
  ],
  "merapikan prioritas": [
    "Take one small step that brings order to your mind. Today is not about doing everything, but caring well for what matters most.",
    "Distinguish between what is truly meaningful and what merely feels urgent. Choose one priority, give it focused time, and let other things wait.",
    "Write down your primary focus for today and let the rest of your list stand by. Focusing on one thing at a time restores tired minds."
  ],
  kedekatan: [
    "Tend to the intimate space within yourself by letting honest feelings arise without judgment. Warm relationships grow from showing up as you are.",
    "Check in with your own heart before sharing it with others. Sincere intimacy begins when you feel grounded and at home in yourself.",
    "Share one vulnerability or gentle gratitude with someone you care about. Allowing yourself to be seen deepens genuine connection."
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

const THEME_ACTIONS_EN: Record<(typeof ADVICE_THEMES)[number], string[]> = {
  pelepasan: [
    "Write down what you wish to let go of, then set the note aside without judging yourself.",
    "Clear one small surface as a quiet sign that you are making room for fresh clarity."
  ],
  komunikasi: [
    "Choose a calm moment to express what you need without adding unnecessary justification.",
    "Before speaking, take three calm breaths and focus on the one core truth you want to convey."
  ],
  "tubuh dan istirahat": [
    "Step away from screens for ten minutes to give your nervous system a chance to settle.",
    "Drink a glass of water, gently stretch, and take a conscious pause before continuing."
  ],
  "karya dan arah": [
    "Set a brief window for one key task, then wrap up by noting the next small step for later.",
    "Define one clear, modest outcome and complete it without starting new projects halfway through."
  ],
  relasi: [
    "Ask what is truly needed, and listen attentively without rushing to fix anything.",
    "Offer a warm, attentive response while honoring the boundaries that keep you feeling safe."
  ],
  "keberanian memulai": [
    "Spend ten minutes testing out the very first step, without expecting immediate perfection.",
    "Take one small opening action now before doubt has a chance to expand."
  ],
  "batas sehat": [
    "Decide on one commitment you will decline today, and use the recovered time to recharge.",
    "Express a boundary briefly and kindly, without apologizing for a reasonable need."
  ],
  grounding: [
    "Put your phone away for a while, feel your feet on the ground, and attend to one task to completion.",
    "Take three long breaths and organize one object near you before choosing your next move."
  ],
  "refleksi malam": [
    "End the day with a few lines of journaling, stopping before reflection turns into self-critique.",
    "Note one insight and one gratitude, then give your body full permission to rest."
  ],
  "merapikan prioritas": [
    "Write down three tasks, circle the single most important one, and let the other two wait.",
    "Select one realistic priority and assign it a clear time window so your energy remains focused."
  ],
  kedekatan: [
    "Write down one thing you truly appreciate about how you are caring for yourself today.",
    "Take a quiet moment to connect with your own feelings before responding to messages."
  ]
};

function selectAdviceTheme(categoryKey: string, guidance: DailyGuidance): (typeof ADVICE_THEMES)[number] {
  const context = [guidance.soulReflectionText, guidance.dailyNoteText, guidance.astrologyToday, guidance.previousProgressSummary]
    .filter(Boolean).join(" ").toLowerCase();
  const keywordThemes: Array<[RegExp, (typeof ADVICE_THEMES)[number]]> = [
    [/lepas|selesai|waning|penutup|release|closure|complete|letting go/, "pelepasan"],
    [/komunik|merkuri|bicara|percakapan|communicat|mercury|speak|conversation|express/, "komunikasi"],
    [/tubuh|istirahat|lelah|napas|body|rest|tired|breathe|fatigue|somatic/, "tubuh dan istirahat"],
    [/karya|karier|kerja|tujuan|career|work|goal|direction|purpose|project/, "karya dan arah"],
    [/relasi|cinta|keluarga|venus|relation|love|family|partner|connection/, "relasi"],
    [/mulai|awal|new moon|berani|start|begin|courage|initiative|fresh/, "keberanian memulai"],
    [/batas|saturn|kapasitas|boundar|saturn|limit|capacity|protect/, "batas sehat"],
    [/ground|membumi|stabil|earth|anchor|steady|foundation/, "grounding"],
    [/malam|tidur|hening|evening|night|sleep|stillness|quiet/, "refleksi malam"],
    [/prioritas|fokus|rapikan|priorit|focus|organize|clarify|order/, "merapikan prioritas"],
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

function buildPersonalFallbackAdvice(categoryKey: string, guidance: DailyGuidance, isEn: boolean = false): string {
  const seed = `${guidance.dailyVariationSeed || `${guidance.uid}|${guidance.localDateKey || guidance.date}`}|${categoryKey}|fanta-advice`;
  const theme = selectAdviceTheme(categoryKey, guidance);
  const options = isEn ? ADVICE_VARIATIONS_EN[theme] : ADVICE_VARIATIONS[theme];
  const advice = options[seededIndex(seed, options.length)];
  const actions = isEn ? THEME_ACTIONS_EN[theme] : THEME_ACTIONS[theme];
  const action = actions[seededIndex(`${seed}|action`, actions.length)];
  return `${advice} ${action}`.replace(/\s+/g, " ").trim();
}

const BAD_ADVICE_PATTERN = /ini selaras dengan|pesan harianmu|inti dirimu|kamu berada di|berdasarkan|["“”]/i;
const BAD_ADVICE_PATTERN_EN = /this aligns with|your daily message|the core of you|you are in|based on|["“”]/i;
const INCOMPLETE_ENDING_PATTERN = /\b(?:di|dan|yang|untuk|dengan)$/i;
const INCOMPLETE_ENDING_PATTERN_EN = /\b(?:in|and|that|for|with|of|to|at|by)$/i;

function sentenceCount(value: string): number {
  return value.split(/[.!?]+/).map((item) => item.trim()).filter(Boolean).length;
}

function isInvalidAdvice(value: string | undefined, isEn: boolean = false): boolean {
  if (!value) return true;
  const text = value.replace(/\s+/g, " ").trim();
  const lower = text.toLowerCase();
  const badPattern = isEn ? BAD_ADVICE_PATTERN_EN : BAD_ADVICE_PATTERN;
  const incompletePattern = isEn ? INCOMPLETE_ENDING_PATTERN_EN : INCOMPLETE_ENDING_PATTERN;

  return text.length < 80
    || text.length > 350
    || sentenceCount(text) < 2
    || sentenceCount(text) > 3
    || badPattern.test(text)
    || incompletePattern.test(text.replace(/[.!?]+$/, "").trim())
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

const BLACKLIST_PATTERNS_EN = [
  { key: "small_step", regex: /one small step|small step/gi, replacement: "tangible action" },
  { key: "finish_everything", regex: /(?:do not|don't|no need to) (?:have to )?finish everything|does not need to be finished all at once/gi, replacement: "let the rest unfold naturally" },
  { key: "just_be_present", regex: /just be present|simply be present|return to the present/gi, replacement: "observe your current state" },
  { key: "give_space", regex: /give space|give yourself space|allow room/gi, replacement: "create quiet room" },
  { key: "slowly", regex: /slowly|take it slow/gi, replacement: "without rushing" },
  { key: "save_energy", regex: /save energy|protect your energy|conserve energy/gi, replacement: "honor your personal capacity" },
  { key: "take_a_breath", regex: /take a deep breath|take a breath|breathe slowly/gi, replacement: "return to your breath" }
];

export function deconflictBlacklistPhrases(text: string | undefined, seenCounts: Record<string, number>, isEn: boolean = false): string | undefined {
  if (!text) return text;
  let result = text;
  const patterns = isEn ? BLACKLIST_PATTERNS_EN : BLACKLIST_PATTERNS;
  for (const pattern of patterns) {
    pattern.regex.lastIndex = 0;
    if (pattern.regex.test(result)) {
      pattern.regex.lastIndex = 0;
      result = result.replace(pattern.regex, pattern.replacement);
      seenCounts[pattern.key] = (seenCounts[pattern.key] || 0) + 1;
    }
  }
  return cleanupUserFacingSurface(result);
}

function sanitizeAdvice(value: string | undefined, categoryKey: string, guidance: DailyGuidance, forceFallback: boolean, isEn: boolean = false): string {
  const normalized = normalizeUserFacingText(value)?.replace(/\s+/g, " ").trim();
  if (forceFallback || isInvalidAdvice(normalized, isEn)) {
    return buildPersonalFallbackAdvice(categoryKey, guidance, isEn);
  }
  return normalized as string;
}

function normalizeCategory(categoryKey: string, category: DailyGuidanceCategory, guidance: DailyGuidance, forceFallback: boolean, seenCounts: Record<string, number>, isEn: boolean = false): DailyGuidanceCategory {
  const defaultInsight = isEn
    ? (CATEGORY_SPECIFIC_FALLBACK_INSIGHTS_EN[categoryKey] || CATEGORY_SPECIFIC_FALLBACK_INSIGHTS_EN.general)
    : (CATEGORY_SPECIFIC_FALLBACK_INSIGHTS[categoryKey] || CATEGORY_SPECIFIC_FALLBACK_INSIGHTS.general);
  return {
    ...category,
    insight: deconflictBlacklistPhrases(normalizeUserFacingText(category.insight) || defaultInsight, seenCounts, isEn) || "",
    reason: deconflictBlacklistPhrases(normalizeUserFacingText(category.reason) || defaultInsight, seenCounts, isEn) || "",
    reflection: deconflictBlacklistPhrases(normalizeUserFacingText(category.reflection), seenCounts, isEn),
    advice: deconflictBlacklistPhrases(sanitizeAdvice(category.advice, categoryKey, guidance, forceFallback, isEn), seenCounts, isEn) || "",
  };
}

function getFirstName(profile: any, language: "id" | "en" = "id"): string {
  if (!profile) return language === "en" ? "Friend" : "Sahabat";
  const nameVal = profile.fullName || profile.displayName || profile.name || 
                  profile.profile?.fullName || profile.profile?.displayName || profile.profile?.name;
  if (typeof nameVal === "string" && nameVal.trim()) {
    return nameVal.trim().split(/\s+/)[0];
  }
  return language === "en" ? "Friend" : "Sahabat";
}

function getDayName(dateString?: string, language: "id" | "en" = "id"): string {
  const dayNamesId = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const dayNamesEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayNames = language === "en" ? dayNamesEn : dayNamesId;

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

const COMPANION_SENTENCES_EN = [
  "Tomorrow we will continue from where we leave off.",
  "Not every question needs to be answered today.",
  "Thank you for showing up for yourself today.",
  "Take a gentle pause before the night grows deep.",
  "I remain here by your side.",
  "Let the rest settle naturally on its own.",
  "You have traveled far enough today; give yourself rest.",
  "Save a few reflections for tomorrow.",
  "Whatever remains unfinished will be waiting gently tomorrow.",
  "You can close today without judgment or pressure."
];

export function standardizeSoulReflection(
  text: string | undefined,
  guidance: DailyGuidance,
  profile?: any
): string | undefined {
  if (!text) return text;

  let bodyText = text.trim();

  // Clean leading greeting patterns in both languages
  const greetingPattern = /^(?:hai|selamat|membaca jiwamu|halo|jiwa|hello|hi|good\s+(?:morning|afternoon|evening|night))[^.!?]*?[.!?]\s*/i;
  while (greetingPattern.test(bodyText)) {
    bodyText = bodyText.replace(greetingPattern, "").trim();
  }

  const profileData = profile || guidance.profileSnapshot;
  const language: "id" | "en" = isEnlEdition() ? "en" : "id";
  const firstName = getFirstName(profileData, language);
  const dateKey = guidance.localDateKey || guidance.date || new Date().toISOString().slice(0, 10);
  const dayName = getDayName(dateKey, language);

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
      lastPara.includes("jaga ritmemu") ||
      lastPara.includes("warm hugs") ||
      lastPara.includes("from bhumi") ||
      lastPara.includes("tomorrow we continue") ||
      lastPara.includes("not everything needs to be finished") ||
      lastPara.includes("thank you for being present") ||
      lastPara.includes("pause for a moment") ||
      lastPara.includes("i remain here") ||
      lastPara.includes("let the rest settle") ||
      lastPara.includes("you have walked far enough") ||
      lastPara.includes("save a few questions") ||
      lastPara.includes("today is enough") ||
      lastPara.includes("breathe slowly") ||
      lastPara.includes("what can you release") ||
      lastPara.includes("take it slow") ||
      lastPara.includes("pace yourself")
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
  const profileData = profile || guidance.profileSnapshot;
  const isEn = isEnlEdition();

  const seenCounts: Record<string, number> = {
    tidak_menyelesaikan: 1, // Pre-seeded to avoid matching hardcoded header in DailyNoteV2
    finish_everything: 1,
  };

  const defaultInsightGeneral = isEn ? CATEGORY_SPECIFIC_FALLBACK_INSIGHTS_EN.general : CATEGORY_SPECIFIC_FALLBACK_INSIGHTS.general;
  const defaultInsightAdvice = isEn ? CATEGORY_SPECIFIC_FALLBACK_INSIGHTS_EN.advice : CATEGORY_SPECIFIC_FALLBACK_INSIGHTS.advice;

  const rawReflection = normalizeUserFacingText(guidance.soulReflectionText) || defaultInsightGeneral;
  const soulReflectionText = deconflictBlacklistPhrases(
    standardizeSoulReflection(rawReflection, guidance, profileData),
    seenCounts,
    isEn
  );

  const dailyNoteText = deconflictBlacklistPhrases(
    normalizeUserFacingText(guidance.dailyNoteText) || defaultInsightGeneral,
    seenCounts,
    isEn
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
          return [key, normalizeCategory(key, category, guidance, forceFallback, seenCounts, isEn)];
        }),
      ) as DailyGuidance["categories"]
    : undefined;

  return {
    ...guidance,
    guidanceVersion: DAILY_GUIDANCE_CONTENT_VERSION,
    categories,
    soulReflectionText,
    dailyNoteText,
    aiInsight: deconflictBlacklistPhrases(normalizeUserFacingText(guidance.aiInsight) || defaultInsightAdvice, seenCounts, isEn) || "",
    astrologyToday: deconflictBlacklistPhrases(normalizeUserFacingText(guidance.astrologyToday) || (isEn ? "Gently observe your rhythm today." : "Amati ritmemu hari ini dengan lembut."), seenCounts, isEn) || "",
    previousProgressSummary: deconflictBlacklistPhrases(normalizeUserFacingText(guidance.previousProgressSummary), seenCounts, isEn) || "",
    journalPrompt: deconflictBlacklistPhrases(normalizeUserFacingText(guidance.journalPrompt) || (isEn ? "What is the one thing you most wish to care for today?" : "Apa satu hal yang paling ingin kamu rawat hari ini?"), seenCounts, isEn) || "",
    meditationSuggestion: deconflictBlacklistPhrases(normalizeUserFacingText(guidance.meditationSuggestion) || (isEn ? "Sit quietly in stillness for a few minutes." : "Duduk tenang selama beberapa menit."), seenCounts, isEn) || "",
    audioHealingSuggestion: deconflictBlacklistPhrases(normalizeUserFacingText(guidance.audioHealingSuggestion), seenCounts, isEn),
    emotionalFocus: deconflictBlacklistPhrases(normalizeUserFacingText(guidance.emotionalFocus) || (isEn ? "Presence" : "Kehadiran"), seenCounts, isEn) || "",
    spiritualFocus: deconflictBlacklistPhrases(normalizeUserFacingText(guidance.spiritualFocus) || (isEn ? "Clarity" : "Kejernihan"), seenCounts, isEn) || "",
    groundedAction: deconflictBlacklistPhrases(normalizeUserFacingText(guidance.groundedAction) || defaultInsightGeneral, seenCounts, isEn) || "",
    companionReflection: {
      preview: deconflictBlacklistPhrases(
        normalizeUserFacingText(guidance.companionReflection?.preview)
        || normalizeUserFacingText(guidance.dailyNoteText)
        || soulReflectionText
        || defaultInsightGeneral,
        seenCounts,
        isEn,
      ) || "",
      fullReflection: deconflictBlacklistPhrases(
        normalizeUserFacingText(guidance.companionReflection?.fullReflection)
        || normalizeUserFacingText(guidance.soulReflectionText)
        || normalizeUserFacingText(guidance.aiInsight)
        || soulReflectionText
        || defaultInsightGeneral,
        seenCounts,
        isEn,
      ) || "",
    },
  };
}
