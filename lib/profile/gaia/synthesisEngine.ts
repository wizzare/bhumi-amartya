import { GAIA_THEME_WEIGHTS, SENSITIVE_INSIGHT_IDS, strengthFromSourceCount } from "./policy";
import { createGaiaIdentity, isValidatedHumanDesign, normalizeGaiaSources } from "./normalizeSources";
import { GAIA_ENGINE_VERSION, GAIA_MIGRATION_VERSION, GAIA_PROFILE_VERSION, type GaiaDataPoint, type GaiaInsight, type GaiaProfile, type GaiaSignal, type GaiaTheme } from "./types";

type InsightDefinition = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  guidance: string;
  sensitive?: boolean;
  publicSafe?: boolean;
};

export const GAIA_INSIGHT_DEFINITIONS: Record<GaiaTheme, InsightDefinition[]> = {
  shadow: [
    { id: "recurringPatterns", title: "Pola Berulang", summary: "Pola yang kembali muncul dalam perjalananmu.", tags: ["recurring-pattern", "family-pattern", "growth-edge", "past-pattern"], guidance: "Kenali pemicunya sebelum memilih respons baru." },
    { id: "coreWound", title: "Luka Inti", summary: "Kebutuhan terdalam yang pernah merasa tidak terpenuhi.", tags: ["inner-child", "emotional-needs", "growth-edge", "wound-healing"], guidance: "Dekati bagian ini dengan lembut, bukan dengan tuntutan.", sensitive: true, publicSafe: false },
    { id: "ancestralPattern", title: "Karma Leluhur", summary: "Warisan pola keluarga yang sedang kamu sadari.", tags: ["family-pattern", "integration", "past-pattern"], guidance: "Kamu boleh menghormati asalmu tanpa mengulang seluruh polanya.", sensitive: true, publicSafe: false },
    { id: "innerChild", title: "Inner Child", summary: "Bagian dirimu yang membutuhkan rasa aman dan penerimaan.", tags: ["inner-child", "emotional-needs"], guidance: "Berikan kepastian kecil yang bisa dirasakan tubuhmu hari ini.", sensitive: true, publicSafe: false },
    { id: "shadowIntegration", title: "Shadow Integration Map", summary: "Arah untuk mengubah bayangan menjadi kesadaran.", tags: ["integration", "growth-edge", "recurring-pattern", "power-transformation"], guidance: "Integrasi dimulai saat kamu dapat melihat pola tanpa menjadi pola itu." },
    { id: "soulFragment", title: "Soul Fragment", summary: "Bagian batin yang terasa jauh atau tertinggal.", tags: ["inner-child", "integration", "energy-balance", "wound-healing"], guidance: "Pulihkan hubungan dengan bagian ini secara bertahap.", sensitive: true, publicSafe: false },
    { id: "emotionalTriggers", title: "Trigger Emosional", summary: "Situasi yang mudah mengaktifkan respons emosionalmu.", tags: ["emotional-needs", "recurring-pattern", "energy-balance"], guidance: "Jeda membantu membedakan keadaan hari ini dari pengalaman lama." },
    { id: "blindSpots", title: "Blind Spot", summary: "Hal yang lebih mudah terlihat dari dampaknya daripada dari niatmu.", tags: ["growth-edge", "relationship-pattern", "energy-balance"], guidance: "Gunakan umpan balik sebagai cermin, bukan sebagai vonis." },
    { id: "selfSabotage", title: "Self Sabotage Pattern", summary: "Cara perlindungan lama dapat menghambat langkah baru.", tags: ["recurring-pattern", "growth-edge", "economic-pattern", "power-transformation"], guidance: "Pilih langkah yang cukup kecil agar tidak memicu penolakan batin.", sensitive: true, publicSafe: false },
    { id: "coreFear", title: "Core Fear", summary: "Ketakutan dasar yang dapat memengaruhi pilihanmu.", tags: ["growth-edge", "inner-child", "family-pattern", "past-pattern"], guidance: "Ketakutan ini perlu didengar tanpa diberi kuasa penuh.", sensitive: true, publicSafe: false },
  ],
  talents: [
    { id: "talentDNA", title: "Talent DNA", summary: "Pola dasar cara bakatmu bekerja bersama.", tags: ["natural-strength", "communication-gift", "energy-rhythm", "work-style"], guidance: "Bakat tumbuh ketika digunakan dalam ritme yang konsisten." },
    { id: "coreStrengths", title: "Kekuatan Utama", summary: "Kualitas yang paling dapat kamu andalkan.", tags: ["natural-strength", "gift", "life-direction"], guidance: "Gunakan kekuatan ini dengan sadar, bukan hanya saat terdesak." },
    { id: "topTalents", title: "Top 5 Bakat", summary: "Bakat praktis yang paling menonjol dalam datamu.", tags: ["natural-strength", "communication-gift", "ancestry-wisdom", "paternal-gift", "maternal-gift"], guidance: "Pilih satu bakat untuk dilatih menjadi kemampuan nyata." },
    { id: "elementComposition", title: "Komposisi Elemen", summary: "Perpaduan Earth, Water, Air, Fire, dan Ether dalam dirimu.", tags: ["elements", "energy-rhythm", "energy-balance"], guidance: "Elemen yang kuat perlu diseimbangkan, bukan ditekan." },
    { id: "dominantArchetype", title: "Archetype Dominan", summary: "Pola peran yang paling alami kamu hidupi.", tags: ["archetype", "life-direction", "natural-strength", "work-style"], guidance: "Biarkan arketipe menjadi arah, bukan kotak yang membatasi." },
    { id: "spiritualTalents", title: "Bakat Spiritual", summary: "Kepekaan yang membantu memberi makna pada pengalaman.", tags: ["soul-direction", "gift", "evolution-direction", "expansion-zone"], guidance: "Bumikan kepekaan melalui tindakan yang berguna." },
    { id: "strongestSense", title: "Strongest Sense", summary: "Cara tubuhmu paling mudah mengenali keselarasan.", tags: ["decision-rhythm", "energy-rhythm", "natural-strength", "perception-mode"], guidance: "Perhatikan sinyal halus yang berulang saat kamu merasa selaras." },
    { id: "giftGeneKeys", title: "Gift Gene Keys", summary: "Kualitas hadiah yang muncul saat pola bayangan terintegrasi.", tags: ["gift", "integration", "evolution-direction"], guidance: "Hadiah ini berkembang melalui praktik, bukan kesempurnaan." },
    { id: "naturalPotential", title: "Potensi Alamiah", summary: "Kemungkinan yang tumbuh saat kekuatanmu bekerja bersama.", tags: ["natural-strength", "gift", "life-direction", "expansion-zone", "love-style"], guidance: "Berikan potensi ini wadah yang nyata dan berkelanjutan." },
  ],
  energy: [
    { id: "chakraProfile", title: "Chakra Profile", summary: "Peta keseimbangan pusat energi dalam dirimu.", tags: ["energy-balance", "grounding"], guidance: "Rawat keseimbangan dengan mendengar tubuh secara berkala." },
    { id: "physics", title: "Physics", summary: "Cara lapisan fisikmu membawa dan merespons beban.", tags: ["energy-balance", "grounding"], guidance: "Tubuh membutuhkan ritme yang dapat dipertahankan." },
    { id: "energy", title: "Energy", summary: "Pola tenaga yang menguat dan menurun sepanjang aktivitas.", tags: ["energy-rhythm", "energy-balance"], guidance: "Susun aktivitas mengikuti gelombang energi, bukan melawannya." },
    { id: "emotion", title: "Emotion", summary: "Cara emosi bergerak dan memengaruhi energimu.", tags: ["emotional-needs", "energy-rhythm"], guidance: "Beri emosi waktu bergerak sebelum mengambil kesimpulan." },
    { id: "strongestEnergyArea", title: "Dominant Energy", summary: "Pola energi dominan yang paling sering menjadi sumber daya.", tags: ["energy-rhythm", "natural-strength"], guidance: "Gunakan area kuat untuk menopang bagian yang sedang lelah." },
    { id: "energyAttentionArea", title: "Area Energi Perlu Diperhatikan", summary: "Area yang lebih mudah terkuras atau tertekan.", tags: ["energy-balance", "growth-edge"], guidance: "Perhatian dini lebih lembut daripada pemulihan setelah habis." },
    { id: "rechargePattern", title: "Recharge Pattern", summary: "Cara paling alami untuk mengisi kembali tenagamu.", tags: ["grounding", "energy-rhythm", "ideal-environment"], guidance: "Jadwalkan pemulihan sebelum tubuh harus memintanya dengan keras." },
    { id: "groundingGuidance", title: "Grounding Guidance", summary: "Langkah yang membantu energi kembali membumi.", tags: ["grounding", "energy-balance"], guidance: "Mulai dari napas, tubuh, lingkungan, dan satu aktivitas sederhana." },
  ],
  relationships: [
    { id: "loveStyle", title: "Gaya Mencintai", summary: "Cara kasih sayangmu paling alami hadir.", tags: ["love-style", "relationship-pattern"], guidance: "Kasih terasa utuh saat cara memberi dan menerima sama-sama terlihat." },
    { id: "emotionalNeeds", title: "Kebutuhan Emosional", summary: "Hal yang membuatmu merasa aman dan dipahami.", tags: ["emotional-needs", "connection-style"], guidance: "Kebutuhan yang disampaikan dengan jernih lebih mudah dipenuhi." },
    { id: "loveLanguage", title: "Love Language", summary: "Bentuk perhatian yang paling mudah terasa bermakna.", tags: ["love-style", "emotional-needs"], guidance: "Kenali bahasa kasihmu tanpa menganggap orang lain otomatis memahaminya." },
    { id: "conflictPatterns", title: "Pola Konflik", summary: "Respons yang cenderung muncul saat hubungan menegang.", tags: ["relationship-pattern", "recurring-pattern", "decision-rhythm", "family-pattern"], guidance: "Konflik dapat menjadi ruang kejujuran saat respons otomatis diperlambat." },
    { id: "attachmentPattern", title: "Attachment Pattern", summary: "Cara kedekatan dan jarak memengaruhi rasa amanmu.", tags: ["inner-child", "emotional-needs", "connection-style", "family-pattern"], guidance: "Kedekatan yang sehat memberi ruang bagi hubungan dan diri sendiri.", sensitive: true, publicSafe: false },
    { id: "relationshipBlindSpots", title: "Blind Spot Relasi", summary: "Pola relasi yang mungkin luput saat emosi sedang kuat.", tags: ["relationship-pattern", "growth-edge"], guidance: "Periksa dampak perilaku, bukan hanya niat di baliknya." },
    { id: "healthyBoundaries", title: "Batas Sehat", summary: "Bentuk batas yang menjaga kasih tetap jernih.", tags: ["emotional-needs", "connection-style", "decision-rhythm"], guidance: "Batas bukan penolakan; batas menjaga hubungan tetap dapat dihuni." },
    { id: "relationshipMirror", title: "Cermin Relasi", summary: "Hal tentang dirimu yang sering terlihat melalui hubungan.", tags: ["relationship-pattern", "integration", "growth-edge", "family-pattern"], guidance: "Ambil pelajarannya tanpa menyalahkan dirimu atau orang lain." },
    { id: "relationshipLessons", title: "Pelajaran Relasi", summary: "Arah pertumbuhan yang dibawa hubungan dalam hidupmu.", tags: ["relationship-pattern", "evolution-direction", "integration"], guidance: "Biarkan hubungan mengajarkan kedekatan yang tetap menghormati diri." },
  ],
  career: [
    { id: "careerDNA", title: "Career DNA", summary: "Pola inti cara kamu bekerja dan membangun karya.", tags: ["work-style", "career-direction", "natural-strength", "inner-driver"], guidance: "Karya berkembang saat cara kerja selaras dengan ritmemu." },
    { id: "sacredBusiness", title: "Sacred Business", summary: "Bentuk usaha yang menyatukan nilai, makna, dan kegunaan.", tags: ["value-creation", "soul-direction", "gift"], guidance: "Mulai dari masalah nyata yang memang ingin kamu bantu selesaikan." },
    { id: "idealWorkEnvironment", title: "Lingkungan Kerja Ideal", summary: "Kondisi yang membantu kemampuanmu berkembang.", tags: ["ideal-environment", "energy-rhythm", "work-style", "inner-driver"], guidance: "Lingkungan yang tepat mengurangi energi yang terbuang untuk bertahan." },
    { id: "valueCreation", title: "Cara Menghasilkan Nilai", summary: "Cara kontribusimu paling mudah menjadi berguna bagi orang lain.", tags: ["value-creation", "natural-strength", "communication-gift", "expansion-zone"], guidance: "Nilai tumbuh saat kekuatanmu menjawab kebutuhan yang jelas." },
    { id: "leadershipStyle", title: "Leadership Style", summary: "Cara kamu memberi arah, pengaruh, dan ruang bagi orang lain.", tags: ["work-style", "decision-rhythm", "life-direction", "inner-driver"], guidance: "Kepemimpinan yang sehat dimulai dari kejernihan cara hadir." },
    { id: "valuePotential", title: "Value Potential", summary: "Potensi dampak dan nilai yang dapat kamu kembangkan.", tags: ["value-creation", "economic-pattern", "natural-strength", "expansion-zone"], guidance: "Potensi nilai menjadi nyata melalui konsistensi dan relevansi." },
    { id: "moneyBlock", title: "Money Block", summary: "Pola yang dapat menghambat hubungan sehat dengan nilai dan sumber daya.", tags: ["economic-pattern", "recurring-pattern", "growth-edge"], guidance: "Pisahkan nilai dirimu dari naik turunnya hasil ekonomi." },
    { id: "businessPotential", title: "Business Potential", summary: "Kapasitas untuk membangun sistem, layanan, atau karya mandiri.", tags: ["value-creation", "work-style", "career-direction", "expansion-zone"], guidance: "Uji potensi melalui langkah kecil yang menghasilkan umpan balik nyata." },
    { id: "careerGrowthPattern", title: "Career Growth Pattern", summary: "Pola pertumbuhan yang membuat perjalanan karirmu berkembang berkelanjutan.", tags: ["career-direction", "growth-edge", "work-style"], guidance: "Bangun pertumbuhan melalui evaluasi, latihan, dan perluasan tanggung jawab yang bertahap." },
  ],
  spirituality: [
    { id: "soulMission", title: "Misi Jiwa", summary: "Arah kontribusi yang memberi makna pada perjalananmu.", tags: ["soul-direction", "life-direction", "evolution-direction"], guidance: "Misi menjadi nyata melalui cara kamu hidup hari ini." },
    { id: "dharmaPath", title: "Dharma Path", summary: "Jalan peran dan kontribusi yang terus memanggilmu.", tags: ["life-direction", "soul-direction", "value-creation"], guidance: "Ikuti arah yang terasa bermakna sekaligus dapat dibumikan." },
    { id: "spiritualArchetype", title: "Spiritual Archetype", summary: "Pola kebijaksanaan yang paling alami kamu bawa.", tags: ["archetype", "soul-direction", "gift", "awakening-pattern"], guidance: "Hidupi arketipe ini melalui tindakan, bukan identitas semata." },
    { id: "dominantGeneKeys", title: "Gene Keys Dominan", summary: "Tema Shadow, Gift, dan Siddhi yang menopang evolusimu.", tags: ["gift", "integration", "evolution-direction"], guidance: "Gunakan tema ini sebagai bahasa refleksi, bukan kepastian mutlak." },
    { id: "futureSelf", title: "Future Self", summary: "Gambaran diri yang sedang kamu tumbuhkan.", tags: ["futureTimeline", "evolution-direction", "life-direction", "expansion-zone"], guidance: "Temui future self melalui satu kebiasaan yang bisa dimulai sekarang." },
    { id: "lifeLessons", title: "Pelajaran Besar Kehidupan", summary: "Tema pembelajaran yang berulang dan memperdalam dirimu.", tags: ["growth-edge", "integration", "evolution-direction", "wound-healing", "spiritual-longing"], guidance: "Pelajaran yang sama dapat hadir dalam bentuk baru sampai terintegrasi." },
    { id: "soulPurpose", title: "Soul Purpose", summary: "Inti makna yang ingin diwujudkan melalui hidupmu.", tags: ["soul-direction", "life-direction", "value-creation", "power-transformation"], guidance: "Purpose bertumbuh saat makna bertemu pelayanan yang nyata." },
    { id: "evolutionTheme", title: "Evolution Theme", summary: "Tema perubahan utama yang sedang membentuk perjalananmu.", tags: ["evolution-direction", "integration", "futureTimeline", "awakening-pattern", "spiritual-longing"], guidance: "Hormati fase pertumbuhan tanpa memaksa hasil datang lebih cepat." },
  ],
};

