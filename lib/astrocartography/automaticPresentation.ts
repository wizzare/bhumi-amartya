import { analyzeAstrocartographyLocation } from "./calculateAstrocartography";
import { ASTROCARTOGRAPHY_CITY_DATASET_VERSION, ASTROCARTOGRAPHY_REFERENCE_CITIES, type AstrocartographyReferenceCity } from "./cityReferences";
import { isEnlEdition } from "@/lib/config/edition";
import type { AstrocartographyAutomaticPresentation, AstrocartographyCategoryName, AstrocartographyCategoryResult, AstrocartographyCityReferenceResult, AstrocartographyOverallLocationSummary, AstrocartographyResult } from "./types";

type CategoryOwner = {
  name: AstrocartographyCategoryName;
  lineIds: string[];
  interpretation: string;
  potentialItems: string[];
  challenge: string | null;
  groundingNote: string;
};

const CATEGORY_OWNERS: CategoryOwner[] = [
  { name: "Ekonomi dan Peluang", lineIds: ["jupiter-mc", "jupiter-asc", "venus-mc", "venus-asc", "mercury-mc", "sun-mc"], interpretation: "Wilayah dekat garis-garis ini dapat menonjolkan cara peluang berkembang melalui visibilitas, hubungan, komunikasi, dan keberanian memperluas langkah. Ini bukan janji keuntungan, melainkan referensi untuk mengamati ruang tempat kemampuan bertumbuh mungkin lebih mudah digunakan.", potentialItems: ["pengembangan usaha", "jejaring", "komunikasi nilai", "perluasan wawasan"], challenge: null, groundingNote: "Periksa setiap peluang bersama data, biaya, dan kenyataan setempat." },
  { name: "Karier dan Visibilitas", lineIds: ["sun-mc", "saturn-mc", "jupiter-mc", "mercury-mc", "mars-mc"], interpretation: "Tema kontribusi, tanggung jawab, kepemimpinan, dan cara karya terlihat dapat menjadi lebih menonjol. Beberapa wilayah terasa mengalir, sementara yang lain meminta ketekunan dan struktur lebih kuat.", potentialItems: ["kontribusi publik", "kepemimpinan", "karya jangka panjang", "komunikasi profesional"], challenge: "Visibilitas perlu diimbangi batas, ritme kerja, dan ukuran keberhasilan yang sehat.", groundingNote: "Bangun reputasi melalui tindakan yang dapat dipertanggungjawabkan." },
  { name: "Relasi dan Kolaborasi", lineIds: ["venus-dsc", "moon-dsc", "jupiter-dsc", "mars-dsc", "sun-dsc"], interpretation: "Wilayah ini dapat membuat kualitas relasi, kolaborasi, penerimaan, dan pembelajaran melalui orang lain terasa lebih aktif. Kedekatan tetap tumbuh dari pilihan kedua pihak, bukan dari lokasi semata.", potentialItems: ["kemitraan", "komunitas", "kolaborasi kreatif", "percakapan yang memperluas"], challenge: "Jaga batas dan hindari menjadikan intensitas perjumpaan sebagai kepastian hubungan.", groundingNote: "Biarkan kualitas hubungan terbukti melalui pengalaman nyata." },
  { name: "Spiritualitas dan Kreativitas", lineIds: ["neptune-mc", "neptune-asc", "moon-ic", "venus-ic"], interpretation: "Imajinasi, kepekaan, kontemplasi, serta kebutuhan menciptakan ruang batin dapat lebih mudah terasa. Tempat-tempat ini dapat membantu mendengar lapisan halus pengalaman ketika intuisi tetap ditemani kejernihan.", potentialItems: ["kontemplasi", "karya kreatif", "pemulihan batin", "praktik spiritual"], challenge: "Kepekaan dan idealisasi perlu ditemani verifikasi serta batas yang jelas.", groundingNote: "Temani intuisi dengan rutinitas yang membumi." },
  { name: "Rumah dan Fondasi", lineIds: ["sun-ic", "moon-ic", "jupiter-ic", "venus-ic", "saturn-ic"], interpretation: "Tema rasa pulang, keluarga, fondasi emosional, dan cara membangun kehidupan pribadi dapat terasa lebih menonjol. Wilayah referensi menunjukkan tempat yang layak diamati, bukan rumah mutlak yang harus dipilih.", potentialItems: ["rumah", "komunitas berakar", "ruang kerja pribadi", "fondasi jangka panjang"], challenge: null, groundingNote: "Nilai rasa memiliki melalui keamanan, relasi, dan kehidupan sehari-hari." },
  { name: "Transformasi dan Pendewasaan", lineIds: ["pluto-mc", "pluto-asc", "saturn-mc", "saturn-asc", "saturn-ic", "saturn-dsc", "mars-mc", "mars-asc", "mars-ic", "mars-dsc"], interpretation: "Wilayah dekat garis-garis ini dapat menonjolkan tanggung jawab, keberanian, perubahan pola, dan proses menjadi lebih matang. Intensitasnya dapat berguna ketika dihadapi dengan sadar, perlahan, dan tanpa memaksakan hasil.", potentialItems: ["restrukturisasi", "disiplin", "riset mendalam", "keberanian mengambil tanggung jawab"], challenge: "Tekanan, konflik, atau kebutuhan mengendalikan keadaan perlu ditangani secara sadar.", groundingNote: "Berikan perubahan struktur, waktu, dan dukungan yang cukup." },
  { name: "Pendidikan dan Pertumbuhan", lineIds: ["jupiter-mc", "jupiter-ic", "jupiter-asc", "jupiter-dsc", "mercury-mc", "mercury-ic", "mercury-asc", "mercury-dsc", "sun-mc", "sun-ic", "sun-asc", "sun-dsc"], interpretation: "Belajar, mengajar, bertukar gagasan, dan memperluas sudut pandang dapat lebih mudah menjadi bagian dari pengalaman tempat. Pertumbuhan tetap membutuhkan praktik, keterbukaan, dan kemampuan menguji apa yang dipelajari.", potentialItems: ["pendidikan", "pengajaran", "menulis dan berbicara", "pertukaran lintas bidang"], challenge: null, groundingNote: "Ubah wawasan menjadi pengalaman yang dapat diterapkan." },
];

