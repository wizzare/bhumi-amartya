/**
 * Journaling Prompt Engine
 * Generates psychologically grounded, personalized journaling prompts
 * based on life path, yearly cycle, and current life area focus
 */

import type { JournalingPrompt, AIGenerationContext } from "@/lib/data/types";
import calculateYearlyNumerology from "@/lib/calculations/calculateYearlyNumerology";

interface PromptTemplate {
  mainPrompt: string;
  subPrompts: string[];
  depth: "surface" | "medium" | "deep";
}

const journalPromptsByLifePath: Record<number, PromptTemplate[]> = {
  1: [
    {
      mainPrompt: "Where am I holding back from fully stepping into my power?",
      subPrompts: [
        "What decision am I afraid to make?",
        "Where am I playing small?",
        "What would I do if I trusted myself completely?"
      ],
      depth: "deep"
    },
    {
      mainPrompt: "What new beginning is calling to me?",
      subPrompts: [
        "What have I been wanting to start?",
        "What fears come up when I imagine taking this first step?",
        "What support do I need to move forward?"
      ],
      depth: "medium"
    },
    {
      mainPrompt: "How am I expressing my authentic self in the world?",
      subPrompts: [
        "Where am I being myself?",
        "Where am I adapting to please others?",
        "What parts of me do I keep hidden?"
      ],
      depth: "deep"
    }
  ],
  2: [
    {
      mainPrompt: "What is my intuition telling me right now?",
      subPrompts: [
        "What feeling keeps returning?",
        "What am I sensing beneath the surface?",
        "How can I trust this knowing more?"
      ],
      depth: "deep"
    },
    {
      mainPrompt: "How am I showing up in my relationships?",
      subPrompts: [
        "Where am I giving too much?",
        "Where am I not expressing my needs?",
        "What would healthy balance look like?"
      ],
      depth: "medium"
    },
    {
      mainPrompt: "What needs healing in my heart?",
      subPrompts: [
        "What old hurt is still tender?",
        "Where do I struggle to be vulnerable?",
        "What would self-compassion look like here?"
      ],
      depth: "deep"
    }
  ],
  3: [
    {
      mainPrompt: "What have I been wanting to express but haven't?",
      subPrompts: [
        "What truth am I holding back?",
        "Who needs to hear my voice?",
        "What fears come up around expression?"
      ],
      depth: "deep"
    },
    {
      mainPrompt: "How am I bringing joy into my life?",
      subPrompts: [
        "What makes me feel alive?",
        "Where have I let joy slip away?",
        "How can I weave more lightness into my days?"
      ],
      depth: "medium"
    },
    {
      mainPrompt: "Where am I creating, and where am I just going through the motions?",
      subPrompts: [
        "What activity makes me lose track of time?",
        "Where is my creative energy blocked?",
        "What wants to be created through me?"
      ],
      depth: "deep"
    }
  ],
  4: [
    {
      mainPrompt: "What foundation do I need to build in my life right now?",
      subPrompts: [
        "Where do I feel unstable?",
        "What solid structure would support me?",
        "What am I willing to commit to?"
      ],
      depth: "medium"
    },
    {
      mainPrompt: "Where am I resisting necessary change?",
      subPrompts: [
        "What am I trying to hold onto?",
        "What needs to shift?",
        "What fears underlie this resistance?"
      ],
      depth: "deep"
    },
    {
      mainPrompt: "How am I honoring my commitments to myself?",
      subPrompts: [
        "What promises have I made to myself?",
        "Where am I following through?",
        "Where am I abandoning myself?"
      ],
      depth: "deep"
    }
  ],
  5: [
    {
      mainPrompt: "What experience is calling to me?",
      subPrompts: [
        "What have I been curious about?",
        "What would feel like an adventure?",
        "What am I ready to explore?"
      ],
      depth: "surface"
    },
    {
      mainPrompt: "How am I adapting to the changes in my life?",
      subPrompts: [
        "What is shifting?",
        "How am I resisting vs. flowing?",
        "What wisdom is this change offering?"
      ],
      depth: "medium"
    },
    {
      mainPrompt: "Where have I been settling for less?",
      subPrompts: [
        "What feels stagnant in my life?",
        "What freedom am I craving?",
        "What would a bolder choice look like?"
      ],
      depth: "deep"
    }
  ],
  6: [
    {
      mainPrompt: "Where am I sacrificing my needs for others?",
      subPrompts: [
        "What am I giving without receiving?",
        "Where are my boundaries fuzzy?",
        "What would self-care look like here?"
      ],
      depth: "deep"
    },
    {
      mainPrompt: "How am I creating a sanctuary in my home and life?",
      subPrompts: [
        "What does home feel like to me?",
        "What needs healing or tending?",
        "What beauty can I invite in?"
      ],
      depth: "medium"
    },
    {
      mainPrompt: "What am I being called to heal or serve?",
      subPrompts: [
        "What calls to my compassion?",
        "How can I be of service?",
        "What healing wants to flow through me?"
      ],
      depth: "deep"
    }
  ],
  7: [
    {
      mainPrompt: "What deeper truth am I seeking?",
      subPrompts: [
        "What questions won't leave me alone?",
        "What do I need to understand?",
        "Where is my seeking leading me?"
      ],
      depth: "deep"
    },
    {
      mainPrompt: "How am I honoring my need for solitude?",
      subPrompts: [
        "When do I feel most myself?",
        "How am I protecting my inner space?",
        "What do I discover in silence?"
      ],
      depth: "medium"
    },
    {
      mainPrompt: "Where is my intuition sharper than I'm acknowledging?",
      subPrompts: [
        "What do I know that I haven't admitted?",
        "Where am I overriding my inner knowing?",
        "What would trusting myself look like?"
      ],
      depth: "deep"
    }
  ],
  8: [
    {
      mainPrompt: "What do I want to manifest?",
      subPrompts: [
        "What is the clearest vision I can hold?",
        "What am I willing to work toward?",
        "What deserves my focus and power?"
      ],
      depth: "medium"
    },
    {
      mainPrompt: "How am I using my power consciously?",
      subPrompts: [
        "Where am I overstepping?",
        "Where am I not stepping in?",
        "What happens when I lead from integrity?"
      ],
      depth: "deep"
    },
    {
      mainPrompt: "What beliefs about abundance or power need healing?",
      subPrompts: [
        "What do I believe about money?",
        "What do I believe about my worthiness?",
        "What would abundance with integrity look like?"
      ],
      depth: "deep"
    }
  ],
  9: [
    {
      mainPrompt: "What is calling me to let go?",
      subPrompts: [
        "What is no longer serving me?",
        "What am I ready to release?",
        "What would freedom look like?"
      ],
      depth: "deep"
    },
    {
      mainPrompt: "What wisdom have I gathered?",
      subPrompts: [
        "What have I learned through this cycle?",
        "What do I know now that I didn't before?",
        "How can I share this wisdom?"
      ],
      depth: "medium"
    },
    {
      mainPrompt: "How am I honoring completion?",
      subPrompts: [
        "What chapter is closing?",
        "How can I honor it with gratitude?",
        "What am I making space for next?"
      ],
      depth: "deep"
    }
  ]
};

