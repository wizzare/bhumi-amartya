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
// Unused legacy Profile Echo chapters logic was removed. Only Blueprint detail models remain.