const CATEGORY_OWNERS_EN: CategoryOwner[] = [
  {
    name: "Economy & Opportunity",
    lineIds: ["jupiter-mc", "jupiter-asc", "venus-mc", "venus-asc", "mercury-mc", "sun-mc"],
    interpretation: "Regions near these lines can illuminate pathways where opportunity unfolds through visibility, connection, communication, and the courage to expand. This is not a guarantee of financial gain, but a reference point for observing where your growth capacities may be engaged with greater ease.",
    potentialItems: ["business development", "networking", "value communication", "expanding horizons"],
    challenge: null,
    groundingNote: "Evaluate every opportunity alongside empirical data, costs, and local conditions.",
  },
  {
    name: "Career & Visibility",
    lineIds: ["sun-mc", "saturn-mc", "jupiter-mc", "mercury-mc", "mars-mc"],
    interpretation: "Themes of vocational contribution, leadership responsibility, and public recognition become more prominent here. Certain locations foster natural flow, while others demand perseverance and disciplined structure.",
    potentialItems: ["public contribution", "leadership", "long-term vocational building", "professional communication"],
    challenge: "Visibility requires balance through healthy boundaries, sustainable pacing, and sensible definitions of success.",
    groundingNote: "Build reputation through reliable, accountable action.",
  },
  {
    name: "Relationships & Collaboration",
    lineIds: ["venus-dsc", "moon-dsc", "jupiter-dsc", "mars-dsc", "sun-dsc"],
    interpretation: "These regions activate qualities of partnership, mutual exchange, acceptance, and learning through significant others. Authentic intimacy always grows from reciprocal choices, never from geography alone.",
    potentialItems: ["partnerships", "community building", "creative collaboration", "perspective-expanding dialogue"],
    challenge: "Maintain clear boundaries and avoid mistaking encounter intensity for enduring commitment.",
    groundingNote: "Allow the depth of connection to prove itself through real-world experience.",
  },
  {
    name: "Spirituality & Creativity",
    lineIds: ["neptune-mc", "neptune-asc", "moon-ic", "venus-ic"],
    interpretation: "Imaginative subtlety, emotional receptivity, contemplation, and the need for inner spaciousness are heightened here. These settings help you tune into nuanced layers of experience when intuition is balanced by clarity.",
    potentialItems: ["contemplative retreat", "creative artistic work", "emotional restoration", "grounded spiritual practice"],
    challenge: "Sensitivity and idealization must be accompanied by grounded verification and clear boundaries.",
    groundingNote: "Anchor intuitive inspiration into everyday grounding routines.",
  },
  {
    name: "Home & Foundation",
    lineIds: ["sun-ic", "moon-ic", "jupiter-ic", "venus-ic", "saturn-ic"],
    interpretation: "Themes of sanctuary, family ties, emotional roots, and constructing a stable private life come forward distinctly. Reference areas highlight places worthy of observation, rather than an absolute home you must choose.",
    potentialItems: ["home sanctuary", "rooted community", "private creative workspace", "enduring foundations"],
    challenge: null,
    groundingNote: "Gauge belonging through safety, relational support, and daily well-being.",
  },
  {
    name: "Transformation & Maturation",
    lineIds: ["pluto-mc", "pluto-asc", "saturn-mc", "saturn-asc", "saturn-ic", "saturn-dsc", "mars-mc", "mars-asc", "mars-ic", "mars-dsc"],
    interpretation: "Areas near these lines emphasize responsibility, courage, breaking outdated patterns, and psychological maturation. Their intensity is transformative when met with conscious presence, steady pacing, and releasing forced outcomes.",
    potentialItems: ["structural realignment", "resilient discipline", "deep investigation", "courageous responsibility"],
    challenge: "Pressure, interpersonal friction, or the urge to exert control must be met with conscious composure.",
    groundingNote: "Provide transitions with sufficient time, structure, and emotional support.",
  },
  {
    name: "Education & Growth",
    lineIds: ["jupiter-mc", "jupiter-ic", "jupiter-asc", "jupiter-dsc", "mercury-mc", "mercury-ic", "mercury-asc", "mercury-dsc", "sun-mc", "sun-ic", "sun-asc", "sun-dsc"],
    interpretation: "Studying, teaching, intellectual exchange, and broadening worldview naturally integrate into your experience of these settings. Meaningful growth still requires practice, openness, and testing what you learn against reality.",
    potentialItems: ["higher learning", "teaching and mentorship", "writing and discourse", "cross-disciplinary exchange"],
    challenge: null,
    groundingNote: "Translate theoretical insights into practical, lived application.",
  },
];

