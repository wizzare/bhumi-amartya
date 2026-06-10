import * as Astronomy from "astronomy-engine";

export type SkyBody = "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto" | "North Node" | "Chiron" | "Lilith";

export type BodyStatus = {
  body: SkyBody;
  sign: string;
  longitude: number;
  isRetrograde: boolean;
  periodStart?: string;
  periodEnd?: string;
};

export type MoonPhaseEvent = {
  phase: string;
  date: string;
  daysDiff: number;
};

export type CurrentMoonInfo = {
  label: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  theme: string;
  nextPhaseLabel: string;
};

export type CurrentSky = {
  date: string;
  sunSign: string;
  moonInfo: CurrentMoonInfo;
  moonPhaseAngle: number;
  bodies: BodyStatus[];
  source: "astronomy-engine";
  debug?: AstroDebugState;
};

export type AstroDebugState = {
  astronomyDefined: boolean;
  bodyType: string;
  bodySunDefined: boolean;
  eclipticLongitudeType: string;
  moonPhaseType: string;
  eclipticLongitudeSunWorks: boolean;
  eclipticLongitudeSunError: string | null;
  moonPhaseWorks: boolean;
  moonPhaseError: string | null;
};

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

function getSign(longitude: number): string {
  const normalized = ((longitude % 360) + 360) % 360;
  return ZODIAC_SIGNS[Math.floor(normalized / 30)];
}

export function getMoonPhaseLabel(phaseAngle: number): string {
  const normalized = ((phaseAngle % 360) + 360) % 360;

  if (normalized < 7.5 || normalized >= 352.5) return "New Moon";
  if (normalized < 82.5) return "Waxing Crescent";
  if (normalized < 97.5) return "First Quarter";
  if (normalized < 172.5) return "Waxing Gibbous";
  if (normalized < 187.5) return "Full Moon";
  if (normalized < 262.5) return "Waning Gibbous";
  if (normalized < 277.5) return "Last Quarter";
  return "Waning Crescent";
}

function formatDateIndo(date: Date): string {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Optimized boundary search for planet transits using exponential jump and binary refinement.
 * Reduces iterations from thousands to ~20.
 */
function findSignBoundary(body: any, bodyName: string, targetSign: number, startDate: Date, direction: number): string | undefined {
  const Ast: any = Astronomy;
  const startMs = startDate.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  // Outer planets search limit 10 years, inner 60 days
  const limitDays = (bodyName === "Pluto" || bodyName === "Neptune" || bodyName === "Uranus" || bodyName === "Saturn" || bodyName === "Jupiter") ? 4000 : 60;

  let low = 0;
  let high = 1;
  let foundRange = false;

  // 1. Exponential Jump
  while (high <= limitDays) {
    const testDate = new Date(startMs + direction * high * dayMs);
    const lon = bodyName === "Sun"
      ? Ast.SunPosition(testDate).elon
      : Ast.EclipticLongitude(body, testDate);
    const sign = Math.floor((((lon % 360) + 360) % 360) / 30);

    if (sign !== targetSign) {
      foundRange = true;
      break;
    }
    low = high;
    high *= 2;
  }

  if (!foundRange) return undefined;
  if (high > limitDays) high = limitDays;

  // 2. Binary Refinement
  let bestDate = new Date(startMs + direction * high * dayMs);
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const testDate = new Date(startMs + direction * mid * dayMs);
    const lon = bodyName === "Sun"
      ? Ast.Ecliptic(Ast.GeoVector(Ast.Body.Sun, testDate, true)).elon
      : Ast.EclipticLongitude(body, testDate);
    const sign = Math.floor((((lon % 360) + 360) % 360) / 30);

    if (sign !== targetSign) {
      bestDate = testDate;
      high = mid - 1; // Look for closer boundary
    } else {
      low = mid + 1;
    }
  }

  return formatDateIndo(bestDate);
}

