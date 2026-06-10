/**
 * Yearly Numerology Calculator
 * Reduces the current year to a single digit (or master number)
 * Used to influence yearly spiritual themes and daily guidance
 * 
 * Example: 2026 → 2+0+2+6 = 10 → 1+0 = 1 (Year of New Beginnings)
 */

export interface YearlyNumerology {
  year: number;
  reduction: number; // Single digit 1-9
  isMasterNumber: boolean;
  masterNumber?: number; // 11, 22, 33, etc. if applicable before final reduction
  archetype: string; // Yearly theme
  affirmation: string;
  focusAreas: string[];
  shadowLessons: string[];
}

function reduceToSingleDigit(num: number): number {
  while (num >= 10) {
    num = Math.floor(num / 10) + (num % 10);
  }
  return num;
}

function checkMasterNumber(num: number): number | null {
  return [11, 22, 33].includes(num) ? num : null;
}

const yearlyThemes: Record<number, Omit<YearlyNumerology, 'year' | 'reduction' | 'isMasterNumber' | 'masterNumber'>> = {
  1: {
    archetype: "The Pioneer",
    affirmation: "I am stepping into my power and creating a new beginning.",
    focusAreas: [
      "new projects and ventures",
      "leadership and independence",
      "trusting your inner wisdom",
      "breaking old patterns",
      "creative self-expression"
    ],
    shadowLessons: [
      "learning to ask for help when needed",
      "balancing ambition with compassion",
      "avoiding impulsive decisions",
      "integrating with your community"
    ]
  },
  2: {
    archetype: "The Diplomat",
    affirmation: "I am building harmony and creating meaningful connections.",
    focusAreas: [
      "partnerships and collaborations",
      "emotional sensitivity and intuition",
      "finding balance in relationships",
      "developing diplomacy skills",
      "deepening spiritual practices"
    ],
    shadowLessons: [
      "standing firm in your own truth",
      "healing codependency patterns",
      "releasing people-pleasing habits",
      "claiming your own power within partnerships"
    ]
  },
  3: {
    archetype: "The Creator",
    affirmation: "I am expressing my authentic truth and bringing joy to the world.",
    focusAreas: [
      "creative expression and communication",
      "social connections and community",
      "joy and optimism",
      "finding your voice",
      "collaborating with others"
    ],
    shadowLessons: [
      "moving beyond superficial connections",
      "developing focus and discipline",
      "healing scattered energy",
      "going deeper into meaningful work"
    ]
  },
  4: {
    archetype: "The Builder",
    affirmation: "I am creating solid foundations and building what will last.",
    focusAreas: [
      "grounding and stability",
      "practical planning and organization",
      "building long-term security",
      "honest self-assessment",
      "creating structure that serves your soul"
    ],
    shadowLessons: [
      "releasing rigidity and control",
      "allowing flexibility and flow",
      "trusting in the unknown",
      "healing feelings of confinement"
    ]
  },
  5: {
    archetype: "The Adventurer",
    affirmation: "I am embracing change and exploring my infinite potential.",
    focusAreas: [
      "freedom and adventure",
      "personal change and transformation",
      "curiosity and learning",
      "adaptability and flexibility",
      "experiencing life fully"
    ],
    shadowLessons: [
      "creating commitment and consistency",
      "healing fear of stagnation",
      "finding depth within change",
      "integrating lessons from experiences"
    ]
  },
  6: {
    archetype: "The Nurturer",
    affirmation: "I am serving with love and creating beauty in my life.",
    focusAreas: [
      "compassion and service",
      "family and home",
      "responsibility with love",
      "healing and wellness",
      "creating beauty around you"
    ],
    shadowLessons: [
      "releasing self-sacrifice",
      "learning healthy boundaries",
      "receiving care from others",
      "trusting others to find their own way"
    ]
  },
  7: {
    archetype: "The Seeker",
    affirmation: "I am diving deep into truth and trusting my inner wisdom.",
    focusAreas: [
      "spiritual awakening and inner work",
      "solitude and reflection",
      "developing intuition",
      "seeking deeper truth",
      "analytical understanding"
    ],
    shadowLessons: [
      "coming out of isolation",
      "trusting others and community",
      "sharing your wisdom",
      "healing overthinking and doubt"
    ]
  },
  8: {
    archetype: "The Empowerer",
    affirmation: "I am stepping into abundance and embodying my full power.",
    focusAreas: [
      "abundance and prosperity",
      "personal power and authority",
      "manifestation and achievement",
      "executive abilities",
      "material and spiritual abundance"
    ],
    shadowLessons: [
      "releasing power struggles",
      "healing money wounds",
      "balancing ambition with soul purpose",
      "using power for the highest good"
    ]
  },
  9: {
    archetype: "The Completion",
    affirmation: "I am releasing what no longer serves and honoring completion.",
    focusAreas: [
      "completion and closure",
      "universal compassion",
      "wisdom from life experience",
      "serving humanity",
      "releasing the old to welcome the new"
    ],
    shadowLessons: [
      "accepting that cycles must end",
      "letting go of attachment",
      "healing from loss and grief",
      "trusting in new beginnings"
    ]
  },
  11: {
    archetype: "The Illuminator (Master)",
    affirmation: "I am channeling light and awakening consciousness.",
    focusAreas: [
      "spiritual illumination",
      "intuitive insights and revelations",
      "channeling higher wisdom",
      "teaching and mentoring",
      "collective healing"
    ],
    shadowLessons: [
      "grounding spiritual insights into action",
      "healing spiritual bypassing",
      "integrating shadow and light",
      "walking the middle path"
    ]
  },
  22: {
    archetype: "The Master Builder (Master)",
    affirmation: "I am manifesting my vision and transforming the world.",
    focusAreas: [
      "large-scale manifestation",
      "transforming vision into reality",
      "building something of lasting value",
      "global or collective impact",
      "visionary leadership"
    ],
    shadowLessons: [
      "releasing perfectionism",
      "trusting the process of creation",
      "healing grandiosity and ego",
      "maintaining balance with ambition"
    ]
  },
  33: {
    archetype: "The Master Teacher (Master)",
    affirmation: "I am embodying compassion and serving the evolution of consciousness.",
    focusAreas: [
      "compassionate leadership",
      "teaching transformative wisdom",
      "healing and helping others",
      "spiritual mastery",
      "unconditional love in service"
    ],
    shadowLessons: [
      "releasing self-sacrifice",
      "honoring your own needs",
      "healing the savior complex",
      "integrating personal joy with service"
    ]
  }
};

export default function calculateYearlyNumerology(year: number = new Date().getFullYear()): YearlyNumerology {
  // Sum the digits of the year
  let sum = 0;
  let temp = year;
  while (temp > 0) {
    sum += temp % 10;
    temp = Math.floor(temp / 10);
  }

  // Check for master number before reduction
  const master = checkMasterNumber(sum);

  // Reduce to single digit
  const reduction = reduceToSingleDigit(sum);

  const theme = yearlyThemes[master ?? reduction];

  return {
    year,
    reduction,
    isMasterNumber: Boolean(master),
    masterNumber: master ?? undefined,
    ...theme
  };
}
