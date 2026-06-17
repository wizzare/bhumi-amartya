type UnknownRecord = Record<string, unknown> | null | undefined;

export function isSetupProfileComplete(profile: UnknownRecord): boolean {
  if (!profile) return false;
  const birthDate = typeof profile.birthDate === "string" ? profile.birthDate.trim() : "";
  const birthTime = typeof profile.birthTime === "string" ? profile.birthTime.trim() : "";
  const birthCity = typeof profile.birthCity === "string" ? profile.birthCity.trim() : "";
  const birthPlace = typeof profile.birthPlace === "string" ? profile.birthPlace.trim() : "";
  const cityOfBirth = typeof profile.cityOfBirth === "string" ? profile.cityOfBirth.trim() : "";
  const setupCompleted = profile.setupCompleted === true;
  return setupCompleted && Boolean(birthDate) && Boolean(birthTime) && Boolean(birthPlace || cityOfBirth || birthCity);
}

export function isBlueprintComplete(blueprint: UnknownRecord): boolean {
  if (!blueprint) return false;
  const lifePath = blueprint.lifePath as UnknownRecord;
  const hasLifePath =
    typeof lifePath?.number === "number" ||
    typeof lifePath?.number === "string" ||
    typeof blueprint.lifePath === "number" ||
    typeof blueprint.lifePath === "string";

  const destinyMatrix = blueprint.destinyMatrix as UnknownRecord;
  const arcanaCenter =
    (destinyMatrix?.arcanaCenter as UnknownRecord) ??
    destinyMatrix?.center ??
    blueprint.arcanaCenter;
  const hasArcanaCenter =
    typeof arcanaCenter === "number" ||
    (typeof arcanaCenter === "string" && arcanaCenter.trim().length > 0) ||
    Boolean((arcanaCenter as UnknownRecord)?.number);

  const astrology = blueprint.astrology as UnknownRecord;
  const sunSign = astrology?.sunSign ?? blueprint.sunSign;
  const hasSunSign = typeof sunSign === "string" && sunSign.trim().length > 0;

  // HD may legitimately remain pending until a verified Gaia engine result exists.
  return hasLifePath && hasArcanaCenter && hasSunSign;
}
