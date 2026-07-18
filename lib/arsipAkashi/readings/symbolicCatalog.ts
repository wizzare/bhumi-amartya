export type SymbolicEvidenceClass =
  | "astronomical"
  | "historical"
  | "archaeological"
  | "hypothetical"
  | "mythological"
  | "esoteric"
  | "cosmic-esoteric";

export interface SymbolicCatalogEntry {
  id: string;
  title: string;
  aliases: string[];
  evidenceClass: SymbolicEvidenceClass[];
  nameOrigin: string;
  context: string;
  contextDetail: string;
  meaning: string;
  why: string;
  light: string;
  shadow: string;
  integration: string;
  currentAppearance: string;
  growthPractice: string;
  catalogVersion: string;
}

const V = "symbolic-catalog-v1";

const starseed = (id: string, title: string, meaning: string, context: string, evidenceClass: SymbolicEvidenceClass[] = ["cosmic-esoteric"]): SymbolicCatalogEntry => ({
  id, title, aliases: [title], evidenceClass, catalogVersion: V,
  nameOrigin: `${title} adalah nama yang dipinjam dari bahasa langit, mitologi, atau tradisi simbolik untuk menamai kualitas tertentu.`,
  context: `${context} menjadi latar simboliknya`,
  contextDetail: "Astronomi dapat menjelaskan tempat dan karakter objek langit, tetapi tidak membuktikan asal-usul jiwa seseorang.",
  meaning, why: `Resonansi ini dipilih karena tema ${meaning} bertemu dengan pola lintas peta dirimu.`,
  light: `Dalam bentuk matang, kualitas ${meaning} dapat menjadi kontribusi yang berguna bagi hidupmu.`,
  shadow: `Dalam bayangan, kualitas ${meaning} dapat berubah menjadi pertahanan, kelebihan beban, atau jarak dari kebutuhanmu sendiri.`,
  integration: `Integrasikan kualitas ini melalui langkah kecil yang etis dan membumi, tanpa menjadikannya identitas literal.`,
  currentAppearance: "Kedekatan simbolik ini dapat muncul dalam cara kamu memilih, bekerja, berelasi, dan mencari makna.",
  growthPractice: "Latih kualitasnya sambil melepaskan kebutuhan untuk membuktikan bahwa simbol tersebut adalah asal-usulmu.",
});

