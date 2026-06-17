/**
 * Daily Focus Engine
 * Generates daily focus areas personalized by yearly numerology,
 * life path, and spiritual needs for that day
 */

import type { AIGenerationContext } from "@/lib/data/types";
import calculateYearlyNumerology from "@/lib/calculations/calculateYearlyNumerology";

export interface DailyFocusData {
  title: string;
  description: string;
  lifeAreaFocus: string;
  practiceArea: string;
  duration: string;
  keyInsight: string;
}

interface FocusPool {
  practices: string[];
  insights: string[];
  durations: string[];
}

function dayOffset(): number {
  return Number(new Date().toISOString().slice(0, 10).replaceAll("-", ""));
}

const focusByYearlyNumber: Record<number, FocusPool> = {
  1: {
    practices: [
      "stepping into a new decision with courage",
      "claiming your authentic power",
      "starting something you've been postponing",
      "trusting your pioneering instincts",
      "saying yes to a new opportunity"
    ],
    insights: [
      "Independence requires self-trust, not isolation.",
      "Your unique perspective is needed right now.",
      "What you're afraid to start is exactly what's calling.",
      "Leadership begins with self-direction."
    ],
    durations: ["15 minutes of grounding", "30 minutes of strategic planning", "a journaling session"]
  },
  2: {
    practices: [
      "deepening a key relationship through presence",
      "honoring your sensitivity as wisdom",
      "finding harmony between your needs and another's",
      "listening to your intuitive knowing",
      "creating sacred space with someone important"
    ],
    insights: [
      "Your feeling nature is your superpower.",
      "Harmony starts with internal balance.",
      "Intuition whispers; force yells. Listen to whispers.",
      "Connection multiplies joy when rooted in truth."
    ],
    durations: ["20 minutes with a loved one", "a meditation on balance", "reflective dialogue"]
  },
  3: {
    practices: [
      "expressing something you've been holding back",
      "creating or enjoying something joyful",
      "connecting authentically with community",
      "using your voice for what matters",
      "celebrating a small win"
    ],
    insights: [
      "Your words carry more power than you know.",
      "Joy is revolutionary. Choose it.",
      "Community reflects your authenticity back to you.",
      "Creative expression is spiritual practice."
    ],
    durations: ["creative time", "social connection", "a conversation from the heart"]
  },
  4: {
    practices: [
      "organizing something that needs structure",
      "laying a solid foundation for a goal",
      "grounding yourself in physical reality",
      "creating stability where there's chaos",
      "completing something unfinished"
    ],
    insights: [
      "Structure serves; it doesn't confine.",
      "Solid foundations allow dreams to grow.",
      "Discipline is freedom in disguise.",
      "What you build today lasts for years."
    ],
    durations: ["practical action time", "30 minutes organizing", "grounding practice"]
  },
  5: {
    practices: [
      "exploring a new idea or skill",
      "embracing a necessary change",
      "moving your body in new ways",
      "following your curiosity",
      "adapting to what's shifting"
    ],
    insights: [
      "Change is the only constant; dance with it.",
      "Your adaptability is a spiritual gift.",
      "Experience teaches what study cannot.",
      "Freedom lives in flowing, not forcing."
    ],
    durations: ["adventure time", "learning something new", "moving and exploring"]
  },
  6: {
    practices: [
      "serving someone you love",
      "creating beauty in your environment",
      "tending to something that needs care",
      "practicing unconditional compassion",
      "making your home a sanctuary"
    ],
    insights: [
      "Service with love transforms the world.",
      "Beauty nourishes the soul.",
      "You are the healer you've been seeking.",
      "Home is an inside job first."
    ],
    durations: ["acts of service", "creating beauty", "compassionate presence"]
  },
  7: {
    practices: [
      "going inward for deeper truth",
      "questioning what you think you know",
      "spiritual study or contemplation",
      "trusting your inner knowing",
      "seeking solitude for clarity"
    ],
    insights: [
      "Wisdom is your birthright.",
      "Questions reveal more than answers.",
      "Solitude connects you to everything.",
      "Your inner truth is louder than any voice."
    ],
    durations: ["contemplation time", "reading and reflection", "inner inquiry"]
  },
  8: {
    practices: [
      "stepping into your power consciously",
      "manifesting something tangible",
      "taking authority over your life",
      "channeling your ambition wisely",
      "receiving abundance you've earned"
    ],
    insights: [
      "Power is neutral; intention makes it sacred.",
      "Abundance is your birthright.",
      "Manifestation follows clarity of vision.",
      "Success with integrity is the only win."
    ],
    durations: ["visioning and planning", "material action", "conscious manifesting"]
  },
  9: {
    practices: [
      "releasing what no longer serves",
      "honoring completion with gratitude",
      "sharing wisdom you've gathered",
      "forgiving what needs forgiving",
      "preparing for new beginnings"
    ],
    insights: [
      "Completion is sacred. Honor it.",
      "Letting go is an act of love.",
      "Your wisdom is a gift to share.",
      "Endings make space for new beginnings."
    ],
    durations: ["ritual of release", "sharing and teaching", "gratitude practice"]
  },
  11: {
    practices: [
      "receiving intuitive downloads",
      "channeling higher wisdom",
      "teaching what you know",
      "elevating others through your presence",
      "aligning with your higher purpose"
    ],
    insights: [
      "You are an antenna for higher wisdom.",
      "Your light lifts others.",
      "Illumination is a responsibility.",
      "Trust the guidance that comes through you."
    ],
    durations: ["meditation and channeling", "mentoring", "spiritual transmission"]
  },
  22: {
    practices: [
      "creating something of lasting value",
      "transforming vision into reality",
      "building with global or collective impact",
      "mastering your craft",
      "integrating ambition with soul"
    ],
    insights: [
      "Your vision is meant for the world.",
      "Mastery is the path, not the destination.",
      "Build what will outlast you.",
      "Soul purpose and success are one."
    ],
    durations: ["visionary planning", "skilled creation", "large-scale manifestation"]
  },
  33: {
    practices: [
      "offering healing and compassion",
      "teaching transformative wisdom",
      "serving the evolution of consciousness",
      "embodying unconditional love",
      "uplifting others through your presence"
    ],
    insights: [
      "Compassion is your superpower.",
      "Teaching is how you learn.",
      "Love heals everything.",
      "Your presence is medicine."
    ],
    durations: ["healing work", "compassionate teaching", "unconditional service"]
  }
};

export function generateDailyFocus(context: AIGenerationContext): DailyFocusData {
  const yearly = calculateYearlyNumerology(new Date().getFullYear());
  const yearlyNum = yearly.masterNumber ?? yearly.reduction;
  const offset = dayOffset();

  const pool = focusByYearlyNumber[yearlyNum] || focusByYearlyNumber[1];

  const practice = pool.practices[offset % pool.practices.length];
  const insight = pool.insights[offset % pool.insights.length];
  const duration = pool.durations[offset % pool.durations.length];

  const lifeArea = yearly.focusAreas[offset % yearly.focusAreas.length];

  return {
    title: yearly.archetype,
    description: `Today's essence: ${yearly.affirmation}`,
    lifeAreaFocus: lifeArea,
    practiceArea: practice,
    duration,
    keyInsight: insight
  };
}

export default generateDailyFocus;
