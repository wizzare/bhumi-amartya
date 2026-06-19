import type { GaiaIdentity, GaiaSignal, GaiaTheme } from "./types";
import { isCanonicalHumanDesign } from "../../humandesign/hdAudit";
import { normalizeDestinyMatrixIntelligence } from "../../engines/destinyMatrixIntelligence";
import { calculateNatalBasics } from "../../astrology/calculateNatalBasics";
import { calculateNumerology } from "../../calculations/calculateNumerology";
import { calculateBirthDayNumber, calculatePersonalYear } from "../../calculations/calculateLifePath";

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : {};
}

function read(source: unknown, paths: string[][]): unknown {
  for (const path of paths) {
    let value: unknown = source;
    for (const key of path) value = record(value)[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
}

function text(source: unknown, paths: string[][], fallback = "Belum tersedia"): string {
  const value = read(source, paths);
  if (typeof value === "string" || typeof value === "number") return String(value);
  return fallback;
}

function add(signals: GaiaSignal[], theme: GaiaTheme, source: string, field: string, value: unknown, tags: string[], quality = 0.8) {
  if (value === undefined || value === null || value === "") return;
  const rendered = Array.isArray(value)
    ? value.filter(Boolean).join(", ")
    : typeof value === "object" ? JSON.stringify(value) : String(value);
  if (!rendered.trim()) return;
  signals.push({ id: `${theme}:${source}:${field}`, theme, source, field, value: rendered, rawValue: value, tags, quality });
}

const SIGN_ELEMENTS: Record<string, "Earth" | "Water" | "Air" | "Fire"> = {
  aries: "Fire", leo: "Fire", sagittarius: "Fire",
  taurus: "Earth", virgo: "Earth", capricorn: "Earth",
  gemini: "Air", libra: "Air", aquarius: "Air",
  cancer: "Water", scorpio: "Water", pisces: "Water",
};

function readPlanet(astrology: UnknownRecord, planet: string, field: string): unknown {
  const planets = astrology.planets;
  if (Array.isArray(planets)) {
    const p = planets.find((item: any) => typeof item === "object" && item && String(item.name).toLowerCase() === planet.toLowerCase());
    return p ? p[field] : undefined;
  }
  const planetsObj = record(planets);
  const capitalized = planet.charAt(0).toUpperCase() + planet.slice(1);
  const lower = planet.toLowerCase();
  const entry = record(planetsObj[capitalized] ?? planetsObj[lower]);
  return entry[field];
}

function extractPlanetSigns(astrology: UnknownRecord, blueprint: UnknownRecord): { signs: string[]; source: "structured_planets" | "top_level_planet_fields" | "recalculated" | "incomplete"; validCount: number } {
  let signs: string[] = [];
  const planets = astrology.planets ?? read(blueprint, [["astrology", "planets"], ["natalChart", "planets"]]);

  if (Array.isArray(planets)) {
    signs.push(...planets.map((p: any) => String(p?.sign || "")).filter(Boolean));
  } else if (planets && typeof planets === "object") {
    signs.push(...Object.values(record(planets)).map((p) => String(record(p).sign || "")).filter(Boolean));
  }

  let validCount = signs.filter(s => SIGN_ELEMENTS[s.toLowerCase()]).length;
  if (validCount >= 8) {
    return { signs, source: "structured_planets", validCount };
  }

  signs = [];
  const topLevelFields = ["sunSign", "moonSign", "mercurySign", "venusSign", "marsSign", "jupiterSign", "saturnSign", "uranusSign", "neptuneSign", "plutoSign"];
  for (const field of topLevelFields) {
    const val = String(astrology[field] || read(blueprint, [["astrology", field], ["natalChart", field]]) || readPlanet(astrology, field.replace("Sign", ""), "sign") || "");
    if (val) signs.push(val);
  }

  validCount = signs.filter(s => SIGN_ELEMENTS[s.toLowerCase()]).length;
  if (validCount >= 8) {
    return { signs, source: "top_level_planet_fields", validCount };
  }

  const birthDate = read(blueprint, [["birthDate"], ["profile", "birthDate"], ["birthData", "date"], ["userProfile", "birthDate"]]) as string;
  const birthTime = read(blueprint, [["birthTime"], ["profile", "birthTime"], ["birthData", "time"], ["userProfile", "birthTime"]]) as string;
  const birthCity = read(blueprint, [["birthCity"], ["profile", "birthCity"], ["birthData", "city"], ["userProfile", "birthCity"]]) as string;
  const latitude = read(blueprint, [["latitude"], ["profile", "latitude"], ["birthData", "latitude"], ["coordinates", "latitude"], ["userProfile", "latitude"]]) as number;
  const longitude = read(blueprint, [["longitude"], ["profile", "longitude"], ["birthData", "longitude"], ["coordinates", "longitude"], ["userProfile", "longitude"]]) as number;
  const timezone = read(blueprint, [["timezone"], ["profile", "timezone"], ["birthData", "timezone"], ["userProfile", "timezone"]]) as string;

  if (birthDate && birthTime) {
    try {
      const recalculated = calculateNatalBasics({
        birthDate,
        birthTime,
        birthCity,
        timezone,
        latitude,
        longitude
      });
      if (recalculated && recalculated.planets) {
        signs = [];
        signs.push(...Object.values(recalculated.planets).map((p: any) => String(p?.sign || "")).filter(Boolean));
        validCount = signs.filter(s => SIGN_ELEMENTS[s.toLowerCase()]).length;
        if (validCount >= 8) {
          return { signs, source: "recalculated", validCount };
        }
      }
    } catch (err) {
      console.error("Failed to recalculate planets in normalizeSources", err);
    }
  }

  console.log("[V3 DEBUG] createElementComposition incomplete:", {
    validPlanetCount: validCount,
    extractedSigns: signs,
    birthDate: birthDate ? `Found in ${read(blueprint, [["birthDate"]]) ? "blueprint.birthDate" : read(blueprint, [["profile", "birthDate"]]) ? "profile.birthDate" : "birthData.date"}` : "Missing",
    birthTime: birthTime ? `Found in ${read(blueprint, [["birthTime"]]) ? "blueprint.birthTime" : read(blueprint, [["profile", "birthTime"]]) ? "profile.birthTime" : "birthData.time"}` : "Missing",
    birthCity: birthCity ? `Found` : "Missing",
    timezone: timezone ? `Found` : "Missing",
    latitude: latitude ? `Found` : "Missing",
    longitude: longitude ? `Found` : "Missing",
  });

  return { signs: [], source: "incomplete", validCount };
}

function createElementComposition(root: UnknownRecord, astrology: UnknownRecord): Record<string, number> | { status: "incomplete"; reason: string; validCount: number } | undefined {
  const { signs, source, validCount } = extractPlanetSigns(astrology, root);

  if (source === "incomplete") {
    return { status: "incomplete", reason: "planet_signs_missing", validCount };
  }

  const counts = { Earth: 0, Water: 0, Air: 0, Fire: 0 } as Record<string, number>;
  let hasSign = false;
  for (const sign of signs) {
    if (!sign) continue;
    const element = SIGN_ELEMENTS[String(sign).toLowerCase()];
    if (element && counts[element] !== undefined) {
      counts[element] += 1;
      hasSign = true;
    }
  }

  if (hasSign) {
    const total = counts.Earth + counts.Water + counts.Air + counts.Fire;
    return Object.fromEntries(Object.entries(counts).map(([element, count]) => [element, Math.round((count / total) * 100)]));
  }
  
  return undefined;
}

function dominantElement(composition: Record<string, number> | { status: "incomplete"; reason: string; validCount: number } | undefined): string | undefined {
  if (!composition || "status" in composition) return undefined;
  return Object.entries(composition)
    .sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0];
}

export function isValidatedHumanDesign(blueprint: unknown): boolean {
  return isCanonicalHumanDesign(record(blueprint).humanDesign);
}

export function createGaiaIdentity(blueprint: unknown): GaiaIdentity {
  return {
    lifePath: text(blueprint, [["lifePath", "display"], ["lifePath", "number"], ["numerology", "number"]]),
    arcanaCenter: text(blueprint, [["destinyMatrix", "arcanaCenter"], ["destinyMatrix", "center"]]),
    humanDesignType: isValidatedHumanDesign(blueprint) ? text(blueprint, [["humanDesign", "type"]]) : "Human Design sedang diproses.",
    sunSign: text(blueprint, [["astrology", "sunSign"], ["natalChart", "sunSign"]]),
  };
}

export function normalizeGaiaSources(blueprint: unknown): GaiaSignal[] {
  const signals: GaiaSignal[] = [];
  const root = record(blueprint);
  const dm = record(root.destinyMatrix);
  const destinyIntelligence = record(dm.destinyIntelligence);
  const normalizedDestinyIntelligence = normalizeDestinyMatrixIntelligence(root);
  const healthChart = destinyIntelligence.healthChart || dm.healthChart || dm.chakraMatrix || root.healthChart || root.chakraMatrix || normalizedDestinyIntelligence.healthChart;
  const astrology = record(root.astrology || root.natalChart);
  const hd = record(root.humanDesign);
  const numerology = record(root.numerology);
  const hdValid = isValidatedHumanDesign(blueprint);
  const elementComposition = createElementComposition(root, astrology);
  const lifePathNumber = read(root, [["lifePath", "number"], ["numerology", "lifePath"]]);

  const fullName = read(root, [["fullName"], ["profile", "fullName"], ["userProfile", "fullName"]]) as string;
  const birthDate = read(root, [["birthDate"], ["profile", "birthDate"], ["birthData", "date"], ["userProfile", "birthDate"]]) as string;
  const derivedNumerology = fullName && birthDate ? calculateNumerology(fullName, birthDate) : null;
  const derivedBirthDay = birthDate ? calculateBirthDayNumber(birthDate) : undefined;
  const derivedPersonalYear = birthDate ? calculatePersonalYear(birthDate) : undefined;

  const finalExpression = numerology.expression ?? derivedNumerology?.expression;
  const finalSoulUrge = numerology.soulUrge ?? derivedNumerology?.soulUrge;
  const finalPersonality = numerology.personality ?? derivedNumerology?.personality;
  const finalBirthDay = numerology.birthDay ?? numerology.birthdayNumber ?? read(root, [["lifePath", "birthdayNumber"], ["birthdayNumber"]]) ?? derivedBirthDay;
  const finalPersonalYear = numerology.personalYear ?? read(root, [["lifePath", "personalYear"], ["personalYear"]]) ?? derivedPersonalYear;

  // --- Numerology ---
  const lifePathRole = read(root, [["lifePath", "role"], ["numerology", "role"]]);
  const lifePathStrengths = read(root, [["lifePath", "positiveTraits"]]);
  const lifePathWeaknesses = read(root, [["lifePath", "negativeTraits"]]);
  add(signals, "career", "lifePath", "role", lifePathRole, ["work-style", "value-creation"]);
  add(signals, "talents", "lifePath", "role", lifePathRole, ["life-direction", "natural-strength"]);
  add(signals, "talents", "lifePath", "strengths", lifePathStrengths, ["natural-strength"]);
  add(signals, "shadow", "lifePath", "weaknesses", lifePathWeaknesses, ["growth-edge"]);
  add(signals, "spirituality", "lifePath", "purpose", lifePathRole, ["life-direction"]);
  add(signals, "career", "lifePath", "number", lifePathNumber, ["career-direction"]);
  
  add(signals, "career", "numerology", "expression", finalExpression, ["value-creation", "communication-gift", "career-direction"]);
  add(signals, "talents", "numerology", "expression", finalExpression, ["natural-strength", "communication-gift"]);
  add(signals, "relationships", "numerology", "soulUrge", finalSoulUrge, ["emotional-needs", "love-style"]);
  add(signals, "spirituality", "numerology", "soulUrge", finalSoulUrge, ["soul-direction"]);
  add(signals, "career", "numerology", "personality", finalPersonality, ["work-style"]);
  add(signals, "shadow", "numerology", "soulUrge", finalSoulUrge, ["inner-child", "emotional-needs"]);
  add(signals, "shadow", "numerology", "personality", finalPersonality, ["inner-child", "emotional-needs", "growth-edge"]);
  
  add(signals, "talents", "numerology", "birthDay", finalBirthDay, ["natural-strength"]);
  add(signals, "career", "numerology", "birthDay", finalBirthDay, ["work-style"]);
  add(signals, "spirituality", "numerology", "personalYear", finalPersonalYear, ["evolution-direction"]);
  add(signals, "career", "numerology", "personalYear", finalPersonalYear, ["growth-edge"]);

  add(signals, "energy", "lifePath", "number", lifePathNumber, ["energy-rhythm", "natural-strength"]);
  add(signals, "energy", "lifePath", "strengths", lifePathStrengths, ["energy-balance", "natural-strength"]);
  add(signals, "energy", "lifePath", "challenges", lifePathWeaknesses, ["energy-balance", "growth-edge"]);
  add(signals, "energy", "numerology", "strengthChallengePattern", [lifePathStrengths, lifePathWeaknesses].flat().filter(Boolean), ["energy-balance", "growth-edge"]);
  add(signals, "energy", "numerology", "expression", finalExpression, ["energy-rhythm", "natural-strength"]);
  add(signals, "energy", "numerology", "soulUrge", finalSoulUrge, ["energy-rhythm", "emotional-needs"]);
  add(signals, "career", "numerology", "moneyPattern", [lifePathNumber, finalExpression, finalPersonality].filter(Boolean), ["economic-pattern", "growth-edge"]);

  // --- Destiny Matrix ---
  add(signals, "shadow", "destinyMatrix", "karmicTail", dm.karmicTail, ["recurring-pattern", "integration"]);
  add(signals, "relationships", "destinyMatrix", "loveLine", dm.loveLine, ["relationship-pattern", "love-style"]);
  add(signals, "career", "destinyMatrix", "moneyLine", dm.moneyLine, ["economic-pattern", "value-creation", "career-direction"]);
  add(signals, "career", "destinyMatrix", "topTalents", dm.talentsGreat || dm.talents, ["natural-strength", "work-style"]);
  add(signals, "career", "destinyMatrix", "purposes", dm.purposes, ["career-direction"]);
  add(signals, "talents", "destinyMatrix", "topTalents", dm.talentsGreat || dm.talents, ["natural-strength"]);
  add(signals, "shadow", "innerChild", "familyLines", [dm.motherLine, dm.fatherLine].flat().filter(Boolean), ["inner-child", "family-pattern"]);
  add(signals, "shadow", "destinyMatrix", "motherLine", dm.motherLine, ["inner-child", "family-pattern"]);
  add(signals, "shadow", "destinyMatrix", "fatherLine", dm.fatherLine, ["inner-child", "family-pattern"]);
  add(signals, "relationships", "destinyMatrix", "motherLine", dm.motherLine, ["family-pattern", "relationship-pattern"]);
  add(signals, "relationships", "destinyMatrix", "fatherLine", dm.fatherLine, ["family-pattern", "relationship-pattern"]);
  add(signals, "energy", "chakra", "healthChart", healthChart, ["energy-balance", "grounding"]);
  add(signals, "energy", "destinyMatrix", "healthChart", healthChart, ["energy-balance", "grounding"]);
  add(signals, "energy", "destinyMatrix", "dominantChakra", destinyIntelligence.dominantChakra, ["energy-rhythm", "energy-balance"]);
  add(signals, "energy", "destinyMatrix", "center", dm.arcanaCenter || dm.center, ["energy-rhythm", "natural-strength"]);
  add(signals, "talents", "elements", "composition", elementComposition, ["elements"]);
  add(signals, "spirituality", "arcana", "center", dm.arcanaCenter || dm.center, ["soul-direction"]);
  add(signals, "spirituality", "destinyMatrix", "purposes", dm.purposes, ["life-direction", "soul-direction"]);
  add(signals, "shadow", "destinyMatrix", "ancestorLine", dm.ancestorLine, ["inner-child", "family-pattern", "integration"]);
  add(signals, "career", "destinyMatrix", "karmicTail", dm.karmicTail, ["economic-pattern", "recurring-pattern", "growth-edge"]);
  add(signals, "talents", "destinyMatrix", "ancestorLine", dm.ancestorLine, ["ancestry-wisdom"]);
  add(signals, "talents", "destinyMatrix", "talentsGreat", dm.talentsGreat, ["natural-strength"]);
  add(signals, "talents", "destinyMatrix", "talentsFather", dm.talentsFather, ["paternal-gift"]);
  add(signals, "talents", "destinyMatrix", "talentsMother", dm.talentsMother, ["maternal-gift"]);

  // --- Natal Chart (multi-theme routing) ---
  const moonSign = astrology.moonSign || readPlanet(astrology, "moon", "sign");
  const venusSign = readPlanet(astrology, "venus", "sign");
  const mercurySign = readPlanet(astrology, "mercury", "sign");
  const marsSign = readPlanet(astrology, "mars", "sign");
  const saturnSign = readPlanet(astrology, "saturn", "sign");
  const jupiterSign = readPlanet(astrology, "jupiter", "sign");
  const northNodeSign = readPlanet(astrology, "northNode", "sign") || readPlanet(astrology, "northnode", "sign");
  const southNodeSign = readPlanet(astrology, "southNode", "sign") || readPlanet(astrology, "southnode", "sign");
  const uranusSign = readPlanet(astrology, "uranus", "sign");
  const neptuneSign = readPlanet(astrology, "neptune", "sign");
  const plutoSign = readPlanet(astrology, "pluto", "sign");
  const chironSign = readPlanet(astrology, "chiron", "sign");
  const lilith = record(astrology.lilith);
  const lilithPlacement = lilith.sign && lilith.house
    ? `${lilith.sign}, House ${lilith.house}`
    : undefined;
  const midheavenSign = astrology.midheaven || astrology.mc;
  const sunSign = astrology.sunSign || readPlanet(astrology, "sun", "sign");

  // Moon → relationships + energy
  add(signals, "relationships", "natalChart", "moon", moonSign, ["emotional-needs"]);
  add(signals, "energy", "natalChart", "moon", moonSign, ["energy-rhythm", "emotional-needs"]);
  add(signals, "shadow", "natalChart", "moon", moonSign, ["inner-child", "emotional-needs"]);
  // Venus → relationships + talents
  add(signals, "relationships", "natalChart", "venus", venusSign, ["love-style"]);
  add(signals, "talents", "natalChart", "venus", venusSign, ["love-style", "natural-strength"]);
  // Mercury → talents + career
  add(signals, "talents", "natalChart", "mercury", mercurySign, ["communication-gift"]);
  add(signals, "career", "natalChart", "mercury", mercurySign, ["communication-gift", "work-style"]);
  // Mars → energy + career
  add(signals, "energy", "natalChart", "mars", marsSign, ["energy-rhythm"]);
  add(signals, "career", "natalChart", "mars", marsSign, ["energy-rhythm", "work-style"]);
  // Saturn → shadow + career + spirituality
  add(signals, "shadow", "natalChart", "saturn", saturnSign, ["growth-edge"]);
  add(signals, "career", "natalChart", "saturn", saturnSign, ["growth-edge", "career-direction"]);
  add(signals, "spirituality", "natalChart", "saturn", saturnSign, ["growth-edge", "life-direction"]);
  // Jupiter → career + spirituality + talents
  add(signals, "career", "natalChart", "jupiter", jupiterSign, ["expansion-zone", "career-direction", "economic-pattern"]);
  add(signals, "spirituality", "natalChart", "jupiter", jupiterSign, ["expansion-zone"]);
  add(signals, "talents", "natalChart", "jupiter", jupiterSign, ["expansion-zone", "natural-strength"]);
  // North Node → spirituality
  add(signals, "spirituality", "natalChart", "northNode", northNodeSign, ["evolution-direction"]);
  // South Node → shadow
  add(signals, "shadow", "natalChart", "southNode", southNodeSign, ["past-pattern"]);
  add(signals, "shadow", "natalChart", "southNodeInnerChild", southNodeSign, ["inner-child", "past-pattern"]);
  // Uranus → spirituality
  add(signals, "spirituality", "natalChart", "uranus", uranusSign, ["awakening-pattern"]);
  // Neptune → spirituality
  add(signals, "spirituality", "natalChart", "neptune", neptuneSign, ["spiritual-longing"]);
  // Pluto → shadow + spirituality
  add(signals, "shadow", "natalChart", "pluto", plutoSign, ["power-transformation"]);
  add(signals, "spirituality", "natalChart", "pluto", plutoSign, ["power-transformation"]);
  // Chiron → shadow + spirituality
  add(signals, "shadow", "natalChart", "chiron", chironSign, ["inner-child", "wound-healing"]);
  add(signals, "spirituality", "natalChart", "chiron", chironSign, ["wound-healing", "evolution-direction"]);
  // Lilith → Shadow Layer, Pola Berulang, Inner Child, Shadow Integration
  add(signals, "shadow", "natalChart", "lilith", lilithPlacement, ["growth-edge", "recurring-pattern", "inner-child", "integration", "power-transformation"], 1);
  // Midheaven → career
  add(signals, "career", "natalChart", "midheaven", midheavenSign, ["career-direction", "economic-pattern"]);
  // Sun → talents + energy
  add(signals, "talents", "natalChart", "sun", sunSign, ["natural-strength", "life-direction"]);
  add(signals, "energy", "natalChart", "sun", sunSign, ["energy-rhythm"]);
  add(signals, "energy", "elements", "composition", elementComposition, ["energy-balance", "energy-rhythm"]);
  add(signals, "energy", "elements", "dominant", dominantElement(elementComposition), ["energy-rhythm", "natural-strength"]);
  add(signals, "energy", "natalChart", "modalities", read(root, [["modalities"], ["astrology", "modalities"], ["natalChart", "modalities"]]), ["energy-balance", "energy-rhythm"]);
  // Dominant element → spirituality
  add(signals, "spirituality", "elements", "dominant", elementComposition, ["elements"]);

  // --- Human Design (multi-theme routing) ---
  if (hdValid) {
    add(signals, "energy", "humanDesign", "type", hd.type, ["energy-rhythm"], 1);
    add(signals, "talents", "humanDesign", "type", hd.type, ["natural-strength", "work-style"], 1);
    add(signals, "career", "humanDesign", "type", hd.type, ["work-style"], 1);
    add(signals, "energy", "humanDesign", "authority", hd.authority, ["decision-rhythm"], 1);
    add(signals, "relationships", "humanDesign", "authority", hd.authority, ["decision-rhythm"], 1);
    add(signals, "relationships", "humanDesign", "definition", hd.definition, ["connection-style"], 1);
    add(signals, "relationships", "humanDesign", "profile", hd.profile, ["relationship-pattern", "connection-style"], 1);
    add(signals, "talents", "humanDesign", "profile", hd.profile, ["life-direction", "natural-strength"], 1);
    add(signals, "talents", "humanDesign", "channels", hd.channels || hd.gates, ["natural-strength"], 1);
    add(signals, "career", "humanDesign", "channels", hd.channels || hd.gates, ["natural-strength", "value-creation"], 1);
    add(signals, "career", "humanDesign", "environment", hd.environment, ["ideal-environment", "work-style"], 1);
    add(signals, "career", "humanDesign", "motivation", hd.motivation, ["inner-driver", "work-style"], 1);
    add(signals, "spirituality", "humanDesign", "incarnationCross", read(hd, [["incarnationCross", "name"]]), ["soul-direction"], 1);
    add(signals, "energy", "humanDesign", "authority", hd.authority, ["decision-rhythm", "energy-rhythm"], 1);
    add(signals, "energy", "humanDesign", "motivation", hd.motivation, ["inner-driver", "energy-rhythm"], 1);
    add(signals, "energy", "humanDesign", "openCenters", hd.openCenters, ["energy-balance", "grounding"], 1);
    add(signals, "energy", "humanDesign", "definedCenters", hd.definedCenters || hd.centers, ["energy-balance", "energy-rhythm"], 1);
    add(signals, "energy", "humanDesign", "cognition", hd.cognition, ["perception-mode"], 1);
    add(signals, "energy", "humanDesign", "digestion", hd.digestion, ["learning-mode"], 1);
    add(signals, "shadow", "humanDesign", "notSelfTheme", hd.notSelfTheme, ["inner-child", "recurring-pattern", "growth-edge"], 1);
    add(signals, "shadow", "humanDesign", "openCenters", hd.openCenters, ["inner-child", "emotional-needs", "growth-edge", "energy-balance"], 1);
    add(signals, "career", "humanDesign", "moneyPattern", [hd.motivation, hd.environment, hd.notSelfTheme].filter(Boolean), ["economic-pattern", "growth-edge", "work-style"], 1);
    add(signals, "relationships", "humanDesign", "perspective", hd.perspective, ["connection-style", "worldview"], 1);
    add(signals, "spirituality", "humanDesign", "perspective", hd.perspective, ["worldview", "soul-direction"], 1);
    add(signals, "energy", "humanDesign", "variables", read(hd, [["variables", "advanced", "variable"]]), ["energy-rhythm", "learning-mode"], 1);
    add(signals, "talents", "humanDesign", "variables", read(hd, [["variables", "advanced", "variable"]]), ["natural-strength", "learning-mode"], 1);
  }

  const extensions = record(root.gaiaSources || root.profileSources || root.intelligence);
  for (const [source, value] of Object.entries(extensions)) {
    const sourceRecord = record(value);
    for (const theme of ["shadow", "talents", "energy", "relationships", "career", "spirituality"] as GaiaTheme[]) {
      add(signals, theme, source, theme, sourceRecord[theme], [theme], 0.75);
    }
  }
  return signals;
}
