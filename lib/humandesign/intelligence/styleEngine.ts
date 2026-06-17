/**
 * BHUMI AMARTYA - Human Design Style Engine
 * Synthesizes all HD intelligence layers into actionable lifestyle styles.
 */

import { Blueprint } from "@/lib/types/blueprint";
import { getChannelDetail } from "./channelIntelligence";
import { getCrossMission } from "./crossIntelligence";
import { getDefinitionStyle } from "./definitionIntelligence";
import { VARIABLE_INTELLIGENCE } from "./variableIntelligence";
import { getCanonicalHumanDesign } from "../hdAudit";

export interface HumanDesignStyle {
  learning: string;
  productivity: string;
  leadership: string;
  creativity: string;
  communication: string;
  relationship: string;
  spiritualArchetype: string;
}

export function calculateHumanDesignStyle(blueprint: Blueprint): HumanDesignStyle {
  const hd = getCanonicalHumanDesign(blueprint.humanDesign) || {};
  const type = hd.type || "";
  const profile = hd.profile || "";
  const variables = VARIABLE_INTELLIGENCE.interpret(hd.variables || null);
  const definition = getDefinitionStyle(hd.definition || null);
  const cross = getCrossMission((hd.incarnationCross as any)?.name || hd.incarnationCross);

  // Channels check
  const channels = (hd.channels || []).map(ch => getChannelDetail(ch)).filter(Boolean);
  const topChannel = channels[0];

  // 1. Learning Style
  let learning = `Melalui ${variables.digestion.learningStyle} dan ${definition.processingStyle.toLowerCase()}.`;
  if (topChannel?.learningStyle) learning += ` Fokus pada ${topChannel.learningStyle.toLowerCase()}.`;

  // 2. Productivity Style
  let productivity = `${hd.strategy || "Ikuti respons tubuh"}. Berdaya di ${variables.environment.idealWork.toLowerCase()}.`;

  // 3. Leadership Style
  let leadership = `Memimpin sebagai ${type}.`;
  if (topChannel?.leadershipStyle) leadership = topChannel.leadershipStyle;

  // 4. Creativity Style
  let creativity = `Mengekspresikan ${cross.lifeTheme.toLowerCase()} melalui tindakan nyata.`;
  if (profile.includes("1")) creativity = "Berbasis riset dan eksplorasi mendalam.";
  if (profile.includes("3")) creativity = "Melalui eksperimen dan trial-error.";

  // 5. Communication Style
  let communication = topChannel?.communicationStyle || "Sesuai dengan otoritas batinmu.";

  // 6. Relationship Style
  let relationship = topChannel?.relationshipStyle || "Saling menghargai keunikan desain masing-masing.";

  // 7. Spiritual Archetype
  let spiritualArchetype = "Pencari Jati Diri";
  if (type === "Projector") spiritualArchetype = "The Guide (Sang Pembimbing)";
  if (type === "Manifestor") spiritualArchetype = "The Initiator (Sang Pemantik)";
  if (type === "Reflector") spiritualArchetype = "The Mirror (Sang Cermin)";

  return {
    learning,
    productivity,
    leadership,
    creativity,
    communication,
    relationship,
    spiritualArchetype
  };
}