function weightedCoverage(theme: GaiaTheme, signals: GaiaSignal[]): number {
  const weights = GAIA_THEME_WEIGHTS[theme];
  const available = new Set(signals.map((signal) => signal.source));
  const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  const covered = Object.entries(weights).reduce((sum, [source, weight]) => sum + (available.has(source) ? weight : 0), 0);
  return total ? covered / total : 0;
}

function relevantSignals(definition: InsightDefinition, themeSignals: GaiaSignal[]): GaiaSignal[] {
  const tagged = themeSignals.filter((signal) => signal.tags.some((tag) => definition.tags.includes(tag)));
  const strictSourceByInsight: Record<string, string[]> = {
    chakraProfile: ["chakra", "destinyMatrix", "lifePath", "numerology", "humanDesign", "natalChart", "elements", "bazi", "tzolkin", "weton"], physics: ["chakra"], energy: ["chakra", "humanDesign", "natalChart", "bazi", "tzolkin", "weton"], emotion: ["chakra", "natalChart"],
    elementComposition: ["elements", "bazi"], topTalents: ["destinyMatrix", "talents", "numerology", "natalChart", "humanDesign", "vedic", "tzolkin", "weton", "bazi"],
    dominantArchetype: ["archetype", "lifePath", "humanDesign", "numerology", "tzolkin", "vedic", "weton", "bazi"],
    giftGeneKeys: ["geneKeys"], dominantGeneKeys: ["geneKeys"],
    sacredBusiness: ["sacredBusiness", "lifePath", "numerology"],
    strongestEnergyArea: ["chakra", "destinyMatrix", "lifePath", "numerology", "humanDesign", "natalChart", "elements", "bazi", "tzolkin", "weton"],
    moneyBlock: ["destinyMatrix", "natalChart", "lifePath", "numerology", "humanDesign", "bazi", "weton"],
    loveStyle: ["natalChart", "destinyMatrix", "numerology", "humanDesign", "vedic", "tzolkin", "weton", "bazi"],
    emotionalNeeds: ["natalChart", "numerology", "humanDesign", "vedic"],
    ancestralPattern: ["destinyMatrix", "innerChild", "natalChart", "weton"],
  };
  const strictSources = strictSourceByInsight[definition.id];
  if (strictSources) return tagged.filter((signal) => strictSources.includes(signal.source));
  return tagged;
}