const BODY_LIVED_THEME: Record<string, string> = { Sun: "identitas dan keberanian terlihat", Moon: "rasa aman dan kebutuhan emosional", Mercury: "komunikasi dan pembelajaran", Venus: "keterhubungan dan kreativitas", Mars: "inisiatif dan keberanian bertindak", Jupiter: "pertumbuhan dan perluasan wawasan", Saturn: "tanggung jawab dan pematangan", Uranus: "perubahan dan kebebasan", Neptune: "imajinasi dan kepekaan spiritual", Pluto: "transformasi dan kedalaman" };
const ANGLE_LIVED_THEME: Record<string, string> = { MC: "karya serta kehidupan publik", IC: "rumah serta fondasi batin", ASC: "identitas serta awal baru", DSC: "relasi serta kolaborasi" };

const BODY_LIVED_THEME_EN: Record<string, string> = {
  Sun: "identity and the courage to be seen",
  Moon: "emotional security and belonging needs",
  Mercury: "communication and active learning",
  Venus: "connection, harmony, and creative arts",
  Mars: "initiative, drive, and decisive action",
  Jupiter: "growth and expanding worldview",
  Saturn: "responsibility, discipline, and maturity",
  Uranus: "originality, liberation, and breakthrough",
  Neptune: "imagination, subtlety, and spiritual contemplation",
  Pluto: "transformation and psychological depth",
};

const ANGLE_LIVED_THEME_EN: Record<string, string> = {
  MC: "vocation and public contribution",
  IC: "home and emotional foundations",
  ASC: "identity and fresh beginnings",
  DSC: "partnership and collaborative alliance",
};

