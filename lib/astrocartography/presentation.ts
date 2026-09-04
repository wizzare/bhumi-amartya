import type { AstrocartographyPlace } from "./locations";
import { analyzeAstrocartographyLocation } from "./calculateAstrocartography";
import { isEnlEdition } from "@/lib/config/edition";
import type { AstrocartographyAngle, AstrocartographyBodyName, AstrocartographyCuratedLocationResult, AstrocartographyLine, AstrocartographyLocationAnalysis, AstrocartographyLocationLinePresentation, AstrocartographyLocationPresentation, AstrocartographyOverallLocationSummary, AstrocartographyPresentation, AstrocartographyResult } from "./types";

const BODY_THEME: Record<AstrocartographyBodyName, { function: string; support: string; challenge: string; invitation: string }> = {
  Sun: { function: "identitas, vitalitas, dan tujuan", support: "keberanian memperlihatkan diri dan menghidupkan karya", challenge: "kebutuhan akan pengakuan dapat terasa lebih kuat", invitation: "jaga agar visibilitas tetap terhubung dengan nilai pribadi" },
  Moon: { function: "rasa aman, naluri, dan kebutuhan untuk merasa memiliki", support: "kepekaan terhadap suasana dan kebutuhan emosional", challenge: "perubahan suasana dapat terasa lebih dekat dan pribadi", invitation: "beri tubuh dan perasaan waktu untuk menyesuaikan diri" },
  Mercury: { function: "komunikasi, belajar, dan pergerakan", support: "percakapan, pertukaran gagasan, serta rasa ingin tahu", challenge: "pikiran dapat bergerak terlalu cepat atau tersebar", invitation: "pilih informasi yang benar-benar perlu ditindaklanjuti" },
  Venus: { function: "kasih, nilai, keindahan, dan kemudahan sosial", support: "keterhubungan, kreativitas, dan penerimaan", challenge: "keinginan menyenangkan semua pihak dapat mengaburkan batas", invitation: "rawat kedekatan tanpa meninggalkan nilai diri" },
  Mars: { function: "dorongan, keberanian, dan inisiatif", support: "tindakan langsung dan keberanian memulai", challenge: "gesekan atau ketergesaan dapat lebih mudah muncul", invitation: "salurkan tenaga ke tindakan yang jelas dan terukur" },
  Jupiter: { function: "pertumbuhan, makna, dan perluasan wawasan", support: "belajar, mengajar, serta melihat kemungkinan lebih luas", challenge: "harapan dapat tumbuh lebih cepat daripada pijakan nyata", invitation: "periksa peluang dengan pengalaman dan ukuran yang realistis" },
  Saturn: { function: "tanggung jawab, batas, dan pematangan", support: "disiplin, ketahanan, dan kemampuan membangun", challenge: "beban atau keterbatasan dapat terasa lebih nyata", invitation: "bangun perlahan tanpa menjadikan kesulitan sebagai hukuman diri" },
  Uranus: { function: "perubahan, kebebasan, dan orisinalitas", support: "percobaan baru dan keberanian keluar dari pola lama", challenge: "ritme dapat terasa tidak stabil atau sulit diprediksi", invitation: "sisakan struktur yang cukup agar kebebasan tetap dapat dijalani" },
  Neptune: { function: "imajinasi, spiritualitas, kepekaan, dan ambiguitas", support: "kreativitas, belas kasih, serta ruang batin", challenge: "batas dan arah dapat terasa kabur", invitation: "temani intuisi dengan verifikasi dan batas yang membumi" },
  Pluto: { function: "kuasa, intensitas, dan transformasi", support: "keberanian menghadapi pola mendalam dan memperbarui diri", challenge: "persoalan kendali dapat terasa lebih menonjol", invitation: "gunakan daya untuk mengubah, bukan memaksa" },
};