export function generateJournaling(context: AIGenerationContext): JournalingPrompt {
  if (!context.coreIdentity) {
    return generateDefaultJournaling();
  }

  const yearly = calculateYearlyNumerology(new Date().getFullYear());
  const lifePath = context.coreIdentity.lifePath;

  // Get prompts for this life path
  const prompts = journalPromptsByLifePath[lifePath] || journalPromptsByLifePath[1];
  const template = prompts[Math.floor(Math.random() * prompts.length)];

  // Add yearly numerology theme
  const yearlyFocusArea = yearly.focusAreas[Math.floor(Math.random() * yearly.focusAreas.length)];

  return {
    prompt: template.mainPrompt,
    subPrompts: template.subPrompts,
    theme: yearly.archetype,
    emotionalDepth: template.depth,
    purpose: `Exploring ${yearlyFocusArea} through the lens of your ${yearly.archetype} energy`,
    relatedArea: yearlyFocusArea
  };
}

function generateDefaultJournaling(): JournalingPrompt {
  return {
    prompt: "What is my heart asking me to understand right now?",
    subPrompts: [
      "What feeling keeps returning?",
      "What would shift if I listened to this feeling?",
      "What small action could I take today?"
    ],
    theme: "inner listening",
    emotionalDepth: "medium",
    purpose: "Returning to your inner wisdom",
    relatedArea: "self-awareness"
  };
}

export default generateJournaling;
