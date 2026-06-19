import { calculateAdvancedVariables } from "../lib/humandesign/calculateAdvancedVariables";

const raw = {
  diagnostic: {
    raw_personality_gates: {
      "1": { color: 2, tone: 2, base: 3 }, // Personality Sun (Motivation)
      "2": { color: 6, tone: 1, base: 2 }  // Personality Node (Perspective)
    },
    raw_design_gates: {
      "1": { color: 3, tone: 1, base: 2 }, // Design Sun (Digestion/Cognition)
      "2": { color: 1, tone: 6, base: 1 }  // Design Node (Environment)
    }
  }
};

const vars = calculateAdvancedVariables(raw.diagnostic as any);
console.log(JSON.stringify(vars, null, 2));
