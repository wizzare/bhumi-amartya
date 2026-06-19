import { TzolkinBlueprint, TzolkinInput } from "./types";
import { CASTLES, GALACTIC_TONES, GAP_KIN, SOLAR_SEALS, generateTzolkinArchetype, generateTzolkinSummary } from "./dictionaries";

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function getDayOfYear(month: number, day: number): number {
  if (month === 2 && day === 29) {
    return getDayOfYear(2, 28); // February 29 (Day Out of Time / Hunab Ku) retains the same Kin as Feb 28
  }
  let days = 0;
  for (let i = 0; i < month - 1; i++) {
    days += MONTH_DAYS[i];
  }
  return days + day;
}

export function calculateTzolkin(input: TzolkinInput): TzolkinBlueprint {
  const date = new Date(input.birthDate);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid birth date for Tzolkin calculation.");
  }

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  // Dreamspell year starts on July 26
  let dreamspellYear = year;
  if (month < 7 || (month === 7 && day < 26)) {
    dreamspellYear = year - 1;
  }

  // Base Kin for July 26 of the Dreamspell Year
  // July 26, 1987 is Kin 34
  let yearDiff = dreamspellYear - 1987;
  let baseKin = (34 + yearDiff * 105) % 260;
  if (baseKin <= 0) {
    baseKin += 260;
  }

  // Days since July 26
  const july26DayOfYear = 207; // getDayOfYear(7, 26)
  let daysSinceJuly26 = 0;
  
  if (dreamspellYear === year) {
    daysSinceJuly26 = getDayOfYear(month, day) - july26DayOfYear;
  } else {
    // 365 - 207 = 158 days from July 26 to Dec 31
    daysSinceJuly26 = 158 + getDayOfYear(month, day);
  }

  let kin = (baseKin + daysSinceJuly26) % 260;
  if (kin === 0) {
    kin = 260;
  }

  const toneIndex = (kin - 1) % 13;
  const sealIndex = (kin - 1) % 20;

  const tone = GALACTIC_TONES[toneIndex];
  const seal = SOLAR_SEALS[sealIndex];

  // Colors
  const colorList = ["Merah", "Putih", "Biru", "Kuning"];
  const color = colorList[sealIndex % 4];

  // --- Oracle Calculations ---
  // Destiny Seal Index (0-19)
  const S = sealIndex;
  const T = toneIndex + 1;

  // Analog
  const analogSealIndex = ((37 - S) % 20 + 20) % 20;
  
  // Occult
  const occultSealIndex = ((39 - S) % 20 + 20) % 20;
  const occultToneIndex = 14 - T;

  // Antipode
  const antipodeSealIndex = ((S + 10) % 20);

  // Guide
  let shift = 0;
  if ([1, 6, 11].includes(T)) shift = 0;
  else if ([2, 7, 12].includes(T)) shift = 12;
  else if ([3, 8, 13].includes(T)) shift = 4;
  else if ([4, 9].includes(T)) shift = 16;
  else if ([5, 10].includes(T)) shift = 8;
  const guideSealIndex = ((S + shift) % 20);

  const oracle = {
    destiny: { seal: SOLAR_SEALS[S], tone: GALACTIC_TONES[T - 1] },
    analog: { seal: SOLAR_SEALS[analogSealIndex], tone: GALACTIC_TONES[T - 1] },
    guide: { seal: SOLAR_SEALS[guideSealIndex], tone: GALACTIC_TONES[T - 1] },
    antipode: { seal: SOLAR_SEALS[antipodeSealIndex], tone: GALACTIC_TONES[T - 1] },
    occult: { seal: SOLAR_SEALS[occultSealIndex], tone: GALACTIC_TONES[occultToneIndex - 1] }
  };

  // Wavespell
  let wavespellStartKin = kin - toneIndex;
  if (wavespellStartKin <= 0) wavespellStartKin += 260;
  const wavespellSealIndex = (wavespellStartKin - 1) % 20;
  const wavespellSeal = SOLAR_SEALS[wavespellSealIndex];
  const wavespellName = wavespellSeal.name.replace(/\s*\(.*\)/, "");
  
  const wavespell = {
    name: `Gelombang ${wavespellName}`,
    theme: wavespellSeal.keyword,
    meaning: `Siklus 13 hari untuk mengembangkan ${wavespellSeal.keyword.toLowerCase()} dan mematangkan ${wavespellSeal.purpose.toLowerCase()}`,
    growthDirection: `Menuju pemahaman akan ${wavespellSeal.gift.toLowerCase()}`,
  };

  // Castle
  const castleIndex = Math.floor((kin - 1) / 52);
  const castle = CASTLES[castleIndex];

  // GAP
  const gap = GAP_KIN.has(kin);

  const archetype = generateTzolkinArchetype(seal, tone, color);
  const summary = generateTzolkinSummary(kin, `${seal.name} ${tone.name.split(" - ")[1]}`, seal, tone, wavespell, castle, gap);

  return {
    kin,
    kinName: `${seal.name} ${tone.name.split(" - ")[1]}`,
    solarSeal: seal,
    galacticTone: tone,
    color,
    wavespell,
    castle,
    gap,
    oracle,
    strengths: archetype.strengths,
    challenges: archetype.challenges,
    relationshipStyle: archetype.relationshipStyle,
    workStyle: archetype.workStyle,
    growthStyle: archetype.growthStyle,
    lifePurpose: archetype.lifePurpose,
    summary,
  };
}
