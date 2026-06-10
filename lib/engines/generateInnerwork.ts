/**
 * BHUMI AMARTYA - Innerwork Generation Engine
 * Generates personalized daily innerwork tasks
 * Based on Life Path, Human Design, Current Energy, and Shadow Patterns
 */

import {
  DailyInnerwork,
  InnerworkTask,
  CoreIdentity,
  AstroEnergyDay,
  AIGenerationContext,
} from "./types";

// Innerwork tasks by Life Path archetype
const innerworkByLifePath: Record<
  number,
  {
    theme: string;
    focusArea: string;
    tasks: Omit<InnerworkTask, "completed">[];
  }
> = {
  1: {
    theme: "Leadership & Surrender",
    focusArea: "Learning to lead by listening",
    tasks: [
      {
        id: "1-journaling",
        task: "Journaling: Apa yang perlu kamu lepaskan untuk bisa mendengarkan?",
        duration: 15,
        category: "journaling",
        emoji: "📝",
        purpose:
          "Leaders often struggle with control. Today is about exploring surrender.",
        instruction:
          "Tulis tanpa filter tentang apa yang takut hilang jika kamu tidak mengontrol.",
      },
      {
        id: "1-grounding",
        task: "Grounding: Berdiri dengan kaki telanjang di tanah selama 5 menit",
        duration: 5,
        category: "grounding",
        emoji: "🌍",
        purpose:
          "Connect to earth energy to balance your fire element leadership.",
        instruction:
          "Berdiri santai, rasakan koneksi dengan bumi. Bayangkan akar dari kakinmu.",
      },
      {
        id: "1-reflection",
        task: "Reflection: Siapa pemimpin yang paling menginspirasimu karena kerendahan hatinya?",
        duration: 10,
        category: "reflection",
        emoji: "✨",
        purpose: "Study leadership styles that come from service, not control.",
        instruction:
          "Think about this person and what makes them different. Feel into their energy.",
      },
    ],
  },
  2: {
    theme: "Receptivity & Inner Partnership",
    focusArea: "Integrating polarity within yourself",
    tasks: [
      {
        id: "2-breathing",
        task: "Breathwork: Alternate nostril breathing (5 minutes)",
        duration: 5,
        category: "breathwork",
        emoji: "🌬️",
        purpose:
          "Balance the two sides of your nervous system. Embrace duality.",
        instruction:
          "Close right nostril, breathe in left. Alternate. 5 full rounds. Feel the harmony.",
      },
      {
        id: "2-journaling",
        task: "Journaling: Apa dua bagian dari diriku yang ingin berdamai?",
        duration: 12,
        category: "journaling",
        emoji: "📝",
        purpose:
          "Type Twos often have internal conflict. Explore the partnership within.",
        instruction: "Write about your inner conversation between these two parts.",
      },
      {
        id: "2-movement",
        task: "Gentle movement: Yin yoga or slow stretching",
        duration: 15,
        category: "movement",
        emoji: "🧘",
        purpose:
          "Allow your body to express both softness and strength together.",
        instruction:
          "Move slowly. Pay attention to both your strength and your flexibility.",
      },
    ],
  },
  3: {
    theme: "Expression & Authenticity",
    focusArea: "Speaking your deepest truth",
    tasks: [
      {
        id: "3-voice",
        task: "Voice work: Hum or sing something that you truly feel",
        duration: 5,
        category: "movement",
        emoji: "🎵",
        purpose:
          "Unlock authentic expression through your throat chakra.",
        instruction:
          "Hum a melody that feels true. Let it be imperfect. Let it be real.",
      },
      {
        id: "3-journaling",
        task: "Journaling: Apa yang ingin dikatakan hatimu, bukan kepala?",
        duration: 15,
        category: "journaling",
        emoji: "📝",
        purpose: "Type Threes often speak from the head. Access the heart.",
        instruction:
          "Write without thinking. Let your hand move before your mind edits.",
      },
      {
        id: "3-connection",
        task: "Connection: Share one true feeling with someone today",
        duration: 10,
        category: "reflection",
        emoji: "💬",
        purpose: "Communicate vulnerability, not just information.",
        instruction:
          "Tell one person something real about how you're feeling. Let it be messy.",
      },
    ],
  },
  4: {
    theme: "Stability & Depth",
    focusArea: "Building foundations that nourish the soul",
    tasks: [
      {
        id: "4-grounding",
        task: "Grounding ritual: Create a small altar or sacred space",
        duration: 10,
        category: "grounding",
        emoji: "🕯️",
        purpose: "Establish physical containers for your spiritual practice.",
        instruction:
          "Gather 3-4 meaningful objects. Arrange them intentionally. Sit with them.",
      },
      {
        id: "4-journaling",
        task: "Journaling: Apa foundation dalam hidupmu yang perlu diperkuat?",
        duration: 15,
        category: "journaling",
        emoji: "📝",
        purpose: "Explore what structures need attention and care.",
        instruction:
          "Be specific. Work, home, relationships, health. What needs building?",
      },
      {
        id: "4-meditation",
        task: "Meditation: Grounding meditation with earth element focus",
        duration: 12,
        category: "meditation",
        emoji: "🌿",
        purpose: "Deepen your connection to what grounds and sustains you.",
        instruction:
          "Visualize roots growing from your body into the earth. Feel stability.",
      },
    ],
  },
  5: {
    theme: "Knowledge & Connection",
    focusArea: "Using wisdom to serve, not isolate",
    tasks: [
      {
        id: "5-learning",
        task: "Learn something that expands your compassion, not just knowledge",
        duration: 15,
        category: "reflection",
        emoji: "📚",
        purpose:
          "Type Fives often accumulate knowledge. Today connect it to heart.",
        instruction:
          "Read or watch something about human experience, not just information.",
      },
      {
        id: "5-connection",
        task: "Journaling: Bagaimana bisa pengetahuanku melayani orang lain hari ini?",
        duration: 10,
        category: "journaling",
        emoji: "📝",
        purpose: "Bridge the gap between knowing and serving.",
        instruction:
          "Think about one person who could benefit from what you know.",
      },
      {
        id: "5-presence",
        task: "Meditation: Presence without seeking or analyzing",
        duration: 10,
        category: "meditation",
        emoji: "🧘",
        purpose:
          "Practice being without doing. Knowing without seeking.",
        instruction:
          "Sit and simply observe. No goal. No understanding needed.",
      },
    ],
  },
  6: {
    theme: "Service & Self-Love",
    focusArea: "Serving yourself with the same devotion",
    tasks: [
      {
        id: "6-self-care",
        task: "Self-care ritual: Treat yourself like someone you deeply care for",
        duration: 15,
        category: "movement",
        emoji: "💆",
        purpose:
          "Type Sixes often forget self. Practice devoted care for yourself.",
        instruction:
          "Bath, massage, skincare. Do it slowly, with intention. You matter.",
      },
      {
        id: "6-journaling",
        task: "Journaling: Bagaimana aku perlu dilayani hari ini?",
        duration: 12,
        category: "journaling",
        emoji: "📝",
        purpose:
          "Allow yourself to have needs. Explore what you truly need.",
        instruction: "Be honest. What would make you feel truly supported?",
      },
      {
        id: "6-boundary",
        task: "Reflection: Practice saying 'no' to one small thing today",
        duration: 5,
        category: "reflection",
        emoji: "✋",
        purpose: "Boundaries are love in action.",
        instruction:
          "Decline something small. Notice how it feels. This is self-love.",
      },
    ],
  },
  7: {
    theme: "Presence & Depth",
    focusArea: "Going deeper instead of wider",
    tasks: [
      {
        id: "7-meditation",
        task: "Deep meditation: Stay with one thing for 15 minutes",
        duration: 15,
        category: "meditation",
        emoji: "🧘",
        purpose:
          "Type Sevens scatter energy. Practice depth over novelty.",
        instruction:
          "Choose one focus. Mantra, breath, sensation. Don't let it wander.",
      },
      {
        id: "7-journaling",
        task: "Journaling: Apa yang ingin dieksplorasi secara mendalam?",
        duration: 15,
        category: "journaling",
        emoji: "📝",
        purpose:
          "Commit to one question. Explore it thoroughly instead of moving on.",
        instruction:
          "Write about this one topic. Go deeper each paragraph. Stay with it.",
      },
      {
        id: "7-presence",
        task: "Grounding: One activity with full presence (tea, walk, meal)",
        duration: 15,
        category: "grounding",
        emoji: "☕",
        purpose: "Experience the richness of singular attention.",
        instruction:
          "Do one thing slowly. Feel every sensation. No multitasking.",
      },
    ],
  },
  8: {
    theme: "Power & Release",
    focusArea: "Understanding true power as letting go",
    tasks: [
      {
        id: "8-journaling",
        task: "Journaling: Apa yang aku coba kontrol yang sebenarnya tidak bisa?",
        duration: 15,
        category: "journaling",
        emoji: "📝",
        purpose:
          "Type Eights need to explore surrender. What can you release?",
        instruction:
          "Write about areas where control is exhausting. Explore letting go.",
      },
      {
        id: "8-breathwork",
        task: "Breathwork: Lion's breath (powerful release breathing)",
        duration: 5,
        category: "breathwork",
        emoji: "🦁",
        purpose: "Channel power into healthy release.",
        instruction:
          "Inhale deep, then exhale forcefully with sound. 5 rounds. Feel the power.",
      },
      {
        id: "8-reflection",
        task: "Reflection: Siapa yang membutuhkan kekuatanmu tanpa kontrol?",
        duration: 10,
        category: "reflection",
        emoji: "✨",
        purpose:
          "Type Eights can be protectors. Explore protecting without controlling.",
        instruction:
          "Think about how your strength can support without dominating.",
      },
    ],
  },
  9: {
    theme: "Choice & Presence",
    focusArea: "Choosing yourself and your path",
    tasks: [
      {
        id: "9-grounding",
        task: "Grounding: Root yourself in your own voice and vision",
        duration: 10,
        category: "grounding",
        emoji: "🌳",
        purpose:
          "Type Nines can disappear into others. Find your center.",
        instruction:
          "Stand. Breathe. Feel your feet. Feel your spine. Feel yourself here.",
      },
      {
        id: "9-journaling",
        task: "Journaling: Apa YANG BENAR-BENAR aku inginkan, tanpa mempertimbangkan orang lain?",
        duration: 20,
        category: "journaling",
        emoji: "📝",
        purpose:
          "Access your true desires beneath the accommodation.",
        instruction:
          "Write wildly. This is just for you. What do YOU want? Say it.",
      },
      {
        id: "9-movement",
        task: "Movement: Dance or move with agency and intention",
        duration: 10,
        category: "movement",
        emoji: "💃",
        purpose: "Embody your own choices through movement.",
        instruction:
          "Move how YOU want. Not what's expected. Make bold choices with your body.",
      },
    ],
  },
};

