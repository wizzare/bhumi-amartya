import { getTopAspects } from "../lib/astrology/natalIntelligence";
import { generateDeterministicSynthesis } from "../lib/engines/NatalSummaryEngine";

const goldenUsers = [
  { name: "Widhi", sun: "Taurus", moon: "Libra", rising: "Libra" },
  { name: "Ning", sun: "Libra", moon: "Cancer", rising: "Virgo" },
  { name: "Widya", sun: "Gemini", moon: "Scorpio", rising: "Aries" },
  { name: "Amartya", sun: "Gemini", moon: "Taurus", rising: "Leo" },
  { name: "Eva Syana", sun: "Virgo", moon: "Taurus", rising: "Pisces" },
];

for (const user of goldenUsers) {
  const astrology = {
    calculationStatus: "ready",
    sunSign: user.sun,
    moonSign: user.moon,
    risingSign: user.rising,
    midheaven: "Capricorn",
    planets: {
      Sun: { sign: user.sun },
      Moon: { sign: user.moon },
      Mercury: { sign: "Gemini" },
      Venus: { sign: "Taurus" },
      Mars: { sign: "Aries" },
      NorthNode: { sign: "Aries" },
      SouthNode: { sign: "Libra" },
      Chiron: { sign: "Aries" },
    },
    northNode: "Aries",
    southNode: "Libra",
    chiron: "Aries",
    elements: { Fire: 4, Earth: 3, Air: 2, Water: 1 },
    houses: { house1: { sign: user.rising }, house4: { sign: "Cancer" }, house10: { sign: "Capricorn" } },
    aspects: [
      { p1: "Sun", p2: "Moon", type: "Opposition", orb: 1.2 },
      { planet1: "Mars", planet2: "Saturn", aspectType: "Square", orb: 2.1 },
      { p1: "Mercury", p2: "Jupiter", type: "Trine", orb: 2.8 },
    ],
    lilith: { sign: "Scorpio", degree: 12.34, house: 8 },
  };

  const aspects = getTopAspects(astrology.aspects);
  const summary = generateDeterministicSynthesis(astrology);
  const paragraphs = summary.split("\n\n").filter(Boolean);
  const validAspects = aspects.length === 3 && aspects.every((aspect) => !aspect.title.includes("undefined"));
  const validSummary = paragraphs.length >= 4 && paragraphs.length <= 6 && !summary.includes("sedang disiapkan");
  const validLilith = Boolean(astrology.lilith.sign && astrology.lilith.house && Number.isFinite(astrology.lilith.degree));

  if (!validAspects || !validSummary || !validLilith) {
    throw new Error(`${user.name} failed natal parity validation.`);
  }

  console.log(`[PASS] ${user.name}: aspects=${aspects.length}, summaryParagraphs=${paragraphs.length}, lilith=${astrology.lilith.sign} H${astrology.lilith.house} ${astrology.lilith.degree}°`);
}
