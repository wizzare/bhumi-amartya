import type { AstroHouseActivation } from "@/lib/astrology/astroHouseActivations";
import type { BodyStatus } from "@/lib/astrology/calculateCurrentSky";
import { getCanonicalHumanDesignType } from "@/lib/humandesign/hdAudit";

type RecordValue = Record<string, unknown>;

export type TransitNarrative = {
  title: string;
  collectiveTheme: string;
  personalImpact: string;
  action: string;
  isLongTransit: boolean;
};

const PLANETS: Record<string, { collective: string; verb: string; action: string }> = {
  Sun: { collective: "Matahari menyoroti arah, vitalitas, identitas sadar, dan pusat energi.", verb: "menegaskan", action: "Pilih satu hal yang ingin kamu beri energi penuh hari ini." },
  Moon: { collective: "Bulan menggerakkan emosi, kebutuhan batin, rasa aman, dan respons harian.", verb: "menghidupkan", action: "Namai satu kebutuhan emosional sebelum mengatur agenda berikutnya." },
  Mercury: { collective: "Merkurius mengaktifkan pikiran, komunikasi, proses belajar, dan pertukaran informasi.", verb: "mempertajam", action: "Tulis satu gagasan atau percakapan yang perlu dibuat lebih jelas." },
  Venus: { collective: "Venus membawa perhatian pada relasi, nilai diri, rasa suka, harmoni, dan keindahan.", verb: "melunakkan", action: "Pilih satu tindakan yang menghargai dirimu sekaligus menjaga hubungan tetap jujur." },
  Mars: { collective: "Mars menggerakkan keberanian, tindakan, konflik, hasrat, dan energi tubuh.", verb: "mendorong", action: "Salurkan tenaga pada satu langkah konkret, bukan pada semua hal sekaligus." },
  Jupiter: { collective: "Jupiter memperluas peluang, makna, keyakinan, dan ruang pertumbuhan.", verb: "memperbesar", action: "Ambil satu kesempatan belajar yang memperluas pandanganmu." },
  Saturn: { collective: "Saturnus membawa pelajaran tentang struktur, tanggung jawab, batas, disiplin, dan kedewasaan.", verb: "menata", action: "Rapikan satu batas, jadwal, atau tanggung jawab yang membutuhkan bentuk lebih jelas." },
  Uranus: { collective: "Uranus membuka pembaruan, kebebasan, kejutan, inovasi, dan pecahnya pola lama.", verb: "mengubah", action: "Coba satu cara baru yang memberi lebih banyak ruang bagi kejujuranmu." },
  Neptune: { collective: "Neptunus memperhalus intuisi, imajinasi, spiritualitas, kepekaan, sekaligus kemungkinan kabut.", verb: "mengaburkan sekaligus memperdalam", action: "Pisahkan satu intuisi yang tenang dari asumsi yang belum memiliki fakta." },
  Pluto: { collective: "Pluto mengolah transformasi, kuasa batin, bayangan, dan pelepasan kontrol lama.", verb: "membongkar", action: "Tulis satu peran atau kontrol lama yang mulai terasa terlalu sempit." },
  Chiron: { collective: "Chiron membuka area rapuh yang dapat berkembang menjadi kebijaksanaan penyembuhan.", verb: "membuka", action: "Berikan respons baru pada satu bagian diri yang biasanya kamu kritik." },
};

