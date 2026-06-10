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

  if (blueprint.humanDesign.status === "ready" || blueprint.humanDesign.status === "verified") {
    context += `- Human Design Type: ${blueprint.humanDesign.type}\n`;
    context += `- Human Design Strategy: ${blueprint.humanDesign.strategy}\n`;
  } else {
    context += `- Human Design: Pending\n`;
  }

  return context;
};
