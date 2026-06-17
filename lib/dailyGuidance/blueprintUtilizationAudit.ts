type UnknownRecord = Record<string, unknown>;

export type BlueprintUtilizationModule =
  | "Refleksi Jiwa"
  | "Catatan Hari Ini"
  | "Mentor Hari Ini"
  | "Daily Guidance"
  | "Innerwork Recommendation"
  | "Journey Narrative"
  | "Dashboard Summary";

export type BlueprintUtilizationReport = {
  module: BlueprintUtilizationModule;
  availableBlueprintFields: string[];
  consumedBlueprintFields: string[];
  unusedBlueprintFields: string[];
  estimatedUtilizationScore: number;
};

const BLUEPRINT_FIELD_PATHS: Record<string, string[][]> = {
  lifePath: [["lifePath", "number"], ["numerology", "lifePath"], ["lifePath"]],
  birthdayNumber: [["lifePath", "birthdayNumber"], ["numerology", "birthdayNumber"], ["birthdayNumber"]],
  attitudeNumber: [["lifePath", "attitudeNumber"], ["numerology", "attitudeNumber"], ["attitudeNumber"]],
  maturityNumber: [["lifePath", "maturityNumber"], ["numerology", "maturityNumber"], ["maturityNumber"]],
  pinnacles: [["lifePath", "pinnacles"], ["numerology", "pinnacles"], ["pinnacles"]],
  challenges: [["lifePath", "challenges"], ["numerology", "challenges"], ["challenges"]],
  personalYear: [["lifePath", "personalYear"], ["numerology", "personalYear"], ["personalYear"]],
  hdType: [["humanDesign", "type"], ["humanDesign", "energyType"]],
  hdStrategy: [["humanDesign", "strategy"]],
  hdAuthority: [["humanDesign", "authority"]],
  hdProfile: [["humanDesign", "profile"]],
  hdDefinition: [["humanDesign", "definition"]],
  hdSignature: [["humanDesign", "signature"]],
  hdNotSelf: [["humanDesign", "notSelf"], ["humanDesign", "notSelfTheme"]],
  incarnationCross: [["humanDesign", "incarnationCross"]],
  channels: [["humanDesign", "channels"]],
  gates: [["humanDesign", "gates"]],
  definedCenters: [["humanDesign", "definedCenters"], ["humanDesign", "defined"]],
  openCenters: [["humanDesign", "openCenters"], ["humanDesign", "open"]],
  arcanaCenter: [["destinyMatrix", "arcanaCenter"], ["destinyMatrix", "center"], ["arcanaCenter"]],
  commonEnergy: [["destinyMatrix", "commonEnergy"], ["commonEnergy"]],
  personalQualities: [["destinyMatrix", "personalQualities"], ["personalQualities"]],
  moneyLine: [["destinyMatrix", "moneyLine"], ["moneyLine"]],
  loveLine: [["destinyMatrix", "loveLine"], ["loveLine"]],
  karmicTail: [["destinyMatrix", "karmicTail"], ["karmicTail"]],
  fatherLine: [["destinyMatrix", "fatherLine"], ["destinyMatrix", "fatherProgram"], ["fatherProgram"]],
  motherLine: [["destinyMatrix", "motherLine"], ["destinyMatrix", "motherProgram"], ["motherProgram"]],
  ancestorLine: [["destinyMatrix", "ancestorLine"], ["ancestorLine"]],
  talentsFather: [["destinyMatrix", "talentsFather"], ["destinyMatrix", "talentaAyah"], ["talentsFather"]],
  talentsMother: [["destinyMatrix", "talentsMother"], ["destinyMatrix", "talentaIbu"], ["talentsMother"]],
  talentsGreat: [["destinyMatrix", "talentsGreat"], ["destinyMatrix", "talentaAgung"], ["talentsGreat"]],
  healthChart: [["destinyMatrix", "healthChart"], ["healthChart"]],
  chakraMatrix: [["destinyMatrix", "chakraMatrix"], ["chakraMatrix"]],
  soulSearching: [["destinyMatrix", "destinyIntelligence", "soulSearching"], ["destinyMatrix", "soulSearching"], ["destinyIntelligence", "soulSearching"]],
  socialization: [["destinyMatrix", "destinyIntelligence", "socialization"], ["destinyMatrix", "socialization"], ["destinyIntelligence", "socialization"]],
  spiritualKnowledge: [["destinyMatrix", "destinyIntelligence", "spiritualKnowledge"], ["destinyMatrix", "spiritualKnowledge"], ["destinyIntelligence", "spiritualKnowledge"]],
  healthChartAjna: [["destinyMatrix", "destinyIntelligence", "healthChart", "ajna"], ["destinyMatrix", "healthChart", "ajna"], ["destinyMatrix", "chakraMatrix", "ajna"]],
  healthChartAnahata: [["destinyMatrix", "destinyIntelligence", "healthChart", "anahata"], ["destinyMatrix", "healthChart", "anahata"], ["destinyMatrix", "chakraMatrix", "anahata"]],
  healthChartManipura: [["destinyMatrix", "destinyIntelligence", "healthChart", "manipura"], ["destinyMatrix", "healthChart", "manipura"], ["destinyMatrix", "chakraMatrix", "manipura"]],
  healthChartMuladhara: [["destinyMatrix", "destinyIntelligence", "healthChart", "muladhara"], ["destinyMatrix", "healthChart", "muladhara"], ["destinyMatrix", "chakraMatrix", "muladhara"]],
  sun: [["astrology", "sunSign"], ["natalChart", "sunSign"], ["astrology", "sun"], ["natalChart", "sun"]],
  moon: [["astrology", "moonSign"], ["natalChart", "moonSign"], ["astrology", "moon"], ["natalChart", "moon"]],
  ascendant: [["astrology", "ascendant"], ["natalChart", "ascendant"], ["astrology", "risingSign"], ["natalChart", "risingSign"]],
  mc: [["astrology", "mc"], ["natalChart", "mc"], ["astrology", "midheaven"], ["natalChart", "midheaven"]],
  mercury: [["astrology", "mercury"], ["natalChart", "mercury"]],
  venus: [["astrology", "venus"], ["natalChart", "venus"]],
  mars: [["astrology", "mars"], ["natalChart", "mars"]],
  jupiter: [["astrology", "jupiter"], ["natalChart", "jupiter"]],
  saturn: [["astrology", "saturn"], ["natalChart", "saturn"]],
  uranus: [["astrology", "uranus"], ["natalChart", "uranus"]],
  neptune: [["astrology", "neptune"], ["natalChart", "neptune"]],
  pluto: [["astrology", "pluto"], ["natalChart", "pluto"]],
  northNode: [["astrology", "northNode"], ["natalChart", "northNode"]],
  southNode: [["astrology", "southNode"], ["natalChart", "southNode"]],
  dominantHouses: [["astrology", "dominantHouses"], ["natalChart", "dominantHouses"]],
  housePlacements: [["astrology", "housePlacements"], ["natalChart", "housePlacements"], ["natalChart", "houses"]],
  majorAspects: [["astrology", "majorAspects"], ["natalChart", "majorAspects"], ["astrology", "aspects"], ["natalChart", "aspects"]],
};

