type RecordValue = Record<string, unknown>;
import { getCanonicalHumanDesign } from "@/lib/humandesign/hdAudit";

export type ContentState = "READY" | "PARTIAL" | "UNAVAILABLE" | "ERROR";

export type EchoSection = {
  id: string;
  title: string;
  summary: string;
  definition?: string;
  strength?: string;
  challenge?: string;
  growth?: string;
  status: ContentState;
  subsections?: EchoSection[];
};

export type EchoChapter = {
  id: "identity" | "shadow" | "talents" | "relations" | "career";
  title: string;
  summary: string;
  status: ContentState;
  features: EchoSection[];
};

export type ProfileEchoV1 = {
  schema: "profile-echo";
  version: "1.0";
  status: ContentState;
  generatedAt: string;
  chapters: EchoChapter[];
};

export type BlueprintSummaryV1 = {
  lifePath: string;
  arcanaCenter: string;
  sunSign: string;
  humanDesignType: string;
};

export type BlueprintDetailV1 = {
  coreIdentity: BlueprintSummaryV1;
  humanDesign: Record<string, string>;
  natalChart: Record<string, string>;
  destinyMatrix: Record<string, string>;
};

const unavailable = "Belum tersedia";
const forbiddenNarrativeTerms = /\b(?:life path|arcana|gate|channel|center|variable|house|node|planet|line|chakra|health chart|karmic tail|money line|love line|mother line|father line|ancestor line|soul searching|spiritual knowledge|authority|strategy|definition|incarnation cross|human design|destiny matrix|natal chart|blueprint gabungan|berdasarkan data|berdasarkan blueprint|engine|generated|system|area 1)\b/i;

function record(value: unknown): RecordValue {
  return value && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : {};
}

