import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import * as Astronomy from "astronomy-engine";
import { analyzeAstrocartographyLocation, ASTROCARTOGRAPHY_ANGLES, ASTROCARTOGRAPHY_BODIES, calculateAstrocartography, normalizeMapLongitude } from "../lib/astrocartography/calculateAstrocartography";
import { buildAstrocartographyLocationPresentation, buildAstrocartographyPresentation } from "../lib/astrocartography/presentation";
import { createAstrocartographyPlace } from "../lib/astrocartography/locations";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
const founder = { birthDate: "1985-05-03", birthTime: "23:45", timezone: "+07:00", latitude: -6.2088, longitude: 106.8456, birthCity: "Jakarta" };
const result = calculateAstrocartography(founder);
const repeated = calculateAstrocartography(founder);
const presentation = buildAstrocartographyPresentation(result);
const jakarta = createAstrocartographyPlace({ name: "Jakarta", country: "Indonesia", countryCode: "ID", latitude: -6.2088, longitude: 106.8456, inclusionReason: "birthplace" });
const jakartaAnalysis = analyzeAstrocartographyLocation(result.lines, jakarta.latitude, jakarta.longitude)!;
const jakartaPresentation = buildAstrocartographyLocationPresentation(jakarta, jakartaAnalysis, presentation)!;
const calcSource = read("lib/astrocartography/calculateAstrocartography.ts");
const mapSource = read("components/blueprint/AstrocartographyMap.tsx");
const routeSource = read("app/blueprint/astrocartography/page.tsx");
const profileSource = read("app/profile/page.tsx");
const presentationSource = read("lib/astrocartography/presentation.ts");
const checks: Array<[string, () => void]> = [];
const check = (name: string, test: () => void) => checks.push([name, test]);
const line = (id: string) => result.lines.find((item) => item.lineId === id)!;
const sentenceCount = (text: string) => (text.match(/[.!?](?:\s|$)/g) || []).length;

