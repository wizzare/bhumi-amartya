import type { JourneyDailyRecord } from "@/lib/types/journeyDailyRecord";

export type JourneyActivityStatus = "completed" | "started" | "skipped" | "available";

export type JourneyActivity = {
  id: string;
  title: string;
  type: string;
  status: JourneyActivityStatus;
  timestamp?: string;
  source: "legacy" | "v4" | "mixed";
  factualResult?: string;
};

export type JourneyDayViewModel = {
  localDate: string;
  sourceTypes: Array<"legacy" | "v4">;
  conditionSummary: string;
  activeContexts: string[];
  activities: JourneyActivity[];
  reflection?: string;
  patterns: string[];
  growthSignals: string[];
  legacyDataPresent: boolean;
  v4DataPresent: boolean;
};

function wellness(record: JourneyDailyRecord): Record<string, any> {
  return (record.wellnessState?.wellnessV4 || {}) as Record<string, any>;
}

function activityIdentity(type: string, id: string, title: string): string {
  return `${type}:${id || title}`.toLowerCase().replace(/\s+/g, "-");
}

export function normalizeJourneyRecord(record: JourneyDailyRecord): JourneyDayViewModel {
  const v4 = wellness(record);
  const recommendations = (v4.recommendations || {}) as Record<string, any>;
  const practices = Array.isArray(v4.practices) ? v4.practices : [];
  const results = Array.isArray(record.practiceResults) ? record.practiceResults : [];
  const legacy = Boolean(record.innerworkCompletion?.actualPracticeId || results.length || record.dailyScanCompleted || record.wellnessState?.enoughnessChecklist);
  const v4Present = Boolean(v4.checkIn || v4.contextSummary || Object.keys(recommendations).length || practices.length);
  const activities = new Map<string, JourneyActivity>();

  for (const [id, item] of Object.entries(recommendations)) {
    const status: JourneyActivityStatus = item.completed ? "completed" : item.skipped ? "skipped" : item.opened ? "started" : "available";
    activities.set(activityIdentity("recommendation", id, item.title || id), {
      id: `recommendation:${id}`,
      title: item.title || id,
      type: `Rekomendasi ${item.period || "hari ini"}`,
      status,
      timestamp: item.completedAt || item.acknowledgedAt || item.displayedAt,
      source: "v4",
    });
  }

  for (const item of practices) {
    const id = String(item.practiceId || item.id || item.practiceTitle || "practice");
    const key = activityIdentity(String(item.practiceType || "practice"), id, String(item.practiceTitle || id));
    const existing = activities.get(key);
    activities.set(key, {
      id: `practice:${id}`,
      title: String(item.practiceTitle || id),
      type: String(item.practiceType || "Praktik"),
      status: item.completed ? "completed" : item.started ? "started" : item.skipped ? "skipped" : "available",
      timestamp: item.completedAt,
      source: existing ? "mixed" : "v4",
      factualResult: item.factualResult || existing?.factualResult,
    });
  }

  for (const item of results) {
    const key = activityIdentity(item.practiceCategory, item.practiceId, item.practiceTitle);
    const existing = activities.get(key);
    if (existing) {
      activities.set(key, { ...existing, source: existing.source === "v4" ? "mixed" : existing.source, timestamp: existing.timestamp || item.completedAt, factualResult: existing.factualResult || item.reflectionResult || item.reflectionResponse });
    } else {
      activities.set(key, {
        id: `practice:${item.practiceId}`,
        title: item.practiceTitle,
        type: item.practiceCategory,
        status: "completed",
        timestamp: item.completedAt,
        source: "legacy",
        factualResult: item.reflectionResult || item.reflectionResponse,
      });
    }
  }

  if (record.innerworkCompletion?.actualPracticeId) {
    const item = record.innerworkCompletion;
    const actualId = item.actualPracticeId || "practice";
    const key = activityIdentity(item.actualPracticeType || "practice", actualId, actualId);
    const existing = activities.get(key);
    if (existing) activities.set(key, { ...existing, source: existing.source === "v4" ? "mixed" : existing.source, factualResult: existing.factualResult || item.reflectionResult || item.reflectionResponse });
  }

  const context = v4.contextSummary || {};
  const patternIds = Array.isArray(v4.patternContext?.activatedPatternIds) ? v4.patternContext.activatedPatternIds.map(String) : [];
  return {
    localDate: record.appDate || record.date,
    sourceTypes: [legacy ? "legacy" : null, v4Present ? "v4" : null].filter((item): item is "legacy" | "v4" => Boolean(item)),
    conditionSummary: context.explanation || context.primaryCondition || record.dailyScanSummary || record.catatanSummary || "Catatan faktual tersedia.",
    activeContexts: [context.activeContext, ...(Array.isArray(v4.checkIn?.lifeSituation) ? v4.checkIn.lifeSituation : [])].filter((item): item is string => Boolean(item)),
    activities: [...activities.values()],
    reflection: record.innerworkCompletion?.reflectionResult || record.innerworkCompletion?.reflectionResponse || record.catatanMainDirection,
    patterns: patternIds,
    growthSignals: [],
    legacyDataPresent: legacy,
    v4DataPresent: v4Present,
  };
}
