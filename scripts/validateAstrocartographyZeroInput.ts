import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { analyzeAstrocartographyLocation, calculateAstrocartography } from "../lib/astrocartography/calculateAstrocartography";
import { buildAutomaticAstrocartographyPresentation } from "../lib/astrocartography/automaticPresentation";
import { ASTROCARTOGRAPHY_CITY_DATASET_VERSION, ASTROCARTOGRAPHY_REFERENCE_CITIES } from "../lib/astrocartography/cityReferences";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
const founderInput = { birthDate: "1985-05-03", birthTime: "23:45", timezone: "+07:00", latitude: -6.2088, longitude: 106.8456, birthCity: "Jakarta" };
const result = calculateAstrocartography(founderInput);
const automatic = buildAutomaticAstrocartographyPresentation(result, { birthCountryCode: "ID" })!;
const repeated = buildAutomaticAstrocartographyPresentation(calculateAstrocartography(founderInput), { birthCountryCode: "ID" })!;
const mapSource = read("components/blueprint/AstrocartographyMap.tsx");
const pageSource = read("app/blueprint/astrocartography/page.tsx");
const profileSource = read("app/profile/page.tsx");
const automaticSource = read("lib/astrocartography/automaticPresentation.ts");
const calculationSource = read("lib/astrocartography/calculateAstrocartography.ts");
const checks: Array<[string, () => void]> = [];
const check = (name: string, fn: () => void) => checks.push([name, fn]);
const category = (name: string) => automatic.categories.find((item) => item.categoryName === name)!;
const personalizedNarrative = (presentation: NonNullable<ReturnType<typeof buildAutomaticAstrocartographyPresentation>>) => [
  ...presentation.summary,
  presentation.dominantTheme,
  ...presentation.categories.flatMap((item) => [
    item.interpretation,
    item.challenge || "",
    ...item.referenceCities.flatMap((city) => [city.integratedSummary, ...city.lineInterpretations.map((line) => line.narrative)]),
  ]),
].filter(Boolean).join("\n");
const normalizeCollisionText = (value: string) => value
  .toLocaleLowerCase("id-ID")
  .replace(/\b(?:jakarta|bandung|surabaya|medan|makassar|singapore|paris|istanbul|kolkata|cape town|jayapura|tarakan|ambon|malang)\b/g, "{city}")
  .replace(/\b\d+(?:[.,]\d+)?\s*(?:km|kilometer)\b/g, "{distance}")
  .replace(/\s+/g, " ")
  .trim();
const assertPersonalizedDistinct = (left: string, right: string) => assert.notEqual(normalizeCollisionText(left), normalizeCollisionText(right));

type Verification = "CONFIRMED_BY_NEW_ENGINE" | "NEARBY_BUT_DIFFERENT" | "NOT_CONFIRMED" | "CANNOT_VERIFY";
const historical = [
  { location: "Sumedang", latitude: -6.8586, longitude: 107.9532, expected: ["jupiter-ic", "venus-asc"] },
  { location: "Yogyakarta", latitude: -7.7956, longitude: 110.3695, expected: ["mars-dsc", "sun-ic"] },
  { location: "Bali", latitude: -8.65, longitude: 115.2167, expected: ["neptune-mc"] },
  { location: "Perth", latitude: -31.9523, longitude: 115.8613, expected: ["moon-mc"] },
  { location: "Tokyo", latitude: 35.6762, longitude: 139.6503, expected: ["saturn-mc"] },
  { location: "Cairo", latitude: 30.0444, longitude: 31.2357, expected: ["sun-asc", "chiron-mc"] },
];
const founderVerification = historical.map((place) => {
  const ranked = result.lines.flatMap((line) => {
    const nearest = analyzeAstrocartographyLocation([line], place.latitude, place.longitude)?.nearestLines[0];
    return nearest ? [nearest] : [];
  }).sort((left, right) => left.approximateDistanceKm - right.approximateDistanceKm || left.lineId.localeCompare(right.lineId));
  return { location: place.location, results: place.expected.map((lineId) => {
    if (!result.lines.some((line) => line.lineId === lineId)) return { lineId, status: "CANNOT_VERIFY" as Verification, rank: null, distanceKm: null };
    const rank = ranked.findIndex((line) => line.lineId === lineId);
    const status: Verification = rank <= 1 ? "CONFIRMED_BY_NEW_ENGINE" : rank <= 4 ? "NEARBY_BUT_DIFFERENT" : "NOT_CONFIRMED";
    return { lineId, status, rank: rank + 1, distanceKm: ranked[rank].approximateDistanceKm };
  }) };
});

