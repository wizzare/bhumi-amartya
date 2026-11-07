export const CANONICAL_BIRTH_FIELDS = [
  "birthDate", "dateOfBirth",
  "birthTime", "timeOfBirth",
  "birthCity", "birthPlace", "cityOfBirth",
  "birthCountry",
  "latitude", "longitude",
  "timezone",
  "canonicalBirthRevision", "canonicalBirthEpoch",
  "canonicalBirthSchemaVersion", "canonicalBirthUpdatedAt",
  "canonicalBirthOperationId",
] as const;

export type CanonicalBirthField = (typeof CANONICAL_BIRTH_FIELDS)[number];

const CANONICAL_BIRTH_FIELD_SET = new Set<string>(CANONICAL_BIRTH_FIELDS);

export function isCanonicalBirthField(key: string): boolean {
  return CANONICAL_BIRTH_FIELD_SET.has(key);
}

export interface CanonicalBirthPayload {
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthPlace: string;
  birthCountry: string | null;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface CanonicalRevision {
  epoch: string | null;
  revision: number;
}

export function extractCanonicalBirth(profile: Record<string, unknown> | null | undefined): CanonicalBirthPayload | null {
  if (!profile) return null;
  const birthDate = (profile.birthDate ?? profile.dateOfBirth) as string | undefined;
  const birthTime = (profile.birthTime ?? profile.timeOfBirth) as string | undefined;
  const birthCity = (profile.birthCity ?? profile.birthPlace ?? profile.cityOfBirth) as string | undefined;
  const birthPlace = (profile.birthPlace ?? profile.cityOfBirth ?? profile.birthCity) as string | undefined;
  const birthCountry = (profile.birthCountry ?? null) as string | null;
  const latitude = profile.latitude as number | undefined;
  const longitude = profile.longitude as number | undefined;
  const timezone = profile.timezone as string | undefined;
  if (!birthDate || !birthTime || !birthCity || !birthPlace || latitude == null || longitude == null || !timezone) return null;
  return { birthDate, birthTime, birthCity, birthPlace, birthCountry, latitude, longitude, timezone };
}

export function extractCanonicalRevision(profile: Record<string, unknown> | null | undefined): CanonicalRevision | null {
  if (!profile) return null;
  const epoch = (profile.canonicalBirthEpoch ?? null) as string | null;
  const revision = (profile.canonicalBirthRevision ?? 0) as number;
  if (!epoch || revision <= 0) return null;
  return { epoch, revision };
}

/**
 * Removes canonical birth fields and server-owned revision metadata from a
 * client-originated write payload. A direct client write of these fields is
 * denied by the candidate Rules; stripping here keeps incidental writers
 * (cache hydration, auth replay, migration, presence) from silently failing.
 */
export function stripCanonicalBirthFields<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !CANONICAL_BIRTH_FIELD_SET.has(key)),
  ) as Partial<T>;
}

export const NESTED_PROFILE_BIRTH_ALIASES = ["blueprintInput", "timezone", "birthCity", "latitude", "longitude"] as const;

/**
 * Removes canonical birth writes from a client payload, including the nested
 * `profile.blueprintInput` / `profile.timezone` / `profile.birthCity` /
 * `profile.latitude` / `profile.longitude` aliases that the candidate Rules
 * also deny. Non-birth keys of the `profile` map are preserved.
 */
export function stripClientBirthWrites<T extends Record<string, unknown>>(data: T): Partial<T> {
  const topLevelStripped = stripCanonicalBirthFields(data);
  const nestedProfile = topLevelStripped.profile;
  if (!nestedProfile || typeof nestedProfile !== "object" || Array.isArray(nestedProfile)) {
    return topLevelStripped;
  }
  const aliasSet = new Set<string>(NESTED_PROFILE_BIRTH_ALIASES);
  const cleanedProfile = Object.fromEntries(
    Object.entries(nestedProfile as Record<string, unknown>).filter(([key]) => !aliasSet.has(key)),
  );
  return { ...topLevelStripped, profile: cleanedProfile } as Partial<T>;
}
export const CANONICAL_SERVER_METADATA_FIELDS = [
  "canonicalBirthRevision",
  "canonicalBirthEpoch",
  "canonicalBirthSchemaVersion",
  "canonicalBirthUpdatedAt",
  "canonicalBirthOperationId",
] as const;

const CANONICAL_SERVER_METADATA_SET = new Set<string>(CANONICAL_SERVER_METADATA_FIELDS);

export function stripCanonicalServerMetadata<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !CANONICAL_SERVER_METADATA_SET.has(key)),
  ) as Partial<T>;
}