const SOURCE_NARRATIVE_HINTS: Record<string, string> = {
  lifePath: "arah dasar perjalanan hidupmu",
  numerology: "pola angka nama dan kelahiranmu",
  destinyMatrix: "pola energi yang dibawa sejak lahir",
  natalChart: "posisi langit saat kelahiranmu",
  humanDesign: "ritme energi dan keputusan tubuhmu",
  innerChild: "jejak emosional dari pengalaman awal",
  chakra: "keseimbangan pusat energi dalam dirimu",
  arcana: "tema jiwa yang menjadi pusatmu",
  elements: "komposisi elemen alamimu",
  vedic: "arah dharma dan pembelajaran jiwamu",
  tzolkin: "ritme kesadaran dan kode waktumu",
  weton: "jejak hari kelahiran dan akar tradisimu",
  bazi: "pola unsur, karya, dan siklus daya hidupmu",
};

const FIELD_MEANING_HINTS: Record<string, string> = {
  expression: "cara kemampuanmu ingin menjadi karya nyata",
  soulUrge: "kebutuhan batin yang memberi rasa bermakna",
  personality: "cara kamu menjaga batas dan terlihat dari luar",
  karmicTail: "pola lama yang aktif saat tubuh merasa tidak aman",
  loveLine: "cara hati belajar memberi, menerima, dan menjaga batas",
  moneyLine: "relasi antara nilai diri, kerja, dan keberanian menerima",
  moneyPattern: "pola nilai diri, kerja, dan respons saat menerima dukungan",
  topTalents: "bakat bawaan yang meminta ruang latihan nyata",
  talentsGreat: "bakat utama yang paling mudah menjadi kontribusi",
  talentsFather: "warisan daya dari garis ayah yang bisa dipakai secara sadar",
  talentsMother: "warisan rasa dari garis ibu yang bisa dilembutkan menjadi kekuatan",
  ancestorLine: "warisan keluarga yang dapat dihormati tanpa harus diulang",
  moon: "kebutuhan emosional dan rasa aman",
  venus: "gaya mencintai dan menerima kasih",
  mercury: "cara berpikir, belajar, dan menyampaikan sesuatu",
  mars: "cara bertindak, menjaga batas, dan menyalurkan tenaga",
  saturn: "area disiplin, tanggung jawab, dan kedewasaan",
  jupiter: "arah pertumbuhan dan rasa percaya",
  northNode: "arah evolusi yang sedang dipelajari",
  southNode: "pola nyaman yang tidak perlu selalu dipilih",
  southNodeInnerChild: "pola aman lama yang dapat membuat bagian kecil dirimu bertahan",
  uranus: "cara pembaruan dan keberanian berbeda bergerak",
  neptune: "kepekaan spiritual dan imajinasi batin",
  pluto: "lapisan transformasi yang bekerja pelan tetapi dalam",
  chiron: "bagian rentan yang dapat menjadi sumber empati",
  midheaven: "cara kontribusimu ingin terlihat dalam karya",
  sun: "dorongan hidup dan pancaran dasar",
  authority: "cara tubuhmu mengambil keputusan dengan lebih jujur",
  definition: "cara energimu merasa terhubung atau membutuhkan ruang",
  profile: "pola belajar dan cara peran sosialmu matang",
  channels: "bakat yang muncul saat energi diarahkan dengan sadar",
  environment: "ruang yang membantu fokus dan tenagamu lebih stabil",
  motivation: "dorongan batin yang perlu dijaga tetap bersih",
  digestion: "cara tubuh dan pikiran mencerna pengalaman",
  cognition: "indra halus yang membantu mengenali keselarasan",
  notSelfTheme: "sinyal bahwa kamu sedang keluar dari pusat diri",
  openCenters: "area yang mudah menyerap suasana dan perlu batas lembut",
  definedCenters: "area energi yang cenderung stabil dan dapat menjadi sumber daya",
  healthChart: "peta keseimbangan tubuh dan energi",
  dominantChakra: "pusat energi yang sedang paling menonjol",
  center: "tema pusat diri yang mewarnai cara energi bergerak",
  composition: "perpaduan unsur yang membentuk ritme dasar",
  dominant: "unsur dominan yang membentuk warna energi utama",
  modalities: "cara energi bergerak antara memulai, menjaga, dan menyesuaikan",
  nakshatra: "jejak batin yang memberi warna pada arah dharma",
  dharmaFocus: "arah kontribusi yang ingin dibumikan dalam hidup",
  mokshaFocus: "cara jiwa belajar melepaskan dan menemukan kebebasan batin",
  atmakaraka: "tema ego yang sedang dimatangkan menjadi kebijaksanaan",
  darakaraka: "cermin relasi yang membantu hati belajar dewasa",
  careerStyle: "cara karya mengalir paling alami",
  relationshipStyle: "cara kedekatan dan batas terbentuk dalam relasi",
  majorYogas: "kombinasi potensi yang dapat menjadi kekuatan nyata",
  kinName: "nama ritme kesadaran yang mewarnai arah batin",
  solarSealGift: "hadiah jiwa yang muncul saat kamu selaras",
  solarSealShadow: "bayangan yang meminta respons lebih sadar",
  galacticToneGift: "kualitas ritme yang membantu hadiahmu bekerja",
  galacticToneLesson: "pelajaran ritme yang mematangkan pilihanmu",
  galacticToneShadow: "pola bayangan yang muncul saat ritme batin tidak seimbang",
  castle: "fase besar pertumbuhan kesadaran",
  color: "warna energi yang memberi nuansa pada cara kamu hadir",
  lifePurpose: "arah makna yang meminta bentuk sehari-hari",
  workStyle: "cara kerja yang paling sesuai dengan ritme bawaan",
  moneyStyle: "cara mengelola nilai, rezeki, dan rasa aman",
  dayMaster: "unsur inti yang membentuk cara daya hidup bergerak",
  tenGods: "pola bakat dan strategi yang dapat dilatih",
  fiveElements: "komposisi unsur yang memengaruhi ritme energi",
  strengths: "kekuatan alami yang bisa menjadi pegangan",
  challenges: "area belajar yang meminta kesadaran lebih lembut",
  watak: "warna karakter yang tampak dalam respons sehari-hari",
};

