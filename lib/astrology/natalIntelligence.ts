/**
 * BHUMI AMARTYA - Natal Intelligence Engine
 * Maximizes the use of astrological data for deep identity synthesis.
 */

import { Blueprint, PlanetaryPosition } from "@/lib/types/blueprint";
import { ASTRO_PLANET_MEANINGS, ASTRO_SIGN_MEANINGS, ASTRO_HOUSE_MEANINGS, ASTRO_ASPECT_MEANINGS } from "@/lib/data/astrologyDictionaries";

export interface NatalIntelligence {
  dominantPlanet: string;
  dominantHouse: number;
  dominantSign?: string;
  dominantElement?: string;
  dominantModality?: string;
  elementBalance: Record<string, number>; // Fire, Earth, Air, Water
  modalityBalance: Record<string, number>; // Cardinal, Fixed, Mutable
  polarityBalance?: Record<string, number>;
  houseAxisFocus: string[];
  careerDNA: string;
  relationshipDNA: string;
  leadershipDNA: string;
  spiritualDNA: string;
  shadowDNA: string;
}

const ZODIAC_METADATA: Record<string, { element: string; modality: string }> = {
  Aries: { element: "Fire", modality: "Cardinal" },
  Taurus: { element: "Earth", modality: "Fixed" },
  Gemini: { element: "Air", modality: "Mutable" },
  Cancer: { element: "Water", modality: "Cardinal" },
  Leo: { element: "Fire", modality: "Fixed" },
  Virgo: { element: "Earth", modality: "Mutable" },
  Libra: { element: "Air", modality: "Cardinal" },
  Scorpio: { element: "Water", modality: "Fixed" },
  Sagittarius: { element: "Fire", modality: "Mutable" },
  Capricorn: { element: "Earth", modality: "Cardinal" },
  Aquarius: { element: "Air", modality: "Fixed" },
  Pisces: { element: "Water", modality: "Mutable" },
};

const PLANET_WEIGHTS: Record<string, number> = {
  Sun: 3,
  Moon: 3,
  ASC: 3, // Ascendant is weighted as a planet here
  MC: 2,
  Mercury: 1,
  Venus: 1,
  Mars: 1,
  Jupiter: 1,
  Saturn: 1,
};

export const natalIntelligenceEngine = {
  calculateIntelligence(blueprint: Blueprint): NatalIntelligence {
    const astrology = blueprint.astrology || blueprint.natalChart || {};
    const planets = astrology.planets || {};
    const existingDominance = astrology.dominance || {};

    // 1. Calculate Element & Modality Balance
    const elements: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0, ...(astrology.elements || {}) };
    const modalities: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0, ...(astrology.modalities || {}) };
    const polarities: Record<string, number> = { Yang: 0, Yin: 0, ...(astrology.polarities || {}) };
    const hasPrecomputedBalances = Boolean(astrology.elements || astrology.modalities);

    const countWeight = (sign: string, weight: number) => {
      const meta = ZODIAC_METADATA[sign];
      if (meta) {
        elements[meta.element] += weight;
        modalities[meta.modality] += weight;
        polarities[["Aries", "Gemini", "Leo", "Libra", "Sagittarius", "Aquarius"].includes(sign) ? "Yang" : "Yin"] += weight;
      }
    };

    if (!hasPrecomputedBalances) {
      Object.entries(planets).forEach(([name, pos]) => {
        countWeight(pos.sign, PLANET_WEIGHTS[name] || 1);
      });
    }

    // 2. Identify Dominant Planet (Simplified by weight in signs)
    const planetScores: Record<string, number> = {};
    Object.entries(planets).forEach(([name, pos]) => {
      // Bonus if in own sign or exalted (Logic skipped for brevity, using house placement frequency)
      planetScores[name] = (planetScores[name] || 0) + (PLANET_WEIGHTS[name] || 1);
    });
    const dominantPlanet = existingDominance.dominantPlanet || Object.entries(planetScores).sort((a,b) => b[1] - a[1])[0]?.[0] || "Sun";

    // 3. Identify Dominant House
    const houseScores: Record<number, number> = {};
    Object.entries(planets).forEach(([name, pos]) => {
      const house = pos.placidusHouse || pos.house;
      if (house) houseScores[house] = (houseScores[house] || 0) + (PLANET_WEIGHTS[name] || 1);
    });
    const dominantHouse = Number(existingDominance.dominantHouse || Object.entries(houseScores).sort((a,b) => b[1] - a[1])[0]?.[0] || 1);
    const dominantSign = existingDominance.dominantSign || Object.entries(
      Object.values(planets).reduce((scores: Record<string, number>, pos) => {
        scores[pos.sign] = (scores[pos.sign] || 0) + 1;
        return scores;
      }, {}),
    ).sort((a,b) => b[1] - a[1])[0]?.[0];
    const dominantElement = existingDominance.dominantElement || Object.entries(elements).sort((a,b) => b[1] - a[1])[0]?.[0];
    const dominantModality = existingDominance.dominantModality || Object.entries(modalities).sort((a,b) => b[1] - a[1])[0]?.[0];

    // 4. House Axis Focus
    const axisFocus: string[] = [];
    if (houseScores[1] || houseScores[7]) axisFocus.push("1-7: Self & Others");
    if (houseScores[4] || houseScores[10]) axisFocus.push("4-10: Private & Public");
    if (houseScores[2] || houseScores[8]) axisFocus.push("2-8: Resources & Transformation");

    // 5. Derived DNA Logic
    let careerDNA = "Generalist";
    if (elements.Earth > 5) careerDNA = "Producer / Builder";
    else if (elements.Fire > 5) careerDNA = "Initiator / Leader";
    else if (elements.Air > 5) careerDNA = "Communicator / Strategist";
    else if (elements.Water > 5) careerDNA = "Healer / Nurturer";

    let relationshipDNA = "Balanced";
    if (houseScores[7] > 2) relationshipDNA = "Partnership-driven";
    if (astrology.risingSign === "Libra" || astrology.risingSign === "Leo") relationshipDNA = "Radiant Partner";

    return {
      dominantPlanet,
      dominantHouse,
      dominantSign,
      dominantElement,
      dominantModality,
      elementBalance: elements,
      modalityBalance: modalities,
      polarityBalance: polarities,
      houseAxisFocus: axisFocus,
      careerDNA,
      relationshipDNA,
      leadershipDNA: modalities.Cardinal > 5 ? "Pioneering" : "Steady",
      spiritualDNA: houseScores[12] || houseScores[8] || houseScores[9] ? "Mystical / Seekers" : "Practical",
      shadowDNA: `Focus on House ${dominantHouse} shadows`
    };
  }
};