const MODULE_CONSUMPTION: Record<BlueprintUtilizationModule, string[]> = {
  "Refleksi Jiwa": ["lifePath", "hdType", "ascendant", "moneyLine", "loveLine", "incarnationCross", "soulSearching", "socialization", "spiritualKnowledge", "healthChartAjna", "healthChartAnahata", "healthChartMuladhara"],
  "Catatan Hari Ini": ["lifePath", "hdType", "hdStrategy", "hdAuthority", "arcanaCenter", "sun", "moon", "ascendant", "venus", "saturn", "mc", "personalYear", "incarnationCross", "channels", "definedCenters", "moneyLine", "loveLine", "karmicTail", "northNode", "soulSearching", "socialization", "spiritualKnowledge", "healthChartAjna", "healthChartAnahata", "healthChartManipura", "healthChartMuladhara"],
  "Mentor Hari Ini": ["lifePath", "hdType", "arcanaCenter", "personalYear", "incarnationCross", "channels", "gates", "moneyLine", "loveLine", "ascendant", "mc", "venus", "saturn", "northNode", "housePlacements", "soulSearching", "socialization", "spiritualKnowledge", "healthChartAjna", "healthChartAnahata", "healthChartMuladhara"],
  "Daily Guidance": Object.keys(BLUEPRINT_FIELD_PATHS),
  "Innerwork Recommendation": ["lifePath", "hdType", "arcanaCenter", "personalYear", "incarnationCross", "channels", "gates", "moneyLine", "loveLine", "karmicTail", "ascendant", "mc", "venus", "saturn", "northNode", "housePlacements", "soulSearching", "socialization", "spiritualKnowledge", "healthChartAjna", "healthChartAnahata", "healthChartManipura", "healthChartMuladhara"],
  "Journey Narrative": ["lifePath", "hdType", "arcanaCenter", "moneyLine", "loveLine", "karmicTail", "ascendant", "soulSearching", "socialization", "spiritualKnowledge", "healthChartAjna", "healthChartAnahata", "healthChartMuladhara"],
  "Dashboard Summary": Object.keys(BLUEPRINT_FIELD_PATHS),
};

function readValue(source: unknown, path: string[]): unknown {
  let cursor = source;
  for (const key of path) {
    if (!cursor || typeof cursor !== "object" || !(key in cursor)) return undefined;
    cursor = (cursor as UnknownRecord)[key];
  }
  return cursor;
}

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return Boolean(value.trim());
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as UnknownRecord).length > 0;
  return true;
}

export function listAvailableBlueprintFields(blueprint: unknown): string[] {
  return Object.entries(BLUEPRINT_FIELD_PATHS)
    .filter(([, paths]) => paths.some((path) => hasValue(readValue(blueprint, path))))
    .map(([field]) => field);
}

export function createBlueprintUtilizationReport(blueprint: unknown): BlueprintUtilizationReport[] {
  const availableBlueprintFields = listAvailableBlueprintFields(blueprint);
  const availableSet = new Set(availableBlueprintFields);

  return Object.entries(MODULE_CONSUMPTION).map(([module, consumed]) => {
    const consumedAvailable = consumed.filter((field) => availableSet.has(field));
    const consumedSet = new Set(consumedAvailable);
    const unusedBlueprintFields = availableBlueprintFields.filter((field) => !consumedSet.has(field));
    const estimatedUtilizationScore = availableBlueprintFields.length === 0
      ? 0
      : Math.round((consumedAvailable.length / availableBlueprintFields.length) * 100);

    return {
      module: module as BlueprintUtilizationModule,
      availableBlueprintFields,
      consumedBlueprintFields: consumedAvailable,
      unusedBlueprintFields,
      estimatedUtilizationScore,
    };
  });
}
