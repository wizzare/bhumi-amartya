type RecommendationInput = {
  dominantTheme?: string | null;
  journeyStage?: string | null;
  weeklyReportTheme?: string | null;
};

export type WorkshopRecommendation = {
  title: string;
  reason: string;
};

const WORKSHOP_LIBRARY: WorkshopRecommendation[] = [
  {
    title: "Inner Child Journey",
    reason: "Cocok untuk fase ketika pola luka lama dan kebutuhan didengar mulai muncul lebih jelas.",
  },
  {
    title: "Money Block Healing",
    reason: "Relevan ketika tema rasa aman, menerima, dan relasi dengan finansial muncul berulang.",
  },
  {
    title: "Love Block Healing",
    reason: "Mendukung proses membuka hati dan mengenali pola proteksi dalam relasi.",
  },
  {
    title: "Karma Leluhur",
    reason: "Membantu saat pola keluarga, warisan emosi, atau tema leluhur terasa dominan.",
  },
];

function normalize(value?: string | null): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function getWorkshopRecommendations(input: RecommendationInput): WorkshopRecommendation[] {
  const theme = normalize(input.dominantTheme || input.weeklyReportTheme);
  const stage = normalize(input.journeyStage);

  if (theme.includes("inner child") || theme.includes("family") || theme.includes("wounds")) {
    return [WORKSHOP_LIBRARY[0], WORKSHOP_LIBRARY[3]];
  }

  if (theme.includes("money") || theme.includes("worth") || theme.includes("responsibility")) {
    return [WORKSHOP_LIBRARY[1], WORKSHOP_LIBRARY[0]];
  }

  if (theme.includes("love") || theme.includes("rejection") || theme.includes("emotional")) {
    return [WORKSHOP_LIBRARY[2], WORKSHOP_LIBRARY[0]];
  }

  if (theme.includes("ancestral") || theme.includes("leluhur")) {
    return [WORKSHOP_LIBRARY[3], WORKSHOP_LIBRARY[0]];
  }

  if (stage === "awareness" || stage === "acceptance") {
    return [WORKSHOP_LIBRARY[0], WORKSHOP_LIBRARY[2]];
  }

  if (stage === "release" || stage === "rebuilding") {
    return [WORKSHOP_LIBRARY[3], WORKSHOP_LIBRARY[1]];
  }

  return [WORKSHOP_LIBRARY[0], WORKSHOP_LIBRARY[1]];
}