export function composePlanetMeaning(planet: string, sign: string): string {
  if (!planet || !sign) return "Belum tersedia";
  const pMeaning = ASTRO_PLANET_MEANINGS[planet] || planet;
  const sMeaning = ASTRO_SIGN_MEANINGS[sign] || sign;
  return `Mewakili ${pMeaning} ${sMeaning}`;
}

export function getTopHouses(planets: Record<string, any>): { house: number; title: string; desc: string; count: number }[] {
  if (!planets) return [];
  const houseCounts: Record<number, number> = {};
  Object.values(planets).forEach(pos => {
    const h = pos.placidusHouse || pos.house;
    if (h) houseCounts[h] = (houseCounts[h] || 0) + 1;
  });
  
  const sorted = Object.entries(houseCounts).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 3).map(([houseStr, count]) => {
    const houseNum = Number(houseStr);
    const meta = ASTRO_HOUSE_MEANINGS[houseNum] || { title: `House ${houseNum}`, desc: "" };
    return { house: houseNum, title: meta.title, desc: meta.desc, count };
  });
}

function getTopAspectsLegacy(aspects: any[]): any[] {
  if (!Array.isArray(aspects)) return [];
  return aspects
    .sort((a, b) => Math.abs(a.orb) - Math.abs(b.orb))
    .slice(0, 5)
    .map(a => {
      const type = a.aspectType || a.type;
      let symbol = "☌";
      if (type === "Trine") symbol = "△";
      if (type === "Square") symbol = "□";
      if (type === "Sextile") symbol = "✶";
      if (type === "Opposition") symbol = "☍";
      
      return {
        title: `${symbol} ${a.planet1} ${type} ${a.planet2}`,
        type,
        orb: a.orb,
        meaning: ASTRO_ASPECT_MEANINGS[type] || "Interaksi antar energi planetary.",
      };
    });
}

export function getTopAspects(aspects: any[]): any[] {
  if (!Array.isArray(aspects)) return [];
  const symbols: Record<string, string> = {
    Conjunction: "\u260c",
    Trine: "\u25b3",
    Square: "\u25a1",
    Sextile: "\u2736",
    Opposition: "\u260d",
  };

  return aspects
    .filter((aspect) => Boolean(
      (aspect.p1 || aspect.planet1) &&
      (aspect.p2 || aspect.planet2) &&
      (aspect.aspectType || aspect.type),
    ))
    .sort((a, b) => Math.abs(Number(a.orb) || 0) - Math.abs(Number(b.orb) || 0))
    .slice(0, 5)
    .map((aspect) => {
      const type = aspect.aspectType || aspect.type;
      const planet1 = aspect.p1 || aspect.planet1;
      const planet2 = aspect.p2 || aspect.planet2;
      return {
        title: `${symbols[type] || symbols.Conjunction} ${planet1} ${type} ${planet2}`,
        type,
        orb: aspect.orb,
        meaning: ASTRO_ASPECT_MEANINGS[type] || "Interaksi antar energi planetary.",
      };
    });
}