function meaningForSignal(signal: GaiaSignal): string {
  return FIELD_MEANING_HINTS[signal.field] || signal.tags[0]?.replaceAll("-", " ") || "pola diri yang sedang terlihat";
}

function personalNarrative(definition: InsightDefinition, signals: GaiaSignal[], theme: GaiaTheme): string {
  if (!signals.length) return `${definition.summary} Data yang tersedia belum cukup untuk membentuk pembacaan yang lebih khusus, sehingga bagian ini akan berkembang bersama profilmu.`;
  const sources = [...new Set(signals.map((signal) => signal.source))];
  const hints = sources.slice(0, 3).map((s) => SOURCE_NARRATIVE_HINTS[s] || s).join(" dan ");
  const meaningFragment = [...new Set(signals.slice(0, 4).map(meaningForSignal))].slice(0, 3).join(", ");
  
  const fallbackMeaning = meaningFragment || definition.title.toLowerCase();
  const fallbackHints = hints || "pola bawaanmu";

  switch (definition.id) {
    case "recurringPatterns":
      return `Siklus yang terus berulang dalam hidupmu seringkali berpangkal pada urusan ${fallbackMeaning}. Ketika menghadapi pemicu yang menyentuh ${fallbackHints}, kamu cenderung merespons secara otomatis untuk melindungi diri. Reaksi ini mungkin dulu menyelamatkanmu, namun kini berpotensi menahan langkahmu. Respons yang baru bisa lahir saat kamu menyadari polanya sebelum keburu bertindak.`;
    case "coreFear":
      return `Kecemasan terdalammu sering terpusat pada isu ${fallbackMeaning}. Untuk menjaga diri agar tetap aman, kamu secara tidak sadar membangun strategi pertahanan yang berkaitan dengan ${fallbackHints}. Harga tersembunyi dari perlindungan ini adalah hilangnya kebebasan dan ruang bernapas batin. Arah penyembuhan dimulai dengan memvalidasi rasa takut tersebut, lalu memilih untuk tidak memberikan kendali penuh padanya.`;
    case "innerChild":
      return `Ada kebutuhan emosional di masa lalumu yang belum tuntas mengenai ${fallbackMeaning}. Sinyal dari bagian dirimu ini sering muncul hari ini sebagai kecemasan atau emosi kuat saat bersinggungan dengan ${fallbackHints}. Bagian ini sebenarnya hanya meminta untuk dilihat dan divalidasi. Proses kembali terhubung dimulai saat kamu bersedia merawat dirimu yang sekarang dengan kelembutan.`;
    case "talentDNA":
      return `Kekuatan terbesarmu berporos pada ${fallbackMeaning}. Bakat ini muncul secara alami saat kamu sedang memproses atau mengelola ${fallbackHints}. Kemampuan ini akan tumbuh pesat di lingkungan yang membiarkanmu bekerja sesuai ritme aslimu. Cara terbaik melatihnya adalah dengan mewujudkannya dalam satu tanggung jawab nyata secara konsisten.`;
    case "elementComposition":
      return `Komposisi unsur alam dalam dirimu sangat menentukan kelancaran ${fallbackMeaning}. Sementara unsur yang paling minim asupannya bisa memunculkan area rentan saat kamu berhadapan dengan ${fallbackHints}. Kekuatanmu terletak pada ritme elemen yang mendominasi, sedangkan area minim mengingatkanmu untuk tidak memaksa satu pendekatan saja. Integrasi terbangun saat kamu menyertakan unsur yang jarang disadari ke dalam keseharian.`;
    case "chakraProfile":
      return `Aliran energimu saat ini paling tangguh di area ${fallbackMeaning}. Di sisi lain, titik yang menuntut pemulihan sangat terkait dengan urusan ${fallbackHints}. Dalam kehidupan sehari-hari, ketimpangan ini bisa terasa sebagai kelelahan yang berulang di area yang sama. Keseimbangan akan kembali bukan dengan memaksa area yang kuat, melainkan merawat bagian yang sedang kehabisan daya.`;
    case "loveStyle":
      return `Bahasa utamamu dalam memberikan perhatian erat kaitannya dengan ${fallbackMeaning}. Saat menerima kasih sayang, kamu paling merasa aman jika itu diekspresikan melalui ${fallbackHints}. Kedekatan emosionalmu membutuhkan wadah yang mengakomodasi gaya memberi dan menerima ini. Relasimu bertumbuh matang saat kamu menyadari hakmu untuk menerima cinta secara utuh.`;
    case "careerDNA":
      return `Daya dorong kerjamu paling hidup saat kamu memberikan sumbangsih pada ${fallbackMeaning}. Ritme dan gayamu menyelesaikan sesuatu sangat terkalibrasi dengan ${fallbackHints}. Nilai nyata akan terwujud dengan mudah ketika kamu berhenti memaksakan diri bekerja dengan cara orang lain. Arah karirmu terus menanjak seiring keberanian menjaga ritme orisinalmu.`;
    case "moneyBlock":
      return `Hambatan dalam menerima kelimpahan sering tersangkut pada keyakinan tentang ${fallbackMeaning}. Saat merasa tertekan secara finansial atau nilai diri, insting bertahannya melibatkan pola ${fallbackHints}. Biaya dari pertahanan ini adalah rasa tidak pernah cukup. Ekspansi kapasitasmu dimulai dengan memisahkan nilai sejatimu dari seberapa banyak pencapaian materimu.`;
    case "soulMission":
      return `Benang merah perjalanan hidupmu bermuara pada tema ${fallbackMeaning}. Pelajaran yang terus berulang dan memperdalam kesadaranmu sering datang dari dinamika ${fallbackHints}. Menyelaraskan diri dengan panggilan ini bukanlah tentang mencapai garis akhir, melainkan menghidupinya setiap hari. Tanda bahwa kamu bertumbuh adalah hadirnya ketenangan batin walau hasilnya belum sepenuhnya terlihat.`;
    case "spiritualArchetype":
      return `Pola kebijaksanaan bawaanmu memiliki esensi kuat terkait ${fallbackMeaning}. Berkah dari peran ini paling bersinar ketika kamu mewujudkan kualitas ${fallbackHints}. Sisi bayangannya muncul saat kamu terlalu kaku atau merasa identitasmu sebatas peran tersebut. Menyatukan peran ini berarti menjalaninya dengan kesadaran, bukan sekadar pelabelan.`;
    case "coreWound":
    case "relationshipWound":
      return `Luka batin ini membekas pada ruang ${fallbackMeaning}. Pola perlindungan yang terbentuk seringkali dikendalikan oleh insting pada ${fallbackHints}. Dampaknya adalah kesulitan menyerahkan kepercayaan secara penuh. Pemulihan dimulai saat kamu melepaskan tuntutan untuk harus segera sembuh tanpa jeda.`;
    case "naturalStrength":
    case "coreStrengths":
      return `Kapasitas intimu bermuara pada ${fallbackMeaning}. Dorongan ini beresonansi kuat dengan cara kerjamu melalui ${fallbackHints}. Kapasitas ini menjadi optimal di ruang yang mengizinkannya hadir tanpa banyak intervensi. Kembangkan potensinya dengan latihan berkesadaran.`;
    case "dominantEnergy":
    case "strongestEnergyArea":
      return `Kapasitas energimu yang dominan memancarkan ${fallbackMeaning}. Daya ini sangat terbantu oleh stabilitas pada ${fallbackHints}. Manifestasi sehatnya berupa stamina mental dan fisik yang terjaga lama. Rawat energi ini dengan memahami kapan saatnya beristirahat total.`;
    case "relationshipPattern":
    case "conflictPatterns":
      return `Kecenderungan interaksimu sangat dipengaruhi oleh kebutuhan akan ${fallbackMeaning}. Saat bergesekan dengan orang lain, emosinya sering diwarnai oleh ${fallbackHints}. Menyadari reaksi pertamamu akan memberimu ruang pilihan yang lebih lega. Bertumbuh dalam relasi berarti berani mengubah respons reaktif menjadi pilihan yang berkesadaran.`;
    case "physics":
      return `Lapisan fisikmu memiliki cara khusus dalam merespons beban di area ${fallbackMeaning}. Tingkat ketahanan ini sangat dipengaruhi oleh kelancaran energi pada ${fallbackHints}. Menjaga ritme tubuh berarti memahami batas kapasitas fisik harianmu, sehingga kamu bisa tetap bergerak tanpa harus memaksakan diri hingga terkuras habis.`;
    default:
      return `Pola ini menunjukkan signifikansinya melalui ${fallbackMeaning}. Cara kerjanya diwarnai oleh dinamika pada ${fallbackHints}. Memahami alur ini membantumu melangkah dengan kejernihan dan intensi yang lebih terarah setiap harinya.`;
  }
}