const BODY_THEME_EN: Record<AstrocartographyBodyName, { function: string; support: string; challenge: string; invitation: string }> = {
  Sun: { function: "identity, vitality, and life purpose", support: "courage to express yourself and bring your work into visibility", challenge: "the craving for external validation may intensify", invitation: "keep your visibility anchored to personal integrity" },
  Moon: { function: "security, instinct, and the need for belonging", support: "attunement to emotional climate and human needs", challenge: "mood shifts and vulnerability may feel more acute and personal", invitation: "give body and feelings time to acclimate to new settings" },
  Mercury: { function: "communication, learning, and mental agility", support: "lively discourse, exchanging concepts, and intellectual curiosity", challenge: "the mind can race or scatter in too many directions", invitation: "focus on insights that genuinely warrant grounded action" },
  Venus: { function: "affection, aesthetic appreciation, and social grace", support: "warm connections, artistic expression, and harmonious rapport", challenge: "the impulse to appease others can blur personal boundaries", invitation: "cultivate closeness without relinquishing your authentic values" },
  Mars: { function: "drive, courage, and decisive initiative", support: "direct action, assertiveness, and momentum to begin", challenge: "friction, impatience, or hasty reactivity can easily arise", invitation: "channel vitality into focused, measurable endeavors" },
  Jupiter: { function: "expansion, meaningful wisdom, and broadening horizons", support: "learning, teaching, mentorship, and envisioning larger possibilities", challenge: "expectations can outpace grounded reality", invitation: "evaluate emerging opportunities with practical discernment" },
  Saturn: { function: "responsibility, healthy boundaries, and mature mastery", support: "enduring discipline, resilience, and architectural building", challenge: "burdens, obligations, or limitations may feel heavier", invitation: "build step by step without equating hardship with self-punishment" },
  Uranus: { function: "breakthroughs, liberation, and inventive originality", support: "fresh experiments and breaking free from outdated paradigms", challenge: "rhythms can feel unstable, erratic, or unpredictable", invitation: "preserve enough grounding structure so freedom remains sustainable" },
  Neptune: { function: "imagination, spiritual devotion, subtlety, and dissolution", support: "creativity, empathy, transcendence, and contemplative stillness", challenge: "boundaries and directional clarity can become hazy", invitation: "pair intuition with grounded verification and clear limits" },
  Pluto: { function: "empowerment, psychological depth, and catalytic renewal", support: "fearlessness in confronting deep patterns and profound self-reinvention", challenge: "power struggles and obsessive control may heighten", invitation: "use personal power to transform rather than to coerce" },
};

