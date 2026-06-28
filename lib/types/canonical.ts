export interface CanonicalIdentityDomain {
  sunSign: string;
  hdProfile: string;
  hiddenCharacter: {
    soulUrge: number;
    moonSign: string;
    chartHeart: Record<string, number>;
  };
}

export interface CanonicalPurposeDomain {
  lifePath: number;
  destinyPoint: number;
}

export interface CanonicalEnergyDomain {
  authority: string;
  strategy: string;
  dominantElement: string;
  vitality: {
    elementBalance: Record<string, number>;
    sacralDefined: boolean;
    chakraPhysics: Record<string, number>;
  };
}

export interface CanonicalShadowDomain {
  karmicTail: number[];
  chiron: string;
  emotionalNeeds: { moonSign: string; chartHeart: Record<string, number> };
  emotionalTriggers: { mars: string; pluto: string; aspects: string[]; chartHeart: Record<string, number> };
  ancestralLegacy: { fatherLine: number[]; motherLine: number[]; ancestorLine: number[]; vedicChallenges: string[] };
  soulLesson: { northNode: string; southNode: string; rahu: string; ketu: string };
  soulTrace: { karmicTail: number[]; occultSeal: string; occultLesson: string };
  moneyBlock: { moneyLine: number[]; unfavorableElements: string[]; secondHouse: string; eighthHouse: string };
  loveBlock: { loveLine: number[]; venus: string };
}

export interface CanonicalTalentsDomain {
  matrixTalents: number[];
  hdType: string;
  potentialTalents: { tenGods: string[]; majorYogas: string[]; supportiveAspects: string[] };
  workStyle: { baziCareer: string; midheaven: string; moneyLine: number[] };
  wealthFlow: { moneyLine: number[]; wealthYogas: string[]; moneyStyle: string };
}

export interface CanonicalRelationshipsDomain {
  loveLine: number[];
  darakaraka: string;
  relationshipStyle: string;
  loveLanguage: { elementBalance: Record<string, number>; venus: string };
  healthyBoundaries: { undefinedCenters: string[]; chartHeart: Record<string, number> };
}

export interface CanonicalTimingDomain {
  currentDasha: string;
  yearlyArcana: number;
  currentAntardasha: string;
  currentState: string;
  dailyFocus: string;
  growthArea: string;
}

export interface CanonicalHealthDomain {
  chakraMatrix: Record<string, { physics?: number; energy?: number; emotion?: number }>;
  hdDigestion: string;
  hdEnvironment: string;
  hdType: string;
  baziElement: string;
}

export interface CanonicalSpiritualityDomain {
  vedicNinthHouse: string;
  vedicAtmakaraka: string;
  destinyHighArcana: number;
  destinyTalents: number[];
  hdCognition: string;
  hdHeadAjnaDefined: boolean;
  hdAura: string;
  clairIndicators: {
    destinyTalents: number[];
    spleenDefined: boolean;
    ajnaDefined: boolean;
    solarPlexusDefined: boolean;
  };
}

export interface CanonicalSoulIdentityDomain {
  mission: {
    lifePath: number;
    lifePathRole: string;
    destinyPoint: number;
    destinySoulMission: string;
    tzolkinLifePurpose: string;
    vedicDharmaFocus: string;
    vedicMokshaFocus: string;
    wetonLifeMission: string;
    baziLifeMission: string;
  };
  gifts: {
    lifePathStrengths: string[];
    destinyTalents: number[];
    destinyGreatTalents: number[];
    tzolkinGifts: string[];
    vedicStrengths: string[];
    vedicYogas: string[];
    humanDesignChannels: string[];
    natalSupportiveAspects: string[];
    wetonStrengths: string[];
    baziStrengths: string[];
  };
  lessons: {
    destinyKarmicTail: number[];
    tzolkinLessons: string[];
    vedicChallenges: string[];
    natalNodes: string[];
    natalChiron: string;
    humanDesignNotSelf: string;
    openCenters: string[];
    wetonChallenges: string[];
    baziChallenges: string[];
  };
  shadow: {
    destinyKarmicTail: number[];
    tzolkinShadow: string[];
    natalChiron: string;
    natalLilith: string;
    natalPluto: string;
    natalSouthNode: string;
    humanDesignNotSelf: string;
    openCenters: string[];
  };
  archetype: {
    lifePathRole: string;
    humanDesignType: string;
    humanDesignProfile: string;
    destinyArcana: number;
    sunSign: string;
    moonSign: string;
    ascendant: string;
    tzolkinKinName: string;
    tzolkinSeal: string;
    tzolkinTone: string;
    vedicNakshatra: string;
    weton: string;
    baziDayMaster: string;
  };
}

export interface CanonicalIdentity {
  identity: CanonicalIdentityDomain;
  purpose: CanonicalPurposeDomain;
  energy: CanonicalEnergyDomain;
  shadow: CanonicalShadowDomain;
  talents: CanonicalTalentsDomain;
  relationships: CanonicalRelationshipsDomain;
  timing: CanonicalTimingDomain;
  health: CanonicalHealthDomain;
  spirituality: CanonicalSpiritualityDomain;
  soulIdentity: CanonicalSoulIdentityDomain;
}
