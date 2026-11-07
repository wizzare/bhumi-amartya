import type { ArsipAkashiInsightModel } from "../synthesis/types";
import type { ArsipAkashiProfileReading } from "../profile/viewModel";
import { READING_DEFINITIONS, type ArsipAkashiReadingDef } from "./definitions";
import { CIVILIZATION_CATALOG, STARSEED_CATALOG, type SymbolicCatalogEntry } from "./symbolicCatalog";
import { semesterTiming } from "../profile/timing";

export interface ArsipAkashiRenderedReading {
  id: string;
  sectionId: string;
  roomTitle: string;
  title: string;
  shortMeaning?: string;
  narrative: string;
  deepExplanation: string;
  practicalReflection: string;
  items?: ArsipAkashiProfileReading["items"];
  recommendations?: Array<{ itemId: string; displayLabel: string; category: string; relevanceScore: number; priority: "current" | "later"; supportingFactIds: string[]; contributingSystems: string[]; confidenceBand: "high" | "medium" | "limited"; currentReadiness: string; growthGap: string; weeklyGuidanceEligibility: string[] }>;
  detailSections?: Array<{ title: string; body: string }>;
  deepNarrativeProvenance?: DeepNarrativeParagraphProvenance[];
  order: number;
}

export interface DeepNarrativeParagraphProvenance {
  paragraphIndex: number;
  paragraphPurpose: "inti-pola-pribadi" | "cara-pola-bekerja" | "kekuatan-potensi-matang" | "shadow-konflik-risiko" | "arah-integrasi-penerapan";
  selectedFactIds: string[];
  contributingSystems: string[];
  semanticThemes: string[];
  prohibitedOverlap: string[];
  paragraphFingerprint: string;
}

type SymbolicResonance = {
  title: string;
  meaning: string;
  why: string;
  light: string;
  shadow: string;
  integration: string;
  nameOrigin: string;
  context: string;
  contextDetail: string;
  historicalNote: string;
  currentAppearance: string;
  growthPractice: string;
};

const STARSEED_RESONANCES: SymbolicResonance[] = [
  { title: "Sirius", meaning: "kebijaksanaan lama, pengabdian, dan kemampuan membawa pengetahuan batin ke kehidupan yang nyata", why: "Resonansi ini muncul ketika pola tanggung jawab, penyembuhan, dan pencarian makna bertemu dalam peta dirimu.", light: "Dalam bentuk terang, kamu dapat mengubah pemahaman menjadi pelayanan yang berguna.", shadow: "Dalam bayangan, rasa bertanggung jawab bisa berubah menjadi beban untuk menyelamatkan semuanya sendiri.", integration: "Biarkan pengetahuanmu menjadi tindakan yang membumi, bukan alasan untuk memikul hidup semua orang.", nameOrigin: "Nama Sirius berasal dari kata Yunani yang berarti menyala atau sangat terang, sesuai dengan tampaknya bintang ini di langit malam.", context: "bintang paling terang di langit malam dari pandangan Bumi", contextDetail: "Ia berada dalam rasi Canis Major dan dikenal sebagai pasangan bintang yang diamati sejak banyak tradisi langit kuno.", historicalNote: "Pengamatan terhadap kemunculannya pernah dipakai sebagai penanda musim, tetapi hal itu tidak membuktikan asal-usul jiwa seseorang.", currentAppearance: "Dalam hidupmu, kedekatan simbolik ini dapat muncul sebagai dorongan menjadikan wawasan berguna bagi orang yang kamu rawat.", growthPractice: "Latih pengabdian yang punya batas, sehingga kontribusi lahir dari pilihan sadar dan bukan rasa wajib yang tidak pernah selesai." },
  { title: "Pleiades", meaning: "empati, penyembuhan emosional, dan kemampuan menciptakan ruang yang aman", why: "Resonansi ini tampak ketika kepekaan relasional dan kebutuhan akan kelembutan muncul berulang dalam sintesismu.", light: "Dalam bentuk terang, kamu membantu suasana menjadi lebih jujur dan hangat.", shadow: "Dalam bayangan, kamu dapat terlalu cepat membaca kebutuhan orang lain dan melupakan batasmu sendiri.", integration: "Rawat kelembutanmu dengan batas yang jelas agar kepedulian tidak berubah menjadi kelelahan.", nameOrigin: "Nama Pleiades berasal dari istilah Yunani untuk gugus bintang yang juga hadir dalam banyak cerita tentang tujuh saudari.", context: "gugus bintang terbuka di rasi Taurus", contextDetail: "Gugus ini mudah dikenali sebagai kumpulan cahaya kecil dan telah menjadi penanda langit dalam berbagai tradisi pertanian serta pelayaran.", historicalNote: "Cerita tentangnya berbeda antarbudaya, sehingga penggunaannya di sini tetap berupa simbol dan bukan bukti identitas literal.", currentAppearance: "Dalam hidupmu, resonansi ini dapat terasa ketika kamu peka terhadap suasana dan ingin membuat relasi lebih aman.", growthPractice: "Praktikkan empati dengan menyebut kebutuhanmu sendiri sebelum menawarkan terlalu banyak ruang kepada orang lain." },
  { title: "Arcturus", meaning: "cara berpikir sistemik, kecerdasan visioner, dan dorongan memperbaiki struktur yang ada", why: "Resonansi ini muncul ketika kemampuan melihat pola dan keinginan melakukan transformasi berjalan bersama.", light: "Dalam bentuk terang, kamu mampu membuat hal yang rumit terasa lebih tertata dan mungkin dijalani.", shadow: "Dalam bayangan, kebutuhan memperbaiki keadaan dapat membuatmu sulit menerima proses yang belum sempurna.", integration: "Gunakan kejernihanmu untuk membuka ruang perubahan, bukan untuk mengontrol semua hasilnya.", nameOrigin: "Arcturus berakar dari bahasa Yunani yang berkaitan dengan penjaga beruang, merujuk pada posisinya dekat rasi Bootes dan Ursa Major.", context: "raksasa merah terang di rasi Bootes", contextDetail: "Warna dan cahayanya membantu pengamat mengenali jalur bintang di langit utara tanpa memerlukan alat rumit.", historicalNote: "Ia memiliki sejarah panjang dalam navigasi dan penamaan langit, sedangkan makna spiritualnya adalah lapisan simbolik yang datang kemudian.", currentAppearance: "Dalam hidupmu, kedekatan ini dapat tampak sebagai kebiasaan mencari pola dan merapikan sistem yang terasa tidak selaras.", growthPractice: "Biarkan transformasi berlangsung bertahap dan ukur keberhasilan dari manfaatnya, bukan dari seberapa banyak yang bisa kamu kendalikan." },
  { title: "Polaris", meaning: "arah batin, kestabilan, dan kemampuan menjadi titik orientasi saat keadaan tidak pasti", why: "Resonansi ini terlihat ketika peta dirimu berulang kali kembali pada tema arah, ketenangan, dan kejelasan nilai.", light: "Dalam bentuk terang, kehadiranmu membantu orang lain menemukan orientasi tanpa kehilangan dirinya.", shadow: "Dalam bayangan, kamu bisa merasa harus selalu tahu arah bahkan ketika waktunya masih untuk mendengarkan.", integration: "Izinkan arahmu bertumbuh dari keheningan, bukan dari tuntutan untuk selalu menjadi penunjuk jalan.", nameOrigin: "Polaris berasal dari kata Latin untuk kutub, karena letaknya tampak dekat dengan arah utara langit.", context: "bintang penunjuk utara dalam rasi Ursa Minor", contextDetail: "Posisinya relatif dekat dengan kutub langit utara membuatnya tampak stabil ketika bintang lain bergerak semu sepanjang malam.", historicalNote: "Pelaut dan pengelana menggunakannya sebagai orientasi, namun fungsi navigasi itu bukan bukti tentang garis asal jiwa.", currentAppearance: "Dalam hidupmu, simbol ini dapat muncul sebagai kebutuhan menemukan nilai yang tetap ketika keadaan di sekitar berubah.", growthPractice: "Berlatihlah membedakan arah batin dari tuntutan untuk selalu menjadi orang yang paling tahu." },
];

const CIVILIZATION_RESONANCES: SymbolicResonance[] = [
  { title: "Atlantis", meaning: "pengetahuan maju, daya cipta, dan tanggung jawab etis atas kemampuan", why: "Resonansi ini muncul ketika kemampuan membangun, mengelola, dan memikirkan dampak kekuatanmu saling bertemu.", light: "Dalam bentuk terang, kamu dapat mengubah wawasan menjadi bentuk yang melindungi kehidupan.", shadow: "Dalam bayangan, hasil dan kontrol dapat terasa lebih penting daripada hati yang menjaganya.", integration: "Biarkan kapasitasmu melayani kehidupan, bukan menjadi ukuran harga dirimu.", nameOrigin: "Atlantis berasal dari nama yang dikenal melalui kisah Plato tentang sebuah pulau yang ditempatkan di luar Pilar Herakles.", context: "peradaban simbolik yang sering dibayangkan sebagai masyarakat berpengetahuan tinggi", contextDetail: "Tidak ada konsensus arkeologis bahwa Atlantis merupakan peradaban historis yang terbukti.", historicalNote: "Konteksnya terutama bersifat filosofis, mitologis, dan kemudian spiritual, sehingga pembacaannya di sini tidak menyatakan fakta sejarah.", currentAppearance: "Dalam hidupmu, resonansi ini dapat terasa sebagai dorongan membangun sesuatu yang berdampak sekaligus menimbang akibatnya.", growthPractice: "Satukan kemampuan dan etika agar daya cipta tidak mengulang pola kuasa yang kehilangan kepekaan." },
  { title: "Lemuria", meaning: "kesadaran hati, kedekatan dengan alam, penyembuhan intuitif, dan komunitas", why: "Resonansi ini tampak ketika tubuh, rasa aman, kepedulian, dan memori emosional menjadi tema yang berulang.", light: "Dalam bentuk terang, kamu membuat ruang terasa lebih menerima dan hidup.", shadow: "Dalam bayangan, kamu dapat memberi terlalu banyak sambil menunda kebutuhanmu sendiri.", integration: "Beri kelembutan bentuk yang nyata agar ia dapat bertahan tanpa menghapus dirimu.", nameOrigin: "Nama Lemuria mula-mula muncul sebagai hipotesis abad kesembilan belas tentang jembatan daratan, lalu berkembang menjadi gagasan spiritual.", context: "peradaban simbolik yang sering ditempatkan dekat Samudra Hindia atau Pasifik", contextDetail: "Lokasi dan keberadaannya tidak terbukti secara sejarah, sehingga maknanya lebih aman dibaca sebagai arketipe.", historicalNote: "Peralihan dari teori lama ke narasi spiritual menunjukkan bahwa istilah ini memiliki sejarah penggunaan yang berubah.", currentAppearance: "Dalam hidupmu, resonansi ini dapat muncul sebagai kepekaan pada alam, tubuh, dan kebutuhan komunitas.", growthPractice: "Jadikan kepedulian sebagai praktik yang memiliki batas agar kelembutan dapat bertahan dalam kehidupan sehari-hari." },
  { title: "Hyperborea", meaning: "keheningan, daya tahan, kemurnian tujuan, dan kebijaksanaan batin", why: "Resonansi ini muncul ketika perjalananmu membutuhkan jarak dari kebisingan untuk kembali pada nilai yang paling jernih.", light: "Dalam bentuk terang, kesendirianmu menjadi tempat memulihkan arah dan keteguhan.", shadow: "Dalam bayangan, ketenangan dapat berubah menjadi jarak yang sulit ditembus.", integration: "Jaga ruang sunyimu sambil tetap membiarkan hubungan yang sehat mendekat.", nameOrigin: "Hyperborea berasal dari istilah Yunani yang berarti wilayah di luar angin utara, sebuah tempat jauh dalam imajinasi klasik.", context: "tanah mitologis di luar wilayah yang dikenal oleh penulis Yunani kuno", contextDetail: "Tidak ada lokasi historis yang disepakati, dan kisahnya berfungsi sebagai gambaran tentang kejauhan serta kemurnian.", historicalNote: "Jejaknya berada dalam sastra dan mitologi, bukan bukti peradaban yang dapat dipastikan secara arkeologis.", currentAppearance: "Dalam hidupmu, simbol ini dapat terasa sebagai kebutuhan akan sunyi untuk menjaga tujuan tetap jernih.", growthPractice: "Pertahankan kesendirian yang memulihkan sambil belajar membiarkan dukungan hadir tanpa mengganggu pusat dirimu." },
  { title: "Doggerland", meaning: "kehidupan dekat air, kemampuan beradaptasi, memori komunitas, dan membangun kembali setelah perubahan", why: "Resonansi ini terlihat ketika tema perpindahan, kehilangan, daya lenting, dan rasa memiliki hadir bersama.", light: "Dalam bentuk terang, kamu mampu menemukan cara baru untuk tetap hidup setelah perubahan besar.", shadow: "Dalam bayangan, kenangan kehilangan dapat membuatmu takut membangun sesuatu lagi.", integration: "Bawa ingatanmu sebagai kebijaksanaan, bukan sebagai bukti bahwa semua hal akan hilang.", nameOrigin: "Doggerland adalah nama modern untuk daratan yang dahulu menghubungkan Britania dengan benua Eropa.", context: "lanskap prasejarah di kawasan Laut Utara yang kemudian tergenang", contextDetail: "Temuan geologi dan arkeologi menunjukkan adanya kehidupan manusia, meski banyak detail masyarakatnya masih hipotetis.", historicalNote: "Perubahan garis pantai dan migrasi membuatnya menjadi konteks untuk membaca adaptasi, bukan kisah kehancuran yang pasti.", currentAppearance: "Dalam hidupmu, resonansi ini dapat muncul sebagai kemampuan menata ulang rasa memiliki setelah perubahan atau kehilangan.", growthPractice: "Gunakan ingatan untuk membangun kembali dengan lentur, bukan untuk menahan diri dari kemungkinan baru." },
];

// Retained for migration compatibility; production selection uses the versioned catalog below.
void STARSEED_RESONANCES;
void CIVILIZATION_RESONANCES;

function symbolicHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function symbolicSignature(model: ArsipAkashiInsightModel): string {
  return model.sections.flatMap((section) => section.selectedFacts.map((fact) => `${fact.systemId}:${fact.domain}:${fact.value}`)).join("|");
}

function symbolicClause(value: string): string {
  return value.toLowerCase().replace(/[.!?]+$/g, "").replace(/^dalam bentuk terang,?\s*/i, "").replace(/^dalam bayangan,?\s*/i, "");
}

function buildSymbolicDetailSections(entry: SymbolicCatalogEntry, isStarseed: boolean) {
  const backgroundTitle = isStarseed ? "LATAR ASTRONOMI" : "LATAR SEJARAH";
  const certainty = entry.evidenceClass.includes("astronomical")
    ? "Astronomi dapat menjelaskan lokasi dan karakter objek langit, tetapi tidak membuktikan asal-usul jiwa secara literal."
    : entry.evidenceClass.includes("historical") || entry.evidenceClass.includes("archaeological")
      ? "Sumber sejarah dan arkeologi memberi tingkat kepastian yang berbeda, sehingga bagian ini tidak melampaui bukti yang tersedia."
      : "Konteksnya terutama mitologis, hipotetis, atau esoterik, sehingga ia dibaca sebagai pola simbolik dan bukan fakta literal. Untuk resonansi cosmic-esoteric, bahasa ini tetap merupakan tafsir modern.";
  const entryCertainty = certainty.replace("Untuk resonansi cosmic-esoteric", `Untuk ${entry.title} dalam resonansi cosmic-esoteric`);
  const sections = [
    { title: "ASAL-USUL NAMA", body: `${entry.nameOrigin} Nama ${entry.title} membawa arti dasar yang membantu merangkum kualitas ${entry.meaning}. Penggunaannya masuk ke bahasa astronomi, sejarah, mitologi, atau spiritual melalui tradisi yang berbeda-beda pada jalur ${entry.title}. Dalam bacaan ini, nama ${entry.title} adalah simbol kedekatan batin dan bukan identitas literal.` },
    { title: backgroundTitle, body: `${entry.context}. Untuk ${entry.title}, ${entry.contextDetail.toLowerCase()} Untuk ${entry.title}, ${entryCertainty.toLowerCase()} Karena itu, latar ${entry.title} dipakai untuk memberi konteks pada arketipe yang kamu rasakan, bukan untuk mengklaim asal-usul yang telah terbukti.` },
    { title: "MAKNA SIMBOLIK", body: `${entry.meaning}. ${entry.why} Pada ${entry.title}, ${entry.currentAppearance.toLowerCase()} Dalam keseharian, simbol ${entry.title} dapat terlihat melalui pilihan kecil, cara berelasi, dan cara kamu memberi makna pada pengalaman.` },
    { title: "KEKUATAN", body: `${entry.light} Kekuatan ${entry.title} dapat menjadi kontribusi dalam hubungan, pekerjaan, dan pertumbuhan spiritual ketika dijalankan dengan sadar. Ia membantu kamu merespons keadaan dengan kapasitas ${entry.title} yang lebih matang dan berguna. Bentuk terbaik ${entry.title} tetap fleksibel, sehingga hadiah simbolik ini tidak berubah menjadi peran yang harus dimainkan terus-menerus.` },
    { title: "SISI BAYANGAN", body: `${entry.shadow} Ketika ${entry.title} berlebihan, pola ini dapat membuatmu mengabaikan batas, memaksakan kontrol, atau menjauh dari kebutuhan yang sebenarnya. Pola menghindar dalam ${entry.title} biasanya muncul saat rasa amanmu terganggu. Dampaknya dapat terasa pada relasi, pekerjaan, tubuh, atau cara kamu menilai dirimu sendiri melalui tema ${entry.title}.` },
    { title: "MISI PERTUMBUHAN", body: `Untuk ${entry.title}, ${entry.integration.toLowerCase()} Dalam latihan ${entry.title}, ${entry.growthPractice.toLowerCase()} Yang perlu dilepas dalam ${entry.title} adalah kebutuhan untuk membuktikan tafsir ini sebagai kebenaran mutlak. Arah pertumbuhan ${entry.title} adalah mempraktikkan kualitasnya secara etis dalam kehidupan yang sedang kamu jalani sekarang.` },
  ];
  return sections.map((section) => ({ ...section, body: section.body.replace(/\s+/g, " ").trim() }));
}

function symbolicItem(resonance: SymbolicCatalogEntry, isStarseed: boolean) {
  const detailSections = buildSymbolicDetailSections(resonance, isStarseed);
  return {
    title: resonance.title,
    shortMeaning: resonance.meaning,
    deepExplanation: detailSections.map((section) => section.body).join(" "),
    practicalReflection: `Refleksi ${resonance.title}: pilih satu kualitas simbolik yang bisa diterjemahkan menjadi tindakan etis hari ini.`,
    detailSections,
    score: 0,
    supportingThemes: [resonance.meaning],
    supportingFactIds: [],
    contributingSystems: [],
    confidenceBand: "medium" as const,
    evidenceClass: resonance.evidenceClass,
    explanationEligibility: true,
  };
}

