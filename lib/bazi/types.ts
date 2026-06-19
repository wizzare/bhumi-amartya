export type BaziElement = "Wood" | "Fire" | "Earth" | "Metal" | "Water";
export type BaziPolarity = "Yang" | "Yin";

export interface BaziPillar {
  stem: string;
  stemPinyin: string;
  branch: string;
  branchPinyin: string;
  element: BaziElement;
  polarity: BaziPolarity;
  animal: string;
  display: string;
}

export interface ElementBalance {
  Wood: number;
  Fire: number;
  Earth: number;
  Metal: number;
  Water: number;
}

export interface TenGodEntry {
  pillar: "year" | "month" | "hour";
  stem: string;
  tenGod: string;
}

export interface LuckPillar {
  index: number;
  startAge: number;
  endAge: number;
  pillar: BaziPillar;
}

export interface BaziBlueprint {
  yearPillar: BaziPillar;
  monthPillar: BaziPillar;
  dayPillar: BaziPillar;
  hourPillar: BaziPillar;
  dayMaster: {
    stem: string;
    pinyin: string;
    element: BaziElement;
    polarity: BaziPolarity;
    description: string;
  };
  fiveElements: ElementBalance;
  tenGods: TenGodEntry[];
  favorableElements: BaziElement[];
  unfavorableElements: BaziElement[];
  luckPillars: LuckPillar[];
  currentLuckCycle: LuckPillar;
  luckCycleMethod: "forward-solar-sequence";
  strengths: string[];
  challenges: string[];
  careerStyle: string;
  relationshipStyle: string;
  moneyStyle: string;
  lifeMission: string;
  summary: string[];
}

export interface BaziInput {
  birthDate: string;
  birthTime: string;
  timezone?: string | null;
  referenceDate?: Date;
}