function findRetrogradeBoundary(body: any, bodyName: string, startDate: Date, direction: number): string | undefined {
  const Ast: any = Astronomy;
  const startMs = startDate.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  // Retrograde periods are usually weeks or months. Limit 1 year.
  const limitDays = 365;

  let low = 0;
  let high = 1;
  let foundRange = false;

  const getVelocity = (d: Date) => {
    const d0 = new Date(d.getTime() - 6 * 60 * 60 * 1000); // 6 hour window
    const d1 = new Date(d.getTime() + 6 * 60 * 60 * 1000);

    let l0, l1;
    if (bodyName === "Sun") return 1;
    if (bodyName === "Moon") return 1;

    l0 = Ast.EclipticLongitude(body, d0);
    l1 = Ast.EclipticLongitude(body, d1);

    let diff = l1 - l0;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
  };

  const startVelocity = getVelocity(startDate);
  const startIsRetro = startVelocity < 0;

  // 1. Exponential Jump
  while (high <= limitDays) {
    const testDate = new Date(startMs + direction * high * dayMs);
    const v = getVelocity(testDate);
    const isRetro = v < 0;

    if (isRetro !== startIsRetro) {
      foundRange = true;
      break;
    }
    low = high;
    high *= 2;
  }

  if (!foundRange) return undefined;
  if (high > limitDays) high = limitDays;

  // 2. Binary Refinement
  let bestDate = new Date(startMs + direction * high * dayMs);
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const testDate = new Date(startMs + direction * mid * dayMs);
    const v = getVelocity(testDate);
    const isRetro = v < 0;

    if (isRetro !== startIsRetro) {
      bestDate = testDate;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return formatDateIndo(bestDate);
}

export function getMoonPhaseTheme(label: string): string {
  if (label.includes("New Moon")) return "Awal baru, menetapkan niat, dan benih pertumbuhan.";
  if (label.includes("Waxing")) return "Pembangunan, aksi, dan pengumpulan energi.";
  if (label.includes("Full Moon")) return "Puncak, kejelasan, perayaan, dan pelepasan.";
  if (label.includes("Waning")) return "Pelepasan, evaluasi, pembersihan, dan penyelesaian.";
  if (label.includes("Quarter")) return "Penyesuaian, hambatan, dan pengambilan keputusan.";
  return "Refleksi dan keselarasan batin.";
}

export function calculateCurrentSky(date: Date = new Date()): CurrentSky {
  console.log("ASTRO_START_V2", date.toISOString());

  const Ast: any = Astronomy;
  const BodyObj = Ast.Body;

  try {
    if (!Ast.EclipticLongitude || !Ast.MoonPhase || !BodyObj) {
        throw new Error("Critical astronomy functions missing.");
    }

    // --- PHASE 1: Moon (Granular Range) ---
    const moonPhaseAngle = Ast.MoonPhase(date);
    const moonPhaseLabel = getMoonPhaseLabel(moonPhaseAngle);

    // Find boundaries of the current general phase segment (0, 90, 180, 270)
    // This allows us to show a range like "Waning Crescent: [Last Quarter Date] - [New Moon Date]"
    const majorPhases = [0, 90, 180, 270];
    const currentSegmentIndex = Math.floor(moonPhaseAngle / 90);
    const startAngle = majorPhases[currentSegmentIndex];
    const endAngle = majorPhases[(currentSegmentIndex + 1) % 4];

    const prevMajor = Ast.SearchMoonPhase(startAngle, date, -45);
    const nextMajor = Ast.SearchMoonPhase(endAngle, date, 45);

    const startDate = formatDateIndo(prevMajor.date);
    const endDate = formatDateIndo(nextMajor.date);
    const daysRemaining = Math.max(0, Math.round((nextMajor.date.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)));

    const nextPhaseLabel = endAngle === 0 ? "Bulan Baru" : endAngle === 90 ? "First Quarter" : endAngle === 180 ? "Bulan Purnama" : "Last Quarter";

    const moonInfo: CurrentMoonInfo = {
      label: moonPhaseLabel,
      startDate,
      endDate,
      daysRemaining,
      theme: getMoonPhaseTheme(moonPhaseLabel),
      nextPhaseLabel
    };

    const bodyNames: SkyBody[] = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "North Node", "Chiron", "Lilith"];
    const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);

    const results: BodyStatus[] = bodyNames.map(name => {
      try {
        let lon1: number;
        let lon0: number;

        if (name === "Sun") {
          lon1 = Ast.SunPosition(date).elon;
          lon0 = Ast.SunPosition(yesterday).elon;
        } else if (name === "Moon") {
          lon1 = Ast.EclipticGeoMoon(date).lon;
          lon0 = Ast.EclipticGeoMoon(yesterday).lon;
        } else if (name === "North Node") {
          // North Node (Moon's Ascending Node)
          const node = Ast.SearchMoonNode(date);
          const nextNode = Ast.NextMoonNode(node);
          // Longitude of the node is related to the moon's position at the node time
          lon1 = Ast.EclipticGeoMoon(node.time.date).lon;
          lon0 = Ast.EclipticGeoMoon(Ast.SearchMoonNode(yesterday).time.date).lon;
        } else if (name === "Chiron") {
          // Simplified Mean Chiron Longitude (Rough Approximation)
          const j2000 = new Date("2000-01-01T12:00:00Z");
          const days1 = (date.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24);
          const days0 = (yesterday.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24);
          lon1 = (251.35 + days1 * 0.019777) % 360;
          lon0 = (251.35 + days0 * 0.019777) % 360;
        } else if (name === "Lilith") {
          // Mean Black Moon Lilith (Lunar Apogee)
          const apsis1 = Ast.SearchLunarApsis(date);
          const apsis0 = Ast.SearchLunarApsis(yesterday);
          lon1 = Ast.EclipticGeoMoon(apsis1.time.date).lon;
          lon0 = Ast.EclipticGeoMoon(apsis0.time.date).lon;
        } else {
          const body = BodyObj[name];
          lon1 = Ast.EclipticLongitude(body, date);
          lon0 = Ast.EclipticLongitude(body, yesterday);
        }

        let diff = lon1 - lon0;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        const currentSignIndex = Math.floor((((lon1 % 360) + 360) % 360) / 30);
        let periodStart: string | undefined;
        let periodEnd: string | undefined;
        const isRetrograde = diff < 0 && !["Sun", "Moon", "North Node", "Lilith"].includes(name);

        if (!["Moon", "North Node", "Chiron", "Lilith"].includes(name)) {
          if (isRetrograde) {
            const body = BodyObj[name];
            periodStart = findRetrogradeBoundary(body, name, date, -1);
            periodEnd = findRetrogradeBoundary(body, name, date, 1);
          } else {
            const body = BodyObj[name];
            periodStart = findSignBoundary(body, name, currentSignIndex, date, -1);
            periodEnd = findSignBoundary(body, name, currentSignIndex, date, 1);
          }
        }

        return {
          body: name,
          sign: getSign(lon1),
          longitude: lon1,
          isRetrograde,
          periodStart,
          periodEnd
        };
      } catch (err) {
        console.error(`Planet calculation error [${name}]:`, err);
        return {
          body: name,
          sign: "Unknown",
          longitude: 0,
          isRetrograde: false,
          periodStart: "Periode sedang dihitung",
          periodEnd: "..."
        };
      }
    });

    const sunStatus = results.find(r => r.body === "Sun");

    const output: CurrentSky = {
      date: date.toISOString().slice(0, 10),
      sunSign: sunStatus?.sign || "Unknown",
      moonInfo,
      moonPhaseAngle,
      bodies: results,
      source: "astronomy-engine"
    };

    console.log("ASTRO_SUCCESS", output.date);
    return output;

  } catch (error: any) {
    console.error("ASTRO_FATAL_ERROR", error);
    throw error;
  }
}
