import { blueprintRepository } from "@/lib/repositories/blueprintRepository";
import { userRepository } from "@/lib/repositories/userRepository";
import { generateBlueprint } from "@/lib/engines/generateBlueprint";
import type { Blueprint } from "@/lib/types/blueprint";
import type { UserProfile } from "@/lib/types/user";

/**
 * BUILD 31: Robust check for profile changes.
 * Returns true if the blueprint matches the current profile inputs.
 */
export function isBlueprintForProfile(profile: UserProfile, blueprint: Blueprint): boolean {
  if (!blueprint.input) return false;

  return (
    blueprint.input.birthDate === profile.birthDate &&
    blueprint.input.birthTime === (profile.birthTime || "12:00") &&
    blueprint.input.birthCity === (profile.birthCity || profile.birthPlace || "") &&
    blueprint.input.timezone === profile.timezone &&
    blueprint.input.latitude === profile.latitude &&
    blueprint.input.longitude === profile.longitude
  );
}

export async function generateBlueprintFromProfile(profile: UserProfile): Promise<Blueprint> {
  const uid = profile.uid;
  console.log(`[BLUEPRINT ORCHESTRATOR] Generating for ${uid}`);

  await userRepository.updateBlueprintStatus(uid, "generating");
  await blueprintRepository.updateBlueprintStatus(uid, "generating");

  try {
    const blueprint = await generateBlueprint({
      uid,
      fullName: profile.fullName || profile.displayName || "",
      birthDate: profile.birthDate || profile.profile.blueprintInput?.birthDate || "",
      birthTime: profile.birthTime || profile.profile.blueprintInput?.birthTime || "12:00",
      birthCity: profile.birthCity || profile.birthPlace || profile.profile.blueprintInput?.birthCity || "",
      birthCountry: profile.birthCountry ?? null,
      latitude: profile.latitude ?? null,
      longitude: profile.longitude ?? null,
      timezone: profile.timezone ?? null,
      email: profile.email
    } as any);

    await blueprintRepository.saveUserBlueprint(uid, blueprint);
    await userRepository.updateBlueprintStatus(uid, "ready");

    console.log(`[BLUEPRINT ORCHESTRATOR] Success for ${uid}`);
    return blueprint;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Blueprint generation failed.";
    console.error(`[BLUEPRINT ORCHESTRATOR] Error for ${uid}:`, message);
    await userRepository.updateBlueprintStatus(uid, "error").catch(() => undefined);
    await blueprintRepository.updateBlueprintStatus(uid, "error", message).catch(() => undefined);
    throw error;
  }
}

export async function ensureBlueprintStatus(profile: UserProfile): Promise<Blueprint | null> {
  const uid = profile.uid;
  const blueprint = await blueprintRepository.getUserBlueprint(uid);

  if (!blueprint) {
    console.log(`[BLUEPRINT ORCHESTRATOR] ${uid}: No blueprint found.`);
    await userRepository.updateBlueprintStatus(uid, "missing").catch(() => undefined);
    return null;
  }

  // BUILD 31: Only mark stale if inputs actually changed.
  if (blueprint.status === "ready" && !isBlueprintForProfile(profile, blueprint)) {
    console.log(`[BLUEPRINT ORCHESTRATOR] ${uid}: Inputs changed, marking stale.`);
    await userRepository.updateBlueprintStatus(uid, "stale").catch(() => undefined);
    await blueprintRepository.markBlueprintStale(uid).catch(() => undefined);
    return { ...blueprint, status: "stale" };
  }

  return blueprint;
}
