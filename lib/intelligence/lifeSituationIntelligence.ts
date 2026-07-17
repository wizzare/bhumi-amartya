import type { WellnessSnapshot } from "@/lib/data/types";
import type { WellnessDomain } from "@/lib/data/wellnessRecommendationLibrary";

type GuidanceArea = "general" | "mental" | "finance" | "love" | "relational" | "spiritual" | "challenges";
type Signal = {
  domains: Partial<Record<WellnessDomain, number>>;
  keywords: string[];
  guidanceAreas: GuidanceArea[];
  tone: "steady" | "gentle" | "clarifying" | "connecting";
  narrative: string;
};

// Declarative signals keep temporary check-in context separate from identity and diagnosis.
const GROUPS: Array<{ ids: string[]; signal: Signal }> = [
  { ids: ["wf_job_hunting", "wf_job_loss", "wf_economic_strain", "wf_income_drop", "wf_debt_bills", "wf_starting_business", "wf_career_direction"], signal: { domains: { mind: 4, meditation: 2, breath: 2, "conscious-living": 3 }, keywords: ["focus", "clarity", "planning", "grounding", "calm", "simple"], guidanceAreas: ["finance", "mental", "challenges"], tone: "clarifying", narrative: "Ada urusan praktis yang cukup memenuhi pikiranmu hari ini; kejernihan dan langkah yang mudah dikelola dapat lebih membantu." } },
  { ids: ["wf_high_workload", "wf_work_conflict", "fam_child_care", "fam_parent_care", "fam_heavy_responsibility"], signal: { domains: { breath: 4, meditation: 3, physical: 2, mind: 2 }, keywords: ["rest", "boundaries", "overwhelmed", "stress", "calm", "short"], guidanceAreas: ["general", "mental", "challenges"], tone: "gentle", narrative: "Tanggung jawab hari ini tampak mengambil cukup banyak ruang; jeda singkat dan batas yang realistis layak diprioritaskan." } },
  { ids: ["rel_heartbreak", "rel_drifting", "rel_partner_conflict", "rel_divorce", "rel_missing_someone", "emo_sad", "emo_disappointed", "emo_empty"], signal: { domains: { emotional: 5, meditation: 3, breath: 2, spiritual: 2 }, keywords: ["self-compassion", "loving-kindness", "reflection", "connection", "gentle", "healing"], guidanceAreas: ["love", "relational", "general"], tone: "gentle", narrative: "Ada pengalaman relasional atau emosional yang sedang dekat di hati; ruang yang lembut untuk merasakan dan memulihkan diri dapat membantu." } },
  { ids: ["rel_family_conflict", "fam_conflict", "fam_major_transition", "soc_friend_conflict", "soc_community_conflict", "soc_misunderstood"], signal: { domains: { emotional: 4, breath: 3, mind: 2, "conscious-living": 2 }, keywords: ["boundaries", "communication", "reflection", "calm", "connection"], guidanceAreas: ["relational", "challenges", "mental"], tone: "steady", narrative: "Dinamika dengan orang terdekat sedang meminta ruang; menenangkan respons sebelum mencari kejelasan dapat lebih membantu hari ini." } },
  { ids: ["rel_grief_close", "emo_grieving", "soc_social_loss"], signal: { domains: { emotional: 5, meditation: 4, spiritual: 3, breath: 2 }, keywords: ["grief", "self-compassion", "gentle", "rest", "support", "reflection"], guidanceAreas: ["general", "love", "spiritual", "challenges"], tone: "gentle", narrative: "Hari ini ada kehilangan yang mungkin membutuhkan lebih banyak kelembutan, dukungan, dan ruang tanpa tuntutan." } },
  { ids: ["soc_lonely", "soc_trust_issues", "soc_withdrawing"], signal: { domains: { emotional: 3, meditation: 2, "conscious-living": 4 }, keywords: ["connection", "community", "support", "loving-kindness", "trust"], guidanceAreas: ["relational", "love", "general"], tone: "connecting", narrative: "Kebutuhan akan rasa terhubung sedang terasa lebih dekat; dukungan yang aman dan tidak memaksa dapat menemani hari ini." } },
  { ids: ["cog_overthinking", "cog_focus_issues", "cog_decision_paralysis", "cog_life_direction", "cog_worrying", "cog_busy_mind", "emo_anxious", "emo_afraid"], signal: { domains: { mind: 5, breath: 4, meditation: 3 }, keywords: ["focus", "clarity", "grounding", "calm", "breath", "simple"], guidanceAreas: ["mental", "general", "challenges"], tone: "clarifying", narrative: "Pikiranmu tampaknya sedang menampung cukup banyak hal; satu jangkar sederhana dapat membantu menghadirkan kejernihan." } },
  { ids: ["emo_angry"], signal: { domains: { emotional: 4, breath: 4, physical: 2 }, keywords: ["release", "breath", "movement", "grounding", "calm"], guidanceAreas: ["general", "mental", "challenges"], tone: "steady", narrative: "Ada emosi kuat yang sedang bergerak; memberi tubuh ruang untuk menurunkan intensitas dapat membantu sebelum mengambil langkah berikutnya." } },
  { ids: ["spi_reflecting", "spi_seeking_meaning", "spi_disconnected", "spi_seeking_peace", "spi_spiritual_journey"], signal: { domains: { spiritual: 5, meditation: 4, mind: 2, nature: 2 }, keywords: ["meaning", "reflection", "peace", "presence", "nature", "contemplation"], guidanceAreas: ["spiritual", "general", "mental"], tone: "steady", narrative: "Ada kebutuhan untuk kembali pada makna dan ketenangan; refleksi yang membumi dapat menjadi teman hari ini." } },
  { ids: ["rel_falling_love"], signal: { domains: { emotional: 2, "conscious-living": 2, meditation: 1 }, keywords: ["connection", "presence", "gratitude", "reflection"], guidanceAreas: ["love", "relational"], tone: "connecting", narrative: "Ada kehangatan relasional yang sedang hadir; menjalaninya dengan perhatian dan tetap menjaga ritmemu sendiri dapat membantu." } },
];

