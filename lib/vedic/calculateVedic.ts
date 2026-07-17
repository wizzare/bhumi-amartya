import * as Astronomy from "astronomy-engine";
import type {
  PlanetaryStrength, PurusharthaFocus, VedicBlueprint, VedicCalculationInput, VedicPartialBlueprint,
  VedicDashaPeriod, VedicGraha, VedicKaraka, VedicPlacement, VedicYoga,
} from "./types";

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const SIGN_LORDS: VedicGraha[] = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
const NAKSHATRAS = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
const DASHA_ORDER: VedicGraha[] = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const DASHA_YEARS: Record<VedicGraha, number> = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
const CITY: Record<string, { latitude: number; longitude: number; timezone: string }> = {
  jakarta: { latitude: -6.2088, longitude: 106.8456, timezone: "+07:00" },
  bandung: { latitude: -6.9175, longitude: 107.6191, timezone: "+07:00" },
  surabaya: { latitude: -7.2575, longitude: 112.7521, timezone: "+07:00" },
  yogyakarta: { latitude: -7.7956, longitude: 110.3695, timezone: "+07:00" },
  denpasar: { latitude: -8.65, longitude: 115.2167, timezone: "+08:00" },
  bali: { latitude: -8.65, longitude: 115.2167, timezone: "+08:00" },
};
const DAY = 86_400_000;
const DASHA_YEAR_DAYS = 365.2425;

const mod = (n: number, d = 360) => ((n % d) + d) % d;
const signIndex = (longitude: number) => Math.floor(mod(longitude) / 30);
const sign = (longitude: number) => SIGNS[signIndex(longitude)];
const degree = (longitude: number) => Number((mod(longitude) % 30).toFixed(4));
const iso = (date: Date) => date.toISOString();
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY);

function timezoneOffsetMinutes(value: string): number | null {
  const match = value.match(/^([+-])(\d{1,2}):?(\d{2})?$/);
  if (!match) return null;
  return (match[1] === "-" ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3] || 0));
}

function namedTimezoneOffset(value: string, date: Date): number | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: value, timeZoneName: "longOffset" }).formatToParts(date);
    const zone = parts.find((part) => part.type === "timeZoneName")?.value || "";
    return timezoneOffsetMinutes(zone.replace("GMT", ""));
  } catch {
    return null;
  }
}

function resolveInput(input: VedicCalculationInput) {
  const cityKey = Object.keys(CITY).find((key) => (input.birthCity || "").toLowerCase().includes(key));
  const fallback = cityKey ? CITY[cityKey] : undefined;
  const latitude = input.latitude ?? fallback?.latitude;
  const longitude = input.longitude ?? fallback?.longitude;
  const timezone = input.timezone || fallback?.timezone;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !timezone) {
    throw new Error("Vedic calculation requires birth coordinates and timezone.");
  }
  const [year, month, day] = input.birthDate.split("-").map(Number);
  const [hour, minute] = input.birthTime!.split(":").map(Number);
  const wallClock = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const offset = timezoneOffsetMinutes(timezone) ?? namedTimezoneOffset(timezone, wallClock);
  if (offset === null || ![year, month, day, hour, minute].every(Number.isFinite)) throw new Error("Invalid Vedic birth date, time, or timezone.");
  return { date: new Date(wallClock.getTime() - offset * 60_000), latitude: latitude as number, longitude: longitude as number };
}

