export type AppEdition = "standard" | "ENL";

export function getAppEdition(): AppEdition {
  return "standard";
}

export function isEnlEdition(): boolean {
  return false;
}
