export type ProfileReadiness =
  | { status: "loading" }
  | { status: "ready"; hasBirthDate: true; hasBirthPlace: true; hasBirthTime: true }
  | { status: "limited"; hasBirthDate: true; hasBirthPlace: true; hasBirthTime: false }
  | { status: "incomplete"; missingFields: string[] }
  | { status: "error"; reason: string };

type ProfileLike = Record<string, unknown> | null | undefined;

function firstString(profile: ProfileLike, keys: string[]): string | null {
  for (const key of keys) {
    const value = profile?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export function classifyProfileReadiness(profile: ProfileLike, loaded = true): ProfileReadiness {
  if (!loaded) return { status: "loading" };
  if (!profile) return { status: "incomplete", missingFields: ["profile"] };
  const birthDate = firstString(profile, ["birthDate", "dateOfBirth", "birth_date", "dob"])
    ?? firstString(profile.profile as ProfileLike, ["birthDate", "dateOfBirth", "birth_date", "dob"]);
  const birthPlace = firstString(profile, ["birthPlace", "birthCity", "placeOfBirth", "cityOfBirth", "birth_city"])
    ?? firstString(profile.profile as ProfileLike, ["birthPlace", "birthCity", "placeOfBirth", "cityOfBirth"]);
  const hasCoordinates = ["latitude", "longitude"].every((key) => typeof profile[key] === "number")
    || (typeof profile.lat === "number" && typeof profile.lng === "number");
  const birthTime = firstString(profile, ["birthTime", "timeOfBirth", "birth_time"])
    ?? firstString(profile.profile as ProfileLike, ["birthTime", "timeOfBirth", "birth_time"]);
  const missingFields: string[] = [];
  if (!birthDate) missingFields.push("birthDate");
  if (!birthPlace && !hasCoordinates) missingFields.push("birthPlace");
  if (missingFields.length) return { status: "incomplete", missingFields };
  if (!birthTime) return { status: "limited", hasBirthDate: true, hasBirthPlace: true, hasBirthTime: false };
  return { status: "ready", hasBirthDate: true, hasBirthPlace: true, hasBirthTime: true };
}