const SOURCE_LABELS: Record<string, string> = {
  lifePath: "Arah Dasar", destinyMatrix: "Pola Kehidupan", talents: "Bakat", innerChild: "Jejak Emosional",
  chakra: "Energi Tubuh", natalChart: "Pola Personal", humanDesign: "Ritme Diri", arcana: "Tema Jiwa",
  numerology: "Angka Nama", elements: "Komposisi Elemen", vedic: "Dharma Jiwa", tzolkin: "Ritme Kesadaran",
  weton: "Akar Kelahiran", bazi: "Pola Unsur",
};

const CHAKRA_LABELS: Record<string, [string, string]> = {
  muladhara: ["Root", "Keamanan dan pondasi"], root: ["Root", "Keamanan dan pondasi"],
  svadhisthana: ["Sacral", "Kreativitas dan aliran rasa"], sacral: ["Sacral", "Kreativitas dan aliran rasa"],
  manipura: ["Solar Plexus", "Daya diri dan keberanian bertindak"], solarplexus: ["Solar Plexus", "Daya diri dan keberanian bertindak"],
  anahata: ["Heart", "Kasih, penerimaan, dan keterhubungan"], heart: ["Heart", "Kasih, penerimaan, dan keterhubungan"],
  vishuddha: ["Throat", "Ekspresi dan komunikasi"], vishudha: ["Throat", "Ekspresi dan komunikasi"], throat: ["Throat", "Ekspresi dan komunikasi"],
  ajna: ["Ajna", "Intuisi dan kejernihan melihat"], thirdeye: ["Ajna", "Intuisi dan kejernihan melihat"],
  sahasrara: ["Crown", "Makna dan keterhubungan spiritual"], crown: ["Crown", "Makna dan keterhubungan spiritual"],
};

