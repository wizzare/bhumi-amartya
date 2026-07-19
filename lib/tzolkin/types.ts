export interface SolarSeal {
  name: string;
  code?: string;
  keyword: string;
  gift: string;
  challenge: string;
  purpose: string;
}

export interface GalacticTone {
  name: string;
  function: string;
  gift: string;
  shadow: string;
  lesson: string;
}

export interface Wavespell {
  name: string;
  theme: string;
  meaning: string;
  growthDirection: string;
}

export interface Castle {
  name: string;
  theme: string;
  meaning: string;
  spiritualLesson: string;
}

export interface TzolkinOracle {
  destiny: { seal: SolarSeal; tone: GalacticTone };
  analog: { seal: SolarSeal; tone: GalacticTone };
  guide: { seal: SolarSeal; tone: GalacticTone };
  antipode: { seal: SolarSeal; tone: GalacticTone };
  occult: { seal: SolarSeal; tone: GalacticTone };
}

export interface TzolkinBlueprint {
  kin: number;
  kinName: string;
  solarSeal: SolarSeal;
  galacticTone: GalacticTone;
  color: string;
  wavespell: Wavespell;
  castle: Castle;
  gap: boolean;
  oracle: TzolkinOracle;
  strengths: string[];
  challenges: string[];
  relationshipStyle: string;
  workStyle: string;
  growthStyle: string;
  lifePurpose: string;
  summary: string[];
}

export interface TzolkinInput {
  birthDate: string; // YYYY-MM-DD
}