// Lahiri at J2000 (23°51'11.1") advanced by the IAU general-precession rate.
export function lahiriAyanamsha(date: Date): number {
  const julianYear = 2000 + (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (DASHA_YEAR_DAYS * DAY);
  const years = julianYear - 2000;
  return 23.8530833333 + (50.290966 / 3600) * years + (0.0002225 / 3600) * years * years;
}

function tropicalLongitude(planet: Exclude<VedicGraha, "Rahu" | "Ketu">, date: Date): number {
  if (planet === "Sun") return Astronomy.SunPosition(date).elon;
  if (planet === "Moon") return Astronomy.EclipticGeoMoon(date).lon;
  return Astronomy.Ecliptic(Astronomy.GeoVector((Astronomy.Body as unknown as Record<string, Astronomy.Body>)[planet], date, true)).elon;
}

function meanNode(date: Date): number {
  const days = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / DAY;
  return mod(125.04452 - 0.0529538083 * days);
}

function ascendant(date: Date, latitude: number, longitude: number): number {
  const observer = new Astronomy.Observer(latitude, longitude, 0);
  const eastHorizon = Astronomy.VectorFromHorizon(new Astronomy.Spherical(0, 90, 1), date, "normal");
  return mod(Astronomy.SphereFromVector(Astronomy.RotateVector(Astronomy.Rotation_HOR_ECL(date, observer), eastHorizon)).lon);
}

function placement(planet: VedicGraha, longitude: number, lagnaIndex: number, retrograde = false): VedicPlacement {
  const index = signIndex(longitude);
  return { planet, sign: SIGNS[index], longitude: Number(mod(longitude).toFixed(6)), degree: degree(longitude), house: mod(index - lagnaIndex, 12) + 1, retrograde };
}

function motionRetrograde(planet: Exclude<VedicGraha, "Rahu" | "Ketu">, date: Date): boolean {
  if (planet === "Sun" || planet === "Moon") return false;
  return mod(tropicalLongitude(planet, addDays(date, 0.05)) - tropicalLongitude(planet, addDays(date, -0.05)) + 180) - 180 < 0;
}

function karakas(planets: Record<VedicGraha, VedicPlacement>): { atmakaraka: VedicKaraka; darakaraka: VedicKaraka } {
  const eligible = (["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const)
    .map((planet) => planets[planet]).sort((a, b) => b.degree - a.degree);
  const map = (p: VedicPlacement): VedicKaraka => ({ planet: p.planet as VedicKaraka["planet"], sign: p.sign, house: p.house });
  return { atmakaraka: map(eligible[0]), darakaraka: map(eligible[eligible.length - 1]) };
}

function dashas(birth: Date, moonLongitude: number, asOf: Date) {
  const span = 360 / 27;
  const nakshatraIndex = Math.floor(mod(moonLongitude) / span);
  const firstPlanet = DASHA_ORDER[nakshatraIndex % 9];
  const elapsedFraction = (mod(moonLongitude) % span) / span;
  let start = addDays(birth, -DASHA_YEARS[firstPlanet] * DASHA_YEAR_DAYS * elapsedFraction);
  let mahadasha!: VedicDashaPeriod;
  let antardasha!: VedicDashaPeriod;
  for (let i = 0; i < 30; i++) {
    const lord = DASHA_ORDER[(DASHA_ORDER.indexOf(firstPlanet) + i) % 9];
    const end = addDays(start, DASHA_YEARS[lord] * DASHA_YEAR_DAYS);
    if (asOf >= start && asOf < end) {
      mahadasha = { planet: lord, startDate: iso(start), endDate: iso(end) };
      let subStart = start;
      for (let j = 0; j < 9; j++) {
        const subLord = DASHA_ORDER[(DASHA_ORDER.indexOf(lord) + j) % 9];
        const subEnd = addDays(subStart, DASHA_YEARS[lord] * DASHA_YEARS[subLord] / 120 * DASHA_YEAR_DAYS);
        if (asOf >= subStart && asOf < subEnd) antardasha = { planet: subLord, startDate: iso(subStart), endDate: iso(subEnd) };
        subStart = subEnd;
      }
      break;
    }
    start = end;
  }
  if (!mahadasha || !antardasha) throw new Error("Unable to resolve Vimshottari dasha.");
  return { mahadasha, antardasha };
}

const OWN: Record<VedicGraha, string[]> = { Sun: ["Leo"], Moon: ["Cancer"], Mars: ["Aries", "Scorpio"], Mercury: ["Gemini", "Virgo"], Jupiter: ["Sagittarius", "Pisces"], Venus: ["Taurus", "Libra"], Saturn: ["Capricorn", "Aquarius"], Rahu: [], Ketu: [] };
const EXALT: Partial<Record<VedicGraha, string>> = { Sun: "Aries", Moon: "Taurus", Mars: "Capricorn", Mercury: "Virgo", Jupiter: "Cancer", Venus: "Pisces", Saturn: "Libra" };
const DEBIL: Partial<Record<VedicGraha, string>> = { Sun: "Libra", Moon: "Scorpio", Mars: "Cancer", Mercury: "Pisces", Jupiter: "Capricorn", Venus: "Virgo", Saturn: "Aries" };

function strengths(planets: Record<VedicGraha, VedicPlacement>): PlanetaryStrength[] {
  return Object.values(planets).map((p) => {
    let score = 0;
    const reasons: string[] = [];
    if (EXALT[p.planet] === p.sign) { score += 3; reasons.push("exalted"); }
    if (OWN[p.planet]?.includes(p.sign)) { score += 2; reasons.push("own sign"); }
    if ([1, 4, 7, 10].includes(p.house)) { score += 1; reasons.push("angular house"); }
    if ([5, 9].includes(p.house)) { score += 1; reasons.push("trinal house"); }
    if (DEBIL[p.planet] === p.sign) { score -= 3; reasons.push("debilitated"); }
    if ([6, 8, 12].includes(p.house)) { score -= 1; reasons.push("dusthana house"); }
    if (p.retrograde) reasons.push("retrograde");
    return { planet: p.planet, score, level: score >= 2 ? "Strong" : score <= -2 ? "Weak" : "Balanced", reasons: reasons.length ? reasons : ["neutral placement"] };
  });
}

function distanceHouses(a: VedicPlacement, b: VedicPlacement) { return mod(signIndex(a.longitude) - signIndex(b.longitude), 12) + 1; }
function yogas(planets: Record<VedicGraha, VedicPlacement>, lagnaIndex: number): VedicYoga[] {
  const found: VedicYoga[] = [];
  const sunMercury = Math.min(mod(planets.Sun.longitude - planets.Mercury.longitude), mod(planets.Mercury.longitude - planets.Sun.longitude));
  if (sunMercury <= 12) found.push({ name: "Budha Aditya Yoga", planets: ["Sun", "Mercury"], evidence: `Sun and Mercury are conjunct within ${sunMercury.toFixed(2)}°.` });
  const moonJupiter = distanceHouses(planets.Jupiter, planets.Moon);
  if ([1, 4, 7, 10].includes(moonJupiter)) found.push({ name: "Gaja Kesari Yoga", planets: ["Moon", "Jupiter"], evidence: `Jupiter is ${moonJupiter === 1 ? "conjunct" : `${moonJupiter}th`} from the Moon.` });
  const lords = (houses: number[]) => houses.map((house) => SIGN_LORDS[mod(lagnaIndex + house - 1, 12)]);
  const kendraLords = lords([1, 4, 7, 10]);
  const trikonaLords = lords([1, 5, 9]);
  for (const k of kendraLords) for (const t of trikonaLords) {
    if (k !== t && planets[k].sign === planets[t].sign && !found.some((y) => y.name === "Raja Yoga")) found.push({ name: "Raja Yoga", planets: [k, t], evidence: `${k} and ${t}, lords of angular/trinal houses, conjoin in ${planets[k].sign}.` });
  }
  const wealthLords = lords([2, 5, 9, 11]);
  for (let i = 0; i < wealthLords.length; i++) for (let j = i + 1; j < wealthLords.length; j++) {
    const a = wealthLords[i], b = wealthLords[j];
    if (a !== b && planets[a].sign === planets[b].sign && !found.some((y) => y.name === "Dhana Yoga")) found.push({ name: "Dhana Yoga", planets: [a, b], evidence: `${a} and ${b}, wealth-house lords, conjoin in ${planets[a].sign}.` });
  }
  return found;
}

function purushartha(planets: Record<VedicGraha, VedicPlacement>) {
  const groups = { dharma: [1, 5, 9], artha: [2, 6, 10], kama: [3, 7, 11], moksha: [4, 8, 12] };
  const scored = Object.entries(groups).map(([name, houses]) => {
    const occupants = Object.values(planets).filter((p) => houses.includes(p.house));
    return { name, score: occupants.reduce((sum, p) => sum + (["Sun", "Moon", "Jupiter"].includes(p.planet) ? 2 : 1), 0), dominantSigns: [...new Set(occupants.map((p) => p.sign))] };
  }).sort((a, b) => b.score - a.score);
  const result = {} as Record<string, PurusharthaFocus>;
  scored.forEach((item, index) => { result[item.name] = { rank: index + 1, score: item.score, dominantSigns: item.dominantSigns }; });
  return result;
}

const LAGNA_TEXT: Record<string, [string, string]> = {
  Aries: ["berani memulai dan bergerak langsung", "mengelola dorongan agar tidak tergesa"], Taurus: ["stabil, sabar, dan membangun secara nyata", "tetap lentur saat keadaan berubah"],
  Gemini: ["adaptif, komunikatif, dan cepat belajar", "menjaga fokus agar energi tidak tercerai"], Cancer: ["peka, protektif, dan berorientasi rasa aman", "membedakan intuisi dari kekhawatiran"],
  Leo: ["hangat, kreatif, dan siap memimpin", "memimpin tanpa bergantung pada pengakuan"], Virgo: ["teliti, berguna, dan berorientasi perbaikan", "mengurangi kritik berlebih pada diri"],
  Libra: ["diplomatis, adil, dan relasional", "berani memilih tanpa menunggu persetujuan"], Scorpio: ["intens, strategis, dan transformatif", "membangun kepercayaan tanpa mengontrol"],
  Sagittarius: ["visioner, jujur, dan mencari makna", "membumikan visi menjadi langkah konsisten"], Capricorn: ["disiplin, realistis, dan tahan uji", "memberi ruang pada kelembutan dan jeda"],
  Aquarius: ["independen, sistemik, dan berpihak pada masa depan", "tetap hadir secara emosional"], Pisces: ["imajinatif, welas asih, dan intuitif", "menjaga batas agar tidak menyerap semuanya"],
};

const validBirthTime = (value?: string | null): value is string => {
  const match = /^(\d{2}):(\d{2})$/.exec(value || "");
  return Boolean(match && Number(match[1]) <= 23 && Number(match[2]) <= 59);
};

function partialBirthTimeResult(input: VedicCalculationInput): VedicPartialBlueprint {
  const asOf = input.asOf instanceof Date ? input.asOf : input.asOf ? new Date(input.asOf) : new Date();
  return {
    status: "PARTIAL_BIRTH_TIME_REQUIRED",
    availableSections: [],
    unavailableSections: ["Lagna", "houses", "exact time-dependent chart", "time-sensitive interpretations"],
    message: "Waktu lahir diperlukan untuk menghitung Lagna, rumah astrologi, dan bagian Vedic yang bergantung pada posisi langit secara tepat.",
    meta: { schemaVersion: "1.0.0", engineVersion: "vedic-engine-1.0.0", calculationSource: "input-safety-guard", accuracy: "partial", calculatedAt: new Date().toISOString(), asOf: asOf.toISOString() },
  };
}

export function calculateVedic(input: VedicCalculationInput): VedicBlueprint {
  if (!validBirthTime(input.birthTime)) return partialBirthTimeResult(input) as unknown as VedicBlueprint;
  const { date, latitude, longitude } = resolveInput(input);
  const asOf = input.asOf instanceof Date ? input.asOf : input.asOf ? new Date(input.asOf) : new Date();
  const ayanamsha = lahiriAyanamsha(date);
  const lagnaLongitude = mod(ascendant(date, latitude, longitude) - ayanamsha);
  const lagnaIndex = signIndex(lagnaLongitude);
  const planets = {} as Record<VedicGraha, VedicPlacement>;
  for (const planet of ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const) {
    planets[planet] = placement(planet, tropicalLongitude(planet, date) - ayanamsha, lagnaIndex, motionRetrograde(planet, date));
  }
  planets.Rahu = placement("Rahu", meanNode(date) - ayanamsha, lagnaIndex, true);
  planets.Ketu = placement("Ketu", planets.Rahu.longitude + 180, lagnaIndex, true);
  const moonSpan = 360 / 27;
  const nakshatraIndex = Math.floor(planets.Moon.longitude / moonSpan);
  const pada = Math.floor((planets.Moon.longitude % moonSpan) / (moonSpan / 4)) + 1;
  const { atmakaraka, darakaraka } = karakas(planets);
  const dasha = dashas(date, planets.Moon.longitude, asOf);
  const focus = purushartha(planets);
  const [lagnaStrength, lagnaChallenge] = LAGNA_TEXT[sign(lagnaLongitude)];
  const dominant = Object.entries(focus).sort((a, b) => a[1].rank - b[1].rank)[0][0];
  const relationshipStyle = `${darakaraka.planet} sebagai Darakaraka menekankan relasi sebagai ruang belajar melalui kualitas ${darakaraka.sign}; kedekatan tumbuh ketika kebutuhan emosional Moon di ${planets.Moon.sign} dihormati.`;
  const careerStyle = `Pola kerja bergerak melalui Lagna ${sign(lagnaLongitude)} dan penekanan ${dominant}: paling produktif saat ${lagnaStrength}, dengan ritme keputusan yang konsisten.`;
  const spiritualStyle = `${atmakaraka.planet} sebagai Atmakaraka di ${atmakaraka.sign} mengarahkan pertumbuhan batin melalui disiplin kualitas tanda tersebut; Nakshatra ${NAKSHATRAS[nakshatraIndex]} pada pada ${pada} memberi corak praktik yang personal.`;
  return {
    lagna: { sign: sign(lagnaLongitude), longitude: Number(lagnaLongitude.toFixed(6)), degree: degree(lagnaLongitude), house: 1 },
    moonSign: { sign: planets.Moon.sign, longitude: planets.Moon.longitude, degree: planets.Moon.degree, house: planets.Moon.house },
    sunSign: { sign: planets.Sun.sign, longitude: planets.Sun.longitude, degree: planets.Sun.degree, house: planets.Sun.house },
    nakshatra: NAKSHATRAS[nakshatraIndex], pada, atmakaraka, darakaraka,
    currentMahadasha: dasha.mahadasha, currentAntardasha: dasha.antardasha,
    planetaryStrength: strengths(planets), majorYogas: yogas(planets, lagnaIndex),
    dharmaFocus: focus.dharma, arthaFocus: focus.artha, kamaFocus: focus.kama, mokshaFocus: focus.moksha,
    strengths: [`Lagna ${sign(lagnaLongitude)} mendukung kemampuan untuk ${lagnaStrength}.`, `${atmakaraka.planet} sebagai Atmakaraka memberi daya tumbuh melalui tema ${atmakaraka.sign}.`, `Fokus ${dominant} membantu memusatkan energi hidup pada tujuan yang paling alami.`],
    challenges: [`Pelajaran utama Lagna adalah ${lagnaChallenge}.`, `Moon di ${planets.Moon.sign} perlu ritme emosional yang stabil agar respons tidak menjadi reaktif.`, `Mahadasha ${dasha.mahadasha.planet} meminta kualitas planet tersebut dijalankan secara sadar, bukan otomatis.`],
    relationshipStyle, careerStyle, spiritualStyle,
    summary: [
      `Lagna ${sign(lagnaLongitude)} menggambarkan cara utama memasuki kehidupan: ${lagnaStrength}. Moon berada di ${planets.Moon.sign}, sehingga kebutuhan batin diproses melalui kualitas tanda tersebut.`,
      `Moon menempati Nakshatra ${NAKSHATRAS[nakshatraIndex]} pada pada ${pada}. Kombinasi ini memberi pola naluriah yang lebih spesifik daripada Moon Sign saja dan menjadi titik awal Vimshottari Dasha.`,
      `${atmakaraka.planet} adalah Atmakaraka di ${atmakaraka.sign}, menunjukkan tema perkembangan jiwa yang berulang. Saat ini Mahadasha ${dasha.mahadasha.planet} dan Antardasha ${dasha.antardasha.planet} memberi konteks waktu bagi tema tersebut.`,
      `Dari empat Purushartha, ${dominant} menempati peringkat pertama. Arah terbaik adalah memakai kekuatan Lagna sambil ${lagnaChallenge}, sehingga tujuan material, relasional, dan spiritual dapat berkembang seimbang.`,
    ],
    planets,
    meta: { schemaVersion: "1.0.0", engineVersion: "vedic-engine-1.0.0", calculationSource: "astronomy-engine", accuracy: "ephemeris", calculatedAt: new Date().toISOString(), asOf: asOf.toISOString(), standards: { zodiac: "sidereal", ayanamsha: "Lahiri/Chitrapaksha", houses: "whole-sign", nodes: "mean", dasha: "Vimshottari", dashaYearDays: DASHA_YEAR_DAYS } },
  };
}
