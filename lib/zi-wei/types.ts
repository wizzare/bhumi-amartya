export type ZiWeiGender = "male" | "female";

export type ZiWeiInput = {
  birthDate?: string | null;
  birthTime?: string | null;
  birthCity?: string | null;
  timezone?: string | null;
  gender?: ZiWeiGender | null;
  asOf?: Date;
};

export type ZiWeiStatus = "complete" | "partial" | "unavailable";

export type ZiWeiStar = {
  canonicalName: string;
  technicalName: string;
  brightness: string | null;
  transformation: "Hua Lu" | "Hua Quan" | "Hua Ke" | "Hua Ji" | null;
};

export type ZiWeiPalace = {
  index: number;
  key: string;
  name: string;
  heavenlyStem: string;
  earthlyBranch: string;
  isBodyPalace: boolean;
  majorStars: ZiWeiStar[];
  supportingStars: ZiWeiStar[];
  decade: { ageStart: number; ageEnd: number } | null;
};

export type ZiWeiTransformation = {
  type: "Hua Lu" | "Hua Quan" | "Hua Ke" | "Hua Ji";
  star: string;
  palace: string;
  birthYearStem: string;
  tableSource: string;
  calculationStatus: "calculated";
};

export type ZiWeiDecade = {
  cycleIndex: number;
  ageStart: number;
  ageEnd: number;
  palace: string;
  branch: string;
  dominantMajorStars: string[];
  transformations: ZiWeiTransformation["type"][];
  sourceVersion: string;
};

export type ZiWeiResult = {
  systemName: "Zi Wei Dou Shu";
  status: ZiWeiStatus;
  method: {
    id: "iztro-default-complete-book-v2.5.8";
    sourceVersion: "iztro@2.5.8";
    sourceClassification: "FOUNDER_APPROVED_FUNCTIONAL_RECONSTRUCTION";
    calendarOwner: "lunar-lite@0.2.8 via iztro@2.5.8";
    calendarConvention: "Chinese lunar calendar";
    leapMonthPolicy: "Leap-month days 1–15 retain the nominal month; days after 15 advance one month for placement";
    timeConvention: "local civil time; no true-solar-time correction";
    dayBoundary: "late Zi hour (23:00–00:00) advances to the following day";
    algorithm: "default";
  };
  birthDataStatus: {
    birthDate: boolean;
    exactBirthTime: boolean;
    timezone: boolean;
    birthplace: boolean;
    gender: boolean;
    notes: string[];
  };
  lunarBirth: {
    lunarYear: number;
    lunarMonth: number;
    lunarDay: number;
    isLeapMonth: boolean;
    yearHeavenlyStem: string;
    yearEarthlyBranch: string;
    hourBranch: string;
    hourRange: string;
    conversionStatus: "calculated";
  } | null;
  lifePalace: ZiWeiPalace | null;
  bodyPalace: ZiWeiPalace | null;
  bureau: string | null;
  lifeMaster: string | null;
  bodyMaster: string | null;
  palaces: ZiWeiPalace[];
  majorStars: ZiWeiStar[];
  supportingStars: ZiWeiStar[];
  fourTransformations: ZiWeiTransformation[];
  decadeCycles: ZiWeiDecade[];
  activeDecade: ZiWeiDecade | null;
  annualCycle: null;
  calculationError: string | null;
};