export const STARSEED_CATALOG: readonly SymbolicCatalogEntry[] = [
  starseed("pleiades", "Pleiades", "empati dan penyembuhan emosional", "gugus bintang terbuka di rasi Taurus", ["astronomical", "cosmic-esoteric"]),
  starseed("sirius", "Sirius", "kebijaksanaan lama dan pengabdian", "sistem bintang terang di rasi Canis Major", ["astronomical", "cosmic-esoteric"]),
  starseed("arcturus", "Arcturus", "kecerdasan visioner dan perbaikan struktur", "raksasa merah terang di rasi Bootes", ["astronomical", "cosmic-esoteric"]),
  starseed("andromeda", "Andromeda", "kebebasan batin dan keluasan perspektif", "galaksi tetangga yang tampak di langit malam", ["astronomical", "cosmic-esoteric"]),
  starseed("lyra", "Lyra", "asal-mula seni, harmoni, dan ekspresi kreatif", "rasi kecil yang dikenal melalui bintang Vega", ["astronomical", "mythological", "cosmic-esoteric"]),
  starseed("vega", "Vega", "kejernihan, keindahan, dan daya pancar", "bintang terang di rasi Lyra", ["astronomical", "cosmic-esoteric"]),
  starseed("orion", "Orion", "keberanian, pencarian, dan ketekunan", "rasi pemburu yang mudah dikenali dari sabuknya", ["astronomical", "mythological", "cosmic-esoteric"]),
  starseed("mintaka", "Mintaka", "ketepatan relasi dan kemampuan menyusun arah", "salah satu bintang pada sabuk Orion", ["astronomical", "cosmic-esoteric"]),
  starseed("polaris", "Polaris", "orientasi, kestabilan, dan arah batin", "bintang penunjuk utara di rasi Ursa Minor", ["astronomical", "cosmic-esoteric"]),
  starseed("aldebaran", "Aldebaran", "keteguhan, penjagaan, dan daya hidup", "bintang terang di rasi Taurus", ["astronomical", "mythological", "cosmic-esoteric"]),
  starseed("antares", "Antares", "intensitas, keberanian, dan transformasi", "superraksasa merah di rasi Scorpius", ["astronomical", "cosmic-esoteric"]),
  starseed("procyon", "Procyon", "kecerdikan, kesiapan, dan gerak yang adaptif", "bintang terang di rasi Canis Minor", ["astronomical", "cosmic-esoteric"]),
  starseed("alpha-centauri", "Alpha Centauri", "kedekatan, kerja sama, dan rasa ingin tahu", "sistem bintang terdekat dengan Matahari", ["astronomical", "cosmic-esoteric"]),
  starseed("cassiopeia", "Cassiopeia", "kedaulatan diri dan pembelajaran dari kesombongan", "rasi berbentuk W di langit utara", ["astronomical", "mythological", "cosmic-esoteric"]),
  starseed("spica", "Spica", "ketelitian, panen, dan kemampuan mengolah bakat", "bintang terang di rasi Virgo", ["astronomical", "mythological", "cosmic-esoteric"]),
  starseed("regulus", "Regulus", "kepemimpinan hati dan keberanian yang bertanggung jawab", "bintang terang di rasi Leo", ["astronomical", "mythological", "cosmic-esoteric"]),
  starseed("draco", "Draco", "penjagaan, ingatan, dan kebijaksanaan ambang", "rasi naga yang mengelilingi langit utara", ["astronomical", "mythological", "cosmic-esoteric"]),
  starseed("nibiru", "Nibiru", "nama kuno yang kemudian diberi tafsir kosmik-esoterik", "istilah yang memiliki sejarah penggunaan dalam pembacaan nama langit dan reinterpretasi modern", ["historical", "mythological", "cosmic-esoteric"]),
  starseed("avian", "Avian", "perspektif luas, kebebasan, dan pengamatan", "arketipe burung yang hidup dalam bahasa simbolik modern", ["esoteric", "cosmic-esoteric"]),
  starseed("feline-lyran", "Feline / Lyran Feline", "kepekaan tubuh, kemandirian, dan keberanian menjaga wilayah batin", "arketipe kucing besar dalam tradisi esoterik modern", ["esoteric", "cosmic-esoteric"]),
];

const civilization = (id: string, title: string, meaning: string, context: string, evidenceClass: SymbolicEvidenceClass[]): SymbolicCatalogEntry => ({
  ...starseed(id, title, meaning, context, evidenceClass),
  aliases: [title],
  nameOrigin: `${title} memiliki sejarah nama dan penggunaan yang berbeda antara sumber sejarah, mitologi, dan tafsir spiritual modern.`,
  contextDetail: "Konteks ini dibaca dengan tingkat kepastian yang sesuai bukti; simbol tidak diperlakukan sebagai bukti peradaban literal.",
});

