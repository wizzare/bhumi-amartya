import {
  ASTRO_PLANET_MEANINGS,
  ASTRO_SIGN_MEANINGS,
  LILITH_SIGN_MEANINGS,
  ASTRO_PLANET_MEANINGS_EN,
  ASTRO_SIGN_MEANINGS_EN,
  ASTRO_HOUSE_MEANINGS_EN,
  ASTRO_ASPECT_MEANINGS_EN,
  LILITH_SIGN_MEANINGS_EN,
} from "@/lib/data/astrologyDictionaries";
import { isEnlEdition } from "@/lib/config/edition";

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
const houseText = (house?: number, isEn = isEnlEdition()) => house ? (isEn ? ASTRO_HOUSE_MEANINGS_EN[house] : NATAL_HOUSE_MEANINGS_ID[house]) : undefined;
const CHART_RULERS: Record<string, string> = { Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter" };
const houseLabel = (house?: number, isEn = isEnlEdition()) => house ? `House ${house} (${(isEn ? ASTRO_HOUSE_MEANINGS_EN[house]?.title : NATAL_HOUSE_MEANINGS_ID[house]?.title) || (isEn ? "life domain" : "area kehidupan")})` : (isEn ? "domain with incomplete house data" : "area yang belum memiliki data rumah lengkap");

export function buildElementNarrative(elements: Record<string, number>, isEn = isEnlEdition()): string {
  const ordered = Object.entries(elements).sort((a, b) => b[1] - a[1]);
  if (!ordered.length || ordered.every(([, value]) => !value)) return isEn ? "Element composition is not yet available for a complete reading." : "Komposisi elemen belum tersedia untuk dibaca dengan utuh.";
  const lead = ordered[0][0];

  if (isEn) {
    const storiesEn: Record<string, string> = {
      Air: "You possess a lively, agile mind that quickly connects diverse concepts and perceives possibilities that others might overlook. Curiosity inspires you to communicate, explore, and initiate dialogue. You feel most integrated when pausing to allow your body and emotions to anchor your swift ideas into practical reality.",
      Fire: "Within you burns an authentic spark that readily finds the courage to take initiative. When something resonates deeply, you move with infectious vitality and inspire those around you. Taking intentional moments to pause keeps this inner fire warm and generative without depleting your reserves.",
      Earth: "You have a grounded inclination toward building things that are tangible, reliable, and enduring. Your steady perseverance gives solid form to visions so they do not remain mere theories. Maintaining flexibility ensures that your desire for stability stays open to fruitful evolution.",
      Water: "You are finely attuned to emotional atmospheres, unspoken nuances, and subtle shifts in feeling. Intuition and sensitivity often guide your understanding long before words take shape. Gentle personal boundaries allow you to remain empathetic and deeply connected without carrying burdens that belong to others.",
    };
    return storiesEn[lead] || "Your natural way of engaging life carries a distinct rhythm that matures through direct experience. Grounded strength arises as you trust your innate responses while staying rooted in reality. Intentional pauses and somatic care help keep your journey balanced.";
  }

  const stories: Record<string, string> = {
    Air: "Kamu punya pikiran yang hidup, cepat menangkap banyak hal, dan sering melihat kemungkinan yang belum langsung terlihat oleh orang lain. Ada dorongan untuk menghubungkan gagasan, berbicara, dan bergerak ketika rasa ingin tahu menyala. Kamu semakin utuh saat memberi jeda bagi tubuh dan perasaan agar langkah yang cepat tetap punya pijakan.",
    Fire: "Di dalam dirimu ada nyala yang membuatmu mudah menemukan keberanian untuk memulai. Ketika sesuatu terasa penting, kamu dapat bergerak dengan antusias dan menularkan semangat itu kepada sekitar. Ruang untuk berhenti sejenak membantu dorongan ini tetap hangat tanpa menghabiskan tenaga.",
    Earth: "Kamu cenderung mencari sesuatu yang dapat dipegang, dirawat, dan dibangun sedikit demi sedikit. Ketekunanmu memberi bentuk pada gagasan sehingga tidak berhenti sebagai rencana. Kelenturan tetap penting agar kebutuhan akan kepastian tidak menutup pintu bagi kemungkinan baru.",
    Water: "Kamu peka terhadap suasana, perubahan nada, dan hal-hal yang tidak selalu terucap. Perasaan sering menjadi jalan penting untuk memahami apa yang sedang terjadi, bahkan sebelum pikiran menemukan namanya. Batas yang lembut membantumu tetap dekat dengan rasa tanpa ikut membawa semua beban di sekitarmu.",
  };
  return stories[lead] || "Cara kamu menjalani hidup memiliki ritme yang khas dan terus berkembang melalui pengalaman. Ada kekuatan yang muncul saat kamu mempercayai respons alami tanpa kehilangan kehadiran pada keadaan nyata. Jeda dan perhatian pada tubuh membantu langkahmu tetap seimbang.";
}

export function buildModalityNarrative(modalities: Record<string, number>, isEn = isEnlEdition()): string {
  const ordered = Object.entries(modalities).sort((a, b) => b[1] - a[1]);
  if (!ordered.length || ordered.every(([, value]) => !value)) return isEn ? "Modality patterns are not yet available for a complete reading." : "Pola modalitas belum tersedia untuk dibaca dengan utuh.";
  const lead = ordered[0][0];

  if (isEn) {
    const storiesEn: Record<string, string> = {
      Cardinal: "You possess a natural drive to pioneer new paths and take decisive first steps when a vision is clear. As you initiate, you learn to pace yourself so early enthusiasm evolves into sustained momentum. Patience with the process blends your courage with perseverance.",
      Fixed: "When a path or value holds authentic meaning, you hold the course with unwavering loyalty despite external shifts. Your steadfast presence offers reassurance and reliable grounding to those around you. You expand further when welcoming thoughtful adjustments without viewing change as defeat.",
      Mutable: "You navigate changing circumstances with ease, readily discovering alternative pathways when old plans no longer serve. This adaptability enables you to absorb wisdom from diverse encounters without losing your core essence. A simple guiding compass keeps flexibility directed toward meaningful progress.",
    };
    return storiesEn[lead] || "Your natural approach weaves together initiating, sustaining, and adapting as life invites. Your greatest strength emerges when unwavering focus remains receptive to fresh exploration.";
  }

  const stories: Record<string, string> = {
    Cardinal: "Kamu punya dorongan untuk membuka jalan dan mengambil langkah pertama ketika arah sudah terasa jelas. Setelah bergerak, kamu belajar menjaga tenaga agar permulaan itu tidak berhenti sebagai percobaan sesaat. Kesabaran pada proses membantu keberanianmu bertemu ketekunan dan keluwesan.",
    Fixed: "Ketika sesuatu sudah kamu anggap penting, kamu mampu menjaganya tetap berjalan meski keadaan berubah. Kesetiaan pada arah memberi rasa kuat dan dapat diandalkan bagi orang di sekitarmu. Kamu semakin lapang saat memberi ruang bagi penyesuaian tanpa menganggap perubahan sebagai kegagalan.",
    Mutable: "Kamu mudah membaca perubahan suasana dan menemukan cara baru ketika rencana lama tidak lagi pas. Keluwesan ini membuatmu mampu belajar dari banyak pengalaman tanpa harus terpaku pada satu bentuk. Arah yang sederhana membantu adaptasi tetap menjadi gerak maju, bukan kehilangan pijakan.",
  };
  return stories[lead] || "Kamu memiliki cara bergerak yang dapat memulai, menjaga, dan menyesuaikan diri sesuai kebutuhan. Kekuatanmu muncul saat keteguhan tidak menutup percobaan baru. Ritme yang lentur membuat perubahan terasa lebih bisa diolah.";
}

export function buildHouseNarrative(house: number, planets: string[] = [], isEn = isEnlEdition()): string {
  const emphasis = planets.length
    ? (isEn ? " Your attention repeatedly circles back here in daily decisions." : " Perhatianmu berulang kali kembali ke sini dalam pilihan sehari-hari.")
    : (isEn ? " There is a clear reason why your attention frequently returns to this area." : " Ada alasan mengapa perhatianmu sering kembali ke sini.");

  if (isEn) {
    const invitationEn: Record<number, string> = {
      4: "Your inner strength flourishes when emotional safety is built upon authentic vulnerability and mutual care, rather than attempting to keep everything unchanged.",
      9: "Clarity expands when new perspectives are allowed to reshape your worldview, rather than remaining purely intellectual theories.",
      10: "Mature contribution takes shape when public responsibility remains anchored in personal values, rather than merely outward markers of success.",
    };
    const livedEn: Record<number, string> = {
      4: `There is a foundational need for a sanctuary where you feel truly safe and belonging.${emphasis} Intimacy becomes strength when healthy boundaries walk hand-in-hand with warmth. ${invitationEn[4]}`,
      9: `Curiosity drives you toward deeper meaning beyond surface-level explanations.${emphasis} Immersing in learning, exploring philosophies, or traveling broadens how you perceive your place in the world. ${invitationEn[9]}`,
      10: `There is an ambition to craft something lasting, useful, and publicly meaningful.${emphasis} Public responsibility is most sustainable when it is not made the sole measure of your self-worth. ${invitationEn[10]}`,
    };
    return livedEn[house] || `This life domain invites your honest and compassionate attention.${emphasis} ${invitationEn[house] || "Gentle, consistent mindfulness helps this area flourish without turning into pressure."}`;
  }

  const invitation: Record<number, string> = { 4: "Kekuatanmu tumbuh saat rasa aman dibangun dari hubungan dan batas yang nyata, bukan dari usaha memegang semua hal tetap sama.", 9: "Kejernihan datang ketika wawasan baru diberi waktu untuk mengubah cara pandang, bukan hanya menjadi pengetahuan yang disimpan.", 10: "Arah matang terbentuk ketika tanggung jawab publik tetap terhubung dengan nilai pribadi, bukan sekadar pencapaian yang terlihat." };
  const lived: Record<number, string> = { 4: `Ada kebutuhan untuk memiliki tempat pulang yang terasa aman, baik secara lahir maupun batin.${emphasis} Kedekatan menjadi kekuatan ketika perlindungan diri tetap berjalan bersama keberanian untuk menerima kehangatan. ${invitation[4]}`, 9: `Rasa ingin tahu membawamu mencari makna yang lebih luas daripada jawaban pertama.${emphasis} Belajar, bertukar sudut pandang, atau menjelajah gagasan dapat mengubah cara kamu melihat hidup. ${invitation[9]}`, 10: `Ada dorongan untuk membangun sesuatu yang berguna dan dapat dirasakan orang lain.${emphasis} Tanggung jawab publik menjadi lebih sehat ketika tidak dijadikan satu-satunya ukuran harga diri. ${invitation[10]}` };
  return lived[house] || `Bagian hidup ini sedang meminta perhatian yang lebih jujur.${emphasis} ${invitation[house] || "Perhatian yang lembut dan konsisten membantu area ini berkembang tanpa menjadi tuntutan."}`;
}

function planetNarrative(planet: string, sign: string, house?: number, isEn = isEnlEdition()): string {
  if (isEn) {
    const signMeaning = ASTRO_SIGN_MEANINGS_EN[sign] || "with a distinctive expression";
    const area = houseText(house, true);
    const location = area ? `In ${area.title.toLowerCase()}, this touches ${area.desc}.` : "Without complete house data, this tone reflects your sign and lived experience.";
    const endings: Record<string, string> = {
      Sun: `Its mature expression is staying warm and generous without needing excessive control.`,
      Moon: `Inner safety deepens when your desire for peace does not shy away from honest conversations.`,
      Ascendant: `You thrive by honoring spontaneity while remaining anchored in your authentic nature.`,
      Midheaven: `Your contribution strengthens when depth is used to heal and uplift rather than dominate.`,
      Mercury: `Clarity flourishes when lively curiosity is balanced with patience to let ideas settle.`,
      Venus: `Relational depth stays healthy when self-worth is not outsourced to external validation.`,
      Mars: `Your courage serves you best when channeled into clear intention rather than hasty reaction.`,
      Jupiter: `Expansive growth comes through wisdom that broadens your horizon, not mere optimism.`,
      Saturn: `The boundaries you build can become wise maturity rather than self-punishment.`,
      Uranus: `Freedom becomes truly meaningful when progressive vision honors human connection.`,
      Neptune: `Sensitivity stays clear and luminous when imagination is anchored by grounded discernment.`,
      Pluto: `Transformation becomes strength when you bravely release outmoded power dynamics.`,
      NorthNode: `This direction is practiced step-by-step through simple, conscious everyday choices.`,
      SouthNode: `Familiar strengths remain useful when not used as a refuge to avoid new growth.`,
      Chiron: `Healing emerges through the courage to be present without demanding perfection.`,
    };
    const functionMeaning = ASTRO_PLANET_MEANINGS_EN[planet] || "an area of experience you are recognizing";
    const opening: Record<string, string> = {
      Sun: `Your life force centers around ${functionMeaning}; in ${sign}, this moves ${signMeaning}`,
      Moon: `Your emotional needs and instinctual responses unfold ${signMeaning}`,
      Ascendant: `Your natural interface with the world emerges ${signMeaning}`,
      Midheaven: `In the public sphere, your vocational contribution carries ${signMeaning}`,
      Mercury: `Your mind and communication style operate ${signMeaning}`,
      Venus: `In love, harmony, and core values, you express yourself ${signMeaning}`,
      Mars: `Your drive to act, initiate, and persevere emerges ${signMeaning}`,
      Jupiter: `Your urge to expand, learn, and discover meaning moves ${signMeaning}`,
      Saturn: `Your lessons around accountability, boundaries, and mastery unfold ${signMeaning}`,
      Uranus: `Your impulse for innovation, independence, and renewal expresses ${signMeaning}`,
      Neptune: `Your imagination, empathy, and spiritual receptivity flow ${signMeaning}`,
      Pluto: `Deep psychological regeneration and personal transformation move ${signMeaning}`,
      NorthNode: `The growth trajectory you are cultivating unfolds ${signMeaning}`,
      SouthNode: `Familiar instinctual patterns operate ${signMeaning}`,
      Chiron: `The tender sensitivity that invites healing awareness surfaces ${signMeaning}`,
    };
    return `${opening[planet] || `${planet} expresses ${signMeaning}`}. ${location} ${endings[planet] || ""}`;
  }

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
const aspectGrammarEn: Record<string, string> = {
  Conjunction: "unites and amplifies",
  Opposition: "draws attention to two opposing yet complementary needs",
  Square: "creates constructive friction that catalyzes conscious growth",
  Trine: "channels natural ease and innate talent",
  Sextile: "opens supportive opportunities that flourish with conscious initiative",
};

export function buildAspectNarrative(aspect: any, isEn = isEnlEdition()): NatalAspectNarrative | null {
  const p1 = aspect.p1 || aspect.planet1; const p2 = aspect.p2 || aspect.planet2; const type = aspect.aspectType || aspect.type;
  if (!p1 || !p2 || !type || ((p1 === "NorthNode" && p2 === "SouthNode") || (p1 === "SouthNode" && p2 === "NorthNode"))) return null;

  if (isEn) {
    const meaning = `${p1} carries ${ASTRO_PLANET_MEANINGS_EN[p1] || "one dimension of experience"}, while ${p2} brings ${ASTRO_PLANET_MEANINGS_EN[p2] || "another facet of life"}. A ${type.toLowerCase()} aspect ${aspectGrammarEn[type] || "forms a dynamic relationship"} between them, shaping how you make decisions and respond to situations. Awareness deepens when both functions are honored rather than either being suppressed.`;
    return { title: `${p1} ${type} ${p2}`, type, meaning };
  }

  const meaning = `${p1} membawa ${ASTRO_PLANET_MEANINGS[p1] || "satu sisi pengalaman"}, sementara ${p2} membawa ${ASTRO_PLANET_MEANINGS[p2] || "sisi pengalaman lain"}. Aspek ${type.toLowerCase()} ${aspectGrammar[type] || "membentuk hubungan dinamis"} di antara keduanya, sehingga pola ini dapat terasa dalam cara kamu mengambil keputusan dan merespons situasi. Kesadaran tumbuh ketika kedua fungsi diberi tempat, bukan ketika salah satunya ditekan.`;
  return { title: `${p1} ${type} ${p2}`, type, meaning };
}

export function buildNatalPresentation(astrology: any, options: { isEn?: boolean } = {}): { sections: NatalSection[]; aspects: NatalAspectNarrative[]; identity: NatalIdentityContext } {
  const isEn = options.isEn ?? isEnlEdition();
  const planetNames = ["Sun", "Moon", "Ascendant", "Midheaven", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "NorthNode", "SouthNode", "Chiron"];
  const sections = planetNames.map((planet): NatalSection => {
    const sign = signOf(astrology, planet);
    const house = houseOf(astrology, planet);
    const available = Boolean(sign);
    const full = available ? planetNarrative(planet, sign!, house, isEn) : undefined;
    const label = isEn
      ? (planet === "NorthNode" ? "North Node" : planet === "SouthNode" ? "South Node" : planet)
      : (planet === "NorthNode" ? "Arah Utara" : planet === "SouthNode" ? "Pola Lama" : planet);
    return {
      sectionId: planet.toLowerCase(),
      label,
      planet,
      sign,
      house,
      degree: positionOf(astrology, planet)?.degree,
      retrograde: positionOf(astrology, planet)?.retrograde,
      shortExplanation: full ? first(full) : undefined,
      fullExplanation: full,
      sourceType: available ? "astrologyDictionaries" : "fallback",
      sourceVersion: NATAL_PRESENTATION_SOURCE,
      canonicalStatus: available ? "canonical" : "unavailable",
      availabilityStatus: available ? "available" : "unavailable",
    };
  });
  const aspects = (Array.isArray(astrology.aspects) ? astrology.aspects : []).map((aspect: any) => buildAspectNarrative(aspect, isEn)).filter(Boolean) as NatalAspectNarrative[];
  const elements = astrology.elements || {}; const modalities = astrology.modalities || {};
  const dominantElements = Object.entries(elements).sort((a: any, b: any) => Number(b[1]) - Number(a[1])).slice(0, 2).map(([key]) => key);
  const dominantModalities = Object.entries(modalities).sort((a: any, b: any) => Number(b[1]) - Number(a[1])).slice(0, 2).map(([key]) => key);
  const houseCounts: Record<number, number> = {}; Object.values(astrology.planets || {}).forEach((p: any) => { const h = p?.placidusHouse || p?.house; if (h) houseCounts[h] = (houseCounts[h] || 0) + 1; });
  const houseEmphasis = Object.entries(houseCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([h, count]) => {
    const house = Number(h);
    const planets = Object.entries(astrology.planets || {}).filter(([, pos]: any) => (pos?.placidusHouse || pos?.house) === house).map(([planet]) => planet);
    const meta = isEn
      ? (ASTRO_HOUSE_MEANINGS_EN[house] || { title: `House ${h}`, desc: "highlighted area of experience" })
      : (NATAL_HOUSE_MEANINGS_ID[house] || { title: `Rumah ${h}`, desc: "area pengalaman yang sedang disorot" });
    return { house, count, ...meta, explanation: buildHouseNarrative(house, planets, isEn) };
  });
  const sun = signOf(astrology, "Sun"); const moon = signOf(astrology, "Moon"); const asc = signOf(astrology, "Ascendant"); const mc = signOf(astrology, "Midheaven"); const nn = signOf(astrology, "NorthNode");
  const sunHouse = houseOf(astrology, "Sun"); const moonHouse = houseOf(astrology, "Moon");
  const venusSign = signOf(astrology, "Venus"); const venusHouse = houseOf(astrology, "Venus");
  const ruler = asc ? CHART_RULERS[asc] : undefined; const rulerSign = ruler ? signOf(astrology, ruler) : undefined; const rulerHouse = ruler ? houseOf(astrology, ruler) : undefined;
  const topHouse = houseEmphasis[0]; const topAspect = (Array.isArray(astrology.aspects) ? astrology.aspects : []).map((item: any) => ({ raw: item, narrative: buildAspectNarrative(item, isEn) })).find((item: any) => item.narrative);
  const aspectType = topAspect?.raw?.aspectType || topAspect?.raw?.type; const aspectP1 = topAspect?.raw?.p1 || topAspect?.raw?.planet1; const aspectP2 = topAspect?.raw?.p2 || topAspect?.raw?.planet2;
  const summaryEvidence: NatalSummaryEvidence[] = [
    asc ? { sourceFactId: "natal.ascendant", chartFactor: `${asc} Ascendant`, role: "orientation", strength: 5, synthesisDimension: "outer-orientation" } : null,
    ruler ? { sourceFactId: `natal.planets.${ruler}`, chartFactor: `${ruler} in ${rulerSign || "unknown sign"} / House ${rulerHouse || "unknown"}`, role: "orientation", strength: 5, synthesisDimension: "chart-ruler" } : null,
    moon ? { sourceFactId: "natal.planets.Moon", chartFactor: `${moon} Moon / House ${moonHouse || "unknown"}`, role: "emotion", strength: 5, synthesisDimension: "emotional-safety" } : null,
    topHouse ? { sourceFactId: `natal.house.${topHouse.house}`, chartFactor: `${topHouse.count} planets in House ${topHouse.house}`, role: "contribution", strength: topHouse.count, synthesisDimension: "house-cluster" } : null,
    topAspect?.narrative ? { sourceFactId: `natal.aspect.${aspectP1}-${aspectType}-${aspectP2}`, chartFactor: `${aspectP1} ${aspectType} ${aspectP2}`, role: "integration", strength: 4, synthesisDimension: "major-aspect" } : null,
  ].filter((item): item is NatalSummaryEvidence => Boolean(item));
  const summary: string[] = [];

  if (isEn) {
    if (asc || sun || ruler) summary.push(`${asc ? `Ascendant in ${asc} guides your initial approach ${ASTRO_SIGN_MEANINGS_EN[asc] || "with a distinct cadence"}` : "Your outer approach is drawn from available baseline placements"}. ${sun ? `Sun in ${sun} within ${houseLabel(sunHouse, true)} anchors core identity in ${houseText(sunHouse, true)?.desc || "direct lived experience"}.` : "Core identity awaits a complete Sun placement."} ${ruler ? `As chart ruler, ${ruler} in ${rulerSign || "the available sign"}${rulerHouse ? ` and House ${rulerHouse}` : ""} focuses your orientation toward ${houseText(rulerHouse, true)?.desc || "how this planetary energy is embodied"}.` : "Chart ruler could not be definitively determined."}`);
    if (moon || venusSign) summary.push(`${moon ? `Moon in ${moon} within ${houseLabel(moonHouse, true)} indicates that emotional safety is replenished through ${houseText(moonHouse, true)?.desc || "personal emotional rhythms"}` : "Emotional security patterns require direct lived reflection"}. ${venusSign ? `Venus in ${venusSign}${venusHouse ? ` in House ${venusHouse}` : ""} brings relational desires that are ${ASTRO_SIGN_MEANINGS_EN[venusSign] || "distinctive"}; intimacy flourishes when Moon's needs and Venus's values complement each other.` : "Relationships clarify when emotional needs can be spoken without assumptions."}`);
    if (topHouse || mc) summary.push(`${topHouse ? `A concentration of ${topHouse.count} planets in House ${topHouse.house} makes ${topHouse.desc} an enduring sphere of contribution` : "No single house cluster dominates"}. ${mc ? `Midheaven in ${mc} imparts ${ASTRO_SIGN_MEANINGS_EN[mc] || "a distinct quality"} to public vocation,` : "Public direction matures from lived practice,"} so your work is most powerful when ${dominantElements[0] ? `${dominantElements[0]} element energy` : "core drive"} is translated into responsibility aligned with that life area.`);
    if (topAspect?.narrative || nn || dominantModalities[0]) summary.push(`${topAspect?.narrative ? `${aspectP1} ${String(aspectType).toLowerCase()} ${aspectP2} forms a primary dynamic tension or flow to integrate, rather than choosing one over the other.` : "Integration grows through holding two concurrent needs with awareness."} ${nn ? `North Node in ${nn}${houseOf(astrology, "NorthNode") ? ` in House ${houseOf(astrology, "NorthNode")}` : ""} gently points growth toward experiences that do not feel automatically habitual.` : "Growth direction is drawn from available patterns."} ${dominantModalities[0] ? `A dominant ${dominantModalities[0]} modality invites mindful pacing so strengths remain supple rather than rigid.` : "Consistent, steady steps allow these qualities to mature."}`);
  } else {
    if (asc || sun || ruler) summary.push(`${asc ? `Ascendant ${asc} membuat respons pertamamu bergerak ${ASTRO_SIGN_MEANINGS[asc] || "dengan ritme yang khas"}` : "Cara hadir lahirmu masih dibaca dari fakta yang tersedia"}. ${sun ? `Sun ${sun} di ${houseLabel(sunHouse, false)} menempatkan inti identitas pada ${houseText(sunHouse, false)?.desc || "pengalaman yang benar-benar kamu jalani"}.` : "Inti identitas belum memiliki posisi Sun yang cukup lengkap."} ${ruler ? `Sebagai penguasa chart, ${ruler} di ${rulerSign || "tanda yang tersedia"}${rulerHouse ? ` dan House ${rulerHouse}` : ""} membuat orientasi itu kembali pada ${houseText(rulerHouse, false)?.desc || "cara fungsi planet tersebut dijalankan"}.` : "Penguasa chart belum dapat dipastikan."}`);
    if (moon || venusSign) summary.push(`${moon ? `Moon ${moon} di ${houseLabel(moonHouse, false)} menunjukkan bahwa rasa aman dipulihkan melalui ${houseText(moonHouse, false)?.desc || "ritme emosional yang personal"}` : "Pola rasa aman masih perlu dibaca dari pengalaman langsung"}. ${venusSign ? `Venus ${venusSign}${venusHouse ? ` di House ${venusHouse}` : ""} membawa kebutuhan relasional yang ${ASTRO_SIGN_MEANINGS[venusSign] || "khas"}; kedekatan menjadi sehat ketika kebutuhan Moon dan cara Venus membangun nilai tidak saling menutupi.` : "Relasi menjadi lebih jernih ketika kebutuhan emosional dapat disebutkan tanpa asumsi."}`);
    if (topHouse || mc) summary.push(`${topHouse ? `Konsentrasi ${topHouse.count} planet di House ${topHouse.house} membuat ${topHouse.desc} menjadi arena kontribusi yang berulang` : "Belum ada satu cluster rumah yang dominan"}. ${mc ? `Midheaven ${mc} memberi warna ${ASTRO_SIGN_MEANINGS[mc] || "yang khas"} pada tanggung jawab publik,` : "Arah publik berkembang dari pengalaman,"} sehingga karya paling kuat saat dorongan ${dominantElements[0] ? `elemen ${dominantElements[0]}` : "utama"} diterjemahkan menjadi tanggung jawab yang sesuai dengan area hidup tersebut.`);
    if (topAspect?.narrative || nn || dominantModalities[0]) summary.push(`${topAspect?.narrative ? `${aspectP1} ${String(aspectType).toLowerCase()} ${aspectP2} menjadi ketegangan atau aliran utama yang perlu diintegrasikan, bukan dipilih salah satunya.` : "Integrasi berkembang melalui kemampuan membaca dua kebutuhan yang muncul bersamaan."} ${nn ? `North Node ${nn}${houseOf(astrology, "NorthNode") ? ` di House ${houseOf(astrology, "NorthNode")}` : ""} mengarahkan latihan menuju pengalaman yang belum selalu terasa otomatis.` : "Arah pertumbuhan dibaca dari pola yang tersedia."} ${dominantModalities[0] ? `Modalitas ${dominantModalities[0]} meminta caramu bergerak disadari agar kekuatan tidak berubah menjadi pola yang kaku.` : "Langkah kecil yang konsisten memberi ruang bagi pola ini untuk matang."}`);
  }

  const elementNarrative = buildElementNarrative(elements, isEn);
  const modalityNarrative = buildModalityNarrative(modalities, isEn);
  const identity: NatalIdentityContext = {
    sun, moon, ascendant: asc, midheaven: mc, mercury: signOf(astrology, "Mercury"), venus: signOf(astrology, "Venus"),
    mars: signOf(astrology, "Mars"), jupiter: signOf(astrology, "Jupiter"), saturn: signOf(astrology, "Saturn"),
    uranus: signOf(astrology, "Uranus"), neptune: signOf(astrology, "Neptune"), pluto: signOf(astrology, "Pluto"),
    dominantElements, dominantModalities, majorAspects: aspects.map((a) => a.title), houseEmphasis, summaryEvidence,
    elementNarrative, modalityNarrative, strengths: dominantElements, challenges: dominantModalities,
    growthDirection: isEn
      ? (nn ? "Cultivating serenity and tangible values." : "Discovering direction through lived experience.")
      : (nn ? "Membangun ketenangan dan nilai yang nyata." : "Menemukan arah melalui pengalaman nyata."),
    summary,
    sourceVersion: NATAL_PRESENTATION_SOURCE,
  };
  return { sections, aspects, identity };
}

export function getLilithPresentation(lilith: any, isEn = isEnlEdition()) {
  if (!lilith?.sign) return undefined;
  return isEn ? LILITH_SIGN_MEANINGS_EN[lilith.sign] : LILITH_SIGN_MEANINGS[lilith.sign];
}
