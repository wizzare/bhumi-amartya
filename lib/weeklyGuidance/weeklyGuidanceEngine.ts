import type { ArsipAkashiProfileViewModel } from "@/lib/arsipAkashi/profile/viewModel";
import type { WeeklyGuidance, WeeklyGuidanceSection } from "./types";
import { CANONICAL_SYSTEM_IDS } from "@/lib/arsipAkashi/types";

const SECTION_DEFS = [
  ["kabarMingguIni", "Kabar Minggu Ini", "arah keseluruhan dan fase hidup", "identity"],
  ["pikiran", "Pikiran", "cara memilah keputusan", "thinking"],
  ["ekonomi", "Ekonomi & Rezeki", "kerja, uang, dan tanggung jawab", "economy"],
  ["asmara", "Asmara & Percintaan", "kedekatan dan kebutuhan emosional", "relationship"],
  ["orangTerdekat", "Orang Terdekat", "batas dan koneksi sosial", "social"],
  ["maknaBatin", "Makna Batin", "arah spiritual yang membumi", "spirituality"],
  ["yangMungkinTerasaBerat", "Yang Mungkin Terasa Berat", "tekanan dan pemulihan", "shadow"],
  ["ruangYangSedangTerbuka", "Peluang yang Terbuka", "peluang dan pembelajaran", "growth"],
] as const;

function hash(value: string): number { let n = 2166136261; for (const c of value) { n ^= c.charCodeAt(0); n = Math.imul(n, 16777619); } return n >>> 0; }
function pick<T>(items: T[], seed: string): T { return items[hash(seed) % items.length]; }
function sentence(value: string): string { const t = value.replace(/\s+/g, " ").replace(/\s+([,.!?])/g, "$1").trim(); return /[.!?]$/.test(t) ? t : `${t}.`; }
function localParts(date: Date, timezone: string) { const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).formatToParts(date); const get = (type: string) => parts.find((p) => p.type === type)?.value || ""; return { year: Number(get("year")), month: Number(get("month")), day: Number(get("day")), weekday: get("weekday") }; }
function isoDate(y: number, m: number, d: number) { return `${y.toString().padStart(4, "0")}-${m.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`; }
function range(date: Date, timezone: string, mode: "current" | "upcoming") { const p = localParts(date, timezone); const base = new Date(Date.UTC(p.year, p.month - 1, p.day + (mode === "upcoming" ? 7 : 0))); const weekday = base.getUTCDay() || 7; base.setUTCDate(base.getUTCDate() - weekday + 1); const end = new Date(base); end.setUTCDate(end.getUTCDate() + 6); return { start: isoDate(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate()), end: isoDate(end.getUTCFullYear(), end.getUTCMonth() + 1, end.getUTCDate()), key: `${base.getUTCFullYear()}-W${String(Math.ceil((base.getUTCDate() + 6) / 7)).padStart(2, "0")}` }; }
function semanticSignal(seed: string, options: string[]) { return pick(options, seed); }

