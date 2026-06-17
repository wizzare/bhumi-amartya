import { blueprintRepository } from "@/lib/repositories/blueprintRepository";
import { userRepository, type UserProfile } from "@/lib/repositories/userRepository";
import { storageProvider } from "@/lib/storage/storageProvider";
import { synthesizeGaiaProfile } from "./synthesisEngine";
import { GAIA_ENGINE_VERSION, GAIA_MIGRATION_VERSION, GAIA_PROFILE_VERSION } from "./types";
import { isCompleteGaiaWarehouse } from "./validation";
import { getRuntimeBuildInfo } from "@/lib/config/buildInfo";

const DERIVED_CACHE_NAMES = [
  "bhumiCompiledInnerwork", "bhumiProfileEcho", "bhumiDailyShareCard", "bhumiUserBlueprint",
  "bhumiBlueprint", "bhumiUserProfile", "bhumiUserPlan",
];

export function needsGaiaMigration(profile?: Partial<UserProfile> | null): boolean {
  return profile?.profileVersion !== GAIA_PROFILE_VERSION
    || profile?.engineVersion !== GAIA_ENGINE_VERSION
    || profile?.migrationVersion !== GAIA_MIGRATION_VERSION
    || !isCompleteGaiaWarehouse(profile?.gaiaProfile);
}

function invalidateLegacyGaiaCaches(uid: string) {
  if (typeof window === "undefined") return;
  const exactKeys = new Set([...DERIVED_CACHE_NAMES, ...DERIVED_CACHE_NAMES.map((key) => `${key}:${uid}`)]);
  const keys: string[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key && (exactKeys.has(key) || (key.includes(uid) && /narrative|echo|compiled|sharecard/i.test(key)))) keys.push(key);
  }
  keys.forEach((key) => window.localStorage.removeItem(key));
}

export async function migrateUserToGaia(profile: UserProfile): Promise<UserProfile> {
  if (!needsGaiaMigration(profile)) return profile;
  const blueprint = await blueprintRepository.getUserBlueprint(profile.uid);
  if (!blueprint) throw new Error("Gaia migration requires a persisted blueprint.");

  const gaiaProfile = synthesizeGaiaProfile(blueprint);
  const buildInfo = await getRuntimeBuildInfo();
  const payload: Partial<UserProfile> = {
    gaiaProfile,
    profileVersion: GAIA_PROFILE_VERSION,
    engineVersion: GAIA_ENGINE_VERSION,
    migrationVersion: GAIA_MIGRATION_VERSION,
    appVersion: buildInfo.versionName,
    versionName: buildInfo.versionName,
    versionCode: buildInfo.versionCode,
    buildNumber: buildInfo.buildNumber,
    gaiaGeneratedAt: gaiaProfile.generatedAt,
  };

  await userRepository.upsertUserProfile(profile.uid, payload);
  const migrated = { ...profile, ...payload } as UserProfile;
  invalidateLegacyGaiaCaches(profile.uid);
  await storageProvider.saveUserProfile(migrated as unknown as Parameters<typeof storageProvider.saveUserProfile>[0]);
  await storageProvider.saveUserBlueprint(blueprint as unknown as Parameters<typeof storageProvider.saveUserBlueprint>[0]);
  console.info("[GAIA MIGRATION COMPLETE]", { uid: profile.uid, profileVersion: migrated.profileVersion, migrationVersion: migrated.migrationVersion });
  return migrated;
}
