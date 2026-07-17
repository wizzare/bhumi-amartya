import type { AstrocartographyPlace } from "./locations";
import { analyzeAstrocartographyLocation } from "./calculateAstrocartography";
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

const BODY_SYMBOL: Record<AstrocartographyBodyName, string> = { Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇" };
const BODY_POTENTIAL: Record<AstrocartographyBodyName, string[]> = {
  Sun: ["kepemimpinan", "ekspresi diri", "karya yang terasa personal"], Moon: ["perawatan", "komunitas", "kehidupan yang peka pada kebutuhan manusia"],
  Mercury: ["belajar", "menulis dan berbicara", "pertukaran gagasan"], Venus: ["kreativitas", "relasi sosial", "estetika dan presentasi"],
  Mars: ["inisiatif", "kerja yang membutuhkan keberanian", "kolaborasi aktif"], Jupiter: ["pendidikan", "pengajaran", "perluasan wawasan"],
  Saturn: ["karya jangka panjang", "tanggung jawab", "pembangunan struktur"], Uranus: ["inovasi", "eksperimen", "perubahan pola"],
  Neptune: ["kontemplasi", "karya kreatif", "praktik spiritual yang membumi"], Pluto: ["transformasi", "riset mendalam", "pembaruan pola hidup"],
};
const ANGLE_SENTENCE: Record<AstrocartographyAngle, string> = {
  MC: "Tema ini mungkin lebih menonjol melalui karya, kontribusi, reputasi, dan kehidupan publik.",
  IC: "Tema ini mungkin lebih menonjol melalui rumah, keluarga, akar, dan fondasi batin.",
  ASC: "Tema ini mungkin lebih menonjol melalui tubuh, identitas, awal baru, dan cara membawa diri.",
  DSC: "Tema ini mungkin lebih menonjol melalui relasi, kolaborasi, dan perjumpaan dekat.",
};
const ANGLE_POTENTIAL: Record<AstrocartographyAngle, string[]> = {
  MC: ["kontribusi publik", "arah profesional"], IC: ["rumah dan fondasi", "kehidupan pribadi"], ASC: ["awal baru", "pengembangan diri"], DSC: ["kemitraan", "kolaborasi"],
};
const CHALLENGE_BODIES = new Set<AstrocartographyBodyName>(["Mars", "Saturn", "Uranus", "Neptune", "Pluto"]);

const ANGLE_THEME: Record<AstrocartographyAngle, { area: string; route: string }> = {
  MC: { area: "arah publik, kontribusi, dan visibilitas", route: "meridian tempat planet mencapai puncak langit" },
  IC: { area: "rumah, akar emosional, dan kehidupan pribadi", route: "meridian berlawanan tempat planet berada pada dasar langit" },
  ASC: { area: "identitas, tubuh, awal baru, dan cara bertemu hidup", route: "lintasan geografis tempat planet sedang terbit" },
  DSC: { area: "hubungan, kolaborasi, dan kualitas yang ditemui melalui orang lain", route: "lintasan geografis tempat planet sedang terbenam" },
};

const LOCATION_THEME: Record<AstrocartographyAngle, { meaning: string; influence: string; potential: string; key: string }> = {
  MC: { meaning: "arah publik, kontribusi, visibilitas, dan cara karya dikenali", influence: "Dorongan untuk mengambil peran, membangun reputasi, atau memperjelas kontribusi mungkin lebih mudah disadari di sini.", potential: "Tempat ini dapat mendukung pengembangan karya, tanggung jawab, jaringan profesional, atau kehadiran yang lebih terlihat.", key: "Tempat untuk membawa kontribusimu ke ruang yang lebih terlihat." },
  IC: { meaning: "rumah, akar kehidupan, rasa memiliki, dan kebutuhan membangun fondasi yang kuat", influence: "Dorongan untuk menetap, merawat ruang pribadi, mendekat pada keluarga, atau terhubung kembali dengan asal-usul mungkin lebih terasa di sini.", potential: "Tempat ini dapat mendukung pembangunan rumah, ruang kerja pribadi, komunitas, atau kehidupan yang lebih membumi.", key: "Tempat untuk menanam akar dan membangun fondasi." },
  ASC: { meaning: "identitas, tubuh, awal baru, dan cara hadir saat bertemu kehidupan", influence: "Keinginan memulai babak baru, memperbarui cara membawa diri, atau mencoba ritme berbeda mungkin lebih terlihat di sini.", potential: "Tempat ini dapat mendukung permulaan, pembentukan kebiasaan, dan eksplorasi cara hidup yang lebih selaras.", key: "Tempat untuk bertemu versi dirimu yang sedang bertumbuh." },
  DSC: { meaning: "hubungan, kolaborasi, perjumpaan dekat, dan kualitas yang ditemui melalui orang lain", influence: "Tema kemitraan, pertukaran, batas, dan pembelajaran melalui orang lain mungkin lebih mudah muncul di sini.", potential: "Tempat ini dapat mendukung kemitraan, perluasan lingkar pertemanan, atau pertumbuhan melalui hubungan.", key: "Tempat untuk mengenali dirimu melalui perjumpaan." },
};

function reading(line: AstrocartographyLine) {
  const body = BODY_THEME[line.body];
  const angle = ANGLE_THEME[line.angleType];
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
): AstrocartographyLocationPresentation | null {
  const nearest = analysis.nearestLines[0];
  if (!nearest) return null;
  const lineReading = presentation.lineReadings.find((item) => item.lineId === nearest.lineId);
  if (!lineReading) return null;
  const theme = LOCATION_THEME[nearest.angleType];
  return {
    selectedLocation: { locationId: place.locationId, name: place.name, region: place.region, country: place.country, countryCode: place.countryCode, latitude: place.latitude, longitude: place.longitude },
    nearestLine: { planet: nearest.body, angleType: nearest.angleType, distanceKm: nearest.approximateDistanceKm, calculationStatus: "calculated" },
    interpretation: {
      meaning: `Wilayah ini menonjolkan tema ${theme.meaning}.`,
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
): AstrocartographyLocationLinePresentation {
  const challengeItems = CHALLENGE_BODIES.has(nearest.body) ? [lineReading.possibleChallenge] : [];
  return {
    planet: nearest.body,
    planetSymbol: BODY_SYMBOL[nearest.body],
    angleType: nearest.angleType,
    distanceKm: nearest.approximateDistanceKm,
    distanceLabel: `Sekitar ${nearest.approximateDistanceKm.toLocaleString("id-ID")} km dari garis`,
    themeSentences: [`Tema ${BODY_THEME[nearest.body].function} dapat terasa lebih mudah disadari di wilayah ini.`, ANGLE_SENTENCE[nearest.angleType]],
    potentialItems: [...BODY_POTENTIAL[nearest.body].slice(0, 3), ...ANGLE_POTENTIAL[nearest.angleType].slice(0, 1)],
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
): AstrocartographyCuratedLocationResult[] {
  if (result.birthDataStatus !== "available") return [];
  return places.map((place) => {
    const analysis = analyzeAstrocartographyLocation(result.lines, place.latitude, place.longitude);
    const lines = (analysis?.nearestLines || []).slice(0, Math.max(1, Math.min(3, maximumLines))).flatMap((nearest) => {
      const lineReading = presentation.lineReadings.find((item) => item.lineId === nearest.lineId);
      return lineReading ? [buildLocationLine(nearest, lineReading)] : [];
    });
    if (!lines.length) {
      return { locationId: place.locationId, locationName: place.name, region: place.region, country: place.country, countryCode: place.countryCode, latitude: place.latitude, longitude: place.longitude, inclusionReason: place.inclusionReason, lines: [], overallTheme: "Belum ada garis yang dapat dihitung untuk lokasi ini.", integratedSummary: "Pilih lokasi lain setelah data garis tersedia.", recommendedUses: [], cautions: [], sourceVersion: result.sourceVersion, calculationStatus: "unavailable" as const };
    }
    const first = lines[0];
    const second = lines[1];
    const overallTheme = second
      ? `${place.name} mempertemukan tema ${BODY_THEME[first.planet].function} melalui ${ANGLE_THEME[first.angleType].area} dengan ${BODY_THEME[second.planet].function} melalui ${ANGLE_THEME[second.angleType].area}.`
      : `${place.name} terutama menonjolkan tema ${BODY_THEME[first.planet].function} melalui ${ANGLE_THEME[first.angleType].area}.`;
    return {
      locationId: place.locationId, locationName: place.name, region: place.region, country: place.country, countryCode: place.countryCode,
      latitude: place.latitude, longitude: place.longitude, inclusionReason: place.inclusionReason, lines, overallTheme,
      integratedSummary: `${overallTheme} Wilayah ini dapat dipertimbangkan sebagai ruang untuk ${first.potentialItems.slice(0, 2).join(" dan ")}, sambil tetap memeriksa pengalaman nyata dan kebutuhan praktis.`,
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

export function buildAstrocartographyPresentation(result: AstrocartographyResult): AstrocartographyPresentation {
  const available = result.birthDataStatus === "available" && result.lines.length > 0;
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
    lineReadings: result.lines.map(reading),
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