const BODY_SYMBOL: Record<AstrocartographyBodyName, string> = { Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇" };
const BODY_POTENTIAL: Record<AstrocartographyBodyName, string[]> = {
  Sun: ["kepemimpinan", "ekspresi diri", "karya yang terasa personal"], Moon: ["perawatan", "komunitas", "kehidupan yang peka pada kebutuhan manusia"],
  Mercury: ["belajar", "menulis dan berbicara", "pertukaran gagasan"], Venus: ["kreativitas", "relasi sosial", "estetika dan presentasi"],
  Mars: ["inisiatif", "kerja yang membutuhkan keberanian", "kolaborasi aktif"], Jupiter: ["pendidikan", "pengajaran", "perluasan wawasan"],
  Saturn: ["karya jangka panjang", "tanggung jawab", "pembangunan struktur"], Uranus: ["inovasi", "eksperimen", "perubahan pola"],
  Neptune: ["kontemplasi", "karya kreatif", "praktik spiritual yang membumi"], Pluto: ["transformasi", "riset mendalam", "pembaruan pola hidup"],
};

const BODY_POTENTIAL_EN: Record<AstrocartographyBodyName, string[]> = {
  Sun: ["leadership", "creative self-expression", "personally resonant work"],
  Moon: ["nurturing", "community building", "emotionally attuned living"],
  Mercury: ["study and scholarship", "writing and speaking", "dynamic idea exchange"],
  Venus: ["creative arts", "social connections", "aesthetics and presentation"],
  Mars: ["bold initiative", "courageous action", "active enterprise"],
  Jupiter: ["higher education", "teaching and mentorship", "expanding horizons"],
  Saturn: ["long-term building", "disciplined responsibility", "structural establishment"],
  Uranus: ["innovation", "creative experimentation", "breaking old molds"],
  Neptune: ["contemplation", "artistic immersion", "grounded spiritual practice"],
  Pluto: ["deep transformation", "penetrating inquiry", "personal regeneration"],
};

const ANGLE_SENTENCE: Record<AstrocartographyAngle, string> = {
  MC: "Tema ini mungkin lebih menonjol melalui karya, kontribusi, reputasi, dan kehidupan publik.",
  IC: "Tema ini mungkin lebih menonjol melalui rumah, keluarga, akar, dan fondasi batin.",
  ASC: "Tema ini mungkin lebih menonjol melalui tubuh, identitas, awal baru, dan cara membawa diri.",
  DSC: "Tema ini mungkin lebih menonjol melalui relasi, kolaborasi, dan perjumpaan dekat.",
};

const ANGLE_SENTENCE_EN: Record<AstrocartographyAngle, string> = {
  MC: "This theme may manifest most visibly through career, contribution, reputation, and public life.",
  IC: "This theme may manifest most visibly through home, family, ancestral roots, and emotional foundations.",
  ASC: "This theme may manifest most visibly through physical presence, personal identity, and new beginnings.",
  DSC: "This theme may manifest most visibly through partnerships, collaborations, and key relational encounters.",
};

const ANGLE_POTENTIAL: Record<AstrocartographyAngle, string[]> = {
  MC: ["kontribusi publik", "arah profesional"], IC: ["rumah dan fondasi", "kehidupan pribadi"], ASC: ["awal baru", "pengembangan diri"], DSC: ["kemitraan", "kolaborasi"],
};

const ANGLE_POTENTIAL_EN: Record<AstrocartographyAngle, string[]> = {
  MC: ["public contribution", "professional vocation"],
  IC: ["home and sanctuary", "personal life"],
  ASC: ["new horizons", "self-actualization"],
  DSC: ["committed partnerships", "collaborative alliances"],
};

const CHALLENGE_BODIES = new Set<AstrocartographyBodyName>(["Mars", "Saturn", "Uranus", "Neptune", "Pluto"]);

const ANGLE_THEME: Record<AstrocartographyAngle, { area: string; route: string }> = {
  MC: { area: "arah publik, kontribusi, dan visibilitas", route: "meridian tempat planet mencapai puncak langit" },
  IC: { area: "rumah, akar emosional, dan kehidupan pribadi", route: "meridian berlawanan tempat planet berada pada dasar langit" },
  ASC: { area: "identitas, tubuh, awal baru, dan cara bertemu hidup", route: "lintasan geografis tempat planet sedang terbit" },
  DSC: { area: "hubungan, kolaborasi, dan kualitas yang ditemui melalui orang lain", route: "lintasan geografis tempat planet sedang terbenam" },
};

const ANGLE_THEME_EN: Record<AstrocartographyAngle, { area: string; route: string }> = {
  MC: { area: "public trajectory, contribution, and visibility", route: "meridian where the planet culminates overhead at Midheaven" },
  IC: { area: "home, emotional anchorage, and private life", route: "nadir meridian where the planet reaches the lowest point beneath the horizon" },
  ASC: { area: "identity, vitality, and how you meet the world", route: "geographical horizon where the planet is rising" },
  DSC: { area: "relationships, collaboration, and qualities mirrored through others", route: "geographical horizon where the planet is setting" },
};

const LOCATION_THEME: Record<AstrocartographyAngle, { meaning: string; influence: string; potential: string; key: string }> = {
  MC: { meaning: "arah publik, kontribusi, visibilitas, dan cara karya dikenali", influence: "Dorongan untuk mengambil peran, membangun reputasi, atau memperjelas kontribusi mungkin lebih mudah disadari di sini.", potential: "Tempat ini dapat mendukung pengembangan karya, tanggung jawab, jaringan profesional, atau kehadiran yang lebih terlihat.", key: "Tempat untuk membawa kontribusimu ke ruang yang lebih terlihat." },
  IC: { meaning: "rumah, akar kehidupan, rasa memiliki, dan kebutuhan membangun fondasi yang kuat", influence: "Dorongan untuk menetap, merawat ruang pribadi, mendekat pada keluarga, atau terhubung kembali dengan asal-usul mungkin lebih terasa di sini.", potential: "Tempat ini dapat mendukung pembangunan rumah, ruang kerja pribadi, komunitas, atau kehidupan yang lebih membumi.", key: "Tempat untuk menanam akar dan membangun fondasi." },
  ASC: { meaning: "identitas, tubuh, awal baru, dan cara hadir saat bertemu kehidupan", influence: "Keinginan memulai babak baru, memperbarui cara membawa diri, atau mencoba ritme berbeda mungkin lebih terlihat di sini.", potential: "Tempat ini dapat mendukung permulaan, pembentukan kebiasaan, dan eksplorasi cara hidup yang lebih selaras.", key: "Tempat untuk bertemu versi dirimu yang sedang bertumbuh." },
  DSC: { meaning: "hubungan, kolaborasi, perjumpaan dekat, dan kualitas yang ditemui melalui orang lain", influence: "Tema kemitraan, pertukaran, batas, dan pembelajaran melalui orang lain mungkin lebih mudah muncul di sini.", potential: "Tempat ini dapat mendukung kemitraan, perluasan lingkar pertemanan, atau pertumbuhan melalui hubungan.", key: "Tempat untuk mengenali dirimu melalui perjumpaan." },
};

const LOCATION_THEME_EN: Record<AstrocartographyAngle, { meaning: string; influence: string; potential: string; key: string }> = {
  MC: { meaning: "public direction, contribution, visibility, and recognized work", influence: "The urge to step into greater leadership, build a reputation, or clarify your vocational contribution is amplified here.", potential: "This place supports career elevation, taking responsibility, expanding professional networks, or establishing a prominent public voice.", key: "A place to bring your contribution into greater visibility." },
  IC: { meaning: "home, personal roots, sanctuary, and grounding foundations", influence: "The impulse to put down roots, tend your private sanctuary, draw close to loved ones, or reconnect with origins is strongly felt here.", potential: "This place supports making a home, creating a private studio, nesting in community, or cultivating deeper emotional stability.", key: "A place to plant roots and nurture enduring foundations." },
  ASC: { meaning: "identity, bodily vitality, fresh chapters, and authentic presence", influence: "The desire to embark on a new chapter, refine your self-presentation, or adopt a fresh personal rhythm is sparked here.", potential: "This place supports bold new beginnings, establishing life habits, and exploring a more integrated way of living.", key: "A place to meet an emerging version of yourself." },
  DSC: { meaning: "relationships, collaborative ventures, intimate meetings, and mirrored qualities", influence: "Themes of partnership, mutual exchange, relational boundaries, and learning through significant others become focal points here.", potential: "This place supports meaningful partnerships, expanding close circles, and maturing through mutual commitment.", key: "A place to discover yourself through relational mirrors." },
};

function reading(line: AstrocartographyLine, isEn = false) {
  const bodyMap = isEn ? BODY_THEME_EN : BODY_THEME;
  const angleMap = isEn ? ANGLE_THEME_EN : ANGLE_THEME;
  const body = bodyMap[line.body];
  const angle = angleMap[line.angleType];
  if (isEn) {
    return {
      lineId: line.lineId,
      label: `${line.body} ${line.angleType}`,
      technicalExplanation: `${line.body} ${line.angleType} is the ${angle.route} at the moment of birth. Its path is astronomically calculated and normalized to longitude −180° to +180°.`,
      interpretation: `Near this line, themes of ${body.function} may be experienced more readily through ${angle.area}. This quality is not a guarantee of specific events; real experience, local context, and conscious choices remain the primary determinants.`,
      supportiveExpression: body.support,
      possibleChallenge: body.challenge,
      groundingInvitation: body.invitation,
    };
  }
  return {
    lineId: line.lineId,
    label: `${line.body} ${line.angleType}`,
    technicalExplanation: `${line.body} ${line.angleType} adalah ${angle.route} pada saat kelahiran. Jalurnya dihitung secara astronomis dan dinormalisasi pada longitude −180° hingga +180°.`,
    interpretation: `Di wilayah dekat jalur ini, tema ${body.function} mungkin lebih mudah terasa melalui ${angle.area}. Kualitas tersebut bukan jaminan peristiwa tertentu; pengalaman nyata, konteks tempat, dan pilihanmu tetap menjadi penentu utama.`,
    supportiveExpression: body.support,
    possibleChallenge: body.challenge,
    groundingInvitation: body.invitation,
  };
}

export function buildAstrocartographyLocationPresentation(
  place: AstrocartographyPlace,
  analysis: AstrocartographyLocationAnalysis,
  presentation: AstrocartographyPresentation,
  isEn = false,
): AstrocartographyLocationPresentation | null {
  const nearest = analysis.nearestLines[0];
  if (!nearest) return null;
  const lineReading = presentation.lineReadings.find((item) => item.lineId === nearest.lineId);
  if (!lineReading) return null;
  const theme = (isEn ? LOCATION_THEME_EN : LOCATION_THEME)[nearest.angleType];
  return {
    selectedLocation: { locationId: place.locationId, name: place.name, region: place.region, country: place.country, countryCode: place.countryCode, latitude: place.latitude, longitude: place.longitude },
    nearestLine: { planet: nearest.body, angleType: nearest.angleType, distanceKm: nearest.approximateDistanceKm, calculationStatus: "calculated" },
    interpretation: {
      meaning: isEn ? `This region emphasizes themes of ${theme.meaning}.` : `Wilayah ini menonjolkan tema ${theme.meaning}.`,
      livedEnergy: lineReading.interpretation,
      possibleInfluence: theme.influence,
      supportivePotential: theme.potential,
      possibleChallenge: `${lineReading.possibleChallenge}. ${lineReading.groundingInvitation}.`,
      locationKey: theme.key,
    },
  };
}

function buildLocationLine(
  nearest: AstrocartographyLocationAnalysis["nearestLines"][number],
  lineReading: AstrocartographyPresentation["lineReadings"][number],
  isEn = false,
): AstrocartographyLocationLinePresentation {
  const challengeItems = CHALLENGE_BODIES.has(nearest.body) ? [lineReading.possibleChallenge] : [];
  const bodyThemeMap = isEn ? BODY_THEME_EN : BODY_THEME;
  const angleSentenceMap = isEn ? ANGLE_SENTENCE_EN : ANGLE_SENTENCE;
  const bodyPotentialMap = isEn ? BODY_POTENTIAL_EN : BODY_POTENTIAL;
  const anglePotentialMap = isEn ? ANGLE_POTENTIAL_EN : ANGLE_POTENTIAL;
  return {
    planet: nearest.body,
    planetSymbol: BODY_SYMBOL[nearest.body],
    angleType: nearest.angleType,
    distanceKm: nearest.approximateDistanceKm,
    distanceLabel: isEn
      ? `Approximately ${nearest.approximateDistanceKm.toLocaleString("en-US")} km from line`
      : `Sekitar ${nearest.approximateDistanceKm.toLocaleString("id-ID")} km dari garis`,
    themeSentences: [
      isEn
        ? `Themes of ${bodyThemeMap[nearest.body].function} can be felt more consciously in this region.`
        : `Tema ${bodyThemeMap[nearest.body].function} dapat terasa lebih mudah disadari di wilayah ini.`,
      angleSentenceMap[nearest.angleType],
    ],
    potentialItems: [...bodyPotentialMap[nearest.body].slice(0, 3), ...anglePotentialMap[nearest.angleType].slice(0, 1)],
    challengeItems,
    groundingInvitation: lineReading.groundingInvitation,
    calculationStatus: "calculated",
  };
}

export function buildAstrocartographyCuratedLocations(
  places: AstrocartographyPlace[],
  result: AstrocartographyResult,
  presentation: AstrocartographyPresentation,
  maximumLines = 3,
  isEn = false,
): AstrocartographyCuratedLocationResult[] {
  if (result.birthDataStatus !== "available") return [];
  const bodyThemeMap = isEn ? BODY_THEME_EN : BODY_THEME;
  const angleThemeMap = isEn ? ANGLE_THEME_EN : ANGLE_THEME;
  return places.map((place) => {
    const analysis = analyzeAstrocartographyLocation(result.lines, place.latitude, place.longitude);
    const lines = (analysis?.nearestLines || []).slice(0, Math.max(1, Math.min(3, maximumLines))).flatMap((nearest) => {
      const lineReading = presentation.lineReadings.find((item) => item.lineId === nearest.lineId);
      return lineReading ? [buildLocationLine(nearest, lineReading, isEn)] : [];
    });
    if (!lines.length) {
      return {
        locationId: place.locationId, locationName: place.name, region: place.region, country: place.country, countryCode: place.countryCode, latitude: place.latitude, longitude: place.longitude, inclusionReason: place.inclusionReason, lines: [],
        overallTheme: isEn ? "No lines could be calculated for this location yet." : "Belum ada garis yang dapat dihitung untuk lokasi ini.",
        integratedSummary: isEn ? "Select another location once line data becomes available." : "Pilih lokasi lain setelah data garis tersedia.",
        recommendedUses: [], cautions: [], sourceVersion: result.sourceVersion, calculationStatus: "unavailable" as const,
      };
    }
    const first = lines[0];
    const second = lines[1];
    const overallTheme = isEn
      ? second
        ? `${place.name} bridges themes of ${bodyThemeMap[first.planet].function} through ${angleThemeMap[first.angleType].area} with ${bodyThemeMap[second.planet].function} through ${angleThemeMap[second.angleType].area}.`
        : `${place.name} primarily highlights themes of ${bodyThemeMap[first.planet].function} through ${angleThemeMap[first.angleType].area}.`
      : second
        ? `${place.name} mempertemukan tema ${bodyThemeMap[first.planet].function} melalui ${angleThemeMap[first.angleType].area} dengan ${bodyThemeMap[second.planet].function} melalui ${angleThemeMap[second.angleType].area}.`
        : `${place.name} terutama menonjolkan tema ${bodyThemeMap[first.planet].function} melalui ${angleThemeMap[first.angleType].area}.`;
    return {
      locationId: place.locationId, locationName: place.name, region: place.region, country: place.country, countryCode: place.countryCode,
      latitude: place.latitude, longitude: place.longitude, inclusionReason: place.inclusionReason, lines, overallTheme,
      integratedSummary: isEn
        ? `${overallTheme} This area may be considered as a space for ${first.potentialItems.slice(0, 2).join(" and ")}, while remaining grounded in real experience and practical needs.`
        : `${overallTheme} Wilayah ini dapat dipertimbangkan sebagai ruang untuk ${first.potentialItems.slice(0, 2).join(" dan ")}, sambil tetap memeriksa pengalaman nyata dan kebutuhan praktis.`,
      recommendedUses: Array.from(new Set(lines.flatMap((line) => line.potentialItems))).slice(0, 5),
      cautions: Array.from(new Set(lines.flatMap((line) => line.challengeItems))).slice(0, 2),
      sourceVersion: result.sourceVersion, calculationStatus: "calculated",
    };
  });
}

export function buildAstrocartographyOverallLocationSummary(locations: AstrocartographyCuratedLocationResult[]): AstrocartographyOverallLocationSummary[] {
  return locations.filter((location) => location.calculationStatus === "calculated").slice(0, 5).map((location) => ({
    locationId: location.locationId,
    locationName: location.locationName,
    dominantTheme: location.overallTheme,
    bestFitActivities: location.recommendedUses.slice(0, 4),
    caution: location.cautions[0] || null,
  }));
}

export function buildAstrocartographyPresentation(result: AstrocartographyResult, options?: { isEn?: boolean } | unknown): AstrocartographyPresentation {
  const isEn = typeof options === "object" && options !== null && "isEn" in options
    ? Boolean((options as { isEn?: boolean }).isEn)
    : isEnlEdition();

  const available = result.birthDataStatus === "available" && result.lines.length > 0;

  if (isEn) {
    const summaryEn = available ? [
      "How you respond to a place is shaped not only by its scenery or distance, but also by which parts of yourself become more visible when the environment changes. Certain regions may highlight the courage to step forward, the need to be recognized, or the impulse to begin afresh in novel ways. This map helps illuminate these potential emphases without treating any single location as an absolute answer.",
      "A sense of connection and belonging deepens through distinct rhythms in every setting. Some areas may make relationships feel more open, while others invite you to protect boundaries, privacy, or emotional foundations with conscious discernment. The balance between public life and personal sanctuary is always cultivated through lived experience, not merely through lines on a map.",
      "Travel, vocation, and geographic transitions offer valuable ways to view your capacities from fresh angles. Use this map to frame thoughtful inquiries and compare experiences, rather than making impulsive decisions about moving, work, or relationships. Practical research, personal safety, cost of living, legal realities, and local conditions must always take precedence.",
    ] : [
      "Your geographic map cannot be computed reliably because birth time, time zone, or geographic coordinates are incomplete. Bhumi never substitutes solar noon, device geolocation, or decorative approximations for missing data. Provide precise birth data to ensure calculations are grounded in honest astronomy.",
    ];
    return {
      hero: {
        eyebrow: "Astrocartography",
        title: "Your Planetary Lines Across the Earth",
        lineCount: result.lines.length,
        insight: available
          ? "This map highlights regions of the world where your natal planetary themes may come forward more distinctly."
          : "Accurate birth time, time zone, and geographic coordinates are required before lines can be calculated.",
      },
      accuracyNotice: result.accuracyNotice,
      lineReadings: result.lines.map((line) => reading(line, true)),
      travelThemes: "Unfamiliar destinations offer space to notice recurring patterns that remain hidden in daily routines. This map assists in identifying themes worth observing when traveling or considering relocation, without prescribing a move. A place becomes meaningful for countless personal reasons; Astrocartography is a symbolic lens, not a replacement for practical research or direct experience.",
      workThemes: "Midheaven (MC) lines bring vocational contribution, leadership, responsibility, communication, creativity, or decisive action to the forefront in a region. These environments may feel supportive or demanding depending on the planet, professional context, and personal readiness. No line guarantees acclaim, profit, or automatic success.",
      relationshipThemes: "Descendant (DSC) lines illuminate qualities encountered through partnerships, collaboration, and intimate meetings. Venus or Moon can deepen mutual acceptance and security, whereas Mars or Saturn calls for firmer boundaries and maturity. A location does not guarantee a partner, marriage, or separation; relationships evolve through mutual conscious choices.",
      homeThemes: "Imum Coeli (IC) lines direct attention toward belonging, privacy, emotional roots, and personal restoration. Moon, Venus, Saturn, Neptune, or Pluto each lend distinct color to how a place touches private life. No location is inherently a true home; belonging is built through connection, safety, and authentic presence.",
      growthThemes: "Treat these planetary lines as invitations for mindful observation, never as rigid mandates. Corroborate map themes with physical reality, bodily intuition, relational dynamics, career needs, and practical constraints. Mature discernment allows symbolic insight and empirical facts to enrich one another.",
      summary: summaryEn,
      availabilityStatus: result.birthDataStatus,
      profileCard: {
        title: "Astrocartography",
        insight: "This map highlights regions of the earth where your natal planetary energies become more prominent.",
        action: "Explore full map",
        href: "/blueprint/astrocartography",
      },
      sourceVersion: result.sourceVersion,
      sourceClassification: result.sourceClassification,
    };
  }

  const summary = available ? [
    "Cara kamu merespons tempat tidak hanya ditentukan oleh pemandangan atau jarak, tetapi juga oleh bagian diri yang menjadi lebih mudah terlihat ketika lingkungan berubah. Beberapa wilayah dapat menonjolkan keberanian hadir, kebutuhan untuk dikenal, atau dorongan memulai sesuatu dengan cara berbeda. Peta ini membantu mengenali kemungkinan penekanan tersebut tanpa menjadikan satu lokasi sebagai jawaban mutlak.",
    "Rasa terhubung dan rasa memiliki dapat tumbuh melalui ritme yang berbeda di setiap tempat. Ada wilayah yang mungkin membuat hubungan terasa lebih terbuka, sementara tempat lain mengajakmu menjaga batas, privasi, atau fondasi emosional dengan lebih sadar. Keseimbangan antara kehidupan publik dan ruang pribadi tetap dibangun melalui pengalaman, bukan hanya melalui garis di peta.",
    "Perjalanan, karya, dan perubahan tempat dapat menjadi cara melihat kemampuanmu dari sudut baru. Gunakan peta ini untuk menyusun pertanyaan dan membandingkan pengalaman, bukan untuk memutuskan kepindahan, pekerjaan, atau hubungan secara otomatis. Riset praktis, keamanan, biaya, hukum, dan kenyataan hidup setempat tetap perlu mendapat tempat utama.",
  ] : [
    "Peta geografis belum dapat dihitung dengan aman karena waktu, zona waktu, atau koordinat kelahiran belum lengkap. Bhumi tidak menggunakan waktu tengah hari, lokasi perangkat, atau garis dekoratif sebagai pengganti data yang hilang. Lengkapi data kelahiran yang tepat agar perhitungan dapat dilakukan dengan jujur.",
  ];
  return {
    hero: {
      eyebrow: "Astrocartography", title: "Peta Langitmu di Atas Bumi", lineCount: result.lines.length,
      insight: available ? "Peta ini menunjukkan wilayah bumi tempat tema planet kelahiranmu dapat menjadi lebih menonjol." : "Data waktu, zona waktu, dan koordinat kelahiran yang tepat diperlukan sebelum garis dapat dihitung.",
    },
    accuracyNotice: result.accuracyNotice,
    lineReadings: result.lines.map((line) => reading(line, false)),
    travelThemes: "Tempat baru dapat menjadi ruang untuk menyadari pola yang tidak selalu terlihat dalam lingkungan sehari-hari. Peta ini dapat membantu memilih tema yang ingin diamati saat bepergian atau mempertimbangkan tempat tinggal, tetapi tidak menyuruhmu pindah. Sebuah tempat bisa terasa bermakna karena banyak alasan; Astrocartography adalah satu lapisan simbolik, bukan pengganti riset praktis atau pengalaman langsung.",
    workThemes: "Jalur MC dapat membuat tema kontribusi, tanggung jawab, komunikasi, kreativitas, atau keberanian bertindak lebih mudah terlihat di suatu wilayah. Pengalaman tersebut mungkin terasa mendukung atau menuntut tergantung planet, konteks pekerjaan, dan kesiapanmu. Tidak ada garis yang menjamin pengakuan, keuntungan, atau hasil profesional tertentu.",
    relationshipThemes: "Jalur DSC menyoroti cara kualitas tertentu lebih mudah ditemui melalui hubungan, kolaborasi, dan perjumpaan dekat. Venus atau Moon dapat menambah perhatian pada penerimaan dan rasa aman, sementara Mars atau Saturn dapat meminta batas serta kedewasaan yang lebih jelas. Tempat tidak menjamin pasangan, pernikahan, atau perpisahan; relasi tetap tumbuh dari pilihan kedua pihak.",
    homeThemes: "Jalur IC mengarahkan perhatian pada rasa pulang, privasi, akar emosional, dan kebutuhan memulihkan diri. Moon, Venus, Saturn, Neptune, atau Pluto dapat memberi warna berbeda pada cara sebuah wilayah menyentuh kehidupan pribadi. Tidak ada lokasi yang secara objektif merupakan rumah sejati; rasa memiliki berkembang melalui hubungan, keamanan, dan pengalaman yang benar-benar dijalani.",
    growthThemes: "Gunakan garis sebagai undangan untuk mengamati, bukan sebagai perintah. Bandingkan tema peta dengan pengalaman tempat, kebutuhan tubuh, relasi, pekerjaan, serta kondisi praktis yang nyata. Pilihan yang matang memberi ruang bagi simbol dan fakta untuk saling memeriksa.",
    summary,
    availabilityStatus: result.birthDataStatus,
    profileCard: { title: "Astrocartography", insight: "Peta ini menunjukkan wilayah bumi tempat energi planet kelahiranmu menjadi lebih menonjol.", action: "Lihat peta selengkapnya", href: "/blueprint/astrocartography" },
    sourceVersion: result.sourceVersion,
    sourceClassification: result.sourceClassification,
  };
}
