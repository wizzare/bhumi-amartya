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
    { title: "SHADOW", body: `${entry.shadow} Ketika ${entry.title} berlebihan, pola ini dapat membuatmu mengabaikan batas, memaksakan kontrol, atau menjauh dari kebutuhan yang sebenarnya. Pola menghindar dalam ${entry.title} biasanya muncul saat rasa amanmu terganggu. Dampaknya dapat terasa pada relasi, pekerjaan, tubuh, atau cara kamu menilai dirimu sendiri melalui tema ${entry.title}.` },
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
  const cleaned = sanitizeVisible(value)
    .toLowerCase()
    .replace(/[_/|:;]+/g, " ")
    .replace(/\b(undefined|null|unknown|unavailable|nan)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(/\s+/).filter((word) => word.length > 2);
  if (words.length >= 3) return words.slice(0, 9).join(" ");
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
      fact.interpretationEligibility,
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

  return reading.allowedDomains.slice(0, 3).map((domain, index) => ({
    factId: `semantic-fallback/${reading.readingId}/${domain}/${index}`,
    systemId: (reading.preferredSystems[index % Math.max(1, reading.preferredSystems.length)] ?? reading.allowedSystems[index % Math.max(1, reading.allowedSystems.length)] ?? "numerology") as typeof reading.allowedSystems[number],
    domain,
    value: chooseSemanticTheme(domain, `${model.deterministicKey}:${reading.readingId}:${paragraphIndex}:${domain}:${index}`),
    interpretationEligibility: true,
    sourcePath: "semantic-fallback",
    sourceVersion: "v1",
    stabilityType: "partial-data-theme",
    warnings: [],
  }));
}

function semanticThemesFor(reading: ArsipAkashiReadingDef, domains: string[], paragraphIndex: number): string[] {
  return domains.slice(0, 3).map((domain, offset) => {
    const meaning = DOMAIN_MEANINGS[domain] ?? DOMAIN_MEANINGS.growth;
    const key = paragraphIndex === 1 ? meaning.core : paragraphIndex === 2 ? meaning.daily : paragraphIndex === 3 ? meaning.strength : paragraphIndex === 4 ? meaning.shadow : meaning.integration;
    return sanitizeVisible(`${visibleReadingName(reading)}: ${key} ${offset === 0 ? "" : "dari sisi pendukung"}`.trim());
  });
}

