import fs from "node:fs";
import path from "node:path";
import { analyzeAstrocartographyLocation, calculateAstrocartography } from "../lib/astrocartography/calculateAstrocartography";
import { buildAutomaticAstrocartographyPresentation } from "../lib/astrocartography/automaticPresentation";
import { ASTROCARTOGRAPHY_REFERENCE_CITIES } from "../lib/astrocartography/cityReferences";

const founder = {
  birthDate: "1985-05-03",
  birthTime: "23:45",
  timezone: "Asia/Jakarta",
  latitude: -6.2088,
  longitude: 106.8456,
  birthCity: "Jakarta",
  birthCountry: "Indonesia",
};

const historical = [
  { name: "Sumedang city", latitude: -6.8586, longitude: 107.9532 },
  { name: "Sumedang regency centroid", latitude: -6.8381, longitude: 107.9275 },
  { name: "Yogyakarta", latitude: -7.7956, longitude: 110.3695 },
  { name: "Bali island centroid", latitude: -8.4095, longitude: 115.1889 },
  { name: "Denpasar", latitude: -8.65, longitude: 115.2167 },
  { name: "Perth", latitude: -31.9523, longitude: 115.8613 },
  { name: "Tokyo", latitude: 35.6762, longitude: 139.6503 },
  { name: "Cairo", latitude: 30.0444, longitude: 31.2357 },
];

const currentNames = ["Malang", "Surabaya", "Gorontalo", "Kupang", "Santiago", "Washington, D.C.", "Istanbul", "Moscow", "Mumbai", "Kolkata", "Sydney", "Tanjungpandan", "Cape Town", "London"];

function analyze(result: ReturnType<typeof calculateAstrocartography>, place: { name: string; latitude: number; longitude: number }) {
  return { ...place, analysis: analyzeAstrocartographyLocation(result.lines, place.latitude, place.longitude) };
}

const result = calculateAstrocartography(founder);
const compact = (value: ReturnType<typeof calculateAstrocartography>) => ({
  utcInstant: value.utcInstant,
  julianDate: value.julianDate,
  greenwichApparentSiderealTimeHours: value.greenwichApparentSiderealTimeHours,
  bodies: value.bodies,
});
const sensitivities = [
  ["minus_60m", "1985-05-03", "22:45", "Asia/Jakarta"], ["minus_15m", "1985-05-03", "23:30", "Asia/Jakarta"],
  ["minus_5m", "1985-05-03", "23:40", "Asia/Jakarta"], ["minus_1m", "1985-05-03", "23:44", "Asia/Jakarta"],
  ["plus_1m", "1985-05-03", "23:46", "Asia/Jakarta"], ["plus_5m", "1985-05-03", "23:50", "Asia/Jakarta"],
  ["plus_15m", "1985-05-04", "00:00", "+07:00"], ["plus_60m", "1985-05-04", "00:45", "+07:00"],
  ["timezone_minus_1h", "1985-05-03", "23:45", "+06:00"], ["timezone_plus_1h", "1985-05-03", "23:45", "+08:00"],
] as const;

const output = {
  generatedAt: new Date().toISOString(), founder, result,
  automaticPresentation: buildAutomaticAstrocartographyPresentation(result, { birthCountryCode: "ID" }),
  historical: historical.map((place) => analyze(result, place)),
  current: currentNames.map((name) => ASTROCARTOGRAPHY_REFERENCE_CITIES.find((city) => city.name === name)).filter(Boolean).map((place) => analyze(result, place!)),
  sensitivities: sensitivities.map(([id, birthDate, birthTime, timezone]) => ({ id, result: compact(calculateAstrocartography({ ...founder, birthDate, birthTime, timezone })) })),
  coordinateSensitivity: [
    { id: "jakarta_northwest", latitude: -6.10, longitude: 106.70 },
    { id: "jakarta_southeast", latitude: -6.35, longitude: 107.00 },
  ].map((item) => {
    const changed = calculateAstrocartography({ ...founder, latitude: item.latitude, longitude: item.longitude });
    return { ...item, result: compact(changed), lineGeometryEqual: JSON.stringify(changed.lines) === JSON.stringify(result.lines) };
  }),
};

const target = path.join(process.cwd(), "recovery-evidence", "astrocartography-comparison", "bhumi-runtime-output.json");
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(target);
