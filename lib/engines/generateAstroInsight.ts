/**
 * BHUMI AMARTYA - Astro Insight Generation Engine
 * Generates personalized astro energy insights
 * Based on current planetary positions and their psychological impact
 */

import {
  AstroEnergyDay,
  CoreIdentity,
  AIGenerationContext,
} from "./types";

// Planetary energies and their impacts
interface PlanetaryInfluence {
  planet: string;
  emoji: string;
  intensity: "low" | "medium" | "high";
  description: string;
  recommendation: string;
  affectedAreas: string[];
  psychologicalImpact: string;
}

const planetaryInfluences: PlanetaryInfluence[] = [
  {
    planet: "Mercury Pre-Retrograde",
    emoji: "🪐",
    intensity: "high",
    description:
      "Komunikasi sedang memperlambat diri. Emosi lebih sensitif terhadap kata-kata. Miscommunication lebih mungkin.",
    recommendation:
      "Pilih kata-kata dengan hati-hati. Dengarkan lebih dari berbicara. Review komunikasi sebelum sending.",
    affectedAreas: ["communication", "relationships", "clarity"],
    psychologicalImpact:
      "Intuisi naik, analytical mind melambat. Dengarkan lebih pada gut feeling.",
  },
  {
    planet: "Mercury Retrograde",
    emoji: "🔄",
    intensity: "high",
    description:
      "Refleksi dan revisit masa lalu. Timing untuk forward action tidak ideal. Clarity sedang dicari.",
    recommendation:
      "Gunakan waktu ini untuk review, editing, introspection. Jangan launch hal baru. Revise yang existing.",
    affectedAreas: ["communication", "technology", "contracts"],
    psychologicalImpact:
      "Deep introspection mungkin. Old patterns muncul untuk dilihat dan healing.",
  },
  {
    planet: "Venus Direct",
    emoji: "💫",
    intensity: "low",
    description:
      "Energi cinta dan kepuasan mengalir dengan smooth. Relationships terasa ringan. Creativity meningkat.",
    recommendation:
      "Sempurna untuk connecting dengan people yang matter. Express appreciation. Enjoy sensory pleasures.",
    affectedAreas: ["relationships", "creativity", "abundance"],
    psychologicalImpact:
      "Hati terbuka. Easier untuk receive dan give love. Self-worth terasa stable.",
  },
  {
    planet: "Venus Retrograde",
    emoji: "🔄💫",
    intensity: "medium",
    description:
      "Review terhadap values dan relationships. Apa yang benar-benar matters untuk kamu? Renegotiate boundaries.",
    recommendation:
      "Reflect pada relationships existing. Apa yang perlu healed? Renegotiate values dengan diri sendiri.",
    affectedAreas: ["relationships", "finances", "self-worth"],
    psychologicalImpact:
      "Deeper understanding tentang apa yang kamu value dalam cinta dan resource. Authenticity matters.",
  },
  {
    planet: "Mars Direct",
    emoji: "🔥",
    intensity: "medium",
    description:
      "Aksi dan passion mengalir forward. Motivation tinggi. Good time untuk pursue goals dengan focus.",
    recommendation:
      "Channel energi untuk action aligned dengan values. Pursue apa yang exciting untuk kamu.",
    affectedAreas: ["action", "passion", "sexuality", "achievement"],
    psychologicalImpact:
      "Will power meningkat. Confidence dalam taking action. Sexual energy vibrant.",
  },
  {
    planet: "Mars Retrograde",
    emoji: "🔄🔥",
    intensity: "medium",
    description:
      "Energi internal, bukan external action. Good time untuk strategy dan planning sebelum action.",
    recommendation:
      "Focus pada internal preparation. Delay major launches. Plan dan prepare dengan detail.",
    affectedAreas: ["action", "motivation", "assertion"],
    psychologicalImpact:
      "Energy internal. Dapat feel frustrated jika try external action. Good untuk strategic thinking.",
  },
  {
    planet: "Jupiter Expansion",
    emoji: "🌟",
    intensity: "low",
    description:
      "Growth dan ekspansi. Opportunities datang. Optimisme natural. Good for new beginnings.",
    recommendation:
      "Say yes kepada opportunities. Expand vision. Invest dalam growth dan learning.",
    affectedAreas: ["growth", "opportunities", "abundance"],
    psychologicalImpact:
      "Optimism alami. Self-belief meningkat. Confidence dalam abundance.",
  },
  {
    planet: "Saturn Challenge",
    emoji: "⛓️",
    intensity: "high",
    description:
      "Tes dan boundary-setting. Structure apa dalam dirimu yang perlu strengthening? Maturity dipinta.",
    recommendation:
      "Do the work. Strengthen foundations. Accept limitations sebagai teachers, bukan frustrations.",
    affectedAreas: ["structure", "responsibility", "maturity"],
    psychologicalImpact:
      "Ini waktu untuk grow up emotionally dan spiritually. Patience dan discipline diminta.",
  },
  {
    planet: "Full Moon",
    emoji: "🌕",
    intensity: "high",
    description:
      "Illumination dan culmination. Apa yang telah datang ke full awareness? Climax dan release.",
    recommendation:
      "Release apa yang tidak lagi serve. Celebrate completions. Journal tentang insights yang illuminate.",
    affectedAreas: ["clarity", "emotion", "release"],
    psychologicalImpact:
      "Emotional peak. Subconscious datang ke surface. Clarity tentang direction.",
  },
  {
    planet: "New Moon",
    emoji: "🌑",
    intensity: "medium",
    description:
      "Fresh start dan intention-setting. Sesuatu baru sedang mulai. Darkness adalah canvas.",
    recommendation:
      "Set intentions. Plant seeds untuk apa yang ingin grow. Quiet reflection tentang desires.",
    affectedAreas: ["new beginnings", "manifestation", "intention"],
    psychologicalImpact:
      "Inner reset. Quiet power. Good time untuk go inward dan set clear direction.",
  },
];

