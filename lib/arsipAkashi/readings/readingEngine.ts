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
  let cleaned = text
    .replace(/[{}[\]"]/g, "")
    .replace(/\b(systemId|factId|sourceVersion|blueprintFingerprint|calculationFingerprint|confidence|score|skor|rank|ranking|peringkat|dominantSigns)\b:?/gi, "")
    .replace(/[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/g, "")
    .replace(/\b(age|usia)\s*\d+\s*[-–]\s*\d+\b/gi, "");
  while (/\([^)]*\)/.test(cleaned)) {
    cleaned = cleaned.replace(/\([^)]*\)/g, "");
  }
  return cleaned.replace(/[()]/g, "").replace(/\s+/g, " ").trim();
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
  jia: "keteguhan prinsip dan daya bertumbuh yang mandiri",
  "yang wood": "keteguhan prinsip dan daya bertumbuh yang mandiri",
  yi: "keluwesan beradaptasi dan kecerdikan menemukan jalan keluar di tengah keterbatasan",
  "yin wood": "keluwesan beradaptasi dan kecerdikan menemukan jalan keluar di tengah keterbatasan",
  bing: "kehangatan daya hidup dan keterbukaan memancarkan semangat",
  "yang fire": "kehangatan daya hidup dan keterbukaan memancarkan semangat",
  ding: "kejernihan fokus dan ketulusan memberi inspirasi",
  "yin fire": "kejernihan fokus dan ketulusan memberi inspirasi",
  wu: "kestabilan batin dan keandalan menjaga ketenangan",
  "yang earth": "kestabilan batin dan keandalan menjaga ketenangan",
  ji: "kesabaran mengasuh dan kejelian mematangkan proses",
  "yin earth": "kesabaran mengasuh dan kejelian mematangkan proses",
  geng: "ketegasan mengambil sikap dan keberanian menentukan prioritas secara disiplin",
  "yang metal": "ketegasan mengambil sikap dan keberanian menentukan prioritas secara disiplin",
  xin: "kepekaan estetika dan martabat menjaga nilai berkualitas",
  "yin metal": "kepekaan estetika dan martabat menjaga nilai berkualitas",
  ren: "kelapangan wawasan dan keberanian bergerak dinamis",
  "yang water": "kelapangan wawasan dan keberanian bergerak dinamis",
  gui: "kejernihan empati dan ketenangan batin yang menyejukkan sekitar",
  "yin water": "kejernihan empati dan ketenangan batin yang menyejukkan sekitar",
  wood: "keteguhan bertumbuh dan keluwesan daya cipta",
  kayu: "keteguhan bertumbuh dan keluwesan daya cipta",
  fire: "kehangatan semangat dan kejernihan wawasan batin",
  api: "kehangatan semangat dan kejernihan wawasan batin",
  earth: "kestabilan langkah dan ketabahan merawat komitmen",
  tanah: "kestabilan langkah dan ketabahan merawat komitmen",
  metal: "ketegasan prinsip, ketelitian, dan keadilan nyata",
  logam: "ketegasan prinsip, ketelitian, dan keadilan nyata",
  water: "kelapangan rasa dan kedalaman kebijaksanaan hening",
  air: "kelapangan rasa dan kedalaman kebijaksanaan hening",
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

const TZOLKIN_CASTLE_MAP: Record<string, string> = {
  merah: "keberanian membuka cakrawala baru dan menyerap wawasan segar",
  red: "keberanian membuka cakrawala baru dan menyerap wawasan segar",
  putih: "kejernihan memilah esensi dan menyederhanakan gagasan rumit",
  white: "kejernihan memilah esensi dan menyederhanakan gagasan rumit",
  biru: "ketajaman menyelami kedalaman makna dan mentransformasi sudut pandang",
  blue: "ketajaman menyelami kedalaman makna dan mentransformasi sudut pandang",
  kuning: "kemampuan mematangkan konsep menjadi pemahaman yang utuh",
  yellow: "kemampuan mematangkan konsep menjadi pemahaman yang utuh",
  hijau: "kepekaan mengenali sinkronisitas dan makna tersembunyi di balik peristiwa",
  green: "kepekaan mengenali sinkronisitas dan makna tersembunyi di balik peristiwa",
};

const TZOLKIN_SEAL_MAP: Record<string, string> = {
  dragon: "daya asuh dan penerimaan berkah kehidupan",
  naga: "daya asuh dan penerimaan berkah kehidupan",
  wind: "kejernihan komunikasi dan penyampaian inspirasi",
  angin: "kejernihan komunikasi dan penyampaian inspirasi",
  night: "kedalaman intuisi dan penjelajahan ruang batin",
  malam: "kedalaman intuisi dan penjelajahan ruang batin",
  seed: "kesadaran benih potensi dan ketepatan bertumbuh",
  benih: "kesadaran benih potensi dan ketepatan bertumbuh",
  serpent: "kepekaan daya hidup dan kecerdasan instingtif",
  ular: "kepekaan daya hidup dan kecerdasan instingtif",
  worldbridger: "kemampuan menjembatani perbedaan dan melepaskan masa lalu",
  "penghubung dunia": "kemampuan menjembatani perbedaan dan melepaskan masa lalu",
  hand: "keterampilan menyembuhkan dan mewujudkan hasil karya",
  tangan: "keterampilan menyembuhkan dan mewujudkan hasil karya",
  star: "keanggunan estetika dan penciptaan harmoni",
  bintang: "keanggunan estetika dan penciptaan harmoni",
  moon: "pemurnian aliran rasa dan kepekaan emosional",
  bulan: "pemurnian aliran rasa dan kepekaan emosional",
  dog: "kesetiaan hati dan ketulusan cinta tanpa pamrih",
  anjing: "kesetiaan hati dan ketulusan cinta tanpa pamrih",
  monkey: "kecerdikan bermain dan kelenturan memandang situasi",
  monyet: "kecerdikan bermain dan kelenturan memandang situasi",
  human: "kearifan memilih dengan kehendak bebas yang bertanggung jawab",
  manusia: "kearifan memilih dengan kehendak bebas yang bertanggung jawab",
  skywalker: "keberanian menjelajahi ruang baru dan memperluas batas",
  "penjelajah langit": "keberanian menjelajahi ruang baru dan memperluas batas",
  wizard: "kehadiran batin di saat ini dan integritas spiritual",
  penyihir: "kehadiran batin di saat ini dan integritas spiritual",
  eagle: "ketajaman visi luas dan pandangan jernih dari ketinggian",
  elang: "ketajaman visi luas dan pandangan jernih dari ketinggian",
  warrior: "keberanian bertanya secara kritis dan keteguhan bertindak",
  ksatria: "keberanian bertanya secara kritis dan keteguhan bertindak",
  earth: "sinkronisitas keselarasan dan kesadaran arah navigasi hidup",
  bumi: "sinkronisitas keselarasan dan kesadaran arah navigasi hidup",
  mirror: "kejernihan refleksi kebenaran dan ketertiban batin",
  cermin: "kejernihan refleksi kebenaran dan ketertiban batin",
  storm: "daya transformasi besar dan pembaruan energi",
  badai: "daya transformasi besar dan pembaruan energi",
  sun: "keterbukaan terang kesadaran dan kehangatan daya hidup",
  matahari: "keterbukaan terang kesadaran dan kehangatan daya hidup",
};

const TZOLKIN_TONE_MAP: Record<string, string> = {
  "1": "penyatuan tujuan dan daya tarik inisiatif",
  "2": "keseimbangan polaritas dan penegasan tantangan",
  "3": "pengaktifan gerak dan keterhubungan dinamis",
  "4": "ketertiban struktur dan kejelasan bentuk wujud",
  "5": "daya kepemimpinan mandiri dan penguatan pusat diri",
  "6": "keselarasan ritme dan kelancaran kerja sama",
  "7": "kejernihan penyelarasan dan resonansi batin",
  "8": "integritas konsistensi dan kesetiaan pada nilai",
  "9": "dorongan mewujudkan niat menjadi aksi nyata",
  "10": "perwujudan karya dan penyelesaian terukur",
  "11": "pelepasan hal usang dan pembebasan daya baru",
  "12": "kejernihan kerja sama dan dedikasi pada sesama",
  "13": "keutuhan kesadaran dan ketenangan melampaui siklus",
  magnetic: "penyatuan tujuan dan daya tarik inisiatif",
  lunar: "keseimbangan polaritas dan penegasan tantangan",
  electric: "pengaktifan gerak dan keterhubungan dinamis",
  "self-existing": "ketertiban struktur dan kejelasan bentuk wujud",
  overtone: "daya kepemimpinan mandiri dan penguatan pusat diri",
  rhythmic: "keselarasan ritme dan kelancaran kerja sama",
  resonant: "kejernihan penyelarasan dan resonansi batin",
  galactic: "integritas konsistensi dan kesetiaan pada nilai",
  solar: "dorongan mewujudkan niat menjadi aksi nyata",
  planetary: "perwujudan karya dan penyelesaian terukur",
  spectral: "pelepasan hal usang dan pembebasan daya baru",
  crystal: "kejernihan kerja sama dan dedikasi pada sesama",
  cosmic: "keutuhan kesadaran dan ketenangan melampaui siklus",
};

const WUKU_MEANING_MAP: Record<string, string> = {
  sinta: "keberanian membuka siklus baru dan pembentukan arah",
  landep: "ketajaman pikiran dan kemampuan memilah hal esensial",
  wukir: "ketekunan, pertumbuhan bertahap, dan fondasi yang kokoh",
  kurantil: "keluwesan beradaptasi dan kecermatan membaca perubahan",
  tolu: "keberanian berekspresi dan menyampaikan kebenaran isi hati",
  gumbreg: "daya rawat dan tanggung jawab menjaga kebaikan lingkungan",
  warigalit: "kecermatan pada detail dan keseimbangan kebiasaan",
  warigagung: "kebijaksanaan melihat dampak tindakan dalam jangka panjang",
  julungwangi: "martabat diri dan penggunaan pengaruh secara bajik",
  sungsang: "kemampuan membalik sudut pandang dan memetik hikmah",
  galungan: "keteguhan memegang nilai kebenaran dan kemenangan batin",
  kuningan: "kesadaran bersyukur dan penyelesaian secara bermartabat",
  langkir: "kewaspadaan, strategi matang, dan kemampuan menjaga batas",
  mandasiya: "keteguhan daya kerja dan kecakapan mengelola tenaga besar",
  julungpujut: "ketulusan niat dan kesetiaan pada nilai yang diyakini",
  pahang: "keberanian menghadapi gesekan dan mengubahnya menjadi kemajuan",
  kuruwelut: "kemampuan merawat kesinambungan dan hubungan yang sehat",
  marakeh: "kemandirian, ketelitian, dan keberanian memperbaiki arah",
  tambir: "kecakapan berkomunikasi dan menjembatani perbedaan",
  medangkungan: "kelapangan pandangan dan tanggung jawab menjaga amanah",
  maktal: "keteguhan prinsip dan kedalaman transformasi batin",
  wuye: "kepekaan intuisi dan ketepatan menangkap momentum",
  manahil: "ketekunan menuntaskan tanggung jawab hingga menghasilkan buah nyata",
  prangbakat: "keberanian strategis dalam menghadapi persaingan",
  bala: "ketahanan menghadapi rintangan dan tanggung jawab moral",
  wugu: "kematangan dalam bertindak dan kedalaman perenungan hening",
  wayang: "daya imajinasi dan kepekaan membaca peran di balik peristiwa",
  kulawu: "kebijaksanaan memulihkan diri dan penerimaan yang lapang",
  dukut: "kesederhanaan, kejujuran batin, dan perhatian pada hal mendasar",
  watugunung: "kematangan integrasi dan kesiapan memulai babak baru",
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
    "甲": "keteguhan prinsip dan daya bertumbuh yang mandiri",
    "乙": "keluwesan beradaptasi dan kecerdikan menemukan jalan keluar di tengah keterbatasan",
    "丙": "kehangatan daya hidup dan keterbukaan memancarkan semangat",
    "丁": "kejernihan fokus dan ketulusan memberi inspirasi",
    "戊": "kestabilan batin dan keandalan menjaga ketenangan",
    "己": "kesabaran mengasuh dan kejelian mematangkan proses",
    "庚": "ketegasan mengambil sikap dan keberanian menentukan prioritas secara disiplin",
    "辛": "kepekaan estetika dan martabat menjaga nilai berkualitas",
    "壬": "kelapangan wawasan dan keberanian bergerak dinamis",
    "癸": "kejernihan empati dan ketenangan batin yang menyejukkan sekitar",
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

  // Check WUKU mapping before other lookups
  for (const [wukuKey, wukuMeaning] of Object.entries(WUKU_MEANING_MAP)) {
    if (lower === wukuKey || lower.includes(`wuku ${wukuKey}`) || lower.includes(wukuKey)) {
      return wukuMeaning;
    }
  }

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

  // Specific domain adaptation for Cara Berpikir & Memaknai Kehidupan
  if (readingId === "cara-berpikir-memaknai") {
    if (systemId === "weton") {
      for (const [wukuKey, wukuMeaning] of Object.entries(WUKU_MEANING_MAP)) {
        if (lower.includes(wukuKey)) return wukuMeaning;
      }
      if (lower.includes("legi")) return "keramahan dan keterbukaan menghubungkan berbagai ide";
      if (lower.includes("pahing")) return "ketegasan menalar dan keberanian memegang prinsip berpikir";
      if (lower.includes("pon")) return "pertimbangan matang dan cara berpikir yang membumi";
      if (lower.includes("wage")) return "kecermatan analisis dan ketelitian menguji fakta";
      if (lower.includes("kliwon")) return "kedalaman intuisi dan kemampuan menangkap makna batin";
    }
    if (systemId === "tzolkin") {
      for (const [color, meaning] of Object.entries(TZOLKIN_CASTLE_MAP)) {
        if (lower.includes(color)) return meaning;
      }
      for (const [seal, meaning] of Object.entries(TZOLKIN_SEAL_MAP)) {
        if (lower.includes(seal)) return meaning;
      }
      return "kepekaan membaca pola dan keterhubungan makna di balik pengalaman hidup";
    }
    if (systemId === "destiny-matrix" || lower.includes("arcana") || lower.includes("energi")) {
      const arcMatch = lower.match(/\b(2[0-2]|1[0-9]|[1-9])\b/);
      if (arcMatch) {
        const num = arcMatch[1];
        if (num === "7") return "fokus berpikir terarah dalam membedah tujuan dan merumuskan strategi";
        if (num === "9") return "kedalaman kontemplasi yang tekun menelusuri hakikat di balik fakta lahiriah";
        if (num === "5") return "kemampuan menata konsep secara terstruktur dan menghargai nilai pembelajaran";
        if (num === "1") return "daya cipta gagasan orisinal dan keberanian merintis pemikiran baru";
        if (num === "2") return "keheningan intuisi yang meresapi nuansa halus sebelum menarik kesimpulan";
        if (num === "8") return "kejernihan menimbang sebab-akibat dan menegakkan keadilan berpikir";
      }
    }
    if (systemId === "human-design") {
      if (lower.includes("generator")) return "kecerdasan praktis yang merespons kenyataan nyata dengan ketelitian";
      if (lower.includes("projector")) return "kepekaan sistemik yang mampu mengenali esensi dan alur berpikir sekitar";
      if (lower.includes("manifestor")) return "kemandirian berpikir yang cepat merumuskan visi terobosan";
      if (lower.includes("reflector")) return "kelapangan perspektif yang merefleksikan beragam sudut pandang secara objektif";
    }
  }

  // Specific domain adaptation for Ritme Energi Alami
  if (readingId === "ritme-energi-alami") {
    if (systemId === "bazi") {
      if (lower.includes("geng") || lower.includes("metal") || lower.includes("logam")) {
        return "ketegasan menentukan prioritas dan disiplin menjaga energi";
      }
      if (lower.includes("yi") || lower.includes("wood") || lower.includes("kayu")) {
        return "keluwesan mengatur tempo dan kelincahan beradaptasi dengan situasi";
      }
      if (lower.includes("gui") || lower.includes("ren") || lower.includes("water") || lower.includes("air")) {
        return "ketenangan mengalirkan tenaga dan kepekaan menjaga stamina tubuh";
      }
      if (lower.includes("bing") || lower.includes("ding") || lower.includes("fire") || lower.includes("api")) {
        return "semangat dinamis yang terfokus pada momen bertindak efektif";
      }
      if (lower.includes("wu") || lower.includes("ji") || lower.includes("earth") || lower.includes("tanah")) {
        return "kestabilan stamina yang terjaga melalui ritme teratur";
      }
    }
    if (systemId === "human-design") {
      if (lower.includes("generator")) return "daya kerja berkelanjutan yang mengalir kuat saat merespons hal nyata";
      if (lower.includes("projector")) return "ritme efisien yang membutuhkan jeda berkala untuk memulihkan perhatian";
      if (lower.includes("manifestor")) return "gelombang inisiasi berdaya dorong tinggi yang diselingi fase istirahat";
      if (lower.includes("reflector")) return "ritme lembut yang menyelaraskan tenaga dengan kesegaran lingkungan";
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
    if (systemId === "human-design") {
      if (lower.includes("generator") || lower.includes("sacral") || lower.includes("respond")) {
        return "dorongan memaksakan komitmen kerja tanpa mendengarkan sinyal kelelahan tubuh";
      }
      if (lower.includes("projector") || lower.includes("invitation")) {
        return "dorongan membuktikan nilai diri lewat kerja berlebihan sebelum diakui secara tepat";
      }
      if (lower.includes("manifestor") || lower.includes("inform")) {
        return "kecemasan saat inisiatif mandirimu terhambat oleh keterbatasan sumber daya";
      }
      if (lower.includes("reflector")) {
        return "tekanan menyerap kepanikan finansial lingkungan sekitar";
      }
    }
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
    if (systemId === "bazi") {
      return "dorongan mengontrol pengeluaran secara berlebihan saat menghadapi ketidakpastian";
    }
    if (systemId === "weton") {
      return "kekhawatiran akan ketidakpastian rezeki yang memicu keraguan mengambil langkah";
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
        if (lower.includes(elem)) return `bakat alami berupa ${meaning}`;
      }
    }
  }

  // Specific domain adaptation for Love Block & Pola Berulang (relational armor & vulnerability fear)
  if (readingId === "love-block-pola-berulang") {
    if (systemId === "human-design") {
      if (lower.includes("generator")) return "dorongan menyenangkan pasangan hingga mengorbankan batas pribadi";
      if (lower.includes("projector")) return "kekecewaan mendalam ketika perhatian dan bimbinganmu tidak dihargai secara setara";
      if (lower.includes("manifestor")) return "kecenderungan menutup diri dan menolak kompromi saat merasa dibatasi";
      if (lower.includes("reflector")) return "kebingungan membedakan perasaan diri sendiri dari ekspektasi pasangan";
    }
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
    if (systemId === "bazi") {
      return "keengganan memperlihatkan kerapuhan karena takut kehilangan kendali dalam hubungan";
    }
    if (systemId === "weton") {
      return "kebiasaan memendam kekecewaan demi mempertahankan kesan hubungan yang baik-baik saja";
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
      for (const [wukuKey, meaning] of Object.entries(WUKU_MEANING_MAP)) {
        if (lower.includes(wukuKey)) return `ketabahan silsilah dalam merawat ${meaning}`;
      }
      for (const [pasaran, meaning] of Object.entries(WETON_PASARAN_MAP)) {
        if (lower.includes(pasaran)) return meaning;
      }
    }
    if (systemId === "tzolkin") {
      for (const [color, meaning] of Object.entries(TZOLKIN_CASTLE_MAP)) {
        if (lower.includes(color)) return `daya tahan silsilah yang membawa ${meaning}`;
      }
      for (const [seal, meaning] of Object.entries(TZOLKIN_SEAL_MAP)) {
        if (lower.includes(seal)) return meaning;
      }
      return `daya tahan silsilah yang selaras dengan arketipe ${sanitized.toLowerCase()}`;
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

  // Specific domain adaptation for Soul Mission (calling, purpose, deeper service)
  if (readingId === "soul-mission") {
    if (systemId === "human-design") {
      if (lower.includes("generator")) return "panggilan mengabdi melalui dedikasi kerja nyata yang menumbuhkan kehidupan";
      if (lower.includes("projector")) return "panggilan memandu dan menyelaraskan sistem dengan kejernihan visi";
      if (lower.includes("manifestor")) return "panggilan merintis inisiatif berani yang membuka jalan bagi orang banyak";
      if (lower.includes("reflector")) return "panggilan merefleksikan kebenaran dan menjaga keutuhan kesadaran bersama";
    }
    if (systemId === "destiny-matrix" || lower.includes("arcana")) {
      const arcMatch = lower.match(/\b(2[0-2]|1[0-9]|[1-9])\b/);
      if (arcMatch) {
        const num = arcMatch[1];
        if (num === "7") return "arah kepemimpinan yang menggerakkan orang lain menuju pencapaian bermakna";
        if (num === "9") return "panggilan menyelami kebijaksanaan hening dan membagikan pencerahan batin";
        if (num === "4") return "tanggung jawab membangun tatanan hidup yang stabil dan melindungi sesama";
        if (num === "10") return "keluwesan membuka peluang rezeki dan menyatukan banyak pihak";
      }
      return "arah pengabdian yang mengubah pengalaman hidup menjadi jalan terang bagi sesama";
    }
    if (systemId === "numerology") {
      const numMatch = lower.match(/\b(11|22|33|[1-9])\b/);
      if (numMatch) {
        const n = numMatch[1];
        if (n === "1") return "keberanian menjadi pelopor mandiri yang menginspirasi langkah orang lain";
        if (n === "7") return "dedikasi menelusuri kebenaran mendalam dan membagikan wawasan jernih";
        if (n === "4") return "ketekunan membangun fondasi karya yang kokoh dan bermanfaat panjang";
      }
      return "komitmen memberi teladan dan membuka jalan bagi pertumbuhan bersama";
    }
    if (systemId === "tzolkin") {
      for (const [seal, meaning] of Object.entries(TZOLKIN_SEAL_MAP)) {
        if (lower.includes(seal)) return `panggilan mewujudkan ${meaning}`;
      }
      for (const [color, meaning] of Object.entries(TZOLKIN_CASTLE_MAP)) {
        if (lower.includes(color)) return `arah kontribusi yang selaras dengan ${meaning}`;
      }
      if (lower.includes("true") || lower.includes("gap")) {
        return "keberanian membuka portal potensi dan melayani transformasi kesadaran";
      }
      return "kepekaan mengenali waktu yang tepat untuk menghadirkan kontribusi bermakna";
    }
    if (systemId === "bazi") {
      for (const [elem, meaning] of Object.entries(BAZI_ELEMENT_MAP)) {
        if (lower.includes(elem)) return `panggilan mengalirkan ${meaning}`;
      }
      return "tanggung jawab merawat keseimbangan hidup dan menyuburkan potensi sekitar";
    }
  }

  // Tzolkin general mapping
  if (systemId === "tzolkin") {
    for (const [color, meaning] of Object.entries(TZOLKIN_CASTLE_MAP)) {
      if (lower.includes(color)) return meaning;
    }
    for (const [tone, meaning] of Object.entries(TZOLKIN_TONE_MAP)) {
      if (lower === tone || lower.includes(` ${tone} `) || lower.startsWith(`${tone} `) || lower.includes(tone)) return meaning;
    }
    for (const [seal, meaning] of Object.entries(TZOLKIN_SEAL_MAP)) {
      if (lower.includes(seal)) return meaning;
    }
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
  // 1. arketipe-utama (Priority Fixture)
  "arketipe-utama": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Menatap dirimu secara utuh memperlihatkan postur batin utama yang menjadi jangkar bagi seluruh caramu menjalani hidup.`,
        `Kompas keberadaanmu bekerja paling jernih saat kamu membiarkan pilihanmu dipandu oleh ${cueA}.`,
        `Ketika kamu hidup selaras dengan pusat ini, tindakanmu memancarkan ketenangan yang tidak mudah digoyahkan oleh riuh ekspektasi luar.`,
      ];
    }
    if (p === 2) {
      return [
        `Dalam kematangan kesadaran, kehadiranmu menghadirkan rasa mantap dan arah yang jelas berkat ${cueB}.`,
        `Namun ketika tekanan lingkungan meningkat, amati apakah muncul dorongan membuktikan nilai diri secara berlebihan atau justru menarik diri di balik peran yang tidak sepenuhnya jujur.`,
        `Mengenali pergeseran ini membantumu segera kembali pada kejujuran postur dasarmu.`,
      ];
    }
    return [
      `Menjaga keaslian arketipe ini menuntut keberanian untuk setia pada kompas internalmu dalam keputusan besar maupun kecil.`,
      `Lepaskan anggapan bahwa kamu harus selalu memenuhi ekspektasi semua orang agar layak dihargai.`,
      `Mulailah hari ini dengan mengambil satu sikap tegas yang sepenuhnya berakar pada ${cueC}.`,
    ];
  },

  // 2. cara-berpikir-memaknai (Priority Fixture)
  "cara-berpikir-memaknai": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Pola kognisimu bekerja dengan menelusuri keterhubungan mendalam di balik peristiwa lahiriah, bukan sekadar menerima informasi di permukaan.`,
        `Cara pikiranmu menyusun arti dan merangkai wawasan bertumpu kuat pada ${cueA}.`,
        `Kejernihan pemikiranmu mencapai puncaknya saat kamu memberi ruang bagi perenungan sebelum buru-buru menarik kesimpulan.`,
      ];
    }
    if (p === 2) {
      return [
        `Pada kondisi terbaik, daya analitis dan kepekaan batinmu berpadu menghasilkan sudut pandang yang segar berkat ${cueB}.`,
        `Sebaliknya, ketika pikiranmu berada di bawah tekanan atau kelelahan, amati kecenderungan terjebak dalam pusaran analisis berlebih yang menunda tindakan nyata.`,
        `Sikap kritis yang sehat tetap memerlukan kelapangan rasa agar tidak berubah menjadi keraguan yang melumpuhkan.`,
      ];
    }
    return [
      `Melatih kejernihan kognitif menuntut keseimbangan antara ketajaman observasi dan kesabaran melihat konteks yang lebih utuh.`,
      `Beri jeda sejenak sebelum merumuskan penilaian agar setiap fakta memiliki ruang untuk dipahami secara adil.`,
      `Bumikan cara berpikirmu hari ini dengan membawa prinsip ${cueC} ke dalam satu keputusan praktis.`,
    ];
  },

  // 3. nilai-kebutuhan-batin
  "nilai-kebutuhan-batin": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Kebutuhan batinmu adalah jangkar hening yang menopang ketahanan emosional dalam dinamika keseharian.`,
        `Rasa damai di dalam dirimu sangat dipengaruhi oleh seberapa jauh ritme hidupmu memberi tempat bagi ${cueA}.`,
        `Ketika kebutuhan dasar ini terpenuhi secara jujur, energimu mengalir dengan tenang tanpa dorongan kecemasan yang mendesak.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat nilai-nilai intimu dihormati, kamu memancarkan stabilitas batin yang meneduhkan sekitar berkat ${cueB}.`,
        `Namun bila kebutuhan ini terus terabaikan demi memenuhi keinginan orang lain, perhatikan jika tubuh dan emosimu mulai memberi tanda berupa kejenuhan atau rasa lelah batin.`,
        `Pola ini sering kali menandakan bahwa ada ruang batin yang meminta perhatian dan kejujuran untuk disuarakan secara tenang.`,
      ];
    }
    return [
      `Merawat kebutuhan batin merupakan bentuk tanggung jawab pertama yang menjaga kewarasan dan keutuhan jiwamu.`,
      `Kurangi rasa bersalah saat kamu perlu menetapkan batas demi melindungi ruang pemulihan pribadimu.`,
      `Luangkan waktu hari ini untuk menegaskan kembali komitmenmu pada ${cueC} dalam pilihan-pilihan kecil yang nyata.`,
    ];
  },

  // 4. cara-hadir-di-dunia
  "cara-hadir-di-dunia": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Kesan pertama dan caramu melangkah ke ruang bersama membawa getaran khas yang langsung dirasakan oleh lingkungan sekitar.`,
        `Kehadiranmu secara alami memancarkan martabat yang bersumber dari ${cueA}.`,
        `Tanpa perlu memaksakan diri tampil dominan, caramu membawa diri telah mengomunikasikan batas dan integritas yang jelas.`,
      ];
    }
    if (p === 2) {
      return [
        `Dalam kondisi seimbang, caramu mengekspresikan diri memudahkan orang lain merasa nyaman dan terhubung berkat ${cueB}.`,
        `Namun ketika rasa percaya diri sedang surut, amati apakah ada kecenderungan membangun jarak yang terlalu dingin atau sebaliknya berusaha terlalu keras agar diterima.`,
        `Menyelaraskan niat batin dengan ekspresi lahiriah membantumu hadir secara utuh tanpa beban pencitraan.`,
      ];
    }
    return [
      `Daya tarik sejati lahir dari kesederhanaan bersikap yang berpijak pada keaslian jati diri.`,
      `Lepaskan kekhawatiran tentang bagaimana setiap tatapan orang lain akan menilai gerak-gerikmu.`,
      `Hadirlah secara utuh di setiap perjumpaan hari ini dengan menyandarkan sikapmu pada ${cueC}.`,
    ];
  },

  // 5. ritme-energi-alami (Priority Fixture)
  "ritme-energi-alami": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Tubuh dan perhatianmu beroperasi menurut tempo alami yang menuntut penghormatan terhadap batas dan kapasitas daya hidup.`,
        `Ritme staminamu bergerak paling optimal ketika kamu menyelaraskan aktivitas harian dengan ${cueA}.`,
        `Mengenali pasang surut tenaga ini membantumu bekerja secara berkelanjutan tanpa harus mengorbankan kesehatan jangka panjang.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat kamu bergerak mengikuti irama alami ini, fokus dan produktivitasmu tercurah secara efektif berkat ${cueB}.`,
        `Perhatikan tanda-tanda ketika kamu mulai memaksakan diri melampaui sinyal lelah demi memenuhi tuntutan luar yang mendesak.`,
        `Mengabaikan kebutuhan jeda hanya akan memicu keletihan mendalam yang pada akhirnya memperlambat langkahmu sendiri.`,
      ];
    }
    return [
      `Menata hari berdasarkan kapasitas energi adalah bentuk kepedulian nyata yang menjaga kejernihan pikiran dan ketahanan raga.`,
      `Biasakan mengukur keberhasilan dari kualitas kehadiranmu, bukan sekadar jumlah kesibukan yang berhasil kamu tumpuk.`,
      `Bangun ritme kerja yang lebih seimbang hari ini dengan memberi ruang bagi ${cueC} di sela aktivitasmu.`,
    ];
  },

  // 6. cara-mengambil-keputusan
  "cara-mengambil-keputusan": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Pilihan hidup yang tepat bagimu jarang lahir dari ketergesaan atau perdebatan logika yang bising semata.`,
        `Kompas keputusanmu memiliki kecerdasan internal yang bekerja selaras melalui ${cueA}.`,
        `Keputusan yang matang selalu ditandai oleh rasa hening dan keteguhan di dalam dada, bukan oleh kepanikan yang terburu-buru.`,
      ];
    }
    if (p === 2) {
      return [
        `Ketika kamu setia mendengarkan sinyal internal ini, arah langkahmu mengalir dengan kemantapan berkat ${cueB}.`,
        `Namun bila tekanan waktu atau ketakutan tertinggal mendominasi, amati kecenderungan mencari pembenaran dari terlalu banyak orang sampai suara hatimu sendiri tenggelam.`,
        `Memberi ruang jeda sejenak sering kali menjadi pembeda antara reaksi sesaat dan pilihan yang bijaksana.`,
      ];
    }
    return [
      `Mempercayai caramu memilih menuntut kesabaran menunggu hingga kejelasan batin benar-benar menetap.`,
      `Hindari godaan menyimpulkan sesuatu secara tergesa hanya demi meredakan ketidaknyamanan batin yang bersifat sementara.`,
      `Ujilah setiap pertimbangan penting berikutnya dengan bersandar pada kejernihan ${cueC}.`,
    ];
  },

  // 7. pola-respons-kehidupan
  "pola-respons-kehidupan": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Caramu merespons kejutan, perubahan tak terduga, atau situasi krisis memperlihatkan mekanisme adaptasi pertamamu.`,
        `Secara naluriah, sikap awalmu dalam menghadapi dinamika baru bertumpu pada ${cueA}.`,
        `Menyadari respons spontan ini membantumu beralih dari sekadar bereaksi secara otomatis menjadi merespons dengan penuh kesadaran.`,
      ];
    }
    if (p === 2) {
      return [
        `Dalam suasana tenang, daya lentingmu bekerja sangat baik dalam menemukan solusi praktis berkat ${cueB}.`,
        `Namun saat situasi terasa menekan secara mendadak, perhatikan bila muncul reaksi bertahan yang kaku atau kebiasaan menutup diri sebelum duduk perkara jelas.`,
        `Ruang antara peristiwa dan tanggapanmu adalah tempat di mana kebebasan memilihmu sesungguhnya berada.`,
      ];
    }
    return [
      `Kedewasaan emosional tumbuh saat kamu mampu memberi jeda satu tarikan napas sebelum menentukan tanggapan lahiriah.`,
      `Latihlah diri untuk tidak langsung membenarkan reaksi spontan yang dapat memperkeruh suasana perjumpaan.`,
      `Jawablah tantangan hari ini dengan ketenangan yang berakar pada kearifan ${cueC}.`,
    ];
  },

  // 8. fokus-produktivitas-konsistensi
  "fokus-produktivitas-konsistensi": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Kapasitas fokusmu bekerja bukan melalui pemaksaan konsentrasi tanpa henti, melainkan melalui penjagaan perhatian pada hal yang esensial.`,
        `Daya tahan produktivitasmu terbangun kokoh saat kamu menautkan usahamu pada ${cueA}.`,
        `Hasil karya yang bermutu tinggi selalu lahir ketika perhatianmu terlindungi dari gangguan yang mengaburkan arah utama.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat ritme kerjamu tertata rapi, ketekunanmu menghasilkan capaian nyata yang terukur melalui ${cueB}.`,
        `Sebaliknya, menyebarkan perhatian ke terlalu banyak inisiatif sekaligus berisiko menghabiskan stamina tanpa menghasilkan dampak yang tuntas.`,
        `Amati apakah ada kecenderungan merasa sibuk sepanjang hari tetapi sebenarnya sedang menghindari pekerjaan yang paling esensial.`,
      ];
    }
    return [
      `Konsistensi jangka panjang dibangun melalui rutinitas sederhana yang dapat diulang dengan mudah setiap hari.`,
      `Kurangi ketergantungan pada ledakan motivasi sesaat dengan membangun sistem kerja yang realistis dan teratur.`,
      `Ikat fokus kerjamu pada satu prioritas penting hari ini dengan memanfaatkan kekuatan ${cueC}.`,
    ];
  },

  // 9. cara-memulihkan-energi
  "cara-memulihkan-energi": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Pemulihan energi adalah fondasi mutlak agar daya hidup dan kejernihan perhatianmu tidak terkuras oleh rutinitas harian.`,
        `Sistem saraf dan batinmu kembali segar secara alami ketika kamu memberi ruang yang cukup bagi ${cueA}.`,
        `Titik balik pemulihan terjadi saat kamu berani mengambil jeda dari tuntutan luar tanpa membebani diri dengan rasa bersalah.`,
      ];
    }
    if (p === 2) {
      return [
        `Dalam suasana hening yang tepat, vitalitasmu terisi kembali dengan cepat berkat ${cueB}.`,
        `Namun bila tanda-tanda kelelahan terus diabaikan, tubuhmu akan menuntut istirahat melalui penurunan konsentrasi atau ketegangan emosi.`,
        `Perhatikan apakah kamu kerap mengganti istirahat sejati dengan stimulasi pasif yang sebenarnya masih menguras perhatian mental.`,
      ];
    }
    return [
      `Menjaga kebersihan energimu memerlukan ritual pemulihan yang sengaja dijadwalkan secara sadar.`,
      `Hargai waktu jeda sebagai bagian integral dari siklus karya yang memungkinkan pencapaian terbaikmu merekah.`,
      `Ciptakan ruang tenang yang menyejukkan hari ini untuk meremajakan energimu melalui ${cueC}.`,
    ];
  },

  // 10. luka-inti
  "luka-inti": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Di lapisan emosional terdalam tersimpan titik rentan yang terbentuk dari pengalaman masa lalu dalam melindungi diri dari rasa sakit.`,
        `Kepekaan batin ini cenderung terusik ketika kamu berhadapan dengan situasi yang menyentuh ${cueA}.`,
        `Menatap kerapuhan ini dengan kelembutan adalah langkah awal agar memori lama tidak lagi mengarahkan pilihanmu secara tidak sadar.`,
      ];
    }
    if (p === 2) {
      return [
        `Ketika titik sensitif ini disinari oleh penerimaan welas asih, kerapuhanmu bertransformasi menjadi empati yang mendalam melalui ${cueB}.`,
        `Namun saat rasa sakitnya terpicu tanpa disadari, perhatikan apakah muncul reaksi defensif yang mempersepsikan keadaan netral sebagai ancaman atau penolakan pribadi.`,
        `Mengenali pemicu ini membantumu membedakan kenyataan saat ini dari bayang-bayang luka masa lalu.`,
      ];
    }
    return [
      `Merawat luka inti bukanlah tentang melupakan sejarah hidup, melainkan tentang memeluk diri sendiri dengan kehangatan yang lebih dewasa.`,
      `Hindari menuntut orang lain menjadi penawar bagi rasa tidak aman yang sebenarnya sedang meminta asuhan batinmu sendiri.`,
      `Dekaplah bagian dirimu yang rentan hari ini dengan ketabahan yang bersumber dari ${cueC}.`,
    ];
  },

  // 11. mekanisme-perlindungan
  "mekanisme-perlindungan": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Strategi pertahanan batin yang kamu bangun di masa lalu pernah menjadi perisai yang menyelamatkanmu saat menghadapi tekanan berat.`,
        `Armor pelindung ini secara otomatis terpasang ketika rasa amanmu terasa terancam oleh ${cueA}.`,
        `Meskipun dulu sangat berjasa, perlindungan yang sama kini dapat menjadi pembatas yang menghalangi kedekatan dan keterbukaan yang sehat.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat mekanisme bertahan ini kamu sadari dengan jernih, kamu mampu membedakan risiko nyata dari sekadar kekhawatiran lama berkat ${cueB}.`,
        `Di sisi lain, bila perisai ini bekerja tanpa kendali, kamu mungkin cenderung menutup diri atau menjaga jarak berlebih dari lingkungan yang berniat tulus.`,
        `Menyadari kapan perisai ini aktif membantumu memilih respons yang lebih luwes dan proporsional.`,
      ];
    }
    return [
      `Melunakkan pertahanan diri menuntut keyakinan bahwa kapasitasmu yang sekarang sudah jauh lebih matang untuk menghadapi realitas.`,
      `Kurangi kebiasaan mencurigai setiap situasi baru sebelum kamu sempat melihat fakta yang sebenarnya.`,
      `Latihlah keterbukaan yang aman hari ini dengan menyandarkan keberanianmu pada kekuatan ${cueC}.`,
    ];
  },

  // 12. pola-self-sabotage
  "pola-self-sabotage": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Dorongan untuk menahan langkah sendiri kerap muncul tanpa disadari justru saat peluang besar atau kebahagiaan baru mulai mendekat.`,
        `Pola keraguan ini biasanya mulai aktif ketika alam bawah sadarmu merasa belum terbiasa dengan ${cueA}.`,
        `Ketakutan akan tanggung jawab baru atau ketidakpastian sering kali menjadi pemicu di balik kebiasaan menunda atau mempersulit langkah sendiri.`,
      ];
    }
    if (p === 2) {
      return [
        `Memahami akar keraguan ini memberimu kejernihan untuk memutus siklus yang menghambat perkembangan melalui ${cueB}.`,
        `Namun bila pola ini tidak diamati, kamu mungkin tergoda menciptakan kesibukan sampingan atau mempermasalahkan hal kecil yang mengalihkan fokus utama.`,
        `Melihat pola ini secara jujur tanpa menyalahkan diri adalah kunci untuk menjaga kemajuan yang sedang kamu bangun.`,
      ];
    }
    return [
      `Menghentikan hambatan internal menuntut keteguhan untuk tetap melangkah meskipun rasa cemas membisikkan keraguan.`,
      `Ingatlah bahwa rasa tidak nyaman adalah tanda wajar dari perluasan kapasitas menuju tahap kedewasaan baru.`,
      `Pertahankan momentum langkahmu hari ini dengan memegang teguh komitmen pada ${cueC}.`,
    ];
  },

  // 13. ketakutan-tersembunyi
  "ketakutan-tersembunyi": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Di bawah kesadaran harian tersimpan kekhawatiran mendasar yang jarang diungkapkan tetapi diam-diam memengaruhi arah keputusanmu.`,
        `Kegentaran batin ini paling sering terusik saat kamu membayangkan kemungkinan yang berkaitan dengan ${cueA}.`,
        `Menamai ketakutan ini secara jujur melucuti daya pengaruhnya yang selama ini membatasi keberanianmu melangkah.`,
      ];
    }
    if (p === 2) {
      return [
        `Ketika kamu berani menatap kekhawatiran ini dengan pikiran jernih, ketenangan sejati mulai menggantikan rasa cemas melalui ${cueB}.`,
        `Sebaliknya, menyangkal keberadaan rasa takut hanya akan mengubahnya menjadi ketegangan mengambang yang melelahkan pikiran.`,
        `Amati apakah kamu kerap membatasi ruang gerak hidup semata-mata demi memastikan skenario buruk yang dibayangkan tidak pernah terjadi.`,
      ];
    }
    return [
      `Keberanian bukanlah ketiadaan rasa gentar, melainkan kesadaran bahwa ada tujuan hidup yang jauh lebih bernilai untuk diperjuangkan.`,
      `Lepaskan kebutuhan akan jaminan mutlak sebelum bersedia mengambil langkah pertumbuhan yang bermakna.`,
      `Tataplah masa depanmu dengan keteguhan hati yang berakar pada prinsip ${cueC}.`,
    ];
  },

  // 14. warisan-keluarga-leluhur (Priority Fixture)
  "warisan-keluarga-leluhur": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Garis keturunan membawa untaian memori relasional, nilai budaya, dan ketabahan yang ikut mewarnai sudut pandangmu.`,
        `Dari akar keluarga ini, kamu mewarisi daya tahan dan harapan hidup yang berpijak pada ${cueA}.`,
        `Memahami keterhubungan ini mengajakmu merenungkan pola mana yang menguatkan dan mana yang sudah waktunya diperbarui.`,
      ];
    }
    if (p === 2) {
      return [
        `Kekuatan silsilahmu hadir nyata dalam bentuk ketangguhan batin dan kemampuan melewati masa sulit berkat ${cueB}.`,
        `Sebagai bahan refleksi sadar, amati apakah ada ekspektasi tak terucap atau kebiasaan generasi terdahulu yang diam-diam masih membebani pilihan pribadimu.`,
        `Memilah warisan ini adalah bentuk penghormatan sejati agar kamu tidak sekadar mengulang siklus yang tidak lagi relevan.`,
      ];
    }
    return [
      `Kedewasaan berelasi dengan asal-usul keluarga terletak pada kemampuan merawat hikmah baiknya sembari menetapkan batas hidup yang mandiri.`,
      `Kamu berhak menentukan jalan hidup yang selaras dengan nilai jiwamu tanpa harus merasa bersalah.`,
      `Tegakkan postur hidupmu di masa kini dengan menyandarkan langkah pada ${cueC}.`,
    ];
  },

  // 15. karma-pola-berulang
  "karma-pola-berulang": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Kemunculan dinamika serupa dalam situasi atau relasi yang berbeda sering kali menandakan adanya pelajaran hidup yang meminta penyelesaian baru.`,
        `Siklus pengalaman yang berulang ini mengajakmu meninjau kembali caramu merespons ${cueA}.`,
        `Melihat pengulangan ini sebagai ruang pembelajaran sadar membantumu keluar dari rasa ketidakberdayaan.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat inti pelajarannya dapat dipahami, siklus berulang ini bertransformasi menjadi lompatan kematangan hidup berkat ${cueB}.`,
        `Namun bila situasi tersebut hanya ditanggapi dengan reaksi lama, wajar bila rasa jenuh dan kekecewaan serupa kembali dirasakan.`,
        `Kunci perubahan terletak pada kesediaan mengubah satu respons kecil saat menghadapi situasi yang terasa familiar.`,
      ];
    }
    return [
      `Memutus siklus berulang menuntut keberanian memilih tindakan baru pada titik di mana kebiasaan lama biasanya mengambil alih.`,
      `Hindari mengharapkan perubahan keadaan luar jika caramu menyikapi masalah masih mengulang pola yang sama.`,
      `Mulailah melangkah di jalur baru hari ini dengan mempraktikkan kearifan ${cueC}.`,
    ];
  },

  // 16. arah-penyembuhan-integrasi
  "arah-penyembuhan-integrasi": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Pemulihan batin merupakan perjalanan berkelanjutan untuk merangkul kembali setiap bagian pengalaman hidup menjadi satu keutuhan yang matang.`,
        `Jalur integrasi pribadimu menuntut kesabaran dalam menyikapi dinamika seputar ${cueA}.`,
        `Proses ini tidak menuntut kesempurnaan tanpa cela, melainkan kejujuran untuk berdamai dengan seluruh perjalanan yang telah kamu lalui.`,
      ];
    }
    if (p === 2) {
      return [
        `Seiring bertumbuhnya kesadaran diri, pengalaman yang menantang mengkristal menjadi sumber kebijaksanaan nyata melalui ${cueB}.`,
        `Tantangan dalam proses pemulihan adalah bila kamu memperlakukannya sebagai tuntutan perbaikan diri yang tiada akhir dan penuh kritik internal.`,
        `Melihat proses ini sebagai perjalanan yang bertahap menjaga batinmu tetap rileks dan penuh penerimaan.`,
      ];
    }
    return [
      `Integrasi yang utuh terlihat dari kelembutan caramu memperlakukan diri sendiri saat menghadapi kekeliruan atau ketidakpastian.`,
      `Hargai setiap fase pertumbuhan yang telah kamu lewati dengan rasa syukur dan pemahaman yang lapang.`,
      `Rawatlah keutuhan batinmu secara konsisten melalui tindakan nyata yang mencerminkan ${cueC}.`,
    ];
  },

  // 17. talenta-alami (Priority Fixture)
  "talenta-alami": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Di dalam dirimu mengalir bakat alami yang bekerja begitu spontan tanpa membutuhkan ketegangan berlebih untuk memulainya.`,
        `Kapasitas bawaan ini paling nyata tercurah saat kamu mengekspresikan ${cueA}.`,
        `Apa yang terasa mengalir wajar bagimu sering kali merupakan kekuatan bernilai tinggi yang dibutuhkan oleh lingkungan sekitarmu.`,
      ];
    }
    if (p === 2) {
      return [
        `Ketika bakat ini diasah dengan latihan yang tekun, potensimu berkembang menjadi karya berkualitas melalui ${cueB}.`,
        `Tantangan yang sering muncul adalah menganggap remeh kelebihan sendiri atau membandingkan proses belajarmu dengan standar orang lain.`,
        `Bila bakat dibiarkan tanpa wadah disiplin, kapasitas besar ini bisa terhenti sebagai gagasan yang belum sempat dinikmati manfaatnya.`,
      ];
    }
    return [
      `Menghidupkan talenta menuntut komitmen untuk menjadikannya keterampilan yang tahan uji dalam situasi nyata.`,
      `Kurangi keraguan bahwa karyamu belum cukup siap untuk dihadirkan ke ruang publik.`,
      `Beri ruang latihan rutin setiap hari agar bakatmu semakin tajam dan berakar kuat pada ${cueC}.`,
    ];
  },

  // 18. gaya-kerja
  "gaya-kerja": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Ekosistem kerjamu memiliki pola dan dinamika khas agar energimu dapat tercurah secara efektif tanpa gesekan yang tidak perlu.`,
        `Efektivitas kerjamu mencapai puncaknya saat metode dan alur kerjamu berpijak pada ${cueA}.`,
        `Memahami gaya kerja pribadi membantumu membangun batas profesional yang sehat di tengah tuntutan ritme lingkungan yang serba cepat.`,
      ];
    }
    if (p === 2) {
      return [
        `Dalam lingkungan kerja yang selaras, kreativitas dan daya eksekusimu menghasilkan kontribusi yang maksimal melalui ${cueB}.`,
        `Sebaliknya, memaksakan diri bekerja dengan metode yang bertentangan dengan ritmemu akan membuat tenaga cepat habis sebelum hasil tercapai.`,
        `Perhatikan bila muncul kejenuhan karya yang disebabkan oleh kebiasaan mengadopsi cara kerja orang lain tanpa penyesuaian.`,
      ];
    }
    return [
      `Menata alur kerja adalah investasi jangka panjang demi menjaga keberlanjutan hasil karya dan keseimbangan mentalmu.`,
      `Sesuaikan metode kerja dengan kapasitas alami agar produktivitasmu tidak lahir dari kelelahan yang dipaksakan.`,
      `Rancang kembali alur kerjamu hari ini agar lebih selaras dengan prinsip ${cueC}.`,
    ];
  },

  // 19. arah-karya-kontribusi
  "arah-karya-kontribusi": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Karyamu pada hakikatnya adalah sarana untuk meninggalkan jejak manfaat dan makna yang melampaui kepentingan diri semata.`,
        `Panggilan kontribusimu terasa paling hidup saat kamu menyelaraskan karya dengan ${cueA}.`,
        `Kepuasan batin terdalam selalu lahir ketika apa yang kamu kerjakan mampu meringankan beban atau membuka jalan bagi orang lain.`,
      ];
    }
    if (p === 2) {
      return [
        `Ketika karya diarahkan dengan ketulusan, kontribusimu menjadi inspirasi yang memberi dampak nyata bagi lingkungan melalui ${cueB}.`,
        `Namun bila hubungan dengan makna karya memudar, aktivitas profesional dapat terasa mekanis layaknya rutinitas yang hampa.`,
        `Amati apakah ada godaan mengejar pengakuan luar yang tampak gemerlap tetapi mengorbankan panggilan integritas batinmu.`,
      ];
    }
    return [
      `Mengarahkan karya menuntut keteguhan untuk menempatkan nilai kemanusiaan dan kebermanfaatan sebagai ukuran utama keberhasilan.`,
      `Yakinilah bahwa kontribusi yang tulus selalu memiliki tempat dan dampak yang berarti bagi kehidupan sesama.`,
      `Mulailah mewujudkan niat baikmu hari ini ke dalam tindakan nyata yang berlandaskan pada ${cueC}.`,
    ];
  },

  // 20. ekonomi-pola-penghasilan
  "ekonomi-pola-penghasilan": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Hubunganmu dengan sumber daya materi mencerminkan bagaimana kamu menghargai waktu, tenaga, dan keterampilan yang kamu miliki.`,
        `Pola penghasilan yang sehat dan berkelanjutan bagimu bertumpu pada kemampuan mengalirkan ${cueA}.`,
        `Kelimpahan finansial tumbuh subur saat pertukaran nilai yang kamu bangun berpijak pada kejujuran dan saling memberi manfaat.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat sistem pengelolaan keuanganmu tertata dengan bijak, stabilitas materimu semakin kokoh berkat ${cueB}.`,
        `Sebaliknya, ketidakjelasan pencatatan atau manajemen yang tergesa dapat menimbulkan kekhawatiran yang mengganggu fokus kerjamu.`,
        `Pola yang patut diamati adalah apakah ada keraguan dalam menetapkan nilai yang adil atas keahlian dan kontribusi yang kamu berikan.`,
      ];
    }
    return [
      `Membangun kemandirian ekonomi menuntut perpaduan antara ketertiban mengelola angka dan ketenangan mental menghadapi dinamika pasar.`,
      `Ambillah keputusan finansial berdasarkan pertimbangan yang matang, bukan dorongan panik atau gengsi sesaat.`,
      `Perkuat fondasi keuanganmu hari ini dengan merancang pengelolaan yang tertib dan berorientasi pada ${cueC}.`,
    ];
  },

  // 21. money-block (Priority Fixture)
  "money-block": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Dinamika batin seputar sumber daya mencerminkan hubungan antara rasa aman, nilai diri, dan kemampuan mempercayai alir kehidupan.`,
        `Beban atau gesekan finansial biasanya terasa saat kamu berhadapan dengan ${cueA}.`,
        `Pemahaman ini membantu melihat bahwa kecemasan materi sering kali berakar pada kebutuhan emosional yang meminta perhatian jujur.`,
      ];
    }
    if (p === 2) {
      return [
        `Titik rawan yang kerap menguras ketenanganmu berputar di sekitar ${cueB}.`,
        `Pola yang patut kamu amati secara jujur adalah kecenderungan menahan kendali terlalu ketat saat rasa cemas datang, atau sebaliknya menghindari evaluasi angka nyata ketika situasi terasa menekan.`,
        `Ketegangan ini wajar muncul ketika rasa aman batin tanpa sadar disamakan dengan jumlah materi yang terlihat.`,
      ];
    }
    return [
      `Menata hubungan sehat dengan uang menuntut perpaduan antara ketertiban praktis dan penerimaan batin atas rasa cukup.`,
      `Lepaskan keyakinan bahwa membicarakan angka mengurangi ketulusan, atau bahwa memiliki kepastian materi otomatis merusak integritas.`,
      `Mulailah membangun ketenangan finansial hari ini dengan langkah konkret, seperti merapikan catatan atau memperjelas kesepakatan, yang bersandar pada ${cueC}.`,
    ];
  },

  // 22. arah-karier-bidang-sesuai
  "arah-karier-bidang-sesuai": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Jalur profesi yang paling memuaskan bagimu adalah ruang yang mempertemukan kebutuhan nyata dunia kerja dengan keunggulan potensimu.`,
        `Bidang karier yang memberi ruang bertumbuh paling subur berputar di sekitar ${cueA}.`,
        `Kecocokan profesionalmu diukur dari seberapa leluasa autentisitas dan nilaimu dapat mewujud dalam tanggung jawab harian.`,
      ];
    }
    if (p === 2) {
      return [
        `Di panggung karier yang tepat, dedikasi dan keahlianmu terlihat nyata serta memberi nilai tambah melalui ${cueB}.`,
        `Namun bila kamu bertahan di bidang yang tidak lagi selaras semata-mata demi rasa aman semu, energimu akan perlahan menurun.`,
        `Amati apakah rasa enggan mengambil risiko baru sedang menahanmu dari peluang memperluas keahlian ke tingkat berikutnya.`,
      ];
    }
    return [
      `Menemukan jalur karier yang tepat menuntut keberanian menguji kapasitas melalui langkah-langkah nyata yang terukur.`,
      `Mulailah mengeksplorasi peran baru tanpa harus menunggu hilangnya seluruh keraguan dalam pikiran.`,
      `Arahkan fokus profesionalmu hari ini pada langkah nyata yang memperkuat keahlian di bidang ${cueC}.`,
    ];
  },

  // 23. kemampuan-sudah-dimiliki
  "kemampuan-sudah-dimiliki": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Keterampilan yang telah kamu bangun melalui tempaan pengalaman nyata merupakan modal andalan yang siap digunakan kapan saja.`,
        `Kekuatan kompetensimu saat ini berpijak kokoh pada penguasaan ${cueA}.`,
        `Sering kali kamu menganggap remeh keahlian ini hanya karena kamu telah begitu terbiasa melakukannya secara lancar.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat kemampuan ini kamu gunakan secara strategis, kamu mampu mengatasi persoalan rumit dengan tenang melalui ${cueB}.`,
        `Tantangan yang patut diwaspadai adalah rasa cepat puas yang membuat keahlianmu tidak lagi diasah mengikuti perkembangan baru.`,
        `Menjaga keterampilan tetap relevan menuntut keterbukaan untuk terus mengaplikasikannya dalam konteks yang lebih menantang.`,
      ];
    }
    return [
      `Menghargai keahlian yang telah kamu miliki memberimu rasa percaya diri yang berakar kuat untuk menyambut peluang baru.`,
      `Kikis keraguan atas kompetensi diri saat rekam jejakmu telah membuktikan kemampuanmu melewatinya.`,
      `Optimalkan pemanfaatan keahlian utamamu hari ini dengan mengarahkannya pada pencapaian ${cueC}.`,
    ];
  },

  // 24. kemampuan-perlu-dipelajari
  "kemampuan-perlu-dipelajari": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Perluasan kapasitas hidupmu selalu mengundang proses mempelajari keterampilan baru yang memperkaya wawasan dan daya eksekusimu.`,
        `Area pembelajaran yang paling strategis untuk kamu kembangkan saat ini berkaitan erat dengan ${cueA}.`,
        `Menyadari keterbatasan keahlian bukanlah kelemahan, melainkan titik tolak yang jelas untuk memperluas ruang gerakmu.`,
      ];
    }
    if (p === 2) {
      return [
        `Kesediaanmu untuk kembali menjadi pembelajar membuka pintu bagi peluang-peluang segar yang belum terbayangkan sebelumnya berkat ${cueB}.`,
        `Namun bila kekhawatiran terlihat canggung menahan langkahmu, proses belajar bisa tertunda oleh alasan kesibukan yang dibuat-buat.`,
        `Menerima fase adaptasi awal sebagai proses alami membantumu menikmati setiap tahapan belajar dengan gembira.`,
      ];
    }
    return [
      `Pertumbuhan yang berkesinambungan membutuhkan kerendahan hati untuk terus berlatih tanpa terbebani tuntutan instan.`,
      `Fokuskan perhatian pada kemajuan bertahap daripada mencemaskan hasil akhir yang belum terlihat.`,
      `Pilihlah satu keterampilan prioritas hari ini dan tekuni latihannya dengan berpedoman pada ${cueC}.`,
    ];
  },

  // 25. kebutuhan-emosional-relasi
  "kebutuhan-emosional-relasi": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Rasa aman dan keterikatan yang hangat dalam hubungan memerlukan ruang penerimaan di mana kerapuhanmu dapat diterima dengan tulus.`,
        `Kenyamanan emosionalmu dalam relasi sangat dipengaruhi oleh adanya ruang bagi ${cueA}.`,
        `Ketika kebutuhan ini diakui secara jujur, hubungan menjadi pelabuhan teduh tempat batinmu beristirahat dan bertumbuh bersama.`,
      ];
    }
    if (p === 2) {
      return [
        `Dalam relasi yang sehat, keterbukaan hatimu menghadirkan kedekatan yang menenangkan melalui ${cueB}.`,
        `Namun bila kebutuhan ini dipendam terlalu lama, rasa sepi di tengah kebersamaan dapat memicu kesalahpahaman dengan pasangan.`,
        `Pola yang layak diamati adalah apakah ada kebiasaan berharap pasangan menebak isi hatimu tanpa kamu menyampaikannya secara langsung.`,
      ];
    }
    return [
      `Mengomunikasikan kebutuhan emosional secara jelas dan tenang adalah tanda kedewasaan cinta yang menyejukkan.`,
      `Bicarakan harapanmu dengan kelembutan tanpa menyertakan tuntutan atau praduga yang membebani suasana.`,
      `Rawatlah keintiman hubunganmu hari ini dengan menyampaikan perasaan secara tulus melalui ${cueC}.`,
    ];
  },

  // 26. memberi-menerima-cinta
  "memberi-menerima-cinta": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Pertukaran kasih dalam hubungan bekerja seperti ritme tarikan dan hembusan napas yang perlu terjaga keseimbangannya agar tidak melelahkan.`,
        `Caramu mencurahkan kepedulian dan kehangatan secara alami mengalir melalui ${cueA}.`,
        `Keseimbangan antara memberi dan menerima adalah seni batin yang melindungi hubungan dari rasa jenuh dan keletihan emosional.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat aliran kasih bergerak secara timbal balik, kebahagiaan yang kamu rasakan berlipat ganda berkat ${cueB}.`,
        `Namun bila kamu terbiasa selalu memberi tanpa mengizinkan dirimu menerima dukungan, perlahan batinmu bisa merasa terkuras.`,
        `Amati apakah ada rasa canggung saat orang lain menawarkan pertolongan atau perhatian yang tulus kepadamu.`,
      ];
    }
    return [
      `Menerima kasih sayang dengan tangan terbuka menuntut keyakinan bahwa dirimu layak dicintai tanpa harus terus membuktikan jasamu.`,
      `Izinkan orang-orang terdekatmu menunjukkan kepedulian mereka dengan cara mereka sendiri.`,
      `Buka ruang batinmu untuk menerima kebaikan hari ini sembari membumikan kasihmu pada ${cueC}.`,
    ];
  },

  // 27. pola-ketertarikan-pasangan
  "pola-ketertarikan-pasangan": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Daya tarik yang kamu rasakan terhadap figur tertentu sering kali dipengaruhi oleh nilai dan kualitas batin yang sedang ingin kamu pahami lebih dalam.`,
        `Perhatianmu secara alami terpikat pada pribadi yang membangkitkan dinamika seputar ${cueA}.`,
        `Belajar membedakan antara ketertarikan sesaat dan kecocokan nilai yang menenangkan adalah tanda kematangan dalam memilih pasangan.`,
      ];
    }
    if (p === 2) {
      return [
        `Ketika pilihan pasangan didasari oleh kesadaran yang matang, hubungan berkembang menjadi ruang pertumbuhan bersama berkat ${cueB}.`,
        `Namun bila ketertarikan hanya digerakkan oleh dinamika yang penuh gejolak emosi, relasi bisa terasa melelahkan dalam jangka panjang.`,
        `Amati apakah ada kecenderungan mengartikan rasa cemas dan ketidakpastian sebagai tanda kedalaman cinta.`,
      ];
    }
    return [
      `Memilih pasangan hidup yang tepat adalah keputusan sadar yang memadukan kehangatan rasa dan pertimbangan akal sehat.`,
      `Carilah hubungan yang menghadirkan rasa tenang dan ruang untuk saling mendukung tujuan hidup masing-masing.`,
      `Evaluasilah dinamika relasimu dengan melihat apakah ia membawa kedamaian nyata yang berpijak pada ${cueC}.`,
    ];
  },

  // 28. konflik-komunikasi-batas
  "konflik-komunikasi-batas": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Perbedaan pandangan dalam hubungan merupakan kesempatan wajar untuk memperdalam pemahaman timbal balik dan memperjelas batasan pribadi.`,
        `Caramu menyampaikan ketidaksetujuan saat ketegangan muncul sangat dipengaruhi oleh bagaimana kamu menjaga ${cueA}.`,
        `Keberanian menetapkan batas yang jelas dengan bahasa yang tenang adalah pelindung utama dari keharmonisan jangka panjang.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat percakapan sulit dihadapi dengan kepala dingin, kejujuran yang disampaikan secara santun justru mempererat ikatan berkat ${cueB}.`,
        `Sebaliknya, bila sikap defensif menguasai percakapan, kata-kata yang tergesa dapat meninggalkan luka yang membutuhkan waktu untuk pulih.`,
        `Kebiasaan menunda pembicaraan penting atau mendiamkan masalah berisiko menumpuk ganjalan emosi yang tidak sehat.`,
      ];
    }
    return [
      `Menyampaikan batas diri menuntut ketegasan yang dibungkus dengan rasa hormat pada lawan bicara.`,
      `Sampaikan hal yang kamu butuhkan dengan bahasa yang lugas tanpa perlu menyindir atau menyalahkan karakter pasangan.`,
      `Latihlah komunikasi yang jernih dan menenangkan hari ini dengan bersandar pada prinsip ${cueC}.`,
    ];
  },

  // 29. love-block-pola-berulang (Priority Fixture)
  "love-block-pola-berulang": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Hambatan dalam kedekatan emosional sering kali berakar pada mekanisme pertahanan yang terbentuk untuk melindungi hati dari rasa terluka.`,
        `Benteng batin ini cenderung aktif ketika dinamika kedekatan menyentuh ${cueA}.`,
        `Mengenali respons perlindungan ini membuka pintu bagi keintiman yang lebih jujur tanpa harus mengorbankan rasa aman.`,
      ];
    }
    if (p === 2) {
      return [
        `Tantangan relasional yang paling sering berulang muncul dalam bentuk ${cueB}.`,
        `Perhatikan apakah ada kecenderungan untuk menarik diri atau mencari-cari kekurangan situasi saat relasi menuntut komitmen yang lebih dalam.`,
        `Pola ini bukanlah cela kepribadian, melainkan sinyal bahwa ruang batinmu sedang membutuhkan rasa aman sebelum berani melangkah lebih jauh.`,
      ];
    }
    return [
      `Membuka diri dalam relasi menuntut keberanian untuk merangkul kerentanan sebagai bagian wajar dari cinta yang bertumbuh.`,
      `Yang perlu dilatih adalah menyampaikan batas dan harapan secara jelas sebelum prasangka mengambil alih.`,
      `Latihlah keterbukaan yang sehat hari ini dengan mengambil inisiatif komunikasi terbuka yang mengedepankan ${cueC}.`,
    ];
  },

  // 30. arah-relasi-matang
  "arah-relasi-matang": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Hubungan yang matang adalah perjumpaan dua pribadi utuh yang memilih berjalan bersama tanpa menghilangkan ruang kebebasan dan keaslian masing-masing.`,
        `Arah kedewasaan relasimu berkembang paling indah saat kebersamaan dilandasi oleh ${cueA}.`,
        `Cinta yang dewasa tidak mengekang gerak pribadi, melainkan menyediakan tanah subur bagi kedua pihak untuk mekar secara seimbang.`,
      ];
    }
    if (p === 2) {
      return [
        `Dalam kemitraan yang saling menghargai, kerja sama dan dukungan timbal balik terwujud secara harmonis melalui ${cueB}.`,
        `Namun bila relasi bergeser menjadi ajang pemaksaan kehendak atau ketergantungan sepihak, kehangatan hubungan akan perlahan memudar.`,
        `Melihat dinamika relasi secara objektif membantumu merawat hubungan yang sehat dan melepaskan pola interaksi yang tidak membangun.`,
      ];
    }
    return [
      `Membangun relasi yang dewasa menuntut kesediaan sehari-hari untuk merawat rasa hormat, kejujuran, dan komunikasi terbuka.`,
      `Hindari membebankan seluruh kebahagiaan pribadimu ke pundak pasangan tanpa merawat kebahagiaan batinmu sendiri.`,
      `Perkuat fondasi hubunganmu hari ini dengan membangun kesepakatan bersama yang bersandar pada ${cueC}.`,
    ];
  },

  // 31. peta-chakra
  "peta-chakra": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Kondisi tubuh fisikmu mencerminkan bagaimana energi batin dan respons emosional mengalir dalam menghadapi pengalaman hidup.`,
        `Keselarasan pusat-pusat energimu berdenyut paling seimbang saat kamu merawat keharmonisan ${cueA}.`,
        `Sensasi ketegangan atau kelegaan di area tubuh tertentu memberi petunjuk lembut mengenai dinamika batin yang sedang berlangsung.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat aliran energi tubuh bergerak lancar tanpa hambatan, vitalitas dan kebugaranmu terasa ringan melalui ${cueB}.`,
        `Namun bila keletihan pikiran menumpuk tanpa jeda, pusat energi tertentu dapat terasa tegang sebagai sinyal agar kamu melambat.`,
        `Mendengarkan bahasa tubuh ini secara tenang membantumu mengambil tindakan perawatan diri sebelum tubuh mengalami kelelahan yang nyata.`,
      ];
    }
    return [
      `Menjaga keselarasan energi tubuh adalah praktik merawat diri dengan penuh perhatian tanpa perlu merasa panik atas sensasi yang timbul.`,
      `Luangkan waktu untuk bernapas dalam dan menyadari kehadiran fisikmu dengan penuh kelembutan.`,
      `Alirkan ketenangan ke seluruh tubuhmu hari ini dengan menyelaraskan perhatian pada ${cueC}.`,
    ];
  },

  // 32. sistem-cerna
  "sistem-cerna": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Caramu mengolah asupan makanan berhubungan erat dengan caramu mencerna tekanan dan pengalaman emosional sehari-hari.`,
        `Keseimbangan pencernaanmu sangat peka terhadap suasana batin yang berkaitan dengan ${cueA}.`,
        `Area perut kerap menjadi pusat pertama yang merasakan ketegangan saat kamu memaksakan diri menghadapi situasi yang belum sempat kamu olah dengan baik.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat pencernaanmu berada dalam ritme yang tenang, energi terserap optimal untuk menopang seluruh aktivitasmu melalui ${cueB}.`,
        `Namun bila kamu makan dalam kondisi terburu-buru atau cemas, tubuhmu akan merespons melalui rasa tidak nyaman pada pencernaan.`,
        `Amati apakah ada kebiasaan melampiaskan ketegangan pikiran melalui pola makan yang tidak teratur.`,
      ];
    }
    return [
      `Merawat kesehatan pencernaan menuntut suasana tenang dan perhatian penuh saat menikmati hidangan sehari-hari.`,
      `Hindari membicarakan topik yang memicu ketegangan saat momen makan sedang berlangsung.`,
      `Berikan jeda yang cukup bagi tubuhmu untuk mencerna dengan baik hari ini sembari menjaga ritme ${cueC}.`,
    ];
  },

  // 33. lingkungan-ideal
  "lingkungan-ideal": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Ruang fisik di sekitarmu, penataan ruangan, pencahayaan, dan tingkat kebisingan memiliki pengaruh langsung pada sistem saraf dan fokusmu.`,
        `Kenyamanan spasialmu terpenuhi secara optimal ketika suasana tempat tinggal dan ruang kerjamu mendukung ${cueA}.`,
        `Lingkungan yang tertata rapi mengundang kejernihan berpikir, sedangkan ruang yang terlalu padat dapat menguras energimu tanpa disadari.`,
      ];
    }
    if (p === 2) {
      return [
        `Dalam atmosfer ruangan yang selaras, konsentrasi dan pemulihan energimu berlangsung dengan sangat lancar berkat ${cueB}.`,
        `Sebaliknya, bertahan terlalu lama di lingkungan yang bising atau penuh kekacauan visual dapat membuat tubuhmu terus berada dalam kewaspadaan tinggi.`,
        `Menata ruang hidup secara berkala adalah langkah sederhana yang memberi dampak besar bagi ketenangan pikiranmu.`,
      ];
    }
    return [
      `Menciptakan ruang yang ideal tidak harus menunggu tempat yang sempurna, melainkan menata satu sudut hening yang nyaman bagimu.`,
      `Rapikan barang-barang yang tidak lagi kamu gunakan agar pandangan dan ruangan terasa lebih lapang.`,
      `Hadirkan suasana yang mendukung kedamaian batinmu hari ini dengan menata lingkungan sesuai kebutuhan ${cueC}.`,
    ];
  },

  // 34. ritme-tubuh
  "ritme-tubuh": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Jam biologis tubuhmu memiliki kearifan alami yang mengatur siklus terjaga, beraktivitas, dan beristirahat secara selaras.`,
        `Keselarasan stamina fisikmu membutuhkan kedisiplinan lembut dalam menjaga keteraturan ${cueA}.`,
        `Menghargai tempo biologis ini menjaga energimu tetap stabil sepanjang hari tanpa perlu bergantung pada pemaksaan tenaga yang berlebihan.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat kamu menjalani hari selaras dengan ritme tubuh, kualitas istirahatmu memulihkan kesegaran raga secara mendalam melalui ${cueB}.`,
        `Namun bila jam istirahat terus dikorbankan demi mengejar kesibukan, stamina fisik dan kejernihan pikiranmu akan cepat menurun.`,
        `Amati bila muncul kebiasaan menuntut tubuh bekerja melampaui batas wajarnya tanpa memberi waktu pemulihan yang sepadan.`,
      ];
    }
    return [
      `Menjaga ritme biologis memerlukan kebiasaan tidur dan bangun pada waktu yang konsisten setiap hari.`,
      `Kurangi paparan layar dan rangsangan pikiran yang berlebihan menjelang waktu tidur malam.`,
      `Pulihkan keharmonisan fisikmu hari ini dengan membiasakan pola istirahat yang bersandar pada ${cueC}.`,
    ];
  },

  // 35. energi-dominan
  "energi-dominan": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Di antara ragam potensi yang kamu miliki, terdapat kualitas energi utama yang paling mewarnai kehadiranmu dan memengaruhi suasana sekitarmu.`,
        `Getaran dominan yang kamu pancarkan dalam perjumpaan berakar kuat pada ${cueA}.`,
        `Kualitas kehadiran ini sering kali membuat orang lain merasa tenang, terinspirasi, atau tergerak saat berada di dekatmu.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat energi dominan ini berada dalam kejernihan yang tulus, pengaruh positifmu mengalir dengan sangat alami melalui ${cueB}.`,
        `Namun saat energimu terselubung oleh kelelahan atau kekhawatiran, suasana yang terpancar dapat terasa menuntut atau menimbulkan jarak.`,
        `Menjaga kejernihan energi pribadi membantumu berinteraksi tanpa harus menyerap emosi sekitar secara berlebihan.`,
      ];
    }
    return [
      `Merawat kemurnian energimu menuntut kebiasaan melepaskan ketegangan dan meluangkan waktu hening secara teratur.`,
      `Bedakan antara kepedulian yang tulus dan kebiasaan memikul beban emosi yang bukan menjadi tanggung jawabmu.`,
      `Pancarkan kualitas terbaikmu ke dunia hari ini dengan menyelaraskan kesadaranmu pada ${cueC}.`,
    ];
  },

  // 36. jalur-spiritual
  "jalur-spiritual": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Perjalanan batinmu bukanlah upaya menjauhi kenyataan duniawi, melainkan menemukan kedalaman makna dalam kehidupan yang membumi.`,
        `Pintu gerbang pencarian spiritualitasmu terbuka paling luas saat kamu merenungi ${cueA}.`,
        `Hubunganmu dengan Yang Maha Kuasa bertumbuh melalui kejujuran nurani dan ketulusan sikap dalam menghadapi setiap peristiwa.`,
      ];
    }
    if (p === 2) {
      return [
        `Dalam keheningan yang jujur, kedamaian spiritual menjadi pemandu yang menuntun keputusan hidupmu berkat ${cueB}.`,
        `Namun bila wawasan batin dipakai sebagai pelarian dari tanggung jawab harian, pertumbuhan jiwamu dapat kehilangan pijakan realitasnya.`,
        `Kematangan spiritual sejati selalu tercermin dari kerendahan hati dan kepedulian nyata kepada sesama.`,
      ];
    }
    return [
      `Menghidupkan nilai spiritual menuntut penerapannya ke dalam sikap welas asih dan integritas dalam tindakan kecil sehari-hari.`,
      `Hindari kebutuhan memperdebatkan kebenaran pandangan batinmu dengan orang lain.`,
      `Bumikan pemahaman jiwamu hari ini menjadi tindakan nyata yang penuh kehangatan melalui ${cueC}.`,
    ];
  },

  // 37. evolusi-jiwa
  "evolusi-jiwa": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Perjalanan jiwamu di dunia ini adalah proses pembelajaran berkelanjutan untuk mematangkan kesadaran dan memperluas kapasitas kasih melalui pengalaman nyata.`,
        `Arah kedewasaan batinmu saat ini sedang dipanggil untuk melampaui ${cueA}.`,
        `Setiap tantangan dan peralihan fase kehidupan merupakan sarana yang memperkaya kearifan jiwamu.`,
      ];
    }
    if (p === 2) {
      return [
        `Ketika kamu menyikapi peristiwa hidup sebagai ruang belajar yang berharga, jiwamu bertumbuh dengan keteguhan yang matang melalui ${cueB}.`,
        `Sebaliknya, bila perubahan ditolak dengan mencengkeram kebiasaan lama, perjalanan hidup bisa terasa lebih berat dari yang semestinya.`,
        `Kesediaan melepaskan cara pandang yang usang membuka jalan bagi lahirnya pemahaman diri yang lebih luas.`,
      ];
    }
    return [
      `Menyelaraskan diri dengan evolusi jiwa memerlukan keterbukaan hati untuk terus belajar dari setiap perjumpaan.`,
      `Hargai garis waktu pertumbuhan pribadimu tanpa perlu membandingkannya dengan perjalanan orang lain.`,
      `Sambutlah babak kedewasaan barumu hari ini dengan melangkah mantap bersama bimbingan ${cueC}.`,
    ];
  },

  // 38. potensi-spiritual
  "potensi-spiritual": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Di dalam keheningan batinmu tersimpan benih kepekaan spiritual yang siap berkembang melalui latihan kesadaran yang tekun.`,
        `Potensi batin ini paling mudah terakses saat pikiranmu berada dalam ketenangan dan selaras dengan ${cueA}.`,
        `Kamu memiliki kepekaan untuk menangkap makna halus kehidupan yang sering kali luput dari pengamatan tergesa-gesa.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat kepekaan ini diarahkan bagi kebaikan dan kedamaian bersama, wawasan batinmu mengalir jernih berkat ${cueB}.`,
        `Namun bila potensi ini didekati sekadar untuk memuaskan rasa penasaran intelektual semata, energimu dapat menjadi tidak seimbang.`,
        `Menjaga pijakan yang kokoh pada realitas praktis memastikan kepekaan batinmu tetap sehat dan berguna.`,
      ];
    }
    return [
      `Mengembangkan potensi batin menuntut disiplin menjaga kemurnian niat dan keteraturan hidup sehari-hari.`,
      `Fokuskan latihan pada pembentukan karakter yang luhur dan etika pergaulan yang baik sebelum mengejar wawasan yang lebih jauh.`,
      `Bina potensi batinmu secara membumi hari ini dengan menambatkannya pada ${cueC}.`,
    ];
  },

  // 39. bakat-spiritual
  "bakat-spiritual": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Bakat batin yang kamu miliki adalah amanah khusus yang dianugerahkan untuk melayani kebaikan dan ketenangan dalam kehidupan bersama.`,
        `Kapasitas halus ini beroperasi secara jernih melalui ${cueA}.`,
        `Bakat ini merupakan sarana untuk menebarkan manfaat dengan penuh kerendahan hati dalam pergaulan sehari-hari.`,
      ];
    }
    if (p === 2) {
      return [
        `Ketika bakat ini kamu baktikan bagi kebaikan sesama, kehadiranmu membawa rasa sejuk dan kejernihan bagi sekitarmu berkat ${cueB}.`,
        `Namun bila keraguan diri atau kekhawatiran akan penilaian lingkungan menyusup, kejernihan bakatmu dapat terhalang oleh keraguan batin.`,
        `Mengembangkan keyakinan yang tenang dan rasional membantu bakatmu berkembang secara wajar dan terlindungi.`,
      ];
    }
    return [
      `Merawat bakat batin menuntut perlindungan energi yang sehat agar kamu tidak menyerap beban emosi lingkungan tanpa batas.`,
      `Gunakan kapasitasmu secara bijaksana dengan tetap menjaga keseimbangan hidup pribadi.`,
      `Latihlah bakat batinmu dengan ketenangan dan kepedulian yang berakar pada ${cueC}.`,
    ];
  },

  // 40. jejak-intuisi
  "jejak-intuisi": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Suara intuisimu berbicara bukan lewat desakan yang riuh, melainkan lewat isyarat tubuh yang hening dan firasat jernih yang hadir spontan.`,
        `Petunjuk batinmu paling sering menampakkan diri seputar hal yang berkaitan dengan ${cueA}.`,
        `Mengenali perbedaan antara kecemasan emosional yang terburu-buru dan intuisi sejati yang tenang adalah kunci navigasi hidupmu.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat kamu mempercayai dan menindaklanjuti isyarat intuisi ini, langkah-langkahmu terhindar dari kekeliruan berkat ${cueB}.`,
        `Sebaliknya, bila kamu selalu meragukan firasat awal dan menuntut pembuktian rumit atas segala hal, kepekaan batinmu dapat perlahan meredup.`,
        `Sering kali kamu baru menyadari kebenaran firasat awalmu setelah peristiwa telah berlangsung.`,
      ];
    }
    return [
      `Mengasah intuisi menuntut ruang hening harian yang bebas dari kebisingan opini luar.`,
      `Belajarlah mempercayai sinyal tubuh saat ia memberi rasa lapang atau peringatan halus terhadap suatu pilihan.`,
      `Perhatikan isyarat intuisi yang kamu terima hari ini dan buktikan kejeliannya melalui ${cueC}.`,
    ];
  },

  // 41. potensi-channeling
  "potensi-channeling": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Batinmu memiliki keterbukaan alami untuk menangkap inspirasi kreatif dan wawasan kebijaksanaan yang mengalir dari perenungan mendalam.`,
        `Kanal penerimaan batinmu bekerja paling jernih saat keadaan jiwamu selaras dengan ${cueA}.`,
        `Menjadi wadah inspirasi yang bersih menuntut kejernihan pikiran dan ketulusan hati agar wawasan yang hadir tidak terdistorsi oleh ambisi pribadi.`,
      ];
    }
    if (p === 2) {
      return [
        `Dalam suasana batin yang seimbang, wawasan yang kamu bagikan mampu menyentuh hati dan membuka pemahaman orang lain melalui ${cueB}.`,
        `Namun bila energimu sedang letih atau didorong oleh keinginan mencari pembuktian diri, inspirasi yang mengalir bisa kehilangan ketajamannya.`,
        `Memahami bahwa kebijaksanaan sejati melayani kebaikan bersama membantumu menyampaikan wawasan dengan penuh kerendahan hati.`,
      ];
    }
    return [
      `Menjaga kejernihan penerimaan batin menuntut tubuh yang bugar, pikiran yang tertata, dan keteguhan berpijak pada kehidupan nyata.`,
      `Gunakan wawasan batin sebagai pemandu tindakan yang membawa manfaat praktis bagi sesama.`,
      `Wujudkan wawasan yang kamu peroleh menjadi karya nyata hari ini dengan berpedoman pada ${cueC}.`,
    ];
  },

  // 42. soul-mission (Priority Fixture)
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
        `Langkah nyata menuju panggilan ini terasa semakin mantap saat kamu melatih ${cueB} di tengah dinamika harian.`,
        `Bila panggilan ini terabaikan demi kenyamanan sesaat, rasa jenuh atau hampa dapat hadir sebagai pengingat lembut bahwa ada bagian potensimu yang sedang rindu untuk dibagikan.`,
        `Risiko yang patut diwaspadai adalah mengukur keberhasilan semata dari validasi luar sehingga arah sejati kabur.`,
      ];
    }
    return [
      `Membumikan misi jiwa tidak harus menunggu momen besar yang dramatis, melainkan dimulai dari ketulusan melayani dalam tanggung jawab kecil setiap hari.`,
      `Yang perlu dilepaskan adalah anggapan bahwa kontribusimu harus spektakuler sebelum dianggap berharga.`,
      `Teguhkan niat pengabdian jiwamu hari ini dengan mendedikasikan waktu dan perhatian nyata untuk ${cueC}.`,
    ];
  },

  // 43. soul-gifts
  "soul-gifts": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Karunia jiwa yang kamu bawa lahir merupakan anugerah murni dari perjalanan kesadaranmu yang siap menjadi berkah bagi sesama.`,
        `Kekuatan esensial ini memancar paling terang saat kamu mengekspresikan ${cueA}.`,
        `Karunia ini mempertemukan kebahagiaan batin pribadimu dengan kebutuhan nyata lingkungan yang membutuhkan dukungan.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat karunia jiwa ini kamu curahkan dengan ketulusan, kehadiranmu menjadi inspirasi yang menyejukkan bagi sekitarmu melalui ${cueB}.`,
        `Namun bila karunia ini kamu simpan rapat-rapat karena ragu akan nilainya, energimu bisa terasa terhambat dan kurang berkembang.`,
        `Mengalirkan karunia ini dengan niat melayani kebaikan menjaga sinarnya tetap hangat dan murni.`,
      ];
    }
    return [
      `Membagikan karunia batin menuntut kelapangan hati untuk membiarkan kebaikan mengalir tanpa terbebani ekspektasi pengakuan luar.`,
      `Yakinilah bahwa apa yang kamu berikan secara tulus memiliki nilai yang berharga bagi orang yang menerimanya.`,
      `Salurkan anugerah jiwamu hari ini ke dalam tindakan nyata yang bermanfaat melalui ${cueC}.`,
    ];
  },

  // 44. soul-lessons
  "soul-lessons": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Kurikulum pembelajaran jiwamu di dunia ini dirancang untuk mematangkan kesadaran dan menumbuhkan kebijaksanaan hidup yang berakar kuat.`,
        `Tema pembelajaran batin yang paling berulang dalam perjalananmu berpusat di sekitar ${cueA}.`,
        `Ujian kehidupan hadir bukan untuk melemahkanmu, melainkan untuk melatih ketabahan dan kedewasaan batinmu agar semakin kokoh.`,
      ];
    }
    if (p === 2) {
      return [
        `Setiap kali kamu menyikapi tantangan ini dengan kedewasaan, jiwamu melangkah menuju kebebasan batin yang lebih luas melalui ${cueB}.`,
        `Namun bila kesulitan hanya ditanggapi dengan rasa kecewa dan menyalahkan situasi, pelajaran yang sama dapat terasa semakin berat.`,
        `Menyambut setiap peristiwa sebagai cermin pembelajaran membantumu melangkah dengan hati yang lebih lapang.`,
      ];
    }
    return [
      `Memahami pelajaran jiwa menuntut kerendahan hati untuk menerima setiap dinamika hidup sebagai ruang bertumbuh.`,
      `Ubahlah sudut pandang dari meratapi kesulitan menjadi menangkap hikmah berharga di balik setiap pengalaman.`,
      `Selesaikan tantangan kesadaranmu hari ini dengan mengambil pilihan yang lebih bijak berlandaskan pada ${cueC}.`,
    ];
  },

  // 45. soul-shadow
  "soul-shadow": (cueA, cueB, cueC, p) => {
    if (p === 1) {
      return [
        `Di balik setiap potensi jiwa yang besar selalu terdapat ruang bayangan yang terbentuk ketika energi batin terdistorsi oleh rasa takut atau luka lama.`,
        `Sisi bayangan dari dinamika jiwamu paling mudah terpancing saat kamu berhadapan dengan ${cueA}.`,
        `Sisi bayangan ini bukanlah musuh yang harus disingkirkan, melainkan bagian dari energimu yang sedang meminta penerimaan dan integrasi yang matang.`,
      ];
    }
    if (p === 2) {
      return [
        `Saat kamu berani memeluk sisi rentan ini dengan kesadaran penuh kasih, energi yang tadinya membebani berbalik menjadi daya transformasi yang menyejukkan melalui ${cueB}.`,
        `Namun bila bayangan ini disangkal atau ditolak, ia dapat muncul ke permukaan dalam bentuk reaksi emosional yang menimbulkan rasa sesal.`,
        `Amati apakah ada kecenderungan memproyeksikan kekurangan diri kepada orang lain saat kamu merasa terpojok.`,
      ];
    }
    return [
      `Mengintegrasikan bayangan jiwa menuntut keberanian untuk menatap kerapuhan diri sendiri dengan kejujuran yang bebas dari penghakiman.`,
      `Akuilah keterbatasan manusiawimu dengan kelegaan dan penerimaan yang tulus.`,
      `Bawalah seluruh bagian dirimu kembali ke dalam pelukan kesadaran hari ini melalui kearifan ${cueC}.`,
    ];
  },
};

function buildParagraphSentences(
  reading: ArsipAkashiReadingDef,
  paragraphIndex: number,
  purpose: ReturnType<typeof readingPurpose>,
  themes: string[],
  factCues: string[],
  usedCues?: Set<string>,
): string[] {
  const domainA = DOMAIN_MEANINGS[reading.allowedDomains[0]] ?? DOMAIN_MEANINGS.growth;
  const domainB = DOMAIN_MEANINGS[reading.allowedDomains[1] ?? reading.allowedDomains[0]] ?? DOMAIN_MEANINGS.growth;
  let cueA = factCues.find((c) => !usedCues?.has(c)) ?? factCues[0] ?? domainA.core;
  if (paragraphIndex === 1 && usedCues) usedCues.add(cueA);

  let cueB = factCues.find((c) => c !== cueA && !usedCues?.has(c)) ?? domainB.strength ?? domainA.strength;
  if (cueB === cueA) {
    cueB = domainB.daily ?? domainA.daily;
  }
  if (paragraphIndex === 2 && usedCues) usedCues.add(cueB);

  let cueC = factCues.find((c) => c !== cueA && c !== cueB && !usedCues?.has(c)) ?? purpose.application;
  if (cueC === cueA || cueC === cueB) {
    cueC = purpose.application;
  }
  if (paragraphIndex === 3 && usedCues) usedCues.add(cueC);

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
  const usedCuesInReading = new Set<string>();

  for (let paragraphIndex = 1; paragraphIndex <= 3; paragraphIndex++) {
    const selectedFacts = selectReadingFacts(model, reading, paragraphIndex);
    const selectedFactIds = selectedFacts.map((fact) => fact.factId);
    const contributingSystems = [...new Set(selectedFacts.map((fact) => fact.systemId))].sort();
    const domains = [...new Set(selectedFacts.map((fact) => fact.domain))];
    const semanticThemes = semanticThemesFor(reading, domains.length ? domains : reading.allowedDomains, paragraphIndex);
    const factCues = selectedFacts
      .map((fact, index) => humanizeFactCue(fact.value, fact.systemId, fact.domain, semanticThemes[index % semanticThemes.length] ?? reading.allowedDomains[index % reading.allowedDomains.length], reading.readingId))
      .filter(Boolean);
    const sentences = buildParagraphSentences(reading, paragraphIndex, purpose, semanticThemes, factCues, usedCuesInReading).map(sanitizeVisible);
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