const CHAKRA_ORDER = ["sahasrara", "ajna", "vishuddha", "anahata", "manipura", "svadhisthana", "muladhara"];

const CHAKRA_ALIASES: Record<string, string[]> = {
  sahasrara: ["sahasrara", "crown", "Crown"],
  ajna: ["ajna", "thirdEye", "thirdeye", "Ajna"],
  vishuddha: ["vishuddha", "vishudha", "throat", "Throat"],
  anahata: ["anahata", "heart", "Heart"],
  manipura: ["manipura", "solarPlexus", "solarplexus", "Solar Plexus"],
  svadhisthana: ["svadhisthana", "sacral", "Sacral"],
  muladhara: ["muladhara", "root", "Root"],
};

function readable(value: unknown): string {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).map(([key, item]) => `${key}: ${readable(item)}`).join(" · ");
  }
  return String(value ?? "Belum tersedia");
}

function scoreStatus(value: unknown): string {
  const numbers = numericValues(value);
  if (!numbers.length) return "Sedang dibaca";
  const score = numbers.reduce((sum, item) => sum + item, 0) / numbers.length;
  
  // If the values are Arcana numbers from Destiny Matrix (typically 1-22), 
  // the average will often exceed 7 on a 10-scale. We adjust the threshold for 22-scale.
  const isArcanaScale = value && typeof value === "object" && "physics" in value && "energy" in value && "emotion" in value;
  if (isArcanaScale) {
    return score >= 15 ? "Kuat" : score >= 8 ? "Sedang" : "Perlu perhatian";
  }

  return score >= 7 ? "Kuat" : score >= 4 ? "Sedang" : "Perlu perhatian";
}

function numericValues(value: unknown): number[] {
  if (typeof value === "number" && Number.isFinite(value)) return [value];
  if (Array.isArray(value)) return value.flatMap(numericValues);
  if (value && typeof value === "object") return Object.values(value as Record<string, unknown>).flatMap(numericValues);
  return [];
}