const MAX_REFERENCE_DISTANCE_KM = 1500;

function buildCategory(owner: CategoryOwner, result: AstrocartographyResult, birthCountryCode: string | null, cityUsage: Map<string, number>, cityDataset: AstrocartographyReferenceCity[], isEn = false): AstrocartographyCategoryResult | null {
  const eligibleLines = result.lines.filter((line) => owner.lineIds.includes(line.lineId));
  if (!eligibleLines.length) return null;
  const calculated = cityDataset.flatMap((city) => {
    const analysis = analyzeAstrocartographyLocation(eligibleLines, city.latitude, city.longitude);
    if (!analysis?.nearestLines.length) return [];
    const first = analysis.nearestLines[0].approximateDistanceKm;
    const priority = owner.lineIds.indexOf(analysis.nearestLines[0].lineId);
    const supportingDistance = analysis.nearestLines[1]?.approximateDistanceKm ?? Number.POSITIVE_INFINITY;
    return [{ city, nearestLines: analysis.nearestLines.slice(0, 2), distance: first, priority, supportingDistance }];
  }).sort((left, right) => left.distance - right.distance || left.priority - right.priority || left.supportingDistance - right.supportingDistance || left.city.id.localeCompare(right.city.id));
  const ranked = calculated.filter((candidate) => candidate.distance <= MAX_REFERENCE_DISTANCE_KM);
  const preferUnusedExactTie = (pool: typeof ranked) => {
    const first = pool[0];
    if (!first || (cityUsage.get(first.city.id) || 0) < 3) return pool;
    const alternative = pool.find((candidate) => (cityUsage.get(candidate.city.id) || 0) < 3 && candidate.distance === first.distance && candidate.priority === first.priority && candidate.supportingDistance === first.supportingDistance);
    return alternative ? [alternative, ...pool.filter((candidate) => candidate.city.id !== alternative.city.id)] : pool;
  };
  const domesticPool = preferUnusedExactTie(birthCountryCode ? ranked.filter((candidate) => candidate.city.countryCode === birthCountryCode) : []);
  const globalPool = preferUnusedExactTie(ranked.filter((candidate) => !birthCountryCode || candidate.city.countryCode !== birthCountryCode));
  const firstDomestic = domesticPool[0];
  const secondDomestic = firstDomestic ? domesticPool.slice(1).sort((left, right) => left.distance - right.distance || left.priority - right.priority || left.supportingDistance - right.supportingDistance || Number(left.city.region === firstDomestic.city.region) - Number(right.city.region === firstDomestic.city.region) || left.city.id.localeCompare(right.city.id))[0] : undefined;
  const pickedDomestic = [firstDomestic, secondDomestic].filter((candidate): candidate is typeof domesticPool[number] => Boolean(candidate));
  const pickedDomesticFallback = birthCountryCode && pickedDomestic.length === 0
    ? calculated.filter((candidate) => candidate.city.countryCode === birthCountryCode).slice(0, 2)
    : [];
  const globalSlots = birthCountryCode ? Math.max(1, 3 - pickedDomestic.length) : 3;
  const pickedGlobal = globalPool.slice(0, globalSlots);

  const bodyMap = isEn ? BODY_LIVED_THEME_EN : BODY_LIVED_THEME;
  const angleMap = isEn ? ANGLE_LIVED_THEME_EN : ANGLE_LIVED_THEME;

  const toReference = ({ city, nearestLines, distance, priority }: typeof calculated[number], domesticOrGlobal: "domestic" | "global", additionalGlobal: boolean, fallback = false): AstrocartographyCityReferenceResult => {
    const lineInterpretations = nearestLines.map((line) => {
      const bodyText = bodyMap[line.body] || line.body;
      const angleText = angleMap[line.angleType] || line.angleType;
      const narrative = isEn
        ? fallback
          ? `Themes of ${bodyText} may be experienced more subtly through ${angleText} as this area lies further from the primary line.`
          : `Near this line, themes of ${bodyText} may be felt more readily through ${angleText}.`
        : fallback
          ? `Tema ${bodyText} mungkin terasa lebih halus melalui ${angleText} karena wilayah ini berada lebih jauh dari garis utama.`
          : `Di sekitar garis ini, tema ${bodyText} mungkin lebih mudah terasa melalui ${angleText}.`;
      return { lineId: line.lineId, label: `${line.body} ${line.angleType}`, narrative };
    });

    const integratedSummary = isEn
      ? fallback
        ? `${city.name} is not a primary influence point. It serves as the nearest domestic reference, so its symbolic influence is expected to be gentler than global regions closer to the main line.`
        : lineInterpretations.length > 1
        ? `${city.name} bridges ${bodyMap[nearestLines[0].body]} with ${bodyMap[nearestLines[1].body]}. Both can unfold through ${angleMap[nearestLines[0].angleType]} and ${angleMap[nearestLines[1].angleType]}, without treating this area as an exclusive destination.`
        : `${city.name} primarily serves as a reference for themes of ${bodyMap[nearestLines[0].body]} through ${angleMap[nearestLines[0].angleType]}.`
      : fallback
        ? `${city.name} bukan titik pengaruh utama. Wilayah ini ditampilkan sebagai referensi domestik terdekat, sehingga temanya mungkin terasa lebih halus dibanding wilayah global yang berada lebih dekat dengan garis utama.`
        : lineInterpretations.length > 1
        ? `${city.name} mempertemukan ${BODY_LIVED_THEME[nearestLines[0].body]} dengan ${BODY_LIVED_THEME[nearestLines[1].body]}. Keduanya dapat hadir melalui ${ANGLE_LIVED_THEME[nearestLines[0].angleType]} dan ${ANGLE_LIVED_THEME[nearestLines[1].angleType]}, tanpa menjadikan wilayah ini sebagai pilihan mutlak.`
        : `${city.name} terutama menjadi referensi bagi tema ${BODY_LIVED_THEME[nearestLines[0].body]} melalui ${ANGLE_LIVED_THEME[nearestLines[0].angleType]}.`;

    return {
      cityId: city.id, cityName: city.name, region: city.region, country: city.country, countryCode: city.countryCode, latitude: city.latitude, longitude: city.longitude, nearestLines, lineInterpretations, integratedSummary,
      inclusionReason: domesticOrGlobal === "domestic" ? "nearest-ranked-domestic-reference" : additionalGlobal ? "additional-global-reference-no-domestic-slot" : "nearest-ranked-global-reference",
      domesticOrGlobal, categoryMatchReason: `${nearestLines[0].body} ${nearestLines[0].angleType} ${isEn ? `belongs to the category owner for ${owner.name}.` : `termasuk pemilik kategori ${owner.name}.`}`, supportingLines: nearestLines.map((line) => line.lineId),
      rankingReason: fallback
        ? (isEn ? `DISTANT_REFERENCE · Distance ${distance} km · nearest domestic reference with gentler influence.` : `DISTANT_REFERENCE · Jarak ${distance} km · referensi domestik terdekat dengan pengaruh lebih halus.`)
        : (isEn ? `PRIMARY_NEARBY · Distance ${distance} km is primary; category priority ${priority + 1}, supporting lines, then dataset ID as tie-breaker.` : `PRIMARY_NEARBY · Jarak ${distance} km menjadi faktor pertama; prioritas kategori ${priority + 1}, garis pendukung, lalu ID dataset menjadi tie-breaker.`),
      datasetVersion: ASTROCARTOGRAPHY_CITY_DATASET_VERSION,
    };
  };

  const primaryDomesticReferences = pickedDomestic.map((candidate) => toReference(candidate, "domestic", false));
  const domesticFallbackReferences = pickedDomesticFallback.map((candidate) => toReference(candidate, "domestic", false, true));
  const domesticReferences = primaryDomesticReferences.length ? primaryDomesticReferences : domesticFallbackReferences;
  const globalReferences = pickedGlobal.map((candidate, index) => toReference(candidate, "global", pickedDomestic.length < 2 && index > 0));
  const referenceCities = [...primaryDomesticReferences, ...globalReferences];
  const dominantLineIds = Array.from(new Set(referenceCities.flatMap((city) => city.nearestLines.map((line) => line.lineId)))).slice(0, 3);

  let domesticAvailabilityMessage: string | null = null;
  if (!birthCountryCode) {
    domesticAvailabilityMessage = isEn
      ? "Domestic prioritization is unavailable because birth country metadata is incomplete."
      : "Prioritas domestik belum tersedia karena metadata negara lahir belum lengkap.";
  } else if (primaryDomesticReferences.length === 0 && domesticFallbackReferences.length > 0) {
    const countryName = cityDataset.find((city) => city.countryCode === birthCountryCode)?.country || birthCountryCode;
    domesticAvailabilityMessage = isEn
      ? `No regions in ${countryName} fall directly on the primary line for this category.`
      : `Belum ada wilayah ${countryName} yang berada cukup dekat dengan garis utama kategori ini.`;
  } else if (primaryDomesticReferences.length === 0) {
    const countryName = cityDataset.find((city) => city.countryCode === birthCountryCode)?.country || birthCountryCode;
    domesticAvailabilityMessage = isEn
      ? `No regions in ${countryName} fall sufficiently close to the primary line, and domestic references could not be computed.`
      : `Belum ada wilayah ${countryName} yang berada cukup dekat dengan garis utama kategori ini, dan referensi domestik belum dapat dihitung.`;
  } else if (primaryDomesticReferences.length === 1) {
    domesticAvailabilityMessage = isEn
      ? "One domestic region verified; remaining slots are displayed as additional global references."
      : "Satu wilayah domestik terverifikasi; slot tersisa ditampilkan sebagai referensi global tambahan.";
  }

  return {
    categoryId: owner.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), categoryName: owner.name,
    dominantLineIds, regions: Array.from(new Set(referenceCities.map((city) => city.region || city.country))), referenceCities, domesticReferences, globalReferences,
    domesticCountryName: birthCountryCode ? cityDataset.find((city) => city.countryCode === birthCountryCode)?.country || null : null,
    domesticAvailabilityMessage,
    interpretation: owner.interpretation, potentialItems: owner.potentialItems, challenge: owner.challenge, groundingNote: owner.groundingNote,
    calculationStatus: "calculated",
  };
}

