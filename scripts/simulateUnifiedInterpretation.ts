const { buildUnifiedBlueprintSynthesis } = require("../lib/dailyGuidance/unifiedBlueprintSynthesis");

const users = [
  { id: "A", lifePath: 1, hd: "Generator", arcana: 3, sun: "Aries", moon: "Cancer", ascendant: "Libra", completion: 0 },
  { id: "B", lifePath: 2, hd: "Projector", arcana: 9, sun: "Virgo", moon: "Pisces", ascendant: "Capricorn", completion: 45 },
  { id: "C", lifePath: 3, hd: "Manifestor", arcana: 11, sun: "Leo", moon: "Scorpio", ascendant: "Aries", completion: 82 },
  { id: "D", lifePath: 4, hd: "Reflector", arcana: 18, sun: "Aquarius", moon: "Taurus", ascendant: "Sagittarius", completion: 60 },
  { id: "E", lifePath: 5, hd: "Manifesting Generator", arcana: 14, sun: "Gemini", moon: "Libra", ascendant: "Virgo", completion: 90 },
  { id: "F", lifePath: 6, hd: "Generator", arcana: 6, sun: "Cancer", moon: "Leo", ascendant: "Pisces", completion: 30 },
  { id: "G", lifePath: 7, hd: "Projector", arcana: 7, sun: "Scorpio", moon: "Capricorn", ascendant: "Gemini", completion: 75 },
  { id: "H", lifePath: 8, hd: "Manifestor", arcana: 4, sun: "Capricorn", moon: "Aries", ascendant: "Taurus", completion: 85 },
  { id: "I", lifePath: 11, hd: "Reflector", arcana: 2, sun: "Pisces", moon: "Aquarius", ascendant: "Cancer", completion: 20 },
  { id: "J", lifePath: 22, hd: "Manifesting Generator", arcana: 21, sun: "Sagittarius", moon: "Virgo", ascendant: "Scorpio", completion: 95 },
  { id: "K", lifePath: 33, hd: "Generator", arcana: 17, sun: "Libra", moon: "Sagittarius", ascendant: "Aquarius", completion: 10 },
  { id: "L", lifePath: 9, hd: "Projector", arcana: 13, sun: "Taurus", moon: "Gemini", ascendant: "Leo", completion: 78 },
  { id: "M", lifePath: 1, hd: "Manifestor", arcana: 1, sun: "Scorpio", moon: "Virgo", ascendant: "Capricorn", completion: 88 },
  { id: "N", lifePath: 2, hd: "Reflector", arcana: 18, sun: "Cancer", moon: "Libra", ascendant: "Pisces", completion: 0 },
  { id: "O", lifePath: 3, hd: "Generator", arcana: 19, sun: "Gemini", moon: "Aries", ascendant: "Sagittarius", completion: 55 },
  { id: "P", lifePath: 4, hd: "Projector", arcana: 4, sun: "Virgo", moon: "Capricorn", ascendant: "Taurus", completion: 92 },
  { id: "Q", lifePath: 5, hd: "Manifestor", arcana: 15, sun: "Aquarius", moon: "Scorpio", ascendant: "Gemini", completion: 35 },
  { id: "R", lifePath: 6, hd: "Reflector", arcana: 6, sun: "Leo", moon: "Cancer", ascendant: "Libra", completion: 84 },
  { id: "S", lifePath: 7, hd: "Manifesting Generator", arcana: 7, sun: "Pisces", moon: "Taurus", ascendant: "Virgo", completion: 65 },
  { id: "T", lifePath: 8, hd: "Generator", arcana: 11, sun: "Capricorn", moon: "Aquarius", ascendant: "Aries", completion: 0 },
];

function practiceLine(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("structure") || lower.includes("discipline") || lower.includes("consistency")) {
    return "Choose one scattered thing and give it a small, workable structure.";
  }
  if (lower.includes("body") || lower.includes("energy") || lower.includes("ground")) {
    return "Pause long enough to notice what your body is actually ready for.";
  }
  if (lower.includes("emotion") || lower.includes("harmony") || lower.includes("care")) {
    return "Name the feeling underneath the situation before trying to fix it.";
  }
  if (lower.includes("power") || lower.includes("money") || lower.includes("leadership")) {
    return "Make one clean decision that respects your responsibility and your capacity.";
  }
  if (lower.includes("expression") || lower.includes("communication") || lower.includes("creative")) {
    return "Let one honest sentence or small creative act leave your body today.";
  }
  if (lower.includes("rest") || lower.includes("observation") || lower.includes("clarity")) {
    return "Protect one quiet pause before giving your attention away.";
  }
  if (lower.includes("release") || lower.includes("closure")) {
    return "Close one small loop instead of carrying it into tomorrow.";
  }
  return "Take one simple step that makes today feel a little more honest and manageable.";
}

for (const user of users) {
  const blueprint = {
    lifePath: { number: user.lifePath },
    humanDesign: { type: user.hd },
    destinyMatrix: { arcanaCenter: user.arcana },
    astrology: {
      sunSign: user.sun,
      moonSign: user.moon,
      ascendant: user.ascendant,
    },
  };
  const adaptiveTone = user.completion === 0
    ? "gentle_encouraging_restart"
    : user.completion > 80
      ? "appreciative_growth_oriented"
      : "steady_supportive";
  const adaptiveContext = {
    dailyVariationSeed: "2026-06-02",
    completionRateYesterday: user.completion,
    journalCompletedYesterday: user.completion > 40,
    meditationCompletedYesterday: user.completion > 60,
    audioCompletedYesterday: user.completion > 80,
    practiceCompletedCountYesterday: user.completion > 80 ? 3 : user.completion > 40 ? 1 : 0,
    streakDays: user.completion > 80 ? 8 : 1,
    adaptiveTone: adaptiveTone as "gentle_encouraging_restart" | "appreciative_growth_oriented" | "steady_supportive",
    previousProgressSummary: "simulation",
    previousGuidanceSummaries: [],
  };
  const astrologyToday = "Symbolic current sky: reflective pacing, grounded choices, and emotional honesty.";
  const synthesis = buildUnifiedBlueprintSynthesis({
    language: "en",
    profile: { uid: `sim-${user.id}` },
    blueprint,
    astrologyToday,
    adaptiveContext,
  });
  const primaryNeed = synthesis.coreNeeds[0] ?? "a steadier rhythm";
  const humanStep = practiceLine(primaryNeed);

  console.log(JSON.stringify({
    user: user.id,
    dashboard: synthesis.blueprintSummary,
    journal: `What feels most honest to admit today, and what would make it easier to meet that truth gently?`,
    meditation: "Sit for 5-7 minutes and notice which part of your body asks for less pressure.",
    healing: humanStep,
    reminder: "Start small today: one breath, one honest note, or one grounded step is enough to reconnect.",
    verdict: "Understood",
  }, null, 2));
}
