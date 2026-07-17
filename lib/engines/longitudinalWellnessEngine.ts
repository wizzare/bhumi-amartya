import type {
  CapacityTrend,
  CapacityWindow,
  DomainDistribution,
  EmergingHabit,
  EnergyCapacity,
  LongitudinalWellnessDomain,
  LongitudinalWellnessSnapshot,
  ObservationDirection,
  PracticeCandidate,
  PracticeDifficulty,
  PracticeRhythm,
  PracticeVariety,
  WellnessEvent,
  WellnessEventInput,
  WellnessPattern,
} from "@/lib/types/longitudinalWellness";

const DAY_MS = 86_400_000;
const RETENTION_DAYS = 180;
const MAX_EVENTS = 600;
const DOMAINS: LongitudinalWellnessDomain[] = [
  "physical", "breath", "reflection", "nature", "relationship", "mind", "environment",
];

function validDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysAgo(now: Date, timestamp: string): number {
  const date = validDate(timestamp);
  return date ? Math.max(0, Math.floor((now.getTime() - date.getTime()) / DAY_MS)) : Number.MAX_SAFE_INTEGER;
}

function within(events: WellnessEvent[], days: number, now: Date): WellnessEvent[] {
  return events.filter((event) => daysAgo(now, event.timestamp) < days);
}

