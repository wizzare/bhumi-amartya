import { buildNatalPresentation } from "@/lib/astrology/presentation";

const position = (sign: string, house: number, degree: number, retrograde = false) => ({ sign, house, placidusHouse: house, degree, longitude: degree, retrograde });

export const natalPresentationFixtures = {
  complete: {
    sunSign: "Taurus", moonSign: "Libra", risingSign: "Aquarius", mc: "Scorpio", northNode: "Taurus", southNode: "Scorpio", chiron: "Leo",
    planets: { Sun: position("Taurus", 4, 20), Moon: position("Libra", 9, 12), Mercury: position("Aries", 3, 4), Venus: position("Aries", 2, 18), Mars: position("Gemini", 4, 9), Jupiter: position("Aquarius", 1, 2), Saturn: position("Scorpio", 10, 22, true), Uranus: position("Sagittarius", 11, 3), Neptune: position("Capricorn", 11, 15), Pluto: position("Scorpio", 9, 19), NorthNode: position("Taurus", 4, 20), SouthNode: position("Scorpio", 10, 20), Chiron: position("Leo", 5, 7) },
    elements: { Fire: 3, Earth: 4, Air: 3, Water: 5 }, modalities: { Cardinal: 8, Fixed: 10, Mutable: 3 }, aspects: [{ p1: "Sun", p2: "Moon", type: "Trine", orb: 2 }, { p1: "NorthNode", p2: "SouthNode", type: "Opposition", orb: 0 }],
  },
  missingBirthTime: { sunSign: "Leo", moonSign: "Virgo", planets: { Sun: position("Leo", 0, 10), Moon: position("Virgo", 0, 8) }, elements: { Fire: 2, Earth: 2, Air: 1, Water: 1 }, modalities: { Cardinal: 1, Fixed: 3, Mutable: 2 } },
  fireEmphasis: { sunSign: "Aries", moonSign: "Leo", risingSign: "Sagittarius", planets: { Sun: position("Aries", 1, 3), Moon: position("Leo", 5, 11), Mars: position("Sagittarius", 9, 17) }, elements: { Fire: 8, Earth: 1, Air: 2, Water: 1 }, modalities: { Cardinal: 5, Fixed: 3, Mutable: 4 } },
};

export function validateNatalPresentationFixtures() {
  const complete = buildNatalPresentation(natalPresentationFixtures.complete);
  const partial = buildNatalPresentation(natalPresentationFixtures.missingBirthTime);
  const fire = buildNatalPresentation(natalPresentationFixtures.fireEmphasis);
  const nodeAxisFiltered = !complete.aspects.some((aspect) => aspect.title.includes("NorthNode") && aspect.title.includes("SouthNode"));
  return {
    complete: complete.identity.summary.length === 4 && complete.sections.some((section) => section.planet === "Sun" && section.availabilityStatus === "available"),
    missingBirthTime: !partial.identity.ascendant && !partial.identity.midheaven,
    differentCharts: complete.identity.summary.join("\n") !== fire.identity.summary.join("\n"),
    deterministic: JSON.stringify(buildNatalPresentation(natalPresentationFixtures.complete)) === JSON.stringify(complete),
    nodeAxisFiltered,
    houseLabelsIndonesian: complete.identity.houseEmphasis.every((house) => !/[A-Za-z]+ & [A-Za-z]+/.test(house.title)),
    elementNarrative: complete.identity.elementNarrative.split(/(?<=[.!?])\s+/).length >= 2,
    modalityNarrative: complete.identity.modalityNarrative.split(/(?<=[.!?])\s+/).length >= 2,
    houseNarratives: complete.identity.houseEmphasis.every((house) => house.explanation.split(/(?<=[.!?])\s+/).length >= 2),
    noDoublePunctuation: ![complete.identity.elementNarrative, complete.identity.modalityNarrative, ...complete.identity.houseEmphasis.map((house) => house.explanation)].some((text) => /[.!?]{2,}/.test(text)),
    technicalTermsExcluded: ![complete.identity.elementNarrative, complete.identity.modalityNarrative, ...complete.identity.houseEmphasis.map((house) => house.explanation), ...complete.identity.summary].some((text) => /\b(Fire|Earth|Air|Water|Cardinal|Fixed|Mutable|Rumah\s*\d|element|modality|dominant|percentage|concentration)\b/i.test(text)),
  };
}