check("01 zero-input page rendering", () => assert.ok(automatic.categories.length > 0 && automatic.referenceCities.length > 0));
check("02 no search field", () => assert.ok(!/<input|search field|Cari kota|Location Search/i.test(mapSource + pageSource)));
check("03 no coordinate fields", () => assert.ok(!/Latitude|Longitude|inputMode/.test(mapSource + pageSource)));
check("04 no analysis button", () => assert.ok(!/<button|Analisis|submit/i.test(mapSource + pageSource)));
check("05 no device geolocation", () => assert.ok(!/navigator\.geolocation|getCurrentPosition/.test(mapSource + pageSource + automaticSource)));
check("06 no IP geolocation", () => assert.ok(!/ipapi|ipinfo|geoip|currentLocation/.test(mapSource + pageSource + automaticSource)));
check("07 automatic reading rendering without visual map", () => assert.ok(/automatic\.categories/.test(mapSource) && !/<svg|World Map|Legenda dan detail garis/.test(mapSource + pageSource)));
check("08 automatic category generation", () => assert.equal(automatic.categories.length, 7));
check("09 economic category", () => assert.ok(category("Ekonomi dan Peluang").dominantLineIds.length > 0));
check("10 career category", () => assert.ok(category("Karier dan Visibilitas").dominantLineIds.length > 0));
check("11 relationship category", () => assert.ok(category("Relasi dan Kolaborasi").dominantLineIds.length > 0));
check("12 spiritual category", () => assert.ok(category("Spiritualitas dan Kreativitas").dominantLineIds.length > 0));
check("13 home category", () => assert.ok(category("Rumah dan Fondasi").dominantLineIds.length > 0));
check("14 transformation category", () => assert.ok(category("Transformasi dan Pendewasaan").dominantLineIds.length > 0));
check("15 education category", () => assert.ok(category("Pendidikan dan Pertumbuhan").dominantLineIds.length > 0));
check("16 unsupported category omission", () => assert.equal(buildAutomaticAstrocartographyPresentation({ ...result, lines: result.lines.filter((line) => line.lineId === "pluto-asc") }, { birthCountryCode: "ID" })!.categories.length, 1));
check("17 automatic city reference generation", () => assert.ok(automatic.referenceCities.every((city) => ASTROCARTOGRAPHY_REFERENCE_CITIES.some((source) => source.id === city.cityId))));
check("18 city distance verification", () => assert.ok(automatic.categories.every((item) => item.referenceCities.every((city) => city.nearestLines.every((line) => Number.isFinite(line.approximateDistanceKm) && line.approximateDistanceKm >= 0)))));
check("19 city inclusion reason", () => assert.ok(automatic.referenceCities.every((city) => /reference/.test(city.inclusionReason) && city.datasetVersion === ASTROCARTOGRAPHY_CITY_DATASET_VERSION)));
check("20 no popularity-based city ranking", () => assert.ok(automatic.referenceCities.every((city) => !/population|popularity|tourism|weather|culture|climate/i.test(`${city.rankingReason} ${city.categoryMatchReason} ${city.inclusionReason}`))));
check("21 no environment data", () => assert.ok(!/weather|environment|open-meteo|air-quality/i.test(automaticSource + mapSource)));
check("22 multi-line region", () => assert.ok(automatic.categories.some((item) => item.referenceCities.some((city) => city.nearestLines.length > 1))));
check("23 integrated regional summary", () => assert.ok(automatic.categories.every((item) => item.referenceCities.every((city) => city.integratedSummary.length > 80 && city.lineInterpretations.length === city.nearestLines.length))));
check("24 Profile card parity", () => { assert.match(profileSource, /Astrocartography[\s\S]*Peta dunia yang menunjukkan wilayah tempat tema planet kelahiranmu lebih menonjol/); assert.ok(!/Tema utama:[\s\S]*Wilayah domestik:[\s\S]*Lihat peta selengkapnya/.test(profileSource)); });
for (const [index, location] of ["Sumedang", "Yogyakarta", "Bali", "Perth", "Tokyo", "Cairo"].entries()) check(`${25 + index} Founder ${location} verification`, () => assert.ok(founderVerification.find((item) => item.location === location)?.results.every((item) => Boolean(item.status))));
check("31 incomplete birth data", () => assert.equal(buildAutomaticAstrocartographyPresentation(calculateAstrocartography({ ...founderInput, birthTime: "" }), { birthCountryCode: "ID" }), null));
check("32 deterministic refresh", () => assert.deepEqual(automatic, repeated));
check("33 cross-user isolation", () => assert.notDeepEqual(automatic, buildAutomaticAstrocartographyPresentation(calculateAstrocartography({ ...founderInput, birthDate: "1990-01-01" }), { birthCountryCode: "ID" })));
check("34 no storage write", () => assert.ok(!/setUser|localStorage\.setItem|sessionStorage\.setItem|save[A-Z]/.test(mapSource + pageSource + automaticSource)));
check("35 mobile layout safety", () => assert.match(mapSource + pageSource, /overflow-x-hidden[\s\S]*sm:p-/));
check("36 desktop layout safety", () => assert.match(pageSource + mapSource, /max-w-6xl[\s\S]*lg:grid-cols/));
check("37 existing Astrocartography formulas unchanged", () => { assert.match(calculationSource, /Math\.acos/); assert.match(calculationSource, /raDegrees - gastDegrees/); assert.match(calculationSource, /splitAntimeridian/); });
check("38 other Blueprint systems unchanged", () => assert.ok(!/blueprint\/(natal-chart|whole-sign|numerology|destiny-matrix|human-design|weton|bazi|vedic|tzolkin)\/page/.test(mapSource + automaticSource + calculationSource)));
check("39 shared safetyNote excluded from personalized score", () => {
  const scored = personalizedNarrative(automatic);
  assert.ok(automatic.safetyNote.length > 0);
  assert.ok(!scored.includes(automatic.safetyNote));
});
check("40 personalized summary included in score", () => {
  const marker = "PERSONALIZED-LINE-EVIDENCE";
  const changed = { ...automatic, summary: [marker, ...automatic.summary.slice(1)] };
  assert.ok(personalizedNarrative(changed).includes(marker));
  assert.notEqual(personalizedNarrative(changed), personalizedNarrative(automatic));
});
check("41 identical personalized summaries fail", () => assert.throws(() => assertPersonalizedDistinct("Jupiter ASC membuka pertumbuhan.", "Jupiter ASC membuka pertumbuhan.")));
check("42 city-only substitution fails", () => assert.throws(() => assertPersonalizedDistinct("Jupiter ASC kuat di Jakarta.", "Jupiter ASC kuat di Bandung.")));
check("43 distance-only substitution fails", () => assert.throws(() => assertPersonalizedDistinct("Jupiter ASC berjarak 12 km.", "Jupiter ASC berjarak 48 km.")));
check("44 universal template reuse fails", () => assert.throws(() => assertPersonalizedDistinct("Tempat baru dapat membuat energimu berbeda.", "Tempat baru dapat membuat energimu berbeda.")));
check("45 cross-user narrative remains distinct", () => {
  const other = buildAutomaticAstrocartographyPresentation(calculateAstrocartography({ ...founderInput, birthDate: "1990-01-01" }), { birthCountryCode: "ID" })!;
  assertPersonalizedDistinct(personalizedNarrative(automatic), personalizedNarrative(other));
});

let passed = 0;
for (const [name, fn] of checks) { try { fn(); passed += 1; console.log(`PASS ${name}`); } catch (error) { console.error(`FAIL ${name}`); throw error; } }
console.log(JSON.stringify({ founderVerification }, null, 2));
console.log(`Astrocartography zero-input: ${passed}/${checks.length} checks passed`);