const HOUSES: Record<number, { area: string; experience: string }> = {
  1: { area: "identitas, tubuh, dan cara kamu hadir", experience: "cara lama memperkenalkan atau membawa dirimu dapat terasa perlu diperbarui" },
  2: { area: "nilai diri, uang, kepemilikan, dan rasa aman", experience: "pilihan tentang menerima, memiliki, dan menghargai kemampuanmu menjadi lebih nyata" },
  3: { area: "komunikasi, belajar, saudara, dan pikiran harian", experience: "kata, informasi, dan pola berpikir meminta susunan yang lebih jernih" },
  4: { area: "rumah, keluarga, akar, masa kecil, dan rasa aman batin", experience: "kebutuhan akan tempat pulang dan hubungan dengan akar emosional menjadi lebih kuat" },
  5: { area: "kreativitas, romansa, hobi, ekspresi diri, dan anak batin", experience: "sisi bermain dan menciptamu ingin mendapat ruang yang lebih hidup" },
  6: { area: "rutinitas, kesehatan, kerja harian, dan pelayanan", experience: "ritme tubuh dan kebiasaan sehari-hari menunjukkan apa yang perlu diperbaiki" },
  7: { area: "relasi, pasangan, kemitraan, dan cermin diri", experience: "hubungan memperlihatkan pola memberi, menerima, dan membuat kesepakatan" },
  8: { area: "kedalaman emosi, transformasi, kepercayaan, dan sumber daya bersama", experience: "lapisan kontrol, kerentanan, atau keterikatan lama mulai meminta perubahan" },
  9: { area: "makna, pendidikan tinggi, perjalanan, filsafat, dan spiritualitas", experience: "pandangan hidupmu terdorong keluar dari jawaban yang terlalu sempit" },
  10: { area: "karier, arah publik, reputasi, dan tanggung jawab sosial", experience: "arah kontribusi dan cara kamu ingin dikenal membutuhkan bentuk yang lebih dewasa" },
  11: { area: "komunitas, jaringan, pertemanan, dan harapan masa depan", experience: "lingkaran sosial dan visi masa depanmu sedang disaring kembali" },
  12: { area: "alam bawah sadar, pelepasan, kesendirian, dan penyembuhan spiritual", experience: "pola tersembunyi muncul agar dapat diselesaikan tanpa terus dibawa ke depan" },
};

const SIGN_THEMES: Record<string, string> = {
  Aries: "inisiatif dan keberanian", Taurus: "stabilitas dan nilai", Gemini: "belajar dan pertukaran ide", Cancer: "rasa aman dan kepedulian",
  Leo: "ekspresi dan kepercayaan diri", Virgo: "ketelitian dan perbaikan", Libra: "keseimbangan dan hubungan", Scorpio: "kedalaman dan transformasi",
  Sagittarius: "makna dan perluasan", Capricorn: "struktur dan pencapaian", Aquarius: "pembaruan dan komunitas", Pisces: "intuisi dan penyerahan",
};

const LONG_TRANSITS = new Set(["Saturn", "Uranus", "Neptune", "Pluto", "Chiron"]);
const LABELS: Record<string, string> = { Sun: "Matahari", Moon: "Bulan", Mercury: "Merkurius", Saturn: "Saturnus", Neptune: "Neptunus" };

function read(source: unknown, paths: string[][]): string {
  for (const path of paths) {
    let value = source;
    for (const key of path) value = value && typeof value === "object" ? (value as RecordValue)[key] : undefined;
    if (typeof value === "string" || typeof value === "number") return String(value);
  }
  return "";
}

const LIFE_PATH_LABELS: Record<string, string> = {
  "1": "perintis mandiri", "2": "penjaga harmoni", "3": "kreator ekspresif",
  "4": "pembangun struktur", "5": "jiwa petualang", "6": "pelindung cinta",
  "7": "pencari kebenaran", "8": "strategis berdaya", "9": "pelayan kemanusiaan",
  "11": "intuisi pemandu", "22": "arsitek visi besar", "33": "guru pengorbanan mulia",
};

const ARCANA_LABELS: Record<string, string> = {
  "1": "inisiator berani", "2": "penengah intuitif", "3": "pencipta berlimpah",
  "4": "pondasi kokoh", "5": "penerjemah kebijaksanaan", "6": "pencinta sejati",
  "7": "pemenang batin", "8": "penegak keadilan", "9": "pertapa bijaksana",
  "10": "penguasa siklus", "11": "pemberdaya batin", "12": "perenang dalam",
  "13": "transformator", "14": "penjaga keseimbangan", "15": "pembongkar ilusi",
  "16": "pembangun ulang", "17": "bintang harapan", "18": "penjaga batas bayangan",
  "19": "pelindung cahaya", "20": "penilai ulang", "21": "perayap dunia baru",
  "22": "pemimpi besar",
};