check("01 UTC conversion", () => assert.equal(result.utcInstant, "1985-05-03T16:45:00.000Z"));
check("02 timezone offset handling", () => assert.equal(calculateAstrocartography({ ...founder, timezone: "+08:00" }).utcInstant, "1985-05-03T15:45:00.000Z"));
check("03 Julian date", () => assert.equal(result.julianDate, Number((Astronomy.MakeTime(new Date(result.utcInstant!)).ut + 2451545).toFixed(6))));
check("04 sidereal time normalization", () => assert.ok(result.greenwichApparentSiderealTimeHours! >= 0 && result.greenwichApparentSiderealTimeHours! < 24));
check("05 equatorial conversion owner", () => assert.match(calcSource, /GeoVector[\s\S]*Rotation_EQJ_EQD[\s\S]*EquatorFromVector/));
check("06 right ascension range", () => assert.ok(result.bodies.every((body) => body.rightAscensionHours >= 0 && body.rightAscensionHours < 24)));
check("07 declination range", () => assert.ok(result.bodies.every((body) => body.declinationDegrees >= -90 && body.declinationDegrees <= 90)));
check("08 Sun MC", () => assert.equal(line("sun-mc").angleType, "MC"));
check("09 Sun IC", () => assert.equal(line("sun-ic").angleType, "IC"));
check("10 Sun ASC", () => assert.ok(line("sun-asc").coordinates.flat().length > 20));
check("11 Sun DSC", () => assert.ok(line("sun-dsc").coordinates.flat().length > 20));
for (const [index, body] of ASTROCARTOGRAPHY_BODIES.slice(1).entries()) check(`${String(index + 12).padStart(2, "0")} ${body} lines`, () => assert.ok(ASTROCARTOGRAPHY_ANGLES.every((angle) => result.lines.some((item) => item.lineId === `${body.toLowerCase()}-${angle.toLowerCase()}`))));
check("21 MC IC opposition", () => assert.equal(Math.abs(normalizeMapLongitude(line("sun-ic").coordinates[0][0][0] - line("sun-mc").coordinates[0][0][0])), 180));
check("22 ASC DSC distinction", () => assert.notDeepEqual(line("sun-asc").coordinates, line("sun-dsc").coordinates));
check("23 high latitude invalid solution", () => assert.ok(result.lines.some((item) => (item.angleType === "ASC" || item.angleType === "DSC") && item.validLatitudeRange && (item.validLatitudeRange[0] > -88 || item.validLatitudeRange[1] < 88))));
check("24 circumpolar handling", () => assert.match(calcSource, /Math\.abs\(cosHourAngle\) > 1/));
check("25 antimeridian split", () => assert.ok(result.lines.every((item) => item.coordinates.every((segment) => segment.every((point, index) => index === 0 || Math.abs(point[0] - segment[index - 1][0]) <= 180)))));
check("26 longitude normalization", () => assert.deepEqual([normalizeMapLongitude(181), normalizeMapLongitude(-181), normalizeMapLongitude(540)], [-179, 179, 180]));
check("27 latitude sampling determinism", () => assert.equal(result.samplingLatitudeStep, 2));
check("28 no invalid line bridging", () => assert.ok(result.lines.every((item) => item.coordinates.every((segment) => segment.length >= 2))));
check("29 stable line IDs", () => assert.equal(new Set(result.lines.map((item) => item.lineId)).size, 40));
check("30 GeoJSON validity", () => assert.ok(result.lines.every((item) => item.geometryType === "MultiLineString" && item.coordinates.flat().every(([lon, lat]) => lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90))));
check("31 calculated presentation integration", () => assert.match(mapSource, /automatic\.categories[\s\S]*nearestLines/));
check("32 planet filter removed by Founder", () => assert.ok(!/bodyFilter|Semua planet/.test(mapSource)));
check("33 angle filter removed by Founder", () => assert.ok(!/angleFilter|Semua angle/.test(mapSource)));
check("34 visual map and legend removed by Founder", () => assert.ok(!/<svg|World Map|Legenda dan detail garis/.test(mapSource + routeSource)));
check("35 selected location analysis contract", () => assert.ok(jakartaPresentation.selectedLocation.name === "Jakarta" && jakartaPresentation.nearestLine.calculationStatus === "calculated" && Object.keys(jakartaPresentation.interpretation).length === 6));
check("36 nearest point distance", () => assert.ok(analyzeAstrocartographyLocation(result.lines, 0, 0)!.nearestLines.every((item) => item.approximateDistanceKm >= 0)));
check("37 antimeridian distance", () => assert.match(calcSource, /normalizeMapLongitude\(right\[0\] - left\[0\]\)/));
check("38 no longitude-only shortcut", () => assert.match(calcSource, /Math\.cos\(radians\(left\[1\]\)\)/));
check("39 missing birth time", () => assert.equal(calculateAstrocartography({ ...founder, birthTime: "" }).lines.length, 0));
check("40 missing timezone", () => assert.equal(calculateAstrocartography({ ...founder, timezone: "" }).lines.length, 0));
check("41 missing birthplace", () => assert.equal(calculateAstrocartography({ ...founder, latitude: undefined }).lines.length, 0));
check("42 unsupported planet", () => assert.ok(!result.lines.some((item) => /node|chiron|lilith/i.test(item.lineId))));
check("43 calculation failure UI", () => assert.match(routeSource, /Unable to build map[\s\S]*belum dapat dibangun/));
check("44 map failure UI", () => assert.match(routeSource, /tidak ada garis perkiraan/));
check("45 deterministic refresh", () => assert.deepEqual(result, repeated));
check("46 cross-user isolation", () => assert.notDeepEqual(calculateAstrocartography({ ...founder, birthDate: "1990-01-01" }).lines, result.lines));
check("47 no storage write", () => assert.ok(!/setUser|save|localStorage\.setItem|sessionStorage\.setItem/.test(routeSource + calcSource + mapSource)));
check("48 Profile order retained", () => assert.match(profileSource, /Whole Sign Birth Chart[\s\S]*Astrocartography[\s\S]*Zi Wei Dou Shu[\s\S]*Sebelas cermin/));
check("49 route source exists", () => assert.ok(fs.existsSync(path.join(root, "app/blueprint/astrocartography/page.tsx"))));
check("50 summary paragraph validation", () => assert.equal(presentation.summary.length, 3));
check("51 summary sentence validation", () => assert.ok(presentation.summary.every((paragraph) => sentenceCount(paragraph) >= 3 && sentenceCount(paragraph) <= 4)));
check("52 no event certainty", () => assert.ok(!/(akan pasti|pasti membawa|takdirmu|harus pindah|menjamin (perkawinan|kekayaan|ketenaran|promosi))/i.test(presentationSource)));
check("53 no automatic geolocation", () => assert.ok(!/navigator\.geolocation|getCurrentPosition/.test(routeSource + mapSource)));
check("54 Natal Chart unchanged", () => assert.ok(!/natal-chart\/page|calculateNatalBasics[^\n]*=/.test(routeSource + mapSource + presentationSource)));
check("55 Whole Sign unchanged", () => assert.ok(!/whole-sign\/page|calculateWholeSign/.test(routeSource + mapSource + calcSource)));
check("56 other seven systems unchanged", () => assert.ok(!/blueprint\/(numerology|destiny-matrix|human-design|weton|bazi|vedic|tzolkin)\/page/.test(routeSource + mapSource + calcSource)));
check("57 mobile layout safety", () => assert.match(routeSource + mapSource, /overflow-x-hidden[\s\S]*sm:p-/));
check("58 desktop layout safety", () => assert.match(routeSource + mapSource, /max-w-6xl[\s\S]*lg:grid-cols/));

assert.ok(!/weather|tourism|environment/i.test(mapSource + presentationSource));

let passed = 0;
for (const [name, test] of checks) {
  try { test(); passed += 1; console.log(`PASS ${name}`); }
  catch (error) { console.error(`FAIL ${name}`); throw error; }
}
console.log(`Astrocartography R8A: ${passed}/${checks.length} checks passed`);
