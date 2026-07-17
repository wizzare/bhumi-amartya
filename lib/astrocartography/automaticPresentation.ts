import { analyzeAstrocartographyLocation } from "./calculateAstrocartography";
import { ASTROCARTOGRAPHY_CITY_DATASET_VERSION, ASTROCARTOGRAPHY_REFERENCE_CITIES, type AstrocartographyReferenceCity } from "./cityReferences";
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

const BODY_LIVED_THEME: Record<string, string> = { Sun: "identitas dan keberanian terlihat", Moon: "rasa aman dan kebutuhan emosional", Mercury: "komunikasi dan pembelajaran", Venus: "keterhubungan dan kreativitas", Mars: "inisiatif dan keberanian bertindak", Jupiter: "pertumbuhan dan perluasan wawasan", Saturn: "tanggung jawab dan pematangan", Uranus: "perubahan dan kebebasan", Neptune: "imajinasi dan kepekaan spiritual", Pluto: "transformasi dan kedalaman" };
const ANGLE_LIVED_THEME: Record<string, string> = { MC: "karya serta kehidupan publik", IC: "rumah serta fondasi batin", ASC: "identitas serta awal baru", DSC: "relasi serta kolaborasi" };

const MAX_REFERENCE_DISTANCE_KM = 1500;

function buildCategory(owner: CategoryOwner, result: AstrocartographyResult, birthCountryCode: string | null, cityUsage: Map<string, number>, cityDataset: AstrocartographyReferenceCity[]): AstrocartographyCategoryResult | null {
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
  const toReference = ({ city, nearestLines, distance, priority }: typeof calculated[number], domesticOrGlobal: "domestic" | "global", additionalGlobal: boolean, fallback = false): AstrocartographyCityReferenceResult => {
    const lineInterpretations = nearestLines.map((line) => ({ lineId: line.lineId, label: `${line.body} ${line.angleType}`, narrative: fallback
      ? `Tema ${BODY_LIVED_THEME[line.body]} mungkin terasa lebih halus melalui ${ANGLE_LIVED_THEME[line.angleType]} karena wilayah ini berada lebih jauh dari garis utama.`
      : `Di sekitar garis ini, tema ${BODY_LIVED_THEME[line.body]} mungkin lebih mudah terasa melalui ${ANGLE_LIVED_THEME[line.angleType]}.` }));
    const integratedSummary = fallback
      ? `${city.name} bukan titik pengaruh utama. Wilayah ini ditampilkan sebagai referensi domestik terdekat, sehingga temanya mungkin terasa lebih halus dibanding wilayah global yang berada lebih dekat dengan garis utama.`
      : lineInterpretations.length > 1
      ? `${city.name} mempertemukan ${BODY_LIVED_THEME[nearestLines[0].body]} dengan ${BODY_LIVED_THEME[nearestLines[1].body]}. Keduanya dapat hadir melalui ${ANGLE_LIVED_THEME[nearestLines[0].angleType]} dan ${ANGLE_LIVED_THEME[nearestLines[1].angleType]}, tanpa menjadikan wilayah ini sebagai pilihan mutlak.`
      : `${city.name} terutama menjadi referensi bagi tema ${BODY_LIVED_THEME[nearestLines[0].body]} melalui ${ANGLE_LIVED_THEME[nearestLines[0].angleType]}.`;
    return { cityId: city.id, cityName: city.name, region: city.region, country: city.country, countryCode: city.countryCode, latitude: city.latitude, longitude: city.longitude, nearestLines, lineInterpretations, integratedSummary,
      inclusionReason: domesticOrGlobal === "domestic" ? "nearest-ranked-domestic-reference" : additionalGlobal ? "additional-global-reference-no-domestic-slot" : "nearest-ranked-global-reference",
      domesticOrGlobal, categoryMatchReason: `${nearestLines[0].body} ${nearestLines[0].angleType} termasuk pemilik kategori ${owner.name}.`, supportingLines: nearestLines.map((line) => line.lineId),
      rankingReason: fallback ? `DISTANT_REFERENCE · Jarak ${distance} km · referensi domestik terdekat dengan pengaruh lebih halus.` : `PRIMARY_NEARBY · Jarak ${distance} km menjadi faktor pertama; prioritas kategori ${priority + 1}, garis pendukung, lalu ID dataset menjadi tie-breaker.`, datasetVersion: ASTROCARTOGRAPHY_CITY_DATASET_VERSION };
  };
  const primaryDomesticReferences = pickedDomestic.map((candidate) => toReference(candidate, "domestic", false));
  const domesticFallbackReferences = pickedDomesticFallback.map((candidate) => toReference(candidate, "domestic", false, true));
  const domesticReferences = primaryDomesticReferences.length ? primaryDomesticReferences : domesticFallbackReferences;
  const globalReferences = pickedGlobal.map((candidate, index) => toReference(candidate, "global", pickedDomestic.length < 2 && index > 0));
  const referenceCities = [...primaryDomesticReferences, ...globalReferences];
  const dominantLineIds = Array.from(new Set(referenceCities.flatMap((city) => city.nearestLines.map((line) => line.lineId)))).slice(0, 3);
  return {
    categoryId: owner.name.toLocaleLowerCase("id").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), categoryName: owner.name,
    dominantLineIds, regions: Array.from(new Set(referenceCities.map((city) => city.region || city.country))), referenceCities, domesticReferences, globalReferences,
    domesticCountryName: birthCountryCode ? cityDataset.find((city) => city.countryCode === birthCountryCode)?.country || null : null,
    domesticAvailabilityMessage: !birthCountryCode ? "Prioritas domestik belum tersedia karena metadata negara lahir belum lengkap." : primaryDomesticReferences.length === 0 && domesticFallbackReferences.length > 0 ? `Belum ada wilayah ${cityDataset.find((city) => city.countryCode === birthCountryCode)?.country || birthCountryCode} yang berada cukup dekat dengan garis utama kategori ini.` : primaryDomesticReferences.length === 0 ? `Belum ada wilayah ${cityDataset.find((city) => city.countryCode === birthCountryCode)?.country || birthCountryCode} yang berada cukup dekat dengan garis utama kategori ini, dan referensi domestik belum dapat dihitung.` : primaryDomesticReferences.length === 1 ? "Satu wilayah domestik terverifikasi; slot tersisa ditampilkan sebagai referensi global tambahan." : null,
    interpretation: owner.interpretation, potentialItems: owner.potentialItems, challenge: owner.challenge, groundingNote: owner.groundingNote,
    calculationStatus: "calculated",
  };
}

