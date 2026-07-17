import { ASTRO_PLANET_MEANINGS, ASTRO_SIGN_MEANINGS, LILITH_SIGN_MEANINGS } from "@/lib/data/astrologyDictionaries";

export const NATAL_PRESENTATION_SOURCE = "FOUNDER_APPROVED_FUNCTIONAL_RECONSTRUCTION" as const;

export const NATAL_HOUSE_MEANINGS_ID: Record<number, { title: string; desc: string }> = {
  1: { title: "Diri dan Cara Hadir", desc: "cara memasuki dunia, tubuh, dan inisiatif pribadi" },
  2: { title: "Nilai Diri dan Sumber Daya", desc: "rasa aman, nilai pribadi, dan cara merawat sumber daya" },
  3: { title: "Pikiran dan Lingkungan Terdekat", desc: "belajar, berbicara, dan hubungan dengan lingkungan sehari-hari" },
  4: { title: "Rumah dan Akar Emosional", desc: "keluarga, rumah, dan fondasi rasa aman" },
  5: { title: "Kreativitas dan Ekspresi Diri", desc: "karya, kegembiraan, cinta, dan keberanian bermain" },
  6: { title: "Rutinitas dan Pelayanan", desc: "kebiasaan, pekerjaan harian, dan perawatan tubuh" },
  7: { title: "Relasi dan Kemitraan", desc: "komitmen dan cara bertemu orang lain secara setara" },
  8: { title: "Keintiman dan Transformasi", desc: "kepercayaan, sumber daya bersama, dan pembaruan batin" },
  9: { title: "Keyakinan dan Perluasan Wawasan", desc: "makna, pendidikan, perjalanan, dan pandangan hidup" },
  10: { title: "Arah Karier dan Reputasi", desc: "kontribusi publik, tanggung jawab, dan pencapaian matang" },
  11: { title: "Komunitas dan Visi Masa Depan", desc: "persahabatan, jaringan, dan cita-cita bersama" },
  12: { title: "Dunia Batin dan Pelepasan", desc: "keheningan, pemulihan, dan hal-hal yang bekerja di balik kesadaran" },
};

export type NatalSection = { sectionId: string; label: string; planet?: string; sign?: string; house?: number; degree?: number; retrograde?: boolean; shortExplanation?: string; fullExplanation?: string; sourceType: "astrologyDictionaries" | "natalIntelligence" | "fallback"; sourceVersion: typeof NATAL_PRESENTATION_SOURCE; canonicalStatus: "canonical" | "partial" | "unavailable"; availabilityStatus: "available" | "unavailable" };
export type NatalAspectNarrative = { title: string; meaning: string; type: string };
export type NatalSummaryEvidence = { sourceFactId: string; chartFactor: string; role: "orientation" | "emotion" | "contribution" | "integration"; strength: number; synthesisDimension: string };
export type NatalIdentityContext = { sun?: string; moon?: string; ascendant?: string; midheaven?: string; mercury?: string; venus?: string; mars?: string; jupiter?: string; saturn?: string; uranus?: string; neptune?: string; pluto?: string; dominantElements: string[]; dominantModalities: string[]; majorAspects: string[]; houseEmphasis: { house: number; title: string; desc: string; count: number; explanation: string }[]; summaryEvidence: NatalSummaryEvidence[]; elementNarrative: string; modalityNarrative: string; strengths: string[]; challenges: string[]; growthDirection: string; summary: string[]; sourceVersion: typeof NATAL_PRESENTATION_SOURCE };