function buildParagraphSentences(
  reading: ArsipAkashiReadingDef,
  paragraphIndex: number,
  purpose: ReturnType<typeof readingPurpose>,
  themes: string[],
  factCues: string[],
): string[] {
  const domainA = DOMAIN_MEANINGS[reading.allowedDomains[0]] ?? DOMAIN_MEANINGS.growth;
  const domainB = DOMAIN_MEANINGS[reading.allowedDomains[1] ?? reading.allowedDomains[0]] ?? DOMAIN_MEANINGS.growth;
  const name = visibleReadingName(reading);
  const cueA = factCues[0] ?? domainA.core;
  const cueB = factCues[1] ?? domainB.core;
  const cueC = factCues[2] ?? purpose.application;
  if (paragraphIndex === 1) {
    return [
      `Bacaan ${name} membaca ${purpose.purpose} melalui ${domainA.core} yang terhubung dengan ${cueA}.`,
      `Pada bacaan ${name}, pola dominan terlihat sebagai ${themes[0].replace(`${name}: `, "")} dengan jejak ${cueA}.`,
      `Tegangan utama ${name} berada di antara ${domainA.integration}, ${domainB.shadow}, dan tanda ${cueB}.`,
      `Bagian ${name} penting karena ${purpose.activation} sering bertemu dengan ${cueB} sebelum kamu menyadarinya.`,
      `Ia ${purpose.distinction} melalui cara ${cueC} membentuk pilihan kecilmu.`,
    ];
  }
  if (paragraphIndex === 2) {
    return [
      `Dalam keseharian, ${name} muncul lewat ${domainA.daily} yang dipertegas oleh ${cueA}.`,
      `Pola ${name} biasanya aktif ketika ${purpose.activation} dan tanda ${cueA} meminta jawaban yang lebih cepat.`,
      `Keputusan dalam ${name} ikut dibentuk oleh ${domainB.daily} serta ${cueB}, sehingga respons pertama tidak selalu sama dengan kebutuhan terdalam.`,
      `Orang lain dapat merasakan ${name} sebagai cara kamu mengatur jarak, tempo, bahasa, atau komitmen saat ${cueB} ikut bekerja.`,
      `Tempat paling terlihat dari ${name} adalah momen kecil ketika ${purpose.application} dan ${cueC} hadir bersamaan.`,
    ];
  }
  if (paragraphIndex === 3) {
    return [
      `Kekuatan matang dari ${name} adalah ${domainA.strength} yang mendapat bentuk dari ${cueA}.`,
      `Saat sehat, ${name} membuatmu mampu memakai ${domainB.strength} sambil merespons ${cueA} tanpa membesar-besarkan peranmu.`,
      `Kontribusi ${name} terlihat ketika kamu mengubah pemahaman tentang ${cueB} menjadi pilihan yang membantu dirimu dan orang sekitar.`,
      `Potensi ${name} tumbuh lebih kuat bila ${cueB} diberi struktur, jeda, dan ukuran keberhasilan yang realistis.`,
      `Dalam bentuk terbaiknya, ${name} menjadi kapasitas yang dapat diandalkan ketika ${cueC} tidak hanya menjadi gambaran indah tentang diri.`,
    ];
  }
  if (paragraphIndex === 4) {
    return [
      `Shadow dari ${name} muncul ketika ${domainA.shadow} bertemu dengan ${cueA}.`,
      `Konflik batin ${name} dapat terasa sebagai tarik-menarik antara kebutuhan aman, ${cueA}, dan dorongan untuk tetap berfungsi seperti biasa.`,
      `Pertahanan dalam ${name} sering muncul sebagai mengurangi kejujuran, menunda respons, atau mengambil alih ${cueB} yang sebenarnya perlu dibicarakan.`,
      `Risiko ${name} muncul ketika ${domainB.shadow} dan ${cueB} mulai memengaruhi pilihan tanpa diberi nama terlebih dahulu.`,
      `Bila tidak disadari, pola ${cueC} bisa membuat ${name} terasa seperti beban, padahal ia seharusnya menjadi pintu pemahaman.`,
    ];
  }
  return [
    `Integrasi ${name} dimulai dengan mengenali kapan ${cueA} sedang aktif dan apa kebutuhan yang dibawanya.`,
    `Latihan utama ${name} adalah ${domainA.integration} sambil memperhatikan ${cueA} dengan cara yang cukup kecil untuk diulang.`,
    `Yang perlu dilepas dari ${name} adalah kebiasaan memakai ${cueB} sebagai pembenaran untuk menghindari percakapan, batas, atau tindakan nyata.`,
    `Penerapan ${name} bisa dimulai dari ${purpose.application}, terutama ketika ${cueC} muncul dalam satu situasi yang sedang kamu jalani sekarang.`,
    `Saat matang, ${name} membantu kamu merespons ${cueA} dengan lebih sadar, spesifik, dan selaras dengan arah hidupmu.`,
  ];
}

