type HumanDesignPresentationSource = Record<string, any>;

const VALUE_TRANSLATIONS: Record<string, string> = {
  "wait to respond": "Menunggu Respons",
  "to respond": "Menunggu Respons",
  respond: "Merespons",
  "wait for the invitation": "Menunggu Undangan",
  "wait for invitation": "Menunggu Undangan",
  "wait to be invited": "Menunggu Undangan",
  "to inform": "Memberi Tahu",
  inform: "Memberi Tahu",
  "wait a lunar cycle": "Menunggu Satu Siklus Bulan",
  "wait for a lunar cycle": "Menunggu Satu Siklus Bulan",
  "sacral authority": "Otoritas Sakral",
  sacral: "Otoritas Sakral",
  "emotional authority": "Otoritas Emosional",
  "solar plexus authority": "Otoritas Emosional",
  emotional: "Otoritas Emosional",
  "splenic authority": "Otoritas Limpa",
  splenic: "Otoritas Limpa",
  "ego manifested authority": "Otoritas Ego yang Diekspresikan",
  "ego projected authority": "Otoritas Ego yang Diproyeksikan",
  "self-projected authority": "Otoritas Diri yang Diproyeksikan",
  "environmental authority": "Otoritas Lingkungan",
  "mental authority": "Otoritas Lingkungan",
  "lunar authority": "Otoritas Bulan",
  "no inner authority": "Tanpa Otoritas Batin",
  satisfaction: "Kepuasan",
  success: "Keberhasilan",
  peace: "Kedamaian",
  surprise: "Kejutan",
  frustration: "Frustrasi",
  bitterness: "Kepahitan",
  anger: "Kemarahan",
  disappointment: "Kekecewaan",
  "single definition": "Definisi Tunggal",
  "split definition": "Definisi Terpisah",
  "wide split definition": "Definisi Terpisah Lebar",
  "triple split definition": "Definisi Terpisah Tiga",
  "quadruple split definition": "Definisi Terpisah Empat",
  "no definition": "Tanpa Definisi Tetap",
  appetite: "Nafsu Makan Alami",
  "alternating appetite": "Nafsu Makan Berselang",
  "consecutive appetite": "Nafsu Makan Berurutan",
  taste: "Kepekaan Rasa",
  "open taste": "Rasa Terbuka",
  "closed taste": "Rasa Selektif",
  thirst: "Kebutuhan Cairan",
  "hot thirst": "Asupan Hangat",
  "cold thirst": "Asupan Sejuk",
  touch: "Kepekaan Sentuhan",
  "calm touch": "Sentuhan Tenang",
  "nervous touch": "Sentuhan Aktif",
  sound: "Kepekaan Suara",
  light: "Pola Cahaya",
  "high sound": "Suara Kuat",
  "low sound": "Suara Lembut",
  smell: "Kepekaan Aroma",
  "outer vision": "Pengamatan Visual",
  "inner vision": "Penglihatan Batin",
  feeling: "Kepekaan Perasaan",
  caves: "Lingkungan Privat",
  markets: "Lingkungan Pasar",
  kitchens: "Lingkungan Peracikan",
  mountains: "Lingkungan Tinggi",
  valleys: "Lingkungan Berjejaring",
  shores: "Lingkungan Perbatasan",
  fear: "Kewaspadaan",
  hope: "Harapan",
  desire: "Hasrat",
  need: "Kebutuhan",
  guilt: "Rasa Tanggung Jawab",
  innocence: "Ketulusan",
  survival: "Melihat Daya Bertahan",
  possibility: "Melihat Kemungkinan",
  power: "Melihat Daya Pengaruh",
  wanting: "Melihat Keinginan",
  probability: "Melihat Kemungkinan Nyata",
  personal: "Melihat Secara Personal",
  investigator: "Peneliti",
  hermit: "Penyendiri Kreatif",
  martyr: "Pembelajar melalui Pengalaman",
  opportunist: "Penghubung Peluang",
  heretic: "Pemecah Masalah",
  "role model": "Teladan",
};

const INLINE_TRANSLATIONS = Object.entries(VALUE_TRANSLATIONS)
  .sort((a, b) => b[0].length - a[0].length);

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : value === null || value === undefined ? "" : String(value);
}