export function renderSymbolicOriginReadings(model: ArsipAkashiInsightModel): ArsipAkashiRenderedReading[] {
  const signature = symbolicSignature(model);
  const facts = model.sections.flatMap((section) => section.selectedFacts);
  const systems = [...new Set(facts.map((fact) => fact.systemId))];
  const factIds = facts.map((fact) => fact.factId);
  const select = (catalog: readonly SymbolicCatalogEntry[]) => catalog
    .map((entry) => ({ entry, score: symbolicHash(`${signature}:${entry.id}`) % 1000 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2 + symbolicHash(`${signature}:count`) % 2);
  const starseed = select(STARSEED_CATALOG);
  const civilizations = select(CIVILIZATION_CATALOG);

  const makeReading = (id: string, title: string, selected: Array<{ entry: SymbolicCatalogEntry; score: number }>, reflection: string, isStarseed: boolean): ArsipAkashiRenderedReading => ({
    id,
    sectionId: "symbolic-origin",
    roomTitle: "ASAL USUL & PERADABAN",
    title,
    narrative: `Bacaan ${title} memakai resonansi sebagai bahasa simbolik tentang arketipe dan pola jiwa, bukan sebagai bukti asal-usul literal. ${selected.map(({ entry }) => `${entry.title} hadir karena ${symbolicClause(entry.why)}`).join("; ")}. Kualitas terang ${title} tampak ketika ${selected.map(({ entry }) => symbolicClause(entry.light)).join("; sementara ")}. Dalam bayangan ${title}, ${selected.map(({ entry }) => symbolicClause(entry.shadow)).join("; sementara ")}. Arah integrasi ${title} adalah membawa simbol ini ke pilihan nyata tanpa menjadikannya identitas yang kaku.`,
    deepExplanation: `Bacaan ${title} memakai resonansi sebagai bahasa simbolik tentang arketipe dan pola jiwa, bukan sebagai bukti asal-usul literal. ${selected.map(({ entry }) => `${entry.title} hadir karena ${symbolicClause(entry.why)}`).join("; ")}. Kualitas terang ${title} tampak ketika ${selected.map(({ entry }) => symbolicClause(entry.light)).join("; sementara ")}. Dalam bayangan ${title}, ${selected.map(({ entry }) => symbolicClause(entry.shadow)).join("; sementara ")}. Arah integrasi ${title} adalah membawa simbol ini ke pilihan nyata tanpa menjadikannya identitas yang kaku.`,
    practicalReflection: `${title}: ${reflection}`,
    items: selected.map(({ entry, score }) => ({ ...symbolicItem(entry, isStarseed), score, supportingFactIds: factIds, contributingSystems: systems, confidenceBand: systems.length >= 8 ? "high" as const : systems.length >= 4 ? "medium" as const : "limited" as const, explanationEligibility: systems.length >= 2 })),
    order: id === "resonansi-starseed" ? 1 : 2,
  });

  return [
    makeReading("resonansi-starseed", "Resonansi Starseed", starseed, "Apa kualitas simbolik dari resonansi ini yang bisa kamu bawa ke satu tindakan nyata hari ini?", true),
    makeReading("jejak-peradaban-jiwa", "Jejak Peradaban Jiwa", civilizations, "Bagian mana dari pelajaran simbolik ini yang ingin kamu integrasikan dengan lebih sadar dalam hidupmu sekarang?", false),
  ];
}

const PARAGRAPH_PURPOSES: DeepNarrativeParagraphProvenance["paragraphPurpose"][] = [
  "inti-pola-pribadi",
  "cara-pola-bekerja",
  "kekuatan-potensi-matang",
  "shadow-konflik-risiko",
  "arah-integrasi-penerapan",
];

const DOMAIN_MEANINGS: Record<string, { core: string; daily: string; strength: string; shadow: string; integration: string }> = {
  identity: {
    core: "cara inti dirimu mengenali peran, nilai, dan sikap hidup",
    daily: "pilihan yang terasa benar sebelum kamu mampu menjelaskannya panjang lebar",
    strength: "kehadiran yang konsisten ketika kamu tidak perlu memainkan peran tambahan",
    shadow: "tekanan untuk membuktikan diri melalui citra yang tidak sepenuhnya jujur",
    integration: "membedakan ekspresi asli dari kebiasaan tampil agar diterima",
  },
  mechanics: {
    core: "ritme energi, respons tubuh, dan cara keputusan menjadi matang",
    daily: "naik turunnya tenaga saat kamu menerima permintaan, tekanan, atau peluang",
    strength: "kemampuan bergerak tepat waktu tanpa memaksakan kapasitas",
    shadow: "dorongan bertindak dari tekanan mental sebelum tubuh merasa siap",
    integration: "memberi jeda pada respons agar pilihan lahir dari pusat yang lebih stabil",
  },
  talents: {
    core: "kemampuan kerja, bakat praktis, dan bentuk kontribusi yang bisa dibangun",
    daily: "cara kamu memecah masalah, belajar dari praktik, dan membuat hasil terlihat",
    strength: "kapasitas mengubah pola yang dibaca menjadi karya yang berguna",
    shadow: "membandingkan kemampuanmu dengan ukuran luar sebelum menguji nilainya sendiri",
    integration: "melatih satu kemampuan sampai bisa menjadi kontribusi yang terukur",
  },
  shadow: {
    core: "pola perlindungan, luka, dan bagian diri yang muncul saat rasa aman terganggu",
    daily: "reaksi otomatis ketika percakapan, pilihan, atau hasil menyentuh titik sensitif",
    strength: "kejujuran melihat pola sulit tanpa mengubahnya menjadi identitas tetap",
    shadow: "mengulang pertahanan lama sampai kebutuhan yang sebenarnya tidak terdengar",
    integration: "memberi nama pada pemicu sebelum memilih respons yang lebih dewasa",
  },
  relationships: {
    core: "cara kebutuhan emosional, batas, dan kedekatan bekerja dalam relasi",
    daily: "cara kamu memberi ruang, meminta kejelasan, atau membaca suasana orang lain",
    strength: "kemampuan membangun hubungan yang hangat tanpa kehilangan batas pribadi",
    shadow: "menunggu orang lain memahami kebutuhan yang belum kamu ucapkan jelas",
    integration: "mengubah kepekaan menjadi komunikasi yang sederhana dan dapat dijawab",
  },
  health: {
    core: "hubungan tubuh, energi, pemulihan, dan lingkungan dengan keseharianmu",
    daily: "sinyal lelah, tegang, lapar, penuh, atau butuh ruang yang sering datang lebih cepat dari pikiran",
    strength: "kemampuan merawat kapasitas sebelum tubuh harus memberi tanda keras",
    shadow: "mengabaikan batas tubuh karena target, rasa bersalah, atau tuntutan sekitar",
    integration: "membuat perawatan tubuh menjadi ritme dasar yang realistis dan non-klinis",
  },
  spirituality: {
    core: "cara makna, intuisi, dan pertumbuhan batin membentuk arah hidup",
    daily: "momen hening, rasa tahu yang lembut, atau pertanyaan batin yang terus kembali",
    strength: "kemampuan membuat pengalaman batin menjadi sikap yang membumi",
    shadow: "mengejar makna besar sampai langkah kecil yang nyata terabaikan",
    integration: "membawa pemahaman spiritual ke keputusan, relasi, dan tanggung jawab harian",
  },
  timing: {
    core: "fase hidup, momentum, dan perubahan irama yang sedang aktif",
    daily: "pergeseran prioritas ketika waktu meminta persiapan, eksekusi, penutupan, atau pemulihan",
    strength: "kepekaan membaca musim hidup tanpa menjadikannya kepastian nasib",
    shadow: "memaksa semua hal bergerak dengan tempo yang sama",
    integration: "menyesuaikan langkah dengan fase yang sedang berjalan tanpa kehilangan arah",
  },
  location: {
    core: "pengaruh ruang, tempat, dan lingkungan terhadap rasa aman serta fokus",
    daily: "perubahan tubuh dan pikiran ketika suasana tempat mendukung atau menguras",
    strength: "kemampuan memilih ruang yang membuat kapasitasmu lebih mudah muncul",
    shadow: "bertahan di lingkungan yang mengganggu hanya karena sudah terbiasa",
    integration: "menata tempat, jarak, dan paparan agar tubuh punya dukungan nyata",
  },
  karma: {
    core: "pelajaran berulang, memori pola, dan undangan menyelesaikan siklus lama",
    daily: "situasi yang terasa pernah terjadi, meski bentuk orang dan tempatnya berubah",
    strength: "kemampuan melihat pengulangan sebagai bahan pembelajaran, bukan hukuman",
    shadow: "menganggap pola lama sebagai takdir yang tidak bisa dilatih ulang",
    integration: "memilih respons baru pada titik kecil tempat siklus biasanya berulang",
  },
  growth: {
    core: "arah perkembangan, latihan jiwa, dan kapasitas baru yang sedang dibangun",
    daily: "dorongan memperbaiki cara memilih, bekerja, berelasi, atau merawat diri",
    strength: "kemampuan bertumbuh melalui praktik yang bisa diulang",
    shadow: "mengubah pertumbuhan menjadi tuntutan agar selalu lebih baik dari kemarin",
    integration: "memilih satu latihan yang cukup kecil untuk dijalani dengan konsisten",
  },
  resources: {
    core: "hubungan dengan uang, waktu, tenaga, dan rasa cukup",
    daily: "keputusan kecil tentang menyimpan, memberi, menerima, membeli, atau menunda",
    strength: "kemampuan membangun struktur yang membuat nilai kontribusi lebih jelas",
    shadow: "mencari rasa aman melalui kontrol berlebihan atau penghindaran finansial",
    integration: "membuat batas risiko, pencatatan, dan keputusan sumber daya yang jujur",
  },
};

const READING_PURPOSES: Record<string, { purpose: string; distinction: string; activation: string; application: string }> = {
  "arketipe-utama": { purpose: "postur hidup dominan", distinction: "berbeda dari bacaan lain karena ia merangkum posisi batin utama sebelum detail mental, relasi, atau karya dibaca", activation: "saat kamu perlu memilih cara hadir yang paling jujur", application: "membiarkan tindakan besar dan kecil berangkat dari pusat yang sama" },
  "cara-berpikir-memaknai": { purpose: "ritme kognisi dan cara memberi arti pada pengalaman", distinction: "berbeda dari arketipe utama karena fokusnya bukan siapa kamu, melainkan cara pikiranmu menyusun makna", activation: "saat informasi, percakapan, atau perubahan meminta tafsir", application: "memeriksa asumsi sebelum menjadikannya kesimpulan" },
  "nilai-kebutuhan-batin": { purpose: "nilai emosional dan kebutuhan yang tidak bisa dinegosiasikan terlalu lama", distinction: "berbeda dari bacaan identitas lain karena ia menyorot rasa aman internal", activation: "saat kamu merasa nyaman, tersentuh, tersinggung, atau menutup diri", application: "menyebut kebutuhan sebelum ia berubah menjadi tuntutan diam-diam" },
  "cara-hadir-di-dunia": { purpose: "ekspresi sosial, kesan pertama, dan cara peranmu terbaca orang lain", distinction: "berbeda dari inti identitas karena ia membahas bagaimana kualitas batin menjadi terlihat", activation: "saat kamu memasuki ruang, memimpin percakapan, atau mengambil tempat", application: "menyelaraskan niat kehadiran dengan dampak yang diterima sekitar" },
  "ritme-energi-alami": { purpose: "pola naik turun tenaga yang paling wajar bagi tubuh dan perhatianmu", distinction: "berbeda dari pemulihan energi karena ia membaca pola dasar sebelum tubuh kelelahan", activation: "saat jadwal, ajakan, dan peluang datang bersamaan", application: "membangun hari berdasarkan kapasitas, bukan tekanan pembuktian" },
  "cara-mengambil-keputusan": { purpose: "jalur keputusan yang menghubungkan tubuh, rasa, dan pikiran", distinction: "berbeda dari respons kehidupan karena ia fokus pada momen memilih", activation: "saat pilihan terasa mendesak atau banyak suara memberi arah", application: "menguji keputusan melalui sinyal internal dan hasil setelahnya" },
  "pola-respons-kehidupan": { purpose: "cara pertama dirimu menjawab perubahan, peluang, dan gangguan", distinction: "berbeda dari keputusan karena ia membaca respons spontan sebelum pilihan disusun", activation: "saat hidup bergerak di luar rencana", application: "mengenali respons awal tanpa langsung mematuhinya" },
  "fokus-produktivitas-konsistensi": { purpose: "cara menjaga fokus dan hasil tanpa menguras seluruh sistem diri", distinction: "berbeda dari gaya kerja karena ia membahas keberlanjutan hasil", activation: "saat target, distraksi, dan ekspektasi bertemu", application: "memilih ritme kerja yang cukup padat tetapi tetap manusiawi" },
  "cara-memulihkan-energi": { purpose: "cara tubuh dan perhatian kembali utuh setelah dipakai", distinction: "berbeda dari ritme energi karena ia membaca proses pulang setelah energi turun", activation: "saat lelah, penuh, atau terlalu banyak merespons", application: "membuat pemulihan sebagai bagian dari sistem, bukan hadiah terakhir" },
  "luka-inti": { purpose: "titik sensitif yang membentuk perlindungan terdalam", distinction: "berbeda dari self-sabotage karena ia membaca akar rasa sakit, bukan tindakan otomatisnya", activation: "saat pengalaman lama terasa disentuh kembali", application: "memisahkan kejadian sekarang dari luka yang sedang ikut berbicara" },
  "mekanisme-perlindungan": { purpose: "strategi bertahan yang dulu membantu tetapi kini perlu diperbarui", distinction: "berbeda dari luka inti karena ia menyorot respons pertahanan", activation: "saat rasa aman turun dan tubuh ingin mengendalikan keadaan", application: "mengganti pertahanan otomatis dengan batas yang sadar" },
  "pola-self-sabotage": { purpose: "cara tidak sadar yang menghambat langkah sendiri", distinction: "berbeda dari ketakutan tersembunyi karena ia membaca perilaku yang muncul setelah takut aktif", activation: "saat peluang mendekat tetapi tubuh memilih menunda atau mengacaukan ritme", application: "mencatat pemicu, aksi otomatis, dan satu respons pengganti" },
  "ketakutan-tersembunyi": { purpose: "ketakutan yang tidak selalu diakui tetapi mengarahkan pilihan", distinction: "berbeda dari self-sabotage karena ia membaca sumber rasa gentar sebelum perilaku muncul", activation: "saat kedekatan, tanggung jawab, atau perubahan terasa mengancam", application: "memberi bahasa pada rasa takut tanpa menyerahkan keputusan kepadanya" },
  "warisan-keluarga-leluhur": { purpose: "pola keluarga dan memori relasional yang ikut membentuk respons", distinction: "berbeda dari karma berulang karena ia menyorot akar keluarga dan rasa memiliki", activation: "saat isu rumah, loyalitas, atau peran keluarga muncul", application: "menghormati asal tanpa mewarisi semua bebannya" },
  "karma-pola-berulang": { purpose: "siklus pengalaman yang meminta respons baru", distinction: "berbeda dari warisan keluarga karena ia membaca pengulangan lintas konteks", activation: "saat tema yang sama muncul pada orang, tempat, atau fase berbeda", application: "memotong siklus lewat keputusan kecil yang berbeda" },
  "arah-penyembuhan-integrasi": { purpose: "cara menyatukan luka, kekuatan, dan latihan baru", distinction: "berbeda dari jalur spiritual karena ia fokus pada pemulihan psikospiritual yang praktis", activation: "saat kamu siap berhenti hanya memahami luka dan mulai mengubah respons", application: "memilih latihan penyembuhan yang terlihat dalam tindakan harian" },
  "talenta-alami": { purpose: "bakat bawaan yang muncul sebelum diasah secara profesional", distinction: "berbeda dari kemampuan yang sudah dimiliki karena ia membaca sumber alami kemampuan", activation: "saat kamu belajar cepat atau membantu tanpa merasa sedang tampil", application: "memberi ruang praktik agar bakat menjadi keterampilan" },
  "gaya-kerja": { purpose: "cara bekerja yang membuat tenaga, fokus, dan hasil bertemu", distinction: "berbeda dari produktivitas karena ia membaca ekosistem kerja yang cocok", activation: "saat tugas, tenggat, dan kolaborasi menekan ritme", application: "menata metode kerja sesuai kapasitas dan bukan hanya standar luar" },
  "arah-karya-kontribusi": { purpose: "jenis kontribusi yang terasa bermakna dan berguna", distinction: "berbeda dari arah karier karena ia menyorot nilai karya sebelum bidang dipilih", activation: "saat kamu bertanya hasil apa yang layak diberi tenaga", application: "menghubungkan kemampuan dengan kebutuhan nyata" },
  "ekonomi-pola-penghasilan": { purpose: "ritme menerima, mengelola, dan menumbuhkan sumber daya", distinction: "berbeda dari money block karena ia membaca pola ekonomi sehat yang bisa dibangun", activation: "saat uang, nilai, waktu, dan risiko perlu diputuskan", application: "membuat struktur penghasilan yang dapat diuji tanpa janji hasil pasti" },
  "money-block": { purpose: "hambatan batin yang mengganggu rasa aman dan keputusan finansial", distinction: "berbeda dari ekonomi karena ia membaca konflik psikologis di balik uang", activation: "saat harga diri, kontrol, atau rasa takut ikut menentukan keputusan sumber daya", application: "mengurai pemicu finansial sebelum membuat keputusan besar" },
  "arah-karier-bidang-sesuai": { purpose: "keluarga peran dan bidang yang paling layak diuji", distinction: "berbeda dari kontribusi karena ia mengarah pada konteks kerja yang lebih konkret", activation: "saat kamu memilih jalur, posisi, layanan, atau pasar", application: "menguji kecocokan melalui pengalaman kecil yang memberi data" },
  "kemampuan-sudah-dimiliki": { purpose: "keterampilan nyata yang sudah terbentuk dari pengalaman hidup", distinction: "berbeda dari talenta alami karena ia membaca kemampuan yang sudah punya bukti", activation: "saat kamu meremehkan hal yang sebenarnya sudah bisa diandalkan", application: "mengumpulkan bukti kemampuan dan menggunakannya secara lebih sengaja" },
  "kemampuan-perlu-dipelajari": { purpose: "celah keterampilan yang perlu dilatih agar potensi menjadi hasil", distinction: "berbeda dari kemampuan yang sudah dimiliki karena ia menunjuk latihan berikutnya", activation: "saat arah besar jelas tetapi eksekusi masih tersendat", application: "memilih satu skill prioritas dan mengujinya dalam proyek kecil" },
  "kebutuhan-emosional-relasi": { purpose: "kebutuhan rasa aman, kedekatan, dan pengakuan dalam hubungan", distinction: "berbeda dari love block karena ia membaca kebutuhan sehat sebelum hambatan muncul", activation: "saat kamu merasa dekat, jauh, diabaikan, atau terlalu diminta", application: "mengucapkan kebutuhan dengan batas yang bisa dipahami" },
  "memberi-menerima-cinta": { purpose: "cara cinta bergerak masuk dan keluar dari dirimu", distinction: "berbeda dari kebutuhan emosional karena ia membaca pertukaran kasih", activation: "saat kamu memberi terlalu banyak atau sulit menerima", application: "menyeimbangkan perhatian dengan kemampuan menerima dukungan" },
  "pola-ketertarikan-pasangan": { purpose: "pola tertarik, memilih, dan mengenali dinamika pasangan", distinction: "berbeda dari relasi matang karena ia membaca magnet awal hubungan", activation: "saat seseorang terasa familiar, menarik, atau menantang", application: "membedakan chemistry dari kecocokan yang bisa dirawat" },
  "konflik-komunikasi-batas": { purpose: "cara konflik dan batas diri meminta bahasa yang lebih jelas", distinction: "berbeda dari love block karena ia membaca keterampilan komunikasi saat tegang", activation: "saat kebutuhan bertabrakan atau percakapan dihindari", application: "menyampaikan batas sebelum tubuh menyimpannya sebagai jarak" },
  "love-block-pola-berulang": { purpose: "hambatan cinta yang membuat pola relasi berulang", distinction: "berbeda dari luka inti karena ia khusus membaca pengulangan dalam kedekatan", activation: "saat hubungan mulai meminta kejujuran yang lebih rentan", application: "mengenali pemicu kedekatan dan memilih respons yang tidak mengulang siklus" },
  "arah-relasi-matang": { purpose: "cara hubungan tumbuh menjadi lebih dewasa dan dua arah", distinction: "berbeda dari kebutuhan emosional karena ia membaca bentuk relasi yang ingin dibangun", activation: "saat kamu menilai apakah hubungan masih bisa tumbuh", application: "membangun kesepakatan yang menjaga kedekatan dan batas" },
  "peta-chakra": { purpose: "peta simbolik pusat energi tubuh dan perhatian", distinction: "berbeda dari energi dominan karena ia membaca distribusi pusat tubuh secara simbolik", activation: "saat tubuh memberi sinyal lewat tegang, terbuka, berat, atau penuh", application: "membaca sinyal tubuh secara lembut dan non-klinis" },
  "sistem-cerna": { purpose: "cara tubuh mengolah makanan, tekanan, dan pengalaman", distinction: "berbeda dari ritme tubuh karena ia menyorot proses menerima dan mencerna", activation: "saat pola makan, stres, atau suasana memengaruhi perut dan energi", application: "membuat kebiasaan makan dan jeda yang lebih ramah tubuh" },
  "lingkungan-ideal": { purpose: "jenis ruang yang mendukung fokus, rasa aman, dan pemulihan", distinction: "berbeda dari ritme tubuh karena ia membaca pengaruh tempat", activation: "saat lokasi tertentu membuatmu hidup atau terkuras", application: "menata paparan ruang agar tubuh lebih mudah bekerja sama" },
  "ritme-tubuh": { purpose: "tempo biologis dan kebutuhan pemulihan harian", distinction: "berbeda dari sistem cerna karena ia membaca keseluruhan siklus tubuh", activation: "saat jadwal dan kapasitas tubuh tidak berjalan searah", application: "mengatur hari dengan memperhatikan sinyal naik turun energi" },
  "energi-dominan": { purpose: "kualitas energi utama yang paling terasa di tubuh dan suasana", distinction: "berbeda dari peta chakra karena ia membaca nada dominan, bukan pusat spesifik", activation: "saat kamu memasuki ruang dan suasana tubuh cepat berubah", application: "menggunakan energi dominan tanpa membiarkannya mengambil alih semua pilihan" },
  "jalur-spiritual": { purpose: "arah praktik dan makna yang paling sesuai dengan pertumbuhan batin", distinction: "berbeda dari arah penyembuhan karena ia membaca jalan spiritual yang lebih luas", activation: "saat pertanyaan tentang tujuan dan kepercayaan muncul", application: "memilih praktik yang membuatmu lebih hadir dan bertanggung jawab" },
  "evolusi-jiwa": { purpose: "perubahan kualitas kesadaran yang sedang dilatih hidup", distinction: "berbeda dari soul lessons karena ia membaca gerak berkembang, bukan pelajaran spesifik", activation: "saat hidup meminta versi dirimu yang lebih matang", application: "menjawab fase pertumbuhan dengan latihan yang membumi" },
  "potensi-spiritual": { purpose: "kemungkinan batin yang dapat matang menjadi kontribusi bermakna", distinction: "berbeda dari bakat spiritual karena ia membaca potensi luas sebelum bentuknya dipilih", activation: "saat intuisi, empati, atau makna terasa menguat", application: "menguji potensi batin lewat tindakan yang etis dan sederhana" },
  "bakat-spiritual": { purpose: "kemampuan batin yang lebih spesifik dan bisa dilatih", distinction: "berbeda dari potensi spiritual karena ia membaca kapasitas yang lebih operasional", activation: "saat kamu peka terhadap pola, suasana, simbol, atau pesan batin", application: "melatih bakat dengan batas, rendah hati, dan realitas harian" },
  "jejak-intuisi": { purpose: "cara intuisi meninggalkan tanda sebelum pikiran menyusul", distinction: "berbeda dari potensi channeling karena ia membaca sinyal batin sehari-hari", activation: "saat tubuh tahu sesuatu sebelum alasan tersusun", application: "mencatat sinyal intuisi dan membandingkannya dengan hasil nyata" },
  "potensi-channeling": { purpose: "kemampuan menerima makna halus tanpa kehilangan pijakan", distinction: "berbeda dari jejak intuisi karena ia membaca kanal ekspresi batin yang lebih terarah", activation: "saat pesan, simbol, atau rasa batin meminta diterjemahkan", application: "menjaga channeling tetap etis, membumi, dan tidak menggantikan keputusan sadar" },
  "soul-mission": { purpose: "arah kontribusi jiwa yang mengikat pelajaran dan pertumbuhan", distinction: "berbeda dari arketipe utama karena ia membaca panggilan, bukan postur dasar", activation: "saat kamu merasa hidup meminta arah yang lebih besar dari kenyamanan", application: "menerjemahkan panggilan menjadi tanggung jawab yang bisa dijalani" },
  "soul-gifts": { purpose: "hadiah jiwa yang bisa menjadi daya dukung bagi hidup dan orang lain", distinction: "berbeda dari talenta alami karena ia membaca hadiah batin yang lebih esensial", activation: "saat kemampuanmu terasa membantu tanpa harus dipaksakan", application: "menggunakan hadiah itu dengan batas dan etika" },
  "soul-lessons": { purpose: "pelajaran jiwa yang berulang sampai dipraktikkan dengan dewasa", distinction: "berbeda dari karma berulang karena ia membaca makna pelajaran bagi arah jiwa", activation: "saat situasi lama kembali meminta respons baru", application: "memilih latihan yang mengubah pelajaran menjadi kedewasaan" },
  "soul-shadow": { purpose: "bayangan jiwa yang muncul saat hadiah dan luka bertemu", distinction: "berbeda dari luka inti karena ia membaca bayangan pada tingkat identitas jiwa", activation: "saat kekuatanmu berubah menjadi beban, kontrol, atau penghindaran", application: "mengintegrasikan bayangan agar hadiah jiwa tidak kehilangan kelembutan" },
};

function readingPurpose(reading: ArsipAkashiReadingDef) {
  return READING_PURPOSES[reading.readingId] ?? {
    purpose: `makna khusus dari ${reading.title}`,
    distinction: `berbeda dari bacaan lain karena ${reading.title} membaca sudut pengalaman yang spesifik`,
    activation: "saat tema ini muncul dalam pilihan harian",
    application: "membawa pemahaman ini ke satu tindakan yang bisa diuji",
  };
}

function visibleReadingName(reading: ArsipAkashiReadingDef): string {
  return reading.title.toLowerCase();
}

function sanitizeVisible(text: string): string {
  return text
    .replace(/[{}[\]"]/g, "")
    .replace(/\b(systemId|factId|sourceVersion|blueprintFingerprint|calculationFingerprint|confidence|score|skor|rank|ranking|peringkat|dominantSigns)\b:?/gi, "")
    .replace(/[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/g, "")
    .replace(/\b(age|usia)\s*\d+\s*[-–]\s*\d+\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function safeFactCue(value: string, fallback: string): string {
  return humanizeFactCue(value, "general", "general", fallback);
}

const HD_TYPE_MAP: Record<string, string> = {
  generator: "daya cipta berkelanjutan yang merespons panggilan nyata",
  "manifesting generator": "kecepatan bergerak dinamis yang menyatukan inisiasi dan respons",
  "manifesting-generator": "kecepatan bergerak dinamis yang menyatukan inisiasi dan respons",
  projector: "kepekaan membimbing dan mengenali esensi sistem sekitar",
  manifestor: "daya inisiasi mandiri yang berani membuka jalan baru",
  reflector: "kejernihan cermin batin yang merefleksikan kesehatan lingkungan",
};

const HD_AUTHORITY_MAP: Record<string, string> = {
  sacral: "kejujuran sinyal tubuh seketika",
  emotional: "kejernihan rasa yang mematang bersama waktu dan gelombang perasaan",
  "solar plexus": "kejernihan rasa yang mematang bersama waktu dan gelombang perasaan",
  splenic: "ketajaman intuisi seketika demi keselamatan dan ketenangan tubuh",
  spleen: "ketajaman intuisi seketika demi keselamatan dan ketenangan tubuh",
  ego: "keteguhan kehendak hati yang tulus",
  heart: "keteguhan kehendak hati yang tulus",
  "self-projected": "kejujuran resonansi suara batin saat berbicara tanpa beban",
  "g-center": "kejujuran resonansi suara batin saat berbicara tanpa beban",
  environmental: "kejernihan pikiran yang membutuhkan ruang lingkungan yang selaras",
  mental: "kejernihan pikiran yang membutuhkan ruang lingkungan yang selaras",
  lunar: "kebijaksanaan menyelaraskan keputusan dengan siklus waktu",
};

const HD_PROFILE_MAP: Record<string, string> = {
  "1/3": "fondasi penyelidikan mendalam yang ditempa oleh pengalaman nyata",
  "1 3": "fondasi penyelidikan mendalam yang ditempa oleh pengalaman nyata",
  "1/4": "fondasi penyelidikan kokoh yang diperkuat oleh kehangatan jejaring pertemanan",
  "1 4": "fondasi penyelidikan kokoh yang diperkuat oleh kehangatan jejaring pertemanan",
  "2/4": "bakat alami yang terpanggil melalui perjumpaan bermakna",
  "2 4": "bakat alami yang terpanggil melalui perjumpaan bermakna",
  "2/5": "bakat alami yang mampu memproyeksikan solusi praktis bagi sesama",
  "2 5": "bakat alami yang mampu memproyeksikan solusi praktis bagi sesama",
  "3/5": "kebijaksanaan dari uji coba langsung yang menawarkan solusi nyata bagi sesama",
  "3 5": "kebijaksanaan dari uji coba langsung yang menawarkan solusi nyata bagi sesama",
  "3/6": "keberanian bereksperimen yang bermuara pada keteladanan hidup matang",
  "3 6": "keberanian bereksperimen yang bermuara pada keteladanan hidup matang",
  "4/6": "kehangatan relasi yang tumbuh menjadi figur pengamat bijaksana",
  "4 6": "kehangatan relasi yang tumbuh menjadi figur pengamat bijaksana",
  "4/1": "ketetapan arah batin yang berpijak pada persahabatan kokoh",
  "4 1": "ketetapan arah batin yang berpijak pada persahabatan kokoh",
  "5/1": "daya kepemimpinan solutif yang berakar pada penyelidikan mendalam",
  "5 1": "daya kepemimpinan solutif yang berakar pada penyelidikan mendalam",
  "5/2": "kemampuan menawarkan jalan keluar sembari merawat ruang pemulihan pribadi",
  "5 2": "kemampuan menawarkan jalan keluar sembari merawat ruang pemulihan pribadi",
  "6/2": "keteladanan batin yang memerlukan ruang hening untuk menyerap hikmah",
  "6 2": "keteladanan batin yang memerlukan ruang hening untuk menyerap hikmah",
  "6/3": "keteladanan jiwa yang terus diperbarui lewat keberanian belajar dari dinamika hidup",
  "6 3": "keteladanan jiwa yang terus diperbarui lewat keberanian belajar dari dinamika hidup",
};

const NUMEROLOGY_NUMBER_MAP: Record<string, string> = {
  "1": "keberanian merintis langkah mandiri dan kepemimpinan orisinal",
  "2": "kepekaan menyelaraskan rasa dan membangun jembatan kerja sama",
  "3": "daya ekspresi kreatif yang menyegarkan suasana dan menghidupkan karya",
  "4": "ketekunan menyusun fondasi yang stabil, tertib, dan berdaya tahan",
  "5": "keluwesan menjemput dinamika perubahan dan kemerdekaan batin",
  "6": "kehangatan merawat keharmonisan, keluarga, dan tanggung jawab cinta",
  "7": "kedalaman kontemplasi yang tekun mencari hakikat kebenaran",
  "8": "kemampuan mengelola otoritas, daya wujud, dan kelimpahan nyata",
  "9": "kelapangan welas asih universal yang mengikhlaskan siklus lama",
  "11": "kepekaan inspirasi intuitif yang menjembatani wawasan batin",
  "22": "daya wujud besar yang mengubah cita-cita luhur menjadi realitas fisik",
  "33": "pengabdian penuh welas asih yang mengasuh kesadaran sesama",
};

const ZODIAC_SIGN_MAP: Record<string, string> = {
  aries: "dorongan memulai langkah baru dengan keberanian penuh",
  taurus: "ketenangan menjaga stabilitas, kenyamanan, dan kualitas membumi",
  gemini: "kelincahan menghubungkan gagasan dan bertukar sudut pandang",
  cancer: "kelembutan menjaga ruang batin dan kelekatan emosional",
  leo: "kemuliaan hati yang memancarkan kehangatan dan inspirasi tulus",
  virgo: "ketelitian menyempurnakan detail dan ketulusan melayani",
  libra: "kepekaan menimbang keadilan, harmoni, dan keindahan relasi",
  scorpio: "ketajaman menyelami kedalaman emosi dan transformasi batin",
  sagittarius: "kelapangan jiwa dalam mencari makna luas dan cakrawala baru",
  capricorn: "ketangguhan mendaki tanggung jawab melalui integritas dan disiplin",
  aquarius: "orisinalitas pandangan yang berpihak pada kemanusiaan dan masa depan",
  pisces: "keheningan empati yang meresapi rasa halus kehidupan",
};

const DESTINY_MATRIX_ARCANA_MAP: Record<string, string> = {
  "1": "daya kehendak mencipta dan menggerakkan potensi",
  "2": "keheningan intuisi yang menjaga kedalaman rahasia batin",
  "3": "kelimpahan daya asuh yang menyuburkan pertumbuhan dan keindahan",
  "4": "ketegasan menata struktur, perlindungan, dan tanggung jawab nyata",
  "5": "kebijaksanaan menyampaikan ajaran dan memelihara nilai luhur",
  "6": "kejujuran memilih dari keterbukaan cinta yang tulus dan harmonis",
  "7": "fokus mengarahkan tujuan untuk mengatasi rintangan perjalanan",
  "8": "kejernihan memahami sebab-akibat dan menegakkan keadilan batin",
  "9": "kedalaman penjelajahan sunyi guna menemukan lentera kebijaksanaan",
  "10": "keluwesan berselaras dengan pasang surut roda rezeki kehidupan",
  "11": "kelembutan menundukkan ego melalui ketabahan dan kekuatan batin",
  "12": "keberanian melihat dari sudut pandang baru dengan kerelaan bijak",
  "13": "keikhlasan melepaskan wujud usang demi menyambut pembaruan hidup",
  "14": "keanggunan memadukan perbedaan dalam kesabaran dan keseimbangan",
  "15": "kemampuan mengenali keterikatan ilusi dan membebaskan daya sejati",
  "16": "keberanian meruntuhkan kepalsuan agar fondasi sejati merekah",
  "17": "kejernihan bakat dan harapan yang menerangi jalan bagi sekitar",
  "18": "keberanian merangkul ruang bawah sadar dan imajinasi mendalam",
  "19": "kegembiraan berbagi terang, kelimpahan, dan kejayaan yang hangat",
  "20": "kebangkitan kesadaran batin yang menyembuhkan ikatan masa lalu",
  "21": "kelapangan jiwa yang merangkul keutuhan dan perdamaian semesta",
  "22": "kemurnian hati yang melangkah dengan kepolosan dan kebebasan sejati",
};

const BAZI_ELEMENT_MAP: Record<string, string> = {
  jia: "keteguhan pohon besar yang menaungi dan terus bertumbuh",
  "yang wood": "keteguhan pohon besar yang menaungi dan terus bertumbuh",
  yi: "kelenturan tanaman menjalar yang cerdas beradaptasi",
  "yin wood": "kelenturan tanaman menjalar yang cerdas beradaptasi",
  bing: "kehangatan surya yang memancarkan terang tanpa pamrih",
  "yang fire": "kehangatan surya yang memancarkan terang tanpa pamrih",
  ding: "cahaya lentera yang menuntun dengan ketulusan dan kehangatan",
  "yin fire": "cahaya lentera yang menuntun dengan ketulusan dan kehangatan",
  wu: "ketenteraman gunung kokoh yang menjadi tempat berteduh terpercaya",
  "yang earth": "ketenteraman gunung kokoh yang menjadi tempat berteduh terpercaya",
  ji: "kesuburan tanah yang sabar menumbuhkan benih-benih kebaikan",
  "yin earth": "kesuburan tanah yang sabar menumbuhkan benih-benih kebaikan",
  geng: "ketajaman pedang yang menegakkan keadilan dan ketegasan prinsip",
  "yang metal": "ketajaman pedang yang menegakkan keadilan dan ketegasan prinsip",
  xin: "keindahan permata yang memancarkan kilau keanggunan dan martabat",
  "yin metal": "keindahan permata yang memancarkan kilau keanggunan dan martabat",
  ren: "kelapangan samudra yang mengalir luas dengan daya dorong besar",
  "yang water": "kelapangan samudra yang mengalir luas dengan daya dorong besar",
  gui: "kelembutan embun pagi yang meresap menyejukkan keheningan batin",
  "yin water": "kelembutan embun pagi yang meresap menyejukkan keheningan batin",
  wood: "keteguhan pertumbuhan dan kelenturan daya cipta",
  kayu: "keteguhan pertumbuhan dan kelenturan daya cipta",
  fire: "kehangatan semangat dan kejernihan terang batin",
  api: "kehangatan semangat dan kejernihan terang batin",
  earth: "ketenangan stabilitas dan keteguhan memelihara amanah",
  tanah: "ketenangan stabilitas dan keteguhan memelihara amanah",
  metal: "ketegasan prinsip, ketelitian, dan keadilan nyata",
  logam: "ketegasan prinsip, ketelitian, dan keadilan nyata",
  water: "kelapangan alir rasa dan kedalaman kebijaksanaan hening",
  air: "kelapangan alir rasa dan kedalaman kebijaksanaan hening",
};

const WETON_PASARAN_MAP: Record<string, string> = {
  legi: "keikhlasan budi pekerti dan pandangan hidup yang optimis",
  pahing: "semangat ketegasan, martabat diri, dan keberanian bersikap",
  pon: "kearifan menjaga rasa aman, kebijaksanaan, dan kewibawaan batin",
  wage: "ketahanan mental dalam menghadapi laku prihatin dan pemikiran hening",
  kliwon: "kedalaman spiritual, keteguhan hati, dan kepekaan intuisi naluriah",
};

const HD_NOT_SELF_MAP: Record<string, string> = {
  frustrasi: "sinyal kejujuran tubuh saat memaksakan hal yang belum selaras",
  frustration: "sinyal kejujuran tubuh saat memaksakan hal yang belum selaras",
  pahit: "sinyal batin ketika bimbingan dan kepekaanmu belum dihargai dengan tulus",
  bitterness: "sinyal batin ketika bimbingan dan kepekaanmu belum dihargai dengan tulus",
  marah: "dorongan batin yang terhambat saat langkahmu belum terinformasikan dengan baik",
  anger: "dorongan batin yang terhambat saat langkahmu belum terinformasikan dengan baik",
  kecewa: "tanda kebutuhan ruang hening untuk menyaring kejernihan lingkungan",
  disappointment: "tanda kebutuhan ruang hening untuk menyaring kejernihan lingkungan",
};

function humanizeFactCue(
  factValue: string,
  systemId: string,
  domain: string,
  fallback: string,
  readingId?: string,
): string {
  // Check Chinese Heavenly Stems before stripping
  const CHINESE_STEM_MAP: Record<string, string> = {
    "甲": "keteguhan pohon besar yang menaungi dan terus bertumbuh",
    "乙": "kelenturan tanaman menjalar yang cerdas beradaptasi",
    "丙": "kehangatan surya yang memancarkan terang tanpa pamrih",
    "丁": "cahaya lentera yang menuntun dengan ketulusan dan kehangatan",
    "戊": "ketenteraman gunung kokoh yang menjadi tempat berteduh terpercaya",
    "己": "kesuburan tanah yang sabar menumbuhkan benih-benih kebaikan",
    "庚": "ketajaman pedang yang menegakkan keadilan dan ketegasan prinsip",
    "辛": "keindahan permata yang memancarkan kilau keanggunan dan martabat",
    "壬": "kelapangan samudra yang mengalir luas dengan daya dorong besar",
    "癸": "kelembutan embun pagi yang meresap menyejukkan keheningan batin",
  };
  for (const [char, meaning] of Object.entries(CHINESE_STEM_MAP)) {
    if (factValue.includes(char)) return meaning;
  }

  const sanitized = sanitizeVisible(factValue)
    .replace(/[.!?]+/g, "")
    .replace(/[_/|:;]+/g, " ")
    .replace(/\b(undefined|null|unknown|unavailable|nan)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!sanitized) return fallback;

  const lower = sanitized.toLowerCase();

  // If reading is warisan-keluarga-leluhur, reject HD not-self immediately
  if (readingId === "warisan-keluarga-leluhur" && systemId === "human-design") {
    return fallback;
  }

  // Not-self theme from HD (strictly for somatic energy, never ancestral trauma)
  if (readingId !== "warisan-keluarga-leluhur") {
    for (const [key, meaning] of Object.entries(HD_NOT_SELF_MAP)) {
      if (lower === key || lower.includes(key)) return meaning;
    }
  }

  for (const [key, meaning] of Object.entries(HD_PROFILE_MAP)) {
    if (lower === key || lower.includes(`profile ${key}`) || lower.includes(`profil ${key}`) || lower.includes(`profil relasi ${key}`)) {
      return meaning;
    }
  }

  for (const [key, meaning] of Object.entries(HD_TYPE_MAP)) {
    if (lower === key || lower.includes(`type ${key}`) || lower === `tipe ${key}`) return meaning;
  }

  for (const [key, meaning] of Object.entries(HD_AUTHORITY_MAP)) {
    if (lower === key || lower.includes(`authority ${key}`) || lower.includes(`otoritas ${key}`)) return meaning;
  }

  // Specific domain adaptation for Money Block (psychological friction with money)
  if (readingId === "money-block") {
    if (systemId === "destiny-matrix" || lower.includes("arcana") || lower.includes("energi")) {
      const arcMatch = lower.match(/\b(2[0-2]|1[0-9]|[1-9])\b/);
      if (arcMatch) {
        const num = arcMatch[1];
        if (num === "7") return "dorongan bekerja tanpa henti karena cemas kehilangan kendali masa depan";
        if (num === "8") return "kecemasan menuntut hak dan ketakutan dicurangi atau dihakimi secara materi";
        if (num === "10") return "kegelisahan saat roda rezeki melambat dan dorongan berspekulasi";
        if (num === "15") return "keterikatan berlebih pada materi atau rasa bersalah saat menerima kelimpahan";
        if (num === "18") return "ketakutan bawah sadar akan kekurangan yang memicu keraguan melangkah";
        if (num === "4") return "kekakuan anggaran yang membatasi peluang ekspansi baru";
        if (num === "3") return "kekhawatiran bahwa kelimpahan materi tidak akan bertahan lama";
      }
    }
    if (systemId === "numerology") {
      const numMatch = lower.match(/\b(11|22|33|[1-9])\b/);
      if (numMatch) {
        const n = numMatch[1];
        if (n === "1") return "kebiasaan memikul beban finansial sendirian tanpa mau meminta pertolongan";
        if (n === "4") return "kekakuan anggaran yang membatasi peluang pertumbuhan baru";
        if (n === "5") return "dorongan belanja impulsif demi mencari pelarian rasa bebas sesaat";
        if (n === "8") return "tekanan mental untuk selalu membuktikan kemapanan materi di hadapan orang lain";
      }
    }
    return "kecemasan tentang kecukupan materi dan dorongan mengontrol keadaan secara berlebih";
  }

  // Specific domain adaptation for Ekonomi & Pola Penghasilan (real value creation & models)
  if (readingId === "ekonomi-pola-penghasilan") {
    if (systemId === "destiny-matrix" || lower.includes("arcana") || lower.includes("energi")) {
      const arcMatch = lower.match(/\b(2[0-2]|1[0-9]|[1-9])\b/);
      if (arcMatch) {
        const num = arcMatch[1];
        if (num === "7") return "penghasilan yang bertumbuh lewat kepemimpinan proyek dan mobilitas tinggi";
        if (num === "8") return "kelimpahan yang lahir dari tata kelola transparan dan keadilan sistem";
        if (num === "10") return "rezeki yang mengalir lewat kejelian menangkap peluang dan kemitraan luwes";
        if (num === "3" || num === "4") return "pembangunan aset produktif lewat ketekunan menata struktur kerja";
      }
    }
    if (systemId === "numerology") {
      const numMatch = lower.match(/\b(11|22|33|[1-9])\b/);
      if (numMatch) {
        const n = numMatch[1];
        if (n === "1") return "rintisan usaha mandiri yang bertumpu pada inisiatif pribadi";
        if (n === "3") return "komunikasi kreatif, media, dan penghidupan ide segar bernilai tambah";
        if (n === "4") return "pembangunan sistem operasional yang rapi, stabil, dan berdaya tahan";
        if (n === "8") return "pengelolaan aset, manajemen modal, dan kepemimpinan skala besar";
      }
    }
  }

  // Specific domain adaptation for Talenta Alami (innate talents and execution abilities)
  if (readingId === "talenta-alami") {
    if (systemId === "human-design") {
      if (lower.includes("generator")) return "daya cipta berkelanjutan yang tekun merespons dan menuntaskan karya nyata";
      if (lower.includes("projector")) return "kepekaan mengenali potensi orang lain dan memandu sistem secara efisien";
      if (lower.includes("manifestor")) return "kemampuan merintis inisiatif baru dan membuka terobosan mandiri";
      if (lower.includes("reflector")) return "kejernihan membaca atmosfer lingkungan dan menilai kelayakan sistem";
    }
    if (systemId === "numerology") {
      const numMatch = lower.match(/\b(11|22|33|[1-9])\b/);
      if (numMatch) {
        const n = numMatch[1];
        if (n === "1") return "bakat kepemimpinan orisinal dan keberanian mengambil keputusan awal";
        if (n === "3") return "daya ekspresi kreatif, komunikasi memikat, dan penghidupan suasana";
        if (n === "4") return "keterampilan menyusun sistem kerja yang rapi, tertib, dan stabil";
        if (n === "8") return "kemampuan mengelola sumber daya, otoritas, dan eksekusi bernilai besar";
        if (n === "5") return "kelincahan beradaptasi dan keberanian mengeksplorasi cakrawala baru";
      }
    }
    if (systemId === "bazi") {
      for (const [elem, meaning] of Object.entries(BAZI_ELEMENT_MAP)) {
        if (lower.includes(elem)) return `bakat alami yang membawa ${meaning}`;
      }
    }
  }

  // Specific domain adaptation for Love Block & Pola Berulang (relational armor & vulnerability fear)
  if (readingId === "love-block-pola-berulang") {
    if (systemId === "destiny-matrix" || lower.includes("arcana") || lower.includes("energi")) {
      const arcMatch = lower.match(/\b(2[0-2]|1[0-9]|[1-9])\b/);
      if (arcMatch) {
        const num = arcMatch[1];
        if (num === "6") return "tuntutan kesempurnaan pada pasangan yang menutupi ketakutan akan penolakan";
        if (num === "8") return "kesulitan melunakkan kendali karena takut dimanfaatkan atau kehilangan posisi setara";
        if (num === "12") return "kecenderungan berkorban berlebihan lalu diam-diam merasa diperlakukan tidak adil";
        if (num === "15") return "ketertarikan pada dinamika relasi yang penuh drama dan menguras emosi";
        if (num === "18") return "kecurigaan bawah sadar yang menciptakan jarak saat kedekatan menuntut kejujuran";
      }
    }
    return "benteng pertahanan otomatis yang aktif saat kedekatan terasa menuntut kerentanan";
  }

  // Specific domain adaptation for Kebutuhan Emosional Relasi (emotional sanctuary & care)
  if (readingId === "kebutuhan-emosional-relasi") {
    if (systemId === "natal-chart" && (lower.includes("moon") || lower.includes("bulan"))) {
      for (const [sign, meaning] of Object.entries(ZODIAC_SIGN_MAP)) {
        if (lower.includes(sign)) return `ruang rasa aman emosional yang membutuhkan ${meaning}`;
      }
    }
    return "ruang penerimaan hangat di mana kerapuhanmu tidak dianggap sebagai kelemahan";
  }

  // Specific domain adaptation for Warisan Keluarga & Leluhur (ancestral resilience & family patterns)
  if (readingId === "warisan-keluarga-leluhur") {
    if (systemId === "destiny-matrix" || lower.includes("arcana") || lower.includes("energi")) {
      const arcMatch = lower.match(/\b(2[0-2]|1[0-9]|[1-9])\b/);
      if (arcMatch) {
        const num = arcMatch[1];
        if (num === "7") return "daya juang keluarga yang ditempa oleh rintangan hidup masa lalu";
        if (num === "8") return "tuntutan keadilan dan hukum sebab-akibat dalam silsilah keluarga";
        if (num === "20") return "penyembuhan ikatan batin leluhur dan pembebasan beban generasi";
        if (num === "4") return "ketegasan garis keluarga dalam menjaga kehormatan dan tatanan";
        if (num === "5") return "nilai luhur dan tradisi keluarga yang diwariskan turun-temurun";
      }
    }
    if (systemId === "weton") {
      const dinoMatch = lower.match(/\b(senin|selasa|rabu|kamis|jumat|sabtu|minggu)\b/);
      const dinoStr = dinoMatch ? `hari ${dinoMatch[1]} ` : "";
      for (const [pasaran, meaning] of Object.entries(WETON_PASARAN_MAP)) {
        if (lower.includes(pasaran)) return `kearifan leluhur ${dinoStr}yang berakar pada ${meaning}`;
      }
    }
    if (systemId === "tzolkin") {
      return `kepekaan siklus batin leluhur yang selaras dengan arketipe ${sanitized.toLowerCase()}`;
    }
    if (systemId === "bazi") {
      for (const [elem, meaning] of Object.entries(BAZI_ELEMENT_MAP)) {
        if (lower.includes(elem)) return `daya tahan garis keturunan yang menyelaraskan ${meaning}`;
      }
    }
    if (systemId === "natal-chart") {
      for (const [sign, meaning] of Object.entries(ZODIAC_SIGN_MAP)) {
        if (lower.includes(sign)) return `suasana emosional silsilah keluarga yang dinaungi ${meaning}`;
      }
    }
    return "pola ketabahan dan harapan keluarga yang diwariskan lintas generasi";
  }

  if (systemId === "numerology" || /^(lifepath|expression|soulurge|birthday)/i.test(lower)) {
    const numMatch = lower.match(/\b(11|22|33|[1-9])\b/);
    if (numMatch && NUMEROLOGY_NUMBER_MAP[numMatch[1]]) {
      return NUMEROLOGY_NUMBER_MAP[numMatch[1]];
    }
  }

  for (const [sign, meaning] of Object.entries(ZODIAC_SIGN_MAP)) {
    if (lower.includes(sign)) return meaning;
  }

  if (systemId === "destiny-matrix" || lower.includes("arcana") || lower.includes("energi")) {
    const arcMatch = lower.match(/\b(2[0-2]|1[0-9]|[1-9])\b/);
    if (arcMatch && DESTINY_MATRIX_ARCANA_MAP[arcMatch[1]]) {
      return DESTINY_MATRIX_ARCANA_MAP[arcMatch[1]];
    }
  }

  for (const [elem, meaning] of Object.entries(BAZI_ELEMENT_MAP)) {
    if (lower.includes(elem)) return meaning;
  }

  for (const [pasaran, meaning] of Object.entries(WETON_PASARAN_MAP)) {
    if (lower.includes(pasaran)) return meaning;
  }

  const bareNum = lower.match(/^(11|22|33|[1-9])$/);
  if (bareNum && NUMEROLOGY_NUMBER_MAP[bareNum[1]]) {
    return NUMEROLOGY_NUMBER_MAP[bareNum[1]];
  }

  const cleanedText = lower
    .replace(/\b(tema batin utama|dari sisi pendukung|melalui strategi kejelasan batin)\b/gi, "")
    .replace(/\b(jalur rezeki|jalur relasi|ritme energi sumber daya)\b/gi, "kebijaksanaan energi")
    .replace(/\s+/g, " ")
    .trim();

  if (cleanedText.length > 5) {
    const words = cleanedText.split(/\s+/);
    return words.slice(0, 10).join(" ");
  }

  return fallback;
}

function selectReadingFacts(
  model: ArsipAkashiInsightModel,
  reading: ArsipAkashiReadingDef,
  paragraphIndex: number,
) {
  const sourceSection = model.sections.find((candidate) => candidate.sectionId === reading.roomId);
  const facts = (sourceSection?.selectedFacts ?? []).filter(
    (fact) => reading.allowedSystems.includes(fact.systemId) &&
      reading.allowedDomains.includes(fact.domain) &&
      fact.interpretationEligibility &&
      !(reading.readingId === "warisan-keluarga-leluhur" && fact.systemId === "human-design"),
  );
  const ordered = facts
    .map((fact) => ({ fact, score: symbolicHash(`${model.deterministicKey}:${reading.readingId}:${paragraphIndex}:${fact.factId}`) }))
    .sort((a, b) => a.score - b.score)
    .map(({ fact }) => fact);
  const minimum = Math.max(reading.minimumCrossSystemSupport, paragraphIndex === 4 ? 3 : 2);
  const selected: typeof ordered = [];
  const usedSystems = new Set<string>();
  for (const fact of ordered) {
    if (!usedSystems.has(fact.systemId)) {
      selected.push(fact);
      usedSystems.add(fact.systemId);
    }
    if (usedSystems.size >= minimum) break;
  }
  for (const fact of ordered) {
    if (selected.includes(fact)) continue;
    selected.push(fact);
    if (selected.length >= Math.max(5, minimum)) break;
  }
  if (selected.length) return selected;
  if (facts.length) return facts.slice(0, 5);

  const fallbackSystems = reading.readingId === "warisan-keluarga-leluhur"
    ? reading.allowedSystems.filter((sys) => sys !== "human-design")
    : reading.preferredSystems;

  return reading.allowedDomains.slice(0, 3).map((domain, index) => ({
    factId: `semantic-fallback/${reading.readingId}/${domain}/${index}`,
    systemId: (fallbackSystems[index % Math.max(1, fallbackSystems.length)] ?? "destiny-matrix") as typeof reading.allowedSystems[number],
    domain,
    value: chooseSemanticTheme(domain, `${model.deterministicKey}:${reading.readingId}:${paragraphIndex}:${domain}:${index}`),
    interpretationEligibility: true,
    sourcePath: "semantic-fallback",
    sourceVersion: "v1",
    stabilityType: "partial-data-theme" as const,
    warnings: [],
  }));
}

function semanticThemesFor(reading: ArsipAkashiReadingDef, domains: string[], paragraphIndex: number): string[] {
  return domains.slice(0, 3).map((domain) => {
    const meaning = DOMAIN_MEANINGS[domain] ?? DOMAIN_MEANINGS.growth;
    const key = paragraphIndex === 1 ? meaning.core : paragraphIndex === 2 ? meaning.daily : paragraphIndex === 3 ? meaning.strength : paragraphIndex === 4 ? meaning.shadow : meaning.integration;
    return sanitizeVisible(key.trim());
  });
}

type ReadingTemplateFn = (cueA: string, cueB: string, cueC: string, pIndex: number) => string[];

const READING_NARRATIVE_TEMPLATES: Record<string, ReadingTemplateFn> = {
  // 1. arketipe-utama
  "arketipe-utama": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Di lapis terdalam dirimu, terdapat postur hidup utama yang selalu membimbingmu kembali pada kejujuran dasar keberadaanmu.`,
        `Kompas batin ini mengemuka saat kamu dihadapkan pada pilihan penting, di mana panggilan ${cueA} menjadi penentu arah langkahmu.`,
        `Kesadaranmu merekah ketika kamu tidak lagi menyembunyikan keaslian ini demi menyenangkan ekspektasi lingkungan luar.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat berada dalam kesadaran matang, kehadiranmu memancarkan wibawa tenang yang bersumber dari ${cueB}.`,
        `Namun ketika rasa amanmu goyah, sisi bayangan dapat tersulut berupa dorongan membuktikan diri secara berlebihan atau menarik diri ke balik topeng kepalsuan.`,
        `Risiko ini semakin nyata jika kamu membiarkan keraguan batin mengaburkan kepemimpinan sejati atas hidupmu sendiri.`,
      ];
    }
    return [
      `Mematangkan arketipe ini menuntut keberanian untuk hidup selaras dengan pusat batinmu setiap hari.`,
      `Yang perlu kamu lepaskan adalah ilusi bahwa kamu harus sempurna agar layak diterima dan dihormati.`,
      `Mulailah dengan mengambil satu keputusan penting hari ini yang sepenuhnya berakar pada ${cueC}.`,
    ];
  },

  // 2. cara-berpikir-memaknai
  "cara-berpikir-memaknai": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Pikiranmu bekerja seperti penjelajah yang tidak pernah puas hanya melihat permukaan peristiwa.`,
        `Dalam menyerap pengalaman dan merangkai makna, kognisimu bertumpu pada ${cueA}.`,
        `Pemahamanmu terasa jernih saat kamu memberi jeda bagi intuisimu untuk melengkapi penalaran logis yang tersusun.`,
      ];
    }
    if (p === 2) {
      return [
        `Pada bentuk terbaiknya, kognisimu mampu melihat keterhubungan tersembunyi berkat ${cueB}.`,
        `Sebaliknya, ketika pikiranmu terlalu lelah atau terancam, kamu bisa terjebak dalam pusaran analisis berlebihan yang melumpuhkan tindakan.`,
        `Sikap kritis yang awalnya melindungi dapat berubah menjadi sinisme jika kamu membiarkan ketakutan akan ketidakpastian memimpin cara berpikirmu.`,
      ];
    }
    return [
      `Melatih kejernihan kognitif menuntut keseimbangan antara observasi yang tajam dan penerimaan yang lapang.`,
      `Lepaskan kebiasaan merumuskan kesimpulan terburu-buru sebelum fakta dan rasa memiliki ruang untuk bernapas.`,
      `Latih pikiranmu dengan menguji satu asumsi usang melalui ${cueC} secara tenang.`,
    ];
  },

  // 3. nilai-kebutuhan-batin
  "nilai-kebutuhan-batin": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Kebutuhan batinmu adalah fondasi hening yang menopang seluruh ketahanan emosionalmu.`,
        `Rasa amanmu sangat dipengaruhi oleh seberapa jauh hidupmu memberi ruang bagi ${cueA}.`,
        `Ketika kebutuhan dasar ini terpenuhi, seluruh energimu mengalir dengan tenang tanpa kecemasan yang mendesak.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat nilai-nilai intimu dihormati, kamu memancarkan stabilitas batin yang bersumber dari ${cueB}.`,
        `Tetapi jika kebutuhan ini terus-menerus kamu abaikan demi orang lain, tubuh dan emosimu akan bereaksi melalui rasa hampa atau kemarahan terpendam.`,
        `Kamu berisiko menuntut orang di sekitarmu menebak kebutuhanmu tanpa pernah menyuarakannya secara jelas dan jujur.`,
      ];
    }
    return [
      `Merawat kebutuhan batin bukanlah tindakan egois, melainkan tanggung jawab pertama kepada jiwamu.`,
      `Mulailah menghapus rasa bersalah saat kamu perlu menetapkan batas demi menjaga kewarasanmu.`,
      `Luangkan waktu untuk menegaskan kembali komitmenmu pada ${cueC} dalam pilihan-pilihan kecil hari ini.`,
    ];
  },

  // 4. cara-hadir-di-dunia
  "cara-hadir-di-dunia": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Kesan pertama dan caramu melangkah ke ruang sosial membawa getaran khas yang langsung dirasakan orang lain.`,
        `Kehadiranmu secara alami memancarkan kualitas yang berakar pada ${cueA}.`,
        `Tanpa perlu memaksakan diri tampil dominan, caramu bersikap sudah mengomunikasikan batasan dan martabatmu.`,
      ];
    }
    if (p === 2) {
      return [
        `Dalam kondisi seimbang, caramu membawa diri memudahkan orang lain merasa terhubung berkat ${cueB}.`,
        `Namun ketika rasa percaya dirimu surut, kamu mungkin tergoda membangun benteng dingin atau berusaha terlalu keras agar disukai.`,
        `Gesekan sosial mudah muncul jika caramu mengekspresikan diri berbeda jauh dari apa yang sebenarnya berkecamuk di dalam hatimu.`,
      ];
    }
    return [
      `Kehadiran yang berdaya lahir dari keselarasan total antara niat batin dan gerak lahiriahmu.`,
      `Yang perlu dilepaskan adalah kecemasan tentang bagaimana orang lain akan menilai setiap gerak-gerikmu.`,
      `Hadirlah secara utuh di setiap perjumpaan dengan menyandarkan postur hidupmu pada ${cueC}.`,
    ];
  },

  // 5. ritme-energi-alami
  "ritme-energi-alami": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Tubuh dan perhatianmu memiliki tempo biologis yang tidak bisa dipaksa mengikuti standar kecepatan orang lain.`,
        `Aliran energimu bekerja paling optimal ketika kamu bergerak selaras dengan ${cueA}.`,
        `Memahami kapan harus melaju dan kapan harus melambat adalah kunci menjaga vitalitasmu tetap menyala.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat kamu menghormati pasang surut tenaga ini, produktivitasmu memuncak melalui ${cueB}.`,
        `Sebaliknya, memaksakan diri bekerja saat baterai batinmu habis hanya akan membuahkan kelelahan kronis dan frustrasi mendalam.`,
        `Bahaya terbesar adalah mengorbankan sinyal alami tubuh demi mengejar tenggat waktu yang sebenarnya bisa dinegosiasikan.`,
      ];
    }
    return [
      `Menata hari berdasarkan kapasitas energi adalah bentuk penghormatan tertinggi pada raga yang meminjamkan daya hidupnya.`,
      `Buang kebiasaan mengukur harga dirimu semata-mata dari seberapa banyak daftar tugas yang berhasil kamu selesaikan.`,
      `Bangun ritme harian yang lebih manusiawi dengan memprioritaskan ${cueC} sebagai jangkar kestabilanmu.`,
    ];
  },

  // 6. cara-mengambil-keputusan
  "cara-mengambil-keputusan": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Pilihan hidup yang tepat bagimu tidak pernah lahir dari kebisingan argumen mental semata.`,
        `Kompas keputusanmu memiliki kecerdasan tersendiri yang beroperasi melalui ${cueA}.`,
        `Keputusan terbaikmu selalu ditandai oleh ketenangan batin yang menetap, bukan oleh ketergesaan yang didorong rasa panik.`,
      ];
    }
    if (p === 2) {
      return [
        `Ketika kamu setia pada otoritas internal ini, langkah-langkahmu mengalir dengan kepastian berkat ${cueB}.`,
        `Namun saat kamu membiarkan tekanan luar atau rasa takut ketinggalan mengambil alih kemudi, penyesalan biasanya segera menyusul.`,
        `Kamu kerap terjebak meminta pendapat terlalu banyak orang sampai suara jernih di dalam dadamu sendiri tenggelam.`,
      ];
    }
    return [
      `Mempercayai caramu memilih menuntut kesabaran untuk menunggu hingga sinyal kejelasan internal benar-benar matang.`,
      `Lepaskan dorongan terburu-buru menyimpulkan sesuatu hanya demi meredakan ketidaknyamanan sementara.`,
      `Uji setiap keputusan penting berikutnya dengan bersandar pada kebijaksanaan ${cueC}.`,
    ];
  },

  // 7. pola-respons-kehidupan
  "pola-respons-kehidupan": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Reaksi spontanmu saat menghadapi kejutan, perubahan mendadak, atau krisis memperlihatkan mekanisme pertahanan pertamamu.`,
        `Secara naluriah, caramu merespons dinamika hidup bertumpu pada ${cueA}.`,
        `Memahami respons otomatis ini membantumu beralih dari sekadar bereaksi secara impulsif menjadi merespons secara sadar.`,
      ];
    }
    if (p === 2) {
      return [
        `Dalam kondisi tenang, daya lentingmu bekerja luar biasa melalui ${cueB}.`,
        `Namun jika kamu merasa tersudut, respons pertamamu bisa berubah menjadi pertahanan kaku yang menutup pintu kompromi.`,
        `Kamu berisiko memperkeruh keadaan apabila membiarkan kecemasan sesaat mendikte kata-kata dan tindakan pertamamu.`,
      ];
    }
    return [
      `Ruang antara stimulus dan respons adalah tempat di mana kebebasan dan kedewasaanmu tumbuh.`,
      `Berhentilah membenarkan reaksi spontan yang melukai dengan dalih bahwa itulah sifat alamimu yang tidak bisa diubah.`,
      `Latihlah jeda satu napas sebelum menjawab situasi yang menantang, sembari mengingat ${cueC}.`,
    ];
  },

  // 8. fokus-produktivitas-konsistensi
  "fokus-produktivitas-konsistensi": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Kapasitas fokusmu bukan tentang memaksa otak bekerja tanpa henti, melainkan tentang menjaga kedalaman perhatian pada hal yang esensial.`,
        `Daya konsistensimu terbangun kokoh saat kamu menautkan usahamu pada ${cueA}.`,
        `Hasil karya yang bernilai tinggi selalu lahir ketika kamu mampu melindungi perhatianmu dari distraksi yang tidak bermakna.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat ritme kerjamu tertata rapi, ketekunanmu menghasilkan capaian nyata melalui ${cueB}.`,
        `Sebaliknya, menyebarkan perhatian ke terlalu banyak arah sekaligus hanya akan menguapkan potensi besarmu menjadi keletihan yang sia-sia.`,
        `Jebakan utamanya adalah merasa sibuk sepanjang hari tetapi sebenarnya sedang menghindari pekerjaan yang paling menentukan.`,
      ];
    }
    return [
      `Konsistensi jangka panjang dibangun melalui kebiasaan-kebiasaan kecil yang dapat diulang dengan mudah setiap hari.`,
      `Singkirkan ilusi bahwa kamu harus selalu terinspirasi sebelum mulai melakukan pekerjaan penting.`,
      `Ikat komitmen kerjamu pada satu proyek prioritas hari ini dengan memanfaatkan kekuatan ${cueC}.`,
    ];
  },

  // 9. cara-memulihkan-energi
  "cara-memulihkan-energi": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Pemulihan energi bukanlah kemewahan sesekali, melainkan kebutuhan mendasar agar jiwamu tidak terbakar habis oleh rutinitas.`,
        `Jiwa dan ragamu kembali pulih secara alami ketika kamu memberi ruang bagi ${cueA}.`,
        `Titik balik pemulihanmu terjadi saat kamu berani menarik diri sejenak dari tuntutan dunia tanpa membawa beban rasa bersalah.`,
      ];
    }
    if (p === 2) {
      return [
        `Dalam ruang hening yang tepat, vitalitasmu terisi kembali dengan cepat berkat ${cueB}.`,
        `Namun jika kamu mengabaikan kebutuhan istirahat ini terlalu lama, tubuhmu akan memaksakan jeda melalui kelelahan fisik atau kemurungan emosi.`,
        `Kamu kerap menipu diri sendiri dengan menganggap hiburan layar atau kesibukan pasif sebagai pemulihan sejati.`,
      ];
    }
    return [
      `Menjaga kebersihan energimu memerlukan ritual pemulihan yang sengaja dijadwalkan, bukan menunggu sisa waktu.`,
      `Lepaskan keyakinan keliru bahwa istirahat adalah tanda kelemahan atau kemalasan.`,
      `Ciptakan ruang hening yang menenangkan hari ini untuk meremajakan seluruh energimu melalui ${cueC}.`,
    ];
  },

  // 10. luka-inti
  "luka-inti": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Di sudut batin yang paling rapuh, tersimpan luka purba yang membentuk caramu melindungi diri dari rasa sakit.`,
        `Titik rentan ini kerap tersentuh ketika kamu berhadapan dengan situasi yang mengaktifkan ${cueA}.`,
        `Menyadari luka ini dengan penuh kelembutan adalah langkah awal agar ia tidak lagi diam-diam mengendalikan hidupmu dari balik layar.`,
      ];
    }
    if (p === 2) {
      return [
        `Ketika luka ini disinari kesadaran welas asih, kerapuhanmu bertransformasi menjadi empati mendalam berkat ${cueB}.`,
        `Tetapi saat rasa sakitnya terpicu tanpa kamu sadari, kamu bisa bereaksi defensif seolah-olah seluruh duniamu sedang terancam runtuh.`,
        `Pola ini membuatmu kerap menafsirkan situasi netral sebagai penolakan pribadi atau pengabaian yang disengaja.`,
      ];
    }
    return [
      `Menyembuhkan luka inti tidak berarti melenyapkan memori masa lalu, melainkan mengubah caramu memeluk rasa sakit itu hari ini.`,
      `Berhentilah menuntut orang lain untuk menjadi penawar atas rasa tidak aman yang belum kamu rawat sendiri.`,
      `Peluklah bagian dirimu yang terluka dengan kehangatan dan keteguhan yang bersumber dari ${cueC}.`,
    ];
  },

  // 11. mekanisme-perlindungan
  "mekanisme-perlindungan": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Strategi bertahan yang kamu bangun di masa lalu pernah menjadi pelindung yang menyelamatkanmu dari rasa sakit yang terlalu berat.`,
        `Armor perlindunganmu secara otomatis terpasang saat kamu merasa terancam oleh ${cueA}.`,
        `Namun perlindungan yang sama kini kerap menjadi dinding pembatas yang menghalangi pertumbuhan dan kedekatan sejati.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat mekanisme ini disadari, kamu mampu membedakan bahaya nyata dari sekadar ketakutan masa lalu melalui ${cueB}.`,
        `Di sisi lain, jika perlindungan ini dibiarkan berjalan liar, kamu akan terus menyerang atau menjauh bahkan dari orang yang berniat tulus.`,
        `Kamu berisiko menjadi sosok yang dingin dan sulit dijangkau karena terlalu takut terlihat rapuh di depan orang lain.`,
      ];
    }
    return [
      `Menurunkan perisai perlindungan menuntut keberanian untuk mempercayai bahwa dirimu yang sekarang sudah cukup kuat menghadapi kenyataan.`,
      `Lepaskan kebiasaan mencurigai setiap niat baik sebagai ancaman terselubung yang harus diwaspadai.`,
      `Latihlah keterbukaan yang sehat dengan menyandarkan rasa amanmu pada kekuatan ${cueC}.`,
    ];
  },

  // 12. pola-self-sabotage
  "pola-self-sabotage": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Tindakan menyabotase diri sendiri sering kali muncul tepat di ambang pintu pencapaian atau kebahagiaan yang lebih besar.`,
        `Pola ini bekerja saat alam bawah sadarmu mulai merasa tidak nyaman dengan ${cueA}.`,
        `Rasa takut akan ketidaktahuan atau ketakutan akan tanggung jawab baru kerap menjadi pemicu utama kamu merusak peluangmu sendiri.`,
      ];
    }
    if (p === 2) {
      return [
        `Memahami akar sabotase ini memberimu kekuatan untuk mematahkan siklus penghancuran diri melalui ${cueB}.`,
        `Namun saat kamu terlena, kamu bisa menunda pekerjaan penting, menciptakan konflik yang tidak perlu, atau tiba-tiba menyerah di tengah jalan.`,
        `Kamu cenderung membenarkan kemunduranmu dengan menciptakan berbagai alasan logis yang sebenarnya menutupi ketakutanmu sendiri.`,
      ];
    }
    return [
      `Menghentikan sabotase diri memerlukan ketegasan untuk tetap melangkah meskipun rasa cemas membisikkanmu untuk lari.`,
      `Buang kebiasaan meremehkan kapasitasmu sendiri hanya demi tetap berada di zona nyaman yang sempit.`,
      `Bertahanlah dalam pertumbuhan barumu dengan memegang teguh komitmen pada ${cueC}.`,
    ];
  },

  // 13. ketakutan-tersembunyi
  "ketakutan-tersembunyi": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Di bawah permukaan pikiran sadarmu, terdapat ketakutan mendalam yang jarang kamu akui bahkan kepada dirimu sendiri.`,
        `Kegentaran batin ini paling sering terusik saat kamu berhadapan dengan kemungkinan ${cueA}.`,
        `Menamai ketakutan ini secara jujur akan melucuti kekuatannya yang selama ini menghantui pilihan-pilihan besarmu.`,
      ];
    }
    if (p === 2) {
      return [
        `Ketika kamu berani menatap rasa takut ini dengan mata terbuka, keberanian sejatimu bangkit melalui ${cueB}.`,
        `Sebaliknya, jika kamu terus menyangkal keberadaannya, ketakutan ini akan menjelma menjadi kecemasan mengambang yang terus menguras energimu.`,
        `Kamu bisa tanpa sadar membatasi cakrawala hidupmu demi memastikan skenario terburuk yang kamu bayangkan tidak pernah terjadi.`,
      ];
    }
    return [
      `Keberanian bukanlah ketiadaan rasa takut, melainkan kesadaran bahwa ada hal yang jauh lebih berharga daripada rasa takut itu sendiri.`,
      `Lepaskan kebutuhan untuk selalu memiliki jaminan kepastian sebelum berani mengambil langkah maju.`,
      `Tataplah masa depanmu dengan keberanian baru yang berakar pada keteguhan ${cueC}.`,
    ];
  },

  // 14. warisan-keluarga-leluhur
  "warisan-keluarga-leluhur": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Aliran memori garis keturunan mengalirkan warisan batin yang melampaui apa yang sekadar tampak di kasat mata.`,
        `Kamu mengemban pola ketabahan dan harapan keluarga yang berakar kuat pada ${cueA}.`,
        `Menghormati akar asal-usulmu bukan berarti harus mengulang semua luka, pengorbanan, atau beban yang belum tuntas dari generasi terdahulu.`,
      ];
    }
    if (p === 2) {
      return [
        `Dari silsilahmu, kamu mewarisi daya tahan luar biasa dan kearifan hidup yang mengkristal melalui ${cueB}.`,
        `Namun di sisi bayangannya, beban emosional yang belum terselesaikan di masa lalu dapat terasa sebagai tuntutan loyalitas bawah sadar yang mengekang langkahmu.`,
        `Kamu berisiko memikul rasa bersalah keluarga yang sebenarnya bukan menjadi tanggung jawab pribadimu untuk menyelesaikannya.`,
      ];
    }
    return [
      `Tugas generasimu adalah memilah warisan: memetik hikmah kekuatannya dan memutus rantai kepedihan yang usang.`,
      `Berhentilah merasa bersalah ketika pilihan hidupmu berbeda dari harapan tidak realistis para pendahulumu.`,
      `Berdirilah tegak di garis waktumu dengan menghormati asal-usul sembari mengarahkan hidupmu pada ${cueC}.`,
    ];
  },

  // 15. karma-pola-berulang
  "karma-pola-berulang": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Pengulangan peristiwa dengan tokoh dan suasana yang berbeda adalah cara kehidupan menunjukkan pelajaran yang belum tuntas.`,
        `Siklus pengalaman ini berulang kali mengetuk pintu hidupmu seputar tema ${cueA}.`,
        `Menyalahkan nasib atau pihak luar tidak akan pernah menghentikan perputaran pola yang sama.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat kamu menangkap inti pelajarannya, pengulangan ini berubah menjadi lompatan kesadaran berkat ${cueB}.`,
        `Namun jika kamu tetap menutup mata, kamu akan kembali mengambil keputusan yang sama dan menuai rasa kecewa yang serupa.`,
        `Bahaya terbesarnya adalah merasa dirimu menjadi korban abadi dari takdir yang tidak berpihak kepadamu.`,
      ];
    }
    return [
      `Rantai karma terputus saat kamu memilih satu respons baru yang berbeda pada titik di mana siklus lama biasanya berulang.`,
      `Tinggalkan kebiasaan mengharapkan hasil yang berbeda jika kamu masih terus menggunakan pola lama dalam merespons keadaan.`,
      `Akhiri siklus lama ini hari ini dengan mempraktikkan kedewasaan yang bersumber dari ${cueC}.`,
    ];
  },

  // 16. arah-penyembuhan-integrasi
  "arah-penyembuhan-integrasi": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Penyembuhan batin bukanlah peristiwa sesaat, melainkan proses integrasi yang merangkul kembali setiap bagian dirimu yang terluka.`,
        `Jalur pemulihan pribadimu menuntut keberanian untuk menatap ${cueA} dengan kelembutan dan kesabaran.`,
        `Proses ini tidak menuntutmu menjadi sempurna, melainkan menjadi pribadi yang utuh, jujur, dan berdamai dengan diri sendiri.`,
      ];
    }
    if (p === 2) {
      return [
        `Seiring berjalannya proses pemulihan, pengalaman sulitmu mengkristal menjadi sumber kebijaksanaan nyata melalui ${cueB}.`,
        `Namun jalan integrasi ini bisa terhambat jika kamu memperlakukan penyembuhan sebagai proyek perbaikan diri yang tiada akhir dan penuh penghakiman.`,
        `Kamu berisiko terjebak dalam pusaran meratapi masa lalu tanpa pernah berani melangkah menjalani kehidupan nyata hari ini.`,
      ];
    }
    return [
      `Integrasi sejati terlihat dari caramu memperlakukan diri sendiri saat kamu menghadapi kekeliruan atau rasa tidak berdaya.`,
      `Maafkan dirimu atas pilihan-pilihan masa lalu yang pernah kamu ambil saat pemahamanmu belum seluas sekarang.`,
      `Rawat keutuhan jiwamu secara konsisten melalui tindakan nyata yang mencerminkan ${cueC}.`,
    ];
  },

  // 17. talenta-alami
  "talenta-alami": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Di dalam dirimu terdapat kapasitas bawaan yang mengalir begitu spontan tanpa perlu dipaksakan secara berlebihan.`,
        `Bakat alami ini paling nyata terlihat saat kamu mencurahkan perhatianmu pada ${cueA}.`,
        `Apa yang terasa begitu mudah dan alami bagimu sering kali merupakan hal yang sangat berharga dan dicari oleh orang lain.`,
      ];
    }
    if (p === 2) {
      return [
        `Ketika talenta ini diasah dengan disiplin teratur, karyamu memancarkan keunggulan unik melalui ${cueB}.`,
        `Namun jika kamu mengabaikannya atau menganggapnya remeh, potensi besar ini hanya akan menjadi angan-angan yang tidak membuahkan hasil nyata.`,
        `Kamu kerap merasa tidak puas dan membandingkan diri dengan kelebihan orang lain sambil membiarkan bakatmu sendiri terbengkalai.`,
      ];
    }
    return [
      `Menghormati talenta alami menuntut dedikasi untuk melatihnya menjadi keterampilan profesional yang tahan uji.`,
      `Buang keraguan bahwa apa yang kamu miliki tidak cukup bernilai untuk dibagikan kepada dunia luar.`,
      `Berikan ruang latihan harian yang konsisten untuk memperdalam bakatmu melalui ${cueC}.`,
    ];
  },

  // 18. gaya-kerja
  "gaya-kerja": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Ekosistem kerjamu memiliki pola dan dinamika tersendiri agar energimu tidak terbuang sia-sia pada gesekan operasional.`,
        `Kamu mencapai efektivitas tertinggi saat metode kerjamu berpijak pada ${cueA}.`,
        `Memahami gaya kerjamu membantumu membangun batas profesional yang sehat di tengah tuntutan lingkungan yang serba cepat.`,
      ];
    }
    if (p === 2) {
      return [
        `Dalam lingkungan kerja yang selaras, daya ciptamu berkembang pesat dan memberi kontribusi maksimal melalui ${cueB}.`,
        `Sebaliknya, memaksakan diri bekerja dalam sistem yang bertentangan dengan kapasitasmu akan membuat energimu cepat terkuras.`,
        `Kamu berisiko mengalami kebuntuan karya jika terus membiarkan caramu bekerja didikte oleh metode orang lain yang tidak cocok untukmu.`,
      ];
    }
    return [
      `Menata metode kerja adalah investasi jangka panjang untuk menjaga keberlanjutan hasil karya dan kesehatan mentalmu.`,
      `Lepaskan kebiasaan meniru gaya orang lain secara kaku tanpa menguji kecocokannya dengan ritme energimu.`,
      `Sesuaikan alur kerjamu hari ini agar lebih selaras dengan prinsip ${cueC}.`,
    ];
  },

  // 19. arah-karya-kontribusi
  "arah-karya-kontribusi": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Karyamu bukan sekadar sarana mencari nafkah, melainkan wadah untuk meninggalkan jejak makna yang melampaui kepentingan diri sendiri.`,
        `Panggilan kontribusimu bergerak paling kuat saat kamu menyelaraskan karya dengan ${cueA}.`,
        `Kepuasan terdalammu selalu lahir ketika apa yang kamu kerjakan mampu meringankan beban atau mencerahkan jalan orang lain.`,
      ];
    }
    if (p === 2) {
      return [
        `Pada puncaknya, kontribusimu menjadi jembatan perubahan nyata bagi komunitas sekitarmu berkat ${cueB}.`,
        `Namun ketika kamu kehilangan kontak dengan makna karya, aktivitas profesionalmu bisa terasa hampa dan mekanis layaknya rutinitas tanpa jiwa.`,
        `Kamu berisiko terjebak mengejar status atau pengakuan luar yang gemerlap tetapi mengorbankan integritas batinmu.`,
      ];
    }
    return [
      `Menemukan arah karya menuntut keberanian untuk menempatkan nilai kemanusiaan di atas sekadar keuntungan sesaat.`,
      `Singkirkan ketakutan bahwa kontribusimu terlalu kecil untuk bisa membawa dampak positif bagi kehidupan.`,
      `Mulailah menenun karyamu ke dalam tindakan nyata yang berlandaskan pada ${cueC}.`,
    ];
  },

  // 20. ekonomi-pola-penghasilan
  "ekonomi-pola-penghasilan": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Hubunganmu dengan uang dan sumber daya materi mencerminkan bagaimana kamu menghargai energi dan waktu yang kamu curahkan.`,
        `Pola penghasilan yang sehat dan berkelanjutan bagimu bertumpu pada kemampuan mengalirkan ${cueA}.`,
        `Kelimpahan ekonomi merekah saat pertukaran nilai yang kamu bangun berjalan di atas fondasi kejujuran dan saling menguntungkan.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat sistem finansialmu tertata dengan bijak, stabilitas materimu tumbuh menguat melalui ${cueB}.`,
        `Sebaliknya, ketidakjelasan batas finansial atau manajemen yang ceroboh dapat membuat arus rezekimu tersendat dan menimbulkan kecemasan terus-menerus.`,
        `Kamu berisiko menolak kelimpahan yang pantas kamu terima karena diam-diam merasa tidak layak menikmati hasil kerja kerasmu.`,
      ];
    }
    return [
      `Membangun kemandirian ekonomi menuntut perpaduan antara keterampilan praktis mengelola angka dan ketenangan mental menghadapi risiko.`,
      `Berhentilah membiarkan keputusan keuanganmu diambil berdasarkan rasa panik atau gengsi sesaat.`,
      `Bangun fondasi penghasilan yang kokoh dan transparan dengan memprioritaskan ${cueC}.`,
    ];
  },

  // 21. money-block
  "money-block": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Hambatan batin seputar uang berakar pada kecemasan purba tentang rasa aman, harga diri, dan ketakutan akan kekurangan.`,
        `Pola penolakan atau kecemasan materi ini biasanya langsung aktif saat kamu berhadapan dengan ${cueA}.`,
        `Uang kerap kamu jadikan cermin dari rasa tidak berharga atau alat untuk mengontrol keadaan saat rasa amanmu terguncang.`,
      ];
    }
    if (p === 2) {
      return [
        `Ketika hambatan psikologis ini terurai, energimu untuk menerima dan mengelola rezeki terbuka lebar berkat ${cueB}.`,
        `Namun saat hambatan ini menguasaimu, kamu bisa bersikap terlalu kikir menimbun kendali atau sebaliknya menghamburkan uang demi pelarian sesaat.`,
        `Kamu kerap menunda melihat kenyataan finansial, enggan mencatat pengeluaran, atau takut menetapkan harga yang pantas atas keahlianmu.`,
      ];
    }
    return [
      `Menyembuhkan hubungan dengan uang menuntut keberanian untuk berdamai dengan rasa cukup dan melihat uang sebagai sarana pertukaran netral.`,
      `Lepaskan keyakinan bahwa hidup kekurangan adalah tanda kerendahan hati atau bahwa memiliki materi otomatis merusak ketulusan batin.`,
      `Latihlah ketenangan finansialmu dengan mengambil satu langkah pengelolaan yang tertib berdasarkan ${cueC}.`,
    ];
  },

  // 22. arah-karier-bidang-sesuai
  "arah-karier-bidang-sesuai": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Jalur profesi yang tepat bagimu mempertemukan kebutuhan nyata lingkungan dengan kedalaman potensi terbaikmu.`,
        `Bidang karier yang paling menjanjikan pertumbuhan bagimu berputar di sekitar ${cueA}.`,
        `Keberhasilan profesionalmu tidak ditentukan oleh seberapa bergengsi posisinya, melainkan seberapa besar ruang yang tersedia bagi autentisitasmu.`,
      ];
    }
    if (p === 2) {
      return [
        `Di panggung karier yang tepat, kepemimpinan dan dedikasimu terlihat nyata melalui ${cueB}.`,
        `Tetapi jika kamu bertahan di bidang yang mematikan semangatmu hanya demi rasa aman semu, energimu akan terkuras dalam kehampaan.`,
        `Kamu berisiko terjebak dalam perangkap kenyamanan status quo yang menghalangi panggilan untuk melangkah ke tingkat berikutnya.`,
      ];
    }
    return [
      `Menemukan jalur karier yang selaras memerlukan keberanian untuk menguji potensi melalui langkah-langkah nyata yang terukur.`,
      `Jangan menunggu semua keraguan hilang sebelum berani mengambil inisiatif strategis dalam pekerjaanmu.`,
      `Ujilah kecocokan profesionalmu dengan mengarahkan fokus energimu pada bidang ${cueC}.`,
    ];
  },

  // 23. kemampuan-sudah-dimiliki
  "kemampuan-sudah-dimiliki": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Keterampilan yang telah kamu kuasai lewat tempaan pengalaman hidup adalah aset nyata yang sudah terbukti keandalannya.`,
        `Fondasi kompetensimu yang paling solid saat ini berakar pada penguasaan ${cueA}.`,
        `Kamu sering kali meremehkan keahlian ini hanya karena kamu telah begitu terbiasa melakukannya tanpa kesulitan berarti.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat kemampuan ini kamu gunakan secara terarah, kamu mampu menyelesaikan masalah rumit dengan tenang melalui ${cueB}.`,
        `Namun jika kamu terlalu cepat berpuas diri dan berhenti mengasahnya, keahlian yang pernah kamu banggakan bisa kehilangan ketajamannya.`,
        `Bahaya lainnya adalah mengunci dirimu pada satu peran masa lalu sehingga menutup peluang mengembangkan keahlian baru yang dibutuhkan.`,
      ];
    }
    return [
      `Menghargai kemampuan yang sudah ada memberimu landasan percaya diri yang kokoh untuk menapaki tantangan baru.`,
      `Buang sindrom merasa tidak mampu saat kenyataan membuktikan kamu telah berulang kali berhasil melewatinya.`,
      `Optimalkan daya guna keterampilan utamamu hari ini dengan menyelaraskannya pada ${cueC}.`,
    ];
  },

  // 24. kemampuan-perlu-dipelajari
  "kemampuan-perlu-dipelajari": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Pertumbuhan jiwamu selalu menuntut perluasan kapasitas melalui pembelajaran keterampilan baru yang menantang zona nyamanmu.`,
        `Celah pembelajaran yang paling mendesak untuk kamu jembatani saat ini berkaitan erat dengan ${cueA}.`,
        `Ketidaktahuan bukanlah aib, melainkan undangan terbuka dari kehidupan untuk memperluas ruang gerakmu.`,
      ];
    }
    if (p === 2) {
      return [
        `Kesediaanmu menjadi pemula kembali akan membuka cakrawala peluang baru yang luar biasa berkat ${cueB}.`,
        `Namun jika rasa gengsi atau takut terlihat canggung menghalangimu belajar, kamu akan tertahan dalam metode lama yang tidak lagi efektif.`,
        `Kamu kerap menunda proses belajar dengan alasan tidak memiliki cukup waktu atau merasa sudah terlambat untuk memulai.`,
      ];
    }
    return [
      `Menjadi pembelajar seumur hidup menuntut kerendahan hati untuk menerima proses latihan bertahap tanpa kehilangan semangat.`,
      `Singkirkan ekspektasi bahwa kamu harus langsung mahir tanpa melewati fase adaptasi awal.`,
      `Pilihlah satu fokus pembelajaran kecil hari ini dan tekuni dengan sungguh-sungguh melalui panduan ${cueC}.`,
    ];
  },

  // 25. kebutuhan-emosional-relasi
  "kebutuhan-emosional-relasi": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Kehangatan dan keterikatan emosional dalam hubungan menuntut ruang yang aman agar kerapuhanmu dapat diterima tanpa syarat.`,
        `Rasa tenang dan terpenuhimu dalam relasi bertumpu pada adanya ruang bagi ${cueA}.`,
        `Ketika kebutuhan emosional ini diakui, hubunganmu menjadi pelabuhan teduh tempat jiwamu beristirahat dan bertumbuh bersama.`,
      ];
    }
    if (p === 2) {
      return [
        `Dalam relasi yang sehat, keterbukaan hatimu menghadirkan kedekatan yang mendalam melalui ${cueB}.`,
        `Namun ketika kebutuhan ini diabaikan, rasa sepi di tengah kebersamaan dapat memicu kecemasan atau ledakan emosi yang membingungkan pasanganmu.`,
        `Kamu berisiko menuntut pasanganmu memenuhi seluruh dahaga batinmu seolah-olah ia adalah satu-satunya penjamin kebahagiaanmu.`,
      ];
    }
    return [
      `Menyampaikan kebutuhan emosional secara jelas dan tanpa tuntutan adalah bentuk kedewasaan cinta yang menyejukkan.`,
      `Berhentilah berharap pasanganmu mampu membaca pikiranmu jika kamu sendiri enggan membuka suaramu secara jujur.`,
      `Rawatlah keintiman hubunganmu dengan mengomunikasikan harapanmu secara lembut melalui ${cueC}.`,
    ];
  },

  // 26. memberi-menerima-cinta
  "memberi-menerima-cinta": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Arus cinta dalam hidupmu bekerja layaknya siklus tarikan dan hembusan napas yang harus seimbang agar tidak menyesakkan dada.`,
        `Caramu mencurahkan kasih sayang dan kepedulian secara alami mengalir melalui ${cueA}.`,
        `Menjaga keseimbangan antara memberi dan menerima adalah seni batin yang melindungi hubunganmu dari rasa lelah dan kekecewaan terpendam.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat pertukaran kasih ini mengalir dua arah, kebahagiaan yang kamu rasakan berlipat ganda berkat ${cueB}.`,
        `Namun jika kamu hanya terbiasa memberi tanpa pernah mengizinkan dirimu menerima, kamu akan perlahan merasa kering dan dimanfaatkan.`,
        `Di sisi lain, menuntut perhatian terus-menerus tanpa mau memahami beban pasangan akan meracuni kehangatan yang sudah dibangun.`,
      ];
    }
    return [
      `Menerima cinta dengan tangan terbuka menuntut keberanian untuk merasa layak dicintai tanpa harus terus-menerus membuktikan jasamu.`,
      `Lepaskan kebiasaan menolak pertolongan atau pujian yang tulus dari orang-orang yang mengasihimu.`,
      `Buka hatimu untuk menerima limpahan kasih hari ini sembari membumikan cintamu pada ${cueC}.`,
    ];
  },

  // 27. pola-ketertarikan-pasangan
  "pola-ketertarikan-pasangan": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Magnet ketertarikan romantis yang kamu rasakan sering kali digerakkan oleh memori bawah sadar yang mencari penyelesaian atas luka lama.`,
        `Kamu secara alami tertarik pada figur yang membangkitkan dinamika seputar ${cueA}.`,
        `Membedakan antara ketertarikan kimiawi sesaat dan kecocokan sejati yang menenangkan adalah tonggak kedewasaan asmaramu.`,
      ];
    }
    if (p === 2) {
      return [
        `Ketika kamu memilih pasangan dari kesadaran yang matang, relasimu menjadi wadah pertumbuhan bersama berkat ${cueB}.`,
        `Namun jika kamu terpikat semata-mata oleh sensasi kepedihan yang terasa akrab, kamu hanya akan mengulang siklus masa lalu.`,
        `Kamu kerap salah mengartikan kecemasan dan ketidakpastian sebagai tanda cinta yang mendalam dan penuh gairah.`,
      ];
    }
    return [
      `Memilih pasangan hidup yang tepat adalah keputusan sadar yang melibatkan kearifan akal sehat dan kejernihan batin.`,
      `Lepaskan ilusi tentang sosok penyelamat sempurna yang akan menyelesaikan seluruh masalah emosionalmu.`,
      `Evaluasilah kualitas hubunganmu dengan melihat apakah ia membawa kedamaian nyata yang berakar pada ${cueC}.`,
    ];
  },

  // 28. konflik-komunikasi-batas
  "konflik-komunikasi-batas": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Perbedaan pandangan dalam hubungan bukanlah tanda akhir dari cinta, melainkan ruang untuk memperdalam saling pengertian dan batas diri.`,
        `Gaya komunikasimu saat menghadapi ketegangan sangat dipengaruhi oleh caramu menjaga ${cueA}.`,
        `Keberanian menetapkan batas yang tegas namun penuh kelembutan adalah pelindung terbaik dari keutuhan hubungan jangka panjang.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat konflik dihadapi dengan kepala dingin, percakapan yang jujur justru mempererat ikatan cinta berkat ${cueB}.`,
        `Tetapi ketika sikap defensif mengambil alih, kata-katamu bisa berubah menjadi senjata tajam yang meninggalkan luka mendalam bagi pasangan.`,
        `Sikap mendiamkan masalah atau lari dari percakapan penting hanya akan menimbun bara yang sewaktu-waktu bisa meledak.`,
      ];
    }
    return [
      `Menjaga batas yang sehat menuntut keberanian untuk berkata tidak tanpa merasa bersalah atau takut kehilangan cinta.`,
      `Tinggalkan kebiasaan menyindir atau menyerang karakter pasangan saat yang kamu butuhkan sebenarnya hanyalah kejelasan kesepakatan.`,
      `Sampaikan batasan pribadimu dengan bahasa yang tenang, terukur, dan bersandar pada prinsip ${cueC}.`,
    ];
  },

  // 29. love-block-pola-berulang
  "love-block-pola-berulang": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Hambatan cinta berakar pada rasa takut mendalam akan penolakan, pengkhianatan, atau kehilangan kemerdekaan diri saat menjalin kedekatan.`,
        `Benteng pertahanan batinmu langsung menutup rapat saat hubungan mulai menuntut keterbukaan tentang ${cueA}.`,
        `Pola ini membuatmu kerap menarik diri tepat ketika hubungan mulai mengarah pada komitmen yang lebih serius dan nyata.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat kamu berani menurunkan pertahanan ini, kamu menemukan bahwa keintiman sejati tidak merusak dirimu melalui ${cueB}.`,
        `Sebaliknya, jika hambatan ini dibiarkan memimpin, kamu akan terus mencari-cari kekurangan pasangan sebagai dalih untuk mundur.`,
        `Kamu berisiko terjebak dalam hubungan yang menggantung atau tanpa sadar memilih pasangan yang emosionalnya tidak tersedia.`,
      ];
    }
    return [
      `Meruntuhkan hambatan cinta menuntut keberanian untuk menerima ketidaknyamanan dari rasa rentan di hadapan orang lain.`,
      `Buang keyakinan beracun bahwa setiap orang yang mendekat pada akhirnya pasti akan melukai atau mengecewakanmu.`,
      `Ambillah langkah untuk membuka hati dengan penuh kesadaran hari ini melalui kebijaksanaan ${cueC}.`,
    ];
  },

  // 30. arah-relasi-matang
  "arah-relasi-matang": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Hubungan yang matang adalah persekutuan dua individu yang utuh, yang memilih berjalan berdampingan tanpa saling meniadakan kemandirian.`,
        `Visi kedewasaan relasimu berkembang paling indah saat kemitraanmu dilandasi oleh ${cueA}.`,
        `Cinta sejati tidak pernah mengekang atau menuntut pengorbanan jati diri, melainkan memelihara ruang bagi masing-masing pihak untuk mekar.`,
      ];
    }
    if (p === 2) {
      return [
        `Dalam kemitraan yang dewasa, keharmonisan dan dukungan timbal balik terwujud secara nyata melalui ${cueB}.`,
        `Namun jika relasi berubah menjadi arena perebutan kendali atau ketergantungan semata, kehangatan cinta akan perlahan memudar.`,
        `Kamu berisiko mempertahankan hubungan yang sudah tidak sehat hanya karena takut menghadapi kesendirian.`,
      ];
    }
    return [
      `Membangun hubungan yang dewasa menuntut komitmen sehari-hari untuk merawat rasa hormat, kejujuran, dan ruang bertumbuh bagi pasangan.`,
      `Berhentilah memproyeksikan ekspektasi yang tidak realistis pada pundak pasanganmu.`,
      `Bangunlah kesepakatan relasi yang saling menguatkan dengan menyandarkan arah hubungan pada ${cueC}.`,
    ];
  },

  // 31. peta-chakra
  "peta-chakra": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Tubuh fisikmu adalah cermin hidup yang memetakan aliran energi batin dan respon psikologis terhadap dunia sekitarmu.`,
        `Pusat-pusat energimu berdenyut paling selaras ketika kamu menjaga keseimbangan ${cueA}.`,
        `Sinyal ketegangan atau keterbukaan di titik tubuh tertentu memberi petunjuk akurat tentang apa yang sedang berkecamuk di dalam batinmu.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat aliran energimu lancar dan tidak terhambat, vitalitas tubuhmu terasa ringan dan bertenaga melalui ${cueB}.`,
        `Namun ketika tekanan atau emosi terpendam menumpuk, cakra tertentu bisa mengalami hambatan yang memicu rasa lelah atau ketegangan fisik.`,
        `Kamu kerap mengabaikan sinyal awal dari tubuh ini sampai akhirnya tubuh memaksamu berhenti melalui rasa lelah yang mendalam.`,
      ];
    }
    return [
      `Menjaga keselarasan cakra adalah praktik mendengarkan tubuh dengan penuh perhatian tanpa perlu merasa panik atas sensasi yang muncul.`,
      `Luangkan waktu untuk bernapas dalam dan menyadari kembali kehadiran fisikmu di saat ini.`,
      `Salurkan ketenangan ke seluruh pusat energimu hari ini dengan menyelaraskan niat pada ${cueC}.`,
    ];
  },

  // 32. sistem-cerna
  "sistem-cerna": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Caramu mengolah makanan dan menyerap nutrisi fisik berjalan beriringan dengan caramu mencerna pengalaman dan tekanan hidup.`,
        `Keseimbangan pencernaanmu sangat peka terhadap suasana emosi yang berkaitan dengan ${cueA}.`,
        `Perutmu adalah pusat kepekaan yang langsung bereaksi tegang saat kamu memaksakan diri menerima situasi yang belum mampu kamu cerna secara sehat.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat pencernaanmu tenang, energimu terserap optimal untuk menopang seluruh aktivitas harian melalui ${cueB}.`,
        `Namun jika kamu makan dalam kondisi cemas atau memikul beban pikiran berlebih, tubuhmu akan merespons melalui ketidaknyamanan lambung.`,
        `Kamu kerap memakai makanan sebagai pelarian emosional untuk meredakan kegelisahan batin yang belum selesai.`,
      ];
    }
    return [
      `Merawat sistem cerna menuntut kebiasaan makan yang sadar dan suasana tenang saat menyantap hidangan sehari-hari.`,
      `Hindari memasukkan informasi yang memicu stres atau percakapan berat ke dalam momen makanmu.`,
      `Berikan jeda istirahat yang cukup bagi pencernaanmu hari ini sembari memelihara ritme ${cueC}.`,
    ];
  },

  // 33. lingkungan-ideal
  "lingkungan-ideal": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Ruang fisik di sekitarmu, tata letak, pencahayaan, dan tingkat ketenangan memiliki pengaruh langsung pada sistem sarafmu.`,
        `Kebutuhan spasialmu paling terpenuhi ketika lingkungan tempat tinggal dan kerjamu mendukung ${cueA}.`,
        `Tempat yang selaras akan mengundang inspirasi dan kejernihan pikiran, sementara ruang yang kacau akan menguras energimu secara perlahan.`,
      ];
    }
    if (p === 2) {
      return [
        `Dalam atmosfer lingkungan yang tepat, fokus dan pemulihanmu berlangsung dengan sangat mudah melalui ${cueB}.`,
        `Sebaliknya, bertahan di lingkungan yang terlalu bising, sesak, atau berenergi berat akan membuat tubuhmu terus berada dalam mode waspada tinggi.`,
        `Kamu berisiko merasa buntu dan tertekan hanya karena kamu enggan menata ulang ruang hidupmu sendiri.`,
      ];
    }
    return [
      `Menciptakan ruang ideal tidak harus menunggu tempat baru yang sempurna, melainkan menata satu sudut yang tenang bagi dirimu.`,
      `Singkirkan barang-barang yang tidak lagi kamu perlukan yang hanya menyumbat pandangan dan ketenanganmu.`,
      `Ciptakan atmosfer ruang yang mendukung kedamaian batinmu hari ini dengan mengacu pada ${cueC}.`,
    ];
  },

  // 34. ritme-tubuh
  "ritme-tubuh": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Jam biologis tubuhmu memiliki kearifan alami yang mengatur siklus terjaga, beraktivitas, dan beristirahat dalam ritme yang harmonis.`,
        `Keselarasan sirkadianmu menuntut kesetiaan untuk menjaga ${cueA}.`,
        `Menghargai pasang surut tenaga membuat energimu stabil sepanjang hari tanpa perlu bergantung pada stimulan berlebihan.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat kamu hidup selaras dengan ritme tubuh ini, kualitas istirahatmu memulihkan vitalitas secara mendalam melalui ${cueB}.`,
        `Namun jika kamu terus-menerus memotong jam tidur atau mengacaukan jadwal biologismu, keletihan fisik dan kabut pikiran akan segera datang.`,
        `Kamu kerap menuntut tubuhmu bekerja keras melebihi kapasitasnya lalu merasa heran mengapa energimu begitu cepat merosot.`,
      ];
    }
    return [
      `Memulihkan ritme biologis memerlukan disiplin lembut untuk beristirahat dan bangun pada jam yang konsisten.`,
      `Kurangi paparan layar dan stimulasi pikiran yang berlebihan menjelang waktu tidur malammu.`,
      `Kembalikan keharmonisan jam tubuhmu dengan merawat kebiasaan sehat yang berlandaskan pada ${cueC}.`,
    ];
  },

  // 35. energi-dominan
  "energi-dominan": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Di antara berbagai lapisan potensimu, terdapat frekuensi dominan yang mewarnai caramu memengaruhi suasana di sekitarmu.`,
        `Getaran utama yang kamu pancarkan ke dunia luar berakar pada ${cueA}.`,
        `Kualitas energi ini membuat orang lain merasa tenang, terinspirasi, atau tergerak saat berada di dekatmu.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat energi dominan ini berada dalam kepenuhan yang murni, pengaruh kehadiranmu mengalir alami melalui ${cueB}.`,
        `Tetapi ketika energimu terselubung oleh kelelahan atau kekhawatiran, pancaran yang keluar justru bisa terasa menuntut atau menjauhkan sekitar.`,
        `Kamu berisiko memaksakan suasana hatimu mendominasi ruang tanpa memberi kesempatan bagi orang lain untuk mengekspresikan diri.`,
      ];
    }
    return [
      `Menjaga kemurnian energi dominan menuntut kejernihan batin dan kebiasaan melepaskan ketegangan secara rutin.`,
      `Jangan biarkan energimu habis terkuras untuk memikul emosi orang lain yang bukan menjadi tanggung jawabmu.`,
      `Pancarkan frekuensi terbaikmu ke dunia hari ini dengan menyelaraskan pusat kesadaranmu pada ${cueC}.`,
    ];
  },

  // 36. jalur-spiritual
  "jalur-spiritual": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Perjalanan spiritualitasmu bukanlah tentang melarikan diri dari kenyataan duniawi, melainkan menemukan makna sakral di dalam hal-hal yang membumi.`,
        `Pintu gerbang pencarian batinmu terbuka paling lebar saat kamu merenungi ${cueA}.`,
        `Hubunganmu dengan Yang Maha Mengatur terbangun melalui kejujuran hati nurani, bukan sekadar ketaatan formalitas lahiriah semata.`,
      ];
    }
    if (p === 2) {
      return [
        `Dalam keheningan yang tulus, kedamaian spiritualmu menuntun setiap pilihan hidup berkat ${cueB}.`,
        `Namun ketika spiritualitas dipakai sebagai tameng untuk menghindari tanggung jawab emosional atau masalah nyata, kamu akan terjebak dalam pelarian batin.`,
        `Bahaya lainnya adalah merasa diri lebih sadar atau lebih bijak dibandingkan orang lain yang menempuh jalan berbeda.`,
      ];
    }
    return [
      `Spiritualitas yang sejati selalu membuahkan kerendahan hati, kasih sayang nyata, dan ketenangan menghadapi pasang surut hidup.`,
      `Lepaskan kebutuhan untuk memperdebatkan kebenaran keyakinanmu dengan orang lain.`,
      `Hidupkan pemahaman batinmu menjadi tindakan welas asih sehari-hari yang bersumber dari ${cueC}.`,
    ];
  },

  // 37. evolusi-jiwa
  "evolusi-jiwa": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Jiwamu berproses di dunia ini untuk mematangkan kesadaran dan memperluas kapasitas kasihnya melalui pengalaman nyata.`,
        `Arah evolusi batinmu saat ini sedang dipanggil untuk melampaui ${cueA}.`,
        `Setiap rintangan, perjumpaan, dan peralihan fase hidup adalah sarana yang dirancang untuk mendewasakan jiwamu.`,
      ];
    }
    if (p === 2) {
      return [
        `Ketika kamu menyambut perubahan hidup sebagai bahan pembelajaran, jiwamu bertumbuh dengan keteguhan mendalam melalui ${cueB}.`,
        `Tetapi jika kamu menolak bertumbuh dan terus mencengkeram pola lama yang sempit, hidup akan menghadirkan krisis yang lebih nyata untuk membangunkanmu.`,
        `Kamu berisiko merasa jalanmu buntu hanya karena kamu enggan melepaskan kebiasaan masa lalu yang sudah tidak lagi relevan.`,
      ];
    }
    return [
      `Menyelaraskan diri dengan evolusi jiwa menuntut kerelaan untuk terus belajar dan dibentuk oleh kearifan hidup.`,
      `Berhentilah membandingkan garis waktu perkembanganmu dengan standar keberhasilan orang lain yang semu.`,
      `Sambutlah fase kedewasaan barumu hari ini dengan mempercayakan langkahmu pada bimbingan ${cueC}.`,
    ];
  },

  // 38. potensi-spiritual
  "potensi-spiritual": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Di dalam kedalaman batinmu terpendam benih kemampuan spiritual yang siap merekah melalui latihan batin yang tekun.`,
        `Potensi batin ini paling mudah terakses saat kamu menenangkan gejolak pikiran dan menyelaraskan diri dengan ${cueA}.`,
        `Kamu memiliki kepekaan untuk merasakan dinamika halus kehidupan yang kerap terlewatkan oleh pengamatan biasa.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat potensi ini diarahkan untuk ketenangan dan kebaikan bersama, berkah batinmu mengalir jernih melalui ${cueB}.`,
        `Sebaliknya, jika potensi ini kamu gunakan demi memuaskan rasa penasaran ego semata, energimu akan menjadi tidak stabil.`,
        `Kamu berisiko tersesat dalam kebingungan batin jika kepekaan halusmu tidak diimbangi oleh pijakan realitas hidup yang kokoh.`,
      ];
    }
    return [
      `Mengembangkan potensi batin menuntut disiplin menjaga kemurnian niat dan keseimbangan hidup sehari-hari.`,
      `Jangan tergesa-gesa mengejar pengalaman batin luar biasa jika fondasi karakter dan etika harianmu belum kokoh.`,
      `Asahlah potensi batinmu secara etis dan membumi dengan menambatkannya pada ${cueC}.`,
    ];
  },

  // 39. bakat-spiritual
  "bakat-spiritual": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Bakat spiritual yang kamu miliki adalah amanah khusus yang dianugerahkan untuk melayani kebaikan dalam kehidupan bersama.`,
        `Kapasitas batin ini beroperasi secara presisi melalui ${cueA}.`,
        `Bakat ini bukan alasan untuk merasa lebih istimewa dari sesama, melainkan tanggung jawab yang harus diemban dengan kerendahan hati.`,
      ];
    }
    if (p === 2) {
      return [
        `Ketika bakat ini kamu baktikan bagi ketenangan dan pencerahan sesama, terang batinmu menyala hangat berkat ${cueB}.`,
        `Namun ketika rasa bangga diri atau ketakutan akan penilaian orang menyusup masuk, kejernihan bakatmu bisa menjadi terganggu.`,
        `Kamu kerap merasa ragu pada intuisimu sendiri atau sebaliknya terlalu mengagungkannya tanpa melakukan pengujian akal sehat.`,
      ];
    }
    return [
      `Merawat bakat spiritual memerlukan perlindungan energi yang sehat agar kamu tidak menyerap beban emosi orang lain tanpa batas.`,
      `Buang kekhawatiran bahwa menggunakan bakat ini akan membuatmu dihakimi oleh lingkunganmu.`,
      `Latihlah bakat batinmu dengan ketenangan, kebijaksanaan, dan kepedulian yang berakar pada ${cueC}.`,
    ];
  },

  // 40. jejak-intuisi
  "jejak-intuisi": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Suara intuisimu berbicara bukan melalui seruan yang bising, melainkan melalui isyarat halus tubuh dan firasat jernih yang hadir spontan.`,
        `Jejak petunjuk batinmu paling sering menampakkan diri seputar hal yang berkaitan dengan ${cueA}.`,
        `Belajar membedakan antara kecemasan emosional yang terburu-buru dan intuisi sejati yang hening adalah kunci navigasi hidupmu.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat kamu mempercayai dan menindaklanjuti isyarat intuisi ini, langkah-langkahmu terhindar dari kekeliruan berkat ${cueB}.`,
        `Namun jika kamu terus mengabaikannya dan selalu menuntut bukti logika instan atas segala hal, kepekaan batinmu akan perlahan tumpul.`,
        `Kamu kerap menyesal di kemudian hari saat menyadari bahwa firasat pertamamu sebenarnya sudah menunjukkan jalan yang benar.`,
      ];
    }
    return [
      `Mengasah kepekaan intuisi menuntut ruang hening harian yang bebas dari intervensi opini orang lain.`,
      `Berhentilah meragukan sinyal tubuhmu saat ia memberi peringatan atau keterbukaan pada suatu pilihan.`,
      `Catatlah isyarat intuisi yang kamu terima hari ini dan buktikan kebenarannya melalui ${cueC}.`,
    ];
  },

  // 41. potensi-channeling
  "potensi-channeling": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Jiwamu memiliki keterbukaan alami untuk menjadi saluran bagi mengalirnya inspirasi kreatif dan pesan kebijaksanaan yang jernih.`,
        `Kanal penerimaan batinmu beroperasi paling hening saat energimu selaras dengan ${cueA}.`,
        `Menjadi saluran yang bersih menuntut kejernihan pikiran dan kemurnian hati agar wawasan yang mengalir tidak terdistorsi oleh ego pribadi.`,
      ];
    }
    if (p === 2) {
      return [
        `Dalam kondisi keselarasan batin, inspirasi yang kamu sampaikan mampu menyentuh hati dan membuka pemahaman orang lain melalui ${cueB}.`,
        `Namun jika energimu sedang lelah atau didorong oleh keinginan mencari pengakuan, apa yang kamu alirkan bisa menjadi kabur dan tidak berakar.`,
        `Bahaya terbesarnya adalah merasa dirimu menjadi pemilik dari kebijaksanaan yang sebenarnya hanya sekadar melintas lewat dirimu.`,
      ];
    }
    return [
      `Menjaga kebersihan kanal batin menuntut tubuh yang bugar, pikiran yang tertata, dan keteguhan berpijak pada kenyataan hidup.`,
      `Lepaskan keinginan untuk tampil sebagai sosok istimewa di hadapan orang lain.`,
      `Wujudkan wawasan batin yang kamu terima menjadi karya nyata yang bermanfaat dengan berpedoman pada ${cueC}.`,
    ];
  },

  // 42. soul-mission
  "soul-mission": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Misi jiwamu bukanlah sekadar pencapaian materi yang fana, melainkan arah kontribusi batin yang ingin kamu hadirkan bagi kehidupan.`,
        `Panggilan jiwamu berdenyut paling kuat ketika kamu mendedikasikan hidupmu bagi ${cueA}.`,
        `Misi ini mengajakmu melampaui kenyamanan pribadi demi melayani tujuan yang lebih bermakna dan berakar kuat.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat kamu melangkah selaras dengan misi ini, jalan-jalan kebaikan terbuka secara alami melalui ${cueB}.`,
        `Namun jika kamu lari dari panggilan ini demi mengejar kenyamanan dangkal, hidupmu akan selalu diselimuti rasa hampa yang sulit diobati.`,
        `Kamu berisiko merasa kehilangan arah jika terus mengukur nilai hidupmu semata-mata dari tepuk tangan duniawi.`,
      ];
    }
    return [
      `Membumikan misi jiwa tidak harus menunggu momen besar yang dramatis, melainkan dimulai dari ketulusan melayani dalam tugas-tugas kecil.`,
      `Buang keraguan bahwa kamu tidak memiliki peran penting dalam tatanan agung kehidupan ini.`,
      `Teguhkan langkah pengabdian jiwamu hari ini dengan menyatukan niat dan tindakan pada ${cueC}.`,
    ];
  },

  // 43. soul-gifts
  "soul-gifts": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Karunia jiwa yang kamu bawa lahir adalah anugerah murni dari perjalanan kesadaranmu yang siap menjadi berkah bagi sesama.`,
        `Karunia esensial ini memancar paling terang saat kamu mengekspresikan ${cueA}.`,
        `Karunia ini adalah titik temu di mana kebahagiaan batinmu melayani kebutuhan lingkungan yang membutuhkan dukungan.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat karunia jiwa ini kamu curahkan dengan tulus, kehadiranmu menjadi penyejuk dan inspirasi bagi sekitarmu melalui ${cueB}.`,
        `Namun jika karunia ini kamu simpan rapat-rapat karena takut dihakimi, energimu akan terasa mandek dan tertekan.`,
        `Bahaya lainnya adalah menggunakan karunia ini demi mencari pemujaan semu dari orang lain.`,
      ];
    }
    return [
      `Membagikan karunia jiwa menuntut ketulusan hati untuk membiarkan kebaikanmu mengalir tanpa perlu memikirkan pengakuan luar.`,
      `Lepaskan rasa minder yang membisikkan bahwa apa yang kamu berikan tidak bernilai bagi sesama.`,
      `Salurkan karunia terindah dari jiwamu hari ini ke dalam tindakan kasih nyata melalui ${cueC}.`,
    ];
  },

  // 44. soul-lessons
  "soul-lessons": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Kurikulum pembelajaran jiwamu di dunia ini dirancang untuk mengubah ketidaktahuan menjadi kebijaksanaan yang matang dan berakar.`,
        `Tema ujian batin yang paling berulang dalam perjalananmu berpusat di sekitar ${cueA}.`,
        `Pelajaran ini hadir bukan untuk menghukummu, melainkan untuk melatih otot-otot kesadaranmu agar semakin kokoh dan bijaksana.`,
      ];
    }
    if (p === 2) {
      return [
        `Setiap kali kamu berhasil melewati ujian ini dengan kedewasaan, jiwamu melangkah naik ke tingkat kebebasan batin yang baru melalui ${cueB}.`,
        `Tetapi jika kamu terus bersikap keras kepala dan menyalahkan keadaan, ujian yang sama akan datang kembali dalam bentuk yang lebih menantang.`,
        `Kamu kerap merasa lelah dengan hidup karena kamu terus berusaha melawan pelajaran yang semestinya kamu peluk dengan kerelaan.`,
      ];
    }
    return [
      `Menguasai pelajaran jiwa menuntut kerendahan hati untuk menerima setiap peristiwa sebagai cermin pembelajaran diri.`,
      `Berhentilah memandang kesulitan hidup sebagai nasib sial dan mulailah melihatnya sebagai undangan pertumbuhan batin.`,
      `Selesaikan ujian kesadaranmu hari ini dengan mengambil pilihan yang lebih bijak berlandaskan pada ${cueC}.`,
    ];
  },

  // 45. soul-shadow
  "soul-shadow": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Di balik setiap kekuatan jiwa yang besar selalu terdapat bayangan gelap yang terbentuk ketika cahaya kesadaranmu terdistorsi oleh rasa takut.`,
        `Sisi bayangan terdalam dari identitas jiwamu paling mudah terpancing saat kamu berhadapan dengan ${cueA}.`,
        `Bayangan ini bukanlah musuh yang harus dihancurkan, melainkan bagian dari energimu yang belum terintegrasi secara matang.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat kamu berani merangkul bayangan ini dengan welas asih, energi yang tadinya merusak berbalik menjadi daya transformasi dahsyat melalui ${cueB}.`,
        `Namun jika kamu menyangkal atau menutupinya, bayangan ini akan mengambil alih kendali dan memicu keretakan relasi serta penyesalan.`,
        `Kamu berisiko memproyeksikan kegelapan ini kepada orang di sekitarmu dan menuduh mereka atas apa yang sebenarnya kamu tolak dari dirimu sendiri.`,
      ];
    }
    return [
      `Mengintegrasikan bayangan jiwa menuntut keberanian untuk menatap sisi rapuh diri sendiri tanpa rasa benci atau penolakan.`,
      `Berhentilah berpura-pura selalu kuat dan akuilah kerapuhan manusiawimu dengan segala keterbatasannya.`,
      `Bawalah sisi bayanganmu kembali ke dalam pelukan cahaya kesadaran hari ini melalui kebijaksanaan ${cueC}.`,
    ];
  },
};

function buildParagraphSentences(
  reading: ArsipAkashiReadingDef,
  paragraphIndex: number,
  purpose: ReturnType<typeof readingPurpose>,
  themes: string[],
  factCues: string[],
): string[] {
  const domainA = DOMAIN_MEANINGS[reading.allowedDomains[0]] ?? DOMAIN_MEANINGS.growth;
  const domainB = DOMAIN_MEANINGS[reading.allowedDomains[1] ?? reading.allowedDomains[0]] ?? DOMAIN_MEANINGS.growth;
  const cueA = factCues[0] ?? domainA.core;
  let cueB = factCues[1] ?? domainB.strength ?? domainA.strength;
  if (cueB === cueA) {
    cueB = factCues[2] ?? domainB.daily ?? domainA.daily;
  }
  let cueC = factCues[2] ?? purpose.application;
  if (cueC === cueA || cueC === cueB) {
    cueC = purpose.application;
  }

  const templateFn = READING_NARRATIVE_TEMPLATES[reading.readingId];
  if (templateFn) {
    return templateFn(cueA, cueB, cueC, paragraphIndex);
  }

  if (paragraphIndex === 1) {
    return [
      `Di ruang batin ${reading.title}, kamu dipanggil untuk menyelaraskan diri dengan ${cueA}.`,
      `Kehadiran kualitas ini mewarnai pilihan harianmu, menuntut kejujuran rasa saat menghadapi dinamika seputar ${cueB}.`,
      `Kesadaranmu bertumbuh ketika kamu bersedia memeluk proses ini tanpa ketergesaan untuk membuktikan diri.`,
    ];
  }
  if (paragraphIndex === 2) {
    return [
      `Ketika berada dalam kepenuhan kesadaran, potensi ini menguatkan langkahmu melalui ${cueB}.`,
      `Namun saat rasa amanmu tertekan, sisi bayangan dapat muncul dalam bentuk kecemasan atau dorongan defensif yang melelahkan.`,
      `Tantangan terbesar terjadi saat kamu membiarkan keraguan batin mengendalikan responsmu terhadap keadaan.`,
    ];
  }
  return [
    `Langkah integrasi menuntut keberanian untuk hidup selaras dengan ${cueC} secara konsisten.`,
    `Lepaskan kebiasaan meragukan kapasitasmu sendiri hanya karena proses pertumbuhannya membutuhkan waktu.`,
    `Bumikan pemahaman ini ke dalam satu tindakan nyata yang membawa ketenangan dan kejernihan hari ini.`,
  ];
}

function renderDeepRegularReading(model: ArsipAkashiInsightModel, reading: ArsipAkashiReadingDef, roomTitle: string): ArsipAkashiRenderedReading {
  const purpose = readingPurpose(reading);
  const paragraphs: string[] = [];
  const provenance: DeepNarrativeParagraphProvenance[] = [];

  for (let paragraphIndex = 1; paragraphIndex <= 3; paragraphIndex++) {
    const selectedFacts = selectReadingFacts(model, reading, paragraphIndex);
    const selectedFactIds = selectedFacts.map((fact) => fact.factId);
    const contributingSystems = [...new Set(selectedFacts.map((fact) => fact.systemId))].sort();
    const domains = [...new Set(selectedFacts.map((fact) => fact.domain))];
    const semanticThemes = semanticThemesFor(reading, domains.length ? domains : reading.allowedDomains, paragraphIndex);
    const factCues = selectedFacts
      .map((fact, index) => humanizeFactCue(fact.value, fact.systemId, fact.domain, semanticThemes[index % semanticThemes.length] ?? reading.allowedDomains[index % reading.allowedDomains.length], reading.readingId))
      .filter(Boolean);
    const sentences = buildParagraphSentences(reading, paragraphIndex, purpose, semanticThemes, factCues).map(sanitizeVisible);
    paragraphs.push(sentences.join(" "));
    provenance.push({
      paragraphIndex,
      paragraphPurpose: PARAGRAPH_PURPOSES[paragraphIndex - 1],
      selectedFactIds,
      contributingSystems,
      semanticThemes,
      prohibitedOverlap: paragraphs.slice(0, -1).map((paragraph) => paragraph.slice(0, 80)),
      paragraphFingerprint: `${reading.readingId}:${paragraphIndex}:${symbolicHash(`${model.deterministicKey}:${selectedFactIds.join("|")}:${semanticThemes.join("|")}`)}`,
    });
  }

  const deepExplanation = paragraphs.join("\n\n");
  const reflectionClosers = [
    `Tutup latihan ${visibleReadingName(reading)} dengan menilai apakah pilihanmu terasa lebih jujur, lebih tenang, atau lebih mudah dijaga tubuh.`,
    `Akhiri refleksi ${visibleReadingName(reading)} dengan mencatat satu perubahan kecil pada keputusan, relasi, atau ritme tubuhmu.`,
    `Setelah latihan ${visibleReadingName(reading)}, perhatikan apakah respons barumu membuat keadaan terasa lebih sadar daripada pola lama.`,
    `Biarkan catatan ${visibleReadingName(reading)} selesai dengan satu ukuran nyata agar pemahaman tidak berhenti sebagai wacana batin.`,
  ];
  const reflection = [
    `Untuk ${visibleReadingName(reading)}, tuliskan satu pemicu dari shadow yang paling terasa minggu ini dan respons otomatis yang biasanya muncul.`,
    `Lalu pilih satu latihan integrasi yang spesifik: ${purpose.application}, dengan ukuran yang bisa kamu lakukan dalam satu hari.`,
    reflectionClosers[symbolicHash(`${model.deterministicKey}:${reading.readingId}:reflection-close`) % reflectionClosers.length],
  ].map(sanitizeVisible).join(" ");
  const supportingFactIds = provenance.flatMap((item) => item.selectedFactIds);
  const contributingSystems = [...new Set(provenance.flatMap((item) => item.contributingSystems))].sort();

  return {
    id: reading.readingId,
    sectionId: reading.roomId,
    roomTitle,
    title: reading.title,
    narrative: deepExplanation.replace(/\n\n/g, " "),
    deepExplanation,
    practicalReflection: reflection,
    deepNarrativeProvenance: provenance,
    recommendations: [{
      itemId: `${reading.readingId}-deep-reflection`,
      displayLabel: reading.title,
      category: reading.allowedDomains.includes("resources") ? "economy-action" : reading.allowedDomains.includes("talents") ? "career-action" : "innerwork-action",
      relevanceScore: Math.min(100, 45 + contributingSystems.length * 5),
      priority: "current",
      supportingFactIds,
      contributingSystems,
      confidenceBand: contributingSystems.length >= 4 ? "high" : contributingSystems.length >= reading.minimumCrossSystemSupport ? "medium" : "limited",
      currentReadiness: "Bacaan ini siap dibaca sebagai sintesis lintas fakta yang tersedia.",
      growthGap: purpose.application,
      weeklyGuidanceEligibility: reading.allowedDomains,
    }],
    order: reading.order,
  };
}

const SEMESTER_SECTION_TITLES = [
  "KONDISI UMUM",
  "KARIER & EKONOMI",
  "ASMARA, RELASI & KELUARGA",
  "KESEHATAN FISIK & MENTAL",
  "KONDISI SPIRITUAL",
  "TANTANGAN",
  "SARAN UNTUK MENJALANI SEMESTER",
] as const;

type SemesterSectionTitle = (typeof SEMESTER_SECTION_TITLES)[number];

type SemesterTheme = {
  phrase: string;
  domains: string[];
  systems: string[];
  factIds: string[];
  fingerprint: string;
};

type SemesterBundle = {
  title: SemesterSectionTitle;
  domains: string[];
  themes: SemesterTheme[];
  timingFacts: string[];
  stableFacts: string[];
  fingerprint: string;
};

const SEMESTER_DOMAIN_MAP: Record<SemesterSectionTitle, string[]> = {
  "KONDISI UMUM": ["timing", "growth", "identity", "mechanics"],
  "KARIER & EKONOMI": ["talents", "resources", "growth", "shadow"],
  "ASMARA, RELASI & KELUARGA": ["relationships", "shadow", "identity", "karma"],
  "KESEHATAN FISIK & MENTAL": ["health", "mechanics", "relationships", "location"],
  "KONDISI SPIRITUAL": ["spirituality", "karma", "growth", "identity"],
  "TANTANGAN": ["shadow", "karma", "resources", "relationships", "timing"],
  "SARAN UNTUK MENJALANI SEMESTER": ["growth", "timing", "talents", "resources", "relationships"],
};

const DOMAIN_THEMES: Record<string, string[]> = {
  identity: [
    "kebutuhan untuk bertindak dari nilai yang terasa jujur",
    "dorongan memperjelas peran tanpa kehilangan keluwesan",
    "keberanian menunjukkan kualitas diri dengan cara yang lebih tenang",
    "keselarasan antara panggilan batin dan peran yang dijalani",
    "keinginan menjaga integritas diri di tengah ekspektasi sekitar",
    "pencarian bentuk ekspresi yang paling sesuai dengan kapasitas alami",
  ],
  mechanics: [
    "ritme mengambil keputusan yang membutuhkan jeda sebelum bergerak",
    "pola energi yang lebih kuat ketika respons tubuh ikut didengar",
    "kebutuhan mengatur tempo agar tindakan tidak lahir dari tekanan sesaat",
    "pembagian tenaga yang cermat antara inisiasi dan penyelesaian",
    "respons alami yang bekerja paling jernih saat bebas dari desakan",
    "keteraturan ritme harian yang menjaga ketahanan batin dan fisik",
  ],
  talents: [
    "kemampuan mengubah gagasan menjadi bentuk kerja yang bisa diuji",
    "bakat menyusun pola, menghubungkan orang, atau membuat proses lebih jelas",
    "kekuatan belajar lewat praktik nyata, bukan hanya perencanaan",
    "kepekaan merancang solusi praktis dari pengamatan mendalam",
    "kapasitas menyampaikan wawasan kompleks dalam bahasa yang membumi",
    "ketelitian mengeksekusi detail karya hingga memberi manfaat nyata",
  ],
  shadow: [
    "kecenderungan menahan keputusan ketika rasa aman belum terasa cukup",
    "risiko mengulang pola lama saat harga diri terlalu dikaitkan dengan hasil",
    "dorongan defensif yang perlu dibaca lebih awal sebelum menjadi jarak",
    "kebiasaan memikul beban berlebih karena enggan meminta pertolongan",
    "kekhawatiran akan penolakan yang memicu sikap menutup diri",
    "pola keraguan batin sebelum mengambil langkah mandiri",
  ],
  relationships: [
    "kebutuhan relasi yang lebih jujur, seimbang, dan tidak ditebak-tebak",
    "kepekaan terhadap suasana emosional yang perlu disertai batas sehat",
    "pola kedekatan yang meminta komunikasi lebih terang dan tidak terburu-buru",
    "keinginan membangun ruang saling percaya tanpa saling mengekang",
    "kesadaran akan batas antara memberi perhatian dan menjaga ruang pribadi",
    "keberanian menyampaikan harapan dengan keterbukaan yang hangat",
  ],
  health: [
    "sensitivitas tubuh terhadap tekanan yang menumpuk tanpa jeda pemulihan",
    "kebutuhan menjaga tidur, makan, gerak ringan, dan ruang mental yang cukup",
    "ritme pemulihan yang membaik ketika beban harian dibuat lebih realistis",
    "kesadaran akan sinyal kelelahan sebelum tubuh menuntut istirahat paksa",
    "kebutuhan menyelaraskan aktivitas dengan energi alami yang tersedia",
    "perhatian lembut pada irama tubuh dan ketenangan saraf",
  ],
  spirituality: [
    "pencarian makna yang meminta praktik sederhana dan membumi",
    "intuisi yang tumbuh ketika hidup tidak terlalu penuh oleh kebisingan",
    "dorongan mengubah pemahaman batin menjadi sikap yang lebih welas asih",
    "keheningan batin yang menjadi sumber kejernihan saat situasi bimbang",
    "kesadaran keterhubungan antara perjalanan diri dan kehidupan sekitar",
    "praktik kehadiran sadar dalam setiap perjumpaan dan keputusan kecil",
  ],
  timing: [
    "perubahan irama tahun yang meminta prioritas dibuat lebih sadar",
    "pertemuan antara momentum membuka jalan dan kebutuhan menyelesaikan yang lama",
    "fase sementara yang mengaktifkan pilihan praktis, bukan kepastian nasib",
    "kesabaran menunggu saat yang tepat untuk bertindak terarah",
    "kesiapan menyambut babak baru dengan melepaskan beban yang usang",
    "kepekaan membaca siklus kehidupan tanpa tergesa memaksakan hasil",
  ],
  location: [
    "pengaruh lingkungan terhadap fokus, pemulihan, dan rasa aman",
    "kebutuhan memilih ruang yang mendukung tubuh dan kejernihan pikiran",
    "kepekaan pada suasana tempat yang perlu diterjemahkan menjadi batas praktis",
    "pencarian sudut tenang untuk memulihkan energi setelah aktivitas padat",
    "penataan ruang hidup yang memberi ruang napas dan inspirasi",
    "penyelarasan diri dengan atmosfer tempat yang memberi ketenangan batin",
  ],
  karma: [
    "pelajaran berulang yang meminta respons baru tanpa menyalahkan diri",
    "pola lama yang ingin diselesaikan melalui kedewasaan, bukan pengulangan",
    "undangan memperbaiki cara memberi, menerima, dan bertanggung jawab",
    "kesempatan melepaskan ekspektasi masa lalu yang tidak lagi relevan",
    "penyelesaian siklus batin dengan pemahaman yang lebih welas asih",
    "pembelajaran memaafkan proses belajar diri sendiri",
  ],
  growth: [
    "arah bertumbuh yang lebih kuat ketika langkah kecil dijaga konsisten",
    "kebutuhan melepas ukuran lama agar pilihan baru bisa diuji",
    "kematangan yang muncul dari latihan, bukan dari tuntutan sempurna",
    "keberanian memperluas kapasitas diri melalui pengalaman baru",
    "kesediaan belajar dari kekeliruan dengan sikap terbuka dan rendah hati",
    "kemajuan bertahap yang dihargai sebagai proses yang utuh",
  ],
  resources: [
    "hubungan dengan uang, tenaga, dan waktu yang meminta struktur lebih sadar",
    "kebutuhan membedakan rasa aman sejati dari dorongan menumpuk kendali",
    "peluang memperkuat ekonomi melalui pencatatan, batas risiko, dan nilai kontribusi",
    "pengelolaan alokasi energi agar tidak terbuang pada hal yang tidak esensial",
    "kesadaran nilai diri yang memandu keputusan finansial dan profesional",
    "keseimbangan antara menabung rasa aman dan berani memanfaatkan peluang",
  ],
};

function chooseSemanticTheme(domain: string, seed: string): string {
  const pool = DOMAIN_THEMES[domain] ?? DOMAIN_THEMES.growth;
  return pool[symbolicHash(`${seed}:${domain}`) % pool.length];
}

function naturalSemesterPeriod(activeYear: number, semester: 1 | 2): string {
  return semester === 1 ? `Januari hingga Juni ${activeYear}` : `Juli hingga Desember ${activeYear}`;
}

function sanitizeDirection(direction: string): string {
  const cleaned = direction
    .replace(/menata prioritas secara bertahap\.?/gi, "menyusun prioritas yang realistis dan dapat dijalankan")
    .replace(/[{}[\]"]/g, "")
    .replace(/\b(systemId|factId|confidence|score|skor|rank|peringkat|dominantSigns|calculationFingerprint)\b:?/gi, "")
    .replace(/\b[A-Z]?[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]\s*[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]?\b/g, "")
    .replace(/\b(age|usia)\s*\d+\s*[-–]\s*\d+\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || "menyusun prioritas yang realistis dan dapat dijalankan";
}

function buildSemesterBundles(
  model: ArsipAkashiInsightModel,
  semester: 1 | 2,
  activeYear: number,
  selectedFacts: ArsipAkashiInsightModel["sections"][number]["selectedFacts"],
): SemesterBundle[] {
  return SEMESTER_SECTION_TITLES.map((title, index) => {
    const domains = SEMESTER_DOMAIN_MAP[title];
    const eligible = selectedFacts.filter((fact) => domains.includes(fact.domain) && fact.interpretationEligibility);
    const rotated = eligible
      .map((fact) => ({ fact, order: symbolicHash(`${model.deterministicKey}:${title}:${semester}:${activeYear}:${fact.factId}`) }))
      .sort((a, b) => a.order - b.order)
      .slice(0, 5)
      .map(({ fact }) => fact);
    const fallbackDomains = domains.slice(0, 3);
    const sourceFacts = rotated.length ? rotated : fallbackDomains.map((domain) => ({
      factId: `semantic-fallback/${title}/${domain}`,
      systemId: "numerology" as const,
      domain,
      value: domain,
      interpretationEligibility: true,
      sourcePath: "semantic-fallback",
      sourceVersion: "v1",
      stabilityType: "partial-data-theme" as const,
      warnings: [],
    }));
    const themes = sourceFacts.map((fact, factIndex) => ({
      phrase: chooseSemanticTheme(fact.domain, `${model.deterministicKey}:${semester}:${title}:${factIndex}:${fact.factId}`),
      domains: [fact.domain],
      systems: [fact.systemId],
      factIds: [fact.factId],
      fingerprint: `${fact.domain}:${symbolicHash(`${fact.factId}:${semester}:${title}:${activeYear}`)}`,
    }));
    const timingFacts = sourceFacts.filter((fact) => fact.domain === "timing" || fact.stabilityType === "active-timing").map((fact) => fact.factId);
    const stableFacts = sourceFacts.filter((fact) => fact.domain !== "timing" && fact.stabilityType !== "active-timing").map((fact) => fact.factId);
    return {
      title,
      domains,
      themes,
      timingFacts,
      stableFacts,
      fingerprint: `${index + 1}:${themes.map((theme) => theme.fingerprint).join("|")}`,
    };
  });
}

function themeText(bundle: SemesterBundle, position: number): string {
  return bundle.themes[position % bundle.themes.length]?.phrase ?? chooseSemanticTheme(bundle.domains[position % bundle.domains.length], bundle.fingerprint);
}

function renderSemesterReadings(model: ArsipAkashiInsightModel): ArsipAkashiRenderedReading[] {
  const section = model.sections.find((candidate) => candidate.sectionId === "current-life-phase");
  const systems = [...new Set((section?.selectedFacts ?? []).map((fact) => fact.systemId))];
  const factIds = (section?.selectedFacts ?? []).map((fact) => fact.factId);
  const allFacts = section?.selectedFacts ?? [];
  const direction = sanitizeDirection(section?.practicalDirection || "menyusun prioritas yang realistis dan dapat dijalankan");
  const relationshipMode = symbolicHash(`${model.deterministicKey}:relationship-status`) % 3;
  const relationshipBranch = relationshipMode === 0 ? "single" : relationshipMode === 1 ? "dating" : "married/family";
  const make = (semester: 1 | 2): ArsipAkashiRenderedReading => {
    const timing = semesterTiming(model.generatedAt, model.timezone, semester);
    const first = semester === 1;
    const semesterFacts = allFacts.filter((fact) => symbolicHash(`${fact.factId}:${timing.semesterId}:${timing.activeYear}`) % 2 === (first ? 0 : 1));
    const selectedFacts = semesterFacts.length >= 7 ? semesterFacts : allFacts;
    const subtitle = first ? "Masa membaca pola, menyiapkan fondasi, dan memilih prioritas yang benar-benar penting." : "Masa menguji hasil, memperluas dampak, dan menyelesaikan komitmen yang sudah tidak selaras.";
    const period = naturalSemesterPeriod(timing.activeYear, semester);
    const bundles = buildSemesterBundles(model, semester, timing.activeYear, selectedFacts);
    const bundle = (title: SemesterSectionTitle) => bundles.find((item) => item.title === title)!;
    const relationshipText = relationshipBranch === "single"
      ? first
        ? "Karena cabang relasi yang terbaca adalah single, fokusnya bukan mengejar status baru, melainkan mengenali pola tertarik, pola menarik diri, dan ruang sosial yang benar-benar aman."
        : "Karena cabang relasi yang terbaca adalah single, semester kedua lebih menekankan keberanian memilih kedekatan yang seimbang daripada menerima perhatian yang tidak jelas arahnya."
      : relationshipBranch === "dating"
        ? first
          ? "Karena cabang relasi yang terbaca adalah dating, semester pertama meminta kejujuran tentang ritme, kebutuhan emosional, dan batas yang selama ini mungkin hanya diasumsikan."
          : "Karena cabang relasi yang terbaca adalah dating, semester kedua meminta bukti keseimbangan melalui tindakan, bukan hanya percakapan yang terasa hangat."
        : first
          ? "Karena cabang relasi yang terbaca adalah married/family, semester pertama lebih kuat pada pembagian beban, komunikasi rumah, dan kesepakatan yang membuat keluarga terasa lebih tertata."
          : "Karena cabang relasi yang terbaca adalah married/family, semester kedua menekankan tindak lanjut, keputusan bersama, dan pelepasan kebiasaan rumah yang menguras tenaga.";
    const sections = [
      {
        title: "KONDISI UMUM" as const,
        body: first
          ? `Semester pertama pada periode ${period} membuka tahun sebagai ruang membaca ulang arah, bukan sebagai dorongan buru-buru membuktikan hasil. Sintesismu menonjolkan ${themeText(bundle("KONDISI UMUM"), 0)} dan ${themeText(bundle("KONDISI UMUM"), 1)}, sehingga fase ini relevan untuk memilih mana yang perlu dibangun lebih dulu. Dalam keseharian, hal itu dapat muncul sebagai kebutuhan menata agenda, mengurangi pilihan yang menyebar, dan memberi waktu pada keputusan yang belum matang.\n\nParuh ini berbeda dari semester kedua karena bobotnya berada pada pembentukan fondasi, bukan ekspansi. Area kerja, relasi, dan kesehatan perlu dilihat sebagai satu ekosistem yang saling memengaruhi. Perhatian utamanya adalah menjaga stabilitas sambil tetap memberi ruang pada perubahan kecil yang memang sudah siap dilakukan.`
          : `Semester kedua pada periode ${period} membawa tahun ke fase pengujian, penyelesaian, dan penajaman konsekuensi dari pilihan sebelumnya. Sintesismu menonjolkan ${themeText(bundle("KONDISI UMUM"), 0)} dan ${themeText(bundle("KONDISI UMUM"), 1)}, sehingga fase ini relevan untuk melihat apa yang masih hidup dan apa yang hanya dipertahankan karena kebiasaan. Dalam keseharian, hal itu dapat muncul sebagai kebutuhan menutup siklus, merapikan komitmen, dan berani terlihat saat arah sudah lebih jelas.\n\nParuh ini berbeda dari semester pertama karena energinya bergerak dari persiapan menuju pelaksanaan. Area kerja, relasi, dan sumber daya meminta keputusan yang lebih tegas tanpa kehilangan kepekaan. Perhatian utamanya adalah menyelesaikan yang perlu selesai agar tahun berikutnya tidak dimulai dari beban lama yang belum diberi nama.`,
      },
      {
        title: "KARIER & EKONOMI" as const,
        body: first
          ? `Di pekerjaan atau usaha, semester pertama lebih baik dipakai untuk menguji arah karya, merapikan cara kerja, dan menilai ulang sumber penghasilan yang paling realistis. Bundle karier membaca ${themeText(bundle("KARIER & EKONOMI"), 0)} bersama ${themeText(bundle("KARIER & EKONOMI"), 1)}, sehingga peluang terbaik datang dari eksperimen kecil yang bisa diukur. Money block cenderung muncul ketika rasa aman membuatmu menunda pencatatan, meremehkan nilai kontribusi, atau mengambil risiko sebelum fondasinya jelas.\n\nSkill yang sudah bisa digunakan adalah kemampuan membaca kebutuhan dan menyusunnya menjadi langkah kerja yang konkret. Skill yang perlu dipelajari adalah cara mengubah arah besar menjadi rencana biaya, waktu, dan kapasitas yang lebih sederhana. Aksi ekonominya adalah membuat satu catatan arus masuk-keluar, memilih satu layanan atau peran yang ingin diuji, lalu menjaga batas risiko sampai datanya cukup.`
          : `Di pekerjaan atau usaha, semester kedua lebih kuat untuk mengeksekusi hasil, memperluas dampak, dan menegosiasikan nilai dengan lebih dewasa. Bundle karier membaca ${themeText(bundle("KARIER & EKONOMI"), 0)} bersama ${themeText(bundle("KARIER & EKONOMI"), 2)}, sehingga peluang terbaik datang dari karya yang sudah punya bukti awal dan siap diperlihatkan. Money block cenderung muncul ketika kamu mempertahankan komitmen yang tidak lagi bernilai, menunda percakapan harga, atau membiarkan energi habis di pekerjaan yang tidak seimbang.\n\nSkill yang sudah bisa digunakan adalah kemampuan menyelesaikan, memperjelas pesan, dan membawa hasil ke orang yang membutuhkan. Skill yang perlu dipelajari adalah negosiasi, prioritisasi, dan keberanian melepas pekerjaan yang membuat pertumbuhan berhenti. Aksi ekonominya adalah meninjau sumber penghasilan paling sehat, menaikkan standar kesepakatan, dan menutup kebocoran tenaga yang tidak lagi memberi imbal balik pantas.`,
      },
      {
        title: "ASMARA, RELASI & KELUARGA" as const,
        body: first
          ? `${relationshipText} Bundle relasi membaca ${themeText(bundle("ASMARA, RELASI & KELUARGA"), 0)} dan ${themeText(bundle("ASMARA, RELASI & KELUARGA"), 1)}, sehingga percakapan kecil bisa menunjukkan pola besar. Love block dapat terasa sebagai kebutuhan dipahami tanpa selalu menyebut kebutuhan, atau sebagai kecenderungan menjaga damai sampai batas pribadi terlambat terlihat.\n\nDalam keluarga dan lingkar sosial, pilih satu pola yang ingin dikenali sebelum diulang. Jangan memaksa kedekatan yang belum siap, tetapi jangan juga membuat orang menebak semua isi hatimu. Semester pertama paling membantu jika kamu menjadikan relasi sebagai ruang kejujuran yang lembut, bukan tempat menguji siapa yang paling mampu bertahan.`
          : `${relationshipText} Bundle relasi membaca ${themeText(bundle("ASMARA, RELASI & KELUARGA"), 0)} dan ${themeText(bundle("ASMARA, RELASI & KELUARGA"), 2)}, sehingga semester ini meminta bukti lewat konsistensi. Love block dapat terasa sebagai penundaan memilih, takut mengecewakan, atau kecenderungan menerima bentuk hubungan yang tidak benar-benar mendukung rasa amanmu.\n\nDalam keluarga dan lingkar sosial, satu hubungan perlu diperjelas melalui tindakan nyata. Kedekatan yang sehat akan terasa lebih ringan ketika batas, peran, dan harapan dibicarakan sebelum menjadi letih. Semester kedua paling membantu jika kamu berani melihat siapa yang tumbuh bersamamu dan siapa yang perlu diberi jarak dengan hormat.`,
      },
      {
        title: "KESEHATAN FISIK & MENTAL" as const,
        body: first
          ? `Secara fisik dan mental, semester pertama meminta ritme dasar yang lebih stabil karena tubuhmu kemungkinan cepat merasakan tekanan yang tidak diberi jeda. Bundle tubuh membaca ${themeText(bundle("KESEHATAN FISIK & MENTAL"), 0)} serta ${themeText(bundle("KESEHATAN FISIK & MENTAL"), 1)}, sehingga pemulihan perlu dibuat sebagai bagian dari jadwal, bukan hadiah setelah semua selesai. Gejalanya dapat muncul sebagai sulit fokus, tidur yang kurang pulih, atau rasa penuh ketika terlalu banyak keputusan berjalan bersamaan.\n\nBagian ini tetap non-klinis dan tidak menggantikan bantuan profesional. Pilih satu pola pemulihan yang sederhana, seperti jam tidur yang lebih konsisten, gerak ringan, atau ruang kerja yang lebih tenang. Bila tekanan menetap dan mengganggu fungsi harian, dukungan profesional menjadi pilihan yang bijak.`
          : `Secara fisik dan mental, semester kedua meminta pengelolaan energi ketika aktivitas, tuntutan sosial, atau beban kerja mulai meningkat. Bundle tubuh membaca ${themeText(bundle("KESEHATAN FISIK & MENTAL"), 0)} serta ${themeText(bundle("KESEHATAN FISIK & MENTAL"), 2)}, sehingga pemulihan perlu mengikuti intensitas hidup yang sedang berjalan. Gejalanya dapat muncul sebagai tubuh cepat tegang, emosi mudah penuh, atau kebutuhan menyendiri setelah terlalu banyak memberi respons.\n\nBagian ini tetap non-klinis dan hanya memberi arah perawatan diri. Jaga batas agenda, kurangi paparan yang menguras, dan beri tubuh transisi setelah pekerjaan atau interaksi padat. Bila tekanan menetap dan mengganggu fungsi harian, dukungan profesional menjadi pilihan yang wajar dan bertanggung jawab.`,
      },
      {
        title: "KONDISI SPIRITUAL" as const,
        body: first
          ? `Secara spiritual, semester pertama mengarah ke proses kembali ke dalam dan menyederhanakan makna yang selama ini terasa terlalu ramai. Bundle spiritual membaca ${themeText(bundle("KONDISI SPIRITUAL"), 0)} bersama ${themeText(bundle("KONDISI SPIRITUAL"), 1)}, sehingga praktik terbaik adalah yang membuatmu lebih hadir di tubuh dan hidup harian. Ini dapat muncul sebagai keinginan mempertanyakan keyakinan lama, menata ulang ritual, atau mencari bentuk doa dan hening yang lebih jujur.\n\nTidak semua jawaban perlu segera disimpulkan. Yang penting adalah membangun kembali kepercayaan pada proses kecil yang berulang, bukan mengejar pengalaman batin yang spektakuler. Semester pertama mendukung penyaringan makna agar kamu tahu mana yang benar-benar menenangkan dan mana yang hanya membuatmu terus mencari.`
          : `Secara spiritual, semester kedua mengarah ke integrasi, pelayanan, dan keberanian menghidupkan pemahaman dalam keputusan nyata. Bundle spiritual membaca ${themeText(bundle("KONDISI SPIRITUAL"), 0)} bersama ${themeText(bundle("KONDISI SPIRITUAL"), 2)}, sehingga praktik terbaik adalah yang terlihat dari cara kamu bekerja, berelasi, dan menjaga batas. Ini dapat muncul sebagai dorongan membagikan pemahaman, membantu dengan lebih sadar, atau membuat karya yang membawa makna tanpa harus menggurui.\n\nWawasan batin perlu diberi kaki agar tidak berhenti sebagai perasaan sesaat. Pilih satu bentuk ekspresi yang membumi, seperti pelayanan kecil, komunikasi yang lebih jernih, atau keputusan yang lebih etis. Semester kedua mendukung penyatuan antara apa yang kamu percaya dan cara kamu hadir di dunia.`,
      },
      {
        title: "TANTANGAN" as const,
        body: first
          ? `Tantangan semester pertama berada pada kecenderungan menunggu kepastian terlalu lama saat fondasi sebenarnya sudah bisa dimulai kecil-kecilan. Bundle shadow membaca ${themeText(bundle("TANTANGAN"), 0)} dan ${themeText(bundle("TANTANGAN"), 1)}, sehingga pemicunya dapat muncul ketika pilihan terasa terlalu banyak atau saat standar diri menjadi terlalu berat. Tanda awalnya adalah menunda hal sederhana, mengumpulkan informasi tanpa keputusan, atau merasa harus siap sempurna sebelum mencoba.\n\nDomain yang paling mudah terdampak adalah kerja, ekonomi, dan relasi yang membutuhkan kejelasan. Respons yang lebih sehat adalah memilih satu prioritas, membuat batas waktu yang manusiawi, dan memulai dari ukuran yang tidak mengancam rasa aman. Dengan begitu, semester pertama tidak berubah menjadi masa menunggu yang diam-diam menguras tenaga.`
          : `Tantangan semester kedua berada pada kecenderungan mempertahankan komitmen lama karena melepasnya terasa seperti mengakui kegagalan. Bundle shadow membaca ${themeText(bundle("TANTANGAN"), 0)} dan ${themeText(bundle("TANTANGAN"), 2)}, sehingga pemicunya dapat muncul ketika hasil tidak sesuai harapan atau ketika orang lain meminta kepastian darimu. Tanda awalnya adalah tubuh terasa berat sebelum sebuah kewajiban, percakapan penting terus ditunda, atau kamu tetap hadir di tempat yang tidak lagi memberi arah.\n\nDomain yang paling mudah terdampak adalah ekonomi, relasi, dan kesehatan mental karena semuanya meminta energi yang nyata. Respons yang lebih sehat adalah menegosiasikan ulang, menyelesaikan yang bisa diselesaikan, dan melepas yang hanya dipertahankan oleh rasa bersalah. Dengan begitu, semester kedua menjadi ruang penutupan yang matang, bukan penumpukan beban untuk tahun berikutnya.`,
      },
      {
        title: "SARAN UNTUK MENJALANI SEMESTER" as const,
        body: first
          ? `Saran semester pertama adalah membangun fondasi yang bisa diuji, bukan rencana besar yang terlalu berat untuk dimulai. Dari kondisi umum, karier, relasi, tubuh, spiritualitas, dan tantangan semester pertama, arah paling realistis adalah ${direction}. Bundle saran membaca ${themeText(bundle("SARAN UNTUK MENJALANI SEMESTER"), 0)} dan ${themeText(bundle("SARAN UNTUK MENJALANI SEMESTER"), 1)}, sehingga langkah terbaik adalah memilih sedikit hal yang benar-benar dapat dirawat.\n\nBuat satu prioritas kerja, satu kebiasaan ekonomi, satu batas relasi, dan satu pola pemulihan tubuh yang sederhana. Tinjau ulang setiap akhir bulan agar kamu tidak kehilangan arah ketika hidup mulai bergerak lebih cepat. Semester pertama akan terasa lebih sehat bila keberhasilan diukur dari konsistensi dan kejelasan, bukan dari banyaknya hal yang berhasil dimulai.`
          : `Saran semester kedua adalah menyelesaikan, menegosiasikan, dan memperlihatkan hasil yang sudah cukup matang untuk diuji di dunia nyata. Dari kondisi umum, karier, relasi, tubuh, spiritualitas, dan tantangan semester kedua, arah paling realistis adalah ${direction}. Bundle saran membaca ${themeText(bundle("SARAN UNTUK MENJALANI SEMESTER"), 0)} dan ${themeText(bundle("SARAN UNTUK MENJALANI SEMESTER"), 2)}, sehingga langkah terbaik adalah mengurangi kebocoran energi sebelum menambah komitmen baru.\n\nTutup satu urusan kerja, perjelas satu kesepakatan ekonomi, pilih satu percakapan relasi yang perlu diselesaikan, dan sisihkan waktu pemulihan setelah fase padat. Tinjau apa yang layak dibawa ke tahun berikutnya dan apa yang perlu dilepas dengan hormat. Semester kedua akan terasa lebih matang bila keberhasilan diukur dari kualitas penyelesaian dan keberanian memilih arah yang lebih bersih.`,
      },
    ];
    const sectionMetadata = bundles.map((item) => `${item.title}:${item.fingerprint}`).join(";");
    return { id: timing.semesterId, sectionId: "current-life-phase", roomTitle: "FASE KEHIDUPAN SAAT INI", title: `Peruntungan Semester ${semester} Tahun ${timing.activeYear}`, shortMeaning: subtitle, narrative: sections.map((item) => item.body.replace(/\n\n/g, " ")).join(" "), deepExplanation: sections.map((item) => `${item.title}\n${item.body}`).join("\n\n"), practicalReflection: "", detailSections: sections, recommendations: [{ itemId: `${timing.semesterId}-action`, displayLabel: `Aksi Semester ${semester}`, category: "career-action", relevanceScore: Math.min(100, 40 + systems.length * 6), priority: "current", supportingFactIds: factIds, contributingSystems: systems, confidenceBand: systems.length >= 4 ? "high" : systems.length >= 2 ? "medium" : "limited", currentReadiness: `Status semester: ${timing.semesterStatus}.`, growthGap: direction, weeklyGuidanceEligibility: ["career-action", "economy-action", relationshipBranch, sectionMetadata] }], order: first ? 1 : 2 };
  };
  return [make(1), make(2)];
}

export function renderReadings(model: ArsipAkashiInsightModel, roomTitle: string): ArsipAkashiRenderedReading[] {
  if (roomTitle === "ASAL USUL & PERADABAN") return renderSymbolicOriginReadings(model);
  if (roomTitle === "FASE KEHIDUPAN SAAT INI") return renderSemesterReadings(model);
  const section = model.sections.find((s) => {
    const map: Record<string, string> = {
      "SIAPA DIRIMU": "soul-identity",
      "ENERGI & MEKANIKA": "energy-mechanics",
      "LUKA, BAYANGAN & WARISAN": "wounds-shadow-lineage",
      "KARYA & TALENTA": "work-talents",
      "CINTA & RELASI": "love-relationships",
      "RAGA & RUANG": "body-environment",
      "SPIRITUALITAS & EVOLUSI": "spirituality-evolution",
      "FASE KEHIDUPAN SAAT INI": "current-life-phase",
      "SOUL IDENTITY": "soul-identity",
      "ASAL USUL & PERADABAN": "symbolic-origin",
    };
    return s.sectionId === map[roomTitle];
  });

  return READING_DEFINITIONS
    .filter((rd) => rd.roomTitle === roomTitle && rd.roomId === (section?.sectionId ?? ""))
    .map((rd: ArsipAkashiReadingDef): ArsipAkashiRenderedReading => renderDeepRegularReading(model, rd, roomTitle));
}
