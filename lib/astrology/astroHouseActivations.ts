import type { CurrentSky } from "@/lib/astrology/calculateCurrentSky";

const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

const LIFE_AREAS: Record<number, { label: string; keywords: string[] }> = {
  1: { label: "Identitas Diri", keywords: ["citra diri", "penampilan", "awal baru", "vitalitas"] },
  2: { label: "Keuangan & Nilai", keywords: ["pendapatan", "aset", "rasa harga diri", "keamanan materi"] },
  3: { label: "Komunikasi & Pikiran", keywords: ["percakapan harian", "belajar", "saudara", "lingkungan terdekat"] },
  4: { label: "Rumah & Akar", keywords: ["keluarga", "kenyamanan emosional", "privasi", "pondasi batin"] },
  5: { label: "Kreativitas & Kesenangan", keywords: ["ekspresi diri", "romansa", "hobi", "anak-anak", "spekulasi"] },
  6: { label: "Kesehatan & Rutinitas", keywords: ["kebiasaan harian", "pekerjaan teknis", "pelayanan", "kesejahteraan fisik"] },
  7: { label: "Relasi & Kemitraan", keywords: ["pernikahan", "kerjasama bisnis", "interaksi satu-lawan-satu", "keseimbangan"] },
  8: { label: "Transformasi & Kedalaman", keywords: ["intimidasi batin", "sumber daya bersama", "krisis", "penyembuhan dalam"] },
  9: { label: "Makna & Perluasan", keywords: ["filosofi", "perjalanan jauh", "pendidikan tinggi", "pandangan luas"] },
  10: { label: "Karier & Reputasi", keywords: ["tujuan hidup", "pencapaian publik", "tanggung jawab", "otoritas"] },
  11: { label: "Komunitas & Harapan", keywords: ["persahabatan", "jejaring", "visi masa depan", "dukungan sosial"] },
  12: { label: "Hening & Penyelesaian", keywords: ["istirahat", "alam bawah sadar", "melepaskan", "isolasi sehat"] },
};

const PLANET_ENERGIES: Record<string, string> = {
  Sun: "kesadaran dan energi utama",
  Moon: "kebutuhan emosional dan kenyamanan",
  Mercury: "komunikasi, logika, dan koordinasi",
  Venus: "harmoni, nilai, dan daya tarik",
  Mars: "dorongan aksi, energi, dan keberanian",
  Jupiter: "perluasan, keberuntungan, dan pemahaman",
  Saturn: "batasan, tanggung jawab, dan kedewasaan",
  Uranus: "perubahan mendadak dan kebebasan",
  Neptune: "intuisi, mimpi, dan pelarutan batas",
  Pluto: "transformasi mendalam dan daya batin",
};

const TRANSIT_SEVERITY: Record<string, "low" | "medium" | "high"> = {
  Sun: "medium",
  Moon: "low",
  Mercury: "medium",
  Venus: "medium",
  Mars: "high",
  Jupiter: "medium",
  Saturn: "high",
  Uranus: "high",
  Neptune: "medium",
  Pluto: "high",
};

export type AstroHouseActivation = {
  planet: string;
  sign: string;
  degree: number;
  house: number;
  isRetrograde: boolean;
  severity: "low" | "medium" | "high";
  lifeArea: string;
  keywords: string[];
  meaningForPrompt: string;
  sourceType: "natal_house_cusp" | "whole_sign_fallback";
};

export type HouseDataSummary = {
  hasNatalChart: boolean;
  hasHouses: boolean;
  houseCount: number;
  ascendant: string | null;
  midheaven: string | null;
  houseSystem: string | null;
  sourceType: "natal_house_cusp" | "whole_sign_fallback" | "missing";
  houses: Array<{
    house: number;
    sign: string;
    degree: number | null;
  }>;
};

function normalizeSign(sign: unknown): string | null {
  if (typeof sign !== "string") return null;
  const match = ZODIAC_SIGNS.find((item) => item.toLowerCase() === sign.trim().toLowerCase());
  return match ?? null;
}

function signIndex(sign: string): number {
  return ZODIAC_SIGNS.indexOf(sign);
}

function normalizeLongitude(longitude: number): number {
  return ((longitude % 360) + 360) % 360;
}

function signDegreeToLongitude(sign: string, degree: number): number {
  return signIndex(sign) * 30 + degree;
}

function getHouseNumber(key: string, value: unknown): number | null {
  if (typeof value === "object" && value && "house" in value) {
    const house = Number((value as { house?: unknown }).house);
    if (Number.isInteger(house) && house >= 1 && house <= 12) return house;
  }
  const match = key.match(/\d+/);
  if (!match) return null;
  const house = Number(match[0]);
  return Number.isInteger(house) && house >= 1 && house <= 12 ? house : null;
}

function readHouses(natalHouses: unknown): HouseDataSummary["houses"] {
  if (!natalHouses) return [];
  const entries = Array.isArray(natalHouses)
    ? natalHouses.map((value, index) => [String(index + 1), value] as const)
    : Object.entries(natalHouses as Record<string, unknown>);

  return entries
    .map(([key, value]) => {
      const house = getHouseNumber(key, value);
      if (!house || typeof value !== "object" || !value) return null;
      const sign = normalizeSign((value as { sign?: unknown }).sign);
      if (!sign) return null;
      const degreeValue = Number((value as { degree?: unknown; cuspDegree?: unknown }).degree ?? (value as { cuspDegree?: unknown }).cuspDegree);
      return {
        house,
        sign,
        degree: Number.isFinite(degreeValue) ? degreeValue : null,
      };
    })
    .filter((value): value is HouseDataSummary["houses"][number] => Boolean(value))
    .sort((a, b) => a.house - b.house);
}