function averageScore(value: unknown): number | undefined {
  const numbers = numericValues(value);
  if (!numbers.length) return undefined;
  return Number((numbers.reduce((sum, item) => sum + item, 0) / numbers.length).toFixed(2));
}

function readMetric(value: unknown, metric: string): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return (value as Record<string, unknown>)[metric];
}

function chakraEntries(raw: Record<string, unknown>) {
  return CHAKRA_ORDER.flatMap((chakraKey) => {
    const value = (CHAKRA_ALIASES[chakraKey] ?? [chakraKey]).map((alias) => raw[alias]).find((item) => item !== undefined && item !== null);
    if (value === undefined || value === null) return [];
    const normalized = chakraKey.toLowerCase().replace(/[^a-z]/g, "");
    const [label, theme] = CHAKRA_LABELS[normalized] ?? [chakraKey, "Keseimbangan energi diri"];
    return [{ key: chakraKey, label, theme, value }];
  });
}

function createDataPoints(definition: InsightDefinition, signals: GaiaSignal[]): GaiaDataPoint[] {
  if (definition.id === "chakraProfile") {
    const raw = signals.find((signal) => signal.source === "chakra")?.rawValue;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      return chakraEntries(raw as Record<string, unknown>).map(({ label, theme, value }) => {
        const score = averageScore(value);
        return {
          label,
          value: scoreStatus(value),
          meaning: theme,
          effect: `Kondisi ${label.toLowerCase()} memengaruhi ${theme.toLowerCase()} dalam keseharianmu.`,
          score,
        };
      });
    }
  }

  if (definition.id === "physics") {
    const raw = signals.find((signal) => signal.source === "chakra")?.rawValue;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      return chakraEntries(raw as Record<string, unknown>).flatMap(({ label, theme, value }) => {
        const physics = readMetric(value, "physics");
        const score = averageScore(physics);
        if (score === undefined) return [];
        return [{
          label,
          value: scoreStatus(physics),
          meaning: `Lapisan fisik untuk ${theme.toLowerCase()}`,
          effect: `Kondisi fisik pada area ${label.toLowerCase()} memberi petunjuk tentang daya tahan, beban tubuh, dan kebutuhan pemulihan.`,
          score,
          metric: "physics",
        }];
      });
    }
  }

  if (definition.id === "elementComposition") {
    const raw = signals.find((signal) => signal.source === "elements")?.rawValue;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      if ("status" in raw && raw.status === "incomplete") {
        return [{
          label: "Komposisi Elemen",
          value: "Tidak Lengkap",
          meaning: "Data komposisi elemen belum lengkap. Perbarui profil untuk menghitung ulang.",
          effect: `Hanya ${(raw as any).validCount || 0} elemen planet yang ditemukan (minimal 8 diperlukan untuk hasil akurat).`,
          score: 0
        }];
      }
      return ["Fire", "Earth", "Air", "Water"].flatMap((element) => {
        const value = (raw as Record<string, unknown>)[element] ?? (raw as Record<string, unknown>)[element.toLowerCase()];
        if (value === undefined || value === null) return [];
        const score = typeof value === "number" && Number.isFinite(value) ? value : undefined;
        return [{ label: element, value: `${value}%`, meaning: `${element} menunjukkan cara kualitas ini hadir dalam komposisi dirimu.`, effect: `Proporsi ${element.toLowerCase()} memengaruhi ritme, respons, dan cara kamu menyalurkan potensi.`, score }];
      });
    }
  }

  const listFriendly = new Set(["topTalents", "dominantArchetype", "elementComposition", "emotionalNeeds", "loveLanguage", "sacredBusiness", "dominantGeneKeys", "shadowIntegration", "soulFragment", "emotionalTriggers"]);
  const points = signals.flatMap((signal) => {
    const values = listFriendly.has(definition.id) && Array.isArray(signal.rawValue)
      ? signal.rawValue
      : [signal.rawValue ?? signal.value];
    return values.filter((value) => value !== undefined && value !== null && value !== "").map((value, index) => ({
      label: values.length > 1 ? `${SOURCE_LABELS[signal.source] ?? signal.field} ${index + 1}` : SOURCE_LABELS[signal.source] ?? signal.field,
      value: meaningForSignal(signal),
      meaning: `Bagian ini menerjemahkan ${meaningForSignal(signal)} ke dalam tema ${definition.title.toLowerCase()}.`,
      effect: `Dalam keseharian, pola ini dapat memengaruhi cara kamu memilih, merespons, menjaga energi, dan membangun relasi dengan tema ${definition.title.toLowerCase()}.`,
    }));
  });
  return points.slice(0, definition.id === "topTalents" ? 5 : 7);
}

const THEME_EFFECTS: Record<GaiaTheme, (title: string) => string> = {
  shadow: (title) => `Pola ${title.toLowerCase()} memengaruhi caramu merespons situasi pemicu, bentuk perlindungan batin yang muncul otomatis, dan kebutuhan emosional yang mendasarinya.`,
  talents: (title) => `Bakat ${title.toLowerCase()} akan paling terlihat dari cara potensimu muncul secara alami, berkembang saat dilatih, dan akhirnya menjadi kekuatan yang dapat diandalkan orang lain.`,
  energy: (title) => `Dinamika ${title.toLowerCase()} menentukan ritme vitalitas tubuhmu, seberapa cepat kamu terkuras, dan bentuk pemulihan yang paling efektif untuk mengembalikan keseimbangan.`,
  relationships: (title) => `Pola ${title.toLowerCase()} membentuk caramu menavigasi kedekatan, menetapkan batas yang sehat, serta gaya komunikasi dan keterikatan emosionalmu dengan orang lain.`,
  career: (title) => `Arah ${title.toLowerCase()} memandu caramu menghasilkan kontribusi nyata, ritme kerja yang berkelanjutan, serta cara potensimu diterjemahkan menjadi nilai tambah.`,
  spirituality: (title) => `Dalam konteks ${title.toLowerCase()}, pola ini menjadi kompas yang menunjukkan arah makna, pelajaran besar kehidupan, serta panggilan batin yang sedang kamu tuju.`,
};

function effectNarrative(theme: GaiaTheme, definition: InsightDefinition, dataPoints: GaiaDataPoint[]): string {
  if (!dataPoints.length) {
    return `Bagian ini akan menjadi lebih spesifik ketika sumber profil yang relevan sudah lengkap.`;
  }
  return THEME_EFFECTS[theme](definition.title);
}