function preceding(events: WellnessEvent[], days: number, now: Date): WellnessEvent[] {
  return events.filter((event) => {
    const age = daysAgo(now, event.timestamp);
    return age >= days && age < days * 2;
  });
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function direction(recent: number, previous: number, minimum = 2): ObservationDirection {
  if (recent + previous < minimum) return "insufficient-data";
  if (previous === 0 && recent >= minimum) return "emerging";
  if (recent >= previous + Math.max(2, Math.ceil(previous / 2))) return "increasing";
  if (previous >= recent + Math.max(2, Math.ceil(recent / 2))) return "decreasing";
  return "steady";
}

function mapDomain(rawDomain: string, subcategory: string, environment: WellnessEventInput["environment"]): LongitudinalWellnessDomain {
  const signal = `${rawDomain} ${subcategory}`.toLowerCase();
  if (/breath|napas|pranayama/.test(signal)) return "breath";
  if (/journal|reflection|refleksi|spiritual|meditation|meditasi|emotional/.test(signal)) return "reflection";
  if (/nature|alam|garden|forest|sunlight/.test(signal)) return "nature";
  if (/relationship|relasi|community|keluarga|social|group/.test(signal)) return "relationship";
  if (/environment|lingkungan|space|declutter|air-quality/.test(signal)) return "environment";
  if (/mind|focus|cognitive|conscious/.test(signal)) return "mind";
  if (environment === "outdoor") return "nature";
  return "physical";
}

function countBy<T extends string>(values: T[]): Record<T, number> {
  return values.reduce((counts, value) => {
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {} as Record<T, number>);
}

function buildDistribution(events: WellnessEvent[], windowDays: 7 | 30 | 90, now: Date): DomainDistribution {
  const selected = within(events, windowDays, now);
  const counts = countBy(selected.map((event) => event.domain));
  const observedCounts = DOMAINS.map((domain) => counts[domain] || 0).filter((count) => count > 0).sort((a, b) => a - b);
  const midpoint = median(observedCounts) || 0;
  return {
    windowDays,
    domains: DOMAINS.map((domain) => {
      const occurrences = counts[domain] || 0;
      const activeDays = new Set(selected.filter((event) => event.domain === domain).map((event) => event.dateKey)).size;
      const tendency = occurrences === 0
        ? "not-observed" as const
        : occurrences < midpoint
          ? "less-observed" as const
          : occurrences > midpoint
            ? "more-observed" as const
            : "within-usual-range" as const;
      return { domain, occurrences, activeDays, tendency };
    }),
  };
}

function buildPatterns(events: WellnessEvent[], now: Date): WellnessPattern[] {
  const patterns: WellnessPattern[] = [];
  for (const windowDays of [7, 30, 90] as const) {
    const recent = within(events, windowDays, now);
    const previous = preceding(events, windowDays, now);
    for (const domain of DOMAINS) {
      const currentEvents = recent.filter((event) => event.domain === domain);
      const comparisonEvents = previous.filter((event) => event.domain === domain);
      const observedDirection = direction(currentEvents.length, comparisonEvents.length, 3);
      if (observedDirection === "insufficient-data") continue;
      const all = [...currentEvents, ...comparisonEvents].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      patterns.push({
        key: `${windowDays}:domain:${domain}`,
        subject: "domain",
        subjectId: domain,
        windowDays,
        direction: observedDirection,
        evidence: {
          recentCount: currentEvents.length,
          comparisonCount: comparisonEvents.length,
          observedDays: new Set(currentEvents.map((event) => event.dateKey)).size,
          firstObservedAt: all[0]?.timestamp || null,
          lastObservedAt: all.at(-1)?.timestamp || null,
        },
      });
    }
  }
  return patterns;
}

function buildRhythm(events: WellnessEvent[], now: Date): PracticeRhythm {
  const selected = within(events, 30, now);
  const periods = (["morning", "afternoon", "night"] as const).reduce((result, period) => {
    const matches = selected.filter((event) => event.period === period);
    result[period] = { occurrences: matches.length, activeDays: new Set(matches.map((event) => event.dateKey)).size };
    return result;
  }, {} as PracticeRhythm["periods"]);
  const ordered = Object.entries(periods).sort((a, b) => b[1].occurrences - a[1].occurrences);
  const preferredPeriod = ordered[0]?.[1].occurrences >= 2 && ordered[0][1].occurrences > (ordered[1]?.[1].occurrences || 0)
    ? ordered[0][0] as PracticeRhythm["preferredPeriod"]
    : null;
  const shortOccurrences = selected.filter((event) => event.durationMinutes <= 10).length;
  const longerOccurrences = selected.length - shortOccurrences;
  const tendency = selected.length < 3 ? "insufficient-data" : shortOccurrences > longerOccurrences ? "shorter" : longerOccurrences > shortOccurrences ? "longer" : "mixed";
  return { windowDays: 30, periods, preferredPeriod, shortPracticePattern: { thresholdMinutes: 10, shortOccurrences, longerOccurrences, tendency } };
}

function capacityWindow(events: WellnessEvent[], windowDays: 7 | 30 | 90, now: Date): CapacityWindow {
  const selected = within(events, windowDays, now);
  return {
    windowDays,
    eventCount: selected.length,
    medianDurationMinutes: median(selected.map((event) => event.durationMinutes)),
    difficultyOccurrences: countBy(selected.map((event) => event.difficulty)),
    energyCapacityOccurrences: countBy(selected.map((event) => event.energyCapacity)),
  };
}

function weightedMedian(counts: Record<string, number>, order: string[]): number | null {
  const values = order.flatMap((key, index) => Array(counts[key] || 0).fill(index));
  return median(values);
}

function compareCapacity(recent: number | null, longer: number | null): ObservationDirection {
  if (recent === null || longer === null) return "insufficient-data";
  if (recent > longer) return "increasing";
  if (recent < longer) return "decreasing";
  return "steady";
}

function buildCapacity(events: WellnessEvent[], now: Date): CapacityTrend {
  const windows = [capacityWindow(events, 7, now), capacityWindow(events, 30, now), capacityWindow(events, 90, now)] as CapacityTrend["windows"];
  const difficultyOrder: PracticeDifficulty[] = ["unknown", "beginner", "intermediate", "advanced"];
  const energyOrder: EnergyCapacity[] = ["unknown", "low", "medium", "high"];
  return {
    windows,
    durationDirection: compareCapacity(windows[0].medianDurationMinutes, windows[2].medianDurationMinutes),
    difficultyDirection: compareCapacity(weightedMedian(windows[0].difficultyOccurrences, difficultyOrder), weightedMedian(windows[2].difficultyOccurrences, difficultyOrder)),
    energyCapacityDirection: compareCapacity(weightedMedian(windows[0].energyCapacityOccurrences, energyOrder), weightedMedian(windows[2].energyCapacityOccurrences, energyOrder)),
  };
}

function candidate(eventGroup: WellnessEvent[], now: Date): PracticeCandidate {
  const sorted = [...eventGroup].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const latest = sorted.at(-1)!;
  return {
    recommendationId: latest.recommendationId,
    domain: latest.domain,
    lastObservedAt: latest.timestamp,
    daysSinceLastObservation: daysAgo(now, latest.timestamp),
    previousOccurrences: sorted.length,
  };
}

function buildVariety(events: WellnessEvent[], now: Date): PracticeVariety {
  const recent = within(events, 30, now);
  const groups = Map.groupBy(events, (event) => event.recommendationId);
  const recentCounts = countBy(recent.map((event) => event.recommendationId));
  const candidates = [...groups.values()].map((group) => candidate(group, now));
  return {
    windowDays: 30,
    distinctPractices: new Set(recent.map((event) => event.recommendationId)).size,
    distinctDomains: new Set(recent.map((event) => event.domain)).size,
    repeatedPracticeIds: Object.entries(recentCounts).filter(([, count]) => count >= 3).map(([id]) => id),
    revisitCandidates: candidates.filter((item) => item.previousOccurrences >= 2 && item.daysSinceLastObservation >= 14 && item.daysSinceLastObservation < 30).slice(0, 12),
    dormantPractices: candidates.filter((item) => item.daysSinceLastObservation >= 30).slice(0, 12),
  };
}

function buildEmergingHabits(events: WellnessEvent[], now: Date): EmergingHabit[] {
  const recent = within(events, 14, now);
  const previous = preceding(events, 14, now);
  const groups = Map.groupBy(recent, (event) => event.recommendationId);
  return [...groups.entries()].flatMap(([recommendationId, current]) => {
    const priorCount = previous.filter((event) => event.recommendationId === recommendationId).length;
    const activeDays = new Set(current.map((event) => event.dateKey)).size;
    if (current.length < 3 || activeDays < 2 || current.length <= priorCount) return [];
    return [{ recommendationId, domain: current[0].domain, recentOccurrences: current.length, recentActiveDays: activeDays, previousOccurrences: priorCount }];
  });
}

export const longitudinalWellnessEngine = {
  normalizeEvent(input: WellnessEventInput): WellnessEvent {
    const timestamp = validDate(input.timestamp)?.toISOString() || new Date(`${input.dateKey}T12:00:00`).toISOString();
    return {
      ...input,
      eventId: input.eventId || `${input.dateKey}:${input.recommendationId}:${timestamp}`,
      timestamp,
      durationMinutes: Math.max(0, Math.round(input.durationMinutes)),
      period: input.period,
      domain: mapDomain(input.rawDomain, input.subcategory, input.environment),
      difficulty: input.difficulty || "unknown",
      energyCapacity: input.energyCapacity || "unknown",
      environment: input.environment || "unknown",
    };
  },

  retain(events: WellnessEvent[], now = new Date()): WellnessEvent[] {
    return events
      .filter((event) => daysAgo(now, event.timestamp) < RETENTION_DAYS)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .slice(-MAX_EVENTS);
  },

  observe(source: WellnessEvent[], now = new Date()): LongitudinalWellnessSnapshot {
    const events = this.retain(source, now);
    return {
      schemaVersion: "longitudinal-wellness-v1",
      generatedAt: now.toISOString(),
      eventWindow: { retainedEvents: events.length, earliestEventAt: events[0]?.timestamp || null, latestEventAt: events.at(-1)?.timestamp || null },
      patterns: buildPatterns(events, now),
      domainDistribution: [buildDistribution(events, 7, now), buildDistribution(events, 30, now), buildDistribution(events, 90, now)],
      rhythm: buildRhythm(events, now),
      capacityTrend: buildCapacity(events, now),
      variety: buildVariety(events, now),
      emergingHabits: buildEmergingHabits(events, now),
    };
  },
};