export function buildAutomaticAstrocartographyPresentation(result: AstrocartographyResult, options: { birthCountryCode?: string | null; cityDataset?: AstrocartographyReferenceCity[] } = {}): AstrocartographyAutomaticPresentation | null {
  if (result.birthDataStatus !== "available" || !result.lines.length) return null;
  const birthCountryCode = options.birthCountryCode?.trim().toUpperCase() || null;
  const cityDataset = options.cityDataset ?? ASTROCARTOGRAPHY_REFERENCE_CITIES;
  const cityUsage = new Map<string, number>();
  const categories: AstrocartographyCategoryResult[] = [];
  for (const owner of CATEGORY_OWNERS) {
    const category = buildCategory(owner, result, birthCountryCode, cityUsage, cityDataset);
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
  const primaryChallenge = primaryEvidence?.category.challenge || primaryEvidence?.category.groundingNote || "Uji setiap kemungkinan melalui pengalaman dan kondisi nyata setempat.";
  return {
    strongestCategory: strongest.categoryName,
    dominantTheme: `Tema ${strongest.categoryName.toLocaleLowerCase("id")} menjadi salah satu jalur geografis yang paling dekat dengan titik referensi dalam peta ini.`,
    dominantLineIds: Array.from(new Set(categories.flatMap((category) => category.dominantLineIds))).slice(0, 6), categories, referenceCities, overallRegions,
    summary: primaryEvidence && primaryLine ? [
      `${primaryLine.body} ${primaryLine.angleType} menjadi garis terdekat yang mengangkat tema ${BODY_LIVED_THEME[primaryLine.body]} melalui ${ANGLE_LIVED_THEME[primaryLine.angleType]}. Karena garis ini terkait dengan ${primaryEvidence.category.categoryName.toLocaleLowerCase("id")}, pola geografis terkuatmu bergerak melalui ${primaryScope}, dengan ${primaryEvidence.reference.cityName} sebagai titik referensi terhitung sekitar ${primaryLine.approximateDistanceKm} km dari garis.`,
      `${domesticLead ? `Di dalam negeri, ${domesticLead.cityName} menonjolkan ${BODY_LIVED_THEME[domesticLead.nearestLines[0].body]} lewat ${ANGLE_LIVED_THEME[domesticLead.nearestLines[0].angleType]}.` : "Tidak ada referensi domestik yang memenuhi ambang garis utama; pengaruh dalam negeri perlu dibaca sebagai referensi yang lebih halus."} ${globalLead ? `Secara global, ${globalLead.cityName} membuka pola ${BODY_LIVED_THEME[globalLead.nearestLines[0].body]} pada ${ANGLE_LIVED_THEME[globalLead.nearestLines[0].angleType]}, sehingga arah global tidak otomatis mengulang tema domestik.` : "Referensi global belum menyediakan garis pembanding yang cukup dekat."}`,
      `${supportingLine ? `Garis pendukung ${supportingLine.body} ${supportingLine.angleType} menambahkan ${BODY_LIVED_THEME[supportingLine.body]} melalui ${ANGLE_LIVED_THEME[supportingLine.angleType]}.` : "Tidak ada garis pendukung kedua yang memenuhi bukti terhitung."} ${contrastEvidence ? `Sebagai kontras, kategori ${contrastEvidence.category.categoryName.toLocaleLowerCase("id")} muncul melalui ${contrastEvidence.reference.nearestLines[0].body} ${contrastEvidence.reference.nearestLines[0].angleType}; ini meminta keseimbangan antara dua tujuan geografis, bukan satu jawaban tunggal.` : "Pola utama perlu diuji tanpa memaksakan tema pembanding."} ${primaryChallenge}`,
    ] : [],
    safetyNote: "Kota referensi bukan perintah untuk pindah atau jaminan hasil. Pertimbangkan keamanan, hukum, biaya, kesehatan, relasi, dan pengalaman nyata secara mandiri.",
    privacyNotice: "Peta ini dihitung dari data kelahiranmu. Bhumi tidak mengambil lokasi perangkat dan tidak memerlukan lokasi tempat tinggalmu saat ini.",
    sourceVersion: result.sourceVersion, cityDatasetVersion: ASTROCARTOGRAPHY_CITY_DATASET_VERSION,
  };
}