export function generateInnerwork(context: AIGenerationContext): DailyInnerwork {
  const { coreIdentity } = context;
  const astroContext: AstroEnergyDay =
    context.astroContext ?? {
      currentEnergy: "Unknown",
      description: "",
      emoji: "",
      intensity: "medium",
      recommendation: "",
      affectedAreas: [],
    };
  const lifePath = coreIdentity.lifePath;

  const innerworkTemplate = innerworkByLifePath[lifePath] || innerworkByLifePath[9];

  // Shuffle tasks
  const shuffledTasks = [...innerworkTemplate.tasks].sort(
    () => Math.random() - 0.5
  );

  // Adjust difficulty based on astro energy
  let difficulty: "beginner" | "intermediate" | "advanced" = "intermediate";
  if (astroContext.intensity === "high") {
    difficulty = "beginner"; // Lighter tasks when energy is intense
  } else if (astroContext.intensity === "low") {
    difficulty = "advanced"; // More challenging work when energy is stable
  }

  // Add completed status
  const tasksWithStatus = shuffledTasks.map((task) => ({
    ...task,
    completed: false,
  }));

  // Calculate total duration
  const totalDuration = tasksWithStatus.reduce(
    (sum, task) => sum + task.duration,
    0
  );

  return {
    tasks: tasksWithStatus,
    theme: innerworkTemplate.theme,
    focusArea: innerworkTemplate.focusArea,
    totalDuration,
    difficulty,
  };
}
