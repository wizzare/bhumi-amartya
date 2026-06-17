import { Blueprint } from "../types/blueprint";
import { UserProfile } from "../repositories/userRepository";

export const buildUserContext = (
  userProfile: UserProfile,
  blueprint: Blueprint | null
): string => {
  if (!blueprint) {
    return `
User Blueprint:
- Status: Awaiting generation. User has not completed setup.
`;
  }

  let context = `
User Profile:
- Name: ${userProfile.fullName}
- Language: ${userProfile.language}

User Blueprint:
- Life Path: ${blueprint.numerology.number} (${blueprint.numerology.role})
- Arcana Center: ${blueprint.destinyMatrix.arcanaCenter}
- Sun Sign: ${blueprint.astrology.sunSign}
`;

  if (blueprint.astrology.calculationStatus !== "completed") {
    context += `- Moon Sign: ${blueprint.astrology.moonSign}\n`;
    context += `- Rising Sign: ${blueprint.astrology.risingSign}\n`;
  }

  const humanDesign = getCanonicalHumanDesign(blueprint.humanDesign);
  if (humanDesign) {
    context += `- Human Design Type: ${humanDesign.type}\n`;
    context += `- Human Design Strategy: ${humanDesign.strategy}\n`;
  } else {
    context += `- Human Design: Pending\n`;
  }

  return context;
};
import { getCanonicalHumanDesign } from "@/lib/humandesign/hdAudit";