export function buildWeeklyGuidance(input: { uid: string; profile: Record<string, unknown>; blueprint: Record<string, unknown>; arsipViewModel: ArsipAkashiProfileViewModel; referenceDate?: Date; timezone?: string; mode?: "current" | "upcoming"; journey?: Record<string, unknown> | null; }): WeeklyGuidance {
  const timezone = input.timezone || String(input.profile.timezone || "Asia/Jakarta"); const mode = input.mode || "current"; const dates = range(input.referenceDate || new Date(), timezone, mode); const ownerSignal = String(input.profile.fullName || input.profile.displayName || input.profile.name || input.uid); const seed = `${input.uid}:${ownerSignal}:${dates.key}:${JSON.stringify(input.blueprint).slice(0, 180)}`;
  const arsipAvailable = input.arsipViewModel.status !== "unavailable" && input.arsipViewModel.readings.length > 0; const astro = input.blueprint.astrology as Record<string, unknown> | undefined; const astroAvailable = Boolean(astro?.sunSign || astro?.sun || input.blueprint.vedic); const journeyAvailable = Boolean(input.journey && Object.keys(input.journey).length);
  const identity = semanticSignal(`${seed}:identity`, [
    "Minggu ini arahnya jadi lebih jelas: kamu mulai tahu mana yang benar-benar penting dan mana yang bisa menunggu.",
    "Pekan ini kamu sedang menyortir apa yang layak dijaga dan apa yang perlu dilepas.",
    "Ada benang yang mulai jelas di minggu ini: arah hidupmu tidak berubah, tapi prioritasnya lebih tegas.",
    "Minggu ini jalannya lebih ringan karena kamu berhenti menanggung banyak hal sekaligus."
  ]);
  const thinking = semanticSignal(`${seed}:thinking`, [
    "Pikiranmu paling jernih kalau satu keputusan dibiarkan matang dulu, bukan langsung dijawab.",
    "Komunikasi minggu ini perlu jeda: jawaban cepat sering lebih berantakan daripada pertanyaan yang tepat.",
    "Fokusmu membaik saat pekerjaan besar dipecah menjadi pilihan kecil yang bisa diuji.",
    "Kalau pikiranmu mulai berputar, tulis dulu pertanyaannya. Menulis biasanya lebih cepat daripada berpikir berulang."
  ]);
  const economy = semanticSignal(`${seed}:economy`, [
    "Peluang kerja minggu ini tumbuh dari keterampilan yang benar-benar kamu pakai, bukan dari yang baru saja kamu pelajari.",
    "Yang paling masuk akal untuk ditinjau minggu ini adalah nilai yang bisa kamu tawarkan, bukan sekadar kondisi umum.",
    "Rezeki minggu ini berkaitan dengan keberanian menguji cara kerja yang lebih efektif, meski hasilnya belum terlihat.",
    "Buat waktu untuk satu latihan nyata dan catat langkah selanjutnya."
  ]);
  const relation = semanticSignal(`${seed}:relation`, [
    "Kedekatan terasa lebih lapang kalau kebutuhannya disampaikan dengan tenang.",
    "Hubungan minggu ini mengajak menyeimbangkan kehangatan dengan kejujuran.",
    "Rasa aman dalam relasi tumbuh dari percakapan yang tidak menguji atau menebak.",
    "Jadwalkan satu percakapan penting dan sampaikan kebutuhanmu dengan kalimat sederhana."
  ]);
  const shadow = semanticSignal(`${seed}:shadow`, [
    "Tekanan minggu ini perlu dibaca sebagai tanda untuk menata ulang kapasitas, bukan sebagai dosa.",
    "Tubuh bisa minta jeda ketika agenda terlalu padat. Dengarkan itu lebih awal.",
    "Pemulihan jadi penting sekarang, supaya keputusan besar tidak diambil dari rasa terdesak.",
    "Kalau kapasitasmu mulai habis, kurangi satu agenda dan isi waktunya dengan istirahat."
  ]);
  const spiritual = semanticSignal(`${seed}:spiritual`, [
    "Makna batin minggu ini menguat lewat praktik kecil yang kamu ulang, bukan lewat tontonan monumental.",
    "Ketenangan lebih mudah datang ketika tubuh dan nilai hidup berjalan searah.",
    "Arah spiritual terasa nyata begitu diterjemahkan menjadi kebiasaan yang membumi.",
    "Yang kamu cari minggu ini mungkin bukan jawaban, melainkan tempat yang lebih tenang untuk bertanya."
  ]);
  const themes: Record<string, [string, string]> = {
    kabarMingguIni: [identity, "Awal minggu cocok untuk memilih fokus, lalu menjaganya sampai akhir pekan."],
    pikiran: [thinking, "Gunakan pertengahan minggu untuk meninjau pilihan sebelum menetapkan keputusan."],
    ekonomi: [economy, "Sisihkan satu waktu khusus untuk latihan, portofolio, atau pengujian tawaran kecil."],
    asmara: [relation, "Jadwalkan percakapan penting ketika kedua pihak punya cukup waktu untuk mendengar."],
    orangTerdekat: ["Koneksi keluarga dan komunitas membutuhkan batas yang hangat.", "Akhir pekan baik untuk menyambung kembali satu hubungan yang berarti."],
    maknaBatin: [spiritual, "Pagi atau malam yang lebih hening dapat menjadi waktu terbaik untuk menulis."],
    yangMungkinTerasaBerat: [shadow, "Kurangi satu agenda yang menguras tenaga sebelum memasuki pertengahan minggu."],
    ruangYangSedangTerbuka: ["Potensi baru muncul ketika rasa ingin tahu diberi bentuk melalui latihan.", "Akhir minggu cocok untuk memilih satu langkah pengembangan berikutnya."],
  };
  const advice: Record<string, string[]> = {
    kabarMingguIni: ["Pilih satu tema yang ingin kamu rawat sampai Minggu dan tulis di agenda utama."], pikiran: ["Catat keputusan yang belum matang, lalu jadwalkan waktu meninjaunya."], ekonomi: ["Pertimbangkan kursus atau pelatihan yang selaras dengan talenta, lalu jadwalkan satu blok praktik."], asmara: ["Jadwalkan satu percakapan penting dan sampaikan kebutuhanmu dengan kalimat sederhana."], orangTerdekat: ["Tentukan satu batas yang bisa kamu jaga tanpa menjelaskan diri berulang-ulang."], maknaBatin: ["Sisihkan sepuluh menit untuk doa, journaling, napas, atau grounding."], yangMungkinTerasaBerat: ["Kurangi satu agenda yang menguras tenaga dan jadwalkan waktu tidur yang lebih teratur."], ruangYangSedangTerbuka: ["Uji satu langkah pengembangan yang bisa memberi bukti sebelum akhir minggu."],
  };
  const development: Record<string, string> = {
    kabarMingguIni: "Potensimu terlihat saat kamu mengubah kesadaran ini menjadi satu kebiasaan yang konsisten.", pikiran: "Kemampuan memilah akan berkembang ketika kamu berani menguji satu cara berpikir baru.", ekonomi: "Pengembangan paling kuat minggu ini datang dari memperjelas keterampilan yang ingin kamu tawarkan.", asmara: "Kedewasaan relasi tumbuh ketika kamu berlatih hadir tanpa kehilangan arah pribadi.", orangTerdekat: "Batas yang sehat memberi ruang bagi kemampuanmu memimpin hubungan dengan lebih hangat.", maknaBatin: "Intuisimu berkembang saat ia diberi bentuk melalui praktik sederhana yang berulang.", yangMungkinTerasaBerat: "Daya tahanmu bertumbuh bukan dengan menambah beban, melainkan dengan belajar pulih secara sadar.", ruangYangSedangTerbuka: "Peluang ini dapat menjadi latihan untuk membawa talenta dan rasa ingin tahu ke tingkat berikutnya.",
  };
  const timingEvidence = ["weekly-period", ...(astroAvailable ? ["moon-and-weekly-astrology"] : ["broad-weekly-timing"]), ...(journeyAvailable ? ["journey-stage"] : [])];
  const lifePath = Number((input.blueprint.lifePath as Record<string, unknown> | undefined)?.number || 0);
  const userFocus = lifePath === 9 ? "merawat kontribusi yang berdampak pada orang lain" : lifePath === 7 ? "memperdalam kemampuan melalui riset dan latihan" : timezone !== "Asia/Jakarta" ? "menyesuaikan ritme dengan lingkungan setempat" : "menguji keterampilan melalui langkah yang terukur";
  const awalPekanTemplates: Record<string, string> = {
    kabarMingguIni: "${anchor} Minggu ini dimulai dengan satu fokus yang jelas: ${focus}.",
    pikiran: "${anchor} Pikiranmu di awal pekan ini: ${focus}.",
    ekonomi: "${anchor} Ekonomi minggu ini: ${focus}.",
    asmara: "${anchor} Hubungan hari ini: ${focus}.",
    orangTerdekat: "${anchor} Orang terdekat dan komunitas: ${focus}.",
    maknaBatin: "${anchor} Makna batin pekan ini: ${focus}.",
    yangMungkinTerasaBerat: "${anchor} Yang mungkin terasa berat: ${focus}.",
    ruangYangSedangTerbuka: "${anchor} Peluang yang terbuka: ${focus}.",
  };
  const sections: WeeklyGuidanceSection[] = SECTION_DEFS.map(([key, title, focus, domain]) => {
    const [anchor, shift] = themes[key];
    const cleanAnchor = sentence(anchor);
    const template = awalPekanTemplates[key] || "${anchor} Awal pekan ini difokuskan untuk ${focus}.";
    const awalPekanText = template.replace("${anchor}", cleanAnchor).replace("${focus}", focus);
    const phases = {
      awalPekan: [sentence(awalPekanText)],
      tengahPekan: [sentence(shift)],
      akhirPekan: [sentence(development[key])]
    };
    return {
      key,
      title,
      phases,
      paragraphs: [...phases.awalPekan, ...phases.tengahPekan, ...phases.akhirPekan],
      advice: advice[key].map(sentence),
      sourceDomains: [domain, "potential-development"],
      timingEvidence
    };
  });
  const direction = ["Tema utama minggu ini: kamu sedang mengenali potensi yang ada, lalu memberinya bentuk lewat latihan yang bisa dijaga.", `Pengembanganmu minggu ini berpusat pada ${userFocus}.`, "Mulai dari satu prioritas kerja atau belajar yang jelas, sisakan waktu untuk orang terdekat, dan jangan等到 lelah baru beristirahat.", pick(["Jadwalkan satu sesi pengembangan dan satu sesi evaluasi sebelum Minggu berakhir.", "Uji satu kemampuan dalam situasi nyata, lalu catat langkah pendalaman berikutnya.", "Pilih satu kebiasaan yang mendukung arahmu dan ulangi dengan ukuran yang realistis.", "Gunakan percakapan atau masukan pertengahan minggu untuk memperbaiki rencana.", "Tutup pekan dengan menilai bukti kecil yang menunjukkan kemampuanmu bertumbuh."], `${seed}:direction`), "Dengan ritme seperti itu, minggu ini bisa menjadi dasar yang lebih kuat untuk pekan berikutnya."];
  const state = !arsipAvailable ? "unavailable" : (astroAvailable && journeyAvailable ? "ready" : "limited");
  const readingSystems = input.arsipViewModel.readings.flatMap((reading) => reading.deepNarrativeProvenance?.flatMap((item) => item.contributingSystems) || []);
  const contributingSystems = [...new Set([...CANONICAL_SYSTEM_IDS, ...readingSystems, "arsip-akashi", "weekly-astrology", ...(journeyAvailable ? ["journey"] : [])])];
  return { uid: input.uid, timezone, weekKey: dates.key, weekStart: dates.start, weekEnd: dates.end, guidancePeriodMode: mode, state, availableSources: ["arsipAkashi", ...(astroAvailable ? ["weeklyAstrology"] : []), ...(journeyAvailable ? ["journey"] : [])], limitedSources: ["weeklyAstrology", "journey"].filter((x) => ![...(astroAvailable ? ["weeklyAstrology"] : []), ...(journeyAvailable ? ["journey"] : [])].includes(x)), unavailableSources: arsipAvailable ? [] : ["arsipAkashi"], sections, weeklyDirection: { title: "Arah Minggu Ini", paragraphs: direction.map(sentence), sourceDomains: ["identity", "potential-development"] }, sourceProvenance: { sourceReadingIds: input.arsipViewModel.readings.slice(0, 8).map((r) => r.id), sourceDomains: sections.flatMap((s) => s.sourceDomains), contributingSystems, timingFactIds: astroAvailable ? [`week:${dates.key}`] : [], journeyFactIds: journeyAvailable ? ["journey:available"] : [] }, synthesisFingerprint: `${seed}:${state}` };
}