export const CIVILIZATION_CATALOG: readonly SymbolicCatalogEntry[] = [
  civilization("atlantis", "Atlantis", "pengetahuan, daya cipta, dan tanggung jawab etis", "kisah pulau dalam karya Plato yang kemudian berkembang menjadi arketipe esoterik", ["mythological", "esoteric"]),
  civilization("lemuria-mu", "Lemuria / Mu", "kesadaran hati, alam, dan komunitas", "hipotesis daratan lama yang kemudian ditafsirkan secara spiritual", ["historical", "hypothetical", "esoteric"]),
  civilization("hyperborea", "Hyperborea", "keheningan, daya tahan, dan kemurnian tujuan", "tanah jauh dalam mitologi Yunani", ["mythological", "esoteric"]),
  civilization("doggerland", "Doggerland", "adaptasi, memori komunitas, dan membangun kembali", "daratan prasejarah di kawasan Laut Utara", ["historical", "archaeological"]),
  civilization("shambhala", "Shambhala", "kebijaksanaan, disiplin batin, dan pemerintahan yang selaras", "kerajaan tersembunyi dalam tradisi Buddhis dan tafsir modern", ["mythological", "esoteric"]),
  civilization("agartha", "Agartha", "kedalaman, pengetahuan tersembunyi, dan pencarian batin", "narasi kerajaan bawah tanah dalam literatur esoterik", ["hypothetical", "esoteric"]),
  civilization("aztlan", "Aztlan", "perpindahan, asal-usul, dan pembentukan identitas", "tanah asal dalam tradisi Mexica", ["mythological", "historical"]),
  civilization("thule", "Thule", "batas dunia, ketahanan, dan pencarian wilayah jauh", "nama geografis kuno yang memiliki banyak tafsir lokasi", ["historical", "hypothetical", "mythological"]),
  civilization("kumari-kandam", "Kumari Kandam", "memori tanah, kehilangan, dan kesinambungan budaya", "gagasan daratan tenggelam dalam wacana Tamil modern", ["hypothetical", "esoteric"]),
  civilization("rama", "Rama", "keteraturan, teknologi simbolik, dan tanggung jawab kepemimpinan", "kota atau kerajaan yang dibaca melalui tradisi epik dan tafsir modern", ["mythological", "esoteric"]),
  civilization("ancient-egypt-kemet", "Ancient Egypt / Kemet", "ritus, keseimbangan, dan pengetahuan yang diwariskan", "peradaban Nil dengan catatan sejarah dan arkeologi luas", ["historical", "archaeological", "mythological"]),
  civilization("sumeria", "Sumeria", "pencatatan, kota, hukum, dan awal administrasi", "wilayah selatan Mesopotamia dengan bukti arkeologis kuat", ["historical", "archaeological"]),
  civilization("mesopotamia", "Mesopotamia", "pertemuan sungai, kota, dan negosiasi kekuasaan", "kawasan antara Tigris dan Efrat", ["historical", "archaeological"]),
  civilization("indus-valley", "Indus Valley", "tata ruang, kebersihan, dan kehidupan kota yang teratur", "peradaban urban di sekitar Sungai Indus", ["historical", "archaeological"]),
  civilization("maya", "Maya", "waktu, pengamatan langit, dan kesinambungan pengetahuan", "peradaban Mesoamerika dengan warisan kota dan kalender", ["historical", "archaeological", "mythological"]),
  civilization("aztec", "Aztec", "keteguhan, ritus, dan pengelolaan pusat komunitas", "kekaisaran Mexica dengan sumber sejarah dan arkeologi", ["historical", "archaeological", "mythological"]),
  civilization("inca", "Inca", "jalan, koordinasi, dan hubungan dengan pegunungan", "peradaban Andes dengan jaringan administrasi dan lanskap", ["historical", "archaeological"]),
  civilization("ancient-nusantara", "Ancient Nusantara", "maritim, pertukaran, dan pengetahuan lokal", "jaringan kerajaan dan komunitas kepulauan Asia Tenggara", ["historical", "archaeological"]),
  civilization("sunda-land", "Sunda Land", "adaptasi pesisir, migrasi, dan memori bentang alam", "gagasan paparan benua Asia Tenggara pada masa muka laut lebih rendah", ["historical", "archaeological", "hypothetical"]),
  civilization("anunnaki-nibiru", "Anunnaki / Nibiru Civilization", "mitologi penciptaan, kuasa, dan reinterpretasi kosmik modern", "nama-nama Mesopotamia yang kemudian dipadukan dengan narasi esoterik modern", ["mythological", "cosmic-esoteric"]),
];

export const SYMBOLIC_CATALOG_VERSION = V;