const HD_TYPE_LABELS: Record<string, string> = {
  Generator: "penggerak aktif", "Manifesting Generator": "penggerak serba cepat",
  Projector: "pembaca situasi", Manifestor: "perintis aksi", Reflector: "cermin kolektif",
};

function blueprintAccent(context: RecordValue): string {
  const blueprint = (context.blueprint || context) as RecordValue;
  const lifePath = read(blueprint, [["lifePath", "number"], ["numerology", "number"]]);
  const hdType = getCanonicalHumanDesignType(blueprint.humanDesign);
  const arcana = read(blueprint, [["destinyMatrix", "center"], ["destinyMatrix", "arcanaCenter"]]);

  const lpLabel = LIFE_PATH_LABELS[lifePath];
  const arcanaLabel = ARCANA_LABELS[arcana];
  const hdLabel = hdType ? (HD_TYPE_LABELS[hdType] || hdType) : "";

  const accents = [
    lpLabel && `sebagai ${lpLabel}, kamu membawa pola belajar yang khas dalam setiap pengalaman`,
    hdLabel && `ritme keputusan seorang ${hdLabel} tetap menjadi penapis utamamu`,
    arcanaLabel && `energi ${arcanaLabel} mewarnai cara kamu mengolah kuasa dan tanggung jawab`,
  ].filter(Boolean);
  return accents.length ? ` Dalam blueprint-mu, ${accents.slice(0, 2).join("; ")}.` : "";
}

export function buildTransitNarrative(body: BodyStatus, activation: AstroHouseActivation | undefined, context: RecordValue): TransitNarrative {
  const planet = PLANETS[body.body] || { collective: `${body.body} membawa perubahan pada ritme kolektif.`, verb: "menggerakkan", action: "Catat perubahan yang paling terasa nyata." };
  const house = activation ? HOUSES[activation.house] : null;
  const isLongTransit = LONG_TRANSITS.has(body.body);
  const durationLead = isLongTransit ? "Fase panjang ini" : body.body === "Moon" ? "Dalam ritme harian ini" : "Pada periode ini";
  const retrograde = body.isRetrograde ? " Geraknya yang retrograde mengarahkan proses ini pada evaluasi, revisi, dan penyelesaian urusan lama." : "";
  const signTheme = SIGN_THEMES[body.sign] || "tema yang sedang aktif";
  const personalImpact = house
    ? `${durationLead} ${planet.verb} area ${house.area}. Kamu mungkin mulai merasa bahwa ${house.experience}. Warna ${body.sign} membawa fokus pada ${signTheme}.${blueprintAccent(context)}${retrograde}`
    : `${durationLead} membawa tema ${signTheme} ke cara kamu membaca keadaan dan memilih respons.${blueprintAccent(context)}${retrograde}`;

  return {
    title: `${LABELS[body.body] || body.body} di ${body.sign}`,
    collectiveTheme: `${planet.collective} Di ${body.sign}, energinya bergerak melalui ${signTheme}.`,
    personalImpact,
    action: planet.action,
    isLongTransit,
  };
}

export function buildPersonalAstroNote(bodies: BodyStatus[], activations: AstroHouseActivation[], context: RecordValue): string {
  const priority = ["Moon", "Saturn", "Uranus", "Pluto", "Sun"];
  const selected = priority.map((name) => bodies.find((body) => body.body === name)).filter((body): body is BodyStatus => Boolean(body)).slice(0, 2);
  const narratives = selected.map((body) => buildTransitNarrative(body, activations.find((item) => item.planet === body.body), context));
  return narratives.length
    ? `Langit hari ini terutama membuka ${narratives.map((item) => item.personalImpact.split(". ")[0].toLowerCase()).join(" dan ")}. ${narratives[0].action}`
    : "Langit hari ini dapat dibaca sebagai ruang untuk mengenali bagian hidup yang paling membutuhkan kejernihan.";
}