const BY_ID = new Map(GROUPS.flatMap(({ ids, signal }) => ids.map((id) => [id, signal] as const)));
const MAX_SCORE = 12;

export type LifeSituationContext = {
  activeCount: number;
  domains: Partial<Record<WellnessDomain, number>>;
  keywords: string[];
  guidanceAreas: GuidanceArea[];
  tone: Signal["tone"] | null;
  narrative: string;
};

export function buildLifeSituationContext(ids: unknown): LifeSituationContext {
  const signals = Array.isArray(ids) ? [...new Set(ids)]
    .filter((id): id is string => typeof id === "string" && !id.endsWith("_none"))
    .map((id) => BY_ID.get(id)).filter((value): value is Signal => Boolean(value)) : [];
  const domains: LifeSituationContext["domains"] = {};
  const tones = new Map<Signal["tone"], number>();
  signals.forEach((signal) => {
    (Object.entries(signal.domains) as Array<[WellnessDomain, number]>).forEach(([domain, weight]) => {
      domains[domain] = Math.min(MAX_SCORE, (domains[domain] ?? 0) + weight);
    });
    tones.set(signal.tone, (tones.get(signal.tone) ?? 0) + 1);
  });
  const narratives = [...new Set(signals.map((signal) => signal.narrative))];
  return {
    activeCount: signals.length,
    domains,
    keywords: [...new Set(signals.flatMap((signal) => signal.keywords))],
    guidanceAreas: [...new Set(signals.flatMap((signal) => signal.guidanceAreas))],
    tone: [...tones.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    narrative: narratives.length > 1 ? "Hari ini tampaknya ada beberapa hal yang cukup memenuhi pikiran dan perasaanmu; pilih dukungan yang paling sederhana dan relevan untuk kapasitasmu." : narratives[0] ?? "",
  };
}

export function scoreLifeSituationFit(snapshot: WellnessSnapshot, item: { domain: WellnessDomain; tags: string[]; applicableContexts: string[]; subcategory: string }, suppliedContext?: LifeSituationContext): number {
  const context = suppliedContext ?? buildLifeSituationContext(snapshot.lifeSituation);
  if (!context.activeCount) return 0;
  const searchable = [item.subcategory, ...item.tags, ...item.applicableContexts].join(" ").toLowerCase();
  const keywords = context.keywords.reduce((score, keyword) => score + (searchable.includes(keyword) ? 2 : 0), 0);
  return Math.min(MAX_SCORE, (context.domains[item.domain] ?? 0) + keywords);
}

export function buildRepeatedLifeSituationContext(states: unknown[], minimumDays = 2): LifeSituationContext {
  const daysById = new Map<string, Set<string>>();
  states.forEach((state: any, index) => {
    const date = String(state?.date ?? state?.appDate ?? index);
    const ids = state?.wellnessSnapshot?.lifeSituation;
    if (!Array.isArray(ids)) return;
    new Set(ids).forEach((id) => {
      if (typeof id !== "string" || id.endsWith("_none") || !BY_ID.has(id)) return;
      const days = daysById.get(id) ?? new Set<string>();
      days.add(date);
      daysById.set(id, days);
    });
  });
  return buildLifeSituationContext([...daysById].filter(([, days]) => days.size >= minimumDays).map(([id]) => id));
}