export function buildAutomaticAstrocartographyPresentation(result: AstrocartographyResult, options: { birthCountryCode?: string | null; cityDataset?: AstrocartographyReferenceCity[]; isEn?: boolean } = {}): AstrocartographyAutomaticPresentation | null {
  if (result.birthDataStatus !== "available" || !result.lines.length) return null;
  const isEn = options.isEn ?? isEnlEdition();
  const birthCountryCode = options.birthCountryCode?.trim().toUpperCase() || null;
  const cityDataset = options.cityDataset ?? ASTROCARTOGRAPHY_REFERENCE_CITIES;
  const cityUsage = new Map<string, number>();
  const categories: AstrocartographyCategoryResult[] = [];
  const owners = isEn ? CATEGORY_OWNERS_EN : CATEGORY_OWNERS;
  for (const owner of owners) {
    const category = buildCategory(owner, result, birthCountryCode, cityUsage, cityDataset, isEn);
    if (!category) continue;
    categories.push(category);
    for (const city of category.referenceCities) cityUsage.set(city.cityId, (cityUsage.get(city.cityId) || 0) + 1);
  }
  if (!categories.length) return null;
  const strongest = [...categories].sort((left, right) => (left.referenceCities[0]?.nearestLines[0]?.approximateDistanceKm ?? Infinity) - (right.referenceCities[0]?.nearestLines[0]?.approximateDistanceKm ?? Infinity) || left.categoryId.localeCompare(right.categoryId))[0];
  const uniqueReferences = Array.from(new Map(categories.flatMap((category) => category.referenceCities).map((city) => [city.cityId, city])).values());
  const byDistance = (left: AstrocartographyCityReferenceResult, right: AstrocartographyCityReferenceResult) => left.nearestLines[0].approximateDistanceKm - right.nearestLines[0].approximateDistanceKm || left.cityId.localeCompare(right.cityId);
  const overallReferences = birthCountryCode
    ? [...uniqueReferences.filter((city) => city.domesticOrGlobal === "domestic").sort(byDistance).slice(0, 2), ...uniqueReferences.filter((city) => city.domesticOrGlobal === "global").sort(byDistance).slice(0, 1)]
    : uniqueReferences.filter((city) => city.domesticOrGlobal === "global").sort(byDistance).slice(0, 3);
  const referenceCities = uniqueReferences.slice(0, 12);
  const overallRegions: AstrocartographyOverallLocationSummary[] = overallReferences.map((city) => {
    const category = categories.find((item) => item.referenceCities.some((reference) => reference.cityId === city.cityId))!;
    return { locationId: city.cityId, locationName: `${city.cityName}, ${city.country}`, dominantTheme: category.interpretation, bestFitActivities: category.potentialItems.slice(0, 4), caution: category.challenge };
  });
  const rankedCategoryEvidence = categories
    .map((category) => ({ category, reference: [...category.referenceCities].sort(byDistance)[0] }))
    .filter((item): item is { category: AstrocartographyCategoryResult; reference: AstrocartographyCityReferenceResult } => Boolean(item.reference))
    .sort((left, right) => byDistance(left.reference, right.reference) || left.category.categoryId.localeCompare(right.category.categoryId));
  const primaryEvidence = rankedCategoryEvidence[0];
  const contrastEvidence = rankedCategoryEvidence.find((item) => item.category.categoryId !== primaryEvidence?.category.categoryId) || rankedCategoryEvidence[1];
  const primaryLine = primaryEvidence?.reference.nearestLines[0];
  const supportingLine = primaryEvidence?.reference.nearestLines[1] || contrastEvidence?.reference.nearestLines[0];
  const primaryScope = primaryEvidence?.reference.domesticOrGlobal === "domestic" ? "wilayah domestik" : "wilayah global";
  const domesticLead = overallReferences.find((city) => city.domesticOrGlobal === "domestic");
  const globalLead = overallReferences.find((city) => city.domesticOrGlobal === "global");
  const primaryChallenge = primaryEvidence?.category.challenge || primaryEvidence?.category.groundingNote || (isEn ? "Test every possibility through lived experience and local conditions." : "Uji setiap kemungkinan melalui pengalaman dan kondisi nyata setempat.");

  const summary = primaryEvidence && primaryLine ? (isEn ? [
    `${primaryLine.body} ${primaryLine.angleType} is the nearest line bringing forward themes of ${BODY_LIVED_THEME_EN[primaryLine.body] || primaryLine.body} through ${ANGLE_LIVED_THEME_EN[primaryLine.angleType] || primaryLine.angleType}. Because this line aligns with ${primaryEvidence.category.categoryName.toLowerCase()}, your strongest geographic resonance moves through ${primaryEvidence.reference.domesticOrGlobal === "domestic" ? "domestic regions" : "global regions"}, with ${primaryEvidence.reference.cityName} calculated as a reference point approximately ${primaryLine.approximateDistanceKm} km from the line.`,
    `${domesticLead ? `Domestically, ${domesticLead.cityName} highlights ${BODY_LIVED_THEME_EN[domesticLead.nearestLines[0].body] || domesticLead.nearestLines[0].body} via ${ANGLE_LIVED_THEME_EN[domesticLead.nearestLines[0].angleType] || domesticLead.nearestLines[0].angleType}.` : "No domestic reference meets the primary line threshold; local influences should be read as a subtler layer."} ${globalLead ? `Globally, ${globalLead.cityName} opens patterns of ${BODY_LIVED_THEME_EN[globalLead.nearestLines[0].body] || globalLead.nearestLines[0].body} on ${ANGLE_LIVED_THEME_EN[globalLead.nearestLines[0].angleType] || globalLead.nearestLines[0].angleType}, ensuring international directions offer fresh possibilities rather than simply repeating domestic dynamics.` : "Global references do not present a sufficiently close comparative line."}`,
    `${supportingLine ? `Supporting line ${supportingLine.body} ${supportingLine.angleType} contributes ${BODY_LIVED_THEME_EN[supportingLine.body] || supportingLine.body} through ${ANGLE_LIVED_THEME_EN[supportingLine.angleType] || supportingLine.angleType}.` : "No secondary supporting line meets calculated criteria."} ${contrastEvidence ? `In contrast, the category ${contrastEvidence.category.categoryName.toLowerCase()} emerges through ${contrastEvidence.reference.nearestLines[0].body} ${contrastEvidence.reference.nearestLines[0].angleType}; this invites balance between two distinct geographic intentions rather than seeking a singular answer.` : "The primary pattern should be integrated without forcing a contrasting theme."} ${primaryChallenge}`,
  ] : [
    `${primaryLine.body} ${primaryLine.angleType} menjadi garis terdekat yang mengangkat tema ${BODY_LIVED_THEME[primaryLine.body]} melalui ${ANGLE_LIVED_THEME[primaryLine.angleType]}. Karena garis ini terkait dengan ${primaryEvidence.category.categoryName.toLocaleLowerCase("id")}, pola geografis terkuatmu bergerak melalui ${primaryScope}, dengan ${primaryEvidence.reference.cityName} sebagai titik referensi terhitung sekitar ${primaryLine.approximateDistanceKm} km dari garis.`,
    `${domesticLead ? `Di dalam negeri, ${domesticLead.cityName} menonjolkan ${BODY_LIVED_THEME[domesticLead.nearestLines[0].body]} lewat ${ANGLE_LIVED_THEME[domesticLead.nearestLines[0].angleType]}.` : "Tidak ada referensi domestik yang memenuhi ambang garis utama; pengaruh dalam negeri perlu dibaca sebagai referensi yang lebih halus."} ${globalLead ? `Secara global, ${globalLead.cityName} membuka pola ${BODY_LIVED_THEME[globalLead.nearestLines[0].body]} pada ${ANGLE_LIVED_THEME[globalLead.nearestLines[0].angleType]}, sehingga arah global tidak otomatis mengulang tema domestik.` : "Referensi global belum menyediakan garis pembanding yang cukup dekat."}`,
    `${supportingLine ? `Garis pendukung ${supportingLine.body} ${supportingLine.angleType} menambahkan ${BODY_LIVED_THEME[supportingLine.body]} melalui ${ANGLE_LIVED_THEME[supportingLine.angleType]}.` : "Tidak ada garis pendukung kedua yang memenuhi bukti terhitung."} ${contrastEvidence ? `Sebagai kontras, kategori ${contrastEvidence.category.categoryName.toLocaleLowerCase("id")} muncul melalui ${contrastEvidence.reference.nearestLines[0].body} ${contrastEvidence.reference.nearestLines[0].angleType}; ini meminta keseimbangan antara dua tujuan geografis, bukan satu jawaban tunggal.` : "Pola utama perlu diuji tanpa memaksakan tema pembanding."} ${primaryChallenge}`,
  ]) : [];

  return {
    strongestCategory: strongest.categoryName,
    dominantTheme: isEn
      ? `The ${strongest.categoryName.toLowerCase()} theme forms one of the closest geographic alignments to reference points on this map.`
      : `Tema ${strongest.categoryName.toLocaleLowerCase("id")} menjadi salah satu jalur geografis yang paling dekat dengan titik referensi dalam peta ini.`,
    dominantLineIds: Array.from(new Set(categories.flatMap((category) => category.dominantLineIds))).slice(0, 6), categories, referenceCities, overallRegions,
    summary,
    safetyNote: isEn
      ? "Reference cities are not directives to relocate or guarantees of fortune. Assess safety, legalities, costs, health, personal relations, and practical reality independently."
      : "Kota referensi bukan perintah untuk pindah atau jaminan hasil. Pertimbangkan keamanan, hukum, biaya, kesehatan, relasi, dan pengalaman nyata secara mandiri.",
    privacyNotice: isEn
      ? "This map is calculated exclusively from your birth data. Bhumi never accesses device geolocation or requests your current residential address."
      : "Peta ini dihitung dari data kelahiranmu. Bhumi tidak mengambil lokasi perangkat dan tidak memerlukan lokasi tempat tinggalmu saat ini.",
    sourceVersion: result.sourceVersion, cityDatasetVersion: ASTROCARTOGRAPHY_CITY_DATASET_VERSION,
  };
}
