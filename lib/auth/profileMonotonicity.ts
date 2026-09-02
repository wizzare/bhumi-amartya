import type { UserProfile } from "@/lib/repositories/userRepository";

/**
 * Build 106 new-user lifecycle guard (Master SOT §4.1 / Recovery Matrix new-user gate).
 *
 * `ensureMinimalUserProfile` decides create-vs-reconcile from a profile read that
 * can be many seconds stale: `bootstrapCanonicalAccess` may outlive the
 * AuthContext load timeout, and the user can finish `/setup` in that window. A
 * late-resuming call must never move an already-advanced profile backwards.
 *
 * `guardMonotonicProfilePatch` removes keys from a candidate merge patch that
 * would regress the persisted profile:
 *
 *  - `setupCompleted` / `onboardingCompleted` / `baselineWellnessCompleted`:
 *    once `true` on the server, a patch may not set them back to `false`.
 *  - `blueprintStatus`: once it is anything other than absent / `"missing"`, a
 *    patch may not set it back to `"missing"`.
 *  - birth / identity strings (`birthDate`, `birthTime`, `birthCity`,
 *    `birthPlace`): a non-empty persisted value is not overwritten with `""`.
 *  - nullable identity fields (`latitude`, `longitude`, `timezone`,
 *    `birthCountry`): a non-null persisted value is not overwritten with `null`.
 *
 * A genuine new user (no persisted profile, or persisted fields still absent) is
 * unaffected — the minimal defaults still flow through.
 */

export const MONOTONIC_TRUE_FLAGS = [
  "setupCompleted",
  "onboardingCompleted",
  "baselineWellnessCompleted",
] as const satisfies ReadonlyArray<keyof UserProfile>;

export const MONOTONIC_STRING_IDENTITY_FIELDS = [
  "birthDate",
  "birthTime",
  "birthCity",
  "birthPlace",
] as const satisfies ReadonlyArray<keyof UserProfile>;

export const MONOTONIC_NULLABLE_IDENTITY_FIELDS = [
  "latitude",
  "longitude",
  "timezone",
  "birthCountry",
] as const satisfies ReadonlyArray<keyof UserProfile>;

export function guardMonotonicProfilePatch<T extends Partial<UserProfile>>(
  persisted: Partial<UserProfile> | null | undefined,
  patch: T,
): Partial<T> {
  if (!persisted) return { ...patch };

  const guarded: Record<string, unknown> = { ...patch };
  const dropped: string[] = [];

  for (const flag of MONOTONIC_TRUE_FLAGS) {
    if (persisted[flag] === true && guarded[flag] === false) {
      delete guarded[flag];
      dropped.push(flag);
    }
  }

  if (
    guarded.blueprintStatus === "missing" &&
    typeof persisted.blueprintStatus === "string" &&
    persisted.blueprintStatus !== "missing"
  ) {
    delete guarded.blueprintStatus;
    dropped.push("blueprintStatus");
  }

  for (const field of MONOTONIC_STRING_IDENTITY_FIELDS) {
    const current = persisted[field];
    if (typeof current === "string" && current.trim() !== "" && guarded[field] === "") {
      delete guarded[field];
      dropped.push(field);
    }
  }

  for (const field of MONOTONIC_NULLABLE_IDENTITY_FIELDS) {
    if (persisted[field] != null && guarded[field] === null) {
      delete guarded[field];
      dropped.push(field);
    }
  }

  if (dropped.length > 0) {
    console.warn("[PROFILE MONOTONICITY] dropped regressive patch keys", { dropped });
  }

  return guarded as Partial<T>;
}