// Retrofit untuk zodiac signs
const zodiacPsychology: Record<
  string,
  { element: string; modality: string; psychologicalTheme: string }
> = {
  Aries: {
    element: "Fire",
    modality: "Cardinal",
    psychologicalTheme: "Courage vs. Recklessness. Initiation vs. Impulsivity.",
  },
  Taurus: {
    element: "Earth",
    modality: "Fixed",
    psychologicalTheme: "Stability vs. Stubbornness. Loyalty vs. Possessiveness.",
  },
  Gemini: {
    element: "Air",
    modality: "Mutable",
    psychologicalTheme: "Curiosity vs. Superficiality. Communication vs. Gossip.",
  },
  Cancer: {
    element: "Water",
    modality: "Cardinal",
    psychologicalTheme: "Nurturing vs. Clinginess. Sensitivity vs. Moodiness.",
  },
  Leo: {
    element: "Fire",
    modality: "Fixed",
    psychologicalTheme: "Creativity vs. Drama. Generosity vs. Egoism.",
  },
  Virgo: {
    element: "Earth",
    modality: "Mutable",
    psychologicalTheme: "Service vs. Criticism. Discernment vs. Perfectionism.",
  },
  Libra: {
    element: "Air",
    modality: "Cardinal",
    psychologicalTheme: "Balance vs. Indecision. Harmony vs. Avoidance.",
  },
  Scorpio: {
    element: "Water",
    modality: "Fixed",
    psychologicalTheme: "Transformation vs. Control. Depth vs. Manipulation.",
  },
  Sagittarius: {
    element: "Fire",
    modality: "Mutable",
    psychologicalTheme: "Truth-seeking vs. Preaching. Adventure vs. Restlessness.",
  },
  Capricorn: {
    element: "Earth",
    modality: "Cardinal",
    psychologicalTheme: "Responsibility vs. Rigidity. Ambition vs. Cold-heartedness.",
  },
  Aquarius: {
    element: "Air",
    modality: "Fixed",
    psychologicalTheme: "Innovation vs. Detachment. Humanitarianism vs. Aloofness.",
  },
  Pisces: {
    element: "Water",
    modality: "Mutable",
    psychologicalTheme: "Compassion vs. Escapism. Mysticism vs. Delusion.",
  },
};

export function generateAstroInsight(
  context: AIGenerationContext
): AstroEnergyDay {
  const { coreIdentity } = context;

  // Select random planetary influence (in real app, use actual transit data)
  const selectedInfluence =
    planetaryInfluences[
      Math.floor(Math.random() * planetaryInfluences.length)
    ];

  // Get zodiac psychology for additional context
  const sunSignPsych = zodiacPsychology[coreIdentity.sunSign];

  // Determine if retrograde (demo)
  const isRetrograde =
    selectedInfluence.planet.includes("Retrograde") ||
    selectedInfluence.planet.includes("Pre-Retrograde");

  // Create composite astro insight
  const astroInsight: AstroEnergyDay = {
    currentEnergy: selectedInfluence.planet,
    description: selectedInfluence.description,
    emoji: selectedInfluence.emoji,
    intensity: selectedInfluence.intensity,
    recommendation: selectedInfluence.recommendation,
    affectedAreas: selectedInfluence.affectedAreas,
    retrogradeStatus: isRetrograde
      ? {
          planet: selectedInfluence.planet.replace(" Pre-Retrograde", "").replace(" Retrograde", ""),
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          impact: selectedInfluence.psychologicalImpact,
        }
      : undefined,
  };

  return astroInsight;
}

/**
 * Helper function to get personalized astro interpretation
 * based on user's sun sign and current planetary energy
 */
export function interpretAstroForUser(
  sunSign: string,
  currentEnergy: string
): string {
  const sunPsych = zodiacPsychology[sunSign];

  if (!sunPsych) return currentEnergy;

  return `${sunSign} (${sunPsych.element} sign) experiencing ${currentEnergy}. 
Theme for today: ${sunPsych.psychologicalTheme}. 
Focus on the positive shadow—channel your strength, not your shadow.`;
}
