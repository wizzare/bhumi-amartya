/**
 * Current canonical Human Design engine version.
 *
 * Bumped when the calculation output can change for identical birth input.
 * `hd-truenode-1` marks the switch from the mean lunar node polynomial
 * (125.04452 - 0.0529538083 * days) to the true/osculating node, which
 * changes gate assignments near node boundaries and can therefore change
 * Type, Authority, Strategy, and Sacral definition.
 */
export const HD_ENGINE_VERSION = 'hd-truenode-1';

const KNOWN_HD_ENGINE_ORDER = ['hd-meannode-0', 'hd-truenode-1'];

export type BlueprintFreshness = 'CURRENT' | 'STALE_CALCULATION' | 'NO_HUMAN_DESIGN';

export type BlueprintStatus = {
  freshness: BlueprintFreshness;
  storedVersion: string | null;
  currentVersion: string;
  stale: boolean;
  reason: string;
};

function readStoredVersion(data: Record<string, any> | null | undefined): string | null {
  if (!data) return null;
  const hd = data.humanDesign || data.human_design || {};
  const candidates = [
    hd.engineVersion,
    hd.calculationVersion,
    hd.version,
    data.humanDesignVersion,
    data.engineVersion,
    data.calculationVersion,
    data.schemaVersion,
  ];
  for (const candidate of candidates) {
    const value = String(candidate || '').trim();
    if (value) return value;
  }
  return null;
}

function hasHumanDesign(data: Record<string, any> | null | undefined): boolean {
  if (!data) return false;
  const hd = data.humanDesign || data.human_design;
  if (!hd) return false;
  if (typeof hd !== 'object') return Boolean(hd);
  return Object.keys(hd).length > 0;
}

function rank(version: string): number {
  const index = KNOWN_HD_ENGINE_ORDER.indexOf(version);
  return index === -1 ? -1 : index;
}

/**
 * Determines whether a persisted blueprint's Human Design section was
 * produced by the current engine. Absent version metadata is treated as
 * STALE, never as CURRENT — no stored blueprint predating versioning can
 * be assumed correct.
 */
export function evaluateBlueprint(
  data: Record<string, any> | null | undefined,
  currentVersion: string = HD_ENGINE_VERSION,
): BlueprintStatus {
  if (!hasHumanDesign(data)) {
    return {
      freshness: 'NO_HUMAN_DESIGN',
      storedVersion: null,
      currentVersion,
      stale: false,
      reason: 'Blueprint has no Human Design section',
    };
  }

  const storedVersion = readStoredVersion(data);

  if (!storedVersion) {
    return {
      freshness: 'STALE_CALCULATION',
      storedVersion: null,
      currentVersion,
      stale: true,
      reason: 'No engine version recorded; predates calculation versioning',
    };
  }

  if (storedVersion === currentVersion) {
    return {
      freshness: 'CURRENT',
      storedVersion,
      currentVersion,
      stale: false,
      reason: 'Generated with current engine',
    };
  }

  const storedRank = rank(storedVersion);
  const currentRank = rank(currentVersion);
  if (storedRank !== -1 && currentRank !== -1 && storedRank > currentRank) {
    return {
      freshness: 'CURRENT',
      storedVersion,
      currentVersion,
      stale: false,
      reason: 'Generated with a newer engine than this dashboard knows',
    };
  }

  return {
    freshness: 'STALE_CALCULATION',
    storedVersion,
    currentVersion,
    stale: true,
    reason: `Generated with ${storedVersion}; current engine is ${currentVersion}`,
  };
}