export function localizeHumanDesignValue(value: unknown): string {
  const raw = text(value);
  if (!raw) return "";
  const exact = VALUE_TRANSLATIONS[raw.toLowerCase()];
  if (exact) return exact;

  let localized = raw;
  for (const [english, indonesian] of INLINE_TRANSLATIONS) {
    localized = localized.replace(new RegExp(`\\b${english.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi"), indonesian);
  }
  return localized;
}

export function localizeHumanDesignDefinition(value: unknown): string {
  const raw = text(value);
  const numericDefinitions: Record<string, string> = {
    "1": "Definisi Tunggal",
    "2": "Definisi Terpisah",
    "3": "Definisi Terpisah Tiga",
    "4": "Definisi Terpisah Empat",
  };
  return numericDefinitions[raw] || localizeHumanDesignValue(raw);
}

const CENTER_TRANSLATIONS: Record<string, string> = {
  head: "Kepala",
  ajna: "Ajna",
  throat: "Tenggorokan",
  g: "Identitas",
  ego: "Ego",
  heart: "Jantung",
  spleen: "Limpa",
  sacral: "Sakral",
  "solar plexus": "Solar Plexus",
  solarplexus: "Solar Plexus",
  root: "Akar",
};

export function localizeCenterName(value: string): string {
  const normalized = value.replace(/([A-Z])/g, " $1").trim().toLowerCase();
  return CENTER_TRANSLATIONS[normalized] || value;
}

export type IncarnationCrossPresentation = {
  name: string | null;
  gates: number[];
  gatesLabel: string;
};

export function presentIncarnationCross(value: unknown): IncarnationCrossPresentation {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const rawName = text(source.name || (typeof value === "string" ? value : ""));
  const storedGates = Array.isArray(source.gates) ? source.gates : [];
  const parsedGates = storedGates
    .map(Number)
    .filter((gate) => Number.isFinite(gate) && gate >= 1 && gate <= 64);
  const gatesFromParser = (rawName.match(/\d+/g) || [])
    .map(Number)
    .filter((gate) => gate >= 1 && gate <= 64);
  const parserSyntax = /[()[\],]|-(?:LAC|RAC|JC)\s*$/i.test(rawName);
  const gates = [...new Set(parserSyntax && gatesFromParser.length ? gatesFromParser : parsedGates.length ? parsedGates : gatesFromParser)].slice(0, 4);

  return {
    name: rawName && !parserSyntax ? rawName : null,
    gates,
    gatesLabel: gates.join(" • "),
  };
}

function profileNarrative(profile: string): string {
  const lineNumbers = profile.match(/[1-6]/g) || [];
  const lineStories: Record<string, string> = {
    "1": "membangun rasa percaya melalui fondasi yang benar-benar kamu pahami",
    "2": "memberi bakat alami cukup ruang untuk matang sebelum dibagikan",
    "3": "menemukan kebijaksanaan melalui pengalaman langsung, percobaan, dan perbaikan",
    "4": "bertumbuh melalui hubungan yang tulus serta lingkungan yang saling percaya",
    "5": "melihat jalan keluar praktis ketika orang lain sedang menghadapi kebuntuan",
    "6": "menjadi teladan melalui kehidupan yang sudah kamu alami sendiri",
  };
  const unique = [...new Set(lineNumbers)].slice(0, 2);
  if (!unique.length) return "membiarkan pengalaman membentuk peranmu secara alami";
  if (unique.length === 1) return lineStories[unique[0]];
  return `${lineStories[unique[0]]}, lalu ${lineStories[unique[1]]}`;
}

function typeNarrative(type: string): string {
  const stories: Record<string, string> = {
    "Manifesting Generator": "Tenagamu bergerak cepat ketika ada sesuatu yang benar-benar memancing respons. Kamu mampu menjelajah beberapa jalur sekaligus, lalu menemukan cara yang lebih efisien setelah tubuh ikut terlibat.",
    Generator: "Daya hidupmu menguat ketika kegiatan yang dipilih memberi rasa hidup dari dalam. Ketekunan menjadi hadiahmu saat tubuh memang ingin terlibat, bukan saat pikiran merasa harus bertahan.",
    Projector: "Kekuatanmu terletak pada kemampuan melihat orang, pola, dan sistem dengan tajam. Energi bekerja paling bernilai ketika pengamatanmu dikenali dan diberikan ruang yang tepat.",
    Manifestor: "Ada dorongan alami untuk membuka jalan dan memulai gerak baru. Kebebasanmu terasa lebih lapang ketika orang yang terdampak tidak dibiarkan menebak arahmu.",
    Reflector: "Kepekaanmu menangkap kualitas lingkungan dan kelompok secara mendalam. Jarak serta waktu membantumu membedakan mana yang benar-benar milikmu dan mana yang sedang kamu cerminkan.",
  };
  return stories[type] || "Energi alammu memiliki ritme tersendiri yang menjadi lebih jelas ketika tubuh tidak dipaksa mengikuti kecepatan orang lain.";
}

function strategyNarrative(strategy: string): string {
  const normalized = strategy.toLowerCase();
  if (normalized.includes("respond")) return "Arah yang tepat biasanya muncul setelah kehidupan memberimu sesuatu yang nyata untuk ditanggapi.";
  if (normalized.includes("invitation") || normalized.includes("invited")) return "Pengakuan dan undangan yang tepat membuat kemampuanmu diterima tanpa harus terus membuktikan diri.";
  if (normalized.includes("inform")) return "Memberi tahu arahmu sebelum bergerak membantu kebebasan dan hubungan berjalan tanpa hambatan yang tidak perlu.";
  if (normalized.includes("lunar") || normalized.includes("moon")) return "Keputusan besar membutuhkan waktu yang cukup panjang agar berbagai sisi dirimu sempat berbicara.";
  return "Kejernihan tumbuh ketika tindakan tidak mendahului kesiapan tubuhmu.";
}

function authorityNarrative(authority: string): string {
  const normalized = authority.toLowerCase();
  if (normalized.includes("sacral")) return "Pilihan yang jujur terasa sebagai respons tubuh yang sederhana—ada tenaga untuk mendekat, atau tidak ada tenaga untuk melanjutkan.";
  if (normalized.includes("emotional") || normalized.includes("solar")) return "Kejernihanmu datang setelah gelombang emosi memperoleh waktu untuk naik dan turun; keputusan penting tidak perlu lahir pada puncaknya.";
  if (normalized.includes("splenic")) return "Intuisimu berbicara singkat dan tenang pada saat ini. Ia lebih menyerupai rasa tahu yang halus daripada penjelasan panjang.";
  if (normalized.includes("self")) return "Arah diri terdengar ketika kamu mengucapkan pilihan dengan suara sendiri dan merasakan mana yang benar-benar terdengar seperti dirimu.";
  if (normalized.includes("ego") || normalized.includes("heart")) return "Komitmen perlu berangkat dari keinginan yang sungguh milikmu, bukan dari kebutuhan membuktikan nilai diri.";
  if (normalized.includes("environment") || normalized.includes("mental")) return "Lingkungan dan percakapan yang tepat membantumu mendengar pikiran tanpa harus menjadikannya pengambil keputusan tunggal.";
  if (normalized.includes("lunar")) return "Siklus waktu yang utuh membantumu melihat keputusan dari cukup banyak sudut sebelum menetapkan arah.";
  return "Tubuhmu memiliki cara sendiri untuk memberi kejernihan sebelum pikiran menyusun alasan.";
}

function definitionNarrative(definition: string): string {
  const normalized = definition.toLowerCase();
  if (normalized === "1" || normalized.includes("single")) return "Banyak proses batin dapat tersambung dan selesai dari dalam dirimu sendiri.";
  if (normalized === "4" || normalized.includes("quadruple")) return "Beberapa bagian dalam dirimu bekerja seperti ruang yang mandiri; waktu dan pertemuan yang beragam membantu semuanya menemukan hubungan.";
  if (normalized === "3" || normalized.includes("triple")) return "Kejernihan sering tumbuh melalui beberapa tahap dan lebih dari satu jenis interaksi.";
  if (normalized === "2" || normalized.includes("split")) return "Pertemuan yang tepat dapat menjembatani bagian dirimu yang memproses pengalaman dengan cara berbeda.";
  return "Keterhubungan batinmu berubah mengikuti lingkungan serta orang yang hadir di sekitarmu.";
}

function variableNarrative(value: unknown): string {
  const code = text(value).toUpperCase();
  const left = (code.match(/L/g) || []).length;
  const right = (code.match(/R/g) || []).length;
  if (left > right) return "Cara alami mengolah pengalaman cenderung terarah dan terbantu oleh pola yang dapat diulang.";
  if (right > left) return "Kamu lebih reseptif ketika ada ruang untuk menyerap pengalaman tanpa mengatur semuanya sejak awal.";
  return "Kamu memadukan kebutuhan akan struktur dengan kemampuan menerima hal yang belum dapat direncanakan.";
}

export function buildHumanDesignReading(source: HumanDesignPresentationSource): string[] {
  const type = text(source.type);
  const strategy = text(source.strategy);
  const authority = text(source.authority);
  const profile = text(source.profile);
  const definition = text(source.definition);
  const signature = localizeHumanDesignValue(source.signature) || "rasa selaras";
  const notSelf = localizeHumanDesignValue(source.notSelfTheme) || "ketegangan";
  const centers = source.centers && typeof source.centers === "object" ? Object.values(source.centers) : [];
  const definedCount = centers.filter((value) => value === true).length;
  const openCount = centers.filter((value) => value === false).length;
  const channelCount = Array.isArray(source.channels) ? source.channels.length : 0;
  const variables = source.variables?.advanced || source.variables || {};
  const variableCode = variables.variable || variables.value || variables.short_code;
  const digestion = localizeHumanDesignValue(source.digestion) || "ritme cerna yang alami";
  const environment = localizeHumanDesignValue(source.environment) || "lingkungan yang terasa tepat";
  const cognition = localizeHumanDesignValue(source.cognition) || "kepekaan tubuh";
  const motivation = localizeHumanDesignValue(source.motivation) || "dorongan batin";
  const perspective = localizeHumanDesignValue(source.perspective) || "cara pandang alami";
  const cross = presentIncarnationCross(source.incarnationCross);
  const lifeTheme = cross.name
    ? `${cross.name}${cross.gatesLabel ? ` melalui Gate ${cross.gatesLabel}` : ""}`
    : cross.gatesLabel
      ? `Gate ${cross.gatesLabel}`
      : "tema kehidupan yang terus memperoleh makna melalui pengalaman";

  return [
    `${typeNarrative(type)} ${strategyNarrative(strategy)} ${authorityNarrative(authority)} Profilmu mempertemukan cara untuk ${profileNarrative(profile)}.`,
    `${definitionNarrative(definition)} ${channelCount > 0 ? `${channelCount} channel aktif menghubungkan kekuatan yang dapat kamu akses secara konsisten.` : "Kekuatanmu tidak perlu selalu hadir dengan bentuk yang sama."} ${definedCount > 0 ? `${definedCount} pusat yang terdefinisi memberi pijakan energi yang relatif stabil` : "Energi tetap peka terhadap konteks"}${openCount > 0 ? `, sementara ${openCount} pusat terbuka membuatmu mudah menangkap suasana dan kebutuhan di sekitar` : ""}. ${variableNarrative(variableCode)}`,
    `Tubuh lebih mudah didengar melalui ${digestion.toLowerCase()} dan ${environment.toLowerCase()}; ${cognition.toLowerCase()} menjadi pintu kepekaanmu. Dorongan ${motivation.toLowerCase()} membentuk cara bergerak, sedangkan ${perspective.toLowerCase()} memengaruhi apa yang pertama kali kamu lihat. ${signature} menandai saat hidup terasa mengalir, sementara ${notSelf.toLowerCase()} mengingatkan bahwa ritmemu sedang ditinggalkan. Benang merah ${lifeTheme} mengajak seluruh pola ini tumbuh menjadi cara hidup yang benar-benar milikmu.`,
  ];
}

export type HumanMeaningSection = {
  title: string;
  paragraphs: string[];
};

export type HumanDesignHumanMeaning = {
  type: HumanMeaningSection;
  strategy: HumanMeaningSection;
  authority: HumanMeaningSection;
  profile: HumanMeaningSection;
  definition: HumanMeaningSection;
  signature: HumanMeaningSection;
  notSelf: HumanMeaningSection;
  centers: Record<string, string>;
  channels: Record<string, string>;
  gates: Record<number, string>;
  variables: {
    digestion: string;
    cognition: string;
    environment: string;
    motivation: string;
    perspective: string;
  };
  incarnationCross: HumanMeaningSection;
  summary: string[];
};

const GATE_EXPERIENCES: Record<number, [string, string, string]> = {
  1: ["mengekspresikan sesuatu dengan cara yang khas", "membawa kebaruan tanpa harus meniru", "mencipta saat dorongan memang hidup, bukan demi perhatian"],
  2: ["merasakan arah sebelum langkahnya sepenuhnya jelas", "menerima petunjuk dari dalam dan dari lingkungan", "membiarkan arah datang tanpa memaksakan peta"],
  3: ["memasuki awal yang masih berantakan", "menemukan susunan baru di tengah perubahan", "memberi proses baru waktu untuk menemukan ritmenya"],
  4: ["mencari jawaban yang dapat menenangkan keraguan", "merumuskan solusi dengan logis", "menerima bahwa tidak semua pertanyaan perlu segera ditutup"],
  5: ["peka terhadap rutinitas dan waktu yang terasa tepat", "membangun kestabilan melalui pola yang konsisten", "menjaga ritme tanpa menjadi kaku"],
  6: ["merasakan batas emosional dalam kedekatan", "membuka keintiman ketika rasa aman hadir", "tidak memaksa kedekatan sebelum kedua pihak siap"],
  7: ["melihat arah yang dapat diikuti bersama", "memimpin tanpa harus selalu berada di depan", "menunggu kepercayaan sebelum mengambil kendali"],
  8: ["ingin memberi warna pribadi pada karya bersama", "mendorong orang lain melalui contoh yang otentik", "berkontribusi tanpa mengejar pengakuan"],
  9: ["mengarahkan perhatian pada bagian kecil", "menjaga fokus sampai sesuatu benar-benar bergerak", "memilih satu hal penting tanpa terjebak detail"],
  10: ["menjaga perilaku tetap selaras dengan diri", "membawa rasa hormat pada keunikan pribadi", "mencintai diri tanpa menutup diri dari masukan"],
  11: ["mengumpulkan banyak gambaran dan kemungkinan", "menghidupkan percakapan melalui ide", "tidak menuntut setiap ide berubah menjadi tindakan"],
  12: ["memilih waktu yang tepat untuk membuka suara", "menyentuh orang melalui ekspresi yang jujur", "menghormati suasana hati sebelum berbicara"],
  13: ["menjadi tempat orang menitipkan cerita", "mendengar pola masa lalu yang sering terlewat", "menjaga batas agar empati tidak menjadi beban"],
  14: ["menggerakkan sumber daya menuju hal yang disukai", "membawa tenaga besar ke karya yang bermakna", "tidak menghabiskan daya untuk tujuan yang terasa kosong"],
  15: ["menjalani ritme yang kadang sangat beragam", "menerima banyak jenis manusia dan cara hidup", "menemukan titik tengah tanpa mematikan keluasan diri"],
  16: ["mengasah keterampilan melalui pengulangan", "membawa antusiasme yang menular", "memberi latihan cukup waktu sebelum tampil"],
  17: ["menyusun pendapat dari pola yang terlihat", "memberi arah melalui pandangan yang terstruktur", "menyampaikan opini sebagai tawaran, bukan kepastian mutlak"],
  18: ["cepat melihat bagian yang dapat diperbaiki", "meningkatkan mutu melalui kepekaan yang tajam", "mengoreksi tanpa membuat diri atau orang lain merasa selalu kurang"],
  19: ["peka terhadap kebutuhan dan rasa diterima", "menciptakan kedekatan melalui perhatian", "membedakan kebutuhan nyata dari takut ditinggalkan"],
  20: ["hadir kuat pada apa yang sedang terjadi", "bertindak atau berbicara dengan spontan ketika waktunya tepat", "tidak memakai kesibukan untuk lari dari keheningan"],
  21: ["ingin mengatur sumber daya dan tanggung jawab", "menjaga kemandirian serta ketertiban", "berbagi kendali ketika kerja sama lebih sehat"],
  22: ["membawa kehangatan ketika hati sedang terbuka", "menciptakan suasana sosial yang anggun", "tidak memaksa keramahan saat emosi membutuhkan ruang"],
  23: ["menyederhanakan wawasan yang rumit", "membuat gagasan baru mudah dipahami", "menunggu saat orang benar-benar siap mendengar"],
  24: ["kembali pada satu pikiran sampai terasa masuk akal", "mengolah kebingungan menjadi pemahaman", "memberi kepala jeda agar jawaban tidak dipaksa"],
  25: ["menemui hidup dengan hati yang terbuka", "memulihkan orang melalui ketulusan", "tetap polos tanpa mengabaikan batas dan kenyataan"],
  26: ["membaca cara menyampaikan sesuatu agar diterima", "mempengaruhi melalui daya komunikasi", "menjaga integritas saat ingin meyakinkan orang"],
  27: ["secara alami ingin merawat dan menyediakan", "membuat orang merasa ditopang", "memastikan diri sendiri ikut menerima perhatian"],
  28: ["mencari perjuangan yang terasa layak", "menemukan tujuan melalui keberanian menghadapi risiko", "tidak mengubah setiap kesulitan menjadi pertempuran"],
  29: ["masuk penuh ke pengalaman yang sudah dipilih", "membangun daya tahan melalui komitmen", "mengatakan ya setelah tubuh siap, bukan karena tekanan"],
  30: ["merasakan keinginan dengan intens", "menghidupkan pengalaman melalui gairah", "membiarkan hasil terbuka tanpa menekan harapan"],
  31: ["mempengaruhi arah melalui suara", "memimpin lewat komunikasi yang dipercaya", "berbicara setelah ada ruang untuk didengar"],
  32: ["peka pada apa yang dapat bertahan", "menjaga kesinambungan melalui insting", "tidak membiarkan takut gagal menutup perubahan yang perlu"],
  33: ["membutuhkan privasi untuk mencerna pengalaman", "mengubah masa lalu menjadi kebijaksanaan", "kembali berbagi setelah proses batin selesai"],
  34: ["membawa daya besar untuk bergerak mandiri", "menyelesaikan banyak hal melalui tenaga tubuh", "menggunakan kekuatan tanpa mendominasi ritme orang lain"],
  35: ["tertarik pada pengalaman dan perubahan baru", "membawa kemajuan melalui keberanian mencoba", "tidak mengejar kebaruan hanya untuk menghindari kebosanan"],
  36: ["belajar melalui gelombang pengalaman emosional", "tetap hadir ketika keadaan belum familiar", "mengurangi keputusan impulsif saat emosi sedang tinggi"],
  37: ["membangun rasa keluarga melalui kesepakatan", "menciptakan kehangatan dan timbal balik", "menyebut kebutuhan dengan jelas sebelum memberi terlalu banyak"],
  38: ["berdiri teguh untuk hal yang dianggap penting", "membawa keberanian menghadapi tekanan", "memilih perjuangan yang benar-benar memiliki makna"],
  39: ["mengusik suasana agar perasaan yang jujur muncul", "membangunkan semangat yang sempat tertutup", "memprovokasi dengan kepekaan, bukan sekadar mencari reaksi"],
  40: ["bekerja kuat lalu membutuhkan ruang sendiri", "menepati janji melalui kemauan yang jelas", "menjaga keseimbangan antara memberi, menerima, dan beristirahat"],
  41: ["memulai pengalaman dari imajinasi", "membuka kemungkinan melalui gambaran batin", "memilih keinginan mana yang layak diberi tenaga"],
  42: ["membawa proses menuju penyelesaian", "menumbuhkan sesuatu sampai matang", "tidak meninggalkan siklus hanya karena tahap akhirnya terasa lambat"],
  43: ["menerima wawasan yang datang tiba-tiba", "melihat terobosan yang belum dilihat orang lain", "menunggu bahasa dan waktu yang tepat untuk membagikannya"],
  44: ["mengenali pola dari pengalaman masa lalu", "membaca orang dan situasi dengan insting", "membedakan kewaspadaan hari ini dari ketakutan lama"],
  45: ["mengumpulkan orang dan sumber daya", "menciptakan kemakmuran yang dapat dibagikan", "memimpin kepemilikan dengan tanggung jawab bersama"],
  46: ["menemukan arah melalui pengalaman tubuh", "hadir penuh pada tempat dan waktu", "memperlakukan tubuh sebagai sahabat, bukan alat pencapaian"],
  47: ["mencari makna dari pengalaman yang membingungkan", "mengubah tekanan mental menjadi pemahaman", "membiarkan realisasi datang tanpa menyalahkan diri"],
  48: ["menyelami sesuatu sampai ke akarnya", "membawa kedalaman dan solusi yang matang", "mulai berbagi sebelum merasa harus mengetahui semuanya"],
  49: ["memegang prinsip kuat dalam hubungan", "membawa pembaruan ketika nilai tak lagi sehat", "mengubah aturan melalui kejernihan, bukan ledakan sesaat"],
  50: ["menjaga nilai dan kesejahteraan kelompok", "membawa rasa tanggung jawab yang kuat", "merawat tanpa mengambil semua tugas sebagai milik sendiri"],
  51: ["berani memasuki pengalaman yang mengguncang", "membangunkan keberanian pada diri dan orang lain", "tidak mencari kejutan hanya untuk membuktikan kekuatan"],
  52: ["menahan energi agar perhatian tetap diam", "menciptakan konsentrasi di tengah tekanan", "membedakan ketenangan dari tubuh yang sedang membeku"],
  53: ["merasakan dorongan memulai siklus baru", "memberi tenaga awal pada pertumbuhan", "memilih awal yang sanggup ditemani sampai berkembang"],
  54: ["memiliki ambisi untuk bergerak naik", "mengubah dorongan material menjadi perkembangan", "menjaga tujuan tetap selaras dengan nilai batin"],
  55: ["mengalami kelimpahan melalui keadaan batin", "membawa kedalaman rasa dan semangat", "tidak mengukur hidup hanya dari suasana sesaat"],
  56: ["mengolah pengalaman menjadi cerita", "menstimulasi pikiran melalui bahasa", "memberi cerita arah tanpa melebihkan agar didengar"],
  57: ["menangkap apa yang aman pada saat ini", "membawa intuisi yang cepat dan jernih", "mempercayai bisikan pertama tanpa membesarkan rasa takut"],
  58: ["melihat kemungkinan untuk membuat hidup lebih baik", "membawa vitalitas pada proses perbaikan", "menjaga sukacita agar kritik tidak mengambil seluruh ruang"],
  59: ["menembus jarak dan membangun kedekatan", "menciptakan ikatan yang jujur", "memilih keterbukaan dengan persetujuan dan batas yang jelas"],
  60: ["bertemu batas sebelum perubahan terjadi", "menemukan bentuk baru dari keterbatasan", "menerima kondisi hari ini sambil menunggu mutasi yang tepat"],
  61: ["tertarik pada misteri dan kebenaran batin", "membawa inspirasi dari pertanyaan yang dalam", "membiarkan hal yang belum terjawab tetap memiliki ruang"],
  62: ["memperhatikan nama, fakta, dan rincian", "membuat gagasan terasa konkret", "memakai detail untuk memperjelas, bukan menunda gerak"],
  63: ["menguji sesuatu melalui keraguan", "menemukan pola yang layak dipercaya", "mengajukan pertanyaan tanpa menjadikan hidup sebagai masalah terus-menerus"],
  64: ["menerima banyak gambaran sebelum maknanya terbentuk", "menampung inspirasi dari masa lalu", "memberi kebingungan waktu sampai pola muncul dengan sendirinya"],
};

const CHANNEL_EXPERIENCES: Record<string, [string, string, string]> = {
  "64-47": ["gambaran yang berserakan bertemu kemampuan menemukan makna", "mengolah pengalaman rumit menjadi pemahaman", "tidak memaksa kejelasan sebelum waktunya"],
  "61-24": ["pertanyaan batin bertemu pikiran yang terus mengolah", "menemukan kebenaran pribadi dari perenungan", "memberi kepala jeda dari kebutuhan menjawab semuanya"],
  "63-4": ["keraguan bertemu kemampuan menyusun jawaban", "menguji pola dengan logis", "membedakan pertanyaan berguna dari kecemasan berulang"],
  "17-62": ["pandangan luas bertemu ketelitian bahasa", "menjelaskan pendapat dengan runtut", "menawarkan detail tanpa mengunci orang pada satu kesimpulan"],
  "43-23": ["wawasan mendadak bertemu kemampuan menyederhanakan", "membawa terobosan ke dalam bahasa sehari-hari", "menunggu orang siap sebelum menyampaikan hal yang belum umum"],
  "11-56": ["ide bertemu kemampuan bercerita", "membuka imajinasi dan percakapan", "menikmati gagasan tanpa harus menjalankan semuanya"],
  "1-8": ["kreativitas pribadi bertemu ruang kontribusi", "menginspirasi melalui contoh yang khas", "berkarya tanpa bergantung pada pengakuan"],
  "13-33": ["kemampuan mendengar bertemu kebutuhan merenung", "menyimpan pengalaman lalu membagikan hikmahnya", "menjaga privasi cerita orang lain"],
  "7-31": ["arah bersama bertemu suara kepemimpinan", "membimbing kelompok ketika dipercaya", "tidak mengambil kemudi sebelum ada dukungan"],
  "10-20": ["keaslian diri bertemu kehadiran saat ini", "bertindak spontan dari pusat yang jujur", "tidak memakai spontanitas untuk menghindari dampak"],
  "15-5": ["keluasan ritme bertemu kebutuhan pada pola", "membawa orang kembali pada tempo yang manusiawi", "menjaga rutinitas tetap lentur"],
  "2-14": ["arah batin bertemu tenaga untuk berkarya", "mengalirkan sumber daya ke tujuan yang tepat", "tidak mengejar hasil tanpa rasa arah"],
  "46-29": ["kebijaksanaan tubuh bertemu daya berkomitmen", "belajar penuh melalui pengalaman", "memilih ya dengan sadar sebelum terjun"],
  "25-51": ["ketulusan bertemu keberanian menembus batas", "membangunkan kekuatan melalui pengalaman besar", "tidak menguji diri hanya demi pembuktian"],
  "21-45": ["pengelolaan bertemu kepemimpinan sumber daya", "menata kepemilikan dan tanggung jawab", "membagi kuasa secara adil"],
  "26-44": ["insting membaca pola bertemu kemampuan mempengaruhi", "menyampaikan nilai dengan meyakinkan", "menjaga kebenaran saat ingin memperoleh hasil"],
  "40-37": ["kemauan bekerja bertemu kebutuhan pada timbal balik", "membangun keluarga dan kesepakatan yang kuat", "menyebut batas sebelum lelah"],
  "57-20": ["intuisi cepat bertemu suara saat ini", "mengucapkan hal tepat pada momen yang tepat", "tidak membesarkan bisikan menjadi ketakutan"],
  "48-16": ["kedalaman bertemu latihan keterampilan", "menguasai sesuatu dengan antusias", "berani tampil sebelum sempurna"],
  "57-10": ["intuisi bertemu perilaku yang setia pada diri", "bergerak alami dengan kewaspadaan sehat", "tidak mengubah kepekaan menjadi perlindungan berlebihan"],
  "50-27": ["nilai bersama bertemu tenaga merawat", "menopang orang dengan tanggung jawab", "memasukkan kebutuhan diri ke dalam lingkaran perhatian"],
  "57-34": ["insting bertemu daya tubuh yang besar", "bergerak cepat saat tubuh benar-benar tahu", "memberi tenaga arah agar tidak sekadar reaktif"],
  "59-6": ["dorongan mendekat bertemu batas emosional", "membangun keintiman yang dalam", "membuka diri melalui persetujuan dan waktu yang tepat"],
  "34-20": ["kekuatan tubuh bertemu tindakan saat ini", "mewujudkan banyak hal dengan cepat", "merespons sebelum bergerak agar daya tidak tercecer"],
  "34-10": ["tenaga besar bertemu cinta pada keunikan diri", "menjalani hidup dengan cara yang otentik", "menggunakan kebebasan tanpa mengabaikan hubungan"],
  "35-36": ["dorongan berubah bertemu kedalaman emosi", "bertumbuh melalui pengalaman baru", "tidak membuat keputusan besar di puncak gelombang"],
  "12-22": ["kepekaan sosial bertemu ekspresi emosional", "menyentuh orang lewat suara dan suasana", "menunggu hati terbuka sebelum berbicara"],
  "42-53": ["dorongan memulai bertemu kemampuan menyelesaikan", "menemani pertumbuhan dari awal sampai matang", "memilih siklus yang layak menerima tenaga"],
  "3-60": ["awal yang kacau bertemu batas yang membentuk", "membawa pembaruan ketika waktunya tiba", "menerima keterbatasan tanpa kehilangan kemungkinan"],
  "9-52": ["fokus bertemu ketenangan", "menahan perhatian pada satu hal penting", "mengistirahatkan tubuh saat konsentrasi berubah menjadi tekanan"],
  "19-49": ["kepekaan kebutuhan bertemu prinsip hubungan", "membentuk kesepakatan yang menghormati semua pihak", "tidak bereaksi dari takut ditolak"],
  "39-55": ["provokasi bertemu kedalaman suasana hati", "membangunkan semangat yang autentik", "memberi emosi ruang tanpa memancing reaksi sembarang"],
  "41-30": ["imajinasi bertemu hasrat mengalami", "membuka perjalanan emosional baru", "menjaga harapan agar tidak mengendalikan hasil"],
  "54-32": ["ambisi bertemu insting menjaga kesinambungan", "mengubah dorongan maju menjadi keberhasilan yang bertahan", "tidak membiarkan takut gagal menentukan nilai diri"],
  "38-28": ["daya melawan bertemu pencarian tujuan", "berdiri teguh untuk hal bermakna", "memilih perjuangan tanpa menjadikan hidup medan perang"],
  "58-18": ["vitalitas bertemu mata yang melihat perbaikan", "meningkatkan mutu dengan sukacita", "mengoreksi tanpa mengikis penghargaan"],
};

const CENTER_EXPERIENCES: Record<string, { defined: string; open: string }> = {
  head: {
    defined: "Inspirasi memiliki tekanan yang cukup konsisten di dalam dirimu. Pilih pertanyaan yang memang penting agar kepala tidak harus menindaklanjuti setiap gagasan.",
    open: "Kamu mudah menangkap pertanyaan dan inspirasi dari sekitar. Tidak semua tekanan untuk menemukan jawaban perlu menjadi pekerjaanmu.",
  },
  ajna: {
    defined: "Cara mengolah informasi cenderung memiliki jalur yang dapat kamu kenali. Keteguhan berpikir paling berguna saat tetap memberi ruang bagi sudut pandang baru.",
    open: "Pikiranmu mampu melihat satu hal dari banyak sisi. Kebebasan ini lebih sehat ketika kamu tidak memaksa diri terlihat selalu yakin.",
  },
  throat: {
    defined: "Suara dan tindakanmu memiliki cara yang relatif konsisten untuk hadir. Dampaknya menguat ketika ungkapan keluar pada waktu yang tepat, bukan sekadar agar terlihat.",
    open: "Cara bicaramu peka pada suasana dan orang yang hadir. Kamu tidak perlu berebut perhatian; ruang yang tepat membuat suaramu muncul lebih alami.",
  },
  g: {
    defined: "Rasa diri dan arah hidup memiliki poros yang cukup stabil. Kamu tetap dapat berubah tanpa kehilangan hubungan dengan siapa dirimu.",
    open: "Identitas serta arahmu sangat peka pada tempat dan pergaulan. Memilih lingkungan yang terasa sehat sering lebih penting daripada memaksa jawaban tentang siapa dirimu.",
  },
  ego: {
    defined: "Kemauan untuk berjanji dan menuntaskan dapat hadir dengan kuat. Pilih komitmen secara sadar agar daya ini tidak habis untuk terus membuktikan nilai diri.",
    open: "Kamu dapat menyerap tekanan untuk membuktikan kemampuan atau kelayakan. Nilai dirimu tidak bergantung pada janji besar maupun kemenangan atas orang lain.",
  },
  spleen: {
    defined: "Tubuhmu mempunyai kewaspadaan spontan terhadap apa yang aman saat ini. Dengarkan kesan pertama yang tenang tanpa mengubahnya menjadi ketakutan berkepanjangan.",
    open: "Kamu peka terhadap rasa aman, kebiasaan, dan kondisi tubuh orang lain. Melepaskan yang tidak lagi sehat mungkin membutuhkan keberanian, tetapi tubuh tidak perlu bertahan hanya karena sudah terbiasa.",
  },
  sacral: {
    defined: "Daya hidup terisi kembali saat tubuh terlibat pada hal yang tepat. Berhenti ketika tenaga selesai membantu ritmemu tetap berkelanjutan.",
    open: "Kamu dapat memperbesar tenaga orang lain dan bekerja melewati batas. Istirahat sebelum benar-benar lelah menjaga tubuh dari kebiasaan mengejar kapasitas yang bukan milikmu.",
  },
  "solar plexus": {
    defined: "Perasaan bergerak dalam gelombang yang memiliki waktunya sendiri. Kejernihan tumbuh setelah intensitas mereda, sehingga keputusan tidak perlu dipercepat.",
    open: "Kamu mudah menangkap dan memperbesar emosi di sekitar. Kejujuran tetap dapat dijaga tanpa menghindari percakapan hanya demi mempertahankan suasana tenang.",
  },
  root: {
    defined: "Tekanan untuk bergerak memiliki pola yang cukup dapat kamu kenali. Daya dorong ini paling sehat ketika dipakai sesuai prioritas, bukan untuk menuntaskan semuanya sekaligus.",
    open: "Desakan dan kesibukan dari sekitar mudah terasa seperti milikmu. Kamu boleh melambat tanpa harus segera menghapus setiap tekanan.",
  },
};

function section(title: string, ...paragraphs: string[]): HumanMeaningSection {
  return { title, paragraphs: paragraphs.filter(Boolean) };
}

function normalizedCenterKey(value: string): string {
  const normalized = value.replace(/([A-Z])/g, " $1").trim().toLowerCase();
  if (normalized === "solarplexus") return "solar plexus";
  if (normalized === "heart" || normalized === "will") return "ego";
  if (normalized === "identity") return "g";
  return normalized;
}

function channelKey(value: unknown): string {
  const gates = text(value).match(/\d+/g)?.map(Number).filter((gate) => gate >= 1 && gate <= 64) || [];
  if (gates.length < 2) return text(value);
  const direct = `${gates[0]}-${gates[1]}`;
  const reverse = `${gates[1]}-${gates[0]}`;
  return CHANNEL_EXPERIENCES[direct] ? direct : CHANNEL_EXPERIENCES[reverse] ? reverse : direct;
}

function gateMeaning(gate: number): string {
  const experience = GATE_EXPERIENCES[gate];
  if (!experience) return "Ada kecenderungan alami yang memperoleh bentuk melalui pengalamanmu. Hadiah tersembunyinya tumbuh saat ritme tubuh tetap dihormati.";
  return `Kamu cenderung ${experience[0]}, dengan kemampuan untuk ${experience[1]}. Ruang pertumbuhanmu terletak pada keberanian untuk ${experience[2]}.`;
}

function channelMeaning(value: unknown): string {
  const experience = CHANNEL_EXPERIENCES[channelKey(value)];
  if (!experience) return "Dua pusat energi bekerja bersama dan membentuk kekuatan yang dapat diakses berulang kali. Hadiah ini terasa paling utuh ketika dipakai tanpa memaksa waktu maupun orang lain.";
  return `Di dalam dirimu, ${experience[0]}. Kerja sama ini membantumu ${experience[1]}, sambil belajar untuk ${experience[2]}.`;
}

function firstActiveGate(source: HumanDesignPresentationSource): number | null {
  const raw = Array.isArray(source.gates) ? source.gates : [];
  const gate = raw.map(Number).find((value) => Number.isFinite(value) && value >= 1 && value <= 64);
  return gate || null;
}

function variableExperience(kind: keyof HumanDesignHumanMeaning["variables"], value: unknown): string {
  const raw = text(value).toLowerCase();
  const label = localizeHumanDesignValue(value).toLowerCase() || "pola yang terasa alami";
  if (kind === "digestion") {
    if (raw.includes("appetite")) return `Tubuhmu lebih nyaman menerima asupan melalui ${label}, dengan pilihan yang sederhana dan tempo yang tidak berlebihan. Perhatikan rasa cukup sebelum mengikuti aturan makan dari luar.`;
    if (raw.includes("taste")) return `Kepekaan rasa membantu tubuh mengenali apa yang sesuai. Beri dirimu izin memilih tanpa menjadikan selera sebagai aturan yang kaku.`;
    if (raw.includes("thirst")) return `Suhu dan cairan ikut memengaruhi kenyamanan tubuh saat menerima asupan. Respons tubuh sehari-hari lebih berguna daripada memaksa satu pola untuk semua keadaan.`;
    if (raw.includes("sound")) return `Suasana suara ikut memengaruhi cara tubuh menerima makanan dan informasi. Ciptakan tingkat kebisingan yang membuat tubuh lebih tenang serta hadir.`;
    if (raw.includes("touch")) return `Kenyamanan sentuhan dan suasana fisik membantu tubuh mencerna pengalaman. Perhatikan apakah tempat makan membuatmu rileks atau justru berjaga.`;
    return `Tubuh memiliki tempo sendiri dalam menerima makanan dan pengalaman. ${label} dapat dipakai sebagai petunjuk praktis, bukan aturan yang harus dipatuhi sempurna.`;
  }
  if (kind === "cognition") {
    if (raw.includes("vision")) return `${localizeHumanDesignValue(value)} membuat detail visual menjadi pintu awal untuk membaca keadaan. Percayai apa yang segera tertangkap mata sambil tetap memeriksa konteksnya.`;
    if (raw.includes("feeling")) return `Nuansa rasa di tubuh membantumu mengenali apa yang cocok. Kepekaan ini bekerja lebih jernih ketika tidak tertutup oleh desakan untuk segera menjelaskan.`;
    if (raw.includes("smell")) return `Aroma dan kesan instingtif dapat memberi petunjuk cepat tentang kecocokan. Gunakan kesan itu sebagai undangan untuk memperhatikan lebih dekat.`;
    return `${localizeHumanDesignValue(value) || "Kepekaan tubuh"} menjadi pintu alami untuk menangkap keadaan. Kejernihannya menguat saat tubuh mendapat ruang sebelum pikiran menyimpulkan.`;
  }
  if (kind === "environment") {
    const placeHints: Record<string, string> = {
      caves: "ruang privat yang batas serta aksesnya dapat kamu kenali",
      markets: "tempat pertukaran, pilihan, dan pertemuan yang hidup",
      kitchens: "ruang tempat bahan, gagasan, atau orang diracik menjadi sesuatu yang baru",
      mountains: "tempat dengan jarak, keluasan pandang, atau posisi yang lebih tinggi",
      valleys: "jalur komunikasi dan lingkungan tempat informasi bergerak",
      shores: "ruang peralihan yang mempertemukan dua suasana berbeda",
    };
    const hint = Object.entries(placeHints).find(([key]) => raw.includes(key))?.[1] || "lingkungan yang memberi tubuh rasa lapang";
    return `Energi lebih mudah tertata di ${hint}. Ini tidak harus menjadi lokasi harfiah; kualitas ruangnya dapat kamu ciptakan dalam keseharian.`;
  }
  if (kind === "motivation") {
    const motives: Record<string, string> = {
      fear: "ketelitian dan kesiapan membaca risiko",
      hope: "kemampuan melihat apa yang dapat berkembang tanpa mengendalikan prosesnya",
      desire: "dorongan memperbaiki serta membawa perubahan nyata",
      need: "kepekaan pada hal yang benar-benar diperlukan",
      guilt: "naluri mengambil tanggung jawab dan mencari jalan perbaikan",
      innocence: "ketulusan untuk hadir tanpa agenda tersembunyi",
    };
    const motive = Object.entries(motives).find(([key]) => raw.includes(key))?.[1] || label;
    return `Dorongan yang paling jernih tumbuh dari ${motive}. Ia kehilangan kejernihan ketika berubah menjadi tuntutan untuk mengatur hasil atau membuktikan diri.`;
  }
  const views: Record<string, string> = {
    survival: "apa yang membantu sesuatu bertahan",
    possibility: "kemungkinan yang belum dilihat orang lain",
    power: "letak pengaruh dan daya yang bekerja",
    wanting: "keinginan yang menggerakkan pilihan",
    probability: "jalur yang paling mungkin diwujudkan",
    personal: "dampak sebuah keadaan pada kehidupan pribadi",
  };
  const view = Object.entries(views).find(([key]) => raw.includes(key))?.[1] || label;
  return `Perhatianmu secara alami lebih dahulu menangkap ${view}. Sudut pandang ini menjadi hadiah saat dipakai sebagai lensa, bukan satu-satunya kenyataan.`;
}

function profileParagraphs(profile: string): [string, string] {
  const lines = profile.match(/[1-6]/g) || [];
  const first = lines[0] || "";
  const second = lines[1] || first;
  const firstStory = profileNarrative(first);
  const secondStory = profileNarrative(second);
  return [
    `Peranmu bertumbuh melalui cara untuk ${firstStory}. Kamu memperoleh kepercayaan bukan dengan memainkan citra, melainkan dengan membiarkan pengalaman membentuk cara hadir yang dapat dirasakan orang lain.`,
    `${first !== second ? `Sisi lain dirimu belajar untuk ${secondStory}.` : "Satu pola yang sama terus diperdalam dari berbagai pengalaman."} Saat kedua sisi ini diberi tempat, kamu tidak perlu memilih antara menjadi diri sendiri dan memenuhi peran di tengah hubungan.`,
  ];
}

export function buildHumanDesignHumanMeaning(source: HumanDesignPresentationSource): HumanDesignHumanMeaning {
  const type = text(source.type);
  const strategy = text(source.strategy);
  const authority = text(source.authority);
  const profile = text(source.profile);
  const definition = text(source.definition);
  const signature = localizeHumanDesignValue(source.signature) || "Rasa Selaras";
  const notSelf = localizeHumanDesignValue(source.notSelfTheme) || "Ketegangan";
  const channelValues = Array.isArray(source.channels) ? source.channels : [];
  const gateValues = Array.isArray(source.gates) ? source.gates.map(Number).filter((gate) => Number.isFinite(gate)) : [];
  const centersSource = source.centers && typeof source.centers === "object" ? source.centers as Record<string, unknown> : {};
  const cross = presentIncarnationCross(source.incarnationCross);
  const activationGates = [
    ...(Array.isArray(source.personalityActivations) ? source.personalityActivations : []),
    ...(Array.isArray(source.designActivations) ? source.designActivations : []),
  ].map((activation: unknown) => Number((activation as Record<string, unknown>)?.gate))
    .filter((gate: number) => Number.isFinite(gate) && gate >= 1 && gate <= 64);
  const narrativeGates = [...new Set([...cross.gates, ...activationGates, ...gateValues])];
  const variablesSource = source.variables?.advanced || source.variables || {};
  const variableCode = variablesSource.variable || variablesSource.value || variablesSource.short_code;
  const profileText = profileParagraphs(profile);
  const primaryGate = firstActiveGate(source);
  const primaryGateExperience = primaryGate ? GATE_EXPERIENCES[primaryGate] : null;

  const centers: Record<string, string> = {};
  for (const [key, value] of Object.entries(centersSource)) {
    const normalized = normalizedCenterKey(key);
    const meaning = CENTER_EXPERIENCES[normalized];
    centers[key] = meaning
      ? value === true ? meaning.defined : meaning.open
      : value === true
        ? "Energi pada pusat ini hadir dengan pola yang relatif konsisten. Gunakan kestabilannya tanpa menganggap orang lain harus memiliki ritme yang sama."
        : "Pusat ini peka terhadap energi dari lingkungan. Pengalaman yang berubah-ubah dapat menjadi kebijaksanaan saat kamu tidak merasa harus mempertahankannya.";
  }

  const channels: Record<string, string> = {};
  for (const value of channelValues) channels[text(value)] = channelMeaning(value);
  const gates: Record<number, string> = {};
  for (const gate of [...new Set(gateValues)]) gates[gate] = gateMeaning(gate);
  const gateStory = (index: number) => gateMeaning(narrativeGates[index % Math.max(narrativeGates.length, 1)] || 0);
  const channelStory = (index: number) => channelValues.length
    ? channelMeaning(channelValues[index % channelValues.length])
    : "Kepekaanmu membaca kualitas pertemuan sebelum menentukan seberapa jauh tenaga perlu diberikan. Pengalaman ini mengajarkan kapan perlu terlibat dan kapan perlu menyimpan ruang.";
  const centerKeys = Object.keys(centersSource);
  const centerStory = (index: number) => {
    const key = centerKeys[index % Math.max(centerKeys.length, 1)];
    return centers[key] || "Tubuhmu membaca keadaan melalui perubahan energi yang hadir. Memberi ruang pada sensasi membantu pengalaman menemukan maknanya.";
  };
  const variant = (narrativeGates[0] || channelValues.length || 0) % 5;
  const choose = (values: string[], offset = 0) => values[(variant + offset) % values.length];
  const localizedStrategy = localizeHumanDesignValue(strategy).toLowerCase() || "ritme alammu";
  const localizedAuthority = localizeHumanDesignValue(authority).toLowerCase() || "kompas tubuh";
  const typeLead = choose([
    typeNarrative(type),
    `Daya khas seorang ${type || "pribadi yang peka"} terasa saat tubuh tidak diperlakukan seperti mesin. Ada tempo tertentu yang membuat perhatian, tenaga, dan tindakan bertemu tanpa banyak paksaan.`,
    `Kehidupan tidak meminta energimu hadir dengan cara yang sama setiap waktu. Sebagai ${type || "dirimu sendiri"}, kualitas gerak tumbuh ketika pilihan memiliki hubungan nyata dengan tubuh.`,
    `Cara alammu bekerja lebih mudah dikenali dari rasa sesudah menjalani sesuatu, bukan dari banyaknya hal yang selesai. Pola ${type || "energi ini"} membutuhkan kejujuran terhadap kapasitas hari ini.`,
    `Tubuhmu mempunyai bahasa sendiri untuk menyatakan kapan tenaga ingin terlibat. Pada pola ${type || "ini"}, menghormati bahasa tersebut menjaga gerak tetap hidup tanpa kehilangan diri.`,
  ]);
  const strategyLead = choose([
    strategyNarrative(strategy),
    `${localizeHumanDesignValue(strategy)} mengajakmu membaca keadaan sebelum menyerahkan tenaga. Kesempatan yang sesuai tidak perlu dikejar dengan ketegangan terus-menerus.`,
    `Pintu yang sehat terbuka ketika ${localizedStrategy} memperoleh ruang dalam tindakan sehari-hari. Tubuh dapat mengenali kecocokan lebih cepat daripada pikiran menyusun daftar keuntungan.`,
    `Alih-alih membuat hidup bergerak dari desakan, biarkan ${localizedStrategy} mengatur urutan langkah. Cara ini menyisakan tenaga untuk hal yang benar-benar ingin ditemui.`,
    `Timing menjadi bagian penting dalam perjalananmu. ${localizeHumanDesignValue(strategy)} membantu membedakan kesempatan yang mengundang keterlibatan dari situasi yang hanya menuntut pembuktian.`,
  ], 1);
  const authorityLead = choose([
    authorityNarrative(authority),
    `${localizeHumanDesignValue(authority)} menempatkan keputusan kembali pada pengalaman tubuh. Jawaban tidak wajib langsung memiliki alasan yang rapi agar layak dipercaya.`,
    `Kompas ${localizedAuthority} bekerja melalui isyarat yang khas dan tidak selalu keras. Menunda kesimpulan memberi kesempatan bagi sinyal yang jujur untuk muncul.`,
    `Saat pilihan terasa rumit, tubuhmu tidak membutuhkan lebih banyak perdebatan. ${localizeHumanDesignValue(authority)} mengajakmu mengenali respons yang tetap terasa benar setelah tekanan luar berkurang.`,
    `Kejernihan lahir dari hubungan dengan ${localizedAuthority}, bukan dari kemampuan meyakinkan semua orang. Pilihan yang tepat dapat terasa sederhana meski konsekuensinya tetap membutuhkan keberanian.`,
  ], 2);
  const definitionLead = choose([
    definitionNarrative(definition),
    `${localizeHumanDesignDefinition(definition)} membuat beberapa proses batin memiliki cara tersendiri untuk saling menemukan. Hubungan dan ruang pribadi dapat memainkan peran berbeda dalam kejernihanmu.`,
    `Bagian-bagian dalam dirimu tidak selalu menyelesaikan pengalaman pada kecepatan seragam. Pola ${localizeHumanDesignDefinition(definition).toLowerCase()} meminta penghormatan pada urutan yang muncul alami.`,
    `Keterhubungan batinmu membawa corak ${localizeHumanDesignDefinition(definition).toLowerCase()}. Beberapa jawaban matang dari dalam, sedangkan yang lain terbuka melalui pertemuan yang tepat.`,
    `Cara energi tersambung menciptakan tempo pemrosesan yang khas. ${localizeHumanDesignDefinition(definition)} membantumu memahami mengapa kejernihan kadang utuh seketika dan kadang membutuhkan jembatan.`,
  ], 3);
  const profileLead = choose([
    profileText[0],
    `Peran hidupmu tumbuh lewat keberanian untuk ${profileNarrative(profile)}. Orang lain dapat melihat kualitas yang baru kamu sadari setelah pengalaman mengujinya.`,
    `Kamu belajar menjadi dirimu melalui pertemuan antara bakat dan pengalaman nyata. Profil ${profile} memberi ruang bagi proses untuk ${profileNarrative(profile)}.`,
    `Tidak semua bagian dari peranmu perlu dipahami sejak awal. Jalan ${profile} mematangkan kemampuan untuk ${profileNarrative(profile)} sedikit demi sedikit.`,
    `Cara orang mengenalmu sering berawal dari kualitas yang muncul spontan. Seiring waktu, profil ${profile} mengajakmu ${profileNarrative(profile)} tanpa memainkan harapan orang lain.`,
  ], 4);
  const signatureLead = choose([
    `${signature} hadir saat tenaga, waktu, dan pilihanmu bertemu pada arah yang terasa milikmu.`,
    `${signature} terasa seperti napas yang lebih lapang setelah tubuh memilih jalannya sendiri.`,
    `Ada penanda lembut bernama ${signature}: rasa bahwa pengalamanmu tidak sedang melawan sifat alami diri.`,
    `Saat ritmemu dihormati, ${signature.toLowerCase()} muncul bukan sebagai hadiah luar, melainkan ketenangan di dalam proses.`,
    `${signature} membantu mengenali ruang yang layak menerima tenaga serta perhatianmu.`,
  ]);
  const notSelfLead = choose([
    `${notSelf} bukan kegagalan maupun penilaian atas dirimu.`,
    `Ketika ${notSelf.toLowerCase()} muncul, tubuh sedang meminta perubahan cara berhubungan dengan keadaan.`,
    `${notSelf} dapat dibaca sebagai bunyi alarm, bukan identitas yang harus kamu pikul.`,
    `Ada masa ketika ${notSelf.toLowerCase()} mengisi ruang batin dan membuat gerak terasa berat.`,
    `Rasa ${notSelf.toLowerCase()} sering datang sebelum pikiran mengakui bahwa suatu pilihan tidak lagi sehat.`,
  ], 1);

  const crossGateStories = cross.gates
    .map((gate) => GATE_EXPERIENCES[gate]?.[1])
    .filter(Boolean);
  const crossFocus = crossGateStories.length
    ? crossGateStories.slice(0, 2).join(" sekaligus ")
    : "mengubah pengalaman menjadi arah yang semakin jujur";

  const typeSection = section(
    "Cara Energi Kehidupanmu Bergerak",
    `${gateStory(0)} ${typeLead}`,
    `${centerStory((narrativeGates[1] || 0) % Math.max(centerKeys.length, 1))} ${gateStory(6)}`,
  );
  const strategySection = section(
    "Cara Menemui Kesempatan",
    `${strategyLead} ${gateStory(1)}`,
    `${channelStory(0)} ${notSelf} dapat menjadi alarm ketika langkah mendahului kesiapan; jeda membantumu melihat apakah jalan yang sama masih terbuka.`,
  );
  const authoritySection = section(
    "Kompas Keputusan Batin",
    `${authorityLead} ${variableExperience("cognition", source.cognition)}`,
    `${gateStory(2)} Sinyal tubuh tersebut layak memperoleh waktu sebelum pikiran menyusun alasan atau memenuhi desakan dari luar.`,
  );
  const definitionSection = section(
    "Cara Bagian Dirimu Terhubung",
    `${definitionLead} ${channelStory(1)} ${gateStory(6)}`,
    `${centerStory((narrativeGates[2] || 3) % Math.max(centerKeys.length, 1))} ${gateStory(7)}`,
  );
  const signatureSection = section(
    "Rasa Saat Hidup Selaras",
    `${signatureLead} ${variableExperience("environment", source.environment)}`,
    `${gateStory(4)} ${variableExperience("cognition", source.cognition)} ${gateStory(9)}`,
  );
  const notSelfSection = section(
    "Isyarat untuk Kembali",
    `${notSelfLead} ${variableExperience("motivation", source.motivation)} ${centerStory((narrativeGates[3] || 5) % Math.max(centerKeys.length, 1))}`,
    `${gateStory(5)} ${variableExperience("digestion", source.digestion)} Kembali pada ${localizedStrategy} sebelum membawa tuntutan berikutnya.`,
  );

  return {
    type: typeSection,
    strategy: strategySection,
    authority: authoritySection,
    profile: section(
      "Peran yang Bertumbuh Bersamamu",
      `${profileLead} ${gateStory(3)}`,
      `${choose([profileText[1], gateStory(8), centerStory(2), channelStory(1), variableExperience("environment", source.environment)], 2)} ${variableExperience("perspective", source.perspective)}`,
    ),
    definition: definitionSection,
    signature: signatureSection,
    notSelf: notSelfSection,
    centers,
    channels,
    gates,
    variables: {
      digestion: variableExperience("digestion", source.digestion),
      cognition: variableExperience("cognition", source.cognition),
      environment: variableExperience("environment", source.environment),
      motivation: variableExperience("motivation", source.motivation),
      perspective: variableExperience("perspective", source.perspective),
    },
    incarnationCross: section(
      "Benang Merah Kehidupan",
      `Tema ini menyatukan kemampuan untuk ${crossFocus}. Ia tidak meminta satu peran tetap, tetapi berulang sebagai arah yang terasa semakin nyata melalui pilihan, perjumpaan, dan perubahan hidup.`,
      `${primaryGateExperience ? `Kecenderungan untuk ${primaryGateExperience[0]} memberi pintu awal bagi tema tersebut.` : "Pengalaman sehari-hari memberi pintu awal bagi tema tersebut."} Pertumbuhannya muncul ketika hadiah alami dipakai untuk kehidupan yang dijalani, bukan untuk memenuhi gambaran tentang siapa dirimu seharusnya.`,
    ),
    summary: [
      `${gateStory(0)} ${typeLead} ${profileLead}`,
      `${authorityLead} ${gateStory(2)} ${signatureLead} ${notSelfLead}`,
      `${definitionLead} ${channelStory(0)} ${centerStory(4)} ${variableNarrative(variableCode)}`,
      `${variableExperience("environment", source.environment)} ${variableExperience("perspective", source.perspective)} Benang merah ${cross.gatesLabel ? `Gate ${cross.gatesLabel}` : "kehidupanmu"} mengajak seluruh pola ini menjadi cara hidup yang jujur dan dapat kamu rasakan sendiri.`,
    ],
  };
}
