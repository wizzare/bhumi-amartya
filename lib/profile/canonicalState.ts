export interface CanonicalRevision {
  epoch: string | null;
  revision: number;
}

export type CanonicalAcceptance =
  | { action: "accept"; reason: "initial" | "newer" | "identical" }
  | { action: "ignore"; reason: "older" }
  | { action: "reject"; reason: "epoch-mismatch" }
  | { action: "integrity-error"; reason: "equal-revision-different-data" };

export function compareCanonicalRevision(
  current: CanonicalRevision | null,
  incoming: CanonicalRevision,
  dataEqual: boolean,
): CanonicalAcceptance {
  if (current === null) return { action: "accept", reason: "initial" };
  if (current.epoch !== incoming.epoch) return { action: "reject", reason: "epoch-mismatch" };
  if (incoming.revision > current.revision) return { action: "accept", reason: "newer" };
  if (incoming.revision < current.revision) return { action: "ignore", reason: "older" };
  return dataEqual
    ? { action: "accept", reason: "identical" }
    : { action: "integrity-error", reason: "equal-revision-different-data" };
}

export interface CanonicalStateStore {
  scope(uid: string | null): void;
  currentRevision(): CanonicalRevision | null;
  evaluate(incomingRevision: CanonicalRevision, incomingData: Record<string, unknown> | null): CanonicalAcceptance;
  commit(revision: CanonicalRevision, data: Record<string, unknown> | null): void;
  reset(): void;
}

export function createCanonicalStateStore(): CanonicalStateStore {
  let scopedUid: string | null = null;
  let acceptedRevision: CanonicalRevision | null = null;
  let acceptedData: Record<string, unknown> | null = null;

  return {
    scope(uid: string | null) {
      if (uid !== scopedUid) {
        scopedUid = uid;
        acceptedRevision = null;
        acceptedData = null;
      }
    },
    currentRevision() {
      return acceptedRevision;
    },
    evaluate(incomingRevision: CanonicalRevision, incomingData: Record<string, unknown> | null): CanonicalAcceptance {
      return compareCanonicalRevision(acceptedRevision, incomingRevision, birthDataEqual(acceptedData, incomingData));
    },
    commit(revision: CanonicalRevision, data: Record<string, unknown> | null) {
      acceptedRevision = revision;
      acceptedData = data;
    },
    reset() {
      scopedUid = null;
      acceptedRevision = null;
      acceptedData = null;
    },
  };
}

const BIRTH_DATA_KEYS = ["birthDate", "birthTime", "birthCity", "birthPlace", "birthCountry", "timezone", "latitude", "longitude"];

export function birthDataEqual(a: Record<string, unknown> | null, b: Record<string, unknown> | null): boolean {
  if (!a || !b) return a === b;
  const value = (record: Record<string, unknown>, key: string) =>
    key === "birthPlace" ? record.birthPlace ?? record.cityOfBirth ?? record.birthCity
      : key === "birthCountry" ? record.birthCountry ?? null : record[key];
  return BIRTH_DATA_KEYS.every((key) => value(a, key) === value(b, key));
}

export interface ProfileWithRevision {
  canonicalBirthEpoch?: string | null;
  canonicalBirthRevision?: number;
}

export function revisionOf(profile: ProfileWithRevision | null | undefined): CanonicalRevision | null {
  if (!profile) return null;
  const epoch = profile.canonicalBirthEpoch;
  const revision = profile.canonicalBirthRevision;
  if (typeof epoch !== "string" || !epoch.trim() || !Number.isSafeInteger(revision) || (revision as number) <= 0) return null;
  return { epoch, revision: revision as number };
}
