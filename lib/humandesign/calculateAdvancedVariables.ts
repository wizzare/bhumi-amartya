const DETERMINATION_MAP: Record<number, string> = {
  1: "Appetite",
  2: "Taste",
  3: "Thirst",
  4: "Touch",
  5: "Sound",
  6: "Light"
};

const DETERMINATION_LEFT_VARIANT: Record<number, string> = {
  1: "Consecutive",
  2: "Open",
  3: "Hot",
  4: "Calm",
  5: "High",
  6: "Direct"
};

const DETERMINATION_RIGHT_VARIANT: Record<number, string> = {
  1: "Alternating",
  2: "Closed",
  3: "Cold",
  4: "Nervous",
  5: "Low",
  6: "Indirect"
};

const ENVIRONMENT_MAP: Record<number, string> = {
  1: "Caves",
  2: "Markets",
  3: "Kitchens",
  4: "Mountains",
  5: "Valleys",
  6: "Shores"
};

const ENVIRONMENT_LEFT_VARIANT: Record<number, string> = {
  1: "Selective",
  2: "Internal",
  3: "Wet",
  4: "Active",
  5: "Narrow",
  6: "Natural"
};

const ENVIRONMENT_RIGHT_VARIANT: Record<number, string> = {
  1: "Blending",
  2: "External",
  3: "Dry",
  4: "Passive",
  5: "Wide",
  6: "Artificial"
};

const MOTIVATION_MAP: Record<number, string> = {
  1: "Fear",
  2: "Hope",
  3: "Desire",
  4: "Need",
  5: "Guilt",
  6: "Innocence"
};

const PERSPECTIVE_MAP: Record<number, string> = {
  1: "Survival",
  2: "Possibility",
  3: "Power",
  4: "Wanting",
  5: "Probability",
  6: "Personal"
};

const COGNITION_MAP: Record<number, string> = {
  1: "Smell",
  2: "Taste",
  3: "Outer Vision",
  4: "Inner Vision",
  5: "Feeling",
  6: "Touch"
};

export interface RawGate {
  planet: string;
  gate: number;
  line: number;
  color: number;
  tone: number;
  base: number;
}

export interface DiagnosticPayload {
  raw_personality_gates: RawGate[];
  raw_design_gates: RawGate[];
}

export interface AdvancedVariables {
  digestion: string;
  digestionVariant: string;
  environment: string;
  environmentVariant: string;
  cognition: string;
  motivation: string;
  perspective: string;
  variable: string;
}

export function calculateAdvancedVariables(diagnostic: DiagnosticPayload | null): AdvancedVariables | null {
  if (!diagnostic || !diagnostic.raw_personality_gates || !diagnostic.raw_design_gates) {
    return null;
  }

  const pSun = diagnostic.raw_personality_gates.find(g => g.planet === "Sun");
  const pNode = diagnostic.raw_personality_gates.find(g => g.planet === "South_Node" || g.planet === "North_Node");
  const dSun = diagnostic.raw_design_gates.find(g => g.planet === "Sun");
  const dNode = diagnostic.raw_design_gates.find(g => g.planet === "South_Node" || g.planet === "North_Node");

  if (!pSun || !pNode || !dSun || !dNode) {
    return null;
  }

  const isLeft = (tone: number) => tone <= 3;

  // Variables (Arrows)
  const topLeft = isLeft(dSun.tone) ? "L" : "R";
  const bottomLeft = isLeft(dNode.tone) ? "L" : "R";
  const topRight = isLeft(pSun.tone) ? "L" : "R";
  const bottomRight = isLeft(pNode.tone) ? "L" : "R";

  const variableCode = `P${topRight}${bottomRight} D${topLeft}${bottomLeft}`;

  // Digestion (Determination) - Design Sun
  const digestionBase = DETERMINATION_MAP[dSun.color] || "Unknown";
  const digestionVariant = isLeft(dSun.tone) 
    ? DETERMINATION_LEFT_VARIANT[dSun.color] || ""
    : DETERMINATION_RIGHT_VARIANT[dSun.color] || "";
    
  // Environment - Design Nodes
  const environmentBase = ENVIRONMENT_MAP[dNode.color] || "Unknown";
  const environmentVariant = isLeft(dNode.tone)
    ? ENVIRONMENT_LEFT_VARIANT[dNode.color] || ""
    : ENVIRONMENT_RIGHT_VARIANT[dNode.color] || "";

  // Motivation - Personality Sun
  const motivationBase = MOTIVATION_MAP[pSun.color] || "Unknown";

  // Perspective - Personality Nodes
  const perspectiveBase = PERSPECTIVE_MAP[pNode.color] || "Unknown";

  // Cognition - Design Sun Tone
  const cognitionBase = COGNITION_MAP[dSun.tone] || "Unknown";

  return {
    digestion: digestionBase,
    digestionVariant,
    environment: environmentBase,
    environmentVariant,
    cognition: cognitionBase,
    motivation: motivationBase,
    perspective: perspectiveBase,
    variable: variableCode
  };
}