const signOf = (a: any, p: string): string | undefined => p === "Sun" ? a.sunSign || a.planets?.Sun?.sign : p === "Moon" ? a.moonSign || a.planets?.Moon?.sign : p === "Ascendant" ? a.risingSign || a.ascendant || a.planets?.ASC?.sign : p === "Midheaven" ? a.mc || a.midheaven || a.planets?.MC?.sign : a.planets?.[p]?.sign;
const positionOf = (a: any, p: string) => a.planets?.[p];
const houseOf = (a: any, p: string) => { const pos = positionOf(a, p); return pos?.placidusHouse || pos?.house; };
const first = (text: string) => text.split(/(?<=[.!?])\s+/)[0] || text;
const houseText = (house?: number) => house ? NATAL_HOUSE_MEANINGS_ID[house] : undefined;
const CHART_RULERS: Record<string, string> = { Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter" };
const houseLabel = (house?: number) => house ? `House ${house} (${NATAL_HOUSE_MEANINGS_ID[house]?.title || "area kehidupan"})` : "area yang belum memiliki data rumah lengkap";

export function buildElementNarrative(elements: Record<string, number>): string {
  const ordered = Object.entries(elements).sort((a, b) => b[1] - a[1]);
  if (!ordered.length || ordered.every(([, value]) => !value)) return "Komposisi elemen belum tersedia untuk dibaca dengan utuh.";
  const lead = ordered[0][0];
  const stories: Record<string, string> = {
    Air: "Kamu punya pikiran yang hidup, cepat menangkap banyak hal, dan sering melihat kemungkinan yang belum langsung terlihat oleh orang lain. Ada dorongan untuk menghubungkan gagasan, berbicara, dan bergerak ketika rasa ingin tahu menyala. Kamu semakin utuh saat memberi jeda bagi tubuh dan perasaan agar langkah yang cepat tetap punya pijakan.",
    Fire: "Di dalam dirimu ada nyala yang membuatmu mudah menemukan keberanian untuk memulai. Ketika sesuatu terasa penting, kamu dapat bergerak dengan antusias dan menularkan semangat itu kepada sekitar. Ruang untuk berhenti sejenak membantu dorongan ini tetap hangat tanpa menghabiskan tenaga.",
    Earth: "Kamu cenderung mencari sesuatu yang dapat dipegang, dirawat, dan dibangun sedikit demi sedikit. Ketekunanmu memberi bentuk pada gagasan sehingga tidak berhenti sebagai rencana. Kelenturan tetap penting agar kebutuhan akan kepastian tidak menutup pintu bagi kemungkinan baru.",
    Water: "Kamu peka terhadap suasana, perubahan nada, dan hal-hal yang tidak selalu terucap. Perasaan sering menjadi jalan penting untuk memahami apa yang sedang terjadi, bahkan sebelum pikiran menemukan namanya. Batas yang lembut membantumu tetap dekat dengan rasa tanpa ikut membawa semua beban di sekitarmu.",
  };
  return stories[lead] || "Cara kamu menjalani hidup memiliki ritme yang khas dan terus berkembang melalui pengalaman. Ada kekuatan yang muncul saat kamu mempercayai respons alami tanpa kehilangan kehadiran pada keadaan nyata. Jeda dan perhatian pada tubuh membantu langkahmu tetap seimbang.";
}

export function buildModalityNarrative(modalities: Record<string, number>): string {
  const ordered = Object.entries(modalities).sort((a, b) => b[1] - a[1]);
  if (!ordered.length || ordered.every(([, value]) => !value)) return "Pola modalitas belum tersedia untuk dibaca dengan utuh.";
  const lead = ordered[0][0];
  const stories: Record<string, string> = {
    Cardinal: "Kamu punya dorongan untuk membuka jalan dan mengambil langkah pertama ketika arah sudah terasa jelas. Setelah bergerak, kamu belajar menjaga tenaga agar permulaan itu tidak berhenti sebagai percobaan sesaat. Kesabaran pada proses membantu keberanianmu bertemu ketekunan dan keluwesan.",
    Fixed: "Ketika sesuatu sudah kamu anggap penting, kamu mampu menjaganya tetap berjalan meski keadaan berubah. Kesetiaan pada arah memberi rasa kuat dan dapat diandalkan bagi orang di sekitarmu. Kamu semakin lapang saat memberi ruang bagi penyesuaian tanpa menganggap perubahan sebagai kegagalan.",
    Mutable: "Kamu mudah membaca perubahan suasana dan menemukan cara baru ketika rencana lama tidak lagi pas. Keluwesan ini membuatmu mampu belajar dari banyak pengalaman tanpa harus terpaku pada satu bentuk. Arah yang sederhana membantu adaptasi tetap menjadi gerak maju, bukan kehilangan pijakan.",
  };
  return stories[lead] || "Kamu memiliki cara bergerak yang dapat memulai, menjaga, dan menyesuaikan diri sesuai kebutuhan. Kekuatanmu muncul saat keteguhan tidak menutup percobaan baru. Ritme yang lentur membuat perubahan terasa lebih bisa diolah.";
}

export function buildHouseNarrative(house: number, planets: string[] = []): string {
  const emphasis = planets.length ? " Perhatianmu berulang kali kembali ke sini dalam pilihan sehari-hari." : " Ada alasan mengapa perhatianmu sering kembali ke sini.";
  const invitation: Record<number, string> = { 4: "Kekuatanmu tumbuh saat rasa aman dibangun dari hubungan dan batas yang nyata, bukan dari usaha memegang semua hal tetap sama.", 9: "Kejernihan datang ketika wawasan baru diberi waktu untuk mengubah cara pandang, bukan hanya menjadi pengetahuan yang disimpan.", 10: "Arah matang terbentuk ketika tanggung jawab publik tetap terhubung dengan nilai pribadi, bukan sekadar pencapaian yang terlihat." };
  const lived: Record<number, string> = { 4: `Ada kebutuhan untuk memiliki tempat pulang yang terasa aman, baik secara lahir maupun batin.${emphasis} Kedekatan menjadi kekuatan ketika perlindungan diri tetap berjalan bersama keberanian untuk menerima kehangatan. ${invitation[4]}`, 9: `Rasa ingin tahu membawamu mencari makna yang lebih luas daripada jawaban pertama.${emphasis} Belajar, bertukar sudut pandang, atau menjelajah gagasan dapat mengubah cara kamu melihat hidup. ${invitation[9]}`, 10: `Ada dorongan untuk membangun sesuatu yang berguna dan dapat dirasakan orang lain.${emphasis} Tanggung jawab publik menjadi lebih sehat ketika tidak dijadikan satu-satunya ukuran harga diri. ${invitation[10]}` };
  return lived[house] || `Bagian hidup ini sedang meminta perhatian yang lebih jujur.${emphasis} ${invitation[house] || "Perhatian yang lembut dan konsisten membantu area ini berkembang tanpa menjadi tuntutan."}`;
}

function planetNarrative(planet: string, sign: string, house?: number): string {
  const signMeaning = ASTRO_SIGN_MEANINGS[sign] || "dengan warna yang khas";
  const area = houseText(house);
  const location = area ? `Di ${area.title.toLowerCase()}, tema ini menyentuh ${area.desc}.` : "Tanpa data rumah yang lengkap, warna ini dibaca dari tanda dan pengalaman yang kamu jalani.";
  const endings: Record<string, string> = {
    Sun: `Arah matangnya adalah tetap hangat tanpa memegang kendali terlalu erat.`, Moon: `Rasa aman tumbuh ketika kebutuhan damai tidak membuatmu menghindari percakapan penting.`, Ascendant: `Kamu berkembang dengan memberi ruang pada spontanitas tanpa kehilangan keaslianmu.`, Midheaven: `Pengaruhmu menguat ketika kedalaman dipakai untuk memperbaiki keadaan, bukan menguasainya.`, Mercury: `Kejernihan hadir ketika rasa ingin tahu diberi struktur dan waktu untuk mengendap.`, Venus: `Kedekatan terasa sehat ketika nilai diri tidak dititipkan seluruhnya pada penerimaan orang lain.`, Mars: `Keberanianmu paling berguna saat diarahkan pada tindakan yang jelas, bukan reaksi sesaat.`, Jupiter: `Perluasan terbaik datang melalui pengalaman yang membuka wawasan, bukan janji keberuntungan.`, Saturn: `Batas yang kamu bangun dapat berubah menjadi kematangan, bukan hukuman bagi diri.`, Uranus: `Kebebasan menjadi bermakna saat perubahan juga memberi ruang bagi hubungan yang nyata.`, Neptune: `Kepekaanmu tetap jernih ketika imajinasi ditemani batas yang membumi.`, Pluto: `Transformasi menjadi daya ketika kamu berani melepas pola kuasa yang sudah selesai.`, NorthNode: `Arah ini dilatih perlahan melalui pilihan yang sederhana dan konsisten.`, SouthNode: `Kekuatan lama tetap berguna ketika tidak dipakai untuk menghindari arah baru.`, Chiron: `Pemulihan tumbuh melalui keberanian hadir tanpa menunggu pengakuan sempurna.`,
  };
  const functionMeaning = ASTRO_PLANET_MEANINGS[planet] || "tema pengalaman yang sedang kamu kenali";
  const opening: Record<string, string> = {
    Sun: `Cara hidupmu berpusat pada ${functionMeaning}; di ${sign}, energi ini hadir ${signMeaning}`,
    Moon: `Kebutuhan emosional dan nalurimu bekerja melalui ${signMeaning}`,
    Ascendant: `Cara pertama dirimu memasuki dunia terasa ${signMeaning}`,
    Midheaven: `Di ruang publik, arah kontribusimu membawa ${signMeaning}`,
    Mercury: `Pikiran dan caramu berbicara bergerak ${signMeaning}`,
    Venus: `Dalam cinta dan nilai pribadi, kamu cenderung hadir ${signMeaning}`,
    Mars: `Dorongan untuk bergerak dan memperjuangkan sesuatu muncul ${signMeaning}`,
    Jupiter: `Rasa ingin tumbuh dan memperluas makna hidup bergerak ${signMeaning}`,
    Saturn: `Pelajaran tentang tanggung jawab terasa ${signMeaning}`,
    Uranus: `Dorongan untuk bebas dan memperbarui hidup hadir ${signMeaning}`,
    Neptune: `Imajinasi dan kepekaan batin mengalir ${signMeaning}`,
    Pluto: `Perubahan mendalam dalam dirimu bergerak ${signMeaning}`,
    NorthNode: `Arah baru yang sedang kamu latih tumbuh ${signMeaning}`,
    SouthNode: `Pola yang sudah akrab dalam dirimu bekerja ${signMeaning}`,
    Chiron: `Kepekaan yang membutuhkan perawatan muncul ${signMeaning}`,
  };
  return `${opening[planet] || `${planet} hadir ${signMeaning}`}. ${location} ${endings[planet]}`;
}

const aspectGrammar: Record<string, string> = { Conjunction: "menyatukan dan memperkuat", Opposition: "menarikmu melihat dua kebutuhan yang berseberangan", Square: "menciptakan gesekan yang mendorong latihan sadar", Trine: "mengalirkan bakat yang terasa alami", Sextile: "membuka peluang yang tumbuh jika kamu mengambil inisiatif" };
export function buildAspectNarrative(aspect: any): NatalAspectNarrative | null {
  const p1 = aspect.p1 || aspect.planet1; const p2 = aspect.p2 || aspect.planet2; const type = aspect.aspectType || aspect.type;
  if (!p1 || !p2 || !type || ((p1 === "NorthNode" && p2 === "SouthNode") || (p1 === "SouthNode" && p2 === "NorthNode"))) return null;
  const meaning = `${p1} membawa ${ASTRO_PLANET_MEANINGS[p1] || "satu sisi pengalaman"}, sementara ${p2} membawa ${ASTRO_PLANET_MEANINGS[p2] || "sisi pengalaman lain"}. Aspek ${type.toLowerCase()} ${aspectGrammar[type] || "membentuk hubungan dinamis"} di antara keduanya, sehingga pola ini dapat terasa dalam cara kamu mengambil keputusan dan merespons situasi. Kesadaran tumbuh ketika kedua fungsi diberi tempat, bukan ketika salah satunya ditekan.`;
  return { title: `${p1} ${type} ${p2}`, type, meaning };
}

export function buildNatalPresentation(astrology: any): { sections: NatalSection[]; aspects: NatalAspectNarrative[]; identity: NatalIdentityContext } {
  const planetNames = ["Sun", "Moon", "Ascendant", "Midheaven", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "NorthNode", "SouthNode", "Chiron"];
  const sections = planetNames.map((planet): NatalSection => { const sign = signOf(astrology, planet); const house = houseOf(astrology, planet); const available = Boolean(sign); const full = available ? planetNarrative(planet, sign!, house) : undefined; return { sectionId: planet.toLowerCase(), label: planet === "NorthNode" ? "Arah Utara" : planet === "SouthNode" ? "Pola Lama" : planet, planet, sign, house, degree: positionOf(astrology, planet)?.degree, retrograde: positionOf(astrology, planet)?.retrograde, shortExplanation: full ? first(full) : undefined, fullExplanation: full, sourceType: available ? "astrologyDictionaries" : "fallback", sourceVersion: NATAL_PRESENTATION_SOURCE, canonicalStatus: available ? "canonical" : "unavailable", availabilityStatus: available ? "available" : "unavailable" }; });
  const aspects = (Array.isArray(astrology.aspects) ? astrology.aspects : []).map(buildAspectNarrative).filter(Boolean) as NatalAspectNarrative[];
  const elements = astrology.elements || {}; const modalities = astrology.modalities || {};
  const dominantElements = Object.entries(elements).sort((a: any, b: any) => Number(b[1]) - Number(a[1])).slice(0, 2).map(([key]) => key);
  const dominantModalities = Object.entries(modalities).sort((a: any, b: any) => Number(b[1]) - Number(a[1])).slice(0, 2).map(([key]) => key);
  const houseCounts: Record<number, number> = {}; Object.values(astrology.planets || {}).forEach((p: any) => { const h = p?.placidusHouse || p?.house; if (h) houseCounts[h] = (houseCounts[h] || 0) + 1; });
  const houseEmphasis = Object.entries(houseCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([h, count]) => { const house = Number(h); const planets = Object.entries(astrology.planets || {}).filter(([, pos]: any) => (pos?.placidusHouse || pos?.house) === house).map(([planet]) => planet); const meta = NATAL_HOUSE_MEANINGS_ID[house] || { title: `Rumah ${h}`, desc: "area pengalaman yang sedang disorot" }; return { house, count, ...meta, explanation: buildHouseNarrative(house, planets) }; });
  const sun = signOf(astrology, "Sun"); const moon = signOf(astrology, "Moon"); const asc = signOf(astrology, "Ascendant"); const mc = signOf(astrology, "Midheaven"); const nn = signOf(astrology, "NorthNode");
  const sunHouse = houseOf(astrology, "Sun"); const moonHouse = houseOf(astrology, "Moon");
  const venusSign = signOf(astrology, "Venus"); const venusHouse = houseOf(astrology, "Venus");
  const ruler = asc ? CHART_RULERS[asc] : undefined; const rulerSign = ruler ? signOf(astrology, ruler) : undefined; const rulerHouse = ruler ? houseOf(astrology, ruler) : undefined;
  const topHouse = houseEmphasis[0]; const topAspect = (Array.isArray(astrology.aspects) ? astrology.aspects : []).map((item: any) => ({ raw: item, narrative: buildAspectNarrative(item) })).find((item: any) => item.narrative);
  const aspectType = topAspect?.raw?.aspectType || topAspect?.raw?.type; const aspectP1 = topAspect?.raw?.p1 || topAspect?.raw?.planet1; const aspectP2 = topAspect?.raw?.p2 || topAspect?.raw?.planet2;
  const summaryEvidence: NatalSummaryEvidence[] = [
    asc ? { sourceFactId: "natal.ascendant", chartFactor: `${asc} Ascendant`, role: "orientation", strength: 5, synthesisDimension: "outer-orientation" } : null,
    ruler ? { sourceFactId: `natal.planets.${ruler}`, chartFactor: `${ruler} in ${rulerSign || "unknown sign"} / House ${rulerHouse || "unknown"}`, role: "orientation", strength: 5, synthesisDimension: "chart-ruler" } : null,
    moon ? { sourceFactId: "natal.planets.Moon", chartFactor: `${moon} Moon / House ${moonHouse || "unknown"}`, role: "emotion", strength: 5, synthesisDimension: "emotional-safety" } : null,
    topHouse ? { sourceFactId: `natal.house.${topHouse.house}`, chartFactor: `${topHouse.count} planets in House ${topHouse.house}`, role: "contribution", strength: topHouse.count, synthesisDimension: "house-cluster" } : null,
    topAspect?.narrative ? { sourceFactId: `natal.aspect.${aspectP1}-${aspectType}-${aspectP2}`, chartFactor: `${aspectP1} ${aspectType} ${aspectP2}`, role: "integration", strength: 4, synthesisDimension: "major-aspect" } : null,
  ].filter((item): item is NatalSummaryEvidence => Boolean(item));
  const summary: string[] = [];
  if (asc || sun || ruler) summary.push(`${asc ? `Ascendant ${asc} membuat respons pertamamu bergerak ${ASTRO_SIGN_MEANINGS[asc] || "dengan ritme yang khas"}` : "Cara hadir lahirmu masih dibaca dari fakta yang tersedia"}. ${sun ? `Sun ${sun} di ${houseLabel(sunHouse)} menempatkan inti identitas pada ${houseText(sunHouse)?.desc || "pengalaman yang benar-benar kamu jalani"}.` : "Inti identitas belum memiliki posisi Sun yang cukup lengkap."} ${ruler ? `Sebagai penguasa chart, ${ruler} di ${rulerSign || "tanda yang tersedia"}${rulerHouse ? ` dan House ${rulerHouse}` : ""} membuat orientasi itu kembali pada ${houseText(rulerHouse)?.desc || "cara fungsi planet tersebut dijalankan"}.` : "Penguasa chart belum dapat dipastikan."}`);
  if (moon || venusSign) summary.push(`${moon ? `Moon ${moon} di ${houseLabel(moonHouse)} menunjukkan bahwa rasa aman dipulihkan melalui ${houseText(moonHouse)?.desc || "ritme emosional yang personal"}` : "Pola rasa aman masih perlu dibaca dari pengalaman langsung"}. ${venusSign ? `Venus ${venusSign}${venusHouse ? ` di House ${venusHouse}` : ""} membawa kebutuhan relasional yang ${ASTRO_SIGN_MEANINGS[venusSign] || "khas"}; kedekatan menjadi sehat ketika kebutuhan Moon dan cara Venus membangun nilai tidak saling menutupi.` : "Relasi menjadi lebih jernih ketika kebutuhan emosional dapat disebutkan tanpa asumsi."}`);
  if (topHouse || mc) summary.push(`${topHouse ? `Konsentrasi ${topHouse.count} planet di House ${topHouse.house} membuat ${topHouse.desc} menjadi arena kontribusi yang berulang` : "Belum ada satu cluster rumah yang dominan"}. ${mc ? `Midheaven ${mc} memberi warna ${ASTRO_SIGN_MEANINGS[mc] || "yang khas"} pada tanggung jawab publik,` : "Arah publik berkembang dari pengalaman,"} sehingga karya paling kuat saat dorongan ${dominantElements[0] ? `elemen ${dominantElements[0]}` : "utama"} diterjemahkan menjadi tanggung jawab yang sesuai dengan area hidup tersebut.`);
  if (topAspect?.narrative || nn || dominantModalities[0]) summary.push(`${topAspect?.narrative ? `${aspectP1} ${String(aspectType).toLowerCase()} ${aspectP2} menjadi ketegangan atau aliran utama yang perlu diintegrasikan, bukan dipilih salah satunya.` : "Integrasi berkembang melalui kemampuan membaca dua kebutuhan yang muncul bersamaan."} ${nn ? `North Node ${nn}${houseOf(astrology, "NorthNode") ? ` di House ${houseOf(astrology, "NorthNode")}` : ""} mengarahkan latihan menuju pengalaman yang belum selalu terasa otomatis.` : "Arah pertumbuhan dibaca dari pola yang tersedia."} ${dominantModalities[0] ? `Modalitas ${dominantModalities[0]} meminta caramu bergerak disadari agar kekuatan tidak berubah menjadi pola yang kaku.` : "Langkah kecil yang konsisten memberi ruang bagi pola ini untuk matang."}`);
  const elementNarrative = buildElementNarrative(elements);
  const modalityNarrative = buildModalityNarrative(modalities);
  const identity: NatalIdentityContext = { sun, moon, ascendant: asc, midheaven: mc, mercury: signOf(astrology, "Mercury"), venus: signOf(astrology, "Venus"), mars: signOf(astrology, "Mars"), jupiter: signOf(astrology, "Jupiter"), saturn: signOf(astrology, "Saturn"), uranus: signOf(astrology, "Uranus"), neptune: signOf(astrology, "Neptune"), pluto: signOf(astrology, "Pluto"), dominantElements, dominantModalities, majorAspects: aspects.map((a) => a.title), houseEmphasis, summaryEvidence, elementNarrative, modalityNarrative, strengths: dominantElements, challenges: dominantModalities, growthDirection: nn ? "Membangun ketenangan dan nilai yang nyata." : "Menemukan arah melalui pengalaman nyata.", summary, sourceVersion: NATAL_PRESENTATION_SOURCE };
  return { sections, aspects, identity };
}

export function getLilithPresentation(lilith: any) { return lilith?.sign ? LILITH_SIGN_MEANINGS[lilith.sign] : undefined; }