function guidanceNarrative(theme: GaiaTheme, definition: InsightDefinition, signals: GaiaSignal[]): string {
  if (!signals.length) {
    return `${definition.guidance} Sumber khusus untuk bagian ini belum tersedia. Biarkan ruang ini tetap terbuka sebagai pertanyaan refleksi sampai profil memiliki bahan yang benar-benar relevan.`;
  }
  
  const tags = [...new Set(signals.flatMap((signal) => signal.tags))];
  const primaryPattern = (tags[0] ?? "dinamika ini").replaceAll("-", " ");
  
  const closingByTheme: Record<GaiaTheme, string> = {
    shadow: `Langkah awal untuk mengurai ${primaryPattern} bukan dengan melawannya, melainkan dengan mengamati kapan ia aktif dan apa yang sebenarnya sedang dilindungi oleh batinmu.`,
    talents: `Untuk melihat hasil dari ${primaryPattern}, bawa kekuatan ini ke dalam satu tanggung jawab nyata, lalu perhatikan perubahannya saat digunakan secara konsisten.`,
    energy: `Tubuh tidak bisa dipaksa melampaui batas ${primaryPattern} tanpa konsekuensi. Jadwalkan waktu jeda sebelum kamu benar-benar kehabisan tenaga.`,
    relationships: `Dalam merawat ${primaryPattern}, pastikan kamu mengkomunikasikan batasmu dengan jelas sehingga kedekatan tidak terasa seperti kehilangan diri.`,
    career: `Cari tempat di mana ${primaryPattern} dapat menjawab masalah yang nyata, karena di situlah nilai kerjamu akan bertumbuh secara organik.`,
    spirituality: `Jadikan ${primaryPattern} sebagai cermin dalam keseharian. Makna tidak harus selalu berupa hal besar, melainkan terlihat pada kejujuran caramu hadir setiap hari.`
  };

  return `${definition.guidance} ${closingByTheme[theme]}`;
}

function createInsight(theme: GaiaTheme, definition: InsightDefinition, themeSignals: GaiaSignal[]): GaiaInsight {
  const signals = relevantSignals(definition, themeSignals);
  const sources = [...new Set(signals.map((signal) => signal.source))];
  const sourceCount = sources.length;
  const coverage = weightedCoverage(theme, signals);
  const averageQuality = signals.length ? signals.reduce((sum, signal) => sum + signal.quality, 0) / signals.length : 0;
  const tagCounts = signals.flatMap((signal) => signal.tags).reduce<Record<string, number>>((counts, tag) => ({ ...counts, [tag]: (counts[tag] || 0) + 1 }), {});
  const agreement = signals.length ? Math.min(1, Math.max(0.35, Math.max(...Object.values(tagCounts)) / Math.max(1, sourceCount))) : 0;
  const confidence = Math.round((coverage * 0.45 + agreement * 0.3 + averageQuality * 0.25) * 100);
  const sensitive = definition.sensitive ?? SENSITIVE_INSIGHT_IDS.has(definition.id);
  const dataPoints = createDataPoints(definition, signals);
  return {
    id: definition.id,
    theme,
    title: definition.title,
    summary: definition.summary,
    narrative: personalNarrative(definition, signals, theme),
    dataPoints,
    effect: effectNarrative(theme, definition, dataPoints),
    strengths: [...new Set(signals.filter((signal) => signal.tags.some((tag) => tag.includes("strength") || tag.includes("gift"))).map(meaningForSignal))].slice(0, 5),
    challenges: [...new Set(signals.filter((signal) => signal.tags.some((tag) => tag.includes("pattern") || tag.includes("edge"))).map(meaningForSignal))].slice(0, 4),
    needs: [...new Set(signals.filter((signal) => signal.tags.some((tag) => tag.includes("needs") || tag.includes("grounding"))).map(meaningForSignal))].slice(0, 4),
    guidance: [guidanceNarrative(theme, definition, signals)],
    signals: [...new Set(signals.flatMap((signal) => signal.tags))],
    meta: { confidence, strength: strengthFromSourceCount(sourceCount), sourceCount, sourceRefs: signals.map((signal) => signal.id), agreementScore: Math.round(agreement * 100), dataQualityScore: Math.round(averageQuality * 100), sensitive, publicSafe: definition.publicSafe ?? (!sensitive && theme !== "shadow"), updatedAt: new Date().toISOString() },
  };
}

export function synthesizeGaiaProfile(blueprint: unknown, userProfile?: unknown): GaiaProfile {
  const now = new Date().toISOString();
  // Merge userProfile into blueprint temporarily for normalization so that birth data is available
  const mergedSource = userProfile ? { ...((blueprint && typeof blueprint === 'object') ? blueprint : {}), userProfile } : blueprint;
  const signals = normalizeGaiaSources(mergedSource);
  const themes = Object.keys(GAIA_INSIGHT_DEFINITIONS) as GaiaTheme[];
  const sections = Object.fromEntries(themes.map((theme) => {
    const themeSignals = signals.filter((signal) => signal.theme === theme);
    return [theme, GAIA_INSIGHT_DEFINITIONS[theme].map((definition) => createInsight(theme, definition, themeSignals))];
  })) as Record<GaiaTheme, GaiaInsight[]>;
  const root = blueprint && typeof blueprint === "object" ? blueprint as Record<string, unknown> : {};
  const hd = root.humanDesign && typeof root.humanDesign === "object" ? root.humanDesign as Record<string, unknown> : {};
  return {
    schema: "bhumi-gaia-profile",
    profileVersion: GAIA_PROFILE_VERSION,
    engineVersion: GAIA_ENGINE_VERSION,
    migrationVersion: GAIA_MIGRATION_VERSION,
    identity: createGaiaIdentity(blueprint),
    sections,
    internal: { humanDesignAuthority: isValidatedHumanDesign(blueprint) && typeof hd.authority === "string" ? hd.authority : null, humanDesignDefinition: isValidatedHumanDesign(blueprint) && typeof hd.definition === "string" ? hd.definition : null, sourceAvailability: Object.fromEntries([...new Set(signals.map((signal) => signal.source))].map((source) => [source, true])) },
    generatedAt: now,
    updatedAt: now,
  };
}
