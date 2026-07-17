import type { WellnessSnapshot } from "@/lib/data/types";

export type AkashiPatternId =
  | "money_block"
  | "love_block"
  | "over_responsibility"
  | "emotional_suppression"
  | "overthinking"
  | "grounding_need"
  | "self_sabotage"
  | "available_strength";

export type AkashiWellnessContext = {
  enabled: boolean;
  activatedPatternIds: AkashiPatternId[];
  matchedLifeSituation: string[];
  dominantThemes: string[];
  growthThemes: string[];
  strengthThemes: string[];
  groundingThemes: string[];
  reflectionStyle?: string;
  preferredSymbolicTone?: string;
  sourceVersion?: string;
  generatedAt?: string;
  revision?: string;
  availableStrength?: string;
  recommendedResponse?: string;
};

const PATTERN_LABELS: Record<AkashiPatternId, string> = {
  money_block: "rasa aman dan nilai diri",
  love_block: "rasa aman dalam hubungan",
  over_responsibility: "kecenderungan memikul terlalu banyak",
  emotional_suppression: "ruang untuk mengakui emosi",
  overthinking: "pikiran yang bergerak terlalu penuh",
  grounding_need: "kebutuhan kembali pada hal yang konkret",
  self_sabotage: "langkah kecil yang tidak memaksa diri",
  available_strength: "kekuatan yang sudah tersedia",
};

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function insightText(insight: Record<string, unknown>): string {
  const dataPoints = Array.isArray(insight.dataPoints) ? insight.dataPoints : [];
  return [insight.id, insight.title, insight.summary, insight.effect, insight.guidance, insight.narrative, ...dataPoints.map((point) => {
    const item = record(point);
    return item ? [item.label, item.value, item.meaning, item.effect].map(text).join(" ") : "";
  })].map(text).join(" ").toLowerCase();
}

function readInsights(profile: unknown): Record<string, unknown>[] {
  const root = record(profile);
  const gaia = record(root?.gaiaProfile) || root;
  const sections = record(gaia?.sections);
  if (!sections) return [];
  return Object.values(sections).flatMap((items) => Array.isArray(items) ? items.map(record).filter((item): item is Record<string, unknown> => Boolean(item)) : []);
}

function enabledForProfile(profile: unknown): boolean {
  const root = record(profile);
  const preferences = record(root?.wellnessPreferences) || record(root?.preferences);
  return root?.allowAkashiContext !== false && preferences?.allowAkashiContext !== false;
}

function matchesCurrentCondition(snapshot: WellnessSnapshot, pattern: AkashiPatternId): boolean {
  const situations = Array.isArray(snapshot.lifeSituation) ? snapshot.lifeSituation : [];
  if (pattern === "money_block") return situations.some((id) => /^wf_(economic_strain|income_drop|debt_bills|job_loss|job_hunting)$/.test(id));
  if (pattern === "love_block") return situations.some((id) => /^rel_(partner_conflict|divorce|heartbreak|drifting|missing_someone)$/.test(id));
  if (pattern === "over_responsibility") return situations.some((id) => /^wf_(high_workload|starting_business|work_conflict)$/.test(id)) || situations.some((id) => /^fam_/.test(id));
  if (pattern === "overthinking") return situations.some((id) => /^cog_(overthinking|busy_mind|worrying|decision_paralysis)$/.test(id));
  if (pattern === "emotional_suppression") return situations.some((id) => /^emo_(sad|empty|disappointed|angry|grieving)$/.test(id));
  if (pattern === "grounding_need") return (snapshot.metrics?.energy ?? 5) <= 4 || (snapshot.metrics?.focus ?? 5) <= 4;
  if (pattern === "self_sabotage") return (snapshot.metrics?.energy ?? 5) <= 4 || snapshot.healthCondition === "berat" || snapshot.healthCondition === "sedang";
  return true;
}

function patternForInsight(insight: Record<string, unknown>): AkashiPatternId[] {
  const value = insightText(insight);
  const patterns: AkashiPatternId[] = [];
  if (/moneyblock|economic-pattern|scarcity|nilai dan sumber daya/.test(value)) patterns.push("money_block");
  if (/loveblock|relationship-pattern|abandonment|attachment|rasa aman.*hubungan/.test(value)) patterns.push("love_block");
  if (/overrespons|over-respons|people.?pleasing|memikul terlalu banyak/.test(value)) patterns.push("over_responsibility");
  if (/emotional.?suppression|menahan emosi|emotional-needs/.test(value)) patterns.push("emotional_suppression");
  if (/overthinking|busy.?mind|pikiran.*penuh/.test(value)) patterns.push("overthinking");
  if (/grounding|energy-balance|kembali membumi/.test(value)) patterns.push("grounding_need");
  if (/self.?sabotage|avoidance|growth-edge/.test(value)) patterns.push("self_sabotage");
  if (/natural-strength|corestrength|kekuatan utama|available strength/.test(value)) patterns.push("available_strength");
  return Array.from(new Set(patterns));
}

export function buildAkashiWellnessContext(profile: unknown, snapshot: WellnessSnapshot): AkashiWellnessContext {
  if (!enabledForProfile(profile)) return { enabled: false, activatedPatternIds: [], matchedLifeSituation: [], dominantThemes: [], growthThemes: [], strengthThemes: [], groundingThemes: [] };
  const insights = readInsights(profile);
  const activated = new Set<AkashiPatternId>();
  const dominantThemes: string[] = [];
  const growthThemes: string[] = [];
  const strengthThemes: string[] = [];
  const groundingThemes: string[] = [];
  for (const insight of insights) {
    const patterns = patternForInsight(insight);
    for (const pattern of patterns) {
      const matched = matchesCurrentCondition(snapshot, pattern);
      if (matched) activated.add(pattern);
      const label = PATTERN_LABELS[pattern];
      const target = pattern === "available_strength" ? strengthThemes : pattern === "grounding_need" ? groundingThemes : /growth|strength|talent/i.test(insightText(insight)) ? growthThemes : dominantThemes;
      if ((matched || pattern === "available_strength") && !target.includes(label)) target.push(label);
    }
  }
  const matchedLifeSituation = Array.isArray(snapshot.lifeSituation) ? snapshot.lifeSituation.filter((id): id is string => typeof id === "string" && !id.endsWith("_none")) : [];
  const activatedPatternIds = Array.from(activated);
  const root = record(profile);
  const gaia = record(root?.gaiaProfile) || root;
  const generatedAt = text(gaia?.updatedAt) || text(gaia?.generatedAt);
  const sourceVersion = text(gaia?.profileVersion) || text(gaia?.engineVersion) || "gaia-v1";
  return {
    enabled: true,
    activatedPatternIds,
    matchedLifeSituation,
    dominantThemes: dominantThemes.slice(0, 4),
    growthThemes: growthThemes.slice(0, 3),
    strengthThemes: strengthThemes.slice(0, 3),
    groundingThemes: groundingThemes.slice(0, 3),
    reflectionStyle: "refleksi praktis dan bertahap",
    preferredSymbolicTone: "simbolik dan tentatif",
    sourceVersion,
    generatedAt,
    revision: `${sourceVersion}:${generatedAt}:${activatedPatternIds.join(",")}`,
    availableStrength: strengthThemes[0],
    recommendedResponse: activatedPatternIds.length ? "Jeda sejenak, kenali pola yang mungkin tersentuh, lalu pilih satu langkah praktis." : undefined,
  };
}