function buildWholeSignHouses(ascendant: string): HouseDataSummary["houses"] {
  const start = signIndex(ascendant);
  return Array.from({ length: 12 }, (_, index) => ({
    house: index + 1,
    sign: ZODIAC_SIGNS[(start + index) % 12],
    degree: 0,
  }));
}

function determineHouseFromCusps(longitude: number, houses: HouseDataSummary["houses"]): number | null {
  const cusps = houses
    .filter((house) => typeof house.degree === "number")
    .map((house) => ({
      house: house.house,
      longitude: signDegreeToLongitude(house.sign, house.degree ?? 0),
    }))
    .sort((a, b) => a.longitude - b.longitude);

  if (cusps.length < 12) return null;
  const normalized = normalizeLongitude(longitude);
  for (let index = 0; index < cusps.length; index += 1) {
    const current = cusps[index];
    const next = cusps[(index + 1) % cusps.length];
    if (current.longitude <= next.longitude) {
      if (normalized >= current.longitude && normalized < next.longitude) return current.house;
    } else if (normalized >= current.longitude || normalized < next.longitude) {
      return current.house;
    }
  }
  return null;
}

function determineWholeSignHouse(sign: string, houses: HouseDataSummary["houses"]): number | null {
  return houses.find((house) => house.sign === sign)?.house ?? null;
}

function meaningFor(planet: string, lifeArea: string, isRetrograde: boolean): string {
  const energy = PLANET_ENERGIES[planet] || "pengaruh energi";
  const retroText = isRetrograde ? " (bergerak mundur/evaluasi)" : "";
  return `${planet} yang membawa tema ${energy}${retroText} sedang mengaktifkan area ${lifeArea} kamu.`;
}

export function buildAstroHouseActivations(input: {
  uid?: string;
  currentSky: CurrentSky | Record<string, unknown> | null | undefined;
  natalChart: Record<string, unknown> | null | undefined;
  natalHouses: unknown;
}): { houseData: HouseDataSummary; activations: AstroHouseActivation[] } {
  const natalChart = input.natalChart ?? null;
  const directHouses = readHouses(input.natalHouses);
  const ascendant =
    normalizeSign(natalChart?.risingSign)
    ?? normalizeSign(natalChart?.ascendant)
    ?? normalizeSign((natalChart as { ascendantSign?: unknown } | null)?.ascendantSign);
  const midheaven = normalizeSign((natalChart as { midheaven?: unknown } | null)?.midheaven);
  const hasNatalChart = Boolean(natalChart);
  const hasHouses = directHouses.length > 0;
  const canUseCusps = directHouses.length >= 12 && directHouses.every((house) => typeof house.degree === "number");
  const sourceType = canUseCusps ? "natal_house_cusp" : ascendant ? "whole_sign_fallback" : "missing";
  const houses = canUseCusps ? directHouses : ascendant ? buildWholeSignHouses(ascendant) : directHouses;

  const houseData: HouseDataSummary = {
    hasNatalChart,
    hasHouses,
    houseCount: houses.length,
    ascendant,
    midheaven,
    houseSystem: canUseCusps ? "natal_cusps" : ascendant ? "whole_sign" : null,
    sourceType,
    houses,
  };

  console.log("[NATAL HOUSE DATA]", {
    uid: input.uid ?? null,
    hasNatalChart: houseData.hasNatalChart,
    hasHouses: houseData.hasHouses,
    houseCount: houseData.houseCount,
    risingSign: normalizeSign(natalChart?.risingSign),
    ascendant: houseData.ascendant,
    houseSystem: houseData.houseSystem,
    sourceType: houseData.sourceType,
    houseDataPreview: houseData.houses.slice(0, 3),
  });

  const bodies = Array.isArray((input.currentSky as { bodies?: unknown })?.bodies)
    ? (input.currentSky as { bodies: Array<Record<string, unknown>> }).bodies
    : [];

  const activations = bodies
    .map((body): AstroHouseActivation | null => {
      const planet = typeof body.body === "string" ? body.body : null;
      const sign = normalizeSign(body.sign);
      const longitude = Number(body.longitude);
      const isRetrograde = Boolean(body.isRetrograde);

      if (!planet || !sign || !Number.isFinite(longitude) || sourceType === "missing") return null;

      const house = sourceType === "natal_house_cusp"
        ? determineHouseFromCusps(longitude, houses)
        : determineWholeSignHouse(sign, houses);

      if (!house) return null;

      const areaInfo = LIFE_AREAS[house];
      const lifeArea = areaInfo.label;

      return {
        planet,
        sign,
        degree: Number((normalizeLongitude(longitude) % 30).toFixed(2)),
        house,
        isRetrograde,
        severity: TRANSIT_SEVERITY[planet] || "medium",
        lifeArea,
        keywords: areaInfo.keywords,
        meaningForPrompt: meaningFor(planet, lifeArea, isRetrograde),
        sourceType,
      };
    })
    .filter((value): value is AstroHouseActivation => Boolean(value));

  activations.forEach((activation) => {
    console.log("[ASTRO HOUSE ACTIVATION] " + activation.planet + ": " + JSON.stringify({
      sign: activation.sign,
      degree: activation.degree,
      house: activation.house,
      lifeArea: activation.lifeArea,
      isRetrograde: activation.isRetrograde,
      severity: activation.severity,
      sourceType: activation.sourceType,
    }));
  });

  return { houseData, activations };
}