function renderDeepRegularReading(model: ArsipAkashiInsightModel, reading: ArsipAkashiReadingDef, roomTitle: string): ArsipAkashiRenderedReading {
  const purpose = readingPurpose(reading);
  const paragraphs: string[] = [];
  const provenance: DeepNarrativeParagraphProvenance[] = [];

  for (let paragraphIndex = 1; paragraphIndex <= 5; paragraphIndex++) {
    const selectedFacts = selectReadingFacts(model, reading, paragraphIndex);
    const selectedFactIds = selectedFacts.map((fact) => fact.factId);
    const contributingSystems = [...new Set(selectedFacts.map((fact) => fact.systemId))].sort();
    const domains = [...new Set(selectedFacts.map((fact) => fact.domain))];
    const semanticThemes = semanticThemesFor(reading, domains.length ? domains : reading.allowedDomains, paragraphIndex);
    const factCues = selectedFacts
      .map((fact, index) => safeFactCue(fact.value, semanticThemes[index % semanticThemes.length] ?? reading.allowedDomains[index % reading.allowedDomains.length]))
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
  "ASMARA, PERCINTAAN, RELASI SOSIAL & KELUARGA",
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
  "ASMARA, PERCINTAAN, RELASI SOSIAL & KELUARGA": ["relationships", "shadow", "identity", "karma"],
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
  ],
  mechanics: [
    "ritme mengambil keputusan yang membutuhkan jeda sebelum bergerak",
    "pola energi yang lebih kuat ketika respons tubuh ikut didengar",
    "kebutuhan mengatur tempo agar tindakan tidak lahir dari tekanan sesaat",
  ],
  talents: [
    "kemampuan mengubah gagasan menjadi bentuk kerja yang bisa diuji",
    "bakat menyusun pola, menghubungkan orang, atau membuat proses lebih jelas",
    "kekuatan belajar lewat praktik nyata, bukan hanya perencanaan",
  ],
  shadow: [
    "kecenderungan menahan keputusan ketika rasa aman belum terasa cukup",
    "risiko mengulang pola lama saat harga diri terlalu dikaitkan dengan hasil",
    "dorongan defensif yang perlu dibaca lebih awal sebelum menjadi jarak",
  ],
  relationships: [
    "kebutuhan relasi yang lebih jujur, seimbang, dan tidak ditebak-tebak",
    "kepekaan terhadap suasana emosional yang perlu disertai batas sehat",
    "pola kedekatan yang meminta komunikasi lebih terang dan tidak terburu-buru",
  ],
  health: [
    "sensitivitas tubuh terhadap tekanan yang menumpuk tanpa jeda pemulihan",
    "kebutuhan menjaga tidur, makan, gerak ringan, dan ruang mental yang cukup",
    "ritme pemulihan yang membaik ketika beban harian dibuat lebih realistis",
  ],
  spirituality: [
    "pencarian makna yang meminta praktik sederhana dan membumi",
    "intuisi yang tumbuh ketika hidup tidak terlalu penuh oleh kebisingan",
    "dorongan mengubah pemahaman batin menjadi sikap yang lebih welas asih",
  ],
  timing: [
    "perubahan irama tahun yang meminta prioritas dibuat lebih sadar",
    "pertemuan antara momentum membuka jalan dan kebutuhan menyelesaikan yang lama",
    "fase sementara yang mengaktifkan pilihan praktis, bukan kepastian nasib",
  ],
  location: [
    "pengaruh lingkungan terhadap fokus, pemulihan, dan rasa aman",
    "kebutuhan memilih ruang yang mendukung tubuh dan kejernihan pikiran",
    "kepekaan pada suasana tempat yang perlu diterjemahkan menjadi batas praktis",
  ],
  karma: [
    "pelajaran berulang yang meminta respons baru tanpa menyalahkan diri",
    "pola lama yang ingin diselesaikan melalui kedewasaan, bukan pengulangan",
    "undangan memperbaiki cara memberi, menerima, dan bertanggung jawab",
  ],
  growth: [
    "arah bertumbuh yang lebih kuat ketika langkah kecil dijaga konsisten",
    "kebutuhan melepas ukuran lama agar pilihan baru bisa diuji",
    "kematangan yang muncul dari latihan, bukan dari tuntutan sempurna",
  ],
  resources: [
    "hubungan dengan uang, tenaga, dan waktu yang meminta struktur lebih sadar",
    "kebutuhan membedakan rasa aman sejati dari dorongan menumpuk kendali",
    "peluang memperkuat ekonomi melalui pencatatan, batas risiko, dan nilai kontribusi",
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
        title: "ASMARA, PERCINTAAN, RELASI SOSIAL & KELUARGA" as const,
        body: first
          ? `${relationshipText} Bundle relasi membaca ${themeText(bundle("ASMARA, PERCINTAAN, RELASI SOSIAL & KELUARGA"), 0)} dan ${themeText(bundle("ASMARA, PERCINTAAN, RELASI SOSIAL & KELUARGA"), 1)}, sehingga percakapan kecil bisa menunjukkan pola besar. Love block dapat terasa sebagai kebutuhan dipahami tanpa selalu menyebut kebutuhan, atau sebagai kecenderungan menjaga damai sampai batas pribadi terlambat terlihat.\n\nDalam keluarga dan lingkar sosial, pilih satu pola yang ingin dikenali sebelum diulang. Jangan memaksa kedekatan yang belum siap, tetapi jangan juga membuat orang menebak semua isi hatimu. Semester pertama paling membantu jika kamu menjadikan relasi sebagai ruang kejujuran yang lembut, bukan tempat menguji siapa yang paling mampu bertahan.`
          : `${relationshipText} Bundle relasi membaca ${themeText(bundle("ASMARA, PERCINTAAN, RELASI SOSIAL & KELUARGA"), 0)} dan ${themeText(bundle("ASMARA, PERCINTAAN, RELASI SOSIAL & KELUARGA"), 2)}, sehingga semester ini meminta bukti lewat konsistensi. Love block dapat terasa sebagai penundaan memilih, takut mengecewakan, atau kecenderungan menerima bentuk hubungan yang tidak benar-benar mendukung rasa amanmu.\n\nDalam keluarga dan lingkar sosial, satu hubungan perlu diperjelas melalui tindakan nyata. Kedekatan yang sehat akan terasa lebih ringan ketika batas, peran, dan harapan dibicarakan sebelum menjadi letih. Semester kedua paling membantu jika kamu berani melihat siapa yang tumbuh bersamamu dan siapa yang perlu diberi jarak dengan hormat.`,
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