function read(source: unknown, paths: string[][]): unknown {
  for (const path of paths) {
    let value: unknown = source;
    for (const key of path) {
      if (!value || typeof value !== "object") {
        value = undefined;
        break;
      }
      value = (value as RecordValue)[key];
    }
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function text(source: unknown, paths: string[][], fallback = unavailable): string {
  const value = read(source, paths);
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    const candidate = read(value, [["name"], ["label"], ["value"]]);
    if (typeof candidate === "string" || typeof candidate === "number") return String(candidate);
  }
  return fallback;
}

function numberValue(source: unknown, paths: string[][]): number | null {
  const value = read(source, paths);
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function cleanNarrative(value: string): string {
  const cleaned = value.replace(new RegExp(forbiddenNarrativeTerms.source, "gi"), "").replace(/\s{2,}/g, " ").replace(/\s+([,.])/g, "$1").trim();
  return cleaned || "Bagian ini masih membutuhkan data yang lebih lengkap agar dapat dibaca dengan jernih.";
}

function section(id: string, title: string, summary: string, extra: Partial<EchoSection> = {}): EchoSection {
  return {
    id,
    title,
    summary: cleanNarrative(summary),
    status: extra.status ?? "READY",
    ...extra,
  };
}

const identityByLifePath: Record<number, { archetype: string; presence: string; mission: string; mirror: string; strength: string; challenge: string; growth: string }> = {
  1: { archetype: "Sang Perintis", presence: "Kamu cenderung hadir dengan keberanian untuk membuka arah baru dan mengambil langkah pertama.", mission: "Arah pertumbuhanmu adalah memulai sesuatu yang bermakna sambil tetap memberi ruang bagi dukungan dan kolaborasi.", mirror: "Dalam keseharian, kekuatanmu terlihat saat keadaan membutuhkan keputusan. Bagian dalam dirimu juga perlu merasa bahwa kamu tidak harus menanggung semuanya sendiri.", strength: "Inisiatif dan kemandirian", challenge: "Bergerak terlalu cepat atau menutup diri dari bantuan", growth: "Memimpin dengan tetap mendengar" },
  2: { archetype: "Sang Penyelaras", presence: "Kamu cenderung hadir dengan kepekaan terhadap suasana, kebutuhan, dan hubungan di sekitarmu.", mission: "Arah kontribusimu adalah menciptakan ruang yang lebih selaras tanpa meninggalkan kebutuhanmu sendiri.", mirror: "Dalam keseharian, kamu mudah membaca hal yang tidak terucap. Kamu juga membutuhkan batas yang membuat kepekaan itu tetap terasa aman.", strength: "Empati dan kemampuan menyatukan", challenge: "Menunda pilihan demi menjaga ketenangan", growth: "Mengatakan kebutuhan dengan jujur" },
  3: { archetype: "Sang Pencipta", presence: "Kamu cenderung hadir melalui ekspresi, gagasan, dan kemampuan melihat warna di tengah keadaan yang biasa.", mission: "Arah kontribusimu adalah menghidupkan kemungkinan dan membantu sesuatu yang penting menemukan bentuknya.", mirror: "Dalam keseharian, energimu tumbuh saat ada ruang untuk berekspresi. Kamu perlu ritme yang membantu banyak ide menjadi langkah nyata.", strength: "Kreativitas dan komunikasi", challenge: "Tersebar di terlalu banyak kemungkinan", growth: "Memilih satu bentuk untuk diselesaikan" },
  4: { archetype: "Sang Pembangun", presence: "Kamu cenderung hadir dengan ketekunan, keteraturan, dan kemampuan membuat sesuatu terasa dapat diandalkan.", mission: "Arah kontribusimu adalah membangun fondasi yang membantu kehidupan bertumbuh dengan lebih stabil.", mirror: "Dalam keseharian, orang dapat mengandalkan kesungguhanmu. Bagian dalam dirimu perlu diingatkan bahwa aman tidak selalu berarti semuanya harus terkendali.", strength: "Konsistensi dan ketahanan", challenge: "Menegang saat keadaan berubah", growth: "Membuat ruang bagi fleksibilitas" },
  5: { archetype: "Sang Penjelajah", presence: "Kamu cenderung hadir dengan rasa ingin tahu, keluwesan, dan keberanian mencoba jalan yang berbeda.", mission: "Arah pertumbuhanmu adalah membuka kemungkinan baru lalu membagikan pembelajaran yang benar-benar telah kamu alami.", mirror: "Dalam keseharian, perubahan dapat menghidupkanmu. Kamu juga membutuhkan jangkar agar kebebasan tidak berubah menjadi kelelahan.", strength: "Adaptasi dan eksplorasi", challenge: "Sulit bertahan ketika kebaruan memudar", growth: "Membangun kebebasan yang memiliki arah" },
  6: { archetype: "Sang Perawat", presence: "Kamu cenderung hadir dengan perhatian yang membuat orang lain merasa ditopang dan dipedulikan.", mission: "Arah kontribusimu adalah menumbuhkan kehidupan yang lebih hangat tanpa mengukur kasih dari seberapa banyak kamu berkorban.", mirror: "Dalam keseharian, kamu mudah melihat apa yang dibutuhkan orang lain. Bagian dalam dirimu juga ingin dirawat tanpa harus lebih dulu berguna.", strength: "Kepedulian dan tanggung jawab", challenge: "Memikul terlalu banyak", growth: "Menerima dukungan dan menjaga batas" },
  7: { archetype: "Sang Pencari", presence: "Kamu cenderung hadir dengan kedalaman, ketelitian, dan keinginan memahami apa yang berada di balik permukaan.", mission: "Arah kontribusimu adalah mengubah pencarian yang mendalam menjadi kejernihan yang berguna dalam kehidupan nyata.", mirror: "Dalam keseharian, kamu membutuhkan waktu untuk memahami pengalamanmu. Kamu juga perlu tetap terhubung agar pemikiran tidak menjadi tempat bersembunyi.", strength: "Analisis dan kedalaman", challenge: "Menarik diri terlalu lama", growth: "Membagikan pemahaman secara bertahap" },
  8: { archetype: "Sang Penggerak", presence: "Kamu cenderung hadir dengan daya besar untuk menata sumber daya, mengambil tanggung jawab, dan menghasilkan dampak.", mission: "Arah kontribusimu adalah menggunakan kekuatan dengan sadar agar keberhasilan juga membawa manfaat yang lebih luas.", mirror: "Dalam keseharian, kamu terlihat kuat ketika menghadapi tuntutan. Bagian dalam dirimu membutuhkan izin untuk melunak tanpa kehilangan wibawa.", strength: "Daya eksekusi dan kepemimpinan", challenge: "Mengikat nilai diri pada hasil", growth: "Menjaga daya tanpa menegangkan diri" },
  9: { archetype: "Sang Pengabdi", presence: "Kamu cenderung hadir dengan pandangan luas dan kepedulian pada pengalaman manusia yang lebih besar dari dirimu sendiri.", mission: "Arah kontribusimu adalah mengubah pengalaman menjadi kebijaksanaan yang membantu kehidupan bergerak menuju penyelesaian.", mirror: "Dalam keseharian, kamu mudah merasakan beban yang lebih luas. Kamu perlu membedakan kepedulian dari kewajiban menyelamatkan semuanya.", strength: "Kebijaksanaan dan belas kasih", challenge: "Sulit melepaskan atau menjaga batas", growth: "Menolong tanpa meninggalkan diri" },
  11: { archetype: "Sang Penggagas", presence: "Kamu cenderung hadir dengan intuisi, inspirasi, dan kemampuan menangkap kemungkinan yang belum terlihat jelas.", mission: "Arah kontribusimu adalah membumikan inspirasi menjadi sesuatu yang dapat dipahami dan dirasakan manfaatnya.", mirror: "Dalam keseharian, kamu menangkap banyak lapisan sekaligus. Kamu membutuhkan ritme tenang agar inspirasi tidak berubah menjadi tekanan.", strength: "Visi dan kepekaan", challenge: "Kewalahan oleh intensitas batin", growth: "Menurunkan gagasan menjadi langkah sederhana" },
  22: { archetype: "Sang Arsitek", presence: "Kamu cenderung hadir dengan kemampuan melihat gambaran besar sekaligus kebutuhan untuk memberinya bentuk yang nyata.", mission: "Arah kontribusimu adalah membangun sesuatu yang bernilai jangka panjang melalui langkah yang terukur dan manusiawi.", mirror: "Dalam keseharian, visi besar dapat membuatmu sangat tekun. Kamu juga membutuhkan izin untuk memulai dari bentuk yang belum sempurna.", strength: "Visi dan kemampuan membangun", challenge: "Terbebani skala harapan", growth: "Menghormati kemajuan kecil" },
  33: { archetype: "Sang Penuntun Hati", presence: "Kamu cenderung hadir dengan kasih, kebijaksanaan, dan dorongan untuk membantu orang lain bertumbuh.", mission: "Arah kontribusimu adalah membawa kepedulian menjadi bimbingan yang sehat tanpa menjadikan dirimu penanggung semua luka.", mirror: "Dalam keseharian, kehadiranmu dapat terasa menenangkan. Bagian dalam dirimu perlu tahu bahwa kamu juga boleh lelah dan menerima perawatan.", strength: "Kasih dan bimbingan", challenge: "Mengorbankan kebutuhan pribadi", growth: "Menolong dari ruang yang tetap utuh" },
};

function identitySeed(blueprint: unknown) {
  const lifePath = numberValue(blueprint, [["lifePath", "number"], ["numerology", "number"], ["lifePath"]]) ?? 0;
  return identityByLifePath[lifePath] ?? {
    archetype: "Sang Penjelajah Diri",
    presence: "Kamu cenderung hadir dengan keinginan memahami hidup melalui pengalaman yang terus berkembang.",
    mission: "Arah pertumbuhanmu adalah mengenali apa yang benar-benar bermakna lalu membawanya ke dalam pilihan sehari-hari.",
    mirror: "Dalam keseharian, kamu sedang belajar mempercayai pengalamanmu sendiri tanpa harus memiliki semua jawaban sekaligus.",
    strength: "Kesadaran dan kemauan bertumbuh",
    challenge: "Menunggu kepastian sebelum bergerak",
    growth: "Memilih satu langkah yang terasa jujur",
  };
}

export function createBlueprintSummary(blueprint: unknown): BlueprintSummaryV1 {
  const humanDesign = getCanonicalHumanDesign(record(blueprint).humanDesign);
  return {
    lifePath: text(blueprint, [["lifePath", "display"], ["lifePath", "number"], ["numerology", "number"]]),
    arcanaCenter: text(blueprint, [["destinyMatrix", "arcanaCenter"], ["destinyMatrix", "center"], ["arcanaCenter", "number"], ["arcanaCenter"]]),
    sunSign: text(blueprint, [["astrology", "sunSign"], ["natalChart", "sunSign"]]),
    humanDesignType: humanDesign?.type ?? unavailable,
  };
}

export function createBlueprintDetail(blueprint: unknown): BlueprintDetailV1 {
  const summary = createBlueprintSummary(blueprint);
  const humanDesign = getCanonicalHumanDesign(record(blueprint).humanDesign);
  return {
    coreIdentity: summary,
    humanDesign: {
      Type: summary.humanDesignType,
      Profile: text(humanDesign, [["profile"]]),
      Authority: text(humanDesign, [["authority"]]),
      Strategy: text(humanDesign, [["strategy"]]),
      Definition: text(humanDesign, [["definition"]]),
      "Incarnation Cross": text(humanDesign, [["incarnationCross", "name"], ["incarnationCross"]]),
    },
    natalChart: {
      Sun: summary.sunSign,
      Moon: text(blueprint, [["astrology", "moonSign"], ["natalChart", "moonSign"]]),
      Ascendant: text(blueprint, [["astrology", "risingSign"], ["astrology", "ascendant"], ["natalChart", "risingSign"], ["natalChart", "ascendant"]]),
      "North Node": text(blueprint, [["astrology", "northNode", "sign"], ["natalChart", "northNode", "sign"], ["astrology", "northNode"]]),
      "South Node": text(blueprint, [["astrology", "southNode", "sign"], ["natalChart", "southNode", "sign"], ["astrology", "southNode"]]),
      MC: text(blueprint, [["astrology", "mc"], ["astrology", "midheaven"], ["natalChart", "mc"], ["natalChart", "midheaven"]]),
    },
    destinyMatrix: {
      "Arcana Center": summary.arcanaCenter,
      "Soul Searching": text(blueprint, [["destinyMatrix", "destinyIntelligence", "soulSearching"], ["destinyMatrix", "purposes", "soulSearching"]]),
      "Spiritual Knowledge": text(blueprint, [["destinyMatrix", "destinyIntelligence", "spiritualKnowledge"], ["destinyMatrix", "purposes", "spiritualKnowledge"]]),
    },
  };
}

export function createProfileEcho(blueprint: unknown): ProfileEchoV1 {
  const seed = identitySeed(blueprint);
  const sourceAvailable = Object.keys(record(blueprint)).length > 0;
  const status: ContentState = sourceAvailable ? "READY" : "UNAVAILABLE";

  const identity: EchoChapter = {
    id: "identity",
    title: "Identitas Jiwa",
    summary: "Sebuah cermin tentang cara kamu hadir, memberi makna, dan bertumbuh.",
    status,
    features: [
      section("primary-archetype", "Arketipe Utama", `${seed.archetype} menggambarkan kualitas kehadiranmu. ${seed.presence}`, { status }),
      section("soul-mission", "Misi Jiwa", `${seed.mission} Jalan ini bertumbuh saat kamu mengubah pemahaman menjadi pilihan yang nyata dan manusiawi.`, { status }),
      section("self-mirror", "Cermin Diri", seed.mirror, { status }),
    ],
  };

  const shadow: EchoChapter = {
    id: "shadow",
    title: "Sisi Gelap",
    summary: "Sisi gelap bukan bagian yang harus dibenci. Ia adalah ruang batin yang pernah belajar bertahan terlalu lama.",
    status,
    features: [
      section("repeating-patterns", "Pola Berulang", `Saat merasa tidak aman, pola ${seed.challenge.toLowerCase()} dapat kembali muncul. Pola ini bukan hukuman, melainkan tanda bahwa ada kebutuhan yang belum cukup didengar.`, { status }),
      section("core-wound", "Luka Inti", "Ada bagian yang mudah meragukan nilainya ketika kamu tidak sedang kuat, produktif, atau mampu memenuhi harapan. Luka ini meminta penerimaan, bukan pembuktian baru.", { status }),
      section("ancestral-karma", "Karma Leluhur", "Kamu mungkin mewarisi cara lama dalam memikul tanggung jawab atau menjaga kedamaian. Kamu boleh menghormati asalnya sambil memilih pola yang lebih sehat untuk hidupmu sekarang.", { status }),
      section("inner-child", "Inner Child", "Bagian dirimu yang lebih muda ingin didengar tanpa harus lebih dulu menjadi baik atau berguna. Ia pulih melalui kehadiran yang lembut, konsisten, dan tidak terburu-buru.", { status }),
      section("shadow-integration", "Shadow Integration Map", `Jalan integrasimu dimulai dengan mengenali dorongan untuk ${seed.challenge.toLowerCase()}, memberi nama pada kebutuhan di baliknya, lalu memilih respons yang lebih selaras.`, { status }),
      section("soul-fragment", "Soul Fragment", "Saat pengalaman berat membuatmu menjauh dari kebutuhan sendiri, sebagian daya hidup terasa tertinggal. Kamu memanggilnya pulang dengan kembali pada tubuh, suara hati, dan hubungan yang terasa aman.", { status }),
    ],
  };

  const talents: EchoChapter = {
    id: "talents",
    title: "Talenta & Potensi",
    summary: "Potensimu menjadi lebih kuat ketika kemampuan alami bertemu dengan latihan yang konsisten.",
    status,
    features: [
      section("talent-dna", "Talent DNA", `Bakat alammu bertumpu pada ${seed.strength.toLowerCase()}. Kamu berkembang saat kemampuan ini diberi arah, latihan, dan ruang untuk menghasilkan sesuatu yang dapat dirasakan manfaatnya.`, { status }),
      section("bhumi-strengths", "Kekuatan Utama Bhumi", "Kekuatan khasmu terlihat dalam kemampuan belajar dari pengalaman, menangkap hubungan antarpola, lalu mengubah pemahaman menjadi langkah yang bisa dijalankan.", { status }),
      section("energy", "Energi", "Tenagamu lebih terjaga ketika ada ritme, jeda, dan prioritas yang jelas. Tubuhmu bukan hambatan bagi tujuanmu; ia adalah penunjuk kapan perlu bergerak dan kapan perlu memulihkan diri.", { status }),
      section("spirituality", "Spiritualitas", "Kepekaan batinmu menjadi membumi saat hadir dalam cara mendengar, memperlakukan orang lain, dan memilih tindakan yang sesuai dengan nilai yang kamu percaya.", { status }),
    ],
  };

  const relations: EchoChapter = {
    id: "relations",
    title: "Relasi",
    summary: "Relasi yang sehat memberi ruang bagi kedekatan sekaligus keutuhan diri.",
    status,
    features: [
      section("relationship-style", "Gaya Relasi", "Kamu mencari hubungan yang tulus dan dapat dipercaya. Keintiman tumbuh melalui keterbukaan bertahap, sementara kebutuhan emosional lebih mudah diterima ketika disampaikan sebelum berubah menjadi jarak.", { status }),
      section("love-block", "Love Block", "Hati dapat menahan diri ketika kamu merasa harus selalu kuat, memahami lebih dulu, atau memastikan semuanya aman. Membuka hati bukan kehilangan kendali, tetapi belajar menerima kedekatan sedikit demi sedikit.", { status }),
      section("healthy-boundaries", "Batas Sehat", "Batas membantumu tetap mencintai tanpa meninggalkan kapasitas, waktu, dan suara batin sendiri. Batas yang jelas membuat hubungan lebih jujur, bukan lebih jauh.", { status }),
    ],
  };

  const career: EchoChapter = {
    id: "career",
    title: "Ekonomi & Karir",
    summary: "Karya dan rezeki bertumbuh ketika kemampuanmu menemukan bentuk yang berguna, jujur, dan dapat dijaga.",
    status,
    features: [
      section("career-dna", "Career DNA", `Cara kerjamu paling kuat ketika ${seed.strength.toLowerCase()} mendapat ruang untuk berkembang. Kamu membutuhkan peran yang memiliki arah jelas sekaligus memberi kesempatan untuk belajar dan memberi dampak.`, { status }),
      section("career-fit", "Ekonomi & Karir yang Sesuai", "Arah rezekimu tumbuh saat pengetahuan, pengalaman, dan kemampuan membimbing mulai kamu bentuk menjadi karya nyata. Lingkungan yang sehat menghargai hasil tanpa mengabaikan ritme manusiawi.", { status }),
      section("money-block", "Money Block", "Arus menerima dapat tertahan ketika nilai diri hanya diukur dari kerja keras atau hasil cepat. Hubungan yang lebih sehat dengan uang dimulai dari harga yang jujur, batas kerja yang jelas, dan keberanian menerima dukungan.", { status }),
    ],
  };

  const chapters = [identity, shadow, talents, relations, career];
  return { schema: "profile-echo", version: "1.0", status, generatedAt: new Date().toISOString(), chapters };
}

export function getProfileChapter(profile: ProfileEchoV1, id: string): EchoChapter | null {
  return profile.chapters.find((chapter) => chapter.id === id) ?? null;
}

export function narrativeHasMetadataLeak(profile: ProfileEchoV1): boolean {
  const values = profile.chapters.flatMap((chapter) => [
    chapter.summary,
    ...chapter.features.flatMap((feature) => [feature.summary, ...(feature.subsections ?? []).map((item) => item.summary)]),
  ]);
  return values.some((value) => forbiddenNarrativeTerms.test(value));
}
